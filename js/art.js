'use strict';
// Original princess artwork (inline SVG), built from the child's choices: skin, hair, dress, crown, eyes, bow,
// necklace and wand. Letting her design "her" princess makes the guide personal, which is part of making the app
// meaningful to her. In each game she wears that game's fairy-tale outfit colour (p.dressColor overrides the dress).
window.PA = window.PA || {};
(function () {
  const art = PA.art = {};
  art.SKIN = ['#ffe3cc', '#f5c7a1', '#dca47a', '#ad7048', '#734a2e'];
  art.HAIR = ['#4a2c1a', '#f4cf57', '#c4562b', '#1f1a1a', '#9a6a3c', '#ff8fc8', '#9b6bff'];
  art.DRESS = ['#ff6fae', '#a77bff', '#5fb8ff', '#ffcc33', '#41cf9b', '#ff8a5c'];
  art.CROWN = ['#ffd54a', '#e3e7ef', '#ffb3c7', '#c9a7ff', '#9fd8ff', '#7fe0b8'];
  art.EYES = ['#3a2340', '#7a4a24', '#2f7fe8', '#2f9e5a', '#9a7a3a', '#8a5cf6'];
  // index 0 = none
  art.BOW = [null, '#ff6fae', '#5fb8ff', '#ffcc33', '#41cf9b', '#a77bff', '#ff5a5a'];
  art.NECK = [null, '#ff6fae', '#5fb8ff', '#41cf9b', '#a77bff', '#ffffff'];
  art.WAND = [null, '#ffd54a', '#ff8fc8', '#9fd8ff', '#c9a7ff', '#7fe0b8'];

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((f - r) * p + r); g = Math.round((f - g) * p + g); b = Math.round((f - b) * p + b);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  art.shade = shade;
  art.starPath = function (cx, cy, R, r, n) {
    n = n || 5; let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = -Math.PI / 2 + i * Math.PI / n, rad = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + (cx + rad * Math.cos(a)).toFixed(1) + ' ' + (cy + rad * Math.sin(a)).toFixed(1) + ' ';
    }
    return d + 'Z';
  };
  const look = p => {
    p = p || PA.store.state.profile;
    return {
      skin: art.SKIN[p.skin] || art.SKIN[1], hair: art.HAIR[p.hair] || art.HAIR[0],
      dress: p.dressColor || art.DRESS[p.dress] || art.DRESS[0],
      crown: art.CROWN[p.crown] || art.CROWN[0], eyes: art.EYES[p.eyes] || art.EYES[0],
      bow: art.BOW[p.bow] || null, neck: art.NECK[p.neck] || null, wand: art.WAND[p.wand] || null
    };
  };
  art.look = look;
  const crownSvg = (c, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-30 12 L-24 -14 L-11 2 L0 -22 L11 2 L24 -14 L30 12 Q0 4 -30 12 Z" fill="${c}" stroke="${shade(c, -0.3)}" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="0" cy="0" r="5" fill="#ff6fae"/><circle cx="-17" cy="6" r="3.5" fill="#5fb8ff"/><circle cx="17" cy="6" r="3.5" fill="#41cf9b"/></g>`;
  const bowSvg = (c, x, y, rot) => c ? `<g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M0 0 L-15 -11 Q-19 0 -15 11 Z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M0 0 L15 -11 Q19 0 15 11 Z" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="1.5" stroke-linejoin="round"/>
      <circle r="4.5" fill="${shade(c, -0.15)}"/></g>` : '';
  const eyeSvg = (cx, cy, ry, c) => `<ellipse cx="${cx}" cy="${cy}" rx="6" ry="${ry}" fill="${c}"/>
      <ellipse cx="${cx}" cy="${cy + 1}" rx="3.2" ry="${ry - 3.2}" fill="#241626"/>
      <circle cx="${cx + 2}" cy="${cy - 3}" r="2.4" fill="#fff"/>`;

  // mood: 'happy' | 'wow' | 'sleep'
  art.princess = function (p, mood) {
    const L = look(p);
    const { skin, hair, dress } = L;
    const dressHi = shade(dress, 0.35), dressLo = shade(dress, -0.15), hairLo = shade(hair, -0.2);
    let eyes, mouth;
    if (mood === 'sleep') {
      eyes = '<path d="M78 93 Q84 99 90 93" stroke="#3a2340" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M110 93 Q116 99 122 93" stroke="#3a2340" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
      mouth = '<path d="M94 112 Q100 116 106 112" stroke="#b5476e" stroke-width="3" fill="none" stroke-linecap="round"/>';
    } else {
      const ry = mood === 'wow' ? 9 : 7.5;
      eyes = eyeSvg(84, 93, ry, L.eyes) + eyeSvg(116, 93, ry, L.eyes) +
        '<path d="M76 84 L73 80 M80 82 L79 77 M124 84 L127 80 M120 82 L121 77" stroke="#3a2340" stroke-width="2" stroke-linecap="round"/>';
      mouth = mood === 'wow'
        ? '<ellipse cx="100" cy="114" rx="7" ry="8" fill="#b5476e"/><ellipse cx="100" cy="117" rx="4" ry="3" fill="#ff8fb0"/>'
        : '<path d="M88 108 Q100 122 112 108 Z" fill="#b5476e"/><path d="M93 112 Q100 117 107 112" fill="#ff8fb0"/>';
    }
    const pearl = L.neck === '#ffffff';
    const neck = L.neck ? `<path d="M90 127 Q100 139 110 127" stroke="${pearl ? '#f4f0fa' : shade(L.neck, 0.3)}" stroke-width="4.5" fill="none" stroke-dasharray="0.1 5.2" stroke-linecap="round"/>
      <path d="M100 132 L105 138 L100 145 L95 138 Z" fill="${L.neck}" stroke="${pearl ? '#c9c2d8' : shade(L.neck, -0.3)}" stroke-width="1.5" stroke-linejoin="round"/>` : '';
    const wand = L.wand ? `<path d="M137 197 L158 150" stroke="#8a5cf6" stroke-width="4.5" stroke-linecap="round"/>
      <path d="${art.starPath(160, 145, 13, 5.5)}" fill="${L.wand}" stroke="${shade(L.wand, -0.3)}" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="171" cy="131" r="2" fill="${L.wand}"/><circle cx="147" cy="131" r="1.6" fill="${L.wand}"/>` : '';
    return `<svg class="pr" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M48 96 Q44 40 100 36 Q156 40 152 96 L156 168 Q140 180 124 168 L120 120 L80 120 L76 168 Q60 180 44 168 Z" fill="${hair}"/>
      <path d="M100 134 Q76 136 70 150 Q50 200 40 232 Q100 244 160 232 Q150 200 130 150 Q124 136 100 134 Z" fill="${dress}"/>
      <path d="M44 226 Q100 238 156 226 L160 232 Q100 244 40 232 Z" fill="${dressHi}"/>
      <path d="M62 196 Q100 206 138 196" stroke="${dressHi}" stroke-width="4" fill="none" stroke-dasharray="2 10" stroke-linecap="round"/>
      <rect x="80" y="150" width="40" height="9" rx="4" fill="#ffd54a"/>
      <circle cx="100" cy="154.5" r="5" fill="#fff" stroke="#ffd54a" stroke-width="2"/>
      <path d="M70 154 Q58 176 64 196" stroke="${skin}" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M130 154 Q142 176 136 196" stroke="${skin}" stroke-width="10" fill="none" stroke-linecap="round"/>
      <circle cx="72" cy="146" r="14" fill="${dressHi}"/><circle cx="128" cy="146" r="14" fill="${dressHi}"/>
      <path d="M86 138 Q100 146 114 138 L112 150 L88 150 Z" fill="${dressLo}"/>
      <rect x="92" y="118" width="16" height="22" rx="6" fill="${skin}"/>
      ${neck}
      <circle cx="100" cy="90" r="44" fill="${skin}"/>
      <path d="M56 92 Q54 44 100 42 Q146 44 144 92 Q136 70 116 64 Q108 74 90 72 Q74 72 64 82 Z" fill="${hair}"/>
      <path d="M90 72 Q98 60 116 64" stroke="${hairLo}" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${crownSvg(L.crown, 100, 40, 1)}
      ${bowSvg(L.bow, 141, 66, 25)}
      ${eyes}
      <circle cx="73" cy="106" r="7" fill="#ff8fb0" opacity=".45"/><circle cx="127" cy="106" r="7" fill="#ff8fb0" opacity=".45"/>
      ${mouth}
      ${wand}
    </svg>`;
  };

  // Small head-only token for the board game.
  art.princessHead = function (p) {
    const L = look(p);
    return `<svg viewBox="40 14 120 120" width="100%" height="100%" aria-hidden="true">
      <path d="M48 96 Q44 40 100 36 Q156 40 152 96 L152 128 L48 128 Z" fill="${L.hair}"/>
      <circle cx="100" cy="90" r="44" fill="${L.skin}"/>
      <path d="M56 92 Q54 44 100 42 Q146 44 144 92 Q136 70 116 64 Q108 74 90 72 Q74 72 64 82 Z" fill="${L.hair}"/>
      ${crownSvg(L.crown, 100, 40, 1)}${bowSvg(L.bow, 141, 66, 25)}
      <ellipse cx="84" cy="93" rx="6" ry="7.5" fill="${L.eyes}"/><ellipse cx="116" cy="93" rx="6" ry="7.5" fill="${L.eyes}"/>
      <path d="M88 108 Q100 122 112 108 Z" fill="#b5476e"/>
    </svg>`;
  };

  // Her princess as a mermaid, swimming to the right (tail in her dress colour).
  art.mermaid = function (p, tailColor) {
    const L = look(p);
    const tail = tailColor || L.dress, tailHi = shade(tail, 0.35), tailLo = shade(tail, -0.2);
    return `<svg viewBox="0 0 180 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M126 16 Q100 12 86 30 Q74 46 50 50 Q76 62 98 46 Q110 38 124 40 Z" fill="${L.hair}"/>
      <path d="M40 62 Q14 32 6 42 Q16 58 6 78 Q16 88 40 68 Z" fill="${tailHi}" stroke="${tailLo}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M36 60 Q70 44 106 56 L110 78 Q70 86 36 68 Z" fill="${tail}"/>
      <path d="M58 56 q5 5 10 0 M74 54 q5 5 10 0 M90 56 q5 5 10 0 M66 66 q5 5 10 0 M82 66 q5 5 10 0" stroke="${tailHi}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M100 68 Q102 48 118 46 Q134 48 132 66 Q128 78 108 78 Z" fill="${L.skin}"/>
      <path d="M106 58 Q118 50 130 58 L129 65 Q118 60 107 65 Z" fill="${tailHi}"/>
      <path d="M124 66 Q140 72 152 62" stroke="${L.skin}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="136" cy="30" r="20" fill="${L.skin}"/>
      <path d="M116 32 Q114 8 138 9 Q158 11 156 28 Q146 16 132 20 Q124 26 116 32 Z" fill="${L.hair}"/>
      ${crownSvg(L.crown, 138, 9, 0.5)}
      ${eyeSvg(145, 30, 6, L.eyes)}
      <path d="M141 40 Q148 46 154 39" stroke="#b5476e" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <circle cx="133" cy="38" r="4.5" fill="#ff8fb0" opacity=".5"/>
    </svg>`;
  };

  // A grumpy-but-silly cartoon shark, swimming to the right.
  art.shark = function () {
    return `<svg viewBox="0 0 180 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M72 30 L86 4 L102 31 Z" fill="#7b8fa6"/>
      <path d="M6 34 L28 46 Q62 18 112 26 Q154 32 172 52 Q156 70 112 72 Q62 74 28 58 L6 70 L16 52 Z" fill="#94a8be"/>
      <path d="M30 56 Q84 72 166 54 Q152 70 112 72 Q62 74 30 58 Z" fill="#e6eef5"/>
      <path d="M86 62 L96 84 L108 64 Z" fill="#7b8fa6"/>
      <circle cx="140" cy="42" r="7" fill="#fff"/><circle cx="142" cy="43" r="3.4" fill="#22303d"/>
      <path d="M131 32 L148 35" stroke="#4f6175" stroke-width="3" stroke-linecap="round"/>
      <path d="M126 58 Q148 66 168 54" stroke="#4f6175" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M136 60 l3 5 l3 -4.5 M146 60.5 l3 4.5 l3 -5 M156 58.5 l2.6 4.2 l3 -5" stroke="#fff" stroke-width="2.4" fill="#fff" stroke-linejoin="round"/>
      <path d="M60 44 Q64 40 68 44 M52 46 Q56 42 60 46" stroke="#7b8fa6" stroke-width="2" fill="none"/>
    </svg>`;
  };
})();
