export type CacheConfig = { cacheBytes: number; blockBytes: number; associativity: number; addressBits?: number };
export type AddressFields = { address: number; blockNumber: number; byteOffset: number; setIndex: number; tag: number; offsetBits: number; indexBits: number; tagBits: number };
export type CacheAccess = AddressFields & { hit: boolean; evictedTag: number | null };
function isPowerOfTwo(n: number) { return Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0; }
export function validateCacheConfig(c: CacheConfig) {
 const bits=c.addressBits??16;
 if(!isPowerOfTwo(c.cacheBytes)||!isPowerOfTwo(c.blockBytes)||!isPowerOfTwo(c.associativity)) throw new RangeError("Cache size, block size, and associativity must be powers of two");
 if(c.blockBytes>c.cacheBytes||c.cacheBytes%c.blockBytes!==0) throw new RangeError("Block size must not exceed cache size and must divide it");
 const lines=c.cacheBytes/c.blockBytes;
 if(lines%c.associativity!==0) throw new RangeError("Cache lines must divide evenly among sets");
 if(!Number.isInteger(bits)||bits<1||bits>30) throw new RangeError("Address width must be 1–30 bits in this teaching model");
 const sets=lines/c.associativity;
 if(!isPowerOfTwo(sets)) throw new RangeError("Number of sets must be a power of two");
 return {lines,sets,offsetBits:Math.log2(c.blockBytes),indexBits:Math.log2(sets),tagBits:bits-Math.log2(sets)-Math.log2(c.blockBytes)};
}
export function decodeCacheAddress(address:number,c:CacheConfig):AddressFields {
 const cfg=validateCacheConfig(c), bits=c.addressBits??16;
 if(!Number.isInteger(address)||address<0||address>=2**bits) throw new RangeError("Address is outside the configured address width");
 const blockNumber=Math.floor(address/c.blockBytes);
 const setIndex=blockNumber%cfg.sets;
 const tag=Math.floor(blockNumber/cfg.sets);
 return {address,blockNumber,byteOffset:address%c.blockBytes,setIndex,tag,offsetBits:cfg.offsetBits,indexBits:cfg.indexBits,tagBits:cfg.tagBits};
}
export function simulateCacheTrace(addresses:number[],c:CacheConfig):CacheAccess[] {
 const cfg=validateCacheConfig(c);
 const sets=Array.from({length:cfg.sets},()=>[] as number[]);
 return addresses.map(address=>{
  const f=decodeCacheAddress(address,c);
  const set=sets[f.setIndex]!;
  const at=set.indexOf(f.tag);
  if(at>=0){set.splice(at,1);set.unshift(f.tag);return {...f,hit:true,evictedTag:null};}
  const evictedTag=set.length>=c.associativity?set.pop()!:null;
  set.unshift(f.tag);
  return {...f,hit:false,evictedTag};
 });
}
export function averageMemoryAccessTime(hitTime:number,missRate:number,missPenalty:number) {
 if(!Number.isFinite(hitTime)||hitTime<=0) throw new RangeError("Hit time must be positive");
 if(!Number.isFinite(missRate)||missRate<0||missRate>1) throw new RangeError("Miss rate must be between 0 and 1");
 if(!Number.isFinite(missPenalty)||missPenalty<0) throw new RangeError("Miss penalty must be non-negative");
 return hitTime+missRate*missPenalty;
}
