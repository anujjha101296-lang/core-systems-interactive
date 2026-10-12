import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { labIndex } from "@/content";
import { labs } from "@/components/labs";

export const Route = createFileRoute("/labs")({
  head: () => ({ meta: [{ title: "Labs — Core Systems" }, { name: "description", content: "Fourteen live OS and networking experiments: scheduling, TLB, races, deadlocks, TCP, DNS, CIDR, congestion, QUIC." }, { property: "og:title", content: "Labs — Core Systems" }, { property: "og:description", content: "Live, calculating OS and networking experiments." }] }),
  component: LabsPage,
});

function LabsPage() {
  const [id, setId] = useState("ctxswitch"); const L = labs[id]; const meta = labIndex.find((x) => x.id === id)!;
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="eyebrow">Executable labs</p>
      <h1 className="mt-2 text-5xl">Labs</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <ul className="space-y-0.5">{labIndex.map((l) => (
          <li key={l.id}><button onClick={() => setId(l.id)} className={`w-full py-1 text-left font-mono text-xs ${id === l.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>{l.track.toUpperCase()} · {l.name}</button></li>))}</ul>
        <div className="min-w-0">{L && <L />}<Link to="/learn/$track/$slug" params={{ track: meta.track, slug: meta.slug }} className="mt-4 inline-block font-mono text-xs text-primary underline">Open the full lesson →</Link></div>
      </div>
    </div>
  );
}