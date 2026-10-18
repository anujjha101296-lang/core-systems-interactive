import { useMemo, useState } from "react";
import { simulateDramTrace, validateDramConfig } from "@/lib/architecture-dram";

function parseAddresses(raw:string){return raw.split(/[\s,;]+/).filter(Boolean).map(token=>{const n=token.toLowerCase().startsWith("0x")?Number.parseInt(token.slice(2),16):Number(token);if(!Number.isInteger(n)||n<0||n>0xffffffff)throw new RangeError("Use non-negative decimal or 0x hexadecimal byte addresses");return n;});}
export function ArchitectureDramLab(){
 const [banks,setBanks]=useState(4);const [rowBytes,setRowBytes]=useState(1024);
 const [tCL,setTCL]=useState(12);const [tRCD,setTRCD]=useState(12);const [tRP,setTRP]=useState(12);
 const [raw,setRaw]=useState("0x0000, 0x0004, 0x0010, 0x1000, 0x0008, 0x2000, 0x1004, 0x0000");
 const result=useMemo(()=>{try{const addresses=parseAddresses(raw);const config={banks,rowBytes,tCL,tRCD,tRP};validateDramConfig(config);return {report:simulateDramTrace(addresses,config),error:""};}catch(e){return {report:null,error:e instanceof Error?e.message:"Invalid DRAM configuration"};}},[banks,rowBytes,tCL,tRCD,tRP,raw]);
 const field="field mt-1 w-full";
 const timingLabel=(kind:string)=>kind==="row-hit"?"ROW HIT":kind==="closed-row"?"ROW CLOSED":"ROW CONFLICT";
 return <div className="panel p-5 space-y-5">
  <div><p className="eyebrow">Interactive lab · DRAM row buffers</p><p className="mt-2 text-sm text-muted-foreground">Change the address trace and timing assumptions to see when an access reuses an open row, activates a closed bank, or must precharge a conflicting row first.</p></div>
  <div className="grid gap-4 md:grid-cols-2">
   <label className="block text-sm"><span className="eyebrow">Banks</span><select className={field} value={banks} onChange={e=>setBanks(Number(e.target.value))}>{[1,2,4,8,16].map(n=><option key={n} value={n}>{n} bank{n>1?"s":""}</option>)}</select></label>
   <label className="block text-sm"><span className="eyebrow">Row size</span><select className={field} value={rowBytes} onChange={e=>setRowBytes(Number(e.target.value))}>{[256,512,1024,2048,4096,8192].map(n=><option key={n} value={n}>{n} bytes</option>)}</select></label>
   <label className="block text-sm"><span className="eyebrow">tCL · column access</span><input className={field} type="number" min={1} max={1000} value={tCL} onChange={e=>setTCL(Number(e.target.value))}/></label>
   <label className="block text-sm"><span className="eyebrow">tRCD · row activation</span><input className={field} type="number" min={1} max={1000} value={tRCD} onChange={e=>setTRCD(Number(e.target.value))}/></label>
   <label className="block text-sm"><span className="eyebrow">tRP · precharge</span><input className={field} type="number" min={1} max={1000} value={tRP} onChange={e=>setTRP(Number(e.target.value))}/></label>
   <label className="block text-sm md:col-span-2"><span className="eyebrow">Byte-address trace (decimal or 0x hex)</span><textarea className={field+" min-h-24 font-mono"} value={raw} onChange={e=>setRaw(e.target.value)}/></label>
  </div>
  <div className="flex flex-wrap gap-2"><button className="btn btn-ghost" onClick={()=>setRaw("0x0000, 0x0004, 0x0010, 0x0008, 0x0000")}>Same-row locality</button><button className="btn btn-ghost" onClick={()=>setRaw("0x0000, 0x1000, 0x0004, 0x1004, 0x0008")}>Alternate rows</button><button className="btn btn-ghost" onClick={()=>{setBanks(4);setRowBytes(1024);setTCL(12);setTRCD(12);setTRP(12);setRaw("0x0000, 0x0004, 0x0010, 0x1000, 0x0008, 0x2000, 0x1004, 0x0000");}}>Reset</button></div>
  {result.error?<p className="font-mono text-sm text-destructive">{result.error}</p>:result.report&&<>
   <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Total cycles",result.report.totalCycles],["Average/access",result.report.averageCycles.toFixed(1)],["Row hits",result.report.rowHits],["Row conflicts",result.report.rowConflicts]].map(([k,v])=><div key={String(k)} className="rule-t pt-2"><p className="eyebrow">{k}</p><p className="font-mono text-xl">{v}</p></div>)}</div>
   <div className="overflow-x-auto"><table className="w-full text-left font-mono text-xs"><thead><tr className="border-b border-rule"><th className="p-2">#</th><th className="p-2">Address</th><th className="p-2">Bank</th><th className="p-2">Row</th><th className="p-2">Access type</th><th className="p-2">Latency</th><th className="p-2">Completion</th></tr></thead><tbody>{result.report.accesses.map((a,i)=><tr key={i} className="border-b border-rule"><td className="p-2">{i+1}</td><td className="p-2">0x{a.address.toString(16).padStart(4,"0")}</td><td className="p-2">{a.bank}</td><td className="p-2">{a.row}</td><td className={`p-2 ${a.kind==="row-hit"?"text-success":a.kind==="row-conflict"?"text-destructive":"text-primary"}`}>{timingLabel(a.kind)}</td><td className="p-2">{a.latency}</td><td className="p-2">{a.completeCycle}</td></tr>)}</tbody></table></div>
   <p className="text-xs text-muted-foreground">Timing units are abstract cycles. This teaching model serializes requests and assumes a row-hit costs tCL, a closed-row access costs tRCD+tCL, and a row conflict costs tRP+tRCD+tCL. It does not model overlapping bank operations, burst transfer, refresh, queues, scheduling policies, or real DRAM timing constraints.</p>
  </>}
 </div>;
}
