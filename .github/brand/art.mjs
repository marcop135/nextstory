// Next Story brand art: writes og.svg (centered name and one line) and
// readme-{light,dark}.svg / social.svg (name beside a page list).
// Fonts stay as /* @fonts:start */ … /* @fonts:end */ markers for render.mjs.
// Run from the repository root: node .github/brand/art.mjs, then
// npm run brand:render, then node scripts/round-readme-images.mjs.
import { writeFileSync } from "node:fs";

const root = new URL("../../", import.meta.url);

const TAGLINE = "A marketing site is more than its pages.";
const MONO = "NEXT.JS + STORYBLOK CMS DEMO";

const STYLE = `  <style>
    /* @fonts:start */ /* @fonts:end */
    .title { font-family: 'Source Sans 3', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
    .tag { font-family: 'Source Sans 3', sans-serif; font-weight: 400; }
    .page { font-family: 'Source Sans 3', sans-serif; font-weight: 500; }
    .mono { font-family: 'Roboto Mono', monospace; font-weight: 400; letter-spacing: 1.5px; }
  </style>`;

/** Site tokens from .github/brand/tokens.json. */
const OG = {
  from: "#EFF7FB",
  to: "#F9FCFE",
  text: "#101C28",
  muted: "#555F69",
  accent: "#006C7D",
};

const README = {
  light: {
    bg: "#EFF7FB",
    surface: "#FFFFFF",
    text: "#101C28",
    muted: "#555F69",
    border: "#C8D3D9",
    accent: "#006C7D",
    grid: "#DCE8EE",
    shadow: "rgba(16,28,40,0.12)",
  },
  dark: {
    bg: "#091018",
    surface: "#141E28",
    text: "#E8F0F4",
    muted: "#9DADB9",
    border: "#293442",
    accent: "#5EC6EC",
    grid: "#12202C",
    shadow: "rgba(0,0,0,0.55)",
  },
};

const PAGES = [
  { name: "How it works" },
  { name: "Blocks" },
  { name: "Campaign workshop" },
  { name: "For agents" },
];

function ogArt(p, { width, height, label }) {
  const cx = width / 2;
  const top = height / 2 - 90;
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
  <text class="mono" x="${cx}" y="${top}" text-anchor="middle" font-size="22" fill="${p.accent}">${MONO}</text>
  <text class="title" x="${cx}" y="${top + 110}" text-anchor="middle" font-size="104" fill="${p.text}">Next <tspan fill="${p.accent}">Story</tspan></text>
  <text class="tag" x="${cx}" y="${top + 178}" text-anchor="middle" font-size="34" fill="${p.muted}" data-fit-w="900">${TAGLINE}</text>
</svg>
`;
}

function readmeArt(p, { width, height, label }) {
  // Equal space left of the wordmark, between it and the page list, and right of the list.
  const x0 = 96;
  const px = 729;
  const py = 56;
  const pw = 440;
  const ph = 520;
  const fold = 72;
  const outline = `M${px} ${py + 14}a14 14 0 0 1 14-14H${px + pw - 14}a14 14 0 0 1 14 14V${py + ph - fold}L${px + pw - fold} ${py + ph}H${px + 14}a14 14 0 0 1-14-14z`;
  const rowY = (i) => py + 88 + i * 88;
  const rows = PAGES.map(
    (page, i) => `<rect x="${px + 24}" y="${rowY(i)}" width="${pw - 48}" height="72" rx="12" fill="${p.surface}" stroke="${p.border}"/>
    <rect x="${px + 24}" y="${rowY(i)}" width="6" height="72" rx="3" fill="${p.accent}"/>
    <text class="page" x="${px + 52}" y="${rowY(i) + 46}" font-size="28" fill="${p.text}">${page.name}</text>`,
  ).join("\n    ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
  <title>Next Story</title>
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${p.grid}" stroke-width="1"/></pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="${p.shadow}"/></filter>
    <filter id="lift" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="-6" dy="-6" stdDeviation="8" flood-color="${p.shadow}"/></filter>
  </defs>
${STYLE}
  <rect width="${width}" height="${height}" fill="${p.bg}"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  <path d="${outline}" fill="${p.surface}" stroke="${p.border}" stroke-width="1.5" filter="url(#shadow)"/>
  <text class="mono" x="${px + 26}" y="${py + 62}" font-size="22" letter-spacing="2" fill="${p.muted}">PAGES</text>
  ${rows}
  <path d="M${px + pw} ${py + ph - fold}L${px + pw - fold} ${py + ph}L${px + pw - fold} ${py + ph - fold}z" fill="${p.accent}" filter="url(#lift)"/>
  <rect x="${x0}" y="${213}" width="20" height="20" fill="${p.accent}"/>
  <text class="mono" x="${x0 + 34}" y="${232}" font-size="22" fill="${p.muted}">${MONO}</text>
  <text class="title" x="${x0}" y="${364}" font-size="120" fill="${p.text}">Next <tspan fill="${p.accent}">Story</tspan></text>
  <text class="tag" x="${x0}" y="${440}" font-size="33" fill="${p.text}" data-fit-w="600">${TAGLINE}</text>
</svg>
`;
}

const README_LABEL =
  "Next Story, Next.js + Storyblok CMS Demo: a marketing site is more than its pages. A page list with a folded corner: How it works, Blocks, Campaign workshop, For agents";

writeFileSync(new URL(".github/brand/og.svg", root), ogArt(OG, { width: 1200, height: 630, label: `Next Story: ${TAGLINE}` }));
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
