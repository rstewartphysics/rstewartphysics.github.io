/* ============================================================
   board-figure.js — a stripboard layout drawn by the site's own engine.

     <figure class="board-fig">
       <div data-board="/assets/boards/555-astable.json" data-crop="A1:V24"
            data-label="The 555 astable on stripboard: …"></div>
       <figcaption>…</figcaption>
     </figure>

   The layout file is a Planner question record (board, components,
   target netlist, reference layout).  The engine, assets/js/stripboard.js,
   is only fetched when a board comes near the screen.  Before drawing,
   the layout is checked against its own netlist with SBD.check; a layout
   that fails is still drawn but marked data-board-ok="no", which
   scripts/sim-check.mjs reports, so a wrong board never ships quietly.
   data-crop trims the drawing to the holes the layout uses.
   ============================================================ */
(function () {
  "use strict";
  var els = [].slice.call(document.querySelectorAll("[data-board]"));
  if (!els.length) { return; }

  var ENGINE = "/assets/js/stripboard.js?v=sbd-20261013a";
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

  // "A1:V24" -> the viewBox round those holes, with room for the row letters
  // and column numbers the renderer prints along the top and left
  function crop(R, board, spec) {
    var m = /^([A-Z])(\d+):([A-Z])(\d+)$/.exec(spec || "");
    if (!m) { return null; }
    var r1 = m[3].charCodeAt(0) - 65, c1 = +m[4];
    var far = R.centreOf(r1, c1, board);
    return "0 0 " + Math.ceil(far.x + R.P / 2 + 6) + " " + Math.ceil(far.y + R.P / 2 + 6);
  }

  function draw(el) {
    el.removeAttribute("data-board-pending");
    Promise.all([engine(), fetch(el.getAttribute("data-board")).then(function (r) { return r.json(); })])
      .then(function (res) {
        var S = res[0], q = res[1], R = S.render;
        var result = S.check(q, q.reference);
        el.setAttribute("data-board-ok", result.ok ? "yes" : "no");
        if (!result.ok && window.console) {
          console.error("board-figure: " + q.id + " does not match its netlist", result.faults);
        }
        addStyle(R);
        el.innerHTML = R.renderBoard({ board: q.board, question: q, attempt: q.reference });
        var svg = el.querySelector("svg");
        if (!svg) { return; }
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        var vb = crop(R, q.board, el.getAttribute("data-crop"));
        if (vb) { svg.setAttribute("viewBox", vb); }
        svg.setAttribute("role", "img");
        var t = svg.querySelector("title");
        if (t) { svg.removeChild(t); }
        svg.setAttribute("aria-label", el.getAttribute("data-label") || q.title || "Stripboard layout");
      })
      .catch(function () {
        el.setAttribute("data-board-ok", "error");
        el.textContent = "The board drawing could not load. The parts list beside it gives every connection.";
      });
  }

  els.forEach(function (el) { el.setAttribute("data-board-pending", ""); });
  if (!("IntersectionObserver" in window)) { els.forEach(draw); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { io.unobserve(en.target); draw(en.target); }
    });
  }, { rootMargin: "800px 0px" });
  els.forEach(function (el) { io.observe(el); });
})();
