import { describe, expect, it } from "vitest";
import { binary32, decodeRType, encodeRType, hex32 } from "@/lib/architecture-foundations";
import { getLesson, tracks, labIndex } from "@/content";

describe("Computer Architecture foundations",()=>{
 it("encodes and decodes R-format fields",()=>{
  const fields={opcode:0,rs:8,rt:9,rd:10,shamt:0,funct:32};
  const word=encodeRType(fields);
  expect(hex32(word)).toBe("0x01095020");
  expect(binary32(word)).toHaveLength(32);
  expect(decodeRType(word)).toEqual(fields);
 });
 it("validates all field ranges and word width",()=>{
  expect(()=>encodeRType({opcode:64,rs:0,rt:0,rd:0,shamt:0,funct:0})).toThrow(RangeError);
  expect(()=>encodeRType({opcode:0,rs:32,rt:0,rd:0,shamt:0,funct:0})).toThrow(RangeError);
  expect(()=>decodeRType(-1)).toThrow(RangeError);
  expect(()=>decodeRType(0x100000000)).toThrow(RangeError);
 });
 it("registers the architecture lesson and lab",()=>{
  expect(tracks.architecture.lessons.map(l=>l.slug)).toContain("architecture-foundations-isa");
  expect(getLesson("architecture","architecture-foundations-isa")?.checks.length).toBeGreaterThanOrEqual(4);
  expect(labIndex.some(l=>l.id==="archisa"&&l.track==="architecture")).toBe(true);
 });
});
