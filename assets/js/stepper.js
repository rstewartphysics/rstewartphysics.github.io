/* Calculation Stepper (AT5, SPACE-PLATFORM-PLAN-v2 §8c). Every line of a calculation is
   checked on its own: relationship, substitution, answer + unit. Numbers are generated.
   Data: _data/stepper/*.yml, embedded by tools/stepper.html as #stepper-data. */
(function () {
  "use strict";
  var D, SET, MODE, S, root;
  var $ = function (id) { return document.getElementById(id); };
  var SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
  var UNSUP = {}; Object.keys(SUP).forEach(function (k) { UNSUP[SUP[k]] = k; });
  var STORE = "stepper-v1";

  // ---------- numbers ----------
  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[rnd(a.length)]; }
  function places(step) { var s = String(step), i = s.indexOf("."); return i < 0 ? 0 : s.length - i - 1; }
  function range(r) { var n = Math.round((r[1] - r[0]) / r[2]); return +(r[0] + r[2] * rnd(n + 1)).toFixed(places(r[2])); }
  function sf(x, n) { return x ? +x.toPrecision(n) : 0; }
  function near(v, x, tol) { return x === 0 ? Math.abs(v) < 1e-12 : Math.abs(v - x) <= tol * Math.abs(x); }
  function group(int) { return int.length > 4 ? int.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : int; }
  function supE(e) { return " × 10" + String(e).split("").map(function (c) { return SUP[c]; }).join(""); }
  function plain(s) { var p = s.split("."); p[0] = group(p[0]); return p.join("."); }
  // x written to exactly n significant figures, as the paper would print it
  function toSF(x, n) {
    if (Math.abs(x) >= 1e5) {
      var e = Math.floor(Math.log10(Math.abs(x))), m = (x / Math.pow(10, e)).toPrecision(n);
      if (Math.abs(+m) >= 10) { e += 1; m = (x / Math.pow(10, e)).toPrecision(n); }
      return m + supE(e);
    }
    var t = x.toPrecision(n);
    return plain(t.indexOf("e") >= 0 ? String(+t) : t);
  }
  // full value, no rounding (up to 7 figures, trailing zeros dropped)
  function fmt(x, sym) {
    if (sym === "g" && Number.isInteger(x) && x < 10) { return x.toFixed(1); }
    if (Math.abs(x) >= 1e5) {
      var e = Math.floor(Math.log10(Math.abs(x))), m = +(x / Math.pow(10, e)).toPrecision(7);
      if (Math.abs(m) >= 10) { m = +(m / 10).toPrecision(7); e += 1; }
      return String(m) + supE(e);
    }
    return plain(String(+x.toPrecision(7)));
  }
  function sym(s) { return D.symbols[s]; }
  function qty(s, x) { return fmt(x, s) + "\u00a0" + sym(s).unit; }
  // SQA counting: "3.0" is 2 figures, "30" is 1 (trailing zeros in a whole number don't count)
  function countSF(t) {
    t = String(t).replace(/[\s\u202f\u2009\u00a0,-]/g, "").replace(/×.*$/, "");
    var d = t.indexOf(".") >= 0 ? t.replace(".", "").replace(/^0+/, "") : t.replace(/^0+/, "").replace(/0+$/, "");
    return Math.max(1, d.length);
  }
  // accepts 23520, 23 520, 5.5e5, 5.5 × 10^5, 5.5x10⁵
  function parseNum(raw) {
    var s = String(raw || "").replace(/[\s   ,]/g, "").replace(/[−–]/g, "-");
    if (!s) { return { empty: true }; }
    s = s.replace(/10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, function (_, e) { return "10^" + e.split("").map(function (c) { return UNSUP[c]; }).join(""); });
    s = s.replace(/[x×X*·]10\^?(-?\d+)$/, "e$1");
    var m = /^(-?(?:\d+\.?\d*|\.\d+))(?:e(-?\d+))?$/i.exec(s);
    if (!m) { return null; }
    return { v: parseFloat(m[1] + "e" + (m[2] || "0")), sf: countSF(m[1]) };
  }
  function exactly(v, x) { return near(v, x, 1e-9); }
  // the pupil's figures are the full value correctly rounded at the figures they wrote
  function roundedOK(p, x) {
    if (exactly(p.v, x)) { return true; }
    if (!x) { return false; }
    var half = 0.5 * Math.pow(10, Math.floor(Math.log10(Math.abs(x))) - p.sf + 1);
    return Math.abs(p.v - x) <= half * 1.0001;
  }

  // ---------- units ----------
  function unitOf(v) {
    if (!v) { return { empty: true }; }
    var hit = D.units.filter(function (x) { return x.u === v; })[0];
    return hit ? { key: hit.u, quantity: hit.quantity } : { key: null };
  }

  // ---------- relationships ----------
  function rel(id) { return D.relationships[id]; }
  function solve(r, find, v) {
    var o = r.vars[0], x = r.vars[1], y = r.vars[2];
    if (r.form === "product") { return find === o ? v[x] * v[y] : find === x ? v[o] / v[y] : v[o] / v[x]; }
    if (r.form === "difference") { return find === o ? v[x] - v[y] : find === x ? v[o] + v[y] : v[x] - v[o]; }
    return find === o ? v[x] + v[y] : find === x ? v[o] - v[y] : v[o] - v[x];
  }
  function word(s) { return sym(s).word ? sym(s).word : "<var>" + s + "</var>"; }
  function op(r) { return r.form === "product" ? " × " : r.form === "difference" ? " − " : " + "; }
  // "W = 2400 × 9.8" or "12 480 = 2400 × a"
  function show(s, v) { return S && S.item.given[s] !== undefined && exactly(v, S.item.given[s]) ? S.item.gdisp[s] : fmt(v, s); }
  function subLine(r, find, vals) {
    var t = r.vars.map(function (s) { return s === find ? word(s) : show(s, vals[s]); });
    return t[0] + " = " + t[1] + op(r) + t[2];
  }

  // ---------- items ----------
  function bodyName(b) { return (D.the || []).indexOf(b) >= 0 ? "the " + b : b; }
  function massBand() {
    var bands = D["mass-bands"], tot = 0, i;
    bands.forEach(function (b) { tot += b.weight; });
    var r = Math.random() * tot;
    for (i = 0; i < bands.length; i++) { r -= bands[i].weight; if (r < 0) { break; } }
    var b = bands[Math.min(i, bands.length - 1)];
    return { v: range([b.min, b.max, b.step]), step: b.step };
  }
  function avoided(v, body) {
    return (D.avoid || []).some(function (a) {
      return Object.keys(a).every(function (k) { return k === "body" ? a.body === body : near(v[k], a[k], 1e-9); });
    });
  }
  function genItem(it) {
    for (var tries = 0; tries < 40; tries++) {
      var g = it.gen, v = {}, body = null, given = {}, steps, rounded = {}, stepOf = {};
      if (g.body) { body = pick(D.bodies[g.body]); v.g = D.g[body]; }
      if (it.kind === "lift-off") {
        var mb = g.m === "mass-bands" ? massBand() : { v: range(g.m), step: g.m[2] };
        v.m = mb.v; stepOf.m = mb.step;
        var W = v.m * v.g;
        if (it.find === "a") {
          v.T = sf(range([g.ratio[0], g.ratio[1], 0.05]) * W, 2); rounded.T = 2;
          if (v.T < 1.15 * W) { continue; }
          given = { m: v.m, T: v.T, g: v.g };
          steps = [{ rel: "weight", find: "W", step: "weight" }, { rel: "unbalanced", find: "F", step: "unbalanced" }, { rel: "fma", find: "a", step: "fma" }];
        } else {
          v.a = range(g.a); stepOf.a = g.a[2];
          given = { m: v.m, a: v.a, g: v.g };
          steps = [{ rel: "weight", find: "W", step: "weight" }, { rel: "fma", find: "F", step: "fma-F" }, { rel: "unbalanced", find: "T", step: "thrust" }];
        }
      } else {
        var r = rel(it.rel), made = {};
        Object.keys(g).forEach(function (k) { if (k !== "body") { v[k] = range(g[k]); made[k] = true; stepOf[k] = g[k][2]; } });
        if (body) { made.g = true; }
        r.vars.forEach(function (s) { if (v[s] === undefined) { v[s] = solve(r, s, v); } });
        r.vars.forEach(function (s) { if (s !== it.find) { given[s] = made[s] ? v[s] : sf(v[s], 3); if (!made[s]) { rounded[s] = 3; } } });
        if (it.find === "g") { delete given.g; }
        steps = [{ rel: it.rel, find: it.find, step: null }];
      }
      if (avoided(v, body)) { continue; }
      var gdisp = {}, gsf = {};
      Object.keys(given).forEach(function (k) {
        var x = given[k], n;
        if (k === "g") { gdisp.g = fmt(x, "g"); gsf.g = countSF(gdisp.g); return; }
        if (rounded[k]) { n = rounded[k]; }
        else if (Math.abs(x) >= 1e5) { n = Math.floor(Math.log10(x)) - Math.floor(Math.log10(stepOf[k])) + 1; }
        if (n) { gdisp[k] = toSF(x, n); gsf[k] = Math.abs(x) >= 1e5 ? n : countSF(gdisp[k]); }
        else { gdisp[k] = plain(x.toFixed(places(stepOf[k]))); gsf[k] = countSF(gdisp[k]); }
      });
      if (Object.keys(gsf).some(function (k) { return gsf[k] < 2; })) { continue; }
      var minK = Object.keys(gsf).sort(function (a, b) { return gsf[a] - gsf[b]; })[0];
      var exact = {}; Object.keys(given).forEach(function (k) { exact[k] = given[k]; });
      steps.forEach(function (st) { exact[st.find] = solve(rel(st.rel), st.find, exact); });
      var text = it.text.replace(/\{(\w+)\}/g, function (_, k) { return k === "body" ? bodyName(body) : gdisp[k] + "\u00a0" + sym(k).unit; });
      var big = Object.keys(exact).some(function (k) { return Math.abs(exact[k]) >= 1e5; });
      return { it: it, text: text, given: given, gdisp: gdisp, body: body, steps: steps, exact: exact, big: big,
        minSF: gsf[minK], minWhat: gdisp[minK] + "\u00a0" + sym(minK).unit };
    }
    return null;
  }

  // ---------- state ----------
  function lineKinds(st, i, item) {
    var k = ["pick", "sub", "ans"];
    if (i === item.steps.length - 1 && item.it.then === "name-body") { k.push("body"); }
    return k;
  }
  function newQuestion() {
    var it = pick(MODE.items), item = genItem(it);
    S = { n: (S ? S.n : 0) + 1, item: item, si: 0, li: 0, carried: {}, rec: [], first: 0, total: 0, tries: 0, hinted: 0 };
    item.steps.forEach(function (st, i) { S.total += lineKinds(st, i, item).length; S.rec.push({ st: {} }); });
    render();
  }
  function known(s) { return S.carried[s] !== undefined ? S.carried[s] : S.item.given[s]; }
  function accepted(s) {
    var a = [known(s)];
    if (S.item.exact[s] !== undefined && !near(S.item.exact[s], a[0], 1e-9)) { a.push(S.item.exact[s]); }
    return a;
  }
  function stepNo(s) {
    for (var i = 0; i < S.si; i++) { if (S.item.steps[i].find === s) { return i + 1; } }
    return 0;
  }
  function fill(t, s, extra) {
    var o = { sym: s, name: sym(s).name, unit: sym(s).unit };
    Object.keys(extra || {}).forEach(function (k) { o[k] = extra[k]; });
    return t.replace(/\{(\w+)\}/g, function (_, k) { return o[k] !== undefined ? o[k] : "{" + k + "}"; });
  }

  // ---------- checking ----------
  function checkPick(id) {
    var st = S.item.steps[S.si];
    if (id === st.rel) { return { ok: true }; }
    var r = rel(id);
    if (r.wrong) { return { msg: r.use }; }
    return { msg: "Not this one. " + r.use + " This line finds the " + sym(st.find).name + ", <var>" + st.find + "</var>." };
  }
  function checkSub(boxes) {
    var st = S.item.steps[S.si], r = rel(st.rel), vals = {}, i, p;
    for (i = 0; i < boxes.length; i++) {
      p = parseNum(boxes[i].value);
      if (p && p.empty) { return { msg: "Fill in every box.", box: boxes[i] }; }
      if (!p) { return { msg: "Type a number, like 2400 or 5.5 × 10^5.", box: boxes[i] }; }
      vals[boxes[i].dataset.sym] = p.v;
    }
    var okFor = function (s, v) { return accepted(s).some(function (x) { return near(v, x, 0.002); }); };
    var syms = boxes.map(function (b) { return b.dataset.sym; });
    if (syms.every(function (s) { return okFor(s, vals[s]); })) { return { ok: true, vals: vals }; }
    if (r.form === "product" && syms.length === 2 && okFor(syms[0], vals[syms[1]]) && okFor(syms[1], vals[syms[0]])) {
      var sw = {}; sw[syms[0]] = vals[syms[1]]; sw[syms[1]] = vals[syms[0]];
      return { ok: true, vals: sw };
    }
    for (i = 0; i < syms.length; i++) {
      var s = syms[i], v = vals[s];
      if (okFor(s, v)) { continue; }
      var box = boxes[i], x = known(s);
      if (s === "F" && st.rel === "fma" && known("T") !== undefined && near(v, known("T"), 0.002)) {
        return { box: box, msg: "That is the thrust. In <var>F</var> = <var>ma</var>, <var>F</var> is the <b>unbalanced</b> force: thrust − weight, from step " + (stepNo("F") || 2) + "." };
      }
      var others = Object.keys(S.item.given).concat(Object.keys(S.carried));
      for (var j = 0; j < others.length; j++) {
        if (others[j] !== s && near(v, known(others[j]), 0.002)) {
          return { box: box, msg: "That is the " + sym(others[j]).name + ". This box is for the " + sym(s).name + ", <var>" + s + "</var>." };
        }
      }
      if (s === "g") {
        var b = Object.keys(D.g).filter(function (k) { return near(v, D.g[k], 1e-9); })[0];
        if (b) { return { box: box, msg: "That is <var>g</var> for " + bodyName(b) + ". This question is on " + bodyName(S.item.body) + ". Check the data sheet." }; }
      }
      if (near(v * 1000, x, 0.002)) { return { box: box, msg: "That is 1000 times too small. Use " + sym(s).unit + "." }; }
      if (near(v / 1000, x, 0.002)) { return { box: box, msg: "That is 1000 times too big. Use " + sym(s).unit + "." }; }
      var k = stepNo(s);
      return { box: box, msg: k ? "Use your answer for the " + sym(s).name + " from step " + k + "." : "Look again at the " + sym(s).name + " in the question." };
    }
    return { msg: "Check each number." };
  }
  function wrongValue(r, find, sv, v) {
    var o = r.vars[0], x = r.vars[1], y = r.vars[2];
    var other = find === x ? y : x;
    if (r.form === "product") {
      if (find === o && (near(v, sv[x] / sv[y], 0.01) || near(v, sv[y] / sv[x], 0.01))) {
        return "You divided. " + r.html + " means multiply: <var>" + o + "</var> = <var>" + x + "</var> × <var>" + y + "</var>.";
      }
      if (find !== o && near(v, sv[o] * sv[other], 0.01)) {
        return "You multiplied. Rearrange: <var>" + find + "</var> = <var>" + o + "</var> ÷ <var>" + other + "</var>.";
      }
      if (find !== o && near(v, sv[other] / sv[o], 0.01)) {
        return "That is upside down. <var>" + find + "</var> = <var>" + o + "</var> ÷ <var>" + other + "</var>.";
      }
    } else if (r.form === "difference") {
      if (find === o && near(v, sv[x] + sv[y], 0.01)) { return "You added. The weight works against the thrust, so take it away."; }
      if (find === o && near(v, sv[y] - sv[x], 0.01)) { return "Take the weight away from the thrust, not the other way round."; }
      if (find === x && near(v, Math.abs(sv[o] - sv[y]), 0.01)) {
        return "The thrust has to hold up the weight <b>and</b> give the unbalanced force: thrust = unbalanced force + weight. Add them.";
      }
    }
    return "Not quite. Check the sum on your calculator.";
  }
  function checkAns(numEl, unitEl) {
    var st = S.item.steps[S.si], r = rel(st.rel), sv = S.rec[S.si].sub, x = solve(r, st.find, sv);
    var p = parseNum(numEl.value), u = unitOf(unitEl.value), want = sym(st.find).unit;
    if (p && p.empty) { return { msg: "Type your answer in the first box.", box: numEl }; }
    if (!p) { return { msg: "Type a number, like 23 520 or 5.4 × 10^6.", box: numEl }; }
    var name = sym(st.find).name, last = S.si === S.item.steps.length - 1;
    if (!last) {
      // intermediate: no rounding part-way, every figure carried to the next step
      if (!exactly(p.v, x) && !(p.sf >= 7 && roundedOK(p, x))) {
        if (near(p.v, x, 0.02)) { return { msg: "Don't round in the middle of a calculation. Write every figure of the " + name + " (" + fmt(x, st.find) + " would be exact), then use it in the next step.", box: numEl }; }
        return { msg: wrongValue(r, st.find, sv, p.v), box: numEl };
      }
      if (u.empty || u.key === want) { return { ok: true, v: x, text: fmt(x, st.find), note: "" }; }
    } else {
      // final: SQA rounding — the fewest figures in the data, one fewer or up to two more allowed
      var n = S.item.minSF, lo = Math.max(1, n - 1), hi = n + 2;
      if (!roundedOK(p, x)) {
        if (near(p.v, x, 0.03)) { return { msg: "Nearly. Check your rounding: round the full calculator value, not a rounded one.", box: numEl }; }
        return { msg: wrongValue(r, st.find, sv, p.v), box: numEl };
      }
      var why = "The fewest significant figures in the data is " + n + " (" + S.item.minWhat + "), so give " + lo + " to " + hi + ".";
      if (!exactly(p.v, x) && p.sf < lo) { return { msg: "Too few significant figures. " + why, box: numEl }; }
      if (p.sf > hi) { return { msg: "Too many significant figures. " + why, box: numEl }; }
      if (u.key === want) { return { ok: true, v: p.v, text: toSF(p.v, p.sf), note: "" }; }
      if (u.empty) { return { msg: "Right number. Now add the unit: a final answer always needs its unit.", box: unitEl }; }
    }
    if (u.key) { return { msg: "Right number. " + u.key + " is the unit of " + u.quantity + ". What is the " + name + " measured in?", box: unitEl }; }
    return { msg: "Right number. Check the unit: what is the " + name + " measured in?", box: unitEl };
  }

  // ---------- hints and "show me" ----------
  function hintFor(kind) {
    var st = S.item.steps[S.si], r = rel(st.rel);
    if (kind === "pick") { return (st.step ? D.steps[st.step].lead + " " : "") + fill(D.hints.pick, st.find); }
    if (kind === "sub") {
      var h = D.hints.sub, needsG = r.vars.indexOf("g") >= 0 && st.find !== "g";
      if (needsG && S.item.body) { h += " Look up <var>g</var> for " + bodyName(S.item.body) + " on the data sheet."; }
      if (r.vars.some(function (s) { return s !== st.find && S.carried[s] !== undefined; })) { h += " Use your answer from the step before."; }
      return h;
    }
    if (kind === "ans") {
      var key = (st.find === r.vars[0] ? "out-" : "in-") + r.form, n = S.item.minSF;
      var tail = S.si === S.item.steps.length - 1
        ? " Round only now: the fewest significant figures in the data is " + n + ", so give " + Math.max(1, n - 1) + " to " + (n + 2) + "."
        : " Don't round: keep every figure for the next step.";
      return fill(D.hints.ans[key] || "", st.find, { other: sym(r.vars[0]).name }) + tail;
    }
    return "Find " + S.rec[S.si].text + " N kg⁻¹ in the data sheet table.";
  }

  // ---------- render ----------
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function stepTitle(st, i) {
    var n = S.item.steps.length, lab = st.step ? D.steps[st.step].label : sym(st.find).name.replace(/^./, function (c) { return c.toUpperCase(); });
    return n > 1 ? "Step " + (i + 1) + " of " + n + " · " + lab : lab;
  }
  function doneLine(st, i) {
    var rc = S.rec[i], r = rel(st.rel), parts = [r.html];
    if (rc.sub) { parts.push(subLine(r, st.find, rc.sub)); }
    if (rc.ans !== undefined) { parts.push("<var>" + st.find + "</var> = <b>" + rc.text + "\u00a0" + sym(st.find).unit + "</b>"); }
    var t = parts.join("<span class=\"stp-sep\">;</span> ");
    if (rc.body) { t += "<span class=\"stp-sep\">;</span> it is <b>" + bodyName(rc.body) + "</b>"; }
    if (rc.note) { t += " <span class=\"stp-note\">" + rc.note + "</span>"; }
    return t;
  }
  function mark(state) { return state === "ok" ? "<span class=\"stp-mark is-ok\">✓ right first time</span>" : "<span class=\"stp-mark is-shown\">✓ shown or retried</span>"; }

  function lineHTML(kind) {
    var st = S.item.steps[S.si], r = rel(st.rel), h = "";
    var hintBtn = "<button type=\"button\" class=\"stp-hint\" data-act=\"hint\">Hint</button>";
    var inline = kind === "sub" || kind === "ans";
    var help = (inline ? "" : "<div class=\"stp-help\">" + hintBtn + "</div>") +
      "<p class=\"stp-hinttext\" hidden></p><p class=\"stp-fb\" aria-live=\"polite\"></p>";
    var tenBtn = S.item.big ? "<button type=\"button\" class=\"stp-ten\" data-act=\"ten\" aria-label=\"Type times ten to the power\">×10ⁿ</button>" : "";
    if (kind === "pick") {
      h = "<p class=\"stp-ask\">Which relationship do you need?</p><div class=\"stp-choices\">" +
        MODE.choices.map(function (id) { return "<button type=\"button\" class=\"stp-choice\" data-act=\"pick\" data-id=\"" + id + "\">" + rel(id).html + "</button>"; }).join("") + "</div>";
    } else if (kind === "sub") {
      var t = r.vars.map(function (s) {
        if (s === st.find) { return "<span class=\"stp-sym\">" + word(s) + "</span>"; }
        return "<input class=\"stp-in\" type=\"text\" inputmode=\"decimal\" autocomplete=\"off\" spellcheck=\"false\" data-sym=\"" + s + "\" placeholder=\"" + s + "\" aria-label=\"" + sym(s).name + " in " + sym(s).unit + "\">";
      });
      h = "<p class=\"stp-ask\">Put the numbers in.</p><div class=\"stp-eq\">" + t[0] +
        " <span class=\"stp-op\">=</span> " + t[1] + " <span class=\"stp-op\">" + op(r).trim() + "</span> " + t[2] + tenBtn +
        "<button type=\"button\" class=\"stp-check\" data-act=\"check\">Check</button>" + hintBtn + "</div>";
    } else if (kind === "ans") {
      var fin = S.si === S.item.steps.length - 1;
      h = "<p class=\"stp-ask\">Work out the " + sym(st.find).name + (fin ? ". Round it, and give the unit.</p>" : ". Keep every figure: don't round yet.</p>") + "<div class=\"stp-eq\"><span class=\"stp-sym\"><var>" + st.find + "</var></span> <span class=\"stp-op\">=</span> " +
        "<input class=\"stp-in stp-num\" type=\"text\" inputmode=\"decimal\" autocomplete=\"off\" spellcheck=\"false\" data-role=\"num\" aria-label=\"" + sym(st.find).name + ", number\">" +
        "<select class=\"stp-unit\" data-role=\"unit\" aria-label=\"" + sym(st.find).name + ", unit\"><option value=\"\">unit</option>" +
          D.units.map(function (x) { return "<option>" + x.u + "</option>"; }).join("") + "</select>" + tenBtn +
        "<button type=\"button\" class=\"stp-check\" data-act=\"check\">Check</button>" + hintBtn + "</div>";
    } else {
      h = "<p class=\"stp-ask\">Use the data sheet. Where is the lander?</p><div class=\"stp-choices\">" +
        Object.keys(D.g).filter(function (b) { return b !== "Sun"; }).map(function (b) { return "<button type=\"button\" class=\"stp-choice\" data-act=\"body\" data-id=\"" + b + "\">" + b + "</button>"; }).join("") + "</div>";
    }
    return "<li class=\"stp-line is-active\" data-kind=\"" + kind + "\">" + h + help + "</li>";
  }

  function render() {
    var item = S.item;
    $("stp-qn").textContent = "Question " + S.n;
    $("stp-text").innerHTML = item.text;
    var out = item.steps.map(function (st, i) {
      var kinds = lineKinds(st, i, item);
      if (i < S.si) {
        return "<li class=\"stp-step is-done\"><h3 class=\"stp-step-h\">" + stepTitle(st, i) + "</h3><p class=\"stp-done\">" + doneLine(st, i) + "</p></li>";
      }
      if (i > S.si) { return "<li class=\"stp-step is-todo\"><h3 class=\"stp-step-h\">" + stepTitle(st, i) + "</h3></li>"; }
      var rc = S.rec[i], lines = "";
      for (var k = 0; k < S.li; k++) {
        var kind = kinds[k], show = "";
        if (kind === "pick") { show = rel(st.rel).html; }
        if (kind === "sub") { show = subLine(rel(st.rel), st.find, rc.sub); }
        if (kind === "ans") { show = "<var>" + st.find + "</var> = <b>" + rc.text + "\u00a0" + sym(st.find).unit + "</b>"; }
        if (kind === "body") { show = "It is <b>" + bodyName(rc.body) + "</b>"; }
        lines += "<li class=\"stp-line is-done\"><span class=\"stp-work\">" + show + "</span>" + mark(rc.st[kind]) + (rc.note && kind === "ans" ? "<span class=\"stp-note\">" + rc.note + "</span>" : "") + "</li>";
      }
      if (S.li < kinds.length) { lines += lineHTML(kinds[S.li]); }
      return "<li class=\"stp-step is-active\"><h3 class=\"stp-step-h\">" + stepTitle(st, i) + "</h3><ol class=\"stp-lines\">" + lines + "</ol></li>";
    }).join("");
    $("stp-steps").innerHTML = out;
    $("stp-steps").hidden = false;
    renderMap();
    var done = S.si >= item.steps.length;
    $("stp-done").hidden = !done;
    if (done) { finish(); }
  }

  function renderMap() {
    $("stp-map").innerHTML = S.item.steps.map(function (st, i) {
      var cls = i < S.si ? "is-done" : i === S.si ? "is-active" : "";
      var lab = st.step ? D.steps[st.step].label : sym(st.find).name.replace(/^./, function (c) { return c.toUpperCase(); });
      return "<li class=\"" + cls + "\">" + (i < S.si ? "<span aria-hidden=\"true\">✓</span> " : "") + lab + "</li>";
    }).join("");
  }

  function finish() {
    var it = S.item;
    var html = "<h3 class=\"stp-done-h\">Done. Right first time: " + S.first + " of " + S.total + " lines.</h3>" +
      "<p class=\"stp-done-sub\">Your working, as you would write it:</p><ol class=\"stp-answer\">" +
      it.steps.map(function (st, i) { return "<li>" + doneLine(st, i) + "</li>"; }).join("") + "</ol>" +
      (MODE.done ? "<p class=\"stp-warn\"><b>Watch out:</b> " + MODE.done + "</p>" : "") +
      "<button type=\"button\" class=\"stp-next\" data-act=\"next\">Next question</button>";
    $("stp-done").innerHTML = html;
    tally(S.first, S.total);
    var b = $("stp-done").querySelector(".stp-next");
    if (b && S.focus) { b.focus({ preventScroll: false }); }
  }

  function tally(first, total) {
    var t = { q: 0, first: 0, lines: 0 }, key = SET.id + ":" + MODE.id, all = {};
    try { all = JSON.parse(localStorage.getItem(STORE) || "{}") || {}; t = all[key] || t; } catch (e) { /* storage blocked */ }
    if (total) { t.q += 1; t.first += first; t.lines += total; all[key] = t; try { localStorage.setItem(STORE, JSON.stringify(all)); } catch (e) { /* storage blocked */ } }
    $("stp-tally").textContent = t.q ? "On this device: " + t.q + " question" + (t.q === 1 ? "" : "s") + ", " + t.first + " of " + t.lines + " lines right first time." : "";
  }

  function advance(kind, state) {
    var rc = S.rec[S.si];
    rc.st[kind] = state;
    if (state === "ok") { S.first += 1; }
    var kinds = lineKinds(S.item.steps[S.si], S.si, S.item);
    S.li += 1; S.tries = 0; S.hinted = 0;
    if (S.li >= kinds.length) { S.si += 1; S.li = 0; }
    S.focus = true;
    render();
    var next = $("stp-steps").querySelector(".stp-line.is-active input, .stp-line.is-active .stp-choice");
    if (next) { next.focus({ preventScroll: true }); }
  }

  function say(line, msg, box) {
    var fb = line.querySelector(".stp-fb");
    fb.innerHTML = msg;
    fb.classList.add("is-wrong");
    line.querySelectorAll(".stp-in").forEach(function (b) { b.removeAttribute("aria-invalid"); });
    if (box) { box.setAttribute("aria-invalid", "true"); box.focus(); }
    S.tries += 1;
  }

  function act(btn) {
    var a = btn.dataset.act, line = btn.closest(".stp-line"), kind = line && line.dataset.kind;
    if (a === "next") { S.focus = true; newQuestion(); return; }
    if (a === "ten") {
      var box = line.querySelector(".stp-in[data-last]:not(.stp-unit)") || line.querySelector(".stp-in:not(.stp-unit)");
      box.value = box.value.replace(/\s+$/, "") + " × 10^";
      box.focus(); return;
    }
    if (a === "hint") { hint(line, kind, btn); return; }
    var st = S.item.steps[S.si], res;
    if (a === "pick") {
      res = checkPick(btn.dataset.id);
      if (res.ok) { advance("pick", S.tries || S.hinted ? "shown" : "ok"); return; }
      btn.classList.add("is-wrong"); btn.setAttribute("aria-disabled", "true");
      say(line, res.msg); return;
    }
    if (a === "body") {
      var b = btn.dataset.id;
      if (b === S.item.body) { S.rec[S.si].body = b; advance("body", S.tries || S.hinted ? "shown" : "ok"); return; }
      btn.classList.add("is-wrong"); btn.setAttribute("aria-disabled", "true");
      say(line, "<var>g</var> on " + bodyName(b) + " is " + fmt(D.g[b], "g") + " N kg⁻¹. Your answer was " + S.rec[S.si].text + " N kg⁻¹. Find the one that matches."); return;
    }
    if (a === "check" && kind === "sub") {
      res = checkSub(Array.prototype.slice.call(line.querySelectorAll(".stp-in")));
      if (res.ok) { S.rec[S.si].sub = res.vals; advance("sub", S.tries || S.hinted ? "shown" : "ok"); return; }
      say(line, res.msg, res.box); return;
    }
    if (a === "check" && kind === "ans") {
      res = checkAns(line.querySelector(".stp-num"), line.querySelector(".stp-unit"));
      if (res.ok) {
        S.rec[S.si].ans = res.v; S.rec[S.si].text = res.text; S.rec[S.si].note = res.note; S.carried[st.find] = res.v;
        advance("ans", S.tries || S.hinted ? "shown" : "ok"); return;
      }
      say(line, res.msg, res.box);
    }
  }

  function hint(line, kind, btn) {
    var ht = line.querySelector(".stp-hinttext");
    if (!S.hinted) {
      S.hinted = 1; ht.innerHTML = hintFor(kind); ht.hidden = false;
      btn.textContent = "Show me this line"; return;
    }
    var st = S.item.steps[S.si], r = rel(st.rel), rc = S.rec[S.si];
    if (kind === "pick") { advance("pick", "shown"); return; }
    if (kind === "sub") {
      rc.sub = {}; r.vars.forEach(function (s) { if (s !== st.find) { rc.sub[s] = known(s); } });
      advance("sub", "shown"); return;
    }
    if (kind === "ans") {
      var x = solve(r, st.find, rc.sub), fin = S.si === S.item.steps.length - 1;
      rc.ans = fin ? sf(x, S.item.minSF) : x; rc.text = fin ? toSF(x, S.item.minSF) : fmt(x, st.find); S.carried[st.find] = rc.ans; advance("ans", "shown"); return;
    }
    rc.body = S.item.body; advance("body", "shown");
  }

  // ---------- modes ----------
  function setMode(id, push) {
    MODE = SET.modes.filter(function (m) { return m.id === id; })[0] || SET.modes[0];
    root.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.mode === MODE.id ? "true" : "false"); });
    $("stp-intro").innerHTML = MODE.intro;
    $("stp-sheet").hidden = !MODE.datasheet;
    if (push) {
      try { history.replaceState(null, "", "?set=" + encodeURIComponent(SET.id) + "&mode=" + encodeURIComponent(MODE.id)); } catch (e) { /* file:// */ }
    }
    S = undefined;
    newQuestion();
    tally(0, 0);
  }

  function start() {
    root = $("stepper");
    var el = $("stepper-data");
    if (!root || !el) { return; }
    D = JSON.parse(el.textContent);
    var q = new URLSearchParams(location.search), sid = q.get("set") || Object.keys(D.sets)[0];
    if (!D.sets[sid]) { sid = Object.keys(D.sets)[0]; }
    SET = D.sets[sid]; SET.id = sid;
    $("stp-back").href = SET.back.href; $("stp-back-t").textContent = SET.back.text;
    $("stp-modes").innerHTML = SET.modes.map(function (m) { return "<button type=\"button\" data-mode=\"" + m.id + "\" aria-pressed=\"false\">" + m.tab + "</button>"; }).join("");
    $("stp-g").innerHTML = Object.keys(D.g).map(function (b) { return "<tr><th scope=\"row\">" + b + "</th><td>" + fmt(D.g[b], "g") + "</td></tr>"; }).join("");
    root.addEventListener("click", function (e) {
      var m = e.target.closest("[data-mode]");
      if (m) { setMode(m.dataset.mode, true); return; }
      if (e.target.closest("#stp-new")) { newQuestion(); return; }
      var b = e.target.closest("[data-act]");
      if (b && b.getAttribute("aria-disabled") !== "true") { act(b); }
    });
    root.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || !e.target.classList.contains("stp-in")) { return; }
      e.preventDefault();
      var c = e.target.closest(".stp-line").querySelector(".stp-check");
      if (c) { act(c); }
    });
    root.addEventListener("focusin", function (e) {
      if (!e.target.classList.contains("stp-in")) { return; }
      e.target.closest(".stp-line").querySelectorAll(".stp-in").forEach(function (b) { b.removeAttribute("data-last"); });
      e.target.setAttribute("data-last", "");
    });
    setMode(q.get("mode"), false);
    // read-only hook for the browser check (scripts), never used by the page itself
    if (q.get("check") === "1") { window.__stepper = { state: function () { return S; }, parse: parseNum, countSF: countSF, toSF: toSF, unit: unitOf }; }
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); } else { start(); }
})();
