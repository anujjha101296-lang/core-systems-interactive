export type DatapathInstruction = "add"|"sub"|"and"|"or"|"lw"|"sw"|"beq";
export type DatapathInputs = { instruction: DatapathInstruction; rsValue: number; rtValue: number; immediate: number; pc: number; memoryWord: number; };
export type DatapathResult = { aluControl:string; aluResult:number; zero:boolean; regWrite:boolean; memRead:boolean; memWrite:boolean; memToReg:boolean; aluSrc:"register"|"sign-extended immediate"; branch:boolean; destination:"rd"|"rt"|"none"; nextPc:number; writeback:number|null; };
function signed32(n:number) { return n|0; }
export function evaluateDatapath(i:DatapathInputs):DatapathResult {
 if(!["add","sub","and","or","lw","sw","beq"].includes(i.instruction)) throw new RangeError("instruction must be a supported operation");
 for(const [k,v] of Object.entries({rsValue:i.rsValue,rtValue:i.rtValue,immediate:i.immediate,pc:i.pc,memoryWord:i.memoryWord})) if(!Number.isFinite(v) || !Number.isInteger(v)) throw new RangeError(`${k} must be a finite integer`);
 if(i.pc<0||i.pc>0xfffffffc||i.pc%4!==0) throw new RangeError("pc must be an aligned 32-bit address");
 if(i.immediate < -32768 || i.immediate > 32767) throw new RangeError("immediate must fit a signed 16-bit field");
 const a=signed32(i.rsValue), b=signed32(i.rtValue), imm=signed32(i.immediate);
 let aluControl:string, aluResult:number, regWrite=false, memRead=false, memWrite=false, memToReg=false, aluSrc:"register"|"sign-extended immediate"="register", branch=false, destination:"rd"|"rt"|"none"="none", writeback:number|null=null;
 switch(i.instruction) {
  case "add": aluControl="ADD"; aluResult=signed32(a+b); regWrite=true; destination="rd"; writeback=aluResult; break;
  case "sub": aluControl="SUB"; aluResult=signed32(a-b); regWrite=true; destination="rd"; writeback=aluResult; break;
  case "and": aluControl="AND"; aluResult=a&b; regWrite=true; destination="rd"; writeback=aluResult; break;
  case "or": aluControl="OR"; aluResult=a|b; regWrite=true; destination="rd"; writeback=aluResult; break;
  case "lw": aluControl="ADD (address)"; aluResult=signed32(a+imm); aluSrc="sign-extended immediate"; regWrite=true; memRead=true; memToReg=true; destination="rt"; writeback=signed32(i.memoryWord); break;
  case "sw": aluControl="ADD (address)"; aluResult=signed32(a+imm); aluSrc="sign-extended immediate"; memWrite=true; break;
  case "beq": aluControl="SUB (compare)"; aluResult=signed32(a-b); branch=true; break;
 }
 const zero=aluResult===0;
 const nextPc=branch&&zero?((i.pc+4+((imm<<2)|0))>>>0):((i.pc+4)>>>0);
 return {aluControl,aluResult,zero,regWrite,memRead,memWrite,memToReg,aluSrc,branch,destination,nextPc,writeback};
}
