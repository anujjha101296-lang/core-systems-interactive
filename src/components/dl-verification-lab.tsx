import { useMemo, useState } from "react";
import { analyzeFullAdderVectors, fullAdderTestbench } from "@/lib/dl-verification";

const allVectors="000 001 010 011 100 101 110 111";
export function VerificationLab() {
 const [vectors,setVectors]=useState("000 001 010 011 100 101");
 const report=useMemo(()=>analyzeFullAdderVectors(vectors),[vectors]);
 return <div className="space-y-5">
  <section className="panel p-5"><p className="eyebrow mb-3">Interactive lab · self-checking testbench</p>
   <p className="text-sm text-muted-foreground">Enter three-bit input vectors for a 1-bit full adder. The lab checks each unique vector, reports invalid tokens and duplicates, and measures input-space coverage.</p>
   <label className="mt-4 block text-sm">Vectors (A B Cin as three bits)<textarea className="field mt-2 min-h-24 w-full font-mono" value={vectors} onChange={e=>setVectors(e.target.value)} placeholder="000 001 010 011 100 101 110 111"/></label>
   <div className="mt-3 flex flex-wrap gap-2"><button className="btn btn-primary" onClick={()=>setVectors(allVectors)}>Use exhaustive 8-vector suite</button><button className="btn btn-ghost" onClick={()=>setVectors("000 111")}>Use two directed tests</button><button className="btn btn-ghost" onClick={()=>setVectors("")}>Clear</button></div>
   <div className="mt-5 grid gap-3 sm:grid-cols-4">
    {[["Coverage",`${report.coveragePercent.toFixed(0)}%`],["Vectors covered",`${report.covered}/8`],["Pass",report.passCount],["Fail",report.failCount]].map(([k,v])=><div key={String(k)} className="rule-b p-3"><p className="eyebrow">{k}</p><p className="font-mono text-xl">{v}</p></div>)}
   </div>
   <div className="mt-4 h-3 overflow-hidden rounded-sm bg-muted"><div className="h-full bg-primary transition-all" style={{width:`${report.coveragePercent}%`}}/></div>
   {report.invalid.length>0&&<p className="mt-3 font-mono text-sm text-destructive">Invalid tokens: {report.invalid.join(", ")}</p>}
   {report.duplicateCount>0&&<p className="mt-2 text-sm text-muted-foreground">Ignored {report.duplicateCount} duplicate vector(s); duplicates do not increase coverage.</p>}
   <div className="mt-4 overflow-x-auto"><table className="w-full text-left font-mono text-xs"><thead><tr className="rule-b"><th className="p-2">A B Cin</th><th className="p-2">Sum</th><th className="p-2">Cout</th><th className="p-2">Expected</th><th className="p-2">Result</th></tr></thead><tbody>{report.checks.map(r=><tr key={r.vector} className="rule-b"><td className="p-2">{r.vector}</td><td className="p-2">{r.sum}</td><td className="p-2">{r.cout}</td><td className="p-2">{r.expectedCout}{r.expectedSum}</td><td className={r.pass?"p-2 text-success":"p-2 text-destructive"}>{r.pass?"PASS":"FAIL"}</td></tr>)}</tbody></table></div>
   {report.covered===8&&report.invalid.length===0&&report.failCount===0?<p className="mt-3 text-sm text-success">All eight input vectors covered. This is exhaustive for the combinational input space, but it does not verify timing, reset, or sequential behavior.</p>:<p className="mt-3 text-sm text-muted-foreground">A passing subset does not prove exhaustive behavior. Add missing vectors, and test sequential designs with reset, edge, hold, and transition scenarios.</p>}
  </section>
  <section className="panel p-5"><p className="eyebrow mb-3">SystemVerilog self-checking testbench</p><pre className="overflow-x-auto rounded-sm bg-muted p-4 text-xs leading-relaxed"><code>{fullAdderTestbench}</code></pre><p className="mt-3 text-xs text-muted-foreground">The sample uses a delay for simulation only. Testbench code is not synthesized into the design; use the simulator and timing model appropriate to your project.</p></section>
 </div>;
}
