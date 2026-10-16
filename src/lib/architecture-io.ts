export type IoConfig = { eventCount:number; bytesPerEvent:number; durationMs:number; pollCpuFraction:number; pollIntervalMs:number; interruptOverheadUs:number; copyNsPerByte:number; dmaBatchSize:number; dmaSetupUs:number; dmaCompletionIrqUs:number };
export type IoEstimate = { pollingCpuMs:number; interruptCpuMs:number; dmaCpuMs:number; pollingDetectionMs:number; interruptDispatchMs:number; dmaBatches:number; bytes:number; bestCpuMode:"polling"|"interrupts"|"dma"; };
function finite(n:number,name:string,min:number,max:number){if(!Number.isFinite(n)||n<min||n>max)throw new RangeError(`${name} must be between ${min} and ${max}`);}
export function estimateIoStrategies(c:IoConfig):IoEstimate {
 finite(c.eventCount,"eventCount",0,1_000_000); finite(c.bytesPerEvent,"bytesPerEvent",0,1_000_000_000);
 finite(c.durationMs,"durationMs",0.001,86_400_000); finite(c.pollCpuFraction,"pollCpuFraction",0,1);
 finite(c.pollIntervalMs,"pollIntervalMs",0.001,60_000); finite(c.interruptOverheadUs,"interruptOverheadUs",0,1_000_000);
 finite(c.copyNsPerByte,"copyNsPerByte",0,1_000_000); finite(c.dmaBatchSize,"dmaBatchSize",1,1_000_000);
 finite(c.dmaSetupUs,"dmaSetupUs",0,1_000_000); finite(c.dmaCompletionIrqUs,"dmaCompletionIrqUs",0,1_000_000);
 if(!Number.isInteger(c.eventCount)||!Number.isInteger(c.bytesPerEvent)||!Number.isInteger(c.dmaBatchSize)) throw new RangeError("Event count, bytes per event, and DMA batch size must be integers");
 const bytes=c.eventCount*c.bytesPerEvent;
 const batches=Math.ceil(c.eventCount/c.dmaBatchSize);
 const pollingCpuMs=c.durationMs*c.pollCpuFraction;
 const interruptCpuMs=c.eventCount*c.interruptOverheadUs/1000+bytes*c.copyNsPerByte/1e6;
 const dmaCpuMs=batches*(c.dmaSetupUs+c.dmaCompletionIrqUs)/1000;
 const values:[number, "polling"|"interrupts"|"dma"][]=[[pollingCpuMs,"polling"],[interruptCpuMs,"interrupts"],[dmaCpuMs,"dma"]];
 const bestCpuMode=values.reduce((best,item)=>item[0]<best[0]?item:best)[1];
 return {pollingCpuMs,interruptCpuMs,dmaCpuMs,pollingDetectionMs:c.pollIntervalMs/2,interruptDispatchMs:c.interruptOverheadUs/1000,dmaBatches:batches,bytes,bestCpuMode};
}
