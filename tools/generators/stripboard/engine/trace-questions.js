/* ============================================================================
   Stripboard Builder — Trace mode bank  (PLAN.md §4.1, Mode 1)
   ----------------------------------------------------------------------------
   "Are these two holes connected?" — the single idea the other three modes
   rest on: a node on the circuit diagram is a copper track on the board, and a
   cut splits it in two.

   Every `given` layout below is the REAL reference layout of a Convert
   question (led-resistor, lift-interlock), reused verbatim rather than
   re-authored — a second hand-drawn copy of the same board is exactly the kind
   of thing that drifts.  Item 8 is the one deliberate exception: it clones
   lift-interlock's layout with one cut removed, to show the fault that cut
   prevents.

   `connected` is the claim; the golden test in tests.js asserts it against
   `SBD.sameNet()` for every item, so a wrong answer here fails the harness
   before it ever reaches a pupil (R4's rule, applied to this bank too).
   ============================================================================ */
(function (root) {
  "use strict";

  const clone = o => JSON.parse(JSON.stringify(o));

  const smallBoard = clone(root.QUESTIONS.find(q => q.id === "led-resistor").reference);
  const liftBoard  = clone(root.QUESTIONS.find(q => q.id === "lift-interlock").reference);

  // same board, minus the one cut that keeps IC1 pin 1 apart from pin 14 —
  // item 8's whole point is that removing it shorts the two together
  const liftUncutRow = clone(liftBoard);
  liftUncutRow.cuts = liftUncutRow.cuts.filter(c => c !== "F11");

  // `source` names the Convert question whose `components` the page borrows
  // for drawing (item IDs, part numbers) — never copied, only looked up, so a
  // renamed footprint or relabelled component cannot go stale here.
  function item(id, title, board, given, source, a, b, connected, why) {
    return { id, title, board, given, source, a, b, connected, why };
  }

  root.TRACE_QUESTIONS = [
    item("trace-1", "Same track", "34-0410", smallBoard, "led-resistor", "A2", "A5", true,
      "A2 and A5 are both on track A, and nothing cuts track A between them — " +
      "every hole on an unbroken track is the same node."),

    item("trace-2", "A resistor's own two legs", "34-0410", smallBoard, "led-resistor", "A5", "D5", false,
      "R1's legs sit in tracks A and D. A component only joins what its legs " +
      "are wired to elsewhere on the board — its own body never joins two " +
      "tracks by itself."),

    item("trace-3", "Same track, further along", "34-0410", smallBoard, "led-resistor", "E2", "E8", true,
      "E2 and E8 are both on track E, with no cut anywhere between them — the " +
      "whole 0 V rail, from the supply terminal to the LED's cathode, is one " +
      "piece of copper."),

    item("trace-4", "An LED's own two legs", "34-0410", smallBoard, "led-resistor", "D8", "E8", false,
      "LED1's anode and cathode sit in tracks D and E. Like the resistor, the " +
      "component itself is what joins them electrically — the copper does not."),

    item("trace-5", "The two supply rails", "34-0410", smallBoard, "led-resistor", "A2", "E2", false,
      "+5 V (track A) and 0 V (track E) are on different tracks with nothing " +
      "linking them — exactly as they must be. If they were the same node, " +
      "R1 and LED1 would be shorted out."),

    item("trace-6", "One cut, one column", "34-0411", liftBoard, "lift-interlock", "K3", "K10", true,
      "Track K has one cut, at column 11. Everything to its LEFT — columns 1 " +
      "to 10 — is still one piece of copper, so a hole at column 3 and a hole " +
      "at column 10 are the same node. This is IC1 pin 6 joined to R1's pin 1, " +
      "exactly as the circuit needs."),

    item("trace-7", "Either side of the chip's cut", "34-0411", liftBoard, "lift-interlock", "F10", "F13", false,
      "IC1 pin 1 (F10) and pin 14 (F13) are on the same row, but the cut at " +
      "F11 sits between them — that is exactly what stops the chip's two " +
      "sides shorting together."),

    item("trace-8", "The same chip, before it's cut", "34-0411", liftUncutRow, "lift-interlock", "F10", "F13", true,
      "Take away that one cut and pin 1 and pin 14 become the same node — " +
      "input A shorted straight to the +5 V rail. This is the fault Convert " +
      "mode reports as “IC1 pin 1 and IC1 pin 14 are on the same track”. " +
      "One missing cut is enough to cause it."),

    item("trace-9", "Through a link wire", "34-0411", liftBoard, "lift-interlock", "H10", "I10", true,
      "H10 (gate a's pin 3) and I10 (gate b's pin 4) are on different tracks. " +
      "But H9 sits on the same unbroken run of track H as H10, link wire ① " +
      "joins H9 to I9, and I9 sits on the same unbroken run of track I as I10 " +
      "— so the connection makes it across in three hops."),

    item("trace-10", "Two separate inputs", "34-0411", liftBoard, "lift-interlock", "F2", "J2", false,
      "Input A (F2) and input C (J2) are on different tracks with no link " +
      "between them — exactly as they should be. They are two independent " +
      "signals into two different gates of IC1.")
  ];

})(typeof globalThis !== "undefined" ? globalThis : this);
