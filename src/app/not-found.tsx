import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="wrap not-found">
      <h1>Page not found</h1>
      <p>
        No story for this path
        {process.env.STORYBLOK_DELIVERY_API_TOKEN
          ? " in Storyblok (or mock fallback when no token)."
          : " in the seed stories under storyblok/stories."}
      </p>
      <p>
        Try <Link href="/how-it-works">How it works</Link> or the{" "}
        <Link href="/blocks">block library</Link>, or go <Link href="/">back home</Link>.
      </p>
    </main>
  );
}
