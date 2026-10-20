export type OoOInstruction = { label:string; op:string; sources:string[]; dest?:string };
export type DependencyEdge = { from:number; to:number; kind:"RAW"|"WAR"|"WAW"; register:string };
export type RenamedInstruction = { index:number; label:string; reads:{register:string;physical:string}[]; architecturalDest:string|null; physicalDest:string|null };
export type RenamingReport = { edges:DependencyEdge[]; renamed:RenamedInstruction[]; rawCount:number; warCount:number; wawCount:number; falseDependenciesRemoved:number };
const reg=/^R(?:[0-9]|1[0-5])$/;
export function analyzeRegisterDependencies(program:OoOInstruction[]):RenamingReport {
 if(!Array.isArray(program)||program.length>32) throw new RangeError("Program must contain at most 32 instructions");
 for(const [i,ins] of program.entries()){
  if(!ins||typeof ins.label!=="string"||!ins.label.trim()||typeof ins.op!=="string"||!ins.op.trim()||!Array.isArray(ins.sources)) throw new RangeError(`Instruction ${i+1} is malformed`);
  if(ins.sources.some(r=>typeof r!=="string"||!reg.test(r))||(ins.dest!==undefined&&!reg.test(ins.dest))) throw new RangeError(`Instruction ${i+1} uses an invalid architectural register (use R0–R15)`);
 }
 const edges:DependencyEdge[]=[];
 for(let j=0;j<program.length;j++){
  const current=program[j]!;
  // RAW is from the most recent preceding writer, not every older version of the name.
  for(const source of new Set(current.sources)){
   for(let i=j-1;i>=0;i--) if(program[i]!.dest===source){edges.push({from:i+1,to:j+1,kind:"RAW",register:source});break;}
  }
  if(current.dest){
   // The immediately previous writer captures the WAW program-order constraint.
   for(let i=j-1;i>=0;i--) if(program[i]!.dest===current.dest){edges.push({from:i+1,to:j+1,kind:"WAW",register:current.dest});break;}
   // WAR edges capture earlier readers that used the current architectural name.
   for(let i=0;i<j;i++) if(program[i]!.sources.includes(current.dest)) edges.push({from:i+1,to:j+1,kind:"WAR",register:current.dest});
  }
 }
 const currentPhysical=new Map<string,string>(); let nextPhysical=0;
 const renamed:RenamedInstruction[]=program.map((ins,index)=>{
  const reads=ins.sources.map(register=>({register,physical:currentPhysical.get(register)??`initial(${register})`}));
  const physicalDest=ins.dest? `P${++nextPhysical}`:null;
  if(ins.dest&&physicalDest) currentPhysical.set(ins.dest,physicalDest);
  return {index:index+1,label:ins.label,reads,architecturalDest:ins.dest??null,physicalDest};
 });
 const rawCount=edges.filter(e=>e.kind==="RAW").length,warCount=edges.filter(e=>e.kind==="WAR").length,wawCount=edges.filter(e=>e.kind==="WAW").length;
 return {edges,renamed,rawCount,warCount,wawCount,falseDependenciesRemoved:warCount+wawCount};
}
export const renamingPresets:Record<string,OoOInstruction[]> = {
 falseDependencies:[
  {label:"I1: R1 = R2 + R3",op:"ADD",sources:["R2","R3"],dest:"R1"},
  {label:"I2: R2 = R4 + R5",op:"ADD",sources:["R4","R5"],dest:"R2"},
  {label:"I3: R1 = R1 + R6",op:"ADD",sources:["R1","R6"],dest:"R1"}
 ],
 trueDependency:[
  {label:"I1: R1 = R2 + R3",op:"ADD",sources:["R2","R3"],dest:"R1"},
  {label:"I2: R4 = R1 + R5",op:"ADD",sources:["R1","R5"],dest:"R4"},
  {label:"I3: R6 = R4 + R1",op:"ADD",sources:["R4","R1"],dest:"R6"}
 ],
 repeatedWrites:[
  {label:"I1: R7 = R1 + R2",op:"ADD",sources:["R1","R2"],dest:"R7"},
  {label:"I2: R7 = R3 + R4",op:"ADD",sources:["R3","R4"],dest:"R7"},
  {label:"I3: R5 = R7 + R6",op:"ADD",sources:["R7","R6"],dest:"R5"}
 ]
};
