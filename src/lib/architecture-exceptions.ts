export type TrapKind = "synchronous-exception" | "external-interrupt";
export type TrapReport = { kind:TrapKind; retired:number[]; faulting:number|null; flushed:number[]; epc:number; cause:string; handlerPc:number; trace:string[] };
export function simulatePreciseTrap(input:{startPc:number;instructionCount:number;trapIndex:number;kind:TrapKind;handlerPc:number;cause?:string}):TrapReport {
 const {startPc,instructionCount,trapIndex,kind,handlerPc}=input;
 for(const [name,n] of [["startPc",startPc],["instructionCount",instructionCount],["trapIndex",trapIndex],["handlerPc",handlerPc]] as const) if(!Number.isInteger(n)||n<0) throw new RangeError(`${name} must be a non-negative integer`);
 if(startPc%4!==0||handlerPc%4!==0) throw new RangeError("Program and handler PCs must be 4-byte aligned");
 if(instructionCount<1||instructionCount>32) throw new RangeError("Instruction count must be from 1 to 32");
 if(!["synchronous-exception","external-interrupt"].includes(kind)) throw new RangeError("Unsupported trap kind");
 if(kind==="synchronous-exception"&&(trapIndex<0||trapIndex>=instructionCount)) throw new RangeError("Exception index must identify an instruction in the program");
 if(kind==="external-interrupt"&&(trapIndex<0||trapIndex>instructionCount)) throw new RangeError("Interrupt boundary must be from before the first through after the last instruction");
 const pcs=Array.from({length:instructionCount},(_,i)=>startPc+4*i);
 const retired=kind==="synchronous-exception"?pcs.slice(0,trapIndex):pcs.slice(0,trapIndex);
 const faulting=kind==="synchronous-exception"?pcs[trapIndex]!:null;
 const flushed=kind==="synchronous-exception"?pcs.slice(trapIndex+1):pcs.slice(trapIndex);
 const epc=kind==="synchronous-exception"?faulting!:startPc+4*trapIndex;
 const cause=input.cause?.trim()||(kind==="synchronous-exception"?"Synchronous exception":"External interrupt");
 const trace:string[]=[];
 trace.push(`Trap recognized: ${kind}`);
 trace.push(`Retire older instructions in order: ${retired.length?retired.map(pc=>`0x${pc.toString(16).padStart(4,"0")}`).join(", "):"none"}`);
 if(kind==="synchronous-exception") trace.push(`Faulting instruction at 0x${faulting!.toString(16).padStart(4,"0")} does not retire`);
 trace.push(`Discard younger in-flight instructions: ${flushed.length?flushed.map(pc=>`0x${pc.toString(16).padStart(4,"0")}`).join(", "):"none"}`);
 trace.push(`Save EPC=0x${epc.toString(16).padStart(4,"0")} and cause="${cause}"`);
 trace.push(`Redirect PC to handler 0x${handlerPc.toString(16).padStart(4,"0")}`);
 return {kind,retired,faulting,flushed,epc,cause,handlerPc,trace};
}
