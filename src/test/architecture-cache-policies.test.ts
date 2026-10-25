import { describe, expect, it } from "vitest";
import { simulateCachePolicies, validateCachePolicyConfig } from "@/lib/architecture-cache-policies";
const config={capacityBytes:64,blockBytes:16,ways:1 as const,replacement:"LRU" as const,write:"write-back" as const,writeMiss:"write-allocate" as const};
describe("cache replacement and write policies",()=>{
 it("distinguishes LRU from FIFO on a reuse trace",()=>{
  const trace=[{op:"R" as const,address:0},{op:"R" as const,address:16},{op:"R" as const,address:0},{op:"R" as const,address:32},{op:"R" as const,address:16},{op:"R" as const,address:0}];
  const lru=simulateCachePolicies({...config,capacityBytes:32,ways:2,replacement:"LRU"},trace);
  const fifo=simulateCachePolicies({...config,capacityBytes:32,ways:2,replacement:"FIFO"},trace);
  expect(lru.misses).toBe(5);
  expect(fifo.misses).toBe(4);
 });
 it("marks write-back stores dirty and writes dirty victims back",()=>{
  const r=simulateCachePolicies(config,[{op:"W",address:0},{op:"W",address:16},{op:"R",address:32}]);
  expect(r.dirtyWritebacks).toBe(1);
  expect(r.evictions).toBe(1);
 });
 it("write-through counts each store to lower memory",()=>{
  const r=simulateCachePolicies({...config,write:"write-through"},[{op:"W",address:0},{op:"W",address:0}]);
  expect(r.memoryWrites).toBe(2);
  expect(r.dirtyWritebacks).toBe(0);
 });
 it("no-write-allocate writes around cache on a store miss",()=>{
  const r=simulateCachePolicies({...config,writeMiss:"no-write-allocate"},[{op:"W",address:0}]);
  expect(r.misses).toBe(1);
  expect(r.accesses[0]?.memoryWrite).toBe(true);
  expect(r.accesses[0]?.dirty).toBe(false);
 });
 it("validates power-of-two geometry and associativity",()=>{
  expect(()=>validateCachePolicyConfig({...config,capacityBytes:48})).toThrow(RangeError);
  expect(()=>validateCachePolicyConfig({...config,capacityBytes:64,blockBytes:16,ways:3})).toThrow(RangeError);
 });
});
