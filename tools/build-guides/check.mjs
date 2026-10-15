import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ALL } from "./circuits.mjs";
const require = createRequire(import.meta.url);
globalThis.window = globalThis;
const REPO = process.env.REPO || join(dirname(fileURLToPath(import.meta.url)), "..", "..");
require(join(REPO, "assets/js/stripboard.js"));
const S = globalThis.SBD;

export function question(c, kind) {
  const lay = c.layouts[kind];
  const ref = lay.reference;
  const comps = c.components.map(x => kind === "bread" && x.footprint === "dip-8"
    ? Object.assign({}, x, { footprint: "dip-8-bb" }) : x);
  return {
    id: c.id + "-" + kind, title: c.title, board: lay.board, components: comps,
    target: c.target, dontcare: c.dontcare,
    reference: attemptUpTo(ref, 99)
  };
}

export function attemptUpTo(ref, k) {
  const st = x => (Array.isArray(x) ? x[1] : x.step) <= k;
  let num = 0;
  return {
    cuts: ref.cuts.filter(st).map(x => x[0]),
    placements: ref.placements.filter(st).map(({ step, ...p }) => p),
    links: ref.links.map(l => Object.assign({}, l, { num: ++num })).filter(st).map(({ step, ...l }) => l),
    testpoints: ref.testpoints.filter(st).map(({ step, ...t }) => t)
  };
}

if (process.argv[1] && process.argv[1].endsWith("check.mjs")) {
  for (const c of ALL) for (const kind of ["bread", "strip"]) {
    const q = question(c, kind);
    const r = S.check(q, q.reference);
    console.log(`${q.id}: ${r.ok ? "OK" : "FAIL"}`);
    for (const f of r.faults || []) console.log("   fault", f.code, "-", String(f.msg).replace(/<[^>]+>/g, "").slice(0, 220));
    for (const w of r.warnings || []) console.log("   warn ", w.code, "-", String(w.msg).replace(/<[^>]+>/g, "").slice(0, 220));
  }
}
