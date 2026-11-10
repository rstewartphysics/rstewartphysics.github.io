/* Binds every Predict and misconception card ([data-poe]) to WidgetKit.poeCard, and reports
   learn-page challenges to the shared progress engine (progress-system-guide.md):
   a card counts when the right answer is chosen; an exam item when its marking instructions
   are opened; <body data-prog-page="badge-id"> marks the page's badge as seen.
   Load after widget-kit.js (and progress.js on learn pages), all with defer. */
(function () {
  "use strict";
  function done(el) {
    var id = el && el.getAttribute("data-prog-challenge");
    if (id && window.Progress && window.Progress.complete) { window.Progress.complete(id); }
  }
  function bind() {
    if (window.Progress && document.body.dataset.progPage) { window.Progress.markSeen(document.body.dataset.progPage); }
    [].forEach.call(document.querySelectorAll("details[data-ei-reveal]"), function (d) {
      d.addEventListener("toggle", function () { if (d.open) { done(d.closest("[data-prog-challenge]")); } });
    });
    if (!window.WidgetKit) { return; }
    [].forEach.call(document.querySelectorAll("[data-poe]"), function (el) {
      var key = null;
      [].forEach.call(el.querySelectorAll("[data-predict]"), function (b) {
        if (b.hasAttribute("data-key")) { key = b.getAttribute("data-predict"); }
      });
      window.WidgetKit.poeCard(el, { answer: key, onPredict: function (c, right) { if (right) { done(el); } } });
    });
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", bind); } else { bind(); }
})();
