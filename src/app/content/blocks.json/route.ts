import { blockCatalog } from "@/lib/agent-resources";
import { fetchStory } from "@/lib/fetch-story";

function publicValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(publicValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !key.startsWith("_")).map(([key, item]) => [key, publicValue(item)]));
}

export async function GET(request: Request) {
  const catalog = blockCatalog();
  if (new URL(request.url).searchParams.get("examples") !== "blocks") return Response.json(catalog);
  try {
    const [en, de] = await Promise.all([
      fetchStory("blocks", undefined, { version: "published" }),
      fetchStory("blocks", "de", { version: "published" }),
    ]);
    if (!en || !de) return Response.json({ error: "Examples unavailable" }, { status: 404 });
    // Expose only catalogued content fields, never editor metadata or configuration.
    const values = (body: Record<string, unknown>[]) => body.flatMap((block) => {
      const definition = catalog.blocks.find((entry) => entry.name === block.component);
      return definition ? [{ uid: block._uid, component: block.component,
        fields: Object.fromEntries(definition.fields.map((field) => [field.name, publicValue(block[field.name] ?? null)])),
      }] : [];
    });
    return Response.json({ ...catalog, source: en.source, examples: {
      en: values(en.story.content.body ?? []), de: values(de.story.content.body ?? []),
    } }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Examples unavailable" }, { status: 503 });
  }
}
