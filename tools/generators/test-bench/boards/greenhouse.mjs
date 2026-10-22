// S3 · Greenhouse irrigation (BENCH-PLAN §4). The engine's board has the three
// inputs on terminal blocks; the bench has slide switches, so this is its own
// layout. The pump stays off the board on its 2-way block (teacher, 21 Oct, K2).
//
// The input panel of lift-interlock.mjs: SD and TK to gate a (pins 1, 2), EN
// to pin 5. Pin 6 drives R1 (1 kΩ) down to Q1's base (O). The metal can has
// its collector on N and its emitter on P; P is cut at P8, the emitter side
// linked to the 0 V rail, the far side fed +5 V for the pump block (N to P).

const L = (a, b, colour) => ({ a, b, colour });

export const board = {
  id: "greenhouse",
  title: "Greenhouse irrigation",
  components: [
    { id: "+5V", footprint: "term-1", name: "+5 V supply", pos: true },
    { id: "0V", footprint: "term-1", name: "0 V supply", neg: true },
    { id: "SD", footprint: "spdt-3", name: "SD slide switch: soil dry" },
    { id: "TK", footprint: "spdt-3", name: "TK slide switch: tank not empty" },
    { id: "EN", footprint: "spdt-3", name: "EN slide switch: system on" },
    { id: "IC1", footprint: "dip-14", part: "7408", name: "IC1 74HC08 quad 2-input AND" },
    { id: "R1", footprint: "res-5", name: "R1 (1 kΩ)" },
    { id: "R2", footprint: "res-4", name: "R2 (10 kΩ) pull-down on SD" },
    { id: "R3", footprint: "res-4", name: "R3 (10 kΩ) pull-down on TK" },
    { id: "R4", footprint: "res-4", name: "R4 (10 kΩ) pull-down on EN" },
    { id: "Q1", footprint: "npn-can", name: "Q1 BC548 (metal can)" },
    { id: "PUMP", footprint: "term-2", name: "PUMP, off the board" }
  ],
  target: [
    ["+5V.1", "IC1.14", "SD.c", "TK.c", "EN.c", "PUMP.2"],
    ["0V.1", "IC1.7", "Q1.e", "R2.2", "R3.2", "R4.2"],
    ["SD.2", "R2.1", "IC1.1"],
    ["TK.2", "R3.1", "IC1.2"],
    ["IC1.3", "IC1.4"],
    ["EN.2", "R4.1", "IC1.5"],
    ["IC1.6", "R1.1"],
    ["R1.2", "Q1.b"],
    ["Q1.c", "PUMP.1"]
  ],
  dontcare: ["SD.1", "TK.1", "EN.1", "IC1.8", "IC1.9", "IC1.10", "IC1.11", "IC1.12", "IC1.13"],
  layouts: {
    strip: { board: "34-0411", reference: {
      cuts: ["A4", "A8", "F11", "G11", "H11", "I11", "J11", "K11", "L11", "P8"],
      placements: [
        { id: "+5V", footprint: "term-1", at: "B36" },
        { id: "0V", footprint: "term-1", at: "M2" },
        { id: "EN", footprint: "spdt-3", at: "A2", rot: 270 },
        { id: "R4", footprint: "res-4", at: "A3", rot: 90 },
        { id: "SD", footprint: "spdt-3", at: "A6", rot: 270 },
        { id: "R2", footprint: "res-4", at: "A7", rot: 90 },
        { id: "TK", footprint: "spdt-3", at: "A10", rot: 270 },
        { id: "R3", footprint: "res-4", at: "A11", rot: 90 },
        { id: "IC1", footprint: "dip-14", at: "F10" },
        { id: "R1", footprint: "res-5", at: "K3", rot: 90 },      // K3 (pin 6) to O3
        { id: "Q1", footprint: "npn-can", at: "N6" },             // c N6, b O7, e P6
        { id: "PUMP", footprint: "term-2", at: "N10", rot: 90 }   // N10 and P10
      ],
      links: [
        L("A1", "J1", "blue"),      // EN -> pin 5
        L("A5", "F5", "yellow"),    // SD -> pin 1
        L("A9", "G9", "green"),     // TK -> pin 2
        L("D20", "M20", "black"),   // the pull-downs' track to the 0 V rail
        L("B19", "F19", "red"),     // +5 V -> pin 14
        L("B21", "P21", "red"),     // +5 V -> the pump block
        L("P4", "M4", "black"),     // the emitter -> 0 V
        L("H8", "I8", "orange"),    // pin 3 -> pin 4
        L("L9", "M9", "black"),     // pin 7
        L("G14", "M14", "black"), L("H15", "M15", "black"),       // spare pins 13, 12
        L("J16", "M16", "black"), L("K17", "M17", "black")        // spare pins 10, 9
      ],
      testpoints: [
        { id: "T1", at: "B34" }, { id: "T2", at: "M23" }, { id: "T3", at: "H5" },
        { id: "T4", at: "K6" }, { id: "T5", at: "O13" }
      ]
    } }
  },
  circuit(C, tp) {
    const TOP = 24, BOT = 336, YS = 150, YT = 172, YE = 226, XQ = 500;
    const ga = C.andGate(256, 161, { pins: ["1", "2", "3"] });
    const gb = C.andGate(346, 215, { pins: ["4", "5", "6"] });
    const q = C.npn(490, 215, { label: "Q1" });   // b 456,215 · c 500,183 · e 500,247
    const input = (xs, xp, y, xin, name, r) =>
      C.node(xs, TOP) + C.wire([[xs, TOP], [xs, 42]], "sbd-pos") + C.sw(xs, 60, { dir: "v", span: 36, label: name }) +
      C.wire([[xs, 78], [xs, y], [xin, y]]) + C.node(xp, y) + C.wire([[xp, y], [xp, 264]]) +
      C.res(xp, 292, { dir: "v", span: 56, label: r, value: "10 kΩ", labelLeft: true }) +
      C.wire([[xp, 320], [xp, BOT]]) + C.node(xp, BOT);
    return { w: 560, h: 360, groups: [
      C.rail(20, 542, TOP, { pos: true, label: "+5 V" }) + C.rail(20, 542, BOT),
      input(40, 70, YS, 228, "SD", "R2") + input(110, 140, YT, 228, "TK", "R3") + input(180, 210, YE, 318, "EN", "R4") +
        ga.svg + gb.svg + C.text(250, 126, "IC1 74HC08") +
        C.wire([[300, 161], [312, 161], [312, 204], [318, 204]]) +
        C.wire([[390, 215], [394, 215]]) + C.res(422, 215, { span: 56, label: "R1", value: "1 kΩ" }) +
        C.wire([[450, 215], [456, 215]]) + q.svg +
        C.node(XQ, TOP) + C.wire([[XQ, TOP], [XQ, 76]], "sbd-pos") +
        C.motor(XQ, 104, { dir: "v", span: 56, letter: "M", label: "PUMP", labelSide: "l" }) +
        C.wire([[XQ, 132], [XQ, 183]]) + C.wire([[XQ, 247], [XQ, BOT]]) + C.node(XQ, BOT) +
        C.node(306, 161) + C.wire([[306, 161], [306, 134]]) +
        C.node(394, 215) + C.wire([[394, 215], [394, 186]]) +
        C.node(453, 215) + C.wire([[453, 215], [453, 186]]),
      tp(526, TOP, "T1") + tp(526, BOT, "T2") + tp(306, 134, "T3") + tp(394, 186, "T4") + tp(453, 186, "T5")
    ] };
  }
};
