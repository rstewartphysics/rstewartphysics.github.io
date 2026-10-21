/* ============================================================================
   test-bench-jobs.js — the Practise Testing jobs (BENCH-PLAN §3.3, §4, §11, §13)
   ----------------------------------------------------------------------------
   Words only: the bench (test-bench.js) runs the steps. Text approved on the
   review sheet block6-timers/review/bench-2b-questions-r1.pdf (21 Oct 2026, J8).

   A feedback entry is a string, or a function of r(): r(src) returns the
   pupil's own reading from the log ("5.04 V"), or null if it is not there yet.
   Evidence must come from the log (J1). src is { dcv: point } (a meter reading
   from 0 V), { probe: point }, { look: key } or { complaint: true }.
   ============================================================================ */
(function (root) {
  "use strict";
  const J = root.TBJobs = root.TBJobs || {};

  J["555-astable"] = {
    title: "The flasher", sub: "555 astable practice board",
    should: "the two LEDs take turns. Each stays on for about 0.7 s.",
    jobs: [

      /* ---------------------------------------------------------- S7 */
      {
        id: "s7", level: 2,
        complaint: "Neither LED ever comes on.",
        predict: [
          { q: "<b>Predict:</b> on a <b>working</b> board, what should <b>pin 4</b> read?", opts: [
            { t: "It switches high and low", fb: "<b>Not quite.</b> That is pin 3, the output (T3). Pin 4 is the reset. On the circuit diagram, follow the wire from pin 4: where does it go?" },
            { t: "About 0 V", fb: "<b>Not quite.</b> Pin 4 is the reset. 0 V on pin 4 stops the 555, so a working board never has it there. Follow the wire from pin 4: which rail does it join?" },
            { t: "About 5 V", key: true, fb: "<b>Right.</b> Pin 4 is joined to the +5 V rail, like T1, so the 555 is allowed to run. A real reading is close to 5 V, for example 4.98 V." },
            { t: "Between 1.7 V and 3.3 V", fb: "<b>Not quite.</b> That is C1 charging and discharging, at pins 2 and 6 (T4). Follow the wire from pin 4 on the circuit diagram." }
          ] },
          { q: "<b>Predict:</b> on a <b>working</b> board, what should the <b>logic probe</b> show on <b>T3</b>?", opts: [
            { t: "Hi and Lo in turn", key: true, fb: "<b>Right.</b> T3 is pin 3, the output. It goes HIGH and LOW in turn, so the probe shows red, then green, about every 0.7 s. That is what makes the LEDs take turns." },
            { t: "Hi all the time", fb: "<b>Not quite.</b> If pin 3 stayed HIGH, one LED would stay on. On a working board the LEDs take turns, so pin 3 must change. Try again." },
            { t: "Lo all the time", fb: "<b>Not quite.</b> If pin 3 stayed LOW, one LED would stay on. On a working board the LEDs take turns, so pin 3 must change. Try again." },
            { t: "No lights", fb: "<b>Not quite.</b> No lights means the probe sees no level: it is not clipped on, or the tip is on nothing. T3 is joined to pin 3, which is always HIGH or LOW. Try again." }
          ] }
        ],
        faults: [
          { t: "C1 is shorted", fb: "<b>Not this one.</b> A shorted C1 would hold T4 at 0 V, which you saw. But it keeps pin 3 HIGH, so the probe on T3 would show red and LED1 would be on. Look at T3 again." },
          { t: "No supply is reaching the board", fb: r => {
            const v = r({ dcv: "T1" });
            return v ? "<b>Not this one.</b> With no supply, T1 would read 0 V. Your T1 reading was " + v + ", so the supply reaches the board. Look for where it stops."
                     : "<b>Not this one.</b> With no supply, T1 would read 0 V. Measure T1 to check.";
          } },
          { t: "The pin 4 link goes to the 0 V strip", key: true, fb: "<b>Right.</b> Pin 4 is the reset. At 0 V the 555 stops with pin 3 LOW, so LED1 is off. LED2 gets its supply along pin 4's strip, so LED2 is off too." },
          { t: "LED1 and LED2 are both the wrong way round", fb: "<b>Not this one.</b> Reversed LEDs stay dark, but the 555 still runs: the probe on T3 would flash and T4 would rise and fall. Look at T3 and T4 again." }
        ],
        evidence: { need: 3, faultWord: "pin 4", items: [
          { t: "T4 reads {v}", src: { dcv: "T4" }, yes: "✗ Fits, but it also fits C1 shorted or R1 open. On its own it does not point to pin 4.", no: "✓ Right to leave: it fits other faults too." },
          { t: "Pin 4 reads {v}", src: { dcv: "IC1.4" }, key: true, yes: "✓ Key reading: on a working board pin 4 reads about 5 V.", no: "Missed: this is the reading that points to pin 4." },
          { t: "Both LEDs are off", src: { complaint: true }, yes: "✗ That is the complaint, not a test result.", no: "✓ Right to leave: that is the complaint, not a test result." },
          { t: "T1 reads {v}", src: { dcv: "T1" }, key: true, yes: "✓ The supply reaches the board, so it stops between T1 and pin 4.", no: "Missed: this rules out “no supply”." },
          { t: "T3 stays Lo on the probe", src: { probe: "T3" }, key: true, yes: "✓ Pin 3 is LOW. That rules out C1 shorted, which would make it HIGH.", no: "Missed: pin 3 is LOW. That rules out C1 shorted, which would make it HIGH." },
          { t: "C1 is printed 100 µF", src: { look: "C1" }, yes: "✗ That is the right value, so it does not point to any fault.", no: "✓ Right to leave: C1 is the right part." }
        ] },
        confirm: {
          find: { prompt: "<b>Find</b> it: tap the part or wire on the board that is wrong.",
            link: ["B8", "I8"],
            right: "Found it. This link runs from the 0 V strip (row B) to pin 4's strip (row I). It should start on the +5 V strip (row A).",
            other: "Not this one. Pin 4's strip should join the +5 V rail. Find what joins it to a rail." },
          prove: { prompt: "<b>Prove</b> it: switch off. Check continuity from pin 4 to T2 (0 V).",
            a: { seg: "IC1.4" }, b: { net: "T2" }, expect: "beep",
            right: "✓ Beep: pin 4 is joined to 0 V. That proves it.",
            where: "For the proof, put the leads on pin 4 and T2." },
          fixed: v => "✓ Fixed. The link now runs from the +5 V strip to pin 4's strip. Switch on: pin 4 reads " + v("IC1.4") + " and the LEDs take turns.",
          found: "you found the link on the 0 V strip"
        }
      },

      /* ---------------------------------------------------------- S8 */
      {
        id: "s8", level: 3,
        complaint: "LED1 stays on all the time. LED2 never comes on.",
        predict: [
          { q: "<b>Predict:</b> on a <b>working</b> board, what should <b>T4</b> read?", opts: [
            { t: "It rises and falls between about 1.7 V and 3.3 V", key: true, fb: "<b>Right.</b> T4 is C1. It charges up to 3.3 V (two thirds of 5 V), then discharges to 1.7 V (one third), again and again." },
            { t: "0 V all the time", fb: "<b>Not quite.</b> 0 V would mean C1 never charges. On a working board C1 charges and discharges to time the flashes. Try again." },
            { t: "5 V all the time", fb: "<b>Not quite.</b> C1 never reaches 5 V on a working board: the 555 starts to discharge it at two thirds of the supply. Try again." },
            { t: "It switches between 0 V and 5 V", fb: "<b>Not quite.</b> That is pin 3, the output (T3). T4 is C1, which charges and discharges slowly. Try again." }
          ] },
          { q: "<b>Predict:</b> on a <b>working</b> board, what should <b>pin 7</b> read?", opts: [
            { t: "It switches between about 0 V and nearly 5 V", key: true, fb: "<b>Right.</b> Pin 7 is the discharge pin. While C1 charges, pin 7 is not joined to anything inside the chip, so R1 holds it near 5 V. While C1 discharges, the chip pulls pin 7 to 0 V." },
            { t: "5 V all the time", fb: "<b>Not quite.</b> Every time the 555 discharges C1, it pulls pin 7 to 0 V. Try again." },
            { t: "0 V all the time", fb: "<b>Not quite.</b> Pin 7 is only pulled to 0 V while C1 discharges. While C1 charges, R1 holds it near 5 V. Try again." },
            { t: "It rises and falls between 1.7 V and 3.3 V", fb: "<b>Not quite.</b> That is C1, at T4 (pins 2 and 6). Pin 7 is at the top of R2, between R1 and R2. Try again." }
          ] }
        ],
        faults: [
          { t: "R2 has a dry joint", key: true, fb: "<b>Right.</b> R2's top joint is dry, so R2 is not joined to its strip. C1 has no way to charge: T4 stays at 0 V and pin 3 stays HIGH, so LED1 stays on and LED2 stays off. Nothing pulls pin 7 down, so R1 holds it at 5 V." },
          { t: "R1 has a dry joint", fb: r => {
            const v = r({ dcv: "IC1.7" });
            return "<b>Not this one.</b> With R1 open, C1 could not charge either, so T4 would read 0 V, as you saw. But nothing would hold pin 7 up: it would read about 0 V. " +
              (v ? "Your pin 7 reading was " + v + ". Look at pin 7 again." : "Measure pin 7: it tells these faults apart.");
          } },
          { t: "C1 is shorted", fb: r => {
            const v = r({ dcv: "IC1.7" });
            return "<b>Not this one.</b> A shorted C1 also holds T4 at 0 V and pin 3 HIGH, as you saw. But R2 would pull pin 7 down towards C1, so pin 7 would read about 4.5 V. " +
              (v ? "Your pin 7 reading was " + v + ". Look at pin 7 again." : "Measure pin 7: it tells these faults apart.");
          } },
          { t: "LED2 is the wrong way round", fb: "<b>Not this one.</b> A reversed LED2 stays dark, but the 555 still runs: LED1 would flash, the probe on T3 would show Hi and Lo in turn, and T4 would rise and fall. Look at T3 and T4 again." }
        ],
        evidence: { need: 3, faultWord: "R2", items: [
          { t: "Pin 7 reads {v}", src: { dcv: "IC1.7" }, key: true, yes: "✓ Key reading: nothing pulls pin 7 down. That rules out R1 open (about 0 V) and C1 shorted (about 4.5 V).", no: "Missed: pin 7 tells R2 apart from R1 and C1." },
          { t: "T4 reads {v}", src: { dcv: "T4" }, yes: "✗ Fits, but it also fits R1 open and C1 shorted. On its own it does not point to R2.", no: "✓ Right to leave: it fits other faults too." },
          { t: "T3 stays Hi on the probe", src: { probe: "T3" }, key: true, yes: "✓ Pin 3 is stuck HIGH, so the 555 is not running. That rules out LED2 reversed.", no: "Missed: a stuck pin 3 rules out LED2 reversed." },
          { t: "LED1 is on all the time", src: { complaint: true }, yes: "✗ That is the complaint, not a test result.", no: "✓ Right to leave: that is the complaint, not a test result." },
          { t: "R2's top joint is dull and cracked", src: { look: "copper:G19" }, key: true, yes: "✓ Key: you have seen the fault itself.", no: "Missed: flip the board and look at R2's joints." },
          { t: "T1 reads {v}", src: { dcv: "T1" }, yes: "✗ The supply is fine, but it is fine with every fault on the list. It does not point to R2.", no: "✓ Right to leave: it fits every fault on the list." }
        ] },
        confirm: {
          find: { prompt: "<b>Find</b> it: tap the part or joint on the board that is wrong.",
            hole: "G19",
            right: "Found it. R2's top joint is dull and grey, with a crack round the leg. The solder has not flowed onto the track.",
            close: { part: "R2", text: "Close. R2 itself is fine. Flip the board and look at its joints." },
            other: "Not this one. Flip the board and look at the joints on R1 and R2." },
          prove: { prompt: "<b>Prove</b> it: switch off. Check continuity from R2's top leg to pin 7, on the same strip.",
            a: { key: "R2.1" }, b: { seg: "IC1.7" }, expect: "open",
            right: "✓ No beep: R2's leg is not joined to its strip. That proves the joint is dry.",
            where: "For the proof, put the leads on R2's top leg and pin 7." },
          fixed: () => "✓ Fixed. The joint is remade: shiny, and flowed onto the track. Switch on: T4 rises and falls and the LEDs take turns.",
          found: "you found the dry joint on R2"
        }
      }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
