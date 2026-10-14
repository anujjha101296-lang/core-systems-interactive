import type { Lesson } from "./types";
export const datapathLesson: Lesson = {
 slug:"single-cycle-datapath-control",track:"architecture",title:"The Single-Cycle Datapath & Control Unit",
 short:"Trace instruction fields through the register file, ALU, memory, control signals and next-PC logic.",
 flagship:true,
 question:"Once an instruction is decoded, what hardware moves its operands, computes the result, accesses memory, and decides what state changes?",
 problem:"An ISA instruction describes an architectural operation, but a processor must realize it with concrete data movement and control. The same register file and ALU are reused across many instructions; multiplexers and control signals route the correct values to the correct destination.",
 idea:"A simple single-cycle datapath combines a PC, instruction memory, register file, sign extension, operand multiplexers, ALU, data memory, and next-PC logic. The control unit decodes instruction fields and selects ALU operation, immediate versus register operands, memory read/write, register writeback, destination register, and branch behavior.",
 how:{
  text:"A typical R-type arithmetic instruction reads rs and rt, computes in the ALU, and writes rd. LW computes rs + sign-extended immediate, reads data memory, and writes the loaded word to rt. SW computes an address and writes rt to memory. BEQ subtracts rs and rt; when the zero flag is true, it selects the branch target.",
  formula:"Sequential PC: PC + 4\nBranch target: PC + 4 + (sign-extended immediate << 2)\nLW effective address: rs + sign-extended immediate",
  example:"For lw $t0, 4($s0), the register file supplies $s0; the immediate 4 is sign-extended and selected as the ALU's second operand. The ALU computes the effective address, data memory is read, and the memory-data mux selects the value written into $t0 (rt).",
 },
 lab:"archdatapath",
 trace:[
  {label:"Fetch",detail:"The PC selects an instruction word; next-PC logic normally computes PC + 4."},
  {label:"Decode and read registers",detail:"Opcode and function fields drive control; rs and rt select register-file outputs."},
  {label:"Select operands and execute",detail:"ALUSrc chooses a register value or sign-extended immediate; ALU control selects arithmetic, logic, or comparison."},
  {label:"Access data memory",detail:"LW asserts MemRead; SW asserts MemWrite. Arithmetic and branch instructions do not access data memory in this simplified datapath."},
  {label:"Write back and update PC",detail:"RegWrite and MemToReg govern register writeback; a taken BEQ selects the branch target instead of PC + 4."},
 ],
 checks:[
  {id:"datapath-rtype",kind:"mcq",prompt:"For a standard R-type ADD, which register is normally the destination in the MIPS-style datapath?",options:["rs","rt","rd","The PC"],answer:2,hints:["R-format uses two source registers and a distinct destination field."],explain:"The register file reads rs and rt; the result is written to rd."},
  {id:"datapath-lw",kind:"mcq",prompt:"For LW, which source normally supplies the value written back to the register file?",options:["The ALU result directly","Data memory output","The branch comparator","The instruction's opcode bits"],answer:1,hints:["The ALU computes the address, not the loaded data."],explain:"The ALU calculates the effective address; data memory returns the word, selected by the MemToReg writeback mux."},
  {id:"datapath-sw",kind:"mcq",prompt:"Which control signal must be asserted for SW?",options:["RegWrite","MemRead","MemWrite","MemToReg"],answer:2,hints:["SW updates data memory rather than an architectural register."],explain:"MemWrite enables the data-memory write. SW does not write a register, so RegWrite is deasserted."},
  {id:"datapath-beq",kind:"mcq",prompt:"In a common simple datapath, how is BEQ's equality condition detected?",options:["ALU subtracts rs and rt and the zero flag is true","The immediate field equals zero","MemRead becomes true","The destination register is rd"],answer:0,hints:["Equal operands produce a zero subtraction result."],explain:"The ALU subtracts the register values; a zero result indicates equality. Branch control combines this with the BEQ decode."},
  {id:"datapath-pc",kind:"numeric",prompt:"A branch instruction at PC=0x1000 has a sign-extended word offset of 3. What is its branch target address in decimal?",answer:4112,tolerance:0,hints:["PC + 4 + (offset × 4)."],explain:"0x1000 + 4 + (3 × 4) = 0x1010 = 4112 decimal."},
  {id:"datapath-signals",kind:"match",prompt:"Match each instruction to its key datapath control behavior.",pairs:[["LW","MemRead=1, MemToReg=1, RegWrite=1"],["SW","MemWrite=1, RegWrite=0"],["R-type ADD","RegWrite=1, destination=rd"],["BEQ","Compare operands and select branch PC when equal"]],hints:["Separate data-memory controls from register-file writeback."],explain:"LW reads memory and writes the loaded word to rt; SW writes memory only; R-type arithmetic writes rd; BEQ uses the equality result to choose next PC."},
 ],
 deeper:[
  {title:"Why multiplexers are everywhere",body:"The datapath must share hardware across instruction classes. An ALU input mux selects a register operand or sign-extended immediate; the writeback mux selects ALU output or memory data; destination selection chooses rd or rt; next-PC logic chooses sequential or branch target. Control signals set these muxes from the decoded instruction."},
  {title:"Control table thinking",body:"Control is derived from opcode and, for R-type instructions, the function field. Arithmetic operations generally write a register but do not access data memory. LW reads memory and writes a register. SW writes memory without register writeback. BEQ compares operands and conditionally updates PC. Real designs include more instruction classes and exception handling."},
  {title:"Single-cycle timing tradeoff",body:"Every instruction must finish in one clock period, so the clock must accommodate the slowest instruction path—often a load that traverses instruction fetch, register read, address calculation, data memory, and writeback. This simple design is easy to reason about but can waste time on shorter instructions."},
  {title:"From single-cycle to multicycle and pipeline",body:"A multicycle design reuses hardware across several shorter cycles; a pipeline overlaps different instructions in stages. Both can improve hardware utilization or throughput, but require state/control across cycles and careful treatment of dependencies, branches, exceptions, and memory behavior."},
  {title:"Architectural state and side effects",body:"Not every instruction writes every state element. Control must prevent accidental register or memory updates. A bug such as asserting RegWrite for SW can corrupt architectural state even if the ALU computes the correct address. Verification should test both data values and the enables that govern side effects."},
 ],
 followups:[
  {q:"Why does LW need both an ALU and a data-memory read?",a:"The ALU computes the effective address from a base register plus sign-extended offset; data memory then returns the contents stored at that address."},
  {q:"Why does SW not assert RegWrite?",a:"Its architectural side effect is a memory write, not a register update."},
  {q:"Why is a single-cycle clock period determined by a load path?",a:"All instruction classes must complete within the same cycle, so the longest path constrains the clock period."}
 ],
 tradeoff:{failure:"Using the correct ALU result but incorrect mux or control enables can write the wrong destination, update memory accidentally, or select the wrong PC.",tradeoff:"A single-cycle datapath is conceptually simple but needs a long clock period; multicycle and pipelined designs improve utilization/throughput at the cost of more control and hazard complexity."},
 numbers:[{label:"Sequential next PC",value:"PC + 4"},{label:"Branch offset scale",value:"× 4 bytes"},{label:"R-type destination",value:"rd"}],
 model:"I decode the instruction class, identify register and immediate operands, determine the ALU operation, and derive the control signals. I trace data through the operand muxes and ALU, account for memory access and writeback, and separately compute next-PC selection. I verify not just the result but also the register and memory enables that govern architectural side effects.",
 debug:{q:"An LW computes the correct effective address but writes the address itself into rt instead of the loaded word. Which datapath selection is likely wrong?",a:"The writeback mux (MemToReg) is selecting the ALU result instead of data-memory output."},
 rapid:["R-type reads rs/rt and writes rd","LW calculates address then writes memory data to rt","SW asserts MemWrite and not RegWrite","BEQ uses equality and conditional next-PC selection","PC + 4 is the normal sequential next address","The longest path sets single-cycle clock period"],
 before:[{track:"architecture",slug:"architecture-foundations-isa"}],
 derive:"Create a control table for ADD, LW, SW and BEQ. For each, specify ALUSrc, ALU operation, MemRead, MemWrite, MemToReg, RegWrite, destination selection, and next-PC condition.",
 keyIdea:"A datapath is a controlled network of state elements, functional units and multiplexers that realizes the ISA contract.",
 commonMistake:"Thinking the ALU output is always the value written back; for LW, the ALU computes an address while memory supplies the loaded data.",
 interviewLadder:[
  {level:"definition",q:"What are the main single-cycle datapath blocks?",a:"PC, instruction memory, register file, ALU, sign extension, muxes, data memory, and next-PC/control logic."},
  {level:"mechanism",q:"How does LW execute?",a:"Read base register, add sign-extended offset, read data memory at the effective address, and write memory output to rt."},
  {level:"trade-off",q:"What is the major single-cycle drawback?",a:"The clock period must fit the longest instruction path, leaving shorter instructions with unused timing budget."},
  {level:"systems",q:"How does pipelining change this design?",a:"It overlaps instructions across stages, improving throughput but requiring inter-stage registers and hazard handling."}
 ]
};
