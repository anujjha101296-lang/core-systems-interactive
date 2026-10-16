import { describe, expect, it } from "vitest";
import { analyzeFullAdderVectors } from "@/lib/dl-verification";
import { getLesson, labIndex } from "@/content";

describe("self-checking verification coverage model", () => {
  it("reports exhaustive full-adder coverage for all eight vectors", () => {
    const r = analyzeFullAdderVectors("000 001 010 011 100 101 110 111");
    expect(r).toMatchObject({ covered: 8, totalVectors: 8, coveragePercent: 100, passCount: 8, failCount: 0, invalid: [], duplicateCount: 0 });
  });
  it("does not count duplicates twice", () => {
    const r = analyzeFullAdderVectors("000 000 111");
    expect(r.covered).toBe(2);
    expect(r.duplicateCount).toBe(1);
    expect(r.coveragePercent).toBe(25);
  });
  it("reports invalid tokens without counting them as coverage", () => {
    const r = analyzeFullAdderVectors("000 01x 101 1010");
    expect(r.covered).toBe(2);
    expect(r.invalid).toEqual(["01x", "1010"]);
  });
  it("handles an empty suite and rejects non-text input", () => {
    expect(analyzeFullAdderVectors("").coveragePercent).toBe(0);
    expect(() => analyzeFullAdderVectors(5 as unknown as string)).toThrow(RangeError);
  });
  it("registers lesson and lab", () => {
    expect(getLesson("digital-logic", "verification-testbench-design")?.checks).toHaveLength(6);
    expect(labIndex.some(l => l.id === "verification" && l.track === "digital-logic")).toBe(true);
  });
});
