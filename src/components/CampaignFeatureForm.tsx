import Link from "next/link";
import { storyblokEditable } from "@storyblok/react/rsc";

import {
  CAMPAIGN_DRAFT_FEATURES,
  CAMPAIGN_DRAFT_GRID,
  campaignDraftPath,
  type CampaignFeatureFormBlok,
} from "@/lib/campaign-draft";

const copy = {
  en: {
    legend: "Choose what your draft page should cover",
    save: "Save selection",
    open: "Open your draft page",
    saved: (count: number, total: number) => `Saved: ${count} of ${total} ${total === 1 ? "feature" : "features"}.`,
  },
  de: {
    legend: "Auswählen, was die Entwurfsseite zeigen soll",
    save: "Auswahl speichern",
    open: "Entwurfsseite öffnen",
    saved: (count: number, total: number) => `Gespeichert: ${count} von ${total} Inhalten.`,
  },
};

/**
 * The campaign page's benefits grid as a plain HTML form. It posts to
 * /api/campaign-draft without JavaScript; the checkboxes reflect the cookie.
 * After a save the API redirects here with `?saved=1`, which shows the result.
 */
export default function CampaignFeatureForm({ blok }: { blok: CampaignFeatureFormBlok }) {
  const text = copy[blok.locale];
  // Only allow-listed features can be saved, so only those get a checkbox.
  const features = (blok.features ?? []).filter((feature) => CAMPAIGN_DRAFT_FEATURES.includes(feature._uid ?? ""));
  return (
    <section id={CAMPAIGN_DRAFT_GRID} className="feature-grid" {...storyblokEditable(blok)}>
      <div className="wrap">
        {blok.headline ? <h2>{blok.headline}</h2> : null}
        <form className="feature-choice" method="post" action="/api/campaign-draft">
          <input type="hidden" name="locale" value={blok.locale} />
          <fieldset>
            <legend>{text.legend}</legend>
            <div className="feature-grid__list">
              {features.map((feature) => {
                const id = `feature-choice-${feature._uid}`;
                return (
                  <div className="feature feature-choice__item" key={feature._uid} {...storyblokEditable(feature)}>
                    <input
                      id={id}
                      type="checkbox"
                      name="featureUids"
                      value={feature._uid}
                      defaultChecked={blok.selected.includes(feature._uid ?? "")}
                    />
                    <label htmlFor={id}>
                      <strong>{feature.title}</strong>
                      {feature.text ? <span>{feature.text}</span> : null}
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>
          <div className="feature-choice__actions">
            <button className="btn" type="submit">{text.save}</button>
            {blok.saved ? null : <Link href={campaignDraftPath(blok.locale)}>{text.open}</Link>}
          </div>
          <p className="feature-choice__status" role="status">
            {blok.saved ? (
              <>
                {text.saved(blok.selected.length, features.length)}{" "}
                <Link href={campaignDraftPath(blok.locale)}>{text.open}</Link>
              </>
            ) : null}
          </p>
        </form>
      </div>
    </section>
  );
}
