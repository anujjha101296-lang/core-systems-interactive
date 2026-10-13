import type { Lesson } from "./types";

/** Digital Logic track — lessons 1–3. Original explanations; every numeric answer is hand-verified and unit-tested. */
export const dlLessons: Lesson[] = [
  {
    slug: "number-systems",
    track: "digital-logic",
    title: "Number Systems & Base Conversion",
    short: "Positional notation, radix, and moving between binary, octal, decimal and hex.",
    flagship: true,
    question: "A register dump shows `0x2F`, a permission is `0755`, and a packet field is `101101`. Are these three different kinds of number — or the same idea written three ways?",
    problem:
      "A debugger prints memory in hex, `chmod` takes octal, a datasheet lists bit fields in binary, and humans think in decimal. Misread the base and you are off by a lot: `10` means ten, two, eight or sixteen depending on the radix. Bugs like `0644` being parsed as decimal 644 (instead of octal 420) or `010` silently becoming 8 in older C/JavaScript code come straight from this.",
    idea:
      "Every base uses the same rule: **a digit's value is the digit times the radix raised to its position**. Base only changes how many symbols you have (b symbols: 0 … b−1) and the weight of each position. Because 8 = 2³ and 16 = 2⁴, octal and hex are just *grouped binary* — 3 bits per octal digit, 4 bits per hex digit — which is why hardware people use them.",
    how: {
      text:
        "**To decimal:** sum digit × bᶦ over positions i (rightmost is i = 0).\n\n**From decimal to base b:** repeatedly divide by b; the remainders, read bottom-up, are the digits.\n\n**Binary ↔ hex/octal:** group bits from the right into 4s (hex) or 3s (octal), padding with leading zeros, and translate each group independently. No decimal step needed.",
      formula: "N = Σ dᵢ · bⁱ        (i = 0 at the rightmost digit)\nmax n-digit value in base b = bⁿ − 1\ndigits needed for value N in base b = ⌊log_b N⌋ + 1",
      example:
        "Convert 156 to binary: 156/2 = 78 r0, 78/2 = 39 r0, 39/2 = 19 r1, 19/2 = 9 r1, 9/2 = 4 r1, 4/2 = 2 r0, 2/2 = 1 r0, 1/2 = 0 r1. Read upward: **1001 1100**. Group by 4: `1001` = 9, `1100` = C → **0x9C**. Check: 9·16 + 12 = 156 ✓.",
    },
    lab: "baseconv",
    trace: [
      { label: "Identify the radix", detail: "Read the prefix or context: 0x → 16, leading 0 / 0o → 8, 0b → 2, otherwise decimal." },
      { label: "Weight each digit", detail: "Multiply each digit by bᶦ where i counts from 0 at the right." },
      { label: "Sum to get the value", detail: "The value is independent of base — only its spelling changes." },
      { label: "Re-spell in the target base", detail: "Divide repeatedly (decimal → b) or regroup bits (binary ↔ octal/hex)." },
    ],
    checks: [
      { id: "dl1-hex-dec", kind: "numeric", prompt: "What is `0x2F` in decimal?", answer: 47, tolerance: 0, hints: ["Rightmost hex digit has weight 16⁰ = 1, the next has 16¹ = 16.", "F = 15."], explain: "2·16 + 15·1 = 32 + 15 = **47**.", assumptions: "0x prefix means base 16.", sanity: "0x30 would be 48, so 0x2F must be one less." },
      { id: "dl1-dec-bin", kind: "typed", prompt: "Write decimal 156 as an 8-bit binary number (no spaces).", accept: ["10011100", "0b10011100", "1001 1100"], hints: ["The largest power of two ≤ 156 is 128.", "156 − 128 = 28 = 16 + 8 + 4."], explain: "156 = 128 + 16 + 8 + 4 → bits 7, 4, 3, 2 set → **10011100**." },
      { id: "dl1-bin-dec", kind: "numeric", prompt: "What is binary `101101` in decimal?", answer: 45, tolerance: 0, hints: ["Positions with a 1: 5, 3, 2, 0."], explain: "32 + 8 + 4 + 1 = **45**.", assumptions: "Unsigned binary.", sanity: "Six bits max out at 63; 45 is under that and odd because bit 0 is 1." },
      { id: "dl1-oct-bin", kind: "typed", prompt: "`chmod 755`: write octal 755 as a 9-bit binary string.", accept: ["111101101", "111 101 101"], hints: ["Each octal digit is exactly 3 bits.", "7 = 111, 5 = 101."], explain: "7 → 111, 5 → 101, 5 → 101 → **111 101 101**: rwx for owner, r-x for group and others." },
      { id: "dl1-hexdigits", kind: "mcq", prompt: "How many hex digits are needed to print every 32-bit value?", options: ["4", "8", "10", "32"], answer: 1, hints: ["One hex digit = 4 bits."], explain: "32 / 4 = **8** hex digits, e.g. 0xFFFFFFFF." },
      { id: "dl1-max", kind: "numeric", prompt: "What is the largest value representable with 3 hex digits?", answer: 4095, tolerance: 0, hints: ["Max n-digit value in base b is bⁿ − 1."], explain: "16³ − 1 = 4096 − 1 = **4095** (0xFFF).", assumptions: "Unsigned, digits 0–F.", sanity: "3 hex digits = 12 bits, and 2¹² − 1 = 4095." },
    ],
    deeper: [
      { title: "Why programmers prefer hex over octal today", body: "Bytes are 8 bits, and 8 divides evenly by 4 but not by 3. So a byte is always exactly two hex digits, while octal digits straddle byte boundaries. Octal survives where fields are 3 bits wide — Unix permission triplets are the classic case." },
      { title: "Fractions in other bases", body: "For the fractional part, multiply by b repeatedly and take the integer parts top-down. 0.625 × 2 = 1.25 → 1, 0.25 × 2 = 0.5 → 0, 0.5 × 2 = 1.0 → 1, so 0.625 = 0.101₂. Some fractions that are finite in decimal (0.1) never terminate in binary — that is the root of IEEE-754 rounding (lesson 3)." },
      { title: "If you don't know in the interview", body: "Say so, then derive: write the positional formula N = Σ dᵢbⁱ, do a tiny example (binary 101 = 5) out loud, and apply the same rule to the asked number. Interviewers score the derivation more than recall." },
    ],
    followups: [
      { q: "Why does a hex digit map to exactly 4 bits?", a: "Because 16 = 2⁴: the 16 hex symbols correspond one-to-one with the 16 patterns of 4 bits, so conversion is a per-digit table lookup." },
      { q: "How many bits do you need to store the value 1000?", a: "⌊log₂ 1000⌋ + 1 = 9 + 1 = 10 bits (2⁹ = 512 ≤ 1000 < 1024 = 2¹⁰)." },
      { q: "Does the base change the value or only the representation?", a: "Only the representation. Arithmetic results are identical in any base; hardware just happens to store base 2." },
    ],
    tradeoff: {
      failure: "Parsing the wrong base: a leading-zero literal (`0644`) treated as octal by one tool and decimal by another, or `parseInt(\"08\")` behaving differently across runtimes. Permissions, ports or IDs end up silently wrong.",
      tradeoff: "Binary is exact and maps to hardware but is long and error-prone for humans; hex is compact and byte-aligned but hides individual bits; decimal is natural for people but needs real conversion work to relate to bit fields.",
    },
    numbers: [{ label: "Bits per hex digit", value: "4" }, { label: "Bits per octal digit", value: "3" }, { label: "Hex digits in 32 bits", value: "8" }, { label: "2¹⁰", value: "1024" }],
    model: "A number is a value; a base is a spelling. In radix b, each digit is multiplied by b to the power of its position. To convert to decimal I sum those weighted digits; to go from decimal to base b I divide repeatedly and read remainders bottom-up. Octal and hex are grouped binary — 3 and 4 bits per digit — so I convert those by regrouping bits rather than going through decimal.",
    debug: { q: "A deploy script sets file mode with `mode = 644` and files end up with odd permissions. What would you check?", a: "Whether the value is interpreted as decimal 644 instead of octal 0644 (= 420 decimal). Print the mode in octal, and pass `0o644` or the string form explicitly." },
    rapid: ["0xFF = 255", "0b1010 = 10", "Octal 17 = 15", "2¹⁶ = 65,536", "Hex digit = 4 bits", "Byte = 2 hex digits", "0x10 = 16", "Max of n bits unsigned = 2ⁿ − 1"],
    after: [{ track: "digital-logic", slug: "twos-complement" }],
    derive: "Without memorising, show that binary 1111 = 2⁴ − 1. Hint: add 1 and watch every bit carry.",
    keyIdea: "Value = Σ digit × radix^position. Octal and hex are binary grouped by 3 and 4 bits.",
    commonMistake: "Reading remainders top-down instead of bottom-up when dividing, or grouping bits from the left instead of the right.",
    interviewLadder: [
      { level: "definition", q: "What is a radix?", a: "The number of distinct digit symbols in a positional system, and the multiplier between adjacent positions." },
      { level: "mechanism", q: "Convert 0x9C to binary and decimal.", a: "9 → 1001, C → 1100, so 1001 1100₂; decimal 9·16 + 12 = 156." },
      { level: "trade-off", q: "Why do debuggers print memory in hex instead of decimal?", a: "Hex digits align with nibbles and bytes, so you can read bit fields and byte boundaries directly; decimal hides that structure." },
      { level: "systems", q: "Where does base confusion cause real outages?", a: "Octal file modes, leading-zero IDs, IPv4 parsers that accept octal octets (e.g. 010.0.0.1), and config files whose parser guesses the base." },
    ],
    bridge: { to: { track: "cn", slug: "cidr-subnetting", title: "CIDR & Subnetting" }, note: "Subnet masks are binary prefixes written in dotted decimal — /22 is 22 ones, which is 255.255.252.0." },
  },
  {
    slug: "twos-complement",
    track: "digital-logic",
    title: "Signed Numbers, Two's Complement & Overflow",
    short: "Range, negation, add/subtract, and why carry-out is not the same as signed overflow.",
    flagship: true,
    question: "An 8-bit counter adds 112 + 80 and the CPU reports *no carry* — yet the signed answer comes out as −64. What went wrong, and which flag would have told you?",
    problem:
      "The adder in a CPU does not know whether bits mean signed or unsigned. It produces one bit pattern and two different warning flags. If you check the carry flag for signed math (or the overflow flag for unsigned math), you miss real errors. The famous symptoms: a balance that wraps to a huge negative, `abs(INT_MIN)` still being negative, and loop counters that never terminate.",
    idea:
      "**Two's complement** gives the top bit a *negative* weight: in n bits, bit n−1 is worth −2ⁿ⁻¹ and every other bit is positive as usual. That single change means the same adder circuit works for signed and unsigned numbers, there is only one zero, and negation is \"invert all bits, then add 1\". Overflow is about whether the true result fits the *interpretation* you chose.",
    how: {
      text:
        "**Range (n bits):** −2ⁿ⁻¹ … 2ⁿ⁻¹ − 1. For 8 bits: −128 … 127.\n\n**Negate:** −x = ~x + 1. The most negative value has no positive partner, so negating it returns itself.\n\n**Add:** add the bit patterns, drop any carry beyond bit n−1.\n\n**Subtract:** a − b = a + (~b + 1).\n\n**Flags:** *C (carry)* = a carry left the top bit → unsigned result is wrong. *V (overflow)* = both operands had the same sign and the result's sign differs → signed result is wrong. Adding numbers of opposite sign can never overflow.",
      formula: "value = −bₙ₋₁·2ⁿ⁻¹ + Σ_{i<n−1} bᵢ·2ⁱ\n−x ≡ ~x + 1  (mod 2ⁿ)\nV = (sign a = sign b) ∧ (sign r ≠ sign a)\nV = carry into MSB ⊕ carry out of MSB",
      example:
        "8-bit 0x70 + 0x50: 0111 0000 + 0101 0000 = 1100 0000 (0xC0), no carry out. Unsigned: 112 + 80 = 192 ✓ (C = 0). Signed: two positives gave a negative pattern (−64), so **V = 1** — the true 192 does not fit in −128…127.",
    },
    lab: "twos",
    trace: [
      { label: "Fix the width n", detail: "Range and wrap-around depend entirely on the number of bits." },
      { label: "Encode operands", detail: "Negative x is stored as 2ⁿ − |x| (equivalently ~|x| + 1)." },
      { label: "Add patterns", detail: "One binary adder; discard the carry beyond bit n−1." },
      { label: "Read the right flag", detail: "C for unsigned interpretation, V for signed interpretation." },
    ],
    checks: [
      { id: "dl2-neg5", kind: "typed", prompt: "Write −5 as an 8-bit two's-complement pattern.", accept: ["11111011", "1111 1011", "0xfb", "fb"], hints: ["Start from +5 = 00000101.", "Invert every bit, then add 1."], explain: "+5 = 0000 0101 → invert 1111 1010 → +1 = **1111 1011** (0xFB). Check: 251 − 256 = −5." },
      { id: "dl2-min", kind: "numeric", prompt: "What is the minimum value of an 8-bit two's-complement integer?", answer: -128, tolerance: 0, hints: ["Range is −2ⁿ⁻¹ … 2ⁿ⁻¹ − 1."], explain: "−2⁷ = **−128** (pattern 1000 0000).", assumptions: "n = 8 bits, two's complement.", sanity: "The range is asymmetric: one more negative value than positive, because zero takes a non-negative slot." },
      { id: "dl2-decode", kind: "numeric", prompt: "Interpret `11101100` as an 8-bit signed (two's-complement) integer.", answer: -20, tolerance: 0, hints: ["Unsigned value first.", "If the top bit is 1, subtract 2⁸."], explain: "Unsigned 236; top bit set so 236 − 256 = **−20**. Alternatively invert+1: 0001 0100 = 20, so −20.", assumptions: "8-bit two's complement.", sanity: "Top bit 1 → must be negative; small magnitude because most high bits are 1." },
      { id: "dl2-flags1", kind: "msq", prompt: "8-bit `0x70 + 0x50`. Select every true statement.", options: ["Carry out C = 1", "Signed overflow V = 1", "Signed result reads as −64", "Unsigned result reads as 192"], answer: [1, 2, 3], hints: ["Compute the pattern: 0x70 + 0x50 = 0xC0.", "Did anything carry beyond bit 7?"], explain: "0xC0 with no carry out (C = 0). Unsigned 192 is correct; signed: positive + positive gave negative (−64) → V = 1." },
      { id: "dl2-flags2", kind: "mcq", prompt: "8-bit `0xF0 + 0x20` (−16 + 32 signed). Which flags are set?", options: ["C = 0, V = 0", "C = 1, V = 0", "C = 0, V = 1", "C = 1, V = 1"], answer: 1, hints: ["0xF0 + 0x20 = 0x110 — 9 bits.", "Opposite signs can never overflow signed."], explain: "Sum 0x110 → stored 0x10 = 16 with a carry out: **C = 1, V = 0**. Signed −16 + 32 = 16 is correct; unsigned 240 + 32 = 272 does not fit, hence C." },
      { id: "dl2-negmin", kind: "typed", prompt: "What 8-bit pattern do you get by negating `10000000` (−128) with invert-and-add-1?", accept: ["10000000", "1000 0000", "0x80", "80"], hints: ["Invert: 0111 1111.", "Add 1."], explain: "~1000 0000 = 0111 1111, +1 = **1000 0000** again. +128 is not representable, so −(−128) overflows back to −128. This is why `abs(INT_MIN)` is negative in C." },
    ],
    deeper: [
      { title: "Why not sign-magnitude or ones' complement?", body: "Both have two zeros (+0 and −0) and need different adder logic for signs. Two's complement uses the ordinary unsigned adder, has one zero, and makes subtraction just addition of the negation — cheaper hardware and simpler comparisons." },
      { title: "Sign extension", body: "To widen a signed value, copy the sign bit into the new high bits: 8-bit 1111 1011 (−5) becomes 16-bit 1111 1111 1111 1011, still −5. Zero-extending it instead would give 251. Mixing `movsx` and `movzx` (or signed/unsigned casts in C) is a classic bug source." },
      { title: "Overflow in languages", body: "In C, signed overflow is undefined behaviour — the compiler may assume it never happens and delete your overflow check. Unsigned arithmetic wraps mod 2ⁿ by definition. Java and Go wrap signed ints; Rust panics in debug builds and wraps in release unless you use checked_/wrapping_ methods." },
      { title: "If you don't know in the interview", body: "Fall back to 4 bits: list 0000…1111 as 0…7 and −8…−1, show −1 = 1111, and show that 0111 + 0001 = 1000 jumps from 7 to −8. Every rule (range, negation, overflow) is visible in that tiny table." },
    ],
    followups: [
      { q: "How can hardware detect signed overflow cheaply?", a: "XOR the carry into the most significant bit with the carry out of it. They differ exactly when the signed result is wrong." },
      { q: "Can adding a positive and a negative number overflow?", a: "No. The result's magnitude is at most the larger operand's magnitude, which already fits." },
      { q: "Why is the range asymmetric?", a: "There are 2ⁿ patterns; zero uses one of the 2ⁿ⁻¹ patterns with sign bit 0, leaving 2ⁿ⁻¹ − 1 positives against 2ⁿ⁻¹ negatives." },
    ],
    tradeoff: {
      failure: "Checking the carry flag for signed arithmetic (or the reverse); relying on C's signed overflow wrapping, which the optimiser may remove; storing money in a 32-bit signed int that overflows at about 2.1 billion minor units.",
      tradeoff: "Two's complement gives one adder for both interpretations and a single zero, at the cost of an asymmetric range and an extra flag (V) the programmer must check. Wider types delay overflow but cost memory and bandwidth.",
    },
    numbers: [{ label: "int8 range", value: "−128 … 127" }, { label: "int16 range", value: "−32,768 … 32,767" }, { label: "int32 max", value: "2,147,483,647" }, { label: "−1 in any width", value: "all ones" }],
    model: "Two's complement gives the top bit weight −2ⁿ⁻¹, so n bits cover −2ⁿ⁻¹ to 2ⁿ⁻¹ − 1, and negation is invert-plus-one. The same adder serves signed and unsigned values; only the flags differ. Carry-out tells you the unsigned result didn't fit; signed overflow happens when two operands of the same sign produce a result of the opposite sign — hardware computes it as carry-in XOR carry-out of the top bit.",
    debug: { q: "A loop `for (int8_t i = 0; i < 200; i++)` never terminates. Why?", a: "int8_t maxes at 127; i++ wraps to −128 (implementation-defined/UB in C), so i < 200 is always true. Fix the type or the bound." },
    rapid: ["−1 = all ones", "~x + 1 = −x", "int8 min = −128", "C flag → unsigned overflow", "V flag → signed overflow", "Opposite-sign add never overflows", "V = Cin(MSB) ⊕ Cout(MSB)", "Sign-extend signed, zero-extend unsigned"],
    before: [{ track: "digital-logic", slug: "number-systems" }],
    after: [{ track: "digital-logic", slug: "fixed-ieee754" }],
    derive: "Show why ~x + 1 = −x: note that x + ~x is all ones, i.e. 2ⁿ − 1, and rearrange modulo 2ⁿ.",
    keyIdea: "Same bits, two meanings. The top bit weighs −2ⁿ⁻¹; C flags unsigned overflow, V flags signed overflow.",
    commonMistake: "Treating carry-out as signed overflow. 0xF0 + 0x20 sets C but the signed result (16) is perfectly correct.",
    interviewLadder: [
      { level: "definition", q: "What is two's complement?", a: "A signed encoding where the most significant bit has negative weight −2ⁿ⁻¹; negation is invert all bits and add 1." },
      { level: "mechanism", q: "Compute 8-bit 100 + 50 and give C and V.", a: "0x64 + 0x32 = 0x96 (150 unsigned, −106 signed). No carry out, C = 0; positive + positive gave negative, V = 1." },
      { level: "trade-off", q: "Why did hardware standardise on two's complement?", a: "One adder for signed and unsigned, a single zero, subtraction as addition — at the cost of an asymmetric range." },
      { level: "systems", q: "How should a payment service guard against integer overflow?", a: "Use 64-bit integer minor units, checked arithmetic (or overflow-trapping builds), validate bounds at the API, and never rely on wrap-around." },
    ],
    bridge: { to: { track: "os", slug: "cas-aba", title: "CAS / ABA" }, note: "ABA fixes use a version counter next to the pointer — and that counter wraps modulo 2ⁿ, exactly like these integers." },
  },
  {
    slug: "fixed-ieee754",
    track: "digital-logic",
    title: "Fixed-Point & IEEE-754 Single Precision",
    short: "Fractional fixed point, sign/exponent/fraction, bias 127, normalise, encode and decode.",
    flagship: true,
    question: "Why does `0.1 + 0.2` print `0.30000000000000004`, and how is a number like −6.5 actually laid out in 32 bits?",
    problem:
      "Integers can't hold 6.5, and a fixed number of fraction bits can't span both 10⁻³⁰ and 10³⁰. Systems that ignore how reals are stored produce totals that drift by a cent, equality checks that fail, and sensors that silently lose precision at large magnitudes.",
    idea:
      "**Fixed point** puts the binary point at a fixed place: Qm.n means m integer bits and n fraction bits, so every value is an integer scaled by 2⁻ⁿ — uniform spacing, limited range. **Floating point** stores scientific notation in base 2: a sign, an exponent that moves the point, and a fraction of significant bits. Spacing grows with magnitude, which buys enormous range at constant *relative* precision.",
    how: {
      text:
        "**IEEE-754 single (32 bits):** 1 sign bit · 8 exponent bits · 23 fraction bits.\n\n**Encode:** (1) write |x| in binary; (2) normalise to 1.f × 2ᵉ; (3) store exponent field E = e + 127 (the *bias*); (4) store the bits after the leading 1 as the fraction (the leading 1 is implicit); (5) sign bit 1 if negative.\n\n**Decode (normal, 1 ≤ E ≤ 254):** value = (−1)ˢ × 1.f × 2^(E−127).\n\n**Special exponents:** E = 0 → zero / subnormal (0.f × 2⁻¹²⁶, no implicit 1). E = 255 → ±∞ if f = 0, NaN otherwise.",
      formula: "Qm.n value = integer / 2ⁿ\nfloat32 = (−1)ˢ · 1.f · 2^(E − 127)     1 ≤ E ≤ 254\nspacing near x ≈ 2^(e − 23)   →  ~7 decimal digits",
      example:
        "Encode −6.5: 6.5 = 110.1₂ = 1.101₂ × 2². Sign 1; E = 2 + 127 = 129 = 1000 0001; fraction 101 then 20 zeros. Bits: **1 10000001 10100000000000000000000** → group by 4: 1100 0000 1101 0000 … → **0xC0D00000**.",
    },
    lab: "ieee",
    trace: [
      { label: "Binary of |x|", detail: "Integer part by division, fraction part by repeated doubling." },
      { label: "Normalise", detail: "Shift the point until there is a single leading 1: 1.f × 2ᵉ." },
      { label: "Bias the exponent", detail: "E = e + 127 so the stored field is unsigned and sortable." },
      { label: "Pack s | E | f", detail: "Drop the implicit leading 1; round the fraction to 23 bits." },
    ],
    checks: [
      { id: "dl3-q44", kind: "typed", prompt: "Encode 5.75 in unsigned Q4.4 fixed point (8 bits, no spaces).", accept: ["01011100", "0101 1100", "0x5c", "5c"], hints: ["Integer part 5 in 4 bits.", ".75 = .5 + .25 = .11₂, padded to 4 fraction bits."], explain: "5 = 0101, .75 = .1100 → **0101 1100**. Check: 0x5C = 92, and 92 / 2⁴ = 5.75 ✓." },
      { id: "dl3-exp", kind: "numeric", prompt: "What is the stored (biased) exponent field E for 6.5 in IEEE-754 single precision?", answer: 129, tolerance: 0, hints: ["Normalise: 6.5 = 1.625 × 2^?", "Add the bias 127."], explain: "6.5 = 1.625 × 2², so E = 2 + 127 = **129** (1000 0001).", assumptions: "float32, bias 127, normal number.", sanity: "Values in [4, 8) all share e = 2, so E = 129." },
      { id: "dl3-enc", kind: "typed", prompt: "Give the 32-bit hex encoding of −6.5 as a float32 (8 hex digits).", accept: ["c0d00000", "0xc0d00000"], hints: ["Sign = 1, E = 129.", "Fraction bits after the implicit 1: 101000…"], explain: "1 | 10000001 | 1010…0 → 1100 0000 1101 0000 0000 … → **0xC0D00000**." },
      { id: "dl3-dec1", kind: "numeric", prompt: "Decode float32 `0x41200000`.", answer: 10, tolerance: 0, hints: ["0x41200000 = 0 10000010 0100…", "E = 130 → e = 3; significand 1.01₂ = 1.25."], explain: "s = 0, E = 130 → 2³, 1.25 × 8 = **10**.", assumptions: "Normal float32.", sanity: "10 lies in [8, 16), consistent with exponent 3." },
      { id: "dl3-one", kind: "numeric", prompt: "Decode float32 `0x3F800000`.", answer: 1, tolerance: 0, hints: ["0x3F8 → 0 01111111 0…"], explain: "E = 127 → 2⁰, fraction 0 → 1.0 × 1 = **1**.", assumptions: "Normal float32.", sanity: "A biased exponent equal to the bias means scale 1." },
      { id: "dl3-why01", kind: "mcq", prompt: "Why can't 0.1 be stored exactly in binary floating point?", options: ["The exponent range is too small", "1/10 has a factor of 5 in its denominator, so its binary expansion never terminates", "IEEE-754 rounds every value to 7 digits", "The sign bit wastes precision"], answer: 1, hints: ["A fraction terminates in base 2 only if its denominator is a power of 2."], explain: "0.1 = 1/(2·5). The factor 5 makes the binary expansion repeat (0.000110011…₂), so it must be rounded — hence 0.1 + 0.2 ≠ 0.3 exactly." },
      { id: "dl3-order", kind: "order", prompt: "Order the steps to encode a decimal value as float32.", items: ["Convert |x| to binary", "Normalise to 1.f × 2ᵉ", "Add bias: E = e + 127", "Drop the implicit 1 and round f to 23 bits", "Set the sign bit and pack s | E | f"], explain: "Binary first, then normalise to find e, bias it, keep only the fraction bits, and finally pack with the sign." },
    ],
    deeper: [
      { title: "Why a biased exponent instead of two's complement?", body: "With a bias, larger exponents are larger unsigned fields, so positive floats compare correctly as plain integers of their bit patterns. That makes sorting and hardware comparison cheap." },
      { title: "Subnormals, ∞ and NaN", body: "E = 0 drops the implicit 1 to fill the gap between 0 and the smallest normal (2⁻¹²⁶) — gradual underflow. E = 255 encodes ±∞ (f = 0) and NaN (f ≠ 0). NaN ≠ NaN, so `x != x` is a NaN test." },
      { title: "Money is not a float", body: "Payments store integer minor units (paise, cents) or decimal types. A float cannot represent 0.10 exactly, and summing many such values drifts. Fixed point — an integer scaled by 10⁻² — is exact for currency." },
      { title: "If you don't know in the interview", body: "Reconstruct from scientific notation: 6.5 = 1.625 × 2², explain sign / exponent / significand, then say the exponent is stored with an offset so it's unsigned. Even without remembering 127, that structure earns most of the credit." },
    ],
    followups: [
      { q: "Why is the leading 1 not stored?", a: "Every normalised binary number starts with 1, so storing it wastes a bit; leaving it implicit gives 24 bits of precision from 23 stored bits." },
      { q: "How many decimal digits does float32 give you?", a: "About 7: 24 significant bits × log₁₀2 ≈ 7.2." },
      { q: "When would you choose fixed point over float?", a: "When values have a known range and need exact, uniform resolution — currency, DSP on small MCUs without an FPU, deterministic simulations." },
    ],
    tradeoff: {
      failure: "Comparing floats with ==, summing currency in floats, losing integer precision above 2²⁴ in float32 (16,777,217 can't be stored), or a NaN silently propagating through a computation.",
      tradeoff: "Fixed point: exact, uniform spacing, cheap integer hardware — but tiny range and manual scaling. Floating point: huge dynamic range with constant relative error — but rounding, non-associative addition, and special values to handle.",
    },
    numbers: [{ label: "float32 layout", value: "1 · 8 · 23" }, { label: "Exponent bias", value: "127" }, { label: "Precision", value: "24 bits ≈ 7 digits" }, { label: "Largest exact integer", value: "2²⁴ = 16,777,216" }, { label: "1.0", value: "0x3F800000" }],
    model: "Fixed point is an integer with an implied binary point, giving uniform resolution over a small range. IEEE-754 single precision stores a sign bit, an 8-bit exponent with bias 127, and 23 fraction bits with an implicit leading 1, so value = (−1)ˢ × 1.f × 2^(E−127). To encode I convert to binary, normalise, bias the exponent and pack. Exponent all-zeros is zero/subnormal and all-ones is infinity/NaN. Because spacing grows with magnitude, floats give range at the cost of exactness — so money uses integers.",
    debug: { q: "A ledger report is off by ₹0.01 after summing a million transactions. What would you check?", a: "Whether amounts are stored or summed as floats. Switch to integer paise (or a decimal type), and reconcile using exact arithmetic." },
    rapid: ["float32 = 1 + 8 + 23 bits", "Bias = 127", "1.0f = 0x3F800000", "E = 255, f = 0 → ∞", "E = 255, f ≠ 0 → NaN", "E = 0 → zero/subnormal", "NaN ≠ NaN", "Money → integer minor units"],
    before: [{ track: "digital-logic", slug: "twos-complement" }],
    derive: "Derive the smallest positive normal float32: smallest normal E is 1, fraction 0, so the value is 1.0 × 2^(1 − 127) = 2⁻¹²⁶.",
    keyIdea: "A float is binary scientific notation: sign · 1.fraction · 2^(E − 127). Fixed point is just a scaled integer.",
    commonMistake: "Forgetting the bias (storing e instead of e + 127) or storing the implicit leading 1 in the fraction field.",
    interviewLadder: [
      { level: "definition", q: "What fields make up a float32?", a: "Sign (1 bit), biased exponent (8 bits, bias 127), fraction (23 bits) with an implicit leading 1 for normal numbers." },
      { level: "mechanism", q: "Encode 10.0.", a: "10 = 1.01₂ × 2³, E = 130 = 1000 0010, fraction 0100…, sign 0 → 0x41200000." },
      { level: "trade-off", q: "Fixed point vs floating point?", a: "Fixed: exact uniform steps, limited range, cheap. Float: huge range with relative precision, but rounding and special cases." },
      { level: "systems", q: "Why must payment amounts never be floats?", a: "Decimal fractions like 0.10 are inexact in binary; sums drift and equality fails. Use integer minor units or decimal types, and exact rounding rules at boundaries." },
    ],
    bridge: { to: { track: "os", slug: "race-conditions", title: "Race conditions" }, note: "Floating-point addition isn't associative, so a parallel sum can change with thread interleaving — another reason ledgers use integer arithmetic." },
  },
  {
    slug: "boolean-gates",
    track: "digital-logic",
    title: "Boolean Algebra & Logic Gates",
    short: "AND, OR, NOT, XOR, NAND/NOR, truth tables, the algebraic laws, De Morgan, and canonical sum-of-products.",
    question: "Two engineers write `A'B + AB'` and `A ^ B` for the same circuit. Without building either, how do you *prove* they compute the same thing — and how few gates do you really need?",
    problem:
      "A condition like `if (!(isAdmin && isActive))` gets 'simplified' to `!isAdmin && !isActive` during a refactor, and suddenly inactive admins lose access checks. The bug is a wrong De Morgan step. Hardware has the same problem with more at stake: every extra gate costs area, power and delay, and every wrong simplification is a silicon bug.",
    idea:
      "A Boolean function is completely described by its **truth table**: one output bit for each of the 2ⁿ input combinations. Two expressions are equal exactly when their truth tables are equal. Boolean algebra is a set of laws for rewriting expressions without changing the table, so you can simplify, then build the result from gates. NAND alone (or NOR alone) can build every function, which is why it is called *universal*.",
    how: {
      text:
        "**Gates:** AND (1 only if all inputs are 1), OR (1 if any input is 1), NOT (inverts), XOR (1 if an odd number of inputs are 1), NAND = NOT AND, NOR = NOT OR, XNOR = NOT XOR.\n\n**Notation used here:** A' = NOT A, AB = A AND B, A + B = A OR B, A ⊕ B (typed `^`) = XOR. Precedence: NOT, then AND, then XOR, then OR.\n\n**Laws:** identity (A + 0 = A, A·1 = A), null (A + 1 = 1, A·0 = 0), idempotent (A + A = A), complement (A + A' = 1, A·A' = 0), involution (A'' = A), commutative, associative, distributive (A(B + C) = AB + AC **and** A + BC = (A + B)(A + C)), absorption (A + AB = A, A(A + B) = A), and **De Morgan**: (AB)' = A' + B', (A + B)' = A'B'.\n\n**Canonical SOP:** list the rows where F = 1 (minterms). Each becomes a product with every variable, complemented where the input is 0; OR them together. This always works, but is rarely minimal.",
      formula: "(A·B)' = A' + B'        (A + B)' = A'·B'\nA ⊕ B = A'B + AB'\nA + AB = A               A + A'B = A + B\nn inputs → 2ⁿ rows → 2^(2ⁿ) distinct functions",
      example:
        "Simplify F = AB + AB' + A'B.\n\n1. Factor the first two terms: AB + AB' = A(B + B') = A·1 = A.\n2. F = A + A'B.\n3. Use A + A'B = (A + A')(A + B) = A + B (distributive form of OR over AND).\n\n**F = A + B**: one OR gate instead of three ANDs, two inverters and an OR. Check with the table: F is 0 only when A = B = 0, which is exactly A + B ✓.",
    },
    lab: "boolean",
    trace: [
      { label: "Write the truth table", detail: "Enumerate all 2ⁿ input rows in binary order and compute the output for each." },
      { label: "Read off minterms", detail: "Rows with output 1 give the canonical sum-of-products." },
      { label: "Apply laws", detail: "Factor, use complement/absorption/De Morgan to remove terms and literals." },
      { label: "Verify", detail: "Recompute the table for the simplified expression; it must match on every row." },
    ],
    checks: [
      { id: "dl4-xor-table", kind: "typed", prompt: "Give the output column of A ⊕ B for rows AB = 00, 01, 10, 11 as four bits (e.g. 0001).", accept: ["0110"], hints: ["XOR is 1 when the inputs differ.", "Rows 01 and 10 differ."], explain: "00→0, 01→1, 10→1, 11→0, so **0110**." },
      { id: "dl4-demorgan", kind: "mcq", prompt: "Which expression equals `(A·B)'`?", options: ["A'·B'", "A' + B'", "A + B", "(A + B)'"], answer: 1, hints: ["De Morgan: break the bar, change the operator.", "Test A = 1, B = 0: (A·B)' = 1. Which options give 1?"], explain: "De Morgan: (AB)' = **A' + B'**. A'B' fails at A = 1, B = 0, where it gives 0 but (AB)' = 1." },
      { id: "dl4-simplify", kind: "mcq", prompt: "Simplify `AB + AB' + A'B`.", options: ["A", "B", "A + B", "A ⊕ B"], answer: 2, hints: ["AB + AB' = A(B + B').", "Then use A + A'B = A + B."], explain: "AB + AB' = A, and A + A'B = A + B. Answer: **A + B**." },
      { id: "dl4-functions", kind: "numeric", prompt: "How many distinct Boolean functions of 3 inputs exist?", answer: 256, tolerance: 0, hints: ["A 3-input truth table has 2³ = 8 rows.", "Each row's output can be chosen independently: 0 or 1."], explain: "8 rows, each output independently 0 or 1: 2⁸ = **256** functions.", assumptions: "Functions are counted by truth table, so different-looking expressions with the same table count once.", sanity: "For 1 input there are 2² = 4 functions: 0, 1, A, A'. The formula 2^(2ⁿ) gives 4 ✓." },
      { id: "dl4-minterms", kind: "typed", prompt: "For F = A'B + AB (variables A, B; A is the most significant bit), list the minterm indices where F = 1, comma-separated in ascending order.", accept: ["1,3", "1, 3", "m1,m3", "m1, m3"], hints: ["A'B is the row A = 0, B = 1, which is index 01₂.", "AB is row 11₂."], explain: "A'B → 01 = m1, AB → 11 = m3, so Σm(**1, 3**). That equals F = B, as the table shows." },
      { id: "dl4-nand", kind: "mcq", prompt: "How many 2-input NAND gates do you need to build NOT A?", options: ["1", "2", "3", "NOT can't be built from NAND"], answer: 0, hints: ["What is (A·A)'?"], explain: "Tie both inputs to A: (A·A)' = A'. **1 gate.** This is the first step in proving NAND is universal." },
      { id: "dl4-match", kind: "match", prompt: "Match each law to an example.", pairs: [["Absorption", "A + AB = A"], ["De Morgan", "(A + B)' = A'B'"], ["Complement", "A·A' = 0"], ["Distributive (OR over AND)", "A + BC = (A + B)(A + C)"]], hints: ["Complement involves a variable and its own inverse."], explain: "Absorption removes a redundant term, De Morgan swaps operator and bar, complement pairs a variable with its inverse, and this distributive form has no counterpart in ordinary arithmetic." },
    ],
    deeper: [
      { title: "Why NAND is universal", body: "NOT A = (AA)'. AND = NOT(NAND) = ((AB)')' using a second NAND as the inverter. OR follows from De Morgan: A + B = (A'B')', which is a NAND of the two inverted inputs (3 NANDs total). Since {AND, OR, NOT} can express every truth table through canonical SOP, NAND alone can too. NOR is universal by the same argument." },
      { title: "Duality", body: "Swap AND with OR and 0 with 1 in any valid law and you get another valid law. A + 0 = A becomes A·1 = A; A + BC = (A + B)(A + C) is the dual of A(B + C) = AB + AC." },
      { title: "Canonical SOP vs minimal form", body: "Canonical SOP is unique for a function but can be exponentially long. Finding a minimal two-level form is the job of Karnaugh maps (small n) and Quine–McCluskey or heuristic tools such as Espresso (larger n). That is the next lesson in this track." },
      { title: "Consensus theorem", body: "AB + A'C + BC = AB + A'C. The BC term is redundant: whenever B = C = 1, one of AB or A'C is already 1. Try it in the lab: compare the two forms." },
    ],
    followups: [
      { q: "How do you prove two Boolean expressions are equivalent?", a: "Either rewrite one into the other using the laws, or compare truth tables on all 2ⁿ rows. The table method always works for small n; for large n, tools use BDDs or SAT solvers on F ⊕ G, which is satisfiable exactly when the two differ." },
      { q: "Why do CMOS designs favour NAND/NOR over AND/OR?", a: "A static CMOS gate naturally inverts. NAND and NOR take 4 transistors for 2 inputs, while AND and OR need an extra inverter stage (6 transistors) and are slower." },
      { q: "What is XOR used for in hardware?", a: "The sum bit of an adder (A ⊕ B ⊕ Cin), parity and checksums, comparators (A XNOR B = equality), and the overflow test from the previous lesson: carry-in ⊕ carry-out of the MSB." },
    ],
    tradeoff: {
      failure: "Wrong De Morgan steps (negating the variables but not swapping the operator), assuming XOR is associative with OR, or dropping parentheses so that AND/OR precedence changes the meaning. In software, refactoring negated conditions without a truth-table check.",
      tradeoff: "A minimal two-level SOP gives few gate levels (low delay) but can need many gates. Multi-level factored logic uses fewer gates and less area but adds levels and delay. Real synthesis tools trade area, delay and power against each other.",
    },
    numbers: [{ label: "Rows for n inputs", value: "2ⁿ" }, { label: "Functions of n inputs", value: "2^(2ⁿ)" }, { label: "CMOS 2-input NAND", value: "4 transistors" }, { label: "OR from NANDs", value: "3 gates" }],
    model: "A Boolean function is defined by its truth table. Expressions are equivalent when the tables agree on every row. I simplify using the algebraic laws, especially complement, absorption and De Morgan, and then verify by recomputing the table. Canonical sum-of-products, one minterm per 1 row, can express any function, so {AND, OR, NOT} is complete. NAND alone is also complete because it can build NOT, AND and OR. CMOS prefers NAND and NOR because they are the natural single-stage gates.",
    debug: { q: "After a refactor, `if (!(a && b))` became `if (!a && !b)` and some requests that should be rejected now get through. How would you find the bug?", a: "Write the 4-row truth table for both conditions. They differ at a = 1, b = 0 and a = 0, b = 1, where the original is true but the new one is false. The correct De Morgan form is `!a || !b`. Add a test for each row." },
    rapid: ["(AB)' = A' + B'", "(A + B)' = A'B'", "A + AB = A", "A + A'B = A + B", "A ⊕ B = A'B + AB'", "NAND and NOR are universal", "n inputs → 2ⁿ rows", "Consensus: AB + A'C + BC = AB + A'C"],
    before: [{ track: "digital-logic", slug: "number-systems" }],
    derive: "Show A + A'B = A + B. Hint: apply the distributive law A + XY = (A + X)(A + Y) with X = A', Y = B.",
    keyIdea: "The truth table is the ground truth. Algebra is only a way of rewriting an expression without changing its table.",
    commonMistake: "Writing (AB)' = A'B'. De Morgan needs two changes: complement each variable *and* swap AND with OR.",
    interviewLadder: [
      { level: "definition", q: "What does XOR compute?", a: "1 when an odd number of inputs are 1. For two inputs, 1 when they differ: A'B + AB'." },
      { level: "mechanism", q: "Build OR from NAND gates only.", a: "Invert each input with a NAND (A NAND A = A'), then NAND the two results: (A'B')' = A + B by De Morgan. That takes 3 gates." },
      { level: "trade-off", q: "Two-level SOP or multi-level logic?", a: "Two-level is fast (two gate delays) but can blow up in gate count. Multi-level shares factors, using less area but more delay." },
      { level: "systems", q: "How would a tool check that an optimised circuit still matches the spec?", a: "Equivalence checking: build a miter F ⊕ G and ask a SAT solver whether it can ever be 1. If it can't, the circuits are equivalent. BDDs are another option." },
    ],
    bridge: { to: { track: "digital-logic", slug: "twos-complement", title: "Two's complement & overflow" }, note: "The signed-overflow flag V is just carry-in ⊕ carry-out of the top bit: one XOR gate." },
  },
  {
    slug: "karnaugh-maps",
    track: "digital-logic",
    title: "Karnaugh Maps (2–4 Variables)",
    short: "Gray-code maps, minterms/maxterms, grouping 1/2/4/8 cells, wrap-around, don't-cares, SOP vs POS, prime and essential prime implicants.",
    question: "F = Σm(0, 2, 5, 7, 8, 10, 13, 15) has eight 4-literal terms. Can you find a two-term equivalent by *looking* at it, and how do you know nothing shorter exists?",
    problem:
      "Algebraic simplification depends on spotting the right law in the right order, and it is easy to stop too early or to make a wrong step. A decoder for a 4-bit opcode written as canonical SOP needs eight 4-input ANDs. The minimal form needs two 2-input ANDs. You want a method that is mechanical, visual, and checkable.",
    idea:
      "A Karnaugh map is the truth table laid out as a grid whose rows and columns are in **Gray-code order** (00, 01, 11, 10). Any two cells that touch, including across the left/right and top/bottom edges, differ in exactly one variable. A rectangle of 2ᵏ cells that are all 1 (or don't-care) is a product term in which those k variables drop out, by the law XY + XY' = X. Simplifying means covering every 1 with the fewest, largest such rectangles.",
    how: {
      text:
        "**Layout (used in this lesson and the lab):** the index is the binary value of the variables, with A as the MSB. 2 variables: rows A, columns B. 3 variables: rows A, columns BC. 4 variables: rows AB, columns CD. Rows and columns both run 00, 01, 11, 10.\n\n**Minterms and maxterms:** minterm mᵢ is the product that is 1 only on row i (for example m5 = AB'C for three variables). Maxterm Mᵢ is the sum that is 0 only on row i (M5 = A' + B + C'). F = Σm(rows where F = 1) = ΠM(rows where F = 0).\n\n**Grouping rules:**\n1. A group is a rectangle of 1, 2, 4 or 8 cells (a power of two). The edges wrap, so the four corners of a 4-variable map form one group.\n2. Every cell in a group must be 1 or X. Never include a 0.\n3. Make each group as large as possible. A group that cannot grow is a **prime implicant**.\n4. Cover every 1 at least once. Overlapping groups are allowed.\n5. A prime implicant is **essential** if it is the only prime covering some 1. Take every essential prime first, then cover what is left with as few primes as possible.\n\n**Reading a group:** keep the variables that stay constant across the group: uncomplemented if constant 1, complemented if constant 0. A group of 2ᵏ cells in an n-variable map has n − k literals.\n\n**Don't-cares (X):** inputs that never occur, or whose output nobody reads. Use an X in a group if it makes the group larger. Never add a group just to cover an X.\n\n**POS:** group the 0s (with X) to get a minimal SOP for F', then apply De Morgan. Each group of 0s becomes a sum term in which a variable that is constant 0 appears uncomplemented.",
      formula: "Group of 2ᵏ cells in an n-variable map → product with n − k literals\nXY + XY' = X   (the adjacency step every group repeats)\nF = Σm(ones) = ΠM(zeros)\nGray order: 00, 01, 11, 10",
      example:
        "**Worked example 1:** F(A,B,C,D) = Σm(0, 2, 5, 7, 8, 10, 13, 15).\n\n1. m0, m2, m8 and m10 are the four corners (AB ∈ {00, 10}, CD ∈ {00, 10}). They form one group of 4, where B = 0 and D = 0 stay constant: **B'D'**.\n2. m5, m7, m13 and m15 form the centre 2×2 block (AB ∈ {01, 11}, CD ∈ {01, 11}), where B = 1 and D = 1: **BD**.\n3. F = B'D' + BD, which is B XNOR D. Both groups are essential, so this minimum is unique.\n\n**Worked example 2 (more than one answer):** F(A,B,C) = Σm(0, 1, 2, 5, 6, 7). Every prime is a pair: A'B', A'C', B'C, AC, BC', AB. Two different covers of 3 terms each are A'B' + BC' + AC and A'C' + B'C + AB. Both are minimal and both are correct. **No prime here is essential, and the minimum is not unique.**\n\n**Worked example 3 (don't-cares):** F(A,B,C,D) = Σm(1, 3, 7, 11, 15) + d(0, 2, 5). Using X at m0 and m2 makes the group A'B' (m0–m3). CD (m3, m7, m11, m15) is a group of 4. So F = A'B' + CD. Without the don't-cares you would need A'B'D + CD.",
    },
    lab: "kmap",
    trace: [
      { label: "Fill the map", detail: "Put 1 in each minterm cell, X in each don't-care and 0 elsewhere, using Gray-ordered row and column labels." },
      { label: "Find primes", detail: "For each 1, grow the largest power-of-two rectangle of 1/X cells that contains it, including wrap-around." },
      { label: "Take essentials", detail: "Any 1 covered by only one prime forces that prime into the answer." },
      { label: "Cover the rest", detail: "Choose the fewest remaining primes, then the fewest literals. There may be several equally good choices." },
      { label: "Verify", detail: "Evaluate the result on every non-don't-care row. It must match the original table." },
    ],
    checks: [
      { id: "dl5-gray", kind: "typed", prompt: "Give the 2-bit column order of a K-map as four codes separated by commas.", accept: ["00,01,11,10", "00, 01, 11, 10"], hints: ["Neighbouring columns may differ in only one bit.", "After 01 comes 11, not 10."], explain: "**00, 01, 11, 10.** Gray order makes physical neighbours differ in one bit, so adjacency on the map means a single-variable difference. 10 → 00 (wrap) also differs in one bit." },
      { id: "dl5-cell", kind: "numeric", prompt: "In a 4-variable map (rows AB, columns CD, Gray order), which minterm index is in row 3 (counting from 1), column 4?", answer: 14, tolerance: 0, hints: ["Row 3 is AB = 11. Column 4 is CD = 10.", "ABCD = 1110₂."], explain: "Row 3 → AB = 11, column 4 → CD = 10, so 1110₂ = **14**. In Gray order, row 3 is *not* 10₂.", assumptions: "A is the MSB; rows AB and columns CD both run 00, 01, 11, 10.", sanity: "Row 3, column 3 would be 1111 = 15, a neighbour differing only in D ✓." },
      { id: "dl5-corners", kind: "mcq", prompt: "F(A,B,C,D) = Σm(0, 2, 8, 10). Minimal SOP?", options: ["A'B'C'D' + AB'CD'", "B'D'", "B' + D'", "A'C' + AC"], answer: 1, hints: ["Find these four cells on the map: they are the four corners.", "Which two variables are constant across all four?"], explain: "The four corners form one wrap-around group of 4. B = 0 and D = 0 everywhere in it, so F = **B'D'**." },
      { id: "dl5-literals", kind: "numeric", prompt: "How many literals does a group of 4 cells in a 4-variable K-map produce?", answer: 2, tolerance: 0, hints: ["A group of 2ᵏ cells eliminates k variables."], explain: "4 = 2², so 2 variables drop out, leaving 4 − 2 = **2** literals.", assumptions: "The group is a valid rectangle in Gray-ordered coordinates.", sanity: "A group of 16 eliminates all 4 variables: F = 1 ✓." },
      { id: "dl5-invalid", kind: "msq", prompt: "Which of these are valid K-map groups? (4-variable map)", options: ["Three adjacent 1s in a row", "The four corner cells", "A 2×4 block of 1s", "Two diagonal cells m0 and m5", "An entire column of 1s"], answer: [1, 2, 4], hints: ["Size must be a power of two.", "Diagonal cells differ in more than one variable."], explain: "Groups must be power-of-two rectangles (wrap-around allowed). Three cells is not a power of two, and m0 (0000) and m5 (0101) differ in two bits, so they are not adjacent." },
      { id: "dl5-dc", kind: "typed", prompt: "F(A,B,C,D) = Σm(1, 3, 7, 11, 15) + d(0, 2, 5). Give the minimal SOP (use ' for NOT, + for OR).", accept: ["A'B' + CD", "CD + A'B'", "A'B'+CD", "CD+A'B'"], hints: ["m3, m7, m11, m15 form column CD = 11.", "m1 and m3 can join with don't-cares m0 and m2 to make a row group."], explain: "CD covers m3, m7, m11 and m15. A'B' covers m0–m3, using X at m0 and m2, which covers m1. F = **A'B' + CD**. The X at m5 is left unused, which is fine." },
      { id: "dl5-unique", kind: "scenario", prompt: "Two students minimise F(A,B,C) = Σm(0, 1, 2, 5, 6, 7) and get A'B' + BC' + AC and A'C' + B'C + AB. What is true?", options: ["Only one can be right: minimal forms are unique", "Both are minimal and equivalent", "Both are wrong: there is a 2-term answer", "The second is wrong because it uses AB"], answer: 1, hints: ["Check that each covers all six 1s.", "Is any single prime essential here?"], explain: "This is the cyclic case. All six primes are pairs, none is essential, and two different 3-term covers exist. **Minimal forms need not be unique**, only their cost is." },
      { id: "dl5-pos", kind: "mcq", prompt: "F(A,B,C) = ΠM(0, 1). What is the minimal POS?", options: ["(A + B)", "(A' + B')", "A'B'", "(A + B + C)(A + B + C')"], answer: 0, hints: ["M0 and M1 are adjacent (they differ in C).", "In the 0-group, A = 0 and B = 0; in POS those appear uncomplemented."], explain: "Zeros at m0 and m1 form a pair where A = B = 0, so F' = A'B', and F = (A'B')' = **(A + B)**. The last option is canonical, not minimal." },
    ],
    deeper: [
      { title: "Why Gray order, precisely", body: "Two cells may be grouped only if their minterms differ in exactly one variable, so XY + XY' = X applies. With binary order (00, 01, 10, 11), columns 01 and 10 would sit side by side while differing in two bits, and a visual group would be algebraically wrong. In Gray order, adjacency on the torus, including both pairs of edges, is exactly Hamming distance 1. The lab's `kAdjacent` test is literally 'XOR is a power of two'." },
      { title: "Prime vs essential prime implicants", body: "An implicant is any product that is 1 only where F is 1 or X. It is prime if removing any literal (doubling the group) would cover a 0. A prime is essential if some 1 is covered by it alone. Every minimal SOP is a sum of primes and must contain all essentials. After the essentials, choosing the rest is a set-cover problem, which can have ties (cyclic maps) and in general is NP-hard." },
      { title: "How the lab's minimiser works", body: "It runs Quine–McCluskey: start from every 1/X cell, repeatedly merge pairs that differ in one fixed bit, and keep terms that never merge. Those are the primes. It then does an exhaustive branch-and-bound search for every cover of the 1s with the fewest primes, breaking ties by literal count, and lists all tied covers. With at most 16 cells this is exact. Each answer is re-checked against the truth table on every non-don't-care row." },
      { title: "SOP vs POS: which to choose", body: "Minimise both and compare. SOP maps to AND–OR (NAND–NAND). POS maps to OR–AND (NOR–NOR). When F has few 0s, POS is often smaller. The two minimal forms can give different values on don't-care rows. That is allowed, since nobody depends on those outputs, but it means SOP and POS results with don't-cares are only equivalent on the specified rows." },
      { title: "Hazards", body: "Two adjacent 1s covered by different groups can cause a momentary glitch when the input moves between them. Adding the redundant consensus group (one that bridges them) removes the static-1 hazard. Minimal is not always the right goal for asynchronous logic." },
    ],
    followups: [
      { q: "Why must groups have size 1, 2, 4 or 8?", a: "Each merge applies XY + XY' = X, which halves the remaining variables' freedom and doubles the cell count. A 3-cell or 6-cell region is not the set of rows where some product of literals is 1." },
      { q: "When would you stop using K-maps?", a: "Beyond about 5–6 variables adjacency becomes hard to see. Use Quine–McCluskey (exact, exponential), Espresso (heuristic two-level), or multi-level synthesis with BDD/SAT-based equivalence checking." },
      { q: "Can the minimal SOP be non-unique? Give an example.", a: "Yes. Σm(0, 1, 2, 5, 6, 7) over three variables has six pair-primes, none essential, and two different 3-term minimal covers." },
      { q: "How do don't-cares help, and what is the risk?", a: "They let groups grow, so you get fewer literals. The risk is that if the 'impossible' input does occur (a reset glitch, a new opcode), the circuit's output there is whatever your grouping happened to choose." },
    ],
    tradeoff: {
      failure: "Grouping in binary order instead of Gray order, so a 'group' joins cells that differ in two variables. The expression looks simpler but is wrong on some rows. Also: forgetting wrap-around and missing the corner group, or assuming a minimal cover is unique.",
      tradeoff: "Fewer literals mean less area and power, but the minimal two-level form can be slower than a factored multi-level form, may contain hazards, and with don't-cares fixes behaviour on unspecified inputs arbitrarily.",
    },
    numbers: [
      { label: "Cells in an n-variable map", value: "2ⁿ (4, 8, 16)" },
      { label: "Literals in a 2ᵏ-cell group", value: "n − k" },
      { label: "Neighbours per cell (with wrap-around)", value: "n" },
    ],
    model: "A K-map is the truth table arranged in Gray-code order, so adjacent cells, including across the edges, differ in one variable. A power-of-two rectangle of 1s and don't-cares is a product with those varying variables removed. I find the prime implicants (maximal groups), take the essential ones, cover the remaining 1s with the fewest extra primes, and read off the SOP. For POS I group the 0s and apply De Morgan. Minimal covers can tie, so I state the cost rather than claim uniqueness, and I verify the result against the table on every specified row.",
    debug: { q: "A student's simplified decoder output fails on input 0110 even though their K-map 'looked right'. What do you check first?", a: "Check the axis order. If the columns were labelled 00, 01, 10, 11, cells 01 and 10 were grouped as neighbours even though they differ in two bits. Re-label in Gray order, regroup, then evaluate the new expression on all 16 rows against the original table, especially row 6." },
    rapid: ["Gray order: 00 01 11 10", "Edges wrap; 4 corners are one group (4-var)", "Group sizes: 1, 2, 4, 8, 16", "2ᵏ cells → n − k literals", "Prime = can't grow; essential = only cover of some 1", "Use X only to enlarge groups", "POS: group 0s, then De Morgan", "Minimal cover may not be unique", "Σm(ones) = ΠM(zeros)"],
    before: [{ track: "digital-logic", slug: "boolean-gates" }],
    after: [{ track: "digital-logic", slug: "combinational-blocks" }],
    derive: "Show that grouping m5 and m7 in a 3-variable map gives AC: write AB'C + ABC and factor.",
    keyIdea: "Adjacency on the map is exactly a one-variable difference, so every legal rectangle is one application, or repeated applications, of XY + XY' = X.",
    commonMistake: "Labelling axes in binary order (00, 01, 10, 11), or missing wrap-around groups. A second mistake is covering a don't-care with its own extra group.",
    interviewLadder: [
      { level: "definition", q: "What is a K-map?", a: "A truth table drawn in Gray-code order so that adjacent cells differ in one variable, which lets you simplify by grouping." },
      { level: "mechanism", q: "Why does a group of four 1s give a two-literal term?", a: "The four minterms share two fixed variables and take all four combinations of the other two. Applying XY + XY' = X twice removes both." },
      { level: "trade-off", q: "SOP or POS for a given function?", a: "Minimise both and pick the cheaper one for the target gates (NAND–NAND vs NOR–NOR). Consider hazards and how don't-cares are resolved." },
      { level: "systems", q: "How do real synthesis tools do this at scale?", a: "Two-level heuristics like Espresso, multi-level factoring, and technology mapping onto a cell library. Correctness is guaranteed by formal equivalence checking, not by eye." },
    ],
    bridge: { to: { track: "digital-logic", slug: "twos-complement", title: "Two's complement & overflow" }, note: "Try minimising the signed-overflow function of the sign bits (aₙ, bₙ, rₙ). The map gives a'b'r + abr', two essential primes, matching the 'same sign in, different sign out' rule." },
  },
  {
    slug: "combinational-blocks",
    track: "digital-logic",
    title: "Combinational Building Blocks & ALU",
    short: "Multiplexers, decoders, priority encoders, adders, subtractors, and arithmetic logic units.",
    flagship: true,
    question: "A CPU datapath must choose between 8 registers, decode a 6-bit opcode into 64 control signals, and execute ADD or SUB on 64-bit operands in a single clock cycle. What standard building blocks make this possible without wiring millions of raw gates by hand?",
    problem:
      "Raw NAND and NOR gates can synthesize any Boolean function in theory, but designing an entire 64-bit CPU out of discrete gates would be like writing a web browser entirely in raw machine instructions without functions or data structures. Gate counts explode, critical path delays are impossible to reason about, and identical subcircuits (like multi-bit selectors and adders) get reinvented with subtle wiring bugs.\n\nHardware engineers need standard, modular components with well-defined interfaces and known propagation delays: multiplexers for data routing, decoders and priority encoders for control logic, and adders/ALUs for computation.",
    idea:
      "Combinational logic has no memory: its outputs depend strictly on its current inputs after a propagation delay. Rather than starting from truth tables for every circuit, digital designers compose five modular archetypes:\n\n1. **Multiplexer (MUX)**: A data selector. An n-select-line MUX routes one of 2ⁿ inputs to a single output.\n2. **Demultiplexer (DEMUX)**: A data distributor. Routes one input to one of 2ⁿ outputs based on n select lines.\n3. **Decoder**: An n-to-2ⁿ minterm generator. Exactly one output line goes HIGH corresponding to the binary value of the n inputs. An n-to-2ⁿ decoder followed by an OR gate can implement ANY Boolean function.\n4. **Priority Encoder**: Compresses 2ⁿ request lines into an n-bit binary code, resolving ties when multiple inputs are asserted simultaneously (vital for interrupt controllers).\n5. **Full Adder & ALU**: 1-bit full adders cascaded into an n-bit ripple-carry or carry-lookahead chain. By conditionally inverting operand B and setting carry-in to 1, the exact same adder performs subtraction (A − B = A + ~B + 1). Wrapping this with a function-select MUX creates the Arithmetic Logic Unit (ALU).",
    how: {
      text:
        "**Multiplexer (MUX):** An n-to-1 MUX has n select bits and 2ⁿ data inputs. Equation for 2:1 MUX: Y = S'·D0 + S·D1. For 4:1 MUX: Y = S1'S0'·D0 + S1'S0·D1 + S1S0'·D2 + S1S0·D3. A 2ⁿ:1 MUX can implement any n+1 variable Boolean function directly by tying data inputs to 0, 1, or the remaining variable.\n\n**Decoder:** An n-to-2ⁿ decoder drives output line Yi = 1 when input binary code equals i (and enable pin EN = 1). Because each output corresponds to a unique minterm mᵢ, any function in canonical SOP F = Σm(...) is constructed simply by ORing the selected decoder outputs.\n\n**Priority Encoder:** When multiple input lines are active, outputs binary code for the highest-priority index plus an active-high Valid bit V. If inputs I3..I0 = 1010, output code is 11₂ = 3 because I3 dominates I1.\n\n**Full Adder & Ripple-Carry:**\n• Half Adder: S = A ⊕ B, Cout = A·B.\n• Full Adder: S = A ⊕ B ⊕ Cin, Cout = A·B + Cin·(A ⊕ B).\n• n-bit Ripple Carry Adder: chains n full adders. Total delay = n · t_carry.\n• Adder-Subtractor: B is XORed with control bit SUB. When SUB = 1, bits are inverted and Cin0 = 1, producing A + ~B + 1 = A − B.",
      formula:
        "2:1 MUX:        Y = S'D0 + SD1\n4:1 MUX:        Y = Σ_{i=0}^3 (m_i(S1,S0) · Di)\nn-to-2ⁿ Dec:    Yi = EN · m_i(A_{n-1}..A0)\nFull Adder:     S = A ⊕ B ⊕ Cin,  Cout = AB + Cin(A ⊕ B)\nRipple delay:   t_total = t_setup + n · t_carry_prop\nSubtractor:     B_eff = B ⊕ SUB,  Cin0 = SUB",
      example:
        "Implement Full Adder Sum and Carry using a 3-to-8 decoder:\n\n1. Sum S(A, B, Cin) = Σm(1, 2, 4, 7).\nConnect decoder output pins Y1, Y2, Y4, Y7 into a 4-input OR gate.\n\n2. Carry Cout(A, B, Cin) = Σm(3, 5, 6, 7).\nConnect decoder output pins Y3, Y5, Y6, Y7 into a second 4-input OR gate.\n\nResult: Complete 1-bit full adder built with one decoder and two OR gates — zero algebraic minimization needed!",
    },
    lab: "combo",
    trace: [
      { label: "Data selection (MUX)", detail: "Select lines S1,S0 decode which input data pin is steered to the output bus." },
      { label: "Opcode decoding", detail: "Decoder activates exactly 1 of 2ⁿ control lines; minterms ORed together trigger control signals." },
      { label: "Priority arbitration", detail: "Encoder resolves simultaneous device interrupt requests, passing the highest-priority ID to the CPU." },
      { label: "Carry propagation", detail: "Bit 0 generates sum and carry; carry ripples sequentially through bits 1, 2, and 3." },
      { label: "ALU status evaluation", detail: "ALU calculates result and evaluates flags: Zero (Z), Carry (C), Overflow (V), Negative (N)." },
    ],
    checks: [
      {
        id: "cb-mux-inputs",
        kind: "numeric",
        prompt: "How many select lines are required for a 64-to-1 multiplexer?",
        answer: 6,
        tolerance: 0,
        hints: ["A multiplexer with n select lines can select among 2ⁿ inputs.", "Solve 2ⁿ = 64."],
        explain: "2⁶ = 64, so **6** select lines (S5..S0) are needed to address 64 input lines.",
      },
      {
        id: "cb-dec-outputs",
        kind: "numeric",
        prompt: "A memory controller uses a 4-to-16 decoder. If Enable = 1 and inputs A3..A0 are binary 1011, which output pin Y_i is HIGH (give the integer index i)?",
        answer: 11,
        tolerance: 0,
        hints: ["Convert binary 1011 to decimal.", "A3 is MSB (weight 8), A2=0, A1=2, A0=1."],
        explain: "1011₂ = 8 + 2 + 1 = **11**. Output pin Y₁₁ is driven HIGH while all other 15 pins remain LOW.",
      },
      {
        id: "cb-fa-delay",
        kind: "numeric",
        prompt: "In a 32-bit ripple-carry adder, if each 1-bit full adder stage has a carry propagation delay of 1.2 ns, what is the total worst-case carry ripple delay in nanoseconds to produce C32?",
        answer: 38.4,
        tolerance: 0.1,
        unit: "ns",
        hints: ["The carry must sequentially ripple through all 32 stages.", "Multiply the number of stages by the delay per stage."],
        explain: "32 stages × 1.2 ns/stage = **38.4 ns**. This linear O(n) delay is why high-speed CPUs replace ripple-carry adders with carry-lookahead adders.",
      },
      {
        id: "cb-subtractor-cin",
        kind: "mcq",
        prompt: "In a combined adder-subtractor circuit, what must be fed into the carry-in (Cin) of stage 0 during subtraction (A − B)?",
        options: ["0", "1", "The sign bit of B", "Undefined"],
        answer: 1,
        hints: ["Remember two's complement: −B = ~B + 1.", "Inverting B gives ~B; where does the +1 come from?"],
        explain: "Two's complement subtraction is A − B = A + (~B) + 1. The XOR gates invert B to yield ~B, and setting Cin0 = **1** supplies the necessary +1.",
      },
      {
        id: "cb-penc-pri",
        kind: "typed",
        prompt: "In an 8-to-3 priority encoder where input 7 has highest priority, if inputs I = 01001100 (bits I7..I0 from left to right, so I6, I3, I2 are HIGH), what is the 3-bit binary output code?",
        accept: ["110", "0b110"],
        hints: ["Identify the highest active index among the set bits.", "Convert that index to 3-bit binary."],
        explain: "The active inputs are I6, I3, and I2. Because input 7 has highest priority, I6 dominates over I3 and I2. 6 in 3-bit binary is **110**.",
      },
      {
        id: "cb-alu-flags",
        kind: "msq",
        prompt: "A 4-bit ALU performs SUB on unsigned operands A = 5 (0101) and B = 8 (1000). Which condition flags will be asserted? (Select all that apply)",
        options: [
          "Zero flag (Z = 1)",
          "Negative flag (N = 1, MSB of result is 1)",
          "Carry out flag (C = 0, indicating borrow / unsigned underflow)",
          "Signed overflow flag (V = 1)",
        ],
        answer: [1, 2],
        hints: [
          "Compute 5 − 8 in 4-bit two's complement: 0101 + (~1000 + 1) = 0101 + 1000 = 1101 (13 unsigned, −3 signed).",
          "Check the MSB (bit 3), whether the result is 0, whether a carry out of bit 3 occurred, and whether signed overflow occurred.",
        ],
        explain: "5 − 8 = −3. In 4 bits: 0101 + 1000 = 1101₂ (13 unsigned, −3 signed). Result is nonzero so Z = 0. MSB is 1 so N = 1. No carry left bit 3 (sum 13 < 16), meaning C = 0 (borrow occurred). Positive minus negative yielded negative (−3), which fits comfortably within the 4-bit signed range [−8..7], so V = 0.",
      },
    ],
    deeper: [
      {
        title: "Carry-Lookahead Adders (CLA): Beating O(n) Ripple Delay",
        body: "A ripple-carry adder has O(n) delay because carry bits must propagate sequentially through every stage. A Carry-Lookahead Adder (CLA) solves this by defining Generate Gᵢ = Aᵢ·Bᵢ (stage will create a carry regardless of Cin) and Propagate Pᵢ = Aᵢ ⊕ Bᵢ (stage will pass incoming carry to Cout). Since C₁ = G₀ + P₀·C₀, C₂ = G₁ + P₁·G₀ + P₁·P₀·C₀, any carry can be computed in just 2 gate levels! By tree-hierarchies (Kogge–Stone, Brent–Kung), carry generation drops from O(n) to O(log n), enabling multi-gigahertz arithmetic.",
      },
      {
        title: "Shannon's Expansion & Universal MUX Synthesis",
        body: "Shannon's Expansion Theorem states that any Boolean function can be expressed as F(x₁, x₂, ..., xₙ) = x₁'·F(0, x₂, ...) + x₁·F(1, x₂, ...). This is mathematically identical to a 2:1 multiplexer where select S = x₁, input D0 = F(0, ...), and input D1 = F(1, ...). Consequently, an n-to-1 MUX can implement ANY n-variable function without extra gates, or an (n+1)-variable function by applying the remaining variable or its complement to the data inputs.",
      },
      {
        title: "Tri-State Buffers and Shared Internal Busses",
        body: "In a processor datapath with 32 registers, multiplexing 32 registers to the ALU requires massive wire routing. An alternative is a shared bus with tri-state buffers. A tri-state buffer has three states: 0, 1, and High-Impedance (Z, electrically disconnected). By ensuring only one register's output buffer is enabled onto the bus at any moment (controlled by a decoder), dozens of components share a single set of 64 wires.",
      },
      {
        title: "ALU Condition Codes in Instruction Set Architectures",
        body: "Branch instructions do not recompute arithmetic; they test hardware flags generated by the ALU's previous operation: Zero (Z, result is 0), Negative (N, MSB is 1), Carry (C, unsigned overflow/no-borrow), and Overflow (V, signed two's complement overflow). In RISC-V and ARM, BEQ checks Z=1, BNE checks Z=0, BLT checks N ⊕ V = 1 (signed less than), and BLTU checks C=0 (unsigned less than).",
      },
    ],
    followups: [
      {
        q: "Can you build an AND gate or an OR gate using only a 2:1 MUX without any extra inverters?",
        a: "Yes. For AND(A,B): set select S = A, data D0 = 0, D1 = B. When A = 0, Y = 0; when A = 1, Y = B. For OR(A,B): set select S = A, data D0 = B, D1 = 1. When A = 0, Y = B; when A = 1, Y = 1.",
      },
      {
        q: "What is the relationship between an n-to-2ⁿ decoder and a 1-to-2ⁿ demultiplexer?",
        a: "They are the exact same physical circuit. An n-to-2ⁿ decoder with an Enable pin (EN) acts as a 1-to-2ⁿ DEMUX if EN is treated as the Data Input and the decoder inputs are treated as the Select lines.",
      },
      {
        q: "Why does the adder-subtractor XOR operand B with SUB instead of using a dedicated subtractor?",
        a: "Hardware reuse. Two's complement negation is −B = ~B + 1. The XOR gate acts as a conditional inverter: when SUB = 0, B ⊕ 0 = B; when SUB = 1, B ⊕ 1 = ~B. Injecting SUB into Cin0 simultaneously adds the required +1. Thus, one adder performs both addition and subtraction with almost zero additional silicon area.",
      },
    ],
    tradeoff: {
      failure:
        "Using ripple-carry adders on high-frequency paths, leading to setup-time violations as the carry chain fails to settle before the clock edge; or failing to resolve priority ties in interrupt handlers, causing device starvation.",
      tradeoff:
        "Ripple-carry adders minimize silicon area and dynamic power at the expense of O(n) propagation delay. Carry-lookahead and parallel-prefix adders achieve O(log n) low latency for multi-gigahertz clocks, but at the cost of higher transistor counts, routing congestion, and standby leakage power.",
    },
    numbers: [
      { label: "2:1 MUX transmission gates", value: "4 transistors (vs 12 in static CMOS)" },
      { label: "Full adder gate delay (carry)", value: "~2 gate levels" },
      { label: "32-bit Ripple carry delay", value: "~64 gate levels" },
      { label: "32-bit CLA tree delay", value: "~8–10 gate levels" },
      { label: "Typical ALU operations", value: "8 to 16 distinct opcodes" },
    ],
    model:
      "Combinational building blocks abstract gate-level complexity into reusable functional units: multiplexers for data steering, decoders for minterm expansion, priority encoders for arbitration, and full adders for arithmetic. To build an ALU, we cascade 1-bit full adders into an adder-subtractor by XORing B with the SUB control bit and injecting Cin=1. A function-select multiplexer then picks between arithmetic, bitwise logic, and comparisons, outputting condition flags (Z, C, V, N) that drive processor branching.",
    debug: {
      q: "A 4-bit adder-subtractor calculates 7 − 2 and outputs 4 with carry-out set to 1. What is the bug?",
      a: "7 is 0111, 2 is 0010. During subtraction, B must be inverted (~2 = 1101) AND carry-in to bit 0 must be 1. If Cin was accidentally wired to 0 instead of 1, the adder computed 7 + ~2 + 0 = 0111 + 1101 = 10100 -> 4 with carry-out 1! The missing +1 is the classic two's complement subtraction bug.",
    },
    rapid: [
      "2:1 MUX = S'D0 + SD1",
      "n select lines → 2ⁿ inputs",
      "Decoder = minterm generator",
      "DEMUX = Decoder with Data as Enable",
      "Half adder: S=A⊕B, C=AB",
      "Full adder: S=A⊕B⊕Cin",
      "Subtractor: A + ~B + 1",
      "Flags: Z=Zero, C=Carry, V=Overflow, N=Negative",
    ],
    before: [{ track: "digital-logic", slug: "karnaugh-maps" }],
    derive:
      "Prove Shannon's expansion for a 2:1 MUX implementing OR(A,B): Let S = A. When A = 0, F(0,B) = B. When A = 1, F(1,B) = 1. Therefore A'·B + A·1 = A + B.",
    keyIdea:
      "High-level digital architectures are assembled from modular combinational primitives. Multiplexers steer data, decoders decode instructions, and full adders perform both addition and subtraction with one unified core.",
    commonMistake:
      "Forgetting to set Cin = 1 during subtraction in an adder-subtractor, resulting in A − B − 1 instead of A − B.",
    interviewLadder: [
      {
        level: "definition",
        q: "What is the difference between a multiplexer and a decoder?",
        a: "A multiplexer selects one of 2ⁿ data inputs to a single output using n select lines. A decoder converts an n-bit input code into activating exactly one of 2ⁿ separate output lines.",
      },
      {
        level: "mechanism",
        q: "How does an adder-subtractor perform subtraction without a dedicated subtractor circuit?",
        a: "It uses Two's Complement: A − B = A + (~B) + 1. It XORs operand B with a SUB control bit (inverting B when SUB=1) and feeds SUB into the carry-in of the bit-0 adder.",
      },
      {
        level: "trade-off",
        q: "Why not use ripple-carry adders in high-speed 64-bit CPU datapaths?",
        a: "The carry bit must sequentially propagate through all 64 full adders (O(n) delay). For gigahertz processors, carry-lookahead or Kogge-Stone parallel-prefix adders reduce latency to O(log n) at the cost of silicon area and routing density.",
      },
      {
        level: "systems",
        q: "How do ALU condition flags interact with CPU control logic?",
        a: "The ALU outputs flags like Zero (Z), Carry (C), Overflow (V), and Negative (N). Conditional branch instructions (such as BEQ, BNE, BLT in RISC-V or ARM) inspect these flags to make control-flow decisions without extra arithmetic instructions.",
      },
    ],
    bridge: {
      to: { track: "digital-logic", slug: "twos-complement", title: "Signed Numbers & Two's Complement" },
      note: "The adder-subtractor circuit is the exact physical hardware implementation of two's complement negation (~B + 1).",
    },
  },
];