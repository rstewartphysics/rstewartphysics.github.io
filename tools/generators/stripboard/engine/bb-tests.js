/* ============================================================================
   Breadboard Builder — engine test harness (added 15 Sep 2026)
   ----------------------------------------------------------------------------
   The breadboard sibling of tests.js's §13.3/13.4/13.11/13.12/13.6-style
   golden and derivation tests, run against bb-questions.js / bb-trace-
   questions.js / bb-fault-questions.js / bb-reverse-questions.js instead of
   the stripboard bank. tests.js's own §13.1/13.2/13.5 (segmentation, union-
   find, property tests) are board-agnostic and already exercise both
   topologies — not duplicated here.

   Run:  ./run-bb.sh
   ============================================================================ */
"use strict";

const { BOARDS, check, netlistOf, sameNet } = SBD;

let pass = 0, fail = 0;
const failures = [];

function t(name, fn) {
  try {
    const r = fn();
    if (r === true || r === undefined) { pass++; }
    else { fail++; failures.push(name + "  ->  " + r); }
  } catch (e) {
    fail++; failures.push(name + "  ->  threw: " + (e && e.message ? e.message : e));
  }
}
const eq = (a, b) => a === b ? true : `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`;
function codes(res) {
  return res.faults.map(f => f.code).concat(res.warnings.map(w => "w:" + w.code));
}
function has(res, code) {
  return res.faults.some(f => f.code === code) || res.warnings.some(w => w.code === code);
}
const clone = o => JSON.parse(JSON.stringify(o));
function normalise(nets, dontcare) {
  const skip = new Set(dontcare || []);
  return nets.map(n => n.filter(x => !skip.has(x)).sort().join("|"))
             .filter(s => s.length).sort();
}

/* ==========================================================================
   golden — every question's reference layout proves its own target
   ========================================================================== */

t("golden: at least three questions, unique ids", () => {
  if (QUESTIONS.length < 3) return "expected at least 3 questions, got " + QUESTIONS.length;
  const ids = QUESTIONS.map(q => q.id);
  return eq(ids.length, new Set(ids).size);
});

for (const q of QUESTIONS) {
  t(`golden [${q.id}] reference layout has no placement errors`, () => {
    const nl = netlistOf(q, q.reference);
    return nl.errors.length ? JSON.stringify(nl.errors) : true;
  });
  t(`golden [${q.id}] netlist(reference) === target`, () => {
    const nl = netlistOf(q, q.reference);
    if (nl.errors.length) return "placement errors, see above";
    const got = normalise(nl.nets, q.dontcare), want = normalise(q.target, q.dontcare);
    return got.join("  ") === want.join("  ")
      ? true : "\n      got : " + got.join("\n            ") +
               "\n      want: " + want.join("\n            ");
  });
  t(`golden [${q.id}] check() passes its own reference layout clean`, () => {
    const res = check(q, clone(q.reference));
    return res.ok ? true : `faults=${JSON.stringify(codes(res))} ${res.faults.map(f => f.msg).join(" | ")}`;
  });
  // "Show the answer" must not show a board the checker warns about (OPEN-JOBS job 4, 17 Oct 2026)
  t(`golden [${q.id}] reference layout raises no warnings`, () => {
    const w = check(q, clone(q.reference)).warnings || [];
    return w.length ? w.map(x => x.code + ": " + x.msg).join(" | ") : true;
  });
  t(`golden [${q.id}] board is the right family (bb-400 or bb-830)`, () => {
    return (q.board === "bb-400" || q.board === "bb-830") || `board is ${q.board}, not a breadboard`;
  });
}

/* ==========================================================================
   Trace bank — "are these two holes connected?"
   ========================================================================== */

t("trace: at least six items, unique ids", () => {
  if (TRACE_QUESTIONS.length < 6) return "expected at least 6 items, got " + TRACE_QUESTIONS.length;
  const ids = TRACE_QUESTIONS.map(i => i.id);
  return eq(ids.length, new Set(ids).size);
});

for (const it of TRACE_QUESTIONS) {
  t(`trace [${it.id}] "${it.title}" — connectivity`, () => {
    const got = sameNet(BOARDS[it.board], it.given, it.a, it.b);
    return got === it.connected ? true
      : `expected ${it.a}/${it.b} connected=${it.connected}, sameNet() says ${got}`;
  });
  t(`trace [${it.id}] given layout has no placement errors`, () => {
    const nl = netlistOf({ id: "t", board: it.board, target: [], dontcare: [] }, it.given);
    return nl.errors.length ? JSON.stringify(nl.errors) : true;
  });
}

/* ==========================================================================
   Fault-finder bank — mutate, and take the engine's own top diagnostic
   ========================================================================== */

const FF = FAULT_ITEMS.map(it => buildFault(it, QUESTIONS, SBD));

t("fault: at least six items, unique ids", () => {
  if (FAULT_ITEMS.length < 6) return "expected at least 6 items, got " + FAULT_ITEMS.length;
  const ids = FAULT_ITEMS.map(i => i.id);
  return eq(ids.length, new Set(ids).size);
});

t("fault: every item breaks its board", () => {
  for (const b of FF) {
    if (b.res.ok && !b.res.warnings.length)
      return b.item.id + ": the mutated board still passes clean — there is no fault to find";
    if (!b.code) return b.item.id + ": no diagnostic at all";
  }
  return true;
});

t("fault: the answer is the engine's own top diagnostic", () => {
  for (const b of FF)
    if (b.code !== b.item.choices[0])
      return b.item.id + ": offered " + b.item.choices[0] + " as the answer but the engine " +
             "reports " + b.code + " (" + b.msg + ")";
  return true;
});

t("fault: every item offers four distinct, named choices", () => {
  for (const it of FAULT_ITEMS) {
    if (it.choices.length !== 4) return it.id + ": " + it.choices.length + " choices, want 4";
    if (new Set(it.choices).size !== 4) return it.id + ": duplicate choices";
    for (const c of it.choices)
      if (!FAULT_NAMES[c]) return it.id + ": choice " + c + " has no pupil-facing name";
  }
  return true;
});

t("fault: the fault really is the mutation, not the board", () => {
  for (const b of FF) {
    const res = check(b.q, clone(b.q.reference));
    if (!res.ok) return b.item.id + ": " + b.q.id + "'s own reference does not pass: " +
                        codes(res).join(",");
  }
  return true;
});

t("fault: each item's why text mentions something real", () => {
  for (const it of FAULT_ITEMS)
    if (!it.why || it.why.length < 60) return it.id + ": why text is missing or too thin";
  return true;
});

t("fault: link-over-chip is exercised at least once (the flagship breadboard rule)", () => {
  return FF.some(b => b.code === "link-over-chip") || "no fault item reaches link-over-chip";
});

/* ==========================================================================
   Reverse bank — layout -> circuit, every answer derived from the record
   ========================================================================== */

t("reverse: at least six items, unique ids", () => {
  if (REVERSE_ITEMS.length < 6) return "expected at least 6 items, got " + REVERSE_ITEMS.length;
  const ids = REVERSE_ITEMS.map(i => i.id);
  return eq(ids.length, new Set(ids).size);
});

for (const it of REVERSE_ITEMS) {
  t(`reverse [${it.id}] derives without error`, () => {
    const out = buildReverse(it, QUESTIONS, SBD);
    if (it.type === "probe" && (!out.nets[0].length || !out.nets[1].length))
      return "a probe net came back empty";
    if (it.type === "rail" && !out.answer.length)
      return "a rail item found nothing connected to it";
    if (it.type === "signal" && !out.answer)
      return "a signal item found no answer pin";
    return true;
  });
}

t("reverse: all three item types are represented", () => {
  const types = new Set(REVERSE_ITEMS.map(i => i.type));
  return (types.has("probe") && types.has("rail") && types.has("signal")) ||
         "missing a type: " + JSON.stringify([...types]);
});

/* ==========================================================================
   The breadboard-specific rules, exercised at the top of the bank
   ========================================================================== */

t("rule: the NPN can rotates on a breadboard, and its three legs land in three nets", () => {
  const Q1 = { id: "Q1", footprint: "npn-can", name: "Q1" };
  const q = { id: "s", board: "bb-400", components: [Q1], target: [], dontcare: [] };
  const a = { cuts: [], placements: [{ id: "Q1", footprint: "npn-can", at: "C10", rot: 90 }],
              links: [], testpoints: [] };
  const nets = netlistOf(q, a).nets;
  const together = nets.filter(n => ["Q1.c", "Q1.b", "Q1.e"].filter(p => n.includes(p)).length > 1);
  return together.length ? "legs share a net: " + JSON.stringify(together) : true;
});

t("rule: one hole, one thing holds on the breadboard Learn bank too", () => {
  const q = QUESTIONS.find(x => x.id === "led-resistor-bb");
  const a = clone(q.reference);
  a.links.push({ a: "C5", b: "F5", colour: "grey", num: 99 }); // C5 is R1's own leg
  return has(check(q, a), "hole-clash") || "no clash on a leg's own hole";
});

/* ========================================================================== */

print("");
print("  Breadboard Builder — engine tests");
print("  " + "-".repeat(66));
if (failures.length) {
  for (const f of failures) print("  FAIL  " + f);
  print("");
}
print(`  ${pass} passed, ${fail} failed`);
print("");
if (fail) throw new Error(fail + " test(s) failed");
