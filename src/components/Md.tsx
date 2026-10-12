import { Fragment } from "react";

function inline(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
    if (p.startsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function Md({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <div className={`prose-ed ${className}`}>
      {text.split("\n\n").map((p, i) => (
        <p key={i}>{inline(p)}</p>
      ))}
    </div>
  );
}