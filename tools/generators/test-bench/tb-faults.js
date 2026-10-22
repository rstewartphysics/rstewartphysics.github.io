/* ============================================================================
   Test bench — faults as edits to the layout, and the scenario registry
   ----------------------------------------------------------------------------
   A fault is never a table of readings. It is a short list of edits to the good
   board — a link moved one row, a joint left dry, an LED turned round, the
   wrong resistor fitted — and the solver works out every reading from the
   edited board (BENCH-PLAN §1). The same edits tell the renderer what to draw.

   Edits:
     { link: "A8", to: "B8" }      the link with an end in A8 has that end in B8
     { dry: "R2.1" }               a dry joint on a leg ("link@A8" for a link end)
     { turn: "LED1" }              the part turned round (180°)
     { value: "R4", to: 270e3 }    a part of the wrong value (bands / print follow)
     { short: "C1" }               a part shorted inside
     { bridge: ["F3", "G3"] }      a solder bridge between two holes' strips
     { uncut: "F14" }              a track cut that was never made
     { chip: "IC1", to: "hc00" }   the wrong chip fitted (same pins, wrong gates)
     { stuck: "SW1", at: "2" }     a slide switch stuck at one pin
     { open: "SW1" }               a switch whose contacts never meet
     { place: "R1", at: "E8", rot: 90 }  a part fitted somewhere else
   ============================================================================ */
(function (root) {
  "use strict";
  const TB = root.TB = root.TB || {};
  const clone = o => JSON.parse(JSON.stringify(o));

  const EDIT = {
    link(F, e) {
      const l = F.layout.links.find(k => k.a === e.link || k.b === e.link);
      if (!l) throw new Error("fault edit: no link ends in " + e.link);
      if (l.a === e.link) l.a = e.to; else l.b = e.to;
    },
    dry(F, e) { F.dry.add(e.dry); },
    turn(F, e) {
      const p = F.layout.placements.find(k => k.id === e.turn);
      if (!p) throw new Error("fault edit: no part " + e.turn);
      p.rot = ((p.rot || 0) + 180) % 360;
    },
    value(F, e) {
      if (!(e.value in F.values)) throw new Error("fault edit: no part " + e.value);
      F.values[e.value] = e.to;
    },
    short(F, e) { F.shorted.add(e.short); },
    bridge(F, e) { F.bridges.push(e.bridge.slice()); },
    uncut(F, e) { F.layout.cuts = F.layout.cuts.filter(c => c !== e.uncut); },
    chip(F, e) {
      if (!TB.parts.PARTS[e.to]) throw new Error("fault edit: no chip " + e.to);
      F.models[e.chip] = e.to;
    },
    stuck(F, e) { F.stuck[e.stuck] = e.at; },
    open(F, e) { F.opened.add(e.open); },
    place(F, e) {
      const p = F.layout.placements.find(k => k.id === e.place);
      if (!p) throw new Error("fault edit: no part " + e.place);
      p.at = e.at; p.rot = e.rot || 0;
    }
  };
  const kindOf = e => Object.keys(EDIT).find(k => k in e);

  /* The board for one fault: the edited layout, the parts' printed values, the
     dry joints, bridges and shorted parts, and what each resistor's bands and
     each capacitor's print now say (for drawing). */
  function apply(sc, id) {
    const F = { id, layout: clone(sc.layout), values: {}, models: {}, dry: new Set(), bridges: [], shorted: new Set(),
                stuck: {}, opened: new Set(), edits: [] };
    for (const [pid, p] of Object.entries(sc.parts)) F.values[pid] = p.value;
    if (id && id !== "good") {
      const f = sc.faults[id] || (sc.distractors || {})[id];
      if (!f) throw new Error("test bench: " + sc.id + " has no fault " + id);
      for (const e of f.edits) {
        const k = kindOf(e);
        if (!k) throw new Error("fault edit: unknown " + JSON.stringify(e));
        EDIT[k](F, e);
        F.edits.push(Object.assign({ kind: k }, e));
      }
    }
    F.bands = {}; F.printed = {};
    for (const [pid, p] of Object.entries(sc.parts)) {
      if (p.model === "res") F.bands[pid] = TB.parts.bandsOf(F.values[pid]);
      if (p.model === "ecap") F.printed[pid] = TB.parts.faradsText(F.values[pid]);
      const chip = TB.parts.CHIP_PRINT[F.models[pid] || p.model];
      if (chip) F.printed[pid] = chip;
    }
    return F;
  }

  /* The engine's own netlist check on a fault board: the good board passes,
     and a fault that changes the wiring fails. (A wrong value, a dry joint or a
     shorted part does not change the wiring, so the engine cannot see it.) */
  function wiringCheck(sc, F) {
    const S = root.SBD, q = Object.assign({}, sc.question, { board: F.layout.board });
    const att = { cuts: F.layout.cuts, placements: F.layout.placements, links: F.layout.links };
    return S.check(q, att);
  }

  TB.SCENARIOS = TB.SCENARIOS || {};
  /* TB.scenario({ id, parts, supply, ground, supplyTP, faults, distractors,
     readings, expect, keys, distinct }). The layout and circuit diagram come
     from TB.LAYOUTS[id], written into the bundle from tools/build-guides/circuits.mjs. */
  TB.scenario = function (def) {
    const L = (TB.LAYOUTS || {})[def.id];
    if (!L) throw new Error("test bench: no layout for " + def.id);
    def.layout = L.layout;
    def.question = L.question;
    def.diagram = L.diagram;
    TB.SCENARIOS[def.id] = def;
    return def;
  };

  TB.faults = { apply, wiringCheck, EDIT };

})(typeof globalThis !== "undefined" ? globalThis : this);
