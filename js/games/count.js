'use strict';
// GEM COUNTING: number sense along the counting, subitizing, comparing and adding learning trajectories from
// Building Blocks (Clements & Sarama), a preschool maths programme with strong results in large randomised trials.
//   1 count 1-5 by tapping each one (one-to-one), then pick the numeral
//   2 "Give me N" 1-5: put exactly N jewels on the crown (the give-a-number task, Wynn 1990: cardinality)
//   3 quick look 1-5: dots flash, say how many without counting (subitizing)
//   4 count 1-10 in a ten-frame (5-and-10 structure)
//   5 which chest has more / fewer?
//   6 give me N up to 10
//   7 one more / one less
//   8 hiding gems: 7 in all, I see 4, how many hiding? (part-whole, number bonds)
//   9 adding two groups (to 10)
//  10 taking away (from 10)
// Past ten (for children who already count to 10 well):
//  11 teen numbers: a full ten-frame and some more ("ten and three is thirteen"): the teen names are irregular in
//     English, so seeing 13 as 10 + 3 matters (place-value groundwork)
//  12 the number path: what number is missing? Counting sequence into the 20s, and later up to 100
//  13 make ten: how many more fill the ten-frame? (pairs that make 10 are the key to adding within 20)
//  14 counting on: 8 are in the chest, here are 3 more; start at 8 instead of counting from 1
//  15 adding within 20 with two ten-frames, shown the "make ten" way (8 + 5 = 10 + 3)
//  16 counting by tens: sticks of ten (unitizing), then sticks and loose ones up to 99
// Feedback models the strategy: count every one, "the last number tells how many", count on from the bigger part.
// The 2.5%-per-round ramp (api.c, 0..1) grows the numbers, adds answer choices (3 up to 5) and shortens peeks.
window.PA = window.PA || {};
PA.games = PA.games || [];
(function () {
  const U = PA.ui;
  const W = n => U.numWord(n);
  const THINGS = [
    { e: '💎', p: 'gems' }, { e: '🍓', p: 'strawberries' }, { e: '🌸', p: 'flowers' }, { e: '⭐', p: 'stars' },
    { e: '🧁', p: 'cupcakes' }, { e: '🦋', p: 'butterflies' }, { e: '🐚', p: 'shells' }, { e: '🍎', p: 'apples' }
  ];
  const FOOD = [{ e: '🧁', p: 'cupcakes' }, { e: '🍓', p: 'strawberries' }, { e: '🍪', p: 'cookies' }, { e: '🍎', p: 'apples' }, { e: '🍩', p: 'doughnuts' }];
  // dice-pattern centres as % of the box
  const DICE = {
    1: [[50, 50]], 2: [[25, 25], [75, 75]], 3: [[21, 21], [50, 50], [79, 79]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]], 5: [[21, 21], [79, 21], [50, 50], [21, 79], [79, 79]],
    6: [[25, 19], [75, 19], [25, 50], [75, 50], [25, 81], [75, 81]]
  };

  // k numeral choices around n (the answer lands in a random position, never always in the middle)
  function numberChoices(n, lo, hi, k, step) {
    k = k || 3; step = step || 1;
    const near = [];
    for (let d = 1; d <= Math.max(2, k - 1); d++) near.push(n - d * step, n + d * step);
    const set = new Set([n]);
    for (const x of U.shuffle(near)) if (set.size < k && x >= lo && x <= hi) set.add(x);
    return Array.from(set).sort((a, b) => a - b).map(x => ({ html: String(x), cls: 'num', correct: x === n, aria: String(x) }));
  }
  function gemBox(t, n, cls) {
    const box = U.el('div', 'card gems');
    const gems = [];
    for (let i = 0; i < n; i++) { const g = U.el('button', 'gem emoji' + (cls ? ' ' + cls : ''), t.e); box.appendChild(g); gems.push(g); }
    return { box, gems };
  }
  // number label on a counted thing; it also lights up whenever the voice says that number
  const label = (g, n) => { g.dataset.n = n; g.classList.add('counted'); U.tag(g, W(n)); };
  // tap each one to count it; numbering continues across groups (from `start`, for counting on).
  // Returns a "count them all" helper for hints.
  function tapToCount(gems, start) {
    start = start || 0;
    let k = start;
    const live = () => gems.filter(g => !g.classList.contains('eaten'));
    gems.forEach(g => {
      g.onclick = () => {
        if (g.classList.contains('counted') || g.classList.contains('eaten')) return;
        k++; label(g, k);
        PA.audio.sfx('tap'); PA.audio.say(W(k));
      };
    });
    return () => { live().forEach((g, i) => label(g, start + i + 1)); k = start + live().length; };
  }
  const pickKey = (prefix, lo, hi) => {
    const pool = []; for (let x = lo; x <= hi; x++) pool.push(x);
    return PA.store.pick('count', pool, 1, x => prefix + x)[0];
  };
  function tenFrame(t, n, ghosts) {
    const box = U.el('div', 'card tenframe');
    const gems = [], empty = [], slots = [];
    for (let i = 0; i < 10; i++) {
      const s = U.el('div', 'slot');
      if (i < n) { const g = U.el('button', 'gem emoji', t.e); s.appendChild(g); gems.push(g); }
      else if (ghosts) { const g = U.el('button', 'gem emoji ghost', t.e); s.appendChild(g); empty.push(g); }
      box.appendChild(s); slots.push(s);
    }
    return { box, gems, empty, slots };
  }

  // 1, 4: count
  function countQ(lo, hi, layout, k) {
    const n = pickKey('count:', lo, hi), t = U.pick(THINGS);
    let countAll;
    return {
      key: 'count:' + n,
      prompt: `How many ${t.p}? Tap each one to count.`,
      build(stage) {
        let box, gems = [];
        if (layout === 'ten' && n <= 10) ({ box, gems } = tenFrame(t, n));
        else ({ box, gems } = gemBox(t, n));
        stage.appendChild(box);
        countAll = tapToCount(gems);
      },
      choices: numberChoices(n, 1, hi + 1, k),
      onHint: () => countAll && countAll(),
      hint: `Let's count together. ${U.countAloud(1, n)}. The last number we say tells how many: ${W(n)}! Tap ${W(n)}.`,
      praise: U.pick([`Yes! ${W(n)} ${t.p}!`, `${W(n)}! You counted every one.`, `That's right, ${W(n)}! The last number tells how many.`])
    };
  }

  // 3: quick look
  function quickQ(c, k) {
    const n = pickKey('look:', 1, c >= 0.5 ? 6 : 5), t = U.pick(THINGS);
    let cover;
    return {
      key: 'look:' + n,
      prompt: 'Quick look! How many did you see?',
      build(stage) {
        const box = U.el('div', 'card dice');
        DICE[n].forEach(([x, y]) => {
          const g = U.el('div', 'gem emoji', t.e);
          g.style.left = x + '%'; g.style.top = y + '%';
          box.appendChild(g);
        });
        cover = U.el('div', 'flash-cover emoji', '☁️');
        cover.style.display = 'none';
        box.appendChild(cover);
        stage.appendChild(box);
        setTimeout(() => { cover.style.display = ''; }, Math.round(1500 * (1 - 0.45 * c)));
      },
      choices: numberChoices(n, 1, 7, k),
      onHint: () => { if (cover) cover.style.display = 'none'; },
      hint: `Let's look again. ${U.countAloud(1, n)}. ${W(n)}! Tap ${W(n)}.`,
      praise: U.pick([`Yes! ${W(n)}! You saw it so fast!`, `${W(n)}! Great quick looking!`])
    };
  }

  // 2, 6: give me N
  function giveQ(lo, hi, pileSize) {
    const n = pickKey('give:', lo, hi), t = U.pick(THINGS);
    return {
      key: 'give:' + n,
      run: api => new Promise(resolve => {
        const head = U.tag(U.el('div', 'give-big', String(n)), W(n));
        const zone = U.el('div', 'card crown-zone');
        const ph = U.el('span', 'emoji', '👑'); ph.style.fontSize = '3.4rem'; ph.style.opacity = '.35';
        zone.appendChild(ph);
        const pile = U.el('div', 'pile');
        const items = [];
        for (let i = 0; i < pileSize; i++) { const g = U.el('button', 'gem emoji', t.e); pile.appendChild(g); items.push(g); }
        api.stage.style.flexDirection = 'column';
        api.stage.append(head, zone, pile);
        const done = U.el('button', 'btn mint', '<span class="emoji">✅</span> Done');
        api.choices.appendChild(done);
        const inCrown = () => zone.querySelectorAll('.gem');
        // number the crown jewels so "one... two... three" lights each in turn; Done glows once there's something to check
        const refresh = () => {
          const list = inCrown();
          ph.style.display = list.length ? 'none' : '';
          for (let i = 0; i < list.length; i++) U.tag(list[i], W(i + 1));
          U.go(done, list.length > 0 && !done.disabled);
        };
        items.forEach(g => {
          g.onclick = () => {
            if (g.classList.contains('gone')) return;
            g.classList.add('gone');
            const c = U.el('button', 'gem emoji', t.e);
            c.onclick = () => { c.remove(); g.classList.remove('gone'); PA.audio.sfx('tap'); refresh(); PA.audio.say(W(inCrown().length)); };
            zone.appendChild(c); refresh();
            PA.audio.sfx('step'); PA.audio.say(W(inCrown().length));
          };
        });
        api.prompt(`Put ${W(n)} ${t.p} on the princess's crown. Then tap done.`);
        let misses = 0, finished = false;
        done.onclick = async () => {
          if (finished) return;
          const k = inCrown().length;
          if (k === n) {
            finished = true; done.disabled = true; U.go(done, false);
            PA.audio.sfx('right'); api.cheer();
            await api.say(U.pick([`Yes! ${W(n)} ${t.p}! Perfect!`, `${W(n)}! You counted out exactly ${W(n)}!`]));
            return resolve(misses === 0);
          }
          misses++; PA.audio.sfx('wrong');
          const counted = k ? U.countAloud(1, k) + '. That\'s ' + W(k) + '.' : 'The crown is empty.';
          if (misses < 2) {
            api.say(`Let's check. ${counted} We need ${W(n)}. ${k > n ? 'Take some off.' : 'Add some more.'}`);
          } else {
            done.disabled = true; U.go(done, false);
            while (inCrown().length > n) inCrown()[inCrown().length - 1].click();
            while (inCrown().length < n) { const free = items.find(g => !g.classList.contains('gone')); if (!free) break; free.click(); }
            PA.audio.sfx('sparkle');
            await api.say(`Let's do it together. ${U.countAloud(1, n)}. Now there are ${W(n)}!`);
            resolve(false);
          }
        };
      })
    };
  }

  // 5: more or fewer
  function compareQ(c) {
    const d = pickKey('cmp:', 1, 4);
    const top = 10 + Math.round(c * 8);
    const lo = U.rand(1, top - d), hi = lo + d;
    const askMore = Math.random() < 0.6;
    const t = U.pick(THINGS);
    const left = Math.random() < 0.5 ? lo : hi, right = left === lo ? hi : lo;
    const ans = askMore ? hi : lo;
    const card = n => {
      let h = ''; for (let i = 0; i < n; i++) h += `<span class="gem sm emoji">${t.e}</span>`;
      return `<div class="gems" style="padding:0;max-width:16rem;gap:.3rem">${h}</div>`;
    };
    const word = askMore ? 'more' : 'fewer';
    return {
      key: 'cmp:' + d,
      prompt: `Which treasure chest has ${word} ${t.p}?`,
      choices: [left, right].map(n => ({ html: card(n), cls: 'wide', correct: n === ans, aria: n + ' ' + t.p })),
      hint: `This chest has ${W(hi)}, and that one has ${W(lo)}. ${W(hi)} is more than ${W(lo)}. So ${W(ans)} is ${word}. Tap it.`,
      praise: `Yes! ${W(ans)} is ${word} than ${W(ans === hi ? lo : hi)}!`
    };
  }

  // 7: one more / one less
  function moreLessQ(c, k) {
    const top = 10 + Math.round(c * 8);
    const more = Math.random() < 0.55;
    const n = more ? pickKey('more:', 1, top - 1) : pickKey('less:', 2, top);
    const t = U.pick(THINGS);
    const ans = more ? n + 1 : n - 1;
    let countAll;
    return {
      key: (more ? 'more:' : 'less:') + n,
      prompt: more ? `The fairy has ${W(n)} ${t.p}. Watch! She magics one more. How many now?`
        : `The fairy has ${W(n)} ${t.p}. Oh no! The dragon takes one away. How many now?`,
      build(stage) {
        const { box, gems } = gemBox(t, n);
        stage.appendChild(box);
        setTimeout(() => {
          if (more) {
            const g = U.el('button', 'gem emoji arrive', t.e); box.appendChild(g); gems.push(g); PA.audio.sfx('sparkle');
          } else { gems[gems.length - 1].classList.add('eaten'); PA.audio.sfx('wrong'); }
          countAll = tapToCount(gems);
        }, 2600);
        countAll = tapToCount(gems);
      },
      choices: numberChoices(ans, 1, top, k),
      onHint: () => countAll && countAll(),
      hint: more ? `There were ${W(n)}. One more makes ${W(ans)}. Tap ${W(ans)}.` : `There were ${W(n)}. One less makes ${W(ans)}. Tap ${W(ans)}.`,
      praise: more ? `Yes! ${W(n)}, and one more is ${W(ans)}!` : `Yes! One less than ${W(n)} is ${W(ans)}!`
    };
  }

  // 8: hiding (part-whole)
  function hidingQ(c, k) {
    const top = 10 + Math.round(c * 5);
    const T = pickKey('hide:', 3, top), v = U.rand(1, T - 1), h = T - v;
    const t = U.pick(THINGS);
    let cloud, box;
    return {
      key: 'hide:' + T,
      prompt: `There are ${W(T)} ${t.p} in all. I can see ${W(v)}. How many are hiding under the cloud?`,
      build(stage) {
        stage.appendChild(U.el('div', 'card prompt-card', `<span class="give-big">${T}</span><span class="lbl">in all</span>`));
        const g = gemBox(t, v);
        box = g.box;
        cloud = U.el('div', 'cloud emoji', '☁️');
        box.appendChild(cloud);
        tapToCount(g.gems);
        stage.appendChild(box);
      },
      choices: numberChoices(h, 1, top - 1, k),
      onHint: () => {
        if (!cloud) return;
        const frag = []; for (let i = 0; i < h; i++) frag.push(U.tag(U.el('span', 'gem emoji hidden-gem', t.e), W(v + i + 1)));
        cloud.replaceWith.apply(cloud, frag);
      },
      hint: `Let's count on from ${W(v)}: ${U.countAloud(v, T)}. That's ${W(h)} more hiding! Tap ${W(h)}.`,
      praise: `Yes! ${W(v)} and ${W(h)} make ${W(T)}!`
    };
  }

  // 9: add two groups
  function addQ(c, k) {
    const top = 10 + Math.round(c * 5);
    const S = pickKey('add:', 2, top), a = U.rand(1, S - 1), b = S - a;
    const t = U.pick(THINGS);
    let countAll;
    return {
      key: 'add:' + S,
      prompt: `The princess has ${W(a)} ${t.p} in this box, and ${W(b)} in that box. How many ${t.p} altogether?`,
      build(stage) {
        const A = gemBox(t, a), B = gemBox(t, b);
        A.box.style.maxWidth = B.box.style.maxWidth = '17rem';
        stage.append(A.box, U.el('div', 'plus', '+'), B.box);
        countAll = tapToCount(A.gems.concat(B.gems));
      },
      choices: numberChoices(S, 1, top + 2, k),
      onHint: () => countAll && countAll(),
      hint: `Let's count them all: ${U.countAloud(1, S)}. ${W(a)} and ${W(b)} make ${W(S)}! Tap ${W(S)}.`,
      praise: U.pick([`Yes! ${W(a)} and ${W(b)} make ${W(S)}!`, `${W(S)} altogether! Great adding!`])
    };
  }

  // 10: take away
  function takeQ(c, k) {
    const top = 10 + Math.round(c * 5);
    const s = pickKey('take:', 3, top), tk = U.rand(1, s - 1), left = s - tk;
    const t = U.pick(FOOD);
    let countAll;
    return {
      key: 'take:' + s,
      prompt: `There are ${W(s)} ${t.p}. The hungry dragon eats ${W(tk)}! How many are left?`,
      build(stage) {
        const g = gemBox(t, s);
        stage.append(g.box, U.el('div', 'cloud emoji', '🐉'));
        countAll = tapToCount(g.gems);
        setTimeout(() => { g.gems.slice(s - tk).forEach(x => x.classList.add('eaten')); PA.audio.sfx('wrong'); }, 2400);
      },
      choices: numberChoices(left, 1, top, k),
      onHint: () => countAll && countAll(),
      hint: `Count the ones that are left: ${U.countAloud(1, left)}. ${W(s)} take away ${W(tk)} is ${W(left)}. Tap ${W(left)}.`,
      praise: `Yes! ${W(s)} take away ${W(tk)} leaves ${W(left)}!`
    };
  }

  // 11: teen numbers = ten and some more
  function teenQ(c, k) {
    const n = pickKey('teen:', 11, c >= 0.5 ? 20 : 19), t = U.pick(THINGS);
    let countAll;
    return {
      key: 'teen:' + n,
      prompt: c >= 0.5 ? `How many ${t.p}?` : `How many ${t.p}? This frame is full: that's ten. Then count on.`,
      build(stage) {
        const wrap = U.el('div', 'frames');
        const A = tenFrame(t, 10), B = tenFrame(t, n - 10);
        wrap.append(A.box, B.box);
        stage.appendChild(wrap);
        countAll = tapToCount(A.gems.concat(B.gems));
      },
      choices: numberChoices(n, 10, 20, k),
      onHint: () => countAll && countAll(),
      hint: `This frame is full. That's ten! Then count on: ${U.countAloud(11, n)}. Ten and ${W(n - 10)} make ${W(n)}! Tap ${W(n)}.`,
      praise: U.pick([`Yes! Ten and ${W(n - 10)} make ${W(n)}!`, `${W(n)}! One full ten, and ${W(n - 10)} more.`])
    };
  }

  // 12: number path, what's missing?
  function trackQ(c, k) {
    const hiStart = 24 + Math.round(c * 70); // grows from the 20s up toward 100
    const s = U.rand(6, hiStart);
    const decade = Math.floor((s + 2) / 10);
    const len = 5, gap = U.rand(1, len - 1), ans = s + gap;
    const nums = []; for (let i = 0; i < len; i++) nums.push(s + i);
    const read = c < 0.4;
    let blankEl;
    return {
      key: 'track:' + decade,
      prompt: read ? `Count along the path: ${nums.map((x, i) => i === gap ? 'hmmm' : W(x)).join(', ')}. What number is missing?`
        : 'Count along the number path. What number is missing?',
      build(stage) {
        const tr = U.el('div', 'card track');
        nums.forEach((x, i) => {
          const d = U.el('div', 'tsq' + (i === gap ? ' blank' : ''), i === gap ? '?' : String(x));
          if (i === gap) blankEl = d; else U.tag(d, W(x));
          tr.appendChild(d);
        });
        stage.appendChild(tr);
      },
      choices: numberChoices(ans, 1, 109, k),
      onHint: () => blankEl && U.tag(blankEl, W(ans)),
      onRight: () => { if (blankEl) { blankEl.className = 'tsq filled'; blankEl.textContent = String(ans); U.tag(blankEl, W(ans)); } },
      hint: `Let's count: ${U.countAloud(s, s + len - 1)}. ${W(ans)} is missing! Tap ${W(ans)}.`,
      praise: U.pick([`Yes! ${W(ans - 1)}, ${W(ans)}, ${W(ans + 1)}!`, `${W(ans)}! You know your numbers!`])
    };
  }

  // 13: make ten
  function makeTenQ(k) {
    const n = pickKey('ten:', 1, 9), t = U.pick(THINGS), need = 10 - n;
    let countAll;
    return {
      key: 'ten:' + n,
      prompt: `A full frame holds ten ${t.p}. There are ${W(n)}. How many more to fill it up?`,
      build(stage) {
        const f = tenFrame(t, n, true);
        stage.appendChild(f.box);
        countAll = tapToCount(f.empty);
      },
      choices: numberChoices(need, 1, 9, k),
      onHint: () => countAll && countAll(),
      hint: `Count the empty spots: ${U.countAloud(1, need)}. ${W(n)} and ${W(need)} make ten! Tap ${W(need)}.`,
      praise: U.pick([`Yes! ${W(n)} and ${W(need)} make ten!`, `${W(need)} more fills it up! ${W(n)} and ${W(need)} make ten.`])
    };
  }

  // 14: count on from the number in the chest
  function countOnQ(c, k) {
    const a = pickKey('on:', 4, 12 + Math.round(c * 8)), b = U.rand(1, 3 + Math.round(c * 2)), S = a + b;
    const t = U.pick(THINGS);
    let countAll;
    return {
      key: 'on:' + a,
      prompt: `There are ${W(a)} ${t.p} in the treasure chest, and ${W(b)} more here. How many altogether?` + (c < 0.5 ? ` Start at ${W(a)} and count on.` : ''),
      build(stage) {
        const chest = U.tag(U.el('div', 'card chest', `<span class="emoji">🧰</span><span class="give-big">${a}</span>`), W(a));
        const B = gemBox(t, b);
        stage.append(chest, U.el('div', 'plus', '+'), B.box);
        countAll = tapToCount(B.gems, a);
      },
      choices: numberChoices(S, 1, 40, k),
      onHint: () => countAll && countAll(),
      hint: `Start at ${W(a)}, the number in the chest. Then count on: ${U.countAloud(a + 1, S)}. ${W(S)} altogether! Tap ${W(S)}.`,
      praise: U.pick([`Yes! ${W(a)}... ${U.countAloud(a + 1, S)}. ${W(S)}!`, `${W(S)}! You counted on from ${W(a)}!`])
    };
  }

  // 15: adding within 20, the make-ten way
  function add20Q(k) {
    const S = pickKey('add20:', 11, 18);
    const a = U.rand(Math.max(S - 9, 6), 9), b = S - a, fill = 10 - a, rest = b - fill;
    const t = U.pick(THINGS);
    let countAll, A, B;
    return {
      key: 'add20:' + S,
      prompt: `${W(a)} ${t.p} in this frame, and ${W(b)} in that one. How many altogether?`,
      build(stage) {
        const wrap = U.el('div', 'frames');
        A = tenFrame(t, a); B = tenFrame(t, b);
        wrap.append(A.box, U.el('div', 'plus', '+'), B.box);
        stage.appendChild(wrap);
        countAll = tapToCount(A.gems.concat(B.gems));
      },
      choices: numberChoices(S, 10, 20, k),
      // hint: slide gems over to fill the first frame, so she sees ten and some more
      onHint: () => {
        if (!A) return;
        const stay = B.gems.slice(0, b - fill), moved = B.gems.slice(b - fill);
        moved.forEach((g, i) => A.slots[a + i].appendChild(g));
        // number them in the order they now sit: the full ten first, then the rest
        countAll = tapToCount(A.gems.concat(moved, stay));
        countAll();
      },
      hint: `${W(a)} needs ${W(fill)} more to make ten. Let's move ${W(fill)} over. Now there's ten, and ${W(rest)} more: ${W(S)}! Tap ${W(S)}.`,
      praise: U.pick([`Yes! ${W(a)} and ${W(b)} make ${W(S)}!`, `${W(S)}! Ten and ${W(rest)} more!`])
    };
  }

  // 16: count by tens (sticks of ten), then tens and ones
  function tensQ(c, k) {
    const tens = pickKey('tens:', 2, 9);
    const ones = Math.random() < c ? U.rand(1, 9) : 0;
    const n = tens * 10 + ones;
    const t = U.pick(THINGS);
    let countAll;
    const opts = U.shuffle([n - 10, n + 10, n - 1, n + 1, n + 20].filter(x => x >= 10 && x <= 100 && (ones || x % 10 === 0)));
    const set = new Set([n]); for (const x of opts) if (set.size < k) set.add(x);
    return {
      key: 'tens:' + tens,
      prompt: `Each stick has ten ${t.p}. How many ${t.p}? Count the sticks by tens${ones ? ', then count on the loose ones' : ''}.`,
      build(stage) {
        const row = U.el('div', 'card sticks');
        const parts = [];
        for (let i = 0; i < tens; i++) {
          const st = U.el('button', 'stick emoji', Array(11).join(`<span>${t.e}</span>`));
          row.appendChild(st); parts.push({ el: st, v: 10 });
        }
        if (ones) {
          const o = U.el('div', 'ones');
          for (let i = 0; i < ones; i++) { const g = U.el('button', 'one emoji', t.e); o.appendChild(g); parts.push({ el: g, v: 1 }); }
          row.appendChild(o);
        }
        stage.appendChild(row);
        let total = 0;
        const mark = (p, v) => { p.el.dataset.n = v; p.el.classList.add('counted'); U.tag(p.el, W(v)); };
        parts.forEach(p => {
          p.el.onclick = () => {
            if (p.el.classList.contains('counted')) return;
            // tens first, then ones
            if (p.v === 1 && parts.some(q => q.v === 10 && !q.el.classList.contains('counted'))) { PA.audio.say('Count the sticks first!'); return; }
            total += p.v; mark(p, total);
            PA.audio.sfx('tap'); PA.audio.say(W(total));
          };
        });
        countAll = () => { let s = 0; parts.forEach(p => { s += p.v; mark(p, s); }); total = s; };
      },
      choices: Array.from(set).sort((a, b) => a - b).map(x => ({ html: String(x), cls: 'num', correct: x === n, aria: String(x) })),
      onHint: () => countAll && countAll(),
      hint: `Count by tens: ${Array.from({ length: tens }, (_, i) => W((i + 1) * 10)).join('... ')}${ones ? '. Then the loose ones: ' + U.countAloud(tens * 10 + 1, n) : ''}. ${W(n)}! Tap ${W(n)}.`,
      praise: U.pick([`Yes! ${W(n)}!`, ones ? `${W(n)}! ${W(tens)} tens and ${W(ones)} ones!` : `${W(n)}! That's ${W(tens)} tens!`])
    };
  }

  PA.games.push({
    id: 'count', name: 'Gem Counting', icon: '💎', color: '#e6dcff', maxLevel: 16,
    skill: 'Counting, how-many, comparing, adding and taking away, then teens, counting on and tens',
    research: 'Follows the Building Blocks learning trajectories (Clements & Sarama): tap-to-count (one-to-one), "give me N" (cardinality, Wynn), subitizing, ten-frames, comparing, one more/less, part-whole "hiding" problems, adding and taking away. Past ten: teen numbers as "ten and some more" (place-value groundwork), the counting sequence up to 100 on a number path, pairs that make ten, counting on from a number instead of from one, adding to 20 the make-ten way, and counting by tens.',
    levels: ['Count 1-5', 'Give me 1-5', 'Quick look 1-5', 'Count 1-10 (ten-frame)', 'More or fewer?', 'Give me 1-10',
      'One more, one less', 'Hiding gems (parts of a number)', 'Adding to 10', 'Taking away from 10',
      'Teen numbers (ten and some more)', 'Number path: what\'s missing? (to 100)', 'Make ten', 'Counting on from a number',
      'Adding to 20 (make ten)', 'Counting by tens'],
    tryAtHome: [
      'Count the stairs out loud together as you climb them.',
      'At snack time, ask for exactly 4 crackers and count them together.',
      'Hide some buttons under a cup: "There are 6 altogether, I can see 4. How many are hiding?"',
      'Roll a real die and see how fast she can say the number without counting.',
      'Tell little number stories at dinner: "You have 3 peas and I give you 2 more..."',
      'Count past ten together: on the stairs, in the bath, in the car. The teens are the tricky part.',
      'Put 8 grapes in a cup, then add 3 more: "Start at 8 and count on: 9, 10, 11!"',
      'Bundle straws or crayons into tens with a hair tie, then count them: "10, 20, 30, 31, 32".'
    ],
    intro: lvl => ['Let\'s count the princess\'s treasures!', 'Let\'s decorate the crown!', 'Get ready for quick looks!',
      'Let\'s count bigger treasures!', 'Which chest has more?', 'Let\'s decorate the crown with lots of jewels!',
      'Let\'s do fairy magic with numbers!', 'Some gems are hiding! Let\'s find them.', 'Let\'s put treasures together!',
      'Watch out for the hungry dragon!', 'Big numbers! Ten, and some more.', 'Let\'s walk the number path!',
      'Let\'s fill the frames to make ten!', 'Let\'s count on from the treasure chest!', 'Big adding! Let\'s make ten.',
      'Let\'s count by tens!'][lvl - 1],
    next(api, i, lvl) {
      const c = api.c, k = api.nOpts(3, 5);
      switch (lvl) {
        case 1: return countQ(1, 5 + Math.round(c * 2), 'row', k);
        case 2: return giveQ(1, 5, 8);
        case 3: return quickQ(c, k);
        case 4: return countQ(3, 10, Math.random() < c * 0.6 ? 'row' : 'ten', k);
        case 5: return compareQ(c);
        case 6: return giveQ(4, 10 + Math.round(c * 4), 12 + Math.round(c * 4));
        case 7: return moreLessQ(c, k);
        case 8: return hidingQ(c, k);
        case 9: return addQ(c, k);
        case 10: return takeQ(c, k);
        case 11: return teenQ(c, k);
        case 12: return trackQ(c, k);
        case 13: return makeTenQ(k);
        case 14: return countOnQ(c, k);
        case 15: return add20Q(k);
        default: return tensQ(c, k);
      }
    }
  });
})();
