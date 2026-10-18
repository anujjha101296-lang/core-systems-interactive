export type DramConfig={banks:number;rowBytes:number;tCL:number;tRCD:number;tRP:number;};
export type DramAccess={address:number;bank:number;row:number;kind:"row-hit"|"closed-row"|"row-conflict";latency:number;startCycle:number;completeCycle:number;previousRow:number|null;};
export type DramReport={accesses:DramAccess[];totalCycles:number;averageCycles:number;rowHits:number;closedRows:number;rowConflicts:number;};
function positiveInt(n:number,name:string,max:number){if(!Number.isInteger(n)||n<1||n>max)throw new RangeError(`${name} must be an integer from 1 to ${max}`);}
export function validateDramConfig(c:DramConfig){
 positiveInt(c.banks,"banks",16); if((c.banks&(c.banks-1))!==0)throw new RangeError("Bank count must be a power of two");
 positiveInt(c.rowBytes,"rowBytes",65536); if((c.rowBytes&(c.rowBytes-1))!==0)throw new RangeError("Row size must be a power of two");
 positiveInt(c.tCL,"tCL",1000);positiveInt(c.tRCD,"tRCD",1000);positiveInt(c.tRP,"tRP",1000);
 return c;
}
/** Serialized single-channel teaching model; no overlap or refresh scheduling. */
export function simulateDramTrace(addresses:number[],config:DramConfig):DramReport {
 validateDramConfig(config);
 if(!Array.isArray(addresses))throw new RangeError("Addresses must be an array");
 const rowByBank:Array<number|null>=Array(config.banks).fill(null);
 let cycle=0,rowHits=0,closedRows=0,rowConflicts=0;
 const accesses:DramAccess[]=[];
 for(const address of addresses){
  if(!Number.isInteger(address)||address<0||address>0xffffffff)throw new RangeError("Addresses must be unsigned 32-bit byte addresses");
  const rowNumber=Math.floor(address/config.rowBytes);
  const bank=rowNumber%config.banks;
  const row=Math.floor(rowNumber/config.banks);
  const previousRow=rowByBank[bank] ?? null;
  let kind:DramAccess["kind"],latency:number;
  if(previousRow===row){kind="row-hit";latency=config.tCL;rowHits++;}
  else if(previousRow===null){kind="closed-row";latency=config.tRCD+config.tCL;closedRows++;}
  else {kind="row-conflict";latency=config.tRP+config.tRCD+config.tCL;rowConflicts++;}
  const startCycle=cycle;cycle+=latency;
  accesses.push({address,bank,row,kind,latency,startCycle,completeCycle:cycle,previousRow});
  rowByBank[bank]=row;
 }
 return {accesses,totalCycles:cycle,averageCycles:addresses.length?cycle/addresses.length:0,rowHits,closedRows,rowConflicts};
}
