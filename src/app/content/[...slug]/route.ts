import { parseMarkdownPath } from "@/lib/agent-paths";
import { portalMarkdown } from "@/lib/agent-resources";
import { fetchStory } from "@/lib/fetch-story";
import { storyblokLanguage } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { storyMarkdown } from "@/lib/story-markdown";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const parsed = parseMarkdownPath((await params).slug);
  const headers = { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "no-store" };
  if (!parsed) return new Response("# Not found\n", { status: 404, headers });
  if (parsed.portal) return new Response(portalMarkdown(), { headers: { ...headers, Link: `<${SITE_URL}/for-agents>; rel="canonical"` } });
  try {
    const result = await fetchStory(parsed.slug, storyblokLanguage(parsed.locale), { version: "published" });
    if (!result || (result.story.content.component !== "page" && result.story.content.component !== "learning_note")) return new Response("# Not found\n", { status: 404, headers });
    const canonical = SITE_URL + parsed.canonical;
    return new Response(storyMarkdown(result.story.content, canonical, result.source), { headers: { ...headers, Link: `<${canonical}>; rel="canonical"` } });
  } catch {
    return new Response("# Content temporarily unavailable\n", { status: 503, headers });
  }
}
