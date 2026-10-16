import type { Lesson } from "./types";
export const registersLesson: Lesson = {
 slug:"registers-shift-registers-counters",track:"digital-logic",title:"Registers, Shift Registers & Counters",
 short:"Compose flip-flops into multi-bit state: load, enable, reset, shifting, and modulo counters.",
 flagship:true,
 question:"How can eight flip-flops hold a byte, shift a serial stream, or count clock cycles—and what should happen when reset or enable is asserted?",
 problem:"A flip-flop stores one bit. Real datapaths need words, serial-to-parallel conversion, timers, and sequence counters. These are compositions of state elements with shared clock and carefully defined control priority.",
 idea:"An n-bit register stores one of 2ⁿ patterns. Enable chooses between loading new data and holding old data; reset forces a known state. Shift registers move bits by one position, while counters implement a modular next-state function.",
 how:{text:"**Parallel register:** Q⁺=0 when reset is active; otherwise Q⁺=D when enable=1, else Q⁺=Q. **Shift register:** shift one position and insert a serial bit. **Up counter:** Q⁺=(Q+1) mod 2ⁿ. **Down counter:** Q⁺=(Q−1) mod 2ⁿ. The exact priority of reset, enable, load and shift is part of the circuit specification.",formula:"Q⁺ = reset ? 0 : (enable ? D : Q)\nUp: Q⁺ = (Q + 1) mod 2ⁿ\nDown: Q⁺ = (Q − 1) mod 2ⁿ",example:"For a 4-bit up counter starting at 1110₂: 1110 → 1111 → 0000 → 0001. The wrap is intentional modulo-16 behavior, not a malfunction. A separate carry/terminal-count signal can indicate the wrap if the system needs it."},
 lab:"registers",trace:[
 {label:"Define width and state",detail:"Specify n, the legal range 0…2ⁿ−1, and what each stored bit means."},
 {label:"Write control priority",detail:"Decide whether reset overrides enable, and whether load, shift or count has priority."},
 {label:"Derive next state",detail:"Use Q⁺=D for load, Q⁺=Q for hold, bit movement for shift, or modular arithmetic for count."},
 {label:"Test wrap and hold",detail:"Check reset, enable=0, maximum count, zero count, and serial input at both ends."}
 ],
 checks:[
 {id:"dl8-register",kind:"numeric",prompt:"A 4-bit register holds 9. Enable=0, reset=0, and D=2. What is Q after the edge?",answer:9,tolerance:0,hints:["Disabled means hold the current state."],explain:"Enable is 0 and reset is inactive, so Q⁺=Q=9."},
 {id:"dl8-reset",kind:"numeric",prompt:"A 4-bit register has reset=1, enable=1 and D=15. What is Q⁺ under this lesson's reset priority?",answer:0,tolerance:0,hints:["Reset overrides load."],explain:"Reset has priority over enable, so the next state is 0000."},
 {id:"dl8-wrap",kind:"numeric",prompt:"A 4-bit up-counter is at 15. What is its next stored state?",answer:0,tolerance:0,hints:["Modulo 16: discard carry beyond bit 3."],explain:"(15+1) mod 16 = 0. A separate terminal-count/carry signal can report the wrap."},
 {id:"dl8-down",kind:"numeric",prompt:"A 3-bit down-counter is at 0. What is the next state?",answer:7,tolerance:0,hints:["Modulo 8 wraps below zero to the maximum 3-bit value."],explain:"(0−1) mod 8 = 7, binary 111."},
 {id:"dl8-shift",kind:"numeric",prompt:"A 4-bit register contains 0101. Shift left once, insert serial input 1 at the LSB, and discard the outgoing MSB. What is the result in decimal?",answer:11,tolerance:0,hints:["Shift 0101 left to 1010, then insert 1 at the LSB."],explain:"(0101 << 1) with low bit set gives 1011₂ = 11."},
 {id:"dl8-states",kind:"numeric",prompt:"How many distinct states can an 8-bit register represent?",answer:256,tolerance:0,hints:["An n-bit storage element has 2ⁿ bit patterns."],explain:"2⁸ = 256 patterns, from 00000000 to 11111111."}
 ],
 deeper:[
 {title:"Register with enable",body:"A common implementation feeds Q back through a mux: select D when enable is high, otherwise select Q. The flip-flops capture the selected value on the clock edge. This is why enable is a control input, not an independent memory element."},
 {title:"Shift-register uses",body:"Serial-in/serial-out delays a bit stream; serial-in/parallel-out collects a word; parallel-in/serial-out transmits a word; parallel-in/parallel-out loads and exposes all bits. Direction and bit numbering must be stated explicitly."},
 {title:"Counter implementation",body:"A binary counter can be built from flip-flops and next-state logic. Ripple counters clock later stages from earlier outputs and accumulate delay; synchronous counters share a clock and compute toggling conditions combinationally."},
 {title:"Reset and enable semantics",body:"Synchronous reset is sampled at the clock edge. An asynchronous reset acts outside the clock but deassertion must be synchronized or otherwise constrained. RTL coding order establishes priority; state that priority in the specification and test it."},
 {title:"Terminal count and overflow",body:"The modulo state wraps by design. A terminal-count pulse can signal the final state, and cascading counters may use carry/borrow or enable pulses. Do not confuse stored low bits with the wider mathematical result."}
 ],
 followups:[
 {q:"Why does an enabled register need a feedback mux?",a:"It selects new D when enabled and the existing Q when disabled, making hold behavior explicit."},
 {q:"What is the difference between a shift register and a counter?",a:"A shift register moves or inserts data bits; a counter follows a numeric state-transition sequence."},
 {q:"Why prefer synchronous counters over ripple counters at high speed?",a:"Synchronous designs avoid cascading clock transitions through every stage, though their next-state logic and fanout still determine timing."}
 ],
 tradeoff:{failure:"Forgetting width-limited wrap, shifting in the wrong bit position, or writing reset/enable logic with the wrong priority.",tradeoff:"More control and wider datapaths improve flexibility but increase muxing, fanout, switching power, and timing complexity."},
 numbers:[{label:"States for n bits",value:"2ⁿ"},{label:"4-bit count range",value:"0–15"},{label:"8-bit patterns",value:"256"}],
 model:"I specify the register width, reset type, enable semantics and priority first. Then I write the next-state equation, implement it with flip-flops plus selection logic, and test hold, load, reset, shift endpoints and modulo wrap. I distinguish the stored low bits from carry/terminal-count signals.",
 debug:{q:"An enabled register changes to D even when enable=0. What should you inspect?",a:"Check the mux/feedback path and the RTL next-state condition. Disabled means Q⁺=Q; verify the enable polarity and reset priority, then test both enable values."},
 rapid:["Register stores n bits → 2ⁿ patterns","Enable=0 means hold","Reset priority must be specified","Shift moves bits and inserts serial data","n-bit up-count wraps max → 0","n-bit down-count wraps 0 → max","Synchronous counters share a clock"],
 before:[{track:"digital-logic",slug:"sequential-foundations"}],
 derive:"For a 4-bit counter, write the binary sequence from 1110 through wrap to 0001 and explain why the stored state is modulo 16.",
 keyIdea:"A register is a bank of state elements; control signals define exactly when its stored state may change.",
 commonMistake:"Treating overflow wrap as arithmetic error, or assuming reset and enable priority without reading the specification.",
 interviewLadder:[
 {level:"definition",q:"How many states does an n-bit register represent?",a:"2ⁿ distinct bit patterns."},
 {level:"mechanism",q:"How does enable create hold behavior?",a:"A mux selects either D or the current Q feedback before the flip-flops sample it."},
 {level:"trade-off",q:"Synchronous vs ripple counter?",a:"Synchronous counters share a clock and usually offer more predictable timing; ripple counters can be smaller but accumulate stage delay."},
 {level:"systems",q:"Where do shift registers appear?",a:"Serial interfaces, serializers/deserializers, delay lines, protocol engines and bit-serial datapaths."}
 ]
};
