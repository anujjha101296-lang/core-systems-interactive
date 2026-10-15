import { useMemo, useState } from "react";
import { averageMemoryAccessTime, simulateCacheTrace, validateCacheConfig } from "@/lib/architecture-cache";

const parseAddresses = (raw:string) => raw.split(/[ ,;]+/).filter(Boolean).map(token=>{
 const value=token.toLowerCase().startsWith("0x")?Number.parseInt(token.slice(2),16):Number(token);
 if(!Number.isInteger(value)||value<0) throw new RangeError("Addresses must be non-negative integers or hexadecimal values like 0x1234");
 return value;
});
export function ArchitectureCacheLab() {
 const [cacheBytes,setCacheBytes]=useState(256);
 const [blockBytes,setBlockBytes]=useState(16);
 const [associativity,setAssociativity]=useState(1);
 const [raw,setRaw]=useState("0x0000, 0x0010, 0x0000, 0x0040, 0x0080, 0x0010, 0x0004, 0x0000");
 const [hitTime,setHitTime]=useState(2);
 const [missPenalty,setMissPenalty]=useState(40);
 const [missRate,setMissRate]=useState(5);
 const result=useMemo(()=>{
  try {
   const addresses=parseAddresses(raw);
   const config={cacheBytes,blockBytes,associativity,addressBits:16};
   const geometry=validateCacheConfig(config);
   const accesses=simulateCacheTrace(addresses,config);
   const hits=accesses.filter(a=>a.hit).length;
   const rate=accesses.length?1-hits/accesses.length:0;
   return {error:"",geometry,accesses,hits,misses:accesses.length-hits,rate};
  } catch(e) {return {error:e instanceof Error?e.message:"Invalid cache configuration",geometry:null,accesses:[],hits:0,misses:0,rate:0};}
 },[raw,cacheBytes,blockBytes,associativity]);
 const amat=useMemo(()=>averageMemoryAccessTime(hitTime,missRate/100,missPenalty),[hitTime,missRate,missPenalty]);
 const field="field mt-1 w-full";
 return <div className="panel p-5 space-y-5">
  <div className="eyebrow">Interactive lab · cache mapping</div>
  <div className="grid gap-5 md:grid-cols-[240px_1fr]">
   <div className="space-y-4">
    <label className="block text-sm"><span className="eyebrow">Cache capacity</span><select className={field} value={cacheBytes} onChange={e=>setCacheBytes(Number(e.target.value))}>{[64,128,256,512,1024,2048,4096].map(n=><option key={n} value={n}>{n} bytes</option>)}</select></label>
    <label className="block text-sm"><span className="eyebrow">Block size</span><select className={field} value={blockBytes} onChange={e=>setBlockBytes(Number(e.target.value))}>{[4,8,16,32,64,128].map(n=><option key={n} value={n}>{n} bytes</option>)}</select></label>
    <label className="block text-sm"><span className="eyebrow">Associativity</span><select className={field} value={associativity} onChange={e=>setAssociativity(Number(e.target.value))}>{[1,2,4,8].map(n=><option key={n} value={n}>{n===1?"Direct-mapped":n+"-way"}</option>)}</select></label>
    <label className="block text-sm"><span className="eyebrow">Address trace (decimal or 0x hex)</span><textarea className={field+" min-h-24"} value={raw} onChange={e=>setRaw(e.target.value)} /></label>
    <button className="btn btn-ghost" onClick={()=>{setCacheBytes(256);setBlockBytes(16);setAssociativity(1);setRaw("0x0000, 0x0010, 0x0000, 0x0040, 0x0080, 0x0010, 0x0004, 0x0000");}}>Reset trace</button>
   </div>
   <div className="min-w-0 space-y-4">
    {result.error?<p className="font-mono text-sm text-destructive">{result.error}</p>:<>
     <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rule-t pt-2"><div className="eyebrow">Lines</div><div className="font-mono text-lg">{result.geometry?.lines}</div></div>
      <div className="rule-t pt-2"><div className="eyebrow">Sets</div><div className="font-mono text-lg">{result.geometry?.sets}</div></div>
      <div className="rule-t pt-2"><div className="eyebrow">Hits</div><div className="font-mono text-lg">{result.hits}</div></div>
      <div className="rule-t pt-2"><div className="eyebrow">Misses</div><div className="font-mono text-lg">{result.misses}</div></div>
     </div>
     <div className="overflow-x-auto"><table className="w-full text-left font-mono text-xs"><thead><tr className="border-b border-rule"><th className="p-2">Address</th><th className="p-2">Tag</th><th className="p-2">Set</th><th className="p-2">Offset</th><th className="p-2">Result</th><th className="p-2">Evicted tag</th></tr></thead>
      <tbody>{result.accesses.map((a,i)=><tr key={i} className="border-b border-rule"><td className="p-2">{ "0x"+a.address.toString(16).padStart(4,"0") }</td><td className="p-2">{a.tag}</td><td className="p-2">{a.setIndex}</td><td className="p-2">{a.byteOffset}</td><td className={a.hit?"p-2 text-success":"p-2 text-destructive"}>{a.hit?"HIT":"MISS"}</td><td className="p-2">{a.evictedTag===null?"—":a.evictedTag}</td></tr>)}</tbody></table></div>
     <p className="text-xs text-muted-foreground">The trace uses a cold cache and LRU replacement within each set. Addresses are byte addresses; the model assumes a 16-bit address space.</p>
    </>}
   </div>
  </div>
  <div className="border-t border-rule pt-5 space-y-3">
   <div className="eyebrow">AMAT calculator</div>
   <div className="grid gap-4 md:grid-cols-3">
    <label className="block text-sm"><span className="flex justify-between"><span className="eyebrow">Hit time</span><span className="font-mono">{hitTime} ns</span></span><input type="range" min={1} max={10} step={1} value={hitTime} onChange={e=>setHitTime(Number(e.target.value))} className="w-full"/></label>
    <label className="block text-sm"><span className="flex justify-between"><span className="eyebrow">Miss rate</span><span className="font-mono">{missRate}%</span></span><input type="range" min={0} max={100} step={1} value={missRate} onChange={e=>setMissRate(Number(e.target.value))} className="w-full"/></label>
    <label className="block text-sm"><span className="flex justify-between"><span className="eyebrow">Miss penalty</span><span className="font-mono">{missPenalty} ns</span></span><input type="range" min={0} max={200} step={5} value={missPenalty} onChange={e=>setMissPenalty(Number(e.target.value))} className="w-full"/></label>
   </div>
   <div className="rule-t pt-2"><div className="eyebrow">Average memory access time</div><div className="font-mono text-2xl">{amat.toFixed(2)} ns</div><p className="text-xs text-muted-foreground">AMAT = hit time + miss rate × miss penalty. Use the trace miss rate above as a reference when setting this independent parameter.</p></div>
  </div>
 </div>;
}
