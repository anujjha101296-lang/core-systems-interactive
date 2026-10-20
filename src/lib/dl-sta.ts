export type StaConfig = { periodNs:number; clockToQNs:number; maxCombNs:number; minCombNs:number; setupNs:number; holdNs:number; uncertaintyNs:number; captureSkewNs:number; falsePath:boolean; hasClock:boolean; hasIoDelays:boolean; hasGeneratedClocks:boolean };
export type StaReport = { requiredPeriodNs:number; setupSlackNs:number; holdSlackNs:number; fmaxMHz:number; setupPass:boolean; holdPass:boolean; constraintsComplete:boolean; disabledByFalsePath:boolean; warnings:string[] };
function finite(n:number,name:string,min=0,max=1_000_000){if(!Number.isFinite(n)||n<min||n>max)throw new RangeError(`${name} must be between ${min} and ${max}`);}
export function analyzeStaPath(c:StaConfig):StaReport {
 finite(c.periodNs,"periodNs",0.001,1_000_000); finite(c.clockToQNs,"clockToQNs"); finite(c.maxCombNs,"maxCombNs"); finite(c.minCombNs,"minCombNs"); finite(c.setupNs,"setupNs"); finite(c.holdNs,"holdNs"); finite(c.uncertaintyNs,"uncertaintyNs"); finite(c.captureSkewNs,"captureSkewNs",-1_000_000,1_000_000);
 if(c.minCombNs>c.maxCombNs) throw new RangeError("Minimum combinational delay cannot exceed maximum delay");
 for(const k of ["falsePath","hasClock","hasIoDelays","hasGeneratedClocks"] as const) if(typeof c[k]!=="boolean") throw new RangeError(`${k} must be boolean`);
 const requiredPeriodNs=c.clockToQNs+c.maxCombNs+c.setupNs+c.uncertaintyNs-c.captureSkewNs;
 const setupSlackNs=c.periodNs+c.captureSkewNs-c.uncertaintyNs-(c.clockToQNs+c.maxCombNs+c.setupNs);
 const holdSlackNs=c.clockToQNs+c.minCombNs-c.holdNs-c.captureSkewNs-c.uncertaintyNs;
 const warnings:string[]=[];
 if(!c.hasClock) warnings.push("No clock constraint: synchronous paths may be unconstrained.");
 if(!c.hasIoDelays) warnings.push("I/O delays are missing: interface timing may be unconstrained.");
 if(!c.hasGeneratedClocks) warnings.push("Generated clocks are not declared: derived-clock paths may be analyzed incorrectly.");
 if(c.falsePath) warnings.push("False-path exception disables timing analysis for this path; it does not make the path faster or prove it is safe to ignore.");
 if(setupSlackNs<0) warnings.push("Setup violation: maximum data arrival misses the required capture time.");
 if(holdSlackNs<0) warnings.push("Hold violation: minimum data arrival is too early for the capture hold window.");
 return {requiredPeriodNs,setupSlackNs,holdSlackNs,fmaxMHz:1000/requiredPeriodNs,setupPass:c.falsePath||setupSlackNs>=0,holdPass:c.falsePath||holdSlackNs>=0,constraintsComplete:c.hasClock&&c.hasIoDelays&&c.hasGeneratedClocks,disabledByFalsePath:c.falsePath,warnings};
}
