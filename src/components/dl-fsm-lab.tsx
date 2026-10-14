import { useMemo, useState } from "react";
import { bitsFromString, detectorNextState, detectorMooreOutput, detectorMealyOutput, type DetectorMode, type DetectorState } from "@/lib/dl-fsm";

const stateNames = ["S0 · no prefix", "S1 · seen 1", "S2 · seen 10", "S3 · seen 101"] as const;
const transitions: { from: DetectorState; input: 0 | 1; to: DetectorState; mealy: 0 | 1 }[] = [
  { from: 0, input: 0, to: 0, mealy: 0 }, { from: 0, input: 1, to: 1, mealy: 0 },
  { from: 1, input: 0, to: 2, mealy: 0 }, { from: 1, input: 1, to: 1, mealy: 0 },
  { from: 2, input: 0, to: 0, mealy: 0 }, { from: 2, input: 1, to: 3, mealy: 1 },
  { from: 3, input: 0, to: 2, mealy: 0 }, { from: 3, input: 1, to: 1, mealy: 0 },
];

export function FsmLab() {
  const [stream, setStream] = useState("110101101");
  const [mode, setMode] = useState<DetectorMode>("mealy");
  const [cursor, setCursor] = useState(0);
  const bits = useMemo(() => { try { return bitsFromString(stream); } catch { return []; } }, [stream]);
  const rows = useMemo(() => {
    let state: DetectorState = 0;
    return bits.map((input, i) => {
      const before = state; const next = detectorNextState(state, input);
      const output = mode === "mealy" ? detectorMealyOutput(state, input) : detectorMooreOutput(next);
      state = next;
      return { i, input, before, next, output };
    });
  }, [bits, mode]);
  const valid = (() => { try { bitsFromString(stream); return true; } catch { return false; } })();
  const shown = rows.slice(0, cursor);
  const matches = shown.filter((r) => r.output === 1).length;
  return <div className="space-y-5">
    <section className="panel p-5">
      <p className="eyebrow mb-3">Interactive lab · overlapping 101 detector</p>
      <p className="mb-4 text-sm text-muted-foreground">Enter a bit stream, choose output timing, then step through the state transitions. State labels describe the longest suffix that is also a prefix of 101.</p>
      <label className="block text-sm"><span className="text-muted-foreground">Input stream</span>
        <input className="field mt-1 w-full font-mono" value={stream} onChange={(e) => { setStream(e.target.value); setCursor(0); }} aria-label="Input bit stream"/>
      </label>
      {!valid && <p className="mt-2 text-sm text-destructive">Use only 0 and 1, with optional spaces or commas.</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {(["mealy", "moore"] as const).map((m) => <button key={m} className={`btn ${mode === m ? "btn-primary" : "btn-ghost"}`} onClick={() => { setMode(m); setCursor(0); }}>{m === "mealy" ? "Mealy · transition output" : "Moore · state output"}</button>)}
        <button className="btn btn-ghost" onClick={() => setCursor(0)}>Reset</button>
        <button className="btn btn-ghost" disabled={!valid || cursor === 0} onClick={() => setCursor(Math.max(0, cursor - 1))}>← Back</button>
        <button className="btn btn-primary" disabled={!valid || cursor >= rows.length} onClick={() => setCursor(Math.min(rows.length, cursor + 1))}>Step →</button>
        <button className="btn btn-ghost" disabled={!valid} onClick={() => setCursor(rows.length)}>Run all</button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rule-b p-3"><p className="eyebrow">Consumed</p><p className="font-mono text-xl">{cursor}/{bits.length}</p></div>
        <div className="rule-b p-3"><p className="eyebrow">Current state</p><p className="font-mono text-xl">S{shown.length ? shown[shown.length - 1]!.next : 0}</p></div>
        <div className="rule-b p-3"><p className="eyebrow">Detection pulses</p><p className="font-mono text-xl">{matches}</p></div>
        <div className="rule-b p-3"><p className="eyebrow">Output timing</p><p className="font-mono text-xl">{mode}</p></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1" aria-label="Input bits">
        {bits.map((b, i) => <span key={i} className={`grid h-9 w-9 place-items-center border font-mono ${i < cursor ? "border-primary bg-primary/10" : "border-rule"} ${i === cursor - 1 ? "ring-2 ring-primary" : ""}`}>{b}</span>)}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full font-mono text-xs"><thead><tr className="rule-b text-left text-muted-foreground"><th className="p-2">#</th><th>State before</th><th>Input</th><th>State after</th><th>Output</th></tr></thead>
          <tbody>{shown.map((r) => <tr key={r.i} className={`rule-b ${r.output ? "text-primary" : ""}`}><td className="p-2">{r.i + 1}</td><td>S{r.before}</td><td>{r.input}</td><td>S{r.next}</td><td>{r.output}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{mode === "mealy" ? "Mealy output is asserted on the input transition that completes 101; it can respond in that cycle." : "Moore output is 1 while the registered state is S3; it changes with state, conventionally after the clock edge."} Overlap is preserved: after detecting 101, the suffix 10 can begin the next match.</p>
    </section>
    <section className="panel p-5">
      <p className="eyebrow mb-3">Transition table · pattern 101</p>
      <div className="overflow-x-auto"><table className="w-full font-mono text-xs"><thead><tr className="rule-b text-left text-muted-foreground"><th className="p-2">Present state</th><th>Input 0 → next/output</th><th>Input 1 → next/output</th><th>Meaning</th></tr></thead><tbody>
        {([0,1,2,3] as DetectorState[]).map((s) => <tr key={s} className="rule-b"><td className="p-2">S{s}</td>{([0,1] as const).map((b) => { const n = detectorNextState(s,b); const o = mode === "mealy" ? detectorMealyOutput(s,b) : detectorMooreOutput(n); return <td key={b}>S{n} / {o}</td>; })}<td>{stateNames[s]}</td></tr>)}
      </tbody></table></div>
      <p className="mt-3 text-sm text-muted-foreground">Moore and Mealy machines can implement the same recognition behavior, but output timing and the number of states may differ depending on the encoding and specification.</p>
    </section>
  </div>;
}
