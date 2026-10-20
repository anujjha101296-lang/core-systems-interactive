import { describe, expect, it } from "vitest";
import { amdahlSpeedup, compareExecutionTimes, cpuExecutionTime } from "@/lib/architecture-performance";
import { getLesson, labIndex, tracks } from "@/content";

describe("CPU performance and Amdahl's law", () => {
 it("calculates CPU time from instruction count, CPI and clock rate", () => {
  expect(cpuExecutionTime(600_000_000, 2, 3)).toBeCloseTo(0.4);
 });
 it("compares execution times with speedup and runtime reduction", () => {
  expect(compareExecutionTimes(12, 4)).toEqual({ speedup: 3, improvementPercent: 66.66666666666667 });
  expect(compareExecutionTimes(4, 8).improvementPercent).toBe(-100);
 });
 it("obeys Amdahl's law and its limiting cases", () => {
  expect(amdahlSpeedup(0.8, 4)).toBeCloseTo(2.5);
  expect(amdahlSpeedup(0, 20)).toBe(1);
  expect(amdahlSpeedup(1, 5)).toBe(5);
 });
 it("rejects invalid measurements and fractions", () => {
  expect(() => cpuExecutionTime(-1, 1, 2)).toThrow(RangeError);
  expect(() => cpuExecutionTime(100, 0, 2)).toThrow(RangeError);
  expect(() => amdahlSpeedup(1.1, 2)).toThrow(RangeError);
  expect(() => amdahlSpeedup(0.5, 0.5)).toThrow(RangeError);
  expect(() => compareExecutionTimes(0, 2)).toThrow(RangeError);
 });
 it("registers the lesson and interactive lab", () => {
  expect(tracks.architecture.lessons.map(l => l.slug)).toContain("cpu-performance-cpi-amdahl");
  expect(getLesson("architecture", "cpu-performance-cpi-amdahl")?.checks.length).toBeGreaterThanOrEqual(6);
  expect(labIndex.some(l => l.id === "archperf" && l.track === "architecture")).toBe(true);
 });
});
