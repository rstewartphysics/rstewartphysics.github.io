/* ============================================================
   Advanced Higher Physics — progress config for the shared engine.
   Supplies the badge registry, storage namespace and rank ladder
   to assets/js/progress.js (window.Progress).
   Loaded AFTER progress.js:
     <script src="/assets/js/progress.js" defer></script>
     <script src="/assets/js/progress/ah-physics.js" defer></script>
   First entries are the Simple Harmonic Motion practice-test pair.
   Practice tests are scored, not page-completed, so they carry no
   unlock:"page" — the page calls Progress.record() and the badge
   unlocks at 80%. Topic-page badges join them as those pages are
   built, using the deck letter as the id (ah-d-shm, ah-o-polar…),
   so hub, decks, slides index and badges all line up.
   ============================================================ */
(function () {
  "use strict";
  if (!window.Progress) {
    if (window.console && console.warn) { console.warn("progress/ah-physics.js: load progress.js first"); }
    return;
  }

  var TOPIC = [
    { id: "ah-shm-test-a", name: "Oscillator", emoji: "📝", section: "Quanta & Waves",
      href: "/classes/adv/practice-tests/shm-simple-harmonic-motion-a.html",
      cond: "Score 80% or more on Simple Harmonic Motion Practice Test A" },
    { id: "ah-shm-test-b", name: "Damper", emoji: "🌀", section: "Quanta & Waves",
      href: "/classes/adv/practice-tests/shm-simple-harmonic-motion-b.html",
      cond: "Score 80% or more on Simple Harmonic Motion Practice Test B" },
    { id: "ah-stellar-test-a", name: "Stargazer", emoji: "🔭", section: "Rotational Motion & Astrophysics",
      href: "/classes/adv/practice-tests/stellar-physics-a.html",
      cond: "Score 80% or more on Stellar Physics Practice Test A" },
    { id: "ah-stellar-test-b", name: "Supergiant", emoji: "🌟", section: "Rotational Motion & Astrophysics",
      href: "/classes/adv/practice-tests/stellar-physics-b.html",
      cond: "Score 80% or more on Stellar Physics Practice Test B" },
    // Practice pages (rule 99): AH has no multiple choice, so the gap-fill earns the badge
    { id: "ah-mf1p", name: "Field Sketcher", emoji: "🧲", section: "Electromagnetism", unlock: "page",
      href: "/classes/adv/electromagnetism/magnetic-fields-practice-1.html",
      cond: "Finish the gap-fill on Magnetism and field patterns practice" },
    { id: "ah-mf2p", name: "Wire Puller", emoji: "⚡", section: "Electromagnetism", unlock: "page",
      href: "/classes/adv/electromagnetism/magnetic-fields-practice-2.html",
      cond: "Finish the gap-fill on Wires in a magnetic field practice" },
    { id: "ah-mf3p", name: "Spiral Tracker", emoji: "🌀", section: "Electromagnetism", unlock: "page",
      href: "/classes/adv/electromagnetism/magnetic-fields-practice-3.html",
      cond: "Finish the gap-fill on Charged particles in a magnetic field practice" }
  ];

  var SHM_IDS = ["ah-shm-test-a", "ah-shm-test-b"];
  var STELLAR_IDS = ["ah-stellar-test-a", "ah-stellar-test-b"];
  function allUnlocked(b, ids) {
    return ids.every(function (id) { return b[id] && b[id].unlocked; });
  }

  var ACH = [
    { id: "ach-shm", name: "Simple Harmonic Master", emoji: "🏆",
      cond: "Earn both Simple Harmonic Motion practice-test badges",
      test: function (b) { return allUnlocked(b, SHM_IDS); } },
    { id: "ach-stellar", name: "Star Classifier", emoji: "🏆",
      cond: "Earn both Stellar Physics practice-test badges",
      test: function (b) { return allUnlocked(b, STELLAR_IDS); } },
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
    ns: "ah-physics",
    hubTitle: "🎖 Advanced Higher Physics badges",
    threshold: 0.8,
    topic: TOPIC,
    ach: ACH,
    ranks: RANKS,
    points: { challenge: 10, badge: 25 }
  });
})();
