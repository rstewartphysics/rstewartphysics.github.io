/* ============================================================
   ah-lab.js — AH lab pages (with /assets/css/ah-lab.css).
   The page holds one <script type="application/json" id="labData">:
     { id, fixed: { key, label, values[] }, cols: [{ key, label }],
       extra: [{ key, label }], graph: { x, y, plot: [keys], runs: [names], title } }
   Readings and ticks are kept on this device only (localStorage "ahlab-<id>-v1"); nothing is
   sent anywhere. The live graph plots the raw readings, never a worked-out quantity: the pupil
   still does the analysis. Runs are nudged apart sideways so equal readings stay visible.
   ============================================================ */
(function () {
  "use strict";

  var dataEl = document.getElementById("labData");
  if (!dataEl) { return; }
  var CFG = JSON.parse(dataEl.textContent);
  var KEY = "ahlab-" + CFG.id + "-v1";
  var page = document.querySelector(".lab-page") || document.body;
  var status = document.getElementById("labStatus");

  var store = {};
  try { store = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { store = {}; }
  store.cells = store.cells || {};
  store.ticks = store.ticks || {};

  var saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* private mode */ }
    }, 250);
  }
  function say(msg) { if (status) { status.textContent = msg; } }

  function plain(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    return d.textContent.replace(/\s+/g, " ").trim();
  }
  function parseNum(v) {
    var s = String(v || "").trim().replace(",", ".").replace("−", "-");
    if (!s) { return null; }
    var n = Number(s);
    return isFinite(n) ? n : NaN;
  }

  /* ---------- results table ---------- */
  var table = document.getElementById("labTable");
  var inputs = {};
  function cellKey(row, col) { return row + "|" + col; }

  function buildTable() {
    var thead = document.createElement("thead"), hr = document.createElement("tr");
    var th = document.createElement("th");
    th.scope = "col";
    th.innerHTML = CFG.fixed.label;
    hr.appendChild(th);
    CFG.cols.forEach(function (c) {
      var h = document.createElement("th");
      h.scope = "col";
      h.innerHTML = c.label;
      hr.appendChild(h);
    });
    thead.appendChild(hr);
    var tbody = document.createElement("tbody");
    CFG.fixed.values.forEach(function (v, r) {
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      td.className = "fixed";
      td.textContent = v;
      tr.appendChild(td);
      CFG.cols.forEach(function (c) {
        var cell = document.createElement("td"), inp = document.createElement("input");
        inp.type = "text";
        inp.inputMode = "decimal";
        inp.autocomplete = "off";
        inp.spellcheck = false;
        inp.setAttribute("aria-label", plain(c.label) + " at " + plain(CFG.fixed.label)
          .replace(/\s*\(.*\)/, "") + " = " + v + " " + (CFG.fixed.unit || ""));
        var k = cellKey(r, c.key);
        inp.value = store.cells[k] || "";
        inp.addEventListener("input", function () {
          store.cells[k] = inp.value;
          mark(inp);
          save();
          if (CFG.graph && CFG.graph.plot.indexOf(c.key) >= 0) { drawGraph(); }
        });
        inputs[k] = inp;
        mark(inp);
        cell.appendChild(inp);
        tr.appendChild(cell);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
  }
  function mark(inp) {
    var n = parseNum(inp.value);
    inp.classList.toggle("bad", n !== null && isNaN(n));
    if (n !== null && isNaN(n)) { inp.setAttribute("aria-invalid", "true"); }
    else { inp.removeAttribute("aria-invalid"); }
  }

  /* ---------- single extra fields (e.g. l and its uncertainty) ---------- */
  page.querySelectorAll("input[data-lab-extra]").forEach(function (inp) {
    var k = "x|" + inp.getAttribute("data-lab-extra");
    inp.value = store.cells[k] || "";
    inp.addEventListener("input", function () { store.cells[k] = inp.value; save(); });
  });

  /* ---------- tick boxes ---------- */
  page.querySelectorAll("input[type=checkbox][data-tick]").forEach(function (cb) {
    var k = cb.getAttribute("data-tick");
    cb.checked = !!store.ticks[k];
    cb.addEventListener("change", function () { store.ticks[k] = cb.checked; save(); });
  });

  /* ---------- live graph of the raw readings ---------- */
  var graph = null, gsvg = document.getElementById("labGraph");
  function drawGraph() {
    if (!graph || !CFG.graph) { return; }
    var G = CFG.graph, ymax = 0, ymin = 0, count = 0;
    CFG.fixed.values.forEach(function (v, r) {
      G.plot.forEach(function (key) {
        var n = parseNum(store.cells[cellKey(r, key)]);
        if (n !== null && !isNaN(n)) { ymax = Math.max(ymax, n); ymin = Math.min(ymin, n); }
      });
    });
    var hi = ymax > 0 ? niceCeil(ymax * 1.1) : (ymin < 0 ? 0 : G.y.max);
    var lo = ymin < 0 ? -niceCeil(-ymin * 1.1) : 0;
    graph.setY({ min: lo, max: hi });
    CFG.fixed.values.forEach(function (v, r) {
      G.plot.forEach(function (key, i) {
        var name = "p" + r + "-" + i, n = parseNum(store.cells[cellKey(r, key)]);
        if (n !== null && !isNaN(n)) {
          graph.marker(name, Number(v) + (i - 1) * G.x.step * 0.12, n, { cls: "kg-c" + (i + 1) });
          count++;
        } else {
          graph.remove(name);
        }
      });
    });
    graph.describe(count ? count + " readings plotted." : "No readings yet.");
  }
  function niceCeil(x) {
    var mag = Math.pow(10, Math.floor(Math.log10(x))), f = x / mag;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
  }

  /* ---------- buttons ---------- */
  function tsv() {
    var head = [plain(CFG.fixed.label)].concat(CFG.cols.map(function (c) { return plain(c.label); }));
    var rows = [head.join("\t")];
    CFG.fixed.values.forEach(function (v, r) {
      rows.push([v].concat(CFG.cols.map(function (c) {
        return (store.cells[cellKey(r, c.key)] || "").trim();
      })).join("\t"));
    });
    (CFG.extra || []).forEach(function (x) {
      rows.push(plain(x.label) + "\t" + (store.cells["x|" + x.key] || "").trim());
    });
    return rows.join("\n");
  }
  var copyBtn = document.getElementById("labCopy");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = tsv();
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        say(ok ? "Copied. Paste it into cell A1 in Excel." : "Copy did not work on this device.");
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          say("Copied. Paste it into cell A1 in Excel.");
        }, fallback);
      } else { fallback(); }
    });
  }
  var clearBtn = document.getElementById("labClear"), armTimer = null;
  if (clearBtn) {
    var idle = clearBtn.textContent;
    clearBtn.addEventListener("click", function () {
      if (!clearBtn.classList.contains("armed")) {
        clearBtn.classList.add("armed");
        clearBtn.textContent = "Tap again to clear";
        armTimer = setTimeout(function () { clearBtn.classList.remove("armed"); clearBtn.textContent = idle; }, 4000);
        return;
      }
      clearTimeout(armTimer);
      clearBtn.classList.remove("armed");
      clearBtn.textContent = idle;
      store.cells = {};
      Object.keys(inputs).forEach(function (k) { inputs[k].value = ""; mark(inputs[k]); });
      page.querySelectorAll("input[data-lab-extra]").forEach(function (inp) { inp.value = ""; });
      save();
      drawGraph();
      say("Table cleared.");
    });
  }

  buildTable();
  if (gsvg && CFG.graph && window.WidgetKit) {
    graph = window.WidgetKit.graph(gsvg, {
      x: CFG.graph.x, y: CFG.graph.y, title: CFG.graph.title,
      layouts: [{ maxWidth: 520, w: 310, h: 280, m: { l: 52, r: 10 } }, { w: 640, h: 320 }]
    });
    drawGraph();
  }
})();
