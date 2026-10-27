import Link from "next/link";
import { storyblokEditable } from "@storyblok/react/rsc";
import type { RelatedContentBlok } from "@/components/types";
import type { RelatedNote } from "@/lib/related-content";
import { attachRelatedNotes, relatedUuids } from "@/lib/related-content";
import { fetchRelatedStories } from "@/lib/fetch-story";
import { requestLocale } from "@/lib/site-config";
import { storyblokLanguage } from "@/lib/i18n";

type Props = { blok: RelatedContentBlok & { resolved_notes?: RelatedNote[] } };

async function LiveRelatedContent({ blok }: Props) {
  const language = storyblokLanguage(await requestLocale());
  const content = { body: [blok] };
  const stories = await fetchRelatedStories(relatedUuids(content), language);
  const resolved = attachRelatedNotes(content, stories, language);
  return <RelatedContent blok={(resolved.body as Props["blok"][])[0]} />;
}

export default function RelatedContent({ blok }: Props) {
  if (!blok.resolved_notes && blok.stories?.length) return <LiveRelatedContent blok={blok} />;
  if (!blok.resolved_notes?.length) return null;
  return (
    <section className="feature-grid related-content" {...storyblokEditable(blok)}>
      <div className="wrap">
        {blok.headline ? <h2>{blok.headline}</h2> : null}
        <div className="feature-grid__list">
          {blok.resolved_notes.map((note) => (
            <article className="feature feature--link" key={note.uuid}>
              <h3><Link href={note.href}>{note.title}</Link></h3>
              {note.summary ? <p>{note.summary}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
