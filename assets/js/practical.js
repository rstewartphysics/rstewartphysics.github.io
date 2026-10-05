/* ============================================================
   Practical pages: a lesson on the screen (S3 Engineering, Booklet 6 pneumatics; plan:
   claude-work/s3-eng-b6-b7/WEB-PRACTICALS-PLAN.md). One engine; each page supplies its lesson
   as JSON in <script type="application/json" id="practicalData">.

   One screen per step of the lesson, each fitting a landscape iPad (1180 x 760). Words on the
   left, the picture beside them (Picture / Help / Challenge tabs). Role screens show a card for
   each role the pupil chose. Everything is saved in this browser only (localStorage) and
   nothing is sent anywhere.
   ============================================================ */
(function () {
  "use strict";

  var DATA = JSON.parse(document.getElementById("practicalData").textContent);
  var KEY = DATA.storageKey;
  var IMG = DATA.imgBase || "";
  var root = document.getElementById("practical");
  var live = document.getElementById("practicalLive");
  var N = DATA.screens.length;

  function fresh() {
    return { roles: [], screen: 0, ticks: {}, text: {}, choice: {}, miss: {}, checked: {},
      marks: {}, pause: {}, rate: {}, set: {}, tab: {}, cloze: {} };
  }
  function load() {
    var s;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { s = null; }
    var f = fresh();
    if (!s || typeof s !== "object") { return f; }
    Object.keys(f).forEach(function (k) { if (s[k] == null || typeof s[k] !== typeof f[k]) { s[k] = f[k]; } });
    if (s.screen < 0 || s.screen >= N) { s.screen = 0; }
    return s;
  }
  var S = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: work still shows */ }
  }
  function say(msg) {
    if (!live) { return; }
    live.textContent = "";
    setTimeout(function () { live.textContent = msg; }, 30);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }
  function btn(cls, text, fn) {
    var b = el("button", cls, text);
    b.type = "button";
    if (fn) { b.addEventListener("click", fn); }
    return b;
  }
  function svg(cls, inner) {
    var w = el("span", cls);
    w.setAttribute("aria-hidden", "true");
    w.innerHTML = '<svg viewBox="0 0 48 48" focusable="false">' + inner + "</svg>";
    return w;
  }

  // How the class works on a step. One drawn mark each: ink outline, the tag colour as accent.
  var MODES = {
    own: { label: "On your own",
      ic: '<circle class="a" cx="24" cy="15" r="7"/><path d="M10 41c0-9 6-14 14-14s14 5 14 14"/>' },
    partner: { label: "With your partner",
      ic: '<circle cx="15" cy="17" r="6"/><path d="M4 40c0-7 5-12 11-12s11 5 11 12"/>' +
          '<circle class="a" cx="33" cy="17" r="6"/><path class="a" d="M22 40c0-7 5-12 11-12s11 5 11 12"/>' },
    team: { label: "With your team",
      ic: '<circle cx="10" cy="20" r="5"/><path d="M2 40c0-6 3-10 8-10s8 4 8 10"/>' +
          '<circle cx="38" cy="20" r="5"/><path d="M30 40c0-6 3-10 8-10s8 4 8 10"/>' +
          '<circle class="a" cx="24" cy="15" r="6"/><path class="a" d="M14 40c0-8 4-13 10-13s10 5 10 13"/>' },
    board: { label: "Eyes on the board",
      ic: '<path d="M4 24c5-8 12-12 20-12s15 4 20 12c-5 8-12 12-20 12S9 32 4 24z"/><circle class="a" cx="24" cy="24" r="6"/>' }
  };
  var TICK = '<path class="a" d="M10 25l9 9 19-20"/>';

  function modeTag(mode) {
    var m = MODES[mode];
    var p = el("p", "pr-mode");
    p.appendChild(svg("pr-mode-ic", m.ic));
    p.appendChild(el("span", null, m.label));
    return p;
  }

  // The instruction box at the top of every step: how you work, up to 3 steps, Done when.
  function doBox(sc) {
    var box = el("div", "pr-do" + (sc.mode ? " mode-" + sc.mode : ""));
    if (MODES[sc.mode]) { box.appendChild(modeTag(sc.mode)); }
    if (sc.do) {
      var ol = el("ol", "pr-do-steps");
      sc.do.forEach(function (t) { var li = el("li"); rich(t, li); ol.appendChild(li); });
      box.appendChild(ol);
    } else if (sc.team) {
      box.appendChild(para("pr-team", sc.team));
    }
    if (sc.done) {
      var dn = el("p", "pr-done");
      dn.appendChild(svg("pr-done-ic", TICK));
      var t = el("span");
      t.appendChild(el("strong", null, "Done when: "));
      rich(sc.done, t);
      dn.appendChild(t);
      box.appendChild(dn);
    }
    return box;
  }

  function turnName(t) {
    if (t.name) { return t.name; }
    return role(t.who).name;
  }
  function turnHas(t, rid) {
    return [].concat(t.who || []).indexOf(rid) >= 0;
  }
  // Who goes when, left to right; the pupil's own turns are marked.
  function turnStrip(sc, mine) {
    var ol = el("ol", "pr-turns");
    ol.setAttribute("aria-label", "Who goes when");
    sc.turns.forEach(function (t, i) {
      var you = mine.some(function (r) { return turnHas(t, r); });
      var li = el("li", you ? "is-you" : null);
      if (i) { var arr = el("span", "pr-turn-arrow", "\u25B8"); arr.setAttribute("aria-hidden", "true"); li.appendChild(arr); }
      li.appendChild(el("strong", null, turnName(t)));
      if (t.text) { li.appendChild(el("span", "pr-turn-text", t.text)); }
      if (you) { li.appendChild(el("span", "visually-hidden", " (you)")); }
      ol.appendChild(li);
    });
    return ol;
  }
  function startWhen(sc, rid) {
    if (!sc.turns) { return null; }
    for (var i = 0; i < sc.turns.length; i++) {
      if (turnHas(sc.turns[i], rid)) {
        return i === 0 ? "You start." : "Start when: the " + turnName(sc.turns[i - 1]) + " is done.";
      }
    }
    return null;
  }
  function img(src, alt, cls) {
    var i = el("img", cls || "");
    i.src = IMG + src;
    i.alt = alt || "";
    if (!alt) { i.setAttribute("aria-hidden", "true"); }
    i.decoding = "async";
    return i;
  }
  function role(id) {
    for (var i = 0; i < DATA.roles.length; i++) { if (DATA.roles[i].id === id) { return DATA.roles[i]; } }
    return null;
  }

  // ------------------------------------------------------------ glossary pop-ups
  var pop = null, popFor = null;
  function closePop(back) {
    if (!pop) { return; }
    pop.remove();
    if (popFor) {
      popFor.setAttribute("aria-expanded", "false");
      if (back) { popFor.focus(); }
    }
    pop = null;
    popFor = null;
  }
  function openPop(term, key) {
    var g = DATA.glossary[key];
    if (!g) { return; }
    if (popFor === term) { closePop(false); return; }
    closePop(false);
    pop = el("div", "pr-pop");
    pop.id = "prPop";
    pop.setAttribute("role", "note");
    if (g.pic) {
      var fig = el("div", "pr-pop-pic");
      fig.appendChild(img(g.pic, g.alt || ""));
      pop.appendChild(fig);
    }
    var t = el("p");
    t.appendChild(el("strong", null, g.word));
    t.appendChild(document.createTextNode(": " + g.text));
    pop.appendChild(t);
    pop.appendChild(btn("pr-btn pr-btn-quiet", "Close", function () { closePop(true); }));
    document.body.appendChild(pop);
    term.setAttribute("aria-expanded", "true");
    term.setAttribute("aria-controls", "prPop");
    popFor = term;
    var r = term.getBoundingClientRect();
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var x = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
    var y = r.bottom + 6;
    if (y + h > window.innerHeight - 8) { y = Math.max(8, r.top - h - 6); }
    pop.style.left = x + "px";
    pop.style.top = y + "px";
    say(g.word + ": " + g.text);
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closePop(true); } });
  document.addEventListener("click", function (e) {
    if (pop && !pop.contains(e.target) && e.target !== popFor && !(popFor && popFor.contains(e.target))) { closePop(false); }
  });
  window.addEventListener("resize", function () { closePop(false); });

  // **bold** and {glossaryKey} or {glossaryKey|shown words}
  function rich(text, into) {
    var host = into || document.createDocumentFragment();
    var re = /\*\*(.+?)\*\*|\{([a-z0-9-]+)(?:\|([^}]+))?\}/g, m, last = 0;
    while ((m = re.exec(text))) {
      if (m.index > last) { host.appendChild(document.createTextNode(text.slice(last, m.index))); }
      if (m[1] != null) {
        host.appendChild(el("strong", null, m[1]));
      } else {
        var key = m[2];
        var shown = m[3] || (DATA.glossary[key] ? DATA.glossary[key].word : key);
        var b = btn("pr-term", shown);
        b.setAttribute("aria-expanded", "false");
        b.setAttribute("aria-label", shown + ": what does it mean?");
        (function (bb, k) { bb.addEventListener("click", function (e) { e.stopPropagation(); openPop(bb, k); }); })(b, key);
        host.appendChild(b);
      }
      last = re.lastIndex;
    }
    if (last < text.length) { host.appendChild(document.createTextNode(text.slice(last))); }
    return host;
  }
  function para(cls, text) { var p = el("p", cls); rich(text, p); return p; }

  // ------------------------------------------------------------ help ladder (hints, then an example)
  function ladder(b) {
    var steps = (b.hints || []).map(function (h, k) { return { label: "Hint " + (k + 1), text: h }; });
    if (b.example) { steps.push({ label: "Example (a different job)", text: b.example }); }
    if (!steps.length) { return null; }
    var box = el("div", "pr-ladder");
    var shown = el("div", "pr-ladder-shown");
    box.appendChild(shown);
    var k = 0;
    var more = btn("pr-btn pr-btn-quiet pr-help-btn", "Hint", function () {
      var s = steps[k];
      var p = el("p", "pr-hint");
      p.appendChild(el("strong", null, s.label + ": "));
      rich(s.text, p);
      shown.appendChild(p);
      say(s.label + ": " + s.text.replace(/\*\*|\{|\}/g, ""));
      k++;
      if (k >= steps.length) { more.remove(); }
      else { more.textContent = k === steps.length - 1 && b.example ? "Show an example" : "Another hint"; }
    });
    box.appendChild(more);
    return box;
  }

  // ------------------------------------------------------------ blocks
  var BLOCK = {};

  BLOCK.p = function (b) { return para("pr-p" + (b.lead ? " pr-lead" : ""), b.text); };

  BLOCK.list = function (b) {
    var ul = el(b.numbered ? "ol" : "ul", "pr-list");
    b.items.forEach(function (t) { var li = el("li"); rich(t, li); ul.appendChild(li); });
    return ul;
  };

  BLOCK.parts = function (b) {
    var ul = el("ul", "pr-parts");
    b.items.forEach(function (it) {
      var li = el("li");
      if (it.pic) { li.appendChild(img(it.pic, "", "pr-parts-pic")); }
      var t = el("span");
      rich(it.text, t);
      li.appendChild(t);
      ul.appendChild(li);
    });
    return ul;
  };

  BLOCK.step = function (b, id) {
    var box = el("label", "pr-step" + (b.safety ? " is-safety" : "") + (b.booklet ? " is-booklet" : ""));
    var cb = el("input");
    cb.type = "checkbox";
    cb.checked = !!S.ticks[id];
    cb.addEventListener("change", function () {
      S.ticks[id] = cb.checked;
      save();
      say(cb.checked ? "Ticked." : "Tick removed.");
      waitingCheck();
    });
    box.appendChild(cb);
    var t = el("span", "pr-step-text");
    if (b.safety) { t.appendChild(el("strong", "pr-safety-word", "SAFETY ")); }
    if (b.booklet) { t.appendChild(el("strong", null, "Booklet: ")); }
    rich(b.text, t);
    box.appendChild(t);
    if (b.pic) { box.appendChild(img(b.pic, "", "pr-step-pic")); }
    return box;
  };
  BLOCK.booklet = function (b, id) { return BLOCK.step({ text: b.text, booklet: true }, id); };

  BLOCK.link = function (b) {
    var p = el("p", "pr-linkline");
    var a = el("a", "pr-btn pr-btn-link");
    a.href = b.href;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = b.text;
    a.appendChild(el("span", "visually-hidden", " (opens in a new tab)"));
    p.appendChild(a);
    if (b.note) { p.appendChild(el("span", "pr-link-note", b.note)); }
    return p;
  };

  BLOCK.fig = function (b) { return figure(b); };

  function qHead(b, tag) {
    var h = el(tag || "p", "pr-q");
    rich(b.q, h);
    if (b.marks) { h.appendChild(el("span", "pr-marks", " (" + b.marks + ")")); }
    return h;
  }

  BLOCK.tap = function (b, id) {
    var box = el("div", "pr-tap");
    box.setAttribute("role", "group");
    var q = qHead(b);
    q.id = "q-" + id;
    box.setAttribute("aria-labelledby", q.id);
    var row = el("div", "pr-tap-row");
    if (b.pic) { row.appendChild(img(b.pic, b.alt || "", "pr-tap-pic")); }
    var right = el("div", "pr-tap-right");
    right.appendChild(q);
    var opts = el("div", "pr-options");
    var fb = el("p", "pr-feedback");
    fb.setAttribute("aria-live", "polite");
    var help = ladder(b);
    function paint() {
      var c = S.choice[id];
      var answered = typeof c === "number";
      Array.prototype.forEach.call(opts.children, function (o, k) {
        o.disabled = answered;
        o.classList.toggle("is-right", answered && k === b.answer);
        o.classList.toggle("is-wrong", answered && k === c && c !== b.answer);
        o.setAttribute("aria-pressed", answered && k === c ? "true" : "false");
      });
      fb.textContent = "";
      if (answered) {
        var ok = c === b.answer;
        fb.className = "pr-feedback " + (ok ? "is-right" : "is-wrong");
        fb.appendChild(el("strong", null, ok ? "Right. " : "Not this one. The answer is: " + b.options[b.answer] + ". "));
        rich(b.why, fb);
        if (help) { help.hidden = true; }
      }
    }
    b.options.forEach(function (o, k) {
      opts.appendChild(btn("pr-option", o, function () {
        if (typeof S.choice[id] === "number") { return; }
        S.choice[id] = k;
        if (k !== b.answer && b.back) { S.miss[id] = b.back; }
        save();
        paint();
        say((k === b.answer ? "Right. " : "Not this one. The answer is " + b.options[b.answer] + ". ") + b.why.replace(/\*\*|\{|\}/g, ""));
      }));
    });
    right.appendChild(opts);
    if (help) { right.appendChild(help); }
    right.appendChild(fb);
    row.appendChild(right);
    box.appendChild(row);
    paint();
    return box;
  };

  BLOCK.predict = function (b, id) {
    var box = el("fieldset", "pr-predict");
    var lg = el("legend");
    lg.appendChild(el("strong", null, (b.kind || "Predict") + (b.q ? ": " : "")));
    if (b.q) { rich(b.q, lg); }
    box.appendChild(lg);
    var row = el("div", "pr-options");
    var note = el("p", "pr-saved");
    note.setAttribute("aria-live", "polite");
    function paint() {
      Array.prototype.forEach.call(row.children, function (c, j) {
        c.setAttribute("aria-pressed", S.choice[id] === j ? "true" : "false");
      });
      note.textContent = typeof S.choice[id] === "number" ? (b.saved || "Saved. The kit will show you.") : "";
    }
    b.options.forEach(function (o, k) {
      row.appendChild(btn("pr-option", o, function () { S.choice[id] = k; save(); paint(); }));
    });
    box.appendChild(row);
    box.appendChild(note);
    paint();
    return box;
  };

  // what the pupil chose in an earlier predict block
  BLOCK.recall = function (b) {
    var p = el("p", "pr-recall");
    p.appendChild(el("strong", null, b.q + " "));
    b.from.forEach(function (f, k) {
      var c = S.choice[f.id];
      if (k) { p.appendChild(document.createTextNode(" ")); }
      p.appendChild(el("span", "pr-recall-label", f.label + ": "));
      p.appendChild(document.createTextNode((typeof c === "number" ? f.options[c] : "no prediction saved") + "."));
    });
    return p;
  };

  function insertAt(ta, text) {
    var s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
    if (typeof s !== "number" || document.activeElement !== ta) { s = e = v.length; }
    var pad = s > 0 && !/\s$/.test(v.slice(0, s)) ? " " : "";
    ta.value = v.slice(0, s) + pad + text + v.slice(e);
    var at = s + pad.length + text.length;
    ta.focus();
    try { ta.setSelectionRange(at, at); } catch (err) { /* not focusable */ }
    ta.dispatchEvent(new Event("input"));
  }

  // sentence starters and words to tap into the answer box that target() returns
  function wordBank(b, target) {
    if (!(b.starters && b.starters.length) && !(b.words && b.words.length)) { return null; }
    var panel = el("div", "pr-bank");
    panel.hidden = true;
    var open = btn("pr-btn pr-btn-quiet pr-help-btn", "Word bank", function () {
      panel.hidden = !panel.hidden;
      open.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
    });
    open.setAttribute("aria-expanded", "false");
    function chips(list, label, cls) {
      if (!list || !list.length) { return; }
      var row = el("div", "pr-chips");
      row.setAttribute("role", "group");
      row.setAttribute("aria-label", label);
      row.appendChild(el("span", "pr-chips-label", label));
      list.forEach(function (w) { row.appendChild(btn("pr-chip " + cls, w, function () { insertAt(target(), w); })); });
      panel.appendChild(row);
    }
    chips(b.starters, "Start with", "is-starter");
    chips(b.words, "Words", "is-word");
    return { button: open, panel: panel };
  }

  BLOCK.write = function (b, id) {
    var box = el("div", "pr-write");
    var l = el("label", "pr-q");
    l.htmlFor = "t-" + id;
    if (b.kind) { l.appendChild(el("strong", null, b.kind + ": ")); }
    rich(b.q, l);
    if (b.marks) { l.appendChild(el("span", "pr-marks", " (" + b.marks + ")")); }
    box.appendChild(l);
    var ta = el("textarea");
    ta.id = "t-" + id;
    ta.rows = b.rows || 2;
    ta.value = S.text[id] || "";
    ta.setAttribute("autocomplete", "off");
    ta.spellcheck = true;
    box.appendChild(ta);

    var tools = el("div", "pr-write-tools");
    var bank = wordBank(b, function () { return ta; });
    var help = ladder(b);
    var res = el("div", "pr-model");
    res.setAttribute("aria-live", "polite");
    var check = null;
    if (b.model) {
      check = btn("pr-btn pr-btn-check", "Check", function () {
        if (ta.value.trim().length < 3) { say("Write your answer first, then check."); ta.focus(); return; }
        S.checked[id] = true;
        save();
        paintModel(true);
      });
    }
    ta.addEventListener("input", function () {
      S.text[id] = ta.value;
      save();
      if (check) { check.disabled = ta.value.trim().length < 3; }
    });
    if (check) { check.disabled = ta.value.trim().length < 3; tools.appendChild(check); }
    if (bank) { tools.appendChild(bank.button); }
    if (help) { tools.appendChild(help); }
    box.appendChild(tools);
    if (bank) { box.appendChild(bank.panel); }
    box.appendChild(res);

    function paintModel(announce) {
      res.textContent = "";
      if (!S.checked[id]) { return; }
      if (check) { check.hidden = true; }
      var h = el("p", "pr-model-head");
      h.appendChild(el("strong", null, b.modelTitle || (b.marks ? "Model answer" : "One good answer")));
      res.appendChild(h);
      var ul = el("ul", "pr-list");
      b.model.forEach(function (t) { var li = el("li"); rich(t, li); ul.appendChild(li); });
      res.appendChild(ul);
      if (b.marks) {
        var row = el("div", "pr-selfmark");
        row.setAttribute("role", "group");
        row.setAttribute("aria-label", "Mark your answer");
        row.appendChild(el("span", "pr-chips-label", "Mark yours:"));
        for (var m = 0; m <= b.marks; m++) {
          (function (mm) {
            var x = btn("pr-option pr-mark", mm + " out of " + b.marks, function () {
              S.marks[id] = mm;
              if (mm < b.marks && b.back) { S.miss[id] = b.back; } else { delete S.miss[id]; }
              save();
              Array.prototype.forEach.call(row.querySelectorAll(".pr-mark"), function (y, j) {
                y.setAttribute("aria-pressed", j === mm ? "true" : "false");
              });
              say("Saved: " + mm + " out of " + b.marks + ".");
            });
            x.setAttribute("aria-pressed", S.marks[id] === mm ? "true" : "false");
            row.appendChild(x);
          })(m);
        }
        res.appendChild(row);
      }
      if (announce) { say((b.marks ? "Model answer: " : "One good answer: ") + b.model.join(" ").replace(/\*\*|\{|\}/g, "")); }
    }
    paintModel(false);
    return box;
  };

  BLOCK.compare = function (b, id) {
    var box = el("div", "pr-compare");
    var t = el("table", "pr-table");
    var thead = el("thead"), tr = el("tr");
    tr.appendChild(el("th", null, b.corner || ""));
    b.cols.forEach(function (c) { var th = el("th", null, c); th.scope = "col"; tr.appendChild(th); });
    thead.appendChild(tr);
    t.appendChild(thead);
    var tb = el("tbody");
    var first = null;
    b.rows.forEach(function (r, i) {
      var row = el("tr");
      var th = el("th", null, r);
      th.scope = "row";
      row.appendChild(th);
      b.cols.forEach(function (c, j) {
        var cid = id + "-" + i + "-" + j;
        var td = el("td");
        var ta = el("textarea");
        ta.rows = 2;
        ta.value = S.text[cid] || "";
        ta.setAttribute("aria-label", r + ", " + c);
        ta.addEventListener("input", function () { S.text[cid] = ta.value; save(); });
        ta.addEventListener("focus", function () { first = ta; });
        td.appendChild(ta);
        row.appendChild(td);
      });
      tb.appendChild(row);
    });
    t.appendChild(tb);
    box.appendChild(t);
    var bank = wordBank(b, function () { return first || box.querySelector("textarea"); });
    if (bank) {
      var row = el("div", "pr-write-tools");
      row.appendChild(bank.button);
      box.appendChild(row);
      box.appendChild(bank.panel);
    }
    return box;
  };

  BLOCK.cloze = function (b, id) {
    var box = el("div", "pr-cloze");
    box.appendChild(el("p", "pr-q", b.q || "Tap a word, then tap its gap."));
    var placed = S.cloze[id] || (S.cloze[id] = {});
    var pick = null;
    var bank = el("div", "pr-chips pr-cloze-bank");
    bank.setAttribute("role", "group");
    bank.setAttribute("aria-label", "Word bank");
    var fb = el("p", "pr-feedback");
    fb.setAttribute("aria-live", "polite");
    var words = [];
    b.words.forEach(function (w) {
      var c = btn("pr-chip is-word", w, function () {
        pick = pick === w ? null : w;
        words.forEach(function (x) { x.setAttribute("aria-pressed", x.textContent === pick ? "true" : "false"); });
        if (pick) { say("Chosen: " + w + ". Now tap its gap."); }
      });
      c.setAttribute("aria-pressed", "false");
      words.push(c);
      bank.appendChild(c);
    });
    box.appendChild(bank);
    var ol = el("ol", "pr-cloze-lines");
    var gaps = [];
    b.lines.forEach(function (line, i) {
      var li = el("li");
      var parts = line.split("___");
      li.appendChild(document.createTextNode(parts[0]));
      var g = btn("pr-gap", "", function () {
        if (placed[i]) { return; }
        if (!pick) { say("Tap a word first."); return; }
        if (pick === b.answers[i]) {
          placed[i] = pick;
          pick = null;
          fb.className = "pr-feedback is-right";
          fb.textContent = "Right.";
        } else {
          if (b.back) { S.miss[id] = b.back; }
          fb.className = "pr-feedback is-wrong";
          fb.textContent = "Not that word. Read the sentence again.";
        }
        save();
        paint();
      });
      gaps.push(g);
      li.appendChild(g);
      li.appendChild(document.createTextNode(parts[1] || ""));
      ol.appendChild(li);
    });
    box.appendChild(ol);
    box.appendChild(fb);
    function paint() {
      gaps.forEach(function (g, i) {
        g.textContent = placed[i] || "tap here";
        g.classList.toggle("is-placed", !!placed[i]);
        g.setAttribute("aria-label", placed[i] ? "Gap " + (i + 1) + ": " + placed[i] + ", right" : "Gap " + (i + 1) + ", empty");
      });
      words.forEach(function (x) {
        var used = Object.keys(placed).some(function (k) { return placed[k] === x.textContent; });
        x.disabled = used;
        x.setAttribute("aria-pressed", x.textContent === pick ? "true" : "false");
      });
    }
    paint();
    return box;
  };

  BLOCK.rate = function (b, id) {
    var box = el("div", "pr-rate");
    var LAB = ["1 Not yet", "2 Nearly", "3 I can"];
    b.items.forEach(function (t, i) {
      var rid = id + "-" + i;
      var row = el("div", "pr-rate-row");
      row.setAttribute("role", "group");
      var p = el("p", "pr-rate-text");
      p.id = "r-" + rid;
      p.appendChild(el("strong", null, "I can "));
      p.appendChild(document.createTextNode(t));
      row.setAttribute("aria-labelledby", p.id);
      row.appendChild(p);
      var opts = el("div", "pr-options");
      LAB.forEach(function (lab, k) {
        var x = btn("pr-option", lab, function () {
          S.rate[rid] = k + 1;
          save();
          Array.prototype.forEach.call(opts.children, function (y, j) { y.setAttribute("aria-pressed", j === k ? "true" : "false"); });
          say("Saved: " + lab + ".");
        });
        x.setAttribute("aria-pressed", S.rate[rid] === k + 1 ? "true" : "false");
        opts.appendChild(x);
      });
      row.appendChild(opts);
      box.appendChild(row);
    });
    return box;
  };

  BLOCK.comeback = function (b) {
    var box = el("div", "pr-comeback");
    box.appendChild(el("p", "pr-q", b.q || "Come back to these:"));
    var ids = Object.keys(S.miss);
    if (!ids.length) {
      box.appendChild(el("p", "pr-p", b.none || "Nothing to come back to. Everything was right first time."));
      return box;
    }
    var ul = el("ul", "pr-list");
    ids.forEach(function (k) {
      var li = el("li");
      var at = WHERE[k];
      if (typeof at === "number") {
        li.appendChild(btn("pr-btn pr-btn-quiet", S.miss[k], function () { go(at); }));
      } else {
        li.textContent = S.miss[k];
      }
      ul.appendChild(li);
    });
    box.appendChild(ul);
    return box;
  };

  // The job chooser. Jobs sit in their pairs; a tap marks the job with a tick; a line says
  // whose partner you are; the Next button sits right under the cards.
  function roleButton(r) {
    var b = btn("pr-role", null, function () {
      var k = S.roles.indexOf(r.id);
      if (k >= 0) { S.roles.splice(k, 1); }
      else {
        if (S.roles.length >= 2) { S.roles.shift(); }
        S.roles.push(r.id);
      }
      save();
      render(false);
      var again = root.querySelector('.pr-role[data-role="' + r.id + '"]');
      if (again) { again.focus(); }
      say(mineLine() || "No job chosen.");
    });
    b.dataset.role = r.id;
    var on = S.roles.indexOf(r.id) >= 0;
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.appendChild(img(r.icon, ""));
    var t = el("span", "pr-role-text");
    t.appendChild(el("strong", null, r.name));
    t.appendChild(el("span", null, r.line));
    b.appendChild(t);
    b.appendChild(svg("pr-pick", on ? TICK : ""));
    return b;
  }
  function mineLine() {
    if (!S.roles.length) { return ""; }
    var names = S.roles.map(function (x) { return role(x).name; });
    if (S.roles.length > 1) { return "Your jobs: " + names.join(" and ") + "."; }
    var me = role(S.roles[0]);
    var mate = me.pair && DATA.roles.filter(function (x) { return x.pair === me.pair && x.id !== me.id; })[0];
    return "Your job: " + me.name + "." + (mate ? " Your partner: the " + mate.name + "." : "");
  }
  BLOCK.roles = function (b) {
    var box = el("div", "pr-roles");
    if (b.q) { box.appendChild(para("pr-q", b.q)); }
    var groups = DATA.pairs || [{ id: null }];
    groups.forEach(function (g) {
      var sec = el("div", "pr-pair");
      if (g.name) { sec.appendChild(el("p", "pr-pair-name", g.name)); }
      var grid = el("div", "pr-role-grid");
      DATA.roles.forEach(function (r) {
        if (g.id === null || r.pair === g.id) { grid.appendChild(roleButton(r)); }
      });
      sec.appendChild(grid);
      if (g.note) { sec.appendChild(para("pr-pair-note", g.note)); }
      box.appendChild(sec);
    });
    var foot = el("div", "pr-roles-foot");
    var line = el("p", "pr-mine", mineLine() || "No job chosen yet.");
    foot.appendChild(line);
    if (S.roles.length) {
      foot.appendChild(btn("pr-btn pr-btn-main", "I have my job \u2192 Next", function () { go(S.screen + 1); }));
    }
    box.appendChild(foot);
    return box;
  };

  BLOCK.set = function (b, id) {
    var box = el("div", "pr-set");
    var n = b.items.length;
    var at = Math.min(S.set[id] || 0, n - 1);
    var head = el("div", "pr-set-head");
    var count = el("p", "pr-set-count", (b.label || "Question") + " " + (at + 1) + " of " + n);
    head.appendChild(count);
    var nav = el("div", "pr-set-nav");
    var prev = btn("pr-btn pr-btn-quiet", "Previous", function () { move(-1); });
    var next = btn("pr-btn pr-btn-quiet pr-btn-next", "Next " + (b.label || "question").toLowerCase(), function () { move(1); });
    prev.disabled = at === 0;
    next.disabled = at === n - 1;
    nav.appendChild(prev);
    nav.appendChild(next);
    head.appendChild(nav);
    box.appendChild(head);
    var it = b.items[at];
    box.appendChild(block(it, it.id || id + "-" + at));
    function move(d) {
      S.set[id] = Math.max(0, Math.min(n - 1, at + d));
      save();
      var fresh = BLOCK.set(b, id);
      box.parentNode.replaceChild(fresh, box);
      var f = fresh.querySelector(".pr-q, label");
      if (f) { f.setAttribute("tabindex", "-1"); f.focus(); }
      say(count.textContent.replace(/\d+ of/, (S.set[id] + 1) + " of"));
    }
    return box;
  };

  function block(b, id) {
    var f = BLOCK[b.type];
    return f ? f(b, id) : el("p", "pr-p", b.text || "");
  }
  function blocks(list, idBase, into) {
    (list || []).forEach(function (b, k) { into.appendChild(block(b, b.id || idBase + "-" + k)); });
  }

  // ------------------------------------------------------------ figures (with an optional second state)
  function figure(f) {
    var fig = el("figure", "pr-fig" + (f.photo ? " is-photo" : ""));
    var i = img(f.src, f.alt);
    fig.appendChild(i);
    if (f.src2) {
      var on = false;
      var b = btn("pr-toggle", f.label2, function () {
        on = !on;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        i.src = IMG + (on ? f.src2 : f.src);
        i.alt = on ? f.alt2 : f.alt;
        b.textContent = on ? f.label : f.label2;
        say(i.alt);
      });
      b.setAttribute("aria-pressed", "false");
      fig.appendChild(b);
    }
    if (f.caption || f.credit) {
      var cap = el("figcaption");
      if (f.caption) { rich(f.caption, cap); }
      if (f.credit) {
        var cr = el("span", "pr-credit");
        cr.appendChild(document.createTextNode(f.credit.text + " "));
        if (f.credit.href) {
          var a = el("a", null, f.credit.link || "source");
          a.href = f.credit.href;
          a.rel = "noopener";
          a.target = "_blank";
          cr.appendChild(a);
        }
        cap.appendChild(cr);
      }
      fig.appendChild(cap);
    }
    return fig;
  }

  // ------------------------------------------------------------ the side panel: Picture / Help / Challenge
  var waitingTab = null;
  function side(sc) {
    var tabs = [];
    if (sc.fig) { tabs.push({ id: "pic", label: "Picture" }); }
    if (sc.ican) { tabs.push({ id: "ican", label: "I can" }); }
    if (sc.help) { tabs.push({ id: "help", label: "Help" }); }
    if (sc.wait) { tabs.push({ id: "wait", label: "Waiting?" }); }
    if (sc.challenge) { tabs.push({ id: "ch", label: "Challenge" }); }
    if (!tabs.length) { return null; }
    var wrap = el("aside", "pr-side");
    wrap.setAttribute("aria-label", "Picture, help and challenge");
    var cur = S.tab[sc.id] || tabs[0].id;
    if (!tabs.some(function (t) { return t.id === cur; })) { cur = tabs[0].id; }
    var bar = el("div", "pr-tabs");
    bar.setAttribute("role", "tablist");
    var panel = el("div", "pr-panel");
    panel.setAttribute("role", "tabpanel");
    panel.id = "prPanel";
    var buttons = [];
    function show(id, focus) {
      cur = id;
      S.tab[sc.id] = id;
      save();
      buttons.forEach(function (x) {
        var on = x.dataset.tab === id;
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
        if (on) { panel.setAttribute("aria-labelledby", x.id); if (focus) { x.focus(); } }
      });
      panel.textContent = "";
      if (id === "pic") { panel.appendChild(figure(sc.fig)); }
      if (id === "ican") { blocks(sc.ican, sc.id + "-ican", panel); }
      if (id === "help") { blocks(sc.help, sc.id + "-help", panel); }
      if (id === "wait") { blocks(sc.wait, sc.id + "-wait", panel); }
      if (id === "ch") {
        var top = el("p", "pr-ch-top");
        top.appendChild(el("strong", null, "Challenge. "));
        top.appendChild(document.createTextNode("Try it if you have time. Your team still moves on together."));
        panel.appendChild(top);
        blocks(sc.challenge, sc.id + "-ch", panel);
      }
    }
    tabs.forEach(function (t, k) {
      var x = btn("pr-tab", t.label, function () { show(t.id, false); });
      x.id = "prTab-" + t.id;
      x.dataset.tab = t.id;
      x.setAttribute("role", "tab");
      x.setAttribute("aria-controls", "prPanel");
      x.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) { return; }
        e.preventDefault();
        show(tabs[(k + d + tabs.length) % tabs.length].id, true);
      });
      if (t.id === "ch") { waitingTab = x; }
      buttons.push(x);
      bar.appendChild(x);
    });
    wrap.appendChild(bar);
    wrap.appendChild(panel);
    show(cur, false);
    return wrap;
  }

  // "Waiting for your team? Try this." once every tick on your role cards is done
  var tickIds = [];
  function waitingCheck() {
    if (!waitingTab || !tickIds.length) { return; }
    var all = tickIds.every(function (k) { return S.ticks[k]; });
    var was = waitingTab.classList.contains("is-waiting");
    waitingTab.classList.toggle("is-waiting", all);
    waitingTab.textContent = all ? "Waiting for your team? Try this" : "Challenge";
    if (all && !was) { say("All your jobs are ticked. Waiting for your team? Try the Challenge."); }
  }

  // A swap screen: the same team, new jobs. Shown as a box above the cards so no one misses it.
  function swapBox(sc) {
    var box = el("div", "pr-swap");
    box.setAttribute("role", "note");
    box.appendChild(el("p", "pr-swap-title", "Swap jobs"));
    S.roles.forEach(function (r) {
      var to = sc.swap[r] || r;
      var line = el("p", "pr-swap-line");
      line.appendChild(img(role(r).icon, "", "pr-swap-ic"));
      line.appendChild(el("span", null, role(r).name));
      line.appendChild(el("span", "pr-swap-arrow", "\u2192"));
      line.appendChild(img(role(to).icon, "", "pr-swap-ic"));
      line.appendChild(el("strong", null, role(to).name));
      box.appendChild(line);
    });
    if (sc.swapNote) { box.appendChild(para("pr-p", sc.swapNote)); }
    return box;
  }

  // ------------------------------------------------------------ a screen
  function screen(k) {
    var sc = DATA.screens[k];
    var wrap = el("section", "pr-screen");
    wrap.setAttribute("aria-labelledby", "prTitle");

    var head = el("div", "pr-head");
    var h = el("h2", null, sc.title);
    h.id = "prTitle";
    head.appendChild(h);
    var meta = el("p", "pr-meta");
    if (sc.mins) { meta.appendChild(el("span", "pr-mins", "about " + sc.mins + " min")); }
    if (sc.page) { meta.appendChild(el("span", "pr-page", sc.page)); }
    if (meta.children.length) { head.appendChild(meta); }
    wrap.appendChild(head);
    if (sc.mode || sc.do || sc.team || sc.done) { wrap.appendChild(doBox(sc)); }

    tickIds = [];
    waitingTab = null;

    if (sc.pause && !S.pause[sc.id]) {
      var card = el("div", "pr-pause");
      card.appendChild(img(sc.pause.pic || "icon_eyes_board.png", "", "pr-pause-pic"));
      var t = el("div");
      t.appendChild(el("p", "pr-pause-title", "Eyes on the board"));
      t.appendChild(para("pr-p", sc.pause.text));
      t.appendChild(btn("pr-btn pr-btn-main", "Continue", function () {
        S.pause[sc.id] = true;
        save();
        render(true);
      }));
      card.appendChild(t);
      wrap.appendChild(card);
      return wrap;
    }

    var body = el("div", "pr-body");
    var main = el("div", "pr-main");
    blocks(sc.main, sc.id + "-m", main);

    if (sc.roles) {
      if (sc.swapBox) { main.appendChild(swapBox(sc)); }
      var mine = sc.swap ? S.roles.map(function (r) { return sc.swap[r] || r; }) : S.roles;
      var shown = mine.filter(function (r, i) { return sc.roles[r] && mine.indexOf(r) === i; });
      if (sc.turns) { main.appendChild(turnStrip(sc, shown)); }
      var cards = el("div", "pr-cards");
      cards.style.setProperty("--n", String(Math.max(1, shown.length)));
      shown.forEach(function (rid) {
        var c = el("article", "pr-card");
        c.setAttribute("aria-label", "Your job: " + role(rid).name);
        var top = el("header", "pr-card-head");
        top.appendChild(img(role(rid).icon, ""));
        top.appendChild(el("strong", null, role(rid).name));
        var sw = startWhen(sc, rid);
        if (sw) { top.appendChild(el("span", "pr-start", sw)); }
        c.appendChild(top);
        var list = el("div", "pr-items");
        sc.roles[rid].forEach(function (b, j) {
          // A role's opening link sits in its header: saves a row on the busiest screens.
          if (j === 0 && b.type === "link") { top.appendChild(BLOCK.link(b)); return; }
          var id = b.id || sc.id + "-" + rid + "-" + j;
          if (b.type === "step" || b.type === "booklet") { tickIds.push(id); }
          list.appendChild(block(b, id));
        });
        c.appendChild(list);
        cards.appendChild(c);
      });
      if (!shown.length) { cards.appendChild(para("pr-p", "Choose your job on step 1 to see your card.")); }
      main.appendChild(cards);
    }
    body.appendChild(main);
    var sd = side(sc);
    if (sd) {
      // "everyone" blocks on a role screen sit under the picture, where the column has room
      var col = el("div", "pr-sidecol");
      col.appendChild(sd);
      blocks(sc.after, sc.id + "-a", col);
      body.appendChild(col);
    } else {
      blocks(sc.after, sc.id + "-a", main);
      body.classList.add("is-single");
    }
    wrap.appendChild(body);
    if (sc.roles) { waitingCheck(); }

    if (sc.finish && window.Progress && DATA.badge) {
      try { window.Progress.complete(DATA.badge.challenge); } catch (e) { /* progress engine missing */ }
    }
    return wrap;
  }

  // ------------------------------------------------------------ the bar: where you are, and SAFETY
  function topBar() {
    var b = el("div", "pr-bar");
    var dots = el("ol", "pr-dots");
    dots.setAttribute("aria-label", "Steps of the lesson");
    DATA.screens.forEach(function (sc, k) {
      var li = el("li", k === S.screen ? "is-now" : (k < S.screen ? "is-done" : ""));
      var x = btn(null, String(k + 1), function () { go(k); });
      x.setAttribute("aria-label", "Step " + (k + 1) + ": " + sc.title + (k === S.screen ? " (you are here)" : ""));
      if (k === S.screen) { x.setAttribute("aria-current", "step"); }
      li.appendChild(x);
      dots.appendChild(li);
    });
    b.appendChild(dots);
    if (DATA.safety) {
      var s = el("p", "pr-safety");
      s.appendChild(img("icon_safety.png", ""));
      var t = el("span");
      t.appendChild(el("strong", null, "SAFETY "));
      t.appendChild(document.createTextNode(DATA.screens[S.screen].safety || DATA.safety));
      s.appendChild(t);
      b.appendChild(s);
    }
    return b;
  }

  function bottomBar() {
    var nav = el("div", "pr-nav");
    var tools = el("div", "pr-tools");
    if (S.screen > 0) { tools.appendChild(btn("pr-btn pr-btn-quiet", "Change my job", function () { go(0); })); }
    var armed = false;
    var clear = btn("pr-btn pr-btn-quiet", "Clear and start again", function () {
      if (!armed) {
        armed = true;
        clear.textContent = "Tap again to clear everything";
        clear.classList.add("is-armed");
        say("Tap again to clear everything on this page.");
        setTimeout(function () {
          if (armed) { armed = false; clear.textContent = "Clear and start again"; clear.classList.remove("is-armed"); }
        }, 4000);
        return;
      }
      try { localStorage.removeItem(KEY); } catch (e) { /* nothing saved */ }
      S = fresh();
      render(true);
      say("Cleared. Choose your job.");
    });
    tools.appendChild(clear);
    tools.appendChild(el("span", "pr-saved-note", "Saved on this device only"));
    nav.appendChild(tools);

    var move = el("div", "pr-move");
    if (S.screen > 0) { move.appendChild(btn("pr-btn", "Back a step", function () { go(S.screen - 1); })); }
    if (S.screen < N - 1) {
      var next = btn("pr-btn pr-btn-main", "Next: " + DATA.screens[S.screen + 1].title + " \u2192", function () { go(S.screen + 1); });
      if (S.screen === 0 && !S.roles.length) { next.disabled = true; next.textContent = "Choose your job first"; }
      move.appendChild(next);
    }
    nav.appendChild(move);
    return nav;
  }

  function go(k) {
    if (k > 0 && !S.roles.length) { k = 0; }
    S.screen = Math.max(0, Math.min(N - 1, k));
    save();
    render(true);
    var top = root.getBoundingClientRect().top;
    if (top < 0) { window.scrollBy(0, top - 8); }
  }

  function render(focus) {
    closePop(false);
    root.textContent = "";
    root.appendChild(topBar());
    root.appendChild(screen(S.screen));
    root.appendChild(bottomBar());
    if (focus) {
      var h = document.getElementById("prTitle");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }
  }

  // where each saved answer lives, for the "come back to" list
  var WHERE = {};
  function mapIds(list, k, base) {
    (list || []).forEach(function (b, j) {
      var id = b.id || base + "-" + j;
      WHERE[id] = k;
      if (b.items && b.type === "set") { mapIds(b.items, k, id); }
    });
  }
  DATA.screens.forEach(function (sc, k) {
    mapIds(sc.main, k, sc.id + "-m");
    mapIds(sc.after, k, sc.id + "-a");
    mapIds(sc.help, k, sc.id + "-help");
    mapIds(sc.wait, k, sc.id + "-wait");
    mapIds(sc.challenge, k, sc.id + "-ch");
    Object.keys(sc.roles || {}).forEach(function (r) { mapIds(sc.roles[r], k, sc.id + "-" + r); });
  });

  // ------------------------------------------------------------ teacher view (projector)
  // Same lesson data, one big step at a time: the instruction box, who goes when, the picture
  // and a step timer. No answers are shown. The passcode only keeps pupils out of casual reach:
  // the page is public, so nothing secret may ever be put on it.
  function teacher() {
    var TK = KEY + "-teacher";
    var want = root.dataset.hash;
    var T = { screen: 0 };
    try { T.screen = Math.max(0, Math.min(N - 1, +localStorage.getItem(TK) || 0)); } catch (e) { /* nothing saved */ }
    var left = 0, tick = null, clock = null;

    function hash(str) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
      });
    }
    function unlocked() {
      try { return localStorage.getItem(TK + "-ok") === want; } catch (e) { return false; }
    }
    function gate() {
      root.textContent = "";
      var f = el("form", "pr-gate");
      f.appendChild(el("h2", null, "Teacher view"));
      var lab = el("label", null, "Passcode");
      lab.htmlFor = "prPass";
      f.appendChild(lab);
      var row = el("div", "pr-gate-row");
      var inp = el("input");
      inp.id = "prPass";
      inp.type = "password";
      inp.inputMode = "numeric";
      inp.autocomplete = "off";
      row.appendChild(inp);
      var go1 = el("button", "pr-btn pr-btn-main", "Open");
      go1.type = "submit";
      row.appendChild(go1);
      f.appendChild(row);
      f.appendChild(el("p", "pr-saved-note", "Once open, the arrow keys move between steps."));
      var msg = el("p", "pr-gate-msg");
      msg.setAttribute("aria-live", "polite");
      f.appendChild(msg);
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!(window.crypto && crypto.subtle)) { msg.textContent = "Open this page from the website (https)."; return; }
        hash("pr-teacher:" + inp.value.trim()).then(function (h) {
          if (h === want) {
            try { localStorage.setItem(TK + "-ok", want); } catch (err) { /* asks again next time */ }
            show(true);
          } else {
            msg.textContent = "That passcode is not right.";
            inp.value = "";
            inp.focus();
          }
        });
      });
      root.appendChild(f);
      inp.focus();
    }

    function fmt(n) { return Math.floor(n / 60) + ":" + ("0" + (n % 60)).slice(-2); }
    function stop() { if (tick) { clearInterval(tick); tick = null; } }
    function paint() {
      if (!clock) { return; }
      clock.textContent = fmt(left);
      clock.classList.toggle("is-over", left === 0);
    }
    function move(k) {
      T.screen = Math.max(0, Math.min(N - 1, k));
      try { localStorage.setItem(TK, String(T.screen)); } catch (e) { /* not saved */ }
      stop();
      show(true);
    }

    function show(focus) {
      var sc = DATA.screens[T.screen];
      left = (sc.mins || 0) * 60;
      root.textContent = "";

      var bar = el("div", "pr-bar");
      var dots = el("ol", "pr-dots");
      dots.setAttribute("aria-label", "Steps of the lesson");
      DATA.screens.forEach(function (x, k) {
        var li = el("li", k === T.screen ? "is-now" : (k < T.screen ? "is-done" : ""));
        var b = btn(null, String(k + 1), function () { move(k); });
        b.setAttribute("aria-label", "Step " + (k + 1) + ": " + x.title);
        if (k === T.screen) { b.setAttribute("aria-current", "step"); }
        li.appendChild(b);
        dots.appendChild(li);
      });
      bar.appendChild(dots);
      var sf = el("p", "pr-safety");
      sf.appendChild(img("icon_safety.png", ""));
      var st = el("span");
      st.appendChild(el("strong", null, "SAFETY "));
      st.appendChild(document.createTextNode(sc.safety || DATA.safety));
      sf.appendChild(st);
      bar.appendChild(sf);
      root.appendChild(bar);

      var wrap = el("section", "pr-screen pr-teach");
      var head = el("div", "pr-head");
      var h = el("h2", null, (T.screen + 1) + ". " + sc.title);
      h.id = "prTitle";
      head.appendChild(h);
      if (sc.page) { head.appendChild(el("p", "pr-meta", sc.page)); }
      wrap.appendChild(head);

      var body = el("div", "pr-body" + (sc.fig ? "" : " is-single"));
      var main = el("div", "pr-main");
      if (sc.pause) {
        var pz = el("div", "pr-do mode-board");
        pz.appendChild(modeTag("board"));
        pz.appendChild(para("pr-p", sc.pause.teacher || "Eyes on the board first."));
        main.appendChild(pz);
      }
      if (sc.mode || sc.do || sc.done) { main.appendChild(doBox(sc)); }
      if (sc.swapBox && sc.swap) {
        var sw = el("div", "pr-swap");
        sw.appendChild(el("p", "pr-swap-title", "Swap jobs"));
        var seen = {};
        DATA.roles.forEach(function (r) {
          var to = sc.swap[r.id];
          if (!to || seen[r.id]) { return; }
          seen[r.id] = seen[to] = true;
          var line = el("p", "pr-swap-line");
          line.appendChild(img(r.icon, "", "pr-swap-ic"));
          line.appendChild(el("strong", null, r.name));
          line.appendChild(el("span", "pr-swap-arrow", "\u2194"));
          line.appendChild(img(role(to).icon, "", "pr-swap-ic"));
          line.appendChild(el("strong", null, role(to).name));
          sw.appendChild(line);
        });
        main.appendChild(sw);
      }
      if (sc.turns) { main.appendChild(turnStrip(sc, [])); }

      var tm = el("div", "pr-timer");
      clock = el("div", "pr-clock");
      clock.setAttribute("role", "timer");
      tm.appendChild(clock);
      var startB = btn("pr-btn", "Start timer", function () {
        if (tick) { stop(); startB.textContent = "Start timer"; return; }
        if (left === 0) { return; }
        startB.textContent = "Pause timer";
        tick = setInterval(function () {
          left = Math.max(0, left - 1);
          paint();
          if (!left) { stop(); startB.textContent = "Start timer"; }
        }, 1000);
      });
      tm.appendChild(startB);
      tm.appendChild(btn("pr-btn pr-btn-quiet", "Reset", function () {
        stop(); startB.textContent = "Start timer"; left = (sc.mins || 0) * 60; paint();
      }));
      main.appendChild(tm);
      paint();
      body.appendChild(main);
      if (sc.fig) {
        var col = el("div", "pr-sidecol");
        col.appendChild(figure(sc.fig));
        body.appendChild(col);
      }
      wrap.appendChild(body);
      root.appendChild(wrap);

      var nav = el("div", "pr-nav");
      var mv = el("div", "pr-move");
      if (T.screen > 0) { mv.appendChild(btn("pr-btn", "Back a step", function () { move(T.screen - 1); })); }
      if (T.screen < N - 1) {
        mv.appendChild(btn("pr-btn pr-btn-main", "Next: " + DATA.screens[T.screen + 1].title + " \u2192", function () { move(T.screen + 1); }));
      }
      if (DATA.pupilWhere) {
        var wh = el("p", "pr-where");
        wh.appendChild(el("strong", null, "Pupils find this lesson at: "));
        rich(DATA.pupilWhere, wh);
        nav.appendChild(wh);
      }
      nav.appendChild(mv);
      root.appendChild(nav);
      if (focus) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }

    document.addEventListener("keydown", function (e) {
      if (!unlocked() || /INPUT|TEXTAREA/.test((e.target.tagName || ""))) { return; }
      if (e.key === "ArrowRight") { move(T.screen + 1); }
      if (e.key === "ArrowLeft") { move(T.screen - 1); }
    });
    if (unlocked()) { show(false); } else { gate(); }
  }
  if (root.dataset.view === "teacher") { teacher(); return; }

  if (window.Progress && DATA.badge) {
    try { window.Progress.markSeen(DATA.badge.id); } catch (e) { /* progress engine missing */ }
  }
  if (!S.roles.length) { S.screen = 0; }
  render(false);
})();
