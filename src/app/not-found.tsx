import type { Metadata } from "next";
import Link from "next/link";

import { notFoundTitle } from "@/lib/site";
import { requestLocale } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return { title: { absolute: notFoundTitle(await requestLocale()) } };
}

export default async function NotFound() {
  const de = (await requestLocale()) === "de";
  return (
    <main id="main" tabIndex={-1} className="wrap not-found">
      <h1>{de ? "Seite nicht gefunden" : "Page not found"}</h1>
      <p>
        {de ? "Für diesen Pfad gibt es keine Story" : "No story for this path"}
        {process.env.STORYBLOK_DELIVERY_API_TOKEN
          ? de
            ? " in Storyblok (oder als Mock, wenn kein Token gesetzt ist)."
            : " in Storyblok (or mock fallback when no token)."
          : de
            ? " in den Seed-Stories unter storyblok/stories."
            : " in the seed stories under storyblok/stories."}
      </p>
      <p>
        {de ? (
          <>
            <Link href="/de/how-it-works">So funktioniert es</Link> oder die{" "}
            <Link href="/de/blocks">Block-Bibliothek</Link> ausprobieren, oder{" "}
            <Link href="/de">zurück zur Startseite</Link>.
          </>
        ) : (
          <>
            Try <Link href="/how-it-works">How it works</Link> or the{" "}
            <Link href="/blocks">block library</Link>, or go <Link href="/">back home</Link>.
          </>
        )}
      </p>
    </main>
  );
}
