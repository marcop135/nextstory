import { storyblokEditable, StoryblokServerComponent } from "@storyblok/react/rsc";
import type { LearningNoteBlok } from "@/components/types";

export default function LearningNote({ blok }: { blok: LearningNoteBlok }) {
  return (
    <main id="main" {...storyblokEditable(blok)}>
      <section className="hero"><div className="wrap">
        <h1>{blok.title}</h1>
        {blok.summary ? <p className="lead">{blok.summary}</p> : null}
      </div></section>
      {blok.body?.map((nested) => <StoryblokServerComponent blok={nested} key={nested._uid} />)}
    </main>
  );
}
