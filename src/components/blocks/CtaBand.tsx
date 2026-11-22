import Link from "next/link";
import { storyblokEditable } from "@storyblok/react/rsc";

import type { CtaBandBlok } from "@/components/types";

export default function CtaBand({ blok }: { blok: CtaBandBlok }) {
  const external = blok.cta_href?.startsWith("http");
  return (
    <section className="cta-band" {...storyblokEditable(blok)}>
      <div className="wrap">
        <h2>{blok.headline}</h2>
        {blok.text ? <p>{blok.text}</p> : null}
        {blok.cta_label && blok.cta_href ? (
          <p>
            {external ? (
              <a className="btn btn--ghost" href={blok.cta_href}>
                {blok.cta_label}
              </a>
            ) : (
              <Link className="btn btn--ghost" href={blok.cta_href}>
                {blok.cta_label}
              </Link>
            )}
          </p>
        ) : null}
      </div>
    </section>
  );
}
