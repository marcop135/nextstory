import { normalizeStorySlug, parseStorySegments, publicPathForSlug } from "@/lib/story-path";

const PUBLIC_PATH = /^\/(?:[a-z0-9][a-z0-9-]*\/)*[a-z0-9][a-z0-9-]*$/;

export function markdownPathForPage(pathname: string): string | null {
  if (pathname === "/for-agents") return "/content/for-agents.md";
  if (pathname === "/") return "/content/index.md";
  if (pathname === "/de") return "/content/de/index.md";
  if (!PUBLIC_PATH.test(pathname)) return null;
  const parts = pathname.slice(1).split("/");
  if (["api", "content", "privacy", "for-agents", "config"].includes(parts[0])) return null;
  if (/^[a-z]{2}$/.test(parts[0]) && parts[0] !== "de") return null;
  const { slug } = parseStorySegments(parts);
  if (slug === "config" || slug === "campaign-workshop/draft") return null;
  return `/content${pathname}.md`;
}

export function parseMarkdownPath(segments: string[]) {
  const joined = segments.join("/");
  if (joined === "for-agents.md") return { portal: true as const, canonical: "/for-agents" };
  if (!joined.endsWith(".md")) return null;
  const path = joined.slice(0, -3);
  const parts = path.split("/");
  if (parts.at(-1) === "index") parts.pop();
  const candidate = parts.length ? `/${parts.join("/")}` : "/";
  if (markdownPathForPage(candidate) !== `/content/${joined}`) return null;
  const parsed = parseStorySegments(parts);
  if (!normalizeStorySlug(parsed.slug)) return null;
  return { portal: false as const, ...parsed, canonical: publicPathForSlug(parsed.slug, parsed.locale) };
}
