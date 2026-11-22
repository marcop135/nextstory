import { storyblokEditable } from "@storyblok/react/rsc";

import type { PullQuoteBlok } from "@/components/types";

export default function PullQuote({ blok }: { blok: PullQuoteBlok }) {
  return (
    <section className="pull-quote" {...storyblokEditable(blok)}>
      <div className="wrap">
        <figure>
          <blockquote><p>{blok.quote}</p></blockquote>
          {blok.attribution ? <figcaption>{blok.attribution}</figcaption> : null}
        </figure>
      </div>
    </section>
  );
}
