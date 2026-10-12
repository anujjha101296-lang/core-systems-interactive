import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/bridge")({
  head: () => ({ meta: [{ title: "Systems Bridge — Core Systems" }, { name: "description", content: "How OS and networking foundations show up in payment engineering." }, { property: "og:title", content: "Systems Bridge — Core Systems" }, { property: "og:description", content: "OS & networks foundations applied to payments." }] }),
  component: Bridge,
});

const items = [
  { f: "TCP retransmission & timeouts", p: "A payment request times out — did it reach the processor? Retries must carry an **idempotency key** so a duplicate isn't a double charge.", to: { track: "cn", slug: "tcp-handshake" } },
  { f: "Race conditions / check-then-act", p: "\"if balance ≥ amount then debit\" across two concurrent requests overdraws an account. Use row locks or atomic conditional updates.", to: { track: "os", slug: "race-conditions" } },
  { f: "Acquire / release ordering", p: "Publishing a ledger entry and then a 'settled' flag needs the same happens-before discipline as data/ready.", to: { track: "os", slug: "memory-ordering" } },
  { f: "TLS & certificates", p: "Mutual TLS between your service and a card network; certificate rotation is an availability event.", to: { track: "cn", slug: "tls" } },
];

function Bridge() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="eyebrow">Optional · Systems Bridge</p>
      <h1 className="mt-2 text-5xl">From foundations to payments</h1>
      <p className="mt-3 text-ink-2">A short teaser. OS and networks remain the core — this shows why they matter when money moves.</p>
      <ol className="mt-10">{items.map((x, i) => (
        <li key={x.f} className="rule-t grid grid-cols-[32px_1fr] gap-3 py-5">
          <span className="font-mono text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>
          <div><h2 className="text-xl">{x.f}</h2><p className="mt-1 text-ink-2" dangerouslySetInnerHTML={{ __html: x.p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
            <Link to="/learn/$track/$slug" params={x.to} className="mt-2 inline-block font-mono text-xs text-primary underline">Foundation lesson →</Link></div>
        </li>))}</ol>
    </div>
  );
}