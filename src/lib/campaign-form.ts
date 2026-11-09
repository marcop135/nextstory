import type { Locale } from "@/lib/i18n";
import type { LeadError } from "@/lib/lead";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors = { email?: string; consent?: string };

/** Interface copy the CMS does not model: field errors, server outcomes, and success controls. */
export const formCopy = {
  en: {
    emailMissing: "Enter your email address.",
    emailInvalid: "Enter an email address in the format name@example.com.",
    consentMissing: "Tick the box to agree before registering.",
    summary: (count: number) => (count === 1 ? "Fix 1 field to continue." : `Fix ${count} fields to continue.`),
    sending: "Sending…",
    successTitle: "You're registered",
    successEmail: (email: string) => `Registered: ${email}`,
    trace: "Follow this registration through the code",
    rate_limited: "Too many attempts from this connection. Wait a minute, then try again.",
    verification_failed: "The automatic bot check did not pass. Try again; if it keeps failing, reload the page.",
    unavailable: "Registration is unavailable right now. Try again in a few minutes.",
    upstream_error: "The registration service did not respond. Try again in a few minutes.",
    network: "No response from the server. Check your connection, then try again.",
  },
  de: {
    emailMissing: "E-Mail-Adresse eingeben.",
    emailInvalid: "E-Mail-Adresse im Format name@beispiel.de eingeben.",
    consentMissing: "Vor dem Absenden das Kästchen zur Einwilligung ankreuzen.",
    summary: (count: number) => (count === 1 ? "1 Feld korrigieren, um fortzufahren." : `${count} Felder korrigieren, um fortzufahren.`),
    sending: "Wird gesendet …",
    successTitle: "Sie sind vorgemerkt",
    successEmail: (email: string) => `Vorgemerkt: ${email}`,
    trace: "Den Weg dieser Anmeldung im Code verfolgen",
    rate_limited: "Zu viele Versuche von dieser Verbindung. Eine Minute warten und erneut versuchen.",
    verification_failed: "Die automatische Bot-Prüfung ist fehlgeschlagen. Erneut versuchen; bei wiederholtem Fehler die Seite neu laden.",
    unavailable: "Die Anmeldung ist gerade nicht verfügbar. In einigen Minuten erneut versuchen.",
    upstream_error: "Der Anmeldedienst hat nicht geantwortet. In einigen Minuten erneut versuchen.",
    network: "Keine Antwort vom Server. Verbindung prüfen und erneut versuchen.",
  },
} as const;

export function validateEmail(value: string, locale: Locale): string | undefined {
  const email = value.trim();
  if (!email) return formCopy[locale].emailMissing;
  if (email.length > 254 || !EMAIL.test(email)) return formCopy[locale].emailInvalid;
  return undefined;
}

export function validateLeadForm(values: { email: string; consent: boolean }, locale: Locale): FieldErrors {
  const errors: FieldErrors = {};
  const email = validateEmail(values.email, locale);
  if (email) errors.email = email;
  if (!values.consent) errors.consent = formCopy[locale].consentMissing;
  return errors;
}

/**
 * Turn a failed submission into feedback. Field-level codes return a field
 * error; everything else returns a form message, falling back to the CMS
 * error text for codes a visitor cannot act on.
 */
export function leadErrorFeedback(
  error: LeadError | "network" | undefined,
  locale: Locale,
  fallback: string,
): { field?: FieldErrors; message: string } {
  const copy = formCopy[locale];
  switch (error) {
    case "consent_required":
      return { field: { consent: copy.consentMissing }, message: copy.summary(1) };
    case "rate_limited":
    case "verification_failed":
    case "unavailable":
    case "upstream_error":
    case "network":
      return { message: copy[error] };
    default:
      return { message: fallback };
  }
}
