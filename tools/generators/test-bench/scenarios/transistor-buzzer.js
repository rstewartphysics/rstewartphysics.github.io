/* ============================================================================
   Scenario board: S1 · Buzzer switched by a transistor (BENCH-PLAN §4) · level 2
   ----------------------------------------------------------------------------
   5 V. SW1 slide switch -> R1 1 kΩ -> Q1 (BC548) base; BUZ1 (active piezo)
   from +5 V to the collector. T3 the base, T4 the collector.
   Layout: boards/transistor-buzzer.mjs.

   Fault S1: R1 is 1 MΩ, not 1 kΩ. The base takes microamps, so Q1 hardly
   conducts: T3 still reads about 0.6 V, but T4 stays high and the buzzer is
   silent. Distractors: the switch not making contact (T3 0 V), the buzzer
   turned round (T4 0 V, silent), Q1's collector dry (T4 = supply).

   The current reading lifts the green link's end at D20 and puts the meter
   (DCA 200m) between the buzzer's strip and the collector (§4, S9 proof).
   ============================================================================ */
(function (root) {
  "use strict";
  const TB = root.TB;
  const ON = { SW1: "on" };

  TB.scenario({
    id: "transistor-buzzer",
    parts: {
      SW1:  { model: "spdt", value: 0 },
      R1:   { model: "res", value: 1e3 },
      Q1:   { model: "npn", value: 0 },
      BUZ1: { model: "buzzer", value: 0 }
    },
    supply: { pos: "+5V.1", neg: "0V.1" },
    supplyTP: "T1", ground: "T2",
    bench: {
      title: "Buzzer alarm", sub: "Transistor switch board",
      should: "<b>Should:</b> slide SW1 on and the buzzer sounds. Slide it off and it stops.",
      probe: null, inputs: { SW1: { name: "SW1", words: { off: "Off", on: "On" } } }
    },
    inputs: { SW1: { states: { off: "1", on: "2" }, start: "off" } },

    faults: {
      s1: { plan: "S1", name: "R1 is 1 MΩ, not 1 kΩ", edits: [{ value: "R1", to: 1e6 }] }
    },
    distractors: {
      swdead: { name: "SW1 does not make contact", edits: [{ dry: "SW1.c" }] },
      buzrev: { name: "BUZ1 is the wrong way round", edits: [{ turn: "BUZ1" }] },
      q1open: { name: "Q1's collector has a dry joint", edits: [{ dry: "Q1.c" }] }
    },

    readings: {
      T1:   { dcv: "T1", set: ON },
      T3:   { dcv: "T3", set: ON },
      T4:   { dcv: "T4", set: ON },
      BUZ1: { load: "BUZ1", set: ON },
      T4off: { dcv: "T4" },
      BUZ1off: { load: "BUZ1" },
      mA:   { amps: "DCA 200m", red: "D22", black: "T4", lift: ["link@D20"], set: ON },
      R1ohm: { off: "OHM 2M", red: "R1.1", black: "R1.2", lift: ["R1.1"] }
    },
    expect: {
      good: {
        T1: [4.85, 5.10], T3: [0.65, 0.85], T4: [0.03, 0.20], BUZ1: "on",
        T4off: [4.75, 5.05], BUZ1off: "off", mA: [0.0180, 0.0300], R1ohm: [940, 1060]
      },
      s1:     { T3: [0.55, 0.75], T4: [2.6, 3.9], BUZ1: "off", mA: [0.0004, 0.0022], R1ohm: [940e3, 1060e3] },
      swdead: { T3: [0, 0.05], T4: [4.75, 5.05], BUZ1: "off" },
      buzrev: { T4: [0, 0.05], BUZ1: "off", mA: [0, 0.00005] },
      q1open: { T3: [0.60, 0.85], T4: [4.75, 5.05], BUZ1: "off" }
    },
    keys: {
      s1: ["T4", "BUZ1", "mA", "R1ohm"],
      swdead: ["T3"], buzrev: ["T4", "BUZ1"], q1open: ["T4", "BUZ1"]
    },
    /* The plan's S1 table: T3 looks normal on the fault board; T4 tells it
       from each distractor. */
    distinct: [
      { cases: ["s1", "swdead"], reading: "T3" },
      { cases: ["s1", "buzrev", "q1open"], reading: "T4" }
    ]
  });

})(typeof globalThis !== "undefined" ? globalThis : this);
