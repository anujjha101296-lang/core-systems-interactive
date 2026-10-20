import { useState } from "react";
import { stepMsi, type CoherenceOp, type MsiState } from "@/lib/architecture-coherence";

type Event = { label: string; states: [MsiState, MsiState]; hit: boolean; busEvent: string; explanation: string };
export function ArchitectureCoherenceLab() {
  const [states, setStates] = useState<[MsiState, MsiState]>(["I", "I"]);
  const [events, setEvents] = useState<Event[]>([]);
  const [core, setCore] = useState<0 | 1>(0);
  const [op, setOp] = useState<CoherenceOp>("read");
  const [error, setError] = useState("");
  const run = () => {
    try {
      const r = stepMsi(states, core, op);
      setStates(r.states);
      setEvents(prev => [...prev, { label: `P${core} ${op.toUpperCase()}`, states: r.states, hit: r.hit, busEvent: r.busEvent, explanation: r.explanation }].slice(-12));
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Invalid operation"); }
  };
  const reset = () => { setStates(["I", "I"]); setEvents([]); setError(""); };
  const badge = (state: MsiState) => state === "M" ? "bg-c1 text-background" : state === "S" ? "bg-c2 text-background" : "bg-muted text-muted-foreground";
  return <div className="panel p-5 space-y-5">
    <div><p className="eyebrow">Interactive lab · MSI cache coherence</p><p className="mt-2 text-sm text-muted-foreground">Two private caches, one shared cache line. Step through reads and writes and watch Shared/Modified/Invalid states and bus transactions.</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      {[0,1].map(i=><div key={i} className="rule-b p-4"><p className="eyebrow">Private cache · P{i}</p><span className={`mt-2 inline-flex rounded-sm px-3 py-2 font-mono text-xl ${badge(states[i as 0|1])}`}>{states[i as 0|1]}</span><p className="mt-2 text-xs text-muted-foreground">{states[i as 0|1] === "I" ? "Invalid: no usable copy" : states[i as 0|1] === "S" ? "Shared: clean copy may exist elsewhere" : "Modified: sole owner of a dirty copy"}</p></div>)}
    </div>
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
      <label className="block text-sm">Requesting core<select className="field mt-1 w-full" value={core} onChange={e=>setCore(Number(e.target.value) as 0|1)}><option value={0}>P0</option><option value={1}>P1</option></select></label>
      <label className="block text-sm">Operation<select className="field mt-1 w-full" value={op} onChange={e=>setOp(e.target.value as CoherenceOp)}><option value="read">Read line X</option><option value="write">Write line X</option></select></label>
      <button className="btn btn-primary" onClick={run}>Step</button><button className="btn btn-ghost" onClick={reset}>Reset</button>
    </div>
    {error && <p className="font-mono text-sm text-destructive">{error}</p>}
    <div className="space-y-2"><p className="eyebrow">Bus and ownership trace</p>{events.length===0?<p className="text-sm text-muted-foreground">No operations yet. Try P0 Read → P1 Read → P0 Write → P1 Read.</p>:<ol className="space-y-2">{events.map((e,i)=><li key={i} className="rule-b pb-2"><div className="flex flex-wrap justify-between gap-2 font-mono text-xs"><span>{i+1}. {e.label}</span><span className={e.hit?"text-success":"text-primary"}>{e.hit?"cache hit":"miss / ownership change"}</span></div><p className="mt-1 font-mono text-xs">Bus: {e.busEvent} · state → P0={e.states[0]}, P1={e.states[1]}</p><p className="mt-1 text-sm text-ink-2">{e.explanation}</p></li>)}</ol>}</div>
    <p className="text-xs text-muted-foreground">Teaching scope: one cache line and two cores using a simplified write-invalidate MSI protocol. Real protocols add transient states, interconnect ordering, acknowledgements, multiple lines, and memory-model concerns.</p>
  </div>;
}
