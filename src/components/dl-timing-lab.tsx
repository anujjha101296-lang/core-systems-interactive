import { useMemo, useState } from "react";
import { analyzeTiming, hazardDescription, type HazardCase } from "@/lib/dl-timing";

function NumberControl({label,value,set,min=0,max=20,step=0.1,unit=" ns"}:{label:string;value:number;set:(n:number)=>void;min?:number;max?:number;step?:number;unit?:string}) {
  return <label className="block text-sm"><span className="flex justify-between gap-3"><span>{label}</span><span className="font-mono text-muted-foreground">{value.toFixed(2)}{unit}</span></span><input aria-label={label} className="mt-2 w-full accent-primary" type="range" min={min} max={max} step={step} value={value} onChange={e=>set(Number(e.target.value))}/></label>;
}
export function TimingLab() {
  const [clockPeriod,setClockPeriod]=useState(5);
  const [clkToQ,setClkToQ]=useState(0.4);
  const [combDelay,setCombDelay]=useState(3.2);
  const [setup,setSetup]=useState(0.5);
  const [skew,setSkew]=useState(0.2);
  const [hold,setHold]=useState(0.25);
  const [minCombDelay,setMinCombDelay]=useState(0.1);
  const [hazard,setHazard]=useState<HazardCase>("static-1");
  const [stages,setStages]=useState(2);
  const report=useMemo(()=>analyzeTiming({clockPeriod,clkToQ,combDelay,setup,skew,hold,minCombDelay}),[clockPeriod,clkToQ,combDelay,setup,skew,hold,minCombDelay]);
  return <div className="space-y-5">
    <section className="panel p-5"><p className="eyebrow mb-2">Interactive lab · timing budget</p>
      <p className="mb-4 text-sm text-muted-foreground">Tune the clock and path delays. Setup checks the maximum-delay path; hold checks the minimum-delay path. Positive capture-clock skew helps setup but hurts hold.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberControl label="Clock period" value={clockPeriod} set={setClockPeriod} min={1} max={10} step={0.1}/>
        <NumberControl label="Clock-to-Q delay" value={clkToQ} set={setClkToQ} max={2}/>
        <NumberControl label="Combinational max delay" value={combDelay} set={setCombDelay} max={8}/>
        <NumberControl label="Setup time" value={setup} set={setSetup} max={2}/>
        <NumberControl label="Capture skew (+ = later)" value={skew} set={setSkew} min={-1} max={1}/>
        <NumberControl label="Hold time" value={hold} set={setHold} max={1}/>
        <NumberControl label="Combinational min delay" value={minCombDelay} set={setMinCombDelay} max={2}/>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rule-b p-3"><p className="eyebrow">Required period</p><p className="font-mono text-xl">{report.requiredPeriod.toFixed(2)} ns</p></div>
        <div className="rule-b p-3"><p className="eyebrow">Setup slack</p><p className={`font-mono text-xl ${report.setupPass?"text-primary":"text-destructive"}`}>{report.setupSlack.toFixed(2)} ns</p><p className="text-xs">{report.setupPass?"Setup passes":"Setup violation"}</p></div>
        <div className="rule-b p-3"><p className="eyebrow">Hold slack</p><p className={`font-mono text-xl ${report.holdPass?"text-primary":"text-destructive"}`}>{report.holdSlack.toFixed(2)} ns</p><p className="text-xs">{report.holdPass?"Hold passes":"Hold violation"}</p></div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Model: required period = clock-to-Q + max combinational delay + setup time + capture skew; hold slack = clock-to-Q + min combinational delay − hold time − capture skew. This simplified model omits uncertainty, jitter, and detailed launch/capture clock-tree terms.</p>
    </section>
    <section className="panel p-5"><p className="eyebrow mb-3">Hazards & glitches</p>
      <label className="block text-sm">Hazard type<select aria-label="Hazard type" className="field mt-2 w-full" value={hazard} onChange={e=>setHazard(e.target.value as HazardCase)}><option value="static-1">Static-1</option><option value="static-0">Static-0</option><option value="dynamic">Dynamic</option></select></label>
      <p className="mt-3 text-sm">{hazardDescription(hazard)}</p>
      <p className="mt-2 text-sm text-muted-foreground">Mitigations depend on the circuit: add consensus terms where appropriate, avoid sampling asynchronous glitches, register control signals, and verify the actual implementation. A logically equivalent minimized expression is not automatically hazard-free.</p>
    </section>
    <section className="panel p-5"><p className="eyebrow mb-3">Synchronizer & debouncing design</p>
      <p className="text-sm text-muted-foreground">An asynchronous input can change near a flip-flop's sampling edge and cause metastability. A two-or-more-stage synchronizer gives metastability time to settle before downstream logic observes the signal; it reduces risk, never makes it mathematically zero.</p>
      <label className="mt-4 block text-sm">Synchronizer stages: <strong>{stages}</strong><input aria-label="Synchronizer stages" className="mt-2 w-full accent-primary" type="range" min={2} max={4} step={1} value={stages} onChange={e=>setStages(Number(e.target.value))}/></label>
      <p className="mt-2 text-sm">Selected: {stages}-stage synchronizer. Use a separate debounce/filter policy for slow mechanical switches; synchronization alone does not remove contact bounce.</p>
      <p className="mt-3 text-xs text-muted-foreground">Design note: synchronize each asynchronous single-bit control independently; use a proper handshake or asynchronous FIFO for multi-bit crossings rather than synchronizing every data bit independently.</p>
    </section>
  </div>;
}
