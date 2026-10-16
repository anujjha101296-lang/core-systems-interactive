export type RtlExample = "mux2" | "full-adder" | "d-flop";
export type RtlInputs = { a?: number; b?: number; sel?: number; cin?: number; d?: number; en?: number; reset?: number; q?: number };
export type RtlResult = { outputs: Record<string, number>; explanation: string };

function bit(value: number | undefined, name: string): number {
  if (value !== 0 && value !== 1) throw new RangeError(`${name} must be 0 or 1`);
  return value;
}

/** Tiny reference models paired with the displayed RTL; not a Verilog compiler. */
export function simulateRtl(example: RtlExample, input: RtlInputs): RtlResult {
  if (example === "mux2") {
    const a = bit(input.a, "a"), b = bit(input.b, "b"), sel = bit(input.sel, "sel");
    return { outputs: { y: sel ? b : a }, explanation: `sel=${sel} selects ${sel ? "b" : "a"}; y=${sel ? b : a}.` };
  }
  if (example === "full-adder") {
    const a = bit(input.a, "a"), b = bit(input.b, "b"), cin = bit(input.cin, "cin");
    const sum = a ^ b ^ cin, cout = (a & b) | (a & cin) | (b & cin);
    return { outputs: { sum, cout }, explanation: `The three input bits total ${a + b + cin}; sum is the low bit (${sum}) and carry-out is the high bit (${cout}).` };
  }
  if (example === "d-flop") {
    const d = bit(input.d, "d"), en = bit(input.en, "en"), reset = bit(input.reset, "reset"), q = bit(input.q, "q");
    const nextQ = reset ? 0 : en ? d : q;
    return { outputs: { qNext: nextQ }, explanation: reset ? "Synchronous reset is sampled at the active clock edge and has priority." : en ? "Enable is high, so the next active edge captures d." : "Enable is low, so the register holds its previous value." };
  }
  throw new RangeError("Unknown RTL example");
}

export const rtlSnippets: Record<RtlExample, string> = {
  mux2: `module mux2(input logic a, b, sel, output logic y);
  always_comb begin
    if (sel) y = b;
    else     y = a;
  end
endmodule`,
  "full-adder": `module full_adder(
  input logic a, b, cin,
  output logic sum, cout
);
  assign sum  = a ^ b ^ cin;
  assign cout = (a & b) | (a & cin) | (b & cin);
endmodule`,
  "d-flop": `module enabled_dff(
  input logic clk, rst, en, d,
  output logic q
);
  always_ff @(posedge clk) begin
    if (rst)      q <= 1'b0;
    else if (en)  q <= d;
  end
endmodule`,
};
