import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Compare a request secret with the configured one in constant time.
 * Hashing first gives equal-length buffers, so the length does not leak either.
 */
export function secretMatches(given: string | null | undefined, expected: string | null | undefined): boolean {
  if (!given || !expected) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(given), digest(expected));
}

/** Verify Storyblok's `webhook-signature`: a hex HMAC-SHA1 of the raw request body keyed by the webhook secret. */
export function signatureMatches(rawBody: string, signature: string | null | undefined, secret: string | null | undefined): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac("sha1", secret).update(rawBody).digest();
  const given = Buffer.from(signature.trim(), "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
