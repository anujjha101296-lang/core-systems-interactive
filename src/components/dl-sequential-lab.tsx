import { useState } from "react";
import { dFlipFlop, dLatch, isRisingEdge, srLatch, type Bit } from "@/lib/dl-sequential";

const BitControl = ({ label, value, set }: { label: string; value: Bit; set: (v: Bit) => void }) => (
  <label className="block text-sm"><span className="text-muted-foreground">{label}</span>
    <select className="field mt-1 w-full" value={value} onChange={e => set(Number(e.target.value) as Bit)}>
      <option value={0}>0 · LOW</option><option value={1}>1 · HIGH</option>
    </select>
  </label>
);
const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => <section className="panel p-5"><p className="eyebrow mb-4">Interactive lab · {title}</p>{children}</section>;

export function SequentialLab() {
  const [s,setS] = useState<Bit>(0); const [r,setR] = useState<Bit>(0); const [srQ,setSrQ] = useState<Bit>(0);
  const sr = srLatch(s,r,srQ);
  const [d,setD] = useState<Bit>(1); const [en,setEn] = useState<Bit>(0); const [latchQ,setLatchQ] = useState<Bit>(0);
  const [ffD,setFfD] = useState<Bit>(1); const [clk,setClk] = useState<Bit>(0); const [ffQ,setFfQ] = useState<Bit>(0); const [reset,setReset] = useState<Bit>(0);
  const latchNext = dLatch(d,en,latchQ);
  const tick = () => { const next: Bit = clk === 0 ? 1 : 0; setClk(next); setFfQ(dFlipFlop(ffD,ffQ,isRisingEdge(clk,next),reset)); };
  return <div className="space-y-5">
    <Panel title="Active-high SR latch (NOR convention)">
      <p className="mb-3 text-sm text-muted-foreground">The latch stores a bit through feedback. S and R are active-high; S=R=1 is forbidden.</p>
      <div className="grid gap-3 sm:grid-cols-2"><BitControl label="Set S" value={s} set={setS}/><BitControl label="Reset R" value={r} set={setR}/></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rule-b p-3"><p className="eyebrow">Next Q</p><p className="font-mono text-2xl">{sr.q}</p></div><div className="rule-b p-3"><p className="eyebrow">Q̅</p><p className="font-mono text-2xl">{sr.qBar}</p></div><div className="rule-b p-3"><p className="eyebrow">Stored state</p><p className="font-mono text-2xl">{sr.q === sr.qBar ? "INVALID" : sr.q}</p></div></div>
      <p className="mt-3 text-sm">{sr.note}</p>
      <button className="btn btn-ghost mt-3" onClick={() => setSrQ(sr.q)}>Commit this output as previous state</button>
    </Panel>
    <Panel title="Level-sensitive D latch">
      <p className="mb-3 text-sm text-muted-foreground">When Enable=1, Q follows D. When Enable=0, Q holds its previous value.</p>
      <div className="grid gap-3 sm:grid-cols-2"><BitControl label="Data D" value={d} set={setD}/><BitControl label="Enable" value={en} set={setEn}/></div>
      <div className="mt-4 flex items-center justify-between rule-b p-3"><span>Current Q = {latchQ}</span><span>Combinational next = {latchNext}</span></div>
      <button className="btn btn-primary mt-3" onClick={() => setLatchQ(latchNext)}>Apply level / hold state</button>
      <p className="mt-2 text-xs text-muted-foreground">A latch is transparent while enabled; changing D during that level can change Q.</p>
    </Panel>
    <Panel title="Positive-edge-triggered D flip-flop">
      <p className="mb-3 text-sm text-muted-foreground">D is sampled only on a 0→1 clock edge. Reset is synchronous in this teaching model.</p>
      <div className="grid gap-3 sm:grid-cols-3"><BitControl label="Data D" value={ffD} set={setFfD}/><BitControl label="Clock level" value={clk} set={setClk}/><BitControl label="Synchronous reset" value={reset} set={setReset}/></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rule-b p-3"><p className="eyebrow">Clock</p><p className="font-mono text-2xl">{clk}</p></div><div className="rule-b p-3"><p className="eyebrow">Q</p><p className="font-mono text-2xl">{ffQ}</p></div><div className="rule-b p-3"><p className="eyebrow">D (sampled at edge)</p><p className="font-mono text-2xl">{ffD}</p></div></div>
      <div className="mt-3 flex flex-wrap gap-2"><button className="btn btn-primary" onClick={tick}>Toggle clock edge</button><button className="btn btn-ghost" onClick={() => setFfQ(0)}>Clear Q</button></div>
      <p className="mt-3 text-xs text-muted-foreground">Use the clock toggle to observe that only a rising edge captures D. For real hardware, setup/hold timing and metastability matter; this idealized lab does not model analog behavior.</p>
    </Panel>
  </div>;
}
