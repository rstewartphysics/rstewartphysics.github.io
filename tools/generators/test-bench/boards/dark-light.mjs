// S2 · Dark-activated light (BENCH-PLAN §4). A bench board only.
//
// The LDR is on the board (teacher, 22 Oct 2026), as long as R1, so the fault
// board is the same board with the two trading places.
// +5 V on track B, 0 V on H. R1 runs B to E (the base), the LDR E to H. Q1's
// collector (D) takes the LED's current: +5 V on B, LED1 up to A, R2 down from
// A to D. The emitter (F) is linked to 0 V.

const L = (a, b, colour) => ({ a, b, colour });

export const board = {
  id: "dark-light",
  title: "Dark-activated light",
  components: [
    { id: "+5V", footprint: "term-1", name: "+5 V supply", pos: true },
    { id: "0V", footprint: "term-1", name: "0 V supply", neg: true },
    { id: "R1", footprint: "res-4", name: "R1 (10 kΩ)" },
    { id: "LDR", footprint: "ldr-4", name: "LDR (NORP12)" },
    { id: "Q1", footprint: "npn-can", name: "Q1 BC548 (metal can)" },
    { id: "R2", footprint: "res-4", name: "R2 (270 Ω)" },
    { id: "LED1", footprint: "led-2", name: "LED1 red", colour: "red" }
  ],
  target: [
    ["+5V.1", "R1.1", "LED1.a"],
    ["R1.2", "LDR.1", "Q1.b"],
    ["0V.1", "LDR.2", "Q1.e"],
    ["Q1.c", "R2.2"],
    ["LED1.k", "R2.1"]
  ],
  layouts: {
    strip: { board: "34-0410", reference: {
      cuts: [],
      placements: [
        { id: "+5V", footprint: "term-1", at: "B2" },
        { id: "0V", footprint: "term-1", at: "H2" },
        { id: "R1", footprint: "res-4", at: "B6", rot: 90 },      // B6 to E6
        { id: "LDR", footprint: "ldr-4", at: "E8", rot: 90 },     // E8 to H8
        { id: "Q1", footprint: "npn-can", at: "D12" },            // c D12, b E13, e F12
        { id: "LED1", footprint: "led-2", at: "A16", rot: 270 },  // cathode A16, anode B16
        { id: "R2", footprint: "res-4", at: "A18", rot: 90 }      // A18 to D18
      ],
      links: [L("F15", "H15", "black")],
      testpoints: [
        { id: "T1", at: "B23" }, { id: "T2", at: "H23" },
        { id: "T3", at: "E24" }, { id: "T4", at: "D21" }
      ]
    } }
  },
  circuit(C, tp) {
    const q = C.npn(200, 190, { label: "Q1 BC548" });   // b 166,190 · c 210,158 · e 210,222
    const TOP = 24, BOT = 280, XD = 90, XQ = 210;
    return { w: 300, h: 304, groups: [
      C.rail(26, 280, TOP, { pos: true, label: "+5 V" }) + C.rail(26, 280, BOT),
      C.node(XD, TOP) + C.wire([[XD, TOP], [XD, 72]], "sbd-pos") +
        C.res(XD, 100, { dir: "v", span: 56, label: "R1", value: "10 kΩ", labelLeft: true }) +
        C.wire([[XD, 128], [XD, 206]]) + C.node(XD, 190) + C.wire([[XD, 190], [166, 190]]) +
        C.ldr(XD, 234, { dir: "v", span: 56, label: "LDR" }) +
        C.wire([[XD, 262], [XD, BOT]]) + C.node(XD, BOT) +
        C.node(XQ, TOP) + C.wire([[XQ, TOP], [XQ, 44]], "sbd-pos") +
        C.led(XQ, 62, { dir: "d", span: 36, label: "LED1 red", labelSide: "r" }) +
        C.wire([[XQ, 80], [XQ, 96]]) +
        C.res(XQ, 120, { dir: "v", span: 48, label: "R2", value: "270 Ω", labelLeft: true }) +
        C.wire([[XQ, 144], [XQ, 158]]) + q.svg +
        C.wire([[XQ, 222], [XQ, BOT]]) + C.node(XQ, BOT) +
        C.node(132, 190) + C.wire([[132, 190], [132, 166]]) +
        C.node(XQ, 151) + C.wire([[XQ, 151], [262, 151]]),
      tp(256, TOP, "T1") + tp(256, BOT, "T2") + tp(132, 166, "T3") + tp(262, 151, "T4")
    ] };
  }
};
