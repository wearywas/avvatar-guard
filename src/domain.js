import { getDomain } from './vendor/tldts.js';

// Proper eTLD+1 extraction via the Public Suffix List.
// Handles multi-level TLDs (amazon.co.uk → amazon.co.uk, not co.uk).
// Returns null for localhost, IPs, and invalid hostnames.
export function getRegistrableDomain(hostname) {
  if (!hostname) return null;
  return getDomain(hostname);
}

// Iterative Levenshtein distance. Tiny inputs (domain names), so the
// O(n*m) matrix is fine.
export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      );
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

// Returns domains from the candidate pool that look like `candidate` but
// aren't it. Threshold scales with length so short domains don't match noise.
export function findLookalikes(candidate, pool) {
  if (!candidate) return [];
  const threshold = candidate.length <= 6 ? 1 : 2;
  const matches = [];
  for (const other of pool) {
    if (other === candidate) continue;
    const d = levenshtein(candidate, other);
    if (d > 0 && d <= threshold) matches.push({ domain: other, distance: d });
  }
  return matches.sort((a, b) => a.distance - b.distance);
}
