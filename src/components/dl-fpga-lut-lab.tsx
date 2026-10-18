import { useMemo, useState } from "react";
import { countLutOnes, evaluateLut, lutTruthTable, validateLut } from "@/lib/dl-fpga-lut";
export function FpgaLutLab(){
 const [truthMask,setTruthMask]=useState(0x6996);const [inputIndex,setInputIndex]=useState(9);const [inputBits,setInputBits]=useState(4);
 const result=useMemo(()=>{try{return {rows:lutTruthTable(truthMask,inputBits),output:evaluateLut(truthMask,Math.min(inputIndex,2**inputBits-1),inputBits),ones:countLutOnes(truthMask,inputBits),config:validateLut(truthMask,inputBits),error:""};}catch(e){return {rows:[],output:0 as 0|1,ones:0,config:null,error:e instanceof Error?e.message:"Invalid LUT configuration"};}},[truthMask,inputIndex,inputBits]);
 const field="field mt-1 w-full";
 const toggle=(index:number)=>setTruthMask(mask=>(mask^(1<<index))>>>0);
 return <div className="panel p-5 space-y-5">
  <div><p className="eyebrow">Interactive lab · FPGA lookup table</p><p className="mt-2 text-sm text-muted-foreground">A LUT stores the output for each possible input pattern. Toggle truth-table entries and choose an input to observe the programmed Boolean function.</p></div>
  <div className="grid gap-4 sm:grid-cols-2">
   <label className="block text-sm"><span className="eyebrow">LUT input count</span><select className={field} value={inputBits} onChange={e=>{const n=Number(e.target.value);setInputBits(n);setTruthMask(mask=>mask%(2**(2**n)));setInputIndex(i=>Math.min(i,2**n-1));}}>{[2,3,4,5].map(n=><option key={n} value={n}>{n}-input LUT ({2**n} entries)</option>)}</select></label>
   <label className="block text-sm"><span className="eyebrow">Selected input pattern</span><select className={field} value={Math.min(inputIndex,2**inputBits-1)} onChange={e=>setInputIndex(Number(e.target.value))}>{Array.from({length:2**inputBits},(_,i)=><option key={i} value={i}>{i.toString(2).padStart(inputBits,"0")} (index {i})</option>)}</select></label>
  </div>
  {result.error?<p className="text-sm text-destructive">{result.error}</p>:<>
   <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Input",result.rows.find(r=>r.index===Math.min(inputIndex,2**inputBits-1))?.bits??""],["Output Y",result.output],["Truth-table ones",result.ones],["Stored bits",2**inputBits]].map(([k,v])=><div key={String(k)} className="rule-t pt-2"><p className="eyebrow">{k}</p><p className="font-mono text-xl">{v}</p></div>)}</div>
   <div className="flex flex-wrap gap-2"><button className="btn btn-ghost" onClick={()=>setTruthMask(0)} >Program constant 0</button><button className="btn btn-ghost" onClick={()=>setTruthMask(2**(2**inputBits)-1)}>Program constant 1</button><button className="btn btn-ghost" onClick={()=>setTruthMask(inputBits===4?0x6996:inputBits===3?0x96:inputBits===2?0x6:0x96696996)}>Program parity-like pattern</button></div>
   <div><p className="eyebrow mb-2">Truth table · click Y to reprogram a row</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{result.rows.map(row=><div key={row.index} className={`flex items-center justify-between rounded-sm border p-2 ${row.index===inputIndex?"border-primary bg-primary/10":"border-rule"}`}><button className="font-mono text-xs" onClick={()=>setInputIndex(row.index)}>{row.bits}</button><button className={`rounded-sm px-3 py-1 font-mono ${row.output?"bg-primary text-primary-foreground":"bg-muted"}`} aria-label={`Set output for input ${row.bits}`} onClick={()=>toggle(row.index)}>{row.output}</button></div>)}</div></div>
   <p className="text-sm text-ink-2">The LUT is a truth-table memory: input pattern {result.rows.find(r=>r.index===Math.min(inputIndex,2**inputBits-1))?.bits} addresses one stored bit, producing Y={result.output}. Reprogramming a row changes the Boolean function without rewiring gates.</p>
  </>}
  <p className="text-xs text-muted-foreground">This models the logical behavior of a LUT, not FPGA placement, routing, configuration bitstream generation, timing closure, or a specific vendor's LUT primitive. Real FPGA designs combine LUTs with flip-flops, routing, clock networks, block RAM and dedicated DSP resources.</p>
 </div>;
}
