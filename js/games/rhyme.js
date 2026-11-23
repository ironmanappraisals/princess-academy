'use strict';
// RHYMES & CLAPS: phonological awareness, the "hearing the sounds in words" skill that comes before phonics.
// Rhyme awareness predicts later reading (Bradley & Bryant, 1983), and children usually manage rhymes and
// syllables (word parts) before single sounds (Anthony & Lonigan's developmental sequence).
//   1 which one rhymes? (2 pictures)       2 which one rhymes? (3 pictures)
//   3 drum the syllables: 1-2 beat words    4 which one does NOT rhyme?
//   5 drum the syllables: up to 4 beats     6 rhyme memory: find the rhyming pairs (6 cards)
//   7 rhyme memory with 8 cards
window.PA = window.PA || {};
PA.games = PA.games || [];
(function () {
  const U = PA.ui;
  const PAIRS = [
    [['🐱', 'cat'], ['🎩', 'hat']], [['🐝', 'bee'], ['🔑', 'key']], [['🎂', 'cake'], ['🐍', 'snake']],
    [['🌙', 'moon'], ['🥄', 'spoon']], [['⭐', 'star'], ['🚗', 'car']], [['🐭', 'mouse'], ['🏠', 'house']],
    [['🐻', 'bear'], ['🍐', 'pear']], [['🐐', 'goat'], ['⛵', 'boat']], [['🦊', 'fox'], ['📦', 'box']],
    [['👑', 'crown'], ['🤡', 'clown']], [['🧦', 'sock'], ['⏰', 'clock']], [['🐶', 'dog'], ['🐸', 'frog']],
    [['🔔', 'bell'], ['🐚', 'shell']], [['🌹', 'rose'], ['👃', 'nose']], [['👔', 'tie'], ['🥧', 'pie']],
    [['🦴', 'bone'], ['📱', 'phone']], [['🪁', 'kite'], ['💡', 'light']], [['🛏️', 'bed'], ['🍞', 'bread']]
  ];
  // word parts, spelled so the voice says them clearly one at a time
  const BEATS = [
    ['☀️', 'sun', ['sun']], ['🐱', 'cat', ['cat']], ['🐸', 'frog', ['frog']], ['👑', 'crown', ['crown']], ['🐝', 'bee', ['bee']], ['⭐', 'star', ['star']],
    ['🍎', 'apple', ['ap', 'pull']], ['🐰', 'rabbit', ['rab', 'bit']], ['🍕', 'pizza', ['peet', 'za']], ['🐵', 'monkey', ['mun', 'key']],
    ['🌈', 'rainbow', ['rain', 'bow']], ['🧁', 'cupcake', ['cup', 'cake']], ['👸', 'princess', ['prin', 'sess']], ['🐼', 'panda', ['pan', 'da']],
    ['🦋', 'butterfly', ['butt', 'er', 'fly']], ['🍌', 'banana', ['ba', 'na', 'na']], ['🦕', 'dinosaur', ['dye', 'no', 'sore']],
    ['🦄', 'unicorn', ['you', 'nee', 'corn']], ['🐙', 'octopus', ['ock', 'toe', 'puss']], ['🍓', 'strawberry', ['straw', 'bear', 'ee']],
    ['🍉', 'watermelon', ['wah', 'ter', 'mel', 'on']], ['🐛', 'caterpillar', ['cat', 'er', 'pill', 'ar']], ['🐊', 'alligator', ['al', 'lee', 'gay', 'tor']]
  ];

  function pickQ(lvl) {
    const idx = PAIRS.map((_, i) => i);
    const pi = PA.store.pick('rhyme', idx, 1, i => 'pair:' + i)[0];
    const flip = Math.random() < 0.5;
    const pair = PAIRS[pi];
    const target = flip ? pair[1] : pair[0], answer = flip ? pair[0] : pair[1];
    const nOpts = lvl + 1;
    const others = U.shuffle(idx.filter(i => i !== pi)).slice(0, nOpts - 1).map(i => U.pick(PAIRS[i]));
    const opts = U.shuffle([answer].concat(others));
    const names = opts.map(o => o[1]);
    return {
      key: 'pair:' + pi,
      prompt: `${target[1]}. Which one rhymes with ${target[1]}? ${U.listWords(names)}?`,
      build(stage) { stage.appendChild(U.tag(U.el('div', 'card prompt-card', `<span class="emoji">${target[0]}</span>`), target[1])); },
      choices: opts.map(o => ({ html: `<span class="emoji">${o[0]}</span>`, correct: o === answer, aria: o[1] })),
      retry: `Listen: ${target[1]}... ${U.listWords(names)}.`,
      hint: `${target[1]}... ${answer[1]}. They sound the same at the end! Tap the ${answer[1]}.`,
      praise: U.pick([`Yes! ${target[1]}, ${answer[1]}! They rhyme!`, `${target[1]} and ${answer[1]}! Great rhyming!`])
    };
  }

  function oddQ(n) {
    const idx = PAIRS.map((_, i) => i);
    const pi = PA.store.pick('rhyme', idx, 1, i => 'odd:' + i)[0];
    const pair = PAIRS[pi];
    const odd = U.pick(PAIRS[U.pick(idx.filter(i => i !== pi))]);
    const opts = U.shuffle(pair.concat([odd]));
    const names = opts.map(o => o[1]);
    return {
      key: 'odd:' + pi,
      prompt: `Which one does NOT rhyme? ${U.listWords(names)}?`,
      choices: opts.map(o => ({ html: `<span class="emoji">${o[0]}</span>`, correct: o === odd, aria: o[1] })),
      retry: `Listen to the ends: ${U.listWords(names)}.`,
      hint: `${pair[0][1]} and ${pair[1][1]} rhyme. ${odd[1]} doesn't! Tap the ${odd[1]}.`,
      praise: `Yes! ${pair[0][1]} and ${pair[1][1]} rhyme, and ${odd[1]} is the odd one out!`
    };
  }

  function beatsQ(maxBeats) {
    const pool = BEATS.filter(b => b[2].length <= maxBeats);
    const item = PA.store.pick('rhyme', pool, 1, b => 'beat:' + b[1])[0];
    const [e, w, parts] = item;
    const n = parts.length;
    return {
      key: 'beat:' + w,
      run: api => new Promise(resolve => {
        api.stage.style.flexDirection = 'column';
        api.stage.appendChild(U.tag(U.el('div', 'card prompt-card', `<span class="emoji">${e}</span>`), w));
        const dots = U.el('div', 'clap-dots');
        api.stage.appendChild(dots);
        const drum = U.el('button', 'card drum emoji', '🥁');
        const reset = U.el('button', 'btn white small', '<span class="emoji">🔄</span>');
        const done = U.el('button', 'btn mint', '<span class="emoji">✅</span> Done');
        api.choices.style.alignItems = 'center';
        api.choices.append(reset, drum, done);
        let taps = 0, misses = 0, busy = false;
        drum.onclick = () => {
          if (busy) return;
          taps++; dots.appendChild(U.el('span'));
          U.go(done, true);
          PA.audio.sfx('drum');
          drum.classList.remove('hit'); void drum.offsetWidth; drum.classList.add('hit');
          setTimeout(() => drum.classList.remove('hit'), 120);
        };
        const clear = () => { taps = 0; dots.innerHTML = ''; U.go(done, false); };
        reset.onclick = () => { if (!busy) { PA.audio.sfx('tap'); clear(); } };
        api.prompt(`${w}! Tap the drum once for each part of the word: ${w}. Then tap done.`);
        done.onclick = async () => {
          if (busy) return;
          if (taps === n) {
            busy = true; U.go(done, false); PA.audio.sfx('right'); api.cheer();
            await api.say(`Yes! ${w} has ${U.NUM_WORDS[n]} ${n === 1 ? 'part' : 'parts'}!`);
            return resolve(misses === 0);
          }
          misses++; PA.audio.sfx('wrong');
          busy = true; clear();
          if (misses < 2) {
            await api.say(`Let's listen again: ${w}. Tap once for each part.`);
            busy = false;
          } else {
            await api.say(`Let's drum it together.`);
            for (const p of parts) {
              if (!api.alive) return;
              dots.appendChild(U.el('span')); PA.audio.sfx('drum');
              drum.classList.add('hit');
              await api.say(p);
              drum.classList.remove('hit');
              await U.wait(150);
            }
            await api.say(`${w} has ${U.NUM_WORDS[n]} ${n === 1 ? 'part' : 'parts'}!`);
            resolve(false);
          }
        };
      })
    };
  }

  function memoryQ(pairsN) {
    return {
      key: 'memory:' + pairsN,
      size: pairsN === 3 ? 3 : 4,
      run: api => new Promise(resolve => {
        const chosen = U.shuffle(PAIRS.map((_, i) => i)).slice(0, pairsN);
        const cards = U.shuffle([].concat.apply([], chosen.map(pi => [[PAIRS[pi][0], pi], [PAIRS[pi][1], pi]])));
        const grid = U.el('div', 'memory');
        grid.style.setProperty('--cols', pairsN === 3 ? 3 : 4);
        grid.style.setProperty('--pcols', pairsN === 3 ? 3 : 4);
        api.stage.appendChild(grid);
        let open = [], found = 0, misses = 0, busy = false;
        cards.forEach(([item, pi]) => {
          const c = U.el('button', 'mcard', '<span class="back emoji">👑</span>');
          c.onclick = async () => {
            if (busy || !api.alive || c.classList.contains('up')) return;
            c.classList.add('up'); c.innerHTML = `<span class="emoji">${item[0]}</span>`;
            PA.audio.sfx('tap');
            open.push([c, item, pi]);
            if (open.length < 2) { api.say(item[1]); return; }
            busy = true;
            const [a, b] = open; open = [];
            if (a[2] === b[2]) {
              a[0].classList.add('matched'); b[0].classList.add('matched');
              PA.audio.sfx('right'); found++;
              await api.say(`${a[1][1]}, ${b[1][1]}. They rhyme!`);
              busy = false;
              if (found === pairsN) {
                api.cheer(); PA.audio.sfx('sparkle');
                await api.say('You found all the rhyming pairs!');
                resolve(misses <= pairsN + 1);
              }
            } else {
              misses++;
              await api.say(`${a[1][1]}... ${b[1][1]}. Those don't rhyme.`);
              await U.wait(400);
              [a[0], b[0]].forEach(x => { x.classList.remove('up'); x.innerHTML = '<span class="back emoji">👑</span>'; });
              busy = false;
            }
          };
          grid.appendChild(c);
        });
        api.prompt('Find the rhyming pairs! Tap two cards. If they rhyme, they stay up.');
      })
    };
  }

  PA.games.push({
    id: 'rhyme', name: 'Rhyme Time', icon: '🎵', color: '#d6f3ff', maxLevel: 7,
    skill: 'Hearing rhymes and word parts (syllables)',
    research: 'Rhyme and syllable awareness are the early steps of phonological awareness, which predicts later reading (Bradley & Bryant; Anthony & Lonigan). Drumming each word part makes it physical, and the memory game adds working memory.',
    levels: ['Rhymes: pick from 2', 'Rhymes: pick from 3', 'Drum the parts (1-2)', 'Which does NOT rhyme?', 'Drum the parts (1-4)', 'Rhyme memory (6 cards)', 'Rhyme memory (8 cards)'],
    tryAtHome: [
      'Read rhyming books and pause before the rhyming word so she can fill it in.',
      'Make up silly rhymes in the car: cat, hat, bat... zat!',
      'Clap the parts of family names together: Ma-ry, Grand-ma, Pen-el-o-pe.'
    ],
    intro: lvl => ({ 3: 'Let\'s drum the parts of words!', 5: 'Let\'s drum some long words!', 6: 'Let\'s play rhyme memory!', 7: 'Let\'s play a bigger rhyme memory!' }[lvl]
      || 'Let\'s find words that rhyme! Rhyming words sound the same at the end.'),
    next(api, i, lvl) {
      switch (lvl) {
        case 1: return pickQ(1);
        case 2: return pickQ(2);
        case 3: return beatsQ(2);
        case 4: return oddQ(3);
        case 5: return beatsQ(4);
        case 6: return memoryQ(3);
        default: return memoryQ(4);
      }
    }
  });
})();
