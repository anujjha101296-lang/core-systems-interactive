import { describe, expect, it } from "vitest";
import { countLutOnes, evaluateLut, lutTruthTable, validateLut } from "@/lib/dl-fpga-lut";
import { getLesson, labIndex } from "@/content";

describe("FPGA LUT truth-table model",()=>{
 it("evaluates the 4-input parity truth table",()=>{
  const mask=0x6996;
  expect(Array.from({length:16},(_,i)=>evaluateLut(mask,i,4))).toEqual(Array.from({length:16},(_,i)=>(i.toString(2).replace(/0/g,"").length%2) as 0|1));
  expect(countLutOnes(mask,4)).toBe(8);
 });
 it("represents constant zero and constant one LUTs",()=>{
  expect(lutTruthTable(0,4).every(r=>r.output===0)).toBe(true);
  expect(lutTruthTable(0xffff,4).every(r=>r.output===1)).toBe(true);
 });
 it("supports the highest bit in a 5-input LUT",()=>{
  expect(evaluateLut(0x80000000,31,5)).toBe(1);
  expect(evaluateLut(0x80000000,30,5)).toBe(0);
  expect(validateLut(0xffffffff,5).entries).toBe(32);
 });
 it("rejects invalid LUT widths, masks and input indices",()=>{
  expect(()=>validateLut(0,0)).toThrow(RangeError);
  expect(()=>validateLut(0,6)).toThrow(RangeError);
  expect(()=>validateLut(0x10000,4)).toThrow(RangeError);
  expect(()=>evaluateLut(0,16,4)).toThrow(RangeError);
 });
 it("registers lesson and lab",()=>{
  expect(getLesson("digital-logic","fpga-programmable-logic-luts")?.checks).toHaveLength(6);
  expect(labIndex.some(l=>l.id==="fpgalut"&&l.track==="digital-logic")).toBe(true);
 });
});
