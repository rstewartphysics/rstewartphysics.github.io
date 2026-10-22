// S9 · Slide switch and LED (BENCH-PLAN §4). A bench board only: no build guide
// draws it. Same shape as a build guide circuit (tools/build-guides/circuits.mjs).
//
// Track A +5 V, track I 0 V. The red link takes +5 V to the switch's middle pin
// (track C); slid on, the middle pin joins pin 2 (track D, T3). R1 drops from D
// to G (T4), the LED from G to H, and the black link returns H to 0 V. Lift that
// link and the meter goes in series with the LED.

const L = (a, b, colour) => ({ a, b, colour });

export const board = {
  id: "slide-led",
  title: "Slide switch and LED",
  components: [
    { id: "+5V", footprint: "term-1", name: "+5 V supply", pos: true },
    { id: "0V", footprint: "term-1", name: "0 V supply", neg: true },
    { id: "SW1", footprint: "spdt-3", name: "SW1 slide switch" },
    { id: "R1", footprint: "res-4", name: "R1 (270 Ω)" },
    { id: "LED1", footprint: "led-2", name: "LED1 red", colour: "red" }
  ],
  target: [
    ["+5V.1", "SW1.c"],
    ["SW1.2", "R1.1"],
    ["R1.2", "LED1.a"],
    ["0V.1", "LED1.k"]
  ],
  dontcare: ["SW1.1"],
  layouts: {
    strip: { board: "34-0410", reference: {
      cuts: [],
      placements: [
        { id: "+5V", footprint: "term-1", at: "A2" },
        { id: "0V", footprint: "term-1", at: "I2" },
        { id: "SW1", footprint: "spdt-3", at: "B6", rot: 90 },
        { id: "R1", footprint: "res-4", at: "D12", rot: 90 },
        { id: "LED1", footprint: "led-2", at: "G16", rot: 90 }
      ],
      links: [L("A8", "C8", "red"), L("H19", "I19", "black")],
      testpoints: [
        { id: "T1", at: "A23" }, { id: "T2", at: "I23" },
        { id: "T3", at: "D22" }, { id: "T4", at: "G21" }
      ]
    } }
  },
  circuit(C, tp) {
    const TOP = 24, BOT = 276, X = 120, XT = 176;
    return { w: 300, h: 300, groups: [
      C.rail(26, 280, TOP, { pos: true, label: "+5 V" }) + C.rail(26, 280, BOT),
      C.node(X, TOP) + C.wire([[X, TOP], [X, 42]], "sbd-pos") +
        C.sw(X, 70, { dir: "v", span: 56, label: "SW1" }) +
        C.wire([[X, 98], [X, 122]]) + C.node(X, 110) + C.wire([[X, 110], [XT, 110]]) +
        C.res(X, 150, { dir: "v", span: 56, label: "R1", value: "270 Ω", labelLeft: true }) +
        C.wire([[X, 178], [X, 206]]) + C.node(X, 192) + C.wire([[X, 192], [XT, 192]]) +
        C.led(X, 222, { dir: "d", span: 32, label: "LED1 red", labelSide: "r" }) +
        C.wire([[X, 238], [X, BOT]]) + C.node(X, BOT),
      tp(240, TOP, "T1") + tp(240, BOT, "T2") + tp(XT, 110, "T3") + tp(XT, 192, "T4")
    ] };
  }
};
