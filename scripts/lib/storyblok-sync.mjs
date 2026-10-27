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

function references(value) {
  if (Array.isArray(value)) return value.flatMap(references);
  if (!value || typeof value !== "object") return [];
  return value.component === "related_content"
    ? (value.stories || []).filter((uuid) => typeof uuid === "string")
    : Object.values(value).flatMap(references);
}

function remapReferences(value, uuids) {
  if (Array.isArray(value)) return value.map((item) => remapReferences(item, uuids));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
    value.component === "related_content" && key === "stories" && Array.isArray(item)
      ? item.map((uuid) => uuids.get(uuid) || uuid)
      : remapReferences(item, uuids),
  ]));
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
  const seeds = stories;
  const subset = onlyStories.length || onlyComponents.length;
  components = subset ? select(components, onlyComponents, "name") : components;
  stories = subset ? select(stories, onlyStories, "slug") : stories;

  // Preflight all content conflicts before changing schemas or content.
  const plans = [];
  const uuids = new Map();
  const saved = { version: 1, stories: {} };
  for (const story of stories) {
    let existing = await findStory(request, story.slug);
    if (existing) {
      const detail = await request("GET", `/stories/${existing.id}`);
      existing = detail.story;
      if (!existing?.content) throw new Error(`Missing remote content: ${story.slug}`);
      if (story.uuid && existing.uuid) uuids.set(story.uuid, existing.uuid);
    }
    const current = existing ? storyState(existing, true) : null;
    saved.stories[story.slug] = current;
    const hasBaseline = baseline && Object.hasOwn(baseline.stories, story.slug);
    if (!snapshot && hasBaseline && !same(current, baseline.stories[story.slug])) {
      throw new Error(`Remote content changed since baseline: ${story.slug}`);
    }
    plans.push({ story, existing, hasBaseline });
  }
  if (snapshot) return saved;

  // Resolve referenced seeds outside the write selection without modifying them.
  for (const uuid of new Set(stories.flatMap((story) => references(story.content)))) {
    if (uuids.has(uuid) || stories.some((story) => story.uuid === uuid)) continue;
    const seed = seeds.find((story) => story.uuid === uuid);
    if (!seed) continue;
    const existing = await findStory(request, seed.slug);
    if (!existing?.uuid) throw new Error(`Include referenced story in selection: ${seed.slug}`);
    uuids.set(uuid, existing.uuid);
  }
  for (const { story, existing, hasBaseline } of plans) {
    const desired = { ...story, content: remapReferences(story.content, uuids) };
    if (existing && !same(storyState(existing), storyState(desired)) && !hasBaseline) {
      throw new Error(`Existing story differs: ${story.slug}. Export --snapshot, review it, then supply --baseline.`);
    }
  }

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

  // Storyblok assigns UUIDs. Create reference targets as drafts before consumers.
  for (const plan of plans.filter(({ story, existing }) => story.uuid && !existing)) {
    const { story } = plan;
    log(`${dryRun ? "would " : ""}create draft reference target ${story.slug}`);
    if (dryRun) continue;
    if (await findStory(request, story.slug)) throw new Error(`Remote story created during sync: ${story.slug}`);
    const result = await request("POST", "/stories", {
      story: { name: story.name, slug: story.slug, content: remapReferences(story.content, uuids) }, publish: 0,
    });
    if (!result.story?.id || !result.story.uuid || !result.story.content) throw new Error(`Missing assigned story identity: ${story.slug}`);
    plan.existing = result.story;
    uuids.set(story.uuid, result.story.uuid);
    saved.stories[story.slug] = storyState(result.story, true);
  }

  const publicationOrder = [...plans].sort((a, b) => Number(Boolean(b.story.uuid)) - Number(Boolean(a.story.uuid)));
  for (const { story, existing } of publicationOrder) {
    const content = remapReferences(story.content, uuids);
    const unchanged = existing && same(storyState(existing), storyState({ ...story, content }));
    if (unchanged && !publish) {
      log(`unchanged story ${story.slug}`);
      continue;
    }
    const payload = {
      story: {
        name: story.name,
        slug: story.slug,
        content,
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
