import { describe, expect, it } from "vitest";
import { arithmeticResult, signedValue } from "@/lib/dl-arithmetic";
import { getLesson, labIndex } from "@/content";

describe("fixed-width arithmetic and ALU flags", () => {
  it("wraps unsigned addition and reports carry independently", () => {
    expect(arithmeticResult(15, 1, 4)).toMatchObject({ result: 0, carryOut: 1, zero: true, overflow: false });
  });
  it("distinguishes signed overflow from unsigned carry", () => {
    expect(arithmeticResult(7, 3, 4)).toMatchObject({ result: 10, carryOut: 0, overflow: true, signedResult: -6, negative: true });
    expect(arithmeticResult(15, 1, 4)).toMatchObject({ result: 0, carryOut: 1, overflow: false });
  });
  it("implements subtraction with two's-complement carry convention", () => {
    expect(arithmeticResult(2, 5, 4, true)).toMatchObject({ result: 13, carryOut: 0, signedResult: -3, overflow: false });
    expect(arithmeticResult(7, 3, 4, true)).toMatchObject({ result: 4, carryOut: 1, signedResult: 4, overflow: false });
    expect(arithmeticResult(8, 1, 4, true)).toMatchObject({ result: 7, overflow: true, signedResult: 7 });
  });
  it("exhaustively matches the low-width bit-vector arithmetic for every 4-bit pair", () => {
    for (let a = 0; a < 16; a++) for (let b = 0; b < 16; b++) for (const sub of [false, true]) {
      const r = arithmeticResult(a, b, 4, sub);
      const expected = (sub ? a - b : a + b) & 15;
      expect(r.result).toBe(expected);
      expect(r.zero).toBe(expected === 0);
      expect(r.negative).toBe((expected & 8) !== 0);
      const sa = signedValue(a, 4), sb = signedValue(b, 4);
      const mathematical = sub ? sa - sb : sa + sb;
      expect(r.overflow).toBe(mathematical < -8 || mathematical > 7);
    }
  });
  it("rejects invalid widths and out-of-range operands", () => {
    expect(() => arithmeticResult(0, 0, 0)).toThrow(RangeError);
    expect(() => arithmeticResult(16, 0, 4)).toThrow(RangeError);
    expect(() => arithmeticResult(0, -1, 4)).toThrow(RangeError);
    expect(() => signedValue(16, 4)).toThrow(RangeError);
  });
  it("registers the lesson and lab", () => {
    expect(getLesson("digital-logic", "rtl-arithmetic-and-alu")?.checks).toHaveLength(6);
    expect(labIndex.some(l => l.id === "arithmetic" && l.track === "digital-logic")).toBe(true);
  });

  it("checks signed boundary overflow in both directions", () => {
    expect(arithmeticResult(7, 1, 4)).toMatchObject({ result: 8, overflow: true, signedResult: -8 });
    expect(arithmeticResult(8, 15, 4)).toMatchObject({ result: 7, overflow: true, signedResult: 7 });
    expect(arithmeticResult(8, 0, 4)).toMatchObject({ result: 8, overflow: false, signedResult: -8 });
  });
});
