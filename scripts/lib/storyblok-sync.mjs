/**
 * Push the content model and seed stories in storyblok/ to a Storyblok space
 * through the Management API. Transport is injected, so the same plan runs
 * from the CLI (personal access token) or any other authenticated client.
 *
 * request(method, path, body) resolves to the parsed JSON response and throws
 * on a non-2xx status. Paths are relative to /v1/spaces/<space id>.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export function loadSeed(root = "storyblok") {
  const components = JSON.parse(readFileSync(join(root, "components.json"), "utf8"));
  const stories = readdirSync(join(root, "stories"))
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(readFileSync(join(root, "stories", file), "utf8")));
  return { components, stories };
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

function same(a, b) {
  return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
}

function storyState(story, includeUuid = false) {
  return {
    name: story.name,
    slug: story.slug,
    content: story.content,
    ...(includeUuid && story.uuid ? { uuid: story.uuid } : {}),
  };
}

async function findStory(request, slug) {
  const matches = [];
  for (let page = 1; ; page += 1) {
    const found = await request("GET", `/stories?with_slug=${encodeURIComponent(slug)}&per_page=100&page=${page}`);
    const batch = found.stories || [];
    matches.push(...batch.filter((item) => (item.full_slug || item.slug) === slug));
    if (batch.length < 100) break;
  }
  if (matches.length > 1) throw new Error(`Ambiguous remote story: ${slug}`);
  return matches[0];
}

function select(items, names, key) {
  for (const name of names) {
    if (!items.some((item) => item[key] === name)) throw new Error(`Unknown ${key}: ${name}`);
  }
  return items.filter((item) => names.includes(item[key]));
}

export async function syncSpace({
  request,
  components,
  stories,
  publish = false,
  dryRun = false,
  bootstrap = false,
  onlyStories = /** @type {string[]} */ ([]),
  onlyComponents = /** @type {string[]} */ ([]),
  snapshot = false,
  baseline = /** @type {{ version: number, stories: Record<string, unknown> } | undefined} */ (undefined),
  log = console.log,
}) {
  if (!bootstrap && !snapshot && !onlyStories.length && !onlyComponents.length) {
    throw new Error("Select --only-story or --only-component, or use --bootstrap for all seeds.");
  }
  if (bootstrap && (onlyStories.length || onlyComponents.length)) {
    throw new Error("--bootstrap cannot be combined with subset selectors.");
  }
  if (baseline && (baseline.version !== 1 || !baseline.stories || typeof baseline.stories !== "object" || Array.isArray(baseline.stories))) {
    throw new Error("Invalid baseline: expected { version: 1, stories: { ... } }.");
  }
  const subset = onlyStories.length || onlyComponents.length;
  components = subset ? select(components, onlyComponents, "name") : components;
  stories = subset ? select(stories, onlyStories, "slug") : stories;

  // Preflight all content conflicts before changing schemas or content.
  const plans = [];
  const saved = { version: 1, stories: {} };
  for (const story of stories) {
    let existing = await findStory(request, story.slug);
    if (existing) {
      const detail = await request("GET", `/stories/${existing.id}`);
      existing = detail.story;
      if (!existing?.content) throw new Error(`Missing remote content: ${story.slug}`);
      if (!snapshot && story.uuid && existing.uuid !== story.uuid) {
        throw new Error(`Remote story UUID differs from seed: ${story.slug}`);
      }
    }
    const current = existing ? storyState(existing, true) : null;
    saved.stories[story.slug] = current;
    const hasBaseline = baseline && Object.hasOwn(baseline.stories, story.slug);
    if (!snapshot && hasBaseline && !same(current, baseline.stories[story.slug])) {
      throw new Error(`Remote content changed since baseline: ${story.slug}`);
    }
    const unchanged = existing && same(storyState(existing), storyState(story));
    if (!snapshot && existing && !unchanged && !hasBaseline) {
      throw new Error(`Existing story differs: ${story.slug}. Export --snapshot, review it, then supply --baseline.`);
    }
    plans.push({ story, existing, unchanged });
  }
  if (snapshot) return saved;

  const { components: remote = [] } = components.length ? await request("GET", "/components") : { components: [] };
  const byName = new Map(remote.map((component) => [component.name, component]));

  // New components first, so updated whitelists never point at a missing block.
  const ordered = [...components].sort((a, b) => Number(byName.has(a.name)) - Number(byName.has(b.name)));
  for (const component of ordered) {
    const existing = byName.get(component.name);
    log(`${dryRun ? "would " : ""}${existing ? "update" : "create"} component ${component.name}`);
    if (dryRun) continue;
    if (existing) await request("PUT", `/components/${existing.id}`, { component });
    else await request("POST", "/components", { component });
  }

  for (const { story, existing, unchanged } of plans) {
    if (unchanged && !publish) {
      log(`unchanged story ${story.slug}`);
      continue;
    }
    const payload = {
      story: {
        name: story.name,
        slug: story.slug,
        content: story.content,
        ...(!existing && story.uuid ? { uuid: story.uuid } : {}),
      },
      publish: publish ? 1 : 0,
    };
    log(`${dryRun ? "would " : ""}${existing ? "update" : "create"} story ${story.slug}${publish ? " and publish" : ""}`);
    if (dryRun) continue;
    // Compare again after schema writes. This is compare-before-write, not an
    // atomic conditional update: the API can still accept edits between calls.
    if (existing) {
      const latest = (await request("GET", `/stories/${existing.id}`)).story;
      if (!latest || !same(storyState(latest, true), saved.stories[story.slug])) {
        throw new Error(`Remote content changed during sync: ${story.slug}`);
      }
      await request("PUT", `/stories/${existing.id}`, payload);
    } else {
      if (await findStory(request, story.slug)) {
        throw new Error(`Remote story created during sync: ${story.slug}`);
      }
      await request("POST", "/stories", payload);
    }
  }
  return saved;
}
