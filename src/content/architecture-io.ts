import type { Lesson } from "./types";
export const ioLesson:Lesson={
 slug:"io-interrupts-dma",track:"architecture",title:"I/O, Interrupts & Direct Memory Access",
 short:"Choose between polling, interrupt-driven I/O, and DMA based on event rate, payload size, latency, and CPU overhead.",
 flagship:true,
 question:"How can a CPU move data from a device without wasting cycles constantly checking it or copying every byte itself?",
 problem:"Devices operate asynchronously relative to software. Polling can be simple but consumes CPU while waiting; interrupts let a device signal an event but add per-event overhead; DMA moves blocks between a device and memory with limited CPU involvement but requires setup, ownership, and completion handling.",
 idea:"Polling, interrupts, and DMA are complementary techniques. The best choice depends on event frequency, payload size, latency target, batching, device behavior, and CPU cost—not on one method being universally superior.",
 how:{text:"Polling checks device status on a schedule; average detection delay is roughly half the polling interval for uniformly arriving events. Interrupt-driven I/O pays dispatch/handler overhead per interrupt, often reduced by coalescing. DMA amortizes setup and completion costs across a batch and transfers payload without CPU copying each byte.",formula:"Polling CPU cost ≈ workload duration × polling CPU fraction\nInterrupt CPU cost ≈ events × handler cost + CPU copy cost\nDMA CPU cost ≈ batches × (setup + completion cost)",example:"For a tiny event, one interrupt may be cheaper than setting up DMA. For a large packet or storage block, DMA can amortize setup and reduce CPU copying. Polling can be attractive for very low-latency busy loops when dedicating a CPU core is acceptable."},
 lab:"archio",
 trace:[
  {label:"Polling",detail:"The CPU repeatedly checks a status register. This can offer predictable detection latency but burns cycles while no event is ready."},
  {label:"Interrupt-driven I/O",detail:"The device signals an event. The CPU saves enough state, runs a handler, acknowledges the device, and resumes work; frequent interrupts can be expensive."},
  {label:"Interrupt coalescing",detail:"A device can combine multiple completions into one interrupt, trading some notification latency for fewer CPU entries."},
  {label:"DMA transfer",detail:"The driver configures a buffer and transfer, the device/DMA engine moves data, and a completion event reports that the buffer is ready."},
  {label:"Respect ownership and ordering",detail:"Before handing a buffer to a device or consuming DMA output, software and hardware must agree on ownership, completion, and cache/IOMMU visibility."}
 ],
 checks:[
  {id:"io-poll",kind:"mcq",prompt:"What is the main CPU-cost disadvantage of polling while a device is idle?",options:["It can consume CPU cycles repeatedly checking status","It always requires disk I/O","It cannot observe device registers","It eliminates latency"],answer:0,hints:["The CPU keeps checking even when no event is ready."],explain:"Polling spends cycles checking status and can waste CPU when events are sparse."},
  {id:"io-interrupt",kind:"mcq",prompt:"What is a major cost of interrupt-driven I/O at very high event rates?",options:["Per-event dispatch and handler overhead","The CPU can never run other code","It always copies data twice","It disables virtual memory"],answer:0,hints:["Each interrupt can require state save/restore and handler work."],explain:"High interrupt rates can consume substantial CPU; batching and interrupt coalescing can amortize the cost."},
  {id:"io-dma",kind:"mcq",prompt:"What is the central benefit of DMA for large transfers?",options:["The CPU no longer needs to configure or observe the transfer","Payload can move between device and memory without CPU copying each byte","DMA eliminates all memory bandwidth limits","DMA guarantees cache coherence in every platform"],answer:1,hints:["The CPU still sets up the transfer and handles completion/errors."],explain:"DMA can move blocks directly between device and memory, reducing CPU copying; setup, completion, and memory-system costs remain."},
  {id:"io-batch",kind:"numeric",prompt:"A DMA engine transfers 1000 events in batches of 100. How many DMA batches are required?",answer:10,tolerance:0,hints:["Divide event count by batch size."],explain:"1000/100=10 batches."},
  {id:"io-poll-latency",kind:"numeric",prompt:"If events arrive uniformly and a polling loop checks every 8 ms, what is the approximate average detection delay?",answer:4,tolerance:0.01,unit:"ms",hints:["Average a uniformly distributed wait between 0 and one interval."],explain:"The approximate mean wait is half the interval: 8/2=4 ms."},
  {id:"io-buffer",kind:"scenario",prompt:"A storage device completes a DMA transfer into a buffer. What must software verify before consuming the buffer?",options:["That completion and ownership/visibility rules permit the CPU to read the data","Only that the CPU clock is high","That the buffer address is a string","Nothing; DMA is always instantly coherent"],answer:0,hints:["Data movement and ownership/visibility are part of the device contract."],explain:"Software must follow completion, buffer ownership, memory ordering, and platform cache-coherency rules before consuming the data."}
 ],
 deeper:[
  {title:"Polling and busy waiting",body:"Polling is simple and can provide low and predictable detection latency when the CPU checks frequently. Its cost is proportional to the polling duty cycle; it can be reasonable for short critical waits or dedicated cores but inefficient for sparse events."},
  {title:"Interrupt handling",body:"An interrupt causes control transfer to a handler that identifies the source, acknowledges or services it, and defers lengthy work when appropriate. Nested interrupts, priorities, interrupt moderation, and top-half/bottom-half designs affect latency and throughput."},
  {title:"DMA and scatter-gather",body:"DMA engines can transfer blocks without CPU copying every byte. Scatter-gather descriptors describe multiple buffers; drivers still configure descriptors, handle errors/completion, and obey device-specific alignment and address constraints."},
  {title:"Cache coherence and DMA",body:"Whether a DMA buffer is coherent with CPU caches depends on the platform and mapping. Some systems provide hardware-coherent DMA; others require explicit cache clean/invalidate operations or coherent allocation APIs. A completion interrupt alone does not universally guarantee cache visibility."},
  {title:"IOMMU and isolation",body:"An IOMMU translates and restricts device-visible addresses, helping isolate devices and map buffers safely. Drivers must set up mappings and avoid exposing arbitrary memory to a bus-mastering device."},
  {title:"Batching trade-offs",body:"Batching and interrupt coalescing reduce per-event overhead but can increase latency because software waits for a batch threshold or timer. High-throughput systems balance CPU efficiency, tail latency, and buffer pressure."}
 ],
 followups:[
  {q:"Is DMA always better than interrupts?",a:"No. Tiny transfers may not justify DMA setup and mapping overhead; DMA is most useful when payload movement is large enough to amortize costs."},
  {q:"Why can polling be useful in low-latency systems?",a:"Frequent polling can reduce notification latency and avoid interrupt overhead, provided dedicating CPU cycles is acceptable."},
  {q:"Does DMA completion automatically make data visible to CPU caches?",a:"Not on every platform. Drivers must follow the platform's DMA-coherency, memory-ordering, and buffer ownership rules."}
 ],
 tradeoff:{failure:"Assuming one I/O method is always best, ignoring per-event overhead, or consuming a DMA buffer without respecting completion and cache-visibility rules.",tradeoff:"Polling reduces notification overhead at the cost of CPU cycles; interrupts conserve idle CPU but add dispatch latency; DMA reduces copying for large transfers but adds setup, mapping, and ownership complexity."},
 numbers:[{label:"Polling wait",value:"≈ interval / 2"},{label:"Interrupt cost",value:"per event"},{label:"DMA cost",value:"per batch + transfer"}],
 model:"I compare the workload's event rate and payload size against polling duty cycle, interrupt overhead, and DMA batch costs. I then choose a strategy that meets latency and CPU goals and verify buffer ownership, completion, and cache visibility on the target platform.",
 debug:{q:"DMA reports completion but the CPU reads stale data. What could be wrong?",a:"Check whether the platform uses coherent DMA, whether cache maintenance is required, and whether the driver followed DMA synchronization and memory-ordering APIs before reading the buffer."},
 rapid:["Polling trades CPU time for predictable checks","Interrupts pay dispatch/handler overhead","Coalescing amortizes interrupts but can add latency","DMA moves blocks without CPU copying each byte","Small transfers may not justify DMA setup","DMA buffer ownership and cache visibility matter","IOMMUs constrain device-visible addresses"],
 before:[{track:"architecture",slug:"virtual-memory-tlb"},{track:"architecture",slug:"multicore-cache-coherence-msi"}],
 derive:"For a sparse-event workload and a high-throughput packet workload, estimate how polling, interrupts, and DMA differ in CPU overhead and latency. State every assumption.",
 keyIdea:"I/O strategy is a workload-dependent trade-off among CPU overhead, notification latency, transfer size, and correctness of device-memory ownership.",
 commonMistake:"Assuming DMA removes all CPU involvement or that an interrupt automatically makes DMA-written data cache-visible.",
 interviewLadder:[
  {level:"definition",q:"What is DMA?",a:"A mechanism that lets a device or DMA engine transfer data between device and memory without the CPU copying each byte."},
  {level:"mechanism",q:"How does interrupt coalescing help?",a:"It combines several events/completions into fewer interrupts, amortizing dispatch overhead."},
  {level:"trade-off",q:"When might polling beat interrupts?",a:"For very frequent events or strict low latency when dedicating CPU cycles is acceptable."},
  {level:"systems",q:"What must a driver do around a DMA buffer?",a:"Configure mappings/descriptors, respect ownership and completion, handle errors, and apply platform-specific cache synchronization and ordering."}
 ]
};
