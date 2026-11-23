'use strict';
// SHAPES: Clements & Sarama's research shows children build narrow shape ideas ("a triangle points up") when they
// only see textbook examples. So targets come in many sizes and turns, near-misses get feedback that names the
// rule ("triangles have three straight sides"), and later levels count corners and build pictures from shapes
// (the shape-composition trajectory in Building Blocks).
//   1 hunt: standard shapes        2 hunt: turned and stretched shapes     3 hunt: with near-misses
//   4 count the corners (tap each corner)   5 build a picture from shapes   6 hunt: pentagons and hexagons too
window.PA = window.PA || {};
PA.games = PA.games || [];
(function () {
  const U = PA.ui;
  const W = U.NUM_WORDS;
  const COLORS = ['#ff8fc8', '#a77bff', '#5fb8ff', '#ffcc33', '#41cf9b', '#ff8a5c'];
  const RULE = {
    triangle: 'Triangles have three straight sides and three corners.',
    square: 'Squares have four straight sides, all the same length, and square corners.',
    rectangle: 'Rectangles have four straight sides and square corners. Two sides are long and two are short.',
    circle: 'Circles are perfectly round, with no corners.',
    pentagon: 'Pentagons have five straight sides and five corners.',
    hexagon: 'Hexagons have six straight sides and six corners.'
  };
  const PLURAL = { triangle: 'triangles', square: 'squares', rectangle: 'rectangles', circle: 'circles', pentagon: 'pentagons', hexagon: 'hexagons' };

  const pts = p => p.map(q => q.map(v => +v.toFixed(1)).join(',')).join(' ');
  const poly = p => `<polygon points="${pts(p)}"/>`;
  const regular = (n, r, rot) => Array.from({ length: n }, (_, i) => {
    const a = (rot || -90) * Math.PI / 180 + i * 2 * Math.PI / n;
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
  });
  const TRI = [[[50, 12], [90, 80], [10, 80]], [[15, 15], [15, 85], [85, 85]], [[10, 75], [90, 85], [35, 15]], [[50, 4], [64, 96], [36, 96]], [[4, 68], [96, 68], [30, 36]]];
  const SHAPES = {
    triangle: () => poly(U.pick(TRI)),
    square: () => { const h = U.rand(22, 38); return `<rect x="${50 - h}" y="${50 - h}" width="${2 * h}" height="${2 * h}"/>`; },
    rectangle: () => { const w = U.rand(80, 96), h = U.rand(28, 46); return `<rect x="${50 - w / 2}" y="${50 - h / 2}" width="${w}" height="${h}"/>`; },
    circle: () => `<circle cx="50" cy="50" r="${U.rand(26, 44)}"/>`,
    pentagon: () => poly(regular(5, 44)),
    hexagon: () => poly(regular(6, 44, 0)),
    oval: () => '<ellipse cx="50" cy="50" rx="46" ry="24"/>',
    star: () => poly([[50, 5], [61, 38], [96, 38], [68, 59], [79, 93], [50, 72], [21, 93], [32, 59], [4, 38], [39, 38]]),
    heart: () => '<path d="M50 88 C10 62 4 32 27 22 C40 17 48 25 50 33 C52 25 60 17 73 22 C96 32 90 62 50 88 Z"/>',
    diamond: () => poly([[50, 4], [80, 50], [50, 96], [20, 50]]),
    slanted: () => poly([[28, 26], [96, 26], [72, 74], [4, 74]]),
    curvy: () => '<path d="M50 12 L90 76 Q50 104 10 76 Z"/>',
    open: () => '<path d="M44 22 L10 80 L90 80 L56 22" fill="none" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>',
    heptagon: () => poly(regular(7, 44))
  };
  const NEAR = {
    triangle: [['curvy', 'That one has a curvy side. Triangles have three straight sides.'], ['open', 'That one has a gap. A triangle is closed all the way around.']],
    square: [['diamond', 'That one is squished, its corners aren\'t square corners.'], ['rectangle', 'That one is long. A square\'s sides are all the same length.']],
    rectangle: [['slanted', 'That one leans over. Rectangles have square corners.']],
    circle: [['oval', 'That one is stretched. It\'s an oval. Circles are perfectly round.']],
    pentagon: [['hexagon', 'That one has six sides. It\'s a hexagon. Pentagons have five.']],
    hexagon: [['pentagon', 'That one has five sides. It\'s a pentagon. Hexagons have six.'], ['heptagon', 'Count the sides: that one has seven. Hexagons have six.']]
  };
  const NAME = { triangle: 'triangle', square: 'square', rectangle: 'rectangle', circle: 'circle', oval: 'oval', star: 'star', heart: 'heart', diamond: 'diamond', slanted: 'slanted shape', curvy: 'curvy shape', open: 'open shape', pentagon: 'pentagon', hexagon: 'hexagon', heptagon: 'seven-sided shape' };

  function svgFor(kind, rot, scale) {
    const col = U.pick(COLORS);
    return `<svg viewBox="0 0 100 100"><g transform="rotate(${rot} 50 50) translate(50 50) scale(${scale || 1}) translate(-50 -50)" fill="${col}" stroke="${PA.art.shade(col, -0.25)}" stroke-width="4" stroke-linejoin="round">${SHAPES[kind]()}</g></svg>`;
  }

  // ---------- hunts (1, 2, 3, 6) ----------
  function huntQ(lvl) {
    const kinds = lvl === 6 ? ['triangle', 'square', 'rectangle', 'circle', 'pentagon', 'hexagon'] : ['triangle', 'square', 'rectangle', 'circle'];
    const target = PA.store.pick('shapes', kinds, 1, k => 'shape:' + k)[0];
    return {
      key: 'shape:' + target,
      run: api => new Promise(resolve => {
        const nTargets = lvl === 1 ? 3 : 4;
        const total = lvl === 1 ? 8 : 11;
        const varied = lvl >= 2;
        const items = [];
        for (let i = 0; i < nTargets; i++) items.push({ kind: target, target: true, svg: svgFor(target, varied ? U.pick([0, 15, 30, 45, 90, 135, 180, 210, 300]) : 0, varied ? U.pick([0.7, 0.85, 1]) : 1) });
        const basic = (lvl === 6 ? ['triangle', 'square', 'rectangle', 'circle', 'pentagon', 'hexagon', 'star'] : ['triangle', 'square', 'rectangle', 'circle', 'star', 'heart'])
          .filter(k => k !== target && !(target === 'rectangle' && k === 'square'));
        if (lvl >= 3) NEAR[target].forEach(([k, why]) => items.push({ kind: k, why, svg: svgFor(k, U.pick([0, 20, 90, 160]), 1) }));
        while (items.length < total) { const k = U.pick(basic); items.push({ kind: k, svg: svgFor(k, varied ? U.pick([0, 30, 90]) : 0, 1) }); }

        const field = U.el('div', 'shape-field');
        const portrait = window.innerHeight > window.innerWidth;
        const cols = portrait ? 4 : 6, rows = portrait ? 4 : 3;
        const cells = U.shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, items.length);
        let found = 0, misses = 0;
        const count = U.el('div', 'found-count', '');
        const showCount = () => { count.innerHTML = `<span class="emoji">⭐</span> ${found} / ${nTargets}`; };
        showCount();
        const nodes = [];
        U.shuffle(items).forEach((it, i) => {
          const c = cells[i];
          const b = U.el('button', 'shp', it.svg);
          b.style.width = (100 / cols) + '%'; b.style.height = (100 / rows) + '%';
          b.style.left = (c % cols) * 100 / cols + '%';
          b.style.top = Math.floor(c / cols) * 100 / rows + '%';
          b.setAttribute('aria-label', NAME[it.kind]);
          nodes.push([b, it]);
          b.onclick = async () => {
            if (!api.alive || b.classList.contains('found')) return;
            if (it.target) {
              b.classList.remove('hint'); b.classList.add('found'); found++; showCount();
              PA.audio.sfx('right');
              if (found === nTargets) {
                api.cheer(); PA.audio.sfx('sparkle');
                await api.say(U.pick([`You found all the ${PLURAL[target]}! Even the tricky ones!`, `All the ${PLURAL[target]}! You looked so carefully!`]));
                resolve(misses === 0);
              } else PA.audio.say(U.pick(['Yes!', 'That\'s one!', 'Good eye!', 'Found it!']));
            } else {
              misses++; PA.audio.sfx('wrong');
              b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
              api.say(it.why || `That's a ${NAME[it.kind]}. ${RULE[target]}`);
              if (misses >= 2) nodes.forEach(([n, x]) => { if (x.target && !n.classList.contains('found')) n.classList.add('hint'); });
            }
          };
          field.appendChild(b);
        });
        api.hideGuide();
        api.stage.style.flexDirection = 'column';
        api.stage.style.width = '100%';
        api.stage.append(count, field);
        api.prompt(`Tap all the ${PLURAL[target]}! ${RULE[target]}`);
      })
    };
  }

  // ---------- 4: count the corners ----------
  const CORNER_SHAPES = [
    ['triangle', TRI[0]], ['triangle', TRI[2]], ['triangle', TRI[4]],
    ['square', [[20, 20], [80, 20], [80, 80], [20, 80]]], ['rectangle', [[6, 28], [94, 28], [94, 72], [6, 72]]],
    ['shape', [[15, 20], [85, 30], [75, 85], [20, 70]]], ['pentagon', regular(5, 44)], ['hexagon', regular(6, 44, 0)],
    ['shape', [[50, 8], [92, 40], [75, 92], [22, 85], [8, 40]]], ['shape', [[10, 30], [50, 8], [90, 30], [90, 80], [10, 80]]]
  ];
  function cornersQ() {
    const pick = PA.store.pick('shapes', CORNER_SHAPES.map((_, i) => i), 1, i => 'corners:' + i)[0];
    const [nm, p] = CORNER_SHAPES[pick];
    const n = p.length;
    const col = U.pick(COLORS);
    let dots = [], numberAll;
    const opts = Array.from(new Set([n, n - 1, n + 1, n + 2].filter(x => x >= 3 && x <= 7))).slice(0, 3);
    if (opts.indexOf(n) < 0) opts[0] = n;
    return {
      key: 'corners:' + pick,
      prompt: 'How many corners? Tap each corner to count.',
      build(stage) {
        const box = U.el('div', 'card corner-shape');
        const sv = `<svg viewBox="-8 -8 116 116"><polygon points="${pts(p)}" fill="${col}" stroke="${PA.art.shade(col, -0.25)}" stroke-width="3" stroke-linejoin="round"/>
          ${p.map((q, i) => `<g class="corner" data-i="${i}"><circle cx="${q[0]}" cy="${q[1]}" r="9" fill="#fff" stroke="#8a5cf6" stroke-width="2.5"/><text x="${q[0]}" y="${q[1] + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" font-family="sans-serif"></text></g>`).join('')}</svg>`;
        box.innerHTML = sv;
        stage.appendChild(box);
        let k = 0;
        dots = Array.from(box.querySelectorAll('.corner'));
        const mark = (g, num) => { g.querySelector('circle').setAttribute('fill', '#8a5cf6'); g.querySelector('text').textContent = num; g.dataset.done = '1'; U.tag(g, W[num]); };
        dots.forEach(g => g.addEventListener('click', () => {
          if (g.dataset.done) return;
          k++; mark(g, k); PA.audio.sfx('tap'); PA.audio.say(W[k]);
        }));
        numberAll = () => dots.forEach((g, i) => mark(g, i + 1));
      },
      choices: opts.sort((a, b) => a - b).map(x => ({ html: String(x), cls: 'num', correct: x === n, aria: String(x) })),
      onHint: () => numberAll && numberAll(),
      hint: `Let's count the corners: ${U.countAloud(1, n)}. ${W[n]} corners! Tap ${W[n]}.`,
      praise: nm === 'shape' ? `Yes! ${W[n]} corners!` : `Yes! ${W[n]} corners! It's a ${nm}.`
    };
  }

  // ---------- 5: build a picture ----------
  const PICTURES = [
    { name: 'castle', slots: [
      ['rectangle', '<rect x="50" y="80" width="100" height="70"/>'], ['rectangle', '<rect x="15" y="60" width="35" height="90"/>'],
      ['rectangle', '<rect x="150" y="60" width="35" height="90"/>'], ['triangle', '<polygon points="15,60 50,60 32.5,22"/>'],
      ['triangle', '<polygon points="150,60 185,60 167.5,22"/>'], ['triangle', '<polygon points="50,80 150,80 100,42"/>'],
      ['circle', '<circle cx="100" cy="103" r="11"/>'], ['square', '<rect x="87" y="124" width="26" height="26"/>']] },
    { name: 'crown', slots: [
      ['rectangle', '<rect x="30" y="105" width="140" height="35"/>'], ['triangle', '<polygon points="30,105 76,105 53,45"/>'],
      ['triangle', '<polygon points="77,105 123,105 100,28"/>'], ['triangle', '<polygon points="124,105 170,105 147,45"/>'],
      ['circle', '<circle cx="100" cy="122" r="10"/>'], ['square', '<rect x="46" y="114" width="16" height="16"/>'], ['square', '<rect x="138" y="114" width="16" height="16"/>']] },
    { name: 'carriage', slots: [
      ['circle', '<circle cx="100" cy="82" r="44"/>'], ['rectangle', '<rect x="38" y="114" width="124" height="16"/>'],
      ['circle', '<circle cx="62" cy="140" r="17"/>'], ['circle', '<circle cx="138" cy="140" r="17"/>'],
      ['square', '<rect x="85" y="62" width="30" height="30"/>'], ['triangle', '<polygon points="86,40 114,40 100,14"/>']] },
    { name: 'rocket', slots: [
      ['rectangle', '<rect x="80" y="50" width="40" height="80"/>'], ['triangle', '<polygon points="80,50 120,50 100,10"/>'],
      ['triangle', '<polygon points="80,100 80,140 55,140"/>'], ['triangle', '<polygon points="120,100 120,140 145,140"/>'],
      ['circle', '<circle cx="100" cy="75" r="11"/>'], ['square', '<rect x="90" y="130" width="20" height="20"/>']] }
  ];
  const KIND_COL = { rectangle: '#a77bff', triangle: '#ff8fc8', circle: '#ffcc33', square: '#5fb8ff' };
  const ICON = {
    circle: '<circle cx="50" cy="50" r="38"/>', triangle: '<polygon points="50,10 90,85 10,85"/>',
    square: '<rect x="15" y="15" width="70" height="70"/>', rectangle: '<rect x="4" y="28" width="92" height="44"/>'
  };
  const icon = k => `<svg viewBox="0 0 100 100"><g fill="${KIND_COL[k]}" stroke="${PA.art.shade(KIND_COL[k], -0.25)}" stroke-width="4">${ICON[k]}</g></svg>`;

  function buildQ() {
    const pic = PA.store.pick('shapes', PICTURES, 1, p => 'build:' + p.name)[0];
    return {
      key: 'build:' + pic.name,
      size: 3,
      run: api => new Promise(resolve => {
        api.hideGuide();
        const box = U.el('div', 'card build');
        box.innerHTML = `<svg viewBox="0 0 200 160">${pic.slots.map((s, i) => `<g class="slot" data-i="${i}" fill="rgba(255,255,255,.6)" stroke="#b9a6d0" stroke-width="2" stroke-dasharray="5 4">${s[1]}</g>`).join('')}</svg>`;
        api.stage.appendChild(box);
        const slotEls = Array.from(box.querySelectorAll('.slot'));
        let at = 0, misses = 0;
        const show = () => {
          slotEls.forEach((g, i) => {
            if (i === at) { g.setAttribute('stroke', '#ffc93c'); g.setAttribute('stroke-width', '4'); g.setAttribute('stroke-dasharray', ''); g.setAttribute('fill', '#fff7d6'); }
          });
        };
        const ask = () => {
          show();
          const kind = pic.slots[at][0];
          const others = U.shuffle(Object.keys(ICON).filter(k => k !== kind && !(kind === 'rectangle' && k === 'square') && !(kind === 'square' && k === 'rectangle'))).slice(0, 2);
          const opts = U.shuffle([kind].concat(others));
          api.choices.innerHTML = '';
          let tries = 0;
          opts.forEach(k => {
            const b = U.el('button', 'card choice shape-ic', icon(k));
            b.setAttribute('aria-label', k);
            b.onclick = async () => {
              if (!api.alive) return;
              if (k === kind) {
                const g = slotEls[at];
                g.setAttribute('fill', KIND_COL[kind]); g.setAttribute('stroke', PA.art.shade(KIND_COL[kind], -0.25)); g.setAttribute('stroke-width', '2');
                PA.audio.sfx('right');
                at++;
                if (at === pic.slots.length) {
                  api.choices.innerHTML = '';
                  api.cheer(); PA.audio.sfx('fanfare');
                  await api.say(`You built a ${pic.name}! Look at all those shapes!`);
                  return resolve(misses <= 1);
                }
                api.say(U.pick([`A ${kind}!`, `Yes, a ${kind}!`, 'It fits!']));
                ask();
              } else {
                tries++; misses++; PA.audio.sfx('wrong');
                b.classList.add('wrong');
                if (tries >= 2) {
                  Array.from(api.choices.children).forEach(x => { if (x.getAttribute('aria-label') === kind) x.classList.add('hint'); });
                  api.say(`This spot needs a ${kind}. ${RULE[kind]}`);
                } else api.say(`Hmm, that won't fit. Look at the shiny outline. What shape is it?`);
              }
            };
            api.choices.appendChild(b);
          });
        };
        api.prompt(`Let's build a ${pic.name}! Which shape fits the shiny spot?`);
        ask();
      })
    };
  }

  PA.games.push({
    id: 'shapes', name: 'Shapes', icon: '🔺', color: '#d5f5e8', maxLevel: 6,
    skill: 'Shapes, sides and corners, building with shapes',
    research: 'Seeing shapes in many sizes and turns next to near-misses builds real understanding instead of "triangles point up"; counting corners and building pictures from shapes follow the shape and composition trajectories of Building Blocks (Clements & Sarama).',
    levels: ['Hunt: standard shapes', 'Hunt: turned and stretched', 'Hunt: tricky near-misses', 'Count the corners', 'Build a picture', 'Hunt: pentagons and hexagons'],
    tryAtHome: [
      'Go on a shape hunt in the kitchen: is the plate a circle? Is the door a rectangle?',
      'Tilt a triangle cracker upside-down and ask, "Is it still a triangle?"',
      'Build a castle from blocks and name the shapes you used.',
      'Count the corners on a book, a sandwich, a sign.'
    ],
    intro: lvl => lvl === 4 ? 'Let\'s count corners!' : lvl === 5 ? 'Let\'s build pictures with shapes!' : 'Let\'s go on a shape hunt!',
    next(api, i, lvl) { return lvl === 4 ? cornersQ() : lvl === 5 ? buildQ() : huntQ(lvl); }
  });
})();
