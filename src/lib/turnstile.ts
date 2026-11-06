const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Widget action, checked on both sides so a token from another form is rejected. */
export const TURNSTILE_ACTION = "campaign-lead";

/**
 * Validate a Cloudflare Turnstile token server-side. Tokens are single-use and
 * expire after 300 seconds; the client-side widget alone proves nothing.
 */
export async function verifyTurnstile(token: string, secret: string, remoteIp?: string): Promise<boolean> {
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);
  try {
    const response = await fetch(SITEVERIFY, { method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean; action?: string };
    // Cloudflare's dummy test keys report an empty action; real widgets echo the rendered one.
    return result.success === true && (!result.action || result.action === TURNSTILE_ACTION);
  } catch {
    return false;
  }
}
