/* ============================================================
   astable-bench.js — Lesson 4 (classes/electronics/555-astable.html)
   The astable bench (WidgetKit), the Timer Tuner challenge
   (badge ast-tt), the timing practice and the test-your-board widget.

   The circuit is the booklet's: 5 V, R1 1 k and R2 10 k to C1 100 µF on
   pins 7, 6 and 2; pin 3 drives red LED1 (R3 270, to 0 V) and green
   LED2 (R4 270, from +5 V). C1 swings between 1/3 and 2/3 of the supply:
   it charges through R1 + R2 (mark, pin 3 high) and empties through R2
   into pin 7 (space, pin 3 low). Tm = 0.7(R1 + R2)C1, Ts = 0.7 R2 C1.
   The meter and probe drawings come from testing-bench.js (Lesson 1).
   ============================================================ */
(function () {
  "use strict";

  var VS = 5, VHI = VS * 2 / 3, VLO = VS / 3;
  var BADGE = "ast-tt";
  var R_STOCK = [1, 2.2, 4.7, 10, 22, 47, 100];
  var C_STOCK = [1, 2.2, 4.7, 10, 22, 47, 100, 220, 470];
  /* 0.68 Hz is our board, so it is not a target; each target has 9+ stock answers */
  var TARGETS = [0.2, 0.5, 1, 2, 5];
  var TOL = 0.10;

  function $(id) { return document.getElementById(id); }
  var WK = null;
  function times(r1, r2, c) {
    var m = 0.7 * (r1 + r2) * c / 1000, s = 0.7 * r2 * c / 1000;
    return { m: m, s: s, T: m + s, f: 1 / (m + s) };
  }
  function vcap(ph, r1, r2, c, tm) {
    return ph < tm ? VS - (VS - VLO) * Math.exp(-ph / ((r1 + r2) * c / 1000))
                   : VHI * Math.exp(-(ph - tm) / (r2 * c / 1000));
  }
  function kText(r) { return String(r) + " kΩ"; }
  function cText(c) { return String(c) + " µF"; }
  function hzText(f) { return WK.fmt(f) + " Hz"; }
  function targetText(f) {
    var n = Math.round(f * 30);
    return f + " Hz (" + n + " flash" + (n === 1 ? "" : "es") + " in 30 s)";
  }

  var seen = false;
  function used() {
    if (seen) { return; }
    seen = true;
    if (window.Progress && Progress.markSeen) { Progress.markSeen(BADGE); }
  }

  /* a live copy of the booklet diagram */
  function circuitCopy(label) {
    var src = document.querySelector("#astCircuit svg");
    if (!src) { return null; }
    var svg = src.cloneNode(true);
    svg.setAttribute("aria-label", label);
    return svg;
  }
  function setCircuit(svg, s) {
    function live(k) { return svg.querySelector('[data-live="' + k + '"]'); }
    live("glow1").classList.toggle("on", !!s.red);
    live("glow2").classList.toggle("on", !!s.green);
    svg.classList.toggle("is-fast", !!s.fast);
    if (s.r1 != null) { live("r1v").textContent = s.r1 + " k"; }
    if (s.r2 != null) { live("r2v").textContent = s.r2 + " k"; }
    if (s.c != null) { live("c1v").textContent = cText(s.c); }
    if (s.vc != null) { live("vc").textContent = WK.fmt(s.vc, 2) + " V"; }
    live("p3").textContent = s.fast ? "" : (s.red ? "high" : "low");
  }

  /* ---------- the bench ---------- */
  function bench() {
    var root = $("astBench");
    if (!root) { return; }
    var fig = root.querySelector("[data-circuit]");
    var svg = circuitCopy("The astable circuit, live. The labels show R1, R2, C1, the voltage across C1 and pin 3. LED1, red, lights while pin 3 is high. LED2, green, lights while pin 3 is low.");
    if (!svg) { return; }
    fig.insertBefore(svg, fig.firstChild);

    var g = WK.graph($("astGraph"), {
      x: { min: 0, max: 3, label: "time", unit: "s" },
      y: { min: 0, max: 5, label: "voltage", unit: "V", step: 1 },
      title: "Graph of the voltage across C1 and the pin 3 output against time, for two cycles",
      layouts: [{ w: 360, h: 215 }]
    });
    g.ref("hi", "y", VHI, { cls: "kg-c3", label: "⅔ of 5 V", side: "right", below: true });
    g.ref("lo", "y", VLO, { cls: "kg-c3", label: "⅓ of 5 V", side: "right", below: true });

    var sim = null, r1 = 1, r2 = 10, c = 100, tt = times(1, 10, 100), speed = 1, key = null;
    var count = null;
    var ps = { order: [], i: 0, score: 0, tried: false, done: false };

    var clk = WK.clock({ onFrame: function () { draw(); }, speed: 1, autoplay: true, button: $("abPlay") });

    function draw() {
      var t = clk.time(), fast = speed / tt.T > 3;
      var ph = t % tt.T, red = ph < tt.m, vc = vcap(ph, r1, r2, c, tt.m);
      g.cursor(fast ? null : t % (2 * tt.T));
      $("abVc").textContent = fast ? "too fast" : WK.fmt(vc, 2) + " V";
      if (count) { tick(t); }
      var k = fast ? "fast" : (red ? "r" : "g");
      setCircuit(svg, { vc: fast ? null : vc, red: fast || red, green: fast || !red, fast: fast });
      if (k === key) { return; }
      key = k;
      $("abCap").textContent = fast ? "Too fast to see, so both LEDs look on. Try slow motion or a bigger C1." : "LED1 glows while pin 3 is high. LED2 glows while it is low.";
      var o = $("abOut");
      o.textContent = fast ? "too fast" : (red ? "high: LED1 on" : "low: LED2 on");
      o.classList.toggle("is-hi", !fast && red);
    }

    /* the measure tool: count LED1's flashes over 30 s of circuit time */
    function startCount() {
      used();
      count = { n: 0, last: 0 };
      clk.reset();
      if (!clk.running()) { clk.play(); }
      $("abCount").disabled = true;
      $("abCountOut").textContent = "Counting… 0 flashes after 0 s.";
    }
    function tick(t) {
      var n = Math.floor(Math.min(t, 30) / tt.T);
      if (n !== count.n || Math.floor(t) !== count.last) {
        count.n = n; count.last = Math.floor(t);
        $("abCountOut").textContent = "Counting… " + n + " flash" + (n === 1 ? "" : "es") + " after " + Math.min(30, Math.floor(t)) + " s.";
      }
      if (t >= 30) {
        $("abCountOut").innerHTML = "<strong>" + n + " flashes in 30 s:</strong> <var>f</var> = " + n + " ÷ 30 = " + WK.fmt(n / 30, 2) + " Hz.";
        count = null;
        $("abCount").disabled = false;
      }
    }
    function stopCount() {
      if (!count) { return; }
      count = null;
      $("abCount").disabled = false;
      $("abCountOut").textContent = "Stopped: the values changed. Count again.";
    }

    function render(st) {
      r1 = st.r1; r2 = st.r2; c = st.c1;
      tt = times(r1, r2, c);
      stopCount();
      $("abTm").textContent = WK.fmt(tt.m) + " s";
      $("abTs").textContent = WK.fmt(tt.s) + " s";
      $("abT").textContent = WK.fmt(tt.T) + " s";
      $("abF").textContent = hzText(tt.f);
      setCircuit(svg, { r1: r1, r2: r2, c: c });
      g.setX({ min: 0, max: 2 * tt.T, step: null });
      g.line("vc", function (t) { return vcap(t % tt.T, r1, r2, c, tt.m); }, { samples: 320 });
      var sq = [];
      for (var k = 0; k < 2; k++) {
        sq.push([k * tt.T, VS], [k * tt.T + tt.m, VS], [k * tt.T + tt.m, 0], [(k + 1) * tt.T, 0]);
        if (k === 0) { sq.push([tt.T, VS]); }
      }
      g.line("out", sq, { cls: "kg-c2", dash: true });
      g.describe("Mark time " + WK.fmt(tt.m) + " seconds, space time " + WK.fmt(tt.s) + " seconds, frequency " + WK.fmt(tt.f) + " hertz. C1 rises and falls between one third and two thirds of 5 V.");
      root.querySelectorAll(".ab-presets button[data-p]").forEach(function (b) {
        var p = b.getAttribute("data-p").split(",").map(Number);
        b.setAttribute("aria-pressed", String(p[0] === r1 && p[1] === r2 && p[2] === c));
      });
      key = null;
      draw();
    }

    sim = WK.liveSim(root, { render: render });
    root.addEventListener("input", used);

    root.querySelector(".ab-presets").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-p]");
      if (!b) { return; }
      used();
      var p = b.getAttribute("data-p").split(",").map(Number);
      sim.set("r1", p[0]); sim.set("r2", p[1]); sim.set("c1", p[2]);
      clk.reset();
    });
    root.querySelector(".ab-speed").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-speed]");
      if (!b) { return; }
      speed = Number(b.getAttribute("data-speed"));
      clk.setSpeed(speed);
      root.querySelectorAll(".ab-speed button[data-speed]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      key = null;
      draw();
    });
    $("abCount").addEventListener("click", startCount);

    var pc = $("astPredict");
    WK.poeCard(pc, { answer: "slower", onPredict: function () { $("abTry").hidden = false; } });
    $("abTryBtn").addEventListener("click", function () {
      used(); sim.set("r1", 1); sim.set("r2", 10); sim.set("c1", 200); clk.reset();
      if (!clk.running()) { clk.play(); }
    });

    /* ---------- Timer Tuner ---------- */
    var selA = $("ttR1"), selB = $("ttR2"), selC = $("ttC");
    function fill(sel, list, text) {
      list.forEach(function (v) { var o = document.createElement("option"); o.value = v; o.textContent = text(v); sel.appendChild(o); });
    }
    fill(selA, R_STOCK, kText); fill(selB, R_STOCK, kText); fill(selC, C_STOCK, cText);
    function fromSelects() {
      used();
      sim.set("r1", Number(selA.value)); sim.set("r2", Number(selB.value)); sim.set("c1", Number(selC.value));
      clk.reset();
    }
    [selA, selB, selC].forEach(function (s) { s.addEventListener("change", fromSelects); });

    function shuffle(a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
      return a;
    }
    function round() {
      var target = ps.order[ps.i];
      ps.tried = false;
      $("ttQ").textContent = "Target " + (ps.i + 1) + " of " + TARGETS.length + ": make LED1 flash at " + targetText(target) + ".";
      $("ttFb").innerHTML = "";
      $("ttNext").hidden = true;
      $("ttCheck").hidden = false;
      $("ttScore").textContent = "First-try score: " + ps.score + " of " + ps.i;
      selA.value = "1"; selB.value = "10"; selC.value = "100";
      fromSelects();
    }
    function startTt() {
      ps = { order: shuffle(TARGETS), i: 0, score: 0, tried: false, done: false };
      $("ttNext").textContent = "Next target";
      round();
    }
    function check() {
      used();
      var target = ps.order[ps.i], a = Number(selA.value), b = Number(selB.value), cv = Number(selC.value);
      var t = times(a, b, cv), ok = Math.abs(t.f - target) / target <= TOL;
      if (!ps.tried) { ps.tried = true; if (ok) { ps.score++; } }
      var sum = "<var>T</var> = 0.7 × (" + kText(a) + " + 2 × " + kText(b) + ") × " + cText(cv) + " = " + WK.fmt(t.T) + " s, so <var>f</var> = " + hzText(t.f);
      var msg;
      if (ok) {
        msg = '<p class="is-right"><strong>Right.</strong> ' + sum + ". That is within 10 % of " + target + " Hz.</p>";
      } else if (t.f > target) {
        msg = '<p class="is-wrong">' + sum + ". That flashes <strong>too fast</strong>. Pick bigger resistors or a bigger C1.</p>";
      } else {
        msg = '<p class="is-wrong">' + sum + ". That flashes <strong>too slowly</strong>. Pick smaller resistors or a smaller C1.</p>";
      }
      $("ttFb").innerHTML = msg;
      if (ok) {
        $("ttCheck").hidden = true;
        $("ttScore").textContent = "First-try score: " + ps.score + " of " + (ps.i + 1);
        if (ps.i === TARGETS.length - 1) { finish(); } else { $("ttNext").hidden = false; }
      }
    }
    function finish() {
      var res = (window.Progress && Progress.record) ? Progress.record(BADGE, ps.score, TARGETS.length) : null;
      var line = "You hit " + ps.score + " of " + TARGETS.length + " on your first try.";
      if (res && res.justUnlocked) { line += " Timer Tuner badge earned."; }
      else if (ps.score < 4) { line += " Get 4 of 5 to earn the badge."; }
      $("ttScore").textContent = line;
      $("ttNext").textContent = "Play again";
      $("ttNext").hidden = false;
      ps.done = true;
    }
    $("ttCheck").addEventListener("click", check);
    $("ttNext").addEventListener("click", function () {
      if (ps.done) { startTt(); return; }
      ps.i++;
      round();
    });

    root.querySelector(".ab-mode").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-mode]");
      if (!b) { return; }
      var hunt = b.getAttribute("data-mode") === "tuner";
      root.querySelectorAll(".ab-mode button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $("tt").hidden = !hunt;
      $("ttRules").hidden = !hunt;
      pc.hidden = hunt;
      root.querySelectorAll(".ab-explore").forEach(function (el) { el.hidden = hunt; });
      stopCount();
      $("abCountOut").textContent = "As in booklet Task 1.";
      if (hunt) { startTt(); }
    });
  }

  /* ---------- timing practice: new numbers each time ---------- */
  function practice() {
    if (!$("pf")) { return; }
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
    function fmt(x, unit) { return WK.fmt(x) + (unit ? " " + unit : ""); }
    var q = null;
    function fresh() {
      var a = pick([1, 2.2, 4.7, 10]), b = pick([10, 22, 47, 68, 100]), c = pick([10, 22, 47, 100]);
      var t = times(a, b, c);
      var kind = pick(["f", "f", "m", "s"]);
      var ask = { f: ["the frequency of the flashing", "Hz", t.f], m: ["the mark time", "s", t.m], s: ["the space time", "s", t.s] }[kind];
      q = { kind: kind, a: a, b: b, c: c, t: t, ans: ask[2], unit: ask[1] };
      $("pf-stem").innerHTML = "<strong>Calculate</strong> " + ask[0] + ". (3)";
      $("pf-data").innerHTML = "<li>R1 = " + a + " kΩ</li><li>R2 = " + b + " kΩ</li><li>C1 = " + c + " µF</li>";
      $("pf-unit").textContent = ask[1];
      $("pf-in").value = ""; $("pf-fb").textContent = ""; $("pf-fb").className = "fb-line"; $("pf-work").hidden = true;
    }
    function near(x, y) { return Math.abs(x - y) <= Math.abs(y) * 0.02; }
    $("pf-check").addEventListener("click", function () {
      used();
      var raw = $("pf-in").value.replace(",", ".").trim(), x = parseFloat(raw), fb = $("pf-fb"), t = q.t;
      if (raw === "" || !isFinite(x)) { fb.className = "fb-line no"; fb.textContent = "Type a number first, in " + q.unit + "."; return; }
      var ok = near(x, q.ans), msg;
      if (ok) { msg = "Right."; }
      else if ([1000, 0.001, 1e6, 1e-6].some(function (k) { return near(x, q.ans * k); })) { msg = "Check your conversions: kΩ to Ω (× 1000) and µF to F (÷ 1 000 000)."; }
      else if (q.kind === "f" && near(x, t.T)) { msg = "That is the period. The frequency is 1 ÷ T."; }
      else if (q.kind === "f" && near(x, 1 / t.m)) { msg = "You used the mark time only. The period is the mark time plus the space time."; }
      else if (q.kind === "f" && near(x, 1 / (0.7 * (q.a + q.b) * q.c / 1000 * 2))) { msg = "The period has R2 in it twice: T = 0.7 (R1 + 2R2) C1."; }
      else if (q.kind === "m" && near(x, t.s)) { msg = "That is the space time. The mark time uses R1 + R2."; }
      else if (q.kind === "s" && near(x, t.m)) { msg = "That is the mark time. The space time uses R2 only."; }
      else { msg = "Not yet. Change to Ω and F first, then use the relationship for what is asked."; }
      fb.className = "fb-line " + (ok ? "ok" : "no"); fb.textContent = msg;
      var w = "Tm = 0.7 × (" + q.a * 1000 + " + " + q.b * 1000 + ") × " + q.c + " × 10⁻⁶ = " + fmt(t.m, "s");
      if (q.kind !== "m") { w += "\nTs = 0.7 × " + q.b * 1000 + " × " + q.c + " × 10⁻⁶ = " + fmt(t.s, "s"); }
      if (q.kind === "f") { w += "\nT = " + fmt(t.m) + " + " + fmt(t.s) + " = " + fmt(t.T, "s") + "\nf = 1 ÷ " + fmt(t.T) + " = " + fmt(t.f, "Hz"); }
      $("pf-work").textContent = w; $("pf-work").hidden = false;
    });
    $("pf-new").addEventListener("click", fresh);
    $("pf-in").addEventListener("keydown", function (e) { if (e.key === "Enter") { $("pf-check").click(); } });
    fresh();
  }

  /* ---------- test your board ---------- */
  var WHAT = { T1: "the +5 V supply", T2: "0 V", T3: "pin 3, the output", T4: "C1, pins 2 and 6" };
  var BOARD = times(1, 10, 100);

  function tester() {
    var root = $("astTest");
    if (!root) { return; }
    var fig = root.querySelector("[data-circuit]");
    var svg = circuitCopy("The astable circuit with test points T1 to T4.");
    if (!svg) { return; }
    fig.insertBefore(svg, fig.firstChild);
    var st = { tool: "meter", tp: "T3" }, last = null;
    var meter = root.querySelector(".mt-meter"), probe = root.querySelector(".mt-probe");

    function pick(attr, val) {
      root.querySelectorAll("button[" + attr + "]").forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute(attr) === val ? "true" : "false");
      });
    }
    function words() {
      var say, tp = st.tp;
      if (st.tool === "meter") {
        say = "At " + tp + ", " + WHAT[tp] + ": ";
        if (tp === "T1") { say += "<strong>5.02 V</strong>. The supply is there."; }
        else if (tp === "T2") { say += "<strong>0.00 V</strong>. The black probe is on T2 too, so this always reads 0."; }
        else if (tp === "T3") { say += "the reading <strong>keeps changing</strong>. About 4.2 V while LED1 is on. About 0 V while LED2 is on."; }
        else { say += "the reading <strong>rises and falls</strong> between about 1.7 V and 3.3 V: ⅓ and ⅔ of the supply."; }
      } else {
        say = "At " + tp + ", " + WHAT[tp] + ": ";
        if (tp === "T1") { say += "<strong>red Hi LED on</strong>. Logic 1 (high)."; }
        else if (tp === "T2") { say += "<strong>green Lo LED on</strong>. Logic 0 (low)."; }
        else if (tp === "T3") { say += "<strong>red and green flash in turn</strong>. Pin 3 is pulsing. That is right for an astable."; }
        else { say += "<strong>the red Hi LED goes on and off</strong>. C1's voltage is not a clean high or low. Use the meter on T4."; }
      }
      $("atRead").innerHTML = say;
    }
    function frame() {
      var t = clk.time(), ph = t % BOARD.T, high = ph < BOARD.m;
      var vc = vcap(ph, 1, 10, 100, BOARD.m);
      setCircuit(svg, { red: high, green: !high });
      var d, hi, lo;
      if (st.tp === "T1") { d = "5.02"; hi = true; lo = false; }
      else if (st.tp === "T2") { d = "0.00"; hi = false; lo = true; }
      else if (st.tp === "T3") { d = high ? "4.20" : "0.05"; hi = high; lo = !high; }
      else { d = WK.fmt(vc, 3); hi = vc > 2.4; lo = false; }
      var k = st.tool + st.tp + d + hi + lo;
      if (k === last) { return; }
      last = k;
      if (st.tool === "meter") {
        var dig = meter.querySelector(".m-digits");
        if (dig) { dig.textContent = d; }
        var msvg = meter.querySelector("svg");
        if (msvg) { msvg.setAttribute("aria-label", "The class multimeter on DCV 20 at " + st.tp + "."); }
      } else {
        var psvg = probe.querySelector("svg");
        if (psvg) {
          var a = psvg.querySelector(".p-hi"), b = psvg.querySelector(".p-lo");
          if (a) { a.classList.toggle("on", hi); }
          if (b) { b.classList.toggle("on", lo); }
          psvg.setAttribute("aria-label", "Logic probe at " + st.tp + ".");
        }
      }
    }
    var clk = WK.clock({ onFrame: frame, speed: 1, autoplay: true, button: $("atPlay") });
    function show() {
      svg.querySelectorAll("[data-tp]").forEach(function (g2) {
        g2.classList.toggle("is-tp", g2.getAttribute("data-tp") === st.tp);
      });
      meter.hidden = st.tool !== "meter";
      probe.hidden = st.tool !== "probe";
      last = null;
      frame();
      words();
    }
    root.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-tool], button[data-tp]");
      if (!b) { return; }
      if (b.hasAttribute("data-tool")) { st.tool = b.getAttribute("data-tool"); pick("data-tool", st.tool); }
      if (b.hasAttribute("data-tp")) { st.tp = b.getAttribute("data-tp"); pick("data-tp", st.tp); }
      show();
    });
    show();
  }

  function init() {
    WK = window.WidgetKit;
    if (!WK) { return; }
    bench();
    practice();
    tester();
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
