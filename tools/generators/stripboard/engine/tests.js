/* ============================================================================
   Stripboard Builder — engine test harness  (PLAN.md §13)
   ----------------------------------------------------------------------------
   Five layers:
     13.1  segmentation and placement edge cases
     13.2  union-find over links
     13.3  golden — every question's reference layout proves its own target
     13.4  mutation — break the reference one way at a time, assert the
           EXPECTED diagnostic, not merely a failure
     13.5  property — thousands of random boards, invariants not answers

   Run:  ./run.sh
   ============================================================================ */
"use strict";

const { BOARDS, FOOTPRINTS, segmentsOf, makeDSU, topology, netsOf,
        check, netlistOf, placeCheck, parseRef, cellsOf, netOf, sameNet, stageOf } = SBD;

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
const segStr = s => s.map(x => x.from + ".." + x.to).join(",") || "(none)";
const eq = (a, b) => a === b ? true : `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`;

function codes(res) {
  return res.faults.map(f => f.code).concat(res.warnings.map(w => "w:" + w.code));
}
function has(res, code) {
  return res.faults.some(f => f.code === code) || res.warnings.some(w => w.code === code);
}
// deep clone so a mutation never leaks into the next test
const clone = o => JSON.parse(JSON.stringify(o));

/* ==========================================================================
   13.1  segmentation and placement
   ========================================================================== */

const S = (cols, cuts) => segmentsOf(0, cols, new Set(cuts));

t("13.1 no cuts -> one full segment",        () => eq(segStr(S(25, [])), "1..25"));
t("13.1 cut at column 1",                    () => eq(segStr(S(25, [1])), "2..25"));
t("13.1 cut at last column",                 () => eq(segStr(S(25, [25])), "1..24"));
t("13.1 cut in the middle",                  () => eq(segStr(S(25, [11])), "1..10,12..25"));
t("13.1 two adjacent cuts leave no gap",     () => eq(segStr(S(25, [5, 6])), "1..4,7..25"));
t("13.1 two cuts one apart",                 () => eq(segStr(S(25, [5, 7])), "1..4,6..6,8..25"));
t("13.1 every column cut -> no segments",    () => eq(segStr(S(6, [1,2,3,4,5,6])), "(none)"));
t("13.1 whole row cut except the ends",      () => eq(segStr(S(4, [2,3])), "1..1,4..4"));

t("13.1 a cut hole belongs to NO segment (A2)", () => {
  const top = topology(BOARDS["34-0410"], { cuts: ["A5"], placements: [], links: [] });
  return eq(top.nodeOf.has(SBD.hid(parseRef("A5"))), false);
});

t("13.1 pin in a cut hole is rejected", () => {
  const top = topology(BOARDS["34-0410"], {
    cuts: ["A5"], placements: [{ id: "X", footprint: "term-1", at: "A5" }], links: [] });
  return eq(top.errors.some(e => e.code === "pin-in-cut"), true);
});

t("13.1 two pins in one hole is rejected (A8)", () => {
  const top = topology(BOARDS["34-0410"], { cuts: [], links: [], placements: [
    { id: "X", footprint: "term-1", at: "A5" },
    { id: "Y", footprint: "term-1", at: "A5" }] });
  return eq(top.errors.some(e => e.code === "hole-clash"), true);
});

t("13.1 a pin under another part's body is rejected (A5)", () => {
  // R1 across A5..E5 leaves its body in B5, C5, D5
  const top = topology(BOARDS["34-0410"], { cuts: [], links: [], placements: [
    { id: "R1", footprint: "res-4", at: "A5", rot: 90 },
    { id: "X",  footprint: "term-1", at: "C5" }] });
  return eq(top.errors.some(e => e.code === "under-body" || e.code === "hole-clash"), true);
});

t("13.1 a part hanging off the board is rejected (R9)", () => {
  const top = topology(BOARDS["34-0410"], { cuts: [], links: [], placements: [
    { id: "IC1", footprint: "dip-14", at: "F10" }] });   // needs 7 rows; board has 9 (F..L = F,G,H,I = only 4 left)
  return eq(top.errors.some(e => e.code === "off-board"), true);
});

t("13.1 a 14-pin DIL spans 7 tracks, leaving 2 on the small board (§4.3)", () => {
  const cells = cellsOf(FOOTPRINTS["dip-14"], { r: 0, c: 1 }, 0);
  const spans = Math.max(...cells.pins.map(p => p.hole.r)) + 1;
  const spare = BOARDS["34-0410"].rows - spans;
  // it geometrically fits, but 2 spare tracks cannot carry rails AND components,
  // which is why every IC question in the bank is on the large board
  return spans === 7 && spare === 2
    ? true : `spans ${spans} tracks, ${spare} spare on the small board`;
});

t("13.1 R6: a horizontal resistor WITH a cut between its legs is valid", () => {
  // legs A5 and A9, cut at A7 -> different segments, so not a short
  const q = {
    board: "34-0410",
    components: [{ id: "R1", footprint: "res-4" }, { id: "P", footprint: "term-1" },
                 { id: "Q", footprint: "term-1" }],
    target: [["R1.1", "P.1"], ["R1.2", "Q.1"]], dontcare: []
  };
  const res = check(q, { cuts: ["A7"], links: [], placements: [
    { id: "R1", footprint: "res-4", at: "A5" },
    { id: "P",  footprint: "term-1", at: "A2" },
    { id: "Q",  footprint: "term-1", at: "A12" }] });
  return res.ok ? true : "rejected a valid horizontal resistor: " + codes(res).join(",");
});

t("13.1 R6 control: the same resistor with NO cut is a short", () => {
  const q = {
    board: "34-0410",
    components: [{ id: "R1", footprint: "res-4" }, { id: "P", footprint: "term-1" },
                 { id: "Q", footprint: "term-1" }],
    target: [["R1.1", "P.1"], ["R1.2", "Q.1"]], dontcare: []
  };
  const res = check(q, { cuts: [], links: [], placements: [
    { id: "R1", footprint: "res-4", at: "A5" },
    { id: "P",  footprint: "term-1", at: "A2" },
    { id: "Q",  footprint: "term-1", at: "A12" }] });
  return has(res, "self-short") ? true : "missed the short: " + codes(res).join(",");
});

t("13.1 four rotations put a polarised part's pins in the right places", () => {
  const at = { r: 4, c: 5 };
  const p = rot => {
    const c = cellsOf(FOOTPRINTS["led-2"], at, rot);
    const g = n => c.pins.find(x => x.pin === n).hole;
    return SBD.ref(g("a")) + "/" + SBD.ref(g("k"));
  };
  // a 5 mm LED's legs are one pitch apart, so the four rotations put them in
  // the four adjacent holes round the origin
  return eq([p(0), p(90), p(180), p(270)].join(" "),
            "E5/E6 E5/F5 E6/E5 F5/E5");
});

/* ==========================================================================
   13.2  union-find over links
   ========================================================================== */

t("13.2 self-link is harmless", () => {
  const d = makeDSU(); d.union("a", "a");
  return eq(d.find("a"), d.find("a"));
});
t("13.2 chain a-b-c joins all three", () => {
  const d = makeDSU(); d.union("a", "b"); d.union("b", "c");
  return eq(d.find("a"), d.find("c"));
});
t("13.2 cycle a-b-c-a does not loop forever", () => {
  const d = makeDSU(); d.union("a", "b"); d.union("b", "c"); d.union("c", "a");
  return eq(d.find("a"), d.find("b")) === true && eq(d.find("b"), d.find("c"));
});
t("13.2 unrelated keys stay apart", () => {
  const d = makeDSU(); d.union("a", "b");
  return d.find("a") === d.find("z") ? "merged unrelated nodes" : true;
});

t("13.2 a link into a cut hole is rejected", () => {
  const top = topology(BOARDS["34-0410"], {
    cuts: ["A5"], placements: [], links: [{ a: "A5", b: "B5" }] });
  return eq(top.errors.some(e => e.code === "link-in-cut"), true);
});

t("13.2 a link joins two rows into one net", () => {
  const top = topology(BOARDS["34-0410"], { cuts: [], links: [{ a: "A9", b: "B9" }],
    placements: [{ id: "P", footprint: "term-1", at: "A2" },
                 { id: "Q", footprint: "term-1", at: "B2" }] });
  return eq(netsOf(top).size, 1);
});

t("13.2 a pointless cut is a warning, not a fault (rank 9)", () => {
  // cut A7, then link straight over it: electrically nothing happened
  const q = { board: "34-0410",
    components: [{ id: "P", footprint: "term-1" }, { id: "Q", footprint: "term-1" }],
    target: [["P.1", "Q.1"]], dontcare: [] };
  const res = check(q, { cuts: ["A7"], links: [{ a: "A6", b: "A8" }], placements: [
    { id: "P", footprint: "term-1", at: "A2" },
    { id: "Q", footprint: "term-1", at: "A12" }] });
  return res.faults.length === 0 && has(res, "pointless-cut")
    ? true : "faults=" + codes(res).join(",");
});

/* ==========================================================================
   13.3  golden — the reference layout must produce the authored target (R4)
   ========================================================================== */

function normalise(nets, dontcare) {
  const skip = new Set(dontcare || []);
  return nets.map(n => n.filter(x => !skip.has(x)).sort().join("|"))
             .filter(s => s.length).sort();
}

for (const q of QUESTIONS) {
  t(`13.3 [${q.id}] reference layout has no placement errors`, () => {
    const r = netlistOf(q, q.reference);
    return r.errors.length ? r.errors.map(e => e.code + ":" + e.msg).join(" / ") : true;
  });

  t(`13.3 [${q.id}] netlist(reference) === target`, () => {
    const r = netlistOf(q, q.reference);
    if (r.errors.length) return "placement errors, see above";
    const got = normalise(r.nets, q.dontcare);
    const want = normalise(q.target, q.dontcare);
    return got.join("  ") === want.join("  ")
      ? true
      : "\n      got : " + got.join("\n            ") +
        "\n      want: " + want.join("\n            ");
  });

  t(`13.3 [${q.id}] check() passes its own reference layout clean`, () => {
    const res = check(q, q.reference);
    return res.ok ? true
      : "faults=[" + codes(res).join(",") + "] " +
        res.faults.concat(res.warnings).map(f => f.msg).join(" | ");
  });

  t(`13.3 [${q.id}] every component appears in the target`, () => {
    const inTarget = new Set();
    q.target.forEach(n => n.forEach(id => inTarget.add(id.split(".")[0])));
    (q.dontcare || []).forEach(id => inTarget.add(id.split(".")[0]));
    const missing = q.components.map(c => c.id).filter(id => !inTarget.has(id));
    return missing.length ? "not in target: " + missing.join(",") : true;
  });

  t(`13.3 [${q.id}] every pin of every component is accounted for (R1)`, () => {
    const declared = new Set(q.dontcare || []);
    q.target.forEach(n => n.forEach(id => declared.add(id)));
    const missing = [];
    for (const c of q.components) {
      for (const p of FOOTPRINTS[c.footprint].pins) {
        const id = c.id + "." + p.pin;
        if (!declared.has(id)) missing.push(id);
      }
    }
    return missing.length
      ? "undeclared pins (must be in target or dontcare): " + missing.join(",")
      : true;
  });
}

/* ==========================================================================
   13.7  diagonal link wires — a layout-convention fault, not electrical.
         Never accepted, whatever else is right or wrong.
   ========================================================================== */

t("13.7 a diagonal link fails check() even when the netlist otherwise matches", () => {
  const q = QUESTIONS.find(q => q.id === "led-resistor");
  const bent = clone(q.reference);
  // A2(+5V) and D5(R1.1) are on different rows AND different columns — diagonal
  bent.links = [{ a: "A2", b: "D5", colour: "blue", num: 1 }];
  const res = check(q, bent);
  return res.ok ? "a diagonal link was accepted" : has(res, "diagonal-link") ? true
    : "failed for the wrong reason: " + codes(res).join(",");
});

t("13.7 a straight vertical link is NOT flagged diagonal", () => {
  const q = QUESTIONS.find(q => q.id === "lift-interlock");
  return has(check(q, q.reference), "diagonal-link") ? "flagged a straight link as diagonal" : true;
});

t("13.7 a straight horizontal link is NOT flagged diagonal", () => {
  const q = { board: "34-0410", components: [
      { id: "P", footprint: "term-1" }, { id: "Q", footprint: "term-1" }],
    target: [["P.1", "Q.1"]], dontcare: [] };
  const a = { cuts: ["A3"], links: [{ a: "A2", b: "A5", colour: "blue", num: 1 }],
    placements: [{ id: "P", footprint: "term-1", at: "A2" }, { id: "Q", footprint: "term-1", at: "A5" }] };
  return has(check(q, a), "diagonal-link") ? "flagged a straight horizontal link as diagonal" : true;
});

t("13.7 every authored link in the Convert bank is axis-aligned (no false positives)", () => {
  for (const q of QUESTIONS) {
    for (const l of q.reference.links || []) {
      const a = parseRef(l.a), b = parseRef(l.b);
      if (a.r !== b.r && a.c !== b.c)
        return `${q.id}: link ${l.a}-${l.b} is genuinely diagonal — the bank needs fixing, not the check`;
    }
  }
  return true;
});

/* ==========================================================================
   13.8  link wire colour convention — red/black reserved for the supply
         rails; no colour reused across two different signals
   ========================================================================== */

t("13.8 red on a link NOT touching +5V is rejected", () => {
  const q = QUESTIONS.find(q => q.id === "led-resistor");
  const a = clone(q.reference);
  a.links = [{ a: "D9", b: "E9", colour: "red", num: 1 }];   // beside LED1's own two legs, not +5V
  return has(check(q, a), "red-not-supply") ? true : "red on a non-supply net was accepted";
});

t("13.8 black on a link NOT touching 0V is rejected", () => {
  const q = QUESTIONS.find(q => q.id === "led-resistor");
  const a = clone(q.reference);
  a.links = [{ a: "A6", b: "D6", colour: "black", num: 1 }]; // beside R1's own two legs, not 0V
  return has(check(q, a), "black-not-supply") ? true : "black on a non-supply net was accepted";
});

t("13.8 red actually on the +5V net is accepted", () => {
  const q = QUESTIONS.find(q => q.id === "led-resistor");
  const a = clone(q.reference);
  a.links = [{ a: "A3", b: "A6", colour: "red", num: 1 }];   // beside +5V's own terminal to beside R1.1 — same track already, but the link itself is legitimately on that net
  return has(check(q, a), "red-not-supply") ? "red on the +5V net was wrongly rejected" : true;
});

t("13.8 the same colour on two different nets is rejected", () => {
  const q = QUESTIONS.find(q => q.id === "lift-interlock");
  const a = clone(q.reference);
  // both authored links recoloured the same, but H9-I9 and L6-O6 are different nets
  a.links = a.links.map(l => Object.assign({}, l, { colour: "blue" }));
  return has(check(q, a), "colour-reused") ? true : "reusing one colour across two signals was accepted";
});

/* ==========================================================================
   13.9  test-point predictions — the reading the test point is FOR.
         QVSR wants the expected value planned on the layout before the board
         is built, so a placed-but-unpredicted test point is half the job.
   ========================================================================== */

t("13.9 the right prediction passes", () => {
  const q = QUESTIONS.find(q => q.id === "lift-interlock");
  const res = check(q, clone(q.reference));
  return res.ok ? true : "a correct prediction was failed: " + codes(res).join(",");
});

t("13.9 a flipped prediction is caught", () => {
  const q = QUESTIONS.find(q => q.id === "lift-interlock");
  const a = clone(q.reference);
  a.testpoints[0].predict = 1;                    // authored answer is 0
  const res = check(q, a);
  if (!has(res, "wrong-prediction")) return "a wrong prediction was accepted";
  if (res.ok) return "a wrong prediction still passed the board";
  const m = res.faults.find(f => f.code === "wrong-prediction").msg;
  return /A = 1, B = 1, C = 0/.test(m) && /logic 0, not logic 1/.test(m)
    ? true : "the message does not state the inputs and both levels: " + m;
});

t("13.9 a missing prediction is caught", () => {
  const q = QUESTIONS.find(q => q.id === "lift-interlock");
  const a = clone(q.reference);
  delete a.testpoints[0].predict;
  return has(check(q, a), "no-prediction") ? true : "an unpredicted test point was accepted";
});

t("13.9 a question with no expected values is unaffected", () => {
  const q = QUESTIONS.find(q => q.id === "led-resistor");
  const res = check(q, clone(q.reference));
  return has(res, "no-prediction") || has(res, "wrong-prediction")
    ? "a question with no `expect` was asked for a prediction" : true;
});

t("13.9 two test points are marked independently", () => {
  const q = QUESTIONS.find(q => q.id === "two-inverters");
  const a = clone(q.reference);
  a.testpoints[1].predict = 1;                    // TP2's authored answer is 0; TP1 stays right
  const res = check(q, a);
  const wrong = res.faults.filter(f => f.code === "wrong-prediction");
  if (wrong.length !== 1) return "expected exactly one wrong prediction, got " + wrong.length;
  return /TP2/.test(wrong[0].msg) ? true : "the wrong test point was blamed: " + wrong[0].msg;
});

t("13.9 every authored expected level names a real net", () => {
  for (const q of QUESTIONS) {
    if (!q.expect) continue;
    const pins = new Set();
    for (const net of q.target) for (const pin of net) pins.add(pin);
    for (const pin of Object.keys(q.expect.levels))
      if (!pins.has(pin)) return q.id + ": expected level on " + pin + ", which is in no target net";
    for (const pin of q.tpRequired || [])
      if (!(pin in q.expect.levels))
        return q.id + ": " + pin + " needs a test point but has no expected reading";
  }
  return true;
});

/* ==========================================================================
   13.10 sub-system staging — "do the switching board separate from the
         process, and then the output".  A staged question is checked one
         sub-system at a time; everything past the current stage is folded
         into `dontcare`, so an early stage marks only its own wiring.
   ========================================================================== */

// the reference board with every part later than stage `k` taken off it —
// which is what a pupil actually has in front of them part-way through
function upToStage(q, k) {
  const unlocked = new Set();
  for (let i = 0; i <= k; i++) for (const id of q.stages[i].parts) unlocked.add(id);
  const a = clone(q.reference);
  a.placements = a.placements.filter(p => unlocked.has(p.id));
  a.testpoints = [];
  return a;
}
const STAGED = QUESTIONS.filter(q => q.stages && q.stages.length);

t("13.10 there are staged questions to test", () =>
  STAGED.length >= 5 ? true : "expected at least 5 staged questions, found " + STAGED.length);

t("13.10 every component belongs to exactly one stage", () => {
  for (const q of STAGED) {
    const seen = new Map();
    for (const st of q.stages) for (const id of st.parts) {
      if (seen.has(id)) return q.id + ": " + id + " is in two stages";
      seen.set(id, true);
    }
    const comps = new Set(q.components.map(c => c.id));
    for (const id of seen.keys())
      if (!comps.has(id)) return q.id + ": stage names " + id + ", which is not a component";
    for (const id of comps)
      if (!seen.has(id)) return q.id + ": " + id + " is in no stage, so it can never be placed";
  }
  return true;
});

t("13.10 the last stage is the whole question, unchanged", () => {
  for (const q of STAGED) {
    if (stageOf(q, q.stages.length - 1) !== q) return q.id + ": the last stage is not the question itself";
    if (stageOf(q, 99) !== q) return q.id + ": an out-of-range stage did not fall back to the whole question";
  }
  return true;
});

t("13.10 stage 1 passes with only stage 1's parts on the board", () => {
  for (const q of STAGED) {
    const res = check(stageOf(q, 0), upToStage(q, 0));
    if (!res.ok) return q.id + " stage 1 was failed: " + codes(res).join(",") +
                        " — " + (res.faults[0] && res.faults[0].msg);
  }
  return true;
});

t("13.10 stage 1 never asks for a part from a later stage", () => {
  for (const q of STAGED) {
    const later = new Set();
    for (let i = 1; i < q.stages.length; i++) for (const id of q.stages[i].parts) later.add(id);
    const res = check(stageOf(q, 0), upToStage(q, 0));
    for (const f of res.faults)
      for (const r of f.refs || [])
        if (later.has(String(r).split(".")[0]))
          return q.id + ": stage 1 complained about " + r + ", which belongs to a later stage";
  }
  return true;
});

t("13.10 stage 1 still catches a stage 1 fault", () => {
  const q = QUESTIONS.find(q => q.id === "lift-interlock");
  const a = upToStage(q, 0);
  a.cuts = a.cuts.slice(1);                      // one cut short under the chip
  const res = check(stageOf(q, 0), a);
  if (res.ok) return "a missing cut passed stage 1";
  return has(res, "dil-uncut") ? true : "wrong diagnostic for a missing cut: " + codes(res).join(",");
});

t("13.10 running ahead is not punished at stage 1", () => {
  for (const q of STAGED) {
    // the FULL reference board, checked at stage 1: a pupil who has already
    // built the output sub-system must still pass the earlier stage
    const a = clone(q.reference); a.testpoints = [];
    const res = check(stageOf(q, 0), a);
    if (!res.ok) return q.id + ": a complete board was failed at stage 1: " + codes(res).join(",");
  }
  return true;
});

t("13.10 the final stage still demands the test points", () => {
  const q = QUESTIONS.find(q => q.id === "lift-interlock");
  const a = clone(q.reference); a.testpoints = [];
  const last = stageOf(q, q.stages.length - 1);
  return has(check(last, a), "no-testpoint") ? true
    : "the final stage let a missing test point through";
});

/* ==========================================================================
   13.11 Fault-finder bank (PLAN.md §4.1, Mode 3).  Each item is a correct
         reference board with one thing broken, and the answer key is the
         engine's OWN top diagnostic — so an item cannot describe a fault the
         Convert check would not report on the same board.
   ========================================================================== */

const FF = FAULT_ITEMS.map(it => buildFault(it, QUESTIONS, SBD));

t("13.11 the bank has items and their ids are unique", () => {
  if (FAULT_ITEMS.length < 10) return "expected at least 10 items, got " + FAULT_ITEMS.length;
  const ids = FAULT_ITEMS.map(i => i.id);
  return eq(ids.length, new Set(ids).size);
});

t("13.11 every item breaks its board", () => {
  for (const b of FF) {
    if (b.res.ok && !b.res.warnings.length)
      return b.item.id + ": the mutated board still passes clean — there is no fault to find";
    if (!b.code) return b.item.id + ": no diagnostic at all";
  }
  return true;
});

t("13.11 the answer is the engine's own top diagnostic", () => {
  for (const b of FF)
    if (b.code !== b.item.choices[0])
      return b.item.id + ": offered " + b.item.choices[0] + " as the answer but the engine " +
             "reports " + b.code + " (" + b.msg + ")";
  return true;
});

t("13.11 every item offers four distinct, named choices", () => {
  for (const it of FAULT_ITEMS) {
    if (it.choices.length !== 4) return it.id + ": " + it.choices.length + " choices, want 4";
    if (new Set(it.choices).size !== 4) return it.id + ": duplicate choices";
    for (const c of it.choices)
      if (!FAULT_NAMES[c]) return it.id + ": choice " + c + " has no pupil-facing name";
  }
  return true;
});

t("13.11 the fault really is the mutation, not the board", () => {
  // every item's UNbroken reference must pass clean, or the item is testing
  // something that was already wrong
  for (const b of FF) {
    const res = check(b.q, clone(b.q.reference));
    if (!res.ok) return b.item.id + ": " + b.q.id + "'s own reference does not pass: " +
                        codes(res).join(",");
  }
  return true;
});

t("13.11 each item's why text mentions something real", () => {
  for (const it of FAULT_ITEMS)
    if (!it.why || it.why.length < 60) return it.id + ": why text is missing or too thin";
  return true;
});

/* ==========================================================================
   13.12 Reverse bank (PLAN.md §4.1, Mode 4) — layout -> circuit, the direction
         CR25 singles out.  Every answer is DERIVED from the question record,
         so a Reverse item cannot disagree with what Convert marks on the same
         board.  These tests check the derivation, not a stored answer.
   ========================================================================== */

const RV = REVERSE_ITEMS.map(it => buildReverse(it, QUESTIONS, SBD));

t("13.12 the bank has items and their ids are unique", () => {
  if (REVERSE_ITEMS.length < 10) return "expected at least 10 items, got " + REVERSE_ITEMS.length;
  const ids = REVERSE_ITEMS.map(i => i.id);
  return eq(ids.length, new Set(ids).size);
});

t("13.12 every item shows a board that is actually correct", () => {
  for (const b of RV) {
    const res = check(b.q, clone(b.q.reference));
    if (!res.ok) return b.item.id + ": " + b.q.id + "'s reference does not pass — " +
                        "a Reverse item must ask about a RIGHT board";
  }
  return true;
});

t("13.12 probe items give two separate, non-empty nets", () => {
  for (const b of RV.filter(x => x.type === "probe")) {
    if (b.nets.length !== 2) return b.item.id + ": expected two nets";
    if (!b.nets[0].length || !b.nets[1].length) return b.item.id + ": an empty net";
    const a = new Set(b.nets[0]);
    if (b.nets[1].some(h => a.has(h)))
      return b.item.id + ": the two legs share a net, so there is nothing to measure";
  }
  return true;
});

t("13.12 probe nets agree with sameNet()", () => {
  for (const b of RV.filter(x => x.type === "probe")) {
    const board = BOARDS[b.q.board];
    // every hole the item would accept on side 0 really is on side 0's net
    const head = b.nets[0][0];
    for (const h of b.nets[0])
      if (!sameNet(board, b.attempt, head, h))
        return b.item.id + ": " + h + " is listed in a net it is not on";
    if (sameNet(board, b.attempt, b.nets[0][0], b.nets[1][0]))
      return b.item.id + ": the two probe nets are actually the same net";
  }
  return true;
});

t("13.12 rail items have a real answer inside their options", () => {
  for (const b of RV.filter(x => x.type === "rail")) {
    if (!b.answer.length) return b.item.id + ": nothing is on that rail";
    for (const id of b.answer)
      if (b.options.indexOf(id) < 0) return b.item.id + ": " + id + " is not offered";
    if (b.answer.length === b.options.length)
      return b.item.id + ": every option is correct, so there is nothing to decide";
  }
  return true;
});

t("13.12 signal items offer four distinct pins, including the answer", () => {
  for (const b of RV.filter(x => x.type === "signal")) {
    if (b.options.length !== 4) return b.item.id + ": " + b.options.length + " options, want 4";
    if (new Set(b.options).size !== 4) return b.item.id + ": duplicate options";
    if (b.options.indexOf(b.answer) < 0) return b.item.id + ": the answer is not offered";
  }
  return true;
});

t("13.12 a signal item never offers a supply pin as a distractor", () => {
  for (const b of RV.filter(x => x.type === "signal")) {
    const supply = new Set();
    for (const c of b.q.components) {
      if (!c.pos && !c.neg) continue;
      const net = b.q.target.find(n => n.indexOf(c.id + ".1") >= 0) || [];
      for (const pin of net) supply.add(pin);
    }
    for (const o of b.options)
      if (o !== b.answer && supply.has(o))
        return b.item.id + ": " + o + " is a supply pin — ruled out without reading the board";
  }
  return true;
});

t("13.12 the answer is not always the first option", () => {
  const sig = RV.filter(x => x.type === "signal");
  return sig.every(b => b.options[0] === b.answer)
    ? "every signal item lists its answer first" : true;
});

t("13.12 every item has why text", () => {
  for (const it of REVERSE_ITEMS)
    if (!it.why || it.why.length < 60) return it.id + ": why text is missing or too thin";
  return true;
});

/* ==========================================================================
   13.13 Free mode (PLAN.md §4.1's fifth mode, added after the alpha).  There
         is no target, so there is nothing to assert an answer against — what
         these test instead is the DERIVATION: that handing check() the pupil's
         own netlist as its target really does silence every target-dependent
         rank and leave every structural one firing.  If that stops being true,
         Free mode starts inventing faults on correct boards and these fail.
   ========================================================================== */

const FREE = SBD.free;
// the lift interlock: a chip question, so the chip-specific ranks have something
// to fire on.  No fallback — a silent fallback to whatever sits at QUESTIONS[1]
// is how two of these tests came to "fail" against the wrong circuit.
const freeQ2 = (() => {
  const q = QUESTIONS.find(x => x.id === "lift-interlock");
  if (!q) throw new Error("13.13 needs the lift-interlock question and it is gone");
  return q;
})();

/* 13.7b The other half of the link-colour convention. Reported by a pupil on
   alpha v0.10: a BLUE link onto the 0 V rail passed. Red and black are reserved
   for the supply, and the reservation runs both ways — a link that lands on a
   rail has to use that rail's colour. Two of the bank's own reference layouts
   broke this and were recoloured. */
const colourQ = QUESTIONS.find(q => q.id === "lift-interlock");
function withLink(link){
  const a = clone(colourQ.reference);
  a.links.push(Object.assign({ num: a.links.length + 1 }, link));
  return SBD.check(colourQ, a);
}
t("13.7b a link on the 0 V rail must be black", () => {
  // O6 is on the 0 V rail; F2 is an input terminal's track
  const bad = withLink({ a: "O6", b: "O2", colour: "blue" });
  if (!bad.faults.some(f => f.code === "supply-not-black"))
    return "a blue link onto the 0 V rail passed: " + bad.faults.map(f => f.code).join(",");
  const good = withLink({ a: "O6", b: "O2", colour: "black" });
  return good.faults.some(f => f.code === "supply-not-black")
    ? "a black link onto the 0 V rail was rejected" : true;
});

t("13.7b a link on the +5 V rail must be red", () => {
  const bad = withLink({ a: "F2", b: "F4", colour: "green" });
  const posNet = bad.faults.some(f => f.code === "supply-not-red");
  // F2/F4 are not the +5 V rail — this is the control: no colour fault expected
  if (posNet) return "a fault fired on a link that is not on a rail";
  return true;
});

t("13.7b the rules stand down when a fault has shorted the rails", () => {
  // FF4's mutation: a link joining the two rails. With one merged net, "which
  // rail is this on" has no answer, so the short is what gets reported.
  const a = clone(colourQ.reference);
  a.links.push({ a: "F21", b: "O21", colour: "purple", num: 9 });
  const res = SBD.check(colourQ, a);
  if (res.faults.some(f => f.code === "supply-not-red" || f.code === "supply-not-black"))
    return "a colour fault fired on a board whose rails are shorted together";
  return res.faults.length ? true : "the short itself went unreported";
});

t("13.13 the palette is well formed and every footprint is real", () => {
  const keys = FREE.PALETTE.map(p => p.key);
  if (keys.length !== new Set(keys).size) return "duplicate palette keys";
  for (const p of FREE.PALETTE) {
    if (!FOOTPRINTS[p.footprint]) return p.key + ": unknown footprint " + p.footprint;
    if (!p.prefix || !p.name || !p.sub) return p.key + ": missing prefix, name or sub-label";
  }
  return true;
});

t("13.13 every chip on the palette is on the data sheet, and vice versa", () => {
  const onPalette = FREE.PALETTE.filter(p => p.part).map(p => p.part).sort();
  const known = Object.keys(FREE.POWER_PINS).sort();
  if (onPalette.join(",") !== known.join(","))
    return "palette chips " + onPalette.join(",") + " but power pins for " + known.join(",");
  // a pupil cannot look up a pinout that is not there, so the two must agree
  for (const p of FREE.PALETTE.filter(x => x.part))
    if (FREE.POWER_PINS[p.part].footprint !== p.footprint)
      return p.part + " is a " + p.footprint + " on the palette but a " +
             FREE.POWER_PINS[p.part].footprint + " in the pin table";
  return true;
});

t("13.13 ids are minted in order, and freed numbers come back", () => {
  let comps = [];
  for (const want of ["R1", "R2", "R3"]) {
    const c = FREE.mint(comps, "res");
    if (c.id !== want) return "expected " + want + ", got " + c.id;
    comps.push(c);
  }
  comps = comps.filter(c => c.id !== "R2");           // pupil takes R2 off the board
  const back = FREE.mint(comps, "res");
  if (back.id !== "R2") return "after removing R2 the next resistor is " + back.id;
  // capacitors share one stem whether they are polarised or not
  comps.push(FREE.mint(comps, "cap"));
  const e = FREE.mint(comps, "ecap");
  return eq(e.id, "C2");
});

t("13.13 a minted part remembers the palette tile it came from", () => {
  // four palette entries share the term-1 footprint, so the bank cannot work
  // out which tile to open from the footprint alone
  const comps = [];
  for (const spec of FREE.PALETTE) {
    const c = FREE.mint(comps, spec.key);
    if (!c) return spec.key + ": minted nothing";
    if (c.key !== spec.key) return c.id + " came back keyed " + c.key + ", not " + spec.key;
    comps.push(c);
  }
  return true;
});

/* Supply terminals are numbered, not one-per-board (pupil feedback 21 Sep 2026,
   plan D8).  A wiring schedule lists every wire leaving the board, so a pupil
   must be able to bring +5 V or 0 V off at more than one point. */
t("13.13 supply terminals are numbered in brackets and repeatable", () => {
  const pos = FREE.mint([], "pos");
  if (pos.id !== "+5V(1)" || !pos.pos) return "first +5 V minted as " + pos.id;
  const pos2 = FREE.mint([pos], "pos");
  if (!pos2) return "a second +5 V terminal was refused";
  if (pos2.id !== "+5V(2)") return "second +5 V minted as " + pos2.id;
  if (!pos2.pos) return "the second +5 V terminal is not flagged as a supply";
  const neg = FREE.mint([pos, pos2], "neg");
  if (neg.id !== "0V(1)" || !neg.neg) return "first 0 V minted as " + neg.id;
  return eq(FREE.mint([pos, pos2, neg], "neg").id, "0V(2)");
});

t("13.13 a freed supply number is reused, like every other part", () => {
  const pos1 = FREE.mint([], "pos"), pos2 = FREE.mint([pos1], "pos");
  // pos1 taken off the board: the next mint fills the gap rather than going to 3
  return eq(FREE.mint([pos2], "pos").id, "+5V(1)");
});

t("13.13 a minted part is one placeCheck accepts", () => {
  const comps = [], a = { cuts: [], placements: [], links: [], testpoints: [] };
  for (const key of FREE.PALETTE.map(p => p.key)) {
    const c = FREE.mint(comps, key);
    if (!c) return key + ": minted nothing";
    comps.push(c);
    const at = "A1";
    const q = FREE.freeQ("34-0411", comps);
    const v = placeCheck(q, a, { id: c.id, footprint: c.footprint, at, rot: 0 });
    if (!v.ok && !/overlap|already has a leg/.test(v.msg))
      return key + ": " + v.msg;
  }
  return true;
});

/* The load-bearing one.  A correct board, checked with no target, must come
   back clean — no merged, no split, no floating, no unplaced. */
t("13.13 a correct board passes freeCheck with nothing invented", () => {
  const res = FREE.freeCheck(freeQ2.board, clone(freeQ2.reference), freeQ2.components);
  const bad = res.faults.map(f => f.code);
  if (bad.length) return "faults on a correct board: " + bad.join(",");
  const targetOnly = res.warnings.filter(w => ["reversed"].indexOf(w.code) >= 0);
  if (targetOnly.length) return "a target-dependent warning fired with no target";
  return true;
});

t("13.13 every question's reference layout passes freeCheck", () => {
  for (const q of QUESTIONS) {
    const res = FREE.freeCheck(q.board, clone(q.reference), q.components);
    if (res.faults.length)
      return q.id + ": " + res.faults.map(f => f.code + " — " + f.msg).join(" | ");
  }
  return true;
});

t("13.13 the structural ranks still fire without a target", () => {
  // an uncut chip
  const a = clone(freeQ2.reference);
  a.cuts = [];
  const res = FREE.freeCheck(freeQ2.board, a, freeQ2.components);
  if (!res.faults.some(f => f.code === "dil-uncut"))
    return "an uncut chip passed: " + res.faults.map(f => f.code).join(",") || "(nothing)";

  // a diagonal link
  const b = clone(freeQ2.reference);
  b.links.push({ a: "A1", b: "C3", colour: "green", num: 99 });
  if (!FREE.freeCheck(freeQ2.board, b, freeQ2.components).faults.some(f => f.code === "diagonal-link"))
    return "a diagonal link passed";

  // red on something that is not the +5 V rail
  const c = clone(freeQ2.reference);
  c.links.push({ a: "A1", b: "A4", colour: "red", num: 98 });
  if (!FREE.freeCheck(freeQ2.board, c, freeQ2.components).faults.some(f => f.code === "red-not-supply"))
    return "a red link off the supply passed";
  return true;
});

t("13.13 supply-short fires only when the two rails really touch", () => {
  const comps = [FREE.mint([], "pos")];
  comps.push(FREE.mint(comps, "neg"));
  const same = { cuts: [], links: [], testpoints: [],
    placements: [{ id: comps[0].id, footprint: "term-1", at: "A2" },
                 { id: comps[1].id, footprint: "term-1", at: "A9" }] };
  const hit = FREE.freeCheck("34-0410", same, comps);
  if (!hit.faults.some(f => f.code === "supply-short")) return "a dead short passed";

  const apart = clone(same);
  apart.placements[1].at = "C9";
  if (FREE.freeCheck("34-0410", apart, comps).faults.some(f => f.code === "supply-short"))
    return "two rails on different tracks were called a short";

  // a cut between them is the fix, and it must be recognised as one
  const cut = clone(same);
  cut.cuts = ["A5"];
  return FREE.freeCheck("34-0410", cut, comps).faults.some(f => f.code === "supply-short")
    ? "a cut between the rails did not clear the short" : true;
});

/* Free mode hands check() the pupil's own netlist as the target, so every
   comparison rank matches by construction — which left it silent about how
   many parts share a pair of nets.  Both reported by pupils, 21 Sep 2026. */
function twoLegBoard(places) {
  const comps = [FREE.mint([], "pos")];
  comps.push(FREE.mint(comps, "neg"));
  for (const p of places) comps.push(FREE.mint(comps, p.key));
  const placements = [{ id: comps[0].id, footprint: "term-1", at: "A1" },
                      { id: comps[1].id, footprint: "term-1", at: "I1" }];
  places.forEach((p, i) => placements.push(
    { id: comps[i + 2].id, footprint: comps[i + 2].footprint, at: p.at, rot: p.rot || 0 }));
  return { comps, a: { cuts: [], links: [], testpoints: [], placements } };
}

t("13.13 a part with both legs on one track is a shorted-out FAULT", () => {
  // R1 lies ALONG track G, so both its ends are on the same copper
  const { comps, a } = twoLegBoard([{ key: "res", at: "G12", rot: 0 }]);
  const res = FREE.freeCheck("34-0411", a, comps);
  const f = res.faults.find(x => x.code === "part-shorted");
  if (!f) return "no part-shorted fault: " + codes(res).join(", ");
  if (!/R1/.test(f.msg)) return "the fault does not name R1: " + f.msg;
  return res.ok === false ? true : "a shorted part still passed Check";
});

t("13.13 two parts bridging the same two tracks are a parallel WARNING", () => {
  // both stand across tracks C..F, so each has both ends on the same two nets
  const { comps, a } = twoLegBoard([{ key: "res", at: "C3", rot: 90 },
                                    { key: "res", at: "C8", rot: 90 }]);
  const res = FREE.freeCheck("34-0411", a, comps);
  const w = res.warnings.find(x => x.code === "parts-parallel");
  if (!w) return "no parts-parallel warning: " + codes(res).join(", ");
  if (!/R1/.test(w.msg) || !/R2/.test(w.msg)) return "does not name both: " + w.msg;
  if (!/LESS resistance/.test(w.msg)) return "two resistors got the generic wording: " + w.msg;
  // legal electronics, sometimes deliberate: a warning must not fail the board
  return res.faults.some(x => x.code === "parts-parallel")
    ? "parallel was raised as a fault, not a warning" : true;
});

t("13.13 parts on DIFFERENT pairs of tracks are not called parallel", () => {
  const { comps, a } = twoLegBoard([{ key: "res", at: "C3", rot: 90 },
                                    { key: "res", at: "E8", rot: 90 }]);
  const res = FREE.freeCheck("34-0411", a, comps);
  return res.warnings.some(x => x.code === "parts-parallel")
    ? "two unrelated resistors were called parallel" : true;
});

t("13.14 two links between the same two tracks: the second is a WARNING, not a fault", () => {
  const { comps, a } = twoLegBoard([]);
  a.links.push({ a: "C3", b: "F3", colour: "black", num: 1 },
               { a: "C6", b: "F6", colour: "black", num: 2 });
  const res = FREE.freeCheck("34-0411", a, comps);
  const w = res.warnings.find(x => x.code === "links-parallel");
  if (!w) return "no links-parallel warning: " + codes(res).join(", ");
  if (!/the second is not needed/.test(w.msg)) return "wording: " + w.msg;
  if (w.refs.join() !== "C6,F6") return "should ring only the second link: " + w.refs.join();
  return res.faults.some(x => x.code === "links-parallel")
    ? "raised as a fault, not a warning" : true;
});

t("13.14 links between DIFFERENT pairs of tracks are not called parallel", () => {
  const { comps, a } = twoLegBoard([]);
  a.links.push({ a: "C3", b: "F3", colour: "blue", num: 1 },
               { a: "C6", b: "G6", colour: "green", num: 2 });
  const res = FREE.freeCheck("34-0411", a, comps);
  return res.warnings.some(x => x.code === "links-parallel")
    ? "links on different track pairs were called parallel" : true;
});

t("13.14 three links on one pair: all but the first are extra", () => {
  const { comps, a } = twoLegBoard([]);
  a.links.push({ a: "C3", b: "F3", colour: "red", num: 1 },
               { a: "C5", b: "F5", colour: "red", num: 2 },
               { a: "C7", b: "F7", colour: "red", num: 3 });
  const w = FREE.freeCheck("34-0411", a, comps).warnings.find(x => x.code === "links-parallel");
  if (!w) return "no warning";
  return /all but the first are/.test(w.msg) && w.refs.length === 4 ? true : "wording/refs: " + w.msg + " " + w.refs;
});

t("13.14 a link with both ends on one track does nothing — warned", () => {
  const { comps, a } = twoLegBoard([]);
  a.links.push({ a: "C3", b: "C8", colour: "blue", num: 1 });
  const res = FREE.freeCheck("34-0411", a, comps);
  return res.warnings.some(x => x.code === "link-same-track")
    ? true : "no link-same-track warning: " + codes(res).join(", ");
});

t("13.14 a link that joins two different tracks is never called same-track", () => {
  const { comps, a } = twoLegBoard([]);
  a.links.push({ a: "C3", b: "F3", colour: "blue", num: 1 });
  return FREE.freeCheck("34-0411", a, comps).warnings.some(x => x.code === "link-same-track")
    ? "a useful link was called pointless" : true;
});

t("13.14 two test points on one run of copper: warned; on different runs: not", () => {
  const { comps, a } = twoLegBoard([]);
  a.testpoints.push({ id: "TP1", at: "D2" }, { id: "TP2", at: "D9" });
  if (!FREE.freeCheck("34-0411", a, comps).warnings.some(x => x.code === "testpoints-same-net"))
    return "two test points on track D were not flagged";
  const b = twoLegBoard([]).a;
  b.testpoints.push({ id: "TP1", at: "D2" }, { id: "TP2", at: "E9" });
  return FREE.freeCheck("34-0411", b, comps).warnings.some(x => x.code === "testpoints-same-net")
    ? "test points on different tracks were flagged" : true;
});

t("13.13 a chip is never called shorted — the rule is 2-legged parts only", () => {
  const comps = [FREE.mint([], "555")];
  const a = { cuts: [], links: [], testpoints: [],
              placements: [{ id: comps[0].id, footprint: "dip-8", at: "C3" }] };
  const res = FREE.freeCheck("34-0411", a, comps);
  return res.faults.some(x => x.code === "part-shorted")
    ? "a chip was reported as shorted out" : true;
});

t("13.13 chip-unpowered names the right pins, off the data sheet", () => {
  // Q2's reference has IC1 pin 14 on +5 V and pin 7 on 0 V — no warning
  const good = FREE.freeCheck(freeQ2.board, clone(freeQ2.reference), freeQ2.components);
  if (good.warnings.some(w => w.code === "chip-unpowered"))
    return "a powered chip was reported unpowered";

  // cut pin 14 loose by removing the link that feeds it
  const a = clone(freeQ2.reference);
  const posNet = freeQ2.target.find(n => n.indexOf("+5V.1") >= 0);
  if (!posNet || posNet.indexOf("IC1.14") < 0) return "Q2 no longer feeds pin 14 from +5 V";
  a.placements = a.placements.filter(p => p.id !== "+5V");
  const res = FREE.freeCheck(freeQ2.board, a, freeQ2.components.filter(c => c.id !== "+5V"));
  if (!res.warnings.some(w => w.code === "no-supply"))
    return "removing the +5 V terminal was not noticed";
  return true;
});

/* Grouped by component, not one per leg: a 14-pin chip on a blank board used to
   produce fourteen identical warnings, which buried everything else. */
t("13.13 lone legs are reported once per component, not once per leg", () => {
  const comps = [FREE.mint([], "res")];
  const b = { cuts: [], links: [], testpoints: [],
              placements: [{ id: "R1", footprint: "res-4", at: "A1", rot: 90 }] };
  const lone = FREE.freeCheck("34-0410", b, comps).warnings.filter(w => w.code === "lone-pin");
  if (lone.length !== 1) return "a resistor across two empty tracks gave " + lone.length +
                                " lone-pin warnings, expected 1";
  if (!/not wired up yet/.test(lone[0].msg))
    return "a part with nothing wired to it should say so once: " + lone[0].msg;

  // a whole chip, unwired, is still one line
  const chip = [FREE.mint([], "7408")];
  const c = { cuts: ["B11","C11","D11","E11","F11","G11","H11"], links: [], testpoints: [],
              placements: [{ id: "IC1", footprint: "dip-14", at: "B10", rot: 0 }] };
  const chipLone = FREE.freeCheck("34-0410", c, chip).warnings.filter(w => w.code === "lone-pin");
  if (chipLone.length !== 1) return "an unwired 14-pin chip gave " + chipLone.length + " lines";
  if (!/all 14 of its legs/.test(chipLone[0].msg)) return "count is wrong: " + chipLone[0].msg;

  // a one-legged part never says "all 1 of its legs"
  const one = [FREE.mint([], "pos")];
  const e = { cuts: [], links: [], testpoints: [],
              placements: [{ id: "+5V", footprint: "term-1", at: "A2" }] };
  const oneLone = FREE.freeCheck("34-0410", e, one).warnings.filter(w => w.code === "lone-pin");
  if (oneLone.some(w => /all 1 of/.test(w.msg))) return "bad grammar: " + oneLone[0].msg;

  // but a part wired at ONE end still names the leg that was forgotten
  const both = [FREE.mint([], "res")];
  both.push(FREE.mint(both, "led"));
  const d = { cuts: [], links: [], testpoints: [],
              placements: [{ id: "R1",   footprint: "res-4", at: "A1", rot: 90 },
                           { id: "LED1", footprint: "led-2", at: "D1", rot: 90 }] };
  const some = FREE.freeCheck("34-0410", d, both).warnings.filter(w => w.code === "lone-pin");
  if (some.some(w => /not wired up yet/.test(w.msg) && /R1/.test(w.msg)))
    return "R1 shares a track with the LED, so it is not unwired";
  return true;
});

t("13.13 netReport partitions every pin exactly once and agrees with sameNet", () => {
  for (const q of QUESTIONS) {
    const nets = FREE.netReport(q.board, clone(q.reference), q.components);
    if (!nets) return q.id + ": netReport refused a correct board";
    const board = BOARDS[q.board];
    const seen = new Set();
    for (const n of nets) {
      for (const h of n.holes) {
        if (seen.has(h)) return q.id + ": " + h + " is in two nets";
        seen.add(h);
      }
      const head = n.holes[0];
      for (const h of n.holes)
        if (!sameNet(board, q.reference, head, h))
          return q.id + ": " + h + " is listed on a net it is not on";
    }
    // every placed pin appears in exactly one net's parts list
    const top = topology(board, q.reference);
    const pinCount = top.pins.length;
    const listed = nets.reduce((n, x) => n + x.parts.length, 0);
    if (listed !== pinCount) return q.id + ": " + listed + " legs reported, board has " + pinCount;
  }
  return true;
});

t("13.13 runsOf collapses contiguous holes and splits at a gap", () => {
  const runs = FREE.runsOf([{ r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 },
                            { r: 0, c: 7 }, { r: 2, c: 4 }]);
  return eq(runs.map(x => x.text).join(" "), "A1–A3 A7 C4");
});

/* ==========================================================================
   13.6  Trace mode bank — golden tests over TRACE_QUESTIONS (PLAN.md §4.1,
         Mode 1). Each item's `connected` claim is asserted against
         SBD.sameNet() on its own `given` layout: a wrong item fails the
         harness before a pupil ever sees it, same rule as 13.3.
   ========================================================================== */

t("13.6 netOf and sameNet agree with topology()'s own dsu", () => {
  // A2..A5 on the led-resistor board are one unbroken track (no cuts at all)
  const board = BOARDS["34-0410"];
  const given = QUESTIONS.find(q => q.id === "led-resistor").reference;
  const holes = netOf(board, given, "A2");
  if (!holes.includes("A5")) return "A5 missing from A2's net: " + holes.join(",");
  return sameNet(board, given, "A2", "A5") === true ? true : "sameNet disagreed with netOf";
});

t("13.6 netOf returns null for a cut hole (A2 — no segment)", () => {
  const board = BOARDS["34-0410"];
  return eq(netOf(board, { cuts: ["A5"], placements: [], links: [] }, "A5"), null);
});

for (const item of TRACE_QUESTIONS) {
  t(`13.6 [${item.id}] "${item.title}" — connectivity`, () => {
    const board = BOARDS[item.board];
    const got = sameNet(board, item.given, item.a, item.b);
    return got === item.connected ? true
      : `expected ${item.a}/${item.b} connected=${item.connected}, sameNet() says ${got}`;
  });

  t(`13.6 [${item.id}] reference layout has no placement errors`, () => {
    const top = topology(BOARDS[item.board], item.given);
    return top.errors.length ? top.errors.map(e => e.code + ":" + e.msg).join(" / ") : true;
  });
}

t("13.6 IDs are unique across the Trace bank", () => {
  const ids = TRACE_QUESTIONS.map(i => i.id);
  return eq(ids.length, new Set(ids).size);
});

/* ==========================================================================
   13.4  mutation — prove the diagnostics.  These same mutations are the
         Fault-finder mode's content (PLAN.md §13.4).
   ========================================================================== */

const Q = QUESTIONS.find(q => q.id === "lift-interlock");

const MUTATIONS = [
  { name: "remove one cut under the DIL", expect: "dil-uncut",
    apply: a => { a.cuts = a.cuts.filter(c => c !== "H11"); } },

  { name: "lay the chip along the tracks", expect: "dil-along-tracks",
    apply: a => { a.cuts = ["I7"]; a.placements.find(p => p.id === "IC1").rot = 90; } },

  { name: "cut in the wrong place (outside the pin rows)", expect: "dil-uncut",
    apply: a => { a.cuts = a.cuts.map(c => c === "F11" ? "F15" : c); } },

  { name: "delete the gate a -> gate b link", expect: "split",
    apply: a => { a.links = a.links.filter(l => l.a !== "H9"); } },

  { name: "short a resistor by laying it along one track", expect: "self-short",
    apply: a => { const r = a.placements.find(p => p.id === "R1");
                  r.rot = 0; r.at = "B3"; } },

  { name: "join the two supply rails with a link", expect: "merged",
    apply: a => { a.links.push({ a: "F21", b: "L2", colour: "red", num: 9 }); } },

  { name: "leave a component in the bank", expect: "unplaced",
    apply: a => { a.placements = a.placements.filter(p => p.id !== "LED1"); } },

  { name: "strip the test points", expect: "no-testpoint",
    apply: a => { a.testpoints = []; } },

  { name: "fit the LED the wrong way round", expect: "reversed",
    apply: a => { a.placements.find(p => p.id === "LED1").rot = 270; } },

  { name: "strand one pin of the 0 V net on its own track", expect: "floating",
    apply: a => { a.placements.find(p => p.id === "0V").at = "X2"; } }
];

for (const m of MUTATIONS) {
  t(`13.4 [${m.name}] -> ${m.expect}`, () => {
    const a = clone(Q.reference);
    m.apply(a);
    const res = check(Q, a);
    if (res.ok) return "the mutated board still passed";
    return has(res, m.expect) ? true
      : `got [${codes(res).join(",")}] :: ` +
        res.faults.concat(res.warnings).map(f => f.msg).join(" | ");
  });
}

t("13.4 every mutation is actually rejected", () => {
  const survivors = MUTATIONS.filter(m => {
    const a = clone(Q.reference); m.apply(a); return check(Q, a).ok;
  }).map(m => m.name);
  return survivors.length ? "passed when it should not: " + survivors.join("; ") : true;
});

t("13.4 R1: tying the spare gate inputs to 0 V still passes", () => {
  const a = clone(Q.reference);
  /* IC1.9 and IC1.10 are gate c's unused inputs, at K13 and J13 — right of the
     pin-row cut.  A careful pupil brings 0 V round to that side on a spare
     track (row X) rather than linking across the cut, which would short pin 7
     to pin 8.  Doing it the wrong way is the mutation two tests above. */
  a.links.push({ a: "L2",  b: "X2",  colour: "black", num: 3 });
  a.links.push({ a: "X20", b: "K20", colour: "black", num: 4 });
  a.links.push({ a: "X23", b: "J23", colour: "black", num: 5 });   // not column 22: link 3 runs C22–M22
  const res = check(Q, a);
  return res.ok ? true
    : "a correctly-tied spare input was failed: [" + codes(res).join(",") + "] " +
      res.faults.map(f => f.msg).join(" | ");
});

t("13.4 R3: swapping a symmetric resistor's legs still passes", () => {
  const a = clone(Q.reference);
  a.placements.find(p => p.id === "R1").rot = 270;   // same two holes, legs exchanged
  const res = check(Q, a);
  return res.ok ? true : "a swapped symmetric part was failed: " + codes(res).join(",");
});

t("13.4 a valid ALTERNATIVE layout passes (the whole point of §3)", () => {
  // the same circuit, chip moved four columns right and everything shifted with it
  const a = clone(Q.reference);
  const shift = s => { const h = parseRef(s); return SBD.ref({ r: h.r, c: h.c + 4 }); };
  a.cuts = a.cuts.map(shift);
  a.placements = a.placements.map(p => Object.assign({}, p, { at: shift(p.at) }));
  a.links = a.links.map(l => Object.assign({}, l, { a: shift(l.a), b: shift(l.b) }));
  a.testpoints = a.testpoints.map(tp => Object.assign({}, tp, { at: shift(tp.at) }));
  const res = check(Q, a);
  return res.ok ? true
    : "a valid alternative layout was failed: [" + codes(res).join(",") + "] " +
      res.faults.map(f => f.msg).join(" | ");
});

/* ==========================================================================
   13.5  property — invariants over random boards
   ========================================================================== */

let seed = 20260908;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const pick = arr => arr[Math.floor(rnd() * arr.length)];

t("13.5 the engine never throws, and never lies, on 3000 random boards", () => {
  const board = BOARDS["34-0411"];
  const fpNames = Object.keys(FOOTPRINTS);
  let checked = 0;

  for (let i = 0; i < 3000; i++) {
    const cuts = [], placements = [], links = [];
    for (let k = 0; k < Math.floor(rnd() * 10); k++)
      cuts.push(SBD.ref({ r: Math.floor(rnd() * board.rows), c: 1 + Math.floor(rnd() * board.cols) }));
    for (let k = 0; k < Math.floor(rnd() * 6); k++)
      placements.push({ id: "P" + k, footprint: pick(fpNames), rot: pick([0, 90, 180, 270]),
        at: SBD.ref({ r: Math.floor(rnd() * board.rows), c: 1 + Math.floor(rnd() * board.cols) }) });
    for (let k = 0; k < Math.floor(rnd() * 5); k++)
      links.push({ a: SBD.ref({ r: Math.floor(rnd() * board.rows), c: 1 + Math.floor(rnd() * board.cols) }),
                   b: SBD.ref({ r: Math.floor(rnd() * board.rows), c: 1 + Math.floor(rnd() * board.cols) }) });

    const attempt = { cuts, placements, links, testpoints: [] };
    const top = topology(board, attempt);          // must not throw

    if (top.errors.length === 0) {
      checked++;
      const cutSet = new Set(cuts.map(s => SBD.hid(parseRef(s))));
      // invariant 1: no net ever contains a pin in a cut hole
      for (const [, list] of netsOf(top))
        for (const id of list) {
          const p = top.pins.find(x => x.id === id);
          if (cutSet.has(SBD.hid(p.hole))) return "a net contained a cut hole at " + SBD.ref(p.hole);
        }
      // invariant 2: every placed pin is in exactly one net
      const seen = new Map();
      for (const [root, list] of netsOf(top))
        for (const id of list) {
          if (seen.has(id)) return id + " appeared in two nets";
          seen.set(id, root);
        }
      if (seen.size !== top.pins.length) return "pin count mismatch: " + seen.size + " vs " + top.pins.length;
      // invariant 3: no empty net survives normalisation
      if (normalise(Array.from(netsOf(top).values()), []).some(s => s.length === 0))
        return "an empty net survived";
    }
  }
  return checked > 500 ? true : "only " + checked + " random boards were legal — too few to be meaningful";
});

/* ==========================================================================
   13.1b  placeCheck — the drop-time refusal the UI relies on (R7, R9)
   ========================================================================== */

const QL = QUESTIONS.find(q => q.id === "lift-interlock");
const QS = QUESTIONS.find(q => q.id === "led-resistor");
const empty = { cuts: [], placements: [], links: [], testpoints: [] };
const okp = r => r.ok === true ? true : "refused: " + r.msg;
const nope = r => r.ok === false ? true : "accepted, but should have been refused";

t("13.1b a legal placement on an empty board is accepted", () =>
  okp(placeCheck(QS, empty, { id: "R1", footprint: "res-4", at: "A5", rot: 90 })));

t("13.1b a part hanging off the right edge is refused", () =>
  nope(placeCheck(QS, empty, { id: "R1", footprint: "res-4", at: "A24" })));

t("13.1b a part hanging off the bottom is refused", () =>
  nope(placeCheck(QS, empty, { id: "R1", footprint: "res-4", at: "H5", rot: 90 })));

t("13.1b a dip-14 at rot 180 off the right edge is refused", () =>
  nope(placeCheck(QL, empty, { id: "IC1", footprint: "dip-14", at: "F36", rot: 180 })));

t("13.1b a leg in a cut hole is refused", () =>
  nope(placeCheck(QS, { cuts: ["A5"], placements: [], links: [] },
                  { id: "R1", footprint: "res-4", at: "A5", rot: 90 })));

t("13.1b two legs in one hole is refused", () => {
  const a = { cuts: [], placements: [{ id: "R1", footprint: "res-4", at: "A5", rot: 90 }], links: [] };
  return nope(placeCheck(QS, a, { id: "LED1", footprint: "led-2", at: "A5", rot: 90 }));
});

t("13.1b a leg under another part's body is refused (R7)", () => {
  const a = { cuts: [], placements: [{ id: "R1", footprint: "res-4", at: "A2" }], links: [] };
  // R1 lies along track A, body over A3..A5 — a terminal at A4 is under it
  return nope(placeCheck(QS, a, { id: "0V", footprint: "term-1", at: "A4" }));
});

t("13.1b a part beside another part, not touching, is accepted", () => {
  const a = { cuts: [], placements: [{ id: "R1", footprint: "res-4", at: "A2" }], links: [] };
  return okp(placeCheck(QS, a, { id: "0V", footprint: "term-1", at: "A8" }));
});

t("13.1b `ignore` lets a part be dragged clear of its own old position", () => {
  const a = { cuts: [], placements: [{ id: "R1", footprint: "res-4", at: "A2" }], links: [] };
  return okp(placeCheck(QS, a, { id: "R1", footprint: "res-4", at: "A4" }, "R1"));
});

/* ==========================================================================
   13.1c  a link running over a component (pupil feedback, 21 Sep 2026)

   The rank-11 rule walked ROW-running links only, so on a stripboard a jumper
   drawn straight down a column through a part standing across the tracks was
   never reported — the commonest overlap there is on this kind of board.
   These tests pin both orientations, and the drop-time refusal that now stops
   the link being drawn at all (plan D2).
   ========================================================================== */

// R1 stands across the tracks in column 2 (C2 D2 E2 F2); R2 lies along row C.
const LNKA = { cuts: [], testpoints: [], links: [], placements: [
  { id: "R1", footprint: "res-4", at: "C2", rot: 90 },
  { id: "R2", footprint: "res-4", at: "C10", rot: 0 }] };

t("13.1c a link down a COLUMN through a standing part is refused", () =>
  nope(SBD.linkCheck(QL, LNKA, { a: "A2", b: "H2" })));

t("13.1c a link along a ROW through a lying part is refused", () =>
  nope(SBD.linkCheck(QL, LNKA, { a: "C9", b: "C14" })));

t("13.1c a link down a clear column is accepted", () =>
  okp(SBD.linkCheck(QL, LNKA, { a: "A20", b: "H20" })));

t("13.1c a link along a clear row is accepted", () =>
  okp(SBD.linkCheck(QL, LNKA, { a: "B2", b: "B20" })));

t("13.1c a link between adjacent holes has nothing in between", () =>
  okp(SBD.linkCheck(QL, LNKA, { a: "A2", b: "B2" })));

t("13.1c check() reports the column link, not just the row one", () => {
  const a = clone(LNKA);
  a.links = [{ a: "A2", b: "H2", colour: "green" }];
  const res = check(Object.assign({}, QL, { components: [
    { id: "R1", footprint: "res-4", symmetric: true },
    { id: "R2", footprint: "res-4", symmetric: true }], target: [] }), a);
  return res.warnings.some(w => w.code === "link-under-body" && /A2/.test(w.msg))
    ? true : "no link-under-body warning for the column link: " + codes(res).join(", ");
});

/* A BODY blocks a link; a bare LEG does not.  A link wire lies above the
   board and can pass over a leg soldered into a hole — greenhouse-irrigation
   ships exactly that (C20–M20 over the +5 V terminal at F20), and an earlier
   cut of this rule failed its own reference answer by refusing it. */
t("13.1c a link passing over a bare leg is accepted", () => {
  const a = { cuts: [], testpoints: [], links: [], placements: [
    { id: "0V", footprint: "term-1", at: "F20" }] };
  return okp(SBD.linkCheck(QL, a, { a: "C20", b: "M20" }));
});

/* A pupil bug report (22 Sep 2026): a link ENDING exactly on a body cell was
   accepted in silence, at both gates — the walk from lo+1 to hi-1 excludes
   the endpoints, so a link that runs under a part right up to its own last
   hole was never caught. R1 res-4 at E7 rot 90 spans E7 (leg) F7 G7 (body)
   H7 (leg); a link stopping dead at F7 stops dead in R1's body. */
const LNKB = { cuts: [], testpoints: [], links: [], placements: [
  { id: "R1", footprint: "res-4", at: "E7", rot: 90 }] };

t("13.1c a link ENDING on a body cell is refused, not just one passing under it", () =>
  nope(SBD.linkCheck(QL, LNKB, { a: "C7", b: "F7" })));

t("13.1c check() reports the same endpoint-on-body case", () => {
  const a = clone(LNKB);
  a.links = [{ a: "C7", b: "F7", colour: "black" }];
  const res = check(Object.assign({}, QL, { components: [
    { id: "R1", footprint: "res-4" }], target: [] }), a);
  return res.warnings.some(w => w.code === "link-under-body" && /F7/.test(w.msg))
    ? true : "no link-under-body warning for the endpoint-on-body link: " + codes(res).join(", ");
});

t("13.1c `ignore` lets an existing link be redrawn without clashing with itself", () => {
  const lk = { a: "B2", b: "B20", colour: "green" };
  const a = clone(LNKA); a.links = [lk];
  return okp(SBD.linkCheck(QL, a, { a: "B2", b: "B20" }, a.links[0]));
});

/* Diagonal wires — pupil bug report 22 Sep 2026 (test-2): all three links on
   that board ran diagonally and all three were drawn. Refused at drop time
   now; check()'s rank-0.5 fault stays for boards that are loaded, not drawn. */
const LNKD = { cuts: [], testpoints: [], links: [], placements: [
  { id: "R1", footprint: "res-4", at: "D10", rot: 90 }] };

t("13.1e a diagonal link is refused at drop time", () =>
  nope(SBD.linkCheck(QL, LNKD, { a: "B10", b: "D12" })));

t("13.1e every link on the reported board is refused", () => {
  const bad = [["B10", "D12"], ["E13", "C7"], ["E7", "G13"]]
    .filter(([a, b]) => SBD.linkCheck(QL, LNKD, { a, b }).ok);
  return bad.length ? "accepted: " + bad.map(x => x.join("–")).join(", ") : true;
});

t("13.1e a one-step diagonal is refused too", () =>
  nope(SBD.linkCheck(QL, LNKD, { a: "A2", b: "B3" })));

t("13.1e check() still reports a diagonal link on a loaded board", () => {
  const a = clone(LNKD);
  a.links = [{ a: "B10", b: "D12", colour: "orange", num: 1 }];
  const res = check(Object.assign({}, QL, { components: [
    { id: "R1", footprint: "res-4" }], target: [] }), a);
  return res.faults.some(f => f.code === "diagonal-link")
    ? true : "no diagonal-link fault: " + codes(res).join(", ");
});

t("13.1c every question's reference links survive linkCheck", () => {
  for (const q of QUESTIONS) {
    const built = { cuts: q.reference.cuts, placements: q.reference.placements,
                    links: [], testpoints: [] };
    for (const l of q.reference.links || []) {
      const r = SBD.linkCheck(q, built, l);
      if (!r.ok) return q.id + ": link " + l.a + "–" + l.b + " refused — " + r.msg;
      built.links.push(l);
    }
  }
  return true;
});

/* Wire against wire — pupil bug report 22 Sep 2026 (test-of-bug-fix): three
   links C7–G7 stacked in the same two holes, and A7–G7 along the same column,
   were all accepted at drop time. */
const LNKC = { cuts: [], testpoints: [], placements: [
  { id: "R1", footprint: "res-4", at: "C11", rot: 90 }],
  links: [{ a: "C7", b: "G7", colour: "blue", num: 1 }] };

t("13.1d a second link in the SAME two holes is refused", () =>
  nope(SBD.linkCheck(QL, LNKC, { a: "C7", b: "G7" })));

t("13.1d a link sharing ONE end hole with another is refused", () =>
  nope(SBD.linkCheck(QL, LNKC, { a: "A7", b: "G7" })));

t("13.1d a link lying along another in the same column is refused", () =>
  nope(SBD.linkCheck(QL, LNKC, { a: "A7", b: "E7" })));

t("13.1d a link lying along another in the same row is refused", () => {
  const a = clone(LNKC); a.links = [{ a: "B2", b: "B9", colour: "red", num: 1 }];
  return nope(SBD.linkCheck(QL, a, { a: "B5", b: "B14" }));
});

t("13.1d a link ending in a leg's hole is refused", () =>
  nope(SBD.linkCheck(QL, LNKC, { a: "A11", b: "C11" })));

t("13.1d a link in the same column but clear of the other is accepted", () =>
  okp(SBD.linkCheck(QL, LNKC, { a: "H7", b: "K7" })));

t("13.1d a link crossing another at right angles is accepted", () =>
  okp(SBD.linkCheck(QL, LNKC, { a: "E5", b: "E9" })));

t("13.1d check() reports links lying along each other", () => {
  const a = clone(LNKC);
  a.links.push({ a: "A7", b: "E7", colour: "green", num: 2 });
  const res = check(Object.assign({}, QL, { components: [
    { id: "R1", footprint: "res-4" }], target: [] }), a);
  return res.faults.some(f => f.code === "link-over-link")
    ? true : "no link-over-link fault: " + codes(res).join(", ");
});

t("13.1b the reference layout of every question passes placeCheck hole by hole", () => {
  for (const q of QUESTIONS) {
    const built = { cuts: q.reference.cuts, placements: [], links: [], testpoints: [] };
    for (const p of q.reference.placements) {
      const r = placeCheck(q, built, p);
      if (!r.ok) return q.id + ": " + p.id + " refused — " + r.msg;
      built.placements.push(p);
    }
  }
  return true;
});

t("13.4b an uncut chip reads as ONE fault, not one per pin pair", () => {
  const a = clone(QL.reference); a.cuts = a.cuts.filter(c => c === "I7");
  const res = check(QL, a);
  const uncut = res.faults.filter(f => f.code === "dil-uncut");
  if (uncut.length !== 1) return "got " + uncut.length + " dil-uncut faults, expected 1";
  if (!/7 tracks \(F to L\)/.test(uncut[0].msg)) return "message does not name the range: " + uncut[0].msg;
  return eq(uncut[0].refs.length, 14);
});

t("13.1b a component may declare its legs interchangeable, overriding the footprint", () => {
  // a 2-way terminal block is not symmetric as a footprint, but the LDR wired
  // into one can go either way round and must not be failed for it (R3)
  const q = {
    board: "34-0410",
    components: [{ id: "LDR", footprint: "term-2", symmetric: true },
                 { id: "P", footprint: "term-1" }, { id: "Q", footprint: "term-1" }],
    target: [["LDR.1", "P.1"], ["LDR.2", "Q.1"]], dontcare: []
  };
  const swapped = { cuts: [], links: [], placements: [
    { id: "LDR", footprint: "term-2", at: "A5", rot: 90 },   // pin 1 on A, pin 2 on C
    { id: "Q",   footprint: "term-1", at: "A2" },             // Q on A, so the legs are swapped
    { id: "P",   footprint: "term-1", at: "C2" }] };
  const res = check(q, swapped);
  if (!res.ok) return "a swapped symmetric part was failed: " + codes(res).join(",");

  // the same board with the override removed must NOT pass
  const strict = JSON.parse(JSON.stringify(q));
  delete strict.components[0].symmetric;
  return check(strict, swapped).ok ? "the override is doing nothing" : true;
});

t("13.5 netlistOf is deterministic across repeated calls", () => {
  const a = JSON.stringify(netlistOf(Q, Q.reference).nets.map(n => n.slice().sort()).sort());
  const b = JSON.stringify(netlistOf(Q, Q.reference).nets.map(n => n.slice().sort()).sort());
  return eq(a, b);
});

/* ==========================================================================
   13.6  breadboard  (BB-PLAN.md)
   --------------------------------------------------------------------------
   The breadboard is the SAME engine with a different node map, so these tests
   are as much about what did NOT change as what did: the board is swapped and
   every rule that reads nets has to keep working.
   ========================================================================== */

const BB = "bb-400";                       // half board, 30 columns, 14 rows
const bbTop = a => topology(BOARDS[BB], a);
const nodeAt = (a, r, c) => bbTop(a).nodeOf.get(r * 1000 + c);
const EMPTY = { cuts: [], placements: [], links: [], testpoints: [] };

/* ---- the node map itself ---- */

t("13.6 a rail is one net end to end", () =>
  eq(nodeAt(EMPTY, 0, 1), nodeAt(EMPTY, 0, 30)));
t("13.6 the + and - rails are different nets", () =>
  nodeAt(EMPTY, 0, 1) !== nodeAt(EMPTY, 1, 1) || "the two top rails share a node");
t("13.6 top and bottom rails of the same polarity are separate", () =>
  nodeAt(EMPTY, 0, 1) !== nodeAt(EMPTY, 12, 1) || "top + and bottom + share a node");
t("13.6 five holes down a column are one net", () =>
  eq(nodeAt(EMPTY, 2, 7), nodeAt(EMPTY, 6, 7)));         // a7 .. e7
t("13.6 the centre channel separates the two halves", () =>
  nodeAt(EMPTY, 6, 7) !== nodeAt(EMPTY, 7, 7) || "e7 and f7 share a node");
t("13.6 neighbouring columns are separate nets", () =>
  nodeAt(EMPTY, 2, 7) !== nodeAt(EMPTY, 2, 8) || "column 7 and column 8 share a node");
t("13.6 every hole on the board has a node", () => {
  const nd = bbTop(EMPTY).nodeOf;
  for (let r = 0; r < 14; r++) for (let c = 1; c <= 30; c++)
    if (nd.get(r * 1000 + c) === undefined) return `no node at r${r} c${c}`;
  return eq(nd.size, 14 * 30);
});
t("13.6 the full board is the same map, 63 columns wide", () => {
  const nd = topology(BOARDS["bb-830"], EMPTY).nodeOf;
  return eq(nd.size, 14 * 63) === true &&
         eq(nd.get(0 * 1000 + 1), nd.get(0 * 1000 + 63));
});

/* ---- cuts do not exist on a breadboard ---- */

t("13.6 a stray cut cannot punch a hole in a rail", () => {
  const a = Object.assign(clone(EMPTY), { cuts: ["A15"] });
  return eq(nodeAt(a, 0, 1), nodeAt(a, 0, 30));
});
t("13.6 a stray cut raises no pointless-cut warning", () => {
  const q = { id: "t", board: BB, components: [], target: [], dontcare: [] };
  const a = Object.assign(clone(EMPTY), { cuts: ["A15"] });
  return has(check(q, a), "pointless-cut") ? "pointless-cut fired on a breadboard" : true;
});

/* ---- links still merge nets ---- */

t("13.6 a link bridges the top and bottom + rails", () => {
  const a = Object.assign(clone(EMPTY), { links: [{ a: "A1", b: "M1" }] });
  return eq(sameNet(BOARDS[BB], a, "A30", "M30"), true);
});
t("13.6 a link joins a column to a rail", () => {
  const a = Object.assign(clone(EMPTY), { links: [{ a: "B5", b: "C5" }] });   // -rail to a5
  return eq(sameNet(BOARDS[BB], a, "B29", "G5"), true);                              // ... and e5
});

/* ---- a two-legged part with both legs on one net ---- */

const bbQ = (comps, target) => ({ id: "bb", board: BB, components: comps,
                                  target: target || [], dontcare: [], tpRequired: [],
                                  expect: null, why: [] });
const R = { id: "R1", footprint: "res-4", name: "R1" };

t("13.6 a resistor across two columns is not shorted", () => {
  const a = Object.assign(clone(EMPTY), { placements: [{ id: "R1", footprint: "res-4", at: "C5", rot: 0 }] });
  return has(check(bbQ([R]), a), "self-short") ? "self-short on a legitimate placement" : true;
});
t("13.6 a resistor turned down one column IS shorted", () => {
  const a = Object.assign(clone(EMPTY), { placements: [{ id: "R1", footprint: "res-4", at: "C5", rot: 90 }] });
  return has(check(bbQ([R]), a), "self-short") || "self-short did not fire: " + codes(check(bbQ([R]), a));
});
t("13.6 self-short names the column in the board's own letters", () => {
  const a = Object.assign(clone(EMPTY), { placements: [{ id: "R1", footprint: "res-4", at: "C5", rot: 90 }] });
  const f = check(bbQ([R]), a).faults.find(x => x.code === "self-short");
  return /column 5 \(a–e\)/.test(f.msg) || "message was: " + f.msg;
});
t("13.6 self-short fires even when the pupil's own netlist is the target", () => {
  // Free build hands check() the board's own netlist, which silences every
  // target-dependent rank.  This one must survive that (BB-PLAN §0, BB-4).
  const a = Object.assign(clone(EMPTY), { placements: [{ id: "R1", footprint: "res-4", at: "C5", rot: 90 }] });
  const q = bbQ([R]);
  q.target = netlistOf(q, a).nets;
  return has(check(q, a), "self-short") || "silenced by a matching target";
});
t("13.6 a stripboard resistor along one track is NOT reported by the new rule", () => {
  // the old target-gated rank 3 still owns that case; the breadboard rule must
  // not leak on to a stripboard
  const q = { id: "s", board: "34-0410", components: [R], target: [], dontcare: [],
              tpRequired: [], expect: null, why: [] };
  const a = Object.assign(clone(EMPTY), { placements: [{ id: "R1", footprint: "res-4", at: "C5", rot: 0 }] });
  q.target = netlistOf(q, a).nets;
  return has(check(q, a), "self-short") ? "leaked on to a stripboard" : true;
});

/* ---- the chip and the centre channel ---- */

const IC = { id: "IC1", footprint: "dip-14-bb", part: "7400", name: "IC1" };
const chipAt = at => Object.assign(clone(EMPTY),
  { placements: [{ id: "IC1", footprint: "dip-14-bb", at, rot: 0 }] });

t("13.6 a 14-pin chip straddling the channel is sound", () => {
  const res = check(bbQ([IC]), chipAt("G5"));          // row index 6 = e, so dr1 = f
  return has(res, "dil-not-straddling") ? "straddling chip reported: " + codes(res) : true;
});
t("13.6 a chip inside one half shorts every pin to its opposite", () => {
  const res = check(bbQ([IC]), chipAt("C5"));          // rows a and b, one band
  return has(res, "dil-not-straddling") || "no fault: " + codes(res);
});
t("13.6 that message says straddle, and never says cut", () => {
  const f = check(bbQ([IC]), chipAt("C5")).faults.find(x => x.code === "dil-not-straddling");
  return (/centre channel/.test(f.msg) && !/cut/i.test(f.msg)) || "message was: " + f.msg;
});
t("13.6 a chip laid down the columns shorts one side together", () => {
  const a = Object.assign(clone(EMPTY),
    { placements: [{ id: "IC1", footprint: "dip-8-bb", at: "C5", rot: 90 }] });
  const q = bbQ([Object.assign({}, IC, { footprint: "dip-8-bb", part: "555" })]);
  return has(check(q, a), "dil-along-net") || "no fault: " + codes(check(q, a));
});
t("13.6 the stripboard chip rules are untouched", () => {
  const q = { id: "s", board: "34-0411", components: [{ id: "IC1", footprint: "dip-14", part: "7400" }],
              target: [], dontcare: [], tpRequired: [], expect: null, why: [] };
  const a = Object.assign(clone(EMPTY), { placements: [{ id: "IC1", footprint: "dip-14", at: "C5", rot: 0 }] });
  return has(check(q, a), "dil-uncut") || "dil-uncut stopped firing: " + codes(check(q, a));
});
t("13.6 chip-first tells a breadboard pupil to move it, not cut it", () => {
  const f = check(bbQ([IC]), chipAt("C5")).faults.find(x => x.code === "chip-first");
  return (f && !/cut/i.test(f.msg)) || "message was: " + (f && f.msg);
});

/* ---- the DIL footprint is the right shape ---- */

t("13.6 a 14-pin DIL spans 7 columns and 2 rows", () => {
  const cells = cellsOf(FOOTPRINTS["dip-14-bb"], { r: 6, c: 5 }, 0);
  const rs = cells.pins.map(z => z.hole.r), cs = cells.pins.map(z => z.hole.c);
  return eq(Math.max(...rs) - Math.min(...rs), 1) === true &&
         eq(Math.max(...cs) - Math.min(...cs), 6);
});
t("13.6 pin 1 is bottom left and pin 14 is above it", () => {
  const cells = cellsOf(FOOTPRINTS["dip-14-bb"], { r: 6, c: 5 }, 0);
  const p = n => cells.pins.find(z => z.pin === String(n)).hole;
  return eq(p(1).r, 7) === true && eq(p(1).c, 5) === true &&
         eq(p(14).r, 6) === true && eq(p(14).c, 5) === true &&
         eq(p(7).c, 11) === true && eq(p(8).c, 11);
});
t("13.6 a DIL package covers no holes", () =>
  eq(FOOTPRINTS["dip-14-bb"].body.length, 0));

/* ---- placement and bounds ---- */

t("13.6 a part off the right-hand edge is refused, and named in board terms", () => {
  const r = placeCheck(bbQ([R]), EMPTY, { id: "R1", footprint: "res-4", at: "C29", rot: 0 });
  return eq(r.ok, false);
});
t("13.6 off-board is reported with the printed row letter", () => {
  const a = Object.assign(clone(EMPTY), { placements: [{ id: "R1", footprint: "res-4", at: "C29", rot: 0 }] });
  const f = check(bbQ([R]), a).faults.find(x => x.code === "off-board");
  return /a3[12]/.test(f.msg) || "message was: " + f.msg;
});
t("13.6 a rail hole is named by its polarity and end", () => {
  const a = Object.assign(clone(EMPTY), {
    placements: [{ id: "R1", footprint: "res-4", at: "A5", rot: 0 },
                 { id: "R2", footprint: "res-4", at: "A5", rot: 0 }] });
  const q = bbQ([R, { id: "R2", footprint: "res-4" }]);
  const f = check(q, a).faults.find(x => x.code === "hole-clash");
  return /\+5 \(top rail\)/.test(f.msg) || "message was: " + f.msg;
});

/* ---- one hole, one thing ---- */

t("13.6 a jumper may not end in a hole that already has a leg", () => {
  const a = Object.assign(clone(EMPTY), {
    placements: [{ id: "R1", footprint: "res-4", at: "C5", rot: 0 }],   // a5, a8
    links: [{ a: "A5", b: "C5", colour: "red" }] });                    // ...into a5
  const res = check(bbQ([R]), a);
  return has(res, "hole-clash") || "no clash reported: " + codes(res);
});
t("13.6 two jumpers may not end in the same hole", () => {
  const a = Object.assign(clone(EMPTY), {
    links: [{ a: "A5", b: "E5", colour: "red" },
            { a: "B5", b: "E5", colour: "black" }] });
  return has(check(bbQ([]), a), "hole-clash") || "no clash reported";
});
t("13.6 the same column by a different hole is fine", () => {
  const a = Object.assign(clone(EMPTY), {
    placements: [{ id: "R1", footprint: "res-4", at: "C5", rot: 0 }],
    links: [{ a: "A5", b: "E5", colour: "red" }] });                    // into c5
  const res = check(bbQ([R]), a);
  return has(res, "hole-clash") ? "clash on a legal placement: " + codes(res) : true;
});
t("13.6 dropping a leg on to a jumper's hole is refused at drop time", () => {
  const a = Object.assign(clone(EMPTY), { links: [{ a: "A5", b: "E5", colour: "red" }] });
  const r = placeCheck(bbQ([R]), a, { id: "R1", footprint: "res-4", at: "E5", rot: 0 });
  return eq(r.ok, false) === true && (/one hole/.test(r.msg) || "message was: " + r.msg);
});
t("13.6 a stripboard link sharing a hole with a leg is a clash too", () => {
  // breadboard-only until 15 Sep 2026, when it was decided for both boards
  const q = { id: "s", board: "34-0410", components: [R], target: [], dontcare: [],
              tpRequired: [], expect: null, why: [] };
  const a = Object.assign(clone(EMPTY), {
    placements: [{ id: "R1", footprint: "res-4", at: "C5", rot: 0 }],
    links: [{ a: "C5", b: "F5", colour: "blue" }] });
  return has(check(q, a), "hole-clash") || "no clash on a stripboard: " + codes(check(q, a));
});
t("13.6 a stripboard leg dropped on to a link's hole is refused at drop time", () => {
  const q = { id: "s", board: "34-0410", components: [R], target: [], dontcare: [],
              tpRequired: [], expect: null, why: [] };
  const a = Object.assign(clone(EMPTY), { links: [{ a: "C5", b: "F5", colour: "blue" }] });
  const r = placeCheck(q, a, { id: "R1", footprint: "res-4", at: "C5", rot: 0 });
  return eq(r.ok, false) === true && (/one hole/.test(r.msg) || "message was: " + r.msg);
});

/* ---- a jumper straight across a straddling chip (decided 15 Sep 2026) ---- */

const withJumper = (at, link) => Object.assign(chipAt(at), { links: [link] });
t("13.6 a jumper down a column across the chip is a fault", () => {
  const res = check(bbQ([IC]), withJumper("G5", { a: "F7", b: "I7", colour: "blue" }));   // d7 to g7
  return res.faults.some(f => f.code === "link-over-chip") || "not reported: " + codes(res);
});
t("13.6 a jumper along row e over the chip's legs is a fault", () => {
  const res = check(bbQ([IC]), withJumper("G5", { a: "G4", b: "G12", colour: "blue" }));
  return has(res, "link-over-chip") || "not reported: " + codes(res);
});
t("13.6 a jumper round the end of the chip is fine", () => {
  const res = check(bbQ([IC]), withJumper("G5", { a: "F4", b: "I4", colour: "blue" }));
  return has(res, "link-over-chip") ? "reported a legal jumper: " + codes(res) : true;
});
t("13.6 a jumper across the chip fails Free build, not just a suggestion", () => {
  const a = withJumper("G5", { a: "F7", b: "I7", colour: "blue" });
  const res = SBD.free.freeCheck(BB, a, [{ id: "IC1", footprint: "dip-14-bb", part: "7400", key: "7400" }]);
  return (!res.ok && res.faults.some(f => f.code === "link-over-chip")) ||
         "ok=" + res.ok + " faults=" + res.faults.map(f => f.code);
});
t("13.6 link-over-chip never fires on a stripboard", () => {
  const q = { id: "s", board: "34-0411", components: [{ id: "IC1", footprint: "dip-14", part: "7400" }],
              target: [], dontcare: [], tpRequired: [], expect: null, why: [] };
  const a = Object.assign(clone(EMPTY), { cuts: ["C6", "D6", "E6", "F6", "G6", "H6", "I6"],
    placements: [{ id: "IC1", footprint: "dip-14", at: "C5", rot: 0 }],
    links: [{ a: "B6", b: "K6", colour: "blue" }] });
  return has(check(q, a), "link-over-chip") ? "leaked on to a stripboard" : true;
});

t("13.6 a breadboard link-colour message names holes in the board's own words", () => {
  const V0 = { id: "0V", footprint: "term-1", neg: true, name: "0 V" };
  const a = Object.assign(clone(EMPTY), { placements: [{ id: "0V", footprint: "term-1", at: "B1" }],
    links: [{ a: "B5", b: "E5", colour: "blue", num: 1 }] });
  const f = check(bbQ([V0]), a).faults.find(x => x.code === "supply-not-black");
  if (!f) return "no supply-not-black: " + codes(check(bbQ([V0]), a));
  return (!/B5|E5/.test(f.msg) && /c5/.test(f.msg)) || "message was: " + f.msg;
});

/* ---- the NPN can turns on a breadboard (decided 15 Sep 2026) ---- */

t("13.6 the NPN can at 90 on a breadboard puts c, b and e on three nets", () => {
  const Q1 = { id: "Q1", footprint: "npn-can", name: "Q1" };
  const a = Object.assign(clone(EMPTY), { placements: [{ id: "Q1", footprint: "npn-can", at: "C10", rot: 90 }] });
  const nets = netlistOf(bbQ([Q1]), a).nets;
  const together = nets.filter(n => ["Q1.c", "Q1.b", "Q1.e"].filter(p => n.includes(p)).length > 1);
  return together.length ? "legs share a net: " + JSON.stringify(together) : true;
});
t("13.6 ... and at 0 on a breadboard its c and e share a column", () => {
  const Q1 = { id: "Q1", footprint: "npn-can", name: "Q1" };
  const a = Object.assign(clone(EMPTY), { placements: [{ id: "Q1", footprint: "npn-can", at: "C10", rot: 0 }] });
  return eq(sameNet(BOARDS[BB], a, "C10", "E10"), true);
});

/* ---- the free-build rules that only exist on a breadboard ---- */

const FC = (comps, a) => SBD.free.freeCheck(BB, a, comps);
const hasF = (res, code) =>
  res.faults.some(f => f.code === code) || res.warnings.some(w => w.code === code);

t("13.6 a rail with legs in it and no supply is reported", () => {
  const comps = [{ id: "R1", footprint: "res-4", key: "res" }];
  const a = Object.assign(clone(EMPTY), {
    placements: [{ id: "R1", footprint: "res-4", at: "C5", rot: 0 }],
    links: [{ a: "A6", b: "E5", colour: "red" }] });     // + rail -> column 5
  const res = FC(comps, a);
  return hasF(res, "rail-not-fed") || "not reported: " +
    res.faults.concat(res.warnings).map(x => x.code).join(",");
});
t("13.6 ... and stops once the supply terminal is on that rail", () => {
  const comps = [{ id: "R1", footprint: "res-4", key: "res" },
                 { id: "+5V1", footprint: "term-1", key: "pos", pos: true }];
  const a = Object.assign(clone(EMPTY), {
    placements: [{ id: "R1", footprint: "res-4", at: "C5", rot: 0 },
                 { id: "+5V1", footprint: "term-1", at: "A1", rot: 0 }],
    links: [{ a: "A6", b: "E5", colour: "red" }] });
  const res = FC(comps, a);
  const f = res.faults.concat(res.warnings).filter(x => x.code === "rail-not-fed");
  // the + rail is now fed; the untouched − rail has nothing in it, so is silent
  return f.length === 0 || "still reported: " + f.map(x => x.msg).join(" | ");
});
t("13.6 an empty rail is not nagged about", () => {
  const res = FC([], clone(EMPTY));
  return hasF(res, "rail-not-fed") ? "nagged about an empty board" : true;
});
t("13.6 the net read-back names rails and columns, not hole runs", () => {
  const comps = [{ id: "R1", footprint: "res-4", key: "res" }];
  const a = Object.assign(clone(EMPTY), {
    placements: [{ id: "R1", footprint: "res-4", at: "C5", rot: 0 }] });
  const nets = SBD.free.netReport(BB, a, comps);
  const texts = nets.map(n => n.runs.join("+")).join(" | ");
  return /column 5 \(a\u2013e\)/.test(texts) && !/C5/.test(texts)
    ? true : "read-back was: " + texts;
});
t("13.6 a chip minted on a breadboard gets the breadboard footprint", () => {
  const c = SBD.free.mint([], "7400", BB);
  return eq(c.footprint, "dip-14-bb");
});
t("13.6 ... and the same chip on a stripboard does not", () => {
  const c = SBD.free.mint([], "7400", "34-0410");
  return eq(c.footprint, "dip-14");
});
t("13.6 a resistor is not a chip: its footprint is the same on both", () =>
  eq(SBD.free.mint([], "res", BB).footprint, SBD.free.mint([], "res", "34-0410").footprint));

/* ---- a small working board, end to end ---- */

t("13.6 netlistOf reads a two-part breadboard correctly", () => {
  // R1 from the + rail into column 8; LED from column 8 to the - rail.
  const comps = [{ id: "R1", footprint: "res-4" }, { id: "D1", footprint: "led-2" }];
  const a = { cuts: [], testpoints: [],
    placements: [{ id: "R1", footprint: "res-4", at: "C5", rot: 0 },   // a5 .. a8
                 { id: "D1", footprint: "led-2", at: "D8", rot: 0 }],  // b8 .. b9
    links: [{ a: "A5", b: "E5", colour: "red" },       // + rail -> column 5 (c5)
            { a: "B9", b: "E9", colour: "black" }] };  // - rail -> column 9 (c9)
  const q = bbQ(comps);
  const nl = netlistOf(q, a);
  if (nl.errors.length) return "placement errors: " + JSON.stringify(nl.errors);
  const net = nl.nets.find(n => n.indexOf("R1.2") >= 0);
  if (!net || net.indexOf("D1.a") < 0)
    return "R1.2 and D1.a are not on one net: " + JSON.stringify(nl.nets);
  // and the two rails stayed apart
  return sameNet(BOARDS[BB], a, "A1", "B1") === false ||
         "the + and - rails ended up joined";
});

/* ---- terminal wire colours, 2 Oct 2026 (RS bug report, 1 Oct) ----
   A terminal's colour is its wire's colour, so a link on the same signal has
   to match it.  The report: a blue link joined to an orange IN2 passed. */
function termBoard(linkColour, extra){
  const comps = [{ id: "+5V(1)", footprint: "term-1", key: "pos", pos: true },
                 { id: "0V(1)", footprint: "term-1", key: "neg", neg: true },
                 { id: "IN2", footprint: "term-1", key: "in", colour: "orange" }].concat(extra ? extra.comps : []);
  const a = { cuts: [], testpoints: [],
    placements: [{ id: "+5V(1)", footprint: "term-1", at: "A1", rot: 0 },
                 { id: "0V(1)", footprint: "term-1", at: "X1", rot: 0 },
                 { id: "IN2", footprint: "term-1", at: "C1", rot: 0 }].concat(extra ? extra.placements : []),
    links: [{ a: "C13", b: "K13", colour: linkColour, num: 1 }] };
  return FREE.freeCheck("34-0411", a, comps);
}
t("15.1 a link joined to an orange terminal in blue is reported", () =>
  hasF(termBoard("blue"), "link-not-terminal-colour") || "the blue link passed");
t("15.1 ... and the same link in orange is not", () =>
  !hasF(termBoard("orange"), "link-not-terminal-colour") || "an orange link was reported");
t("15.1 two joined terminals in different colours are reported", () =>
  hasF(termBoard("orange", { comps: [{ id: "OUT1", footprint: "term-1", key: "out", colour: "green" }],
                             placements: [{ id: "OUT1", footprint: "term-1", at: "C37", rot: 0 }] }),
       "terminal-colours-differ") || "an orange IN2 and a green OUT1 on one track passed");
t("15.1 a terminal on another track does not colour this link", () => {
  const res = termBoard("orange", { comps: [{ id: "OUT1", footprint: "term-1", key: "out", colour: "green" }],
                                    placements: [{ id: "OUT1", footprint: "term-1", at: "U37", rot: 0 }] });
  return !hasF(res, "link-not-terminal-colour") && !hasF(res, "terminal-colours-differ") ||
    "reported: " + res.faults.map(f => f.code).join(",");
});
t("15.1 no question's reference layout trips the terminal colour rules", () => {
  for (const q of QUESTIONS) {
    const res = check(q, clone(q.reference));
    if (res.faults.some(f => /terminal/.test(f.code))) return q.id;
  }
  return true;
});

t("15.1 two terminals on different signals in one colour are a reused colour", () => {
  const res = termBoard("orange", { comps: [{ id: "IN3", footprint: "term-1", key: "in", colour: "orange" }],
                                    placements: [{ id: "IN3", footprint: "term-1", at: "E1", rot: 0 }] });
  return hasF(res, "colour-reused") || "IN2 and IN3 both orange on two tracks passed";
});
t("15.1 ... but two terminals on one signal in one colour are not", () => {
  const res = termBoard("orange", { comps: [{ id: "OUT1", footprint: "term-1", key: "out", colour: "orange" }],
                                    placements: [{ id: "OUT1", footprint: "term-1", at: "C37", rot: 0 }] });
  return !hasF(res, "colour-reused") || "one orange signal was reported as two";
});

/* ---- PNP, and the plastic TO-92 package for both, 2 Oct 2026 ---- */
t("15.2 all four transistors are in the palette, each on its own footprint", () => {
  const want = { tr: "npn-can", tr92: "npn-92", trp: "pnp-can", trp92: "pnp-92", fet92: "mosfet-92" };
  for (const k in want) {
    const c = FREE.mint([], k, "34-0411");
    if (!c || c.footprint !== want[k] || !FOOTPRINTS[c.footprint]) return k + " is missing";
  }
  return true;
});
t("15.2 a TO-92 across the tracks puts c, b and e on three nets", () => {
  for (const fp of ["npn-92", "pnp-92", "mosfet-92"]) {
    const comps = [{ id: "Q1", footprint: fp, key: "tr92" }];
    const a = { cuts: [], links: [], testpoints: [],
                placements: [{ id: "Q1", footprint: fp, at: "D10", rot: 90 }] };
    const nl = netlistOf(FREE.freeQ("34-0411", comps), a);
    if (nl.errors.length) return fp + ": " + JSON.stringify(nl.errors);
    const nets = FOOTPRINTS[fp].pins.map(p => nl.nets.findIndex(n => n.indexOf("Q1." + p.pin) >= 0));
    if (new Set(nets).size !== 3) return fp + ": legs share a net";
  }
  return true;
});
t("15.2 the PNP can turned on a stripboard is refused, like the NPN", () =>
  FOOTPRINTS["pnp-can"].fixedRot === true || "the PNP can could be rotated");

/* ========================================================================== */

print("");
print("  Stripboard Builder — engine tests");
print("  " + "-".repeat(66));
if (failures.length) {
  for (const f of failures) print("  FAIL  " + f);
  print("");
}
print(`  ${pass} passed, ${fail} failed`);
print("");
if (fail) throw new Error(fail + " test(s) failed");
