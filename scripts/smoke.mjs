/**
 * Smoke-test a running build: every journey route answers, German routes serve
 * German, the config story stays private, and the sitemap lists the journey.
 * Each journey page also keeps its title (30 to 65 characters) and meta
 * description (70 to 160) in bounds, and every JSON-LD block parses with each
 * `@id` reference resolving to a node on the same page.
 *
 *   node scripts/smoke.mjs [base-url]   (default http://localhost:3000)
 */
const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

const pages = [
  ["/", "en", "Ship every market from one content model"],
  ["/how-it-works", "en", "From draft to live in four steps"],
  ["/blocks", "en", "Every block on this site"],
  ["/de", "de", "Jeden Markt aus einem Content-Modell bedienen"],
  ["/de/how-it-works", "de", "In vier Schritten vom Entwurf zur Live-Seite"],
  ["/de/blocks", "de", "Jeder Block dieser Site"],
  ["/cache-invalidation", "en", "Cache invalidation"],
  ["/content-relationships", "en", "Content relationships"],
  ["/de/cache-invalidation", "de", "Cache-Invalidierung"],
  ["/de/content-relationships", "de", "Inhalte verknüpfen"],
  ["/privacy", "en", "Privacy"],
  ["/for-agents", "en", "For agents"],
];

const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
};

const decode = (text) =>
  text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

function checkMetadata(path, html) {
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  check(title.length >= 30 && title.length <= 65, `${path}: title is ${title.length} characters (want 30 to 65): "${title}"`);
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  check(
    description.length >= 70 && description.length <= 160,
    `${path}: description is ${description.length} characters (want 70 to 160)`,
  );
}

function checkJsonLd(path, html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)].map((m) => m[1]);
  check(blocks.length > 0, `${path}: no JSON-LD`);
  const defined = new Set();
  const references = [];
  const walk = (value, isNode) => {
    if (Array.isArray(value)) return value.forEach((item) => walk(item, isNode));
    if (!value || typeof value !== "object") return;
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === "@id") references.push(value["@id"]);
    else if (typeof value["@id"] === "string" && isNode) defined.add(value["@id"]);
    for (const [key, child] of Object.entries(value)) {
      if (key !== "@id") walk(child, key === "@graph" || key === "itemListElement");
    }
  };
  for (const block of blocks) {
    try {
      walk(JSON.parse(block), true);
    } catch (error) {
      check(false, `${path}: JSON-LD does not parse (${error.message})`);
    }
  }
  for (const id of references) check(defined.has(id), `${path}: JSON-LD reference ${id} has no node`);
}

for (const [path, lang, text] of pages) {
  const res = await fetch(base + path);
  const html = await res.text();
  check(res.status === 200, `${path}: status ${res.status}`);
  check(html.includes(`<html lang="${lang}"`), `${path}: missing <html lang="${lang}">`);
  check(html.includes(text), `${path}: missing "${text}"`);
  checkMetadata(path, html);
  checkJsonLd(path, html);
  const links = [...html.matchAll(/<a[^>]+href="(\/[^"#]*)"/g)].map((m) => m[1]);
  for (const href of new Set(links)) {
    if (href.startsWith("/api/") || href.endsWith(".txt")) continue;
    const linked = await fetch(base + href, { redirect: "manual" });
    check(linked.status === 200, `${path}: link ${href} answers ${linked.status}`);
  }
}

for (const path of ["/config", "/de/config", "/does-not-exist"]) {
  const res = await fetch(base + path);
  check(res.status === 404, `${path}: expected 404, got ${res.status}`);
}

const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
for (const path of ["/how-it-works", "/de/blocks"]) {
  check(sitemap.includes(`${path}</loc>`), `sitemap.xml: missing ${path}`);
}
check(!sitemap.includes("/config<"), "sitemap.xml: lists the config story");
check(sitemap.includes("hreflang=\"x-default\""), "sitemap.xml: no x-default alternate");
check(!sitemap.includes("/pricing<"), "sitemap.xml: lists the removed Pricing page");
for (const [path, destination] of [["/pricing", "/"], ["/de/pricing", "/de"]]) {
  const res = await fetch(base + path, { redirect: "manual" });
  check(res.status === 308, `${path}: expected permanent redirect`);
  check(new URL(res.headers.get("location"), base).pathname === destination, `${path}: incorrect home destination`);
}

if (failures.length) {
  console.error(`FAIL ${failures.length} problem(s) against ${base}:`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}
console.log(`ok ${pages.length} pages, metadata lengths, JSON-LD, links, 404s, and sitemap against ${base}`);
