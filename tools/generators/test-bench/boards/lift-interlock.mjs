// S6 · Lift door interlock (BENCH-PLAN §4). The engine's board has A, B and C
// on terminal blocks; the bench has slide switches, so this is its own layout.
//
// The input panel of guard-start.mjs, three switches wide. B and C go to gate
// a (pins 1 and 2), so their strips F and G lie side by side: the plan's
// solder bridge joins them (§4: "bridge two strips that do"). Gate a's output
// (pin 3) is linked to pin 4; A comes in on pin 5; pin 6 drives R1 and LED1.

const L = (a, b, colour) => ({ a, b, colour });

export const board = {
  id: "lift-interlock",
  title: "Lift door interlock",
  components: [
    { id: "+5V", footprint: "term-1", name: "+5 V supply", pos: true },
    { id: "0V", footprint: "term-1", name: "0 V supply", neg: true },
    { id: "A", footprint: "spdt-3", name: "A slide switch: door closed" },
    { id: "B", footprint: "spdt-3", name: "B slide switch: floor selected" },
    { id: "C", footprint: "spdt-3", name: "C slide switch: not overloaded" },
    { id: "IC1", footprint: "dip-14", part: "7408", name: "IC1 74HC08 quad 2-input AND" },
    { id: "R1", footprint: "res-4", name: "R1 (270 Ω)" },
    { id: "R2", footprint: "res-4", name: "R2 (10 kΩ) pull-down on B" },
    { id: "R3", footprint: "res-4", name: "R3 (10 kΩ) pull-down on C" },
    { id: "R4", footprint: "res-4", name: "R4 (10 kΩ) pull-down on A" },
    { id: "LED1", footprint: "led-2", name: "LED1 green: motor enable", colour: "green" }
  ],
  target: [
    ["+5V.1", "IC1.14", "A.c", "B.c", "C.c"],
    ["0V.1", "IC1.7", "LED1.k", "R2.2", "R3.2", "R4.2"],
    ["B.2", "R2.1", "IC1.1"],
    ["C.2", "R3.1", "IC1.2"],
    ["IC1.3", "IC1.4"],
    ["A.2", "R4.1", "IC1.5"],
    ["IC1.6", "R1.1"],
    ["R1.2", "LED1.a"]
  ],
  dontcare: ["A.1", "B.1", "C.1", "IC1.8", "IC1.9", "IC1.10", "IC1.11", "IC1.12", "IC1.13"],
  layouts: {
    strip: { board: "34-0411", reference: {
      cuts: ["A4", "A8", "F11", "G11", "H11", "I11", "J11", "K11", "L11"],
      placements: [
        { id: "+5V", footprint: "term-1", at: "B36" },
        { id: "0V", footprint: "term-1", at: "M2" },
        { id: "A", footprint: "spdt-3", at: "A2", rot: 270 },
        { id: "R4", footprint: "res-4", at: "A3", rot: 90 },
        { id: "B", footprint: "spdt-3", at: "A6", rot: 270 },
        { id: "R2", footprint: "res-4", at: "A7", rot: 90 },
        { id: "C", footprint: "spdt-3", at: "A10", rot: 270 },
        { id: "R3", footprint: "res-4", at: "A11", rot: 90 },
        { id: "IC1", footprint: "dip-14", at: "F10" },
        { id: "R1", footprint: "res-4", at: "K3", rot: 90 },      // K3 (pin 6) to N3
        { id: "LED1", footprint: "led-2", at: "N5", rot: 90 }     // anode N5, cathode O5
      ],
      links: [
        L("A1", "J1", "blue"),      // A -> pin 5
        L("A5", "F5", "yellow"),    // B -> pin 1
        L("A9", "G9", "green"),     // C -> pin 2
        L("D20", "M20", "black"),   // the pull-downs' track to the 0 V rail
        L("B19", "F19", "red"),     // +5 V -> pin 14
        L("H8", "I8", "orange"),    // pin 3 -> pin 4
        L("L9", "M9", "black"),     // pin 7
        L("G14", "M14", "black"), L("H15", "M15", "black"),       // spare pins 13, 12
        L("J16", "M16", "black"), L("K17", "M17", "black"),       // spare pins 10, 9
        L("O4", "M4", "black")      // LED1 cathode -> 0 V
      ],
      testpoints: [{ id: "T1", at: "B34" }, { id: "T2", at: "M23" }, { id: "T3", at: "H5" }, { id: "T4", at: "K6" }]
    } }
  },
  circuit(C, tp) {
    const TOP = 24, BOT = 336, YB = 150, YC = 172, YA = 226, XO = 410;
    const ga = C.andGate(256, 161, { pins: ["1", "2", "3"] });   // in 228,150 · 228,172 · out 300,161
    const gb = C.andGate(346, 215, { pins: ["4", "5", "6"] });   // in 318,204 · 318,226 · out 390,215
    const input = (xs, xp, y, xin, name, r) =>
      C.node(xs, TOP) + C.wire([[xs, TOP], [xs, 42]], "sbd-pos") + C.sw(xs, 60, { dir: "v", span: 36, label: name }) +
      C.wire([[xs, 78], [xs, y], [xin, y]]) + C.node(xp, y) + C.wire([[xp, y], [xp, 264]]) +
      C.res(xp, 292, { dir: "v", span: 56, label: r, value: "10 kΩ", labelLeft: true }) +
      C.wire([[xp, 320], [xp, BOT]]) + C.node(xp, BOT);
    return { w: 470, h: 360, groups: [
      C.rail(20, 454, TOP, { pos: true, label: "+5 V" }) + C.rail(20, 454, BOT),
      input(40, 70, YB, 228, "B", "R2") + input(110, 140, YC, 228, "C", "R3") + input(180, 210, YA, 318, "A", "R4") +
        ga.svg + gb.svg + C.text(250, 126, "IC1 74HC08") +
        C.wire([[300, 161], [312, 161], [312, 204], [318, 204]]) +
        C.wire([[390, 215], [XO, 215], [XO, 236]]) +
        C.res(XO, 262, { dir: "v", span: 52, label: "R1", value: "270 Ω", labelLeft: true }) +
        C.wire([[XO, 288], [XO, 294]]) + C.led(XO, 308, { dir: "d", span: 28, label: "LED1" }) +
        C.wire([[XO, 322], [XO, BOT]]) + C.node(XO, BOT) +
        C.node(306, 161) + C.wire([[306, 161], [306, 134]]) +
        C.node(400, 215) + C.wire([[400, 215], [400, 182]]),
      tp(440, TOP, "T1") + tp(440, BOT, "T2") + tp(306, 134, "T3") + tp(400, 182, "T4")
    ] };
  }
};
