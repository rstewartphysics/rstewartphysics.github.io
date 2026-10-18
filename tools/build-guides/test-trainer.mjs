// Drives the trainer in headless Chromium: taps answers, checks for page errors and sideways scroll.
//   node tools/build-guides/test-trainer.mjs [page.html] [screenshot-dir]
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
const HERE = dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] || join(HERE, 'preview', 'conversion-trainer.html');
const out = process.argv[3] || join(HERE, 'preview', 'shots');
mkdirSync(out, { recursive: true });
const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const p = await b.newPage({ viewport: { width: 1180, height: 760 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto('file://' + file);
async function clickRef(boardId, ref) {
  const xy = await p.evaluate(([boardId, ref]) => {
    const svg = document.querySelector('#boardFig svg'); const h = SBD.parseRef(ref);
    const c = SBD.render.centreOf(h.r, h.c, boardId); const pt = svg.createSVGPoint(); pt.x = c.x; pt.y = c.y;
    const s = pt.matrixTransform(svg.getScreenCTM()); return [s.x, s.y];
  }, [boardId, ref]);
  await p.mouse.click(xy[0], xy[1]);
}
// circuits in lesson order: 0 comparator (diagram only), 1 monostable (worked), 2 astable (your turn)
await p.screenshot({ path: out + '/n0-comp-diagram.png' });
const compTabs = await p.$$eval('[data-part]', xs => xs.map(x => x.dataset.part).join(','));
if (compTabs !== 'diagram,quiz') errs.push('comparator tabs are ' + compTabs + ', expected diagram,quiz');
await p.click('[data-go="5"]'); await p.screenshot({ path: out + '/n1-comp-diagram-last.png' });
await p.click('[data-part="quiz"]'); await p.click('[data-q="1"][data-o="1"]'); await p.screenshot({ path: out + '/n2-comp-quiz.png' });
await p.click('[data-ci="1"]'); await p.click('[data-part="strip"]');
await p.screenshot({ path: out + '/n3-mono-chip.png' });
await p.click('[data-go="1"]'); await p.screenshot({ path: out + '/n4-mono-pin1.png' });
await p.click('[data-go="3"]'); await p.screenshot({ path: out + '/n5-mono-pin2-switch.png' });
await p.click('[data-ci="2"]'); await p.click('[data-part="strip"]'); await p.click('[data-go="3"]');
await p.screenshot({ path: out + '/n6-astable-ask.png' });
await clickRef('34-0411', 'G30'); await p.screenshot({ path: out + '/n7-astable-wrong.png' });
await p.click('[data-part="bread"]');
await clickRef('bb-400', 'H13'); await p.screenshot({ path: out + '/n8-astable-bread-chip.png' });
await p.click('[data-part="mistake"]'); await p.click('[data-opt="0"]'); await p.screenshot({ path: out + '/n9-astable-mistake.png' });
const q = await b.newPage({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
q.on('pageerror', e => errs.push(e.message));
await q.goto('file://' + file); await q.click('[data-ci="1"]'); await q.click('[data-part="bread"]'); for (let i=0;i<3;i++) await q.click('.nav [data-step="1"]');
const sw = await q.evaluate(() => document.documentElement.scrollWidth);
await q.screenshot({ path: out + '/n10-phone.png', fullPage: true });
console.log('page errors:', errs.length ? JSON.stringify(errs) : 'none', '| phone page width:', sw, '(screen 390)');
await b.close();
if (errs.length || sw > 390) process.exit(1);
