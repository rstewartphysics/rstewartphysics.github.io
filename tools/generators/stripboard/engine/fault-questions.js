/* ============================================================================
   Stripboard Builder — Fault-finder bank (PLAN.md §4.1, Mode 3)
   ----------------------------------------------------------------------------
   Every item is a CORRECT reference board with one thing broken.  The board,
   the fault type and the places to ring are all derived by running the engine
   over the mutated board — there is no second answer key, so a Fault-finder
   item cannot drift from what Convert would say about the same board.  That is
   the same reasoning as `reference` being asserted against `target` (R4), and
   it is why this mode costs almost no new content (§13.4).

   Only `apply` and the four choices are authored.  Everything a pupil is
   marked against comes from `SBD.check()`.
   ============================================================================ */
(function (root) {
  "use strict";

  /* The pupil-facing catalogue: an engine code and the words for it.  Kept
     here rather than on the page so the tests read the same list. */
  const FAULT_NAMES = {
    "dil-uncut":        "The tracks under the chip have not been cut",
    "dil-along-tracks": "The chip lies along the tracks instead of across them",
    "split":            "Two things that should be joined are on different tracks",
    "merged":           "Two nets that should be separate have been joined",
    "self-short":       "Both legs of one part are in the same track",
    "floating":         "A pin is alone on its track",
    "input-floating":   "A gate input has been left joined to nothing",
    "input-no-pulldown": "A gate input has no pull-down resistor to 0 V",
    "unplaced":         "A component has been left in the bank",
    "no-testpoint":     "A test point is missing",
    "no-prediction":    "A test point has no expected reading",
    "wrong-prediction": "A test point's expected reading is wrong",
    "reversed":         "A polarised part is fitted the wrong way round",
    "diagonal-link":    "A link wire runs diagonally",
    "colour-reused":    "Two different signals share one wire colour",
    "red-not-supply":   "A red link wire is not on the +5 V rail",
    "black-not-supply": "A black link wire is not on the 0 V rail",
    "pointless-cut":    "A cut that separates nothing"
  };

  /* `choices` are authored, not generated: a distractor is only worth offering
     if it is a mistake a pupil could actually believe, and picking those is a
     judgement the code cannot make. */
  const FAULT_ITEMS = [
    /* The missing cut is F11, not H11: track H's right-hand half now carries
       spare pin 12, which is tied to 0 V, so joining the two halves would put
       the gate a -> gate b link on the 0 V rail and the link-colour rule would
       be the loudest fault on the board rather than the missing cut. */
    { id: "FF1", from: "lift-interlock",
      apply: a => { a.cuts = a.cuts.filter(c => c !== "F11"); },
      choices: ["dil-uncut", "dil-along-tracks", "split", "self-short"],
      why: "One track under the chip was never cut, so the two pins facing each other " +
           "across it are still joined by copper. Every track the package crosses has to " +
           "be cut between the two rows of pins — this is the single most common fault " +
           "the verification reports pick up." },

    { id: "FF2", from: "lift-interlock",
      apply: a => { a.cuts = ["I7"]; a.placements.find(p => p.id === "IC1").rot = 90; },
      choices: ["dil-along-tracks", "dil-uncut", "merged", "floating"],
      why: "The chip has been laid ALONG a track, so all seven pins down one side share " +
           "one piece of copper and are shorted together. A DIL package always sits " +
           "across the tracks." },

    { id: "FF3", from: "lift-interlock",
      apply: a => { a.links = a.links.filter(l => l.a !== "H9"); },
      choices: ["split", "merged", "floating", "unplaced"],
      why: "Gate a's output and gate b's input are on different tracks and nothing joins " +
           "them. Adjacent pins down one side of a chip are NOT connected to each other — " +
           "that pair needs a link wire." },

    { id: "FF4", from: "lift-interlock",
      // straight, not diagonal: a diagonal link is its own (higher-ranked) fault,
      // and this item is about the short, not the routing
      apply: a => { a.links.push({ a: "F21", b: "O21", colour: "purple", num: 9 }); },
      choices: ["merged", "split", "self-short", "pointless-cut"],
      why: "A link wire has joined the +5 V rail to the 0 V rail. On a real board that is " +
           "a dead short across the supply." },

    { id: "FF5", from: "lift-interlock",
      apply: a => { const r = a.placements.find(p => p.id === "R1");
                    r.rot = 0; r.at = "B3"; },
      choices: ["self-short", "split", "reversed", "floating"],
      why: "Both legs of the resistor have landed in the same track, so the copper joins " +
           "them and the resistor does nothing. A part has to sit ACROSS the tracks, or " +
           "have a cut between its legs." },

    { id: "FF6", from: "lift-interlock",
      /* An extra cut in the wrong place, isolating pin 7 while the rest of the
         0 V net stays joined — which is what "floating" means.  Moving a
         terminal instead only ever splits a two-pin net, and rank 5 reports
         that as "split". */
      apply: a => { a.cuts.push("L9"); },
      choices: ["floating", "split", "unplaced", "merged"],
      why: "There is a cut in the wrong place. It has sliced the 0 V track between the " +
           "chip's pin 7 and the rest of the 0 V net, leaving that pin on a stub of copper " +
           "with nothing else on it. The rest of the 0 V net is still fine, which is what " +
           "makes this one hard to spot." },

    { id: "FF7", from: "two-inverters",
      apply: a => { a.placements = a.placements.filter(p => p.id !== "LED2"); },
      choices: ["unplaced", "split", "floating", "no-testpoint"],
      why: "A component from the bill of materials never made it onto the board. A layout " +
           "diagram has to show every part, or whoever builds it cannot." },

    { id: "FF8", from: "greenhouse-irrigation",
      apply: a => { a.testpoints = []; },
      choices: ["no-testpoint", "no-prediction", "unplaced", "floating"],
      why: "The layout has no test point on the process output. Qualifications Scotland: each sub-system input " +
           "and output needs an appropriate test point, planned on the layout before the " +
           "board is built — not added afterwards." },

    { id: "FF9", from: "lift-interlock",
      apply: a => { a.links = a.links.map(l =>
                      l.a === "H9" ? { a: "H9", b: "I8", colour: l.colour, num: l.num } : l); },
      choices: ["diagonal-link", "split", "merged", "self-short"],
      why: "A link wire has been drawn at an angle. Link wires run straight — along a track " +
           "or straight down between tracks — so that the wiring schedule can describe them " +
           "and whoever builds the board can follow them." },

    /* Two SIGNAL links share a colour. It has to be two signal links: recolouring
       a supply link is a different fault now (a link on a rail must carry that
       rail's colour), and lift-interlock has only one non-supply link, so this
       item moved to the comparator, which has two. */
    { id: "FF10", from: "frost-comparator",
      apply: a => { a.links = a.links.map(l =>
                      l.a === "K7" ? Object.assign({}, l, { colour: "blue" }) : l); },
      choices: ["colour-reused", "red-not-supply", "split", "merged"],
      why: "Two link wires are the same colour but they carry different signals. Qualifications Scotland: " +
           "there should be different colours for different signals, and every wire " +
           "coloured AND numbered." }
  ];

  /* Build one item: mutate, run the engine, and take its own top diagnostic as
     the answer.  `refs` is what gets ringed on reveal. */
  function buildFault(item, questions, SBD) {
    const q = questions.find(x => x.id === item.from);
    if (!q) throw new Error(item.id + ": no question " + item.from);
    const attempt = JSON.parse(JSON.stringify(q.reference));
    item.apply(attempt);
    const res = SBD.check(q, attempt);
    const top = res.faults[0] || res.warnings[0] || null;
    return { item: item, q: q, attempt: attempt, res: res,
             code: top && top.code, refs: (top && top.refs) || [],
             msg: top && top.msg };
  }

  root.FAULT_NAMES = FAULT_NAMES;
  root.FAULT_ITEMS = FAULT_ITEMS;
  root.buildFault = buildFault;

})(typeof globalThis !== "undefined" ? globalThis : this);
