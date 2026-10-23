/* ============================================================================
   test-bench-jobs.js — the Practise Testing jobs (BENCH-PLAN §3.3, §4, §11, §13)
   ----------------------------------------------------------------------------
   Words only: the bench (test-bench.js) runs the steps. Text approved on the
   review sheets block6-timers/review/bench-2b-questions-r1.pdf (S7, S8; 21 Oct
   2026, J8) and bench-3-3-questions-r1.pdf (the other eight; 22 Oct, N1).

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
  /* ==================================================================
     Phase 3.3: the eight new boards. Text approved on the review sheet
     block6-timers/review/bench-3-3-questions-r1.pdf (22 Oct 2026, BENCH-PLAN
     §17 N1–N5). src.set: the switches the reading must be taken with.
     ================================================================== */
  const NQ = "<b>Not quite.</b> ", NT = "<b>Not this one.</b> ";
  const OFF = { SW1: "off" }, ON = { SW1: "on" };
  const complaint = t => ({ t, src: { complaint: true }, yes: "✗ That is the complaint, not a test result.", no: "✓ Right to leave: that is the complaint, not a test result." });
  const every = (t, src) => ({ t, src, yes: "✗ The supply is fine with every fault on the list. It does not point to the fault.", no: "✓ Right to leave: it fits every fault on the list." });
  const same = (t, src) => ({ t, src, yes: "✗ That is right on a working board too.", no: "✓ Right to leave: it is the same on a working board." });
  /* "Your T1 reading was 5.02 V" if it is in the log, or what to measure */
  const was = (r, src, lead, tail, ask) => { const v = r(src); return v ? lead + v + tail : ask; };

  /* ---------------------------------------------------------- S9 */
  J["slide-led"] = {
    title: "Switch and LED", sub: "Slide switch board",
    should: "slide SW1 on and LED1 lights.",
    jobs: [{
      id: "s9", level: 1,
      complaint: "LED1 never lights, even with SW1 on.",
      predict: [
        { q: "<b>Predict:</b> on a <b>working</b> board, with SW1 on, what should <b>T4</b> read?", opts: [
          { t: "About 2 V", key: true, fb: "<b>Right.</b> T4 is the top of LED1. A lit red LED takes about 1.9 V. R1 takes the rest of the 5 V." },
          { t: "About 5 V", fb: NQ + "That is T3, just after the switch. If T4 read 5 V, LED1 would have the whole supply and R1 none: no current would flow. Try again." },
          { t: "About 0 V", fb: NQ + "0 V at T4 would mean nothing across LED1, so it could not light. Try again." },
          { t: "About 3 V", fb: NQ + "About 3 V is what R1 takes. T4 is measured from 0 V, so it reads LED1's share. Try again." }
        ] },
        { q: "<b>Predict:</b> on a <b>working</b> board, with SW1 on, what current flows through LED1?", opts: [
          { t: "About 11 mA", key: true, fb: "<b>Right.</b> R1 takes about 3.1 V. I = V ÷ R = 3.1 ÷ 270 = 0.011 A, which is 11 mA." },
          { t: "About 19 mA", fb: NQ + "That is 5 V ÷ 270 Ω. But LED1 takes about 1.9 V, so R1 only has about 3.1 V. Try again." },
          { t: "0 mA", fb: NQ + "On a working board LED1 is lit, so current must flow through it. Try again." },
          { t: "About 1 A", fb: NQ + "1 A would burn out LED1. R1 is there to keep the current small. Try again." }
        ] }
      ],
      faults: [
        { t: "LED1 is the wrong way round", key: true, fb: "<b>Right.</b> A reversed LED blocks the current. No current flows, so R1 takes nothing and LED1 takes the whole supply: T4 reads 5 V, not about 1.9 V." },
        { t: "R1 has a dry joint", fb: r => NT + "With R1 open, no current flows either. But nothing would join T4 to +5 V, so T4 would read 0 V. " +
          was(r, { dcv: "T4", set: ON }, "Your T4 reading was ", ". Look at T4 again.", "Measure T4: it tells these faults apart.") },
        { t: "SW1 does not make contact", fb: r => NT + "Then T3, just after the switch, would read 0 V with SW1 on. " +
          was(r, { dcv: "T3", set: ON }, "Your T3 reading was ", ", so the supply gets through SW1.", "Measure T3 with SW1 on to check.") },
        { t: "No supply reaches the board", fb: r => NT + "With no supply, T1 would read 0 V. " +
          was(r, { dcv: "T1" }, "Your T1 reading was ", ".", "Measure T1 to check.") }
      ],
      evidence: { need: 3, faultWord: "LED1", items: [
        { t: "T4 reads {v} with SW1 on", src: { dcv: "T4", set: ON }, key: true, yes: "✓ Key reading: LED1 takes the whole supply. That rules out R1 open, which gives 0 V.", no: "Missed: T4 is the reading that points to LED1." },
        { t: "T3 reads {v} with SW1 on", src: { dcv: "T3", set: ON }, key: true, yes: "✓ The supply gets through SW1. That rules out the switch and “no supply”.", no: "Missed: T3 rules out SW1." },
        { t: "LED1's flat side is on R1's side", src: { look: "LED1" }, key: true, yes: "✓ Key: you have seen the fault. The flat side (the cathode) should face 0 V.", no: "Missed: look at LED1's flat side." },
        { t: "The current reads {v}", src: { amps: true, set: ON }, yes: "✗ Fits, but R1 open gives 0 mA too. On its own it does not point to LED1.", no: "✓ Right to leave: it fits other faults too." },
        complaint("LED1 is off"),
        { t: "R1's bands: red, violet, brown", src: { look: "R1" }, yes: "✗ That is 270 Ω, the right value. It does not point to any fault.", no: "✓ Right to leave: R1 is the right part." }
      ] },
      confirm: {
        find: { prompt: "<b>Find</b> it: tap the part on the board that is wrong.", part: "LED1",
          right: "Found it. LED1's flat side (the cathode, short leg) is towards R1. It should face the 0 V side.",
          other: "Not this one. T4 reads 5 V: the part between T4 and 0 V takes the whole supply. Look at it." },
        prove: { prompt: "<b>Prove</b> it: switch off. Do a diode check on LED1: red lead on T4, black lead on T2.", type: "diode",
          ways: [
            { red: { net: "T4" }, black: { net: "T2" }, expect: "over", right: "✓ 1: the diode check pushes current from red to black, and LED1 blocks it. It is in backwards. That proves it." },
            { red: { net: "T2" }, black: { net: "T4" }, expect: [1.3, 2.2], right: "✓ A number with the red lead on the 0 V side: LED1 only conducts from 0 V towards T4. It is in backwards. That proves it." }
          ],
          right: "✓ LED1 is in backwards. That proves it.",
          where: "Put the red lead on T4 and the black lead on T2." },
        fixed: v => "✓ Fixed. LED1 is turned round. Switch on: T4 reads " + v("T4", ON) + " and LED1 lights.",
        found: "you found LED1 the wrong way round"
      }
    }]
  };

  /* ---------------------------------------------------------- S1 */
  J["transistor-buzzer"] = {
    title: "Buzzer alarm", sub: "Transistor switch board",
    should: "slide SW1 on and the buzzer sounds. Slide it off and it stops.",
    jobs: [{
      id: "s1", level: 2,
      complaint: "The buzzer never sounds.",
      predict: [
        { q: "<b>Predict:</b> on a <b>working</b> board, with SW1 on, what should <b>T3</b> (Q1's base) read?", opts: [
          { t: "About 0.7 V", key: true, fb: "<b>Right.</b> When a transistor is on, its base sits about 0.7 V above its emitter. The emitter is on 0 V." },
          { t: "About 5 V", fb: NQ + "The base is behind R1. Once Q1 turns on, the base cannot rise above about 0.7 V. R1 takes the rest. Try again." },
          { t: "About 0 V", fb: NQ + "At 0 V the base gets no current, so Q1 would be off and the buzzer silent. Try again." },
          { t: "About 2.5 V", fb: NQ + "R1 is not half of a voltage divider here. The base of a transistor that is on sits at about 0.7 V. Try again." }
        ] },
        { q: "<b>Predict:</b> on a <b>working</b> board, with SW1 on, what should <b>T4</b> (Q1's collector) read?", opts: [
          { t: "Close to 0 V", key: true, fb: "<b>Right.</b> Q1 is fully on, like a closed switch. The buzzer takes nearly all of the 5 V, so the collector is close to 0 V (about 0.1 V)." },
          { t: "About 5 V", fb: NQ + "That is the collector when Q1 is off: no current, so the buzzer takes nothing. Try again." },
          { t: "About 0.7 V", fb: NQ + "0.7 V is the base, T3. The collector is the leg the buzzer joins. Try again." },
          { t: "About 2.5 V", fb: NQ + "Then the buzzer would only have half the supply. A transistor used as a switch is fully on or fully off. Try again." }
        ] }
      ],
      faults: [
        { t: "R1 is 1 MΩ, not 1 kΩ", key: true, fb: "<b>Right.</b> With 1 MΩ the base current is about 1000 times too small. T3 still reads about 0.6 V, so it looks normal. But Q1 hardly turns on: the collector stays high and the buzzer is silent. The bands say brown, black, green." },
        { t: "SW1 does not make contact", fb: r => NT + "Then no current would reach the base: T3 would read 0 V. " +
          was(r, { dcv: "T3", set: ON }, "Your T3 reading was ", ".", "Measure T3 with SW1 on to check.") },
        { t: "BUZ1 is the wrong way round", fb: r => NT + "A reversed buzzer passes no current. Q1 is on, so the collector would sit at 0 V. " +
          was(r, { dcv: "T4", set: ON }, "Your T4 reading was ", ".", "Measure T4 with SW1 on.") },
        { t: "Q1's collector has a dry joint", fb: r => NT + "With the collector open, no current flows at all: T4 would read the full 5 V. " +
          was(r, { dcv: "T4", set: ON }, "Your T4 reading was ", ", so a small current is flowing. Look at R1's bands.", "Measure T4 with SW1 on.") }
      ],
      evidence: { need: 3, faultWord: "R1", items: [
        { t: "T4 reads {v} with SW1 on", src: { dcv: "T4", set: ON }, key: true, yes: "✓ Key reading: Q1 is only a little on. Not 0 V (buzzer reversed) and not 5 V (collector open).", no: "Missed: T4 tells this fault from the others." },
        { t: "The buzzer current reads {v}", src: { amps: true, set: ON }, key: true, yes: "✓ A working buzzer takes about 20–30 mA. This is far too small, but not zero.", no: "Missed: the current shows Q1 is hardly on." },
        { t: "R1's bands: brown, black, green", src: { look: "R1" }, key: true, yes: "✓ Key: brown, black, green is 1 MΩ. The circuit needs 1 kΩ (brown, black, red).", no: "Missed: read R1's bands." },
        { t: "T3 reads {v} with SW1 on", src: { dcv: "T3", set: ON }, yes: "✗ This looks normal: a working board reads about 0.7 V too. It does not point to the fault.", no: "✓ Right to leave: T3 looks normal on this board. That is the trap." },
        complaint("The buzzer is silent"),
        { t: "Q1: the tab is next to the emitter", src: { look: "Q1" }, yes: "✗ That is the right way round. It does not point to a fault.", no: "✓ Right to leave: Q1 is fitted the right way." }
      ] },
      confirm: {
        find: { prompt: "<b>Find</b> it: tap the part on the board that is wrong.", part: "R1",
          right: "Found it. R1's bands are brown, black, green: 1 MΩ. The circuit needs 1 kΩ.",
          other: "Not this one. The base is getting far too little current. Which part sets the base current?" },
        prove: { prompt: "<b>Prove</b> it: switch off. Lift one leg of R1. Measure R1 on OHM 2M.",
          a: { part: "R1" }, b: { part: "R1" }, expect: [900e3, 1100e3],
          right: "✓ R1 reads about 1000 kΩ, which is 1 MΩ. It should read 1 kΩ. That proves it.",
          miss: "Lift one leg of R1 for a true reading, and use a range that shows about 1000 kΩ.",
          where: "For the proof, put the leads on R1's two legs." },
        fixed: v => "✓ Fixed. A 1 kΩ resistor (brown, black, red) is fitted. Switch on: T4 reads " + v("T4", ON) + " and the buzzer sounds.",
        found: "you found R1 is 1 MΩ"
      }
    }]
  };

  /* ---------------------------------------------------------- S4 */
  const AB = (a, b) => ({ A: a ? "on" : "off", B: b ? "on" : "off" });
  J["guard-start"] = {
    title: "Guard and start", sub: "74HC08 AND gate board",
    should: "LED1 lights only when A (guard closed) and B (start pressed) are both on.",
    card: "Set the probe to CMOS.",
    jobs: [{
      id: "s4", level: 2,
      complaint: "The machine light is on before anyone presses start. When the guard is closed and start is pressed, it goes off.",
      predict: [
        { q: "<b>Predict:</b> on a <b>working</b> board, with A on and B off, what should the <b>logic probe</b> show on <b>T3</b>?", opts: [
          { t: "Lo", key: true, fb: "<b>Right.</b> T3 is the AND gate's output. It is 1 only when both inputs are 1. B is off, so the output is 0: green, Lo." },
          { t: "Hi", fb: NQ + "An AND gate needs A <b>and</b> B. Only A is on. Try again." },
          { t: "Hi and Lo in turn", fb: NQ + "Nothing on this board flashes. The output only changes when a switch changes. Try again." },
          { t: "No lights", fb: NQ + "No lights means the probe sees no level. A powered 74HC08 output is always Hi or Lo. Try again." }
        ] },
        { q: "<b>Predict:</b> on a <b>working</b> board, with A off, what should the <b>logic probe</b> show on <b>pin 1</b> (input A)?", opts: [
          { t: "Lo", key: true, fb: "<b>Right.</b> With A off, R2 (the pull-down) holds pin 1 at 0 V." },
          { t: "Hi", fb: NQ + "Pin 1 is only Hi when A joins it to +5 V. Try again." },
          { t: "No lights", fb: NQ + "An input joined to nothing would float. R2, the pull-down, is there to stop that. Try again." },
          { t: "Flickering", fb: NQ + "A flicker is a floating input. R2 holds pin 1 steady at 0 V. Try again." }
        ] }
      ],
      faults: [
        { t: "A 74HC00 (NAND) is fitted, not a 74HC08", key: true, fb: "<b>Right.</b> A NAND gate gives the opposite of AND: Hi for 00, 01 and 10, Lo for 11. The pins are the same, so the wiring is right, but the output is the wrong way up." },
        { t: "LED1 is the wrong way round", fb: NT + "A reversed LED never lights. LED1 does light, with A and B off." },
        { t: "R2, A's pull-down, has a dry joint", fb: r => NT + "Then pin 1 would float with A off: the probe would flicker there. " +
          was(r, { probe: "IC1.1", set: { A: "off" } }, "Your probe on pin 1 with A off showed ", ".", "Probe pin 1 with A off to check.") },
        { t: "IC1 pin 14 has a dry joint", fb: NT + "With no supply on pin 14 the chip is dead: the probe on T3 would show no lights, and LED1 would never light. LED1 lights with A and B off." }
      ],
      evidence: { need: 3, faultWord: "IC1", items: [
        { t: "T3 shows {v} with A and B off", src: { probe: "T3", set: AB(0, 0) }, key: true, yes: "✓ Key: an AND gate gives Lo here. The output is upside down.", no: "Missed: T3 with both off shows the output is upside down." },
        { t: "T3 shows {v} with A and B on", src: { probe: "T3", set: AB(1, 1) }, key: true, yes: "✓ Key: an AND gate gives Hi here.", no: "Missed: T3 with both on is the other half of the truth table." },
        { t: "IC1 is printed 74HC00", src: { look: "IC1" }, key: true, yes: "✓ Key: you have seen the fault. 74HC00 is four NAND gates.", no: "Missed: read the print on top of IC1." },
        same("Pin 1 shows {v} with A on", { probe: "IC1.1", set: { A: "on" } }),
        complaint("LED1 is lit with A and B off"),
        { t: "T1 reads {v}", src: { dcv: "T1" }, yes: "✗ The supply reaches the board, but it does with every fault on the list. Pin 14's joint is after T1.", no: "✓ Right to leave: it fits every fault on the list." }
      ] },
      confirm: {
        find: { prompt: "<b>Find</b> it: tap the part on the board that is wrong.", part: "IC1",
          right: "Found it. IC1 is a 74HC00: four NAND gates. The circuit needs a 74HC08: four AND gates.",
          other: "Not this one. The inputs read right, but the output is upside down. Which part decides the output?" },
        prove: { prompt: "<b>Prove</b> it: use <b>Look</b> on IC1 and read the print.", type: "look", look: "IC1",
          right: "✓ 74HC00. The pins are the same as a 74HC08, but the gates are NAND. That proves it." },
        fixed: () => "✓ Fixed. With the power off, the 74HC00 is taken out and a 74HC08 fitted, notch at the top. Switch on: T3 shows Hi only with A and B on, and LED1 lights then.",
        found: "you found the 74HC00"
      }
    }]
  };

  /* ---------------------------------------------------------- S5 */
  J["tank-empty"] = {
    title: "Tank empty warning", sub: "74HC04 NOT gate board",
    should: "LED1 lights when SW1 is off (the tank is empty), and goes off when SW1 is on.",
    card: "Set the probe to CMOS.",
    jobs: [{
      id: "s5", level: 2,
      complaint: "The warning light never comes on, even when the tank is empty.",
      predict: [
        { q: "<b>Predict:</b> on a <b>working</b> board, with SW1 off, what should the <b>logic probe</b> show on <b>T3</b> (pin 1)?", opts: [
          { t: "Lo", key: true, fb: "<b>Right.</b> With SW1 off, R2 (the pull-down) holds pin 1 at 0 V." },
          { t: "Hi", fb: NQ + "Pin 1 is only Hi when SW1 joins it to +5 V. Try again." },
          { t: "No lights", fb: NQ + "An input joined to nothing would float. R2 is there to stop that. Try again." },
          { t: "Hi and Lo in turn", fb: NQ + "Nothing on this board flashes. Pin 1 only changes when SW1 changes. Try again." }
        ] },
        { q: "<b>Predict:</b> on a <b>working</b> board, with SW1 off, what should the <b>logic probe</b> show on <b>T4</b> (pin 2)?", opts: [
          { t: "Hi", key: true, fb: "<b>Right.</b> Pin 2 is the NOT gate's output. Pin 1 is Lo, so pin 2 is Hi, and LED1 lights." },
          { t: "Lo", fb: NQ + "A NOT gate gives the opposite of its input. Pin 1 is Lo. Try again." },
          { t: "The same as pin 1", fb: NQ + "That would be a buffer. A NOT gate turns its input upside down. Try again." },
          { t: "No lights", fb: NQ + "A powered 74HC04 output is always Hi or Lo. Try again." }
        ] }
      ],
      faults: [
        { t: "The track under the chip is not cut on pin 1's strip", key: true, fb: "<b>Right.</b> A chip sits across a row of track cuts. Without the cut, pin 1's strip runs on to pin 14, which is +5 V. Pin 1 is held Hi whatever SW1 does, so pin 2 stays Lo and LED1 never lights." },
        { t: "LED1 is the wrong way round", fb: r => NT + "A reversed LED stays dark, but the chip still works: with SW1 off, pin 2 would be Hi. " +
          was(r, { probe: "T4", set: OFF }, "Your probe on T4 with SW1 off showed ", ".", "Probe T4 with SW1 off to check.") },
        { t: "SW1 is stuck on", fb: "<b>Not this one, or not yet proved.</b> A stuck switch would also hold pin 1 Hi. Test SW1: power off, SW1 off, continuity from its middle pin to pin 1. A stuck switch gives no beep." },
        { t: "A 74HC08 is fitted, not a 74HC04", fb: r => NT + "On a 74HC08, pin 2 is an input, not an output: the probe on T4 would show no lights. " +
          was(r, { probe: "T4", set: OFF }, "Your probe on T4 showed ", ".", "Probe T4 to check.") }
      ],
      evidence: { need: 3, faultWord: "the cut", items: [
        { t: "T3 shows {v} with SW1 off", src: { probe: "T3", set: OFF }, key: true, yes: "✓ Key: pin 1 should be Lo here. Something holds it up.", no: "Missed: pin 1 is Hi when it should be Lo." },
        { t: "T4 shows {v} with SW1 off", src: { probe: "T4", set: OFF }, key: true, yes: "✓ The chip turns pin 1 upside down, as a NOT gate should. That rules out LED1 reversed and the wrong chip.", no: "Missed: T4 shows the chip itself works." },
        { t: "No track cut between pin 1 and pin 14 (copper side)", src: { look: ["copper:F11", "copper:F12"] }, key: true, yes: "✓ Key: you have seen the fault.", no: "Missed: flip the board and look at the cuts under the chip." },
        same("T3 shows {v} with SW1 on", { probe: "T3", set: ON }),
        complaint("LED1 is off with SW1 off"),
        every("T1 reads {v}", { dcv: "T1" })
      ] },
      confirm: {
        find: { prompt: "<b>Find</b> it: tap the place on the board that is wrong.", hole: ["F11", "F12"],
          right: "Found it. There is no cut here, so pin 1's strip runs on to pin 14 (+5 V).",
          other: "Not this one. Pin 1 is joined to +5 V. Flip the board and look at the track under the chip." },
        prove: { prompt: "<b>Prove</b> it: switch off. Check continuity from pin 1 to pin 14.",
          a: { key: "IC1.1" }, b: { key: "IC1.14" }, expect: "beep",
          right: "✓ Beep: pin 1 is joined to pin 14. On a working board this reads 1. That proves it.",
          where: "For the proof, put the leads on pin 1 and pin 14." },
        fixed: () => "✓ Fixed. The track is cut at F11. Switch on with SW1 off: T3 shows Lo, T4 shows Hi, and LED1 lights.",
        found: "you found the missing track cut"
      }
    }]
  };

  /* ---------------------------------------------------------- S10 */
  const RED = { SW1: "red" }, GREEN = { SW1: "green" };
  J["red-green"] = {
    title: "Red or green", sub: "Slide switch board",
    should: "slide SW1 to red and LED1 (red) lights. Slide it to green and LED2 (green) lights.",
    jobs: [{
      id: "s10", level: 2,
      complaint: "The red light is always on. The green light never comes on.",
      predict: [
        { q: "<b>Predict:</b> on a <b>working</b> board, with SW1 slid to green, what should <b>T3</b> (the middle pin) read?", opts: [
          { t: "About 5 V", key: true, fb: "<b>Right.</b> The middle pin is joined to +5 V by its link, whichever way SW1 is slid." },
          { t: "About 0 V", fb: NQ + "Sliding the switch changes which outer pin the middle pin joins. The middle pin keeps its supply. Try again." },
          { t: "5 V on red, 0 V on green", fb: NQ + "The middle pin's link goes straight to +5 V. The slider does not change that. Try again." },
          { t: "About 2 V", fb: NQ + "About 2 V is what a lit LED takes. T3 is the middle pin, before R1 and R2. Try again." }
        ] },
        { q: "<b>Predict:</b> on a <b>working</b> board, with SW1 slid to green, what should <b>T4</b> (the red branch) read?", opts: [
          { t: "About 0 V", key: true, fb: "<b>Right.</b> Slid to green, the middle pin joins the green side only. Nothing feeds the red branch." },
          { t: "About 5 V", fb: NQ + "That is the red branch when SW1 is slid to red. Try again." },
          { t: "About 2 V", fb: NQ + "The red LED is off on the green side, so it has no current and no supply. Try again." },
          { t: "About 2.5 V", fb: NQ + "A switch joins the middle pin fully to one side or the other. Nothing is shared. Try again." }
        ] }
      ],
      faults: [
        { t: "The +5 V link goes to the red pin's strip", key: true, fb: "<b>Right.</b> +5 V reaches the red branch straight from the link, so red is on whichever way SW1 is slid. Slid to green, the middle pin has no supply of its own: T3 reads 0 V, and green gets nothing." },
        { t: "LED2 is the wrong way round", fb: NT + "A reversed LED2 stays dark, but red would go off when SW1 is slid to green. Red stays on." },
        { t: "SW1 is broken inside", fb: NT + "A broken switch joins nothing, so neither LED would get a supply. Red would be off too." },
        { t: "No supply reaches the board", fb: NT + "With no supply, both LEDs would be dark. Red is on." }
      ],
      evidence: { need: 3, faultWord: "the link", items: [
        { t: "T3 reads {v} with SW1 on green", src: { dcv: "T3", set: GREEN }, key: true, yes: "✓ Key: the middle pin should always be at 5 V. It has lost its supply.", no: "Missed: T3 on the green side shows the middle pin has no supply." },
        { t: "T4 reads {v} with SW1 on green", src: { dcv: "T4", set: GREEN }, key: true, yes: "✓ The red branch has the supply, even though the switch is slid away from it.", no: "Missed: T4 on the green side shows where the supply goes." },
        { t: "The red +5 V link ends in row B, the red pin's strip", src: { look: "link1" }, key: true, yes: "✓ Key: you have seen the fault. It should end in row C, the middle pin's strip.", no: "Missed: look at where the +5 V link ends." },
        same("T3 reads {v} with SW1 on red", { dcv: "T3", set: RED }),
        complaint("The red LED is always on"),
        { t: "R2's bands: red, violet, brown", src: { look: "R2" }, yes: "✗ That is 270 Ω, the right value. It does not point to any fault.", no: "✓ Right to leave: R2 is the right part." }
      ] },
      confirm: {
        find: { prompt: "<b>Find</b> it: tap the part or wire on the board that is wrong.", link: ["A6", "B6"],
          right: "Found it. This link runs from the +5 V rail (row A) to the red pin's strip (row B). It should end in row C, the middle pin's strip.",
          other: "Not this one. The middle pin has lost its supply. Find what joins a strip to +5 V." },
        prove: { prompt: "<b>Prove</b> it: switch off. Slide SW1 to green. Check continuity from T1 (+5 V) to the middle pin.",
          a: { net: "T1" }, b: { key: "SW1.c" }, set: GREEN, expect: "open",
          setMsg: "Slide SW1 to green first: on red, the switch joins the middle pin to the red strip.",
          right: "✓ No beep: the middle pin is not joined to +5 V. That proves the link is in the wrong strip.",
          where: "For the proof, put the leads on T1 and the middle pin." },
        fixed: () => "✓ Fixed. The link now runs from the +5 V rail to the middle pin's strip. Switch on: red lights on red, green lights on green.",
        found: "you found the +5 V link in the wrong strip"
      }
    }]
  };

  /* ---------------------------------------------------------- S2 */
  const LAMP = { LDR: "light" }, CAP = { LDR: "covered" };
  J["dark-light"] = {
    title: "Dark-activated light", sub: "Transistor and LDR board",
    should: "with the black cap on the LDR (dark), LED1 lights. Under the lamp (light), LED1 is off.",
    jobs: [{
      id: "s2", level: 3,
      complaint: "The light is on in the daytime and goes off at night.",
      predict: [
        { q: "<b>Predict:</b> on a <b>working</b> board, under the lamp, what should <b>T3</b> (Q1's base) read?", opts: [
          { t: "Well under 0.7 V (about 0.2 V)", key: true, fb: "<b>Right.</b> In light the LDR's resistance is small, so it takes only a small share of the 5 V. The base is below 0.7 V, so Q1 is off." },
          { t: "About 0.7 V", fb: NQ + "That is the base when Q1 is on, in the dark. Under the lamp LED1 is off, so Q1 is off. Try again." },
          { t: "About 5 V", fb: NQ + "The base is the middle of a voltage divider, R1 above and the LDR below. It can never reach the full supply. Try again." },
          { t: "About 2.5 V", fb: NQ + "That would need the LDR to equal R1, 10 kΩ. Under the lamp the LDR is only a few hundred ohms. Try again." }
        ] },
        { q: "<b>Predict:</b> on a <b>working</b> board, with the black cap on, what should <b>T4</b> (Q1's collector) read?", opts: [
          { t: "Close to 0 V", key: true, fb: "<b>Right.</b> In the dark the base rises to 0.7 V and Q1 turns fully on, like a closed switch. LED1 and R2 take nearly all the 5 V." },
          { t: "About 3.5 V", fb: NQ + "That is the collector when Q1 is off, under the lamp. Try again." },
          { t: "About 0.7 V", fb: NQ + "0.7 V is the base, T3. The collector is the leg LED1 and R2 join. Try again." },
          { t: "About 5 V", fb: NQ + "Even with Q1 off, LED1 holds the collector a little below 5 V. And in the dark Q1 is on. Try again." }
        ] }
      ],
      faults: [
        { t: "The LDR and R1 are swapped", key: true, fb: "<b>Right.</b> With the LDR at the top, light makes its resistance small, so the base rises to 0.7 V and Q1 turns on in the light. In the dark the LDR is large, so the base falls and LED1 goes off. The circuit works the wrong way round." },
        { t: "LED1 is the wrong way round", fb: NT + "A reversed LED never lights. LED1 lights under the lamp." },
        { t: "Q1's collector has a dry joint", fb: NT + "Then Q1 could never pull the collector down, so LED1 would never light. LED1 lights under the lamp." },
        { t: "The LDR has a dry joint", fb: r => NT + "With the LDR open, nothing pulls the base down, so LED1 would be on all the time, in the dark as well. " +
          was(r, { dcv: "T3", set: CAP }, "Your T3 reading with the cap on was ", ", and LED1 was off.", "Put the cap on and measure T3.") }
      ],
      evidence: { need: 3, faultWord: "the LDR", items: [
        { t: "T3 reads {v} under the lamp", src: { dcv: "T3", set: LAMP }, key: true, yes: "✓ Key: the base is up in the light. On a working board it is about 0.2 V here.", no: "Missed: T3 under the lamp shows the divider is upside down." },
        { t: "T3 reads {v} with the cap on", src: { dcv: "T3", set: CAP }, key: true, yes: "✓ The base drops in the dark. That rules out an open LDR, which would leave it up.", no: "Missed: T3 with the cap on rules out the LDR being open." },
        { t: "The LDR is in the top place, next to +5 V", src: { look: ["LDR", "R1"] }, key: true, yes: "✓ Key: you have seen the fault. The LDR belongs in the bottom place, next to 0 V.", no: "Missed: look where the LDR sits." },
        { t: "T4 reads {v} under the lamp", src: { dcv: "T4", set: LAMP }, yes: "✗ Fits: Q1 is on. But it only shows Q1 is on. T3 shows why.", no: "✓ Right to leave: T3 shows the cause, T4 only the result." },
        complaint("LED1 is on under the lamp"),
        every("T1 reads {v}", { dcv: "T1" })
      ] },
      confirm: {
        find: { prompt: "<b>Find</b> it: tap the part on the board that is wrong.", part: ["LDR", "R1"],
          right: "Found it. The LDR is in the top place, from +5 V to the base. R1 has taken its place at the bottom. They have traded places.",
          other: "Not this one. The base goes up in the light, not the dark. Look at the two parts that make the voltage divider." },
        prove: { prompt: "<b>Prove</b> it: switch off. Lift one leg of the LDR. Measure it on OHM, under the lamp.",
          a: { part: "LDR" }, b: { part: "LDR" }, set: LAMP, expect: [250, 700],
          setMsg: "Take this reading under the lamp.",
          right: "✓ About 400 Ω, not 10 kΩ: this is the LDR, in the top place. That proves it.",
          miss: "Lift one leg of the LDR for a true reading, and use a range that shows a few hundred ohms.",
          where: "For the proof, put the leads on the LDR's two legs." },
        fixed: () => "✓ Fixed. The LDR and R1 trade back. Switch on: under the lamp LED1 is off. With the cap on, LED1 lights.",
        found: "you found the LDR and R1 swapped"
      }
    }]
  };

  /* ---------------------------------------------------------- S3 */
  const SD0 = { SD: "off" }, ALL = { SD: "on", TK: "on", EN: "on" };
  J["greenhouse"] = {
    title: "Greenhouse irrigation", sub: "74HC08 AND gate board",
    should: "the pump runs only when SD (soil dry), TK (tank not empty) and EN (system on) are all on.",
    card: "Set the probe to CMOS.",
    jobs: [{
      id: "s3", level: 3,
      complaint: "The pump keeps starting and stopping on its own, even when the soil is wet.",
      predict: [
        { q: "<b>Predict:</b> on a <b>working</b> board, with SD off, what should the <b>logic probe</b> show on <b>pin 1</b> (SD's input)?", opts: [
          { t: "Lo", key: true, fb: "<b>Right.</b> With SD off, R2 (the pull-down) holds pin 1 at 0 V." },
          { t: "Hi", fb: NQ + "Pin 1 is only Hi when SD joins it to +5 V. Try again." },
          { t: "Flickering", fb: NQ + "A flicker is a floating input: neither 1 nor 0. R2 is there to stop that. Try again." },
          { t: "No lights", fb: NQ + "No lights means no level. R2 holds pin 1 at a steady 0. Try again." }
        ] },
        { q: "<b>Predict:</b> on a <b>working</b> board, with SD, TK and EN all on, what should the <b>meter</b> read on <b>T5</b> (Q1's base)?", opts: [
          { t: "About 0.7 V", key: true, fb: "<b>Right.</b> Gate b's output is Hi, so current flows through R1 into the base. Q1 is on, and its base sits about 0.7 V above the emitter." },
          { t: "About 5 V", fb: NQ + "That is gate b's output, T4, before R1. Once Q1 turns on, the base cannot rise above about 0.7 V. Try again." },
          { t: "About 0 V", fb: NQ + "At 0 V Q1 would be off and the pump would not run. With all three on, it runs. Try again." },
          { t: "Hi on the probe", fb: NQ + "T5 is not a logic signal: 0.7 V is neither 1 nor 0. That is why T5 is measured with the meter. Try again." }
        ] }
      ],
      faults: [
        { t: "R2, the pull-down on SD, has a dry joint", key: true, fb: "<b>Right.</b> With R2 open, nothing holds pin 1 when SD is off. The input floats, neither 1 nor 0. So gate a's output, and the pump, switch on and off by themselves." },
        { t: "SD is stuck on", fb: r => NT + "A stuck SD would hold pin 1 Hi: the probe would show a steady red, and the pump would run steadily. " +
          was(r, { probe: "IC1.1", set: SD0 }, "Your probe on pin 1 with SD off showed ", ".", "Probe pin 1 with SD off to check.") },
        { t: "Q1's collector has a dry joint", fb: NT + "Then the pump could never run, even with all three on. It does run." },
        { t: "A 74HC00 is fitted, not a 74HC08", fb: NT + "NAND gates would turn the logic upside down: the pump would run steadily with EN off. It would not start and stop on its own." }
      ],
      evidence: { need: 3, faultWord: "R2", items: [
        { t: "On the probe with SD off, pin 1 shows {v}", src: { probe: "IC1.1", set: SD0 }, key: true, yes: "✓ Key: pin 1 is floating. Nothing holds it at 0.", no: "Missed: the probe on pin 1 shows it is floating." },
        { t: "On the meter with SD off, pin 1 reads {v}", src: { dcv: "IC1.1", set: SD0 }, key: true, yes: "✓ A floating input wanders. A held input would read a steady 0 V.", no: "Missed: the meter on pin 1 shows it is floating." },
        { t: "R2's top joint is dull and cracked (copper side)", src: { look: "copper:A7" }, key: true, yes: "✓ Key: you have seen the fault itself.", no: "Missed: flip the board and look at R2's joints." },
        { t: "On the probe with SD off, T4 shows {v}", src: { probe: "T4", set: SD0 }, yes: "✗ Fits, but it only shows the problem reaches the output. It does not say where it starts.", no: "✓ Right to leave: pin 1 shows where it starts." },
        complaint("The pump starts and stops on its own"),
        same("T5 reads {v} with all three on", { dcv: "T5", set: ALL })
      ] },
      confirm: {
        find: { prompt: "<b>Find</b> it: tap the part or joint on the board that is wrong.", hole: "A7",
          right: "Found it. R2's joint is dull and grey, with a crack round the leg. R2 is not joined to pin 1's strip.",
          close: { part: "R2", text: "Close. R2 itself is fine. Flip the board and look at its joints." },
          other: "Not this one. Pin 1 floats when SD is off. Which part should hold it at 0?" },
        prove: { prompt: "<b>Prove</b> it: switch off. Check continuity from R2's top leg to the yellow link at A5, on the same strip.",
          a: { key: "R2.1" }, b: { seg: "R2.1" }, expect: "open",
          right: "✓ No beep: R2's leg is not joined to its strip. That proves the joint is dry.",
          where: "For the proof, put the leads on R2's top leg and A5." },
        fixed: () => "✓ Fixed. The joint is remade: shiny, and flowed onto the track. Switch on: with SD off the pump stays off. With all three on, it runs.",
        found: "you found the dry joint on R2"
      }
    }]
  };

  /* ---------------------------------------------------------- S6 */
  const ABC = (a, b, c) => ({ A: a ? "on" : "off", B: b ? "on" : "off", C: c ? "on" : "off" });
  J["lift-interlock"] = {
    title: "Lift door interlock", sub: "74HC08 AND gate board",
    should: "LED1 (motor on) lights only when A (door closed), B (floor selected) and C (not overloaded) are all on.",
    card: "Set the probe to CMOS.",
    jobs: [{
      id: "s6", level: 3,
      complaint: "The lift ran when it was overloaded.",
      predict: [
        { q: "<b>Predict:</b> on a <b>working</b> board, with A on, B on and C off, what should the <b>logic probe</b> show on <b>T4</b> (the output)?", opts: [
          { t: "Lo", key: true, fb: "<b>Right.</b> All three must be on. C is off (overloaded), so the output is 0 and the motor stays off." },
          { t: "Hi", fb: NQ + "That would let the lift run overloaded. The output needs A <b>and</b> B <b>and</b> C. Try again." },
          { t: "Hi and Lo in turn", fb: NQ + "Nothing on this board flashes. The output only changes when a switch changes. Try again." },
          { t: "No lights", fb: NQ + "A powered 74HC08 output is always Hi or Lo. Try again." }
        ] },
        { q: "<b>Predict:</b> on a <b>working</b> board, with B on and C off, what should the <b>logic probe</b> show on <b>pin 2</b> (input C)?", opts: [
          { t: "Lo", key: true, fb: "<b>Right.</b> C is off, so R3, its pull-down, holds pin 2 at 0 V. What B does makes no difference to C." },
          { t: "Hi", fb: NQ + "Pin 2 is only Hi when C joins it to +5 V. B has its own strip. Try again." },
          { t: "The same as B", fb: NQ + "B and C are separate inputs on separate strips. Try again." },
          { t: "Flickering", fb: NQ + "A flicker is a floating input. R3 holds pin 2 steady. Try again." }
        ] }
      ],
      faults: [
        { t: "A solder bridge joins the B and C strips", key: true, fb: "<b>Right.</b> The bridge joins C's input to B's. With B on, C is pulled Hi too, so the gate thinks the lift is not overloaded. With B off, both are Lo, which is why C looks fine then." },
        { t: "C is stuck on", fb: r => NT + "A stuck C would be Hi even with B off. " +
          was(r, { probe: "IC1.2", set: { B: "off", C: "off" } }, "Your probe on pin 2 with B off and C off showed ", ".", "Probe pin 2 with B off and C off: it tells these apart.") },
        { t: "A 74HC00 is fitted, not a 74HC08", fb: r => NT + "NAND gates would make T4 Lo with A on, B on and C off: the lift would not run. " +
          was(r, { probe: "T4", set: ABC(1, 1, 0) }, "Your probe on T4 showed ", ".", "Probe T4 with A on, B on and C off.") },
        { t: "The track under pin 1 is not cut", fb: NT + "That would hold B Hi, not C. With C off, the lift still would not run: T4 would be Lo. It runs." }
      ],
      evidence: { need: 3, faultWord: "the bridge", items: [
        { t: "Pin 2 (C) shows {v} with B on and C off", src: { probe: "IC1.2", set: { B: "on", C: "off" } }, key: true, yes: "✓ Key: C is off, so pin 2 should be Lo. Something pulls it up.", no: "Missed: pin 2 is Hi when C is off." },
        { t: "Pin 2 (C) shows {v} with B off and C off", src: { probe: "IC1.2", set: { B: "off", C: "off" } }, key: true, yes: "✓ C only goes wrong when B is on. That rules out C stuck on.", no: "Missed: this rules out C stuck on." },
        { t: "A solder bridge joins rows F and G (copper side)", src: { look: ["copper:F8", "copper:G8"] }, key: true, yes: "✓ Key: you have seen the fault. Row F is B's strip and row G is C's.", no: "Missed: flip the board and look between the input strips." },
        { t: "T4 shows {v} with A on, B on and C off", src: { probe: "T4", set: ABC(1, 1, 0) }, yes: "✗ Fits, but C stuck on gives this too. On its own it does not point to the bridge.", no: "✓ Right to leave: it fits other faults too." },
        complaint("The lift ran when overloaded"),
        same("Pin 1 (B) shows {v} with B on", { probe: "IC1.1", set: { B: "on" } })
      ] },
      confirm: {
        find: { prompt: "<b>Find</b> it: tap the place on the board that is wrong.", hole: ["F8", "G8"],
          right: "Found it. A solder bridge joins row F (B's strip) to row G (C's strip).",
          other: "Not this one. C follows B. Flip the board and look between their strips." },
        prove: { prompt: "<b>Prove</b> it: switch off. Check continuity from pin 1 (B) to pin 2 (C).",
          a: { key: "IC1.1" }, b: { key: "IC1.2" }, expect: "beep",
          right: "✓ Beep: the B and C inputs are joined. On a working board this reads 1. That proves it.",
          where: "For the proof, put the leads on pin 1 and pin 2." },
        fixed: () => "✓ Fixed. The bridge is cleaned off. Switch on with A on, B on and C off: T4 shows Lo and the motor stays off. This was a safety fault. The check for shorts between tracks, before you switch on, finds it.",
        found: "you found the solder bridge"
      }
    }]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
