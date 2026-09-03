/* ============================================================
   Higher Physics — progress config for the shared engine.
   Supplies the badge registry, storage namespace and rank ladder
   to assets/js/progress.js (window.Progress).
   Loaded AFTER progress.js:
     <script src="/assets/js/progress.js" defer></script>
     <script src="/assets/js/progress/higher-physics.js" defer></script>
   Topic badges use unlock:"page" — they earn themselves when every
   challenge on their page is complete (Higher pages have many small
   pass/fail challenges, not one scored flagship). Fresh start: no
   migrateFrom (the old per-page hp-*-beta- keys are left as-is).
   Electricity topic pages, plus the first Particles & Waves practice-test
   pair. Practice tests are scored, not page-completed, so they carry no
   unlock:"page" — the page calls Progress.record() and the badge unlocks at
   80%. The rest of the Dynamic Universe and Particles & Waves badges drop in
   here as those pages are built.
   ============================================================ */
(function () {
  "use strict";
  if (!window.Progress) {
    if (window.console && console.warn) { console.warn("progress/higher-physics.js: load progress.js first"); }
    return;
  }

  var TOPIC = [
    { id: "hp-cpr", name: "Current Master", emoji: "⚡", section: "Electricity", unlock: "page",
      href: "/classes/higher/electricity/current-pd-power-resistance.html",
      cond: "Finish every challenge on Current, p.d., power & resistance" },
    { id: "hp-emf", name: "Source Sleuth", emoji: "🔋", section: "Electricity", unlock: "page",
      href: "/classes/higher/electricity/electrical-sources-internal-resistance.html",
      cond: "Finish every challenge on Electrical sources & internal resistance" },
    { id: "hp-cap", name: "Charge Keeper", emoji: "🔌", section: "Electricity", unlock: "page",
      href: "/classes/higher/electricity/capacitors.html",
      cond: "Finish every challenge on Capacitors" },
    { id: "hp-ac", name: "A.C. Analyst", emoji: "📈", section: "Electricity", unlock: "page",
      href: "/classes/higher/electricity/monitoring-measuring-ac.html",
      cond: "Finish every challenge on Monitoring & measuring a.c." },
    { id: "hp-semi", name: "Junction Master", emoji: "💎", section: "Electricity", unlock: "page",
      href: "/classes/higher/electricity/semiconductors-pn-junctions.html",
      cond: "Finish every challenge on Conductors, semiconductors & p–n junctions" },
    { id: "hp-focp-test-a", name: "Field Worker", emoji: "📝", section: "Particles & Waves",
      href: "/classes/higher/practice-tests/pw6-forces-on-charged-particles-a.html",
      cond: "Score 80% or more on Forces on Charged Particles Practice Test A" },
    { id: "hp-focp-test-b", name: "Beam Steerer", emoji: "🧲", section: "Particles & Waves",
      href: "/classes/higher/practice-tests/pw6-forces-on-charged-particles-b.html",
      cond: "Score 80% or more on Forces on Charged Particles Practice Test B" }
  ];

  var ELEC_IDS = TOPIC.filter(function (t) { return t.section === "Electricity"; })
    .map(function (t) { return t.id; });
  function allUnlocked(b, ids) {
    return ids.every(function (id) { return b[id] && b[id].unlocked; });
  }
  function allSeen(b, ids) {
    return ids.every(function (id) { return b[id] && b[id].seen; });
  }

  var ACH = [
    { id: "ach-elec", name: "Electricity Expert", emoji: "🏆",
      cond: "Earn every Electricity badge",
      test: function (b) { return allUnlocked(b, ELEC_IDS); } },
    { id: "ach-curious", name: "Curious Mind", emoji: "🧭",
      cond: "Open every Electricity page",
      test: function (b) { return allSeen(b, ELEC_IDS); } },
    { id: "ach-streak", name: "On a Roll", emoji: "🔥",
      cond: "Reach a 6-challenge streak",
      test: function (b, data) { return !!data && (data.bestStreak || 0) >= 6; } }
  ];

  /* points → rank ladder (academic progression) */
  var RANKS = [
    { at: 0,   name: "Novice" },
    { at: 60,  name: "Apprentice" },
    { at: 150, name: "Scholar" },
    { at: 260, name: "Physicist" },
    { at: 360, name: "Professor" }
  ];

  window.Progress.init({
    ns: "higher-physics",
    hubTitle: "🎖 Higher Physics badges",
    threshold: 0.8,
    topic: TOPIC,
    ach: ACH,
    ranks: RANKS,
    points: { challenge: 10, badge: 25 }
  });
})();
