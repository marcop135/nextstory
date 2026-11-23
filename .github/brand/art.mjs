// Next Story brand art: writes og.svg and readme-{light,dark}.svg / social.svg.
// Left: mono label, wordmark, one-line tagline. Right: named pages.
// Fonts stay as /* @fonts:start */ … /* @fonts:end */ markers for render.mjs.
// Run from the repository root: node .github/brand/art.mjs, then
// npm run brand:render, then node scripts/round-readme-images.mjs.
import { writeFileSync } from "node:fs";

const root = new URL("../../", import.meta.url);

const TAGLINE = "A marketing site is more than its pages.";
const MONO = "NEXT.JS + STORYBLOK CMS DEMO";

const STYLE = `  <style>
    /* @fonts:start */ /* @fonts:end */
    .title { font-family: 'Source Sans 3', sans-serif; font-weight: 500; letter-spacing: -0.025em; }
    .tag { font-family: 'Source Sans 3', sans-serif; font-weight: 400; }
    .page { font-family: 'Source Sans 3', sans-serif; font-weight: 500; }
    .eyebrow { font-family: 'Source Sans 3', sans-serif; font-weight: 600; letter-spacing: 0.06em; }
    .mono { font-family: 'Roboto Mono', monospace; font-weight: 400; }
  </style>`;

/** Wordmark and tagline share the safe-area left edge. */
const LEFT = 80;

const OG = {
  from: "#EFF7FB",
  to: "#F9FCFE",
  text: "#101C28",
  muted: "#555F69",
  accent: "#006C7D",
};

const README = {
  light: {
    groundFrom: "#EFF7FB",
    groundTo: "#F9FCFE",
    text: "#101C28",
    accent: "#006C7D",
    card: "#FFFFFF",
    cardBorder: "#C8D3D9",
    label: "#00756B",
    barMuted: "#9AA7B0",
    barSoft: "#EFF7FB",
    ctaFill: "#006C7D",
    ctaBar: "#7FB6BE",
    shadow: "#101C28",
    shadowOpacity: "0.1",
    heroLabelFill: "#FFFFFF",
    heroLabelStroke: "#006C7D",
    heroLabelText: "#006C7D",
    gridLabelFill: "#00756B",
    gridLabelStroke: "#00756B",
    gridLabelText: "#FFFFFF",
    ctaLabelFill: "#FFFFFF",
    ctaLabelStroke: "#006C7D",
    ctaLabelText: "#006C7D",
  },
  dark: {
    groundFrom: "#091018",
    groundTo: "#0E1721",
    text: "#E8F0F4",
    accent: "#5EC6EC",
    card: "#141E28",
    cardBorder: "#293442",
    label: "#52D7C1",
    barMuted: "#414F5D",
    barSoft: "#0D141E",
    ctaFill: "#0B3A4C",
    ctaBar: "#5EC6EC",
    shadow: "#000000",
    shadowOpacity: "0.45",
    heroLabelFill: "#141E28",
    heroLabelStroke: "#5EC6EC",
    heroLabelText: "#5EC6EC",
    gridLabelFill: "#52D7C1",
    gridLabelStroke: "#52D7C1",
    gridLabelText: "#091018",
    ctaLabelFill: "#141E28",
    ctaLabelStroke: "#5EC6EC",
    ctaLabelText: "#5EC6EC",
  },
};

function ogArt(p, { width, height, label }) {
  const cx = width / 2;
  const top = height / 2 - 110;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
  <title>Next Story</title>
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.from}"/>
      <stop offset="1" stop-color="${p.to}"/>
    </linearGradient>
  </defs>
${STYLE}
  <rect width="${width}" height="${height}" fill="url(#ground)"/>
  <text class="eyebrow" x="${cx}" y="${top}" text-anchor="middle" font-size="22" fill="${p.accent}">${MONO}</text>
  <text class="title" x="${cx}" y="${top + 128}" text-anchor="middle" font-size="104" fill="${p.text}">Next <tspan fill="${p.accent}">Story</tspan></text>
  <text class="tag" x="${cx}" y="${top + 206}" text-anchor="middle" font-size="34" fill="${p.muted}">${TAGLINE}</text>
</svg>
`;
}

function readmeArt(p, { width, height, label }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
  <title>Next Story</title>
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.groundFrom}"/>
      <stop offset="1" stop-color="${p.groundTo}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="${p.shadow}" flood-opacity="${p.shadowOpacity}"/>
    </filter>
  </defs>
${STYLE}
  <rect width="${width}" height="${height}" fill="url(#ground)"/>
  <rect x="${LEFT}" y="80" width="344" height="58" rx="8" fill="none" stroke="${p.cardBorder}"/>
  <text class="mono" x="${LEFT + 16}" y="96" dominant-baseline="text-before-edge" font-size="20" fill="${p.accent}" textLength="312" lengthAdjust="spacingAndGlyphs">${MONO}</text>
  <text class="title" x="${LEFT - 2}" y="292" font-size="120" fill="${p.text}" data-fit-w="600">Next <tspan fill="${p.accent}">Story</tspan></text>
  <text class="tag" x="${LEFT}" y="372" font-size="30" fill="${p.text}" data-fit-w="560">${TAGLINE}</text>
  <g filter="url(#shadow)">
    <rect x="714" y="124" width="470" height="120" rx="14" fill="${p.card}" stroke="${p.cardBorder}" stroke-width="2"/>
    <rect x="714" y="288" width="470" height="120" rx="14" fill="${p.card}" stroke="${p.cardBorder}" stroke-width="2"/>
    <rect x="714" y="452" width="470" height="84" rx="14" fill="${p.ctaFill}"/>
  </g>
  <rect x="742" y="158" width="280" height="20" rx="10" fill="${p.barMuted}"/>
  <rect x="742" y="194" width="120" height="20" rx="10" fill="${p.accent}"/>
  <rect x="738" y="316" width="130" height="68" rx="10" fill="${p.barSoft}" stroke="${p.cardBorder}" stroke-width="1.5"/>
  <rect x="884" y="316" width="130" height="68" rx="10" fill="${p.barSoft}" stroke="${p.cardBorder}" stroke-width="1.5"/>
  <rect x="1030" y="316" width="130" height="68" rx="10" fill="${p.barSoft}" stroke="${p.cardBorder}" stroke-width="1.5"/>
  <rect x="742" y="484" width="220" height="20" rx="10" fill="${p.ctaBar}"/>
  <rect x="706" y="280" width="486" height="136" rx="18" fill="none" stroke="${p.label}" stroke-width="3" stroke-dasharray="10 7"/>
  <rect x="1074.4" y="103.2" width="93.6" height="41.6" rx="10.4" fill="${p.heroLabelFill}" stroke="${p.heroLabelStroke}" stroke-width="2"/>
  <text class="page" x="1121.2" y="132.32" text-anchor="middle" font-size="26" fill="${p.heroLabelText}">Home</text>
  <rect x="949.6" y="261.2" width="218.4" height="41.6" rx="10.4" fill="${p.gridLabelFill}" stroke="${p.gridLabelStroke}" stroke-width="2"/>
  <text class="page" x="1058.8" y="290.32" text-anchor="middle" font-size="26" fill="${p.gridLabelText}">Blocks</text>
  <rect x="1012" y="431.2" width="156.0" height="41.6" rx="10.4" fill="${p.ctaLabelFill}" stroke="${p.ctaLabelStroke}" stroke-width="2"/>
  <text class="page" x="1090.0" y="460.32" text-anchor="middle" font-size="26" fill="${p.ctaLabelText}">Campaigns</text>
</svg>
`;
}

const README_LABEL =
  "Next Story: a marketing site is more than its pages";

writeFileSync(new URL(".github/brand/og.svg", root), ogArt(OG, { width: 1200, height: 630, label: README_LABEL }));
const outputs = [
  ["readme-light.svg", README.light],
  ["readme-dark.svg", README.dark],
];
for (const [file, palette] of outputs) {
  writeFileSync(new URL(`.github/brand/${file}`, root), readmeArt(palette, { width: 1280, height: 640, label: README_LABEL }));
}
writeFileSync(
  new URL(".github/brand/social.svg", root),
  readmeArt(README.light, { width: 1280, height: 640, label: README_LABEL }),
);
console.log(`Wrote og.svg, social.svg, ${outputs.map(([file]) => file).join(", ")}`);
