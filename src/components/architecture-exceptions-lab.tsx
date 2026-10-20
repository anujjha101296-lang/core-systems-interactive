import { useMemo, useState } from "react";
import { simulatePreciseTrap, type TrapKind } from "@/lib/architecture-exceptions";

export function ArchitectureExceptionsLab() {
 const [kind,setKind]=useState<TrapKind>("synchronous-exception"); const [count,setCount]=useState(6); const [index,setIndex]=useState(2); const [start,setStart]=useState(4096); const [handler,setHandler]=useState(8192);
 const result=useMemo(()=>{try{return {report:simulatePreciseTrap({startPc:start,instructionCount:count,trapIndex:Math.min(index,kind==="external-interrupt"?count:count-1),kind,handlerPc:handler}),error:""};}catch(e){return {report:null,error:e instanceof Error?e.message:"Invalid configuration"};}},[start,count,index,kind,handler]);
 const hex=(n:number|null)=>n===null?"—":`0x${n.toString(16).padStart(4,"0")}`;
 const field="field mt-1 w-full";
 return <div className="panel p-5 space-y-5">
  <div><p className="eyebrow">Interactive lab · precise trap handling</p><p className="mt-2 text-sm text-muted-foreground">A synchronous exception belongs to a specific instruction; an external interrupt is taken at a precise architectural boundary. Compare retirement, flushing, saved PC, and handler redirection.</p></div>
  <div className="grid gap-4 sm:grid-cols-2">
   <label className="block text-sm">Trap type<select className={field} value={kind} onChange={e=>{setKind(e.target.value as TrapKind);setIndex(Math.min(index,count-1));}}><option value="synchronous-exception">Synchronous exception</option><option value="external-interrupt">External interrupt</option></select></label>
   <label className="block text-sm">Instruction count<select className={field} value={count} onChange={e=>{const n=Number(e.target.value);setCount(n);setIndex(Math.min(index,n-1));}}>{[3,4,5,6,8,10].map(n=><option key={n} value={n}>{n} instructions</option>)}</select></label>
   <label className="block text-sm">{kind==="synchronous-exception"?"Faulting instruction index (0-based)":"Interrupt boundary (retire count)"}<input className={field} type="number" min={0} max={kind==="synchronous-exception"?count-1:count} value={index} onChange={e=>setIndex(Math.max(0,Math.min(kind==="synchronous-exception"?count-1:count,Number(e.target.value)||0)))}/></label>
   <label className="block text-sm">Program start PC<input className={field} type="number" step={4} value={start} onChange={e=>setStart(Number(e.target.value)||0)}/></label>
   <label className="block text-sm sm:col-span-2">Trap handler PC<input className={field} type="number" step={4} value={handler} onChange={e=>setHandler(Number(e.target.value)||0)}/></label>
  </div>
  {result.error?<p className="text-sm text-destructive">{result.error}</p>:result.report&&<>
   <div className="grid gap-3 sm:grid-cols-4">{[["Retired",result.report.retired.length],["Faulting PC",hex(result.report.faulting)],["Saved EPC",hex(result.report.epc)],["Handler PC",hex(result.report.handlerPc)]].map(([k,v])=><div key={String(k)} className="rule-b p-3"><p className="eyebrow">{k}</p><p className="font-mono text-lg">{v}</p></div>)}</div>
   <div className="grid gap-3 sm:grid-cols-2"><div className="rule-b p-3"><p className="eyebrow">Retired before trap</p><p className="mt-2 font-mono text-xs">{result.report.retired.map(hex).join(", ")||"none"}</p></div><div className="rule-b p-3"><p className="eyebrow">Younger instructions flushed</p><p className="mt-2 font-mono text-xs">{result.report.flushed.map(hex).join(", ")||"none"}</p></div></div>
   <ol className="space-y-2">{result.report.trace.map((s,i)=><li key={i} className="rule-b pb-2 text-sm"><span className="mr-2 font-mono text-muted-foreground">{i+1}.</span>{s}</li>)}</ol>
  </>}
  <p className="text-xs text-muted-foreground">This teaching model illustrates architectural retirement boundaries, not the full privilege architecture of a particular ISA. Real systems define exact EPC/return-PC, cause, status, nesting, delegation and interrupt-priority rules.</p>
 </div>;
}
