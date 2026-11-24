'use strict';
// MAGIC WRITING: trace lines, shapes, letters, numbers, then write and spell little words.
// Handwriting readiness follows the pre-writing order used by occupational therapists (Beery: down, across,
// circle, cross, diagonals, square, triangle) before letters. Each letter is traced stroke by stroke from a green
// start dot in the standard direction, following a star: correct formation early saves unlearning later, and
// writing letters by hand helps children learn to recognise them (Longcamp et al.; James & Engelhardt).
// The writing starts very big and gets smaller as she goes up the levels. The word levels add spelling: tap the
// letters of a word in order, then write it (spelling and writing a word strengthen reading it; Ehri).
//   1 lines and circles   2 shapes   3 capital letters   4 numbers   5 small letters
//   6 write a 3-letter word   7 spell and write 3-letter words   8 write a 4-letter word   9 spell and write 4-letter words
window.PA = window.PA || {};
PA.games = PA.games || [];
(function () {
  const U = PA.ui, S = PA.store;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  // ---------- the stroke font ----------
  // Capitals and numbers: top 10, middle 50, baseline 90. Small letters: tall 10, middle 45, baseline 90, tail 112.
  const CAP = {
    A: [56, 'M28 10 L4 90', 'M28 10 L52 90', 'M14 60 L42 60'],
    B: [52, 'M8 10 L8 90', 'M8 10 L30 10 A20 20 0 0 1 30 50 L8 50', 'M8 50 L32 50 A20 20 0 0 1 32 90 L8 90'],
    C: [54, 'M52 22 A27 40 0 1 0 52 78'],
    D: [54, 'M8 10 L8 90', 'M8 10 L20 10 A32 40 0 0 1 20 90 L8 90'],
    E: [48, 'M8 10 L8 90', 'M8 10 L46 10', 'M8 50 L40 50', 'M8 90 L46 90'],
    F: [46, 'M8 10 L8 90', 'M8 10 L44 10', 'M8 50 L38 50'],
    G: [58, 'M52 22 A27 40 0 1 0 56 62 L56 52 L36 52'],
    H: [54, 'M8 10 L8 90', 'M48 10 L48 90', 'M8 50 L48 50'],
    I: [40, 'M20 10 L20 90', 'M4 10 L36 10', 'M4 90 L36 90'],
    J: [48, 'M40 10 L40 66 A18 22 0 0 1 4 66'],
    K: [50, 'M8 10 L8 90', 'M46 10 L8 56', 'M20 44 L48 90'],
    L: [44, 'M8 10 L8 90 L42 90'],
    M: [62, 'M6 90 L6 10 L31 62 L56 10 L56 90'],
    N: [54, 'M8 90 L8 10 L48 90 L48 10'],
    O: [60, 'M30 10 A26 40 0 0 0 30 90 A26 40 0 0 0 30 10'],
    P: [48, 'M8 10 L8 90', 'M8 10 L26 10 A20 20 0 0 1 26 50 L8 50'],
    Q: [62, 'M30 10 A26 40 0 0 0 30 90 A26 40 0 0 0 30 10', 'M36 66 L58 92'],
    R: [50, 'M8 10 L8 90', 'M8 10 L26 10 A20 20 0 0 1 26 50 L8 50', 'M24 50 L48 90'],
    S: [50, 'M46 20 A21 20 0 1 0 26 50 A21 20 0 1 1 6 80'],
    T: [52, 'M4 10 L48 10', 'M26 10 L26 90'],
    U: [54, 'M8 10 L8 64 A20 26 0 0 0 48 64 L48 10'],
    V: [54, 'M4 10 L27 90 L50 10'],
    W: [66, 'M4 10 L18 90 L33 40 L48 90 L62 10'],
    X: [52, 'M6 10 L46 90', 'M46 10 L6 90'],
    Y: [52, 'M4 10 L26 50', 'M48 10 L26 50 L26 90'],
    Z: [50, 'M6 10 L46 10 L6 90 L46 90']
  };
  const NUM = {
    0: [52, 'M26 10 A22 40 0 0 0 26 90 A22 40 0 0 0 26 10'],
    1: [36, 'M8 26 L24 10 L24 90'],
    2: [52, 'M8 30 A20 20 0 0 1 48 30 Q48 50 8 90 L48 90'],
    3: [50, 'M8 22 A19 18 0 1 1 26 50 A21 20 0 1 1 6 80'],
    4: [54, 'M36 10 L6 64 L50 64', 'M38 10 L38 90'],
    5: [50, 'M12 10 L10 46 A21 22 0 1 1 8 84', 'M12 10 L44 10'],
    6: [52, 'M42 12 Q10 28 8 64 A20 24 0 0 0 48 64 A20 24 0 0 0 8 64'],
    7: [50, 'M6 10 L46 10 L18 90'],
    8: [50, 'M25 10 A19 20 0 0 0 25 50 A20 20 0 0 1 25 90 A20 20 0 0 1 25 50 A19 20 0 0 0 25 10'],
    9: [50, 'M46 30 A20 20 0 1 0 6 30 A20 20 0 1 0 46 30 L46 90']
  };
  const LOW = {
    a: [54, 'M48 56 A21 22 0 1 0 48 79', 'M48 45 L48 90'],
    b: [54, 'M8 10 L8 90', 'M8 68 A21 22 0 0 1 50 68 A21 22 0 0 1 8 68'],
    c: [50, 'M46 52 A21 22 0 1 0 46 83'],
    d: [54, 'M48 56 A21 22 0 1 0 48 79', 'M48 10 L48 90'],
    e: [52, 'M8 68 L48 68 A21 22 0 1 0 44 84'],
    f: [42, 'M40 16 Q22 4 20 26 L20 90', 'M4 48 L36 48'],
    g: [54, 'M48 56 A21 22 0 1 0 48 79', 'M48 45 L48 100 A18 14 0 0 1 10 104'],
    h: [52, 'M8 10 L8 90', 'M8 66 A20 20 0 0 1 48 66 L48 90'],
    i: [24, 'M12 45 L12 90', 'M12 27 L12 28'],
    j: [34, 'M26 45 L26 100 A14 14 0 0 1 2 104', 'M26 27 L26 28'],
    k: [48, 'M8 10 L8 90', 'M44 45 L8 72', 'M20 64 L46 90'],
    l: [24, 'M12 10 L12 90'],
    m: [62, 'M6 45 L6 90', 'M6 62 A12 16 0 0 1 30 62 L30 90', 'M30 62 A12 16 0 0 1 54 62 L54 90'],
    n: [52, 'M8 45 L8 90', 'M8 66 A20 20 0 0 1 48 66 L48 90'],
    o: [54, 'M27 45 A21 22.5 0 0 0 27 90 A21 22.5 0 0 0 27 45'],
    p: [54, 'M8 45 L8 112', 'M8 68 A21 22 0 0 1 50 68 A21 22 0 0 1 8 68'],
    q: [54, 'M48 56 A21 22 0 1 0 48 79', 'M48 45 L48 112'],
    r: [44, 'M8 45 L8 90', 'M8 64 A22 20 0 0 1 42 52'],
    s: [44, 'M40 52 A15 11 0 1 0 22 67 A16 11 0 1 1 4 84'],
    t: [40, 'M20 18 L20 90', 'M4 45 L36 45'],
    u: [52, 'M8 45 L8 70 A20 20 0 0 0 48 70', 'M48 45 L48 90'],
    v: [50, 'M4 45 L25 90 L46 45'],
    w: [62, 'M4 45 L16 90 L31 58 L46 90 L58 45'],
    x: [48, 'M6 45 L44 90', 'M44 45 L6 90'],
    y: [50, 'M6 45 L28 90', 'M46 45 L16 112'],
    z: [46, 'M6 45 L42 45 L6 90 L42 90']
  };
  const star5 = (() => {
    const P = [0, 1, 2, 3, 4].map(i => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [42 + 42 * Math.cos(a), 54 + 42 * Math.sin(a)]; });
    return [0, 2, 4, 1, 3, 0].map((k, i) => (i ? 'L' : 'M') + P[k][0].toFixed(1) + ' ' + P[k][1].toFixed(1)).join(' ');
  })();
  const SHAPES = {
    down: [24, 'M12 10 L12 90', 'a line going down'],
    across: [80, 'M0 50 L80 50', 'a line going across'],
    circle: [80, 'M40 10 A40 40 0 0 0 40 90 A40 40 0 0 0 40 10', 'a circle'],
    cross: [80, 'M40 10 L40 90', 'M0 50 L80 50', 'a cross'],
    slant: [80, 'M4 10 L76 90', 'a slanty line'],
    rain: [76, 'M4 10 L4 50', 'M38 30 L38 70', 'M72 50 L72 90', 'raindrops falling down'],
    square: [76, 'M4 12 L4 88 L72 88 L72 12 L4 12', 'a square'],
    triangle: [84, 'M42 10 L4 88 L80 88 L42 10', 'a triangle'],
    xshape: [76, 'M4 10 L72 90', 'M72 10 L4 90', 'an X'],
    heart: [80, 'M40 28 C30 2 0 12 4 40 C8 62 32 74 40 90 C48 74 72 62 76 40 C80 12 50 2 40 28', 'a heart'],
    star: [84, star5, 'a star'],
    zigzag: [90, 'M0 30 L18 70 L36 30 L54 70 L72 30 L90 70', 'a zigzag'],
    wave: [96, 'M0 50 Q12 22 24 50 T48 50 T72 50 T96 50', 'a wave'],
    diamond: [70, 'M35 8 L2 50 L35 92 L68 50 L35 8', 'a diamond']
  };
  const glyph = (table, k) => { const g = table[k]; const strokes = g.slice(1).filter(x => /^M/.test(x)); return { w: g[0], s: strokes }; };

  const WORDS3 = [['🐱', 'cat'], ['🐶', 'dog'], ['☀️', 'sun'], ['🎩', 'hat'], ['🐷', 'pig'], ['🛏️', 'bed'], ['🚌', 'bus'], ['☕', 'cup'],
    ['🦊', 'fox'], ['🐔', 'hen'], ['🗺️', 'map'], ['🦇', 'bat'], ['🐛', 'bug'], ['🕸️', 'web'], ['📦', 'box'], ['🐜', 'ant'], ['🥚', 'egg'],
    ['🚐', 'van'], ['🥅', 'net'], ['🐮', 'cow'], ['🐝', 'bee']];
  const WORDS4 = [['🐟', 'fish'], ['🐸', 'frog'], ['🦆', 'duck'], ['⭐', 'star'], ['🚢', 'ship'], ['🦀', 'crab'], ['🥁', 'drum'], ['🥛', 'milk'],
    ['🔔', 'bell'], ['🎁', 'gift'], ['🧦', 'sock'], ['💍', 'ring'], ['⛺', 'tent'], ['✋', 'hand'], ['🦢', 'swan'], ['💡', 'lamp'], ['🌙', 'moon'],
    ['🤴', 'king'], ['🚩', 'flag'], ['🐻', 'bear']];
  // letters in teaching order: easy straight lines first (capitals), "magic c" letters first (small letters)
  const CAP_ORDER = 'LITEFHOCQGUJDPBRVWXYZAMNKS'.split('');
  const LOW_ORDER = 'cadgoqltijhbnmrpuyeswvxzfk'.split('');
  const SIZE = { 1: 24, 2: 22, 3: 21, 4: 19, 5: 16, 6: 12, 7: 11, 8: 10.5, 9: 9.5 };
  const INK = ['#ff4fa0', '#9b5cff', '#2f8fff', '#20b87a', '#ff9a1f'];

  // ---------- the tracer ----------
  // glyphs: [{w, s:[path...], say}] side by side. Resolves {offs}: how many times she slipped off the path.
  function tracer(api, glyphs, o) {
    const low = !!o.low, GAP = 14, PADX = 16;
    const H = low ? 126 : 102, Y0 = low ? -2 : -1;
    let x = 0;
    const at = glyphs.map(g => { const a = x; x += g.w + GAP; return a; });
    const W = x - GAP;
    const vb = [-PADX, Y0, W + PADX * 2, H];
    const tolU = o.tol, track = Math.max(12, o.tol * 1.45);
    const svg = mk('svg', { viewBox: vb.join(' '), class: 'trace-svg' });
    svg.style.height = o.size + 'rem';
    svg.style.width = (o.size * vb[2] / vb[3]).toFixed(2) + 'rem';
    if (low) {
      mk('line', { x1: vb[0], x2: W + PADX, y1: 10, y2: 10, class: 'tr-line' }, svg);
      mk('line', { x1: vb[0], x2: W + PADX, y1: 45, y2: 45, class: 'tr-line mid' }, svg);
      mk('line', { x1: vb[0], x2: W + PADX, y1: 90, y2: 90, class: 'tr-line base' }, svg);
    }
    const gTrack = mk('g', {}, svg), gDots = mk('g', {}, svg), gInk = mk('g', {}, svg), gMark = mk('g', {}, svg);
    const strokes = [], groups = [];
    glyphs.forEach((g, gi) => {
      const tg = mk('g', { transform: `translate(${at[gi]} 0)` }, gTrack);
      const dg = mk('g', { transform: `translate(${at[gi]} 0)` }, gDots);
      if (g.say) U.tag(tg, g.say, glyphs.length > 1);
      groups.push(tg);
      g.s.forEach(d => {
        const el = mk('path', { d, class: 'tr-track', 'stroke-width': track }, tg);
        mk('path', { d, class: 'tr-dots' }, dg);
        strokes.push({ gi, el, at: at[gi] });
      });
    });
    const start = mk('circle', { r: track * 0.5, class: 'tr-start' }, gMark);
    const arrow = mk('path', { d: 'M-5 -6 L7 0 L-5 6 Z', class: 'tr-arrow' }, gMark);
    const head = mk('path', { d: PA.art.starPath(0, 0, track * 0.62, track * 0.27), class: 'tr-star' }, gMark);

    const el = U.el('div', 'card trace-card');
    el.appendChild(svg);

    el.run = () => new Promise(resolve => {
      // sample each stroke into points 2.5 units apart (needs the svg on the page)
      strokes.forEach(s => {
        const L = s.el.getTotalLength();
        s.dot = L < 4;
        const n = Math.max(2, Math.ceil(L / 2.5));
        s.pts = [];
        for (let i = 0; i <= n; i++) { const p = s.el.getPointAtLength(L * i / n); s.pts.push([p.x + s.at, p.y]); }
        s.ink = mk('polyline', { class: 'tr-ink', 'stroke-width': track * 0.7, stroke: INK[s.gi % INK.length], points: '' }, gInk);
      });
      let k = 0, idx = 0, down = false, active = false, offs = 0, done = false, lastMove = Date.now(), nagAt = 0, demoing = 0;
      const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
      const LOOK = 8;
      const marks = () => {
        const s = strokes[k];
        if (!s) { start.style.display = arrow.style.display = head.style.display = 'none'; return; }
        const p0 = s.pts[0], ph = s.pts[idx];
        start.setAttribute('cx', p0[0]); start.setAttribute('cy', p0[1]);
        start.style.display = idx === 0 ? '' : 'none';
        head.setAttribute('transform', `translate(${ph[0]} ${ph[1]})`);
        head.style.display = idx === 0 ? 'none' : '';
        if (s.dot) { arrow.style.display = 'none'; return; }
        const a = s.pts[Math.min(s.pts.length - 1, idx + 9)], b = s.pts[Math.min(s.pts.length - 1, idx + 13)];
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
        arrow.style.display = idx + 13 < s.pts.length ? '' : 'none';
        arrow.setAttribute('transform', `translate(${b[0]} ${b[1]}) rotate(${ang.toFixed(0)}) scale(${(track / 20).toFixed(2)})`);
      };
      const ink = () => { const s = strokes[k]; s.ink.setAttribute('points', s.pts.slice(0, idx + 1).map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')); };
      const finishStroke = () => {
        const s = strokes[k];
        idx = s.pts.length - 1; ink();
        s.el.classList.add('done');
        PA.audio.sfx('step');
        k++; idx = 0; active = false;
        const nx = strokes[k];
        if (!nx || nx.gi !== s.gi) {
          U.flash(groups[s.gi]);
          if (o.onGlyph) o.onGlyph(s.gi);
        }
        marks();
        if (!nx) { done = true; clearInterval(idle); resolve({ offs }); }
      };
      const nag = text => { if (Date.now() - nagAt > 3500) { nagAt = Date.now(); api.say(text); } };
      // demo: a star draws the strokes from k (from idx) to the end of the glyph, or of everything
      el.demo = all => new Promise(res => {
        const my = ++demoing;
        const trail = mk('polyline', { class: 'tr-demo', 'stroke-width': track * 0.5 }, gMark);
        const ds = mk('path', { d: PA.art.starPath(0, 0, track * 0.7, track * 0.3), class: 'tr-star demo' }, gMark);
        const g0 = strokes[k] ? strokes[k].gi : 0;
        let kk = k, i = idx, acc = 0, last = 0, pts = [];
        let stopped = false;
        const stop = () => { if (stopped) return; stopped = true; trail.remove(); ds.remove(); res(); };
        setTimeout(stop, 15000); // never hang a question on the demo
        const tick = () => setTimeout(() => step(performance.now()), 30); // timers, not animation frames: never stalls
        const step = t => {
          if (my !== demoing || !api.alive || done) return stop();
          if (!last) last = t;
          acc += (t - last) / 1000 * 52; last = t;
          while (acc >= 1) {
            acc--; i++;
            if (i >= strokes[kk].pts.length) {
              kk++; i = 0; pts = []; acc = -14;
              if (kk >= strokes.length || (!all && strokes[kk].gi !== g0)) { setTimeout(stop, 300); return; }
            }
          }
          const p = strokes[kk].pts[Math.max(0, i)];
          pts.push(p);
          ds.setAttribute('transform', `translate(${p[0]} ${p[1]})`);
          trail.setAttribute('points', pts.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' '));
          tick();
        };
        tick();
      });
      const toVB = e => {
        const r = svg.getBoundingClientRect();
        const sc = Math.min(r.width / vb[2], r.height / vb[3]);
        const ox = r.left + (r.width - vb[2] * sc) / 2, oy = r.top + (r.height - vb[3] * sc) / 2;
        return { p: [vb[0] + (e.clientX - ox) / sc, vb[1] + (e.clientY - oy) / sc], sc };
      };
      let tol = tolU;
      const move = e => {
        if (done || !api.alive) return;
        const { p } = toVB(e);
        const s = strokes[k];
        if (!active) {
          // start (or carry on) from the green dot or the star
          if (down && dist(p, s.pts[idx]) < tol * 1.2) { active = true; } else return;
        }
        let best = -1;
        for (let j = idx + 1; j <= Math.min(s.pts.length - 1, idx + LOOK); j++) if (dist(p, s.pts[j]) < tol) best = j;
        if (best > idx) {
          idx = best; lastMove = Date.now(); ink(); marks();
          if (idx >= s.pts.length - 2) finishStroke();
        } else {
          let md = Infinity;
          for (let j = idx; j <= Math.min(s.pts.length - 1, idx + LOOK); j++) md = Math.min(md, dist(p, s.pts[j]));
          if (md > tol * 2.3) {
            active = false; offs++;
            PA.audio.sfx('wrong');
            nag(U.pick(['Oops! Go back to the star.', 'Stay on the path! Go back to the star.']));
            if (offs % 2 === 0) el.demo(false);
          }
        }
      };
      svg.addEventListener('pointerdown', e => {
        if (done || !api.alive) return;
        e.preventDefault();
        try { svg.setPointerCapture(e.pointerId); } catch (er) { }
        demoing++; el.touched = true;
        const { p, sc } = toVB(e);
        tol = Math.max(tolU, 24 / sc); // never fussier than about a fingertip
        down = true;
        const s = strokes[k];
        if (s.dot) { if (dist(p, s.pts[0]) < tol * 1.8) { lastMove = Date.now(); finishStroke(); } else nag('Tap the green dot.'); return; }
        if (dist(p, s.pts[idx]) < tol * 1.7) { active = true; lastMove = Date.now(); move(e); }
        else nag(idx === 0 ? 'Start at the green dot.' : 'Carry on from the star.');
      });
      svg.addEventListener('pointermove', e => { if (down) move(e); });
      const up = () => { down = false; active = false; };
      svg.addEventListener('pointerup', up);
      svg.addEventListener('pointercancel', up);
      const idle = setInterval(() => {
        if (!api.alive || done) return clearInterval(idle);
        if (Date.now() - lastMove > 11000 && !down) {
          lastMove = Date.now();
          api.say(idx === 0 ? 'Put your finger on the green dot, and follow the star.' : 'Carry on from the star.');
          el.demo(false);
        }
      }, 1000);
      marks();
    });
    return el;
  }

  // ---------- questions ----------
  const sizeFor = (api, lvl) => SIZE[lvl] * (1 - 0.15 * api.c);
  const tolFor = (api, lvl) => (lvl <= 2 ? 13 : lvl <= 5 ? 12 : 10.5) - 2 * api.c;
  const spell = w => w.split('').join(', ');

  function traceOne(api, lvl, g, key, intro, praise, low) {
    return {
      key,
      run: async a => {
        const t = tracer(a, [g], { size: sizeFor(a, lvl), tol: tolFor(a, lvl), low });
        a.stage.appendChild(t);
        a.setPrompt(intro + ' Start at the green dot, and follow the star.');
        const go = t.run();
        await a.say(intro + ' Watch the magic star!');
        if (!a.alive) return false;
        if (!t.touched) await t.demo(true);
        if (!a.alive) return false;
        if (!t.touched) a.say('Your turn! Start at the green dot.');
        const r = await go;
        if (!a.alive) return false;
        PA.audio.sfx('right'); a.cheer();
        await a.say(praise);
        return r.offs <= 1 + Math.floor(g.s.length / 3);
      }
    };
  }
  function shapeQ(api, lvl) {
    const pool = lvl === 1 ? ['down', 'across', 'circle', 'cross', 'slant', 'rain'] : ['square', 'triangle', 'xshape', 'heart', 'star', 'zigzag', 'wave', 'diamond'];
    const k = S.pick('trace', pool, 1, x => 'shape:' + x)[0];
    const g = glyph(SHAPES, k), name = SHAPES[k][SHAPES[k].length - 1];
    return traceOne(api, lvl, g, 'shape:' + k, `Let's draw ${name}!`, U.pick([`You drew ${name}!`, `Beautiful! ${cap1(name)}!`]));
  }
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
  function capQ(api, lvl) {
    const pool = CAP_ORDER.slice(0, Math.min(26, 8 + Math.floor(api.c * 20)));
    const L = S.pick('trace', pool, 1, x => 'cap:' + x)[0];
    return traceOne(api, lvl, glyph(CAP, L), 'cap:' + L, `This is big ${L}. Let's write big ${L}!`, U.pick([`You wrote big ${L}!`, `Big ${L}! Lovely writing!`]));
  }
  function numQ(api, lvl) {
    const n = S.pick('trace', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 1, x => 'num:' + x)[0];
    const w = U.numWord(n);
    return traceOne(api, lvl, glyph(NUM, n), 'num:' + n, `This is the number ${w}. Let's write ${w}!`, U.pick([`You wrote ${w}!`, `${cap1(w)}! Great writing!`]));
  }
  function lowQ(api, lvl) {
    const pool = LOW_ORDER.slice(0, Math.min(26, 8 + Math.floor(api.c * 20)));
    const l = S.pick('trace', pool, 1, x => 'low:' + x)[0];
    return traceOne(api, lvl, glyph(LOW, l), 'low:' + l, `This is little ${l}. Let's write little ${l}!`, U.pick([`You wrote little ${l}!`, `Little ${l}! Lovely!`]), true);
  }
  // write a word: the picture, then the word to trace (letters light up as they are spelled out)
  async function writeWord(a, lvl, e, w, demoFirst) {
    const gl = w.split('').map(ch => Object.assign(glyph(LOW, ch), { say: ch }));
    const t = tracer(a, gl, {
      size: sizeFor(a, lvl), tol: tolFor(a, lvl), low: true,
      onGlyph: gi => { if (gi < w.length - 1) a.say(w[gi]); }
    });
    a.stage.appendChild(t);
    const go = t.run();
    a.setPrompt(`${w}. Write the word ${w}: ${spell(w)}.`);
    await a.say(`${w}. Write the word ${w}: ${spell(w)}.`);
    if (demoFirst && a.alive) await t.demo(false);
    const r = await go;
    if (!a.alive) return false;
    PA.audio.sfx('right'); a.cheer();
    await a.say(U.pick([`${spell(w)}. ${w}! You wrote ${w}!`, `You wrote ${w}! ${spell(w)}!`]));
    return r.offs <= 1 + Math.floor(w.length / 2);
  }
  const pictureCard = (e, w) => U.tag(U.el('div', 'card prompt-card word-pic', `<span class="emoji">${e}</span>`), w);
  function wordQ(api, lvl, list) {
    const [e, w] = S.pick('trace', list, 1, x => 'word:' + x[1])[0];
    return {
      key: 'word:' + w, size: 2,
      run: async a => {
        a.stage.style.flexDirection = 'column';
        a.stage.appendChild(pictureCard(e, w));
        return writeWord(a, lvl, e, w, true);
      }
    };
  }
  // spell it with letter tiles first, then write it
  function spellQ(api, lvl, list) {
    const [e, w] = S.pick('trace', list, 1, x => 'spell:' + x[1])[0];
    return {
      key: 'spell:' + w, size: 3,
      run: async a => {
        a.stage.style.flexDirection = 'column';
        const top = U.el('div', 'row');
        top.appendChild(pictureCard(e, w));
        const letters = w.split('');
        const slots = U.el('div', 'slots');
        const slotEls = letters.map(() => { const s = U.el('div', 'slot'); slots.appendChild(s); return s; });
        top.appendChild(slots);
        a.stage.appendChild(top);
        const extra = U.shuffle('abcdefghijklmnoprstuwy'.split('').filter(x => letters.indexOf(x) < 0)).slice(0, a.nOpts(2, 4));
        const row = U.el('div', 'tiles-row');
        a.choices.appendChild(row);
        let atI = 0, misses = 0;
        a.prompt(`Spell ${w}! Tap the letters in order. ${w}.`);
        slotEls[0].classList.add('next');
        const spelled = await new Promise(resolve => {
          U.shuffle(letters.concat(extra)).forEach(ch => {
            const b = U.el('button', 'card choice ltile', ch);
            b.onclick = () => {
              if (!a.alive || atI >= letters.length || b.classList.contains('used')) return;
              if (ch === letters[atI]) {
                b.classList.add('used'); slotEls[atI].textContent = ch; slotEls[atI].classList.add('filled');
                slotEls.forEach(s => s.classList.remove('next', 'hint'));
                row.querySelectorAll('.hint').forEach(x => x.classList.remove('hint'));
                PA.audio.sfx('step'); atI++;
                if (atI < letters.length) { slotEls[atI].classList.add('next'); a.say(ch); } else resolve(misses === 0);
              } else {
                misses++; PA.audio.sfx('wrong');
                b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong');
                setTimeout(() => b.classList.remove('wrong'), 600);
                if (misses >= 2) {
                  row.querySelectorAll('.ltile').forEach(x => { if (!x.classList.contains('used') && x.textContent === letters[atI]) x.classList.add('hint'); });
                  a.say(`${w}. The next letter is ${letters[atI]}. Tap ${letters[atI]}.`);
                } else a.say(`Listen: ${w}. ${atI === 0 ? 'What sound comes first?' : 'What comes next?'}`);
              }
            };
            row.appendChild(b);
          });
        });
        if (!a.alive) return false;
        PA.audio.sfx('right'); a.cheer();
        await a.say(`${spell(w)}. You spelled ${w}! Now write it.`);
        if (!a.alive) return false;
        a.choices.innerHTML = '';
        top.removeChild(slots);
        const wrote = await writeWord(a, lvl, e, w, false);
        return spelled && wrote;
      }
    };
  }

  PA.traceFont = { CAP, NUM, LOW, SHAPES };
  PA.games.push({
    id: 'trace', name: 'Magic Writing', icon: '✍️', color: '#e2fbe4', maxLevel: 9,
    skill: 'Pre-writing strokes, letters, numbers, then spelling and writing words',
    research: 'Pre-writing strokes come first in the order occupational therapists use (Beery: down, across, circle, cross, diagonals, square, triangle). Letters are traced stroke by stroke from a start dot in the standard direction, because writing letters by hand helps children recognise them (Longcamp; James). The writing starts very big and shrinks as she climbs. Spelling a word and then writing it strengthens reading it (Ehri).',
    levels: ['Lines and circles', 'Shapes', 'Capital letters', 'Numbers 0 to 9', 'Small letters', 'Write 3-letter words', 'Spell and write 3-letter words', 'Write 4-letter words', 'Spell and write 4-letter words'],
    tryAtHome: [
      'Draw letters together in sand, shaving foam or with a finger on her back, and guess the letter.',
      'Hold a chunky crayon with her: "start at the top, go down".',
      'Write her name in big dotted letters for her to trace over.',
      'Ask her to spell and write a shopping word, like "egg" or "jam", on your list.'
    ],
    intro: lvl => ['Let\'s draw magic lines with your finger!', 'Let\'s draw shapes with your magic finger!', 'Let\'s write big letters!', 'Let\'s write numbers!',
      'Let\'s write little letters!', 'Let\'s write words!', 'Let\'s spell and write words!', 'Let\'s write bigger words!', 'Let\'s spell and write bigger words!'][lvl - 1],
    next(api, i, lvl) {
      if (lvl <= 2) return shapeQ(api, lvl);
      if (lvl === 3) return capQ(api, lvl);
      if (lvl === 4) return numQ(api, lvl);
      if (lvl === 5) return lowQ(api, lvl);
      if (lvl === 6) return wordQ(api, lvl, WORDS3);
      if (lvl === 7) return spellQ(api, lvl, WORDS3);
      if (lvl === 8) return wordQ(api, lvl, WORDS4);
      return spellQ(api, lvl, WORDS4);
    }
  });
})();
