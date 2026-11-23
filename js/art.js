'use strict';
// Original princess artwork (inline SVG), built from the child's choices of skin, hair and dress colour.
// Letting her design "her" princess makes the guide personal, which is part of making the app meaningful to her.
window.PA = window.PA || {};
(function () {
  const art = PA.art = {};
  art.SKIN = ['#ffe3cc', '#f5c7a1', '#dca47a', '#ad7048', '#734a2e'];
  art.HAIR = ['#4a2c1a', '#f4cf57', '#c4562b', '#1f1a1a', '#9a6a3c', '#ff8fc8', '#9b6bff'];
  art.DRESS = ['#ff6fae', '#a77bff', '#5fb8ff', '#ffcc33', '#41cf9b', '#ff8a5c'];

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((f - r) * p + r); g = Math.round((f - g) * p + g); b = Math.round((f - b) * p + b);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  art.shade = shade;

  // mood: 'happy' | 'wow' | 'sleep'
  art.princess = function (p, mood) {
    p = p || PA.store.state.profile;
    const skin = art.SKIN[p.skin] || art.SKIN[1];
    const hair = art.HAIR[p.hair] || art.HAIR[0];
    const dress = art.DRESS[p.dress] || art.DRESS[0];
    const dressHi = shade(dress, 0.35), dressLo = shade(dress, -0.15), hairLo = shade(hair, -0.2);
    let eyes, mouth;
    if (mood === 'sleep') {
      eyes = '<path d="M78 93 Q84 99 90 93" stroke="#3a2340" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M110 93 Q116 99 122 93" stroke="#3a2340" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
      mouth = '<path d="M94 112 Q100 116 106 112" stroke="#b5476e" stroke-width="3" fill="none" stroke-linecap="round"/>';
    } else {
      const ry = mood === 'wow' ? 9 : 7.5;
      eyes = `<ellipse cx="84" cy="93" rx="6" ry="${ry}" fill="#3a2340"/><ellipse cx="116" cy="93" rx="6" ry="${ry}" fill="#3a2340"/>
        <circle cx="86" cy="90" r="2.4" fill="#fff"/><circle cx="118" cy="90" r="2.4" fill="#fff"/>
        <path d="M76 84 L73 80 M80 82 L79 77 M124 84 L127 80 M120 82 L121 77" stroke="#3a2340" stroke-width="2" stroke-linecap="round"/>`;
      mouth = mood === 'wow'
        ? '<ellipse cx="100" cy="114" rx="7" ry="8" fill="#b5476e"/><ellipse cx="100" cy="117" rx="4" ry="3" fill="#ff8fb0"/>'
        : '<path d="M88 108 Q100 122 112 108 Z" fill="#b5476e"/><path d="M93 112 Q100 117 107 112" fill="#ff8fb0"/>';
    }
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
      <circle cx="100" cy="90" r="44" fill="${skin}"/>
      <path d="M56 92 Q54 44 100 42 Q146 44 144 92 Q136 70 116 64 Q108 74 90 72 Q74 72 64 82 Z" fill="${hair}"/>
      <path d="M90 72 Q98 60 116 64" stroke="${hairLo}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M70 52 L76 26 L89 42 L100 18 L111 42 L124 26 L130 52 Q100 44 70 52 Z" fill="#ffd54a" stroke="#f0b400" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="100" cy="40" r="5" fill="#ff6fae"/><circle cx="83" cy="46" r="3.5" fill="#5fb8ff"/><circle cx="117" cy="46" r="3.5" fill="#41cf9b"/>
      ${eyes}
      <circle cx="73" cy="106" r="7" fill="#ff8fb0" opacity=".45"/><circle cx="127" cy="106" r="7" fill="#ff8fb0" opacity=".45"/>
      ${mouth}
    </svg>`;
  };

  // Small head-only token for the board game.
  art.princessHead = function (p) {
    p = p || PA.store.state.profile;
    const skin = art.SKIN[p.skin] || art.SKIN[1];
    const hair = art.HAIR[p.hair] || art.HAIR[0];
    return `<svg viewBox="40 14 120 120" width="100%" height="100%" aria-hidden="true">
      <path d="M48 96 Q44 40 100 36 Q156 40 152 96 L152 128 L48 128 Z" fill="${hair}"/>
      <circle cx="100" cy="90" r="44" fill="${skin}"/>
      <path d="M56 92 Q54 44 100 42 Q146 44 144 92 Q136 70 116 64 Q108 74 90 72 Q74 72 64 82 Z" fill="${hair}"/>
      <path d="M70 52 L76 26 L89 42 L100 18 L111 42 L124 26 L130 52 Q100 44 70 52 Z" fill="#ffd54a" stroke="#f0b400" stroke-width="2"/>
      <ellipse cx="84" cy="93" rx="6" ry="7.5" fill="#3a2340"/><ellipse cx="116" cy="93" rx="6" ry="7.5" fill="#3a2340"/>
      <path d="M88 108 Q100 122 112 108 Z" fill="#b5476e"/>
    </svg>`;
  };
})();
