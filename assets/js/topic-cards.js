/* Binds every Predict and misconception card ([data-poe]) to WidgetKit.poeCard.
   Load after widget-kit.js, both with defer. */
(function () {
  "use strict";
  function bind() {
    if (!window.WidgetKit) { return; }
    [].forEach.call(document.querySelectorAll("[data-poe]"), function (el) {
      var key = null;
      [].forEach.call(el.querySelectorAll("[data-predict]"), function (b) {
        if (b.hasAttribute("data-key")) { key = b.getAttribute("data-predict"); }
      });
      window.WidgetKit.poeCard(el, { answer: key });
    });
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", bind); } else { bind(); }
})();
