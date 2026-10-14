import { useMemo, useState } from "react";
import { evaluateDatapath, type DatapathInstruction } from "@/lib/architecture-datapath";

const instructions: DatapathInstruction[] = ["add", "sub", "and", "or", "lw", "sw", "beq"];
const hex = (n: number) => `0x${(n >>> 0).toString(16).padStart(8, "0")}`;
const signed = (n: number) => n | 0;

export function ArchitectureDatapathLab() {
  const [instruction, setInstruction] = useState<DatapathInstruction>("lw");
  const [rsValue, setRsValue] = useState(100);
  const [rtValue, setRtValue] = useState(7);
  const [immediate, setImmediate] = useState(4);
  const [pc, setPc] = useState(0x1000);
  const [memoryWord, setMemoryWord] = useState(42);
  const result = useMemo(() => {
    try { return { value: evaluateDatapath({ instruction, rsValue, rtValue, immediate, pc, memoryWord }), error: "" }; }
    catch (e) { return { value: null, error: e instanceof Error ? e.message : "Invalid input" }; }
  }, [instruction, rsValue, rtValue, immediate, pc, memoryWord]);
  const r = result.value;
  const field = "field mt-1 w-full";
  const numeric = (label: string, value: number, set: (n: number) => void, min = -32768, max = 32767) => (
    <label className="block text-sm"><span className="eyebrow">{label}</span>
      <input className={field} type="number" value={value} min={min} max={max} step={1}
        onChange={(e) => { const n = e.target.valueAsNumber; if (Number.isFinite(n) && Number.isInteger(n)) set(n); }} />
    </label>
  );
  return <div className="panel p-5 space-y-5">
    <div className="eyebrow">Interactive lab · single-cycle datapath</div>
    <div className="grid gap-5 md:grid-cols-[240px_1fr]">
      <div className="space-y-4">
        <label className="block text-sm"><span className="eyebrow">Instruction class</span>
          <select className={field} value={instruction} onChange={(e) => setInstruction(e.target.value as DatapathInstruction)}>
            {instructions.map((op) => <option key={op} value={op}>{op.toUpperCase()}</option>)}
          </select>
        </label>
        {numeric("Register rs value", rsValue, setRsValue, -2147483648, 2147483647)}
        {numeric("Register rt value", rtValue, setRtValue, -2147483648, 2147483647)}
        {numeric("Signed immediate / branch offset", immediate, setImmediate)}
        {numeric("PC (aligned address)", pc, setPc, 0, 2147483644)}
        {numeric("Data-memory word at effective address", memoryWord, setMemoryWord, -2147483648, 2147483647)}
        <button className="btn btn-ghost" onClick={() => { setInstruction("lw"); setRsValue(100); setRtValue(7); setImmediate(4); setPc(0x1000); setMemoryWord(42); }}>Reset example</button>
      </div>
      <div className="min-w-0 space-y-4">
        {result.error ? <p className="font-mono text-sm text-destructive">{result.error}</p> : r && <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[["ALU control", r.aluControl.toUpperCase()], ["ALU result", String(r.aluResult)], ["Zero flag", String(r.zero)], ["Destination", r.destination], ["Writeback", r.writeback === null ? "—" : String(r.writeback)], ["Next PC", hex(r.nextPc)]].map(([k,v]) =>
              <div key={k} className="rule-t pt-2"><div className="eyebrow">{k}</div><div className="font-mono text-sm break-all">{v}</div></div>)}
          </div>
          <div className="space-y-2">
            <div className="eyebrow">Control signals</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[["RegWrite",r.regWrite],["MemRead",r.memRead],["MemWrite",r.memWrite],["MemToReg",r.memToReg],["Branch",r.branch],["ALUSrc",r.aluSrc !== "register"]].map(([k,v]) =>
                <div key={String(k)} className="flex items-center justify-between border border-rule p-2 font-mono text-xs"><span>{k}</span><strong className={v ? "text-success" : "text-muted-foreground"}>{v ? "1" : "0"}</strong></div>)}
            </div>
          </div>
          <div className="rounded-sm border border-rule p-3">
            <div className="eyebrow mb-2">Selected datapath route</div>
            <p className="font-mono text-xs leading-6">
              Register file → {r.aluSrc === "register" ? "rt value" : "sign-extended immediate"} → ALU ({r.aluControl}) → {r.memRead ? "data memory read → memory writeback mux → rt" : r.memWrite ? "data-memory write (no register writeback)" : r.branch ? "zero comparator → branch/PC mux" : "ALU-result writeback mux → rd"}.
            </p>
            <p className="mt-2 text-sm text-ink-2">
              {instruction === "lw" ? `Effective address = rs + immediate = ${signed(rsValue + immediate)}; memory supplies ${memoryWord} for writeback.`
                : instruction === "sw" ? `Effective address = rs + immediate = ${signed(rsValue + immediate)}; memory write enabled, register write disabled.`
                : instruction === "beq" ? `Operands are ${rsValue} and ${rtValue}. Branch ${r.branch && r.zero ? "is taken" : "is not taken"}; next PC is ${hex(r.nextPc)}.`
                : `ALU computes ${r.aluResult} from the two register operands and selects rd for writeback.`}
            </p>
          </div>
          <div className="rounded-sm border border-rule p-3">
            <div className="eyebrow mb-2">Control interpretation</div>
            <p className="text-sm text-ink-2">Every instruction shares hardware, but control signals prevent unintended side effects. Check both the computed value and the write enables: SW must not update a register, and LW writes memory data—not the ALU address—back to rt.</p>
          </div>
        </>}
      </div>
    </div>
  </div>;
}
