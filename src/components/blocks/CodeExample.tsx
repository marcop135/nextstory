import { storyblokEditable } from "@storyblok/react/rsc";
import type { CodeExampleBlok } from "@/components/types";
import { REPO_URL } from "@/lib/site";
import { sourceUrl } from "@/lib/source-url";

export default function CodeExample({ blok }: { blok: CodeExampleBlok }) {
  const href = sourceUrl(blok.source_path, REPO_URL);
  return (
    <section className="code-example" {...storyblokEditable(blok)}>
      <div className="wrap">
        <h2>{blok.headline}</h2>
        {blok.explanation ? <p className="section-intro">{blok.explanation}</p> : null}
        <figure>
          <div className="code-example__bar"><span>{blok.language || "text"}</span>{href ? <a href={href}>{blok.source_path}</a> : null}</div>
          <pre tabIndex={0} role="region" aria-label={blok.caption || blok.headline}><code>{blok.code}</code></pre>
          {blok.caption ? <figcaption>{blok.caption}</figcaption> : null}
        </figure>
      </div>
    </section>
  );
}
