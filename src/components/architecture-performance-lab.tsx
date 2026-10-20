import { useMemo, useState } from "react";
import { amdahlSpeedup, compareExecutionTimes, cpuExecutionTime } from "@/lib/architecture-performance";

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rule-t pt-2"><div className="eyebrow">{label}</div><div className="font-mono text-lg break-all">{value}</div></div>
);
const Field = ({ label, value, set, min, max, step = 1, unit = "" }: { label: string; value: number; set: (n:number)=>void; min:number; max:number; step?:number; unit?:string }) => (
  <label className="block text-sm">
    <span className="flex justify-between gap-2"><span className="eyebrow">{label}</span><span className="font-mono">{value.toLocaleString()}{unit}</span></span>
    <input className="w-full accent-[var(--primary)]" type="range" min={min} max={max} step={step} value={value} onChange={e=>set(Number(e.target.value))}/>
  </label>
);
export function ArchitecturePerformanceLab() {
 const [ic,setIc]=useState(1000); const [cpi,setCpi]=useState(1.5); const [ghz,setGhz]=useState(2);
 const [old,setOld]=useState(12); const [next,setNext]=useState(8);
 const [fraction,setFraction]=useState(80); const [partSpeed,setPartSpeed]=useState(4);
 const time=useMemo(()=>cpuExecutionTime(ic*1_000_000,cpi,ghz),[ic,cpi,ghz]);
 const comparison=useMemo(()=>compareExecutionTimes(old,next),[old,next]);
 const amdahl=useMemo(()=>amdahlSpeedup(fraction/100,partSpeed),[fraction,partSpeed]);
 const limit=useMemo(()=>fraction===100?Infinity:1/(1-fraction/100),[fraction]);
 return <div className="panel p-5 space-y-6">
  <div className="eyebrow">Interactive lab · CPU performance</div>
  <section className="space-y-3">
   <h3 className="font-mono text-sm">1 · Estimate CPU execution time</h3>
   <div className="grid gap-4 md:grid-cols-3">
    <Field label="Instruction count" value={ic} set={setIc} min={100} max={10000} step={100} unit=" M"/>
    <Field label="Average CPI" value={cpi} set={setCpi} min={0.5} max={8} step={0.1}/>
    <Field label="Clock rate" value={ghz} set={setGhz} min={0.5} max={6} step={0.1} unit=" GHz"/>
   </div>
   <div className="grid grid-cols-2 gap-4"><Stat label="Estimated CPU time" value={`${time.toFixed(4)} s`}/><Stat label="Total cycles" value={(ic*1_000_000*cpi).toLocaleString(undefined,{maximumFractionDigits:0})}/></div>
   <p className="text-xs text-muted-foreground">Instruction count is shown in millions. This model excludes any effects not represented in the chosen average CPI.</p>
  </section>
  <section className="space-y-3 border-t border-rule pt-5">
   <h3 className="font-mono text-sm">2 · Compare measured runtimes</h3>
   <div className="grid gap-4 md:grid-cols-2">
    <Field label="Old runtime" value={old} set={setOld} min={1} max={60} unit=" s"/>
    <Field label="New runtime" value={next} set={setNext} min={1} max={60} unit=" s"/>
   </div>
   <div className="grid grid-cols-2 gap-4"><Stat label="Speedup" value={`${comparison.speedup.toFixed(2)}×`}/><Stat label="Runtime change" value={`${comparison.improvementPercent.toFixed(1)}%`}/></div>
   <p className="text-xs text-muted-foreground">Positive runtime change means a reduction; a negative value means the new version is slower.</p>
  </section>
  <section className="space-y-3 border-t border-rule pt-5">
   <h3 className="font-mono text-sm">3 · Amdahl's law</h3>
   <div className="grid gap-4 md:grid-cols-2">
    <Field label="Fraction improved" value={fraction} set={setFraction} min={0} max={100} unit="%"/>
    <Field label="Speedup of that fraction" value={partSpeed} set={setPartSpeed} min={1} max={20} step={0.5} unit="×"/>
   </div>
   <div className="grid grid-cols-2 gap-4"><Stat label="Overall speedup" value={`${amdahl.toFixed(3)}×`}/><Stat label="Infinite-speed limit" value={Number.isFinite(limit)?`${limit.toFixed(2)}×`:"Unbounded in this idealized model"}/></div>
   <div className="h-3 overflow-hidden rounded-sm bg-muted flex"><div className="h-full bg-c1" style={{width:`${fraction}%`}}/><div className="h-full bg-c3" style={{width:`${100-fraction}%`}}/></div>
   <p className="text-xs text-muted-foreground">Blue = fraction targeted by optimization; contrasting segment = unchanged work. The unchanged fraction sets the speedup ceiling.</p>
  </section>
 </div>;
}
