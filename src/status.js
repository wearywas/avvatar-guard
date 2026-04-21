// Combined domain-status lookup used by both the popup and the background
// service worker. State values:
//   'user-pinned' — user explicitly pinned this domain
//   'builtin'     — domain is in the shipped top-domains list
//   'warning'     — not pinned, but typographically close to one that is
//   'unknown'     — never seen, no nearby pins
//   'none'        — no domain on the tab (chrome://, about:blank, etc.)

import { findLookalikes } from './domain.js';

const TOP_DOMAINS_URL = chrome.runtime.getURL('seed/top-domains.json');

let builtinCache = null;
export async function getBuiltinDomains() {
  if (builtinCache) return builtinCache;
  const res = await fetch(TOP_DOMAINS_URL);
  builtinCache = await res.json();
  return builtinCache;
}

export async function getPins() {
  const { pins = {} } = await chrome.storage.local.get('pins');
  return pins;
}

export async function setPin(domain, pinned) {
  const pins = await getPins();
  if (pinned) pins[domain] = { pinnedAt: Date.now() };
  else delete pins[domain];
  await chrome.storage.local.set({ pins });
}

export async function getDomainStatus(domain) {
  if (!domain) return { state: 'none', lookalikes: [] };
  const [pins, builtin] = await Promise.all([getPins(), getBuiltinDomains()]);
  if (pins[domain]) return { state: 'user-pinned', lookalikes: [] };
  if (builtin.includes(domain)) return { state: 'builtin', lookalikes: [] };
  const lookalikes = findLookalikes(domain, [
    ...Object.keys(pins),
    ...builtin,
  ]);
  return {
    state: lookalikes.length > 0 ? 'warning' : 'unknown',
    lookalikes,
  };
}
