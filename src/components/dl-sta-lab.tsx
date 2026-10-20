import { useMemo, useState } from "react";
import { analyzeStaPath } from "@/lib/dl-sta";

export function StaLab() {
 const [period,setPeriod]=useState(5); const [tcq,setTcq]=useState(0.4); const [maxDelay,setMaxDelay]=useState(3.2); const [minDelay,setMinDelay]=useState(0.15); const [setup,setSetup]=useState(0.5); const [hold,setHold]=useState(0.1); const [uncertainty,setUncertainty]=useState(0.1); const [skew,setSkew]=useState(0.2);
 const [falsePath,setFalsePath]=useState(false); const [clock,setClock]=useState(true); const [io,setIo]=useState(true); const [generated,setGenerated]=useState(true);
 const report=useMemo(()=>{try{return {data:analyzeStaPath({periodNs:period,clockToQNs:tcq,maxCombNs:maxDelay,minCombNs:minDelay,setupNs:setup,holdNs:hold,uncertaintyNs:uncertainty,captureSkewNs:skew,falsePath,hasClock:clock,hasIoDelays:io,hasGeneratedClocks:generated}),error:""};}catch(e){return {data:null,error:e instanceof Error?e.message:"Invalid path"};}},[period,tcq,maxDelay,minDelay,setup,hold,uncertainty,skew,falsePath,clock,io,generated]);
 const field="field mt-1 w-full";
 const setMaxDelaySafe=(n:number)=>{setMaxDelay(n);setMinDelay(v=>Math.min(v,n));};
 const Slider=({label,value,set,min,max,step=0.1}:{label:string;value:number;set:(n:number)=>void;min:number;max:number;step?:number})=><label className="block text-sm"><span className="flex justify-between gap-2"><span>{label}</span><span className="font-mono text-muted-foreground">{value.toFixed(2)} ns</span></span><input className="mt-2 w-full accent-primary" type="range" min={min} max={max} step={step} value={value} onChange={e=>set(Number(e.target.value))}/></label>;
 return <div className="panel p-5 space-y-5">
  <div><p className="eyebrow">Interactive lab · static timing analysis</p><p className="mt-2 text-sm text-muted-foreground">Change the clock budget and path delays, then inspect setup and hold separately. The lab also shows why missing constraints and careless false-path exceptions can make a timing report misleading.</p></div>
  <div className="grid gap-5 md:grid-cols-2">
   <div className="space-y-4"><p className="eyebrow">Path timing (ns)</p>
    <Slider label="Clock period" value={period} set={setPeriod} min={1} max={10}/>
    <Slider label="Clock-to-Q max/min launch delay" value={tcq} set={setTcq} min={0.1} max={1}/>
    <Slider label="Maximum combinational delay" value={maxDelay} set={setMaxDelaySafe} min={0.1} max={6}/>
    <Slider label="Minimum combinational delay" value={minDelay} set={setMinDelay} min={0} max={Math.max(0.1,maxDelay)} />
    <Slider label="Setup time" value={setup} set={setSetup} min={0.05} max={1}/>
    <Slider label="Hold time" value={hold} set={setHold} min={0} max={0.5}/>
    <Slider label="Clock uncertainty" value={uncertainty} set={setUncertainty} min={0} max={0.5}/>
    <Slider label="Capture skew (+ means later capture)" value={skew} set={setSkew} min={-0.5} max={0.5}/>
   </div>
   <div className="space-y-4"><p className="eyebrow">Constraint coverage</p>
    {[[clock,setClock,"Clock defined"],[io,setIo,"Input/output delays defined"],[generated,setGenerated,"Generated clocks defined"],[falsePath,setFalsePath,"Mark this path false (exception)"]].map(([checked,set,label])=><label key={String(label)} className="flex items-start gap-3 rounded-sm border border-rule p-3 text-sm"><input className="mt-1" type="checkbox" checked={Boolean(checked)} onChange={e=>(set as (v:boolean)=>void)(e.target.checked)}/><span>{String(label)}</span></label>)}
    <div className="rounded-sm bg-muted p-4 text-sm"><p className="font-medium">Constraint checklist</p><p className="mt-1 text-muted-foreground">A timing report is meaningful only for paths described by appropriate clocks, I/O constraints, generated clocks and justified exceptions. An unconstrained path is not a passing path.</p></div>
   </div>
  </div>
  {report.error?<p className="text-sm text-destructive">{report.error}</p>:report.data&&<>
   <div className="grid gap-3 sm:grid-cols-4">{[["Required period",report.data.requiredPeriodNs.toFixed(2)+" ns"],["Fmax estimate",report.data.fmaxMHz.toFixed(1)+" MHz"],["Setup slack",report.data.setupSlackNs.toFixed(2)+" ns"],["Hold slack",report.data.holdSlackNs.toFixed(2)+" ns"]].map(([k,v])=><div key={String(k)} className="rule-b p-3"><p className="eyebrow">{k}</p><p className="font-mono text-lg">{v}</p></div>)}</div>
   <div className="grid gap-3 sm:grid-cols-3"><div className="rule-b p-3"><p className="eyebrow">Setup</p><p className={report.data.disabledByFalsePath?"font-mono text-sm":"font-mono text-sm"}>{report.data.disabledByFalsePath?"EXCLUDED":report.data.setupPass?"PASS":"FAIL"}</p></div><div className="rule-b p-3"><p className="eyebrow">Hold</p><p className="font-mono text-sm">{report.data.disabledByFalsePath?"EXCLUDED":report.data.holdPass?"PASS":"FAIL"}</p></div><div className="rule-b p-3"><p className="eyebrow">Constraint coverage</p><p className="font-mono text-sm">{report.data.constraintsComplete?"declared":"incomplete"}</p></div></div>
   {report.data.warnings.length>0&&<ul className="space-y-2">{report.data.warnings.map((w,i)=><li key={i} className="text-sm text-destructive">• {w}</li>)}</ul>}
  </>}
  <p className="text-xs text-muted-foreground">Simplified single register-to-register path model. Real STA includes launch/capture clock paths, setup/hold uncertainty treatment, input/output delays, generated clocks, path groups, derates, corners, and tool-specific exception semantics. Never use a false path simply to hide a violation.</p>
 </div>;
}
