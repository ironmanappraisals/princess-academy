'use strict';
// MERMAID COLOURS: a silly shark is chasing the mermaid. Every right answer helps her swim towards the beach;
// a wrong tap lets the shark creep a little closer, but it never catches her (no losing, as in every game here).
// At the end of the round she reaches the land and turns into a princess with legs.
// The ladder follows early-years art and science: name colours, sort things by colour (sorting by one attribute
// is also an early maths skill), then cause and effect with paint: two colours make a new one, mix it yourself,
// lighter with white and brown from all three, and the order of the rainbow.
//   1 find the colour          2 colour homes (put each sea friend in the matching home)
//   3 what do two colours make?   4 mix it yourself (tap two paints)   5 mixing homes (which two make it?)
//   6 lighter with white, and brown      7 rainbow order: which colour is missing?
window.PA = window.PA || {};
PA.games = PA.games || [];
(function () {
  const U = PA.ui, S = PA.store;
  const C = {
    red: '#e8383d', orange: '#ff8a1c', yellow: '#ffd21f', green: '#38b54a', blue: '#2f7fe8', purple: '#8e4fd6',
    pink: '#ff8fc8', brown: '#8b5a2b', black: '#2d2a32', white: '#ffffff', grey: '#9a9aa6', 'light blue': '#a6dcff'
  };
  const BASIC = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
  const RAINBOW = BASIC;
  const PRIMARY = ['red', 'yellow', 'blue'];
  const MIX = { 'red+yellow': 'orange', 'blue+red': 'purple', 'blue+yellow': 'green', 'red+white': 'pink', 'blue+white': 'light blue', 'black+white': 'grey' };
  const mixOf = (a, b) => a === b ? a : MIX[[a, b].sort().join('+')] || null;
  const PAIRS = [['red', 'yellow', 'orange'], ['blue', 'yellow', 'green'], ['red', 'blue', 'purple']];
  const KINDS = ['fish', 'shell', 'star', 'pearl'];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const dark = col => col === 'white' ? '#bdb6cc' : PA.art.shade(C[col], -0.3);

  // ---------- pictures ----------
  function thing(kind, col) {
    const s = `fill="${C[col]}" stroke="${dark(col)}" stroke-width="4" stroke-linejoin="round"`;
    let b;
    if (kind === 'fish') b = `<path d="M12 50 Q40 14 70 38 L90 22 L86 50 L90 78 L70 62 Q40 86 12 50 Z" ${s}/><circle cx="32" cy="44" r="6" fill="#fff"/><circle cx="33" cy="45" r="3" fill="#241626"/>`;
    else if (kind === 'shell') b = `<path d="M50 86 L16 40 Q50 2 84 40 Z" ${s}/><path d="M50 84 L33 30 M50 84 L50 20 M50 84 L67 30" stroke="${dark(col)}" stroke-width="3.5" fill="none" stroke-linecap="round"/><rect x="39" y="80" width="22" height="12" rx="5" ${s}/>`;
    else if (kind === 'star') b = `<path d="${PA.art.starPath(50, 54, 44, 19)}" ${s}/><circle cx="42" cy="50" r="3.5" fill="${dark(col)}"/><circle cx="58" cy="50" r="3.5" fill="${dark(col)}"/><path d="M43 60 Q50 66 57 60" stroke="${dark(col)}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    else b = `<circle cx="50" cy="50" r="38" ${s}/><circle cx="37" cy="36" r="9" fill="#fff" opacity=".75"/>`;
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${b}</svg>`;
  }
  const drop = col => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6 Q80 44 80 62 A30 30 0 0 1 20 62 Q20 44 50 6 Z" fill="${C[col] || '#cfc7da'}" stroke="${col ? dark(col) : '#a99fbd'}" stroke-width="4" stroke-linejoin="round"/><ellipse cx="38" cy="58" rx="6" ry="10" fill="#fff" opacity=".55"/></svg>`;
  const pot = col => `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="22" y="12" width="56" height="12" rx="5" fill="#d9cfe8"/><path d="M18 28 L82 28 L76 90 Q50 96 24 90 Z" fill="#fff" stroke="#cbbfdd" stroke-width="3"/><path d="M21 44 L79 44 L76 90 Q50 96 24 90 Z" fill="${C[col]}" stroke="${dark(col)}" stroke-width="3"/></svg>`;
  const caveHome = col => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M6 94 L6 52 A44 44 0 0 1 94 52 L94 94 Z" fill="${C[col]}" stroke="${dark(col)}" stroke-width="4" stroke-linejoin="round"/><path d="M28 94 L28 62 A22 22 0 0 1 72 62 L72 94 Z" fill="#103b5c" opacity=".3"/></svg>`;

  // ---------- the chase ----------
  const GAP = 9;
  function scene(api) {
    if (api.sea) return api.sea;
    const el = U.el('div', 'sea');
    el.innerHTML = '<div class="waves"></div><div class="beach"><span class="emoji palm">🌴</span><span class="emoji hut">🏰</span></div>' +
      '<span class="emoji bub b1">○</span><span class="emoji bub b2">○</span><span class="emoji bub b3">○</span>';
    const mer = U.el('div', 'mer', PA.art.mermaid());
    const shark = U.el('div', 'shark', PA.art.shark());
    U.tag(mer, 'mermaid'); U.tag(shark, 'shark');
    el.append(shark, mer);
    const sea = api.sea = { el, mer, shark, n: 0, gap: GAP };
    sea.place = () => {
      const x = 14 + 56 * Math.min(1, sea.n / (api.roundLen || 10));
      mer.style.left = x + '%';
      shark.style.left = (x - 16 - sea.gap) + '%';
    };
    sea.ahead = () => {
      sea.n++; sea.gap = GAP; sea.place();
      mer.classList.remove('swim'); void mer.offsetWidth; mer.classList.add('swim');
    };
    sea.closer = () => {
      sea.gap = Math.max(0, sea.gap - 4.5); sea.place();
      shark.classList.remove('snap'); void shark.offsetWidth; shark.classList.add('snap');
    };
    sea.place();
    return sea;
  }
  // every question: the chase on top, the question underneath
  function sq(api, q) {
    const sea = scene(api), build = q.build;
    q.build = (stage, a) => {
      stage.style.flexDirection = 'column';
      stage.appendChild(sea.el);
      if (build) build(stage, a);
    };
    const onRight = q.onRight;
    q.onRight = () => { sea.ahead(); if (onRight) onRight(); };
    const onHint = q.onHint;
    q.onHint = () => { sea.closer(); if (onHint) onHint(); };
    q.wrong = () => { sea.closer(); return Math.random() < 0.35 ? 'Swim, mermaid! Try again!' : null; };
    return q;
  }
  const equation = (cols, ans) => {
    const row = U.el('div', 'card mixrow');
    cols.forEach((col, i) => {
      if (i) row.appendChild(U.el('div', 'plus', '+'));
      row.appendChild(U.tag(U.el('div', 'paint', drop(col)), col));
    });
    row.appendChild(U.el('div', 'plus', '='));
    const q = U.el('div', 'paint ask', drop(null) + '<b>?</b>');
    row.appendChild(q);
    row.fill = () => { q.innerHTML = drop(ans); q.classList.add('filled'); };
    return row;
  };

  // 1: find the colour
  function findQ(api) {
    const pool = BASIC.concat(api.c > 0.35 ? ['pink', 'brown'] : []).concat(api.c > 0.7 ? ['black', 'white'] : []);
    const col = S.pick('colours', pool, 1, x => 'find:' + x)[0];
    const others = U.shuffle(pool.filter(x => x !== col)).slice(0, api.nOpts(3, 5) - 1);
    const opts = U.shuffle([col].concat(others));
    const mixed = api.c > 0.3; // different sea friends, so she has to look at the colour, not the shape
    const kind = U.pick(KINDS);
    return sq(api, {
      key: 'find:' + col,
      prompt: mixed ? `Find something ${col}!` : `Find the ${col} ${kind}!`,
      choices: opts.map(o => ({ html: thing(mixed ? U.pick(KINDS) : kind, o), cls: 'sea-choice', correct: o === col, aria: o })),
      hint: `This one is ${col}. Tap it.`,
      praise: U.pick([`Yes! That's ${col}!`, `${cap(col)}! Swim, mermaid, swim!`, `You found ${col}!`])
    });
  }

  // 3: what do two colours make?
  function mixQ(api) {
    const pi = S.pick('colours', [0, 1, 2], 1, k => 'mix:' + PAIRS[k][2])[0];
    let [a, b, ans] = PAIRS[pi];
    if (Math.random() < 0.5) { const t = a; a = b; b = t; }
    let opts = ['orange', 'green', 'purple'];
    if (api.nOpts(3, 4) > 3) opts.push(U.pick(PRIMARY));
    opts = U.shuffle(opts);
    let row;
    return sq(api, {
      key: 'mix:' + ans,
      prompt: `${cap(a)} and ${b} make... which colour?`,
      build(stage) { row = equation([a, b], ans); stage.appendChild(row); },
      onRight: () => row.fill(),
      choices: opts.map(o => ({ html: drop(o), cls: 'paint-choice', correct: o === ans, aria: o })),
      hint: `${cap(a)} and ${b} make ${ans}. Tap ${ans}.`,
      praise: `Yes! ${cap(a)} and ${b} make ${ans}!`
    });
  }

  // 6: lighter with white, and brown from all three
  const LIGHT = [
    { cols: ['red', 'white'], ans: 'pink', dis: ['purple', 'orange'] },
    { cols: ['blue', 'white'], ans: 'light blue', dis: ['green', 'purple'] },
    { cols: ['black', 'white'], ans: 'grey', dis: ['brown', 'blue'] },
    { cols: ['red', 'yellow', 'blue'], ans: 'brown', dis: ['green', 'orange', 'purple'] }
  ];
  function lightQ(api) {
    const li = S.pick('colours', LIGHT.map((_, k) => k), 1, k => 'light:' + LIGHT[k].ans)[0];
    const L = LIGHT[li];
    const opts = U.shuffle([L.ans].concat(U.shuffle(L.dis).slice(0, api.nOpts(2, 3))));
    const said = L.cols.length === 2 ? `${cap(L.cols[0])} and ${L.cols[1]}` : 'Red and yellow and blue, all mixed together,';
    let row;
    return sq(api, {
      key: 'light:' + L.ans,
      prompt: `${said} make... which colour?`,
      build(stage) { row = equation(L.cols, L.ans); stage.appendChild(row); },
      onRight: () => row.fill(),
      choices: opts.map(o => ({ html: drop(o), cls: 'paint-choice', correct: o === L.ans, aria: o })),
      hint: `${said} make ${L.ans}. Tap ${L.ans}.`,
      praise: L.ans === 'brown' ? 'Yes! When you mix lots of colours, you get brown!' : `Yes! ${cap(L.cols[0])} and white make ${L.ans}. White makes colours lighter!`
    });
  }

  // 7: rainbow order
  function rainbowQ(api) {
    const miss = S.pick('colours', RAINBOW, 1, x => 'rainbow:' + x)[0];
    const mi = RAINBOW.indexOf(miss);
    const pool = RAINBOW.filter(x => x !== miss).concat(['pink', 'brown']);
    const opts = U.shuffle([miss].concat(U.shuffle(pool).slice(0, api.nOpts(2, 4))));
    const said = RAINBOW.join(', ');
    let gap;
    return sq(api, {
      key: 'rainbow:' + miss,
      prompt: api.c > 0.5 ? 'Which colour is missing from the rainbow?' : `A rainbow goes ${RAINBOW.map(x => x === miss ? 'hmm' : x).join(', ')}. Which colour is missing?`,
      build(stage) {
        const card = U.el('div', 'card rainbow');
        let svg = '<svg viewBox="0 0 240 128" aria-hidden="true">';
        RAINBOW.forEach((col, i) => {
          const r = 108 - i * 15;
          svg += `<path data-i="${i}" d="M${120 - r} 122 A${r} ${r} 0 0 1 ${120 + r} 122" fill="none" stroke="${i === mi ? '#b9a6d6' : C[col]}" stroke-width="${i === mi ? 5 : 14}" ${i === mi ? 'stroke-dasharray="7 6" stroke-linecap="round"' : ''}/>`;
        });
        svg += '</svg>';
        card.innerHTML = svg;
        card.querySelectorAll('path').forEach(p => { const i = +p.getAttribute('data-i'); if (i !== mi) U.tag(p, RAINBOW[i]); });
        gap = card.querySelector(`path[data-i="${mi}"]`);
        stage.appendChild(card);
      },
      onRight: () => { gap.setAttribute('stroke', C[miss]); gap.setAttribute('stroke-width', '14'); gap.removeAttribute('stroke-dasharray'); U.tag(gap, miss); },
      choices: opts.map(o => ({ html: drop(o), cls: 'paint-choice', correct: o === miss, aria: o })),
      flashChoices: false,
      retry: 'Say the rainbow colours with me, and look for the gap.',
      hint: `${said}. ${cap(miss)} is missing. Tap ${miss}.`,
      praise: `Yes! ${said}! The rainbow is finished!`
    });
  }

  // ---------- drag (or tap, then tap) things into homes ----------
  // items: [{html, key, name}], homes: [{html, key}]. Resolves true when everything went home with no mistakes.
  function placeQ(api, o) {
    return api2 => new Promise(resolve => {
      const sea = scene(api2);
      api2.stage.style.flexDirection = 'column';
      api2.stage.appendChild(sea.el);
      const homesRow = U.el('div', 'homes'), itemsRow = U.el('div', 'loose');
      api2.stage.appendChild(homesRow);
      api2.choices.appendChild(itemsRow);
      let misses = 0, left = o.items.length, sel = null, busy = false;
      const homes = o.homes.map(h => {
        const el = U.el('div', 'sea-home', h.html); el._h = h;
        homesRow.appendChild(el);
        el.onclick = () => { if (sel) putIn(sel, el); };
        return el;
      });
      const items = o.items.map(it => {
        const el = U.el('div', 'card sea-item', it.html); el._it = it;
        el.setAttribute('role', 'button'); el.setAttribute('aria-label', it.name);
        itemsRow.appendChild(el);
        drag(el);
        return el;
      });
      api2.prompt(o.prompt);
      const select = el => {
        items.forEach(x => x.classList.toggle('sel', x === el));
        sel = el;
        if (el) { PA.audio.sfx('tap'); api2.say(o.onPick(el._it)); }
      };
      function hintFor(el) {
        homes.forEach(h => h.classList.toggle('hint', !!el && !h._full && h._h.key === el._it.key));
      }
      async function putIn(el, home) {
        if (busy || !api2.alive || el._done) return;
        if (!home || home._full) { select(el); return; }
        if (home._h.key === el._it.key) {
          busy = true;
          el._done = true; home._full = true; select(null); hintFor(null);
          el.classList.add('placed'); el.classList.remove('hint');
          home.appendChild(el);
          PA.audio.sfx('right'); api2.cheer();
          left--;
          await api2.say(o.onRight(el._it));
          busy = false;
          if (!left) { sea.ahead(); await api2.say(o.done || U.praise()); resolve(misses === 0); }
        } else {
          misses++; PA.audio.sfx('wrong'); sea.closer();
          el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
          select(el);
          if (misses >= 2) { hintFor(el); el.classList.add('hint'); }
          api2.say(o.onWrong(el._it, home._h));
        }
      }
      function drag(el) {
        let id = null, sx = 0, sy = 0, moved = false, sc = 1;
        el.addEventListener('pointerdown', e => {
          if (el._done || !api2.alive || busy) return;
          e.preventDefault();
          id = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
          sc = (el.getBoundingClientRect().width / el.offsetWidth) || 1;
          try { el.setPointerCapture(id); } catch (er) { }
        });
        el.addEventListener('pointermove', e => {
          if (e.pointerId !== id) return;
          const dx = e.clientX - sx, dy = e.clientY - sy;
          if (!moved && Math.abs(dx) + Math.abs(dy) > 12) { moved = true; el.classList.add('dragging'); if (sel !== el) select(el); }
          if (moved) el.style.transform = `translate(${dx / sc}px, ${dy / sc}px) scale(1.1)`;
        });
        const end = (e, cancel) => {
          if (e.pointerId !== id) return;
          id = null;
          if (!moved) { if (!cancel) select(sel === el ? null : el); return; }
          el.style.visibility = 'hidden';
          const t = cancel ? null : document.elementFromPoint(e.clientX, e.clientY);
          el.style.visibility = '';
          el.classList.remove('dragging'); el.style.transform = '';
          const home = t && t.closest ? t.closest('.sea-home') : null;
          if (home) putIn(el, home);
        };
        el.addEventListener('pointerup', e => end(e, false));
        el.addEventListener('pointercancel', e => end(e, true));
      }
    });
  }

  // 2: colour homes
  function homeQ(api) {
    const pool = BASIC.concat(api.c > 0.5 ? ['pink', 'brown'] : []);
    const cols = S.pick('colours', pool, api.nOpts(3, 5), x => 'home:' + x);
    const items = U.shuffle(cols.map(col => ({ html: thing(U.pick(KINDS), col), key: col, name: col })));
    return {
      key: 'home:' + cols.length,
      run: placeQ(api, {
        prompt: 'Help the sea friends hide from the shark! Drag each one into the home that is the same colour.',
        items, homes: U.shuffle(cols).map(col => ({ html: caveHome(col), key: col })),
        onPick: it => cap(it.name) + '!',
        onRight: it => U.pick([`${cap(it.name)} home!`, `Safe in the ${it.name} home!`]),
        onWrong: it => `That one is ${it.name}. Find the ${it.name} home.`,
        done: 'Everyone is safe! Swim, mermaid, swim!'
      })
    };
  }
  // 5: mixing homes: put each colour on the two paints that make it
  function mixHomeQ(api) {
    const pairs = U.shuffle(PAIRS);
    const pairHtml = p => `<div class="pairhome">${drop(p[0])}<b>+</b>${drop(p[1])}</div>`;
    return {
      key: 'mixhome',
      run: placeQ(api, {
        prompt: 'Mixing magic! Drag each sea friend onto the two colours that mix to make it.',
        items: U.shuffle(pairs.map(p => ({ html: thing(U.pick(KINDS), p[2]), key: p[2], name: p[2], p }))),
        homes: pairs.map(p => ({ html: pairHtml(p), key: p[2] })),
        onPick: it => cap(it.name) + '!',
        onRight: it => `${cap(it.p[0])} and ${it.p[1]} make ${it.name}!`,
        onWrong: it => `${cap(it.name)} is made from ${it.p[0]} and ${it.p[1]}. Find ${it.p[0]} and ${it.p[1]}.`,
        done: 'Mixing magic! Swim, mermaid, swim!'
      })
    };
  }

  // 4: mix it yourself
  function makeQ(api) {
    const pi = S.pick('colours', [0, 1, 2], 1, k => 'make:' + PAIRS[k][2])[0];
    const [x, y, target] = PAIRS[pi];
    const pots = PRIMARY.concat(api.c > 0.5 ? ['white'] : []);
    return {
      key: 'make:' + target,
      run: api2 => new Promise(resolve => {
        const sea = scene(api2);
        api2.stage.style.flexDirection = 'column';
        api2.stage.appendChild(sea.el);
        const row = U.el('div', 'row');
        const goal = U.tag(U.el('div', 'card goal', thing('fish', 'white')), 'fish');
        const bowl = U.el('div', 'card bowl', drop(null));
        row.append(goal, U.el('div', 'plus', '→'), bowl);
        api2.stage.appendChild(row);
        let first = null, misses = 0, busy = false;
        const prompt = `Paint the fish ${target}! Tap two paints to mix ${target}.`;
        api2.prompt(prompt);
        const btns = pots.map(col => {
          const b = U.el('button', 'card choice potc', pot(col));
          b.setAttribute('aria-label', col);
          U.tag(b, col);
          b.onclick = async () => {
            if (busy || !api2.alive) return;
            PA.audio.sfx('tap');
            if (!first) { first = col; bowl.innerHTML = drop(col); b.classList.add('picked'); api2.say(cap(col) + '...'); return; }
            busy = true;
            const a = first, res = mixOf(a, col);
            first = null;
            bowl.innerHTML = drop(res || 'brown');
            bowl.classList.remove('pop'); void bowl.offsetWidth; bowl.classList.add('pop');
            if (res === target) {
              btns.forEach(z => z.classList.remove('picked', 'hint'));
              goal.innerHTML = thing('fish', target);
              PA.audio.sfx('right'); api2.cheer(); sea.ahead();
              await api2.say(`${cap(a)} and ${col} make ${target}! You painted the fish ${target}!`);
              return resolve(misses === 0);
            }
            misses++; PA.audio.sfx('wrong'); sea.closer();
            const what = a === col ? `That's just ${a}.` : res ? `${cap(a)} and ${col} make ${res}.` : `${cap(a)} and ${col} make a muddy colour.`;
            if (misses >= 2) {
              await api2.say(`${what} ${cap(target)} is made from ${x} and ${y}. Tap ${x}, then ${y}.`);
              btns.forEach(z => z.classList.toggle('hint', z.getAttribute('aria-label') === x || z.getAttribute('aria-label') === y));
            } else await api2.say(`${what} We need ${target}. Try again!`);
            bowl.innerHTML = drop(null);
            btns.forEach(z => z.classList.remove('picked'));
            busy = false;
          };
          api2.choices.appendChild(b);
          return b;
        });
      })
    };
  }

  PA.games.push({
    id: 'colours', name: 'Mermaid Colours', icon: '🧜‍♀️', color: '#d4f3ff', maxLevel: 7,
    skill: 'Naming colours, sorting by colour, mixing paint, the rainbow',
    research: 'Naming colours, then sorting things by one attribute (an early maths and logic skill), then hands-on cause and effect with paint: two primary colours make a new one, white makes colours lighter, and the rainbow always comes in the same order. This is the usual order in early-years art and science.',
    levels: ['Find the colour', 'Colour homes', 'What do two colours make?', 'Mix it yourself', 'Mixing homes', 'Lighter colours and brown', 'Rainbow order'],
    tryAtHome: [
      'Mix paints (or food colouring in water) together: what do red and yellow make?',
      'Go on a colour hunt: find five red things in the house.',
      'Sort the washing, the toys or the crayons into colour piles.',
      'Squash two colours of play dough together and see what colour you get.'
    ],
    intro(lvl, api) {
      const sea = scene(api);
      api.stage.style.flexDirection = 'column';
      api.stage.appendChild(sea.el);
      return 'Oh no! A silly shark is chasing the mermaid! Answer the colour questions to help her swim to the beach. ' +
        ['Let\'s find colours!', 'Let\'s help the sea friends get home!', 'Let\'s mix colours!', 'Let\'s mix paint!',
          'Let\'s do mixing magic!', 'Let\'s make lighter colours!', 'Let\'s make a rainbow!'][lvl - 1];
    },
    next(api, i, lvl) {
      if (lvl === 1) return findQ(api);
      if (lvl === 2) return i % 2 ? findQ(api) : homeQ(api);
      if (lvl === 3) return mixQ(api);
      if (lvl === 4) return i % 2 ? mixQ(api) : makeQ(api);
      if (lvl === 5) return i % 2 ? makeQ(api) : mixHomeQ(api);
      if (lvl === 6) return i % 3 === 2 ? mixQ(api) : lightQ(api);
      return i % 3 === 2 ? lightQ(api) : rainbowQ(api);
    },
    // she reaches the land and turns into a princess
    async outro(api) {
      const sea = scene(api);
      api.hideGuide();
      api.stage.style.flexDirection = 'column';
      sea.el.classList.add('big');
      api.stage.appendChild(sea.el);
      await U.wait(60);
      sea.mer.style.left = '74%';
      sea.shark.classList.add('away');
      sea.shark.style.left = '-40%';
      await api.say('You did it! The mermaid swam all the way to the beach! Bye bye, silly shark!');
      if (!api.alive) return;
      const magic = U.el('div', 'magic emoji', '✨');
      sea.mer.appendChild(magic);
      PA.audio.sfx('sparkle');
      await U.wait(900);
      sea.mer.classList.add('human');
      sea.mer.innerHTML = PA.art.princess(Object.assign({}, S.state.profile, { dressColor: U.THEMES.colours.dress }), 'wow');
      PA.audio.sfx('sparkle');
      await api.say('Sparkle, sparkle! Her tail turned into legs! Now she is a princess on the land!');
      await U.wait(500);
    }
  });
})();
