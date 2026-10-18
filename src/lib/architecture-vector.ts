export type VectorEstimate={elements:number;lanes:number;chunks:number;scalarCycles:number;vectorCycles:number;speedup:number;laneUtilization:number;wastedLaneSlots:number;};
function integer(n:number,name:string,min:number,max:number){if(!Number.isInteger(n)||n<min||n>max)throw new RangeError(`${name} must be an integer from ${min} to ${max}`);}
export function estimateVectorExecution(elements:number,lanes:number,scalarCyclesPerElement:number,vectorStartupCycles:number,vectorCyclesPerChunk:number):VectorEstimate{
 integer(elements,"elements",0,1_000_000_000);integer(lanes,"lanes",1,1024);integer(scalarCyclesPerElement,"scalarCyclesPerElement",1,1_000_000);integer(vectorStartupCycles,"vectorStartupCycles",0,1_000_000);integer(vectorCyclesPerChunk,"vectorCyclesPerChunk",1,1_000_000);
 const chunks=Math.ceil(elements/lanes);
 const scalarCycles=elements*scalarCyclesPerElement;
 const vectorCycles=elements===0?0:vectorStartupCycles+chunks*vectorCyclesPerChunk;
 const laneSlots=chunks*lanes;
 return {elements,lanes,chunks,scalarCycles,vectorCycles,speedup:vectorCycles===0?0:scalarCycles/vectorCycles,laneUtilization:laneSlots?elements/laneSlots:0,wastedLaneSlots:laneSlots-elements};
}
