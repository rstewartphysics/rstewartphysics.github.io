/* ============================================================================
   Scenario board: S9 · Slide switch and LED (BENCH-PLAN §4) · level 1
   ----------------------------------------------------------------------------
   5 V. SW1 slide switch (middle pin on +5 V, pin 2 the "on" side), R1 270 Ω,
   LED1 red. T1 +5 V, T2 0 V, T3 after the switch, T4 the R1–LED join.
   Layout: boards/slide-led.mjs.

   Fault S9: LED1 is the wrong way round. No current, so the LED takes the whole
   supply: T4 reads 5 V, not 1.9 V. Distractors: R1 open (T4 0 V), the switch
   not making contact (T3 0 V), no supply.

   The current reading lifts the black link at H19 and puts the meter (DCA 20m,
   red lead in A) between the LED's strip and 0 V (§4 "Current in S1 and S9").
   ============================================================================ */
(function (root) {
  "use strict";
  const TB = root.TB;
  const ON = { SW1: "on" };

  TB.scenario({
    id: "slide-led",
    parts: {
      SW1:  { model: "spdt", value: 0 },
      R1:   { model: "res", value: 270 },
      LED1: { model: "led", value: 0, colour: "red" }
    },
    supply: { pos: "+5V.1", neg: "0V.1" },
    supplyTP: "T1", ground: "T2",
    bench: {
      title: "Switch and LED", sub: "Slide switch board",
      should: "<b>Should:</b> slide SW1 on and LED1 lights.",
      probe: null, inputs: { SW1: { name: "SW1", words: { off: "Off", on: "On" } } }
    },
    inputs: { SW1: { states: { off: "1", on: "2" }, start: "off" } },

    faults: {
      s9: { plan: "S9", name: "LED1 is the wrong way round", edits: [{ turn: "LED1" }] }
    },
    distractors: {
      r1open:   { name: "R1 has a dry joint", edits: [{ dry: "R1.1" }] },
      swdead:   { name: "SW1 does not make contact", edits: [{ dry: "SW1.c" }] },
      nosupply: { name: "No supply reaches the board", edits: [{ dry: "+5V.1" }] }
    },

    /* set: the inputs while the reading is taken. amps: power on, the meter in
       series where a link is lifted. */
    readings: {
      T1:    { dcv: "T1", set: ON },
      T3:    { dcv: "T3", set: ON },
      T4:    { dcv: "T4", set: ON },
      LED1:  { led: "LED1", set: ON },
      T3off: { dcv: "T3" },
      LED1off: { led: "LED1" },
      mA:    { amps: "DCA 20m", red: "H21", black: "T2", lift: ["link@H19"], set: ON },
      LED1diode: { off: "DCV D", red: "T4", black: "T2" }
    },

    expect: {
      good: {
        T1: [4.90, 5.10], T3: [4.85, 5.10], T4: [1.80, 2.12], LED1: "on",
        T3off: [0, 0.05], LED1off: "off", mA: [0.0095, 0.0130], LED1diode: [1.55, 1.95]
      },
      s9:       { T3: [4.85, 5.10], T4: [4.85, 5.10], LED1: "off", mA: [0, 0.00005], LED1diode: "over" },
      r1open:   { T3: [4.85, 5.10], T4: [0, 0.05], LED1: "off", mA: [0, 0.00005] },
      swdead:   { T1: [4.90, 5.10], T3: [0, 0.05], T4: [0, 0.05], LED1: "off" },
      nosupply: { T1: [0, 0.05], T3: [0, 0.05], LED1: "off" }
    },
    keys: {
      s9: ["T4", "LED1", "mA", "LED1diode"],
      r1open: ["T4", "LED1"], swdead: ["T3"], nosupply: ["T1"]
    },
    /* The plan's S9 table: T3 and T4 tell the fault from both distractors. */
    distinct: [
      { cases: ["s9", "r1open"], reading: "T4" },
      { cases: ["s9", "swdead"], reading: "T3" }
    ]
  });

})(typeof globalThis !== "undefined" ? globalThis : this);
