"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { locales, switchLocalePath, type Locale } from "@/lib/i18n";

const labels: Record<Locale, { short: string; name: string }> = {
  en: { short: "EN", name: "English" },
  de: { short: "DE", name: "Deutsch" },
};

export default function LanguageSwitch({ current }: { current: Locale }) {
  const pathname = usePathname() ?? "/";
  return (
    <ul className="lang-switch" aria-label={current === "de" ? "Sprache" : "Language"}>
      {locales.map((locale) => (
        <li key={locale}>
          {locale === current ? (
            <span aria-current="true" lang={locale} title={labels[locale].name} aria-label={`${labels[locale].short}: ${labels[locale].name}`}>
              {labels[locale].short}
            </span>
          ) : (
            <Link
              href={switchLocalePath(pathname, locale)}
              hrefLang={locale}
              lang={locale}
              title={labels[locale].name}
              aria-label={`${labels[locale].short}: ${labels[locale].name}`}
            >
              {labels[locale].short}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
