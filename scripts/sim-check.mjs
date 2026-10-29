// Checks every simulator on the built site against the site's simulator standard
// (CLAUDE.md "Simulations"), in a real browser, before it reaches pupils.
//
//   npm run sims                 check _site (after `jekyll build`)
//   npm run sims -- path/to/site
//
// A simulator is a `.sim` block (assets/css/sims.css + WidgetKit). For each page that has one, at
// a landscape iPad (1180 × 760, light and dark) and a phone (390 × 844):
//   - no script errors and no sideways scroll
//   - the stage (picture, graph and controls) fits one landscape screen
//   - every slider has a number box that moves with it, and both have a name
//   - every control is at least 44 px tall
//   - every drawing is named (role="img" + aria-label) or hidden from screen readers
//   - every graph has numbered ticks and labelled axes
//   - with reduced motion asked for, nothing moves until the pupil presses play
//   - every drawn stripboard ([data-board]) matches its own netlist
//   - every build guide ([data-guide]) loads its data and draws
// It prints every simulator it found (page, id, title, stage height at 1180 × 760), so the list
// of simulators on the site never has to be kept by hand. A page with a slider outside a `.sim`
// fails: every simulator on the site is on the kit (all migrated 13 October 2026).

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { chromium } from "playwright";

const SITE = resolve(process.argv[2] || "_site");
const STAGE_MAX = 760 - 64; // the sticky sub-nav keeps ~64 px of the screen
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".json": "application/json", ".woff2": "font/woff2", ".pdf": "application/pdf" };

function htmlFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "pagefind" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) htmlFiles(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

const pages = [], legacy = [];
for (const file of htmlFiles(SITE)) {
  const html = readFileSync(file, "utf8");
  const url = "/" + file.slice(SITE.length + 1).replace(/\\/g, "/");
  if (/class="sim[ "]/.test(html) || /data-board="/.test(html) || /data-guide="/.test(html)) pages.push(url);
  else if (/<input[^>]*type="range"/.test(html)) legacy.push(url);
}

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const file = join(SITE, p);
  try {
    if ((await stat(file)).isFile()) {
      res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
      return res.end(await readFile(file));
    }
  } catch {}
  res.writeHead(404).end();
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const BASE = `http://127.0.0.1:${server.address().port}`;

const VIEWS = [
  { name: "iPad landscape, light", width: 1180, height: 760, colorScheme: "light", wide: true },
  { name: "iPad landscape, dark", width: 1180, height: 760, colorScheme: "dark", wide: true },
  { name: "phone", width: 390, height: 844, colorScheme: "light", wide: false },
];

const browser = await chromium.launch();
const failures = [];
const inventory = [];

for (const url of pages) {
  for (const view of VIEWS) {
    const ctx = await browser.newContext({ viewport: { width: view.width, height: view.height },
      colorScheme: view.colorScheme, reducedMotion: "no-preference", hasTouch: !view.wide });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    // Embedded YouTube frames log their own errors (e.g. "Permissions policy violation:
    // compute-pressure"), intermittently; they are not the page's script.
    page.on("console", (m) => {
      if (m.type() !== "error" || /Failed to load resource|Permissions policy violation/.test(m.text())) return;
      const src = m.location().url;
      if (src && !src.startsWith(BASE)) return;
      errors.push(m.text());
    });
    await page.goto(BASE + url, { waitUntil: "load" });
    await page.waitForTimeout(400);
    // a simulator may live in a lesson panel that starts closed; open it, as a pupil would
    await page.evaluate(() => {
      for (const sim of document.querySelectorAll(".sim")) {
        for (let d = sim.closest("details"); d; d = d.parentElement && d.parentElement.closest("details")) d.open = true;
      }
    });
    await page.waitForTimeout(200);

    const found = await page.evaluate(({ wide, stageMax }) => {
      const out = [];
      const say = (sim, msg) => out.push(`#${sim.id || "(no id)"}: ${msg}`);
      if (document.scrollingElement.scrollWidth > window.innerWidth + 1)
        out.push(`page scrolls sideways (${document.scrollingElement.scrollWidth} px wide)`);
      for (const sim of document.querySelectorAll(".sim")) {
        if (!sim.id) say(sim, "a .sim needs an id");
        const stage = sim.querySelector(".sim-stage");
        if (!stage) { say(sim, "no .sim-stage"); continue; }
        if (wide) {
          const h = stage.getBoundingClientRect().height;
          if (h > stageMax) say(sim, `stage is ${Math.round(h)} px tall; it must fit ${stageMax} px (one landscape screen)`);
          const ctl = sim.querySelector(".sim-controls"), viewEl = sim.querySelector(".sim-view");
          if (ctl && viewEl && ctl.getBoundingClientRect().top >= viewEl.getBoundingClientRect().bottom - 1)
            say(sim, "controls sit below the picture; they go beside it");
        }
        for (const r of sim.querySelectorAll('input[type="range"]')) {
          if (!r.offsetParent) continue; // a slider the simulator has hidden for this mode
          const key = r.getAttribute("data-sim");
          const name = r.getAttribute("aria-label") || (r.labels && r.labels[0] && r.labels[0].textContent.trim());
          if (!name) say(sim, `slider ${key || "?"} has no name`);
          if (!key) { say(sim, "slider without data-sim (not on WidgetKit.liveSim)"); continue; }
          const n = sim.querySelector(`input[type="number"][data-sim="${key}"]`);
          if (!n) say(sim, `slider ${key} has no number box`);
          if (r.getBoundingClientRect().height < 43.5) say(sim, `slider ${key} is under 44 px tall`);
          if (n && n.offsetParent && n.getBoundingClientRect().height < 43.5) say(sim, `number box ${key} is under 44 px tall`);
        }
        for (const b of sim.querySelectorAll("button")) {
          if (b.offsetParent && b.getBoundingClientRect().height < 43.5)
            say(sim, `button "${b.textContent.trim().slice(0, 30)}" is under 44 px tall`);
        }
        for (const svg of sim.querySelectorAll("svg")) {
          if (svg.closest('[aria-hidden="true"]') || svg.parentElement.closest("svg")) continue;
          if (svg.getAttribute("role") !== "img" || !(svg.getAttribute("aria-label") || svg.querySelector("title")))
            say(sim, `a drawing has no role="img" name (${svg.id || svg.getAttribute("class") || "svg"})`);
        }
        for (const g of sim.querySelectorAll("svg .kg")) {
          if (g.querySelectorAll(".kg-tick").length < 4) say(sim, "a graph has fewer than 4 numbered ticks");
          if (g.querySelectorAll(".kg-label").length < 2) say(sim, "a graph is missing an axis label");
        }
        for (const f of sim.querySelectorAll(".sim-field")) {
          const cs = getComputedStyle(f);
          if (cs.display === "flex" && cs.flexDirection === "column") say(sim, "a .sim-field is a flex column (splits <var>/<sub> onto lines)");
        }
      }
      return out;
    }, { wide: view.wide, stageMax: STAGE_MAX });

    // a drawn stripboard must match its own netlist (board-figure.js marks it)
    if (view.wide && view.colorScheme === "light") {
      const boards = await page.$$("[data-board]");
      for (const el of boards) {
        await el.scrollIntoViewIfNeeded();
        await page.waitForFunction((e) => e.hasAttribute("data-board-ok"), el, { timeout: 8000 }).catch(() => {});
        const ok = await el.getAttribute("data-board-ok");
        const src = await el.getAttribute("data-board");
        if (ok !== "yes") found.push(`board ${src} ${ok === "no" ? "does not match its netlist" : "did not draw"}`);
      }
    }

    // a build guide must load its JSON and the engine, and draw (build-guide.js marks it ready)
    if (view.wide && view.colorScheme === "light") {
      for (const el of await page.$$(".build-guide[data-guide]")) {
        await el.scrollIntoViewIfNeeded();
        await page.waitForFunction((e) => e.hasAttribute("data-guide-ready") || e.querySelector(".bg-fb.bad"), el, { timeout: 10000 }).catch(() => {});
        const id = await el.getAttribute("data-guide");
        if (!(await el.evaluate((e) => e.hasAttribute("data-guide-ready")))) found.push(`build guide ${id} did not load`);
      }
    }

    // a slider and its number box move together
    const pairs = await page.$$('.sim input[type="range"][data-sim]');
    for (const r of pairs.slice(0, 6)) {
      const res = await r.evaluate((el) => {
        const sim = el.closest(".sim"), key = el.getAttribute("data-sim");
        const n = sim.querySelector(`input[type="number"][data-sim="${key}"]`);
        if (!n || el.disabled) return null;
        const start = el.value;
        el.value = el.min;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        const atMin = n.value;
        el.value = el.max;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        const atMax = n.value;
        el.value = start;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        return atMin === atMax ? `slider ${key} does not move its number box` : null;
      });
      if (res) found.push(res);
    }

    if (view === VIEWS[0]) {
      inventory.push(...(await page.$$eval(".sim", (sims) => sims.map((s) => ({
        id: s.id,
        title: ((s.querySelector(".sim-head h3") || {}).textContent || "").trim(),
        stage: Math.round((s.querySelector(".sim-stage") || s).getBoundingClientRect().height),
      })))).map((x) => ({ url, ...x })));
    }
    for (const msg of found) failures.push(`${url} [${view.name}] ${msg}`);
    for (const msg of errors) failures.push(`${url} [${view.name}] script error: ${msg}`);
    await ctx.close();
  }

  // reduced motion: nothing moves until the pupil asks
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 760 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + url, { waitUntil: "load" });
  await page.waitForTimeout(500);
  const snap = () => page.$$eval(".sim .sim-view", (vs) => vs.map((v) => v.innerHTML).join("|"));
  const a = await snap();
  await page.waitForTimeout(700);
  if (a !== (await snap())) failures.push(`${url} [reduced motion] a simulator animates on its own`);
  await ctx.close();
}

await browser.close();
server.close();

console.log(`sim-check: ${pages.length} page(s) with simulators checked.\n`);
for (const x of inventory) console.log(`  ${x.url}#${x.id}  "${x.title}"  stage ${x.stage} px`);
for (const u of legacy) failures.push(`${u} has a slider outside a .sim — every simulator uses the kit`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("\nAll simulators meet the standard.");
