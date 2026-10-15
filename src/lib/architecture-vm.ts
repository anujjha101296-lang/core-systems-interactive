export type VirtualMemoryConfig = { pageBytes: number; tlbEntries: number; addressBits?: number; pageTable: Record<number, number> };
export type Translation = { virtualAddress: number; virtualPage: number; offset: number; physicalPage: number | null; physicalAddress: number | null; tlbHit: boolean; pageFault: boolean };

const powerOfTwo=(n:number)=>Number.isInteger(n)&&n>0&&(n&(n-1))===0;
export function validateVirtualMemoryConfig(c:VirtualMemoryConfig) {
 const bits=c.addressBits??16;
 if(!powerOfTwo(c.pageBytes)) throw new RangeError("Page size must be a positive power of two");
 if(!Number.isInteger(c.tlbEntries)||c.tlbEntries<1||c.tlbEntries>256) throw new RangeError("TLB entries must be between 1 and 256");
 if(!Number.isInteger(bits)||bits<2||bits>30||c.pageBytes>2**bits) throw new RangeError("Address width must be 2–30 bits and large enough for the page size");
 for(const [v,p] of Object.entries(c.pageTable)) {
  if(!/^\d+$/.test(v)||!Number.isInteger(Number(p))||Number(p)<0||Number(v)>=2**bits/c.pageBytes||Number(p)>=2**bits/c.pageBytes) throw new RangeError("Page-table mappings must use valid non-negative virtual and physical page numbers");
 }
 return {addressBits:bits,offsetBits:Math.log2(c.pageBytes),pageCount:2**bits/c.pageBytes};
}
export function translateAddress(address:number,c:VirtualMemoryConfig,tlb:Map<number,number>) {
 const cfg=validateVirtualMemoryConfig(c);
 if(!Number.isInteger(address)||address<0||address>=2**cfg.addressBits) throw new RangeError("Virtual address is outside the configured address width");
 const virtualPage=Math.floor(address/c.pageBytes), offset=address%c.pageBytes;
 let physicalPage=tlb.get(virtualPage),tlbHit=physicalPage!==undefined;
 if(tlbHit) { tlb.delete(virtualPage); tlb.set(virtualPage,physicalPage!); }
 else {
  const mapped=c.pageTable[virtualPage];
  if(mapped===undefined) return {virtualAddress:address,virtualPage,offset,physicalPage:null,physicalAddress:null,tlbHit:false,pageFault:true};
  physicalPage=mapped;
  tlb.set(virtualPage,physicalPage);
  while(tlb.size>c.tlbEntries) tlb.delete(tlb.keys().next().value!);
 }
 return {virtualAddress:address,virtualPage,offset,physicalPage:physicalPage!,physicalAddress:physicalPage!*c.pageBytes+offset,tlbHit,pageFault:false};
}
export function simulateTranslations(addresses:number[],c:VirtualMemoryConfig) {
 validateVirtualMemoryConfig(c);
 const tlb=new Map<number,number>();
 return addresses.map(address=>translateAddress(address,c,tlb));
}
