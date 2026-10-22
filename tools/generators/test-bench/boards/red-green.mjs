// S10 · Slide switch picks red or green (BENCH-PLAN §4). A bench board only.
//
// Track A +5 V, track I 0 V. The red link takes +5 V to the switch's middle pin
// (C). Slid one way, the middle pin joins pin 1 (B), the red branch: R1 from B
// to E, LED1 from E to F, F linked to 0 V. Slid the other way it joins pin 2
// (D), the green branch: R2 from D to G, LED2 from G to H, H linked to 0 V.

const L = (a, b, colour) => ({ a, b, colour });

export const board = {
  id: "red-green",
  title: "Slide switch picks red or green",
  components: [
    { id: "+5V", footprint: "term-1", name: "+5 V supply", pos: true },
    { id: "0V", footprint: "term-1", name: "0 V supply", neg: true },
    { id: "SW1", footprint: "spdt-3", name: "SW1 slide switch" },
    { id: "R1", footprint: "res-4", name: "R1 (270 Ω)" },
    { id: "LED1", footprint: "led-2", name: "LED1 red", colour: "red" },
    { id: "R2", footprint: "res-4", name: "R2 (270 Ω)" },
    { id: "LED2", footprint: "led-2", name: "LED2 green", colour: "green" }
  ],
  target: [
    ["+5V.1", "SW1.c"],
    ["SW1.1", "R1.1"],
    ["R1.2", "LED1.a"],
    ["SW1.2", "R2.1"],
    ["R2.2", "LED2.a"],
    ["0V.1", "LED1.k", "LED2.k"]
  ],
  layouts: {
    strip: { board: "34-0410", reference: {
      cuts: [],
      placements: [
        { id: "+5V", footprint: "term-1", at: "A2" },
        { id: "0V", footprint: "term-1", at: "I2" },
        { id: "SW1", footprint: "spdt-3", at: "B4", rot: 90 },
        { id: "R1", footprint: "res-4", at: "B10", rot: 90 },
        { id: "LED1", footprint: "led-2", at: "E12", rot: 90 },
        { id: "R2", footprint: "res-4", at: "D16", rot: 90 },
        { id: "LED2", footprint: "led-2", at: "G18", rot: 90 }
      ],
      links: [L("A6", "C6", "red"), L("F14", "I14", "black"), L("H20", "I20", "black")],
      testpoints: [
        { id: "T1", at: "A23" }, { id: "T2", at: "I23" },
        { id: "T3", at: "C22" }, { id: "T4", at: "B19" }, { id: "T5", at: "D24" }
      ]
    } }
  },
  /* The red branch is drawn on the right so the green wire never crosses it. */
  circuit(C, tp) {
    const TOP = 24, BOT = 270, XC = 52, YS = 84, XG = 172, XR = 252;
    return { w: 360, h: 294, groups: [
      C.rail(20, 340, TOP, { pos: true, label: "+5 V" }) + C.rail(20, 340, BOT),
      C.node(XC, TOP) + C.wire([[XC, TOP], [XC, YS], [74, YS]], "sbd-pos") +
        C.spdt(100, YS, { label: "SW1" }) +
        C.wire([[126, YS - 13], [XR, YS - 13], [XR, 112]]) +
        C.res(XR, 140, { dir: "v", span: 56, label: "R1", value: "270 Ω", labelLeft: true }) +
        C.wire([[XR, 168], [XR, 196]]) +
        C.led(XR, 214, { dir: "d", span: 36, label: "LED1 red", labelSide: "r" }) +
        C.wire([[XR, 232], [XR, BOT]]) + C.node(XR, BOT) +
        C.wire([[126, YS + 13], [XG, YS + 13], [XG, 128]]) +
        C.res(XG, 156, { dir: "v", span: 56, label: "R2", value: "270 Ω", labelLeft: true }) +
        C.wire([[XG, 184], [XG, 204]]) +
        C.led(XG, 222, { dir: "d", span: 36, label: "LED2 green" }) +
        C.wire([[XG, 240], [XG, BOT]]) + C.node(XG, BOT) +
        C.node(XC, 52) + C.wire([[XC, 52], [XC - 28, 52]]) +
        C.node(XR, YS - 13) + C.wire([[XR, YS - 13], [XR + 34, YS - 13], [XR + 34, 52]]) +
        C.node(XG, 112) + C.wire([[XG, 112], [XG + 32, 112]]),
      tp(326, TOP, "T1") + tp(326, BOT, "T2") + tp(XC - 28, 52, "T3") + tp(XR + 34, 52, "T4") + tp(XG + 32, 112, "T5")
    ] };
  }
};
