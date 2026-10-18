import { describe, expect, it } from "vitest";
import { resetSynchronizer, stepSynchronizer } from "@/lib/dl-cdc";
import { getLesson, labIndex } from "@/content";

describe("two-flop CDC synchronizer model",()=>{
 it("moves a stable high level through two destination edges",()=>{
  let s=resetSynchronizer();
  const first=stepSynchronizer(s,1);s=first.next;
  expect(s).toMatchObject({stage1:1,stage2:0,cycles:1});
  const second=stepSynchronizer(s,1);s=second.next;
  expect(s).toMatchObject({stage1:1,stage2:1,cycles:2});
  expect(second.output).toBe(1);
 });
 it("preserves nonblocking-style previous-stage semantics",()=>{
  let s={stage1:1 as 0|1,stage2:0 as 0|1,cycles:4};
  s=stepSynchronizer(s,0).next;
  expect(s).toMatchObject({stage1:0,stage2:1,cycles:5});
  s=stepSynchronizer(s,0).next;
  expect(s).toMatchObject({stage1:0,stage2:0,cycles:6});
 });
 it("resets both stages and the cycle counter",()=>{
  expect(resetSynchronizer()).toEqual({stage1:0,stage2:0,cycles:0});
 });
 it("rejects invalid bits and invalid cycle state",()=>{
  expect(()=>stepSynchronizer(resetSynchronizer(),2)).toThrow(RangeError);
  expect(()=>stepSynchronizer({stage1:2 as 0|1,stage2:0,cycles:0},0)).toThrow(RangeError);
  expect(()=>stepSynchronizer({stage1:0,stage2:0,cycles:-1},0)).toThrow(RangeError);
 });
 it("registers the CDC lesson and lab",()=>{
  expect(getLesson("digital-logic","clock-domain-crossing-reset")?.checks).toHaveLength(6);
  expect(labIndex.some(l=>l.id==="cdc"&&l.track==="digital-logic")).toBe(true);
 });
});
