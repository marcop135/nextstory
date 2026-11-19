# Changelog

- **Format:** Based on [Keep a Changelog](https://keepachangelog.com).
- **Voice:** Use the imperative, like a commit message. Write add, fix, increase, force, not added, fixed, increased, forced.
- **Length:** Keep each bullet on one line, max 120 characters (link URLs do not count toward the cap, only the visible text does).
- **Links:** Add inline markdown links for related PRs, docs, and external references when they help the reader.

## [Unreleased]

### Fixed

- Campaign: Require a workshop pick before saving a draft ([#144](https://github.com/marcop135/nextstory/pull/144)) ([#143](https://github.com/marcop135/nextstory/issues/143)).
- Campaign: Show Open and Update as one primary and one secondary button ([#144](https://github.com/marcop135/nextstory/pull/144)) ([#143](https://github.com/marcop135/nextstory/issues/143)).

## [0.16.0] - 2026-11-19

### Added

- Campaign: Show a draft page whose banner, headline, and features follow the picks on the campaign page ([#141](https://github.com/marcop135/nextstory/pull/141)) ([#140](https://github.com/marcop135/nextstory/issues/140)).

### Changed

- Campaign: Let visitors pick workshop benefits, see saved picks by name, and open or update their draft ([#141](https://github.com/marcop135/nextstory/pull/141)) ([#140](https://github.com/marcop135/nextstory/issues/140)).

## [0.15.4] - 2026-11-18

### Added

- Privacy: Serve `/.well-known/gpc.json` and keep Matomo loaded ([#138](https://github.com/marcop135/nextstory/pull/138)) ([#137](https://github.com/marcop135/nextstory/issues/137)).

### Changed

- Privacy: State that Matomo loads when Do Not Track or Global Privacy Control is on ([#138](https://github.com/marcop135/nextstory/pull/138)) ([#137](https://github.com/marcop135/nextstory/issues/137)).

### Fixed

- Metadata: Lengthen the cache invalidation and content relationships descriptions past 70 characters ([#138](https://github.com/marcop135/nextstory/pull/138)) ([#137](https://github.com/marcop135/nextstory/issues/137)).
- A11y: Name the missing page in the 404 title, and show the 404 and error pages in German ([#138](https://github.com/marcop135/nextstory/pull/138)) ([#137](https://github.com/marcop135/nextstory/issues/137)).

## [0.15.3] - 2026-11-18

### Changed

- Deps: Update Next.js to 16.4.6, `@storyblok/react` to 7.5.1, and Playwright to 1.65.1 ([#129](https://github.com/marcop135/nextstory/pull/129)).

### Fixed

- Sitemap: Add the x-default alternate to sitemap entries and lastmod to the privacy page entry ([#131](https://github.com/marcop135/nextstory/pull/131)) ([#127](https://github.com/marcop135/nextstory/issues/127)).
- A11y: Name the scrollable code blocks as regions so screen readers announce their labels ([#132](https://github.com/marcop135/nextstory/pull/132)) ([#128](https://github.com/marcop135/nextstory/issues/128)).
- A11y: Announce the full language name on the EN/DE switch ([#132](https://github.com/marcop135/nextstory/pull/132)) ([#128](https://github.com/marcop135/nextstory/issues/128)).
- A11y: Return focus to the menu button when Escape closes the mobile menu ([#132](https://github.com/marcop135/nextstory/pull/132)) ([#128](https://github.com/marcop135/nextstory/issues/128)).
- A11y: Mark the campaign form's email and consent fields as required ([#132](https://github.com/marcop135/nextstory/pull/132)) ([#128](https://github.com/marcop135/nextstory/issues/128)).
- A11y: Announce the footer source link's new tab and mark English-only footer links `hreflang="en"` ([#132](https://github.com/marcop135/nextstory/pull/132)) ([#128](https://github.com/marcop135/nextstory/issues/128)).

### Security

- Secrets: Compare the preview and webhook secrets in constant time ([#130](https://github.com/marcop135/nextstory/pull/130)) ([#126](https://github.com/marcop135/nextstory/issues/126)).
- CI: Pin GitHub Actions to commit SHAs ([#130](https://github.com/marcop135/nextstory/pull/130)) ([#126](https://github.com/marcop135/nextstory/issues/126)).
- Headers: Send `Cross-Origin-Opener-Policy` and deny payment, USB, and Topics in `Permissions-Policy` ([#130](https://github.com/marcop135/nextstory/pull/130)) ([#126](https://github.com/marcop135/nextstory/issues/126)).

## [0.15.2] - 2026-11-17

### Fixed

- Site copy: Point the rich text docs link on the blocks page at the current Storyblok fields page ([#124](https://github.com/marcop135/nextstory/pull/124), [#123](https://github.com/marcop135/nextstory/issues/123)).
- CI: Skip unsplash.com photo pages in the weekly link check, since they answer bots with 401 ([#124](https://github.com/marcop135/nextstory/pull/124), [#123](https://github.com/marcop135/nextstory/issues/123)).

## [0.15.1] - 2026-11-17

### Fixed

- Sitemap: Add lastmod to sitemap entries for CMS pages, which 0.15.0 left out in production ([#121](https://github.com/marcop135/nextstory/pull/121)) ([#120](https://github.com/marcop135/nextstory/issues/120)).

## [0.15.0] - 2026-11-17

### Added

- Site copy: Suggest How it works and the block library on the 404 page ([#116](https://github.com/marcop135/nextstory/pull/116)) ([#113](https://github.com/marcop135/nextstory/issues/113)).
- JSON-LD: Add per-page WebPage and BreadcrumbList JSON-LD nodes linked to the site graph ([#117](https://github.com/marcop135/nextstory/pull/117)) ([#114](https://github.com/marcop135/nextstory/issues/114)).
- Sitemap: Add lastmod and hreflang alternates to the sitemap ([#117](https://github.com/marcop135/nextstory/pull/117)) ([#114](https://github.com/marcop135/nextstory/issues/114)).
- Markdown: Negotiate `Accept: text/markdown` on page URLs and return 406 for other types ([#117](https://github.com/marcop135/nextstory/pull/117)) ([#114](https://github.com/marcop135/nextstory/issues/114)).
- Markdown: Link each page's Markdown version in a `Link` response header ([#117](https://github.com/marcop135/nextstory/pull/117)) ([#114](https://github.com/marcop135/nextstory/issues/114)).
- Headers: Add a `No-Vary-Search` header so tracking parameters share a cache entry ([#117](https://github.com/marcop135/nextstory/pull/117)) ([#114](https://github.com/marcop135/nextstory/issues/114)).
- Tests: Check title length, description length, and JSON-LD in the smoke test ([#118](https://github.com/marcop135/nextstory/pull/118)) ([#115](https://github.com/marcop135/nextstory/issues/115)).
- CI: Check external links in the docs, llms.txt, and seed stories every week ([#118](https://github.com/marcop135/nextstory/pull/118)) ([#115](https://github.com/marcop135/nextstory/issues/115)).

### Changed

- Docs copy: Rewrite three contrast sentences in the setup, overview, and release docs as direct statements ([#116](https://github.com/marcop135/nextstory/pull/116)) ([#113](https://github.com/marcop135/nextstory/issues/113)).
- Other copy: Lengthen the For agents meta title and og:title to 39 characters ([#116](https://github.com/marcop135/nextstory/pull/116)) ([#113](https://github.com/marcop135/nextstory/issues/113)).
- Other copy: Replace the privacy meta description with one that no longer repeats the domain ([#116](https://github.com/marcop135/nextstory/pull/116)) ([#113](https://github.com/marcop135/nextstory/issues/113)).
- Other copy: Localize the Open Graph image alt text and the JSON-LD site description on German pages ([#116](https://github.com/marcop135/nextstory/pull/116)) ([#113](https://github.com/marcop135/nextstory/issues/113)).
- Other copy: List the campaign workshop, cache invalidation, and content relationships pages in llms.txt ([#116](https://github.com/marcop135/nextstory/pull/116)) ([#113](https://github.com/marcop135/nextstory/issues/113)).
- Metadata: Serve the Open Graph image as JPEG ([#117](https://github.com/marcop135/nextstory/pull/117)) ([#114](https://github.com/marcop135/nextstory/issues/114)).
- Docs copy: Describe Markdown negotiation on page URLs in the architecture doc ([#117](https://github.com/marcop135/nextstory/pull/117)) ([#114](https://github.com/marcop135/nextstory/issues/114)).
- Other copy: Mention `Accept: text/markdown` negotiation in llms.txt ([#117](https://github.com/marcop135/nextstory/pull/117)) ([#114](https://github.com/marcop135/nextstory/issues/114)).
- Docs copy: Describe the new smoke checks and the weekly link check in the commands doc ([#118](https://github.com/marcop135/nextstory/pull/118)) ([#115](https://github.com/marcop135/nextstory/issues/115)).

### Fixed

- Metadata: Send a single robots meta tag on the 404 page ([#117](https://github.com/marcop135/nextstory/pull/117)) ([#114](https://github.com/marcop135/nextstory/issues/114)).

## [0.14.0] - 2026-11-09

### Added

- Campaign: Show inline, localized errors on the campaign form and name the cause of a failed send ([#111](https://github.com/marcop135/nextstory/pull/111)) ([#110](https://github.com/marcop135/nextstory/issues/110)).
- Campaign: Confirm campaign registrations with a success panel ([#111](https://github.com/marcop135/nextstory/pull/111)) ([#110](https://github.com/marcop135/nextstory/issues/110)).

### Changed

- Deps: Update Next.js to 16.4.5, `@storyblok/react` to 7.5.0, and Playwright to 1.65.0 ([#111](https://github.com/marcop135/nextstory/pull/111)).

### Fixed

- Motion: Animate the hero from first paint so slow connections no longer show the content, then replay it ([#111](https://github.com/marcop135/nextstory/pull/111)) ([#110](https://github.com/marcop135/nextstory/issues/110)).

## [0.13.2] - 2026-11-06

### Fixed

- Campaign: Unfreeze the campaign form when its bot check times out or the browser is unsupported ([#108](https://github.com/marcop135/nextstory/pull/108)) ([#107](https://github.com/marcop135/nextstory/issues/107)).

## [0.13.1] - 2026-11-06

### Fixed

- Campaign: Record campaign leads in HubSpot, which silently dropped submissions that included the page URL ([#103](https://github.com/marcop135/nextstory/pull/103)) ([#102](https://github.com/marcop135/nextstory/issues/102)).

## [0.13.0] - 2026-11-06

### Added

- Campaign: Send workshop interest to HubSpot with consent, UTMs, and a campaign ID; log a Matomo lead event ([#99](https://github.com/marcop135/nextstory/pull/99)) ([#98](https://github.com/marcop135/nextstory/issues/98)).
- Campaign: Protect the form with Cloudflare Turnstile, same-origin checks, and consent text taken from the CMS ([#99](https://github.com/marcop135/nextstory/pull/99)).
- Agents: Add a `get_campaign_brief` tool and `/content/campaigns.json` for published campaign goals and measures ([#99](https://github.com/marcop135/nextstory/pull/99)).

### Changed

- Privacy: Describe HubSpot and Cloudflare Turnstile processing for the campaign form in the site's privacy page ([#99](https://github.com/marcop135/nextstory/pull/99)).

## [0.12.0] - 2026-11-05

### Changed

- CI: Check for npm and GitHub Actions updates monthly instead of weekly.
- Analytics: Move site analytics to a cookieless Matomo Tag Manager container, adding time on page and errors ([#96](https://github.com/marcop135/nextstory/pull/96)) ([#95](https://github.com/marcop135/nextstory/issues/95)).
- Privacy: List anonymous interaction events in the site's privacy page ([#96](https://github.com/marcop135/nextstory/pull/96)).

### Fixed

- Design: Declare light and dark support in the site head, so Safari's Adaptive Dark Mode leaves it alone ([#94](https://github.com/marcop135/nextstory/pull/94)) ([#93](https://github.com/marcop135/nextstory/issues/93)).

## [0.11.0] - 2026-11-04

### Added

- Campaign: Add a localized workshop campaign with a brief and demo interest form ([#85](https://github.com/marcop135/nextstory/pull/85)) ([#84](https://github.com/marcop135/nextstory/issues/84)).
- Design: Show the codebase version in the footer ([#85](https://github.com/marcop135/nextstory/pull/85)).

### Fixed

- Sitemap: Include newly published pages in the sitemap without rebuilding ([#91](https://github.com/marcop135/nextstory/pull/91)) ([#90](https://github.com/marcop135/nextstory/issues/90)).
- Preview: Prevent duplicated locale prefixes in draft-preview redirects ([#88](https://github.com/marcop135/nextstory/pull/88)) ([#87](https://github.com/marcop135/nextstory/issues/87)).

## [0.10.2] - 2026-11-03

### Changed

- Docs: Animate and refine the content-flow diagram with light/dark themes and reduced-motion support ([#78](https://github.com/marcop135/nextstory/pull/78)) ([#79](https://github.com/marcop135/nextstory/pull/79)) ([#81](https://github.com/marcop135/nextstory/pull/81)).

### Security

- Deps: Update dependencies and replace vulnerable happy-dom and minimatch versions ([#81](https://github.com/marcop135/nextstory/pull/81)) ([#80](https://github.com/marcop135/nextstory/issues/80)).

## [0.10.1] - 2026-11-02

### Changed

- Deps: Update Next.js and its ESLint config to 16.4.3 ([#51](https://github.com/marcop135/nextstory/pull/51)).

### Fixed

- Pages: Restore text-only For Agents and Privacy pages ([#71](https://github.com/marcop135/nextstory/pull/71)) ([#70](https://github.com/marcop135/nextstory/issues/70)).
- A11y: Improve accessibility by opening the footer's llms.txt link as a plain-text document ([#71](https://github.com/marcop135/nextstory/pull/71)) ([#70](https://github.com/marcop135/nextstory/issues/70)).
- A11y: Improve screen-reader navigation with a named landmark for locale and preview information ([#71](https://github.com/marcop135/nextstory/pull/71)) ([#70](https://github.com/marcop135/nextstory/issues/70)).
- A11y: Fix keyboard accessibility by focusing the main content when activating the skip link ([#71](https://github.com/marcop135/nextstory/pull/71)) ([#70](https://github.com/marcop135/nextstory/issues/70)).

## [0.10.0] - 2026-10-28

### Added

- Design: Add distinct demo intro illustrations and slower, reduced-motion-aware copy reveals ([#59](https://github.com/marcop135/nextstory/pull/59)).

### Removed

- Pages: Remove demo Pricing and redirect its English and German URLs to their locale home pages ([#59](https://github.com/marcop135/nextstory/pull/59)) ([#68](https://github.com/marcop135/nextstory/issues/68)).

### Fixed

- Design: Refine demo hero alignment, buttons, navigation, and footer; fix the README theme images ([#59](https://github.com/marcop135/nextstory/pull/59)) ([#68](https://github.com/marcop135/nextstory/issues/68)).

## [0.9.1] - 2026-10-28

### Changed

- Motion: Animate demo headings with reduced-motion support and keep Home's closing CTA inside the demo ([#57](https://github.com/marcop135/nextstory/pull/57)).
- Docs: Expand setup and authoring guides; reorganize repository documentation ([#57](https://github.com/marcop135/nextstory/pull/57)).

### Removed

- Docs: Remove implementation plans from the documentation ([#57](https://github.com/marcop135/nextstory/pull/57)).

## [0.9.0] - 2026-10-27

### Added

- Blocks: Add related-content blocks and reusable English/German learning notes to the demo ([#52](https://github.com/marcop135/nextstory/pull/52)).
- Tests: Add Chrome checks and screenshots for demo motion, locales, keyboard access, and responsive layouts ([#52](https://github.com/marcop135/nextstory/pull/52)).

### Changed

- Design: Refine the demo's localized footer and add a documentation index ([#52](https://github.com/marcop135/nextstory/pull/52)).
- CMS: Scope seed imports, default to drafts, and support Storyblok-assigned UUIDs ([#52](https://github.com/marcop135/nextstory/pull/52)) ([#54](https://github.com/marcop135/nextstory/pull/54)) ([#63](https://github.com/marcop135/nextstory/issues/63)).

### Fixed

- Motion: Start demo publishing motion in view; pause offscreen or in hidden tabs without resetting ([#52](https://github.com/marcop135/nextstory/pull/52)).
- i18n: Fix duplicate locale prefixes in German demo links ([#55](https://github.com/marcop135/nextstory/pull/55)) ([#66](https://github.com/marcop135/nextstory/issues/66)).

## [0.8.2] - 2026-10-22

### Changed

- Repo: Rename the repository to `nextstory` and update its links ([#49](https://github.com/marcop135/nextstory/pull/49)).

## [0.8.1] - 2026-10-22

### Fixed

- Brand: Set the repository's social preview wordmark in Source Sans 3 ([#44](https://github.com/marcop135/nextstory/pull/44)).
- Repo: Stop `next dev` from generating a root AGENTS.md ([#44](https://github.com/marcop135/nextstory/pull/44)).

## [0.8.0] - 2026-10-22

### Added

- Blocks: Add comparison-table and code-example blocks to the demo ([#38](https://github.com/marcop135/nextstory/pull/38)) ([#62](https://github.com/marcop135/nextstory/issues/62)).
- Agents: Expose the demo's published content as Markdown, a block catalog, and read-only WebMCP tools ([#39](https://github.com/marcop135/nextstory/pull/39)) ([#67](https://github.com/marcop135/nextstory/issues/67)).

### Changed

- Motion: Add an accessible demo Home animation and replace Fraunces headings with Source Sans 3 ([#38](https://github.com/marcop135/nextstory/pull/38)) ([#42](https://github.com/marcop135/nextstory/pull/42)).
- Brand: Clarify the headless CMS demo positioning; simplify the README and brand images ([#42](https://github.com/marcop135/nextstory/pull/42)).
- Deps: Update Next.js, React, Vitest, and ESLint ([#37](https://github.com/marcop135/nextstory/pull/37)).

### Fixed

- Sitemap: Exclude seed pages from the demo sitemap when Storyblok has no published pages ([#37](https://github.com/marcop135/nextstory/pull/37)) ([#65](https://github.com/marcop135/nextstory/issues/65)).

### Security

- Deps: Patch transitive markdown-it to 14.3.3 ([#37](https://github.com/marcop135/nextstory/pull/37)).

## [0.7.0] - 2026-10-19

### Added

- Blocks: Add an editable demo Home hero image with photographer credits ([#30](https://github.com/marcop135/nextstory/pull/30)).

### Changed

- Design: Replace the demo Home graphic with credited Unsplash wireframes ([#30](https://github.com/marcop135/nextstory/pull/30)).
- Docs: Clarify the README stack and remove its badges ([#30](https://github.com/marcop135/nextstory/pull/30)).

## [0.6.0] - 2026-10-19

### Added

- Blocks: Add localized image-and-text, accordion, and pull-quote demo blocks; introduce the library on Home ([#28](https://github.com/marcop135/nextstory/pull/28)) ([#62](https://github.com/marcop135/nextstory/issues/62)).

## [0.5.0] - 2026-10-18

### Added

- Agents: Add the demo [For agents](https://nextstory.marcopontili.com/for-agents) page to its footer, sitemap, and `llms.txt`; add a mobile menu ([#26](https://github.com/marcop135/nextstory/pull/26)) ([#68](https://github.com/marcop135/nextstory/issues/68)).

### Changed

- Brand: Rename Northline to Next Story; retain the `next-storyblok` repository name ([#26](https://github.com/marcop135/nextstory/pull/26)).
- Brand: Use Fraunces display headlines and align README, social, and Open Graph images with the demo branding ([#26](https://github.com/marcop135/nextstory/pull/26)).
- Design: Add demo footer attribution and remove its duplicate GitHub link ([#26](https://github.com/marcop135/nextstory/pull/26)).

## [0.4.2] - 2026-10-18

### Changed

- Brand: Simplify repository social, demo Open Graph, and README header images ([#24](https://github.com/marcop135/nextstory/pull/24)).

### Fixed

- i18n: Preserve the demo's German navigation, footer, and page language during client navigation ([#24](https://github.com/marcop135/nextstory/pull/24)) ([#66](https://github.com/marcop135/nextstory/issues/66)).

## [0.4.1] - 2026-10-18

### Fixed

- Sitemap: Refresh the demo sitemap on story publication, unpublication, deletion, or moves ([#22](https://github.com/marcop135/nextstory/pull/22)) ([#65](https://github.com/marcop135/nextstory/issues/65)).

## [0.4.0] - 2026-10-18

### Added

- Pages: Add demo [How it works](https://nextstory.marcopontili.com/how-it-works) and [Blocks](https://nextstory.marcopontili.com/blocks) pages, new blocks, labels, German routes, and language switching ([#19](https://github.com/marcop135/nextstory/pull/19)) ([#62](https://github.com/marcop135/nextstory/issues/62)).
- CMS: Add CMS-managed demo navigation/footer, schema and seed syncing, and CI-checked generated block types ([#19](https://github.com/marcop135/nextstory/pull/19)) ([#62](https://github.com/marcop135/nextstory/issues/62)).
- Design: Add system-aware demo dark mode and CI smoke tests for routes, links, and sitemap entries ([#19](https://github.com/marcop135/nextstory/pull/19)).
- Repo: Add security, issue, and PR templates ([#19](https://github.com/marcop135/nextstory/pull/19)).

### Changed

- Deps: Upgrade to Next.js 16 with `src/proxy.ts` and ESLint CLI linting ([#20](https://github.com/marcop135/nextstory/pull/20)) ([#64](https://github.com/marcop135/nextstory/issues/64)).
- Cache: Invalidate demo caches on publish and build its sitemap from Storyblok links ([#19](https://github.com/marcop135/nextstory/pull/19)) ([#20](https://github.com/marcop135/nextstory/pull/20)).
- CMS: Share offline/CMS seeds, localize demo HTML/JSON-LD per request, and permit the Visual Editor bridge in CSP ([#19](https://github.com/marcop135/nextstory/pull/19)).
- Brand: Redesign README, social, and Open Graph images with the shared brand kit ([#19](https://github.com/marcop135/nextstory/pull/19)).

## [0.3.1] - 2026-10-16

### Fixed

- Analytics: Send demo page views and AI-assistant fetches to its own Matomo property ([#17](https://github.com/marcop135/nextstory/pull/17)) ([#69](https://github.com/marcop135/nextstory/issues/69)).

## [0.3.0] - 2026-10-16

### Added

- Analytics: Add cookieless Matomo, AI-fetch tracking, a demo [privacy page](https://nextstory.marcopontili.com/privacy), and CSP security headers ([#15](https://github.com/marcop135/nextstory/pull/15)) ([#69](https://github.com/marcop135/nextstory/issues/69)).
- Metadata: Add demo discovery files, sitemap, web manifest, icon, and JSON-LD ([#15](https://github.com/marcop135/nextstory/pull/15)).

### Changed

- Hosting: Move the canonical host to [nextstory.marcopontili.com](https://nextstory.marcopontili.com) ([#15](https://github.com/marcop135/nextstory/pull/15)).

## [0.2.0] - 2026-10-15

### Added

- Tests: Test CMS block rendering, draft preview, delivery, and publish webhooks offline ([#11](https://github.com/marcop135/nextstory/pull/11)).

### Changed

- Deps: Update the Storyblok React SDK to 7.3.1 ([#4](https://github.com/marcop135/nextstory/pull/4)).

### Fixed

- Cache: Restore demo server rendering and isolate published content from the editor's draft cache ([#11](https://github.com/marcop135/nextstory/pull/11)) ([#61](https://github.com/marcop135/nextstory/issues/61)).
- Preview: Validate preview stories, keep exit redirects on-site, and refresh localized caches on changes ([#11](https://github.com/marcop135/nextstory/pull/11)) ([#61](https://github.com/marcop135/nextstory/issues/61)).
- Webhooks: Reject malformed webhooks without cache changes; surface CMS outages as errors ([#11](https://github.com/marcop135/nextstory/pull/11)).

## [0.1.0] - 2026-10-13

### Added

- Core: Add the Next.js App Router demo with Storyblok blocks, draft preview, and publish revalidation.
- Docs: Document architecture, commands, and schema; add CI for lint, changelog checks, and builds.
