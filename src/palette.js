// Derives a foreground/background color pair from the avvatar hash.
// Gives each domain a distinct color signature on top of the pattern —
// so `google.com` and `g00gle.com` differ visually in both ways.
// This is an Avvatar Guard addition; not part of the upstream avvatars library.

const PALETTES = [
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
  { bg: '#f0f9ff', fg: '#075985' },
];

export function paletteForHash(hash) {
  const index = Math.floor(hash[1] * PALETTES.length) % PALETTES.length;
  return PALETTES[index];
}
