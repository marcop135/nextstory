/**
 * Smoke-test a running build: every journey route answers, German routes serve
 * German, the config story stays private, and the sitemap lists the journey.
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
  ["/privacy", "en", "Privacy"],
  ["/for-agents", "en", "For agents"],
];

const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
};

for (const [path, lang, text] of pages) {
  const res = await fetch(base + path);
  const html = await res.text();
  check(res.status === 200, `${path}: status ${res.status}`);
  check(html.includes(`<html lang="${lang}"`), `${path}: missing <html lang="${lang}">`);
  check(html.includes(text), `${path}: missing "${text}"`);
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
console.log(`ok ${pages.length} pages, links, 404s, and sitemap against ${base}`);
