export type PerformanceInputs = {
  instructionCount: number;
  cpi: number;
  clockRateGHz: number;
  parallelFraction: number;
  speedupParallelPart: number;
  oldExecutionSeconds: number;
  newExecutionSeconds: number;
};
export function cpuExecutionTime(instructionCount: number, cpi: number, clockRateGHz: number): number {
  if (!Number.isFinite(instructionCount) || !Number.isInteger(instructionCount) || instructionCount < 0) throw new RangeError("Instruction count must be a non-negative integer");
  if (!Number.isFinite(cpi) || cpi <= 0) throw new RangeError("CPI must be positive");
  if (!Number.isFinite(clockRateGHz) || clockRateGHz <= 0) throw new RangeError("Clock rate must be positive");
  return instructionCount * cpi / (clockRateGHz * 1e9);
}
export function amdahlSpeedup(parallelFraction: number, speedupParallelPart: number): number {
  if (!Number.isFinite(parallelFraction) || parallelFraction < 0 || parallelFraction > 1) throw new RangeError("Parallel fraction must be between 0 and 1");
  if (!Number.isFinite(speedupParallelPart) || speedupParallelPart < 1) throw new RangeError("Parallel-part speedup must be at least 1");
  return 1 / ((1 - parallelFraction) + parallelFraction / speedupParallelPart);
}
export function compareExecutionTimes(oldExecutionSeconds: number, newExecutionSeconds: number) {
  if (!Number.isFinite(oldExecutionSeconds) || oldExecutionSeconds <= 0) throw new RangeError("Old execution time must be positive");
  if (!Number.isFinite(newExecutionSeconds) || newExecutionSeconds <= 0) throw new RangeError("New execution time must be positive");
  return { speedup: oldExecutionSeconds / newExecutionSeconds, improvementPercent: (1 - newExecutionSeconds / oldExecutionSeconds) * 100 };
}
