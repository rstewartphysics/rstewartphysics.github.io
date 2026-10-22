/* ============================================================================
   Scenario board: S4 · Guard and start button (BENCH-PLAN §4) · level 2
   ----------------------------------------------------------------------------
   5 V. Slide switches A (guard closed) and B (start pressed), each with a
   10 kΩ pull-down, into one gate of IC1 (74HC08); pin 3 drives R1 270 Ω and
   LED1. T3 the output. Layout: boards/guard-start.mjs.

   Fault S4: a 74HC00 (NAND) is fitted. Same pins, so the wiring is right, but
   the output is the wrong way up: on for 00, 01 and 10, off for 11.
   Distractors: LED1 turned round (never lights), A's pull-down dry (A floats
   when off), pin 14 dry (the chip is dead).
   ============================================================================ */
(function (root) {
  "use strict";
  const TB = root.TB;
  const S = (a, b) => ({ A: a ? "on" : "off", B: b ? "on" : "off" });

  TB.scenario({
    id: "guard-start",
    parts: {
      A:    { model: "spdt", value: 0 },
      B:    { model: "spdt", value: 0 },
      IC1:  { model: "hc08", value: 0 },
      R1:   { model: "res", value: 270 },
      R2:   { model: "res", value: 10e3 },
      R3:   { model: "res", value: 10e3 },
      LED1: { model: "led", value: 0, colour: "red" }
    },
    supply: { pos: "+5V.1", neg: "0V.1" },
    supplyTP: "T1", ground: "T2",
    inputs: {
      A: { states: { off: "1", on: "2" }, start: "off" },
      B: { states: { off: "1", on: "2" }, start: "off" }
    },

    faults: {
      s4: { plan: "S4", name: "A 74HC00 (NAND) is fitted, not a 74HC08", edits: [{ chip: "IC1", to: "hc00" }] }
    },
    distractors: {
      ledrev:  { name: "LED1 is the wrong way round", edits: [{ turn: "LED1" }] },
      pdopen:  { name: "R2, A's pull-down, has a dry joint", edits: [{ dry: "R2.1" }] },
      nopower: { name: "IC1 pin 14 has a dry joint", edits: [{ dry: "IC1.14" }] }
    },

    readings: {
      T1:    { dcv: "T1", set: S(1, 1) },
      Q00:   { probe: "T3", set: S(0, 0) }, Q01: { probe: "T3", set: S(0, 1) },
      Q10:   { probe: "T3", set: S(1, 0) }, Q11: { probe: "T3", set: S(1, 1) },
      LED00: { led: "LED1", set: S(0, 0) }, LED01: { led: "LED1", set: S(0, 1) },
      LED10: { led: "LED1", set: S(1, 0) }, LED11: { led: "LED1", set: S(1, 1) },
      T3v11: { dcv: "T3", set: S(1, 1) },
      pinA0: { probe: "IC1.1", set: S(0, 0) }, pinA1: { probe: "IC1.1", set: S(1, 1) },
      pinB1: { probe: "IC1.2", set: S(1, 1) }
    },
    expect: {
      good: {
        T1: [4.85, 5.10], Q00: "lo", Q01: "lo", Q10: "lo", Q11: "hi",
        LED00: "off", LED01: "off", LED10: "off", LED11: "on", T3v11: [4.2, 4.85],
        pinA0: "lo", pinA1: "hi", pinB1: "hi"
      },
      s4: {
        Q00: "hi", Q01: "hi", Q10: "hi", Q11: "lo", LED00: "on", LED01: "on", LED10: "on", LED11: "off",
        T3v11: [0, 0.05], pinA0: "lo", pinA1: "hi", pinB1: "hi"
      },
      ledrev:  { Q11: "hi", LED11: "off", T3v11: [4.85, 5.10] },
      pdopen:  { pinA0: "flicker", Q11: "hi" },
      nopower: { Q00: "none", Q11: "none", LED11: "off" }
    },
    keys: {
      s4: ["Q00", "Q11", "LED00", "LED11", "T3v11"],
      ledrev: ["LED11"], pdopen: ["pinA0"], nopower: ["Q11", "LED11"]
    },
    /* The truth table's first row tells the wrong chip from every distractor. */
    distinct: [
      { cases: ["s4", "ledrev"], reading: "Q00" },
      { cases: ["s4", "pdopen"], reading: "Q00" },
      { cases: ["s4", "nopower"], reading: "Q00" }
    ]
  });

})(typeof globalThis !== "undefined" ? globalThis : this);
