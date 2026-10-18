import { useState } from "react";
import { resetSynchronizer, stepSynchronizer, type SyncState } from "@/lib/dl-cdc";
export function CdcLab(){
 const [asyncInput,setAsyncInput]=useState<0|1>(0);const [state,setState]=useState<SyncState>(resetSynchronizer());const [history,setHistory]=useState<{cycle:number;input:number;s1:number;s2:number;note:string}[]>([]);
 const setInput=(v:0|1)=>{setAsyncInput(v);setHistory(h=>[...h,{cycle:state.cycles,input:v,s1:state.stage1,s2:state.stage2,note:`Async input changed to ${v} between destination clock edges`}].slice(-8));};
 const tick=()=>{const r=stepSynchronizer(state,asyncInput);setState(r.next);setHistory(h=>[...h,{cycle:r.next.cycles,input:asyncInput,s1:r.next.stage1,s2:r.next.stage2,note:r.changed?"Destination output changed after the second stage updated":"Destination edge sampled the input; output holds or pipeline advances"}].slice(-8));};
 const reset=()=>{setAsyncInput(0);setState(resetSynchronizer());setHistory([]);};
 return <div className="panel p-5 space-y-5">
  <div><p className="eyebrow">Interactive lab · two-flop synchronizer</p><p className="mt-2 text-sm text-muted-foreground">Change an asynchronous level between destination clock edges, then step the destination clock. The second stage follows the previous first-stage value, modeling nonblocking-assignment pipeline behavior.</p></div>
  <div className="grid gap-3 sm:grid-cols-3">{[["Async input",asyncInput],["Stage 1",state.stage1],["Synchronized output",state.stage2]].map(([k,v])=><div key={String(k)} className="rule-t pt-2"><p className="eyebrow">{k}</p><p className="font-mono text-2xl">{v}</p></div>)}</div>
  <div className="flex flex-wrap gap-2"><button className={`btn ${asyncInput===0?"btn-primary":"btn-ghost"}`} onClick={()=>setInput(0)}>Set async input 0</button><button className={`btn ${asyncInput===1?"btn-primary":"btn-ghost"}`} onClick={()=>setInput(1)}>Set async input 1</button><button className="btn btn-primary" onClick={tick}>Destination clock edge →</button><button className="btn btn-ghost" onClick={reset}>Reset model</button></div>
  <p className="text-sm text-ink-2">Destination cycles: {state.cycles}. A stable level usually appears at the output after two destination edges. Try setting the input to 1 and then back to 0 before ticking: this level synchronizer may never capture a short pulse.</p>
  <div><p className="eyebrow mb-2">Recent events</p>{history.length===0?<p className="text-sm text-muted-foreground">Change the asynchronous input or step the clock to begin.</p>:<ol className="space-y-2">{history.map((h,i)=><li key={i} className="rule-b pb-2"><div className="font-mono text-xs">Event {i+1} · destination cycle {h.cycle}</div><p className="mt-1 text-sm">{h.note}</p><p className="mt-1 font-mono text-xs text-muted-foreground">input={h.input}, stage1={h.s1}, stage2={h.s2}</p></li>)}</ol>}</div>
  <p className="text-xs text-muted-foreground">This is an idealized logical model and does not simulate metastability probability or analog resolution time. A two-flop synchronizer is for a single-bit level; pulse transfer, multi-bit buses and reset deassertion need protocol-specific CDC techniques.</p>
 </div>;
}
