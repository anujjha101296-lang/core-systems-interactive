export type Bit = 0 | 1;
export type LatchResult = { q: Bit; qBar: Bit; note: string };

export function srLatch(set: Bit, reset: Bit, previous: Bit): LatchResult {
  assertBit(set, "set"); assertBit(reset, "reset"); assertBit(previous, "previous");
  if (set === 1 && reset === 1) return { q: 0, qBar: 0, note: "Forbidden input: both active-high NOR-latch outputs are driven low; release order can make the final state unpredictable." };
  if (set === 1) return { q: 1, qBar: 0, note: "SET: store 1." };
  if (reset === 1) return { q: 0, qBar: 1, note: "RESET: store 0." };
  return { q: previous, qBar: (1 - previous) as Bit, note: "HOLD: feedback preserves the previous state." };
}

export function dLatch(data: Bit, enable: Bit, previous: Bit): Bit {
  assertBit(data, "data"); assertBit(enable, "enable"); assertBit(previous, "previous");
  return enable ? data : previous;
}

/** Positive-edge D flip-flop: only a rising clock edge captures D. */
export function dFlipFlop(data: Bit, previous: Bit, risingEdge: boolean, reset: Bit = 0): Bit {
  assertBit(data, "data"); assertBit(previous, "previous"); assertBit(reset, "reset");
  if (reset === 1) return 0;
  return risingEdge ? data : previous;
}

export function isRisingEdge(previousClock: Bit, nextClock: Bit): boolean {
  assertBit(previousClock, "previousClock"); assertBit(nextClock, "nextClock");
  return previousClock === 0 && nextClock === 1;
}

export function assertBit(value: number, name: string): asserts value is Bit {
  if (value !== 0 && value !== 1) throw new RangeError(`${name} must be 0 or 1`);
}
