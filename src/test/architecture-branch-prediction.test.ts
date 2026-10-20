import { describe, expect, it } from "vitest";
import { parseBranchTrace, simulateBranchPrediction } from "@/lib/architecture-branch-prediction";
import { getLesson, labIndex, tracks } from "@/content";

describe("branch prediction reference model", () => {
  it("scores static always-not-taken prediction", () => {
    const r = simulateBranchPrediction("always-not-taken", ["T", "N", "T", "N"], 3);
    expect(r).toMatchObject({ branches: 4, mispredictions: 2, accuracy: 50, penaltyCycles: 6, averagePenaltyPerBranch: 1.5 });
  });
  it("updates one-bit history to the last actual outcome", () => {
    const r = simulateBranchPrediction("one-bit", ["T", "T", "N", "T"], 2);
    expect(r.steps.map(s => s.prediction)).toEqual(["N", "T", "T", "N"]);
    expect(r.mispredictions).toBe(3);
  });
  it("uses saturating two-bit transitions", () => {
    const r = simulateBranchPrediction("two-bit", ["T", "T", "T", "N"], 2);
    expect(r.steps.map(s => s.stateBefore)).toEqual([1, 2, 3, 3]);
    expect(r.steps.map(s => s.stateAfter)).toEqual([2, 3, 3, 2]);
    expect(r.steps.map(s => s.prediction)).toEqual(["N", "T", "T", "T"]);
  });
  it("parses whitespace and comma-separated outcomes", () => {
    expect(parseBranchTrace("T, T; N\nT")).toEqual(["T", "T", "N", "T"]);
    expect(parseBranchTrace("").length).toBe(0);
    expect(() => parseBranchTrace("T X N")).toThrow(RangeError);
    expect(() => parseBranchTrace(3 as unknown as string)).toThrow(RangeError);
  });
  it("validates predictor and penalty", () => {
    expect(() => simulateBranchPrediction("mystery" as "one-bit", ["T"])).toThrow(RangeError);
    expect(() => simulateBranchPrediction("two-bit", ["T"], -1)).toThrow(RangeError);
    expect(() => simulateBranchPrediction("two-bit", ["T"], 1.5)).toThrow(RangeError);
  });
  it("registers the lesson and interactive lab", () => {
    expect(tracks.architecture.lessons.map(l => l.slug)).toContain("branch-prediction-control-hazards");
    expect(getLesson("architecture", "branch-prediction-control-hazards")?.checks).toHaveLength(6);
    expect(labIndex.some(l => l.id === "archbranch" && l.track === "architecture")).toBe(true);
  });

  it("handles an empty trace and zero penalty without inventing misses", () => {
    expect(simulateBranchPrediction("two-bit", [], 0)).toMatchObject({ branches: 0, mispredictions: 0, accuracy: 100, penaltyCycles: 0, averagePenaltyPerBranch: 0 });
    expect(simulateBranchPrediction("always-not-taken", ["T", "T"], 0).penaltyCycles).toBe(0);
  });
});
