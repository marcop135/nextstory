import Link from "next/link";
import Arrow from "@/components/ui/Arrow";
import { storyblokEditable } from "@storyblok/react/rsc";

import type { FeatureBlok } from "@/components/types";

export default function Feature({ blok }: { blok: FeatureBlok }) {
  const title = blok.title || (blok as FeatureBlok & { name?: string }).name;
  return (
    <article
      className={blok.link_href ? "feature feature--link" : "feature"}
      {...storyblokEditable(blok)}
    >
      {title ? (
        <h3>
          {blok.link_href ? (
            <Link href={blok.link_href}>
              {title}
              <span className="feature__arrow" aria-hidden="true">
                <Arrow name="right" />
              </span>
            </Link>
          ) : (
            title
          )}
        </h3>
      ) : null}
      {blok.text ? <p>{blok.text}</p> : null}
    </article>
  );
}
