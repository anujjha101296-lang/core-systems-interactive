import type { Lesson } from "./types";
export const serialLesson:Lesson={
 slug:"serial-interfaces-uart-spi-i2c",track:"digital-logic",title:"Serial Interfaces: UART, SPI & I²C",
 short:"Build UART frames and compare how clocking, framing, wiring and acknowledgements shape serial communication.",
 flagship:true,
 question:"How can two digital systems exchange data reliably using only a few pins when they do not share the same internal timing?",
 problem:"Digital blocks often need to communicate with sensors, controllers, storage, or another processor. A protocol defines how bits are timed, framed, acknowledged, and associated with a sender or receiver. A logic-level wire alone does not tell a receiver where a byte starts or which clock edge samples a bit.",
 idea:"UART is asynchronous and frames characters with a start bit, data bits, optional parity, and stop bits. SPI is synchronous and commonly uses a clock, controller-to-peripheral data, peripheral-to-controller data, and chip select. I²C is a shared two-wire bus using open-drain signaling, addresses, and ACK/NACK bits. Each trades wiring, throughput, complexity and topology differently.",
 how:{text:"For UART, the receiver detects the start bit and samples data at configured baud timing; data is conventionally sent least-significant bit first. Parity adds a simple error-detection bit, while stop bits restore an idle-high interval. SPI samples or shifts on edges selected by clock polarity and phase. I²C places address/data bits on SDA while SCL clocks them, with a ninth ACK/NACK clock for each byte.",formula:"UART frame bits = 1 start + data bits + optional parity + stop bits\nUART time ≈ bytes × frame bits / baud\nSPI payload clocks ≈ payload bits\nI²C clocks ≈ 9 × (address bytes + data bytes)",example:"An 8-N-1 UART frame sends 8 payload bits using 10 bit times, so its ideal payload efficiency is 80%. I²C uses a ninth clock for ACK/NACK after each address or data byte; SPI typically has no per-byte acknowledgement bit, but requires chip-select and clock configuration."},
 lab:"serial",
 trace:[
  {label:"Choose the protocol contract",detail:"Decide whether the link is asynchronous or clocked, point-to-point or shared, and whether addressing or acknowledgement is required."},
  {label:"Frame UART characters",detail:"The line idles high; a low start bit begins a frame, data bits are sent LSB first, optional parity follows, and stop bits return the line high."},
  {label:"Set SPI clock mode",detail:"CPOL determines the idle clock level and CPHA determines which edge samples versus shifts data. Both endpoints must agree on mode and bit order."},
  {label:"Address I²C peripherals",detail:"A controller sends START, address and direction, then each byte is followed by ACK/NACK. SDA changes while SCL is high only for START/STOP conditions."},
  {label:"Budget throughput and errors",detail:"Calculate framing overhead, clock pulses and ideal transfer time, then account for real setup gaps, retries, clock stretching, arbitration and electrical constraints."}
 ],
 checks:[
  {id:"serial-uart-frame",kind:"numeric",prompt:"How many bit times are in an 8-N-1 UART frame?",answer:10,tolerance:0,hints:["Count start, eight data bits, no parity, and one stop bit."],explain:"1 start + 8 data + 1 stop = 10 bit times."},
  {id:"serial-uart-efficiency",kind:"numeric",prompt:"What is the ideal payload efficiency of an 8-N-1 UART frame?",answer:80,tolerance:0.01,unit:"%",hints:["Eight of ten bit times carry payload."],explain:"8/10 × 100 = 80%."},
  {id:"serial-i2c",kind:"numeric",prompt:"A one-byte I²C address phase plus two data bytes uses how many SCL pulses for the byte/ACK slots?",answer:27,tolerance:0,hints:["Three bytes each take eight bits and one ACK/NACK clock."],explain:"3 bytes × 9 clocks = 27 SCL pulses, excluding START/STOP timing."},
  {id:"serial-spi",kind:"mcq",prompt:"Which signal commonly selects a particular SPI peripheral?",options:["Chip select (CS)","UART parity","I²C ACK","Stop bit"],answer:0,hints:["A controller usually asserts a dedicated select line for the target."],explain:"SPI commonly uses a chip-select line to select a peripheral; exact polarity and sharing depend on the design."},
  {id:"serial-uart-parity",kind:"mcq",prompt:"What does a UART parity bit provide?",options:["Simple detection of some bit errors","Guaranteed correction of every error","A shared clock signal","Peripheral addressing"],answer:0,hints:["Parity checks the parity of the number of one bits."],explain:"Parity can detect some errors, such as an odd number of flipped bits, but cannot correct errors or detect every multi-bit corruption."},
  {id:"serial-i2c-lines",kind:"mcq",prompt:"Which pair forms the standard I²C bus?",options:["SDA and SCL","MOSI and MISO only","TX and RX only","CS and RESET"],answer:0,hints:["One line carries data and one carries the clock."],explain:"I²C uses Serial Data (SDA) and Serial Clock (SCL), typically with pull-up resistors for open-drain signaling."}
 ],
 deeper:[
  {title:"UART framing and clock tolerance",body:"UART endpoints agree on baud rate, data width, parity and stop-bit configuration. The receiver uses the start edge to establish sampling timing and must tolerate clock mismatch across a frame. Framing errors occur when the expected stop-bit level is absent; parity detects only some corruption."},
  {title:"SPI modes and full-duplex transfer",body:"SPI's CPOL sets the idle SCLK level and CPHA selects which edge captures data. Modes 0–3 combine these settings. MOSI and MISO can carry bits simultaneously, but a peripheral's command/response behavior may still make useful responses arrive only after command bits are sent."},
  {title:"I²C open-drain and acknowledgement",body:"Devices pull SDA/SCL low or release them; pull-up resistors establish the high level. This supports wired-AND arbitration and clock stretching, but rise time depends on pull-up resistance and bus capacitance. ACK/NACK is sampled on the ninth clock after each byte."},
  {title:"Throughput is more than clock rate",body:"UART framing reduces payload efficiency; SPI adds chip-select and command phases; I²C adds address and acknowledgement clocks. Real throughput also depends on software gaps, controller FIFOs, clock stretching, bus loading, retries, and the peripheral's internal conversion or processing time."},
  {title:"Electrical constraints and level shifting",body:"Protocol logic levels and electrical behavior must match the device. I²C uses open-drain lines and pull-ups; many SPI/UART signals are push-pull. Voltage compatibility, ground reference, maximum clock rate, cable capacitance, and level shifters matter in physical systems."},
  {title:"Verification with timing diagrams",body:"A testbench should verify start/stop conditions, bit order, sampling edge, ACK/NACK behavior, reset, and boundary payloads. RTL models should be checked against protocol timing and the target peripheral datasheet; the browser lab is a framing calculator, not a bus waveform simulator."}
 ],
 followups:[
  {q:"Why is UART called asynchronous?",a:"It has no shared clock wire; the receiver recovers timing from the start bit and agreed baud-rate settings."},
  {q:"Does SPI always transfer useful data in both directions?",a:"Bits shift in both directions on typical full-duplex SPI wiring, but the peripheral may send dummy or undefined data while receiving a command."},
  {q:"Why does I²C need pull-up resistors?",a:"Its lines are open-drain/open-collector style: devices pull low or release the line, and pull-ups create the high level."}
 ],
 tradeoff:{failure:"Assuming a protocol name alone guarantees matching timing, electrical levels, bit order, acknowledgement, or throughput.",tradeoff:"UART minimizes wiring but adds per-character framing; SPI is fast and simple but uses more signals and chip selects; I²C supports addressed multi-device buses with fewer wires but adds address/ACK overhead and open-drain electrical constraints."},
 numbers:[{label:"UART 8-N-1",value:"10 bit times / byte"},{label:"SPI",value:"clocked, often full duplex"},{label:"I²C",value:"8 bits + ACK/NACK clock"}],
 model:"I select a serial protocol from topology, pin budget, clocking, throughput and acknowledgement needs. I calculate framing/clock overhead, agree on timing and electrical conventions, and verify edge sampling, bit order, reset and error behavior against the device specification.",
 debug:{q:"UART bytes are corrupted only at high baud rates. What should you inspect?",a:"Check baud-rate mismatch and sampling tolerance, start-bit detection, clock accuracy, line integrity, voltage levels, receiver oversampling and whether the selected data/parity/stop configuration matches both endpoints."},
 rapid:["UART is asynchronous and uses start/data/optional parity/stop bits","UART data is commonly sent least-significant bit first","SPI uses SCLK and typically chip select, MOSI and MISO","CPOL sets idle clock level; CPHA selects sampling phase","I²C uses SDA/SCL and open-drain signaling","I²C has ACK/NACK clocks after bytes","Check electrical levels and timing as well as logic"],
 before:[{track:"digital-logic",slug:"rtl-verilog-foundations"},{track:"digital-logic",slug:"memory-fifos-rtl"}],
 derive:"Encode 0x53 in an 8-N-1 UART frame and calculate its ideal transfer time at 115200 baud. Compare the per-byte overhead with I²C's ACK clock and SPI's payload clock count.",
 keyIdea:"Serial protocols are timing and framing contracts: the receiver must know when to sample, which bits mean what, and how transfers are acknowledged.",
 commonMistake:"Comparing protocols by clock rate alone while ignoring framing, acknowledgement, electrical signaling and setup overhead.",
 interviewLadder:[
  {level:"definition",q:"What is the difference between UART and SPI clocking?",a:"UART recovers timing from start bits and agreed baud settings; SPI supplies a shared clock and uses its edges to shift/sample data."},
  {level:"mechanism",q:"What do CPOL and CPHA define?",a:"CPOL defines the idle SCLK level; CPHA selects which clock edge samples data relative to shifting."},
  {level:"trade-off",q:"Why choose I²C over SPI?",a:"I²C can address multiple peripherals over two shared wires, trading lower pin count for address/ACK overhead and open-drain bus constraints."},
  {level:"systems",q:"What makes a serial link reliable beyond correct RTL bits?",a:"Matched timing/configuration, electrical compatibility, correct reset/error behavior, and verification against the device's protocol specification."}
 ]
};
