import {
  storyblokEditable,
  StoryblokServerComponent,
} from "@storyblok/react/rsc";

import type { StepsBlok } from "@/components/types";

export default function Steps({ blok }: { blok: StepsBlok }) {
  return (
    <section className="steps" {...storyblokEditable(blok)}>
      <div className="wrap">
        {blok.headline ? <h2>{blok.headline}</h2> : null}
        {blok.intro ? <p className="steps__intro">{blok.intro}</p> : null}
        <ol className="steps__list">
          {blok.items?.map((item) => (
            <StoryblokServerComponent blok={item} key={item._uid} />
          ))}
        </ol>
      </div>
    </section>
  );
}
