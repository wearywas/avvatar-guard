import { getRegistrableDomain } from './domain.js';
import { getDomainStatus } from './status.js';

const BADGE = {
  ok: { text: '✓', color: '#15803d' },
  warn: { text: '!', color: '#dc2626' },
  neutral: { text: '', color: '#00000000' },
};

function setBadge(tabId, { text, color }) {
  chrome.action.setBadgeText({ tabId, text }).catch(() => {});
  chrome.action.setBadgeBackgroundColor({ tabId, color }).catch(() => {});
}

async function updateBadgeForTab(tabId, url) {
  if (!url) return setBadge(tabId, BADGE.neutral);
  let domain;
  try { domain = getRegistrableDomain(new URL(url).hostname); }
  catch { return setBadge(tabId, BADGE.neutral); }

  const { state } = await getDomainStatus(domain);
  if (state === 'user-pinned' || state === 'builtin') return setBadge(tabId, BADGE.ok);
  if (state === 'warning') return setBadge(tabId, BADGE.warn);
  setBadge(tabId, BADGE.neutral);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' || changeInfo.url) {
    updateBadgeForTab(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    updateBadgeForTab(tabId, tab.url);
  } catch {}
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === 'pins-updated') {
    chrome.tabs.query({}, (tabs) => {
      for (const t of tabs) updateBadgeForTab(t.id, t.url);
    });
  }
});
