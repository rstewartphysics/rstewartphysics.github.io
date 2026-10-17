/* ============================================================
   electronics-theory.js — shared behaviour for the six National 5
   Electronics theory pages (classes/electronics/theory/*.html).

   Each page sets, in a small inline script before this file runs:
     window.EL_THEORY = {
       key:   "el-thy-rc-",   localStorage prefix (quiz best + RAG)
       badge: "thy-rc",       progress badge marked seen on first sim use
       qs:    [ { q, o:[…], a, f:[…] } ],   f = feedback for each option
       crit:  [ "…" ]         RAG self-check criteria
     };
   Everything else is found by id and skipped when the page lacks it.
   Simulators use window.WidgetKit (load widget-kit.js before this file).
   ============================================================ */
(function () {
  "use strict";
  var CFG = window.EL_THEORY || {};
  var KEY = CFG.key || "el-thy-";

  function save(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) {} }
  function load(k, d) { try { var x = localStorage.getItem(KEY + k); return x ? JSON.parse(x) : d; } catch (e) { return d; } }
  function $(id) { return document.getElementById(id); }
  function setT(id, v) { var e = $(id); if (e) { e.textContent = v; } }
  function plain(x) { return String(Number((+x).toFixed(2))); }

  var seen = false;
  function markSeen() {
    if (seen || !CFG.badge) { return; }
    seen = true;
    if (window.Progress && Progress.markSeen) { Progress.markSeen(CFG.badge); }
  }
  function markSeenOnUse(root) {
    if (!root) { return; }
    var go = function () {
      markSeen();
      root.removeEventListener("input", go);
      root.removeEventListener("click", go);
    };
    root.addEventListener("input", go);
    root.addEventListener("click", go);
  }
  function poe(root) {
    if (root && window.WidgetKit) { WidgetKit.poeCard(root, {}); }
  }

  var SVGNS = "http://www.w3.org/2000/svg";
  function svgText(parent, x, y, html, cls, anchor) {
    var t = document.createElementNS(SVGNS, "text");
    t.setAttribute("x", x); t.setAttribute("y", y);
    if (cls) { t.setAttribute("class", cls); }
    if (anchor) { t.setAttribute("text-anchor", anchor); }
    var down = false;
    String(html).split(/(<sub>.*?<\/sub>|<i>.*?<\/i>)/).forEach(function (part) {
      if (!part) { return; }
      var ts = document.createElementNS(SVGNS, "tspan");
      var m = part.match(/^<(sub|i)>(.*)<\/\1>$/);
      if (m && m[1] === "sub") {
        ts.textContent = m[2]; ts.setAttribute("font-size", "75%"); ts.setAttribute("dy", "0.3em"); down = true;
      } else {
        ts.textContent = m ? m[2] : part;
        if (m) { ts.setAttribute("class", "sym"); }
        if (down) { ts.setAttribute("dy", "-0.225em"); down = false; }
      }
      t.appendChild(ts);
    });
    parent.appendChild(t);
    return t;
  }

  /* ---------- Voltage divider + comparator (#sim-divider) ---------- */
  function dividerSim() {
    var root = $("sim-divider");
    if (!root || !window.WidgetKit) { return; }
    var svg = $("dv-svg");
    var K = WidgetKit;
    poe(root.querySelector(".sim-predict"));
    markSeenOnUse(root);
    K.liveSim(root, {
      render: function (s) {
        var vs = s.vs, r1 = s.r1, r2 = s.r2, vref = s.vref;
        if (!(r1 + r2 > 0)) { return; }
        var v2 = vs * r2 / (r1 + r2);
        var i = vs / ((r1 + r2) * 1000);
        var high = v2 > vref;
        svg.classList.toggle("is-high", high);
        var dyn = svg.querySelector(".dyn");
        while (dyn.firstChild) { dyn.removeChild(dyn.firstChild); }
        svgText(dyn, 56, 34, "+" + plain(vs) + " V", "", "end");
        svgText(dyn, 94, 86, plain(r1) + " kΩ", "val", "end");
        svgText(dyn, 94, 182, plain(r2) + " kΩ", "val", "end");
        svgText(dyn, 122, 112, "<i>V</i><sub>2</sub> = " + K.fmt(v2) + " V", "key");
        svgText(dyn, 182, 200, plain(vref) + " V", "val", "middle");
        svgText(dyn, 306, 128, high ? "HIGH" : "LOW", "state");
        svg.setAttribute("aria-label", "Voltage divider and comparator. Supply " + plain(vs) + " volts. R1 " +
          plain(r1) + " kilohms on top, R2 " + plain(r2) + " kilohms below. V2 " + K.fmt(v2) +
          " volts goes to the plus input, the reference " + plain(vref) + " volts to the minus input. Output " +
          (high ? "HIGH, LED on." : "LOW, LED off."));
        setT("dv-v2", K.fmt(v2) + " V");
        setT("dv-i", K.si(i, "A"));
        $("dv-out").innerHTML = high
          ? "HIGH, LED on <span class=\"why\">(<var>V</var><sub>2</sub> &gt; " + plain(vref) + " V)</span>"
          : "LOW, LED off <span class=\"why\">(<var>V</var><sub>2</sub> &lt; " + plain(vref) + " V)</span>";
        $("dv-work").innerHTML =
          "<var>V</var><sub>2</sub> = <var>R</var><sub>2</sub> ÷ (<var>R</var><sub>1</sub> + <var>R</var><sub>2</sub>) × <var>V</var><sub>s</sub><br>" +
          "<var>V</var><sub>2</sub> = " + plain(r2) + " ÷ (" + plain(r1) + " + " + plain(r2) + ") × " + plain(vs) + "<br>" +
          "<var>V</var><sub>2</sub> = " + K.fmt(v2) + " V";
      }
    });
  }

  /* ---------- Transistor switch (#sim-transistor) ---------- */
  function transistorSim() {
    var root = $("sim-transistor");
    if (!root || !window.WidgetKit) { return; }
    var K = WidgetKit, svg = $("ts-svg"), arms = svg.querySelector(".arms"), dyn = svg.querySelector(".dyn");
    var VS = 5, VON = 0.7;
    /* R values that put the switch-on point mid-way along the slider */
    var PRESET = { "ldr-lower": 33, "ldr-upper": 1, "ther-lower": 62, "ther-upper": 1.6 };
    var envR = root.querySelector('input[type="range"][data-sim="env"]');
    var envN = root.querySelector('input[type="number"][data-sim="env"]');
    var envName = $("ts-env-name");
    var api = null, mode = "ldr-lower", sensor = "ldr";

    function ldrR(lux) { return 1e5 * Math.pow(lux, -0.75); }                 /* 100 kΩ at 1 lux, 100 Ω at 10 000 lux */
    function therR(c) { return 1e4 * Math.exp(3950 * (1 / (c + 273.15) - 1 / 298.15)); } /* NTC, 10 kΩ at 25 °C */

    function setEnvScale(s) {
      if (s === "ldr") {
        envR.setAttribute("data-scale", "log"); envR.setAttribute("data-min", "1");
        envR.setAttribute("data-max", "10000"); envR.setAttribute("data-step", "1");
        envR.min = 0; envR.max = 1000; envR.step = 1;
        envN.min = 1; envN.max = 10000; envN.step = 1;
        envName.innerHTML = "Light level on the LDR (lux)";
        envR.setAttribute("aria-label", "Light level on the LDR in lux");
        envN.setAttribute("aria-label", "Light level on the LDR in lux, typed");
      } else {
        envR.removeAttribute("data-scale");
        envR.min = -10; envR.max = 60; envR.step = 1;
        envN.min = -10; envN.max = 60; envN.step = 1;
        envName.innerHTML = "Temperature at the thermistor (°C)";
        envR.setAttribute("aria-label", "Temperature at the thermistor in degrees Celsius");
        envN.setAttribute("aria-label", "Temperature at the thermistor in degrees Celsius, typed");
      }
    }

    function el(name, attrs) {
      var e = document.createElementNS(SVGNS, name);
      Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      arms.appendChild(e);
      return e;
    }
    /* one arm of the divider, centred on cy: a sensor or the variable resistor */
    function drawArm(kind, cy) {
      el("rect", { "class": "res", x: 113, y: cy - 22, width: 14, height: 44 });
      if (kind === "ldr") {
        el("circle", { "class": "w", cx: 120, cy: cy, r: 27 });
        el("path", { "class": "w thin", d: "M76 " + (cy - 42) + " l15 15 M86 " + (cy - 50) + " l15 15" });
        el("path", { "class": "fill", d: "M94 " + (cy - 24) + " l-3 -9 l-6 6 z M104 " + (cy - 32) + " l-3 -9 l-6 6 z" });
      } else if (kind === "ther") {
        el("path", { "class": "w", d: "M94 " + (cy + 26) + " H102 L140 " + (cy - 26) });
      } else {
        el("path", { "class": "w", d: "M100 " + (cy + 24) + " L139 " + (cy - 21) });
        el("path", { "class": "fill", d: "M143 " + (cy - 26) + " l-10 3 l6 6 z" });
      }
    }

    api = K.liveSim(root, {
      render: function (s) {
        var m = s.sensor + "-" + s.arm;
        if (s.sensor !== sensor) {
          sensor = s.sensor;
          setEnvScale(sensor);
          api.set("env", sensor === "ldr" ? 100 : 20);
        }
        if (m !== mode) { mode = m; api.set("r", PRESET[m]); return; }
        var isLdr = s.sensor === "ldr", lower = s.arm === "lower";
        var rs = isLdr ? ldrR(s.env) : therR(s.env);
        var rv = s.r * 1000;
        var rLow = lower ? rs : rv, rUp = lower ? rv : rs;
        var vb = VS * rLow / (rLow + rUp), on = vb >= VON;
        svg.classList.toggle("is-on", on);

        while (arms.firstChild) { arms.removeChild(arms.firstChild); }
        drawArm(lower ? "r" : s.sensor, 82);
        drawArm(lower ? s.sensor : "r", 218);
        while (dyn.firstChild) { dyn.removeChild(dyn.firstChild); }
        var sName = isLdr ? "LDR" : "thermistor";
        var upName = lower ? "<i>R</i>" : sName, lowName = lower ? sName : "<i>R</i>";
        svgText(dyn, 86, 80, upName, "", "end");
        svgText(dyn, 86, 97, K.si(rUp, "Ω"), "val", "end");
        svgText(dyn, 86, 216, lowName, "", "end");
        svgText(dyn, 86, 233, K.si(rLow, "Ω"), "val", "end");
        svgText(dyn, 134, 182, "<i>V</i><sub>b</sub> = " + K.fmt(vb) + " V", "key");
        svgText(dyn, 298, 164, on ? "ON" : "OFF", "state");

        var envText = isLdr ? plain(s.env) + " lux" : plain(s.env) + " °C";
        svg.setAttribute("aria-label", "Transistor switch. " + sName + " in the " + (lower ? "lower" : "upper") +
          " arm at " + envText + ", " + K.si(rs, "ohms") + ". Variable resistor R " + K.si(rv, "ohms") +
          ". Base voltage " + K.fmt(vb) + " volts, so the transistor is " + (on ? "on and the LED is lit." : "off and the LED is off."));
        setT("ts-rs", K.si(rs, "Ω"));
        setT("ts-vb", K.fmt(vb) + " V");
        $("ts-state").innerHTML = on
          ? "ON, LED lit <span class=\"why\">(" + K.fmt(vb) + " V ≥ 0.7 V)</span>"
          : "OFF, LED off <span class=\"why\">(" + K.fmt(vb) + " V &lt; 0.7 V)</span>";
        $("ts-work").innerHTML =
          "<var>V</var><sub>b</sub> = <var>R</var><sub>lower</sub> ÷ (<var>R</var><sub>upper</sub> + <var>R</var><sub>lower</sub>) × <var>V</var><sub>s</sub><br>" +
          "<var>V</var><sub>b</sub> = " + K.si(rLow, "Ω") + " ÷ (" + K.si(rUp, "Ω") + " + " + K.si(rLow, "Ω") + ") × " + VS + " V<br>" +
          "<var>V</var><sub>b</sub> = " + K.fmt(vb) + " V";
      }
    });
    poe(root.querySelector(".sim-predict"));
    markSeenOnUse(root);
  }

  /* ---------- Logic gate explorer (#lg-gate) ---------- */
  function gateExplorer() {
    if (!$("lg-gate")) { return; }
    var gate = "AND", a = 0, b = 0;
    function calc(g, A, B) {
      switch (g) {
        case "AND": return A & B;
        case "OR": return A | B;
        case "NAND": return (A & B) ? 0 : 1;
        case "NOR": return (A | B) ? 0 : 1;
        case "XOR": return A ^ B;
        case "NOT": return A ? 0 : 1;
      }
      return 0;
    }
    function rows(g) { return g === "NOT" ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]]; }
    function render() {
      var single = (gate === "NOT");
      $("lg-b").style.display = single ? "none" : "";
      var out = calc(gate, a, single ? 0 : b);
      setT("lg-out", gate + " output = " + out);
      var html = "<caption>" + gate + "</caption><thead><tr>" + (single ? "<th>A</th>" : "<th>A</th><th>B</th>") + "<th>out</th></tr></thead><tbody>";
      rows(gate).forEach(function (r) {
        var A = r[0], B = single ? 0 : r[1], o = calc(gate, A, B);
        var active = (A === a) && (single || B === b);
        html += '<tr class="' + (active ? "hi" : "") + '">' + (single ? ("<td>" + A + "</td>") : ("<td>" + A + "</td><td>" + B + "</td>")) + '<td class="out">' + o + "</td></tr>";
      });
      $("lg-tt").innerHTML = html + "</tbody>";
    }
    $("lg-gate").addEventListener("click", function (e) {
      var btn = e.target.closest("button"); if (!btn) { return; }
      gate = btn.dataset.g;
      [].forEach.call(this.querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", x === btn); });
      markSeen(); render();
    });
    function toggle(id, get, set) {
      $(id).addEventListener("click", function () {
        set(get() ? 0 : 1); var v = get();
        this.setAttribute("aria-pressed", v === 1);
        this.textContent = (id === "lg-a" ? "A = " : "B = ") + v;
        markSeen(); render();
      });
    }
    toggle("lg-a", function () { return a; }, function (v) { a = v; });
    toggle("lg-b", function () { return b; }, function (v) { b = v; });
    render();
  }

  /* ---------- Multiple choice: every option teaches ---------- */
  function quiz() {
    var box = $("quiz"), QS = CFG.qs || [];
    if (!box || !QS.length) { return; }
    var first = {};
    QS.forEach(function (item, qi) {
      var d = document.createElement("div"); d.className = "q";
      var html = '<p class="qstem">' + (qi + 1) + ". " + item.q + "</p>";
      item.o.forEach(function (opt, oi) {
        html += '<label class="opt" data-qi="' + qi + '" data-oi="' + oi + '"><input type="radio" name="q' + qi + '" value="' + oi + '">' + opt + "</label>";
      });
      html += '<p class="opt-fb" id="q' + qi + '-fb" aria-live="polite"></p>';
      d.innerHTML = html; box.appendChild(d);
    });
    function opt(qi, oi) { return box.querySelector('.opt[data-qi="' + qi + '"][data-oi="' + oi + '"]'); }
    function note(el, txt) {
      var old = el.querySelector(".mark-note"); if (old) { old.parentNode.removeChild(old); }
      var s = document.createElement("span"); s.className = "mark-note"; s.textContent = txt; el.appendChild(s);
    }
    function clearQ(qi) {
      box.querySelectorAll('.opt[data-qi="' + qi + '"]').forEach(function (l) {
        l.classList.remove("correct", "wrong");
        var n = l.querySelector(".mark-note"); if (n) { n.parentNode.removeChild(n); }
      });
    }
    box.addEventListener("change", function (e) {
      var inp = e.target; if (!inp || inp.type !== "radio") { return; }
      var lab = inp.closest(".opt"), qi = +lab.dataset.qi, oi = +lab.dataset.oi, item = QS[qi];
      if (!(qi in first)) { first[qi] = oi; }
      clearQ(qi);
      var right = oi === item.a;
      lab.classList.add(right ? "correct" : "wrong");
      note(lab, right ? "✓ right" : "✗ not this one");
      var fb = $("q" + qi + "-fb");
      fb.className = "opt-fb " + (right ? "is-right" : "is-wrong");
      fb.innerHTML = (item.f && item.f[oi]) || "";
    });
    $("quiz-mark").addEventListener("click", function () {
      if (!Object.keys(first).length) { setT("quiz-score", "Choose at least one answer first."); return; }
      var score = 0;
      QS.forEach(function (item, qi) {
        if (first[qi] === item.a) { score++; }
        var r = opt(qi, item.a);
        if (!r.classList.contains("correct")) { r.classList.add("correct"); note(r, "✓ correct answer"); }
      });
      var best = Math.max(load("quizbest", 0), score); save("quizbest", best);
      setT("quiz-score", "Score (first tries): " + score + " / " + QS.length + "   (best: " + best + ")");
    });
    $("quiz-reset").addEventListener("click", function () {
      first = {};
      box.querySelectorAll("input").forEach(function (i) { i.checked = false; });
      QS.forEach(function (_, qi) { clearQ(qi); var fb = $("q" + qi + "-fb"); fb.className = "opt-fb"; fb.innerHTML = ""; });
      setT("quiz-score", "");
    });
    var best = load("quizbest", null); if (best != null) { setT("quiz-score", "Best so far: " + best + " / " + QS.length); }
  }

  /* ---------- RAG self-check ---------- */
  function rag() {
    var box = $("rag"), CRIT = CFG.crit || [];
    if (!box) { return; }
    var state = load("rag", {});
    function summary() {
      var g = 0, a = 0, r = 0;
      CRIT.forEach(function (_, i) { var s = state[i]; if (s === "G") { g++; } else if (s === "A") { a++; } else if (s === "R") { r++; } });
      setT("rag-summary", g + " green · " + a + " amber · " + r + " red  (of " + CRIT.length + ")");
    }
    CRIT.forEach(function (c, i) {
      var row = document.createElement("div"); row.className = "rag-item";
      var lab = document.createElement("span"); lab.className = "crit"; lab.textContent = c; row.appendChild(lab);
      var btns = document.createElement("span"); btns.className = "rag-btns";
      ["R", "A", "G"].forEach(function (k) {
        var b = document.createElement("button"); b.type = "button"; b.dataset.on = k; b.textContent = k;
        b.setAttribute("aria-label", c + " — " + (k === "R" ? "not yet" : k === "A" ? "getting there" : "confident"));
        b.setAttribute("aria-pressed", state[i] === k);
        b.addEventListener("click", function () {
          state[i] = k; save("rag", state);
          btns.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.on === k); });
          summary();
        });
        btns.appendChild(b);
      });
      row.appendChild(btns); box.appendChild(row);
    });
    $("rag-reset").addEventListener("click", function () {
      state = {}; save("rag", state);
      box.querySelectorAll(".rag-btns button").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      summary();
    });
    summary();
  }

  /* ---------- Sub-nav scrollspy ---------- */
  function scrollspy() {
    if (!("IntersectionObserver" in window)) { return; }
    var links = document.querySelectorAll(".subnav-link"), map = {};
    [].forEach.call(links, function (l) { map[l.getAttribute("href").slice(1)] = l; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        [].forEach.call(links, function (l) { l.classList.remove("is-active"); l.removeAttribute("aria-current"); });
        var l = map[en.target.id];
        if (l) { l.classList.add("is-active"); l.setAttribute("aria-current", "true"); }
      });
    }, { rootMargin: "-25% 0px -65% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) { obs.observe(s); } });
  }

  /* ---------- Print: open every reveal, then restore ---------- */
  function printReveals() {
    var opened = [];
    window.addEventListener("beforeprint", function () {
      opened = [];
      document.querySelectorAll("details.reveal:not([open])").forEach(function (d) { d.setAttribute("open", ""); opened.push(d); });
    });
    window.addEventListener("afterprint", function () { opened.forEach(function (d) { d.removeAttribute("open"); }); opened = []; });
  }

  function init() {
    [dividerSim, transistorSim, gateExplorer, quiz, rag, scrollspy, printReveals].forEach(function (fn) {
      try { fn(); } catch (e) { if (window.console) { console.error(e); } }
    });
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); }
  else { init(); }
})();
