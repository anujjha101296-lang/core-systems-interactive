export type PredictorKind = "always-not-taken" | "always-taken" | "one-bit" | "two-bit";
export type BranchOutcome = "T" | "N";
export type BranchStep = { index:number; outcome:BranchOutcome; prediction:BranchOutcome; correct:boolean; stateBefore:number|null; stateAfter:number|null; penaltyCycles:number };
export type BranchReport = { kind:PredictorKind; steps:BranchStep[]; branches:number; mispredictions:number; accuracy:number; penaltyCycles:number; averagePenaltyPerBranch:number };
function validate(kind:PredictorKind, outcomes:BranchOutcome[], penalty:number) {
 if(!["always-not-taken","always-taken","one-bit","two-bit"].includes(kind)) throw new RangeError("Unsupported predictor kind");
 if(!Array.isArray(outcomes)||outcomes.some(o=>o!=="T"&&o!=="N")) throw new RangeError("Outcomes must contain only T or N");
 if(!Number.isInteger(penalty)||penalty<0||penalty>100) throw new RangeError("Misprediction penalty must be an integer from 0 to 100 cycles");
}
export function simulateBranchPrediction(kind:PredictorKind, outcomes:BranchOutcome[], penalty=2):BranchReport {
 validate(kind,outcomes,penalty);
 let state=kind==="one-bit"?0:kind==="two-bit"?1:null; // 1-bit starts predict N; 2-bit starts weakly not-taken
 const steps:BranchStep[]=[];
 for(let i=0;i<outcomes.length;i++){
  const outcome=outcomes[i]!;
  const before=state;
  const prediction:BranchOutcome=kind==="always-not-taken"?"N":kind==="always-taken"?"T":kind==="one-bit"?(state===1?"T":"N"):(state!>=2?"T":"N");
  const correct=prediction===outcome;
  if(kind==="one-bit") state=outcome==="T"?1:0;
  if(kind==="two-bit") state=outcome==="T"?Math.min(3,state!+1):Math.max(0,state!-1);
  steps.push({index:i+1,outcome,prediction,correct,stateBefore:before,stateAfter:state,penaltyCycles:correct?0:penalty});
 }
 const mispredictions=steps.filter(s=>!s.correct).length;
 return {kind,steps,branches:outcomes.length,mispredictions,accuracy:outcomes.length?((outcomes.length-mispredictions)/outcomes.length)*100:100,penaltyCycles:mispredictions*penalty,averagePenaltyPerBranch:outcomes.length?mispredictions*penalty/outcomes.length:0};
}
export function parseBranchTrace(raw:string):BranchOutcome[] {
 if(typeof raw!=="string") throw new RangeError("Trace must be text");
 const normalized=raw.toUpperCase().replace(/[,;\s]+/g,"");
 if(!/^[TN]*$/.test(normalized)) throw new RangeError("Use only T (taken) and N (not taken), separated by spaces or commas");
 return [...normalized] as BranchOutcome[];
}
