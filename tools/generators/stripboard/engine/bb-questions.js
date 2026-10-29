/* ============================================================================
   Breadboard Builder — authored questions (added 15 Sep 2026)
   ----------------------------------------------------------------------------
   The breadboard sibling of questions.js. Same three ideas — LED+resistor,
   a chip built from two AND gates with pulled-down inputs, and a transistor
   switching a buzzer — laid out fresh for a breadboard rather than invented:
   porting the PEDAGOGY (same components, same target netlist, same circuit
   diagram, same "why") while redesigning only the physical layout, because
   the netlist a board must produce is a property of the circuit, not the
   board it is built on.

   Convert, Fault-finder and Reverse are all generated from this, exactly as
   for the stripboard bank — see questions.js's own header.

   Every `reference` below was built and checked with the engine directly
   (topology().errors, netlistOf() against target, check() clean) before
   being written here — see RESUME.md, "breadboard Learn tool, 15 Sep".
   ============================================================================ */
(function (root) {
  "use strict";

  const RAIL_L = 26;
  const pinNos = (o, arr) => (o && o.nets ? arr : null);
  const nn = (C, o, x, y, num) => (o && o.nets ? C.netnum(x, y, num) : "");

  const pullDown = (C, x, y, label, bot) =>
    C.wire([[x, y], [x, 162]]) + C.node(x, y) +
    C.res(x, 190, { dir: "v", span: 56, label: label, value: "10 kΩ" }) +
    C.wire([[x, 218], [x, bot]]) + C.node(x, bot);

  function twoGateChip(C, spec, o) {
    const G = { w: 32, lead: 12 };
    const gate = spec.kind === "or" ? C.orGate : C.andGate;
    const ga = gate(190, 74, Object.assign({ pins: pinNos(o, ["1", "2", "3"]) }, G));
    const gb = gate(246, 130, Object.assign({ pins: pinNos(o, ["4", "5", "6"]) }, G));
    const TOP = 24, BOT = 268, XO = 300;
    const pull = (x, y, label) => pullDown(C, x, y, label, BOT);
    const body =
      C.rail(RAIL_L, 326, TOP, { pos: true }) + C.rail(RAIL_L, 326, BOT) +
      C.term(40, 63, { label: spec.in[0] }) + C.wire([[47, 63], [168, 63]]) +
      C.term(40, 85, { label: spec.in[1] }) + C.wire([[47, 85], [168, 85]]) +
      C.term(40, 141, { label: spec.in[2] }) + C.wire([[47, 141], [224, 141]]) +
      pull(54, 63, spec.pulls[0]) + pull(120, 85, spec.pulls[1]) +
      pull(186, 141, spec.pulls[2]) +
      ga.svg + C.text(196, 46, "IC1a") +
      gb.svg + C.text(252, 102, "IC1b") +
      C.wire([[224, 74], [224, 119]]) +
      C.wire([[280, 130], [XO, 130], [XO, 152]]) +
      C.res(XO, 180, { dir: "v", span: 56, label: "R1", value: "270 Ω", labelLeft: true }) +
      C.wire([[XO, 208], [XO, 222]]) +
      C.led(XO, 240, { dir: "d", span: 36, label: spec.led }) +
      C.wire([[XO, 258], [XO, BOT]]) + C.node(XO, BOT) +
      nn(C, o, 150, 63, 3) + nn(C, o, 150, 85, 4) + nn(C, o, 150, 141, 6) +
      nn(C, o, 224, 94, 5) + nn(C, o, XO, 141, 7) + nn(C, o, XO, 215, 8) +
      nn(C, o, 170, TOP, 1) + nn(C, o, 220, BOT, 2);
    return { w: 344, h: 292, body: body };
  }

  /* ------------------------------------------------------------------------
     Q1 — LED and series resistor.  Half board, no chip.  A part must lie
     ALONG a row here — across several columns, one column net per leg — the
     opposite of the stripboard rule (where it has to sit ACROSS the tracks).
     ------------------------------------------------------------------------ */
  const ledResistor = {
    id: "led-resistor-bb",
    title: "LED and series resistor",
    board: "bb-400",
    scaffold: "blank",
    components: [
      { id: "+5V",  footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",   footprint: "term-1", name: "0 V supply", neg: true },
      { id: "R1",   footprint: "res-4",  name: "R1 (270 Ω)" },
      { id: "LED1", footprint: "led-2",  name: "LED1" }
    ],
    target: [
      ["+5V.1", "R1.1"],
      ["R1.2", "LED1.a"],
      ["0V.1", "LED1.k"]
    ],
    dontcare: [],
    reference: {
      cuts: [],
      placements: [
        { id: "+5V",  footprint: "term-1", at: "A2" },
        { id: "0V",   footprint: "term-1", at: "B2" },
        { id: "R1",   footprint: "res-4",  at: "C5",  rot: 0 },   // legs C5, C8
        { id: "LED1", footprint: "led-2",  at: "C12", rot: 0 }    // legs C12, C13
      ],
      links: [
        { a: "A5",  b: "D5",  colour: "red",  num: 1 },   // + rail -> R1's column
        { a: "D8",  b: "D12", colour: "blue", num: 2 },   // R1's far column -> LED1's anode column
        { a: "D13", b: "B13", colour: "black", num: 3 }   // LED1's cathode column -> 0 V rail
      ],
      testpoints: []
    },
    circuit: (C, o) => {
      const X = 132, TOP = 30, BOT = 216;
      const b =
        C.rail(RAIL_L, 236, TOP, { pos: true }) + C.rail(RAIL_L, 236, BOT) +
        C.node(X, TOP) + C.node(X, BOT) +
        C.wire([[X, TOP], [X, 60]], "sbd-pos") +
        C.res(X, 90, { dir: "v", span: 60, label: "R1", value: "270 Ω" }) +
        C.wire([[X, 120], [X, 144]]) +
        C.led(X, 164, { dir: "d", span: 40, label: "LED1" }) +
        C.wire([[X, 184], [X, BOT]]) +
        nn(C, o, X, 46, 1) + nn(C, o, X, 132, 2) + nn(C, o, X, 200, 3);
      return { w: 258, h: 244, body: b };
    },
    why: [
      "The resistor and the LED are in series between +5 V and 0 V, so the board needs " +
      "three nets and each one becomes a five-hole column.",
      "Both legs of a part must land in <strong>different</strong> columns, or the part is " +
      "shorted out — which is why the resistor and the LED both lie along a row, across " +
      "several columns, rather than down one column."
    ]
  };

  /* ------------------------------------------------------------------------
     Q2 — Lift door interlock.  Same 7408-built-from-two-gates spine as the
     stripboard bank's spine question, straddling the centre channel.  Pull-
     downs run from a column net down into the bottom power rail — a common
     real layout, and the reason a resistor's rotation matters here too.
     ------------------------------------------------------------------------ */
  const liftInterlock = {
    id: "lift-interlock-bb",
    title: "Lift door interlock",
    board: "bb-830",
    scaffold: "blank",
    scenario: [
      "A lift may only move when three conditions are all met: the door is closed, " +
      "a floor has been selected, and the car is not overloaded.",
      "Each condition arrives at the process board as a logic 1. The output drives " +
      "the motor-enable indicator.",
      "All three conditions come from switches, so each input carries a 10 kΩ pull-down " +
      "to 0 V — otherwise an open switch leaves the input floating rather than at logic 0. " +
      "The two gates you are not using have their inputs tied straight to 0 V."
    ],
    components: [
      { id: "+5V",  footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",   footprint: "term-1", name: "0 V supply", neg: true },
      { id: "A",    footprint: "term-1", name: "input A — door closed" },
      { id: "B",    footprint: "term-1", name: "input B — floor selected" },
      { id: "C",    footprint: "term-1", name: "input C — not overloaded" },
      { id: "IC1",  footprint: "dip-14-bb", part: "7408", name: "IC1 — 7408 quad 2-input AND" },
      { id: "R1",   footprint: "res-4",  name: "R1 (270 Ω)" },
      { id: "R2",   footprint: "res-4",  name: "R2 (10 kΩ) — pull-down on A" },
      { id: "R3",   footprint: "res-4",  name: "R3 (10 kΩ) — pull-down on B" },
      { id: "R4",   footprint: "res-4",  name: "R4 (10 kΩ) — pull-down on C" },
      { id: "LED1", footprint: "led-2",  name: "LED1 — motor enable" }
    ],
    target: [
      ["+5V.1", "IC1.14"],
      ["0V.1", "IC1.7", "LED1.k", "R2.2", "R3.2", "R4.2"],
      ["A.1", "IC1.1", "R2.1"],
      ["B.1", "IC1.2", "R3.1"],
      ["IC1.3", "IC1.4"],
      ["C.1", "IC1.5", "R4.1"],
      ["IC1.6", "R1.1"],
      ["R1.2", "LED1.a"]
    ],
    dontcare: ["IC1.8", "IC1.9", "IC1.10", "IC1.11", "IC1.12", "IC1.13"],
    tpRequired: ["IC1.6"],
    expect: {
      inputs: [["A", 1], ["B", 1], ["C", 0]],
      note: "the door is closed and a floor is selected, but the car is overloaded",
      levels: { "IC1.6": 0 }
    },
    stages: [
      { name: "Inputs and the chip",
        parts: ["+5V", "0V", "A", "B", "C", "IC1", "R2", "R3", "R4"],
        hint: "Sit the chip straddling the centre channel, get the three inputs onto the " +
              "right pins with their pull-downs to 0 V, and link gate a's output to gate " +
              "b's input. The output sub-system unlocks once this checks clean." },
      { name: "The output sub-system",
        parts: ["R1", "LED1"],
        hint: "Now add the resistor and the LED from the chip's output down to 0 V, mark the " +
              "test point, and say what it will read — the Test point tool gives you the " +
              "input conditions." }
    ],
    reference: {
      cuts: [],
      placements: [
        { id: "IC1",  footprint: "dip-14-bb", at: "G20", rot: 0 },   // straddles the channel, cols 20-26
        { id: "A",    footprint: "term-1", at: "I20" },              // pin 1's own column
        { id: "B",    footprint: "term-1", at: "I21" },              // pin 2's own column
        { id: "C",    footprint: "term-1", at: "I24" },              // pin 5's own column
        { id: "+5V",  footprint: "term-1", at: "A2" },
        { id: "0V",   footprint: "term-1", at: "N2" },
        // pull-downs: leg "1" joins the input's own column, leg "2" reaches the
        // bottom rail three rows down — a common real layout, not a stripboard habit
        { id: "R2",   footprint: "res-4",  at: "K20", rot: 90 },
        { id: "R3",   footprint: "res-4",  at: "K21", rot: 90 },
        { id: "R4",   footprint: "res-4",  at: "K24", rot: 90 },
        { id: "R1",   footprint: "res-4",  at: "I25", rot: 0 },      // shares pin 6's column
        { id: "LED1", footprint: "led-2",  at: "J28", rot: 0 }       // anode shares R1's far column
      ],
      links: [
        { a: "A20", b: "D20", colour: "red",    num: 1 },   // + rail -> pin 14's column
        { a: "J26", b: "N26", colour: "black",  num: 2 },   // pin 7's column -> 0 V rail; from J, so it does not run under R1 (17 Oct 2026)
        { a: "I22", b: "I23", colour: "orange", num: 3 },   // gate a's output -> gate b's input
        { a: "K29", b: "N29", colour: "black",  num: 4 },   // LED1's cathode column -> 0 V rail
        { a: "B5",  b: "N5",  colour: "black",  num: 5 },   // bridge the two 0 V rails together
        { a: "B21", b: "F21", colour: "black",  num: 6 },   // spare pin 13 -> 0 V
        { a: "B22", b: "F22", colour: "black",  num: 7 },   // spare pin 12 -> 0 V
        { a: "B24", b: "F24", colour: "black",  num: 8 },   // spare pin 10 -> 0 V
        { a: "B25", b: "F25", colour: "black",  num: 9 }    // spare pin 9 -> 0 V
      ],
      testpoints: [{ id: "TP1", at: "K25", predict: 0 }]
    },
    circuit: (C, o) => twoGateChip(C, { kind: "and", part: "7408",
                                       in: ["A", "B", "C"], pulls: ["R2", "R3", "R4"],
                                       led: "LED1" }, o),
    why: [
      "Both gates live in ONE package, so the chip is placed once, straddling the centre " +
      "channel with its two rows of pins in the a–e and f–j halves — not drawn as two " +
      "separate ICs.",
      "Gate a's output (pin 3) has to reach gate b's input (pin 4) by a jumper wire: " +
      "adjacent pins down one side of a chip are never connected by the board itself.",
      "Every switched input needs its own 10 kΩ pull-down to 0 V, or the pin floats and " +
      "reads whatever it likes when the switch is open.",
      "The two gates not in use still have their inputs tied to 0 V — a spare gate's " +
      "output is left alone, but its inputs are never left floating."
    ]
  };

  /* ------------------------------------------------------------------------
     Q3 — Buzzer switched by a transistor.  The can's three legs come out in
     a triangle; turned 90° on a breadboard they land in three different
     columns (c, b, e), which is why the transistor rotates here and not on
     stripboard, where turning it would short two legs onto one track.
     ------------------------------------------------------------------------ */
  const transistorBuzzer = {
    id: "transistor-buzzer-bb",
    title: "Buzzer switched by a transistor",
    board: "bb-400",
    scaffold: "blank",
    scenario: [
      "A push switch sounds a buzzer. The buzzer draws more current than the switch " +
      "contacts should carry, so an NPN transistor does the switching.",
      "The switch and the buzzer are both off the board, on 2-way terminal blocks."
    ],
    components: [
      { id: "+5V", footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",  footprint: "term-1", name: "0 V supply", neg: true },
      { id: "SW",  footprint: "term-2", name: "SW1 — push switch", symmetric: true },
      { id: "R1",  footprint: "res-4",  name: "R1 (1 kΩ base resistor)" },
      { id: "Q1",  footprint: "npn-can", name: "Q1 — BC548" },
      { id: "BUZ", footprint: "term-2", name: "BUZ1 — buzzer", symmetric: true }
    ],
    target: [
      ["+5V.1", "SW.1", "BUZ.1"],
      ["SW.2", "R1.1"],
      ["R1.2", "Q1.b"],
      ["0V.1", "Q1.e"],
      ["Q1.c", "BUZ.2"]
    ],
    dontcare: [],
    reference: {
      cuts: [],
      placements: [
        { id: "+5V", footprint: "term-1", at: "A2" },
        { id: "0V",  footprint: "term-1", at: "B2" },
        { id: "SW",  footprint: "term-2", at: "A5",  rot: 90 },   // A5 (+5 V) and C5
        { id: "BUZ", footprint: "term-2", at: "A20", rot: 90 },   // A20 (+5 V) and C20
        { id: "R1",  footprint: "res-4",  at: "C15", rot: 0 },    // legs C15, C18 — row c leaves row e free for link 3
        { id: "Q1",  footprint: "npn-can", at: "D10", rot: 90 }   // c D12, b E11, e D10 — a row down, so link 4 meets column 10 above the can (17 Oct 2026)
      ],
      links: [
        { a: "F5",  b: "F15", colour: "blue",   num: 1 },   // SW's far column -> R1's near column
        { a: "G18", b: "G11", colour: "orange", num: 2 },   // R1's far column -> Q1 base column; row G, not F, so it does not lie along link 1
        { a: "E20", b: "E12", colour: "green",  num: 3 },   // BUZ's far column -> Q1 collector column
        { a: "B10", b: "C10", colour: "black",  num: 4 }    // 0 V rail -> Q1 emitter column, clear of the can
      ],
      testpoints: []
    },
    circuit: (C, o) => {
      const q = C.npn(164, 160, { label: "Q1" });
      const TOP = 26, BOT = 236, XS = 86, XQ = 174;
      const b =
        C.rail(RAIL_L, 236, TOP, { pos: true }) + C.rail(RAIL_L, 236, BOT) +
        C.node(XS, TOP) + C.node(XQ, TOP) +
        C.wire([[XS, TOP], [XS, 54]], "sbd-pos") +
        C.sw(XS, 72, { dir: "v", span: 36, label: "SW1" }) +
        C.wire([[XS, 90], [XS, 118]]) +
        C.res(XS, 146, { dir: "v", span: 56, label: "R1", value: "1 kΩ", labelLeft: true }) +
        C.wire([[XS, 174], [XS, 206], [130, 206], [130, 160]]) +
        C.wire([[XQ, TOP], [XQ, 60]], "sbd-pos") +
        C.sounder(XQ, 78, { dir: "v", span: 48, label: "BUZ1" }) +
        C.wire([[XQ, 93], [XQ, 128]]) +
        q.svg +
        C.wire([[XQ, 192], [XQ, BOT]]) + C.node(XQ, BOT) +
        nn(C, o, 120, TOP, 1) + nn(C, o, XS, 104, 2) + nn(C, o, 108, 206, 3) +
        nn(C, o, XQ, 114, 5) + nn(C, o, 120, BOT, 4);
      return { w: 258, h: 260, body: b };
    },
    why: [
      "The transistor can rotates on a breadboard: turned so its three legs land in three " +
      "different columns, one net per leg. Left at its default turning two legs would land " +
      "in the same column and short — the opposite risk from stripboard, where turning it " +
      "is what causes the short.",
      "Look at the order the legs come out in: collector, base, emitter. Which way round it " +
      "goes decides which column each net lands on.",
      "The switch and the buzzer are drawn as components but built as <strong>terminal " +
      "blocks</strong> — the layout shows the connector pushed into the board.",
      "Nothing here needs a cut — a breadboard has no copper to cut. Two nets stay apart " +
      "simply by not sharing a column."
    ]
  };

  /* ------------------------------------------------------------------------
     Block 6 Lesson 4 — the 555 astable (added 29 Oct 2026).  The booklet's
     and the Lesson 4 page's circuit: R1 1 kΩ, R2 10 kΩ, C1 100 µF on 5 V, a
     red LED from pin 3 down to 0 V and a green LED from +5 V down to pin 3,
     so they take turns.  The layout is the build guide's breadboard (tools/build-guides/circuits.mjs), which passes SBD.check.
     Pin 3 never holds one level, so there is a test point to plan but no
     reading to predict (expect: null).
     ------------------------------------------------------------------------ */
  const astable555 = {
    id: "astable-555",
    title: "Flashing shop sign",
    board: "bb-400",
    scaffold: "blank",
    scenario: [
      "A shop sign has a red light and a green light that flash in turn, over and over, " +
      "with nobody pressing anything.",
      "IC1 is a 555 wired as an <strong>astable</strong>. R1, R2 and C1 set how fast it " +
      "flashes."
    ],
    components: [
      { id: "+5V",  footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",   footprint: "term-1", name: "0 V supply", neg: true },
      { id: "IC1",  footprint: "dip-8-bb",  part: "555", name: "IC1 — 555 timer" },
      { id: "R1",   footprint: "res-4",   name: "R1 (1 kΩ) — timing" },
      { id: "R2",   footprint: "res-4",  name: "R2 (10 kΩ) — timing" },
      { id: "C1",   footprint: "ecap-2", name: "C1 (100 µF) — timing" },
      { id: "R3",   footprint: "res-4",  name: "R3 (270 Ω)" },
      { id: "R4",   footprint: "res-4",  name: "R4 (270 Ω)" },
      { id: "LED1", footprint: "led-2",  name: "LED1 — red", colour: "red" },
      { id: "LED2", footprint: "led-2",  name: "LED2 — green", colour: "green" }
    ],
    target: [
      ["+5V.1", "IC1.8", "IC1.4", "R1.1", "R4.2"],
      ["0V.1", "IC1.1", "C1.-", "LED1.k"],
      ["R1.2", "R2.2", "IC1.7"],
      ["R2.1", "IC1.6", "IC1.2", "C1.+"],
      ["IC1.3", "R3.1", "LED2.k"],
      ["R3.2", "LED1.a"],
      ["R4.1", "LED2.a"]
    ],
    // pin 5 (Control Voltage) is left open, which is ordinary practice
    dontcare: ["IC1.5"],
    tpRequired: ["IC1.3"],
    expect: null,
    stages: [
      { name: "The chip and its timing parts",
        parts: ["+5V", "0V", "IC1", "R1", "R2", "C1"],
        hint: "Push the 555 across the centre gap, notch to the left, pin 1 bottom left. Link pin 8 and pin 4 to +5 V and pin 1 to 0 V. R1 from the + rail to pin 7's column. R2 from pin 7's column to a spare column, which the yellow links join to pins 6 and 2. C1's long (+) leg goes in that column too." },
      { name: "The output sub-system",
        parts: ["R3", "R4", "LED1", "LED2"],
        hint: "R3 from pin 3's column to the red LED, which goes to 0 V. R4 drops from the + rail to the green LED; the blue link brings its short leg back to pin 3. Then the test point on pin 3." }
    ],
    reference: {
      cuts: [],
      placements: [
        { id: "+5V", footprint: "term-1", at: "A2" },
        { id: "0V", footprint: "term-1", at: "B2" },
        { id: "IC1", footprint: "dip-8-bb", at: "G10", rot: 0 },
        { id: "R1", footprint: "res-4", at: "A11", rot: 90 },
        { id: "R2", footprint: "res-4", at: "E8", rot: 0 },
        { id: "C1", footprint: "ecap-2", at: "K8", rot: 0 },
        { id: "R3", footprint: "res-4", at: "J12", rot: 0 },
        { id: "LED1", footprint: "led-2", at: "I15", rot: 0 },
        { id: "R4", footprint: "res-4", at: "J22", rot: 90 },
        { id: "LED2", footprint: "led-2", at: "H21", rot: 180 }
      ],
      links: [
        { a: "A30", b: "M30", colour: "red", num: 1 },
        { a: "B29", b: "N29", colour: "black", num: 2 },
        { a: "A10", b: "C10", colour: "red", num: 3 },
        { a: "L13", b: "M13", colour: "red", num: 4 },
        { a: "L10", b: "N10", colour: "black", num: 5 },
        { a: "G8", b: "H8", colour: "yellow", num: 6 },
        { a: "F8", b: "F12", colour: "yellow", num: 7 },
        { a: "I8", b: "I11", colour: "yellow", num: 8 },
        { a: "L9", b: "N9", colour: "black", num: 9 },
        { a: "L16", b: "N16", colour: "black", num: 10 },
        { a: "K12", b: "K21", colour: "blue", num: 11 }
      ],
      testpoints: [{ id: "TP1", at: "L12" }]
    },
    circuit: (C, o) => {
      // drawn as the booklet and the Lesson 4 page draw it
      const TOP = 24, BOT = 300, XT = 110, XO = 330;
      const ic = C.icBlock(220, 160, { w: 70, h: 110, name: "555",
        left:   [{ num: "7", at: 0.12 }, { num: "6", at: 0.62 }, { num: "2", at: 0.86 }],
        top:    [{ num: "4", at: 0.35 }, { num: "8", at: 0.78 }],
        right:  [{ num: "3", at: 0.5 }],
        bottom: [{ num: "1", at: 0.35 }, { num: "5", at: 0.78 }] });
      const P = ic.at;
      const b =
        C.rail(RAIL_L, 360, TOP, { pos: true }) + C.rail(RAIL_L, 360, BOT) +
        ic.svg +
        C.wire([P["8"], [P["8"][0], TOP]], "sbd-pos") + C.node(P["8"][0], TOP) +
        C.wire([P["4"], [P["4"][0], TOP]], "sbd-pos") + C.node(P["4"][0], TOP) +
        C.wire([P["1"], [P["1"][0], BOT]]) + C.node(P["1"][0], BOT) +

        // the timing chain: R1, then R2 down to pins 6 and 2, then C1 to 0 V
        C.node(XT, TOP) + C.wire([[XT, TOP], [XT, 40]], "sbd-pos") +
        C.res(XT, 68, { dir: "v", span: 56, label: "R1", value: "1 kΩ", labelLeft: true }) +
        C.wire([[XT, 96], [XT, P["7"][1]]]) + C.node(XT, P["7"][1]) + C.wire([[XT, P["7"][1]], P["7"]]) +
        C.res(XT, 146, { dir: "v", span: 54, label: "R2", value: "10 kΩ", labelLeft: true }) +
        C.node(XT, P["6"][1]) + C.wire([[XT, P["6"][1]], P["6"]]) +
        C.wire([[XT, P["6"][1]], [XT, 212]]) + C.node(XT, P["2"][1]) + C.wire([[XT, P["2"][1]], P["2"]]) +
        C.ecap(XT, 240, { span: 56, label: "C1", value: "100 µF" }) +
        C.wire([[XT, 268], [XT, BOT]]) + C.node(XT, BOT) +

        // pin 3 sinks the green LED and sources the red one
        C.wire([P["3"], [XO, P["3"][1]]]) + C.node(XO, P["3"][1]) +
        C.node(XO, TOP) + C.wire([[XO, TOP], [XO, 36]], "sbd-pos") +
        C.res(XO, 60, { dir: "v", span: 48, label: "R4", value: "270 Ω", labelLeft: true }) +
        C.wire([[XO, 84], [XO, 96]]) + C.led(XO, 112, { dir: "d", span: 32, label: "LED2" }) +
        C.wire([[XO, 128], [XO, 176]]) +
        C.res(XO, 200, { dir: "v", span: 48, label: "R3", value: "270 Ω", labelLeft: true }) +
        C.wire([[XO, 224], [XO, 236]]) + C.led(XO, 252, { dir: "d", span: 32, label: "LED1" }) +
        C.wire([[XO, 268], [XO, BOT]]) + C.node(XO, BOT) +

        nn(C, o, 70, TOP, 1) + nn(C, o, 160, BOT, 2) +
        nn(C, o, 150, P["7"][1], 3) + nn(C, o, 150, P["6"][1], 4) +
        nn(C, o, 290, P["3"][1], 5) + nn(C, o, XO, 230, 6) + nn(C, o, XO, 90, 7);
      return { w: 380, h: 324, body: b };
    },
    why: [
      "An <strong>astable</strong> has no stable state. The output on <strong>pin 3</strong> " +
      "keeps switching between high and low by itself — that is what makes the lights flash.",
      "<strong>Pins 2 and 6 are joined, and C1's + leg is on them too.</strong> C1 charges " +
      "through R1 and R2, then empties through R2 into <strong>pin 7</strong>. Miss that " +
      "join and nothing flashes.",
      "<strong>R1 is in the mark only.</strong> C1 charges through R1 + R2 but empties " +
      "through R2 alone, so pin 3 stays high a little longer than it stays low.",
      "<strong>Two LEDs, one output.</strong> The red LED goes from pin 3 down to 0 V, so it " +
      "is on when pin 3 is high. The green LED comes from +5 V down to pin 3, so it is on " +
      "when pin 3 is low. They take turns.",
      "<strong>Reset (pin 4) is tied to +5 V</strong> and pin 5 is left open, which is " +
      "normal. The 555 is drawn as a box with pin numbers — page 3 of the data sheet turns " +
      "each number into a job.",
      "Pin 3 never sits still, so its test point has no single reading to predict. A logic " +
      "probe there flashes red and green in time with the LEDs."
    ]
  };

  /* ------------------------------------------------------------------------
     Block 6 Lesson 3 — the 555 monostable (added 29 Oct 2026).  The booklet's
     and the Lesson 3 page's circuit: R2 100 kΩ, C1 100 µF (about 11 s), R1
     10 kΩ pull-up and SW1 slide switch on pin 2, pin 3 → R3 270 Ω → LED1.
     The layout is the build guide's breadboard (tools/build-guides/circuits.mjs), which passes SBD.check.  The Stairwell question keeps its own push-button 555.
     ------------------------------------------------------------------------ */
  const monostable555 = {
    id: "monostable-555",
    title: "Quiz answer timer",
    board: "bb-400",
    scaffold: "blank",
    scenario: [
      "In a quiz, a player slides a switch and a light comes on for about 11 seconds — " +
      "their time to answer. Then it goes off by itself.",
      "IC1 is a 555 wired as a <strong>monostable</strong>. R2 and C1 set how long the " +
      "light stays on; R1 and the slide switch SW1 start it."
    ],
    components: [
      { id: "+5V",  footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",   footprint: "term-1", name: "0 V supply", neg: true },
      { id: "SW1",  footprint: "spdt-3", name: "SW1 — slide switch" },
      { id: "IC1",  footprint: "dip-8-bb",  part: "555", name: "IC1 — 555 timer" },
      { id: "R1",   footprint: "res-4",   name: "R1 (10 kΩ) — pull-up" },
      { id: "R2",   footprint: "res-4",   name: "R2 (100 kΩ) — timing" },
      { id: "C1",   footprint: "ecap-2", name: "C1 (100 µF) — timing" },
      { id: "R3",   footprint: "res-4",  name: "R3 (270 Ω)" },
      { id: "LED1", footprint: "led-2",  name: "LED1 — the answer light", colour: "red" }
    ],
    target: [
      ["+5V.1", "IC1.8", "IC1.4", "R1.2", "R2.1", "SW1.1"],
      ["0V.1", "IC1.1", "C1.-", "LED1.k", "SW1.2"],
      ["SW1.c", "R1.1", "IC1.2"],
      ["R2.2", "IC1.7", "IC1.6", "C1.+"],
      ["IC1.3", "R3.1"],
      ["R3.2", "LED1.a"]
    ],
    dontcare: ["IC1.5"],
    tpRequired: ["IC1.2", "IC1.3"],
    expect: {
      inputs: [["SW1", "at 0 V"]],
      note: "the switch has just been slid to 0 V, so Trigger is low and the timed " +
            "pulse has started",
      levels: { "IC1.2": 0, "IC1.3": 1 }
    },
    stages: [
      { name: "The chip and its timing parts",
        parts: ["+5V", "0V", "IC1", "R2", "C1"],
        hint: "555 across the centre gap, notch left. Link pin 8 and pin 4 to +5 V, pin 1 to 0 V. R2 from the + rail to pin 7's column. A short yellow link joins pin 7 to pin 6. C1's + leg goes in pin 6's column, its − leg in the 0 V rail." },
      { name: "The trigger",
        parts: ["SW1", "R1"],
        hint: "A link carries pin 2 to a spare column. SW1 sits along a row with its middle pin in that column and its outer pins in columns linked to +5 V and 0 V. R1 runs from pin 2's column to a column linked to +5 V." },
      { name: "The output sub-system",
        parts: ["R3", "LED1"],
        hint: "R3 from pin 3's column to the LED; the LED's short leg goes to a column linked to 0 V. Then the test points on pin 2 and pin 3, and what each reads with the switch at 0 V." }
    ],
    reference: {
      cuts: [],
      placements: [
        { id: "+5V", footprint: "term-1", at: "A2" },
        { id: "0V", footprint: "term-1", at: "B2" },
        { id: "IC1", footprint: "dip-8-bb", at: "G10", rot: 0 },
        { id: "R2", footprint: "res-4", at: "A11", rot: 90 },
        { id: "C1", footprint: "ecap-2", at: "B12", rot: 270 },
        { id: "R1", footprint: "res-4", at: "K11", rot: 0 },
        { id: "SW1", footprint: "spdt-3", at: "J6", rot: 0 },
        { id: "R3", footprint: "res-4", at: "I12", rot: 0 },
        { id: "LED1", footprint: "led-2", at: "H15", rot: 0 }
      ],
      links: [
        { a: "A30", b: "M30", colour: "red", num: 1 },
        { a: "B29", b: "N29", colour: "black", num: 2 },
        { a: "A10", b: "C10", colour: "red", num: 3 },
        { a: "L13", b: "M13", colour: "red", num: 4 },
        { a: "L10", b: "N10", colour: "black", num: 5 },
        { a: "F11", b: "F12", colour: "yellow", num: 6 },
        { a: "L14", b: "M14", colour: "red", num: 7 },
        { a: "L6", b: "M6", colour: "red", num: 8 },
        { a: "I7", b: "I11", colour: "green", num: 9 },
        { a: "L8", b: "N8", colour: "black", num: 10 },
        { a: "L16", b: "N16", colour: "black", num: 11 }
      ],
      testpoints: [{ id: "TP1", at: "J11", predict: 0 }, { id: "TP2", at: "L12", predict: 1 }]
    },
    circuit: (C, o) => {
      // drawn as the booklet and the Lesson 3 page draw it
      const TOP = 24, BOT = 300, XS = 76, XT = 160, XO = 360;
      const ic = C.icBlock(260, 160, { w: 70, h: 110, name: "555",
        left:   [{ num: "7", at: 0.12 }, { num: "6", at: 0.62 }, { num: "2", at: 0.86 }],
        top:    [{ num: "4", at: 0.35 }, { num: "8", at: 0.78 }],
        right:  [{ num: "3", at: 0.5 }],
        bottom: [{ num: "1", at: 0.35 }, { num: "5", at: 0.78 }] });
      const P = ic.at;
      const b =
        C.rail(RAIL_L, 400, TOP, { pos: true }) + C.rail(RAIL_L, 400, BOT) +
        ic.svg +
        C.wire([P["8"], [P["8"][0], TOP]], "sbd-pos") + C.node(P["8"][0], TOP) +
        C.wire([P["4"], [P["4"][0], TOP]], "sbd-pos") + C.node(P["4"][0], TOP) +
        C.wire([P["1"], [P["1"][0], BOT]]) + C.node(P["1"][0], BOT) +

        // the timing chain: R2 into pin 7, pin 6 tied to it, C1 to 0 V
        C.node(XT, TOP) + C.wire([[XT, TOP], [XT, 40]], "sbd-pos") +
        C.res(XT, 68, { dir: "v", span: 56, label: "R2", value: "100 kΩ" }) +
        C.wire([[XT, 96], [XT, 222]]) +
        C.node(XT, P["7"][1]) + C.wire([[XT, P["7"][1]], P["7"]]) +
        C.node(XT, P["6"][1]) + C.wire([[XT, P["6"][1]], P["6"]]) +
        C.ecap(XT, 250, { span: 56, label: "C1", value: "100 µF" }) +
        C.wire([[XT, 278], [XT, BOT]]) + C.node(XT, BOT) +

        /* the trigger: R1 holds pin 2 high, SW1 takes it to 0 V.  Its wire
           crosses the timing column with no junction dot — the dot is the only
           thing that means a join. */
        C.node(XS, TOP) + C.wire([[XS, TOP], [XS, 40]], "sbd-pos") +
        C.res(XS, 68, { dir: "v", span: 56, label: "R1", value: "10 kΩ", labelLeft: true }) +
        C.wire([[XS, 96], [XS, 250], [XS + 15, 250]]) + C.node(XS, P["2"][1]) +
        C.wire([[XS, P["2"][1]], P["2"]]) +
        C.spdt(XS + 26, 250, {}) + C.text(XS + 20, 284, "SW1") +
        C.wire([[XS + 52, 237], [XS + 52, TOP]], "sbd-pos") + C.node(XS + 52, TOP) +
        C.wire([[XS + 52, 263], [XS + 52, BOT]]) + C.node(XS + 52, BOT) +

        // the output drives the light
        C.wire([P["3"], [XO, P["3"][1]], [XO, 190]]) +
        C.res(XO, 214, { dir: "v", span: 48, label: "R3", value: "270 Ω", labelLeft: true }) +
        C.wire([[XO, 238], [XO, 250]]) + C.led(XO, 266, { dir: "d", span: 32, label: "LED1" }) +
        C.wire([[XO, 282], [XO, BOT]]) + C.node(XO, BOT) +

        nn(C, o, 102, TOP, 1) + nn(C, o, 200, BOT, 2) +
        nn(C, o, 200, P["2"][1], 3) + nn(C, o, 200, P["7"][1], 4) +
        nn(C, o, 330, P["3"][1], 5) + nn(C, o, XO, 244, 6);
      return { w: 420, h: 324, body: b };
    },
    why: [
      "A <strong>monostable</strong> has one stable state. Pulling <strong>Trigger " +
      "(pin 2)</strong> low starts one output pulse. The pulse ends by itself once C1 has " +
      "charged through R2 to two thirds of the supply.",
      "<strong>Threshold (pin 6), Discharge (pin 7) and C1's + leg are one net.</strong> " +
      "That join is what makes it a timer: T = 1.1 × R2 × C1 = 1.1 × 100 kΩ × 100 µF, " +
      "about 11 s.",
      "<strong>R1 is a pull-up.</strong> It keeps pin 2 high while the switch is between " +
      "its two positions, so the timer does not start by itself.",
      "<strong>Slide SW1 back straight away.</strong> While pin 2 is held low, the output " +
      "stays high however long the timing is.",
      "<strong>Reset (pin 4) is tied to +5 V</strong> and pin 5 is left open, which is " +
      "normal.",
      "With SW1 at 0 V, <strong>the test point on pin 2 reads logic 0</strong> and " +
      "<strong>the one on pin 3 reads logic 1</strong>: the pulse has started. A 1 on pin 2 " +
      "puts the fault in the switch wiring, not the chip."
    ]
  };

  root.QUESTIONS = [ledResistor, liftInterlock, transistorBuzzer, astable555,
                    monostable555];

})(typeof globalThis !== "undefined" ? globalThis : this);
