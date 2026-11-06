import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const tokens = JSON.parse(readFileSync(new URL(".github/brand/tokens.json", root), "utf8"));

for (const theme of ["light", "dark"]) {
  const png = readFileSync(new URL(`.github/brand/readme-${theme}.png`, root)).toString("base64");
  const header = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640" viewBox="0 0 1280 640" role="img" aria-label="Next Story: editors own the content, developers own the components"><defs><clipPath id="rounded-header"><rect width="1280" height="640" rx="24"/></clipPath></defs><image width="1280" height="640" clip-path="url(#rounded-header)" href="data:image/png;base64,${png}"/></svg>\n`;
  writeFileSync(new URL(`.github/brand/readme-${theme}-rounded.svg`, root), header);

  for (const diagram of ["content-flow", "campaign-to-lead"]) {
    const path = new URL(`docs/${diagram}-${theme}.svg`, root);
    let svg = readFileSync(path, "utf8");
    const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
    if (!viewBox) throw new Error(`Missing viewBox: ${fileURLToPath(path)}`);
    const [x, y, width, height] = viewBox.split(/\s+/).map(Number);
    svg = svg.replace(/<rect id="diagram-background"[^>]*\/>/, "");
    svg = svg.replace(/background-color:\s*[^;"]+;?/, "background-color: transparent;");
    const background = `<rect id="diagram-background" x="${x}" y="${y}" width="${width}" height="${height}" rx="16" fill="${tokens[theme].groundFrom}"/>`;
    svg = svg.replace(/(<svg\b[^>]*>)/, `$1${background}`);
    writeFileSync(path, svg);
  }
}
