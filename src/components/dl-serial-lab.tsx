import { useMemo, useState } from "react";
import { encodeUartFrame, estimateSerialClocks, uartTransferTimeMs, type UartParity } from "@/lib/dl-serial";
export function SerialInterfacesLab(){
 const [data,setData]=useState(0x53);const [dataBits,setDataBits]=useState(8);const [parity,setParity]=useState<UartParity>("even");const [stopBits,setStopBits]=useState<1|2>(1);const [baud,setBaud]=useState(115200);const [bytes,setBytes]=useState(16);const [protocol,setProtocol]=useState<"spi"|"i2c">("spi");
 const frame=useMemo(()=>{try{return {value:encodeUartFrame(Math.min(data,2**dataBits-1),dataBits,parity,stopBits),error:""};}catch(e){return {value:null,error:e instanceof Error?e.message:"Invalid UART configuration"};}},[data,dataBits,parity,stopBits]);
 const clocks=useMemo(()=>estimateSerialClocks(protocol,bytes,8,true),[protocol,bytes]);
 const time=uartTransferTimeMs(bytes,baud,1+dataBits+(parity==="none"?0:1)+stopBits);
 const field="field mt-1 w-full";
 return <div className="panel p-5 space-y-5">
  <div><p className="eyebrow">Interactive lab · serial interfaces</p><p className="mt-2 text-sm text-muted-foreground">Inspect an asynchronous UART frame, then compare approximate payload clock counts for SPI and I²C. The protocols have different timing and wiring contracts.</p></div>
  <section className="space-y-4"><p className="eyebrow">UART frame builder</p>
   <div className="grid gap-4 sm:grid-cols-2">
    <label className="block text-sm"><span className="eyebrow">Data byte</span><input className={field} type="number" min={0} max={2**dataBits-1} value={Math.min(data,2**dataBits-1)} onChange={e=>setData(Math.max(0,Math.min(2**dataBits-1,Number(e.target.value)||0)))}/></label>
    <label className="block text-sm"><span className="eyebrow">Data bits</span><select className={field} value={dataBits} onChange={e=>setDataBits(Number(e.target.value))}>{[5,6,7,8,9].map(n=><option key={n} value={n}>{n} bits</option>)}</select></label>
    <label className="block text-sm"><span className="eyebrow">Parity</span><select className={field} value={parity} onChange={e=>setParity(e.target.value as UartParity)}><option value="none">None</option><option value="even">Even</option><option value="odd">Odd</option></select></label>
    <label className="block text-sm"><span className="eyebrow">Stop bits</span><select className={field} value={stopBits} onChange={e=>setStopBits(Number(e.target.value) as 1|2)}><option value={1}>1 stop bit</option><option value={2}>2 stop bits</option></select></label>
   </div>
   {frame.error?<p className="text-sm text-destructive">{frame.error}</p>:frame.value&&<>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Start bit","0"],["Data bits (LSB first)",frame.value.bits.join("")],["Parity bit",frame.value.parityBit===null?"none":frame.value.parityBit],["Frame length",frame.value.frameBits+" bits"]].map(([k,v])=><div key={String(k)} className="rule-t pt-2"><p className="eyebrow">{k}</p><p className="font-mono text-lg">{v}</p></div>)}</div>
    <div className="overflow-x-auto"><div className="flex min-w-max gap-1">{[{label:"START",bit:0},...frame.value.bits.map((bit,i)=>({label:"D"+i,bit})),...(frame.value.parityBit===null?[]:[{label:"PAR",bit:frame.value.parityBit}]),...Array.from({length:stopBits},(_,i)=>({label:"STOP"+(i+1),bit:1}))].map((item,i)=><div key={i} className="min-w-12 text-center"><div className="eyebrow mb-1">{item.label}</div><div className={`rounded-sm border p-3 font-mono text-xl ${item.bit===0?"border-primary bg-primary/10":"border-rule"}`}>{item.bit}</div></div>)}</div></div>
    <p className="text-sm text-ink-2">Frame efficiency: {(frame.value.payloadBits/frame.value.frameBits*100).toFixed(1)}% of transmitted bit times carry payload. At {baud.toLocaleString()} baud, {bytes} bytes take about {time.toFixed(2)} ms with this framing and no inter-frame gaps.</p>
   </>}
   <label className="block text-sm"><span className="flex justify-between"><span className="eyebrow">Baud rate</span><span className="font-mono">{baud.toLocaleString()} baud</span></span><input type="range" className="w-full" min={1200} max={1000000} step={1200} value={baud} onChange={e=>setBaud(Number(e.target.value))}/></label>
   <label className="block text-sm"><span className="flex justify-between"><span className="eyebrow">Payload bytes</span><span className="font-mono">{bytes}</span></span><input type="range" className="w-full" min={1} max={256} value={bytes} onChange={e=>setBytes(Number(e.target.value))}/></label>
  </section>
  <section className="border-t border-rule pt-5 space-y-4"><p className="eyebrow">SPI versus I²C bus clock estimate</p>
   <div className="flex gap-2">{(["spi","i2c"] as const).map(p=><button key={p} className={`btn ${protocol===p?"btn-primary":"btn-ghost"}`} onClick={()=>setProtocol(p)}>{p.toUpperCase()}</button>)}</div>
   <div className="grid grid-cols-2 gap-3"><div className="rule-t pt-2"><p className="eyebrow">Payload</p><p className="font-mono text-xl">{bytes} bytes</p></div><div className="rule-t pt-2"><p className="eyebrow">Estimated SCLK pulses</p><p className="font-mono text-xl">{clocks.clocks.toLocaleString()}</p></div></div>
   <p className="text-sm text-ink-2">{clocks.explanation}</p>
   <p className="text-xs text-muted-foreground">UART has no shared clock line and frames each character with start/stop bits. SPI typically uses SCLK, MOSI, MISO and chip select; CPOL/CPHA determine sampling edges. I²C uses open-drain SDA/SCL, addresses, ACK/NACK and START/STOP conditions. These estimates omit bus-specific setup, stretching, arbitration, inter-word gaps and controller overhead.</p>
  </section>
 </div>;
}
