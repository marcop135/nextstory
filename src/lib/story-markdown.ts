import { REPO_URL } from "@/lib/site";
import { sourceUrl } from "@/lib/source-url";

type Data = Record<string, unknown>;
const data = (v: unknown): Data => v && typeof v === "object" ? v as Data : {};
const items = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
const text = (v: unknown): string => typeof v === "string" ? v : "";
const inline = (v: unknown) => text(v).replace(/([\\`*_[\]<>])/g, "\\$1").replace(/\r?\n/g, " ");

function url(value: unknown): string | null {
  const raw = text(value);
  if (!/^(https?:\/\/|\/(?!\/)|#)/.test(raw) || /[\s<>]/.test(raw)) return null;
  return raw.replace(/\(/g, "%28").replace(/\)/g, "%29");
}

export function codeFence(code: string, language = "") {
  const length = Math.max(3, ...[...code.matchAll(/`+/g)].map((m) => m[0].length + 1));
  const fence = "`".repeat(length);
  return `${fence}${language.replace(/[^a-zA-Z0-9#+.-]/g, "")}\n${code}\n${fence}`;
}

function rich(value: unknown, depth = 0): string {
  if (depth > 40) throw new Error("Rich text nesting limit exceeded");
  const node = data(value);
  const children = items(node.content).map((n) => rich(n, depth + 1)).join("");
  if (node.type === "text") {
    let result = inline(node.text);
    for (const markValue of items(node.marks)) {
      const mark = data(markValue);
      if (mark.type === "bold") result = `**${result}**`;
      if (mark.type === "italic") result = `*${result}*`;
      if (mark.type === "strike") result = `~~${result}~~`;
      if (mark.type === "code") {
        const fence = "`".repeat(Math.max(1, ...[...text(node.text).matchAll(/`+/g)].map((m) => m[0].length + 1)));
        result = `${fence} ${text(node.text)} ${fence}`;
      }
      if (mark.type === "link") {
        const href = url(data(mark.attrs).href);
        if (href) result = `[${result}](${href})`;
      }
    }
    return result;
  }
  switch (node.type) {
    case "paragraph": return children + "\n\n";
    case "heading": return `${"#".repeat(Math.max(2, Math.min(6, Number(data(node.attrs).level) || 2)))} ${children}\n\n`;
    case "hard_break": return "   \n";
    case "horizontal_rule": return "\n---\n\n";
    case "bullet_list": return items(node.content).map((n) => `- ${rich(n, depth + 1).trim().replace(/\n/g, "\n  ")}`).join("\n") + "\n\n";
    case "ordered_list": return items(node.content).map((n, i) => `${i + 1}. ${rich(n, depth + 1).trim().replace(/\n/g, "\n   ")}`).join("\n") + "\n\n";
    case "blockquote": return children.trim().split("\n").map((line) => `> ${line}`).join("\n") + "\n\n";
    case "code_block": return codeFence(items(node.content).map((n) => text(data(n).text)).join(""), text(data(node.attrs).class)) + "\n\n";
    case "image": { const src = url(data(node.attrs).src); return src ? `![${inline(data(node.attrs).alt)}](${src})\n\n` : ""; }
    case "blok": return items(data(node.attrs).body).map(blockMarkdown).join("\n\n");
    default: return children;
  }
}

export function blockMarkdown(value: unknown): string {
  const b = data(value);
  const section = (title: unknown, body: string) => [title ? `## ${inline(title)}` : "", body].filter(Boolean).join("\n\n");
  const link = (label: unknown, hrefValue: unknown) => { const href = url(hrefValue); return label && href ? `[${inline(label)}](${href})` : ""; };
  switch (b.component) {
    case "hero": return [`# ${inline(b.headline)}`, inline(b.subheadline), b.animated_visual ? inline(b.visual_caption) : imageMarkdown(b), link(b.cta_label, b.cta_href), link(b.secondary_label, b.secondary_href)].filter(Boolean).join("\n\n");
    case "feature_grid": return section(b.headline, items(b.features).map(blockMarkdown).join("\n\n"));
    case "related_content": return items(b.resolved_notes).length ? section(b.headline, items(b.resolved_notes).map((value) => {
      const note = data(value);
      return [link(note.title, note.href), inline(note.summary)].filter(Boolean).join("\n\n");
    }).join("\n\n")) : "";
    case "feature": return `### ${inline(b.title)}\n\n${inline(b.text)}${url(b.link_href) ? `\n\n[${inline(b.title)}](${url(b.link_href)})` : ""}`;
    case "steps": return section(b.headline, [inline(b.intro), ...items(b.items).map((v, i) => `${i + 1}. ${blockMarkdown(v).replace(/\n/g, "\n   ")}`)].filter(Boolean).join("\n\n"));
    case "step": return [`**${inline(b.title)}**`, inline(b.text), sourceUrl(text(b.file), REPO_URL) ? `[${inline(b.file)}](${sourceUrl(text(b.file), REPO_URL)})` : ""].filter(Boolean).join("\n\n");
    case "rich_text": return section(b.headline, rich(b.body).trim());
    case "image_text": return section(b.headline, [inline(b.text), imageMarkdown(b), link(b.link_label, b.link_href)].filter(Boolean).join("\n\n"));
    case "cta_band": return section(b.headline, [inline(b.text), link(b.cta_label, b.cta_href)].filter(Boolean).join("\n\n"));
    case "accordion": return section(b.headline, items(b.items).map(blockMarkdown).join("\n\n"));
    case "accordion_item": return section(b.title, rich(b.body).trim());
    case "pull_quote": return [`> ${inline(b.quote)}`, [inline(b.attribution), inline(b.role)].filter(Boolean).join(", ")].filter(Boolean).join("\n\n");
    case "comparison_table": {
      const table = data(b.table);
      const cells = (v: unknown) => inline(data(v).value).replace(/\|/g, "\\|");
      const headings = items(table.thead).map(cells);
      const rows = items(table.tbody).map((v) => items(data(v).body).map(cells));
      return section(b.headline, [inline(b.intro), inline(b.caption), headings.length ? [`| ${headings.join(" | ")} |`, `| ${headings.map(() => "---").join(" | ")} |`, ...rows.map((row) => `| ${row.join(" | ")} |`)].join("\n") : ""].filter(Boolean).join("\n\n"));
    }
    case "code_example": return section(b.headline, [inline(b.explanation), codeFence(text(b.code), text(b.language)), inline(b.caption), sourceUrl(text(b.source_path), REPO_URL) ? `[${inline(b.source_path)}](${sourceUrl(text(b.source_path), REPO_URL)})` : ""].filter(Boolean).join("\n\n"));
    default: throw new Error(`Unsupported public block: ${text(b.component)}`);
  }
}

function imageMarkdown(b: Data) {
  const image = data(b.image);
  const src = url(image.filename);
  return src ? [`![${inline(b.image_alt ?? image.alt)}](${src})`, image.copyright ? `${inline(image.copyright)}${url(image.source) ? `: ${url(image.source)}` : ""}` : ""].filter(Boolean).join("\n\n") : "";
}

export function storyMarkdown(content: unknown, canonical: string, source: string) {
  const page = data(content);
  if (page.component !== "page" && page.component !== "learning_note") throw new Error("Only page stories are public");
  const body = [page.component === "learning_note" ? `# ${inline(page.title)}\n\n${inline(page.summary)}` : "", ...items(page.body).map(blockMarkdown)].filter(Boolean).join("\n\n");
  return `${body}\n\nCanonical: ${canonical}\nContent source: ${source}; published representation.\n`;
}
