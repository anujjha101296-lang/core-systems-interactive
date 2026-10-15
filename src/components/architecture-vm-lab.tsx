import { useMemo, useState } from "react";
import { simulateTranslations, validateVirtualMemoryConfig } from "@/lib/architecture-vm";

function parseMappings(raw:string):Record<number,number> {
 const out:Record<number,number>={};
 for(const token of raw.split(/[;,\n]+/).map(s=>s.trim()).filter(Boolean)) {
  const match=/^(\d+)\s*:\s*(\d+)$/.exec(token);
  if(!match) throw new RangeError("Mappings must look like virtual-page:physical-page, for example 0:3, 1:1");
  const v=Number(match[1]),p=Number(match[2]);
  if(out[v]!==undefined) throw new RangeError("Each virtual page may appear only once in the page table");
  out[v]=p;
 }
 return out;
}
function parseTrace(raw:string) {
 return raw.split(/[ ,;\n]+/).filter(Boolean).map(token=>{
  const n=token.toLowerCase().startsWith("0x")?Number.parseInt(token.slice(2),16):Number(token);
  if(!Number.isInteger(n)||n<0) throw new RangeError("Use non-negative decimal or hexadecimal virtual addresses");
  return n;
 });
}
export function ArchitectureVmLab() {
 const [pageBytes,setPageBytes]=useState(256);
 const [tlbEntries,setTlbEntries]=useState(2);
 const [mappings,setMappings]=useState("0:3, 1:1, 2:5, 3:2, 4:7");
 const [trace,setTrace]=useState("0x0004, 0x0010, 0x0104, 0x0008, 0x0204, 0x0004, 0x0408, 0x0301");
 const result=useMemo(()=>{
  try {
   const config={pageBytes,tlbEntries,addressBits:16,pageTable:parseMappings(mappings)};
   validateVirtualMemoryConfig(config);
   const addresses=parseTrace(trace);
   if(addresses.length>100) throw new RangeError("Keep each trace to 100 addresses or fewer");
   return {error:"",rows:simulateTranslations(addresses,config)};
  } catch(e) { return {error:e instanceof Error?e.message:"Invalid configuration",rows:[]}; }
 },[pageBytes,tlbEntries,mappings,trace]);
 const hits=result.rows.filter(r=>r.tlbHit).length;
 const faults=result.rows.filter(r=>r.pageFault).length;
 const field="field mt-1 w-full";
 return <div className="panel p-5 space-y-5">
  <div className="eyebrow">Interactive lab · virtual address translation</div>
  <div className="grid gap-5 md:grid-cols-[260px_1fr]">
   <div className="space-y-4">
    <label className="block text-sm"><span className="eyebrow">Page size</span><select className={field} value={pageBytes} onChange={e=>setPageBytes(Number(e.target.value))}>{[64,128,256,512,1024,2048,4096].map(n=><option key={n} value={n}>{n} bytes</option>)}</select></label>
    <label className="block text-sm"><span className="eyebrow">TLB capacity</span><select className={field} value={tlbEntries} onChange={e=>setTlbEntries(Number(e.target.value))}>{[1,2,4,8].map(n=><option key={n} value={n}>{n} entries</option>)}</select></label>
    <label className="block text-sm"><span className="eyebrow">Page table (VPN:PPN)</span><textarea className={field+" min-h-24"} value={mappings} onChange={e=>setMappings(e.target.value)}/></label>
    <label className="block text-sm"><span className="eyebrow">Virtual-address trace</span><textarea className={field+" min-h-24"} value={trace} onChange={e=>setTrace(e.target.value)}/></label>
    <button className="btn btn-ghost" onClick={()=>{setPageBytes(256);setTlbEntries(2);setMappings("0:3, 1:1, 2:5, 3:2, 4:7");setTrace("0x0004, 0x0010, 0x0104, 0x0008, 0x0204, 0x0004, 0x0408, 0x0301");}}>Reset example</button>
   </div>
   <div className="min-w-0 space-y-4">
    {result.error?<p className="font-mono text-sm text-destructive">{result.error}</p>:<>
     <div className="grid grid-cols-3 gap-4"><div className="rule-t pt-2"><div className="eyebrow">TLB hits</div><div className="font-mono text-lg">{hits}</div></div><div className="rule-t pt-2"><div className="eyebrow">TLB misses</div><div className="font-mono text-lg">{result.rows.length-hits-faults}</div></div><div className="rule-t pt-2"><div className="eyebrow">Page faults</div><div className="font-mono text-lg">{faults}</div></div></div>
     <div className="overflow-x-auto"><table className="w-full text-left font-mono text-xs"><thead><tr className="border-b border-rule"><th className="p-2">VA</th><th className="p-2">VPN</th><th className="p-2">Offset</th><th className="p-2">PPN</th><th className="p-2">PA</th><th className="p-2">Outcome</th></tr></thead><tbody>{result.rows.map((r,i)=><tr key={i} className="border-b border-rule"><td className="p-2">0x{r.virtualAddress.toString(16).padStart(4,"0")}</td><td className="p-2">{r.virtualPage}</td><td className="p-2">{r.offset}</td><td className="p-2">{r.physicalPage??"—"}</td><td className="p-2">{r.physicalAddress===null?"—":"0x"+r.physicalAddress.toString(16).padStart(4,"0")}</td><td className={r.pageFault?"p-2 text-destructive":r.tlbHit?"p-2 text-success":"p-2 text-primary"}>{r.pageFault?"PAGE FAULT":r.tlbHit?"TLB HIT":"TLB MISS"}</td></tr>)}</tbody></table></div>
     <p className="text-xs text-muted-foreground">Teaching model: 16-bit virtual addresses, one-level page table, fully associative LRU TLB, no page replacement or hardware page-table walk timing. A TLB miss is not necessarily a page fault.</p>
    </>}
   </div>
  </div>
 </div>;
}
