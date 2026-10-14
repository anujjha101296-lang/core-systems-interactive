export type Bit = 0 | 1;
export type DetectorState = 0 | 1 | 2 | 3; // no prefix, "1", "10", "101"
export type DetectorMode = "moore" | "mealy";

function assertBit(bit: number): asserts bit is Bit {
  if (bit !== 0 && bit !== 1) throw new RangeError("input must be a bit (0 or 1)");
}
function assertState(state: number): asserts state is DetectorState {
  if (!Number.isInteger(state) || state < 0 || state > 3) throw new RangeError("state must be an integer from 0 to 3");
}

/** Longest suffix that is also a prefix of the target pattern 101. */
export function detectorNextState(state: DetectorState, input: Bit): DetectorState {
  assertState(state); assertBit(input);
  const transitions: Record<DetectorState, readonly [DetectorState, DetectorState]> = {
    0: [0, 1],
    1: [2, 1],
    2: [0, 3],
    3: [2, 1],
  };
  return transitions[state][input];
}

/** Mealy output is asserted on the transition that consumes the final 1 of 101. */
export function detectorMealyOutput(state: DetectorState, input: Bit): Bit {
  assertState(state); assertBit(input);
  return state === 2 && input === 1 ? 1 : 0;
}

/** Moore output depends only on the registered state reached after the clock edge. */
export function detectorMooreOutput(state: DetectorState): Bit {
  assertState(state);
  return state === 3 ? 1 : 0;
}

export function detectorStep(state: DetectorState, input: Bit, mode: DetectorMode): { nextState: DetectorState; output: Bit } {
  const output = mode === "mealy" ? detectorMealyOutput(state, input) : detectorMooreOutput(detectorNextState(state, input));
  return { nextState: detectorNextState(state, input), output };
}

export function bitsFromString(stream: string): Bit[] {
  const compact = stream.replace(/[\s,_]/g, "");
  if (!/^[01]*$/.test(compact)) throw new RangeError("stream may contain only 0 and 1 (spaces and commas are ignored)");
  return Array.from(compact, (c) => Number(c) as Bit);
}

export function runDetector(stream: string, mode: DetectorMode = "mealy"): { input: Bit; stateBefore: DetectorState; stateAfter: DetectorState; output: Bit }[] {
  let state: DetectorState = 0;
  return bitsFromString(stream).map((input) => {
    const stateBefore = state;
    const step = detectorStep(state, input, mode);
    state = step.nextState;
    return { input, stateBefore, stateAfter: state, output: step.output };
  });
}
