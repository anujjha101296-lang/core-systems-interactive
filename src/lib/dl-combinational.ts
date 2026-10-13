/** Pure, width-checked combinational circuit models for the Digital Logic lab. */
export type Bit = 0 | 1;

function assertBit(bit: number, name: string): asserts bit is Bit {
  if (bit !== 0 && bit !== 1) throw new RangeError(`${name} must be 0 or 1`);
}
function assertWidth(width: number) {
  if (!Number.isInteger(width) || width < 1 || width > 32) throw new RangeError("width must be an integer from 1 to 32");
}
export function mux2(a: Bit, b: Bit, sel: Bit): Bit {
  assertBit(a,"a"); assertBit(b,"b"); assertBit(sel,"sel");
  return sel ? b : a;
}
export function demux1(data: Bit, sel: Bit): [Bit, Bit] {
  assertBit(data,"data"); assertBit(sel,"sel");
  return sel ? [0, data] : [data, 0];
}
export function decodeNTo2N(input: number, bits: number): number {
  if (!Number.isInteger(bits) || bits < 1 || bits > 5) throw new RangeError("decoder width must be 1..5");
  if (!Number.isInteger(input) || input < 0 || input >= 2 ** bits) throw new RangeError("input is outside decoder range");
  return 2 ** input;
}
export function encodeOneHot(mask: number, outputs: number): number {
  if (!Number.isInteger(outputs) || outputs < 1 || outputs > 32) throw new RangeError("outputs must be 1..32");
  if (!Number.isSafeInteger(mask) || mask < 0 || mask >= 2 ** outputs) throw new RangeError("mask is outside encoder range");
  if (mask === 0 || (mask & (mask - 1)) !== 0) throw new RangeError("input must be exactly one-hot");
  return 31 - Math.clz32(mask);
}
export function halfAdder(a: Bit, b: Bit) {
  assertBit(a,"a"); assertBit(b,"b");
  return { sum: (a ^ b) as Bit, carry: (a & b) as Bit };
}
export function fullAdder(a: Bit, b: Bit, cin: Bit) {
  assertBit(a,"a"); assertBit(b,"b"); assertBit(cin,"cin");
  const total = a + b + cin;
  return { sum: (total & 1) as Bit, carry: (total >> 1) as Bit };
}
export function rippleCarryAdd(a: number, b: number, width: number, cin: Bit = 0) {
  assertWidth(width); assertBit(cin,"cin");
  const limit = 2 ** width;
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || a < 0 || b < 0 || a >= limit || b >= limit) {
    throw new RangeError("operands must be unsigned values that fit the selected width");
  }
  let carry: Bit = cin; let sum = 0;
  const stages: { bit: number; a: Bit; b: Bit; cin: Bit; sum: Bit; cout: Bit }[] = [];
  for (let bit = 0; bit < width; bit++) {
    const ai = ((a >>> bit) & 1) as Bit; const bi = ((b >>> bit) & 1) as Bit; const ci = carry;
    const out = fullAdder(ai, bi, ci);
    stages.push({ bit, a: ai, b: bi, cin: ci, sum: out.sum, cout: out.carry });
    sum |= out.sum << bit; carry = out.carry;
  }
  return { sum, carry, stages, width, overflowUnsigned: carry === 1 };
}
export type AluOp = "AND" | "OR" | "XOR" | "ADD" | "SUB" | "NOT";
export function alu(a: number, b: number, width: number, op: AluOp) {
  assertWidth(width);
  const limit = 2 ** width; const mask = limit - 1;
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a > mask || b > mask) throw new RangeError("operands must fit selected unsigned width");
  let raw: number;
  switch (op) {
    case "AND": raw = a & b; break;
    case "OR": raw = a | b; break;
    case "XOR": raw = a ^ b; break;
    case "NOT": raw = ~a; break;
    case "ADD": raw = a + b; break;
    case "SUB": raw = a - b; break;
    default: throw new RangeError("unsupported ALU operation");
  }
  const result = raw & mask;
  return { result, carry: op === "ADD" ? raw >= limit : op === "SUB" ? a >= b : false, zero: result === 0, negative: ((result >>> (width - 1)) & 1) === 1, width, op };
}
