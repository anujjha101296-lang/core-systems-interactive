import { describe, expect, it } from "vitest";
import { alu, decodeNTo2N, demux1, encodeOneHot, fullAdder, halfAdder, mux2, rippleCarryAdd } from "@/lib/dl-combinational";
import { getLesson } from "@/content";

describe("combinational circuit helpers", () => {
  it("implements mux and demux selection", () => {
    expect(mux2(0,1,0)).toBe(0); expect(mux2(0,1,1)).toBe(1);
    expect(demux1(1,0)).toEqual([1,0]); expect(demux1(1,1)).toEqual([0,1]);
  });
  it("implements decoder and one-hot encoder with invalid-input checks", () => {
    expect(decodeNTo2N(5,3)).toBe(32); expect(encodeOneHot(32,8)).toBe(5);
    expect(() => decodeNTo2N(4,2)).toThrow(); expect(() => encodeOneHot(3,4)).toThrow();
  });
  it("covers all half-adder and full-adder behavior", () => {
    expect(halfAdder(0,0)).toEqual({sum:0,carry:0}); expect(halfAdder(1,1)).toEqual({sum:0,carry:1});
    expect(fullAdder(1,1,1)).toEqual({sum:1,carry:1}); expect(fullAdder(1,0,1)).toEqual({sum:0,carry:1});
  });
  it("ripple-carry handles propagation and width wrap", () => {
    expect(rippleCarryAdd(7,5,4).sum).toBe(12);
    expect(rippleCarryAdd(15,1,4)).toMatchObject({sum:0,carry:1});
    expect(rippleCarryAdd(1,1,1)).toMatchObject({sum:0,carry:1});
    expect(() => rippleCarryAdd(16,0,4)).toThrow();
  });
  it("ALU masks results and reports zero/carry/no-borrow consistently", () => {
    expect(alu(9,3,4,"SUB")).toMatchObject({result:6,carry:true,zero:false});
    expect(alu(15,1,4,"ADD")).toMatchObject({result:0,carry:true,zero:true});
    expect(alu(3,3,4,"XOR")).toMatchObject({result:0,zero:true});
    expect(alu(0,1,4,"SUB")).toMatchObject({result:15,carry:false,negative:true});
  });
  it("registers the next Digital Logic lesson and its lab", () => {
    const l = getLesson("digital-logic","combinational-building-blocks");
    expect(l?.checks.length).toBeGreaterThanOrEqual(6); expect(l?.lab).toBe("combinational");
  });
});
