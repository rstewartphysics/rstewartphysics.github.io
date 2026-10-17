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

  root.QUESTIONS = [ledResistor, liftInterlock, transistorBuzzer];

})(typeof globalThis !== "undefined" ? globalThis : this);
