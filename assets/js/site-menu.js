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

      const focusable = getFocusableElements(drawer);
      if (focusable.length) {
        focusable[0].focus();
      } else {
        drawer.focus();
      }
    });
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
    }, 240);

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    } else {
      button.focus();
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

        const parentDetails = link.closest("details");
        if (parentDetails) {
          parentDetails.open = true;
        }
      }
    });
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteMenu);
  } else {
    initSiteMenu();
  }
})();
