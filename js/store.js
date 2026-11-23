'use strict';
// Progress + adaptive difficulty, saved on the device (localStorage).
// Adaptivity keeps the child near ~80% first-try success: two good rounds in a row (or one perfect round) move a game
// up a level; a hard round (40% or less) moves it down. Inside a level, items she gets wrong come back more often
// (spaced, interleaved review) instead of being drilled in a block.
window.PA = window.PA || {};
(function () {
  const KEY = 'princess-academy.v2';
  const S = PA.store = {};

  const blank = () => ({
    profile: { made: false, skin: 1, hair: 0, dress: 0, name: '' },
    settings: { limitMin: 20, rate: 0.9, sfx: true, roundLen: 10 },
    games: {},
    stickers: [],
    play: { windowStart: 0, ms: 0, last: 0 }
  });

  let state;
  try { state = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { state = null; }
  if (!state || typeof state !== 'object') state = blank();
  const b = blank();
  for (const k in b) if (!(k in state)) state[k] = b[k];
  for (const k in b.settings) if (!(k in state.settings)) state.settings[k] = b.settings[k];

  S.state = state;
  S.save = function () { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } };
  S.reset = function () { const keep = state.settings; state = S.state = blank(); state.settings = keep; S.save(); };

  S.game = function (id) {
    if (!state.games[id]) state.games[id] = { level: 1, rounds: 0, good: 0, items: {}, recent: [], extra: {} };
    return state.games[id];
  };

  // Per-item record for spaced review: [seen, firstTryCorrect, lastRoundSeen]
  S.recordItem = function (id, key, correct) {
    const g = S.game(id);
    const r = g.items[key] || (g.items[key] = [0, 0, 0]);
    r[0]++; if (correct) r[1]++; r[2] = g.rounds;
    S.save();
  };
  S.itemScore = function (id, key) {
    const r = S.game(id).items[key];
    if (!r) return 0.5;
    return (r[1] + 1) / (r[0] + 2);
  };

  // Weighted pick without replacement: weaker items and items not seen lately come up more.
  S.pick = function (id, pool, n, keyOf) {
    const g = S.game(id);
    const items = pool.slice();
    const out = [];
    while (out.length < n && items.length) {
      const w = items.map(it => {
        const k = keyOf(it); const r = g.items[k];
        const weak = 1 - S.itemScore(id, k);
        const stale = r ? Math.min(3, g.rounds - r[2]) * 0.1 : 0.3;
        return 0.15 + weak + stale;
      });
      let total = w.reduce((a, x) => a + x, 0), x = Math.random() * total, i = 0;
      while (i < w.length - 1 && x > w[i]) { x -= w[i]; i++; }
      out.push(items.splice(i, 1)[0]);
    }
    return out;
  };

  // Called at the end of a round. Returns {up, down, level}.
  S.endRound = function (id, correct, total, maxLevel) {
    const g = S.game(id);
    g.rounds++;
    const acc = total ? correct / total : 0;
    g.recent.push(Math.round(acc * 100)); if (g.recent.length > 10) g.recent.shift();
    let up = false, down = false;
    if (acc >= 0.8) g.good++; else g.good = 0;
    if ((acc === 1 || g.good >= 2) && g.level < maxLevel) { g.level++; g.good = 0; up = true; }
    else if (acc <= 0.4 && g.level > 1) { g.level--; g.good = 0; down = true; }
    // Steady ramp on top of the levels: every round played makes that game 2.5% harder (up to +100%).
    // A hard round (40% or less) holds the ramp where it is instead of pushing on.
    if (acc > 0.4) g.boost = (g.boost || 0) + 1;
    S.save();
    return { up, down, level: g.level };
  };
  // 0 .. 1: how far along the 2.5%-per-round ramp this game is
  S.challenge = id => Math.min(1, (S.game(id).boost || 0) * 0.025);
  // grown-up override: jump a game to a level (e.g. she can already count to 10)
  S.setLevel = function (id, level) { const g = S.game(id); g.level = level; g.good = 0; S.save(); };
  S.resetBoost = function (id) { S.game(id).boost = 0; S.save(); };

  S.addSticker = function (s) { state.stickers.push(s); S.save(); };

  // Play-time limit. A "day" of play resets after 60 quiet minutes or a new calendar day.
  S.tickPlay = function (ms) {
    const p = state.play, now = Date.now();
    const newDay = new Date(p.windowStart).toDateString() !== new Date(now).toDateString();
    if (!p.windowStart || newDay || now - p.last > 60 * 60 * 1000) { p.windowStart = now; p.ms = 0; }
    p.ms += ms; p.last = now;
    S.save();
  };
  S.timeUp = function () {
    const lim = state.settings.limitMin;
    if (!lim) return false;
    const p = state.play, now = Date.now();
    if (now - p.last > 60 * 60 * 1000 || new Date(p.windowStart).toDateString() !== new Date(now).toDateString()) return false;
    return p.ms >= lim * 60 * 1000;
  };
  S.grantMore = function (min) { state.play.ms = Math.max(0, state.play.ms - min * 60 * 1000); S.save(); };
})();
