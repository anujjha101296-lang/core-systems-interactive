import type { Lesson } from "./types";
export const arithmeticLesson: Lesson = {
 slug:"rtl-arithmetic-and-alu",track:"digital-logic",title:"Arithmetic Circuits, Add/Subtract & ALU Flags",
 short:"Connect two's-complement arithmetic to fixed-width hardware, carry/borrow, zero, sign and overflow flags.",
 flagship:true,
 question:"Why can the same bit pattern be a valid unsigned result but an overflowed signed result?",
 problem:"Hardware arithmetic operates on fixed-width bit vectors. The adder produces a modular result and a carry-out, while signed two's-complement interpretation has a different representable range. Confusing carry with signed overflow leads to incorrect branch conditions, ALU flags, and RTL.",
 idea:"An N-bit adder computes modulo 2^N. Addition carry-out reports a bit beyond the unsigned width; signed overflow reports that the mathematical signed result is outside the two's-complement range. Subtraction can reuse an adder using A + (~B) + 1.",
 how:{text:"For N-bit subtraction, invert each bit of B and set carry-in=1. The result is A + (~B) + 1 modulo 2^N. For addition, signed overflow occurs when A and B have the same sign but the result has the opposite sign. For subtraction, overflow occurs when A and B have different signs and the result sign differs from A.",formula:"ADD: V = ~(A[N−1] ⊕ B[N−1]) · (Y[N−1] ⊕ A[N−1])\nSUB: V = (A[N−1] ⊕ B[N−1]) · (Y[N−1] ⊕ A[N−1])\nSUB: A − B = A + (~B) + 1",example:"With 4-bit two's complement, 7 + 3 = 10 mathematically, but 1010 represents −6. Carry-out is 0, while signed overflow is 1. For 4-bit unsigned 2 − 5, the result bits are 1101 (13) and carry-out=0 indicates a borrow under this convention."},
 lab:"arithmetic",
 trace:[
  {label:"Fix the width",detail:"An N-bit result retains only the low N bits; arithmetic wraps modulo 2^N."},
  {label:"Interpret operands deliberately",detail:"The same bit vector may represent an unsigned number or a signed two's-complement value."},
  {label:"Unify add and subtract",detail:"Use A + (B XOR SUB replicated across the width) + SUB."},
  {label:"Compute flags independently",detail:"Carry-out describes unsigned extension/borrow convention; overflow describes signed range overflow; zero and negative inspect result bits."},
  {label:"Verify edge cases",detail:"Test 0, maximum positive, minimum negative, all ones, equal operands, and values around the sign boundary."}
 ],
 checks:[
  {id:"alu-width",kind:"numeric",prompt:"A 4-bit unsigned adder computes 15 + 1. What 4-bit result remains?",answer:0,tolerance:0,hints:["The result is modulo 16."],explain:"The low four bits of 10000 are 0000; carry-out is 1."},
  {id:"alu-carry-overflow",kind:"mcq",prompt:"For 4-bit two's-complement 7 + 3, what are carry-out and signed overflow?",options:["Carry=0, overflow=1","Carry=1, overflow=0","Carry=1, overflow=1","Carry=0, overflow=0"],answer:0,hints:["7=0111, 3=0011, and the result bits are 1010."],explain:"The 5-bit unsigned sum is 01010, so carry-out=0. The 4-bit result 1010 has the opposite sign from two positive operands, so signed overflow=1."},
  {id:"alu-sub",kind:"mcq",prompt:"Which identity lets an adder implement two's-complement subtraction?",options:["A − B = A + B","A − B = A + (~B) + 1","A − B = (~A) + B","A − B = A XOR B"],answer:1,hints:["Take the two's complement of B."],explain:"Two's complement of B is ~B+1, so A−B=A+(~B)+1."},
  {id:"alu-zero",kind:"scenario",prompt:"An ALU result is all zero bits. Which flag is directly asserted by this fact?",options:["Zero","Carry always","Signed overflow always","Negative always"],answer:0,hints:["This flag tests whether every result bit is 0."],explain:"The zero flag is true exactly when the result vector equals zero."},
  {id:"alu-subcarry",kind:"mcq",prompt:"Under the common adder implementation A + (~B) + 1, what does carry-out=1 mean for unsigned subtraction?",options:["A borrow occurred","No unsigned borrow occurred","Signed overflow occurred","The result is zero"],answer:1,hints:["The carry is the complement of the borrow indicator in this convention."],explain:"For this common implementation, carry-out=1 means no unsigned borrow; carry-out=0 means a borrow."},
  {id:"alu-negative",kind:"typed",prompt:"In N-bit two's-complement arithmetic, which result bit determines the signed negative flag?",accept:["msb","most significant bit","sign bit","n-1 bit","bit n-1"],hints:["It is the highest-order bit of the fixed-width result."],explain:"For two's-complement values, the most significant bit is the sign bit."}
 ],
 deeper:[
  {title:"Modular arithmetic",body:"An N-bit datapath retains a result modulo 2^N. Wraparound is not automatically an error: it is the natural bit-vector result. Whether that result represents a valid mathematical answer depends on signedness and the operation's contract."},
  {title:"Carry is not overflow",body:"Carry-out is defined by the unsigned adder extension. Signed overflow checks whether a two's-complement result left the representable signed range. They can differ; branches and exception logic must use the intended flag."},
  {title:"Subtraction using an adder",body:"A − B = A + (~B) + 1. XORing every B bit with SUB and using SUB as carry-in allows one adder to implement both addition and subtraction. This is a standard ALU construction."},
  {title:"Zero and negative flags",body:"Zero is true when every result bit is 0. Negative commonly copies the most significant result bit under two's-complement interpretation. Flags are derived from result and carry signals, but their exact meaning is ISA- and design-specific."},
  {title:"RTL widths and signedness",body:"HDL expression sizing and signedness can introduce truncation or extension bugs. Declare widths explicitly, avoid ambiguous unsized literals where practical, and test both unsigned and signed boundaries. A mathematical integer reference model should mask results to the intended width."},
  {title:"From ALU to processor control",body:"An ALU can expose result, zero, carry, and overflow. Control logic selects the operation, while branch logic may use zero for equality or signed/unsigned comparisons. ISA specifications determine which flags are architecturally visible."}
 ],
 followups:[
  {q:"Can carry-out be 0 while signed overflow is 1?",a:"Yes. For 4-bit signed 7+3, result bits are 1010, carry-out is 0, and signed overflow is 1."},
  {q:"Why can subtraction reuse an adder?",a:"Two's-complement subtraction is A + (~B) + 1, so invert B conditionally and set carry-in for subtraction."},
  {q:"Does a zero result imply no overflow?",a:"No. Flags answer separate questions; derive each according to its definition rather than assuming one determines another."}
 ],
 tradeoff:{failure:"Using carry-out as a signed overflow flag, forgetting width truncation, or failing to define the subtraction borrow convention.",tradeoff:"Sharing one adder for addition/subtraction saves area but adds operand-conditioning/control logic; wider arithmetic improves range but increases area, delay and power."},
 numbers:[{label:"N-bit result",value:"mod 2^N"},{label:"Signed range",value:"−2^(N−1)…2^(N−1)−1"},{label:"Subtract",value:"A + (~B) + 1"}],
 model:"I fix operand width and signedness, compute the bit-vector result modulo 2^N, and derive carry, zero, negative, and signed overflow independently. I verify boundary vectors and use the exact flag convention required by the target ALU or ISA.",
 debug:{q:"A signed comparison fails for 7 + 3 in a 4-bit ALU. What should you inspect?",a:"The result bits are 1010, which is −6 in four-bit two's complement, and signed overflow is asserted. Check that the design uses the signed-overflow/compare logic rather than treating the result as an unbounded integer."},
 rapid:["N-bit arithmetic wraps modulo 2^N","Carry-out and signed overflow are different","A−B = A+(~B)+1","Zero means all result bits are zero","Negative commonly copies the MSB","Subtraction carry=1 often means no unsigned borrow","Explicit widths prevent subtle RTL bugs"],
 before:[{track:"digital-logic",slug:"rtl-verilog-foundations"}],
 derive:"Implement a 4-bit add/sub unit. Derive carry-out, zero, negative, and signed overflow, then explain why 7+3 overflows signed arithmetic without producing an unsigned carry.",
 keyIdea:"A fixed-width result is a bit vector; carry and signed overflow must be computed and interpreted separately.",
 commonMistake:"Treating carry-out and signed overflow as synonyms or forgetting that subtraction is width-limited.",
 interviewLadder:[
  {level:"definition",q:"What does an N-bit adder return?",a:"The low N bits of the sum and a carry-out bit, equivalent to modular arithmetic for the bit-vector result."},
  {level:"mechanism",q:"How is signed overflow detected for addition?",a:"It occurs when the operands have the same sign and the result sign differs."},
  {level:"trade-off",q:"Why reuse an adder for subtraction?",a:"Conditional inversion of B and a carry-in of one implement A+(~B)+1, sharing arithmetic hardware."},
  {level:"systems",q:"Why must an ALU specify flag semantics?",a:"Processor control and branch conditions depend on exact signed/unsigned behavior, width, and carry/borrow convention."}
 ]
};
