/** Read-only checks for public representations, catalogs, and discovery links.
 * Run: npm run verify:agent-readiness -- <base-url>.
 * Exit 0 when all assertions pass, nonzero on request or contract failure.
 */
import assert from "node:assert/strict";

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const get = (path) => fetch(base + path, { redirect: "manual" });
const portal = await get("/for-agents");
assert.equal(portal.status, 200);
const portalHtml = await portal.text();
const catalogRes = await get("/.well-known/api-catalog");
assert.equal(catalogRes.status, 200);
assert.match(catalogRes.headers.get("content-type"), /application\/linkset\+json/);
const catalog = await catalogRes.json();
let checked = 2;
for (const item of catalog.linkset[0].item) {
  const path = new URL(item.href).pathname;
  const res = await get(path);
  assert.equal(res.status, 200, path);
  assert.ok(res.headers.get("content-type")?.startsWith(item.type), `${path}: ${res.headers.get("content-type")}`);
  assert.ok(portalHtml.includes(path), `Portal does not advertise ${path}`);
  checked++;
}
for (const [htmlPath, mdPath, phrase] of [["/", "/content/index.md", "What changes in the CMS"], ["/de", "/content/de/index.md", "Texte und Übersetzungen"], ["/how-it-works", "/content/how-it-works.md", "setComponents(storyblokComponents)"], ["/de/blocks", "/content/de/blocks.md", "Erlaubte Blöcke im Schema festlegen"]]) {
  const html = await (await get(htmlPath)).text();
  const md = await (await get(mdPath)).text();
  assert.ok(html.includes(phrase), `${htmlPath}: ${phrase}`);
  assert.ok(md.includes(phrase), `${mdPath}: ${phrase}`);
  assert.ok(html.includes(mdPath), `${htmlPath}: missing Markdown alternate`);
  assert.match(md, /Canonical: https:\/\/nextstory\.marcopontili\.com\//);
  assert.ok(!md.includes("__i18n__"));
  checked += 2;
}
for (const path of ["/content/config.md", "/content/de/config.md", "/content/missing-story.md", "/content/fr/index.md", "/content/api/preview.md"]) {
  assert.equal((await get(path)).status, 404, path);
  checked++;
}
const blocks = await (await get("/content/blocks.json")).json();
assert.ok(blocks.blocks.some((b) => b.name === "comparison_table" && b.fields.some((f) => f.name === "table" && f.translatable)));
assert.ok(blocks.blocks.some((b) => b.name === "code_example"));
const openapi = await (await get("/openapi.json")).json();
assert.equal(openapi.openapi, "3.1.0");
for (const item of catalog.linkset[0].item) assert.ok(openapi.paths[new URL(item.href).pathname]);
assert.equal((await (await get("/.well-known/agent-skills/index.json")).json()).skills.length, 3);
console.log(`ok agent readiness: ${checked} resource/representation checks against ${base}`);
