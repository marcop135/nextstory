import { expect, it } from "vitest";

import { formCopy, leadErrorFeedback, validateEmail, validateLeadForm } from "@/lib/campaign-form";

it("explains a missing or malformed email in the page language", () => {
  expect(validateEmail("  ", "en")).toBe(formCopy.en.emailMissing);
  expect(validateEmail("name@", "de")).toBe(formCopy.de.emailInvalid);
  expect(validateEmail(`${"a".repeat(250)}@x.de`, "en")).toBe(formCopy.en.emailInvalid);
  expect(validateEmail(" ada@example.com ", "en")).toBeUndefined();
});

it("reports every field that blocks submission", () => {
  expect(validateLeadForm({ email: "", consent: false }, "en")).toEqual({ email: formCopy.en.emailMissing, consent: formCopy.en.consentMissing });
  expect(validateLeadForm({ email: "ada@example.com", consent: true }, "de")).toEqual({});
});

it("maps server error codes to actionable feedback", () => {
  expect(leadErrorFeedback("consent_required", "en", "fallback")).toEqual({ field: { consent: formCopy.en.consentMissing }, message: formCopy.en.summary(1) });
  expect(leadErrorFeedback("rate_limited", "de", "fallback").message).toBe(formCopy.de.rate_limited);
  expect(leadErrorFeedback("network", "en", "fallback").message).toBe(formCopy.en.network);
  expect(leadErrorFeedback("invalid_request", "en", "fallback").message).toBe("fallback");
  expect(leadErrorFeedback(undefined, "en", "fallback").message).toBe("fallback");
});
