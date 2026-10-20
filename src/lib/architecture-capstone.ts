export type CpuWorkload={instructions:number;baseCpi:number;otherStallCpi:number;l1MissesPerK:number;missPenaltyCycles:number;branchMispredictsPerK:number;branchPenaltyCycles:number;clockPeriodNs:number;};
export type CpuEstimate={instructions:number;effectiveCpi:number;baseCycles:number;otherStallCycles:number;cacheStallCycles:number;branchStallCycles:number;totalCycles:number;timeMs:number;};
export type CpuComparison={baseline:CpuEstimate;optimized:CpuEstimate;speedup:number;timeReductionPercent:number;};
function finite(n:number,name:string,min:number,max:number){if(!Number.isFinite(n)||n<min||n>max)throw new RangeError(`${name} must be between ${min} and ${max}`);}
export function estimateCpuWorkload(w:CpuWorkload):CpuEstimate{
 finite(w.instructions,"instructions",1,1_000_000_000_000);
 if(!Number.isInteger(w.instructions))throw new RangeError("instructions must be an integer");
 finite(w.baseCpi,"baseCpi",0.01,100);finite(w.otherStallCpi,"otherStallCpi",0,100);
 finite(w.l1MissesPerK,"l1MissesPerK",0,1000);finite(w.missPenaltyCycles,"missPenaltyCycles",0,1_000_000);
 finite(w.branchMispredictsPerK,"branchMispredictsPerK",0,1000);finite(w.branchPenaltyCycles,"branchPenaltyCycles",0,1_000_000);
 finite(w.clockPeriodNs,"clockPeriodNs",0.01,1000);
 const baseCycles=w.instructions*w.baseCpi,otherStallCycles=w.instructions*w.otherStallCpi;
 const cacheStallCycles=w.instructions*w.l1MissesPerK/1000*w.missPenaltyCycles;
 const branchStallCycles=w.instructions*w.branchMispredictsPerK/1000*w.branchPenaltyCycles;
 const totalCycles=baseCycles+otherStallCycles+cacheStallCycles+branchStallCycles;
 return {instructions:w.instructions,effectiveCpi:totalCycles/w.instructions,baseCycles,otherStallCycles,cacheStallCycles,branchStallCycles,totalCycles,timeMs:totalCycles*w.clockPeriodNs/1e6};
}
export function compareCpuOptimization(w:CpuWorkload,cacheReductionPercent:number,branchReductionPercent:number,clockPeriodReductionPercent:number):CpuComparison{
 finite(cacheReductionPercent,"cacheReductionPercent",0,100);finite(branchReductionPercent,"branchReductionPercent",0,100);finite(clockPeriodReductionPercent,"clockPeriodReductionPercent",0,99.99);
 const baseline=estimateCpuWorkload(w);
 const optimized=estimateCpuWorkload({...w,l1MissesPerK:w.l1MissesPerK*(1-cacheReductionPercent/100),branchMispredictsPerK:w.branchMispredictsPerK*(1-branchReductionPercent/100),clockPeriodNs:w.clockPeriodNs*(1-clockPeriodReductionPercent/100)});
 return {baseline,optimized,speedup:baseline.timeMs/optimized.timeMs,timeReductionPercent:(1-optimized.timeMs/baseline.timeMs)*100};
}
