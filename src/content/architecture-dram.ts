import type { Lesson } from "./types";
export const dramLesson:Lesson={
 slug:"dram-memory-system-timing",track:"architecture",title:"DRAM Organization, Row Buffers & Timing",
 short:"Map byte addresses to banks and rows and see how row-buffer locality changes memory-access latency.",
 flagship:true,
 question:"Why can two loads to nearby addresses have different latency even when they access the same DRAM chip?",
 problem:"Main memory is organized into channels, ranks, banks, rows, and columns. A bank typically has a row buffer holding the currently activated row. Reusing that row can be cheaper than closing it and activating a different row, so the access pattern—not just the address size—affects latency.",
 idea:"A row hit accesses the currently open row in a bank. A closed-row access must activate a row before the column command. A row conflict must first precharge the previously open row, then activate the requested row. Multiple banks can offer parallelism, but scheduling, timing constraints, queues, refresh, and data-bus contention determine actual performance.",
 how:{text:"For this simplified model, divide a byte address by row size to obtain a row number, distribute row numbers across banks, and use the remaining high bits as the row within that bank. The model serializes requests: a row hit costs tCL; a closed-row access costs tRCD+tCL; a row conflict costs tRP+tRCD+tCL.",formula:"rowNumber = floor(address / rowBytes)\nbank = rowNumber mod bankCount\nrow = floor(rowNumber / bankCount)\nrow hit: tCL · closed row: tRCD+tCL · conflict: tRP+tRCD+tCL",example:"If tCL=tRCD=tRP=12 cycles, a row hit costs 12 cycles, a closed-row access costs 24 cycles, and a row conflict costs 36 cycles in this model. Reordering requests to reuse an open row can reduce modeled latency, but real controllers must preserve correctness and satisfy timing constraints."},
 lab:"archdram",
 trace:[
  {label:"Map the address",detail:"A simplified address mapping identifies a bank and a row. Real controllers may interleave channel, rank, bank-group, bank, row, and column bits differently."},
  {label:"Check the row buffer",detail:"If the requested row is already open in that bank, the access is a row hit and avoids row activation/precharge work."},
  {label:"Activate a closed row",detail:"If the bank has no open row, an ACTIVATE opens the desired row; the column read follows after the required activation-to-column delay."},
  {label:"Resolve a row conflict",detail:"If another row is open, it must be precharged before the new row can be activated, adding latency."},
  {label:"Consider bank-level parallelism",detail:"Independent banks may overlap parts of their work, but command spacing, data-bus conflicts, refresh and scheduling policy limit the gain."}
 ],
 checks:[
  {id:"dram-rowhit",kind:"numeric",prompt:"If tCL=10 cycles, what latency does a row hit have in this simplified model?",answer:10,tolerance:0,hints:["A row hit only pays the column access latency in this model."],explain:"A row hit costs tCL=10 cycles."},
  {id:"dram-closed",kind:"numeric",prompt:"If tRCD=12 and tCL=10 cycles, what is the modeled latency for a closed-row access?",answer:22,tolerance:0,hints:["Activation-to-column delay plus column latency."],explain:"tRCD+tCL=12+10=22 cycles."},
  {id:"dram-conflict",kind:"numeric",prompt:"If tRP=12, tRCD=12 and tCL=12 cycles, what is the modeled row-conflict latency?",answer:36,tolerance:0,hints:["Precharge, activate, then column access."],explain:"12+12+12=36 cycles."},
  {id:"dram-locality",kind:"mcq",prompt:"Why is a row hit usually cheaper than a row conflict?",options:["The desired row is already open, avoiding precharge and activation","It bypasses all memory timing","It uses no bank","It changes the CPU clock"],answer:0,hints:["Think about which row-management operations are already complete."],explain:"A row hit reuses the open row buffer; a conflict requires precharging the old row and activating another."},
  {id:"dram-banks",kind:"mcq",prompt:"What is the main performance opportunity from having multiple banks?",options:["Independent operations may overlap and expose bank-level parallelism","Every request becomes a row hit","All timing constraints disappear","The address no longer needs mapping"],answer:0,hints:["Parallel resources can sometimes make progress concurrently."],explain:"Multiple banks can overlap operations, although shared buses and DRAM timing constraints limit concurrency."},
  {id:"dram-controller",kind:"scenario",prompt:"A trace alternates between two rows in the same bank. What is the likely row-buffer behavior?",options:["Mostly row hits","Repeated row conflicts after the first access","Every request is a closed-row access","No DRAM commands are needed"],answer:1,hints:["Only one row is open per bank in this model."],explain:"Alternating rows in the same bank repeatedly forces a precharge and activation, causing row conflicts."}
 ],
 deeper:[
  {title:"Banks, ranks and channels",body:"A channel provides a data path to memory devices; ranks share a channel's command/data resources, and banks contain independently managed arrays and row buffers. The exact organization depends on the DRAM generation and module. Bank groups introduce additional command timing constraints in modern devices."},
  {title:"Row hits and row conflicts",body:"A row hit reuses an activated row. A closed-row miss activates the requested row. A row conflict requires closing/precharging a different open row before activation. Row-buffer locality can improve latency and throughput, but the best request ordering depends on fairness, deadlines, and other timing constraints."},
  {title:"Bank-level parallelism",body:"Different banks can perform some operations concurrently, hiding portions of activation latency. They still share channel command and data buses and obey timing restrictions such as minimum activate-to-precharge and row-cycle intervals. More banks do not guarantee linear speedup."},
  {title:"Memory controllers and scheduling",body:"Controllers track open rows, queued requests, bank availability, and timing constraints. Policies that favor ready row hits can improve throughput but may delay other requests, so fairness and quality-of-service constraints matter."},
  {title:"Refresh and retention",body:"DRAM cells store charge and require refresh. Refresh temporarily restricts access to affected resources and contributes to latency variation. This lab omits refresh scheduling and therefore is not a cycle-accurate DRAM simulator."},
  {title:"Address mapping and workload behavior",body:"Interleaving address bits across channels, ranks, banks and rows changes which requests conflict and which can overlap. Sequential strides that look close in byte-address space may map to different banks or the same bank depending on the mapping."}
 ],
 followups:[
  {q:"Is a row hit always exactly one tCL in real hardware?",a:"No. The lab uses that simplified cost to isolate row-buffer effects. Real latency depends on command timing, data bursts, queueing, controller scheduling, refresh and other constraints."},
  {q:"Why can increasing bank count help?",a:"Independent banks can overlap some activation and access work, increasing bank-level parallelism when requests are distributed well."},
  {q:"Can a memory controller always reorder requests to maximize row hits?",a:"No. Dependencies, ordering rules, fairness, deadlines, refresh and quality-of-service requirements constrain scheduling."}
 ],
 tradeoff:{failure:"Treating DRAM as a uniform-latency array or assuming every request pays the same fixed time regardless of row-buffer state.",tradeoff:"Favoring row hits may improve throughput but can hurt fairness or tail latency. More bank parallelism helps only when the address mapping and request stream expose independent work."},
 numbers:[{label:"Row hit",value:"tCL"},{label:"Closed row",value:"tRCD+tCL"},{label:"Row conflict",value:"tRP+tRCD+tCL"}],
 model:"I map each byte address to a bank and row, track the open row per bank, and classify each serialized request as a row hit, closed-row access, or row conflict. I calculate latency using explicit simplified timing assumptions and state what real controller effects are omitted.",
 debug:{q:"A benchmark has a high row-conflict rate even though its working set is small. What should you inspect?",a:"Inspect address-to-bank/row mapping and access strides. The trace may repeatedly alternate rows in the same bank, causing conflicts despite a small working set."},
 rapid:["DRAM is organized into banks and rows","A row buffer holds the open row in a bank","Row hits avoid precharge and activation","Row conflicts add precharge plus activation","Banks can expose parallelism but share resources","Address mapping affects conflicts and parallelism","Real timing includes refresh, queues and command constraints"],
 before:[{track:"architecture",slug:"cache-mapping-amat"},{track:"architecture",slug:"virtual-memory-tlb"}],
 derive:"Compare repeated accesses to one row with alternating accesses to two rows in the same bank. Calculate row hits, row conflicts and total modeled cycles, then explain what bank-level parallelism could change.",
 keyIdea:"Main-memory latency depends on row-buffer state, address mapping, bank parallelism, and scheduling—not just a single DRAM latency number.",
 commonMistake:"Assuming all DRAM accesses cost the same or treating banks as independent channels with no shared timing/data constraints.",
 interviewLadder:[
  {level:"definition",q:"What is a DRAM row hit?",a:"An access to a row that is already open in the target bank's row buffer."},
  {level:"mechanism",q:"Why does a row conflict cost more?",a:"The controller must precharge the currently open row, activate the requested row, then issue the column access."},
  {level:"trade-off",q:"Why not always prioritize row hits?",a:"It can improve throughput but starve older or less-local requests and worsen fairness or tail latency."},
  {level:"systems",q:"How does bank-level parallelism improve performance?",a:"Independent banks can overlap portions of work, subject to shared channel bandwidth and DRAM command timing constraints."}
 ]
};
