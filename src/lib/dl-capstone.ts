export type TxState="idle"|"data"|"stop";
export type CapstoneState={queue:number[];txState:TxState;currentByte:number|null;bitIndex:number;txBit:0|1;framesSent:number;cycles:number;trace:string[];};
export type CapstoneAction={type:"push";value:number}|{type:"tick"}|{type:"reset"};
export type CapstoneResult={state:CapstoneState;event:string;accepted?:boolean;overflow?:boolean;};
export function resetCapstone():CapstoneState{return {queue:[],txState:"idle",currentByte:null,bitIndex:0,txBit:1,framesSent:0,cycles:0,trace:[]};}
function validate(s:CapstoneState){if(!Array.isArray(s.queue)||s.queue.length>4||s.queue.some(v=>!Number.isInteger(v)||v<0||v>255))throw new RangeError("Queue must contain at most four bytes");if(!["idle","data","stop"].includes(s.txState))throw new RangeError("Invalid transmitter state");if(s.currentByte!==null&&(!Number.isInteger(s.currentByte)||s.currentByte<0||s.currentByte>255))throw new RangeError("Invalid current byte");if(!Number.isInteger(s.bitIndex)||s.bitIndex<0||s.bitIndex>7)throw new RangeError("Invalid bit index");if(s.txBit!==0&&s.txBit!==1)throw new RangeError("TX must be 0 or 1");if(!Number.isInteger(s.framesSent)||s.framesSent<0||!Number.isInteger(s.cycles)||s.cycles<0)throw new RangeError("Counters must be non-negative integers");}
export function stepCapstone(current:CapstoneState,action:CapstoneAction):CapstoneResult{
 validate(current);if(action.type==="reset")return {state:resetCapstone(),event:"Reset transmitter and FIFO"};
 let state:CapstoneState={...current,queue:[...current.queue],trace:[...current.trace]};
 if(action.type==="push"){
  if(!Number.isInteger(action.value)||action.value<0||action.value>255)throw new RangeError("Push value must be a byte from 0 to 255");
  if(state.queue.length===4)return {state,event:"FIFO full: byte rejected",accepted:false,overflow:true};
  state.queue.push(action.value);const event=`Enqueued 0x${action.value.toString(16).padStart(2,"0").toUpperCase()}`;
  state.trace=[...state.trace,event].slice(-12);return {state,event,accepted:true,overflow:false};
 }
 if(action.type!=="tick")throw new RangeError("Unsupported action");
 state.cycles++;
 let event:string;
 if(state.txState==="idle"){
  if(state.queue.length===0){state.txBit=1;event="IDLE: TX remains high";}
  else {state.currentByte=state.queue.shift()!;state.txState="data";state.bitIndex=0;state.txBit=0;event=`START bit 0 for 0x${state.currentByte.toString(16).padStart(2,"0").toUpperCase()}`;}
 }else if(state.txState==="data"){
  const byte=state.currentByte!;state.txBit=((byte>>state.bitIndex)&1) as 0|1;event=`DATA bit ${state.bitIndex} = ${state.txBit}`;
  if(state.bitIndex===7)state.txState="stop";else state.bitIndex++;
 }else{
  state.txBit=1;event="STOP bit 1; frame complete";state.txState="idle";state.currentByte=null;state.bitIndex=0;state.framesSent++;
 }
 state.trace=[...state.trace,event].slice(-12);return {state,event};
}
