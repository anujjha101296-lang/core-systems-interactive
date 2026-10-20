export type MsiState = "I" | "S" | "M";
export type CoherenceOp = "read" | "write";
export type CoherenceResult = {
  states: [MsiState, MsiState];
  core: 0 | 1;
  op: CoherenceOp;
  hit: boolean;
  busEvent: string;
  explanation: string;
};

/** Single cache line, two private caches, write-invalidate MSI teaching model. */
export function stepMsi(current: [MsiState, MsiState], core: 0 | 1, op: CoherenceOp): CoherenceResult {
  if (!Array.isArray(current) || current.length !== 2 || current.some(s => !["I", "S", "M"].includes(s))) {
    throw new RangeError("MSI state must contain exactly two valid cache states");
  }
  if (core !== 0 && core !== 1) throw new RangeError("Core must be 0 or 1");
  if (op !== "read" && op !== "write") throw new RangeError("Operation must be read or write");
  const states: [MsiState, MsiState] = [...current];
  const other: 0 | 1 = core === 0 ? 1 : 0;
  const own = states[core], remote = states[other];
  if (op === "read") {
    if (own === "S" || own === "M") {
      return { states, core, op, hit: true, busEvent: "None", explanation: `Core ${core} reads a valid local copy in ${own}; no bus transaction is needed.` };
    }
    if (remote === "M") {
      states[other] = "S"; states[core] = "S";
      return { states, core, op, hit: false, busEvent: "BusRd + owner flush", explanation: `Core ${other} had the modified line. It supplies/flushes the latest value and downgrades M→S; both caches now share the line.` };
    }
    states[core] = "S";
    return { states, core, op, hit: false, busEvent: remote === "S" ? "BusRd (shared)" : "BusRd (memory)", explanation: remote === "S" ? "The other cache already has a shared copy, so the requester joins the shared state." : "No cache owns a valid copy; fetch the line and enter Shared." };
  }
  if (own === "M") {
    return { states, core, op, hit: true, busEvent: "None", explanation: "The writer already owns the line in Modified state; the write is local." };
  }
  if (own === "S") {
    states[other] = "I"; states[core] = "M";
    return { states, core, op, hit: false, busEvent: "BusUpgr / invalidate", explanation: "Upgrade Shared→Modified and invalidate the other shared copy before writing." };
  }
  states[other] = "I"; states[core] = "M";
  return { states, core, op, hit: false, busEvent: remote === "M" ? "BusRdX + owner flush" : "BusRdX / invalidate", explanation: remote === "M" ? "The requester needs exclusive ownership; the old modified owner supplies the latest value and is invalidated." : "Read-for-ownership obtains the line and invalidates any other shared copy before the write." };
}
