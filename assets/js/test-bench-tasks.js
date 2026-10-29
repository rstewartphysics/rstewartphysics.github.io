/* ============================================================================
   test-bench-tasks.js — the Learn to Test tasks (BENCH-PLAN §10, §18, §18a)
   ----------------------------------------------------------------------------
   Words only: the bench (test-bench.js) runs each task. Show me, then Your
   turn, with feedback on every step (§10). L3 was the proof task (T14).

   A task: scenario (showScenario if Show me uses another board), seed (Show
   me's fixed board, T7), start (how the meter and probe were left; prechecked:
   false when the board has not been checked for shorts), show, turn.

   show: the steps the bench does itself, each with its sentence. do is one op
     or a list: { dial }, { sock }, { lead: "red" | "black", at }, { power },
     { input: { k: v } }, { tool }, { pmode }, { pmem }, { tip }, { lift },
     { flip }, { look }. hl names what to ring while the step shows. {v} in a
     sentence is what the meter or probe shows at that step.
   turn: items. Each: questions before (predict), readings, questions after
     (compare, another board: T11). A reading: kind (dcv, ohm, cont, diode,
     amps, probe, power), red / black or tip (any point on the same net
     counts; { under: k } is the strip under a lifted end), set (switches),
     lift / unlift, dial (the ranges allowed). An item's settings are its
     readings' unless a reading has its own. kind "look" (L1) is a checklist.
     Every option has its own feedback; text may be a function of the pupil's
     readings, v.<reading id> ("1.93 V").
   ============================================================================ */
(function (root) {
  "use strict";
  const T = root.TBTasks = root.TBTasks || {};

  /* the nine tasks, one per type of test (§10); soon: not built yet */
  T.order = [
    { id: "l1", test: "Visual inspection" },
    { id: "l2", test: "Short check before power" },
    { id: "l3", test: "DC voltage" },
    { id: "l4", test: "Resistance" },
    { id: "l5", test: "Continuity" },
    { id: "l6", test: "Diode check" },
    { id: "l7", test: "Current" },
    { id: "l8", test: "Logic probe" },
    { id: "l9", test: "Stage by stage" }
  ];

  const num = s => parseFloat(s);

  T.l3 = {
    id: "l3", test: "DC voltage", scenario: "slide-led",
    title: "DC voltage", sub: "Switch and LED board",
    card: "Measure voltages with the meter. First, watch the bench measure the supply at T1. " +
      "Then measure across LED1 and across R1 yourself. Predict each one first, then compare your real reading, and one from a board with a fault.",
    pre: "This board has been looked at and checked for shorts, so you can switch it on.",
    /* how the meter was left: after a current reading (L7) */
    start: { dial: "DCA 20m", sock: "A" },
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
        ] },
        /* T11: a reading from a board with a fault (S9, LED1 reversed) */
        fault: { q: "<b>Another board:</b> SW1 is on, but LED1 is off. LED1 reads <b>4.98 V</b>. <b>Is</b> that normal?", opts: [
          { t: "No: LED1 takes the whole supply, so no current flows", key: true, fb: "<b>Right.</b> A lit LED takes about 2 V. 4.98 V means LED1 takes the whole supply and no current flows. LED1 is the wrong way round, or not joined." },
          { t: "Yes: 4.98 V is close to 5 V", fb: "<b>Not quite.</b> Close to 5 V is normal for the supply, not for an LED. A lit red LED reads about 1.8 to 2.1 V." },
          { t: "Yes: LED1 has the full supply, so it is fine", fb: "<b>Not quite.</b> LED1 is off. The whole supply across it, with no light, means no current flows through it." },
          { t: "No: it should read exactly 2.00 V", fb: v => "<b>Not quite.</b> Your own LED1 read " + v.led + ", so a working LED is not exactly 2.00 V. The fault is the big difference: 4.98 V, not about 2 V." }
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
          { t: () => "No: LED1 and R1 should add up to exactly 5.00 V", fb: v => "<b>Not quite.</b> They add up to the real supply, not to 5.00 V: " + v.led + " + " + v.r1 + " = " + sum(v) + ". A real supply is about 4.95 to 5.08 V, and a little less while the board takes current." },
          { t: () => "No: R1 should take the whole 5 V", fb: "<b>Not quite.</b> R1 takes the whole supply only if LED1 is shorted, and then LED1 is off. A lit LED takes about 2 V; R1 takes the rest." }
        ] },
        /* T11: a reading from a board with a fault (no current: LED1 reversed) */
        fault: { q: "<b>Another board:</b> SW1 is on, but LED1 is off. R1 reads <b>0.00 V</b>. <b>Is</b> that normal?", opts: [
          { t: "No: no current flows through R1", key: true, fb: "<b>Right.</b> With current through it, R1 takes about 3 V. 0.00 V means no current flows: the circuit is broken somewhere, for example LED1 the wrong way round." },
          { t: "Yes: a resistor does not use up voltage", fb: v => "<b>Not quite.</b> Current through a resistor always gives a voltage across it. On your board, R1 read " + v.r1 + "." },
          { t: "No: R1 must be shorted", fb: "<b>Not quite.</b> A shorted R1 would also read about 0 V, but then LED1 would be lit. LED1 is off, so no current flows at all." },
          { t: "No: R1 should read 5 V", fb: v => "<b>Not quite.</b> R1 takes the whole 5 V only when LED1 is shorted. On a working board R1 takes about 3 V: yours read " + v.r1 + "." }
        ] }
      }
    ]
  };

  /* ---------------------------------------------------------------- L1 */
  T.l1 = {
    id: "l1", test: "Visual inspection", scenario: "555-astable",
    title: "Visual inspection", sub: "555 flasher board",
    card: "Check a board by eye before any test. Look at each part and compare it with the parts list and the circuit. " +
      "First, watch the bench check R1 and one joint. Then check the rest yourself.",
    pre: "The power is off. Nothing on this board has been checked yet.",
    start: { prechecked: false },
    seed: "l1s",
    showLine: "<b>Show me:</b> watch the bench check R1 and one solder joint.",
    show: [
      { do: { tool: "look" }, hl: "tool:look", say: "<b>Choose Look.</b> Visual inspection comes first, before any meter test, with the power off." },
      { do: { look: { part: "R1" } }, say: "<b>Tap</b> R1. Its bands are brown, black, red, gold: 1 kΩ. The parts list says R1 is 1 kΩ, so <b>it matches</b>." },
      { do: { flip: true }, hl: "q:[data-act=flip]", say: "<b>Flip the board</b> to see the copper side: the tracks, the track cuts and the solder joints." },
      { do: { look: { pt: "R1.1" } }, say: "<b>Tap</b> a joint. Bright and smooth, with the solder flowed onto the track and round the leg: <b>a good joint</b>." },
      { do: { flip: true }, hl: "q:[data-act=flip]", say: "<b>Flip it back.</b> In your turn, tap <b>Matches</b> or <b>Report a problem</b> after each look." }
    ],
    turn: [{
      id: "look", name: "Check the board", kind: "look", boardView: true,
      ask: "<b>Check</b> each part against the parts list. Then flip the board: check the track cuts and three joints.",
      hint: "Choose <b>Look</b> and tap a part. Then tap <b>Matches</b> or <b>Report a problem</b>.",
      panel: `<div class="tbx-ph">Parts list</div><ul class="tbx-plist">
        <li><b>R1</b> 1 kΩ: brown, black, red</li><li><b>R2</b> 10 kΩ: brown, black, orange</li>
        <li><b>R3, R4</b> 270 Ω: red, violet, brown</li><li><b>C1</b> 100 µF; stripe (−) on the 0 V side</li>
        <li><b>LED1</b> red; flat side (cathode) towards 0 V</li><li><b>LED2</b> green; flat side (cathode) towards pin 3</li>
        <li><b>IC1</b> NE555; notch at the top, pin 1 top left</li><li><b>Copper</b> cuts under IC1; bright, smooth joints</li></ul>`,
      checks: [
        { id: "r2", name: "R2", keys: ["R2"], ok: "R2 is brown, black, orange: 10 kΩ. It matches." },
        { id: "r3", name: "R3", keys: ["R3"], ok: "R3 is red, violet, brown: 270 Ω. It matches." },
        { id: "r4", name: "R4", keys: ["R4"], ok: "R4 is red, violet, brown: 270 Ω. It matches." },
        { id: "c1", name: "C1", keys: ["C1"], ok: "C1 is printed 100 µF, and its stripe (−) is on the 0 V strip. It matches." },
        { id: "led1", name: "LED1", keys: ["LED1"], ok: "LED1's flat side (cathode) is on the strip that goes to 0 V, as on the circuit. It matches." },
        { id: "led2", name: "LED2", keys: ["LED2"], ok: "LED2's flat side (cathode) is on the strip that goes to pin 3, as on the circuit. It matches." },
        { id: "ic1", name: "IC1", keys: ["IC1"], ok: "IC1 is printed NE555. The notch is at the top, so pin 1 is top left. It matches." },
        { id: "cut", name: "Track cuts", cut: true, ok: "The cuts under IC1 split the strips, so the chip's two rows of pins are not joined. They are right." },
        { id: "joints", name: "3 joints", joints: 3, ok: "Bright and smooth: a good joint." }
      ]
    }]
  };

  /* ---------------------------------------------------------------- L2 */
  T.l2 = {
    id: "l2", test: "Short check before power", scenario: "lift-interlock",
    title: "Short check before power", sub: "Lift interlock board",
    card: "Before you switch on, check for shorts with the power off: +5 V to 0 V first, then neighbouring tracks, where solder could bridge them. " +
      "First, watch the bench check +5 V to 0 V.",
    pre: "This board has been looked at. It has not been checked for shorts yet, so the power stays off.",
    start: { prechecked: false, looked: true },
    seed: "l2s",
    powerMsg: "Finish the short checks before you switch on. Switch off, then carry on.",
    showLine: "<b>Show me:</b> watch the bench check +5 V to 0 V for a short.",
    show: [
      { hl: "power", say: "<b>The power is off.</b> A short check is done before the board is ever switched on. The meter makes its own small current." },
      { do: { dial: "OHM 200" }, hl: "dial", say: "<b>Turn the dial</b> to <b>OHM 200</b>, the continuity setting (the beep symbol). It beeps when two points are joined." },
      { do: { lead: "red", at: "T1" }, hl: "tp:T1", say: "<b>Touch</b> the red lead on <b>T1</b>, the +5 V test pin." },
      { do: { lead: "black", at: "T2" }, hl: "tp:T2", say: "<b>Touch</b> the black lead on <b>T2</b>, the 0 V test pin." },
      { hl: "meter", say: "The meter shows <b>{v}</b> and does not beep. <b>1 on the left, no beep: not joined.</b> There is no short across the supply." }
    ],
    turn: [
      {
        id: "rails", name: "+5 V to 0 V", kind: "cont", red: "T1", black: "T2",
        ask: "<b>Check</b> +5 V to 0 V for a short, as in Show me.",
        hint: "Power off. Set up the meter for continuity, then put the leads on T1 and T2.",
        where: "This is not +5 V to 0 V. Use T1 and T2.",
        predict: { q: "<b>Predict:</b> on a good board, <b>what</b> does continuity from +5 V to 0 V show?", opts: [
          { t: "1, no beep", key: true, fb: "<b>Right.</b> Nothing joins +5 V straight to 0 V, so the meter shows 1 and stays silent." },
          { t: "A beep", fb: "<b>Not quite.</b> A beep means joined. +5 V joined straight to 0 V would be a short across the supply." },
          { t: "About 5 V", fb: "<b>Not quite.</b> With the power off there is no voltage. Continuity shows joined (a beep) or not joined (1)." },
          { t: "0 Ω", fb: "<b>Not quite.</b> 0 Ω would mean +5 V is joined to 0 V: a short. A good board shows 1." }
        ] },
        fault: { q: "<b>Another board:</b> T1 to T2 beeps and reads 0.6 Ω. <b>What</b> do you do?", opts: [
          { t: "Do not switch on: find the short first", key: true, fb: "<b>Right.</b> A beep from +5 V to 0 V is a short across the supply. Switching on could damage the supply and the board." },
          { t: "Switch on and see if it works", fb: "<b>Not quite.</b> A short across the supply can damage the supply and the board. Find the short first." },
          { t: "Turn to OHM 2k and measure again", fb: "<b>Not quite.</b> 0.6 Ω is a short on any range. Find it first: look for a solder bridge." },
          { t: "Nothing: 0.6 Ω is very small", fb: "<b>Not quite.</b> Small is the problem. 0.6 Ω between +5 V and 0 V means they are joined." }
        ] }
      },
      {
        id: "pins", name: "Neighbouring tracks", kind: "cont",
        reads: [
          { id: "p12", name: "Pins 1 and 2", red: "IC1.1", black: "IC1.2" },
          { id: "p23", name: "Pins 2 and 3", red: "IC1.2", black: "IC1.3" }
        ],
        ask: "<b>Check</b> the neighbouring tracks at the chip: IC1 pin 1 to pin 2, then pin 2 to pin 3.",
        hint: "Power off, meter on continuity. Tap IC1's pins on the board.",
        where: "Check IC1 pin 1 to pin 2, then pin 2 to pin 3.",
        compare: { q: v => "<b>Pins 1 and 2:</b> " + v.p12 + ". <b>Pins 2 and 3:</b> " + v.p23 + ". <b>What</b> does this tell you?", opts: [
          { t: "No solder bridges: the tracks are not joined", key: true, fb: "<b>Right.</b> 1 and no beep means not joined. Neighbouring tracks are where solder most often bridges two strips." },
          { t: "The chip is missing", fb: "<b>Not quite.</b> Continuity checks the copper and joints, not the chip. 1 means these two tracks are not joined." },
          { t: "The tracks are broken", fb: "<b>Not quite.</b> These are two different tracks, so they should not be joined. 1 is the right result." },
          { t: "There is a short", fb: "<b>Not quite.</b> A short would beep. 1 and no beep means not joined." }
        ] },
        fault: { q: "<b>Another board:</b> with B and C off, pin 1 to pin 2 beeps. <b>What</b> does that mean?", opts: [
          { t: "A solder bridge joins the B and C tracks", key: true, fb: "<b>Right.</b> Pins 1 and 2 are B and C's inputs, on neighbouring tracks. Joined, B and C act as one switch, so the lift could run while overloaded." },
          { t: "The tracks are fine", fb: "<b>Not quite.</b> A beep means joined. Pins 1 and 2 are two different inputs, so they should not be." },
          { t: "IC1 is the wrong chip", fb: "<b>Not quite.</b> The wrong chip would not join two tracks. A beep between neighbouring tracks points to a solder bridge." },
          { t: "The power is on", fb: "<b>Not quite.</b> A continuity check is always done with the power off. The beep means the tracks are joined." }
        ] }
      },
      {
        id: "on", name: "Switch on", reads: [{ id: "on", name: "Power on", kind: "power" }],
        ask: "<b>Turn the dial off OHM</b> (to DCV 20), then <b>switch on</b>.",
        hint: "Every short check is done. Turn the dial to DCV 20 first: a meter on OHM must never be on a live circuit. Then switch on."
      }
    ]
  };

  /* ---------------------------------------------------------------- L4 */
  const LDR_WHY = "Across the LDR means one lead on each side of it: T3 (Q1's base) and 0 V (T2), or the LDR's own legs.";
  T.l4 = {
    id: "l4", test: "Resistance", scenario: "dark-light",
    title: "Resistance", sub: "Dark-activated light board",
    card: "Measure resistance with the power off. First, watch the bench measure R1 on the board. " +
      "Then lift R1's leg and measure it again, and measure the LDR with the lamp on it and with its black cap on.",
    pre: "This board has been looked at and checked for shorts. The power is off.",
    seed: "l4s",
    showLine: "<b>Show me:</b> watch the bench measure R1 in the circuit.",
    show: [
      { hl: "power", say: "<b>The power is off.</b> Resistance is measured with the power off: the meter makes its own small current." },
      { do: { dial: "OHM 20k" }, hl: "dial", say: "<b>Turn the dial</b> to <b>OHM 20k</b>. R1 is 10 kΩ (brown, black, orange), and 20k is the range just above it." },
      { do: { lead: "red", at: "R1.1" }, say: "<b>Touch</b> the red lead on R1's top leg." },
      { do: { lead: "black", at: "R1.2" }, hl: "meter", say: "<b>Touch</b> the black lead on R1's bottom leg. The meter reads <b>{v}</b>." },
      { hl: "meter", say: "<b>Compare.</b> R1 is 10 kΩ ±5 %: anything from 9.50 to 10.50 kΩ is normal. <b>{v} is a good 10 kΩ resistor.</b>" }
    ],
    turn: [
      {
        id: "r1in", name: "R1", kind: "ohm", red: "R1.1", black: "R1.2", dial: "OHM 20k",
        dialMsg: "Dial: use <b>OHM 20k</b>, the range just above 10 kΩ.",
        ask: "<b>Measure</b> R1 in the circuit, as in Show me.",
        hint: "Power off. Set up the meter, then put the leads on R1's two legs.",
        where: "Put the leads on R1's two legs.",
        compare: { q: v => "<b>Compare:</b> R1 reads <b>" + v.r1in + "</b>. It is 10 kΩ ±5 %. <b>Is</b> it a good resistor?", opts: [
          { t: "Yes: it is between 9.50 and 10.50 kΩ", key: true, fb: v => "<b>Right.</b> ±5 % of 10 kΩ is 0.5 kΩ, so 9.50 to 10.50 kΩ is normal. " + v.r1in + " is a good 10 kΩ resistor." },
          { t: "No: it should be exactly 10.00 kΩ", fb: "<b>Not quite.</b> Real resistors are made to a tolerance. The gold band means ±5 %, so 9.50 to 10.50 kΩ is normal." },
          { t: "No: a 10 kΩ resistor reads 10 000 on the meter", fb: "<b>Not quite.</b> On OHM 20k the reading is in kΩ, so about 10 means about 10 kΩ." },
          { t: "Can't tell with the power off", fb: "<b>Not quite.</b> Resistance must be measured with the power off. The meter makes its own small current." }
        ] },
        fault: { q: "<b>Another board:</b> R1 reads <b>1</b> on OHM 20k, and 1 on every range. <b>Is</b> that normal?", opts: [
          { t: "No: R1 is open, or one of its joints is dry", key: true, fb: "<b>Right.</b> 1 on every range means no current gets through: the resistor is broken, or a joint is not making contact." },
          { t: "Yes: 1 means 1 kΩ", fb: "<b>Not quite.</b> A 1 on its own on the left means over range: too high to show." },
          { t: "Yes: the range is too low", fb: "<b>Not quite.</b> A higher range would show the value. 1 on every range means no current gets through at all." },
          { t: "No: R1 is shorted", fb: "<b>Not quite.</b> A shorted R1 would read about 0 Ω. 1 means the opposite: no path." }
        ] }
      },
      {
        id: "r1lift", name: "R1 lifted", kind: "ohm", red: "R1.1", black: "R1.2", dial: "OHM 20k", lift: "R1",
        dialMsg: "Dial: use <b>OHM 20k</b>, the range just above 10 kΩ.",
        liftMsg: "Lift one of R1's legs first: power off, choose <b>Lift</b>, tap the end of the leg.",
        ask: "<b>Lift</b> one of R1's legs, then <b>measure</b> R1 again.",
        hint: "Choose <b>Lift</b> and tap the end of one of R1's legs. Then choose <b>Meter</b> and put the leads on R1's two legs.",
        where: "Put the leads on R1's two legs, one of them the lifted one.",
        predict: { q: v => "<b>Predict:</b> in the circuit R1 read " + v.r1in + ". With one leg lifted, <b>what</b> will it read?", opts: [
          { t: "About the same", key: true, fb: "<b>Right.</b> Check it, then see why." },
          { t: "Lower", fb: "<b>Not quite.</b> A reading goes lower in a circuit when another part gives the meter's current a second path. Lifting a leg removes that path, so the lifted reading is never lower. Think again." },
          { t: "1, over range", fb: "<b>Not quite.</b> Lifting a leg takes R1 out of the circuit, but the leads are still on R1. You still measure R1." },
          { t: "0 Ω", fb: "<b>Not quite.</b> 0 Ω would be a short. Lifting a leg leaves R1 itself unchanged." }
        ] },
        compare: { label: "Why?", q: v => "<b>Why?</b> R1 read " + v.r1in + " in the circuit and " + v.r1lift + " lifted. <b>Why</b> are they the same?", opts: [
          { t: "With the power off, nothing else gives the meter's current a path around R1", key: true, fb: "<b>Right.</b> The LED and Q1 block the meter's small current, so it all flows through R1. When another part is joined across a resistor, the reading in circuit is lower. Lift a leg to be sure." },
          { t: "Lifting a leg never changes a reading", fb: "<b>Not quite.</b> It changes when other parts are joined across the part. They give the meter's current another path. You will see this with the LDR." },
          { t: "The meter is not sensitive enough to see a change", fb: "<b>Not quite.</b> The meter shows three or four digits. The two readings agree because only R1 carries the meter's current." },
          { t: "R1 is broken", fb: "<b>Not quite.</b> A broken R1 would read 1. These readings are a good 10 kΩ." }
        ] }
      },
      {
        id: "ldrlight", name: "LDR, lamp", kind: "ohm", red: "LDR.1", black: "LDR.2", set: { LDR: "light" }, dial: "OHM 2k", unlift: "R1",
        dialMsg: "Dial: use <b>OHM 2k</b>, the lowest range that shows the LDR in the light.",
        unliftMsg: "Solder R1's leg back first: power off, choose <b>Lift</b>, tap the lifted end.",
        setMsg: "LDR: put the lamp on it for this reading.",
        ask: "<b>Measure</b> the LDR with the lamp shining on it.",
        hint: "Solder R1 back first. Then put the leads either side of the LDR. Try ranges until you find the lowest that shows a value.",
        where: LDR_WHY,
        predict: { q: "<b>Predict:</b> the lamp shines on the LDR. <b>Is</b> its resistance high or low?", opts: [
          { t: "Low: hundreds of ohms", key: true, fb: "<b>Right.</b> Light lowers an LDR's resistance. Under the lamp it is a few hundred ohms." },
          { t: "High: about a megohm", fb: "<b>Not quite.</b> That is the LDR in the dark. Light lowers its resistance." },
          { t: "10 kΩ, the same as R1", fb: "<b>Not quite.</b> An LDR has no fixed value. Its resistance falls as the light gets brighter." },
          { t: "0 Ω: light makes it a short", fb: "<b>Not quite.</b> Light lowers its resistance a lot, but not to 0 Ω. It is a few hundred ohms." }
        ] }
      },
      {
        id: "ldrdark", name: "LDR, cap", kind: "ohm", red: "LDR.1", black: "LDR.2", polar: true, set: { LDR: "covered" }, dial: "OHM 2M",
        dialMsg: "Dial: use <b>OHM 2M</b>, the lowest range that shows the LDR in the dark.",
        revMsg: "Leads: for this reading, the red lead goes on T3 (Q1's base side) and the black on 0 V. Tap <b>Swap</b>.",
        setMsg: "LDR: put the black cap on it for this reading.",
        ask: "<b>Measure</b> the LDR with its black cap on: red lead on T3 (the base side), black on 0 V (T2).",
        hint: "Put the cap on the LDR. Red lead on T3, black on T2.",
        where: LDR_WHY,
        predict: { q: "<b>Predict:</b> with the cap on, the LDR is in the dark. <b>Is</b> its resistance high or low now?", opts: [
          { t: "High: hundreds of kilohms or more", key: true, fb: "<b>Right.</b> In the dark an LDR's resistance is high: hundreds of kilohms or more." },
          { t: "Low: hundreds of ohms", fb: "<b>Not quite.</b> That was under the lamp. In the dark it goes up a long way." },
          { t: "The same as with the lamp", fb: "<b>Not quite.</b> That is what makes it an LDR: its resistance changes with light." },
          { t: "0 Ω", fb: "<b>Not quite.</b> Dark makes its resistance go up, not down." }
        ] },
        fault: { q: "<b>Another board:</b> the LDR reads 4.7 kΩ with the lamp and 4.7 kΩ with the cap. <b>Is</b> that normal?", opts: [
          { t: "No: its resistance should change a lot with light", key: true, fb: "<b>Right.</b> The same reading both ways means it does not respond to light. It may not be an LDR at all: for example, a 4.7 kΩ resistor fitted in its place." },
          { t: "Yes: 4.7 kΩ is a normal value", fb: "<b>Not quite.</b> An LDR has no fixed value. With the lamp it is low; with the cap it is high." },
          { t: "Yes: the cap lets light in", fb: "<b>Not quite.</b> The black cap keeps the light out. A real LDR goes up a long way under it." },
          { t: "No: the range is wrong", fb: "<b>Not quite.</b> 4.7 kΩ shows on several ranges. The problem is that it does not change." }
        ] }
      },
      {
        id: "ldrlift", name: "LDR lifted", kind: "ohm", red: "LDR.1", black: "LDR.2", set: { LDR: "covered" }, dial: "OHM 2M", lift: "LDR",
        dialMsg: "Dial: use <b>OHM 2M</b>, the lowest range that shows the LDR in the dark.",
        liftMsg: "Lift one of the LDR's legs first: power off, choose <b>Lift</b>, tap the end of the leg.",
        setMsg: "LDR: keep the black cap on for this reading.",
        ask: "<b>Lift</b> one of the LDR's legs, then <b>measure</b> it again with the cap on.",
        hint: "Choose <b>Lift</b> and tap the end of one of the LDR's legs. Then put the leads on the LDR's two legs.",
        where: "Put the leads on the LDR's two legs, one of them the lifted one.",
        compare: { label: "Why?", q: v => "<b>Why?</b> With the cap on, the LDR read " + v.ldrdark + " in the circuit and " + v.ldrlift + " lifted. <b>Why</b> was it lower in the circuit?", opts: [
          { t: "Q1's base–emitter junction is across the LDR and takes some of the meter's current", key: true, fb: "<b>Right.</b> In the circuit, some of the meter's current goes through Q1's base–emitter instead of the LDR, so the meter sees less resistance. Lift a leg to measure the LDR on its own." },
          { t: "The cap let some light in", fb: "<b>Not quite.</b> The cap was on for both readings. What else is joined between T3 and 0 V?" },
          { t: "R1 is in series with the LDR", fb: "<b>Not quite.</b> R1 goes to +5 V, which the leads are not touching. Look at what else joins T3 to 0 V." },
          { t: "The LDR warmed up", fb: "<b>Not quite.</b> The difference comes from the circuit, not the LDR. Look at what else joins T3 to 0 V." }
        ] }
      }
    ]
  };

  /* ---------------------------------------------------------------- L5 */
  T.l5 = {
    id: "l5", test: "Continuity", scenario: "red-green",
    title: "Continuity", sub: "Red or green board",
    card: "Continuity checks show which points are joined: the meter beeps when they are. First, watch the bench check SW1 slid to Red. " +
      "Then check SW1 slid to Green, and check one track end to end.",
    pre: "This board has been looked at and checked for shorts. The power is off.",
    seed: "l5s",
    showLine: "<b>Show me:</b> watch the bench check SW1 slid to Red.",
    show: [
      { hl: "power", say: "Continuity: are two points joined? <b>The power is off.</b> The meter makes its own small current and beeps when they are." },
      { do: { dial: "OHM 200" }, hl: "dial", say: "<b>Turn the dial</b> to <b>OHM 200</b>, the setting with the beep." },
      { do: { lead: "red", at: "SW1.c" }, say: "<b>Touch</b> the red lead on SW1's middle pin. SW1 is slid to Red." },
      { do: { lead: "black", at: "SW1.1" }, hl: "meter", say: "<b>Touch</b> the black lead on pin 1. The meter shows <b>{v}</b>: <b>joined</b>." },
      { do: { lead: "black", at: "SW1.2" }, hl: "meter", say: "<b>Move</b> the black lead to pin 2. The meter shows <b>{v}</b>, no beep: <b>not joined</b>. Slid to Red, the middle pin joins pin 1 only." }
    ],
    turn: [
      {
        id: "green", name: "SW1 to Green", kind: "cont", set: { SW1: "green" },
        setMsg: "SW1: slide it to Green for these readings.",
        reads: [
          { id: "g1", name: "Middle to pin 1", red: "SW1.c", black: "SW1.1" },
          { id: "g2", name: "Middle to pin 2", red: "SW1.c", black: "SW1.2" }
        ],
        ask: "<b>Slide</b> SW1 to Green. <b>Check</b> the middle pin to pin 1, then to pin 2.",
        hint: "Power off, meter on continuity. Slide SW1 to Green first. To touch one of SW1's pins, tap a hole on its strip.",
        where: "Check SW1's middle pin to pin 1, then to pin 2. A tap on SW1 slides it, so tap a hole on each pin's strip, next to SW1.",
        predict: { q: "<b>Predict:</b> slid to Green, <b>which</b> pin is the middle pin joined to?", opts: [
          { t: "Pin 2", key: true, fb: "<b>Right.</b> A slide switch joins the middle pin to the pin the slider is next to. Slid to Green, that is pin 2." },
          { t: "Pin 1", fb: "<b>Not quite.</b> Pin 1 was joined when SW1 was slid to Red. Slide it the other way and the middle pin moves across." },
          { t: "Both pins", fb: "<b>Not quite.</b> Then both LEDs would light. The middle pin joins one side at a time." },
          { t: "Neither pin", fb: "<b>Not quite.</b> Then neither LED could light. The middle pin always joins one side." }
        ] },
        compare: { q: v => "<b>Middle to pin 1:</b> " + v.g1 + ". <b>Middle to pin 2:</b> " + v.g2 + ". <b>Is</b> SW1 working?", opts: [
          { t: "Yes: it joins the middle pin to pin 2 only", key: true, fb: "<b>Right.</b> One beep, on the side it is slid to. With the Red readings in Show me, SW1 switches both ways." },
          { t: "No: it should beep both ways", fb: "<b>Not quite.</b> A beep both ways would join both sides at once, so both LEDs would light." },
          { t: "No: the small reading means a bad joint", fb: "<b>Not quite.</b> A few tenths of an ohm is normal: that is the leads and joints. A beep means joined." },
          { t: "Can't tell without the power on", fb: "<b>Not quite.</b> Continuity is always checked with the power off. The beeps tell you which pins are joined." }
        ] },
        fault: { q: "<b>Another board:</b> slid to Green, middle pin to pin 2 shows 1, no beep. <b>Is</b> that normal?", opts: [
          { t: "No: the switch is not making contact inside", key: true, fb: "<b>Right.</b> Slid to Green, the middle pin should join pin 2. No beep means the contact inside the switch is broken, so LED2 can never light." },
          { t: "Yes: 1 means joined", fb: "<b>Not quite.</b> On continuity, 1 means not joined. Joined shows a small reading and a beep." },
          { t: "Yes: the power is off", fb: "<b>Not quite.</b> Continuity is meant to be done with the power off. The middle pin should still beep to pin 2." },
          { t: "No: LED2 is the wrong way round", fb: "<b>Not quite.</b> The LED is not between these two pins. The switch itself is not joining them." }
        ] }
      },
      {
        id: "track", name: "A track end to end", kind: "cont", red: "+5V.1", black: "T1",
        ask: "<b>Check</b> the +5 V track end to end: from the +5 V terminal to T1.",
        hint: "Put one lead on the +5 V terminal and the other on T1.",
        where: "Put one lead on the +5 V terminal and the other on T1.",
        compare: { q: v => "<b>Terminal to T1:</b> " + v.track + ". <b>What</b> does it tell you?", opts: [
          { t: "The track is joined all the way, terminal to T1", key: true, fb: "<b>Right.</b> A small reading and a beep: the copper and the joints carry current all the way along." },
          { t: "There is a short", fb: "<b>Not quite.</b> A short is two points joined that should not be. These two should be joined." },
          { t: "The track is broken", fb: "<b>Not quite.</b> A broken track would show 1, no beep. This one beeps." },
          { t: "The supply is on", fb: "<b>Not quite.</b> The power is off. The beep comes from the meter's own small current." }
        ] },
        fault: { q: "<b>Another board:</b> +5 V terminal to T1 shows 1, no beep. <b>Is</b> that normal?", opts: [
          { t: "No: the track is broken somewhere along it", key: true, fb: "<b>Right.</b> The terminal and T1 are on one track, so they should beep. Look for a crack, a wrong cut or a dry joint between them." },
          { t: "Yes: 1 means joined", fb: "<b>Not quite.</b> On continuity, 1 means not joined." },
          { t: "Yes: a track is not a part", fb: "<b>Not quite.</b> A track joins points together. These two should beep." },
          { t: "No: there is a short to 0 V", fb: "<b>Not quite.</b> A short would make something beep that should not. This is the opposite: no beep where there should be." }
        ] }
      }
    ]
  };

  /* ---------------------------------------------------------------- L6 */
  const BC548 = `<figure class="tbx-fig"><svg viewBox="0 0 330 165" role="img" aria-label="BC548 in a metal can, seen from above as on the board: the tab is next to the emitter; collector top left, base right, emitter bottom left.">
      <circle cx="160" cy="78" r="52" fill="var(--card)" stroke="var(--text)" stroke-width="3"/>
      <path d="M115 103 L101 115 L110 127 L127 115 Z" fill="var(--text)"/>
      <circle cx="137" cy="48" r="7" fill="var(--text)"/><circle cx="190" cy="78" r="7" fill="var(--text)"/><circle cx="137" cy="108" r="7" fill="var(--text)"/>
      <text x="124" y="30" font-size="17" font-weight="800" fill="var(--text)" text-anchor="end">c collector</text>
      <text x="222" y="84" font-size="17" font-weight="800" fill="var(--text)">b base</text>
      <text x="8" y="156" font-size="17" font-weight="800" fill="var(--text)">e emitter (next to the tab)</text>
    </svg><figcaption>Q1, BC548 in a metal can, seen from above, as on the board.</figcaption></figure>`;
  T.l6 = {
    id: "l6", test: "Diode check", scenario: "slide-led",
    title: "Diode check", sub: "Switch and LED board, then the transistor board",
    card: "The diode check pushes a small current one way through a diode and shows the voltage it needs. First, watch the bench check LED1 on the switch and LED board. " +
      "Then check LED1 the other way round, and Q1's two junctions on the transistor board.",
    pre: "Both boards have been looked at and checked for shorts. The power is off.",
    seed: "l6s",
    showLine: "<b>Show me:</b> watch the bench check LED1, red lead on its anode.",
    show: [
      { hl: "power", say: "<b>The power is off.</b> The diode check makes its own small current, so the board's power must be off." },
      { do: { dial: "DCV D" }, hl: "dial", say: "<b>Turn the dial</b> to the <b>diode symbol</b>, next to DCV 200m." },
      { do: { lead: "red", at: "LED1.a" }, say: "<b>Touch</b> the red lead on LED1's anode: the long leg, on the round side." },
      { do: { lead: "black", at: "LED1.k" }, hl: "meter", say: "<b>Touch</b> the black lead on the cathode: the flat side. The meter shows <b>{v}</b>, about 1.7 V for a red LED. <b>A number means it conducts</b> this way." }
    ],
    turn: [
      {
        id: "ledrev", name: "LED1 reversed", kind: "diode", red: "LED1.k", black: "LED1.a",
        revMsg: "Leads: for this reading the red lead goes on the cathode (the flat side). Tap <b>Swap</b>.",
        ask: "<b>Check</b> LED1 the other way round: red lead on the cathode (the flat side), black on the anode.",
        hint: "Power off, dial on the diode symbol. Red lead on LED1's cathode, black on its anode.",
        where: "Put the leads on LED1's two legs.",
        predict: { q: "<b>Predict:</b> red lead on LED1's cathode. <b>What</b> will the meter show?", opts: [
          { t: "1: the LED blocks this way", key: true, fb: "<b>Right.</b> A diode conducts one way only. Red on the cathode tries to push current the wrong way, so it shows 1." },
          { t: "About 1700 mV, the same as before", fb: "<b>Not quite.</b> That was with red on the anode. A diode blocks the other way." },
          { t: "0 mV: a short", fb: "<b>Not quite.</b> A good LED never shows 0 either way. Reversed, it blocks." },
          { t: "−1700 mV", fb: "<b>Not quite.</b> A diode does not conduct backwards, so there is no number to show. The meter shows 1." }
        ] },
        fault: { q: "<b>Another board:</b> LED1 shows 1 <b>both</b> ways round. <b>Is</b> that normal?", opts: [
          { t: "No: LED1 is open inside, so it never conducts", key: true, fb: "<b>Right.</b> A good diode conducts one way (a number) and blocks the other (1). 1 both ways means it never conducts: it is broken." },
          { t: "Yes: an LED always blocks", fb: "<b>Not quite.</b> It blocks one way only. Red on the anode should show a number." },
          { t: "Yes: the power is off", fb: "<b>Not quite.</b> The diode check is meant to be done with the power off. The meter makes its own current." },
          { t: "No: LED1 is shorted", fb: "<b>Not quite.</b> A short would show about 0 both ways. 1 both ways is the opposite: no path at all." }
        ] }
      },
      {
        id: "q1", name: "Q1's junctions", kind: "diode", scenario: "transistor-buzzer", panel: BC548,
        revMsg: "Leads: the red lead goes on the base for both readings. Tap <b>Swap</b>.",
        reads: [
          { id: "be", name: "Base to emitter", red: "Q1.b", black: "Q1.e" },
          { id: "bc", name: "Base to collector", red: "Q1.b", black: "Q1.c" }
        ],
        ask: "<b>Check</b> Q1's two junctions, red lead on the base: base to emitter, then base to collector.",
        hint: "Use the pin-out to find e, b and c. Power off, dial on the diode symbol.",
        where: "Use the pin-out: red lead on Q1's base, black on the emitter, then on the collector.",
        predict: { q: "<b>Predict:</b> red lead on Q1's base, black on the emitter. <b>What</b> will the meter show?", opts: [
          { t: "About 600 to 700 mV: the junction conducts", key: true, fb: "<b>Right.</b> Base to emitter is a junction like a diode's. Red on the base is the way it conducts: about 0.65 V." },
          { t: "1: a transistor blocks", fb: "<b>Not quite.</b> A transistor has two junctions, base to emitter and base to collector. Each conducts one way, like a diode." },
          { t: "About 1700 mV, like the LED", fb: "<b>Not quite.</b> A red LED needs about 1.7 V. A silicon junction needs about 0.65 V." },
          { t: "0 mV", fb: "<b>Not quite.</b> 0 would mean a short. A good junction needs about 0.65 V to conduct." }
        ] },
        compare: { q: v => "<b>Base to emitter:</b> " + v.be + ". <b>Base to collector:</b> " + v.bc + ". <b>Is</b> Q1 good?", opts: [
          { t: "Yes: both junctions conduct with red on the base", key: true, fb: "<b>Right.</b> About 0.6 to 0.7 V each, red on the base. Swapped round, each would show 1." },
          { t: "No: the two readings should differ by 5 V", fb: "<b>Not quite.</b> With the power off there is no 5 V. Each junction needs about 0.65 V to conduct." },
          { t: "No: a good transistor shows 1 everywhere", fb: "<b>Not quite.</b> Then no current could flow from base to emitter, and Q1 could never switch on." },
          { t: "Can't tell without measuring collector to emitter", fb: "<b>Not quite.</b> The two junction checks are the usual test. Both conduct the right way, so Q1 is good." }
        ] },
        fault: { q: "<b>Another board:</b> base to emitter shows 1 both ways round. <b>Is</b> that normal?", opts: [
          { t: "No: the base–emitter junction is open, so Q1 is damaged", key: true, fb: "<b>Right.</b> Red on the base should show about 0.65 V. 1 both ways means no path: Q1 can never switch on." },
          { t: "Yes: 1 means it conducts", fb: "<b>Not quite.</b> On the diode check, 1 means it blocks. A number means it conducts." },
          { t: "Yes: base to emitter always blocks", fb: "<b>Not quite.</b> It blocks one way only. Red on the base should show about 0.65 V." },
          { t: "No: the buzzer is the wrong way round", fb: "<b>Not quite.</b> The buzzer is not between the base and the emitter. The junction itself is open." }
        ] }
      }
    ]
  };

  /* ---------------------------------------------------------------- L7 */
  T.l7 = {
    id: "l7", test: "Current", scenario: "slide-led",
    title: "Current", sub: "Switch and LED board",
    card: "Current is measured in series: break the circuit and put the meter in the gap. First, watch the bench measure LED1's current at the black link. " +
      "Then measure it at LED1's own leg, and put the meter back for a voltage reading.",
    pre: "This board has been looked at and checked for shorts. The power is off.",
    seed: "l7s",
    showLine: "<b>Show me:</b> watch the bench measure LED1's current at the black link.",
    show: [
      { hl: "power", say: "Current is measured <b>in series</b>: break the circuit and put the meter in the gap, so all of the current flows through it. <b>The power is off.</b>" },
      { do: [{ tool: "lift" }, { lift: "link@H19" }], hl: "tool:lift", say: "<b>Lift</b> one end of the black link at H19. The LED's current can no longer reach 0 V: the circuit is broken there." },
      { do: [{ tool: "meter" }, { dial: "DCA 20m" }], hl: "dial", say: "<b>Turn the dial</b> to <b>DCA 20m</b>. DCA is DC current; 20m is 20 mA, the range just above the LED's current." },
      { do: { sock: "A" }, hl: "sockA", say: "<b>Move</b> the red lead to the <b>A</b> socket." },
      { do: { lead: "red", at: "LED1.k" }, say: "<b>Touch</b> the red lead on LED1's cathode. It is on row H, the strip the link was lifted from." },
      { do: { lead: "black", at: "link@H19" }, say: "<b>Touch</b> the black lead on the lifted end of the link. The meter now fills the gap." },
      { do: [{ power: true }, { input: { SW1: "on" } }], hl: "meter", say: "<b>Switch on</b> and slide SW1 on. The meter reads <b>{v}</b>: the current through LED1." },
      { do: [{ power: false }, { sock: "V/Ω" }], hl: "sock", say: "<b>Switch off</b>, and <b>move the red lead back</b> to V/Ω at once. Left in A, the next voltage reading shorts the circuit and blows the fuse." },
      { do: [{ tool: "lift" }, { lift: "link@H19" }, { tool: "meter" }], say: "<b>Solder</b> the link back. The board is whole again." }
    ],
    turn: [
      {
        id: "leg", name: "LED1's current", kind: "amps", red: "LED1.k", black: { under: "LED1.k" }, lift: "LED1.k", set: { SW1: "on" }, dial: "DCA 20m",
        dialMsg: "Dial: use <b>DCA 20m</b>, the range just above the LED's current.",
        liftMsg: "Lift LED1's cathode leg first: power off, choose <b>Lift</b>, tap the end of the leg on the flat side.",
        revMsg: "Leads: the reading has a minus sign, so the current goes in at the black lead. Tap <b>Swap</b>.",
        setMsg: "SW1: slide it on. With SW1 off, no current flows.",
        ask: "<b>Measure</b> LED1's current another way: lift LED1's cathode leg and put the meter in the gap.",
        hint: "Power off first. Lift LED1's cathode leg (the flat side). Then set up the meter as in Show me: red lead on the lifted leg, black on the strip it came out of.",
        where: "In series means in the gap: one lead on LED1's lifted leg, the other on the strip it came out of.",
        predict: { q: "<b>Predict:</b> R1 is 270 Ω, and about 3 V is across it. <b>What</b> current flows through R1 and LED1?", opts: [
          { t: "About 11 mA", key: true, fb: "<b>Right.</b> I = V ÷ R = 3 V ÷ 270 Ω ≈ 0.011 A = 11 mA. The same current flows through LED1: they are in series." },
          { t: "About 1.1 mA", fb: "<b>Not quite.</b> Check the powers of ten: 3 ÷ 270 = 0.011 A, and 0.011 A is 11 mA." },
          { t: "About 810 mA", fb: "<b>Not quite.</b> That is 3 × 270. Current is voltage divided by resistance: I = V ÷ R." },
          { t: "About 90 mA", fb: "<b>Not quite.</b> That is 270 ÷ 3. Current is I = V ÷ R = 3 ÷ 270." }
        ] },
        compare: { q: v => "<b>Compare:</b> LED1's current reads <b>" + v.leg + "</b>. You predicted about 11 mA. <b>Is</b> it normal?", opts: [
          { t: "Yes: it is close to 11 mA", key: true, fb: "<b>Right.</b> R1, the LED and the supply are real parts, so the current is close to 11 mA, not exactly 11.00 mA." },
          { t: "No: it should be exactly 11.00 mA", fb: "<b>Not quite.</b> 11 mA comes from textbook values. Real parts move it a little either way." },
          { t: "No: the current should be 0 with a leg lifted", fb: "<b>Not quite.</b> The leg is lifted, but the meter fills the gap, so the current flows through the meter." },
          { t: "No: it should match the link's current in Show me exactly", fb: "<b>Not quite.</b> Show me used another board, with its own real parts. On one board, the link and the leg carry the same current." }
        ] },
        fault: { q: "<b>Another board:</b> SW1 is on and the meter is in the gap, but it reads 0.00 mA. <b>Is</b> that normal?", opts: [
          { t: "No: no current flows, so the circuit is broken somewhere", key: true, fb: "<b>Right.</b> About 11 mA should flow. 0.00 mA means a break, for example LED1 the wrong way round or a dry joint." },
          { t: "Yes: the meter blocks the current", fb: "<b>Not quite.</b> In series, on A, the meter lets the current through and measures it." },
          { t: "Yes: the range is too high", fb: "<b>Not quite.</b> On DCA 20m, 11 mA shows as 11.xx. 0.00 means no current at all." },
          { t: "No: the red lead is in V/Ω", fb: "<b>Not quite.</b> That could do it, but here the meter is set up right. No current is flowing." }
        ] }
      },
      {
        id: "back", name: "Lead back", kind: "dcv", red: "LED1.a", black: "LED1.k", set: { SW1: "on" }, unlift: "LED1.k",
        unliftMsg: "Solder LED1's leg back first: power off, choose <b>Lift</b>, tap the lifted end.",
        setMsg: "SW1: slide it on for this reading.",
        ask: "<b>Put the board back:</b> solder LED1's leg back, move the red lead back to V/Ω, then measure across LED1.",
        hint: "Power off to solder. Then set the meter for a voltage before you measure.",
        where: "Measure across LED1: red lead on its anode side, black on its cathode side."
      }
    ]
  };

  /* ---------------------------------------------------------------- L8 */
  const TT = v => `<table class="tbx-tt"><caption>Truth table: T3, the output (pin 3)</caption><tbody>` +
    `<tr><th scope="row">A</th><td>0</td><td>0</td><td>1</td><td>1</td></tr><tr><th scope="row">B</th><td>0</td><td>1</td><td>0</td><td>1</td></tr>` +
    `<tr><th scope="row">T3</th>${["q00", "q01", "q10", "q11"].map(k => `<td>${v[k] ? v[k].replace(/ \(.*\)/, "") : "…"}</td>`).join("")}</tr></tbody></table>`;
  const TTline = v => "A 0 B 0: " + v.q00 + "; 0 1: " + v.q01 + "; 1 0: " + v.q10 + "; 1 1: " + v.q11;
  T.l8 = {
    id: "l8", test: "Logic probe", scenario: "guard-start", showScenario: "555-astable",
    title: "Logic probe", sub: "555 flasher, then the guard and start board",
    card: "The logic probe shows a digital level: Hi, Lo, or pulsing. First, watch the bench probe the 555's output. " +
      "Then fill in the AND gate's truth table on the guard and start board.",
    pre: "Both boards have been looked at and checked for shorts. The power is off.",
    start: { pmode: "TTL", pmem: false },
    seed: "l8s",
    showLine: "<b>Show me:</b> watch the bench probe the 555's output on T3.",
    show: [
      { do: { tool: "probe" }, hl: "tool:probe", say: "<b>Choose Probe.</b> Its clips go on the board's own supply: red on T1 (+5 V), black on T2 (0 V)." },
      { do: [{ pmode: "TTL" }, { pmem: false }], hl: "probe", say: "<b>Set</b> the switches: <b>TTL</b> for the 555, and <b>Pulse</b>, not MEM." },
      { do: { power: true }, hl: "power", say: "<b>Switch on.</b> The probe takes its power from the board." },
      { do: { tip: "T3" }, hl: "tp:T3", say: "<b>Touch</b> the tip on <b>T3</b>, the 555's output (pin 3)." },
      { hl: "meter", say: "<b>Watch</b> the lights: Hi (red) and Lo (green) take turns, and Pulse flashes. Pin 3 is switching high and low: the 555 is running." }
    ],
    turn: [
      {
        id: "tt", name: "Truth table", kind: "probe", tip: "T3", panel: TT,
        reads: [
          { id: "q00", name: "A 0, B 0", set: { A: "off", B: "off" } },
          { id: "q01", name: "A 0, B 1", set: { A: "off", B: "on" } },
          { id: "q10", name: "A 1, B 0", set: { A: "on", B: "off" } },
          { id: "q11", name: "A 1, B 1", set: { A: "on", B: "on" } }
        ],
        ask: "<b>Fill in</b> the truth table: probe T3 for each setting of A and B.",
        hint: "Choose Probe and set it for this board's chip, a 74HC08. Switch on. Then set A and B and touch T3 each time.",
        where: "Probe T3, the AND gate's output (pin 3).",
        predict: { q: "<b>Predict:</b> IC1 is a 74HC08, an AND gate. <b>When</b> will T3 show Hi?", opts: [
          { t: "Only when A and B are both on", key: true, fb: "<b>Right.</b> An AND gate's output is 1 only when every input is 1." },
          { t: "When A or B is on", fb: "<b>Not quite.</b> That is an OR gate. An AND gate needs both inputs at 1." },
          { t: "When neither is on", fb: "<b>Not quite.</b> That is a NOR gate. An AND gate needs both inputs at 1." },
          { t: "All the time", fb: "<b>Not quite.</b> Then the inputs would make no difference. An AND gate's output depends on both." }
        ] },
        compare: { q: v => "<b>Your table:</b> " + TTline(v) + ". <b>Does</b> it match an AND gate?", opts: [
          { t: "Yes: Hi only when A and B are both 1", key: true, fb: "<b>Right.</b> Lo, Lo, Lo, Hi: an AND gate's truth table. The probe was on CMOS for the 74HC08, so the levels are right." },
          { t: "No: it should be Hi for three rows", fb: "<b>Not quite.</b> Hi for three rows and Lo for one is a NAND gate. AND is the other way up." },
          { t: "No: it should pulse", fb: "<b>Not quite.</b> A gate's output is steady while its inputs stay still. Pulsing comes from a timer like the 555." },
          { t: "Can't tell from a probe", fb: "<b>Not quite.</b> The probe shows Hi or Lo at each setting. That is the truth table." }
        ] },
        fault: { q: "<b>Another board:</b> T3 is Hi for 0 0, 0 1 and 1 0, and Lo for 1 1. <b>Is</b> that normal?", opts: [
          { t: "No: that is a NAND gate, so a 74HC00 has been fitted", key: true, fb: "<b>Right.</b> Every row is the wrong way up: NAND, not AND. Look at the chip's print: 74HC00." },
          { t: "Yes: that is an AND gate", fb: "<b>Not quite.</b> An AND gate is Hi only for 1 1. This is the opposite in every row." },
          { t: "No: the probe is on TTL", fb: "<b>Not quite.</b> A wrong probe setting can misread a level near the middle. It would not turn every row upside down." },
          { t: "No: A is joined to B", fb: "<b>Not quite.</b> Then 0 1 and 1 0 would match 1 1. Here every row is the opposite of AND." }
        ] }
      }
    ]
  };

  /* ---------------------------------------------------------------- L9 */
  const STAGE = "Work in order, from the inputs to the output: the inputs (pins 1 and 2), gate a's output (T3), EN (pin 5), gate b's output (T4), then Q1's base (T5).";
  T.l9 = {
    id: "l9", test: "Stage by stage", scenario: "greenhouse",
    title: "Stage by stage", sub: "Greenhouse pump board",
    card: "Follow the signal from the inputs to the output, one stage at a time, to find where a change stops it. " +
      "First, watch the bench follow it with all three switches on. Then turn TK off and find where the signal stops.",
    pre: "This board has been looked at and checked for shorts. The power is off.",
    start: { pmode: "CMOS", pmem: false },
    seed: "l9s",
    showLine: "<b>Show me:</b> watch the bench follow the signal with SD, TK and EN all on.",
    show: [
      { do: [{ input: { SD: "on", TK: "on", EN: "on" } }, { power: true }], hl: "power", say: "<b>SD, TK and EN are on</b>, and the power is on. The pump runs. Now follow the signal, stage by stage." },
      { do: [{ tool: "probe" }, { pmode: "CMOS" }, { tip: "IC1.1" }], hl: "probe", say: "<b>Probe</b> on CMOS for the 74HC08. <b>Stage 1, the inputs:</b> SD on pin 1 shows <b>{v}</b>." },
      { do: { tip: "IC1.2" }, say: "TK on pin 2 shows <b>{v}</b>. Both inputs of gate a are 1." },
      { do: { tip: "T3" }, hl: "tp:T3", say: "<b>Stage 2:</b> gate a's output, T3, shows <b>{v}</b>." },
      { do: { tip: "IC1.5" }, say: "<b>Stage 3:</b> EN, gate b's other input on pin 5, shows <b>{v}</b>." },
      { do: { tip: "T4" }, hl: "tp:T4", say: "<b>Stage 4:</b> gate b's output, T4, shows <b>{v}</b>." },
      { do: [{ tool: "meter" }, { dial: "DCV 20" }, { lead: "black", at: "T2" }, { lead: "red", at: "T5" }], hl: "tp:T5", say: "<b>Stage 5:</b> Q1's base, T5, is not a logic level, so use the meter. It reads <b>{v}</b>, about 0.7 V: Q1 is on." },
      { hl: "meter", say: "<b>Every stage passes the signal on</b>, so the pump runs. In your turn, change one input and find the first stage that changes." }
    ],
    turn: [
      {
        id: "stages", name: "TK off", ordered: true, orderMsg: STAGE, set: { SD: "on", TK: "off", EN: "on" },
        setMsg: "Switches: SD on, TK off, EN on for this task.",
        reads: [
          { id: "sd", name: "Pin 1 (SD)", kind: "probe", tip: "IC1.1", stage: 1 },
          { id: "tk", name: "Pin 2 (TK)", kind: "probe", tip: "IC1.2", stage: 1 },
          { id: "t3", name: "T3", kind: "probe", tip: "T3", stage: 2 },
          { id: "en", name: "Pin 5 (EN)", kind: "probe", tip: "IC1.5", stage: 3 },
          { id: "t4", name: "T4", kind: "probe", tip: "T4", stage: 4 },
          { id: "t5", name: "T5", kind: "dcv", red: "T5", black: "T2", stage: 5 }
        ],
        ask: "<b>Turn TK off</b> (SD and EN on). <b>Follow</b> the signal stage by stage, in order.",
        hint: "Switch on, with SD on, TK off, EN on. Probe pins 1 and 2, then T3, pin 5, T4. Then use the meter on T5.",
        where: STAGE,
        predict: { q: "<b>Predict:</b> TK goes off (the tank is empty). SD and EN stay on. <b>What</b> will gate a's output, T3, show?", opts: [
          { t: "Lo", key: true, fb: "<b>Right.</b> Gate a is an AND gate. With TK at 0, its output is 0, whatever SD is." },
          { t: "Hi", fb: "<b>Not quite.</b> An AND gate needs every input at 1. TK is now 0." },
          { t: "Pulsing", fb: "<b>Not quite.</b> A gate's output is steady while its inputs stay still." },
          { t: "No lights", fb: "<b>Not quite.</b> The output is always a level, Hi or Lo. With TK at 0, it is Lo." }
        ] },
        compare: { label: "Where?", q: "<b>Where</b> does TK's change stop the signal?", opts: [
          { t: "At gate a: its output, T3, goes Lo", key: true, fb: "<b>Right.</b> Pin 2 is Lo, so gate a's output (T3) is Lo. From there everything after it is off: T4 Lo, Q1's base 0 V, the pump stopped." },
          { t: "At gate b: T4", fb: "<b>Not quite.</b> T4 is Lo, but T3 before it was already Lo. Find the first stage that changed." },
          { t: "At Q1: T5", fb: "<b>Not quite.</b> T5 is 0 V because nothing reaches it. Go back to the first stage that is Lo." },
          { t: "At the pump", fb: "<b>Not quite.</b> The pump stops because nothing reaches it. Go back to the first stage that is Lo." }
        ] },
        fault: { q: "<b>Another board:</b> all three switches on. T3 Hi, T4 Hi, but T5 reads 0.00 V and the pump is stopped. <b>Where</b> is the fault?", opts: [
          { t: "Between T4 and Q1's base: R1 or its joints", key: true, fb: "<b>Right.</b> The signal reaches gate b's output (T4 Hi) but not Q1's base. R1 and its joints are between them." },
          { t: "At gate a", fb: "<b>Not quite.</b> T3 is Hi, so gate a works." },
          { t: "In the pump", fb: "<b>Not quite.</b> A broken pump would not stop Q1's base reaching about 0.7 V. The base reads 0 V, so the fault is before Q1." },
          { t: "TK is off", fb: "<b>Not quite.</b> All three switches are on, and T3 is Hi, so TK's signal gets through." }
        ] }
      }
    ]
  };

  function sum(v) { return (num(v.led) + num(v.r1)).toFixed(2) + " V"; }

})(typeof globalThis !== "undefined" ? globalThis : this);
