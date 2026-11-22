import { storyblokEditable, StoryblokServerRichText } from "@storyblok/react/rsc";

import type { AccordionItemBlok } from "@/components/types";

export default function AccordionItem({ blok }: { blok: AccordionItemBlok }) {
  return (
    <details className="accordion__item" {...storyblokEditable(blok)}>
      <summary>{blok.title}</summary>
      {blok.body ? (
        <div className="prose-block accordion__body">
          <StoryblokServerRichText document={blok.body} />
        </div>
      ) : null}
    </details>
  );
}
