/* ============================================================
   Site-wide progress & badge engine (config-driven, subject-agnostic)

   ONE engine for every interactive subject. Subject knowledge —
   badge registry, storage namespace, palette (via :root tokens),
   rank ladder — lives in a per-subject config passed to
   Progress.init(cfg); this file holds zero hardcoded subject data.

   Loaded on a page after site-menu.js, followed by its config:
     <script src="/assets/js/progress.js" defer></script>
     <script src="/assets/js/progress/<ns>.js" defer></script>

   Storage: one key per subject, "progress-<ns>-v1" (schema v2),
   private-mode safe (try/catch). Public API on window.Progress —
   see §API at the foot of this file and progress-system-guide.md.

   Layers (all on by default, toggled in cfg.layers):
     badges          cross-page topic + achievement badge wall
     challenges      auto-bound cloze / fill-in / quiz section meter
     pointsStreak    points + streak gamification
     perPageBadges   per-page first / halfway / complete badges
     hubTotals       points + streak + badge count + "% explored"
     ranks           points -> named rank ladder (hub + counter)
   ============================================================ */
(function () {
  "use strict";

  var PREFIX = "progress-";
  var SCHEMA = 2;

  /* ---- config-derived state (assigned in init) ---- */
  var cfg = null, KEY = null;
  var TOPIC = [], ACH = [], TOPIC_BY_ID = {}, ACH_BY_ID = {};
  var ALL_TOPIC_IDS = [], CHALLENGE_PAGES = [];
  var THRESHOLD = 0.8, POINTS = { challenge: 10, badge: 25 };
  var RANKS = [], LAYERS = {}, HUB_TITLE = "🎖 Badges";

  /* ---------- small helpers ---------- */
  function extend(base, over) {
    var out = {}, k;
    for (k in base) { if (base.hasOwnProperty(k)) { out[k] = base[k]; } }
    if (over) { for (k in over) { if (over.hasOwnProperty(k)) { out[k] = over[k]; } } }
    return out;
  }
  function index(arr) {
    var m = {}; arr.forEach(function (d) { m[d.id] = d; }); return m;
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function normPath(p) {
    try { p = decodeURIComponent(p); } catch (e) {}
    return p.replace(/\/+$/, "") || p;
  }
  function pageKey() { return normPath(window.location.pathname); }
  function allUnlocked(b, ids) {
    return ids.every(function (id) { return b[id] && b[id].unlocked; });
  }

  /* whichever challenge-id attribute a wrapper carries (new + legacy) */
  function chId(el) {
    return el.getAttribute("data-prog-challenge") ||
      el.getAttribute("data-el-challenge") ||
      el.getAttribute("data-challenge") || "";
  }
  function challengeEls() {
    var nodes = document.querySelectorAll(
      "[data-prog-challenge],[data-el-challenge],[data-challenge]");
    return Array.prototype.filter.call(nodes, function (el) { return !!chId(el); });
  }
  function hubEl() {
    return document.getElementById("progressHub") ||
      document.getElementById("elProgressHub");
  }

  /* ---------- storage (private-mode safe, v2 + migration) ---------- */
  function blank() {
    return { v: SCHEMA, badges: {}, challenges: {}, pageDone: {},
      points: 0, streak: 0, bestStreak: 0 };
  }
  function normalize(d) {
    if (!d.challenges) { d.challenges = {}; }
    if (!d.pageDone) { d.pageDone = {}; }
    if (typeof d.points !== "number") { d.points = 0; }
    if (typeof d.streak !== "number") { d.streak = 0; }
    if (typeof d.bestStreak !== "number") { d.bestStreak = 0; }
    d.v = SCHEMA;
    return d;
  }
  function load() {
    var raw;
    try { raw = window.localStorage.getItem(KEY); }
    catch (e) { var b = blank(); b.off = true; return b; }
    if (!raw) {
      var migrated = tryMigrate();
      return migrated || blank();
    }
    try {
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object" || !data.badges) { return blank(); }
      return normalize(data);
    } catch (e) { return blank(); }
  }
  function save(data) {
    try { window.localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (e) { return false; }
  }
  function storageAvailable() {
    try {
      var k = "__prog_test__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  }
  /* one-way, lossless: copy an old key -> the new key once, only if the new
     key is empty. The old key is left intact and ignored thereafter. */
  function tryMigrate() {
    if (!cfg || !cfg.migrateFrom) { return null; }
    var old;
    try { old = window.localStorage.getItem(cfg.migrateFrom); }
    catch (e) { return null; }
    if (!old) { return null; }
    try {
      var src = JSON.parse(old);
      if (!src || typeof src !== "object" || !src.badges) { return null; }
      var data = normalize({
        badges: src.badges || {},
        challenges: src.challenges || {},
        pageDone: src.pageDone || {},
        points: src.points, streak: src.streak, bestStreak: src.bestStreak
      });
      save(data);
      return data;
    } catch (e) { return null; }
  }

  /* recompute achievement badges from current state (idempotent, derived) */
  function recomputeAchievements(data) {
    var badges = data.badges, newly = [];
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

  /* ---------- public API: badges ---------- */
  function markSeen(id) {
    if (!TOPIC_BY_ID[id]) { return; }
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

    var thr = typeof def.thr === "number" ? def.thr : THRESHOLD;
    var nowUnlocked = wasUnlocked || (s.best / s.max >= thr);
    if (nowUnlocked) {
      s.unlocked = true;
      if (!s.at) { s.at = today(); }
    }
    var justUnlocked = !wasUnlocked && !!s.unlocked;
    if (justUnlocked && LAYERS.pointsStreak) { data.points += POINTS.badge; }

    var newAch = recomputeAchievements(data);
    save(data);
    refreshAll();
    if (justUnlocked) { toast(def); }
    newAch.forEach(function (a) { toast(a); });

    return {
      unlocked: !!s.unlocked,
      justUnlocked: justUnlocked,
      best: s.best, max: s.max,
      newAchievements: newAch
    };
  }

  function get(id) { return load().badges[id] || null; }

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

  /* ---------- public API: points / streak / ranks ---------- */
  function addPoints(n, opts) {
    if (!LAYERS.pointsStreak) { return; }
    opts = opts || {};
    var data = load();
    data.points += Math.max(0, Number(n) || 0);
    if (opts.streak) {
      data.streak += 1;
      if (data.streak > data.bestStreak) { data.bestStreak = data.streak; }
    }
    if (opts.miss) { data.streak = 0; }
    save(data);
    refreshAll();
  }
  /* a wrong attempt breaks the streak (no-op if already 0) */
  function miss() {
    if (!LAYERS.pointsStreak) { return; }
    var data = load();
    if (data.streak === 0) { return; }
    data.streak = 0;
    save(data);
    refreshAll();
  }
  function rank() {
    var pts = load().points || 0;
    var name = "", at = 0, next = null;
    for (var i = 0; i < RANKS.length; i++) {
      if (pts >= RANKS[i].at) { name = RANKS[i].name; at = RANKS[i].at; }
      else { next = RANKS[i]; break; }
    }
    if (!name && RANKS.length) { name = RANKS[0].name; at = RANKS[0].at; }
    return { name: name, points: pts, at: at,
      next: next ? { name: next.name, at: next.at } : null };
  }

  /* ---------- aggregate snapshot ---------- */
  function snapshot() {
    var data = load();
    var topic = TOPIC.map(function (d) { return { def: d, state: data.badges[d.id] || null }; });
    var ach = ACH.map(function (d) { return { def: d, state: data.badges[d.id] || null }; });
    var topicU = topic.filter(function (b) { return b.state && b.state.unlocked; }).length;
    var achU = ach.filter(function (b) { return b.state && b.state.unlocked; }).length;
    var seen = topic.filter(function (b) { return b.state && b.state.seen; }).length;
    var total = topic.length + ach.length, earned = topicU + achU;
    return {
      data: data, topic: topic, ach: ach,
      off: !!data.off || !storageAvailable(),
      earned: earned, total: total,
      pct: total ? Math.round(earned / total * 100) : 0,
      explored: topic.length ? Math.round(seen / topic.length * 100) : 0,
      points: data.points || 0, streak: data.streak || 0, bestStreak: data.bestStreak || 0
    };
  }

  /* ---------- section challenges ---------- */
  function syncPageDone(data) {
    var els = challengeEls();
    if (!els.length) { return; }
    var pk = pageKey(), done = 0;
    els.forEach(function (el) {
      if (data.challenges[pk + "::" + chId(el)]) { done++; }
    });
    if (done >= els.length) { data.pageDone[pk] = true; }
  }
  function complete(id) {
    if (!id) { return; }
    var data = load();
    var k = pageKey() + "::" + id;
    if (data.challenges[k]) { return; }        /* idempotent, counts once */
    data.challenges[k] = true;
    if (LAYERS.pointsStreak) {
      data.points += POINTS.challenge;
      data.streak += 1;
      if (data.streak > data.bestStreak) { data.bestStreak = data.streak; }
    }
    syncPageDone(data);
    recomputeAchievements(data);
    save(data);
    refreshAll();
  }
  function challengeDone(id) {
    return !!load().challenges[pageKey() + "::" + id];
  }
  function challengeState() {
    var data = load(), els = challengeEls(), pk = pageKey(), done = 0;
    els.forEach(function (el) {
      if (data.challenges[pk + "::" + chId(el)]) { done++; }
    });
    return { page: { done: done, total: els.length },
      globalDone: Object.keys(data.challenges).length };
  }
  /* derived per-page badges (not persisted; read from challenge state) */
  function pageBadges() {
    var cs = challengeState();
    if (!cs.page.total) { return []; }
    var done = cs.page.done, total = cs.page.total;
    return [
      { id: "page-first", emoji: "🌱", name: "Getting started", earned: done >= 1 },
      { id: "page-half", emoji: "📈", name: "Halfway", earned: done >= Math.ceil(total / 2) },
      { id: "page-all", emoji: "✅", name: "Page complete", earned: done >= total }
    ];
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

  /* ---------- challenge binding (new .prog-* + legacy .elp-*) ---------- */
  function bound(el) {
    if (el.getAttribute("data-prog-bound")) { return true; }
    el.setAttribute("data-prog-bound", "1");
    return false;
  }
  function bindQuiz() {
    var quiz = document.getElementById("quiz");
    if (!quiz || bound(quiz)) { return; }
    if (!chId(quiz)) { quiz.setAttribute("data-prog-challenge", "quiz"); }
    var mark = document.getElementById("quiz-mark");
    var scoreEl = document.getElementById("quiz-score");
    if (!mark || !scoreEl) { return; }
    mark.addEventListener("click", function () {
      var m = /(-?\d+)\s*\/\s*(\d+)/.exec(scoreEl.textContent || "");
      if (m) { var s = +m[1], t = +m[2]; if (t > 0 && s / t >= 0.7) { complete(chId(quiz)); } }
    });
  }
  function bindCloze() {
    Array.prototype.forEach.call(
      document.querySelectorAll(".prog-cloze,.elp-cloze"), function (box) {
        if (bound(box)) { return; }
        var id = chId(box);
        var sels = box.querySelectorAll(".cl-sel");
        var check = box.querySelector(".cl-check");
        var rst = box.querySelector(".cl-reset");
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
            else if (!challengeDone(id)) { miss(); }
          });
        }
        if (rst) {
          rst.addEventListener("click", function () {
            Array.prototype.forEach.call(sels, function (s) { s.value = ""; s.classList.remove("is-ok", "is-no"); });
            if (fb) { fb.textContent = ""; }
          });
        }
      });
  }
  function bindFillins() {
    Array.prototype.forEach.call(
      document.querySelectorAll(".prog-fillin,.elp-fillin"), function (box) {
        if (bound(box)) { return; }
        var id = chId(box);
        var ins = box.querySelectorAll(".gap-in");
        var check = box.querySelector(".gp-check");
        var rst = box.querySelector(".gp-reset");
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
            else if (!challengeDone(id)) { miss(); }
          });
        }
        if (rst) {
          rst.addEventListener("click", function () {
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

  /* ---------- injected CSS (token-driven, themes to any subject) ---------- */
  function injectCSS() {
    if (document.getElementById("prog-styles")) { return; }
    var css =
".prog-head{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}" +
".prog-count{font-weight:900;color:var(--text,#e8fff7);white-space:nowrap}" +
".prog-count-big{font-size:1.5rem;color:var(--accent-2,#34e7c4)}" +
".prog-count-total{font-size:1rem;color:var(--muted,#9fc7bb)}" +
".prog-bar{flex:1;min-width:160px;height:14px;border-radius:999px;background:var(--surface-2,rgba(0,230,179,.08));border:1px solid var(--border-accent,rgba(0,230,179,.28));overflow:hidden}" +
".prog-bar-fill{height:100%;border-radius:999px;background:linear-gradient(135deg,var(--accent,#00c79a),var(--accent-2,#00705a));transition:width .4s ease}" +
".prog-off{margin:.7rem 0 0;font-weight:800;color:var(--warm,#ff9d6e)}" +
".prog-totals{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.8rem}" +
".prog-stat{display:inline-flex;align-items:center;gap:.35rem;padding:.35rem .7rem;border-radius:999px;border:1px solid var(--border-accent,rgba(0,230,179,.28));background:var(--surface-2,rgba(0,230,179,.08));font-weight:900;font-size:.9rem;color:var(--text,#e8fff7)}" +
".prog-stat .prog-stat-v{color:var(--accent-2,#34e7c4)}" +
".prog-stat.prog-rank{border-color:var(--border-strong,rgba(0,230,179,.45))}" +
".prog-rank-next{font-weight:800;font-size:.82rem;color:var(--muted,#9fc7bb);margin-top:.4rem}" +
".prog-mini-grid{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;margin-top:.8rem}" +
".prog-mini{width:2rem;height:2rem;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:1.35rem;line-height:1;border:1px solid var(--border-soft,rgba(255,255,255,.12));background:var(--card,#0c241d)}" +
".prog-mini.is-unlocked{border-color:var(--border-strong,rgba(0,230,179,.45));background:linear-gradient(135deg,rgba(0,230,179,.14),rgba(0,230,179,.03)),var(--card,#0c241d)}" +
".prog-mini.is-locked{filter:grayscale(1);opacity:.4}" +
".prog-mini-sep{width:1px;height:1.6rem;background:var(--border,rgba(255,255,255,.18));margin:0 .15rem}" +
".prog-guide-btn{margin-top:.9rem;display:inline-flex;align-items:center;gap:.4rem;min-height:44px;padding:.55rem 1rem;border-radius:10px;border:1px solid var(--border-accent,rgba(0,230,179,.28));background:var(--card,#0c241d);color:var(--text,#e8fff7);font-family:var(--font-stack,sans-serif);font-weight:900;font-size:.95rem;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}" +
".prog-guide-btn:hover,.prog-guide-btn:focus-visible{border-color:var(--accent,#00e6b3)}" +
".prog-counter{position:fixed;right:calc(12px + env(safe-area-inset-right));bottom:calc(12px + env(safe-area-inset-bottom));z-index:1000;display:inline-flex;align-items:center;gap:.35rem;min-height:40px;padding:.4rem .7rem;border-radius:999px;border:1px solid var(--border-strong,rgba(0,230,179,.45));background:var(--card,#0c241d);color:var(--text,#e8fff7);font-family:var(--font-stack,sans-serif);font-weight:900;font-size:.9rem;box-shadow:var(--shadow-soft,0 10px 22px rgba(0,0,0,.3));cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}" +
".prog-counter:hover,.prog-counter:focus-visible{border-color:var(--accent,#00e6b3)}" +
".prog-counter-num{color:var(--accent-2,#34e7c4)}" +
".prog-counter-rank{color:var(--muted,#9fc7bb);font-size:.8rem}" +
".prog-counter-ch{color:var(--muted,#9fc7bb)}" +
".prog-meter{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin:0 0 1rem;padding:.5rem .75rem;border:1px solid var(--border-accent,rgba(0,230,179,.28));border-radius:12px;background:var(--surface-2,rgba(0,230,179,.08));font-family:var(--font-stack,sans-serif)}" +
".prog-meter-lab{font-weight:900;color:var(--text,#e8fff7);font-size:.85rem}" +
".prog-meter-bar{flex:1;min-width:120px;height:10px;border-radius:999px;background:var(--card,#0c241d);border:1px solid var(--border-accent,rgba(0,230,179,.28));overflow:hidden}" +
".prog-meter-bar>span{display:block;height:100%;border-radius:999px;background:linear-gradient(135deg,var(--accent,#00c79a),var(--accent-2,#00705a))}" +
".prog-meter-num{font-weight:900;color:var(--accent-2,#34e7c4)}" +
".prog-pagebadges{display:inline-flex;gap:.3rem;margin-left:.2rem}" +
".prog-pb{font-size:1.05rem;line-height:1}" +
".prog-pb.is-locked{filter:grayscale(1);opacity:.4}" +
".prog-cloze,.elp-cloze{border:1px solid var(--border-accent,rgba(0,230,179,.28));border-left:5px solid var(--accent,#00e6b3);border-radius:12px;background:var(--surface-2,rgba(0,230,179,.08));padding:.75rem .9rem;margin:.9rem 0}" +
".prog-cloze .cl-text,.elp-cloze .cl-text{font-weight:800;color:var(--text,#e8fff7);line-height:2.1;margin:0 0 .5rem}" +
".cl-sel,.gap-in{min-height:40px;border-radius:8px;border:1px solid var(--border,rgba(255,255,255,.18));background:var(--card,#0c241d);color:var(--text,#e8fff7);font-family:inherit;font-weight:800;font-size:.95rem;padding:.2rem .45rem;vertical-align:middle}" +
".gap-in{width:5.5rem;text-align:center}" +
".cl-sel:focus-visible,.gap-in:focus-visible{outline:2px solid var(--accent,#00e6b3);outline-offset:2px}" +
".cl-sel.is-ok,.gap-in.is-ok{border-color:#15803d;color:#15803d}" +
".cl-sel.is-no,.gap-in.is-no{border-color:var(--warm,#c2410c)}" +
"@media (prefers-color-scheme:dark){.cl-sel.is-ok,.gap-in.is-ok{border-color:#5dd693;color:#5dd693}}" +
".fb-line{font-weight:900;margin:.35rem 0 0;min-height:1.2em;color:var(--accent-2,#34e7c4)}" +
".prog-subhead{margin:1.1rem 0 .2rem}" +
".prog-subhead h3{margin:0;font-size:1.02rem;font-weight:900;color:var(--text,#e8fff7);font-family:var(--font-stack,sans-serif)}" +
".prog-subhead p{margin:.1rem 0 0;color:var(--muted,#9fc7bb);font-weight:800;font-size:.92rem;line-height:1.45}" +
".prog-grid{display:grid;gap:.7rem;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));margin-top:.7rem}" +
".prog-how{margin:.6rem 0 0;padding:0;list-style:none;display:grid;gap:.55rem}" +
".prog-how li{display:flex;gap:.55rem;align-items:flex-start;color:var(--text,#e8fff7);font-weight:800;font-size:.92rem;line-height:1.45}" +
".prog-how li b{color:var(--accent-2,#34e7c4);font-weight:900}" +
".prog-how .pi{flex-shrink:0;font-size:1.05rem;line-height:1.35}" +
".prog-ladder{margin:.6rem 0 0;padding:0;list-style:none;display:grid;gap:.32rem}" +
".prog-ladder li{display:flex;align-items:center;gap:.5rem;padding:.42rem .65rem;border-radius:10px;border:1px solid var(--border-soft,rgba(255,255,255,.12));background:var(--surface-2,rgba(0,230,179,.06));color:var(--muted,#9fc7bb);font-weight:800;font-size:.9rem}" +
".prog-ladder li .lr-name{font-weight:900;color:var(--text,#e8fff7)}" +
".prog-ladder li .lr-at{margin-left:auto;font-variant-numeric:tabular-nums;white-space:nowrap}" +
".prog-ladder li.is-current{border-color:var(--border-strong,rgba(0,230,179,.45));background:linear-gradient(135deg,rgba(0,230,179,.12),rgba(0,230,179,.02)),var(--card,#0c241d)}" +
".prog-ladder li .lr-you{color:var(--accent-2,#34e7c4);font-weight:900}" +
".prog-badge{display:flex;align-items:center;gap:.7rem;padding:.7rem .8rem;min-height:64px;border-radius:14px;border:1px solid var(--border-soft,rgba(255,255,255,.12));background:var(--card,#0c241d);text-decoration:none;color:var(--text,#e8fff7);-webkit-tap-highlight-color:transparent;touch-action:manipulation}" +
"a.prog-badge{transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease}" +
"a.prog-badge:hover,a.prog-badge:focus-visible{transform:translateY(-1px);border-color:var(--border-strong,rgba(0,230,179,.45));box-shadow:var(--shadow-soft,0 10px 22px rgba(0,0,0,.3))}" +
".prog-badge .prog-emoji{font-size:1.7rem;line-height:1;flex-shrink:0;width:2.2rem;text-align:center}" +
".prog-badge .prog-text{display:flex;flex-direction:column;gap:.15rem;min-width:0}" +
".prog-badge .prog-name{font-weight:900;line-height:1.2}" +
".prog-badge .prog-meta{font-weight:800;font-size:.82rem;line-height:1.35}" +
".prog-badge.is-unlocked{border-color:var(--border-strong,rgba(0,230,179,.45));background:linear-gradient(135deg,rgba(0,230,179,.10),rgba(0,230,179,.02)),var(--card,#0c241d)}" +
".prog-badge.is-unlocked .prog-earned{color:var(--accent-2,#34e7c4)}" +
".prog-badge.is-locked{border-style:dashed;opacity:.82}" +
".prog-badge.is-locked .prog-emoji{opacity:.6}" +
".prog-badge.is-locked .prog-name{color:var(--muted,#9fc7bb)}" +
".prog-badge.is-locked .prog-cond{color:var(--muted,#9fc7bb)}" +
".prog-reset-wrap{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;margin-top:1.1rem}" +
".prog-reset{min-height:44px;padding:.5rem .95rem;border-radius:999px;border:1px solid var(--border-accent,rgba(0,230,179,.28));background:var(--card,#0c241d);color:var(--muted,#9fc7bb);font-family:var(--font-stack,sans-serif);font-weight:900;font-size:.92rem;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}" +
".prog-reset:hover,.prog-reset:focus-visible{border-color:var(--border-strong,rgba(0,230,179,.45));color:var(--text,#e8fff7)}" +
".prog-reset.is-armed{background:var(--warm,#c2410c);border-color:transparent;color:#fff}" +
".prog-reset-status{font-weight:800;color:var(--muted,#9fc7bb)}" +
".prog-chip{margin-left:auto;flex-shrink:0;align-self:flex-start;display:inline-flex;align-items:center;gap:.25rem;padding:2px 9px;border-radius:999px;font-weight:900;font-size:.78rem;color:#fff;background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.35)}" +
".prog-chip.is-done{background:rgba(255,255,255,.92);color:#04241d;border-color:transparent}" +
".prog-dialog-overlay{position:fixed;inset:0;z-index:1200;background:rgba(0,0,0,.55);display:flex;align-items:flex-start;justify-content:center;padding:5vh 12px;overflow:auto}" +
".prog-dialog-overlay[hidden]{display:none}" +
".prog-dialog{width:100%;max-width:640px;background:var(--card,#0c241d);border:1px solid var(--border-strong,rgba(0,230,179,.45));border-radius:16px;box-shadow:var(--shadow,0 18px 40px rgba(0,0,0,.5));padding:1rem 1.1rem 1.2rem}" +
".prog-dialog-head{display:flex;align-items:center;gap:.6rem;margin-bottom:.2rem}" +
".prog-dialog-head h2{margin:0;font-size:1.2rem;font-weight:900;color:var(--text,#e8fff7);font-family:var(--font-stack,sans-serif)}" +
".prog-dialog-close{margin-left:auto;min-width:44px;min-height:44px;border-radius:10px;border:1px solid var(--border,rgba(255,255,255,.18));background:var(--surface-2,rgba(0,230,179,.08));color:var(--text,#e8fff7);font-weight:900;font-size:1.05rem;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}" +
".prog-dialog-close:hover,.prog-dialog-close:focus-visible{border-color:var(--accent,#00e6b3)}" +
"body.prog-dialog-open{overflow:hidden}" +
".prog-toast-region{position:fixed;left:50%;bottom:calc(70px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:1300;display:flex;flex-direction:column;gap:.5rem;width:max-content;max-width:min(92vw,380px);pointer-events:none}" +
".prog-toast{display:flex;align-items:center;gap:.6rem;padding:.7rem .9rem;border-radius:14px;background:var(--card,#0c241d);border:1px solid var(--border-strong,rgba(0,230,179,.45));box-shadow:var(--shadow,0 18px 40px rgba(0,0,0,.5));color:var(--text,#e8fff7);font-weight:800;opacity:0;transform:translateY(10px);transition:opacity .35s ease,transform .35s ease}" +
".prog-toast.is-in{opacity:1;transform:translateY(0)}" +
".prog-toast-emoji{font-size:1.5rem;line-height:1}" +
".prog-toast-text strong{font-weight:900;color:var(--accent-2,#34e7c4)}" +
"@media (prefers-reduced-motion:reduce){.prog-bar-fill,.prog-toast,a.prog-badge{transition:none!important}}" +
"@media print{.prog-counter,.prog-dialog-overlay{display:none!important}}";
    var style = document.createElement("style");
    style.id = "prog-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------- accessible unlock toast ---------- */
  var toastRegion = null;
  function ensureToastRegion() {
    if (toastRegion) { return toastRegion; }
    toastRegion = document.createElement("div");
    toastRegion.className = "prog-toast-region";
    toastRegion.setAttribute("aria-live", "polite");
    toastRegion.setAttribute("aria-atomic", "false");
    document.body.appendChild(toastRegion);
    return toastRegion;
  }
  function toast(def) {
    if (!def) { return; }
    var region = ensureToastRegion();
    var el = document.createElement("div");
    el.className = "prog-toast";
    el.setAttribute("role", "status");
    el.innerHTML =
      '<span class="prog-toast-emoji" aria-hidden="true">' + def.emoji + "</span>" +
      '<span class="prog-toast-text"><strong>Badge unlocked!</strong> </span>';
    el.querySelector(".prog-toast-text").appendChild(document.createTextNode(def.name));
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

  /* ---------- badge card (dialog) ---------- */
  function badgeCard(def, state, isAch) {
    var unlocked = !!(state && state.unlocked);
    var asLink = !isAch && !!def.href;
    var card = document.createElement(asLink ? "a" : "div");
    card.className = "prog-badge" + (unlocked ? " is-unlocked" : " is-locked");
    if (asLink) { card.setAttribute("href", def.href); }
    var status = unlocked
      ? "earned" + (state && state.at ? " on " + state.at : "")
      : "locked — " + def.cond;
    card.setAttribute("aria-label", def.name + ": " + status);
    var emoji = '<span class="prog-emoji" aria-hidden="true">' +
      (unlocked ? def.emoji : "🔒") + "</span>";
    var name = '<span class="prog-name">' + def.name + "</span>";
    var meta = unlocked
      ? '<span class="prog-meta prog-earned">Earned' +
        (state && state.at ? " · " + state.at : "") + "</span>"
      : '<span class="prog-meta prog-cond">' + def.cond + "</span>";
    card.innerHTML = emoji + '<span class="prog-text">' + name + meta + "</span>";
    return card;
  }
  function sectionTitle(title, sub) {
    var wrap = document.createElement("div");
    wrap.className = "prog-subhead";
    wrap.innerHTML = "<h3>" + title + "</h3><p>" + sub + "</p>";
    return wrap;
  }
  function miniIcon(def, state) {
    var unlocked = !!(state && state.unlocked);
    var span = document.createElement("span");
    span.className = "prog-mini" + (unlocked ? " is-unlocked" : " is-locked");
    span.textContent = def.emoji;
    var label = def.name + ": " + (unlocked ? "earned" : "locked");
    span.setAttribute("role", "img");
    span.setAttribute("title", label);
    span.setAttribute("aria-label", label);
    return span;
  }

  /* ---------- per-page section-challenge meter ---------- */
  function renderMeter() {
    if (!LAYERS.challenges) { return; }
    var cs = challengeState();
    var existing = document.getElementById("progMeter");
    if (!cs.page.total) { if (existing) { existing.parentNode.removeChild(existing); } return; }
    var main = document.querySelector("main");
    if (!main) { return; }
    var m = existing;
    if (!m) {
      m = document.createElement("div");
      m.id = "progMeter";
      m.className = "prog-meter";
      main.insertBefore(m, main.firstChild);
    }
    var pct = Math.round(cs.page.done / cs.page.total * 100);
    var pb = "";
    if (LAYERS.perPageBadges) {
      pb = '<span class="prog-pagebadges" aria-hidden="true">' +
        pageBadges().map(function (b) {
          return '<span class="prog-pb ' + (b.earned ? "is-earned" : "is-locked") +
            '" title="' + b.name + '">' + b.emoji + "</span>";
        }).join("") + "</span>";
    }
    m.innerHTML =
      '<span class="prog-meter-lab">📋 Section challenges</span>' +
      '<span class="prog-meter-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + cs.page.total +
      '" aria-valuenow="' + cs.page.done + '" aria-label="Section challenges done">' +
      '<span style="width:' + pct + '%"></span></span>' +
      '<span class="prog-meter-num">' + cs.page.done + " / " + cs.page.total + "</span>" + pb;
  }

  /* ---------- hub strip (panel + totals + rank) ---------- */
  function renderHub(container) {
    if (!container) { return; }
    var c = snapshot();
    container.innerHTML = "";

    var head = document.createElement("div");
    head.className = "prog-head";
    head.innerHTML =
      '<div class="prog-count"><span class="prog-count-big">' + c.earned +
      '</span><span class="prog-count-total"> / ' + c.total + " badges</span></div>" +
      '<div class="prog-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + c.total +
      '" aria-valuenow="' + c.earned + '" aria-label="Badges earned">' +
      '<div class="prog-bar-fill" style="width:' + c.pct + '%"></div></div>';
    container.appendChild(head);

    if (LAYERS.hubTotals) {
      var totals = document.createElement("div");
      totals.className = "prog-totals";
      var bits = "";
      if (LAYERS.ranks && RANKS.length) {
        var r = rank();
        bits += '<span class="prog-stat prog-rank">🎖 <span class="prog-stat-v">' + r.name + "</span></span>";
      }
      if (LAYERS.pointsStreak) {
        bits += '<span class="prog-stat">⭐ <span class="prog-stat-v">' + c.points + "</span> pts</span>";
        bits += '<span class="prog-stat">🔥 <span class="prog-stat-v">' + c.streak + "</span> streak</span>";
      }
      bits += '<span class="prog-stat">🧭 <span class="prog-stat-v">' + c.explored + "%</span> explored</span>";
      totals.innerHTML = bits;
      container.appendChild(totals);

      if (LAYERS.ranks && RANKS.length) {
        var rk = rank();
        if (rk.next) {
          var nx = document.createElement("p");
          nx.className = "prog-rank-next";
          nx.textContent = (rk.next.at - rk.points) + " pts to " + rk.next.name;
          container.appendChild(nx);
        }
      }
    }

    if (c.off) {
      var off = document.createElement("p");
      off.className = "prog-off";
      off.textContent = "Progress saving is off in this browser, so badges won't be remembered here.";
      container.appendChild(off);
    }

    var strip = document.createElement("div");
    strip.className = "prog-mini-grid";
    c.topic.forEach(function (b) { strip.appendChild(miniIcon(b.def, b.state)); });
    if (c.ach.length) {
      var sep = document.createElement("span");
      sep.className = "prog-mini-sep"; sep.setAttribute("aria-hidden", "true");
      strip.appendChild(sep);
      c.ach.forEach(function (b) { strip.appendChild(miniIcon(b.def, b.state)); });
    }
    container.appendChild(strip);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "prog-guide-btn";
    btn.innerHTML = '<span aria-hidden="true">🔎</span> View badges, points &amp; levels';
    btn.addEventListener("click", openDetails);
    container.appendChild(btn);
  }

  function resetControl() {
    var wrap = document.createElement("div");
    wrap.className = "prog-reset-wrap";
    var status = document.createElement("span");
    status.className = "prog-reset-status";
    status.setAttribute("aria-live", "polite");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "prog-reset";
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

  /* ---------- per-tile chips ---------- */
  function decorateTiles() {
    var data = all();
    var stateById = {};
    data.topic.forEach(function (b) { stateById[b.def.id] = b.state; });
    var tiles = document.querySelectorAll("[data-prog-badges],[data-el-badges]");
    Array.prototype.forEach.call(tiles, function (tile) {
      var raw = tile.getAttribute("data-prog-badges") || tile.getAttribute("data-el-badges") || "";
      var ids = raw.split(/\s+/).filter(Boolean);
      if (!ids.length) { return; }
      var unlocked = ids.filter(function (id) {
        return stateById[id] && stateById[id].unlocked;
      }).length;
      var total = ids.length;
      var host = tile.querySelector(".tile-head") || tile;
      var chip = host.querySelector(".prog-chip");
      if (!chip) {
        chip = document.createElement("span");
        chip.className = "prog-chip";
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

  /* ---------- corner counter (every page) ---------- */
  var counterEl = null;
  function renderCounter() {
    if (counterEl) { updateCounter(); return; }
    counterEl = document.createElement("button");
    counterEl.type = "button";
    counterEl.className = "prog-counter";
    counterEl.innerHTML = '<span aria-hidden="true">🎖</span><span class="prog-counter-num"></span><span class="prog-counter-rank"></span><span class="prog-counter-ch"></span>';
    counterEl.addEventListener("click", openDetails);
    document.body.appendChild(counterEl);
    updateCounter();
  }
  function updateCounter() {
    if (!counterEl) { return; }
    var c = snapshot();
    var cs = challengeState();
    counterEl.querySelector(".prog-counter-num").textContent = c.earned + "/" + c.total;
    var rkEl = counterEl.querySelector(".prog-counter-rank");
    var rkName = (LAYERS.ranks && RANKS.length) ? rank().name : "";
    rkEl.textContent = rkName ? " · " + rkName : "";
    var chEl = counterEl.querySelector(".prog-counter-ch");
    chEl.textContent = cs.globalDone ? " · 📋 " + cs.globalDone : "";
    counterEl.setAttribute("aria-label",
      "Badges earned: " + c.earned + " of " + c.total +
      (rkName ? "; rank " + rkName : "") +
      (cs.globalDone ? "; " + cs.globalDone + " challenges completed" : "") +
      ". Open the badge guide.");
  }

  /* ---------- badge-guide dialog ---------- */
  var overlayEl = null, dialogEl = null, lastFocus = null;
  function ensureDialog() {
    if (overlayEl) { return; }
    overlayEl = document.createElement("div");
    overlayEl.className = "prog-dialog-overlay";
    overlayEl.hidden = true;
    dialogEl = document.createElement("div");
    dialogEl.className = "prog-dialog";
    dialogEl.setAttribute("role", "dialog");
    dialogEl.setAttribute("aria-modal", "true");
    dialogEl.setAttribute("aria-labelledby", "prog-dialog-title");
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
  function pointsLevelsSection() {
    var showPS = LAYERS.pointsStreak;
    var showRanks = LAYERS.ranks && RANKS.length;
    if (!showPS && !showRanks) { return null; }
    var d = load();
    var frag = document.createDocumentFragment();
    frag.appendChild(sectionTitle("Points, streaks &amp; levels",
      "Earn points as you work to climb the ranks."));

    var ul = document.createElement("ul");
    ul.className = "prog-how";
    function how(icon, html) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="pi" aria-hidden="true">' + icon + "</span><span>" + html + "</span>";
      ul.appendChild(li);
    }
    if (showPS) {
      how("💯", "<b>Points</b> — earn <b>+" + POINTS.challenge +
        "</b> for every challenge you finish and <b>+" + POINTS.badge +
        "</b> for each badge you unlock. You have <b>" + (d.points || 0) + "</b> so far.");
      how("🔥", "<b>Streak</b> — answer challenges correctly in a row to build a streak. " +
        "Get one wrong and it resets to <b>0</b> (your points and badges stay). " +
        "Your best streak is <b>" + (d.bestStreak || 0) + "</b>.");
    }
    if (showRanks) {
      var r = rank();
      var msg = "<b>Levels</b> — your points set your level. You're <b>" + r.name + "</b>";
      if (r.next) {
        var need = r.next.at - r.points;
        msg += ". Earn <b>" + need + "</b> more point" + (need === 1 ? "" : "s") +
          " to reach <b>" + r.next.name + "</b>.";
      } else {
        msg += " — the top level. 🎉";
      }
      how("🎖", msg);
    }
    frag.appendChild(ul);

    if (showRanks) {
      var curName = rank().name;
      var ladder = document.createElement("ol");
      ladder.className = "prog-ladder";
      ladder.setAttribute("aria-label", "Level ladder, lowest to highest");
      RANKS.forEach(function (rk) {
        var li = document.createElement("li");
        var isCur = rk.name === curName;
        if (isCur) { li.className = "is-current"; }
        li.innerHTML = '<span class="lr-name">' + rk.name + "</span>" +
          (isCur ? ' <span class="lr-you">★ you</span>' : "") +
          '<span class="lr-at">' + (rk.at === 0 ? "start" : rk.at + " pts") + "</span>";
        ladder.appendChild(li);
      });
      frag.appendChild(ladder);
    }
    return frag;
  }

  function buildDialog() {
    var data = all();
    dialogEl.innerHTML = "";
    var head = document.createElement("div");
    head.className = "prog-dialog-head";
    head.innerHTML = '<h2 id="prog-dialog-title">' + HUB_TITLE + "</h2>";
    var close = document.createElement("button");
    close.type = "button";
    close.className = "prog-dialog-close";
    close.setAttribute("aria-label", "Close badge guide");
    close.innerHTML = "✕";
    close.addEventListener("click", closeDetails);
    head.appendChild(close);
    dialogEl.appendChild(head);

    if (data.off) {
      var off = document.createElement("p");
      off.className = "prog-off";
      off.textContent = "Progress saving is off in this browser, so badges won't be remembered here.";
      dialogEl.appendChild(off);
    }

    dialogEl.appendChild(sectionTitle("Topic badges",
      "Master each interactive to earn its badge — tap one to go to its page."));
    var tGrid = document.createElement("div");
    tGrid.className = "prog-grid";
    data.topic.forEach(function (b) { tGrid.appendChild(badgeCard(b.def, b.state, false)); });
    dialogEl.appendChild(tGrid);

    if (data.achievements.length) {
      dialogEl.appendChild(sectionTitle("Achievement badges",
        "Extra rewards that unlock automatically as you go."));
      var aGrid = document.createElement("div");
      aGrid.className = "prog-grid";
      data.achievements.forEach(function (b) { aGrid.appendChild(badgeCard(b.def, b.state, true)); });
      dialogEl.appendChild(aGrid);
    }

    var pl = pointsLevelsSection();
    if (pl) { dialogEl.appendChild(pl); }

    dialogEl.appendChild(resetControl());
  }
  function openDetails() {
    ensureDialog();
    buildDialog();
    lastFocus = document.activeElement;
    overlayEl.hidden = false;
    document.body.classList.add("prog-dialog-open");
    var close = dialogEl.querySelector(".prog-dialog-close");
    if (close) { close.focus(); }
  }
  function closeDetails() {
    if (!overlayEl || overlayEl.hidden) { return; }
    overlayEl.hidden = true;
    document.body.classList.remove("prog-dialog-open");
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  /* keep every surface in sync after a change */
  function refreshAll() {
    updateCounter();
    renderMeter();
    var hub = hubEl();
    if (hub) { renderHub(hub); }
    decorateTiles();
    if (overlayEl && !overlayEl.hidden) { buildDialog(); }
  }

  /* ---------- init / boot ---------- */
  function boot() {
    injectCSS();
    if (LAYERS.challenges) { registerChallenges(); }
    var hub = hubEl();
    if (hub) { renderHub(hub); }
    decorateTiles();
    renderCounter();
  }
  function init(userCfg) {
    cfg = userCfg || {};
    if (!cfg.ns) {
      if (window.console && console.warn) { console.warn("Progress.init: cfg.ns is required"); }
      return;
    }
    KEY = PREFIX + cfg.ns + "-v1";
    TOPIC = cfg.topic || [];
    ACH = cfg.ach || [];
    TOPIC_BY_ID = index(TOPIC);
    ACH_BY_ID = index(ACH);
    ALL_TOPIC_IDS = TOPIC.map(function (t) { return t.id; });
    CHALLENGE_PAGES = TOPIC.filter(function (t) { return t.href; })
      .map(function (t) { return normPath(t.href); });
    THRESHOLD = typeof cfg.threshold === "number" ? cfg.threshold : 0.8;
    POINTS = extend({ challenge: 10, badge: 25 }, cfg.points);
    RANKS = (cfg.ranks || []).slice().sort(function (a, b) { return a.at - b.at; });
    LAYERS = extend({ badges: true, challenges: true, pointsStreak: true,
      perPageBadges: true, hubTotals: true, ranks: true }, cfg.layers);
    HUB_TITLE = cfg.hubTitle || "🎖 Badges";

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }

  /* ---------- §API: public surface ---------- */
  var Progress = {
    init: init,
    markSeen: markSeen,
    record: record,
    complete: complete,
    addPoints: addPoints,
    miss: miss,
    rank: rank,
    get: get,
    all: all,
    snapshot: snapshot,
    challengeDone: challengeDone,
    challengeState: challengeState,
    pageBadges: pageBadges,
    reset: reset,
    renderHub: renderHub,
    decorateTiles: decorateTiles,
    openGuide: openDetails,
    openDetails: openDetails,
    toast: toast,
    /* test-only: direct access to pure storage logic for the headless harness.
       Not part of the page contract — pages must use the methods above. */
    _internals: {
      load: load, save: save, blank: blank, normalize: normalize,
      tryMigrate: tryMigrate, recomputeAchievements: recomputeAchievements,
      key: function () { return KEY; }
    }
  };

  window.Progress = Progress;
  /* transitional alias so mid-migration electronics calls keep working */
  if (!window.ElProgress) { window.ElProgress = Progress; }
})();
