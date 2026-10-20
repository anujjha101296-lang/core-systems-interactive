import { useMemo, useState } from "react";
import { estimateIoStrategies } from "@/lib/architecture-io";

export function ArchitectureIoLab() {
 const [events,setEvents]=useState(1000); const [bytesPerEvent,setBytesPerEvent]=useState(1024); const [duration,setDuration]=useState(1000);
 const [pollCpu,setPollCpu]=useState(0.65); const [pollInterval,setPollInterval]=useState(2); const [irqUs,setIrqUs]=useState(8);
 const [copyNs,setCopyNs]=useState(12); const [batch,setBatch]=useState(64); const [dmaSetup,setDmaSetup]=useState(15); const [dmaIrq,setDmaIrq]=useState(8);
 const estimate=useMemo(()=>{try{return {data:estimateIoStrategies({eventCount:events,bytesPerEvent,durationMs:duration,pollCpuFraction:pollCpu,pollIntervalMs:pollInterval,interruptOverheadUs:irqUs,copyNsPerByte:copyNs,dmaBatchSize:batch,dmaSetupUs:dmaSetup,dmaCompletionIrqUs:dmaIrq}),error:""};}catch(e){return {data:null,error:e instanceof Error?e.message:"Invalid configuration"};}},[events,bytesPerEvent,duration,pollCpu,pollInterval,irqUs,copyNs,batch,dmaSetup,dmaIrq]);
 const field="field mt-1 w-full";
 const Slider=({label,value,set,min,max,step=1,unit=""}:{label:string;value:number;set:(n:number)=>void;min:number;max:number;step?:number;unit?:string})=><label className="block text-sm"><span className="flex justify-between gap-2"><span>{label}</span><span className="font-mono text-muted-foreground">{value}{unit}</span></span><input className="mt-2 w-full accent-primary" type="range" min={min} max={max} step={step} value={value} onChange={e=>set(Number(e.target.value))}/></label>;
 const modeLabel=(m:string)=>m==="polling"?"Polling":m==="interrupts"?"Interrupts":"DMA";
 return <div className="panel p-5 space-y-5">
  <div><p className="eyebrow">Interactive lab · I/O strategy trade-offs</p><p className="mt-2 text-sm text-muted-foreground">Compare modeled CPU time for polling, per-event interrupts, and batched DMA. Results depend on the cost assumptions shown; this is a teaching estimator, not a hardware benchmark.</p></div>
  <div className="grid gap-5 md:grid-cols-2">
   <div className="space-y-4"><p className="eyebrow">Workload</p>
    <Slider label="Events" value={events} set={setEvents} min={10} max={10000} step={10}/>
    <Slider label="Bytes per event" value={bytesPerEvent} set={setBytesPerEvent} min={16} max={65536} step={16} unit=" B"/>
    <Slider label="Workload duration" value={duration} set={setDuration} min={10} max={10000} step={10} unit=" ms"/>
    <Slider label="Polling CPU fraction" value={pollCpu} set={setPollCpu} min={0.05} max={1} step={0.05} unit=""/>
    <Slider label="Polling interval" value={pollInterval} set={setPollInterval} min={0.1} max={20} step={0.1} unit=" ms"/>
   </div>
   <div className="space-y-4"><p className="eyebrow">Cost assumptions</p>
    <Slider label="Interrupt overhead / event" value={irqUs} set={setIrqUs} min={1} max={100} unit=" µs"/>
    <Slider label="CPU copy cost" value={copyNs} set={setCopyNs} min={0} max={100} unit=" ns/byte"/>
    <Slider label="DMA batch size" value={batch} set={setBatch} min={1} max={512} step={1} unit=" events"/>
    <Slider label="DMA setup cost / batch" value={dmaSetup} set={setDmaSetup} min={1} max={100} unit=" µs"/>
    <Slider label="DMA completion interrupt" value={dmaIrq} set={setDmaIrq} min={1} max={100} unit=" µs"/>
   </div>
  </div>
  {estimate.error?<p className="font-mono text-sm text-destructive">{estimate.error}</p>:estimate.data&&<div className="space-y-4">
   <div className="grid gap-3 sm:grid-cols-3">
    {[["Polling",estimate.data.pollingCpuMs],["Interrupts",estimate.data.interruptCpuMs],["DMA",estimate.data.dmaCpuMs]].map(([label,value])=><div key={String(label)} className="rule-b p-3"><p className="eyebrow">{label} CPU time</p><p className="font-mono text-xl">{Number(value).toFixed(2)} ms</p><div className="mt-2 h-2 rounded-sm bg-muted"><div className="h-2 rounded-sm bg-primary" style={{width:`${Math.min(100,Number(value)/Math.max(estimate.data!.pollingCpuMs,estimate.data!.interruptCpuMs,estimate.data!.dmaCpuMs,0.001)*100)}%`}}/></div></div>)}
   </div>
   <div className="grid gap-3 sm:grid-cols-3"><div className="rule-b p-3"><p className="eyebrow">Lowest modeled CPU cost</p><p className="font-mono text-lg">{modeLabel(estimate.data.bestCpuMode)}</p></div><div className="rule-b p-3"><p className="eyebrow">Polling detection</p><p className="font-mono text-lg">~{estimate.data.pollingDetectionMs.toFixed(2)} ms avg</p></div><div className="rule-b p-3"><p className="eyebrow">DMA batches</p><p className="font-mono text-lg">{estimate.data.dmaBatches}</p></div></div>
   <p className="text-sm text-ink-2">Total modeled payload: {(estimate.data.bytes/1e6).toFixed(2)} MB. Polling spends a configured CPU fraction throughout the workload; interrupts pay per-event dispatch and CPU-copy costs; DMA pays setup/completion costs per batch and omits CPU copying the payload.</p>
  </div>}
  <p className="text-xs text-muted-foreground">Real systems add device-specific latency, cache effects, bus contention, interrupt coalescing, driver overhead, DMA mapping, IOMMU, and throughput limits. DMA is not automatically faster for tiny transfers.</p>
 </div>;
}
