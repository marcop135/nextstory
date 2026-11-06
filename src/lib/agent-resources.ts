import components from "../../storyblok/components.json";
import { REPO_URL, SITE_URL } from "@/lib/site";

export const agentResources = [
  { path: "/content/index.md", type: "text/markdown", purpose: "Read the published home page without parsing HTML." },
  { path: "/content/de/index.md", type: "text/markdown", purpose: "Read the German home page from the same content model." },
  { path: "/content/how-it-works.md", type: "text/markdown", purpose: "Follow content modelling, preview, publishing, and serving to their source files." },
  { path: "/content/blocks.md", type: "text/markdown", purpose: "Read every page-block example." },
  { path: "/content/blocks.json", type: "application/json", purpose: "Inspect block fields, translation flags, and schema/component source paths." },
  { path: "/content/campaigns.json", type: "application/json", purpose: "List published campaigns with campaign ID, audience, conversion goal, and measurement plan." },
  { path: "/content/for-agents.md", type: "text/markdown", purpose: "Read this resource inventory and the supported workflows." },
  { path: "/llms.txt", type: "text/plain", purpose: "Find the site, repository, and reading entry points." },
  { path: "/sitemap.xml", type: "application/xml", purpose: "Discover published English and German page URLs." },
  { path: "/robots.txt", type: "text/plain", purpose: "Read crawl preferences." },
  { path: "/openapi.json", type: "application/json", purpose: "Inspect the public HTTP resource descriptions." },
  { path: "/.well-known/api-catalog", type: "application/linkset+json", purpose: "Discover public resources through an API catalog." },
  { path: "/auth.md", type: "text/markdown", purpose: "Read the public-resource access rules." },
  { path: "/.well-known/agent-skills/index.json", type: "application/json", purpose: "Find concrete page-reading and block-inspection workflows." },
];

export const agentTasks = [
  { name: "Read a German page", request: "/content/de/index.md", instruction: "Fetch the Markdown resource. Keep the German text and canonical page URL when quoting it." },
  { name: "Inspect the block model", request: "/content/blocks.json", instruction: "List the page blocks and inspect their field types and translatable flags. Compare the examples at /blocks." },
  { name: "Trace a block to code", request: "/content/blocks.json", instruction: "Use each block's schema_path and component_path under the source repository. Field definitions come from the schema; rendering comes from the component." },
];

export const authMarkdown = "# Public resource access\n\nPublic HTML, Markdown, and JSON resources require no login, API key, or OAuth. They return published content.\n\nStoryblok editor preview and revalidation are separate authenticated CMS operations. Their secrets are configured server-side and are not part of the public reading workflows.\n";

type Component = { name: string; display_name: string; schema: Record<string, { type: string; translatable?: boolean; component_whitelist?: string[] }> };

export function blockCatalog() {
  const schema = components as unknown as Component[];
  const allowed = schema.find((c) => c.name === "page")!.schema.body.component_whitelist!;
  return {
    source: `${REPO_URL}/blob/main/storyblok/components.json`,
    blocks: allowed.map((name) => {
      const component = schema.find((c) => c.name === name)!;
      return {
        name, label: component.display_name,
        example_url: `${SITE_URL}/blocks`,
        schema_path: "storyblok/components.json",
        component_path: `src/components/${name.replace(/(^|_)([a-z])/g, (_, __, c: string) => c.toUpperCase())}.tsx`,
        fields: Object.entries(component.schema).map(([name, field]) => ({ name, type: field.type, translatable: field.translatable === true, ...(field.component_whitelist ? { components: field.component_whitelist } : {}) })),
      };
    }),
  };
}

export function portalMarkdown() {
  return ["# For agents", "Public reading and block-inspection resources for Next Story.", "## Workflows", ...agentTasks.map((task) => `### ${task.name}\n\nGET ${SITE_URL}${task.request}\n\n${task.instruction}`), "## Resources", ...agentResources.map((r) => `- [${r.path}](${SITE_URL}${r.path}): ${r.purpose}`), "## Browser tools", "Supporting browsers expose get_page_markdown for the current published page, list_blocks for the public block catalog, and get_campaign_brief for published campaign goals and measures. Native WebMCP is feature-detected; other browsers use these HTTP resources directly.", "## Access", authMarkdown.replace("# Public resource access\n\n", ""), `Source: ${REPO_URL}`].join("\n\n") + "\n";
}

export function apiCatalog() {
  const entry = (path: string, type: string, title: string) => ({ href: SITE_URL + path, type, title });
  return { linkset: [{ anchor: SITE_URL + "/", "service-desc": [entry("/openapi.json", "application/json", "Public HTTP resources")], "service-doc": [entry("/for-agents", "text/html", "For agents")], item: agentResources.map((r) => entry(r.path, r.type, r.purpose)) }] };
}

export function skillsIndex() {
  return { site: SITE_URL, skills: agentTasks.map((t) => ({ name: t.name, instructions: t.instruction, resource: SITE_URL + t.request })), access: SITE_URL + "/auth.md" };
}

export function openApi() {
  const paths: Record<string, unknown> = Object.fromEntries(agentResources.map((r) => [r.path, { get: { summary: r.purpose, responses: { "200": { description: r.purpose, content: { [r.type]: { schema: { type: r.type.includes("json") ? "object" : "string" } } } } } } }]));
  paths["/content/{slug}.md"] = {
    get: {
      summary: "Read a published CMS page; prefix the slug with de/ for German and use index for home.",
      parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" }, example: "de/blocks" }],
      responses: { "200": { description: "Published page Markdown", content: { "text/markdown": { schema: { type: "string" } } } }, "404": { description: "Page not found" }, "503": { description: "Content temporarily unavailable" } },
    },
  };
  return { openapi: "3.1.0", info: { title: "Next Story public reading resources", version: "1.0.0" }, servers: [{ url: SITE_URL }], security: [], paths };
}
