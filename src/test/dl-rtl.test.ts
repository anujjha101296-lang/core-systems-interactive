import { describe, expect, it } from "vitest";
import { rtlSnippets, simulateRtl } from "@/lib/dl-rtl";
import { getLesson, labIndex } from "@/content";

describe("RTL reference models", () => {
  it("selects either mux input for all select choices", () => {
    expect(simulateRtl("mux2", { a: 0, b: 1, sel: 0 }).outputs.y).toBe(0);
    expect(simulateRtl("mux2", { a: 0, b: 1, sel: 1 }).outputs.y).toBe(1);
  });
  it("calculates sum and carry for all full-adder input combinations", () => {
    for (const a of [0, 1]) for (const b of [0, 1]) for (const cin of [0, 1]) {
      const result = simulateRtl("full-adder", { a, b, cin }).outputs;
      expect(result.sum + 2 * result.cout).toBe(a + b + cin);
    }
  });
  it("models synchronous reset priority, enable capture, and hold", () => {
    expect(simulateRtl("d-flop", { d: 1, en: 1, reset: 1, q: 1 }).outputs.qNext).toBe(0);
    expect(simulateRtl("d-flop", { d: 1, en: 1, reset: 0, q: 0 }).outputs.qNext).toBe(1);
    expect(simulateRtl("d-flop", { d: 1, en: 0, reset: 0, q: 0 }).outputs.qNext).toBe(0);
  });
  it("rejects non-binary inputs and unknown examples", () => {
    expect(() => simulateRtl("mux2", { a: 2, b: 0, sel: 0 })).toThrow(RangeError);
    expect(() => simulateRtl("full-adder", { a: 0, b: 1, cin: -1 })).toThrow(RangeError);
    expect(() => simulateRtl("d-flop", { d: 0, en: 1, reset: 0, q: 4 })).toThrow(RangeError);
  });
  it("registers lesson and workbench and keeps code examples available", () => {
    expect(getLesson("digital-logic", "rtl-verilog-foundations")?.checks).toHaveLength(6);
    expect(labIndex.some((lab) => lab.id === "rtl" && lab.slug === "rtl-verilog-foundations")).toBe(true);
    expect(rtlSnippets.mux2).toContain("always_comb");
    expect(rtlSnippets["d-flop"]).toContain("always_ff");
  });
});
