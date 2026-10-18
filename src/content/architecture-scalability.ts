import type { Lesson } from "./types";
export const scalabilityLesson:Lesson={
 slug:"multicore-scalability-contention",track:"architecture",title:"Multicore Scalability, Synchronization & False Sharing",
 short:"Combine Amdahl's law with synchronization and cache-line contention to understand why adding cores can stop helping.",
 flagship:true,
 question:"Why can a program run slower after adding more cores even when most of its work appears parallel?",
 problem:"Parallel execution reduces the time spent on independent work, but serial sections remain. Threads also coordinate through locks, barriers and shared data; coherence traffic and false sharing can serialize progress or waste bandwidth. Core count alone is not a performance model.",
 idea:"Amdahl's law bounds speedup using the parallel fraction. Real execution adds synchronization, scheduling, memory-bandwidth and coherence costs. False sharing occurs when threads update different variables that occupy the same cache line, causing unnecessary ownership transfers even though the variables are logically independent.",
 how:{text:"The lab models serial work, parallel work divided across cores, synchronization overhead per extra core, and an optional false-sharing penalty. This is deliberately a cost model rather than a hardware simulator; it helps separate the ideal Amdahl limit from additional scaling costs.",formula:"Ideal speedup = 1 / ((1−p) + p/N)\nTparallel = W(1−p) + Wp/N + syncCost(N−1) + contentionCost(N−1)\nEfficiency = speedup / N",example:"With 90% parallel work and 8 cores, ideal speedup is 1/(0.1+0.9/8)≈4.71×, not 8×. Synchronization and false sharing can reduce it further; if the added costs grow faster than the saved parallel work, more cores can make the run slower."},
 lab:"archscale",
 trace:[
  {label:"Measure the serial fraction",detail:"The serial portion sets a floor that more cores cannot divide away; use Amdahl's law to estimate the ideal ceiling."},
  {label:"Divide independent work",detail:"The parallel portion can be distributed across cores, but load imbalance and dependencies reduce effective parallelism."},
  {label:"Account for synchronization",detail:"Locks, barriers, atomics and task scheduling add coordination costs and can serialize progress."},
  {label:"Inspect shared cache lines",detail:"False sharing occurs when independent variables share a coherence line and writes cause ownership ping-pong between cores."},
  {label:"Measure bandwidth and locality",detail:"NUMA placement, cache misses, coherence traffic and memory bandwidth can become the bottleneck as core count grows."}
 ],
 checks:[
  {id:"scale-amdahl",kind:"numeric",prompt:"For 90% parallel work on 8 cores with no overhead, what is ideal speedup to two decimal places?",answer:4.71,tolerance:0.01,hints:["1 / (0.1 + 0.9/8)."],explain:"1/(0.1+0.1125)=4.7059, approximately 4.71×."},
  {id:"scale-efficiency",kind:"numeric",prompt:"If a 4-core program achieves 2× speedup, what is parallel efficiency in percent?",answer:50,tolerance:0.01,unit:"%",hints:["Speedup divided by core count."],explain:"Efficiency=2/4=50%."},
  {id:"scale-false-sharing",kind:"mcq",prompt:"What is false sharing?",options:["Different variables on the same cache line are written by different cores, causing avoidable coherence traffic","Two threads access the same logical variable under a lock","A cache miss caused only by a cold start","A branch prediction failure"],answer:0,hints:["The variables may be distinct, but the coherence unit is the cache line."],explain:"Coherence tracks cache lines, so writes to different words in the same line can cause ownership transfers even without a logical data race."},
  {id:"scale-more-cores",kind:"mcq",prompt:"When can adding cores increase execution time?",options:["When synchronization, contention or bandwidth costs exceed the saved parallel work","Whenever parallel fraction is above zero","Only when the clock is stopped","Never, because cores execute independently"],answer:0,hints:["More parallel resources also add coordination and resource contention."],explain:"If overhead grows faster than the parallel work saved, total runtime can rise."},
  {id:"scale-serial",kind:"mcq",prompt:"What happens to the serial portion as core count approaches infinity in Amdahl's model?",options:["It remains and limits the maximum speedup","It becomes zero automatically","It is duplicated on every core and disappears","It converts into cache hits"],answer:0,hints:["More cores divide only the parallel portion."],explain:"The serial fraction remains, so ideal maximum speedup is bounded by 1/(1−p)."},
  {id:"scale-remedy",kind:"scenario",prompt:"Threads update separate counters but counters share one cache line. Which change may reduce false sharing?",options:["Place frequently written counters on separate cache lines when justified","Increase the number of writes per cycle","Remove synchronization without analysis","Make all counters volatile"],answer:0,hints:["The problem is sharing the coherence unit, not the logical variable."],explain:"Separating frequently written data can prevent avoidable cache-line ownership transfers, though padding increases memory use and should be measured."}
 ],
 deeper:[
  {title:"Amdahl's law",body:"Amdahl's law gives ideal speedup as 1/((1−p)+p/N), where p is the parallel fraction and N is core count. The serial fraction imposes a ceiling even with infinitely many cores; the model excludes extra parallelization overhead."},
  {title:"Synchronization and load imbalance",body:"Locks, barriers, atomics, work queues and scheduler overhead can grow with thread count. Load imbalance leaves some cores idle while others finish long tasks. Fine-grained tasks may expose parallelism but spend too much time coordinating."},
  {title:"False sharing",body:"Coherence protocols typically operate at cache-line granularity. If two cores repeatedly write separate variables in the same line, the line can move between caches, wasting bandwidth and adding latency. Padding or changing data layout may help, but costs memory and must be benchmarked."},
  {title:"Memory bandwidth and NUMA",body:"As more cores issue loads/stores, memory bandwidth may saturate. NUMA systems have different local and remote access costs; thread placement and first-touch allocation affect locality. Scaling arithmetic alone cannot fix a saturated memory subsystem."},
  {title:"Coherence versus data races",body:"False sharing does not necessarily mean two threads access the same variable or have a data race; the variables may be independent but share a physical cache line. A true data race is a correctness problem, while false sharing is primarily a performance problem."},
  {title:"Measurement methodology",body:"Measure wall-clock time on representative inputs, warm-up and repeat runs, and inspect CPU utilization, cache misses, coherence events, bandwidth and scheduling. Compare speedup and efficiency, and avoid inferring real performance from a simplified cost model alone."}
 ],
 followups:[
  {q:"Is false sharing a data race?",a:"Not necessarily. Threads may write distinct variables correctly, but if they share a cache line, coherence ownership transfers can hurt performance."},
  {q:"Does Amdahl's law include synchronization overhead?",a:"The basic formula does not; the lab adds explicit overhead terms to illustrate how real performance can be worse."},
  {q:"Can padding always fix false sharing?",a:"Padding can separate frequently written variables but increases memory footprint and may not address other bottlenecks; benchmark the result."}
 ],
 tradeoff:{failure:"Assuming speedup scales linearly with core count or treating false sharing as a logical data race.",tradeoff:"More cores increase parallel capacity but can add synchronization, scheduling, coherence and bandwidth costs. Padding reduces contention at the cost of memory footprint and possible cache pressure."},
 numbers:[{label:"Ideal speedup",value:"1 / ((1−p)+p/N)"},{label:"Efficiency",value:"speedup / cores"},{label:"False sharing",value:"coherence-line contention"}],
 model:"I estimate the Amdahl limit, then account for synchronization and contention costs. I inspect cache-line layout, memory bandwidth, NUMA placement and load balance, and benchmark both speedup and efficiency rather than assuming more cores guarantee lower runtime.",
 debug:{q:"CPU utilization rises with core count but speedup falls sharply. What should you inspect?",a:"Check serial work, lock/barrier contention, false sharing, memory bandwidth saturation, load imbalance, NUMA placement and scheduler overhead. High utilization does not imply useful parallel progress."},
 rapid:["Amdahl's law bounds ideal speedup","Serial work remains as cores increase","Efficiency = speedup / core count","False sharing involves distinct variables in one cache line","Synchronization can serialize progress","Memory bandwidth and NUMA locality limit scaling","Measure runtime and contention on real workloads"],
 before:[{track:"architecture",slug:"memory-consistency-ordering"},{track:"architecture",slug:"multicore-cache-coherence-msi"}],
 derive:"Estimate ideal speedup for a 90%-parallel workload on 8 cores, then add synchronization and false-sharing costs. Explain how false sharing differs from a data race and propose a measurable mitigation.",
 keyIdea:"Multicore speedup depends on serial work and the costs of coordinating shared resources, not just the number of available cores.",
 commonMistake:"Assuming more cores always improve performance or confusing false sharing with a correctness data race.",
 interviewLadder:[
  {level:"definition",q:"What does Amdahl's law bound?",a:"The ideal speedup available from a fixed parallel fraction and core count."},
  {level:"mechanism",q:"Why does false sharing hurt?",a:"Writes to different words in the same coherence line can trigger ownership transfers between cores."},
  {level:"trade-off",q:"What is the cost of padding to avoid false sharing?",a:"It increases memory footprint and can worsen cache capacity/locality, so it should be measured."},
  {level:"systems",q:"How do you diagnose poor multicore scaling?",a:"Measure serial fraction, synchronization, cache/coherence traffic, bandwidth, NUMA placement, load balance and scheduling overhead."}
 ]
};
