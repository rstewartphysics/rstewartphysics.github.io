/* ============================================================
   Practical pages: the tracking page (teacher's laptop only; plan WEB-PRACTICALS-PLAN.md
   section 10, phase C). One page for every lesson that uses the number log-in.
   Pupils log in with a number; the store holds numbers and work only. Names come from the
   tracking sheet the teacher opens here ("Login No." column). They are read in this browser,
   kept on this laptop, and never sent anywhere.
   Each lesson's questions are read from the lesson's own page, so a new lesson only needs a
   line in this page's lesson list.
   ============================================================ */
(function () {
  "use strict";

  var CFG = JSON.parse(document.getElementById("trackData").textContent);
  var TR = CFG.track || {};
  var root = document.getElementById("track");
  var live = document.getElementById("trackLive");
  var want = root.dataset.hash;
  var RK = "pr-track-roster";    // localStorage: names, this laptop only
  var PK = "pr-track-pass";      // sessionStorage: this tab only

  var roster = [];
  try { roster = JSON.parse(localStorage.getItem(RK)) || []; } catch (e) { roster = []; }
  var pass = null;
  try { pass = sessionStorage.getItem(PK); } catch (e) { pass = null; }
  var rows = [], filter = "all", picked = null, timer = null, readAt = null, readErr = "";
  var view = "all";              // "all" or a lesson id
  var LS = {};                   // lesson id -> what it asks (from its page)

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
  function say(m) { if (live) { live.textContent = ""; setTimeout(function () { live.textContent = m; }, 30); } }
  function hash(str) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
    });
  }
  function call(body) {
    return fetch(TR.url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); });
  }
  function pad(n) { var v = parseInt(String(n).replace(/\D/g, ""), 10); return v >= 1 ? (v < 10 ? "0" : "") + v : null; }

  // ------------------------------------------------------------ what each lesson asks, from its own page
  function walk(list, base, out, where, sc) {
    (list || []).forEach(function (b, k) {
      var id = b.id || base + "-" + k;
      out.push({ b: b, id: id, where: where, sc: sc });
      if (b.type === "set") { b.items.forEach(function (it, j) { out.push({ b: it, id: it.id || id + "-" + j, where: where, sc: sc, inSet: b, n: j }); }); }
      if (b.type === "read" || b.type === "row") { walk(b.items, id, out, where, sc); }
    });
  }
  function analyse(L, data) {
    var A = { id: L.id, title: L.title, short: L.short || L.title, data: data, items: [] };
    A.off = data.screens[0] && data.screens[0].pupilOnly ? 1 : 0;
    A.steps = data.screens.filter(function (sc) { return !sc.pupilOnly; });
    data.screens.forEach(function (sc) {
      if (sc.pupilOnly) { return; }
      walk(sc.main, sc.id + "-m", A.items, "core", sc);
      (sc.parts || []).forEach(function (p, pi) { walk(p.main, sc.id + "-p" + pi, A.items, "core", sc); });
      walk(sc.after, sc.id + "-a", A.items, "core", sc);
      Object.keys(sc.roles || {}).forEach(function (r) { walk(sc.roles[r], sc.id + "-" + r, A.items, "role", sc); });
      walk(sc.wait, sc.id + "-wait", A.items, "wait", sc);
      walk(sc.challenge, sc.id + "-ch", A.items, "challenge", sc);
    });
    A.tapSteps = A.steps.filter(function (sc) {
      return A.items.some(function (x) { return x.sc === sc && x.where === "core" && x.b.type === "tap"; });
    });
    A.marked = A.items.filter(function (x) { return x.where === "core" && x.b.type === "write" && x.b.marks; });
    A.rates = A.items.filter(function (x) { return x.b.type === "rate"; });
    A.challenges = A.items.filter(function (x) { return x.where === "challenge" && x.b.type === "write"; });
    return A;
  }
  function loadLessons() {
    return Promise.all((CFG.lessons || []).map(function (L) {
      return fetch(L.page).then(function (r) { return r.text(); }).then(function (html) {
        var m = /<script type="application\/json" id="practicalData">([\s\S]*?)<\/script>/.exec(html);
        if (m) { LS[L.id] = analyse(L, JSON.parse(m[1])); }
      }).catch(function () { /* that lesson shows by step number only */ });
    }));
  }
  function plain(A, t) {
    return String(t || "").replace(/\*\*/g, "").replace(/\{([a-z0-9-]+)\|([^}]+)\}/g, "$2")
      .replace(/\{([a-z0-9-]+)\}/g, function (m, k) { return A.data.glossary[k] ? A.data.glossary[k].word : k; });
  }
  function stepOf(A, id) { for (var k = 0; k < A.data.screens.length; k++) { if (A.data.screens[k].id === id) { return k; } } return -1; }
  function markLabel(x, i) { return "Q" + (x.inSet ? x.n + 1 : i + 1) + " (/" + x.b.marks + ")"; }

  // ------------------------------------------------------------ one pupil in one lesson
  function facts(A, r) {
    var f = { has: !!r };
    if (!r || !A) { return f; }
    var S = r.state || {}, sm = r.summary || {};
    var k = stepOf(A, sm.stepId);
    var sc = A.data.screens[k];
    f.stepNo = k < 0 ? "" : String(k + 1 - A.off);
    f.stepTitle = sc ? sc.title : "";
    f.mins = sm.stepAt ? Math.max(0, Math.round((Date.now() - sm.stepAt) / 60000)) : null;
    f.stepDone = (sm.done || []).indexOf(sm.stepId) >= 0;
    f.slow = !!(sc && sc.mins && f.mins != null && f.mins > sc.mins + 3 && !f.stepDone);
    f.done = (sm.done || []).filter(function (id) { var s = A.data.screens[stepOf(A, id)]; return s && !s.pupilOnly; }).length;
    f.finished = f.done === A.steps.length;
    // "4 of 5", never "4/5": Excel reads 4/5 in a CSV as a date
    f.taps = {};
    A.tapSteps.forEach(function (sc2) {
      var mine = A.items.filter(function (x) { return x.sc === sc2 && x.where === "core" && x.b.type === "tap"; });
      var answered = mine.filter(function (x) { return typeof (S.choice || {})[x.id] === "number"; });
      var right = answered.filter(function (x) { return S.choice[x.id] === x.b.answer; });
      f.taps[sc2.id] = answered.length ? right.length + " of " + mine.length : "";
    });
    f.marks = A.marked.map(function (x) { var m = (S.marks || {})[x.id]; return typeof m === "number" ? m : ""; });
    f.ch = A.challenges.filter(function (x) { return ((S.text || {})[x.id] || "").trim().length >= 3; }).length;
    f.ican = [];
    A.rates.forEach(function (x) { x.b.items.forEach(function (t, i) { f.ican.push((S.rate || {})[x.id + "-" + i] || ""); }); });
    f.back = Object.keys(S.miss || {}).length;
    f.saved = r.savedAt ? new Date(r.savedAt) : null;
    return f;
  }

  function name(p) { return p ? p.first + " " + p.last : ""; }
  function who(num) { for (var i = 0; i < roster.length; i++) { if (roster[i].num === num) { return roster[i]; } } return null; }
  function teachers() {
    var t = [];
    roster.forEach(function (p) { if (p.teacher && t.indexOf(p.teacher) < 0) { t.push(p.teacher); } });
    return t.sort();
  }
  function rowOf(lesson, num) { var o = null; rows.forEach(function (r) { if (r.lesson === lesson && r.num === num) { o = r; } }); return o; }

  // ------------------------------------------------------------ the class list (tracking sheet, Login No.)
  function readRoster(file) {
    if (!window.XLSX) { say("The spreadsheet reader did not load. Check the internet connection."); return; }
    file.arrayBuffer().then(function (buf) {
      var wb = XLSX.read(buf, { type: "array" });
      var names = wb.SheetNames.slice().sort(function (a, b) { return (b === "Pupil Info") - (a === "Pupil Info"); });
      for (var s = 0; s < names.length; s++) {
        var grid = XLSX.utils.sheet_to_json(wb.Sheets[names[s]], { header: 1, defval: "" });
        for (var h = 0; h < Math.min(grid.length, 6); h++) {
          var head = grid[h].map(function (c) { return String(c).trim().toLowerCase(); });
          var cn = head.indexOf("login no."), cs = head.indexOf("surname"), cf = head.indexOf("first name"), ct = head.indexOf("teacher");
          if (cn < 0 || cs < 0 || cf < 0) { continue; }
          var list = [], seen = {}, dup = [];
          grid.slice(h + 1).forEach(function (r) {
            var n = pad(r[cn]);
            if (!n || !String(r[cf]).trim()) { return; }
            if (seen[n]) { dup.push(n); }
            seen[n] = true;
            list.push({ num: n, first: String(r[cf]).trim(), last: String(r[cs]).trim(), teacher: ct >= 0 ? String(r[ct]).trim() : "" });
          });
          list.sort(function (a, b) { return a.num < b.num ? -1 : 1; });
          roster = list;
          try { localStorage.setItem(RK, JSON.stringify(roster)); } catch (e) { /* this visit only */ }
          dashboard();
          say("Class list loaded: " + list.length + " pupils." + (dup.length ? " Check the sheet: number " + dup.join(", ") + " is used twice." : ""));
          // only the numbers go to the store, so a mistyped number is caught at log-in
          if (TR.url && pass) { call({ op: "numbers", pass: pass, numbers: list.map(function (p) { return p.num; }) }); }
          return;
        }
      }
      say("No \"Login No.\" column found. Open the S3 Engineering tracking sheet (Pupil Info tab).");
    }).catch(function () { say("That file could not be read. Open the tracking sheet (.xlsx)."); });
  }

  // ------------------------------------------------------------ passcode gate (same passcode as the teacher view)
  function gate(msgText) {
    stop();
    root.textContent = "";
    var f = el("form", "pr-gate");
    f.appendChild(el("h2", null, "Tracking"));
    var lab = el("label", null, "Passcode");
    lab.htmlFor = "trPass";
    f.appendChild(lab);
    var row = el("div", "pr-gate-row");
    var inp = el("input");
    inp.id = "trPass";
    inp.type = "password";
    inp.autocomplete = "off";
    row.appendChild(inp);
    var go = el("button", "pr-btn pr-btn-main", "Open");
    go.type = "submit";
    row.appendChild(go);
    f.appendChild(row);
    var msg = el("p", "pr-gate-msg", msgText || "");
    msg.setAttribute("aria-live", "polite");
    f.appendChild(msg);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!(window.crypto && crypto.subtle)) { msg.textContent = "Open this page from the website (https)."; return; }
      var v = inp.value.trim();
      hash("pr-teacher:" + v).then(function (h) {
        if (h !== want) { msg.textContent = "That passcode is not right."; inp.value = ""; inp.focus(); return; }
        pass = v;
        try { sessionStorage.setItem(PK, v); } catch (err) { /* asks again next time */ }
        start();
      });
    });
    root.appendChild(f);
    inp.focus();
  }

  function card(title, text) {
    var c = el("section", "tr-card");
    c.appendChild(el("h2", null, title));
    if (text) { c.appendChild(el("p", null, text)); }
    return c;
  }

  function start() {
    root.textContent = "";
    root.appendChild(el("p", "tr-status", "Loading the lessons…"));
    loadLessons().then(function () {
      if (!TR.url) { dashboard(); return; }
      call({ op: "status" }).then(function (j) {
        if (j && j.ok && !j.claimed) { setup(); return; }
        dashboard();
        refresh();
      }).catch(function () { readErr = "The store can't be reached. Check the internet connection."; dashboard(); });
    });
  }

  function setup() {
    root.textContent = "";
    var c = card("Set up the store", "This is the first time the store has been opened. Setting it up saves your passcode in the store (scrambled, never as typed). Only you can then read pupils' work.");
    var m = el("p", "pr-gate-msg");
    m.setAttribute("aria-live", "polite");
    c.appendChild(btn("pr-btn pr-btn-main", "Set it up with my passcode", function () {
      call({ op: "claim", pass: pass }).then(function (j) {
        if (j && j.ok) { start(); return; }
        m.textContent = j && j.error === "already set up" ? "It is already set up. Use the passcode it was set up with." : "It did not work: " + ((j && j.error) || "no answer") + ".";
      }).catch(function () { m.textContent = "The store can't be reached."; });
    }));
    c.appendChild(m);
    root.appendChild(c);
  }

  // ------------------------------------------------------------ the page
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function refresh() {
    if (!TR.url || !pass) { return; }
    return call({ op: "read", pass: pass }).then(function (j) {
      if (j && j.ok) { rows = j.rows || []; readAt = new Date(); readErr = ""; paint(); return; }
      if (j && j.error === "passcode") { try { sessionStorage.removeItem(PK); } catch (e) { /* gone */ } pass = null; gate("The store did not accept that passcode."); return; }
      readErr = j && j.error === "locked" ? "Too many wrong passcodes: the store is locked for 30 minutes." : "The store answered with an error.";
      paint();
    }).catch(function () { readErr = "The store can't be reached. Trying again."; paint(); });
  }

  var gridBox = null, statusBox = null, detailBox = null;

  function dashboard() {
    stop();
    root.textContent = "";
    var warn = el("p", "tr-warn");
    warn.appendChild(el("strong", null, "Names are on this page. "));
    warn.appendChild(document.createTextNode("Keep it on your laptop: never on the board."));
    root.appendChild(warn);
    if (!TR.url) {
      root.appendChild(card("Not connected yet", "The store has not been set up. Follow the set-up steps, then this page shows your class live. You can load the class list and the number list now."));
    }

    // which lesson: all of them, or one
    var tabs = el("div", "tr-lessons");
    tabs.setAttribute("role", "group");
    tabs.setAttribute("aria-label", "Lesson");
    var all = btn("pr-btn pr-btn-quiet", "All lessons", function () { view = "all"; picked = null; dashboard(); paint(); });
    all.setAttribute("aria-pressed", view === "all" ? "true" : "false");
    tabs.appendChild(all);
    (CFG.lessons || []).forEach(function (L) {
      var b = btn("pr-btn pr-btn-quiet", L.short || L.title, function () { view = L.id; picked = null; dashboard(); paint(); });
      b.setAttribute("aria-pressed", view === L.id ? "true" : "false");
      tabs.appendChild(b);
    });
    root.appendChild(tabs);

    var tools = el("div", "tr-tools");
    var file = el("input");
    file.type = "file";
    file.accept = ".xlsx,.xls,.csv";
    file.id = "trFile";
    file.className = "visually-hidden";
    file.addEventListener("change", function () { if (file.files[0]) { readRoster(file.files[0]); } });
    var fl = el("label", "pr-btn", roster.length ? "Class list: " + roster.length + " pupils (change)" : "Open the tracking sheet…");
    fl.htmlFor = "trFile";
    fl.tabIndex = 0;
    fl.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); file.click(); } });
    tools.appendChild(file);
    tools.appendChild(fl);
    if (roster.length) {
      tools.appendChild(btn("pr-btn pr-btn-quiet", "Number list", function () { numberList(); }));
      if (CFG.card) { tools.appendChild(btn("pr-btn pr-btn-quiet", "Print log-in cards", function () { loginCards(); })); }
      tools.appendChild(btn("pr-btn pr-btn-quiet", "Forget the class list", function () {
        roster = [];
        try { localStorage.removeItem(RK); } catch (e) { /* gone */ }
        dashboard();
        paint();
        say("Class list forgotten on this laptop.");
      }));
    }
    var seg = el("div", "tr-seg");
    seg.setAttribute("role", "group");
    seg.setAttribute("aria-label", "Show");
    ["all"].concat(teachers()).forEach(function (t) {
      var b = btn("pr-btn pr-btn-quiet", t === "all" ? "Everyone" : t, function () { filter = t; dashboard(); paint(); });
      b.setAttribute("aria-pressed", filter === t ? "true" : "false");
      seg.appendChild(b);
    });
    tools.appendChild(seg);
    root.appendChild(tools);

    var tools2 = el("div", "tr-tools");
    statusBox = el("p", "tr-status");
    statusBox.setAttribute("aria-live", "polite");
    tools2.appendChild(statusBox);
    if (TR.url) {
      tools2.appendChild(btn("pr-btn pr-btn-quiet", "Refresh now", function () { refresh(); }));
      tools2.appendChild(btn("pr-btn", "Download Excel", function () { download("xlsx"); }));
      tools2.appendChild(btn("pr-btn pr-btn-quiet", "Download CSV", function () { download("csv"); }));
      var what = view === "all" ? "all saved work (every lesson)" : "this lesson's saved work";
      var armed = false;
      var del = btn("pr-btn pr-btn-quiet tr-del", "Delete " + what, function () {
        if (!armed) {
          armed = true;
          del.textContent = "Tap again to delete it for every pupil";
          del.classList.add("is-armed");
          setTimeout(function () { if (armed) { armed = false; del.textContent = "Delete " + what; del.classList.remove("is-armed"); } }, 5000);
          return;
        }
        var body = { op: "wipe", pass: pass };
        if (view !== "all") { body.lesson = view; }
        call(body).then(function () { picked = null; refresh(); say("Deleted."); });
      });
      tools2.appendChild(del);
    }
    root.appendChild(tools2);

    gridBox = el("div", "tr-gridbox");
    root.appendChild(gridBox);
    detailBox = el("section", "tr-detail");
    detailBox.setAttribute("aria-live", "polite");
    root.appendChild(detailBox);
    paint();
    if (TR.url && pass) { timer = setInterval(function () { if (!document.hidden) { refresh(); } }, 15000); }
  }

  // every pupil on the class list (filtered by teacher), then any number with work but no name
  function people() {
    var out = [], seen = {};
    roster.forEach(function (p) {
      seen[p.num] = true;
      if (filter !== "all" && p.teacher !== filter) { return; }
      out.push({ num: p.num, p: p });
    });
    if (filter === "all") {
      rows.forEach(function (r) { if (!seen[r.num]) { seen[r.num] = true; out.push({ num: r.num, p: null }); } });
    }
    return out;
  }

  function paint() {
    if (!gridBox) { return; }
    if (statusBox) {
      statusBox.textContent = readErr || (readAt ? "Updated " + readAt.toLocaleTimeString() + ". Updates every 15 seconds." : (TR.url ? "Loading…" : ""));
      statusBox.classList.toggle("is-error", !!readErr);
    }
    gridBox.textContent = "";
    if (!roster.length) { gridBox.appendChild(el("p", "tr-empty", "Open the tracking sheet to see names. Until then, pupils show by number.")); }
    if (view === "all") { paintAll(); } else { paintLesson(LS[view]); }
  }

  function th(text) { var t = el("th", null, text); t.scope = "col"; return t; }
  function nameCell(x, has, inLesson) {
    var nt = el("th");
    nt.scope = "row";
    var nb = btn("tr-name", x.p ? name(x.p) : "Not on the class list", function () {
      if (!inLesson) { view = has; }
      picked = x.num;
      dashboard();
      paint();
    });
    nb.disabled = !has;
    nt.appendChild(nb);
    return nt;
  }

  // ---- all lessons: one row per pupil, one column per lesson
  function paintAll() {
    var P = people();
    if (!P.length) { gridBox.appendChild(el("p", "tr-empty", "No work saved yet.")); detailBox.textContent = ""; return; }
    P.sort(function (a, b) { return a.num < b.num ? -1 : 1; });
    var t = el("table", "tr-grid");
    t.appendChild(el("caption", "visually-hidden", "Every pupil in every lesson"));
    var hr = el("tr");
    [th("No."), th("Name"), th("Teacher")].forEach(function (x) { hr.appendChild(x); });
    (CFG.lessons || []).forEach(function (L) {
      var h = th("");
      h.appendChild(btn("tr-name", L.short || L.title, function () { view = L.id; picked = null; dashboard(); paint(); }));
      hr.appendChild(h);
    });
    hr.appendChild(th("Last saved"));
    var thead = el("thead");
    thead.appendChild(hr);
    t.appendChild(thead);
    var tb = el("tbody");
    P.forEach(function (x) {
      var last = null, latest = null;
      var tr = el("tr");
      tr.appendChild(el("td", "tr-num", x.num));
      var cells = (CFG.lessons || []).map(function (L) {
        var r = rowOf(L.id, x.num);
        var f = facts(LS[L.id], r);
        if (f.saved && (!last || f.saved > last)) { last = f.saved; latest = L.id; }
        var td = el("td", f.slow ? "tr-slow" : null);
        if (!r) { td.textContent = "—"; td.className = "tr-muted"; }
        else if (f.finished) { td.textContent = "✓ all " + f.done + " steps"; }
        else { td.textContent = f.done + " of " + (LS[L.id] ? LS[L.id].steps.length : "?") + " · on " + f.stepNo + ". " + f.stepTitle; }
        return td;
      });
      if (!latest) { (CFG.lessons || []).forEach(function (L) { if (!latest && rowOf(L.id, x.num)) { latest = L.id; } }); }
      tr.appendChild(nameCell(x, latest, false));
      tr.appendChild(el("td", null, x.p ? x.p.teacher : ""));
      cells.forEach(function (c) { tr.appendChild(c); });
      tr.appendChild(el("td", "tr-muted", last ? last.toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" }) : ""));
      if (!latest) { tr.className = "is-none"; }
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    gridBox.appendChild(t);
    detailBox.textContent = "";
  }

  // ---- one lesson: the full grid
  function lessonHeads(A) {
    return ["No.", "Name", "Teacher", "Step", "On it", "Steps done"]
      .concat(A.tapSteps.map(function (sc) { return sc.title.replace(/:.*$/, ""); }))
      .concat(A.marked.map(markLabel)).concat(["Chal­lenges", "I can (1-3)", "Come back", "Saved"]);
  }
  function paintLesson(A) {
    if (!A) { gridBox.appendChild(el("p", "tr-empty", "This lesson's page could not be read.")); return; }
    var P = people().map(function (x) { return { num: x.num, p: x.p, r: rowOf(A.id, x.num) }; })
      .filter(function (x) { return x.p || x.r; });
    if (!P.length) { gridBox.appendChild(el("p", "tr-empty", "No work saved yet.")); return; }
    P.sort(function (a, b) { return (a.r ? 0 : 1) - (b.r ? 0 : 1) || (a.num < b.num ? -1 : 1); });
    var heads = lessonHeads(A);
    var t = el("table", "tr-grid");
    t.appendChild(el("caption", "visually-hidden", A.title + ": pupils and their progress"));
    var thead = el("thead"), hr = el("tr");
    heads.forEach(function (h) { hr.appendChild(th(h)); });
    thead.appendChild(hr);
    t.appendChild(thead);
    var tb = el("tbody");
    P.forEach(function (x) {
      var f = facts(A, x.r);
      var tr = el("tr", (f.has ? "" : "is-none") + (f.slow ? " is-slow" : "") + (picked === x.num ? " is-picked" : ""));
      tr.appendChild(el("td", "tr-num", x.num));
      tr.appendChild(nameCell(x, f.has, true));
      tr.appendChild(el("td", null, x.p ? x.p.teacher : ""));
      if (!f.has) {
        var td = el("td", "tr-muted", "Not started");
        td.colSpan = heads.length - 3;
        tr.appendChild(td);
        tb.appendChild(tr);
        return;
      }
      tr.appendChild(el("td", null, f.stepNo + ". " + f.stepTitle + (f.stepDone ? " ✓" : "")));
      tr.appendChild(el("td", f.slow ? "tr-slow" : null, f.mins == null ? "" : f.mins + " min"));
      tr.appendChild(el("td", null, f.done + " of " + A.steps.length));
      A.tapSteps.forEach(function (sc) { tr.appendChild(el("td", null, f.taps[sc.id])); });
      f.marks.forEach(function (m) { tr.appendChild(el("td", null, String(m))); });
      tr.appendChild(el("td", null, f.ch ? String(f.ch) : ""));
      tr.appendChild(el("td", null, f.ican.filter(function (v) { return v; }).length ? f.ican.join(" ") : ""));
      tr.appendChild(el("td", null, f.back ? String(f.back) : ""));
      tr.appendChild(el("td", "tr-muted", f.saved ? f.saved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""));
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    gridBox.appendChild(t);
    detail(A);
  }

  // ------------------------------------------------------------ one pupil's work in one lesson
  function detail(A) {
    if (!detailBox) { return; }
    detailBox.textContent = "";
    if (!picked || !A) { return; }
    var r = rowOf(A.id, picked);
    if (!r) { return; }
    var S = r.state || {};
    var p = who(picked);
    var head = el("div", "tr-detail-head");
    head.appendChild(el("h2", null, (p ? name(p) + " " : "") + "(No. " + picked + "): " + A.short));
    head.appendChild(btn("pr-btn pr-btn-quiet", "Close", function () { picked = null; paint(); }));
    detailBox.appendChild(head);
    A.steps.forEach(function (sc) {
      var lines = [];
      A.items.filter(function (x) { return x.sc === sc; }).forEach(function (x) {
        var b = x.b;
        if (b.type === "write") {
          var txt = ((S.text || {})[x.id] || "").trim();
          if (!txt) { return; }
          var m = (S.marks || {})[x.id];
          lines.push({ q: (x.where === "challenge" ? "Challenge: " : "") + plain(A, b.q), a: txt, m: typeof m === "number" ? m + " / " + b.marks : "" });
        } else if (b.type === "compare") {
          b.rows.forEach(function (rr, i) {
            b.cols.forEach(function (cc, j) {
              var v = ((S.text || {})[x.id + "-" + i + "-" + j] || "").trim();
              if (v) { lines.push({ q: rr + " (" + cc.toLowerCase() + ")", a: v }); }
            });
          });
        } else if (b.type === "predict") {
          var c = (S.choice || {})[x.id];
          if (typeof c === "number") { lines.push({ q: plain(A, (b.kind ? b.kind + ": " : "") + (b.q || "")), a: b.options[c] }); }
        } else if (b.type === "tap" && x.where === "core") {
          var c2 = (S.choice || {})[x.id];
          if (typeof c2 === "number" && c2 !== b.answer) { lines.push({ q: plain(A, b.q), a: b.options[c2] + " (wrong; answer: " + b.options[b.answer] + ")" }); }
        }
      });
      if (!lines.length) { return; }
      var sec = el("div", "tr-detail-step");
      sec.appendChild(el("h3", null, (stepOf(A, sc.id) + 1 - A.off) + ". " + sc.title));
      var dl = el("dl");
      lines.forEach(function (l) {
        dl.appendChild(el("dt", null, l.q));
        var dd = el("dd", null, l.a);
        if (l.m) { dd.appendChild(el("strong", "tr-mark", "  Self-mark: " + l.m)); }
        dl.appendChild(dd);
      });
      sec.appendChild(dl);
      detailBox.appendChild(sec);
    });
    if (detailBox.children.length === 1) { detailBox.appendChild(el("p", "tr-empty", "Nothing typed yet.")); }
  }

  // ------------------------------------------------------------ number list (for telling pupils their number)
  function numberList() {
    stop();
    root.textContent = "";
    var bar = el("div", "tr-tools tr-noprint");
    bar.appendChild(btn("pr-btn", "Back to the class", function () { dashboard(); refresh(); }));
    bar.appendChild(btn("pr-btn pr-btn-quiet", "Print", function () { window.print(); }));
    root.appendChild(bar);
    var wrap = el("div", "tr-numbers");
    teachers().concat(roster.some(function (p) { return !p.teacher; }) ? [""] : []).forEach(function (t) {
      var sec = el("section");
      sec.appendChild(el("h2", null, (t || "No teacher") + ": login numbers"));
      var tbl = el("table", "tr-grid");
      roster.filter(function (p) { return p.teacher === t; }).forEach(function (p) {
        var tr = el("tr");
        tr.appendChild(el("td", "tr-num", p.num));
        tr.appendChild(el("td", null, name(p)));
        tbl.appendChild(tr);
      });
      sec.appendChild(tbl);
      wrap.appendChild(sec);
    });
    root.appendChild(wrap);
  }

  // ------------------------------------------------------------ log-in cards (teacher, 6 Oct): 8 per A4, a class per sheet
  // Built here from the class list, printed from this laptop; nothing is saved or sent.
  function bold(text, into) {
    String(text).split("**").forEach(function (part, i) {
      if (!part) { return; }
      into.appendChild(i % 2 ? el("strong", null, part) : document.createTextNode(part));
    });
    return into;
  }
  function loginCards() {
    stop();
    root.textContent = "";
    var C = CFG.card;
    var bar = el("div", "tr-tools tr-noprint");
    bar.appendChild(btn("pr-btn", "Back to the class", function () { document.body.classList.remove("tr-cards-on"); dashboard(); refresh(); }));
    bar.appendChild(btn("pr-btn pr-btn-main", "Print", function () { window.print(); }));
    bar.appendChild(el("p", "tr-status", "8 cards on each A4 sheet, each class on its own sheets. Cut along the dashed lines."));
    root.appendChild(bar);
    var wrap = el("div", "tr-cards");
    var groups = teachers().concat(roster.some(function (p) { return !p.teacher; }) ? [""] : []);
    if (filter !== "all") { groups = [filter]; }
    groups.forEach(function (t) {
      var g = el("section", "tr-card-group");
      g.setAttribute("aria-label", (t || "No teacher") + ": log-in cards");
      g.appendChild(el("h2", "tr-group-name tr-noprint", (t || "No teacher") + ": log-in cards"));
      roster.filter(function (p) { return p.teacher === t; }).forEach(function (p) {
        var c = el("article", "tr-logincard");
        var top = el("div", "tr-lc-top");
        top.appendChild(el("span", "tr-lc-name", p.first + " " + p.last.charAt(0) + "."));
        top.appendChild(el("span", "tr-lc-topic", C.topic || ""));
        c.appendChild(top);
        var mid = el("div", "tr-lc-mid");
        mid.appendChild(el("span", "tr-lc-label", "Your number"));
        mid.appendChild(el("span", "tr-lc-num", p.num));
        c.appendChild(mid);
        var qr = el("div", "tr-lc-qr");
        qr.innerHTML = C.qr;
        var qs = qr.querySelector("svg");
        if (qs) { qs.setAttribute("role", "img"); qs.setAttribute("aria-label", "QR code for " + C.short); }
        c.appendChild(qr);
        var ol = el("ol", "tr-lc-steps");
        (C.steps || []).forEach(function (st) { ol.appendChild(bold(st, el("li"))); });
        c.appendChild(ol);
        g.appendChild(c);
      });
      wrap.appendChild(g);
    });
    root.appendChild(wrap);
    document.body.classList.add("tr-cards-on");
    say("Log-in cards ready to print: " + roster.length + " cards.");
  }

  // ------------------------------------------------------------ downloads (names are added here, on this laptop)
  function lessonTables(A) {
    var out = [], typed = [];
    people().forEach(function (x) {
      var r = rowOf(A.id, x.num);
      if (!x.p && !r) { return; }
      var f = facts(A, r);
      var o = { "No.": x.num, "Name": x.p ? name(x.p) : "", "Teacher": x.p ? x.p.teacher : "" };
      if (!f.has) { o.Step = "Not started"; out.push(o); return; }
      o.Step = f.stepNo + ". " + f.stepTitle;
      o["Steps done"] = f.done + " of " + A.steps.length;
      A.tapSteps.forEach(function (sc) { o[sc.title.replace(/:.*$/, "") + " (right)"] = f.taps[sc.id]; });
      A.marked.forEach(function (m, i) { o[markLabel(m, i)] = f.marks[i]; });
      o.Challenges = f.ch;
      var k = 0;
      A.rates.forEach(function (rt) { rt.b.items.forEach(function (t) { o["I can " + t] = f.ican[k++]; }); });
      o["Come back to"] = f.back;
      o["Last saved"] = f.saved ? f.saved.toLocaleString() : "";
      out.push(o);
      var S = r.state || {};
      var t2 = { "No.": x.num, "Name": o.Name };
      A.items.forEach(function (it) {
        if (it.b.type === "write") { t2[(it.where === "challenge" ? "Challenge: " : "") + plain(A, it.b.q)] = (S.text || {})[it.id] || ""; }
        if (it.b.type === "compare") {
          it.b.rows.forEach(function (rr, i) { it.b.cols.forEach(function (cc, j) { t2[rr + " (" + cc.toLowerCase() + ")"] = (S.text || {})[it.id + "-" + i + "-" + j] || ""; }); });
        }
      });
      typed.push(t2);
    });
    return { out: out, typed: typed };
  }
  function allTable() {
    return people().map(function (x) {
      var o = { "No.": x.num, "Name": x.p ? name(x.p) : "", "Teacher": x.p ? x.p.teacher : "" };
      (CFG.lessons || []).forEach(function (L) {
        var A = LS[L.id], r = rowOf(L.id, x.num), f = facts(A, r);
        o[L.short || L.title] = !r ? "" : (f.finished ? "all " + f.done + " steps" : f.done + " of " + (A ? A.steps.length : "?") + ", on " + f.stepNo + ". " + f.stepTitle);
      });
      return o;
    });
  }
  function sheetName(s) { return String(s).replace(/[\\\/?*\[\]:]/g, " ").slice(0, 31); }
  function download(kind) {
    if (!window.XLSX) { say("The spreadsheet writer did not load. Check the internet connection."); return; }
    var day = new Date().toISOString().slice(0, 10);
    var A = view === "all" ? null : LS[view];
    var base = (CFG.fileName || "Practical tracking") + (A ? " - " + A.short : "") + " " + day;
    if (kind === "csv") {
      var csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(A ? lessonTables(A).out : allTable()));
      var a = el("a");
      a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
      a.download = base + ".csv";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      return;
    }
    var wb = XLSX.utils.book_new();
    if (!A) { XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allTable()), "All lessons"); }
    (A ? [A] : (CFG.lessons || []).map(function (L) { return LS[L.id]; }).filter(Boolean)).forEach(function (X) {
      var T = lessonTables(X);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(T.out), sheetName(X.short + " progress"));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(T.typed.length ? T.typed : [{ "No.": "" }]), sheetName(X.short + " typed"));
    });
    XLSX.writeFile(wb, base + ".xlsx");
  }

  if (pass) { start(); } else { gate(); }
})();
