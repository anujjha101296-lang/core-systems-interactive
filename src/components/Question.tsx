import { useMemo, useState } from "react";
import type { Question as Q } from "@/content/types";
import { Md } from "./Md";
import { Button } from "./ui/button";

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.()]/g, "");

function shuffle<T>(a: T[], seed: number) {
  const r = [...a];
  let s = seed;
  for (let i = r.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    const left = r[i], right = r[j]; if (left !== undefined && right !== undefined) { r[i] = right; r[j] = left; }
  }
  return r;
}

const kindLabel: Record<Q["kind"], string> = { mcq: "Single choice", msq: "Multiple select", numeric: "Numerical", typed: "Typed answer", order: "Ordering", match: "Matching", code: "Code / output", scenario: "Scenario" };

export function Question({ q, n, onResult }: { q: Q; n: number; onResult?: (ok: boolean) => void }) {
  const [sel, setSel] = useState<number[]>([]);
  const [text, setText] = useState("");
  const [hint, setHint] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<null | boolean>(null);
  const seed = q.id.split("").reduce((a, c) => a + c.charCodeAt(0), 7);
  const orderInit = useMemo(() => (q.kind === "order" ? shuffle(q.items, seed) : []), [q, seed]);
  const [order, setOrder] = useState(orderInit);
  const rights = useMemo(() => (q.kind === "match" ? shuffle(q.pairs.map((p) => p[1]), seed + 3) : []), [q, seed]);
  const [matches, setMatches] = useState<Record<number, string>>({});

  const check = () => {
    let ok = false;
    switch (q.kind) {
      case "mcq": case "scenario": ok = sel[0] === q.answer; break;
      case "msq": ok = [...sel].sort().join() === [...q.answer].sort().join(); break;
      case "numeric": { const v = parseFloat(text); ok = !isNaN(v) && Math.abs(v - q.answer) <= (q.tolerance ?? 0.001); break; }
      case "typed": case "code": ok = q.accept.map(norm).includes(norm(text)); break;
      case "order": ok = order.join("|") === q.items.join("|"); break;
      case "match": ok = q.pairs.every((p, i) => matches[i] === p[1]); break;
    }
    setResult(ok);
    onResult?.(ok);
  };

  const move = (i: number, d: number) => {
    const j = i + d; if (j < 0 || j >= order.length) return;
    const r = [...order]; const left = r[i], right = r[j]; if (left !== undefined && right !== undefined) { r[i] = right; r[j] = left; } setOrder(r); setResult(null);
  };

  const opts = "options" in q ? q.options : [];
  return (
    <div className="rule-t py-6">
      <div className="mb-2 flex items-center gap-3"><span className="font-mono text-xs text-primary">Q{n}</span><span className="eyebrow">{kindLabel[q.kind]}</span></div>
      {q.assumptions && <p className="mb-2 font-mono text-xs text-muted-foreground">Assumptions: {q.assumptions}</p>}
      <Md text={q.prompt} className="mb-4 text-foreground" />
      {q.kind === "code" && <pre className="panel mb-4 overflow-x-auto p-4 font-mono text-sm">{q.code}</pre>}

      {(q.kind === "mcq" || q.kind === "scenario" || q.kind === "msq") && (
        <div className="space-y-2" role={q.kind === "msq" ? "group" : "radiogroup"}>
          {opts.map((o, i) => {
            const on = sel.includes(i);
            return (
              <Button variant="outline" key={i} type="button" role={q.kind === "msq" ? "checkbox" : "radio"} aria-checked={on}
                onClick={() => { setResult(null); setSel(q.kind === "msq" ? (on ? sel.filter((x) => x !== i) : [...sel, i]) : [i]); }}
                className={`flex w-full items-start gap-3 rounded-sm border px-3 py-2 text-left text-sm transition-colors ${on ? "border-primary bg-accent" : "border-rule hover:bg-muted"}`}>
                <span className="mt-0.5 font-mono text-xs text-muted-foreground">{String.fromCharCode(65 + i)}</span><span>{o}</span>
              </Button>
            );
          })}
        </div>
      )}
      {(q.kind === "numeric" || q.kind === "typed" || q.kind === "code") && (
        <div className="flex items-center gap-2">
          <input className="field w-full max-w-sm" value={text} placeholder={q.kind === "numeric" ? "Enter a number" : "Type your answer"} inputMode={q.kind === "numeric" ? "decimal" : "text"}
            onChange={(e) => { setText(e.target.value); setResult(null); }} onKeyDown={(e) => e.key === "Enter" && check()} aria-label="Answer" />
          {q.kind === "numeric" && q.unit && <span className="font-mono text-sm text-muted-foreground">{q.unit}</span>}
        </div>
      )}
      {q.kind === "order" && (
        <ol className="space-y-1">
          {order.map((it, i) => (
            <li key={it} className="flex items-center gap-2 rounded-sm border border-rule px-3 py-1.5 text-sm">
              <span className="w-5 font-mono text-xs text-muted-foreground">{i + 1}</span><span className="flex-1">{it}</span>
              <Button variant="outline" className="btn btn-ghost px-2 py-0.5" onClick={() => move(i, -1)} aria-label={`Move ${it} up`}>↑</Button>
              <Button variant="outline" className="btn btn-ghost px-2 py-0.5" onClick={() => move(i, 1)} aria-label={`Move ${it} down`}>↓</Button>
            </li>
          ))}
        </ol>
      )}
      {q.kind === "match" && (
        <div className="space-y-2">
          {q.pairs.map((p, i) => (
            <div key={i} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-2">
              <span className="text-sm">{p[0]}</span>
              <select className="field" value={matches[i] ?? ""} aria-label={`Match for ${p[0]}`} onChange={(e) => { setMatches({ ...matches, [i]: e.target.value }); setResult(null); }}>
                <option value="">— choose —</option>
                {rights.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" className="btn btn-primary" onClick={check}>Check</Button>
        {q.hints && hint < q.hints.length && <Button variant="outline" className="btn btn-ghost" onClick={() => setHint(hint + 1)}>Hint {hint + 1}/{q.hints.length}</Button>}
        <Button variant="outline" className="btn btn-ghost" onClick={() => setRevealed(!revealed)}>{revealed ? "Hide solution" : "Reveal solution"}</Button>
      </div>
      {q.hints?.slice(0, hint).map((h, i) => <p key={i} className="mt-2 font-mono text-xs text-muted-foreground">hint {i + 1} — {h}</p>)}
      {(result !== null || revealed) && (
        <div className={`animate-fade-up mt-4 border-l-2 pl-4 ${result ? "border-success" : "border-destructive"}`} aria-live="polite">
          <p className={`font-mono text-xs ${result ? "text-success" : "text-destructive"}`}>{revealed ? "MODEL / SOLUTION — self-check" : result ? "CORRECT — explanation" : q.kind === "typed" ? "COMPARE YOUR REASONING — reveal the model answer" : "NOT YET — try again, take a hint, or reveal"}</p>
          {(result || revealed) && <><Md text={q.explain} className="mt-1 text-sm" />{q.why && q.why !== q.explain && <><p className="eyebrow mt-4">Why</p><Md text={q.why} /></>}{q.sanity && <p className="mt-3 text-sm">Reasonableness check: {q.sanity}</p>}{q.followups?.map(f=><details key={f.q} className="rule-t mt-3 pt-3"><summary className="cursor-pointer">{f.q}</summary><Md text={f.a} /></details>)}{q.tradeoff && <><p className="eyebrow mt-4">Trade-off</p><Md text={q.tradeoff} /></>}</>}
        </div>
      )}
    </div>
  );
}