import { describe, expect, it } from "vitest";
import { analyzeStaPath } from "@/lib/dl-sta";
import { getLesson, labIndex, tracks } from "@/content";

describe("static timing analysis teaching model", () => {
  const base = { periodNs:5, clockToQNs:0.4, maxCombNs:3.2, minCombNs:0.15, setupNs:0.5, holdNs:0.1, uncertaintyNs:0.1, captureSkewNs:0.2, falsePath:false, hasClock:true, hasIoDelays:true, hasGeneratedClocks:true };
  it("computes setup and hold slack independently", () => {
    const r = analyzeStaPath(base);
    expect(r.requiredPeriodNs).toBeCloseTo(4.0);
    expect(r.setupSlackNs).toBeCloseTo(1.0);
    expect(r.holdSlackNs).toBeCloseTo(0.15);
    expect(r.setupPass).toBe(true);
    expect(r.holdPass).toBe(true);
    expect(r.fmaxMHz).toBeCloseTo(250);
  });
  it("flags a setup violation while retaining independent hold result", () => {
    const r = analyzeStaPath({ ...base, periodNs:3 });
    expect(r.setupPass).toBe(false);
    expect(r.holdPass).toBe(true);
    expect(r.warnings.some(w => w.includes("Setup violation"))).toBe(true);
  });
  it("warns about missing constraints", () => {
    const r = analyzeStaPath({ ...base, hasClock:false, hasIoDelays:false, hasGeneratedClocks:false });
    expect(r.constraintsComplete).toBe(false);
    expect(r.warnings.some(w => w.includes("No clock constraint"))).toBe(true);
    expect(r.warnings.some(w => w.includes("I/O delays"))).toBe(true);
    expect(r.warnings.some(w => w.includes("Generated clocks"))).toBe(true);
  });
  it("does not treat a false-path exception as a timing fix", () => {
    const r = analyzeStaPath({ ...base, periodNs:1, falsePath:true });
    expect(r.disabledByFalsePath).toBe(true);
    expect(r.warnings.some(w => w.includes("does not make the path faster"))).toBe(true);
  });
  it("rejects impossible delay ordering and invalid period", () => {
    expect(() => analyzeStaPath({ ...base, minCombNs:4 })).toThrow(RangeError);
    expect(() => analyzeStaPath({ ...base, periodNs:0 })).toThrow(RangeError);
  });
  it("registers the lesson and lab and updates planned count", () => {
    expect(tracks["digital-logic"].lessons.map(l => l.slug)).toContain("static-timing-constraints-closure");
    expect(getLesson("digital-logic","static-timing-constraints-closure")?.checks).toHaveLength(6);
    expect(labIndex.some(l => l.id==="sta"&&l.track==="digital-logic")).toBe(true);
    expect(tracks["digital-logic"].planned).toBe(19);
  });

  it("detects hold failure independently of setup and marks partial constraints incomplete", () => {
    const holdFail = analyzeStaPath({ ...base, minCombNs:0, captureSkewNs:0.4 });
    expect(holdFail.holdPass).toBe(false);
    expect(holdFail.warnings.some(w => w.includes("Hold violation"))).toBe(true);
    const partial = analyzeStaPath({ ...base, hasGeneratedClocks:false });
    expect(partial.constraintsComplete).toBe(false);
  });

  it("accounts for negative capture skew in both checks", () => {
    const r = analyzeStaPath({ ...base, captureSkewNs:-0.2 });
    expect(r.setupSlackNs).toBeCloseTo(0.6);
    expect(r.holdSlackNs).toBeCloseTo(0.55);
  });
});
