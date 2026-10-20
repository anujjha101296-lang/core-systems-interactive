import { describe, expect, it } from "vitest";
import { simulatePreciseTrap } from "@/lib/architecture-exceptions";
import { getLesson, labIndex, tracks } from "@/content";

describe("precise exceptions and interrupt boundaries", () => {
  it("commits older instructions and excludes the faulting instruction", () => {
    const r = simulatePreciseTrap({ startPc: 0x1000, instructionCount: 6, trapIndex: 2, kind: "synchronous-exception", handlerPc: 0x2000, cause: "page fault" });
    expect(r.retired).toEqual([0x1000, 0x1004]);
    expect(r.faulting).toBe(0x1008);
    expect(r.flushed).toEqual([0x100c, 0x1010, 0x1014]);
    expect(r.epc).toBe(0x1008);
    expect(r.cause).toBe("page fault");
  });
  it("takes external interrupts at a retirement boundary", () => {
    const r = simulatePreciseTrap({ startPc: 0x1000, instructionCount: 4, trapIndex: 2, kind: "external-interrupt", handlerPc: 0x3000 });
    expect(r.retired).toEqual([0x1000, 0x1004]);
    expect(r.faulting).toBeNull();
    expect(r.flushed).toEqual([0x1008, 0x100c]);
    expect(r.epc).toBe(0x1008);
  });
  it("supports interrupt before first and after last instruction", () => {
    expect(simulatePreciseTrap({startPc:0x1000,instructionCount:3,trapIndex:0,kind:"external-interrupt",handlerPc:0x2000}).epc).toBe(0x1000);
    expect(simulatePreciseTrap({startPc:0x1000,instructionCount:3,trapIndex:3,kind:"external-interrupt",handlerPc:0x2000}).retired).toEqual([0x1000,0x1004,0x1008]);
  });
  it("validates alignment, count, trap index and kind", () => {
    expect(() => simulatePreciseTrap({startPc:1,instructionCount:3,trapIndex:1,kind:"synchronous-exception",handlerPc:0x2000})).toThrow(RangeError);
    expect(() => simulatePreciseTrap({startPc:0x1000,instructionCount:3,trapIndex:3,kind:"synchronous-exception",handlerPc:0x2000})).toThrow(RangeError);
    expect(() => simulatePreciseTrap({startPc:0x1000,instructionCount:3,trapIndex:4,kind:"external-interrupt",handlerPc:0x2000})).toThrow(RangeError);
    expect(() => simulatePreciseTrap({startPc:0x1000,instructionCount:3,trapIndex:1,kind:"external-interrupt",handlerPc:0x2002})).toThrow(RangeError);
  });
  it("registers the lesson and lab", () => {
    expect(tracks.architecture.lessons.map(l => l.slug)).toContain("precise-exceptions-interrupts");
    expect(getLesson("architecture","precise-exceptions-interrupts")?.checks).toHaveLength(6);
    expect(labIndex.some(l => l.id === "archexceptions" && l.track === "architecture")).toBe(true);
    expect(tracks.architecture.planned).toBe(17);
  });

  it("rejects zero instruction count and supports an interrupt after all retirement", () => {
    expect(() => simulatePreciseTrap({startPc:0x1000,instructionCount:0,trapIndex:0,kind:"external-interrupt",handlerPc:0x2000})).toThrow(RangeError);
    const r = simulatePreciseTrap({startPc:0x1000,instructionCount:2,trapIndex:2,kind:"external-interrupt",handlerPc:0x2000});
    expect(r.retired).toEqual([0x1000,0x1004]);
    expect(r.flushed).toEqual([]);
    expect(r.epc).toBe(0x1008);
  });
});
