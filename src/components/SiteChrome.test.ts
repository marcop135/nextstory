import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

import { SiteFooter, SiteHeader, type ChromeCopy } from "@/components/SiteChrome";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname }));

const copy: Record<"en" | "de", ChromeCopy> = {
  en: {
    nav: [{ _uid: "a", label: "Blocks", href: "/blocks" }],
    footerNote: "Next Story demo",
    footerNav: [{ _uid: "s", label: "Source", href: "https://github.com/marcop135/nextstory" }, { _uid: "p", label: "Privacy", href: "/privacy" }],
  },
  de: {
    nav: [{ _uid: "a", label: "Blöcke", href: "/de/blocks" }],
    footerNote: "Next-Story-Demo",
    footerNav: [{ _uid: "s", label: "Quellcode", href: "https://github.com/marcop135/nextstory" }, { _uid: "p", label: "Datenschutz", href: "/privacy" }],
  },
};

beforeEach(() => usePathname.mockReset());

it("keeps German navigation on every German route, whatever page loaded first", () => {
  usePathname.mockReturnValue("/de/how-it-works");
  const html = renderToStaticMarkup(createElement(SiteHeader, { copy }));
  expect(html).toContain('href="/de/blocks"');
  expect(html).toContain(">Blöcke<");
  expect(html).toContain('href="/de"');
  expect(html).not.toContain('href="/blocks"');
});

it("switches the header and footer back to English on English routes", () => {
  usePathname.mockReturnValue("/blocks");
  const header = renderToStaticMarkup(createElement(SiteHeader, { copy }));
  const footer = renderToStaticMarkup(createElement(SiteFooter, { copy }));
  expect(header).toContain('href="/blocks"');
  expect(footer).toContain("Next Story demo");
  expect(footer).toContain("Built and maintained by");
  expect(footer).toContain(">Marco Pontili<");
});

it("renders localized footer groups and CMS links on German routes", () => {
  usePathname.mockReturnValue("/de/blocks");
  const html = renderToStaticMarkup(createElement(SiteFooter, { copy }));
  expect(html).toContain('href="/de/blocks"');
  expect(html).toContain(">Blöcke<");
  expect(html).toContain(">Entdecken<");
  expect(html).toContain(">Projekt<");
  expect(html).toContain(">Website-Infos<");
  expect(html).toContain('href="/privacy"');
  expect(html).toContain(">Datenschutz<");
  expect(html).not.toContain(">Privacy<");
  expect(html).toContain("Entwickelt und gepflegt von");
  expect(html).toMatch(/class="footer-mark"[^>]*href="\/de"/);
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
  expect(html).toMatch(/class="footer-mark"[^>]*href="\/"/);
});

it.each(["/blocks", "/de/blocks"])("marks only the current menu destination at %s", (pathname) => {
  usePathname.mockReturnValue(pathname);
  const html = renderToStaticMarkup(createElement(SiteHeader, { copy }));
  expect(html).toMatch(new RegExp(`aria-current="page"[^>]*href="${pathname}"`));
  expect(html.match(/aria-current="page"/g)).toHaveLength(1);
});
