# Brand images

`readme-light.svg` and `readme-dark.svg` are the README header sources
(`readme-light.png` / `readme-dark.png`, 2560x1280), selected by a single
`<picture>` element using `prefers-color-scheme`. `social.svg` → `social.png`
(1280x640, GitHub Settings > Social preview). `og.svg` → `public/og.png`
(1200x630, the site's Open Graph image). All outputs are listed in
`brand.config.json`. All four share one layout: wordmark and tagline beside a
three-block page whose `feature_grid` carries the Visual Editor selection
outline. The README keeps separate light and dark palettes from `tokens.json`.

With Playwright and sharp available, run `npm run brand:render` from the repo
root; `npm run brand:check` checks fonts, layout, dimensions, size limits, and
stale output without writing files. Source Sans 3 (wordmark, tagline) and Roboto
Mono (block names) are embedded under SIL OFL 1.1 (licenses in `fonts/`). `render.mjs` and
`embed-fonts.mjs` are vendored from the marcopontili.com repo-brand kit;
do not edit them here.
