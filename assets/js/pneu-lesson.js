/* ============================================================
   pneu-lesson.js — shared behaviour for the S3 pneumatics lesson pages
   (classes/s3-engineering/pneumatics/lesson-n.html).

   Each page sets, in a small inline script before this file runs:
     window.PNEU_LESSON = {
       badge: "eng-pneu-l2",          the lesson's badge (progress/eng-s3.js)
       img:   "/assets/…/lesson-2/",  folder for every frame picture
       frames: { id: { start:{src,alt,cap}, phases:[
                   { go:"Push the button", predict:{ q, opts:[{t, f, right}] },
                     steps:[{src,alt,cap}] } ] } },
       patrol: { name, rounds:[ { q, valve:{…}, a, f:[…] } ], opts:[…] }
     };
   A stepper is <div class="air" data-frames="id">; the challenge is
   <div class="patrol" id="patrol">. Quiz and RAG come from electronics-theory.js.
   ============================================================ */
(function () {
  "use strict";
  var CFG = window.PNEU_LESSON || {};
  var BASE = CFG.img || "";
  var used = false;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (html != null) { e.innerHTML = html; }
    return e;
  }
  function button(cls, html, fn) {
    var b = el("button", cls, html);
    b.type = "button";
    b.addEventListener("click", fn);
    return b;
  }
  function markUsed() {
    if (used || !CFG.badge) { return; }
    used = true;
    if (window.Progress && Progress.markSeen) { Progress.markSeen(CFG.badge); }
  }

  /* ---------- Frames stepper: predict, then one step per tap ---------- */
  function stepper(root) {
    var F = (CFG.frames || {})[root.getAttribute("data-frames")];
    if (!F) { return; }
    var phases = F.phases;
    var pi = 0, at = -1, picked = false;

    var stage = el("div", "air-stage");
    var picBtn = el("button", "air-pic");
    picBtn.type = "button";
    var img = el("img");
    img.decoding = "async";
    picBtn.appendChild(img);
    var side = el("div", "air-side");
    var cap = el("p", "air-cap");
    cap.setAttribute("aria-live", "polite");
    var ask = el("div", "air-ask");
    var nav = el("div", "air-nav");
    side.appendChild(cap);
    side.appendChild(ask);
    side.appendChild(nav);
    stage.appendChild(picBtn);
    stage.appendChild(side);
    root.appendChild(stage);

    (function preload() {
      phases.forEach(function (p) { p.steps.forEach(function (s) { var i = new Image(); i.src = BASE + s.src; }); });
    })();

    function show(fr) {
      img.src = BASE + fr.src;
      img.alt = fr.alt;
      cap.innerHTML = fr.cap;
    }
    function current() {
      if (at < 0) { return pi === 0 ? F.start : phases[pi - 1].steps[phases[pi - 1].steps.length - 1]; }
      return phases[pi].steps[at];
    }
    function canStep() {
      var p = phases[pi];
      if (!p) { return false; }
      return at >= 0 ? at < p.steps.length - 1 : (!p.predict || picked);
    }
    function step() {
      if (!canStep()) { return; }
      markUsed();
      at += 1;
      render(true);
    }
    function restart() {
      pi = 0; at = -1; picked = false;
      render(true);
    }

    function render(focusNav) {
      var p = phases[pi];
      if (p && at === p.steps.length - 1 && pi < phases.length - 1) {
        pi += 1; at = -1; picked = false;
        p = phases[pi];
        show(phases[pi - 1].steps[phases[pi - 1].steps.length - 1]);
      } else {
        show(current());
      }
      ask.innerHTML = "";
      nav.innerHTML = "";
      var ended = !p || (pi === phases.length - 1 && at === p.steps.length - 1);

      if (!ended && at < 0 && p.predict) {
        ask.appendChild(el("p", "air-q", "<strong>Predict.</strong> " + p.predict.q));
        var opts = el("div", "air-opts");
        opts.setAttribute("role", "group");
        opts.setAttribute("aria-label", "Predict");
        var fb = el("div", "air-fb");
        fb.setAttribute("aria-live", "polite");
        p.predict.opts.forEach(function (o) {
          var b = button("pbtn air-opt", o.t, function () {
            picked = true;
            [].forEach.call(opts.children, function (x) { x.classList.remove("is-right", "is-wrong"); x.setAttribute("aria-pressed", "false"); });
            b.classList.add(o.right ? "is-right" : "is-wrong");
            b.setAttribute("aria-pressed", "true");
            fb.innerHTML = "<p>" + o.f + "</p>";
            fb.className = "air-fb " + (o.right ? "is-right" : "is-wrong");
            drawNav();
          });
          b.setAttribute("aria-pressed", "false");
          opts.appendChild(b);
        });
        ask.appendChild(opts);
        ask.appendChild(fb);
      }

      function drawNav() {
        nav.innerHTML = "";
        if (ended) {
          nav.appendChild(el("p", "air-done", "All the steps. " + (F.end || "")));
          nav.appendChild(button("pbtn air-again", "Start again", restart));
          return;
        }
        var label = at < 0 ? p.go : "Next step";
        var go = button("pbtn air-go", label + ' <span aria-hidden="true">&rarr;</span>', step);
        go.disabled = !canStep();
        nav.appendChild(go);
        var n = el("span", "air-count", at < 0 ? "" : "Step " + (at + 1) + " of " + p.steps.length);
        nav.appendChild(n);
        picBtn.setAttribute("aria-label", canStep() ? label + ": next picture" : "Picture");
        picBtn.disabled = !canStep();
      }
      drawNav();
      if (ended) { picBtn.disabled = true; picBtn.setAttribute("aria-label", "Picture"); }
      if (focusNav) {
        var f = nav.querySelector("button:not([disabled])") || ask.querySelector("button");
        if (f && document.activeElement && root.contains(document.activeElement)) { f.focus({ preventScroll: true }); }
      }
    }
    picBtn.addEventListener("click", step);
    render(false);
  }

  /* ---------- 3/2 valve symbol, drawn for the challenge ---------- */
  var NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) { parent.appendChild(e); }
    return e;
  }
  function arrow(g, x1, y1, x2, y2) {
    svg("line", { x1: x1, y1: y1, x2: x2, y2: y2, "class": "w" }, g);
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L;
    var bx = x2 - ux * 11, by = y2 - uy * 11;
    svg("polygon", { points: [x2, y2, bx - uy * 5, by + ux * 5, bx + uy * 5, by - ux * 5].join(" "), "class": "head" }, g);
  }
  function tee(g, y) {
    svg("path", { d: "M100 " + y + " H114 M114 " + (y - 8) + " V" + (y + 8), "class": "w" }, g);
  }
  function label(g, x, y, t, anchor) {
    var e = svg("text", { x: x, y: y, "text-anchor": anchor || "start" }, g);
    e.textContent = t;
  }
  /* v: { swapEnds, noSpring, bottomBack, topBack } — each true is one mistake */
  function valveSVG(v, aria) {
    var s = svg("svg", { viewBox: "0 0 300 230", role: "img", "aria-label": aria, "class": "pv" });
    var g = svg("g", {}, s);
    svg("rect", { x: 100, y: 40, width: 70, height: 70, "class": "box" }, g);
    svg("rect", { x: 100, y: 110, width: 70, height: 70, "class": "box" }, g);
    svg("path", { d: "M135 40 V27", "class": "w" }, g);
    svg("path", { d: "M122 27 A13 13 0 0 1 148 27 Z", "class": "box" }, g);
    if (!v.noSpring) { svg("path", { d: "M135 180 V186 L127 190 L143 196 L127 202 L143 208 L135 212", "class": "w thin" }, g); }
    svg("path", { d: "M100 130 H72 M100 165 H72 M170 130 H204", "class": "w" }, g);
    label(g, 88, 124, "1", "middle");
    label(g, 88, 159, "3", "middle");
    label(g, 182, 124, "2", "middle");
    label(g, 210, 135, "to cylinder", "start");
    var supY = v.swapEnds ? 165 : 130, exY = v.swapEnds ? 130 : 165;
    svg("circle", { cx: 64, cy: supY, r: 8, "class": "box" }, g);
    svg("circle", { cx: 64, cy: supY, r: 2.6, "class": "dot" }, g);
    svg("polygon", { points: "72," + (exY - 7) + " 72," + (exY + 7) + " 58," + exY, "class": "box" }, g);
    label(g, 50, supY + 5, "Air in", "end");
    label(g, 50, exY + 5, "Exhaust", "end");
    tee(g, 130);
    if (v.bottomBack) { arrow(g, 108, 162, 164, 132); } else { arrow(g, 164, 132, 108, 162); }
    tee(g, 95);
    if (v.topBack) { arrow(g, 166, 60, 104, 60); } else { arrow(g, 104, 60, 166, 60); }
    return s;
  }

  /* ---------- The challenge: one symbol at a time, first try counts ---------- */
  function patrol() {
    var root = document.getElementById("patrol");
    var P = CFG.patrol;
    if (!root || !P) { return; }
    var R = P.rounds, ri = 0, score = 0, firstTry = true;

    var fig = el("div", "patrol-fig");
    var body = el("div", "patrol-body");
    var count = el("p", "patrol-count");
    var q = el("p", "patrol-q");
    var opts = el("div", "patrol-opts");
    opts.setAttribute("role", "group");
    opts.setAttribute("aria-label", "Choose the mistake");
    var fb = el("div", "patrol-fb");
    fb.setAttribute("aria-live", "polite");
    var foot = el("div", "patrol-foot");
    var tally = el("p", "patrol-score");
    tally.setAttribute("aria-live", "polite");
    body.appendChild(count); body.appendChild(q); body.appendChild(opts); body.appendChild(fb); body.appendChild(foot);
    var wrap = el("div", "patrol-stage");
    wrap.appendChild(fig); wrap.appendChild(body);
    root.appendChild(wrap);
    root.appendChild(tally);

    function round() {
      var r = R[ri];
      firstTry = true;
      count.textContent = "Symbol " + (ri + 1) + " of " + R.length + " · score " + score;
      q.innerHTML = r.q;
      fig.innerHTML = "";
      fig.appendChild(valveSVG(r.valve, r.alt));
      opts.innerHTML = ""; fb.innerHTML = ""; fb.className = "patrol-fb"; foot.innerHTML = "";
      P.opts.forEach(function (t, oi) {
        var b = button("pbtn patrol-opt", t, function () { pick(oi, b); });
        b.setAttribute("aria-pressed", "false");
        opts.appendChild(b);
      });
    }
    function pick(oi, b) {
      var r = R[ri], right = oi === r.a;
      markUsed();
      [].forEach.call(opts.children, function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      b.classList.add(right ? "is-right" : "is-wrong");
      fb.innerHTML = "<p>" + r.f[oi] + "</p>";
      fb.className = "patrol-fb " + (right ? "is-right" : "is-wrong");
      if (firstTry && right) { score += 1; }
      firstTry = false;
      if (!right) { return; }
      [].forEach.call(opts.children, function (x) { x.disabled = true; });
      count.textContent = "Symbol " + (ri + 1) + " of " + R.length + " · score " + score;
      var last = ri === R.length - 1;
      var nx = button("pbtn patrol-next", last ? "See your score" : "Next symbol", function () {
        if (last) { finish(); } else { ri += 1; round(); var f = opts.querySelector("button"); if (f) { f.focus({ preventScroll: true }); } }
      });
      foot.appendChild(nx);
      nx.focus({ preventScroll: true });
    }
    function finish() {
      var res = (window.Progress && Progress.record) ? Progress.record(CFG.badge, score, R.length) : null;
      var need = Math.ceil(R.length * 0.8);
      tally.innerHTML = "<strong>" + P.name + ": " + score + " out of " + R.length + " on the first try.</strong> " +
        (score >= need ? "Badge earned." : "Get " + need + " out of " + R.length + " to earn the badge. Try again.");
      if (res && res.justUnlocked) { tally.innerHTML += " Well done."; }
      ri = 0; score = 0;
      foot.innerHTML = "";
      foot.appendChild(button("pbtn patrol-next", "Play again", function () { tally.innerHTML = ""; round(); }));
      foot.querySelector("button").focus({ preventScroll: true });
    }
    round();
  }

  function init() {
    [].forEach.call(document.querySelectorAll(".air[data-frames]"), function (r) {
      try { stepper(r); } catch (e) { if (window.console) { console.error(e); } }
    });
    try { patrol(); } catch (e) { if (window.console) { console.error(e); } }
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); }
  else { init(); }
})();
