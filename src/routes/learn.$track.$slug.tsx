import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getLesson, tracks, type TrackId } from "@/content";
import { Md } from "@/components/Md";
import { Question } from "@/components/Question";
import { labs, TraceLab } from "@/components/labs";
import { progress, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/learn/$track/$slug")({
  loader: ({ params }) => { const l = getLesson(params.track, params.slug); if (!l) throw notFound(); return { track: params.track, slug: params.slug }; },
  head: ({ params }) => {
    const l = getLesson(params.track, params.slug); const t = l ? `${l.title} — Core Systems` : "Lesson";
    return { meta: [{ title: t }, { name: "description", content: l?.question.slice(0, 155) ?? "" }, { property: "og:title", content: t }, { property: "og:description", content: l?.short ?? "" }] };
  },
  component: LessonPage,
});

const SECTIONS = ["The Question", "See the Problem", "The Idea", "Formula / How it works", "Try it", "Check your understanding", "Go deeper", "Interview follow-up", "Failure mode / Trade-off"];
const MODES = ["Concept", "Trace", "Numbers", "System", "Interview"] as const;

function LessonPage() {
  const { track, slug } = Route.useLoaderData();
  const l = getLesson(track, slug)!; const t = tracks[track as TrackId];
  const p = useProgress(); const lp = p.lessons[`${track}/${slug}`];
  const [mode, setMode] = useState<(typeof MODES)[number]>("Concept");
  const [active, setActive] = useState(1);
  const idx = t.lessons.findIndex((x) => x.slug === slug); const prev = t.lessons[idx - 1]; const next = t.lessons[idx + 1];
  const Lab = l.lab ? labs[l.lab] : null;

  useEffect(() => { progress.visit(track, slug); }, [track, slug]);
  useEffect(() => {
    const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const n = +(e.target as HTMLElement).dataset['n']!; setActive(n); progress.markSection(track, slug, n); } }), { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll("[data-n]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [track, slug, mode]);

  const show = (n: number) => {
    if (mode === "Concept") return true;
    if (mode === "Trace") return [1, 2, 5].includes(n);
    if (mode === "Numbers") return [1, 4, 5, 6].includes(n);
    if (mode === "System") return [3, 7, 9].includes(n);
    return [1, 8, 9].includes(n);
  };
  const Sec = ({ n, children }: { n: number; children: React.ReactNode }) => show(n) ? (
    <section id={`s${n}`} data-n={n} className="rule-t scroll-mt-20 py-10">
      <div className="mb-4 flex items-baseline gap-3"><span className="font-mono text-sm text-primary">{String(n).padStart(2, "0")}</span><h2 className="text-2xl">{SECTIONS[n - 1]}</h2></div>
      {children}
    </section>) : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[200px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-20 space-y-1">
          <Link to="/track/$track" params={{ track }} className="eyebrow hover:text-foreground">← {t.name}</Link>
          <ol className="mt-4 space-y-1">{SECTIONS.map((s, i) => show(i + 1) && (
            <li key={s}><a href={`#s${i + 1}`} className={`flex gap-2 font-mono text-xs ${active === i + 1 ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <span className={lp?.sections.includes(i + 1) ? "text-primary" : ""}>{String(i + 1).padStart(2, "0")}</span>{s}</a></li>))}</ol>
          <div className="pt-4 font-mono text-[10px] text-muted-foreground">{lp?.sections.length ?? 0}/9 sections seen</div>
        </div>
      </aside>

      <article className="min-w-0">
        <p className="eyebrow">{t.tag} · Lesson {String(idx + 1).padStart(2, "0")}{l.flagship ? " · Flagship" : ""}</p>
        <h1 className="mt-2 text-4xl md:text-5xl">{l.title}</h1>
        <p className="mt-2 text-muted-foreground">{l.short}</p>
        <div className="sticky top-[53px] z-20 -mx-1 mt-6 flex gap-1 overflow-x-auto bg-background py-2" role="tablist" aria-label="Lesson mode">
          {MODES.map((m) => <button key={m} role="tab" aria-selected={mode === m} className={`btn ${mode === m ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode(m)}>{m}</button>)}
        </div>

        <Sec n={1}><p className="font-serif text-2xl leading-snug">{l.question}</p></Sec>
        <Sec n={2}><Md text={l.problem || l.question} /></Sec>
        <Sec n={3}><Md text={l.idea} />
          {l.keyIdea && <div className="mt-4 border-l-2 border-primary pl-4"><p className="eyebrow">Key idea</p><Md text={l.keyIdea} className="mt-1" /></div>}
          {l.commonMistake && <div className="mt-4 border-l-2 border-destructive pl-4"><p className="eyebrow">Common mistake</p><Md text={l.commonMistake} className="mt-1" /></div>}
          {l.derive && <details className="rule-b mt-4 py-2"><summary className="cursor-pointer font-medium">Derive it yourself</summary><Md text={l.derive} className="mt-2" /></details>}
        </Sec>
        <Sec n={4}>
          <Md text={l.how.text} />
          {l.how.formula && <pre className="panel mt-4 overflow-x-auto p-4 font-mono text-sm">{l.how.formula}</pre>}
          {l.how.example && <div className="mt-4 border-l-2 border-primary pl-4"><p className="eyebrow">Worked example</p><Md text={l.how.example} className="mt-1 text-base" /></div>}
          {l.numbers && <table className="mt-6 w-full font-mono text-sm"><tbody>{l.numbers.map((x) => <tr key={x.label} className="rule-b"><td className="py-1.5">{x.label}</td><td className="text-right text-primary">{x.value}</td></tr>)}</tbody></table>}
        </Sec>
        <Sec n={5}>
          {Lab ? <Lab /> : l.trace ? <TraceLab steps={l.trace} /> : <p className="text-muted-foreground">See the Labs page.</p>}
          {Lab && l.trace && mode === "Trace" && <div className="mt-6"><TraceLab steps={l.trace} /></div>}
        </Sec>
        <Sec n={6}>{l.checks.map((q, i) => <Question key={q.id} q={q} n={i + 1} onResult={(ok) => progress.markCheck(track, slug, q.id, ok)} />)}</Sec>
        <Sec n={7}>{l.deeper.length ? l.deeper.map((d) => (
          <details key={d.title} className="rule-b group py-3"><summary className="cursor-pointer font-serif text-lg marker:text-primary">{d.title}</summary><Md text={d.body} className="mt-2" /></details>
        )) : <p className="text-muted-foreground">Explore the follow-ups below.</p>}</Sec>
        <Sec n={8}>
          {l.model && <div className="panel mb-6 p-5"><p className="eyebrow">Model answer</p><Md text={l.model} className="mt-2" /></div>}
          {l.followups.map((f) => <details key={f.q} className="rule-b py-3"><summary className="cursor-pointer font-medium">“{f.q}”</summary><Md text={f.a} className="mt-2" /></details>)}
          {l.interviewLadder && <div className="mt-6"><p className="eyebrow">Depth ladder</p>{l.interviewLadder.map((s) => <details key={s.q} className="rule-b py-3"><summary className="cursor-pointer"><span className="mr-2 font-mono text-xs text-primary">{s.level}</span>{s.q}</summary><Md text={s.a} className="mt-2" /></details>)}</div>}
          {l.interviewLadder && l.debug && <div className="mt-6"><p className="eyebrow">What would you debug?</p><details className="rule-b py-3"><summary className="cursor-pointer">{l.debug.q}</summary><Md text={l.debug.a} className="mt-2" /></details></div>}
          {l.interviewLadder && l.rapid && <div className="mt-6"><p className="eyebrow">Rapid-fire</p><ul className="mt-2 grid gap-1 font-mono text-sm sm:grid-cols-2">{l.rapid.map((r) => <li key={r}>· {r}</li>)}</ul></div>}
          <p className="mt-4 text-sm text-muted-foreground">Scored on correctness, depth reached, trade-offs, clarity — and how you handle "I don't know". <Link to="/interview" className="text-primary underline">Practice the ladder →</Link></p>
        </Sec>
        <Sec n={9}>
          <div className="grid gap-6 md:grid-cols-2">
            <div><p className="eyebrow text-destructive">Failure mode</p><Md text={l.tradeoff.failure} className="mt-1" /></div>
            <div><p className="eyebrow">Trade-off</p><Md text={l.tradeoff.tradeoff} className="mt-1" /></div>
          </div>
          {l.bridge && getLesson(l.bridge.to.track, l.bridge.to.slug) && <p className="mt-6 text-sm"><span className="eyebrow mr-2">Engineering bridge</span>{l.bridge.note} <Link to="/learn/$track/$slug" params={{ track: l.bridge.to.track, slug: l.bridge.to.slug }} className="text-primary underline">{l.bridge.to.title ?? l.bridge.to.slug} →</Link></p>}
        </Sec>

        <div className="rule-t flex flex-wrap items-center justify-between gap-3 pt-6">
          {prev ? <Link className="btn btn-ghost" to="/learn/$track/$slug" params={{ track, slug: prev.slug }}>← {prev.title}</Link> : <span />}
          <button className={`btn ${lp?.done ? "btn-primary" : ""}`} onClick={() => progress.toggleDone(track, slug)}>{lp?.done ? "✓ Completed" : "Mark complete"}</button>
          {next ? <Link className="btn btn-ghost" to="/learn/$track/$slug" params={{ track, slug: next.slug }}>{next.title} →</Link> : <span />}
        </div>
      </article>
    </div>
  );
}