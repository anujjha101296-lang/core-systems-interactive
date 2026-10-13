import { describe, expect, it } from "vitest";
import {
  parseInBase,
  addFlags,
  f32Bits,
  bitsToF32,
  float32RoundingError,
  mux,
  demux,
  decoder,
  priorityEncoder,
  halfAdder,
  fullAdder,
  rippleCarryAdd,
  alu,
} from "@/lib/dl-math";
import { tracks, getLesson } from "@/content";

describe("digital logic lessons", () => {
  it("publishes the first six lessons with at least 4 checks", () => {
    const ls = tracks["digital-logic"].lessons;
    expect(ls.map((l) => l.slug)).toEqual([
      "number-systems",
      "twos-complement",
      "fixed-ieee754",
      "boolean-gates",
      "karnaugh-maps",
      "combinational-blocks",
    ]);
    ls.forEach((l) => {
      expect(l.checks.length).toBeGreaterThanOrEqual(4);
      if (l.bridge) expect(getLesson(l.bridge.to.track, l.bridge.to.slug)).toBeDefined();
    });
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

describe("IEEE-754 rounding error calculations", () => {
  it("computes exact and inexact errors correctly", () => {
    const ex = float32RoundingError("-6.5", bitsToF32(f32Bits(-6.5)));
    expect(ex).not.toBeNull();
    expect(ex!.exact).toBe(true);
    expect(ex!.diff).toBe(0);

    const inex = float32RoundingError("0.1", bitsToF32(f32Bits(0.1)));
    expect(inex).not.toBeNull();
    expect(inex!.exact).toBe(false);
    expect(Math.abs(inex!.diff)).toBeGreaterThan(0);
    expect(inex!.relDiff).toBeGreaterThan(0);

    // specials return null to avoid misleading metrics
    expect(float32RoundingError("1e39", bitsToF32(f32Bits(1e39)))).toBeNull();
    expect(float32RoundingError("Infinity", Infinity)).toBeNull();
    expect(float32RoundingError("NaN", NaN)).toBeNull();
    expect(float32RoundingError("", 1.0)).toBeNull();
  });
});

describe("combinational building blocks", () => {
  it("multiplexer and demultiplexer", () => {
    expect(mux(0, [false, true, true, false])).toBe(false);
    expect(mux(1, [false, true, true, false])).toBe(true);
    expect(mux(2, [false, true, true, false])).toBe(true);
    expect(mux(3, [false, true, true, false])).toBe(false);
    expect(mux(4, [false, true])).toBe(false);

    expect(demux(true, 2, 4)).toEqual([false, false, true, false]);
    expect(demux(false, 2, 4)).toEqual([false, false, false, false]);
  });

  it("decoder and priority encoder", () => {
    expect(decoder(2, 2, true)).toEqual([false, false, true, false]);
    expect(decoder(2, 2, false)).toEqual([false, false, false, false]);
    expect(decoder(0, 3, true)[0]).toBe(true);
    expect(decoder(7, 3, true)[7]).toBe(true);

    expect(priorityEncoder([false, false, true, false])).toEqual({ code: 2, valid: true });
    expect(priorityEncoder([true, false, true, true])).toEqual({ code: 3, valid: true });
    expect(priorityEncoder([false, false, false, false])).toEqual({ code: 0, valid: false });
  });

  it("half adder and full adder truth tables", () => {
    expect(halfAdder(false, false)).toEqual({ sum: false, carry: false });
    expect(halfAdder(true, false)).toEqual({ sum: true, carry: false });
    expect(halfAdder(false, true)).toEqual({ sum: true, carry: false });
    expect(halfAdder(true, true)).toEqual({ sum: false, carry: true });

    for (let a = 0; a <= 1; a++) {
      for (let b = 0; b <= 1; b++) {
        for (let cin = 0; cin <= 1; cin++) {
          const res = fullAdder(a === 1, b === 1, cin === 1);
          const expSum = (a + b + cin) % 2 === 1;
          const expCarry = a + b + cin >= 2;
          expect(res.sum).toBe(expSum);
          expect(res.carry).toBe(expCarry);
        }
      }
    }
  });

  it("ripple-carry adder arithmetic and subtraction", () => {
    // 5 (0101) + 3 (0011) = 8 (1000)
    const a = [true, false, true, false]; // LSB first: 1, 0, 1, 0
    const b = [true, true, false, false]; // LSB first: 1, 1, 0, 0
    const rAdd = rippleCarryAdd(a, b, false);
    expect(rAdd.sum).toEqual([false, false, false, true]); // 8 in binary LSB-first
    expect(rAdd.carryOut).toBe(false);

    // 15 (1111) + 1 (0001) = 0 with carry-out
    const rOvf = rippleCarryAdd([true, true, true, true], [true, false, false, false], false);
    expect(rOvf.sum).toEqual([false, false, false, false]);
    expect(rOvf.carryOut).toBe(true);

    // Subtraction: 7 (0111) − 2 (0010) = 5 (0101)
    // Invert B: ~2 (1101) = [true, false, true, true] LSB first, cin = true
    const notB = [true, false, true, true];
    const rSub = rippleCarryAdd([true, true, true, false], notB, true);
    expect(rSub.sum).toEqual([true, false, true, false]); // 5
    expect(rSub.carryOut).toBe(true); // no borrow
  });

  it("ALU operations and condition flags", () => {
    // ADD 5 + 3 = 8
    const rAdd = alu(5, 3, "ADD", 4);
    expect(rAdd.result).toBe(8);
    expect(rAdd.zero).toBe(false);
    expect(rAdd.carryOut).toBe(false);

    // SUB 5 - 5 = 0 (Zero flag)
    const rZero = alu(5, 5, "SUB", 4);
    expect(rZero.result).toBe(0);
    expect(rZero.zero).toBe(true);

    // SUB 5 - 8 = 13 (underflow in unsigned, negative flag)
    const rSub = alu(5, 8, "SUB", 4);
    expect(rSub.result).toBe(13);
    expect(rSub.zero).toBe(false);
    expect(rSub.carryOut).toBe(false); // borrow
    expect(rSub.binResult[0]).toBe("1"); // MSB is 1

    // Signed overflow: 7 + 1 in 4-bit = 8 (-8 signed) -> V = 1
    const rOvf = alu(7, 1, "ADD", 4);
    expect(rOvf.overflow).toBe(true);

    // Logic operations
    expect(alu(0b1100, 0b1010, "AND", 4).result).toBe(0b1000);
    expect(alu(0b1100, 0b1010, "OR", 4).result).toBe(0b1110);
    expect(alu(0b1100, 0b1010, "XOR", 4).result).toBe(0b0110);
    expect(alu(3, 5, "SLT", 4).result).toBe(1);
    expect(alu(5, 3, "SLT", 4).result).toBe(0);
  });

  it("lesson metadata and checks integrity", () => {
    const l = getLesson("digital-logic", "combinational-blocks");
    expect(l).toBeDefined();
    expect(l!.checks.length).toBeGreaterThanOrEqual(6);
    expect(l!.lab).toBe("combo");
    expect(l!.bridge?.to.track).toBe("digital-logic");
    expect(getLesson(l!.bridge!.to.track, l!.bridge!.to.slug)).toBeDefined();
  });
});