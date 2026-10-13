import { describe, expect, it } from "vitest";
import { dFlipFlop, dLatch, isRisingEdge, srLatch } from "@/lib/dl-sequential";
import { getLesson, labIndex } from "@/content";

describe("sequential circuit models", () => {
  it("stores and holds state in an active-high SR latch", () => {
    expect(srLatch(1,0,0)).toMatchObject({q:1,qBar:0});
    expect(srLatch(0,1,1)).toMatchObject({q:0,qBar:1});
    expect(srLatch(0,0,1)).toMatchObject({q:1,qBar:0});
    expect(srLatch(1,1,0).note).toContain("Forbidden");
  });
  it("makes a D latch transparent only while enabled", () => {
    expect(dLatch(1,1,0)).toBe(1);
    expect(dLatch(1,0,0)).toBe(0);
  });
  it("captures D only on a rising edge and gives reset priority", () => {
    expect(isRisingEdge(0,1)).toBe(true);
    expect(isRisingEdge(1,0)).toBe(false);
    expect(dFlipFlop(1,0,false)).toBe(0);
    expect(dFlipFlop(1,0,true)).toBe(1);
    expect(dFlipFlop(1,1,true,1)).toBe(0);
  });
  it("rejects invalid runtime bit values", () => {
    expect(() => srLatch(2 as 0|1,0,0)).toThrow(RangeError);
    expect(() => dLatch(0,2 as 0|1,0)).toThrow(RangeError);
    expect(() => dFlipFlop(0,0,false,2 as 0|1)).toThrow(RangeError);
  });
  it("registers the lesson and interactive lab", () => {
    expect(getLesson("digital-logic","sequential-foundations")?.lab).toBe("sequential");
    expect(labIndex.some(l => l.id === "sequential" && l.slug === "sequential-foundations")).toBe(true);
  });
});
