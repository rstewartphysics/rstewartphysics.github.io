/* ============================================================================
   Stripboard Builder — circuit diagram primitives
   ----------------------------------------------------------------------------
   Convert mode shows a circuit diagram beside the board (PLAN.md §4.1), and
   the pupil's job is to turn one into the other.  So the two pictures must
   obey the same drawing rules: UK/BS-IEC symbols, a plain rectangle resistor,
   distinctive-shape gates, a junction dot at every real node.  They share the
   palette table in sbd-render.js, so a wire cannot be one colour here and
   another there.

   Why primitives rather than one hand-written SVG per question: PLAN.md R5
   says every diagram is read against its netlist by eye, and that check is
   only trustworthy if the diagram is short enough to read.  A question's
   diagram is a dozen lines of calls, each naming the net it draws.

   Coordinates are plain logical px with y down.  Nothing here knows about the
   board; nothing in the board renderer knows about this.
   ============================================================================ */
(function (root) {
  "use strict";

  const n = v => Math.round(v * 100) / 100;
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ------------------------------------------------------------------ wires */

  // polyline through [[x,y],…]; orthogonal runs are the caller's business.
  // `cls` is how the +5 V rail becomes red (sbd-pos) without a second drawer.
  const wire = (pts, cls) =>
    `<polyline class="${cls || "sbd-wire"}" points="${pts.map(p => n(p[0]) + "," + n(p[1])).join(" ")}"/>`;

  // a junction dot: drawn ONLY where wires really join (guide §7)
  const node = (x, y) => `<circle class="sbd-node" cx="${n(x)}" cy="${n(y)}" r="3.2"/>`;

  /* An arrow with its head DRAWN, not a <marker>.  MuPDF renders no markers,
     and MuPDF is the only way these diagrams get inspected offline — a marker
     arrowhead is invisible in every check and present only in the browser,
     which is exactly the drift §7 exists to prevent.  A polygon is visible in
     both. */
  function arrow(x1, y1, x2, y2, o) {
    o = o || {};
    const k = o.size || 5;
    const a = Math.atan2(y2 - y1, x2 - x1);
    const p = (ang, r) => `${n(x2 - Math.cos(a + ang) * r)},${n(y2 - Math.sin(a + ang) * r)}`;
    return wire([[x1, y1], [x2 - Math.cos(a) * k * 0.6, y2 - Math.sin(a) * k * 0.6]]) +
      `<polygon class="sbd-node" points="${n(x2)},${n(y2)} ${p(0.42, k * 1.9)} ${p(-0.42, k * 1.9)}"/>`;
  }

  const text = (x, y, s, o) => {
    o = o || {};
    return `<text class="${o.cls || "sbd-clab"}" x="${n(x)}" y="${n(y)}" ` +
           `text-anchor="${o.anchor || "middle"}">${esc(s)}</text>`;
  };

  /* A net number in a ring, sitting ON the wire it names.  Step ③ of the
     conversion method is "number every net on the circuit diagram", so the
     diagram arrives with that step already done — the pupil's job is the step
     after it, giving each numbered net a track. */
  const netnum = (x, y, num) =>
    `<circle cx="${n(x)}" cy="${n(y)}" r="8" class="sbd-body"/>` +
    `<text class="sbd-cnet" x="${n(x)}" y="${n(y + 3.4)}" text-anchor="middle">${esc(num)}</text>`;

  /* -------------------------------------------------------------- symbols */

  /* Resistor: a plain rectangle, never a zig-zag (global §7).  `at` is the
     centre; leads run the full `span` so the caller can wire to the ends. */
  function res(x, y, o) {
    o = o || {};
    const horiz = o.dir !== "v", L = 44, W = 16, span = o.span || 74;
    const half = span / 2;
    let s = horiz
      ? wire([[x - half, y], [x + half, y]]) +
        `<rect class="sbd-part" x="${n(x - L / 2)}" y="${n(y - W / 2)}" width="${L}" height="${W}" rx="2"/>`
      : wire([[x, y - half], [x, y + half]]) +
        `<rect class="sbd-part" x="${n(x - W / 2)}" y="${n(y - L / 2)}" width="${W}" height="${L}" rx="2"/>`;
    const sx = o.labelLeft ? x - W / 2 - 6 : x + W / 2 + 6;
    const anchor = o.labelLeft ? "end" : "start";
    if (o.label) s += horiz ? text(x, y - W / 2 - 7, o.label) : text(sx, y - 3, o.label, { anchor });
    if (o.value) s += horiz ? text(x, y + W / 2 + 14, o.value) : text(sx, y + 12, o.value, { anchor });
    return s;
  }

  /* LED: triangle pointing at a cathode bar, plus the two emission arrows.
     `dir` is the direction of conventional current, so "d" means the anode is
     at the top — which is what the layout has to reproduce. */
  function led(x, y, o) {
    o = o || {};
    const dir = o.dir || "d", span = o.span || 74, half = span / 2, k = 13;
    const down = dir === "d", vert = down || dir === "u";
    const sgn = (down || dir === "r") ? 1 : -1;
    let s = vert ? wire([[x, y - half], [x, y + half]]) : wire([[x - half, y], [x + half, y]]);

    // triangle: apex on the cathode side
    const tri = vert
      ? `${n(x - k)},${n(y - k * sgn)} ${n(x + k)},${n(y - k * sgn)} ${n(x)},${n(y + k * sgn)}`
      : `${n(x - k * sgn)},${n(y - k)} ${n(x - k * sgn)},${n(y + k)} ${n(x + k * sgn)},${n(y)}`;
    s += `<polygon class="sbd-part" points="${tri}"/>`;
    // cathode bar across the apex
    s += vert
      ? `<line class="sbd-wire" x1="${n(x - k)}" y1="${n(y + k * sgn)}" x2="${n(x + k)}" y2="${n(y + k * sgn)}"/>`
      : `<line class="sbd-wire" x1="${n(x + k * sgn)}" y1="${n(y - k)}" x2="${n(x + k * sgn)}" y2="${n(y + k)}"/>`;
    // two emission arrows, the mark that makes it an LED and not a diode
    const ax = x + (vert ? k + 4 : 0), ay = y + (vert ? 0 : -(k + 4));
    for (let i = 0; i < 2; i++) {
      const ox = vert ? 0 : i * 11 - 5, oy = vert ? i * 11 - 5 : 0;
      s += arrow(ax + ox, ay + oy, ax + ox + 10, ay + oy - 10);
    }
    // which side a vertical part's label goes is the caller's business: it
    // depends on what else is beside it, and getting it wrong buries the label
    // under the neighbouring symbol
    if (o.label) s += !vert ? text(x, y + k + 15, o.label)
      // "r" has to clear the emission arrows, which are always on that side
      : o.labelSide === "r" ? text(x + k + 24, y + 4, o.label, { anchor: "start" })
      : o.labelSide === "d" ? text(x, y + half + 14, o.label)
      :                       text(x - k - 8, y + 4, o.label, { anchor: "end" });
    return s;
  }

  /* A 2-input AND gate, distinctive shape (flat back, semicircular nose) with
     its DIL pin numbers on the leads — because "which gate of the one chip"
     and "which pin" is the whole difficulty of §5.1. */
  function andGate(x, y, o) {
    o = o || {};
    const w = o.w || 40, h = o.h || 44, r = h / 2, lead = o.lead || 16;
    const x0 = x - (w + lead) / 2, y0 = y - h / 2;
    const inA = y0 + h * 0.25, inB = y0 + h * 0.75;
    let s = `<path class="sbd-part" d="M ${n(x0 + lead)} ${n(y0)} H ${n(x0 + lead + w - r)} ` +
            `A ${r} ${r} 0 0 1 ${n(x0 + lead + w - r)} ${n(y0 + h)} H ${n(x0 + lead)} Z"/>`;
    s += wire([[x0, inA], [x0 + lead, inA]]);
    s += wire([[x0, inB], [x0 + lead, inB]]);
    s += wire([[x0 + lead + w, y], [x0 + lead + w + lead, y]]);
    if (o.pins) {
      s += text(x0 + lead - 3, inA - 4, o.pins[0], { cls: "sbd-cnet", anchor: "end" });
      s += text(x0 + lead - 3, inB + 11, o.pins[1], { cls: "sbd-cnet", anchor: "end" });
      s += text(x0 + lead + w + 3, y - 5, o.pins[2], { cls: "sbd-cnet", anchor: "start" });
    }
    if (o.label) s += text(x0 + lead + w / 2 - 2, y + 4, o.label);
    return {
      svg: s,
      a: [x0, inA], b: [x0, inB], out: [x0 + lead + w + lead, y]
    };
  }

  /* An off-board connection: the labelled square pad the layout has a terminal
     for.  These are the nets that leave the board on a numbered wire. */
  function term(x, y, o) {
    o = o || {};
    const side = o.side || "l", s2 = 7;
    const box = o.pos ? "sbd-posf" : "sbd-part", lab = { cls: o.pos ? "sbd-poslab" : "sbd-clab" };
    let s = `<rect class="${box}" x="${n(x - s2)}" y="${n(y - s2)}" width="${s2 * 2}" ` +
            `height="${s2 * 2}" rx="2"/>`;
    if (o.label)
      s += side === "l" ? text(x - s2 - 5, y + 4, o.label, { anchor: "end", cls: lab.cls })
         : side === "r" ? text(x + s2 + 5, y + 4, o.label, { anchor: "start", cls: lab.cls })
         : side === "u" ? text(x, y - s2 - 6, o.label, lab)
         :                text(x, y + s2 + 14, o.label, lab);
    return s;
  }

  // nothing needs a <defs> any more; arrowheads are drawn (see arrow())
  const DEFS = "";

  function wrap(o) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${o.w} ${o.h}" ` +
      `width="${o.w}" height="${o.h}" role="img">` +
      `<title>${esc(o.title || "circuit diagram")}</title>` +
      (DEFS ? `<defs>${DEFS}</defs>` : "") +
      (o.standalone ? `<rect class="sbd-bg" width="${o.w}" height="${o.h}"/>` : "") +
      o.body + `</svg>`;
  }

  /* ---------------------------------------------- the rest of the symbols
     BS/IEC throughout (global §7): a resistor is a rectangle, a gate keeps its
     distinctive shape, and a sensing resistor is that same rectangle with the
     sensing mark added — never a zig-zag, and never a US-style outline. */

  // a resistor rectangle with the two arrows that make it light-dependent
  function ldr(x, y, o) {
    o = o || {};
    let s = res(x, y, Object.assign({}, o, { label: null, value: null }));
    // arrows pointing AT the body: light falling on it.  They come in from
    // above for a horizontal LDR and from the left for a vertical one, so the
    // symbol reads the same whichever way the divider is drawn.
    const vert = o.dir === "v";
    for (let i = 0; i < 2; i++) {
      const d = i * 13 - 6;
      if (vert) s += arrow(x - 40, y + d - 12, x - 28, y + d);
      else      s += arrow(x + d - 17, y - 33, x + d - 5, y - 21);
    }
    if (o.label) s += vert ? text(x + 14, y - 4, o.label, { anchor: "start" })
                           : text(x + 14, y - 24, o.label, { anchor: "start" });
    if (o.value) s += vert ? text(x + 14, y + 12, o.value, { anchor: "start" })
                           : text(x, y + 22, o.value);
    return s;
  }

  // a resistor rectangle with the temperature stroke through it
  function thermistor(x, y, o) {
    o = o || {};
    const horiz = (o.dir !== "v"), L = 44, W = 16;
    let s = res(x, y, Object.assign({}, o, { label: null, value: null }));
    s += wire([[x - L / 2 - 7, y + W / 2 + 7], [x + L / 2 + 7, y - W / 2 - 7]]);
    s += wire([[x - L / 2 - 7, y + W / 2 + 7], [x - L / 2 + 3, y + W / 2 + 7]]);
    if (o.label) s += text(x, y - W / 2 - 14, o.label);
    if (o.value) s += text(x, y + W / 2 + 22, o.value);
    return s;
  }

  /* The three gate shapes.  Each returns its lead ends so the caller wires to
     a point rather than to a coordinate it worked out itself. */
  function gateBody(kind, x, y, o) {
    o = o || {};
    const w = o.w || 40, h = o.h || 44, r = h / 2, lead = o.lead || 16;
    const x0 = x - (w + lead) / 2, y0 = y - h / 2;
    const bx = x0 + lead, bw = w;
    let d;
    if (kind === "and")
      d = `M ${n(bx)} ${n(y0)} H ${n(bx + bw - r)} A ${r} ${r} 0 0 1 ${n(bx + bw - r)} ` +
          `${n(y0 + h)} H ${n(bx)} Z`;
    else                                            // or / xor: curved back, pointed nose
      d = `M ${n(bx)} ${n(y0)} Q ${n(bx + bw * 0.62)} ${n(y0 + h * 0.06)} ${n(bx + bw)} ${n(y)} ` +
          `Q ${n(bx + bw * 0.62)} ${n(y0 + h * 0.94)} ${n(bx)} ${n(y0 + h)} ` +
          `Q ${n(bx + bw * 0.28)} ${n(y)} ${n(bx)} ${n(y0)} Z`;
    const inA = y0 + h * 0.25, inB = y0 + h * 0.75;
    // an OR gate's curved back means its input leads have to reach further in
    const curved = kind === "or" || kind === "xor";
    const back = curved ? bx + bw * 0.16 : bx;
    /* NAND and NOR are the AND and OR shapes with the inverting bubble on the
       nose — one shape table, not six, which is also how a pupil is taught to
       read them: "it is an OR with the little circle, so it is a NOR". */
    const rb = o.inv ? 4.5 : 0;
    let s = `<path class="sbd-part" d="${d}"/>`;
    /* XOR: the second arc BEHIND the back, set clear of it.  Drawn as its own
       path and not part of the body, because it is a separate stroke on a real
       symbol and closing it into the body would fill the gap. */
    if (kind === "xor")
      s += `<path class="sbd-wire" fill="none" d="M ${n(bx - 7)} ${n(y0)} ` +
           `Q ${n(bx - 7 + bw * 0.28)} ${n(y)} ${n(bx - 7)} ${n(y0 + h)}"/>`;
    if (o.inv)
      s += `<circle class="sbd-part" cx="${n(bx + bw + rb)}" cy="${n(y)}" r="${rb}"/>`;
    s += wire([[x0, inA], [back, inA]]) + wire([[x0, inB], [back, inB]]) +
         wire([[bx + bw + rb * 2, y], [bx + bw + lead, y]]);
    if (o.pins) {
      s += text(bx - 3, inA - 4, o.pins[0], { cls: "sbd-cnet", anchor: "end" });
      s += text(bx - 3, inB + 11, o.pins[1], { cls: "sbd-cnet", anchor: "end" });
      s += text(bx + bw + 3, y - 5, o.pins[2], { cls: "sbd-cnet", anchor: "start" });
    }
    return { svg: s, a: [x0, inA], b: [x0, inB], out: [bx + bw + lead, y] };
  }
  const andGate2 = (x, y, o) => gateBody("and", x, y, o);
  const orGate = (x, y, o) => gateBody("or", x, y, o);
  const nandGate = (x, y, o) => gateBody("and", x, y, Object.assign({}, o, { inv: true }));
  const norGate = (x, y, o) => gateBody("or", x, y, Object.assign({}, o, { inv: true }));
  const xorGate = (x, y, o) => gateBody("xor", x, y, o);

  // NOT: triangle with the inverting bubble on its nose
  function notGate(x, y, o) {
    o = o || {};
    const w = o.w || 34, h = o.h || 34, lead = o.lead || 14, rb = 4;
    const x0 = x - (w + lead + rb * 2) / 2, y0 = y - h / 2;
    const bx = x0 + lead;
    let s = `<polygon class="sbd-part" points="${n(bx)},${n(y0)} ${n(bx)},${n(y0 + h)} ` +
            `${n(bx + w)},${n(y)}"/>` +
            `<circle class="sbd-part" cx="${n(bx + w + rb)}" cy="${n(y)}" r="${rb}"/>` +
            wire([[x0, y], [bx, y]]) +
            wire([[bx + w + rb * 2, y], [bx + w + rb * 2 + lead, y]]);
    if (o.pins) {
      s += text(bx - 3, y - 5, o.pins[0], { cls: "sbd-cnet", anchor: "end" });
      s += text(bx + w + rb * 2 + 3, y - 5, o.pins[1], { cls: "sbd-cnet", anchor: "start" });
    }
    return { svg: s, a: [x0, y], out: [bx + w + rb * 2 + lead, y] };
  }

  // NPN transistor: base bar on the left, emitter arrow pointing out
  function npn(x, y, o) {
    o = o || {};
    const r = 20, bx = x - 7;                       // the base bar
    let s = `<circle class="sbd-part" cx="${n(x)}" cy="${n(y)}" r="${r}"/>` +
            wire([[bx, y - 11], [bx, y + 11]]) +          // base bar
            wire([[x - r - 14, y], [bx, y]]) +            // base lead
            wire([[bx, y - 6], [x + 10, y - 15], [x + 10, y - r - 12]]) +   // collector
            wire([[bx, y + 6], [x + 10, y + 15], [x + 10, y + r + 12]]);    // emitter
    // the arrow that makes it NPN, on the emitter, pointing away from the base
    s += `<polygon class="sbd-node" points="${n(x + 2.5)},${n(y + 9)} ${n(x + 9)},${n(y + 8.5)} ` +
         `${n(x + 6)},${n(y + 15)}"/>`;
    if (o.label) s += text(x + r + 6, y - 4, o.label, { anchor: "start" });
    return { svg: s, b: [x - r - 14, y], c: [x + 10, y - r - 12], e: [x + 10, y + r + 12] };
  }

  /* PNP transistor: the same drawing turned over — emitter at the top, where
     +5 V comes in, and its arrow pointing IN towards the base bar. */
  function pnp(x, y, o) {
    o = o || {};
    const r = 20, bx = x - 7;
    let s = `<circle class="sbd-part" cx="${n(x)}" cy="${n(y)}" r="${r}"/>` +
            wire([[bx, y - 11], [bx, y + 11]]) +
            wire([[x - r - 14, y], [bx, y]]) +
            wire([[bx, y - 6], [x + 10, y - 15], [x + 10, y - r - 12]]) +   // emitter
            wire([[bx, y + 6], [x + 10, y + 15], [x + 10, y + r + 12]]);    // collector
    const dx = 17 / Math.hypot(17, 9), dy = -9 / Math.hypot(17, 9);
    const at = t => [bx + 17 * t, y - 6 - 9 * t];
    const [tx, ty] = at(0.3), [kx, ky] = at(0.72), w = 3.4;
    s += `<polygon class="sbd-node" points="${n(tx)},${n(ty)} ${n(kx - dy * w)},${n(ky + dx * w)} ` +
         `${n(kx + dy * w)},${n(ky - dx * w)}"/>`;
    if (o.label) s += text(x + r + 6, y - 4, o.label, { anchor: "start" });
    return { svg: s, b: [x - r - 14, y], e: [x + 10, y - r - 12], c: [x + 10, y + r + 12] };
  }

  /* SPST switch: two contacts and a hinged blade.  Takes a direction for the
     same reason the sounder and the motor do — drawn horizontal-only, a switch
     in a vertical run has the wire passing straight through it and its own
     contacts sticking out sideways into nothing. */
  function sw(x, y, o) {
    o = o || {};
    const vert = o.dir === "v", half = (o.span || 56) / 2;
    let s = vert
      ? wire([[x, y - half], [x, y - 11]]) + wire([[x, y + 11], [x, y + half]]) +
        node(x, y - 11) + node(x, y + 11) +
        wire([[x, y + 11], [x + 13, y - 9]])          // blade hinged on the lower contact
      : wire([[x - half, y], [x - 11, y]]) + wire([[x + 11, y], [x + half, y]]) +
        node(x - 11, y) + node(x + 11, y) +
        wire([[x - 11, y], [x + 9, y - 13]]);
    if (o.label) s += vert ? text(x + 20, y + 4, o.label, { anchor: "start" })
                           : text(x, y + 18, o.label);
    return s;
  }

  /* sounder: the BS shape — a half-disc on its flat.  Both this and motor()
     take a direction: drawn horizontal-only, a symbol in a vertical run has the
     wire passing straight through it and its own leads sticking out sideways
     into nothing, which is what the first draft of two questions did. */
  function sounder(x, y, o) {
    o = o || {};
    const vert = o.dir === "v", half = (o.span || 56) / 2, r = 15;
    /* Vertical: the flat of the half-disc is the chord at y - 0.2r and the dome
       bulges DOWN from it (sweep 0 on a left-to-right chord goes downward — read
       off the render, not derived).  A lead stopping at y - r therefore ends in
       mid-air short of the symbol, which is what the first two versions did. */
    let s = vert ? wire([[x, y - half], [x, y - r * 0.2]]) + wire([[x, y + r], [x, y + half]])
                 : wire([[x - half, y], [x - r, y]]) + wire([[x + r, y], [x + half, y]]);
    // the flat faces the incoming lead, the dome faces away
    s += vert
      ? `<path class="sbd-part" d="M ${n(x - r)} ${n(y - r * 0.2)} A ${r} ${r} 0 0 0 ` +
        `${n(x + r)} ${n(y - r * 0.2)} Z"/>` +
        wire([[x, y - r * 0.2], [x, y + r]])
      : `<path class="sbd-part" d="M ${n(x - r)} ${n(y)} A ${r} ${r} 0 0 1 ${n(x + r)} ${n(y)} Z"/>`;
    if (o.label) s += vert ? text(x + r + 6, y + 4, o.label, { anchor: "start" })
                           : text(x, y + 16, o.label);
    return s;
  }

  // motor or pump: a circle with its letter
  function motor(x, y, o) {
    o = o || {};
    const vert = o.dir === "v", half = (o.span || 56) / 2, r = 15;
    let s = vert ? wire([[x, y - half], [x, y - r]]) + wire([[x, y + r], [x, y + half]])
                 : wire([[x - half, y], [x - r, y]]) + wire([[x + r, y], [x + half, y]]);
    s += `<circle class="sbd-part" cx="${n(x)}" cy="${n(y)}" r="${r}"/>` +
         text(x, y + 4, o.letter || "M");
    if (o.label) s += !vert ? text(x, y + r + 15, o.label)
      : o.labelSide === "l" ? text(x - r - 6, y + 4, o.label, { anchor: "end" })
      :                       text(x + r + 6, y + 4, o.label, { anchor: "start" });
    return s;
  }


  /* A horizontal supply rail.  Real circuit diagrams hang their components
     between two rails rather than routing a wire to a terminal block, and that
     is what a pupil is asked to reproduce as the two supply tracks on the
     board.  The label sits at the left-hand end, clear of the line: above the
     +5 V rail, below the 0 V one, so neither ever collides with a component
     hanging off it. */
  function rail(x1, x2, y, o) {
    o = o || {};
    const pos = !!o.pos;
    return wire([[x1, y], [x2, y]], pos ? "sbd-pos" : "sbd-wire") +
      text(x1, y + (pos ? -9 : 18), o.label || (pos ? "+5 V" : "0 V"),
           { anchor: "start", cls: pos ? "sbd-poslab" : "sbd-clab" });
  }


  /* An IC drawn the way the classroom material draws it — the Yenka/EU square
     symbol used throughout `classes/electronics/theory/logic-and-ics.html`,
     which is the template for every circuit convention here: a plain box with
     the part number in the middle and each PIN NUMBER inside the box at the
     point its wire attaches.  No function names, no leads; wires meet the box
     edge directly.  Pupils turn a number into a function on the data sheet,
     which is the skill.

     `left` / `right` / `top` / `bottom` are arrays of `{ num, at }`, where `at`
     is the fraction along that edge.  Returns each attachment point keyed by
     pin number, so the caller wires to a pin rather than to a coordinate it
     worked out for itself. */
  function icBlock(x, y, o) {
    o = o || {};
    const w = o.w || 70, h = o.h || 66;
    const x0 = x - w / 2, y0 = y - h / 2;
    let s = `<rect class="sbd-part" x="${n(x0)}" y="${n(y0)}" width="${n(w)}" ` +
            `height="${n(h)}" rx="2"/>`;
    const at = {};
    const put = (list, side) => (list || []).forEach(pin => {
      let px, py, tx, ty, anchor;
      if (side === "l") { px = x0;              py = y0 + h * pin.at;
                          tx = x0 + 6;          ty = py + 4;      anchor = "start"; }
      if (side === "r") { px = x0 + w;          py = y0 + h * pin.at;
                          tx = x0 + w - 6;      ty = py + 4;      anchor = "end"; }
      if (side === "t") { px = x0 + w * pin.at; py = y0;
                          tx = px;              ty = y0 + 13;     anchor = "middle"; }
      if (side === "b") { px = x0 + w * pin.at; py = y0 + h;
                          tx = px;              ty = y0 + h - 5;  anchor = "middle"; }
      s += text(tx, ty, pin.num, { cls: "sbd-cnet", anchor: anchor });
      at[pin.num] = [px, py];
    });
    put(o.left, "l"); put(o.right, "r"); put(o.top, "t"); put(o.bottom, "b");
    if (o.name) s += text(x, y + 4, o.name);
    return { svg: s, at: at };
  }

  /* An op-amp: the triangle with its two inputs marked.  Same reasoning as the
     555 block — the symbol says which input is inverting, the data sheet says
     which pin that is. */
  function opamp(x, y, o) {
    o = o || {};
    const w = o.w || 56, h = o.h || 64, lead = o.lead || 18;
    const x0 = x - (w + lead * 2) / 2, y0 = y - h / 2, bx = x0 + lead;
    const inM = y0 + h * 0.28, inP = y0 + h * 0.72;
    let s = `<polygon class="sbd-part" points="${n(bx)},${n(y0)} ${n(bx)},${n(y0 + h)} ` +
            `${n(bx + w)},${n(y)}"/>` +
            wire([[x0, inM], [bx, inM]]) + wire([[x0, inP], [bx, inP]]) +
            wire([[bx + w, y], [bx + w + lead, y]]) +
            text(bx + 9, inM + 4, "\u2212", { cls: "sbd-cnet", anchor: "start" }) +
            text(bx + 9, inP + 4, "+", { cls: "sbd-cnet", anchor: "start" });
    if (o.label) s += text(x, y0 - 7, o.label);
    /* The supply connections are drawn (the classroom template draws them), so
       hand back two points that actually sit ON the sloping edges — a wire
       started at the bounding box's corner would begin in mid-air. */
    const f = 0.62;                       // nearer the nose, leaving room for a label below
    return { svg: s, minus: [x0, inM], plus: [x0, inP], out: [bx + w + lead, y],
             vplus:  [bx + w * f, y0 + (h / 2) * f],
             vminus: [bx + w * f, y0 + h - (h / 2) * f] };
  }


  /* An electrolytic capacitor: one straight plate and one curved plate, with
     the + on the straight one (BS/IEC).  Vertical only for now — that is the
     only orientation the bank's questions need, and a horizontal-only symbol
     dropped into a vertical run is a fault this project has already made
     twice (the sounder and the motor). */
  function ecap(x, y, o) {
    o = o || {};
    const half = (o.span || 56) / 2, w = 22, gap = 5;
    let s = wire([[x, y - half], [x, y - gap]]) + wire([[x, y + gap], [x, y + half]]) +
      `<line class="sbd-wire" x1="${n(x - w / 2)}" y1="${n(y - gap)}" ` +
      `x2="${n(x + w / 2)}" y2="${n(y - gap)}"/>` +
      // the curved plate is the negative one
      `<path class="sbd-wire" d="M ${n(x - w / 2)} ${n(y + gap + 3)} ` +
      `Q ${n(x)} ${n(y + gap - 4)} ${n(x + w / 2)} ${n(y + gap + 3)}"/>` +
      text(x - w / 2 - 5, y - gap - 4, "+", { anchor: "end" });
    if (o.label) s += text(x + w / 2 + 6, y - 3, o.label, { anchor: "start" });
    if (o.value) s += text(x + w / 2 + 6, y + 12, o.value, { anchor: "start" });
    return s;
  }

  /* ---------------------------------------------------------------------
     The rest of the parts box, as SYMBOLS.  The drawer shows every component
     by its circuit symbol as well as its name, so a pupil reading a circuit
     diagram can find the part it names without being told — which is the whole
     conversion the course asks for.  BS/IEC throughout (global §7): a resistor
     is a rectangle, a non-polarised capacitor is two straight plates, a fuse is
     a rectangle with a line through it.
     --------------------------------------------------------------------- */

  /* A non-polarised capacitor: two STRAIGHT plates.  The curved plate is what
     makes ecap() polarised, so it must not appear here. */
  function cap(x, y, o) {
    o = o || {};
    const vert = o.dir === "v", half = (o.span || 56) / 2, w = 22, gap = 4;
    const plate = (px, py) => vert
      ? `<line class="sbd-wire" x1="${n(px - w / 2)}" y1="${n(py)}" x2="${n(px + w / 2)}" y2="${n(py)}"/>`
      : `<line class="sbd-wire" x1="${n(px)}" y1="${n(py - w / 2)}" x2="${n(px)}" y2="${n(py + w / 2)}"/>`;
    let s = vert
      ? wire([[x, y - half], [x, y - gap]]) + wire([[x, y + gap], [x, y + half]]) +
        plate(x, y - gap) + plate(x, y + gap)
      : wire([[x - half, y], [x - gap, y]]) + wire([[x + gap, y], [x + half, y]]) +
        plate(x - gap, y) + plate(x + gap, y);
    if (o.label) s += vert ? text(x + w / 2 + 6, y - 3, o.label, { anchor: "start" })
                           : text(x, y - w / 2 - 7, o.label);
    return s;
  }

  /* A diode: the LED's triangle and cathode bar with no emission arrows — the
     arrows are the ONLY difference, which is the thing worth seeing side by
     side in the drawer. Same geometry constants as led() for that reason. */
  function diode(x, y, o) {
    o = o || {};
    const dir = o.dir || "r", span = o.span || 74, half = span / 2, k = 13;
    const down = dir === "d", vert = down || dir === "u";
    const sgn = (down || dir === "r") ? 1 : -1;
    let s = vert ? wire([[x, y - half], [x, y + half]]) : wire([[x - half, y], [x + half, y]]);
    const tri = vert
      ? `${n(x - k)},${n(y - k * sgn)} ${n(x + k)},${n(y - k * sgn)} ${n(x)},${n(y + k * sgn)}`
      : `${n(x - k * sgn)},${n(y - k)} ${n(x - k * sgn)},${n(y + k)} ${n(x + k * sgn)},${n(y)}`;
    s += `<polygon class="sbd-part" points="${tri}"/>`;
    s += vert
      ? `<line class="sbd-wire" x1="${n(x - k)}" y1="${n(y + k * sgn)}" x2="${n(x + k)}" y2="${n(y + k * sgn)}"/>`
      : `<line class="sbd-wire" x1="${n(x + k * sgn)}" y1="${n(y - k)}" x2="${n(x + k * sgn)}" y2="${n(y + k)}"/>`;
    if (o.label) s += text(x, y - k - 7, o.label);
    return s;
  }

  /* A potentiometer: the resistor rectangle with an arrow into its middle.
     The arrow IS the wiper — a preset drawn without it is a resistor. */
  function pot(x, y, o) {
    o = o || {};
    const horiz = o.dir !== "v", W = 16;
    let s = res(x, y, Object.assign({}, o, { label: null, value: null }));
    s += horiz ? arrow(x, y + W / 2 + 20, x, y + W / 2 + 2)
               : arrow(x - W / 2 - 20, y, x - W / 2 - 2, y);
    if (o.label) s += text(x, y - W / 2 - 7, o.label);
    return s;
  }

  /* An n-channel enhancement MOSFET: gate bar clear of the channel, the
     channel in three segments (that gap is what "enhancement" means), and the
     substrate arrow pointing IN, which is what makes it n-channel. */
  function mosfet(x, y, o) {
    o = o || {};
    const gx = x - 20, cx = x - 6, h = 30, seg = h / 3.4;
    let s = wire([[gx - 16, y], [gx, y]]) +                       // gate lead
            wire([[gx, y - h / 2], [gx, y + h / 2]]);             // gate bar
    for (let i = -1; i <= 1; i++)                                 // the three channel segments
      s += wire([[cx, y + i * (h / 3) - seg / 2], [cx, y + i * (h / 3) + seg / 2]]);
    s += wire([[cx, y - h / 3], [x + 12, y - h / 3], [x + 12, y - h / 2 - 12]]) +   // drain
         wire([[cx, y + h / 3], [x + 12, y + h / 3], [x + 12, y + h / 2 + 12]]) +   // source
         wire([[cx, y], [x + 12, y]]);                            // substrate to source side
    s += `<polygon class="sbd-node" points="${n(cx + 2)},${n(y - 4.5)} ` +
         `${n(cx + 2)},${n(y + 4.5)} ${n(cx + 9)},${n(y)}"/>`;    // arrow IN: n-channel
    if (o.label) s += text(x + 20, y - 4, o.label, { anchor: "start" });
    return s;
  }

  // a filament lamp: a circle with a cross through it
  function lamp(x, y, o) {
    o = o || {};
    const vert = o.dir === "v", half = (o.span || 56) / 2, r = 15, d = r * 0.707;
    let s = vert ? wire([[x, y - half], [x, y - r]]) + wire([[x, y + r], [x, y + half]])
                 : wire([[x - half, y], [x - r, y]]) + wire([[x + r, y], [x + half, y]]);
    s += `<circle class="sbd-part" cx="${n(x)}" cy="${n(y)}" r="${r}"/>` +
         wire([[x - d, y - d], [x + d, y + d]]) + wire([[x - d, y + d], [x + d, y - d]]);
    if (o.label) s += text(x, y + r + 15, o.label);
    return s;
  }

  // a loudspeaker: the driver rectangle with the cone opening off it
  function speaker(x, y, o) {
    o = o || {};
    const bw = 12, bh = 22, cw = 13, ch = 34;
    let s = wire([[x - bw / 2 - 20, y - 7], [x - bw / 2, y - 7]]) +
            wire([[x - bw / 2 - 20, y + 7], [x - bw / 2, y + 7]]) +
            `<rect class="sbd-part" x="${n(x - bw / 2)}" y="${n(y - bh / 2)}" ` +
            `width="${bw}" height="${bh}" rx="1"/>` +
            `<polygon class="sbd-part" points="${n(x + bw / 2)},${n(y - bh / 2)} ` +
            `${n(x + bw / 2 + cw)},${n(y - ch / 2)} ${n(x + bw / 2 + cw)},${n(y + ch / 2)} ` +
            `${n(x + bw / 2)},${n(y + bh / 2)}"/>`;
    if (o.label) s += text(x, y + ch / 2 + 14, o.label);
    return s;
  }

  // a fuse: the rectangle with the wire running straight through it
  function fuse(x, y, o) {
    o = o || {};
    const half = (o.span || 68) / 2, L = 40, W = 14;
    let s = wire([[x - half, y], [x + half, y]]) +
            `<rect class="sbd-part" x="${n(x - L / 2)}" y="${n(y - W / 2)}" ` +
            `width="${L}" height="${W}" rx="1"/>` +
            wire([[x - L / 2, y], [x + L / 2, y]]);
    if (o.label) s += text(x, y - W / 2 - 7, o.label);
    return s;
  }

  /* A relay: the coil rectangle, the dashed mechanical link, and the contact it
     works.  The coil alone is a resistor rectangle — the link and the contact
     are what say it is a relay, so they are not optional. */
  function relay(x, y, o) {
    o = o || {};
    const L = 34, W = 15, cy = y + 26;
    let s = wire([[x - L / 2 - 14, y], [x + L / 2 + 14, y]]) +
            `<rect class="sbd-part" x="${n(x - L / 2)}" y="${n(y - W / 2)}" ` +
            `width="${L}" height="${W}" rx="1"/>` +
            `<line class="sbd-chip" x1="${n(x)}" y1="${n(y + W / 2)}" x2="${n(x)}" y2="${n(cy - 3)}"/>` +
            wire([[x - 24, cy], [x - 11, cy]]) + wire([[x + 11, cy], [x + 24, cy]]) +
            node(x - 11, cy) + node(x + 11, cy) +
            wire([[x - 11, cy], [x + 9, cy - 12]]);
    if (o.label) s += text(x, y - W / 2 - 7, o.label);
    return s;
  }

  /* A solenoid: the coil rectangle with its plunger drawn through it — the bar
     that moves is the whole point of the part. */
  function solenoid(x, y, o) {
    o = o || {};
    const L = 34, W = 18;
    let s = wire([[x - L / 2 - 14, y], [x + L / 2 + 14, y]]) +
            `<rect class="sbd-part" x="${n(x - L / 2)}" y="${n(y - W / 2)}" ` +
            `width="${L}" height="${W}" rx="1"/>` +
            `<rect class="sbd-node" x="${n(x - L * 0.45)}" y="${n(y + W / 2 + 3)}" ` +
            `width="${n(L * 0.9)}" height="5" rx="1.5"/>`;
    if (o.label) s += text(x, y - W / 2 - 7, o.label);
    return s;
  }

  /* An SPDT slide switch: one common pole and two ways.  sw() is the SPST
     blade; the kit's switch has three legs and a pupil has to see which one is
     the common, so it gets its own symbol rather than a wrong one. */
  function spdt(x, y, o) {
    o = o || {};
    const g = 13;
    let s = wire([[x - 26, y], [x - 11, y]]) + node(x - 11, y) +
            wire([[x + 11, y - g], [x + 26, y - g]]) + node(x + 11, y - g) +
            wire([[x + 11, y + g], [x + 26, y + g]]) + node(x + 11, y + g) +
            wire([[x - 11, y], [x + 9, y - g + 2]]);
    if (o.label) s += text(x, y + g + 16, o.label);
    return s;
  }

  /* the dashed outline round the gates that share one package */
  const chip = (x, y, w, h) =>
    `<rect class="sbd-chip" x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="6"/>`;

  /* ---- drawer thumbnails ------------------------------------------------
     The parts drawer shows every component by its CIRCUIT SYMBOL as well as
     its name, always — not only when the tile is open.  A pupil reading a
     circuit diagram has to find the part it names in the drawer, and that is
     the conversion the whole course is about; a list of words makes them
     translate twice.

     Each entry is a tight box with the symbol centred in it, drawn at the
     symbol library's own scale.  The box is tight rather than uniform so that
     every thumbnail can be rendered at the SAME HEIGHT on the page and still
     use all of it — a uniform box would shrink a resistor to a third of the
     space to leave room for a transistor's leads. */
  const THUMBS = {
    pos:  { w: 66, h: 40, d: (x, y) => wire([[x - 26, y + 6], [x + 26, y + 6]], "sbd-pos") +
            text(x, y - 4, "+5 V", { cls: "sbd-poslab" }) },
    neg:  { w: 66, h: 40, d: (x, y) => wire([[x - 26, y - 6], [x + 26, y - 6]]) +
            text(x, y + 14, "0 V") },
    in:   { w: 54, h: 30, d: (x, y) => term(x + 8, y) + arrow(x - 18, y, x - 3, y) },
    out:  { w: 54, h: 30, d: (x, y) => term(x - 8, y) + arrow(x + 3, y, x + 18, y) },
    tb:   { w: 62, h: 30, d: (x, y) => term(x - 11, y) + term(x + 11, y) +
            wire([[x - 4, y], [x + 4, y]]) },

    res:  { w: 80, h: 32, d: (x, y) => res(x, y, { span: 74 }) },
    ldr:  { w: 80, h: 50, d: (x, y) => ldr(x, y + 11, {}) },
    ther: { w: 80, h: 40, d: (x, y) => thermistor(x, y, {}) },
    led:  { w: 80, h: 48, d: (x, y) => led(x, y + 7, { dir: "r", span: 74 }) },
    dio:  { w: 80, h: 34, d: (x, y) => diode(x, y, { dir: "r", span: 74 }) },
    cap:  { w: 64, h: 30, d: (x, y) => cap(x, y, { span: 56 }) },
    ecap: { w: 60, h: 64, d: (x, y) => ecap(x + 5, y, { span: 56 }) },
    pot:  { w: 80, h: 52, d: (x, y) => pot(x, y - 9, {}) },
    tr:   { w: 76, h: 70, d: (x, y) => npn(x - 4, y, {}).svg },
    trp:  { w: 76, h: 70, d: (x, y) => pnp(x - 4, y, {}).svg },
    fet:  { w: 76, h: 62, d: (x, y) => mosfet(x, y, {}) },
    sw:   { w: 64, h: 42, d: (x, y) => spdt(x, y, {}) },

    mot:  { w: 62, h: 36, d: (x, y) => motor(x, y, { span: 56, letter: "M" }) },
    sol:  { w: 66, h: 40, d: (x, y) => solenoid(x, y - 4, {}) },
    rly:  { w: 62, h: 52, d: (x, y) => relay(x, y - 13, {}) },
    buz:  { w: 62, h: 36, d: (x, y) => sounder(x, y, { span: 56 }) },
    lp:   { w: 62, h: 36, d: (x, y) => lamp(x, y, { span: 56 }) },
    // the cone is all on one side of the body, so the drawing centre is not
    // the body centre: leads reach px-26, cone reaches px+19
    spk:  { w: 56, h: 46, d: (x, y) => speaker(x + 3.5, y, {}) },
    fuse: { w: 74, h: 30, d: (x, y) => fuse(x, y, { span: 68 }) },

    "7408": { w: 76, h: 48, d: (x, y) => andGate2(x - 8, y, {}).svg },
    "7432": { w: 76, h: 48, d: (x, y) => orGate(x - 8, y, {}).svg },
    "7400": { w: 80, h: 48, d: (x, y) => nandGate(x - 10, y, {}).svg },
    "7402": { w: 80, h: 48, d: (x, y) => norGate(x - 10, y, {}).svg },
    "7486": { w: 82, h: 48, d: (x, y) => xorGate(x - 8, y, {}).svg },
    "7404": { w: 76, h: 40, d: (x, y) => notGate(x - 7, y, {}).svg },
    "555":  { w: 76, h: 72, d: (x, y) => icBlock(x, y, { name: "555" }).svg },
    "741":  { w: 96, h: 70, d: (x, y) => opamp(x, y, {}).svg },
    ic:     { w: 76, h: 72, d: (x, y) => icBlock(x, y, { name: "IC" }).svg }
  };

  /* Which symbol a component record wants.  Free build mints parts with the
     palette `key` already on them; the authored questions do not, so the
     footprint answers instead — except for the two shapes that are shared by
     several parts. A `term-1` is four different things (both supply rails and
     an input or output terminal) and a `term-2` is eight (everything wired off
     the board), so those are told apart by the item ID, which is what a wiring
     schedule uses for exactly the same reason. */
  function symbolKey(c) {
    if (!c) return null;
    if (c.key) return { tr92: "tr", trp92: "trp", fet92: "fet" }[c.key] || c.key;
    const fp = c.footprint || "";
    if (/^dip-/.test(fp)) return THUMBS[c.part] ? c.part : "ic";
    if (fp === "term-1")
      return c.pos ? "pos" : c.neg ? "neg" : /^OUT/.test(c.id || "") ? "out" : "in";
    if (fp === "term-2") {
      const p = (/^([A-Z]+)/.exec(c.id || "") || [])[1];
      return { M: "mot", BZ: "buz", LP: "lp", LS: "spk", RLY: "rly",
               SOL: "sol", FS: "fuse" }[p] || "tb";
    }
    const fam = (/^([a-z]+)-/.exec(fp) || [])[1];
    return { res: "res", ldr: "ldr", ther: "ther", led: "led", cap: "cap", ecap: "ecap",
             diode: "dio", npn: "tr", pnp: "trp", mosfet: "fet", pot: "pot", spdt: "sw" }[fam] || null;
  }

  // the thumbnail as a standalone <svg>, or "" if nothing is drawn for it
  function symbol(c) {
    const t = THUMBS[symbolKey(c)];
    if (!t) return "";
    const name = (c && (c.name || c.id)) || "component";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t.w} ${t.h}" ` +
      `width="${t.w}" height="${t.h}" role="img" aria-hidden="true" focusable="false">` +
      `<title>circuit symbol for ${esc(name)}</title>` +
      t.d(t.w / 2, t.h / 2) + `</svg>`;
  }

  root.SBD.circuit = { wire, node, text, netnum, rail, res, led, andGate, orGate, notGate,
                       nandGate, norGate, xorGate,
                       icBlock, opamp, ecap, cap, diode, pot, mosfet, lamp, speaker, fuse,
                       relay, solenoid, spdt,
                       ldr, thermistor, npn, pnp, sw, sounder, motor, term, chip, arrow, wrap, DEFS,
                       symbol, symbolKey, THUMBS };

})(typeof globalThis !== "undefined" ? globalThis : this);
