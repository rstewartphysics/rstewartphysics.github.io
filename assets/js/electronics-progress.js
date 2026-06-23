/* ============================================================
   National 5 Electronics — progress & badges (shared module)
   Single source of truth for the badge registry, localStorage
   schema, hub dashboard renderer and the unlock toast.

   Storage: one key "el-progress-v1" (per device, no accounts).
   Public API on window.ElProgress:
     markSeen(id)            mark an interactive as opened
     record(id, score, max)  log a scored attempt (stores best)
     get(id) / all()         read state
     reset()                 clear everything
     renderHub(el)           paint the dashboard
     decorateTiles()         add progress chips to [data-el-badges]
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
    catch (e) { return { v: VERSION, badges: {}, off: true }; }
    if (!raw) return { v: VERSION, badges: {} };
    try {
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object" || !data.badges) {
        return { v: VERSION, badges: {} };
      }
      return data;
    } catch (e) { return { v: VERSION, badges: {} }; }
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

  /* recompute achievement badges from current topic state (idempotent) */
  function recomputeAchievements(badges) {
    var newly = [];
    ACH.forEach(function (a) {
      var was = badges[a.id] && badges[a.id].unlocked;
      var now = a.test(badges);
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
    recomputeAchievements(data.badges);
    save(data);
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

    var newAch = recomputeAchievements(data.badges);
    save(data);

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
    /* force reflow then animate in */
    void el.offsetWidth;
    el.classList.add("is-in");
    window.setTimeout(function () {
      el.classList.remove("is-in");
      window.setTimeout(function () {
        if (el.parentNode) { el.parentNode.removeChild(el); }
      }, 400);
    }, 4200);
  }

  /* ---------- hub dashboard ---------- */
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

  function renderHub(container) {
    if (!container) { return; }
    var data = all();
    var topicUnlocked = data.topic.filter(function (b) { return b.state && b.state.unlocked; }).length;
    var achUnlocked = data.achievements.filter(function (b) { return b.state && b.state.unlocked; }).length;
    var total = data.topic.length + data.achievements.length;
    var earned = topicUnlocked + achUnlocked;
    var pct = total ? Math.round((earned / total) * 100) : 0;

    container.innerHTML = "";

    var head = document.createElement("div");
    head.className = "elp-head";
    head.innerHTML =
      '<div class="elp-count"><span class="elp-count-big">' + earned +
      '</span><span class="elp-count-total"> / ' + total + " badges</span></div>" +
      '<div class="elp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + total +
      '" aria-valuenow="' + earned + '" aria-label="Badges earned">' +
      '<div class="elp-bar-fill" style="width:' + pct + '%"></div></div>';
    container.appendChild(head);

    if (data.off) {
      var off = document.createElement("p");
      off.className = "elp-off";
      off.textContent = "Progress saving is turned off in this browser, so badges won't be remembered here.";
      container.appendChild(off);
    }

    container.appendChild(sectionTitle("Topic badges", "Master each interactive to earn its badge."));
    var tGrid = document.createElement("div");
    tGrid.className = "elp-grid";
    data.topic.forEach(function (b) { tGrid.appendChild(badgeCard(b.def, b.state, false)); });
    container.appendChild(tGrid);

    container.appendChild(sectionTitle("Achievement badges", "Extra rewards for going further."));
    var aGrid = document.createElement("div");
    aGrid.className = "elp-grid";
    data.achievements.forEach(function (b) { aGrid.appendChild(badgeCard(b.def, b.state, true)); });
    container.appendChild(aGrid);

    container.appendChild(resetControl(container));
  }

  function sectionTitle(title, sub) {
    var wrap = document.createElement("div");
    wrap.className = "elp-subhead";
    wrap.innerHTML = "<h3>" + title + "</h3><p>" + sub + "</p>";
    return wrap;
  }

  function resetControl(container) {
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
      renderHub(container);
      decorateTiles();
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
    toast: toast
  };

  function init() {
    var hub = document.getElementById("elProgressHub");
    if (hub) { renderHub(hub); }
    decorateTiles();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
