import { useMemo, useState } from "react";
import { parseBranchTrace, simulateBranchPrediction, type PredictorKind } from "@/lib/architecture-branch-prediction";

const presets:Record<string,string>={loop:"T T T T T T T N",alternating:"T N T N T N T N",bursty:"T T N T T N T T N",mostlyTaken:"T T T T N T T T T N"};
export function ArchitectureBranchPredictionLab() {
 const [trace,setTrace]=useState(presets.loop); const [kind,setKind]=useState<PredictorKind>("two-bit"); const [penalty,setPenalty]=useState(2);
 const result=useMemo(()=>{try{const outcomes=parseBranchTrace(trace);return {report:simulateBranchPrediction(kind,outcomes,penalty),error:""};}catch(e){return {report:null,error:e instanceof Error?e.message:"Invalid trace"};}},[trace,kind,penalty]);
 const field="field mt-1 w-full";
 return <div className="panel p-5 space-y-5">
  <div><p className="eyebrow">Interactive lab · dynamic branch prediction</p><p className="mt-2 text-sm text-muted-foreground">T = branch taken, N = branch not taken. Compare static predictions with a one-bit predictor and a two-bit saturating counter. The starting state is stated explicitly for reproducible traces.</p></div>
  <div className="grid gap-4 sm:grid-cols-2">
   <label className="block text-sm">Predictor<select className={field} value={kind} onChange={e=>setKind(e.target.value as PredictorKind)}><option value="always-not-taken">Static: always N</option><option value="always-taken">Static: always T</option><option value="one-bit">Dynamic: one-bit history</option><option value="two-bit">Dynamic: two-bit saturating counter</option></select></label>
   <label className="block text-sm">Misprediction penalty<input className={field} type="number" min={0} max={100} value={penalty} onChange={e=>setPenalty(Math.max(0,Math.min(100,Math.floor(Number(e.target.value)||0))))}/> <span className="text-xs text-muted-foreground">cycles per misprediction</span></label>
   <label className="block text-sm sm:col-span-2">Branch outcomes<textarea className={field+" min-h-20 font-mono"} value={trace} onChange={e=>setTrace(e.target.value)} placeholder="T T T N T N"/></label>
  </div>
  <div className="flex flex-wrap gap-2">{Object.entries(presets).map(([name,value])=><button key={name} className="btn btn-ghost" onClick={()=>setTrace(value)}>{name}</button>)}</div>
  {result.error?<p className="text-sm text-destructive">{result.error}</p>:result.report&&<>
   <div className="grid gap-3 sm:grid-cols-4">{[["Branches",result.report.branches],["Mispredictions",result.report.mispredictions],["Accuracy",result.report.accuracy.toFixed(1)+"%"],["Penalty cycles",result.report.penaltyCycles]].map(([k,v])=><div key={String(k)} className="rule-b p-3"><p className="eyebrow">{k}</p><p className="font-mono text-xl">{v}</p></div>)}</div>
   <div className="overflow-x-auto"><table className="w-full text-left font-mono text-xs"><thead><tr className="rule-b"><th className="p-2">#</th><th className="p-2">State before</th><th className="p-2">Predict</th><th className="p-2">Actual</th><th className="p-2">State after</th><th className="p-2">Outcome</th></tr></thead><tbody>{result.report.steps.map(s=><tr key={s.index} className="rule-b"><td className="p-2">{s.index}</td><td className="p-2">{s.stateBefore===null?"—":s.stateBefore}</td><td className="p-2">{s.prediction}</td><td className="p-2">{s.outcome}</td><td className="p-2">{s.stateAfter===null?"—":s.stateAfter}</td><td className={s.correct?"p-2 text-success":"p-2 text-destructive"}>{s.correct?"correct":`miss (+${s.penaltyCycles})`}</td></tr>)}</tbody></table></div>
   <p className="text-sm text-ink-2">Modeled branch penalty: {result.report.penaltyCycles} cycles total, or {result.report.averagePenaltyPerBranch.toFixed(2)} cycles per branch. This isolates prediction accuracy; it does not model fetch width, speculative execution, branch target buffers, or overlapping penalties.</p>
  </>}
  <div className="rounded-sm bg-muted p-4 text-sm"><p className="font-medium">Predictor state convention</p><p className="mt-1 text-muted-foreground">One-bit predictor starts at not-taken and remembers the last outcome. Two-bit predictor starts weakly not-taken: 0=strong N, 1=weak N, 2=weak T, 3=strong T. Correct taken increments toward 3; not-taken decrements toward 0.</p></div>
 </div>;
}
