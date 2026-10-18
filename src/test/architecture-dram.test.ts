import { describe, expect, it } from "vitest";
import { simulateDramTrace, validateDramConfig } from "@/lib/architecture-dram";

describe("DRAM row-buffer timing model",()=>{
 const cfg={banks:4,rowBytes:1024,tCL:12,tRCD:12,tRP:12};
 it("classifies same-row requests as hits",()=>{
  const r=simulateDramTrace([0,4,16],cfg);
  expect(r.accesses.map(a=>a.kind)).toEqual(["closed-row","row-hit","row-hit"]);
  expect(r.accesses.map(a=>a.latency)).toEqual([24,12,12]);
  expect(r).toMatchObject({rowHits:2,closedRows:1,rowConflicts:0,totalCycles:48});
 });
 it("charges precharge plus activation for a row conflict",()=>{
  const r=simulateDramTrace([0,4096,0],cfg);
  expect(r.accesses.map(a=>a.kind)).toEqual(["closed-row","row-conflict","row-conflict"]);
  expect(r.accesses.map(a=>a.latency)).toEqual([24,36,36]);
  expect(r.totalCycles).toBe(96);
 });
 it("tracks independent open rows in different banks",()=>{
  const r=simulateDramTrace([0,1024,2048,0],cfg);
  expect(r.accesses.map(a=>a.bank)).toEqual([0,0,0,0]);
  const otherBank=simulateDramTrace([0,1024,0],cfg);
  expect(otherBank.accesses.map(a=>a.bank)).toEqual([0,1,0]);
  expect(otherBank.accesses.map(a=>a.kind)).toEqual(["closed-row","closed-row","row-hit"]);
 });
 it("calculates zero and nonzero average latency",()=>{
  expect(simulateDramTrace([],cfg)).toMatchObject({totalCycles:0,averageCycles:0});
  expect(simulateDramTrace([0,4],cfg).averageCycles).toBe(18);
 });
 it("rejects invalid configuration and addresses",()=>{
  expect(()=>validateDramConfig({...cfg,banks:3})).toThrow(RangeError);
  expect(()=>validateDramConfig({...cfg,rowBytes:1000})).toThrow(RangeError);
  expect(()=>simulateDramTrace([-1],cfg)).toThrow(RangeError);
  expect(()=>simulateDramTrace([0],{...cfg,tCL:0})).toThrow(RangeError);
 });
});
