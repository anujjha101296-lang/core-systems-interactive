export type ReplacementPolicy = "LRU" | "FIFO";
export type WritePolicy = "write-through" | "write-back";
export type WriteMissPolicy = "write-allocate" | "no-write-allocate";
export type CachePolicyConfig = { capacityBytes:number; blockBytes:number; ways:number; replacement:ReplacementPolicy; write:WritePolicy; writeMiss:WriteMissPolicy };
export type CacheAccess = { address:number; op:"R"|"W"; set:number; tag:number; hit:boolean; evictedTag:number|null; dirtyWriteback:boolean; memoryWrite:boolean; dirty:boolean };
export type CachePolicyResult = { accesses:CacheAccess[]; hits:number; misses:number; evictions:number; dirtyWritebacks:number; memoryWrites:number; hitRate:number; sets:number; lines:number };
export function validateCachePolicyConfig(c:CachePolicyConfig):void {
 for(const [k,v] of Object.entries({capacityBytes:c.capacityBytes,blockBytes:c.blockBytes,ways:c.ways})) if(!Number.isInteger(v)||v<=0) throw new RangeError(k+" must be a positive integer");
 if((c.capacityBytes&(c.capacityBytes-1))!==0||(c.blockBytes&(c.blockBytes-1))!==0) throw new RangeError("Capacity and block size must be powers of two");
 if(c.blockBytes>c.capacityBytes||c.capacityBytes%c.blockBytes!==0) throw new RangeError("Block size must fit capacity exactly");
 const lines=c.capacityBytes/c.blockBytes;
 if(!Number.isInteger(c.ways)||c.ways>lines||lines%c.ways!==0) throw new RangeError("Associativity must divide cache line count");
}
export function simulateCachePolicies(config:CachePolicyConfig,trace:{address:number;op:"R"|"W"}[]):CachePolicyResult {
 validateCachePolicyConfig(config);
 const lines=config.capacityBytes/config.blockBytes, sets=lines/config.ways;
 type Line={tag:number;dirty:boolean;inserted:number;used:number};
 const cache:Line[][]=Array.from({length:sets},()=>[]);
 let hits=0,misses=0,evictions=0,dirtyWritebacks=0,memoryWrites=0;
 const accesses:CacheAccess[]=[];
 trace.forEach((a,t)=>{
  if(!Number.isInteger(a.address)||a.address<0||a.address>0xffff) throw new RangeError("Addresses must be unsigned 16-bit byte addresses");
  if(a.op!=="R"&&a.op!=="W") throw new RangeError("Operation must be R or W");
  const block=Math.floor(a.address/config.blockBytes),set=block%sets,tag=Math.floor(block/sets),ways=cache[set]!;
  let line=ways.find(x=>x.tag===tag),hit=!!line,evictedTag:number|null=null,dirtyWriteback=false,memoryWrite=false;
  if(hit) {hits++;line!.used=t;if(a.op==="W"){if(config.write==="write-through") memoryWrite=true;else line!.dirty=true;}}
  else {
   misses++;
   const allocate=a.op!=="W"||config.writeMiss==="write-allocate";
   if(a.op==="W"&&config.write==="write-through") memoryWrite=true;
   if(allocate){
    if(ways.length>=config.ways){
     const victim=ways.reduce((best,x)=>config.replacement==="LRU"?(x.used<best.used?x:best):(x.inserted<best.inserted?x:best));
     evictedTag=victim.tag;evictions++;dirtyWriteback=victim.dirty&&config.write==="write-back";
     if(dirtyWriteback)dirtyWritebacks++;
     ways.splice(ways.indexOf(victim),1);
    }
    line={tag,dirty:a.op==="W"&&config.write==="write-back",inserted:t,used:t};ways.push(line);
   }
  }
  if(memoryWrite)memoryWrites++;
  accesses.push({address:a.address,op:a.op,set,tag,hit,evictedTag,dirtyWriteback,memoryWrite,dirty:line?.dirty??false});
 });
 return {accesses,hits,misses,evictions,dirtyWritebacks,memoryWrites,hitRate:trace.length?hits/trace.length:0,sets,lines};
}
