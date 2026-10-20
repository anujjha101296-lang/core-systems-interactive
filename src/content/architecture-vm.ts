import type { Lesson } from "./types";
export const virtualMemoryLesson:Lesson={
 slug:"virtual-memory-tlb",track:"architecture",title:"Virtual Memory, Page Tables & TLBs",
 short:"Translate virtual addresses, distinguish TLB misses from page faults, and explore locality in address translation.",
 flagship:true,
 question:"How can every process believe it owns a private, contiguous address space when physical RAM is finite and shared?",
 problem:"Programs issue virtual addresses. The memory-management unit translates them into physical addresses using page tables, while a translation lookaside buffer (TLB) caches recent translations. A missing TLB entry may require a page-table walk; a virtual page absent from the page table can trigger a page fault.",
 idea:"A virtual address splits into virtual page number (VPN) and page offset. The page table maps VPN to physical page number (PPN); the offset is unchanged. Physical address = PPN × page size + offset. TLB hit/miss and page presence are separate decisions.",
 how:{
  text:"For power-of-two pages, the low address bits are the offset and the remaining high bits form the VPN. On a TLB hit, use the cached VPN→PPN mapping. On a TLB miss, consult the page table: a present mapping fills the TLB; a missing mapping causes a page fault, which the OS may resolve by allocating/loading a page or may treat as an invalid access.",
  formula:"VPN = floor(virtual address / page size)\nOffset = virtual address mod page size\nPhysical address = PPN × page size + offset",
  example:"With 256-byte pages, virtual address 0x012A has VPN 1 and offset 0x2A. If VPN 1 maps to physical page 7, the physical address is 7×256+42 = 1834 = 0x072A."
 },
 lab:"archvm",
 trace:[
  {label:"Split the virtual address",detail:"The page size determines how many low bits form the offset; the remaining bits identify the virtual page."},
  {label:"Look up the TLB",detail:"A hit returns the cached physical page number without a page-table lookup."},
  {label:"Consult the page table on a miss",detail:"A valid mapping fills the TLB. A missing mapping triggers a page fault instead."},
  {label:"Preserve the offset",detail:"Translation replaces the VPN with a PPN; the byte offset within the page does not change."},
  {label:"Observe locality",detail:"Repeated accesses to a small set of virtual pages tend to reuse TLB entries; a small TLB can thrash on a larger working set."}
 ],
 checks:[
  {id:"vm-offset",kind:"numeric",prompt:"With 256-byte pages, what is the offset of virtual address 0x012A? Give decimal.",answer:42,tolerance:0,hints:["The offset is the remainder after dividing by 256."],explain:"0x12A is 298 decimal; 298 mod 256 = 42."},
  {id:"vm-vpn",kind:"numeric",prompt:"With 256-byte pages, what is the VPN of address 0x012A?",answer:1,tolerance:0,hints:["Divide the address by 256 and take the floor."],explain:"floor(298/256)=1."},
  {id:"vm-tlb",kind:"mcq",prompt:"A TLB miss occurs, but the page table contains a valid mapping. What happens next in this simplified model?",options:["The access must page-fault","The mapping is obtained from the page table and may be inserted into the TLB","The offset is discarded","The process must terminate"],answer:1,hints:["A TLB caches translations; it is not the page table itself."],explain:"A TLB miss only says the translation was not cached. A valid page-table entry can still translate the address."},
  {id:"vm-fault",kind:"mcq",prompt:"What distinguishes a page fault from a TLB miss?",options:["A page fault means the required virtual page has no currently usable mapping; a TLB miss means its translation is not cached","They are identical events","A TLB miss always requires disk I/O","A page fault only occurs in physical addresses"],answer:0,hints:["One concerns the translation cache; the other concerns page validity/presence."],explain:"A TLB miss can be serviced from the page table. A page fault invokes OS handling because the mapping is absent or access is invalid."},
  {id:"vm-physical",kind:"numeric",prompt:"Page size is 256 bytes and VPN 1 maps to PPN 7. What physical address results from virtual address 0x012A? Give decimal.",answer:1834,tolerance:0,hints:["PPN × page size + offset."],explain:"7×256+42 = 1834."},
  {id:"vm-locality",kind:"mcq",prompt:"Why can a program with strong locality perform well with a small TLB?",options:["It avoids using virtual addresses","Recent translations are likely to be reused","It removes all page faults permanently","The page offset changes after translation"],answer:1,hints:["Think about temporal locality of address translations."],explain:"A small working set of translations can remain in the TLB and be reused."}
 ],
 deeper:[
  {title:"Isolation and protection",body:"Each process can use its own virtual address space. Page-table entries also carry permissions such as read, write and execute; translation is therefore part of protection as well as address relocation."},
  {title:"TLB misses are not page faults",body:"A TLB miss means the translation cache lacks an entry. Hardware or software can walk the page table and refill it if the mapping is valid. A page fault means OS intervention is needed because the mapping is absent, not resident, or violates access rules."},
  {title:"Page size trade-offs",body:"Larger pages reduce page-table and TLB pressure for a given memory footprint, but can increase internal fragmentation and make fine-grained allocation less flexible."},
  {title:"Multi-level page tables",body:"Hierarchical page tables avoid allocating entries for every possible virtual page. A TLB hit avoids a page-table walk; a miss can require multiple memory references before the actual load or store."}
 ],
 followups:[
  {q:"Does every TLB miss cause disk I/O?",a:"No. A valid page-table entry can refill the TLB without disk I/O. Disk access may occur when a page fault requires fetching a page from secondary storage."},
  {q:"Why is the page offset unchanged?",a:"Translation changes which physical page backs the virtual page, not the byte's position within that page."},
  {q:"What increases TLB reach?",a:"More TLB entries or larger page sizes increase the amount of virtual memory covered by cached translations, with trade-offs."}
 ],
 tradeoff:{failure:"Treating TLB misses and page faults as the same event, or changing the page offset during translation.",tradeoff:"Larger pages and TLBs can reduce translation overhead but affect fragmentation, memory usage, power and hardware complexity."},
 numbers:[{label:"Translation",value:"VPN → PPN"},{label:"Offset",value:"Preserved unchanged"},{label:"Miss distinction",value:"TLB miss ≠ page fault"}],
 model:"I split a virtual address into VPN and offset, check the TLB, consult the page table on a miss, and combine the mapped PPN with the unchanged offset. If no valid mapping exists, the access faults.",
 debug:{q:"The TLB misses on every access to a page, but the page table has a valid entry. Is the page faulting?",a:"No. The translation can be loaded from the page table into the TLB; a TLB miss alone is not a page fault."},
 rapid:["VPN selects the virtual page","Offset is preserved through translation","The page table maps VPN to PPN","A TLB caches recent translations","TLB miss does not imply page fault","Page permissions support protection"],
 before:[{track:"architecture",slug:"cache-mapping-amat"}],
 derive:"Use 256-byte pages to translate 0x012A through a page table, then repeat the address with a two-entry TLB and compare hits and misses.",
 keyIdea:"Virtual memory separates the address a program uses from the physical location of its data.",
 commonMistake:"Assuming a TLB miss always triggers a page fault or disk access.",
 interviewLadder:[
  {level:"definition",q:"What does a TLB store?",a:"Cached virtual-page to physical-page translations, typically with address-space and permission metadata."},
  {level:"mechanism",q:"What happens after a TLB miss?",a:"The system looks up the page table; a valid entry can refill the TLB, while a missing or invalid mapping causes a page fault."},
  {level:"trade-off",q:"What is the trade-off of larger pages?",a:"They increase TLB reach and reduce page-table overhead, but can increase internal fragmentation."},
  {level:"systems",q:"How does virtual memory support isolation?",a:"Separate address spaces and page permissions control which physical pages a process can access and how."}
 ]
};
