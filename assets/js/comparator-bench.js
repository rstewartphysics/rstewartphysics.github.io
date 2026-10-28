/* ============================================================
   comparator-bench.js — Lesson 2 (classes/electronics/op-amp-comparator.html)
   The diagram guide, the comparator bench (WidgetKit) and the
   Threshold Hunter challenge (badge cmp-th).

   The circuit is the booklet's: 9 V, TH1 over VR1 into the + input,
   R2 10 k over R3 2.2 k into the − input, an ideal output (9 V / 0 V).
   ============================================================ */
(function () {
  "use strict";

  var VS = 9, R2 = 10, R3 = 2.2, VREF = VS * R3 / (R2 + R3);
  var BADGE = "cmp-th";
  var TARGETS = [15, 20, 25, 35, 40];      /* 30 °C is the booklet's Task 3 */
  var TOL = 1.5;

  /* same NTC model as electronics-theory.js: 10 kΩ at 25 °C, B = 3950; kΩ */
  function rTh(c) { return 10 * Math.exp(3950 * (1 / (c + 273.15) - 1 / 298.15)); }
  function vIn(c, vr) { return VS * vr / (rTh(c) + vr); }
  /* V_in passes V_ref when R_TH falls below vr·(VS/VREF − 1) */
  function switchTemp(vr) {
    if (!(vr > 0)) { return null; }
    var r = vr * (VS / VREF - 1);
    return 1 / (Math.log(r / 10) / 3950 + 1 / 298.15) - 273.15;
  }
  function $(id) { return document.getElementById(id); }

  var seen = false;
  function used() {
    if (seen) { return; }
    seen = true;
    if (window.Progress && Progress.markSeen) { Progress.markSeen(BADGE); }
  }

  /* ---------- the diagram guide ---------- */
  function guide() {
    var box = $("cmpGuide"), card = $("cmpGuideCard");
    var svg = document.querySelector("#cmpCircuit svg");
    if (!box || !card || !svg) { return; }
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-part]");
      if (!b) { return; }
      var part = b.getAttribute("data-part");
      box.querySelectorAll("button[data-part]").forEach(function (x) {
        x.setAttribute("aria-pressed", x === b ? "true" : "false");
      });
      svg.querySelectorAll("[data-part]").forEach(function (g) {
        var me = g.getAttribute("data-part") === part;
        g.classList.toggle("is-hi", part !== "all" && me);
        g.classList.toggle("is-dim", part !== "all" && !me);
      });
      var t = $("guide-" + part);
      if (t) { card.innerHTML = t.innerHTML; }
    });
  }

  /* ---------- the bench ---------- */
  function bench() {
    var root = $("cmpBench"), WK = window.WidgetKit;
    var src = document.querySelector("#cmpCircuit svg");
    if (!root || !WK || !src) { return; }

    var fig = root.querySelector("[data-circuit]");
    var svg = src.cloneNode(true);
    svg.setAttribute("aria-label", "The comparator circuit, live. The labels show the temperature, the resistance of TH1, VR1, V in, V ref and the output. A logic indicator sits on the output.");
    fig.insertBefore(svg, fig.firstChild);
    function live(k) { return svg.querySelector('[data-live="' + k + '"]'); }

    var g = WK.graph($("cmpGraph"), {
      x: { min: -10, max: 60, label: "temperature", unit: "°C", step: 10 },
      y: { min: 0, max: 9, label: "voltage", unit: "V", step: 1 },
      title: "Graph of V in and V ref against temperature",
      layouts: [{ w: 360, h: 270 }]
    });
    g.ref("vref", "y", VREF, { cls: "kg-c2", label: "<i>V</i><sub>ref</sub>", side: "left" });

    var mode = "explore", sim = null;
    var hunt = { order: [], i: 0, score: 0, tried: false, done: false };

    function render(s) {
      var t = s.t, vr = s.vr, r = rTh(t), v = vIn(t, vr), hi = v > VREF, ts = switchTemp(vr);
      live("temp").textContent = t + " °C";
      live("rth").textContent = WK.fmt(r) + " kΩ";
      live("vr").textContent = WK.fmt(vr) + " kΩ";
      live("vin").textContent = WK.fmt(v) + " V";
      live("vref").textContent = WK.fmt(VREF) + " V";
      live("out").textContent = hi ? "9 V" : "0 V";
      live("li").classList.toggle("on", hi);
      live("glow").classList.toggle("on", hi);

      $("cbRth").textContent = WK.fmt(r) + " kΩ";
      $("cbVin").textContent = WK.fmt(v) + " V";
      $("cbVref").textContent = WK.fmt(VREF) + " V";
      var out = $("cbOut");
      out.textContent = hi ? "high, red" : "low, white";
      out.classList.toggle("is-hi", hi);
      var tsText = ts === null ? "never" : (ts > 99 || ts < -50) ? "out of range" : "about " + Math.round(ts) + " °C";
      $("cbSw").textContent = tsText;

      g.line("vin", function (c) { return vIn(c, vr); }, { samples: 140 });
      g.marker("now", t, v, { label: "<i>V</i><sub>in</sub>" });
      if (ts !== null && ts >= -10 && ts <= 60) { g.ref("sw", "x", ts, { cls: "kg-c3", label: "LED1 on", side: "right", below: true }); }
      else { g.remove("sw"); }
      g.describe("At " + t + " °C, V in is " + WK.fmt(v) + " volts and V ref is " + WK.fmt(VREF) + " volts. LED1 comes on at " + tsText + ".");
      $("cbSay").textContent = "V in " + WK.fmt(v) + " volts. Output " + (hi ? "high, LED1 on." : "low, LED1 off.");
    }

    sim = WK.liveSim(root, { render: render });
    root.addEventListener("input", used);

    var pc = $("cmpPredict");
    WK.poeCard(pc, { answer: "colder", onPredict: function () { $("cmpTry").hidden = false; } });
    $("cmpTryBtn").addEventListener("click", function () { used(); sim.set("vr", 5); });

    /* ---------- Threshold Hunter ---------- */
    function shuffle(a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
      return a;
    }
    function round() {
      var target = hunt.order[hunt.i];
      hunt.tried = false;
      $("thQ").textContent = "Target " + (hunt.i + 1) + " of " + TARGETS.length + ": set VR1 so LED1 comes on at " + target + " °C.";
      $("thFb").innerHTML = "";
      $("thNext").hidden = true;
      $("thCheck").hidden = false;
      $("thScore").textContent = "First-try score: " + hunt.score + " of " + hunt.i;
      g.ref("target", "x", target, { cls: "kg-c2", label: "target", side: "left" });
      sim.set("vr", 5);
    }
    function startHunt() {
      hunt = { order: shuffle(TARGETS), i: 0, score: 0, tried: false, done: false };
      $("thNext").textContent = "Next target";
      round();
    }
    function check() {
      used();
      var target = hunt.order[hunt.i], ts = switchTemp(sim.state.vr);
      var ok = ts !== null && Math.abs(ts - target) <= TOL;
      if (!hunt.tried) { hunt.tried = true; if (ok) { hunt.score++; } }
      var at = ts === null ? "never" : "at about " + Math.round(ts) + " °C";
      var msg;
      if (ok) {
        msg = '<p class="is-right"><strong>Right.</strong> LED1 comes on ' + at + ". <var>V</var><sub>in</sub> passes <var>V</var><sub>ref</sub> at the target.</p>";
      } else if (ts === null || ts > target) {
        msg = '<p class="is-wrong">LED1 comes on ' + at + ", too warm. Turn VR1 <strong>up</strong>. A bigger VR1 makes <var>V</var><sub>in</sub> bigger, so it passes <var>V</var><sub>ref</sub> when it is colder.</p>";
      } else {
        msg = '<p class="is-wrong">LED1 comes on ' + at + ", too cold. Turn VR1 <strong>down</strong>. A smaller VR1 makes <var>V</var><sub>in</sub> smaller, so it needs more heat to pass <var>V</var><sub>ref</sub>.</p>";
      }
      $("thFb").innerHTML = msg;
      if (ok) {
        $("thCheck").hidden = true;
        var last = hunt.i === TARGETS.length - 1;
        $("thScore").textContent = "First-try score: " + hunt.score + " of " + (hunt.i + 1);
        if (last) { finish(); } else { $("thNext").hidden = false; }
      }
    }
    function finish() {
      var res = (window.Progress && Progress.record) ? Progress.record(BADGE, hunt.score, TARGETS.length) : null;
      var line = "You set " + hunt.score + " of " + TARGETS.length + " on your first try.";
      if (res && res.justUnlocked) { line += " Threshold Hunter badge earned."; }
      else if (hunt.score < 4) { line += " Get 4 of 5 to earn the badge."; }
      $("thScore").textContent = line;
      $("thNext").textContent = "Play again";
      $("thNext").hidden = false;
      hunt.done = true;
    }
    $("thCheck").addEventListener("click", check);
    $("thNext").addEventListener("click", function () {
      if (hunt.done) { startHunt(); return; }
      hunt.i++;
      round();
    });

    root.querySelector(".cb-mode").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-mode]");
      if (!b) { return; }
      mode = b.getAttribute("data-mode");
      root.querySelectorAll(".cb-mode button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $("th").hidden = mode !== "hunt";
      $("thRules").hidden = mode !== "hunt";
      pc.hidden = mode === "hunt";
      if (mode === "hunt") { startHunt(); } else { g.remove("target"); }
    });
  }

  function init() { guide(); bench(); }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
