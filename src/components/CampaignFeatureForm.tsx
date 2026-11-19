import Link from "next/link";
import { storyblokEditable } from "@storyblok/react/rsc";

import CampaignChoiceForm from "@/components/CampaignChoiceForm";
import {
  CAMPAIGN_DRAFT_FEATURES,
  CAMPAIGN_DRAFT_GRID,
  campaignDraftPath,
  type CampaignFeatureFormBlok,
} from "@/lib/campaign-draft";

const copy = {
  en: {
    legend: "Pick what your draft page should cover",
    build: "Build my draft page",
    update: "Update draft",
    open: "Open your draft page",
    saved: "Draft saved.",
    covers: "Your draft page covers:",
    none: "Nothing saved. Pick at least one feature to build your draft page.",
    empty: "Pick at least one feature before saving your draft.",
    dirty: "You changed your picks. Update the draft to apply them.",
  },
  de: {
    legend: "Auswählen, was die Entwurfsseite zeigen soll",
    build: "Meine Entwurfsseite erstellen",
    update: "Entwurf aktualisieren",
    open: "Entwurfsseite öffnen",
    saved: "Entwurf gespeichert.",
    covers: "Ihre Entwurfsseite zeigt:",
    none: "Nichts gespeichert. Mindestens einen Inhalt wählen, um die Entwurfsseite zu erstellen.",
    empty: "Mindestens einen Inhalt wählen, bevor der Entwurf gespeichert wird.",
    dirty: "Auswahl geändert. Entwurf aktualisieren, um sie zu übernehmen.",
  },
};

/**
 * The campaign page's benefits grid as a plain HTML form. It posts to
 * /api/campaign-draft without JavaScript; the checkboxes reflect the cookie.
 * With a saved draft, Open is the primary action and Update is secondary.
 * Once a checkbox differs from the saved picks, CSS (`:has`) swaps that pair.
 * Submitting with nothing checked shows an error and does not save.
 */
export default function CampaignFeatureForm({ blok }: { blok: CampaignFeatureFormBlok }) {
  const text = copy[blok.locale];
  // Only allow-listed features can be saved, so only those get a checkbox.
  const features = (blok.features ?? []).filter((feature) => CAMPAIGN_DRAFT_FEATURES.includes(feature._uid ?? ""));
  const titles = features.filter((feature) => blok.selected.includes(feature._uid ?? "")).map((feature) => feature.title);
  const hasDraft = titles.length > 0;
  return (
    <section id={CAMPAIGN_DRAFT_GRID} className="feature-grid" {...storyblokEditable(blok)}>
      <div className="wrap">
        {blok.headline ? <h2>{blok.headline}</h2> : null}
        <CampaignChoiceForm className={`feature-choice${hasDraft ? " feature-choice--saved" : ""}`}>
          <input type="hidden" name="locale" value={blok.locale} />
          <fieldset aria-invalid={blok.empty || undefined} aria-describedby={blok.empty ? "feature-choice-error" : undefined}>
            <legend>{text.legend}</legend>
            <div className="feature-grid__list">
              {features.map((feature) => {
                const id = `feature-choice-${feature._uid}`;
                const checked = blok.selected.includes(feature._uid ?? "");
                return (
                  <div className="feature feature-choice__item" key={feature._uid} {...storyblokEditable(feature)}>
                    <input
                      id={id}
                      type="checkbox"
                      name="featureUids"
                      value={feature._uid}
                      defaultChecked={checked}
                      data-saved={checked ? "" : undefined}
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
          <div className="feature-choice__result" role="status">
            {hasDraft ? (
              <p className="feature-choice__summary">
                <svg className="feature-choice__check" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" /><path d="m7 12.5 3.2 3.2L17 9" /></svg>
                <span>{blok.saved ? <strong>{text.saved} </strong> : null}{text.covers} {titles.join(", ")}.</span>
              </p>
            ) : blok.saved ? (
              <p className="feature-choice__summary feature-choice__summary--empty">{text.none}</p>
            ) : null}
          </div>
          <p id="feature-choice-error" className="feature-choice__summary feature-choice__summary--invalid" role="alert" tabIndex={-1} hidden={!blok.empty}>{text.empty}</p>
          {hasDraft ? (
            <div className="feature-choice__actions">
              <Link className="btn feature-choice__open" href={campaignDraftPath(blok.locale)}>{text.open}</Link>
              <button className="btn btn--secondary feature-choice__update" type="submit">{text.update}</button>
              <p className="feature-choice__dirty">{text.dirty}</p>
            </div>
          ) : (
            <div className="feature-choice__actions">
              <button className="btn" type="submit">{text.build}</button>
            </div>
          )}
        </CampaignChoiceForm>
      </div>
    </section>
  );
}
