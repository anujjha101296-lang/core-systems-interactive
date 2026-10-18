import type { Lesson } from "./types";
export const digitalCapstoneLesson:Lesson={
 slug:"digital-design-capstone-uart-fifo",track:"digital-logic",title:"Digital Design Capstone: FIFO-Backed UART Transmitter",
 short:"Integrate a FIFO, finite-state machine, bit serialization, reset behavior and self-checking verification into one small digital subsystem.",
 flagship:true,
 question:"How do you turn isolated circuit blocks into a working digital subsystem with a clear interface, bounded buffering and verifiable timing behavior?",
 problem:"A UART transmitter alone can serialize a byte, and a FIFO alone can buffer data, but a useful system must connect them without dropping data, corrupting bit order, or violating the interface contract. The capstone combines combinational logic, sequential state, queue behavior, serial framing and verification into one design brief.",
 idea:"Define the interface first: software or upstream logic pushes bytes when the FIFO is not full; the transmitter removes one byte when idle, emits a low start bit, eight data bits LSB-first and a high stop bit, then marks the frame complete. A self-checking testbench should verify byte ordering, exact frame bits, backpressure/overflow, reset and state transitions.",
 how:{text:"The teaching model advances one bit-time per step. When idle with queued data, it dequeues a byte and emits the start bit. Subsequent steps emit bits 0 through 7; the final step emits the stop bit and increments the completed-frame count. The four-entry FIFO preserves byte order and rejects pushes when full.",formula:"8-N-1 frame = 1 start + 8 data + 1 stop = 10 bit times\nFIFO accepts push iff occupancy < depth\nTX data bit i = (byte >> i) & 1, for i = 0…7",example:"For byte 0x53, binary is 01010011; UART sends data bits 1,1,0,0,1,0,1,0 after the start bit 0, then stop bit 1. A testbench should check the ten-bit frame and confirm that a second queued byte begins only after the first frame completes."},
 lab:"dlcapstone",
 trace:[
  {label:"Specify the interface",detail:"Define byte push, FIFO full, transmitter busy/idle, TX output, reset, and completion behavior before writing RTL."},
  {label:"Buffer incoming bytes",detail:"The FIFO decouples the producer from the serial bit rate and must preserve order while rejecting pushes at capacity."},
  {label:"Control serialization with an FSM",detail:"The transmitter progresses through idle, data and stop states; bit index and current byte determine the output."},
  {label:"Respect bit and frame timing",detail:"The line idles high, start is low, data is LSB-first, and stop returns high. The lab abstracts each bit-time as one manual tick."},
  {label:"Verify boundaries",detail:"Test empty FIFO, full FIFO, byte ordering, all-zero/all-one bytes, reset during idle/transmit, and exact ten-bit frame length."},
  {label:"Prepare for implementation",detail:"Convert the reference behavior to synthesizable RTL, add a baud-rate divider and timing constraints, run simulation, synthesize, and inspect FPGA implementation reports."}
 ],
 checks:[
  {id:"capstone-frame",kind:"numeric",prompt:"How many bit-times are in the capstone's 8-N-1 UART frame?",answer:10,tolerance:0,hints:["Start + eight data + stop."],explain:"1+8+1=10 bit-times."},
  {id:"capstone-order",kind:"mcq",prompt:"Why place a FIFO before the UART transmitter?",options:["It buffers producer bursts and preserves byte order while serial output runs more slowly","It guarantees zero transmission latency","It replaces the transmitter FSM","It removes the need for reset"],answer:0,hints:["The producer and serial link may run at different rates."],explain:"The FIFO absorbs bursts and decouples the producer from the slower serial output while preserving order."},
  {id:"capstone-lsb",kind:"mcq",prompt:"For the byte 0x53, what is the first data bit sent after the start bit?",options:["0","1","The parity bit","The stop bit"],answer:1,hints:["0x53 has least-significant bit equal to one."],explain:"0x53 ends in binary 1, so bit 0 is sent first and equals 1."},
  {id:"capstone-overflow",kind:"scenario",prompt:"The FIFO already contains four bytes and a new push arrives. What should this model do?",options:["Reject the push and report overflow","Overwrite the oldest byte silently","Change the baud rate","Skip the stop bit"],answer:0,hints:["The buffer has no free entry."],explain:"A full FIFO rejects the push rather than silently corrupting queued data."},
  {id:"capstone-verification",kind:"mcq",prompt:"Which is the strongest directed check for a transmitted byte?",options:["Compare the observed start, eight LSB-first data bits, and stop bit against the expected frame","Check only that TX is sometimes high","Inspect only the source code","Run the design without a clock"],answer:0,hints:["Check the complete protocol frame in order."],explain:"A self-checking test should compare all frame bits and their order with an independently derived expected value."},
  {id:"capstone-cdc",kind:"mcq",prompt:"If the byte producer and UART transmitter use unrelated clocks, what additional concern appears?",options:["Clock-domain crossing and coherent FIFO transfer","The truth table becomes invalid","The stop bit becomes a start bit","No concern, because FIFO data is digital"],answer:0,hints:["Different clocks can sample control/data at unrelated times."],explain:"Use a proper asynchronous FIFO or handshake and CDC verification when producer and consumer clocks are unrelated."}
 ],
 deeper:[
  {title:"Interface contract",body:"A real transmitter needs a defined ready/full or valid/ready contract, reset behavior, busy/done semantics, byte ordering and a precise relationship between accepted input transactions and emitted frames. The reference model makes these assumptions visible."},
  {title:"FIFO and producer backpressure",body:"The FIFO decouples bursts from the slower serial link. When full, the producer must wait or handle rejection; silently overwriting entries violates the transaction contract. A hardware interface commonly exposes ready/full so the producer knows when a byte can be accepted."},
  {title:"FSM and bit timing",body:"The FSM tracks whether the transmitter is idle, emitting data or completing the stop interval. A real implementation uses a baud-rate counter or clock enable; the lab abstracts that divider so each manual tick represents one bit time."},
  {title:"Synthesis-ready RTL",body:"Use explicit-width registers, nonblocking assignments in sequential logic, complete combinational assignments, and deliberate reset/enable priority. Avoid modeling delays in synthesizable RTL; timing comes from clocks, enables and implementation constraints."},
  {title:"Verification plan",body:"A self-checking testbench should enqueue multiple bytes, compare each serialized frame against an independent reference, test full/empty conditions, exercise all-zero and all-one patterns, and verify reset behavior. Assertions can check FIFO bounds and that a frame contains the expected number/order of bits."},
  {title:"Physical implementation",body:"A complete FPGA implementation also needs clock and reset constraints, I/O pin standards, baud-rate accuracy, synthesis/resource inspection, placement/routing, timing closure and board-level signal validation. A passing functional simulation does not establish physical timing or electrical compatibility."}
 ],
 followups:[
  {q:"Why is the bit-time divider omitted from the browser lab?",a:"The lab isolates FIFO/FSM/frame behavior; a real RTL implementation needs a clock enable or divider derived from the system clock and target baud rate."},
  {q:"How do you prevent data loss when the FIFO is full?",a:"Use a clear ready/full handshake or reject the push and notify the producer; never overwrite queued data silently."},
  {q:"What tests are essential for this capstone?",a:"Verify exact start/data/stop bits, LSB-first order, multiple queued bytes, full/empty boundaries, reset, and coherent CDC if clocks differ."}
 ],
 tradeoff:{failure:"Building the transmitter without an interface contract, ignoring FIFO full behavior, reversing bit order, or trusting simulation without checking reset, CDC and physical timing.",tradeoff:"A deeper FIFO absorbs larger bursts but costs storage and latency; a simpler transmitter saves logic but supports fewer framing features; added parity, flow control and baud flexibility increase verification scope."},
 numbers:[{label:"Frame",value:"10 bit-times"},{label:"FIFO",value:"4 bytes"},{label:"Data order",value:"LSB first"}],
 model:"I define the producer/FIFO and transmitter contracts, dequeue only when idle, serialize a byte with explicit start/data/stop states, and verify the emitted frame against an independent reference. I then add baud timing, reset/CDC handling and implementation constraints before treating it as deployable RTL.",
 debug:{q:"The first byte transmits correctly but the second starts with a wrong bit. What should you inspect?",a:"Check current-byte register update, bit-index reset after stop, FIFO dequeue timing, state transitions, and whether the next frame's start bit is emitted before its first data bit."},
 rapid:["Specify ready/full, busy/done and reset behavior","FIFO preserves byte order and absorbs bursts","UART 8-N-1 uses ten bit-times","Data bits are LSB-first","The FSM controls start/data/stop progression","Test full/empty and multiple queued bytes","Real RTL needs baud timing, CDC and implementation checks"],
 before:[{track:"digital-logic",slug:"clock-domain-crossing-reset"},{track:"digital-logic",slug:"serial-interfaces-uart-spi-i2c"},{track:"digital-logic",slug:"verification-testbench-design"}],
 derive:"Enqueue bytes 0x53 and 0x00, step the transmitter one bit-time at a time, and write the expected ten-bit frame for each. Include a full-FIFO test and a reset test in your verification plan.",
 keyIdea:"A real digital subsystem is defined by the contracts between its blocks, not just by whether each block works in isolation.",
 commonMistake:"Testing one byte only and overlooking queue capacity, backpressure, bit order, state reset and cross-clock assumptions.",
 interviewLadder:[
  {level:"definition",q:"What does the FIFO contribute to a UART transmitter?",a:"It buffers bursts and preserves byte order while the transmitter serializes bytes at a slower bit rate."},
  {level:"mechanism",q:"How does the transmitter serialize a byte?",a:"An FSM emits a start bit, data bits LSB-first, and a stop bit using a bit index and timing enable."},
  {level:"trade-off",q:"What does a deeper FIFO trade?",a:"It absorbs larger producer bursts but uses more storage and can increase queued-data latency."},
  {level:"systems",q:"What remains before deploying this as FPGA RTL?",a:"Implement a baud divider, reset/CDC strategy, interface constraints, self-checking simulation, synthesis, placement/routing, timing closure and board-level validation."}
 ]
};
