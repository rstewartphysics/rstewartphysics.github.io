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
      state[key] = num(inp.value, num(inp.min, 0));
    });

    var doRender = rafThrottle(function () {
      opts.render(state, { reducedMotion: reducedMotion(), root: root });
      if (typeof opts.onChange === "function") { opts.onChange(state); }
    });

    function syncGroup(key, value, fromEl) {
      state[key] = value;
      groups[key].forEach(function (el) {
        if (el !== fromEl && el.value !== String(value)) { el.value = value; }
      });
      doRender();
    }

    Object.keys(groups).forEach(function (key) {
      groups[key].forEach(function (el) {
        var handler = function () { syncGroup(key, num(el.value, state[key]), el); };
        el.addEventListener("input", handler);
        cleanups.push(function () { el.removeEventListener("input", handler); });
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
          if (typeof opts.revealText === "function") { reveal.textContent = opts.revealText(chosen); }
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

  win.WidgetKit = {
    reducedMotion: reducedMotion,
    liveSim: liveSim,
    dragPlace: dragPlace,
    poeCard: poeCard
  };
})(window, document);
