import { useState } from "react";
import { counterNext, registerNext, shiftRegisterNext } from "@/lib/dl-registers";
type Bit = 0 | 1;
const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => <section className="panel p-5"><p className="eyebrow mb-4">Interactive lab · {title}</p>{children}</section>;
export function RegistersLab() {
  const [width,setWidth] = useState(4);
  const [q,setQ] = useState(3); const [data,setData] = useState(10); const [enable,setEnable] = useState<Bit>(1); const [reset,setReset] = useState<Bit>(0);
  const [shift,setShift] = useState(5); const [serial,setSerial] = useState<Bit>(1); const [direction,setDirection] = useState<"left"|"right">("left");
  const [count,setCount] = useState(0); const [countDir,setCountDir] = useState<"up"|"down">("up");
  const max = 2 ** width - 1;
  const bounded = (n: number) => Math.max(0,Math.min(max,Number.isFinite(n)?Math.trunc(n):0));
  return <div className="space-y-5">
    <Panel title="Parallel register with enable and synchronous reset">
      <label className="block text-sm">Width <select className="field mt-1 w-full" value={width} onChange={e=>{const w=Number(e.target.value);setWidth(w);const m=2**w-1;setQ(v=>Math.min(v,m));setData(v=>Math.min(v,m));setShift(v=>Math.min(v,m));setCount(v=>Math.min(v,m));}}>{[2,3,4,8].map(w=><option key={w} value={w}>{w} bits</option>)}</select></label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="block text-sm">Current Q<input className="field mt-1 w-full" type="number" min={0} max={max} value={q} onChange={e=>setQ(bounded(+e.target.value))}/></label><label className="block text-sm">Input D<input className="field mt-1 w-full" type="number" min={0} max={max} value={data} onChange={e=>setData(bounded(+e.target.value))}/></label></div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="block text-sm">Enable<select className="field mt-1 w-full" value={enable} onChange={e=>setEnable(Number(e.target.value) as Bit)}><option value={0}>0 · hold</option><option value={1}>1 · load</option></select></label><label className="block text-sm">Reset<select className="field mt-1 w-full" value={reset} onChange={e=>setReset(Number(e.target.value) as Bit)}><option value={0}>0 · inactive</option><option value={1}>1 · clear</option></select></label></div>
      <div className="mt-4 rule-b p-3"><p className="eyebrow">Next Q on clock edge</p><p className="font-mono text-xl">{registerNext(q,data,width,enable,reset)} · {registerNext(q,data,width,enable,reset).toString(2).padStart(width,"0")}</p><button className="btn btn-primary mt-3" onClick={()=>setQ(registerNext(q,data,width,enable,reset))}>Apply rising edge</button></div>
    </Panel>
    <Panel title="Serial shift register">
      <div className="grid gap-3 sm:grid-cols-3"><label className="block text-sm">Current bits<input className="field mt-1 w-full" type="number" min={0} max={max} value={shift} onChange={e=>setShift(bounded(+e.target.value))}/></label><label className="block text-sm">Serial input<select className="field mt-1 w-full" value={serial} onChange={e=>setSerial(Number(e.target.value) as Bit)}><option value={0}>0</option><option value={1}>1</option></select></label><label className="block text-sm">Direction<select className="field mt-1 w-full" value={direction} onChange={e=>setDirection(e.target.value as "left"|"right")}><option value="left">Shift left</option><option value="right">Shift right</option></select></label></div>
      <div className="mt-4 rule-b p-3"><p className="eyebrow">Next state</p><p className="font-mono text-xl">{shiftRegisterNext(shift,serial,width,direction).toString(2).padStart(width,"0")}</p><button className="btn btn-primary mt-3" onClick={()=>setShift(shiftRegisterNext(shift,serial,width,direction))}>Shift one bit</button></div>
      <p className="mt-2 text-xs text-muted-foreground">The outgoing bit is discarded in this simplified model; the serial input fills the vacated position.</p>
    </Panel>
    <Panel title="Synchronous up/down counter">
      <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm">Direction<select className="field mt-1 w-full" value={countDir} onChange={e=>setCountDir(e.target.value as "up"|"down")}><option value="up">Count up</option><option value="down">Count down</option></select></label><div className="rule-b p-3"><p className="eyebrow">Current state</p><p className="font-mono text-xl">{count.toString(2).padStart(width,"0")} ({count})</p></div></div>
      <div className="mt-3 flex flex-wrap gap-2"><button className="btn btn-primary" onClick={()=>setCount(counterNext(count,width,countDir))}>Clock tick</button><button className="btn btn-ghost" onClick={()=>setCount(0)}>Reset to 0</button></div>
      <p className="mt-3 text-xs text-muted-foreground">An n-bit counter has 2ⁿ states. Up-count wraps from 2ⁿ−1 to 0; down-count wraps from 0 to 2ⁿ−1.</p>
    </Panel>
  </div>;
}
