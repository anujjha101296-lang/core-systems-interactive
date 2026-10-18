export type UartParity="none"|"even"|"odd";
export type UartFrame={data:number;dataBits:number;parity:UartParity;stopBits:1|2;bits:number[];parityBit:number|null;frameBits:number;payloadBits:number;overheadBits:number;};
function integer(n:number,name:string,min:number,max:number){if(!Number.isInteger(n)||n<min||n>max)throw new RangeError(`${name} must be an integer from ${min} to ${max}`);}
export function encodeUartFrame(data:number,dataBits=8,parity:UartParity="none",stopBits:1|2=1):UartFrame{
 integer(dataBits,"dataBits",5,9);integer(data,"data",0,2**dataBits-1);
 if(!["none","even","odd"].includes(parity))throw new RangeError("Unsupported parity mode");
 if(stopBits!==1&&stopBits!==2)throw new RangeError("Stop bits must be 1 or 2");
 const bits=Array.from({length:dataBits},(_,i)=>(data>>i)&1);
 const ones=bits.reduce((a,b)=>a+b,0);
 const parityBit=parity==="none"?null:parity==="even"?ones%2:(ones+1)%2;
 const frameBits=1+dataBits+(parityBit===null?0:1)+stopBits;
 return {data,dataBits,parity,stopBits,bits,parityBit,frameBits,payloadBits:dataBits,overheadBits:frameBits-dataBits};
}
export function uartTransferTimeMs(dataBytes:number,baud:number,frameBits=10){
 integer(dataBytes,"dataBytes",0,1_000_000_000);integer(baud,"baud",1,100_000_000);integer(frameBits,"frameBits",7,13);
 return dataBytes*frameBits/baud*1000;
}
export function estimateSerialClocks(protocol:"spi"|"i2c",dataBytes:number,wordBits=8,includeAddress=true){
 integer(dataBytes,"dataBytes",0,1_000_000);integer(wordBits,"wordBits",1,32);
 if(protocol==="spi")return {protocol,clocks:Math.ceil(dataBytes*8/wordBits)*wordBits,overheadClocks:0,explanation:"SPI shifts payload bits on clock edges; chip-select and software setup overhead are not included."};
 const bytesOnBus=dataBytes+(includeAddress?1:0);
 return {protocol,clocks:bytesOnBus*9,overheadClocks:2,explanation:"I²C uses 8 data/address bits plus an ACK/NACK clock per byte; START/STOP timing is represented as two abstract overhead events, not SCL pulses."};
}
