// Writes one JSON per circuit for assets/js/build-guide.js. Every layout and
// every spot-the-mistake board is checked by SBD.check, or the build stops.
//
//   node tools/build-guides/build-guides.mjs        -> assets/guides/<id>.json
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ALL } from "./circuits.mjs";
import { question, attemptUpTo } from "./check.mjs";
const S = globalThis.SBD, R = S.render, C = S.circuit;
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = process.env.REPO || join(HERE, "..", "..");

const tp = (x, y, label) =>
  `<circle class="sbd-tp" cx="${x}" cy="${y}" r="6"/>` +
  `<text class="sbd-tpl" x="${x}" y="${y - 10}" text-anchor="middle">${label}</text>`;

const NETPOS = {
  "555-astable": [[60, 24], [60, 300], [150, 118.2], [160, 173.2], [312, 160], [330, 230], [330, 90]],
  "555-monostable": [[100, 24], [200, 300], [100, 199.6], [195, 118.2], [340, 160], [360, 244]],
  "op-amp-comparator": [[150, 24], [150, 300], [235, 174.1], [218, 145.9], [364, 160], [400, 244]]
};
/* Teacher, 18 Oct 2026 (Block 6 PLAN D4, D9): the comparator is not built, so it keeps
   Part 1 alone; the monostable is built on breadboard only, worked; the astable on
   stripboard only, some steps yours. */
const MODE = { "op-amp-comparator": "diagram", "555-monostable": "worked", "555-astable": "faded" };
const KIND = { "op-amp-comparator": null, "555-monostable": "bread", "555-astable": "strip" };
const SHORT = { "555-monostable": "555 monostable", "555-astable": "555 astable", "op-amp-comparator": "741 comparator" };
const PINNAMES = {
  "555": { 1: "Ground (0 V)", 2: "Trigger", 3: "Output", 4: "Reset", 5: "Control voltage (not used)", 6: "Threshold", 7: "Discharge", 8: "+Vcc (supply)" },
  "741": { 1: "Offset null (not used)", 2: "Inverting input (−)", 3: "Non-inverting input (+)", 4: "V− (0 V here)", 5: "Offset null (not used)", 6: "Output", 7: "V+ (+9 V here)", 8: "Not connected" }
};
/* the pin a pupil must find in the chip step, when that step asks */
const CHIPASK = { "555-monostable": ["1"], "555-astable": ["1"], "op-amp-comparator": ["4"] };

function kindData(c, kind) {
  const q = question(c, kind), board = S.BOARDS[q.board], ref = q.reference;
  const nodeOf = S.nodesOf(board, ref.cuts.map(x => { const h = S.parseRef(x); return h.r * 1000 + h.c; }));
  const pinHole = {};
  for (const p of ref.placements)
    for (const z of S.cellsOf(S.FOOTPRINTS[p.footprint], S.parseRef(p.at), p.rot || 0).pins) pinHole[p.id + "." + z.pin] = z.hole;
  const nodeAt = h => nodeOf.get(h.r * 1000 + h.c);
  const netsFor = ph => c.target.map(list => {
    const set = new Set(list.map(pid => nodeAt(ph[pid])));
    let grew = true;
    while (grew) {
      grew = false;
      for (const l of ref.links) {
        const a = nodeAt(S.parseRef(l.a)), b = nodeAt(S.parseRef(l.b));
        if (set.has(a) !== set.has(b)) { set.add(a); set.add(b); grew = true; }
      }
    }
    return [...set];
  });
  const size = ns => ns.reduce((t, x) => t + x.length, 0);
  for (let pass = 0; pass < 2; pass++)
    for (const p of ref.placements) {
      const fp = S.FOOTPRINTS[p.footprint];
      if (!fp.symmetric || fp.pins.length !== 2) continue;
      const [a, b] = fp.pins.map(z => p.id + "." + z.pin);
      const sw = Object.assign({}, pinHole, { [a]: pinHole[b], [b]: pinHole[a] });
      if (size(netsFor(sw)) < size(netsFor(pinHole))) Object.assign(pinHole, sw);
    }
  const nets = netsFor(pinHole);
  const nodes = {};
  for (const [k, v] of nodeOf) (nodes[v] = nodes[v] || { holes: [] }).holes.push([Math.floor(k / 1000), k % 1000]);
  for (const id in nodes) {
    const hs = nodes[id].holes.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const h0 = { r: hs[0][0], c: hs[0][1] };
    if (S.isBread(board)) {
      const rail = board.rails.find(x => x.r === h0.r);
      nodes[id].name = S.netName(board, h0).replace(/^the /, "").replace(/ \(([a-j])–([a-j])\)$/, " (holes $1–$2)");
      nodes[id].token = rail ? rail.pol : String(h0.c);
    } else {
      const c1 = hs[0][1], c2 = hs[hs.length - 1][1];
      nodes[id].name = `track ${S.rowLetter(h0.r)}` + (c1 === 1 && c2 === board.cols ? "" : ` (holes ${c1}–${c2})`);
      nodes[id].token = S.rowLetter(h0.r);
    }
  }
  const used = [];
  Object.values(pinHole).forEach(h => used.push(h.r * 1000 + h.c));
  for (const l of ref.links) for (const e of [l.a, l.b]) { const h = S.parseRef(e); used.push(h.r * 1000 + h.c); }
  for (const t of ref.testpoints) { const h = S.parseRef(t.at); used.push(h.r * 1000 + h.c); }
  /* only the nodes a net actually uses, so the page stays small */
  const keep = {};
  nets.flat().forEach(id => { keep[id] = nodes[id]; });
  const holeNode = {};
  for (const [k, v] of nodeOf) if (keep[v]) holeNode[k] = v;
  let viewBox = null;
  if (kind === "strip") {
    const all = [];
    for (const p of ref.placements) for (const z of S.cellsOf(S.FOOTPRINTS[p.footprint], S.parseRef(p.at), p.rot || 0).pins) all.push(z.hole);
    for (const l of ref.links) all.push(S.parseRef(l.a), S.parseRef(l.b));
    for (const t of ref.testpoints) all.push(S.parseRef(t.at));
    const maxR = Math.max(...all.map(h => h.r)) + 1, maxC = Math.max(...all.map(h => h.c)) + 2;
    const far = R.centreOf(Math.min(maxR, 23), Math.min(maxC, 37), q.board);
    viewBox = `0 0 ${Math.ceil(far.x + R.P / 2 + 6)} ${Math.ceil(far.y + R.P / 2 + 6)}`;
  }
  /* ---- chip first, then round the chip pin by pin ---- */
  const netOfNode = {};
  nets.forEach((ns, i) => ns.forEach(id => { netOfNode[id] = i + 1; }));
  const netOfHole = h => netOfNode[nodeAt(h)] || 0;
  const part = c.components.find(x => x.id === "IC1").part, names = PINNAMES[part];
  const u = S.isBread(board) ? "column" : "track";
  const order = [], pinFor = {};
  const isSupply = n => c.target[n - 1].some(x => /^(\+5V|\+9V|0V)\./.test(x));
  for (const wantSupply of [true, false])
    for (let p = 1; p <= 8; p++) {
      const pid = "IC1." + p;
      if (c.dontcare.includes(pid)) continue;
      const n = netOfHole(pinHole[pid]);
      if (n && isSupply(n) === wantSupply && !order.includes(n)) { order.push(n); pinFor[n] = p; }
    }
  for (let n = 1; n <= nets.length; n++) if (!order.includes(n)) order.push(n);
  const visit = {};
  order.forEach((n, i) => { visit[n] = i + 1; });
  const ref2 = JSON.parse(JSON.stringify(c.layouts[kind].reference));
  const legNets = p => S.cellsOf(S.FOOTPRINTS[p.footprint], S.parseRef(p.at), p.rot || 0).pins
    .map(z => ({ pin: z.pin, net: netOfHole(z.hole), node: nodeAt(z.hole) })).filter(x => x.net);
  ref2.cuts = ref2.cuts.map(x => [x[0], 0]);
  ref2.placements.forEach(p => { p.step = p.id === "IC1" ? 0 : Math.max(...legNets(p).map(x => visit[x.net])); });
  const anchorNodes = new Set();
  for (const [pid, h] of Object.entries(pinHole)) if (/^(IC1|\+5V|\+9V|0V)\./.test(pid)) anchorNodes.add(nodeAt(h));
  if (S.isBread(board)) board.rails.forEach(r => anchorNodes.add(nodeAt({ r: r.r, c: 1 })));
  const zeroLead = nodeAt(pinHole[Object.keys(pinHole).find(k => k.startsWith("0V."))]);
  for (const l of ref.links) {
    const a = nodeAt(S.parseRef(l.a)), b = nodeAt(S.parseRef(l.b));
    if (a === zeroLead) anchorNodes.add(b);
    if (b === zeroLead) anchorNodes.add(a);
  }
  const readyOf = node => {
    if (anchorNodes.has(node)) return visit[netOfNode[node]];
    const steps = ref2.placements.filter(p => p.id !== "IC1" && legNets(p).some(x => x.node === node)).map(p => p.step);
    return steps.length ? Math.min(...steps) : visit[netOfNode[node]];
  };
  ref2.links.forEach(l => {
    l.step = Math.max(readyOf(nodeAt(S.parseRef(l.a))), readyOf(nodeAt(S.parseRef(l.b))), visit[netOfHole(S.parseRef(l.a))]);
  });
  ref2.testpoints.forEach(t => { t.step = order.length + 1; });
  const nodeName = id => nodes[id].name;
  /* inside "net 3 (…)" a second bracket is hard to read, so its contents follow a comma */
  const inNet = id => nodes[id].name.replace(/ \((holes [^)]+)\)$/, ", $1");
  const listing = a => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
  const netParts = n => c.target[n - 1].map(x => x.startsWith("IC1.") ? "pin " + x.slice(4) : x.split(".")[0]).filter((v, i, a) => a.indexOf(v) === i);
  const supplyOf = n => { const t = c.target[n - 1].find(x => /^(\+5V|\+9V|0V)\./.test(x)); return t ? t.split(".")[0].replace("V", " V") : null; };
  const seq = [{ type: "chip", title: "Place the chip",
    lead: S.isBread(board)
      ? `Start with the chip. Push the ${part} across the centre gap with the notch on the left, so pin 1 is bottom left. Now every pin has a column of its own.`
      : `Start with the chip. Fit a socket for the ${part} with the notch at the top, so pin 1 is top left, and cut the four tracks between its two rows (red \u2717). Now every pin has a track of its own.`,
    how: `Then work round the chip: its supply pins first, then the rest one pin at a time. Each pin's net goes in the ${u} that pin is already in.`, items: [], prompts: [{ pin: CHIPASK[c.id][0], text: `Where is pin ${CHIPASK[c.id][0]}? Tap it on the board.` }] }];
  order.forEach((n, i) => {
    const k = i + 1, p = pinFor[n], sup = supplyOf(n);
    const chipPins = c.target[n - 1].filter(x => x.startsWith("IC1.")).map(x => x.slice(4));
    const others = netParts(n).filter(x => !x.startsWith("pin "));
    const step = { type: "net", net: n, pin: p || null, items: [], prompts: [{ net: n }] };
    if (p) {
      const pinNode = nodeAt(pinHole["IC1." + p]);
      step.title = `Pin ${p}: ${names[p]} \u2192 net ${n}`;
      step.lead = `On the diagram, pin ${p} joins ${listing(others.map(x => x.replace(/^(\+5|\+9|0)V$/, "$1 V")))}. Number it: net ${n}.` + (sup ? ` Net ${n} is the ${sup} supply.` : "");
      step.how = `Pin ${p} is in ${nodeName(pinNode)}, so that ${u} is net ${n}.` +
        chipPins.filter(q => q !== String(p)).map(q => ` Pin ${q} is on net ${n} too, so its ${u} joins in.`).join("");
    } else {
      step.title = `Net ${n}: ${listing(netParts(n))}`;
      step.lead = `${listing(netParts(n))} meet away from the chip. Number it: net ${n}.`;
      step.how = `Give net ${n} a free ${u}: ${nets[n - 1].map(nodeName).join(", ")}.`;
    }
    ref2.placements.filter(q => q.step === k).forEach(q => {
      const legs = legNets(q), comp = c.components.find(x => x.id === q.id);
      if (q.footprint.startsWith("term")) step.items.push(`${comp.name} lead: ${listing(legs.map(x => nodeName(x.node)))}, at the top-left corner beside the other supply lead, so both can share one spiral wrap to the power supply.`);
      else if (legs.length > 2) step.items.push(`${q.id} goes in now. Its ${legs.length} legs go in ${listing(legs.map(x => `net ${x.net} (${inNet(x.node)})`))}, in that order.`);
      else step.items.push(`${q.id} goes in now, from ${listing(legs.map(x => `net ${x.net} (${inNet(x.node)})`)).replace(/ and /, " to ")}.`);
      const other = legs.find(x => x.net !== n);
      if (other && legs.length === 2 && step.prompts.length < 2)
        step.prompts.push({ part: q.id, net: other.net, text: `${q.id} joins net ${n} to net ${other.net}. Tap where its other leg goes.` });
    });
    ref2.links.filter(l => l.step === k).forEach(l => {
      const a = nodeAt(S.parseRef(l.a)), b = nodeAt(S.parseRef(l.b));
      step.items.push(`A ${l.colour} link joins ${nodeName(a)} to ${nodeName(b)}. Both are net ${netOfNode[a]}.`);
    });
    seq.push(step);
  });
  seq.push({ type: "tp", title: "Test points", lead: "Mark a test point on each net you will measure, before you build.",
    how: ref2.testpoints.map(t => { const n = netOfHole(S.parseRef(t.at)); return `${t.id} on net ${n}`; }).join(", ") + ".", items: [], prompts: [] });
  seq.push({ type: "check", title: "Check it against the diagram", lead: `Read the board back one ${u} at a time and compare it with the numbered nets.`,
    how: `Every net must be one ${u}, or ${u}s joined by a link, and no two nets may touch.` + (S.isBread(board) ? "" : " On the layout this earns the marks for no errors, annotation, track cuts and test points."), items: [], prompts: [] });
  const placedStep = {};
  ref2.placements.forEach(p => { placedStep[p.id] = p.step; });
  const chk = S.check(q, q.reference);
  return {
    board: q.board, isBread: S.isBread(board),
    question: { id: q.id, title: q.title, board: q.board, components: q.components, target: q.target, dontcare: q.dontcare },
    reference: ref2, seq, order, nets, nodes: keep, holeNode, used,
    pinHoles: Object.fromEntries(Object.entries(pinHole).map(([k, h]) => [k, [h.r, h.c]])),
    placedStep, viewBox, ok: chk.ok, warnings: (chk.warnings || []).length
  };
}

/* --------------------------------------------------- spot the mistake */
/* Teacher, 18 Oct 2026 (D10): the monostable gets three faulty breadboards. */
const MISTAKES = {
  "555-monostable": [
    { change: r => { r.placements.find(p => p.id === "C1").rot = 90; }, focus: ["B12", "C12"],
      title: "Board A",
      why: "Right. C1's + leg is in the 0 V rail and its − leg is in the timing column. An electrolytic capacitor's + leg goes on the more positive net, here net 4.",
      options: [
        { t: "C1 is the wrong way round", ok: true },
        { t: "R2 is in the wrong column", fb: "R2 runs from the + rail to pin 7's column, as the diagram shows. Look at the parts that only work one way round." },
        { t: "The chip is not across the centre gap", fb: "The 555 sits across the gap, so its two rows are kept apart. Check which leg of C1 is in the 0 V rail." },
        { t: "The LED is the wrong way round", fb: "The LED's long leg is in R3's column, which is right. Look for the other part that only works one way round." }
      ] },
    { change: r => { r.links = r.links.filter(l => !(l.a === "L13" && l.b === "M13")); }, focus: ["L13", "M13"],
      title: "Board B",
      why: "Right. The red link from pin 4's column to the + rail is missing. Pin 4 is Reset. Left joined to nothing, it resets the 555, so the LED never comes on. Pin 4 must be on net 1, +5 V.",
      options: [
        { t: "Pin 4 has no link to +5 V", ok: true },
        { t: "C1 is the wrong way round", fb: "C1's + leg is in the timing column, which is right. Check every chip pin that should go to a rail." },
        { t: "R3 has both legs in one column", fb: "R3 runs from pin 3's column to the LED's column, so it isn't shorted. Follow pins 8 and 4 to the + rail." },
        { t: "Pin 1 has no link to 0 V", fb: "The black link from pin 1's column to the 0 V rail is there. Check the other supply pins." }
      ] },
    { change: r => { r.placements.find(p => p.id === "R3").rot = 90; }, focus: ["I12", "L12"],
      title: "Board C",
      why: "Right. Both of R3's legs are in column 12, so R3 is shorted out. Nothing joins pin 3 to the LED's column, so the LED never lights.",
      options: [
        { t: "R3 has both legs in one column, so it is shorted out", ok: true },
        { t: "The LED is the wrong way round", fb: "The LED's long leg is in the column R3 should reach. Look at how R3 is fitted." },
        { t: "R3 should be a link wire", fb: "R3 limits the LED current, so it must stay a resistor. Look at which columns its two legs are in." },
        { t: "The chip is in the wrong place", fb: "The 555 sits across the centre gap, as it should. Follow R3's two legs." }
      ] }
  ],
  "555-astable": [
    { change: r => { r.placements.find(p => p.id === "LED1").rot = 270; }, focus: ["R13", "S13"],
      title: "Board A",
      why: "Right. The red LED's long leg is on the 0 V track and its short leg on R3's track. It is reverse biased, so it never lights. The green LED still flashes.",
      options: [
        { t: "The red LED is the wrong way round", ok: true },
        { t: "R3 is on the wrong tracks", fb: "R3 runs from pin 3's track to the red LED, as it should. Look at the LED's flat edge." },
        { t: "The black link to 0 V is missing", fb: "The black link from the LED's track to 0 V is there. Check which way round the LED is." },
        { t: "The green LED is the wrong way round", fb: "The green LED is fitted correctly. Compare the two LEDs." }
      ] },
    { change: r => { r.links = r.links.filter(l => !(l.a === "G9" && l.b === "U9")); }, focus: ["G9", "U9"],
      title: "Board B",
      why: "Right. The yellow link from track G to track U is missing, so pin 2 is joined to nothing. Pin 2 must be on net 4 with pin 6 and C1's + leg.",
      options: [
        { t: "Pin 2 is not joined to C1 and pin 6", ok: true },
        { t: "R1 and R2 are swapped", fb: "R1 (1 kΩ) is from +5 V to pin 7 and R2 (10 kΩ) from pin 7 down, as drawn. Follow net 4: pin 2, pin 6 and C1." },
        { t: "A track cut is missing", fb: "All four cuts are there. Follow net 4 on the diagram: pin 2, pin 6 and C1+ must all be joined." },
        { t: "C1 is the wrong way round", fb: "C1's + leg is on the timing track. Look for a missing yellow link." }
      ] },
    { change: r => { r.placements.find(p => p.id === "R2").at = "H19"; }, focus: ["H19", "K19"],
      title: "Board C",
      why: "Right. R2's top leg is in track H (pin 6) instead of track G (pin 7). R2 now joins net 4 straight to +5 V, and pin 7 has only R1.",
      options: [
        { t: "R2 starts on pin 6's track instead of pin 7's", ok: true },
        { t: "R1 is too short", fb: "R1 reaches from track A to pin 7's track. Look at where R2's top leg sits." },
        { t: "The yellow links are the wrong colour", fb: "Colour doesn't change the circuit; the wiring is the problem. Look at R2's top leg." },
        { t: "Pin 8 has no supply", fb: "The red link to pin 8's track is there. Check R2 against net 3 on the diagram." }
      ] }
  ],
  "op-amp-comparator": [
    { change: r => { r.cuts = r.cuts.filter(x => x[0] !== "H14"); }, focus: ["H14"],
      title: "Board A",
      options: [
        { t: "A track cut is missing, so pin 3 and pin 6 are joined", ok: true },
        { t: "TH1 is the wrong way round", fb: "A thermistor works either way round. Count the cuts under the chip." },
        { t: "VR1's wiper is on the wrong track", fb: "VR1's wiper is on the sensing track. Look under the chip." },
        { t: "Pin 7 has no supply", fb: "The red link to pin 7's track is there. Count the red crosses." }
      ] },
    { change: r => { const l = r.links.find(l => l.a === "H6"); l.a = "G6"; }, focus: ["G6", "K6"],
      title: "Board B",
      options: [
        { t: "The yellow link joins pin 2, not pin 3, to the sensing track", ok: true },
        { t: "R2 and R3 are swapped", fb: "R2 is from +9 V and R3 to 0 V, as drawn. Follow net 3 from the sensing track to the chip." },
        { t: "The LED is the wrong way round", fb: "The LED is fitted correctly. Check which pin the yellow link reaches." },
        { t: "TH1 should be on 0 V", fb: "TH1 on top makes V<sub>in</sub> rise when it gets hot, which is what we want. Check the yellow link." }
      ] },
    { change: r => { r.placements.find(p => p.id === "VR1").at = "K9"; }, focus: ["K9", "L9", "M9"],
      title: "Board C",
      options: [
        { t: "VR1 is one track too low, so its wiper is on 0 V", ok: true },
        { t: "TH1 is on the wrong tracks", fb: "TH1 joins the +9 V spur to the sensing track. Look at VR1's middle pin." },
        { t: "The 0 V link is missing", fb: "The black links to 0 V are there. Which track is VR1's middle pin on?" },
        { t: "R3 is too long", fb: "R3 reaches from pin 2's track to 0 V. Look at VR1." }
      ] }
  ]
};

function mistakes(c) {
  const kind = KIND[c.id];
  if (!kind) return [];
  const q = question(c, kind);
  return MISTAKES[c.id].map(m => {
    const raw = JSON.parse(JSON.stringify(c.layouts[kind].reference));
    m.change(raw);
    const att = attemptUpTo(raw, 99);
    if (S.check(q, att).ok) throw new Error(c.id + " " + m.title + ": the mistake was not detected");
    return { title: m.title, attempt: att, why: m.why, focus: m.focus.map(x => { const h = S.parseRef(x); return [h.r, h.c]; }), options: m.options };
  });
}

/* ------------------------------------------------------------- quiz */
const QUIZ = {
  "555-monostable": [
    { q: "The monostable diagram has 6 numbered nets. What is the fewest number of columns and rails the breadboard can use?",
      o: [["6", true, "Right. Each net needs its own column or rail, so 6 is the fewest. A net can spread over more than one column if a link joins them."],
          ["3", false, "Each net needs a column or rail of its own, or two nets would be joined. Count the numbers on the diagram."],
          ["8, one per chip pin", false, "Some pins share a net (pins 6 and 7 do), so they can share a column. Count the nets, not the pins."],
          ["12", false, "That would leave columns unused. Each net needs at least one column or rail: count the numbers."]] },
    { q: "Why does the 555 sit across the centre gap?",
      o: [["So the pins opposite each other are not joined", true, "Right. Each column is joined top to bottom on its own side of the gap. Across the gap, pin 1 and pin 8 are in separate columns."],
          ["To stop the chip overheating", false, "The gap is about which pins are connected, not heat. Which pins would share a column without it?"],
          ["So the chip fits the power rails", false, "The rails run along the edges, away from the chip. Think about pin 1 and pin 8 in the same column."],
          ["It doesn't matter where the chip goes", false, "On one side of the gap, pins opposite each other would share a column. Think about pin 1 and pin 8."]] },
    { q: "Two legs are labelled with net 4 on the diagram. Where must they go on the breadboard?",
      o: [["In the same column, or columns joined by a link", true, "Right. Same number means connected."],
          ["In columns next to each other", false, "Next-door columns are not connected. Same number means the same column, or a link."],
          ["Anywhere, as long as there is a test point", false, "A test point measures a net; it doesn't join one. Same number means connected."],
          ["In different columns, so they don't short", false, "That is the rule for different numbers. The same number must be joined."]] }
  ],
  "555-astable": [
    { q: "Why are four tracks cut under the 555?",
      o: [["So the pins opposite each other are not joined", true, "Right. Without the cuts, pin 1 would join pin 8, pin 2 pin 7, and so on."],
          ["To stop the chip overheating", false, "The cuts are about which pins are connected, not heat. Which pins share a track without them?"],
          ["To make room for the socket", false, "The socket fits on uncut tracks too. Think about pin 1 and pin 8 on the same track."],
          ["Because the chip uses 4 V", false, "The cuts have nothing to do with the voltage. Count the pins on each side of the chip."]] },
    { q: "R1 is drawn between +5 V and pin 7. On stripboard it must sit…",
      o: [["Across two tracks: one with +5 V, one with pin 7", true, "Right. Each leg goes in its own net's track."],
          ["Along one track", false, "Both legs on one track short the resistor out. Each leg goes in its net's track."],
          ["Under the chip", false, "Parts never go under the chip. Find the +5 V track and pin 7's track."],
          ["Across the cut", false, "The cuts are for the chip. Put each leg in its net's track."]] },
    { q: "When should test points be marked on the layout?",
      o: [["Before the board is built", true, "Right. They are part of the plan, with the reading you expect beside each."],
          ["After it is soldered, where it is easy to reach", false, "Test points added afterwards are not planned. Mark them on the layout first."],
          ["Only if the circuit doesn't work", false, "Test points are planned for every board. They make testing quick."],
          ["Never on stripboard", false, "Stripboards take test pins too, and the marking scheme expects them."]] }
  ],
  "op-amp-comparator": [
    { q: "On the diagram, V<sub>in</sub> (net 3) goes to the + input. Which 741 pin is that?",
      o: [["Pin 3", true, "Right. Pin 3 is the non-inverting (+) input; pin 2 is the inverting (−) input."],
          ["Pin 2", false, "Pin 2 is the inverting (−) input, where V<sub>ref</sub> goes. Check the pin-out."],
          ["Pin 6", false, "Pin 6 is the output. The + input is pin 3."],
          ["Pin 7", false, "Pin 7 is the +9 V supply. The + input is pin 3."]] },
    { q: "TH1 warms up. What happens to V<sub>in</sub> at pin 3?",
      o: [["It rises", true, "Right. TH1's resistance falls, so TH1 takes a smaller share of the 9 V and VR1 a bigger share. V<sub>in</sub> is the voltage across VR1."],
          ["It falls", false, "That happens when the thermistor is at the bottom. Here TH1 is on top: as its resistance falls, VR1's share grows."],
          ["It stays the same", false, "V<sub>in</sub> depends on how the 9 V is shared between TH1 and VR1. What happens to TH1's resistance when it warms?"],
          ["It drops to 0 V", false, "VR1 still has a share of the supply. Think about which resistor gets the bigger share as TH1's resistance falls."]] },
    { q: "When does the LED come on?",
      o: [["When V<sub>in</sub> is bigger than V<sub>ref</sub>", true, "Right. The + input (pin 3) is then higher than the − input (pin 2), so the output, pin 6, goes HIGH."],
          ["When V<sub>ref</sub> is bigger than V<sub>in</sub>", false, "That makes the output LOW. The comparator's output is HIGH when the + input is the higher one."],
          ["When V<sub>in</sub> reaches 9 V", false, "V<sub>in</sub> only has to pass V<sub>ref</sub>, about 1.6 V. Compare the two inputs."],
          ["Whenever the supply is on", false, "The output depends on which input is higher. Compare V<sub>in</sub> and V<sub>ref</sub>."]] }
  ]
};

const SPARE = ["#8e44ad", "#d2691e", "#0f766e", "#db2777", "#7b4a2a", "#607078"];
function netColours(c, kinds) {
  const col = c.target.map(() => null);
  c.target.forEach((list, i) => {
    if (list.some(x => /^(\+5V|\+9V)\./.test(x))) col[i] = R.LINK_COLOURS.red;
    if (list.some(x => /^0V\./.test(x))) col[i] = R.LINK_COLOURS.black;
  });
  for (const k of ["strip", "bread"]) {
    const K = kinds[k];
    if (!K) continue;
    for (const l of K.reference.links) {
      const h = S.parseRef(l.a), node = K.holeNode[h.r * 1000 + h.c];
      const n = K.nets.findIndex(ns => ns.includes(node));
      if (n >= 0 && !col[n] && R.LINK_COLOURS[l.colour] && !col.includes(R.LINK_COLOURS[l.colour])) col[n] = R.LINK_COLOURS[l.colour];
    }
  }
  const spare = SPARE.filter(x => !col.includes(x));
  return col.map(x => x || spare.shift());
}

const circuits = ALL.map(c => {
  const d = c.circuit(C, tp), kind = KIND[c.id];
  const g = {
    id: c.id, title: c.title, short: SHORT[c.id], mode: MODE[c.id], kind,
    steps: c.steps.map(s => ({ key: s.key, title: s.title, circuit: s.circuit })),
    chip: c.components.find(x => x.id === "IC1").part,
    pinNames: PINNAMES[c.components.find(x => x.id === "IC1").part],
    target: c.target,
    netParts: c.target.map(list => list.map(p => p.startsWith("IC1.") ? "pin " + p.slice(4) : p.split(".")[0]).filter((v, i, a) => a.indexOf(v) === i)),
    diagram: { w: d.w, h: d.h, groups: d.groups, netPos: NETPOS[c.id], pins: d.pins },
    build: kind ? kindData(c, kind) : null,
    mistakes: mistakes(c), quiz: QUIZ[c.id]
  };
  if (g.build && (!g.build.ok || g.build.warnings)) throw new Error(c.id + " " + kind + " does not pass SBD.check");
  g.netColours = netColours(c, kind ? { [kind]: g.build } : {});
  return g;
});

const OUT = join(REPO, "assets", "guides");
mkdirSync(OUT, { recursive: true });
for (const g of circuits) {
  const dest = join(OUT, g.id + ".json");
  writeFileSync(dest, JSON.stringify(g) + "\n");
  console.log("wrote", dest.slice(REPO.length + 1));
}
