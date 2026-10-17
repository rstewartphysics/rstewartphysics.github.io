/* ============================================================================
   Breadboard Builder — Trace mode bank (added 15 Sep 2026)
   ----------------------------------------------------------------------------
   The breadboard sibling of trace-questions.js. Same idea, reframed for a
   breadboard: "are these two holes connected?" now turns on whether two holes
   share a five-hole column (or a whole rail row), not an unbroken track.

   Every `given` layout is the REAL reference layout of a bb-questions.js
   Convert question, reused verbatim — see that file's own header for why.
   `connected` is asserted against `SBD.sameNet()` for every item (R4's rule).
   ============================================================================ */
(function (root) {
  "use strict";

  const clone = o => JSON.parse(JSON.stringify(o));

  const ledBoard  = clone(root.QUESTIONS.find(q => q.id === "led-resistor-bb").reference);
  const liftBoard = clone(root.QUESTIONS.find(q => q.id === "lift-interlock-bb").reference);

  function item(id, title, board, given, source, a, b, connected, why) {
    return { id, title, board, given, source, a, b, connected, why };
  }

  root.TRACE_QUESTIONS = [
    item("bb-trace-1", "Same column", "bb-400", ledBoard, "led-resistor-bb", "C5", "D5", true,
      "C5 and D5 are both in column 5, band a–e — the five holes down one column, " +
      "inside one band, are joined together on every breadboard. This is R1's own leg " +
      "and the jumper that ties the +5 V rail to it."),

    item("bb-trace-2", "A resistor's own two legs", "bb-400", ledBoard, "led-resistor-bb", "C5", "C8", false,
      "R1's legs sit in columns 5 and 8. A component only joins what its legs are wired " +
      "to elsewhere on the board — its own body never joins two columns by itself."),

    item("bb-trace-3", "Through a jumper", "bb-400", ledBoard, "led-resistor-bb", "C8", "C12", true,
      "C8 (R1's far leg) and C12 (LED1's anode) are in different columns. But D8 sits in " +
      "column 8's own five-hole band, jumper wire ② runs from D8 to D12, and D12 sits " +
      "in column 12's band — so the connection makes it across in three hops."),

    item("bb-trace-4", "The two supply rails", "bb-400", ledBoard, "led-resistor-bb", "A2", "B2", false,
      "+5 V (row A, the top + rail) and 0 V (row B, the top − rail) are two separate " +
      "strips of copper with nothing linking them — exactly as they must be. If they were " +
      "one net, R1 and LED1 would be shorted straight across the supply."),

    item("bb-trace-5", "The chip's own pin, through a jumper", "bb-830", liftBoard, "lift-interlock-bb", "G20", "D20", true,
      "G20 is IC1 pin 14. D20 is a free hole in the SAME column, band a–e — the five " +
      "holes down column 20 are already one net before any jumper is added, and jumper " +
      "① then carries that net out to the +5 V rail."),

    item("bb-trace-6", "Either side of the channel", "bb-830", liftBoard, "lift-interlock-bb", "G20", "H20", false,
      "G20 (pin 14, band a–e) and H20 (pin 1, band f–j) sit either side of the centre " +
      "channel. The channel has no holes in it, so the two bands are never joined by the " +
      "board itself — a chip straddles it precisely because its two rows of pins must stay " +
      "apart."),

    item("bb-trace-7", "Two separate inputs", "bb-830", liftBoard, "lift-interlock-bb", "I20", "I24", false,
      "Input A (column 20) and input C (column 24) are in different columns with nothing " +
      "joining them — exactly as they should be. They are two independent signals into two " +
      "different gates of IC1."),

    item("bb-trace-8", "Through a jumper, between two pins", "bb-830", liftBoard, "lift-interlock-bb", "H22", "H23", true,
      "H22 (gate a's output, pin 3) and H23 (gate b's input, pin 4) are in different " +
      "columns. But I22 shares pin 3's column, jumper ③ runs from I22 to I23, and I23 " +
      "shares pin 4's column — so the connection makes it across in three hops, exactly " +
      "the same idea as item 3.")
  ];

})(typeof globalThis !== "undefined" ? globalThis : this);
