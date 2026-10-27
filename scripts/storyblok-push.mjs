/**
 * Push storyblok/components.json and storyblok/stories/*.json to the space.
 *
 *   node scripts/storyblok-push.mjs --only-story home --snapshot baseline.json
 *   node scripts/storyblok-push.mjs --only-story home --baseline baseline.json
 *   node scripts/storyblok-push.mjs --bootstrap [--dry-run] [--publish]
 *
 * Writes go to the live space: components are created or replaced by name,
 * stories by slug. Publishing requires --publish; overwrites require a baseline.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { loadSeed, syncSpace } from "./lib/storyblok-sync.mjs";

const token = process.env.STORYBLOK_PERSONAL_ACCESS_TOKEN?.trim();
const spaceId = process.env.STORYBLOK_SPACE_ID?.trim();
const region = (process.env.STORYBLOK_REGION || "eu").trim();
const options = { onlyStories: [], onlyComponents: [], publish: false };
let snapshotPath;
let baselinePath;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 1) {
  const flag = args[i];
  if (["--only-story", "--only-component", "--snapshot", "--baseline"].includes(flag)) {
    const value = args[++i];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${flag}`);
    if (flag === "--only-story") options.onlyStories.push(value);
    if (flag === "--only-component") options.onlyComponents.push(value);
    if (flag === "--snapshot") snapshotPath = value;
    if (flag === "--baseline") baselinePath = value;
  } else if (flag === "--publish") options.publish = true;
  else if (flag === "--draft") options.draft = true;
  else if (flag === "--dry-run") options.dryRun = true;
  else if (flag === "--bootstrap") options.bootstrap = true;
  else throw new Error(`Unknown option: ${flag}`);
}
if (options.publish && options.draft) throw new Error("Choose --publish or --draft, not both.");
if (snapshotPath && (baselinePath || options.publish || options.dryRun || options.bootstrap)) {
  throw new Error("--snapshot is read-only; do not combine it with --baseline, --publish, --dry-run, or --bootstrap.");
}
if (baselinePath) options.baseline = JSON.parse(readFileSync(baselinePath, "utf8"));

if (!token || !spaceId) {
  console.error("Set STORYBLOK_PERSONAL_ACCESS_TOKEN and STORYBLOK_SPACE_ID.");
  process.exit(1);
}

const host = region === "eu" ? "mapi.storyblok.com" : `api-${region}.storyblok.com`;
const base = `https://${host}/v1/spaces/${spaceId}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(method, path, body) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    // Free plans allow about three Management API calls per second.
    await sleep(350);
    const res = await fetch(base + path, {
      method,
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429) continue;
    if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${(await res.text()).slice(0, 300)}`);
    return res.status === 204 ? {} : res.json();
  }
  throw new Error(`${method} ${path}: rate limited`);
}

const result = await syncSpace({ request, ...loadSeed(), ...options, snapshot: Boolean(snapshotPath) });
if (snapshotPath) {
  writeFileSync(snapshotPath, `${JSON.stringify(result, null, 2)}\n`, { flag: "wx" });
  console.log(`remote story snapshot saved to ${snapshotPath}`);
} else console.log(options.dryRun ? "dry run complete" : "selected seeds synced");
