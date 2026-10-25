import { useMemo, useState } from "react";
import { simulateCachePolicies, type ReplacementPolicy, type WritePolicy, type WriteMissPolicy } from "@/lib/architecture-cache-policies";

export function ArchitectureCachePoliciesLab() {
 const [capacity,setCapacity]=useState(256); const [block,setBlock]=useState(16); const [ways,setWays]=useState(2);
 const [replacement,setReplacement]=useState<ReplacementPolicy>("LRU"); const [write,setWrite]=useState<WritePolicy>("write-back"); const [writeMiss,setWriteMiss]=useState<WriteMissPolicy>("write-allocate");
 const [trace,setTrace]=useState("W 0x0000\nR 0x0040\nR 0x0000\nW 0x0080\nR 0x0040\nR 0x0000\nW 0x0004");
 const parsed=useMemo(()=>{try{
  const items=trace.split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean).map(row=>{
   const m=row.match(/^(R|W)\s+(0x[0-9a-f]+|\d+)$/i);
   if(!m)throw new RangeError("Use one R or W operation and a decimal or hexadecimal address per line");
   const raw=m[2]!;
   const address=raw.toLowerCase().startsWith("0x")?parseInt(raw.slice(2),16):Number(raw);
   if(!Number.isInteger(address)||address<0||address>0xffff)throw new RangeError("Address must be between 0 and 65535");
   return {op:m[1]!.toUpperCase() as "R"|"W",address};
  });
  return {items,error:""};
 }catch(e){return {items:[],error:e instanceof Error?e.message:"Invalid trace"};}},[trace]);
 const result=useMemo(()=>{if(parsed.error)return {data:null,error:parsed.error};try{return {data:simulateCachePolicies({capacityBytes:capacity,blockBytes:block,ways,replacement,write,writeMiss},parsed.items),error:""};}catch(e){return {data:null,error:e instanceof Error?e.message:"Invalid configuration"};}},[capacity,block,ways,replacement,write,writeMiss,parsed]);
 const button=(label:string,active:boolean,onClick:()=>void)=><button type="button" className={active?"btn btn-primary":"btn btn-ghost"} onClick={onClick}>{label}</button>;
 return <div className="panel p-5 space-y-5">
  <div><p className="eyebrow">Interactive lab · cache policy trade-offs</p><p className="mt-2 text-sm text-muted-foreground">Keep the address trace fixed while changing associativity, replacement, and write policy. The model is a small, cold, write-back/write-through teaching cache with 16-bit byte addresses.</p></div>
  <div className="grid gap-5 md:grid-cols-2">
   <div className="space-y-4"><p className="eyebrow">Geometry</p>
    <label className="block text-sm">Capacity<select className="field mt-1 w-full" value={capacity} onChange={e=>setCapacity(Number(e.target.value))}>{[64,128,256,512,1024].map(n=><option key={n} value={n}>{n} bytes</option>)}</select></label>
    <label className="block text-sm">Block size<select className="field mt-1 w-full" value={block} onChange={e=>setBlock(Number(e.target.value))}>{[4,8,16,32,64].map(n=><option key={n} value={n}>{n} bytes</option>)}</select></label>
    <label className="block text-sm">Associativity<select className="field mt-1 w-full" value={ways} onChange={e=>setWays(Number(e.target.value))}>{[1,2,4,8].map(n=><option key={n} value={n}>{n===1?"Direct mapped":n+"-way"}</option>)}</select></label>
    <p className="text-xs text-muted-foreground">Invalid combinations are reported instead of silently adjusted.</p>
   </div>
   <div className="space-y-4"><p className="eyebrow">Policies</p>
    <div><p className="mb-2 text-sm">Replacement</p><div className="flex flex-wrap gap-2">{button("LRU",replacement==="LRU",()=>setReplacement("LRU"))}{button("FIFO",replacement==="FIFO",()=>setReplacement("FIFO"))}</div></div>
    <div><p className="mb-2 text-sm">Write policy</p><div className="flex flex-wrap gap-2">{button("Write-back",write==="write-back",()=>setWrite("write-back"))}{button("Write-through",write==="write-through",()=>setWrite("write-through"))}</div></div>
    <div><p className="mb-2 text-sm">Write miss</p><div className="flex flex-wrap gap-2">{button("Write-allocate",writeMiss==="write-allocate",()=>setWriteMiss("write-allocate"))}{button("No-write-allocate",writeMiss==="no-write-allocate",()=>setWriteMiss("no-write-allocate"))}</div></div>
   </div>
  </div>
  <label className="block text-sm">Access trace <textarea className="field mt-2 min-h-36 w-full font-mono text-xs" value={trace} onChange={e=>setTrace(e.target.value)}/></label>
  <div className="flex flex-wrap gap-2">{button("Conflict-miss example",false,()=>setTrace("R 0x0000\nR 0x0040\nR 0x0080\nR 0x0000\nR 0x0040\nR 0x0080"))}{button("Write-back example",false,()=>setTrace("W 0x0000\nW 0x0040\nR 0x0080\nR 0x00C0\nR 0x0000"))}</div>
  {result.error?<p className="text-sm text-destructive">{result.error}</p>:result.data&&<div className="space-y-4">
   <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">{[["Hits",result.data.hits],["Misses",result.data.misses],["Evictions",result.data.evictions],["Dirty writebacks",result.data.dirtyWritebacks],["Memory writes",result.data.memoryWrites]].map(([k,v])=><div key={String(k)} className="rule-b p-3"><p className="eyebrow">{k}</p><p className="font-mono text-xl">{v}</p></div>)}</div>
   <p className="font-mono text-sm">Hit rate: {(result.data.hitRate*100).toFixed(1)}% · {result.data.sets} sets · {result.data.lines} lines</p>
   <div className="overflow-x-auto"><table className="w-full text-left font-mono text-xs"><thead><tr className="rule-b"><th className="p-2">#</th><th className="p-2">Op/address</th><th className="p-2">Set</th><th className="p-2">Tag</th><th className="p-2">Result</th><th className="p-2">Eviction</th><th className="p-2">Memory action</th></tr></thead><tbody>{result.data.accesses.map((a,i)=><tr key={i} className="rule-b"><td className="p-2">{i+1}</td><td className="p-2">{a.op} 0x{a.address.toString(16).toUpperCase().padStart(4,"0")}</td><td className="p-2">{a.set}</td><td className="p-2">0x{a.tag.toString(16).toUpperCase()}</td><td className={a.hit?"p-2 text-success":"p-2 text-warn"}>{a.hit?"HIT":"MISS"}</td><td className="p-2">{a.evictedTag===null?"—":"tag "+a.evictedTag+(a.dirtyWriteback?" · dirty writeback":"")}</td><td className="p-2">{a.memoryWrite?"write-through":a.dirty?"dirty in cache":"—"}</td></tr>)}</tbody></table></div>
  </div>}
  <p className="text-xs text-muted-foreground">Simplifications: cold cache, no prefetching, non-blocking misses, coherence, write buffers, dirty-line flush at program end, or multi-level hierarchy. Write-through writes every store to memory; write-back marks modified lines dirty and writes them back on eviction. This model is for comparing policy mechanics, not predicting real hardware performance.</p>
 </div>;
}
