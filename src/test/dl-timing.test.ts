import { describe, expect, it } from "vitest";
import { analyzeTiming, hazardDescription, synchronizerStagesForAsyncInput } from "@/lib/dl-timing";
import { getLesson, labIndex } from "@/content";

describe("digital timing and reliability", () => {
 it("calculates setup and hold slack with skew sign convention", () => {
  expect(analyzeTiming({clockPeriod:5,clkToQ:0.4,combDelay:3.2,setup:0.5,skew:0.2,hold:0.25,minCombDelay:0.1})).toMatchObject({requiredPeriod:4.3,setupSlack:0.7,holdSlack:-0.35,setupPass:true,holdPass:false});
 });
 it("validates timing inputs", () => {
  expect(() => analyzeTiming({clockPeriod:0,clkToQ:0,combDelay:0,setup:0,skew:0,hold:0,minCombDelay:0})).toThrow(RangeError);
  expect(() => analyzeTiming({clockPeriod:3,clkToQ:-1,combDelay:1,setup:0,skew:0,hold:0,minCombDelay:0})).toThrow(RangeError);
 });
 it("describes hazards and validates synchronizer stage count", () => {
  expect(hazardDescription("static-1")).toContain("drops from 1 to 0");
  expect(hazardDescription("static-0")).toContain("rises from 0 to 1");
  expect(hazardDescription("dynamic")).toContain("multiple unintended transitions");
  expect(synchronizerStagesForAsyncInput(2)).toBe(2);
  expect(() => synchronizerStagesForAsyncInput(1)).toThrow(RangeError);
 });
 it("registers lesson and lab", () => {
  expect(getLesson("digital-logic","timing-hazards-reliable-design")?.checks.length).toBeGreaterThanOrEqual(6);
  expect(labIndex.some(l=>l.id==="timing"&&l.slug==="timing-hazards-reliable-design")).toBe(true);
 });
});
