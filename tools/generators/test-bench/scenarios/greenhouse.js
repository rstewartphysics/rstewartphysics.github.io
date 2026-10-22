/* ============================================================================
   Scenario board: S3 · Greenhouse irrigation (BENCH-PLAN §4) · level 3
   ----------------------------------------------------------------------------
   5 V. Slide switches SD (soil dry), TK (tank not empty) and EN (system on),
   each with a 10 kΩ pull-down. SD AND TK in gate a of IC1 (74HC08), its
   output AND EN in gate b, then R1 1 kΩ to Q1 (BC548), which runs the pump
   (off the board). T3 gate a's output, T4 gate b's, T5 the base.
   Layout: boards/greenhouse.mjs.

   Fault S3: R2, SD's pull-down, has a dry joint. With SD off its input floats:
   neither 1 nor 0. With TK and EN on, the pump chatters on and off by itself.
   Distractors: SD stuck on (pump runs steadily), Q1's collector dry (T4 high,
   pump never runs), a 74HC00 fitted.
   ============================================================================ */
(function (root) {
  "use strict";
  const TB = root.TB;
  const S = (sd, tk, en) => ({ SD: sd ? "on" : "off", TK: tk ? "on" : "off", EN: en ? "on" : "off" });
  const KEY = S(0, 1, 1);

  TB.scenario({
    id: "greenhouse",
    parts: {
      SD:   { model: "spdt", value: 0 },
      TK:   { model: "spdt", value: 0 },
      EN:   { model: "spdt", value: 0 },
      IC1:  { model: "hc08", value: 0 },
      R1:   { model: "res", value: 1e3 },
      R2:   { model: "res", value: 10e3 },
      R3:   { model: "res", value: 10e3 },
      R4:   { model: "res", value: 10e3 },
      Q1:   { model: "npn", value: 0 },
      PUMP: { model: "pump", value: 0 }
    },
    supply: { pos: "+5V.1", neg: "0V.1" },
    supplyTP: "T1", ground: "T2",
    inputs: {
      SD: { states: { off: "1", on: "2" }, start: "off" },
      TK: { states: { off: "1", on: "2" }, start: "off" },
      EN: { states: { off: "1", on: "2" }, start: "off" }
    },

    faults: {
      s3: { plan: "S3", name: "R2, the pull-down on SD, has a dry joint", edits: [{ dry: "R2.1" }] }
    },
    distractors: {
      sdstuck:   { name: "SD is stuck on", edits: [{ stuck: "SD", at: "2" }] },
      q1dead:    { name: "Q1's collector has a dry joint", edits: [{ dry: "Q1.c" }] },
      wrongchip: { name: "A 74HC00 is fitted, not a 74HC08", edits: [{ chip: "IC1", to: "hc00" }] }
    },

    readings: {
      T1:     { dcv: "T1", set: KEY },
      /* SDv alone: a meter on a floating input loads it, and can stop the
         pump chattering, as on a real board. */
      SDpin:  { probe: "IC1.1", set: KEY }, SDv: { dcv: "IC1.1", set: KEY, alone: true },
      T3:     { probe: "T3", set: KEY }, T4: { probe: "T4", set: KEY },
      T5:     { dcv: "T5", set: KEY }, PUMP: { load: "PUMP", set: KEY },
      T4all:  { probe: "T4", set: S(1, 1, 1) }, T5all: { dcv: "T5", set: S(1, 1, 1) },
      PUMPall: { load: "PUMP", set: S(1, 1, 1) },
      PUMPen0: { load: "PUMP", set: S(1, 1, 0) },
      R2joint: { off: "OHM 200", red: "R2.1", black: "A5" }
    },
    expect: {
      good: {
        T1: [4.85, 5.10], SDv: [0, 0.015], T5: [0, 0.02], PUMP: "off", SDpin: "lo", T3: "lo", T4: "lo",
        T4all: "hi", T5all: [0.65, 0.88], PUMPall: "on", PUMPen0: "off", R2joint: [0.2, 1.5]
      },
      s3:        { SDv: { min: [0.5, 1.7], max: [2.3, 3.3] }, SDpin: "flicker", T4: "flashes", PUMP: "chatters", R2joint: "over" },
      sdstuck:   { SDpin: "hi", T4: "hi", PUMP: "on" },
      q1dead:    { T4all: "hi", PUMPall: "off" },
      wrongchip: { T3: "hi", PUMP: "off", PUMPen0: "on" }
    },
    keys: {
      s3: ["SDv", "SDpin", "T4", "PUMP", "R2joint"],
      sdstuck: ["SDpin", "PUMP"], q1dead: ["PUMPall"], wrongchip: ["T3", "PUMPen0"]
    },
    /* The pump chattering is the fault alone: stuck runs it steadily, the
       wrong chip and a dead Q1 leave it off. */
    distinct: [
      { cases: ["s3", "sdstuck"], reading: "PUMP" },
      { cases: ["s3", "wrongchip"], reading: "PUMP" },
      { cases: ["s3", "sdstuck"], reading: "SDpin" }
    ]
  });

})(typeof globalThis !== "undefined" ? globalThis : this);
