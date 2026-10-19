/* ============================================================
   testing-bench.js — Block 6 Lesson 1 (classes/electronics/testing.html).

     [data-meter="DCV 20"]      the class multimeter (SATZ DT3900G /
                                Metex M-3800 — the booklet's drawing)
     #meterGuide                 setting buttons that turn a meter's dial
     [data-probe-head="hi"]      a small logic-probe head: hi, lo, flash, none
     #bench                      the test bench and Probe Detective, on the
                                 555 astable practice board

   The board is the Block 6 astable stripboard, /assets/guides/555-astable.json
   (written by tools/build-guides, checked with SBD.check before drawing).
   Readings follow the booklet: T1 +5 V, T2 0 V, T3 pin 3 (logic probe only; the meter is blocked there: about 0 V, then
   3.5 to 5 V), T4 C1 (rises and falls between about 1.7 V and 3.3 V).
   ============================================================ */
(function () {
  "use strict";
  var ENGINE = "/assets/js/stripboard.js?v=sbd-20261013a";
  var GUIDE = "/assets/guides/555-astable.json";
  var BADGE = "tst-ff";
  function $(id) { return document.getElementById(id); }
  function reduced() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* ---------------------------------------------------------- the meter */
  var SEQ = [];
  [["OHM", ["200", "2k", "20k", "200k", "2M", "20M"]],
   ["DCV", ["D", "200m", "2", "20", "200", "1000"]],
   ["ACV", ["750", "200", "20", "2", "200m"]],
   ["ACA", ["20µ", "200µ", "2m", "20m", "200m", "2", "20"]],
   ["DCA", ["20", "2", "200m", "20m", "2m", "200µ", "20µ"]],
   ["hFE", [""]]].forEach(function (g) { g[1].forEach(function (lab) { SEQ.push([g[0], lab]); }); });
  var STEP = 360 / SEQ.length, A0 = -2.5 * STEP, CX = 380, CY = 520, KR = 160;
  function slot(group, lab) { for (var i = 0; i < SEQ.length; i++) { if (SEQ[i][0] === group && SEQ[i][1] === lab) { return i; } } return 9; }
  var SETTINGS = {
    "DCV 20": { slot: slot("DCV", "20"), red: "V/Ω" },
    "DCV 2": { slot: slot("DCV", "2"), red: "V/Ω" },
    "DCV 200": { slot: slot("DCV", "200"), red: "V/Ω" },
    "OHM 20k": { slot: slot("OHM", "20k"), red: "V/Ω" },
    "OHM 2k": { slot: slot("OHM", "2k"), red: "V/Ω" },
    "Continuity": { slot: slot("OHM", "200"), red: "V/Ω" },
    "Diode check": { slot: slot("DCV", "D"), red: "V/Ω" },
    "DCA 20m": { slot: slot("DCA", "20m"), red: "A" },
    "ACV 750": { slot: slot("ACV", "750"), red: "V/Ω" },
    "hFE": { slot: slot("hFE", ""), red: "none" }
  };
  var SOCK = { "20A": 165, "A": 285, "COM": 475, "V/Ω": 595 }, SY = 900;
  function pol(r, deg) { var a = deg * Math.PI / 180; return [CX + r * Math.sin(a), CY - r * Math.cos(a)]; }
  function n1(x) { return Math.round(x * 10) / 10; }
  function arcPath(r0, r1, lo, hi) {
    var a = pol(r1, lo), b = pol(r1, hi), c = pol(r0, hi), d = pol(r0, lo), big = (hi - lo) > 180 ? 1 : 0;
    return "M" + n1(a[0]) + " " + n1(a[1]) + " A" + r1 + " " + r1 + " 0 " + big + " 1 " + n1(b[0]) + " " + n1(b[1]) +
      " L" + n1(c[0]) + " " + n1(c[1]) + " A" + r0 + " " + r0 + " 0 " + big + " 0 " + n1(d[0]) + " " + n1(d[1]) + " Z";
  }
  function leadPath(x) { return "M" + x + " " + (SY + 12) + " C" + x + " 990 " + x + " 1000 " + (x + (x > 400 ? 40 : -40)) + " 1040"; }

  function meterSVG(label) {
    var s = '<svg class="tb-meter" viewBox="0 0 960 1050" role="img" aria-label="' + esc(label) + '"><title>' + esc(label) + "</title>";
    s += '<rect class="m-body" x="30" y="10" width="700" height="960" rx="50"/>';
    s += '<rect class="m-lcd" x="170" y="40" width="420" height="140" rx="14"/>';
    s += '<text class="m-digits" x="572" y="146" text-anchor="end">5.02</text>';
    s += '<rect class="m-btn" x="60" y="56" width="80" height="60" rx="10"/><text class="m-small" x="100" y="146" text-anchor="middle">ON/OFF</text>';
    var groups = {};
    SEQ.forEach(function (g, k) { (groups[g[0]] = groups[g[0]] || []).push(A0 + k * STEP); });
    Object.keys(groups).forEach(function (g) {
      var lo = Math.min.apply(null, groups[g]) - STEP / 2, hi = Math.max.apply(null, groups[g]) + STEP / 2;
      s += '<path class="m-sector" d="' + arcPath(168, 252, lo, hi) + '"/>';
      var p = pol(286, (lo + hi) / 2);
      s += '<text class="m-group" x="' + n1(p[0]) + '" y="' + n1(p[1] + 9) + '" text-anchor="middle">' + g + "</text>";
    });
    SEQ.forEach(function (g, k) {
      var a = A0 + k * STEP;
      var d = pol(181, a), t = pol(228, a);
      s += '<circle class="m-ink" cx="' + n1(d[0]) + '" cy="' + n1(d[1]) + '" r="4"/>';
      if (g[1] === "D") {
        s += '<g class="m-diode" transform="translate(' + n1(t[0]) + " " + n1(t[1]) + ')"><path d="M-9 -9 L-9 9 L7 0 Z"/><line x1="8" y1="-9" x2="8" y2="9"/></g>';
      } else if (g[1]) {
        s += '<text class="m-range" x="' + n1(t[0]) + '" y="' + n1(t[1] + 7) + '" text-anchor="middle">' + g[1] + "</text>";
      }
      if (g[0] === "OHM" && g[1] === "200") {
        var b = pol(262, a - 5);
        s += '<g class="m-beep" transform="translate(' + n1(b[0]) + " " + n1(b[1]) + ')"><circle r="3"/><path d="M6 -6 A8 8 0 0 1 6 6 M10 -10 A14 14 0 0 1 10 10 M14 -14 A20 20 0 0 1 14 14"/></g>';
      }
    });
    s += '<circle class="m-knob" cx="' + CX + '" cy="' + CY + '" r="' + KR + '"/>';
    s += '<g class="m-pointer"><rect class="m-bar" x="' + (CX - 20) + '" y="' + (CY - 140) + '" width="40" height="280" rx="14"/>' +
      '<line class="m-tip" x1="' + CX + '" y1="' + (CY - 30) + '" x2="' + CX + '" y2="' + (CY - 128) + '"/></g>';
    Object.keys(SOCK).forEach(function (k) {
      var x = SOCK[k], live = k === "COM" || k === "V/Ω";
      s += '<circle class="m-sock" cx="' + x + '" cy="' + SY + '" r="26"/><circle class="' + (live ? "m-ink" : "m-hole") + '" cx="' + x + '" cy="' + SY + '" r="11"/>';
      s += '<text class="m-label" x="' + x + '" y="' + (SY - 44) + '" text-anchor="middle">' + k + "</text>";
    });
    s += '<text class="m-small" x="' + (SOCK.A + 34) + '" y="' + (SY + 9) + '">2A max</text>';
    s += '<path class="m-lead-o" d="' + leadPath(SOCK.COM) + '"/><path class="m-lead m-black" d="' + leadPath(SOCK.COM) + '"/>';
    s += '<path class="m-lead-o m-red-o" d="' + leadPath(SOCK["V/Ω"]) + '"/><path class="m-lead m-red" d="' + leadPath(SOCK["V/Ω"]) + '"/>';
    s += '<text class="m-call m-black-l" x="425" y="1040" text-anchor="end">black lead</text>';
    s += '<text class="m-call m-red-l" x="680" y="1040">red lead</text>';
    s += '<line class="m-callline" x1="592" y1="110" x2="760" y2="110"/><text class="m-call" x="770" y="118">display</text>';
    s += '<line class="m-callline" x1="541" y1="520" x2="760" y2="520"/><text class="m-call" x="770" y="528">dial</text>';
    s += "</svg>";
    return s;
  }
  function setMeter(root, setting, digits) {
    var cfg = SETTINGS[setting] || SETTINGS["DCV 20"], svg = root.querySelector(".tb-meter");
    if (!svg) { return; }
    var ang = A0 + cfg.slot * STEP;
    svg.querySelector(".m-pointer").setAttribute("transform", "rotate(" + n1(ang) + " " + CX + " " + CY + ")");
    var red = cfg.red === "none" ? null : SOCK[cfg.red];
    [].forEach.call(svg.querySelectorAll(".m-red, .m-red-o, .m-red-l, .m-black, .m-lead-o:not(.m-red-o)"), function (el) { el.style.display = red === null ? "none" : ""; });
    svg.querySelector(".m-black-l").style.display = red === null ? "none" : "";
    if (red !== null) {
      svg.querySelector(".m-red").setAttribute("d", leadPath(red));
      svg.querySelector(".m-red-o").setAttribute("d", leadPath(red));
      var rl = svg.querySelector(".m-red-l");
      var bl = svg.querySelector(".m-black-l"), left = red < SOCK.COM;
      rl.setAttribute("x", left ? red - 45 : Math.min(red + 85, 800));
      rl.setAttribute("text-anchor", left ? "end" : "start");
      bl.setAttribute("x", left ? SOCK.COM + 45 : 425);
      bl.setAttribute("text-anchor", left ? "start" : "end");
    }
    if (digits != null) { setDigits(svg, digits); }
  }
  function setDigits(svg, digits) {
    var t = svg.querySelector(".m-digits");
    if (digits === "1") { t.setAttribute("x", "196"); t.setAttribute("text-anchor", "start"); }
    else { t.setAttribute("x", "572"); t.setAttribute("text-anchor", "end"); }
    t.textContent = digits;
  }

  /* ---------------------------------------------------------- probe heads */
  function probeSVG(state, label) {
    var hi = state === "hi" || state === "flash", lo = state === "lo";
    var s = '<svg class="tb-probe is-' + state + '" viewBox="0 0 300 92" role="img" aria-label="' + esc(label) + '"><title>' + esc(label) + "</title>";
    s += '<line class="p-tip" x1="6" y1="40" x2="52" y2="40"/>';
    s += '<path class="p-body" d="M52 30 L78 18 H284 Q296 18 296 30 V50 Q296 62 284 62 H78 L52 50 Z"/>';
    s += '<circle class="p-led p-hi' + (hi ? " on" : "") + '" cx="116" cy="40" r="12"/>';
    s += '<circle class="p-led p-lo' + (lo ? " on" : "") + '" cx="168" cy="40" r="12"/>';
    s += '<text class="p-lab" x="116" y="86" text-anchor="middle">Hi</text><text class="p-lab" x="168" y="86" text-anchor="middle">Lo</text>';
    s += '<rect class="p-sw" x="204" y="30" width="66" height="20" rx="4"/><text class="p-lab" x="237" y="86" text-anchor="middle">Pulse</text>';
    return s + "</svg>";
  }
  function setProbe(svg, hi, lo) {
    if (!svg) { return; }
    svg.querySelector(".p-hi").classList.toggle("on", !!hi);
    svg.querySelector(".p-lo").classList.toggle("on", !!lo);
  }

  /* ---------------------------------------------------------- static figures */
  [].forEach.call(document.querySelectorAll("[data-meter]"), function (el) {
    var set = el.getAttribute("data-meter");
    el.innerHTML = meterSVG(el.getAttribute("data-label") || "The class multimeter");
    setMeter(el, set, el.getAttribute("data-digits") || "5.02");
  });
  [].forEach.call(document.querySelectorAll("[data-probe-head]"), function (el) {
    el.innerHTML = probeSVG(el.getAttribute("data-probe-head"), el.getAttribute("data-label") || "Logic probe");
  });

  /* ---------------------------------------------------------- the setting guide */
  (function () {
    var root = $("meterGuide");
    if (!root) { return; }
    var fig = root.querySelector("[data-meter]"), card = root.querySelector(".mg-card");
    var btns = [].slice.call(root.querySelectorAll("[data-set]"));
    function show(b) {
      btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      setMeter(fig, b.getAttribute("data-set"), b.getAttribute("data-digits"));
      var tpl = b.querySelector("template");
      if (tpl && card) { card.innerHTML = tpl.innerHTML; }
      var svg = fig.querySelector("svg"), lab = "The class multimeter, dial on " + b.textContent.trim() + ". " + (b.getAttribute("data-say") || "");
      svg.setAttribute("aria-label", lab);
      svg.querySelector("title").textContent = lab;
    }
    root.addEventListener("click", function (e) { var b = e.target.closest("[data-set]"); if (b) { show(b); } });
    if (btns[0]) { show(btns[0]); }
  })();

  /* ---------------------------------------------------------- the bench */
  var bench = $("bench");
  if (!bench) { return; }

  /* The 555 astable practice board, 5 V: R1 1 kΩ, R2 10 kΩ, C1 100 µF.
     Charge time ln2 (R1 + R2) C, discharge ln2 R2 C (T ≈ 0.7(R1 + 2R2)C). */
  var VCC = 5, VOH = 3.8, VOL = 0.1;
  function astable(t, c) {
    var tc = (1 + 10) * 1e3 * c, td = 10e3 * c, ch = Math.LN2 * tc, dis = Math.LN2 * td;
    var p = t % (ch + dis);
    if (p < ch) { return { high: true, vc: VCC - (VCC - VCC / 3) * Math.exp(-p / tc) }; }
    return { high: false, vc: (2 * VCC / 3) * Math.exp(-(p - ch) / td) };
  }
  /* Each fault: its readings, what a pupil would see, how to tell it, and the fix. */
  var FAULTS = {
    none: { name: "No fault", state: function (t) { var a = astable(t, 100e-6); return { T1: VCC, T3: a.high ? VOH : VOL, T4: a.vc, led1: a.high, led2: !a.high }; } },
    led1rev: { name: "LED1 (red) is fitted the wrong way round",
      state: function (t) { var a = astable(t, 100e-6); return { T1: VCC, T3: a.high ? VOH : VOL, T4: a.vc, led1: false, led2: !a.high }; },
      sees: "LED1 (red) never lights, LED2 still flashes, and the probe on T3 still flashes",
      cue: "which LED never lights, and whether the probe on T3 still flashes",
      why: "The 555 is working: the probe on T3 still flashes and T4 rises and falls. Only the red LED is dead, so the fault is in its own branch. Check: diode check on LED1, red probe on the long leg." },
    r4big: { name: "R4 is 270 kΩ (red violet yellow), not 270 Ω",
      state: function (t) { var a = astable(t, 100e-6); return { T1: VCC, T3: a.high ? VOH : VOL, T4: a.vc, led1: a.high, led2: false }; },
      sees: "LED2 (green) never lights, LED1 still flashes, and the probe on T3 still flashes",
      cue: "which LED never lights, and whether the probe on T3 still flashes",
      why: "The probe on T3 still flashes, so the 555 works. Only the green LED is dead. With 270 kΩ in its branch the current is tiny (about 0.01 mA), far too small to light it. Check the colour code: 270 Ω is red violet brown." },
    reset0: { name: "Pin 4 (reset) is joined to 0 V, not +5 V",
      state: function () { return { T1: VCC, T3: VOL, T4: 0, led1: false, led2: true }; },
      sees: "pin 3 stuck LOW: the probe on T3 green all the time, LED2 on all the time, and T4 about 0 V",
      cue: "what the probe shows on T3, and what T4 reads",
      why: "Pin 4 is the reset. Held at 0 V, it keeps the 555 reset: the output stays LOW, so LED2 stays on, and C1 is kept empty, so T4 reads 0 V. Fix: join pin 4 to +5 V." },
    r1open: { name: "R1 has a dry joint (open circuit)",
      state: function () { return { T1: VCC, T3: VOH, T4: 0, led1: true, led2: false }; },
      sees: "pin 3 stuck HIGH: the probe on T3 red all the time, LED1 on all the time, and T4 about 0 V",
      cue: "what the probe shows on T3, and what T4 reads",
      why: "C1 charges through R1 and R2. With R1 open it cannot charge, so T4 stays at 0 V. Pin 2 is below a third of the supply, so the output stays HIGH and LED1 stays on. Check: continuity across R1's joints, power off." },
    c1big: { name: "C1 is 1000 µF, not 100 µF",
      state: function (t) { var a = astable(t, 1000e-6); return { T1: VCC, T3: a.high ? VOH : VOL, T4: a.vc, led1: a.high, led2: !a.high }; },
      sees: "the board works but very slowly: each LED stays on for about 7 to 8 s, and T4 creeps up and down",
      cue: "how fast the LEDs take turns",
      why: "Everything switches, so nothing is broken. But each LED stays on for about 7 to 8 s, ten times longer than it should. C1 is in both timing paths, so a capacitor ten times too big makes the flashing ten times slower. Read the value printed on C1." }
  };
  var BANK = ["led1rev", "r4big", "reset0", "r1open", "c1big"];

  var st = { tool: "meter", dial: "DCV 20", red: "V/Ω", power: true, tp: null, mode: "explore", fault: "none",
             round: 0, set: [], score: 0, answered: false, t: 0, lastText: 0 };
  var els = {
    board: $("benchBoard"), lcd: $("benchLcd"), lcdSet: $("benchLcdSet"), probe: $("benchProbe"),
    say: $("benchSay"), where: $("benchWhere"), note: $("benchNote"), meterCtl: $("benchMeterCtl"),
    pd: $("pd"), pdQ: $("pdQ"), pdOpts: $("pdOpts"), pdFb: $("pdFb"), pdNext: $("pdNext"), pdScore: $("pdScore"), leds: $("benchLeds")
  };
  var seen = false;
  function used() { if (seen) { return; } seen = true; if (window.Progress && Progress.markSeen) { Progress.markSeen(BADGE); } }

  function readings() {
    var r = FAULTS[st.fault].state(st.t);
    r.T2 = 0;
    if (!st.power) { r = { T1: 0, T2: 0, T3: 0, T4: 0, led1: false, led2: false }; }
    return r;
  }
  function fmtV(v, dial) {
    if (dial === "DCV 2") { return v > 1.999 ? "1" : v.toFixed(3).replace(/^0/, "") ; }
    if (dial === "DCV 200") { return v.toFixed(1); }
    return v.toFixed(2);
  }
  function meterRead(r) {
    var tp = st.tp;
    if (tp === "T3") { return { d: "", note: "T3 is a logic output on the 555. Test logic levels with the logic probe, not the meter." }; }
    if (st.dial === "Continuity") {
      if (st.power) { return { d: "1", note: "Switch the power off first. Never test continuity or resistance with the power on." }; }
      if (!tp) { return { d: "1", note: "Touch the red lead on a test point. The black lead is on T2 (0 V)." }; }
      if (tp === "T2") { return { d: "000", beep: true, note: "Beep: both leads are on the same point, T2." }; }
      return { d: "1", note: "No beep: " + tp + " is not joined straight to 0 V. That is right for this board." };
    }
    if (st.red === "A") {
      return { d: "0.00", note: "The red lead is in the A socket. That socket is only for current. Move it to V/Ω to measure voltage." };
    }
    if (!tp) { return { d: "0.00", note: "Touch the red lead on a test point. The black lead is on T2 (0 V)." }; }
    var v = r[tp], d = fmtV(v, st.dial), note = "";
    if (d === "1") { note = "A 1 on the left means over range. " + tp + " is above 2 V. Turn up to DCV 20."; }
    else if (st.dial === "DCV 200") { note = "This range works, but it only shows one decimal place. DCV 20 is the range just above 5 V."; }
    return { d: d, note: note };
  }
  function probeRead(r) {
    if (!st.power) { return { hi: false, lo: false, note: "No LEDs: the probe takes its power from the board, and the power is off." }; }
    if (r.T1 < 1) { return { hi: false, lo: false, note: "No LEDs: the probe takes its power from the board, and the board has no supply." }; }
    if (!st.tp) { return { hi: false, lo: false, note: "Touch the probe tip on a test point. Its red clip is on T1 (+5 V), its black clip on T2 (0 V)." }; }
    var v = r[st.tp], hi = v >= 2.0, lo = v <= 0.8;
    var note = st.tp === "T4" ? "T4 is not a logic signal. It moves smoothly between about 1.7 V and 3.3 V, so the probe only lights when it is above 2 V. Use the meter here." : "";
    return { hi: hi, lo: lo, note: note };
  }
  function glow(r) {
    var svg = els.board.querySelector("svg");
    if (!svg) { return; }
    var a = svg.querySelector('[data-led="LED1"]'), b = svg.querySelector('[data-led="LED2"]');
    if (a) { a.classList.toggle("on", !!r.led1); }
    if (b) { b.classList.toggle("on", !!r.led2); }
    if (els.leds) {
      var txt = "LED1 (red) " + (r.led1 ? "on" : "off") + " · LED2 (green) " + (r.led2 ? "on" : "off");
      if (els.leds.textContent !== txt) { els.leds.textContent = txt; }
    }
  }
  function render(force) {
    var r = readings();
    glow(r);
    if (st.tool === "probe") {
      var pl = probeRead(r);
      setProbe(els.probe.querySelector("svg"), pl.hi, pl.lo);
    }
    var now = st.t;
    if (!force && now - st.lastText < 0.35) { return; }
    st.lastText = now;
    if (st.tool === "meter") {
      var m = meterRead(r);
      els.lcd.textContent = m.d;
      els.lcd.classList.toggle("is-left", m.d === "1");
      els.lcdSet.textContent = st.dial + (st.dial === "Continuity" ? "" : " · red lead in " + st.red);
      els.note.textContent = m.note || "";
      els.note.hidden = !m.note;
      els.lcd.parentNode.classList.toggle("beeps", !!m.beep);
    } else {
      var p = probeRead(r);
      setProbe(els.probe.querySelector("svg"), p.hi, p.lo);
      els.note.textContent = p.note || "";
      els.note.hidden = !p.note;
    }
    var svg = els.board.querySelector("svg");
    if (svg) {
      [].forEach.call(svg.querySelectorAll("[data-tp]"), function (g) { g.classList.toggle("is-on", g.getAttribute("data-tp") === st.tp); });
    }
    if (force) {
      [].forEach.call(bench.querySelectorAll("button[data-tp]"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-tp") === st.tp ? "true" : "false"); });
    }
  }
  function announce() {
    var r = readings(), msg;
    if (st.tool === "meter") {
      var m = meterRead(r);
      msg = "Meter on " + st.dial + (st.tp ? ", red lead on " + st.tp : "") + ": display shows " + (m.d === "1" ? "1 on the left, over range" : m.d) + ". " + (m.note || "");
    } else {
      var p = probeRead(r);
      msg = "Logic probe" + (st.tp ? " on " + st.tp : "") + ": " + (p.hi ? "red Hi LED on" : p.lo ? "green Lo LED on" : "no LED on") + ". " + (p.note || "");
    }
    els.say.textContent = msg;
    els.where.textContent = st.tp ? (st.tool === "meter" ? "Red lead on " + st.tp + ", black lead on T2" : "Probe tip on " + st.tp) : "Tap a test point";
  }
  function setSeg(group, attr, val) {
    [].forEach.call(bench.querySelectorAll("[" + attr + "]"), function (b) { b.setAttribute("aria-pressed", b.getAttribute(attr) === val ? "true" : "false"); });
  }
  function syncTool() {
    els.meterCtl.hidden = st.tool !== "meter";
    bench.querySelector(".tb-lcdwrap").hidden = st.tool !== "meter";
    els.probe.hidden = st.tool !== "probe";
    setSeg("tool", "data-tool", st.tool);
  }

  bench.addEventListener("click", function (e) {
    var b = e.target.closest("button, [data-tp]");
    if (!b || !bench.contains(b)) { return; }
    if (b.hasAttribute("data-tp")) { st.tp = b.getAttribute("data-tp"); used(); }
    else if (b.hasAttribute("data-tool")) { st.tool = b.getAttribute("data-tool"); syncTool(); }
    else if (b.hasAttribute("data-dial")) { st.dial = b.getAttribute("data-dial"); setSeg("dial", "data-dial", st.dial); }
    else if (b.hasAttribute("data-red")) { st.red = b.getAttribute("data-red"); setSeg("red", "data-red", st.red); }
    else if (b.hasAttribute("data-power")) { st.power = b.getAttribute("data-power") === "on"; setSeg("power", "data-power", b.getAttribute("data-power")); }
    else if (b.hasAttribute("data-mode")) { setMode(b.getAttribute("data-mode")); }
    else { return; }
    render(true); announce();
  });

  /* ---------- Probe Detective ---------- */
  function setMode(m) {
    st.mode = m;
    setSeg("mode", "data-mode", m);
    els.pd.hidden = m !== "detective";
    if ($("benchPredict")) { $("benchPredict").hidden = m === "detective"; }
    if (m === "detective") { newSet(); } else { st.fault = "none"; }
    st.tp = null;
  }
  function newSet() { st.set = shuffle(BANK); st.round = 0; st.score = 0; els.pdScore.textContent = ""; askRound(); }
  function askRound() {
    var id = st.set[st.round], f = FAULTS[id];
    st.fault = id; st.answered = false; st.tp = null; st.power = true; setSeg("power", "data-power", "on");
    els.pdQ.textContent = "Board " + (st.round + 1) + " of " + st.set.length + ". This board has one fault. Watch the LEDs, take readings, then choose the fault.";
    var opts = shuffle([id].concat(shuffle(BANK.filter(function (x) { return x !== id; })).slice(0, 3)));
    els.pdOpts.innerHTML = opts.map(function (o) {
      return '<button type="button" class="sim-btn pd-opt" data-fault="' + o + '" aria-pressed="false">' + esc(FAULTS[o].name) + "</button>";
    }).join("");
    els.pdFb.innerHTML = ""; els.pdFb.className = "pd-fb";
    els.pdNext.hidden = true;
    render(true); announce();
  }
  els.pdOpts.addEventListener("click", function (e) {
    var b = e.target.closest("[data-fault]");
    if (!b) { return; }
    used();
    var pick = b.getAttribute("data-fault"), id = st.fault, right = pick === id;
    [].forEach.call(els.pdOpts.children, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); x.classList.toggle("is-right", right && x === b); x.classList.toggle("is-wrong", !right && x === b); });
    if (!st.answered) { st.answered = true; if (right) { st.score++; } }
    els.pdFb.className = "pd-fb " + (right ? "is-right" : "is-wrong");
    els.pdFb.innerHTML = right ? "<p><strong>Right.</strong> " + esc(FAULTS[id].why) + "</p>"
      : "<p><strong>Not this one.</strong> With that fault you would see " + esc(FAULTS[pick].sees) + ". Look again at " + esc(FAULTS[id].cue) + ".</p>";
    els.pdNext.hidden = false;
    els.pdNext.textContent = st.round + 1 < st.set.length ? "Next board" : "See my score";
  });
  els.pdNext.addEventListener("click", function () {
    if (st.round + 1 < st.set.length) { st.round++; askRound(); return; }
    var msg = "Score (first tries): " + st.score + " / " + st.set.length + ".";
    if (window.Progress && Progress.record) {
      var res = Progress.record(BADGE, st.score, st.set.length);
      if (res && res.justUnlocked) { msg += " Probe Detective badge unlocked."; }
      else if (res && res.unlocked) { msg += " You already have the Probe Detective badge."; }
      else { msg += " Find 4 of 5 to earn the Probe Detective badge."; }
    }
    els.pdScore.textContent = msg;
    els.pdNext.hidden = true;
    var again = document.createElement("button");
    again.type = "button"; again.className = "sim-btn"; again.textContent = "New set of boards";
    again.addEventListener("click", function () { again.remove(); newSet(); });
    els.pdFb.appendChild(again);
  });

  /* ---------- predict ---------- */
  if (window.WidgetKit) {
    WidgetKit.poeCard($("benchPredict"), {
      answer: "flash",
      onPredict: function () {
        used();
        var t = $("benchTry"); if (t) { t.hidden = false; }
      }
    });
  }
  var tryBtn = $("benchTryBtn");
  if (tryBtn) {
    tryBtn.addEventListener("click", function () {
      if (st.mode !== "explore") { setMode("explore"); }
      st.tool = "probe"; syncTool(); st.tp = "T3"; st.power = true; setSeg("power", "data-power", "on");
      if (clk && !clk.running()) { clk.play(); }
      render(true); announce();
      els.board.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "nearest" });
    });
  }

  /* ---------- board ---------- */
  function engine() {
    if (window.SBD && window.SBD.render) { return Promise.resolve(window.SBD); }
    return new Promise(function (ok, fail) {
      var s = document.createElement("script");
      s.src = ENGINE; s.onload = function () { ok(window.SBD); }; s.onerror = fail;
      document.head.appendChild(s);
    });
  }
  var clk = null;
  Promise.all([engine(), fetch(GUIDE).then(function (r) { return r.json(); })]).then(function (res) {
    var S = res[0], c = res[1], K = c.build, R = S.render, ref = K.reference, num = 0;
    var attempt = {
      cuts: ref.cuts.map(function (x) { return x[0]; }),
      placements: ref.placements.map(function (p) { return { id: p.id, footprint: p.footprint, at: p.at, rot: p.rot || 0 }; }),
      links: ref.links.map(function (l) { return { a: l.a, b: l.b, colour: l.colour, num: ++num }; }),
      testpoints: ref.testpoints.map(function (t) { return { id: t.id, at: t.at }; })
    };
    var ok = S.check ? S.check(K.question, attempt) : { ok: K.ok };
    els.board.setAttribute("data-board-ok", ok && ok.ok ? "yes" : "no");
    if (!document.getElementById("sbd-style")) {
      var stl = document.createElement("style"); stl.id = "sbd-style"; stl.textContent = R.STYLE; document.head.appendChild(stl);
    }
    var svg = R.renderBoard({ board: K.board, question: K.question, attempt: attempt });
    var extra = "";
    ref.placements.forEach(function (p) {
      if (p.id !== "LED1" && p.id !== "LED2") { return; }
      var pins = S.cellsOf(S.FOOTPRINTS[p.footprint], S.parseRef(p.at), p.rot || 0).pins;
      var a = R.centreOf(pins[0].hole.r, pins[0].hole.c, K.board), b = R.centreOf(pins[1].hole.r, pins[1].hole.c, K.board);
      extra += '<circle class="tb-glow tb-' + (p.id === "LED1" ? "red" : "green") + '" data-led="' + p.id + '" cx="' + (a.x + b.x) / 2 + '" cy="' + (a.y + b.y) / 2 + '" r="' + R.P * 0.9 + '" pointer-events="none"/>';
    });
    ref.testpoints.forEach(function (t) {
      var h = S.parseRef(t.at), p = R.centreOf(h.r, h.c, K.board);
      extra += '<g class="tb-hit" data-tp="' + t.id + '">' +
        '<circle class="tb-ring" cx="' + p.x + '" cy="' + p.y + '" r="' + R.P * 0.62 + '"/>' +
        '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + R.P * 1.1 + '" fill="transparent"/></g>';
    });
    svg = svg.replace("</svg>", extra + "</svg>").replace(/ width="[\d.]+" height="[\d.]+"/, "");
    if (K.viewBox) { svg = svg.replace(/viewBox="[^"]+"/, 'viewBox="' + K.viewBox + '"'); }
    els.board.innerHTML = svg;
    var s = els.board.querySelector("svg"), t = s.querySelector("title");
    if (t) { s.removeChild(t); }
    s.setAttribute("role", "img");
    s.setAttribute("aria-label", "The 555 astable practice board on stripboard, with test points T1 to T4. LED1 is red, LED2 is green. Tap a test point on the board, or use the T1 to T4 buttons.");
    render(true); announce();
  }).catch(function () {
    els.board.setAttribute("data-board-ok", "error");
    els.board.textContent = "The board drawing could not load. Use the T1 to T4 buttons beside it.";
  });

  els.probe.innerHTML = probeSVG("none", "The logic probe. Its red Hi LED and green Lo LED show the logic level at the tip.");
  syncTool();
  if (window.WidgetKit) {
    clk = WidgetKit.clock({ autoplay: true, button: $("benchPlay"), onFrame: function (dt, t) { st.t = t; render(false); } });
  }
  render(true); announce();
})();
