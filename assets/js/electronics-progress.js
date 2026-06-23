/* ============================================================
   National 5 Electronics — progress & badges (shared module)
   Single source of truth for the badge registry, localStorage
   schema, the corner badge counter, the compact hub strip, the
   "badge guide" dialog and the unlock toast. All UI CSS is
   injected by this file so the counter works on every electronics
   page, whether or not it links electronics.css.

   Storage: one key "el-progress-v1" (per device, no accounts).
   Public API on window.ElProgress:
     markSeen(id)            mark an interactive as opened
     record(id, score, max)  log a scored attempt (stores best)
     get(id) / all()         read state
     reset()                 clear everything
     renderHub(el)           paint the compact hub strip
     decorateTiles()         add progress chips to [data-el-badges]
     openDetails()           open the badge-guide dialog
     toast(def)              accessible "badge unlocked" announce
   ============================================================ */
(function () {
  "use strict";

  var KEY = "el-progress-v1";
  var VERSION = 1;
  var DEFAULT_THRESHOLD = 0.8; /* mastery = 80% unless a badge says otherwise */

  /* ---- topic-mastery badges (one per scored interactive) ---- */
  var TOPIC = [
    { id: "thy-qc", name: "Number Cruncher",    emoji: "🧮", section: "Theory",
      href: "/classes/electronics/theory/quantities-and-calculations.html",
      cond: "Score 8/10 in the prefix & Ohm's-law challenge" },
    { id: "thy-rc", name: "Network Navigator",  emoji: "🔗", section: "Theory",
      href: "/classes/electronics/theory/resistor-circuits.html",
      cond: "Get 8/10 resistor totals right" },
    { id: "thy-ts", name: "Bright Spark",       emoji: "💡", section: "Theory", thr: 1,
      href: "/classes/electronics/theory/transistor-switching-circuits.html",
      cond: "Pass every transistor-switch scenario" },
    { id: "thy-sc", name: "Wave Reader",        emoji: "🌊", section: "Theory",
      href: "/classes/electronics/theory/signals-and-capacitors.html",
      cond: "Score 8/10 reading traces & RC curves" },
    { id: "thy-cd", name: "Component Collector", emoji: "🔌", section: "Theory",
      href: "/classes/electronics/theory/components-and-devices.html",
      cond: "Match 80% of the component symbols" },
    { id: "thy-li", name: "Logic Lord",         emoji: "🚦", section: "Theory", thr: 1,
      href: "/classes/electronics/theory/logic-and-ics.html",
      cond: "Complete the target truth tables" },
    { id: "sim-io", name: "The Operator",       emoji: "🎛️", section: "Simulation", thr: 1,
      href: "/classes/electronics/simulation.html",
      cond: "Satisfy the input → process → output brief" },
    { id: "pln-st", name: "Master Planner",     emoji: "🗂️", section: "Planning", thr: 1,
      href: "/classes/electronics/planning.html",
      cond: "Sequence the five marked stages correctly" },
    { id: "con-cc", name: "Solder Master",      emoji: "🪛", section: "Construction",
      href: "/classes/electronics/construction.html",
      cond: "Read 8/10 resistor colour codes" },
    { id: "tst-ff", name: "Fault Finder",       emoji: "🔬", section: "Testing",
      href: "/classes/electronics/testing.html",
      cond: "Diagnose 8/10 faults" }
  ];
  var ALL_TOPIC_IDS = TOPIC.map(function (t) { return t.id; });
  var THEORY_IDS = TOPIC.filter(function (t) { return t.section === "Theory"; })
    .map(function (t) { return t.id; });

  /* pages that carry section challenges (cloze, fill-ins, MC quiz) */
  function normPath(p) {
    try { p = decodeURIComponent(p); } catch (e) {}
    return p.replace(/\/+$/, "") || p;
  }
  var CHALLENGE_PAGES = TOPIC.map(function (t) { return normPath(t.href); });
  function pageKey() { return normPath(window.location.pathname); }

  /* ---- achievement ("extra progress") badges — auto-derived ---- */
  var ACH = [
    { id: "ach-theory", name: "Theory Triumph", emoji: "🎓",
      cond: "Master all six Theory topics",
      test: function (b) { return allUnlocked(b, THEORY_IDS); } },
    { id: "ach-practical", name: "Workshop Ready", emoji: "🛠️",
      cond: "Master Simulation, Planning & Construction",
      test: function (b) { return allUnlocked(b, ["sim-io", "pln-st", "con-cc"]); } },
    { id: "ach-full", name: "Circuit Master", emoji: "🏆",
      cond: "Unlock every topic badge",
      test: function (b) { return allUnlocked(b, ALL_TOPIC_IDS); } },
    { id: "ach-perfect", name: "Flawless", emoji: "⚡",
      cond: "Get full marks on any interactive",
      test: function (b) {
        return TOPIC.some(function (t) {
          var s = b[t.id]; return s && s.max > 0 && s.best >= s.max;
        });
      } },
    { id: "ach-explorer", name: "Tinkerer", emoji: "🧪",
      cond: "Open every interactive at least once",
      test: function (b) {
        return TOPIC.every(function (t) { var s = b[t.id]; return s && s.seen; });
      } },
    { id: "ach-curious", name: "Page Perfect", emoji: "🧩",
      cond: "Finish every challenge on a page",
      test: function (b, data) {
        return !!data && !!data.pageDone && Object.keys(data.pageDone).length >= 1;
      } },
    { id: "ach-scholar", name: "Completionist", emoji: "📚",
      cond: "Finish every challenge on every page",
      test: function (b, data) {
        return !!data && !!data.pageDone && CHALLENGE_PAGES.every(function (pk) { return data.pageDone[pk]; });
      } }
  ];

  var TOPIC_BY_ID = index(TOPIC);
  var ACH_BY_ID = index(ACH);

  function index(arr) {
    var m = {}; arr.forEach(function (d) { m[d.id] = d; }); return m;
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function allUnlocked(b, ids) {
    return ids.every(function (id) { return b[id] && b[id].unlocked; });
  }

  /* ---------- storage (private-mode safe) ---------- */
  function load() {
    var raw;
    try { raw = window.localStorage.getItem(KEY); }
    catch (e) { return { v: VERSION, badges: {}, challenges: {}, pageDone: {}, off: true }; }
    if (!raw) return { v: VERSION, badges: {}, challenges: {}, pageDone: {} };
    try {
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object" || !data.badges) {
        return { v: VERSION, badges: {}, challenges: {}, pageDone: {} };
      }
      if (!data.challenges) { data.challenges = {}; }
      if (!data.pageDone) { data.pageDone = {}; }
      return data;
    } catch (e) { return { v: VERSION, badges: {}, challenges: {}, pageDone: {} }; }
  }
  function save(data) {
    try { window.localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (e) { return false; }
  }
  function storageAvailable() {
    try {
      var k = "__elp_test__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  }

  /* recompute achievement badges from current topic + challenge state (idempotent) */
  function recomputeAchievements(data) {
    var badges = data.badges;
    var newly = [];
    ACH.forEach(function (a) {
      var was = badges[a.id] && badges[a.id].unlocked;
      var now = a.test(badges, data);
      if (now && !was) {
        badges[a.id] = { unlocked: true, at: today() };
        newly.push(a);
      } else if (now && was) {
        badges[a.id].unlocked = true;
      }
    });
    return newly;
  }

  /* ---------- public API ---------- */
  function markSeen(id) {
    if (!TOPIC_BY_ID[id]) return;
    var data = load();
    var s = data.badges[id] || (data.badges[id] = {});
    if (s.seen) { return; }
    s.seen = true;
    recomputeAchievements(data);
    save(data);
    refreshAll();
  }

  function record(id, score, max) {
    var def = TOPIC_BY_ID[id];
    if (!def) { return { unlocked: false, justUnlocked: false, newAchievements: [] }; }
    score = Math.max(0, Number(score) || 0);
    max = Math.max(1, Number(max) || 1);

    var data = load();
    var s = data.badges[id] || (data.badges[id] = {});
    var wasUnlocked = !!s.unlocked;

    s.seen = true;
    s.max = max;
    s.best = Math.max(typeof s.best === "number" ? s.best : 0, Math.min(score, max));

    var thr = typeof def.thr === "number" ? def.thr : DEFAULT_THRESHOLD;
    var nowUnlocked = wasUnlocked || (s.best / s.max >= thr);
    if (nowUnlocked) {
      s.unlocked = true;
      if (!s.at) { s.at = today(); }
    }

    var newAch = recomputeAchievements(data);
    save(data);
    refreshAll();

    return {
      unlocked: !!s.unlocked,
      justUnlocked: !wasUnlocked && !!s.unlocked,
      best: s.best, max: s.max,
      newAchievements: newAch
    };
  }

  function get(id) {
    var data = load();
    return data.badges[id] || null;
  }

  function all() {
    var data = load();
    return {
      topic: TOPIC.map(function (d) { return { def: d, state: data.badges[d.id] || null }; }),
      achievements: ACH.map(function (d) { return { def: d, state: data.badges[d.id] || null }; }),
      off: !!data.off || !storageAvailable()
    };
  }

  function reset() {
    try { window.localStorage.removeItem(KEY); } catch (e) {}
  }

  function counts() {
    var data = all();
    var topicU = data.topic.filter(function (b) { return b.state && b.state.unlocked; }).length;
    var achU = data.achievements.filter(function (b) { return b.state && b.state.unlocked; }).length;
    var total = data.topic.length + data.achievements.length;
    var earned = topicU + achU;
    return { data: data, earned: earned, total: total, pct: total ? Math.round(earned / total * 100) : 0 };
  }

  /* ---------- section challenges (cloze, fill-ins, MC quiz) ---------- */
  function pageChallengeEls() {
    return document.querySelectorAll("[data-el-challenge]");
  }
  function syncPageDone(data) {
    var els = pageChallengeEls();
    var total = els.length;
    if (!total) { return; }
    var pk = pageKey(), done = 0;
    Array.prototype.forEach.call(els, function (el) {
      if (data.challenges[pk + "::" + el.getAttribute("data-el-challenge")]) { done++; }
    });
    if (done >= total) { data.pageDone[pk] = true; }
  }
  function complete(id) {
    if (!id) { return; }
    var data = load();
    var k = pageKey() + "::" + id;
    if (data.challenges[k]) { return; }       /* sticky + idempotent */
    data.challenges[k] = true;
    syncPageDone(data);
    recomputeAchievements(data);
    save(data);
    refreshAll();
  }
  function challengeDone(id) {
    var data = load();
    return !!data.challenges[pageKey() + "::" + id];
  }
  function challengeState() {
    var data = load();
    var els = pageChallengeEls();
    var pk = pageKey(), total = els.length, done = 0;
    Array.prototype.forEach.call(els, function (el) {
      if (data.challenges[pk + "::" + el.getAttribute("data-el-challenge")]) { done++; }
    });
    return { page: { done: done, total: total }, globalDone: Object.keys(data.challenges).length };
  }
  function matchAns(v, ans) {
    if (ans == null) { return false; }
    var got = String(v).trim().toLowerCase().replace(/,/g, "");
    var gotN = parseFloat(got);
    return ans.split("|").some(function (o) {
      o = o.trim().toLowerCase();
      var oN = parseFloat(o);
      if (!isNaN(oN) && !isNaN(gotN)) {
        return Math.abs(gotN - oN) <= Math.max(1e-9, Math.abs(oN) * 0.02);
      }
      return got === o;
    });
  }

  /* per-page "section challenges" meter, injected at top of <main> */
  function renderMeter() {
    var cs = challengeState();
    var existing = document.getElementById("elpMeter");
    if (!cs.page.total) { if (existing) { existing.parentNode.removeChild(existing); } return; }
    var main = document.querySelector("main");
    if (!main) { return; }
    var m = existing;
    if (!m) {
      m = document.createElement("div");
      m.id = "elpMeter";
      m.className = "elp-meter";
      main.insertBefore(m, main.firstChild);
    }
    var pct = Math.round(cs.page.done / cs.page.total * 100);
    m.innerHTML =
      '<span class="elp-meter-lab">📋 Section challenges</span>' +
      '<span class="elp-meter-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + cs.page.total +
      '" aria-valuenow="' + cs.page.done + '" aria-label="Section challenges done">' +
      '<span style="width:' + pct + '%"></span></span>' +
      '<span class="elp-meter-num">' + cs.page.done + " / " + cs.page.total + "</span>";
  }

  /* bind the existing MC "Check your understanding" quiz (no page edits needed) */
  function bindQuiz() {
    var quiz = document.getElementById("quiz");
    if (!quiz) { return; }
    if (!quiz.getAttribute("data-el-challenge")) { quiz.setAttribute("data-el-challenge", "quiz"); }
    var mark = document.getElementById("quiz-mark");
    var scoreEl = document.getElementById("quiz-score");
    if (!mark || !scoreEl) { return; }
    mark.addEventListener("click", function () {
      /* the page's own handler runs first (registered at parse) and writes the score */
      var m = /(-?\d+)\s*\/\s*(\d+)/.exec(scoreEl.textContent || "");
      if (m) { var s = +m[1], t = +m[2]; if (t > 0 && s / t >= 0.7) { complete("quiz"); } }
    });
  }

  /* bind cloze blocks: <div class="elp-cloze" data-el-challenge="…"> */
  function bindCloze() {
    Array.prototype.forEach.call(document.querySelectorAll(".elp-cloze"), function (box) {
      var id = box.getAttribute("data-el-challenge");
      var sels = box.querySelectorAll(".cl-sel");
      var check = box.querySelector(".cl-check");
      var reset = box.querySelector(".cl-reset");
      var fb = box.querySelector(".fb-line");
      if (check) {
        check.addEventListener("click", function () {
          var allRight = true, answered = true;
          Array.prototype.forEach.call(sels, function (s) {
            if (!s.value) { answered = false; }
            var ok = s.value && s.value === s.getAttribute("data-answer");
            s.classList.toggle("is-ok", !!ok);
            s.classList.toggle("is-no", !!s.value && !ok);
            if (!ok) { allRight = false; }
          });
          if (!answered) { if (fb) { fb.textContent = "Choose an answer for every gap."; } return; }
          if (fb) { fb.textContent = allRight ? "✓ All correct!" : "Not quite — fix the highlighted gaps and check again."; }
          if (allRight) { complete(id); }
        });
      }
      if (reset) {
        reset.addEventListener("click", function () {
          Array.prototype.forEach.call(sels, function (s) { s.value = ""; s.classList.remove("is-ok", "is-no"); });
          if (fb) { fb.textContent = ""; }
        });
      }
    });
  }

  /* bind interactive fill-in worked examples: .guided[data-el-challenge] with .gap-in inputs */
  function bindFillins() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-el-challenge].elp-fillin"), function (box) {
      var id = box.getAttribute("data-el-challenge");
      var ins = box.querySelectorAll(".gap-in");
      var check = box.querySelector(".gp-check");
      var reset = box.querySelector(".gp-reset");
      var fb = box.querySelector(".fb-line");
      if (check) {
        check.addEventListener("click", function () {
          var allRight = true, answered = true;
          Array.prototype.forEach.call(ins, function (inp) {
            var v = (inp.value || "").trim();
            if (!v) { answered = false; }
            var ok = v && matchAns(v, inp.getAttribute("data-answer"));
            inp.classList.toggle("is-ok", !!ok);
            inp.classList.toggle("is-no", !!v && !ok);
            if (!ok) { allRight = false; }
          });
          if (!answered) { if (fb) { fb.textContent = "Fill in every gap first."; } return; }
          if (fb) { fb.textContent = allRight ? "✓ All correct!" : "Not quite — check the highlighted gaps."; }
          if (allRight) { complete(id); }
        });
      }
      if (reset) {
        reset.addEventListener("click", function () {
          Array.prototype.forEach.call(ins, function (inp) { inp.value = ""; inp.classList.remove("is-ok", "is-no"); });
          if (fb) { fb.textContent = ""; }
        });
      }
    });
  }

  function registerChallenges() {
    bindQuiz();
    bindCloze();
    bindFillins();
    renderMeter();
  }

  /* ---------- injected CSS (self-contained, palette-aware) ---------- */
  function injectCSS() {
    if (document.getElementById("elp-styles")) { return; }
    var css =
".elp-head{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}" +
".elp-count{font-weight:900;color:var(--text,#e8fff7);white-space:nowrap}" +
".elp-count-big{font-size:1.5rem;color:var(--accent-2,#34e7c4)}" +
".elp-count-total{font-size:1rem;color:var(--muted,#9fc7bb)}" +
".elp-bar{flex:1;min-width:160px;height:14px;border-radius:999px;background:var(--surface-2,rgba(0,230,179,.08));border:1px solid var(--border-accent,rgba(0,230,179,.28));overflow:hidden}" +
".elp-bar-fill{height:100%;border-radius:999px;background:linear-gradient(135deg,#00c79a,#00705a);transition:width .4s ease}" +
".elp-off{margin:.7rem 0 0;font-weight:800;color:var(--warm,#ff9d6e)}" +
".elp-mini-grid{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;margin-top:.8rem}" +
".elp-mini{width:2rem;height:2rem;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:1.35rem;line-height:1;border:1px solid var(--border-soft,rgba(255,255,255,.12));background:var(--card,#0c241d)}" +
".elp-mini.is-unlocked{border-color:var(--border-strong,rgba(0,230,179,.45));background:linear-gradient(135deg,rgba(0,230,179,.14),rgba(0,230,179,.03)),var(--card,#0c241d)}" +
".elp-mini.is-locked{filter:grayscale(1);opacity:.4}" +
".elp-mini-sep{width:1px;height:1.6rem;background:var(--border,rgba(255,255,255,.18));margin:0 .15rem}" +
".elp-guide-btn{margin-top:.9rem;display:inline-flex;align-items:center;gap:.4rem;min-height:44px;padding:.55rem 1rem;border-radius:10px;border:1px solid var(--border-accent,rgba(0,230,179,.28));background:var(--card,#0c241d);color:var(--text,#e8fff7);font-family:var(--font-stack,sans-serif);font-weight:900;font-size:.95rem;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}" +
".elp-guide-btn:hover,.elp-guide-btn:focus-visible{border-color:var(--accent,#00e6b3)}" +
".elp-counter{position:fixed;right:calc(12px + env(safe-area-inset-right));bottom:calc(12px + env(safe-area-inset-bottom));z-index:1000;display:inline-flex;align-items:center;gap:.35rem;min-height:40px;padding:.4rem .7rem;border-radius:999px;border:1px solid var(--border-strong,rgba(0,230,179,.45));background:var(--card,#0c241d);color:var(--text,#e8fff7);font-family:var(--font-stack,sans-serif);font-weight:900;font-size:.9rem;box-shadow:var(--shadow-soft,0 10px 22px rgba(0,0,0,.3));cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}" +
".elp-counter:hover,.elp-counter:focus-visible{border-color:var(--accent,#00e6b3)}" +
".elp-counter-num{color:var(--accent-2,#34e7c4)}" +
".elp-counter-ch{color:var(--muted,#9fc7bb)}" +
".elp-meter{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin:0 0 1rem;padding:.5rem .75rem;border:1px solid var(--border-accent,rgba(0,230,179,.28));border-radius:12px;background:var(--surface-2,rgba(0,230,179,.08));font-family:var(--font-stack,sans-serif)}" +
".elp-meter-lab{font-weight:900;color:var(--text,#e8fff7);font-size:.85rem}" +
".elp-meter-bar{flex:1;min-width:120px;height:10px;border-radius:999px;background:var(--card,#0c241d);border:1px solid var(--border-accent,rgba(0,230,179,.28));overflow:hidden}" +
".elp-meter-bar>span{display:block;height:100%;border-radius:999px;background:linear-gradient(135deg,#00c79a,#00705a)}" +
".elp-meter-num{font-weight:900;color:var(--accent-2,#34e7c4)}" +
".elp-cloze{border:1px solid var(--border-accent,rgba(0,230,179,.28));border-left:5px solid var(--accent,#00e6b3);border-radius:12px;background:var(--surface-2,rgba(0,230,179,.08));padding:.75rem .9rem;margin:.9rem 0}" +
".elp-cloze .cl-text{font-weight:800;color:var(--text,#e8fff7);line-height:2.1;margin:0 0 .5rem}" +
".cl-sel,.gap-in{min-height:40px;border-radius:8px;border:1px solid var(--border,rgba(255,255,255,.18));background:var(--card,#0c241d);color:var(--text,#e8fff7);font-family:inherit;font-weight:800;font-size:.95rem;padding:.2rem .45rem;vertical-align:middle}" +
".gap-in{width:5.5rem;text-align:center}" +
".cl-sel:focus-visible,.gap-in:focus-visible{outline:2px solid var(--accent,#00e6b3);outline-offset:2px}" +
".cl-sel.is-ok,.gap-in.is-ok{border-color:#15803d;color:#15803d}" +
".cl-sel.is-no,.gap-in.is-no{border-color:var(--warm,#c2410c)}" +
"@media (prefers-color-scheme:dark){.cl-sel.is-ok,.gap-in.is-ok{border-color:#5dd693;color:#5dd693}}" +
".fb-line{font-weight:900;margin:.35rem 0 0;min-height:1.2em;color:var(--accent-2,#34e7c4)}" +
".elp-subhead{margin:1.1rem 0 .2rem}" +
".elp-subhead h3{margin:0;font-size:1.02rem;font-weight:900;color:var(--text,#e8fff7);font-family:var(--font-stack,sans-serif)}" +
".elp-subhead p{margin:.1rem 0 0;color:var(--muted,#9fc7bb);font-weight:800;font-size:.92rem;line-height:1.45}" +
".elp-grid{display:grid;gap:.7rem;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));margin-top:.7rem}" +
".elp-badge{display:flex;align-items:center;gap:.7rem;padding:.7rem .8rem;min-height:64px;border-radius:14px;border:1px solid var(--border-soft,rgba(255,255,255,.12));background:var(--card,#0c241d);text-decoration:none;color:var(--text,#e8fff7);-webkit-tap-highlight-color:transparent;touch-action:manipulation}" +
"a.elp-badge{transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease}" +
"a.elp-badge:hover,a.elp-badge:focus-visible{transform:translateY(-1px);border-color:var(--border-strong,rgba(0,230,179,.45));box-shadow:var(--shadow-soft,0 10px 22px rgba(0,0,0,.3))}" +
".elp-badge .elp-emoji{font-size:1.7rem;line-height:1;flex-shrink:0;width:2.2rem;text-align:center}" +
".elp-badge .elp-text{display:flex;flex-direction:column;gap:.15rem;min-width:0}" +
".elp-badge .elp-name{font-weight:900;line-height:1.2}" +
".elp-badge .elp-meta{font-weight:800;font-size:.82rem;line-height:1.35}" +
".elp-badge.is-unlocked{border-color:var(--border-strong,rgba(0,230,179,.45));background:linear-gradient(135deg,rgba(0,230,179,.10),rgba(0,230,179,.02)),var(--card,#0c241d)}" +
".elp-badge.is-unlocked .elp-earned{color:var(--accent-2,#34e7c4)}" +
".elp-badge.is-locked{border-style:dashed;opacity:.82}" +
".elp-badge.is-locked .elp-emoji{opacity:.6}" +
".elp-badge.is-locked .elp-name{color:var(--muted,#9fc7bb)}" +
".elp-badge.is-locked .elp-cond{color:var(--muted,#9fc7bb)}" +
".elp-reset-wrap{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;margin-top:1.1rem}" +
".elp-reset{min-height:44px;padding:.5rem .95rem;border-radius:999px;border:1px solid var(--border-accent,rgba(0,230,179,.28));background:var(--card,#0c241d);color:var(--muted,#9fc7bb);font-family:var(--font-stack,sans-serif);font-weight:900;font-size:.92rem;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}" +
".elp-reset:hover,.elp-reset:focus-visible{border-color:var(--border-strong,rgba(0,230,179,.45));color:var(--text,#e8fff7)}" +
".elp-reset.is-armed{background:var(--warm,#c2410c);border-color:transparent;color:#fff}" +
".elp-reset-status{font-weight:800;color:var(--muted,#9fc7bb)}" +
".elp-chip{margin-left:auto;flex-shrink:0;align-self:flex-start;display:inline-flex;align-items:center;gap:.25rem;padding:2px 9px;border-radius:999px;font-weight:900;font-size:.78rem;color:#fff;background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.35)}" +
".elp-chip.is-done{background:rgba(255,255,255,.92);color:#04241d;border-color:transparent}" +
".elp-dialog-overlay{position:fixed;inset:0;z-index:1200;background:rgba(0,0,0,.55);display:flex;align-items:flex-start;justify-content:center;padding:5vh 12px;overflow:auto}" +
".elp-dialog-overlay[hidden]{display:none}" +
".elp-dialog{width:100%;max-width:640px;background:var(--card,#0c241d);border:1px solid var(--border-strong,rgba(0,230,179,.45));border-radius:16px;box-shadow:var(--shadow,0 18px 40px rgba(0,0,0,.5));padding:1rem 1.1rem 1.2rem}" +
".elp-dialog-head{display:flex;align-items:center;gap:.6rem;margin-bottom:.2rem}" +
".elp-dialog-head h2{margin:0;font-size:1.2rem;font-weight:900;color:var(--text,#e8fff7);font-family:var(--font-stack,sans-serif)}" +
".elp-dialog-close{margin-left:auto;min-width:44px;min-height:44px;border-radius:10px;border:1px solid var(--border,rgba(255,255,255,.18));background:var(--surface-2,rgba(0,230,179,.08));color:var(--text,#e8fff7);font-weight:900;font-size:1.05rem;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}" +
".elp-dialog-close:hover,.elp-dialog-close:focus-visible{border-color:var(--accent,#00e6b3)}" +
"body.elp-dialog-open{overflow:hidden}" +
".elp-toast-region{position:fixed;left:50%;bottom:calc(70px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:1300;display:flex;flex-direction:column;gap:.5rem;width:max-content;max-width:min(92vw,380px);pointer-events:none}" +
".elp-toast{display:flex;align-items:center;gap:.6rem;padding:.7rem .9rem;border-radius:14px;background:var(--card,#0c241d);border:1px solid var(--border-strong,rgba(0,230,179,.45));box-shadow:var(--shadow,0 18px 40px rgba(0,0,0,.5));color:var(--text,#e8fff7);font-weight:800;opacity:0;transform:translateY(10px);transition:opacity .35s ease,transform .35s ease}" +
".elp-toast.is-in{opacity:1;transform:translateY(0)}" +
".elp-toast-emoji{font-size:1.5rem;line-height:1}" +
".elp-toast-text strong{font-weight:900;color:var(--accent-2,#34e7c4)}" +
"@media (prefers-reduced-motion:reduce){.elp-bar-fill,.elp-toast,a.elp-badge{transition:none!important}}" +
"@media print{.elp-counter,.elp-dialog-overlay{display:none!important}}";
    var style = document.createElement("style");
    style.id = "elp-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------- accessible unlock toast ---------- */
  var toastRegion = null;
  function ensureToastRegion() {
    if (toastRegion) { return toastRegion; }
    toastRegion = document.createElement("div");
    toastRegion.className = "elp-toast-region";
    toastRegion.setAttribute("aria-live", "polite");
    toastRegion.setAttribute("aria-atomic", "false");
    document.body.appendChild(toastRegion);
    return toastRegion;
  }
  function toast(def) {
    if (!def) { return; }
    var region = ensureToastRegion();
    var el = document.createElement("div");
    el.className = "elp-toast";
    el.setAttribute("role", "status");
    el.innerHTML =
      '<span class="elp-toast-emoji" aria-hidden="true">' + def.emoji + "</span>" +
      '<span class="elp-toast-text"><strong>Badge unlocked!</strong> </span>';
    el.querySelector(".elp-toast-text").appendChild(document.createTextNode(def.name));
    region.appendChild(el);
    void el.offsetWidth;
    el.classList.add("is-in");
    window.setTimeout(function () {
      el.classList.remove("is-in");
      window.setTimeout(function () {
        if (el.parentNode) { el.parentNode.removeChild(el); }
      }, 400);
    }, 4200);
  }

  /* ---------- detailed badge card (used in the dialog) ---------- */
  function badgeCard(def, state, isAch) {
    var unlocked = !!(state && state.unlocked);
    var asLink = !isAch && !!def.href;
    var card = document.createElement(asLink ? "a" : "div");
    card.className = "elp-badge" + (unlocked ? " is-unlocked" : " is-locked");
    if (asLink) { card.setAttribute("href", def.href); }

    var status = unlocked
      ? "earned" + (state && state.at ? " on " + state.at : "")
      : "locked — " + def.cond;
    card.setAttribute("aria-label", def.name + ": " + status);

    var emoji = '<span class="elp-emoji" aria-hidden="true">' +
      (unlocked ? def.emoji : "🔒") + "</span>";
    var name = '<span class="elp-name">' + def.name + "</span>";
    var meta = unlocked
      ? '<span class="elp-meta elp-earned">Earned' +
        (state && state.at ? " · " + state.at : "") + "</span>"
      : '<span class="elp-meta elp-cond">' + def.cond + "</span>";

    card.innerHTML = emoji + '<span class="elp-text">' + name + meta + "</span>";
    return card;
  }

  function sectionTitle(title, sub) {
    var wrap = document.createElement("div");
    wrap.className = "elp-subhead";
    wrap.innerHTML = "<h3>" + title + "</h3><p>" + sub + "</p>";
    return wrap;
  }

  /* small greyed/earned icon for the compact hub strip */
  function miniIcon(def, state) {
    var unlocked = !!(state && state.unlocked);
    var span = document.createElement("span");
    span.className = "elp-mini" + (unlocked ? " is-unlocked" : " is-locked");
    span.textContent = def.emoji;
    var label = def.name + ": " + (unlocked ? "earned" : "locked");
    span.setAttribute("role", "img");
    span.setAttribute("title", label);
    span.setAttribute("aria-label", label);
    return span;
  }

  /* ---------- compact hub strip ---------- */
  function renderHub(container) {
    if (!container) { return; }
    var c = counts();
    container.innerHTML = "";

    var head = document.createElement("div");
    head.className = "elp-head";
    head.innerHTML =
      '<div class="elp-count"><span class="elp-count-big">' + c.earned +
      '</span><span class="elp-count-total"> / ' + c.total + " badges</span></div>" +
      '<div class="elp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + c.total +
      '" aria-valuenow="' + c.earned + '" aria-label="Badges earned">' +
      '<div class="elp-bar-fill" style="width:' + c.pct + '%"></div></div>';
    container.appendChild(head);

    if (c.data.off) {
      var off = document.createElement("p");
      off.className = "elp-off";
      off.textContent = "Progress saving is off in this browser, so badges won't be remembered here.";
      container.appendChild(off);
    }

    var strip = document.createElement("div");
    strip.className = "elp-mini-grid";
    c.data.topic.forEach(function (b) { strip.appendChild(miniIcon(b.def, b.state)); });
    var sep = document.createElement("span");
    sep.className = "elp-mini-sep"; sep.setAttribute("aria-hidden", "true");
    strip.appendChild(sep);
    c.data.achievements.forEach(function (b) { strip.appendChild(miniIcon(b.def, b.state)); });
    container.appendChild(strip);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "elp-guide-btn";
    btn.innerHTML = '<span aria-hidden="true">🔎</span> View badges &amp; how to earn them';
    btn.addEventListener("click", openDetails);
    container.appendChild(btn);
  }

  function resetControl() {
    var wrap = document.createElement("div");
    wrap.className = "elp-reset-wrap";
    var status = document.createElement("span");
    status.className = "elp-reset-status";
    status.setAttribute("aria-live", "polite");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "elp-reset";
    btn.textContent = "Reset my progress";

    var armed = false, timer = null;
    btn.addEventListener("click", function () {
      if (!armed) {
        armed = true;
        btn.classList.add("is-armed");
        btn.textContent = "Tap again to confirm";
        timer = window.setTimeout(function () {
          armed = false; btn.classList.remove("is-armed");
          btn.textContent = "Reset my progress";
        }, 4000);
        return;
      }
      window.clearTimeout(timer);
      armed = false;
      btn.classList.remove("is-armed");
      btn.textContent = "Reset my progress";
      reset();
      refreshAll();
      status.textContent = "Progress cleared.";
    });

    wrap.appendChild(btn);
    wrap.appendChild(status);
    return wrap;
  }

  /* ---------- per-tile chips on the hub ---------- */
  function decorateTiles() {
    var data = all();
    var stateById = {};
    data.topic.forEach(function (b) { stateById[b.def.id] = b.state; });

    var tiles = document.querySelectorAll("[data-el-badges]");
    Array.prototype.forEach.call(tiles, function (tile) {
      var ids = (tile.getAttribute("data-el-badges") || "").split(/\s+/).filter(Boolean);
      if (!ids.length) { return; }
      var unlocked = ids.filter(function (id) {
        return stateById[id] && stateById[id].unlocked;
      }).length;
      var total = ids.length;

      var host = tile.querySelector(".tile-head") || tile;
      var chip = host.querySelector(".elp-chip");
      if (!chip) {
        chip = document.createElement("span");
        chip.className = "elp-chip";
        host.appendChild(chip);
      }
      var done = unlocked === total;
      chip.classList.toggle("is-done", done);
      chip.textContent = total === 1
        ? (done ? "🎖 ✓" : "🎖 0/1")
        : "🎖 " + unlocked + "/" + total;
      chip.setAttribute("aria-label",
        unlocked + " of " + total + (total === 1 ? " badge earned" : " badges earned"));
    });
  }

  /* ---------- corner badge counter (every page) ---------- */
  var counterEl = null;
  function renderCounter() {
    if (counterEl) { updateCounter(); return; }
    counterEl = document.createElement("button");
    counterEl.type = "button";
    counterEl.className = "elp-counter";
    counterEl.innerHTML = '<span aria-hidden="true">🎖</span><span class="elp-counter-num"></span><span class="elp-counter-ch"></span>';
    counterEl.addEventListener("click", openDetails);
    document.body.appendChild(counterEl);
    updateCounter();
  }
  function updateCounter() {
    if (!counterEl) { return; }
    var c = counts();
    var cs = challengeState();
    counterEl.querySelector(".elp-counter-num").textContent = c.earned + "/" + c.total;
    var chEl = counterEl.querySelector(".elp-counter-ch");
    chEl.textContent = cs.globalDone ? " · 📋 " + cs.globalDone : "";
    counterEl.setAttribute("aria-label",
      "Badges earned: " + c.earned + " of " + c.total +
      (cs.globalDone ? "; " + cs.globalDone + " challenges completed" : "") +
      ". Open the badge guide.");
  }

  /* ---------- badge-guide dialog ---------- */
  var overlayEl = null, dialogEl = null, lastFocus = null;
  function ensureDialog() {
    if (overlayEl) { return; }
    overlayEl = document.createElement("div");
    overlayEl.className = "elp-dialog-overlay";
    overlayEl.hidden = true;
    dialogEl = document.createElement("div");
    dialogEl.className = "elp-dialog";
    dialogEl.setAttribute("role", "dialog");
    dialogEl.setAttribute("aria-modal", "true");
    dialogEl.setAttribute("aria-labelledby", "elp-dialog-title");
    overlayEl.appendChild(dialogEl);
    overlayEl.addEventListener("click", function (e) {
      if (e.target === overlayEl) { closeDetails(); }
    });
    document.addEventListener("keydown", function (e) {
      if (!overlayEl || overlayEl.hidden) { return; }
      if (e.key === "Escape") { closeDetails(); }
      else if (e.key === "Tab") { trapTab(e); }
    });
    document.body.appendChild(overlayEl);
  }
  function focusables() {
    return Array.prototype.slice.call(
      dialogEl.querySelectorAll('a[href],button,[tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }
  function trapTab(e) {
    var f = focusables(); if (!f.length) { return; }
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function buildDialog() {
    var data = all();
    dialogEl.innerHTML = "";

    var head = document.createElement("div");
    head.className = "elp-dialog-head";
    head.innerHTML = '<h2 id="elp-dialog-title">🎖 Electronics badges</h2>';
    var close = document.createElement("button");
    close.type = "button";
    close.className = "elp-dialog-close";
    close.setAttribute("aria-label", "Close badge guide");
    close.innerHTML = "✕";
    close.addEventListener("click", closeDetails);
    head.appendChild(close);
    dialogEl.appendChild(head);

    if (data.off) {
      var off = document.createElement("p");
      off.className = "elp-off";
      off.textContent = "Progress saving is off in this browser, so badges won't be remembered here.";
      dialogEl.appendChild(off);
    }

    dialogEl.appendChild(sectionTitle("Topic badges",
      "Master each interactive to earn its badge — tap one to go to its page."));
    var tGrid = document.createElement("div");
    tGrid.className = "elp-grid";
    data.topic.forEach(function (b) { tGrid.appendChild(badgeCard(b.def, b.state, false)); });
    dialogEl.appendChild(tGrid);

    dialogEl.appendChild(sectionTitle("Achievement badges",
      "Extra rewards that unlock automatically as you go."));
    var aGrid = document.createElement("div");
    aGrid.className = "elp-grid";
    data.achievements.forEach(function (b) { aGrid.appendChild(badgeCard(b.def, b.state, true)); });
    dialogEl.appendChild(aGrid);

    dialogEl.appendChild(resetControl());
  }
  function openDetails() {
    ensureDialog();
    buildDialog();
    lastFocus = document.activeElement;
    overlayEl.hidden = false;
    document.body.classList.add("elp-dialog-open");
    var close = dialogEl.querySelector(".elp-dialog-close");
    if (close) { close.focus(); }
  }
  function closeDetails() {
    if (!overlayEl || overlayEl.hidden) { return; }
    overlayEl.hidden = true;
    document.body.classList.remove("elp-dialog-open");
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  /* keep every surface in sync after a change */
  function refreshAll() {
    updateCounter();
    renderMeter();
    var hub = document.getElementById("elProgressHub");
    if (hub) { renderHub(hub); }
    decorateTiles();
    if (overlayEl && !overlayEl.hidden) { buildDialog(); }
  }

  /* ---------- expose + auto-init ---------- */
  window.ElProgress = {
    registry: { topic: TOPIC, achievements: ACH },
    markSeen: markSeen,
    record: record,
    get: get,
    all: all,
    reset: reset,
    renderHub: renderHub,
    decorateTiles: decorateTiles,
    openDetails: openDetails,
    complete: complete,
    challengeDone: challengeDone,
    challengeState: challengeState,
    toast: toast
  };

  function init() {
    injectCSS();
    registerChallenges();
    var hub = document.getElementById("elProgressHub");
    if (hub) { renderHub(hub); }
    decorateTiles();
    renderCounter();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
