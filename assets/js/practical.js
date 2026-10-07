/* ============================================================
   Practical pages: a lesson on the screen (S3 Engineering, Booklet 6 pneumatics; plan:
   claude-work/s3-eng-b6-b7/WEB-PRACTICALS-PLAN.md). One engine; each page supplies its lesson
   as JSON in <script type="application/json" id="practicalData">.

   One screen per step of the lesson, each fitting a landscape iPad (1180 x 760). Words on the
   left, the picture beside them; Help, Challenge, Waiting? and I can open in the picture's place
   from the toolbar (teacher, 6 Oct: one thing at a time). No roles (teacher, 7 Oct): every pupil
   sees every step, at their own pace; at the kit a pupil says who is already there, and a pupil who
   has to wait goes on to the next steps and is brought back. Saved in this browser (localStorage),
   and sent to the teacher's tracker only when the page has one and the pupil logs in.
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
    return { screen: 0, ticks: {}, text: {}, choice: {}, miss: {}, checked: {},
      marks: {}, pause: {}, rate: {}, set: {}, cloze: {}, part: {}, tour: 0, kit: "", back: -1, late: false };
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

  // Every change goes through save(), so it is also where Next and the step lines repaint.
  var refreshers = [];
  function save() {
    S.savedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: work still shows */ }
    refreshers.forEach(function (f) { f(); });
    queueSync(false);
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
  var BOOK = '<path d="M24 13c-5-4-12-5-19-4v27c7-1 14 0 19 4 5-4 12-5 19-4V9c-7-1-14 0-19 4z"/><path class="a" d="M24 13v27"/>';
  var QMARK = '<circle cx="24" cy="24" r="19"/><path class="a" d="M18 19a6 6 0 1 1 8.5 5.4c-1.7.9-2.5 2-2.5 4.1"/><circle class="a" cx="24" cy="35" r=".8"/>';

  function modeTag(mode) {
    var m = MODES[mode];
    var p = el("p", "pr-mode");
    p.appendChild(svg("pr-mode-ic", m.ic));
    p.appendChild(el("span", null, m.label));
    return p;
  }

  // The instruction box at the top of every step: how you work, up to 3 steps, Done when, and
  // (pupils) the step's SAFETY line on its own yellow strip, so it is read with the instructions.
  function doBox(sc, safety) {
    var box = el("div", "pr-do" + (sc.mode ? " mode-" + sc.mode : ""));
    if (MODES[sc.mode]) { box.appendChild(modeTag(sc.mode)); }
    if (sc.do) {
      var ol = el("ol", "pr-do-steps");
      sc.do.forEach(function (t) { var li = el("li"); rich(t, li); ol.appendChild(li); });
      box.appendChild(ol);
    } else if (sc.team) {
      box.appendChild(para("pr-team", sc.team));
    }
    var foot = el("div", "pr-do-foot");
    if (sc.done) {
      var dn = el("p", "pr-done");
      dn.appendChild(svg("pr-done-ic", TICK));
      var t = el("span");
      t.appendChild(el("strong", null, "Done when: "));
      rich(sc.done, t);
      dn.appendChild(t);
      foot.appendChild(dn);
    }
    if (safety && DATA.safety) { foot.appendChild(safetyLine(sc)); }
    if (foot.children.length) { box.appendChild(foot); }
    return box;
  }

  function safetyLine(sc) {
    var s = el("p", "pr-safety");
    s.appendChild(img("icon_safety.png", ""));
    var t = el("span");
    t.appendChild(el("strong", null, "SAFETY "));
    t.appendChild(document.createTextNode(sc.safety || DATA.safety));
    s.appendChild(t);
    return s;
  }

  function img(src, alt, cls) {
    var i = el("img", cls || "");
    i.src = IMG + src;
    i.alt = alt || "";
    if (!alt) { i.setAttribute("aria-hidden", "true"); }
    i.decoding = "async";
    return i;
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
        // bold text may hold a glossary word: **3/2 push-button {valve-any|valve}**
        var st = el("strong");
        rich(m[1], st);
        host.appendChild(st);
      } else {
        var key = m[2];
        var shown = m[3] || (DATA.glossary[key] ? DATA.glossary[key].word : key);
        var b = btn("pr-term", shown);
        b.setAttribute("aria-expanded", "false");
        b.setAttribute("aria-label", shown + ": what does it mean?");
        (function (bb, k) { bb.addEventListener("click", function (e) { e.stopPropagation(); openPop(bb, k); }); })(b, key);
        // punctuation straight after the word stays on its line
        var tail = /^[,.;:!?)]+/.exec(text.slice(re.lastIndex));
        if (tail) {
          var nw = el("span", "pr-nowrap");
          nw.appendChild(b);
          nw.appendChild(document.createTextNode(tail[0]));
          host.appendChild(nw);
          re.lastIndex += tail[0].length;
        } else {
          host.appendChild(b);
        }
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

  // callouts: numbered to match the numbered discs on the screenshot beside it
  BLOCK.list = function (b) {
    var ul = el(b.numbered || b.callouts ? "ol" : "ul", "pr-list" + (b.callouts ? " is-callouts" : ""));
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

  function cardLabel(ic, text) {
    var h = el("p", "pr-card-label");
    h.appendChild(svg("pr-label-ic", ic));
    h.appendChild(el("span", null, text));
    return h;
  }
  // A Read card: words to read, nothing to answer. It must never look like a question.
  BLOCK.read = function (b, id) {
    var box = el("section", "pr-read");
    box.setAttribute("aria-label", b.title || "Read");
    box.appendChild(cardLabel(BOOK, b.title || "Read"));
    blocks(b.items, id, box);
    return box;
  };
  BLOCK.row = function (b, id) {
    var box = el("div", "pr-row");
    blocks(b.items, id, box);
    return box;
  };
  // The how-to step's practice job card: the same card the role steps use.
  BLOCK.democard = function (b, id) {
    var c = el("article", "pr-card");
    c.setAttribute("aria-label", b.title);
    var top = el("header", "pr-card-head");
    top.appendChild(img(b.icon, ""));
    top.appendChild(el("strong", null, b.title));
    c.appendChild(top);
    var list = el("div", "pr-items");
    blocks(b.items, id, list);
    c.appendChild(list);
    return c;
  };
  // One part shown 3 ways side by side: the symbol, the simulation, the real kit (teacher, 7 Oct).
  BLOCK.views = function (b) {
    var box = el("div", "pr-views");
    if (b.title) { box.appendChild(para("pr-views-title", b.title)); }
    var row = el("div", "pr-views-row");
    b.items.forEach(function (v) {
      var f = el("figure", "pr-view" + (v.photo ? " is-photo" : ""));
      var w = el("div", "pr-view-pic");
      w.appendChild(img(v.src, v.alt));
      f.appendChild(w);
      var cap = el("figcaption");
      rich(v.label, cap);
      f.appendChild(cap);
      row.appendChild(f);
    });
    box.appendChild(row);
    if (b.text) { box.appendChild(para("pr-p", b.text)); }
    return box;
  };

  // A question whose answer picks what comes next: the chosen option's lines open under it.
  // kit: the answer is also where this pupil is at the kit (first, join, late), which other steps read.
  BLOCK.branch = function (b, id) {
    var box = el("fieldset", "pr-branch");
    var lg = el("legend", "pr-q");
    rich(b.q, lg);
    box.appendChild(lg);
    var row = el("div", "pr-options is-stacked");
    var c = S.choice[id];
    b.options.forEach(function (o, k) {
      var x = btn("pr-option", null, function () {
        S.choice[id] = k;
        if (b.kit) {
          S.kit = o.key;
          S.late = o.key === "late";
          if (o.key !== "late") { S.back = -1; }
        }
        save();
        render(false);
        var again = root.querySelector('.pr-branch [data-k="' + k + '"]');
        if (again) { again.focus(); }
        say("Chosen: " + o.label.replace(/\*\*/g, ""));
      });
      x.dataset.k = k;
      rich(o.label, x);
      x.setAttribute("aria-pressed", c === k ? "true" : "false");
      row.appendChild(x);
    });
    box.appendChild(row);
    if (typeof c === "number") {
      var then = el("div", "pr-branch-then");
      blocks(b.options[c].items, id + "-o" + c, then);
      box.appendChild(then);
    }
    return box;
  };

  // A button to another step. back: the step to come back to afterwards (the kit, for a pupil who waits).
  BLOCK.goto = function (b) {
    var p = el("p", "pr-linkline");
    p.appendChild(btn("pr-btn pr-btn-main", b.text + " →", function () {
      if (b.back) { S.back = stepIndex(b.back); }
      go(stepIndex(b.to));
    }));
    return p;
  };
  function stepIndex(sid) {
    for (var i = 0; i < N; i++) { if (DATA.screens[i].id === sid) { return i; } }
    return S.screen;
  }

  // STOP: the air stays off until a teacher or classroom helper has checked the build (teacher, 7 Oct).
  BLOCK.stop = function (b, id) {
    var D = DATA.stop || {};
    var card = el("section", "pr-stop");
    card.setAttribute("aria-label", "Stop");
    var head = el("div", "pr-stop-head");
    head.appendChild(img(b.pic || D.pic || "hand_up.png", "", "pr-stop-pic"));
    var h = el("p", "pr-stop-title");
    h.appendChild(el("strong", null, "STOP. "));
    h.appendChild(document.createTextNode(b.title || D.title || "No air yet."));
    head.appendChild(h);
    card.appendChild(head);
    var ol = el("ol", "pr-list");
    (b.lines || D.lines || []).forEach(function (t) { var li = el("li"); rich(t, li); ol.appendChild(li); });
    card.appendChild(ol);
    var lab = el("label", "pr-step pr-stop-tick");
    var cb = el("input");
    cb.type = "checkbox";
    cb.checked = !!S.ticks[id];
    cb.addEventListener("change", function () {
      S.ticks[id] = cb.checked;
      save();
      say(cb.checked ? "Checked by an adult. You can test it now." : "Tick removed.");
      if (DATA.screens[S.screen].needs === id) { render(true); }
    });
    lab.appendChild(cb);
    var t = el("span", "pr-step-text");
    rich(b.tick || D.tick || "A teacher or helper has checked it.", t);
    lab.appendChild(t);
    card.appendChild(lab);
    return card;
  };

  BLOCK.tour = function (b) {
    var p = el("p", "pr-linkline");
    p.appendChild(btn("pr-btn pr-btn-go", b.text || "Start the tour", function () { startTour(); }));
    return p;
  };

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
    var qline = el("div", "pr-qline");
    qline.appendChild(q);
    var help = ladder(b);
    if (help) { qline.appendChild(help); }
    right.appendChild(qline);
    var opts = el("div", "pr-options is-stacked");
    var fb = el("p", "pr-feedback");
    fb.setAttribute("aria-live", "polite");
    var buttons = [];
    function paint() {
      var c = S.choice[id];
      var answered = typeof c === "number";
      buttons.forEach(function (o, k) {
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
        buttons[c].insertAdjacentElement("afterend", fb);
        if (help) { help.hidden = true; }
      }
    }
    b.options.forEach(function (o, k) {
      var x = btn("pr-option", o, function () {
        if (typeof S.choice[id] === "number") { return; }
        S.choice[id] = k;
        if (k !== b.answer && b.back) { S.miss[id] = b.back; }
        save();
        paint();
        say((k === b.answer ? "Right. " : "Not this one. The answer is " + b.options[b.answer] + ". ") + b.why.replace(/\*\*|\{|\}/g, ""));
      });
      buttons.push(x);
      opts.appendChild(x);
    });
    right.appendChild(opts);
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
      // once checked, the writing help steps aside so the model answer and the marks fit the screen
      tools.hidden = true;
      if (bank) { bank.panel.hidden = true; }
      ta.rows = 2;
      box.classList.add("is-checked");
      var h = el("p", "pr-model-head");
      h.appendChild(el("strong", null, b.modelTitle || (b.marks ? "Model answer" : "One good answer")));
      var top = el("div", "pr-model-top");
      top.appendChild(h);
      res.appendChild(top);
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
        top.appendChild(row);
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
    var LAB = b.labels || ["1 Not yet", "2 Nearly", "3 I can"];
    b.items.forEach(function (t, i) {
      var rid = id + "-" + i;
      var row = el("div", "pr-rate-row");
      row.setAttribute("role", "group");
      var p = el("p", "pr-rate-text");
      p.id = "r-" + rid;
      var lead = b.lead == null ? "I can " : b.lead;
      if (lead) { p.appendChild(el("strong", null, lead)); }
      rich(t, p);
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
        li.appendChild(btn("pr-btn pr-btn-quiet", S.miss[k], function () {
          if (PART[k] != null) { S.part[DATA.screens[at].id] = PART[k]; }
          go(at);
        }));
      } else {
        li.textContent = S.miss[k];
      }
      ul.appendChild(li);
    });
    box.appendChild(ul);
    return box;
  };

  // A Question card: one question at a time. "Next question" sits at the foot of the card and
  // lights up once this one is answered; it never looks like the toolbar's Next step.
  BLOCK.set = function (b, id) {
    var box = el("section", "pr-qcard");
    var n = b.items.length;
    var at = Math.min(S.set[id] || 0, n - 1);
    var label = b.label || "Question";
    var countText = n > 1 ? label + " " + (at + 1) + " of " + n : label;
    box.setAttribute("aria-label", countText);
    var head = el("div", "pr-qcard-head");
    var count = cardLabel(QMARK, countText);
    count.classList.add("pr-set-count");
    head.appendChild(count);
    var dots = el("ol", "pr-qdots");
    dots.setAttribute("aria-hidden", "true");
    b.items.forEach(function () { dots.appendChild(el("li")); });
    if (n > 1) { head.appendChild(dots); }
    box.appendChild(head);
    var it = b.items[at];
    var itId = it.id || id + "-" + at;
    box.appendChild(block(it, itId));
    var foot = el("div", "pr-qcard-foot");
    var prev = btn("pr-btn pr-btn-quiet", "\u2190 Previous", function () { move(-1); });
    prev.hidden = at === 0;
    foot.appendChild(prev);
    var next = btn("pr-btn pr-btn-go", "Next " + label.toLowerCase() + " \u2192", function () { move(1); });
    var end = el("p", "pr-qcard-end");
    if (at < n - 1) { foot.appendChild(next); } else { foot.appendChild(end); }
    box.appendChild(foot);
    function paint() {
      Array.prototype.forEach.call(dots.children, function (d, k) {
        var x = b.items[k];
        d.className = (k === at ? "is-now " : "") + (itemDone(x, x.id || id + "-" + k) ? "is-done" : "");
      });
      var ok = itemDone(it, itId);
      next.classList.toggle("is-ready", ok);
      var all = b.items.every(function (x, k) { return itemDone(x, x.id || id + "-" + k); });
      end.textContent = all && n > 1 ? "\u2713 All " + n + " done." : "";
    }
    refreshers.push(function () { if (box.isConnected) { paint(); } });
    paint();
    function move(d) {
      S.set[id] = Math.max(0, Math.min(n - 1, at + d));
      save();
      var fresh = BLOCK.set(b, id);
      box.parentNode.replaceChild(fresh, box);
      var f = fresh.querySelector(".pr-q, label");
      if (f) { f.setAttribute("tabindex", "-1"); f.focus(); }
      say(label + " " + (S.set[id] + 1) + " of " + n);
    }
    return box;
  };

  // Is this piece of work finished? Used for Done when (Next lights up) and the card dots.
  function itemDone(b, id) {
    switch (b.type) {
      case "tap": case "predict": return typeof S.choice[id] === "number";
      case "write":
        if (!b.model) { return (S.text[id] || "").trim().length >= 3; }
        return b.marks ? typeof S.marks[id] === "number" : !!S.checked[id];
      case "compare":
        return b.rows.every(function (r, i) {
          return b.cols.every(function (c, j) { return (S.text[id + "-" + i + "-" + j] || "").trim().length > 0; });
        });
      case "cloze": return Object.keys(S.cloze[id] || {}).length >= b.lines.length;
      case "rate": return b.items.every(function (t, i) { return !!S.rate[id + "-" + i]; });
      case "step": case "booklet": return !!S.ticks[id];
      case "branch":
        var k = S.choice[id];
        return typeof k === "number" && listDone(b.options[k].items, id + "-o" + k);
      case "stop": return !!S.ticks[id];
      case "set": return b.items.every(function (x, k) { return itemDone(x, x.id || id + "-" + k); });
      case "read": case "row": case "democard":
        return (b.items || []).every(function (x, k) { return itemDone(x, x.id || id + "-" + k); });
      default: return true;
    }
  }
  function listDone(list, base) {
    return (list || []).every(function (b, k) { return itemDone(b, b.id || base + "-" + k); });
  }
  function screenDone(k) {
    var sc = DATA.screens[k];
    if (sc.pause && !S.pause[sc.id]) { return false; }
    // the practice cards on the how-to step are optional: the tour is its Done when
    if (sc.needTour) { return S.tour === 1; }
    var ok = sc.parts
      ? sc.parts.every(function (pt, pi) { return listDone(pt.main, sc.id + "-p" + pi); })
      : listDone(sc.main, sc.id + "-m");
    ok = ok && listDone(sc.after, sc.id + "-a");
    if (sc.needs && !S.ticks[sc.needs]) { return false; }
    return ok;
  }

  function block(b, id) {
    var f = BLOCK[b.type];
    return f ? f(b, id) : el("p", "pr-p", b.text || "");
  }
  function blocks(list, idBase, into) {
    (list || []).forEach(function (b, k) { into.appendChild(block(b, b.id || idBase + "-" + k)); });
  }

  // ------------------------------------------------------------ figures (with an optional second state)
  function figure(f) {
    var fig = el("figure", "pr-fig" + (f.photo ? " is-photo" : "") + (f.shot || f.wide ? " is-shot" : ""));
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

  // ------------------------------------------------------------ the side column: the picture, or one panel
  // The picture stays (words and picture together). Help, Waiting?, Challenge and I can are
  // closed until the pupil taps them on the toolbar; one opens in the picture's place.
  var PANELS = [
    { id: "help", key: "help", label: "Help" },
    { id: "wait", key: "wait", label: "Waiting?" },
    { id: "ch", key: "challenge", label: "Challenge" },
    { id: "ican", key: "ican", label: "I can" }
  ];
  var openPanel = null;

  function panelBox(sc, p) {
    var wrap = el("aside", "pr-side");
    wrap.id = "prPanel";
    wrap.setAttribute("aria-label", p.label);
    var head = el("div", "pr-panel-head");
    head.appendChild(el("p", "pr-panel-title", p.label));
    head.appendChild(btn("pr-btn pr-btn-quiet pr-panel-close", sc.fig ? "Back to the picture" : "Close", function () {
      togglePanel(null);
    }));
    wrap.appendChild(head);
    var panel = el("div", "pr-panel");
    if (p.id === "ch") {
      var top = el("p", "pr-ch-top");
      top.appendChild(el("strong", null, "Challenge. "));
      top.appendChild(document.createTextNode("Try it if you have time."));
      panel.appendChild(top);
    }
    blocks(sc[p.key], sc.id + "-" + (p.id === "ican" ? "ican" : p.id), panel);
    wrap.appendChild(panel);
    return wrap;
  }
  function togglePanel(id) {
    openPanel = openPanel === id ? null : id;
    render(false);
    var b = id && openPanel ? root.querySelector(".pr-panel-head .pr-panel-close")
      : document.querySelector('.pr-tb-toggle[data-panel="' + id + '"]');
    if (b) { b.focus(); }
  }

  // One instruction at a time: in each list of tick lines, the next one is bright, done ones grey.
  function focusSteps() {
    Array.prototype.forEach.call(root.querySelectorAll(".pr-items, .pr-main"), function (box) {
      var steps = Array.prototype.filter.call(box.children, function (c) { return c.classList.contains("pr-step"); });
      if (steps.length < 2) { return; }
      var seen = false;
      steps.forEach(function (st) {
        var on = st.querySelector("input").checked;
        st.classList.toggle("is-ticked", on);
        st.classList.toggle("is-next", !on && !seen);
        st.classList.toggle("is-later", !on && seen);
        if (!on) { seen = true; }
      });
    });
  }

  function topRow(sc, k) {
    var head = el("div", "pr-top");
    var left = el("div", "pr-head");
    var h = el("h2", null, sc.title);
    h.id = "prTitle";
    left.appendChild(h);
    var meta = el("p", "pr-meta");
    if (sc.mins) { meta.appendChild(el("span", "pr-mins", "about " + sc.mins + " min")); }
    if (sc.page) { meta.appendChild(el("span", "pr-page", sc.page)); }
    if (sc.parts) {
      var pi = Math.min(S.part[sc.id] || 0, sc.parts.length - 1);
      meta.appendChild(el("span", "pr-part", "Part " + (pi + 1) + " of " + sc.parts.length + ": " + sc.parts[pi].title));
    }
    if (meta.children.length) { left.appendChild(meta); }
    // back to the notes sits on the title row, so it costs the checks no height
    if (sc.parts && pi > 0 && !(sc.pause && !S.pause[sc.id])) {
      left.appendChild(btn("pr-btn pr-btn-quiet pr-part-back", "\u2190 Back", function () {
        S.part[sc.id] = pi - 1; save(); render(true);
      }));
    }
    head.appendChild(left);

    // Step 3 of 13 and a thin bar; tap it to see every step.
    var d = el("details", "pr-steps");
    var sm = el("summary");
    var off = HOWTO === 0 ? 1 : 0;
    sm.appendChild(el("span", "pr-steps-n", k < off ? "Before you start" : "Step " + (k + 1 - off) + " of " + (N - off)));
    var bar = el("span", "pr-steps-bar");
    bar.setAttribute("aria-hidden", "true");
    var fill = el("span");
    fill.style.width = Math.round((k + 1 - off) / (N - off) * 100) + "%";
    bar.appendChild(fill);
    sm.appendChild(bar);
    d.appendChild(sm);
    var ol = el("ol", "pr-steps-list");
    DATA.screens.forEach(function (x, j) {
      var li = el("li", j === k ? "is-now" : "");
      var b = btn(null, (j + 1 - off) + ". " + x.title, function () { d.open = false; go(j); });
      if (j === k) { b.setAttribute("aria-current", "step"); }
      li.appendChild(b);
      ol.appendChild(li);
    });
    d.appendChild(ol);
    head.appendChild(d);
    return head;
  }

  // A pupil who arrives late at the kit builds it later, by themselves (teacher, 7 Oct). Until they
  // say the kit is free, the build step asks them that one question instead.
  function kitFree(sc) {
    var card = el("section", "pr-kitfree");
    card.setAttribute("aria-label", "Is the kit free?");
    card.appendChild(cardLabel(QMARK, "Is the kit free now?"));
    card.appendChild(para("pr-p", sc.lateText || "Wait until the others have finished and handed you the parts."));
    var row = el("div", "pr-options");
    row.appendChild(btn("pr-btn pr-btn-main", "Yes: I'll build it now", function () {
      S.kit = "own";
      S.back = -1;
      save();
      render(true);
      say("Build it yourself, one line at a time.");
    }));
    if (BUSY >= 0) {
      row.appendChild(btn("pr-btn", "Not yet: go on with " + DATA.screens[BUSY].title, function () {
        S.back = DATA.screens.indexOf(sc);
        go(BUSY);
      }));
    }
    card.appendChild(row);
    return card;
  }

  function screen(k) {
    var sc = DATA.screens[k];
    var wrap = el("section", "pr-screen");
    wrap.setAttribute("aria-labelledby", "prTitle");
    wrap.appendChild(topRow(sc, k));
    if (sc.mode || sc.do || sc.team || sc.done) { wrap.appendChild(doBox(sc, true)); }

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
    var fig = sc.fig;
    if (sc.kitBuild && S.kit === "late") {
      main.appendChild(kitFree(sc));
    } else if (sc.needs && !S.ticks[sc.needs]) {
      // the test lines stay hidden until an adult has checked the build
      main.appendChild(BLOCK.stop(DATA.stop || {}, sc.needs));
    } else if (sc.parts) {
      var pi = Math.min(S.part[sc.id] || 0, sc.parts.length - 1);
      var part = sc.parts[pi];
      if (part.fig) { fig = part.fig; }
      blocks(part.main, sc.id + "-p" + pi, main);
      if (pi < sc.parts.length - 1) {
        var on = el("p", "pr-linkline");
        var nb = btn("pr-btn pr-btn-go", (part.next || "Next part") + " →", function () {
          S.part[sc.id] = pi + 1; save(); render(true);
        });
        on.appendChild(nb);
        main.appendChild(on);
        // the next-part button lights up once this part's lines are done
        var lit = function () { nb.classList.toggle("is-ready", listDone(part.main, sc.id + "-p" + pi)); };
        lit();
        refreshers.push(lit);
      }
    } else {
      blocks(sc.main, sc.id + "-m", main);
    }
    if (sc.finish && DATA.badge && DATA.badge.name) {
      main.appendChild(para("pr-badge-line", "**Badge earned:** " + DATA.badge.name + "."));
    }
    body.appendChild(main);

    var p = openPanel && PANELS.filter(function (x) { return x.id === openPanel && sc[x.key]; })[0];
    if (fig || p || sc.after) {
      var col = el("div", "pr-sidecol");
      if (p) { col.appendChild(panelBox(sc, p)); }
      else if (fig) {
        col.appendChild(figure(fig));
        // a screenshot needs the room to read its numbers: the picture takes the wider column
        if (fig.shot || fig.wide) { body.classList.add("has-shot"); }
      }
      // "everyone" blocks sit under the picture, where the column has room; an open panel needs that room
      if (!p) { blocks(sc.after, sc.id + "-a", col); }
      body.appendChild(col);
    } else {
      body.classList.add("is-single");
    }
    wrap.appendChild(body);

    if (sc.finish && window.Progress && DATA.badge) {
      try { window.Progress.complete(DATA.badge.challenge); } catch (e) { /* progress engine missing */ }
    }
    return wrap;
  }

  // ------------------------------------------------------------ the toolbar, fixed to the foot of the screen
  var nextBtn = null;
  function toolbar() {
    var sc = DATA.screens[S.screen];
    var bar = el("nav", "pr-toolbar");
    bar.setAttribute("aria-label", "Lesson tools");
    var inner = el("div", "pr-tb-inner");

    var left = el("div", "pr-tb-left");
    var more = el("details", "pr-more");
    var ms = el("summary", "pr-btn pr-btn-quiet", "More");
    more.appendChild(ms);
    var menu = el("div", "pr-more-menu");
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
      openPanel = null;
      save();
      render(true);
      say("Cleared.");
    });
    menu.appendChild(clear);
    if (DATA.back) {
      var a = el("a", "pr-btn pr-btn-quiet", DATA.back.text);
      a.href = DATA.back.href;
      menu.appendChild(a);
    }
    if (TR && WHO && WHO.num) {
      var lo = btn("pr-btn pr-btn-quiet", "Log out (number " + WHO.num + ")", function () { logOut(); });
      menu.appendChild(lo);
    } else if (TR) {
      menu.appendChild(btn("pr-btn pr-btn-quiet", "Log in with my number", function () { setWho(null); render(true); }));
    }
    menu.appendChild(el("p", "pr-saved-note pr-sync-note", syncText()));
    more.appendChild(menu);
    left.appendChild(more);
    if (TR && WHO && WHO.num) {
      var chip = el("span", "pr-who", "No. " + WHO.num);
      chip.setAttribute("aria-label", "Logged in as number " + WHO.num);
      left.appendChild(chip);
    }
    if (HOWTO >= 0) {
      var q = btn("pr-btn pr-btn-quiet pr-tb-how", "?", function () { go(HOWTO); startTour(); });
      q.setAttribute("aria-label", "How this page works");
      left.appendChild(q);
    }
    // waiting for the kit: a reminder that stays on every step until the pupil goes back to it
    if (S.back >= 0 && S.screen !== S.back) {
      var kb = btn("pr-btn pr-kitback", "Kit: come back", function () { go(S.back); });
      kb.setAttribute("aria-label", "Go back to the kit: " + DATA.screens[S.back].title);
      left.appendChild(kb);
    }
    inner.appendChild(left);

    var mid = el("div", "pr-tb-mid");
    PANELS.forEach(function (p) {
      if (!sc[p.key]) { return; }
      var t = btn("pr-btn pr-btn-quiet pr-tb-toggle", p.label, function () { togglePanel(p.id); });
      t.dataset.panel = p.id;
      t.setAttribute("aria-pressed", openPanel === p.id ? "true" : "false");
      t.setAttribute("aria-controls", "prPanel");
      mid.appendChild(t);
    });
    inner.appendChild(mid);

    var right = el("div", "pr-tb-right");
    if (S.screen > 0) {
      var back = btn("pr-btn pr-tb-back", null, function () { go(S.screen - 1); });
      back.appendChild(el("span", null, "Back"));
      back.setAttribute("aria-label", "Back a step");
      right.appendChild(back);
    }
    nextBtn = null;
    if (S.screen < N - 1) {
      var to = nextIndex(S.screen);
      var nx = DATA.screens[to];
      nextBtn = btn("pr-btn pr-next", null, function () { go(to); });
      var nw = el("span", "pr-next-word", "Next");
      nw.appendChild(el("span", "pr-next-name", ": " + (to === S.back ? "back to the kit" : nx.title)));
      nextBtn.appendChild(nw);
      nextBtn.appendChild(el("span", "pr-next-arrow", "→"));
      nextBtn.setAttribute("aria-label", "Next step: " + nx.title);
      right.appendChild(nextBtn);
    }
    inner.appendChild(right);
    bar.appendChild(inner);
    return bar;
  }
  // Where Next goes. A pupil waiting for the kit goes back to it after the busy steps; once they
  // have built it, the busy steps they already did are stepped over on the way to the end.
  function nextIndex(k) {
    if (S.back >= 0 && DATA.screens[k].busyEnd) { return S.back; }
    var j = k + 1;
    while (S.late && j < N - 1 && DATA.screens[j].busy && screenDone(j)) { j++; }
    return j;
  }
  // Next is always usable (pupils move at their own pace); it fills and pulses once when Done when is met.
  var wasDone = null;
  function paintNext() {
    if (!nextBtn) { return; }
    var done = screenDone(S.screen);
    nextBtn.classList.toggle("is-ready", done);
    if (done && wasDone === false) {
      nextBtn.classList.remove("is-pulse");
      void nextBtn.offsetWidth;
      nextBtn.classList.add("is-pulse");
      say("Done. Tap Next when you are ready.");
    }
    wasDone = done;
  }

  function go(k) {
    var moved = k !== S.screen;
    if (moved) { openPanel = null; }
    S.screen = Math.max(0, Math.min(N - 1, k));
    if (moved) { S.stepAt = Date.now(); }
    save();
    if (moved) { queueSync(true); }
    render(true);
    var top = root.getBoundingClientRect().top;
    if (top < 0) { window.scrollBy(0, top - 8); }
  }

  function render(focus) {
    closePop(false);
    endTour(false);
    refreshers = [];
    root.textContent = "";
    var old = document.querySelector(".pr-toolbar");
    if (old) { old.remove(); }
    if (TR && !WHO) {
      root.appendChild(loginScreen());
      return;
    }
    var tb = toolbar();
    root.appendChild(screen(S.screen));
    document.body.appendChild(tb);
    wasDone = null;
    paintNext();
    focusSteps();
    refreshers.push(paintNext, focusSteps);
    if (focus) {
      var h = document.getElementById("prTitle");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }
    var sc = DATA.screens[S.screen];
    // checked again when it fires: saved work may have arrived (and moved the pupil on) in between
    if (sc.needTour && S.tour !== 1 && !tourOn) {
      setTimeout(function () { if (!tourOn && S.tour !== 1 && DATA.screens[S.screen].needTour) { startTour(); } }, 350);
    }
  }

  // ------------------------------------------------------------ How this page works: a spotlight tour
  // One stop per tap, like a click-change slide: everything but the stop goes dim.
  var HOWTO = -1, BUSY = -1;
  DATA.screens.forEach(function (sc, k) {
    if (sc.needTour) { HOWTO = k; }
    if (sc.busy && BUSY < 0) { BUSY = k; }
  });
  var tourOn = false, tourAt = 0, tourTip = null, tourDim = null, tourEl = null;
  function endTour(finished) {
    if (tourEl) { tourEl.classList.remove("pr-spot"); }
    document.body.classList.remove("pr-touring", "pr-touring-tb");
    if (tourTip) { tourTip.remove(); }
    if (tourDim) { tourDim.remove(); }
    tourTip = tourDim = tourEl = null;
    if (!tourOn) { return; }
    tourOn = false;
    if (finished !== false) {
      S.tour = 1;
      save();
      if (nextBtn) { nextBtn.focus(); }
    }
  }
  function startTour() {
    if (HOWTO < 0 || !DATA.tour) { return; }
    if (S.screen !== HOWTO) { go(HOWTO); }
    endTour(false);
    tourOn = true;
    tourAt = 0;
    tourDim = el("div", "pr-tour-dim");
    tourDim.addEventListener("click", function () { tourStep(1); });
    document.body.appendChild(tourDim);
    document.body.classList.add("pr-touring");
    tourStep(0);
  }
  function tourStep(d) {
    tourAt += d;
    var stops = DATA.tour.filter(function (t) { return document.querySelector(t.at); });
    if (tourAt >= stops.length) { endTour(true); say("Tour finished. Try the practice card, then tap Next."); return; }
    var st = stops[tourAt];
    if (tourEl) { tourEl.classList.remove("pr-spot"); }
    tourEl = document.querySelector(st.at);
    var inBar = !!tourEl.closest(".pr-toolbar");
    document.body.classList.toggle("pr-touring-tb", inBar);
    tourEl.classList.add("pr-spot");
    if (!inBar) { tourEl.scrollIntoView({ block: "nearest" }); }
    if (tourTip) { tourTip.remove(); }
    tourTip = el("div", "pr-tour-tip");
    tourTip.setAttribute("role", "dialog");
    tourTip.setAttribute("aria-label", "How this page works, " + (tourAt + 1) + " of " + stops.length);
    tourTip.appendChild(el("p", "pr-tour-n", (tourAt + 1) + " of " + stops.length));
    tourTip.appendChild(para("pr-tour-text", st.text));
    var row = el("div", "pr-tour-btns");
    row.appendChild(btn("pr-btn pr-btn-quiet", "Skip", function () { endTour(true); }));
    var last = tourAt === stops.length - 1;
    var nb = btn("pr-btn pr-btn-main", last ? "Finish" : "Next tip →", function () { tourStep(1); });
    row.appendChild(nb);
    tourTip.appendChild(row);
    document.body.appendChild(tourTip);
    var r = tourEl.getBoundingClientRect();
    var w = tourTip.offsetWidth, h = tourTip.offsetHeight;
    // a stop can name what its tip sits under, so the tip never hides the next thing to read
    var under = st.below && document.querySelector(st.below);
    var y = (under ? under.getBoundingClientRect().bottom : r.bottom) + 14;
    if (y + h > window.innerHeight - 8) { y = r.top - h - 14; }
    if (y < 8) { y = Math.min(window.innerHeight - h - 8, r.top + 14); }
    tourTip.style.left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8) + "px";
    tourTip.style.top = Math.max(8, y) + "px";
    nb.focus({ preventScroll: true });
    say(st.text.replace(/\*\*|\{|\}/g, ""));
  }
  document.addEventListener("keydown", function (e) { if (tourOn && e.key === "Escape") { endTour(true); } });
  window.addEventListener("resize", function () { if (tourOn) { tourStep(0); } });

  // where each saved answer lives, for the "come back to" list
  var WHERE = {}, PART = {};
  function mapIds(list, k, base, pi) {
    (list || []).forEach(function (b, j) {
      var id = b.id || base + "-" + j;
      WHERE[id] = k;
      if (pi != null) { PART[id] = pi; }
      if (b.items && (b.type === "set" || b.type === "read" || b.type === "row")) { mapIds(b.items, k, id, pi); }
    });
  }
  DATA.screens.forEach(function (sc, k) {
    mapIds(sc.main, k, sc.id + "-m");
    (sc.parts || []).forEach(function (pt, pi) { mapIds(pt.main, k, sc.id + "-p" + pi, pi); });
    mapIds(sc.after, k, sc.id + "-a");
    mapIds(sc.help, k, sc.id + "-help");
    mapIds(sc.wait, k, sc.id + "-wait");
    mapIds(sc.challenge, k, sc.id + "-ch");
  });

  // ------------------------------------------------------------ log in with a number (teacher, 6 Oct)
  // A pupil logs in with their number (01-40, on their booklet cover). Only the number and the
  // work go to the teacher's store; no name is typed or sent. With no store set, the page is
  // device-only, as before.
  var TR = DATA.track && DATA.track.url ? DATA.track : null;
  // one log-in for every practical page, so a pupil logs in once (teacher, 6 Oct)
  var WK = "pr-who-v1";
  var WHO = null;
  try { WHO = JSON.parse(localStorage.getItem(WK)); } catch (e) { WHO = null; }
  var SYNC = { state: "idle", at: 0 };
  var syncTimer = null, lastSent = 0, sending = false, again = false;

  function cleanNum(v) {
    var d = String(v == null ? "" : v).replace(/\D/g, "");
    if (!d) { return null; }
    var n = parseInt(d, 10);
    if (!(n >= 1 && n <= (TR && TR.max || 40))) { return null; }
    return (n < 10 ? "0" : "") + n;
  }
  function call(body) {
    return fetch(TR.url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); });
  }
  function setWho(w) {
    WHO = w;
    try { if (w) { localStorage.setItem(WK, JSON.stringify(w)); } else { localStorage.removeItem(WK); } } catch (e) { /* this visit only */ }
  }
  function summary() {
    var done = [];
    DATA.screens.forEach(function (sc, k) { if (screenDone(k)) { done.push(sc.id); } });
    return { step: S.screen, stepId: DATA.screens[S.screen].id, stepAt: S.stepAt || null, done: done, kit: S.kit || "",
      waiting: S.back >= 0 };
  }
  function payload() {
    return { op: "save", num: WHO.num, lesson: TR.lesson, at: S.savedAt || Date.now(), summary: summary(), state: S };
  }
  // At most one save every 30 s, and one straight away (10 s apart at most) when the step changes.
  function queueSync(soon) {
    if (!TR || !WHO || !WHO.num) { return; }
    clearTimeout(syncTimer);
    var wait = soon ? Math.max(0, 10000 - (Date.now() - lastSent)) : 30000;
    syncTimer = setTimeout(sendNow, wait);
  }
  function sendNow() {
    if (!TR || !WHO || !WHO.num) { return; }
    if (sending) { again = true; return; }
    sending = true;
    lastSent = Date.now();
    SYNC.state = "saving";
    paintSync();
    call(payload()).then(function (j) {
      SYNC.state = j && j.ok ? "saved" : "error";
      if (SYNC.state === "saved") { SYNC.at = Date.now(); }
    }).catch(function () {
      SYNC.state = "error";
    }).then(function () {
      sending = false;
      paintSync();
      if (SYNC.state === "error") { clearTimeout(syncTimer); syncTimer = setTimeout(sendNow, 60000); }
      if (again) { again = false; queueSync(true); }
    });
  }
  window.addEventListener("pagehide", function () {
    if (!TR || !WHO || !WHO.num || !syncTimer || !navigator.sendBeacon) { return; }
    try { navigator.sendBeacon(TR.url, new Blob([JSON.stringify(payload())], { type: "text/plain;charset=utf-8" })); } catch (e) { /* the next visit saves */ }
  });
  function syncText() {
    if (!WHO || !WHO.num) { return "Your work is saved on this device only."; }
    if (SYNC.state === "saving") { return "Saving for your teacher…"; }
    if (SYNC.state === "error") { return "Not sent yet: your work is safe on this device, and it will try again."; }
    if (SYNC.state === "saved") { return "Saved for your teacher ✓"; }
    return "Your work is saved for your teacher as you go.";
  }
  function paintSync() {
    var n = document.querySelector(".pr-sync-note");
    if (n) { n.textContent = syncText(); }
    var c = document.querySelector(".pr-who");
    if (c) { c.classList.toggle("is-error", SYNC.state === "error"); }
  }

  function loginScreen() {
    var box = el("section", "pr-login");
    box.setAttribute("aria-labelledby", "prTitle");
    var h = el("h2", null, "Log in with your number");
    h.id = "prTitle";
    box.appendChild(h);
    var msg = el("p", "pr-login-msg");
    msg.setAttribute("aria-live", "polite");
    var stage = el("div", "pr-login-stage");
    box.appendChild(stage);
    box.appendChild(msg);
    var skip = btn("pr-btn pr-btn-quiet", "No number yet? Carry on without logging in", function () {
      setWho({ num: null, skip: true });
      render(true);
    });
    box.appendChild(skip);

    function ask(prefill, why) {
      stage.textContent = "";
      msg.textContent = why || "";
      var f = el("form", "pr-login-form");
      var lab = el("label", null, "Your number (it is on your booklet cover)");
      lab.htmlFor = "prNum";
      f.appendChild(lab);
      var row = el("div", "pr-login-row");
      var inp = el("input");
      inp.id = "prNum";
      inp.type = "text";
      inp.inputMode = "numeric";
      inp.autocomplete = "off";
      inp.maxLength = 2;
      inp.pattern = "[0-9]*";
      inp.value = prefill || "";
      row.appendChild(inp);
      var go1 = el("button", "pr-btn pr-btn-main", "Next");
      go1.type = "submit";
      row.appendChild(go1);
      f.appendChild(row);
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var n = cleanNum(inp.value);
        if (!n) { msg.textContent = "Type a number from 01 to " + (TR.max || 40) + "."; inp.focus(); return; }
        confirm1(n);
      });
      stage.appendChild(f);
      inp.focus();
    }
    function confirm1(n) {
      stage.textContent = "";
      msg.textContent = "";
      var p = el("p", "pr-login-big");
      p.appendChild(document.createTextNode("Number "));
      p.appendChild(el("strong", null, n));
      stage.appendChild(p);
      stage.appendChild(el("p", "pr-p", "Is that the number on your booklet cover?"));
      var row = el("div", "pr-login-row");
      var yes = btn("pr-btn pr-btn-main", "Yes, that's me", function () { yes.disabled = true; check(n); });
      row.appendChild(yes);
      row.appendChild(btn("pr-btn", "No, change it", function () { ask(n); }));
      stage.appendChild(row);
      yes.focus();
    }
    function check(n) {
      msg.textContent = "Checking…";
      call({ op: "hello", num: n, lesson: TR.lesson }).then(function (j) {
        if (j && j.ok) { return restore(n); }
        if (j && j.error === "number") { ask(n, "Number " + n + " is not on your teacher's list. Check your booklet cover."); return; }
        throw new Error("store");
      }).catch(function () {
        // the store can't be reached: log in anyway; the work saves here and is sent later
        setWho({ num: n });
        SYNC.state = "error";
        render(true);
        say("Logged in as number " + n + ". Your teacher's tracker can't be reached yet, so your work saves on this device for now.");
      });
    }
    function restore(n) {
      return call({ op: "load", num: n, lesson: TR.lesson }).then(function (j) {
        // the work on this device is this pupil's if they were logged in here, or working without a number
        var mine = !!WHO && (WHO.num === n || WHO.skip);
        if (j && j.ok && j.state && (!mine || +(j.state.savedAt || 0) > +(S.savedAt || 0))) {
          var f = fresh();
          Object.keys(f).forEach(function (k) { if (j.state[k] == null || typeof j.state[k] !== typeof f[k]) { j.state[k] = f[k]; } });
          S = j.state;
          try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* this visit only */ }
        } else if (!mine) {
          S = fresh();
        }
        setWho({ num: n });
        SYNC.state = "idle";
        render(true);
        say("Logged in as number " + n + ".");
        queueSync(true);
      }).catch(function () {
        setWho({ num: n });
        render(true);
      });
    }
    ask("");
    return box;
  }

  // Opening another lesson while logged in: fetch this lesson's saved work if the store's copy is newer.
  function pullLesson() {
    if (!TR || !WHO || !WHO.num) { return; }
    call({ op: "load", num: WHO.num, lesson: TR.lesson }).then(function (j) {
      if (!(j && j.ok && j.state) || +(j.state.savedAt || 0) <= +(S.savedAt || 0)) { return; }
      var f = fresh();
      Object.keys(f).forEach(function (k) { if (j.state[k] == null || typeof j.state[k] !== typeof f[k]) { j.state[k] = f[k]; } });
      S = j.state;
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* this visit only */ }
      render(false);
      say("Your saved work for this lesson is back.");
    }).catch(function () { /* stays device-only until the next save */ });
  }

  function logOut() {
    if (TR && WHO && WHO.num) {
      clearTimeout(syncTimer);
      try { call(payload()); } catch (e) { /* best effort */ }
    }
    setWho(null);
    try { localStorage.removeItem(KEY); } catch (e) { /* nothing saved */ }
    S = fresh();
    openPanel = null;
    render(true);
  }

  // ------------------------------------------------------------ teacher view (projector)
  // Same lesson data, one big step at a time: the instruction box, who goes when, the picture
  // and a step timer. No answers are shown. The passcode only keeps pupils out of casual reach:
  // the page is public, so nothing secret may ever be put on it.
  function teacher() {
    var TK = KEY + "-teacher";
    var want = root.dataset.hash;
    // The pupils' how-to step is theirs alone; the teacher's step 0 is the walk-in screen.
    var TS = DATA.screens.filter(function (x) { return !x.pupilOnly; });
    var TN = TS.length;
    var T = { screen: DATA.walkin ? -1 : 0, fs: false };
    try {
      var v = localStorage.getItem(TK);
      if (v != null) { T.screen = Math.max(DATA.walkin ? -1 : 0, Math.min(TN - 1, +v)); }
    } catch (e) { /* nothing saved */ }
    var left = 0, tick = null, clock = null, fsBox = null;

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
      T.screen = Math.max(DATA.walkin ? -1 : 0, Math.min(TN - 1, k));
      try { localStorage.setItem(TK, String(T.screen)); } catch (e) { /* not saved */ }
      stop();
      show(true);
    }

    function stepBar() {
      var bar = el("div", "pr-bar");
      var dots = el("ol", "pr-dots");
      dots.setAttribute("aria-label", "Steps of the lesson");
      var list = DATA.walkin ? [{ title: "Walk-in screen", label: "0", k: -1 }] : [];
      TS.forEach(function (x, k) { list.push({ title: x.title, label: String(k + 1), k: k }); });
      list.forEach(function (x) {
        var li = el("li", x.k === T.screen ? "is-now" : (x.k < T.screen ? "is-done" : ""));
        var b = btn(null, x.label, function () { move(x.k); });
        b.setAttribute("aria-label", "Step " + x.label + ": " + x.title);
        if (x.k === T.screen) { b.setAttribute("aria-current", "step"); }
        li.appendChild(b);
        dots.appendChild(li);
      });
      bar.appendChild(dots);
      if (T.screen >= 0) {
        var sf = el("p", "pr-safety");
        sf.appendChild(img("icon_safety.png", ""));
        var st = el("span");
        st.appendChild(el("strong", null, "SAFETY "));
        st.appendChild(document.createTextNode(TS[T.screen].safety || DATA.safety));
        sf.appendChild(st);
        bar.appendChild(sf);
      }
      return bar;
    }
    function navRow(withWhere) {
      var nav = el("div", "pr-nav");
      var mv = el("div", "pr-move");
      if (T.screen > (DATA.walkin ? -1 : 0)) {
        mv.appendChild(btn("pr-btn", "Back a step", function () { move(T.screen - 1); }));
      }
      if (T.screen < TN - 1) {
        mv.appendChild(btn("pr-btn pr-btn-main", "Next: " + TS[T.screen + 1].title + " →", function () { move(T.screen + 1); }));
      }
      if (withWhere && DATA.pupilWhere) {
        var wh = el("p", "pr-where");
        wh.appendChild(el("strong", null, "Pupils find this lesson at: "));
        rich(DATA.pupilWhere, wh);
        nav.appendChild(wh);
      }
      nav.appendChild(mv);
      return nav;
    }

    // Step 0: on the board as the class walks in. How to get to the page, and the lesson at a glance.
    function walkIn() {
      var W = DATA.walkin;
      var wrap = el("section", "pr-screen pr-teach pr-walkin");
      var h = el("h2", null, W.title);
      h.id = "prTitle";
      wrap.appendChild(h);
      var grid = el("div", "pr-walk-grid");

      var get = el("div", "pr-walk-get");
      get.appendChild(el("p", "pr-walk-h", "Open the lesson"));
      var qr = el("div", "pr-qr");
      qr.innerHTML = W.qr;
      var qs = qr.querySelector("svg");
      if (qs) { qs.setAttribute("role", "img"); qs.setAttribute("aria-label", "QR code for " + W.short); }
      get.appendChild(qr);
      // break before the path, never inside the domain
      var url = el("p", "pr-walk-url");
      var cut = W.short.indexOf("/");
      url.appendChild(document.createTextNode(cut > 0 ? W.short.slice(0, cut) : W.short));
      if (cut > 0) { url.appendChild(el("wbr")); url.appendChild(document.createTextNode(W.short.slice(cut))); }
      get.appendChild(url);
      if (DATA.pupilWhere) {
        var wh = el("p", "pr-walk-path");
        wh.appendChild(el("strong", null, "Or: "));
        rich(DATA.pupilWhere.replace(/^\*\*[^*]+\*\*\s*›\s*/, ""), wh);
        get.appendChild(wh);
      }
      grid.appendChild(get);

      var plan = el("div", "pr-walk-plan");
      plan.appendChild(el("p", "pr-walk-h", "As you come in"));
      var first = el("ol", "pr-walk-first");
      W.first.forEach(function (t) { var li = el("li"); rich(t, li); first.appendChild(li); });
      plan.appendChild(first);
      plan.appendChild(el("p", "pr-walk-h", "By the end, I can"));
      var ic = el("ul", "pr-list");
      W.icans.forEach(function (t) { ic.appendChild(el("li", null, t)); });
      plan.appendChild(ic);
      grid.appendChild(plan);
      plan = el("div", "pr-walk-plan is-steps");
      var total = TS.reduce(function (a, x) { return a + (x.mins || 0); }, 0);
      plan.appendChild(el("p", "pr-walk-h", "The lesson: " + TN + " steps, about " + total + " min"));
      var ol = el("ol", "pr-walk-steps");
      TS.forEach(function (x) {
        var li = el("li");
        li.appendChild(el("span", null, x.title));
        if (x.mins) { li.appendChild(el("span", "pr-walk-min", x.mins + " min")); }
        ol.appendChild(li);
      });
      plan.appendChild(ol);
      grid.appendChild(plan);
      wrap.appendChild(grid);
      return wrap;
    }

    // Full screen: the step's picture as big as the board allows, with its instructions beside it.
    function readBlocks(sc) {
      var out = [];
      (sc.parts ? sc.parts.reduce(function (a, p) { return a.concat(p.main); }, []) : sc.main || []).forEach(function (b) {
        if (b.type === "read") { out.push(b); }
      });
      return out;
    }
    function closeFs(back) {
      if (!fsBox) { return; }
      fsBox.remove();
      fsBox = null;
      document.body.classList.remove("pr-fs-on");
      if (back) {
        T.fs = false;
        var o = root.querySelector(".pr-fs-open");
        if (o) { o.focus(); }
      }
    }
    function openFs(sc) {
      closeFs(false);
      T.fs = true;
      fsBox = el("div", "pr-fs");
      fsBox.setAttribute("role", "dialog");
      fsBox.setAttribute("aria-modal", "true");
      fsBox.setAttribute("aria-label", "Full screen: " + sc.title);
      var pic = el("div", "pr-fs-pic");
      pic.appendChild(figure(sc.fig));
      fsBox.appendChild(pic);
      var side = el("div", "pr-fs-side");
      var x = btn("pr-btn pr-fs-close", "Close full screen ✕", function () { closeFs(true); });
      side.appendChild(x);
      side.appendChild(el("h2", null, (T.screen + 1) + ". " + sc.title));
      if (sc.mode || sc.do || sc.done) { side.appendChild(doBox(sc)); }
      blocks(readBlocks(sc), sc.id + "-fs", side);
      fsBox.appendChild(side);
      document.body.appendChild(fsBox);
      document.body.classList.add("pr-fs-on");
      x.focus({ preventScroll: true });
    }

    function show(focus) {
      closeFs(false);
      root.textContent = "";
      root.appendChild(stepBar());
      if (T.screen < 0) {
        clock = null;
        root.appendChild(walkIn());
        root.appendChild(navRow(false));
        if (focus) { var w = document.getElementById("prTitle"); w.setAttribute("tabindex", "-1"); w.focus({ preventScroll: true }); }
        return;
      }
      var sc = TS[T.screen];
      left = (sc.mins || 0) * 60;

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
        var fo = btn("pr-btn pr-fs-open", "Full screen ⤢", function () { openFs(sc); });
        fo.setAttribute("aria-label", "Full screen: the picture and the instructions");
        col.appendChild(fo);
        body.appendChild(col);
      }
      wrap.appendChild(body);
      root.appendChild(wrap);
      root.appendChild(navRow(true));
      if (T.fs && sc.fig) { openFs(sc); }
      else {
        T.fs = false;
        if (focus) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
      }
    }

    document.addEventListener("keydown", function (e) {
      if (!unlocked() || /INPUT|TEXTAREA/.test((e.target.tagName || ""))) { return; }
      if (e.key === "Escape" && fsBox) { closeFs(true); return; }
      if (e.key === "ArrowRight") { move(T.screen + 1); }
      if (e.key === "ArrowLeft") { move(T.screen - 1); }
    });
    if (unlocked()) { show(false); } else { gate(); }
  }
  if (root.dataset.view === "teacher") { teacher(); return; }

  if (window.Progress && DATA.badge) {
    try { window.Progress.markSeen(DATA.badge.id); } catch (e) { /* progress engine missing */ }
  }
  // iPad: the on-screen keyboard and a fixed toolbar fight for the same space, so the toolbar steps aside
  document.addEventListener("focusin", function (e) { if (e.target.tagName === "TEXTAREA") { document.body.classList.add("pr-typing"); } });
  document.addEventListener("focusout", function (e) { if (e.target.tagName === "TEXTAREA") { document.body.classList.remove("pr-typing"); } });
  document.addEventListener("click", function (e) {
    Array.prototype.forEach.call(document.querySelectorAll(".pr-more[open], .pr-steps[open]"), function (d) {
      if (!d.contains(e.target)) { d.open = false; }
    });
  });
  render(false);
  pullLesson();
})();
