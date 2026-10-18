import { describe, expect, it } from "vitest";
import { estimateParallelScalability } from "@/lib/architecture-scalability";

describe("multicore scalability and contention estimator",()=>{
 it("matches the ideal Amdahl speedup when overhead is zero",()=>{
  const r=estimateParallelScalability(8,90,10000,0,0,false);
  expect(r.speedup).toBeCloseTo(1/(0.1+0.9/8));
  expect(r.efficiency).toBeCloseTo(r.speedup/8);
 });
 it("adds synchronization and false-sharing costs explicitly",()=>{
  const noSharing=estimateParallelScalability(8,90,10000,20,40,false);
  const sharing=estimateParallelScalability(8,90,10000,20,40,true);
  expect(sharing.syncOverhead).toBe(140);
  expect(sharing.falseSharingOverhead).toBe(280);
  expect(sharing.totalParallelTime).toBeGreaterThan(noSharing.totalParallelTime);
  expect(sharing.speedup).toBeLessThan(noSharing.speedup);
 });
 it("handles a single core and a fully serial workload",()=>{
  expect(estimateParallelScalability(1,90,1000,20,40,true).speedup).toBe(1);
  expect(estimateParallelScalability(8,0,1000,0,0,false).speedup).toBe(1);
 });
 it("rejects invalid cores, fractions and overhead values",()=>{
  expect(()=>estimateParallelScalability(0,90,1000,0,0,false)).toThrow(RangeError);
  expect(()=>estimateParallelScalability(8,101,1000,0,0,false)).toThrow(RangeError);
  expect(()=>estimateParallelScalability(8,90,1000,-1,0,false)).toThrow(RangeError);
  expect(()=>estimateParallelScalability(8,90,1000,0,0,1 as unknown as boolean)).toThrow(RangeError);
 });

 it("shows overhead can erase gains at high core counts",()=>{
  const ideal=estimateParallelScalability(32,100,32000,0,0,false);
  const contended=estimateParallelScalability(32,100,32000,200,100,true);
  expect(ideal.speedup).toBe(32);
  expect(contended.speedup).toBeLessThan(ideal.speedup);
 });
});
