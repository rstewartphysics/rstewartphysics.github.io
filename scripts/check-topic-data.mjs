#!/usr/bin/env node
// Validates the topic data layer (_data/topics, _data/misconceptions) and the
// includes that pages use. Run before every push: `node scripts/check-topic-data.mjs`.
// YAML is parsed by Ruby's Psych, the parser Jekyll itself uses, so what passes
// here is what the site builds.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const errors = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);

function loadYaml(file) {
  const out = execFileSync("ruby", ["-ryaml", "-rjson", "-rdate", "-e",
    "puts JSON.generate(YAML.safe_load(File.read(ARGV[0]), permitted_classes: [Date]))", file],
    { encoding: "utf8" });
  return JSON.parse(out);
}
const yamlFiles = (dir) => existsSync(join(ROOT, dir))
  ? readdirSync(join(ROOT, dir)).filter((f) => f.endsWith(".yml")).map((f) => join(ROOT, dir, f)) : [];
const nameOf = (f) => f.split("/").pop().replace(/\.yml$/, "");

// Built pages live at their source path; a directory Jekyll excludes is never published.
const EXCLUDED = ["tools/audits/", "tools/build-guides/", "tools/generators/", "scripts/", "docs/", "_notes/", "node_modules/"];
function sitePathExists(href) {
  const path = decodeURIComponent(href.split(/[?#]/)[0]).replace(/^\//, "");
  if (EXCLUDED.some((d) => path.startsWith(d))) { return "is in a folder _config.yml excludes"; }
  return existsSync(join(ROOT, path)) ? null : "file not found";
}

// N5 exam years with a diet (no 2021 papers).
const YEARS = new Set([2014, 2015, 2016, 2017, 2018, 2019, 2022, 2023, 2024, 2025, 2026]);
const EXAM_REF = /^(20\d\d) (S[12]|P[12]) Q\d+(\([a-z]\))?(\((i|ii|iii|iv|v)\))?$/;

function checkOptions(where, options) {
  if (!Array.isArray(options) || options.length < 2) { err(where, "needs at least two options"); return; }
  const keys = options.filter((o) => o.key);
  if (keys.length !== 1) { err(where, `needs exactly one key option, has ${keys.length}`); }
  options.forEach((o, i) => {
    if (!o.text) { err(`${where} option ${i + 1}`, "no text"); }
    if (!o.feedback) { err(`${where} option ${i + 1}`, "no feedback (every option teaches)"); }
    if (o.key && o.feedback && !o.feedback.startsWith("Right.")) { err(`${where} key`, "feedback must start \"Right.\""); }
  });
}

// ---- misconceptions ----
const misc = {};
for (const f of yamlFiles("_data/misconceptions")) {
  const topic = nameOf(f);
  const recs = loadYaml(f);
  misc[topic] = new Map();
  for (const m of recs) {
    const where = `${relative(ROOT, f)} ${m.id}`;
    if (!/^M\d+$/.test(m.id || "")) { err(where, "id must be M<number>"); continue; }
    if (misc[topic].has(m.id)) { err(where, "duplicate id"); }
    misc[topic].set(m.id, m);
    if (m.topic !== topic) { err(where, `topic is "${m.topic}", file is "${topic}"`); }
    if (!Array.isArray(m.spec) || !m.spec.length) { err(where, "no spec tag"); }
    for (const k of ["idea", "why", "evidence", "fix"]) { if (!m[k]) { err(where, `no ${k}`); } }
    if (m.shown) {
      if (!m.stem) { err(where, "shown, but no stem"); }
      checkOptions(where, m.options);
    }
  }
}

// ---- topics ----
const topics = {};
for (const f of yamlFiles("_data/topics")) {
  const id = nameOf(f);
  const t = loadYaml(f);
  topics[id] = t;
  const where = relative(ROOT, f);
  if (t.id !== id) { err(where, `id "${t.id}" does not match the file name`); }
  for (const k of ["title", "hub_url", "revised"]) { if (!t[k]) { err(where, `no ${k}`); } }
  if (!/^(January|February|March|April|May|June|July|August|September|October|November|December) 20\d\d$/.test(t.revised || "")) {
    err(where, "revised must be \"Month Year\" (the ownership footer)");
  }
  const hub = t.hub || {};
  for (const p of hub.learn || []) {
    if (p.live) { const why = sitePathExists(p.url); if (why) { err(`${where} learn ${p.key}`, `${p.url} ${why}`); } }
  }
  for (const r of [...(hub.revise || []), ...(hub.resources || [])]) {
    if (r.live === false || !r.href) { continue; }
    if (r.href.startsWith("/")) { const why = sitePathExists(r.href); if (why) { err(`${where} ${r.name}`, `${r.href} ${why}`); } }
    if (/delta/i.test(r.href) && !/Mr Taylor/.test(r.name)) { err(`${where} ${r.name}`, "a DELTA link must name Mr Taylor"); }
  }
  for (const [pk, page] of Object.entries(t.pages || {})) {
    const ids = new Set();
    for (const s of page.sections || []) {
      const sw = `${where} page ${pk} §${s.id}`;
      if (!/^[a-z0-9-]+$/.test(s.id || "")) { err(sw, "anchor id must be kebab-case"); }
      if (ids.has(s.id)) { err(sw, "duplicate section id"); }
      ids.add(s.id);
      if (!s.live) { continue; }
      if (!Array.isArray(s.spec) || !s.spec.length) { err(sw, "no spec tag"); }
      if (!s.keypoint) { err(sw, "no keypoint"); }
      if (!s.predict || !s.predict.q) { err(sw, "no predict question"); } else { checkOptions(`${sw} predict`, s.predict.options); }
      for (const href of [s.deck && s.deck.pdf, s.deck && s.deck.answers, s.worked && s.worked.stepper].filter(Boolean)) {
        const why = sitePathExists(href); if (why) { err(sw, `${href} ${why}`); }
      }
      for (const mid of s.misconceptions || []) {
        const m = misc[id] && misc[id].get(mid);
        if (!m) { err(sw, `misconception ${mid} not in _data/misconceptions/${id}.yml`); }
        else if (!m.shown) { err(sw, `misconception ${mid} is used but not shown: true`); }
      }
      if (s.exam) {
        for (const r of s.exam.refs || []) {
          const mm = EXAM_REF.exec(r);
          if (!mm) { err(sw, `exam ref "${r}" is not "YYYY S1|S2 Qn(a)(i)"`); }
          else if (!YEARS.has(+mm[1])) { err(sw, `exam ref "${r}": no N5 paper that year`); }
        }
        for (const k of ["crop", "mi"]) {
          if (s.exam[k]) { const why = sitePathExists(s.exam[k]); if (why) { err(sw, `${s.exam[k]} ${why}`); } }
        }
      } else { err(sw, "live section has no exam step yet"); }
      if (!/^R\d+$/.test(s.retrieve || "")) { err(sw, "retrieve must name a set, R<number>"); }
    }
  }
}

// ---- pages: every include names data that exists ----
function* htmlFiles(dir) {
  for (const e of readdirSync(dir)) {
    if (e.startsWith(".") || e.startsWith("_") || e === "node_modules" || ["audits", "build-guides", "generators"].includes(e)) { continue; }
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { yield* htmlFiles(p); } else if (e.endsWith(".html")) { yield p; }
  }
}
const INC = /\{%-?\s*include\s+(topic-hub|predict|keypoint|worked-example|misconception|exam-ref|retrieve-chip|missed-lesson)\.html([^%]*)%\}/g;
const ARG = /(\w+)="([^"]*)"/g;
for (const file of htmlFiles(ROOT)) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(INC)) {
    const args = Object.fromEntries([...m[2].matchAll(ARG)].map((a) => [a[1], a[2]]));
    const where = `${relative(ROOT, file)} ${m[1]}.html`;
    if (m[1] === "retrieve-chip") { if (!/^R\d+$/.test(args.set || "")) { err(where, "set must be R<number>"); } continue; }
    const t = topics[args.topic];
    if (!t) { err(where, `no _data/topics/${args.topic}.yml`); continue; }
    if (m[1] === "misconception") {
      const rec = misc[args.topic] && misc[args.topic].get(args.id);
      if (!rec) { err(where, `${args.id} not found`); } else if (!rec.shown) { err(where, `${args.id} is not shown: true`); }
      continue;
    }
    if (m[1] === "topic-hub") { continue; }
    const page = t.pages && t.pages[args.page];
    const sec = page && (page.sections || []).find((s) => s.id === args.section);
    if (!sec) { err(where, `page "${args.page}" section "${args.section}" not found`); }
    else if (!sec.live) { err(where, `section "${args.section}" is not live`); }
  }
}

const n = Object.keys(topics).length, nm = Object.values(misc).reduce((a, b) => a + b.size, 0);
if (errors.length) {
  console.error(`check-topic-data: ${errors.length} problem(s)\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log(`check-topic-data: OK — ${n} topic file(s), ${nm} misconception record(s).`);
