export type ArithmeticResult = { width: number; a: number; b: number; subtract: boolean; result: number; carryOut: 0 | 1; zero: boolean; negative: boolean; overflow: boolean; signedA: number; signedB: number; signedResult: number };
function validateWidth(width:number) { if(!Number.isInteger(width)||width<1||width>16) throw new RangeError("Width must be an integer from 1 to 16"); }
function validateOperand(n:number,width:number,name:string) { if(!Number.isInteger(n)||n<0||n>=2**width) throw new RangeError(`${name} must be an unsigned ${width}-bit value`); }
export function signedValue(n:number,width:number) { validateWidth(width); validateOperand(n,width,"value"); const sign=2**(width-1); return n>=sign?n-2**width:n; }
/** Fixed-width two's-complement add/subtract. For subtraction, carryOut=1 means no unsigned borrow. */
export function arithmeticResult(a:number,b:number,width:number,subtract=false):ArithmeticResult {
 validateWidth(width); validateOperand(a,width,"a"); validateOperand(b,width,"b");
 if(typeof subtract!=="boolean") throw new RangeError("subtract must be boolean");
 const modulus=2**width, mask=modulus-1, rhs=subtract?(~b&mask):b;
 const wide=a+rhs+(subtract?1:0), result=wide&mask, carryOut=(wide>=modulus?1:0) as 0|1;
 const sa=signedValue(a,width), sb=signedValue(b,width), sr=signedValue(result,width);
 const overflow=subtract ? (sa>=0)!==(sb>=0) && (sr>=0)!==(sa>=0) : (sa>=0)===(sb>=0) && (sr>=0)!==(sa>=0);
 return {width,a,b,subtract,result,carryOut,zero:result===0,negative:(result&(2**(width-1)))!==0,overflow,signedA:sa,signedB:sb,signedResult:sr};
}
export const arithmeticVerilog = `module add_sub #(parameter int W = 4) (
  input  logic [W-1:0] a, b,
  input  logic         sub,
  output logic [W-1:0] y,
  output logic         carry_out,
  output logic         overflow,
  output logic         zero,
  output logic         negative
);
  logic [W:0] wide;
  always_comb begin
    wide = {1'b0, a} + {1'b0, (b ^ {W{sub}})} + sub;
    y = wide[W-1:0];
    carry_out = wide[W];
    zero = (y == '0);
    negative = y[W-1];
    if (sub)
      overflow = (a[W-1] ^ b[W-1]) & (y[W-1] ^ a[W-1]);
    else
      overflow = ~(a[W-1] ^ b[W-1]) & (y[W-1] ^ a[W-1]);
  end
endmodule`;
