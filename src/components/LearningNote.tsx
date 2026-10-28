import { storyblokEditable, StoryblokServerComponent } from "@storyblok/react/rsc";
import type { LearningNoteBlok } from "@/components/types";
import PageVisual from "@/components/PageVisual";
import PageContinue from "@/components/PageContinue";

export default function LearningNote({ blok }: { blok: LearningNoteBlok }) {
  return (
    <main id="main" {...storyblokEditable(blok)}>
      <section className="hero">
        <div className="wrap hero__layout">
          <div>
            <h1>{blok.title}</h1>
            {blok.summary ? <p className="lead">{blok.summary}</p> : null}
            <PageContinue />
          </div>
          <PageVisual />
        </div>
      </section>
      <div id="page-content" tabIndex={-1} />
      {blok.body?.map((nested) => <StoryblokServerComponent blok={nested} key={nested._uid} />)}
    </main>
  );
}
