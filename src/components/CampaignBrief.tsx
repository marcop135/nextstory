import { storyblokEditable } from "@storyblok/react/rsc";
import type { CampaignBriefBlok } from "@/components/types";

export default function CampaignBrief({ blok }: { blok: CampaignBriefBlok }) {
  return (
    <section className="campaign-brief" {...storyblokEditable(blok)}>
      <div className="wrap">
        <p className="eyebrow">{blok.eyebrow}</p>
        <h2>{blok.headline}</h2>
        <p className="section-intro">{blok.text}</p>
        <dl className="campaign-brief__facts">
          <div><dt>{blok.audience_label}</dt><dd>{blok.audience}</dd></div>
          <div><dt>{blok.goal_label}</dt><dd>{blok.goal}</dd></div>
          <div><dt>{blok.measure_label}</dt><dd>{blok.measure}</dd></div>
        </dl>
        {blok.link_href && blok.link_label ? <a href={blok.link_href}>{blok.link_label}</a> : null}
      </div>
    </section>
  );
}
