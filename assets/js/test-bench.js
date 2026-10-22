/* ============================================================================
   test-bench.js — the test bench screen (BENCH-PLAN §3, §12 2a)
   ----------------------------------------------------------------------------
   One bench, shared by Practise Testing and (Phase 4) Learn to Test.

     <section data-test-bench="555-astable" data-fault="s7"></section>

   Needs, loaded first: stripboard.js (window.SBD, the board drawing) and
   test-bench-engine.js (window.TB, the solver). Every reading comes from the
   solver on the board as drawn, so the picture and the meter cannot disagree.

   What it draws on top of the engine's board (the "bench layer", moved into the
   engine in Phase 3b, P4): colour bands, C1's printed value, LED glow, the leads
   or probe, the loupe. Flip board draws the copper side from the same geometry:
   strips, cuts, a joint at every leg, the parts as shadows.

   Technique is marked as it happens (§3.5): each reading gets a tick or a cross
   and the reason. Safety errors are said at once and block the badge for the run.
   ============================================================================ */
(function () {
  "use strict";
  const TB = window.TB, S = window.SBD;
  if (!TB || !S || !S.render) return;
  const R = S.render, P = R.P;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const n1 = v => Math.round(v * 10) / 10;
  const reduced = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  let UID = 0;

  /* ========================================================= the class meter
     The booklet's drawing (b6fig.multimeter, same coordinates), body yellow in
     both appearances (R3). The dial order is the solver's own TB.meter.DIAL. */
  const SEQ = TB.meter.DIAL.map(s => { const i = s.indexOf(" "); return i < 0 ? [s, ""] : [s.slice(0, i), s.slice(i + 1)]; });
  const STEP = 360 / SEQ.length, A0 = -2.5 * STEP, CX = 650, CY = 880, KR = 230;
  const pt = (r, a) => { a = a * Math.PI / 180; return [CX + r * Math.sin(a), CY - r * Math.cos(a)]; };
  const SEGS = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc",
    "7": "abc", "8": "abcdefg", "9": "abcdfg", "-": "g", " ": "" };
  function sevenSeg(xr, yt, h, text) {
    const w = .52 * h, t = .14 * h, gap = .2 * h, slant = .1 * h, k = t / 2, hh = h / 2;
    let s = "", x = xr;
    const sk = (px, py) => n1(px + slant * (1 - (py - yt) / h)) + "," + n1(py);
    for (const ch of text.split("").reverse()) {
      if (ch === ".") { const r = t * .6; s += `<circle cx="${n1(x - r)}" cy="${n1(yt + h)}" r="${n1(r)}"/>`; x -= 2 * r + gap * .4; continue; }
      const x0 = x - w;
      const E = { a: [[x0 + t, yt], [x0 + w - t, yt]], g: [[x0 + t, yt + hh], [x0 + w - t, yt + hh]], d: [[x0 + t, yt + h], [x0 + w - t, yt + h]],
        f: [[x0, yt + t], [x0, yt + hh - t]], b: [[x0 + w, yt + t], [x0 + w, yt + hh - t]],
        e: [[x0, yt + hh + t], [x0, yt + h - t]], c: [[x0 + w, yt + hh + t], [x0 + w, yt + h - t]] };
      for (const nm of SEGS[ch] || "") {
        const [[ax, ay], [bx, by]] = E[nm];
        const Q = ay === by ? [[ax - k, ay], [ax, ay - k], [bx, by - k], [bx + k, by], [bx, by + k], [ax, ay + k]]
                            : [[ax, ay - k], [ax + k, ay], [bx + k, by], [bx, by + k], [bx - k, by], [ax - k, ay]];
        s += `<polygon points="${Q.map(p => sk(p[0], p[1])).join(" ")}"/>`;
      }
      x = x0 - gap;
    }
    return s;
  }
  /* The display: right-aligned, except over range, where the meter shows a
     lone 1 in its left (half) digit. */
  const digitsSVG = text => !text ? "" : text === "1" || text === "-1"
    ? sevenSeg(960 - 3 * .72 * 140, 140, 140, text) : sevenSeg(960, 140, 140, text);

  function sector(r0, r1, a0, a1) {
    const N = Math.max(8, Math.floor(Math.abs(a1 - a0) / 2)), o = [], i = [];
    for (let k = 0; k <= N; k++) { o.push(pt(r1, a0 + (a1 - a0) * k / N)); i.push(pt(r0, a1 - (a1 - a0) * k / N)); }
    return `<polygon class="cm-sec" points="${o.concat(i).map(p => n1(p[0]) + "," + n1(p[1])).join(" ")}"/>`;
  }
  const SOCK = [[330, "20A"], [530, "A"], [770, "COM"], [970, "V/Ω"]], SY = 1450;
  const sayDial = s => s === "DCV D" ? "diode check" : s === "OHM 200" ? "OHM 200 (continuity)" : s;

  /* o: { setting: "DCV 20", red: "V/Ω" | "A" | "20A", dial: true for the big overlay } */
  function meterSVG(o) {
    const set = o.setting, red = o.red, dial = !!o.dial;
    let s = dial
      ? `<svg class="cm cm-big" viewBox="${CX - 470} ${CY - 470} 940 940" role="group" aria-label="The meter's dial, larger. Tap a setting.">` +
        `<circle class="cm-body" cx="${CX}" cy="${CY}" r="466"/>`
      : `<svg class="cm" viewBox="150 20 1000 1600" role="img" aria-label="The class multimeter, dial on ${esc(sayDial(set))}, red lead in ${esc(red)}">` +
        `<rect class="cm-body" x="170" y="40" width="960" height="1550" rx="60"/>` +
        `<rect class="cm-lcd" x="300" y="100" width="700" height="220" rx="16"/><g class="cm-seg"></g>` +
        `<rect class="cm-btn" x="210" y="370" width="80" height="80" rx="10"/><text class="cm-t" x="250" y="498" font-size="24" font-weight="700">ON/OFF</text>`;
    const ang = {};
    let ptr = 0;
    SEQ.forEach(([g, lab], k) => {
      const a = A0 + k * STEP;
      (ang[g] = ang[g] || []).push(a);
      const d = pt(KR + 30, a), t = pt(KR + 100, a);
      s += `<circle class="cm-ink" cx="${n1(d[0])}" cy="${n1(d[1])}" r="6"/>`;
      if (g === "OHM" && lab === "200") {
        const b = pt(KR + 130, a);
        s += `<circle class="cm-ink" cx="${n1(b[0] - 12)}" cy="${n1(b[1])}" r="5"/>` + [10, 17, 24].map(rr =>
          `<path class="cm-line" d="M${n1(b[0] - 12 + rr * Math.cos(-.87))} ${n1(b[1] + rr * Math.sin(-.87))} A${rr} ${rr} 0 0 1 ${n1(b[0] - 12 + rr * Math.cos(.87))} ${n1(b[1] + rr * Math.sin(.87))}"/>`).join("");
      }
      if (lab === "D") {
        const [x, y] = t, q = 16;
        s += `<polygon class="cm-ink" points="${x - q},${y - q * .8} ${x - q},${y + q * .8} ${x + q * .6},${y}"/>` +
             `<line class="cm-line" x1="${x + q * .6}" y1="${y - q * .8}" x2="${x + q * .6}" y2="${y + q * .8}" stroke-width="4"/>` +
             `<line class="cm-line" x1="${x - q * 1.6}" y1="${y}" x2="${x + q * 1.4}" y2="${y}"/>`;
      } else if (lab) {
        s += `<text class="cm-t" x="${n1(t[0])}" y="${n1(t[1] + 10)}" font-size="30">${lab}</text>`;
      }
      if ((lab ? g + " " + lab : g) === set) ptr = a;
    });
    Object.keys(ang).forEach(g => {
      const lo = Math.min(...ang[g]) - STEP / 2, hi = Math.max(...ang[g]) + STEP / 2, m = pt(KR + 190, (lo + hi) / 2);
      s += sector(KR + 12, KR + 142, lo, hi);
      s += `<text class="cm-t" x="${n1(m[0])}" y="${n1(m[1] + 12)}" font-size="36" font-weight="700">${g}</text>`;
    });
    s += `<circle class="cm-knob" cx="${CX}" cy="${CY}" r="${KR}"/>`;
    const u = pt(KR - 20, ptr), v = pt(-(KR - 20), ptr), w1 = pt(30, ptr), w2 = pt(KR - 28, ptr);
    s += `<line x1="${n1(v[0])}" y1="${n1(v[1])}" x2="${n1(u[0])}" y2="${n1(u[1])}" stroke="#111" stroke-width="40" stroke-linecap="round"/>` +
         `<line x1="${n1(w1[0])}" y1="${n1(w1[1])}" x2="${n1(w2[0])}" y2="${n1(w2[1])}" stroke="#fff" stroke-width="8"/>`;
    if (dial) {
      /* one tap target per setting, centred on its label: 64 units = 48 px at 720 px */
      SEQ.forEach(([g, lab], k) => {
        const t = pt(KR + 100, A0 + k * STEP), id = lab ? g + " " + lab : g, on = id === set;
        s += `<circle class="cm-hit${on ? " cm-on" : ""}" cx="${n1(t[0])}" cy="${n1(t[1])}" r="32" data-set="${esc(id)}" ` +
             `tabindex="0" role="button" aria-label="${esc(sayDial(id))}"${on ? ' aria-pressed="true"' : ""}/>`;
      });
      return s + "</svg>";
    }
    /* the knob opens the big dial; the sockets take the red lead */
    s += `<circle class="cm-tap" cx="${CX}" cy="${CY}" r="${KR + 150}" data-act="bigdial" tabindex="0" role="button" aria-label="Turn the dial: open the big dial"/>`;
    SOCK.forEach(([x, lab]) => {
      const used = lab === "COM" || lab === red;
      s += `<circle class="cm-sock" cx="${x}" cy="${SY}" r="34"/><circle class="${used ? "cm-ink" : "cm-sock"}" cx="${x}" cy="${SY}" r="14"/>` +
           `<text class="cm-t" x="${x}" y="${SY - 54}" font-size="32" font-weight="700">${lab}</text>`;
    });
    s += `<text class="cm-t" x="650" y="${SY + 10}" font-size="22">2A max</text>`;
    const rx = SOCK.find(z => z[1] === red)[0];
    s += `<line x1="770" y1="${SY + 14}" x2="770" y2="1620" stroke="#1d1d1d" stroke-width="14"/>` +
         `<line x1="${rx}" y1="${SY + 14}" x2="${rx}" y2="1620" stroke="#c62828" stroke-width="14"/>`;
    SOCK.forEach(([x, lab]) => {
      if (lab === "COM") return;
      s += `<circle class="cm-tap" cx="${x}" cy="${SY - 20}" r="78" data-sock="${lab}" tabindex="0" role="button" ` +
           `aria-label="Put the red lead in the ${lab} socket"${lab === red ? ' aria-pressed="true"' : ""}/>`;
    });
    return s + "</svg>";
  }

  /* ========================================================= the logic probe
     The class probe: Hi (red), Lo (green), Pulse (amber); TTL / CMOS and
     PULSE / MEM switches. Powered from its clips, so dark with the power off. */
  function probeSVG() {
    let s = `<svg class="tbx-probe-art" viewBox="0 0 340 128" role="img" aria-label="The logic probe">`;
    s += `<line class="pr-tip" x1="4" y1="44" x2="50" y2="44"/>`;
    s += `<path class="pr-body" d="M50 32 L78 18 H322 Q334 18 334 30 V58 Q334 70 322 70 H78 L50 56 Z"/>`;
    [["hi", 104, "Hi"], ["lo", 150, "Lo"], ["pulse", 196, "Pulse"]].forEach(([k, x, t]) => {
      s += `<circle class="pr-led pr-${k}" cx="${x}" cy="44" r="12"/><text class="pr-lab" x="${x}" y="94" text-anchor="middle">${t}</text>`;
    });
    s += `<rect class="pr-sw" x="232" y="30" width="40" height="28" rx="4"/><rect class="pr-knob pr-k1" x="234" y="32" width="18" height="24" rx="3"/>` +
         `<rect class="pr-sw" x="282" y="30" width="40" height="28" rx="4"/><rect class="pr-knob pr-k2" x="284" y="32" width="18" height="24" rx="3"/>` +
         `<text class="pr-lab pr-t1" x="252" y="94" text-anchor="middle">TTL</text><text class="pr-lab pr-t2" x="302" y="94" text-anchor="middle">PULSE</text>`;
    s += `<text class="pr-note" x="170" y="122" text-anchor="middle">clips: red on T1 (+5 V), black on T2 (0 V)</text>`;
    return s + "</svg>";
  }

  /* ========================================================= helpers */
  const FULL = { "200": 199.9, "2k": 1999, "20k": 19990, "200k": 199900, "2M": 1.999e6, "20M": 19.99e6 };
  const OHM_UNIT = { "200": "Ω", "2k": "kΩ", "20k": "kΩ", "200k": "kΩ", "2M": "MΩ", "20M": "MΩ" };
  function unitOf(set) {
    const [g, r] = set.split(" ");
    if (g === "OHM") return OHM_UNIT[r];
    if (set === "DCV D" || set === "DCV 200m" || set === "ACV 200m") return "mV";
    if (g === "DCV" || g === "ACV") return "V";
    if (g === "DCA" || g === "ACA") return /µ/.test(r) ? "µA" : /m$/.test(r) ? "mA" : "A";
    return "";
  }
  function makeDSU() {
    const p = new Map();
    const find = k => { if (!p.has(k)) p.set(k, k); let r = k; while (p.get(r) !== r) r = p.get(r); p.set(k, r); return r; };
    return { find, join: (a, b) => { a = find(a); b = find(b); if (a !== b) p.set(a, b); } };
  }
  const COLOUR_WORD = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "grey", "white"];
  const BAND = ["#111", "#7b3f00", "#d41c1c", "#f07c00", "#f5d000", "#1f9d3a", "#1c5fd4", "#7a2fc4", "#888", "#fff"];
  const LED_GLOW = { red: "rgba(255,40,40,.78)", green: "rgba(40,230,90,.72)", yellow: "rgba(255,210,0,.75)" };

  /* ========================================================= the bench */
  function Bench(root, opts) {
    this.root = root;
    this.id = "tbx" + (++UID);
    this.sc = TB.SCENARIOS[opts.scenario];
    if (!this.sc) throw new Error("test bench: no scenario " + opts.scenario);
    this.opts = opts;
    this.build();
    this.load(opts.fault || "good", opts.seed);
  }

  Bench.prototype.build = function () {
    const id = this.id, o = this.opts;
    this.root.classList.add("tbx");
    this.root.innerHTML =
      `<div class="tbx-job">
         <div class="tbx-job-t"><span class="tbx-title">${esc(o.title || "")}</span><span class="tbx-sub">${esc(o.sub || "")}</span>
           <div class="tbx-should">${o.should || ""}</div></div>
         <div class="tbx-tech" aria-live="polite"></div>
       </div>
       <div class="tbx-main">
         <div class="tbx-left">
           <div class="tbx-bar" role="toolbar" aria-label="Board controls">
             <button type="button" data-act="flip" aria-pressed="false">Flip board</button>
             <span class="tbx-seg" role="group" aria-label="View"><button type="button" data-view="board" aria-pressed="true">Board</button><button type="button" data-view="circuit" aria-pressed="false">Circuit</button></span>
             <span class="tbx-tps" role="group" aria-label="Test points"></span>
             <label class="tbx-pick"><span class="visually-hidden">Another point</span><select data-act="pick"></select></label>
             <button type="button" class="tbx-diag" data-job="diagnose" hidden>Diagnose</button>
           </div>
           <div class="tbx-board" id="${id}-board"></div>
           <div class="tbx-under">
             <div class="tbx-status" aria-live="polite"></div>
             <div class="tbx-log"><div class="tbx-log-h"><b>Readings log</b><button type="button" data-act="clearlog">Clear</button></div>
               <div class="tbx-log-b" tabindex="0" aria-label="Readings log"><table><thead><tr><th>Point</th><th>Tool and setting</th><th>Reading</th><th><span class="visually-hidden">Technique</span></th></tr></thead><tbody></tbody></table></div></div>
           </div>
           <div class="tbx-jobpanel" hidden></div>
           <div class="tbx-pop" hidden></div>
         </div>
         <div class="tbx-right">
           <div class="tbx-inst">
             <div class="tbx-meter"></div>
             <div class="tbx-probe" hidden></div>
             <div class="tbx-beep" hidden aria-hidden="true">BEEP</div>
           </div>
           <div class="tbx-dialrow"><button type="button" data-act="dial-" aria-label="Turn the dial one step left">◀</button><button type="button" class="tbx-cur" data-act="bigdial"></button><button type="button" data-act="dial+" aria-label="Turn the dial one step right">▶</button></div>
           <div class="tbx-proberow" hidden><span class="tbx-seg" role="group" aria-label="Logic family"><button type="button" data-pmode="TTL" aria-pressed="true">TTL</button><button type="button" data-pmode="CMOS" aria-pressed="false">CMOS</button></span>
             <span class="tbx-seg" role="group" aria-label="Pulse or memory"><button type="button" data-pmem="0" aria-pressed="true">Pulse</button><button type="button" data-pmem="1" aria-pressed="false">MEM</button></span></div>
           <div class="tbx-leadrow"><span class="tbx-lbl">Next tap:</span><span class="tbx-seg" role="group" aria-label="Which lead the next tap places"><button type="button" data-next="red" aria-pressed="true">Red lead</button><button type="button" data-next="black" aria-pressed="false">Black lead</button></span><button type="button" data-act="swap">Swap</button></div>
           <div class="tbx-row"><span class="tbx-seg" role="group" aria-label="Tool"><button type="button" data-tool="meter" aria-pressed="true">Meter</button><button type="button" data-tool="probe" aria-pressed="false">Probe</button><button type="button" data-tool="look" aria-pressed="false">Look</button></span>
             <span class="tbx-lbl tbx-pw">Power</span><span class="tbx-seg" role="group" aria-label="Power"><button type="button" data-power="on" aria-pressed="false">On</button><button type="button" data-power="off" aria-pressed="true">Off</button></span></div>
           <div class="tbx-fb" aria-live="polite"></div>
         </div>
       </div>
       <div class="tbx-dial" hidden role="dialog" aria-modal="true" aria-label="The meter's dial">
         <div class="tbx-dial-in"><div class="tbx-dial-art"></div>
           <div class="tbx-dial-side"><div class="tbx-dial-now"></div><p>Tap a setting. The dial turns to it.</p><div class="tbx-dial-fb"></div><button type="button" data-act="closedial">Close</button></div></div>
       </div>
       <div class="tbx-diagbox" hidden role="dialog" aria-modal="true" aria-label="Diagnose"></div>
       <p class="visually-hidden tbx-say" aria-live="polite"></p>`;
    const q = s => this.root.querySelector(s);
    this.el = {
      tech: q(".tbx-tech"), bar: q(".tbx-bar"), tps: q(".tbx-tps"), pick: q("select[data-act=pick]"), board: q(".tbx-board"),
      status: q(".tbx-status"), log: q(".tbx-log-b tbody"), logBox: q(".tbx-log-b"), meter: q(".tbx-meter"), probe: q(".tbx-probe"),
      beep: q(".tbx-beep"), cur: q(".tbx-cur"), dialrow: q(".tbx-dialrow"), proberow: q(".tbx-proberow"), leadrow: q(".tbx-leadrow"),
      fb: q(".tbx-fb"), dial: q(".tbx-dial"), dialArt: q(".tbx-dial-art"), dialNow: q(".tbx-dial-now"), dialFb: q(".tbx-dial-fb"), say: q(".tbx-say"),
      job: q(".tbx-job"), under: q(".tbx-under"), jobpanel: q(".tbx-jobpanel"), pop: q(".tbx-pop"), diag: q(".tbx-diag"), diagbox: q(".tbx-diagbox")
    };
    this.el.tps.innerHTML = this.sc.layout.testpoints.map(t => `<button type="button" data-pt="${t.id}" aria-pressed="false">${t.id}</button>`).join("");
    this.el.probe.innerHTML = probeSVG();
    this.root.addEventListener("click", e => this.onClick(e));
    this.root.addEventListener("keydown", e => {
      const t = e.target;
      if ((e.key === "Enter" || e.key === " ") && t instanceof SVGElement && t.getAttribute("role") === "button") { e.preventDefault(); this.onClick({ target: t }); }
      if (e.key === "Escape" && !this.el.dial.hidden) this.closeDial();
      else if (e.key === "Escape" && !this.el.diagbox.hidden) this.jobAct("close");
    });
    this.el.pick.addEventListener("change", () => {
      const v = this.el.pick.value;
      this.el.pick.value = "";
      if (v) this.act(JSON.parse(v));
    });
    this.root.addEventListener("pointerdown", () => this.unlockAudio(), { once: true });
  };

  /* ---------------------------------------------------------------- loading */
  Bench.prototype.load = function (fault, seed) {
    const sc = this.sc;
    this.fault = fault;
    this.seed = seed || String(Date.now() % 1e9);
    this.b = TB.bench(sc.id, { fault, seed: this.seed });
    this.F = this.b.fault;
    this.st = {
      side: "comp", view: "board", tool: "meter", dial: "DCV 20", sock: "V/Ω",
      red: null, black: sc.ground, next: "red", power: false,
      pmode: "TTL", pmem: false, tip: null, memLit: false,
      fuse: false, everOn: false, shortChecked: false, looked: new Set(), lookAt: null,
      ok: 0, bad: 0, safety: 0, seen: new Set(), log: [], live: null, last: null
    };
    this.ledSeen = {};
    this.geometry();
    this.b.power(false);
    this.meterSet();
    this.drawMeter();
    this.drawBoard();
    this.syncControls();
    this.fillPick();
    this.feedback(null, "Power is off", "Look at the board first. Then check for shorts with the power off, before you switch on.");
    this.renderLog();
    this.techLine();
    if (!this.clock) this.startClock();
  };

  /* Where everything is, in the engine's board coordinates. */
  Bench.prototype.geometry = function () {
    const L = this.F.layout, board = S.BOARDS[L.board], sc = this.sc;
    const cen = ref => { const h = S.parseRef(ref); return R.centreOf(h.r, h.c, L.board); };
    const parts = {}, pins = {}, covered = new Set();
    for (const p of L.placements) {
      const fp = S.FOOTPRINTS[p.footprint];
      const cells = S.cellsOf(fp, S.parseRef(p.at), p.rot || 0);
      const ps = cells.pins.map(z => ({ key: p.id + "." + z.pin, pin: z.pin, hole: S.ref(z.hole), ...R.centreOf(z.hole.r, z.hole.c, L.board) }));
      ps.forEach(q => { pins[q.key] = q; });
      const comp = (sc.question.components || []).find(c => c.id === p.id) || {};
      parts[p.id] = { id: p.id, kind: fp.kind, footprint: p.footprint, pins: ps, comp, model: (sc.parts[p.id] || {}).model };
      for (const h of cells.body || []) covered.add(S.ref(h));
      if (fp.kind === "dil") {
        const rs = ps.map(q => S.parseRef(q.hole)), r0 = Math.min(...rs.map(h => h.r)), r1 = Math.max(...rs.map(h => h.r));
        const c0 = Math.min(...rs.map(h => h.c)), c1 = Math.max(...rs.map(h => h.c));
        for (let r = r0; r <= r1; r++) for (let c = c0 + 1; c < c1; c++) covered.add(S.ref({ r, c }));
      } else if (ps.length === 2) {
        const a = S.parseRef(ps[0].hole), b = S.parseRef(ps[1].hole);
        const nstep = Math.max(Math.abs(a.r - b.r), Math.abs(a.c - b.c));
        for (let k = 1; k < nstep; k++) covered.add(S.ref({ r: Math.round(a.r + (b.r - a.r) * k / nstep), c: Math.round(a.c + (b.c - a.c) * k / nstep) }));
      }
    }
    const tps = {};
    for (const t of L.testpoints) tps[t.id] = { key: t.id, hole: t.at, ...cen(t.at) };
    /* the copper's nets, ignoring the parts: which strip each hole is on, and
       which strips the link wires join */
    const cuts = new Set(L.cuts.map(r => S.hid(S.parseRef(r))));
    const segOf = S.nodesOf(board, cuts);
    const dsu = makeDSU();
    const segAt = ref => { const k = segOf.get(S.hid(S.parseRef(ref))); return k === undefined ? null : "s" + k; };
    for (const l of L.links) { const a = segAt(l.a), b = segAt(l.b); if (a && b) dsu.join(a, b); }
    /* the crop: every hole in use, plus room for the leads to come in from the right */
    let maxc = 0, maxr = 0;
    const use = ref => { const h = S.parseRef(ref); maxc = Math.max(maxc, h.c); maxr = Math.max(maxr, h.r); };
    Object.values(pins).forEach(q => use(q.hole)); L.links.forEach(l => { use(l.a); use(l.b); }); L.testpoints.forEach(t => use(t.at));
    const far = R.centreOf(maxr, maxc, L.board);
    this.vb = { x: 0, y: 0, w: Math.ceil(far.x + 1.6 * P), h: Math.ceil(far.y + 1.0 * P) };
    this.G = { board, cen, parts, pins, tps, covered, segAt, net: ref => { const s = segAt(ref); return s ? dsu.find(s) : null; }, maxc, maxr };
  };

  /* A point is "T1", "IC1.4", "R2.1" or a hole "G19". */
  Bench.prototype.holeOf = function (k) {
    const G = this.G;
    return G.tps[k] ? G.tps[k].hole : G.pins[k] ? G.pins[k].hole : k;
  };
  Bench.prototype.netOf = function (k) { return k ? this.G.net(this.holeOf(k)) : null; };
  Bench.prototype.posOf = function (k) {
    const c = this.G.cen(this.holeOf(k));
    return this.st.side === "copper" ? { x: this.mirror(c.x), y: c.y } : c;
  };
  Bench.prototype.mirror = function (x) { return this.vb.x * 2 + this.vb.w - x; };
  Bench.prototype.legWord = function (part, pin) {
    const ps = part.pins;
    if (ps.length !== 2) return "pin " + pin.pin;
    const o = ps[0] === pin ? ps[1] : ps[0];
    if (Math.abs(o.y - pin.y) > Math.abs(o.x - pin.x)) return pin.y < o.y ? "top leg" : "bottom leg";
    return pin.x < o.x ? "left leg" : "right leg";
  };
  Bench.prototype.label = function (k) {
    if (!k) return "";
    const G = this.G;
    if (G.tps[k]) return k;
    const pin = G.pins[k];
    if (pin) {
      const pid = k.slice(0, k.lastIndexOf(".")), part = G.parts[pid];
      if (part.kind === "terminal") return (part.comp.name || pid).replace(/ supply$/, "") + " terminal";
      if (part.kind === "dil") return pid + " pin " + pin.pin;
      return pid + ", " + this.legWord(part, pin);
    }
    return "hole " + k;
  };

  /* --------------------------------------------------------------- drawing */
  Bench.prototype.drawBoard = function () {
    const st = this.st, id = this.id, vb = this.vb;
    let svg;
    if (st.view === "circuit") svg = this.circuitSVG();
    else {
      const art = st.side === "copper" ? this.copperArt() : this.componentArt();
      svg = `<svg class="tbx-svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" role="img" aria-label="${esc(this.boardAlt())}">` +
        `<defs><clipPath id="${id}-lp"><circle class="tbx-lpc" cx="0" cy="0" r="1"/></clipPath>` +
        `<radialGradient id="${id}-sol" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#f4f6f8"/><stop offset="1" stop-color="#8d939a"/></radialGradient></defs>` +
        `<g id="${id}-art">${art}</g><g class="tbx-glows"></g><g class="tbx-leads"></g><g class="tbx-loupe" hidden></g></svg>`;
    }
    this.el.board.innerHTML = svg;
    this.svg = this.el.board.querySelector("svg");
    this.el.board.classList.toggle("is-copper", st.side === "copper" && st.view === "board");
    if (st.view === "board") {
      this.svg.addEventListener("pointerdown", e => this.down(e));
      this.svg.addEventListener("pointermove", e => this.move(e));
      this.svg.addEventListener("pointerup", e => this.up(e));
      this.svg.addEventListener("pointercancel", () => this.hideLoupe());
      this.drawGlows();
    }
    this.drawLeads();
  };
  Bench.prototype.boardAlt = function () {
    return this.st.side === "copper"
      ? "The copper side of the board, turned over left to right. Copper strips run across; each leg's solder joint is drawn. Tap a joint or a track to test or look at it."
      : "The " + (this.opts.title || "") + " board on stripboard, component side, with test points " +
        this.sc.layout.testpoints.map(t => t.id).join(", ") + ". Tap a point, a leg or a part.";
  };

  Bench.prototype.componentArt = function () {
    const F = this.F, L = F.layout, G = this.G;
    const attempt = { cuts: L.cuts, placements: L.placements, links: L.links.map((l, i) => Object.assign({ num: i + 1 }, l)), testpoints: L.testpoints };
    /* a chip's print is the engine's own label: the wrong chip fitted (S4) is
       printed as what it is */
    const chips = Object.keys(F.printed || {}).filter(pid => /^74HC/.test(F.printed[pid]));
    const question = chips.length ? Object.assign({}, this.sc.question, { components: this.sc.question.components.map(c =>
      chips.includes(c.id) ? Object.assign({}, c, { part: "74" + F.printed[c.id].slice(4) }) : c) }) : this.sc.question;
    let svg = R.renderBoard({ board: L.board, question, attempt });
    svg = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<title>[\s\S]*?<\/title>/, "");
    /* colour bands: three digits and the gold tolerance band, along each resistor */
    let s = "";
    for (const [pid, v] of Object.entries(F.bands || {})) {
      const part = G.parts[pid]; if (!part) continue;
      const [p, q] = part.pins, L2 = Math.hypot(q.x - p.x, q.y - p.y), ux = (q.x - p.x) / L2, uy = (q.y - p.y) / L2;
      const ins = Math.min(P * .62, L2 * .26), len = L2 - 2 * ins, bw = Math.max(2.2, len * .075);
      [[.16, BAND[v[0]]], [.31, BAND[v[1]]], [.46, BAND[v[2]]], [.80, "#c9a227"]].forEach(([f, col]) => {
        const c = ins + len * f;
        s += `<line x1="${n1(p.x + ux * (c - bw / 2))}" y1="${n1(p.y + uy * (c - bw / 2))}" x2="${n1(p.x + ux * (c + bw / 2))}" y2="${n1(p.y + uy * (c + bw / 2))}" ` +
             `stroke="${col}" stroke-width="${n1(P * .68)}"${col === "#fff" ? ' class="tbx-band-w"' : ""}/>`;
      });
    }
    for (const [pid, txt] of Object.entries(F.printed || {})) {
      const part = G.parts[pid]; if (!part || chips.includes(pid)) continue;
      const [p, q] = part.pins;
      s += `<text class="tbx-print" x="${n1((p.x + q.x) / 2 + P * .78)}" y="${n1((p.y + q.y) / 2 + 4)}">${esc(txt)}</text>`;
    }
    return svg + s;
  };

  /* The copper side: the board turned over left to right, so column 1 is on
     the right. Strips, cuts, holes and joints are drawn mirrored; the words
     (row letters, column numbers, part names) are written the right way round. */
  Bench.prototype.copperArt = function () {
    const F = this.F, L = F.layout, G = this.G, vb = this.vb, id = this.id;
    const rows = G.board.rows, cols = Math.min(G.board.cols, G.maxc + 1);
    const cutSet = new Set(L.cuts), mx = x => this.mirror(x);
    const joints = new Map();
    Object.values(G.pins).forEach(q => joints.set(q.hole, q.key));
    L.links.forEach((l, i) => { joints.set(l.a, "link@" + l.a); joints.set(l.b, "link@" + l.b); });
    L.testpoints.forEach(t => joints.set(t.at, t.id));
    let s = `<rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" class="tbx-sub"/>`;
    let g = "";
    for (let r = 0; r < rows; r++) {
      const y = G.cen(S.ref({ r, c: 1 })).y;
      if (y > vb.h) break;
      let c0 = 1;
      for (let c = 1; c <= cols + 1; c++) {
        const isCut = c <= cols && cutSet.has(S.ref({ r, c }));
        if (isCut || c === cols + 1) {
          if (c - 1 >= c0) {
            const xa = G.cen(S.ref({ r, c: c0 })).x - P * .5 + (c0 === 1 ? 0 : P * .32), xb = G.cen(S.ref({ r, c: c - 1 })).x + P * .5 - (isCut ? P * .32 : 0);
            g += `<rect class="tbx-cu" x="${n1(xa)}" y="${n1(y - P * .40)}" width="${n1(xb - xa)}" height="${n1(P * .80)}" rx="2"/>` +
                 `<rect class="tbx-cuhi" x="${n1(xa)}" y="${n1(y - P * .40)}" width="${n1(xb - xa)}" height="${n1(P * .12)}"/>`;
          }
          c0 = c + 1;
        }
      }
      for (let c = 1; c <= cols; c++) {
        const ref = S.ref({ r, c }), x = G.cen(ref).x;
        if (cutSet.has(ref)) { g += `<circle class="tbx-drill" cx="${n1(x)}" cy="${n1(y)}" r="${n1(P * .30)}"/>`; continue; }
        if (!joints.has(ref)) g += `<circle class="tbx-hole" cx="${n1(x)}" cy="${n1(y)}" r="${n1(P * .11)}"/>`;
      }
    }
    for (const br of F.bridges || []) {
      const a = G.cen(br[0]), b = G.cen(br[1]);
      g += `<ellipse class="tbx-bridge" cx="${n1((a.x + b.x) / 2)}" cy="${n1((a.y + b.y) / 2)}" rx="${n1(Math.abs(a.x - b.x) / 2 + P * .4)}" ry="${n1(Math.abs(a.y - b.y) / 2 + P * .4)}"/>`;
    }
    /* the parts as shadows, seen through the board */
    let sh = "";
    for (const part of Object.values(G.parts)) {
      const ps = part.pins;
      if (part.kind === "dil") {
        const xs = ps.map(q => q.x), ys = ps.map(q => q.y);
        sh += `<rect class="tbx-shadow" x="${n1(Math.min(...xs) - P * .2)}" y="${n1(Math.min(...ys) - P * .55)}" width="${n1(Math.max(...xs) - Math.min(...xs) + P * .4)}" height="${n1(Math.max(...ys) - Math.min(...ys) + P * 1.1)}" rx="4"/>`;
      } else if (ps.length === 2) {
        sh += `<line class="tbx-shadow-l" x1="${n1(ps[0].x)}" y1="${n1(ps[0].y)}" x2="${n1(ps[1].x)}" y2="${n1(ps[1].y)}" stroke-width="${n1(P * .55)}"/>`;
      }
    }
    for (const l of L.links) { const a = G.cen(l.a), b = G.cen(l.b); sh += `<line class="tbx-shadow-l" x1="${n1(a.x)}" y1="${n1(a.y)}" x2="${n1(b.x)}" y2="${n1(b.y)}" stroke-width="${n1(P * .16)}"/>`; }
    /* a joint at every leg, link end and test pin */
    let j = "";
    for (const [ref, what] of joints) {
      const c = G.cen(ref), dry = F.dry.has(what) || F.dry.has(what.replace(/^link@/, "link@"));
      if (dry) {
        j += `<circle class="tbx-dry" cx="${n1(c.x)}" cy="${n1(c.y)}" r="${n1(P * .36)}"/>` +
             `<circle class="tbx-dry-ring" cx="${n1(c.x)}" cy="${n1(c.y)}" r="${n1(P * .2)}"/>` +
             `<path class="tbx-crack" d="M${n1(c.x - P * .28)} ${n1(c.y - P * .3)} L${n1(c.x - P * .08)} ${n1(c.y - P * .06)} L${n1(c.x - P * .2)} ${n1(c.y + P * .1)} L${n1(c.x + P * .04)} ${n1(c.y + P * .34)}"/>` +
             `<circle class="tbx-lead-end" cx="${n1(c.x)}" cy="${n1(c.y)}" r="${n1(P * .09)}"/>`;
      } else {
        j += `<circle cx="${n1(c.x)}" cy="${n1(c.y)}" r="${n1(P * .36)}" fill="url(#${id}-sol)"/>` +
             `<circle class="tbx-shine" cx="${n1(c.x - P * .1)}" cy="${n1(c.y - P * .1)}" r="${n1(P * .09)}"/>` +
             `<circle class="tbx-lead-end" cx="${n1(c.x)}" cy="${n1(c.y)}" r="${n1(P * .09)}"/>`;
      }
    }
    s += `<g transform="matrix(-1 0 0 1 ${vb.x * 2 + vb.w} 0)">${g}${sh}${j}</g>`;
    /* words, the right way round */
    let w = "";
    for (let r = 0; r < rows; r++) {
      const c = G.cen(S.ref({ r, c: 1 }));
      if (c.y > vb.h) break;
      w += `<text class="tbx-cl" x="${n1(mx(c.x) + P * .9)}" y="${n1(c.y + 4)}" text-anchor="middle">${S.rowLetter ? S.rowLetter(r) : String.fromCharCode(65 + r)}</text>`;
    }
    for (let c = 1; c <= cols; c += (c === 1 ? 4 : 5)) {
      const p = G.cen(S.ref({ r: 0, c }));
      w += `<text class="tbx-cl" x="${n1(mx(p.x))}" y="${n1(p.y - P * .62)}" text-anchor="middle">${c}</text>`;
    }
    for (const part of Object.values(G.parts)) {
      if (part.kind === "terminal") continue;
      const ps = part.pins, x = ps.reduce((a, q) => a + q.x, 0) / ps.length, y = ps.reduce((a, q) => a + q.y, 0) / ps.length;
      w += `<text class="tbx-shlab" x="${n1(mx(x) + (part.kind === "dil" ? 0 : P * .55))}" y="${n1(y + 4)}" text-anchor="${part.kind === "dil" ? "middle" : "start"}">${esc(part.id)}</text>`;
    }
    w += `<text class="tbx-ctitle" x="${n1(vb.x + 8)}" y="${n1(vb.h - 8)}">Copper side: turned over, left to right</text>`;
    return s + w;
  };

  Bench.prototype.circuitSVG = function () {
    const d = this.sc.diagram;
    return `<svg class="tbx-svg tbx-circ" viewBox="-8 -8 ${d.w + 16} ${d.h + 16}" role="img" aria-label="Circuit diagram of the board, with test points ${this.sc.layout.testpoints.map(t => t.id).join(", ")}. Tap a test point.">` +
      d.svg + `<g class="tbx-leads"></g></svg>`;
  };

  Bench.prototype.drawGlows = function () {
    const g = this.svg && this.svg.querySelector(".tbx-glows");
    if (!g) return;
    let s = "";
    for (const part of Object.values(this.G.parts)) {
      if (part.model !== "led") continue;
      const [p, q] = part.pins;
      const x = (p.x + q.x) / 2, y = (p.y + q.y) / 2;
      const col = (this.sc.parts[part.id] || {}).colour || "red";
      s += `<circle class="tbx-glow" data-led="${part.id}" cx="${n1(this.st.side === "copper" ? this.mirror(x) : x)}" cy="${n1(y)}" r="${n1(P * .95)}" fill="${LED_GLOW[col] || LED_GLOW.red}" opacity="0"/>`;
    }
    g.innerHTML = this.st.side === "copper" ? "" : s;
  };

  /* The leads, drawn from the meter's side of the board to the points tapped. */
  Bench.prototype.drawLeads = function () {
    const st = this.st, g = this.svg && this.svg.querySelector(".tbx-leads");
    if (!g) return;
    if (st.view === "circuit") { g.innerHTML = this.circuitMarks(); this.syncTPButtons(); return; }
    const vb = this.vb, X1 = vb.x + vb.w + 6;
    const cable = (p, y0, cls) => {
      const d = `M${X1} ${n1(y0)} C ${n1(X1 - 60)} ${n1(y0)} ${n1(p.x + 34)} ${n1(Math.max(p.y + 60, y0 * .5 + p.y * .5))} ${n1(p.x + 9)} ${n1(p.y + 16)}`;
      return `<path class="tbx-cab-o" d="${d}"/><path class="tbx-cab ${cls}" d="${d}"/>`;
    };
    const needle = p => `<line class="tbx-needle" x1="${n1(p.x + 9)}" y1="${n1(p.y + 16)}" x2="${n1(p.x)}" y2="${n1(p.y)}"/><circle class="tbx-ntip" cx="${n1(p.x)}" cy="${n1(p.y)}" r="2.6"/>`;
    const clip = (p, cls) => `<g transform="translate(${n1(p.x)} ${n1(p.y)}) rotate(-35)"><rect class="tbx-clip ${cls}" x="-3" y="-5" width="30" height="12" rx="3"/><path class="tbx-jaw" d="M-6 -3 l9 -4 M-6 5 l9 4"/></g>`;
    const ring = (k, cls) => { const p = this.posOf(k); return `<circle class="tbx-ring ${cls}" cx="${n1(p.x)}" cy="${n1(p.y)}" r="${n1(P * .62)}"/>`; };
    let s = "";
    if (st.tool === "meter") {
      if (st.black) {
        const p = this.posOf(st.black), clipped = st.black === this.sc.ground && this.isVoltSetting();
        s += ring(st.black, "is-black") + cable(p, vb.h * .66, "is-black") + (clipped ? clip(p, "is-black") : needle(p));
      }
      if (st.red) { const p = this.posOf(st.red); s += ring(st.red, "is-red") + cable(p, vb.h * .58, "is-red") + needle(p); }
    } else if (st.tool === "probe") {
      const a = this.posOf(this.sc.supplyTP), b = this.posOf(this.sc.ground);
      s += cable(a, vb.h * .10, "is-red") + clip(a, "is-red") + cable(b, vb.h * .90, "is-black") + clip(b, "is-black");
      if (st.tip) {
        const p = this.posOf(st.tip);
        s += ring(st.tip, "is-tip") + cable({ x: p.x + 46, y: p.y - 70 }, vb.h * .40, "is-probe") +
          `<g transform="translate(${n1(p.x)} ${n1(p.y)}) rotate(-55)"><line class="tbx-needle" x1="0" y1="0" x2="16" y2="0"/>` +
          `<path class="tbx-pen" d="M16 -6 L26 -11 H86 Q92 -11 92 -5 V5 Q92 11 86 11 H26 L16 6 Z"/></g>`;
      }
    } else if (st.lookAt) {
      s += this.lookRing(st.lookAt);
    }
    g.innerHTML = s;
    this.syncTPButtons();
  };
  Bench.prototype.circuitMarks = function () {
    const at = this.sc.diagram.at, st = this.st;
    const onDia = k => at[k] ? k : null;
    const mark = (k, cls) => { const q = at[onDia(k)]; return q ? `<circle class="tbx-dring ${cls}" cx="${q[0]}" cy="${q[1]}" r="11"/>` : ""; };
    if (st.tool === "meter") return mark(st.black, "is-black") + mark(st.red, "is-red");
    if (st.tool === "probe") return mark(st.tip, "is-tip");
    return "";
  };
  Bench.prototype.lookRing = function (t) {
    const G = this.G;
    if (t.part) {
      const ps = G.parts[t.part].pins.map(q => this.posOf(q.key));
      const xs = ps.map(p => p.x), ys = ps.map(p => p.y);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      return `<ellipse class="tbx-look" cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1((Math.max(...xs) - Math.min(...xs)) / 2 + P * .95)}" ry="${n1((Math.max(...ys) - Math.min(...ys)) / 2 + P * .95)}"/>`;
    }
    if (t.link) {
      const l = this.F.layout.links[t.link - 1], a = this.posOf(l.a), b = this.posOf(l.b);
      return `<ellipse class="tbx-look" cx="${n1((a.x + b.x) / 2)}" cy="${n1((a.y + b.y) / 2)}" rx="${n1(Math.abs(a.x - b.x) / 2 + P * .8)}" ry="${n1(Math.abs(a.y - b.y) / 2 + P * .8)}"/>`;
    }
    const p = this.posOf(t.pt);
    return `<circle class="tbx-look" cx="${n1(p.x)}" cy="${n1(p.y)}" r="${n1(P * .8)}"/>`;
  };

  /* --------------------------------------------------------- hit testing */
  Bench.prototype.svgPoint = function (e) {
    const m = this.svg.getScreenCTM();
    if (!m) return null;
    const p = this.svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(m.inverse());
    return { x: q.x, y: q.y, scale: m.a };
  };
  /* What a tap at (x, y) touches: a test point, a leg, a part's body, a link
     (Look only) or the copper at a hole. Taps snap within 22 px. */
  Bench.prototype.targetAt = function (x, y, scale) {
    const G = this.G, st = this.st, rad = 22 / scale;
    if (st.side === "copper") x = this.mirror(x);
    let best = null, bd = Infinity;
    const consider = (k, p, kind, bias) => { const d = Math.hypot(p.x - x, p.y - y) - (bias || 0); if (d < bd) { bd = d; best = { pt: k, kind }; } };
    for (const t of Object.values(G.tps)) consider(t.key, t, "tp", P * .15);
    if (st.side === "comp") for (const q of Object.values(G.pins)) consider(q.key, q, "pin", P * .1);
    const near = best && bd <= rad ? best : null;
    if (st.side === "comp" && (!near || bd > P * .45)) {
      for (const part of Object.values(G.parts)) {
        const ps = part.pins;
        if (part.kind === "terminal") continue;
        if (part.kind === "dil") {
          const xs = ps.map(q => q.x), ys = ps.map(q => q.y);
          if (x > Math.min(...xs) + P * .3 && x < Math.max(...xs) - P * .3 && y > Math.min(...ys) - P * .5 && y < Math.max(...ys) + P * .5) return { part: part.id };
        } else if (ps.length === 2 && segDist(x, y, ps[0], ps[1]) < P * .42) {
          const t = proj(x, y, ps[0], ps[1]);
          if (t > .18 && t < .82) return { part: part.id };
        }
      }
      if (st.tool === "look" || this.finding) {
        const Ls = this.F.layout.links;
        for (let i = 0; i < Ls.length; i++) if (segDist(x, y, G.cen(Ls[i].a), G.cen(Ls[i].b)) < P * .3) return { link: i + 1 };
      }
    }
    if (near) return near;
    const c = { r: Math.round((y - G.cen("A1").y) / P), c: Math.round((x - G.cen("A1").x) / P) + 1 };
    if (c.r < 0 || c.c < 1 || c.r >= G.board.rows || c.c > G.board.cols) return null;
    const ref = S.ref(c), p = G.cen(ref);
    if (Math.hypot(p.x - x, p.y - y) > rad) return null;
    if (st.side === "comp" && G.covered.has(ref)) return null;
    return { pt: ref, kind: "hole" };
  };
  function segDist(x, y, a, b) { const t = Math.max(0, Math.min(1, proj(x, y, a, b))); return Math.hypot(a.x + (b.x - a.x) * t - x, a.y + (b.y - a.y) * t - y); }
  function proj(x, y, a, b) { const dx = b.x - a.x, dy = b.y - a.y; return ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1); }
  Bench.prototype.targetName = function (t) {
    if (!t) return "";
    if (t.part) return t.part;
    if (t.link) { const l = this.F.layout.links[t.link - 1]; return "Link " + t.link + " (" + l.colour + ")"; }
    if (this.st.side === "copper" && !this.G.tps[t.pt]) {
      const k = this.jointAt(t.pt);
      return k ? "Joint at " + t.pt : "Track at " + t.pt;
    }
    return this.label(t.pt).replace(/^hole /, "Hole ");
  };
  Bench.prototype.jointAt = function (ref) {
    const G = this.G;
    for (const q of Object.values(G.pins)) if (q.hole === ref) return q.key;
    for (const l of this.F.layout.links) if (l.a === ref || l.b === ref) return "link@" + ref;
    for (const t of Object.values(G.tps)) if (t.hole === ref) return t.key;
    return null;
  };

  /* The loupe: a magnifier bubble over the finger while it is down (§3.2). */
  Bench.prototype.down = function (e) {
    if (e.button && e.button !== 0) return;
    this.svg.setPointerCapture && this.svg.setPointerCapture(e.pointerId);
    this.pressing = true;
    this.showLoupe(e);
  };
  Bench.prototype.move = function (e) { if (this.pressing) this.showLoupe(e); };
  Bench.prototype.up = function (e) {
    if (!this.pressing) return;
    this.pressing = false;
    const q = this.svgPoint(e);
    this.hideLoupe();
    if (!q) return;
    const t = this.targetAt(q.x, q.y, q.scale);
    if (t) this.act(t);
  };
  Bench.prototype.showLoupe = function (e) {
    const q = this.svgPoint(e), g = this.svg.querySelector(".tbx-loupe");
    if (!q || !g) return;
    const t = this.targetAt(q.x, q.y, q.scale);
    let c = { x: q.x, y: q.y };
    if (t && t.pt) c = this.posOf(t.pt);
    const r = 58 / q.scale, vb = this.vb, z = 2.6;
    let lx = c.x - 1.5 * r, ly = c.y - 1.9 * r;
    lx = Math.max(vb.x + r + 4, Math.min(vb.x + vb.w - r - 4, lx));
    if (ly < vb.y + r + 4) ly = c.y + 1.9 * r;
    const id = this.id, fs = 15 / q.scale;
    g.innerHTML = `<circle class="tbx-lp-bg" cx="${n1(lx)}" cy="${n1(ly)}" r="${n1(r)}"/>` +
      `<g clip-path="url(#${id}-lpk)"><use href="#${id}-art" transform="translate(${n1(lx)} ${n1(ly)}) scale(${z}) translate(${n1(-c.x)} ${n1(-c.y)})"/></g>` +
      `<circle class="tbx-lp-rim" cx="${n1(lx)}" cy="${n1(ly)}" r="${n1(r)}" stroke-width="${n1(4 / q.scale)}"/>` +
      `<circle class="tbx-lp-x" cx="${n1(lx)}" cy="${n1(ly)}" r="${n1(9 / q.scale)}" stroke-width="${n1(3 / q.scale)}"/>` +
      `<text class="tbx-lp-t" x="${n1(lx)}" y="${n1(ly + r + fs * 1.25)}" font-size="${n1(fs)}" text-anchor="middle">${esc(this.targetName(t))}</text>`;
    let cp = this.svg.querySelector("#" + id + "-lpk");
    if (!cp) {
      cp = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      cp.setAttribute("id", id + "-lpk");
      cp.innerHTML = '<circle/>';
      this.svg.querySelector("defs").appendChild(cp);
    }
    const cc = cp.firstChild;
    cc.setAttribute("cx", n1(lx)); cc.setAttribute("cy", n1(ly)); cc.setAttribute("r", n1(r));
    g.hidden = false;
    g.removeAttribute("hidden");
  };
  Bench.prototype.hideLoupe = function () {
    this.pressing = false;
    const g = this.svg && this.svg.querySelector(".tbx-loupe");
    if (g) { g.setAttribute("hidden", ""); g.innerHTML = ""; }
  };

  /* --------------------------------------------------------- controls */
  Bench.prototype.onClick = function (e) {
    const t = e.target.closest ? e.target.closest("[data-job],[data-act],[data-view],[data-tool],[data-power],[data-pt],[data-next],[data-pmode],[data-pmem],[data-set],[data-sock],[data-tp]") : null;
    if (!t || !this.root.contains(t)) return;
    const st = this.st, a = t.getAttribute.bind(t);
    if (t.hasAttribute("data-job")) { if (!t.disabled) this.jobAct(a("data-job"), t); return; }
    if (t.hasAttribute("data-set")) { this.setDial(a("data-set"), "now"); this.closeDial(); return; }
    if (t.hasAttribute("data-sock")) { st.sock = a("data-sock"); this.instrumentChanged("now"); return; }
    if (t.hasAttribute("data-view")) { st.view = a("data-view"); this.drawBoard(); this.syncControls(); return; }
    if (t.hasAttribute("data-tool")) { this.setTool(a("data-tool")); return; }
    if (t.hasAttribute("data-power")) { this.setPower(a("data-power") === "on"); return; }
    if (t.hasAttribute("data-pt")) { this.act({ pt: a("data-pt"), kind: "tp" }); return; }
    if (t.hasAttribute("data-tp") && st.view === "circuit") { this.act({ pt: a("data-tp"), kind: "tp" }); return; }
    if (t.hasAttribute("data-next")) { st.next = a("data-next"); this.syncControls(); return; }
    if (t.hasAttribute("data-pmode")) { st.pmode = a("data-pmode"); this.probeChanged(); return; }
    if (t.hasAttribute("data-pmem")) { st.pmem = a("data-pmem") === "1"; st.memLit = false; this.probeChanged(); return; }
    switch (a("data-act")) {
      case "flip": st.side = st.side === "comp" ? "copper" : "comp"; if (st.view !== "board") st.view = "board"; this.drawBoard(); this.syncControls(); break;
      case "dial-": this.stepDial(-1); break;
      case "dial+": this.stepDial(1); break;
      case "bigdial": this.openDial(); break;
      case "closedial": this.closeDial(); break;
      case "swap": { const r = st.red; st.red = st.black; st.black = r; this.instrumentChanged("tap"); break; }
      case "clearlog": st.log = []; st.live = null; this.renderLog(); break;
      case "newfuse": st.fuse = false; this.b.meter(null); this.meterSet(); this.feedback("ok", "New fuse fitted", "The meter works again. Check the red lead is in V/Ω before you measure a voltage."); this.drawMeter(); break;
    }
  };

  Bench.prototype.setTool = function (tool) {
    const st = this.st;
    st.tool = tool;
    st.lookAt = null;
    if (tool === "probe") { this.b.meter(null); this.b.probe({ tip: st.tip, mode: st.pmode }); }
    else { this.b.probe(null); this.meterSet(); }
    if (tool === "look") this.feedback(null, "Look", "Tap a part, a link or a joint to look at it closely. Flip the board to see the joints and track cuts.");
    this.syncControls(); this.drawLeads(); this.fillPick();
    if (tool === "probe" && st.tip) this.measured("setting");
  };
  Bench.prototype.setPower = function (on) {
    const st = this.st;
    if (st.power === on) return;
    if (this.job && this.jobLocked()) { this.syncControls(); return; }
    st.power = on;
    this.b.power(on);
    this.syncControls();
    if (on && !st.everOn) {
      st.everOn = true;
      if (!st.shortChecked) this.mark("safety", "noshort", "You switched on before checking for shorts. A short across the supply can damage the supply and the board. Power off first, then test for continuity from +5 V to 0 V.", "Power on", "", "before a short check");
      else if (!st.looked.size) this.mark("bad", "nolook", "Before switching on, look at the board. Check the parts match the layout.", "Power on", "", "before looking at the board");
      else this.mark("ok", "prepower", "Right: you looked at the board and checked for shorts before switching on.", "Power on", "", "after the checks");
    }
    if ((st.tool === "meter" && st.red && st.black) || (st.tool === "probe" && st.tip)) this.measured("power");
    else if (!on) this.feedback(null, "Power is off", "Resistance, continuity and diode checks are done with the power off.");
  };
  Bench.prototype.isVoltSetting = function () { const g = this.st.dial.split(" ")[0]; return (g === "DCV" || g === "ACV") && this.st.dial !== "DCV D"; };
  Bench.prototype.isTwoPoint = function () { const g = this.st.dial.split(" ")[0]; return g === "OHM" || this.st.dial === "DCV D"; };
  Bench.prototype.stepDial = function (d) {
    const i = TB.meter.DIAL.indexOf(this.st.dial), n = TB.meter.DIAL.length;
    this.setDial(TB.meter.DIAL[(i + d + n) % n], false);
  };
  Bench.prototype.setDial = function (s, how) {
    this.st.dial = s;
    if (this.isVoltSetting() && this.st.next === "black") this.st.next = "red";
    this.instrumentChanged(how || "step");
  };
  /* how: "tap" (a lead placed), "now" (a setting picked) or "step" (the dial
     clicked round one place). Stepping through positions takes a moment, as on
     a real meter, so the reading is judged where the dial comes to rest. */
  Bench.prototype.instrumentChanged = function (how) {
    /* close the old row first: drawMeter reads the new set-up straight away */
    this.st.live = null;
    this.meterSet();
    this.drawMeter();
    this.drawLeads();
    this.syncControls();
    clearTimeout(this.settleT);
    const st = this.st;
    if (st.tool === "meter" && st.red && st.black) {
      if (how === "step") this.settleT = setTimeout(() => this.measured("setting"), 900);
      else this.measured(how === "tap" ? "tap" : "setting");
    }
  };
  Bench.prototype.probeChanged = function () {
    const st = this.st;
    this.b.probe({ tip: st.tip, mode: st.pmode });
    this.syncControls();
    clearTimeout(this.settleT);
    if (st.tip) this.settleT = setTimeout(() => this.measured("setting"), 600);
  };
  Bench.prototype.meterSet = function () {
    const st = this.st;
    if (st.tool !== "meter" && st.tool !== "look") return;
    const sock = st.sock === "V/Ω" ? "V" : st.sock;
    this.b.meter(st.dial, { red: st.red || undefined, black: st.black || undefined, socket: sock });
  };

  /* A tap on the board, a test-point button, the circuit or the point list. */
  Bench.prototype.act = function (t) {
    const st = this.st;
    if (this.job && this.jobLocked()) return;
    if (this.finding) { this.jobFind(t); return; }
    if (st.tool === "look") { this.look(t); return; }
    if (t.link) return;
    if (st.tool === "probe") {
      if (t.part) { this.feedback("bad", "One pin at a time", "The probe tip goes on one point: a pin, a leg or a test point. Tap a point, not the body of " + t.part + "."); return; }
      st.tip = t.pt; st.memLit = false;
      this.b.probe({ tip: st.tip, mode: st.pmode });
      this.drawLeads(); this.measured("tap");
      return;
    }
    if (t.part) {
      const ps = this.G.parts[t.part].pins;
      if (ps.length !== 2) { this.feedback("bad", "Tap a pin", "Put the leads on two pins of " + t.part + ", one at a time."); return; }
      st.red = ps[0].key; st.black = ps[1].key; st.next = "red";
    } else {
      st[st.next] = t.pt;
      st.next = this.isTwoPoint() && st.next === "red" ? "black" : "red";
    }
    this.instrumentChanged("tap");
  };

  /* ------------------------------------------------------- the big dial */
  Bench.prototype.openDial = function () {
    const st = this.st;
    this.el.dialArt.innerHTML = meterSVG({ dial: true, setting: st.dial });
    this.el.dialNow.textContent = "Dial: " + sayDial(st.dial);
    this.el.dialFb.innerHTML = this.el.fb.classList.contains("is-safety") ? this.el.fb.innerHTML : "";
    this.el.dial.hidden = false;
    this.dialFrom = document.activeElement;
    const on = this.el.dialArt.querySelector(".cm-on") || this.el.dialArt.querySelector(".cm-hit");
    if (on && on.focus) on.focus({ preventScroll: true });
  };
  Bench.prototype.closeDial = function () {
    if (this.el.dial.hidden) return;
    this.el.dial.hidden = true;
    if (this.dialFrom && this.dialFrom.focus && this.root.contains(this.dialFrom)) this.dialFrom.focus({ preventScroll: true });
  };

  /* ------------------------------------------------------- Look (visual inspection) */
  Bench.prototype.look = function (t) {
    const st = this.st, G = this.G, F = this.F;
    st.lookAt = t;
    this.drawLeads();
    let title = "", text = "", key = "", short = "";
    if (t.part) {
      const part = G.parts[t.part], ps = part.pins, model = part.model;
      key = t.part;
      if (model === "res") {
        const v = F.bands[t.part];
        title = t.part + ": a resistor";
        short = v.map(d => COLOUR_WORD[d]).join(" ") + " gold";
        text = "Bands, from the end nearest the bands: <b>" + v.map(d => COLOUR_WORD[d]).join(", ") + ", gold</b>.";
      } else if (model === "led") {
        const k = ps.find(q => q.pin === "k"), a = ps.find(q => q.pin === "a");
        const col = (this.sc.parts[t.part] || {}).colour;
        title = t.part + ": " + (col || "") + " LED";
        short = "flat side at the " + this.legWord(part, k).replace(" leg", "");
        text = "The flat side of the rim (the cathode, short leg) is at the <b>" + this.legWord(part, k).replace(" leg", "") + "</b>, in hole " + k.hole + ".";
        if (!a) text = "An LED.";
      } else if (model === "ecap") {
        const m = ps.find(q => q.pin === "-");
        title = t.part + ": an electrolytic capacitor";
        short = (F.printed[t.part] || "") + ", stripe at the " + this.legWord(part, m).replace(" leg", "");
        text = "Printed on the side: <b>" + esc(F.printed[t.part] || "") + " 25 V</b>. The stripe (the − leg) is at the <b>" + this.legWord(part, m).replace(" leg", "") + "</b>, in hole " + m.hole + ".";
      } else if (part.kind === "dil") {
        const p1 = ps.find(q => q.pin === "1");
        title = t.part + ": a chip";
        short = "NE" + (part.comp.part || "") + ", notch at the top";
        text = "Printed on top: <b>NE" + esc(part.comp.part || "") + "</b>. The notch is at the top. Pin 1 is in hole " + p1.hole + ".";
      } else {
        title = part.comp.name || t.part;
        text = "In hole " + ps.map(q => q.hole).join(" and ") + ".";
      }
    } else if (t.link) {
      const l = F.layout.links[t.link - 1];
      key = "link" + t.link;
      title = "Link " + t.link + ": " + l.colour + " wire";
      short = l.a + " to " + l.b;
      text = "One end in hole <b>" + l.a + "</b>, the other in hole <b>" + l.b + "</b>.";
    } else if (st.side === "copper") {
      const ref = this.holeOf(t.pt), j = this.jointAt(ref);
      key = "copper:" + ref;
      if (j) {
        const dry = F.dry.has(j), who = j.indexOf("link@") === 0 ? "a link wire" : G.tps[j] ? "test pin " + j : this.label(j);
        title = "Joint at " + ref;
        short = dry ? "dull, cracked" : "bright, smooth";
        text = "The joint on " + esc(who) + ". " + (dry
          ? "<b>Dull and grey, with a crack in a ring round the leg.</b> The solder has not flowed onto the track."
          : "Bright and smooth: the solder has flowed onto the track and round the leg.");
      } else {
        title = "Track at " + ref;
        short = "no joint";
        text = "Row " + ref.replace(/\d+$/, "") + ". No joint here.";
      }
      const r = S.parseRef(ref);
      const cutNear = F.layout.cuts.filter(c => { const h = S.parseRef(c); return h.r === r.r && Math.abs(h.c - r.c) <= 1; });
      if (cutNear.length) text += " Track cut at " + cutNear.join(", ") + ": the copper is drilled away, so the strip is split there.";
    } else {
      const ref = this.holeOf(t.pt);
      title = this.label(t.pt);
      text = "Flip the board to see the joint and the track under " + ref + ".";
      key = "";
    }
    if (key && !st.looked.has(key)) {
      st.looked.add(key);
      this.pendingEv = { type: "look", key };
      this.mark("ok", "look:" + key, "Visual check: " + title + ".", title.replace(/:.*/, ""), "Look", short || "looked", true);
    }
    this.feedback("look", title, text);
  };

  /* ------------------------------------------------------- marking (§3.5) */
  /* Each reading: the first thing that is wrong, or a tick and why it is right. */
  /* trigger: "tap" (a lead or the tip placed), "setting" (dial, socket or probe
     switch changed with the leads on) or "power". Only a tap is marked wrong:
     turning the dial or the power with the leads on is not a reading yet, so a
     mistake then is said but not counted. Safety errors count whatever the trigger. */
  Bench.prototype.measured = function (trigger) {
    const st = this.st;
    this.soft = trigger !== "tap";
    if (st.tool === "probe") return this.assessProbe();
    if (st.tool !== "meter" || !st.red || !st.black) return;
    const rd = this.b.read(0) || {};
    if (rd.fuse && !st.fuse) st.fuse = true;
    const [g, rng] = st.dial.split(" "), live = st.power, sock = st.sock;
    const across = this.acrossPart(st.red, st.black);
    const pts = this.label(st.red) + (st.black === this.sc.ground && this.isVoltSetting() ? "" : " → " + this.label(st.black));
    const tool = "Meter " + st.dial + (sock !== "V/Ω" ? ", red in " + sock : "");
    const say = (kind, code, text) => this.mark(kind, code, text, pts, tool, null, false, true);
    const onRail = (k, rail) => this.netOf(k) && this.netOf(k) === this.netOf(rail);
    /* what this row can stand as evidence for, in Diagnose and the proving test */
    this.pendingEv = null;
    if (sock === "V/Ω" && g === "DCV" && st.dial !== "DCV D" && live && !rd.over && !rd.fuse && onRail(st.black, this.sc.ground) && !this.isLogicOut(st.red))
      this.pendingEv = { type: "dcv", key: st.red };
    if (sock === "V/Ω" && g === "OHM" && !live)
      this.pendingEv = { type: "ohm", a: st.red, b: st.black, beep: !!rd.beep, over: !!rd.over, value: rd.value };
    if (sock !== "V/Ω" && g !== "DCA" && g !== "ACA") {
      if (live) return say("safety", "ainv", "The red lead is in <b>A</b>. Measuring voltage like this puts a short across the circuit and blows the meter's fuse. Tap the <b>V/Ω</b> socket to move it back.");
      return say("bad", "asock", "The red lead is in " + sock + ". Resistance, continuity and diode check use the <b>V/Ω</b> socket.");
    }
    if (g === "DCA" || g === "ACA") {
      if (sock !== "V/Ω" && live) return say("safety", "aacross", "The meter is across two points, not in series. In A mode that is a short. Current is measured with the circuit broken and the meter in the gap.");
      return say("bad", "dca", g + " measures current, with the meter in series and the red lead in A. To measure a voltage, turn the dial to <b>DCV</b>.");
    }
    if (g === "ACV" || g === "hFE") return say("bad", "ac", "This board runs on DC. Turn the dial to <b>DCV</b>.");
    if (g === "OHM") {
      if (live) return say("safety", rng === "200" ? "conton" : "ohmon", rng === "200"
        ? "With the power on, a beep means nothing, and the circuit's current can damage the meter. Switch off first."
        : "The power is on. The circuit's current upsets the reading and can damage the meter. Switch off first.");
      const rails = (onRail(st.red, this.sc.supplyTP) && onRail(st.black, this.sc.ground)) || (onRail(st.black, this.sc.supplyTP) && onRail(st.red, this.sc.ground));
      if (rails) {
        if (!st.everOn) st.shortChecked = true;
        if (rd.beep) return say("ok", "short", "Beep: +5 V is joined to 0 V. That is a short across the supply. Do not switch on.");
        return say("ok", "short", "Right: power off, and " + (rng === "200" ? "no beep" : "a high reading") + " from +5 V to 0 V. There is no short across the supply.");
      }
      /* on continuity (OHM 200), 1 means "not joined", which is a result, not a range mistake */
      if (rng !== "200" && rd.over && isFinite(rd.value) && rd.value < 20e6) return say("bad", "ohmlow", "1 on the left means over range. Turn the dial up one step.");
      if (rng !== "200" && isFinite(rd.value) && rd.value < FULL[rng] / 100) return say("bad", "ohmhigh", "This range is too high: the reading is nearly 0. Turn the dial down for more digits.");
      return say("ok", "ohm", rng === "200"
        ? "Right: power off, OHM 200. " + (rd.beep ? "A beep and a small reading: the two points are joined." : "No beep: the two points are not joined.")
        : "Right: power off, red lead in V/Ω, and a range that shows the value.");
    }
    if (st.dial === "DCV D") {
      if (live) return say("bad", "dion", "Diode check is done with the power off. The meter pushes its own small current through the diode.");
      const led = across && this.G.parts[across.part].model === "led" ? across : null;
      if (led) {
        const redPin = this.G.pins[led.redPin];
        if (redPin.pin === "k") return say("bad", "direv", "The red lead is on the cathode (the flat side). A diode blocks this way, so 1 is what it shows. Swap the leads before you call it faulty.");
        return say("ok", "diode", "Right: power off, red lead on the anode. A number (about 1.6 to 1.9 V for an LED) means it conducts. 1 means it blocks.");
      }
      return say("ok", "diode", "Right: diode check with the power off. Red on the anode: a number means it conducts, 1 means it blocks.");
    }
    if (g === "DCV") {
      if (!live) return say("bad", "voff", "The power is off, so there is no voltage to measure. Switch on first.");
      if (this.isLogicOut(st.red)) return say("bad", "logicmeter", "Logic levels on a chip are tested with the <b>logic probe</b>, not the meter. Choose Probe, then touch the pin.");
      if (!onRail(st.black, this.sc.ground) && !across) return say("bad", "black0", "Put the black lead on 0 V (T2). The voltages on the job card are measured from 0 V.");
      if (rd.over) return say("bad", "over", "1 on the left means over range. Turn up to <b>DCV 20</b>.");
      if (rng === "200" || rng === "1000") return say("bad", "bigrange", "This works, but DCV " + rng + " shows fewer decimal places. DCV 20 is the range just above 5 V.");
      return say("ok", "dcv", "Right: DCV " + rng + ", red lead in V/Ω, black " + (across ? "on the other leg" : "on 0 V") + ".");
    }
  };
  Bench.prototype.assessProbe = function () {
    const st = this.st;
    if (!st.tip) return;
    this.pendingEv = null;
    const pts = this.label(st.tip), tool = "Probe " + st.pmode + (st.pmem ? ", MEM" : "");
    const say = (kind, code, text) => this.mark(kind, code, text, pts, tool, null, false, true);
    if (!st.power) return say("bad", "probeoff", "Switch on first. The probe takes its power from the board, so with the power off its lights stay dark.");
    if (st.pmode === "CMOS") return say("bad", "cmos", "Set the probe to <b>TTL</b> for the 555. On CMOS it needs 70 % of the supply (3.5 V) to show Hi, and the 555's HIGH is only about 3.6 V.");
    if (st.pmem) return say("bad", "mem", "Use <b>Pulse</b>, not MEM. MEM keeps the pulse light on after one pulse, so you cannot tell if it is still pulsing.");
    if (!this.isAnalog(st.tip)) this.pendingEv = { type: "probe", key: st.tip };
    if (this.isAnalog(st.tip)) return say("bad", "analog", "T4 is not a logic signal. It rises and falls smoothly between about 1.7 V and 3.3 V. Measure it with the meter on DCV 20.");
    return say("ok", "probe", "Right: clips on this board's +5 V and 0 V, TTL, Pulse, and the tip on one point.");
  };
  /* The 555's output strip (T3, pin 3) is a logic level: probe only (Block 6
     round 2). The timing strip (T4, pins 2 and 6) is not a logic signal. */
  Bench.prototype.isLogicOut = function (k) { return this.G.segAt(this.holeOf(k)) === this.G.segAt(this.holeOf("IC1.3")); };
  Bench.prototype.isAnalog = function (k) { return this.G.segAt(this.holeOf(k)) === this.G.segAt(this.holeOf("IC1.2")); };
  Bench.prototype.acrossPart = function (a, b) {
    for (const part of Object.values(this.G.parts)) {
      if (part.pins.length !== 2) continue;
      const ks = part.pins.map(q => q.key);
      if (ks.indexOf(a) >= 0 && ks.indexOf(b) >= 0) return { part: part.id, redPin: a };
    }
    return null;
  };

  /* kind: ok | bad | safety. Ticks count once per kind of test and point;
     crosses once per mistake and point; safety errors every time. */
  Bench.prototype.mark = function (kind, code, text, pts, tool, reading, quiet, live) {
    const st = this.st, key = code + "|" + pts + "|" + (tool || "");
    if (kind === "bad" && live && this.soft) { this.pendingEv = null; this.feedback("bad", "Check", text); return; }
    const first = !st.seen.has(key);
    st.seen.add(key);
    if (kind === "safety") st.safety++;
    else if (first && kind === "ok") st.ok++;
    else if (first && kind === "bad") st.bad++;
    const head = kind === "ok" ? "✓ Right" : kind === "safety" ? "✗ Safety error" : "✗ Not quite";
    if (!quiet) this.feedback(kind, head, text.replace(/^Right: /, ""));
    if (kind === "safety") this.el.fb.insertAdjacentHTML("beforeend", '<p class="tbx-block"><b>This run can no longer earn the badge.</b></p>' +
      (code === "ainv" || code === "aacross" ? '<button type="button" data-act="newfuse">Fit a new fuse</button>' : ""));
    if (pts) {
      if (st.live) st.live = null;
      const row = { pt: pts, tool: tool || "", reading: reading || "", mark: kind === "ok" ? "✓" : "✗", kind, ev: this.pendingEv };
      st.log.push(row);
      if (live) {
        st.live = { row, t0: performance.now(), min: Infinity, max: -Infinity, hi: false, lo: false, pulse: false };
        if (st.tool === "meter") { const rd = this.b.read(0); if (rd) this.liveLog(rd, null); }
      }
      this.renderLog();
    }
    this.pendingEv = null;
    this.techLine();
    this.say(head + ". " + text.replace(/<[^>]+>/g, ""));
    if (pts && this.job) this.jobRow(st.log[st.log.length - 1], kind);
  };
  Bench.prototype.feedback = function (kind, head, html) {
    const fb = this.el.fb;
    fb.className = "tbx-fb" + (kind === "ok" ? " is-ok" : kind === "bad" ? " is-bad" : kind === "safety" ? " is-bad is-safety" : kind === "look" ? " is-look" : "");
    fb.innerHTML = `<div class="tbx-fb-h">${esc(head)}</div><div>${html}</div>`;
    fb.dataset.text = html;
  };
  Bench.prototype.techLine = function () {
    const st = this.st;
    this.el.tech.innerHTML = `<span class="tbx-tc">Technique <b class="ok">✓ ${st.ok}</b> <b class="bad">✗ ${st.bad}</b></span>` +
      (st.safety ? `<span class="tbx-sc">Safety errors: ${st.safety}</span>` : "");
  };
  Bench.prototype.say = function (t) { this.el.say.textContent = t; };

  /* ------------------------------------------------------- the log */
  Bench.prototype.renderLog = function () {
    const rows = this.st.log;
    this.el.log.innerHTML = rows.length ? rows.map(r =>
      `<tr><td>${esc(r.pt)}</td><td>${esc(r.tool)}</td><td>${esc(r.reading || "…")}</td><td class="${r.kind === "ok" ? "ok" : "bad"}">${r.mark}</td></tr>`).join("")
      : `<tr><td colspan="4" class="tbx-none">No readings yet.</td></tr>`;
    this.el.logBox.scrollTop = this.el.logBox.scrollHeight;
  };
  Bench.prototype.liveLog = function (rd, pr) {
    const L = this.st.live;
    if (!L) return;
    /* a real meter takes a moment to settle; so does the solver after a change.
       Until then the row shows the first reading but keeps no min or max, so a
       lead moved again quickly still leaves a reading behind. */
    const early = performance.now() - L.t0 < 400;
    if (early && L.row.reading) return;
    let txt;
    if (rd) {
      const u = unitOf(this.st.dial);
      if (this.st.blocked) txt = "- - - -";
      else if (rd.fuse) txt = "no reading (fuse blown)";
      else if (rd.over || rd.open) txt = rd.open ? "nothing" : "1 (over range)";
      else if (early) txt = rd.text + " " + u;
      else {
        const v = parseFloat(rd.text);
        L.min = Math.min(L.min, v); L.max = Math.max(L.max, v);
        const dp = (rd.text.split(".")[1] || "").length;
        txt = L.max - L.min > Math.max(0.15, 30 * Math.pow(10, -dp))
          ? L.min.toFixed(dp) + " to " + L.max.toFixed(dp) + " " + u + ", rising and falling"
          : rd.text + " " + u;
        if (rd.beep) txt += ", beep";
      }
    } else if (pr && early) {
      txt = !pr.live ? "no lights" : pr.hi ? "Hi (red)" : pr.lo ? "Lo (green)" : "no lights";
    } else if (pr) {
      L.hi = L.hi || pr.hi; L.lo = L.lo || pr.lo; L.pulse = L.pulse || pr.pulse;
      txt = !pr.live ? "no lights" : L.hi && L.lo ? "Hi and Lo in turn, pulsing" : L.hi ? "Hi (red)" + (L.pulse ? ", pulse" : "") : L.lo ? "Lo (green)" + (L.pulse ? ", pulse" : "") : "no lights";
    }
    if (txt && txt !== L.row.reading) { L.row.reading = txt; this.renderLogSoon(); }
  };
  Bench.prototype.renderLogSoon = function () {
    if (this.logT) return;
    this.logT = setTimeout(() => { this.logT = null; this.renderLog(); }, 250);
  };

  /* ------------------------------------------------------- the meter's face */
  Bench.prototype.drawMeter = function () {
    const st = this.st;
    this.el.meter.innerHTML = meterSVG({ setting: st.dial, red: st.sock });
    this.segs = this.el.meter.querySelector(".cm-seg");
    this.lastDigits = null;
    this.el.cur.textContent = "Dial: " + sayDial(st.dial);
    this.el.cur.setAttribute("aria-label", "Dial on " + sayDial(st.dial) + ". Open the big dial");
    this.showDigits();
  };
  Bench.prototype.showDigits = function () {
    const st = this.st;
    if (st.tool !== "meter") return;
    let rd = this.b.read(0);
    st.blocked = !!(st.red && st.black && this.isVoltSetting() && this.isLogicOut(st.red) && st.power);
    let text = "";
    if (rd) {
      if (rd.fuse && !st.fuse) st.fuse = true;
      if (st.blocked) text = "----";
      else {
        if (!rd.over && !rd.open && st.dial.indexOf("DCV") === 0 && Math.abs(rd.value) > 0.5 && Math.random() < .35)
          rd = this.b.read(Math.random() < .5 ? -1 : 1);
        text = rd.text;
      }
    }
    if (text !== this.lastDigits && this.segs) { this.segs.innerHTML = digitsSVG(text); this.lastDigits = text; }
    const beep = !!(rd && rd.beep && !st.blocked);
    this.el.beep.hidden = !beep;
    this.tone(beep);
    if (rd) this.liveLog(rd, null);
  };

  /* ------------------------------------------------------- sound (after a first tap: Safari) */
  Bench.prototype.unlockAudio = function () {
    try { const C = window.AudioContext || window.webkitAudioContext; if (C && !this.ac) this.ac = new C(); } catch (e) { this.ac = null; }
  };
  Bench.prototype.tone = function (on) {
    if (!this.ac) return;
    if (on && !this.osc) {
      try {
        const o = this.ac.createOscillator(), g = this.ac.createGain();
        o.frequency.value = 2700; g.gain.value = 0.06; o.connect(g); g.connect(this.ac.destination); o.start();
        this.osc = o; this.gain = g;
      } catch (e) { this.osc = null; }
    } else if (!on && this.osc) { try { this.osc.stop(); } catch (e) { /* already stopped */ } this.osc = null; }
  };

  /* ------------------------------------------------------- the clock */
  Bench.prototype.startClock = function () {
    let last = null, acc = 0;
    const frame = now => {
      this.raf = requestAnimationFrame(frame);
      if (document.hidden) { last = null; return; }
      const dt = last === null ? 0 : Math.min(0.1, (now - last) / 1000);
      last = now;
      if (this.st.power && dt > 0) this.b.run(dt);
      this.frameLEDs(now);
      if (this.st.tool === "probe") this.frameProbe();
      acc += dt;
      if (acc >= 0.33) { acc = 0; this.showDigits(); }
    };
    this.clock = true;
    this.raf = requestAnimationFrame(frame);
  };
  Bench.prototype.frameLEDs = function (now) {
    const leds = this.b.leds(), lines = [];
    for (const [id, L] of Object.entries(leds)) {
      const seen = this.ledSeen[id] = this.ledSeen[id] || { look: null, changes: [] };
      if (seen.look !== null && seen.look !== L.look) seen.changes.push(now);
      seen.look = L.look;
      seen.changes = seen.changes.filter(t => now - t < 2600);
      const flashing = seen.changes.length >= 2 && L.look !== "faint";
      const el = this.svg && this.svg.querySelector('[data-led="' + id + '"]');
      if (el) el.setAttribute("opacity", L.look === "on" ? "1" : L.look === "faint" ? ".3" : "0");
      lines.push(`<span class="tbx-led"><b>${esc(id)} ${esc(L.colour)}:</b> ${flashing ? "flashing" : L.look}</span>`);
    }
    const html = lines.join("") + (this.st.power ? "" : '<span class="tbx-off">Power off</span>');
    if (html !== this.statusHTML) { this.el.status.innerHTML = html; this.statusHTML = html; }
  };
  Bench.prototype.frameProbe = function () {
    const st = this.st, pr = this.b.probeRead() || { live: false };
    const svg = this.el.probe.querySelector("svg");
    if (!svg) return;
    if (st.pmem && pr.pulse) st.memLit = true;
    const pulse = pr.live && (st.pmem ? st.memLit : pr.pulse);
    svg.querySelector(".pr-hi").classList.toggle("on", !!pr.hi);
    svg.querySelector(".pr-lo").classList.toggle("on", !!pr.lo);
    svg.querySelector(".pr-pulse").classList.toggle("on", !!pulse);
    if (st.tip) this.liveLog(null, { live: pr.live, hi: pr.hi, lo: pr.lo, pulse });
  };

  /* ------------------------------------------------------- keeping controls in step */
  Bench.prototype.syncControls = function () {
    const st = this.st, r = this.root;
    const press = (sel, on) => r.querySelectorAll(sel).forEach(b => b.setAttribute("aria-pressed", on(b) ? "true" : "false"));
    press("[data-view]", b => b.getAttribute("data-view") === st.view);
    press("[data-tool]", b => b.getAttribute("data-tool") === st.tool);
    press("[data-power]", b => (b.getAttribute("data-power") === "on") === st.power);
    press("[data-next]", b => b.getAttribute("data-next") === st.next);
    press("[data-pmode]", b => b.getAttribute("data-pmode") === st.pmode);
    press("[data-pmem]", b => (b.getAttribute("data-pmem") === "1") === st.pmem);
    press("[data-act=flip]", () => st.side === "copper");
    const meter = st.tool !== "probe";
    this.el.meter.hidden = !meter;
    this.el.probe.hidden = meter;
    this.el.dialrow.hidden = !meter;
    this.el.leadrow.hidden = st.tool !== "meter";
    this.el.proberow.hidden = meter;
    this.el.leadrow.querySelector("[data-act=swap]").disabled = !(st.red && st.black);
    const svg = this.el.probe.querySelector("svg");
    if (svg) {
      svg.querySelector(".pr-t1").textContent = st.pmode;
      svg.querySelector(".pr-t2").textContent = st.pmem ? "MEM" : "PULSE";
      svg.querySelector(".pr-k1").setAttribute("x", st.pmode === "TTL" ? 234 : 252);
      svg.querySelector(".pr-k2").setAttribute("x", st.pmem ? 302 : 284);
      svg.classList.toggle("is-dead", !st.power);
    }
    this.root.setAttribute("data-tbx-tool", st.tool);
    this.syncTPButtons();
  };
  Bench.prototype.syncTPButtons = function () {
    const st = this.st, on = st.tool === "probe" ? [st.tip] : st.tool === "meter" ? [st.red, st.black] : [];
    this.el.tps.querySelectorAll("[data-pt]").forEach(b => b.setAttribute("aria-pressed", on.indexOf(b.getAttribute("data-pt")) >= 0 ? "true" : "false"));
  };
  Bench.prototype.fillPick = function () {
    const G = this.G, st = this.st;
    let o = `<option value="">${st.tool === "look" ? "Look at a part…" : "Another point…"}</option>`;
    if (st.tool === "look") {
      for (const p of Object.values(G.parts)) o += `<option value='${esc(JSON.stringify({ part: p.id }))}'>${esc(p.comp.name || p.id)}</option>`;
      this.F.layout.links.forEach((l, i) => { o += `<option value='${esc(JSON.stringify({ link: i + 1 }))}'>Link ${i + 1} (${esc(l.colour)})</option>`; });
    } else {
      for (const k of Object.keys(G.pins)) o += `<option value='${esc(JSON.stringify({ pt: k, kind: "pin" }))}'>${esc(this.label(k))}</option>`;
    }
    this.el.pick.innerHTML = o;
  };

  /* ========================================================= the job flow
     Job card → Predict → Test → Diagnose → Confirm and fix (§3.3, §11, §13).
     The words live in test-bench-jobs.js. Predict is not scored (J2); Diagnose
     scores the fault on the first try; evidence comes from the log only (J1);
     Fix it unlocks after the proving test (J6), which is marked as usual (J7). */
  const LEVEL = ["", "①", "②", "③"];
  const STEPS = ["Job card", "Predict", "Test", "Diagnose", "Confirm and fix"];
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  const fbOf = (f, r) => typeof f === "function" ? f(r) : f;

  Bench.prototype.startJobs = function (set, ids, start) {
    this.jobSet = set;
    this.jobList = ids && ids.length ? set.jobs.filter(j => ids.indexOf(j.id) >= 0) : set.jobs;
    this.score = { first: 0, ok: 0, bad: 0, safety: 0, done: 0 };
    this.el.diag.hidden = false;
    this.openJob(Math.min(start || 0, this.jobList.length - 1));
  };
  Bench.prototype.openJob = function (n) {
    const d = this.jobList[n];
    this.jobN = n;
    this.job = null;
    this.finding = false;
    this.load(d.id, null);
    this.job = { def: d, step: 0, q: 0, first: true, faultOk: false, evOk: false, tried: new Set(), sub: null, proved: false, fixed: false, counted: false };
    this.el.pop.hidden = true;
    this.el.diagbox.hidden = true;
    this.jobHead();
    this.jobCard();
  };
  Bench.prototype.jobHead = function () {
    const d = this.job.def, o = this.opts;
    this.el.job.classList.add("is-jobs");
    this.el.job.innerHTML =
      `<div class="tbx-job-t"><span class="tbx-jobno">Job ${this.jobN + 1} of ${this.jobList.length} · Level ${LEVEL[d.level] || ""}</span> ` +
      `<span class="tbx-title">${esc(this.jobSet.title || o.title || "")}</span><span class="tbx-sub">${esc(this.jobSet.sub || o.sub || "")}</span></div>` +
      `<ol class="tbx-steps" aria-label="Steps"></ol>` +
      `<div class="tbx-should"></div><div class="tbx-tech" aria-live="polite"></div>`;
    this.el.tech = this.el.job.querySelector(".tbx-tech");
    this.el.steps = this.el.job.querySelector(".tbx-steps");
    this.el.should = this.el.job.querySelector(".tbx-should");
    this.jobLine(null);
    this.techLine();
  };
  /* the job line under the title: what it should do and the complaint, or the step to do now */
  Bench.prototype.jobLine = function (html) {
    const d = this.job.def;
    this.el.should.innerHTML = html || ((this.opts.should || "") + ` <b>Complaint:</b> “${esc(d.complaint)}”`);
    const now = this.job.step;
    this.el.steps.innerHTML = STEPS.map((s, i) =>
      `<li class="${i < now ? "is-done" : i === now ? "is-now" : ""}"${i === now ? ' aria-current="step"' : ""}>${i < now ? "✓ " : ""}${i + 1} ${s}</li>`).join("");
    this.el.diag.disabled = now < 2 || this.job.evOk;
  };
  Bench.prototype.jobLocked = function () {
    if (this.job.step >= 2) return false;
    if (this.job.step === 1) this.feedback(null, "Predict first", "Answer the two predict questions first. Then you can test.");
    return true;
  };

  /* -- step 1: the job card */
  Bench.prototype.jobCard = function () {
    const d = this.job.def, set = this.jobSet;
    this.showPop(`<div class="tbx-card is-modal" role="dialog" aria-modal="true" aria-labelledby="${this.id}-jc">
      <div class="tbx-card-k">Step 1 · Job card</div>
      <h2 id="${this.id}-jc">${esc(set.title)}</h2>
      <p><b>What it should do:</b> ${esc(set.should)}</p>
      <p><b>The complaint:</b> “${esc(d.complaint)}”</p>
      <p><b>Your job:</b> predict, test, find the fault and give your evidence. Then prove it and fix it.</p>
      <p class="tbx-card-s">Before you switch on: look at the board, and check for shorts with the power off.</p>
      <button type="button" class="tbx-go" data-job="predict">Start: predict</button></div>`, true);
  };
  Bench.prototype.showPop = function (html, modal) {
    const p = this.el.pop;
    p.innerHTML = html;
    p.hidden = false;
    p.classList.toggle("is-modal", !!modal);
    const b = p.querySelector("button");
    if (b) b.focus({ preventScroll: true });
  };

  /* -- step 2: predict, two questions (R6), retry until right (J2) */
  Bench.prototype.jobPredict = function () {
    const j = this.job;
    j.step = 1; j.q = 0;
    this.el.pop.hidden = true;
    this.st.view = "circuit";
    this.drawBoard(); this.syncControls();
    this.el.under.hidden = true;
    this.el.jobpanel.hidden = false;
    this.jobLine(null);
    this.feedback(null, "Step 2 · Predict", "Use the circuit diagram. Answer both questions, then test.");
    this.jobQuestion();
  };
  Bench.prototype.jobQuestion = function () {
    const j = this.job, Q = j.def.predict[j.q];
    j.order = shuffle(Q.opts.map((_, i) => i));
    this.el.jobpanel.innerHTML =
      `<div class="tbx-q"><span class="tbx-qn">Question ${j.q + 1} of ${j.def.predict.length}.</span> ${Q.q}</div>
       <div class="tbx-opts" role="group" aria-label="Options">${j.order.map(i => `<button type="button" data-job="opt:${i}">${esc(Q.opts[i].t)}</button>`).join("")}</div>
       <div class="tbx-qfb" aria-live="polite"></div>`;
  };
  Bench.prototype.jobOption = function (i, btn) {
    const j = this.job, Q = j.def.predict[j.q], o = Q.opts[i], fb = this.el.jobpanel.querySelector(".tbx-qfb");
    btn.classList.add(o.key ? "is-right" : "is-wrong");
    fb.className = "tbx-qfb " + (o.key ? "is-ok" : "is-bad");
    if (!o.key) { btn.disabled = true; fb.innerHTML = o.fb; return; }
    this.el.jobpanel.querySelectorAll("[data-job^=opt]").forEach(b => { b.disabled = true; });
    const last = j.q === j.def.predict.length - 1;
    fb.innerHTML = o.fb + ` <button type="button" class="tbx-go" data-job="next">${last ? "Start testing" : "Next question"}</button>`;
    fb.querySelector("button").focus({ preventScroll: true });
  };

  /* -- step 3: test */
  Bench.prototype.jobTest = function () {
    const j = this.job;
    j.step = 2;
    this.el.jobpanel.hidden = true;
    this.el.under.hidden = false;
    this.st.view = "board";
    this.drawBoard(); this.syncControls();
    this.jobLine(null);
    this.feedback(null, "Step 3 · Test", "Take the readings you need. When you know the fault, tap <b>Diagnose</b>.");
  };

  /* -- step 4: diagnose, the fault (R4, R8) and the evidence (R5, J1) */
  Bench.prototype.reading = function (src) {
    const st = this.st, G = this.G;
    if (src.complaint) return "";
    if (src.look) return st.looked.has(src.look) ? "" : null;
    const type = src.dcv ? "dcv" : "probe", k = src.dcv || src.probe, seg = G.segAt(this.holeOf(k));
    for (let i = st.log.length - 1; i >= 0; i--) {
      const r = st.log[i], e = r.ev;
      if (e && e.type === type && !this.F.dry.has(e.key) && G.segAt(this.holeOf(e.key)) === seg && r.reading) return r.reading;
    }
    return null;
  };
  Bench.prototype.jobDiagnose = function () {
    const j = this.job, d = j.def;
    j.step = 3;
    j.fOrder = shuffle(d.faults.map((_, i) => i));
    j.eOrder = shuffle(d.evidence.items.map((_, i) => i));
    this.diagFrom = document.activeElement;
    this.jobLine(null);
    const r = src => this.reading(src);
    const evText = it => {
      const v = r(it.src);
      if (it.t.indexOf("{v}") >= 0) return esc(it.t.replace("{v}", v || "not taken yet"));
      return esc(it.t) + (v === null ? " <i>(not taken yet)</i>" : "");
    };
    this.el.diagbox.innerHTML = `<div class="tbx-dg-in">
      <div class="tbx-dg-h"><span class="tbx-card-k">Step 4 · Diagnose</span><button type="button" data-job="close">Close</button></div>
      <div class="tbx-dg-cols">
        <section class="tbx-dg-f"><h3>1. <b>Choose</b> the fault. Pick one.</h3>
          <div class="tbx-dg-opts">${j.fOrder.map(i => `<button type="button" data-job="fault:${i}"${j.tried.has(i) ? " disabled" : ""}>${j.tried.has(i) ? "✗ " : ""}${esc(d.faults[i].t)}</button>`).join("")}</div>
          <div class="tbx-dg-ffb" aria-live="polite"></div></section>
        <section class="tbx-dg-e"><h3>2. <b>Tick</b> the readings that are your evidence. <span class="tbx-need">Tick the ${d.evidence.need} that apply.</span></h3>
          <div class="tbx-dg-evs">${j.eOrder.map(i => `<label class="tbx-ev"><input type="checkbox" data-ev="${i}"><span class="tbx-ev-t">${evText(d.evidence.items[i])}</span><span class="tbx-ev-fb"></span></label>`).join("")}</div></section>
      </div>
      <div class="tbx-dg-foot" aria-live="polite"><div class="tbx-dg-sum"></div>
        <button type="button" data-job="check">Check my evidence</button>
        <button type="button" class="tbx-go" data-job="confirm" disabled>Next: confirm and fix</button></div></div>`;
    this.el.diagbox.hidden = false;
    this.diagState();
    const f = this.el.diagbox.querySelector(j.faultOk ? "input" : "[data-job^=fault]:not([disabled])");
    if (f) f.focus({ preventScroll: true });
  };
  Bench.prototype.diagState = function () {
    const j = this.job, box = this.el.diagbox;
    box.querySelector(".tbx-dg-e").classList.toggle("is-off", !j.faultOk);
    box.querySelectorAll("input[data-ev]").forEach(x => { x.disabled = !j.faultOk; });
    box.querySelector("[data-job=check]").disabled = !j.faultOk;
    if (!j.faultOk) box.querySelector(".tbx-dg-sum").textContent = "Choose the fault first. Then tick your evidence.";
  };
  Bench.prototype.jobFault = function (i) {
    const j = this.job, f = j.def.faults[i], box = this.el.diagbox, fb = box.querySelector(".tbx-dg-ffb");
    if (j.faultOk) return;
    const btn = box.querySelector(`[data-job="fault:${i}"]`);
    fb.innerHTML = fbOf(f.fb, src => this.reading(src));
    fb.className = "tbx-dg-ffb " + (f.key ? "is-ok" : "is-bad");
    if (f.key) {
      j.faultOk = true;
      btn.classList.add("is-right");
      box.querySelectorAll("[data-job^=fault]").forEach(b => { b.disabled = true; });
      this.diagState();
      box.querySelector(".tbx-dg-sum").textContent = "Now tick your evidence, then check it.";
      return;
    }
    j.first = false;
    j.tried.add(i);
    btn.disabled = true;
    btn.classList.add("is-wrong");
    box.querySelector(".tbx-dg-sum").innerHTML = `<b>Go back and test more.</b> <button type="button" class="tbx-go" data-job="close">Back to Test</button>`;
  };
  Bench.prototype.jobCheck = function () {
    const j = this.job, E = j.def.evidence, box = this.el.diagbox;
    let k = 0, w = 0, nt = 0;
    box.querySelectorAll("label.tbx-ev").forEach(lab => {
      const x = lab.querySelector("input"), it = E.items[+x.getAttribute("data-ev")];
      const taken = this.reading(it.src) !== null, on = x.checked;
      let ok, text;
      if (on && !taken) { ok = false; nt++; text = "✗ This is not in your log yet. Take the reading, then tick it."; }
      else if (on) { ok = !!it.key; text = it.yes; if (it.key) k++; else w++; }
      else { ok = !it.key; text = it.key && !taken ? "Not in your log yet. " + it.no : it.no; }
      lab.classList.toggle("is-ok", ok); lab.classList.toggle("is-bad", !ok);
      lab.querySelector(".tbx-ev-fb").textContent = text;
    });
    const sum = box.querySelector(".tbx-dg-sum");
    if (k === E.need && !w && !nt) {
      j.evOk = true;
      sum.innerHTML = "<b>Right fault, good evidence.</b>";
      box.querySelectorAll("input[data-ev]").forEach(x => { x.disabled = true; });
      box.querySelector("[data-job=check]").disabled = true;
      const go = box.querySelector("[data-job=confirm]");
      go.disabled = false; go.focus({ preventScroll: true });
    } else {
      sum.innerHTML = "<b>Right fault. Check your evidence:</b> " + k + " of the " + E.need + " key readings" +
        (w ? ", and " + w + (w === 1 ? " that does" : " that do") + " not point to the fault" : "") +
        (nt ? ", and " + nt + " not in your log yet" : "") + ". Change your ticks and check again.";
    }
  };
  Bench.prototype.closeDiag = function () {
    this.el.diagbox.hidden = true;
    if (this.job.step === 3) this.job.step = 2;
    this.jobLine(null);
    if (this.diagFrom && this.diagFrom.focus && this.root.contains(this.diagFrom)) this.diagFrom.focus({ preventScroll: true });
  };

  /* -- step 5: confirm and fix (R7, J5–J7) */
  Bench.prototype.jobConfirm = function () {
    const j = this.job, c = j.def.confirm;
    this.el.diagbox.hidden = true;
    j.step = 4; j.sub = "find";
    this.finding = true;
    this.jobLine(c.find.prompt);
    this.feedback(null, "Step 5 · Confirm and fix", c.find.prompt);
  };
  Bench.prototype.jobFind = function (t) {
    const j = this.job, f = j.def.confirm.find, F = this.F;
    let hit = false;
    if (f.link) {
      const same = l => l && f.link.indexOf(l.a) >= 0 && f.link.indexOf(l.b) >= 0;
      if (t.link) hit = same(F.layout.links[t.link - 1]);
      else if (t.pt && this.st.side === "copper") hit = f.link.indexOf(this.holeOf(t.pt)) >= 0;
    }
    if (f.hole && t.pt) hit = this.holeOf(t.pt) === f.hole;
    if (!hit) {
      const close = f.close && t.part === f.close.part;
      this.feedback("bad", "Find it", esc(close ? f.close.text : f.other));
      return;
    }
    this.finding = false;
    j.sub = "prove";
    const p = j.def.confirm.prove;
    this.jobLine(p.prompt);
    this.feedback("ok", "✓ Found it", esc(f.right.replace(/^Found it\. /, "")) + `<p class="tbx-block">${p.prompt}</p>`);
  };
  Bench.prototype.jobRow = function (row, kind) {
    const j = this.job;
    if (!j || j.sub !== "prove" || j.proved) return;
    const e = row.ev, p = j.def.confirm.prove;
    if (!e || e.type !== "ohm" || kind !== "ok") return;
    const G = this.G, seg = k => G.segAt(this.holeOf(k));
    const fits = (s, k, other) => s.key ? k === s.key
      : s.seg ? seg(k) === seg(s.seg) && !this.F.dry.has(k)
      : s.net ? this.netOf(k) === this.netOf(s.net) && seg(k) !== seg(other) : false;
    const ok = (fits(p.a, e.a, e.b) && fits(p.b, e.b, e.a)) || (fits(p.a, e.b, e.a) && fits(p.b, e.a, e.b));
    if (!ok) { this.el.fb.insertAdjacentHTML("beforeend", `<p class="tbx-block">${esc(p.where)}</p>`); return; }
    const beep = isFinite(e.value) && e.value < TB.meter.BEEP_BELOW;
    if ((p.expect === "beep") !== beep) return;
    j.proved = true;
    j.sub = "fix";
    this.jobLine(`<b>Fix it:</b> the proof is done. <button type="button" class="tbx-go" data-job="fix">Fix it</button>`);
    this.el.fb.insertAdjacentHTML("beforeend", `<p class="tbx-block"><b>${esc(p.right)}</b></p>`);
  };
  Bench.prototype.swapBoard = function (fault) {
    const st = this.st;
    st.live = null;                       // the last row belongs to the board it was taken on
    this.b = TB.bench(this.sc.id, { fault, seed: this.seed });
    this.F = this.b.fault;
    this.geometry();
    this.b.power(st.power);
    if (st.tool === "probe") this.b.probe({ tip: st.tip, mode: st.pmode }); else this.meterSet();
    this.ledSeen = {};
    this.drawBoard(); this.fillPick(); this.drawMeter();
  };
  Bench.prototype.jobFix = function () {
    const j = this.job, c = j.def.confirm, sc = this.sc, seed = this.seed;
    this.swapBoard("good");
    j.fixed = true; j.sub = "done"; j.step = 5;
    const v = k => {
      const b = TB.bench(sc.id, { fault: "good", seed });
      b.power(true); b.run(0.5);
      b.meter("DCV 20", { red: k, black: sc.ground, socket: "V" });
      return b.read(0).text + " V";
    };
    const text = c.fixed(v);
    this.jobLine(esc(text));
    this.feedback("ok", "✓ Fixed", esc(text.replace(/^✓ Fixed\. /, "")));
    const st = this.st, last = this.jobN === this.jobList.length - 1;
    this.showPop(`<div class="tbx-card is-done" role="status">
      <h2>Job ${this.jobN + 1} done</h2>
      <p>Confirm: ✓ ${esc(c.found)}.</p>
      <p>Diagnosis: ${j.first ? "✓ first try" : "✗ not first try"}.</p>
      <p>Technique: ${st.ok} ✓, ${st.bad} ✗.${st.safety ? " Safety errors: " + st.safety + "." : ""}</p>
      <button type="button" class="tbx-go" data-job="${last ? "finish" : "nextjob"}">${last ? "Finish" : "Next job"}</button></div>`, false);
  };
  Bench.prototype.jobCount = function () {
    const j = this.job, st = this.st, s = this.score;
    if (j.counted) return;
    j.counted = true;
    s.done++; s.ok += st.ok; s.bad += st.bad; s.safety += st.safety;
    if (j.first) s.first++;
  };
  Bench.prototype.jobFinish = function () {
    this.jobCount();
    const s = this.score;
    this.showPop(`<div class="tbx-card is-modal" role="dialog" aria-modal="true" aria-labelledby="${this.id}-sd">
      <h2 id="${this.id}-sd">Set done</h2>
      <p>Faults found first try: ${s.first} of ${s.done}.</p>
      <p>Technique: ${s.ok} ✓, ${s.bad} ✗.</p>
      <p>Safety errors: ${s.safety}.</p>
      <button type="button" class="tbx-go" data-job="again">Start again</button></div>`, true);
  };
  Bench.prototype.jobAct = function (a, btn) {
    const j = this.job;
    if (!j) return;
    if (a.indexOf("opt:") === 0) return this.jobOption(+a.slice(4), btn);
    if (a.indexOf("fault:") === 0) return this.jobFault(+a.slice(6));
    switch (a) {
      case "predict": return this.jobPredict();
      case "next": if (j.q < j.def.predict.length - 1) { j.q++; this.jobQuestion(); } else this.jobTest(); return;
      case "diagnose": if (j.step >= 2 && !j.evOk) this.jobDiagnose(); return;
      case "close": return this.closeDiag();
      case "check": return this.jobCheck();
      case "confirm": return this.jobConfirm();
      case "fix": if (j.proved && !j.fixed) this.jobFix(); return;
      case "nextjob": this.jobCount(); this.openJob(this.jobN + 1); return;
      case "finish": return this.jobFinish();
      case "again": return this.startJobs(this.jobSet, this.jobList.map(x => x.id), 0);
    }
  };

  /* ------------------------------------------------------- boot */
  window.TestBench = { mount: (root, opts) => new Bench(root, opts), meterSVG, Bench };
  function boot() {
    if (!document.getElementById("sbd-style")) {
      const st = document.createElement("style"); st.id = "sbd-style"; st.textContent = R.STYLE; document.head.appendChild(st);
    }
    document.querySelectorAll("[data-test-bench]").forEach(el => {
      if (el.tbx) return;
      const q = new URLSearchParams(location.search);
      try {
        el.tbx = new Bench(el, {
          scenario: el.getAttribute("data-test-bench"), fault: q.get("board") || el.getAttribute("data-fault") || "good",
          seed: q.get("seed"), title: el.getAttribute("data-title"), sub: el.getAttribute("data-sub"),
          should: el.getAttribute("data-should")
        });
        const jobs = el.getAttribute("data-jobs"), set = window.TBJobs && window.TBJobs[el.getAttribute("data-test-bench")];
        if (jobs && set && !q.get("board")) el.tbx.startJobs(set, jobs.split(/[\s,]+/), (parseInt(q.get("job"), 10) || 1) - 1);
      } catch (e) {
        el.textContent = "The test bench could not start: " + e.message;
        if (window.console) console.error(e);
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
