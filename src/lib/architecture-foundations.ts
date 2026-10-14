export type RTypeFields = { opcode:number; rs:number; rt:number; rd:number; shamt:number; funct:number };
function field(value:number,max:number,name:string) { if(!Number.isInteger(value)||value<0||value>max) throw new RangeError(`${name} must be an integer from 0 to ${max}`); }
export function encodeRType(f:RTypeFields):number {
 field(f.opcode,63,"opcode"); field(f.rs,31,"rs"); field(f.rt,31,"rt"); field(f.rd,31,"rd"); field(f.shamt,31,"shamt"); field(f.funct,63,"funct");
 return (((f.opcode<<26)|(f.rs<<21)|(f.rt<<16)|(f.rd<<11)|(f.shamt<<6)|f.funct)>>>0);
}
export function decodeRType(word:number):RTypeFields {
 if(!Number.isInteger(word)||word<0||word>0xffffffff) throw new RangeError("instruction word must be an unsigned 32-bit integer");
 return {opcode:(word>>>26)&0x3f,rs:(word>>>21)&0x1f,rt:(word>>>16)&0x1f,rd:(word>>>11)&0x1f,shamt:(word>>>6)&0x1f,funct:word&0x3f};
}
export function binary32(word:number):string { return word.toString(2).padStart(32,"0"); }
export function hex32(word:number):string { return `0x${word.toString(16).toUpperCase().padStart(8,"0")}`; }
