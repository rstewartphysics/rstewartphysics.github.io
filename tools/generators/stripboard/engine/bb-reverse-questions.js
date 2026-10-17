/* ============================================================================
   Breadboard Builder — Reverse bank (added 15 Sep 2026)
   ----------------------------------------------------------------------------
   The breadboard sibling of reverse-questions.js — same three types (probe,
   rail, signal), same derivation (`buildReverse` from reverse-questions.js is
   reused unchanged): every answer is read out of `target` or the engine's own
   connectivity, never authored twice. See reverse-questions.js's own header.
   ============================================================================ */
(function (root) {
  "use strict";

  const REVERSE_ITEMS = [
    { id: "bb-RV1", type: "probe", from: "led-resistor-bb", part: "R1",
      why: "The p.d. across a component is measured between the two nets its legs sit " +
           "in — one probe anywhere in the column the first leg is in, and the other " +
           "anywhere in the second leg's column. Both probes in one column would read " +
           "zero, because that is one net." },

    { id: "bb-RV2", type: "probe", from: "led-resistor-bb", part: "LED1",
      why: "Same idea for the LED: one probe on the anode's column, one on the cathode's. " +
           "A working red LED reads about 2 V across it, and the rest of the supply is " +
           "dropped across the resistor." },

    { id: "bb-RV3", type: "rail", from: "led-resistor-bb", rail: "0V",
      why: "Follow the copper from the 0 V terminal: everything sharing its column, or " +
           "reached from it by a jumper, is connected to 0 V." },

    { id: "bb-RV4", type: "signal", from: "lift-interlock-bb", term: "A",
      why: "Input A's column runs straight into the chip. Reading which pin it lands on " +
           "is the whole of layout-to-circuit: the board says which gate input this is." },

    { id: "bb-RV5", type: "probe", from: "lift-interlock-bb", part: "R1",
      why: "R1 sits between the chip's output and the LED. Measuring across it tells you " +
           "whether the gate output is actually driving the LED, which is why the test " +
           "point goes on that net." },

    { id: "bb-RV6", type: "rail", from: "lift-interlock-bb", rail: "0V",
      why: "The 0 V net on this board reaches more than one thing, and one of them is a " +
           "chip pin. Every IC needs 0 V, and on the layout that is just another leg " +
           "sharing the net." },

    { id: "bb-RV7", type: "signal", from: "lift-interlock-bb", term: "C",
      why: "Input C skips the first gate entirely and goes to the SECOND one. That is what " +
           "makes this a 3-input AND built from two 2-input gates — and it is invisible " +
           "unless you follow the board." },

    { id: "bb-RV8", type: "rail", from: "lift-interlock-bb", rail: "+5V",
      why: "The +5 V net on this board does only one job: it feeds the chip's supply pin. " +
           "Nothing else on the board is connected to it." },

    { id: "bb-RV9", type: "probe", from: "transistor-buzzer-bb", part: "R1",
      why: "R1 is the transistor's base resistor. Measuring across it shows how much of " +
           "the switch's voltage is being dropped before the base." },

    { id: "bb-RV10", type: "signal", from: "lift-interlock-bb", term: "B",
      why: "Input B reaches gate a's SECOND input — the same gate as input A, not gate b. " +
           "Two of the three inputs share one gate; the third drives the other gate alone, " +
           "and only the board shows which is which." }
  ];

  /* ------------------------------------------------------------------ derive
     Identical to reverse-questions.js's own — board-agnostic, so reused
     unchanged rather than copied with a find-and-replace that could drift. */

  function holeOfPin(attempt, pinId, SBD) {
    const bits = pinId.split("."), comp = bits[0], pin = bits[1];
    const pl = (attempt.placements || []).find(p => p.id === comp);
    if (!pl) return null;
    const cells = SBD.cellsOf(SBD.FOOTPRINTS[pl.footprint], SBD.parseRef(pl.at), pl.rot || 0);
    const z = cells.pins.find(x => x.pin === pin);
    return z ? SBD.ref(z.hole) : null;
  }

  const netWith = (q, pinId) => (q.target || []).find(net => net.indexOf(pinId) >= 0) || [];

  function buildReverse(item, questions, SBD) {
    const q = questions.find(x => x.id === item.from);
    if (!q) throw new Error(item.id + ": no question " + item.from);
    const attempt = q.reference, board = SBD.BOARDS[q.board];
    const out = { item: item, q: q, attempt: attempt, type: item.type };

    if (item.type === "probe") {
      const fp = SBD.FOOTPRINTS[(q.components.find(c => c.id === item.part) || {}).footprint];
      if (!fp || fp.pins.length !== 2)
        throw new Error(item.id + ": " + item.part + " is not a two-pin part");
      out.pins = fp.pins.map(p => item.part + "." + p.pin);
      out.nets = out.pins.map(pid => {
        const h = holeOfPin(attempt, pid, SBD);
        if (!h) throw new Error(item.id + ": " + pid + " is not on the board");
        return SBD.netOf(board, attempt, h) || [];
      });
      if (!out.nets[0].length || !out.nets[1].length)
        throw new Error(item.id + ": a leg of " + item.part + " is in no net");
      if (out.nets[0].indexOf(out.nets[1][0]) >= 0)
        throw new Error(item.id + ": both legs of " + item.part + " are in one net");
      out.prompt = "Where would you put the two meter probes to measure the p.d. across " +
                   item.part + "?";

    } else if (item.type === "rail") {
      const railNet = netWith(q, item.rail + ".1");
      out.answer = [];
      for (const pin of railNet) {
        const comp = pin.split(".")[0];
        if (comp !== item.rail && out.answer.indexOf(comp) < 0) out.answer.push(comp);
      }
      out.options = q.components.map(c => c.id).filter(id => id !== item.rail);
      out.prompt = "Which of these are connected to the " +
                   (item.rail === "+5V" ? "+5 V" : "0 V") + " rail on this board?";

    } else if (item.type === "signal") {
      const net = netWith(q, item.term + ".1");
      const pin = net.find(p => /^IC\d+\./.test(p));
      if (!pin) throw new Error(item.id + ": " + item.term + " reaches no chip pin");
      out.answer = pin;
      const chip = pin.split(".")[0];
      const supply = new Set();
      for (const c of q.components || []) {
        if (!c.pos && !c.neg) continue;
        for (const p of netWith(q, c.id + ".1")) supply.add(p);
      }
      const pool = [];
      for (const net of q.target) for (const p of net) {
        if (p.split(".")[0] !== chip) continue;
        if (p === pin || supply.has(p) || pool.indexOf(p) >= 0) continue;
        pool.push(p);
      }
      out.options = [pin].concat(pool.slice(0, 3))
        .sort((a, b) => (+a.split(".")[1]) - (+b.split(".")[1]));
      out.prompt = "Follow the copper: which pin of " + chip + " does input " +
                   item.term + " reach?";
    } else {
      throw new Error(item.id + ": unknown type " + item.type);
    }
    return out;
  }

  root.REVERSE_ITEMS = REVERSE_ITEMS;
  root.buildReverse = buildReverse;

})(typeof globalThis !== "undefined" ? globalThis : this);
