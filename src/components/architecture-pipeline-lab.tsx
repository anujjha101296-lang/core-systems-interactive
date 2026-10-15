import { useMemo, useState } from "react";
import { scheduleFiveStagePipeline, type PipelineInstruction } from "@/lib/architecture-pipeline";

const stages = ["IF", "ID", "EX", "MEM", "WB"];
const scenarios: { label: string; instructions: PipelineInstruction[] }[] = [
 {label:"ALU result dependency",instructions:[
  {label:"ADD $t0,$t1,$t2",sources:["$t1","$t2"],destination:"$t0"},
  {label:"SUB $t3,$t0,$t4",sources:["$t0","$t4"],destination:"$t3"},
  {label:"AND $t5,$t3,$t6",sources:["$t3","$t6"],destination:"$t5"},
  {label:"OR $t7,$t5,$t8",sources:["$t5","$t8"],destination:"$t7"}
 ]},
 {label:"Load-use dependency",instructions:[
  {label:"LW $t0,0($s0)",sources:["$s0"],destination:"$t0",load:true},
  {label:"ADD $t1,$t0,$t2",sources:["$t0","$t2"],destination:"$t1"},
  {label:"SUB $t3,$t1,$t4",sources:["$t1","$t4"],destination:"$t3"},
  {label:"SW $t3,4($s0)",sources:["$t3","$s0"]}
 ]},
 {label:"Independent instructions",instructions:[
  {label:"ADD $t0,$t1,$t2",sources:["$t1","$t2"],destination:"$t0"},
  {label:"SUB $t3,$t4,$t5",sources:["$t4","$t5"],destination:"$t3"},
  {label:"AND $t6,$t7,$t8",sources:["$t7","$t8"],destination:"$t6"},
  {label:"OR $t9,$s0,$s1",sources:["$s0","$s1"],destination:"$t9"}
 ]}
];
export function ArchitecturePipelineLab() {
 const [scenario,setScenario] = useState(1);
 const [forwarding,setForwarding] = useState(true);
 const selected = scenarios[scenario]!;
 const result = useMemo(()=>scheduleFiveStagePipeline(selected.instructions,forwarding),[selected,forwarding]);
 const maxCycle = Math.max(result.totalCycles,1);
 return <div className="panel p-5 space-y-5">
  <div className="eyebrow">Interactive lab · five-stage pipeline</div>
  <div className="grid gap-4 md:grid-cols-[240px_1fr]">
   <div className="space-y-4">
    <label className="block text-sm"><span className="eyebrow">Instruction sequence</span>
     <select className="field mt-1 w-full" value={scenario} onChange={e=>setScenario(Number(e.target.value))}>
      {scenarios.map((s,i)=><option key={s.label} value={i}>{s.label}</option>)}
     </select>
    </label>
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={forwarding} onChange={e=>setForwarding(e.target.checked)}/><span><strong>Enable forwarding</strong><span className="block text-xs text-muted-foreground">ALU dependencies bypass WB; load-use may still stall.</span></span></label>
    <div className="rule-t pt-3"><div className="eyebrow">Total cycles (model)</div><div className="font-mono text-2xl">{result.totalCycles}</div></div>
    <div className="rule-t pt-3"><div className="eyebrow">Inserted stall cycles</div><div className="font-mono text-2xl">{result.stallCount}</div></div>
    <p className="text-xs text-muted-foreground">Teaching model: five stages, in-order issue, no branch or cache penalties. It models RAW stalls and a one-cycle adjacent load-use penalty with forwarding.</p>
   </div>
   <div className="min-w-0 space-y-4">
    <div className="overflow-x-auto">
     <table className="w-full border-collapse text-center font-mono text-xs">
      <thead><tr><th className="p-2 text-left">Instruction</th>{Array.from({length:maxCycle},(_,i)=><th key={i} className="p-2 text-muted-foreground">{i+1}</th>)}</tr></thead>
      <tbody>{result.rows.map((row,i)=><tr key={row.label} className="border-t border-rule">
       <th className="whitespace-nowrap p-2 text-left font-normal">{row.label}</th>
       {Array.from({length:maxCycle},(_,cycle)=>{
        const stageIndex = row.cycles.indexOf(cycle+1);
        return <td key={cycle} className="p-1"><div className={stageIndex>=0?"rounded-sm bg-c1/20 px-2 py-2 text-foreground":"px-2 py-2 text-muted-foreground"}>{stageIndex>=0?stages[stageIndex]:"·"}</div></td>;
       })}
      </tr>)}</tbody>
     </table>
    </div>
    <div className="rounded-sm border border-rule p-3">
     <div className="eyebrow mb-2">Instruction dependencies</div>
     <ul className="space-y-2 text-sm">{selected.instructions.map((ins,i)=>{
      const deps = selected.instructions.slice(0,i).filter(prev=>prev.destination&&ins.sources.includes(prev.destination));
      return <li key={ins.label}><span className="font-mono">{ins.label}</span><span className="block text-xs text-muted-foreground">{deps.length ? "Reads a value written by " + deps.map(d=>d.label.split(" ")[0]).join(", ") + "." : "No earlier destination register is read by this instruction."}</span></li>;
     })}</ul>
    </div>
   </div>
  </div>
 </div>;
}
