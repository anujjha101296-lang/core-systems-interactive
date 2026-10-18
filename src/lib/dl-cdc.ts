export type SyncState={stage1:0|1;stage2:0|1;cycles:number;};
export type SyncStep={previous:SyncState;next:SyncState;input:0|1;output:0|1;changed:boolean;};
function bit(n:number,name:string):0|1{if(n!==0&&n!==1)throw new RangeError(`${name} must be 0 or 1`);return n;}
export function resetSynchronizer():SyncState{return {stage1:0,stage2:0,cycles:0};}
/** Idealized destination-edge model. It does not simulate analog metastability. */
export function stepSynchronizer(state:SyncState,asyncInput:number):SyncStep{
 const input=bit(asyncInput,"asyncInput");bit(state.stage1,"stage1");bit(state.stage2,"stage2");
 if(!Number.isInteger(state.cycles)||state.cycles<0)throw new RangeError("cycles must be a non-negative integer");
 const previous={...state};const next:SyncState={stage1:input,stage2:state.stage1,cycles:state.cycles+1};
 return {previous,next,input,output:next.stage2,changed:next.stage2!==state.stage2};
}
