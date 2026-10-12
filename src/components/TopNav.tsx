import { Link } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";

export function TopNav() {
  const { dark, toggle } = useTheme();
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: document.title, url });
      else { await navigator.clipboard.writeText(url); toast("Link copied"); }
    } catch { /* cancelled */ }
  };
  const l = "font-mono text-xs tracking-wide text-muted-foreground hover:text-foreground";
  const a = { className: "font-mono text-xs tracking-wide text-foreground underline underline-offset-4" };
  return (
    <header className="rule-b sticky top-0 z-30 bg-background/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center gap-5 overflow-x-auto px-5 py-3" aria-label="Main">
        <Link to="/" className="shrink-0 font-serif text-lg font-semibold">Core Systems</Link>
        <Link to="/track/$track" params={{ track: "os" }} className={l} activeProps={a}>OS</Link>
        <Link to="/track/$track" params={{ track: "cn" }} className={l} activeProps={a}>Networks</Link>
        <Link to="/track/$track" params={{ track: "digital-logic" }} className={l} activeProps={a}>Logic</Link>
        <Link to="/track/$track" params={{ track: "architecture" }} className={l} activeProps={a}>Architecture</Link>
        <Link to="/learning-path" className={l} activeProps={a}>Path</Link>
        <Link to="/labs" className={l} activeProps={a}>Labs</Link>
        <Link to="/interview" className={l} activeProps={a}>Interview</Link>
        <Link to="/bridge" className={l} activeProps={a}>Bridge</Link>
        <div className="ml-auto flex shrink-0 gap-2">
          <button className="btn btn-ghost" onClick={share} aria-label="Share this page">Share</button>
          <button className="btn btn-ghost" onClick={toggle} aria-label="Toggle dark mode">{dark ? "Light" : "Dark"}</button>
        </div>
      </nav>
    </header>
  );
}