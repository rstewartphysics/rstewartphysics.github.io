/* ============================================================
   National 5 Electronics — progress config for the shared engine.
   Supplies the badge registry, storage namespace, rank ladder and
   migration source to assets/js/progress.js (window.Progress).
   Loaded AFTER progress.js:
     <script src="/assets/js/progress.js" defer></script>
     <script src="/assets/js/progress/electronics.js" defer></script>
   Reproduces the exact registry of the legacy electronics-progress.js
   (10 topic + 7 achievement badges) so existing students see no change.
   ============================================================ */
(function () {
  "use strict";
  if (!window.Progress) {
    if (window.console && console.warn) { console.warn("progress/electronics.js: load progress.js first"); }
    return;
  }

  var TOPIC = [
    { id: "thy-qc", name: "Number Cruncher", emoji: "🧮", section: "Theory",
      href: "/classes/electronics/theory/quantities-and-calculations.html",
      cond: "Score 8/10 in the prefix & Ohm's-law challenge" },
    { id: "thy-rc", name: "Network Navigator", emoji: "🔗", section: "Theory",
      href: "/classes/electronics/theory/resistor-circuits.html",
      cond: "Get 8/10 resistor totals right" },
    { id: "thy-ts", name: "Bright Spark", emoji: "💡", section: "Theory", thr: 1,
      href: "/classes/electronics/theory/transistor-switching-circuits.html",
      cond: "Pass every transistor-switch scenario" },
    { id: "thy-sc", name: "Wave Reader", emoji: "🌊", section: "Theory",
      href: "/classes/electronics/theory/signals-and-capacitors.html",
      cond: "Score 8/10 reading traces & RC curves" },
    { id: "thy-cd", name: "Component Collector", emoji: "🔌", section: "Theory",
      href: "/classes/electronics/theory/components-and-devices.html",
      cond: "Match 80% of the component symbols" },
    { id: "thy-li", name: "Logic Lord", emoji: "🚦", section: "Theory", thr: 1,
      href: "/classes/electronics/theory/logic-and-ics.html",
      cond: "Complete the target truth tables" },
    { id: "sim-io", name: "The Operator", emoji: "🎛️", section: "Simulation", thr: 1,
      href: "/classes/electronics/simulation.html",
      cond: "Satisfy the input → process → output brief" },
    { id: "pln-st", name: "Master Planner", emoji: "🗂️", section: "Planning", thr: 1,
      href: "/classes/electronics/planning.html",
      cond: "Sequence the five marked stages correctly" },
    { id: "con-cc", name: "Solder Master", emoji: "🪛", section: "Construction",
      href: "/classes/electronics/construction.html",
      cond: "Read 8/10 resistor colour codes" },
    { id: "tst-ff", name: "Fault Finder", emoji: "🔬", section: "Testing",
      href: "/classes/electronics/testing.html",
      cond: "Diagnose 8/10 faults" }
  ];

  var ALL_TOPIC_IDS = TOPIC.map(function (t) { return t.id; });
  var THEORY_IDS = TOPIC.filter(function (t) { return t.section === "Theory"; })
    .map(function (t) { return t.id; });

  function normPath(p) {
    try { p = decodeURIComponent(p); } catch (e) {}
    return p.replace(/\/+$/, "") || p;
  }
  var CHALLENGE_PAGES = TOPIC.map(function (t) { return normPath(t.href); });
  function allUnlocked(b, ids) {
    return ids.every(function (id) { return b[id] && b[id].unlocked; });
  }

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
        return !!data && !!data.pageDone &&
          CHALLENGE_PAGES.every(function (pk) { return data.pageDone[pk]; });
      } }
  ];

  /* points → rank ladder (workshop progression) */
  var RANKS = [
    { at: 0,   name: "Trainee" },
    { at: 60,  name: "Apprentice" },
    { at: 160, name: "Technician" },
    { at: 300, name: "Engineer" },
    { at: 480, name: "Chief Engineer" }
  ];

  window.Progress.init({
    ns: "electronics",
    hubTitle: "🎖 Electronics badges",
    threshold: 0.8,
    /* one-time, lossless copy of the legacy key on first load (Phase 1 shim) */
    migrateFrom: "el-progress-v1",
    topic: TOPIC,
    ach: ACH,
    ranks: RANKS,
    points: { challenge: 10, badge: 25 }
  });
})();
