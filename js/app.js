'use strict';
// Screens outside the games: start, castle (home), princess maker, sticker book, grown-up gate and grown-up area.
window.PA = window.PA || {};
(function () {
  const U = PA.ui, S = PA.store, A = PA.audio;
  const app = PA.app = {};
  const st = S.state;
  const applySettings = () => { A.rate = st.settings.rate; A.sfxOn = st.settings.sfx; A.setVoice(st.settings.voice); };
  applySettings();

  // ---------- start ----------
  app.start = function () {
    const s = U.el('div', 'screen start');
    s.innerHTML = `<h1>Princess Academy</h1><div class="sub">Learning games for little princesses</div>
      <div class="princess-big">${PA.art.princess(null, 'happy')}</div>`;
    const go = U.go(U.el('button', 'btn', '<span class="emoji">▶️</span> Play'));
    s.appendChild(go);
    go.onclick = () => {
      A.unlock(); A.sfx('sparkle');
      if (!st.profile.made) app.maker(true); else app.home(true);
    };
    U.show(s);
  };

  // ---------- castle ----------
  app.home = function (greet) {
    if (S.timeUp()) return U.rest();
    const s = U.el('div', 'screen');
    const top = U.el('div', 'home-top');
    top.innerHTML = '<div class="title"><span class="emoji">👑</span> Princess Academy</div>';
    const book = U.el('button', 'icon-btn', '<span class="emoji">📖</span>'); book.setAttribute('aria-label', 'Sticker book');
    const dress = U.el('button', 'icon-btn', '<span class="emoji">👗</span>'); dress.setAttribute('aria-label', 'Change my princess');
    const grown = U.el('button', 'icon-btn ghost', '<span class="emoji">⚙️</span>'); grown.setAttribute('aria-label', 'Grown-ups');
    top.append(book, dress, grown);
    const body = U.el('div', 'home-body');
    const n = (st.profile.name || '').trim();
    const pr = U.el('div', 'home-princess', `<div class="hello">Hi${n ? ' ' + n : ''}!</div>${PA.art.princess(null, 'happy')}`);
    const tiles = U.el('div', 'tiles');
    PA.games.forEach(g => {
      const rec = S.game(g.id);
      const t = U.el('button', 'tile');
      t.innerHTML = `<div class="ico emoji" style="background:${g.color}">${g.icon}</div><div class="name">${g.name}</div>
        <div class="lvl"><i style="width:${Math.round(100 * Math.min(rec.level, g.maxLevel) / g.maxLevel)}%"></i></div>`;
      t.setAttribute('aria-label', g.name);
      t.onclick = () => { A.sfx('tap'); if (S.timeUp()) U.rest(); else U.runGame(g); };
      tiles.appendChild(t);
    });
    body.append(pr, tiles);
    s.append(top, body);
    U.show(s);
    book.onclick = () => { A.sfx('tap'); app.stickers(); };
    dress.onclick = () => { A.sfx('tap'); app.maker(false); };
    grown.onclick = () => { A.sfx('tap'); app.gate(app.parent, app.home); };
    pr.onclick = () => A.say(`Hi${n ? ' ' + n : ''}! Pick a game to play.`);
    if (greet) A.say(`Hi${n ? ' ' + n : ''}! Welcome to the castle. Pick a game to play!`);
  };

  // ---------- princess maker ----------
  app.maker = function (first) {
    const p = st.profile;
    const s = U.el('div', 'screen');
    const top = U.el('div', 'topbar');
    const back = U.el('button', 'icon-btn', '<span class="emoji">🏰</span>');
    const done = U.go(U.el('button', 'btn mint small', '<span class="emoji">✅</span> Done'));
    top.append(back, U.el('div', 'game-title', 'Make your princess'), U.el('div', 'spacer'), done);
    const wrap = U.el('div', 'maker');
    const preview = U.el('div', '', PA.art.princess(p, 'happy'));
    const opts = U.el('div', 'opts');
    const rows = [['👗', 'dress', PA.art.DRESS, 'Pick a dress color!'], ['💇‍♀️', 'hair', PA.art.HAIR, 'Pick a hair color!'], ['✋', 'skin', PA.art.SKIN, 'Pick a skin color!']];
    rows.forEach(([icon, key, colors, line]) => {
      const r = U.el('div', 'opt-row', `<div class="lab emoji">${icon}</div>`);
      U.tag(r.querySelector('.lab'), key);
      colors.forEach((c, i) => {
        const sw = U.el('button', 'swatch' + (p[key] === i ? ' on' : ''));
        sw.style.background = c;
        sw.onclick = () => {
          p[key] = i; S.save(); A.sfx('tap');
          r.querySelectorAll('.swatch').forEach(x => x.classList.remove('on')); sw.classList.add('on');
          preview.innerHTML = PA.art.princess(p, 'wow');
          if (Math.random() < 0.35) A.say(U.pick(['Pretty!', 'Beautiful!', 'Ooh, lovely!']));
        };
        r.appendChild(sw);
      });
      r.querySelector('.lab').onclick = () => A.say(line);
      opts.appendChild(r);
    });
    wrap.append(preview, opts);
    s.append(top, wrap);
    U.show(s);
    const finish = () => { p.made = true; S.save(); A.sfx('sparkle'); app.home(true); };
    done.onclick = finish;
    back.onclick = finish;
    A.say(first ? 'Hello! Let\'s make your princess. Pick her dress, her hair, and her skin color. Then tap the green button.'
      : 'Change your princess! Tap the colors.');
  };

  // ---------- sticker book ----------
  app.stickers = function () {
    const s = U.el('div', 'screen scroll');
    const top = U.el('div', 'topbar');
    const back = U.el('button', 'icon-btn', '<span class="emoji">🏰</span>');
    top.append(back, U.el('div', 'game-title', 'My sticker book'));
    const grid = U.el('div', 'sticker-book');
    const list = st.stickers.slice().reverse();
    const slots = Math.max(12, Math.ceil((list.length + 1) / 6) * 6);
    for (let i = 0; i < slots; i++) grid.appendChild(U.el('div', 'st emoji' + (i < list.length ? '' : ' empty'), list[i] || ''));
    s.append(top, grid);
    U.show(s);
    back.onclick = () => app.home();
    const k = list.length;
    A.say(k ? `You have ${k} sticker${k === 1 ? '' : 's'}! Play a game to earn more.` : 'Play a game to earn your first sticker!');
  };

  // ---------- grown-up gate (a number written in words: easy for adults, not for pre-readers) ----------
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  app.gate = function (onPass, onCancel) {
    const tens = U.rand(2, 9), ones = U.rand(1, 9), target = String(tens * 10 + ones);
    const s = U.el('div', 'screen');
    const g = U.el('div', 'gate');
    g.innerHTML = `<div class="mid-msg">Grown-ups only</div><div class="q">Type the number<br>${TENS[tens]}-${U.NUM_WORDS[ones]}</div>`;
    const entry = U.el('div', 'entry', '&nbsp;');
    const pad = U.el('div', 'keypad');
    let typed = '';
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '✕', '0', '⌫'];
    keys.forEach(k => {
      const b = U.el('button', '', k);
      b.onclick = () => {
        if (k === '✕') return (onCancel || app.home)();
        if (k === '⌫') typed = typed.slice(0, -1); else if (typed.length < 2) typed += k;
        entry.textContent = typed || ' ';
        if (typed.length === 2) {
          if (typed === target) onPass(); else setTimeout(() => app.gate(onPass, onCancel), 400);
        }
      };
      pad.appendChild(b);
    });
    g.append(entry, pad);
    s.appendChild(g);
    U.show(s);
  };

  // ---------- grown-up area ----------
  app.parent = function () {
    const s = U.el('div', 'screen scroll');
    const p = U.el('div', 'parent');
    const top = U.el('div', 'topbar');
    const back = U.el('button', 'icon-btn', '<span class="emoji">🏰</span>');
    top.append(back, U.el('div', 'game-title', 'Grown-ups'));
    p.appendChild(top);

    // settings
    const set = U.el('div', 'panel');
    set.innerHTML = `<h3>Settings</h3>
      <label>Child's name (said out loud) <input type="text" id="pName" maxlength="20" autocomplete="off" autocorrect="off" spellcheck="false"></label>
      <label>Play time per day <select id="pLimit"><option value="0">No limit</option><option value="10">10 minutes</option><option value="15">15 minutes</option><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option></select></label>
      <label>Questions per round <select id="pLen"><option value="5">5 (short)</option><option value="10">10</option><option value="15">15 (long)</option></select></label>
      <label>Voice <span><select id="pVoice"></select> <button type="button" class="chip" id="pTest">▶ Test</button></span></label>
      <div class="muted" id="pVoiceTip"></div>
      <label>Voice speed <select id="pRate"><option value="0.8">Slow</option><option value="0.9">Normal</option><option value="1">Faster</option></select></label>
      <label>Sound effects <select id="pSfx"><option value="1">On</option><option value="0">Off</option></select></label>
      <div class="muted" id="pToday"></div>`;
    p.appendChild(set);
    const $ = id => set.querySelector('#' + id);
    $('pName').value = st.profile.name || '';
    $('pLimit').value = String(st.settings.limitMin);
    $('pRate').value = String(st.settings.rate);
    $('pLen').value = String(st.settings.roundLen || 10);
    $('pLen').onchange = e => { st.settings.roundLen = Number(e.target.value); S.save(); };
    $('pSfx').value = st.settings.sfx ? '1' : '0';
    $('pName').oninput = e => { st.profile.name = e.target.value.slice(0, 20); S.save(); };
    $('pLimit').onchange = e => { st.settings.limitMin = Number(e.target.value); S.save(); };
    $('pRate').onchange = e => { st.settings.rate = Number(e.target.value); S.save(); applySettings(); A.say('This is how fast I will talk.'); };
    // voices: best-sounding first; Enhanced / Premium / Natural voices are much smoother than the built-in compact ones
    const fillVoices = () => {
      const sel = $('pVoice'), list = A.voices(), cur = A.currentVoice();
      const nice = v => /premium|enhanced|natural|neural|online/i.test(v.name + ' ' + v.voiceURI);
      sel.innerHTML = '<option value="">Automatic' + (cur ? ' (' + cur.name.replace(/ *\(.*\)/, '') + ')' : '') + '</option>' +
        list.map(v => '<option value="' + v.voiceURI.replace(/"/g, '&quot;') + '">' + v.name + ' (' + v.lang + ')' + (nice(v) ? ' ★' : '') + '</option>').join('');
      sel.value = st.settings.voice || '';
      $('pVoiceTip').innerHTML = list.some(nice)
        ? 'Voices marked ★ are the smooth, natural ones.'
        : 'For a much more natural voice on iPad or iPhone: Settings, Accessibility, Spoken Content, Voices, English, then download <b>Ava (Premium)</b> or <b>Samantha (Enhanced)</b>. Come back here and it is picked automatically.';
    };
    fillVoices(); A.onVoices = fillVoices;
    const SAMPLE = "Hello! Let's count the princess's jewels: one, two, three. Which one rhymes with cat? Hat, sun, or dog?";
    $('pVoice').onchange = e => { st.settings.voice = e.target.value; S.save(); applySettings(); A.say(SAMPLE); };
    $('pTest').onclick = () => A.say(SAMPLE);
    $('pSfx').onchange = e => { st.settings.sfx = e.target.value === '1'; S.save(); applySettings(); };
    const today = new Date(st.play.windowStart).toDateString() === new Date().toDateString();
    const mins = today ? Math.round(st.play.ms / 60000) : 0;
    $('pToday').textContent = `Played today: about ${mins} minute${mins === 1 ? '' : 's'}. The limit is checked at the end of each round, so a game is never cut off mid-question.`;

    // progress
    const prog = U.el('div', 'panel');
    let rows = '';
    PA.games.forEach(g => {
      const r = S.game(g.id);
      const recent = r.recent.slice(-5);
      const avg = recent.length ? Math.round(recent.reduce((a, x) => a + x, 0) / recent.length) : null;
      const lv = Math.min(r.level, g.maxLevel);
      const ramp = Math.round(S.challenge(g.id) * 100);
      const opts = g.levels.map((name, i) => `<option value="${i + 1}"${i + 1 === lv ? ' selected' : ''}>${i + 1}. ${name}</option>`).join('');
      rows += `<tr><td><span class="emoji">${g.icon}</span> <b>${g.name}</b><div class="muted">${g.skill}</div></td>
        <td>Level ${lv} of ${g.maxLevel}<div class="muted">${g.levels[lv - 1]}</div>${lv < g.maxLevel ? `<div class="muted">Next: ${g.levels[lv]}</div>` : ''}
          <label class="muted lvl-set">Jump to <select data-g="${g.id}">${opts}</select></label></td>
        <td class="hide-sm">${r.rounds}<div class="muted">+${ramp}% harder${ramp ? ` <a href="#" data-ramp="${g.id}">reset</a>` : ''}</div></td>
        <td>${avg == null ? '<span class="muted">not played</span>' : `<div class="bar"><i style="width:${avg}%"></i></div><span class="muted">${avg}% first try</span>`}</td></tr>`;
    });
    const un = PA.sounds.unlocked();
    const chips = PA.sounds.ORDER.map((ch, i) => {
      const key = 'ltr:' + ch, rec = S.game('sounds').items[key];
      const ok = rec && rec[0] >= 3 && S.itemScore('sounds', key) >= 0.75;
      return `<span class="chip ${i < un ? (ok ? 'ok' : 'learning') : ''}">${ch}</span>`;
    }).join('');
    prog.innerHTML = `<h3>Progress</h3>
      <table><tr><th>Game</th><th>Level</th><th class="hide-sm">Rounds</th><th>Last 5 rounds</th></tr>${rows}</table>
      <h3>Letters</h3><div class="chips">${chips}</div>
      <div class="muted">Green: solid. Yellow: learning now. Grey: not yet. A new letter unlocks when all the current ones are solid.</div>
      <p class="muted">Levels go up after two strong rounds (80%+ right on the first try) or one perfect round, and down after a hard round, which keeps her near the "just right" challenge. Use <b>Jump to</b> if she already knows a level (for example, she counts to 10 well: jump Gem Counting to level 11).</p>
      <p class="muted"><b>+% harder:</b> every round she plays makes that game 2.5% harder (up to +100%): more questions per round, more of them from the next level up, bigger numbers and more answers to pick from. A hard round pauses it. Stickers: ${st.stickers.length}.</p>`;
    p.appendChild(prog);
    prog.querySelectorAll('select[data-g]').forEach(sel => {
      sel.onchange = () => { S.setLevel(sel.getAttribute('data-g'), Number(sel.value)); app.parent(); };
    });
    prog.querySelectorAll('a[data-ramp]').forEach(a => {
      a.onclick = e => { e.preventDefault(); S.resetBoost(a.getAttribute('data-ramp')); app.parent(); };
    });

    // other devices
    const share = U.el('div', 'panel');
    if (window.PA_SINGLE_FILE) {
      share.innerHTML = `<h3>This is the one-file copy</h3><p class="muted">It runs without the computer or the internet (the voice and pictures come from the device). Progress is saved in this browser on this device only.</p>`;
    } else {
      share.innerHTML = `<h3>Other phones and tablets</h3><ul>
        <li><b>The website:</b> <a href="https://ironmanappraisals.github.io/princess-academy/" target="_blank" rel="noopener">ironmanappraisals.github.io/princess-academy</a> works on any phone or tablet, with no computer needed. Open it once in Safari and Add to Home Screen; after that it works offline too. Progress is saved separately on each device.</li>
        <li><b>Scan to play:</b> open the QR code and point the other device's camera at it. It goes to the website.</li>
        <li><b>Download as one file:</b> the whole game in a single <i>princess-academy.html</i> file for a computer or Android tablet with no internet. (iPhone and iPad won't run games from the Files app; use the website.)</li>
      </ul>
      <div class="row-btns"><a class="btn small purple" href="qr.html" target="_blank" rel="noopener">Show QR code</a>
      <a class="btn small" href="princess-academy.html" download="princess-academy.html">Download as one file</a></div>`;
    }
    p.appendChild(share);

    // research
    const res = U.el('div', 'panel');
    res.innerHTML = `<h3>How it's designed</h3>
      <ul>
        <li><b>Learning first, not tapping.</b> It follows the "four pillars" of good learning apps (Hirsh-Pasek et al., 2015): active thinking, no distracting extras, meaningful to her, and things to do with you.</li>
        <li><b>A long ladder in every game.</b> Each game follows a research learning trajectory (for maths, the Building Blocks trajectories of Clements &amp; Sarama; for reading, systematic phonics), 5 to 10 levels deep.</li>
        <li><b>Just-right difficulty.</b> Each game adapts to keep her near 80% success. Things she misses come back more often (spaced review), and about a quarter of each round mixes in earlier levels (interleaved practice).</li>
        <li><b>Super challenge.</b> The last question of a round comes from the next level up. Getting it right earns a bonus sticker; missing it costs nothing.</li>
        <li><b>Mistakes are safe.</b> No timers, no losing, no lives. A wrong tap fades and she tries again; after two, the answer glows and the voice explains why.</li>
        <li><b>Effort praise.</b> "You counted carefully," not "you're so smart". Praising effort builds persistence (Mueller &amp; Dweck, 1998; Gunderson et al., 2013).</li>
        <li><b>Made for pre-readers.</b> Everything is spoken, with a 🔊 repeat button on every question. Whatever the voice names lights up as it's said (each gem as it's counted, each bead as a pattern is read), linking the spoken word to the thing. Answers never light up before she's chosen.</li>
        <li><b>Clear next step.</b> The button to press next (Play, Done, the spinner) glows gently.</li>
        <li><b>A steady climb.</b> On top of the levels, every round makes that game 2.5% harder, so it keeps stretching her even between level-ups.</li>
        <li><b>Calm.</b> Rounds are 10 questions (adjustable) with a sticker at the end. No ads, no purchases, no streaks, and a daily time limit. Paediatric advice for ages 2-5 is about an hour of quality screen time a day, best shared with a grown-up.</li>
      </ul>
      <h3>The games</h3><ul>${PA.games.map(g => `<li><b>${g.name}:</b> ${g.research}</li>`).join('')}</ul>
      <p class="muted">Best results come from playing alongside her some of the time: say the numbers on Castle Path out loud together, and try the "grown-up idea" shown after each round.</p>`;
    p.appendChild(res);

    // iPad tips
    const tips = U.el('div', 'panel');
    tips.innerHTML = `<h3>iPad setup</h3><ul>
      <li><b>Make it an app:</b> open the website in Safari, tap Share, then <i>Add to Home Screen</i>. It opens full-screen without the address bar, and keeps working with no internet once it has loaded.</li>
      <li><b>Lock her in:</b> Settings, Accessibility, Guided Access: on, with a passcode. Open Princess Academy and triple-click the Home button. Triple-click again with your passcode to get out.</li>
      <li><b>Keep the web safe:</b> Settings, Screen Time, Content &amp; Privacy Restrictions, Content Restrictions, Web Content: <i>Allowed Websites Only</i>, and add this site.</li>
      <li><b>No sound?</b> Check the side switch and volume. The iPad's mute switch also silences web audio.</li>
    </ul>`;
    p.appendChild(tips);

    const reset = U.el('button', 'danger', 'Reset all progress and stickers');
    reset.onclick = () => { if (confirm('Erase all progress, levels and stickers on this iPad? Settings are kept.')) { S.reset(); app.parent(); } };
    p.appendChild(reset);
    s.appendChild(p);
    U.show(s);
    back.onclick = () => app.home();
  };

  // ---------- boot ----------
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('visibilitychange', () => { if (document.hidden) A.stop(); });
  if ('serviceWorker' in navigator && window.isSecureContext && location.hostname !== 'localhost') {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  app.start();
})();
