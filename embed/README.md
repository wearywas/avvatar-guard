# Avvatar Guard – Embed Widget

A companion widget to the [Avvatar Guard browser extension](../README.md). Drop it into your site's footer so visitors with the extension can confirm they're on the real site by matching the footer icon to their browser's toolbar icon.

## Why this works

- **You ship it on `yoursite.com`.** The widget renders `yoursite.com`'s fingerprint.
- **The extension on a visitor's browser also renders `yoursite.com`'s fingerprint.** They match → confirmation.
- **A phisher clones your footer verbatim.** Their domain is `yoursite-login.com`. The extension on the visitor's browser renders `yoursite-login.com`'s fingerprint → doesn't match the cloned footer → phish exposed.
- **A phisher regenerates the avvatar for their own domain.** The footer no longer matches what the returning visitor is used to seeing on the real site → still exposed.

The widget has no value without the extension, but together they form a visual trust signal that's cheap to adopt and hard to spoof.

## Integration

### Vanilla HTML / any site

Copy `avvatar-embed.js` into your site and include it:

```html
<span data-avvatar-seed="yoursite.com" data-avvatar-size="32"></span>
<script src="/avvatar-embed.js" defer></script>
```

Data attributes:

| Attribute | Default | Notes |
|---|---|---|
| `data-avvatar-seed` | (required) | Usually your domain. |
| `data-avvatar-size` | `32` | Pixel size. |
| `data-avvatar-href` | Avvatar Guard repo | Where the icon links to. |
| `data-avvatar-label` | `false` | `true` shows the seed next to the icon. |

### Astro

Copy `Avvatar.astro` into `src/components/` and use it directly:

```astro
---
import Avvatar from '../components/Avvatar.astro';
---

<Avvatar seed="yoursite.com" size={32} />
<Avvatar seed="yoursite.com" size={24} label href="https://github.com/you/avvatar-guard" />
```

Server-rendered at build time — zero client JS cost.

### React / Next / other frameworks

Use the vanilla `avvatar-embed.js` as a `<script>` in your root layout. Or copy the SVG-generation logic from `Avvatar.astro` (it's pure functions) into a component in your framework of choice.

## Local demo

Open `example.html` in a browser to see it in action with several seeds.

## Guidance for visitors

Somewhere near the widget, consider adding a line like:

> This pattern should match the Avvatar Guard icon in your browser. If they don't match, this might not be the real site.

That one line multiplies the widget's value by explaining what to do with it.

## License

WTFPL — same as the upstream `avvatars` algorithm.
