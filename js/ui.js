'use strict';
// Shared screen helpers and the round runner every game uses.
// Feedback follows a scaffolding ladder instead of punishment: a wrong tap fades that choice and says "try again";
// a second miss highlights the right answer and explains it, and she taps it herself, so every question ends in
// success. Praise is about effort and strategy ("you counted carefully"), not about being clever.
// Rounds (10 questions by default) mix in review of earlier levels (interleaved, spaced practice), and the last
// question is a "super challenge" from the next level up: a peek at what's coming, with no penalty for missing it.
window.PA = window.PA || {};
(function () {
  const U = PA.ui = {};

  // ---------- fit the whole app to the screen: everything is in rem, so the root font size scales it ----------
  U.fit = function () {
    const W = window.innerWidth, H = window.innerHeight;
    const portrait = H > W;
    const refW = portrait ? 640 : 1024, refH = portrait ? 940 : 730;
    const u = Math.max(0.45, Math.min(1.7, Math.min(W / refW, H / refH)));
    document.documentElement.style.fontSize = (16 * u).toFixed(2) + 'px';
  };
  U.fit();
  window.addEventListener('resize', U.fit);
  window.addEventListener('orientationchange', () => setTimeout(U.fit, 200));

  U.el = function (tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  U.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  U.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  U.wait = ms => new Promise(r => setTimeout(r, ms));
  U.listWords = function (words) {
    if (words.length <= 1) return words.join('');
    return words.slice(0, -1).join('... ') + '... or ' + words[words.length - 1];
  };
  U.NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twenty-one', 'twenty-two',
    'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine', 'thirty'];
  const TENS_W = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'one hundred'];
  U.numWord = n => n <= 20 ? U.NUM_WORDS[n] : n % 10 === 0 ? TENS_W[n / 10] : TENS_W[Math.floor(n / 10)] + '-' + U.NUM_WORDS[n % 10];
  U.countAloud = (from, to) => { const o = []; for (let k = from; k <= to; k++) o.push(U.numWord(k)); return o.join('... '); };

  // ---------- light up what the voice is naming ----------
  // Any element with data-say="red heart" flashes when the voice says "red heart". Elements that also have
  // data-say-one flash one at a time in order (a necklace read aloud lights each bead in turn). Things are only
  // tagged when flashing can't give the answer away (counted gems, the picture being asked about, choices that
  // the question names out loud anyway).
  const norm = w => {
    w = String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (w.length > 3) {
      if (/ies$/.test(w)) w = w.slice(0, -3) + 'y';
      else if (/(ch|sh|x|ss)es$/.test(w)) w = w.slice(0, -2);
      else if (/[^s]s$/.test(w)) w = w.slice(0, -1);
    }
    return w;
  };
  U.normPhrase = p => String(p).split(/[\s-]+/).map(norm).filter(Boolean).join(' ');
  U.tag = function (el, phrase, one) {
    if (!el || phrase == null) return el;
    el.setAttribute('data-say', U.normPhrase(phrase));
    if (one) el.setAttribute('data-say-one', '');
    return el;
  };
  U.flash = function (el) {
    el.classList.remove('say-flash');
    void el.getBoundingClientRect();
    el.classList.add('say-flash');
    clearTimeout(el._sf);
    el._sf = setTimeout(() => el.classList.remove('say-flash'), 800);
  };
  let heard = [], seqCount = {};
  PA.audio.onSpeak = on => {
    document.body.classList.toggle('speaking', on);
    if (on) { heard = []; seqCount = {}; }
  };
  PA.audio.onWord = function (w) {
    heard.push(norm(w)); if (heard.length > 10) heard.shift();
    const root = U.current; if (!root) return;
    const els = root.querySelectorAll('[data-say]');
    if (!els.length) return;
    const seqs = {};
    for (let i = 0; i < els.length; i++) {
      const el = els[i], p = el.getAttribute('data-say');
      if (!p) continue;
      const toks = p.split(' ');
      if (toks.length > heard.length) continue;
      let ok = true;
      for (let j = 0; j < toks.length; j++) if (toks[toks.length - 1 - j] !== heard[heard.length - 1 - j]) { ok = false; break; }
      if (!ok) continue;
      if (el.hasAttribute('data-say-one')) (seqs[p] = seqs[p] || []).push(el); else U.flash(el);
    }
    for (const p in seqs) { const k = seqCount[p] || 0; seqCount[p] = k + 1; U.flash(seqs[p][k % seqs[p].length]); }
  };

  // the button she should press next glows gently
  U.go = (btn, on) => { if (btn) btn.classList.toggle('go', on !== false); return btn; };

  U.show = function (screen) {
    PA.audio.stop();
    if (U.current && U.current.onLeave) U.current.onLeave();
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(screen);
    U.current = screen;
  };

  const name = () => (PA.store.state.profile.name || '').trim();
  const PRAISE = [
    'You listened so carefully!', 'You worked it out!', 'Great thinking!', 'You looked really closely!',
    'You kept trying, and you got it!', 'Super careful work!', 'You figured it out!'
  ];
  U.praise = function () {
    const p = U.pick(PRAISE), n = name();
    return n && Math.random() < 0.3 ? p.replace('!', ', ' + n + '!') : p;
  };
  const RETRY = ['Hmm, not that one. Try again!', 'Almost! Have another look.', 'Oops! Let\'s try again.'];
  U.retry = () => U.pick(RETRY);

  const STICKERS = ['🦄', '🌈', '🌟', '🦋', '🌸', '🍰', '🎀', '👑', '💎', '🐚', '🧁', '🍓', '🐱', '🐰', '🦢', '🍭', '🎠', '🧚', '🌺', '🍩', '🐬', '🦩', '🌙', '🐞', '🐢', '🦊', '🐼', '🌻', '🍦', '🎈'];

  // ---------- the round runner ----------
  U.runGame = function (game) {
    const rec = PA.store.game(game.id);
    const level = Math.min(rec.level, game.maxLevel);
    const screen = U.el('div', 'screen');
    const top = U.el('div', 'topbar');
    const homeBtn = U.el('button', 'icon-btn', '<span class="emoji">🏰</span>');
    homeBtn.setAttribute('aria-label', 'Back to the castle');
    const title = U.el('div', 'game-title', game.name);
    const prog = U.el('div', 'progress', '<i style="width:0%"></i><b class="emoji" style="left:0%">💎</b>');
    const repeat = U.el('button', 'icon-btn say-btn', '<span class="emoji">🔊</span>');
    repeat.setAttribute('aria-label', 'Say it again');
    top.append(homeBtn, title, prog, repeat);
    const play = U.el('div', 'play');
    const stage = U.el('div', 'stage');
    const choices = U.el('div', 'choices');
    const guide = U.el('div', 'guide', PA.art.princess(null, 'happy'));
    // fitbox holds the question; if a question is taller than the screen (e.g. a phone held sideways) it is
    // shrunk to fit, so nothing ever needs scrolling
    const fitbox = U.el('div', 'fitbox');
    fitbox.append(stage, choices);
    play.appendChild(fitbox);
    screen.append(top, play, guide);
    const refit = () => {
      fitbox.style.transform = '';
      const h = fitbox.offsetHeight, w = fitbox.scrollWidth, ph = play.clientHeight, pw = play.clientWidth;
      const s = Math.min(1, ph / Math.max(h, 1), pw / Math.max(w, 1));
      if (s < 0.999) fitbox.style.transform = `scale(${s.toFixed(3)})`;
    };
    if (window.ResizeObserver) { const ro = new ResizeObserver(refit); ro.observe(fitbox); ro.observe(play); }
    else setInterval(refit, 500);

    const started = Date.now();
    let prompt = '';
    const c = PA.store.challenge(game.id);
    const api = {
      game, level, screen, play, stage, choices, alive: true,
      c, // 0..1 from the 2.5%-per-round ramp: games use it for bigger numbers, more choices, shorter peeks
      nOpts: (base, max) => Math.min(max, base + Math.floor(c * (max - base + 0.999))),
      name: name(),
      say: text => api.alive ? PA.audio.say(text) : Promise.resolve(false),
      setPrompt: text => { prompt = text; },
      prompt: text => { prompt = text; return api.say(text); },
      cheer: function () {
        guide.innerHTML = PA.art.princess(null, 'wow');
        guide.classList.remove('cheer'); void guide.offsetWidth; guide.classList.add('cheer');
        setTimeout(() => { if (api.alive) guide.innerHTML = PA.art.princess(null, 'happy'); }, 1100);
      },
      clear: () => {
        stage.innerHTML = ''; choices.innerHTML = '';
        stage.removeAttribute('style'); choices.removeAttribute('style');
        const b = play.querySelector('.banner'); if (b) b.remove();
        const o = play.querySelector('.overlay'); if (o) o.remove();
      },
      banner: text => { play.appendChild(U.el('div', 'banner', text)); },
      setProgress: function (frac) {
        const pct = Math.max(0, Math.min(1, frac)) * 100;
        prog.firstChild.style.width = pct + '%';
        prog.lastChild.style.left = pct + '%';
      },
      askChoice: (q, where) => askChoice(api, q, where),
      overlayChoice: q => {
        const ov = U.el('div', 'overlay');
        const st = U.el('div', 'stage'), ch = U.el('div', 'choices');
        ov.append(st, ch); play.appendChild(ov);
        return askChoice(api, q, { stage: st, choices: ch }).then(r => { ov.remove(); return r; });
      },
      hideGuide: () => { guide.style.display = 'none'; }
    };
    repeat.onclick = () => { PA.audio.sfx('tap'); if (prompt) api.say(prompt); };
    homeBtn.onclick = () => { PA.app.home(); };
    screen.onLeave = () => { api.alive = false; PA.store.tickPlay(Date.now() - started); };
    U.show(screen);

    (async function loop() {
      let correct = 0, total = 0, bonus = false;
      if (game.playRound) {
        const r = await game.playRound(api);
        if (!api.alive || !r) return;
        correct = r.correct; total = r.total; bonus = !!r.bonus;
        api.setProgress(1);
      } else {
        // the ramp also makes rounds longer: up to half as long again at +100%
        const len = Math.round((PA.store.state.settings.roundLen || 10) * (1 + c * 0.5));
        if (game.intro) await api.say(game.intro(level, api));
        let done = 0, qi = 0;
        while (done < len) {
          if (!api.alive) return;
          api.clear();
          guide.style.display = '';
          // pick this question's level: current level, a stretch or review level, or the end-of-round super challenge
          let lvl = level, challenge = false;
          if (len - done <= 1 && level < game.maxLevel && game.challenge !== false && qi > 0) {
            lvl = level + 1; challenge = true;
            api.banner('⭐ Super challenge!');
            await api.say('Super challenge!');
          } else if (level < game.maxLevel && game.challenge !== false && qi > 0 && Math.random() < Math.min(0.5, c)) {
            // ramp: each round played, 2.5% more of the questions come from the next level up (at most half)
            lvl = level + 1;
          } else if (level > 1 && game.review !== false && Math.random() < 0.25) {
            lvl = Math.random() < 0.6 ? level - 1 : U.rand(1, level - 1);
          }
          if (!api.alive) return;
          const q = game.next(api, qi, lvl);
          const first = q.run ? await q.run(api) : await askChoice(api, q);
          if (!api.alive) return;
          if (q.key) PA.store.recordItem(game.id, q.key, first);
          if (lvl === level) { total++; if (first) correct++; }
          if (challenge && first) bonus = true;
          done += q.size || 1; qi++;
          api.setProgress(done / len);
          await U.wait(300);
        }
      }
      if (!api.alive) return;
      const res = PA.store.endRound(game.id, correct, total, game.maxLevel);
      screen.onLeave = null; api.alive = false;
      PA.store.tickPlay(Date.now() - started);
      U.reward(game, res, bonus);
    })();
  };

  function askChoice(api, q, where) {
    const stage = (where && where.stage) || api.stage, box = (where && where.choices) || api.choices;
    if (q.build) q.build(stage, api);
    const btns = q.choices.map(c => {
      const b = U.el('button', 'card choice ' + (c.cls || ''), c.html);
      if (c.aria) b.setAttribute('aria-label', c.aria);
      box.appendChild(b);
      return b;
    });
    // When the question reads every choice out loud ("hat... sun... or dog?"), each one lights up as it's named.
    // Never when only the answer is named, so the flash can't give it away.
    if (q.flashChoices !== false) {
      const spoken = ' ' + U.normPhrase((q.prompt || '').replace(/[^A-Za-z0-9' ]+/g, ' ')) + ' ';
      const named = q.choices.every(c => c.aria && !/^\d/.test(c.aria) && spoken.indexOf(' ' + U.normPhrase(c.aria) + ' ') >= 0);
      if (named && q.choices.length > 1) btns.forEach((b, i) => U.tag(b, q.choices[i].aria));
    }
    api.setPrompt(q.prompt);
    api.say(q.prompt);
    return new Promise(resolve => {
      let misses = 0, locked = false;
      const idle = setTimeout(() => { if (api.alive && !locked) api.say(q.prompt); }, 18000);
      const rightIdx = q.choices.findIndex(c => c.correct);
      btns.forEach((b, i) => {
        b.onclick = async () => {
          if (locked || !api.alive) return;
          clearTimeout(idle);
          if (q.choices[i].correct) {
            locked = true;
            b.classList.remove('hint'); b.classList.add('right');
            PA.audio.sfx('right'); api.cheer();
            if (q.onRight) q.onRight();
            await api.say(q.praise || U.praise());
            resolve(misses === 0);
          } else {
            misses++;
            b.classList.add('wrong');
            PA.audio.sfx('wrong');
            const left = btns.filter((x, j) => j !== rightIdx && !x.classList.contains('wrong')).length;
            if (misses >= 2 || left === 0) {
              btns[rightIdx].classList.add('hint');
              if (q.onHint) q.onHint();
              api.say(q.hint || 'This one! Tap it.');
            } else {
              api.say((q.wrong && q.wrong(q.choices[i])) || (U.retry() + (q.retry ? ' ' + q.retry : '')));
            }
          }
        };
      });
    });
  }

  // ---------- end of round ----------
  U.reward = function (game, res, bonus) {
    const got = [U.pick(STICKERS)];
    if (bonus) got.push(U.pick(STICKERS));
    got.forEach(s => PA.store.addSticker(s));
    const screen = U.el('div', 'screen');
    const c = U.el('div', 'center');
    const n = name();
    const head = res.up ? 'New level unlocked!' : bonus ? 'Super challenge star!' : 'You did it' + (n ? ', ' + n : '') + '!';
    c.innerHTML = `<div class="reward-sticker emoji">${got.join(' ')}</div>
      <div class="big-msg">${head}</div>
      <div class="mid-msg">${got.length > 1 ? 'Two new stickers' : 'A new sticker'} for your book</div>`;
    const row = U.el('div', 'row');
    const again = U.go(U.el('button', 'btn', '<span class="emoji">▶️</span> Again'));
    const home = U.el('button', 'btn purple', '<span class="emoji">🏰</span> Castle');
    row.append(again, home);
    c.appendChild(row);
    if (game.tryAtHome) c.appendChild(U.el('div', 'tip', 'Grown-up idea: ' + U.pick(game.tryAtHome)));
    screen.appendChild(c);
    for (let i = 0; i < 14; i++) {
      const f = U.el('div', 'confetti emoji', U.pick(['✨', '💖', '⭐', '🌸', '💎']));
      f.style.left = Math.random() * 100 + '%'; f.style.animationDelay = (Math.random() * 0.8) + 's';
      screen.appendChild(f);
    }
    U.show(screen);
    PA.audio.sfx('fanfare');
    const timeUp = PA.store.timeUp();
    let msg = res.up ? 'Wow! You unlocked a new level! ' : 'You finished the round! ';
    if (bonus) msg += 'And you beat the super challenge! Two stickers for you!'; else msg += 'Here is a sticker for your book.';
    PA.audio.say(msg).then(() => { if (timeUp && PA.ui.current === screen) U.rest(); });
    again.onclick = () => { PA.audio.sfx('tap'); if (PA.store.timeUp()) U.rest(); else U.runGame(game); };
    home.onclick = () => { PA.audio.sfx('tap'); PA.app.home(); };
  };

  // Gentle stop when the grown-up's daily limit is reached.
  U.rest = function () {
    const screen = U.el('div', 'screen');
    const c = U.el('div', 'center');
    c.innerHTML = `<div style="width:15rem;height:18rem">${PA.art.princess(null, 'sleep')}</div>
      <div class="big-msg">Time to rest!</div>
      <div class="mid-msg">The princess is sleepy. Let's play again later.</div>`;
    const more = U.el('button', 'btn small purple', 'Grown-ups');
    c.appendChild(more);
    screen.appendChild(c);
    U.show(screen);
    PA.audio.say('Great playing today! The princess is sleepy now. Let\'s play again later. Night night!');
    more.onclick = () => PA.app.gate(() => { PA.store.grantMore(10); PA.app.home(); }, () => U.rest());
  };

  // little dice face (pips in a 3x3 grid) for 1-6
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  U.pips = n => '<div class="pips">' + Array.from({ length: 9 }, (_, i) => `<span class="${PIPS[n].indexOf(i) >= 0 ? 'on' : ''}"></span>`).join('') + '</div>';
})();
