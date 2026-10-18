export type LutRow={index:number;bits:string;output:0|1;};
function int(n:number,name:string,min:number,max:number){if(!Number.isInteger(n)||n<min||n>max)throw new RangeError(`${name} must be an integer from ${min} to ${max}`);}
export function validateLut(truthMask:number,inputBits=4){int(inputBits,"inputBits",1,8);int(truthMask,"truthMask",0,2**(2**inputBits)-1);return {inputBits,entries:2**inputBits,truthMask};}
export function evaluateLut(truthMask:number,inputIndex:number,inputBits=4):0|1{
 const cfg=validateLut(truthMask,inputBits);int(inputIndex,"inputIndex",0,cfg.entries-1);
 return ((truthMask>>inputIndex)&1) as 0|1;
}
export function lutTruthTable(truthMask:number,inputBits=4):LutRow[]{
 const cfg=validateLut(truthMask,inputBits);
 return Array.from({length:cfg.entries},(_,index)=>({index,bits:index.toString(2).padStart(inputBits,"0"),output:evaluateLut(truthMask,index,inputBits)}));
}
export function countLutOnes(truthMask:number,inputBits=4){return lutTruthTable(truthMask,inputBits).reduce((n,row)=>n+row.output,0);}
