"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { localeForPathname } from "@/lib/i18n";

export default function Error({ reset }: { reset: () => void }) {
  const de = localeForPathname(usePathname() ?? "/") === "de";
  return (
    <main id="main" tabIndex={-1} className="wrap not-found">
      <h1>{de ? "Etwas ist schiefgelaufen" : "Something went wrong"}</h1>
      <p>
        {de
          ? "Der Inhalt dieser Seite konnte nicht geladen werden. Gleich noch einmal versuchen."
          : "The page could not load its content. Try again in a moment."}
      </p>
      <p>
        <button type="button" className="btn" onClick={reset}>
          {de ? "Erneut versuchen" : "Try again"}
        </button>
      </p>
      <p>
        <Link href={de ? "/de" : "/"}>{de ? "Zur Startseite" : "Back home"}</Link>
      </p>
    </main>
  );
}
