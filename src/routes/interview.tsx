import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { progress, useProgress } from "@/lib/progress";
import { tracks } from "@/content";

export const Route = createFileRoute("/interview")({
  head: () => ({ meta: [{ title: "Interview Mode — Core Systems" }, { name: "description", content: "Follow-up chains with a depth ladder — definition, mechanism, trade-off, systems reasoning — plus rapid-fire." }, { property: "og:title", content: "Interview Mode — Core Systems" }, { property: "og:description", content: "Practice interviewer follow-up chains for OS and networks." }] }),
  component: Interview,
});

const RUNGS = ["Definition", "Mechanism", "Trade-off", "Systems reasoning"];
const chains = [
  { id: "ctx", title: "Context switch → race", steps: [
    { q: "What is a context switch?", a: "Saving one task's CPU state (registers, PC, SP) and restoring another's, triggered by preemption, blocking, or wakeup." },
    { q: "How is a thread switch different from a process switch?", a: "Threads share the address space: no page-table (CR3) switch, TLB stays warm. Still save/restore registers and stacks." },
    { q: "Can you have concurrency on a single core?", a: "Yes — preemption interleaves instruction streams. Concurrency is overlapping lifetimes; parallelism is simultaneous execution." },
    { q: "So can count++ race on one core? How do you fix it at scale?", a: "Yes: preemption between load and store loses updates. Atomic fetch-add or mutex; under contention, shard per-CPU and sum." },
  ] },
  { id: "tcp", title: "TCP → partial recv → framing → congestion → TIME_WAIT", steps: [
    { q: "What does TCP guarantee?", a: "Reliable, ordered, byte-stream delivery with flow and congestion control." },
    { q: "recv() returned half a message. Why, and what do you do?", a: "It's a stream — no message boundaries. Frame with length prefixes or delimiters and loop until complete." },
    { q: "Throughput drops on a lossy link. Why?", a: "Loss is read as congestion; cwnd halves (or resets on timeout). Throughput ≈ cwnd/RTT, so loss and high RTT both hurt; BBR models bandwidth instead." },
    { q: "Your client opens thousands of short connections and fails with EADDRNOTAVAIL. Explain.", a: "Active closer keeps each 4-tuple in TIME_WAIT for 2·MSL; ephemeral ports run out. Use connection pooling/keep-alive." },
  ] },
  { id: "vm", title: "Virtual memory → TLB miss vs page fault → thrashing", steps: [
    { q: "What is virtual memory?", a: "Per-process address spaces mapped page by page to physical frames by the MMU via page tables." },
    { q: "TLB miss vs page fault?", a: "TLB miss: translation not cached, page walk (ns). Page fault: PTE not present/permission — kernel handles (µs minor, ms major)." },
    { q: "Why might huge pages help or hurt?", a: "More TLB reach → fewer misses; but internal fragmentation, costly compaction and COW of 2 MB." },
    { q: "Machine is slow, CPU idle, disk pegged. Diagnose and fix.", a: "Thrashing: working set > RAM, high si/so. Reduce concurrency/memory footprint or add RAM — replacement policy won't save it." },
  ] },
];

function Chain({ c }: { c: (typeof chains)[number] }) {
  const p = useProgress(); const [k, setK] = useState(0); const [shown, setShown] = useState(false); const [note, setNote] = useState("");
  const reached = p.interview[c.id] ?? -1;
  return (
    <div className="rule-t py-8">
      <h2 className="text-2xl">{c.title}</h2>
      <div className="mt-3 flex gap-1">{RUNGS.map((r, i) => <span key={r} className={`flex-1 border-t-2 pt-1 font-mono text-[10px] ${i <= reached ? "border-primary text-foreground" : "border-rule text-muted-foreground"}`}>{i + 1}. {r}</span>)}</div>
      <p className="mt-6 eyebrow">Rung {k + 1} · {RUNGS[k]}</p>
      <p className="mt-1 font-serif text-xl">“{c.steps[k]?.q}”</p>
      <textarea className="field mt-3 h-24 w-full" placeholder="Answer out loud, or type your answer here first…" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Your answer" />
      <div className="mt-2 flex flex-wrap gap-2">
        <button className="btn" onClick={() => { setShown(true); progress.interview(c.id, k); }}>Reveal model answer</button>
        <button className="btn btn-ghost" onClick={() => { setShown(true); setNote("I don't know — but I'd reason from…"); }}>“I don't know”</button>
        {k < 3 && shown && <button className="btn btn-primary" onClick={() => { setK(k + 1); setShown(false); setNote(""); }}>Next follow-up →</button>}
        {k > 0 && <button className="btn btn-ghost" onClick={() => { setK(0); setShown(false); }}>Restart</button>}
      </div>
      {shown && <div className="animate-fade-up mt-4 border-l-2 border-primary pl-4 text-ink-2">{c.steps[k]?.a}</div>}
    </div>
  );
}

function Rapid() {
  const pool = useMemo(() => Object.values(tracks).flatMap((t) => t.lessons.flatMap((l) => l.followups.map((f) => ({ ...f, from: l.title })))), []);
  const [i, setI] = useState(0); const [show, setShow] = useState(false);
  const f = pool[i % pool.length]!;
  return (
    <div className="panel p-6">
      <p className="eyebrow">Rapid-fire · {i + 1}/{pool.length} · from {f.from}</p>
      <p className="mt-2 font-serif text-xl">{f.q}</p>
      {show && <p className="animate-fade-up mt-3 text-ink-2">{f.a}</p>}
      <div className="mt-4 flex gap-2"><button className="btn" onClick={() => setShow(!show)}>{show ? "Hide" : "Answer"}</button><button className="btn btn-primary" onClick={() => { setI(i + 1); setShow(false); }}>Next →</button><button className="btn btn-ghost" onClick={() => { setI(Math.floor(Math.random() * pool.length)); setShow(false); }}>Shuffle</button></div>
    </div>
  );
}

function Interview() {
  const [tab, setTab] = useState<"ladder" | "rapid">("ladder");
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="eyebrow">Interview Follow-up Mode</p>
      <h1 className="mt-2 text-5xl">How deep can you go?</h1>
      <p className="mt-3 text-ink-2">Each chain climbs definition → mechanism → trade-off → systems reasoning. Scored on correctness, depth reached, trade-offs, clarity, and handling “I don't know”.</p>
      <div className="mt-6 flex gap-1"><button className={`btn ${tab === "ladder" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("ladder")}>Depth ladder</button><button className={`btn ${tab === "rapid" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("rapid")}>Rapid-fire</button></div>
      <div className="mt-8">{tab === "ladder" ? chains.map((c) => <Chain key={c.id} c={c} />) : <Rapid />}</div>
    </div>
  );
}