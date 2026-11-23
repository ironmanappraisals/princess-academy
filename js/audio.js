'use strict';
// Voice + sound effects. Pre-readers get every instruction spoken (Web Speech API, built into iPadOS Safari),
// and every question has a repeat button. Sound effects are synthesized with Web Audio, so there are no files.
// iOS only allows audio after a tap, so app.js calls PA.audio.unlock() from the first "Play" tap.
window.PA = window.PA || {};
(function () {
  const A = PA.audio = {};
  let ctx = null;
  let voice = null;
  let token = 0;          // bumps on every say()/stop(), so stale promises resolve quietly
  A.rate = 0.9;
  A.sfxOn = true;

  // Voice choice matters more than anything else for how natural it sounds. Devices ship small "compact" voices
  // by default; the downloadable Enhanced / Premium (Apple) and Natural / Neural (Microsoft, Google) voices are far
  // smoother. Score every English voice and take the best; a grown-up can override it in Grown-ups.
  A.voiceURI = '';  // grown-up's pick ('' = automatic)
  const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|deranged|hysterical|pipe organ|fred|junior|ralph|kathy|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley/i;
  const FAVOURITES = ['Ava', 'Samantha', 'Zoe', 'Allison', 'Susan', 'Nicky', 'Serena', 'Karen', 'Moira', 'Tessa', 'Kate', 'Martha',
    'Microsoft Jenny', 'Microsoft Aria', 'Microsoft Ava', 'Microsoft Emma', 'Microsoft Sonia', 'Microsoft Libby', 'Google US English', 'Google UK English Female',
    'Microsoft Zira', 'Microsoft Hazel', 'Microsoft Susan', 'Microsoft Catherine'];
  // the guide is a princess, so lean toward a female voice when nothing better is installed
  const MALE = /\b(david|mark|guy|daniel|alex|tom|aaron|arthur|rishi|oliver|george|james|ryan|christopher|eric|andrew|brian|roger|steffan|male)\b/i;
  A.scoreVoice = function (v) {
    if (!/^en[-_]/i.test(v.lang) || NOVELTY.test(v.name)) return -1000;
    const id = v.name + ' ' + (v.voiceURI || '');
    let s = 10;
    if (/premium/i.test(id)) s += 60;
    if (/enhanced|natural|neural|online/i.test(id)) s += 45;
    if (/compact/i.test(id)) s -= 15;
    const fav = FAVOURITES.findIndex(n => v.name.indexOf(n) === 0);
    if (fav >= 0) s += 30 - fav;
    if (/en[-_]US/i.test(v.lang)) s += 4; else if (/en[-_](GB|AU|IE|NZ)/i.test(v.lang)) s += 2;
    if (MALE.test(v.name) && !/female/i.test(v.name)) s -= 8;
    return s;
  };
  // iPhone / iPad (iPadOS reports itself as a Mac, so also check for touch). Safari on iOS lists every installed
  // voice, but a web page can only really use ONE voice per accent: asking for any other US voice (Ava, Allison...)
  // quietly plays Samantha. So on iOS only the voices that actually work are offered, one per accent.
  A.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const IOS_OK = /^(Samantha|Karen|Daniel|Moira|Tessa|Rishi)\b/;
  const ACCENT = { US: 'American', GB: 'British', AU: 'Australian', IE: 'Irish', ZA: 'South African', IN: 'Indian', NZ: 'New Zealand', CA: 'Canadian', SC: 'Scottish' };
  A.accent = v => ACCENT[(v.lang.split(/[-_]/)[1] || '').toUpperCase()] || v.lang;
  A.voiceKey = v => (v.voiceURI || '') + '|' + v.name + '|' + v.lang;
  A.voices = function () {
    if (!window.speechSynthesis) return [];
    let list = (speechSynthesis.getVoices() || []).filter(v => A.scoreVoice(v) > -1000).sort((a, b) => A.scoreVoice(b) - A.scoreVoice(a));
    if (A.isIOS) {
      const ok = list.filter(v => IOS_OK.test(v.name));
      if (ok.length) list = ok;
      const seen = {};
      list = list.filter(v => { const k = v.lang.replace('_', '-'); if (seen[k]) return false; seen[k] = 1; return true; });
    }
    return list;
  };
  function pickVoice() {
    if (voice || !window.speechSynthesis) return voice;
    const list = A.voices();
    if (!list.length) return null;
    voice = (A.voiceURI && (list.find(v => A.voiceKey(v) === A.voiceURI) || list.find(v => v.voiceURI === A.voiceURI))) || list[0];
    return voice;
  }
  A.setVoice = function (uri) { A.voiceURI = uri || ''; voice = null; pickVoice(); };
  A.currentVoice = () => { voice = null; return pickVoice(); };
  if (window.speechSynthesis && 'onvoiceschanged' in speechSynthesis) {
    speechSynthesis.onvoiceschanged = () => { voice = null; pickVoice(); if (A.onVoices) A.onVoices(); };
  }

  A.unlock = function () {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      }
      if (ctx && ctx.state === 'suspended') ctx.resume();
      if (ctx) { // a silent blip finishes the iOS unlock
        const b = ctx.createBuffer(1, 1, 22050); const s = ctx.createBufferSource();
        s.buffer = b; s.connect(ctx.destination); s.start(0);
      }
    } catch (e) { /* audio is a nicety; the app still works silently */ }
    try {
      if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); }
    } catch (e) { }
  };

  // Word-by-word hooks so the screen can light up whatever is being named ("one... two... three" flashes each gem).
  // A.onWord(word) fires as each word is spoken; A.onSpeak(true/false) fires when talking starts and stops.
  A.onWord = null;
  A.onSpeak = null;
  let timers = [];
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const speaking = on => { if (A.onSpeak) try { A.onSpeak(on); } catch (e) { } };

  A.stop = function () {
    token++;
    clearTimers();
    speaking(false);
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { }
  };

  // Pauses. iPad voices barely pause at commas or question marks, so the instruction runs straight into the options
  // ("which one rhymes with cat hat sun or dog"). Instead each sentence, and each item of a list, is spoken as its own
  // little utterance with a real silence after it:
  //   "Which one rhymes with cat?" [pause] "hat" [short pause] "sun" [short pause] "or dog?"
  A.PAUSE_SENTENCE = 450;   // ms after a sentence or a "Look at this:" lead-in
  A.PAUSE_ITEM = 320;       // ms between the things in a list (options, beads, numbers being counted)
  const words = s => s.replace(/^(or|and)\s+/i, '').split(/\s+/).filter(Boolean).length;
  A.segments = function (raw) {
    const t = String(raw).replace(/\s+/g, ' ').trim();
    const out = [];
    const push = (text, pause) => { text = text.trim(); if (text && /[A-Za-z0-9]/.test(text)) out.push({ text, pause }); else if (out.length && pause > out[out.length - 1].pause) out[out.length - 1].pause = pause; };
    // a sentence-sized piece: a comma list of 3+ short items ("red heart, star, red heart") is split into items too
    const sentence = (s, pause) => {
      const items = s.split(/\s*,\s*/);
      if (items.length >= 3 && items.every(x => words(x) <= 3)) items.forEach((x, i) => push(x, i === items.length - 1 ? pause : A.PAUSE_ITEM));
      else push(s, pause);
    };
    const re = /(\.{3,}|[.!?:](?=\s|$))\s*/g;
    let last = 0, m;
    while ((m = re.exec(t))) {
      const ellipsis = m[1].charAt(0) === '.' && m[1].length >= 3;
      const piece = t.slice(last, m.index) + (ellipsis || m[1] === ':' ? '' : m[1]);
      sentence(piece, ellipsis ? A.PAUSE_ITEM : A.PAUSE_SENTENCE);
      last = m.index + m[0].length;
    }
    if (last < t.length) sentence(t.slice(last), 0);
    if (out.length) out[out.length - 1].pause = 0;
    return out;
  };

  // Speak text; resolves when finished.
  A.say = function (raw) {
    const SS = window.speechSynthesis;
    const busy = !!(SS && (SS.speaking || SS.pending));
    A.stop();
    const my = token;
    if (!raw) return Promise.resolve();
    const parts = A.segments(raw);
    if (!parts.length) return Promise.resolve();
    speaking(true);
    return (async () => {
      // a breath between one instruction and the next (e.g. the game intro, then the question). Single words like
      // the numbers said while she taps to count go out straight away.
      const since = Date.now() - lastEnd;
      const oneWord = parts.length === 1 && !/\s/.test(parts[0].text.trim());
      if (since < A.PAUSE_SENTENCE && !oneWord) await new Promise(r => setTimeout(r, A.PAUSE_SENTENCE - since));
      for (let i = 0; i < parts.length; i++) {
        if (my !== token) return false;
        await speakPart(parts[i].text, my, i === 0 && busy);
        if (my !== token) return false;
        if (parts[i].pause) await new Promise(r => setTimeout(r, parts[i].pause));
      }
      if (my === token) { clearTimers(); speaking(false); lastEnd = Date.now(); }
      return my === token;
    })();
  };
  let lastEnd = 0;

  // One utterance. Resolves when it ends (or after a length-based safety net, because iOS sometimes drops onend).
  function speakPart(text, my, afterCancel) {
    const SS = window.speechSynthesis;
    return new Promise(resolve => {
      let done = false, poll = null;
      const finish = () => { if (!done) { done = true; clearInterval(poll); clearTimeout(fallback); clearTimers(); resolve(); } };
      const fallback = setTimeout(finish, 1500 + text.length * 65 / A.rate);
      // words with their positions, for boundary events and for the timing estimate
      const words = []; const re = /[A-Za-z0-9']+/g; let m;
      while ((m = re.exec(text))) words.push({ w: m[0].toLowerCase(), at: m.index, end: m.index + m[0].length });
      const emit = i => { if (my === token && A.onWord && words[i]) try { A.onWord(words[i].w); } catch (e) { } };
      // Real word-boundary events where the voice provides them (Safari does); otherwise an estimate from the text.
      let gotBoundary = false, timeline = false, lastEmitted = -1;
      const startTimeline = () => {
        if (gotBoundary || timeline || my !== token || done) return;
        timeline = true;
        let t = 0;
        words.forEach((x, i) => {
          timers.push(setTimeout(() => { if (!gotBoundary && i > lastEmitted) { lastEmitted = i; emit(i); } }, t * 1000));
          const after = text.slice(x.end, (words[i + 1] || { at: text.length }).at);
          t += (0.13 + 0.058 * x.w.length) / A.rate;
          if (/[.!?]/.test(after)) t += 0.38 / A.rate; else if (/[,;:]/.test(after)) t += 0.2 / A.rate;
        });
      };
      if (!SS) { startTimeline(); return; }
      try {
        const u = new SpeechSynthesisUtterance(text);
        // re-check every time: iPads don't announce newly downloaded voices, and a home-screen app can stay open for days
        voice = null;
        const v = pickVoice();
        if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
        u.rate = A.rate; u.pitch = 1.04; // a high pitch exaggerates the synthetic edge
        u.onstart = () => { timers.push(setTimeout(startTimeline, 160)); };
        u.onboundary = e => {
          if (e.name && e.name !== 'word') return;
          if (!gotBoundary) { gotBoundary = true; clearTimers(); }
          let i = words.findIndex(x => e.charIndex >= x.at && e.charIndex < x.end);
          if (i < 0) i = words.findIndex(x => x.at >= e.charIndex);
          if (i > lastEmitted) { lastEmitted = i; emit(i); }
        };
        u.onend = () => setTimeout(finish, 20);
        u.onerror = () => finish();
        A._u = u; // keep a reference: Safari can garbage-collect an utterance mid-sentence and skip its onend
        // iOS: a cancel() immediately followed by speak() is sometimes swallowed; a tick of delay fixes it.
        setTimeout(() => {
          if (my !== token) return finish();
          SS.speak(u);
          // iOS sometimes never fires onend; watch the engine instead: once it has spoken and gone quiet, carry on.
          let heard = false; const t0 = Date.now();
          poll = setInterval(() => {
            if (my !== token) return finish();
            if (SS.speaking) heard = true;
            else if ((heard || Date.now() - t0 > 2500) && !SS.pending) finish();
          }, 100);
        }, afterCancel ? 60 : 0);
        // no voice at all (or onstart never fires): still light things up on the estimated timing
        timers.push(setTimeout(startTimeline, 900));
      } catch (e) { finish(); }
    });
  }

  function tone(freq, start, dur, type, vol) {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    const t = ctx.currentTime + start;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.05);
  }

  A.sfx = function (name) {
    if (!A.sfxOn || !ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      if (name === 'right') { tone(784, 0, 0.18, 'triangle'); tone(1175, 0.1, 0.3, 'triangle'); }
      else if (name === 'wrong') { tone(330, 0, 0.22, 'sine', 0.12); tone(277, 0.12, 0.28, 'sine', 0.1); }
      else if (name === 'tap') { tone(660, 0, 0.08, 'sine', 0.1); }
      else if (name === 'drum') { tone(150, 0, 0.22, 'sine', 0.4); tone(95, 0.01, 0.3, 'sine', 0.3); }
      else if (name === 'step') { tone(523, 0, 0.1, 'triangle', 0.12); }
      else if (name === 'sparkle') { [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, i * 0.08, 0.25, 'triangle', 0.1)); }
      else if (name === 'fanfare') { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.3, 'triangle', 0.14)); }
    } catch (e) { }
  };
})();
