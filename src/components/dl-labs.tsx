import { useState } from "react";
import { parseInBase, addFlags, f32Bits, bitsToF32, canonicalSOP, compareBool, MAX_BOOL_VARS, kmapLayout, parseIndexList, kmapSolve, verifyAgainstSpec, productTerm, sumTerm, implCells, float32RoundingError, mux, decoder, priorityEncoder, rippleCarryAdd, alu, type AluOpcode } from "@/lib/dl-math";

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
  const rErr = float32RoundingError(dec, val);
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
        {rErr && (
          <div className="mt-2 space-y-1">
            <Row
              k="quantization error (float32 − input float64)"
              v={rErr.exact ? "0 (exact in float32)" : (rErr.diff > 0 ? `+${rErr.diff.toExponential(4)}` : rErr.diff.toExponential(4))}
            />
            {!rErr.exact && rErr.relDiff !== null && (
              <Row k="relative quantization error" v={`${(rErr.relDiff * 100).toExponential(3)}%`} />
            )}
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              Calculated against JavaScript's 64-bit float parse of the decimal input. Numbers with non-power-of-two denominators repeat infinitely in binary and suffer truncation error.
            </p>
          </div>
        )}
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

export function ComboLab() {
  const [tab, setTab] = useState<"mux" | "adder" | "alu">("mux");

  // Mux / Decoder sub-state
  const [blockType, setBlockType] = useState<"mux4" | "dec24" | "penc4">("mux4");
  const [muxData, setMuxData] = useState<[boolean, boolean, boolean, boolean]>([false, true, true, false]);
  const [muxSel, setMuxSel] = useState<number>(1);
  const [decIn, setDecIn] = useState<number>(2);
  const [decEn, setDecEn] = useState<boolean>(true);
  const [decMinterms, setDecMinterms] = useState<number[]>([1, 2]);
  const [pencIn, setPencIn] = useState<[boolean, boolean, boolean, boolean]>([false, false, true, false]);

  // Adder sub-state
  const [adderA, setAdderA] = useState<number>(5);
  const [adderB, setAdderB] = useState<number>(3);
  const [adderSub, setAdderSub] = useState<boolean>(false);

  // ALU sub-state
  const [aluA, setAluA] = useState<number>(9);
  const [aluB, setAluB] = useState<number>(5);
  const [aluOp, setAluOp] = useState<AluOpcode>("ADD");

  // Calculated values
  const muxOut = mux(muxSel, muxData);
  const decOut = decoder(decIn, 2, decEn);
  const pencOut = priorityEncoder(pencIn);

  // 4-bit bit arrays for adder (LSB first)
  const aBits = Array.from({ length: 4 }, (_, i) => ((adderA >> i) & 1) === 1);
  const effB = adderSub ? (~adderB & 0xf) : adderB;
  const bBits = Array.from({ length: 4 }, (_, i) => ((effB >> i) & 1) === 1);
  const rca = rippleCarryAdd(aBits, bBits, adderSub);
  const sumVal = rca.sum.reduce((acc, b, i) => acc | ((b ? 1 : 0) << i), 0);
  const signedOvf = (rca.stages[2]?.cout ?? false) !== rca.carryOut;

  // ALU calc
  const aluRes = alu(aluA, aluB, aluOp, 4);

  return (
    <Box title="Combinational Blocks & ALU">
      <div className="flex gap-1 border-b border-border pb-3">
        {(["mux", "adder", "alu"] as const).map((t) => (
          <button
            key={t}
            type="button"
            className={`btn ${tab === t ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab(t)}
          >
            {t === "mux" ? "1. Multiplexer & Decoder" : t === "adder" ? "2. Ripple-Carry Adder" : "3. 4-Bit ALU"}
          </button>
        ))}
      </div>

      {tab === "mux" && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="font-mono text-xs text-muted-foreground self-center">Block:</span>
            <button
              type="button"
              className={`btn ${blockType === "mux4" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setBlockType("mux4")}
            >
              4:1 Multiplexer
            </button>
            <button
              type="button"
              className={`btn ${blockType === "dec24" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setBlockType("dec24")}
            >
              2-to-4 Decoder & SOP
            </button>
            <button
              type="button"
              className={`btn ${blockType === "penc4" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setBlockType("penc4")}
            >
              4-to-2 Priority Encoder
            </button>
          </div>

          {blockType === "mux4" && (
            <div className="panel p-4 space-y-3">
              <div className="font-mono text-xs text-muted-foreground">
                A 4:1 MUX steers one of 4 data inputs (D0–D3) to output Y based on select lines (S1, S0).
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="eyebrow mb-2">Data Inputs (D3..D0)</div>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const next = [...muxData] as [boolean, boolean, boolean, boolean];
                          next[i] = !next[i];
                          setMuxData(next);
                        }}
                        className={`h-10 w-12 rounded border font-mono text-sm transition-colors ${
                          muxData[i] ? "border-primary bg-primary/20 text-primary font-bold" : "border-border text-muted-foreground"
                        } ${muxSel === i ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                      >
                        D{i}={muxData[i] ? "1" : "0"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="eyebrow mb-2">Select Lines (S1, S0)</div>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2, 3].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setMuxSel(s)}
                        className={`btn font-mono text-xs ${muxSel === s ? "btn-primary" : "btn-ghost"}`}
                      >
                        {s.toString(2).padStart(2, "0")} (D{s})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rule-t pt-3 font-mono text-sm">
                <Row k="Active Select S1,S0" v={`${(muxSel >> 1) & 1},${muxSel & 1} (routes D${muxSel})`} />
                <Row k="Output Y" v={muxOut ? "1" : "0"} />
                <Row
                  k="Boolean Equation"
                  v={`Y = S1'S0'·D0 + S1'S0·D1 + S1S0'·D2 + S1S0·D3 = D${muxSel} = ${muxOut ? "1" : "0"}`}
                />
              </div>
            </div>
          )}

          {blockType === "dec24" && (
            <div className="panel p-4 space-y-3">
              <div className="font-mono text-xs text-muted-foreground">
                An n-to-2ⁿ decoder activates exactly minterm row m_i corresponding to binary input A.
                Connect decoder outputs to an OR gate to implement any sum-of-products function!
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 font-mono text-xs">
                  Enable (EN):
                  <button
                    type="button"
                    className={`btn ${decEn ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setDecEn(!decEn)}
                  >
                    {decEn ? "1 (Active)" : "0 (Disabled)"}
                  </button>
                </label>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span>Input A (A1,A0):</span>
                  {[0, 1, 2, 3].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`btn font-mono text-xs ${decIn === val ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setDecIn(val)}
                    >
                      {val.toString(2).padStart(2, "0")} (m{val})
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                {decOut.map((active, i) => (
                  <div
                    key={i}
                    className={`rounded border p-2 text-center font-mono ${
                      active ? "border-primary bg-primary/20 text-primary font-bold" : "border-border text-muted-foreground"
                    }`}
                  >
                    <div className="text-xs">Y{i} (m{i})</div>
                    <div className="text-lg">{active ? "1" : "0"}</div>
                  </div>
                ))}
              </div>

              <div className="rule-t pt-3">
                <div className="eyebrow mb-2">Build Function F with OR Gate: pick minterms</div>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((m) => {
                    const checked = decMinterms.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setDecMinterms(checked ? decMinterms.filter((x) => x !== m) : [...decMinterms, m].sort());
                        }}
                        className={`btn font-mono text-xs ${checked ? "btn-primary" : "btn-ghost"}`}
                      >
                        m{m} ({checked ? "included" : "excluded"})
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 font-mono text-xs">
                  <Row
                    k="Synthesized F"
                    v={decMinterms.length ? `Σm(${decMinterms.join(", ")})` : "0"}
                  />
                  <Row
                    k="Evaluated F for input A"
                    v={decEn && decMinterms.includes(decIn) ? "1" : "0"}
                  />
                </div>
              </div>
            </div>
          )}

          {blockType === "penc4" && (
            <div className="panel p-4 space-y-3">
              <div className="font-mono text-xs text-muted-foreground">
                A priority encoder encodes the highest-index asserted input into binary. Used in interrupt controllers and bus arbiters.
              </div>
              <div className="eyebrow">Assert Inputs (I3 has highest priority):</div>
              <div className="flex gap-2">
                {[3, 2, 1, 0].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const next = [...pencIn] as [boolean, boolean, boolean, boolean];
                      next[i] = !next[i];
                      setPencIn(next);
                    }}
                    className={`h-12 w-16 rounded border font-mono text-xs transition-colors ${
                      pencIn[i] ? "border-primary bg-primary/20 text-primary font-bold" : "border-border text-muted-foreground"
                    } ${pencOut.valid && pencOut.code === i ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                  >
                    I{i}={pencIn[i] ? "1" : "0"}
                    <div className="text-[10px] text-muted-foreground">{i === 3 ? "highest" : i === 0 ? "lowest" : `prio ${i}`}</div>
                  </button>
                ))}
              </div>
              <div className="rule-t pt-3 font-mono text-sm">
                <Row k="Valid bit V (any input asserted?)" v={pencOut.valid ? "1" : "0"} />
                <Row k="Encoded output (Y1, Y0)" v={pencOut.valid ? `${pencOut.code.toString(2).padStart(2, "0")} (decimal ${pencOut.code})` : "XX (invalid)"} />
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "adder" && (
        <div className="mt-4 space-y-4">
          <div className="font-mono text-xs text-muted-foreground">
            A 4-bit Ripple-Carry Adder chains 4 Full Adders. Carry-out from bit i ripples into carry-in of bit i+1.
            Turning on Subtract inverts B and sets C0=1 (forming Two's Complement A + ~B + 1).
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
            <label className="flex items-center gap-1">
              <span>A (0..15):</span>
              <input
                type="number"
                min={0}
                max={15}
                className="field w-20"
                value={adderA}
                onChange={(e) => setAdderA(Math.max(0, Math.min(15, +e.target.value)))}
              />
            </label>
            <button
              type="button"
              className={`btn ${adderSub ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setAdderSub(!adderSub)}
            >
              Mode: {adderSub ? "SUBTRACT (A − B)" : "ADD (A + B)"}
            </button>
            <label className="flex items-center gap-1">
              <span>B (0..15):</span>
              <input
                type="number"
                min={0}
                max={15}
                className="field w-20"
                value={adderB}
                onChange={(e) => setAdderB(Math.max(0, Math.min(15, +e.target.value)))}
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-[500px]">
              {[3, 2, 1, 0].map((bitIdx) => {
                const stage = rca.stages[bitIdx]!;
                return (
                  <div key={bitIdx} className="flex-1 rounded border border-border p-3 font-mono text-xs panel">
                    <div className="eyebrow text-center mb-2">Stage FA{bitIdx}</div>
                    <div className="space-y-1">
                      <Row k="A bit" v={stage.a ? "1" : "0"} />
                      <Row k={adderSub ? "~B bit" : "B bit"} v={stage.b ? "1" : "0"} />
                      <Row k="Cin" v={stage.cin ? "1" : "0"} />
                      <div className="rule-t pt-1 font-bold">
                        <Row k="Sum" v={stage.sum ? "1" : "0"} />
                        <Row k="Cout" v={stage.cout ? "1" : "0"} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel p-4 font-mono text-sm space-y-1">
            <Row k="A in binary" v={adderA.toString(2).padStart(4, "0")} />
            <Row k={adderSub ? "B (inverted with Cin=1)" : "B in binary"} v={effB.toString(2).padStart(4, "0")} />
            <Row k="4-bit Result Sum" v={`${rca.sum.map((b) => (b ? "1" : "0")).reverse().join("")} (unsigned ${sumVal})`} />
            <Row k="Final Carry-out (C4)" v={rca.carryOut ? "1" : "0"} />
            <Row k="Signed Overflow V = C3 ⊕ C4" v={signedOvf ? "1 (OVERFLOW)" : "0 (no overflow)"} />
            <Row
              k="Signed interpretation"
              v={adderSub ? `${adderA >= 8 ? adderA - 16 : adderA} − ${adderB >= 8 ? adderB - 16 : adderB} = ${sumVal >= 8 ? sumVal - 16 : sumVal}` : `${adderA >= 8 ? adderA - 16 : adderA} + ${adderB >= 8 ? adderB - 16 : adderB} = ${sumVal >= 8 ? sumVal - 16 : sumVal}`}
            />
          </div>
        </div>
      )}

      {tab === "alu" && (
        <div className="mt-4 space-y-4">
          <div className="font-mono text-xs text-muted-foreground">
            The Arithmetic Logic Unit (ALU) combines arithmetic (adder/subtractor) and bitwise operations,
            selected by an operation code (ALUOp). It generates condition flags used for branching.
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">ALUOp:</span>
            {(["ADD", "SUB", "AND", "OR", "XOR", "SLT"] as const).map((op) => (
              <button
                key={op}
                type="button"
                className={`btn font-mono text-xs ${aluOp === op ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setAluOp(op)}
              >
                {op}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 font-mono text-sm">
            <label className="flex items-center gap-2">
              <span>Operand A (4-bit):</span>
              <input
                type="number"
                min={0}
                max={15}
                className="field w-24"
                value={aluA}
                onChange={(e) => setAluA(Math.max(0, Math.min(15, +e.target.value)))}
              />
              <span className="text-xs text-muted-foreground">({aluA.toString(2).padStart(4, "0")})</span>
            </label>
            <label className="flex items-center gap-2">
              <span>Operand B (4-bit):</span>
              <input
                type="number"
                min={0}
                max={15}
                className="field w-24"
                value={aluB}
                onChange={(e) => setAluB(Math.max(0, Math.min(15, +e.target.value)))}
              />
              <span className="text-xs text-muted-foreground">({aluB.toString(2).padStart(4, "0")})</span>
            </label>
          </div>

          <div className="panel p-4 font-mono text-sm space-y-2">
            <div className="eyebrow">ALU Result & Condition Flags</div>
            <Row k={`Operation: ${aluOp}`} v={`${aluRes.binResult}₂ (unsigned ${aluRes.result})`} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className={`rounded border p-2 text-center ${aluRes.zero ? "border-primary bg-primary/20 text-primary font-bold" : "border-border text-muted-foreground"}`}>
                <div className="text-xs">Z (Zero Flag)</div>
                <div className="text-lg">{aluRes.zero ? "1" : "0"}</div>
                <div className="text-[10px]">Result == 0 (BEQ)</div>
              </div>
              <div className={`rounded border p-2 text-center ${aluRes.carryOut ? "border-primary bg-primary/20 text-primary font-bold" : "border-border text-muted-foreground"}`}>
                <div className="text-xs">C (Carry Out)</div>
                <div className="text-lg">{aluRes.carryOut ? "1" : "0"}</div>
                <div className="text-[10px]">Unsigned overflow</div>
              </div>
              <div className={`rounded border p-2 text-center ${aluRes.overflow ? "border-destructive bg-destructive/20 text-destructive font-bold" : "border-border text-muted-foreground"}`}>
                <div className="text-xs">V (Overflow)</div>
                <div className="text-lg">{aluRes.overflow ? "1" : "0"}</div>
                <div className="text-[10px]">Signed overflow</div>
              </div>
              <div className={`rounded border p-2 text-center ${(aluRes.result & 8) !== 0 ? "border-primary bg-primary/20 text-primary font-bold" : "border-border text-muted-foreground"}`}>
                <div className="text-xs">N (Negative)</div>
                <div className="text-lg">{(aluRes.result & 8) !== 0 ? "1" : "0"}</div>
                <div className="text-[10px]">Sign bit MSB</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}