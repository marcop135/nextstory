export type Representation = "html" | "markdown" | "none";

type Range = { type: string; subtype: string; q: number };

function parseAccept(header: string): Range[] {
  return header
    .split(",")
    .map((part) => {
      const [media, ...params] = part.trim().split(";").map((s) => s.trim());
      const [type = "", subtype = ""] = media.toLowerCase().split("/");
      const qParam = params.find((p) => p.toLowerCase().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
      return { type, subtype, q: Number.isFinite(q) ? Math.min(Math.max(q, 0), 1) : 0 };
    })
    .filter((range) => range.type && range.subtype);
}

/** Quality for one media type: the most specific matching range wins (RFC 9110, 12.5.1). */
function qualityFor(ranges: Range[], type: string, subtype: string): { q: number; named: boolean } {
  const exact = ranges.find((r) => r.type === type && r.subtype === subtype);
  if (exact) return { q: exact.q, named: true };
  const partial = ranges.find((r) => r.type === type && r.subtype === "*");
  if (partial) return { q: partial.q, named: false };
  const any = ranges.find((r) => r.type === "*" && r.subtype === "*");
  return { q: any ? any.q : 0, named: false };
}

/**
 * Pick HTML or Markdown for a page URL from the Accept header. Missing header
 * means HTML. Markdown wins on a higher q-value, or on a tie only when
 * `text/markdown` is named explicitly. `none` means neither is acceptable.
 */
export function preferredRepresentation(accept: string | null): Representation {
  if (!accept?.trim()) return "html";
  const ranges = parseAccept(accept);
  const html = qualityFor(ranges, "text", "html");
  const markdown = qualityFor(ranges, "text", "markdown");
  if (html.q <= 0 && markdown.q <= 0) return "none";
  if (markdown.q > html.q) return "markdown";
  if (markdown.q === html.q && markdown.named && !html.named) return "markdown";
  return "html";
}
