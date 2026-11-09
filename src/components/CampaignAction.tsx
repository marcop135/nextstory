"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { storyblokEditable } from "@storyblok/react";
import type { CampaignActionBlok } from "@/components/types";
import { formCopy, leadErrorFeedback, validateEmail, validateLeadForm, type FieldErrors } from "@/lib/campaign-form";
import { localeForPathname } from "@/lib/i18n";
import { REPO_URL } from "@/lib/site";
import type { LeadError } from "@/lib/lead";
import { TURNSTILE_ACTION } from "@/lib/turnstile";

type Status = "idle" | "submitting" | "success" | "error";
type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};
declare global {
  interface Window { turnstile?: Turnstile }
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptLoad: Promise<Turnstile> | null = null;

/** Load Cloudflare's script once, and only after a visitor starts using the form. */
function loadTurnstile(): Promise<Turnstile> {
  scriptLoad ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing")));
    script.onerror = () => { scriptLoad = null; reject(new Error("Turnstile failed to load")); };
    document.head.appendChild(script);
  });
  return scriptLoad;
}

class SubmitError extends Error {
  constructor(readonly code: LeadError | "network" | undefined) { super(code ?? "unknown"); }
}

export default function CampaignAction({ blok }: { blok: CampaignActionBlok }) {
  const locale = localeForPathname(usePathname() ?? "/");
  const copy = formCopy[locale];
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [registered, setRegistered] = useState("");
  const container = useRef<HTMLDivElement>(null);
  const success = useRef<HTMLDivElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const consentInput = useRef<HTMLInputElement>(null);
  const widget = useRef<{ id: string; api: Turnstile } | null>(null);
  const pending = useRef<{ resolve: (token: string) => void; reject: (error: Error) => void } | null>(null);
  const emailId = `campaign-email-${blok._uid}`;
  const emailErrorId = `${emailId}-error`;
  const consentId = `campaign-consent-${blok._uid}`;
  const consentErrorId = `${consentId}-error`;
  const noteId = `campaign-note-${blok._uid}`;
  const statusId = `campaign-status-${blok._uid}`;

  useEffect(() => () => { if (widget.current) widget.current.api.remove(widget.current.id); }, []);
  useEffect(() => { if (status === "success") success.current?.focus(); }, [status]);

  async function prepareWidget() {
    if (!SITE_KEY || widget.current || !container.current) return widget.current;
    const api = await loadTurnstile();
    if (widget.current || !container.current) return widget.current;
    // Every terminal outcome must settle the pending submit, or the button stays disabled.
    const fail = (reason: string) => () => { pending.current?.reject(new Error(reason)); pending.current = null; return true; };
    const id = api.render(container.current, {
      sitekey: SITE_KEY,
      action: TURNSTILE_ACTION,
      execution: "execute",
      appearance: "interaction-only",
      language: locale,
      theme: "auto",
      "response-field": false,
      callback: (token: string) => { pending.current?.resolve(token); pending.current = null; },
      "error-callback": fail("Turnstile error"),
      "timeout-callback": fail("Turnstile timeout"),
      "unsupported-callback": fail("Turnstile unsupported"),
      "expired-callback": () => api.reset(id),
    });
    widget.current = { id, api };
    return widget.current;
  }

  async function verificationToken(): Promise<string> {
    try {
      const ready = await prepareWidget();
      if (!ready) return "";
      return await new Promise((resolve, reject) => {
        pending.current = { resolve, reject };
        ready.api.execute(ready.id);
      });
    } catch {
      throw new SubmitError("verification_failed");
    }
  }

  /** Show field errors and move focus to the first field that needs attention. */
  function showErrors(next: FieldErrors) {
    setErrors(next);
    (next.email ? emailInput.current : next.consent ? consentInput.current : null)?.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const invalid = validateLeadForm({ email, consent: data.get("consent") === "on" }, locale);
    const count = Object.keys(invalid).length;
    if (count) {
      setStatus("error");
      setMessage(copy.summary(count));
      showErrors(invalid);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    setErrors({});
    setMessage("");
    setStatus("submitting");
    try {
      const verification = await verificationToken();
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consent: true,
          website: data.get("website"),
          campaign_id: blok.campaign_id,
          page_uri: window.location.href,
          page_name: document.title,
          referrer: document.referrer,
          verification,
          ...Object.fromEntries(UTM_KEYS.map((key) => [key, params.get(key) ?? ""])),
        }),
      }).catch(() => { throw new SubmitError("network"); });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: LeadError } | null;
        throw new SubmitError(body?.error);
      }
      form.reset();
      setRegistered(email);
      setStatus("success");
      (window._paq = window._paq || []).push(["trackEvent", "campaign", "lead", blok.campaign_id]);
    } catch (error) {
      const feedback = leadErrorFeedback(error instanceof SubmitError ? error.code : undefined, locale, blok.error_message ?? "");
      setStatus("error");
      setMessage(feedback.message);
      if (feedback.field) showErrors(feedback.field);
    } finally {
      // Tokens are single-use; the next attempt needs a fresh challenge.
      if (widget.current) widget.current.api.reset(widget.current.id);
    }
  }

  const submitting = status === "submitting";
  const describedBy = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;
  return (
    <section id="campaign-action" className="campaign-action" {...storyblokEditable(blok)}>
      <div className="wrap campaign-action__layout">
        <div>
          <p className="eyebrow">{blok.eyebrow}</p>
          <h2>{blok.headline}</h2>
          <p>{blok.text}</p>
        </div>
        <div className="campaign-action__panel">
          {status === "success" ? (
            <div ref={success} className="campaign-action__success" tabIndex={-1} role="status">
              <svg className="campaign-action__check" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" /><path d="m7 12.5 3.2 3.2L17 9" /></svg>
              <h3>{copy.successTitle}</h3>
              <p>{blok.success_message}</p>
              {registered ? <p className="campaign-action__registered">{copy.successEmail(registered)}</p> : null}
              <p className="campaign-action__next">
                <a href={`${REPO_URL}/blob/main/docs/architecture.md#campaign-to-lead`}>{copy.trace}</a>
              </p>
            </div>
          ) : null}
          <form
            className="campaign-action__form"
            hidden={status === "success"}
            noValidate
            onSubmit={submit}
            onFocus={() => { void prepareWidget().catch(() => {}); }}
            aria-busy={submitting}
            aria-describedby={statusId}
          >
            <p id={noteId} className="campaign-action__note">{blok.demo_note}</p>
            <div className="campaign-action__field">
              <label htmlFor={emailId}>{blok.email_label}</label>
              <input
                ref={emailInput}
                id={emailId}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={254}
                required
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={describedBy(noteId, errors.email && emailErrorId)}
                onBlur={(event) => {
                  const value = event.currentTarget.value;
                  if (value.trim() || errors.email) setErrors((current) => ({ ...current, email: validateEmail(value, locale) }));
                }}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (errors.email) setErrors((current) => ({ ...current, email: validateEmail(value, locale) }));
                }}
              />
              {errors.email ? <p id={emailErrorId} className="campaign-action__error">{errors.email}</p> : null}
            </div>
            <div className="campaign-action__field">
              <div className="campaign-action__consent">
                <input
                  ref={consentInput}
                  id={consentId}
                  name="consent"
                  type="checkbox"
                  required
                  aria-invalid={errors.consent ? true : undefined}
                  aria-describedby={describedBy(errors.consent && consentErrorId)}
                  onChange={(event) => {
                    if (event.currentTarget.checked && errors.consent) setErrors((current) => ({ ...current, consent: undefined }));
                  }}
                />
                <label htmlFor={consentId}>
                  {blok.consent_label}{" "}
                  <a href={blok.privacy_link_href}>{blok.privacy_link_label}</a>.
                </label>
              </div>
              {errors.consent ? <p id={consentErrorId} className="campaign-action__error">{errors.consent}</p> : null}
            </div>
            <div className="campaign-action__trap" aria-hidden="true">
              <label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
            </div>
            <div ref={container} className="campaign-action__verification" />
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? <><span className="campaign-action__spinner" aria-hidden="true" />{copy.sending}</> : blok.button_label}
            </button>
            <p id={statusId} className="campaign-action__status" role="status" data-tone={status === "error" && message ? "error" : undefined}>{message}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
