/* ============================================================================
   Stripboard Builder — Reverse bank (PLAN.md §4.1, Mode 4)
   ----------------------------------------------------------------------------
   Layout -> circuit: the direction CR25 singles out ("tasks converting from
   layout to diagram require structured practice... start with simple circuits
   and gradually increase complexity").  PLAN.md rules out a schematic editor,
   so the items are structured questions ABOUT a finished board.

   Three types, all of them DERIVED from the question record — the board is a
   `reference` layout, and every answer is read out of `target` or out of the
   engine's own connectivity.  Nothing is authored twice, so a Reverse item
   cannot disagree with what Convert marks on the same board.

     probe   tap the two holes you would measure across a component
             (2025 Q7(b)(i) is exactly this)
     rail    which components are connected to a supply rail
     signal  which pin of the chip does this input actually reach

   NOT built: PLAN's "which of these four circuit diagrams matches this board".
   Three wrong diagrams per item is a large hand-drawing job with no automatic
   correctness check — R5's manual gate, multiplied by three, for every item.
   The three types above test the same reading of the copper and cost nothing
   to keep true.  Recorded here rather than quietly dropped.
   ============================================================================ */
(function (root) {
  "use strict";

  const REVERSE_ITEMS = [
    { id: "RV1", type: "probe", from: "led-resistor", part: "R1",
      why: "The p.d. across a component is measured between the two nets its legs sit " +
           "in — one probe on each side. On the board that means one probe anywhere on " +
           "the track the first leg is in, and the other anywhere on the second leg's " +
           "track. Both probes on one track would read zero, because that is one net." },

    { id: "RV2", type: "probe", from: "led-resistor", part: "LED1",
      why: "Same idea for the LED: one probe on the anode's track, one on the cathode's. " +
           "A working red LED reads about 2 V across it, and the rest of the supply is " +
           "dropped across the resistor." },

    { id: "RV3", type: "rail", from: "led-resistor", rail: "0V",
      why: "Follow the copper from the 0 V terminal: an unbroken track is one net, so " +
           "everything with a leg in it is connected to 0 V." },

    { id: "RV4", type: "signal", from: "lift-interlock", term: "A",
      why: "Input A's track runs straight into the chip. Reading which pin it lands on " +
           "is the whole of layout-to-circuit: the copper says which gate input this is." },

    { id: "RV5", type: "probe", from: "lift-interlock", part: "R1",
      why: "R1 sits between the chip's output and the LED. Measuring across it tells you " +
           "whether the gate output is actually driving the LED, which is why the test " +
           "point goes on that net." },

    { id: "RV6", type: "rail", from: "lift-interlock", rail: "0V",
      why: "The 0 V net on this board reaches more than one thing, and one of them is a " +
           "chip pin. Every IC needs 0 V, and on the layout that is just another leg in " +
           "the same track." },

    { id: "RV7", type: "signal", from: "lift-interlock", term: "C",
      why: "Input C skips the first gate entirely and goes to the SECOND one. That is what " +
           "makes this a 3-input AND built from two 2-input gates — and it is the thing " +
           "that is invisible unless you follow the copper." },

    { id: "RV8", type: "rail", from: "lift-interlock", rail: "+5V",
      why: "The +5 V net on this board does only one job: it feeds the chip's supply pin. " +
           "Nothing else on the board is connected to it." },

    { id: "RV9", type: "probe", from: "transistor-buzzer", part: "R1",
      why: "R1 is the transistor's base resistor. Measuring across it shows how much of " +
           "the switch's voltage is being dropped before the base." },

    { id: "RV10", type: "signal", from: "two-inverters", term: "S2",
      why: "Two unrelated signals share one package here. S2 does NOT go to the first " +
           "inverter — following the copper is the only way to tell which of the six " +
           "gates it actually reaches." }
  ];

  /* ------------------------------------------------------------------ derive */

  function holeOfPin(attempt, pinId, SBD) {
    const bits = pinId.split("."), comp = bits[0], pin = bits[1];
    const pl = (attempt.placements || []).find(p => p.id === comp);
    if (!pl) return null;
    const cells = SBD.cellsOf(SBD.FOOTPRINTS[pl.footprint], SBD.parseRef(pl.at), pl.rot || 0);
    const z = cells.pins.find(x => x.pin === pin);
    return z ? SBD.ref(z.hole) : null;
  }

  // the target net that contains a given pin
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
      // a reference board must never short a part's own legs
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
      /* Distractors are the chip's other SIGNAL pins.  Taking them in target
         order handed every item the two supply pins, which a pupil rules out
         without reading the board at all — so the supply nets are excluded. */
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
      // sorted by pin number, so the answer is not always the first button
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
