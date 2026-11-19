import Link from "next/link";
import { storyblokEditable } from "@storyblok/react/rsc";

import { campaignDraftPath, type CampaignFeatureFormBlok } from "@/lib/campaign-draft";

const copy = {
  en: {
    legend: "Choose what your draft page should cover",
    save: "Save selection",
    open: "Open your draft page",
  },
  de: {
    legend: "Auswählen, was die Entwurfsseite zeigen soll",
    save: "Auswahl speichern",
    open: "Entwurfsseite öffnen",
  },
};

/**
 * The campaign page's benefits grid as a plain HTML form. It posts to
 * /api/campaign-draft without JavaScript; the checkboxes reflect the cookie.
 */
export default function CampaignFeatureForm({ blok }: { blok: CampaignFeatureFormBlok }) {
  const text = copy[blok.locale];
  return (
    <section className="feature-grid" {...storyblokEditable(blok)}>
      <div className="wrap">
        {blok.headline ? <h2>{blok.headline}</h2> : null}
        <form className="feature-choice" method="post" action="/api/campaign-draft">
          <input type="hidden" name="locale" value={blok.locale} />
          <fieldset>
            <legend>{text.legend}</legend>
            <div className="feature-grid__list">
              {blok.features?.map((feature) => {
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
            <Link href={campaignDraftPath(blok.locale)}>{text.open}</Link>
          </div>
        </form>
      </div>
    </section>
  );
}
