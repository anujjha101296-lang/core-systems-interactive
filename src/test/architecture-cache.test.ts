import { describe, expect, it } from "vitest";
import { averageMemoryAccessTime, decodeCacheAddress, simulateCacheTrace, validateCacheConfig } from "@/lib/architecture-cache";
import { getLesson, labIndex, tracks } from "@/content";

describe("cache mapping and AMAT",()=>{
 it("decodes byte offset, set index and tag",()=>{
  const config={cacheBytes:1024,blockBytes:16,associativity:1,addressBits:16};
  expect(decodeCacheAddress(0x1234,config)).toMatchObject({byteOffset:4,setIndex:35,tag:4});
 });
 it("models direct-mapped conflict misses and later hits",()=>{
  const config={cacheBytes:64,blockBytes:16,associativity:1,addressBits:16};
  const result=simulateCacheTrace([0,64,0,64],config);
  expect(result.map(r=>r.hit)).toEqual([false,false,false,false]);
 });
 it("uses associativity to keep competing blocks in one set",()=>{
  const config={cacheBytes:128,blockBytes:16,associativity:2,addressBits:16};
  const result=simulateCacheTrace([0,64,0],config);
  expect(result.map(r=>r.hit)).toEqual([false,false,true]);
 });
 it("calculates AMAT",()=>expect(averageMemoryAccessTime(2,0.05,40)).toBeCloseTo(4));
 it("rejects invalid geometry and addresses",()=>{
  expect(()=>validateCacheConfig({cacheBytes:100,blockBytes:16,associativity:1})).toThrow(RangeError);
  expect(()=>validateCacheConfig({cacheBytes:64,blockBytes:16,associativity:1,addressBits:4})).toThrow(/tag bits/);
  expect(()=>decodeCacheAddress(65536,{cacheBytes:64,blockBytes:16,associativity:1,addressBits:16})).toThrow(RangeError);
  expect(()=>averageMemoryAccessTime(2,1.1,40)).toThrow(RangeError);
 });
 it("registers the lesson and lab",()=>{
  expect(tracks.architecture.lessons.map(l=>l.slug)).toContain("cache-mapping-amat");
  expect(getLesson("architecture","cache-mapping-amat")?.checks.length).toBeGreaterThanOrEqual(6);
  expect(labIndex.some(l=>l.id==="archcache"&&l.track==="architecture")).toBe(true);
 });

 it("registers DRAM timing lesson and lab",()=>{
  expect(tracks.architecture.lessons.map(l=>l.slug)).toContain("dram-memory-system-timing");
  expect(getLesson("architecture","dram-memory-system-timing")?.checks).toHaveLength(6);
  expect(labIndex.some(l=>l.id==="archdram"&&l.track==="architecture")).toBe(true);
 });

 it("registers SIMD/vector execution lesson and lab",()=>{
  expect(tracks.architecture.lessons.map(l=>l.slug)).toContain("simd-vector-execution");
  expect(getLesson("architecture","simd-vector-execution")?.checks).toHaveLength(6);
  expect(labIndex.some(l=>l.id==="archvector"&&l.track==="architecture")).toBe(true);
 });
});
