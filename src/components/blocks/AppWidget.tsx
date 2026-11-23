"use client";

import { usePathname } from "next/navigation";
import { storyblokEditable } from "@storyblok/react";
import type { AppWidgetBlok } from "@/types/storyblok.generated";
import { localeForPathname } from "@/lib/i18n";
import { widgetMessages } from "@/lib/messages";
import BlockAnatomy from "./BlockAnatomy";
import CacheInspector from "./CacheInspector";
import AttributionInspector from "./AttributionInspector";
import DraftPublish from "./DraftPublish";

export default function AppWidget({ blok }: { blok: AppWidgetBlok }) {
  const locale = localeForPathname(usePathname() ?? "/");
  const copy = widgetMessages[locale];
  const Component = { block_anatomy: BlockAnatomy, cache_inspector: CacheInspector,
    attribution_inspector: AttributionInspector, draft_publish: DraftPublish }[blok.kind];
  if (!Component) return null;
  return <section className="app-widget" data-widget={blok.kind} {...storyblokEditable(blok)}>
    <div className="wrap">
      <h2>{blok.heading}</h2>
      {blok.body ? <p className="section-intro">{blok.body}</p> : null}
      <div className="app-widget__panel"><Component copy={copy} locale={locale} /></div>
    </div>
  </section>;
}
