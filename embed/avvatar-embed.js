/**
 * Avvatar Guard – Universal embed
 * Drop-in widget that renders a domain fingerprint anywhere.
 *
 * Usage:
 *   <span data-avvatar-seed="example.com" data-avvatar-size="32"></span>
 *   <script src="avvatar-embed.js" defer></script>
 *
 * Data attributes:
 *   data-avvatar-seed   (required) – the seed string, usually a domain
 *   data-avvatar-size   (optional) – pixel size (default 32)
 *   data-avvatar-href   (optional) – link target (default: Avvatar Guard repo)
 *   data-avvatar-label  (optional) – "true" to render the seed as a caption
 *
 * Algorithm vendored from visualizevalue/avvatars (WTFPL).
 * Zero dependencies. ~3KB minified.
 */
(function () {
  'use strict';

  var DEFAULT_HREF = 'https://github.com/wearywas/avvatar-guard';

  var PALETTES = [
    { bg: '#fffcad', fg: '#3b82f6' },
    { bg: '#ffe4e1', fg: '#dc2626' },
    { bg: '#e0f2fe', fg: '#0369a1' },
    { bg: '#dcfce7', fg: '#15803d' },
    { bg: '#fef3c7', fg: '#b45309' },
    { bg: '#f3e8ff', fg: '#7e22ce' },
    { bg: '#fce7f3', fg: '#be185d' },
    { bg: '#ccfbf1', fg: '#0f766e' },
    { bg: '#ede9fe', fg: '#4c1d95' },
    { bg: '#ffedd5', fg: '#c2410c' },
    { bg: '#e7e5e4', fg: '#1c1917' },
    { bg: '#f0f9ff', fg: '#075985' }
  ];

  function hashSeed(seed) {
    var hash = [];
    var h1 = 0xdeadbeef;
    var h2 = 0x41c6ce57;
    for (var i = 0; i < seed.length; i++) {
      var c = seed.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    var state = h1 + h2;
    for (var j = 0; j < 64; j++) {
      state = Math.imul(state ^ (state >>> 15), 1 | state);
      state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
      hash.push(((state ^ (state >>> 14)) >>> 0) / 4294967296);
    }
    return hash;
  }

  function val(h, i) { return h[i % h.length]; }
  function bool(h, i, t) { return val(h, i) > (t == null ? 0.5 : t); }
  function integer(h, i, min, max) {
    return Math.floor(val(h, i) * (max - min + 1)) + min;
  }

  function generatePattern(seed) {
    var hash = hashSeed(seed);
    var types = ['grid', 'rings', 'blocks', 'diagonal'];
    var type = types[integer(hash, 0, 0, types.length - 1)];
    var gridSize = 5;
    var half = Math.ceil(gridSize / 2);
    var cells = [];
    for (var y = 0; y < gridSize; y++) {
      var row = [];
      for (var x = 0; x < gridSize; x++) {
        var ex = x >= half ? gridSize - 1 - x : x;
        var idx = y * half + ex + 1;
        var filled;
        if (type === 'rings') {
          var d = Math.max(
            Math.abs(ex - Math.floor(gridSize / 2)),
            Math.abs(y - Math.floor(gridSize / 2))
          );
          filled = bool(hash, d + idx, 0.4);
        } else if (type === 'blocks') {
          filled = bool(hash, Math.floor(y / 2) * 3 + Math.floor(ex / 2) + 1, 0.45);
        } else if (type === 'diagonal') {
          filled = bool(hash, idx, 0.35 + ((ex + y) % 3) * 0.15);
        } else {
          filled = bool(hash, idx, 0.5);
        }
        row.push(filled);
      }
      cells.push(row);
    }
    return { cells: cells, hash: hash };
  }

  function renderSVG(seed, size) {
    var p = generatePattern(seed);
    var palette = PALETTES[Math.floor(p.hash[1] * PALETTES.length) % PALETTES.length];
    var cellSize = size / 5;
    var rects = '';
    for (var y = 0; y < 5; y++) {
      for (var x = 0; x < 5; x++) {
        if (p.cells[y][x]) {
          rects += '<rect x="' + (x * cellSize) + '" y="' + (y * cellSize) +
            '" width="' + cellSize + '" height="' + cellSize +
            '" fill="' + palette.fg + '"/>';
        }
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size +
      '" width="' + size + '" height="' + size +
      '" shape-rendering="crispEdges" style="display:inline-block;vertical-align:middle;border-radius:3px">' +
      '<rect width="' + size + '" height="' + size + '" fill="' + palette.bg + '"/>' +
      rects + '</svg>';
  }

  function init() {
    var els = document.querySelectorAll('[data-avvatar-seed]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.getAttribute('data-avvatar-rendered') === 'true') continue;
      var seed = el.getAttribute('data-avvatar-seed');
      if (!seed) continue;
      var size = parseInt(el.getAttribute('data-avvatar-size') || '32', 10);
      var href = el.getAttribute('data-avvatar-href') || DEFAULT_HREF;
      var showLabel = el.getAttribute('data-avvatar-label') === 'true';

      var svg = renderSVG(seed, size);
      var title = 'Domain fingerprint for ' + seed +
        '. If you have Avvatar Guard installed, this pattern should match the icon in your browser. If not, this may not be the real site.';

      var html = '<a href="' + href + '" target="_blank" rel="noopener" title="' +
        title.replace(/"/g, '&quot;') +
        '" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:inherit">' +
        svg +
        (showLabel ? '<span style="font-size:12px;opacity:0.7">' + seed + '</span>' : '') +
        '</a>';

      el.innerHTML = html;
      el.setAttribute('data-avvatar-rendered', 'true');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual re-init if DOM changes
  if (typeof window !== 'undefined') {
    window.AvvatarEmbed = { init: init, renderSVG: renderSVG };
  }
})();
