import { describe, expect, it } from "vitest";
import { analyzeRegisterDependencies, renamingPresets } from "@/lib/architecture-renaming";
import { getLesson, labIndex, tracks } from "@/content";

describe("register renaming and dependency analysis", () => {
  it("preserves RAW dependencies on the latest preceding writer", () => {
    const r = analyzeRegisterDependencies(renamingPresets.trueDependency);
    expect(r.rawCount).toBe(3);
    expect(r.edges.filter(e => e.kind === "RAW").every(e => e.from < e.to)).toBe(true);
  });
  it("identifies WAR and WAW as name dependencies", () => {
    const r = analyzeRegisterDependencies(renamingPresets.falseDependencies);
    expect(r.warCount).toBeGreaterThan(0);
    expect(r.wawCount).toBe(1);
    expect(r.rawCount).toBe(1);
    expect(r.falseDependenciesRemoved).toBe(r.warCount + r.wawCount);
  });
  it("binds a source to the latest physical version at rename time", () => {
    const r = analyzeRegisterDependencies(renamingPresets.repeatedWrites);
    expect(r.renamed[1]?.physicalDest).not.toBe(r.renamed[0]?.physicalDest);
    expect(r.renamed[2]?.reads.find(x => x.register === "R7")?.physical).toBe(r.renamed[1]?.physicalDest);
  });
  it("rejects invalid registers and oversized programs", () => {
    expect(() => analyzeRegisterDependencies([{label:"bad",op:"ADD",sources:["R99"],dest:"R1"}])).toThrow(RangeError);
    expect(() => analyzeRegisterDependencies([{label:"bad",op:"ADD",sources:["R1"],dest:"X1"}])).toThrow(RangeError);
    expect(() => analyzeRegisterDependencies(Array.from({length:33},(_,i)=>({label:String(i),op:"ADD",sources:[]})))).toThrow(RangeError);
  });
  it("registers the lesson and interactive lab", () => {
    expect(tracks.architecture.lessons.map(l => l.slug)).toContain("out-of-order-execution-register-renaming");
    expect(getLesson("architecture","out-of-order-execution-register-renaming")?.checks).toHaveLength(6);
    expect(labIndex.some(l => l.id === "archrename" && l.track === "architecture")).toBe(true);
  });

  it("connects a consumer only to the latest writer of a register", () => {
    const r = analyzeRegisterDependencies([
      {label:"I1",op:"ADD",sources:["R2"],dest:"R1"},
      {label:"I2",op:"ADD",sources:["R3"],dest:"R1"},
      {label:"I3",op:"ADD",sources:["R1"],dest:"R4"}
    ]);
    expect(r.edges.filter(e => e.kind === "RAW" && e.to === 3 && e.register === "R1")).toEqual([{from:2,to:3,kind:"RAW",register:"R1"}]);
  });
});
