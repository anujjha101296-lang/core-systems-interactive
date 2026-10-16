export type FullAdderCheck = { vector:string; sum:number; cout:number; expectedSum:number; expectedCout:number; pass:boolean };
export type VerificationReport = { checks:FullAdderCheck[]; invalid:string[]; duplicateCount:number; covered:number; totalVectors:number; coveragePercent:number; passCount:number; failCount:number };
export function analyzeFullAdderVectors(raw:string):VerificationReport {
 if(typeof raw!=="string") throw new RangeError("Vector list must be text");
 const tokens=raw.split(/[\s,;]+/).filter(Boolean);
 const invalid:string[]=[], seen=new Set<string>(), checks:FullAdderCheck[]=[];
 let duplicateCount=0;
 for(const token of tokens) {
  if(!/^[01]{3}$/.test(token)) { invalid.push(token); continue; }
  if(seen.has(token)) { duplicateCount++; continue; }
  seen.add(token);
  const [a,b,cin]=token.split("").map(Number);
  const total=a!+b!+cin!;
  const expectedSum=total&1, expectedCout=(total>>1)&1;
  // This reference deliberately uses arithmetic sum; it does not copy the XOR/majority RTL equations.
  const sum=Number((a!^b!^cin!)!==0);
  const cout=Number((a!+b!+cin!)>=2);
  checks.push({vector:token,sum,cout,expectedSum,expectedCout,pass:sum===expectedSum&&cout===expectedCout});
 }
 return {checks,invalid,duplicateCount,covered:seen.size,totalVectors:8,coveragePercent:seen.size/8*100,passCount:checks.filter(c=>c.pass).length,failCount:checks.filter(c=>!c.pass).length};
}
export const fullAdderTestbench = `module tb;
  logic a, b, cin;
  logic sum, cout;
  full_adder dut(.a(a), .b(b), .cin(cin), .sum(sum), .cout(cout));

  initial begin
    for (int v = 0; v < 8; v++) begin
      {a, b, cin} = v[2:0];
      #1;
      if ({cout, sum} !== (a + b + cin))
        $fatal(1, "Mismatch for %b%b%b", a, b, cin);
    end
    $display("PASS: all 8 input vectors");
    $finish;
  end
endmodule`;
