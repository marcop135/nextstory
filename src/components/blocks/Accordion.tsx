import { storyblokEditable, StoryblokServerComponent } from "@storyblok/react/rsc";

import type { AccordionBlok } from "@/components/types";

export default function Accordion({ blok }: { blok: AccordionBlok }) {
  return (
    <section className="accordion" {...storyblokEditable(blok)}>
      <div className="wrap">
        {blok.headline ? <h2>{blok.headline}</h2> : null}
        <div className="accordion__items">
          {blok.items?.map((item) => (
            <StoryblokServerComponent blok={item} key={item._uid} />
          ))}
        </div>
      </div>
    </section>
  );
}
