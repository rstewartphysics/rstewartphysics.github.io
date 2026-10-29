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
  const PIN_WORD = { npn: { c: "collector", b: "base", e: "emitter" }, spdt: { c: "middle pin", "1": "pin 1", "2": "pin 2" } };
  const LED_GLOW = { red: "rgba(255,40,40,.78)", green: "rgba(40,230,90,.72)", yellow: "rgba(255,210,0,.75)" };

  /* ========================================================= the bench */
  function Bench(root, opts) {
    this.root = root;
    this.id = "tbx" + (++UID);
    this.useScenario(opts.scenario, opts);
    try { this.sound = localStorage.getItem("tbx-sound-v1") !== "off"; } catch (e) { this.sound = true; }
    this.build();
    this.bind();
    this.load(opts.fault || "good", opts.seed);
  }
  Bench.prototype.useScenario = function (id, opts) {
    this.sc = TB.SCENARIOS[id];
    if (!this.sc) throw new Error("test bench: no scenario " + id);
    /* the scenario's own words, unless the page gives them (Phase 3.2) */
    const bb = this.sc.bench || {};
    opts = opts || {};
    this.opts = Object.assign({}, opts, { scenario: id, title: opts.title || bb.title, sub: opts.sub || bb.sub, should: opts.should || bb.should });
  };
  /* A job on another board (3.3): the bench is built again for it. */
  Bench.prototype.switchScenario = function (id) {
    this.useScenario(id);
    this.build();
  };

  Bench.prototype.build = function () {
    const id = this.id, o = this.opts, ins = this.sc.inputs || {}, words = (this.sc.bench || {}).inputs || {};
    const inGroups = Object.keys(ins).map(k => {
      const w = words[k] || {}, nm = w.name || k;
      return `<span class="tbx-in"><span class="tbx-lbl" aria-hidden="true">${esc(k)}</span><span class="tbx-seg" role="group" aria-label="${esc(nm)}">` +
        Object.keys(ins[k].states).map(s => `<button type="button" data-input="${esc(k)}" data-state="${esc(s)}" aria-pressed="false">${esc((w.words || {})[s] || s)}</button>`).join("") + `</span></span>`;
    }).join("");
    this.root.classList.add("tbx");
    this.root.innerHTML =
      `<div class="tbx-job">
         <div class="tbx-job-t"><span class="tbx-title">${esc(o.title || "")}</span><span class="tbx-sub">${esc(o.sub || "")}</span>
           <div class="tbx-should">${o.should || ""}</div></div>
         <div class="tbx-tech" aria-live="polite"></div>
       </div>
       <div class="tbx-main">
         <div class="tbx-left${inGroups ? "" : " no-ins"}">
           <div class="tbx-bar" role="toolbar" aria-label="Board controls">
             <button type="button" data-act="flip" aria-pressed="false">Flip board</button>
             <span class="tbx-seg" role="group" aria-label="View"><button type="button" data-view="board" aria-pressed="true">Board</button><button type="button" data-view="circuit" aria-pressed="false">Circuit</button></span>
             <span class="tbx-tps" role="group" aria-label="Test points"></span>
             <label class="tbx-pick"><span class="visually-hidden">Another point</span><select data-act="pick"></select></label>
             <button type="button" class="tbx-diag" data-job="diagnose" hidden>Diagnose</button>
           </div>
           <div class="tbx-ctl" role="toolbar" aria-label="Switches"${inGroups ? "" : " hidden"}>${inGroups}</div>
           <div class="tbx-board" id="${id}-board"></div>
           <div class="tbx-under">
             <div class="tbx-status" aria-live="polite"></div>
             <div class="tbx-log"><div class="tbx-log-h"><b>Readings log</b><span class="tbx-log-btns"><button type="button" data-act="sound" aria-pressed="true">Sound</button><button type="button" data-act="clearlog">Clear</button></span></div>
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
           <div class="tbx-row"><span class="tbx-seg" role="group" aria-label="Tool"><button type="button" data-tool="meter" aria-pressed="true">Meter</button><button type="button" data-tool="probe" aria-pressed="false">Probe</button><button type="button" data-tool="look" aria-pressed="false">Look</button><button type="button" data-tool="lift" aria-pressed="false">Lift</button></span>
             <button type="button" class="tbx-pw" data-power="toggle" aria-pressed="false"><svg class="tbx-pw-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v8M7.1 6.4a7.5 7.5 0 1 0 9.8 0"/></svg>Power <span class="tbx-pw-s" aria-hidden="true">off</span></button></div>
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
      fb: q(".tbx-fb"), pw: q(".tbx-pw"), dial: q(".tbx-dial"), dialArt: q(".tbx-dial-art"), dialNow: q(".tbx-dial-now"), dialFb: q(".tbx-dial-fb"), say: q(".tbx-say"),
      job: q(".tbx-job"), under: q(".tbx-under"), jobpanel: q(".tbx-jobpanel"), pop: q(".tbx-pop"), diag: q(".tbx-diag"), diagbox: q(".tbx-diagbox")
    };
    this.el.tps.innerHTML = this.sc.layout.testpoints.map(t => `<button type="button" data-pt="${t.id}" aria-pressed="false">${t.id}</button>`).join("");
    this.el.probe.innerHTML = probeSVG();
    this.el.pick.addEventListener("change", () => {
      const v = this.el.pick.value;
      this.el.pick.value = "";
      if (v) this.act(JSON.parse(v));
    });
  };
  Bench.prototype.bind = function () {
    this.root.addEventListener("click", e => this.onClick(e));
    this.root.addEventListener("keydown", e => {
      const t = e.target;
      if ((e.key === "Enter" || e.key === " ") && t instanceof SVGElement && t.getAttribute("role") === "button") { e.preventDefault(); this.onClick({ target: t }); }
      if (e.key === "Escape" && !this.el.dial.hidden) this.closeDial();
      else if (e.key === "Escape" && !this.el.diagbox.hidden) this.jobAct("close");
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
      ok: 0, bad: 0, safety: 0, seen: new Set(), log: [], live: null, last: null,
      inputs: {}, lifted: []
    };
    for (const [k, inp] of Object.entries(sc.inputs || {})) this.st.inputs[k] = inp.start;
    this.ledSeen = {}; this.loadSeen = {};
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

  /* Lifting a leg or a link end makes the board again (the solver takes lifted
     ends when a bench is made), with the same parts, switches and power. */
  Bench.prototype.remake = function () {
    const st = this.st;
    this.b = TB.bench(this.sc.id, { fault: this.fault, seed: this.seed, lift: st.lifted.slice() });
    this.F = this.b.fault;
    for (const [k, v] of Object.entries(st.inputs)) this.b.set(k, v);
    this.b.power(st.power);
    if (st.tool === "probe") this.b.probe({ tip: st.tip, mode: st.pmode }); else this.meterSet();
    this.geometry();
    this.drawBoard();
    this.fillPick();
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
    const lifted = new Set(this.st ? this.st.lifted : []);
    for (const l of L.links) {
      if (lifted.has("link@" + l.a) || lifted.has("link@" + l.b)) continue;
      const a = segAt(l.a), b = segAt(l.b); if (a && b) dsu.join(a, b);
    }
    /* the crop: every hole in use, plus room for the leads to come in from the right */
    let maxc = 0, maxr = 0;
    const use = ref => { const h = S.parseRef(ref); maxc = Math.max(maxc, h.c); maxr = Math.max(maxr, h.r); };
    Object.values(pins).forEach(q => use(q.hole)); L.links.forEach(l => { use(l.a); use(l.b); }); L.testpoints.forEach(t => use(t.at));
    /* cut between rows, never through one; the whole board when the pump hangs below it */
    const far = R.centreOf(maxr, maxc, L.board), edge = R.centreOf(board.rows - 1, 1, L.board).y + .75 * P;
    const pump = Object.keys(sc.parts).find(k => sc.parts[k].model === "pump" && parts[k]);
    const cut = Math.min(far.y + 1.5 * P, edge);
    this.vb = { x: 0, y: 0, w: Math.ceil(far.x + 1.6 * P), h: Math.ceil(pump ? cut + 3.2 * P : cut) };
    this.G = { board, cen, parts, pins, tps, covered, segAt, net: ref => { const s = segAt(ref); return s ? dsu.find(s) : null; }, maxc, maxr, edge: cut, pump };
  };

  /* A point is "T1", "IC1.4", "R2.1" or a hole "G19". */
  Bench.prototype.holeOf = function (k) {
    const G = this.G;
    return G.tps[k] ? G.tps[k].hole : G.pins[k] ? G.pins[k].hole : isLinkEnd(k) ? k.slice(5) : k;
  };
  const isLinkEnd = k => typeof k === "string" && k.indexOf("link@") === 0;
  /* A link end ("link@D20") is on the wire, so it is on the net of the link's
     other end. A lifted leg is on nothing but its own part. */
  Bench.prototype.netOf = function (k) {
    if (!k) return null;
    if (isLinkEnd(k)) {
      const ref = k.slice(5), l = this.F.layout.links.find(x => x.a === ref || x.b === ref);
      return l ? this.G.net(l.a === ref ? l.b : l.a) : null;
    }
    if (this.st.lifted.indexOf(k) >= 0) return "lift:" + k;
    return this.G.net(this.holeOf(k));
  };
  /* the strip a point sits on, for the probe-only and not-logic rules */
  Bench.prototype.stripOf = function (k) {
    if (!k || isLinkEnd(k) || this.st.lifted.indexOf(k) >= 0) return null;
    return this.G.segAt(this.holeOf(k));
  };
  Bench.prototype.posOf = function (k) {
    const c = this.st.lifted.indexOf(k) >= 0 && this.st.side === "comp" ? this.liftPos(k) : this.G.cen(this.holeOf(k));
    return this.st.side === "copper" ? { x: this.mirror(c.x), y: c.y } : c;
  };
  /* where a lifted end is drawn: out of its hole, up and to the right */
  Bench.prototype.liftPos = function (k) {
    const c = this.G.cen(this.holeOf(k));
    return { x: c.x + .8 * P, y: c.y - .45 * P };
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
    const G = this.G, up = this.st.lifted.indexOf(k) >= 0 ? " (lifted)" : "";
    if (G.tps[k]) return k;
    if (isLinkEnd(k)) {
      const ref = k.slice(5), i = this.F.layout.links.findIndex(x => x.a === ref || x.b === ref);
      return "Link " + (i + 1) + " end at " + ref + up;
    }
    const pin = G.pins[k];
    if (pin) {
      const pid = k.slice(0, k.lastIndexOf(".")), part = G.parts[pid];
      if (part.kind === "terminal") return (part.comp.name || pid).replace(/ supply$/, "") + " terminal";
      if (part.kind === "dil") return pid + " pin " + pin.pin;
      if (part.pins.length !== 2) return pid + " " + ((PIN_WORD[part.model] || {})[pin.pin] || "pin " + pin.pin) + up;
      return pid + ", " + this.legWord(part, pin) + up;
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
        `</defs>` +
        `<g id="${id}-art">${art}<g class="tbx-dyn">${st.side === "copper" ? "" : this.dynArt()}</g></g><g class="tbx-glows"></g><g class="tbx-leads"></g><g class="tbx-loupe" hidden></g></svg>`;
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
    /* the engine draws the whole picture: B3 shading, the colour bands (three
       digits and the gold tolerance), the printed values and the slide
       switches' slots.  The knob itself is drawn in dynArt, so it can move. */
    const print = {}, knobs = {};
    for (const [pid, txt] of Object.entries(F.printed || {})) if (!chips.includes(pid)) print[pid] = txt;
    for (const part of Object.values(G.parts)) if (part.model === "spdt") knobs[part.id] = "none";
    const svg = R.renderBoard({ board: L.board, question, attempt, art: { shade: true, bands: F.bands || {}, print, knobs } });
    return svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<title>[\s\S]*?<\/title>/, "");
  };

  /* The copper side: the board turned over left to right, so column 1 is on
     the right. Strips, cuts, holes and joints are drawn mirrored; the words
     (row letters, column numbers, part names) are written the right way round. */
  Bench.prototype.copperArt = function () {
    const F = this.F, L = F.layout, G = this.G, vb = this.vb, id = this.id;
    const rows = G.board.rows, cols = Math.min(G.board.cols, G.maxc + 1);
    const mx = x => this.mirror(x);
    const joints = new Map();
    Object.values(G.pins).forEach(q => joints.set(q.hole, q.key));
    L.links.forEach(l => { joints.set(l.a, "link@" + l.a); joints.set(l.b, "link@" + l.b); });
    L.testpoints.forEach(t => joints.set(t.at, t.id));
    const shadows = [];
    for (const part of Object.values(G.parts)) {
      if (part.kind === "dil") shadows.push({ dil: part.pins });
      else if (part.pins.length === 2) shadows.push({ line: part.pins, w: P * .55 });
    }
    for (const l of L.links) shadows.push({ line: [G.cen(l.a), G.cen(l.b)], w: P * .16 });
    let s = R.copperSide({
      rows, cols, vb, cen: G.cen, ref: (r, c) => S.ref({ r, c }), cuts: L.cuts, bridges: F.bridges || [], shadows,
      joints: [...joints].map(([ref, what]) => ({ ref, what,
        state: this.st.lifted.indexOf(what) >= 0 ? "lifted" : F.dry.has(what) ? "dry" : "ok" }))
    });
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
    /* above the column numbers, clear of row I and the leads (§16 3.2d) */
    w += `<text class="tbx-ctitle" x="${n1(vb.x + 8)}" y="${n1(Math.max(14, G.cen("A1").y - 1.25 * P))}">Copper side: turned over, left to right</text>`;
    return s + w;
  };

  Bench.prototype.circuitSVG = function () {
    const d = this.sc.diagram;
    return `<svg class="tbx-svg tbx-circ" viewBox="-8 -8 ${d.w + 16} ${d.h + 16}" role="img" aria-label="Circuit diagram of the board, with test points ${this.sc.layout.testpoints.map(t => t.id).join(", ")}. Tap a test point.">` +
      d.svg + `<g class="tbx-leads"></g></svg>`;
  };

  /* What changes on the component side as the pupil works: each slide
     switch's knob, the lamp or black cap on the LDR, lifted ends, the pump. */
  Bench.prototype.dynArt = function () {
    const G = this.G, st = this.st, ins = this.sc.inputs || {};
    let s = "";
    for (const [k, inp] of Object.entries(ins)) {
      const part = G.parts[k];
      if (!part) continue;
      if (part.model === "spdt") {
        const pc = part.pins.find(q => q.pin === "c"), pe = part.pins.find(q => q.pin === inp.states[st.inputs[k]]);
        const horiz = Math.abs(part.pins[0].x - part.pins[2].x) > Math.abs(part.pins[0].y - part.pins[2].y);
        const kx = pc.x + (pe.x - pc.x) * .5, ky = pc.y + (pe.y - pc.y) * .5;
        const sw = horiz ? P * 2.1 : P * .5, sh = horiz ? P * .5 : P * 2.1, nw = horiz ? P * .95 : P * .8, nh = horiz ? P * .8 : P * .95;
        s += `<g class="tbx-sw" data-sw="${esc(k)}">` +
          `<rect class="tbx-slot" x="${n1(pc.x - sw / 2)}" y="${n1(pc.y - sh / 2)}" width="${n1(sw)}" height="${n1(sh)}" rx="2"/>` +
          `<rect class="tbx-knob" x="${n1(kx - nw / 2)}" y="${n1(ky - nh / 2)}" width="${n1(nw)}" height="${n1(nh)}" rx="2.5"/></g>`;
      } else if (part.model === "ldr") {
        const [a, b] = part.pins, x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
        s += st.inputs[k] === "covered"
          ? `<g class="tbx-cap"><circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(P * .95)}"/><circle class="tbx-cap-hi" cx="${n1(x - P * .3)}" cy="${n1(y - P * .3)}" r="${n1(P * .22)}"/></g>`
          : `<circle class="tbx-lamp" cx="${n1(x)}" cy="${n1(y)}" r="${n1(P * 1.5)}"/>`;
      }
    }
    for (const k of st.lifted) {
      const h = G.cen(this.holeOf(k)), e = this.liftPos(k);
      s += `<circle class="tbx-gap" cx="${n1(h.x)}" cy="${n1(h.y)}" r="${n1(P * .34)}"/>` +
        `<path class="tbx-liftleg${isLinkEnd(k) ? " is-link" : ""}" d="M${n1(h.x)} ${n1(h.y)} Q ${n1(h.x)} ${n1(e.y)} ${n1(e.x)} ${n1(e.y)}"/>` +
        `<circle class="tbx-liftend" cx="${n1(e.x)}" cy="${n1(e.y)}" r="${n1(P * .2)}"/>`;
    }
    if (G.pump) s += this.pumpArt();
    return s;
  };
  /* The pump, off the board on flying leads from its 2-way block (K2). */
  Bench.prototype.pumpArt = function () {
    const G = this.G, part = G.parts[G.pump], p1 = part.pins.find(q => q.pin === "1"), p2 = part.pins.find(q => q.pin === "2");
    const cx = (p1.x + p2.x) / 2 + P * 1.6, cy = G.edge + 1.75 * P, w = P * 3.4, h = P * 1.5, vb = this.vb;
    return `<rect class="tbx-below" x="${vb.x}" y="${n1(G.edge)}" width="${vb.w}" height="${n1(vb.h - G.edge + 2)}"/>` +
      `<g class="tbx-pump" data-pump="${esc(G.pump)}">` +
      R.flyingLeads([{ from: p1, to: { x: cx - P * .6, y: cy - h / 2 }, colour: "#2b2b2b", sag: P * .5 }, { from: p2, to: { x: cx + P * .6, y: cy - h / 2 }, colour: "#c0392b", sag: P * .5 }]) +
      `<rect class="tbx-pump-b" x="${n1(cx - w / 2)}" y="${n1(cy - h / 2)}" width="${n1(w)}" height="${n1(h)}" rx="${n1(P * .5)}"/>` +
      `<rect class="tbx-pump-b" x="${n1(cx + w / 2 - 1)}" y="${n1(cy - P * .2)}" width="${n1(P * .9)}" height="${n1(P * .4)}" rx="2"/>` +
      `<text class="tbx-pump-t" x="${n1(cx)}" y="${n1(cy + 7)}" text-anchor="middle">PUMP</text>` +
      [0, 1, 2].map(i => `<circle class="tbx-drop d${i}" cx="${n1(cx + w / 2 + P * .95)}" cy="${n1(cy + P * (.5 + .55 * i))}" r="${n1(P * .17)}"/>`).join("") +
      `<text class="tbx-pump-cap" x="${n1(cx + w / 2 + P * 1.6)}" y="${n1(cy + 7)}">off the board</text></g>`;
  };
  Bench.prototype.drawDyn = function () {
    const g = this.svg && this.svg.querySelector(".tbx-dyn");
    if (g && this.st.side === "comp") g.innerHTML = this.dynArt();
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
    const clip = (p, cls) => `<g transform="translate(${n1(p.x)} ${n1(p.y)}) rotate(40)"><rect class="tbx-clip ${cls}" x="-3" y="-5" width="30" height="12" rx="3"/><path class="tbx-jaw" d="M-6 -3 l9 -4 M-6 5 l9 4"/></g>`;
    const ring = (k, cls) => { const p = this.posOf(k); return `<circle class="tbx-ring ${cls}" cx="${n1(p.x)}" cy="${n1(p.y)}" r="${n1(P * .62)}"/>`; };
    let s = "";
    if (st.tool === "meter") {
      /* Show me: a lead on its way to a point (flyTo) */
      const fl = this.flyLead, flying = lead => !!fl && fl.lead === lead;
      if (st.black || flying("black")) {
        const p = flying("black") ? fl.p : this.posOf(st.black), clipped = !flying("black") && st.black === this.sc.ground && this.isVoltSetting();
        s += (flying("black") ? "" : ring(st.black, "is-black")) + cable(p, vb.h * .66, "is-black") + (clipped ? clip(p, "is-black") : needle(p));
      }
      if (st.red || flying("red")) {
        const p = flying("red") ? fl.p : this.posOf(st.red);
        s += (flying("red") ? "" : ring(st.red, "is-red")) + cable(p, vb.h * .58, "is-red") + needle(p);
      }
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
    if (st.side === "comp") {
      /* anywhere on a slide switch's body, its knob and pins included: slide it.
         The body covers the pins, so a lead reaches one through a hole on its strip. */
      for (const k of Object.keys(this.sc.inputs || {})) {
        const part = G.parts[k];
        if (!this.isSlide(k)) continue;
        const [a, , b] = part.pins, horiz = Math.abs(a.x - b.x) > Math.abs(a.y - b.y);
        const along = horiz ? x : y, off = horiz ? y - a.y : x - a.x, lo = Math.min(horiz ? a.x : a.y, horiz ? b.x : b.y), hi = Math.max(horiz ? a.x : a.y, horiz ? b.x : b.y);
        if (along > lo - P * .6 && along < hi + P * .6 && Math.abs(off) < P * .7) return { part: k };
      }
      for (const k of st.lifted) consider(k, this.liftPos(k), "lift", P * .2);
    }
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
  Bench.prototype.isSlide = function (k) {
    const part = this.G.parts[k];
    return !!(part && part.model === "spdt" && (this.sc.inputs || {})[k]);
  };
  /* a slide switch's pin, reached on the board through its strip */
  Bench.prototype.underSlide = function (k) {
    const i = String(k).lastIndexOf(".");
    return i > 0 && this.isSlide(k.slice(0, i));
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
    if (t) { this.act(t); return; }
    if (this.locked()) return;
    const tool = this.st.tool;
    this.refuse("Nothing there", tool === "look" ? "Tap a part, a link or a joint to look at it."
      : tool === "lift" ? "Tap the end of a leg, or one end of a link wire."
      : "Tap a test pin, a leg or a hole.");
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
    const t = e.target.closest ? e.target.closest("[data-job],[data-act],[data-view],[data-tool],[data-power],[data-pt],[data-next],[data-pmode],[data-pmem],[data-set],[data-sock],[data-tp],[data-input]") : null;
    if (!t || !this.root.contains(t)) return;
    const st = this.st, a = t.getAttribute.bind(t);
    if (t.hasAttribute("data-job")) { if (!t.disabled) { this.refuse(null); (this.task ? this.taskAct : this.jobAct).call(this, a("data-job"), t); } return; }
    /* Learn to Test: the bench is the bench's own during Show me and the questions */
    if (this.task && !t.hasAttribute("data-view") && !/^(sound|clearlog|closedial|flip)$/.test(a("data-act") || "") && this.taskLocked()) return;
    this.refuse(null);
    if (t.hasAttribute("data-set")) { this.setDial(a("data-set"), "now"); this.closeDial(); return; }
    if (t.hasAttribute("data-sock")) { st.sock = a("data-sock"); this.instrumentChanged("now"); return; }
    if (t.hasAttribute("data-view")) { st.view = a("data-view"); this.drawBoard(); this.syncControls(); return; }
    if (t.hasAttribute("data-tool")) { this.setTool(a("data-tool")); return; }
    if (t.hasAttribute("data-power")) { this.setPower(!st.power); return; }
    if (t.hasAttribute("data-pt")) { this.act({ pt: a("data-pt"), kind: "tp" }); return; }
    if (t.hasAttribute("data-tp") && st.view === "circuit") { this.act({ pt: a("data-tp"), kind: "tp" }); return; }
    if (t.hasAttribute("data-next")) { st.next = a("data-next"); this.syncControls(); return; }
    if (t.hasAttribute("data-pmode")) { st.pmode = a("data-pmode"); this.probeChanged(); return; }
    if (t.hasAttribute("data-pmem")) { st.pmem = a("data-pmem") === "1"; st.memLit = false; this.probeChanged(); return; }
    if (t.hasAttribute("data-input")) { this.setInput(a("data-input"), a("data-state")); return; }
    switch (a("data-act")) {
      case "flip": st.side = st.side === "comp" ? "copper" : "comp"; if (st.view !== "board") st.view = "board"; this.drawBoard(); this.syncControls(); break;
      case "dial-": this.stepDial(-1); break;
      case "dial+": this.stepDial(1); break;
      case "bigdial": this.openDial(); break;
      case "closedial": this.closeDial(); break;
      case "swap": {
        if (!(st.red && st.black)) { this.refuse("Swap", "Put both leads on first. Then Swap changes them over."); break; }
        const r = st.red; st.red = st.black; st.black = r; this.instrumentChanged("tap"); break;
      }
      case "sound":
        this.sound = !this.sound;
        try { localStorage.setItem("tbx-sound-v1", this.sound ? "on" : "off"); } catch (e) { /* kept for this visit only */ }
        if (!this.sound) { this.tone(false); this.buzz(false); }
        this.syncControls(); break;
      case "clearlog": st.log = []; st.live = null; this.renderLog(); break;
      case "newfuse": st.fuse = false; this.b.meter(null); this.meterSet(); this.feedback("ok", "New fuse fitted", "The meter works again. Check the red lead is in V/Ω before you measure a voltage."); this.drawMeter(); break;
    }
  };

  Bench.prototype.setTool = function (tool) {
    const st = this.st;
    st.tool = tool;
    st.lookAt = null;
    st.live = null;                       // the open log row belongs to the tool that took it
    if (tool === "probe") { this.b.meter(null); this.b.probe({ tip: st.tip, mode: st.pmode }); }
    else { this.b.probe(null); this.meterSet(); }
    if (tool === "look") this.feedback(null, "Look", "Tap a part, a link or a joint to look at it closely. Flip the board to see the joints and track cuts.");
    if (tool === "lift") this.feedback(null, "Lift a leg", "The soldering iron. Power off, then tap the end of a leg, or one end of a link wire, to lift it out of its hole. Tap it again to solder it back.");
    this.syncControls(); this.drawLeads(); this.fillPick();
    if (tool === "probe" && st.tip) this.measured("setting");
  };
  Bench.prototype.setPower = function (on) {
    const st = this.st;
    if (st.power === on) return;
    if (this.locked()) { this.syncControls(); return; }
    this.el.pw.classList.remove("is-call");
    st.power = on;
    this.b.power(on);
    this.syncControls();
    if (on && !st.everOn) {
      st.everOn = true;
      if (st.prechecked) { /* a Learn to Test board: looked at and short-checked already */ }
      else if (!st.shortChecked) this.mark("safety", "noshort", "You switched on before checking for shorts. A short across the supply can damage the supply and the board. Power off first, then test for continuity from +5 V to 0 V.", "Power on", "", "before a short check");
      else if (!st.looked.size) this.mark("bad", "nolook", "Before switching on, look at the board. Check the parts match the layout.", "Power on", "", "before looking at the board");
      else this.mark("ok", "prepower", "Right: you looked at the board and checked for shorts before switching on.", "Power on", "", "after the checks");
    }
    if ((st.tool === "meter" && st.red && st.black) || (st.tool === "probe" && st.tip)) this.measured("power");
    else if (!on) this.feedback(null, "Power is off", "Resistance, continuity and diode checks are done with the power off.");
    if (this.task) this.taskPower(on);
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
    if (st.tool === "probe") return;
    const sock = st.sock === "V/Ω" ? "V" : st.sock;
    this.b.meter(st.dial, { red: st.red || undefined, black: st.black || undefined, socket: sock });
  };

  /* A tap on the board, a test-point button, the circuit or the point list. */
  Bench.prototype.act = function (t) {
    const st = this.st;
    if (this.locked()) return;
    this.refuse(null);
    if (this.finding) { this.jobFind(t); return; }
    if (st.tool === "look") { this.look(t); return; }
    if (st.tool === "lift") { this.liftAt(t); return; }
    if (t.link) { this.refuse("Tap a point", "A link is a wire. Put the lead on a test pin, a leg or a hole."); return; }
    if (t.part && (this.sc.inputs || {})[t.part]) {
      const k = t.part, ss = Object.keys(this.sc.inputs[k].states), v = ss[(ss.indexOf(st.inputs[k]) + 1) % ss.length];
      this.feedback(null, this.inputName(k) + ": " + this.inputWord(k, v), this.isSlide(k)
        ? "A tap on " + k + " slides it. To put a lead on one of its pins, tap a hole on that pin's strip, next to " + k + "." : "");
      this.toggleInput(k);
      return;
    }
    if (st.tool === "probe") {
      if (t.part) { this.refuse("One pin at a time", "The probe tip goes on one point: a pin, a leg or a test point. Tap a point, not the body of " + t.part + "."); return; }
      st.tip = t.pt; st.memLit = false;
      this.b.probe({ tip: st.tip, mode: st.pmode });
      this.drawLeads(); this.measured("tap");
      return;
    }
    if (t.part) {
      const ps = this.G.parts[t.part].pins;
      if (ps.length !== 2) { this.refuse("Tap a pin", "Put the leads on two pins of " + t.part + ", one at a time."); return; }
      st.red = ps[0].key; st.black = ps[1].key; st.next = "red";
    } else {
      st[st.next] = t.pt;
      st.next = this.isTwoPoint() && st.next === "red" ? "black" : "red";
    }
    this.instrumentChanged("tap");
  };

  /* ------------------------------------------------------- inputs: switches, the LDR */
  Bench.prototype.toggleInput = function (k) {
    const ss = Object.keys(this.sc.inputs[k].states);
    this.setInput(k, ss[(ss.indexOf(this.st.inputs[k]) + 1) % ss.length]);
  };
  Bench.prototype.setInput = function (k, v) {
    const st = this.st;
    if (this.locked()) return;
    if (st.inputs[k] === v) return;
    st.inputs[k] = v;
    st.live = null;
    this.b.set(k, v);
    this.drawDyn();
    this.syncControls();
    this.say(this.inputName(k) + ": " + this.inputWord(k, v) + ".");
    if ((st.tool === "meter" && st.red && st.black) || (st.tool === "probe" && st.tip)) this.measured("setting");
  };
  Bench.prototype.inputName = function (k) { return (((this.sc.bench || {}).inputs || {})[k] || {}).name || k; };
  Bench.prototype.inputWord = function (k, v) { return ((((this.sc.bench || {}).inputs || {})[k] || {}).words || {})[v] || v; };
  /* "SD off, TK on, EN on": the inputs when a reading was taken */
  Bench.prototype.inputsText = function () {
    return Object.keys(this.st.inputs).map(k => k + " " + this.inputWord(k, this.st.inputs[k]).toLowerCase()).join(", ");
  };

  /* ------------------------------------------------------- lift a leg (the soldering iron) */
  Bench.prototype.liftAt = function (t) {
    const st = this.st, G = this.G;
    if (t.part || t.link) { this.refuse("Lift a leg", "Tap the end of one leg, or one end of a link wire, not the body."); return; }
    let k = t.pt;
    if (t.kind === "hole") k = this.jointAt(k) || k;
    const pin = G.pins[k];
    if (G.tps[k]) { this.refuse("Test pin", "Test pins stay soldered. Lift a part's leg or a link end."); return; }
    if (!pin && !isLinkEnd(k)) { this.refuse("Nothing to lift", "There is no leg here. Tap the end of a leg, or one end of a link wire."); return; }
    if (pin) {
      const part = G.parts[k.slice(0, k.lastIndexOf("."))];
      if (part.kind === "dil") { this.refuse("Chip legs stay in", "A chip's legs are not lifted: they bend and snap. Test the pin itself, or lift the leg or link that joins it."); return; }
      if (part.kind === "terminal") { this.refuse("Terminal block", "The terminal block stays soldered. Lift a leg or a link end instead."); return; }
    }
    const back = st.lifted.indexOf(k) >= 0, name = this.label(k).replace(/ \(lifted\)$/, "");
    if (st.power) {
      this.mark("safety", "iron", "The power is on. Never solder on a live board: switch off, then " + (back ? "solder it back." : "lift it."), name, "Soldering iron", back ? "not soldered back" : "not lifted");
      return;
    }
    if (back) st.lifted.splice(st.lifted.indexOf(k), 1); else st.lifted.push(k);
    this.remake();
    st.log.push({ pt: name, tool: "Soldering iron", reading: back ? "soldered back" : "lifted", mark: "", kind: "note", ev: { type: back ? "refit" : "lift", key: k }, set: Object.assign({}, st.inputs), sets: this.inputsText() });
    this.renderLog();
    if (back) this.feedback("ok", name + " soldered back", "The board is joined up again.");
    else this.feedback("ok", name + " lifted", "It is out of its hole, so there is a gap. To measure the current through it: dial on <b>DCA</b>, red lead in <b>A</b>, one lead on the lifted end and one on the hole's strip, then power on. Tap it again to solder it back.");
    this.say(name + (back ? " soldered back." : " lifted."));
    if (this.job) this.jobRow(st.log[st.log.length - 1], "note");
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
        const p1 = ps.find(q => q.pin === "1"), print = F.printed[t.part] || "NE" + (part.comp.part || "");
        title = t.part + ": a chip";
        short = print + ", notch at the top";
        text = "Printed on top: <b>" + esc(print) + "</b>. The notch is at the top. Pin 1 is in hole " + p1.hole + ".";
      } else if (model === "spdt") {
        const v = st.inputs[t.part], pin = (this.sc.inputs[t.part] || { states: {} }).states[v];
        title = t.part + ": a slide switch";
        short = "slid " + this.inputWord(t.part, v).toLowerCase();
        text = "Slid to <b>" + esc(this.inputWord(t.part, v).toLowerCase()) + "</b>, towards pin " + pin + ". The middle pin joins the pin the slider is next to. Pins in holes " +
          ["1", "c", "2"].map(n => ps.find(q => q.pin === n).hole).join(", ") + " (pin 1, middle, pin 2).";
      } else if (model === "npn") {
        const at = n => ps.find(q => q.pin === n).hole;
        title = t.part + ": a BC548 transistor";
        short = "metal can, tab at " + at("e");
        text = "Metal can. The tab on the rim is next to the <b>emitter</b>, in hole " + at("e") + ". Base in " + at("b") + ", collector in " + at("c") + ".";
      } else if (model === "buzzer") {
        const plus = ps.find(q => q.pin === "+");
        title = t.part + ": a buzzer";
        short = "+ at the " + this.legWord(part, plus).replace(" leg", "");
        text = "Marked <b>+</b> on top, over the longer leg, at the <b>" + this.legWord(part, plus).replace(" leg", "") + "</b>, in hole " + plus.hole + ". The + leg goes to +5 V.";
      } else if (model === "ldr") {
        title = t.part + ": a light-dependent resistor";
        short = st.inputs[t.part] === "covered" ? "black cap on" : "under the lamp";
        text = "In holes " + ps.map(q => q.hole).join(" and ") + ". It can go either way round. " + (st.inputs[t.part] === "covered" ? "The black cap is on it: it is dark." : "The lamp is shining on it.");
      } else if (model === "pump") {
        title = "The pump's terminal block";
        short = "pump on flying leads";
        text = "The pump sits off the board. Its two leads are screwed into this block, in holes " + ps.map(q => q.hole).join(" and ") + ".";
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
      /* what a fault took away or added: a cut never made (S5), a bridge (S6) */
      const cutNow = new Set(F.layout.cuts);
      const missing = this.sc.layout.cuts.filter(c => { const h = S.parseRef(c); return !cutNow.has(c) && h.r === r.r && Math.abs(h.c - r.c) <= 1; });
      if (missing.length) text += " <b>No track cut here.</b> The strip runs on, unbroken, under the chip.";
      const br = (F.bridges || []).find(b => b.indexOf(ref) >= 0);
      if (br) {
        text += " <b>A solder bridge joins row " + S.rowLetter(S.parseRef(br[0]).r) + " and row " + S.rowLetter(S.parseRef(br[1]).r) + ".</b>";
        short = "solder bridge";
      }
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
    if (key && this.job) this.jobLook(key);
    if (key && this.task) this.taskLook(key);
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
    if (sock === "V/Ω" && g === "DCV" && st.dial !== "DCV D" && live && !rd.over && !rd.fuse && onRail(st.black, this.sc.ground) && !this.isProbeOnly(st.red))
      this.pendingEv = { type: "dcv", key: st.red };
    if (sock === "V/Ω" && g === "OHM" && !live)
      this.pendingEv = { type: "ohm", a: st.red, b: st.black, beep: !!rd.beep, over: !!rd.over, value: rd.value };
    if (sock === "V/Ω" && st.dial === "DCV D" && !live)
      this.pendingEv = { type: "diode", a: st.red, b: st.black, over: !!rd.over, value: rd.value };
    if (sock !== "V/Ω" && g !== "DCA" && g !== "ACA") {
      if (live) return say("safety", "ainv", "The red lead is in <b>A</b>. Measuring voltage like this puts a short across the circuit and blows the meter's fuse. Tap the <b>V/Ω</b> socket to move it back.");
      return say("bad", "asock", "The red lead is in " + sock + ". Resistance, continuity and diode check use the <b>V/Ω</b> socket.");
    }
    if (g === "DCA" || g === "ACA") return this.assessAmps(rd, g, rng, sock, live, say);
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
        : "Right: power off, red lead in V/Ω, and a range that shows the value." + this.inCircuitNote(across, rd));
    }
    if (st.dial === "DCV D") {
      if (live) return say("bad", "dion", "Diode check is done with the power off. The meter pushes its own small current through the diode.");
      const led = across && this.G.parts[across.part].model === "led" ? across : null;
      if (led) {
        const redPin = this.G.pins[led.redPin];
        if (redPin.pin === "k" && this.taskWants(st.red, st.black)) return say("ok", "diode", "Right: diode check with the power off, red lead on the cathode. 1 means it blocks this way, as a good diode should.");
        if (redPin.pin === "k") return say("bad", "direv", "The red lead is on the cathode (the flat side). A diode blocks this way, so 1 is what it shows. Swap the leads before you call it faulty.");
        return say("ok", "diode", "Right: power off, red lead on the anode. A number (about 1.6 to 1.9 V for an LED) means it conducts. 1 means it blocks.");
      }
      return say("ok", "diode", "Right: diode check with the power off. Red on the anode: a number means it conducts, 1 means it blocks.");
    }
    if (g === "DCV") {
      /* a lead on its way across a part: said, not marked */
      if (this.netOf(st.red) && this.netOf(st.red) === this.netOf(st.black)) {
        this.pendingEv = null;
        return this.feedback(null, "Both leads on one strip", "The copper joins the two leads, so the meter reads 0 V. Move one lead to the other side of the part.");
      }
      if (!live) return say("bad", "voff", "The power is off, so there is no voltage to measure. Switch on first.");
      if (this.isProbeOnly(st.red)) return say("bad", "logicmeter", "Logic levels on a chip are tested with the <b>logic probe</b>, not the meter. Choose Probe, then touch the pin.");
      /* across a part from any points on its two nets (T3 and T4 are across R1) */
      const side = across ? null : onRail(st.black, this.sc.ground) ? null : this.acrossNets(st.red, st.black);
      if (!onRail(st.black, this.sc.ground) && !across && !side) return say("bad", "black0", "Put the black lead on 0 V (T2). The voltages on the job card are measured from 0 V.");
      if (rd.over) return say("bad", "over", "1 on the left means over range. Turn up to <b>DCV 20</b>.");
      if (rng === "200" || rng === "1000") return say("bad", "bigrange", "This works, but DCV " + rng + " shows fewer decimal places. DCV 20 is the range just above 5 V.");
      return say("ok", "dcv", "Right: DCV " + rng + ", red lead in V/Ω, black " + (across ? "on the other leg" : side ? "on the other side of " + side : "on 0 V") + ".");
    }
  };
  Bench.prototype.assessProbe = function () {
    const st = this.st;
    if (!st.tip) return;
    this.pendingEv = null;
    const pts = this.label(st.tip), tool = "Probe " + st.pmode + (st.pmem ? ", MEM" : "");
    const say = (kind, code, text) => this.mark(kind, code, text, pts, tool, null, false, true);
    const fam = this.probeFamily(), why = this.notLogic(st.tip);
    if (!fam) return say("bad", "nochip", "This board has no logic chip. Use the meter on <b>DCV 20</b>.");
    if (!st.power) return say("bad", "probeoff", "Switch on first. The probe takes its power from the board, so with the power off its lights stay dark.");
    if (st.pmode !== fam) return say("bad", "family", fam === "TTL"
      ? "Set the probe to <b>TTL</b> for the 555. On CMOS it needs 70 % of the supply (3.5 V) to show Hi, and the 555's HIGH is only about 3.6 V."
      : "Set the probe to <b>CMOS</b> for 74HC chips. They are CMOS chips: their inputs switch at about half the supply.");
    if (st.pmem) return say("bad", "mem", "Use <b>Pulse</b>, not MEM. MEM keeps the pulse light on after one pulse, so you cannot tell if it is still pulsing.");
    if (why) return say("bad", "analog", why);
    this.pendingEv = { type: "probe", key: st.tip };
    return say("ok", "probe", "Right: clips on this board's +5 V and 0 V, " + fam + ", Pulse, and the tip on one point.");
  };
  /* From the scenario (§16, Q1, Q2): the probe's setting for this board's
     chip (none: no logic chip), the strips that are probe only (the 555's
     pin 3), and the strips that are not logic signals, each with its reason. */
  Bench.prototype.probeFamily = function () { const b = this.sc.bench; return b ? b.probe : "TTL"; };
  Bench.prototype.isProbeOnly = function (k) {
    const s = this.stripOf(k);
    return !!s && ((this.sc.bench || {}).probeOnly || []).some(q => this.stripOf(q) === s);
  };
  Bench.prototype.notLogic = function (k) {
    const s = this.stripOf(k), nl = (this.sc.bench || {}).notLogic || {};
    if (!s) return null;
    for (const q of Object.keys(nl)) if (this.stripOf(q) === s) return nl[q];
    return null;
  };

  /* ------------------------------------------------------- current (§16 3.2c) */
  const AFULL = { "20µ": 19.99e-6, "200µ": 199.9e-6, "2m": 1.999e-3, "20m": 19.99e-3, "200m": .1999, "2": 1.999, "20": 19.99 };
  /* The lifted end the leads sit either side of, or null: one lead on the
     strip under the hole, the other on what was soldered into it. */
  Bench.prototype.inGap = function (a, b) {
    const na = this.netOf(a), nb = this.netOf(b);
    for (const k of this.st.lifted) {
      const under = this.G.net(this.holeOf(k)), lifted = this.netOf(k);
      if ((na === under && nb === lifted) || (na === lifted && nb === under)) return k;
    }
    return null;
  };
  Bench.prototype.assessAmps = function (rd, g, rng, sock, live, say) {
    const st = this.st, gap = this.inGap(st.red, st.black);
    if (sock === "V/Ω") return say("bad", "avsock", "To measure current, the red lead goes in the <b>A</b> socket. Tap the A socket.");
    if (rd.fuse) return say("safety", "aacross", "The meter was across two joined points, not in series. In A mode that is a short, and the fuse has blown. Current is measured with the circuit broken and the meter in the gap.");
    if (!gap) return say("bad", "apar", "The meter is across two points, so it is in parallel, not in series. In A mode it shorts out what it is across. Lift a leg or a link end first, then put the leads either side of the gap.");
    if (rng === "20" && sock === "A") return say("bad", "a20", "The 20 A range uses the <b>20A</b> socket. For small currents, use a mA range with the red lead in A.");
    if (sock === "20A") return say("bad", "a20sock", "The red lead is in 20A. For a mA range it goes in <b>A</b>.");
    if (!live) return say("bad", "aoff", "The meter is in the gap. Switch on: current only flows with the power on.");
    if (g === "ACA") return say("bad", "aca", "This board runs on DC. Turn the dial to <b>DCA</b>.");
    if (rd.over) return say("bad", "aover", "1 on the left means over range. Turn the dial up one step.");
    if (isFinite(rd.value) && Math.abs(rd.value) < AFULL[rng] / 100 && rng !== "20µ") return say("bad", "ahigh", "This range is too high: the reading is nearly 0. Turn the dial down for more digits.");
    this.pendingEv = { type: "amps", key: gap, value: rd.value };
    return say("ok", "amps", "Right: power on, red lead in A, and the meter in the gap, in series." +
      (rd.value < 0 ? " The minus sign means the current goes in at the black lead. Swap the leads for a plus reading." : ""));
  };
  /* Q4: resistance in the circuit. Only a note, and only when the parts
     around it change the reading by more than 5 %. */
  Bench.prototype.inCircuitNote = function (across, rd) {
    if (!across || !isFinite(rd.value)) return "";
    const part = this.G.parts[across.part], bp = this.b.parts[across.part];
    if (!bp || part.pins.some(q => this.st.lifted.indexOf(q.key) >= 0)) return "";
    const R = part.model === "res" ? bp.R : part.model === "ldr" ? bp[this.st.inputs[across.part] || "light"] : null;
    if (!R || Math.abs(rd.value - R) / R <= .05) return "";
    return " <b>Note:</b> other parts are joined across " + across.part + ", so this is not " + across.part + " on its own. Lift one leg for a true reading.";
  };
  Bench.prototype.acrossPart = function (a, b) {
    for (const part of Object.values(this.G.parts)) {
      if (part.pins.length !== 2) continue;
      const ks = part.pins.map(q => q.key);
      if (ks.indexOf(a) >= 0 && ks.indexOf(b) >= 0) return { part: part.id, redPin: a };
    }
    return null;
  };
  /* the two-legged part whose two nets the leads are on, or null */
  Bench.prototype.acrossNets = function (a, b) {
    const na = this.netOf(a), nb = this.netOf(b);
    if (!na || !nb || na === nb) return null;
    for (const part of Object.values(this.G.parts)) {
      if (part.pins.length !== 2 || part.kind === "terminal") continue;
      const n0 = this.netOf(part.pins[0].key), n1 = this.netOf(part.pins[1].key);
      if ((n0 === na && n1 === nb) || (n0 === nb && n1 === na)) return part.id;
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
    if (kind === "safety") this.el.fb.insertAdjacentHTML("beforeend", '<p class="tbx-block"><b>' + (this.task ? "This try can no longer pass the task." : "This run can no longer earn the badge.") + '</b></p>' +
      (code === "ainv" || code === "aacross" ? '<button type="button" data-act="newfuse">Fit a new fuse</button>' : ""));
    if (pts) {
      if (st.live) st.live = null;
      const row = { pt: pts, tool: tool || "", reading: reading || "", mark: kind === "ok" ? "✓" : "✗", kind, ev: this.pendingEv, set: Object.assign({}, st.inputs), sets: this.inputsText() };
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
    if (pts && live && this.task) this.taskRow(kind);
  };
  Bench.prototype.feedback = function (kind, head, html) {
    const fb = this.el.fb;
    if (kind !== "nope") this.fbPrev = null;
    fb.className = "tbx-fb" + (kind === "ok" ? " is-ok" : kind === "bad" ? " is-bad" : kind === "safety" ? " is-bad is-safety" : kind === "look" ? " is-look" : kind === "nope" ? " is-nope" : "");
    fb.innerHTML = `<div class="tbx-fb-h">${esc(head)}</div><div>${html}</div>`;
    fb.dataset.text = html;
    /* words that send the pupil to the power switch ring it */
    this.el.pw.classList.toggle("is-call", /\bswitch (on|off)\b|power: switch/i.test(html) && !this.auto);
  };
  /* A refused tap always answers on screen, never only through say(): a line in
     the walk-through (the job line under the steps) and the same in the box under
     the tools, each saying why and what to do next. Shown again on every refused
     tap, so a second tap is seen to answer too. refuse(null) clears the line. */
  Bench.prototype.refuse = function (head, html) {
    const job = this.el.job, fb = this.el.fb;
    let n = job.querySelector(".tbx-nope");
    if (!head) {
      if (n) n.hidden = true;
      job.classList.remove("has-nope");
      /* the box goes back to what it said before the refusal */
      if (this.fbPrev && fb.classList.contains("is-nope")) { fb.className = this.fbPrev.cls; fb.innerHTML = this.fbPrev.html; fb.dataset.text = this.fbPrev.text; }
      this.fbPrev = null;
      return;
    }
    if (!fb.classList.contains("is-nope")) this.fbPrev = { cls: fb.className.replace(/ ?is-new/, ""), html: fb.innerHTML, text: fb.dataset.text || "" };
    if (!n) { n = document.createElement("div"); n.className = "tbx-nope"; n.setAttribute("role", "status"); }
    const should = job.querySelector(".tbx-should");
    if (n.parentNode !== job) { if (should) job.insertBefore(n, should); else job.appendChild(n); }
    n.innerHTML = `<b>${esc(head)}:</b> ${html.replace(/^([A-Z])(?=[a-z ])/, c => c.toLowerCase())}`;
    n.hidden = false;
    job.classList.add("has-nope");
    this.feedback("nope", head, html);
    [n, this.el.fb].forEach(e => { e.classList.remove("is-new"); void e.offsetWidth; e.classList.add("is-new"); });
    this.say(head + ". " + html.replace(/<[^>]+>/g, ""));
  };
  Bench.prototype.techLine = function () {
    const st = this.st, t = this.task;
    /* Show me's readings are the bench's own, so they are not counted */
    if (t && t.stage !== "turn" && t.stage !== "done") { this.el.tech.innerHTML = ""; return; }
    const n = t && t.carry ? this.taskTally() : st;
    this.el.tech.innerHTML = `<span class="tbx-tc">Technique <b class="ok">✓ ${n.ok}</b> <b class="bad">✗ ${n.bad + (t ? t.cross : 0)}</b></span>` +
      (n.safety ? `<span class="tbx-sc">Safety errors: ${n.safety}</span>` : "");
  };
  Bench.prototype.say = function (t) { this.el.say.textContent = t; };

  /* ------------------------------------------------------- the log */
  Bench.prototype.renderLog = function () {
    const rows = this.st.log;
    this.el.log.innerHTML = rows.length ? rows.map((r, i) =>
      (r.sets && r.sets !== (rows[i - 1] || {}).sets ? `<tr class="tbx-setrow"><td colspan="4">With ${esc(r.sets)}</td></tr>` : "") +
      `<tr><td>${esc(r.pt)}</td><td>${esc(r.tool)}</td><td>${esc(r.reading || "…")}</td><td class="${r.kind === "ok" ? "ok" : r.kind === "note" ? "" : "bad"}">${r.mark}</td></tr>`).join("")
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
    st.blocked = !!(st.red && st.black && this.isVoltSetting() && this.isProbeOnly(st.red) && st.power);
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
    if (!this.sound) on = false;
    if (on && !this.osc) {
      try {
        const o = this.ac.createOscillator(), g = this.ac.createGain();
        o.frequency.value = 2700; g.gain.value = 0.06; o.connect(g); g.connect(this.ac.destination); o.start();
        this.osc = o; this.gain = g;
      } catch (e) { this.osc = null; }
    } else if (!on && this.osc) { try { this.osc.stop(); } catch (e) { /* already stopped */ } this.osc = null; }
  };

  /* the buzzer: a quiet tone (Q3), on the same Sound button as the beep */
  Bench.prototype.buzz = function (on) {
    if (!this.ac) return;
    if (!this.sound) on = false;
    if (on && !this.bz) {
      try {
        const o = this.ac.createOscillator(), g = this.ac.createGain();
        o.frequency.value = 2300; g.gain.value = 0.02; o.connect(g); g.connect(this.ac.destination); o.start();
        this.bz = o;
      } catch (e) { this.bz = null; }
    } else if (!on && this.bz) { try { this.bz.stop(); } catch (e) { /* already stopped */ } this.bz = null; }
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
    /* the buzzer and the pump: on, off, or on and off by itself (a floating input) */
    let buzz = false;
    for (const [id, L] of Object.entries(this.b.loads())) {
      const seen = this.loadSeen[id] = this.loadSeen[id] || { on: null, changes: [] };
      if (seen.on !== null && seen.on !== L.on) seen.changes.push(now);
      seen.on = L.on;
      seen.changes = seen.changes.filter(t => now - t < 2600);
      const chat = seen.changes.length >= 2;
      if (L.kind === "buzzer") {
        buzz = buzz || L.on;
        lines.push(`<span class="tbx-led"><b>${esc(id)}:</b> ${chat ? "sounding on and off" : L.on ? "sounding" : "silent"}</span>`);
      } else {
        const el = this.svg && this.svg.querySelector('[data-pump="' + id + '"]');
        if (el) el.classList.toggle("is-on", L.on);
        lines.push(`<span class="tbx-led"><b>Pump:</b> ${chat ? "starting and stopping" : L.on ? "running" : "stopped"}</span>`);
      }
    }
    this.buzz(buzz && this.st.power);
    if (this.st.lifted.length) lines.push(`<span class="tbx-led"><b>Lifted:</b> ${esc(this.st.lifted.map(k => this.label(k).replace(/ \(lifted\)$/, "")).join("; "))}</span>`);
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
    press("[data-power]", () => st.power);
    this.el.pw.querySelector(".tbx-pw-s").textContent = st.power ? "on" : "off";
    press("[data-next]", b => b.getAttribute("data-next") === st.next);
    press("[data-pmode]", b => b.getAttribute("data-pmode") === st.pmode);
    press("[data-pmem]", b => (b.getAttribute("data-pmem") === "1") === st.pmem);
    press("[data-act=flip]", () => st.side === "copper");
    press("[data-input]", b => st.inputs[b.getAttribute("data-input")] === b.getAttribute("data-state"));
    press("[data-act=sound]", () => this.sound);
    const meter = st.tool !== "probe";
    this.el.meter.hidden = !meter;
    this.el.probe.hidden = meter;
    this.el.dialrow.hidden = !meter;
    this.el.leadrow.hidden = st.tool !== "meter";
    this.el.proberow.hidden = meter;
    this.el.leadrow.querySelector("[data-act=swap]").setAttribute("aria-disabled", st.red && st.black ? "false" : "true");
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
      const ends = st.tool === "lift" ? this.F.layout.links.reduce((a, l) => a.concat(["link@" + l.a, "link@" + l.b]), []) : st.lifted.filter(isLinkEnd);
      for (const k of ends) o += `<option value='${esc(JSON.stringify({ pt: k, kind: "lift" }))}'>${esc(this.label(k))}</option>`;
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

  /* sets: TBJobs, one job set per scenario. ids: the jobs in page order, which
     may run across several boards (3.3: "Job n of 10", J3). */
  Bench.prototype.startJobs = function (sets, ids, start) {
    this.jobSets = sets;
    const all = [];
    for (const [sc, set] of Object.entries(sets)) for (const d of set.jobs) all.push({ def: d, set, sc });
    this.jobList = ids && ids.length ? ids.map(id => all.find(e => e.def.id === id)).filter(Boolean) : all;
    this.score = { first: 0, ok: 0, bad: 0, safety: 0, done: 0 };
    this.openJob(Math.min(start || 0, this.jobList.length - 1));
  };
  Bench.prototype.openJob = function (n) {
    const e = this.jobList[n], d = e.def;
    this.jobN = n;
    this.job = null;
    this.finding = false;
    this.jobSet = e.set;
    if (e.sc !== this.sc.id) this.switchScenario(e.sc);
    this.el.diag.hidden = false;
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
    this.el.diag.setAttribute("aria-disabled", now < 2 || this.job.evOk ? "true" : "false");
    this.refuse(null);
  };
  Bench.prototype.jobLocked = function () {
    if (this.job.step >= 2) return false;
    if (this.job.step === 1) this.refuse("Predict first", "Answer the two questions under the board. Then you can test.");
    else this.refuse("Read the job card first", "Then tap <b>Start: predict</b>.");
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
      <p class="tbx-card-s">Before you switch on: look at the board, and check for shorts with the power off.${set.card ? " " + esc(set.card) : ""}</p>
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
    if (src.look) return [].concat(src.look).some(k => st.looked.has(k)) ? "" : null;
    /* src.set: the reading counts only if it was taken with these switches (3.3) */
    const setOk = r => !src.set || Object.entries(src.set).every(([k, v]) => (r.set || {})[k] === v);
    if (src.amps) {
      for (let i = st.log.length - 1; i >= 0; i--) { const r = st.log[i]; if (r.ev && r.ev.type === "amps" && r.reading && setOk(r)) return r.reading; }
      return null;
    }
    const type = src.dcv ? "dcv" : "probe", k = src.dcv || src.probe, seg = G.segAt(this.holeOf(k));
    for (let i = st.log.length - 1; i >= 0; i--) {
      const r = st.log[i], e = r.ev;
      if (e && e.type === type && !this.F.dry.has(e.key) && G.segAt(this.holeOf(e.key)) === seg && r.reading && setOk(r)) return r.reading;
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
    if (f.hole && t.pt) hit = [].concat(f.hole).indexOf(this.holeOf(t.pt)) >= 0;
    if (f.part && t.part) hit = [].concat(f.part).indexOf(t.part) >= 0;
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
    /* p.type: "ohm" (continuity or resistance, the default) or "diode"; a Look
       proof goes through jobLook. p.expect: "beep", "open", "over" or [lo, hi]. */
    const e = row.ev, p = j.def.confirm.prove;
    if (!e || e.type !== (p.type || "ohm") || kind !== "ok") return;
    const say = t => this.el.fb.insertAdjacentHTML("beforeend", `<p class="tbx-block">${esc(t)}</p>`);
    const G = this.G, seg = k => G.segAt(this.holeOf(k));
    /* a slide switch's pin is under its body, so a hole on the pin's strip counts */
    const fits = (s, k, other) => s.key ? k === s.key || this.holeOf(k) === this.holeOf(s.key) || (this.underSlide(s.key) && seg(k) === seg(s.key))
      : s.part ? k.indexOf(s.part + ".") === 0
      : s.seg ? seg(k) === seg(s.seg) && !this.F.dry.has(k)
      : s.net ? this.netOf(k) === this.netOf(s.net) && seg(k) !== seg(other) : false;
    const beep = isFinite(e.value) && e.value < TB.meter.BEEP_BELOW;
    const met = x => x === "beep" ? beep : x === "open" ? !beep : x === "over" ? e.over
      : Array.isArray(x) ? !e.over && isFinite(e.value) && e.value >= x[0] && e.value <= x[1] : false;
    /* p.ways: a diode check proves it either way round, red lead first (S9) */
    if (p.ways) {
      const way = p.ways.find(w => fits(w.red, e.a, e.b) && fits(w.black, e.b, e.a));
      if (!way) return say(p.where);
      if (met(way.expect)) this.jobProved(way.right);
      else if (p.miss) say(p.miss);
      return;
    }
    const ok = (fits(p.a, e.a, e.b) && fits(p.b, e.b, e.a)) || (fits(p.a, e.b, e.a) && fits(p.b, e.a, e.b));
    if (!ok) return say(p.where);
    if (p.set && Object.entries(p.set).some(([k, v]) => (row.set || {})[k] !== v)) return say(p.setMsg);
    if (!met(p.expect)) { if (p.miss) say(p.miss); return; }
    this.jobProved();
  };
  Bench.prototype.jobLook = function (key) {
    const j = this.job, p = j && j.def.confirm.prove;
    if (!j || j.sub !== "prove" || j.proved || p.type !== "look") return;
    if ([].concat(p.look).indexOf(key) >= 0) this.jobProved();
  };
  Bench.prototype.jobProved = function (right) {
    const j = this.job, p = j.def.confirm.prove;
    j.proved = true;
    j.sub = "fix";
    this.jobLine(`<b>Fix it:</b> the proof is done. <button type="button" class="tbx-go" data-job="fix">Fix it</button>`);
    this.el.fb.insertAdjacentHTML("beforeend", `<p class="tbx-block"><b>${esc(right || p.right)}</b></p>`);
  };
  Bench.prototype.swapBoard = function (fault) {
    const st = this.st;
    st.live = null;                       // the last row belongs to the board it was taken on
    this.b = TB.bench(this.sc.id, { fault, seed: this.seed });
    this.F = this.b.fault;
    for (const [k, v] of Object.entries(st.inputs)) this.b.set(k, v);
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
    const v = (k, set) => {
      const b = TB.bench(sc.id, { fault: "good", seed });
      for (const [id, s] of Object.entries(set || {})) b.set(id, s);
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
    const s = this.score, n = this.jobList.length, need = Math.ceil(.8 * n);
    /* Probe Detective (§10): 8 of 10 first try, and any safety error in the run blocks it */
    let badge = "";
    if (window.Progress && Progress.record) {
      const res = Progress.record("tst-ff", s.safety ? 0 : s.first, n) || {};
      badge = res.justUnlocked ? "✓ You have earned the Probe Detective badge."
        : res.unlocked ? "You already have the Probe Detective badge."
        : s.safety ? "A safety error means this run cannot earn the Probe Detective badge."
        : `Find ${need} of ${n} faults first try, with no safety errors, to earn the Probe Detective badge.`;
    }
    this.showPop(`<div class="tbx-card is-modal" role="dialog" aria-modal="true" aria-labelledby="${this.id}-sd">
      <h2 id="${this.id}-sd">Set done</h2>
      <p>Faults found first try: ${s.first} of ${s.done}.</p>
      <p>Technique: ${s.ok} ✓, ${s.bad} ✗.</p>
      <p>Safety errors: ${s.safety}.</p>${badge ? `\n      <p>${badge}</p>` : ""}
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
      case "diagnose":
        if (j.evOk) return this.refuse("Diagnosed", "You have the fault and your evidence. Now confirm and fix it.");
        if (j.step < 2) return j.step === 1 ? this.refuse("Test first", "Answer the two questions under the board, then take your readings. Then diagnose.") : this.jobLocked();
        return this.jobDiagnose();
      case "close": return this.closeDiag();
      case "check": return this.jobCheck();
      case "confirm": return this.jobConfirm();
      case "fix": if (j.proved && !j.fixed) this.jobFix(); return;
      case "nextjob": this.jobCount(); this.openJob(this.jobN + 1); return;
      case "finish": return this.jobFinish();
      case "again": return this.startJobs(this.jobSets, this.jobList.map(x => x.def.id), 0);
    }
  };

  /* ========================================================= Learn to Test
     Show me → Your turn (§10, §18). The words live in test-bench-tasks.js.
     Show me runs on the task's fixed seed (T7) and waits for Next at each
     step (T5); Your turn is the pupil's own seed. Each item of Your turn is
     questions before (predict), readings, then questions after (compare,
     another board). A reading at its points is marked step by step. The score
     is each task's first try (T1: the badge comes in Phase 4), on this device. */
  const TASK_KEY = "tbx-lt-v1";
  const tval = (f, v) => typeof f === "function" ? f(v) : f;
  const ON_KINDS = { dcv: 1, amps: 1, probe: 1 };
  Bench.prototype.locked = function () {
    return !!((this.job && this.jobLocked()) || (this.task && this.taskLocked()));
  };
  Bench.prototype.startTasks = function (tasks, id) {
    this.tasks = tasks;
    try { this.taskDone = JSON.parse(localStorage.getItem(TASK_KEY) || "{}") || {}; } catch (e) { this.taskDone = {}; }
    const live = tasks.order.filter(o => !o.soon && tasks[o.id]);
    this.openTask((live.find(o => o.id === id) || live[0]).id);
  };
  Bench.prototype.taskStop = function () {
    clearTimeout(this.showT); cancelAnimationFrame(this.flyRaf);
    this.flyLead = null; this.auto = false;
    if (this.task) this.task.busy = false;
  };
  /* a board for the task: its scenario, a fresh good board, the task's start */
  Bench.prototype.taskBoard = function (scenario, seed) {
    const t = this.task;
    if (t && t.stage === "turn") ["ok", "bad", "safety"].forEach(k => { t.carry[k] += this.st[k]; });
    if (scenario !== this.sc.id) this.switchScenario(scenario);
    this.load("good", seed);
    this.taskReset();
    if (t) this.taskHead();
  };
  Bench.prototype.openTask = function (id) {
    const d = this.tasks[id];
    this.taskStop();
    this.task = null;
    if ((d.showScenario || d.scenario) !== this.sc.id) this.switchScenario(d.showScenario || d.scenario);
    this.load("good", d.seed);
    this.task = { def: d, n: this.tasks.order.findIndex(o => o.id === id), stage: "card", step: -1, m: 0, phase: null, v: {}, cross: 0, firstQ: true, pills: {} };
    this.taskReset();
    this.taskHead();
    this.el.under.hidden = false; this.el.jobpanel.hidden = true;
    this.feedback(null, "Learn to Test", esc(d.pre));
    this.taskCard();
  };
  /* the board as the task finds it: power off, the meter and probe as they were left */
  Bench.prototype.taskReset = function () {
    const st = this.st, s = this.task.def.start || {};
    st.prechecked = s.prechecked !== false;
    if (s.looked) st.looked.add("task:pre");
    st.red = null; st.black = null; st.next = "red";
    if (s.dial) st.dial = s.dial;
    if (s.sock) st.sock = s.sock;
    if (s.pmode) st.pmode = s.pmode;
    if (s.pmem !== undefined) st.pmem = s.pmem;
    this.meterSet(); this.drawMeter(); this.drawLeads(); this.syncControls();
  };
  Bench.prototype.taskHead = function () {
    const t = this.task, d = t.def;
    this.el.job.classList.add("is-jobs");
    this.el.job.innerHTML =
      `<div class="tbx-job-t"><span class="tbx-jobno">Task ${t.n + 1} of ${this.tasks.order.length}</span> ` +
      `<span class="tbx-title">${esc(d.title)}</span><span class="tbx-sub">${esc(d.sub)}</span></div>` +
      `<ol class="tbx-steps" aria-label="Steps"></ol><button type="button" class="tbx-all" data-job="list">All tasks</button>` +
      `<div class="tbx-should"></div><div class="tbx-tech" aria-live="polite"></div>`;
    this.el.tech = this.el.job.querySelector(".tbx-tech");
    this.el.steps = this.el.job.querySelector(".tbx-steps");
    this.el.should = this.el.job.querySelector(".tbx-should");
    this.taskLine();
    this.techLine();
  };

  /* -- an item's readings, each with the item's settings unless it has its own */
  const READ_KEYS = ["kind", "set", "setMsg", "where", "lift", "unlift", "dial", "polar", "revMsg", "liftMsg", "unliftMsg", "dialMsg"];
  Bench.prototype.taskReads = function (m) {
    if (m.kind === "look") return [];
    return (m.reads || [{ id: m.id, name: m.name }]).map(r => {
      const o = Object.assign({}, r);
      READ_KEYS.forEach(k => { if (o[k] === undefined && m[k] !== undefined) o[k] = m[k]; });
      if (!o.kind) o.kind = "dcv";
      if (o.polar === undefined) o.polar = o.kind !== "ohm" && o.kind !== "cont";
      if (!o.red && !o.tip && o.kind !== "power") { o.red = m.red; o.black = m.black; o.tip = m.tip; }
      return o;
    });
  };
  const beforeQs = m => m.before || (m.predict ? [m.predict] : []);
  const afterQs = m => m.after || [m.compare && Object.assign({ label: "Compare" }, m.compare), m.fault && Object.assign({ label: "Another board" }, m.fault)].filter(Boolean);
  /* the marked steps for one reading */
  Bench.prototype.taskChecks = function (r) {
    if (!r || r.kind === "power") return [];
    const c = r.kind === "probe" ? [["dial", "TTL / CMOS"], ["sock", "Pulse"], ["tip", "Probe tip"]]
      : [["dial", "Dial"], ["sock", "Red lead socket"]].concat(r.polar ? [["black", "Black lead"], ["red", "Red lead"]] : [["leads", "Leads"]]);
    c.push(["power", "Power"]);
    if (r.lift) c.push(["lift", "Leg lifted"]);
    if (r.unlift) c.push(["unlift", "Soldered back"]);
    return c.concat(Object.keys(r.set || {}).map(k => ["in:" + k, this.inputName(k)]));
  };
  const pill = (p, w) => `<span role="listitem" class="tbx-ck${p === true ? " is-ok" : p === false ? " is-bad" : ""}">${p === true ? "✓ " : p === false ? "✗ " : ""}${esc(w)}</span>`;
  Bench.prototype.taskLine = function () {
    const t = this.task, d = t.def;
    this.refuse(null);
    const names = d.turn.length < 3 ? d.turn.map(m => "Your turn: " + m.name) : d.turn.map(m => m.name);
    names.unshift("Show me");
    const now = t.stage === "card" || t.stage === "show" ? 0 : t.stage === "done" ? names.length : 1 + t.m;
    this.el.steps.innerHTML = names.map((s, i) =>
      `<li class="${i < now ? "is-done" : i === now ? "is-now" : ""}"${i === now ? ' aria-current="step"' : ""}>${i < now ? "✓ " : ""}${i + 1} ${esc(s)}</li>`).join("");
    let html = "";
    if (t.stage === "card" || t.stage === "show") html = d.showLine;
    else if (t.stage === "done") html = "<b>Task done.</b>";
    else {
      const m = d.turn[t.m];
      html = m.ask;
      if (t.phase && t.phase !== "before") {
        if (m.kind === "look") html += ` <span class="tbx-checks" role="list" aria-label="Checks">` + m.checks.map(c => pill(t.looks[c.id] ? true : undefined, c.name)).join("") + `</span>`;
        else {
          if ((t.reads || []).length > 1) html += ` <span class="tbx-checks tbx-rds" role="list" aria-label="Readings">` + t.reads.map(r => pill(t.rows[r.id] ? true : undefined, r.name)).join("") + `</span>`;
          const ch = this.taskChecks(t.focus);
          if (ch.length) html += ` <span class="tbx-checks" role="list" aria-label="Steps, marked when you take the reading">` + ch.map(([k, w]) => pill(t.pills[k], w)).join("") + `</span>`;
        }
      }
    }
    this.el.should.innerHTML = html;
  };
  Bench.prototype.taskLocked = function () {
    const t = this.task;
    if (this.auto) return false;
    if (t.stage === "turn" && (t.phase === "measure" || t.phase === "read")) return false;
    if (t.stage === "card") this.refuse("Read the task card first", "Then tap <b>Start: Show me</b>.");
    else if (t.stage === "show") this.refuse("Watch first", "The bench does Show me. Tap <b>Next step</b>, or <b>Skip to Your turn</b>.");
    else if (t.stage === "done") this.refuse("Task done", "Tap <b>Try again</b>, <b>Watch Show me again</b> or <b>All tasks</b>.");
    else if (t.phase === "before") this.refuse("Predict first", "Choose an answer to the question under the board. Then you can test.");
    else if (t.phase === "after") this.refuse("Question first", "Choose an answer to the question under the board. Then you can go on.");
    return true;
  };

  /* -- the task card */
  Bench.prototype.taskCard = function () {
    const t = this.task, d = t.def;
    this.showPop(`<div class="tbx-card is-modal" role="dialog" aria-modal="true" aria-labelledby="${this.id}-tc">
      <div class="tbx-card-k">Task ${t.n + 1} · ${esc(d.test)}</div>
      <h2 id="${this.id}-tc">${esc(d.title)}</h2>
      <p>${esc(d.card)}</p>
      <p class="tbx-card-s">${esc(d.pre)}</p>
      <button type="button" class="tbx-go" data-job="show">Start: Show me</button></div>`, true);
  };

  /* -- Show me: the bench does the test once, a sentence for each step */
  Bench.prototype.taskShow = function () {
    const t = this.task, d = t.def;
    this.taskStop();
    this.el.pop.hidden = true;
    if (t.stage !== "card") { t.stage = "show"; this.taskBoard(d.showScenario || d.scenario, d.seed); }
    t.stage = "show"; t.step = -1; t.pills = {};
    this.st.view = "board"; this.st.side = "comp"; this.drawBoard(); this.syncControls();
    this.el.under.hidden = true; this.el.jobpanel.hidden = false;
    this.taskLine(); this.techLine();
    this.feedback(null, "Show me", "Watch each step. The bench does the test once.");
    this.taskShowNext();
  };
  Bench.prototype.taskShowNext = function () {
    const t = this.task, s = t.def.show[t.step + 1];
    if (t.busy || !s) return;
    t.step++;
    t.busy = true;
    this.taskHL(null);
    this.taskShowPanel();
    const ops = [].concat(s.do || []);
    const run = i => i >= ops.length ? (t.busy = false, this.taskShowPanel(), this.taskHL(s.hl)) : this.taskDo(ops[i], () => run(i + 1));
    run(0);
  };
  Bench.prototype.taskShowPanel = function () {
    const t = this.task, S = t.def.show, s = S[t.step], last = t.step === S.length - 1;
    const text = s.say.replace(/\{v\}/g, t.busy ? "…" : this.taskReading());
    this.el.jobpanel.innerHTML =
      `<div class="tbx-q"><span class="tbx-qn">Show me · step ${t.step + 1} of ${S.length}.</span> ${text}</div>
       <div class="tbx-opts">${last ? `<button type="button" class="tbx-go" data-job="turn">Your turn</button>`
         : `<button type="button" class="tbx-go" data-job="shownext"${t.busy ? " disabled" : ""}>Next step</button>`}
         <button type="button" data-job="show">Replay</button>${last ? "" : `<button type="button" data-job="turn">Skip to Your turn</button>`}</div>`;
    if (!t.busy) {
      this.say(text.replace(/<[^>]+>/g, ""));
      const go = this.el.jobpanel.querySelector(".tbx-go");
      if (go && t.step > 0) go.focus({ preventScroll: true });
    }
  };
  /* what the meter or the probe shows now, in words */
  Bench.prototype.taskReading = function () {
    const st = this.st;
    if (st.tool === "probe") {
      const p = this.b.probeRead() || {};
      return !p.live ? "no lights" : p.hi ? "Hi (red)" : p.lo ? "Lo (green)" : "no lights";
    }
    const rd = this.b.read(0);
    if (!rd || rd.fuse) return "…";
    if (rd.over || rd.open) return "1";
    return rd.text + " " + unitOf(st.dial) + (rd.beep ? ", beep" : "");
  };
  /* one Show me action, then done(); the dial turns a step at a time and a lead
     travels to its point, unless motion is reduced */
  Bench.prototype.taskDo = function (op, done) {
    const st = this.st, fast = reduced();
    this.auto = true;
    const end = () => { this.auto = false; done(); };
    if (!op) return end();
    if (op.dial) {
      const D = TB.meter.DIAL, n = D.length, fwd = (D.indexOf(op.dial) - D.indexOf(st.dial) + n) % n, dir = fwd <= n / 2 ? 1 : -1;
      const tick = () => {
        if (fast) st.dial = op.dial;
        if (st.dial === op.dial) { this.instrumentChanged("now"); return end(); }
        st.dial = D[(D.indexOf(st.dial) + dir + n) % n];
        this.meterSet(); this.drawMeter();
        this.showT = setTimeout(tick, 110);
      };
      return tick();
    }
    if (op.sock) { st.sock = op.sock; this.instrumentChanged("now"); return end(); }
    if (op.power !== undefined) { this.setPower(op.power); return end(); }
    if (op.input) { for (const [k, v] of Object.entries(op.input)) this.setInput(k, v); return end(); }
    if (op.tool) { this.setTool(op.tool); return end(); }
    if (op.pmode) { st.pmode = op.pmode; this.probeChanged(); return end(); }
    if (op.pmem !== undefined) { st.pmem = op.pmem; st.memLit = false; this.probeChanged(); return end(); }
    if (op.tip) { st.tip = op.tip; st.memLit = false; this.b.probe({ tip: st.tip, mode: st.pmode }); this.drawLeads(); this.measured("tap"); return end(); }
    if (op.lift) { this.liftAt({ pt: op.lift, kind: "pin" }); return end(); }
    if (op.flip) { st.side = st.side === "comp" ? "copper" : "comp"; st.view = "board"; this.drawBoard(); this.syncControls(); return end(); }
    if (op.look) { this.look(op.look); return end(); }
    if (op.lead) {
      st.next = op.lead; this.syncControls();
      return this.flyTo(op.lead, op.at, () => { st[op.lead] = op.at; this.instrumentChanged("tap"); end(); });
    }
    end();
  };
  Bench.prototype.flyTo = function (lead, k, done) {
    if (reduced() || this.st.view !== "board" || this.st.side !== "comp") return done();
    const vb = this.vb, to = this.posOf(k), from = { x: vb.x + vb.w - 6, y: vb.h * (lead === "red" ? .58 : .66) };
    const t0 = performance.now(), dur = 700;
    const frame = now => {
      const f = Math.min(1, (now - t0) / dur), e = f < .5 ? 2 * f * f : 1 - Math.pow(2 - 2 * f, 2) / 2;
      this.flyLead = { lead, p: { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e } };
      this.drawLeads();
      if (f < 1) this.flyRaf = requestAnimationFrame(frame);
      else { this.flyLead = null; done(); }
    };
    this.flyRaf = requestAnimationFrame(frame);
  };
  /* ring what the step is about; "q:<selector>" for anything else */
  Bench.prototype.taskHL = function (hl) {
    this.root.querySelectorAll(".is-hl").forEach(e => e.classList.remove("is-hl"));
    const q = s => this.root.querySelector(s);
    (hl || "").split(" ").filter(Boolean).forEach(h => {
      const el = h === "meter" ? q(".tbx-inst") : h === "dial" ? q(".tbx-dialrow") : h === "sock" ? q('.tbx-meter [data-sock="V/Ω"]') : h === "sockA" ? q('.tbx-meter [data-sock="A"]')
        : h === "next" ? q(".tbx-leadrow .tbx-seg") : h === "power" ? q("[data-power]") : h === "probe" ? q(".tbx-proberow") : h.indexOf("tool:") === 0 ? q(`[data-tool="${h.slice(5)}"]`)
        : h.indexOf("tp:") === 0 ? q(`.tbx-tps [data-pt="${h.slice(3)}"]`) : h.indexOf("in:") === 0 ? q(`[data-input="${h.slice(3)}"][aria-pressed="true"]`)
        : h.indexOf("q:") === 0 ? q(h.slice(2)) : null;
      if (el) el.classList.add("is-hl");
    });
  };

  /* -- Your turn: for each item, questions before, readings, questions after */
  Bench.prototype.taskTurn = function () {
    const t = this.task, d = t.def;
    this.taskStop();
    this.taskHL(null);
    this.el.pop.hidden = true;
    Object.assign(t, { stage: "turn", m: 0, v: {}, cross: 0, firstQ: true, carry: { ok: 0, bad: 0, safety: 0 }, seed: String(Date.now() % 1e9) });
    this.taskBoard(d.turn[0].scenario || d.scenario, t.seed);
    t.carry = { ok: 0, bad: 0, safety: 0 };
    this.taskItem();
  };
  Bench.prototype.taskItem = function () {
    const t = this.task, d = t.def, m = d.turn[t.m], sc = m.scenario || d.scenario;
    if (sc !== this.sc.id) this.taskBoard(sc, t.seed);
    Object.assign(t, { reads: this.taskReads(m), rows: {}, looks: {}, lookJoints: new Set(), reported: new Set(), pills: {}, caught: null });
    t.focus = t.reads[0];
    const qs = beforeQs(m);
    if (qs.length) this.taskQs(qs, "before"); else this.taskMeasure();
  };
  Bench.prototype.taskQs = function (list, stage) {
    const t = this.task, m = t.def.turn[t.m];
    Object.assign(t, { phase: stage, qList: list, qi: 0 });
    if (stage === "before" && !m.boardView) { this.st.view = "circuit"; this.drawBoard(); this.syncControls(); }
    this.el.under.hidden = true; this.el.jobpanel.hidden = false;
    this.taskLine(); this.techLine();
    this.taskQ();
  };
  Bench.prototype.taskQ = function () {
    const t = this.task, Q = t.qList[t.qi];
    t.q = { Q, order: shuffle(Q.opts.map((_, i) => i)) };
    const head = t.phase === "before" ? ["Predict first", "Use the circuit diagram. Then you can test."]
      : Q.label === "Another board" ? ["Another board", "A reading from a board with a fault. Is it normal?"] : [Q.label || "Question", "Look at your reading on the meter and in the log."];
    this.feedback(null, head[0], head[1]);
    this.el.jobpanel.innerHTML =
      `<div class="tbx-q">${tval(Q.q, t.v)}</div>
       <div class="tbx-opts" role="group" aria-label="Options">${t.q.order.map(i => `<button type="button" data-job="topt:${i}">${esc(tval(Q.opts[i].t, t.v))}</button>`).join("")}</div>
       <div class="tbx-qfb" aria-live="polite"></div>`;
  };
  Bench.prototype.taskNextWord = function () {
    const t = this.task, d = t.def;
    return t.m === d.turn.length - 1 ? ["finish", "Finish"] : ["tnext", "Next: " + d.turn[t.m + 1].name];
  };
  Bench.prototype.taskOption = function (i, btn) {
    const t = this.task, o = t.q.Q.opts[i], fb = this.el.jobpanel.querySelector(".tbx-qfb");
    btn.classList.add(o.key ? "is-right" : "is-wrong");
    fb.className = "tbx-qfb " + (o.key ? "is-ok" : "is-bad");
    fb.innerHTML = tval(o.fb, t.v);
    if (!o.key) { btn.disabled = true; if (t.phase === "after") t.firstQ = false; return; }
    this.el.jobpanel.querySelectorAll("[data-job^=topt]").forEach(b => { b.disabled = true; });
    const more = t.qi < t.qList.length - 1, nq = more && t.qList[t.qi + 1];
    const [act, word] = more ? ["qnext", "Next: " + (nq.label === "Another board" ? "another board" : (nq.label || "question").toLowerCase())]
      : t.phase === "before" ? ["measure", "Start testing"] : this.taskNextWord();
    fb.insertAdjacentHTML("beforeend", ` <button type="button" class="tbx-go" data-job="${act}">${esc(word)}</button>`);
    fb.querySelector("button").focus({ preventScroll: true });
  };
  Bench.prototype.taskMeasure = function () {
    const t = this.task, m = t.def.turn[t.m];
    t.phase = "measure";
    this.st.view = "board"; this.drawBoard(); this.syncControls();
    this.taskPanel();
    this.taskLine();
    this.feedback(null, "Your turn", m.hint || "");
  };
  /* an item's own panel (a parts list, a pin-out, the truth table) takes the log's place */
  Bench.prototype.taskPanel = function () {
    const t = this.task, m = t.def.turn[t.m];
    const html = m.panel ? tval(m.panel, this.taskPanelData()) : "";
    this.el.jobpanel.hidden = !html; this.el.under.hidden = !!html;
    if (html) this.el.jobpanel.innerHTML = `<div class="tbx-tpanel">${html}</div>`;
  };
  Bench.prototype.taskPanelData = function () {
    const t = this.task, out = {};
    for (const r of t.reads) if (t.rows[r.id]) out[r.id] = t.v[r.id] || t.rows[r.id].reading || "…";
    return out;
  };
  /* the net a target names: a point, or { under: k }, the strip under a lifted end */
  Bench.prototype.taskNet = function (spec) {
    return spec && spec.under ? this.G.net(this.holeOf(spec.under)) : this.netOf(spec);
  };
  Bench.prototype.taskLifted = function (spec) {
    const L = this.st.lifted;
    return spec.indexOf(".") > 0 || isLinkEnd(spec) ? L.indexOf(spec) >= 0 : L.some(k => k.indexOf(spec + ".") === 0);
  };
  /* A reading was taken (from mark). At one of the item's readings, every step
     is marked; the first one wrong is said, unless the bench has said it already. */
  Bench.prototype.taskRow = function (kind) {
    const t = this.task, st = this.st;
    if (t.stage !== "turn") return;
    /* a reading again after this one is done: keep what comes next on screen */
    if (t.phase === "read" && t.caught) { if (kind === "ok") this.taskCaught(...t.caught); return; }
    if (t.phase !== "measure") return;
    const m = t.def.turn[t.m], probe = st.tool === "probe";
    if (st.tool !== "meter" && !probe) return;
    /* which of the item's readings this is: by its points, then by the switches */
    const match = r => {
      if ((r.kind === "probe") !== probe || r.kind === "power") return null;
      if (probe) return this.taskNet(r.tip) === this.netOf(st.tip) ? "fwd" : null;
      const nr = this.netOf(st.red), nb = this.netOf(st.black), na = this.taskNet(r.red), nk = this.taskNet(r.black);
      return nr === na && nb === nk ? "fwd" : nr === nk && nb === na ? "rev" : null;
    };
    const setOk = r => Object.entries(r.set || {}).every(([k, v]) => st.inputs[k] === v);
    const hits = t.reads.filter(r => match(r));
    if (!hits.length) {
      if (kind === "ok" && m.where) this.el.fb.insertAdjacentHTML("beforeend", `<p class="tbx-block">${m.where}</p>`);
      return;
    }
    const pend = hits.filter(r => !t.rows[r.id]);
    const r = pend.find(setOk) || pend[0] || hits.find(setOk) || hits[0], way = match(r);
    if (t.rows[r.id]) { if (kind === "ok" && t.caught) this.taskCaught(...t.caught); return; }
    t.focus = r;
    /* stage by stage (L9): an earlier stage first */
    if (m.ordered && t.reads.some(x => !t.rows[x.id] && (x.stage || 0) < (r.stage || 0))) {
      if (kind === "ok" && !this.soft) t.cross++;
      this.taskLine(); this.techLine();
      if (kind === "ok") this.feedback("bad", "✗ Not in order", m.orderMsg);
      return;
    }
    const [g, rng] = st.dial.split(" "), rd = probe ? {} : this.b.read(0) || {}, P = {}, why = [];
    const val = isFinite(rd.value) ? Math.abs(rd.value) : NaN;
    if (probe) {
      const fam = this.probeFamily();
      P.dial = st.pmode === fam;
      if (!P.dial) why.push("Probe: set <b>" + fam + "</b> for this chip.");
      P.sock = !st.pmem;
      if (!P.sock) why.push("Probe: use <b>Pulse</b>, not MEM.");
      P.tip = true;
    } else {
      const dialList = r.dial && [].concat(r.dial);
      P.dial = r.kind === "dcv" ? g === "DCV" && rng !== "D" && rng !== "200" && rng !== "1000" && !rd.over
        : r.kind === "cont" ? st.dial === "OHM 200"
        : r.kind === "diode" ? st.dial === "DCV D"
        : r.kind === "ohm" ? (dialList ? dialList.indexOf(st.dial) >= 0 : g === "OHM" && rng !== "200" && !rd.over && !(val < FULL[rng] / 100))
        : r.kind === "amps" ? (dialList ? dialList.indexOf(st.dial) >= 0 : g === "DCA" && rng !== "20" && !rd.over) : false;
      if (!P.dial) why.push(r.dialMsg || (r.kind === "dcv" ? (g !== "DCV" || rng === "D" ? "Dial: a voltage is measured on <b>DCV</b>." : rd.over ? "Dial: 1 on the left means over range. Turn up to <b>DCV 20</b>."
          : "Dial: DCV " + rng + " shows fewer decimal places. <b>DCV 20</b> is the range just above 5 V.")
        : r.kind === "cont" ? "Dial: continuity is <b>OHM 200</b>, the setting that beeps."
        : r.kind === "diode" ? "Dial: the diode check is the <b>diode symbol</b>, next to DCV 200m."
        : r.kind === "amps" ? (g !== "DCA" ? "Dial: current is measured on <b>DCA</b>." : "Dial: use <b>" + dialList[0] + "</b>, the range just above the current.")
        : "Dial: use <b>" + (dialList ? dialList[0] : "the lowest OHM range that shows a value") + "</b>."));
      P.sock = st.sock === (r.kind === "amps" ? "A" : "V/Ω");
      if (!P.sock) why.push(r.kind === "amps" ? "Red lead socket: for a current, the red lead goes in <b>A</b>." : "Red lead socket: for this test, the red lead goes in <b>V/Ω</b>.");
      if (r.polar) { P.black = P.red = way === "fwd"; if (way === "rev") why.push(r.revMsg || "Leads: they are the wrong way round, so the reading has a minus sign. Tap <b>Swap</b>."); }
      else P.leads = true;
    }
    P.power = ON_KINDS[r.kind] ? st.power : !st.power;
    if (!P.power) why.push(ON_KINDS[r.kind] ? "Power: switch on." : "Power: switch off. This test is done with the power off.");
    if (r.lift) { P.lift = this.taskLifted(r.lift); if (!P.lift) why.push(r.liftMsg || "Lift a leg first, with the power off."); }
    if (r.unlift) { P.unlift = !this.taskLifted(r.unlift); if (!P.unlift) why.push(r.unliftMsg || "Solder the lifted leg back first."); }
    for (const [k, v] of Object.entries(r.set || {})) {
      P["in:" + k] = st.inputs[k] === v;
      if (!P["in:" + k]) why.push(r.setMsg || (this.inputName(k) + ": set it to " + this.inputWord(k, v) + " for this reading."));
    }
    t.pills = P;
    const ok = Object.values(P).every(Boolean);
    if (!ok && kind === "ok" && !this.soft) t.cross++;
    this.taskLine(); this.techLine();
    /* the marked steps show the bench's ticks, so the box keeps to the one thing to do */
    if (!ok) { if (kind === "ok") this.feedback("bad", "✗ Not quite", why[0]); return; }
    if (kind !== "ok") return;
    t.rows[r.id] = st.log[st.log.length - 1];
    if (!probe) t.v[r.id] = rd.over || rd.open ? "1" : rd.text + " " + unitOf(st.dial) + (rd.beep ? ", beep" : "");
    this.taskLine();
    this.taskCaught(probe ? r.name + ": reading taken. Watch the probe's lights." : esc(r.name) + " reads <b>" + esc(t.v[r.id]) + "</b>.");
  };
  /* one reading or check done: the next, or what comes after the item */
  Bench.prototype.taskCaught = function (said, head) {
    const t = this.task, m = t.def.turn[t.m];
    t.caught = [said, head];
    /* a probe's reading settles in the log a moment after the tap */
    if (m.panel) { this.taskPanel(); clearTimeout(this.panelT); this.panelT = setTimeout(() => { if (this.task === t && (t.phase === "measure" || t.phase === "read")) this.taskPanel(); }, 1500); }
    const left = m.kind === "look" ? m.checks.filter(c => !t.looks[c.id]) : t.reads.filter(r => !t.rows[r.id]);
    head = head || "✓ Every step right";
    if (left.length) { this.feedback("ok", head, said + " Next: " + esc(left[0].name) + "."); return; }
    t.phase = "read";
    const aq = afterQs(m), [act, word] = aq.length ? ["after", aq[0].label || "Next"] : this.taskNextWord();
    this.feedback("ok", head, said + ` <button type="button" class="tbx-go" data-job="${act}">${esc(word)}</button>`);
  };
  Bench.prototype.taskAfter = function () {
    const t = this.task, m = t.def.turn[t.m];
    for (const r of t.reads) if (r.kind === "probe" && t.rows[r.id]) t.v[r.id] = t.rows[r.id].reading || "no lights";
    this.taskQs(afterQs(m), "after");
  };
  /* the task asks for this reading the "wrong" way round on purpose (L6) */
  Bench.prototype.taskWants = function (a, b) {
    const t = this.task;
    if (!t || t.stage !== "turn" || t.phase !== "measure") return false;
    return t.reads.some(r => r.kind === "diode" && !t.rows[r.id] && this.taskNet(r.red) === this.netOf(a) && this.taskNet(r.black) === this.netOf(b));
  };
  /* L2: switching on is the last step, after every short check */
  Bench.prototype.taskPower = function (on) {
    const t = this.task;
    if (!on || !t || t.stage !== "turn" || t.phase !== "measure") return;
    const m = t.def.turn[t.m], r = t.reads.find(x => x.kind === "power");
    if (!t.def.turn.some(x => (x.reads || []).some(y => y.kind === "power") || x.kind === "power")) return;
    if (!r) {
      t.cross++; this.techLine();
      this.feedback("bad", "✗ Not yet", t.def.powerMsg);
      return;
    }
    t.rows[r.id] = { reading: "on" };
    this.taskLine();
    this.taskCaught("Power on, after every short check.");
  };
  /* L1: Look, then Matches or Report a problem (T19) */
  Bench.prototype.taskLook = function (key) {
    const t = this.task;
    if (!t || t.stage !== "turn" || t.phase !== "measure" || t.def.turn[t.m].kind !== "look") return;
    t.lookKey = key;
    this.el.fb.insertAdjacentHTML("beforeend", `<div class="tbx-opts"><button type="button" class="tbx-go" data-job="lkok">Matches</button><button type="button" data-job="lkrep">Report a problem</button></div>`);
  };
  Bench.prototype.taskCheckOf = function (key) {
    const t = this.task, m = t.def.turn[t.m], F = this.F;
    const cop = key.indexOf("copper:") === 0 ? key.slice(7) : null, h = cop && S.parseRef(cop);
    for (const c of m.checks) {
      if (t.looks[c.id]) continue;
      if (c.keys && c.keys.indexOf(key) >= 0) return c;
      if (c.cut && cop && F.layout.cuts.some(x => { const q = S.parseRef(x); return q.r === h.r && Math.abs(q.c - h.c) <= 1; })) return c;
      if (c.joints && cop) { const j = this.jointAt(cop); if (j && !F.dry.has(j) && !t.lookJoints.has(cop)) return c; }
    }
    return null;
  };
  Bench.prototype.taskLookAnswer = function (ok) {
    const t = this.task, key = t.lookKey;
    if (!key) return;
    const c = this.taskCheckOf(key);
    t.lookKey = null;
    if (!ok) {
      if (!t.reported.has(key)) { t.reported.add(key); t.cross++; this.techLine(); }
      this.feedback("bad", "✗ This is fine: check again", c ? c.ok : "Compare it with the parts list and the circuit again. This board is good.");
      return;
    }
    if (!c) { this.feedback(null, "Matches", "Right: that one is fine. It is not on the checklist."); return; }
    if (c.joints) { t.lookJoints.add(key.slice(7)); if (t.lookJoints.size < c.joints) { this.feedback("ok", "✓ Matches", c.ok + " " + t.lookJoints.size + " of " + c.joints + " joints."); return; } }
    t.looks[c.id] = true;
    this.taskLine();
    this.taskCaught("<b>" + esc(c.name) + ":</b> " + c.ok, "✓ Matches");
  };
  Bench.prototype.taskFinish = function () {
    const t = this.task, st = this.st, d = t.def;
    t.stage = "done"; t.phase = null;
    const tot = this.taskTally(), safe = !tot.safety, first = safe && !tot.bad && !t.cross && t.firstQ;
    const rec = Object.assign({ tries: 0, first: false, passed: false }, this.taskDone[d.id]);
    if (!rec.tries) rec.first = first;
    rec.tries++;
    rec.passed = rec.passed || safe;
    this.taskDone[d.id] = rec;
    try { localStorage.setItem(TASK_KEY, JSON.stringify(this.taskDone)); } catch (e) { /* kept for this visit only */ }
    /* Bench Tester: every task passed (a safe try), counted over the nine on this device */
    if (window.Progress && Progress.record) Progress.record("tst-lt", this.tasks.order.filter(o => (this.taskDone[o.id] || {}).passed).length, this.tasks.order.length);
    t.result = { safe, first };
    this.taskLine(); this.techLine();
    this.el.jobpanel.hidden = true; this.el.under.hidden = false;
    this.feedback(safe ? "ok" : "bad", safe ? "✓ Task done" : "✗ Not passed", safe ? (first ? "Every step right first time." : "All the tests done and judged.") : "There was a safety error. Try again.");
    this.taskDoneCard();
  };
  /* the run's ticks, crosses and safety errors, over every board it used */
  Bench.prototype.taskTally = function () {
    const t = this.task, st = this.st, c = t.carry || { ok: 0, bad: 0, safety: 0 };
    return { ok: c.ok + st.ok, bad: c.bad + st.bad, safety: c.safety + st.safety };
  };
  Bench.prototype.taskDoneCard = function () {
    const t = this.task, d = t.def, { safe, first } = t.result, rec = this.taskDone[d.id], tot = this.taskTally();
    const lines = Object.keys(t.v).length ? `<p>${d.turn.map(m => this.taskReads(m).filter(r => t.v[r.id]).map(r => esc(r.name) + ": " + esc(t.v[r.id])).join(" · ")).filter(Boolean).join(" · ")}</p>` : "";
    this.showPop(`<div class="tbx-card is-modal" role="dialog" aria-modal="true" aria-labelledby="${this.id}-td">
      <h2 id="${this.id}-td">Task ${t.n + 1} ${safe ? "done" : "not passed"}</h2>
      ${lines}
      <p>Technique: ${tot.ok} ✓, ${tot.bad + t.cross} ✗.${tot.safety ? " Safety errors: " + tot.safety + "." : ""}</p>
      <p>${!safe ? "✗ A safety error means this try cannot pass." : first ? "✓ Every step right " + (rec.tries > 1 ? "this time." : "first time.") : "✓ Passed. Some steps took more than one go."}</p>
      <p class="tbx-card-s">${rec.tries > 1 ? "Your score counts your first try at this task: " + (rec.first ? "right first time." : "not right first time.") : ""}</p>
      <div class="tbx-opts"><button type="button" class="tbx-go" data-job="again">Try again</button><button type="button" data-job="show">Watch Show me again</button><button type="button" data-job="list">All tasks</button></div></div>`, true);
  };
  /* all nine tasks, open from the start (T6) */
  Bench.prototype.taskList = function () {
    const O = this.tasks.order, done = this.taskDone;
    const firsts = O.filter(o => (done[o.id] || {}).first).length;
    this.taskStop();
    this.showPop(`<div class="tbx-card is-modal" role="dialog" aria-modal="true" aria-labelledby="${this.id}-tl">
      <h2 id="${this.id}-tl">Learn to Test</h2>
      <p>One task for each type of test. Right first time: <b>${firsts} of ${O.length}</b>.</p>
      <p>Pass all ${O.length}, with no safety errors, to earn the Bench Tester badge.</p>
      <ol class="tbx-tl">${O.map((o, i) => { const r = done[o.id] || {}, live = !o.soon && this.tasks[o.id];
        return `<li>${live ? `<button type="button" data-job="task:${o.id}">${i + 1} ${esc(o.test)}</button>` : `<span class="tbx-tl-soon">${i + 1} ${esc(o.test)}: coming soon</span>`}` +
          `<span class="tbx-tl-r">${r.first ? "✓ right first time" : r.passed ? "✓ passed" : ""}</span></li>`; }).join("")}</ol>
      <button type="button" data-job="closelist">Close</button></div>`, true);
  };
  Bench.prototype.taskAct = function (a, btn) {
    const t = this.task;
    if (!t) return;
    if (a.indexOf("topt:") === 0) return this.taskOption(+a.slice(5), btn);
    if (a.indexOf("task:") === 0) return this.openTask(a.slice(5));
    switch (a) {
      case "show": return this.taskShow();
      case "shownext": return this.taskShowNext();
      case "turn": return this.taskTurn();
      case "measure": return this.taskMeasure();
      case "after": if (t.phase === "read") this.taskAfter(); return;
      case "qnext": t.qi++; return this.taskQ();
      case "tnext": if (t.phase === "read" || t.phase === "after") { t.m++; this.taskItem(); } return;
      case "finish": return this.taskFinish();
      case "again": return this.taskTurn();
      case "list": return this.taskList();
      case "lkok": return this.taskLookAnswer(true);
      case "lkrep": return this.taskLookAnswer(false);
      case "closelist":
        this.el.pop.hidden = true;
        if (t.stage === "card") this.taskCard();
        else if (t.stage === "done") this.taskDoneCard();
        else if (t.stage === "show") { t.step = Math.max(-1, t.step - 1); this.taskShowNext(); }
        return;
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
        /* ?scenario=greenhouse&fault=s3: any board, no jobs, for testing (§16) */
        const free = q.get("scenario"), attr = n => free ? null : el.getAttribute(n);
        el.tbx = new Bench(el, {
          scenario: free || el.getAttribute("data-test-bench"), fault: q.get("fault") || q.get("board") || attr("data-fault") || "good",
          seed: q.get("seed"), title: attr("data-title"), sub: attr("data-sub"), should: attr("data-should")
        });
        const jobs = el.getAttribute("data-jobs");
        if (jobs && window.TBJobs && !q.get("board") && !q.get("scenario")) el.tbx.startJobs(window.TBJobs, jobs.split(/[\s,]+/), (parseInt(q.get("job"), 10) || 1) - 1);
        /* Learn to Test: ?task=l3 opens one task */
        if (el.hasAttribute("data-tasks") && window.TBTasks && !free) el.tbx.startTasks(window.TBTasks, q.get("task") || el.getAttribute("data-task"));
      } catch (e) {
        el.textContent = "The test bench could not start: " + e.message;
        if (window.console) console.error(e);
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
