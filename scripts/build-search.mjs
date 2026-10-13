// Builds the site-search index into _site/pagefind/ after `jekyll build`.
//
// Pages: every page Jekyll built is indexed from its <main>, unless _data/search.yml, its front
// matter (search: false / sitemap: false), a robots noindex or a redirect leaves it out.
// PDFs: only PDFs a searchable page links to are indexed, each as its own result, titled from
// the link that points at it. Course and type come from the URL (COURSES and typeOf below), so a
// page dropped into an existing folder needs nothing extra.
//
//   npm run search            (after jekyll build)

import { readFile, writeFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import * as pagefind from "pagefind";
import { parse } from "node-html-parser";

const SITE = path.resolve(process.argv[2] || "_site");

// Longest prefix wins. `levels` feed the S3 / N5 / Higher / AH chips, `subject` the Electronics
// and Engineering chips and the colour of the result's label.
const COURSES = [
  { prefix: "/classes/s3-physics", label: "S3 Physics", subject: "physics", levels: ["s3"] },
  { prefix: "/classes/s3-n5-physics", label: "N5 Physics", subject: "physics", levels: ["n5"] },
  { prefix: "/classes/n5-physics", label: "N5 Physics", subject: "physics", levels: ["n5"] },
  { prefix: "/classes/higher-physics", label: "Higher Physics", subject: "physics", levels: ["higher"] },
  { prefix: "/classes/higher/", label: "Higher Physics", subject: "physics", levels: ["higher"] },
  { prefix: "/classes/adv-higher-physics", label: "Advanced Higher Physics", subject: "physics", levels: ["ah"] },
  { prefix: "/classes/adv/", label: "Advanced Higher Physics", subject: "physics", levels: ["ah"] },
  { prefix: "/assets/adv/", label: "Advanced Higher Physics", subject: "physics", levels: ["ah"] },
  { prefix: "/assets/s3/", label: "S3 Physics", subject: "physics", levels: ["s3"] },
  { prefix: "/assets/n5/", label: "N5 Physics", subject: "physics", levels: ["n5"] },
  { prefix: "/classes/physics", label: "Physics", subject: "physics", levels: [] },
  { prefix: "/classes/electronics", label: "Electronics", subject: "electronics", levels: [] },
  { prefix: "/assets/electronics/", label: "Electronics", subject: "electronics", levels: [] },
  { prefix: "/classes/s3-engineering", label: "S3 Engineering", subject: "engineering", levels: ["s3"] },
  { prefix: "/assets/engineering-science/s3/", label: "S3 Engineering", subject: "engineering", levels: ["s3"] },
  { prefix: "/classes/n5-engineering", label: "N5 Engineering", subject: "engineering", levels: ["n5"] },
  { prefix: "/assets/engineering-science/national-5/", label: "N5 Engineering", subject: "engineering", levels: ["n5"] },
  { prefix: "/classes/engineering", label: "Engineering Science", subject: "engineering", levels: [] },
  { prefix: "/assets/engineering-science/", label: "Engineering Science", subject: "engineering", levels: [] },
];
const SITE_COURSE = { label: "Site", subject: "site", levels: [] };

// Never indexed: answers, quiz feedback and the page furniture every page repeats.
const EXCLUDE_SELECTORS = [
  "svg", "script", "style", "noscript", "template", "nav", "footer", "button",
  "input", "select", "textarea", "[aria-hidden='true']",
  ".skip-link", ".backlink", ".beta-note", "[data-credit-note]", ".subnav-wrap",
  "#answers", ".answers", ".reveal", ".reveal-body", ".solution",
  ".feedback", ".quiz-feedback", ".mcq-fb", ".kit-fb", ".predict-fb", ".match-fb", ".csim-fb",
  ".fb", ".fb-line", ".fb-head", ".fb-body", ".fbh", ".fbt", ".fb-ans",
];

const courseOf = (url) => {
  let best = null;
  for (const c of COURSES) {
    if (url.startsWith(c.prefix) && (!best || c.prefix.length > best.prefix.length)) best = c;
  }
  return best || SITE_COURSE;
};

function typeOf(url, title = "") {
  const u = decodeURIComponent(url).toLowerCase();
  if (u.endsWith(".pdf")) {
    if (u.includes("/slides/")) return "Slides";
    if (u.includes("past-paper") || u.includes("past paper") || /(^|[/_ -])(qp|mi)[_ -]/.test(u) ||
        /\b(past|question|specimen|\d{4}) paper\b|\bmarking instructions\b|\bspecimen\b/i.test(title)) return "Past paper";
    return "PDF";
  }
  if (/practice-test-[a-z]\.html$|\/practice-tests\/.+\.html$|question-bank/.test(u)) return "Practice test";
  return "Page";
}

// "Capacitors — Higher Physics" and "S3 Physics – Space" lose the course part: the result's
// label already names it.
const COURSE_NAME = /^((S3|N5|National 5|Higher|Advanced Higher)\s+)?(Physics|Engineering( Science)?|(Practical )?Electronics|Pneumatic components)?(\s+hub)?$|MrStewartPhysics/i;
function cleanTitle(t) {
  let s = parse(`<p>${t || ""}</p>`).text.replace(/\s+/g, " ").trim().replace(/^(['"])(.*)\1$/, "$2");
  for (let i = 0; i < 2; i++) {
    const tail = s.match(/^(.+)\s+[—|·–-]\s+(.+?)$/);
    const head = s.match(/^(.+?)\s+[—|·–-]\s+(.+)$/);
    if (tail && COURSE_NAME.test(tail[2].trim())) s = tail[1].trim();
    else if (head && COURSE_NAME.test(head[1].trim())) s = head[2].trim();
    else break;
  }
  return s;
}

function globToRegExp(g) {
  const re = g
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*\/?/g, "\u0000")
    .replace(/\*/g, "[^/]*")
    .replace(/\u0000/g, ".*");
  return new RegExp("^" + (g.startsWith("/") ? "" : ".*") + re + "$");
}

const attrEscape = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const textEscape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const squash = (s) => (s || "").replace(/\s+/g, " ").trim();

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "pagefind") await walk(p, out);
    } else out.push(p);
  }
  return out;
}

function urlFor(file) {
  let u = "/" + path.relative(SITE, file).split(path.sep).join("/");
  if (u.endsWith("/index.html")) u = u.slice(0, -"index.html".length);
  return u;
}

// What a link calls its PDF, best first: a card's own name, then link text that says more than
// "slides (PDF)", then the aria-label. Several pages can link one PDF; the best name wins.
const GENERIC = /\b(lesson|class|slides?|pdf|download|open|view|here|link|booklet|notes|full|print|poster|worksheet|copy|the|for|and)\b|[^a-z]/gi;

function linkTitle(a) {
  const card = a.closest(".deck-card");
  if (card && a.classList.contains("deck-pill")) {
    const name = squash(card.querySelector(".deck-name")?.text);
    if (name) return { t: /answer/i.test(a.text) ? `${name} (with answers)` : name, score: 3 };
  }
  const named = a.querySelector(".deck-name, .tile-name, .tile-title, .resource-title, .cap-title, .card-title");
  if (named) {
    const own = named.clone();
    own.querySelectorAll(".badge, .tag, .tile-tag").forEach((b) => b.remove());
    if (squash(own.text)) return { t: squash(own.text), score: 3 };
  }
  const text = squash(a.text).replace(/[↗→]/g, "").trim();
  if (text.replace(GENERIC, "").trim().length >= 4) return { t: text, score: 2 };
  // "Lesson 1 — Engineers and What They Do slides. PDF, 43 slides. Opens in a new tab"
  const label = squash(a.getAttribute("aria-label"))
    .replace(/\.?\s*Opens in a new tab\.?$/i, "")
    .split(/\.\s|,\s*PDF\b|\s[—–]\s*PDF\b/)[0]
    .replace(/^Recommended:\s*/i, "").replace(/\s+slides$/i, "").trim();
  if (label) return { t: label, score: 1 };
  return text ? { t: text, score: 0 } : null;
}

function linkDescription(a) {
  const holder = a.closest(".deck-card, .hub-tile, .resource-card, a") || a;
  const bits = holder.querySelectorAll(".deck-meta, .tile-body, .tile-desc, .resource-meta, .card-desc");
  return squash(bits.map((b) => b.text).join(" · "));
}

function titleFromFilename(url) {
  const base = decodeURIComponent(url.split("/").pop()).replace(/\.pdf$/i, "");
  return base.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

async function main() {
  const manifestFile = path.join(SITE, "search/manifest.json");
  const manifest = JSON.parse(await readFile(manifestFile, "utf8").catch(() => {
    throw new Error(`${manifestFile} is missing: run \`bundle exec jekyll build\` first.`);
  }));
  const excludeRes = (manifest.exclude || []).map(globToRegExp);
  const meta = new Map(manifest.pages.map((p) => [p.url, p]));

  const files = (await walk(SITE)).filter((f) => f.endsWith(".html"));
  const pages = [];
  const skipped = [];
  for (const file of files) {
    const url = urlFor(file);
    const m = meta.get(url);
    const html = await readFile(file, "utf8");
    const why =
      !m ? "not a Jekyll page" :
      m.skip ? "front matter" :
      excludeRes.some((r) => r.test(url)) ? "_data/search.yml" :
      /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html) ? "noindex" :
      /<meta[^>]+http-equiv=["']refresh["']/i.test(html) ? "redirect" : null;
    if (why) { skipped.push(`${url} (${why})`); continue; }
    pages.push({ url, file, html, m });
  }

  const { index, errors } = await pagefind.createIndex({
    rootSelector: "html",
    excludeSelectors: EXCLUDE_SELECTORS,
    forceLanguage: "en",
  });
  if (errors.length) throw new Error(errors.join("\n"));

  const pdfs = new Map();
  for (const p of pages) {
    const doc = parse(p.html);
    const titleTag = squash(doc.querySelector("title")?.text);
    const title = cleanTitle(p.m.title || titleTag) || p.url;
    const course = courseOf(p.url);
    const type = typeOf(p.url);

    // The page's own words and its search tags go into <main>, the only part that is indexed.
    const tags =
      `<span data-pagefind-ignore hidden>` +
      `<span data-pagefind-meta="title">${textEscape(title)}</span>` +
      `<span data-pagefind-meta="course">${textEscape(course.label)}</span>` +
      `<span data-pagefind-meta="subject">${course.subject}</span>` +
      `<span data-pagefind-meta="type">${type}</span>` +
      [...course.levels, course.subject].map((v) => `<span data-pagefind-filter="course">${v}</span>`).join("") +
      `</span>` +
      (doc.querySelector("main h1") ? "" : `<span hidden data-pagefind-weight="7">${textEscape(title)}</span>`) +
      (p.m.keywords ? `<span hidden data-pagefind-weight="5">${textEscape([].concat(p.m.keywords).join(" "))}</span>` : "");
    let html = p.html.replace(/<main\b([^>]*)>/i, (_, a) => `<main${a} data-pagefind-body>${tags}`);
    if (html === p.html) html = p.html.replace(/<body\b([^>]*)>/i, (_, a) => `<body${a} data-pagefind-body>${tags}`);

    const r = await index.addHTMLFile({ url: p.url, content: html });
    if (r.errors.length) throw new Error(`${p.url}: ${r.errors.join("; ")}`);

    // Credits links name a file to attribute it, not as a resource.
    if (p.url === "/classes/credits.html") continue;
    for (const a of doc.querySelectorAll("main a[href]")) {
      const href = a.getAttribute("href");
      if (!/\.pdf(#.*)?$/i.test(href) || /^[a-z]+:\/\//i.test(href)) continue;
      const pdfUrl = new URL(href, "https://x" + p.url).pathname;
      const entry = pdfs.get(pdfUrl) || { titles: [], descs: [], from: [] };
      const t = linkTitle(a);
      if (t && !entry.titles.some((x) => x.t === t.t)) entry.titles.push(t);
      const d = linkDescription(a);
      if (d && !entry.descs.includes(d)) entry.descs.push(d);
      if (!entry.from.some((f) => f.url === p.url)) entry.from.push({ url: p.url, title, course });
      pdfs.set(pdfUrl, entry);
    }
  }

  let pdfCount = 0;
  const missing = [];
  const siteFiles = new Set((await walk(SITE)).map(urlFor));
  for (const [url, e] of pdfs) {
    if (!siteFiles.has(decodeURIComponent(url)) && !siteFiles.has(url)) { missing.push(url); continue; }
    // The PDF's own folder names its course; a shared folder borrows the level of the page
    // that links it.
    const pathCourse = courseOf(decodeURIComponent(url));
    const linked = e.from[0].course;
    const course =
      pathCourse.levels.length ? pathCourse :
      linked.levels.length && (linked.subject === pathCourse.subject || pathCourse === SITE_COURSE) ? linked :
      pathCourse !== SITE_COURSE ? pathCourse : linked;
    const names = e.titles.sort((x, y) => y.score - x.score).map((x) => x.t);
    // "Open the Topic 2 booklet" says little in a results list: name the page it belongs to.
    let title = (names[0] || titleFromFilename(url))
      .replace(/^[^\p{L}\p{N}]+/u, "").replace(/[↗→←]/g, "").replace(/\s*\(PDF\)/i, "")
      .replace(/\bMI\b/g, "Marking Instructions").replace(/^(class |lesson )?slides (for|on) /i, "")
      .replace(/^(open|download|view|get|print)\s+/i, "").replace(/^the\s+/i, "").trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);
    if (title.replace(GENERIC, "").length < 5) title = `${e.from[0].title}: ${/^.\p{Ll}/u.test(title) ? title.charAt(0).toLowerCase() : title.charAt(0)}${title.slice(1)}`;
    const type = typeOf(url, title);
    const content = [title, ...names.slice(1), ...e.descs, titleFromFilename(url),
      ...e.from.map((f) => `From ${f.title}`)].join(". ");
    const r = await index.addCustomRecord({
      url,
      content,
      language: "en",
      meta: { title, course: course.label, subject: course.subject, type, from: e.from[0].title },
      filters: { course: [...course.levels, course.subject] },
    });
    if (r.errors.length) throw new Error(`${url}: ${r.errors.join("; ")}`);
    pdfCount++;
  }

  await rm(path.join(SITE, "pagefind"), { recursive: true, force: true });
  const w = await index.writeFiles({ outputPath: path.join(SITE, "pagefind") });
  if (w.errors.length) throw new Error(w.errors.join("\n"));
  await pagefind.close();

  // The manifest carries build-only flags; it is not part of the published site.
  await rm(manifestFile, { force: true });

  console.log(`Search index: ${pages.length} pages, ${pdfCount} PDFs → ${path.relative(process.cwd(), w.outputPath)}`);
  console.log(`Left out (${skipped.length}): ${skipped.join(", ")}`);
  if (missing.length) console.log(`Linked PDFs not found in the build (${missing.length}): ${missing.join(", ")}`);
}

main().catch(async (err) => {
  console.error(err);
  await pagefind.close().catch(() => {});
  process.exit(1);
});
