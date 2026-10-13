/* ============================================================
   widget-kit.js  ·  window.WidgetKit
   Small, dependency-free interaction helpers shared by the
   interactive S3 Physics / Engineering pages. This is *widget*
   plumbing only — it never touches the progress engine or its
   storage key. Pages supply their own markup + render()/validate()
   callbacks; the kit handles input-syncing, tap/drag placement and
   predict-then-reveal flow, plus accessibility + reduced-motion.

   API:
     WidgetKit.reducedMotion()            -> boolean (live)
     WidgetKit.liveSim(root, opts)        -> { state, refresh, set, destroy }
     WidgetKit.dragPlace(root, opts)      -> { state, reset, check, destroy }
     WidgetKit.poeCard(root, opts)        -> { choice, reset }
     WidgetKit.graph(svg, opts)           -> live axes + series
     WidgetKit.clock(opts)                -> play/pause animation loop
     WidgetKit.fmt(x, sf), .si(x, unit)   -> readout text
     WidgetKit.svgLabel(textEl, "<i>V</i><sub>2</sub> = 3 V") -> SVG label with
                                          italic symbols and real subscripts
   ============================================================ */
(function (win, doc) {
  "use strict";

  var mq = win.matchMedia ? win.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function reducedMotion() { return !!(mq && mq.matches); }

  function rafThrottle(fn) {
    var queued = false, lastArgs = null;
    return function () {
      lastArgs = arguments;
      if (queued) { return; }
      queued = true;
      win.requestAnimationFrame(function () {
        queued = false;
        fn.apply(null, lastArgs);
      });
    };
  }

  function num(v, fallback) {
    var n = parseFloat(v);
    return isNaN(n) ? (fallback === undefined ? 0 : fallback) : n;
  }

  /* ---------------------------------------------------------
     Scaled sliders.  A range input may carry data-scale="log" or
     data-scale="near" with data-min / data-max (the VALUE range);
     its own min/max are then just the slider's travel.  "log" gives
     each decade the same travel (1 kΩ … 470 kΩ); "near" packs the
     travel towards data-limit (default 1), so 0.99, 0.995 and 0.999
     of c are all reachable.  Values snap to data-step.
  --------------------------------------------------------- */
  function scaleOf(el) {
    if (!el || el.type !== "range") { return null; }
    var kind = el.getAttribute("data-scale");
    if (kind !== "log" && kind !== "near") { return null; }
    return {
      kind: kind,
      min: num(el.getAttribute("data-min"), 0),
      max: num(el.getAttribute("data-max"), 1),
      limit: num(el.getAttribute("data-limit"), 1),
      power: num(el.getAttribute("data-power"), 2),
      step: num(el.getAttribute("data-step"), 0),
      p0: num(el.min, 0),
      p1: num(el.max, 1000)
    };
  }
  function snap(v, step) {
    if (!(step > 0)) { return v; }
    var dp = (String(step).split(".")[1] || "").length;
    return Number((Math.round(v / step) * step).toFixed(dp));
  }
  function posToValue(sc, pos) {
    var f = (pos - sc.p0) / (sc.p1 - sc.p0), v;
    if (sc.kind === "log") {
      v = sc.min * Math.pow(sc.max / sc.min, f);
    } else {
      var a = Math.pow(1 - sc.min / sc.limit, 1 / sc.power);
      var b = Math.pow(1 - sc.max / sc.limit, 1 / sc.power);
      v = sc.limit * (1 - Math.pow(a + (b - a) * f, sc.power));
    }
    v = snap(v, sc.step);
    return Math.min(sc.max, Math.max(sc.min, v));
  }
  function valueToPos(sc, v) {
    v = Math.min(sc.max, Math.max(sc.min, v));
    var f;
    if (sc.kind === "log") {
      f = Math.log(v / sc.min) / Math.log(sc.max / sc.min);
    } else {
      var a = Math.pow(1 - sc.min / sc.limit, 1 / sc.power);
      var b = Math.pow(1 - sc.max / sc.limit, 1 / sc.power);
      f = (Math.pow(1 - v / sc.limit, 1 / sc.power) - a) / (b - a);
    }
    return sc.p0 + f * (sc.p1 - sc.p0);
  }
  function readEl(el) {
    var sc = scaleOf(el);
    return sc ? posToValue(sc, num(el.value, sc.p0)) : num(el.value, num(el.min, 0));
  }
  function writeEl(el, v) {
    var sc = scaleOf(el);
    if (sc) {
      var pos = valueToPos(sc, v);
      if (Math.abs(num(el.value, -1) - pos) > 1e-9) { el.value = pos; }
      return;
    }
    if (num(el.value, NaN) !== v) { el.value = v; }
  }
  function clampTo(el, v) {
    var lo = parseFloat(el.min), hi = parseFloat(el.max);
    if (!isNaN(lo) && v < lo) { v = lo; }
    if (!isNaN(hi) && v > hi) { v = hi; }
    return v;
  }

  /* ---------------------------------------------------------
     liveSim — two-way-synced range/number controls + toggles
     drive a render(state) callback. No submit button.

     Markup contract (inside root):
       <input type="range"  data-sim="v" ...>
       <input type="number" data-sim="v" ...>   (optional partner)
       <button data-sim-toggle="mode" data-value="series" aria-pressed="true">
       <button data-sim-toggle="mode" data-value="parallel" aria-pressed="false">
       (or)  <input type="radio" name="mode" data-sim-toggle="mode" value="series">

     opts:
       render(state, ctx)  required. state = { key: value }.
                           ctx = { reducedMotion, root }.
       onChange(state)     optional, fired after each render.
     Returns { state, refresh, set(key,val), destroy }.
  --------------------------------------------------------- */
  function liveSim(root, opts) {
    opts = opts || {};
    if (!root || typeof opts.render !== "function") { return null; }
    var state = {};
    var cleanups = [];

    var ranges = [].slice.call(root.querySelectorAll("input[data-sim]"));
    // group synced inputs by key
    var groups = {};
    ranges.forEach(function (inp) {
      var key = inp.getAttribute("data-sim");
      (groups[key] = groups[key] || []).push(inp);
    });
    // the value comes from the plain (unscaled) control when there is one
    Object.keys(groups).forEach(function (key) {
      var plain = groups[key].filter(function (el) { return !scaleOf(el); })[0];
      state[key] = plain ? num(plain.value, num(plain.min, 0)) : readEl(groups[key][0]);
    });
    Object.keys(groups).forEach(function (key) {
      groups[key].forEach(function (el) { if (scaleOf(el)) { writeEl(el, state[key]); } });
    });

    var doRender = rafThrottle(function () {
      opts.render(state, { reducedMotion: reducedMotion(), root: root });
      if (typeof opts.onChange === "function") { opts.onChange(state); }
    });

    function syncGroup(key, value, fromEl) {
      state[key] = value;
      groups[key].forEach(function (el) {
        if (el !== fromEl) { writeEl(el, value); }
      });
      doRender();
    }

    Object.keys(groups).forEach(function (key) {
      groups[key].forEach(function (el) {
        var handler = function () {
          if (el.value === "" || isNaN(parseFloat(el.value))) { return; }
          syncGroup(key, readEl(el), el);
        };
        // a typed value outside the control's range is pulled back in once
        // the pupil leaves the box, so the box never shows a value the
        // model is not using
        var clamp = function () {
          if (el.type !== "number") { return; }
          var v = clampTo(el, num(el.value, state[key]));
          writeEl(el, v);
          syncGroup(key, v, el);
        };
        el.addEventListener("input", handler);
        el.addEventListener("change", clamp);
        cleanups.push(function () {
          el.removeEventListener("input", handler);
          el.removeEventListener("change", clamp);
        });
      });
    });

    // toggles (button group via aria-pressed, or radios)
    var toggles = [].slice.call(root.querySelectorAll("[data-sim-toggle]"));
    // seed initial value per key: a pressed/checked control wins, else the
    // first control in DOM order (independent of where the pressed one sits)
    var seed = {};
    toggles.forEach(function (el) {
      var key = el.getAttribute("data-sim-toggle");
      var val = el.getAttribute("data-value") || el.value;
      if (!(key in seed)) { seed[key] = val; }
      if (el.getAttribute("aria-pressed") === "true" || el.checked) { seed[key] = val; }
    });
    Object.keys(seed).forEach(function (key) { if (!(key in state)) { state[key] = seed[key]; } });
    // reconcile aria-pressed so the buttons visually match the seeded state
    toggles.forEach(function (el) {
      var key = el.getAttribute("data-sim-toggle");
      var val = el.getAttribute("data-value") || el.value;
      if (el.hasAttribute("aria-pressed")) { el.setAttribute("aria-pressed", state[key] === val ? "true" : "false"); }
    });
    toggles.forEach(function (el) {
      var key = el.getAttribute("data-sim-toggle");
      var handler = function () {
        state[key] = el.getAttribute("data-value") || el.value;
        // reflect aria-pressed across the group
        toggles.forEach(function (t) {
          if (t.getAttribute("data-sim-toggle") === key && t.hasAttribute("aria-pressed")) {
            t.setAttribute("aria-pressed", t === el ? "true" : "false");
          }
        });
        doRender();
      };
      el.addEventListener("click", handler);
      el.addEventListener("change", handler);
      cleanups.push(function () {
        el.removeEventListener("click", handler);
        el.removeEventListener("change", handler);
      });
    });

    doRender();

    return {
      state: state,
      refresh: function () { doRender(); },
      set: function (key, val) {
        if (groups[key]) { syncGroup(key, num(val, state[key])); }
        else { state[key] = val; doRender(); }
      },
      destroy: function () { cleanups.forEach(function (fn) { fn(); }); }
    };
  }

  /* ---------------------------------------------------------
     dragPlace — tap-or-drag tokens into labelled slots.
     ALWAYS tap-operable (drag is progressive enhancement).

     Markup contract (inside root):
       <button class="kit-token" data-token="ammeter">Ammeter (A)</button> ...
       <div class="kit-slot" data-slot data-accept="ammeter" aria-label="...">…</div> ...

     opts:
       onChange(state)   optional. state = { slotIndex: tokenValue|null }.
       validate(state)   optional -> { ok:boolean, msg:string, perSlot:[bool] }.
                         Default: every slot's placed token === its data-accept.
       liveText(el)      optional aria-live status node.
     Returns { state, reset, check, destroy }.
  --------------------------------------------------------- */
  function dragPlace(root, opts) {
    opts = opts || {};
    if (!root) { return null; }
    var tokens = [].slice.call(root.querySelectorAll("[data-token]"));
    var slots = [].slice.call(root.querySelectorAll("[data-slot]"));
    var status = opts.liveText || root.querySelector("[data-kit-status]");
    var selected = null;
    var cleanups = [];

    function say(msg) { if (status) { status.textContent = msg; } }
    function slotToken(slot) { return slot.getAttribute("data-token") || null; }
    function tokenLabel(val) {
      var t = tokens.filter(function (x) { return x.getAttribute("data-token") === val; })[0];
      return t ? t.textContent.trim() : val;
    }

    function state() {
      var s = {};
      slots.forEach(function (slot, i) { s[i] = slotToken(slot); });
      return s;
    }
    function setSelected(tok) {
      selected = tok;
      tokens.forEach(function (t) { t.setAttribute("aria-pressed", t === tok ? "true" : "false"); });
    }
    function fillSlot(slot, val) {
      slot.setAttribute("data-token", val);
      slot.classList.add("is-filled");
      slot.classList.remove("is-ok", "is-no");
      var face = slot.querySelector("[data-slot-face]") || slot;
      face.textContent = tokenLabel(val);
      slot.setAttribute("aria-label", (slot.getAttribute("data-label") || "Slot") + ": " + tokenLabel(val) + " — activate to remove");
      var src = tokens.filter(function (t) { return t.getAttribute("data-token") === val; })[0];
      if (src && !slot.getAttribute("data-reuse")) { src.disabled = true; }
    }
    function emptySlot(slot) {
      var val = slotToken(slot);
      slot.removeAttribute("data-token");
      slot.classList.remove("is-filled", "is-ok", "is-no");
      var face = slot.querySelector("[data-slot-face]") || slot;
      face.textContent = slot.getAttribute("data-placeholder") || "—";
      slot.setAttribute("aria-label", (slot.getAttribute("data-label") || "Slot") + ": empty");
      var src = tokens.filter(function (t) { return t.getAttribute("data-token") === val; })[0];
      if (src) { src.disabled = false; }
    }
    function place(slot, val) {
      if (slotToken(slot)) { emptySlot(slot); }
      fillSlot(slot, val);
      setSelected(null);
      if (typeof opts.onChange === "function") { opts.onChange(state()); }
      say(tokenLabel(val) + " placed.");
    }

    tokens.forEach(function (tok) {
      var onTap = function () {
        if (tok.disabled) { return; }
        setSelected(selected === tok ? null : tok);
        say(selected ? (tokenLabel(tok.getAttribute("data-token")) + " selected — tap a space to place it.") : "Selection cleared.");
      };
      tok.addEventListener("click", onTap);
      tok.setAttribute("draggable", "true");
      var onDrag = function (e) { e.dataTransfer.setData("text/plain", tok.getAttribute("data-token")); };
      tok.addEventListener("dragstart", onDrag);
      cleanups.push(function () { tok.removeEventListener("click", onTap); tok.removeEventListener("dragstart", onDrag); });
    });

    slots.forEach(function (slot) {
      if (!slot.hasAttribute("tabindex")) { slot.setAttribute("tabindex", "0"); }
      if (!slot.getAttribute("role")) { slot.setAttribute("role", "button"); }
      emptySlot(slot);
      var onTap = function () {
        if (selected) { place(slot, selected.getAttribute("data-token")); }
        else if (slotToken(slot)) { var v = slotToken(slot); emptySlot(slot); if (typeof opts.onChange === "function") { opts.onChange(state()); } say(tokenLabel(v) + " removed."); }
        else { say("Select a token first, then tap a space."); }
      };
      var onKey = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(); } };
      var onOver = function (e) { e.preventDefault(); };
      var onDrop = function (e) { e.preventDefault(); var v = e.dataTransfer.getData("text/plain"); if (v) { place(slot, v); } };
      slot.addEventListener("click", onTap);
      slot.addEventListener("keydown", onKey);
      slot.addEventListener("dragover", onOver);
      slot.addEventListener("drop", onDrop);
      cleanups.push(function () {
        slot.removeEventListener("click", onTap); slot.removeEventListener("keydown", onKey);
        slot.removeEventListener("dragover", onOver); slot.removeEventListener("drop", onDrop);
      });
    });

    function defaultValidate(s) {
      var perSlot = slots.map(function (slot, i) {
        var accept = slot.getAttribute("data-accept");
        return accept ? s[i] === accept : !!s[i];
      });
      var ok = perSlot.every(Boolean) && slots.every(function (sl) { return slotToken(sl); });
      return { ok: ok, perSlot: perSlot, msg: ok ? "All correct." : "Not quite — check the highlighted spaces." };
    }
    function check() {
      var s = state();
      if (slots.every(function (sl) { return !slotToken(sl); })) { say("Place the tokens first."); return { ok: false, perSlot: [], msg: "empty" }; }
      var res = (typeof opts.validate === "function" ? opts.validate(s) : defaultValidate(s));
      slots.forEach(function (slot, i) {
        slot.classList.remove("is-ok", "is-no");
        if (slotToken(slot)) { slot.classList.add(res.perSlot[i] ? "is-ok" : "is-no"); }
      });
      say(res.msg);
      return res;
    }
    function reset() {
      slots.forEach(emptySlot);
      tokens.forEach(function (t) { t.disabled = false; t.setAttribute("aria-pressed", "false"); });
      setSelected(null);
      say("");
      if (typeof opts.onChange === "function") { opts.onChange(state()); }
    }

    return { state: state, reset: reset, check: check, destroy: function () { cleanups.forEach(function (fn) { fn(); }); } };
  }

  /* ---------------------------------------------------------
     poeCard — predict → reveal → (test it on the live model).

     Markup contract (inside root):
       <button data-predict="up">Brighter</button>
       <button data-predict="down">Dimmer</button>
       <div data-reveal hidden>…explanation…</div>
     A button may hold <template data-feedback>…</template>: its markup
     is shown in [data-reveal] when that option is picked.

     opts:
       answer        optional correct value (for styling only; never scores).
       onPredict(choice, isRight)  optional.
       revealText(choice)          optional -> string written into [data-reveal].
       focusTarget   optional element scrolled into view after predicting.
     Returns { choice, reset }.
  --------------------------------------------------------- */
  function poeCard(root, opts) {
    opts = opts || {};
    if (!root) { return null; }
    var btns = [].slice.call(root.querySelectorAll("[data-predict]"));
    var reveal = root.querySelector("[data-reveal]");
    var chosen = null;

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        chosen = b.getAttribute("data-predict");
        btns.forEach(function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
          x.classList.toggle("is-chosen", x === b);
        });
        var isRight = (opts.answer != null) ? (chosen === opts.answer) : null;
        if (reveal) {
          // per-option feedback: every option teaches (DECK-RULES 42)
          var fb = b.querySelector("template[data-feedback]");
          if (fb) { reveal.innerHTML = fb.innerHTML; }
          else if (typeof opts.revealText === "function") { reveal.textContent = opts.revealText(chosen); }
          reveal.hidden = false;
        }
        if (typeof opts.onPredict === "function") { opts.onPredict(chosen, isRight); }
        if (opts.focusTarget && opts.focusTarget.scrollIntoView) {
          opts.focusTarget.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "nearest" });
        }
      });
    });

    return {
      choice: function () { return chosen; },
      reset: function () {
        chosen = null;
        btns.forEach(function (x) { x.setAttribute("aria-pressed", "false"); x.classList.remove("is-chosen"); });
        if (reveal) { reveal.hidden = true; }
      }
    };
  }

  /* ---------------------------------------------------------
     Number formatting for readouts.
       fmt(x, sf)        3 significant figures by default, never an
                         "e+4", trailing zeros kept (1.00 means 1.00),
                         a real minus sign.
       si(x, unit, sf)   with an SI prefix: si(0.0103, "A") -> "10.3 mA".
  --------------------------------------------------------- */
  function fmt(x, sf) {
    sf = sf || 3;
    if (!isFinite(x)) { return "—"; }
    if (x === 0) { return "0"; }
    var s = Math.abs(x).toPrecision(sf);
    if (s.indexOf("e") !== -1) {
      var n = Number(s), e = Math.floor(Math.log10(n));
      s = e >= 0 ? String(Math.round(n)) : n.toFixed(Math.max(0, sf - 1 - e));
    }
    return (x < 0 ? "−" : "") + s;
  }
  var PREFIX = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"]];
  function si(x, unit, sf) {
    if (!isFinite(x)) { return "—"; }
    var a = Math.abs(x), i, p = PREFIX[3];
    if (a !== 0) {
      for (i = 0; i < PREFIX.length; i++) {
        if (a >= PREFIX[i][0] * 0.9995) { p = PREFIX[i]; break; }
        p = PREFIX[i];
      }
    }
    return fmt(x / p[0], sf) + " " + p[1] + (unit || "");
  }

  /* ---------------------------------------------------------
     clock — the one animation loop a simulator needs.

     opts:
       onFrame(dt, t)   required. dt and t in SIMULATED seconds.
       speed            simulated seconds per real second (default 1).
       autoplay         start running at once — ignored when the
                        reader asks for reduced motion.
       button           optional element: toggles play/pause, keeps
                        aria-pressed and its text ("Pause"/"Play").
     Pauses itself while the tab is hidden; a frame never jumps more
     than 0.1 s of real time, so coming back to the tab is smooth.
     Returns { play, pause, toggle, running, setSpeed, reset, time }.
  --------------------------------------------------------- */
  function clock(opts) {
    opts = opts || {};
    var speed = opts.speed || 1, t = 0, last = null, raf = null, on = false, hidden = false;
    var btn = opts.button || null;
    function label() {
      if (!btn) { return; }
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.textContent = on ? (btn.getAttribute("data-pause-text") || "Pause") : (btn.getAttribute("data-play-text") || "Play");
    }
    function frame(now) {
      raf = null;
      if (!on || hidden) { last = null; return; }
      var dt = last === null ? 0 : Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt * speed;
      opts.onFrame(dt * speed, t);
      raf = win.requestAnimationFrame(frame);
    }
    function kick() { if (on && !hidden && raf === null) { last = null; raf = win.requestAnimationFrame(frame); } }
    function play() { on = true; label(); kick(); }
    function pause() { on = false; label(); }
    function onVis() { hidden = doc.hidden; kick(); }
    doc.addEventListener("visibilitychange", onVis);
    if (btn) { btn.addEventListener("click", function () { if (on) { pause(); } else { play(); } }); }
    if (opts.autoplay && !reducedMotion()) { play(); } else { label(); }
    return {
      play: play, pause: pause,
      toggle: function () { if (on) { pause(); } else { play(); } },
      running: function () { return on; },
      setSpeed: function (s) { speed = s; },
      reset: function () { t = 0; last = null; },
      time: function () { return t; }
    };
  }

  /* ---------------------------------------------------------
     graph — a live SVG graph to the site's axis rules: quantity
     (unit) on each axis, numbered ticks, the origin at 0 unless a
     page says otherwise.

     WidgetKit.graph(svg, {
       x: { min, max, label: "time", unit: "s", step? },
       y: { min, max, label: "p.d. <i>V</i><sub>C</sub>", unit: "V", step? },
       title: "Graph of …",          spoken before describe() text
       layouts: [ { w:600, h:300 },  first match wins; maxWidth:
                  { maxWidth:520, w:360, h:300 } ]   switches on phones
     })
     Labels may use <i> and <sub>.  Series are drawn in order:
       g.line(name, fn | [[x,y]…], { cls:"kg-c2", dash:true, samples })
       g.band(name, y0, y1, { cls })          shaded horizontal band
       g.ref(name, "x"|"y", value, { cls, label, side:"left"|"right", below })   a guide line
       g.marker(name, x, y, { cls, label })
       g.cursor(x | null)   a "now" line, moved without a redraw
       g.remove(name), g.setX({min,max,…}), g.setY(…), g.describe(text)
       g.px(x), g.py(y)   logical → SVG coordinates
     Styling is by class (kg-*) in /assets/css/sims.css, so it follows
     the page's tokens in both appearances.
  --------------------------------------------------------- */
  var SVGNS = "http://www.w3.org/2000/svg";
  var graphCount = 0;

  function niceStep(span, want) {
    var raw = span / Math.max(1, want), mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var f = raw / mag;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
  }
  function tickText(v, step) {
    var dp = (String(Number(step.toPrecision(6))).split(".")[1] || "").length;
    var s = Math.abs(v) < step / 1e6 ? "0" : v.toFixed(dp);
    return s.replace("-", "\u2212");
  }
  // "<i>V</i><sub>C</sub> (V)" -> tspans; anything else is plain text
  function richText(textEl, html) {
    while (textEl.firstChild) { textEl.removeChild(textEl.firstChild); }
    var parts = String(html).split(/(<\/?(?:i|sub)>)/), it = false, sub = false, pending = 0;
    parts.forEach(function (part) {
      if (part === "<i>") { it = true; return; }
      if (part === "</i>") { it = false; return; }
      if (part === "<sub>") { sub = true; pending = 1; return; }
      if (part === "</sub>") { sub = false; pending = -1; return; }
      if (!part) { return; }
      var ts = doc.createElementNS(SVGNS, "tspan");
      ts.textContent = part.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      if (it) { ts.setAttribute("font-style", "italic"); }
      if (sub) { ts.setAttribute("font-size", "75%"); }
      if (pending === 1) { ts.setAttribute("dy", "0.3em"); pending = 0; }
      else if (pending === -1) { ts.setAttribute("dy", "-0.3em"); pending = 0; }
      textEl.appendChild(ts);
    });
  }

  function graph(svg, opts) {
    opts = opts || {};
    if (!svg) { return null; }
    var id = "kg" + (++graphCount);
    var X = Object.assign({ min: 0, max: 1, label: "", unit: "" }, opts.x || {});
    var Y = Object.assign({ min: 0, max: 1, label: "", unit: "" }, opts.y || {});
    var layouts = opts.layouts || [{ w: 600, h: 300 }];
    var L = layouts[layouts.length - 1];
    var series = [], desc = "";
    var root = null, box = null;

    function pickLayout() {
      var w = (svg.parentNode && svg.parentNode.clientWidth) || win.innerWidth;
      for (var i = 0; i < layouts.length; i++) {
        if (!layouts[i].maxWidth || w <= layouts[i].maxWidth) { return layouts[i]; }
      }
      return layouts[layouts.length - 1];
    }
    function el(name, attrs, parent) {
      var e = doc.createElementNS(SVGNS, name);
      Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      if (parent) { parent.appendChild(e); }
      return e;
    }
    function px(x) { return box.l + (x - X.min) / (X.max - X.min) * (box.r - box.l); }
    function py(y) { return box.b - (y - Y.min) / (Y.max - Y.min) * (box.b - box.t); }
    function axisLabel(a) { return a.unit ? a.label + " (" + a.unit + ")" : a.label; }

    function drawAxes(g) {
      var xs = X.step || niceStep(X.max - X.min, (box.r - box.l) / 70);
      var ys = Y.step || niceStep(Y.max - Y.min, (box.b - box.t) / 45);
      var v, t;
      for (v = Math.ceil(X.min / xs - 1e-9) * xs; v <= X.max + xs * 1e-6; v += xs) {
        el("line", { "class": "kg-grid", x1: px(v), x2: px(v), y1: box.t, y2: box.b }, g);
        t = el("text", { "class": "kg-tick", x: px(v), y: box.b + 18, "text-anchor": "middle" }, g);
        t.textContent = tickText(v, xs);
      }
      for (v = Math.ceil(Y.min / ys - 1e-9) * ys; v <= Y.max + ys * 1e-6; v += ys) {
        el("line", { "class": "kg-grid", x1: box.l, x2: box.r, y1: py(v), y2: py(v) }, g);
        t = el("text", { "class": "kg-tick", x: box.l - 7, y: py(v) + 4.5, "text-anchor": "end" }, g);
        t.textContent = tickText(v, ys);
      }
      el("path", { "class": "kg-axis", d: "M" + box.l + " " + box.t + "V" + box.b + "H" + box.r }, g);
      t = el("text", { "class": "kg-label", x: (box.l + box.r) / 2, y: L.h - 8, "text-anchor": "middle" }, g);
      richText(t, axisLabel(X));
      t = el("text", { "class": "kg-label", x: 0, y: 0, "text-anchor": "middle",
        transform: "translate(15 " + ((box.t + box.b) / 2) + ") rotate(-90)" }, g);
      richText(t, axisLabel(Y));
    }

    function pathOf(s) {
      var pts = s.data, d = "", pen = false, i;
      if (typeof pts === "function") {
        var n = s.samples || 240, fn = pts;
        pts = [];
        for (i = 0; i <= n; i++) { var x = X.min + (X.max - X.min) * i / n; pts.push([x, fn(x)]); }
      }
      for (i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (p === null || !isFinite(p[1])) { pen = false; continue; }
        var yy = Math.max(box.t - 400, Math.min(box.b + 400, py(p[1])));
        d += (pen ? "L" : "M") + px(p[0]).toFixed(1) + " " + yy.toFixed(1);
        pen = true;
      }
      return d;
    }

    function drawSeries(g, notes) {
      notes = notes || g;
      series.forEach(function (s) {
        var cls = s.opts.cls ? " " + s.opts.cls : "", e;
        if (s.kind === "line") {
          el("path", { "class": "kg-line" + cls + (s.opts.dash ? " kg-dash" : ""), d: pathOf(s) }, g);
        } else if (s.kind === "band") {
          var y0 = py(Math.max(Y.min, Math.min(s.y0, s.y1))), y1 = py(Math.min(Y.max, Math.max(s.y0, s.y1)));
          el("rect", { "class": "kg-band" + cls, x: box.l, y: y1, width: box.r - box.l, height: Math.max(0, y0 - y1) }, g);
        } else if (s.kind === "ref") {
          var a = s.axis === "x"
            ? { x1: px(s.v), x2: px(s.v), y1: box.t, y2: box.b }
            : { x1: box.l, x2: box.r, y1: py(s.v), y2: py(s.v) };
          a["class"] = "kg-ref" + cls;
          el("line", a, g);
          if (s.opts.label) {
            // side: "left"/"right" (x guides: which side of the line; y guides:
            // which end of the plot) and "below" for a y guide
            var side = s.opts.side;
            if (s.axis === "x") {
              e = side === "left"
                ? el("text", { "class": "kg-note" + cls, x: px(s.v) - 5, y: box.t + 13, "text-anchor": "end" }, notes)
                : el("text", { "class": "kg-note" + cls, x: px(s.v) + 5, y: box.t + 13 }, notes);
            } else {
              var ly = s.opts.below ? py(s.v) + 15 : py(s.v) - 5;
              e = side === "left"
                ? el("text", { "class": "kg-note" + cls, x: box.l + 4, y: ly }, notes)
                : el("text", { "class": "kg-note" + cls, x: box.r - 4, y: ly, "text-anchor": "end" }, notes);
            }
            richText(e, s.opts.label);
          }
        } else if (s.kind === "marker") {
          if (!isFinite(s.y) || s.y > Y.max || s.y < Y.min) { return; }
          el("circle", { "class": "kg-marker" + cls, cx: px(s.x), cy: py(s.y), r: 6 }, g);
          if (s.opts.label) {
            var right = px(s.x) < (box.l + box.r) / 2;
            e = el("text", { "class": "kg-note" + cls, x: px(s.x) + (right ? 10 : -10), y: py(s.y) - 9,
              "text-anchor": right ? "start" : "end" }, g);
            richText(e, s.opts.label);
          }
        }
      });
    }

    function render() {
      var keep = series;
      series = keep.filter(function (s) { return s.kind !== "marker"; });
      L = pickLayout();
      var m = Object.assign({ l: 58, r: 16, t: 14, b: 48 }, L.m || {});
      box = { l: m.l, r: L.w - m.r, t: m.t, b: L.h - m.b };
      svg.setAttribute("viewBox", "0 0 " + L.w + " " + L.h);
      if (root) { svg.removeChild(root); }
      root = el("g", { "class": "kg" }, svg);
      var defs = el("defs", {}, root), clip = el("clipPath", { id: id + "c" }, defs);
      el("rect", { x: box.l, y: box.t - 2, width: box.r - box.l, height: box.b - box.t + 4 }, clip);
      drawAxes(el("g", {}, root));
      var clipped = el("g", { "clip-path": "url(#" + id + "c)" }, root);
      var notes = el("g", {}, root);
      drawSeries(clipped, notes);
      series = keep.filter(function (s) { return s.kind === "marker"; });
      drawSeries(el("g", {}, root));
      series = keep;
      cursorEl = el("line", { "class": "kg-cursor", y1: box.t, y2: box.b }, root);
      placeCursor();
      label();
    }
    // a moving "now" line, cheap enough to move every animation frame
    var cursorEl = null, cursorX = null;
    function placeCursor() {
      if (!cursorEl) { return; }
      var on = cursorX !== null && cursorX >= X.min && cursorX <= X.max;
      cursorEl.style.display = on ? "" : "none";
      if (on) { var x = px(cursorX).toFixed(1); cursorEl.setAttribute("x1", x); cursorEl.setAttribute("x2", x); }
    }
    function label() {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", (opts.title || "Graph") + (desc ? ". " + desc : ""));
    }
    function upsert(name, rec) {
      rec.name = name;
      for (var i = 0; i < series.length; i++) { if (series[i].name === name) { series[i] = rec; return api; } }
      series.push(rec);
      return api;
    }
    var redraw = rafThrottle(render);
    var api = {
      line: function (name, data, o) { upsert(name, { kind: "line", data: data, opts: o || {} }); redraw(); return api; },
      band: function (name, y0, y1, o) { upsert(name, { kind: "band", y0: y0, y1: y1, opts: o || {} }); redraw(); return api; },
      ref: function (name, axis, v, o) { upsert(name, { kind: "ref", axis: axis, v: v, opts: o || {} }); redraw(); return api; },
      marker: function (name, x, y, o) { upsert(name, { kind: "marker", x: x, y: y, opts: o || {} }); redraw(); return api; },
      remove: function (name) { series = series.filter(function (s) { return s.name !== name; }); redraw(); return api; },
      setX: function (a) { X = Object.assign({}, X, a); redraw(); return api; },
      setY: function (a) { Y = Object.assign({}, Y, a); redraw(); return api; },
      describe: function (text) { desc = text || ""; label(); return api; },
      cursor: function (x) { cursorX = (x === null || x === undefined) ? null : x; placeCursor(); return api; },
      px: function (x) { return px(x); },
      py: function (y) { return py(y); },
      now: function () { render(); return api; }
    };
    if (layouts.length > 1 && win.ResizeObserver && svg.parentNode) {
      var lastL = null;
      new win.ResizeObserver(function () { var n = pickLayout(); if (n !== lastL) { lastL = n; redraw(); } }).observe(svg.parentNode);
    }
    render();
    return api;
  }

  win.WidgetKit = {
    reducedMotion: reducedMotion,
    liveSim: liveSim,
    dragPlace: dragPlace,
    poeCard: poeCard,
    clock: clock,
    graph: graph,
    fmt: fmt,
    si: si,
    svgLabel: richText
  };
})(window, document);
