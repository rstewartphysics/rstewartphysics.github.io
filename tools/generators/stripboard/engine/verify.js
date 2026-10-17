/* Bank verification, readable.  The golden test asserts netlist(reference) ==
   target and stops at the first failure; this prints every question's state at
   once with a net-by-net diff, which is what you want while authoring. */
const sig = nets => nets.map(n => n.slice().sort().join(" ")).sort();

let bad = 0;
for (const q of QUESTIONS) {
  const out = SBD.netlistOf(q, q.reference);
  const board = SBD.BOARDS[q.board];
  const head = `${q.id}  [${q.board} ${board.rows}x${board.cols}]  scaffold=${q.scaffold}` +
    `  parts=${q.components.length}  cuts=${q.reference.cuts.length}` +
    `  links=${q.reference.links.length}  tp=${(q.tpRequired || []).length}`;

  if (out.errors.length) {
    bad++; print("FAIL " + head);
    for (const e of out.errors) print("       placement: " + e.msg);
    continue;
  }
  // compare the way check() does, so dontcare and symmetry are honoured
  const symmetric = new Set(q.components.filter(c => (SBD.FOOTPRINTS[c.footprint] || {}).symmetric)
                                        .map(c => c.id));
  const dc = new Set(q.dontcare || []);
  const a = SBD.canonicalise(out.nets, symmetric, dc);
  const b = SBD.canonicalise(q.target, symmetric, dc);
  const same = a.length === b.length && a.every((x, i) => x === b[i]);

  const res = SBD.check(q, q.reference);
  if (same && res.ok) { print("ok   " + head); continue; }

  bad++; print("FAIL " + head);
  const A = new Set(a), B = new Set(b);
  for (const n of b) if (!A.has(n)) print("       target has, board lacks:  " + n);
  for (const n of a) if (!B.has(n)) print("       board has, target lacks:  " + n);
  for (const f of res.faults)   print("       fault:   " + f.msg);
  for (const w of res.warnings) print("       warning: " + w.msg);
}
print("");
print(bad ? bad + " question(s) failed" : QUESTIONS.length + " questions all verify");
