import type { Lesson } from "./types";
export const cacheLesson: Lesson = {
 slug:"cache-mapping-amat",track:"architecture",title:"Memory Hierarchy: Cache Mapping & AMAT",
 short:"Decode address tag/index/offset fields and see how locality, associativity and misses affect access time.",
 flagship:true,
 question:"Why can a small, fast cache make a large memory system feel much faster—and why do some access patterns still miss repeatedly?",
 problem:"Processors can execute operations faster than main memory can return arbitrary data. Caches exploit temporal locality (reuse of recent data) and spatial locality (nearby addresses) to reduce average access time, but capacity, block size, mapping and conflicts determine which data remains available.",
 idea:"A cache divides an address into tag, set index and byte/block offset. Direct-mapped caches have one line per set; set-associative caches allow multiple candidate lines. Average memory access time is AMAT = hit time + miss rate × miss penalty. A cache hit is a data outcome; mapping determines where a block can reside.",
 how:{
  text:"For a byte-addressed cache with power-of-two block size, offset bits select a byte within a block. Index bits select a set, and the remaining high bits form the tag. A set-associative cache chooses among ways within that set. On a miss, the cache fetches the block and may evict an existing line according to its replacement policy; this lab uses LRU within each set.",
  formula:"Block number = floor(address / block size)\nSet index = block number mod number of sets\nTag = floor(block number / number of sets)\nAMAT = hit time + miss rate × miss penalty",
  example:"With 64-byte cache lines, address 0x1234 has byte offset 0x34 (52 decimal). Its block number is floor(0x1234/64); the set index depends on the number of sets, and the remaining high bits form the tag.",
 },
 lab:"archcache",
 trace:[
  {label:"Choose cache geometry",detail:"Capacity divided by block size gives the number of cache lines; lines divided by associativity gives the number of sets."},
  {label:"Split the address",detail:"Low bits select a byte within the block, the next bits select a set, and high bits form the tag."},
  {label:"Check tag and valid state",detail:"A matching tag in the indexed set is a hit; otherwise the access misses and a line is allocated."},
  {label:"Apply replacement",detail:"If all ways in the set are occupied, choose a victim; this lab uses least recently used within a set."},
  {label:"Compute average access time",detail:"Combine hit time, miss rate and miss penalty to see how miss behavior changes total latency."},
 ],
 checks:[
  {id:"cache-fields",kind:"mcq",prompt:"Which address field selects a byte within a cache block?",options:["Tag","Set index","Block/byte offset","Valid bit"],answer:2,hints:["It uses the lowest address bits."],explain:"The offset identifies the byte or word within the cache block."},
  {id:"cache-sets",kind:"numeric",prompt:"A 1 KiB cache has 16-byte blocks and is direct-mapped. How many sets does it have?",answer:64,tolerance:0,hints:["1024 / 16 lines, one line per set."],explain:"There are 1024/16 = 64 lines and one way per set, so 64 sets."},
  {id:"cache-amat",kind:"numeric",prompt:"Hit time is 2 ns, miss rate is 0.05, and miss penalty is 40 ns. What is AMAT in ns?",answer:4,tolerance:0.0001,hints:["2 + 0.05 × 40."],explain:"AMAT = 2 + 0.05 × 40 = 4 ns."},
  {id:"cache-assoc",kind:"mcq",prompt:"For fixed capacity and block size, what does increasing associativity primarily change?",options:["The number of bytes in each address","The number of candidate lines within each set and the number of sets","The physical DRAM latency","The CPU clock rate"],answer:1,hints:["Total lines stay fixed; ways and sets are redistributed."],explain:"More ways per set means fewer sets for a fixed line count, and can reduce some conflict misses at the cost of more tag comparisons."},
  {id:"cache-locality",kind:"mcq",prompt:"A loop repeatedly accesses the same small array. Which property most directly helps those repeated accesses hit?",options:["Temporal locality","Clock skew","Instruction encoding","Branch target alignment"],answer:0,hints:["The same data is reused over time."],explain:"Temporal locality means recently accessed data is likely to be accessed again soon."},
  {id:"cache-miss",kind:"mcq",prompt:"What is a conflict miss?",options:["The first-ever access to any block","A miss caused because blocks compete for the same set even when other sets have free space","A miss caused by an invalid address","A writeback that is always a hit"],answer:1,hints:["Consider mapping constraints rather than total capacity alone."],explain:"Blocks mapping to the same set can evict each other even if unused lines exist elsewhere in the cache."},
 ],
 deeper:[
  {title:"Locality",body:"Temporal locality predicts reuse of recently accessed data or instructions. Spatial locality predicts accesses to nearby addresses, motivating cache lines that fetch a contiguous block. Sequential scans often benefit from spatial locality, while repeated reuse benefits from temporal locality."},
  {title:"Capacity, conflict and compulsory misses",body:"Compulsory misses occur on first access to a block. Capacity misses occur when the working set exceeds what the cache can retain. Conflict misses occur when mapping forces blocks to compete for the same set. Increasing associativity may reduce conflict misses but cannot eliminate compulsory misses."},
  {title:"Associativity and replacement",body:"For a fixed cache capacity and block size, more ways means fewer sets. A hit requires matching a tag in one of the set's ways. Replacement policies such as LRU approximate recency but need metadata and can behave differently from simpler policies in real hardware."},
  {title:"Writes and hierarchy",body:"Write-through propagates writes to the next level; write-back marks a line dirty and writes it back on eviction. Write-allocate fetches a block on a store miss, while no-write-allocate may bypass allocation. These choices affect traffic, complexity and performance and are separate from address decoding."},
  {title:"AMAT and multi-level caches",body:"For one cache level, AMAT = hit time + miss rate × miss penalty. With multiple levels, the miss penalty includes the average cost of accessing lower levels, and conditional miss rates must be interpreted carefully. A small improvement in miss rate can matter greatly when main-memory penalties are large."},
 ],
 followups:[
  {q:"Can a cache miss occur even if total cache capacity is large enough for the working set?",a:"Yes. Mapping conflicts can force multiple blocks into the same set, causing conflict misses."},
  {q:"Why does a larger block not always improve performance?",a:"It can exploit spatial locality but also consume capacity, increase transfer cost, and fetch unused data."},
  {q:"What does AMAT tell us?",a:"It estimates average access time by combining hit time with the probability-weighted miss penalty."}
 ],
 tradeoff:{failure:"Treating cache capacity as the only determinant of hits, ignoring mapping conflicts, locality, block size, replacement and miss penalty.",tradeoff:"Larger blocks and more associativity may reduce some misses but can increase bandwidth, energy, metadata, hit time or capacity pressure."},
 numbers:[{label:"Address fields",value:"Tag · Index · Offset"},{label:"AMAT",value:"Hit + miss rate × penalty"},{label:"Replacement",value:"LRU teaching model"}],
 model:"I compute line count and set count from cache geometry, split each byte address into tag/index/offset, then look up the tag within the selected set. I update replacement state on each access and use hit time, miss rate and miss penalty to estimate average access time.",
 debug:{q:"Two addresses repeatedly evict each other in a direct-mapped cache, but the cache has other empty lines. Why?",a:"Both addresses map to the same set, which has only one way. Empty lines in other sets cannot hold either block under the fixed mapping."},
 rapid:["Offset selects bytes within a block","Index selects a set; tag identifies a block within that set","Associativity redistributes fixed cache lines among fewer sets","Temporal locality means reuse over time","Conflict misses arise from set mapping","AMAT = hit time + miss rate × miss penalty"],
 before:[{track:"architecture",slug:"pipeline-hazards-forwarding"}],
 derive:"Compare direct-mapped and two-way caches for the same sequence of addresses. Record tag/index/offset and count hits, then vary hit time and miss penalty to compute AMAT.",
 keyIdea:"Cache performance depends on locality and mapping, not capacity alone.",
 commonMistake:"Assuming a cache hit is determined only by whether the total working set fits in the cache.",
 interviewLadder:[
  {level:"definition",q:"What are tag, index and offset?",a:"They identify the memory block, select a set, and select a byte within a block."},
  {level:"mechanism",q:"How does associativity affect mapping?",a:"It changes the number of ways per set and number of sets for fixed capacity and block size."},
  {level:"trade-off",q:"Why might higher associativity cost more?",a:"More ways require more tag comparisons and replacement state, potentially increasing latency, energy and complexity."},
  {level:"systems",q:"How do you reduce AMAT?",a:"Improve hit time, reduce miss rate, or reduce the average miss penalty while accounting for capacity, power and bandwidth tradeoffs."}
 ]
};
