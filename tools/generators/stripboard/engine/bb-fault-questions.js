/* ============================================================================
   Breadboard Builder — Fault-finder bank (added 15 Sep 2026)
   ----------------------------------------------------------------------------
   The breadboard sibling of fault-questions.js — same idea, same mechanism
   (`buildFault` from questions.js is reused unchanged): a correct reference
   board with one thing broken, and the engine's own top diagnostic is the
   answer, so this bank cannot drift from what Convert would say about the
   same board. See fault-questions.js's own header.
   ============================================================================ */
(function (root) {
  "use strict";

  const FAULT_NAMES = {
    "dil-not-straddling": "The chip is not straddling the centre channel",
    "dil-along-net":      "The chip lies along a column instead of across the channel",
    "split":              "Two things that should be joined are on different nets",
    "merged":              "Two nets that should be separate have been joined",
    "self-short":          "Both legs of one part are in the same column",
    "floating":            "A pin is alone on its net",
    "input-floating":      "A gate input has been left joined to nothing",
    "input-no-pulldown":   "A gate input has no pull-down resistor to 0 V",
    "unplaced":            "A component has been left in the bank",
    "no-testpoint":        "A test point is missing",
    "no-prediction":       "A test point has no expected reading",
    "wrong-prediction":    "A test point's expected reading is wrong",
    "reversed":            "A polarised part is fitted the wrong way round",
    "diagonal-link":       "A link wire runs diagonally",
    "colour-reused":       "Two different signals share one wire colour",
    "red-not-supply":      "A red link wire is not on the +5 V rail",
    "black-not-supply":    "A black link wire is not on the 0 V rail",
    "link-over-chip":      "A jumper runs straight across the top of a chip"
  };

  const FAULT_ITEMS = [
    { id: "BF1", from: "lift-interlock-bb",
      // moved to a clear column so the mutation does not collide with the
      // board's own wiring — the fault under test is the band, not the column
      apply: a => { const ic = a.placements.find(p => p.id === "IC1"); ic.at = "C45"; ic.rot = 0; },
      choices: ["dil-not-straddling", "dil-along-net", "split", "self-short"],
      why: "The chip has not been slid onto the centre channel — both its rows of pins are " +
           "inside the same band, so every pin is shorted to the pin opposite it. A DIL " +
           "package always straddles the channel, one row of pins in a–e and the other " +
           "in f–j." },

    { id: "BF3", from: "lift-interlock-bb",
      apply: a => { a.links = a.links.filter(l => l.a !== "I22"); },
      choices: ["split", "merged", "floating", "unplaced"],
      why: "Gate a's output and gate b's input are in different columns and nothing joins " +
           "them. Adjacent pins down one side of a chip are NOT connected to each other — " +
           "that pair needs a jumper wire." },

    { id: "BF4", from: "lift-interlock-bb",
      apply: a => { a.links.push({ a: "A30", b: "B30", colour: "purple", num: 20 }); },
      choices: ["merged", "split", "self-short", "colour-reused"],
      why: "A jumper wire has joined the +5 V rail to the 0 V rail. On a real board that is " +
           "a dead short across the supply." },

    { id: "BF5", from: "lift-interlock-bb",
      apply: a => { const r = a.placements.find(p => p.id === "R1"); r.rot = 90; },
      choices: ["self-short", "split", "reversed", "floating"],
      why: "Turned this way, both legs of the resistor land in the same five-hole column, " +
           "so the board joins them and the resistor does nothing. A part has to lie along " +
           "a row, one leg per column." },

    { id: "BF6", from: "lift-interlock-bb",
      // an extra jumper laid straight across the chip in a column nothing
      // else uses — the wiring is otherwise untouched
      apply: a => { a.links.push({ a: "C23", b: "K23", colour: "grey", num: 21 }); },
      choices: ["link-over-chip", "diagonal-link", "merged", "split"],
      why: "A jumper has been routed straight across the top of the chip instead of round " +
           "the end of it. A real jumper cannot lie flat through a DIP package — it has to " +
           "go round." },

    { id: "BF7", from: "transistor-buzzer-bb",
      apply: a => { a.placements = a.placements.filter(p => p.id !== "R1"); },
      choices: ["unplaced", "split", "floating", "no-testpoint"],
      why: "A component from the bill of materials never made it onto the board. A layout " +
           "diagram has to show every part, or whoever builds it cannot." },

    { id: "BF8", from: "lift-interlock-bb",
      apply: a => { a.links = a.links.map(l =>
                      l.a === "I22" ? { a: "I22", b: "J24", colour: l.colour, num: l.num } : l); },
      choices: ["diagonal-link", "split", "merged", "self-short"],
      why: "A jumper wire has been drawn at an angle. Jumpers run straight — along a rail, " +
           "or straight up and down between columns — so the wiring schedule can describe " +
           "them and whoever builds the board can follow them." }
  ];

  root.FAULT_NAMES = FAULT_NAMES;
  root.FAULT_ITEMS = FAULT_ITEMS;
  root.buildFault = function (item, questions, SBD) {
    const q = questions.find(x => x.id === item.from);
    if (!q) throw new Error(item.id + ": no question " + item.from);
    const attempt = JSON.parse(JSON.stringify(q.reference));
    item.apply(attempt);
    const res = SBD.check(q, attempt);
    const top = res.faults[0] || res.warnings[0] || null;
    return { item: item, q: q, attempt: attempt, res: res,
             code: top && top.code, refs: (top && top.refs) || [],
             msg: top && top.msg };
  };

})(typeof globalThis !== "undefined" ? globalThis : this);
