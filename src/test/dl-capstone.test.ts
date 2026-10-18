import { describe, expect, it } from "vitest";
import { resetCapstone, stepCapstone } from "@/lib/dl-capstone";
import { getLesson, labIndex } from "@/content";

describe("integrated UART FIFO capstone",()=>{
 it("serializes 0x53 as start, LSB-first data, and stop",()=>{
  let s=resetCapstone();
  s=stepCapstone(s,{type:"push",value:0x53}).state;
  const bits:number[]=[];
  for(let i=0;i<10;i++){const r=stepCapstone(s,{type:"tick"});s=r.state;bits.push(s.txBit);}
  expect(bits).toEqual([0,1,1,0,0,1,0,1,0,1]);
  expect(s).toMatchObject({txState:"idle",currentByte:null,framesSent:1,cycles:10,queue:[]});
 });
 it("preserves queued byte order across complete frames",()=>{
  let s=resetCapstone();
  s=stepCapstone(s,{type:"push",value:0x53}).state;
  s=stepCapstone(s,{type:"push",value:0x00}).state;
  for(let i=0;i<10;i++)s=stepCapstone(s,{type:"tick"}).state;
  expect(s).toMatchObject({framesSent:1,currentByte:null,queue:[0]});
  const start=stepCapstone(s,{type:"tick"});s=start.state;
  expect(start.event).toContain("0x00");
  expect(s.txBit).toBe(0);
  for(let i=0;i<9;i++)s=stepCapstone(s,{type:"tick"}).state;
  expect(s.framesSent).toBe(2);
 });
 it("rejects overflow rather than overwriting queued bytes",()=>{
  let s=resetCapstone();
  for(const value of [1,2,3,4])s=stepCapstone(s,{type:"push",value}).state;
  const r=stepCapstone(s,{type:"push",value:5});
  expect(r).toMatchObject({accepted:false,overflow:true});
  expect(r.state.queue).toEqual([1,2,3,4]);
 });
 it("validates bytes and reset clears all state",()=>{
  expect(()=>stepCapstone(resetCapstone(),{type:"push",value:256})).toThrow(RangeError);
  let s=stepCapstone(resetCapstone(),{type:"push",value:0x53}).state;
  s=stepCapstone(s,{type:"tick"}).state;
  expect(stepCapstone(s,{type:"reset"}).state).toEqual(resetCapstone());
 });
 it("registers lesson and lab",()=>{
  expect(getLesson("digital-logic","digital-design-capstone-uart-fifo")?.checks).toHaveLength(6);
  expect(labIndex.some(l=>l.id==="dlcapstone"&&l.track==="digital-logic")).toBe(true);
 });

 it("serializes an all-zero byte with a high stop bit",()=>{
  let s=stepCapstone(resetCapstone(),{type:"push",value:0}).state;
  const bits:number[]=[];
  for(let i=0;i<10;i++){s=stepCapstone(s,{type:"tick"}).state;bits.push(s.txBit);}
  expect(bits).toEqual([0,0,0,0,0,0,0,0,0,1]);
 });
});
