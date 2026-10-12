import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { tracks, type TrackId } from "@/content";
import { useProgress, lessonStatus } from "@/lib/progress";

export const Route = createFileRoute("/track/$track")({
  loader: ({ params }) => { const t = tracks[params.track as TrackId]; if (!t) throw notFound(); return { id: t.id }; },
  head: ({ params }) => {
    const t = tracks[params.track as TrackId]; const n = t?.name ?? "Track";
    return { meta: [{ title: `${n} — Core Systems` }, { name: "description", content: t?.blurb ?? "" }, { property: "og:title", content: `${n} — Core Systems` }, { property: "og:description", content: t?.blurb ?? "" }] };
  },
  component: TrackPage,
});

function TrackPage() {
  const { id } = Route.useLoaderData(); const t = tracks[id]; const p = useProgress();
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <p className="eyebrow">{t.tag}</p>
      <h1 className="mt-2 text-5xl">{t.name}</h1>
      <p className="mt-3 max-w-2xl text-ink-2">{t.blurb}</p>
      {t.lessons.length === 0 ? <BuildingState planned={t.planned} /> : <ol className="mt-10">
        {t.lessons.map((l, i) => (
          <li key={l.slug} className="rule-t">
            <Link to="/learn/$track/$slug" params={{ track: t.id, slug: l.slug }} className="group grid grid-cols-[40px_1fr_auto] gap-3 py-4">
              <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <span><span className="font-serif text-xl group-hover:text-primary">{l.title}</span>{l.flagship && <span className="ml-2 font-mono text-[10px] text-primary">FLAGSHIP</span>}<span className="block text-sm text-muted-foreground">{l.short}</span></span>
              <span className="font-mono text-xs text-muted-foreground">{Math.round(lessonStatus(p, t.id, l.slug) * 100)}%</span>
            </Link>
          </li>
        ))}
      </ol>}
    </div>
  );
}

function BuildingState({ planned }: { planned: number }) {
  return (
    <div className="rule-t mt-10 pt-6">
      <p className="eyebrow">Content is being built</p>
      <p className="mt-2 max-w-2xl text-ink-2">This track is planned at {planned} lessons in the same worksheet format as Operating Systems and Networks. No lessons are published yet, so nothing here is clickable. See the <Link to="/learning-path" className="text-primary underline">learning path</Link> for where it fits, or continue with a published track.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link className="btn btn-ghost" to="/track/$track" params={{ track: "os" }}>Operating Systems →</Link>
        <Link className="btn btn-ghost" to="/track/$track" params={{ track: "cn" }}>Computer Networks →</Link>
      </div>
    </div>
  );
}