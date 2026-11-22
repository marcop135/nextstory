"use client";

import { type FormEvent, type ReactNode } from "react";

const ERROR_ID = "feature-choice-error";

/** Posts the campaign picks. An empty selection stays on the page and shows the error. */
export default function CampaignChoiceForm({ className, children }: { className: string; children: ReactNode }) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    if (new FormData(form).getAll("featureUids").length > 0) return;
    event.preventDefault();
    const message = form.querySelector<HTMLElement>(`#${ERROR_ID}`);
    const fieldset = form.querySelector("fieldset");
    if (!message || !fieldset) return;
    message.hidden = false;
    fieldset.setAttribute("aria-invalid", "true");
    fieldset.setAttribute("aria-describedby", ERROR_ID);
    message.focus();
  }

  return (
    <form className={className} method="post" action="/api/campaign-draft" onSubmit={onSubmit}>
      {children}
    </form>
  );
}
