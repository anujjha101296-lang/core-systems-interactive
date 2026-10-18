import { describe, expect, it } from "vitest";
import { encodeUartFrame, estimateSerialClocks, uartTransferTimeMs } from "@/lib/dl-serial";
import { getLesson, labIndex } from "@/content";

describe("UART, SPI and I2C teaching models",()=>{
 it("encodes UART data LSB-first and calculates parity",()=>{
  expect(encodeUartFrame(0x53,8,"even",1)).toMatchObject({bits:[1,1,0,0,1,0,1,0],parityBit:0,frameBits:11,payloadBits:8,overheadBits:3});
  expect(encodeUartFrame(0x53,8,"odd",1).parityBit).toBe(1);
 });
 it("calculates UART frame length and ideal transfer time",()=>{
  expect(encodeUartFrame(0x53,8,"none",1).frameBits).toBe(10);
  expect(encodeUartFrame(0,7,"none",2).frameBits).toBe(10);
  expect(uartTransferTimeMs(16,115200,10)).toBeCloseTo(1.3888889);
 });
 it("counts SPI payload clocks and I2C ACK clocks",()=>{
  expect(estimateSerialClocks("spi",2,8).clocks).toBe(16);
  expect(estimateSerialClocks("spi",2,16).clocks).toBe(16);
  expect(estimateSerialClocks("i2c",2,8,true)).toMatchObject({clocks:27,overheadClocks:2});
  expect(estimateSerialClocks("i2c",2,8,false).clocks).toBe(18);
 });
 it("rejects invalid UART configurations and transfer inputs",()=>{
  expect(()=>encodeUartFrame(0,4,"none",1)).toThrow(RangeError);
  expect(()=>encodeUartFrame(256,8,"none",1)).toThrow(RangeError);
  expect(()=>encodeUartFrame(0,8,"bad" as "none",1)).toThrow(RangeError);
  expect(()=>uartTransferTimeMs(1,0,10)).toThrow(RangeError);
  expect(()=>estimateSerialClocks("spi",-1,8)).toThrow(RangeError);
 });
 it("registers the serial lesson and lab",()=>{
  expect(getLesson("digital-logic","serial-interfaces-uart-spi-i2c")?.checks).toHaveLength(6);
  expect(labIndex.some(l=>l.id==="serial"&&l.track==="digital-logic")).toBe(true);
 });

 it("checks parity for all-zero and all-one payloads",()=>{
  expect(encodeUartFrame(0,8,"even",1).parityBit).toBe(0);
  expect(encodeUartFrame(0,8,"odd",1).parityBit).toBe(1);
  expect(encodeUartFrame(255,8,"even",1).parityBit).toBe(0);
  expect(encodeUartFrame(255,8,"odd",1).parityBit).toBe(1);
 });
});
