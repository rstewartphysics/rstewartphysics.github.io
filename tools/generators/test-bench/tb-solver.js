/* ============================================================================
   Test bench — the circuit solver
   ----------------------------------------------------------------------------
   One source of truth (BENCH-PLAN §1). A bench board is a stripboard LAYOUT, as
   the stripboard engine draws it, plus a fault, which is an edit to that layout
   (tb-faults.js). The copper is read with the engine's own segmentation
   (SBD.nodesOf, SBD.cellsOf), so the circuit solved here is the board drawn
   there: the picture and the readings cannot disagree.

   Nodal analysis with Newton iteration for the LEDs, backward-Euler time steps
   for the capacitors, and the 555 as a behavioural part whose latch flips
   exactly where a comparator crosses (the step is cut back to the crossing).
   The meter and the logic probe are parts of the circuit while they touch it:
   a voltmeter is 10 MΩ, an ohmmeter a 2.8 V source, an ammeter a shunt.

   Needs window.SBD (assets/js/stripboard.js). Runs in the browser and Node.
   ============================================================================ */
(function (root) {
  "use strict";
  const TB = root.TB = root.TB || {};

  const GMIN = 1e-10;              // every node to 0 V: a floating node is defined, and reads 0 V on a meter
  const DV = 0.04;                 // target change in a capacitor's volts per step
  const H_MIN = 1e-5, H_MAX = 0.05, H_SNAP = 1e-7;

  /* ------------------------------------------------- the board as a circuit
     Good joints and link wires are ideal, so everything they join is one node.
     A dry joint leaves its leg (or link end) as a node of its own. Names:
       "pin:R2.1"  a leg      "seg:<engine id>"  a run of copper
       "end:A8"    a link end "tp:T1"            a test point */

  function connect(layout, fault) {
    const S = root.SBD;
    if (!S) throw new Error("test bench: the stripboard engine (SBD) is not loaded");
    const board = S.BOARDS[layout.board];
    const cuts = new Set(layout.cuts.map(r => S.hid(S.parseRef(r))));
    const segOf = S.nodesOf(board, cuts);
    const dsu = S.makeDSU();
    const seg = ref => {
      const h = S.parseRef(ref);
      const k = h ? segOf.get(S.hid(h)) : undefined;
      return k === undefined ? null : "seg:" + k;
    };
    const pinHole = {};
    for (const p of layout.placements) {
      const cells = S.cellsOf(S.FOOTPRINTS[p.footprint], S.parseRef(p.at), p.rot || 0);
      for (const { pin, hole } of cells.pins) {
        const id = p.id + "." + pin, h = S.ref(hole), s = seg(h);
        pinHole[id] = h;
        dsu.find("pin:" + id);
        if (s && !fault.dry.has(id)) dsu.union("pin:" + id, s);
      }
    }
    for (const l of layout.links) {
      dsu.union("end:" + l.a, "end:" + l.b);
      for (const h of [l.a, l.b]) {
        const s = seg(h);
        if (s && !fault.dry.has("link@" + h)) dsu.union("end:" + h, s);
      }
    }
    for (const [a, b] of fault.bridges) { const x = seg(a), y = seg(b); if (x && y) dsu.union(x, y); }
    for (const t of layout.testpoints) {
      const s = seg(t.at);
      dsu.find("tp:" + t.id);
      if (s) dsu.union("tp:" + t.id, s);
    }
    return { dsu, seg, pinHole };
  }

  /* What a pupil can touch: "T3" a test point, "IC1.4" or "R2.1" a leg,
     "G19" the copper under a hole. */
  function keyOf(net, name) {
    if (/^T\d+$/.test(name)) return "tp:" + name;
    if (name.indexOf(".") > 0) return "pin:" + name;
    return net.seg(name);
  }

  /* ------------------------------------------------------------- stamping */

  const V = (x, a) => (a >= 0 ? x[a] : 0);
  function addG(G, n, a, b, g) {
    if (a >= 0) G[a * n + a] += g;
    if (b >= 0) G[b * n + b] += g;
    if (a >= 0 && b >= 0) { G[a * n + b] -= g; G[b * n + a] -= g; }
  }
  // a current i pushed into node a and drawn out of node b
  function addI(I, a, b, i) { if (a >= 0) I[a] += i; if (b >= 0) I[b] -= i; }

  function resistor(a, b, R, on) {
    return { a, b, R, on, stamp(G, I, x, c) { addG(G, c.n, a, b, 1 / this.R); },
      current: x => (V(x, a) - V(x, b)) / R };
  }
  /* A source of `v` volts behind R, + at p. */
  function thevenin(p, m, v, R, on) {
    return { p, m, v, R, on, stamp(G, I, x, c) { addG(G, c.n, p, m, 1 / this.R); addI(I, p, m, this.v / this.R); },
      current(x) { return (this.v - (V(x, p) - V(x, m))) / this.R; } };   // out of p, into the circuit
  }
  function diode(a, k, P) {
    const vmax = P.nvt * Math.log(0.1 / P.is + 1);   // beyond 100 mA, carry on in a straight line
    function iv(vd) {
      if (vd > vmax) {
        const e = Math.exp(vmax / P.nvt), g = P.is * e / P.nvt;
        return [P.is * (e - 1) + g * (vd - vmax), g];
      }
      const e = Math.exp(vd / P.nvt);
      return [P.is * (e - 1), P.is * e / P.nvt];
    }
    return { a, k, stamp(G, I, x, c) {
      const vd = V(x, a) - V(x, k), [id, g] = iv(vd), gd = g + 1e-12;
      addG(G, c.n, a, k, gd);
      addI(I, k, a, id - gd * vd);
    }, current: x => iv(V(x, a) - V(x, k))[0] };
  }
  /* Over a step h a capacitor is a conductance plus a source set by its last
     voltage v (and current i). Trapezoidal steps for accuracy; backward Euler
     for the instant re-solve after a switch, which also resets i cleanly (a
     trapezoidal step across a jump would ring). */
  function capacitor(a, b, C) {
    return { a, b, C, v: 0, i: 0, stamp(G, I, x, c) {
      if (!isFinite(c.h)) return;
      const g = (c.tr ? 2 : 1) * this.C / c.h;
      addG(G, c.n, a, b, g);
      addI(I, a, b, g * this.v + (c.tr ? this.i : 0));
    }, commit(x, c) {
      const vn = V(x, a) - V(x, b);
      this.i = c.tr ? 2 * this.C / c.h * (vn - this.v) - this.i : this.C / c.h * (vn - this.v);
      this.v = vn;
    } };
  }

  function solveLinear(G, b, n) {
    for (let c = 0; c < n; c++) {
      let p = c, best = Math.abs(G[c * n + c]);
      for (let r = c + 1; r < n; r++) { const v = Math.abs(G[r * n + c]); if (v > best) { best = v; p = r; } }
      if (best === 0) continue;
      if (p !== c) {
        for (let k = c; k < n; k++) { const t = G[c * n + k]; G[c * n + k] = G[p * n + k]; G[p * n + k] = t; }
        const t = b[c]; b[c] = b[p]; b[p] = t;
      }
      const d = G[c * n + c];
      for (let r = c + 1; r < n; r++) {
        const f = G[r * n + c] / d;
        if (f === 0) continue;
        for (let k = c; k < n; k++) G[r * n + k] -= f * G[c * n + k];
        b[r] -= f * b[c];
      }
    }
    const x = new Float64Array(n);
    for (let r = n - 1; r >= 0; r--) {
      let s = b[r];
      for (let k = r + 1; k < n; k++) s -= G[r * n + k] * x[k];
      x[r] = G[r * n + r] === 0 ? 0 : s / G[r * n + r];
    }
    return x;
  }

  /* ------------------------------------------------------------ the parts
     Each builder adds the part's elements to the circuit. `pin(k)` is the node
     of the part's leg k. A part listed in fault.shorted is shorted inside. */

  const BUILD = {
    res(C, pin, P, shorted) { C.add(resistor(pin("1"), pin("2"), shorted ? 0.05 : P.R)); },

    led(C, pin, P, shorted, id) {
      if (shorted) { C.add(resistor(pin("a"), pin("k"), 0.05)); return; }
      const mid = C.inner(), d = diode(mid, pin("k"), P);
      C.add(resistor(pin("a"), mid, P.rs));
      C.add(d);
      C.leds.push({ id, colour: P.colour, el: d });
    },

    ecap(C, pin, P, shorted) {
      const cap = capacitor(pin("+"), pin("-"), P.C);
      C.add(cap); C.caps.push(cap);
      C.add(resistor(pin("+"), pin("-"), shorted ? 0.05 : P.Rleak));
    },

    ne555(C, pin, P) {
      const p = {}; for (const k of "12345678") p[k] = pin(k);
      const st = { q: false, powered: false };
      const rel = (x, k) => V(x, p[k]) - V(x, p["1"]);
      const vcc = x => rel(x, "8");
      // the internal 3 × 5 kΩ divider is there, powered or not; the rest of the
      // quiescent current only when the chip is running
      C.add(resistor(p["8"], p["1"], 15e3));
      C.add(resistor(p["8"], p["1"], 4.5 / (P.iq - 0.3e-3), () => st.powered));
      C.add(thevenin(p["8"], p["3"], P.drop, P.roh, () => st.powered && st.q));
      C.add(thevenin(p["3"], p["1"], P.vol, P.rol, () => st.powered && !st.q));
      C.add(resistor(p["7"], p["1"], P.rdis, () => st.powered && !st.q));
      /* Each comparison as signal minus threshold: the latch decision, and the
         fraction of a step at which a comparison changed sign. */
      const tests = x => {
        const v = vcc(x);
        return { reset: rel(x, "4") - P.vreset, trig: rel(x, "2") - P.ktr * v, thr: rel(x, "6") - P.kth * v };
      };
      const want = x => {
        if (vcc(x) < 3) return null;
        const t = tests(x);
        if (t.reset < 0) return false;
        if (t.trig < 0) return true;      // the trigger wins over the threshold
        if (t.thr > 0) return false;
        return st.q;
      };
      C.devices.push({
        state: st,
        event(x0, x1) {
          if (!st.powered || vcc(x1) < 3) return null;
          const w = want(x1);
          if (w === st.q) return null;
          const a = tests(x0), b = tests(x1);
          let f = 1;
          for (const k of ["reset", "trig", "thr"])
            if ((a[k] < 0) !== (b[k] < 0) && a[k] !== b[k]) f = Math.min(f, a[k] / (a[k] - b[k]));
          return f;
        },
        commit(x) {
          const was = st.powered, wq = st.q;
          st.powered = vcc(x) >= 3;
          st.q = st.powered ? want(x) : false;
          return was !== st.powered || wq !== st.q;
        }
      });
    }
  };

  /* --------------------------------------------------------------- a bench */

  function Circuit(net, groundKey) {
    this.net = net;
    this.ground = net.dsu.find(groundKey);
    this.index = new Map();
    this.n = 0;
    this.els = []; this.caps = []; this.leds = []; this.devices = [];
    this.x = new Float64Array(0);
  }
  Circuit.prototype.node = function (key) {
    if (key == null) return null;
    const r = this.net.dsu.find(key);
    if (r === this.ground) return -1;
    if (!this.index.has(r)) this.index.set(r, this.n++);
    return this.index.get(r);
  };
  Circuit.prototype.inner = function () { return this.n++; };
  Circuit.prototype.add = function (el) { this.els.push(el); return el; };

  Circuit.prototype.solve = function (h, extra, tr) {
    const n = this.n;
    if (this.x.length !== n) { const x = new Float64Array(n); x.set(this.x.subarray(0, Math.min(n, this.x.length))); this.x = x; }
    const els = this.els.filter(e => !e.on || e.on()).concat(extra.filter(e => !e.on || e.on()));
    const c = { n, h, tr };
    let x = this.x;
    for (let it = 0; it < 200; it++) {
      const G = new Float64Array(n * n), I = new Float64Array(n);
      for (let i = 0; i < n; i++) G[i * n + i] = GMIN;
      for (const e of els) e.stamp(G, I, x, c);
      const xn = solveLinear(G, I, n);
      let worst = 0;
      for (let i = 0; i < n; i++) worst = Math.max(worst, Math.abs(xn[i] - x[i]));
      if (worst > 2) { const k = 2 / worst; for (let i = 0; i < n; i++) xn[i] = x[i] + (xn[i] - x[i]) * k; }
      x = xn;
      if (worst < 1e-9) return x;
    }
    return x;   // the last iterate: close enough for a reading
  };

  /* bench(scenarioId, { fault, seed }) — one board, powered off, at t = 0. */
  function bench(id, opts) {
    opts = opts || {};
    const sc = TB.SCENARIOS[id];
    if (!sc) throw new Error("test bench: no scenario " + id);
    const F = TB.faults.apply(sc, opts.fault || "good");
    const net = connect(F.layout, F);
    const C = new Circuit(net, "pin:" + sc.supply.neg);
    const d = TB.parts.draws(opts.seed == null ? "mid" : opts.seed);
    const touch = TB.parts.stream(d.seed + "|" + (opts.fault || "good"));
    const parts = {};

    for (const [pid, spec] of Object.entries(sc.parts)) {
      const model = TB.parts.PARTS[spec.model];
      const P = model.draw(F.values[pid], d.u, pid, spec);
      parts[pid] = Object.assign({ model: spec.model, value: F.values[pid] }, P);
      BUILD[spec.model](C, k => C.node("pin:" + pid + "." + k), P, F.shorted.has(pid), pid);
    }
    const psu = TB.parts.PARTS.supply.draw(5, d.u, "PSU");
    const state = { on: false, t: 0, h: 1e-4 };
    C.add(thevenin(C.node("pin:" + sc.supply.pos), -1, psu.V, psu.Rint, () => state.on));

    const leadR = TB.parts.span(d.u("meter.lead"), TB.meter.LEAD[0], TB.meter.LEAD[1]);
    const where = name => {
      const k = keyOf(net, name);
      if (k == null) return null;
      return C.node(k);
    };

    /* the instruments touching the board */
    let meter = null, probe = null, watch = [];
    function instruments() {
      const out = [];
      if (meter && meter.el) out.push(meter.el);
      if (probe) out.push(probe.draw, probe.tip);
      for (const w of watch) out.push(w);
      return out;
    }

    const step = (h, tr) => C.solve(h, instruments(), tr);
    function commit(x, h, tr) {
      C.x = x;
      for (const cap of C.caps) cap.commit(x, { h, tr });
      if (probe) probe.sample(x, state.t);
      if (meter) meter.sample(x);
      let changed = false;
      for (const dv of C.devices) changed = dv.commit(x) || changed;
      return changed;
    }
    /* After a latch flips, solve again at the same instant (capacitors hold). */
    function settle() {
      for (let k = 0; k < 6; k++) {
        const x = step(H_SNAP);
        if (!commit(x, H_SNAP)) return;
      }
    }

    function advance(T, onStep) {
      let left = T;
      while (left > 1e-12) {
        let h = Math.min(state.h, left, H_MAX);
        const x0 = C.x.length === C.n ? C.x : step(H_SNAP);
        let x = step(h, true);
        let f = 1;
        for (const dv of C.devices) { const e = dv.event(x0, x); if (e != null) f = Math.min(f, e); }
        if (f < 0.999 && h * f > H_MIN) {
          h *= Math.max(f, 1e-6);
          x = step(h, true);
        }
        let dvmax = 0;
        for (const cap of C.caps) {
          const v = V(x, cap.a) - V(x, cap.b);
          dvmax = Math.max(dvmax, Math.abs(v - cap.v));
        }
        state.t += h; left -= h;
        const flipped = commit(x, h, true);
        if (flipped) settle();
        if (onStep) onStep(state.t, h);
        state.h = Math.min(H_MAX, Math.max(H_MIN, h * Math.min(2, DV / Math.max(dvmax, 1e-12))));
        if (flipped) state.h = Math.min(state.h, 1e-3);
      }
    }

    function power(on) {
      if (state.on === !!on) return;
      state.on = !!on;
      settle();
    }

    /* The meter: setting is a dial position ("DCV 20"), socket "V", "A" or "20A".
       Leads go on `red` and `black` (anything keyOf() reads). */
    function useMeter(setting, o) {
      if (!setting) { meter = null; return; }
      o = o || {};
      const socket = o.socket || "V";
      const red = where(o.red), black = where(o.black || sc.ground);
      const contact = TB.parts.span(touch(), TB.meter.CONTACT[0], TB.meter.CONTACT[1]);
      const lead = leadR + contact;
      const m = { setting, socket, red, black, fuse: meter && meter.fuse, v: 0, i: 0, el: null, kind: "open" };
      if (red !== null && black !== null && !m.fuse) {
        const e = TB.meter.element(setting, socket, lead);
        m.kind = e.kind;
        if (e.kind === "load") m.el = resistor(red, black, e.R);
        else if (e.kind === "source") m.el = thevenin(red, black, e.V, e.R);
      }
      /* What the meter itself sees, inside its leads: m.v across its input,
         m.i through it from red to black. So continuity shows the leads' own
         fraction of an ohm, as the class meter does. */
      m.sample = x => {
        const vb = V(x, red) - V(x, black);
        if (!m.el) { m.v = 0; m.i = 0; return; }
        if (m.kind === "load") { m.i = vb / m.el.R; m.v = m.i * (m.el.R - lead); }
        else { const out = m.el.current(x); m.i = -out; m.v = m.el.v - out * (m.el.R - lead); }
        if (socket === "A" && Math.abs(m.i) > 0.25) { m.fuse = true; m.el = null; }
      };
      meter = m;
      settle();
    }
    function readMeter(flick) {
      if (!meter) return null;
      if (meter.red === null || meter.black === null || !meter.el)
        return { text: TB.meter.display(meter.setting, 0, 0), value: 0, beep: false, fuse: !!meter.fuse, open: true };
      const value = TB.meter.value(meter.setting, meter.socket, meter.v, meter.i);
      const text = TB.meter.display(meter.setting, value, flick || 0);
      const beep = meter.setting === "OHM 200" && meter.socket === "V" && value < TB.meter.BEEP_BELOW && value >= 0;
      return { text, value, beep, fuse: !!meter.fuse, over: text === "1" || text === "-1" };
    }

    /* The logic probe: clips on `red` / `black`, tip on `tip`. */
    function useProbe(o) {
      if (!o) { probe = null; return; }
      const red = where(o.red || sc.supplyTP), black = where(o.black || sc.ground), tip = where(o.tip);
      const mode = o.mode || "TTL", P = TB.probe;
      const pr = {
        draw: resistor(red, black, P.DRAW), tip: tip === null ? resistor(black, black, 1) : resistor(tip, black, P.TIP),
        level: null, last: -Infinity, live: false, hi: false, lo: false,
        sample(x, t) {
          const vs = V(x, red) - V(x, black), vt = tip === null ? NaN : V(x, tip) - V(x, black);
          pr.live = vs >= P.MIN_SUPPLY;
          const [lo, hi] = mode === "CMOS" ? [P.CMOS[0] * vs, P.CMOS[1] * vs] : P.TTL;
          const lv = !pr.live || isNaN(vt) ? null : vt >= hi ? "hi" : vt <= lo ? "lo" : null;
          if (pr.level !== null && lv !== null && lv !== pr.level) pr.last = t;
          if (lv !== null) pr.level = lv;
          pr.hi = lv === "hi"; pr.lo = lv === "lo";
        }
      };
      probe = pr;
      settle();
    }
    function readProbe() {
      if (!probe) return null;
      return { live: probe.live, hi: probe.live && probe.hi, lo: probe.live && probe.lo,
               pulse: probe.live && state.t - probe.last < TB.probe.PULSE };
    }

    function leds() {
      const out = {};
      for (const L of C.leds) {
        const i = C.x.length ? L.el.current(C.x) : 0;
        const look = i >= TB.ledLook.ON_ABOVE ? "on" : i >= TB.ledLook.OFF_BELOW ? "faint" : "off";
        out[L.id] = { colour: L.colour, current: i, look, glow: Math.max(0, Math.min(1, i / 0.01)) };
      }
      return out;
    }

    /* For the tests: hang 10 MΩ voltmeters on many points at once (each to 0 V)
       and read the raw node voltages. */
    function voltmeters(names) {
      watch = names.map(nm => { const k = where(nm); return k === null ? null : resistor(k, -1, 10e6); }).filter(Boolean);
      settle();
    }
    const volts = name => { const k = where(name); return k === null || !C.x.length ? 0 : V(C.x, k); };

    return {
      scenario: sc, fault: F, parts, psu, seed: d.seed,
      get t() { return state.t; }, get on() { return state.on; },
      power, run: advance, meter: useMeter, read: readMeter, probe: useProbe, probeRead: readProbe,
      leds, voltmeters, volts, pinHole: net.pinHole,
      latch: () => C.devices.map(dv => Object.assign({}, dv.state))
    };
  }

  TB.solver = { connect, keyOf, bench, solveLinear };
  TB.bench = bench;

})(typeof globalThis !== "undefined" ? globalThis : this);
