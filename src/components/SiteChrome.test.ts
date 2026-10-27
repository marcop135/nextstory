import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

import { SiteFooter, SiteHeader, type ChromeCopy } from "@/components/SiteChrome";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname }));

const copy: Record<"en" | "de", ChromeCopy> = {
  en: {
    nav: [{ _uid: "a", label: "Pricing", href: "/pricing" }],
    footerNote: "Next Story demo",
    footerNav: [{ _uid: "p", label: "Privacy", href: "/privacy" }],
  },
  de: {
    nav: [{ _uid: "a", label: "Preise", href: "/de/pricing" }],
    footerNote: "Next-Story-Demo",
    footerNav: [{ _uid: "p", label: "Datenschutz", href: "/privacy" }],
  },
};

beforeEach(() => usePathname.mockReset());

it("keeps German navigation on every German route, whatever page loaded first", () => {
  usePathname.mockReturnValue("/de/how-it-works");
  const html = renderToStaticMarkup(createElement(SiteHeader, { copy }));
  expect(html).toContain('href="/de/pricing"');
  expect(html).toContain(">Preise<");
  expect(html).toContain('href="/de"');
  expect(html).not.toContain('href="/pricing"');
});

it("switches the header and footer back to English on English routes", () => {
  usePathname.mockReturnValue("/blocks");
  const header = renderToStaticMarkup(createElement(SiteHeader, { copy }));
  const footer = renderToStaticMarkup(createElement(SiteFooter, { copy }));
  expect(header).toContain('href="/pricing"');
  expect(footer).toContain("Next Story demo");
  expect(footer).toContain("Built and maintained by");
  expect(footer).toContain(">Marco Pontili<");
});

it("renders localized footer groups and CMS links on German routes", () => {
  usePathname.mockReturnValue("/de/blocks");
  const html = renderToStaticMarkup(createElement(SiteFooter, { copy }));
  expect(html).toContain('href="/de/pricing"');
  expect(html).toContain(">Preise<");
  expect(html).toContain(">Entdecken<");
  expect(html).toContain(">Projekt<");
  expect(html).toContain('href="/privacy"');
  expect(html).toContain(">Datenschutz<");
  expect(html).not.toContain(">Privacy<");
  expect(html).toContain("Entwickelt und gepflegt von");
});

it("uses the CMS project destinations without hard-coded utility links", () => {
  usePathname.mockReturnValue("/");
  const html = renderToStaticMarkup(createElement(SiteFooter, {
    copy: { ...copy, en: { ...copy.en, footerNav: [{ _uid: "custom", label: "Source code", href: "https://example.com/source" }] } },
  }));
  expect(html).toContain('href="https://example.com/source"');
  expect(html).toContain(">Source code<");
  expect(html).not.toContain('href="/privacy"');
  expect(html).not.toContain('href="/for-agents"');
});
