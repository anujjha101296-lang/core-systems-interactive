import { describe, expect, it } from "vitest";
import { simulateTranslations, translateAddress, validateVirtualMemoryConfig } from "@/lib/architecture-vm";
import { getLesson, labIndex, tracks } from "@/content";

describe("virtual memory and TLB",()=>{
 const config={pageBytes:256,tlbEntries:2,addressBits:16,pageTable:{0:3,1:7,2:5}};
 it("splits VPN and offset and translates without changing offset",()=>{
  const r=translateAddress(0x012a,config,new Map());
  expect(r).toMatchObject({virtualPage:1,offset:42,physicalPage:7,physicalAddress:1834,tlbHit:false,pageFault:false});
 });
 it("distinguishes a TLB miss from a page fault",()=>{
  const rows=simulateTranslations([0x0004,0x0008,0x0104,0x0108,0x0300],config);
  expect(rows.map(r=>[r.tlbHit,r.pageFault])).toEqual([[false,false],[true,false],[false,false],[true,false],[false,true]]);
 });
 it("uses LRU replacement when TLB capacity is exceeded",()=>{
  const rows=simulateTranslations([0x0000,0x0100,0x0004,0x0200,0x0008],config);
  expect(rows.map(r=>r.tlbHit)).toEqual([false,false,true,false,false]);
 });
 it("rejects invalid page size, mapping and virtual address",()=>{
  expect(()=>validateVirtualMemoryConfig({...config,pageBytes:100})).toThrow(RangeError);
  expect(()=>validateVirtualMemoryConfig({...config,pageTable:{256:1}})).toThrow(RangeError);
  expect(()=>translateAddress(65536,config,new Map())).toThrow(RangeError);
 });
 it("registers the lesson and lab",()=>{
  expect(tracks.architecture.lessons.map(l=>l.slug)).toContain("virtual-memory-tlb");
  expect(getLesson("architecture","virtual-memory-tlb")?.checks.length).toBeGreaterThanOrEqual(6);
  expect(labIndex.some(l=>l.id==="archvm"&&l.track==="architecture")).toBe(true);
 });
});
