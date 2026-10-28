/* ============================================================
   monostable-bench.js — Lesson 3 (classes/electronics/555-monostable.html)
   The monostable bench (WidgetKit), the Pulse Setter challenge
   (badge mono-ps) and the test-your-board widget.

   The circuit is the booklet's: 5 V, R1 10 k pull-up and changeover SW1
   on pin 2, R2 and C1 on pins 6 and 7, R3 270 and LED1 on pin 3.
   C1 charges through R2; the pulse ends when it reaches 2/3 of the
   supply, so T = RC ln 3, about 1.1 R2 C1. Held low past that, pin 2
   keeps the output high until SW1 is let go (a real 555 does this).
   The meter and probe drawings come from testing-bench.js (Lesson 1).
   ============================================================ */
(function () {
  "use strict";

  var VS = 5, VTH = VS * 2 / 3, LN3 = Math.log(3);
  var BADGE = "mono-ps";
  var R_STOCK = [10, 22, 33, 47, 68, 100, 220, 330, 470, 680, 1000];
  var C_STOCK = [1, 2.2, 4.7, 10, 22, 47, 100, 220, 470, 1000];
  /* 11 s is our board and 5.2 s is booklet Task 1, so neither is a target */
  var TARGETS = [0.5, 8, 15, 25, 120];
  var TOL = 0.10;

  function $(id) { return document.getElementById(id); }
  var WK = null;
  function pulseT(r, c) { return 1.1 * r * c / 1000; }
  function rText(r) { return r >= 1000 ? WK.fmt(r / 1000, 2) + " MΩ" : String(r) + " kΩ"; }
  function cText(c) { return String(c) + " µF"; }
  function tText(t) {
    if (t >= 100) { return Math.round(t) + " s (" + WK.fmt(t / 60, 2) + " minutes)"; }
    return WK.fmt(t) + " s";
  }
  function targetText(t) { return t === 120 ? "2 minutes (120 s)" : String(t) + " s"; }
  function nice(x) {
    var m = Math.pow(10, Math.floor(Math.log10(x))), f = x / m;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * m;
  }
  function speedFor(T) {
    if (T > 12) { return nice(T / 10); }
    if (T < 0.5) { return 1 / nice(1 / T); }
    return 1;
  }
  function speedText(s) {
    if (s === 1) { return "real time"; }
    return s > 1 ? s + " × faster" : Math.round(1 / s) + " × slower";
  }

  var seen = false;
  function used() {
    if (seen) { return; }
    seen = true;
    if (window.Progress && Progress.markSeen) { Progress.markSeen(BADGE); }
  }

  /* a live copy of the booklet diagram */
  function circuitCopy(label) {
    var src = document.querySelector("#monoCircuit svg");
    if (!src) { return null; }
    var svg = src.cloneNode(true);
    svg.setAttribute("aria-label", label);
    return svg;
  }
  function setCircuit(svg, s) {
    function live(k) { return svg.querySelector('[data-live="' + k + '"]'); }
    var lever = live("lever");
    if (lever) { lever.setAttribute("y2", s.held ? 255 : 203); }
    live("glow").classList.toggle("on", !!s.out);
    if (s.r != null) { live("r2v").textContent = rText(s.r).replace("Ω", ""); }
    if (s.c != null) { live("c1v").textContent = cText(s.c); }
    if (s.vc != null) { live("vc").textContent = WK.fmt(s.vc, 2) + " V"; }
    live("p2").textContent = s.held ? "0 V" : "5 V";
    live("p3").textContent = s.out ? "high" : "low";
  }

  /* ---------- the bench ---------- */
  function bench() {
    var root = $("monoBench");
    if (!root) { return; }
    var fig = root.querySelector("[data-circuit]");
    var svg = circuitCopy("The monostable circuit, live. The labels show R2, C1, the voltage across C1, pin 2 and pin 3. LED1 lights while pin 3 is high.");
    if (!svg) { return; }
    fig.insertBefore(svg, fig.firstChild);

    var g = WK.graph($("monoGraph"), {
      x: { min: 0, max: 16.5, label: "time", unit: "s" },
      y: { min: 0, max: 5, label: "voltage", unit: "V", step: 1 },
      title: "Graph of the voltage across C1 and the pin 3 output against time, for one pulse",
      layouts: [{ w: 360, h: 250 }]
    });
    g.ref("vth", "y", VTH, { cls: "kg-c3", label: "⅔ of 5 V", side: "right", below: true });

    var sim = null, mode = "explore", r = 100, c = 100, tau = 10, Tth = 10 * LN3, speed = 1;
    var run = { out: false, held: false, t: 0, vc: 0, last: null };
    var ps = { order: [], i: 0, score: 0, tried: false, done: false };

    var clk = WK.clock({ onFrame: function (dt) {
      if (!run.out) { clk.pause(); return; }
      run.t += dt;
      run.vc = VS * (1 - Math.exp(-run.t / tau));
      if (run.vc >= VTH && !run.held) { end(); return; }
      draw();
    } });

    function draw() {
      setCircuit(svg, { r: r, c: c, held: run.held, out: run.out, vc: run.vc });
      $("mbOn").textContent = run.out ? tText(run.t) : (run.last === null ? "–" : tText(run.last) + " (last pulse)");
      $("mbVc").textContent = WK.fmt(run.vc, 2) + " V";
      var o = $("mbOut");
      o.textContent = run.out ? "high: LED1 on" : "low: LED1 off";
      o.classList.toggle("is-hi", run.out);
      g.cursor(run.out && run.t <= Tth * 1.5 ? run.t : null);
      $("mbHeldNote").hidden = !(run.held && run.out && run.vc >= VTH);
    }
    function end() {
      run.out = false;
      run.last = run.t;
      run.vc = 0;
      clk.pause();
      draw();
      $("mbSay").textContent = "Pulse over. LED1 was on for " + tText(run.last) + ".";
    }
    function stop() {
      run.out = false; run.held = false; run.t = 0; run.vc = 0; run.last = null;
      clk.pause();
    }
    function press() {
      used();
      run.held = true;
      if (!run.out) {
        run.out = true; run.t = 0; run.vc = 0;
        $("mbSay").textContent = "SW1 at 0 V. Pin 2 low. Pin 3 high: LED1 on.";
      }
      clk.reset();
      clk.play();
      draw();
    }
    function release() {
      if (!run.held) { return; }
      run.held = false;
      if (run.out && run.vc >= VTH) { end(); } else { draw(); }
    }

    function render(st) {
      r = st.r; c = st.c;
      tau = r * c / 1000;
      Tth = tau * LN3;
      speed = speedFor(Tth);
      clk.setSpeed(speed);
      stop();
      var T = pulseT(r, c);
      $("mbT").textContent = tText(T);
      $("mbSpeed").textContent = speedText(speed);
      g.setX({ min: 0, max: Tth * 1.5, step: null });
      g.line("vc", function (t) { return t < Tth ? VS * (1 - Math.exp(-t / tau)) : 0; }, { samples: 200 });
      g.line("out", function (t) { return t < Tth ? VS : 0; }, { cls: "kg-c2", dash: true, samples: 200 });
      g.describe("Pulse time about " + tText(T) + ". C1 charges to two thirds of 5 V, then pin 3 goes low and C1 empties.");
      draw();
    }

    sim = WK.liveSim(root, { render: render });
    root.addEventListener("input", used);

    /* press and hold: pointer, keyboard, and a plain click for assistive tech */
    var hold = $("mbHold"), byPointer = false, byKey = false;
    hold.addEventListener("pointerdown", function (e) {
      byPointer = true;
      if (hold.setPointerCapture) { try { hold.setPointerCapture(e.pointerId); } catch (x) { /* older Safari */ } }
      press();
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (ev) {
      hold.addEventListener(ev, function () { if (byPointer) { release(); } });
    });
    hold.addEventListener("keydown", function (e) {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); byKey = true; press(); }
    });
    hold.addEventListener("keyup", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); byKey = false; release(); }
    });
    hold.addEventListener("click", function () {
      if (byPointer || byKey) { byPointer = false; return; }
      press(); release();
    });
    hold.addEventListener("contextmenu", function (e) { e.preventDefault(); });

    root.querySelector(".mb-presets").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-r]");
      if (!b) { return; }
      used();
      sim.set("r", Number(b.getAttribute("data-r")));
      sim.set("c", Number(b.getAttribute("data-c")));
    });

    var pc = $("monoPredict");
    WK.poeCard(pc, { answer: "longer", onPredict: function () { $("mbTry").hidden = false; } });
    $("mbTryBtn").addEventListener("click", function () { used(); sim.set("c", 100); sim.set("r", 200); });

    /* ---------- Pulse Setter ---------- */
    var selR = $("psR"), selC = $("psC");
    R_STOCK.forEach(function (v) { var o = document.createElement("option"); o.value = v; o.textContent = rText(v); selR.appendChild(o); });
    C_STOCK.forEach(function (v) { var o = document.createElement("option"); o.value = v; o.textContent = cText(v); selC.appendChild(o); });
    function fromSelects() { used(); sim.set("r", Number(selR.value)); sim.set("c", Number(selC.value)); }
    selR.addEventListener("change", fromSelects);
    selC.addEventListener("change", fromSelects);

    function shuffle(a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
      return a;
    }
    function round() {
      var target = ps.order[ps.i];
      ps.tried = false;
      $("psQ").textContent = "Target " + (ps.i + 1) + " of " + TARGETS.length + ": a pulse of " + targetText(target) + ".";
      $("psFb").innerHTML = "";
      $("psNext").hidden = true;
      $("psCheck").hidden = false;
      $("psScore").textContent = "First-try score: " + ps.score + " of " + ps.i;
      selR.value = "100"; selC.value = "100";
      fromSelects();
    }
    function startPs() {
      ps = { order: shuffle(TARGETS), i: 0, score: 0, tried: false, done: false };
      $("psNext").textContent = "Next target";
      round();
    }
    function check() {
      used();
      var target = ps.order[ps.i], rv = Number(selR.value), cv = Number(selC.value), T = pulseT(rv, cv);
      var ok = Math.abs(T - target) / target <= TOL;
      if (!ps.tried) { ps.tried = true; if (ok) { ps.score++; } }
      var sum = "<var>T</var> = 1.1 × " + rText(rv) + " × " + cText(cv) + " = " + tText(T);
      var msg;
      if (ok) {
        msg = '<p class="is-right"><strong>Right.</strong> ' + sum + ". That is within 10 % of " + targetText(target) + ".</p>";
      } else if (T > target) {
        msg = '<p class="is-wrong">' + sum + ". That is <strong>too long</strong>. Pick a smaller R2 or a smaller C1.</p>";
      } else {
        msg = '<p class="is-wrong">' + sum + ". That is <strong>too short</strong>. Pick a bigger R2 or a bigger C1.</p>";
      }
      $("psFb").innerHTML = msg;
      if (ok) {
        $("psCheck").hidden = true;
        $("psScore").textContent = "First-try score: " + ps.score + " of " + (ps.i + 1);
        if (ps.i === TARGETS.length - 1) { finish(); } else { $("psNext").hidden = false; }
      }
    }
    function finish() {
      var res = (window.Progress && Progress.record) ? Progress.record(BADGE, ps.score, TARGETS.length) : null;
      var line = "You hit " + ps.score + " of " + TARGETS.length + " on your first try.";
      if (res && res.justUnlocked) { line += " Pulse Setter badge earned."; }
      else if (ps.score < 4) { line += " Get 4 of 5 to earn the badge."; }
      $("psScore").textContent = line;
      $("psNext").textContent = "Play again";
      $("psNext").hidden = false;
      ps.done = true;
    }
    $("psCheck").addEventListener("click", check);
    $("psNext").addEventListener("click", function () {
      if (ps.done) { startPs(); return; }
      ps.i++;
      round();
    });

    root.querySelector(".mb-mode").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-mode]");
      if (!b) { return; }
      mode = b.getAttribute("data-mode");
      root.querySelectorAll(".mb-mode button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var hunt = mode === "setter";
      $("ps").hidden = !hunt;
      $("psRules").hidden = !hunt;
      pc.hidden = hunt;
      root.querySelectorAll(".mb-explore").forEach(function (el) { el.hidden = hunt; });
      if (hunt) { startPs(); }
    });
  }

  /* ---------- test your board ---------- */
  var METER = {
    wait:  { T1: "5.02", T2: "0.00", T3: "5.02", T4: "0.08" },
    held:  { T1: "5.02", T2: "0.00", T3: "0.00", T4: "3.62" },
    pulse: { T1: "5.02", T2: "0.00", T3: "5.02", T4: "3.62" }
  };
  var HIGH = {
    wait:  { T1: true, T2: false, T3: true, T4: false },
    held:  { T1: true, T2: false, T3: false, T4: true },
    pulse: { T1: true, T2: false, T3: true, T4: true }
  };
  var WHAT = { T1: "the +5 V supply", T2: "0 V", T3: "pin 2, the trigger", T4: "pin 3, the output" };
  var PHASE = { wait: "Waiting", held: "SW1 held at 0 V", pulse: "Pulse running, SW1 back at +5 V" };

  function tester() {
    var root = $("monoTest");
    if (!root) { return; }
    var fig = root.querySelector("[data-circuit]");
    var svg = circuitCopy("The monostable circuit with test points T1 to T4.");
    if (!svg) { return; }
    fig.insertBefore(svg, fig.firstChild);
    var st = { tool: "meter", phase: "wait", tp: "T4" };

    function pick(group, attr, val) {
      root.querySelectorAll("button[" + attr + "]").forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute(attr) === val ? "true" : "false");
      });
    }
    function show() {
      var high = HIGH[st.phase][st.tp];
      setCircuit(svg, { held: st.phase === "held", out: st.phase !== "wait" });
      svg.querySelectorAll("[data-tp]").forEach(function (g2) {
        g2.classList.toggle("is-tp", g2.getAttribute("data-tp") === st.tp);
      });
      var meter = root.querySelector(".mt-meter"), probe = root.querySelector(".mt-probe");
      meter.hidden = st.tool !== "meter";
      probe.hidden = st.tool !== "probe";
      var say;
      if (st.tool === "meter") {
        var d = METER[st.phase][st.tp], dig = meter.querySelector(".m-digits");
        if (dig) { dig.textContent = d; }
        var msvg = meter.querySelector("svg");
        if (msvg) { msvg.setAttribute("aria-label", "The class multimeter on DCV 20 reads " + d + "."); }
        say = "<strong>" + d + " V</strong> at " + st.tp + ", " + WHAT[st.tp] + ". ";
        if (st.tp === "T4") { say += high ? "Pin 3 is high, so LED1 is on. A little under 5 V is normal." : "Pin 3 is low, so LED1 is off."; }
        else if (st.tp === "T3") { say += high ? "Pin 2 is held high, so no pulse starts." : "Pin 2 is low: this starts the pulse."; }
        else if (st.tp === "T1") { say += "The supply is there."; }
        else { say += "The black probe is on T2 too, so this always reads 0."; }
      } else {
        var psvg = probe.querySelector("svg");
        if (psvg) {
          var hi = psvg.querySelector(".p-hi"), lo = psvg.querySelector(".p-lo");
          if (hi) { hi.classList.toggle("on", high); }
          if (lo) { lo.classList.toggle("on", !high); }
          psvg.setAttribute("aria-label", "Logic probe: the " + (high ? "red Hi" : "green Lo") + " LED is on.");
        }
        say = (high ? "<strong>Red Hi LED on</strong>" : "<strong>Green Lo LED on</strong>") + " at " + st.tp + ", " + WHAT[st.tp] + ". ";
        say += high ? "It is at logic 1 (high)." : "It is at logic 0 (low).";
        if (st.tp === "T4" && st.phase === "pulse") { say += " It stays red for the whole pulse. It does not flash: one pulse, not a stream."; }
      }
      $("mtRead").innerHTML = say;
    }
    root.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-tool], button[data-phase], button[data-tp]");
      if (!b) { return; }
      if (b.hasAttribute("data-tool")) { st.tool = b.getAttribute("data-tool"); pick(root, "data-tool", st.tool); }
      if (b.hasAttribute("data-phase")) { st.phase = b.getAttribute("data-phase"); pick(root, "data-phase", st.phase); }
      if (b.hasAttribute("data-tp")) { st.tp = b.getAttribute("data-tp"); pick(root, "data-tp", st.tp); }
      $("mtPhase").textContent = PHASE[st.phase];
      show();
    });
    show();
  }

  function init() {
    WK = window.WidgetKit;
    if (!WK) { return; }
    bench();
    tester();
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
