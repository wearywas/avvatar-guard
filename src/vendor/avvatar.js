// Ported verbatim from visualizevalue/avvatars (WTFPL) — TypeScript stripped to JS.
// Source: https://github.com/visualizevalue/avvatars
// Keeping the algorithm unmodified so our patterns match the upstream tool exactly.

export function hashSeed(seed) {
  const hash = [];
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ char, 2654435761);
    h2 = Math.imul(h2 ^ char, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  let state = h1 + h2;
  for (let i = 0; i < 64; i++) {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    hash.push(((state ^ (state >>> 14)) >>> 0) / 4294967296);
  }

  return hash;
}

export function getHashValue(hash, index) {
  return hash[index % hash.length];
}

export function getHashBool(hash, index, threshold = 0.5) {
  return getHashValue(hash, index) > threshold;
}

export function getHashInt(hash, index, min, max) {
  return Math.floor(getHashValue(hash, index) * (max - min + 1)) + min;
}

export function generatePattern(options) {
  const { seed, gridSize = 5, symmetric = true } = options;
  const hash = hashSeed(seed);

  const types = ['grid', 'rings', 'blocks', 'diagonal'];
  const type = types[getHashInt(hash, 0, 0, types.length - 1)];

  const cells = [];
  const halfWidth = symmetric ? Math.ceil(gridSize / 2) : gridSize;

  for (let y = 0; y < gridSize; y++) {
    const row = [];
    for (let x = 0; x < gridSize; x++) {
      const effectiveX = symmetric && x >= halfWidth ? gridSize - 1 - x : x;
      const index = y * halfWidth + effectiveX + 1;

      let filled;
      switch (type) {
        case 'rings': {
          const distFromCenter = Math.max(
            Math.abs(effectiveX - Math.floor(gridSize / 2)),
            Math.abs(y - Math.floor(gridSize / 2))
          );
          filled = getHashBool(hash, distFromCenter + index, 0.4);
          break;
        }
        case 'blocks': {
          const blockX = Math.floor(effectiveX / 2);
          const blockY = Math.floor(y / 2);
          filled = getHashBool(hash, blockY * 3 + blockX + 1, 0.45);
          break;
        }
        case 'diagonal': {
          const diag = (effectiveX + y) % 3;
          filled = getHashBool(hash, index, 0.35 + diag * 0.15);
          break;
        }
        default:
          filled = getHashBool(hash, index, 0.5);
      }

      row.push(filled);
    }
    cells.push(row);
  }

  return { cells, type, gridSize, hash };
}

export function renderSVG(pattern, options = {}) {
  const {
    size = 100,
    foreground = '#000000',
    background = '#ffffff',
    padding = 0.15,
  } = options;

  const { cells, gridSize } = pattern;
  const paddingPx = size * padding;
  const innerSize = size - paddingPx * 2;
  const cellSize = innerSize / gridSize;

  let paths = '';
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (cells[y][x]) {
        const px = paddingPx + x * cellSize;
        const py = paddingPx + y * cellSize;
        paths += `<rect x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" fill="${foreground}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
<rect width="${size}" height="${size}" fill="${background}"/>
${paths}
</svg>`;
}

export function avvatar(options = {}) {
  const {
    seed = Math.random().toString(),
    size = 100,
    gridSize = 5,
    foreground = '#000000',
    background = '#ffffff',
    padding = 0.15,
    symmetric = true,
  } = options;

  const pattern = generatePattern({ seed, gridSize, symmetric });
  return renderSVG(pattern, { size, foreground, background, padding });
}
