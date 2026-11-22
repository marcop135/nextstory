import Image from "next/image";
import { storyblokEditable } from "@storyblok/react/rsc";

import type { ImageTextBlok } from "@/components/types";

export default function ImageText({ blok }: { blok: ImageTextBlok }) {
  const imageSrc = blok.image?.filename;
  return (
    <section className="image-text" {...storyblokEditable(blok)}>
      <div className={`wrap image-text__layout${blok.image_right ? " image-text__layout--reversed" : ""}${imageSrc ? "" : " image-text__layout--text-only"}`}>
        {imageSrc ? (
          <figure className="image-text__figure">
            <div className="image-text__media">
              <Image
                src={imageSrc}
                alt={blok.image_alt ?? blok.image?.alt ?? ""}
                fill
                sizes="(min-width: 68rem) 520px, (min-width: 48rem) 50vw, 100vw"
              />
            </div>
            {blok.image?.copyright && blok.image.source ? (
              <figcaption className="image-credit">
                <a href={blok.image.source}>{blok.image.copyright}</a>
              </figcaption>
            ) : null}
          </figure>
        ) : null}
        <div className="image-text__copy">
          <h2>{blok.headline}</h2>
          {blok.text ? <p>{blok.text}</p> : null}
          {blok.link_label && blok.link_href ? (
            <a className="btn btn--secondary" href={blok.link_href}>{blok.link_label}</a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
