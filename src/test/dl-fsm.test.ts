import { describe, expect, it } from "vitest";
import { bitsFromString, detectorMealyOutput, detectorMooreOutput, detectorNextState, runDetector } from "@/lib/dl-fsm";
import { getLesson, labIndex } from "@/content";

describe("overlapping 101 FSM", () => {
  it("defines every transition for both input bits", () => {
    expect([0,1,2,3].map((s) => [detectorNextState(s as 0|1|2|3,0), detectorNextState(s as 0|1|2|3,1)])).toEqual([[0,1],[2,1],[0,3],[2,1]]);
  });
  it("pulses Mealy output only when input completes 101", () => {
    expect(detectorMealyOutput(2,1)).toBe(1);
    expect(detectorMealyOutput(2,0)).toBe(0);
    expect(detectorMealyOutput(1,1)).toBe(0);
  });
  it("asserts Moore output only in detected state", () => {
    expect([0,1,2,3].map((s) => detectorMooreOutput(s as 0|1|2|3))).toEqual([0,0,0,1]);
  });
  it("preserves overlap for 10101", () => {
    const mealy = runDetector("10101","mealy");
    expect(mealy.map((r) => r.output)).toEqual([0,0,1,0,1]);
    expect(mealy.map((r) => r.stateAfter)).toEqual([1,2,3,2,3]);
  });
  it("ignores whitespace and separators, rejects invalid characters", () => {
    expect(bitsFromString("1 0,1_0")).toEqual([1,0,1,0]);
    expect(() => bitsFromString("10x1")).toThrow(RangeError);
    expect(() => detectorNextState(4 as 0|1|2|3,0)).toThrow(RangeError);
  });
  it("registers the lesson and lab", () => {
    expect(getLesson("digital-logic","finite-state-machines")?.lab).toBe("fsm");
    expect(labIndex.some((l) => l.id === "fsm" && l.slug === "finite-state-machines")).toBe(true);
  });
});
