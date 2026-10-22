// S4 · Guard and start button (BENCH-PLAN §4). The engine's board
// (and-gate-led) has A and B on terminal blocks; the bench has slide switches
// on the board (teacher, 19 Oct 2026, Q4 and V1), so this is its own layout.
//
// The input panel above the chip, the same on S3 to S6: track B is +5 V, each
// switch's middle pin on it; its pin 2 drives a strip of track A (cut between
// switches), held down by a 10 kΩ pull-down to track D, which is linked to the
// 0 V rail (M). A coloured link takes each input down to its chip pin.
// IC1 sits at F10 with the usual seven cuts. Pin 3 drives R1 and LED1 below
// the 0 V rail. Spare inputs go straight to 0 V.

const L = (a, b, colour) => ({ a, b, colour });

export const board = {
  id: "guard-start",
  title: "Guard and start button",
  components: [
    { id: "+5V", footprint: "term-1", name: "+5 V supply", pos: true },
    { id: "0V", footprint: "term-1", name: "0 V supply", neg: true },
    { id: "A", footprint: "spdt-3", name: "A slide switch: guard closed" },
    { id: "B", footprint: "spdt-3", name: "B slide switch: start pressed" },
    { id: "IC1", footprint: "dip-14", part: "7408", name: "IC1 74HC08 quad 2-input AND" },
    { id: "R1", footprint: "res-4", name: "R1 (270 Ω)" },
    { id: "R2", footprint: "res-4", name: "R2 (10 kΩ) pull-down on A" },
    { id: "R3", footprint: "res-4", name: "R3 (10 kΩ) pull-down on B" },
    { id: "LED1", footprint: "led-2", name: "LED1 red: run", colour: "red" }
  ],
  target: [
    ["+5V.1", "IC1.14", "A.c", "B.c"],
    ["0V.1", "IC1.7", "LED1.k", "R2.2", "R3.2"],
    ["A.2", "R2.1", "IC1.1"],
    ["B.2", "R3.1", "IC1.2"],
    ["IC1.3", "R1.1"],
    ["R1.2", "LED1.a"]
  ],
  dontcare: ["A.1", "B.1", "IC1.4", "IC1.5", "IC1.6", "IC1.8", "IC1.9", "IC1.10", "IC1.11", "IC1.12", "IC1.13"],
  layouts: {
    strip: { board: "34-0411", reference: {
      cuts: ["A4", "F11", "G11", "H11", "I11", "J11", "K11", "L11"],
      placements: [
        { id: "+5V", footprint: "term-1", at: "B36" },
        { id: "0V", footprint: "term-1", at: "M2" },
        { id: "A", footprint: "spdt-3", at: "A2", rot: 270 },     // 2 A2, middle B2, 1 C2
        { id: "R2", footprint: "res-4", at: "A3", rot: 90 },      // A3 to D3
        { id: "B", footprint: "spdt-3", at: "A6", rot: 270 },
        { id: "R3", footprint: "res-4", at: "A7", rot: 90 },
        { id: "IC1", footprint: "dip-14", at: "F10" },
        { id: "R1", footprint: "res-4", at: "N5", rot: 90 },      // N5 to Q5
        { id: "LED1", footprint: "led-2", at: "Q7", rot: 90 }     // anode Q7, cathode R7
      ],
      links: [
        L("A1", "F1", "yellow"),    // A -> pin 1
        L("A5", "G5", "green"),     // B -> pin 2
        L("D20", "M20", "black"),   // the pull-downs' track to the 0 V rail
        L("B19", "F19", "red"),     // +5 V -> pin 14
        L("L9", "M9", "black"),     // pin 7
        L("I6", "M6", "black"), L("J7", "M7", "black"),           // spare pins 4, 5
        L("G14", "M14", "black"), L("H15", "M15", "black"),       // spare pins 13, 12
        L("J16", "M16", "black"), L("K17", "M17", "black"),       // spare pins 10, 9
        L("H3", "N3", "orange"),    // pin 3 -> R1
        L("R4", "M4", "black")      // LED1 cathode -> 0 V
      ],
      testpoints: [{ id: "T1", at: "B34" }, { id: "T2", at: "M23" }, { id: "T3", at: "N9" }]
    } }
  },
  circuit(C, tp) {
    const TOP = 24, BOT = 316, YA = 150, YB = 172, XO = 290;
    const g = C.andGate(212, 161, { pins: ["1", "2", "3"] });   // in 184,150 · 184,172 · out 256,161
    const input = (xs, xp, y, name, r) =>
      C.node(xs, TOP) + C.wire([[xs, TOP], [xs, 42]], "sbd-pos") + C.sw(xs, 60, { dir: "v", span: 36, label: name }) +
      C.wire([[xs, 78], [xs, y], [184, y]]) + C.node(xp, y) + C.wire([[xp, y], [xp, 244]]) +
      C.res(xp, 272, { dir: "v", span: 56, label: r, value: "10 kΩ", labelLeft: true }) +
      C.wire([[xp, 300], [xp, BOT]]) + C.node(xp, BOT);
    return { w: 356, h: 340, groups: [
      C.rail(20, 340, TOP, { pos: true, label: "+5 V" }) + C.rail(20, 340, BOT),
      input(40, 76, YA, "A", "R2") + input(110, 146, YB, "B", "R3") +
        g.svg + C.text(214, 130, "IC1a 74HC08") +
        C.wire([[256, 161], [XO, 161], [XO, 186]]) +
        C.res(XO, 214, { dir: "v", span: 56, label: "R1", value: "270 Ω", labelLeft: true }) +
        C.wire([[XO, 242], [XO, 256]]) + C.led(XO, 272, { dir: "d", span: 32, label: "LED1" }) +
        C.wire([[XO, 288], [XO, BOT]]) + C.node(XO, BOT) +
        C.node(272, 161) + C.wire([[272, 161], [272, 134]]),
      tp(326, TOP, "T1") + tp(326, BOT, "T2") + tp(272, 134, "T3")
    ] };
  }
};
