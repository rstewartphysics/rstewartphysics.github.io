/* ============================================================================
   Stripboard Builder — netlist engine
   ----------------------------------------------------------------------------
   Reads the copper and works out which pins are electrically joined, then
   compares that against the question's target netlist.  Any electrically valid
   layout passes; the picture does not have to match anyone's.

   Axioms (PLAN.md §12.1) — the renderer must agree with every one of these:
     A1  tracks are ROWS and run horizontally
     A2  a cut is an X ON a hole; that hole dies and the track splits either side
     A3  rows are lettered from A, columns numbered from 1  ->  "H12"
     A4  a pin occupies exactly one hole
     A5  a body may cover holes it does not connect to; nothing else goes there
     A6  a link wire joins two holes and nothing between them
     A7  a DIL spans one track per pin-pair, rows 3 columns apart
     A8  two pins in one hole is a placement error, not a short

   Runs under JavaScriptCore and in the browser.  No dependencies.
   ============================================================================ */
(function (root) {
  "use strict";

  /* ---------------------------------------------------------------- boards */

  /* A board carries its own TOPOLOGY — what is joined to what before anything is
     placed.  `topo: "strip"` is a row of copper per track, broken where a hole
     is cut; `topo: "bread"` is four continuous rails plus a five-hole net per
     column per band, and no cuts at all.  Every rule below asks the board, so
     adding the breadboard added no second engine (BB-PLAN §0, BB-3).

     Breadboard rows keep A-based internal refs so every existing call site is
     untouched; `rowDisp` is what a pupil is shown (BB-PLAN §1).  `rowY` is the
     DRAWN offset in pitches — e to f is 3, which is 0.3 in, which is exactly
     why a DIP straddles the channel. */

  const BB_ROWS = ["+", "\u2212", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "+", "\u2212"];
  const BB_Y    = [0, 1, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 16, 17];
  const BB_RAILS = [{ r: 0,  pol: "+", where: "top" },    { r: 1,  pol: "\u2212", where: "top" },
                    { r: 12, pol: "+", where: "bottom" }, { r: 13, pol: "\u2212", where: "bottom" }];
  const BB_BANDS = [[2, 6], [7, 11]];

  function bread(id, cols, label) {
    return { id, rows: 14, cols, label, topo: "bread",
             rowDisp: BB_ROWS, rowY: BB_Y, rails: BB_RAILS, bands: BB_BANDS,
             channelAfter: 6 };
  }

  const BOARDS = {
    "34-0410": { id: "34-0410", rows: 9,  cols: 25, topo: "strip", label: "small (9 tracks × 25 holes)" },
    "34-0411": { id: "34-0411", rows: 24, cols: 37, topo: "strip", label: "large (24 tracks × 37 holes)" },
    "bb-400":  bread("bb-400", 30, "half board (30 columns)"),
    "bb-830":  bread("bb-830", 63, "full board (63 columns)")
  };

  const isBread = b => !!b && b.topo === "bread";

  /* ------------------------------------------------------------ hole refs */

  const rowLetter = r => String.fromCharCode(65 + r);
  const ref = h => rowLetter(h.r) + h.c;
  const parseRef = s => {
    const m = /^([A-Z])(\d+)$/.exec(String(s).trim().toUpperCase());
    if (!m) throw new Error("bad hole ref: " + s);
    return { r: m[1].charCodeAt(0) - 65, c: parseInt(m[2], 10) };
  };
  const hid = h => h.r * 1000 + h.c;

  /* ------------------------------------------------------------- row names
     Internal refs are always A-based (BB-PLAN §1).  These three are the ONLY
     place a hole is turned into words for a pupil, so a breadboard can print
     "e12" and "+12 (top rail)" without a second ref format existing anywhere. */

  function rowName(board, r) {
    if (!isBread(board)) return "track " + rowLetter(r);
    const rail = board.rails.find(x => x.r === r);
    return rail ? `the ${rail.pol} rail along the ${rail.where}` : "row " + board.rowDisp[r];
  }
  function holeName(board, h) {
    if (!isBread(board)) return ref(h);
    const rail = board.rails.find(x => x.r === h.r);
    return rail ? `${rail.pol}${h.c} (${rail.where} rail)` : board.rowDisp[h.r] + h.c;
  }
  /* Where a five-hole column net lives, in the words printed on the board:
     "column 12 (a\u2013e)".  This is the net a breadboard pupil has to reason
     about, and it has no stripboard equivalent. */
  function bandName(board, h) {
    const band = board.bands.find(([a, b]) => h.r >= a && h.r <= b);
    if (!band) return rowName(board, h.r);
    return `column ${h.c} (${board.rowDisp[band[0]]}\u2013${board.rowDisp[band[1]]})`;
  }
  /* The net a hole is on, named: a rail by its name, a column by its band. */
  const netName = (board, h) =>
    isBread(board) && board.rails.some(x => x.r === h.r) ? rowName(board, h.r)
                                                         : bandName(board, h);

  /* ----------------------------------------------------------- footprints
     Canonical coordinates are (dr, dc) offsets from the placement origin.
     rot 90 swaps them, which is how a part is turned onto/off the tracks.
     `symmetric` marks a 2-pin part whose legs are interchangeable — the
     comparison anonymises those pins (see canonicalise()).
     A footprint's name is the number of holes it SPANS, legs included — a
     resistor lying in 4 holes has its legs 3 pitches apart, not 4.  The old
     definitions were a hole out in every axial part, which put a resistor
     across 5 tracks and an LED across 4.  A 5 mm LED's leads are one 0.1 in
     pitch apart, so its legs go in ADJACENT holes. */

  function dil(n) {
    const half = n / 2, pins = [], body = [];
    for (let i = 0; i < half; i++) pins.push({ pin: String(i + 1), dr: i, dc: 0 });
    for (let i = 0; i < half; i++) pins.push({ pin: String(n - i), dr: i, dc: 3 });
    for (let i = 0; i < half; i++) { body.push({ dr: i, dc: 1 }); body.push({ dr: i, dc: 2 }); }
    return { pins, body, symmetric: false, kind: "dil", pinCount: n };
  }

  /* The same chip on a BREADBOARD.  It cannot be the stripboard DIL rotated:
     rot 90 puts the two pin rows 3 index rows apart, and on a breadboard they
     must be ADJACENT rows (e and f) with the channel between them — the 0.3 in
     the drawing shows as three pitches is the package width, not three rows of
     holes.  So pins run ALONG the columns: pin 1 bottom-left with the notch to
     the left, up the far end, and back along the row above.
     No body cells: a DIP's package sits IN the channel and covers no holes,
     which is also why `under-body` cannot misfire on one. */
  function dilbb(n) {
    const half = n / 2, pins = [];
    for (let i = 0; i < half; i++) pins.push({ pin: String(i + 1), dr: 1, dc: i });
    for (let i = 0; i < half; i++) pins.push({ pin: String(n - i), dr: 0, dc: i });
    return { pins, body: [], symmetric: false, kind: "dil", pinCount: n, straddle: true };
  }

  /* A two-legged part `holes` holes long: legs at each end, body in between.
     The name is the number of holes it SPANS, legs included. */
  function axial(holes, o) {
    const body = [];
    for (let dc = 1; dc < holes - 1; dc++) body.push({ dr: 0, dc });
    return Object.assign({ pins: [{ pin: "1", dr: 0, dc: 0 },
                                  { pin: "2", dr: 0, dc: holes - 1 }],
                           body, kind: "axial" }, o || {});
  }

  const FOOTPRINTS = {
    /* Axial parts come in more than one length, because on a real board you
       bend the legs to reach: a resistor spans four holes to seven, and the two
       sensors two to four.  Each length is its own footprint — the engine only
       ever asks "which holes does this part occupy" — and AXIAL_LENGTHS below
       says which ones are the same part at a different stretch. */
    "res-4":   axial(4, { symmetric: true }),
    "res-5":   axial(5, { symmetric: true }),
    "res-6":   axial(6, { symmetric: true }),
    "res-7":   axial(7, { symmetric: true }),
    /* Both capacitors are RADIAL: two legs one pitch apart, so they stand on
       two consecutive tracks the way they actually do in the kit.  The old
       axial spans (8 holes and 4) were the wrong part — nothing in the box
       looks like that. */
    "cap-2":   { pins: [{ pin: "1", dr: 0, dc: 0 }, { pin: "2", dr: 0, dc: 1 }],
                 body: [], symmetric: true, kind: "axial", sym: "cap" },
    "ecap-2":  { pins: [{ pin: "+", dr: 0, dc: 0 }, { pin: "-", dr: 0, dc: 1 }],
                 body: [], symmetric: false, polarised: ["+", "-"], kind: "axial", sym: "ecap" },
    // a 5 mm LED: legs one pitch apart, so they sit in adjacent holes
    "led-2":   { pins: [{ pin: "a", dr: 0, dc: 0 }, { pin: "k", dr: 0, dc: 1 }],
                 body: [], symmetric: false, polarised: ["a", "k"], kind: "axial", sym: "led" },
    // an LDR: two legs, unpolarised, one pitch apart — same spacing as the
    // LED, not the 2-way terminal block it used to be drawn as
    "ldr-2":   axial(2, { symmetric: true, sym: "ldr" }),
    "ldr-3":   axial(3, { symmetric: true, sym: "ldr" }),
    "ldr-4":   axial(4, { symmetric: true, sym: "ldr" }),
    // a thermistor: the body of a resistor with the sensing bar struck through
    // it, so it reads as "a resistor that changes"
    "ther-2":  axial(2, { symmetric: true, sym: "ther" }),
    "ther-3":  axial(3, { symmetric: true, sym: "ther" }),
    "ther-4":  axial(4, { symmetric: true, sym: "ther" }),
    // a 1N4001 is a small axial cylinder with a band at the cathode — the same
    // span as a resistor, and polarised, so fitting it round the wrong way is
    // a fault the engine already knows how to report (rank 10)
    "diode-4": { pins: [{ pin: "a", dr: 0, dc: 0 }, { pin: "k", dr: 0, dc: 3 }],
                 body: [{ dr: 0, dc: 1 }, { dr: 0, dc: 2 }],
                 symmetric: false, polarised: ["a", "k"], kind: "axial", sym: "diode" },
    /* The metal-can NPN in the kit: its three leads come out in a TRIANGLE, not
       in a row, so it sits across three tracks and two columns.  Fitted the way
       the kit's own drawing shows it — collector at the top, emitter at the
       bottom, base out to the middle right, tab at the bottom left — which is
       what the pin letters on the footprint are for.  The can covers the two
       holes the legs do not use, so nothing else may be put there. */
    "npn-can": { pins: [{ pin: "c", dr: 0, dc: 0 }, { pin: "b", dr: 1, dc: 1 },
                        { pin: "e", dr: 2, dc: 0 }],
                 body: [{ dr: 1, dc: 0 }, { dr: 2, dc: 1 }],
                 symmetric: false, kind: "can", fixedRot: true },
    /* The PNP comes in the same can with the same legs; only the symbol differs.
       Checked 2 Oct 2026 against Rapid's own data sheet for the CDIL 2N2905A
       (81-0260): lead 1, beside the tab, is the emitter. */
    "pnp-can": { pins: [{ pin: "c", dr: 0, dc: 0 }, { pin: "b", dr: 1, dc: 1 },
                        { pin: "e", dr: 2, dc: 0 }],
                 body: [{ dr: 1, dc: 0 }, { dr: 2, dc: 1 }],
                 symmetric: false, kind: "can", fixedRot: true },
    /* The plastic TO-92 (BC547B / BC557B, Rapid 81-0468 / 81-0474 — both data
       sheets give 1 = c, 2 = b, 3 = e): three legs in a row, read c, b, e with
       the flat face towards you.  A 2N3906 is e, b, c and would be drawn wrong.  It rotates like any inline part — turned
       round, c and e swap, which is why the drawing letters every leg. */
    "npn-92":  { pins: [{ pin: "c", dr: 0, dc: 0 }, { pin: "b", dr: 0, dc: 1 },
                        { pin: "e", dr: 0, dc: 2 }],
                 body: [], symmetric: false, kind: "to92", sym: "to92" },
    "pnp-92":  { pins: [{ pin: "c", dr: 0, dc: 0 }, { pin: "b", dr: 0, dc: 1 },
                        { pin: "e", dr: 0, dc: 2 }],
                 body: [], symmetric: false, kind: "to92", sym: "to92" },
    /* The 2N7000 (Rapid 47-0180): an n-channel enhancement MOSFET in a TO-92,
       legs s, g, d with the flat face towards you (Microchip's data sheet). */
    "mosfet-92": { pins: [{ pin: "s", dr: 0, dc: 0 }, { pin: "g", dr: 0, dc: 1 },
                          { pin: "d", dr: 0, dc: 2 }],
                 body: [], symmetric: false, kind: "to92", sym: "to92" },
    // a 3-leg preset potentiometer: track ends either side, wiper in the middle
    "pot-3":   { pins: [{ pin: "1", dr: 0, dc: 0 }, { pin: "w", dr: 0, dc: 1 },
                        { pin: "2", dr: 0, dc: 2 }],
                 body: [], symmetric: false, kind: "inline3", sym: "pot" },
    // an SPDT slide switch: the common pole is the middle pin
    "spdt-3":  { pins: [{ pin: "1", dr: 0, dc: 0 }, { pin: "c", dr: 0, dc: 1 },
                        { pin: "2", dr: 0, dc: 2 }],
                 body: [], symmetric: false, kind: "inline3", sym: "spdt" },
    // a TO-220 MOSFET: gate, drain, source, again on 0.1 in
    "mosfet-3": { pins: [{ pin: "g", dr: 0, dc: 0 }, { pin: "d", dr: 0, dc: 1 },
                         { pin: "s", dr: 0, dc: 2 }],
                 body: [], symmetric: false, kind: "inline3", sym: "to220" },
    /* N5 Eng 4b L4 (8 Oct 2026; no kit photos, so the common parts — teacher's
       call).  A round piezo buzzer: legs 0.3 in apart, + marked on the top. */
    "buzzer-2": { pins: [{ pin: "+", dr: 0, dc: 0 }, { pin: "-", dr: 0, dc: 3 }],
                  body: [{ dr: 0, dc: 1 }, { dr: 0, dc: 2 }], symmetric: false,
                  polarised: ["+", "-"], kind: "axial", sym: "buzzer" },
    /* A 6 mm four-leg tactile push button straddling the centre channel, legs
       0.2 in apart along the row.  The legs facing each other across the
       channel are joined inside, so pressing it joins column c to column c + 2. */
    "button-4": { pins: [{ pin: "1", dr: 0, dc: 0 }, { pin: "2", dr: 0, dc: 2 },
                         { pin: "3", dr: 1, dc: 0 }, { pin: "4", dr: 1, dc: 2 }],
                  body: [], symmetric: false, kind: "button", straddle: true, fixedRot: true },
    "term-1":  { pins: [{ pin: "1", dr: 0, dc: 0 }], body: [],
                 symmetric: false, kind: "terminal" },
    "term-2":  { pins: [{ pin: "1", dr: 0, dc: 0 }, { pin: "2", dr: 0, dc: 2 }],
                 body: [{ dr: 0, dc: 1 }], symmetric: false, kind: "terminal" },
    "dip-8":   dil(8),
    "dip-14":  dil(14),
    "dip-8-bb":  dilbb(8),
    "dip-14-bb": dilbb(14),
    "dip-16":  dil(16)
  };

  /* The same part at a different stretch.  The UI offers these as a length
     control; the engine needs the list only to answer "is this one of them". */
  const AXIAL_LENGTHS = {
    res:  ["res-4", "res-5", "res-6", "res-7"],
    ther: ["ther-2", "ther-3", "ther-4"],
    ldr:  ["ldr-2", "ldr-3", "ldr-4"]
  };
  function lengthsOf(footprint) {
    for (const k of Object.keys(AXIAL_LENGTHS))
      if (AXIAL_LENGTHS[k].indexOf(footprint) >= 0) return AXIAL_LENGTHS[k];
    return null;
  }

  /* ------------------------------------------------------------- gate pins
     Which pins of a chip are gate INPUTS and which are gate OUTPUTS, read off
     the National 5 Practical Electronics data sheet (X860/75/12, 12 May 2025)
     page 4 — the same sheet the page links to, so a pupil can check every
     number here against the drawing they are told to work from.

     This exists for one rule: rank 2.2, "every gate input is held at a
     definite level".  A TTL input left floating is not a nought — it drifts,
     picks up noise from the board next to it and switches on its own, which is
     why the course teaches a pull-down on every input that is not driven by
     another gate.  Nothing else in the engine needs pin roles, so nothing else
     reads this.

     The quad 2-input parts share one pinout (in 1,2 → out 3, and so on round
     the chip) EXCEPT the 7402, whose gates are drawn output-first: in 2,3 →
     out 1.  That difference is the whole reason this is a table and not a
     formula. */

  const QUAD_GATES = [ { in: ["1", "2"], out: "3" }, { in: ["4", "5"], out: "6" },
                       { in: ["9", "10"], out: "8" }, { in: ["12", "13"], out: "11" } ];
  const GATES = {
    "7400": QUAD_GATES, "7408": QUAD_GATES, "7432": QUAD_GATES, "7486": QUAD_GATES,
    "7402": [ { in: ["2", "3"], out: "1" }, { in: ["5", "6"], out: "4" },
              { in: ["8", "9"], out: "10" }, { in: ["11", "12"], out: "13" } ],
    "7404": [ { in: ["1"], out: "2" }, { in: ["3"], out: "4" }, { in: ["5"], out: "6" },
              { in: ["9"], out: "8" }, { in: ["11"], out: "10" }, { in: ["13"], out: "12" } ]
  };

  /* Not gates, but they drive a logic level just as hard, so an input fed from
     one of them is driven and needs no pull-down: the 555's output is pin 3,
     the 741's is pin 6 (data sheet p.3). */
  const DRIVER_PINS = { "555": ["3"], "741": ["6"] };

  const gatesOf = part => GATES[part] || null;

  /* Four rotations, normalised so the shape always sits at the origin.
     180 and 270 are how a polarised part gets fitted the wrong way round, so
     they are not optional: without them "reversed LED" cannot be expressed. */
  function cellsOf(fp, at, rot) {
    const turn = (dr, dc) => rot === 90  ? [dc, -dr]
                           : rot === 180 ? [-dr, -dc]
                           : rot === 270 ? [-dc, dr]
                           :               [dr, dc];
    const all = fp.pins.map(p => ({ pin: p.pin, o: turn(p.dr, p.dc) }))
      .concat((fp.body || []).map(b => ({ pin: null, o: turn(b.dr, b.dc) })));
    let minR = Infinity, minC = Infinity;
    for (const x of all) { if (x.o[0] < minR) minR = x.o[0]; if (x.o[1] < minC) minC = x.o[1]; }
    const place = x => ({ r: at.r + x.o[0] - minR, c: at.c + x.o[1] - minC });
    return {
      pins: all.filter(x => x.pin !== null).map(x => ({ pin: x.pin, hole: place(x) })),
      body: all.filter(x => x.pin === null).map(place)
    };
  }

  /* ------------------------------------------------------------- segments
     A2: the cut hole itself belongs to NO segment. */

  function segmentsOf(row, cols, cutCols) {
    const segs = [];
    let from = null;
    for (let c = 1; c <= cols; c++) {
      if (cutCols.has(c)) {
        if (from !== null) { segs.push({ from, to: c - 1 }); from = null; }
      } else if (from === null) {
        from = c;
      }
    }
    if (from !== null) segs.push({ from, to: cols });
    return segs;
  }

  /* ---------------------------------------------------------- union-find */

  function makeDSU() {
    const parent = new Map();
    const find = x => {
      if (!parent.has(x)) { parent.set(x, x); return x; }
      let r = x;
      while (parent.get(r) !== r) r = parent.get(r);
      while (parent.get(x) !== r) { const n = parent.get(x); parent.set(x, r); x = n; }
      return r;
    };
    return { find, union: (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); } };
  }

  /* --------------------------------------------------------------- topology
     Returns node ids per hole, the DSU after links, and any placement errors.
     Placement errors are hard: the UI must refuse these drops, but the engine
     never assumes the UI did its job. */

  /* ------------------------------------------------------------- node map
     The one place the two board topologies differ.  Everything downstream —
     links, nets, the DIL tests, every diagnostic — reads `nodeOf` and does not
     care which board made it (BB-PLAN §0, BB-3).

       strip   one node per unbroken run of copper along a track
       bread   one node per rail (continuous end to end, BB-2), plus one per
               five-hole column per band.  A breadboard has no cuts, so the cut
               set is not consulted. */

  function nodesOf(board, cuts) {
    const nodeOf = new Map();

    if (isBread(board)) {
      for (const rail of board.rails)
        for (let c = 1; c <= board.cols; c++) nodeOf.set(rail.r * 1000 + c, "rail:" + rail.r);
      board.bands.forEach(([lo, hi], i) => {
        for (let r = lo; r <= hi; r++)
          for (let c = 1; c <= board.cols; c++) nodeOf.set(r * 1000 + c, "col:" + c + ":" + i);
      });
      return nodeOf;
    }

    const cutColsByRow = new Map();
    for (const k of cuts) {
      const r = Math.floor(k / 1000), c = k % 1000;
      if (!cutColsByRow.has(r)) cutColsByRow.set(r, new Set());
      cutColsByRow.get(r).add(c);
    }
    for (let r = 0; r < board.rows; r++) {
      const segs = segmentsOf(r, board.cols, cutColsByRow.get(r) || new Set());
      segs.forEach((s, i) => {
        for (let c = s.from; c <= s.to; c++) nodeOf.set(r * 1000 + c, r + ":" + i);
      });
    }
    return nodeOf;
  }

  function topology(board, attempt) {
    let top_linkAt = new Map();
    // a breadboard has no copper to cut: ignore any cut that rode in on a
    // saved stripboard layout rather than letting it punch holes in a rail
    const cuts = isBread(board) ? new Set()
                                : new Set((attempt.cuts || []).map(s => hid(parseRef(s))));
    const errors = [];
    const nodeOf = nodesOf(board, cuts);

    const dsu = makeDSU();
    for (const k of nodeOf.values()) dsu.find(k);

    // occupancy: pins first (A8), then bodies (A5)
    const pinAt = new Map(), bodyAt = new Map(), pins = [];
    for (const p of attempt.placements || []) {
      const fp = FOOTPRINTS[p.footprint];
      if (!fp) { errors.push({ code: "no-footprint", msg: `unknown footprint "${p.footprint}" for ${p.id}` }); continue; }
      const cells = cellsOf(fp, parseRef(p.at), p.rot || 0);

      // pin cells carry their coordinates on .hole, body cells are bare {r,c} —
      // flatten before the bounds test, or it silently never fires for pins
      for (const cell of cells.pins.map(x => x.hole).concat(cells.body)) {
        if (cell.r < 0 || cell.r >= board.rows || cell.c < 1 || cell.c > board.cols) {
          errors.push({ code: "off-board", msg: `${p.id} falls off the board at ${holeName(board, cell)}`, refs: [p.id] });
        }
      }
      for (const { pin, hole } of cells.pins) {
        const k = hid(hole), id = p.id + "." + pin;
        if (cuts.has(k)) errors.push({ code: "pin-in-cut", msg: `${id} is in ${holeName(board, hole)}, where the copper has been cut away`, refs: [ref(hole)] });
        if (pinAt.has(k)) errors.push({ code: "hole-clash", msg: `${id} and ${pinAt.get(k)} are both in ${holeName(board, hole)} — two legs cannot share a hole`, refs: [ref(hole)] });
        else pinAt.set(k, id);
        pins.push({ id, comp: p.id, pin, hole, footprint: p.footprint, rot: p.rot || 0 });
      }
      for (const cell of cells.body) {
        const k = hid(cell);
        if (!bodyAt.has(k)) bodyAt.set(k, p.id);
      }
    }
    for (const [k, id] of pinAt) {
      if (bodyAt.has(k) && bodyAt.get(k) !== id.split(".")[0]) {
        errors.push({ code: "under-body", msg: `${id} sits in ${holeName(board, { r: Math.floor(k / 1000), c: k % 1000 })}, under ${bodyAt.get(k)} — ${isBread(board) ? "there is no hole to push it into" : "you could not solder that"}`, refs: [] });
      }
    }

    /* A6: links merge segments — and A8 applies to a link end exactly as it
       applies to a leg.  One hole takes one thing: a jumper cannot go into a
       hole that already has a component leg in it, and two jumpers cannot share
       one either.  On both boards (decided 15 Sep 2026): a breadboard hole is a
       spring clip, and a stripboard link that shares a leg's drilled hole is the
       same bad habit the breadboard rule already marks. */
    const linkAt = new Map();
    for (const l of attempt.links || []) {
      const a = parseRef(l.a), b = parseRef(l.b);
      const name = `the link ${holeName(board, a)}\u2013${holeName(board, b)}`;
      for (const h of [a, b]) {
        const k = hid(h);
        if (pinAt.has(k))
          errors.push({ code: "hole-clash",
            msg: `${name} and ${pinAt.get(k)} are both in ${holeName(board, h)} — ` +
                 `two things cannot go in one hole`, refs: [ref(h)] });
        else if (linkAt.has(k))
          errors.push({ code: "hole-clash",
            msg: `${name} and ${linkAt.get(k)} both end in ${holeName(board, h)} — ` +
                 `two things cannot go in one hole`, refs: [ref(h)] });
        else linkAt.set(k, name);
      }
      const na = nodeOf.get(hid(a)), nb = nodeOf.get(hid(b));
      if (na === undefined || nb === undefined) {
        errors.push({ code: "link-in-cut", msg: `${name} lands in a hole whose copper has been cut away`, refs: [] });
        continue;
      }
      dsu.union(na, nb);
    }
    top_linkAt = linkAt;

    return { cuts, nodeOf, dsu, pins, pinAt, bodyAt, linkAt: top_linkAt, errors };
  }

  /* ------------------------------------------------------- drop-time check
     R7 and R9: a leg in a hole under another part's body, or a part hanging
     off the edge, must be refused when the pupil drops it — not reported as a
     netlist fault, because neither is a wiring mistake and neither can be
     built.  topology() re-checks all of this: the engine never assumes the UI
     did its job (A8).  This is the UI half, so the refusal can name the reason.
     `ignore` lets a part be dragged to a new place without clashing with the
     copy of itself that is still on the board. */

  function placeCheck(q, attempt, cand, ignore) {
    const board = BOARDS[q.board];
    const fp = FOOTPRINTS[cand.footprint];
    if (!board) return { ok: false, msg: "unknown board" };
    if (!fp) return { ok: false, msg: "unknown footprint " + cand.footprint };

    const cells = cellsOf(fp, parseRef(cand.at), cand.rot || 0);
    const mine = cells.pins.map(x => x.hole).concat(cells.body);

    for (const cell of mine)
      if (cell.r < 0 || cell.r >= board.rows || cell.c < 1 || cell.c > board.cols)
        return { ok: false, msg: `${cand.id} would hang off the edge of the board.` };

    const cuts = new Set((attempt.cuts || []).map(x => hid(parseRef(x))));
    for (const { pin, hole } of cells.pins)
      if (cuts.has(hid(hole)))
        return { ok: false, msg: `${holeName(board, hole)} has been cut — a leg soldered there ` +
                                 `is connected to nothing.` };

    const linkEnds = new Map();
    for (const l of attempt.links || [])
      for (const h of [l.a, l.b])
        linkEnds.set(hid(parseRef(h)), `the link ${holeName(board, parseRef(l.a))}\u2013${holeName(board, parseRef(l.b))}`);
    for (const { hole } of cells.pins)
      if (linkEnds.has(hid(hole)))
        return { ok: false, msg: `${holeName(board, hole)} already has ${linkEnds.get(hid(hole))} ` +
                                 `in it — two things cannot go in one hole.` };

    for (const p of attempt.placements || []) {
      if (p.id === cand.id || p.id === ignore) continue;
      const other = FOOTPRINTS[p.footprint];
      if (!other) continue;
      const oc = cellsOf(other, parseRef(p.at), p.rot || 0);
      const taken = new Map();
      for (const { hole } of oc.pins) taken.set(hid(hole), "pin");
      for (const cell of oc.body) if (!taken.has(hid(cell))) taken.set(hid(cell), "body");
      for (const cell of mine) {
        const what = taken.get(hid(cell));
        if (!what) continue;
        return { ok: false, msg: what === "pin" && cells.pins.some(z => hid(z.hole) === hid(cell))
          ? `${holeName(board, cell)} already has a leg of ${p.id} in it — two legs cannot share a hole.`
          : `${cand.id} would overlap ${p.id} at ${holeName(board, cell)}.` };
      }
    }
    return { ok: true };
  }

  /* -------------------------------------------------- drop-time link check
     The mirror of placeCheck: that one guards a PART against the links already
     on the board, and until 21 Sep 2026 nothing guarded a LINK against the
     parts.  A jumper drawn straight through a component was accepted in
     silence, and on stripboard the rank-11 rule could not report it afterwards
     either (see the comment there).  Refused at the point it is drawn, because
     a link across a component body is never a layout a pupil meant (D2).
     A bare leg does not block — see the rank-11 comment for why.
     `ignore` lets an existing link be redrawn without clashing with itself. */

  /* Two straight links on the same row or column whose spans share a hole lie
     on top of each other.  A link CROSSING another at right angles is not
     this: it lies over the other wire the way a link may lie over a bare leg
     (see rank 11), and shipped answers may do it. */
  function linksOverlap(l1, l2) {
    const a1 = parseRef(l1.a), b1 = parseRef(l1.b), a2 = parseRef(l2.a), b2 = parseRef(l2.b);
    const span = (x, y) => [Math.min(x, y), Math.max(x, y)];
    let s1, s2;
    if (a1.r === b1.r && a2.r === b2.r && a1.r === a2.r) { s1 = span(a1.c, b1.c); s2 = span(a2.c, b2.c); }
    else if (a1.c === b1.c && a2.c === b2.c && a1.c === a2.c) { s1 = span(a1.r, b1.r); s2 = span(a2.r, b2.r); }
    else return false;
    return s1[0] <= s2[1] && s2[0] <= s1[1];
  }

  function linkCheck(q, attempt, cand, ignore) {
    const board = BOARDS[q.board];
    if (!board) return { ok: false, msg: "unknown board" };
    const a = parseRef(cand.a), b = parseRef(cand.b);
    const others = (attempt.links || []).filter(l => l !== ignore);

    /* Wire against wire (pupil bug report, 22 Sep 2026): three links drawn
       C7–G7 on top of each other, and a fourth A7–G7 along the same column,
       were all accepted.  topology() already calls a shared end a hole-clash,
       so Check failed the board afterwards — but the pupil was never stopped
       at the point of drawing it, the way a part overlap is. */
    const top = topology(board, {
      cuts: attempt.cuts || [],
      placements: attempt.placements || [],
      links: others,
      testpoints: attempt.testpoints || []
    });
    const linkName = l => (l.num ? "link " + l.num : "the link") +
      ` (${holeName(board, parseRef(l.a))}–${holeName(board, parseRef(l.b))})`;
    for (const h of [a, b]) {
      const k = hid(h);
      const pin = top.pins.find(p => hid(p.hole) === k);
      if (pin) return { ok: false, msg: `${holeName(board, h)} already has ${pin.id} in it ` +
                                        `— two things cannot go in one hole.` };
      const l = others.find(o => hid(parseRef(o.a)) === k || hid(parseRef(o.b)) === k);
      if (l) return { ok: false, msg: `${holeName(board, h)} already has ${linkName(l)} in it ` +
                                      `— two wires cannot go in one hole.` };
    }
    const over = others.find(o => linksOverlap(cand, o));
    if (over) return { ok: false, msg: `That link would lie on top of ${linkName(over)}. ` +
                                       `Two wires cannot share the same holes.` };

    /* Diagonal: a hard refusal at drop time since 22 Sep 2026 (pupil report
       test-2).  check() still carries the rank-0.5 `diagonal-link` fault,
       because Fault-finder's boards are LOADED, not drawn, and a saved file
       may hold one. */
    const along = a.r === b.r, down = a.c === b.c;
    if (!along && !down)
      return { ok: false, msg: `A link wire runs straight — along a row, or straight up ` +
        `and down a column. ${holeName(board, a)} to ${holeName(board, b)} is diagonal. ` +
        `Pick a hole in the same row or the same column.` };

    const lo = along ? Math.min(a.c, b.c) : Math.min(a.r, b.r),
          hi = along ? Math.max(a.c, b.c) : Math.max(a.r, b.r);
    // lo..hi INCLUSIVE: an end landing exactly on a body cell is exactly as
    // unsolderable as one passing under it partway along (21 Sep 2026 — a
    // link ending on a resistor's body cell was accepted in silence because
    // only the interior i=lo+1..hi-1 was ever walked).
    for (let i = lo; i <= hi; i++) {
      const body = top.bodyAt.get(hid(along ? { r: a.r, c: i } : { r: i, c: a.c }));
      if (!body) continue;
      return { ok: false, msg: `That link would run under ${body} — on a real ` +
        `board you could not solder it there. Take it round the part.` };
    }
    return { ok: true };
  }

  /* ---------------------------------------------------------------- nets */

  function netsOf(top) {
    const byRoot = new Map();
    for (const p of top.pins) {
      const node = top.nodeOf.get(hid(p.hole));
      if (node === undefined) continue;              // already reported as pin-in-cut
      const root = top.dsu.find(node);
      if (!byRoot.has(root)) byRoot.set(root, []);
      byRoot.get(root).push(p.id);
    }
    return byRoot;
  }

  /* -------------------------------------------------------- canonicalise
     Two jobs, both of which must be done identically to the pupil's netlist
     and the target or the comparison is meaningless:

       - drop `dontcare` pins (PLAN.md R1): a spare gate input tied to 0 V is
         good practice and must never fail a board;
       - anonymise the pins of a symmetric 2-pin part to "ID.*", because for
         such a part "which leg" carries no information (R3).  Multiplicity is
         PRESERVED, so both legs in one net still reads as a different net.  */

  function canonicalise(nets, symmetricComps, dontcare) {
    const skip = new Set(dontcare || []);
    const out = [];
    for (const list of nets) {
      const sig = [];
      for (const id of list) {
        if (skip.has(id)) continue;
        const comp = id.split(".")[0];
        sig.push(symmetricComps.has(comp) ? comp + ".*" : id);
      }
      if (sig.length) out.push(sig.sort().join("|"));
    }
    return out.sort();
  }

  /* ----------------------------------------------------------- stages
     "It should be possible to do the switching board separate from the
     process, and then the output."  A question with `stages` is checked one
     sub-system at a time: each stage names the components unlocked by then,
     and everything past it is folded into `dontcare` — which the comparison
     already strips from BOTH partitions (R1).  So an early stage marks only
     the wiring it covers, and a pupil who runs ahead and places the output
     parts is not punished for it at stage 1.

     `parts` is cumulative: stage k's set is stages 0..k unioned.  The last
     stage is the whole question, unchanged, so the final check is exactly the
     check a question without stages gets.  There is no second comparison and
     no second target — a staged question cannot drift from its own answer. */
  function stageOf(q, k) {
    if (!q.stages || !q.stages.length) return q;
    const last = q.stages.length - 1;
    if (!(k >= 0) || k >= last) return q;
    const unlocked = new Set();
    for (let i = 0; i <= k; i++) for (const id of q.stages[i].parts) unlocked.add(id);
    const dontcare = new Set(q.dontcare || []);
    for (const net of q.target)
      for (const pin of net) if (!unlocked.has(pin.split(".")[0])) dontcare.add(pin);
    return Object.assign({}, q, {
      components: (q.components || []).filter(c => unlocked.has(c.id)),
      dontcare: [...dontcare],
      tpRequired: [],          // a test point is planned once the output exists
      expect: null,
      stageIndex: k
    });
  }

  /* --------------------------------------------------------------- check */

  function check(q, attempt) {
    const board = BOARDS[q.board];
    if (!board) throw new Error("unknown board " + q.board);

    const faults = [], warnings = [];
    const top = topology(board, attempt);

    /* rank 0.5 — a link wire that runs diagonally.  A real jumper CAN bridge
       any two holes electrically, but the layout convention this tool teaches
       (and the one the marking sheet expects) is that link wires run
       straight — along a track, or straight down between tracks, never at an
       angle.  Checked unconditionally, before anything else, and never
       suppressed by a placement error: a diagonal wire is a layout-
       convention fault, not an electrical one, so it is never accepted no
       matter what else is right or wrong about the rest of the board. */
    for (const l of attempt.links || []) {
      const a = parseRef(l.a), b = parseRef(l.b);
      if (a.r !== b.r && a.c !== b.c) {
        faults.push({ rank: 0.5, code: "diagonal-link",
          msg: `The link wire between ${holeName(board, a)} and ${holeName(board, b)} runs diagonally ` +
               `— link wires must run straight, ${isBread(board) ? "along a rail or straight up and down between columns" : "along a track or straight down between tracks"}, never at an angle. This is a layout-convention ` +
               `fault: it is never accepted, however the rest of the board reads.`,
          refs: [l.a, l.b] });
      }
    }

    // placement errors are structural; report and stop — nets are meaningless
    if (top.errors.length) {
      return { ok: false, stage: "placement",
               faults: faults.concat(top.errors.map(e => Object.assign({ rank: 0 }, e)))
                             .sort((x, y) => x.rank - y.rank),
               warnings };
    }

    /* rank 7 — anything still in the bank */
    const placed = new Set((attempt.placements || []).map(p => p.id));
    const missing = (q.components || []).map(c => c.id).filter(id => !placed.has(id));
    if (missing.length) {
      faults.push({ rank: 7, code: "unplaced",
        msg: missing.length === 1 ? `${missing[0]} has not been placed.`
                                  : `${missing.join(", ")} have not been placed.`,
        refs: missing });
    }

    const byRoot = netsOf(top);
    const netOfPin = new Map();
    for (const [rootKey, list] of byRoot) for (const id of list) netOfPin.set(id, rootKey);

    /* ranks 2 and 1 — the DIL, checked structurally before any comparison,
       because a chip laid the wrong way makes the partition diff unreadable */
    const explained = new Set();
    for (const p of attempt.placements || []) {
      const fp = FOOTPRINTS[p.footprint];
      if (!fp || fp.kind !== "dil") continue;
      const half = fp.pinCount / 2;

      const sideA = [], sideB = [];
      for (let i = 1; i <= half; i++) sideA.push(p.id + "." + i);
      for (let i = half + 1; i <= fp.pinCount; i++) sideB.push(p.id + "." + i);

      /* Both DIL checks below ask "is this pin joined to that one BY THE
         COPPER", which is not the same question as "are they on one net".
         Reported by a pupil testing the alpha: two spare gate inputs facing
         each other across the package, each taken down to the 0 V rail by its
         own link, are legitimately one net — and the old net-based test read
         that as a missing cut and told them to cut a track that was already
         cut.  `nodeOf` is the segment a hole sits in BEFORE links are merged
         in, so it answers the question that was actually being asked. */
      const segOf = id => {
        const pin = top.pins.find(x => x.id === id);
        return pin ? top.nodeOf.get(hid(pin.hole)) : undefined;
      };

      for (const side of [sideA, sideB]) {
        const roots = new Set(side.map(segOf).filter(x => x !== undefined));
        if (side.length > 2 && roots.size === 1) {
          const trackOf = top.pins.find(x => x.id === side[0]);
          faults.push({ rank: 2, code: isBread(board) ? "dil-along-net" : "dil-along-tracks",
            msg: isBread(board)
              ? `All ${side.length} pins down one side of ${p.id} are in ` +
                `${netName(board, trackOf.hole)} — that is one net, so they are shorted ` +
                `together. The chip has to lie along the columns, one pin per column, ` +
                `with its two rows of pins either side of the centre channel.`
              : `All ${side.length} pins down one side of ${p.id} are on track ` +
                `${rowLetter(trackOf.hole.r)} — they are shorted together. ` +
                `The chip has to sit across the tracks, not along them.`,
            refs: [p.id] });
          side.forEach(id => explained.add(id));
        }
      }

      /* An uncut chip shorts EVERY track it crosses, so reporting one fault per
         pin pair gives a pupil seven near-identical lines for a single mistake.
         They are one fault — a missing column of cuts — and read as one. */
      const uncut = [];
      for (let i = 1; i <= half; i++) {
        const a = p.id + "." + i, b = p.id + "." + (fp.pinCount + 1 - i);
        if (explained.has(a) || explained.has(b)) continue;
        const ra = segOf(a), rb = segOf(b);
        if (ra !== undefined && ra === rb) {
          uncut.push({ a, b, i, hole: top.pins.find(x => x.id === a).hole,
                       track: rowLetter(top.pins.find(x => x.id === a).hole.r) });
          explained.add(a); explained.add(b);
        }
      }
      /* Same two structural tests on both boards; only the remedy differs.
         On stripboard the pupil is missing a column of cuts.  On a breadboard
         there is nothing to cut — the chip is simply not across the channel,
         so both of its pin rows are in the same five-hole column (BB-4). */
      if (uncut.length === 1) {
        const u = uncut[0];
        faults.push({ rank: 1, code: isBread(board) ? "dil-not-straddling" : "dil-uncut",
          msg: isBread(board)
            ? `${u.a.replace(".", " pin ")} and ${u.b.replace(".", " pin ")} are both in ` +
              `${netName(board, u.hole)} — one net, so they are shorted together. ` +
              `The chip must straddle the centre channel: one row of pins in the ` +
              `a\u2013e half, the other in the f\u2013j half.`
            : `${u.a.replace(".", " pin ")} and ${u.b.replace(".", " pin ")} are on the same ` +
              `track (track ${u.track}). Cut every track the chip crosses, between the two ` +
              `rows of pins.`,
          refs: [u.a, u.b] });
      } else if (uncut.length > 1) {
        const tracks = uncut.map(u => u.track);
        faults.push({ rank: 1, code: isBread(board) ? "dil-not-straddling" : "dil-uncut",
          msg: isBread(board)
            ? `${p.id} is not across the centre channel: every pin is still joined to the ` +
              `pin opposite it, ${uncut.length} pairs of them \u2014 pin ${uncut[0].i} to pin ` +
              `${fp.pinCount + 1 - uncut[0].i}, and so on down the chip. Slide it onto the ` +
              `channel so one row of pins is in the a\u2013e half and the other in the f\u2013j half.`
            : `${p.id} has no cuts under it: each pin is still joined to the pin opposite it ` +
              `on ${uncut.length} tracks (${tracks[0]} to ${tracks[tracks.length - 1]}) — ` +
              `pin ${uncut[0].i} to pin ${fp.pinCount + 1 - uncut[0].i}, and so on down the chip. ` +
              `Cut every track the chip crosses, between the two rows of pins.`,
          refs: uncut.reduce((acc, u) => acc.concat([u.a, u.b]), []) });
      }
    }

    /* ------------------------------------------------ the netlist compare */

    /* Whether the two legs are interchangeable is a property of the COMPONENT,
       not of the footprint it happens to use (R3).  A 2-way terminal block is
       the footprint for an LDR, a switch and a buzzer alike — the first two can
       be wired either way round, the buzzer cannot.  So the record may say. */
    const symmetric = new Set((q.components || [])
      .filter(c => c.symmetric != null ? c.symmetric
                                       : (FOOTPRINTS[c.footprint] || {}).symmetric)
      .map(c => c.id));
    const dontcare = new Set(q.dontcare || []);

    const pupilNets = Array.from(byRoot.values());
    const targetNets = q.target;

    const tNetOf = new Map();
    targetNets.forEach((net, i) => net.forEach(id => { if (!dontcare.has(id)) tNetOf.set(id, i); }));

    const pupilSig  = canonicalise(pupilNets, symmetric, dontcare);
    const targetSig = canonicalise(targetNets, symmetric, dontcare);
    const match = pupilSig.length === targetSig.length &&
                  pupilSig.every((s, i) => s === targetSig[i]);

    /* Ranks 3 to 6 EXPLAIN a mismatch, so they only run when there is one.
       They compare pin ids, which is deliberately blind to the symmetry the
       match itself respects — a pupil who swaps a resistor's legs has the
       right board, and without this gate they would be told two nets were
       "merged".  Ranks 1, 2, 7 and 8 are structural and stay unconditional:
       shorting an unused gate's output to 0 V leaves the netlist matching and
       is still a real fault. */
    /* A chip in the wrong orientation shorts whole sides together, so the
       partition diff downstream is noise — it was advising a pupil to add link
       wires between 0 V and pin 7.  Fix the chip, then re-check. */
    const chipBroken = faults.some(f => f.rank === 1 || f.rank === 2);

    /* rank 3 (breadboard) — a two-legged part with both legs on one net.
       This is the commonest breadboard mistake there is: five holes in a column
       are already joined, so a resistor dropped into c12 and d12 is a piece of
       wire.  It is a fault with NO target, which is why it is here and not in
       the comparison below: on stripboard rank 3 asks whether the two legs are
       on different nets in the TARGET, so on a free board — where the pupil's
       own netlist is the target — it can never fire.  A shorted part on a
       breadboard is wrong whatever was intended.

       Two-legged parts only.  A three-legged part with two pins on one net is
       ordinary: that is exactly how a potentiometer is wired as a rheostat.
       And it stands down when the chip is broken, like every other net-reading
       rule here — a sideways DIL makes the nets meaningless. */
    if (isBread(board) && !chipBroken) {
      const rootOfPin = id => {
        const pin = top.pins.find(z => z.id === id);
        if (!pin) return undefined;
        const node = top.nodeOf.get(hid(pin.hole));
        return node === undefined ? undefined : top.dsu.find(node);
      };
      for (const p of attempt.placements || []) {
        const fp = FOOTPRINTS[p.footprint];
        if (!fp || fp.kind === "dil" || fp.pins.length !== 2) continue;
        const ids = fp.pins.map(x => p.id + "." + x.pin);
        const ra = rootOfPin(ids[0]), rb = rootOfPin(ids[1]);
        if (ra === undefined || ra !== rb) continue;
        const hole = (top.pins.find(z => z.id === ids[0]) || {}).hole;
        faults.push({ rank: 3, code: "self-short",
          msg: `Both legs of ${p.id} are on one net \u2014 ${netName(board, hole)}. ` +
               `Every hole in it is already joined, so ${p.id} is shorted out and the ` +
               `current goes straight past it.`,
          refs: ids });
        ids.forEach(id => explained.add(id));
      }
    }

    /* rank 0.6 — link wire colour convention: red/black reserved for the
       supply rails, and no colour may be reused across two DIFFERENT
       signals. Runs unconditionally, like the diagonal check — a layout-
       convention fault, not an electrical one, so it applies whether or
       not the netlist matches the target.

       It does stand down when the chip itself is broken.  A DIL laid along the
       tracks shorts every pin down one side together, so a signal link can end
       up sitting on the 0 V rail through no fault of its colour — and "that
       orange link should be black" is a nonsense sentence to read on a board
       whose chip is sideways.  Same reasoning as railsMerged below: when the
       nets are meaningless, the rules that read them say nothing. */
    if (!chipBroken) {
      const rootOfHole = h => {
        const node = top.nodeOf.get(hid(parseRef(h)));
        return node === undefined ? undefined : top.dsu.find(node);
      };
      const posComp = (q.components || []).find(c => c.pos);
      const negComp = (q.components || []).find(c => c.neg);
      const posPlacement = posComp && (attempt.placements || []).find(p => p.id === posComp.id);
      const negPlacement = negComp && (attempt.placements || []).find(p => p.id === negComp.id);
      const posRoot = posPlacement && rootOfHole(posPlacement.at);
      const negRoot = negPlacement && rootOfHole(negPlacement.at);

      /* If a fault has shorted the two rails together they are ONE net, and
         "which rail is this link on" has no answer — every link on it would be
         reported as the wrong colour twice over. The short is the fault worth
         reporting, so the colour-of-a-supply-link rules stand down. */
      const railsMerged = posRoot !== undefined && posRoot === negRoot;

      /* An input or output terminal is a wire leaving the board, and its colour
         IS that wire's colour \u2014 so a link carrying the same signal has to match
         it.  Reported by RS, 1 Oct 2026: a blue link joined to an orange IN2
         passed.  Red and black terminals are left to the supply rules, and a
         terminal sitting on a rail is the supply's business, not this rule's. */
      const termsAt = new Map();
      for (const c of q.components || []) {
        if (c.footprint !== "term-1" || c.pos || c.neg) continue;
        const p = (attempt.placements || []).find(x => x.id === c.id);
        const colour = (p && p.colour) || c.colour;
        if (!p || !colour || colour === "red" || colour === "black") continue;
        const root = rootOfHole(p.at);
        if (root === undefined || root === posRoot || root === negRoot) continue;
        if (!termsAt.has(root)) termsAt.set(root, []);
        termsAt.get(root).push({ id: c.id, colour });
      }
      for (const ts of termsAt.values()) {
        const odd = ts.find(t => t.colour !== ts[0].colour);
        if (odd)
          faults.push({ rank: 0.6, code: "terminal-colours-differ",
            msg: `${ts[0].id} and ${odd.id} are joined, but ${ts[0].id} is ${ts[0].colour} ` +
                 `and ${odd.id} is ${odd.colour}. Joined wires carry one signal, so give ` +
                 `them one colour.`, refs: [] });
      }

      const byColour = new Map();
      // in the board's own words: a breadboard pupil never sees an internal ref
      const lname = l => holeName(board, parseRef(l.a)) + "\u2013" + holeName(board, parseRef(l.b));
      for (const l of attempt.links || []) {
        const root = rootOfHole(l.a);
        if (root === undefined) continue;              // already reported: link-in-cut
        const term = (termsAt.get(root) || [])[0];
        if (term && l.colour !== term.colour && l.colour !== "red" && l.colour !== "black")
          faults.push({ rank: 0.6, code: "link-not-terminal-colour",
            msg: `The ${l.colour} link ${lname(l)} is joined to ${term.id}, and ${term.id}\u2019s ` +
                 `wire is ${term.colour}. A link carrying that signal must be ` +
                 `${term.colour} too: one signal, one colour.`, refs: [l.a, l.b] });
        if (l.colour === "red" && root !== posRoot)
          faults.push({ rank: 0.6, code: "red-not-supply",
            msg: `The red link ${lname(l)} is not on the +5 V rail. Red is reserved ` +
                 `for +5 V — pick a different colour for this link.`, refs: [l.a, l.b] });
        if (l.colour === "black" && root !== negRoot)
          faults.push({ rank: 0.6, code: "black-not-supply",
            msg: `The black link ${lname(l)} is not on the 0 V rail. Black is reserved ` +
                 `for 0 V — pick a different colour for this link.`, refs: [l.a, l.b] });
        /* And the other way round, which is the half that was missing: the
           convention reserves red and black FOR the supply, so a link that
           lands on a supply rail has to use the supply's colour. Reported by a
           pupil testing alpha v0.10 — a blue link onto the 0 V rail passed. */
        if (!railsMerged && l.colour !== "red" && posRoot !== undefined && root === posRoot)
          faults.push({ rank: 0.6, code: "supply-not-red",
            msg: `The ${l.colour} link ${lname(l)} is on the +5 V rail, so it has to be ` +
                 `red. Every link carrying +5 V is red, every link carrying 0 V is black, ` +
                 `and no other link uses either colour.`, refs: [l.a, l.b] });
        if (!railsMerged && l.colour !== "black" && negRoot !== undefined && root === negRoot)
          faults.push({ rank: 0.6, code: "supply-not-black",
            msg: `The ${l.colour} link ${lname(l)} is on the 0 V rail, so it has to be ` +
                 `black. Every link carrying 0 V is black, every link carrying +5 V is red, ` +
                 `and no other link uses either colour.`, refs: [l.a, l.b] });

        if (!byColour.has(l.colour)) byColour.set(l.colour, new Map());
        const byRootForColour = byColour.get(l.colour);
        if (!byRootForColour.has(root)) byRootForColour.set(root, []);
        byRootForColour.get(root).push(lname(l));
      }
      /* A terminal is a wire too, so two terminals on different signals in one
         colour are a reused colour like two links are (RS, 2 Oct 2026). */
      for (const [root, ts] of termsAt)
        for (const t of ts) {
          if (!byColour.has(t.colour)) byColour.set(t.colour, new Map());
          const m = byColour.get(t.colour);
          if (!m.has(root)) m.set(root, []);
          m.get(root).push(t.id);
        }
      for (const [colour, roots] of byColour) {
        if (roots.size < 2) continue;
        const allLinks = Array.from(roots.values()).reduce((a, b) => a.concat(b), []);
        faults.push({ rank: 0.6, code: "colour-reused",
          msg: `${colour[0].toUpperCase()}${colour.slice(1)} is used for ${roots.size} different ` +
               `signals (${allLinks.join(", ")}). Give each signal its own wire colour.`, refs: [] });
      }
    }


    /* rank 2.2 — every gate input held at a definite level.
       A TTL input that is joined to nothing does not read as a nought: it
       floats, picks up whatever the tracks beside it are doing and switches on
       its own, so a board built this way behaves differently every time it is
       switched on.  The course's rule, and the one this checks, is that EVERY
       gate input is held down — a spare input straight to 0 V, an input fed
       from a switch or a sensor through a pull-down resistor to 0 V.  The one
       input that needs nothing is one driven by another gate's output (or a
       555 or 741 output), because that is already holding it at a level.

       Target-independent and never suppressed by a netlist mismatch: like the
       diagonal link and the link colours, it is a convention fault, so it is
       reported however the rest of the board reads.  It does stand down when
       the chip itself is broken (ranks 1 and 2) — with the chip laid along the
       tracks or its cuts missing, every pin is on the wrong net and the answer
       would be noise on top of noise.

       Grouped per chip, not per pin, for the reason free-mode learned the hard
       way: a freshly placed 14-pin chip has eight unheld inputs, and eight
       near-identical lines bury every other fault on the panel. */
    if (!chipBroken) {
      const compOf = new Map((q.components || []).map(c => [c.id, c]));
      const rootOf = id => netOfPin.get(id);
      const pinsOn = root => (root === undefined ? [] : (byRoot.get(root) || []));

      // the 0 V net: whatever the 0 V terminal is sitting on
      let zeroRoot;
      for (const c of q.components || []) {
        if (!c.neg) continue;
        const fp = FOOTPRINTS[c.footprint] || { pins: [] };
        for (const pin of fp.pins) {
          const r = rootOf(c.id + "." + pin.pin);
          if (r !== undefined) { zeroRoot = r; break; }
        }
        if (zeroRoot !== undefined) break;
      }

      // every pin on the board that drives a level
      const drivers = new Set();
      for (const pl of attempt.placements || []) {
        const part = (compOf.get(pl.id) || {}).part;
        const gs = gatesOf(part);
        if (gs) gs.forEach(g => drivers.add(pl.id + "." + g.out));
        (DRIVER_PINS[part] || []).forEach(pin => drivers.add(pl.id + "." + pin));
      }

      /* A resistance from this net to 0 V IS the pull-down.  An LDR counts:
         the bottom leg of a light sensor's divider holds the input down in the
         dark exactly as a fixed resistor does.  A capacitor does not — it
         holds nothing at DC — and neither does a switch, which is the whole
         reason the pull-down is needed in the first place. */
      // any length of resistor, and an LDR's lower leg in a divider, holds an
      // input down; a capacitor does not, and neither does a switch
      const PULLDOWN = f => /^(res|ldr|ther)-\d+$/.test(f);
      /* Read the footprint off the PLACEMENT, not off q.components: a staged
         question hands check() only the components unlocked so far, and a
         pull-down that is on the board but belongs to a later stage would
         otherwise go unrecognised and the board be failed for lacking it. */
      const placedFp = new Map((attempt.placements || []).map(p => [p.id, p.footprint]));
      const pulledDownTo0V = root => {
        if (zeroRoot === undefined || root === undefined) return false;
        for (const id of pinsOn(root)) {
          const comp = id.split(".")[0], fpName = placedFp.get(comp);
          if (!fpName || !PULLDOWN(fpName)) continue;
          const fp = FOOTPRINTS[fpName];
          for (const pin of fp.pins) {
            const other = comp + "." + pin.pin;
            if (other !== id && rootOf(other) === zeroRoot) return true;
          }
        }
        return false;
      };
      /* An input whose target net names a part that is still in the bank is
         not an unheld input — it is an unfinished one, and rank 7 says so in
         the words the pupil needs.  This is also what keeps a staged question
         honest: at stage 1 the later sub-system's pull-down does not exist yet. */
      const awaitingParts = new Set();
      for (const net of targetNets || []) {
        if (!net.some(id => !placedFp.has(id.split(".")[0]))) continue;
        net.forEach(id => awaitingParts.add(id));
      }

      /* Inputs the TARGET drives from a gate output: exempt, per above. */
      const driven = new Set();
      for (const net of targetNets || []) {
        if (!net.some(id => drivers.has(id))) continue;
        net.forEach(id => driven.add(id));
      }

      // no 0 V terminal on the board yet: there is nothing to pull down TO, and
      // the missing rail is the fault worth reporting instead
      if (zeroRoot !== undefined) {
        for (const pl of attempt.placements || []) {
          const c = compOf.get(pl.id) || {};
          const gs = gatesOf(c.part);
          if (!gs) continue;
          const bare = [], floatingSignal = [];
          for (const g of gs) for (const pin of g.in) {
            const id = pl.id + "." + pin;
            const root = rootOf(id);
            if (root === undefined) continue;         // pin-in-cut: already reported
            /* If the DESIGN says this input is driven by another gate, a
               missing wire is a missing wire — rank 5 names it as a split and
               says which two pins to join, which is the more useful sentence.
               Free mode hands check() the pupil's own netlist as the target,
               so nothing is exempted there unless the board really does drive
               the pin. */
            if (driven.has(id)) continue;
            if (awaitingParts.has(id)) continue;
            if (root === zeroRoot) continue;          // tied straight down
            if (pinsOn(root).some(x => drivers.has(x))) continue;   // driven by an output
            if (pulledDownTo0V(root)) continue;       // held down through a resistance
            (pinsOn(root).length > 1 ? floatingSignal : bare).push(pin);
          }
          const list = ps => ps.length === 1 ? "pin " + ps[0]
                    : "pins " + ps.slice(0, -1).join(", ") + " and " + ps[ps.length - 1];
          if (bare.length)
            faults.push({ rank: 2.2, code: "input-floating",
              msg: `${pl.id} ${list(bare)} ${bare.length === 1 ? "is a gate input" :
                   "are gate inputs"} joined to nothing. A gate input left floating is not a ` +
                   `logic 0 — it drifts and switches on its own. Every input has to be held: ` +
                   `take ${bare.length === 1 ? "it" : "them"} to 0 V, through a 10 kΩ ` +
                   `pull-down resistor if ${bare.length === 1 ? "it is" : "they are"} fed by a ` +
                   `switch or sensor, or straight to 0 V if ` +
                   `${bare.length === 1 ? "the gate is spare" : "the gates are spare"}.`,
              refs: bare.map(pin => pl.id + "." + pin) });
          if (floatingSignal.length)
            faults.push({ rank: 2.2, code: "input-no-pulldown",
              msg: `${pl.id} ${list(floatingSignal)} ${floatingSignal.length === 1 ?
                   "has" : "have"} no pull-down resistor. An input fed from a switch, a sensor ` +
                   `or a terminal floats whenever that source is not driving it, so it needs a ` +
                   `10 kΩ resistor from the input down to 0 V. Only an input driven by another ` +
                   `gate's output can go without one.`,
              refs: floatingSignal.map(pin => pl.id + "." + pin) });
        }
      }
    }

    if (!match && !chipBroken) {

    /* rank 3 — a component shorted across itself.  Breadboards have already
       had this out, target-free, above. */
    for (const [, list] of (isBread(board) ? [] : byRoot)) {
      const byComp = new Map();
      for (const id of list) {
        if (dontcare.has(id)) continue;
        const c = id.split(".")[0];
        if (!byComp.has(c)) byComp.set(c, []);
        byComp.get(c).push(id);
      }
      for (const [comp, ids] of byComp) {
        if (ids.length < 2) continue;
        if ((FOOTPRINTS[(q.components.find(x => x.id === comp) || {}).footprint] || {}).kind === "dil") continue;
        const distinctInTarget = new Set(ids.map(id => tNetOf.get(id)));
        if (distinctInTarget.size > 1) {
          const track = rowLetter(top.pins.find(x => x.id === ids[0]).hole.r);
          faults.push({ rank: 3, code: "self-short",
            msg: `Both legs of ${comp} are in track ${track} — ${comp} is shorted out.`,
            refs: ids });
          ids.forEach(id => explained.add(id));
        }
      }
    }

    /* rank 4 — two target nets merged into one pupil net */
    for (const [, list] of byRoot) {
      const seen = new Map();
      for (const id of list) {
        if (dontcare.has(id) || explained.has(id)) continue;
        const t = tNetOf.get(id);
        if (t === undefined) continue;
        if (!seen.has(t)) seen.set(t, id);
      }
      if (seen.size > 1) {
        const [a, b] = Array.from(seen.values());
        faults.push({ rank: 4, code: "merged",
          msg: `${label(q, a)} and ${label(q, b)} are joined together, but they are ` +
               `different parts of the circuit — ` +
               (isBread(board) ? "you need to keep them on separate columns."
                               : "you need a cut between them."),
          refs: [a, b] });
        seen.forEach(id => explained.add(id));
      }
    }

    /* ranks 6 and 5 — a target net split across pupil nets */
    targetNets.forEach((net, i) => {
      const live = net.filter(id => !dontcare.has(id) && netOfPin.has(id));
      if (live.length < 2) return;
      const groups = new Map();
      for (const id of live) {
        const r = netOfPin.get(id);
        if (!groups.has(r)) groups.set(r, []);
        groups.get(r).push(id);
      }
      if (groups.size < 2) return;
      if (live.every(id => explained.has(id))) return;

      /* "floating" is only the better message when the REST of the net is
         joined up and one pin has been left behind.  If a net simply falls
         into two lonely halves, the pupil needs "add a link wire", not
         "this pin is floating" — so rank 5 wins that case. */
      const gs = Array.from(groups.values());
      const restJoined = gs.some(g => g.length > 1);
      const solo = restJoined
        ? gs.find(g => g.length === 1 && byRoot.get(netOfPin.get(g[0])).length === 1)
        : null;
      if (solo) {
        const soloHole = top.pins.find(x => x.id === solo[0]).hole;
        faults.push({ rank: 6, code: "floating",
          msg: `${label(q, solo[0])} is floating — nothing else is ` +
               `${isBread(board) ? "in " + netName(board, soloHole) : "on track " + rowLetter(soloHole.r)}.`,
          refs: [solo[0]] });
      } else {
        const picks = Array.from(groups.values()).map(g => g[0]);
        const comp0 = picks[0].split(".")[0];
        const sameChip = comp0 === picks[1].split(".")[0] &&
          (FOOTPRINTS[((q.components || []).find(x => x.id === comp0) || {}).footprint] || {}).kind === "dil";
        faults.push({ rank: 5, code: "split",
          msg: `${label(q, picks[0])} and ${label(q, picks[1])} need to be joined but are on ` +
               (isBread(board) ? "different nets — add a jumper wire."
                               : "different tracks — add a link wire.") +
               (sameChip ? " Two pins next to each other on a chip are not connected to each other." : ""),
          refs: picks.slice(0, 2) });
      }
      live.forEach(id => explained.add(id));
    });

    }  /* end if (!match && !chipBroken) */

    if (chipBroken)
      faults.push({ rank: 2.5, code: "chip-first",
        msg: (isBread(board) ? "Sort the chip out first — until it is sitting across the "
                             + "centre channel, "
                             : "Sort the chip and its track cuts out first — until they are right, ") +
             "the rest of the board cannot be checked properly.", refs: [] });

    /* rank 8 — test points, only where the question asks for them */
    if (q.tpRequired && q.tpRequired.length) {
      const tpNets = new Set((attempt.testpoints || []).map(tp => {
        const n = top.nodeOf.get(hid(parseRef(tp.at)));
        return n === undefined ? null : top.dsu.find(n);
      }).filter(Boolean));
      const uncovered = q.tpRequired.filter(pin => {
        const r = netOfPin.get(pin);
        return r === undefined || !tpNets.has(r);
      });
      if (uncovered.length) {
        faults.push({ rank: 8, code: "no-testpoint",
          msg: `No test point on ${uncovered.map(p => label(q, p)).join(", ")}. ` +
               `Qualifications Scotland: each sub-system input and output needs an appropriate test point, ` +
               `planned on the layout before you build.`,
          refs: uncovered });
      }
    }

    /* rank 8.5 — the reading the test point is FOR.
       A test point that is placed but never predicted is half the job: QVSR
       wants the expected value planned on the layout before the board is
       built, so the pupil says what it will read and the tool marks it.  The
       expected level is authored per NET (named by any pin on it), not per
       hole, because the pupil chooses where on that net to put the probe. */
    if (q.expect && q.expect.levels) {
      for (const pin of Object.keys(q.expect.levels)) {
        const root = netOfPin.get(pin);
        if (root === undefined) continue;            // that net is not built yet
        const tp = (attempt.testpoints || []).find(t => {
          const n = top.nodeOf.get(hid(parseRef(t.at)));
          return n !== undefined && top.dsu.find(n) === root;
        });
        if (!tp) continue;                           // rank 8 already reports the absence
        const want = q.expect.levels[pin];
        const got = tp.predict;
        if (got !== 0 && got !== 1) {
          faults.push({ rank: 8.5, code: "no-prediction",
            msg: `${tp.id} is on ${label(q, pin)}, but you have not said what it will read. ` +
                 `Work it out from the inputs — planning the expected reading is what the ` +
                 `test point is for.`, refs: [pin] });
        } else if (got !== want) {
          faults.push({ rank: 8.5, code: "wrong-prediction",
            msg: `${tp.id} is on ${label(q, pin)}. With ${inputsText(q)}, that point is ` +
                 `logic ${want}, not logic ${got}.`, refs: [pin] });
        }
      }
    }

    /* ------------------------------------------------------- warnings */

    /* rank 9 — a cut that separates nothing.  Never said of a cut UNDER a
       chip: the convention is that every track a DIL package crosses is cut
       between the two rows of pins, full stop, and a board that then takes the
       two spare inputs facing each other down to the same 0 V rail would
       otherwise be told its cut was pointless.  It is not — the rail joins
       them, the copper does not. */
    const underChip = new Set();
    for (const p of attempt.placements || []) {
      const fp = FOOTPRINTS[p.footprint];
      if (!fp || fp.kind !== "dil") continue;
      for (const cell of cellsOf(fp, parseRef(p.at), p.rot || 0).body) underChip.add(hid(cell));
    }
    for (const s of (isBread(board) ? [] : attempt.cuts || [])) {
      const h = parseRef(s);
      if (underChip.has(hid(h))) continue;
      const left = top.nodeOf.get(hid({ r: h.r, c: h.c - 1 }));
      const right = top.nodeOf.get(hid({ r: h.r, c: h.c + 1 }));
      if (left === undefined || right === undefined) continue;
      if (top.dsu.find(left) === top.dsu.find(right)) {
        warnings.push({ rank: 9, code: "pointless-cut",
          msg: `The cut at ${s} does nothing — both halves are joined again elsewhere.`, refs: [s] });
      }
    }

    // rank 10 — polarised part the wrong way round
    for (const p of attempt.placements || []) {
      const fp = FOOTPRINTS[p.footprint];
      if (!fp || !fp.polarised) continue;
      const [hiPin, loPin] = fp.polarised.map(x => p.id + "." + x);
      const th = tNetOf.get(hiPin), tl = tNetOf.get(loPin);
      const ah = netOfPin.get(hiPin), al = netOfPin.get(loPin);
      if (th === undefined || tl === undefined || ah === undefined || al === undefined) continue;
      // nets are right but swapped between the two legs
      const targetPair = [th, tl].join(">"), swapped = [tl, th].join(">");
      const pupilPair = [pupilIndex(targetNets, tNetOf, ah, netOfPin), pupilIndex(targetNets, tNetOf, al, netOfPin)].join(">");
      if (pupilPair === swapped && swapped !== targetPair) {
        warnings.push({ rank: 10, code: "reversed",
          msg: `${p.id} is connected to the right two nets but the wrong way round — ` +
               `check which end is which.`, refs: [p.id] });
      }
    }

    /* A chip straddling a breadboard's channel has no body cells — its package
       sits over the channel, which has no holes — so bodyAt alone let a jumper
       run straight across it.  Its two pin rows × its columns count as body for
       this one test (decided 15 Sep 2026), whichever way the jumper runs — and it is
       a fault, not a suggestion: a flat jumper through a DIP cannot be built. */
    const chipAt = new Map();
    if (isBread(board)) {
      const ch = board.channelAfter;
      for (const p of attempt.placements || []) {
        const fp = FOOTPRINTS[p.footprint];
        if (!fp || fp.kind !== "dil") continue;
        const holes = top.pins.filter(x => x.comp === p.id).map(x => x.hole);
        if (!holes.length || holes.some(h => h.r !== ch && h.r !== ch + 1)) continue;
        const lo = Math.min(...holes.map(h => h.c)), hi = Math.max(...holes.map(h => h.c));
        for (let c = lo; c <= hi; c++) {
          chipAt.set(hid({ r: ch, c }), p.id);
          chipAt.set(hid({ r: ch + 1, c }), p.id);
        }
      }
    }

    /* rank 11 — a link running over a component.

       Both orientations, and pins as well as bodies.  Until 21 Sep 2026 this
       walked ROW-running links only: `chipAt` is filled inside `isBread()`
       alone, so on a stripboard every COLUMN-running link took the `continue`,
       and `owner` was `along && …` so it could not have named a part anyway.
       A jumper straight down a column through a resistor standing across the
       tracks was therefore never reported — which is the commonest overlap
       there is on stripboard, where components and links both cross the
       tracks (pupil feedback, 21 Sep 2026).

       A BODY blocks and a bare leg does not: a link wire lies above the board
       and can pass over a leg soldered into a hole, which shipped reference
       answers rely on (greenhouse-irrigation runs C20–M20 over the +5 V
       terminal at F20).  Only the package is in the way. */
    for (const l of attempt.links || []) {
      const a = parseRef(l.a), b = parseRef(l.b);
      const along = a.r === b.r, down = a.c === b.c;
      if (!along && !down) continue;            // diagonal: rank 9 reports that
      const lo = along ? Math.min(a.c, b.c) : Math.min(a.r, b.r),
            hi = along ? Math.max(a.c, b.c) : Math.max(a.r, b.r);
      // lo..hi INCLUSIVE — see the matching note in linkCheck: an end landing
      // exactly on a body cell must fault the same as passing under one.
      for (let i = lo; i <= hi; i++) {
        const k = hid(along ? { r: a.r, c: i } : { r: i, c: a.c });
        const chip = chipAt.get(k), owner = top.bodyAt.get(k);
        if (chip) {
          faults.push({ rank: 11, code: "link-over-chip",
            msg: `The link ${holeName(board, a)}\u2013${holeName(board, b)} runs straight across ${chip} ` +
                 `\u2014 a jumper cannot lie flat through the chip. Take it round the end of the chip instead.`,
            refs: [chip] });
          break;
        }
        if (owner) {
          warnings.push({ rank: 11, code: "link-under-body",
            msg: `The link ${holeName(board, a)}–${holeName(board, b)} runs under ${owner} — ` +
                 (isBread(board) ? "you could not lay it there with the part in the way."
                                 : "on a real board you could not solder that."), refs: [owner] });
          break;
        }
      }
    }

    /* rank 11 — two links lying along each other (22 Sep 2026).  A shared END
       is already a topology hole-clash; this catches the rest, e.g. A7–G7
       over C7–E7, where no hole is shared by two ends. */
    const ls = attempt.links || [];
    for (let i = 0; i < ls.length; i++)
      for (let j = i + 1; j < ls.length; j++) {
        if (!linksOverlap(ls[i], ls[j])) continue;
        const nm = l => `${holeName(board, parseRef(l.a))}–${holeName(board, parseRef(l.b))}`;
        faults.push({ rank: 11, code: "link-over-link",
          msg: `The links ${nm(ls[i])} and ${nm(ls[j])} lie on top of each other — ` +
               `two wires cannot share the same holes. Move one of them.`, refs: [] });
      }

    faults.sort((x, y) => x.rank - y.rank);

    return {
      ok: match && faults.length === 0,
      match, stage: "netlist", faults, warnings,
      pupilSig, targetSig
    };
  }

  // which target net a pupil-net root corresponds to, by majority of its pins
  function pupilIndex(targetNets, tNetOf, root, netOfPin) {
    for (const [id, r] of netOfPin) if (r === root && tNetOf.has(id)) return tNetOf.get(id);
    return -1;
  }

  // "A = 1, B = 1, C = 0" — the input condition a prediction is made under
  function inputsText(q) {
    return (q.expect && q.expect.inputs || []).map(i => i[0] + " = " + i[1]).join(", ");
  }

  // human-readable name for a pin, for the message catalogue
  function label(q, pinId) {
    const [comp, pin] = pinId.split(".");
    const c = (q.components || []).find(x => x.id === comp);
    const fp = c ? FOOTPRINTS[c.footprint] : null;
    if (fp && fp.kind === "dil") return `${comp} pin ${pin}`;
    return comp;
  }

  /* -------------------------------------------- netlist of a board, direct
     Used by the golden tests: derive the netlist from a reference layout so it
     can be asserted against the authored target (PLAN.md R4). */

  function netlistOf(q, attempt) {
    const board = BOARDS[q.board];
    const top = topology(board, attempt);
    if (top.errors.length) return { errors: top.errors, nets: null };
    return { errors: [], nets: Array.from(netsOf(top).values()).map(l => l.slice().sort()) };
  }

  /* -------------------------------------------------- Trace mode primitives
     "Are these two holes connected?" (PLAN.md §4.1, Mode 1) is the single idea
     every other mode rests on, so it has to read off the same dsu Convert marks
     against — never a second, hand-rolled flood fill that could disagree.
     `netOf` also drives the reveal: every hole sharing the answer's root. */

  function netOf(board, attempt, holeRef) {
    const top = topology(board, attempt);
    const node = top.nodeOf.get(hid(parseRef(holeRef)));
    if (node === undefined) return null;          // off the board, or a cut hole (A2)
    const root = top.dsu.find(node);
    const holes = [];
    for (const [k, nd] of top.nodeOf)
      if (top.dsu.find(nd) === root) holes.push({ r: Math.floor(k / 1000), c: k % 1000 });
    holes.sort((a, b) => a.r - b.r || a.c - b.c);
    return holes.map(ref);
  }

  function sameNet(board, attempt, aRef, bRef) {
    const top = topology(board, attempt);
    const na = top.nodeOf.get(hid(parseRef(aRef)));
    const nb = top.nodeOf.get(hid(parseRef(bRef)));
    if (na === undefined || nb === undefined) return null;
    return top.dsu.find(na) === top.dsu.find(nb);
  }

  root.SBD = { BOARDS, FOOTPRINTS, AXIAL_LENGTHS, lengthsOf, GATES, DRIVER_PINS, gatesOf,
               isBread, nodesOf, rowName, holeName, bandName, netName,
               segmentsOf, makeDSU, topology, netsOf, stageOf,
               canonicalise, check, netlistOf, placeCheck, linkCheck, netOf, sameNet,
               ref, parseRef, rowLetter, hid, cellsOf };

})(typeof globalThis !== "undefined" ? globalThis : this);
