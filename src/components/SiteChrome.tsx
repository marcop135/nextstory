"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import LanguageSwitch from "@/components/LanguageSwitch";
import { defaultLocale, localeForPathname, type Locale } from "@/lib/i18n";
import { AUTHOR, REPO_URL } from "@/lib/site";
import { version } from "../../package.json";

export type ChromeCopy = {
  nav: { _uid: string; label: string; href: string }[];
  footerNav?: { _uid: string; label: string; href: string }[];
  footerNote: string;
};

const SITE_INFO_PATHS = new Set(["/privacy", "/for-agents", "/llms.txt"]);

/**
 * Header and footer pick their language from the current path on every
 * navigation. The root layout is not re-rendered on client-side navigation,
 * so a locale read on the server would stick to the first page loaded.
 */
function useLocale(): Locale {
  const locale = localeForPathname(usePathname() ?? "/");
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return locale;
}

export function SiteHeader({ copy }: { copy: Record<Locale, ChromeCopy> }) {
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [previousPathname, setPreviousPathname] = useState(pathname);
  const home = locale === defaultLocale ? "/" : `/${locale}`;

  // Close the small-screen menu after navigating or on Escape.
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <a className="skip-link" href="#main">
        {locale === "de" ? "Zum Inhalt springen" : "Skip to content"}
      </a>
      <header className="site-header">
        <div className="wrap">
          <Link className="brand" href={home}>
            Next Story
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen(!open)}
          >
            <span className="menu-toggle__icon" aria-hidden="true" />
            <span className="visually-hidden">{locale === "de" ? "Menü" : "Menu"}</span>
          </button>
          <nav
            id="site-nav"
            className="nav"
            data-open={open}
            aria-label={locale === "de" ? "Hauptnavigation" : "Primary"}
          >
            {copy[locale].nav.map((link) => (
              <Link key={link._uid} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>
                {link.label}
              </Link>
            ))}
            <LanguageSwitch current={locale} />
          </nav>
        </div>
      </header>
    </>
  );
}

export function SiteFooter({ copy }: { copy: Record<Locale, ChromeCopy> }) {
  const locale = useLocale();
  const projectLinks = copy[locale].footerNav?.filter((link) => !SITE_INFO_PATHS.has(link.href))
    .sort((a, b) => Number(b.href === REPO_URL) - Number(a.href === REPO_URL));
  const siteInfoLinks = copy[locale].footerNav?.filter((link) => SITE_INFO_PATHS.has(link.href));
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div>
          <p className="footer-note">{copy[locale].footerNote} <span className="footer-version">v{version}</span></p>
          <p>
            {locale === "de" ? "Entwickelt und gepflegt von" : "Built and maintained by"}{" "}
            <a href={AUTHOR.url} title={AUTHOR.name}>{AUTHOR.name}</a>
          </p>
          <Link className="footer-mark" href={locale === "de" ? "/de" : "/"} aria-label={locale === "de" ? "Next Story Startseite" : "Next Story home"}>
            <Image src="/icon.svg" alt="" width={48} height={48} />
          </Link>
        </div>
        <div className="footer-links">
          <nav className="footer-nav" aria-labelledby="footer-explore">
            <h2 className="footer-nav__heading" id="footer-explore">
              {locale === "de" ? "Entdecken" : "Explore"}
            </h2>
            {copy[locale].nav.map((link) => (
              <Link key={link._uid} href={link.href}>{link.label}</Link>
            ))}
          </nav>
          {!!projectLinks?.length && (
            <nav className="footer-nav" aria-labelledby="footer-project">
              <h2 className="footer-nav__heading" id="footer-project">
                {locale === "de" ? "Projekt" : "Project"}
              </h2>
              {projectLinks.map((link) => link.href === REPO_URL ? (
                <a key={link._uid} className="footer-source" href={link.href} target="_blank" rel="noopener noreferrer">
                  <svg className="footer-source__icon" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                  </svg>
                  {link.label}
                </a>
              ) : (
                <Link key={link._uid} href={link.href}>{link.label}</Link>
              ))}
            </nav>
          )}
          {!!siteInfoLinks?.length && (
            <nav className="footer-nav" aria-labelledby="footer-site-info">
              <h2 className="footer-nav__heading" id="footer-site-info">{locale === "de" ? "Website-Infos" : "Site Info"}</h2>
              {siteInfoLinks.map((link) => link.href === "/llms.txt"
                ? <a key={link._uid} href={link.href}>{link.label}</a>
                : <Link key={link._uid} href={link.href}>{link.label}</Link>)}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
