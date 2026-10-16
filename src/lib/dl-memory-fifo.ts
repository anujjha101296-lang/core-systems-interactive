export type FifoState = { depth:number; width:number; items:number[] };
export type FifoStep = { state:FifoState; pushRequested:boolean; popRequested:boolean; pushAccepted:boolean; popAccepted:boolean; overflow:boolean; underflow:boolean; poppedValue:number|null; message:string };
const powerOfTwo=(n:number)=>Number.isInteger(n)&&n>0&&(n&(n-1))===0;
export function validateFifoState(s:FifoState) {
 if(!powerOfTwo(s.depth)||s.depth<2||s.depth>64) throw new RangeError("Depth must be a power of two from 2 to 64");
 if(!Number.isInteger(s.width)||s.width<1||s.width>32) throw new RangeError("Width must be from 1 to 32 bits");
 if(!Array.isArray(s.items)||s.items.length>s.depth) throw new RangeError("Queue contents exceed FIFO capacity");
 const max=s.width===32?0xffffffff:2**s.width-1;
 if(s.items.some(v=>!Number.isInteger(v)||v<0||v>max)) throw new RangeError("FIFO values must fit the configured unsigned width");
 return {maxValue:max,full:s.items.length===s.depth,empty:s.items.length===0,count:s.items.length};
}
/** Old-state synchronous semantics: a pop from empty does not consume a value pushed on the same edge. */
export function stepFifo(current:FifoState,request:{pushValue?:number;pop?:boolean}):FifoStep {
 const meta=validateFifoState(current);
 const pushRequested=request.pushValue!==undefined, popRequested=request.pop===true;
 if(pushRequested&&(!Number.isInteger(request.pushValue)||request.pushValue!<0||request.pushValue!>meta.maxValue)) throw new RangeError("Push value must fit the configured unsigned width");
 const popAccepted=popRequested&&current.items.length>0;
 const canPush=current.items.length<current.depth||popAccepted;
 const pushAccepted=pushRequested&&canPush;
 const overflow=pushRequested&&!canPush, underflow=popRequested&&!popAccepted;
 const items=[...current.items]; const poppedValue=popAccepted?items.shift()!:null;
 if(pushAccepted) items.push(request.pushValue!);
 const state={depth:current.depth,width:current.width,items};
 const message=[popAccepted?`popped ${poppedValue}`:underflow?"pop rejected: FIFO was empty":null,pushAccepted?`pushed ${request.pushValue}`:overflow?"push rejected: FIFO was full":null].filter(Boolean).join("; ")||"No operation accepted";
 return {state,pushRequested,popRequested,pushAccepted,popAccepted,overflow,underflow,poppedValue,message};
}
