"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import LanguageSwitch from "@/components/LanguageSwitch";
import { defaultLocale, localeForPathname, type Locale } from "@/lib/i18n";
import { AUTHOR } from "@/lib/site";

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
  const projectLinks = copy[locale].footerNav?.filter((link) => !SITE_INFO_PATHS.has(link.href));
  const siteInfoLinks = copy[locale].footerNav?.filter((link) => SITE_INFO_PATHS.has(link.href));
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div>
          <p className="footer-note">{copy[locale].footerNote}</p>
          <p>
            {locale === "de" ? "Entwickelt und gepflegt von" : "Built and maintained by"}{" "}
            <a href={AUTHOR.url}>{AUTHOR.name}</a>
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
              {projectLinks.map((link) => (
                <Link key={link._uid} href={link.href}>{link.label}</Link>
              ))}
            </nav>
          )}
          {!!siteInfoLinks?.length && (
            <nav className="footer-nav" aria-labelledby="footer-site-info">
              <h2 className="footer-nav__heading" id="footer-site-info">{locale === "de" ? "Website-Infos" : "Site Info"}</h2>
              {siteInfoLinks.map((link) => <Link key={link._uid} href={link.href}>{link.label}</Link>)}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
