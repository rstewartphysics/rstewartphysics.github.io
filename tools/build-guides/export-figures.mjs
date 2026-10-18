// Exports the build guides' figures for the decks and booklet, as standalone SVG and as PNG (3×),
// straight from the component on the demo page, so a deck shows exactly what the page shows.
//   node tools/build-guides/export-figures.mjs [out-dir]   (default ~/claude-work/block6-timers/figures)
// Per circuit: <id>-diagram-<n> (part 1), <id>-build-<n>-diagram / -board (part 2, answer shown),
// <id>-mistake-<A|B|C> and -ringed. Not committed: the output is for the Mac deck kit.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { serve, launchOpts } from "./serve.mjs";

const out = process.argv[2] || join(homedir(), "claude-work", "block6-timers", "figures");
mkdirSync(out, { recursive: true });
const server = serve();
const b = await chromium.launch(launchOpts());
const p = await b.newPage({ viewport: { width: 1180, height: 900 }, colorScheme: "light", deviceScaleFactor: 3 });
await p.goto(server.demo);
let count = 0;

async function save(sel, name) {
  const el = p.locator(sel).first();
  /* MuPDF, PowerPoint and Word ignore CSS classes, so every computed style becomes an attribute */
  const svg = await el.evaluate(node => {
    const PROPS = ["fill", "fill-opacity", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin",
      "opacity", "font-family", "font-size", "font-weight", "font-style", "text-anchor", "dominant-baseline"];
    const c = node.cloneNode(true), src = [node, ...node.querySelectorAll("*")], dst = [c, ...c.querySelectorAll("*")];
    src.forEach((e, i) => {
      const cs = getComputedStyle(e), d = dst[i];
      if (i && !(e instanceof SVGGraphicsElement || e.tagName === "tspan")) return;
      for (const k of PROPS) { const v = cs.getPropertyValue(k); if (v) d.setAttribute(k, v); }
      if (cs.display === "none" || cs.visibility === "hidden") d.setAttribute("visibility", "hidden");
      d.removeAttribute("class"); d.removeAttribute("style"); d.removeAttribute("tabindex"); d.removeAttribute("role");
    });
    c.querySelectorAll("style").forEach(x => x.remove());
    c.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const vb = c.getAttribute("viewBox").split(/\s+/).map(Number);
    c.setAttribute("width", vb[2]); c.setAttribute("height", vb[3]);
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(c);
  });
  writeFileSync(join(out, name + ".svg"), svg);
  await el.screenshot({ path: join(out, name + ".png") });
  count += 2;
}

for (const [sec, id] of [["comparator", "op-amp-comparator"], ["monostable", "555-monostable"], ["astable", "555-astable"]]) {
  const S = `#${sec}`;
  await p.locator(S).scrollIntoViewIfNeeded();
  await p.waitForSelector(`${S} [data-guide-ready]`);
  const steps = await p.$$eval(`${S} .bg-dots button`, xs => xs.length);
  for (let i = 0; i < steps; i++) {
    await p.click(`${S} [data-go="${i}"]`);
    await save(`${S} .bg-fig svg`, `${id}-diagram-${i + 1}`);
  }
  if (!(await p.$(`${S} [data-part="build"]`))) continue;
  await p.click(`${S} [data-part="build"]`);
  const n = await p.$$eval(`${S} .bg-dots button`, xs => xs.length);
  for (let i = 0; i < n; i++) {
    await p.click(`${S} [data-go="${i}"]`);
    if (await p.$(`${S} [data-act="showMe"]`)) await p.click(`${S} [data-act="showMe"]`);
    await save(`${S} .bg-fig:not(.bg-board) svg`, `${id}-build-${i + 1}-diagram`);
    await save(`${S} .bg-board svg`, `${id}-build-${i + 1}-board`);
  }
  await p.click(`${S} [data-part="mistake"]`);
  const boards = await p.$$eval(`${S} [data-mi]`, xs => xs.length);
  for (let i = 0; i < boards; i++) {
    const L = "ABC"[i];
    await p.click(`${S} [data-mi="${i}"]`);
    await save(`${S} .bg-board svg`, `${id}-mistake-${L}`);
    const right = await p.$$eval(`${S} .bg-opt`, xs => xs.length);
    for (let o = 0; o < right; o++) {
      await p.click(`${S} [data-opt="${o}"]`);
      if (await p.$(`${S} .bg-fb.good`)) break;
    }
    await save(`${S} .bg-board svg`, `${id}-mistake-${L}-ringed`);
  }
}
console.log(`wrote ${count} files to ${out}`);
await b.close();
server.close();
