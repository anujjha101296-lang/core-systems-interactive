import { useMemo, useState } from "react";
import { storeBufferingOutcomes, type ConsistencyModel } from "@/lib/architecture-memory-consistency";
export function MemoryConsistencyLab(){
 const [model,setModel]=useState<ConsistencyModel>("SC");
 const outcomes=useMemo(()=>storeBufferingOutcomes(model),[model]);
 return <div className="panel p-5 space-y-5">
  <div><p className="eyebrow">Interactive lab · store-buffering litmus test</p><p className="mt-2 text-sm text-muted-foreground">Two threads each store to one variable, then read the other. Compare the outcomes allowed by a sequentially consistent model with a simplified relaxed model that permits store visibility to lag behind loads.</p></div>
  <div className="grid gap-3 md:grid-cols-2"><div className="rounded-sm border border-rule p-4"><p className="eyebrow">Thread 0</p><pre className="mt-2 font-mono text-sm">x = 1;{"\n"}r0 = y;</pre></div><div className="rounded-sm border border-rule p-4"><p className="eyebrow">Thread 1</p><pre className="mt-2 font-mono text-sm">y = 1;{"\n"}r1 = x;</pre></div></div>
  <div><p className="eyebrow mb-2">Memory model</p><div className="flex flex-wrap gap-2"><button className={`btn ${model==="SC"?"btn-primary":"btn-ghost"}`} onClick={()=>setModel("SC")}>Sequential consistency</button><button className={`btn ${model==="relaxed"?"btn-primary":"btn-ghost"}`} onClick={()=>setModel("relaxed")}>Simplified relaxed model</button></div></div>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{outcomes.map(o=><div key={o.label} className={`rounded-sm border p-4 text-center ${o.label==="00"?"border-destructive":"border-rule"}`}><p className="eyebrow">r0, r1</p><p className="font-mono text-2xl">{o.label}</p>{o.label==="00"&&<p className="mt-1 text-xs text-destructive">Both read initial values</p>}</div>)}</div>
  <p className="text-sm text-ink-2">{model==="SC"?"Under sequential consistency, each thread's program order is preserved and all operations fit one global interleaving. The 00 outcome is not allowed for this test.":"This simplified relaxed model includes 00 because each load may observe the initial value before the other thread's store becomes visible. Real ISAs specify precise rules; this model is illustrative, not a simulator for a particular CPU."}</p>
  <div className="rounded-sm bg-muted p-4"><p className="eyebrow">Key distinction</p><p className="mt-2 text-sm">Coherence orders writes to an individual memory location. Consistency defines which cross-location observations concurrent threads may make. A system can have coherent caches and still allow outcomes that surprise software without the required synchronization.</p></div>
 </div>;
}
