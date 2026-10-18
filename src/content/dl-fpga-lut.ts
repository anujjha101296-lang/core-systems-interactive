import type { Lesson } from "./types";
export const fpgaLutLesson:Lesson={
 slug:"fpga-programmable-logic-luts",track:"digital-logic",title:"FPGA Fabric, LUTs & Programmable Logic",
 short:"Program a truth table inside a lookup table and connect Boolean functions to FPGA logic, registers, routing and configuration.",
 flagship:true,
 question:"How can the same physical FPGA implement a counter today, a protocol controller tomorrow, and a custom datapath after reconfiguration?",
 problem:"An FPGA is not a fixed collection of only AND and OR gates. Its configurable logic elements, registers, routing and specialized resources are programmed to implement a digital circuit. Understanding LUTs reveals how Boolean functions map into programmable hardware and why routing and timing matter as much as the truth table.",
 idea:"A k-input lookup table stores 2^k output bits, one for every possible input combination. The current input pattern selects one stored bit. FPGA logic elements often combine LUTs with flip-flops and carry resources, while programmable routing connects elements. Configuration loads the state that defines the implemented circuit.",
 how:{text:"For a k-input LUT, there are 2^k possible input patterns and a one-output truth table requires 2^k stored bits. An input pattern is interpreted as an index into that table. Multiple LUTs can be composed to implement wider functions; synthesis maps RTL into LUTs, registers, memories, DSP blocks and routing resources supported by the target FPGA.",formula:"LUT entries = 2^k\nSingle-output truth-table storage = 2^k bits\nY = truthTable[inputIndex]",example:"A 4-input LUT has 16 possible input patterns and stores 16 output bits. Any Boolean function of four inputs can be represented by choosing those 16 output values, subject to the target's LUT primitive and input/output conventions."},
 lab:"fpgalut",
 trace:[
  {label:"Describe behavior in RTL",detail:"Write combinational or sequential RTL that describes the required circuit, with complete assignments and correct reset/clock semantics."},
  {label:"Synthesize to resources",detail:"Synthesis simplifies logic and maps it into LUTs, flip-flops, carry chains, block memories or DSP resources where suitable."},
  {label:"Program the LUT",detail:"A LUT stores the function's output for each input pattern. The input bits select one configuration bit."},
  {label:"Connect the fabric",detail:"Programmable routing links LUT outputs and register inputs/outputs; routing delay and congestion can dominate a path."},
  {label:"Place, route and time",detail:"Implementation tools place resources, route connections, analyze constraints and report timing. A logically correct circuit can still fail timing closure."},
  {label:"Configure the device",detail:"A configuration bitstream sets the FPGA's logic and routing state; reconfiguration changes the implemented circuit without manufacturing a new chip."}
 ],
 checks:[
  {id:"fpga-entries",kind:"numeric",prompt:"How many truth-table entries does a 4-input LUT have?",answer:16,tolerance:0,hints:["There are 2^k possible input combinations."],explain:"2^4=16 input patterns, so the LUT has 16 entries."},
  {id:"fpga-bits",kind:"numeric",prompt:"For one output, how many configuration bits represent an arbitrary 5-input LUT truth table?",answer:32,tolerance:0,hints:["One stored output bit per input pattern."],explain:"A 5-input LUT has 2^5=32 patterns and stores 32 output bits for one output."},
  {id:"fpga-route",kind:"mcq",prompt:"Why can a logically correct FPGA design still fail timing?",options:["Programmable routing and resource placement add delay","A truth table cannot describe Boolean functions","FPGAs have no registers","Every LUT output is asynchronous to all clocks"],answer:0,hints:["Logic depth is not the only source of path delay."],explain:"Placement, routing, fanout and clocking contribute delay; timing closure checks the implemented path against constraints."},
  {id:"fpga-config",kind:"mcq",prompt:"What does FPGA configuration primarily determine?",options:["The LUT functions and programmable interconnect state","The transistor manufacturing process after fabrication","The source code variable names only","The external clock frequency automatically"],answer:0,hints:["Configuration changes what the fabric implements."],explain:"Configuration data sets the programmable logic and routing state that implements the circuit."},
  {id:"fpga-map",kind:"mcq",prompt:"Which statement best describes synthesis?",options:["It maps RTL behavior into hardware resources supported by the target","It guarantees all timing constraints pass","It only changes the UI theme","It physically manufactures the FPGA"],answer:0,hints:["Synthesis translates and optimizes a hardware description."],explain:"Synthesis maps RTL into a netlist using available resources; placement, routing and timing analysis follow."},
  {id:"fpga-lut",kind:"scenario",prompt:"You change one truth-table output bit in a 4-input LUT. What is the direct logical effect?",options:["The output changes for that input pattern; other stored rows remain unchanged","Every input pattern must invert","The clock period doubles automatically","The FPGA needs new silicon"],answer:0,hints:["Each row corresponds to one input combination."],explain:"Changing one stored bit changes the function's output for the corresponding input pattern; the rest of the truth table remains the same."}
 ],
 deeper:[
  {title:"LUTs are configurable Boolean functions",body:"A LUT implements a Boolean function by storing its output for each possible input combination. A k-input, one-output LUT stores 2^k bits. Some FPGA families have fracturable LUTs, multiple outputs, dedicated carry logic or other structures, so exact resource mapping depends on the device."},
  {title:"Registers and sequential logic",body:"LUTs implement combinational behavior, while flip-flops store state on clock edges. FPGA logic blocks often combine LUT outputs with registers and clock-enable/reset controls, allowing RTL state machines and pipelines to map into the fabric."},
  {title:"Routing and timing closure",body:"A synthesized netlist is not yet a physical implementation. Placement chooses resource locations and routing chooses interconnect paths. Wire delay, fanout, congestion, setup/hold constraints and clock distribution determine whether the implemented design meets timing."},
  {title:"Dedicated FPGA resources",body:"Block RAM, distributed RAM, DSP/multiplier blocks, carry chains, PLLs and high-speed transceivers can be more efficient than building every function from generic LUTs. RTL style and inference patterns affect whether tools recognize and use these resources."},
  {title:"FPGA versus ASIC",body:"FPGAs offer reconfigurability and shorter development cycles but consume area and power for programmable routing/configuration. ASICs can optimize a fixed design for performance, area and energy but require manufacturing and have higher upfront cost and longer iteration cycles."},
  {title:"Verification and board-level constraints",body:"RTL simulation checks logical behavior; synthesis reports show inferred resources; implementation reports show placement/routing and timing. Pin assignments, I/O standards, clock constraints, reset behavior and board electrical requirements are also part of a reliable FPGA design."}
 ],
 followups:[
  {q:"Can a LUT implement any Boolean function?",a:"A k-input, one-output LUT can represent any Boolean function of those k inputs by storing the output for all 2^k input patterns."},
  {q:"Does successful synthesis guarantee timing closure?",a:"No. Placement, routing, fanout, clock distribution and setup/hold constraints are checked during implementation and timing analysis."},
  {q:"Why use an FPGA instead of an ASIC?",a:"An FPGA is reconfigurable and useful for prototyping or adaptable systems; an ASIC can offer better optimized PPA for a fixed design but requires fabrication and larger upfront investment."}
 ],
 tradeoff:{failure:"Assuming synthesis alone guarantees a working physical implementation or that LUT count alone determines FPGA performance.",tradeoff:"FPGAs provide reconfigurability and fast iteration but pay overhead in programmable routing, configuration and often power/area compared with a fixed ASIC implementation."},
 numbers:[{label:"4-input LUT",value:"16 entries"},{label:"k-input LUT",value:"2^k output bits"},{label:"Implementation",value:"synthesis → place/route → timing"}],
 model:"I describe the circuit in RTL, inspect how synthesis maps it to LUTs, registers and dedicated resources, then validate placement/routing, constraints and timing reports. For a k-input LUT, I can reason about the function as 2^k stored output bits indexed by the input pattern.",
 debug:{q:"The RTL simulates correctly but the FPGA build misses timing. What should you inspect?",a:"Inspect the critical path, logic depth, high fanout, placement/routing delay, clock constraints, setup/hold reports and whether dedicated resources or pipelining could reduce the path delay."},
 rapid:["A k-input LUT stores 2^k output bits","The input pattern selects a truth-table row","FPGA logic blocks often combine LUTs and registers","Synthesis maps RTL to available hardware resources","Placement and routing contribute path delay","Timing closure is separate from logical correctness","FPGAs are reconfigurable; ASICs are fixed after fabrication"],
 before:[{track:"digital-logic",slug:"rtl-verilog-foundations"},{track:"digital-logic",slug:"verification-testbench-design"}],
 derive:"Program a 4-input LUT to implement parity, then toggle one truth-table row and predict which input combination changes. Explain why this is a logical model rather than a physical timing analysis.",
 keyIdea:"An FPGA configures stored truth tables and routing to implement hardware; successful logic mapping is only one step toward a timing-clean implementation.",
 commonMistake:"Treating the LUT as a fixed gate or assuming a correct synthesized netlist automatically meets timing after placement and routing.",
 interviewLadder:[
  {level:"definition",q:"What does a k-input LUT store?",a:"One output bit for each of the 2^k possible input combinations."},
  {level:"mechanism",q:"How does the input determine the output?",a:"The input pattern forms an index selecting the stored truth-table bit."},
  {level:"trade-off",q:"Why can FPGA routing dominate delay?",a:"Programmable interconnect adds wire delay, fanout and congestion beyond the logic-cell delay."},
  {level:"systems",q:"What stages follow synthesis?",a:"Implementation places and routes the netlist, then static timing analysis checks paths against clock and I/O constraints before generating configuration data."}
 ]
};
