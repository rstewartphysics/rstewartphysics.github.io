/* ============================================================
   S3 Engineering Science — progress config for the shared engine.
   Loaded AFTER progress.js:
     <script src="/assets/js/progress.js" defer></script>
     <script src="/assets/js/progress/eng-s3.js" defer></script>
   Topic badges use unlock:"page" (challenge-based pages, no scored flagship).
   Behind content: only LIVE, instrumented pages get a badge — coming-soon
   topics are added here as those pages are built and wired.
   ============================================================ */
(function () {
  "use strict";
  if (!window.Progress) {
    if (window.console && console.warn) { console.warn("progress/eng-s3.js: load progress.js first"); }
    return;
  }

  var TOPIC = [
    { id: "eng-what-engineer", name: "Engineering Explorer", emoji: "🧭", section: "S3 Engineering", unlock: "page",
      href: "/classes/s3-engineering/what-is-an-engineer.html",
      cond: "Finish every activity on What is an engineer?" }
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
      cond: "Reach a 4-challenge streak",
      test: function (b, data) { return !!data && (data.bestStreak || 0) >= 4; } }
  ];

  /* points → rank ladder (engineering progression) */
  var RANKS = [
    { at: 0,   name: "Apprentice" },
    { at: 30,  name: "Technician" },
    { at: 90,  name: "Engineer" },
    { at: 180, name: "Chief Engineer" }
  ];

  window.Progress.init({
    ns: "eng-s3",
    hubTitle: "🎖 S3 Engineering badges",
    threshold: 0.8,
    topic: TOPIC,
    ach: ACH,
    ranks: RANKS,
    points: { challenge: 10, badge: 25 }
  });
})();
