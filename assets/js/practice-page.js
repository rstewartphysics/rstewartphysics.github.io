/* Practice pages: multiple choice that marks itself on tap. Every option gives its own
   feedback (DECK-RULES 42). The first pick for each question is kept on this device only, and
   the page's "mc-all" challenge completes once every question has been answered right. */
(function () {
  "use strict";
  var root = document.querySelector("[data-pp-store]");
  if (!root) { return; }
  var KEY = root.getAttribute("data-pp-store");
  function load(k, d) { try { var x = localStorage.getItem(KEY + k); return x ? JSON.parse(x) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) {} }

  var qs = [].slice.call(document.querySelectorAll(".pp-mc"));
  var scoreEl = document.getElementById("pp-score");
  var state = load("mc", {});

  function summary() {
    var first = 0, tried = 0, right = 0;
    qs.forEach(function (q) {
      var s = state[q.id];
      if (!s) { return; }
      tried++;
      if (s.first === q.getAttribute("data-key")) { first++; }
      if (s.right) { right++; }
    });
    if (scoreEl) {
      scoreEl.textContent = tried
        ? "Right first time: " + first + " of " + qs.length + ". Answered right in the end: " + right + " of " + qs.length + "."
        : "";
    }
    if (qs.length && right === qs.length && window.Progress && Progress.complete) { Progress.complete("mc-all"); }
  }

  qs.forEach(function (q) {
    var key = q.getAttribute("data-key");
    var fb = q.querySelector(".q-fb");
    var btns = [].slice.call(q.querySelectorAll(".pp-opt"));
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var L = b.getAttribute("data-l"), ok = L === key;
        var t = q.querySelector('template[data-l="' + L + '"]');
        btns.forEach(function (x) { x.classList.remove("correct", "wrong"); x.removeAttribute("aria-pressed"); });
        b.classList.add(ok ? "correct" : "wrong");
        b.setAttribute("aria-pressed", "true");
        fb.innerHTML = t ? t.innerHTML : "";
        fb.classList.toggle("ok", ok);
        fb.hidden = false;
        var s = state[q.id] || (state[q.id] = { first: L });
        if (ok) { s.right = true; }
        save("mc", state);
        summary();
      });
    });
  });

  var reset = document.getElementById("pp-reset");
  if (reset) {
    reset.addEventListener("click", function () {
      state = {};
      save("mc", state);
      qs.forEach(function (q) {
        q.querySelectorAll(".pp-opt").forEach(function (x) { x.classList.remove("correct", "wrong"); x.removeAttribute("aria-pressed"); });
        var fb = q.querySelector(".q-fb"); fb.hidden = true; fb.innerHTML = "";
      });
      summary();
    });
  }


  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", summary); } else { summary(); }
})();
