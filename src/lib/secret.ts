import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Compare a request secret with the configured one in constant time.
 * Hashing first gives equal-length buffers, so the length does not leak either.
 */
export function secretMatches(given: string | null | undefined, expected: string | null | undefined): boolean {
  if (!given || !expected) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(given), digest(expected));
}
