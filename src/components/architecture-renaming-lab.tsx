import { useMemo, useState } from "react";
import { analyzeRegisterDependencies, renamingPresets } from "@/lib/architecture-renaming";

export function ArchitectureRenamingLab() {
 const [preset,setPreset]=useState<keyof typeof renamingPresets>("falseDependencies");
 const report=useMemo(()=>analyzeRegisterDependencies(renamingPresets[preset]),[preset]);
 const edgeLabel=(kind:string)=>kind==="RAW"?"true dependency":kind==="WAR"?"anti-dependency":"output dependency";
 return <div className="panel p-5 space-y-5">
  <div><p className="eyebrow">Interactive lab · register renaming</p><p className="mt-2 text-sm text-muted-foreground">Architectural registers are names visible to the ISA. A processor can map each destination to a new physical register so older and newer versions no longer collide by name.</p></div>
  <label className="block text-sm">Instruction sequence<select className="field mt-1 w-full" value={preset} onChange={e=>setPreset(e.target.value as keyof typeof renamingPresets)}><option value="falseDependencies">False dependencies (WAR/WAW)</option><option value="trueDependency">True RAW dependency chain</option><option value="repeatedWrites">Repeated destination / WAW</option></select></label>
  <div className="grid gap-3 sm:grid-cols-4">{[["RAW",report.rawCount],["WAR",report.warCount],["WAW",report.wawCount],["Name dependencies removable",report.falseDependenciesRemoved]].map(([k,v])=><div key={String(k)} className="rule-b p-3"><p className="eyebrow">{k}</p><p className="font-mono text-xl">{v}</p></div>)}</div>
  <div className="overflow-x-auto"><table className="w-full text-left font-mono text-xs"><thead><tr className="rule-b"><th className="p-2">Instruction</th><th className="p-2">Reads</th><th className="p-2">Destination rename</th></tr></thead><tbody>{report.renamed.map(row=><tr key={row.index} className="rule-b"><td className="p-2">{row.label}</td><td className="p-2">{row.reads.map(r=>`${r.register}→${r.physical}`).join(", ")||"—"}</td><td className="p-2">{row.architecturalDest? `${row.architecturalDest} → ${row.physicalDest}`:"—"}</td></tr>)}</tbody></table></div>
  <div><p className="eyebrow mb-2">Dependencies in program order</p>{report.edges.length===0?<p className="text-sm text-muted-foreground">No register dependencies detected in this trace.</p>:<ul className="space-y-2">{report.edges.map((e,i)=><li key={i} className="rule-b pb-2 text-sm"><span className="font-mono">I{e.from} → I{e.to}</span> · <span className={e.kind==="RAW"?"text-destructive":"text-primary"}>{e.kind}</span> ({edgeLabel(e.kind)}) on {e.register}</li>)}</ul>}</div>
  <div className="rounded-sm bg-muted p-4 text-sm"><p className="font-medium">What renaming does—and does not do</p><p className="mt-1 text-muted-foreground">Physical destinations separate different versions of the same architectural name and remove WAR/WAW name constraints. A RAW dependency remains because the consumer must receive the correct produced value. This display illustrates name mapping; it does not schedule instructions or simulate a reorder buffer.</p></div>
 </div>;
}
