# Avvatar Guard

A browser extension that gives every domain a deterministic visual fingerprint — so you can spot lookalike phishing sites at a glance.

<p align="center">
  <img src="./avvatar-guard-demo.gif" alt="Avvatar Guard demo: pinning a known site, visiting a typo-squat, seeing the pattern + color mismatch warning" width="600" />
</p>

Pin the real `google.com` once. The next time you land on `g00gle.com`, the extension notices the domain is typographically close to something you've already trusted (or something on the built-in list of well-known sites), and warns you. The avvatars for the two domains look completely different in both pattern and color, so the mismatch is obvious.

## How it works

For the current tab's domain, Avvatar Guard checks four states:

- **✓ Pinned by you** → you explicitly marked this site as known-good
- **✓ Known site (built-in)** → the domain ships in our built-in list of common phish targets
- **⚠ Looks similar to a protected site** → not pinned, but within 1–2 edits of something that is. Likely a typo-squat.
- **Not yet protected** → no nearby match. Neutral badge.

## Install (unpacked)

1. Clone the repo:

   ```bash
   git clone https://github.com/wearywas/avvatar-guard.git
   ```

   (Or [download the ZIP](https://github.com/wearywas/avvatar-guard/archive/refs/heads/main.zip) if you don't have git.)

2. Open `chrome://extensions` in Chrome, Brave, or any Chromium browser
3. Enable **Developer mode** (toggle in the top-right)
4. Click **Load unpacked** and select the `avvatar-guard` folder you just cloned
5. Pin the extension to your toolbar — the icon lives in the puzzle-piece menu by default

## Credits

Built on [avvatars](https://github.com/visualizevalue/avvatars) by [Visualize Value](https://visualizevalue.com). The generator algorithm is vendored unmodified in `src/vendor/avvatar.js`. Color palette, lookalike detection, and browser integration are Avvatar Guard additions.

Domain parsing uses [tldts](https://github.com/remusao/tldts) (MIT) vendored at `src/vendor/tldts.js`.

## Structure

```
avvatar-guard/
├── manifest.json
├── icons/                     # toolbar icons, seeded with "github.com" so they match what the extension renders on this repo's page
├── seed/top-domains.json      # built-in list of common phish targets
└── src/
    ├── popup.html / popup.css / popup.js
    ├── background.js          # service worker, sets badge per tab
    ├── domain.js              # getRegistrableDomain + Levenshtein + findLookalikes
    ├── status.js              # combined lookup: pins + built-in → state
    ├── palette.js             # color pairs keyed by hash
    └── vendor/
        ├── avvatar.js         # verbatim port of visualizevalue/avvatars
        └── tldts.js           # PSL parser for proper eTLD+1
```

## Status

v0.2 — local-only, manual pinning + curated built-in list of common phish targets, PSL-based domain parsing, icons. No content script yet.

---

Also from me: [Memorandai](https://memorandai.com) — a local-first, multi-model knowledge studio for your desktop. Same "your stuff, your machine" ethos, different surface area.

## License

[WTFPL](./LICENSE) — matching the upstream avvatars license.
