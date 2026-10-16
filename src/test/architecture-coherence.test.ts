import { describe, expect, it } from "vitest";
import { stepMsi } from "@/lib/architecture-coherence";
import { getLesson, labIndex, tracks } from "@/content";

describe("two-core MSI coherence model", () => {
  it("allows two readers to hold Shared copies", () => {
    const p0 = stepMsi(["I", "I"], 0, "read");
    expect(p0.states).toEqual(["S", "I"]);
    const p1 = stepMsi(p0.states, 1, "read");
    expect(p1.states).toEqual(["S", "S"]);
    expect(p1.busEvent).toContain("shared");
  });
  it("invalidates a shared copy before a write", () => {
    const r = stepMsi(["S", "S"], 0, "write");
    expect(r.states).toEqual(["M", "I"]);
    expect(r.busEvent).toContain("invalidate");
  });
  it("downgrades a modified owner when the other core reads", () => {
    const r = stepMsi(["M", "I"], 1, "read");
    expect(r.states).toEqual(["S", "S"]);
    expect(r.busEvent).toContain("flush");
  });
  it("does not need bus traffic for a local Modified write hit", () => {
    const r = stepMsi(["M", "I"], 0, "write");
    expect(r.hit).toBe(true);
    expect(r.busEvent).toBe("None");
    expect(r.states).toEqual(["M", "I"]);
  });
  it("validates state and operation inputs", () => {
    expect(() => stepMsi(["X" as "I", "I"], 0, "read")).toThrow(RangeError);
    expect(() => stepMsi(["I", "I"], 2 as 0, "read")).toThrow(RangeError);
    expect(() => stepMsi(["I", "I"], 0, "flush" as "read")).toThrow(RangeError);
  });
  it("registers the lesson and lab in the architecture track", () => {
    expect(tracks.architecture.lessons.map(l => l.slug)).toContain("multicore-cache-coherence-msi");
    expect(getLesson("architecture", "multicore-cache-coherence-msi")?.checks).toHaveLength(6);
    expect(labIndex.some(l => l.id === "archcoherence" && l.track === "architecture")).toBe(true);
  });

  it("requires a new ownership transaction after a cache was invalidated", () => {
    const write = stepMsi(["S", "S"], 0, "write");
    expect(write.states).toEqual(["M", "I"]);
    const reread = stepMsi(write.states, 1, "read");
    expect(reread.states).toEqual(["S", "S"]);
    expect(reread.busEvent).toContain("flush");
  });
});
