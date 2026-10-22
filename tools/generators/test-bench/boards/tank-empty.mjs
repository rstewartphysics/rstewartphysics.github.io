// S5 · Tank empty warning (BENCH-PLAN §4). The engine's board (not-gate-led)
// has IN on a terminal block; the bench has a slide switch on the board
// standing in for the float switch, so this is its own layout.
//
// The input panel of guard-start.mjs: SW1's middle pin on the +5 V track B,
// pin 2 on track A with R2 down to track D (linked to 0 V), the yellow link
// down to pin 1. IC1 is a 74HC04: pin 2 drives R1 and LED1 below the 0 V
// rail. The cut F11 is the one that keeps pin 1 off pin 14's +5 V.

const L = (a, b, colour) => ({ a, b, colour });

export const board = {
  id: "tank-empty",
  title: "Tank empty warning",
  components: [
    { id: "+5V", footprint: "term-1", name: "+5 V supply", pos: true },
    { id: "0V", footprint: "term-1", name: "0 V supply", neg: true },
    { id: "SW1", footprint: "spdt-3", name: "SW1 slide switch: float switch" },
    { id: "IC1", footprint: "dip-14", part: "7404", name: "IC1 74HC04 hex inverter" },
    { id: "R1", footprint: "res-4", name: "R1 (270 Ω)" },
    { id: "R2", footprint: "res-4", name: "R2 (10 kΩ) pull-down on IN" },
    { id: "LED1", footprint: "led-2", name: "LED1 red: tank empty", colour: "red" }
  ],
  target: [
    ["+5V.1", "IC1.14", "SW1.c"],
    ["0V.1", "IC1.7", "LED1.k", "R2.2"],
    ["SW1.2", "R2.1", "IC1.1"],
    ["IC1.2", "R1.1"],
    ["R1.2", "LED1.a"]
  ],
  dontcare: ["SW1.1", "IC1.3", "IC1.4", "IC1.5", "IC1.6", "IC1.8", "IC1.9", "IC1.10", "IC1.11", "IC1.12", "IC1.13"],
  layouts: {
    strip: { board: "34-0411", reference: {
      cuts: ["F11", "G11", "H11", "I11", "J11", "K11", "L11"],
      placements: [
        { id: "+5V", footprint: "term-1", at: "B36" },
        { id: "0V", footprint: "term-1", at: "M2" },
        { id: "SW1", footprint: "spdt-3", at: "A2", rot: 270 },   // 2 A2, middle B2, 1 C2
        { id: "R2", footprint: "res-4", at: "A3", rot: 90 },      // A3 to D3
        { id: "IC1", footprint: "dip-14", at: "F10" },
        { id: "R1", footprint: "res-4", at: "N5", rot: 90 },      // N5 to Q5
        { id: "LED1", footprint: "led-2", at: "Q7", rot: 90 }     // anode Q7, cathode R7
      ],
      links: [
        L("A1", "F1", "yellow"),    // IN -> pin 1
        L("D20", "M20", "black"),   // the pull-down's track to the 0 V rail
        L("B19", "F19", "red"),     // +5 V -> pin 14
        L("H7", "M7", "black"), L("J8", "M8", "black"), L("L9", "M9", "black"),   // spare 3, 5; pin 7
        L("G14", "M14", "black"), L("I15", "M15", "black"), L("K16", "M16", "black"),   // spare 13, 11, 9
        L("G3", "N3", "orange"),    // pin 2 -> R1
        L("R4", "M4", "black")      // LED1 cathode -> 0 V
      ],
      testpoints: [{ id: "T1", at: "B34" }, { id: "T2", at: "M23" }, { id: "T3", at: "F7" }, { id: "T4", at: "N9" }]
    } }
  },
  circuit(C, tp) {
    const TOP = 24, BOT = 300, Y = 150, XO = 250;
    const g = C.notGate(160, Y, { pins: ["1", "2"] });
    const a = g.a[0], o = g.out[0];
    return { w: 320, h: 324, groups: [
      C.rail(20, 302, TOP, { pos: true, label: "+5 V" }) + C.rail(20, 302, BOT),
      C.node(40, TOP) + C.wire([[40, TOP], [40, 42]], "sbd-pos") + C.sw(40, 60, { dir: "v", span: 36, label: "SW1" }) +
        C.wire([[40, 78], [40, Y], [a, Y]]) + C.node(76, Y) + C.wire([[76, Y], [76, 228]]) +
        C.res(76, 256, { dir: "v", span: 56, label: "R2", value: "10 kΩ", labelLeft: true }) +
        C.wire([[76, 284], [76, BOT]]) + C.node(76, BOT) +
        g.svg + C.text(162, 120, "IC1a 74HC04") +
        C.wire([[o, Y], [XO, Y], [XO, 176]]) +
        C.res(XO, 204, { dir: "v", span: 56, label: "R1", value: "270 Ω", labelLeft: true }) +
        C.wire([[XO, 232], [XO, 244]]) + C.led(XO, 260, { dir: "d", span: 32, label: "LED1" }) +
        C.wire([[XO, 276], [XO, BOT]]) + C.node(XO, BOT) +
        C.node(104, Y) + C.wire([[104, Y], [104, 124]]) +
        C.node(o + 12, Y) + C.wire([[o + 12, Y], [o + 12, 124]]),
      tp(282, TOP, "T1") + tp(282, BOT, "T2") + tp(104, 124, "T3") + tp(o + 12, 124, "T4")
    ] };
  }
};
