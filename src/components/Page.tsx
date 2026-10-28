import {
  storyblokEditable,
  StoryblokServerComponent,
} from "@storyblok/react/rsc";
import { Fragment } from "react";

import type { PageBlok } from "@/components/types";

export default function Page({ blok }: { blok: PageBlok }) {
  return (
    <main id="main" {...storyblokEditable(blok)}>
      {blok.body?.map((nested, index) => (
        <Fragment key={nested._uid}>
          {index === 1 && blok.body?.[0]?.component === "hero" ? <div id="page-content" tabIndex={-1} /> : null}
          {blok.show_block_labels && nested.component !== "hero" ? (
            <div className="labelled-block">
              <div className="wrap">
                <p className="block-label">{nested.component}</p>
              </div>
              <StoryblokServerComponent blok={nested} />
            </div>
          ) : <StoryblokServerComponent blok={nested} />}
        </Fragment>
      ))}
    </main>
  );
}
