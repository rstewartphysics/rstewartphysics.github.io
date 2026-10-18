// Three build guides: the netlist, a breadboard and a stripboard layout, and a
// circuit diagram split into step groups.  Every placement, cut, link and test
// point carries the step that adds it.

const term = (id, at, s) => ({ id, footprint: "term-1", at, step: s });
const pcap = (C, x, y, label, value) =>
  C.cap(x, y, { dir: "v", span: 56 }) +
  C.text(x - 16, y - 8, "+", { anchor: "end" }) +
  C.text(x + 17, y - 3, label, { anchor: "start" }) + C.text(x + 17, y + 12, value, { anchor: "start" });
const L = (a, b, colour, step) => ({ a, b, colour, step });

/* ------------------------------------------------------------ 555 astable */
export const astable = {
  id: "555-astable",
  title: "555 astable — flashing red and green LEDs",
  components: [
    { id: "+5V", footprint: "term-1", name: "+5 V supply", pos: true },
    { id: "0V", footprint: "term-1", name: "0 V supply", neg: true },
    { id: "IC1", footprint: "dip-8", part: "555", name: "IC1 — 555 timer" },
    { id: "R1", footprint: "res-4", name: "R1 (1 kΩ)" },
    { id: "R2", footprint: "res-4", name: "R2 (10 kΩ)" },
    { id: "C1", footprint: "ecap-2", name: "C1 (100 µF)" },
    { id: "R3", footprint: "res-4", name: "R3 (270 Ω)" },
    { id: "R4", footprint: "res-4", name: "R4 (270 Ω)" },
    { id: "LED1", footprint: "led-2", name: "LED1 red", colour: "red" },
    { id: "LED2", footprint: "led-2", name: "LED2 green", colour: "green" }
  ],
  target: [
    ["+5V.1", "IC1.8", "IC1.4", "R1.1", "R4.1"],
    ["0V.1", "IC1.1", "C1.-", "LED1.k"],
    ["R1.2", "R2.1", "IC1.7"],
    ["R2.2", "IC1.6", "IC1.2", "C1.+"],
    ["IC1.3", "R3.1", "LED2.k"],
    ["R3.2", "LED1.a"],
    ["R4.2", "LED2.a"]
  ],
  dontcare: ["IC1.5"],
  steps: [
    { key: "chip", title: "The chip",
      circuit: "Start with the chip. Draw the 555 as a box and write each pin number where its wire will meet it. Those numbers are what you convert later.",
      bread: "Push the 555 across the centre gap, notch to the left, pin 1 bottom left. Link pin 8 and pin 4 to +5 V and pin 1 to 0 V.",
      strip: "Fit the 555 with the notch at the top and cut the four tracks between its rows (red ✗). Two red links take pins 4 and 8 to +5 V; a black link takes pin 1 to 0 V." },
    { key: "power", title: "Supply rails and supply pins",
      circuit: "Draw +5 V along the top and 0 V along the bottom. Pins 8 and 4 (Reset) go to +5 V and pin 1 goes to 0 V. Pin 5 is left open.",
      bread: "Plug the supply into the top rails: red + row, blue − row. Two long links carry both rails down to the bottom pair too.",
      strip: "Track A is +5 V and track V is 0 V. The supply leads go in at the left-hand end." },
    { key: "timing", title: "The timing parts: R1, R2 and C1",
      circuit: "R1 runs from +5 V to pin 7. R2 runs from pin 7 to pins 6 and 2, which are joined. C1 runs from there to 0 V, + side up.",
      bread: "R1 from the + rail to pin 7's column. R2 from pin 7's column to a spare column, which the yellow links join to pins 6 and 2. C1's long (+) leg goes in that column too.",
      strip: "R1 from +5 V to pin 7, R2 from pin 7 down to pins 6 and 2. The yellow links join pin 2, pin 6 and C1's + leg. C1's − leg sits on 0 V." },
    { key: "output", title: "The two LEDs",
      circuit: "From pin 3, R3 and the red LED go down to 0 V. From +5 V, R4 and the green LED come down to pin 3.",
      bread: "R3 from pin 3's column to the red LED, which goes to 0 V. R4 drops from the + rail to the green LED; the blue link brings its short leg back to pin 3.",
      strip: "The blue link takes pin 3 down to the LED tracks. R3 and the red LED go to 0 V; R4 and the green LED come from +5 V. Flat edge (short leg) towards 0 V or pin 3." },
    { key: "tp", title: "Test points",
      circuit: "T1 +5 V, T2 0 V, T3 the output (pin 3), T4 the capacitor (pins 2 and 6).",
      bread: "Mark one empty hole on each net to measure: +5 V, 0 V, pin 3 and the capacitor.",
      strip: "Fit a test pin on each net to measure: +5 V, 0 V, pin 3 and the capacitor." }
  ],
  layouts: {
    bread: { board: "bb-400", reference: {
      cuts: [],
      placements: [
        term("+5V", "A2", 1), term("0V", "B2", 1),
        { id: "IC1", footprint: "dip-8-bb", at: "G10", rot: 0, step: 2 },
        { id: "R1", footprint: "res-4", at: "A11", rot: 90, step: 3 },
        { id: "R2", footprint: "res-4", at: "E8", rot: 0, step: 3 },
        { id: "C1", footprint: "ecap-2", at: "K8", rot: 0, step: 3 },
        { id: "R3", footprint: "res-4", at: "J12", rot: 0, step: 4 },
        { id: "LED1", footprint: "led-2", at: "I15", rot: 0, step: 4 },
        { id: "R4", footprint: "res-4", at: "J22", rot: 90, step: 4 },
        { id: "LED2", footprint: "led-2", at: "H21", rot: 180, step: 4 }
      ],
      links: [
        L("A30", "M30", "red", 1), L("B29", "N29", "black", 1),
        L("A10", "C10", "red", 2), L("L13", "M13", "red", 2), L("L10", "N10", "black", 2),
        L("G8", "H8", "yellow", 3), L("F8", "F12", "yellow", 3), L("I8", "I11", "yellow", 3), L("L9", "N9", "black", 3),
        L("L16", "N16", "black", 4), L("K12", "K21", "blue", 4)
      ],
      testpoints: [
        { id: "T1", at: "A25", step: 5 }, { id: "T2", at: "N25", step: 5 },
        { id: "T3", at: "L12", step: 5 }, { id: "T4", at: "L8", step: 5 }
      ]
    } },
    strip: { board: "34-0411", reference: {
      cuts: [["F14", 2], ["G14", 2], ["H14", 2], ["I14", 2]],
      placements: [
        term("+5V", "A2", 1), term("0V", "B2", 1),
        { id: "IC1", footprint: "dip-8", at: "F12", rot: 0, step: 2 },
        { id: "R1", footprint: "res-7", at: "A20", rot: 90, step: 3 },
        { id: "R2", footprint: "res-4", at: "G19", rot: 90, step: 3 },
        { id: "C1", footprint: "ecap-2", at: "U6", rot: 90, step: 3 },
        { id: "R4", footprint: "res-4", at: "K11", rot: 90, step: 4 },
        { id: "LED2", footprint: "led-2", at: "N13", rot: 90, step: 4 },
        { id: "R3", footprint: "res-4", at: "O11", rot: 90, step: 4 },
        { id: "LED1", footprint: "led-2", at: "R13", rot: 90, step: 4 }
      ],
      links: [
        L("B1", "V1", "black", 1), L("A8", "I8", "red", 2), L("A16", "F16", "red", 2), L("F10", "V10", "black", 2),
        L("G9", "U9", "yellow", 3), L("H17", "U17", "yellow", 3), L("H18", "J18", "yellow", 3),
        L("I7", "K7", "red", 4), L("S15", "V15", "black", 4), L("H6", "O6", "blue", 4)
      ],
      testpoints: [
        { id: "T1", at: "A30", step: 5 }, { id: "T2", at: "V30", step: 5 },
        { id: "T3", at: "H5", step: 5 }, { id: "T4", at: "G3", step: 5 }
      ]
    } }
  },
  circuit(C, tp) {
    const TOP = 24, BOT = 300, XT = 110, XO = 330;
    const ic = C.icBlock(220, 160, { w: 70, h: 110, name: "555",
      left: [{ num: "7", at: 0.12 }, { num: "6", at: 0.62 }, { num: "2", at: 0.86 }],
      top: [{ num: "4", at: 0.35 }, { num: "8", at: 0.78 }],
      right: [{ num: "3", at: 0.5 }],
      bottom: [{ num: "1", at: 0.35 }, { num: "5", at: 0.78 }] });
    const P = ic.at;
    return { w: 440, h: 324, pins: P, groups: [
      ic.svg,
      C.rail(26, 420, TOP, { pos: true, label: "+5 V" }) + C.rail(26, 420, BOT) +
        C.wire([P["8"], [P["8"][0], TOP]], "sbd-pos") + C.node(P["8"][0], TOP) +
        C.wire([P["4"], [P["4"][0], TOP]], "sbd-pos") + C.node(P["4"][0], TOP) +
        C.wire([P["1"], [P["1"][0], BOT]]) + C.node(P["1"][0], BOT),
      C.node(XT, TOP) + C.wire([[XT, TOP], [XT, 40]], "sbd-pos") +
        C.res(XT, 68, { dir: "v", span: 56, label: "R1", value: "1 kΩ", labelLeft: true }) +
        C.wire([[XT, 96], [XT, P["7"][1]]]) + C.node(XT, P["7"][1]) + C.wire([[XT, P["7"][1]], P["7"]]) +
        C.res(XT, 146, { dir: "v", span: 54, label: "R2", value: "10 kΩ", labelLeft: true }) +
        C.node(XT, P["6"][1]) + C.wire([[XT, P["6"][1]], P["6"]]) +
        C.wire([[XT, P["6"][1]], [XT, 212]]) + C.node(XT, P["2"][1]) + C.wire([[XT, P["2"][1]], P["2"]]) +
        pcap(C, XT, 240, "C1", "100 µF") +
        C.wire([[XT, 268], [XT, BOT]]) + C.node(XT, BOT),
      C.wire([P["3"], [XO, P["3"][1]]]) + C.node(XO, P["3"][1]) +
        C.node(XO, TOP) + C.wire([[XO, TOP], [XO, 36]], "sbd-pos") +
        C.res(XO, 60, { dir: "v", span: 48, label: "R4", value: "270 Ω", labelLeft: true }) +
        C.wire([[XO, 84], [XO, 96]]) + C.led(XO, 112, { dir: "d", span: 32, label: "LED2 green", labelSide: "r" }) +
        C.wire([[XO, 128], [XO, 176]]) +
        C.res(XO, 200, { dir: "v", span: 48, label: "R3", value: "270 Ω", labelLeft: true }) +
        C.wire([[XO, 224], [XO, 236]]) + C.led(XO, 252, { dir: "d", span: 32, label: "LED1 red", labelSide: "r" }) +
        C.wire([[XO, 268], [XO, BOT]]) + C.node(XO, BOT),
      tp(395, TOP, "T1") + tp(395, BOT, "T2") + tp(290, P["3"][1], "T3") + tp(150, P["2"][1], "T4")
    ] };
  }
};

/* --------------------------------------------------------- 555 monostable */
export const monostable = {
  id: "555-monostable",
  title: "555 monostable — press once, LED on for a set time",
  components: [
    { id: "+5V", footprint: "term-1", name: "+5 V supply", pos: true },
    { id: "0V", footprint: "term-1", name: "0 V supply", neg: true },
    { id: "SW1", footprint: "spdt-3", name: "SW1 slide switch" },
    { id: "IC1", footprint: "dip-8", part: "555", name: "IC1 — 555 timer" },
    { id: "R1", footprint: "res-4", name: "R1 (10 kΩ)" },
    { id: "R2", footprint: "res-4", name: "R2 (100 kΩ)" },
    { id: "C1", footprint: "ecap-2", name: "C1 (100 µF)" },
    { id: "R3", footprint: "res-4", name: "R3 (270 Ω)" },
    { id: "LED1", footprint: "led-2", name: "LED1", colour: "red" }
  ],
  target: [
    ["+5V.1", "IC1.8", "IC1.4", "R1.1", "R2.1", "SW1.1"],
    ["0V.1", "IC1.1", "C1.-", "LED1.k", "SW1.2"],
    ["SW1.c", "R1.2", "IC1.2"],
    ["R2.2", "IC1.7", "IC1.6", "C1.+"],
    ["IC1.3", "R3.1"],
    ["R3.2", "LED1.a"]
  ],
  dontcare: ["IC1.5"],
  steps: [
    { key: "chip", title: "The chip",
      circuit: "Start with the chip. Draw the 555 as a box and write each pin number where its wire will meet it. Those numbers are what you convert later.",
      bread: "555 across the centre gap, notch left. Link pin 8 and pin 4 to +5 V, pin 1 to 0 V.",
      strip: "Fit the 555, notch at the top, and cut the four tracks between its rows. Link pins 4 and 8 to +5 V, pin 1 to 0 V." },
    { key: "power", title: "Supply rails and supply pins",
      circuit: "Draw +5 V along the top and 0 V along the bottom. Pins 8 and 4 (Reset) go to +5 V and pin 1 goes to 0 V. Pin 5 is left open.",
      bread: "Supply into the top rails; two long links carry both rails to the bottom pair.",
      strip: "Track A is +5 V and track V is 0 V." },
    { key: "timing", title: "The timing parts: R2 and C1",
      circuit: "R2 runs from +5 V to pin 7. Pin 6 joins pin 7. C1 runs from there to 0 V, + side up. T ≈ 1.1 R2 C1 = 11 s.",
      bread: "R2 from the + rail to pin 7's column. A short yellow link joins pin 7 to pin 6. C1's + leg goes in pin 6's column, its − leg in the 0 V rail.",
      strip: "R2 from +5 V to pin 7. The yellow links join pin 7 to pin 6 and bring the timing net down to C1, whose − leg is linked to 0 V." },
    { key: "trigger", title: "The trigger: R1 and the slide switch",
      circuit: "SW1's middle pin (common) is on pin 2; its outer pins go to +5 V and 0 V. Slid one way, pin 2 is held at +5 V. Slid the other way, pin 2 goes to 0 V and the pulse starts. Slide it back straight away: while pin 2 is held LOW the output stays HIGH. R1 keeps pin 2 HIGH while the switch is between its two positions.",
      bread: "A link carries pin 2 to a spare column. SW1 sits along a row with its middle pin in that column and its outer pins in columns linked to +5 V and 0 V. R1 runs from pin 2's column to a column linked to +5 V.",
      strip: "A link carries pin 2 down to a spare track. SW1 stands across three tracks: middle pin on that track, outer pins on tracks linked to +5 V and 0 V. R1 runs from +5 V to pin 2's track." },
    { key: "output", title: "The LED",
      circuit: "From pin 3, R3 and the LED go down to 0 V. The LED is on while pin 3 is HIGH.",
      bread: "R3 from pin 3's column to the LED; the LED's short leg goes to a column linked to 0 V.",
      strip: "R3 from pin 3's track to the LED track. The LED's short leg sits on a track linked to 0 V." },
    { key: "tp", title: "Test points",
      circuit: "T1 +5 V, T2 0 V, T3 the trigger (pin 2), T4 the output (pin 3).",
      bread: "One empty hole on each: +5 V, 0 V, pin 2 and pin 3.",
      strip: "A test pin on each: +5 V, 0 V, pin 2 and pin 3." }
  ],
  layouts: {
    bread: { board: "bb-400", reference: {
      cuts: [],
      placements: [
        term("+5V", "A2", 1), term("0V", "B2", 1),
        { id: "IC1", footprint: "dip-8-bb", at: "G10", rot: 0, step: 2 },
        { id: "R2", footprint: "res-4", at: "A11", rot: 90, step: 3 },
        { id: "C1", footprint: "ecap-2", at: "B12", rot: 270, step: 3 },
        { id: "R1", footprint: "res-4", at: "K11", rot: 0, step: 4 },
        { id: "SW1", footprint: "spdt-3", at: "J6", rot: 0, step: 4 },
        { id: "R3", footprint: "res-4", at: "I12", rot: 0, step: 5 },
        { id: "LED1", footprint: "led-2", at: "H15", rot: 0, step: 5 }
      ],
      links: [
        L("A30", "M30", "red", 1), L("B29", "N29", "black", 1),
        L("A10", "C10", "red", 2), L("L13", "M13", "red", 2), L("L10", "N10", "black", 2),
        L("F11", "F12", "yellow", 3),
        L("L14", "M14", "red", 4), L("L6", "M6", "red", 4), L("I7", "I11", "green", 4), L("L8", "N8", "black", 4),
        L("L16", "N16", "black", 5)
      ],
      testpoints: [
        { id: "T1", at: "A25", step: 6 }, { id: "T2", at: "N25", step: 6 },
        { id: "T3", at: "J11", step: 6 }, { id: "T4", at: "L12", step: 6 }
      ]
    } },
    strip: { board: "34-0411", reference: {
      cuts: [["F14", 2], ["G14", 2], ["H14", 2], ["I14", 2]],
      placements: [
        term("+5V", "A2", 1), term("0V", "B2", 1),
        { id: "IC1", footprint: "dip-8", at: "F12", rot: 0, step: 2 },
        { id: "R2", footprint: "res-7", at: "A19", rot: 90, step: 3 },
        { id: "C1", footprint: "ecap-2", at: "M22", rot: 90, step: 3 },
        { id: "R1", footprint: "res-7", at: "A5", rot: 90, step: 4 },
        { id: "SW1", footprint: "spdt-3", at: "O11", rot: 90, step: 4 },
        { id: "R3", footprint: "res-4", at: "H4", rot: 90, step: 5 },
        { id: "LED1", footprint: "led-2", at: "K6", rot: 90, step: 5 }
      ],
      links: [
        L("B1", "V1", "black", 1), L("A8", "I8", "red", 2), L("A17", "F17", "red", 2), L("F10", "V10", "black", 2),
        L("G16", "H16", "yellow", 3), L("H21", "M21", "yellow", 3), L("N24", "V24", "black", 3),
        L("G9", "P9", "green", 4), L("A26", "O26", "red", 4), L("Q12", "V12", "black", 4),
        L("L7", "V7", "black", 5)
      ],
      testpoints: [
        { id: "T1", at: "A30", step: 6 }, { id: "T2", at: "V30", step: 6 },
        { id: "T3", at: "G3", step: 6 }, { id: "T4", at: "H11", step: 6 }
      ]
    } }
  },
  circuit(C, tp) {
    const TOP = 24, BOT = 300, XS = 76, XT = 160, XO = 360;
    const ic = C.icBlock(260, 160, { w: 70, h: 110, name: "555",
      left: [{ num: "7", at: 0.12 }, { num: "6", at: 0.62 }, { num: "2", at: 0.86 }],
      top: [{ num: "4", at: 0.35 }, { num: "8", at: 0.78 }],
      right: [{ num: "3", at: 0.5 }],
      bottom: [{ num: "1", at: 0.35 }, { num: "5", at: 0.78 }] });
    const P = ic.at;
    return { w: 450, h: 324, pins: P, groups: [
      ic.svg,
      C.rail(26, 430, TOP, { pos: true, label: "+5 V" }) + C.rail(26, 430, BOT) +
        C.wire([P["8"], [P["8"][0], TOP]], "sbd-pos") + C.node(P["8"][0], TOP) +
        C.wire([P["4"], [P["4"][0], TOP]], "sbd-pos") + C.node(P["4"][0], TOP) +
        C.wire([P["1"], [P["1"][0], BOT]]) + C.node(P["1"][0], BOT),
      C.node(XT, TOP) + C.wire([[XT, TOP], [XT, 40]], "sbd-pos") +
        C.res(XT, 68, { dir: "v", span: 56, label: "R2", value: "100 kΩ" }) +
        C.wire([[XT, 96], [XT, 222]]) +
        C.node(XT, P["7"][1]) + C.wire([[XT, P["7"][1]], P["7"]]) +
        C.node(XT, P["6"][1]) + C.wire([[XT, P["6"][1]], P["6"]]) +
        pcap(C, XT, 250, "C1", "100 µF") +
        C.wire([[XT, 278], [XT, BOT]]) + C.node(XT, BOT),
      C.node(XS, TOP) + C.wire([[XS, TOP], [XS, 40]], "sbd-pos") +
        C.res(XS, 68, { dir: "v", span: 56, label: "R1", value: "10 kΩ", labelLeft: true }) +
        C.wire([[XS, 96], [XS, 250], [XS + 15, 250]]) + C.node(XS, P["2"][1]) + C.wire([[XS, P["2"][1]], P["2"]]) +
        C.spdt(XS + 26, 250, {}) + C.text(XS + 20, 284, "SW1") +
        C.wire([[XS + 52, 237], [XS + 52, TOP]], "sbd-pos") + C.node(XS + 52, TOP) +
        C.wire([[XS + 52, 263], [XS + 52, BOT]]) + C.node(XS + 52, BOT),
      C.wire([P["3"], [XO, P["3"][1]], [XO, 190]]) +
        C.res(XO, 214, { dir: "v", span: 48, label: "R3", value: "270 Ω", labelLeft: true }) +
        C.wire([[XO, 238], [XO, 250]]) + C.led(XO, 266, { dir: "d", span: 32, label: "LED1", labelSide: "r" }) +
        C.wire([[XO, 282], [XO, BOT]]) + C.node(XO, BOT),
      tp(410, TOP, "T1") + tp(410, BOT, "T2") + tp(196, P["2"][1], "T3") + tp(312, P["3"][1], "T4")
    ] };
  }
};

/* ------------------------------------------------------- 741 comparator */
export const comparator = {
  id: "op-amp-comparator",
  title: "741 comparator — LED on when it gets hot",
  components: [
    { id: "+9V", footprint: "term-1", name: "+9 V supply", pos: true },
    { id: "0V", footprint: "term-1", name: "0 V supply", neg: true },
    { id: "IC1", footprint: "dip-8", part: "741", name: "IC1 — 741 op-amp" },
    { id: "TH1", footprint: "ther-2", name: "TH1 thermistor" },
    { id: "VR1", footprint: "pot-3", name: "VR1 (10 kΩ)" },
    { id: "R2", footprint: "res-4", name: "R2 (10 kΩ)" },
    { id: "R3", footprint: "res-4", name: "R3 (2.2 kΩ)" },
    { id: "R4", footprint: "res-4", name: "R4 (680 Ω)" },
    { id: "LED1", footprint: "led-2", name: "LED1", colour: "red" }
  ],
  target: [
    ["+9V.1", "IC1.7", "TH1.1", "R2.1"],
    ["0V.1", "IC1.4", "VR1.2", "R3.2", "LED1.k"],
    ["TH1.2", "VR1.w", "IC1.3"],
    ["R2.2", "R3.1", "IC1.2"],
    ["IC1.6", "R4.1"],
    ["R4.2", "LED1.a"]
  ],
  dontcare: ["IC1.1", "IC1.5", "IC1.8", "VR1.1"],
  steps: [
    { key: "chip", title: "The chip",
      circuit: "Start with the chip. Draw the op-amp triangle and number the pins you will use: 2 (− input), 3 (+ input), 6 (output), 7 and 4 (supply).",
      bread: "741 across the centre gap, notch left. Link pin 7 to +9 V and pin 4 to 0 V.",
      strip: "Fit the 741, notch at the top, and cut the four tracks between its rows. Link pin 7 to +9 V and pin 4 to 0 V." },
    { key: "power", title: "Supply rails and supply pins",
      circuit: "Draw +9 V along the top and 0 V along the bottom. Pin 7 goes to +9 V and pin 4 to 0 V. Pins 1, 5 and 8 are not used.",
      bread: "Supply into the top rails; two long links carry both rails to the bottom pair.",
      strip: "Track A is +9 V and track V is 0 V." },
    { key: "sense", title: "The sensing divider: TH1 and VR1 → pin 3",
      circuit: "TH1 on top, VR1 below. Their middle point is V<sub>in</sub>, into the + input (pin 3). When TH1 warms up its resistance falls, so V<sub>in</sub> rises. VR1 sets how hot.",
      bread: "TH1 drops from the + rail into pin 3's column. VR1's wiper goes in a column linked to pin 3; its end leg goes to 0 V.",
      strip: "The yellow link takes pin 3 down to the sensing track. TH1 joins it to a +9 V track; VR1's wiper sits on it and its end leg on a 0 V track." },
    { key: "ref", title: "The reference divider: R2 and R3 → pin 2",
      circuit: "R2 on top, R3 below. Their middle point is V<sub>ref</sub>, about 1.6 V, into the − input (pin 2).",
      bread: "R2 from the + rail and R3 to the 0 V rail, both meeting in a column linked to pin 2.",
      strip: "R2 from +9 V to pin 2's track, R3 from pin 2's track down to 0 V." },
    { key: "output", title: "The LED",
      circuit: "From pin 6, R4 and the LED go to 0 V. When V<sub>in</sub> is bigger than V<sub>ref</sub>, pin 6 goes HIGH and the LED lights.",
      bread: "R4 from pin 6's column to the LED; the LED's short leg goes to 0 V.",
      strip: "The blue link takes pin 6 down. R4 and the LED go to a track linked to 0 V." },
    { key: "tp", title: "Test points",
      circuit: "T1 +9 V, T2 0 V, T3 V<sub>in</sub> (pin 3), T4 V<sub>ref</sub> (pin 2), T5 V<sub>out</sub> (pin 6).",
      bread: "One empty hole on each: +9 V, 0 V, V<sub>in</sub>, V<sub>ref</sub> and V<sub>out</sub>.",
      strip: "A test pin on each: +9 V, 0 V, V<sub>in</sub>, V<sub>ref</sub> and V<sub>out</sub>." }
  ],
  layouts: {
    bread: { board: "bb-400", reference: {
      cuts: [],
      placements: [
        term("+9V", "A2", 1), term("0V", "B2", 1),
        { id: "IC1", footprint: "dip-8-bb", at: "G10", rot: 0, step: 2 },
        { id: "TH1", footprint: "ther-2", at: "L12", rot: 90, step: 3 },
        { id: "VR1", footprint: "pot-3", at: "K15", rot: 0, step: 3 },
        { id: "R2", footprint: "res-4", at: "J7", rot: 90, step: 4 },
        { id: "R3", footprint: "res-4", at: "H4", rot: 0, step: 4 },
        { id: "R4", footprint: "res-4", at: "F12", rot: 0, step: 5 },
        { id: "LED1", footprint: "led-2", at: "E15", rot: 0, step: 5 }
      ],
      links: [
        L("A30", "M30", "red", 1), L("B29", "N29", "black", 1),
        L("A11", "C11", "red", 2), L("L13", "N13", "black", 2),
        L("J12", "J16", "yellow", 3), L("L17", "N17", "black", 3),
        L("I7", "I11", "green", 4), L("L4", "N4", "black", 4),
        L("B16", "D16", "black", 5)
      ],
      testpoints: [
        { id: "T1", at: "A25", step: 6 }, { id: "T2", at: "N25", step: 6 },
        { id: "T3", at: "I12", step: 6 }, { id: "T4", at: "L11", step: 6 }, { id: "T5", at: "D12", step: 6 }
      ]
    } },
    strip: { board: "34-0411", reference: {
      cuts: [["F14", 2], ["G14", 2], ["H14", 2], ["I14", 2]],
      placements: [
        term("+9V", "A2", 1), term("0V", "B2", 1),
        { id: "IC1", footprint: "dip-8", at: "F12", rot: 0, step: 2 },
        { id: "TH1", footprint: "ther-3", at: "K4", rot: 90, step: 3 },
        { id: "VR1", footprint: "pot-3", at: "J9", rot: 90, step: 3 },
        { id: "R2", footprint: "res-7", at: "A5", rot: 90, step: 4 },
        { id: "R3", footprint: "res-6", at: "G3", rot: 90, step: 4 },
        { id: "R4", footprint: "res-4", at: "N21", rot: 90, step: 5 },
        { id: "LED1", footprint: "led-2", at: "Q23", rot: 90, step: 5 }
      ],
      links: [
        L("B1", "V1", "black", 1), L("A16", "G16", "red", 2), L("I8", "V8", "black", 2),
        L("H6", "K6", "yellow", 3), L("G17", "M17", "red", 3), L("L10", "V10", "black", 3),
        L("H19", "N19", "blue", 5), L("R24", "V24", "black", 5)
      ],
      testpoints: [
        { id: "T1", at: "A30", step: 6 }, { id: "T2", at: "V30", step: 6 },
        { id: "T3", at: "K30", step: 6 }, { id: "T4", at: "G2", step: 6 }, { id: "T5", at: "H30", step: 6 }
      ]
    } }
  },
  circuit(C, tp) {
    const TOP = 24, BOT = 300, XS = 100, XR = 200, XO = 400;
    const oa = C.opamp(310, 160, {});
    const varres = (x, y, o) => C.res(x, y, Object.assign({ dir: "v" }, o)) + C.arrow(x - 18, y + 18, x + 18, y - 18);
    const t = (x, y, s, a) => C.text(x, y, s, { anchor: a || "middle" });
    const pin = (x, y, s) => C.text(x, y, s, { cls: "sbd-cnet", anchor: "middle" });
    return { w: 470, h: 324, pins: { "2": oa.minus, "3": oa.plus, "6": oa.out, "7": oa.vplus, "4": oa.vminus }, groups: [
      oa.svg + t(292, 206, "IC1 741", "end") +
        pin(oa.vplus[0] + 9, 112, "7") + pin(oa.vminus[0] + 9, 214, "4") +
        pin(oa.minus[0] + 6, oa.minus[1] - 5, "2") + pin(oa.plus[0] + 6, oa.plus[1] - 5, "3") +
        pin(oa.out[0] - 4, oa.out[1] - 6, "6"),
      C.rail(26, 450, TOP, { pos: true, label: "+9 V" }) + C.rail(26, 450, BOT) +
        C.wire([oa.vplus, [oa.vplus[0], TOP]], "sbd-pos") + C.node(oa.vplus[0], TOP) +
        C.wire([oa.vminus, [oa.vminus[0], BOT]]) + C.node(oa.vminus[0], BOT),
      C.node(XS, TOP) + C.wire([[XS, TOP], [XS, 44]], "sbd-pos") +
        C.res(XS, 72, { dir: "v", span: 56 }) + C.wire([[XS - 29, 87], [XS + 29, 57]]) +
        C.wire([[XS - 29, 87], [XS - 19, 87]]) + t(XS - 34, 76, "TH1", "end") +
        C.wire([[XS, 100], [XS, 200]]) + C.node(XS, oa.plus[1]) + C.wire([[XS, oa.plus[1]], oa.plus]) +
        varres(XS, 228, { span: 56 }) + t(XS - 22, 232, "VR1", "end") +
        C.wire([[XS, 256], [XS, BOT]]) + C.node(XS, BOT),
      C.node(XR, TOP) + C.wire([[XR, TOP], [XR, 44]], "sbd-pos") +
        C.res(XR, 72, { dir: "v", span: 56, label: "R2", value: "10 kΩ" }) +
        C.wire([[XR, 100], [XR, 200]]) + C.node(XR, oa.minus[1]) + C.wire([[XR, oa.minus[1]], oa.minus]) +
        C.res(XR, 228, { dir: "v", span: 56, label: "R3", value: "2.2 kΩ" }) +
        C.wire([[XR, 256], [XR, BOT]]) + C.node(XR, BOT),
      C.wire([oa.out, [XO, oa.out[1]], [XO, 190]]) +
        C.res(XO, 214, { dir: "v", span: 48, label: "R4", value: "680 Ω", labelLeft: true }) +
        C.wire([[XO, 238], [XO, 250]]) + C.led(XO, 266, { dir: "d", span: 32, label: "LED1", labelSide: "r" }) +
        C.wire([[XO, 282], [XO, BOT]]) + C.node(XO, BOT),
      tp(430, TOP, "T1") + tp(430, BOT, "T2") + tp(150, oa.plus[1], "T3") +
        tp(240, oa.minus[1], "T4") + tp(390, oa.out[1], "T5")
    ] };
  }
};

export const ALL = [comparator, monostable, astable];
