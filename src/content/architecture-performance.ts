import type { Lesson } from "./types";
export const performanceLesson: Lesson = {
 slug:"cpu-performance-cpi-amdahl",track:"architecture",title:"CPU Performance: CPI, Clock Rate & Amdahl's Law",
 short:"Compare complete execution time instead of treating clock frequency as a performance score.",
 flagship:true,
 question:"If one CPU has a higher clock rate, how can another CPU still finish the same program sooner?",
 problem:"Clock rate tells us how many cycles occur per second, not how much useful work completes per cycle. Instruction count, average cycles per instruction, memory behavior, compiler choices, and the workload all affect elapsed time.",
 idea:"For a defined workload, CPU time = instruction count × average CPI × clock-cycle time = instruction count × CPI ÷ clock rate. For optimization, measure the part improved and the part left unchanged; Amdahl's law limits overall speedup when a serial fraction remains.",
 how:{
  text:"Separate performance claims by workload and metric. Latency is time to finish one task; throughput is completed work per unit time. A design can improve throughput without reducing every task's latency. CPI is an average over instruction classes and stalls, so it depends on the instruction mix and the microarchitecture.",
  formula:"CPU time = IC × CPI × cycle time = IC × CPI / clock rate\nSpeedup = old execution time / new execution time\nAmdahl: S = 1 / ((1 − P) + P / s)",
  example:"A program executes 1 billion instructions at CPI 1.5 on a 2 GHz CPU: time = 1e9 × 1.5 / 2e9 = 0.75 s. A 3 GHz CPU is not automatically faster if its CPI or instruction count increases enough.",
 },
 lab:"archperf",
 trace:[
  {label:"Define the workload",detail:"Use the same program, input, correctness requirements and measurement boundary for both candidates."},
  {label:"Count executed instructions",detail:"Instruction count depends on the program, compiler, ISA and input—not just the CPU clock."},
  {label:"Account for CPI and clock",detail:"CPI captures cycles per instruction including the effects represented by the measurement model; cycle time is the inverse of clock rate."},
  {label:"Compare elapsed time",detail:"Compute IC × CPI / frequency, then take old time divided by new time for speedup."},
  {label:"Check the optimized fraction",detail:"Amdahl's law shows how the unoptimized portion caps total speedup, even if one part becomes extremely fast."},
 ],
 checks:[
  {id:"perf-formula",kind:"mcq",prompt:"Which expression estimates CPU execution time for a specified instruction count and average CPI?",options:["IC × CPI ÷ clock rate","IC ÷ CPI × clock rate","Clock rate × CPI","Cache capacity ÷ IC"],answer:0,hints:["Cycle count multiplied by seconds per cycle gives seconds."],explain:"CPU time = IC × CPI × cycle time = IC × CPI / clock rate."},
  {id:"perf-clock",kind:"mcq",prompt:"CPU A runs at 4 GHz and CPU B at 3 GHz. What can we conclude about runtime from clock rate alone?",options:["A is always faster","B is always faster","Nothing definitive without instruction count and CPI/workload behavior","They have equal runtime"],answer:2,hints:["Frequency is only one term in the execution-time equation."],explain:"Instruction count and CPI can differ; compare complete execution time on the same workload."},
  {id:"perf-calc",kind:"numeric",prompt:"A workload executes 600 million instructions at CPI 2 on a 3 GHz CPU. What is CPU time in seconds?",answer:0.4,tolerance:0.0001,hints:["600e6 × 2 ÷ 3e9."],explain:"1.2 billion cycles divided by 3 billion cycles/second equals 0.4 seconds."},
  {id:"perf-speedup",kind:"numeric",prompt:"Runtime drops from 12 seconds to 4 seconds. What is the speedup?",answer:3,tolerance:0,hints:["Old time divided by new time."],explain:"Speedup = 12 / 4 = 3×."},
  {id:"perf-amdahl",kind:"numeric",prompt:"A fraction P=0.8 of a program is accelerated by 4×. What is the overall speedup under Amdahl's law?",answer:2.5,tolerance:0.0001,hints:["1 / (0.2 + 0.8/4)."],explain:"Overall speedup = 1 / (0.2 + 0.2) = 2.5×."},
  {id:"perf-throughput",kind:"mcq",prompt:"Which statement best distinguishes latency from throughput?",options:["They are always identical","Latency is time for one task; throughput is completed work per unit time","Throughput measures only clock frequency","Latency is measured only in instructions"],answer:1,hints:["One is a per-task delay; the other is a rate."],explain:"Pipelining can increase throughput by overlapping tasks without reducing the latency of every individual task."},
 ],
 deeper:[
  {title:"Instruction count and instruction mix",body:"Instruction count is not fixed by clock frequency. Compiler optimization, algorithm choice, ISA expressiveness and input can change the number and type of instructions. An average CPI hides the fact that different instruction classes and stalls can have different costs."},
  {title:"CPI is workload- and machine-dependent",body:"A lower CPI is not automatically better if instruction count rises. Cache misses, branch mispredictions, dependencies and memory latency can increase cycles. Always combine the terms or measure end-to-end runtime."},
  {title:"Latency versus throughput",body:"Latency measures how long a particular operation takes from start to completion. Throughput measures how many operations complete per unit time. Pipelining primarily overlaps operations and can improve steady-state throughput while adding pipeline overhead or leaving single-operation latency unchanged."},
  {title:"Amdahl's law",body:"If fraction P of execution is accelerated by factor s while the rest is unchanged, total speedup is 1 / ((1 − P) + P/s). Even infinite speedup of the optimized portion cannot exceed 1/(1 − P). Optimize the dominant measured bottleneck, then measure again because bottlenecks shift."},
  {title:"Fair benchmarking",body:"Use the same workload, input, correctness checks, warm-up policy and measurement method. Report runtime distributions where noise matters. Avoid comparing peak theoretical throughput on one system with measured end-to-end latency on another, and include power or energy when those are part of the objective."},
 ],
 followups:[
  {q:"Can a higher clock rate reduce runtime?",a:"Yes, if other factors do not offset it; runtime also depends on instruction count and CPI."},
  {q:"Why does optimizing 90% of a program by 10× not yield 10× overall?",a:"The unchanged 10% remains a hard limit. Amdahl's law gives 1/(0.1 + 0.9/10) ≈ 5.26×."},
  {q:"Can throughput improve while latency stays similar?",a:"Yes. Pipelining or parallel execution can complete more tasks per unit time while the latency of an individual task remains similar or even increases."}
 ],
 tradeoff:{failure:"Choosing a processor by GHz or peak FLOPS alone, ignoring instruction count, CPI, workload, memory stalls, or measurement boundaries.",tradeoff:"Higher frequency may require more power or deeper pipelines; parallelism can improve throughput but introduces coordination, contention, and serial-fraction limits."},
 numbers:[{label:"Runtime model",value:"IC × CPI / f"},{label:"Speedup",value:"Old / New time"},{label:"Amdahl limit",value:"1 / (1 − P)"}],
 model:"I define the workload and measurement metric, then compare instruction count, average CPI and clock rate to estimate CPU time. I calculate speedup from measured runtimes, identify the fraction affected by an optimization, and use Amdahl's law to estimate the maximum whole-program benefit before validating with end-to-end measurements.",
 debug:{q:"A new CPU has a 25% higher clock rate but the measured program runs slower. What should you inspect?",a:"Instruction count and CPI, including cache misses, branch behavior and other stalls, then compare measured runtime under the same workload."},
 rapid:["CPU time = IC × CPI / clock rate","Clock rate alone is not a performance result","Speedup = old runtime / new runtime","Latency and throughput are different metrics","Amdahl's law bounds whole-program speedup","Benchmark the same workload and input"],
 before:[{track:"architecture",slug:"single-cycle-datapath-control"}],
 derive:"Choose two candidate instruction counts, CPIs and clock rates; compute runtime for each, then vary the accelerated fraction and speedup to observe Amdahl's law.",
 keyIdea:"Performance is a property of a workload on a system—not a single hardware specification.",
 commonMistake:"Claiming that higher GHz or lower CPI alone proves a system is faster.",
 interviewLadder:[
  {level:"definition",q:"What is CPU execution time?",a:"Instruction count multiplied by average CPI and cycle time."},
  {level:"mechanism",q:"Why might a faster clock not improve runtime?",a:"Instruction count or CPI may increase enough to offset the frequency gain."},
  {level:"trade-off",q:"What does Amdahl's law tell us?",a:"The unoptimized fraction limits total speedup, even if the optimized fraction becomes arbitrarily fast."},
  {level:"systems",q:"How do you make a fair performance comparison?",a:"Use the same workload and correctness criteria, a consistent measurement boundary, and report relevant latency/throughput and power metrics."}
 ]
};
