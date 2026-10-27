/* ============================================================================
   test-bench-tasks.js — the Learn to Test tasks (BENCH-PLAN §10, §18)
   ----------------------------------------------------------------------------
   Words only: the bench (test-bench.js) runs each task. Show me → Your turn,
   with feedback on every step (§10). L3 is the proof task; the other eight
   follow once it is approved.

   show: the steps the bench does itself, each with its sentence. do is one of
     { dial }, { sock }, { lead: "red" | "black", at }, { power }, { input: { k: v } }
     or nothing (a sentence only). hl names what to ring while the step shows.
     {v} in a sentence is the meter's reading at that step.
   turn: the readings the pupil takes. red / black: where the leads go (any
     point on the same net counts). predict and compare as in the jobs: every
     option has its own feedback; a feedback entry may be a function of the
     pupil's readings, v.led, v.r1 ("1.93 V").
   ============================================================================ */
(function (root) {
  "use strict";
  const T = root.TBTasks = root.TBTasks || {};

  /* the nine tasks, one per type of test (§10); soon: not built yet */
  T.order = [
    { id: "l1", test: "Visual inspection", soon: true },
    { id: "l2", test: "Short check before power", soon: true },
    { id: "l3", test: "DC voltage" },
    { id: "l4", test: "Resistance", soon: true },
    { id: "l5", test: "Continuity", soon: true },
    { id: "l6", test: "Diode check", soon: true },
    { id: "l7", test: "Current", soon: true },
    { id: "l8", test: "Logic probe", soon: true },
    { id: "l9", test: "Stage by stage", soon: true }
  ];

  const num = s => parseFloat(s);

  T.l3 = {
    id: "l3", test: "DC voltage", scenario: "slide-led",
    title: "DC voltage", sub: "Switch and LED board",
    card: "Measure voltages with the meter. First, watch the bench measure the supply at T1. " +
      "Then measure across LED1 and across R1 yourself. Predict each one first, then compare your real reading.",
    pre: "This board has been looked at and checked for shorts, so you can switch it on.",
    /* how the meter was left: after a current reading (L7) */
    meter: { dial: "DCA 20m", sock: "A" },
    seed: "l3b",
    showLine: "<b>Show me:</b> watch the bench measure the supply at T1.",
    show: [
      { hl: "meter", say: "The meter was left on <b>DCA 20m</b>, with the red lead in <b>A</b>, after a current reading. Before a voltage reading, set it up again." },
      { do: { dial: "DCV 20" }, hl: "dial", say: "<b>Turn the dial</b> to <b>DCV 20</b>. DCV is DC voltage. 20 is the range just above 5 V, so the meter shows two decimal places." },
      { do: { sock: "V/Ω" }, hl: "sock", say: "<b>Move</b> the red lead to the <b>V/Ω</b> socket. The black lead stays in COM. With the red lead in A, the meter is a short." },
      { do: { lead: "black", at: "T2" }, hl: "next tp:T2", say: "<b>Clip</b> the black lead onto <b>T2</b>, the 0 V test pin: choose <b>Black lead</b> under Next tap, then tap T2. Voltages are measured from 0 V." },
      { do: { power: true }, hl: "power", say: "<b>Switch on</b> the power. With it off, there is no voltage to measure." },
      { do: { lead: "red", at: "T1" }, hl: "tp:T1", say: "<b>Touch</b> the red lead on <b>T1</b>, the +5 V test pin. The meter reads <b>{v}</b>." },
      { hl: "meter", say: "<b>Compare.</b> The supply is set to 5 V. A real bench supply reads about 4.95 to 5.08 V, and a little less while the board takes current. <b>{v} is a normal 5 V supply.</b>" }
    ],
    turn: [
      {
        id: "led", name: "LED1", red: "LED1.a", black: "LED1.k", set: { SW1: "on" },
        ask: "<b>Measure</b> the voltage across LED1, with SW1 on.",
        hint: "Set up the meter as in Show me. Then take the reading across LED1.",
        where: "Across LED1 means one lead on each side of it. On the circuit, which test points are either side of LED1?",
        setMsg: "SW1: slide it on. With SW1 off, no current flows and LED1 is off.",
        predict: { q: "<b>Predict:</b> SW1 is on and LED1 is lit. <b>What</b> is the voltage across LED1?", opts: [
          { t: "About 2 V", key: true, fb: "<b>Right.</b> A lit red LED takes about 2 V. That is the textbook value. Your real reading will be close to it." },
          { t: "About 5 V", fb: "<b>Not quite.</b> 5 V is the whole supply. It is shared between R1 and LED1. How much does a lit red LED take?" },
          { t: "About 3 V", fb: "<b>Not quite.</b> 3 V is R1's share: 5 V − 2 V. How much does the lit LED itself take?" },
          { t: "0 V", fb: "<b>Not quite.</b> With 0 V across it, LED1 could not light. A lit LED always has a voltage across it." }
        ] },
        compare: { q: v => "<b>Compare:</b> LED1 reads <b>" + v.led + "</b>. You predicted about 2 V. <b>Is</b> LED1 working normally?", opts: [
          { t: v => "Yes: " + v.led + " is close to 2 V", key: true, fb: v => "<b>Right.</b> Real red LEDs read about 1.8 to 2.1 V when lit, so " + v.led + " is normal. Knowing what is close enough is part of testing." },
          { t: () => "No: a working LED reads exactly 2.00 V", fb: "<b>Not quite.</b> 2 V is the textbook value. Real LEDs differ a little, and the meter shows hundredths of a volt, so you will almost never see exactly 2.00 V." },
          { t: () => "No: it should read 5 V, like the supply", fb: "<b>Not quite.</b> 5 V across an LED means no current flows: it is the wrong way round or not joined. A lit LED takes about 2 V." },
          { t: v => "No: " + v.led + " is too far from 2 V", fb: v => "<b>Not quite.</b> " + v.led + " is within the normal range for a red LED, about 1.8 to 2.1 V. A fault shows a big difference, like 0 V or 5 V." }
        ] }
      },
      {
        id: "r1", name: "R1", red: "R1.1", black: "R1.2", set: { SW1: "on" },
        ask: "<b>Measure</b> the voltage across R1, with SW1 on.",
        hint: "Put one lead on each side of R1, with the red lead on the side nearer +5 V. To move the black lead, choose <b>Black lead</b> under Next tap.",
        where: "Across R1 means one lead on each side of it. On the circuit, which test points are either side of R1?",
        setMsg: "SW1: slide it on. With SW1 off, no current flows through R1.",
        predict: { q: v => "<b>Predict:</b> LED1 reads " + v.led + ". The supply is about 5 V. <b>What</b> is the voltage across R1?", opts: [
          { t: "About 3 V", key: true, fb: "<b>Right.</b> The supply is shared between R1 and LED1: 5 V − 2 V = 3 V across R1. Your real reading will be close to 3 V." },
          { t: "About 5 V", fb: "<b>Not quite.</b> 5 V is the whole supply, shared between R1 and LED1. Take LED1's share away." },
          { t: "About 2 V", fb: "<b>Not quite.</b> About 2 V is LED1's share. R1 takes what is left of the supply." },
          { t: "0 V", fb: "<b>Not quite.</b> Current flows through R1, so there is a voltage across it. R1 takes what is left of the supply." }
        ] },
        compare: { q: v => "<b>Compare:</b> R1 reads <b>" + v.r1 + "</b>. You predicted about 3 V. <b>Is</b> R1's voltage normal?", opts: [
          { t: v => "Yes: " + v.r1 + " is close to 3 V", key: true, fb: v => "<b>Right.</b> The supply and the LED are real parts, so R1's share moves a little too: about 2.8 to 3.2 V is normal. " + v.led + " + " + v.r1 + " = " + sum(v) + ", the supply." },
          { t: () => "No: 5 V − 2 V is exactly 3.00 V", fb: "<b>Not quite.</b> 3 V comes from textbook values. Your supply and your LED are real parts, so R1's share is close to 3 V, not exactly 3.00 V." },
          { t: () => "No: LED1 and R1 should add up to exactly 5.00 V", fb: v => "<b>Not quite.</b> They add up to the real supply, not to 5.00 V: " + v.led + " + " + v.r1 + " = " + sum(v) + ". A real supply is about 4.9 to 5.1 V." },
          { t: () => "No: R1 should take the whole 5 V", fb: "<b>Not quite.</b> R1 takes the whole supply only if LED1 is shorted, and then LED1 is off. A lit LED takes about 2 V; R1 takes the rest." }
        ] }
      }
    ]
  };

  function sum(v) { return (num(v.led) + num(v.r1)).toFixed(2) + " V"; }

})(typeof globalThis !== "undefined" ? globalThis : this);
