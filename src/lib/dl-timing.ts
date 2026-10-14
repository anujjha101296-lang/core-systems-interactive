export type TimingBudget = { clockPeriod: number; clkToQ: number; combDelay: number; setup: number; skew: number; hold: number; minCombDelay: number; };
export type TimingReport = { requiredPeriod: number; setupSlack: number; holdSlack: number; setupPass: boolean; holdPass: boolean; criticalPath: number; };
function finiteNonnegative(n: number, name: string) { if (!Number.isFinite(n) || n < 0) throw new RangeError(`${name} must be a finite non-negative number`); }
export function analyzeTiming(b: TimingBudget): TimingReport {
  for (const [k,v] of Object.entries(b)) finiteNonnegative(v,k);
  if (b.clockPeriod <= 0) throw new RangeError("clockPeriod must be greater than zero");
  // Positive capture skew gives the setup path more time but makes hold harder.
  const requiredPeriod = b.clkToQ + b.combDelay + b.setup + b.skew;
  const setupSlack = b.clockPeriod - requiredPeriod;
  const holdSlack = b.clkToQ + b.minCombDelay - b.hold - b.skew;
  return { requiredPeriod, setupSlack, holdSlack, setupPass: setupSlack >= 0, holdPass: holdSlack >= 0, criticalPath: b.clkToQ + b.combDelay };
}
export type HazardCase = "static-1" | "static-0" | "dynamic";
export function hazardDescription(kind: HazardCase): string {
  if (kind === "static-1") return "A static-1 hazard briefly drops from 1 to 0 while the ideal Boolean function should remain 1. Unequal path delays can expose the glitch.";
  if (kind === "static-0") return "A static-0 hazard briefly rises from 0 to 1 while the ideal Boolean function should remain 0. Unequal path delays can expose the glitch.";
  if (kind === "dynamic") return "A dynamic hazard has multiple unintended transitions while the ideal output should change only once, often due to reconvergent paths.";
  throw new RangeError("Unknown hazard case");
}
export function synchronizerStagesForAsyncInput(stages: number): number {
  if (!Number.isInteger(stages) || stages < 2 || stages > 8) throw new RangeError("Use 2 to 8 synchronizer stages");
  return stages;
}
