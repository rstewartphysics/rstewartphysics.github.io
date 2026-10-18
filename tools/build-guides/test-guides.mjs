// Drives the three build guides on preview/guide-demo.html in headless Chromium: taps answers,
// checks the parts each circuit shows, page errors, and sideways scroll at 390 px.
//   node tools/build-guides/test-guides.mjs [screenshot-dir]     (non-zero exit on failure)
import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { serve, REPO, launchOpts } from "./serve.mjs";
const HERE = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || join(HERE, "preview", "shots");
mkdirSync(out, { recursive: true });
const server = serve(), URL = server.demo;
const G = id => JSON.parse(readFileSync(join(REPO, "assets", "guides", id + ".json"), "utf8"));

const errs = [];
const fail = m => errs.push(m);
const b = await chromium.launch(launchOpts());

async function open(viewport, colorScheme) {
  const p = await b.newPage({ viewport, colorScheme });
  p.on("pageerror", e => fail(e.message));
  p.on("console", m => m.type() === "error" && fail(m.text()));
  await p.goto(URL);
  for (const id of ["comparator", "monostable", "astable"]) {
    await p.locator("#" + id).scrollIntoViewIfNeeded();
    await p.waitForSelector(`#${id} [data-guide-ready]`, { timeout: 10000 });
  }
  return p;
}
const shot = (p, sec, name) => p.locator(`#${sec} .build-guide`).screenshot({ path: `${out}/${name}.png` });
async function tapHole(p, sec, board, r, c) {
  const xy = await p.evaluate(([sec, board, r, c]) => {
    const svg = document.querySelector(`#${sec} [data-board-tap] svg`);
    const k = SBD.render.centreOf(r, c, board), pt = svg.createSVGPoint(); pt.x = k.x; pt.y = k.y;
    const s = pt.matrixTransform(svg.getScreenCTM()); return [s.x, s.y];
  }, [sec, board, r, c]);
  await p.mouse.click(xy[0], xy[1]);
}
const fbClass = (p, sec) => p.$eval(`#${sec} .bg-fb`, x => x.className).catch(() => "");

const p = await open({ width: 1180, height: 760 }, "light");

/* parts per circuit (D4, D9) */
const tabs = sec => p.$$eval(`#${sec} [data-part]`, xs => xs.map(x => x.dataset.part + ":" + x.textContent).join(" | "));
const want = {
  comparator: "diagram:1 · Circuit diagram | quiz:Quick quiz",
  monostable: "diagram:1 · Circuit diagram | build:2 · Diagram → breadboard | mistake:Spot the mistake | quiz:Quick quiz",
  astable: "diagram:1 · Circuit diagram | build:2 · Diagram → stripboard | mistake:Spot the mistake | quiz:Quick quiz"
};
for (const [sec, w] of Object.entries(want)) { const t = await tabs(sec); if (t !== w) fail(`${sec} tabs: ${t}`); }

/* every step of part 1 and part 2, shot for review */
for (const sec of ["comparator", "monostable", "astable"]) {
  const n = await p.$$eval(`#${sec} .bg-dots button`, xs => xs.length);
  for (let i = 0; i < n; i++) { await p.click(`#${sec} [data-go="${i}"]`); await shot(p, sec, `${sec}-diagram-${i + 1}`); }
}
for (const sec of ["monostable", "astable"]) {
  await p.click(`#${sec} [data-part="build"]`);
  const n = await p.$$eval(`#${sec} .bg-dots button`, xs => xs.length);
  for (let i = 0; i < n; i++) {
    await p.click(`#${sec} [data-go="${i}"]`);
    if (await p.$(`#${sec} [data-act="showMe"]`)) { await shot(p, sec, `${sec}-build-${i + 1}-ask`); await p.click(`#${sec} [data-act="showMe"]`); }
    await shot(p, sec, `${sec}-build-${i + 1}`);
  }
}

/* monostable, worked: no questions until "Try each step first" */
await p.click(`#monostable [data-go="1"]`);
if (await p.$(`#monostable .bg-ask`)) fail("monostable worked step asks a question with Try first off");
await p.click(`#monostable [data-act="tryFirst"]`);
if (!(await p.$(`#monostable .bg-ask`))) fail("monostable Try first shows no question");
{
  const K = G("555-monostable").build, s = K.seq[1], h = K.nodes[K.nets[s.net - 1][0]].holes[0];
  const wrong = K.nodes[K.nets[K.order[1] - 1][0]].holes[0];
  await tapHole(p, "monostable", K.board, wrong[0], wrong[1]);
  if (!(await fbClass(p, "monostable")).includes("bad")) fail("monostable wrong tap gave no 'bad' feedback");
  await tapHole(p, "monostable", K.board, h[0], h[1]);
  if (await p.$(`#monostable .bg-ask`)) fail("monostable right tap did not reveal the step");
  if (!(await fbClass(p, "monostable")).includes("good")) fail("monostable right tap gave no 'good' feedback");
  await shot(p, "monostable", "monostable-tryfirst-right");
}
await p.click(`#monostable [data-act="tryFirst"]`);

/* astable, faded: a part step asks; the chip step does not */
{
  const K = G("555-astable").build;
  await p.click(`#astable [data-go="0"]`);
  if (await p.$(`#astable .bg-ask`)) fail("astable faded asks on the chip step");
  const k = K.seq.findIndex(s => s.prompts.some(x => x.part));
  await p.click(`#astable [data-go="${k}"]`);
  if (!(await p.$(`#astable .bg-ask`))) fail("astable faded part step shows no question");
  const pr = K.seq[k].prompts.find(x => x.part), right = K.nodes[K.nets[pr.net - 1][0]].holes;
  const otherNet = K.order.find(n => n !== pr.net && K.order.indexOf(n) <= K.order.indexOf(K.seq[k].net));
  const bad = K.nodes[K.nets[otherNet - 1][0]].holes[0];
  await tapHole(p, "astable", K.board, bad[0], bad[1]);
  if (!(await fbClass(p, "astable")).includes("bad")) fail("astable wrong leg tap gave no 'bad' feedback");
  await shot(p, "astable", "astable-faded-wrong");
  const free = right[1];
  await tapHole(p, "astable", K.board, free[0], free[1]);
  if (!(await fbClass(p, "astable")).includes("good")) fail("astable right leg tap gave no 'good' feedback");
}

/* net table on the last step */
for (const sec of ["monostable", "astable"]) {
  const n = await p.$$eval(`#${sec} .bg-dots button`, xs => xs.length);
  await p.click(`#${sec} [data-go="${n - 1}"]`);
  await p.click(`#${sec} [data-act="ntShow"]`);
  await p.click(`#${sec} [data-act="ntCheck"]`);
  const t = await p.$eval(`#${sec} [data-nt-fb]`, x => x.textContent);
  if (!t.startsWith("Right.")) fail(`${sec} net table: shown answers do not check: ${t}`);
}

/* spot the mistake: every board, a wrong pick then the right one */
for (const [sec, id] of [["monostable", "555-monostable"], ["astable", "555-astable"]]) {
  await p.click(`#${sec} [data-part="mistake"]`);
  const M = G(id).mistakes;
  for (let i = 0; i < M.length; i++) {
    await p.click(`#${sec} [data-mi="${i}"]`);
    const wrongI = M[i].options.findIndex(o => !o.ok), rightI = M[i].options.findIndex(o => o.ok);
    await p.click(`#${sec} [data-opt="${wrongI}"]`);
    if (!(await fbClass(p, sec)).includes("bad")) fail(`${sec} mistake ${i}: wrong pick not marked`);
    await p.click(`#${sec} [data-opt="${rightI}"]`);
    if (!(await fbClass(p, sec)).includes("good")) fail(`${sec} mistake ${i}: right pick not marked`);
    await shot(p, sec, `${sec}-mistake-${"ABC"[i]}`);
  }
}

/* quiz: every question, a wrong pick then the right one */
for (const [sec, id] of [["comparator", "op-amp-comparator"], ["monostable", "555-monostable"], ["astable", "555-astable"]]) {
  await p.click(`#${sec} [data-part="quiz"]`);
  const Q = G(id).quiz;
  for (let i = 0; i < Q.length; i++) {
    const w = Q[i].o.findIndex(o => !o[1]), r = Q[i].o.findIndex(o => o[1]);
    await p.click(`#${sec} [data-q="${i}"][data-o="${w}"]`);
    await p.click(`#${sec} [data-q="${i}"][data-o="${r}"]`);
  }
  const s = await p.$eval(`#${sec} .bg-score`, x => x.textContent);
  if (s !== `First tries right: 0 of ${Q.length}`) fail(`${sec} quiz score: ${s}`);
  await shot(p, sec, `${sec}-quiz`);
}

/* the stage fits one landscape iPad screen */
for (const sec of ["monostable", "astable"]) {
  await p.click(`#${sec} [data-part="build"]`);
  await p.click(`#${sec} [data-go="3"]`);
  await p.locator(`#${sec} .bg-stephead`).evaluate(x => x.scrollIntoView({ block: "start" }));
  const h = await p.$eval(`#${sec} .bg-board`, x => { const r = x.getBoundingClientRect(); return [r.top, r.bottom]; });
  if (h[1] > 760 || h[0] < 0) fail(`${sec}: board ${Math.round(h[0])}–${Math.round(h[1])} px is not on one 760 px screen`);
  await p.screenshot({ path: `${out}/${sec}-screen-1180.png` });
}

/* phone, dark */
const q = await open({ width: 390, height: 844 }, "dark");
for (const sec of ["monostable", "astable"]) {
  await q.click(`#${sec} [data-part="build"]`);
  await q.click(`#${sec} .bg-nav [data-step="1"]`);
  await q.click(`#${sec} .bg-nav [data-step="1"]`);
  await shot(q, sec, `${sec}-phone-dark`);
}
const sw = await q.evaluate(() => document.documentElement.scrollWidth);
if (sw > 390) fail(`phone page width ${sw} px (screen 390)`);
const d = await open({ width: 1180, height: 760 }, "dark");
await d.click(`#astable [data-part="build"]`); await d.click(`#astable [data-go="4"]`);
await shot(d, "astable", "astable-dark-1180");
await d.click(`#monostable [data-part="mistake"]`); await shot(d, "monostable", "monostable-mistake-dark-1180");

console.log(errs.length ? "FAIL\n  " + errs.join("\n  ") : "OK: no page errors, every check passed, phone width " + sw + " px");
await b.close();
server.close();
process.exit(errs.length ? 1 : 0);
