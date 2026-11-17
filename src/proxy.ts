import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

import {
  matomoTrackingUrl,
  shouldSkipPath,
  uaIsAiAssistant,
} from "@/lib/ai-assistant";
import { markdownPathForPage } from "@/lib/agent-paths";
import { DISCOVERY_LINK } from "@/lib/discovery-links";
import { LOCALE_HEADER, localeForPathname } from "@/lib/i18n";
import { preferredRepresentation } from "@/lib/negotiate";

/**
 * Pass the path locale to the root layout, and report AI-assistant fetches to
 * Matomo. Runs before the Vercel cache, so cached pages count too.
 *
 * Page URLs with a Markdown twin negotiate on `Accept`: Markdown is served
 * from the `/content/...md` route, an unacceptable type gets 406, and HTML
 * advertises its twin in a `Link` header. Router (RSC) requests skip this.
 */
export function proxy(request: NextRequest, event: NextFetchEvent) {
  const ua = request.headers.get("user-agent") ?? "";
  if (uaIsAiAssistant(ua) && !shouldSkipPath(request.nextUrl.pathname)) {
    event.waitUntil(
      fetch(matomoTrackingUrl(request.url, ua), { method: "GET" }).catch(
        () => {},
      ),
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, localeForPathname(request.nextUrl.pathname));

  const markdownPath = negotiable(request) ? markdownPathForPage(request.nextUrl.pathname) : null;
  if (!markdownPath) return NextResponse.next({ request: { headers: requestHeaders } });

  const representation = preferredRepresentation(request.headers.get("accept"));
  if (representation === "none") {
    return new NextResponse("Not Acceptable: this page is available as text/html or text/markdown.\n", {
      status: 406,
      headers: { "Content-Type": "text/plain; charset=utf-8", Vary: "Accept", Link: alternateLink(markdownPath) },
    });
  }
  if (representation === "markdown") {
    const response = NextResponse.rewrite(new URL(markdownPath, request.url), { request: { headers: requestHeaders } });
    response.headers.set("Vary", "Accept");
    return response;
  }
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Vary", "Accept");
  response.headers.set("Link", alternateLink(markdownPath));
  return response;
}

/** Replaces the config `Link` header on this response, so it repeats the discovery links. */
const alternateLink = (markdownPath: string) =>
  `<${markdownPath}>; rel="alternate"; type="text/markdown", ${DISCOVERY_LINK}`;

function negotiable(request: NextRequest): boolean {
  const method = request.method ?? "GET";
  if (method !== "GET" && method !== "HEAD") return false;
  return !request.headers.has("rsc") && !request.headers.has("next-router-prefetch");
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\.ico|.*\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|eot|otf)$).*)",
  ],
};
