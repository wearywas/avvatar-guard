import { generatePattern, renderSVG } from './vendor/avvatar.js';
import { paletteForHash } from './palette.js';
import { getRegistrableDomain } from './domain.js';
import { getDomainStatus, setPin } from './status.js';

const AVVATAR_SIZE = 160;

function renderAvvatar(seed) {
  const pattern = generatePattern({ seed, gridSize: 5, symmetric: true });
  const palette = paletteForHash(pattern.hash);
  return renderSVG(pattern, {
    size: AVVATAR_SIZE,
    foreground: palette.fg,
    background: palette.bg,
    padding: 0,
  });
}

async function getCurrentDomain() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;
  try {
    return getRegistrableDomain(new URL(tab.url).hostname);
  } catch {
    return null;
  }
}

function el(id) { return document.getElementById(id); }

async function render() {
  const domain = await getCurrentDomain();
  const slot = el('avvatar-slot');
  const domainEl = el('domain');
  const statusEl = el('status');
  const warningEl = el('warning');
  const pinBtn = el('pin-btn');

  if (!domain) {
    slot.innerHTML = '';
    domainEl.textContent = '—';
    statusEl.textContent = 'No domain on this tab.';
    statusEl.className = 'status neutral';
    warningEl.classList.add('hidden');
    pinBtn.disabled = true;
    return;
  }

  slot.innerHTML = renderAvvatar(domain);
  domainEl.textContent = domain;
  pinBtn.disabled = false;
  warningEl.classList.add('hidden');

  const { state, lookalikes } = await getDomainStatus(domain);

  if (state === 'user-pinned') {
    statusEl.textContent = '✓ Pinned as known-good';
    statusEl.className = 'status ok';
    pinBtn.textContent = 'Unpin';
    pinBtn.classList.remove('primary');
    pinBtn.style.display = '';
    pinBtn.onclick = async () => {
      await setPin(domain, false);
      chrome.runtime.sendMessage({ type: 'pins-updated' }).catch(() => {});
      render();
    };
  } else if (state === 'builtin') {
    statusEl.textContent = '✓ Known site (built-in)';
    statusEl.className = 'status ok';
    pinBtn.style.display = 'none';
  } else if (state === 'warning') {
    statusEl.textContent = '';
    statusEl.className = 'status neutral';
    const list = lookalikes.slice(0, 3).map(l => l.domain).join(', ');
    warningEl.textContent = `⚠ This domain looks similar to a protected site: ${list}. If you meant to visit that site, double-check the URL.`;
    warningEl.classList.remove('hidden');
    pinBtn.textContent = 'Pin as known-good';
    pinBtn.classList.add('primary');
    pinBtn.style.display = '';
    pinBtn.onclick = async () => {
      await setPin(domain, true);
      chrome.runtime.sendMessage({ type: 'pins-updated' }).catch(() => {});
      render();
    };
  } else {
    statusEl.textContent = 'Not yet protected';
    statusEl.className = 'status neutral';
    pinBtn.textContent = 'Pin as known-good';
    pinBtn.classList.add('primary');
    pinBtn.style.display = '';
    pinBtn.onclick = async () => {
      await setPin(domain, true);
      chrome.runtime.sendMessage({ type: 'pins-updated' }).catch(() => {});
      render();
    };
  }
}

render();
