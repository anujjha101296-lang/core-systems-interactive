import { useMemo, useState, type ReactNode } from "react";
import type { TraceStep } from "@/content/types";
import { BaseConv, Twos, Ieee, BoolLab, KMapLab } from "./dl-labs";
import { CombinationalLab } from "./dl-combinational-lab";
import { SequentialLab } from "./dl-sequential-lab";
import { RegistersLab } from "./dl-registers-lab";
import { FsmLab } from "./dl-fsm-lab";
import { TimingLab } from "./dl-timing-lab";
import { ArchitectureFoundationsLab } from "./architecture-foundations-lab";
import { ArchitectureDatapathLab } from "./architecture-datapath-lab";
import { ArchitecturePerformanceLab } from "./architecture-performance-lab";
import { ArchitecturePipelineLab } from "./architecture-pipeline-lab";
import { ArchitectureCacheLab } from "./architecture-cache-lab";
import { ArchitectureVmLab } from "./architecture-vm-lab";
import { ArchitectureCoherenceLab } from "./architecture-coherence-lab";
import { ArchitectureIoLab } from "./architecture-io-lab";

function Slider({ label, value, set, min, max, step = 1, unit = "" }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string }) {
  return (
    <label className="block">
      <span className="flex justify-between font-mono text-xs"><span className="text-muted-foreground">{label}</span><span>{value}{unit}</span></span>
      <input type="range" className="w-full accent-[var(--primary)]" min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)} />
    </label>
  );
}
const Stat = ({ k, v }: { k: string; v: ReactNode }) => (
  <div className="rule-t pt-2"><div className="eyebrow">{k}</div><div className="font-mono text-lg">{v}</div></div>
);
const Shell = ({ children, controls, title }: { children: ReactNode; controls?: ReactNode; title: string }) => (
  <div className="panel p-5">
    <div className="eyebrow mb-4">Lab · {title}</div>
    <div className="grid gap-6 md:grid-cols-[240px_1fr]"><div className="space-y-4">{controls}</div><div className="min-w-0">{children}</div></div>
  </div>
);

function CtxSwitch() {
  const [q, setQ] = useState(4000); const [s, setS] = useState(5); const [refill, setRefill] = useState(10); const [n, setN] = useState(8);
  const cost = s + refill; const over = cost / (q + cost); const wait = (n - 1) * (q + cost) / 1000;
  return (
    <Shell title="Context switch overhead" controls={<>
      <Slider label="Quantum q" value={q} set={setQ} min={10} max={10000} step={10} unit=" µs" />
      <Slider label="Direct switch cost s" value={s} set={setS} min={1} max={100} unit=" µs" />
      <Slider label="Cache/TLB refill" value={refill} set={setRefill} min={0} max={100} unit=" µs" />
      <Slider label="Runnable threads N" value={n} set={setN} min={2} max={200} />
    </>}>
      <div className="flex h-10 w-full overflow-hidden rounded-sm border border-rule">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex h-full" style={{ flex: 1 }}>
            <div className="h-full bg-c1/70" style={{ flex: q }} title="useful work" />
            <div className="h-full bg-destructive" style={{ flex: cost }} title="switch" />
          </div>
        ))}
      </div>
      <p className="mt-1 font-mono text-xs text-muted-foreground">blue = work · red = switch + refill (to scale)</p>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Stat k="Overhead" v={`${(over * 100).toFixed(2)}%`} />
        <Stat k="Useful CPU" v={`${((1 - over) * 100).toFixed(2)}%`} />
        <Stat k="Worst wait" v={`${wait.toFixed(2)} ms`} />
      </div>
      <p className="mt-4 text-sm text-ink-2">overhead = (s + refill) / (q + s + refill). Shrink q below ~100 µs and watch overhead dominate.</p>
    </Shell>
  );
}

type P = { id: string; at: number; bt: number };
function Scheduler() {
  const [ps, setPs] = useState<P[]>([{ id: "P1", at: 0, bt: 8 }, { id: "P2", at: 1, bt: 4 }, { id: "P3", at: 2, bt: 9 }, { id: "P4", at: 3, bt: 5 }]);
  const [algo, setAlgo] = useState<"FCFS" | "SJF" | "SRTF" | "RR">("FCFS"); const [qt, setQt] = useState(2);
  const { gantt, rows } = useMemo(() => {
    const rem: Record<string, number> = {}; ps.forEach((p) => (rem[p.id] = p.bt));
    const g: { id: string; s: number; e: number }[] = []; const ct: Record<string, number> = {}; const first: Record<string, number> = {};
    let t = 0; const done = new Set<string>(); const queue: string[] = []; const arrived = new Set<string>();
    const arrive = () => ps.filter((p) => p.at <= t && !arrived.has(p.id)).sort((a, b) => a.at - b.at).forEach((p) => { arrived.add(p.id); queue.push(p.id); });
    let guard = 0;
    while (done.size < ps.length && guard++ < 1000) {
      arrive();
      const ready = ps.filter((p) => p.at <= t && !done.has(p.id));
      if (!ready.length) { t = Math.min(...ps.filter((p) => !done.has(p.id)).map((p) => p.at)); continue; }
      let pick: string; let run: number;
      if (algo === "RR") { pick = queue.shift()!; run = Math.min(qt, rem[pick]!); }
      else if (algo === "FCFS") { pick = ready.sort((a, b) => a.at - b.at)[0]!.id; run = rem[pick]!; }
      else if (algo === "SJF") { pick = ready.sort((a, b) => rem[a.id]! - rem[b.id]! || a.at - b.at)[0]!.id; run = rem[pick]!; }
      else { pick = ready.sort((a, b) => rem[a.id]! - rem[b.id]! || a.at - b.at)[0]!.id; run = 1; }
      if (first[pick] === undefined) first[pick] = t;
      const last = g[g.length - 1];
      if (last && last.id === pick && last.e === t) last.e += run; else g.push({ id: pick, s: t, e: t + run });
      t += run; rem[pick] = rem[pick]! - run;
      if (algo === "RR") { arrive(); if (rem[pick]! > 0) queue.push(pick); }
      if (rem[pick]! === 0) { done.add(pick); ct[pick] = t; }
    }
    const rows = ps.map((p) => ({ ...p, ct: ct[p.id]!, tat: ct[p.id]! - p.at, wt: ct[p.id]! - p.at - p.bt, rt: first[p.id]! - p.at }));
    return { gantt: g, rows };
  }, [ps, algo, qt]);
  const end = gantt.length ? gantt[gantt.length - 1]!.e : 1;
  const colors = ["bg-c1", "bg-c2", "bg-c3", "bg-c4"];
  const avg = (k: "wt" | "tat" | "rt") => (rows.reduce((a, r) => a + r[k], 0) / rows.length).toFixed(2);
  return (
    <Shell title="CPU scheduling" controls={<>
      <div className="flex flex-wrap gap-1">{(["FCFS", "SJF", "SRTF", "RR"] as const).map((a) => <button key={a} className={`btn ${algo === a ? "btn-primary" : "btn-ghost"}`} onClick={() => setAlgo(a)}>{a}</button>)}</div>
      {algo === "RR" && <Slider label="Quantum" value={qt} set={setQt} min={1} max={10} />}
      {ps.map((p, i) => (
        <div key={p.id} className="flex items-center gap-2 font-mono text-xs"><span className="w-6">{p.id}</span>
          <input aria-label={`${p.id} arrival`} className="field w-14" type="number" min={0} value={p.at} onChange={(e) => setPs(ps.map((x, j) => j === i ? { ...x, at: Math.max(0, +e.target.value) } : x))} />
          <input aria-label={`${p.id} burst`} className="field w-14" type="number" min={1} value={p.bt} onChange={(e) => setPs(ps.map((x, j) => j === i ? { ...x, bt: Math.max(1, +e.target.value) } : x))} />
        </div>))}
      <p className="font-mono text-xs text-muted-foreground">arrival · burst</p>
    </>}>
      <div className="flex h-10 w-full overflow-hidden rounded-sm border border-rule">
        {gantt.map((g, i) => <div key={i} className={`${colors[ps.findIndex((p) => p.id === g.id) % 4]} flex items-center justify-center border-r border-background font-mono text-xs text-background`} style={{ width: `${((g.e - g.s) / end) * 100}%` }}>{g.id}</div>)}
      </div>
      <div className="relative h-5 font-mono text-[10px] text-muted-foreground">{[0, ...gantt.map((g) => g.e)].map((t, i) => <span key={i} className="absolute" style={{ left: `${(t / end) * 100}%` }}>{t}</span>)}</div>
      <table className="mt-4 w-full font-mono text-xs"><thead><tr className="rule-b text-left text-muted-foreground"><th>P</th><th>AT</th><th>BT</th><th>CT</th><th>TAT</th><th>WT</th><th>RT</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className="rule-b"><td>{r.id}</td><td>{r.at}</td><td>{r.bt}</td><td>{r.ct}</td><td>{r.tat}</td><td>{r.wt}</td><td>{r.rt}</td></tr>)}</tbody></table>
      <div className="mt-4 grid grid-cols-3 gap-4"><Stat k="Avg WT" v={avg("wt")} /><Stat k="Avg TAT" v={avg("tat")} /><Stat k="Avg RT" v={avg("rt")} /></div>
    </Shell>
  );
}

function VM() {
  const [tlbSize, setTlbSize] = useState(4); const [frames, setFrames] = useState(4);
  const [seq, setSeq] = useState("0x1A20 0x1B00 0x2004 0x1A40 0x3F00 0x4010 0x2008 0x5000 0x1A00 0x6000");
  const [step, setStep] = useState(99);
  const sim = useMemo(() => {
    const addrs = seq.split(/[\s,]+/).filter(Boolean).map((a) => parseInt(a, a.startsWith("0x") ? 16 : 10)).filter((n) => !isNaN(n));
    const tlb: number[] = []; const mem: number[] = []; const out: { a: number; vpn: number; off: number; ev: string; frame: number }[] = [];
    let h = 0, m = 0, f = 0;
    for (const a of addrs) {
      const vpn = a >> 12; const off = a & 0xfff; let ev: string;
      if (tlb.includes(vpn)) { ev = "TLB hit"; h++; tlb.splice(tlb.indexOf(vpn), 1); tlb.push(vpn); }
      else {
        m++;
        if (mem.includes(vpn)) { ev = "TLB miss → walk"; mem.splice(mem.indexOf(vpn), 1); mem.push(vpn); }
        else { ev = "PAGE FAULT"; f++; if (mem.length >= frames) mem.shift(); mem.push(vpn); }
        tlb.push(vpn); if (tlb.length > tlbSize) tlb.shift();
      }
      out.push({ a, vpn, off, ev, frame: mem.indexOf(vpn) });
    }
    return { out, h, m, f, n: addrs.length };
  }, [seq, tlbSize, frames]);
  const shown = sim.out.slice(0, step);
  const eat = sim.n ? (sim.h * 101 + (sim.m - sim.f) * 201 + sim.f * 100000) / sim.n : 0;
  return (
    <Shell title="Virtual memory / TLB" controls={<>
      <Slider label="TLB entries" value={tlbSize} set={setTlbSize} min={1} max={8} />
      <Slider label="Physical frames" value={frames} set={setFrames} min={1} max={8} />
      <label className="block"><span className="eyebrow">Addresses (4 KB pages)</span><textarea className="field mt-1 h-24 w-full" value={seq} onChange={(e) => setSeq(e.target.value)} /></label>
      <div className="flex gap-2"><button className="btn btn-ghost" onClick={() => setStep(Math.max(0, Math.min(step, sim.n) - 1))}>← Step</button><button className="btn btn-ghost" onClick={() => setStep(Math.min(sim.n, step + 1))}>Step →</button><button className="btn btn-ghost" onClick={() => setStep(99)}>All</button></div>
    </>}>
      <table className="w-full font-mono text-xs"><thead><tr className="rule-b text-left text-muted-foreground"><th>addr</th><th>VPN</th><th>offset</th><th>event</th></tr></thead>
        <tbody>{shown.map((r, i) => <tr key={i} className="rule-b"><td>0x{r.a.toString(16).toUpperCase()}</td><td>{r.vpn}</td><td>0x{r.off.toString(16).toUpperCase().padStart(3, "0")}</td>
          <td className={r.ev === "TLB hit" ? "text-success" : r.ev === "PAGE FAULT" ? "text-destructive" : "text-warn"}>{r.ev}</td></tr>)}</tbody></table>
      <div className="mt-4 grid grid-cols-4 gap-4"><Stat k="TLB hits" v={sim.h} /><Stat k="Walks" v={sim.m - sim.f} /><Stat k="Faults" v={sim.f} /><Stat k="EAT*" v={`${eat.toFixed(0)} ns`} /></div>
      <p className="mt-3 text-xs text-muted-foreground">*hit 101 ns, walk 201 ns, fault ≈ 100 µs (SSD). LRU for TLB and frames. Shrink frames below the working set to watch thrashing.</p>
    </Shell>
  );
}

function ProdCons() {
  const [N, setN] = useState(6); const [count, setCount] = useState(0); const [log, setLog] = useState<string[]>([]);
  const [pr, setPr] = useState(3); const [cr, setCr] = useState(2); const [blockedP, setBP] = useState(0); const [blockedC, setBC] = useState(0); const [ticks, setTicks] = useState(0);
  const tick = () => {
    let c = count; let bp = 0, bc = 0;
    for (let i = 0; i < pr; i++) { if (c < N) c++; else bp++; }
    for (let i = 0; i < cr; i++) { if (c > 0) c--; else bc++; }
    setCount(c); setBP(blockedP + bp); setBC(blockedC + bc); setTicks(ticks + 1);
    setLog([`t${ticks + 1}: full=${c} empty=${N - c}${bp ? ` · ${bp} producer waits` : ""}${bc ? ` · ${bc} consumer waits` : ""}`, ...log].slice(0, 8));
  };
  return (
    <Shell title="Bounded buffer" controls={<>
      <Slider label="Buffer N" value={N} set={(v) => { setN(v); setCount(Math.min(count, v)); }} min={1} max={16} />
      <Slider label="Produce / tick" value={pr} set={setPr} min={0} max={6} />
      <Slider label="Consume / tick" value={cr} set={setCr} min={0} max={6} />
      <div className="flex gap-2"><button className="btn btn-primary" onClick={tick}>Tick</button><button className="btn btn-ghost" onClick={() => { setCount(0); setLog([]); setBP(0); setBC(0); setTicks(0); }}>Reset</button></div>
    </>}>
      <div className="flex gap-1">{Array.from({ length: N }).map((_, i) => <div key={i} className={`h-10 flex-1 rounded-sm border border-rule ${i < count ? "bg-c2" : ""}`} />)}</div>
      <div className="mt-4 grid grid-cols-4 gap-4"><Stat k="full" v={count} /><Stat k="empty" v={N - count} /><Stat k="P waits" v={blockedP} /><Stat k="C waits" v={blockedC} /></div>
      <ul className="mt-4 space-y-0.5 font-mono text-xs text-muted-foreground">{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
    </Shell>
  );
}

function Race() {
  const [ops, setOps] = useState<("A" | "B")[]>([]);
  const st = useMemo(() => {
    let mem = 0; const reg = { A: 0, B: 0 }; const pc = { A: 0, B: 0 }; const lines: string[] = [];
    for (const t of ops) {
      const k = pc[t]; if (k >= 3) continue;
      if (k === 0) { reg[t] = mem; lines.push(`${t}: load  r=${mem}`); }
      if (k === 1) { reg[t]++; lines.push(`${t}: add   r=${reg[t]}`); }
      if (k === 2) { mem = reg[t]; lines.push(`${t}: store count=${mem}`); }
      pc[t]++;
    }
    return { mem, reg, pc, lines };
  }, [ops]);
  const doneAll = st.pc.A === 3 && st.pc.B === 3;
  const step = (t: "A" | "B") => st.pc[t] < 3 && setOps([...ops, t]);
  return (
    <Shell title="count++ interleavings" controls={<>
      <p className="text-sm text-ink-2">Each thread runs load → add → store. You are the scheduler.</p>
      <div className="flex gap-2"><button className="btn btn-primary" disabled={st.pc.A >= 3} onClick={() => step("A")}>Run A</button><button className="btn btn-primary" disabled={st.pc.B >= 3} onClick={() => step("B")}>Run B</button></div>
      <div className="flex flex-wrap gap-2"><button className="btn btn-ghost" onClick={() => setOps(["A", "B", "A", "B", "A", "B"])}>Preset: lost update</button><button className="btn btn-ghost" onClick={() => setOps(["A", "A", "A", "B", "B", "B"])}>Preset: serial</button><button className="btn btn-ghost" onClick={() => setOps([])}>Reset</button></div>
    </>}>
      <div className="grid grid-cols-3 gap-4"><Stat k="count (memory)" v={st.mem} /><Stat k="A.reg / pc" v={`${st.reg.A} / ${st.pc.A}`} /><Stat k="B.reg / pc" v={`${st.reg.B} / ${st.pc.B}`} /></div>
      <ol className="mt-4 space-y-0.5 font-mono text-xs">{st.lines.map((l, i) => <li key={i} className={l.startsWith("A") ? "text-c1" : "text-c4"}>{i + 1}. {l}</li>)}</ol>
      {doneAll && <p className={`mt-4 font-mono text-sm ${st.mem === 2 ? "text-success" : "text-destructive"}`}>{st.mem === 2 ? "Final 2 — correct (serialized)." : `Final ${st.mem} — LOST UPDATE.`}</p>}
    </Shell>
  );
}

function Deadlock() {
  const procs = ["T1", "T2", "T3"]; const res = ["R1", "R2", "R3"];
  const [hold, setHold] = useState<Record<string, string>>({ R1: "T1", R2: "T2" });
  const [want, setWant] = useState<Record<string, string>>({ T1: "R2", T2: "R1" });
  const cycle = useMemo(() => {
    for (const start of procs) {
      const path: string[] = [start]; let cur = start; const seen = new Set<string>();
      while (want[cur] && hold[want[cur]!] && !seen.has(cur)) { seen.add(cur); const r = want[cur]!; cur = hold[r]!; path.push(r, cur); if (cur === start) return path; }
    }
    return null;
  }, [hold, want]);
  return (
    <Shell title="Resource-allocation graph" controls={<>
      <div className="eyebrow">Held by</div>
      {res.map((r) => <label key={r} className="flex items-center gap-2 font-mono text-xs"><span className="w-6">{r}</span><select className="field flex-1" value={hold[r] ?? ""} onChange={(e) => setHold({ ...hold, [r]: e.target.value })}><option value="">free</option>{procs.map((p) => <option key={p}>{p}</option>)}</select></label>)}
      <div className="eyebrow">Requests</div>
      {procs.map((p) => <label key={p} className="flex items-center gap-2 font-mono text-xs"><span className="w-6">{p}</span><select className="field flex-1" value={want[p] ?? ""} onChange={(e) => setWant({ ...want, [p]: e.target.value })}><option value="">nothing</option>{res.map((r) => <option key={r}>{r}</option>)}</select></label>)}
    </>}>
      <ul className="space-y-1 font-mono text-sm">
        {res.filter((r) => hold[r]).map((r) => <li key={r}>{r} → {hold[r]} <span className="text-muted-foreground">(held)</span></li>)}
        {procs.filter((p) => want[p]).map((p) => <li key={p}>{p} ⇢ {want[p]} <span className="text-muted-foreground">(waits{hold[want[p]!] ? "" : " — grantable"})</span></li>)}
      </ul>
      <p className={`mt-4 font-mono text-sm ${cycle ? "text-destructive" : "text-success"}`}>{cycle ? `DEADLOCK — cycle: ${cycle.join(" → ")}` : "No cycle — the system can make progress."}</p>
      <p className="mt-2 text-xs text-muted-foreground">Single-instance resources: cycle ⇔ deadlock. Try lock ordering: make every thread request R1 before R2.</p>
    </Shell>
  );
}

function CAS() {
  const [tagged, setTagged] = useState(false); const [k, setK] = useState(0);
  const steps = [
    "Stack: A → B → C. head=(A,v0)",
    "T1 reads head=A, next=B, then is preempted",
    "T2 pops A → head=(B,v1)",
    "T2 pops B and frees it → head=(C,v2)",
    "T2 pushes A back (node reused) → head=(A,v3)",
    tagged ? "T1: CAS(head, (A,v0), (B,v1)) FAILS — tag is v3. T1 retries safely." : "T1: CAS(head, A, B) SUCCEEDS — head now points at freed B. Corrupt!",
  ];
  return (
    <Shell title="CAS / ABA" controls={<>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={tagged} onChange={(e) => setTagged(e.target.checked)} /> Use version tag</label>
      <div className="flex gap-2"><button className="btn btn-ghost" onClick={() => setK(Math.max(0, k - 1))}>←</button><button className="btn btn-primary" onClick={() => setK(Math.min(steps.length - 1, k + 1))}>Step →</button></div>
    </>}>
      <ol className="space-y-1 font-mono text-xs">{steps.slice(0, k + 1).map((s, i) => <li key={i} className={i === 5 ? (tagged ? "text-success" : "text-destructive") : ""}>{i}. {s}</li>)}</ol>
    </Shell>
  );
}

function Handshake() {
  const [rtt, setRtt] = useState(80); const [isn, setIsn] = useState(1000); const [bytes, setBytes] = useState(500); const [lose, setLose] = useState(false); const [rto, setRto] = useState(200);
  const h = rtt / 2;
  const ev = [
    { t: 0, d: "→", m: `SYN seq=${isn}` },
    { t: h, d: "←", m: `SYN-ACK seq=Y ack=${isn + 1}` },
    { t: 2 * h, d: "→", m: `ACK ack=Y+1 · data seq=${isn + 1}..${isn + bytes}` },
    ...(lose ? [{ t: 3 * h, d: "✕", m: "data segment lost" }, { t: 2 * h + rto, d: "→", m: `retransmit seq=${isn + 1} (RTO ${rto} ms)` }] : []),
  ];
  const ackT = (lose ? 2 * h + rto : 2 * h) + h;
  ev.push({ t: ackT, d: "←", m: `ACK ack=${isn + bytes + 1}` });
  return (
    <Shell title="TCP handshake timeline" controls={<>
      <Slider label="RTT" value={rtt} set={setRtt} min={10} max={300} unit=" ms" />
      <Slider label="Client ISN" value={isn} set={setIsn} min={0} max={9000} step={100} />
      <Slider label="Payload bytes" value={bytes} set={setBytes} min={1} max={1460} />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={lose} onChange={(e) => setLose(e.target.checked)} /> Lose first data segment</label>
      {lose && <Slider label="RTO" value={rto} set={setRto} min={rtt} max={1000} unit=" ms" />}
    </>}>
      <div className="grid grid-cols-[64px_1fr] gap-y-1 font-mono text-xs">
        {ev.map((e, i) => <><span key={`t${i}`} className="text-muted-foreground">{e.t.toFixed(0)} ms</span><span key={`m${i}`} className={e.d === "✕" ? "text-destructive" : e.d === "→" ? "text-c1" : "text-c2"}>{e.d === "←" ? "client ← server  " : e.d === "→" ? "client → server  " : "         ✕       "}{e.m}</span></>)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4"><Stat k="Data ACKed at" v={`${ackT.toFixed(0)} ms`} /><Stat k="Next expected" v={isn + bytes + 1} /></div>
    </Shell>
  );
}

function DNS() {
  const [name, setName] = useState("api.example.com"); const [cache, setCache] = useState<string[]>([]); const [rtt, setRtt] = useState(30);
  const labels = name.toLowerCase().split(".").filter(Boolean);
  const tld = labels[labels.length - 1] ?? ""; const dom = labels.slice(-2).join(".");
  const steps: { who: string; q: string; a: string; cached: boolean }[] = [];
  const fullCached = cache.includes(name);
  if (!fullCached) {
    steps.push({ who: "root (.)", q: `NS for ${tld}.?`, a: `referral → ${tld}. TLD servers`, cached: cache.includes(`tld:${tld}`) });
    steps.push({ who: `${tld}. TLD`, q: `NS for ${dom}?`, a: `referral → ns1.${dom}`, cached: cache.includes(`dom:${dom}`) });
    steps.push({ who: `ns1.${dom}`, q: `A ${name}?`, a: `${name} A 93.184.${labels.length * 7}.${(name.length * 13) % 255} TTL 300`, cached: false });
  }
  const live = steps.filter((s) => !s.cached).length; const total = rtt + live * rtt * 1.5;
  return (
    <Shell title="DNS hierarchy" controls={<>
      <label className="block"><span className="eyebrow">Name</span><input className="field mt-1 w-full" value={name} onChange={(e) => setName(e.target.value)} /></label>
      <Slider label="Base RTT" value={rtt} set={setRtt} min={5} max={150} unit=" ms" />
      <div className="flex gap-2"><button className="btn btn-primary" onClick={() => setCache([...new Set([...cache, name, `tld:${tld}`, `dom:${dom}`])])}>Resolve & cache</button><button className="btn btn-ghost" onClick={() => setCache([])}>Flush</button></div>
    </>}>
      {fullCached ? <p className="font-mono text-sm text-success">Answer served from resolver cache — 0 upstream queries.</p> :
        <ol className="space-y-2 font-mono text-xs">{steps.map((s, i) => <li key={i} className={s.cached ? "text-muted-foreground line-through" : ""}><span className="text-primary">{i + 1}. {s.who}</span> — {s.q} → {s.a}</li>)}</ol>}
      <div className="mt-4 grid grid-cols-2 gap-4"><Stat k="Upstream queries" v={fullCached ? 0 : live} /><Stat k="Est. lookup" v={`${(fullCached ? rtt : total).toFixed(0)} ms`} /></div>
      <p className="mt-2 text-xs text-muted-foreground">Try resolving www.{dom} after caching: root and TLD referrals are reused.</p>
    </Shell>
  );
}

function Lifecycle() {
  const [rtt, setRtt] = useState(50); const [dnsC, setDnsC] = useState(false); const [reuse, setReuse] = useState(false); const [tls, setTls] = useState<"1.2" | "1.3" | "quic">("1.3"); const [srv, setSrv] = useState(20);
  const parts = [
    { k: "DNS", v: dnsC ? 0 : rtt * 1.2 },
    { k: "TCP", v: reuse || tls === "quic" ? 0 : rtt },
    { k: tls === "quic" ? "QUIC+TLS" : "TLS", v: reuse ? 0 : tls === "1.2" ? 2 * rtt : rtt },
    { k: "HTTP", v: rtt },
    { k: "Server", v: srv },
  ];
  const total = parts.reduce((a, p) => a + p.v, 0); const cs = ["bg-c1", "bg-c2", "bg-c3", "bg-c4", "bg-primary"];
  return (
    <Shell title="Request lifecycle" controls={<>
      <Slider label="RTT" value={rtt} set={setRtt} min={5} max={300} unit=" ms" />
      <Slider label="Server time" value={srv} set={setSrv} min={0} max={500} unit=" ms" />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={dnsC} onChange={(e) => setDnsC(e.target.checked)} /> DNS cached</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={reuse} onChange={(e) => setReuse(e.target.checked)} /> Reuse connection</label>
      <div className="flex gap-1">{(["1.2", "1.3", "quic"] as const).map((t) => <button key={t} className={`btn ${tls === t ? "btn-primary" : "btn-ghost"}`} onClick={() => setTls(t)}>{t === "quic" ? "QUIC" : `TLS ${t}`}</button>)}</div>
    </>}>
      <div className="flex h-10 w-full overflow-hidden rounded-sm border border-rule">{parts.map((p, i) => p.v > 0 && <div key={p.k} className={`${cs[i]} flex items-center justify-center font-mono text-[10px] text-background`} style={{ width: `${(p.v / total) * 100}%` }}>{p.k}</div>)}</div>
      <table className="mt-4 w-full font-mono text-xs"><tbody>{parts.map((p) => <tr key={p.k} className="rule-b"><td>{p.k}</td><td className="text-right">{p.v.toFixed(0)} ms</td></tr>)}</tbody></table>
      <div className="mt-4"><Stat k="TTFB" v={`${total.toFixed(0)} ms`} /></div>
    </Shell>
  );
}

const ipToN = (s: string) => { const p = s.split(".").map(Number); if (p.length !== 4 || p.some((x) => isNaN(x) || x < 0 || x > 255)) return null; return ((p[0]! << 24) >>> 0) + (p[1]! << 16) + (p[2]! << 8) + p[3]!; };
const nToIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
const bin = (n: number) => [24, 16, 8, 0].map((s) => ((n >>> s) & 255).toString(2).padStart(8, "0")).join(".");
function CIDR() {
  const [ip, setIp] = useState("10.20.37.200"); const [pre, setPre] = useState(22);
  const n = ipToN(ip);
  const mask = pre === 0 ? 0 : (0xffffffff << (32 - pre)) >>> 0;
  const net = n === null ? 0 : (n & mask) >>> 0; const bc = (net | (~mask >>> 0)) >>> 0;
  const hosts = pre >= 31 ? (pre === 31 ? 2 : 1) : 2 ** (32 - pre) - 2;
  return (
    <Shell title="CIDR calculator" controls={<>
      <label className="block"><span className="eyebrow">IPv4</span><input className="field mt-1 w-full" value={ip} onChange={(e) => setIp(e.target.value)} /></label>
      <Slider label="Prefix /n" value={pre} set={setPre} min={0} max={32} />
    </>}>
      {n === null ? <p className="font-mono text-sm text-destructive">Invalid IPv4 address.</p> : <>
        <div className="space-y-1 overflow-x-auto font-mono text-xs">
          <div><span className="inline-block w-16 text-muted-foreground">ip</span>{bin(n)}</div>
          <div><span className="inline-block w-16 text-muted-foreground">mask</span>{bin(mask)}</div>
          <div><span className="inline-block w-16 text-muted-foreground">network</span>{bin(net)}</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat k="Mask" v={nToIp(mask)} /><Stat k="Network" v={`${nToIp(net)}/${pre}`} /><Stat k="Broadcast" v={nToIp(bc)} />
          <Stat k="First host" v={pre >= 31 ? nToIp(net) : nToIp(net + 1)} /><Stat k="Last host" v={pre >= 31 ? nToIp(bc) : nToIp(bc - 1)} /><Stat k="Usable" v={hosts.toLocaleString()} />
        </div></>}
    </Shell>
  );
}

function Cwnd() {
  const [ss, setSs] = useState(16); const [lossAt, setLossAt] = useState(12); const [rounds, setRounds] = useState(24); const [mode, setMode] = useState<"reno" | "tahoe">("reno"); const [rtt, setRtt] = useState(50);
  const data = useMemo(() => {
    let cwnd = 1, th = ss; const out: number[] = [];
    for (let r = 1; r <= rounds; r++) {
      out.push(cwnd);
      if (r === lossAt) { th = Math.max(2, Math.floor(cwnd / 2)); cwnd = mode === "reno" ? th : 1; }
      else cwnd = cwnd < th ? cwnd * 2 : cwnd + 1;
    }
    return out;
  }, [ss, lossAt, rounds, mode]);
  const max = Math.max(...data); const totalSeg = data.reduce((a, b) => a + b, 0);
  return (
    <Shell title="Congestion window" controls={<>
      <Slider label="Initial ssthresh" value={ss} set={setSs} min={2} max={64} unit=" MSS" />
      <Slider label="Loss at round" value={lossAt} set={setLossAt} min={0} max={rounds} />
      <Slider label="Rounds" value={rounds} set={setRounds} min={5} max={40} />
      <Slider label="RTT" value={rtt} set={setRtt} min={10} max={200} unit=" ms" />
      <div className="flex gap-1">{(["reno", "tahoe"] as const).map((m) => <button key={m} className={`btn ${mode === m ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode(m)}>{m}</button>)}</div>
    </>}>
      <div className="flex h-40 items-end gap-0.5 border-b border-l border-rule">{data.map((c, i) => <div key={i} title={`RTT ${i + 1}: ${c}`} className={`flex-1 ${i + 1 === lossAt ? "bg-destructive" : "bg-c1"}`} style={{ height: `${(c / max) * 100}%` }} />)}</div>
      <p className="mt-1 font-mono text-xs text-muted-foreground">cwnd per RTT (MSS) · red = loss</p>
      <div className="mt-4 grid grid-cols-3 gap-4"><Stat k="Peak cwnd" v={max} /><Stat k="Segments sent" v={totalSeg} /><Stat k="Avg throughput" v={`${((totalSeg * 1460 * 8) / (rounds * rtt / 1000) / 1e6).toFixed(2)} Mbps`} /></div>
    </Shell>
  );
}

function NAT() {
  const [hosts, setHosts] = useState(3); const [pub, setPub] = useState("203.0.113.7");
  const [inbound, setInbound] = useState(40001);
  const table = Array.from({ length: hosts }).map((_, i) => ({ priv: `192.168.1.${10 + i}:${51000 + i * 7}`, pubp: 40001 + i, dst: i % 2 ? "142.250.1.1:443" : "93.184.216.34:443" }));
  const hit = table.find((t) => t.pubp === inbound);
  const hops = ["192.168.1.1 (home router, NAT)", "100.64.0.1 (ISP CGNAT)", "ISP core", "IX peering", "dst network edge"];
  return (
    <Shell title="NAT & routing hops" controls={<>
      <Slider label="Private hosts" value={hosts} set={setHosts} min={1} max={8} />
      <label className="block"><span className="eyebrow">Public IP</span><input className="field mt-1 w-full" value={pub} onChange={(e) => setPub(e.target.value)} /></label>
      <label className="block"><span className="eyebrow">Inbound packet to port</span><input className="field mt-1 w-full" type="number" value={inbound} onChange={(e) => setInbound(+e.target.value)} /></label>
    </>}>
      <table className="w-full font-mono text-xs"><thead><tr className="rule-b text-left text-muted-foreground"><th>private</th><th>public</th><th>remote</th></tr></thead>
        <tbody>{table.map((t) => <tr key={t.pubp} className="rule-b"><td>{t.priv}</td><td>{pub}:{t.pubp}</td><td>{t.dst}</td></tr>)}</tbody></table>
      <p className={`mt-3 font-mono text-sm ${hit ? "text-success" : "text-destructive"}`}>{hit ? `Inbound :${inbound} → translated to ${hit.priv}` : `Inbound :${inbound} — no mapping, DROPPED`}</p>
      <ol className="mt-4 space-y-0.5 font-mono text-xs">{hops.map((h, i) => <li key={h}>TTL {64 - i} → hop {i + 1}: {h}</li>)}</ol>
    </Shell>
  );
}

function Quic() {
  const [rtt, setRtt] = useState(100); const [loss, setLoss] = useState(1); const [streams, setStreams] = useState(6);
  const rows = [{ k: "TCP + TLS 1.2", r: 3 }, { k: "TCP + TLS 1.3", r: 2 }, { k: "QUIC (1-RTT)", r: 1 }, { k: "QUIC 0-RTT resume", r: 0 }];
  const stalledTcp = loss > 0 ? streams : 0; const stalledQuic = Math.min(loss, streams);
  return (
    <Shell title="Handshake RTTs & HOL blocking" controls={<>
      <Slider label="RTT" value={rtt} set={setRtt} min={10} max={400} unit=" ms" />
      <Slider label="Lost packets" value={loss} set={setLoss} min={0} max={6} />
      <Slider label="Concurrent streams" value={streams} set={setStreams} min={1} max={12} />
    </>}>
      <table className="w-full font-mono text-xs"><thead><tr className="rule-b text-left text-muted-foreground"><th>protocol</th><th>setup RTTs</th><th>first byte</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.k} className="rule-b"><td>{r.k}</td><td>{r.r}</td><td>{(r.r + 1) * rtt} ms</td></tr>)}</tbody></table>
      <div className="mt-4 grid grid-cols-2 gap-4"><Stat k="Streams stalled · HTTP/2/TCP" v={stalledTcp} /><Stat k="Streams stalled · HTTP/3/QUIC" v={stalledQuic} /></div>
      <p className="mt-2 text-xs text-muted-foreground">TCP delivers bytes in order, so one loss stalls every multiplexed stream for ≥1 RTT. QUIC only stalls streams whose data was in the lost packets.</p>
    </Shell>
  );
}

export function TraceLab({ steps }: { steps: TraceStep[] }) {
  const [k, setK] = useState(0);
  return (
    <div className="panel p-5">
      <div className="eyebrow mb-4">Trace · step {k + 1} / {steps.length}</div>
      <ol className="space-y-3">{steps.map((s, i) => (
        <li key={i} className={`grid grid-cols-[28px_1fr] gap-2 transition-opacity ${i > k ? "opacity-30" : ""}`}>
          <span className={`font-mono text-xs ${i === k ? "text-primary" : "text-muted-foreground"}`}>{String(i + 1).padStart(2, "0")}</span>
          <div><div className="font-mono text-sm">{s.label}</div>{i <= k && <div className="text-sm text-ink-2">{s.detail}</div>}</div>
        </li>))}
      </ol>
      <div className="mt-4 flex gap-2"><button className="btn btn-ghost" onClick={() => setK(Math.max(0, k - 1))}>← Prev</button><button className="btn btn-primary" onClick={() => setK(Math.min(steps.length - 1, k + 1))}>Next →</button></div>
    </div>
  );
}

export const labs: Record<string, () => ReactNode> = {
  ctxswitch: CtxSwitch, scheduler: Scheduler, vm: VM, prodcons: ProdCons, race: Race, deadlock: Deadlock, cas: CAS,
  handshake: Handshake, dns: DNS, lifecycle: Lifecycle, cidr: CIDR, cwnd: Cwnd, nat: NAT, quic: Quic,
  baseconv: BaseConv, twos: Twos, ieee: Ieee, boolean: BoolLab, kmap: KMapLab, combinational: CombinationalLab,
  sequential: SequentialLab, registers: RegistersLab, fsm: FsmLab, timing: TimingLab, archisa: ArchitectureFoundationsLab, archdatapath: ArchitectureDatapathLab, archperf: ArchitecturePerformanceLab, archpipeline: ArchitecturePipelineLab, archcache: ArchitectureCacheLab, archvm: ArchitectureVmLab, archcoherence: ArchitectureCoherenceLab, archio: ArchitectureIoLab,
};