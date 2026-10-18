export type ConsistencyModel="SC"|"relaxed";
export type StoreBufferingOutcome={r0:0|1;r1:0|1;label:string;};
function permutations<T>(items:T[]):T[][]{if(items.length<=1)return [items];const out:T[][]=[];items.forEach((item,i)=>{for(const rest of permutations(items.filter((_,j)=>j!==i)))out.push([item,...rest]);});return out;}
export function storeBufferingOutcomes(model:ConsistencyModel):StoreBufferingOutcome[]{
 if(model!=="SC"&&model!=="relaxed")throw new RangeError("Model must be SC or relaxed");
 if(model==="relaxed")return [{r0:0,r1:0,label:"00"},{r0:0,r1:1,label:"01"},{r0:1,r1:0,label:"10"},{r0:1,r1:1,label:"11"}];
 const ops=["Wx","Ry","Wy","Rx"];
 const found=new Map<string,StoreBufferingOutcome>();
 for(const order of permutations(ops)){
  if(order.indexOf("Wx")>order.indexOf("Ry")||order.indexOf("Wy")>order.indexOf("Rx"))continue;
  const r0=(order.indexOf("Wy")<order.indexOf("Ry")?1:0) as 0|1;
  const r1=(order.indexOf("Wx")<order.indexOf("Rx")?1:0) as 0|1;
  const label=`${r0}${r1}`;found.set(label,{r0,r1,label});
 }
 return [...found.values()].sort((a,b)=>a.label.localeCompare(b.label));
}
export function isAllowedStoreBufferingOutcome(model:ConsistencyModel,r0:number,r1:number){if((r0!==0&&r0!==1)||(r1!==0&&r1!==1))throw new RangeError("Read results must be 0 or 1");return storeBufferingOutcomes(model).some(o=>o.r0===r0&&o.r1===r1);}
