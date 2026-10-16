import { describe, expect, it } from "vitest";
import { estimateIoStrategies } from "@/lib/architecture-io";
import { getLesson, labIndex, tracks } from "@/content";

describe("I/O strategy cost model", () => {
  const base = { eventCount: 1000, bytesPerEvent: 1024, durationMs: 1000, pollCpuFraction: 0.65, pollIntervalMs: 2, interruptOverheadUs: 8, copyNsPerByte: 12, dmaBatchSize: 64, dmaSetupUs: 15, dmaCompletionIrqUs: 8 };
  it("computes polling, interrupt, and DMA CPU estimates", () => {
    const r = estimateIoStrategies(base);
    expect(r).toMatchObject({ pollingCpuMs: 650, pollingDetectionMs: 1, interruptDispatchMs: 0.008, dmaBatches: 16, bytes: 1024000 });
    expect(r.interruptCpuMs).toBeCloseTo(20.288);
    expect(r.dmaCpuMs).toBeCloseTo(0.368);
    expect(r.bestCpuMode).toBe("dma");
  });
  it("shows DMA batching amortizes setup overhead", () => {
    const small = estimateIoStrategies({ ...base, dmaBatchSize: 1 });
    const batched = estimateIoStrategies({ ...base, dmaBatchSize: 100 });
    expect(small.dmaBatches).toBe(1000);
    expect(batched.dmaBatches).toBe(10);
    expect(batched.dmaCpuMs).toBeLessThan(small.dmaCpuMs);
  });
  it("rejects invalid and fractional event counts", () => {
    expect(() => estimateIoStrategies({ ...base, eventCount: -1 })).toThrow(RangeError);
    expect(() => estimateIoStrategies({ ...base, pollCpuFraction: 1.5 })).toThrow(RangeError);
    expect(() => estimateIoStrategies({ ...base, eventCount: 1.5 })).toThrow(RangeError);
    expect(() => estimateIoStrategies({ ...base, dmaBatchSize: 0 })).toThrow(RangeError);
  });
  it("registers lesson and lab", () => {
    expect(tracks.architecture.lessons.map(l => l.slug)).toContain("io-interrupts-dma");
    expect(getLesson("architecture", "io-interrupts-dma")?.checks).toHaveLength(6);
    expect(labIndex.some(l => l.id === "archio" && l.track === "architecture")).toBe(true);
  });
});
