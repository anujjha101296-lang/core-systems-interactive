import { useMemo, useState } from "react";
import { arithmeticResult, arithmeticVerilog } from "@/lib/dl-arithmetic";

export function ArithmeticLab() {
  const [width,setWidth]=useState(4); const [a,setA]=useState(7); const [b,setB]=useState(3); const [subtract,setSubtract]=useState(false);
  const max=2**width-1;
  const report=useMemo(()=>arithmeticResult(Math.min(a,max),Math.min(b,max),width,subtract),[a,b,width,subtract]);
  const setW=(w:number)=>{setWidth(w);setA(Math.min(a,2**w-1));setB(Math.min(b,2**w-1));};
  const field="field mt-1 w-full";
  return <div className="space-y-5">
    <section className="panel p-5"><p className="eyebrow mb-3">Interactive lab · fixed-width ALU arithmetic</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">Operand width<select className={field} value={width} onChange={e=>setW(Number(e.target.value))}>{[4,5,6,8,12,16].map(w=><option key={w} value={w}>{w} bits</option>)}</select></label>
        <label className="block text-sm">Operation<select className={field} value={subtract?"sub":"add"} onChange={e=>setSubtract(e.target.value==="sub")}><option value="add">A + B</option><option value="sub">A − B</option></select></label>
        <label className="block text-sm">A (unsigned encoding)<input className={field} type="number" min={0} max={max} value={Math.min(a,max)} onChange={e=>setA(Math.max(0,Math.min(max,Number(e.target.value)||0)))}/></label>
        <label className="block text-sm">B (unsigned encoding)<input className={field} type="number" min={0} max={max} value={Math.min(b,max)} onChange={e=>setB(Math.max(0,Math.min(max,Number(e.target.value)||0)))}/></label>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[["A",report.a],["B",report.b],["Result",report.result]].map(([label,value])=><div key={String(label)} className="rule-b p-3"><p className="eyebrow">{label}</p><p className="font-mono text-xl">{Number(value)} · 0b{Number(value).toString(2).padStart(width,"0")}</p></div>)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[["Carry out",report.carryOut],["Zero",Number(report.zero)],["Negative",Number(report.negative)],["Signed overflow",Number(report.overflow)],["Signed result",report.signedResult]].map(([label,value])=><div key={String(label)} className="rule-b p-3"><p className="eyebrow">{label}</p><p className={`font-mono text-xl ${label==="Signed overflow"&&value?"text-destructive":""}`}>{value}</p></div>)}
      </div>
      <p className="mt-3 text-sm text-ink-2">{subtract ? "Subtraction uses A + (~B) + 1. Carry-out=1 means no unsigned borrow." : "Addition reports the carry beyond the selected width. Signed overflow is a separate condition."} Signed interpretation: {report.signedA} {subtract?"−":"+"} {report.signedB} = {report.signedA+(subtract?-report.signedB:report.signedB)}, represented as {report.signedResult} in {width}-bit two's complement.</p>
      <p className="mt-2 text-xs text-muted-foreground">Carry-out and signed overflow answer different questions. Example: 4-bit 7 + 3 produces binary 1010, signed −6, and overflow=1 even though unsigned carry-out=0.</p>
    </section>
    <section className="panel p-5"><p className="eyebrow mb-3">Synthesizable SystemVerilog pattern</p><pre className="overflow-x-auto rounded-sm bg-muted p-4 text-xs leading-relaxed"><code>{arithmeticVerilog}</code></pre><p className="mt-3 text-xs text-muted-foreground">The carry flag follows the adder's carry-out convention; for subtraction, carry_out=1 means no unsigned borrow. Signed overflow is computed from operand and result sign bits.</p></section>
  </div>;
}
