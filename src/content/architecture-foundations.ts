import type { Lesson } from "./types";
export const architectureFoundationsLesson: Lesson = {
 slug:"architecture-foundations-isa", track:"architecture", title:"Computer Architecture, Organization & the ISA Contract",
 short:"Separate programmer-visible behavior from the internal hardware that implements it.",
 flagship:true,
 question:"How can two processors execute the same program correctly while having very different pipelines, caches, and performance?",
 problem:"Programs need a stable contract with hardware. If every program depended on one processor's exact internal wiring, each microarchitecture change would break software. Computer architecture defines the programmer-visible machine; organization describes how a particular implementation realizes it.",
 idea:"The instruction-set architecture (ISA) specifies instructions, registers, data types, addressing, memory behavior, and exceptions. Microarchitecture implements that contract with datapaths, control, pipelines, caches, prediction, and execution resources. The ISA is the interface; organization is one implementation behind it.",
 how:{
  text:"Think in layers: **program → compiler/assembler → ISA instructions → microarchitecture → digital logic → circuits**. Architecture answers what software can observe; organization answers how the processor carries it out. A fixed-width instruction format assigns bit fields to opcode and operands, but encoding is only one part of the ISA contract.",
  formula:"Instruction semantics: architectural state before + instruction → architectural state after\nPerformance ≈ instruction count × CPI × clock period",
  example:"Two processors may both implement an ADD instruction that writes rs + rt into rd, but one may use a single-cycle datapath and another a pipelined execution unit. Software-visible results must agree for defined behavior; latency, throughput, energy, and implementation complexity may differ.",
 },
 lab:"archisa",
 trace:[
  {label:"Identify the contract",detail:"List the programmer-visible registers, instructions, memory rules, and exception behavior before discussing implementation."},
  {label:"Read an instruction format",detail:"Split the word into fields using the ISA's specified bit positions; do not infer semantics from the field names alone."},
  {label:"Decode and execute",detail:"Control logic interprets the opcode and fields, selects operands, performs an operation, and updates architectural state."},
  {label:"Compare implementations",detail:"Single-cycle, multicycle, and pipelined designs can implement the same ISA with different timing, throughput, and resource tradeoffs."},
 ],
 checks:[
  {id:"arch-isa-vs-org",kind:"mcq",prompt:"Which item is primarily part of the ISA contract?",options:["The exact placement of pipeline registers","The programmer-visible instruction behavior and architectural registers","The number of physical cache banks in one implementation","The transistor layout of the ALU"],answer:1,hints:["Think about what software can observe."],explain:"The ISA defines visible instructions, registers, memory behavior, and exceptions. Pipeline registers and physical layout are implementation choices."},
  {id:"arch-layer",kind:"mcq",prompt:"A compiler emits the same legal ISA instruction for two compatible processors. What must remain compatible?",options:["Their cache sizes","Their pipeline depth","The defined architectural behavior of that instruction","Their clock frequencies"],answer:2,hints:["Microarchitecture may vary while the contract remains stable."],explain:"Compatible implementations must preserve the specified architectural semantics for defined cases."},
  {id:"arch-rformat",kind:"numeric",prompt:"How many bits are in the standard MIPS-style R-format instruction word used in the lab?",answer:32,tolerance:0,hints:["The fields are 6+5+5+5+5+6 bits."],explain:"6 + 5 + 5 + 5 + 5 + 6 = 32 bits."},
  {id:"arch-rs",kind:"numeric",prompt:"In the lab's R-format layout, how many bits encode register rs?",answer:5,tolerance:0,hints:["There are 32 architectural register indices."],explain:"Five bits encode 2⁵ = 32 possible register indices."},
  {id:"arch-perf",kind:"mcq",prompt:"Which expression is the standard CPU execution-time decomposition?",options:["Instruction count × CPI × clock-cycle time","Instruction count ÷ cache size","CPI × transistor count","Clock frequency × instruction count"],answer:0,hints:["Execution time counts cycles and multiplies by time per cycle."],explain:"CPU time = instruction count × cycles per instruction × clock-cycle time."},
  {id:"arch-org",kind:"typed",prompt:"What is the name for the internal implementation of an ISA using datapaths, control, pipelines and caches?",accept:["microarchitecture","micro-architecture"],hints:["It describes how the architecture is implemented."],explain:"Microarchitecture is the internal organization chosen to implement an ISA."},
 ],
 deeper:[
  {title:"Architecture versus organization",body:"Architecture includes the programmer-visible instruction set, architectural registers, data types, addressing modes, memory consistency rules, and exception model. Organization includes pipeline depth, execution-unit arrangement, branch prediction, cache hierarchy, and internal control. Some design choices sit at the boundary, so always state which abstraction is being discussed."},
  {title:"The ISA as a contract",body:"An ISA specifies the behavior software may rely on, not every transistor-level detail. Implementations can differ internally as long as they preserve the specified behavior. Undefined or implementation-defined cases must be treated according to the ISA documentation rather than guessed."},
  {title:"From instruction to datapath",body:"Instruction bits are fetched and decoded; control selects register operands and operation; the datapath computes results; architectural state is updated at the architecturally defined point. A simple teaching datapath makes these steps visible, while real processors overlap and speculate across many instructions."},
  {title:"Instruction encoding",body:"Fixed-width formats make field extraction predictable but constrain how many opcode and operand bits fit in a word. R-format encodes register operands and a function field; immediate and jump formats allocate bits differently. Register indices are not register values: a 5-bit field names one of 32 registers."},
  {title:"Performance is not clock frequency alone",body:"CPU time depends on instruction count, CPI, and clock-cycle time. A higher frequency can be offset by more cycles per instruction; a complex ISA instruction may take multiple cycles, and compiler choices alter instruction count. Compare complete workloads and specify whether you mean latency, throughput, energy, or cost."},
 ],
 followups:[
  {q:"Can two processors implement the same ISA but use different pipelines?",a:"Yes. Pipeline depth and execution resources are microarchitectural choices as long as defined architectural behavior is preserved."},
  {q:"Does a register field contain the register's data?",a:"No. It contains an index naming an architectural register; the register file supplies the selected register's value."},
  {q:"Why is clock frequency alone a poor performance metric?",a:"Execution time also depends on instruction count and CPI, and real workloads differ in memory stalls, parallelism, and bottlenecks."}
 ],
 tradeoff:{failure:"Confusing ISA-visible semantics with a specific datapath, treating register indices as data values, or comparing processors using clock frequency alone.",tradeoff:"A richer ISA can improve code density or expressiveness but may complicate decode; a simpler implementation can improve regularity while shifting work to compilers or more instructions."},
 numbers:[{label:"R-format word",value:"32 bits"},{label:"Register index",value:"5 bits"},{label:"Register names",value:"32"}],
 model:"I begin with the ISA contract: instruction semantics, architectural state, memory behavior, and exceptions. I decode bit fields according to the specified format, then map each instruction to datapath/control actions. Only after the contract is clear do I compare microarchitectural options using execution time, throughput, energy, and implementation cost.",
 debug:{q:"A student says a processor with the highest clock frequency must be fastest. What is missing?",a:"Instruction count and CPI, along with workload-specific memory behavior and parallelism. CPU time is instruction count × CPI × clock-cycle time."},
 rapid:["ISA defines programmer-visible behavior","Microarchitecture implements the ISA","Register fields name registers; they are not register data","Instruction formats allocate fixed bit fields","CPU time = instruction count × CPI × cycle time","Clock frequency alone does not determine performance"],
 derive:"Encode an R-format instruction by writing each field at its defined width, concatenate the fields in order, then decode the resulting 32-bit word to verify every field.",
 keyIdea:"Architecture is the stable software-visible contract; microarchitecture is the implementation that fulfills it.",
 commonMistake:"Treating one processor's pipeline or cache organization as part of the ISA, or assuming higher clock frequency guarantees lower execution time.",
 interviewLadder:[
  {level:"definition",q:"What is an ISA?",a:"A specification of programmer-visible instructions, registers, memory behavior, and exceptions."},
  {level:"mechanism",q:"How does an instruction become a register update?",a:"Fetch/decode identifies the operation and operands; control and datapath compute the result and update architectural state."},
  {level:"trade-off",q:"How can two implementations of one ISA differ?",a:"In pipeline depth, caches, execution units, prediction, latency, throughput, energy and cost."},
  {level:"systems",q:"How should CPU performance be compared?",a:"Use execution time or throughput on a defined workload, accounting for instruction count, CPI, clock period and bottlenecks."}
 ]
};
