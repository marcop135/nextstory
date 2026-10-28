"use client";

import { usePathname } from "next/navigation";
import PublishingVisual from "@/components/PublishingVisual";

type Sequence = {
  en: string[];
  de: string[];
  sketches?: string[][];
  caption: [string, string];
};

const sequences: Record<string, Sequence> = {
  "how-it-works": {
    en: ["Edit", "Preview", "Publish", "Render"],
    de: ["Bearbeiten", "Vorschau", "Veröffentlichen", "Rendern"],
    caption: ["An edit becomes a preview, then a published page.", "Eine Änderung wird zur Vorschau und dann zur veröffentlichten Seite."],
  },
  blocks: {
    en: ["Define", "Register", "Compose", "Render"],
    de: ["Definieren", "Registrieren", "Zusammenstellen", "Rendern"],
    sketches: [["hero", "feature_grid", "cta_band"], ["hero: Hero", "steps: Steps"], ["page.body", "[hero, steps, cta]"], ["<Hero />", "<Steps />", "<CtaBand />"]],
    caption: ["Named blocks connect the content model to React components.", "Benannte Blöcke verbinden das Content-Modell mit React-Komponenten."],
  },
  "content-relationships": {
    en: ["Write", "Reference", "Resolve", "Reuse"],
    de: ["Schreiben", "Referenzieren", "Auflösen", "Wiederverwenden"],
    sketches: [["learning_note", "title + body"], ["related_content", "story UUID"], ["fetchRelatedStories", "language + version"], ["page A → note", "page B → note"]],
    caption: ["One learning note reaches every page that references it.", "Eine Lernnotiz erreicht jede Seite, die darauf verweist."],
  },
  "cache-invalidation": {
    en: ["Cache", "Publish", "Invalidate", "Refresh"],
    de: ["Cachen", "Veröffentlichen", "Invalidieren", "Aktualisieren"],
    sketches: [["published story", "cache tag"], ["Storyblok", "publish webhook"], ["/api/revalidate", "revalidateTag"], ["next request", "fresh content"]],
    caption: ["Publishing invalidates the tagged cache before the next request.", "Eine Veröffentlichung invalidiert den markierten Cache vor der nächsten Anfrage."],
  },
  "for-agents": {
    en: ["Discover", "Read", "Inspect", "Trace"],
    de: ["Entdecken", "Lesen", "Prüfen", "Nachverfolgen"],
    sketches: [["/llms.txt", "/openapi.json"], ["/content/home.md", "published Markdown"], ["list_blocks", "get_page_markdown"], ["source links", "read-only tools"]],
    caption: ["Public resources connect published content, block definitions, and source.", "Öffentliche Ressourcen verbinden veröffentlichte Inhalte, Blockdefinitionen und Quellcode."],
  },
  privacy: {
    en: ["Visit", "Measure", "Store", "Control"],
    de: ["Besuchen", "Messen", "Speichern", "Kontrollieren"],
    sketches: [["page request", "Vercel"], ["Matomo", "cookieless"], ["self-hosted", "analytics"], ["access", "erasure"]],
    caption: ["Hosting and cookieless analytics are described in this notice.", "Hosting und cookielose Analyse werden in diesem Hinweis beschrieben."],
  },
};

export default function PageVisual() {
  const pathname = usePathname() ?? "/";
  const parts = pathname.split("/").filter(Boolean);
  const german = parts[0] === "de";
  const slug = (german ? parts.slice(1) : parts).join("/");
  const sequence = sequences[slug] || sequences["how-it-works"];
  return (
    <PublishingVisual
      key={pathname}
      resource={slug || "home"}
      labels={german ? sequence.de : sequence.en}
      sketches={sequence.sketches}
      caption={sequence.caption[german ? 1 : 0]}
    />
  );
}
