/* ============================================================================
   Scenario board: S2 · Dark-activated light (BENCH-PLAN §4) · level 3
   ----------------------------------------------------------------------------
   5 V. R1 10 kΩ from +5 V to the base; the LDR (NORP12, on the board) from
   the base to 0 V; LED1 and R2 270 Ω from +5 V to Q1's collector. T3 the
   base, T4 the collector. Input: the lamp on the LDR, or its black cap on
   (teacher, 22 Oct 2026, M5). Layout: boards/dark-light.mjs.

   Fault S2: the LDR and R1 are swapped. The light comes on in the light and
   goes off when covered: the opposite of the good board.
   Distractors: LED1 turned round (never on), Q1's collector dry (T3 changes,
   T4 never drops), a dry joint on the LDR (LED always on).
   ============================================================================ */
(function (root) {
  "use strict";
  const TB = root.TB;
  const LIGHT = { LDR: "light" }, DARK = { LDR: "covered" };

  TB.scenario({
    id: "dark-light",
    parts: {
      R1:   { model: "res", value: 10e3 },
      LDR:  { model: "ldr", value: 0 },
      Q1:   { model: "npn", value: 0 },
      R2:   { model: "res", value: 270 },
      LED1: { model: "led", value: 0, colour: "red" }
    },
    supply: { pos: "+5V.1", neg: "0V.1" },
    supplyTP: "T1", ground: "T2",
    bench: {
      title: "Dark-activated light", sub: "Transistor and LDR board",
      should: "<b>Should:</b> with the black cap on the LDR, LED1 lights. Under the lamp, LED1 is off.",
      probe: null, inputs: { LDR: { name: "LDR", words: { light: "Lamp", covered: "Black cap" } } }
    },
    inputs: { LDR: { states: { light: "light", covered: "covered" }, start: "light" } },

    faults: {
      s2: { plan: "S2", name: "The LDR and R1 are swapped", edits: [
        { place: "LDR", at: "B6", rot: 90 }, { place: "R1", at: "E8", rot: 90 }] }
    },
    distractors: {
      ledrev:  { name: "LED1 is the wrong way round", edits: [{ turn: "LED1" }] },
      q1dead:  { name: "Q1's collector has a dry joint", edits: [{ dry: "Q1.c" }] },
      ldropen: { name: "The LDR has a dry joint", edits: [{ dry: "LDR.1" }] }
    },

    readings: {
      T1:     { dcv: "T1", set: LIGHT },
      T3l:    { dcv: "T3", set: LIGHT }, T4l: { dcv: "T4", set: LIGHT }, LED1l: { led: "LED1", set: LIGHT },
      T3d:    { dcv: "T3", set: DARK }, T4d: { dcv: "T4", set: DARK }, LED1d: { led: "LED1", set: DARK },
      LDRl:   { off: "OHM 2k", red: "LDR.1", black: "LDR.2", lift: ["LDR.1"], set: LIGHT },
      LDRd:   { off: "OHM 2M", red: "LDR.1", black: "LDR.2", lift: ["LDR.1"], set: DARK }
    },
    expect: {
      good: {
        T1: [4.85, 5.10], T3l: [0.10, 0.35], T4l: [3.3, 3.9], LED1l: "off",
        T3d: [0.62, 0.82], T4d: [0.03, 0.15], LED1d: "on", LDRl: [295, 605], LDRd: [99e3, 1.01e6]
      },
      s2:      { T3l: [0.65, 0.88], T4l: [0, 0.10], LED1l: "on", T3d: [0.02, 0.50], T4d: [3.3, 3.9], LED1d: "off" },
      ledrev:  { LED1l: "off", LED1d: "off" },
      q1dead:  { T3d: [0.55, 0.80], T4d: [3.3, 3.9], LED1d: "off" },
      ldropen: { T3l: [0.62, 0.82], LED1l: "on", LED1d: "on" }
    },
    keys: {
      s2: ["T3l", "T4l", "LED1l", "T4d", "LED1d"],
      ledrev: ["LED1d"], q1dead: ["T4d", "LED1d"], ldropen: ["T3l", "LED1l"]
    },
    /* Light and covered tell the swap from the rest: on in the light and off
       covered is the swap alone. */
    distinct: [
      { cases: ["s2", "ldropen"], reading: "LED1d" },
      { cases: ["s2", "ledrev"], reading: "LED1l" },
      { cases: ["s2", "q1dead"], reading: "LED1l" }
    ]
  });

})(typeof globalThis !== "undefined" ? globalThis : this);
