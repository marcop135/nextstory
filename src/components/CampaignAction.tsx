"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { storyblokEditable } from "@storyblok/react";
import type { CampaignActionBlok } from "@/components/types";
import { localeForPathname } from "@/lib/i18n";
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

export default function CampaignAction({ blok }: { blok: CampaignActionBlok }) {
  const [status, setStatus] = useState<Status>("idle");
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<{ id: string; api: Turnstile } | null>(null);
  const pending = useRef<{ resolve: (token: string) => void; reject: (error: Error) => void } | null>(null);
  const emailId = `campaign-email-${blok._uid}`;
  const consentId = `campaign-consent-${blok._uid}`;
  const noteId = `campaign-note-${blok._uid}`;
  const statusId = `campaign-status-${blok._uid}`;

  useEffect(() => () => { if (widget.current) widget.current.api.remove(widget.current.id); }, []);

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
      language: localeForPathname(window.location.pathname),
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
    const ready = await prepareWidget();
    if (!ready) return "";
    return new Promise((resolve, reject) => {
      pending.current = { resolve, reject };
      ready.api.execute(ready.id);
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const params = new URLSearchParams(window.location.search);
    setStatus("submitting");
    try {
      const verification = await verificationToken();
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
          campaign_id: blok.campaign_id,
          page_uri: window.location.href,
          page_name: document.title,
          referrer: document.referrer,
          verification,
          ...Object.fromEntries(UTM_KEYS.map((key) => [key, params.get(key) ?? ""])),
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      setStatus("success");
      (window._paq = window._paq || []).push(["trackEvent", "campaign", "lead", blok.campaign_id]);
    } catch {
      setStatus("error");
    } finally {
      // Tokens are single-use; the next attempt needs a fresh challenge.
      if (widget.current) widget.current.api.reset(widget.current.id);
    }
  }

  const message = status === "success" ? blok.success_message : status === "error" ? blok.error_message : "";
  return (
    <section id="campaign-action" className="campaign-action" {...storyblokEditable(blok)}>
      <div className="wrap campaign-action__layout">
        <div>
          <p className="eyebrow">{blok.eyebrow}</p>
          <h2>{blok.headline}</h2>
          <p>{blok.text}</p>
        </div>
        <form className="campaign-action__form" onSubmit={submit} onFocus={() => { void prepareWidget().catch(() => {}); }} aria-busy={status === "submitting"} aria-describedby={statusId}>
          <p id={noteId} className="campaign-action__note">{blok.demo_note}</p>
          <label htmlFor={emailId}>{blok.email_label}</label>
          <input id={emailId} name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} required aria-describedby={noteId} />
          <div className="campaign-action__consent">
            <input id={consentId} name="consent" type="checkbox" required />
            <label htmlFor={consentId}>
              {blok.consent_label}{" "}
              <a href={blok.privacy_link_href}>{blok.privacy_link_label}</a>.
            </label>
          </div>
          <div className="campaign-action__trap" aria-hidden="true">
            <label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
          </div>
          <div ref={container} className="campaign-action__verification" />
          <button className="btn" type="submit" disabled={status === "submitting"}>{blok.button_label}</button>
          <p id={statusId} className="campaign-action__status" role="status">{message}</p>
        </form>
      </div>
    </section>
  );
}
