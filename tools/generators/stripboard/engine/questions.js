/* ============================================================================
   Stripboard Builder — authored questions
   ----------------------------------------------------------------------------
   One record per circuit (PLAN.md §12.5).  Convert, Fault-finder and Reverse
   are all generated from this, so they cannot drift apart.

   `reference` exists to be asserted against `target` by the golden tests
   (R4): a question whose reference layout does not produce its own target
   netlist is not publishable.
   ============================================================================ */
(function (root) {
  "use strict";

  /* ------------------------------------------------------------------------
     Circuit-diagram conventions — rebuilt 9 Sep 2026 after alpha feedback.

     Every diagram is now the picture a pupil meets in a question paper: two
     horizontal supply rails with the components cabled between them.  Three
     things that used to be drawn have gone:

       * the dashed "system box" round the gates that share one package;
       * the wires from the rails to the chip's Vcc and 0 V pins;
       * the ringed net numbers, and the gate pin numbers.

     The power wiring is gone because working out that a 7408 wants +5 V on
     pin 14 and 0 V on pin 7 IS the skill being taught, and the data sheet the
     page links to is where that is read.  The rails are still drawn and the
     target netlist still demands both connections, so a pupil who never looks
     at the sheet fails the check and is told which pin is floating.

     Net numbers and pin numbers come back under `o.nets`, which is what "Show
     the answer" passes — there they teach instead of giving the game away.
     ------------------------------------------------------------------------ */
  const RAIL_L = 26;                       // both rails start at this x
  const pinNos = (o, arr) => (o && o.nets ? arr : null);
  const nn = (C, o, x, y, num) => (o && o.nets ? C.netnum(x, y, num) : "");


  /* ------------------------------------------------------------------------
     The §5.1 archetype drawn once.  Three archetype questions are the same
     picture with a different gate shape, chip number and labels — the lift
     interlock, the kiln interlock and the car park sign — so they share one
     drawing rather than three that can drift apart.  `kind` is "and" or "or",
     and the gate pin numbers are the same on a 7408 and a 7432.
     ------------------------------------------------------------------------ */
  /* Three switched inputs, so three 10 kΩ pull-downs — one per input, each
     from the input wire straight down to 0 V.  They are what makes an open
     switch read as logic 0 instead of leaving the pin floating, so they are
     drawn as part of the circuit, not tucked away in a note.  The drawing has
     to be wide enough to stand them side by side with their values legible:
     the two upper drops cross the third input's wire on the way down, and a
     crossing with no dot is not a join (the convention the topic pages use
     throughout). */
  /* One 10 kΩ pull-down, drawn from an input wire straight down to the 0 V
     rail.  Shared, because every switched input on every board gets one and
     they must all look identical. */
  const pullDown = (C, x, y, label, bot) =>
    C.wire([[x, y], [x, 162]]) + C.node(x, y) +
    C.res(x, 190, { dir: "v", span: 56, label: label, value: "10 k\u03a9" }) +
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
      C.wire([[224, 74], [224, 119]]) +            // gate a's output down to pin 4

      C.wire([[280, 130], [XO, 130], [XO, 152]]) +
      C.res(XO, 180, { dir: "v", span: 56, label: "R1", value: "270 \u03a9", labelLeft: true }) +
      C.wire([[XO, 208], [XO, 222]]) +
      C.led(XO, 240, { dir: "d", span: 36, label: spec.led }) +
      C.wire([[XO, 258], [XO, BOT]]) + C.node(XO, BOT) +

      nn(C, o, 150, 63, 3) + nn(C, o, 150, 85, 4) + nn(C, o, 150, 141, 6) +
      nn(C, o, 224, 94, 5) + nn(C, o, XO, 141, 7) + nn(C, o, XO, 215, 8) +
      nn(C, o, 170, TOP, 1) + nn(C, o, 220, BOT, 2);
    return { w: 344, h: 292, body: body };
  }

  /* ------------------------------------------------------------------------
     Q1 — LED and series resistor.  Small board, no IC, and deliberately NO
     CUTS at all: proves the engine never demands a cut it does not need.
     ------------------------------------------------------------------------ */
  const ledResistor = {
    id: "led-resistor",
    title: "LED and series resistor",
    board: "34-0410",
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
        { id: "R1",   footprint: "res-4",  at: "A5", rot: 90 },   // legs A5 and D5
        { id: "LED1", footprint: "led-2",  at: "D8", rot: 90 },   // legs D8 and E8
        { id: "0V",   footprint: "term-1", at: "E2" }
      ],
      links: [],
      testpoints: []
    },
    /* Circuit diagram (PLAN.md R5 — read pin by pin against `target` before the
       question is enabled).  Drawn portrait, because the board is limited by
       screen HEIGHT and the width beside it is what is going spare. */
    circuit: (C, o) => {
      const X = 132, TOP = 30, BOT = 216;
      const b =
        C.rail(RAIL_L, 236, TOP, { pos: true }) + C.rail(RAIL_L, 236, BOT) +
        C.node(X, TOP) + C.node(X, BOT) +
        C.wire([[X, TOP], [X, 60]], "sbd-pos") +
        C.res(X, 90, { dir: "v", span: 60, label: "R1", value: "270 \u03a9" }) +
        C.wire([[X, 120], [X, 144]]) +
        C.led(X, 164, { dir: "d", span: 40, label: "LED1" }) +
        C.wire([[X, 184], [X, BOT]]) +
        nn(C, o, X, 46, 1) + nn(C, o, X, 132, 2) + nn(C, o, X, 200, 3);
      return { w: 258, h: 244, body: b };
    },
    why: [
      "The resistor and the LED are in series between +5 V and 0 V, so the board " +
      "needs three nets and each one becomes a track.",
      "Both legs of a part must land in <strong>different</strong> tracks, or the part " +
      "is shorted out — which is why the resistor and the LED both sit across the " +
      "tracks rather than along one."
    ]
  };

  /* ------------------------------------------------------------------------
     Q2 — Lift door interlock.  The spine of the bank (PLAN.md §5.1): a
     3-input AND built from TWO gates of ONE 7408, so the pupil must
     realise there is one chip, cut all seven tracks it crosses, and link
     gate a's output (pin 3) to gate b's input (pin 4).
     ------------------------------------------------------------------------ */
  const liftInterlock = {
    id: "lift-interlock",
    title: "Lift door interlock",
    board: "34-0411",
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
      { id: "IC1",  footprint: "dip-14", part: "7408", name: "IC1 — 7408 quad 2-input AND" },
      { id: "R1",   footprint: "res-4",  name: "R1 (270 Ω)" },
      { id: "R2",   footprint: "res-4",  name: "R2 (10 kΩ) — pull-down on A" },
      { id: "R3",   footprint: "res-4",  name: "R3 (10 kΩ) — pull-down on B" },
      { id: "R4",   footprint: "res-4",  name: "R4 (10 kΩ) — pull-down on C" },
      { id: "LED1", footprint: "led-2",  name: "LED1 — motor enable" }
    ],
    target: [
      ["+5V.1", "IC1.14"],
      ["0V.1", "IC1.7", "LED1.k", "R2.1", "R3.1", "R4.2"],
      ["A.1", "IC1.1", "R2.2"],
      ["B.1", "IC1.2", "R3.2"],
      ["IC1.3", "IC1.4"],
      ["C.1", "IC1.5", "R4.1"],
      ["IC1.6", "R1.1"],
      ["R1.2", "LED1.a"]
    ],
    /* Gates c and d are unused, and their INPUTS still have to be held at 0 V —
       rank 2.2 enforces that on any board.  Where the pupil takes them down is
       their own business, so the netlist comparison stays blind to them; the
       spare outputs (8 and 11) drive nothing and are left alone. */
    dontcare: ["IC1.8", "IC1.9", "IC1.10", "IC1.11", "IC1.12", "IC1.13"],
    tpRequired: ["IC1.6"],
    /* The reading the test point is FOR (QVSR: the expected value is planned on
       the layout before the board is built).  Authored per net, not per hole —
       the pupil chooses where on that net to put the probe. */
    expect: {
      inputs: [["A", 1], ["B", 1], ["C", 0]],
      note: "the door is closed and a floor is selected, but the car is overloaded",
      levels: { "IC1.6": 0 }
    },
    /* Sub-system staging (§4.1 / the alpha feedback): the switching into the
       chip is checked on its own before the output sub-system is unlocked. */
    stages: [
      { name: "Inputs and the chip",
        parts: ["+5V", "0V", "A", "B", "C", "IC1", "R2", "R3", "R4"],
        hint: "Place the chip, cut every track it crosses, and get the three inputs " +
              "onto the right pins — plus the link from gate a's output to gate b's input. " +
              "The output sub-system unlocks once this checks clean." },
      { name: "The output sub-system",
        parts: ["R1", "LED1"],
        hint: "Now add the resistor and the LED from the chip's output down to 0 V, mark the " +
              "test point, and say what it will read — the Test point tool gives you the " +
              "input conditions." }
    ],
    reference: {
      // the seven cuts are the column between the chip's two rows of pins
      cuts: ["F11", "G11", "H11", "I11", "J11", "K11", "L11"],
      placements: [
        { id: "IC1",  footprint: "dip-14", at: "F10" },   // pins 1-7 in col 10, 14-8 in col 13
        { id: "A",    footprint: "term-1", at: "F2" },
        { id: "B",    footprint: "term-1", at: "G2" },
        { id: "C",    footprint: "term-1", at: "J2" },
        { id: "0V",   footprint: "term-1", at: "M2" },    // the 0 V rail, track M
        { id: "+5V",  footprint: "term-1", at: "F20" },   // right of the cut, with pin 14
        // A and B pull down UPWARDS: three tracks below pin 1 is pin 4, which
        // gate a drives, and three below pin 2 is pin 5, which C drives — a
        // resistor either way would short a live net to 0 V.  C's pull-down
        // has clear board below it and reaches the rail on its own.
        { id: "R2",   footprint: "res-4",  at: "C4", rot: 90 },   // C4 (0 V) to F4 (pin 1)
        { id: "R3",   footprint: "res-4",  at: "D6", rot: 90 },   // D6 (0 V) to G6 (pin 2)
        { id: "R4",   footprint: "res-4",  at: "J8", rot: 90 },   // J8 (pin 5) to M8 (0 V rail)
        { id: "R1",   footprint: "res-4",  at: "K3", rot: 90 },   // legs K3 (pin 6) and N3
        { id: "LED1", footprint: "led-2",  at: "N5", rot: 90 }    // legs N5 (anode) and O5
      ],
      links: [
        { a: "H9", b: "I9", colour: "orange", num: 1 },   // pin 3 -> pin 4
        { a: "O4", b: "M4", colour: "black",  num: 2 },   // LED cathode -> the 0 V rail
        { a: "C22", b: "M22", colour: "black", num: 3 },  // R2's far leg -> 0 V
        { a: "D5", b: "M5", colour: "black",  num: 4 },   // R3's far leg -> 0 V
        { a: "L7", b: "M7", colour: "black",  num: 5 },   // pin 7 -> 0 V
        { a: "G14", b: "M14", colour: "black", num: 6 },  // spare pin 13
        { a: "H15", b: "M15", colour: "black", num: 7 },  // spare pin 12
        { a: "J16", b: "M16", colour: "black", num: 8 },  // spare pin 10
        { a: "K17", b: "M17", colour: "black", num: 9 }   // spare pin 9
      ],
      testpoints: [{ id: "TP1", at: "K4", predict: 0 }]
    },
    /* The dashed outline round the two gates is the whole point of the
       question: Yenka draws two AND symbols, but they are two gates of ONE
       7408.  Drawn by the shared archetype (R5 checked against `target`). */
    circuit: (C, o) => twoGateChip(C, { kind: "and", part: "7408",
                                       in: ["A", "B", "C"], pulls: ["R2", "R3", "R4"],
                                       led: "LED1" }, o),
    why: [
      "There is <strong>one chip</strong>, not two. Yenka draws two AND gate symbols, " +
      "but both live in the same 7408 — sharing pin 7 (0 V) and pin 14 (+5 V).",
      "The chip sits <strong>across</strong> the tracks, so each opposite pair of pins " +
      "lands on the same track: pin 1 with pin 14, pin 2 with pin 13, and so on. " +
      "Every one of the seven tracks it crosses must be cut between the two rows of pins.",
      "Gate a's output is <strong>pin 3</strong> and gate b's input is <strong>pin 4</strong>. " +
      "They are next to each other on the package but on different tracks — adjacent " +
      "pins are <em>not</em> connected, so that join needs a link wire.",
      "Gates c and d are unused, but <strong>their inputs must still be tied to 0 V</strong> " +
      "— pins 9, 10, 12 and 13. A floating TTL input is not a logic 0: it drifts, and it makes " +
      "the chip draw current it should not. Their outputs (8 and 11) drive nothing, so they " +
      "are left alone.",
      "R2 and R3 pull <strong>upwards</strong>, onto tracks C and D. Three tracks below pin 1 " +
      "is pin 4 — which gate a drives — and three below pin 2 is pin 5, which C drives. A " +
      "resistor either way would tie a live net to 0 V. R4 has clear board below it, so it " +
      "reaches the rail on its own.",
      "With <strong>A = 1, B = 1, C = 0</strong> the first gate gives 1, but the second gate ANDs that with C, so <strong>TP1 reads logic 0</strong> — the lift stays put. Writing the expected reading on the layout is what makes the test point worth marking: on the real board, a 1 there tells you the fault is downstream of the chip, and a 0 tells you it is not."
    ]
  };


  /* ------------------------------------------------------------------------
     Q2 — LDR potential divider.  Small board, still no cuts, but the middle
     net has THREE things on it: this is where "a net is a track" starts to do
     real work.  The LDR is off the board on a 2-way terminal block, which is
     the conversion the pupil has to make — a symbol on the diagram becomes a
     connector on the layout.
     ------------------------------------------------------------------------ */
  const ldrDivider = {
    id: "ldr-divider",
    title: "Light sensor divider",
    board: "34-0410",
    scaffold: "blank",
    scenario: [
      "A light-dependent resistor and a fixed resistor form a potential divider on " +
      "the input sub-system board. The output goes off to the process board.",
      "The LDR sits on the board itself. Its legs are bendable, so it will reach across " +
      "two, three or four holes \u2014 set the length before you place it."
    ],
    components: [
      { id: "+5V", footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",  footprint: "term-1", name: "0 V supply", neg: true },
      { id: "LDR", footprint: "ldr-3", name: "LDR1", symmetric: true },
      { id: "R1",  footprint: "res-4",  name: "R1 (10 kΩ)" },
      { id: "OUT", footprint: "term-1", name: "output to the process board" }
    ],
    target: [
      ["+5V.1", "LDR.1"],
      ["LDR.2", "R1.1", "OUT.1"],
      ["R1.2", "0V.1"]
    ],
    dontcare: [],
    reference: {
      cuts: [],
      placements: [
        { id: "+5V", footprint: "term-1", at: "A2" },
        { id: "LDR", footprint: "ldr-3", at: "A5", rot: 90 },   // A5 and C5, legs bent to three holes
        { id: "R1",  footprint: "res-4",  at: "C8", rot: 90 },   // C8 and F8
        { id: "OUT", footprint: "term-1", at: "C12" },
        { id: "0V",  footprint: "term-1", at: "F2" }
      ],
      links: [],
      testpoints: []
    },
    circuit: (C, o) => {
      const X = 120, TOP = 30, BOT = 228;
      const b =
        C.rail(RAIL_L, 236, TOP, { pos: true }) + C.rail(RAIL_L, 236, BOT) +
        C.node(X, TOP) + C.node(X, BOT) +
        C.wire([[X, TOP], [X, 56]], "sbd-pos") +
        C.ldr(X, 86, { dir: "v", span: 60, label: "LDR1" }) +
        C.wire([[X, 116], [X, 140]]) + C.node(X, 128) +
        C.wire([[X, 128], [192, 128]]) + C.term(199, 128, { side: "r", label: "OUT" }) +
        C.res(X, 170, { dir: "v", span: 60, label: "R1", value: "10 kΩ", labelLeft: true }) +
        C.wire([[X, 200], [X, BOT]]) +
        nn(C, o, X, 44, 1) + nn(C, o, 160, 128, 2) + nn(C, o, X, 214, 3);
      return { w: 258, h: 256, body: b };
    },
    why: [
      "There are three nets, so the board needs <strong>three tracks</strong>. The middle " +
      "one carries three things — the LDR, the resistor and the output — and they all go " +
      "in the same track.",
      "The LDR goes <strong>on the board</strong>. Its legs bend, so it spans two, three or " +
      "four holes \u2014 this answer uses three, but any length that puts one leg on the +5 V " +
      "track and the other on the middle one is right. A sensor mounted away from the board is " +
      "the case that needs a terminal block; this one is not.",
      "No track needs cutting. A cut is only needed where two different nets would otherwise " +
      "share a track."
    ]
  };

  /* ------------------------------------------------------------------------
     Q3 — one AND gate driving an LED.  The first chip, and the first question
     that needs cuts: the components arrive placed, so the whole task is the
     column of seven cuts between the chip's two rows of pins.  Chosen so that
     the output chain reaches 0 V exactly, and no link wire is needed.
     ------------------------------------------------------------------------ */
  const andGateLed = {
    id: "and-gate-led",
    title: "Guard and start button",
    board: "34-0411",
    scaffold: "parts",
    scenario: [
      "A machine may only run when the guard is closed AND the start button is pressed. " +
      "Both signals arrive at the process board as a logic 1.",
      "Every gate input has to be held at a definite level: each input used carries a " +
      "10 kΩ pull-down to 0 V, and the inputs of the three gates you are not using are " +
      "tied straight to 0 V."
    ],
    components: [
      { id: "+5V",  footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",   footprint: "term-1", name: "0 V supply", neg: true },
      { id: "A",    footprint: "term-1", name: "A — guard closed" },
      { id: "B",    footprint: "term-1", name: "B — start pressed" },
      { id: "IC1",  footprint: "dip-14", part: "7408", name: "IC1 — 7408 quad 2-input AND" },
      { id: "R1",   footprint: "res-4",  name: "R1 (270 Ω)" },
      { id: "R2",   footprint: "res-4",  name: "R2 (10 kΩ) — pull-down on A" },
      { id: "R3",   footprint: "res-4",  name: "R3 (10 kΩ) — pull-down on B" },
      { id: "LED1", footprint: "led-2",  name: "LED1 — run indicator" }
    ],
    target: [
      ["+5V.1", "IC1.14"],
      ["0V.1", "IC1.7", "LED1.k", "R2.2", "R3.2"],
      ["A.1", "IC1.1", "R2.1"],
      ["B.1", "IC1.2", "R3.1"],
      ["IC1.3", "R1.1"],
      ["R1.2", "LED1.a"]
    ],
    /* The three spare gates: their INPUTS have to be held at 0 V (rank 2.2
       enforces that on any board), but WHERE the pupil takes them down is
       their own business, so the netlist comparison stays blind to them.  The
       spare OUTPUTS — 6, 8 and 11 — drive nothing and are left alone. */
    dontcare: ["IC1.4", "IC1.5", "IC1.6", "IC1.8", "IC1.9",
               "IC1.10", "IC1.11", "IC1.12", "IC1.13"],
    reference: {
      cuts: ["F11", "G11", "H11", "I11", "J11", "K11", "L11"],
      placements: [
        { id: "IC1",  footprint: "dip-14", at: "F10" },
        { id: "A",    footprint: "term-1", at: "F2" },
        { id: "B",    footprint: "term-1", at: "G2" },
        { id: "0V",   footprint: "term-1", at: "Q2" },            // the 0 V rail, track Q
        { id: "+5V",  footprint: "term-1", at: "F20" },
        // R2 drops pin 1 onto track I — the same track as spare pin 4, so one
        // black link down to the rail holds the pull-down AND the spare input
        { id: "R2",   footprint: "res-4",  at: "F5", rot: 90 },   // F5 (pin 1) to I5
        { id: "R3",   footprint: "res-4",  at: "G7", rot: 90 },   // G7 (pin 2) to J7
        { id: "R1",   footprint: "res-4",  at: "M3", rot: 90 },   // M3 to P3
        { id: "LED1", footprint: "led-2",  at: "P5", rot: 90 }    // P5 anode, Q5 cathode
      ],
      links: [
        { a: "H4", b: "M4", colour: "orange", num: 1 },   // pin 3 -> the output sub-system
        { a: "L9", b: "Q9", colour: "black",  num: 2 },   // pin 7 -> the 0 V rail
        { a: "I6", b: "Q6", colour: "black",  num: 3 },   // R2's foot + spare pin 4
        { a: "J8", b: "Q8", colour: "black",  num: 4 },   // R3's foot + spare pin 5
        { a: "G14", b: "Q14", colour: "black", num: 5 },  // spare pin 13
        { a: "H15", b: "Q15", colour: "black", num: 6 },  // spare pin 12
        { a: "J16", b: "Q16", colour: "black", num: 7 },  // spare pin 10
        { a: "K17", b: "Q17", colour: "black", num: 8 }   // spare pin 9
      ],
      testpoints: []
    },
    /* Both inputs carry a 10 kΩ pull-down to 0 V.  A switch or a guard contact
       only ever DRIVES its input high — when it is open the pin is connected
       to nothing at all, and a TTL input connected to nothing is not a nought,
       it floats.  The pull-down is what makes "not pressed" mean logic 0, so
       it is part of the circuit, not an optional extra. */
    circuit: (C, o) => {
      const g = C.andGate(132, 96, { w: 34, lead: 14, pins: pinNos(o, ["1", "2", "3"]) });
      const TOP = 26, BOT = 250, XO = 242, XA = 58, XB = 82;
      const b =
        C.rail(RAIL_L, 264, TOP, { pos: true }) + C.rail(RAIL_L, 264, BOT) +
        C.term(42, 85, { label: "A" }) + C.wire([[49, 85], [108, 85]]) +
        C.term(42, 107, { label: "B" }) + C.wire([[49, 107], [108, 107]]) +
        // A's pull-down crosses B's wire without a dot: crossing, not joined
        C.wire([[XA, 85], [XA, 122]]) + C.node(XA, 85) +
        C.res(XA, 150, { dir: "v", span: 56, label: "R2", value: "10 kΩ", labelLeft: true }) +
        C.wire([[XA, 178], [XA, BOT]]) + C.node(XA, BOT) +
        C.wire([[XB, 107], [XB, 167]]) + C.node(XB, 107) +
        C.res(XB, 195, { dir: "v", span: 56, label: "R3", value: "10 kΩ" }) +
        C.wire([[XB, 223], [XB, BOT]]) + C.node(XB, BOT) +
        g.svg + C.text(135, 62, "IC1a") +
        C.wire([[170, 96], [XO, 96], [XO, 112]]) +
        C.res(XO, 140, { dir: "v", span: 56, label: "R1", value: "270 Ω", labelLeft: true }) +
        C.wire([[XO, 168], [XO, 180]]) +
        C.led(XO, 198, { dir: "d", span: 36, label: "LED1" }) +
        C.wire([[XO, 216], [XO, BOT]]) + C.node(XO, BOT) +
        nn(C, o, 100, 85, 3) + nn(C, o, 100, 107, 4) + nn(C, o, 132, TOP, 1) +
        nn(C, o, 170, BOT, 2) + nn(C, o, 194, 96, 5) + nn(C, o, XO, 174, 6);
      return { w: 282, h: 278, body: b };
    },
    why: [
      "The chip lies <strong>across</strong> the tracks, so pin 1 and pin 14 land on the same " +
      "track, pin 2 and pin 13 on the next, and so on. Every one of the seven tracks it " +
      "crosses has to be cut between the two rows of pins.",
      "Without those cuts, pin 14 (+5 V) is joined straight to pin 1 (an input) and pin 7 " +
      "(0 V) to pin 8 — the chip would be destroyed and the circuit could never work.",
      "The cuts go <strong>under the chip</strong>. On your layout sheet they are the column " +
      "of X's drawn inside the chip outline.",
      "Each input carries a <strong>10 kΩ pull-down</strong> to 0 V. A guard contact or a " +
      "start button only ever drives its input HIGH — when it is not pressed the pin is " +
      "connected to nothing, and a TTL input connected to nothing is not a logic 0. It " +
      "floats, picks up whatever the tracks beside it are doing, and the machine starts on " +
      "its own. The pull-down is what makes <em>not pressed</em> mean 0.",
      "Only one of the four AND gates is used, but <strong>every unused input still has to " +
      "be tied to 0 V</strong> — pins 4, 5, 9, 10, 12 and 13. A floating input on a spare " +
      "gate is just as unreliable as one on a gate you are using, and it makes the chip draw " +
      "current it should not. The spare <em>outputs</em> (6, 8 and 11) drive nothing, so they " +
      "are left alone.",
      "On the layout that is one black link per spare track down to the 0 V rail. R2's foot " +
      "lands on track I, which is where pin 4 already is, so one link holds both."
    ]
  };

  /* ------------------------------------------------------------------------
     Q4 — one NOT gate.  Same seven cuts, but now the output chain does NOT
     reach: pin 2 is five tracks from pin 7 and a resistor plus an LED spans
     four, so one link wire is unavoidable.  That is the rung after cuts-only.
     ------------------------------------------------------------------------ */
  const notGateLed = {
    id: "not-gate-led",
    title: "Tank empty warning",
    board: "34-0411",
    scaffold: "parts",
    scenario: [
      "A float switch reads logic 1 while there is water in the tank and logic 0 when it " +
      "is empty. The warning LED has to come on when the tank IS empty, so the signal is " +
      "inverted by one gate of a 7404.",
      "The float switch only ever drives its input HIGH, so the input carries a 10 kΩ " +
      "pull-down to 0 V. The five inverters you are not using have their inputs tied " +
      "straight to 0 V."
    ],
    components: [
      { id: "+5V",  footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",   footprint: "term-1", name: "0 V supply", neg: true },
      { id: "IN",   footprint: "term-1", name: "IN — float switch" },
      { id: "IC1",  footprint: "dip-14", part: "7404", name: "IC1 — 7404 hex inverter" },
      { id: "R1",   footprint: "res-4",  name: "R1 (270 Ω)" },
      { id: "R2",   footprint: "res-4",  name: "R2 (10 kΩ) — pull-down on IN" },
      { id: "LED1", footprint: "led-2",  name: "LED1 — tank empty" }
    ],
    target: [
      ["+5V.1", "IC1.14"],
      ["0V.1", "IC1.7", "LED1.k", "R2.1"],
      ["IN.1", "IC1.1", "R2.2"],
      ["IC1.2", "R1.1"],
      ["R1.2", "LED1.a"]
    ],
    /* The 7404's two columns ALTERNATE input and output — 1 in, 2 out, 3 in,
       4 out — which is why the pull-down cannot simply drop three tracks from
       pin 1 the way it does on a 7408: it would land on pin 4, an output, and
       short it to 0 V.  It goes UP instead, onto track C, and one black link
       brings 0 V to it. */
    dontcare: ["IC1.3", "IC1.4", "IC1.5", "IC1.6", "IC1.8", "IC1.9",
               "IC1.10", "IC1.11", "IC1.12", "IC1.13"],
    reference: {
      cuts: ["F11", "G11", "H11", "I11", "J11", "K11", "L11"],
      placements: [
        { id: "IC1",  footprint: "dip-14", at: "F10" },
        { id: "IN",   footprint: "term-1", at: "F2" },
        { id: "0V",   footprint: "term-1", at: "M2" },            // the 0 V rail, track M
        { id: "+5V",  footprint: "term-1", at: "F20" },
        { id: "R2",   footprint: "res-4",  at: "C4", rot: 90 },   // C4 (0 V) to F4 (pin 1)
        { id: "R1",   footprint: "res-4",  at: "N5", rot: 90 },   // N5 to Q5
        { id: "LED1", footprint: "led-2",  at: "Q7", rot: 90 }    // Q7 anode, R7 cathode
      ],
      links: [
        { a: "G3", b: "N3", colour: "orange", num: 1 },   // pin 2 -> the output sub-system
        { a: "R4", b: "M4", colour: "black",  num: 2 },   // LED cathode -> 0 V
        { a: "C6", b: "M6", colour: "black",  num: 3 },   // R2's far leg -> 0 V
        { a: "H7", b: "M7", colour: "black",  num: 4 },   // spare pin 3
        { a: "J8", b: "M8", colour: "black",  num: 5 },   // spare pin 5
        { a: "L9", b: "M9", colour: "black",  num: 6 },   // pin 7 -> 0 V
        { a: "G14", b: "M14", colour: "black", num: 7 },  // spare pin 13
        { a: "I15", b: "M15", colour: "black", num: 8 },  // spare pin 11
        { a: "K16", b: "M16", colour: "black", num: 9 }   // spare pin 9
      ],
      testpoints: []
    },
    circuit: (C, o) => {
      const g = C.notGate(118, 96, { pins: pinNos(o, ["1", "2"]) });
      const TOP = 26, BOT = 234, XO = 206, XI = 62;
      const b =
        C.rail(RAIL_L, 236, TOP, { pos: true }) + C.rail(RAIL_L, 236, BOT) +
        C.term(42, 96, { label: "IN" }) + C.wire([[49, 96], [90, 96]]) +
        C.wire([[XI, 96], [XI, 122]]) + C.node(XI, 96) +
        C.res(XI, 150, { dir: "v", span: 56, label: "R2", value: "10 kΩ", labelLeft: true }) +
        C.wire([[XI, 178], [XI, BOT]]) + C.node(XI, BOT) +
        g.svg + C.text(121, 62, "IC1a") +
        C.wire([[160, 96], [XO, 96], [XO, 112]]) +
        C.res(XO, 140, { dir: "v", span: 56, label: "R1", value: "270 Ω", labelLeft: true }) +
        C.wire([[XO, 168], [XO, 180]]) +
        C.led(XO, 198, { dir: "d", span: 36, label: "LED1" }) +
        C.wire([[XO, 216], [XO, BOT]]) + C.node(XO, BOT) +
        nn(C, o, 82, 96, 3) + nn(C, o, 120, TOP, 1) + nn(C, o, 150, BOT, 2) +
        nn(C, o, 182, 96, 4) + nn(C, o, XO, 174, 5);
      return { w: 258, h: 262, body: b };
    },
    why: [
      "The seven cuts are the same as ever — the chip crosses seven tracks and every one of " +
      "them has to be cut between the rows of pins.",
      "This time the parts do <strong>not</strong> reach. Pin 2 and pin 7 are five tracks " +
      "apart, but a resistor spans four holes and an LED two, so the chain stops one track " +
      "short of 0 V. That last join is a <strong>link wire</strong>.",
      "That is the normal reason for a link: two things belong on the same net but the " +
      "components cannot physically bridge the gap. Colour it and number it, so it matches " +
      "your wiring schedule.",
      "R2 goes <strong>above</strong> the chip, not below it. A 7404's pins alternate — 1 is " +
      "an input, 2 an output, 3 an input, 4 an output — so a resistor dropped three tracks " +
      "from pin 1 would land on pin 4 and short an output to 0 V. Three tracks the other way " +
      "is track C, which is empty, and one black link brings 0 V up to it.",
      "The other five inverters are spare, and <strong>every one of their inputs still has to " +
      "be tied to 0 V</strong> — pins 3, 5, 9, 11 and 13. An input left joined to nothing is " +
      "not a logic 0: it floats. Their outputs (4, 6, 8, 10 and 12) drive nothing, so they are " +
      "left alone."
    ]
  };


  /* ------------------------------------------------------------------------
     Q6 — kiln interlock.  The same archetype as the lift, on a different part
     of the board, so a pupil who has done Q5 has to think rather than copy.
     ------------------------------------------------------------------------ */
  const kilnInterlock = {
    id: "kiln-interlock",
    title: "Kiln door interlock",
    board: "34-0411",
    scaffold: "blank",
    scenario: [
      "A kiln will only heat when three conditions are all met: the door is closed, the " +
      "firing timer is running, and the temperature is below the set limit.",
      "Each condition arrives at the process board as a logic 1. The output drives the " +
      "heater-on indicator.",
      "All three conditions come from switches, so each input carries a 10 kΩ pull-down to " +
      "0 V. The two gates you are not using have their inputs tied straight to 0 V."
    ],
    components: [
      { id: "+5V",  footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",   footprint: "term-1", name: "0 V supply", neg: true },
      { id: "D",    footprint: "term-1", name: "D — door closed" },
      { id: "T",    footprint: "term-1", name: "T — timer running" },
      { id: "H",    footprint: "term-1", name: "H — below temperature" },
      { id: "IC1",  footprint: "dip-14", part: "7408", name: "IC1 — 7408 quad 2-input AND" },
      { id: "R1",   footprint: "res-4",  name: "R1 (270 Ω)" },
      { id: "R2",   footprint: "res-4",  name: "R2 (10 kΩ) — pull-down on D" },
      { id: "R3",   footprint: "res-4",  name: "R3 (10 kΩ) — pull-down on T" },
      { id: "R4",   footprint: "res-4",  name: "R4 (10 kΩ) — pull-down on H" },
      { id: "LED1", footprint: "led-2",  name: "LED1 — heater on" }
    ],
    target: [
      ["+5V.1", "IC1.14"],
      ["0V.1", "IC1.7", "LED1.k", "R2.1", "R3.1", "R4.2"],
      ["D.1", "IC1.1", "R2.2"],
      ["T.1", "IC1.2", "R3.2"],
      ["IC1.3", "IC1.4"],
      ["H.1", "IC1.5", "R4.1"],
      ["IC1.6", "R1.1"],
      ["R1.2", "LED1.a"]
    ],
    dontcare: ["IC1.8", "IC1.9", "IC1.10", "IC1.11", "IC1.12", "IC1.13"],
    stages: [
      { name: "Inputs and the chip",
        parts: ["+5V", "0V", "D", "T", "H", "IC1", "R2", "R3", "R4"],
        hint: "Chip down, every track under it cut, the three inputs on the right pins and " +
              "gate a's output linked to gate b's input." },
      { name: "The output sub-system",
        parts: ["R1", "LED1"],
        hint: "Now the resistor and the LED from the chip's output down to 0 V." }
    ],
    reference: {
      cuts: ["N11", "O11", "P11", "Q11", "R11", "S11", "T11"],
      placements: [
        { id: "IC1",  footprint: "dip-14", at: "N10" },
        { id: "D",    footprint: "term-1", at: "N2" },
        { id: "T",    footprint: "term-1", at: "O2" },
        { id: "H",    footprint: "term-1", at: "R2" },
        { id: "0V",   footprint: "term-1", at: "U2" },            // the 0 V rail, track U
        { id: "+5V",  footprint: "term-1", at: "N20" },
        // D and T pull upwards — three tracks below pin 1 is pin 4, which gate a
        // drives, and three below pin 2 is pin 5, which H drives
        { id: "R2",   footprint: "res-4",  at: "K4", rot: 90 },   // K4 (0 V) to N4 (pin 1)
        { id: "R3",   footprint: "res-4",  at: "L5", rot: 90 },   // L5 (0 V) to O5 (pin 2)
        { id: "R4",   footprint: "res-4",  at: "R8", rot: 90 },   // R8 (pin 5) to U8 (0 V rail)
        { id: "R1",   footprint: "res-4",  at: "S3", rot: 90 },
        { id: "LED1", footprint: "led-2",  at: "V5", rot: 90 }
      ],
      links: [
        { a: "P9", b: "Q9", colour: "orange", num: 1 },
        { a: "W4", b: "U4", colour: "black",  num: 2 },   // LED cathode -> the 0 V rail
        { a: "K22", b: "U22", colour: "black", num: 3 },  // R2's far leg -> 0 V
        { a: "L6", b: "U6", colour: "black",  num: 4 },   // R3's far leg -> 0 V
        { a: "T7", b: "U7", colour: "black",  num: 5 },   // pin 7 -> 0 V
        { a: "O14", b: "U14", colour: "black", num: 6 },  // spare pin 13
        { a: "P15", b: "U15", colour: "black", num: 7 },  // spare pin 12
        { a: "R16", b: "U16", colour: "black", num: 8 },  // spare pin 10
        { a: "S17", b: "U17", colour: "black", num: 9 }   // spare pin 9
      ],
      testpoints: []
    },
    circuit: (C, o) => twoGateChip(C, { kind: "and", part: "7408",
                                       in: ["D", "T", "H"], pulls: ["R2", "R3", "R4"],
                                       led: "LED1" }, o),
    why: [
      "Three conditions, two gates, <strong>one chip</strong>. Gates a and b of the same " +
      "7408 share pin 7 (0 V) and pin 14 (+5 V).",
      "Every one of the seven tracks the chip crosses must be cut between its two rows of pins.",
      "Gate a's output is <strong>pin 3</strong> and gate b's input is <strong>pin 4</strong>. " +
      "They are next to each other on the package but on different tracks, so that join needs " +
      "a link wire — adjacent pins are <em>not</em> connected.",
      "Every input carries a <strong>10 kΩ pull-down</strong>, and the two spare gates have " +
      "their inputs (9, 10, 12 and 13) tied to 0 V. A TTL input joined to nothing is not a " +
      "logic 0 — it floats, and a kiln interlock that starts on its own is the worst kind of " +
      "fault to have.",
      "You do not have to put the chip where this answer puts it. Any layout that joins the " +
      "same things together is right."
    ]
  };

  /* ------------------------------------------------------------------------
     Q7 — car park full sign.  The OR archetype, on a 7432.  Deliberately
     three BAY sensors lighting one sign, not a fault warning driving a lamp
     and a sounder — see PLAN.md §6.
     ------------------------------------------------------------------------ */
  const carparkFull = {
    id: "carpark-full",
    title: "Car park full sign",
    board: "34-0411",
    scaffold: "blank",
    scenario: [
      "A small car park has three bays. A FULL sign lights when any one of the three bay " +
      "sensors reads occupied — or any two, or all three.",
      "Each sensor arrives at the process board as a logic 1.",
      "Each sensor line carries a 10 kΩ pull-down to 0 V, so an empty bay reads as a proper " +
      "logic 0. The two gates you are not using have their inputs tied straight to 0 V."
    ],
    components: [
      { id: "+5V",  footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",   footprint: "term-1", name: "0 V supply", neg: true },
      { id: "S1",   footprint: "term-1", name: "S1 — bay 1 occupied" },
      { id: "S2",   footprint: "term-1", name: "S2 — bay 2 occupied" },
      { id: "S3",   footprint: "term-1", name: "S3 — bay 3 occupied" },
      { id: "IC1",  footprint: "dip-14", part: "7432", name: "IC1 — 7432 quad 2-input OR" },
      { id: "R1",   footprint: "res-4",  name: "R1 (270 Ω)" },
      { id: "R4",   footprint: "res-4",  name: "R4 (10 kΩ) — pull-down on S1" },
      { id: "R5",   footprint: "res-4",  name: "R5 (10 kΩ) — pull-down on S2" },
      { id: "R6",   footprint: "res-4",  name: "R6 (10 kΩ) — pull-down on S3" },
      { id: "LED1", footprint: "led-2",  name: "LED1 — FULL sign" }
    ],
    target: [
      ["+5V.1", "IC1.14"],
      ["0V.1", "IC1.7", "LED1.k", "R4.1", "R5.1", "R6.2"],
      ["S1.1", "IC1.1", "R4.2"],
      ["S2.1", "IC1.2", "R5.2"],
      ["IC1.3", "IC1.4"],
      ["S3.1", "IC1.5", "R6.1"],
      ["IC1.6", "R1.1"],
      ["R1.2", "LED1.a"]
    ],
    dontcare: ["IC1.8", "IC1.9", "IC1.10", "IC1.11", "IC1.12", "IC1.13"],
    stages: [
      { name: "Inputs and the chip",
        parts: ["+5V", "0V", "S1", "S2", "S3", "IC1", "R4", "R5", "R6"],
        hint: "Chip down, every track under it cut, the three bay sensors on the right pins " +
              "and gate a's output linked to gate b's input." },
      { name: "The output sub-system",
        parts: ["R1", "LED1"],
        hint: "Now the resistor and the sign indicator from the chip's output down to 0 V." }
    ],
    reference: {
      cuts: ["F25", "G25", "H25", "I25", "J25", "K25", "L25"],
      placements: [
        { id: "IC1",  footprint: "dip-14", at: "F24" },
        { id: "S1",   footprint: "term-1", at: "F2" },
        { id: "S2",   footprint: "term-1", at: "G2" },
        { id: "S3",   footprint: "term-1", at: "J2" },
        { id: "0V",   footprint: "term-1", at: "M2" },            // the 0 V rail, track M
        { id: "+5V",  footprint: "term-1", at: "F32" },
        // S1 and S2 pull upwards — three tracks below pin 1 is pin 4, which
        // gate a drives, and three below pin 2 is pin 5, which S3 drives
        { id: "R4",   footprint: "res-4",  at: "C4", rot: 90 },   // C4 (0 V) to F4 (pin 1)
        { id: "R5",   footprint: "res-4",  at: "D6", rot: 90 },   // D6 (0 V) to G6 (pin 2)
        { id: "R6",   footprint: "res-4",  at: "J8", rot: 90 },   // J8 (pin 5) to M8 (0 V rail)
        { id: "R1",   footprint: "res-4",  at: "K5", rot: 90 },
        { id: "LED1", footprint: "led-2",  at: "N7", rot: 90 }
      ],
      links: [
        { a: "H22", b: "I22", colour: "orange", num: 1 },
        { a: "O9",  b: "M9",  colour: "black",  num: 2 },   // LED cathode -> the 0 V rail
        { a: "C20", b: "M20", colour: "black",  num: 3 },   // R4's far leg -> 0 V
        { a: "D3",  b: "M3",  colour: "black",  num: 4 },   // R5's far leg -> 0 V
        { a: "L7",  b: "M7",  colour: "black",  num: 5 },   // pin 7 -> 0 V
        { a: "G28", b: "M28", colour: "black", num: 6 },    // spare pin 13
        { a: "H29", b: "M29", colour: "black", num: 7 },    // spare pin 12
        { a: "J30", b: "M30", colour: "black", num: 8 },    // spare pin 10
        { a: "K31", b: "M31", colour: "black", num: 9 }     // spare pin 9
      ],
      testpoints: []
    },
    circuit: (C, o) => twoGateChip(C, { kind: "or", part: "7432",
                                       in: ["S1", "S2", "S3"], pulls: ["R4", "R5", "R6"],
                                       led: "LED1" }, o),
    why: [
      "“Any one of three” is a 3-input OR, and there is no 3-input OR in the kit — so it is " +
      "built from <strong>two 2-input OR gates</strong> of one 7432.",
      "One chip, not two: both gates share pin 7 (0 V) and pin 14 (+5 V), and every track the " +
      "package crosses must be cut between its two rows of pins.",
      "Gate a's output, <strong>pin 3</strong>, has to reach gate b's input, <strong>pin 4</strong>. " +
      "They sit side by side on the package but on different tracks, so it takes a link wire.",
      "The 7432 has the same pinout as the 7408 — only the logic inside is different.",
      "The pull-downs are numbered <strong>R4 to R6</strong>, not R2 and R3, because S1 to S3 " +
      "have already taken those numbers on the sensor board. Item IDs run across the whole " +
      "sub-system, not per board.",
      "Both spare gates have their inputs (9, 10, 12 and 13) tied to 0 V. An input joined to " +
      "nothing is not a logic 0 — it floats, and the FULL sign would light on its own."
    ]
  };

  /* ------------------------------------------------------------------------
     Q8 — transistor switch.  Back to the small board, but the hardest one on
     it: a three-legged part that must lie across the tracks, a track that has
     to be cut where no chip is involved, and two link wires.
     ------------------------------------------------------------------------ */
  const transistorBuzzer = {
    id: "transistor-buzzer",
    title: "Buzzer switched by a transistor",
    board: "34-0410",
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
      { id: "BUZ", footprint: "term-2", name: "BUZ1 — buzzer" }
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
      /* The can's legs come out in a triangle — collector at the top, base to
         the middle right, emitter at the bottom — so the board is laid out
         DOWNWARDS through the transistor: collector track above base track
         above emitter track.  That is the opposite way round from the old
         three-in-a-row footprint, and it is why every part here moved. */
      cuts: ["C16"],
      placements: [
        { id: "+5V", footprint: "term-1", at: "A2" },             // track A is the +5 V rail
        { id: "SW",  footprint: "term-2", at: "A12", rot: 90 },   // A12 (+5 V) and C12
        { id: "BUZ", footprint: "term-2", at: "A20", rot: 90 },   // A20 (+5 V) and C20
        { id: "R1",  footprint: "res-4",  at: "C6", rot: 90 },    // C6 (the switched node) to F6
        { id: "Q1",  footprint: "npn-can", at: "E3" },            // c E3, b F4, e G3
        { id: "0V",  footprint: "term-1", at: "G2" }
      ],
      /* One cut, and it is doing real work: track C carries the switch's
         output on the left of it and the buzzer's return on the right. */
      links: [
        { a: "C22", b: "E22", colour: "green", num: 1 }   // the buzzer's return to the collector
      ],
      testpoints: []
    },
    circuit: (C, o) => {
      const q = C.npn(164, 160, { label: "Q1" });   // base 130,160 · collector 174,128 · emitter 174,192
      const TOP = 26, BOT = 236, XS = 86, XQ = 174;
      const b =
        C.rail(RAIL_L, 236, TOP, { pos: true }) + C.rail(RAIL_L, 236, BOT) +
        C.node(XS, TOP) + C.node(XQ, TOP) +

        C.wire([[XS, TOP], [XS, 54]], "sbd-pos") +
        C.sw(XS, 72, { dir: "v", span: 36, label: "SW1" }) +
        C.wire([[XS, 90], [XS, 118]]) +
        C.res(XS, 146, { dir: "v", span: 56, label: "R1", value: "1 k\u03a9", labelLeft: true }) +
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
      "The transistor has <strong>three legs in three consecutive holes</strong>, so it must " +
      "lie across the tracks — one leg per track. Laid along a track, all three legs would be " +
      "shorted together.",
      "Look at the order: emitter, base, collector. Which way round it goes decides which " +
      "track each net lands on.",
      "The switch and the buzzer are drawn as components but built as <strong>terminal " +
      "blocks</strong> — the layout shows the connector soldered to the board.",
      "One track here carries two different nets, so it has to be <strong>cut</strong> even " +
      "though there is no chip on this board. A cut is needed wherever one strip of copper " +
      "would otherwise join two things that must stay apart."
    ]
  };

  /* ------------------------------------------------------------------------
     Q9 — greenhouse irrigation.  Three inputs again, but the output is a pump
     through a transistor rather than an LED, and the process output needs a
     test point (the last rung of the ladder, PLAN.md §4.1).
     ------------------------------------------------------------------------ */
  const greenhouse = {
    id: "greenhouse-irrigation",
    title: "Greenhouse irrigation",
    board: "34-0411",
    scaffold: "blank",
    scenario: [
      "A greenhouse pump runs only when the soil is dry, the water tank is not empty and " +
      "the system is switched on. All three arrive as logic 1.",
      "The pump needs more current than a logic gate can supply, so a transistor switches it.",
      "Each of the three inputs carries a 10 kΩ pull-down to 0 V, and the two gates you are " +
      "not using have their inputs tied straight to 0 V."
    ],
    components: [
      { id: "+5V",  footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",   footprint: "term-1", name: "0 V supply", neg: true },
      { id: "SD",   footprint: "term-1", name: "SD — soil dry" },
      { id: "TK",   footprint: "term-1", name: "TK — tank not empty" },
      { id: "EN",   footprint: "term-1", name: "EN — system enabled" },
      { id: "IC1",  footprint: "dip-14", part: "7408", name: "IC1 — 7408 quad 2-input AND" },
      { id: "R1",   footprint: "res-4",  name: "R1 (1 kΩ base resistor)" },
      { id: "R2",   footprint: "res-4",  name: "R2 (10 kΩ) — pull-down on SD" },
      { id: "R3",   footprint: "res-4",  name: "R3 (10 kΩ) — pull-down on TK" },
      { id: "R4",   footprint: "res-4",  name: "R4 (10 kΩ) — pull-down on EN" },
      { id: "Q1",   footprint: "npn-can", name: "Q1 — BC548" },
      { id: "PUMP", footprint: "term-2", name: "PUMP — pump terminal block" }
    ],
    target: [
      ["+5V.1", "IC1.14", "PUMP.1"],
      ["0V.1", "IC1.7", "Q1.e", "R2.1", "R3.1", "R4.2"],
      ["SD.1", "IC1.1", "R2.2"],
      ["TK.1", "IC1.2", "R3.2"],
      ["IC1.3", "IC1.4"],
      ["EN.1", "IC1.5", "R4.1"],
      ["IC1.6", "R1.1"],
      ["R1.2", "Q1.b"],
      ["Q1.c", "PUMP.2"]
    ],
    dontcare: ["IC1.8", "IC1.9", "IC1.10", "IC1.11", "IC1.12", "IC1.13"],
    tpRequired: ["IC1.6"],
    expect: {
      inputs: [["SD", 1], ["TK", 1], ["EN", 1]],
      note: "the soil is dry, the tank is not empty and the system is switched on",
      levels: { "IC1.6": 1 }
    },
    stages: [
      { name: "Inputs and the chip",
        parts: ["+5V", "0V", "SD", "TK", "EN", "IC1", "R2", "R3", "R4"],
        hint: "Chip down, every track under it cut, the three inputs on the right pins and " +
              "gate a's output linked to gate b's input." },
      { name: "The output sub-system",
        parts: ["R1", "Q1", "PUMP"],
        hint: "Now the driver: the base resistor, the transistor and the pump — then the " +
              "test point on the chip's output, and what it will read." }
    ],
    reference: {
      cuts: ["F11", "G11", "H11", "I11", "J11", "K11", "L11"],
      placements: [
        { id: "IC1",  footprint: "dip-14", at: "F10" },
        { id: "SD",   footprint: "term-1", at: "F2" },
        { id: "TK",   footprint: "term-1", at: "G2" },
        { id: "EN",   footprint: "term-1", at: "J2" },
        { id: "0V",   footprint: "term-1", at: "M2" },            // the 0 V rail, track M
        { id: "+5V",  footprint: "term-1", at: "F20" },
        /* The pump block used to sit on tracks F and H of the right-hand
           segment — which put the collector node on pin 12's track. With every
           spare input now tied to 0 V that would short the pump driver down, so
           the block moves clear of the chip's tracks altogether. */
        { id: "PUMP", footprint: "term-2", at: "R24", rot: 90 },  // R24 and T24
        { id: "R2",   footprint: "res-4",  at: "C4", rot: 90 },   // C4 (0 V) to F4 (pin 1)
        { id: "R3",   footprint: "res-4",  at: "D6", rot: 90 },   // D6 (0 V) to G6 (pin 2)
        { id: "R4",   footprint: "res-4",  at: "J8", rot: 90 },   // J8 (pin 5) to M8 (0 V rail)
        { id: "R1",   footprint: "res-4",  at: "K6", rot: 90 },   // K6 (pin 6) and N6
        // the can runs collector-base-emitter DOWN the board, so it sits below
        // the 0 V rail with its own link back up to it
        { id: "Q1",   footprint: "npn-can", at: "O3" }            // c O3, b P4, e Q3
      ],
      links: [
        { a: "H9",  b: "I9",  colour: "orange", num: 1 },
        { a: "L7",  b: "M7",  colour: "black",  num: 2 },   // pin 7 -> the 0 V rail
        { a: "O32", b: "T32", colour: "green",  num: 3 },   // collector -> the pump block
        { a: "F30", b: "R30", colour: "red",    num: 4 },   // +5 V -> the pump block
        { a: "C20", b: "M20", colour: "black",  num: 5 },   // R2's far leg -> 0 V
        { a: "D5",  b: "M5",  colour: "black",  num: 6 },   // R3's far leg -> 0 V
        { a: "G14", b: "M14", colour: "black",  num: 7 },   // spare pin 13
        { a: "H15", b: "M15", colour: "black",  num: 8 },   // spare pin 12
        { a: "J16", b: "M16", colour: "black",  num: 9 },   // spare pin 10
        { a: "K17", b: "M17", colour: "black",  num: 10 },  // spare pin 9
        { a: "N5",  b: "P5",  colour: "brown",  num: 11 },  // the base, down to the can
        { a: "Q9",  b: "M9",  colour: "black",  num: 12 }   // the emitter, back to 0 V
      ],
      testpoints: [{ id: "TP1", at: "K4", predict: 1 }]
    },
    circuit: (C, o) => {
      const G = { w: 32, lead: 12 };
      const ga = C.andGate(190, 74, Object.assign({ pins: pinNos(o, ["1", "2", "3"]) }, G));
      const gb = C.andGate(246, 130, Object.assign({ pins: pinNos(o, ["4", "5", "6"]) }, G));
      const q = C.npn(326, 230, { label: "Q1" });  // base 292,230 · collector 336,198 · emitter 336,262
      const TOP = 24, BOT = 286, XR = 292, XP = 336;
      const b =
        C.rail(RAIL_L, 378, TOP, { pos: true }) + C.rail(RAIL_L, 378, BOT) +

        C.term(40, 63, { label: "SD" }) + C.wire([[47, 63], [168, 63]]) +
        C.term(40, 85, { label: "TK" }) + C.wire([[47, 85], [168, 85]]) +
        C.term(40, 141, { label: "EN" }) + C.wire([[47, 141], [224, 141]]) +
        pullDown(C, 54, 63, "R2", BOT) + pullDown(C, 120, 85, "R3", BOT) +
        pullDown(C, 186, 141, "R4", BOT) +
        ga.svg + C.text(196, 46, "IC1a") +
        gb.svg + C.text(252, 102, "IC1b") +
        C.wire([[224, 74], [224, 119]]) +

        C.wire([[280, 130], [XR, 130], [XR, 156]]) +
        C.res(XR, 184, { dir: "v", span: 56, label: "R1", value: "1 k\u03a9", labelLeft: true }) +
        C.wire([[XR, 212], [XR, 230]]) +
        q.svg +

        C.node(XP, TOP) + C.wire([[XP, TOP], [XP, 142]], "sbd-pos") +
        C.motor(XP, 166, { dir: "v", span: 48, letter: "M", label: "PUMP", labelSide: "r" }) +
        C.wire([[XP, 190], [XP, 198]]) +
        C.wire([[XP, 262], [XP, BOT]]) + C.node(XP, BOT) +

        nn(C, o, 150, 63, 3) + nn(C, o, 150, 85, 4) + nn(C, o, 150, 141, 6) +
        nn(C, o, 224, 94, 5) + nn(C, o, XR, 143, 7) + nn(C, o, XR, 221, 8) +
        nn(C, o, 170, TOP, 1) + nn(C, o, 240, BOT, 2) + nn(C, o, XP, 110, 9);
      return { w: 402, h: 310, body: b };
    },
    why: [
      "The three conditions are a 3-input AND, built from two gates of <strong>one</strong> " +
      "7408 — the same one-chip idea as before.",
      "A logic gate cannot drive a pump, so its output goes through a base resistor into a " +
      "transistor. The transistor's three legs go in three consecutive holes, across the tracks.",
      "This board needs a <strong>test point</strong> on the process sub-system's output — " +
      "pin 6, before the transistor. That is what you would put a meter probe on to find out " +
      "whether the fault is in the logic or in the pump driver.",
      "Plan the test points on the layout <em>before</em> you build. Adding them afterwards is " +
      "what the verifiers' reports keep flagging.",
      "With <strong>SD = 1, TK = 1, EN = 1</strong> all three conditions are met, so <strong>TP1 reads logic 1</strong> and the transistor turns the pump on. If the pump stays off with a 1 at TP1, the fault is in the output sub-system, not the logic.",
      "The pump block sits <strong>clear of the chip's tracks</strong>. Put it on the same " +
      "tracks as the chip's right-hand pins and the collector ends up joined to pin 12 — a " +
      "spare gate input that has to be tied to 0 V, which would short the driver out."
    ]
  };

  /* ------------------------------------------------------------------------
     Q11 — Stairwell light timer.  A 555 MONOSTABLE: press the button and the
     light stays on for a fixed time, then goes off by itself.

     §6 allows the 555 but never as a flasher — an astable clocking LEDs, and
     especially with an LDR near it, is the bicycle-lights brief and stays out.
     A one-shot triggered by a push button is neither that nor the pillar drill.

     The diagram names the pins rather than numbering them: 1 Ground, 2
     Trigger, 3 Output, 4 Reset, 5 Control Voltage, 6 Threshold, 7 Discharge,
     8 Vcc — read off the SQA data sheet (X860/75/12, page 3), which the page
     links to.  Turning a name into a pin number IS the task.
     ------------------------------------------------------------------------ */
  const timer555 = {
    id: "timer-555",
    title: "Stairwell light timer",
    board: "34-0411",
    scaffold: "blank",
    scenario: [
      "A stairwell light is switched on by a push button and turns itself off again after " +
      "a fixed time, so it is never left burning.",
      "IC1 is a 555 wired as a <strong>monostable</strong> — one press, one timed output " +
      "pulse. R1 and C1 set how long it lasts."
    ],
    components: [
      { id: "+5V",  footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",   footprint: "term-1", name: "0 V supply", neg: true },
      { id: "TRIG", footprint: "term-1", name: "Trigger — the push button" },
      { id: "IC1",  footprint: "dip-8",  part: "555", name: "IC1 — 555 timer" },
      { id: "R1",   footprint: "res-4",  name: "R1 (100 kΩ) — timing" },
      { id: "C1",   footprint: "ecap-2", name: "C1 (10 µF) — timing" },
      { id: "R2",   footprint: "res-4",  name: "R2 (270 Ω)" },
      { id: "LED1", footprint: "led-2",  name: "LED1 — the stair light" }
    ],
    target: [
      ["+5V.1", "IC1.8", "IC1.4", "R1.1"],
      ["0V.1", "IC1.1", "C1.-", "LED1.k"],
      ["R1.2", "IC1.7", "IC1.6", "C1.+"],
      ["TRIG.1", "IC1.2"],
      // R2 is vertical with its pin 2 on the chip's output track
      ["IC1.3", "R2.2"],
      ["R2.1", "LED1.a"]
    ],
    // pin 5 (Control Voltage) is left open, which is ordinary practice
    dontcare: ["IC1.5"],
    tpRequired: ["IC1.3"],
    expect: {
      inputs: [["TRIG", 0]],
      note: "the button has just been pressed, so Trigger is pulled low and the timed " +
            "output pulse has started",
      levels: { "IC1.3": 1 }
    },
    stages: [
      { name: "The chip and its timing parts",
        parts: ["+5V", "0V", "TRIG", "IC1", "R1", "C1"],
        hint: "Place the 555 and cut all four tracks it crosses. Reset ties to +5 V, the " +
              "timing resistor runs from +5 V to Discharge, and Threshold, Discharge and " +
              "the capacitor's + leg all end up on one net." },
      { name: "The output sub-system",
        parts: ["R2", "LED1"],
        hint: "Now the series resistor and the stair light on the Output pin — then the " +
              "test point, and what it reads just after the button is pressed." }
    ],
    reference: {
      cuts: ["F11", "G11", "H11", "I11"],
      placements: [
        { id: "IC1",  footprint: "dip-8",  at: "F10", rot: 0 },
        { id: "+5V",  footprint: "term-1", at: "A2" },
        { id: "0V",   footprint: "term-1", at: "X2" },
        { id: "TRIG", footprint: "term-1", at: "G3" },
        { id: "R1",   footprint: "res-4",  at: "A22", rot: 90 },
        { id: "R2",   footprint: "res-4",  at: "E4",  rot: 90 },
        /* A radial capacitor's legs are one pitch apart, so it cannot sit with
           its + on Threshold and its − anywhere useful: one track below
           Threshold is pin 5, Control Voltage, which must stay open.  The
           timing net comes down to a clear pair of tracks instead. */
        { id: "C1",   footprint: "ecap-2", at: "M26", rot: 90 },   // + M26, − N26
        { id: "LED1", footprint: "led-2",  at: "W28", rot: 90 }
      ],
      links: [
        { a: "A16", b: "F16", colour: "red",   num: 1 },   // rail across to Vcc's track
        { a: "A8",  b: "I8",  colour: "red",   num: 2 },   // rail across to Reset's track
        { a: "D23", b: "G23", colour: "blue",  num: 3 },   // R1 down to Discharge, beside its leg — one hole, one thing
        { a: "G20", b: "H20", colour: "blue",  num: 4 },   // Discharge across to Threshold
        { a: "F6",  b: "K6",  colour: "black", num: 5 },   // the Ground pin out to the 0 V run
        { a: "K30", b: "X30", colour: "black", num: 6 },   // that run down to the 0 V rail
        { a: "E32", b: "W32", colour: "green", num: 7 },   // R2 across to the LED
        { a: "H24", b: "M24", colour: "blue",  num: 8 },   // the timing net down to the capacitor
        { a: "N31", b: "X31", colour: "black", num: 9 }    // the capacitor's − to the 0 V rail
      ],
      testpoints: [{ id: "TP1", at: "H8", predict: 1 }]
    },
    circuit: (C, o) => {
      /* Drawn exactly as the classroom material draws it (the 555 photographs
         on classes/electronics/theory/logic-and-ics.html): a square box with
         "555" in the middle and the pin NUMBER inside the box wherever a wire
         meets it — 7, 6, 2 down the left, 4 and 8 on top, 3 on the right,
         1 and 5 underneath.  Numbers, not function names: turning a number
         into a function on the data sheet is the skill.

         The supply pins ARE wired here, because the template wires them.  That
         is not a contradiction of the gate questions: a distinctive-shape gate
         symbol has no supply pins to draw, which is exactly why those
         questions leave the pupil to work them out. */
      const TOP = 24, BOT = 288, XT = 120, XO = 300;
      const ic = C.icBlock(210, 150, { w: 70, h: 66, name: "555",
        left:   [{ num: "7", at: 0.2 }, { num: "6", at: 0.5 }, { num: "2", at: 0.8 }],
        top:    [{ num: "4", at: 0.35 }, { num: "8", at: 0.78 }],
        right:  [{ num: "3", at: 0.5 }],
        bottom: [{ num: "1", at: 0.35 }, { num: "5", at: 0.78 }] });
      const P = ic.at;
      const b =
        C.rail(RAIL_L, 320, TOP, { pos: true }) + C.rail(RAIL_L, 320, BOT) +
        ic.svg +

        // pin 8 is the supply and pin 4 (Reset) is tied up to it
        C.wire([[P["8"][0], P["8"][1]], [P["8"][0], TOP]], "sbd-pos") + C.node(P["8"][0], TOP) +
        C.wire([[P["4"][0], P["4"][1]], [P["4"][0], TOP]], "sbd-pos") + C.node(P["4"][0], TOP) +
        // pin 1 is 0 V; pin 5 (control voltage) is left open, which is normal
        C.wire([[P["1"][0], P["1"][1]], [P["1"][0], BOT]]) + C.node(P["1"][0], BOT) +

        // the timing chain: R1 from the rail into pin 7, pin 6 tied to it, C1 to 0 V
        C.node(XT, TOP) + C.wire([[XT, TOP], [XT, 46]], "sbd-pos") +
        C.res(XT, 74, { dir: "v", span: 56, label: "R1", value: "100 kΩ", labelLeft: true }) +
        C.wire([[XT, 102], [XT, 200]]) +
        C.wire([[XT, P["7"][1]], [P["7"][0], P["7"][1]]]) + C.node(XT, P["7"][1]) +
        C.wire([[XT, P["6"][1]], [P["6"][0], P["6"][1]]]) + C.node(XT, P["6"][1]) +
        C.ecap(XT, 228, { span: 56, label: "C1", value: "10 µF" }) +
        C.wire([[XT, 256], [XT, BOT]]) + C.node(XT, BOT) +

        /* The trigger wire crosses the timing chain with no junction dot, which
           is the template's convention for "these do not join" — the dot is the
           only thing that means a connection. */
        C.term(40, P["2"][1], { label: "TRIG" }) +
        C.wire([[47, P["2"][1]], [P["2"][0], P["2"][1]]]) +

        // the output drives the stair light
        C.wire([[P["3"][0], P["3"][1]], [XO, P["3"][1]], [XO, 176]]) +
        C.res(XO, 204, { dir: "v", span: 56, label: "R2", value: "270 Ω", labelLeft: true }) +
        C.wire([[XO, 232], [XO, 252]]) +
        C.led(XO, 268, { dir: "d", span: 32, label: "LED1" }) +
        C.wire([[XO, 284], [XO, BOT]]) + C.node(XO, BOT) +

        nn(C, o, 70, TOP, 1) + nn(C, o, 150, BOT, 2) +
        // on the stub into pin 7, NOT on the timing column: a ring sitting on the
        // TRIG crossing would read as a junction dot
        nn(C, o, 150, P["7"][1], 3) + nn(C, o, 80, P["2"][1], 4) +
        nn(C, o, 272, P["3"][1], 5) + nn(C, o, XO, 242, 6);
      return { w: 340, h: 316, body: b };
    },
    why: [
      "A <strong>monostable</strong> has one stable state. Pulling <strong>Trigger</strong> " +
      "low starts a single output pulse, and the pulse ends by itself once C1 has charged " +
      "through R1 to two thirds of the supply — nothing has to switch it off.",
      "<strong>Threshold, Discharge and C1's + leg are one net.</strong> That single " +
      "connection is what makes it a timer, and it is the one most often missed on the " +
      "layout: on the board they are two pins on opposite sides of the cut, so it takes " +
      "two link wires to bring them together.",
      "<strong>Reset (pin 4) is tied to +5 V.</strong> Left floating it resets at random " +
      "and the light drops out early — a fault that looks like a duff chip.",
      "The 555 is drawn the standard way — a square with <strong>555</strong> in it and the " +
      "<strong>pin number</strong> at every point a wire meets it. The numbers are all you " +
      "get: page 3 of the data sheet turns them into <strong>2 Trigger, 3 Output, 4 Reset, " +
      "6 Threshold, 7 Discharge</strong>, with 8 and 1 the supplies and 5 left open.",
      "Notice that the trigger wire <strong>crosses</strong> the timing chain without a dot. " +
      "A junction dot is the only thing that means a join — two wires crossing with no dot " +
      "are not connected, on this diagram and in the exam.",
      "With the button just pressed the output is high, so <strong>TP1 reads logic 1</strong>. " +
      "A 0 there while the light is supposed to be on puts the fault in the timing parts, " +
      "not in the lamp."
    ]
  };

  /* ------------------------------------------------------------------------
     Q10 — two inverters in one package.  The §5.1 archetype with no shared
     signal at all: one chip, two completely unrelated sensors, and four gates
     left unused.  Two test points, one per sub-system output.
     ------------------------------------------------------------------------ */
  const twoInverters = {
    id: "two-inverters",
    title: "Two active-low sensors",
    board: "34-0411",
    scaffold: "blank",
    scenario: [
      "Two sensors on a machine are active-low: each reads logic 0 when its condition is " +
      "true. Both have to be inverted before the rest of the system can use them.",
      "One 7404 has six inverters in it, so both signals go through the same chip.",
      "Both sensor lines carry a 10 kΩ pull-down to 0 V, and the four inverters you are not " +
      "using have their inputs tied straight to 0 V."
    ],
    components: [
      { id: "+5V",  footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",   footprint: "term-1", name: "0 V supply", neg: true },
      { id: "S1",   footprint: "term-1", name: "S1 — lid sensor" },
      { id: "S2",   footprint: "term-1", name: "S2 — float switch" },
      { id: "IC1",  footprint: "dip-14", part: "7404", name: "IC1 — 7404 hex inverter" },
      { id: "R1",   footprint: "res-4",  name: "R1 (270 Ω)" },
      { id: "LED1", footprint: "led-2",  name: "LED1 — lid open" },
      { id: "R2",   footprint: "res-4",  name: "R2 (270 Ω)" },
      { id: "R3",   footprint: "res-4",  name: "R3 (10 kΩ) — pull-down on S1" },
      { id: "R4",   footprint: "res-4",  name: "R4 (10 kΩ) — pull-down on S2" },
      { id: "LED2", footprint: "led-2",  name: "LED2 — tank empty" }
    ],
    target: [
      ["+5V.1", "IC1.14"],
      ["0V.1", "IC1.7", "LED1.k", "LED2.k", "R3.1", "R4.1"],
      ["S1.1", "IC1.1", "R3.2"],
      ["IC1.2", "R1.1"],
      ["R1.2", "LED1.a"],
      ["S2.1", "IC1.3", "R4.2"],
      ["IC1.4", "R2.1"],
      ["R2.2", "LED2.a"]
    ],
    dontcare: ["IC1.5", "IC1.6", "IC1.8", "IC1.9", "IC1.10", "IC1.11", "IC1.12", "IC1.13"],
    tpRequired: ["IC1.2", "IC1.4"],
    /* Two test points with DIFFERENT expected readings, deliberately: an
       active-low sensor that has tripped and one that has not. */
    expect: {
      inputs: [["S1", 0], ["S2", 1]],
      note: "sensor 1 has tripped (active low) and sensor 2 has not",
      levels: { "IC1.2": 1, "IC1.4": 0 }
    },
    /* Two unrelated signals through one package, so the stages are the two
       chains rather than input-then-output: get the first sensor's chain right
       and the second is the same job again, which is the lesson. */
    stages: [
      { name: "The chip and sensor 1",
        parts: ["+5V", "0V", "S1", "IC1", "R1", "LED1", "R3"],
        hint: "Place the chip, cut every track under it, and build sensor 1's chain right " +
              "through to its indicator. Sensor 2 unlocks once this checks clean." },
      { name: "Sensor 2's chain",
        parts: ["S2", "R2", "LED2", "R4"],
        hint: "Now the same again for sensor 2, on the second inverter of the SAME chip — " +
              "then mark both test points and say what each will read." }
    ],
    reference: {
      cuts: ["F11", "G11", "H11", "I11", "J11", "K11", "L11"],
      placements: [
        { id: "IC1",  footprint: "dip-14", at: "F10" },
        { id: "S1",   footprint: "term-1", at: "F2" },
        { id: "S2",   footprint: "term-1", at: "H2" },
        { id: "0V",   footprint: "term-1", at: "M2" },            // the 0 V rail, track M
        { id: "+5V",  footprint: "term-1", at: "F20" },
        /* Both pull-downs go UPWARDS. Three tracks below pin 1 is pin 4 and
           three below pin 3 is pin 6 — both outputs, and a resistor onto either
           would tie an output to 0 V. */
        { id: "R3",   footprint: "res-4",  at: "C4", rot: 90 },   // C4 (0 V) to F4 (pin 1)
        { id: "R4",   footprint: "res-4",  at: "E6", rot: 90 },   // E6 (0 V) to H6 (pin 3)
        // both output chains hang below the 0 V rail, because every track
        // between the two rows of chip pins is now spoken for
        { id: "R1",   footprint: "res-4",  at: "N5", rot: 90 },   // N5 to Q5
        { id: "LED1", footprint: "led-2",  at: "Q7", rot: 90 },   // Q7 anode, R7 cathode
        { id: "R2",   footprint: "res-4",  at: "P8", rot: 90 },   // P8 to S8
        { id: "LED2", footprint: "led-2",  at: "S10", rot: 90 }   // S10 anode, T10 cathode
      ],
      links: [
        { a: "G9",  b: "N9",  colour: "orange", num: 1 },  // pin 2 -> chain 1
        { a: "I3",  b: "P3",  colour: "green",  num: 2 },  // pin 4 -> chain 2
        { a: "R6",  b: "M6",  colour: "black",  num: 3 },  // LED1 cathode -> 0 V
        { a: "T4",  b: "M4",  colour: "black",  num: 4 },  // LED2 cathode -> 0 V
        { a: "C20", b: "M20", colour: "black",  num: 5 },  // R3's far leg -> 0 V
        { a: "E5",  b: "M5",  colour: "black",  num: 6 },  // R4's far leg -> 0 V
        { a: "J7",  b: "M7",  colour: "black",  num: 7 },  // spare pin 5
        { a: "L8",  b: "M8",  colour: "black",  num: 8 },  // pin 7 -> 0 V
        { a: "G14", b: "M14", colour: "black",  num: 9 },  // spare pin 13
        { a: "I15", b: "M15", colour: "black",  num: 10 }, // spare pin 11
        { a: "K16", b: "M16", colour: "black",  num: 11 }  // spare pin 9
      ],
      testpoints: [{ id: "TP1", at: "G3", predict: 1 }, { id: "TP2", at: "P2", predict: 0 }]
    },
    circuit: (C, o) => {
      const g1 = C.notGate(178, 68, { pins: pinNos(o, ["1", "2"]) });
      const g2 = C.notGate(178, 148, { pins: pinNos(o, ["3", "4"]) });
      /* Gate a drives the FAR column and gate b the near one, so neither
         output wire has to cross the other chain.  Two wires crossing with no
         junction dot is correct electrically and unreadable pedagogically — a
         pupil cannot tell a crossing from a join. */
      const TOP = 22, BOT = 286, XA = 318, XB = 246;
      const b =
        C.rail(RAIL_L, 352, TOP, { pos: true }) + C.rail(RAIL_L, 352, BOT) +

        C.term(42, 68, { label: "S1" }) + C.wire([[49, 68], [150, 68]]) +
        C.term(42, 148, { label: "S2" }) + C.wire([[49, 148], [150, 148]]) +
        pullDown(C, 58, 68, "R3", BOT) + pullDown(C, 120, 148, "R4", BOT) +
        g1.svg + C.text(181, 46, "IC1a") +
        g2.svg + C.text(181, 126, "IC1b") +

        C.wire([[220, 68], [XA, 68], [XA, 96]]) +
        C.res(XA, 124, { dir: "v", span: 56, label: "R1", value: "270 \u03a9" }) +
        C.wire([[XA, 152], [XA, 184]]) +
        C.led(XA, 202, { dir: "d", span: 36, label: "LED1" }) +
        C.wire([[XA, 220], [XA, BOT]]) + C.node(XA, BOT) +

        C.wire([[220, 148], [XB, 148], [XB, 166]]) +
        C.res(XB, 194, { dir: "v", span: 56, label: "R2", value: "270 \u03a9", labelLeft: true }) +
        C.wire([[XB, 222], [XB, 242]]) +
        C.led(XB, 260, { dir: "d", span: 36, label: "LED2" }) +
        C.wire([[XB, 278], [XB, BOT]]) + C.node(XB, BOT) +

        nn(C, o, 140, 68, 3) + nn(C, o, 140, 148, 6) + nn(C, o, 150, TOP, 1) +
        nn(C, o, 170, BOT, 2) + nn(C, o, 270, 68, 4) + nn(C, o, XA, 168, 5) +
        nn(C, o, 232, 148, 7) + nn(C, o, XB, 232, 8);
      return { w: 376, h: 310, body: b };
    },
    why: [
      "Two signals, two gates, <strong>one chip</strong>. The 7404 holds six inverters and " +
      "these are two of them — a pupil who draws two separate NOT symbols in Yenka must not " +
      "then put two chips on the board.",
      "The two signals never meet. They share only the package, pin 7 (0 V) and pin 14 (+5 V) " +
      "— which is exactly why the seven cuts matter: without them the two outputs would be " +
      "joined to the two inputs.",
      "Four inverters are unused, and <strong>every one of their inputs must be tied to 0 V</strong> " +
      "— pins 5, 9, 11 and 13. Never tie an unused <em>output</em> to anything.",
      "Both pull-downs go <strong>above</strong> the chip. A 7404's pins alternate input and " +
      "output, so a resistor dropped three tracks from pin 1 lands on pin 4, and three from " +
      "pin 3 lands on pin 6 — both outputs.",
      "Each sub-system output gets its own numbered test point, planned before you build.",
      "With <strong>S1 = 0, S2 = 1</strong>, the inverters give <strong>TP1 = 1</strong> and <strong>TP2 = 0</strong> — one lamp on, one off. Two test points on one chip is the point of this board: they tell you which of the two signals has gone wrong."
    ]
  };


  /* ------------------------------------------------------------------------
     Q12 — Frost warning.  A 741 used as a COMPARATOR: a thermistor divider on
     the non-inverting input, a fixed reference divider on the inverting one.

     741 pinout (SQA data sheet X860/75/12, page 3): 1 and 5 Offset Null,
     2 Inverting (−), 3 Non-Inverting (+), 4 V−, 6 Output, 7 V+, 8 NC.  Both
     offset-null pins and the NC pin are left open, which is normal — they are
     `dontcare`, so a pupil who ties them anywhere is not failed for it (R1).

     The thermistor sits at the BOTTOM of its divider on purpose: as it gets
     colder an NTC's resistance rises, so the divider output rises above the
     reference and the output goes high when it is cold, which is the way round
     a frost warning has to work.
     ------------------------------------------------------------------------ */
  const frostComparator = {
    id: "frost-comparator",
    title: "Frost warning",
    board: "34-0411",
    scaffold: "blank",
    scenario: [
      "A warning light comes on when the air temperature drops to freezing, so a road " +
      "crew knows to grit.",
      "IC1 is a 741 used as a <strong>comparator</strong>. R1 and TH1 form the sensing " +
      "divider; R2 and R3 set the fixed reference the sensor is compared against."
    ],
    components: [
      { id: "+5V",  footprint: "term-1", name: "+5 V supply", pos: true },
      { id: "0V",   footprint: "term-1", name: "0 V supply", neg: true },
      { id: "IC1",  footprint: "dip-8",  part: "741", name: "IC1 — 741 op-amp" },
      // the thermistor is off-board on a 2-way terminal block, and either way round
      { id: "TH1",  footprint: "term-2", symmetric: true, name: "TH1 — thermistor" },
      { id: "R1",   footprint: "res-4",  name: "R1 (10 kΩ)" },
      { id: "R2",   footprint: "res-4",  name: "R2 (10 kΩ) — reference" },
      { id: "R3",   footprint: "res-4",  name: "R3 (10 kΩ) — reference" },
      { id: "R4",   footprint: "res-4",  name: "R4 (270 Ω)" },
      { id: "LED1", footprint: "led-2",  name: "LED1 — frost warning" }
    ],
    target: [
      ["+5V.1", "IC1.7", "R1.1", "R2.1"],
      ["0V.1", "IC1.4", "TH1.2", "R3.2", "LED1.k"],
      ["R1.2", "TH1.1", "IC1.3"],
      ["R2.2", "R3.1", "IC1.2"],
      ["IC1.6", "R4.1"],
      ["R4.2", "LED1.a"]
    ],
    // both offset-null pins and the NC pin are left open, which is normal
    dontcare: ["IC1.1", "IC1.5", "IC1.8"],
    tpRequired: ["IC1.6"],
    expect: {
      inputs: [["temperature", "cold"]],
      note: "the thermistor is cold, so its resistance is high and the sensing divider " +
            "sits above the reference",
      levels: { "IC1.6": 1 }
    },
    stages: [
      { name: "The two dividers and the chip",
        parts: ["+5V", "0V", "IC1", "R1", "TH1", "R2", "R3"],
        hint: "Place the 741 and cut all four tracks it crosses. The sensing divider goes " +
              "to the + input and the reference divider to the − input — the data sheet " +
              "says which pin is which." },
      { name: "The output sub-system",
        parts: ["R4", "LED1"],
        hint: "Now the series resistor and the warning light on the op-amp's output — then " +
              "the test point, and what it reads when it is cold." }
    ],
    reference: {
      cuts: ["P11", "Q11", "R11", "S11"],
      placements: [
        { id: "IC1",  footprint: "dip-8",  at: "P10", rot: 0 },
        { id: "+5V",  footprint: "term-1", at: "A2" },
        { id: "0V",   footprint: "term-1", at: "X2" },
        { id: "R1",   footprint: "res-4",  at: "A4",  rot: 90 },   // legs A4 and D4
        { id: "TH1",  footprint: "term-2", at: "D6",  rot: 90 },   // legs D6 and F6
        { id: "R2",   footprint: "res-4",  at: "H16", rot: 90 },   // legs H16 and K16
        { id: "R3",   footprint: "res-4",  at: "K18", rot: 90 },   // legs K18 and N18
        { id: "R4",   footprint: "res-4",  at: "R28", rot: 90 },   // legs R28 and U28
        { id: "LED1", footprint: "led-2",  at: "W30", rot: 90 }
      ],
      links: [
        { a: "A18", b: "H18", colour: "red",    num: 1 },  // rail down to R2's top
        { a: "A26", b: "Q26", colour: "red",    num: 2 },  // rail across to V+'s track
        { a: "D9",  b: "R9",  colour: "blue",   num: 3 },  // sensing divider to the + input
        { a: "K7",  b: "Q7",  colour: "orange", num: 4 },  // reference divider to the − input
        { a: "F8",  b: "X8",  colour: "black",  num: 5 },  // thermistor's low end to 0 V
        { a: "N20", b: "X20", colour: "black",  num: 6 },  // R3's low end to 0 V
        { a: "S6",  b: "X6",  colour: "black",  num: 7 },  // V− pin to 0 V
        { a: "U32", b: "W32", colour: "green",  num: 8 }   // R4 across to the LED
      ],
      testpoints: [{ id: "TP1", at: "R18", predict: 1 }]
    },
    circuit: (C, o) => {
      /* Laid out like the comparator on the theory page: both dividers side by
         side on the left, op-amp to the right, reference to the − input and the
         sensor to the +.  The reference wire crosses the sensor's column with
         NO junction dot — which is the template's convention, and the only
         thing that marks a real join is the dot.  (An earlier draft moved the
         dividers apart to dodge the crossing; the classroom material does not,
         and matching it beats tidying it.) */
      const TOP = 24, BOT = 288, XREF = 70, XSEN = 150, XO = 312;
      const A = C.opamp(236, 168, {});
      const M = A.minus[1], P = A.plus[1];
      const b =
        C.rail(RAIL_L, 336, TOP, { pos: true }) + C.rail(RAIL_L, 336, BOT) +

        // reference divider: two equal resistors, so the reference is half supply
        C.node(XREF, TOP) + C.wire([[XREF, TOP], [XREF, 70]], "sbd-pos") +
        C.res(XREF, 98, { dir: "v", span: 56, label: "R2", value: "10 kΩ", labelLeft: true }) +
        C.wire([[XREF, 126], [XREF, M]]) + C.node(XREF, M) +
        C.wire([[XREF, M], [XREF, 182]]) +
        C.res(XREF, 210, { dir: "v", span: 56, label: "R3", value: "10 kΩ", labelLeft: true }) +
        C.wire([[XREF, 238], [XREF, BOT]]) + C.node(XREF, BOT) +

        // sensing divider: R1 on top, thermistor below, so COLD reads high
        C.node(XSEN, TOP) + C.wire([[XSEN, TOP], [XSEN, 78]], "sbd-pos") +
        C.res(XSEN, 106, { dir: "v", span: 56, label: "R1", value: "10 kΩ", labelLeft: true }) +
        C.wire([[XSEN, 134], [XSEN, 182]]) + C.node(XSEN, P) +
        C.thermistor(XSEN, 210, { dir: "v", span: 56 }) +
        C.text(134, 214, "TH1", { anchor: "end" }) +
        C.wire([[XSEN, 238], [XSEN, BOT]]) + C.node(XSEN, BOT) +

        // reference to −, sensor to +; the first crosses the second's column
        C.wire([[XREF, M], [A.minus[0], M]]) +
        C.wire([[XSEN, P], [A.plus[0], P]]) +
        A.svg + C.text(206, 236, "IC1  741") +

        // the supply pins are drawn, as the template draws them
        C.wire([[A.vplus[0], A.vplus[1]], [A.vplus[0], TOP]], "sbd-pos") +
        C.node(A.vplus[0], TOP) +
        C.wire([[A.vminus[0], A.vminus[1]], [A.vminus[0], BOT]]) +
        C.node(A.vminus[0], BOT) +

        // the output drives the warning light
        C.wire([[A.out[0], A.out[1]], [XO, A.out[1]], [XO, 176]]) +
        C.res(XO, 204, { dir: "v", span: 56, label: "R4", value: "270 Ω", labelLeft: true }) +
        C.wire([[XO, 232], [XO, 252]]) +
        C.led(XO, 268, { dir: "d", span: 32, label: "LED1" }) +
        C.wire([[XO, 284], [XO, BOT]]) + C.node(XO, BOT) +

        nn(C, o, 108, TOP, 1) + nn(C, o, 108, BOT, 2) +
        nn(C, o, 178, P, 3) + nn(C, o, 106, M, 4) +
        nn(C, o, 296, A.out[1], 5) + nn(C, o, XO, 242, 6);
      return { w: 356, h: 316, body: b };
    },
    why: [
      "A <strong>comparator</strong> has no feedback: the output slams high when the " +
      "+ input is above the − input and low when it is below. Two potential dividers, " +
      "one sensing and one fixed, are all it needs.",
      "<strong>The thermistor is at the bottom of its divider on purpose.</strong> An NTC " +
      "gets <em>more</em> resistive as it cools, so putting it at the bottom makes the " +
      "divider voltage <em>rise</em> when it is cold — which is when the warning has to " +
      "come on. Swap R1 and TH1 over and the light works back to front.",
      "R2 and R3 are equal, so the reference sits at half the supply. Changing R3 changes " +
      "the temperature the warning trips at, and nothing else.",
      "The diagram marks the inputs <strong>+</strong> and <strong>−</strong>, not 3 and 2 " +
      "— <strong>the + input is pin 3 and the − input is pin 2</strong>, with the supplies " +
      "on pins 7 and 4. Page 3 of the data sheet. Pins 1, 5 and 8 are left open, which is " +
      "normal, so it does not matter what happens to them.",
      "Cold means the + input is above the reference, so <strong>TP1 reads logic 1</strong>. " +
      "A 0 there on a frosty morning puts the fault in the sensing divider, not the lamp."
    ]
  };

  root.QUESTIONS = [ledResistor, ldrDivider, andGateLed, notGateLed, liftInterlock,
                    kilnInterlock, carparkFull, transistorBuzzer, greenhouse, twoInverters,
                    timer555, frostComparator];

})(typeof globalThis !== "undefined" ? globalThis : this);
