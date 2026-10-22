/* ============================================================================
   Scenario board: S6 · Lift door interlock (BENCH-PLAN §4) · level 3 (safety)
   ----------------------------------------------------------------------------
   5 V. Slide switches A (door closed), B (floor selected) and C (not
   overloaded), each with a 10 kΩ pull-down. B AND C in gate a of IC1
   (74HC08), its output AND A in gate b, which drives R1 270 Ω and LED1 (motor
   enable). T3 gate a's output, T4 gate b's. Layout: boards/lift-interlock.mjs.

   Fault S6: a solder bridge between the B and C strips. With B on, C is on
   too, so the lift runs while overloaded (A on, B on, C off). That is a safety
   fault. Distractors: C stuck on, a 74HC00 fitted, pin 1's cut missing.
   ============================================================================ */
(function (root) {
  "use strict";
  const TB = root.TB;
  const S = (a, b, c) => ({ A: a ? "on" : "off", B: b ? "on" : "off", C: c ? "on" : "off" });

  TB.scenario({
    id: "lift-interlock",
    parts: {
      A:    { model: "spdt", value: 0 },
      B:    { model: "spdt", value: 0 },
      C:    { model: "spdt", value: 0 },
      IC1:  { model: "hc08", value: 0 },
      R1:   { model: "res", value: 270 },
      R2:   { model: "res", value: 10e3 },
      R3:   { model: "res", value: 10e3 },
      R4:   { model: "res", value: 10e3 },
      LED1: { model: "led", value: 0, colour: "green" }
    },
    supply: { pos: "+5V.1", neg: "0V.1" },
    supplyTP: "T1", ground: "T2",
    inputs: {
      A: { states: { off: "1", on: "2" }, start: "off" },
      B: { states: { off: "1", on: "2" }, start: "off" },
      C: { states: { off: "1", on: "2" }, start: "off" }
    },

    faults: {
      s6: { plan: "S6", name: "A solder bridge joins the B and C strips", edits: [{ bridge: ["F8", "G8"] }] }
    },
    distractors: {
      cstuck:    { name: "C is stuck on", edits: [{ stuck: "C", at: "2" }] },
      wrongchip: { name: "A 74HC00 is fitted, not a 74HC08", edits: [{ chip: "IC1", to: "hc00" }] },
      nocut:     { name: "The track under pin 1 is not cut", edits: [{ uncut: "F11" }] }
    },

    readings: {
      T1:     { dcv: "T1", set: S(1, 1, 0) },
      Cpin:   { probe: "IC1.2", set: S(1, 1, 0) }, T3: { probe: "T3", set: S(1, 1, 0) },
      OUT:    { probe: "T4", set: S(1, 1, 0) }, LED: { led: "LED1", set: S(1, 1, 0) },
      Cpin0:  { probe: "IC1.2", set: S(1, 0, 0) }, OUT0: { probe: "T4", set: S(1, 0, 0) },
      Bpin0:  { probe: "IC1.1", set: S(1, 0, 0) },
      OUTall: { probe: "T4", set: S(1, 1, 1) }, LEDall: { led: "LED1", set: S(1, 1, 1) },
      BC:     { off: "OHM 200", red: "IC1.1", black: "IC1.2" }
    },
    expect: {
      good: {
        T1: [4.85, 5.10], Cpin: "lo", T3: "lo", OUT: "lo", LED: "off", Cpin0: "lo", OUT0: "lo",
        Bpin0: "lo", OUTall: "hi", LEDall: "on", BC: "over"
      },
      s6:        { Cpin: "hi", T3: "hi", OUT: "hi", LED: "on", Cpin0: "lo", OUT0: "lo", BC: [0.2, 1.5] },
      cstuck:    { Cpin: "hi", OUT: "hi", Cpin0: "hi", BC: "over" },
      wrongchip: { T3: "hi", OUT: "lo" },
      nocut:     { Bpin0: "hi", OUT: "lo" }
    },
    keys: {
      s6: ["Cpin", "OUT", "LED", "BC"],
      cstuck: ["Cpin0"], wrongchip: ["T3"], nocut: ["Bpin0"]
    },
    /* With B off the bridge leaves C low; a stuck C stays high. */
    distinct: [
      { cases: ["s6", "cstuck"], reading: "Cpin0" },
      { cases: ["s6", "wrongchip"], reading: "OUT" },
      { cases: ["s6", "nocut"], reading: "OUT" }
    ]
  });

})(typeof globalThis !== "undefined" ? globalThis : this);
