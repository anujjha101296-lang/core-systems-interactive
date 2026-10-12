import { describe, expect, it } from "vitest";
import { compareBool, kmapLayout, kAdjacent, parseIndexList, kmapSolve, verifyAgainstSpec, primeImplicants, productTerm } from "@/lib/dl-math";

describe("Boolean comparison over the union of variables", () => {
  it("F=A, G=B tabulates both variables and is not equivalent", () => {
    const r = compareBool("A", "B");
    if (!r.ok) throw new Error("expected ok");
    expect(r.vars).toEqual(["A", "B"]);
    expect(r.rows.map((x) => [x.out ? 1 : 0, x.g ? 1 : 0])).toEqual([[0, 0], [0, 1], [1, 0], [1, 1]]);
    expect(r.equal).toBe(false);
  });
  it("G with extra variable C is evaluated on rows that include C", () => {
    const r = compareBool("A", "A + BC'C");
    if (!r.ok) throw new Error();
    expect(r.vars).toEqual(["A", "B", "C"]); expect(r.rows).toHaveLength(8); expect(r.equal).toBe(true);
  });
  it("invalid G never reports equivalence; invalid F yields no table", () => {
    expect(compareBool("A", "A +").equal).toBe(null);
    expect(compareBool("A +", "A").ok).toBe(false);
  });
  it("caps the union at 6 variables", () => {
    const r = compareBool("ABCD", "EFG");
    expect(r.ok).toBe(false); expect(!r.ok && r.tooMany).toBe(7);
  });
});

describe("K-map layout", () => {
  it("uses Gray-code order with A as MSB", () => {
    const L = kmapLayout(4);
    expect(L.rowsG).toEqual([0, 1, 3, 2]);
    expect(L.cell(2, 3)).toBe(14); expect(L.cell(3, 0)).toBe(8); expect(L.cell(1, 2)).toBe(7);
    const L3 = kmapLayout(3); expect([0, 1, 2, 3].map((c) => L3.cell(1, c))).toEqual([4, 5, 7, 6]);
  });
  it("every map neighbour, including wrap-around, differs in one bit", () => {
    for (const n of [2, 3, 4] as const) {
      const L = kmapLayout(n), R = L.rowsG.length, C = L.colsG.length;
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        if (C > 1) expect(kAdjacent(L.cell(r, c), L.cell(r, (c + 1) % C))).toBe(true);
        if (R > 2 || r === 0) expect(kAdjacent(L.cell(r, c), L.cell((r + 1) % R, c))).toBe(true);
      }
    }
    expect(kAdjacent(0, 2)).toBe(true); expect(kAdjacent(0, 5)).toBe(false);
  });
  it("rejects invalid minterm lists", () => {
    expect(parseIndexList("0, 16", 4).ok).toBe(false);
    expect(parseIndexList("1, x", 3).ok).toBe(false);
    expect(parseIndexList("2 2", 3).ok).toBe(false);
    expect(parseIndexList("", 3)).toEqual({ ok: true, values: [] });
  });
});

describe("K-map minimisation", () => {
  it("corners and centre: B'D' + BD", () => {
    const s = kmapSolve([0, 2, 5, 7, 8, 10, 13, 15], [], 4);
    expect(s.sop.covers).toHaveLength(1);
    expect(s.sopExpr(s.sop.covers[0]!).split(" + ").sort()).toEqual(["B'D'", "BD"]);
  });
  it("don't-cares enlarge groups", () => {
    const s = kmapSolve([1, 3, 7, 11, 15], [0, 2, 5], 4);
    expect(s.sopExpr(s.sop.covers[0]!).split(" + ").sort()).toEqual(["A'B'", "CD"]);
  });
  it("cyclic map has multiple minimal covers, none essential", () => {
    const s = kmapSolve([0, 1, 2, 5, 6, 7], [], 3);
    expect(s.sop.essential).toHaveLength(0);
    expect(s.sop.covers.length).toBe(2);
    s.sop.covers.forEach((c) => expect(c).toHaveLength(3));
  });
  it("POS of ΠM(0,1) is (A + B)", () => {
    const s = kmapSolve([2, 3, 4, 5, 6, 7], [], 3);
    expect(s.posExpr(s.pos.covers[0]!)).toBe("(A + B)");
  });
  it("constants", () => {
    expect(kmapSolve([], [], 2).sopExpr([])).toBe("0");
    const all = kmapSolve([0, 1, 2, 3], [], 2); expect(all.sopExpr(all.sop.covers[0]!)).toBe("1");
  });
  it("every SOP and POS cover is equivalent to its spec (exhaustive 3-var, sampled 4-var)", () => {
    const check = (n: 2 | 3 | 4, mask: number, dcMask: number) => {
      const on: number[] = [], dc: number[] = [];
      for (let m = 0; m < 2 ** n; m++) { if (dcMask >> m & 1) dc.push(m); else if (mask >> m & 1) on.push(m); }
      const s = kmapSolve(on, dc, n);
      for (const c of s.sop.covers) expect(verifyAgainstSpec(s.sopExpr(c), on, dc, n).ok).toBe(true);
      for (const c of s.pos.covers) expect(verifyAgainstSpec(s.posExpr(c), on, dc, n).ok).toBe(true);
    };
    for (let f = 0; f < 256; f++) check(3, f, 0);
    for (let f = 0; f < 256; f += 7) check(3, f, 0b10010000);
    for (let f = 0; f < 65536; f += 997) { check(4, f, 0); check(4, f, 0b0000001000010000); }
  });
  it("prime implicants of consensus example", () => {
    expect(primeImplicants([3, 5, 6, 7], [], 3).map((p) => productTerm(p, 3)).sort()).toEqual(["AB", "AC", "BC"]);
  });
});