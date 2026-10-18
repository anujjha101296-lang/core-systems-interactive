import { describe, expect, it } from "vitest";
import { isAllowedStoreBufferingOutcome, storeBufferingOutcomes } from "@/lib/architecture-memory-consistency";
import { getLesson, labIndex } from "@/content";

describe("memory consistency store-buffering litmus model",()=>{
 it("excludes 00 under sequential consistency",()=>{
  expect(storeBufferingOutcomes("SC").map(o=>o.label)).toEqual(["01","10","11"]);
  expect(isAllowedStoreBufferingOutcome("SC",0,0)).toBe(false);
 });
 it("includes 00 under the simplified relaxed model",()=>{
  expect(storeBufferingOutcomes("relaxed").map(o=>o.label)).toEqual(["00","01","10","11"]);
  expect(isAllowedStoreBufferingOutcome("relaxed",0,0)).toBe(true);
 });
 it("keeps other outcomes allowed in both models",()=>{
  for(const label of ["01","10","11"]){
   const a=Number(label[0]) as 0|1,b=Number(label[1]) as 0|1;
   expect(isAllowedStoreBufferingOutcome("SC",a,b)).toBe(true);
   expect(isAllowedStoreBufferingOutcome("relaxed",a,b)).toBe(true);
  }
 });
 it("rejects invalid model and result values",()=>{
  expect(()=>storeBufferingOutcomes("invalid" as "SC")).toThrow(RangeError);
  expect(()=>isAllowedStoreBufferingOutcome("SC",2,0)).toThrow(RangeError);
 });
 it("registers lesson and lab",()=>{
  expect(getLesson("architecture","memory-consistency-ordering")?.checks).toHaveLength(6);
  expect(labIndex.some(l=>l.id==="archconsistency"&&l.track==="architecture")).toBe(true);
 });
});
