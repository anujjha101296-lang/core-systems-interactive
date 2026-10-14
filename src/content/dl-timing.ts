import type { Lesson } from "./types";
export const timingLesson: Lesson = {
 slug:"timing-hazards-reliable-design", track:"digital-logic", title:"Timing, Hazards & Reliable Digital Design",
 short:"Connect logic depth to clock speed, setup/hold constraints, glitches, and safe clock-domain crossings.",
 flagship:true,
 question:"A Boolean circuit is logically correct. Why can it still fail at a real clock frequency or produce a dangerous transient?",
 problem:"Boolean equations describe steady-state function, but physical gates have propagation delay, paths have unequal delays, and flip-flops sample signals within timing windows. Asynchronous inputs and mechanical switches introduce further reliability problems.",
 idea:"Correct hardware must satisfy both logical and temporal constraints. Maximum path delay constrains clock period and setup; minimum path delay constrains hold. Unequal path delays can create hazards, while synchronizers reduce metastability risk at asynchronous boundaries.",
 how:{
  text:"For a simplified register-to-register path, **Tclk ≥ Tcq + Tcomb,max + Tsetup + Tskew** where positive skew means the capture clock arrives later. A simplified hold check is **Tcq + Tcomb,min ≥ Thold + Tskew**. Setup is a maximum-delay constraint; hold is a minimum-delay constraint.",
  formula:"Setup slack = Tclk − (Tcq + Tcomb,max + Tsetup + Tskew)\nHold slack = Tcq + Tcomb,min − Thold − Tskew\nFmax ≈ 1 / Tminimum",
  example:"If Tcq=0.4 ns, Tcomb,max=3.2 ns, Tsetup=0.5 ns and positive skew=0.2 ns, the simplified minimum period is 4.3 ns (about 233 MHz before margins and omitted clock uncertainty). A 5 ns clock has 0.7 ns setup slack. Hold must be checked separately using minimum path delay.",
 },
 lab:"timing",
 trace:[
  {label:"Find the critical path",detail:"The longest register-to-register data path usually limits the safe clock period; inspect maximum delays, setup time, and clock arrival."},
  {label:"Check setup and hold separately",detail:"Setup asks whether data arrives early enough before capture. Hold asks whether new data arrives late enough after the capture edge."},
  {label:"Read clock skew with its sign",detail:"A later capture clock generally gives more setup time but makes hold harder in this simplified model."},
  {label:"Distinguish logic from hazards",detail:"A hazard is a transient caused by unequal path delays; Boolean equivalence alone does not guarantee hazard-free transitions."},
  {label:"Cross clock boundaries deliberately",detail:"Use synchronizers for single-bit asynchronous controls, handshakes or asynchronous FIFOs for multi-bit transfers, and debounce filters for mechanical switches."}
 ],
 checks:[
  {id:"timing-setup",kind:"numeric",prompt:"Tcq=0.3 ns, Tcomb,max=2.1 ns, Tsetup=0.4 ns, and skew=0.2 ns. What minimum clock period (ns) does this simplified setup equation require?",answer:3,tolerance:0.001,hints:["Add clock-to-Q, maximum combinational delay, setup time, and positive capture skew."],explain:"0.3 + 2.1 + 0.4 + 0.2 = 3.0 ns, before clock uncertainty and other implementation margins."},
  {id:"timing-hold",kind:"numeric",prompt:"Tcq=0.2 ns, Tcomb,min=0.1 ns, Thold=0.15 ns, skew=0.05 ns. What is hold slack in ns?",answer:0.1,tolerance:0.001,hints:["Hold slack = Tcq + Tcomb,min − Thold − Tskew."],explain:"0.2 + 0.1 − 0.15 − 0.05 = 0.10 ns; non-negative slack passes this simplified hold check."},
  {id:"timing-critical",kind:"mcq",prompt:"Which path normally determines the maximum safe clock frequency?",options:["The shortest combinational path","The longest register-to-register data path","The path with the fewest gates only","The path with the lowest switching activity"],answer:1,hints:["Setup is a maximum-delay constraint."],explain:"The critical maximum-delay path must deliver data before the next capture edge; gate count alone is not a reliable delay metric."},
  {id:"timing-skew",kind:"mcq",prompt:"In the simplified model used here, a later capture clock (positive skew) generally does what?",options:["Helps setup and makes hold harder","Hurts setup and helps hold","Has no timing effect","Removes metastability"],answer:0,hints:["Positive skew appears plus in the required setup period and minus in hold slack."],explain:"A later capture edge provides more setup time but reduces the hold margin."},
  {id:"timing-hazard",kind:"mcq",prompt:"What is a static-1 hazard?",options:["An output briefly drops to 0 although the ideal function should stay 1","A clock never toggles","A register captures twice by design","An output is always 1"],answer:0,hints:["It is a transient caused by unequal path delays."],explain:"A static-1 hazard is an unintended low pulse during a transition for which the ideal Boolean output remains high."},
  {id:"timing-cdc",kind:"mcq",prompt:"What is the usual first-line technique for a single-bit asynchronous control entering a synchronous domain?",options:["Synchronizer flip-flop chain","Synchronize each bit of a bus independently","Only add a combinational inverter","Assume metastability cannot occur"],answer:0,hints:["Give metastability time to settle before downstream logic uses the signal."],explain:"A two-or-more-stage synchronizer reduces the probability that metastability propagates; multi-bit data usually needs a handshake or asynchronous FIFO."},
 ],
 deeper:[
  {title:"Propagation delay and critical paths",body:"Cell and interconnect delay depend on load, slew, process, voltage and temperature. The critical path is the path with the worst timing slack, not necessarily the path with the most logic gates. Pipelining can shorten logic per stage but adds registers, latency and clocking overhead."},
  {title:"Setup and hold are different constraints",body:"Setup constrains maximum data-path delay relative to a capture edge; hold constrains minimum data-path delay around that edge. Raising the clock period may fix setup but does not automatically fix hold. Physical design may add delay cells to repair hold while preserving functional behavior."},
  {title:"Clock skew and uncertainty",body:"Skew is the difference between launch and capture clock arrival times. Jitter and clock uncertainty reduce usable margin. Real static timing analysis also accounts for launch clock paths, capture clock paths, input/output delays, derates, and corner-specific libraries; the lab equation is intentionally simplified."},
  {title:"Hazards and consensus terms",body:"Unequal gate delays can create short pulses even when the ideal truth table does not. For two-level sum-of-products logic, a consensus term can remove certain static-1 hazards. Whether a glitch matters depends on whether the output is sampled, drives asynchronous control, or propagates into analog or clock-sensitive circuitry."},
  {title:"Metastability, synchronizers and CDC",body:"A flip-flop can temporarily enter a metastable analog condition if its input changes near the sampling aperture. A synchronizer chain gives the first stage time to resolve before later stages sample it, reducing failure probability. It does not guarantee zero risk; placement, clock rate, data toggle rate and available resolution time matter."},
  {title:"Switch bounce and debouncing",body:"Mechanical contacts can toggle many times during one press. A synchronizer addresses asynchronous sampling; a debounce filter requires temporal qualification such as stable input for N samples. These are distinct problems and often both must be handled."},
 ],
 followups:[
  {q:"Why can lowering the clock frequency fail to repair a hold violation?",a:"Hold is a minimum-delay constraint around a capture edge, so a longer clock period usually does not add the required minimum data delay. The path may need delay insertion or a clocking fix."},
  {q:"Does a two-flop synchronizer eliminate metastability?",a:"No. It reduces the probability that metastability propagates by allowing resolution time; the residual probability is small but not zero."},
  {q:"Is every logic glitch a functional failure?",a:"No. It depends on what the signal drives and when it is observed. A glitch on an asynchronous reset or clock can be dangerous even if ordinary synchronous sampling might miss it."}
 ],
 tradeoff:{failure:"Optimizing only Boolean correctness or gate count while ignoring path delay, setup/hold, clock uncertainty, glitches, or clock-domain crossings.",tradeoff:"Pipelining can raise throughput but adds latency and state; extra hazard-cover terms add logic; synchronizer stages improve reliability but add latency."},
 numbers:[{label:"Setup constraint",value:"max delay"},{label:"Hold constraint",value:"min delay"},{label:"Typical single-bit CDC",value:"2+ stages"}],
 model:"I start with a correct Boolean function, identify register boundaries, and constrain both maximum and minimum paths. I calculate setup and hold slack with skew and uncertainty, inspect hazards on sensitive outputs, and design explicit clock-domain-crossing and debounce behavior. I then validate the implementation with static timing analysis and targeted simulation.",
 debug:{q:"The design passes setup at a slower clock but still has a hold violation. Why?",a:"Setup and hold constrain different ends of the delay distribution. Slowing the clock increases the period for setup but does not necessarily increase the minimum data-path delay after the capture edge."},
 rapid:["Critical path sets the setup-limited clock period","Setup checks maximum delay","Hold checks minimum delay","Positive capture skew helps setup but hurts hold in this model","Unequal path delays can create hazards","Synchronizers reduce—not eliminate—metastability risk","Debouncing and synchronization solve different problems"],
 before:[{track:"digital-logic",slug:"finite-state-machines"}],
 derive:"Calculate setup and hold slack for one register-to-register path. Then explain why increasing clock period can repair setup but generally does not repair hold.",
 keyIdea:"Physical digital design is a timing problem as well as a Boolean logic problem.",
 commonMistake:"Treating a logically correct circuit as timing-correct, or assuming a slower clock automatically fixes every hold violation.",
 interviewLadder:[
  {level:"definition",q:"What is a critical path?",a:"A path whose worst timing slack constrains the clock period or interface timing."},
  {level:"mechanism",q:"Why are setup and hold separate?",a:"Setup limits maximum data delay before capture; hold limits minimum data delay after the capture edge."},
  {level:"trade-off",q:"What does positive capture skew do?",a:"It typically helps setup and makes hold harder, under the sign convention in the simplified equations."},
  {level:"systems",q:"How do you cross an asynchronous control into a clock domain?",a:"Use a synchronizer chain for a single-bit level, and a handshake or asynchronous FIFO for multi-bit transfers; separately filter mechanical bounce if needed."}
 ]
};
