/* ============================================================================
   Stripboard Builder — board renderer
   ----------------------------------------------------------------------------
   Pure function: board + layout -> SVG string.  No DOM, so the same code runs
   under jsc for inspection and in the page.

   Drawing conventions are the teacher's Electronics in Meccano planning sheet
   (PLAN.md §4.3a), not invented here:
     - tracks run horizontally, drawn as continuous rounded strips
     - a cut is an X ON a hole, drawn over everything
     - an IC is a labelled rectangle with the part number inside, notch at the
       pin-1 end, and the column of cut X's showing through between its pin rows
     - footprints, never circuit symbols
     - link wires are coloured AND numbered
   ============================================================================ */
(function (root) {
  "use strict";

  const { BOARDS, FOOTPRINTS, cellsOf, parseRef, ref, rowLetter, hid, isBread } = root.SBD;

  const P = 24;          // grid pitch, logical px
  const PAD_L = 52;      // room for row letters AND edge-terminal labels
  const PAD_T = 26;      // room for column numbers
  const PAD_R = 12, PAD_B = 12;

  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const n = v => Math.round(v * 100) / 100;

  /* Hole centre in logical px.  A stripboard's rows are evenly spaced, a
     breadboard's are not — the two rails sit apart from the main block and the
     gap between row e and row f is 0.3 in, three pitches, which is the whole
     reason a DIP straddles it.  `ROWY` is that offset table, set from the board
     at the top of every entry point below.  Module-level rather than threaded
     through nine drawers: rendering is one synchronous pass over one board, and
     every entry point sets it before drawing anything. */
  let ROWY = null, PADT = 26, PADR = 12;
  const X = c => PAD_L + (c - 0.5) * P;
  const Y = r => PADT + ((ROWY ? ROWY[r] : r) + 0.5) * P;
  function useBoard(board) {
    ROWY = (board && board.rowY) || null;
    PADT = isBread(board) ? 22 : PAD_T;
    PADR = isBread(board) ? 34 : PAD_R;      // row letters print down BOTH edges
    return board;
  }

  const LINK_COLOURS = {
    red: "#c0392b", black: "#2b2b2b", blue: "#2668b8", green: "#1d8a4e",
    yellow: "#d3a017", orange: "#d2691e", white: "#8a8a8a",
    purple: "#8e44ad", brown: "#7b4a2a", grey: "#607078",
    /* Striped wire: black insulation with a coloured pinstripe, the kit's own
       convention for a wire that needs to stand out from the plain colours
       without spending a whole new insulation colour on it. The BASE here is
       always black — drawTerminal() and the link-wire drawer both lay a
       thinner STRIPE_ACCENT line over this one to print the stripe. */
    "black-yellow": "#2b2b2b", "black-orange": "#2b2b2b", "black-blue": "#2b2b2b",
    "black-green": "#2b2b2b", "black-purple": "#2b2b2b", "black-grey": "#2b2b2b"
  };
  const STRIPE_ACCENT = {
    "black-yellow": "#d3a017", "black-orange": "#d2691e", "black-blue": "#2668b8",
    "black-green": "#1d8a4e", "black-purple": "#8e44ad", "black-grey": "#607078"
  };

  /* ---- component body colours ---------------------------------------------
     A real board is not white.  A resistor is brown, an LED red, a diode black
     with a silver band — and a layout diagram a pupil is meant to hold against
     the parts in front of them has to say so.

     `fill` is the body; `ink` is what is printed ON it — a diode's cathode
     band, a TO-220's tab, an electrolytic's +, a thermistor's sensing bar.
     Both are fixed colours and not theme tokens, because the part is the
     colour it is in a dark room too; the body's OUTLINE is deliberately left
     to the theme, which is what keeps a black diode visible on the dark
     board (its fill and the board behind it are both nearly black, so the
     outline is the only thing separating them). */
  const BODY_COLOURS = {
    brown:  { fill: "#a9713f", ink: "#f4f7f8" },
    red:    { fill: "#d3453a", ink: "#f4f7f8" },
    orange: { fill: "#e0892c", ink: "#1d2a24" },
    yellow: { fill: "#e4c342", ink: "#1d2a24" },
    green:  { fill: "#3d9a5c", ink: "#f4f7f8" },
    blue:   { fill: "#3a6fb5", ink: "#f4f7f8" },
    purple: { fill: "#8352a8", ink: "#f4f7f8" },
    grey:   { fill: "#c2c8cc", ink: "#1d2a24" },
    black:  { fill: "#2e3234", ink: "#f4f7f8" },
    white:  { fill: "#f3f5f6", ink: "#1d2a24" }
  };
  /* The colour a part is when nobody has chosen one: the part as it comes out
     of the box.  Keyed by the footprint's `sym`, or its `kind` where the
     drawer has no sym of its own (a plain axial IS the resistor). */
  const BODY_DEFAULT = {
    axial: "brown", res: "brown", ther: "brown", led: "red", ldr: "yellow",
    cap: "orange", ecap: "blue", diode: "black",
    pot: "blue", to220: "black", spdt: "grey", can: "grey", to92: "black",
    buzzer: "black", button: "black"
  };
  // which parts a pupil may recolour — everything with a body, chips and
  // terminals excepted (a terminal's colour is its WIRE's colour, set already)
  const bodyColourable = fp => !!(fp && BODY_DEFAULT[fp.sym || fp.kind]);

  /* Paint a drawn part.  Done as a pass over the finished SVG rather than an
     argument threaded through eleven drawers: the body shape is always
     `class="sbd-body"`, whatever drew it, so there is one place to change and
     no drawer can be forgotten.
     An inline STYLE, not a fill attribute: on the page the class rules are real
     CSS and win over a presentation attribute — the trap the terminal wire
     colour already hit once. */
  function paintBody(svg, p, fp) {
    const key = (p.colour && BODY_COLOURS[p.colour]) ? p.colour
                                                    : BODY_DEFAULT[fp.sym || fp.kind];
    const c = BODY_COLOURS[key];
    if (!c) return svg;
    return svg
      .replace(/class="sbd-body"/g, `class="sbd-body" style="fill:${c.fill}"`)
      .replace(/class="sbd-(mark|pmark)"/g, `class="sbd-$1" style="fill:${c.ink}"`)
      .replace(/class="sbd-bline"/g, `class="sbd-bline" style="stroke:${c.ink}"`);
  }

  /* What is actually printed on the chip.  The data sheet the course works from
     names the quad-gate parts 7408, 7432 and so on; the chips in the drawer are
     the HC family and say 74HC08.  A pupil holding one against the drawing has
     to find the same string on both, so the PACKAGE carries the real marking
     and every word of text around it stays with the data sheet. */
  const chipPrint = part => /^74\d\d$/.test(part) ? "74HC" + part.slice(2) : part;

  /* One palette table drives two outputs: the <style> block the page uses (CSS
     custom properties, so the teal sheet can re-theme it) and the flattened
     presentation attributes the offline preview needs.  MuPDF — which is how
     these diagrams get inspected — does not apply CSS class selectors, so a
     class-only SVG rasterises as solid black.  Keeping one table means the
     thing I look at and the thing that ships cannot drift in colour.
     `[token, fallback]` becomes var(--token, fallback); `[null, v]` is literal. */
  const SANS = "ui-sans-serif, system-ui, -apple-system, Helvetica, sans-serif";
  const MONO = "ui-monospace, Menlo, monospace";
  const CLASSES = {
    "sbd-track": { fill: ["--sbd-track", "#d7ded9"] },
    "sbd-hole":  { fill: ["--sbd-hole", "#fbfdfc"], stroke: ["--sbd-holeline", "#b9c4bd"],
                   "stroke-width": [null, "0.8"] },
    "sbd-lab":   { fill: ["--sbd-lab", "#6b7a72"], "font-family": [null, SANS],
                   "font-size": [null, "11px"], "font-weight": [null, "700"] },
    "sbd-body":  { fill: ["--sbd-body", "#ffffff"], "fill-opacity": [null, "0.95"],
                   stroke: ["--sbd-ink", "#1d2a24"], "stroke-width": [null, "1.6"] },
    "sbd-lead":  { fill: [null, "none"], stroke: ["--sbd-ink", "#1d2a24"],
                   "stroke-width": [null, "1.6"] },
    /* A line drawn ON a component body — a thermistor's sensing bar, an LDR's
       zigzag, a preset's slot.  Separate from sbd-lead, which is the legs:
       these recolour with the body they are printed on, the legs do not. */
    "sbd-bline": { fill: [null, "none"], stroke: ["--sbd-ink", "#1d2a24"],
                   "stroke-width": [null, "1.6"] },
    "sbd-pin":   { fill: ["--sbd-ink", "#1d2a24"] },
    // the b / c / e letters on a transistor can, where the outline alone
    // cannot say which leg is which
    "sbd-leg":   { fill: ["--sbd-ink", "#1d2a24"], "font-family": [null, MONO],
                   "font-size": [null, "9px"], "font-weight": [null, "700"] },
    "sbd-id":    { fill: ["--sbd-ink", "#1d2a24"], "font-family": [null, SANS],
                   "font-size": [null, "11px"], "font-weight": [null, "800"] },
    "sbd-pn":    { fill: ["--sbd-ink", "#1d2a24"], "font-family": [null, MONO],
                   "font-size": [null, "8px"], "font-weight": [null, "700"] },
    /* The part number printed on a chip.  Set ALONG the package the way the
       real silkscreen is, and big enough to read at the scale the board is
       drawn — the 8px `sbd-pn` under the package was unreadable on screen. */
    "sbd-icn":   { fill: ["--sbd-ink", "#1d2a24"], "font-family": [null, MONO],
                   "font-size": [null, "13px"], "font-weight": [null, "700"],
                   "letter-spacing": [null, "0.06em"] },
    /* A DIL package is a grey body, not a white hole in the board — but a LIGHT
       grey, because three things have to stay readable ON it: the pin numbers,
       the printed part code, and the column of red cut X's that the tool draws
       through the package on purpose. */
    "sbd-ic":    { fill: ["--sbd-icfill", "#c3c9cd"], "fill-opacity": [null, "0.92"],
                   stroke: ["--sbd-ink", "#1d2a24"], "stroke-width": [null, "1.8"] },
    "sbd-cut":   { fill: [null, "none"], stroke: ["--sbd-cut", "#c0392b"],
                   "stroke-width": [null, "2.6"], "stroke-linecap": [null, "round"] },
    "sbd-tp":    { fill: [null, "none"], stroke: ["--sbd-tp", "#1d6fa5"],
                   "stroke-width": [null, "2"] },
    "sbd-tpl":   { fill: ["--sbd-tp", "#1d6fa5"], "font-family": [null, SANS],
                   "font-size": [null, "9px"], "font-weight": [null, "800"] },
    "sbd-lnum":  { fill: [null, "#ffffff"], "font-family": [null, SANS],
                   "font-size": [null, "8px"], "font-weight": [null, "800"] },
    /* A black link wire on the dark board is black on near-black: invisible.
       The wire stays black (it is black in the kit tray too); the dark theme
       sets --sbd-lhalo and a light outline appears round it.  Unset — light
       mode, and every exported PNG — it is `none`, so nothing is drawn. */
    "sbd-lhalo": { fill: [null, "none"], stroke: ["--sbd-lhalo", "none"],
                   "stroke-width": [null, "5.6"], "stroke-linecap": [null, "round"] },
    // the same outline round the numbered dot on a black-based wire
    "sbd-ldot":  { stroke: ["--sbd-lhalo", "none"], "stroke-width": [null, "1.2"] },
    "sbd-bg":    { fill: ["--sbd-page", "#fbfdfc"] },

    /* ---- breadboard ----
       The slab a real prototype board is moulded from, the recessed channel
       down its middle, and the two printed rail lines.  The rail colours are
       the only fixed ones here: red and blue are printed on the plastic, so
       they are the same in a dark room, exactly like a component body. */
    "sbd-bbslab":  { fill: ["--sbd-bbslab", "#eef1ef"], stroke: ["--sbd-holeline", "#b9c4bd"],
                     "stroke-width": [null, "1.2"] },
    "sbd-bbchan":  { fill: ["--sbd-bbchan", "#dde3df"], stroke: ["--sbd-holeline", "#b9c4bd"],
                     "stroke-width": [null, "0.8"] },
    "sbd-bbpos":   { fill: [null, "none"], stroke: [null, "#c0392b"], "stroke-width": [null, "1.8"] },
    "sbd-bbneg":   { fill: [null, "none"], stroke: [null, "#2668b8"], "stroke-width": [null, "1.8"] },
    "sbd-bbposl":  { fill: [null, "#c0392b"], "font-family": [null, SANS],
                     "font-size": [null, "13px"], "font-weight": [null, "800"] },
    "sbd-bbnegl":  { fill: [null, "#2668b8"], "font-family": [null, SANS],
                     "font-size": [null, "13px"], "font-weight": [null, "800"] },

    /* highlight layer — used by the page to point at a fault, and by nothing
       else; kept in the one palette table so it themes like everything else */
    "sbd-hl":    { fill: [null, "none"], stroke: ["--sbd-hl", "#e08a00"],
                   "stroke-width": [null, "2.6"] },
    /* second highlight colour — Trace mode rings the OTHER net a different
       colour when two tapped holes turn out not to be the same one, so the
       boundary between them (a cut, a missing link) reads at a glance */
    "sbd-hl2":   { fill: [null, "none"], stroke: ["--sbd-hl2", "#1d6fa5"],
                   "stroke-width": [null, "2.6"] },
    "sbd-cur":   { fill: [null, "none"], stroke: ["--sbd-cur", "#0a9d7f"],
                   "stroke-width": [null, "2.4"] },
    "sbd-ghost": { fill: ["--sbd-cur", "#0a9d7f"], "fill-opacity": [null, "0.22"],
                   stroke: ["--sbd-cur", "#0a9d7f"], "stroke-width": [null, "1.4"] },
    "sbd-gpin":  { fill: ["--sbd-cur", "#0a9d7f"], "fill-opacity": [null, "0.75"] },
    "sbd-bad":   { fill: ["--sbd-cut", "#c0392b"], "fill-opacity": [null, "0.3"],
                   stroke: ["--sbd-cut", "#c0392b"], "stroke-width": [null, "1.6"] },

    /* circuit diagrams (PLAN.md §4.1: the diagram beside the board).  Same
       table, so a schematic and a layout cannot drift apart in colour. */
    "sbd-wire":  { fill: [null, "none"], stroke: ["--sbd-ink", "#1d2a24"],
                   "stroke-width": [null, "1.8"], "stroke-linecap": [null, "round"] },
    "sbd-part":  { fill: ["--sbd-body", "#ffffff"], stroke: ["--sbd-ink", "#1d2a24"],
                   "stroke-width": [null, "1.8"] },
    "sbd-node":  { fill: ["--sbd-ink", "#1d2a24"] },
    "sbd-clab":  { fill: ["--sbd-ink", "#1d2a24"], "font-family": [null, SANS],
                   "font-size": [null, "11px"], "font-weight": [null, "700"] },
    /* Supply convention, the same one the wiring schedule uses: +5 V red,
       0 V black.  Only the positive rail needs a class — everything else is
       already drawn in ink. */
    "sbd-pos":   { fill: [null, "none"], stroke: ["--sbd-pos", "#c0392b"],
                   "stroke-width": [null, "1.8"], "stroke-linecap": [null, "round"] },
    "sbd-posf":  { fill: ["--sbd-body", "#ffffff"], stroke: ["--sbd-pos", "#c0392b"],
                   "stroke-width": [null, "1.8"] },
    "sbd-poslab":{ fill: ["--sbd-pos", "#c0392b"], "font-family": [null, SANS],
                   "font-size": [null, "11px"], "font-weight": [null, "700"] },
    "sbd-posid": { fill: ["--sbd-pos", "#c0392b"], "font-family": [null, SANS],
                   "font-size": [null, "11px"], "font-weight": [null, "800"] },
    /* The polarity or orientation mark printed on a part: a diode's cathode
       band, a TO-220's tab.  Solid ink, no outline — it is a marking on the
       body, not another piece of the body. */
    "sbd-mark":  { fill: ["--sbd-ink", "#1d2a24"], stroke: [null, "none"] },
    /* The + on an electrolytic: a polarity mark like any other, but TEXT, so it
       needs its own class to be recoloured with the body it is printed on. */
    "sbd-pmark": { fill: ["--sbd-ink", "#1d2a24"], stroke: [null, "none"],
                   "font-family": [null, SANS], "font-size": [null, "12px"],
                   "font-weight": [null, "800"] },
    "sbd-chip":  { fill: [null, "none"], stroke: ["--sbd-ink", "#1d2a24"],
                   "stroke-width": [null, "1.2"], "stroke-dasharray": [null, "5 4"] },
    "sbd-cnet":  { fill: ["--sbd-tp", "#1d6fa5"], "font-family": [null, SANS],
                   "font-size": [null, "10px"], "font-weight": [null, "800"] }
  };

  const STYLE = Object.keys(CLASSES).map(k => {
    const decls = Object.keys(CLASSES[k]).map(prop => {
      const [tok, fb] = CLASSES[k][prop];
      return `${prop}:${tok ? `var(${tok}, ${fb})` : fb}`;
    }).join(";");
    return `  .${k}{${decls}}`;
  }).join("\n");

  // flatten class="sbd-x" to presentation attributes, for offline rasterising
  function inlineClasses(svg) {
    return svg.replace(/class="([\w-]+)"/g, (m, k) => {
      const def = CLASSES[k];
      if (!def) return m;
      return Object.keys(def).map(p => `${p}="${def[p][1]}"`).join(" ");
    });
  }

  /* ------------------------------------------------------------ components */

  function drawAxial(p, fp, cells) {
    // one body block between the two legs, leads out to each pin
    const a = cells.pins[0].hole, b = cells.pins[1].hole;
    const horiz = a.r === b.r;
    const x1 = X(a.c), y1 = Y(a.r), x2 = X(b.c), y2 = Y(b.r);
    /* Leave a visible lead each end — but never more than the legs are apart,
       or a two-hole part (a thermistor bent right up, say) ends up with a body
       of negative width and draws as nothing but its leads. */
    const gap = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    const inset = Math.min(P * 0.62, gap * 0.26);
    const bx1 = horiz ? Math.min(x1, x2) + inset : x1 - P * 0.34;
    const bx2 = horiz ? Math.max(x1, x2) - inset : x1 + P * 0.34;
    const by1 = horiz ? y1 - P * 0.34 : Math.min(y1, y2) + inset;
    const by2 = horiz ? y1 + P * 0.34 : Math.max(y1, y2) - inset;
    let s = `<line class="sbd-lead" x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}"/>`;

    if (fp.sym === "led") {
      // LED: circular body with the cathode side flattened, so polarity reads
      const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, rr = P * 0.42;
      const k = cells.pins.find(z => z.pin === "k").hole;
      const flatHoriz = horiz;
      const sign = flatHoriz ? (X(k.c) > cx ? 1 : -1) : (Y(k.r) > cy ? 1 : -1);
      // D-shape: round body, flat face on the cathode side, so which leg is
      // which is readable without a label (the real LED's own convention)
      const f = rr * 0.72;                       // where the flat cuts the circle
      const d = flatHoriz
        ? `M ${n(cx + sign * f)} ${n(cy - rr * 0.7)} A ${n(rr)} ${n(rr)} 0 ${sign > 0 ? "1 0" : "1 1"} ` +
          `${n(cx + sign * f)} ${n(cy + rr * 0.7)} Z`
        : `M ${n(cx - rr * 0.7)} ${n(cy + sign * f)} A ${n(rr)} ${n(rr)} 0 ${sign > 0 ? "1 1" : "1 0"} ` +
          `${n(cx + rr * 0.7)} ${n(cy + sign * f)} Z`;
      s += `<path class="sbd-body" d="${d}"/>`;
      return s;
    }
    if (fp.sym === "ldr") {
      // LDR footprint: a circle body with a resistor-style zigzag inside it
      // and two leads — the diagonal "light" arrows are a SCHEMATIC symbol
      // convention (sbd-circuit.js's ldr()), not part of what a pupil solders,
      // so the board footprint stays a plain component body, unpolarised.
      const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, rr = P * 0.42, zz = rr * 0.62;
      s += `<circle class="sbd-body" cx="${n(cx)}" cy="${n(cy)}" r="${n(rr)}"/>`;
      const pts = horiz
        ? [[cx - zz, cy], [cx - zz * 0.5, cy - zz * 0.5], [cx, cy + zz * 0.5],
           [cx + zz * 0.5, cy - zz * 0.5], [cx + zz, cy]]
        : [[cx, cy - zz], [cx - zz * 0.5, cy - zz * 0.5], [cx + zz * 0.5, cy],
           [cx - zz * 0.5, cy + zz * 0.5], [cx, cy + zz]];
      s += `<path class="sbd-bline" d="M ${pts.map(z => n(z[0]) + " " + n(z[1])).join(" L ")}"/>`;
      return s;
    }
    if (fp.sym === "buzzer") {
      // a round piezo buzzer: a black disc over both legs, + beside the + leg,
      // the sound hole in the middle
      const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, rr = P * 1.05;
      const plus = cells.pins.find(z => z.pin === "+").hole;
      s += `<circle class="sbd-body" cx="${n(cx)}" cy="${n(cy)}" r="${n(rr)}"/>`;
      s += `<circle class="sbd-bline" cx="${n(cx)}" cy="${n(cy)}" r="${n(P * 0.22)}"/>`;
      const ux = X(plus.c) - cx, uy = Y(plus.r) - cy;
      const m = Math.sqrt(ux * ux + uy * uy) || 1;
      s += `<text class="sbd-pmark" x="${n(cx + (ux / m) * rr * 0.55)}" ` +
           `y="${n(cy + (uy / m) * rr * 0.55 + 4)}" text-anchor="middle">+</text>`;
      return s;
    }
    if (fp.sym === "cap") {
      // a radial capacitor: a plain disc sitting over its two legs
      const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
      s += `<circle class="sbd-body" cx="${n(cx)}" cy="${n(cy)}" r="${n(P * 0.52)}"/>`;
      return s;
    }
    if (fp.sym === "ther") {
      // the resistor body with the sensing bar drawn through it, corner to
      // corner — the one mark that separates a thermistor from a resistor on a
      // board where both are brown rectangles
      s += `<rect class="sbd-body" x="${n(bx1)}" y="${n(by1)}" width="${n(bx2 - bx1)}" ` +
           `height="${n(by2 - by1)}" rx="${n(P * 0.16)}"/>`;
      const ov = P * 0.3;
      s += horiz
        ? `<line class="sbd-bline" x1="${n(bx1 - ov)}" y1="${n(by2 + ov * 0.5)}" ` +
          `x2="${n(bx2 + ov)}" y2="${n(by1 - ov * 0.5)}"/>`
        : `<line class="sbd-bline" x1="${n(bx1 - ov * 0.5)}" y1="${n(by2 + ov)}" ` +
          `x2="${n(bx2 + ov * 0.5)}" y2="${n(by1 - ov)}"/>`;
      return s;
    }
    if (fp.sym === "diode") {
      // a cylinder with the cathode band on it — the band IS the polarity mark
      // on a real diode, so the footprint carries nothing else
      const k = cells.pins.find(z => z.pin === "k").hole;
      s += `<rect class="sbd-body" x="${n(bx1)}" y="${n(by1)}" width="${n(bx2 - bx1)}" ` +
           `height="${n(by2 - by1)}" rx="${n(P * 0.16)}"/>`;
      const band = P * 0.22;
      s += horiz
        ? `<rect class="sbd-mark" x="${n(X(k.c) > (x1 + x2) / 2 ? bx2 - band - 1 : bx1 + 1)}" ` +
          `y="${n(by1)}" width="${n(band)}" height="${n(by2 - by1)}"/>`
        : `<rect class="sbd-mark" x="${n(bx1)}" ` +
          `y="${n(Y(k.r) > (y1 + y2) / 2 ? by2 - band - 1 : by1 + 1)}" ` +
          `width="${n(bx2 - bx1)}" height="${n(band)}"/>`;
      return s;
    }
    if (fp.sym === "ecap") {
      const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, rr = P * 0.42;
      const plus = cells.pins.find(z => z.pin === "+").hole;
      s += `<circle class="sbd-body" cx="${n(cx)}" cy="${n(cy)}" r="${n(rr)}"/>`;
      const ux = X(plus.c) - cx, uy = Y(plus.r) - cy;
      const m = Math.sqrt(ux * ux + uy * uy) || 1;
      const mx = cx + (ux / m) * rr * 0.44, my = cy + (uy / m) * rr * 0.44;
      s += `<text class="sbd-pmark" x="${n(mx)}" y="${n(my + 4)}" text-anchor="middle">+</text>`;
      return s;
    }
    s += `<rect class="sbd-body" x="${n(bx1)}" y="${n(by1)}" width="${n(bx2 - bx1)}" ` +
         `height="${n(by2 - by1)}" rx="${n(P * 0.16)}"/>`;
    return s;
  }

  function drawDil(p, fp, cells) {
    const rs = cells.pins.map(z => z.hole.r), cs = cells.pins.map(z => z.hole.c);
    const r0 = Math.min(...rs), r1 = Math.max(...rs);
    const c0 = Math.min(...cs), c1 = Math.max(...cs);
    const x = X(c0) - P * 0.42, y = Y(r0) - P * 0.42;
    const w = X(c1) - X(c0) + P * 0.84, h = Y(r1) - Y(r0) + P * 0.84;
    let s = `<rect class="sbd-ic" x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="3"/>`;

    // pin 1 and pin N are the two ends of the notched edge
    const p1 = cells.pins.find(z => z.pin === "1").hole;
    const pLast = cells.pins.find(z => z.pin === String(fp.pinCount)).hole;

    // pin 1 and pin N are the two ends of the notched edge: if they share a
    // row the package runs down the board and the notch is on the top edge
    if (p1.r === pLast.r) {
      const nx = (X(p1.c) + X(pLast.c)) / 2;
      // sweep 0, not 1: the notch must dip INTO the package (increasing y,
      // since the body extends downward from this top edge), not bulge out
      // above it. Confirmed by rendering and looking, not by re-deriving the
      // arc maths — the same maths was "fixed" once before and was still
      // wrong (PLAN.md/STATE.md Phase 2), so this time it's a screenshot.
      s += `<path class="sbd-lead" d="M ${n(nx - 5)} ${n(y)} a 5 5 0 0 0 10 0"/>`;
    } else {
      const ny = (Y(p1.r) + Y(pLast.r)) / 2;
      // same fix, other axis: sweep 1 dips RIGHT into the body from the
      // left edge, not left and out of it. Also confirmed by rendering.
      s += `<path class="sbd-lead" d="M ${n(x)} ${n(ny - 5)} a 5 5 0 0 1 0 10"/>`;
    }

    const cx = x + w / 2, cy = y + h / 2;
    /* h > w ties on a square package (dip-8 is 4 rows x 4 cols), so take the
       orientation from the pins: pin 1 sharing a ROW with pin N means the two
       pin columns run down the board, and both the printed code and the pin
       numbers follow that and not the bounding box. */
    const vertical = p1.r === pLast.r;

    /* Item ID above the package; the part number ON it, along its length, the
       way the real silkscreen is printed — reported unreadable at 8px under the
       package, and "which chip is that" is the first thing a pupil checks.

       The package is four columns wide with the two pin columns at its edges,
       so its centre line falls BETWEEN the two columns a cut can be made in
       (c+1 or c+2, the pupil's choice) — half a pitch clear of either.  That is
       what makes an inside label possible at all, and it is why the text is
       centred and not nudged: nudged, it lands on the cuts. */
    s += `<text class="sbd-id" x="${n(cx)}" y="${n(y - 9)}" text-anchor="middle">${esc(p.id)}</text>`;
    if (p.part) {
      const code = esc(chipPrint(p.part));
      /* The two inner columns are where the cuts go, and the cuts are drawn
         OVER the package on purpose.  So the code steps aside into whichever
         of the two the pupil did not cut, and stays centred only when both are
         clear (nothing placed yet) or both are cut. */
      const cutIn = k => (p.cuts || []).some(t => {
        const h = parseRef(t);
        return vertical ? (h.c === k && h.r >= r0 && h.r <= r1)
                        : (h.r === k && h.c >= c0 && h.c <= c1);
      });
      const near = cutIn(vertical ? c0 + 1 : r0 + 1);
      const far  = cutIn(vertical ? c0 + 2 : r0 + 2);
      const off = near === far ? 0 : (near ? P / 2 : -P / 2);
      s += vertical
        ? `<text class="sbd-icn" transform="translate(${n(cx + off)} ${n(cy)}) rotate(90)" ` +
          `text-anchor="middle" dy="4.5">${code}</text>`
        : `<text class="sbd-icn" x="${n(cx)}" y="${n(cy + off + 4.5)}" text-anchor="middle">${code}</text>`;
    }

    /* pin numbers offset inward along the package's SHORT axis — offsetting
       horizontally on a package that lies along the tracks bunches all seven
       numbers into the middle */
    for (const z of cells.pins) {
      const px = X(z.hole.c), py = Y(z.hole.r);
      const dx = vertical ? (px < cx ? 8 : -8) : 0;
      const dy = vertical ? 3 : (py < cy ? 12 : -6);
      s += `<text class="sbd-pn" x="${n(px + dx)}" y="${n(py + dy)}" text-anchor="middle">${z.pin}</text>`;
    }
    return s;
  }

  /* The tactile push button: a square black body over its four legs (they sit
     either side of the channel) with the round grey plunger in the middle. */
  function drawButton(p, fp, cells) {
    const xs = cells.pins.map(z => X(z.hole.c)), ys = cells.pins.map(z => Y(z.hole.r));
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const pad = P * 0.30, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    let s = "";
    for (const z of cells.pins)
      s += `<line class="sbd-lead" x1="${n(X(z.hole.c))}" y1="${n(Y(z.hole.r))}" ` +
           `x2="${n(X(z.hole.c))}" y2="${n(Y(z.hole.r) < cy ? y0 + pad : y1 - pad)}"/>`;
    s += `<rect class="sbd-body" x="${n(x0 - pad * 0.4)}" y="${n(y0 + pad)}" ` +
         `width="${n(x1 - x0 + pad * 0.8)}" height="${n(y1 - y0 - 2 * pad)}" rx="3"/>`;
    s += `<circle class="sbd-mark" cx="${n(cx)}" cy="${n(cy)}" r="${n(P * 0.62)}"/>`;
    return s;
  }

  function drawTerminal(p, fp, cells) {
    let s = "";
    // +5 V is red, everything else is ink — the wiring-schedule convention the
    // schematic uses, so the two pictures agree (§4.3a)
    const box = p.pos ? "sbd-posf" : "sbd-body";
    /* An input or output terminal can carry a chosen wire colour, because on
       the real board it is a wire leaving the board and the schedule says what
       colour it is.  Drawn as the outline, not a fill: the terminal still has
       to read as a terminal. */
    /* An inline STYLE, not a stroke attribute: on the page the class rules are
       real CSS and would win over a presentation attribute, so the terminal
       came out in ink however it was set.  (It looked right in the exported
       SVGs, where the classes are flattened to attributes — which is exactly
       the sort of difference that only a look at the live page catches.) */
    const col = !p.pos && p.colour && LINK_COLOURS[p.colour];
    const stripe = !p.pos && p.colour && STRIPE_ACCENT[p.colour];
    const paint = col ? ` style="stroke:${col};stroke-width:2.4"` : "";
    for (const z of cells.pins) {
      const px = X(z.hole.c), py = Y(z.hole.r), k = P * 0.40;
      s += `<rect class="${box}"${paint} x="${n(px - k)}" y="${n(py - k)}" width="${n(k * 2)}" ` +
           `height="${n(k * 2)}" rx="2"/>` +
           `<line class="sbd-lead"${col ? ` style="stroke:${col}"` : ""} x1="${n(px - k * 0.5)}" ` +
           `y1="${n(py)}" x2="${n(px + k * 0.5)}" y2="${n(py)}"/>` +
           // the stripe itself: a thinner line of the accent colour down the
           // middle of the black lead just drawn, exactly where the printed
           // pinstripe runs on the real wire
           (stripe ? `<line style="stroke:${stripe};stroke-width:1" x1="${n(px - k * 0.5)}" ` +
             `y1="${n(py)}" x2="${n(px + k * 0.5)}" y2="${n(py)}"/>` : "");
    }
    return s;
  }

  /* The metal-can NPN.  Its three legs are a triangle, so the drawing has to
     say which leg is which — a pupil cannot work it out from the outline the
     way they can with a resistor.  The can is a circle over all three, the tab
     is the flat at the bottom left, and each leg carries its letter.  Fitted
     the way the kit shows it: c at the top, e at the bottom, b to the right. */
  function drawCan(p, fp, cells) {
    const xs = cells.pins.map(z => X(z.hole.c)), ys = cells.pins.map(z => Y(z.hole.r));
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    // big enough to cover all three legs, which sit at up to ~1.12 pitches out
    const rr = P * 1.28;
    let g = `<circle class="sbd-body" cx="${n(cx)}" cy="${n(cy)}" r="${n(rr)}"/>`;

    /* The locating tab, at the bottom left — the one feature that says which
       way round the can is fitted, and the thing a pupil lines up against the
       drawing on their planning sheet. */
    const pt = (a, r) => `${n(cx + Math.cos(a) * r)},${n(cy + Math.sin(a) * r)}`;
    // cellsOf() turns a footprint clockwise on screen, so the tab turns with it
    const turn = (p.rot || 0) * Math.PI / 180;
    const a0 = Math.PI * 0.78 + turn, a1 = Math.PI * 0.97 + turn;   // down and to the left at rot 0
    g += `<polygon class="sbd-mark" points="${pt(a0, rr * 0.92)} ${pt(a0, rr * 1.3)} ` +
         `${pt(a1, rr * 1.3)} ${pt(a1, rr * 0.92)}"/>`;

    // each leg named, set just outside the can on the line from its centre
    for (const z of cells.pins) {
      const px = X(z.hole.c), py = Y(z.hole.r);
      const a = Math.atan2(py - cy, px - cx) || 0;
      const lx = cx + Math.cos(a) * (rr + 8), ly = cy + Math.sin(a) * (rr + 8);
      g += `<text class="sbd-leg" x="${n(lx)}" y="${n(ly + 3.2)}" ` +
           `text-anchor="middle">${z.pin}</text>`;
    }
    return g;
  }

  function drawTo92(p, fp, cells) {
    const xs = cells.pins.map(z => X(z.hole.c)), ys = cells.pins.map(z => Y(z.hole.r));
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const spanH = Math.max(...xs) - Math.min(...xs) > Math.max(...ys) - Math.min(...ys);
    const rr = P * 0.72;

    /* An SPDT slide switch: body with the slider knob drawn over the pin the
       common pole is nearest — the picture a pupil compares with the real part. */
    if (fp.sym === "spdt") {
      const h = P * 0.66;
      const x = cx - (spanH ? P * 1.6 : h), y = cy - (spanH ? h : P * 1.6);
      const w = spanH ? P * 3.2 : h * 2, ht = spanH ? h * 2 : P * 3.2;
      const kn = P * 0.34;
      return `<rect class="sbd-body" x="${n(x)}" y="${n(y)}" width="${n(w)}" ` +
             `height="${n(ht)}" rx="${n(P * 0.12)}"/>` +
             `<rect class="sbd-mark" x="${n(cx - (spanH ? kn : kn * 0.6))}" ` +
             `y="${n(cy - (spanH ? kn * 0.6 : kn))}" ` +
             `width="${n(spanH ? kn * 2 : kn * 1.2)}" ` +
             `height="${n(spanH ? kn * 1.2 : kn * 2)}" rx="1.5"/>`;
    }
    // a preset potentiometer: square body, the wiper's slot across it
    if (fp.sym === "pot") {
      const h = P * 0.62;
      let g = `<rect class="sbd-body" x="${n(cx - (spanH ? P * 1.1 : h))}" ` +
              `y="${n(cy - (spanH ? h : P * 1.1))}" ` +
              `width="${n(spanH ? P * 2.2 : h * 2)}" height="${n(spanH ? h * 2 : P * 2.2)}" ` +
              `rx="${n(P * 0.14)}"/>`;
      g += `<line class="sbd-bline" x1="${n(cx - P * 0.3)}" y1="${n(cy - P * 0.3)}" ` +
           `x2="${n(cx + P * 0.3)}" y2="${n(cy + P * 0.3)}"/>`;
      return g;
    }
    /* A TO-220: rectangular body with the metal tab marked at the GATE end.
       Marking the gate end rather than one fixed edge does two jobs — it
       shows which way round the part has been fitted (g, d, s reverse when it
       is rotated 180°, and a drawing that cannot show that is no use), and it
       keeps the mark off the top edge, where the item ID is written. */
    if (fp.sym === "to220") {
      const h = P * 0.7, tab = P * 0.26;
      const x = cx - (spanH ? P * 1.15 : h), y = cy - (spanH ? h : P * 1.15);
      const w = spanH ? P * 2.3 : h * 2, ht = spanH ? h * 2 : P * 2.3;
      const g = cells.pins.find(z => z.pin === "g").hole;
      const atEnd = spanH ? X(g.c) > cx : Y(g.r) > cy;
      return `<rect class="sbd-body" x="${n(x)}" y="${n(y)}" width="${n(w)}" ` +
             `height="${n(ht)}" rx="${n(P * 0.12)}"/>` +
             (spanH
               ? `<rect class="sbd-mark" x="${n(atEnd ? x + w - tab : x)}" y="${n(y)}" ` +
                 `width="${n(tab)}" height="${n(ht)}"/>`
               : `<rect class="sbd-mark" x="${n(x)}" y="${n(atEnd ? y + ht - tab : y)}" ` +
                 `width="${n(w)}" height="${n(tab)}"/>`);
    }
    /* A TO-92 transistor: the flat face is drawn on the side you read c, b, e
       from left to right, so a part turned round shows its flat face turned
       round too.  The case is big enough that all three legs come out of it,
       and the leg letters are printed on the case, as on the can — outside it
       they collided with the item ID whenever the flat face pointed up. */
    // first and last leg in footprint order: c..e on a transistor, s..d on a 2N7000
    const fpEnds = [fp.pins[0].pin, fp.pins[fp.pins.length - 1].pin];
    const ce = fp.sym === "to92" ? fpEnds.map(k => cells.pins.find(z => z.pin === k)) : [];
    if (ce[0] && ce[1]) {
      const ex = X(ce[1].hole.c) - X(ce[0].hole.c), ey = Y(ce[1].hole.r) - Y(ce[0].hole.r);
      const len = Math.hypot(ex, ey) || 1, ux = ex / len, uy = ey / len;
      const nx = -uy, ny = ux;                        // towards the flat face
      const face = P * 0.32, rt = P * 1.3;            // legs sit inside, 0.32 pitch behind the face
      const ax = cx + nx * face - ux * rt, ay = cy + ny * face - uy * rt;
      let g = `<path class="sbd-body" d="M ${n(ax)} ${n(ay)} a ${n(rt)} ${n(rt)} 0 0 1 ` +
              `${n(ux * rt * 2)} ${n(uy * rt * 2)} z"/>`;
      for (const z of cells.pins) {
        // the end letters step in towards b, or they sit on the curve of the case
        const k = z.pin === fpEnds[0] ? 0.3 : z.pin === fpEnds[1] ? -0.3 : 0;
        const lx = X(z.hole.c) - nx * P * 0.45 + ux * P * k, ly = Y(z.hole.r) - ny * P * 0.45 + uy * P * k;
        // a tspan's own size beats the class's, and paintBody still finds the class
        g += `<text class="sbd-pmark" x="${n(lx)}" y="${n(ly + 3.5)}" ` +
             `text-anchor="middle"><tspan font-size="10">${z.pin}</tspan></text>`;
      }
      return g;
    }
    // D-shape: half round, one flat face — the TO-92 outline
    const d = spanH
      ? `M ${n(cx - rr)} ${n(cy + 3)} a ${n(rr)} ${n(rr)} 0 0 1 ${n(rr * 2)} 0 z`
      : `M ${n(cx + 3)} ${n(cy - rr)} a ${n(rr)} ${n(rr)} 0 0 1 0 ${n(rr * 2)} z`;
    return `<path class="sbd-body" d="${d}"/>`;
  }

  /* ------------------------------------------------------------------ main */

  /* ---------------------------------------------------- the stripboard grid */
  function stripGrid(board) {
    let g = "";
    for (let r = 0; r < board.rows; r++) {
      const th = P * 0.74;
      g += `<rect class="sbd-track" x="${n(X(1) - P * 0.5)}" y="${n(Y(r) - th / 2)}" ` +
        `width="${n(board.cols * P)}" height="${n(th)}" rx="${n(th / 2)}"/>`;
      g += `<text class="sbd-lab" x="13" y="${n(Y(r) + 4)}" ` +
        `text-anchor="middle">${rowLetter(r)}</text>`;
    }
    for (let r = 0; r < board.rows; r++)
      for (let c = 1; c <= board.cols; c++)
        g += `<circle class="sbd-hole" cx="${n(X(c))}" cy="${n(Y(r))}" r="${n(P * 0.15)}"/>`;
    for (let c = 1; c <= board.cols; c++)
      if (c === 1 || c % 5 === 0 || c === board.cols)
        g += `<text class="sbd-lab" x="${n(X(c))}" y="${n(PADT - 9)}" ` +
          `text-anchor="middle">${c}</text>`;
    return g;
  }

  /* ---------------------------------------------------- the breadboard grid
     Drawn as the real article: a plastic slab, square holes, a recessed channel
     down the middle, a–j printed down BOTH edges and the column numbers above
     row a and below row j — which is where a real board prints them, in the gap
     between the rails and the main block.

     One deliberate departure from the photograph: each set of joined holes gets
     the same faint capsule the stripboard draws under a track.  On real
     hardware those clips are hidden inside the plastic, and "which holes are
     already joined" is the entire thing this tool teaches — a pupil who cannot
     see the net cannot reason about it.  Same class as the stripboard's track,
     so it themes identically and reads as the same idea on both boards. */
  function breadGrid(board) {
    const cols = board.cols;
    let g = "";
    const x0 = X(1) - P * 1.45, x1 = X(cols) + P * 1.45, w = x1 - x0;
    const topY = Y(0) - P * 1.1, botY = Y(board.rows - 1) + P * 1.1;

    g += `<rect class="sbd-bbslab" x="${n(x0)}" y="${n(topY)}" ` +
         `width="${n(w)}" height="${n(botY - topY)}" rx="6"/>`;

    // the centre channel: the gap between row e and row f, drawn as a recess
    const [loBand, hiBand] = board.bands;
    const chTop = Y(loBand[1]) + P * 0.5, chBot = Y(hiBand[0]) - P * 0.5;
    g += `<rect class="sbd-bbchan" x="${n(x0)}" y="${n(chTop)}" ` +
         `width="${n(w)}" height="${n(chBot - chTop)}" rx="2"/>`;

    // the joined-holes capsules: one per rail, one per five-hole column group
    const cap = (cx, cy, cw, ch) =>
      `<rect class="sbd-track" x="${n(cx)}" y="${n(cy)}" width="${n(cw)}" ` +
      `height="${n(ch)}" rx="${n(Math.min(cw, ch) / 2)}"/>`;
    for (const rail of board.rails)
      g += cap(X(1) - P * 0.42, Y(rail.r) - P * 0.37, (cols - 1) * P + P * 0.84, P * 0.74);
    for (const [lo, hi] of board.bands)
      for (let c = 1; c <= cols; c++)
        g += cap(X(c) - P * 0.37, Y(lo) - P * 0.42, P * 0.74,
                 Y(hi) - Y(lo) + P * 0.84);

    /* The printed rail lines.  Red ALWAYS above its row and blue always below
       its own, at both ends of the board — which is how a real board is printed
       and what the photograph shows.  Mirroring the bottom pair instead put the
       blue line above the red one down there; caught by rendering it. */
    for (const end of ["top", "bottom"]) {
      const pos = board.rails.find(x => x.where === end && x.pol === "+");
      const neg = board.rails.find(x => x.where === end && x.pol !== "+");
      const py = Y(pos.r) - P * 0.6, ny = Y(neg.r) + P * 0.6;
      g += `<path class="sbd-bbpos" d="M ${n(X(1) - P * 0.2)} ${n(py)} H ${n(X(cols) + P * 0.2)}"/>`;
      g += `<path class="sbd-bbneg" d="M ${n(X(1) - P * 0.2)} ${n(ny)} H ${n(X(cols) + P * 0.2)}"/>`;
      for (const lx of [X(1) - P * 1.0, X(cols) + P * 1.0]) {
        g += `<text class="sbd-bbposl" x="${n(lx)}" y="${n(py + 5)}" text-anchor="middle">+</text>`;
        g += `<text class="sbd-bbnegl" x="${n(lx)}" y="${n(ny + 5)}" text-anchor="middle">\u2212</text>`;
      }
    }

    // square holes, the way a real board is moulded
    const hs = P * 0.16;
    for (let r = 0; r < board.rows; r++)
      for (let c = 1; c <= cols; c++)
        g += `<rect class="sbd-hole" x="${n(X(c) - hs)}" y="${n(Y(r) - hs)}" ` +
             `width="${n(hs * 2)}" height="${n(hs * 2)}" rx="1"/>`;

    // a–j down both edges
    for (const [lo, hi] of board.bands)
      for (let r = lo; r <= hi; r++)
        for (const lx of [X(1) - P * 1.0, X(cols) + P * 1.0])
          g += `<text class="sbd-lab" x="${n(lx)}" y="${n(Y(r) + 4)}" ` +
               `text-anchor="middle">${board.rowDisp[r]}</text>`;

    /* Column numbers immediately above row a and below row j — NOT centred in
       the gap, which is where the rail line is printed: at the midpoint the
       numbers sat on the blue line and neither could be read. */
    const numY = [Y(loBand[0]) - P * 0.55, Y(hiBand[1]) + P * 0.78];
    for (let c = 1; c <= cols; c++)
      if (c === 1 || c % 5 === 0 || c === cols)
        for (const y of numY)
          g += `<text class="sbd-lab" x="${n(X(c))}" y="${n(y)}" text-anchor="middle">${c}</text>`;
    return g;
  }

  function renderBoard(o) {
    const board = useBoard(BOARDS[o.board]);
    if (!board) throw new Error("unknown board " + o.board);
    const a = o.attempt || {};
    const q = o.question || {};
    const { w: W, h: H } = sizeOf(o.board);

    const layers = { defs: "", grid: "", body: "", pin: "", cut: "", link: "", tp: "", id: "", hl: "" };

    layers.grid += isBread(board) ? breadGrid(board) : stripGrid(board);

    /* components */
    for (const p of a.placements || []) {
      const fp = FOOTPRINTS[p.footprint];
      if (!fp) continue;
      const comp = (q.components || []).find(c => c.id === p.id) || {};
      const cells = cellsOf(fp, parseRef(p.at), p.rot || 0);
      const withLabel = Object.assign({}, p, { label: comp.name || p.id, part: comp.part,
                                             pos: comp.pos, colour: comp.colour,
                                             cuts: a.cuts });

      layers.body += paintBody(
                     fp.kind === "dil" ? drawDil(withLabel, fp, cells)
                   : fp.kind === "terminal" ? drawTerminal(withLabel, fp, cells)
                   : fp.kind === "can" ? drawCan(withLabel, fp, cells)
                   : fp.kind === "button" ? drawButton(withLabel, fp, cells)
                   : (fp.kind === "to92" || fp.kind === "inline3") ? drawTo92(withLabel, fp, cells)
                   : drawAxial(withLabel, fp, cells), withLabel, fp);

      for (const z of cells.pins)
        layers.pin += `<circle class="sbd-pin" cx="${n(X(z.hole.c))}" cy="${n(Y(z.hole.r))}" r="${n(P * 0.13)}"/>`;

      // item ID, nudged clear of the part (A5: never over its own body)
      if (fp.kind !== "dil") {
        const rs = cells.pins.map(z => z.hole.r), cs = cells.pins.map(z => z.hole.c);
        const midC = (Math.min(...cs) + Math.max(...cs)) / 2;
        const topR = Math.min(...rs), botR = Math.max(...rs);
        if (fp.kind === "terminal") {
          /* Supply and signal terminals sit at the board edge and often stack in
             adjacent rows, so a label ABOVE lands on its neighbour's box — it
             goes to the left instead.  Except on a breadboard, where the left
             margin is already carrying the printed + and − rail marks and the
             row letters: there the label goes to the RIGHT of the terminal. */
          const leftGutter = !isBread(board) || Math.min(...cs) > 3;
          layers.id += `<text class="${comp.pos ? "sbd-posid" : "sbd-id"}" ` +
            `x="${n(X(leftGutter ? Math.min(...cs) : Math.max(...cs)) + (leftGutter ? -P * 0.55 : P * 0.55))}" ` +
            `y="${n(Y(topR) + 4)}" text-anchor="${leftGutter ? "end" : "start"}">${esc(p.id)}</text>`;
        } else {
          /* Row A has the column numbers directly above it — label below
             instead.  On a breadboard the same is true of row a and of both
             bottom rails, and the top rails have the slab edge above them; the
             one genuinely roomy place is row f, which has the whole channel
             above it.  Caught by rendering: R1 in row a put its label on top of
             the column numbers. */
          const above = isBread(board)
            ? (topR > board.bands[0][0] && topR < board.rails[2].r)
            : topR > 0;
          /* A turned can has its tab up top (90, 180) or its circle reaching past
             the top legs (90, 270), so its label clears the whole can instead. */
          const cy = (Y(topR) + Y(botR)) / 2, rr = P * 1.28;
          const turnedCan = fp.kind === "can" && (p.rot || 0) !== 0;
          // clear of the leg letters too, which sit at rr + 8 out from the centre
          const yAbove = turnedCan ? cy - rr - 18 : Y(topR) - P * 0.55,
                yBelow = turnedCan ? cy + rr + 23 : Y(botR) + P * 0.75;
          // pushed that far out, only row f (the channel above it) has room overhead
          let up = turnedCan && isBread(board) ? topR === board.bands[1][0] : above;
          /* A TO-92 transistor lying along a row bulges a full pitch to its
             round side, so its label goes on the flat side, whichever that is. */
          if (fp.sym === "to92" && topR === botR) {
            const c = cells.pins.find(z => z.pin === fp.pins[0].pin),
                  e = cells.pins.find(z => z.pin === fp.pins[fp.pins.length - 1].pin);
            if (c && e) up = e.hole.c < c.hole.c;
          }
          layers.id += `<text class="sbd-id" x="${n(X(midC))}" ` +
            `y="${n(up ? yAbove : yBelow)}" ` +
            `text-anchor="middle">${esc(p.id)}</text>`;
        }
      }
    }

    /* cuts — drawn over the bodies, exactly as the planning sheet does */
    for (const s of a.cuts || []) {
      const h = parseRef(s), k = P * 0.28;
      layers.cut += `<path class="sbd-cut" d="M ${n(X(h.c) - k)} ${n(Y(h.r) - k)} ` +
        `l ${n(k * 2)} ${n(k * 2)} M ${n(X(h.c) + k)} ${n(Y(h.r) - k)} l ${n(-k * 2)} ${n(k * 2)}"/>`;
    }

    /* link wires — coloured AND numbered (QVSR 2024) */
    for (const l of a.links || []) {
      const p1 = parseRef(l.a), p2 = parseRef(l.b);
      const col = LINK_COLOURS[l.colour] || LINK_COLOURS.blue;
      const stripe = STRIPE_ACCENT[l.colour];
      const x1 = X(p1.c), y1 = Y(p1.r), x2 = X(p2.c), y2 = Y(p2.r);
      const dark = col === LINK_COLOURS.black;   // plain black and every striped base
      if (dark) layers.link += `<line class="sbd-lhalo" x1="${n(x1)}" y1="${n(y1)}" ` +
        `x2="${n(x2)}" y2="${n(y2)}"/>`;
      layers.link += `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" ` +
        `stroke="${col}" stroke-width="3.2" stroke-linecap="round"/>`;
      // the pinstripe, laid over the black wire just drawn
      if (stripe) layers.link += `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" ` +
        `stroke="${stripe}" stroke-width="1.2" stroke-linecap="round"/>`;
      if (l.num != null) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        // the numbered dot takes the STRIPE colour when there is one: every
        // striped wire is black at the base, so two different striped links
        // would otherwise show two identical black dots and be impossible
        // to tell apart at the one place the number itself lives
        layers.link += `<circle${dark ? ` class="sbd-ldot"` : ""} cx="${n(mx)}" cy="${n(my)}" ` +
          `r="6.5" fill="${stripe || col}"/>` +
          `<text class="sbd-lnum" x="${n(mx)}" y="${n(my + 3)}" text-anchor="middle">${l.num}</text>`;
      }
    }

    /* test points */
    for (const tp of a.testpoints || []) {
      const h = parseRef(tp.at);
      layers.tp += `<circle class="sbd-tp" cx="${n(X(h.c))}" cy="${n(Y(h.r))}" r="${n(P * 0.34)}"/>` +
        `<text class="sbd-tpl" x="${n(X(h.c))}" y="${n(Y(h.r) - P * 0.52)}" ` +
        `text-anchor="middle">${esc(tp.id || "TP")}</text>`;
    }

    /* Marks are the page's pointer: `hl` rings a hole a diagnostic refers to,
       `ghost` previews a drop, `cur` is the keyboard cursor.  All three go on
       TOP: a highlight drawn under the parts is invisible exactly when it
       matters, because a chip's pins are under its own package.  A ring rather
       than a disc, so the pin it points at still reads. */
    for (const m of o.marks || []) {
      if (m.r < 0 || m.r >= board.rows || m.c < 1 || m.c > board.cols) continue;
      const x = X(m.c), y = Y(m.r);
      const box = (cls, f) => `<rect class="${cls}" x="${n(x - P * f)}" y="${n(y - P * f)}" ` +
        `width="${n(P * f * 2)}" height="${n(P * f * 2)}" rx="3"/>`;
      if (m.kind === "cur")
        layers.cur = (layers.cur || "") + box("sbd-cur", 0.5);
      else if (m.kind === "ghost" || m.kind === "bad")
        layers.cur = (layers.cur || "") + box(m.kind === "bad" ? "sbd-bad" : "sbd-ghost", 0.42);
      else if (m.kind === "gpin")
        layers.cur = (layers.cur || "") +
          `<circle class="sbd-gpin" cx="${n(x)}" cy="${n(y)}" r="${n(P * 0.19)}"/>`;
      else if (m.kind === "hl2")
        layers.hl += `<circle class="sbd-hl2" cx="${n(x)}" cy="${n(y)}" r="${n(P * 0.36)}"/>`;
      else
        layers.hl += `<circle class="sbd-hl" cx="${n(x)}" cy="${n(y)}" r="${n(P * 0.36)}"/>`;
    }

    /* Two layers, one function.  The 24 x 37 board has 888 <circle> holes —
       cheap to draw once, but 76 KB of string re-serialised on every click if
       the whole board is rebuilt each edit.  So the page stacks two <svg>s of
       identical viewBox: `grid` is drawn once per question, `live` is
       everything that changes.  Offline inspection and "show the answer" ask
       for both at once, so what I look at is what the page assembles. */
    const wantGrid = o.layer !== "live";
    const wantLive = o.layer !== "grid";
    const inner = (wantGrid ? layers.grid : "") +
                  (wantLive ? layers.body + layers.pin + layers.cut + layers.link +
                              layers.tp + layers.id + layers.hl + (layers.cur || "") : "");
    const title = esc(o.title || `${board.id} stripboard layout, component side`);

    const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ` +
      `width="${W}" height="${H}" role="img">` +
      `<title>${title}</title>` +
      (layers.defs ? `<defs>${layers.defs}</defs>` : "") +
      (o.standalone ? `<rect class="sbd-bg" width="${W}" height="${H}"/>` : "") +
      inner + `</svg>`;
    // `inline` is for offline inspection only; the page keeps the classes so
    // the shared teal sheet can re-theme every colour (guide §6)
    if (o.inline) return inlineClasses(out);
    return o.standalone
      ? out.replace("><title", `><style>\n${STYLE}\n</style><title`)
      : out;
  }

  /* ------------------------------------------------------------ part preview
     One footprint on its own patch of board, drawn by the same drawers as the
     real thing so it cannot show a different shape from the one that lands.

     This exists because a tap has no hover: on an iPad the on-board ghost never
     appears before the drop, so a pupil has no way of knowing that a 14-pin DIL
     covers 28 holes until it is already there.  The preview goes where they are
     already looking — beside the bank they just tapped. */

  function renderPart(o) {
    const fp = FOOTPRINTS[o.footprint];
    if (!fp) return "";
    const board = useBoard(BOARDS[o.board]) || null;
    const bb = isBread(board);
    /* On a breadboard a chip previews on row e, the last row before the
       channel — so it straddles here exactly as it must on the board, and the
       0.3 in gap the package needs is visible BEFORE the drop.
       Everything else previews on row b, INSIDE the a–e block: a part turned
       down the columns is then shown doing what it will really do — sitting in
       one five-hole net — instead of straddling the channel, which is the one
       vertical placement that is not a short and so the one least worth
       showing. */
    const at = bb ? { r: board.bands[0][0] + (fp.kind === "dil" ? 4 : 1), c: 2 }
                  : { r: 1, c: 2 };
    const cells = cellsOf(fp, at, o.rot || 0);
    const holes = cells.pins.map(z => z.hole).concat(cells.body);
    const rs = holes.map(h => h.r), cs = holes.map(h => h.c);
    const r0 = Math.min(...rs), r1 = Math.max(...rs);
    const c0 = Math.min(...cs), c1 = Math.max(...cs);

    // one hole of board all round, so it reads as sitting ON tracks
    const x0 = X(c0 - 1) - P / 2, x1 = X(c1 + 1) + P / 2;
    const y0 = Y(r0 - 1) - P / 2, y1 = Y(r1 + 1) + P / 2;
    const W = x1 - x0, H = y1 - y0;

    let g = "";
    // never show a rail row in a part preview: it is not where a part goes
    const rTop = bb ? Math.max(board.bands[0][0], r0 - 1) : r0 - 1;
    const rBot = bb ? Math.min(board.bands[1][1], r1 + 1) : r1 + 1;
    if (bb) {
      // the channel, where one is in view
      for (const [lo, hi] of [[board.bands[0][1], board.bands[1][0]]])
        if (r0 <= lo && r1 >= hi)
          g += `<rect class="sbd-bbchan" x="${n(x0)}" y="${n(Y(lo) + P * 0.5)}" ` +
               `width="${n(W)}" height="${n(Y(hi) - Y(lo) - P)}" rx="2"/>`;
      // one capsule per column per band, clipped to what is on screen
      for (let c = c0 - 1; c <= c1 + 1; c++)
        for (const [lo, hi] of board.bands) {
          const a = Math.max(lo, rTop), b = Math.min(hi, rBot);
          if (a > b) continue;
          g += `<rect class="sbd-track" x="${n(X(c) - P * 0.37)}" y="${n(Y(a) - P * 0.42)}" ` +
               `width="${n(P * 0.74)}" height="${n(Y(b) - Y(a) + P * 0.84)}" rx="${n(P * 0.37)}"/>`;
        }
      const hs = P * 0.16;
      for (let r = rTop; r <= rBot; r++)
        for (let c = c0 - 1; c <= c1 + 1; c++)
          g += `<rect class="sbd-hole" x="${n(X(c) - hs)}" y="${n(Y(r) - hs)}" ` +
               `width="${n(hs * 2)}" height="${n(hs * 2)}" rx="1"/>`;
    } else {
      for (let r = r0 - 1; r <= r1 + 1; r++) {
        const th = P * 0.74;
        g += `<rect class="sbd-track" x="${n(x0)}" y="${n(Y(r) - th / 2)}" ` +
             `width="${n(W)}" height="${n(th)}" rx="${n(th / 2)}"/>`;
        for (let c = c0 - 1; c <= c1 + 1; c++)
          g += `<circle class="sbd-hole" cx="${n(X(c))}" cy="${n(Y(r))}" r="${n(P * 0.15)}"/>`;
      }
    }

    const p = { id: o.id, footprint: o.footprint, rot: o.rot || 0,
                label: o.id, part: o.part, pos: o.pos, colour: o.colour };
    g += paintBody(
         fp.kind === "dil" ? drawDil(p, fp, cells)
       : fp.kind === "terminal" ? drawTerminal(p, fp, cells)
       : fp.kind === "can" ? drawCan(p, fp, cells)
       : (fp.kind === "to92" || fp.kind === "inline3") ? drawTo92(p, fp, cells)
       : drawAxial(p, fp, cells), p, fp);
    for (const z of cells.pins)
      g += `<circle class="sbd-pin" cx="${n(X(z.hole.c))}" cy="${n(Y(z.hole.r))}" r="${n(P * 0.13)}"/>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n(x0)} ${n(y0)} ${n(W)} ${n(H)}" ` +
      `width="${n(W)}" height="${n(H)}" role="img"><title>${esc(o.id)}, ` +
      `${r1 - r0 + 1} ${bb ? "rows by " + (c1 - c0 + 1) + " columns"
                           : "tracks by " + (c1 - c0 + 1) + " holes"}</title>${g}</svg>`;
  }

  // how the footprint lies, in the words the planning sheet uses
  function spanOf(footprint, rot, boardId) {
    const fp = FOOTPRINTS[footprint];
    if (!fp) return "";
    const cells = cellsOf(fp, { r: 1, c: 2 }, rot || 0);
    const holes = cells.pins.map(z => z.hole).concat(cells.body);
    const rows = Math.max(...holes.map(h => h.r)) - Math.min(...holes.map(h => h.r)) + 1;
    const cols = Math.max(...holes.map(h => h.c)) - Math.min(...holes.map(h => h.c)) + 1;
    if (rows === 1 && cols === 1) return "one hole";
    /* A breadboard pupil is not thinking in tracks.  Along a row is what puts a
       part across several column nets, which is the placement that works; down
       a column is the one that shorts it out, and saying so here — before the
       drop — is cheaper than saying it afterwards in a fault. */
    if (isBread(BOARDS[boardId])) {
      if (cols === 1) return "down one column, " + rows + " holes";
      if (rows === 1) return "along one row, across " + cols + " columns";
      return rows + " rows \u00d7 " + cols + " columns";
    }
    if (cols === 1) return "across " + rows + " tracks";
    if (rows === 1) return "along one track, " + cols + " holes";
    return rows + " tracks \u00d7 " + cols + " holes";
  }

  /* Logical size of a board's SVG, and the inverse of X()/Y().  The page needs
     both: the size to compute the one-screen scale factor before anything is
     drawn, the inverse to hit-test 888 holes with one transparent overlay and
     some arithmetic instead of 888 listeners. */
  function sizeOf(boardId) {
    const b = useBoard(BOARDS[boardId]);
    const last = b.rows - 1;
    // a breadboard's last row is not `rows` pitches down: ask the row table
    const h = Y(last) + P * 0.5 + (isBread(b) ? P * 1.3 : 0) + PAD_B;
    return { w: PAD_L + b.cols * P + PADR, h: Math.round(h * 100) / 100,
             rows: b.rows, cols: b.cols };
  }

  /* logical px -> hole, or null if the point is outside the grid.
     The rows are not evenly spaced on a breadboard, so the inverse is a search
     for the nearest row rather than a division — and a point in the channel, or
     in the gap either side of a rail pair, belongs to NO hole and must return
     null rather than snapping to the nearest one.  A drop that lands in the
     channel is a miss, not a placement half a row out. */
  function holeAt(boardId, x, y) {
    const b = useBoard(BOARDS[boardId]);
    const c = Math.round((x - PAD_L) / P + 0.5);
    if (c < 1 || c > b.cols) return null;
    let r;
    if (!ROWY) {
      r = Math.round((y - PADT) / P - 0.5);
    } else {
      const u = (y - PADT) / P - 0.5;
      let best = -1, bd = Infinity;
      for (let i = 0; i < b.rows; i++) {
        const d = Math.abs(ROWY[i] - u);
        if (d < bd) { bd = d; best = i; }
      }
      if (bd > 0.5) return null;
      r = best;
    }
    if (r < 0 || r >= b.rows) return null;
    return { r, c };
  }

  root.SBD.render = { renderBoard, renderPart, spanOf, inlineClasses, STYLE, CLASSES,
                      P, PAD_L, PAD_T, sizeOf, holeAt,
                      centreOf: (r, c, boardId) => {
                        if (boardId) useBoard(BOARDS[boardId]);
                        return { x: X(c), y: Y(r) };
                      },
                      LINK_COLOURS, STRIPE_ACCENT, BODY_COLOURS, BODY_DEFAULT, bodyColourable, chipPrint };

})(typeof globalThis !== "undefined" ? globalThis : this);
