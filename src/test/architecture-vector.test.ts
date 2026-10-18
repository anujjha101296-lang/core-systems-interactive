import { describe, expect, it } from "vitest";
import { estimateVectorExecution } from "@/lib/architecture-vector";
import { getLesson, labIndex } from "@/content";

describe("SIMD/vector execution estimator",()=>{
 it("computes chunks, tail utilization and modeled speedup",()=>{
  expect(estimateVectorExecution(37,8,4,6,1)).toMatchObject({elements:37,lanes:8,chunks:5,scalarCycles:148,vectorCycles:11,wastedLaneSlots:3});
  expect(estimateVectorExecution(37,8,4,6,1).laneUtilization).toBeCloseTo(0.925);
  expect(estimateVectorExecution(37,8,4,6,1).speedup).toBeCloseTo(148/11);
 });
 it("handles exact multiples and empty work",()=>{
  expect(estimateVectorExecution(32,8,4,6,1)).toMatchObject({chunks:4,wastedLaneSlots:0,laneUtilization:1});
  expect(estimateVectorExecution(0,8,4,6,1)).toMatchObject({chunks:0,scalarCycles:0,vectorCycles:0,speedup:0,laneUtilization:0});
 });
 it("shows startup cost can erase a small workload advantage",()=>{
  const r=estimateVectorExecution(2,8,2,20,1);
  expect(r.scalarCycles).toBe(4);
  expect(r.vectorCycles).toBe(21);
  expect(r.speedup).toBeLessThan(1);
 });
 it("rejects invalid dimensions and costs",()=>{
  expect(()=>estimateVectorExecution(-1,8,4,6,1)).toThrow(RangeError);
  expect(()=>estimateVectorExecution(10,0,4,6,1)).toThrow(RangeError);
  expect(()=>estimateVectorExecution(10,8,0,6,1)).toThrow(RangeError);
 });
 it("registers the lesson and lab",()=>{
  expect(getLesson("architecture","simd-vector-execution")?.checks).toHaveLength(6);
  expect(labIndex.some(l=>l.id==="archvector"&&l.track==="architecture")).toBe(true);
 });
});
