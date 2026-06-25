/* ============================================================
   S3 Physics — progress config for the shared engine.
   Loaded AFTER progress.js:
     <script src="/assets/js/progress.js" defer></script>
     <script src="/assets/js/progress/s3-physics.js" defer></script>
   Topic badges use unlock:"page" (challenge-based pages, no scored flagship).
   Behind content: only LIVE, instrumented pages get a badge — pages are
   added here as they are migrated onto the engine (rolling out across S3
   Physics, starting with Electricity 1).
   ============================================================ */
(function () {
  "use strict";
  if (!window.Progress) {
    if (window.console && console.warn) { console.warn("progress/s3-physics.js: load progress.js first"); }
    return;
  }

  var TOPIC = [
    { id: "elec1", name: "Circuit Starter", emoji: "⚡", section: "Electricity", unlock: "page",
      href: "/classes/s3-physics/electricity1.html",
      cond: "Finish every challenge on Electricity 1" }
  ];

  var ALL_IDS = TOPIC.map(function (t) { return t.id; });
  function anyUnlocked(b, ids) {
    return ids.some(function (id) { return b[id] && b[id].unlocked; });
  }

  var ACH = [
    { id: "ach-start", name: "Getting Started", emoji: "🚀",
      cond: "Earn your first badge",
      test: function (b) { return anyUnlocked(b, ALL_IDS); } },
    { id: "ach-streak", name: "On a Roll", emoji: "🔥",
      cond: "Reach a 3-challenge streak",
      test: function (b, data) { return !!data && (data.bestStreak || 0) >= 3; } }
  ];

  /* points → rank ladder (S3 physics progression) */
  var RANKS = [
    { at: 0,   name: "Trainee" },
    { at: 60,  name: "Apprentice" },
    { at: 150, name: "Physicist" },
    { at: 300, name: "Master Physicist" }
  ];

  window.Progress.init({
    ns: "s3-physics",
    hubTitle: "🎖 S3 Physics badges",
    threshold: 0.8,
    topic: TOPIC,
    ach: ACH,
    ranks: RANKS,
    points: { challenge: 10, badge: 25 }
  });
})();
