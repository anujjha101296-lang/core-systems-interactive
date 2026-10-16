import type { Lesson } from "./types";
export const verificationLesson:Lesson={
 slug:"verification-testbench-design",track:"digital-logic",title:"Verification, Testbenches & Coverage",
 short:"Build self-checking tests, reason about coverage, and separate simulation evidence from correctness guarantees.",
 flagship:true,
 question:"How do we know a circuit works beyond the few input combinations we happened to try manually?",
 problem:"A design can look correct in a waveform and still fail on a boundary case or after a specific state transition. Verification needs a clear specification, an expected-result model, deliberate stimulus, automatic checks, and evidence about what was exercised.",
 idea:"A testbench drives inputs and checks outputs against expected behavior. Directed tests target known risks; exhaustive tests cover every input combination when the space is small; constrained-random and coverage-guided tests explore larger spaces. Passing tests only establish behavior for the tested conditions and assertions.",
 how:{text:"For a combinational circuit with k one-bit inputs, exhaustive testing requires 2^k vectors. A self-checking testbench computes or looks up expected outputs and fails automatically on a mismatch. Coverage tracks which vectors, branches, states, transitions, and scenarios were exercised—not merely how many tests ran.",formula:"Input-vector coverage = unique legal vectors tested / total legal vectors × 100%\nExhaustive vectors for k one-bit inputs = 2^k",example:"A full adder has three one-bit inputs, so eight vectors exhaust its combinational input space. A sequential FSM has state and history, so testing every input vector alone is insufficient: reset, transitions, overlaps, and illegal states also matter."},
 lab:"verification",
 trace:[
  {label:"Write expected behavior independently",detail:"Derive the truth table or reference model from the specification rather than copying the implementation equations verbatim."},
  {label:"Choose directed boundary cases",detail:"Include zero, all ones, carry/overflow boundaries, reset, enable, and invalid or unusual sequences."},
  {label:"Use exhaustive tests when feasible",detail:"A three-input full adder has only eight vectors; exhaustive coverage is cheaper and stronger than sampling a few cases."},
  {label:"Automate checking",detail:"Use assertions or if-checks that fail the run when actual and expected outputs differ. Avoid relying on a human to spot a waveform discrepancy."},
  {label:"Measure meaningful coverage",detail:"Track unique vectors and state/transition coverage. A high test count can still miss an important behavior."},
  {label:"Keep simulation and proof distinct",detail:"Simulation explores selected cases. Formal verification can reason about all modeled states under assumptions, while synthesis/timing checks address different implementation properties."}
 ],
 checks:[
  {id:"verify-count",kind:"numeric",prompt:"How many input vectors are required to exhaustively test a combinational circuit with four one-bit inputs?",answer:16,tolerance:0,hints:["There are 2^k binary input combinations."],explain:"2^4=16 input vectors."},
  {id:"verify-fulladder",kind:"numeric",prompt:"A full adder has A, B and Cin. How many unique input vectors exist?",answer:8,tolerance:0,hints:["Three one-bit inputs give 2^3 combinations."],explain:"There are 2^3=8 combinations."},
  {id:"verify-selfcheck",kind:"mcq",prompt:"What makes a testbench self-checking?",options:["It automatically compares actual behavior with expected behavior and fails on mismatch","It contains no expected values","It only prints waveforms","It is synthesizable hardware"],answer:0,hints:["A human should not need to visually inspect every output to detect failure."],explain:"A self-checking testbench evaluates assertions or comparisons and reports failure automatically."},
  {id:"verify-coverage",kind:"numeric",prompt:"A 3-input combinational block has 8 legal vectors; a suite covers 6 unique vectors. What is vector coverage in percent?",answer:75,tolerance:0.01,unit:"%",hints:["Compute 6/8 × 100."],explain:"6/8×100%=75%."},
  {id:"verify-random",kind:"scenario",prompt:"A tiny 3-input combinational block has only eight legal vectors. Which test strategy is strongest for the input space?",options:["Try one random vector","Exhaustively test all eight vectors","Only test the all-zero vector","Only inspect the source code"],answer:1,hints:["The entire space is small enough to enumerate."],explain:"Exhaustive testing covers every legal combination for this small combinational input space."},
  {id:"verify-limit",kind:"mcq",prompt:"What does a passing simulation prove?",options:["The design is correct for every possible input and timing condition","The tested scenarios passed under the simulation model and checks","The design will meet physical timing automatically","The code must be synthesizable"],answer:1,hints:["Coverage and assumptions limit what a simulation establishes."],explain:"A passing simulation is evidence for the tested conditions; it does not alone prove all behaviors or implementation constraints."}
 ],
 deeper:[
  {title:"Reference models and independence",body:"An expected model should come from the specification and ideally use a different reasoning path than the implementation. If the testbench copies the same mistaken equation, both can agree on the same wrong answer."},
  {title:"Directed, exhaustive and randomized tests",body:"Directed tests target likely failures and boundaries. Exhaustive testing is powerful when the state/input space is small. Constrained-random tests explore larger spaces; seeds and constraints should be recorded for reproducibility, and failures should be minimized to a concise counterexample."},
  {title:"Assertions and scoreboards",body:"Assertions encode properties that should always hold, such as a FIFO count staying within capacity or a valid transfer occurring only under the interface handshake. A scoreboard tracks expected transactions and compares observed outputs over time."},
  {title:"Coverage types",body:"Code coverage asks which statements or branches executed. Functional coverage asks which specified scenarios occurred. State/transition coverage is useful for FSMs. Vector coverage alone cannot establish that a stateful protocol has been exercised correctly."},
  {title:"Four-state simulation",body:"SystemVerilog logic can represent X and Z in simulation. Unknown values can reveal uninitialized state or contention, but X propagation and synthesis semantics differ. Testbenches should avoid hiding unknowns with careless comparisons; case inequality ( !== ) is often useful for checks."},
  {title:"Simulation, formal and implementation checks",body:"Simulation checks selected traces. Formal tools can prove properties for all states within a model and assumptions. Synthesis checks inferred hardware, while static timing analysis checks path constraints. These techniques complement rather than replace one another."}
 ],
 followups:[
  {q:"Why should the expected model differ from the RTL implementation?",a:"Independent formulations reduce the chance that the testbench repeats the same logic error as the design."},
  {q:"Does 100% statement coverage imply functional correctness?",a:"No. Code can execute without assertions checking the correct behavior; functional scenarios and transition coverage matter too."},
  {q:"When is exhaustive testing practical?",a:"When the legal input/state space is small, such as a 3-input full adder with only eight input vectors."}
 ],
 tradeoff:{failure:"Relying on waveform inspection, testing only typical cases, duplicating implementation logic in the oracle, or equating code coverage with correctness.",tradeoff:"Exhaustive tests are decisive for small spaces but grow exponentially; randomized testing scales further but needs constraints, coverage goals, reproducible seeds, and failure minimization."},
 numbers:[{label:"Full-adder vectors",value:"8"},{label:"4-input vectors",value:"16"},{label:"Coverage",value:"unique cases / legal cases"}],
 model:"I derive expected behavior from the specification, enumerate the full space when feasible, add boundary and state-transition tests, and automate checks with assertions or scoreboards. I inspect functional coverage and use simulation, formal, synthesis, and timing analysis for their distinct purposes.",
 debug:{q:"The regression suite passes, but students still find a bug on an unusual sequence. What should you improve?",a:"Add the failing sequence as a regression, inspect state/transition and functional coverage, and ensure the reference model and assertions check the behavior independently."},
 rapid:["Testbench drives inputs and checks outputs","Self-checking tests fail automatically on mismatch","k one-bit inputs have 2^k vectors","Exhaustive testing is ideal for small spaces","Stateful designs need transition and reset coverage","Coverage is evidence of exercised scenarios, not proof","Simulation, formal, synthesis, and STA answer different questions"],
 before:[{track:"digital-logic",slug:"rtl-verilog-foundations"},{track:"digital-logic",slug:"rtl-arithmetic-and-alu"}],
 derive:"Write a self-checking testbench for a 1-bit full adder, enumerate all eight vectors, and explain why exhaustive combinational coverage does not test sequential reset behavior.",
 keyIdea:"Verification is a deliberate argument that tested behavior matches a specification—not just a waveform that looks plausible.",
 commonMistake:"Counting test cases without measuring what behavior they cover or using an expected model that duplicates the implementation's mistake.",
 interviewLadder:[
  {level:"definition",q:"What is a self-checking testbench?",a:"A test harness that applies stimulus, computes expected results, and automatically reports mismatches."},
  {level:"mechanism",q:"How many vectors exhaust a k-input combinational function?",a:"2^k legal binary vectors, if each input is one bit and all combinations are allowed."},
  {level:"trade-off",q:"Directed versus randomized testing?",a:"Directed tests target known risks; constrained-random tests explore larger spaces but require reproducible seeds and coverage."},
  {level:"systems",q:"What does a passing regression not guarantee?",a:"It does not alone prove all behavior, synthesis intent, physical timing, or correctness under untested assumptions."}
 ]
};
