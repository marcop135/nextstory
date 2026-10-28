import Image from "next/image";
import Link from "next/link";
import { storyblokEditable } from "@storyblok/react/rsc";

import type { HeroBlok } from "@/components/types";
import PublishingVisual from "@/components/PublishingVisual";
import PageVisual from "@/components/PageVisual";
import PageContinue from "@/components/PageContinue";

export default function Hero({ blok }: { blok: HeroBlok }) {
  const primary = blok.cta_label && blok.cta_href;
  const secondary = blok.secondary_label && blok.secondary_href;
  const imageSrc = blok.image?.filename;
  const pageVisual = !imageSrc && blok.animated_visual !== false;
  return (
    <section className="hero" {...storyblokEditable(blok)}>
      <div className={`wrap${imageSrc || blok.animated_visual || pageVisual ? " hero__layout" : ""}`}>
        <div>
          {blok.eyebrow ? <p className="eyebrow">{blok.eyebrow}</p> : null}
          <h1>{blok.headline}</h1>
          {blok.subheadline ? <p className="lead">{blok.subheadline}</p> : null}
          <PageContinue>{primary || secondary ? (
            <p className="actions">
              {primary ? (
                <Link className="btn" href={blok.cta_href!}>
                  {blok.cta_label}
                </Link>
              ) : null}
              {secondary ? (
                <Link className="btn btn--secondary" href={blok.secondary_href!}>
                  {blok.secondary_label}
                </Link>
              ) : null}
            </p>
          ) : null}</PageContinue>
        </div>
        {blok.animated_visual ? (
          <PublishingVisual
            labels={[blok.visual_model_label || "Model", blok.visual_preview_label || "Preview", blok.visual_publish_label || "Publish", blok.visual_serve_label || "Serve"]}
            caption={blok.visual_caption || "One content model, from draft to published pages in English and German."}
          />
        ) : pageVisual ? <PageVisual /> : imageSrc ? (
          <figure className="hero__figure">
            <div className="hero__media">
              <Image
                src={imageSrc}
                alt={blok.image_alt ?? blok.image?.alt ?? ""}
                fill
                sizes="(min-width: 68rem) 520px, (min-width: 48rem) 50vw, 100vw"
                preload
              />
            </div>
            {blok.image?.copyright && blok.image.source ? (
              <figcaption className="image-credit">
                <a href={blok.image.source}>{blok.image.copyright}</a>
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>
    </section>
  );
}
