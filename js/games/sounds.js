'use strict';
// LETTERS: from hearing sounds to reading and spelling little words. Phonemic awareness and letter-sound
// knowledge are the strongest early predictors of reading (National Early Literacy Panel, 2008), and systematic
// phonics (letters taught a few at a time, then blended into words) is the best-supported way to teach reading
// (National Reading Panel, 2000). Spelling words with letter tiles strengthens reading too (Ehri).
//   1 same first sound (listening only): "Which starts like SUN?"
//   2 letter -> picture: "This is S, like in sun. Which picture starts with S?"
//   3 picture -> letter: "Dog. Which letter does dog start with?"
//   4 big and little letters: "Find little d", with look-alikes (b d p, m n) as the tricky choices
//   5 which word says "cat"? (match a spoken word to print)
//   6 spell it: put the letters of "cat" in order
//   7 read it yourself: the word is shown but not spoken; tap the picture it names
// Letters arrive a few at a time in a systematic-phonics order (s a t p first). Words starting with blends
// (st, tr, cr...) are left out of the first-sound levels because their first sound is much harder to hear.
window.PA = window.PA || {};
PA.games = PA.games || [];
(function () {
  const U = PA.ui;
  const L = {
    s: [['☀️', 'sun'], ['🧦', 'sock'], ['🦭', 'seal'], ['🥪', 'sandwich']],
    a: [['🍎', 'apple'], ['🐜', 'ant'], ['🚑', 'ambulance']],
    t: [['🐯', 'tiger'], ['⛺', 'tent'], ['🐢', 'turtle'], ['🦷', 'tooth'], ['🌮', 'taco']],
    p: [['🐷', 'pig'], ['🍕', 'pizza'], ['🐧', 'penguin'], ['🎃', 'pumpkin'], ['🐼', 'panda']],
    n: [['👃', 'nose'], ['📿', 'necklace'], ['🥅', 'net']],
    m: [['🌙', 'moon'], ['🐭', 'mouse'], ['🐵', 'monkey'], ['🥛', 'milk'], ['🍄', 'mushroom'], ['🧜‍♀️', 'mermaid']],
    d: [['🐶', 'dog'], ['🦆', 'duck'], ['🍩', 'doughnut'], ['🐬', 'dolphin'], ['🦌', 'deer']],
    g: [['🐐', 'goat'], ['🎁', 'gift'], ['🎸', 'guitar'], ['👻', 'ghost'], ['🦍', 'gorilla']],
    o: [['🐙', 'octopus'], ['🦦', 'otter'], ['🐂', 'ox']],
    c: [['🐱', 'cat'], ['🎂', 'cake'], ['🚗', 'car'], ['🐮', 'cow'], ['🥕', 'carrot'], ['🍪', 'cookie'], ['🏰', 'castle']],
    e: [['🥚', 'egg'], ['🐘', 'elephant'], ['🧝', 'elf']],
    u: [['☂️', 'umbrella'], ['⬆️', 'up']],
    r: [['🐰', 'rabbit'], ['🌈', 'rainbow'], ['💍', 'ring'], ['🤖', 'robot'], ['🌹', 'rose'], ['🚀', 'rocket']],
    h: [['🐴', 'horse'], ['🎩', 'hat'], ['❤️', 'heart'], ['🏠', 'house'], ['🦛', 'hippo'], ['🍔', 'hamburger']],
    b: [['🐝', 'bee'], ['🍌', 'banana'], ['🐻', 'bear'], ['🦋', 'butterfly'], ['🚌', 'bus'], ['🔔', 'bell']],
    f: [['🐟', 'fish'], ['🦊', 'fox'], ['🔥', 'fire'], ['🦶', 'foot'], ['🧚', 'fairy']],
    l: [['🦁', 'lion'], ['🍋', 'lemon'], ['🍃', 'leaf'], ['🍭', 'lollipop'], ['🐞', 'ladybug']],
    w: [['🐳', 'whale'], ['🍉', 'watermelon'], ['🐺', 'wolf'], ['🕸️', 'web']],
    v: [['🎻', 'violin'], ['🌋', 'volcano'], ['🚐', 'van']],
    y: [['🪀', 'yo-yo'], ['🧶', 'yarn']]
  };
  const ORDER = ['s', 'a', 't', 'p', 'n', 'm', 'd', 'g', 'o', 'c', 'e', 'u', 'r', 'h', 'b', 'f', 'l', 'w', 'v', 'y'];
  const START = 4;
  // look-alike letters for the big/little level
  const LOOKALIKE = { b: ['d', 'p'], d: ['b', 'p'], p: ['b', 'd'], m: ['n', 'w'], n: ['m', 'h'], w: ['m', 'v'], h: ['n', 'b'], u: ['n', 'v'], v: ['w', 'y'], a: ['o', 'e'], o: ['a', 'c'], e: ['c', 'a'], c: ['o', 'e'], f: ['t', 'l'], t: ['f', 'l'], l: ['t', 'f'], g: ['p', 'y'], y: ['g', 'v'], r: ['n', 'h'], s: ['c', 'e'] };
  // little words (consonant-vowel-consonant) with pictures
  const WORDS = [['🐱', 'cat'], ['🎩', 'hat'], ['🦇', 'bat'], ['🐀', 'rat'], ['🗺️', 'map'], ['🧢', 'cap'], ['🚐', 'van'],
    ['👜', 'bag'], ['🍳', 'pan'], ['🐶', 'dog'], ['🪵', 'log'], ['🐔', 'hen'], ['🛏️', 'bed'], ['🕸️', 'web'], ['🖊️', 'pen'],
    ['🥅', 'net'], ['🔟', 'ten'], ['🚌', 'bus'], ['☀️', 'sun'], ['🥤', 'cup'], ['🐛', 'bug'], ['🐷', 'pig']];
  PA.sounds = { ORDER, L };

  function unlocked() {
    const g = PA.store.game('sounds');
    let n = g.extra.unlocked || START;
    const solid = ORDER.slice(0, n).every(ch => {
      const r = g.items['ltr:' + ch]; return r && r[0] >= 3 && PA.store.itemScore('sounds', 'ltr:' + ch) >= 0.75;
    });
    if (solid && n < ORDER.length) { n++; g.extra.unlocked = n; g.extra.newest = ORDER[n - 1]; PA.store.save(); }
    return n;
  }
  PA.sounds.unlocked = () => PA.store.game('sounds').extra.unlocked || START;

  function distractorLetters(target, n, pool) {
    const others = U.shuffle(pool.filter(x => x !== target));
    const extra = U.shuffle(ORDER.filter(x => x !== target && pool.indexOf(x) < 0));
    return others.concat(extra).slice(0, n);
  }
  const pic = ([e, w]) => ({ html: `<span class="emoji">${e}</span>`, aria: w });
  const spell = w => w.split('').join(', ');
  // words that differ from w in one place make the best "tricky" choices
  function nearWords(w, n) {
    const score = x => x[1].split('').filter((c, i) => c === w[i]).length;
    const others = U.shuffle(WORDS.filter(x => x[1] !== w)).sort((a, b) => score(b) - score(a));
    return others.slice(0, n);
  }

  function letterLevel(api, i, lvl) {
    const n = unlocked();
    const pool = ORDER.slice(0, n);
    const g = PA.store.game('sounds');
    const ch = (g.extra.newest && pool.indexOf(g.extra.newest) >= 0 && i % 3 === 0) ? g.extra.newest
      : PA.store.pick('sounds', pool, 1, x => 'ltr:' + x)[0];
    const key = 'ltr:' + ch, up = ch.toUpperCase();
    const words = U.shuffle(L[ch]);

    if (lvl === 4) {
      const look = (LOOKALIKE[ch] || []).slice();
      const opts = U.shuffle([ch].concat(look.concat(distractorLetters(ch, 2, pool)).filter((x, k, a) => x !== ch && a.indexOf(x) === k).slice(0, 2)));
      return {
        key: 'case:' + ch,
        prompt: `This is big ${up}. Find little ${ch}.`,
        build(stage) { stage.appendChild(U.tag(U.el('div', 'card prompt-card letter', up), ch)); },
        choices: opts.map(x => ({ html: x, cls: 'letter', correct: x === ch, aria: 'letter ' + x })),
        retry: `Big ${up}. Find little ${ch}, like in ${words[0][1]}.`,
        hint: `This is little ${ch}. Big ${up}, little ${ch}. Tap it.`,
        praise: U.pick([`Yes! Big ${up} and little ${ch}!`, `You found little ${ch}!`])
      };
    }
    if (lvl === 3) {
      const target = words[0];
      const opts = U.shuffle([ch].concat(distractorLetters(ch, 2, pool)));
      return {
        key,
        prompt: `${target[1]}. Which letter does ${target[1]} start with?`,
        build(stage) { stage.appendChild(U.tag(U.el('div', 'card prompt-card', `<span class="emoji">${target[0]}</span>`), target[1])); },
        choices: opts.map(x => ({ html: x, cls: 'letter', correct: x === ch, aria: 'letter ' + x })),
        retry: `Listen: ${target[1]}.`,
        hint: `${target[1]} starts with ${up}. Tap ${up}.`,
        praise: U.pick([`Yes! ${target[1]} starts with ${up}!`, `You heard it! ${up} for ${target[1]}!`])
      };
    }
    const keyWord = words[0], answer = words[1] || words[0];
    const others = distractorLetters(ch, 2, pool).map(x => U.pick(L[x]));
    const opts = U.shuffle([answer].concat(others));
    const names = opts.map(o => o[1]);
    if (lvl === 1) {
      return {
        key,
        prompt: `${keyWord[1]}. Which one starts with the same sound as ${keyWord[1]}? ${U.listWords(names)}?`,
        build(stage) { stage.appendChild(U.tag(U.el('div', 'card prompt-card', `<span class="emoji">${keyWord[0]}</span>`), keyWord[1])); },
        choices: opts.map(o => Object.assign(pic(o), { correct: o === answer })),
        retry: `Listen: ${keyWord[1]}... ${U.listWords(names)}.`,
        hint: `${keyWord[1]}... ${answer[1]}. They start the same way! Tap the ${answer[1]}.`,
        praise: U.pick([`Yes! ${keyWord[1]} and ${answer[1]} start the same!`, `You heard it! ${keyWord[1]}, ${answer[1]}!`])
      };
    }
    return {
      key,
      prompt: `This is the letter ${up}, like in ${keyWord[1]}. Which picture starts with ${up}? ${U.listWords(names)}?`,
      build(stage) {
        stage.appendChild(U.tag(U.el('div', 'card prompt-card letter', `${up}${ch}`), ch));
        stage.appendChild(U.tag(U.el('div', 'card prompt-card', `<span class="emoji" style="font-size:4.4rem">${keyWord[0]}</span><span class="lbl">${keyWord[1]}</span>`), keyWord[1]));
      },
      choices: opts.map(o => Object.assign(pic(o), { correct: o === answer })),
      retry: `${up}, like in ${keyWord[1]}. ${U.listWords(names)}.`,
      hint: `${answer[1]} starts with ${up}, just like ${keyWord[1]}. Tap the ${answer[1]}.`,
      praise: U.pick([`Yes! ${answer[1]} starts with ${up}!`, `${up} for ${answer[1]}! Great listening!`])
    };
  }

  function wordLevel(api, i, lvl) {
    const item = PA.store.pick('sounds', WORDS, 1, x => 'word:' + x[1])[0];
    const [e, w] = item;
    const key = 'word:' + w;
    if (lvl === 5) {
      const opts = U.shuffle([item].concat(nearWords(w, 2)));
      return {
        key,
        prompt: `Which word says ${w}?`,
        build(stage) { stage.appendChild(U.tag(U.el('div', 'card prompt-card', `<span class="emoji">${e}</span>`), w)); },
        choices: opts.map(o => ({ html: o[1], cls: 'word', correct: o === item, aria: o[1] })),
        retry: `Look at the first letter. ${w}.`,
        hint: `${spell(w)}. That spells ${w}! Tap it.`,
        praise: U.pick([`Yes! ${spell(w)}, ${w}!`, `You read it! ${w}!`])
      };
    }
    if (lvl === 7) {
      const opts = U.shuffle([item].concat(nearWords(w, 2)));
      return {
        key: 'read:' + w,
        prompt: 'Read the word. Which picture is it?',
        build(stage) { stage.appendChild(U.tag(U.el('div', 'card prompt-card word', w), w)); },
        choices: opts.map(o => ({ html: `<span class="emoji">${o[0]}</span>`, correct: o === item, aria: o[1] })),
        retry: `Say each letter's sound, then push them together.`,
        hint: `${spell(w)}... ${w}! Tap the ${w}.`,
        praise: U.pick([`Yes! That says ${w}! You read it all by yourself!`, `${w}! Wonderful reading!`])
      };
    }
    // level 6: spell it
    return {
      key: 'spell:' + w,
      run: api => new Promise(resolve => {
        const letters = w.split('');
        const extra = U.shuffle(ORDER.filter(x => letters.indexOf(x) < 0)).slice(0, 2);
        const tiles = U.shuffle(letters.concat(extra));
        api.stage.style.flexDirection = 'column';
        const top = U.el('div', 'row');
        top.appendChild(U.tag(U.el('div', 'card prompt-card', `<span class="emoji" style="font-size:5rem">${e}</span>`), w));
        const slots = U.el('div', 'slots');
        const slotEls = letters.map(() => { const s = U.el('div', 'slot'); slots.appendChild(s); return s; });
        top.appendChild(slots);
        const row = U.el('div', 'tiles-row');
        api.stage.append(top, row);
        let at = 0, misses = 0;
        const prompt = `Spell ${w}. Tap the letters in order: ${w}.`;
        api.prompt(prompt);
        const tileEls = tiles.map(ch => {
          const b = U.el('button', 'card choice ltile', ch);
          b.onclick = async () => {
            if (!api.alive || at >= letters.length || b.classList.contains('used')) return;
            if (ch === letters[at]) {
              b.classList.add('used'); slotEls[at].textContent = ch; slotEls[at].classList.add('filled');
              slotEls.forEach(s => s.classList.remove('next'));
              PA.audio.sfx('step'); at++;
              if (at === letters.length) {
                PA.audio.sfx('right'); api.cheer();
                await api.say(U.pick([`${spell(w)}. ${w}! You spelled it!`, `Yes! ${spell(w)} spells ${w}!`]));
                resolve(misses === 0);
              } else api.say(ch);
            } else {
              misses++; PA.audio.sfx('wrong');
              b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong');
              setTimeout(() => b.classList.remove('wrong'), 600);
              if (misses >= 2) {
                slotEls[at].classList.add('next');
                tileEls.forEach(t => { if (!t.classList.contains('used') && t.textContent === letters[at]) t.classList.add('hint'); });
                api.say(`${w}. The next letter is ${letters[at]}. Tap ${letters[at]}.`);
              } else api.say(`Listen: ${w}. ${at === 0 ? 'What sound comes first?' : 'What comes next?'}`);
            }
          };
          row.appendChild(b);
          return b;
        });
      })
    };
  }

  PA.games.push({
    id: 'sounds', name: 'Letters', icon: '🔤', color: '#ffd6ea', maxLevel: 7,
    skill: 'First sounds, letters, then reading and spelling little words',
    research: 'Phonemic awareness and letter-sound knowledge are the strongest early predictors of reading (National Early Literacy Panel). Letters come in a systematic-phonics order a few at a time, then blend into little words to read and spell (National Reading Panel; Ehri).',
    levels: ['Same first sound (listening)', 'Letter to picture', 'Picture to letter', 'Big and little letters', 'Which word says it?', 'Spell the word', 'Read it yourself'],
    tryAtHome: [
      'Play "I spy something that starts with sss..." around the house, saying the sound, not the letter name.',
      'Point out the first letter of her name on signs and boxes.',
      'Say the sound a letter makes (s says "sss"), not just its name, when you read together.',
      'Write a little word like "cat" on paper and help her say each sound, then push them together.'
    ],
    intro: lvl => ['Let\'s listen for first sounds!', 'Let\'s play with letters!', 'Let\'s find the letters!', 'Let\'s match big and little letters!',
      'Let\'s find words!', 'Let\'s spell words!', 'Let\'s read words all by ourselves!'][lvl - 1],
    next(api, i, lvl) { return lvl <= 4 ? letterLevel(api, i, lvl) : wordLevel(api, i, lvl); }
  });
})();
