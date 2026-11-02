"use client";

import Link from "next/link";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main id="main" tabIndex={-1} className="wrap not-found">
      <h1>Something went wrong</h1>
      <p>The page could not load its content. Try again in a moment.</p>
      <p>
        <button type="button" className="btn" onClick={reset}>
          Try again
        </button>
      </p>
      <p>
        <Link href="/">Back home</Link>
      </p>
    </main>
  );
}
