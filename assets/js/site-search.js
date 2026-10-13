/* Site search in the menu drawer. Loaded by site-menu.js the first time the search box is used.
   The index is Pagefind's, built into /pagefind/ by scripts/build-search.mjs after Jekyll.
   Recent searches and the chosen course are kept on this device only and never sent anywhere. */
(function () {
  "use strict";

  const form = document.getElementById("siteSearch");
  const input = document.getElementById("siteSearchInput");
  const drawer = document.getElementById("siteMenuDrawer");
  if (!form || !input || !drawer || form.dataset.ready) return;
  form.dataset.ready = "1";

  const panel = document.getElementById("siteSearchPanel");
  const list = document.getElementById("siteSearchResults");
  const more = document.getElementById("siteSearchMore");
  const status = document.getElementById("siteSearchStatus");
  const recentBox = document.getElementById("siteSearchRecent");
  const recentList = recentBox.querySelector("ul");
  const chips = Array.from(form.querySelectorAll(".site-search-chip"));

  const RECENT_KEY = "site-search-recent-v1";
  const COURSE_KEY = "site-search-course-v1";
  const PAGE = 8;
  const COURSE_NAMES = {
    s3: "S3", n5: "National 5", higher: "Higher", ah: "Advanced Higher",
    electronics: "Electronics", engineering: "Engineering Science"
  };
  const SUBJECT_MARK = { physics: "smi-atom", electronics: "smi-logic", engineering: "smi-gears", site: "smi-home" };
  const TYPE_MARK = { Slides: "smi-slides", "Practice test": "smi-tests", "Past paper": "smi-paper", PDF: "smi-notes" };

  /* Browser storage can be missing or blocked (private windows, school-managed iPads). */
  function load(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* device-only nicety */ }
  }

  let course = load(COURSE_KEY, "");
  if (!Object.prototype.hasOwnProperty.call(COURSE_NAMES, course)) course = "";

  let pagefind = null;
  let synonyms = [];
  let ready = null;
  let failed = false;
  let seq = 0;
  let timer = 0;
  let results = [];
  let shown = 0;
  let pending = false;

  const norm = function (s) {
    return s.toLowerCase().replace(/[’']/g, "").replace(/\s+/g, " ").trim();
  };

  function start() {
    if (!ready) {
      ready = Promise.all([
        import("/pagefind/pagefind.js").then(function (pf) {
          return pf.options({ excerptLength: 24 }).then(function () { pf.init(); return pf; });
        }),
        fetch("/search/synonyms.json").then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
      ]).then(function (parts) {
        pagefind = parts[0];
        synonyms = Object.keys(parts[1] || {}).map(function (k) { return [norm(k), String(parts[1][k])]; });
      }).catch(function () {
        failed = true;
      });
    }
    return ready;
  }

  /* "ohms law" also searches "resistance": the synonym list maps pupils' words to the site's. */
  function variants(q) {
    const base = norm(q);
    const out = [q];
    const padded = " " + base + " ";
    synonyms.forEach(function (pair) {
      if (out.length < 4 && padded.indexOf(" " + pair[0] + " ") !== -1) {
        out.push((" " + base + " ").replace(" " + pair[0] + " ", " " + pair[1] + " ").trim());
      }
    });
    return out;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* Excerpts come back as text with <mark> round the matches; keep the marks, escape the rest. */
  function excerptHtml(s) {
    return escapeHtml(String(s || "").replace(/<mark>/g, "\u0001").replace(/<\/mark>/g, "\u0002"))
      .replace(/\u0001/g, "<mark>").replace(/\u0002/g, "</mark>");
  }

  function setStatus(text) {
    status.textContent = text;
  }

  function setChips() {
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.dataset.course === course ? "true" : "false");
    });
  }

  function showRecent() {
    const recent = load(RECENT_KEY, []);
    const show = !input.value.trim() && drawer.classList.contains("is-open") &&
      (document.activeElement === input || !recentBox.hidden) && recent.length > 0;
    recentBox.hidden = !show;
    if (!show) return;
    recentList.innerHTML = recent.map(function (q) {
      return '<li><button class="site-search-recent-btn" type="button" data-q="' + escapeHtml(q) + '">' +
        '<svg aria-hidden="true" focusable="false"><use href="#smi-search"/></svg>' + escapeHtml(q) + "</button></li>";
    }).join("");
  }

  function remember(q) {
    q = q.trim();
    if (q.length < 2) return;
    const recent = load(RECENT_KEY, []).filter(function (r) { return norm(r) !== norm(q); });
    recent.unshift(q);
    save(RECENT_KEY, recent.slice(0, 5));
  }

  function reset() {
    seq++;
    results = [];
    shown = 0;
    list.innerHTML = "";
    more.hidden = true;
    panel.hidden = true;
    drawer.classList.remove("is-searching");
    setStatus("");
  }

  function schedule() {
    clearTimeout(timer);
    pending = true;
    const q = input.value.trim();
    if (!q) {
      pending = false;
      reset();
      showRecent();
      return;
    }
    recentBox.hidden = true;
    panel.hidden = false;
    drawer.classList.add("is-searching");
    timer = setTimeout(run, 180);
  }

  function run() {
    const q = input.value.trim();
    const mine = ++seq;
    pending = false;
    if (!q) return Promise.resolve();
    return start().then(function () {
      if (mine !== seq) return;
      if (failed || !pagefind) {
        list.innerHTML = "";
        more.hidden = true;
        const local = /^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname);
        setStatus(local
          ? "Search isn't built in this preview. Run npm run search after jekyll build."
          : "Search couldn't load. Check your connection and try again.");
        return;
      }
      const opts = course ? { filters: { course: course } } : {};
      return Promise.all(variants(q).map(function (v) { return pagefind.search(v, opts); }))
        .then(function (sets) {
          if (mine !== seq) return;
          const byId = new Map();
          sets.forEach(function (set) {
            (set && set.results || []).forEach(function (r) {
              const had = byId.get(r.id);
              if (!had || r.score > had.score) byId.set(r.id, r);
            });
          });
          results = Array.from(byId.values()).sort(function (a, b) { return b.score - a.score; });
          shown = 0;
          list.innerHTML = "";
          return render(mine, q);
        });
    });
  }

  /* The section of the page that matched best, so a result can open at that heading. */
  function bestSection(data) {
    const subs = (data.sub_results || []).filter(function (s) { return s.url && s.url.indexOf("#") !== -1; });
    let best = null;
    subs.forEach(function (s) {
      const n = (s.locations || []).length;
      if (!best || n > (best.locations || []).length) best = s;
    });
    return best;
  }

  function hitHtml(data) {
    const meta = data.meta || {};
    const type = meta.type || "Page";
    const isPdf = /\.pdf(#|$)/i.test(data.url);
    const subject = SUBJECT_MARK[meta.subject] ? meta.subject : "site";
    const mark = TYPE_MARK[type] || SUBJECT_MARK[subject];
    const section = isPdf ? null : bestSection(data);
    const title = meta.title || data.url;
    const href = section && section.title && section.title !== title ? section.url : data.url;
    const excerpt = isPdf
      ? (meta.from ? "From " + escapeHtml(meta.from) : "")
      : excerptHtml(section && href === section.url ? section.excerpt : data.excerpt);
    const kind = isPdf ? (type === "PDF" ? "PDF" : type + " · PDF") : (type === "Page" ? "" : type);

    return '<li><a class="site-search-hit" data-subject="' + subject + '" href="' + escapeHtml(href) + '"' +
      (isPdf ? ' target="_blank" rel="noopener"' : "") + ">" +
      '<svg class="site-search-ic" aria-hidden="true" focusable="false"><use href="#' + mark + '"/></svg>' +
      '<span class="site-search-txt">' +
        '<span class="site-search-title">' + escapeHtml(title) + "</span>" +
        (href !== data.url ? '<span class="site-search-section">' + escapeHtml(section.title) + "</span>" : "") +
        '<span class="site-search-meta"><span class="site-search-course">' + escapeHtml(meta.course || "") + "</span>" +
          (kind ? " · " + escapeHtml(kind) : "") +
          (isPdf ? ' <span aria-hidden="true">↗</span><span class="site-search-sr">, opens in a new tab</span>' : "") +
        "</span>" +
        (excerpt ? '<span class="site-search-excerpt">' + excerpt + "</span>" : "") +
      "</span></a></li>";
  }

  function render(mine, q) {
    const next = results.slice(shown, shown + PAGE);
    return Promise.all(next.map(function (r) { return r.data(); })).then(function (datas) {
      if (mine !== seq) return;
      list.insertAdjacentHTML("beforeend", datas.map(hitHtml).join(""));
      shown += next.length;
      more.hidden = shown >= results.length;

      const where = course ? " in " + COURSE_NAMES[course] : "";
      if (!results.length) {
        list.innerHTML = '<li class="site-search-empty"><p>Nothing found for “' + escapeHtml(q) + "”" + where + ".</p>" +
          "<p>Try a shorter word, or check the spelling.</p>" +
          (course ? '<button class="site-search-text-btn" type="button" data-all>Search all courses</button>' : "") +
          "</li>";
        setStatus("No results" + where + ".");
      } else {
        setStatus(results.length + (results.length === 1 ? " result" : " results") + where + ".");
      }
    });
  }

  input.addEventListener("input", schedule);
  input.addEventListener("focus", showRecent);
  /* The recent list stays up until the pupil types or the menu closes: hiding it on blur would
     swallow a tap on it in iOS Safari, where buttons don't take focus. */
  drawer.addEventListener("site-menu:closed", function () { recentBox.hidden = true; });

  /* Enter opens the top result, waiting for the search if it is still running. */
  function submitSearch() {
    if (!input.value.trim()) return;
    remember(input.value);
    clearTimeout(timer);
    const go = function () {
      const first = list.querySelector(".site-search-hit");
      if (first) first.click();
    };
    if (list.querySelector(".site-search-hit") && !pending) go();
    else run().then(go);
  }
  form.addEventListener("submit", submitSearch);

  form.addEventListener("click", function (event) {
    const chip = event.target.closest(".site-search-chip");
    if (chip) {
      course = chip.dataset.course;
      save(COURSE_KEY, course);
      setChips();
      run();
      return;
    }
    if (event.target.closest("[data-all]")) {
      course = "";
      save(COURSE_KEY, course);
      setChips();
      run();
      input.focus();
      return;
    }
    const recent = event.target.closest(".site-search-recent-btn");
    if (recent) {
      input.value = recent.dataset.q;
      input.focus();
      schedule();
      return;
    }
    if (event.target.closest("#siteSearchRecentClear")) {
      save(RECENT_KEY, []);
      recentBox.hidden = true;
      input.focus();
      return;
    }
    if (event.target.closest(".site-search-hit")) remember(input.value);
  });

  more.addEventListener("click", function () {
    const first = shown;
    render(seq, input.value.trim()).then(function () {
      const hit = list.querySelectorAll(".site-search-hit")[first];
      if (hit) hit.focus();
    });
  });

  setChips();
  start();
  /* Enter pressed before this script arrived: site-menu.js kept a note of it. */
  if (form.dataset.pendingSubmit) {
    delete form.dataset.pendingSubmit;
    schedule();
    submitSearch();
  } else if (input.value.trim()) schedule();
  else showRecent();
})();
