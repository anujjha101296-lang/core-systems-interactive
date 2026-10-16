import type { Lesson } from "./types";
export const memoryFifoLesson:Lesson={
 slug:"memory-fifos-rtl",track:"digital-logic",title:"Memories, FIFOs & RTL Buffer Design",
 short:"Model synchronous queues, capacity, ordering, full/empty behavior, and dataflow between producer and consumer.",
 flagship:true,
 question:"How can one hardware block accept a stream of data while another consumes it at a different rate without losing ordering or silently overwriting entries?",
 problem:"A memory stores values at addresses, while a FIFO buffers values in arrival order. In hardware pipelines and interfaces, producers and consumers may run at different rates. Correct RTL must define read latency, pointer wraparound, full/empty behavior, and what happens when requests arrive at boundaries.",
 idea:"A FIFO is a queue backed by storage, usually with read/write pointers and occupancy or pointer-comparison logic. It accepts writes only when capacity exists and reads only when data exists. A synchronous FIFO samples requests at a clock edge; simultaneous push/pop behavior must be specified rather than guessed.",
 how:{text:"For a depth-D FIFO, occupancy changes by +1 on an accepted push and −1 on an accepted pop. Full means occupancy=D; empty means occupancy=0. At a full boundary, a simultaneous accepted pop can free space for a push. At an empty boundary, whether simultaneous push/pop returns the new value depends on the chosen old-state or fall-through semantics.",formula:"count(next) = count + pushAccepted − popAccepted\nempty ⇔ count = 0\nfull ⇔ count = depth",example:"For a depth-4 FIFO, push 5, 6, 7, 8 gives count=4 and full=1. A fifth push is rejected unless the same cycle accepts a pop. Pop returns 5 first, then 6, preserving FIFO order."},
 lab:"memoryfifo",
 trace:[
  {label:"Choose memory semantics",detail:"Decide whether reads are combinational or synchronous, whether output is registered, and what happens on same-address read/write."},
  {label:"Track ownership of slots",detail:"A write pointer identifies the next slot to fill; a read pointer identifies the oldest occupied slot."},
  {label:"Handle pointer wraparound",detail:"For power-of-two depth, low pointer bits wrap naturally; extra wrap bits or an occupancy counter help distinguish full from empty."},
  {label:"Define full and empty",detail:"Do not accept an ordinary push when full or a pop when empty. Specify whether simultaneous operations can change acceptance at the boundary."},
  {label:"Verify boundary cycles",detail:"Test empty pop, filling exactly to capacity, overflow attempts, draining to empty, pointer wraparound, and simultaneous push/pop."}
 ],
 checks:[
  {id:"fifo-order",kind:"order",prompt:"A FIFO receives 4, then 9, then 2. Order the values returned by three valid pops.",items:["4","9","2"],hints:["First in, first out."],explain:"FIFO order returns the oldest item first: 4, then 9, then 2."},
  {id:"fifo-capacity",kind:"numeric",prompt:"A depth-8 FIFO currently contains 6 entries. How many additional pushes can be accepted without any pops?",answer:2,tolerance:0,hints:["Capacity minus occupancy."],explain:"8−6=2 free slots remain."},
  {id:"fifo-full",kind:"mcq",prompt:"What should a basic FIFO do when push is requested while full and no pop is accepted?",options:["Overwrite the oldest item silently","Reject the push and report overflow/backpressure","Move the read pointer anyway","Mark empty"],answer:1,hints:["The FIFO must preserve stored data and order."],explain:"A full FIFO cannot accept another item without losing data; the interface should reject it or apply backpressure according to the contract."},
  {id:"fifo-empty",kind:"mcq",prompt:"What does underflow mean for a FIFO?",options:["A write when the FIFO is full","A read/pop when the FIFO has no valid entry","The write pointer wraps","The output is nonzero"],answer:1,hints:["There is no queued item to consume."],explain:"Underflow is an attempted pop from an empty FIFO."},
  {id:"fifo-count",kind:"numeric",prompt:"A FIFO starts with count=3. One push and one accepted pop occur in the same cycle. What is the next count?",answer:3,tolerance:0,hints:["Apply +1 for push and −1 for pop."],explain:"The net occupancy change is zero."},
  {id:"fifo-memory",kind:"mcq",prompt:"Why must RTL specify synchronous memory read latency?",options:["It affects when valid data becomes available and how downstream logic is timed","It only changes variable names","It eliminates the need for a clock","It determines signed overflow"],answer:0,hints:["A registered memory output appears after a clock edge."],explain:"Read latency is part of the interface contract and affects pipeline control, throughput, and timing."}
 ],
 deeper:[
  {title:"RAM versus register arrays",body:"Small register arrays can be implemented with flip-flops and muxes, while larger arrays may infer block RAM or SRAM macros. The supported coding pattern, port count, read latency, and read-during-write semantics vary by target FPGA/ASIC memory."},
  {title:"Pointer and occupancy designs",body:"A simple FIFO can maintain read pointer, write pointer, and count. A common implementation uses pointer wrap bits to distinguish equal pointers in full versus empty states. Gray-coded pointers are often used for asynchronous FIFOs to reduce ambiguity when synchronizing pointer changes across clock domains."},
  {title:"Backpressure and valid/ready",body:"A producer should not drop data when the FIFO is full. A valid/ready handshake transfers an item only when both sides agree, commonly when valid and ready are high in the sampling cycle. Backpressure propagates upstream and can influence throughput and deadlock risks."},
  {title:"Synchronous versus asynchronous FIFO",body:"A synchronous FIFO shares one clock domain. An asynchronous FIFO crosses between unrelated clocks and requires carefully designed pointer synchronization, usually Gray-coded pointers, and conservative full/empty detection. Independently synchronizing each data bit is not a safe replacement."},
  {title:"Read-during-write behavior",body:"If a memory reads and writes the same address on one edge, the output may be old data, new data, or unchanged depending on the memory primitive and configuration. The RTL contract and testbench must match the target hardware's semantics."},
  {title:"Verification strategy",body:"Exercise empty and full boundaries, exact-capacity fills, pointer wraparound, sustained producer/consumer rate mismatches, simultaneous operations, and reset. A scoreboard queue provides an independent expected order; assertions can check count bounds and valid/ready protocol rules."}
 ],
 followups:[
  {q:"Why can equal read and write pointers mean either empty or full?",a:"After wraparound, pointer equality alone is ambiguous unless the design uses an extra wrap bit, occupancy counter, or another phase distinction."},
  {q:"Why is an asynchronous FIFO different from a synchronous FIFO?",a:"Its read and write sides use unrelated clocks, so pointer crossing, metastability, and conservative full/empty detection require a clock-domain-crossing design."},
  {q:"What does valid && ready mean?",a:"A transfer occurs in that cycle when both producer-valid and consumer-ready are asserted under the interface's sampling convention."}
 ],
 tradeoff:{failure:"Silently overwriting data at full, consuming invalid data at empty, mis-handling pointer wraparound, or assuming memory latency without checking the target primitive.",tradeoff:"Deeper FIFOs absorb bursts but use more storage and can add latency. Registered outputs improve timing but change latency. Async FIFOs cross clock domains safely at the cost of extra synchronization and control logic."},
 numbers:[{label:"FIFO order",value:"first in, first out"},{label:"Capacity",value:"depth D"},{label:"Count change",value:"push − pop"}],
 model:"I define the FIFO's clocking and read semantics, track read/write position and occupancy, and specify accepted push/pop behavior at full and empty boundaries. I test order, capacity, wraparound, simultaneous operations, and backpressure before relying on inferred RAM or pointer logic.",
 debug:{q:"A FIFO occasionally duplicates or skips values after several hundred transfers. What should you inspect?",a:"Check pointer wraparound, full/empty phase logic, accepted push/pop conditions, reset values, and whether the testbench agrees with the memory's synchronous read latency."},
 rapid:["FIFO preserves insertion order","Full and empty are boundary states","Occupancy changes by accepted push minus accepted pop","Specify simultaneous push/pop behavior","Synchronous memory latency is part of the interface","Async FIFOs require CDC-safe pointer synchronization","Use a scoreboard to verify ordering"],
 before:[{track:"digital-logic",slug:"rtl-verilog-foundations"}],
 derive:"Trace a depth-4 FIFO through four pushes, one rejected push, one simultaneous pop/push, and four pops. Track occupancy, full/empty, and the value returned by each pop.",
 keyIdea:"A FIFO is not just storage: it is a protocol that must preserve order and define behavior at capacity and timing boundaries.",
 commonMistake:"Treating full/empty flags as decorative status signals instead of conditions that determine whether a transfer is accepted.",
 interviewLadder:[
  {level:"definition",q:"What does a FIFO guarantee?",a:"Items are returned in the same order they were accepted, subject to the interface's transfer rules."},
  {level:"mechanism",q:"How do pointers identify full and empty?",a:"Read/write pointers track positions; an occupancy count or wrap-phase bits disambiguate equal pointers."},
  {level:"trade-off",q:"Why use a deeper FIFO?",a:"It absorbs bursts and rate mismatch but consumes more memory and may increase buffering latency."},
  {level:"systems",q:"How does an asynchronous FIFO cross clock domains?",a:"It uses independent read/write clocks and CDC-safe pointer synchronization, commonly Gray-coded pointers, with conservative full/empty detection."}
 ]
};
