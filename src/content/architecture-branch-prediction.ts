import type { Lesson } from "./types";
export const branchPredictionLesson:Lesson={
 slug:"branch-prediction-control-hazards",track:"architecture",title:"Branch Prediction & Control Hazards",
 short:"Compare static and dynamic predictors, trace saturating counters, and quantify the performance cost of mispredictions.",
 flagship:true,
 question:"Why can a single wrong guess about a branch slow down many instructions in a deeply pipelined CPU?",
 problem:"A branch changes which instruction should execute next. Until its outcome and target are known, the front end may stall or fetch along a predicted path. If the prediction is wrong, speculative work from the wrong path must be discarded, wasting cycles and energy.",
 idea:"Branch prediction guesses the direction of a branch before its outcome is known. Static predictors use a fixed rule; dynamic predictors learn from history. A one-bit predictor tracks the last outcome but can flip on loop exits, while a two-bit saturating counter requires stronger contrary evidence before changing its prediction.",
 how:{text:"A simple static predictor always predicts taken or not taken. A one-bit predictor updates its prediction to the latest actual outcome. A two-bit predictor has four states, from strongly not-taken through weakly not-taken and weakly taken to strongly taken; taken increments the counter and not-taken decrements it, saturating at the ends. A misprediction can flush younger instructions and redirect fetch to the correct path.",formula:"Prediction accuracy = correct predictions / total branches × 100%\nMisprediction cycles = mispredictions × penalty per misprediction\nApprox. CPI contribution = branch frequency × misprediction rate × penalty",example:"A loop branch may be taken repeatedly and then not-taken once at loop exit. A one-bit predictor can mispredict the exit and the next loop entry; a two-bit counter often needs two consecutive contrary outcomes to switch from a strongly held direction, reducing this pattern's sensitivity."},
 lab:"archbranch",
 trace:[
  {label:"Encounter a control dependency",detail:"The next program counter depends on a branch condition and possibly a target address."},
  {label:"Predict before resolution",detail:"The front end predicts taken/not-taken so fetch can continue without waiting for the branch to finish."},
  {label:"Update predictor state",detail:"When the real outcome arrives, the predictor updates its state based on taken/not-taken history."},
  {label:"Recover from a miss",detail:"Discard wrong-path speculative instructions and redirect fetch; the exact cycle cost depends on where the branch resolves."},
  {label:"Evaluate the trade-off",detail:"Better prediction can reduce stalls and flushes, but predictor tables, lookup latency, aliasing and recovery logic consume area and energy."}
 ],
 checks:[
  {id:"branch-control",kind:"mcq",prompt:"Why is a conditional branch a control hazard?",options:["The next PC depends on a condition that may not be known yet","Two instructions always write the same register","The ALU cannot add","Memory addresses are always aligned"],answer:0,hints:["The front end must decide which instruction to fetch next."],explain:"A branch changes control flow, so uncertainty about its outcome makes the next fetch address uncertain."},
  {id:"branch-static",kind:"mcq",prompt:"What distinguishes a dynamic branch predictor from a static predictor?",options:["A dynamic predictor updates state based on observed branch outcomes","A dynamic predictor never makes mistakes","A static predictor requires a history table","A static predictor always costs more cycles"],answer:0,hints:["Dynamic prediction learns from execution history."],explain:"Dynamic predictors maintain state and update it as branches resolve; static predictors use fixed rules or hints."},
  {id:"branch-counter",kind:"numeric",prompt:"A two-bit predictor counter is in state 2 (weakly taken). The branch is not taken. What is the next state?",answer:1,tolerance:0,hints:["Not-taken decrements the saturating counter by one."],explain:"State 2 decrements to state 1, weakly not-taken."},
  {id:"branch-accuracy",kind:"numeric",prompt:"A predictor gets 90 of 100 branches correct. What is its prediction accuracy in percent?",answer:90,tolerance:0.01,unit:"%",hints:["Correct divided by total, multiplied by 100."],explain:"90/100×100%=90%."},
  {id:"branch-penalty",kind:"numeric",prompt:"There are 20 mispredictions and each costs 3 cycles. How many penalty cycles are modeled?",answer:60,tolerance:0,hints:["Multiply misses by penalty per miss."],explain:"20×3=60 penalty cycles under this simplified additive model."},
  {id:"branch-loop",kind:"mcq",prompt:"Why can a one-bit predictor mispredict a loop branch at both loop exit and the next loop entry?",options:["The exit changes its remembered direction, so the first taken outcome next time can also be wrong","It predicts two outcomes at once","It has no state","Loop branches cannot be predicted"],answer:0,hints:["A one-bit predictor remembers only the last result."],explain:"A not-taken exit changes the remembered state; the next loop's taken branch can then be mispredicted."}
 ],
 deeper:[
  {title:"Static prediction",body:"Static strategies include always-not-taken, always-taken, compiler hints, and simple direction heuristics. They are cheap and can work well for predictable branch classes, but they do not adapt to a branch's runtime behavior."},
  {title:"One-bit and two-bit predictors",body:"A one-bit predictor remembers the last outcome. A two-bit saturating counter has four states and requires two consecutive contrary outcomes to cross from strong prediction through weak prediction to the opposite direction. This often reduces loop-exit penalties, though exact behavior depends on initialization and pattern."},
  {title:"History and aliasing",body:"More advanced predictors use local history, global history, pattern tables, or combinations. Different branches may share predictor entries (aliasing), and prediction quality depends on workload patterns, table size, history length, and indexing."},
  {title:"Misprediction recovery",body:"A wrong prediction can require flushing younger instructions and restoring a correct fetch address. The penalty depends on pipeline depth, branch-resolution stage, front-end width, and whether target prediction was also correct. The simple lab treats penalty as a fixed additive number."},
  {title:"Performance equation",body:"A rough CPI contribution is branch frequency multiplied by misprediction rate and penalty. Reducing miss rate can have large benefits for branch-heavy code, but prediction accuracy alone is not enough: branch frequency, penalty, power, and predictor access latency also matter."},
  {title:"Speculation and security",body:"Speculative execution improves throughput by doing work before it is known to be architecturally needed. Microarchitectural side channels can expose effects of wrong-path work; secure designs and software mitigations must consider prediction and speculation behavior beyond architectural correctness."}
 ],
 followups:[
  {q:"Why use a two-bit counter instead of a one-bit predictor?",a:"The extra hysteresis avoids flipping direction after a single contrary outcome, which helps patterns such as loop exits."},
  {q:"Does 95% branch accuracy mean only 5% performance loss?",a:"No. The impact also depends on branch frequency, penalty per miss, overlap with other stalls, and the processor's recovery behavior."},
  {q:"What is a control hazard?",a:"A situation where the next instruction depends on an unresolved branch or jump decision."}
 ],
 tradeoff:{failure:"Assuming a high accuracy number guarantees high performance, ignoring branch frequency and penalty, or treating a fixed-penalty teaching model as cycle-accurate hardware.",tradeoff:"More sophisticated predictors can improve accuracy but consume storage, lookup energy, design complexity and potentially front-end timing; simpler predictors are cheaper but may miss workload patterns."},
 numbers:[{label:"One-bit state",value:"last outcome"},{label:"Two-bit states",value:"4 saturating states"},{label:"Penalty model",value:"misses × cycles"}],
 model:"I trace each branch outcome against the predictor's state, count misses, and estimate their additive cycle cost. I interpret accuracy alongside branch frequency, penalty and the workload; I treat predictor tables and recovery as implementation-specific rather than assuming one universal penalty.",
 debug:{q:"A branch predictor has high accuracy but the program remains slow. What should you inspect?",a:"Measure branch frequency and misprediction penalty, and inspect whether execution is limited by memory stalls, dependencies, instruction throughput, or other bottlenecks."},
 rapid:["Branches create next-PC uncertainty","Static predictors use fixed rules","One-bit predictors remember the latest outcome","Two-bit counters add hysteresis","Misprediction cost depends on recovery depth","Accuracy must be combined with branch frequency and penalty","Speculation improves throughput but has security implications"],
 before:[{track:"architecture",slug:"pipeline-hazards-forwarding"},{track:"architecture",slug:"cpu-performance-cpi-amdahl"}],
 derive:"Compare one-bit and two-bit predictors on the trace T T T T T N repeated twice. Count mispredictions and explain the role of predictor initialization and loop-exit behavior.",
 keyIdea:"Branch prediction is a stateful guess about future control flow; its value depends on workload patterns and the cost of recovering from wrong-path execution.",
 commonMistake:"Equating prediction accuracy with speedup without accounting for branch frequency, penalty, and other bottlenecks.",
 interviewLadder:[
  {level:"definition",q:"What is branch prediction?",a:"Guessing a branch's direction and often target before the outcome is resolved so instruction fetch can continue."},
  {level:"mechanism",q:"How does a two-bit predictor update?",a:"A taken outcome increments and a not-taken outcome decrements a saturating two-bit counter."},
  {level:"trade-off",q:"Why can a deeper pipeline increase branch penalty?",a:"More younger work may be in flight before the branch resolves, so recovery can discard more cycles of work."},
  {level:"systems",q:"How does branch prediction relate to speculative-execution security?",a:"Wrong-path speculative activity can leave microarchitectural side effects, so architectural correctness alone does not guarantee absence of side channels."}
 ]
};
