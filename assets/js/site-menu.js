(function () {
  "use strict";

  let lastFocusedElement = null;
  let initialised = false;

  function byId(id) {
    return document.getElementById(id);
  }

  function getMenuParts() {
    return {
      button: byId("siteMenuButton"),
      overlay: byId("siteMenuOverlay"),
      drawer: byId("siteMenuDrawer"),
      closeButton: byId("siteMenuClose")
    };
  }

  function getFocusableElements(drawer) {
    if (!drawer) return [];

    return Array.from(
      drawer.querySelectorAll(
        'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) {
      return !el.hasAttribute("disabled") &&
             el.getAttribute("aria-disabled") !== "true" &&
             el.offsetParent !== null;
    });
  }

  function openMenu() {
    const { button, overlay, drawer } = getMenuParts();
    if (!button || !overlay || !drawer) return;

    lastFocusedElement = document.activeElement;

    overlay.hidden = false;

    requestAnimationFrame(function () {
      overlay.classList.add("is-open");
      drawer.classList.add("is-open");
      document.body.classList.add("site-menu-open");

      button.setAttribute("aria-expanded", "true");
      button.setAttribute("aria-label", "Close site menu");
      drawer.setAttribute("aria-hidden", "false");

      /* The drawer, not its first row: iOS Safari draws a focus ring on whatever takes focus
         after a tap, and a ring round the top row on every open looked like a fault. */
      drawer.focus({ preventScroll: true });
    });
  }

  /* Every folder shuts when the menu closes, so each open starts from the same short list
     (RS, 28 Sep 2026). */
  function collapseAll(drawer) {
    drawer.querySelectorAll("details[open]").forEach(function (d) {
      d.open = false;
    });
    drawer.scrollTop = 0;
  }

  function closeMenu() {
    const { button, overlay, drawer } = getMenuParts();
    if (!button || !overlay || !drawer) return;

    overlay.classList.remove("is-open");
    drawer.classList.remove("is-open");
    document.body.classList.remove("site-menu-open");

    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open site menu");
    drawer.setAttribute("aria-hidden", "true");

    window.setTimeout(function () {
      overlay.hidden = true;
      collapseAll(drawer);
    }, 240);

    /* A tap in Safari doesn't focus the button, so the menu often opened from <body>. Then
       there is nowhere to go back to: drop focus rather than leave it in the hidden drawer, and
       rather than ring the ☰ after every tap. */
    if (lastFocusedElement && lastFocusedElement !== document.body &&
        typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    } else if (drawer.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    lastFocusedElement = null;
  }

  function toggleMenu() {
    const { drawer } = getMenuParts();
    if (!drawer) return;

    if (drawer.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function trapFocus(event) {
    const { drawer } = getMenuParts();
    if (!drawer || !drawer.classList.contains("is-open")) return;
    if (event.key !== "Tab") return;

    const focusable = getFocusableElements(drawer);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === drawer) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function markCurrentPage() {
    const { drawer } = getMenuParts();
    if (!drawer) return;

    const currentPath = window.location.pathname.replace(/\/$/, "");
    const links = drawer.querySelectorAll("a[href]");

    links.forEach(function (link) {
      const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, "");

      if (linkPath === currentPath) {
        link.setAttribute("aria-current", "page");

        /* Folders stay shut, so the row of every folder holding the current page carries a
           mark instead: the subject's row, and a level's name when the page is in its list. */
        let parentDetails = link.closest("details");
        while (parentDetails) {
          const row = parentDetails.classList.contains("site-menu-level-more")
            ? parentDetails.previousElementSibling
            : parentDetails.querySelector(":scope > summary");
          if (row && row !== link) row.classList.add("has-current");
          parentDetails = parentDetails.parentElement.closest("details");
        }
      }
    });
  }

  /* Swipe the open drawer to the right to close it. It follows the finger, and closes past a
     third of its width; a shorter swipe springs back. touch-action: pan-y in the CSS leaves
     vertical scrolling to the browser, so only a sideways drag is handled here. */
  function swipeToClose(drawer) {
    let x0 = 0, y0 = 0, dx = 0, mode = null;

    drawer.addEventListener("touchstart", function (e) {
      if (!drawer.classList.contains("is-open") || e.touches.length !== 1) return;
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
      dx = 0;
      mode = null;
    }, { passive: true });

    drawer.addEventListener("touchmove", function (e) {
      if (mode === "scroll" || !drawer.classList.contains("is-open")) return;
      const mx = e.touches[0].clientX - x0;
      const my = e.touches[0].clientY - y0;
      if (!mode) {
        if (Math.abs(mx) < 10 && Math.abs(my) < 10) return;
        mode = mx > 0 && Math.abs(mx) > Math.abs(my) ? "swipe" : "scroll";
        if (mode === "scroll") return;
        drawer.style.transition = "none";
      }
      dx = Math.max(0, mx);
      drawer.style.transform = "translateX(" + dx + "px)";
    }, { passive: true });

    function end() {
      if (mode !== "swipe") { mode = null; return; }
      mode = null;
      drawer.style.transition = "";
      drawer.style.transform = "";
      if (dx > drawer.offsetWidth / 3) closeMenu();
    }
    drawer.addEventListener("touchend", end);
    drawer.addEventListener("touchcancel", end);
  }

  function closeOnMenuLinkClick(event) {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const { drawer } = getMenuParts();
    if (!drawer || !drawer.classList.contains("is-open")) return;

    closeMenu();
  }

  function initSiteMenu() {
    if (initialised) return;
    initialised = true;

    const { button, overlay, drawer, closeButton } = getMenuParts();

    if (!button || !overlay || !drawer || !closeButton) {
      console.warn("Shared site menu not initialised: required menu elements were not found.");
      return;
    }

    overlay.hidden = true;
    drawer.setAttribute("aria-hidden", "true");
    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click", toggleMenu);
    closeButton.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);
    drawer.addEventListener("click", closeOnMenuLinkClick);

    document.addEventListener("keydown", function (event) {
      const isOpen = drawer.classList.contains("is-open");

      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        closeMenu();
      }

      trapFocus(event);
    });

    markCurrentPage();
    swipeToClose(drawer);
    holdBadgeClearOfTopRow();
  }

  /* The logo is fixed to the screen, but a page with no banner (the Electronics builders and
     planners, the planning sheets) starts with a back link or heading exactly where it sits.
     There the logo waits until that top row has scrolled out from under it (RS, 28 Sep 2026).
     Measured rather than keyed to "has a banner", because a banner's own heading can land there
     on a phone too. Re-measured on resize: task pages change their top row on short screens. */
  function holdBadgeClearOfTopRow() {
    const badge = document.querySelector(".site-home-badge");
    if (!badge) return;
    let clearAt = 0;

    /* A paragraph's box can reach under the logo while its words stop short of it, so only the
       rendered lines of text count. */
    function textUnder(el, r) {
      return Array.prototype.some.call(el.childNodes, function (n) {
        if (n.nodeType !== 3 || !n.textContent.trim()) return false;
        const range = document.createRange();
        range.selectNodeContents(n);
        return Array.prototype.some.call(range.getClientRects(), function (q) {
          return q.right > r.left && q.left < r.right && q.bottom > r.top && q.top < r.bottom;
        });
      });
    }

    function coveredBottom() {
      const scrollY = window.scrollY;
      const r = badge.getBoundingClientRect();
      badge.style.display = "none";
      let bottom = 0;
      for (let x = r.left + 2; x < r.right; x += 8) {
        for (let y = r.top + 2; y < r.bottom; y += 8) {
          const el = document.elementFromPoint(x, y);
          if (!el || el === document.body || el === document.documentElement) continue;
          const hit = el.closest("a, button, input, select, summary, label") ||
                      (textUnder(el, r) ? el : null);
          if (hit) {
            bottom = Math.max(bottom, hit.getBoundingClientRect().bottom + scrollY);
          }
        }
      }
      badge.style.display = "";
      return bottom ? bottom - r.top : 0;
    }

    function update() {
      badge.classList.toggle("is-waiting", clearAt > 0 && window.scrollY < clearAt);
    }

    function measure() {
      const y = window.scrollY;
      if (y > 0) window.scrollTo(0, 0);
      clearAt = coveredBottom();
      if (y > 0) window.scrollTo(0, y);
      update();
    }

    measure();
    let ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    let t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(measure, 150); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteMenu);
  } else {
    initSiteMenu();
  }
})();
