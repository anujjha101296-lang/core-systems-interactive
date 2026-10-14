import { describe, expect, it } from "vitest";
import { evaluateDatapath } from "@/lib/architecture-datapath";
import { getLesson, labIndex, tracks } from "@/content";

describe("single-cycle datapath model",()=>{
 it("computes R-type ALU results and register write control",()=>{
  expect(evaluateDatapath({instruction:"add",rsValue:7,rtValue:5,immediate:0,pc:0x1000,memoryWord:0})).toMatchObject({aluControl:"ADD",aluResult:12,regWrite:true,destination:"rd",writeback:12,nextPc:0x1004});
  expect(evaluateDatapath({instruction:"and",rsValue:6,rtValue:3,immediate:0,pc:0x1000,memoryWord:0}).aluResult).toBe(2);
 });
 it("distinguishes load/store side effects",()=>{
  expect(evaluateDatapath({instruction:"lw",rsValue:100,rtValue:0,immediate:8,pc:0x1000,memoryWord:42})).toMatchObject({aluResult:108,memRead:true,memWrite:false,memToReg:true,regWrite:true,destination:"rt",writeback:42});
  expect(evaluateDatapath({instruction:"sw",rsValue:100,rtValue:42,immediate:8,pc:0x1000,memoryWord:0})).toMatchObject({aluResult:108,memRead:false,memWrite:true,regWrite:false,destination:"none",writeback:null});
 });
 it("computes BEQ branch target only when operands match",()=>{
  expect(evaluateDatapath({instruction:"beq",rsValue:9,rtValue:9,immediate:3,pc:0x1000,memoryWord:0})).toMatchObject({zero:true,branch:true,nextPc:0x1010});
  expect(evaluateDatapath({instruction:"beq",rsValue:9,rtValue:8,immediate:3,pc:0x1000,memoryWord:0}).nextPc).toBe(0x1004);
 });
 it("validates PC and registers the lesson/lab",()=>{
  expect(()=>evaluateDatapath({instruction:"add",rsValue:0,rtValue:0,immediate:0,pc:-1,memoryWord:0})).toThrow(RangeError);
  expect(tracks.architecture.lessons.map(l=>l.slug)).toContain("single-cycle-datapath-control");
  expect(getLesson("architecture","single-cycle-datapath-control")?.checks.length).toBeGreaterThanOrEqual(6);
  expect(labIndex.some(l=>l.id==="archdatapath"&&l.track==="architecture")).toBe(true);
 });
});
