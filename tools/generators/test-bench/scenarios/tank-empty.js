/* ============================================================================
   Scenario board: S5 · Tank empty warning (BENCH-PLAN §4) · level 2
   ----------------------------------------------------------------------------
   5 V. SW1 (standing in for the float switch) with a 10 kΩ pull-down into
   IC1 (74HC04) pin 1; pin 2 drives R1 270 Ω and LED1. T3 pin 1, T4 pin 2.
   Layout: boards/tank-empty.mjs.

   Fault S5: the track is not cut under the chip on pin 1's strip, so pin 1 is
   joined to pin 14 (+5 V). Pin 1 is high whatever the switch does; the LED
   never lights. Distractors: LED1 turned round, SW1 stuck on, a 74HC08 fitted.
   ============================================================================ */
(function (root) {
  "use strict";
  const TB = root.TB;
  const OFF = { SW1: "off" }, ON = { SW1: "on" };

  TB.scenario({
    id: "tank-empty",
    parts: {
      SW1:  { model: "spdt", value: 0 },
      IC1:  { model: "hc04", value: 0 },
      R1:   { model: "res", value: 270 },
      R2:   { model: "res", value: 10e3 },
      LED1: { model: "led", value: 0, colour: "red" }
    },
    supply: { pos: "+5V.1", neg: "0V.1" },
    supplyTP: "T1", ground: "T2",
    bench: {
      title: "Tank empty warning", sub: "74HC04 NOT gate board",
      should: "<b>Should:</b> LED1 lights when SW1 is off (the tank is empty), and goes off when SW1 is on.",
      probe: "CMOS", inputs: { SW1: { name: "SW1 float switch", words: { off: "Off", on: "On" } } }
    },
    inputs: { SW1: { states: { off: "1", on: "2" }, start: "off" } },

    faults: {
      s5: { plan: "S5", name: "The track under the chip is not cut on pin 1's strip", edits: [{ uncut: "F11" }] }
    },
    distractors: {
      ledrev:    { name: "LED1 is the wrong way round", edits: [{ turn: "LED1" }] },
      stuck:     { name: "SW1 is stuck on", edits: [{ stuck: "SW1", at: "2" }] },
      wrongchip: { name: "A 74HC08 is fitted, not a 74HC04", edits: [{ chip: "IC1", to: "hc08" }] }
    },

    readings: {
      T1:     { dcv: "T1", set: OFF },
      P1off:  { probe: "T3", set: OFF }, P2off: { probe: "T4", set: OFF }, LEDoff: { led: "LED1", set: OFF },
      T3off:  { dcv: "T3", set: OFF }, T4off: { dcv: "T4", set: OFF },
      P1on:   { probe: "T3", set: ON }, P2on: { probe: "T4", set: ON }, LEDon: { led: "LED1", set: ON },
      cut:    { off: "OHM 200", red: "IC1.1", black: "IC1.14", set: OFF },
      swc2:   { off: "OHM 200", red: "SW1.c", black: "SW1.2", set: OFF },
      swc1:   { off: "OHM 200", red: "SW1.c", black: "SW1.1", set: OFF }
    },
    expect: {
      good: {
        T1: [4.85, 5.10], LEDoff: "on", T3off: [0, 0.015], T4off: [4.2, 4.85], P1off: "lo", P2off: "hi",
        P1on: "hi", P2on: "lo", LEDon: "off", cut: "over", swc2: "over", swc1: [0.2, 1.5]
      },
      s5:        { LEDoff: "off", T3off: [4.85, 5.10], T4off: [0, 0.05], P1off: "hi", P2off: "lo", cut: [0.2, 1.5], swc1: [0.2, 1.5] },
      ledrev:    { LEDoff: "off", T4off: [4.85, 5.10] },
      stuck:     { P1off: "hi", LEDoff: "off", swc1: "over" },
      wrongchip: { P2off: "none", LEDoff: "off" }
    },
    keys: {
      s5: ["LEDoff", "T3off", "P1off", "cut"],
      ledrev: ["LEDoff"], stuck: ["P1off", "swc1"], wrongchip: ["P2off"]
    },
    /* Stuck on and the missing cut both put +5 V on pin 1, and both beep from
       the middle pin to pin 2. Middle pin to pin 1, slid off, tells them apart. */
    distinct: [
      { cases: ["s5", "stuck"], reading: "swc1" },
      { cases: ["s5", "ledrev"], reading: "T3off" },
      { cases: ["s5", "wrongchip"], reading: "P2off" }
    ]
  });

})(typeof globalThis !== "undefined" ? globalThis : this);
