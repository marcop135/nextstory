import { storyblokEditable } from "@storyblok/react/rsc";

import type { StepBlok } from "@/components/types";
import { REPO_URL } from "@/lib/site";

export default function Step({ blok }: { blok: StepBlok }) {
  return (
    <li className="step" {...storyblokEditable(blok)}>
      <h3>{blok.title}</h3>
      {blok.text ? <p>{blok.text}</p> : null}
      {blok.file ? (
        <p className="step__file">
          <a href={`${REPO_URL}/blob/main/${blok.file}`}>
            <code>{blok.file}</code>
          </a>
        </p>
      ) : null}
    </li>
  );
}
