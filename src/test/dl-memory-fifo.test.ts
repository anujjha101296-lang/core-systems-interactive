import { describe, expect, it } from "vitest";
import { stepFifo, validateFifoState } from "@/lib/dl-memory-fifo";
import { getLesson, labIndex } from "@/content";

describe("synchronous FIFO reference model", () => {
  it("preserves FIFO order and updates occupancy", () => {
    let state = { depth: 4, width: 4, items: [] as number[] };
    state = stepFifo(state, { pushValue: 5 }).state;
    state = stepFifo(state, { pushValue: 9 }).state;
    const first = stepFifo(state, { pop: true });
    expect(first.poppedValue).toBe(5);
    expect(first.state.items).toEqual([9]);
  });
  it("rejects pushes at full unless a pop is accepted on the same cycle", () => {
    const full = { depth: 2, width: 4, items: [3, 4] };
    expect(stepFifo(full, { pushValue: 5 }).overflow).toBe(true);
    const simultaneous = stepFifo(full, { pushValue: 5, pop: true });
    expect(simultaneous).toMatchObject({ pushAccepted: true, popAccepted: true, overflow: false, underflow: false, poppedValue: 3 });
    expect(simultaneous.state.items).toEqual([4, 5]);
  });
  it("uses old-state semantics for simultaneous push and pop while empty", () => {
    const r = stepFifo({ depth: 2, width: 4, items: [] }, { pushValue: 7, pop: true });
    expect(r).toMatchObject({ pushAccepted: true, popAccepted: false, underflow: true, poppedValue: null });
    expect(r.state.items).toEqual([7]);
  });
  it("detects underflow and validates width/depth/value limits", () => {
    expect(stepFifo({ depth: 2, width: 4, items: [] }, { pop: true }).underflow).toBe(true);
    expect(() => validateFifoState({ depth: 3, width: 4, items: [] })).toThrow(RangeError);
    expect(() => stepFifo({ depth: 2, width: 4, items: [] }, { pushValue: 16 })).toThrow(RangeError);
    expect(() => validateFifoState({ depth: 2, width: 4, items: [1, 2, 3] })).toThrow(RangeError);
  });
  it("registers the lesson and lab", () => {
    expect(getLesson("digital-logic", "memory-fifos-rtl")?.checks).toHaveLength(6);
    expect(labIndex.some(l => l.id === "memoryfifo" && l.track === "digital-logic")).toBe(true);
  });
});
