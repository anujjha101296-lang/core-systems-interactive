import { useMemo, useState } from "react";
import { stepFifo, validateFifoState, type FifoState } from "@/lib/dl-memory-fifo";

type Entry={label:string;message:string;items:number[];overflow:boolean;underflow:boolean};
export function MemoryFifoLab() {
 const [depth,setDepth]=useState(4); const [width,setWidth]=useState(4); const [value,setValue]=useState(5);
 const [state,setState]=useState<FifoState>({depth:4,width:4,items:[]}); const [history,setHistory]=useState<Entry[]>([]);
 const max=2**width-1;
 const current=useMemo(()=>{try{return {...validateFifoState(state),error:""};}catch(e){return {full:false,empty:true,count:0,maxValue:0,error:e instanceof Error?e.message:"Invalid FIFO"};}},[state]);
 const perform=(label:string,push:boolean,pop:boolean)=>{
  try {
   const normalized={depth,width,items:state.items.filter(v=>v<2**width)};
   const r=stepFifo(normalized,{...(push?{pushValue:Math.min(value,max)}:{}),pop});
   setState(r.state); setHistory(prev=>[...prev,{label,message:r.message,items:r.state.items,overflow:r.overflow,underflow:r.underflow}].slice(-10));
  } catch(e) { setHistory(prev=>[...prev,{label,message:e instanceof Error?e.message:"Invalid operation",items:state.items,overflow:false,underflow:false}].slice(-10)); }
 };
 const reconfigure=(d:number,w:number)=>{setDepth(d);setWidth(w);setValue(v=>Math.min(v,2**w-1));setState({depth:d,width:w,items:[]});setHistory([]);};
 const reset=()=>{setState({depth,width,items:[]});setHistory([]);};
 const field="field mt-1 w-full";
 return <div className="panel p-5 space-y-5">
  <div><p className="eyebrow">Interactive lab · synchronous FIFO</p><p className="mt-2 text-sm text-muted-foreground">A FIFO preserves insertion order. Observe empty/full, accepted operations, and overflow/underflow. This model uses old-state semantics at each active clock edge.</p></div>
  <div className="grid gap-4 sm:grid-cols-2">
   <label className="block text-sm">Depth<select className={field} value={depth} onChange={e=>reconfigure(Number(e.target.value),width)}>{[2,4,8,16,32,64].map(n=><option key={n} value={n}>{n} entries</option>)}</select></label>
   <label className="block text-sm">Data width<select className={field} value={width} onChange={e=>reconfigure(depth,Number(e.target.value))}>{[1,2,4,8,16,32].map(n=><option key={n} value={n}>{n} bits</option>)}</select></label>
   <label className="block text-sm sm:col-span-2">Push value (0…{max})<input className={field} type="number" min={0} max={max} value={Math.min(value,max)} onChange={e=>setValue(Math.max(0,Math.min(max,Number(e.target.value)||0)))}/></label>
  </div>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
   {[["Count",current.count],["Capacity",depth],["Empty",current.empty?"yes":"no"],["Full",current.full?"yes":"no"]].map(([k,v])=><div key={String(k)} className="rule-b p-3"><p className="eyebrow">{k}</p><p className="font-mono text-xl">{v}</p></div>)}
  </div>
  <div className="space-y-2"><p className="eyebrow">Storage order · head is next to pop</p><div className="flex gap-2 overflow-x-auto">{Array.from({length:depth},(_,i)=><div key={i} className={`min-w-12 flex-1 rounded-sm border p-3 text-center font-mono ${i<state.items.length?"border-primary bg-primary/10":"border-rule text-muted-foreground"}`}><div className="text-[10px]">{i===0&&state.items.length?"HEAD":i===state.items.length-1&&state.items.length?"TAIL":String(i)}</div><div>{state.items[i]??"—"}</div></div>)}</div></div>
  <div className="flex flex-wrap gap-2"><button className="btn btn-primary" onClick={()=>perform("Push",true,false)}>Push</button><button className="btn btn-primary" onClick={()=>perform("Pop",false,true)}>Pop</button><button className="btn btn-ghost" onClick={()=>perform("Push + Pop",true,true)}>Push + Pop</button><button className="btn btn-ghost" onClick={reset}>Reset FIFO</button></div>
  <div><p className="eyebrow mb-2">Recent cycle trace</p>{history.length===0?<p className="text-sm text-muted-foreground">No operations yet. Try pushing past full or popping while empty.</p>:<ol className="space-y-2">{history.map((h,i)=><li key={i} className="rule-b pb-2"><div className="flex flex-wrap justify-between gap-2 font-mono text-xs"><span>{i+1}. {h.label}</span><span className={h.overflow||h.underflow?"text-destructive":"text-primary"}>{h.overflow?"OVERFLOW":h.underflow?"UNDERFLOW":"accepted / idle"}</span></div><p className="mt-1 text-sm">{h.message}</p><p className="mt-1 font-mono text-xs text-muted-foreground">queue = [{h.items.join(", ")}]</p></li>)}</ol>}</div>
  <p className="text-xs text-muted-foreground">Synchronous FIFO teaching model: a simultaneous pop from empty is rejected even if a push is requested on that same edge; a simultaneous pop from full frees a slot for the push. Real RTL implementations use read/write pointers, occupancy/full/empty logic, and carefully defined timing.</p>
 </div>;
}
