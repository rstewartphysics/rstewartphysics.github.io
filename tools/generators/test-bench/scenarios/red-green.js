/* ============================================================================
   Scenario board: S10 · Slide switch picks red or green (BENCH-PLAN §4) · level 2
   ----------------------------------------------------------------------------
   5 V. SW1's middle pin on +5 V; pin 1 feeds R1 270 Ω and LED1 red, pin 2
   R2 270 Ω and LED2 green. T3 the middle pin, T4 the red branch, T5 the green.
   Layout: boards/red-green.mjs.

   Fault S10 (teacher, 22 Oct 2026, M1): the +5 V link goes to the red pin's
   strip, not the middle pin's. Red is on whichever way the switch is slid;
   slid to green, the middle pin has no supply: T3 0 V, green off.
   Distractors: LED2 turned round, the switch broken inside, no supply.
   ============================================================================ */
(function (root) {
  "use strict";
  const TB = root.TB;
  const RED = { SW1: "red" }, GREEN = { SW1: "green" };

  TB.scenario({
    id: "red-green",
    parts: {
      SW1:  { model: "spdt", value: 0 },
      R1:   { model: "res", value: 270 },
      LED1: { model: "led", value: 0, colour: "red" },
      R2:   { model: "res", value: 270 },
      LED2: { model: "led", value: 0, colour: "green" }
    },
    supply: { pos: "+5V.1", neg: "0V.1" },
    supplyTP: "T1", ground: "T2",
    bench: {
      title: "Red or green", sub: "Slide switch board",
      should: "<b>Should:</b> slide SW1 to red and LED1 (red) lights. Slide it to green and LED2 (green) lights.",
      probe: null, inputs: { SW1: { name: "SW1", words: { red: "Red", green: "Green" } } }
    },
    inputs: { SW1: { states: { red: "1", green: "2" }, start: "red" } },

    faults: {
      s10: { plan: "S10", name: "The +5 V link goes to the red pin's strip", edits: [{ link: "C6", to: "B6" }] }
    },
    distractors: {
      led2rev:  { name: "LED2 is the wrong way round", edits: [{ turn: "LED2" }] },
      swbroken: { name: "SW1 is broken inside", edits: [{ open: "SW1" }] },
      nosupply: { name: "No supply reaches the board", edits: [{ dry: "+5V.1" }] }
    },

    readings: {
      T1:    { dcv: "T1", set: RED },
      T3r:   { dcv: "T3", set: RED }, T4r: { dcv: "T4", set: RED }, T5r: { dcv: "T5", set: RED },
      LED1r: { led: "LED1", set: RED }, LED2r: { led: "LED2", set: RED },
      T3g:   { dcv: "T3", set: GREEN }, T4g: { dcv: "T4", set: GREEN }, T5g: { dcv: "T5", set: GREEN },
      LED1g: { led: "LED1", set: GREEN }, LED2g: { led: "LED2", set: GREEN },
      cont1: { off: "OHM 200", red: "SW1.c", black: "SW1.1", set: RED },
      cont2: { off: "OHM 200", red: "SW1.c", black: "SW1.2", set: GREEN },
      T1mid: { off: "OHM 200", red: "T1", black: "SW1.c", set: GREEN }
    },
    expect: {
      good: {
        T1: [4.85, 5.10], T3r: [4.85, 5.10], T4r: [4.85, 5.10], T5r: [0, 0.05], LED1r: "on", LED2r: "off",
        T3g: [4.85, 5.10], T4g: [0, 0.05], T5g: [4.85, 5.10], LED1g: "off", LED2g: "on",
        cont1: [0.2, 1.5], cont2: [0.2, 1.5], T1mid: [0.2, 1.5]
      },
      s10:      { T3r: [4.85, 5.10], LED1r: "on", T3g: [0, 0.05], T4g: [4.85, 5.10], LED1g: "on", LED2g: "off", T1mid: "over" },
      led2rev:  { T3g: [4.85, 5.10], T5g: [4.85, 5.10], LED1g: "off", LED2g: "off" },
      swbroken: { T3r: [4.85, 5.10], T4r: [0, 0.05], LED1r: "off", cont1: "over", cont2: "over" },
      nosupply: { T1: [0, 0.05], LED1r: "off" }
    },
    keys: {
      s10: ["T3g", "T4g", "LED1g", "LED2g"],
      led2rev: ["LED2g"], swbroken: ["T4r", "LED1r", "cont1"], nosupply: ["T1"]
    },
    /* M1: red stays on when slid to green, which green reversed cannot do;
       T3 on the green side is 0 V, which a broken switch cannot do. */
    distinct: [
      { cases: ["s10", "led2rev"], reading: "LED1g" },
      { cases: ["s10", "swbroken"], reading: "T3g" }
    ]
  });

})(typeof globalThis !== "undefined" ? globalThis : this);
