export type PipelineInstruction = { label: string; sources: string[]; destination?: string; load?: boolean };
export type PipelineRow = { label: string; cycles: number[]; stalls: number; };
export type PipelineSchedule = { rows: PipelineRow[]; totalCycles: number; stallCount: number };
const STAGES = 5;
export function scheduleFiveStagePipeline(instructions: PipelineInstruction[], forwarding: boolean): PipelineSchedule {
  if (!Array.isArray(instructions) || instructions.length === 0) throw new RangeError("Provide at least one instruction");
  if (instructions.length > 12) throw new RangeError("Use at most 12 instructions for this teaching timeline");
  for (const ins of instructions) {
    if (!ins.label.trim() || !Array.isArray(ins.sources) || ins.sources.some(s => typeof s !== "string")) throw new RangeError("Each instruction needs a label and source-register list");
  }
  const rows: PipelineRow[] = [];
  let priorIssue = 0;
  let stallCount = 0;
  for (let i = 0; i < instructions.length; i++) {
    const ins = instructions[i]!;
    let issue = i === 0 ? 1 : priorIssue + 1;
    let stalls = 0;
    for (let p = i - 1; p >= 0; p--) {
      const producer = instructions[p]!;
      if (!producer.destination || producer.destination === "$zero" || !ins.sources.includes(producer.destination)) continue;
      const producerIssue = rows[p]!.cycles[0]!;
      const producerWb = producerIssue + 4;
      if (!forwarding) {
        const consumerId = issue + 1 + stalls;
        stalls = Math.max(stalls, producerWb - consumerId);
      } else if (producer.load && p === i - 1) {
        stalls = Math.max(stalls, 1);
      }
    }
    stalls = Math.max(0, stalls);
    const actualIssue = issue + stalls;
    const cycles = Array.from({length:STAGES},(_,stage)=>actualIssue+stage);
    rows.push({label:ins.label,cycles,stalls});
    priorIssue = actualIssue;
    stallCount += stalls;
  }
  return {rows,totalCycles:Math.max(...rows.map(r=>r.cycles[4]!)),stallCount};
}
