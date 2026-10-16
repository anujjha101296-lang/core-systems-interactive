import { describe, expect, it } from "vitest";
import { parseInBase, addFlags, f32Bits, bitsToF32 } from "@/lib/dl-math";
import { tracks, getLesson } from "@/content";

describe("digital logic lessons", () => {
  it("publishes the current Digital Logic lessons with at least 4 checks", () => {
    const ls = tracks["digital-logic"].lessons;
    expect(ls.map((l) => l.slug)).toEqual(["number-systems", "twos-complement", "fixed-ieee754", "boolean-gates", "karnaugh-maps", "combinational-building-blocks", "sequential-foundations", "registers-shift-registers-counters", "finite-state-machines", "timing-hazards-reliable-design", "rtl-verilog-foundations", "rtl-arithmetic-and-alu"]);
    ls.forEach((l) => { expect(l.checks.length).toBeGreaterThanOrEqual(4); if (l.bridge) expect(getLesson(l.bridge.to.track, l.bridge.to.slug)).toBeDefined(); });
  });
  it("base conversion", () => {
    expect(parseInBase("2F", 16)).toBe(47n);
    expect(parseInBase("101101", 2)).toBe(45n);
    expect(parseInBase("755", 8)!.toString(2)).toBe("111101101");
    expect(parseInBase("19", 8)).toBeNull();
  });
  it("two's complement flags", () => {
    expect(addFlags(0x70, 0x50, 8)).toMatchObject({ carry: false, overflow: true, signed: -64, unsigned: 192 });
    expect(addFlags(-16, 32, 8)).toMatchObject({ carry: true, overflow: false, signed: 16 });
    expect(addFlags(-128, 1, 8, true)).toMatchObject({ overflow: true, signed: 127 });
    expect(addFlags(5, 3, 8, true)).toMatchObject({ overflow: false, signed: 2, carry: true });
  });
  it("IEEE-754 encode/decode", () => {
    expect(f32Bits(-6.5)).toBe(0xc0d00000);
    expect(bitsToF32(0x41200000)).toBe(10);
    expect(bitsToF32(0x3f800000)).toBe(1);
  });
});

import { parseBool, truthTable, canonicalSOP, equivalent, evalBool } from "@/lib/dl-math";
describe("signed arithmetic edge cases", () => {
  it("4-bit and 16-bit boundaries", () => {
    expect(addFlags(7, 1, 4)).toMatchObject({ signed: -8, overflow: true, carry: false });
    expect(addFlags(-8, -1, 4)).toMatchObject({ signed: 7, overflow: true, carry: true });
    expect(addFlags(32767, 1, 16)).toMatchObject({ signed: -32768, overflow: true });
    expect(addFlags(0, 0, 8, true)).toMatchObject({ signed: 0, carry: true, overflow: false });
    expect(addFlags(3, 5, 8, true)).toMatchObject({ signed: -2, unsigned: 254, carry: false, overflow: false });
  });
});
describe("IEEE-754 edge cases", () => {
  it("specials, subnormals and rounding", () => {
    expect(f32Bits(Infinity)).toBe(0x7f800000);
    expect(f32Bits(-Infinity)).toBe(0xff800000);
    expect(Number.isNaN(bitsToF32(0x7fc00000))).toBe(true);
    expect(f32Bits(-0)).toBe(0x80000000);
    expect(bitsToF32(0x00000001)).toBe(2 ** -149);
    expect(bitsToF32(0x00800000)).toBe(2 ** -126);
    expect(f32Bits(1e39)).toBe(0x7f800000);
    expect(f32Bits(0.1)).toBe(0x3dcccccd);
    expect(bitsToF32(f32Bits(16777217))).toBe(16777216); // ties-to-even
  });
});
describe("boolean algebra", () => {
  it("parses with precedence NOT > AND > XOR > OR", () => {
    expect(truthTable(parseBool("A ^ B")).minterms).toEqual([1, 2]);
    expect(truthTable(parseBool("A + B C")).minterms).toEqual([3, 4, 5, 6, 7]);
    expect(evalBool(parseBool("!A'"), { A: true })).toBe(true);
    expect(() => parseBool("A + (B")).toThrow();
    expect(() => parseBool("")).toThrow();
  });
  it("equivalences from the lesson", () => {
    expect(equivalent(parseBool("A'B + AB'"), parseBool("A^B")).equal).toBe(true);
    expect(equivalent(parseBool("(AB)'"), parseBool("A'+B'")).equal).toBe(true);
    expect(equivalent(parseBool("(AB)'"), parseBool("A'B'")).equal).toBe(false);
    expect(equivalent(parseBool("AB+AB'+A'B"), parseBool("A+B")).equal).toBe(true);
    expect(equivalent(parseBool("AB+A'C+BC"), parseBool("AB+A'C")).equal).toBe(true);
  });
  it("canonical SOP and lesson checks", () => {
    expect(canonicalSOP(["A", "B"], [1, 3])).toBe("A'B + AB");
    expect(truthTable(parseBool("A'B+AB")).minterms).toEqual([1, 3]);
    const l = getLesson("digital-logic", "boolean-gates")!;
    expect(l.checks.length).toBeGreaterThanOrEqual(4);
    expect(l.lab).toBe("boolean");
  });
});