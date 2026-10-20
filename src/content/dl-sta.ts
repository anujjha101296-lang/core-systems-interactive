import type { Lesson } from "./types";
export const staLesson:Lesson={
 slug:"static-timing-constraints-closure",track:"digital-logic",title:"Static Timing Constraints & Timing Closure",
 short:"Read setup/hold slack, understand clock and I/O constraints, and avoid hiding real violations with unjustified exceptions.",
 flagship:true,
 question:"How can a timing report say a design meets timing when important paths were never constrained or were incorrectly marked as exceptions?",
 problem:"Static timing analysis evaluates path delays against timing requirements. Its conclusions are only as reliable as the clock definitions, I/O delays, generated clocks, uncertainty and justified path exceptions supplied to the tool. Missing constraints can make a design appear safe while real interfaces or clock domains remain unchecked.",
 idea:"A synchronous register-to-register setup check compares data arrival against the next capture edge; a hold check ensures data does not change too soon after capture. Slack is the difference between required and actual timing. False paths and multicycle paths alter which checks are applied and must reflect real design intent, not serve as a way to silence failures.",
 how:{text:"For a simplified register-to-register path, setup slack is the available capture time minus clock-to-Q, maximum combinational delay, setup time and uncertainty, adjusted for capture skew. Hold slack compares the minimum data delay against the hold requirement and skew. A positive slack indicates margin for that modeled check; a negative slack indicates a violation.",formula:"Setup slack = Tperiod + Tskew − Tuncertainty − (Tcq + Tcomb,max + Tsetup)\nHold slack = Tcq + Tcomb,min − Thold − Tskew − Tuncertainty\nFmax estimate ≈ 1 / required period",example:"If Tcq=0.4 ns, Tcomb,max=3.2 ns, Tsetup=0.5 ns, uncertainty=0.1 ns and capture skew=+0.2 ns, the simplified required period is 4.0 ns. A 5 ns period gives 1.0 ns setup slack. Hold must be checked independently using minimum path delay."},
 lab:"sta",
 trace:[
  {label:"Define clocks first",detail:"Create primary clocks with realistic periods and waveform assumptions; declare generated clocks where clocks are derived."},
  {label:"Constrain interfaces",detail:"Input and output delays describe timing relationships between the design and external devices. Missing I/O constraints leave real paths unverified."},
  {label:"Read setup and hold independently",detail:"Setup is a maximum-delay check; hold is a minimum-delay check. Fixing setup can worsen hold, so inspect both after each change."},
  {label:"Interpret skew and uncertainty",detail:"Clock arrival differences and uncertainty change the required timing window. Use the tool's sign conventions and clock-path report rather than guessing."},
  {label:"Use exceptions only when justified",detail:"A false path should be functionally impossible or intentionally excluded under the design contract; a multicycle path needs a real protocol or capture relationship."},
  {label:"Close across corners",detail:"Recheck timing after synthesis and physical implementation across required process/voltage/temperature corners and operating modes."}
 ],
 checks:[
  {id:"sta-slack",kind:"numeric",prompt:"A path has 5 ns available time and 4 ns data arrival. What is setup slack?",answer:1,tolerance:0.01,unit:"ns",hints:["Slack is required time minus arrival time."],explain:"5−4=+1 ns setup slack."},
  {id:"sta-hold",kind:"mcq",prompt:"Which delay is most directly relevant to a hold check?",options:["Minimum data-path delay","Only maximum combinational delay","Only the clock frequency label","The number of source files"],answer:0,hints:["Hold is a minimum-delay constraint."],explain:"Hold analysis checks whether the earliest new data arrival is late enough after the capture edge."},
  {id:"sta-unconstrained",kind:"mcq",prompt:"What does an unconstrained timing path mean?",options:["The path is automatically safe","The tool lacks sufficient timing requirements to evaluate the path as intended","The path has zero delay","The path is a false path by definition"],answer:1,hints:["A missing requirement is not evidence of success."],explain:"The path may not have a meaningful required time; it must be constrained or intentionally excluded with a justified exception."},
  {id:"sta-clock",kind:"mcq",prompt:"Why declare a generated clock?",options:["So the tool can analyze paths using a clock derived from another clock with the correct relationship","To reduce combinational delay physically","To replace all I/O constraints","To force every setup slack positive"],answer:0,hints:["Derived clocks have a defined timing relationship to their source."],explain:"Generated-clock constraints describe derived clocks so the timing tool can correctly analyze launch/capture relationships."},
  {id:"sta-false",kind:"mcq",prompt:"What is a false-path exception supposed to express?",options:["A path that is functionally not required to meet the ordinary timing check under the design contract","Any path with negative slack","A path that has been optimized successfully","A path that crosses every clock domain"],answer:0,hints:["The exception must be justified by design behavior."],explain:"A false path is a design-intent exception, not a fix for a slow path or missing constraint."},
  {id:"sta-fmax",kind:"numeric",prompt:"A simplified path requires 4 ns per cycle. What is the approximate maximum frequency in MHz?",answer:250,tolerance:0.1,unit:"MHz",hints:["1000 ns per microsecond; F(MHz)=1000/T(ns)."],explain:"1000/4=250 MHz, before omitted margins and implementation details."}
 ],
 deeper:[
  {title:"Constraints are the specification",body:"STA checks whether modeled paths satisfy modeled timing relationships. A missing clock, missing I/O delay, incorrect generated clock or inappropriate exception can leave behavior unverified even if the report has no negative slack."},
  {title:"Setup versus hold",body:"Setup uses maximum data-path delay and the next capture edge; hold uses minimum data-path delay and the current capture edge. Clock skew can help one check while hurting the other. Physical optimization must preserve both."},
  {title:"Primary and generated clocks",body:"Primary clocks describe external or root timing references. Generated clocks describe divided, multiplied, phase-shifted or otherwise derived clocks and their relationship to the source. Incorrect clock definitions can produce incorrect path requirements."},
  {title:"I/O delays",body:"Input delays model when external data can arrive relative to a clock; output delays model when downstream devices require data. Board delays, external setup/hold and interface assumptions belong in the timing budget."},
  {title:"False and multicycle paths",body:"A false path is excluded from a timing check only when the design contract proves that the ordinary synchronous requirement does not apply. A multicycle exception changes the capture relationship and often requires a corresponding hold adjustment. Incorrect exceptions can hide silicon failures."},
  {title:"Timing closure",body:"After synthesis and place-and-route, inspect worst negative slack, total negative slack, violating endpoints, path composition, clock tree and routing. Re-run setup and hold across required PVT corners and modes after changes; a logic-only estimate is not signoff."}
 ],
 followups:[
  {q:"Can a design with zero reported violations still fail timing?",a:"Yes. Missing or incorrect constraints can leave paths unconstrained or exclude paths that should be checked."},
  {q:"Does improving setup always improve hold?",a:"No. Setup and hold use different path-delay extremes; added delay can help hold while hurting setup, and physical fixes must check both."},
  {q:"Should a false path be used to fix negative slack?",a:"No. It should only encode a justified timing exception based on functional design intent, not hide a real failing path."}
 ],
 tradeoff:{failure:"Treating an unconstrained path as passing, ignoring minimum-delay checks, or applying false/multicycle exceptions without a design-level justification.",tradeoff:"More complete constraints improve confidence but require accurate interface and clock knowledge; aggressive timing targets can increase area, power and physical-design effort."},
 numbers:[{label:"Setup",value:"maximum delay"},{label:"Hold",value:"minimum delay"},{label:"Slack",value:"required − arrival"}],
 model:"I define clock relationships and interface timing, inspect maximum- and minimum-delay paths separately, interpret slack using the tool's skew/uncertainty conventions, and apply exceptions only when justified by the design contract. I recheck across implementation stages and required corners.",
 debug:{q:"The report shows no failing setup paths, but hardware fails at the board interface. What might be missing?",a:"Check input/output delay constraints, board and external-device timing assumptions, generated clocks, and whether relevant paths were accidentally left unconstrained or excluded."},
 rapid:["STA checks modeled timing requirements","Setup is a maximum-delay check","Hold is a minimum-delay check","Missing constraints are not passes","Generated clocks describe derived clock relationships","False paths need functional justification","Recheck setup and hold across implementation and PVT corners"],
 before:[{track:"digital-logic",slug:"timing-hazards-reliable-design"},{track:"digital-logic",slug:"rtl-verilog-foundations"}],
 derive:"Given a register-to-register path with Tcq, maximum/minimum combinational delays, setup/hold times, uncertainty, skew and period, compute both slacks. Then identify which constraints are needed before calling the design timing-closed.",
 keyIdea:"Timing closure is a constrained verification process; positive slack only means the analyzed path meets the modeled requirement.",
 commonMistake:"Treating an unconstrained or falsely excluded path as proof that the circuit is safe.",
 interviewLadder:[
  {level:"definition",q:"What does STA determine?",a:"Whether modeled timing paths satisfy their required arrival/capture times under specified constraints."},
  {level:"mechanism",q:"Why check setup and hold separately?",a:"Setup limits late data arrival; hold limits data changing too early after capture."},
  {level:"trade-off",q:"Why can a false path be dangerous?",a:"It removes a check; if the exception is unjustified, a real timing failure may go undetected."},
  {level:"systems",q:"What does timing closure require beyond a logic-level calculation?",a:"Accurate constraints, implementation-aware path reports, setup/hold checks, and validation across required corners and modes."}
 ]
};
