/* ============================================================================
   Stripboard Builder — Free mode (Mode 5)
   ----------------------------------------------------------------------------
   The other four modes all have an answer to mark against.  This one does not:
   the pupil starts from a blank board and builds whatever they like, so there
   is no target netlist and nothing to compare.

   What CAN be said without a target is worth more than it sounds, and it is
   exactly the half of the job the verification reports say pupils lose marks
   on: whether the board could be built and whether it obeys the layout
   conventions.  So Free mode reports two things:

     1. WHAT IS JOINED TO WHAT — every net on the board, named, with the run of
        copper it lives on and every leg sitting in it.  This is the whole idea
        the tool teaches ("a node on the diagram is a track on the board"),
        read back off the pupil's own board.
     2. THE BUILD-QUALITY FAULTS — the target-independent half of SBD.check().

   Derive, never author twice (the rule Fault-finder and Reverse already
   follow): rather than re-implement the rules, freeCheck() hands SBD.check()
   the pupil's OWN netlist as the target.  The comparison then matches by
   construction, which silences exactly the ranks that need a target — 3 to 6
   are inside `if (!match)`, rank 7 is silenced by naming only the placed parts,
   and ranks 8/8.5/10 by having no tpRequired, no expect and nothing to compare
   a polarity against.  Everything structural still fires: the diagonal link,
   the link-colour convention, the chip laid along the tracks, the chip with no
   cuts under it, the pointless cut, the link under a body, and every placement
   error.  If a rank is ever added to check(), Free mode inherits it.

   Two rules exist only here, because they only make sense without a target:

     - `supply-short`  +5 V and 0 V on one net.  With a target this reads as a
       merge; on a free board it is the one mistake that destroys hardware, so
       it is named for what it is.
     - `chip-unpowered`  a chip whose Vcc or Gnd pin is not on the supply rail.
       In Convert the target demands those connections; here nothing does, and
       "the chip is not powered" is the single most common reason a pupil's own
       board does nothing at all.

   The chip list and every pin number in POWER_PINS is read off the National 5
   Practical Electronics data sheet (X860/75/12, 12 May 2025), pages 3 and 4 —
   the same sheet the page links to.  The palette holds those eight chips and
   no others on purpose: if it is not on the sheet, a pupil cannot look its
   pinout up, so it has no business on the board.
   ============================================================================ */
(function (root) {
  "use strict";
  const SBD = root.SBD;
  if (!SBD) throw new Error("free-mode.js must load after sbd-engine.js");

  /* --------------------------------------------------------- power pins
     Data sheet p.4: all six 74-series parts are 14-pin, Vcc 14, Gnd 7.
     p.3: the 555 is Vcc 8 / Ground 1; the 741 is V+ 7 / V− 4. */
  const LOGIC = { vcc: "14", gnd: "7", footprint: "dip-14" };
  const POWER_PINS = {
    "7400": LOGIC, "7402": LOGIC, "7404": LOGIC,
    "7408": LOGIC, "7432": LOGIC, "7486": LOGIC,
    "555": { vcc: "8", gnd: "1", footprint: "dip-8" },
    "741": { vcc: "7", gnd: "4", footprint: "dip-8" }
  };

  /* ------------------------------------------------------------ palette
     `prefix` is the item-ID stem.  Item IDs are one of the ten faults the
     course names, so they are never optional and never typed: the tool mints
     the next free number the moment a part is picked.
     Capacitors share the stem "C" whether they are polarised or not, because
     that is how a real wiring schedule numbers them. */
  const PALETTE = [
    /* Numbered, not one-per-board.  Until 21 Sep 2026 both carried
       `only: true`, so a pupil could place exactly one of each and could not
       bring a supply wire off the board at a second point — which a real
       wiring schedule needs the moment an off-board load wants its return leg.
       Bracketed (`+5V(1)`) rather than `+5V1` so the voltage still reads as a
       voltage (plan D8). */
    { key: "pos",  prefix: "+5V", bracket: true, footprint: "term-1", sub: "supply terminal",
      name: "+5 V supply", pos: true },
    { key: "neg",  prefix: "0V",  bracket: true, footprint: "term-1", sub: "supply terminal",
      name: "0 V supply", neg: true },
    /* An input or output terminal is a WIRE leaving the board, and the wiring
       schedule says what colour that wire is — so the pupil picks it here, the
       same way they pick a link wire's colour. */
    { key: "in",   prefix: "IN",  footprint: "term-1", sub: "from a switch or sensor",
      name: "input terminal", colourable: true },
    { key: "out",  prefix: "OUT", footprint: "term-1", sub: "to the next sub-system",
      name: "output terminal", colourable: true },
    { key: "res",  prefix: "R",   footprint: "res-4",  sub: "resistor", name: "resistor" },
    { key: "led",  prefix: "LED", footprint: "led-2",  sub: "5 mm LED, anode and cathode",
      name: "LED" },
    { key: "ldr",  prefix: "LDR", footprint: "ldr-2",  sub: "light-dependent resistor",
      name: "LDR", symmetric: true },
    { key: "cap",  prefix: "C",   footprint: "cap-2",  sub: "non-polarised", name: "capacitor" },
    { key: "ecap", prefix: "C",   footprint: "ecap-2", sub: "electrolytic — mind the + end",
      name: "electrolytic capacitor" },
    { key: "tr",   prefix: "Q",   footprint: "npn-can", sub: "metal can: c top, b right, e bottom",
      name: "NPN transistor (can)" },
    { key: "tr92",  prefix: "Q",  footprint: "npn-92", sub: "BC547B: flat face to you, legs c, b, e",
      name: "NPN transistor (plastic)" },
    { key: "trp",   prefix: "Q",  footprint: "pnp-can", sub: "2N2905A: c top, b right, e bottom",
      name: "PNP transistor (can)" },
    { key: "trp92", prefix: "Q",  footprint: "pnp-92", sub: "BC557B: flat face to you, legs c, b, e",
      name: "PNP transistor (plastic)" },
    { key: "fet",  prefix: "Q",   footprint: "mosfet-3", sub: "enhancement, TO-220: g, d, s",
      name: "MOSFET (n-channel)" },
    { key: "fet92", prefix: "Q",  footprint: "mosfet-92", sub: "2N7000: flat face to you, legs s, g, d",
      name: "MOSFET (n-channel, plastic)" },
    { key: "ther", prefix: "TH",  footprint: "ther-4", sub: "resistance falls as it warms",
      name: "thermistor", symmetric: true },
    { key: "dio",  prefix: "D",   footprint: "diode-4", sub: "band marks the cathode",
      name: "diode" },
    { key: "pot",  prefix: "VR",  footprint: "pot-3", sub: "3 legs: wiper is the middle pin",
      name: "potentiometer" },
    { key: "tb",   prefix: "TB",  footprint: "term-2", sub: "for an off-board part",
      name: "2-way terminal block", symmetric: true },
    { key: "7408", prefix: "IC",  footprint: "dip-14", part: "7408", sub: "quad 2-input AND",
      name: "7408" },
    { key: "7432", prefix: "IC",  footprint: "dip-14", part: "7432", sub: "quad 2-input OR",
      name: "7432" },
    { key: "7400", prefix: "IC",  footprint: "dip-14", part: "7400", sub: "quad 2-input NAND",
      name: "7400" },
    { key: "7402", prefix: "IC",  footprint: "dip-14", part: "7402", sub: "quad 2-input NOR",
      name: "7402" },
    { key: "7486", prefix: "IC",  footprint: "dip-14", part: "7486", sub: "quad 2-input XOR",
      name: "7486" },
    { key: "7404", prefix: "IC",  footprint: "dip-14", part: "7404", sub: "hex NOT (inverter)",
      name: "7404" },
    { key: "555",  prefix: "IC",  footprint: "dip-8",  part: "555",  sub: "timer",
      name: "555" },
    { key: "741",  prefix: "IC",  footprint: "dip-8",  part: "741",  sub: "op-amp",
      name: "741" },

    /* Everything the course names that is NOT soldered to the board.  A motor,
       a buzzer, a relay, a lamp: each is wired to a 2-way terminal block and
       the block is what the layout shows — which is the conversion the course
       actually asks for, and the reason they are not drawn as symbols here.
       They are separate palette entries rather than one generic block so that
       the item ID on the board says what is on the end of the wires (M1, BZ1),
       the way a wiring schedule does.
       Which of them may be wired either way round is a property of the PART,
       not of the terminal block, so `symmetric` is set one at a time: a motor
       runs backwards, a buzzer does not sound at all. */
    { key: "sw",   prefix: "SW",  footprint: "spdt-3", sub: "SPDT slide: common is the middle pin",
      name: "slide switch" },
    { key: "rly",  prefix: "RLY", footprint: "term-2", sub: "coil, off-board on a 2-way block",
      name: "relay", symmetric: true },
    { key: "mot",  prefix: "M",   footprint: "term-2", sub: "off-board, on a 2-way block",
      name: "motor", symmetric: true },
    { key: "sol",  prefix: "SOL", footprint: "term-2", sub: "off-board, on a 2-way block",
      name: "solenoid", symmetric: true },
    { key: "buz",  prefix: "BZ",  footprint: "term-2", sub: "polarised — off-board on a 2-way block",
      name: "buzzer" },
    { key: "lp",   prefix: "LP",  footprint: "term-2", sub: "off-board, on a 2-way block",
      name: "lamp", symmetric: true },
    { key: "spk",  prefix: "LS",  footprint: "term-2", sub: "off-board, on a 2-way block",
      name: "loudspeaker", symmetric: true },
    { key: "fuse", prefix: "FS",  footprint: "term-2", sub: "off-board, on a 2-way block",
      name: "fuse", symmetric: true }
  ];
  const byKey = k => PALETTE.find(p => p.key === k);

  /* The palette is written once, for both boards.  A chip is the only entry
     whose FOOTPRINT differs: on a stripboard a DIL spans the tracks, on a
     breadboard it lies along the columns with its two rows of pins either side
     of the centre channel — the same package, a different shape on the grid.
     Resolved here rather than in a second palette, so the chip list, the item
     IDs and the data-sheet pinouts cannot drift apart between the two pages. */
  function fpFor(spec, boardId) {
    const fp = spec && spec.footprint;
    if (!SBD.isBread(SBD.BOARDS[boardId]) || !/^dip-\d+$/.test(fp || "")) return fp;
    return SBD.FOOTPRINTS[fp + "-bb"] ? fp + "-bb" : fp;
  }

  /* The next free item ID for a palette entry.  Numbers are reused once a part
     comes off the board, so a pupil who places and removes a resistor six times
     is not left starting at R7. */
  function nextId(components, key) {
    const spec = byKey(key);
    if (!spec) return null;
    const used = new Set((components || []).map(c => c.id));
    if (spec.only) return used.has(spec.prefix) ? null : spec.prefix;
    const fmt = spec.bracket ? n => spec.prefix + "(" + n + ")" : n => spec.prefix + n;
    for (let n = 1; n < 100; n++) if (!used.has(fmt(n))) return fmt(n);
    return null;
  }

  // a component record in the same shape the authored questions use, so every
  // other part of the engine and the renderer treats it identically
  function mint(components, key, boardId) {
    const spec = byKey(key), id = nextId(components, key);
    if (!id) return null;
    // `key` is the palette entry it came from: the bank has to know which tile
    // to open for a part the pupil taps on the board, and deriving that back
    // from the footprint is ambiguous (four different parts are all term-1).
    const c = { id, key, footprint: fpFor(spec, boardId), name: id + " — " + spec.name };
    if (spec.part) { c.part = spec.part; c.name = id + " — " + spec.part + " " + spec.sub; }
    if (spec.pos) c.pos = true;
    if (spec.neg) c.neg = true;
    if (spec.symmetric) c.symmetric = true;
    if (spec.colourable) c.colour = spec.key === "in" ? "blue" : "green";
    return c;
  }

  function freeQ(boardId, components) {
    return {
      id: "free", board: boardId, title: "Your own board",
      components: (components || []).slice(),
      target: [], dontcare: [], tpRequired: [], expect: null, why: [],
      reference: { cuts: [], placements: [], links: [], testpoints: [] }
    };
  }

  /* ----------------------------------------------------------- net report
     Every net that has at least one leg in it, with the copper it lives on.
     A net with no legs is bare track and says nothing, so it is dropped. */
  function runsOf(holes, boardId) {
    const board = SBD.BOARDS[boardId];
    /* A breadboard net is not a run of holes along a row — it is a whole rail,
       or one five-hole column.  Naming it "C12–G12" would be arithmetically
       true and pedagogically useless: the pupil is looking at a board printed
       with a, b, c and 1 to 30, and that is what the read-back has to say. */
    if (SBD.isBread(board)) {
      const out = [], seen = new Set();
      for (const h of holes) {
        const rail = board.rails.find(x => x.r === h.r);
        const band = board.bands.findIndex(([lo, hi]) => h.r >= lo && h.r <= hi);
        const k = rail ? "rail:" + h.r : "col:" + h.c + ":" + band;
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({ row: h.r, from: h.c, to: h.c, rail: !!rail,
                   text: SBD.netName(board, h) });
      }
      // rails first, then columns left to right — the order a pupil reads them
      out.sort((a, b) => (a.rail ? 0 : 1) - (b.rail ? 0 : 1) || a.from - b.from || a.row - b.row);
      return out;
    }
    const byRow = new Map();
    for (const h of holes) {
      if (!byRow.has(h.r)) byRow.set(h.r, []);
      byRow.get(h.r).push(h.c);
    }
    const out = [];
    for (const r of [...byRow.keys()].sort((a, b) => a - b)) {
      const cs = byRow.get(r).sort((a, b) => a - b);
      let from = cs[0], prev = cs[0];
      for (let i = 1; i <= cs.length; i++) {
        if (i < cs.length && cs[i] === prev + 1) { prev = cs[i]; continue; }
        out.push({ row: r, from, to: prev,
                   text: SBD.rowLetter(r) + from + (prev === from ? "" : "–" + SBD.rowLetter(r) + prev) });
        from = prev = cs[i];
      }
    }
    return out;
  }

  function partLabel(q, pin) {
    const c = (q.components || []).find(x => x.id === pin.comp) || {};
    const fp = SBD.FOOTPRINTS[c.footprint] || {};
    if (fp.kind === "dil") return pin.comp + " pin " + pin.pin;
    if (fp.polarised) return pin.comp + " " + (pin.pin === "a" ? "anode"
                                             : pin.pin === "k" ? "cathode"
                                             : pin.pin === "+" ? "+ end" : "− end");
    if (fp.kind === "can" || fp.kind === "to92" || fp.kind === "inline3") return pin.comp + " " +
      ({ e: "emitter", b: "base", c: "collector", g: "gate", d: "drain", s: "source",
         w: "wiper", c2: "common", "1": "end 1", "2": "end 2" }[pin.pin] || pin.pin);
    if (fp.kind === "terminal" && fp.pins.length === 1) return pin.comp;
    if (fp.symmetric || c.symmetric) return pin.comp;
    return pin.comp + " " + pin.pin;
  }

  function netReport(boardId, attempt, components) {
    const board = SBD.BOARDS[boardId];
    const q = freeQ(boardId, components);
    const top = SBD.topology(board, attempt);
    if (top.errors.length) return null;

    const byRoot = new Map();
    const get = r => {
      if (!byRoot.has(r)) byRoot.set(r, { holes: [], pins: [], tps: [], pos: false, neg: false });
      return byRoot.get(r);
    };
    for (const [k, nd] of top.nodeOf)
      get(top.dsu.find(nd)).holes.push({ r: Math.floor(k / 1000), c: k % 1000 });
    for (const p of top.pins) {
      const nd = top.nodeOf.get(SBD.hid(p.hole));
      if (nd === undefined) continue;
      const n = get(top.dsu.find(nd));
      n.pins.push(p);
      const c = (components || []).find(x => x.id === p.comp) || {};
      if (c.pos) n.pos = true;
      if (c.neg) n.neg = true;
    }
    for (const t of attempt.testpoints || []) {
      const nd = top.nodeOf.get(SBD.hid(SBD.parseRef(t.at)));
      if (nd !== undefined) get(top.dsu.find(nd)).tps.push(t.id);
    }

    const nets = [];
    for (const n of byRoot.values()) {
      if (!n.pins.length) continue;
      nets.push({
        role: n.pos && n.neg ? "shorted supply" : n.pos ? "+5 V" : n.neg ? "0 V" : null,
        runs: runsOf(n.holes, boardId).map(x => x.text),
        parts: n.pins.map(p => partLabel(q, p)).sort(),
        tps: n.tps.slice().sort(),
        holes: n.holes.map(SBD.ref),
        lone: n.pins.length === 1
      });
    }
    // supply rails first, then longest net first: the interesting ones at the top
    nets.sort((a, b) => (a.role ? 0 : 1) - (b.role ? 0 : 1) || b.parts.length - a.parts.length);
    return nets;
  }

  /* --------------------------------------------------------------- check */
  function freeCheck(boardId, attempt, components) {
    const placed = new Set((attempt.placements || []).map(p => p.id));
    const comps = (components || []).filter(c => placed.has(c.id));
    const base = freeQ(boardId, comps);

    // the pupil's own netlist IS the target — see the header
    const nl = SBD.netlistOf(base, attempt);
    const q = Object.assign({}, base, { target: nl.nets || [] });
    const res = SBD.check(q, attempt);

    const faults = res.faults.slice(), warnings = res.warnings.slice();
    const nets = netReport(boardId, attempt, comps);

    const BREAD = SBD.isBread(SBD.BOARDS[boardId]);
    if (nets) {
      const posC = comps.find(c => c.pos), negC = comps.find(c => c.neg);
      const shorted = nets.find(n => n.role === "shorted supply");
      if (shorted)
        faults.push({ rank: 0.4, code: "supply-short",
          msg: "+5 V and 0 V are on the same run of copper (" + shorted.runs.join(", ") +
               ") — that is a short across the supply. " +
               (BREAD ? "Move one of them: they must never reach the same net."
                      : "Cut the track between them."),
          refs: shorted.holes.slice(0, 2) });

      if (comps.length && (!posC || !negC))
        warnings.push({ rank: 20, code: "no-supply",
          msg: "There is no " + (!posC && !negC ? "+5 V or 0 V terminal" :
               !posC ? "+5 V terminal" : "0 V terminal") + " on the board yet. " +
               "Every sub-system needs both rails before it can do anything.", refs: [] });

      /* A chip with no supply is the commonest reason an otherwise sensible
         board is dead, and nothing else on this page would say so. */
      const supplyNet = which => nets.find(n => n.role === which);
      for (const c of comps) {
        const pp = POWER_PINS[c.part];
        if (!pp) continue;
        const on = (pin, role) => {
          const net = supplyNet(role);
          if (!net) return true;                       // no rail placed: already warned
          return net.parts.indexOf(c.id + " pin " + pin) >= 0;
        };
        const miss = [];
        if (!on(pp.vcc, "+5 V")) miss.push("pin " + pp.vcc + " to +5 V");
        if (!on(pp.gnd, "0 V")) miss.push("pin " + pp.gnd + " to 0 V");
        if (miss.length)
          warnings.push({ rank: 21, code: "chip-unpowered",
            msg: c.id + " (" + c.part + ") is not powered: " + miss.join(" and ") +
                 " is missing. The data sheet says which pins those are.",
            refs: [c.id] });
      }

      /* A rail with parts on it and nothing feeding it (BB-PLAN §0, BB-4).
         The commonest dead-board question after "is the chip powered": the
         pupil has pushed six legs into the + rail and never run the jumper
         from the supply to it, so the whole rail is at nothing.  Breadboard
         only — a stripboard has no rails to leave unfed, and the supply
         terminal is soldered straight into the track it powers. */
      if (SBD.isBread(SBD.BOARDS[boardId])) {
        const board = SBD.BOARDS[boardId];
        const top = SBD.topology(board, attempt);
        const fedRoots = new Set();
        for (const pin of top.pins) {
          const c = comps.find(x => x.id === pin.comp) || {};
          if (!c.pos && !c.neg) continue;
          const nd = top.nodeOf.get(SBD.hid(pin.hole));
          if (nd !== undefined) fedRoots.add(top.dsu.find(nd));
        }
        for (const rail of board.rails) {
          const nd = top.nodeOf.get(rail.r * 1000 + 1);
          const root = top.dsu.find(nd);
          if (fedRoots.has(root)) continue;
          const users = top.pins.filter(pin => {
            const n2 = top.nodeOf.get(SBD.hid(pin.hole));
            return n2 !== undefined && top.dsu.find(n2) === root;
          });
          if (!users.length) continue;                    // an unused rail is fine
          faults.push({ rank: 0.45, code: "rail-not-fed",
            msg: SBD.rowName(board, rail.r).replace(/^the /, "The ") + " has " +
                 (users.length === 1 ? "a leg" : users.length + " legs") +
                 " in it, but nothing connects it to the supply. Run a jumper " +
                 "from the " + (rail.pol === "+" ? "+5 V" : "0 V") +
                 " terminal to it, or that whole rail is at nothing.",
            refs: users.map(pin => SBD.ref(pin.hole)).slice(0, 2) });
        }
      }

      /* --------------------------------------------- a part's two ends
         Free mode hands check() the pupil's own netlist as the target, so
         every comparison rank matches by construction — which leaves it silent
         about how many parts share a pair of nets.  Both of these were
         reported by pupils on 21 Sep 2026 and neither said anything before.

         Only 2-legged parts: for a chip or a 3-leg part "both ends" is not a
         sentence, and the wording has to stay true. */
      const top2 = SBD.topology(SBD.BOARDS[boardId], attempt);
      const rootsOf = new Map();
      for (const pin of top2.pins) {
        const nd = top2.nodeOf.get(SBD.hid(pin.hole));
        if (nd === undefined) continue;
        if (!rootsOf.has(pin.comp)) rootsOf.set(pin.comp, []);
        rootsOf.get(pin.comp).push(top2.dsu.find(nd));
      }
      const twoLeg = comps.filter(c =>
        ((SBD.FOOTPRINTS[c.footprint] || {}).pins || []).length === 2 &&
        (rootsOf.get(c.id) || []).length === 2);

      const track = BREAD ? "net" : "track";
      /* Both legs on one net: the part is shorted out and current goes round
         it, not through it.  Always a mistake, so a fault (plan D7). */
      for (const c of twoLeg) {
        const rs = rootsOf.get(c.id);
        if (rs[0] !== rs[1]) continue;
        faults.push({ rank: 0.6, code: "part-shorted",
          msg: "Both legs of " + c.id + " are on the same " + track + ", so it is " +
               "shorted out — the current goes round it, not through it. " +
               "Its two ends must be on " + (BREAD ? "different nets." : "different tracks."),
          refs: [c.id] });
      }

      /* Two or more parts sharing BOTH nets are in parallel.  Legal
         electronics and sometimes deliberate, so a warning that asks whether
         it was meant rather than a fault (plan D7). */
      const byPair = new Map();
      for (const c of twoLeg) {
        const rs = rootsOf.get(c.id);
        if (rs[0] === rs[1]) continue;                 // already a fault above
        // roots are STRINGS ("2:0"), so they sort, they do not Math.min
        const k = rs.slice().sort().join("|");
        if (!byPair.has(k)) byPair.set(k, []);
        byPair.get(k).push(c);
      }
      for (const group of byPair.values()) {
        if (group.length < 2) continue;
        const ids = group.map(c => c.id);
        const names = ids.slice(0, -1).join(", ") + " and " + ids[ids.length - 1];
        const allRes = group.every(c => c.key === "res");
        warnings.push({ rank: 19, code: "parts-parallel",
          msg: names + " are in parallel — both ends of each are on the same two " +
               (BREAD ? "nets" : "tracks") + ". " +
               (allRes
                 ? "Together they have LESS resistance than any one of them on its own. " +
                   "If you meant them in series, the join between them needs a " + track +
                   " of its own."
                 : "They see the same voltage. Check that is what you meant."),
          refs: ids });
      }

      /* Links that add nothing (24 Sep 2026).  Two links between the same two
         tracks are one wire too many, and a link with both ends on one track
         joins copper that is already joined.  Legal, so warnings.  Track
         identity is topology's nodeOf, which is the copper BEFORE any link
         merges it. */
      {
        const board = SBD.BOARDS[boardId];
        const top = SBD.topology(board, attempt);
        const trackOf = h => top.nodeOf.get(SBD.hid(SBD.parseRef(h)));
        const nm = l => SBD.holeName(board, SBD.parseRef(l.a)) + "–" + SBD.holeName(board, SBD.parseRef(l.b));
        const byTracks = new Map();
        for (const l of attempt.links || []) {
          const ta = trackOf(l.a), tb = trackOf(l.b);
          if (ta === undefined || tb === undefined) continue;   // link-in-cut, reported already
          if (ta === tb) {
            warnings.push({ rank: 12, code: "link-same-track",
              msg: "The link " + nm(l) + " has both ends on the same " + track +
                   ", so it joins copper that is already joined. It does nothing — take it off.",
              refs: [l.a, l.b] });
            continue;
          }
          const k = [ta, tb].sort().join("|");
          if (!byTracks.has(k)) byTracks.set(k, []);
          byTracks.get(k).push(l);
        }
        for (const group of byTracks.values()) {
          if (group.length < 2) continue;
          const extra = group.slice(1);
          warnings.push({ rank: 12, code: "links-parallel",
            msg: "The links " + group.map(nm).join(" and ") + " join the same two " +
                 (BREAD ? "nets" : "tracks") + ", so " +
                 (extra.length > 1 ? "all but the first are" : "the second is") +
                 " not needed. One wire does the job — take the extra one off.",
            refs: extra.reduce((r, l) => r.concat([l.a, l.b]), []) });
        }

        // two test points on one net read the same thing; the second tells you nothing new
        const tpByNet = new Map();
        for (const tp of attempt.testpoints || []) {
          const nd = trackOf(tp.at);
          if (nd === undefined) continue;
          const root = top.dsu.find(nd);
          if (!tpByNet.has(root)) tpByNet.set(root, []);
          tpByNet.get(root).push(tp);
        }
        for (const group of tpByNet.values()) {
          if (group.length < 2) continue;
          const ids = group.map(tp => tp.id);
          warnings.push({ rank: 12, code: "testpoints-same-net",
            msg: ids.slice(0, -1).join(", ") + " and " + ids[ids.length - 1] +
                 " are on the same " + (BREAD ? "net" : "run of copper") +
                 ", so they will always read the same. One test point there is enough.",
            refs: group.slice(1).map(tp => tp.at) });
        }
      }

      /* A leg on a track with nothing else on it is worth saying — a forgotten
         link wire is exactly what that looks like.  But reporting it leg by leg
         buries every other line: a 14-pin chip placed on a blank board, which
         is the FIRST thing a pupil does here, produced fourteen identical
         warnings and pushed the real ones off the panel.  So they are grouped
         by component, and a part that is not wired up at all — one the pupil
         simply has not got to yet — says so in one line instead of one per
         leg. */
      const loneBy = new Map();
      for (const n of nets) {
        if (!n.lone) continue;
        const id = String(n.parts[0]).split(" ")[0];
        if (!loneBy.has(id)) loneBy.set(id, { labels: [], holes: [] });
        loneBy.get(id).labels.push(n.parts[0]);
        loneBy.get(id).holes.push(n.holes[0]);
      }
      for (const [id, e] of loneBy) {
        const c = comps.find(x => x.id === id) || {};
        const legs = ((SBD.FOOTPRINTS[c.footprint] || {}).pins || []).length;
        // "all 1 of its legs" is not a sentence — a one-legged part (a supply
        // terminal, an input) takes the labelled branch instead
        const all = legs > 1 && e.labels.length >= legs;
        warnings.push({ rank: 22, code: "lone-pin",
          msg: all
            ? id + " is not wired up yet — all " + legs + " of its legs are " + (BREAD ? "in columns" : "on tracks") + " with " +
              "nothing else on them."
            : (e.labels.length === 1 ? e.labels[0] + " is" : e.labels.join(", ") + " are") +
              (BREAD ? " in a column with nothing else in it, so joined to nothing."
                     : " on a track with nothing else, so joined to nothing."),
          refs: e.holes.slice(0, 4) });
      }
    }

    faults.sort((x, y) => x.rank - y.rank);
    warnings.sort((x, y) => x.rank - y.rank);
    return { ok: faults.length === 0, stage: res.stage, faults, warnings, nets,
             counts: { parts: (attempt.placements || []).length,
                       cuts: (attempt.cuts || []).length,
                       links: (attempt.links || []).length,
                       tps: (attempt.testpoints || []).length,
                       nets: nets ? nets.length : 0 } };
  }

  root.SBD.free = { PALETTE, POWER_PINS, byKey, nextId, mint, fpFor, freeQ, netReport,
                    freeCheck, runsOf };

})(typeof globalThis !== "undefined" ? globalThis : this);
