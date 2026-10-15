import type { Lesson } from "./types";
export const pipelineLesson: Lesson = {
 slug:"pipeline-hazards-forwarding",track:"architecture",title:"Five-Stage Pipelining: Hazards & Forwarding",
 short:"See how instruction overlap improves throughput—and why dependencies require forwarding or stalls.",
 flagship:true,
 question:"If a CPU overlaps instructions in a pipeline, how can it stop one instruction from using a value that has not been produced yet?",
 problem:"A pipeline divides execution into stages so several instructions can be in flight at once. Overlap improves throughput, but instructions can conflict over data, control flow, or hardware resources. A correct pipeline must preserve the architectural behavior of the sequential program.",
 idea:"A classic teaching pipeline uses IF (fetch), ID (decode/register read), EX (execute/address), MEM (data memory), and WB (register writeback). Hazards are handled with forwarding, stalls, or flushing; the exact penalty depends on the pipeline design and when results become available.",
 how:{
  text:"Structural hazards occur when instructions compete for a resource. Data hazards occur when an instruction depends on an earlier result; RAW (read after write) is the common true dependency. Control hazards arise from branches and jumps. Forwarding routes a result directly to a consumer instead of waiting for register-file writeback, while a load-use dependency often still needs a bubble in a simple five-stage pipeline.",
  formula:"Ideal N-instruction, k-stage pipeline: cycles ≈ k + N − 1\nCPI_ideal ≈ 1 for a long steady-state stream\nActual cycles = ideal cycles + stall/flush penalties",
  example:"ADD $t0, $t1, $t2 followed immediately by SUB $t3, $t0, $t4 creates a RAW dependency on $t0. Forwarding can send the ADD result to SUB's EX input. If the producer is LW, the loaded value is available later, so a simple pipeline typically inserts one load-use stall.",
 },
 lab:"archpipeline",
 trace:[
  {label:"Split work into stages",detail:"IF, ID, EX, MEM and WB operate on different instructions in the same cycle."},
  {label:"Identify dependencies",detail:"A consumer that reads a register written by an older instruction has a RAW dependency."},
  {label:"Forward when possible",detail:"Bypass a ready result to the consuming stage instead of waiting for register writeback."},
  {label:"Insert a bubble when necessary",detail:"A load-use dependency may need a stall because memory data is not ready for the next instruction's EX stage."},
  {label:"Account for control flow",detail:"A branch can require a prediction, stall, or flush depending on where it is resolved and how the processor predicts it."},
 ],
 checks:[
  {id:"pipe-stages",kind:"mcq",prompt:"Which stage normally writes an ALU result to the architectural register file in the classic five-stage pipeline?",options:["IF","ID","EX","WB"],answer:3,hints:["The name of the stage describes the final register update."],explain:"WB is the writeback stage. Forwarding may let a consumer use the result before WB."},
  {id:"pipe-raw",kind:"mcq",prompt:"An instruction reads register $t0 after an earlier instruction writes $t0. What dependency is this?",options:["WAR","WAW","RAW","Structural"],answer:2,hints:["The consumer reads a value produced earlier."],explain:"Read After Write is a true data dependency: the consumer needs the producer's result."},
  {id:"pipe-forward",kind:"mcq",prompt:"What does forwarding primarily do?",options:["Removes every branch penalty","Routes an available result directly to a dependent instruction","Makes memory access instantaneous","Eliminates the need for a register file"],answer:1,hints:["It is also called bypassing."],explain:"Forwarding bypasses the register file when a producer's result is available, reducing some data stalls."},
  {id:"pipe-loaduse",kind:"mcq",prompt:"Why can an immediate load-use dependency still need a bubble in a simple five-stage pipeline?",options:["The load's memory data becomes available after the consumer needs it in EX","Loads never write registers","Forwarding disables the ALU","WB always occurs before IF"],answer:0,hints:["The load result arrives later than an ALU result."],explain:"A load obtains its data in MEM, too late for the immediately following instruction's EX stage without a stall in the classic pipeline."},
  {id:"pipe-ideal",kind:"numeric",prompt:"In an ideal five-stage pipeline, how many cycles are needed for 8 instructions with no stalls or flushes?",answer:12,tolerance:0,hints:["k + N − 1."],explain:"5 + 8 − 1 = 12 cycles. The first result takes five stages; after filling, one instruction completes per cycle."},
  {id:"pipe-hazards",kind:"match",prompt:"Match each hazard class to its cause.",pairs:[["Structural","Two operations need the same resource in the same cycle"],["Data","An instruction depends on an earlier result"],["Control","The next instruction depends on a branch/jump decision"]],hints:["Think resource conflict, value dependency, and next-PC uncertainty."],explain:"Structural hazards concern resource availability, data hazards concern dependencies, and control hazards concern which instruction should execute next."},
 ],
 deeper:[
  {title:"Pipeline throughput versus latency",body:"Pipelining overlaps work. A single instruction still traverses multiple stages, and pipeline registers add overhead; the main gain is that a filled pipeline can complete instructions at a higher steady-state rate. Real CPI exceeds one when stalls, misses, or flushes interrupt ideal issue."},
  {title:"RAW, WAR and WAW",body:"RAW is a true dependency: a consumer needs a value produced by an older instruction. WAR and WAW are name dependencies that can appear in more complex or out-of-order pipelines; register renaming can eliminate those false dependencies but cannot eliminate the underlying RAW requirement."},
  {title:"Forwarding paths",body:"A typical bypass network can select values from EX/MEM or MEM/WB pipeline registers for an ALU input. The control logic must prioritize the youngest matching producer and avoid forwarding a value that is not ready. Stores may also need forwarding to their data input."},
  {title:"Load-use and bubbles",body:"A load computes an address in EX and reads memory in MEM. The immediately following instruction may need the loaded value in EX one cycle earlier than it is available, so a simple pipeline stalls and inserts a bubble. Different cache timing or pipeline designs can change this penalty."},
  {title:"Branches and flushing",body:"Until a branch outcome and target are known, the front end may fetch instructions from the wrong path. A processor may stall, predict a direction, or speculate and flush wrong-path work. The penalty depends on resolution stage, prediction accuracy, and pipeline depth."},
 ],
 followups:[
  {q:"Does a five-stage pipeline always have CPI exactly one?",a:"No. One instruction per cycle is the ideal steady-state rate; hazards, cache misses, exceptions and branch mispredictions add cycles."},
  {q:"Can forwarding solve every data hazard?",a:"No. A load-use dependency in a classic five-stage pipeline commonly needs a stall because the loaded value is not ready soon enough."},
  {q:"Why does branch resolution location matter?",a:"Resolving later can leave more wrong-path instructions in flight, increasing the potential flush penalty."}
 ],
 tradeoff:{failure:"Assuming pipeline overlap makes dependencies disappear, or forwarding can supply a result before it exists.",tradeoff:"Deeper pipelines can raise clock frequency but increase control complexity and may amplify branch-misprediction and pipeline-register overhead."},
 numbers:[{label:"Classic stages",value:"IF · ID · EX · MEM · WB"},{label:"Ideal cycles",value:"k + N − 1"},{label:"Common data fix",value:"Forwarding + stalls"}],
 model:"I divide instruction execution into stages, identify dependencies and resource/control conflicts, then check when each producer's value becomes available relative to the consumer's need. I use forwarding when the value is ready and insert stalls or flushes when the pipeline cannot safely proceed.",
 debug:{q:"A dependent ADD receives the previous LW's effective address instead of loaded memory data. What kind of bug is likely?",a:"A forwarding/control bug is selecting the ALU address from the load instead of the actual loaded value, or failing to stall until the memory result is available."},
 rapid:["Five classic stages: IF, ID, EX, MEM, WB","Ideal N instructions take k + N − 1 cycles","RAW is a true data dependency","Forwarding bypasses register writeback","Load-use can require a bubble","Branches may cause stalls or flushes"],
 before:[{track:"architecture",slug:"cpu-performance-cpi-amdahl"}],
 derive:"Write a short instruction sequence with an ALU dependency and a load-use dependency. Predict the forwarding path and required stalls, then compare the timeline in the lab.",
 keyIdea:"Pipelining improves overlap, but correctness depends on delivering each operand at the right time.",
 commonMistake:"Confusing the effective address computed by a load's ALU with the loaded data returned by memory.",
 interviewLadder:[
  {level:"definition",q:"What are the five classic pipeline stages?",a:"Instruction fetch, decode/register read, execute, memory access, and writeback."},
  {level:"mechanism",q:"How does forwarding reduce stalls?",a:"It bypasses an available producer result directly to a dependent consumer stage."},
  {level:"trade-off",q:"Why can a load-use dependency still stall?",a:"The loaded word is available later than the next instruction's EX operand deadline."},
  {level:"systems",q:"What affects branch-misprediction penalty?",a:"Pipeline depth and where the branch is resolved, along with prediction and recovery design."}
 ]
};
