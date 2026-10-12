import { createFileRoute, Link } from "@tanstack/react-router";
import { tracks, getLesson, trackOrder, trackFraction } from "@/content";
import { useProgress, lessonStatus, progress } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Core Systems — Interactive OS & Computer Networks" },
      { name: "description", content: "Two tracks, fourteen live labs, interview follow-up ladders. Understand the system, experiment, explain, defend the trade-off." },
      { property: "og:title", content: "Core Systems — Interactive OS & Computer Networks" },
      { property: "og:description", content: "Interactive worksheets for Operating Systems and Computer Networks with live labs and interview depth ladders." },
    ],
  }),
  component: Home,
});

function Home() {
  const p = useProgress();
  const last = p.last ? getLesson(p.last.track, p.last.slug) : undefined;
  return (
    <div className="mx-auto max-w-6xl px-5">
      <section className="py-16 md:py-24">
        <p className="eyebrow">An interactive worksheet · Operating Systems & Computer Networks</p>
        <h1 className="mt-4 max-w-4xl text-5xl leading-[1.05] md:text-7xl">Understand the system. Experiment with it. Explain it. <em className="text-primary">Defend the trade-off.</em></h1>
        <div className="mt-8 flex flex-wrap gap-3">
          {last ? <Link className="btn btn-primary" to="/learn/$track/$slug" params={{ track: last.track, slug: last.slug }}>Continue · {last.title} →</Link>
            : <Link className="btn btn-primary" to="/learn/$track/$slug" params={{ track: "os", slug: "context-switching" }}>Start with Context Switching →</Link>}
          <Link className="btn btn-ghost" to="/labs">Open the labs</Link>
          <Link className="btn btn-ghost" to="/interview">Interview mode</Link>
          <Link className="btn btn-ghost" to="/learning-path">Learning path</Link>
        </div>
      </section>

      <section className="grid gap-12 md:grid-cols-2">
        {trackOrder.map((id) => tracks[id]).map((t) => {
          const frac = trackFraction(t.lessons, (slug) => lessonStatus(p, t.id, slug));
          const building = t.lessons.length === 0;
          return (
            <div key={t.id} className="rule-t pt-6">
              <p className="eyebrow">{t.tag} · {building ? `${t.planned} lessons planned · being built` : `${t.lessons.length} lessons · ${Math.round(frac * 100)}%`}</p>
              <h2 className="mt-2 text-3xl"><Link to="/track/$track" params={{ track: t.id }} className="hover:text-primary">{t.name}</Link></h2>
              <p className="mt-2 text-ink-2">{t.blurb}</p>
              {building ? <p className="mt-4 font-mono text-xs text-muted-foreground">Content is being built. <Link to="/learning-path" className="text-primary underline">See where it fits →</Link></p> : <>
              <div className="mt-3 h-px w-full bg-rule"><div className="h-px bg-primary" style={{ width: `${frac * 100}%` }} /></div>
              <ol className="mt-4 space-y-1">
                {t.lessons.map((l, i) => (
                  <li key={l.slug}>
                    <Link to="/learn/$track/$slug" params={{ track: t.id, slug: l.slug }} className="group grid grid-cols-[32px_1fr_auto] items-baseline gap-2 py-1">
                      <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      <span className="group-hover:text-primary">{l.title}{l.flagship && <span className="ml-2 font-mono text-[10px] text-primary">★</span>}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{lessonStatus(p, t.id, l.slug) >= 1 ? "done" : lessonStatus(p, t.id, l.slug) > 0 ? "in progress" : ""}</span>
                    </Link>
                  </li>
                ))}
              </ol></>}
            </div>
          );
        })}
      </section>

      <section className="rule-t mt-16 grid gap-8 pt-8 md:grid-cols-3">
        <div><p className="eyebrow">How each lesson works</p><p className="mt-2 text-sm text-ink-2">Question → see the problem → idea → formula → try it → check → go deeper → interview follow-up → failure mode.</p></div>
        <div><p className="eyebrow">Systems Bridge · optional</p><p className="mt-2 text-sm text-ink-2">How TIME_WAIT, idempotency and memory ordering show up in payment engineering. <Link to="/bridge" className="text-primary underline">Read the teaser →</Link></p></div>
        <div><p className="eyebrow">Your progress</p><p className="mt-2 text-sm text-ink-2">Stored only in this browser. <button className="text-primary underline" onClick={() => confirm("Reset all progress?") && progress.reset()}>Reset progress</button></p></div>
      </section>
    </div>
  );
}