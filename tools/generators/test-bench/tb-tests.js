/* ============================================================================
   Test bench — tests (run by scripts/build-test-bench.mjs; not in the bundle)
   ----------------------------------------------------------------------------
     1  parts: colour bands, the meter's display
     2  the engine and the solver agree: same nets, and a wiring fault is one
        the engine's own check also sees
     3  physics: LED volts, supply sag, 555 timing against 0.7RC
     4  the table test (BENCH-PLAN §5, §6): every scenario, good board, every
        fault and distractor, on the corner boards and `sets` random part sets.
        Every reading lies in its expected range; no good board and fault board
        could ever give the same key reading; `distinct` cases never overlap.
   ============================================================================ */
(function (root) {
  "use strict";
  const TB = root.TB, S = root.SBD;

  function runTests(o) {
    o = o || {};
    const sets = o.sets == null ? 1000 : o.sets, log = o.log || (() => {});
    let pass = 0, fail = 0;
    const failures = [];
    function t(name, fn) {
      try {
        const r = fn();
        if (r === true || r === undefined) pass++;
        else { fail++; failures.push(name + "  ->  " + r); }
      } catch (e) { fail++; failures.push(name + "  ->  threw: " + (e && e.stack || e)); }
    }
    const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b) ? true : `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`;
    const within = (v, lo, hi) => v >= lo && v <= hi ? true : `${v} not in [${lo}, ${hi}]`;

    /* ---------------------------------------------------------- 1 parts */
    const P = TB.parts, M = TB.meter;
    for (const [v, b] of [[1e3, [1, 0, 2]], [10e3, [1, 0, 3]], [270, [2, 7, 1]], [270e3, [2, 7, 4]], [4.7, [4, 7, -1]], [100e3, [1, 0, 4]]]) {
      t(`bands of ${v}`, () => eq(P.bandsOf(v), b));
      t(`bands round trip ${v}`, () => Math.abs(P.valueOfBands(b) - v) < 1e-9 * v || `${P.valueOfBands(b)}`);
    }
    for (const [s, v, out] of [["DCV 20", 4.823, "4.82"], ["DCV 20", 0.031, "0.03"], ["DCV 20", 25, "1"], ["DCV 2", 4, "1"],
      ["DCV 2", 1.6667, "1.667"], ["DCV 200m", 0.05, "50.0"], ["DCV 20", -3.21, "-3.21"], ["DCV 1000", 5, "5"],
      ["OHM 200", 0.43, "0.4"], ["OHM 200", 1e9, "1"], ["OHM 2k", 270, "0.270"], ["OHM 2M", 270e3, "0.270"],
      ["OHM 20k", 9870, "9.87"], ["DCV D", 1.742, "1742"], ["DCV D", 2.5, "1"], ["DCA 20m", 0.0112, "11.20"]]) {
      t(`display ${s} ${v}`, () => eq(M.display(s, v, 0), out));
    }
    t("display flick moves the last digit", () => eq(M.display("DCV 20", 4.82, 1), "4.83"));
    t("dial has the booklet's 32 positions", () => eq(M.DIAL.length, 32));
    t("every dial position formats", () => M.DIAL.every(d => d in M.FMT) || M.DIAL.filter(d => !(d in M.FMT)).join(","));

    /* LED model: volts at 10 mA inside the colour's range; red near 1.4 V at a
       10 MΩ meter's current (plan §2). */
    for (const colour of ["red", "green"]) for (const seed of ["lo", "mid", "hi"]) {
      const L = P.PARTS.led.draw(0, P.draws(seed).u, "L", { colour });
      const vAt = i => L.nvt * Math.log(i / L.is + 1) + i * L.rs;
      const r = P.LED_COLOURS[colour].vf;
      t(`LED ${colour} ${seed}: Vf at 10 mA`, () => within(+vAt(0.01).toFixed(4), r[0], r[1]));
      if (colour === "red") t(`LED red ${seed}: about 1.4 V at 0.36 µA`, () => within(+vAt(0.36e-6).toFixed(3), 1.25, 1.55));
    }
    t("solveLinear 2×2", () => {
      const x = TB.solver.solveLinear(new Float64Array([2, 1, 1, 3]), new Float64Array([3, 5]), 2);
      return Math.abs(x[0] - 0.8) < 1e-12 && Math.abs(x[1] - 1.4) < 1e-12 || `${x[0]}, ${x[1]}`;
    });

    /* ----------------------------------------- 2 the engine and the solver */
    for (const sc of Object.values(TB.SCENARIOS)) {
      const good = TB.faults.apply(sc, "good");
      t(`${sc.id}: good board passes SBD.check`, () => TB.faults.wiringCheck(sc, good).ok || JSON.stringify(TB.faults.wiringCheck(sc, good).faults.slice(0, 3)));
      t(`${sc.id}: solver nodes = the engine's nets`, () => {
        const net = TB.solver.connect(good.layout, good), node = id => net.dsu.find("pin:" + id);
        const nets = sc.question.target;
        for (const n of nets) for (const id of n) if (node(id) !== node(n[0])) return `${id} not joined to ${n[0]}`;
        for (let i = 0; i < nets.length; i++) for (let j = i + 1; j < nets.length; j++)
          if (node(nets[i][0]) === node(nets[j][0])) return `${nets[i][0]} joined to ${nets[j][0]}`;
        return true;
      });
      const all = Object.assign({}, sc.faults, sc.distractors || {});
      for (const [id, f] of Object.entries(all)) {
        /* A solder bridge is not part of a layout, so the engine cannot see one. */
        const F = TB.faults.apply(sc, id), rewired = f.edits.some(e => ["link", "turn", "uncut", "place"].some(k => k in e));
        const ok = TB.faults.wiringCheck(sc, F).ok;
        t(`${sc.id}/${id}: engine check ${rewired ? "fails (rewired)" : "passes (same wiring)"}`, () => ok === !rewired || `check ok = ${ok}`);
      }
    }

    /* ----------------------------------------------------------- 3 physics */
    const sc555 = TB.SCENARIOS["555-astable"];
    if (sc555) {
      for (const seed of ["lo", "mid", "hi", "a1", "a2"]) {
        const b = TB.bench("555-astable", { seed });
        b.voltmeters(["T1"]);
        b.power(true); b.run(0.5);
        const sag = b.psu.V - b.volts("T1");
        t(`555 ${seed}: supply sags 0.005-0.035 V on load`, () => within(+sag.toFixed(4), 0.005, 0.035));
        /* pin 3 HIGH / LOW times against the exact RC working for this board's
           parts: C1 charges through R1 + R2 (with its own leakage across it)
           between the two comparator levels, and discharges through R2 towards
           pin 7's few tens of mV. 0.7RC is this with ideal parts. */
        const p = b.parts, I = p.IC1, vcc = b.volts("T1"), Rc = p.R1.R + p.R2.R;
        const vth = I.kth * vcc, vtr = I.ktr * vcc, vinf = vcc * p.C1.Rleak / (p.C1.Rleak + Rc);
        const v7 = vcc * I.rdis / (p.R1.R + I.rdis);
        const hi = (Rc * p.C1.Rleak / (Rc + p.C1.Rleak)) * p.C1.C * Math.log((vinf - vtr) / (vinf - vth));
        const lo = p.R2.R * p.C1.C * Math.log((vth - v7) / (vtr - v7));
        const times = { hi: [], lo: [] };
        let last = null, since = 0;
        b.run(6, tt => {
          const q = b.latch()[0].q;
          if (last !== null && q !== last) { if (since) times[last ? "hi" : "lo"].push(tt - since); since = tt; }
          last = q;
        });
        const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
        t(`555 ${seed}: HIGH time matches the RC working within 1 %`, () => times.hi.length ? within(+(mean(times.hi) / hi).toFixed(4), 0.99, 1.01) : "no HIGH times");
        t(`555 ${seed}: LOW time matches the RC working within 1 %`, () => times.lo.length ? within(+(mean(times.lo) / lo).toFixed(4), 0.99, 1.01) : "no LOW times");
        t(`555 ${seed}: HIGH time within 6 % of 0.7(R1+R2)C`, () => times.hi.length ? within(+(mean(times.hi) / (Math.LN2 * Rc * p.C1.C)).toFixed(4), 0.94, 1.06) : "no HIGH times");
      }
      t("555: power off reads 0 V everywhere", () => {
        const b = TB.bench("555-astable", { seed: "mid" });
        b.voltmeters(["T1", "T3", "T4"]); b.run(0.2);
        return ["T1", "T3", "T4"].every(k => Math.abs(b.volts(k)) < 1e-6) || "not 0";
      });
      t("555: a meter on an empty strip reads 0.00", () => {
        const b = TB.bench("555-astable", { seed: "mid" });
        b.power(true); b.meter("DCV 20", { red: "D25" }); b.run(0.2);
        return eq(b.read().text, "0.00");
      });
      t("555: red lead in A across the supply blows the fuse", () => {
        const b = TB.bench("555-astable", { seed: "mid" });
        b.power(true); b.meter("DCV 20", { red: "T1", socket: "A" }); b.run(0.05);
        return b.read().fuse === true || JSON.stringify(b.read());
      });
      t("555: continuity on the 0 V strip beeps, shows a small resistance", () => {
        const b = TB.bench("555-astable", { seed: "mid" });
        b.meter("OHM 200", { red: "V1", black: "T2" }); b.run(0.1);
        const r = b.read();
        return r.beep && r.value > 0.2 && r.value < 1.5 || JSON.stringify(r);
      });
    }

    /* ------------------------------------------------------ 4 the table test */
    const ranges = {};
    for (const sc of Object.values(TB.SCENARIOS)) {
      const cases = ["good"].concat(Object.keys(sc.faults), Object.keys(sc.distractors || {}));
      const seeds = ["lo", "mid", "hi"];
      for (let i = 0; i < sets; i++) seeds.push("r" + i);
      const obs = {};                       // obs[case][reading] = [per-seed observation]
      for (const c of cases) {
        obs[c] = {};
        for (const seed of seeds) {
          const m = measure(sc, c, seed);
          for (const [k, v] of Object.entries(m)) (obs[c][k] = obs[c][k] || []).push({ seed, v });
        }
        log(`  ${sc.id} ${c}: ${seeds.length} boards`);
      }
      ranges[sc.id] = summarise(obs);

      for (const c of cases) {
        for (const [k, want] of Object.entries(sc.expect[c] || {})) {
          t(`${sc.id}/${c} ${k} = ${JSON.stringify(want)}`, () => {
            const bad = (obs[c][k] || []).filter(o => !meets(o.v, want));
            if (!obs[c][k]) return "never measured";
            return !bad.length || `${bad.length}/${obs[c][k].length} boards off, e.g. seed ${bad[0].seed}: ${JSON.stringify(bad[0].v)}`;
          });
        }
      }
      for (const [c, ks] of Object.entries(sc.keys || {})) for (const k of ks) {
        t(`${sc.id}/${c} ${k} never overlaps the good board`, () => apart(obs.good[k], obs[c][k]) || `overlap: good ${show(ranges[sc.id].good[k])}, ${c} ${show(ranges[sc.id][c][k])}`);
      }
      for (const d of sc.distinct || []) for (let i = 0; i < d.cases.length; i++) for (let j = i + 1; j < d.cases.length; j++) {
        const a = d.cases[i], b = d.cases[j];
        t(`${sc.id}: ${d.reading} tells ${a} from ${b}`, () => apart(obs[a][d.reading], obs[b][d.reading]) || "overlap");
      }
    }
    return { pass, fail, failures, ranges };
  }

  /* -------------------------------------------- taking one board's readings */

  /* Readings taken with the same inputs share one powered board, except a
     probe reading or one marked `alone`, which gets its own (the instrument
     loads what it touches); a reading with power off, or with a link lifted
     for the ammeter, too. */
  function measure(sc, c, seed) {
    const fault = c === "good" ? null : c, R = sc.readings, out = {};
    const f = (sc.faults[c] || (sc.distractors || {})[c] || {});
    const slow = f.slow || 1;
    const setUp = (r, o) => {
      const b = TB.bench(sc.id, Object.assign({ fault, seed }, o));
      for (const [id, st] of Object.entries(r.set || {})) b.set(id, st);
      return b;
    };
    const groups = new Map();
    for (const [k, r] of Object.entries(R)) {
      if (r.off || r.amps) continue;
      const g = JSON.stringify(r.set || {}) + (r.probe || r.high || r.alone ? "|" + k : "");
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push([k, r]);
    }
    for (const on of groups.values()) powered(setUp(on[0][1]), on);

    function powered(b, on) {
      const dcv = on.filter(([, r]) => r.dcv), pr = on.find(([, r]) => r.probe || r.high);
      b.voltmeters(dcv.map(([, r]) => r.dcv));
      if (pr) b.probe({ tip: pr[1].probe || pr[1].high });
      b.power(true);
      b.run(2 * slow);
      const span = {}, led = {}, load = {}, highs = [];
      let seenHi = false, seenLo = false, seenNone = false, live = true, level = null, since = null, total = 0;
      b.run(4 * slow, (tt, h) => {
        total += h;
        for (const [k, r] of dcv) {
          const v = b.volts(r.dcv) - b.volts(sc.ground);
          const s = span[k] = span[k] || { lo: Infinity, hi: -Infinity };
          if (v < s.lo) s.lo = v; if (v > s.hi) s.hi = v;
        }
        for (const [id, L] of Object.entries(b.leds())) {
          const s = led[id] = led[id] || { on: 0, max: 0 };
          if (L.look === "on") s.on += h;
          s.max = Math.max(s.max, L.current);
        }
        for (const [id, L] of Object.entries(b.loads())) {
          const s = load[id] = load[id] || { on: 0 };
          if (L.on) s.on += h;
        }
        const p = b.probeRead();
        if (p) {
          live = live && p.live;
          seenHi = seenHi || p.hi; seenLo = seenLo || p.lo; seenNone = seenNone || (!p.hi && !p.lo);
          const lv = p.hi ? "hi" : p.lo ? "lo" : level;
          if (lv !== level) {
            if (level === "hi" && since !== null) highs.push(tt - since);
            if (lv === "hi") since = level === null ? null : tt;   // a HIGH already running when the window opened is not timed
            level = lv;
          }
        }
      });
      for (const [k, r] of on) {
        if (r.dcv) out[k] = { lo: +span[k].lo.toFixed(4), hi: +span[k].hi.toFixed(4) };
        if (r.led) {
          const s = led[r.led], fr = s.on / total;
          out[k] = fr >= 0.95 ? "on" : fr > 0.05 ? "flashes" : s.max >= TB.ledLook.OFF_BELOW ? "faint" : "off";
        }
        if (r.load) { const fr = load[r.load].on / total; out[k] = fr >= 0.95 ? "on" : fr > 0.05 ? "chatters" : "off"; }
        /* "flicker": a level that comes and goes with neither LED between. */
        if (r.probe) out[k] = !live ? "dead" : seenHi && seenLo ? "flashes" : (seenHi || seenLo) && seenNone ? "flicker"
          : seenHi ? "hi" : seenLo ? "lo" : "none";
        if (r.high) out[k] = highs.length ? +(highs.reduce((a, v) => a + v, 0) / highs.length).toFixed(4) : null;
      }
    }
    for (const [k, r] of Object.entries(R).filter(([, r]) => r.off || r.amps)) {
      const m = setUp(r, { lift: r.lift });
      if (r.amps) m.power(true);
      m.meter(r.off || r.amps, { red: r.red, black: r.black, socket: r.amps ? "A" : "V" });
      m.run(2);
      const rd = m.read();
      out[k] = rd.over ? "over" : +rd.value.toPrecision(5);
    }
    return out;
  }

  /* An observation meets an expectation. */
  function meets(v, want) {
    if (typeof want === "string") return v === want;
    if (Array.isArray(want)) {
      if (v && typeof v === "object") return v.lo >= want[0] && v.hi <= want[1];
      return typeof v === "number" && v >= want[0] && v <= want[1];
    }
    if (want.min) return v && typeof v === "object" && v.lo >= want.min[0] && v.lo <= want.min[1] && v.hi >= want.max[0] && v.hi <= want.max[1];
    return false;
  }

  /* Two sets of observations can never be confused: different words, or
     numbers whose ranges never meet. A reading that varies is told apart if
     either its lowest or its highest values never meet. */
  function apart(A, B) {
    if (!A || !B) return false;
    const kinds = xs => new Set(xs.map(o => typeof o.v === "string" ? "w:" + o.v : o.v === null ? "null" : "n"));
    const ka = kinds(A), kb = kinds(B);
    for (const k of ka) if (kb.has(k) && k !== "n") return false;
    if (!(ka.has("n") && kb.has("n"))) return true;
    const num = xs => xs.filter(o => typeof o.v !== "string" && o.v !== null).map(o => typeof o.v === "number" ? { lo: o.v, hi: o.v } : o.v);
    const a = num(A), b = num(B);
    const rng = (xs, f) => [Math.min(...xs.map(f)), Math.max(...xs.map(f))];
    const sep = (p, q) => p[1] < q[0] || q[1] < p[0];
    return sep(rng(a, o => o.lo), rng(b, o => o.lo)) || sep(rng(a, o => o.hi), rng(b, o => o.hi));
  }

  function summarise(obs) {
    const out = {};
    for (const [c, ks] of Object.entries(obs)) {
      out[c] = {};
      for (const [k, xs] of Object.entries(ks)) {
        const words = [...new Set(xs.filter(o => typeof o.v === "string" || o.v === null).map(o => String(o.v)))];
        const nums = xs.filter(o => o.v !== null && typeof o.v !== "string").map(o => typeof o.v === "number" ? { lo: o.v, hi: o.v } : o.v);
        const r = { words };
        if (nums.length) {
          r.lo = [Math.min(...nums.map(o => o.lo)), Math.max(...nums.map(o => o.lo))];
          r.hi = [Math.min(...nums.map(o => o.hi)), Math.max(...nums.map(o => o.hi))];
        }
        out[c][k] = r;
      }
    }
    return out;
  }
  function show(r) {
    if (!r) return "-";
    const f = v => +v.toPrecision(4);
    const parts = r.words.slice();
    if (r.lo) {
      const steady = r.lo[0] === r.hi[0] && r.lo[1] === r.hi[1];
      parts.push(steady ? `${f(r.lo[0])} to ${f(r.lo[1])}` : `low ${f(r.lo[0])}–${f(r.lo[1])}, high ${f(r.hi[0])}–${f(r.hi[1])}`);
    }
    return parts.join("; ");
  }

  TB.runTests = runTests;
  TB.showRange = show;
  TB.measure = measure;

})(typeof globalThis !== "undefined" ? globalThis : this);
