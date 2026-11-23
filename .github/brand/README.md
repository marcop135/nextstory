# Brand images

`art.mjs` writes the SVG sources. `readme-light.svg` and `readme-dark.svg` are the
README header sources (`readme-light.png` / `readme-dark.png`, 2560x1280),
selected by a single `<picture>` element using `prefers-color-scheme`.
`social.svg` → `social.png` (1280x640, GitHub Settings > Social preview).
`og.svg` → `public/og.png` and `public/og.jpg` (1200x630; the site's Open Graph
image is the JPEG). All outputs are listed in `brand.config.json`.

The README header pairs the wordmark and one-line marketing-site tagline with
Home, Blocks, and Campaigns labels. Page names use weight 500 and the tagline
uses weight 400. Light and dark palettes come from `tokens.json`.

From the repository root:

```bash
node .github/brand/art.mjs
npm run brand:render
node scripts/round-readme-images.mjs
```

`npm run brand:check` checks fonts, layout, dimensions, size limits, and stale
output without writing files. Source Sans 3 (wordmark, tagline) and Roboto Mono
(block names) are embedded under SIL OFL 1.1 (licenses in `fonts/`).
`render.mjs` and `embed-fonts.mjs` are vendored from the marcopontili.com
repo-brand kit; do not edit them here.
