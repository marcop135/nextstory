import {
  storyblokEditable,
  StoryblokServerRichText,
} from "@storyblok/react/rsc";

import type { RichTextBlok } from "@/components/types";

export default function RichText({ blok }: { blok: RichTextBlok }) {
  return (
    <section className="rich-text" {...storyblokEditable(blok)}>
      <div className="wrap">
        <div className="prose-block">
          {blok.headline ? <h2>{blok.headline}</h2> : null}
          {blok.body ? <StoryblokServerRichText document={blok.body} /> : null}
        </div>
      </div>
    </section>
  );
}
