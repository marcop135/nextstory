"use client";

import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import Arrow from "@/components/ui/Arrow";

const en = {
  edit: "Try a content change, then publish the demo.", headline: "Try another headline", initial: "Build your next campaign",
  preview: "Live preview", publish: "Publish locally", reset: "Reset", pending: "Unsaved changes", synced: "Saved locally",
  published: "Current preview saved locally.", local: "Local demo. Nothing changes in Storyblok.",
  blocksHint: "Choose the blocks for your page.", empty: "Add a block to start.",
  hero: "Hero", features: "Features", action: "Call to action", included: "Blocks",
  featureOne: "Edit", featureTwo: "Preview", featureThree: "Publish", actionText: "Get started",
  campaignHint: "Pick an audience and offer. Watch the sample campaign change.", audience: "1. Choose an audience", marketers: "Marketers", developers: "Developers", offer: "2. Choose an offer",
  workshop: "Workshop", checklist: "Checklist", workshopTitle: "Build a campaign together", checklistTitle: "Your publishing checklist",
  developerTitle: "Build the blocks behind a campaign", developerChecklist: "Your integration checklist", next: "Try the campaign form", updates: "Preview updated:",
};
const de: typeof en = {
  edit: "Probiere eine Textänderung aus und veröffentliche die Demo.", headline: "Andere Überschrift ausprobieren", initial: "Baue deine nächste Kampagne",
  preview: "Live-Vorschau", publish: "Lokal veröffentlichen", reset: "Zurücksetzen", pending: "Ungespeicherte Änderungen", synced: "Lokal gespeichert",
  published: "Aktuelle Vorschau lokal gespeichert.", local: "Lokale Demo. In Storyblok ändert sich nichts.",
  blocksHint: "Wähle die Blöcke für deine Seite.", empty: "Füge einen Block hinzu.",
  hero: "Hero", features: "Merkmale", action: "Handlungsaufruf", included: "Blöcke",
  featureOne: "Bearbeiten", featureTwo: "Vorschau", featureThree: "Veröffentlichen", actionText: "Loslegen",
  campaignHint: "Wähle Zielgruppe und Angebot. Die Beispielkampagne passt sich an.", audience: "1. Zielgruppe wählen", marketers: "Marketingteams", developers: "Entwicklerteams", offer: "2. Angebot wählen",
  workshop: "Workshop", checklist: "Checkliste", workshopTitle: "Gemeinsam eine Kampagne bauen", checklistTitle: "Deine Checkliste zur Veröffentlichung",
  developerTitle: "Die Blöcke einer Kampagne bauen", developerChecklist: "Deine Checkliste zur Integration", next: "Kampagnenformular ausprobieren", updates: "Vorschau aktualisiert:",
};
type Block = "hero" | "features" | "action";
const allBlocks: Block[] = ["hero", "features", "action"];

function MiniPage({ title, blocks, copy, revision }: { title: string; blocks: Block[]; copy: typeof en; revision: number }) {
  return <div className="proof-page" data-revision={revision}>
    {blocks.length === 0 ? <p>{copy.empty}</p> : blocks.map((block) => <div className={`proof-page__block proof-page__block--${block}`} key={`${revision}-${block}`}>
      {block === "hero" ? <strong>{title || copy.initial}</strong> : null}
      {block === "features" ? <div className="proof-page__features">{[copy.featureOne, copy.featureTwo, copy.featureThree].map((label) => <span key={label}>{label}</span>)}</div> : null}
      {block === "action" ? <span className="proof-page__cta">{copy.actionText}</span> : null}
    </div>)}
  </div>;
}

export default function InteractiveProof({ resource }: { resource: string }) {
  const german = (usePathname() ?? "/").split("/")[1] === "de";
  const copy = german ? de : en;
  const id = useId();
  const [headline, setHeadline] = useState(copy.initial);
  const [saved, setSaved] = useState(copy.initial);
  const [blocks, setBlocks] = useState<Block[]>(["hero", "action"]);
  const [audience, setAudience] = useState<"marketers" | "developers">("marketers");
  const [offer, setOffer] = useState<"workshop" | "checklist">("workshop");
  const [revision, setRevision] = useState(0);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Block>("hero");
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const headlines = german ? [copy.initial, "Aus einer Idee wird eine Seite", "Dein nächster Launch beginnt hier", "Eine Geschichte. Zwei Sprachen.", "Bausteine für deinen nächsten Launch", "Von der Vorschau zur Veröffentlichung"] : [copy.initial, "Turn an idea into a page", "Your next launch starts here", "One story. Two languages.", "Building blocks for your next launch", "From first draft to published page"];
  const isBlocks = resource === "blocks";
  const isCampaign = resource === "campaign-workshop";
  const dirty = headline !== saved;
  const title = audience === "developers"
    ? offer === "workshop" ? copy.developerTitle : copy.developerChecklist
    : offer === "workshop" ? copy.workshopTitle : copy.checklistTitle;
  function reset() {
    setHeadline(copy.initial); setSaved(copy.initial); setBlocks(["hero", "action"]);
    setAudience("marketers"); setOffer("workshop"); setRevision(0); setHeadlineIndex(0); setStatus(copy.reset);
  }
  function toggle(block: Block) {
    const next = allBlocks.filter((value) => value === block ? !blocks.includes(value) : blocks.includes(value));
    setBlocks(next); setRevision((value) => value + 1);
    setStatus(`${copy.updates} ${next.length ? next.map((value) => copy[value]).join(", ") : copy.empty}`);
  }
  if (resource === "how-it-works") return <div className="proof proof--publishing" data-proof={resource}>
    <p className="proof__hint">{german ? "Vom Entwurf zur Seite. Probiere es aus." : "From draft to page. Try the handoff."}</p>
    <div className="proof__publishing-preview publishing-visual__stage publishing-visual__stage--0">
      <div className="proof__preview-bar"><span>{copy.preview}</span><span className="proof__state" data-dirty={dirty}>{dirty ? german ? "Entwurf" : "Draft" : german ? "Veröffentlicht" : "Published"}</span></div>
      <div className="proof__headline-slot"><strong key={headlineIndex} className="proof__animated-headline">{headline}</strong></div>
      <div className="proof__page-lines" aria-hidden="true"><span /><span /></div>
      <div className="proof__publish-track" key={revision} data-saved={!dirty} aria-hidden="true"><span /></div>
    </div>
    <div className="proof__publishing-actions publishing-visual__stage publishing-visual__stage--1">
      <div className="proof__carousel-controls"><button type="button" className="proof__change" onClick={() => { const next = (headlineIndex + 1) % headlines.length; setHeadlineIndex(next); setHeadline(headlines[next]); setStatus(`${copy.updates} ${headlines[next]}`); }}>{copy.headline} <Arrow name="refresh" /></button><span className="proof__count" aria-label={german ? "Beispiel" : "Example"}>{headlineIndex + 1} / {headlines.length}</span></div>
      <div className="proof__publish-actions"><button type="button" className="proof__publish" aria-disabled={!dirty} onClick={() => { if (dirty) { setSaved(headline); setRevision((value) => value + 1); setStatus(copy.published); } }}>{copy.publish}<Arrow name="up" /></button><button type="button" className="proof__reset" onClick={reset}>{copy.reset}</button></div>
    </div>
    <p className="proof__footer">{copy.local}</p><p className="visually-hidden" role="status">{status}</p>
  </div>;
  if (resource === "home") return <div className="proof proof--home" data-proof={resource}>
    <p className="proof__hint">{german ? "Wähle einen Block. Entdecke seinen Platz auf der Seite." : "Pick a block. See where it belongs on the page."}</p>
    <div className="proof__home-layout"><div className="proof__home-picker publishing-visual__stage publishing-visual__stage--0" role="group" aria-label={copy.included}>
      {allBlocks.map((block, index) => <button type="button" key={block} aria-pressed={selected === block} onClick={() => { setSelected(block); setStatus(`${copy.updates} ${copy[block]}`); }}><span className="proof__block-icon" aria-hidden="true">{index === 0 ? "H" : <Arrow name={index === 1 ? "grid" : "up-right"} />}</span>{copy[block]}<span className="proof__connector" aria-hidden="true" /></button>)}
    </div>
    <div className="proof__home-canvas publishing-visual__stage publishing-visual__stage--1" data-selected={selected}>
      <div className="proof__home-block" data-active={selected === "hero"}><span className="proof__badge">hero</span><strong>{copy.initial}</strong></div>
      <div className="proof__home-block" data-active={selected === "features"}><span className="proof__badge">feature_grid</span><div className="proof-page__features"><span>{copy.featureOne}</span><span>{copy.featureTwo}</span><span>{copy.featureThree}</span></div></div>
      <div className="proof__home-block" data-active={selected === "action"}><span className="proof__badge">cta_band</span><span className="proof-page__cta">{copy.actionText}</span></div>
    </div></div>
    <p className="visually-hidden" role="status">{status}</p>
  </div>;
  return <div className={`proof ${isCampaign ? "proof--campaign" : "proof--blocks"}`} data-proof={resource}>
    <p className="proof__hint" id={`${id}-hint`}>{isBlocks ? copy.blocksHint : isCampaign ? copy.campaignHint : copy.edit}</p>
    <div className="proof__flow" aria-describedby={`${id}-hint`}>
      <div className="publishing-visual__stage publishing-visual__stage--0 proof__controls">
        {isBlocks ? <fieldset className="proof__choices"><legend>{copy.included}</legend>{allBlocks.map((block) => <button type="button" key={block} aria-pressed={blocks.includes(block)} onClick={() => toggle(block)}><span aria-hidden="true">{blocks.includes(block) ? "−" : "+"}</span> {copy[block]}</button>)}</fieldset>
          : <>
            <fieldset className="proof__choices"><legend>{copy.audience}</legend>{(["marketers", "developers"] as const).map((value) => <button type="button" key={value} aria-pressed={audience === value} onClick={() => { setAudience(value); setRevision((n) => n + 1); setStatus(`${copy.updates} ${copy[value]}, ${copy[offer]}`); }}>{copy[value]}</button>)}</fieldset>
            <fieldset className="proof__choices"><legend>{copy.offer}</legend>{(["workshop", "checklist"] as const).map((value) => <button type="button" key={value} aria-pressed={offer === value} onClick={() => { setOffer(value); setRevision((n) => n + 1); setStatus(`${copy.updates} ${copy[audience]}, ${copy[value]}`); }}>{copy[value]}</button>)}</fieldset>
          </>}
        <button type="button" className="proof__reset" onClick={reset}>{copy.reset}</button>
      </div>
      <div className="publishing-visual__stage publishing-visual__stage--1 proof__result">
        <span className="proof__heading">{isCampaign ? german ? "Beispielkampagne" : "Sample campaign" : copy.preview}</span>
        {isCampaign ? <div className="proof__campaign" key={revision}><span className="proof__badge">{copy[audience]} · {copy[offer]}</span><strong>{title}</strong><span className="proof-page__cta">{offer === "workshop" ? german ? "Zum Workshop anmelden" : "Join the workshop" : german ? "Checkliste herunterladen" : "Get the checklist"}</span></div>
          : <MiniPage title={headline} blocks={isBlocks ? blocks : allBlocks} copy={copy} revision={revision} />}
      </div>
    </div>
    <p className="proof__footer">{copy.local}</p>
    <p className="visually-hidden" role="status">{status}</p>
  </div>;
}
