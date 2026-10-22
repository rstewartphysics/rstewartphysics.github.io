// S1 · Buzzer switched by a transistor (BENCH-PLAN §4). The engine's own board
// (questions.js) has the switch and buzzer off the board on terminal blocks;
// the bench puts both on it (teacher, 19 Oct 2026, Q4), so this is its own layout.
//
// Track A +5 V, track I 0 V. The red link feeds the switch's middle pin (C);
// slid on, pin 2 (D, left of the cut) feeds R1 down to the base (G). The
// buzzer drops from A to D right of the cut, and the green link returns it to
// the collector (F). Lift that link and the meter goes in series with the buzzer.

const L = (a, b, colour) => ({ a, b, colour });

export const board = {
  id: "transistor-buzzer",
  title: "Buzzer switched by a transistor",
  components: [
    { id: "+5V", footprint: "term-1", name: "+5 V supply", pos: true },
    { id: "0V", footprint: "term-1", name: "0 V supply", neg: true },
    { id: "SW1", footprint: "spdt-3", name: "SW1 slide switch" },
    { id: "R1", footprint: "res-4", name: "R1 (1 kΩ)" },
    { id: "Q1", footprint: "npn-can", name: "Q1 BC548 (metal can)" },
    { id: "BUZ1", footprint: "buzzer-2", name: "BUZ1 buzzer" }
  ],
  target: [
    ["+5V.1", "SW1.c", "BUZ1.+"],
    ["SW1.2", "R1.1"],
    ["R1.2", "Q1.b"],
    ["Q1.c", "BUZ1.-"],
    ["0V.1", "Q1.e"]
  ],
  dontcare: ["SW1.1"],
  layouts: {
    strip: { board: "34-0410", reference: {
      cuts: ["D10"],
      placements: [
        { id: "+5V", footprint: "term-1", at: "A2" },
        { id: "0V", footprint: "term-1", at: "I2" },
        { id: "SW1", footprint: "spdt-3", at: "B4", rot: 90 },
        { id: "R1", footprint: "res-4", at: "D8", rot: 90 },
        { id: "Q1", footprint: "npn-can", at: "F12" },          // c F12, b G13, e H12
        { id: "BUZ1", footprint: "buzzer-2", at: "A16", rot: 90 }
      ],
      links: [L("A6", "C6", "red"), L("D20", "F20", "green"), L("H15", "I15", "black")],
      testpoints: [
        { id: "T1", at: "A23" }, { id: "T2", at: "I23" },
        { id: "T3", at: "G22" }, { id: "T4", at: "F18" }
      ]
    } }
  },
  circuit(C, tp) {
    const q = C.npn(164, 176, { label: "Q1 BC548" });   // b 130,176 · c 174,144 · e 174,208
    const TOP = 24, BOT = 262, XS = 86, XQ = 174;
    return { w: 300, h: 286, groups: [
      C.rail(26, 280, TOP, { pos: true, label: "+5 V" }) + C.rail(26, 280, BOT),
      C.node(XS, TOP) + C.node(XQ, TOP) +
        C.wire([[XS, TOP], [XS, 52]], "sbd-pos") + C.sw(XS, 70, { dir: "v", span: 36, label: "SW1" }) +
        C.wire([[XS, 88], [XS, 116]]) +
        C.res(XS, 144, { dir: "v", span: 56, label: "R1", value: "1 kΩ", labelLeft: true }) +
        C.wire([[XS, 172], [XS, 222], [130, 222], [130, 176]]) +
        C.wire([[XQ, TOP], [XQ, 62]], "sbd-pos") + C.sounder(XQ, 80, { dir: "v", span: 48, label: "BUZ1" }) +
        C.wire([[XQ, 95], [XQ, 144]]) + q.svg +
        C.wire([[XQ, 208], [XQ, BOT]]) + C.node(XQ, BOT) +
        C.node(130, 200) + C.wire([[130, 200], [108, 200], [108, 186]]) +
        C.node(XQ, 124) + C.wire([[XQ, 124], [236, 124]]),
      tp(250, TOP, "T1") + tp(250, BOT, "T2") + tp(108, 186, "T3") + tp(236, 124, "T4")
    ] };
  }
};
