import { useState } from "react";
import { parseInBase, addFlags, f32Bits, bitsToF32, canonicalSOP, compareBool, MAX_BOOL_VARS, kmapLayout, parseIndexList, kmapSolve, verifyAgainstSpec, productTerm, sumTerm, implCells } from "@/lib/dl-math";

const Box = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="panel p-5"><div className="eyebrow mb-4">Lab · {title}</div>{children}</div>
);
const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="rule-b flex justify-between gap-4 py-1 font-mono text-sm"><span className="text-muted-foreground">{k}</span><span className="break-all text-right">{v}</span></div>
);

export function BaseConv() {
  const [txt, setTxt] = useState("9C"); const [base, setBase] = useState(16);
  const v = parseInBase(txt, base);
  return (
    <Box title="Base converter">
      <div className="flex flex-wrap gap-2">
        <input className="field" aria-label="Number" value={txt} onChange={(e) => setTxt(e.target.value)} />
        <select className="field" aria-label="Input base" value={base} onChange={(e) => setBase(+e.target.value)}>{[2, 8, 10, 16].map((b) => <option key={b} value={b}>base {b}</option>)}</select>
      </div>
      {v === null ? <p className="mt-4 font-mono text-sm text-destructive">Not a valid base-{base} integer.</p> : <div className="mt-4">
        <Row k="binary" v={v.toString(2)} /><Row k="octal" v={v.toString(8)} /><Row k="decimal" v={v.toString(10)} /><Row k="hex" v={v.toString(16).toUpperCase()} />
        <p className="mt-3 font-mono text-xs text-muted-foreground">{txt.trim().toUpperCase().split("").map((d, i, a) => `${d}·${base}^${a.length - 1 - i}`).join(" + ")} = {v.toString()}</p>
      </div>}
    </Box>
  );
}

export function Twos() {
  const [n, setN] = useState(8); const [a, setA] = useState(112); const [b, setB] = useState(80); const [sub, setSub] = useState(false);
  const r = addFlags(a, b, n, sub);
  return (
    <Box title="Two's complement & flags">
      <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
        <label>bits <select className="field" value={n} onChange={(e) => setN(+e.target.value)}>{[4, 8, 16].map((x) => <option key={x}>{x}</option>)}</select></label>
        <input className="field w-24" type="number" aria-label="A" value={a} onChange={(e) => setA(Math.trunc(+e.target.value))} />
        <select className="field" aria-label="Operation" value={sub ? "-" : "+"} onChange={(e) => setSub(e.target.value === "-")}><option>+</option><option>-</option></select>
        <input className="field w-24" type="number" aria-label="B" value={b} onChange={(e) => setB(Math.trunc(+e.target.value))} />
      </div>
      <p className="mt-2 font-mono text-xs text-muted-foreground">Inputs are taken modulo 2^{n}; signed range is {-(2 ** (n - 1))} … {2 ** (n - 1) - 1}.</p>
      <div className="mt-4">
        <Row k="A bits" v={r.aBits} /><Row k={sub ? "~B + 1 bits" : "B bits"} v={r.bBits} /><Row k="result bits" v={r.rBits} />
        <Row k="unsigned result" v={String(r.unsigned)} /><Row k="signed result" v={String(r.signed)} />
        <Row k={sub ? "C (carry out; 1 = no borrow, A ≥ B unsigned)" : "C (carry out = unsigned overflow)"} v={r.carry ? "1" : "0"} /><Row k="V (signed overflow)" v={r.overflow ? "1" : "0"} />
      </div>
    </Box>
  );
}

export function Ieee() {
  const [bits, setBits] = useState(f32Bits(-6.5)); const [dec, setDec] = useState("-6.5"); const [hex, setHex] = useState("C0D00000");
  const s = bits >>> 31, E = (bits >>> 23) & 255, f = bits & 0x7fffff; const val = bitsToF32(bits);
  const cls = E === 255 ? (f ? "NaN" : "infinity") : E === 0 ? (f ? "subnormal" : "zero") : "normal";
  return (
    <Box title="IEEE-754 float32">
      <div className="flex flex-wrap gap-2">
        <label className="font-mono text-xs">decimal <input className="field" value={dec} onChange={(e) => { setDec(e.target.value); const x = parseFloat(e.target.value); if (!isNaN(x)) { const b = f32Bits(x); setBits(b); setHex(b.toString(16).toUpperCase().padStart(8, "0")); } }} /></label>
        <label className="font-mono text-xs">hex <input className="field" value={hex} onChange={(e) => { setHex(e.target.value); const t = e.target.value.replace(/^0x/i, ""); if (/^[0-9a-f]{1,8}$/i.test(t)) { const b = parseInt(t, 16) >>> 0; setBits(b); setDec(String(bitsToF32(b))); } }} /></label>
      </div>
      <div className="mt-4">
        <Row k="sign | exponent | fraction" v={`${s} | ${E.toString(2).padStart(8, "0")} | ${f.toString(2).padStart(23, "0")}`} />
        <Row k="class" v={cls} /><Row k="E / unbiased e" v={cls === "normal" ? `${E} / ${E - 127}` : cls === "subnormal" ? `0 / −126 (no implicit 1)` : String(E)} />
        <Row k="stored value (exact float32)" v={String(val)} />
        <p className="mt-2 font-mono text-xs text-muted-foreground">Decimal input is rounded to nearest-even float32. Out-of-range values become ±∞; NaN payloads are shown but not interpreted.</p>
        {dec && !isNaN(parseFloat(dec)) && <Row k="rounding error (vs. float64 of your input)" v={String(val - parseFloat(dec))} />}
      </div>
    </Box>
  );
}

export function BoolLab() {
  const [e1, setE1] = useState("A'B + AB'"); const [e2, setE2] = useState("A ^ B");
  const r = compareBool(e1, e2);
  return (
    <Box title="Boolean expression & truth table">
      <p className="mb-3 font-mono text-xs text-muted-foreground">Operators: NOT <code>A'</code> or <code>!A</code> · AND <code>AB</code>, <code>A&amp;B</code>, <code>A·B</code> · XOR <code>A^B</code> · OR <code>A+B</code> or <code>A|B</code>. Precedence NOT &gt; AND &gt; XOR &gt; OR. F and G are tabulated over the union of their variables, at most {MAX_BOOL_VARS} in total.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="font-mono text-xs">expression F <input className="field w-full" aria-label="Expression F" value={e1} onChange={(e) => setE1(e.target.value)} /></label>
        <label className="font-mono text-xs">compare with G (optional) <input className="field w-full" aria-label="Expression G" value={e2} onChange={(e) => setE2(e.target.value)} /></label>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">{["A'B + AB'", "(A+B)'", "A'B'", "AB + AC", "A(B+C)", "AB + A'C + BC"].map((x) => <button key={x} type="button" className="btn btn-ghost font-mono text-xs" onClick={() => setE1(x)}>{x}</button>)}</div>
      {r.errF && <p role="alert" className="mt-3 font-mono text-sm text-destructive">F: {r.errF}</p>}
      {r.errG && <p role="alert" className="mt-3 font-mono text-sm text-destructive">G: {r.errG} — no comparison shown.</p>}
      {!r.ok && r.tooMany && <p className="mt-3 font-mono text-sm text-destructive">F and G together use {r.tooMany} variables; this lab shows at most {MAX_BOOL_VARS} (64 rows).</p>}
      {r.ok && <div className="mt-4 overflow-x-auto">
        <table className="font-mono text-sm" aria-label="Truth table for F">
          <thead><tr className="rule-b"><th className="px-2 text-left text-muted-foreground">m</th>{r.vars.map((v) => <th key={v} className="px-2">{v}</th>)}<th className="px-2 text-primary">F</th>{r.hasG && <th className="px-2">G</th>}</tr></thead>
          <tbody>{r.rows.map((row) => <tr key={row.m} className={`rule-b ${row.g !== null && row.g !== row.out ? "text-destructive" : ""}`}><td className="px-2 text-muted-foreground">{row.m}</td>{r.vars.map((v) => <td key={v} className="px-2 text-center">{row.env[v] ? 1 : 0}</td>)}<td className="px-2 text-center text-primary">{row.out ? 1 : 0}</td>{r.hasG && <td className="px-2 text-center">{row.g ? 1 : 0}</td>}</tr>)}</tbody>
        </table>
        <div className="mt-3"><Row k={`minterms Σm over (${r.vars.join(", ")})`} v={r.minterms.length ? r.minterms.join(", ") : "none"} /><Row k="canonical SOP" v={canonicalSOP(r.vars, r.minterms)} /></div>
        {r.equal !== null && <p className="mt-3 font-mono text-sm" aria-live="polite">{r.equal ? "F ≡ G: equal on every input row." : `F ≢ G — counterexample: ${Object.entries(r.counter ?? {}).map(([k, v]) => `${k}=${v ? 1 : 0}`).join(", ")}`}</p>}
      </div>}
    </Box>
  );
}

const GROUP_MARK = "abcdefghijklmnop";
export function KMapLab() {
  const [n, setN] = useState<2 | 3 | 4>(4); const [mt, setMt] = useState("0, 2, 5, 7, 8, 10, 13, 15"); const [dc, setDc] = useState("");
  const [form, setForm] = useState<"sop" | "pos">("sop"); const [pick, setPick] = useState(0);
  const pm = parseIndexList(mt, n), pd = parseIndexList(dc, n);
  const overlap = pm.ok && pd.ok ? pm.values.filter((v) => pd.values.includes(v)) : [];
  const err = !pm.ok ? `Minterms: ${pm.error}` : !pd.ok ? `Don't-cares: ${pd.error}` : overlap.length ? `Index ${overlap.join(", ")} is both a minterm and a don't-care.` : "";
  const on = pm.ok ? pm.values : [], dcs = pd.ok ? pd.values : [];
  const L = kmapLayout(n);
  const sol = err ? null : kmapSolve(on, dcs, n);
  const res = sol ? (form === "sop" ? sol.sop : sol.pos) : null;
  const covers = res?.covers ?? []; const cover = covers[Math.min(pick, covers.length - 1)] ?? [];
  const expr = sol ? (form === "sop" ? sol.sopExpr(cover) : sol.posExpr(cover)) : "";
  const ver = sol ? verifyAgainstSpec(expr, on, dcs, n) : null;
  const marks = (m: number) => cover.map((p, i) => ((m & p.mask) === p.value ? GROUP_MARK[i] : "")).join("");
  const set = (k: () => void) => { k(); setPick(0); };
  return (
    <Box title="Karnaugh map (2–4 variables)">
      <div className="flex flex-wrap items-end gap-2 font-mono text-xs">
        <label>variables <select className="field" aria-label="Number of variables" value={n} onChange={(e) => set(() => setN(+e.target.value as 2 | 3 | 4))}>{[2, 3, 4].map((x) => <option key={x} value={x}>{x}</option>)}</select></label>
        <label>minterms (F = 1) <input className="field w-56" aria-label="Minterms" value={mt} onChange={(e) => set(() => setMt(e.target.value))} /></label>
        <label>don't-cares (X) <input className="field w-40" aria-label="Don't-cares" value={dc} onChange={(e) => set(() => setDc(e.target.value))} /></label>
        <div role="group" aria-label="Form" className="flex gap-1">{(["sop", "pos"] as const).map((f) => <button key={f} type="button" aria-pressed={form === f} className={`btn ${form === f ? "btn-primary" : "btn-ghost"}`} onClick={() => set(() => setForm(f))}>{f.toUpperCase()}</button>)}</div>
      </div>
      <p className="mt-2 font-mono text-xs text-muted-foreground">Index = binary value of {L.rowVars.join("")}{L.colVars.join("")} ({L.rowVars[0]} is the MSB). Rows and columns follow Gray order, so neighbours, including across the edges, differ in one bit.</p>
      {err && <p role="alert" className="mt-3 font-mono text-sm text-destructive">{err}</p>}
      <div className="mt-4 overflow-x-auto">
        <table className="font-mono text-sm" aria-label="Karnaugh map">
          <thead><tr><th className="px-2 text-xs text-muted-foreground">{L.rowVars.join("")}\{L.colVars.join("")}</th>{L.colsG.map((c) => <th key={c} className="px-3 text-xs text-muted-foreground">{c.toString(2).padStart(L.cb, "0")}</th>)}</tr></thead>
          <tbody>{L.rowsG.map((rg, r) => <tr key={rg}><th className="px-2 text-xs text-muted-foreground">{rg.toString(2).padStart(L.rb, "0")}</th>{L.colsG.map((_, c) => { const m = L.cell(r, c); const v = on.includes(m) ? "1" : dcs.includes(m) ? "X" : "0"; const g = sol ? marks(m) : ""; return (
            <td key={c} data-m={m} className={`h-14 w-16 border border-border text-center align-middle ${g ? "bg-accent" : ""}`}><div className={v === "1" ? "text-primary" : "text-muted-foreground"}>{v}</div><div className="text-[10px] text-muted-foreground">m{m}{g && ` · ${g}`}</div></td>); })}</tr>)}</tbody>
        </table>
      </div>
      {sol && res && <div className="mt-4">
        <Row k={form === "sop" ? "prime implicants (groups of 1s/X)" : "prime implicants of F' (groups of 0s/X)"} v={res.primes.map((p) => form === "sop" ? productTerm(p, n) : sumTerm(p, n)).join("  ") || "none"} />
        <Row k="essential" v={res.essential.map((p) => form === "sop" ? productTerm(p, n) : sumTerm(p, n)).join("  ") || "none"} />
        <Row k={`minimal ${form.toUpperCase()}`} v={expr} />
        <Row k="groups (cell letters)" v={cover.map((p, i) => `${GROUP_MARK[i]} = ${form === "sop" ? productTerm(p, n) : sumTerm(p, n)} (${implCells(p, n).length} cells)`).join("; ") || "—"} />
        {covers.length > 1 && <div className="mt-2 flex flex-wrap items-center gap-1 font-mono text-xs"><span className="text-muted-foreground">{covers.length}{covers.length >= 24 ? "+" : ""} equally minimal covers:</span>{covers.map((_, i) => <button key={i} type="button" aria-pressed={i === pick} className={`btn ${i === pick ? "btn-primary" : "btn-ghost"}`} onClick={() => setPick(i)}>#{i + 1}</button>)}</div>}
        <p className="mt-3 font-mono text-sm" aria-live="polite">{ver?.ok ? `✓ Verified: matches the truth table on all ${2 ** n - dcs.length} specified rows (don't-cares free).` : `✗ Mismatch at m${ver && !ver.ok ? ver.row : "?"}`}</p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">Automatic: Quine–McCluskey finds every prime implicant, then an exhaustive search finds every cover with the fewest terms, then fewest literals. This is exact for ≤4 variables; minimality is for two-level form, not total gate count.</p>
      </div>}
    </Box>
  );
}