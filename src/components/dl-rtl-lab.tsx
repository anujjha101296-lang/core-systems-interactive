import { useMemo, useState } from "react";
import { rtlSnippets, simulateRtl, type RtlExample } from "@/lib/dl-rtl";

export function RtlLab() {
  const [example, setExample] = useState<RtlExample>("mux2");
  const [a, setA] = useState(0); const [b, setB] = useState(1); const [sel, setSel] = useState(0);
  const [cin, setCin] = useState(0); const [d, setD] = useState(1); const [en, setEn] = useState(1);
  const [reset, setReset] = useState(0); const [q, setQ] = useState(0);
  const report = useMemo(() => {
    if (example === "mux2") return simulateRtl(example, { a, b, sel });
    if (example === "full-adder") return simulateRtl(example, { a, b, cin });
    return simulateRtl(example, { d, en, reset, q });
  }, [example, a, b, sel, cin, d, en, reset, q]);
  const Toggle = ({ label, value, set }: { label: string; value: number; set: (v: number) => void }) => (
    <label className="flex items-center justify-between gap-3 text-sm"><span>{label}</span><button type="button" className={`btn ${value ? "btn-primary" : "btn-ghost"}`} aria-pressed={value === 1} onClick={() => set(value ? 0 : 1)}>{value}</button></label>
  );
  return <div className="space-y-5">
    <section className="panel p-5">
      <p className="eyebrow mb-3">RTL workbench · reference model</p>
      <label className="block text-sm">Circuit<select className="field mt-2 w-full" value={example} onChange={e => setExample(e.target.value as RtlExample)}>
        <option value="mux2">2:1 multiplexer (combinational)</option><option value="full-adder">1-bit full adder (combinational)</option><option value="d-flop">Enabled D flip-flop (sequential)</option>
      </select></label>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {example === "mux2" && <><Toggle label="a" value={a} set={setA}/><Toggle label="b" value={b} set={setB}/><Toggle label="select" value={sel} set={setSel}/></>}
        {example === "full-adder" && <><Toggle label="a" value={a} set={setA}/><Toggle label="b" value={b} set={setB}/><Toggle label="carry-in" value={cin} set={setCin}/></>}
        {example === "d-flop" && <><Toggle label="d input" value={d} set={setD}/><Toggle label="enable" value={en} set={setEn}/><Toggle label="synchronous reset" value={reset} set={setReset}/><Toggle label="current q" value={q} set={setQ}/></>}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">{Object.entries(report.outputs).map(([name,value])=><div key={name} className="rule-b p-3"><p className="eyebrow">{name}</p><p className="font-mono text-2xl">{value}</p></div>)}</div>
      <p className="mt-3 text-sm text-ink-2">{report.explanation}</p>
      {example === "d-flop" && <p className="mt-2 text-xs text-muted-foreground">This predicts q after the next rising edge. In hardware, q does not change immediately when d/en/reset changes; reset here is synchronous.</p>}
    </section>
    <section className="panel p-5"><p className="eyebrow mb-3">SystemVerilog reference</p><pre className="overflow-x-auto rounded-sm bg-muted p-4 text-xs leading-relaxed"><code>{rtlSnippets[example]}</code></pre><p className="mt-3 text-xs text-muted-foreground">The browser runs a small reference model, not a Verilog compiler or event-driven simulator. Compile the snippet and verify it with a testbench in a real HDL toolchain.</p></section>
  </div>;
}
