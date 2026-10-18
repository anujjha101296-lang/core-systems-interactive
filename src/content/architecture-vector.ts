import type { Lesson } from "./types";
export const vectorLesson:Lesson={
 slug:"simd-vector-execution",track:"architecture",title:"SIMD, Vector Execution & Tail Handling",
 short:"Estimate vector throughput, lane utilization, startup overhead and the cost of processing a non-multiple tail.",
 flagship:true,
 question:"Why can one instruction process many values at once, and why does a wider vector unit not guarantee a proportional speedup?",
 problem:"Scientific, multimedia and machine-learning workloads often apply the same operation to many independent values. SIMD/vector hardware amortizes instruction overhead across lanes, but dependencies, startup costs, memory bandwidth, data alignment and leftover elements limit real speedup.",
 idea:"A vector instruction operates on multiple elements, while SIMD lanes perform corresponding element operations in parallel. Vector length and lane width determine how many chunks are required. A final partial chunk needs masking, scalar cleanup, or another defined tail strategy. Startup and throughput are separate costs.",
 how:{text:"For N elements and L lanes, a simplified fixed-width vector model needs ceil(N/L) chunks. If each scalar element costs S cycles, scalar cost is N×S. If vector startup costs V and each chunk costs C cycles, vector cost is V+ceil(N/L)×C for non-empty work. This ignores memory stalls and dependency constraints.",formula:"chunks = ceil(N / L)\nscalar cycles = N × S\nvector cycles = 0 if N=0, else V + chunks × C\nlane utilization = N / (chunks × L)",example:"For 37 elements and 8 lanes, five chunks are needed; the last has 5 active lanes and 3 masked/unused lanes. If vector startup is large, short vectors may not beat scalar execution even though the hardware has multiple lanes."},
 lab:"archvector",
 trace:[
  {label:"Find independent work",detail:"Vectorization is easiest when each element can be computed independently without loop-carried dependencies."},
  {label:"Choose lane width and element type",detail:"A fixed register width fits fewer wide elements or more narrow elements; instruction-set support and data types constrain the lane count."},
  {label:"Pay startup and chunk costs",detail:"Vector setup and pipeline latency can dominate short loops; steady-state throughput matters for long loops."},
  {label:"Handle the tail",detail:"If the element count is not divisible by the lane count, use a mask, scalar cleanup loop, or another ISA-defined tail strategy."},
  {label:"Check system bottlenecks",detail:"Memory bandwidth, cache misses, dependencies, gathers, frequency changes and compiler decisions can limit speedup."}
 ],
 checks:[
  {id:"vec-chunks",kind:"numeric",prompt:"How many 8-lane chunks are needed for 37 elements?",answer:5,tolerance:0,hints:["Use the ceiling of elements divided by lanes."],explain:"ceil(37/8)=5 chunks."},
  {id:"vec-tail",kind:"numeric",prompt:"With 37 elements and 8 lanes, how many lanes are active in the final chunk?",answer:5,tolerance:0,hints:["Four full chunks process 32 elements."],explain:"37−32=5 elements remain for the final chunk."},
  {id:"vec-util",kind:"numeric",prompt:"For 37 elements processed in five 8-lane chunks, what is lane utilization in percent?",answer:92.5,tolerance:0.01,unit:"%",hints:["37 active slots out of 40 total slots."],explain:"37/(5×8)×100=92.5%."},
  {id:"vec-dependency",kind:"mcq",prompt:"Which loop is generally easiest to vectorize?",options:["Independent element-wise additions","A recurrence where each iteration depends on the previous result","A loop with unpredictable side effects on every iteration","A loop with unknown aliasing and strict sequential ordering"],answer:0,hints:["SIMD lanes benefit from independent operations."],explain:"Independent element-wise work can be distributed across lanes without a loop-carried dependency."},
  {id:"vec-startup",kind:"mcq",prompt:"Why might vector code lose on a very short input?",options:["Startup/setup overhead can exceed the saved per-element work","Vector lanes always run slower","The vector unit changes all values to floating point","SIMD requires one interrupt per element"],answer:0,hints:["Fixed overhead matters more when there is little work."],explain:"For short vectors, startup and setup costs can dominate the throughput benefit."},
  {id:"vec-memory",kind:"mcq",prompt:"What can limit SIMD speedup even when arithmetic has enough independent lanes?",options:["Memory bandwidth and cache misses","Only the number of variable names","The presence of a loop counter","The use of hexadecimal constants"],answer:0,hints:["The execution units may wait for data."],explain:"A vectorized loop can become memory-bound or stall on cache misses, limiting arithmetic speedup."}
 ],
 deeper:[
  {title:"SIMD versus vector architectures",body:"SIMD commonly applies one instruction to multiple packed elements in a fixed-width vector register. Vector architectures can expose vector length and mask semantics more explicitly. Exact behavior varies by ISA; the lane model here is a portable teaching abstraction, not a description of one processor."},
  {title:"Tail strategies and masks",body:"A vector length not divisible by lane width leaves a tail. Masked execution prevents inactive lanes from updating architectural results; scalar cleanup executes remaining elements separately. Masking avoids branches in some cases but may still consume issue resources depending on the implementation."},
  {title:"Latency versus throughput",body:"Latency is the time for an operation's result to become available; throughput is how frequently new operations can begin or complete. A pipelined vector unit can have multi-cycle latency while sustaining one vector instruction per cycle after startup."},
  {title:"Memory bandwidth and alignment",body:"Vector loads can move many bytes per instruction, but performance depends on cache-line crossings, alignment, memory-level parallelism, gather/scatter support and available bandwidth. More arithmetic lanes cannot overcome a saturated memory subsystem."},
  {title:"Dependencies and compiler vectorization",body:"Loop-carried dependencies, aliasing uncertainty, branches and side effects can block automatic vectorization. Compiler reports and generated assembly help verify whether a loop actually uses vector instructions and whether tail code or scalar fallbacks remain."},
  {title:"Frequency and energy trade-offs",body:"Wide vector execution can increase power and sometimes reduce operating frequency under sustained heavy workloads. Performance should be measured on representative data and include end-to-end effects rather than inferred from lane count alone."}
 ],
 followups:[
  {q:"Does doubling lane count always halve execution time?",a:"No. Startup, tail waste, dependencies, memory bandwidth, instruction throughput and frequency effects can limit scaling."},
  {q:"What is the purpose of a vector mask?",a:"It marks which lanes are active so a partial tail can be processed without updating results for out-of-range elements."},
  {q:"How can you verify that a compiler vectorized a loop?",a:"Inspect vectorization reports and generated assembly, then benchmark representative workloads while accounting for memory and startup costs."}
 ],
 tradeoff:{failure:"Equating lane count with guaranteed speedup or ignoring tails, startup, memory stalls and loop-carried dependencies.",tradeoff:"Wider vectors increase work per instruction but may waste lanes on short/tail workloads, raise power, stress bandwidth and expose ISA/compiler constraints."},
 numbers:[{label:"Chunks",value:"ceil(N/L)"},{label:"Tail",value:"N mod L"},{label:"Utilization",value:"N / (chunks×L)"}],
 model:"I identify independent element operations, estimate chunks from vector width, account for startup and per-chunk throughput, and calculate tail utilization. I then inspect dependencies, memory behavior, compiler output and measured performance before claiming a speedup.",
 debug:{q:"A loop is vectorized but shows little speedup. What should you inspect?",a:"Check whether the loop is memory-bound, whether cache misses or gathers dominate, whether vector startup is large relative to the workload, how much tail work is masked, and whether the compiler generated the expected instructions."},
 rapid:["SIMD applies one operation across multiple elements","chunks = ceil(N/lanes)","Tail lanes need masking or scalar cleanup","Startup cost can dominate short vectors","Latency and throughput are different","Memory bandwidth can limit arithmetic speedup","Check compiler output and benchmark real workloads"],
 before:[{track:"architecture",slug:"cpu-performance-cpi-amdahl"},{track:"architecture",slug:"dram-memory-system-timing"}],
 derive:"For 37 independent additions with 8 lanes, calculate chunk count, tail utilization and modeled scalar/vector cycles. Then explain why a memory-bound loop might not achieve the predicted speedup.",
 keyIdea:"Vectorization amortizes instruction overhead across independent elements, but actual speedup is constrained by startup, tails, dependencies and the memory system.",
 commonMistake:"Assuming a vector unit with L lanes automatically yields an L× speedup on every loop.",
 interviewLadder:[
  {level:"definition",q:"What is SIMD?",a:"Single instruction, multiple data: one instruction applies an operation to multiple packed elements."},
  {level:"mechanism",q:"How many chunks process N elements with L lanes?",a:"ceil(N/L); the final chunk may have inactive tail lanes."},
  {level:"trade-off",q:"Why might wider vectors not improve a short loop?",a:"Startup overhead, tail waste, dependencies and memory costs can exceed the saved arithmetic work."},
  {level:"systems",q:"How do you evaluate vectorization in practice?",a:"Inspect compiler reports/assembly and benchmark representative inputs, measuring memory behavior, tail costs and end-to-end throughput."}
 ]
};
