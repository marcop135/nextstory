import {
  storyblokEditable,
  StoryblokServerComponent,
} from "@storyblok/react/rsc";

import type { FeatureGridBlok } from "@/components/types";

export default function FeatureGrid({ blok }: { blok: FeatureGridBlok }) {
  return (
    <section className="feature-grid" {...storyblokEditable(blok)}>
      <div className="wrap">
        {blok.headline ? <h2>{blok.headline}</h2> : null}
        <div className="feature-grid__list">
          {blok.features?.map((feature) => (
            <StoryblokServerComponent blok={feature} key={feature._uid} />
          ))}
        </div>
      </div>
    </section>
  );
}
