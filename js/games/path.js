'use strict';
// CASTLE PATH: a race to the castle on a straight numbered board, against a friendly unicorn.
// Based on Siegler & Ramani (2008, 2009): a few short sessions of a *linear* number board game, where the child
// says each number as she moves ("five, six"), improved preschoolers' number-line estimates, counting and
// numeral knowledge. Circular boards didn't help, so rows always run left to right like a number chart.
//   1 board 1-10, spinner 1-2, tap each square
//   2 board 1-10, spinner 1-3
//   3 board 1-20, spinner 1-3, star squares ask "what comes next?"
//   4 board 1-20, count on: tap the square you'll land on (counting on instead of counting all)
//   5 board 1-30, real dice 1-6, count on, star squares ask before / after / bigger
window.PA = window.PA || {};
PA.games = PA.games || [];
(function () {
  const U = PA.ui;
  const W = U.NUM_WORDS;

  PA.games.push({
    id: 'path', name: 'Castle Path', icon: '🏰', color: '#fff1c7', maxLevel: 5,
    skill: 'Number order, the number line, counting on',
    research: 'Linear number board games (Siegler & Ramani) build a mental number line: she says each number as she moves along it. Later levels move from counting every square to counting on, and star squares ask what comes before and after.',
    levels: ['Board 1-10, spin 1-2', 'Board 1-10, spin 1-3', 'Board 1-20 with star questions', 'Board 1-20, count on', 'Board 1-30, dice 1-6, count on'],
    tryAtHome: [
      'Play any real board game with numbered squares, and have her say the numbers as she moves.',
      'Make a hopscotch line 1-10 with chalk and say each number as you hop.',
      'Ask "Which is bigger, 6 or 8? What comes after 12?" in the car.'
    ],
    playRound(api) {
      const lvl = api.level;
      const END = lvl <= 2 ? 10 : lvl <= 4 ? 20 : 30;
      const SPIN = lvl === 1 ? [1, 2] : lvl === 5 ? [1, 2, 3, 4, 5, 6] : [1, 2, 3];
      const countOn = lvl >= 4;
      const STARS = lvl >= 3 ? (END === 20 ? [4, 9, 13, 17] : [5, 11, 16, 22, 27]) : [];
      const pos = { me: 0, uni: 0 };
      let steps = 0, good = 0;
      api.hideGuide();

      // ---- board ----
      const wrap = U.el('div', 'board-wrap');
      const board = U.el('div', 'board' + (END === 30 ? ' thirty' : ''));
      const squares = {};
      const startSq = U.el('div', 'sq start-sq', '<span class="n emoji" style="font-size:1.4rem">🚩</span>');
      squares[0] = startSq;
      wrap.append(startSq, board);
      for (let n = 1; n <= END; n++) {
        const s = U.el('button', 'sq' + (n === END ? ' castle' : '') + (STARS.indexOf(n) >= 0 ? ' star' : ''), `<span class="n">${n}</span>`);
        if (n === END) s.insertAdjacentHTML('afterbegin', '<span class="emoji star-ic" style="font-size:1.9rem;opacity:.55">🏰</span>');
        else if (STARS.indexOf(n) >= 0) s.insertAdjacentHTML('afterbegin', '<span class="emoji star-ic">⭐</span>');
        s.dataset.n = n;
        squares[n] = s;
        board.appendChild(s);
      }
      const me = U.el('div', 'tok me', PA.art.princessHead());
      const uni = U.el('div', 'tok uni emoji', '🦄');
      function place() {
        squares[pos.me].appendChild(me);
        squares[pos.uni].appendChild(uni);
        const same = pos.me === pos.uni;
        me.classList.toggle('solo', !same); uni.classList.toggle('solo', !same);
      }
      place();

      const ctl = U.el('div', 'path-ctl');
      const label = U.el('div', 'turn-lbl', '');
      const spinner = U.el('button', 'spinner', '');
      ctl.append(label, spinner);
      api.stage.style.flexDirection = 'column';
      api.stage.style.gap = '2rem';
      api.stage.append(wrap, ctl);

      let expect = null;
      Object.keys(squares).forEach(k => { if (k !== '0') squares[k].onclick = () => { if (expect) expect(Number(k)); }; });

      const face = (v, showNum) => U.pips(v) + (showNum ? `<div class="num-under">${v}</div>` : '');
      async function spin() {
        spinner.classList.remove('spin'); void spinner.offsetWidth; spinner.classList.add('spin');
        PA.audio.sfx('sparkle');
        await U.wait(700);
        const v = U.pick(SPIN);
        spinner.innerHTML = face(v, lvl < 5);
        U.tag(spinner, W[v]); // "You got three!" lights up the spinner
        return v;
      }
      // the spinner glows while it's her turn to tap it
      const waitSpinnerTap = () => new Promise(r => {
        U.go(spinner, true); spinner.removeAttribute('data-say');
        spinner.onclick = () => { spinner.onclick = null; U.go(spinner, false); r(); };
      });
      const progress = () => api.setProgress(Math.max(pos.me, pos.uni) / END);

      function waitSquare(target, wrongMsg) {
        return new Promise(resolve => {
          let wrong = 0;
          const idle = setTimeout(() => { squares[target].classList.add('next'); }, countOn ? 12000 : 7000);
          expect = n => {
            if (!api.alive) return;
            if (n === target) {
              clearTimeout(idle); expect = null;
              squares[target].classList.remove('next');
              resolve(wrong === 0);
            } else {
              wrong++; PA.audio.sfx('wrong');
              if (wrong >= 2 || !countOn) squares[target].classList.add('next');
              api.say(wrongMsg(wrong));
            }
          };
        });
      }

      async function starQuestion() {
        const n = pos.me;
        const kinds = lvl === 3 ? ['after'] : ['after', 'before', 'bigger'];
        const kind = U.pick(kinds);
        let q;
        if (kind === 'bigger') {
          const other = U.pick([n - 3, n - 2, n + 2, n + 4].filter(x => x >= 1 && x <= 30));
          const big = Math.max(n, other);
          q = {
            prompt: `Star square! Which number is bigger: ${W[n]} or ${W[other]}?`,
            choices: U.shuffle([n, other]).map(x => ({ html: String(x), cls: 'num', correct: x === big })),
            hint: `${W[big]} comes later when we count, so ${W[big]} is bigger. Tap ${W[big]}.`,
            praise: `Yes! ${W[big]} is bigger!`
          };
        } else {
          const ans = kind === 'after' ? n + 1 : n - 1;
          const opts = Array.from(new Set([ans, ans + 1, ans - 1, ans + 2].filter(x => x >= 1 && x !== n))).slice(0, 3).sort((a, b) => a - b);
          if (opts.indexOf(ans) < 0) opts[0] = ans;
          q = {
            prompt: `Star square! What number comes ${kind} ${W[n]}?`,
            choices: opts.map(x => ({ html: String(x), cls: 'num', correct: x === ans })),
            hint: kind === 'after' ? `${W[n]}... ${W[ans]}! ${W[ans]} comes after ${W[n]}. Tap ${W[ans]}.` : `${W[ans]}... ${W[n]}! ${W[ans]} comes before ${W[n]}. Tap ${W[ans]}.`,
            praise: `Yes! ${W[ans]} comes ${kind} ${W[n]}!`
          };
        }
        const prev = '';
        const ok = await api.overlayChoice(q);
        api.setPrompt(prev);
        steps++; if (ok) good++;
      }

      return (async function () {
        await api.say(countOn ? 'Race the unicorn to the castle! This time, find the square where you will land.' : 'Race the unicorn to the castle! Say the numbers with me as you move.');
        while (api.alive) {
          // --- her turn ---
          label.textContent = 'Your turn!';
          spinner.innerHTML = '<span class="face">?</span>';
          api.prompt(lvl === 5 ? 'Your turn! Tap the dice.' : 'Your turn! Tap the spinner.');
          await waitSpinnerTap();
          if (!api.alive) return null;
          const v = await spin();
          if (!api.alive) return null;
          const toGo = Math.min(v, END - pos.me);
          const target = pos.me + toGo;
          if (countOn) {
            const from = pos.me;
            api.setPrompt(`You're on ${from ? W[from] : 'the start'}, and you got ${W[v]}. Where will you land? Count on and tap the square.`);
            await api.say(`You got ${W[v]}! You're on ${from ? W[from] : 'the start'}. Count on ${W[v]}. Where will you land?`);
            const first = await waitSquare(target, w => w < 2
              ? `Let's count on from ${from ? W[from] : 'the start'}: ${U.countAloud(from + 1, target)}. Try again!`
              : `Count on: ${U.countAloud(from + 1, target)}. Tap the shiny square, ${W[target]}.`);
            if (!api.alive) return null;
            steps++; if (first) good++;
            for (let k = from + 1; k <= target && api.alive; k++) { pos.me = k; place(); PA.audio.sfx('step'); await api.say(W[k]); }
          } else {
            api.setPrompt(`You got ${W[v]}! Move ${W[v]}. Tap the next square.`);
            await api.say(`You got ${W[v]}! Move ${W[v]}${v > 1 ? ' squares' : ' square'}.`);
            for (let k = 0; k < toGo && api.alive; k++) {
              const first = await waitSquare(pos.me + 1, () => `You're on ${pos.me ? W[pos.me] : 'the start'}. What comes next? Tap the shiny square.`);
              if (!api.alive) return null;
              steps++; if (first) good++;
              pos.me++; place(); PA.audio.sfx('step');
              await api.say(W[pos.me]);
            }
          }
          progress();
          if (pos.me >= END) {
            PA.audio.sfx('fanfare'); api.cheer();
            await api.say('You made it to the castle! Hooray!');
            break;
          }
          if (STARS.indexOf(pos.me) >= 0) { await starQuestion(); if (!api.alive) return null; }
          // --- unicorn's turn ---
          label.textContent = 'Unicorn\'s turn';
          api.setPrompt('');
          spinner.onclick = null;
          await api.say('Unicorn\'s turn!');
          if (!api.alive) return null;
          const u = await spin();
          const uGo = Math.min(u, END - pos.uni);
          await api.say(`Unicorn got ${W[u]}.`);
          for (let k = 0; k < uGo && api.alive; k++) {
            pos.uni++; place(); PA.audio.sfx('step');
            await api.say(W[pos.uni]);
            await U.wait(150);
          }
          progress();
          if (pos.uni >= END) {
            api.cheer();
            await api.say('Unicorn reached the castle first! What a good race. You counted so well!');
            break;
          }
        }
        if (!api.alive) return null;
        return { correct: good, total: Math.max(steps, 1) };
      })();
    }
  });
})();
