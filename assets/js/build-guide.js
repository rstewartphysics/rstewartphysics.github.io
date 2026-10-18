/* ============================================================
   build-guide.js — diagram → breadboard / stripboard build guide.

     <div class="build-guide" data-guide="555-monostable"
          data-prog-badge="…"></div>

   One guide per mount. Its data, /assets/guides/<id>.json, is written by
   tools/build-guides/build-guides.mjs from tools/build-guides/circuits.mjs
   (never edit the JSON). Every board in it was checked with SBD.check at
   build time. Styles: /assets/css/build-guide.css, after the subject sheet.

   Parts: 1 the diagram, built up step by step; 2 the conversion, chip first,
   one net per step; spot the mistake; a quick quiz. The help level comes
   from the data: "diagram" (no board), "worked" (optional "Try each step
   first"), "faded" (the part steps are questions).
   ============================================================ */
(function () {
  "use strict";
  var roots = [].slice.call(document.querySelectorAll(".build-guide[data-guide]"));
  if (!roots.length) { return; }

  var ENGINE = "/assets/js/stripboard.js?v=sbd-20261013a";
  var DATA = "/assets/guides/";
  var STORE = "build-guide-v1";
  var STEP = "#d97706", STEP_INK = "#9a4d05", TRACE = "#1d6fa5";

  var loading = null;
  function engine() {
    if (window.SBD && window.SBD.render) { return Promise.resolve(window.SBD); }
    if (!loading) {
      loading = new Promise(function (ok, fail) {
        var s = document.createElement("script");
        s.src = ENGINE;
        s.onload = function () { ok(window.SBD); };
        s.onerror = fail;
        document.head.appendChild(s);
      });
    }
    return loading;
  }
  function addStyle(R) {
    if (document.getElementById("sbd-style")) { return; }
    var st = document.createElement("style");
    st.id = "sbd-style";
    st.textContent = R.STYLE;
    document.head.appendChild(st);
  }
  function loadPrefs() { try { return JSON.parse(localStorage.getItem(STORE) || "{}") || {}; } catch (e) { return {}; } }
  function savePrefs(p) { try { localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) { /* private mode */ } }

  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };
  var LEVEL = { diagram: "Diagram only", worked: "Worked example", faded: "Some steps yours", yours: "Your turn" };
  var MODE_TEXT = {
    diagram: "Build up the diagram one step at a time. You test this circuit in Yenka and the simulator, not on a board.",
    worked: "Follow each step. For a challenge, try each step yourself first.",
    faded: "On the parts steps, tap where each leg goes before the answer shows.",
    yours: "Tap where each net goes. Open a hint if you are stuck."
  };

  /* the number on a net chip: whichever of dark or white contrasts more with the net colour */
  function inkOn(hex) {
    var v = parseInt(hex.slice(1), 16), lin = function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
    var L = 0.2126 * lin(v >> 16) + 0.7152 * lin((v >> 8) & 255) + 0.0722 * lin(v & 255);
    return (1.05 / (L + 0.05)) >= ((L + 0.05) / 0.0601) ? "#ffffff" : "#1a1a1a";
  }
  function stepOf(x) { return Array.isArray(x) ? x[1] : x.step; }
  function attemptUpTo(ref, k) {
    var num = 0, ok = function (x) { return stepOf(x) <= k; };
    return {
      cuts: ref.cuts.filter(ok).map(function (x) { return x[0]; }),
      placements: ref.placements.filter(ok).map(function (p) { return { id: p.id, footprint: p.footprint, at: p.at, rot: p.rot || 0 }; }),
      links: ref.links.map(function (l) { return { a: l.a, b: l.b, colour: l.colour, num: ++num, step: l.step }; }).filter(ok),
      testpoints: ref.testpoints.filter(ok).map(function (t) { return { id: t.id, at: t.at }; })
    };
  }

  function Guide(root, c, S) {
    var R = S.render, K = c.build, prefs = loadPrefs(), seen = false;
    var parts = [["diagram", "1 · Circuit diagram"]];
    if (K) {
      parts.push(["build", K.isBread ? "2 · Diagram → breadboard" : "2 · Diagram → stripboard"]);
      if (c.mistakes.length) { parts.push(["mistake", "Spot the mistake"]); }
    }
    parts.push(["quiz", "Quick quiz"]);
    var st = { part: "diagram", step: 0, tryFirst: !!prefs.tryFirst, prompts: null, focusNet: 0, focusPin: null, mi: 0, picked: {}, quiz: {} };
    var uid = "bg-" + c.id;
    var unitW = K && K.isBread ? "column" : "track";
    var boardW = K && K.isBread ? "breadboard" : "stripboard";

    function q(sel) { return root.querySelector(sel); }
    function used() {
      if (seen) { return; }
      seen = true;
      var b = root.getAttribute("data-prog-badge");
      if (b && window.Progress && window.Progress.markSeen) { window.Progress.markSeen(b); }
    }

    /* every net keeps one colour everywhere: diagram ring, board band, text chip */
    function netCol(n) { return c.netColours[n - 1]; }
    function netRefs(html) {
      return html.replace(/\bnet (\d+)/g, function (m, d) {
        var col = c.netColours[+d - 1];
        return col ? '<span class="bg-netref" style="border-color:' + col + '">' + m + "</span>" : m;
      });
    }
    function nnChip(n) { var col = netCol(n); return '<span class="bg-nn" style="background:' + col + ";color:" + inkOn(col) + '">' + n + "</span>"; }

    function holesOfStep(ref, k) {
      var out = [], ok = function (x) { return stepOf(x) === k; };
      ref.placements.filter(ok).forEach(function (p) {
        S.cellsOf(S.FOOTPRINTS[p.footprint], S.parseRef(p.at), p.rot || 0).pins.forEach(function (z) { out.push(z.hole); });
      });
      ref.links.filter(ok).forEach(function (l) { out.push(S.parseRef(l.a), S.parseRef(l.b)); });
      ref.testpoints.filter(ok).forEach(function (t) { out.push(S.parseRef(t.at)); });
      ref.cuts.filter(ok).forEach(function (x) { out.push(S.parseRef(x[0])); });
      return out;
    }
    function bandSVG(netNums, focus) {
      var s = "", usedH = {};
      K.used.forEach(function (k) { usedH[k] = 1; });
      netNums.forEach(function (n) {
        var colour = netCol(n), ink = inkOn(colour);
        K.nets[n - 1].forEach(function (node) {
          var hs = K.nodes[node].holes;
          var a = R.centreOf(hs[0][0], hs[0][1], K.board), b = R.centreOf(hs[hs.length - 1][0], hs[hs.length - 1][1], K.board), p = R.P * 0.46;
          s += '<rect x="' + (a.x - p) + '" y="' + (a.y - p) + '" width="' + (b.x - a.x + 2 * p) + '" height="' + (b.y - a.y + 2 * p) + '" rx="' + p +
               '" fill="' + colour + '" fill-opacity="' + (focus ? 0.18 : 0.3) + '" stroke="' + colour + '" stroke-width="' + (focus ? 3.5 : 2.2) + '"' +
               (focus ? ' stroke-dasharray="7 4"' : "") + ' pointer-events="none"/>';
          var free = hs.find(function (h) { return !usedH[h[0] * 1000 + h[1]]; }) || hs[0];
          var f = R.centreOf(free[0], free[1], K.board);
          s += '<g pointer-events="none"><circle cx="' + f.x + '" cy="' + f.y + '" r="9" fill="' + colour + '" stroke="#fff" stroke-width="1.5"/><text x="' + f.x + '" y="' + (f.y + 4) +
               '" text-anchor="middle" font-size="11" font-weight="900" fill="' + ink + '" font-family="Trebuchet MS, sans-serif">' + n + "</text></g>";
        });
      });
      return s;
    }
    function boardSVG(attempt, opts) {
      opts = opts || {};
      var svg = R.renderBoard({ board: K.board, question: K.question, attempt: attempt, marks: opts.marks || [] });
      var extra = bandSVG(opts.bands || [], false) + (opts.focusNet ? bandSVG([opts.focusNet], true) : "");
      svg = svg.replace("</svg>", extra + "</svg>").replace(/ width="[\d.]+" height="[\d.]+"/, "");
      if (K.viewBox) { svg = svg.replace(/viewBox="[^"]+"/, 'viewBox="' + K.viewBox + '"'); }
      return svg.replace("<svg ", '<svg aria-label="' + esc(opts.label || (K.isBread ? "Breadboard" : "Stripboard") + " layout. Tap a hole to find its net.") + '" ');
    }
    function holeFromEvent(svg, e) {
      var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      var p = pt.matrixTransform(svg.getScreenCTM().inverse());
      return R.holeAt(K.board, p.x, p.y);
    }
    function netOfHole(h) {
      var node = K.holeNode[h.r * 1000 + h.c];
      if (node === undefined) { return 0; }
      for (var i = 0; i < K.nets.length; i++) { if (K.nets[i].indexOf(node) >= 0) { return i + 1; } }
      return 0;
    }
    function netWhere(n) { return K.nets[n - 1].map(function (id) { return K.nodes[id].name; }).join("; "); }

    function diagramSVG(o) {
      var d = c.diagram, upto = o.upto == null ? d.groups.length : o.upto, body = "";
      for (var i = 0; i < upto; i++) {
        body += ((o.cur || []).indexOf(i + 1) >= 0 || (o.chipOn && i === 0)) ? '<g class="bg-cur">' + d.groups[i] + "</g>" : "<g>" + d.groups[i] + "</g>";
      }
      if (o.rings) {
        d.netPos.forEach(function (p, i) {
          var n = i + 1;
          if (Array.isArray(o.rings) && o.rings.indexOf(n) < 0) { return; }
          var col = c.netColours[i], ink = inkOn(col), on = (o.on || []).indexOf(n) >= 0, foc = o.focus === n;
          body += '<g class="bg-ring" data-net="' + n + '" role="button" tabindex="0" aria-label="Net ' + n + '">' +
                  '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="13" fill="transparent"/>' +
                  (on ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="12.5" fill="none" stroke="' + col + '" stroke-width="2.5"/>' : "") +
                  (foc ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="13" fill="none" stroke="' + col + '" stroke-width="2.5" stroke-dasharray="4 3"/>' : "") +
                  '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="8.5" fill="' + col + '" stroke="#fff" stroke-width="1.2"/>' +
                  '<text x="' + p[0] + '" y="' + (p[1] + 3.6) + '" text-anchor="middle" font-size="10.5" font-weight="900" fill="' + ink + '" font-family="Trebuchet MS, sans-serif">' + n + "</text></g>";
        });
      }
      if (o.curPin && d.pins[o.curPin]) {
        var cp = d.pins[o.curPin];
        body += '<circle cx="' + cp[0] + '" cy="' + cp[1] + '" r="9" fill="' + STEP + '" fill-opacity="0.25" stroke="' + STEP + '" stroke-width="2.5"/>';
      }
      if (o.pin && d.pins[o.pin]) {
        var pp = d.pins[o.pin];
        body += '<circle cx="' + pp[0] + '" cy="' + pp[1] + '" r="10" fill="none" stroke="' + TRACE + '" stroke-width="3"/>';
      }
      return '<svg viewBox="0 0 ' + d.w + " " + d.h + '" role="img" aria-label="' + esc(c.short) + ' circuit diagram">' + body + "</svg>";
    }

    function promptsFor(s) {
      if (!s.prompts.length) { return null; }
      if (c.mode === "worked" && !st.tryFirst) { return null; }
      if (c.mode === "faded") {
        if (s.type === "chip") { return null; }
        var list = s.prompts.filter(function (p) { return p.part || !s.pin; });
        return list.length ? list : null;
      }
      return s.prompts.slice();
    }

    function renderTop() {
      var tabs = parts.map(function (p) {
        return '<button type="button" role="tab" data-part="' + p[0] + '" aria-selected="' + (p[0] === st.part) + '">' + p[1] + "</button>";
      }).join("");
      var mode = '<span class="bg-level bg-' + c.mode + '">' + LEVEL[c.mode] + "</span><span>" + MODE_TEXT[c.mode] + "</span>" +
        (c.mode === "worked" && st.part === "build" ?
          '<label class="bg-toggle"><input type="checkbox" data-act="tryFirst"' + (st.tryFirst ? " checked" : "") + "> Try each step first</label>" : "");
      return '<div class="bg-parts" role="tablist" aria-label="' + esc(c.short) + ' guide parts">' + tabs + '</div><div class="bg-mode">' + mode + "</div>";
    }

    function stepHead(n, total, title) {
      var dots = "";
      for (var i = 0; i < total; i++) {
        dots += '<button type="button" data-go="' + i + '" aria-label="Step ' + (i + 1) + '"' + (i === n ? ' aria-current="step"' : "") + ">" + (i + 1) + "</button>";
      }
      return '<div class="bg-stephead"><h3><span class="bg-n">' + (n + 1) + "</span>" + esc(title) + "</h3>" +
        '<div class="bg-nav"><button type="button" class="bg-go" data-step="-1"' + (n === 0 ? " disabled" : "") + ">◀ Back</button>" +
        '<div class="bg-dots">' + dots + "</div>" +
        '<button type="button" class="bg-go primary" data-step="1"' + (n === total - 1 ? " disabled" : "") + ">Next ▶</button></div></div>";
    }

    function renderDiagramPart() {
      var n = st.step, s = c.steps[n];
      return stepHead(n, c.steps.length, s.title) +
        '<div class="bg-stage solo"><div class="bg-col"><div class="bg-card"><p class="bg-lead">' + s.circuit + "</p>" +
        '<p class="bg-small">Orange shows what this step adds. Every part has an ID (R1, C1, IC1) that the layout will use.</p></div></div>' +
        '<div class="bg-col"><div class="bg-fig">' + diagramSVG({ upto: n + 1, cur: [n + 1] }) + "</div></div></div>";
    }

    function renderBuild() {
      var steps = K.seq, n = Math.min(st.step, steps.length - 1), s = steps[n];
      if (!st.prompts || st.prompts.key !== n + "") {
        var list = promptsFor(s);
        st.prompts = { key: n + "", list: list, i: 0, done: [], fb: null, revealed: !list };
      }
      var P = st.prompts, revealed = P.revealed;
      var k = s.type === "check" ? 99 : n;
      var boardK = revealed ? k : Math.max(0, k - 1);
      var att = attemptUpTo(K.reference, boardK);
      if (!revealed && P.list[P.i].pin) {
        var full = attemptUpTo(K.reference, 0);
        att.placements = full.placements; att.cuts = full.cuts; boardK = 0;
      }
      st.boardK = boardK;
      var marks = revealed && k < 99 ? holesOfStep(K.reference, k).map(function (h) { return { r: h.r, c: h.c, kind: "hl" }; }) : [];
      if (st.focusPin && K.pinHoles["IC1." + st.focusPin]) {
        var ph = K.pinHoles["IC1." + st.focusPin]; marks.push({ r: ph[0], c: ph[1], kind: "hl2" });
      }
      var bandNets = s.type === "net" ? (revealed ? [s.net] : P.done.filter(function (x) { return x; })) : [];
      var board = boardSVG(att, { marks: marks, bands: bandNets, focusNet: st.focusNet });

      /* the nets numbered so far, in the order the pupil met them */
      var upto = s.type === "net" ? K.order.indexOf(s.net) + (revealed ? 1 : 0) : (s.type === "chip" ? 0 : K.order.length);
      var shown = K.order.slice(0, upto);
      if (s.type === "net" && !revealed && P.list[P.i].part) { shown = K.order.slice(0, K.order.indexOf(s.net) + 1); }
      var dia = diagramSVG({ rings: shown, on: s.type === "net" && shown.indexOf(s.net) >= 0 ? [s.net] : [],
        focus: st.focusNet, pin: st.focusPin, curPin: s.pin, chipOn: s.type === "chip" });

      var hideHow = c.mode === "yours" && !revealed;
      var ask = "";
      var text = '<div class="bg-card"><p class="bg-lead">' + netRefs(s.lead) + "</p>" +
        (hideHow ? '<details class="bg-hint"><summary>Hint</summary><p class="bg-how">' + netRefs(s.how) + "</p></details>" : '<p class="bg-how">' + netRefs(s.how) + "</p>");
      if (revealed && s.items.length) { text += '<ul class="bg-items">' + s.items.map(function (t) { return "<li>" + netRefs(esc(t)) + "</li>"; }).join("") + "</ul>"; }
      text += "</div>";

      if (!revealed) {
        var pr = P.list[P.i], qq;
        if (pr.pin) { qq = '<p class="bg-q">' + esc(pr.text) + "</p>"; }
        else if (pr.part) { qq = '<p class="bg-q">' + nnChip(pr.net) + esc(pr.text) + "</p>"; }
        else {
          qq = '<p class="bg-q">' + nnChip(pr.net) + (s.pin ? "Pin " + s.pin + " is on net " + pr.net + ". Tap any hole in the " + unitW + " net " + pr.net + " goes in."
            : "Net " + pr.net + " joins " + esc(c.netParts[pr.net - 1].join(", ")) + ". Tap the " + unitW + " you would give it.") + "</p>";
        }
        ask = '<div class="bg-ask" aria-live="polite">' + qq + '<p class="bg-small">Question ' + (P.i + 1) + " of " + P.list.length + ". The answer shows when you get it.</p>" +
          (P.fb ? '<div class="bg-fb ' + P.fb[0] + '">' + P.fb[1] + "</div>" : "") +
          '<div class="bg-btnrow"><button type="button" class="bg-btn" data-act="showMe">Show me</button></div></div>';
      } else if (P.fb) {
        ask = '<div class="bg-fb ' + P.fb[0] + '" aria-live="polite">' + P.fb[1] + "</div>";
      }
      if (s.type === "check") { text += netTable(); }

      var traceTxt = st.focusNet ? nnChip(st.focusNet) + " Net " + st.focusNet + ": " + esc(c.netParts[st.focusNet - 1].join(", ")) +
        " <b>→ " + esc(netWhere(st.focusNet)) + "</b>" : "Tap a net number on the diagram, or a hole on the board, to see the same net in both.";
      var pinTxt = "";
      if (st.focusPin) {
        var ph2 = K.pinHoles["IC1." + st.focusPin], drawn = !!c.diagram.pins[st.focusPin];
        pinTxt = "<b>Pin " + st.focusPin + ": " + esc(c.pinNames[st.focusPin]) + ".</b> " +
          (drawn ? "Ringed on the diagram. " : "Not drawn on the diagram, because it isn't used. ") +
          "On the board it is hole " + esc(S.holeName(S.BOARDS[K.board], { r: ph2[0], c: ph2[1] })) + ".";
      }
      var tools = '<div class="bg-card bg-trace"><p>' + traceTxt + '</p><p class="bg-small">Find a pin of the ' + esc(c.chip) +
        ": the symbol's pin order is not the chip's.</p><div class=\"bg-pins\" role=\"group\" aria-label=\"" + esc(c.chip) + ' pins">' +
        [1, 2, 3, 4, 5, 6, 7, 8].map(function (p) { return '<button type="button" data-pin="' + p + '" aria-pressed="' + (String(st.focusPin) === String(p)) + '">' + p + "</button>"; }).join("") +
        "</div>" + (pinTxt ? "<p>" + pinTxt + "</p>" : "") + "</div>";

      return stepHead(n, steps.length, s.title) +
        '<div class="bg-stage"><div class="bg-col">' + ask + '<div class="bg-fig">' + dia +
        '<p class="bg-cap">Circuit diagram' + (shown.length ? ", nets numbered so far" : "") + "</p></div>" + text + "</div>" +
        '<div class="bg-col"><div class="bg-fig bg-board" data-board-tap>' + board + '<p class="bg-cap">' + (K.isBread ? "Breadboard, half size (400 holes)" : "Stripboard, tracks run across") +
        (revealed ? "" : " · tap the board to answer") + "</p></div>" + tools + "</div></div>";
    }

    function netTable() {
      var rows = c.target.map(function (_, i) {
        var n = i + 1;
        return "<tr><td>" + nnChip(n) + "</td><td>" + esc(c.netParts[i].join(", ")) + '</td><td data-net-cell="' + n + '"><input id="' + uid + "-nt-" + n +
          '" aria-label="Net ' + n + " " + unitW + '" autocomplete="off" placeholder="' + (K.isBread ? "e.g. 12 or +" : "e.g. G") + '"></td></tr>';
      }).join("");
      return '<div class="bg-card"><p class="bg-lead">Fill in the net table</p><p class="bg-small">For each net, write its ' + (K.isBread ? "column number(s), or + or − for a rail" : "track letter(s)") +
        ". Separate two with a comma.</p><div class=\"bg-tblwrap\"><table class=\"bg-nt\"><thead><tr><th>Net</th><th>What's in it</th><th>" + (K.isBread ? "Column" : "Track") + "</th></tr></thead><tbody>" + rows +
        '</tbody></table></div><div class="bg-btnrow"><button type="button" class="bg-btn primary" data-act="ntCheck">Check my table</button><button type="button" class="bg-btn" data-act="ntShow">Show answers</button></div><p class="bg-fb" data-nt-fb hidden aria-live="polite"></p></div>';
    }
    function tokensOf(n) {
      var set = {};
      K.nets[n - 1].forEach(function (id) { set[K.nodes[id].token] = 1; });
      return Object.keys(set);
    }
    function checkTable(show) {
      var right = 0;
      c.target.forEach(function (_, i) {
        var n = i + 1, td = q('td[data-net-cell="' + n + '"]'), inp = td.querySelector("input"), want = tokensOf(n);
        if (show) { inp.value = want.join(", "); td.className = "ok"; right++; return; }
        var got = inp.value.toUpperCase().replace(/-/g, "−").split(/[^A-Z0-9+−]+/).filter(Boolean);
        var uniq = got.filter(function (v, j) { return got.indexOf(v) === j; });
        var ok = uniq.length === want.length && uniq.every(function (t) { return want.indexOf(t) >= 0; });
        td.className = ok ? "ok" : "no"; if (ok) { right++; }
      });
      var fb = q("[data-nt-fb]"); fb.hidden = false;
      fb.className = "bg-fb " + (right === c.target.length ? "good" : "bad");
      fb.textContent = show ? "Answers filled in. Compare them with the board." :
        right === c.target.length ? "Right. Every net is accounted for." : right + " of " + c.target.length + " right. A red row is missing a " + unitW + " or has one that belongs to another net.";
    }

    function boardTap(h) {
      if (!h) { return; }
      var s = K.seq[Math.min(st.step, K.seq.length - 1)], P = st.prompts;
      if (P && !P.revealed) {
        var pr = P.list[P.i], got = netOfHole(h);
        var netOnBoard = function (m) { return P.done.indexOf(m) >= 0 || K.order.indexOf(m) < K.order.indexOf(s.net); };
        if (pr.pin) {
          var want = K.pinHoles["IC1." + pr.pin];
          if (want[0] === h.r && want[1] === h.c) { P.fb = ["good", "Right. That's pin " + pr.pin + ": " + c.pinNames[pr.pin] + "."]; advance(); }
          else {
            var other = Object.keys(K.pinHoles).find(function (x) { return x.indexOf("IC1.") === 0 && K.pinHoles[x][0] === h.r && K.pinHoles[x][1] === h.c; });
            P.fb = ["bad", (other ? "That's pin " + other.slice(4) + " (" + c.pinNames[other.slice(4)] + "). " : "Tap one of the chip's legs. ") +
              (K.isBread ? "With the notch on the left, pin 1 is bottom left. Count along the bottom row, then back along the top." : "With the notch at the top, pin 1 is top left. Count down the left side, then up the right.")];
          }
          return render();
        }
        if (pr.part) {
          if (got === pr.net) { P.fb = ["good", "Right. " + pr.part + "'s other leg goes on net " + pr.net + ": " + netWhere(pr.net) + "."]; advance(); }
          else if (got) { P.fb = ["bad", "That's net " + got + " (" + c.netParts[got - 1].join(", ") + "). Find net " + pr.net + " on the diagram first, then its " + unitW + "."]; }
          else { P.fb = ["bad", "Nothing is joined there. Net " + pr.net + " is already on the board: find its " + unitW + "."]; }
          return render();
        }
        var n = pr.net;
        if (got === n) { P.fb = ["good", "Right. Net " + n + " → " + netWhere(n) + "."]; advance(); }
        else if (got && netOnBoard(got)) { P.fb = ["bad", "That " + unitW + " is net " + got + " (" + c.netParts[got - 1].join(", ") + "). Different numbers never share a " + unitW + "."]; }
        else if (s.pin) { P.fb = ["bad", "Pin " + s.pin + " is on net " + n + ", so net " + n + " goes in the " + unitW + " pin " + s.pin + " is in. Use the pin buttons if you can't find it."]; }
        else { P.fb = ["fair", "A fair choice: that " + unitW + " is free, so net " + n + " could go there. This guide uses " + netWhere(n) + " so the parts fit. Your own plan can differ."]; advance(); }
        return render();
      }
      var net = netOfHole(h);
      st.focusNet = st.focusNet === net ? 0 : net;
      render();
    }
    function advance() {
      var P = st.prompts, pr = P.list[P.i];
      if (pr.net && !pr.part) { P.done.push(pr.net); }
      P.i++;
      if (P.i >= P.list.length) { P.revealed = true; }
    }

    function renderMistake() {
      var m = c.mistakes[st.mi], pick = st.picked[st.mi];
      var solved = pick != null && m.options[pick].ok;
      var marks = solved ? m.focus.map(function (h) { return { r: h[0], c: h[1], kind: "hl" }; }) : [];
      var board = boardSVG(m.attempt, { marks: marks, label: m.title + ": a " + boardW + " with one mistake on it." });
      var tabs = c.mistakes.map(function (x, i) { return '<button type="button" class="bg-btn' + (i === st.mi ? " primary" : "") + '" data-mi="' + i + '" aria-pressed="' + (i === st.mi) + '">' + esc(x.title) + "</button>"; }).join("");
      var opts = m.options.map(function (o, i) {
        var cls = pick === i ? (o.ok ? " right" : " wrong") : (solved && o.ok ? " right" : "");
        return '<button type="button" class="bg-opt' + cls + '" data-opt="' + i + '">' + o.t + "</button>";
      }).join("");
      var fb = pick == null ? "" : '<div class="bg-fb ' + (m.options[pick].ok ? "good" : "bad") + '" aria-live="polite">' + (m.options[pick].ok ? m.why : m.options[pick].fb) + "</div>";
      return '<div class="bg-stephead"><h3>Spot the mistake</h3><div class="bg-btnrow" role="group" aria-label="Faulty boards">' + tabs + "</div></div>" +
        '<div class="bg-stage"><div class="bg-col"><div class="bg-fig">' + diagramSVG({ rings: true }) + '<p class="bg-cap">The circuit it should be</p></div>' +
        '<div class="bg-card"><p class="bg-lead">One thing is wrong on this ' + boardW + ". What is it?</p><div class=\"bg-opts\">" + opts + "</div>" + fb + "</div></div>" +
        '<div class="bg-col"><div class="bg-fig bg-board">' + board + '<p class="bg-cap">' + esc(m.title) + (solved ? " · the mistake is ringed" : "") + "</p></div></div></div>";
    }

    function renderQuiz() {
      var first = 0, answered = 0;
      var html = c.quiz.map(function (qz, qi) {
        var a = st.quiz[qi] || { picks: [] };
        if (a.picks.length) { answered++; if (qz.o[a.picks[0]][1]) { first++; } }
        var last = a.picks[a.picks.length - 1];
        return '<div class="bg-card bg-qcard"><p class="bg-lead">' + (qi + 1) + ". " + qz.q + '</p><div class="bg-opts">' + qz.o.map(function (o, i) {
          var cls = a.picks.indexOf(i) >= 0 ? (o[1] ? " right" : " wrong") : "";
          return '<button type="button" class="bg-opt' + cls + '" data-q="' + qi + '" data-o="' + i + '">' + o[0] + "</button>";
        }).join("") + "</div>" + (last != null ? '<div class="bg-fb ' + (qz.o[last][1] ? "good" : "bad") + '" aria-live="polite">' + qz.o[last][2] + "</div>" : "") + "</div>";
      }).join("");
      return '<div class="bg-stephead"><h3>Quick quiz: ' + esc(c.short) + "</h3></div>" + html +
        (answered ? '<p class="bg-score" aria-live="polite">First tries right: ' + first + " of " + answered + "</p>" : "");
    }

    function render() {
      var keep = document.activeElement && root.contains(document.activeElement) ? focusKey(document.activeElement) : null;
      var main = st.part === "diagram" ? renderDiagramPart() : st.part === "build" ? renderBuild() : st.part === "mistake" ? renderMistake() : renderQuiz();
      root.innerHTML = renderTop() + '<div class="bg-main">' + main + "</div>";
      var svg = q("[data-board-tap] svg");
      if (svg) { svg.addEventListener("click", function (e) { used(); boardTap(holeFromEvent(svg, e)); }); }
      if (keep) {
        var el = q(keep);
        if (el && !el.disabled) { el.focus({ preventScroll: true }); }
      }
    }
    /* innerHTML replaces the button that was pressed; put focus back on its twin */
    function focusKey(el) {
      var attrs = ["data-part", "data-step", "data-go", "data-pin", "data-mi", "data-opt", "data-q", "data-act", "data-net"];
      for (var i = 0; i < attrs.length; i++) {
        var v = el.getAttribute(attrs[i]);
        if (v != null) {
          var sel = "[" + attrs[i] + '="' + v + '"]';
          if (attrs[i] === "data-q") { sel += '[data-o="' + el.getAttribute("data-o") + '"]'; }
          return sel;
        }
      }
      return null;
    }

    root.addEventListener("click", function (e) {
      var t = e.target.closest("button, .bg-ring");
      if (!t || !root.contains(t)) { return; }
      var d = t.dataset;
      used();
      if (d.part) { st.part = d.part; st.step = 0; st.prompts = null; st.focusNet = 0; st.focusPin = null; return render(); }
      if (d.step) { st.step += +d.step; st.prompts = null; return render(); }
      if (d.go != null) { st.step = +d.go; st.prompts = null; return render(); }
      if (d.net) { var n = +d.net; st.focusNet = st.focusNet === n ? 0 : n; return render(); }
      if (d.pin) { st.focusPin = String(st.focusPin) === d.pin ? null : d.pin; return render(); }
      if (d.act === "showMe") { st.prompts.revealed = true; st.prompts.fb = ["fair", "Here is the answer. Match the lit " + unitW + " to its number on the diagram."]; return render(); }
      if (d.act === "ntCheck") { return checkTable(false); }
      if (d.act === "ntShow") { return checkTable(true); }
      if (d.mi != null) { st.mi = +d.mi; return render(); }
      if (d.opt != null) { st.picked[st.mi] = +d.opt; return render(); }
      if (d.q != null) {
        var a = st.quiz[d.q] || { picks: [] }, o = +d.o;
        if (a.picks.indexOf(o) < 0) { a.picks.push(o); }
        st.quiz[d.q] = a;
        return render();
      }
    });
    root.addEventListener("keydown", function (e) {
      var ring = e.target.closest && e.target.closest(".bg-ring");
      if (ring && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); ring.dispatchEvent(new MouseEvent("click", { bubbles: true })); return; }
      if (e.target.tagName === "INPUT") { return; }
      if ((st.part === "diagram" || st.part === "build") && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        var b = q('.bg-nav [data-step="' + (e.key === "ArrowRight" ? 1 : -1) + '"]');
        if (b && !b.disabled) { b.click(); }
      }
    });
    root.addEventListener("change", function (e) {
      if (e.target.getAttribute("data-act") === "tryFirst") {
        st.tryFirst = e.target.checked; st.prompts = null;
        prefs.tryFirst = st.tryFirst; savePrefs(prefs);
        render();
      }
    });
    render();
    root.setAttribute("data-guide-ready", "");
  }

  function mount(root) {
    var id = root.getAttribute("data-guide");
    root.setAttribute("aria-busy", "true");
    Promise.all([engine(), fetch(DATA + encodeURIComponent(id) + ".json").then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.json(); })])
      .then(function (res) {
        addStyle(res[0].render);
        root.removeAttribute("aria-busy");
        Guide(root, res[1], res[0]);
      })
      .catch(function () {
        root.removeAttribute("aria-busy");
        root.innerHTML = '<p class="bg-fb bad">The build guide did not load. Refresh the page to try again.</p>';
      });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); mount(en.target); } });
    }, { rootMargin: "600px 0px" });
    roots.forEach(function (r) { io.observe(r); });
  } else {
    roots.forEach(mount);
  }
})();
