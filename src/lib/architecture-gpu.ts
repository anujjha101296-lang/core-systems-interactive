export type GpuEstimate={lanes:number;pathALanes:number;pathBLanes:number;diverged:boolean;instructionPasses:number;laneUtilization:number;memorySegments:number;usefulBytes:number;transferredBytes:number;transactionEfficiency:number;};
function integer(n:number,name:string,min:number,max:number){if(!Number.isInteger(n)||n<min||n>max)throw new RangeError(`${name} must be an integer from ${min} to ${max}`);}
function powerOfTwo(n:number){return n>0&&(n&(n-1))===0;}
export function estimateGpuWarp(lanes:number,branchPercent:number,strideBytes:number,elementBytes:number,segmentBytes:number):GpuEstimate{
 integer(lanes,"lanes",4,64);if(!powerOfTwo(lanes))throw new RangeError("Lane count must be a power of two");
 integer(branchPercent,"branchPercent",0,100);integer(strideBytes,"strideBytes",1,1_000_000);integer(elementBytes,"elementBytes",1,16);integer(segmentBytes,"segmentBytes",16,1024);if(!powerOfTwo(segmentBytes))throw new RangeError("Memory segment size must be a power of two");
 const pathALanes=Math.round(lanes*branchPercent/100),pathBLanes=lanes-pathALanes;
 const diverged=pathALanes>0&&pathBLanes>0;const instructionPasses=diverged?2:1;
 const segments=new Set<number>();
 for(let lane=0;lane<lanes;lane++)for(let byte=0;byte<elementBytes;byte++)segments.add(Math.floor((lane*strideBytes+byte)/segmentBytes));
 const memorySegments=segments.size,usefulBytes=lanes*elementBytes,transferredBytes=memorySegments*segmentBytes;
 return {lanes,pathALanes,pathBLanes,diverged,instructionPasses,laneUtilization:lanes/(lanes*instructionPasses),memorySegments,usefulBytes,transferredBytes,transactionEfficiency:Math.min(1,usefulBytes/transferredBytes)};
}
