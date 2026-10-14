import { describe, expect, it } from "vitest";
import { counterNext, registerNext, shiftRegisterNext } from "@/lib/dl-registers";
import { getLesson, labIndex } from "@/content";
describe("registers and counters",()=>{
 it("implements reset priority, enable hold and load",()=>{
  expect(registerNext(3,10,4,0,0)).toBe(3);
  expect(registerNext(3,10,4,1,0)).toBe(10);
  expect(registerNext(3,10,4,1,1)).toBe(0);
 });
 it("shifts bits in the specified direction",()=>{
  expect(shiftRegisterNext(5,1,4,"left")).toBe(11);
  expect(shiftRegisterNext(5,1,4,"right")).toBe(10);
  expect(shiftRegisterNext(5,0,4,"left",0)).toBe(5);
 });
 it("wraps up/down counters modulo 2^n",()=>{
  expect(counterNext(15,4,"up")).toBe(0);
  expect(counterNext(0,3,"down")).toBe(7);
  expect(counterNext(4,3,"up",0)).toBe(4);
  expect(counterNext(6,3,"up",1,1)).toBe(0);
 });
 it("rejects invalid widths and out-of-range state",()=>{
  expect(()=>counterNext(0,0)).toThrow(RangeError);
  expect(()=>registerNext(16,0,4)).toThrow(RangeError);
 });
 it("registers lesson and lab",()=>{
  expect(getLesson("digital-logic","registers-shift-registers-counters")?.lab).toBe("registers");
  expect(labIndex.some(l=>l.id==="registers"&&l.slug==="registers-shift-registers-counters")).toBe(true);
 });
});
