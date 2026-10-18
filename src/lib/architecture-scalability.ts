export type ParallelEstimate={cores:number;parallelPercent:number;serialWork:number;parallelWork:number;syncOverhead:number;falseSharingOverhead:number;totalParallelTime:number;speedup:number;efficiency:number;};
function integer(n:number,name:string,min:number,max:number){if(!Number.isInteger(n)||n<min||n>max)throw new RangeError(`${name} must be an integer from ${min} to ${max}`);}
export function estimateParallelScalability(cores:number,parallelPercent:number,workUnits:number,syncCostPerExtraCore:number,falseSharingCostPerExtraCore:number,falseSharing:boolean):ParallelEstimate{
 integer(cores,"cores",1,256);integer(parallelPercent,"parallelPercent",0,100);integer(workUnits,"workUnits",1,1_000_000_000_000);integer(syncCostPerExtraCore,"syncCostPerExtraCore",0,1_000_000_000);integer(falseSharingCostPerExtraCore,"falseSharingCostPerExtraCore",0,1_000_000_000);
 if(typeof falseSharing!=="boolean")throw new RangeError("falseSharing must be boolean");
 const p=parallelPercent/100,serialWork=workUnits*(1-p),parallelWork=workUnits*p/cores;
 const syncOverhead=syncCostPerExtraCore*(cores-1),falseSharingOverhead=falseSharing?falseSharingCostPerExtraCore*(cores-1):0;
 const totalParallelTime=serialWork+parallelWork+syncOverhead+falseSharingOverhead;
 return {cores,parallelPercent,serialWork,parallelWork,syncOverhead,falseSharingOverhead,totalParallelTime,speedup:workUnits/totalParallelTime,efficiency:workUnits/totalParallelTime/cores};
}
