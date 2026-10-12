import { createFileRoute, Link } from "@tanstack/react-router";
import { tracks, learningPath } from "@/content";

const T = "Learning Path — Core Systems";
const D = "How the tracks connect: Digital Logic, then Computer Architecture, then Operating Systems. Computer Networks can be studied on its own.";

export const Route = createFileRoute("/learning-path")({
  head: () => ({ meta: [{ title: T }, { name: "description", content: D }, { property: "og:title", content: T }, { property: "og:description", content: D }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PathPage,
});

function PathPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <p className="eyebrow">Prerequisites</p>
      <h1 className="mt-2 text-5xl">Learning path</h1>
      <p className="mt-3 max-w-2xl text-ink-2">Each arrow means "the earlier track explains what the later one assumes". You can start anywhere; the order only tells you where to look when something feels like magic.</p>
      <ol className="mt-10">
        {learningPath.chain.map((id, i) => {
          const t = tracks[id];
          return (
            <li key={id} className="rule-t grid grid-cols-[40px_1fr] gap-3 py-4">
              <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <Link to="/track/$track" params={{ track: id }} className="font-serif text-xl hover:text-primary">{t.name}</Link>
                <span className="ml-2 font-mono text-[10px] text-muted-foreground">{t.tag} · {t.lessons.length ? `${t.lessons.length} lessons` : `${t.planned} planned · being built`}</span>
                <p className="text-sm text-muted-foreground">{t.blurb}</p>
                {i < learningPath.chain.length - 1 && <p className="mt-2 font-mono text-xs text-muted-foreground">↓ prerequisite for {tracks[learningPath.chain[i + 1]!].name}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="eyebrow rule-t mt-10 pt-6">Standalone</p>
      {learningPath.standalone.map((id) => {
        const t = tracks[id];
        return (
          <div key={id} className="mt-2">
            <Link to="/track/$track" params={{ track: id }} className="font-serif text-xl hover:text-primary">{t.name}</Link>
            <span className="ml-2 font-mono text-[10px] text-muted-foreground">{t.tag} · {t.lessons.length} lessons</span>
            <p className="text-sm text-muted-foreground">{t.blurb} No prerequisite track is required.</p>
          </div>
        );
      })}
    </div>
  );
}