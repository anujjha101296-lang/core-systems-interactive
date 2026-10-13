import { useMemo, useState } from "react";
import { alu, decodeNTo2N, demux1, fullAdder, halfAdder, mux2, rippleCarryAdd } from "@/lib/dl-combinational";

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => <section className="panel p-5"><p className="eyebrow mb-4">Interactive lab · {title}</p>{children}</section>;
const Field = ({ label, value, set, min = 0, max }: { label: string; value: number; set: (n: number) => void; min?: number; max: number }) => <label className="block text-sm"><span className="text-muted-foreground">{label}</span><input className="field mt-1 w-full" type="number" min={min} max={max} value={value} onChange={(e) => set(Math.max(min, Math.min(max, Number(e.target.value) || 0)))} /></label>;
export function CombinationalLab() {
  const [a,setA] = useState(5); const [b,setB] = useState(3); const [width,setWidth] = useState(4); const [op,setOp] = useState<"AND"|"OR"|"XOR"|"ADD"|"SUB"|"NOT">("ADD");
  const [sel,setSel] = useState(0); const [d0,setD0] = useState(0); const [d1,setD1] = useState(1); const [dec,setDec] = useState(2);
  const [fa,setFa] = useState(1); const [fb,setFb] = useState(1); const [fc,setFc] = useState(0);
  const limit = 2 ** width - 1;
  const result = useMemo(() => alu(a,b,width,op),[a,b,width,op]);
  const ripple = useMemo(() => rippleCarryAdd(a,b,width),[a,b,width]);
  const ha = halfAdder(fa as 0|1,fb as 0|1); const faOut = fullAdder(fa as 0|1,fb as 0|1,fc as 0|1);
  return <div className="space-y-5">
    <Panel title="2:1 multiplexer and 1:2 demultiplexer">
      <p className="mb-3 text-sm text-muted-foreground">A MUX selects one input; a DEMUX routes one input to exactly one output.</p>
      <div className="grid gap-3 sm:grid-cols-3"><Field label="Input D0" value={d0} max={1} set={setD0}/><Field label="Input D1" value={d1} max={1} set={setD1}/><Field label="Select S" value={sel} max={1} set={setSel}/></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rule-b p-3 font-mono text-sm">MUX Y = {mux2(d0 as 0|1,d1 as 0|1,sel as 0|1)}</div><div className="rule-b p-3 font-mono text-sm">DEMUX (Y0,Y1) = ({demux1(1,sel as 0|1).join(", ")})</div></div>
      <p className="mt-2 text-xs text-muted-foreground">For a MUX, Y = S·D1 + S'·D0. The DEMUX output pair always contains exactly one asserted output when data=1.</p>
    </Panel>
    <Panel title="Half adder and full adder">
      <div className="grid gap-3 sm:grid-cols-3"><Field label="A" value={fa} max={1} set={setFa}/><Field label="B" value={fb} max={1} set={setFb}/><Field label="Carry-in" value={fc} max={1} set={setFc}/></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rule-b p-3 font-mono text-sm"><b>Half adder</b><p>Sum = {ha.sum}, Carry = {ha.carry}</p><p className="text-xs text-muted-foreground">S=A⊕B; C=AB</p></div><div className="rule-b p-3 font-mono text-sm"><b>Full adder</b><p>Sum = {faOut.sum}, Carry = {faOut.carry}</p><p className="text-xs text-muted-foreground">S=A⊕B⊕Cin</p></div></div>
    </Panel>
    <Panel title="Ripple-carry adder">
      <div className="grid gap-3 sm:grid-cols-3"><Field label="Unsigned A" value={a} max={limit} set={setA}/><Field label="Unsigned B" value={b} max={limit} set={setB}/><label className="block text-sm"><span className="text-muted-foreground">Width</span><select className="field mt-1 w-full" value={width} onChange={e=>{const w=Number(e.target.value);setWidth(w);setA(v=>Math.min(v,2**w-1));setB(v=>Math.min(v,2**w-1));}}>{[2,3,4,8].map(w=><option key={w} value={w}>{w} bits</option>)}</select></label></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rule-b p-3"><p className="eyebrow">A + B</p><p className="font-mono text-xl">{ripple.sum.toString(2).padStart(width,"0")}</p></div><div className="rule-b p-3"><p className="eyebrow">Carry-out</p><p className="font-mono text-xl">{ripple.carry}</p></div><div className="rule-b p-3"><p className="eyebrow">Decimal</p><p className="font-mono text-xl">{ripple.sum} (stored)</p></div></div>
      <div className="mt-3 space-y-1">{ripple.stages.map(s=><div key={s.bit} className="font-mono text-xs text-muted-foreground">Bit {s.bit}: {s.a} + {s.b} + carry {s.cin} → sum {s.sum}, carry {s.cout}</div>)}</div>
      <p className="mt-3 text-xs text-muted-foreground">The carry ripples from bit 0 (LSB) upward. Carry-out is the unsigned overflow flag; it is not the same as signed two's-complement overflow.</p>
    </Panel>
    <Panel title="Decoder and ALU">
      <div className="grid gap-3 sm:grid-cols-2"><Field label="2-bit decoder input (0–3)" value={dec} max={3} set={setDec}/><div className="rule-b p-3 font-mono text-sm">One-hot output: {decodeNTo2N(dec,2).toString(2).padStart(4,"0")}</div></div>
      <label className="mt-3 block text-sm"><span className="text-muted-foreground">ALU operation</span><select className="field mt-1 w-full" value={op} onChange={e=>setOp(e.target.value as typeof op)}>{["AND","OR","XOR","ADD","SUB","NOT"].map(x=><option key={x}>{x}</option>)}</select></label>
      <div className="mt-3 grid gap-3 sm:grid-cols-3"><div className="rule-b p-3 font-mono text-sm">Result: {result.result} (0b{result.result.toString(2).padStart(width,"0")})</div><div className="rule-b p-3 font-mono text-sm">Zero: {Number(result.zero)}</div><div className="rule-b p-3 font-mono text-sm">Carry: {Number(result.carry)}</div></div>
      <p className="mt-3 text-xs text-muted-foreground">ALU results are width-limited. SUB carry is defined here as “no borrow” (A ≥ B); the negative flag is the result MSB under the selected width.</p>
    </Panel>
  </div>;
}
