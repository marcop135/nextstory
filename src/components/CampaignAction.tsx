"use client";

import { useState } from "react";
import { storyblokEditable } from "@storyblok/react";
import type { CampaignActionBlok } from "@/components/types";

export default function CampaignAction({ blok }: { blok: CampaignActionBlok }) {
  const [complete, setComplete] = useState(false);
  const emailId = `campaign-email-${blok._uid}`;
  const noteId = `campaign-note-${blok._uid}`;
  return (
    <section id="campaign-action" className="campaign-action" {...storyblokEditable(blok)}>
      <div className="wrap campaign-action__layout">
        <div>
          <p className="eyebrow">{blok.eyebrow}</p>
          <h2>{blok.headline}</h2>
          <p>{blok.text}</p>
        </div>
        <form className="campaign-action__form" onSubmit={(event) => {
          event.preventDefault();
          event.currentTarget.reset();
          setComplete(true);
        }}>
          <p id={noteId} className="campaign-action__note">{blok.demo_note}</p>
          <label htmlFor={emailId}>{blok.email_label}</label>
          <input id={emailId} type="email" autoComplete="email" required aria-describedby={noteId} />
          <button className="btn" type="submit">{blok.button_label}</button>
          <p className="campaign-action__status" role="status">{complete ? blok.success_message : ""}</p>
        </form>
      </div>
    </section>
  );
}
