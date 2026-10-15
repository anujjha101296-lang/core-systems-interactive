import { describe, expect, it } from "vitest";
import { scheduleFiveStagePipeline } from "@/lib/architecture-pipeline";
import { getLesson, labIndex, tracks } from "@/content";

const dependent = [
 {label:"ADD",sources:["$t1","$t2"],destination:"$t0"},
 {label:"SUB",sources:["$t0","$t3"],destination:"$t4"}
];
describe("five-stage pipeline hazard model",()=>{
 it("uses ideal k + N - 1 cycles when independent",()=>{
  const r=scheduleFiveStagePipeline([
   {label:"A",sources:[],destination:"$t0"},
   {label:"B",sources:[],destination:"$t1"},
   {label:"C",sources:[],destination:"$t2"}
  ],true);
  expect(r.totalCycles).toBe(7);
  expect(r.stallCount).toBe(0);
 });
 it("uses forwarding to avoid an ALU-to-ALU RAW stall",()=>{
  expect(scheduleFiveStagePipeline(dependent,true).stallCount).toBe(0);
  expect(scheduleFiveStagePipeline(dependent,false).stallCount).toBeGreaterThan(0);
 });
 it("inserts a load-use bubble even with forwarding",()=>{
  const r=scheduleFiveStagePipeline([
   {label:"LW",sources:["$s0"],destination:"$t0",load:true},
   {label:"ADD",sources:["$t0","$t1"],destination:"$t2"}
  ],true);
  expect(r.stallCount).toBe(1);
  expect(r.totalCycles).toBe(7);
 });
 it("rejects empty or oversized instruction sequences",()=>{
  expect(()=>scheduleFiveStagePipeline([],true)).toThrow(RangeError);
  expect(()=>scheduleFiveStagePipeline(Array.from({length:13},(_,i)=>({label:String(i),sources:[]})),true)).toThrow(RangeError);
 });
 it("registers the pipeline lesson and lab",()=>{
  expect(tracks.architecture.lessons.map(l=>l.slug)).toContain("pipeline-hazards-forwarding");
  expect(getLesson("architecture","pipeline-hazards-forwarding")?.checks.length).toBeGreaterThanOrEqual(6);
  expect(labIndex.some(l=>l.id==="archpipeline"&&l.track==="architecture")).toBe(true);
 });
});
