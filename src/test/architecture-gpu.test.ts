import { describe, expect, it } from "vitest";
import { estimateGpuWarp } from "@/lib/architecture-gpu";
import { getLesson, labIndex } from "@/content";

describe("GPU SIMT divergence and memory coalescing model",()=>{
 it("models a uniform branch as one fully utilized pass",()=>{
  expect(estimateGpuWarp(32,100,4,4,128)).toMatchObject({pathALanes:32,pathBLanes:0,diverged:false,instructionPasses:1,laneUtilization:1});
  expect(estimateGpuWarp(32,0,4,4,128).instructionPasses).toBe(1);
 });
 it("models divergent paths as two passes",()=>{
  expect(estimateGpuWarp(32,50,4,4,128)).toMatchObject({pathALanes:16,pathBLanes:16,diverged:true,instructionPasses:2,laneUtilization:0.5});
 });
 it("shows adjacent accesses coalesce into one segment",()=>{
  expect(estimateGpuWarp(32,100,4,4,128)).toMatchObject({memorySegments:1,usefulBytes:128,transferredBytes:128,transactionEfficiency:1});
 });
 it("counts multiple segments for strided accesses",()=>{
  expect(estimateGpuWarp(32,100,32,4,128)).toMatchObject({memorySegments:8,usefulBytes:128,transferredBytes:1024,transactionEfficiency:0.125});
 });
 it("rejects invalid lane, stride and segment configuration",()=>{
  expect(()=>estimateGpuWarp(12,50,4,4,128)).toThrow(RangeError);
  expect(()=>estimateGpuWarp(32,101,4,4,128)).toThrow(RangeError);
  expect(()=>estimateGpuWarp(32,50,0,4,128)).toThrow(RangeError);
  expect(()=>estimateGpuWarp(32,50,4,4,96)).toThrow(RangeError);
 });
 it("registers lesson and lab",()=>{
  expect(getLesson("architecture","gpu-simt-coalescing-divergence")?.checks).toHaveLength(6);
  expect(labIndex.some(l=>l.id==="archgpu"&&l.track==="architecture")).toBe(true);
 });
});
