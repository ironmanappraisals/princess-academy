'use strict';
// MAGIC PATTERNS: finish and build the princess's necklaces. Repeating-pattern skill in preschool predicts later
// maths (Rittle-Johnson et al., 2017). The strongest pattern tasks ask children to make the same pattern with
// different things ("abstracting" the pattern), which shows they've found the rule, not just matched colours.
// Saying the pattern aloud helps find the part that repeats, so prompts read it out.
//   1 AB   2 AAB / ABB   3 ABC   4 AABB, or a gap in the middle
//   5 copy the pattern with new beads (abstraction)   6 growing patterns: 1, 2, 3... what comes next?
window.PA = window.PA || {};
PA.games = PA.games || [];
(function () {
  const U = PA.ui;
  const BEADS = [
    ['❤️', 'red heart'], ['💙', 'blue heart'], ['⭐', 'star'], ['🌸', 'flower'], ['🐚', 'shell'],
    ['🦋', 'butterfly'], ['🍓', 'strawberry'], ['💎', 'gem'], ['🌙', 'moon'], ['💛', 'yellow heart']
  ];
  const UNITS = { 1: ['AB'], 2: ['AAB', 'ABB'], 3: ['ABC'], 4: ['AABB', 'ABC-mid', 'AAB-mid'] };
  const say = seq => seq.map(b => b[1]).join(', ');

  function extendQ(lvl) {
    const type = U.pick(UNITS[lvl]);
    const unit = type.split('-')[0];
    const mid = type.indexOf('-mid') > 0;
    const letters = Array.from(new Set(unit.split('')));
    const chosen = U.shuffle(BEADS).slice(0, letters.length + 1);
    const map = {}; letters.forEach((l, i) => { map[l] = chosen[i]; });
    const spare = chosen[letters.length];
    const reps = unit.length === 4 ? 2 : 3;
    const seq = []; for (let r = 0; r < reps; r++) for (const l of unit) seq.push(map[l]);
    let blank = seq.length - 1;
    if (mid) blank = unit.length + U.rand(0, unit.length - 1);
    const answer = seq[blank];
    const others = Array.from(new Set(letters.map(l => map[l]).concat([spare]))).filter(b => b !== answer);
    const opts = [answer].concat(U.shuffle(others).slice(0, 2));
    const spoken = seq.map((b, i) => i === blank ? 'hmmm' : b[1]);
    let blankEl;
    return {
      key: 'pat:' + type,
      prompt: mid ? `${spoken.join(', ')}. What goes in the empty spot?` : `${spoken.slice(0, -1).join(', ')}... What comes next?`,
      build(stage) {
        const neck = U.el('div', 'card necklace');
        // each bead lights up in turn as the voice reads the necklace (the gap lights on "hmmm")
        seq.forEach((b, i) => {
          const d = U.el('div', i === blank ? 'bead blank' : 'bead emoji', i === blank ? '?' : b[0]);
          if (i === blank) blankEl = d;
          neck.appendChild(d);
        });
        const tagNeck = () => Array.prototype.forEach.call(neck.children, (d, i) => U.tag(d, d === blankEl && !blankEl.classList.contains('filled') ? 'hmmm' : seq[i][1], true));
        tagNeck();
        neck._retag = tagNeck;
        stage.appendChild(neck);
      },
      choices: U.shuffle(opts).map(o => ({ html: `<span class="emoji">${o[0]}</span>`, correct: o === answer, aria: o[1] })),
      flashChoices: false,
      retry: 'Say it with me: ' + spoken.join(', ') + '.',
      hint: `Let's say it together: ${say(seq)}. It's the ${answer[1]}! Tap it.`,
      onHint() { if (blankEl) U.tag(blankEl, answer[1], true); },
      onRight() { if (blankEl) { blankEl.className = 'bead emoji filled'; blankEl.textContent = answer[0]; U.tag(blankEl, answer[1], true); } },
      praise: U.pick(['You found the pattern! ', 'Yes! ', 'Beautiful necklace! ']) + say(seq) + '!'
    };
  }

  // 5: build the same pattern with different beads
  function copyQ() {
    const unit = U.pick(['AB', 'AAB', 'ABB', 'ABC']);
    const letters = Array.from(new Set(unit.split('')));
    const picks = U.shuffle(BEADS);
    const model = {}, mine = [];
    letters.forEach((l, i) => { model[l] = picks[i]; });
    for (let i = 0; i < letters.length; i++) mine.push(picks[letters.length + i]);
    const len = unit.length === 2 ? 6 : unit.length * 2;
    const seqL = []; while (seqL.length < len) seqL.push(unit[seqL.length % unit.length]);
    return {
      key: 'copy:' + unit,
      size: 2,
      run: api => new Promise(resolve => {
        api.stage.style.flexDirection = 'column';
        const top = U.el('div', 'card necklace');
        seqL.forEach(l => top.appendChild(U.tag(U.el('div', 'bead emoji', model[l][0]), model[l][1], true)));
        const mineRow = U.el('div', 'card necklace');
        const slots = seqL.map(() => { const d = U.el('div', 'bead blank', ''); mineRow.appendChild(d); return d; });
        const pal = U.el('div', 'palette');
        api.stage.append(top, mineRow);
        const reset = U.el('button', 'btn white small', '<span class="emoji">🔄</span>');
        api.choices.style.alignItems = 'center';
        api.choices.append(pal, reset);
        let filled = [], misses = 0;
        const mark = () => slots.forEach((s, i) => s.classList.toggle('next', i === filled.length));
        mark();
        const clear = () => { filled = []; slots.forEach(s => { s.className = 'bead blank'; s.textContent = ''; }); mark(); };
        reset.onclick = () => { PA.audio.sfx('tap'); clear(); };
        const check = async () => {
          // same pattern = same letters map to the same bead, different letters to different beads
          const map = {}, used = {};
          let ok = true;
          seqL.forEach((l, i) => {
            const b = filled[i][1];
            if (map[l] === undefined) { if (used[b]) ok = false; map[l] = b; used[b] = true; } else if (map[l] !== b) ok = false;
          });
          if (ok) {
            PA.audio.sfx('right'); api.cheer();
            await api.say(`Same pattern! ${filled.map(b => b[1]).join(', ')}! You made the pattern with new beads!`);
            return resolve(misses === 0);
          }
          misses++; PA.audio.sfx('wrong');
          if (misses < 2) {
            await api.say(`Hmm, look at the princess's necklace again: ${seqL.map(l => model[l][1]).join(', ')}. Make yours the same way, with your beads.`);
            clear();
          } else {
            await api.say('Let\'s do it together.');
            clear();
            for (let i = 0; i < len && api.alive; i++) {
              const b = mine[letters.indexOf(seqL[i])];
              filled.push(b); slots[i].className = 'bead emoji filled'; slots[i].textContent = b[0];
              U.tag(slots[i], b[1], true);
              PA.audio.sfx('step');
              await api.say(b[1]);
            }
            mark();
            resolve(false);
          }
        };
        mine.forEach(b => {
          const btn = U.el('button', 'bead emoji', b[0]);
          btn.setAttribute('aria-label', b[1]);
          btn.onclick = () => {
            if (filled.length >= len) return;
            const s = slots[filled.length];
            filled.push(b); s.className = 'bead emoji filled'; s.textContent = b[0];
            PA.audio.sfx('step'); mark();
            if (filled.length === len) check();
          };
          pal.appendChild(btn);
        });
        api.prompt(`Look at the princess's necklace: ${seqL.map(l => model[l][1]).join(', ')}. Make the same pattern with your new beads!`);
      })
    };
  }

  // 6: growing pattern
  function growQ() {
    const step = Math.random() < 0.7 ? 1 : 2;
    const start = U.rand(1, 2);
    const b = U.pick(BEADS);
    const terms = [start, start + step, start + 2 * step];
    const ans = start + 3 * step;
    const grp = n => { let h = ''; for (let i = 0; i < n; i++) h += b[0]; return `<div class="group emoji">${h}</div>`; };
    const opts = U.shuffle(Array.from(new Set([ans, ans - 1, ans + 1, ans + step]))).slice(0, 3);
    if (opts.indexOf(ans) < 0) opts[0] = ans;
    const W = U.NUM_WORDS;
    return {
      key: 'grow:' + step,
      prompt: `This pattern grows! ${terms.map(n => W[n]).join(', ')}... What comes next?`,
      build(stage) {
        terms.forEach(n => stage.appendChild(U.tag(U.el('div', 'card group-card', grp(n)), W[n], true)));
        stage.appendChild(U.el('div', 'card group-card bead blank', '?'));
      },
      choices: opts.sort((x, y) => x - y).map(n => ({ html: grp(n), cls: 'wide', correct: n === ans, aria: n + ' ' + b[1] })),
      retry: `Count each group: ${terms.map(n => W[n]).join(', ')}.`,
      hint: `It grows by ${W[step]} each time: ${terms.map(n => W[n]).join(', ')}, ${W[ans]}! Tap ${W[ans]}.`,
      praise: `Yes! ${terms.map(n => W[n]).join(', ')}, ${W[ans]}! It grows by ${W[step]}!`
    };
  }

  PA.games.push({
    id: 'pattern', name: 'Magic Patterns', icon: '📿', color: '#ffe9d6', maxLevel: 6,
    skill: 'Repeating and growing patterns (early algebra)',
    research: 'Spotting, extending and re-making patterns with different objects predicts later maths (Rittle-Johnson et al.). Saying the pattern aloud helps children find the part that repeats; growing patterns connect patterns to counting.',
    levels: ['AB patterns', 'AAB / ABB', 'ABC', 'AABB and gaps in the middle', 'Make it with new beads', 'Growing patterns'],
    tryAtHome: [
      'Make a pattern with spoons and forks, then ask her to make the same pattern with socks.',
      'Clap-clap-stomp! Make sound patterns and take turns copying.',
      'Thread pasta or beads into a pattern necklace.'
    ],
    intro: lvl => lvl === 5 ? 'Let\'s make necklaces just like the princess\'s!' : lvl === 6 ? 'Some patterns grow! Let\'s look.' : 'Let\'s make magic necklaces! Find what comes next.',
    next(api, i, lvl) { return lvl <= 4 ? extendQ(lvl) : lvl === 5 ? copyQ() : growQ(); }
  });
})();
