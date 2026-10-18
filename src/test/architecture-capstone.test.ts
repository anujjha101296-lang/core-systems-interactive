import { describe, expect, it } from "vitest";
import { compareCpuOptimization, estimateCpuWorkload, type CpuWorkload } from "@/lib/architecture-capstone";

describe("architecture performance diagnosis capstone",()=>{
 const base:CpuWorkload={instructions:10_000_000,baseCpi:2,otherStallCpi:0,l1MissesPerK:20,missPenaltyCycles:50,branchMispredictsPerK:4,branchPenaltyCycles:10,clockPeriodNs:0.5};
 it("computes the instruction-count CPI and clock-period relationship",()=>{
  const r=estimateCpuWorkload({...base,l1MissesPerK:0,branchMispredictsPerK:0});
  expect(r).toMatchObject({baseCycles:20_000_000,totalCycles:20_000_000,timeMs:10,effectiveCpi:2});
 });
 it("calculates cache and branch stall contributions",()=>{
  const r=estimateCpuWorkload(base);
  expect(r.cacheStallCycles).toBe(10_000_000);
  expect(r.branchStallCycles).toBe(400_000);
  expect(r.totalCycles).toBe(30_400_000);
  expect(r.timeMs).toBe(15.2);
  expect(r.effectiveCpi).toBeCloseTo(3.04);
 });
 it("compares optimization assumptions by elapsed time",()=>{
  const r=compareCpuOptimization(base,50,50,10);
  expect(r.optimized.cacheStallCycles).toBe(5_000_000);
  expect(r.optimized.branchStallCycles).toBe(200_000);
  expect(r.optimized.timeMs).toBeLessThan(r.baseline.timeMs);
  expect(r.speedup).toBeGreaterThan(1);
  expect(r.timeReductionPercent).toBeGreaterThan(0);
 });
 it("rejects invalid workloads and reduction percentages",()=>{
  expect(()=>estimateCpuWorkload({...base,instructions:0})).toThrow(RangeError);
  expect(()=>estimateCpuWorkload({...base,baseCpi:0})).toThrow(RangeError);
  expect(()=>estimateCpuWorkload({...base,clockPeriodNs:-1})).toThrow(RangeError);
  expect(()=>compareCpuOptimization(base,101,0,0)).toThrow(RangeError);
  expect(()=>compareCpuOptimization(base,0,0,100)).toThrow(RangeError);
 });
});
