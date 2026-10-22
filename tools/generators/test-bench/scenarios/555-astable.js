/* ============================================================================
   Scenario board: the Block 6 555 astable practice board (BENCH-PLAN §4, S7–S8)
   ----------------------------------------------------------------------------
   5 V. R1 1 kΩ, R2 10 kΩ, C1 100 µF; LED1 red (lit when pin 3 is HIGH, through
   R3 270 Ω), LED2 green (lit when pin 3 is LOW, through R4 270 Ω from +5 V).
   T1 +5 V, T2 0 V, T3 pin 3, T4 the capacitor (pins 2 and 6).

   The layout is the build guide's stripboard (tools/build-guides/circuits.mjs),
   so the bench, the guide and the booklet show one board.

   Faults: S7 and S8 from the plan, and the four from the first Probe Detective,
   redone as layout edits (fault sheet bench-fault-boards-r1, approved 20 Oct).
   Distractors: the wrong answers' boards, so their feedback ("what you would
   have seen") is worked out by the same solver.

   `expect` holds the plan's readings as ranges a real board can give (§2.1).
   `keys` are the readings that give each fault away: tb-tests.js fails if any
   good board and any fault board could ever give the same key reading.
   ============================================================================ */
(function (root) {
  "use strict";
  const TB = root.TB;

  TB.scenario({
    id: "555-astable",
    parts: {
      IC1:  { model: "ne555", value: 555 },
      R1:   { model: "res", value: 1e3 },
      R2:   { model: "res", value: 10e3 },
      R3:   { model: "res", value: 270 },
      R4:   { model: "res", value: 270 },
      C1:   { model: "ecap", value: 100e-6 },
      LED1: { model: "led", value: 0, colour: "red" },
      LED2: { model: "led", value: 0, colour: "green" }
    },
    supply: { pos: "+5V.1", neg: "0V.1" },
    supplyTP: "T1", ground: "T2",
    /* What the bench screen says and allows (Phase 3.2, BENCH-PLAN §16). */
    bench: {
      title: "The flasher", sub: "555 astable practice board",
      should: "<b>Should:</b> LED1 and LED2 take turns, about 0.7 s each.",
      probe: "TTL", probeOnly: ["IC1.3"],
      notLogic: { "IC1.2": "T4 is not a logic signal. It rises and falls smoothly between about 1.7 V and 3.3 V. Measure it with the meter on DCV 20." }
    },

    faults: {
      s7:      { plan: "S7", name: "The pin 4 link is on the 0 V strip", edits: [{ link: "A8", to: "B8" }] },
      s8:      { plan: "S8", name: "R2 has a dry joint", edits: [{ dry: "R2.1" }] },
      led1rev: { name: "LED1 (red) is the wrong way round", edits: [{ turn: "LED1" }] },
      r4big:   { name: "R4 is 270 kΩ, not 270 Ω", edits: [{ value: "R4", to: 270e3 }] },
      r1open:  { name: "R1 has a dry joint", edits: [{ dry: "R1.1" }] },
      c1big:   { name: "C1 is 1000 µF, not 100 µF", edits: [{ value: "C1", to: 1000e-6 }], slow: 10 }
    },
    distractors: {
      nosupply: { name: "No supply reaches the board", edits: [{ dry: "+5V.1" }] },
      led2rev:  { name: "LED2 (green) is the wrong way round", edits: [{ turn: "LED2" }] },
      c1short:  { name: "C1 is shorted", edits: [{ short: "C1" }] }
    },

    /* How each reading is taken. dcv: a meter on DCV 20, black on T2.
       probe: the logic probe, clips on T1/T2. led: what the pupil sees.
       high: how long pin 3 stays HIGH each time (s), from the probe.
       off: power off, the meter on that setting, red and black where given. */
    readings: {
      T1:   { dcv: "T1" },
      T3:   { probe: "T3" },
      T4:   { dcv: "T4" },
      pin4: { dcv: "IC1.4" },
      pin7: { dcv: "IC1.7" },
      LED1: { led: "LED1" },
      LED2: { led: "LED2" },
      tHigh: { high: "T3" },
      R1joint: { off: "OHM 200", red: "R1.1", black: "A20" },
      R2joint: { off: "OHM 200", red: "R2.1", black: "G19" },
      R4ohms:  { off: "OHM 2M", red: "R4.1", black: "R4.2" },
      LED1diode: { off: "DCV D", red: "R13", black: "S13" }
    },

    /* [lo, hi]: every value seen lies inside. { min: [..], max: [..] }: the
       lowest and highest values while it runs. "over": the meter shows 1. */
    expect: {
      good: {
        T1: [4.90, 5.10], T3: "flashes", T4: { min: [1.55, 1.80], max: [3.20, 3.45] },
        pin4: [4.90, 5.10], pin7: { min: [0, 0.3], max: [4.0, 5.1] },
        LED1: "flashes", LED2: "flashes", tHigh: [0.55, 1.0],
        R1joint: [0.25, 1.5], R2joint: [0.25, 1.5], R4ohms: [240, 300], LED1diode: [1.55, 1.95]
      },
      s7: { T1: [4.90, 5.10], T3: "lo", T4: [0, 0.1], pin4: [0, 0.05], pin7: [0, 0.1], LED1: "off", LED2: "off" },
      s8: { T1: [4.90, 5.10], T3: "hi", T4: [0, 0.05], pin7: [4.85, 5.10], LED1: "on", LED2: "off", R2joint: "over" },
      led1rev: { T3: "flashes", LED1: "off", LED2: "flashes", LED1diode: "over" },
      r4big: { T3: "flashes", LED1: "flashes", LED2: "off", R4ohms: [230e3, 300e3] },
      r1open: { T3: "hi", T4: [0, 0.05], pin7: [0, 0.05], LED1: "on", LED2: "off", R1joint: "over" },
      c1big: { T3: "flashes", LED1: "flashes", LED2: "flashes", tHigh: [5.5, 10] },
      nosupply: { T1: [0, 0.05], T3: "dead", LED1: "off", LED2: "off" },
      led2rev: { T3: "flashes", LED1: "flashes", LED2: "off" },
      c1short: { T3: "hi", T4: [0, 0.05], pin7: [4.30, 4.75], LED1: "on", LED2: "off" }
    },
    keys: {
      s7: ["pin4", "T4", "LED1", "LED2", "T3"],
      s8: ["pin7", "T3", "LED2", "R2joint"],
      led1rev: ["LED1", "LED1diode"],
      r4big: ["LED2", "R4ohms"],
      r1open: ["pin7", "T3", "R1joint"],
      c1big: ["tHigh"],
      nosupply: ["T1"], led2rev: ["LED2"], c1short: ["pin7", "T3"]
    },
    /* The plan's S8 table: pin 7 tells these three apart. */
    distinct: [{ cases: ["s8", "r1open", "c1short"], reading: "pin7" }]
  });

})(typeof globalThis !== "undefined" ? globalThis : this);
