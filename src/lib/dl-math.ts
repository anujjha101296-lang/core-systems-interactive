/** Pure Digital Logic helpers used by the converter labs and tests. */
export function parseInBase(txt: string, base: number): bigint | null {
  const t = txt.trim().toLowerCase().replace(/^(0x|0o|0b)/, "");
  const digits = "0123456789abcdef".slice(0, base);
  if (!t || [...t].some((c) => !digits.includes(c))) return null;
  return [...t].reduce((a, c) => a * BigInt(base) + BigInt(digits.indexOf(c)), 0n);
}

export function addFlags(a: number, b: number, n: number, sub = false) {
  const m = 2 ** n, mask = m - 1;
  const ua = ((a % m) + m) % m; const raw = ((b % m) + m) % m;
  const ub = sub ? (~raw & mask) : raw;
  const sum = ua + ub + (sub ? 1 : 0);
  const r = sum % m; const top = 2 ** (n - 1);
  const sa = ua >= top, sb = (sub ? ((m - raw) % m) : ub) >= top, sr = r >= top;
  const bEff = sub ? (m - raw) % m : ub;
  const overflow = sub ? (sa !== (raw >= top) && sr !== sa) : (sa === sb && sr !== sa);
  const fmt = (x: number) => x.toString(2).padStart(n, "0");
  return { aBits: fmt(ua), bBits: fmt(bEff), rBits: fmt(r), unsigned: r, signed: sr ? r - m : r, carry: sum >= m, overflow };
}

export function f32Bits(x: number) { const d = new DataView(new ArrayBuffer(4)); d.setFloat32(0, x); return d.getUint32(0); }
export function bitsToF32(b: number) { const d = new DataView(new ArrayBuffer(4)); d.setUint32(0, b >>> 0); return d.getFloat32(0); }

/** Boolean expressions: variables A–Z, operators ! or ' (NOT), & or · or * (AND), ^ (XOR), | or + (OR), 0/1, parentheses. Precedence NOT > AND > XOR > OR. Juxtaposition (AB) means AND. */
export type BoolNode = { t: "v"; n: string } | { t: "c"; v: boolean } | { t: "not"; a: BoolNode } | { t: "and" | "or" | "xor"; a: BoolNode; b: BoolNode };

export function parseBool(src: string): BoolNode {
  const s = src.replace(/\s+/g, "").toUpperCase(); let i = 0;
  const peek = () => s[i];
  const or = (): BoolNode => { let a = xor(); while (peek() === "|" || peek() === "+") { i++; a = { t: "or", a, b: xor() }; } return a; };
  const xor = (): BoolNode => { let a = and(); while (peek() === "^") { i++; a = { t: "xor", a, b: and() }; } return a; };
  const startsAtom = (c?: string) => !!c && (/[A-Z01(!]/.test(c));
  const and = (): BoolNode => { let a = not(); for (;;) { if (peek() === "&" || peek() === "*" || peek() === "·") { i++; a = { t: "and", a, b: not() }; } else if (startsAtom(peek())) a = { t: "and", a, b: not() }; else return a; } };
  const not = (): BoolNode => { if (peek() === "!") { i++; return { t: "not", a: not() }; } let a = atom(); while (peek() === "'") { i++; a = { t: "not", a }; } return a; };
  const atom = (): BoolNode => {
    const c = peek();
    if (c === "(") { i++; const e = or(); if (peek() !== ")") throw new Error(`Expected ")" at position ${i + 1}`); i++; return e; }
    if (c === "0" || c === "1") { i++; return { t: "c", v: c === "1" }; }
    if (c && /[A-Z]/.test(c)) { i++; return { t: "v", n: c }; }
    throw new Error(c ? `Unexpected "${c}" at position ${i + 1}` : "Expression ended early");
  };
  if (!s) throw new Error("Empty expression");
  const e = or(); if (i < s.length) throw new Error(`Unexpected "${s[i]}" at position ${i + 1}`);
  return e;
}

export function boolVars(n: BoolNode, acc = new Set<string>()): string[] {
  if (n.t === "v") acc.add(n.n); else if (n.t === "not") boolVars(n.a, acc); else if (n.t !== "c") { boolVars(n.a, acc); boolVars(n.b, acc); }
  return [...acc].sort();
}

export function evalBool(n: BoolNode, env: Record<string, boolean>): boolean {
  switch (n.t) {
    case "v": return !!env[n.n];
    case "c": return n.v;
    case "not": return !evalBool(n.a, env);
    case "and": return evalBool(n.a, env) && evalBool(n.b, env);
    case "or": return evalBool(n.a, env) || evalBool(n.b, env);
    case "xor": return evalBool(n.a, env) !== evalBool(n.b, env);
  }
}

/** Rows in standard order: first variable is the most significant bit. Returns minterm indices where the output is 1. */
export function truthTable(n: BoolNode, vars = boolVars(n)) {
  const rows = Array.from({ length: 2 ** vars.length }, (_, m) => {
    const env = Object.fromEntries(vars.map((v, k) => [v, ((m >> (vars.length - 1 - k)) & 1) === 1]));
    return { m, env, out: evalBool(n, env) };
  });
  return { vars, rows, minterms: rows.filter((r) => r.out).map((r) => r.m) };
}

export function canonicalSOP(vars: string[], minterms: number[]) {
  if (minterms.length === 0) return "0";
  if (minterms.length === 2 ** vars.length) return "1";
  return minterms.map((m) => vars.map((v, k) => ((m >> (vars.length - 1 - k)) & 1 ? v : v + "'")).join("")).join(" + ");
}

/** Equivalent iff identical on every assignment of the union of variables. Returns a counterexample row otherwise. */
export function equivalent(a: BoolNode, b: BoolNode) {
  const vars = [...new Set([...boolVars(a), ...boolVars(b)])].sort();
  for (const r of truthTable(a, vars).rows) if (evalBool(b, r.env) !== r.out) return { equal: false as const, vars, counter: r.env };
  return { equal: true as const, vars };
}

export const MAX_BOOL_VARS = 6;

/** Compare F and G over the UNION of their variables. G is optional. Never evaluates on rows missing a variable. */
export function compareBool(f: string, g: string, max = MAX_BOOL_VARS) {
  let pf: BoolNode | null = null, pg: BoolNode | null = null; let errF = "", errG = "";
  try { pf = parseBool(f); } catch (e) { errF = (e as Error).message; }
  if (g.trim()) { try { pg = parseBool(g); } catch (e) { errG = (e as Error).message; } }
  if (!pf) return { ok: false as const, errF, errG };
  const vars = [...new Set([...boolVars(pf), ...(pg ? boolVars(pg) : [])])].sort();
  if (vars.length > max) return { ok: false as const, errF, errG, tooMany: vars.length };
  const t = truthTable(pf, vars);
  const rows = t.rows.map((r) => ({ ...r, g: pg ? evalBool(pg, r.env) : null }));
  const bad = pg ? rows.find((r) => r.g !== r.out) : undefined;
  return { ok: true as const, errF, errG, vars, rows, minterms: t.minterms, hasG: !!pg, equal: pg && !errG ? !bad : null, counter: bad?.env ?? null };
}

/* ---------- Karnaugh maps (2–4 variables) ---------- */
export const GRAY2 = [0, 1, 3, 2];
/** Layout: row variables are the high bits, column variables the low bits, both in Gray order. */
export function kmapLayout(n: 2 | 3 | 4) {
  const rb = n === 4 ? 2 : 1, cb = n - rb;
  const rowsG = rb === 1 ? [0, 1] : GRAY2, colsG = cb === 1 ? [0, 1] : GRAY2;
  const vars = "ABCD".slice(0, n).split("");
  return { n, rowVars: vars.slice(0, rb), colVars: vars.slice(rb), rowsG, colsG, rb, cb, cell: (r: number, c: number) => ((rowsG[r]! << cb) | colsG[c]!) };
}
export const kAdjacent = (a: number, b: number) => { const x = a ^ b; return x !== 0 && (x & (x - 1)) === 0; };

export function parseIndexList(txt: string, n: number): { ok: true; values: number[] } | { ok: false; error: string } {
  const parts = txt.split(/[\s,]+/).filter(Boolean); const max = 2 ** n - 1; const seen = new Set<number>();
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return { ok: false, error: `"${p}" is not a non-negative integer` };
    const v = +p; if (v > max) return { ok: false, error: `${v} is out of range 0…${max} for ${n} variables` };
    if (seen.has(v)) return { ok: false, error: `${v} is listed twice` }; seen.add(v);
  }
  return { ok: true, values: [...seen].sort((a, b) => a - b) };
}

/** An implicant: bits where mask=1 are fixed to `value`; mask=0 bits are eliminated. */
export type Implicant = { value: number; mask: number };
export const implCells = (p: Implicant, n: number) => Array.from({ length: 2 ** n }, (_, m) => m).filter((m) => (m & p.mask) === p.value);
const lits = (p: Implicant, n: number) => { let c = 0; for (let k = 0; k < n; k++) if (p.mask >> k & 1) c++; return c; };
export function productTerm(p: Implicant, n: number) {
  const v = "ABCD".slice(0, n); let s = "";
  for (let k = 0; k < n; k++) { const bit = 1 << (n - 1 - k); if (p.mask & bit) s += v[k] + (p.value & bit ? "" : "'"); }
  return s || "1";
}
export function sumTerm(p: Implicant, n: number) { // p is an implicant of F' (a group of 0s)
  const v = "ABCD".slice(0, n); const t: string[] = [];
  for (let k = 0; k < n; k++) { const bit = 1 << (n - 1 - k); if (p.mask & bit) t.push(v[k] + (p.value & bit ? "'" : "")); }
  return t.length ? `(${t.join(" + ")})` : "0";
}

/** Quine–McCluskey prime implicants of on ∪ dc. */
export function primeImplicants(on: number[], dc: number[], n: number): Implicant[] {
  const full = 2 ** n - 1; let cur = new Map<string, Implicant>();
  for (const m of [...on, ...dc]) cur.set(`${m}/${full}`, { value: m, mask: full });
  const primes = new Map<string, Implicant>();
  while (cur.size) {
    const next = new Map<string, Implicant>(); const used = new Set<string>(); const list = [...cur.entries()];
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const [ka, a] = list[i]!, [kb, b] = list[j]!;
      if (a.mask !== b.mask) continue; const d = a.value ^ b.value;
      if (!kAdjacent(a.value, b.value) || (d & a.mask) !== d) continue;
      const p = { value: a.value & ~d, mask: a.mask & ~d }; next.set(`${p.value}/${p.mask}`, p); used.add(ka); used.add(kb);
    }
    for (const [k, p] of cur) if (!used.has(k)) primes.set(k, p);
    cur = next;
  }
  return [...primes.values()].sort((a, b) => lits(a, n) - lits(b, n) || a.value - b.value);
}

/** Exact minimum covers of `on` by primes (cost: fewest terms, then fewest literals). Returns ALL minimum covers (capped). */
export function minimalCovers(on: number[], dc: number[], n: 2 | 3 | 4, cap = 24) {
  const primes = primeImplicants(on, dc, n);
  const cov = primes.map((p) => new Set(implCells(p, n)));
  const essential = primes.filter((_, i) => on.some((m) => cov[i]!.has(m) && cov.filter((c) => c.has(m)).length === 1));
  if (on.length === 0) return { primes, essential, covers: [[]] as Implicant[][] };
  let best = Infinity, bestLit = Infinity; let out: number[][] = [];
  const search = (chosen: number[], covered: Set<number>) => {
    const left = on.filter((m) => !covered.has(m));
    if (!left.length) {
      const L = chosen.reduce((s, i) => s + lits(primes[i]!, n), 0);
      if (chosen.length < best || (chosen.length === best && L < bestLit)) { best = chosen.length; bestLit = L; out = []; }
      if (chosen.length === best && L === bestLit && out.length < cap) {
        const key = [...chosen].sort((a, b) => a - b).join(","); if (!out.some((o) => o.join(",") === key)) out.push(key.split(",").map(Number));
      }
      return;
    }
    if (chosen.length >= best) return;
    const target = left.reduce((a, m) => (cov.filter((c) => c.has(m)).length < cov.filter((c) => c.has(a)).length ? m : a));
    primes.forEach((_, i) => { if (cov[i]!.has(target) && !chosen.includes(i)) search([...chosen, i], new Set([...covered, ...cov[i]!])); });
  };
  search([], new Set());
  return { primes, essential, covers: out.map((o) => o.map((i) => primes[i]!)) };
}

/** Verify an expression string matches the spec on every non-don't-care row. */
export function verifyAgainstSpec(expr: string, on: number[], dc: number[], n: number) {
  const vars = "ABCD".slice(0, n).split(""); const node = parseBool(expr);
  for (let m = 0; m < 2 ** n; m++) {
    if (dc.includes(m)) continue;
    const env = Object.fromEntries(vars.map((v, k) => [v, ((m >> (n - 1 - k)) & 1) === 1]));
    if (evalBool(node, env) !== on.includes(m)) return { ok: false as const, row: m };
  }
  return { ok: true as const };
}

export function kmapSolve(on: number[], dc: number[], n: 2 | 3 | 4) {
  const all = Array.from({ length: 2 ** n }, (_, m) => m);
  const off = all.filter((m) => !on.includes(m) && !dc.includes(m));
  const sop = minimalCovers(on, dc, n), posF = minimalCovers(off, dc, n);
  const sopExpr = (c: Implicant[]) => (c.length ? c.map((p) => productTerm(p, n)).join(" + ") : "0");
  const posExpr = (c: Implicant[]) => (c.length ? c.map((p) => sumTerm(p, n)).join("") : "1");
  return { off, sop, pos: posF, sopExpr, posExpr };
}