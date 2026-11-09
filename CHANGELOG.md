# Changelog

- **Format:** Based on [Keep a Changelog](https://keepachangelog.com).
- **Voice:** Use the imperative, like a commit message. Write add, fix, increase, force, not added, fixed, increased, forced.
- **Length:** Keep each bullet on one line, max 120 characters (link URLs do not count toward the cap, only the visible text does).
- **Links:** Add inline markdown links for related PRs, docs, and external references when they help the reader.

## [Unreleased]

### Added

- Show inline, localized errors on the campaign form and name the cause of a failed send ([#111](https://github.com/marcop135/nextstory/pull/111)) ([#110](https://github.com/marcop135/nextstory/issues/110)).
- Confirm campaign registrations with a success panel ([#111](https://github.com/marcop135/nextstory/pull/111)) ([#110](https://github.com/marcop135/nextstory/issues/110)).

### Changed

- Update Next.js to 16.4.5, `@storyblok/react` to 7.5.0, and Playwright to 1.65.0 ([#111](https://github.com/marcop135/nextstory/pull/111)).

### Fixed

- Animate the hero from first paint so slow connections no longer show the content, then replay it ([#111](https://github.com/marcop135/nextstory/pull/111)) ([#110](https://github.com/marcop135/nextstory/issues/110)).

## [0.13.2] - 2026-11-06

### Fixed

- Unfreeze the campaign form when its bot check times out or the browser is unsupported ([#108](https://github.com/marcop135/nextstory/pull/108)) ([#107](https://github.com/marcop135/nextstory/issues/107)).

## [0.13.1] - 2026-11-06

### Fixed

- Record campaign leads in HubSpot, which silently dropped submissions that included the page URL ([#103](https://github.com/marcop135/nextstory/pull/103)) ([#102](https://github.com/marcop135/nextstory/issues/102)).

## [0.13.0] - 2026-11-06

### Added

- Send workshop interest to HubSpot with consent, UTMs, and a campaign ID; log a Matomo lead event ([#99](https://github.com/marcop135/nextstory/pull/99)) ([#98](https://github.com/marcop135/nextstory/issues/98)).
- Protect the campaign form with Cloudflare Turnstile, same-origin checks, and consent text taken from the CMS ([#99](https://github.com/marcop135/nextstory/pull/99)).
- Add a `get_campaign_brief` agent tool and `/content/campaigns.json` for published campaign goals and measures ([#99](https://github.com/marcop135/nextstory/pull/99)).

### Changed

- Describe HubSpot and Cloudflare Turnstile processing for the campaign form in the site's privacy page ([#99](https://github.com/marcop135/nextstory/pull/99)).

## [0.12.0] - 2026-11-05

### Changed

- Check for npm and GitHub Actions updates monthly instead of weekly.
- Move site analytics to a cookieless Matomo Tag Manager container, adding time on page and errors ([#96](https://github.com/marcop135/nextstory/pull/96)) ([#95](https://github.com/marcop135/nextstory/issues/95)).
- List anonymous interaction events in the site's privacy page ([#96](https://github.com/marcop135/nextstory/pull/96)).

### Fixed

- Declare light and dark support in the site head, so Safari's Adaptive Dark Mode leaves it alone ([#94](https://github.com/marcop135/nextstory/pull/94)) ([#93](https://github.com/marcop135/nextstory/issues/93)).

## [0.11.0] - 2026-11-04

### Added

- Add a localized workshop campaign with a brief and demo interest form ([#85](https://github.com/marcop135/nextstory/pull/85)) ([#84](https://github.com/marcop135/nextstory/issues/84)).
- Show the codebase version in the footer ([#85](https://github.com/marcop135/nextstory/pull/85)).

### Fixed

- Include newly published pages in the sitemap without rebuilding ([#91](https://github.com/marcop135/nextstory/pull/91)) ([#90](https://github.com/marcop135/nextstory/issues/90)).
- Prevent duplicated locale prefixes in draft-preview redirects ([#88](https://github.com/marcop135/nextstory/pull/88)) ([#87](https://github.com/marcop135/nextstory/issues/87)).

## [0.10.2] - 2026-11-03

### Changed

- Animate and refine the content-flow diagram with light/dark themes and reduced-motion support ([#78](https://github.com/marcop135/nextstory/pull/78)) ([#79](https://github.com/marcop135/nextstory/pull/79)) ([#81](https://github.com/marcop135/nextstory/pull/81)).

### Security

- Update dependencies and replace vulnerable happy-dom and minimatch versions ([#81](https://github.com/marcop135/nextstory/pull/81)) ([#80](https://github.com/marcop135/nextstory/issues/80)).

## [0.10.1] - 2026-11-02

### Changed

- Update Next.js and its ESLint config to 16.4.3 ([#51](https://github.com/marcop135/nextstory/pull/51)).

### Fixed

- Restore text-only For Agents and Privacy pages ([#71](https://github.com/marcop135/nextstory/pull/71)) ([#70](https://github.com/marcop135/nextstory/issues/70)).
- Improve accessibility by opening the footer's llms.txt link as a plain-text document ([#71](https://github.com/marcop135/nextstory/pull/71)) ([#70](https://github.com/marcop135/nextstory/issues/70)).
- Improve screen-reader navigation with a named landmark for locale and preview information ([#71](https://github.com/marcop135/nextstory/pull/71)) ([#70](https://github.com/marcop135/nextstory/issues/70)).
- Fix keyboard accessibility by focusing the main content when activating the skip link ([#71](https://github.com/marcop135/nextstory/pull/71)) ([#70](https://github.com/marcop135/nextstory/issues/70)).

## [0.10.0] - 2026-10-28

### Added

- Add distinct demo intro illustrations and slower, reduced-motion-aware copy reveals ([#59](https://github.com/marcop135/nextstory/pull/59)).

### Removed

- Remove demo Pricing and redirect its English and German URLs to their locale home pages ([#59](https://github.com/marcop135/nextstory/pull/59)) ([#68](https://github.com/marcop135/nextstory/issues/68)).

### Fixed

- Refine demo hero alignment, buttons, navigation, and footer; fix the README theme images ([#59](https://github.com/marcop135/nextstory/pull/59)) ([#68](https://github.com/marcop135/nextstory/issues/68)).

## [0.9.1] - 2026-10-28

### Changed

- Animate demo headings with reduced-motion support and keep Home's closing CTA inside the demo ([#57](https://github.com/marcop135/nextstory/pull/57)).
- Expand setup and authoring guides; reorganize repository documentation ([#57](https://github.com/marcop135/nextstory/pull/57)).

### Removed

- Remove implementation plans from the documentation ([#57](https://github.com/marcop135/nextstory/pull/57)).

## [0.9.0] - 2026-10-27

### Added

- Add related-content blocks and reusable English/German learning notes to the demo ([#52](https://github.com/marcop135/nextstory/pull/52)).
- Add Chrome checks and screenshots for demo motion, locales, keyboard access, and responsive layouts ([#52](https://github.com/marcop135/nextstory/pull/52)).

### Changed

- Refine the demo's localized footer and add a documentation index ([#52](https://github.com/marcop135/nextstory/pull/52)).
- Scope seed imports, default to drafts, and support Storyblok-assigned UUIDs ([#52](https://github.com/marcop135/nextstory/pull/52)) ([#54](https://github.com/marcop135/nextstory/pull/54)) ([#63](https://github.com/marcop135/nextstory/issues/63)).

### Fixed

- Start demo publishing motion in view; pause offscreen or in hidden tabs without resetting ([#52](https://github.com/marcop135/nextstory/pull/52)).
- Fix duplicate locale prefixes in German demo links ([#55](https://github.com/marcop135/nextstory/pull/55)) ([#66](https://github.com/marcop135/nextstory/issues/66)).

## [0.8.2] - 2026-10-22

### Changed

- Rename the repository to `nextstory` and update its links ([#49](https://github.com/marcop135/nextstory/pull/49)).

## [0.8.1] - 2026-10-22

### Fixed

- Set the repository's social preview wordmark in Source Sans 3 ([#44](https://github.com/marcop135/nextstory/pull/44)).
- Stop `next dev` from generating a root AGENTS.md ([#44](https://github.com/marcop135/nextstory/pull/44)).

## [0.8.0] - 2026-10-22

### Added

- Add comparison-table and code-example blocks to the demo ([#38](https://github.com/marcop135/nextstory/pull/38)) ([#62](https://github.com/marcop135/nextstory/issues/62)).
- Expose the demo's published content as Markdown, a block catalog, and read-only WebMCP tools ([#39](https://github.com/marcop135/nextstory/pull/39)) ([#67](https://github.com/marcop135/nextstory/issues/67)).

### Changed

- Add an accessible demo Home animation and replace Fraunces headings with Source Sans 3 ([#38](https://github.com/marcop135/nextstory/pull/38)) ([#42](https://github.com/marcop135/nextstory/pull/42)).
- Clarify the headless CMS demo positioning; simplify the README and brand images ([#42](https://github.com/marcop135/nextstory/pull/42)).
- Update Next.js, React, Vitest, and ESLint ([#37](https://github.com/marcop135/nextstory/pull/37)).

### Fixed

- Exclude seed pages from the demo sitemap when Storyblok has no published pages ([#37](https://github.com/marcop135/nextstory/pull/37)) ([#65](https://github.com/marcop135/nextstory/issues/65)).

### Security

- Patch transitive markdown-it to 14.3.3 ([#37](https://github.com/marcop135/nextstory/pull/37)).

## [0.7.0] - 2026-10-19

### Added

- Add an editable demo Home hero image with photographer credits ([#30](https://github.com/marcop135/nextstory/pull/30)).

### Changed

- Replace the demo Home graphic with credited Unsplash wireframes ([#30](https://github.com/marcop135/nextstory/pull/30)).
- Clarify the README stack and remove its badges ([#30](https://github.com/marcop135/nextstory/pull/30)).

## [0.6.0] - 2026-10-19

### Added

- Add localized image-and-text, accordion, and pull-quote demo blocks; introduce the library on Home ([#28](https://github.com/marcop135/nextstory/pull/28)) ([#62](https://github.com/marcop135/nextstory/issues/62)).

## [0.5.0] - 2026-10-18

### Added

- Add the demo [For agents](https://nextstory.marcopontili.com/for-agents) page to its footer, sitemap, and `llms.txt`; add a mobile menu ([#26](https://github.com/marcop135/nextstory/pull/26)) ([#68](https://github.com/marcop135/nextstory/issues/68)).

### Changed

- Rename Northline to Next Story; retain the `next-storyblok` repository name ([#26](https://github.com/marcop135/nextstory/pull/26)).
- Use Fraunces display headlines and align README, social, and Open Graph images with the demo branding ([#26](https://github.com/marcop135/nextstory/pull/26)).
- Add demo footer attribution and remove its duplicate GitHub link ([#26](https://github.com/marcop135/nextstory/pull/26)).

## [0.4.2] - 2026-10-18

### Changed

- Simplify repository social, demo Open Graph, and README header images ([#24](https://github.com/marcop135/nextstory/pull/24)).

### Fixed

- Preserve the demo's German navigation, footer, and page language during client navigation ([#24](https://github.com/marcop135/nextstory/pull/24)) ([#66](https://github.com/marcop135/nextstory/issues/66)).

## [0.4.1] - 2026-10-18

### Fixed

- Refresh the demo sitemap on story publication, unpublication, deletion, or moves ([#22](https://github.com/marcop135/nextstory/pull/22)) ([#65](https://github.com/marcop135/nextstory/issues/65)).

## [0.4.0] - 2026-10-18

### Added

- Add demo [How it works](https://nextstory.marcopontili.com/how-it-works) and [Blocks](https://nextstory.marcopontili.com/blocks) pages, new blocks, labels, German routes, and language switching ([#19](https://github.com/marcop135/nextstory/pull/19)) ([#62](https://github.com/marcop135/nextstory/issues/62)).
- Add CMS-managed demo navigation/footer, schema and seed syncing, and CI-checked generated block types ([#19](https://github.com/marcop135/nextstory/pull/19)) ([#62](https://github.com/marcop135/nextstory/issues/62)).
- Add system-aware demo dark mode and CI smoke tests for routes, links, and sitemap entries ([#19](https://github.com/marcop135/nextstory/pull/19)).
- Add security, issue, and PR templates ([#19](https://github.com/marcop135/nextstory/pull/19)).

### Changed

- Upgrade to Next.js 16 with `src/proxy.ts` and ESLint CLI linting ([#20](https://github.com/marcop135/nextstory/pull/20)) ([#64](https://github.com/marcop135/nextstory/issues/64)).
- Invalidate demo caches on publish and build its sitemap from Storyblok links ([#19](https://github.com/marcop135/nextstory/pull/19)) ([#20](https://github.com/marcop135/nextstory/pull/20)).
- Share offline/CMS seeds, localize demo HTML/JSON-LD per request, and permit the Visual Editor bridge in CSP ([#19](https://github.com/marcop135/nextstory/pull/19)).
- Redesign README, social, and Open Graph images with the shared brand kit ([#19](https://github.com/marcop135/nextstory/pull/19)).

## [0.3.1] - 2026-10-16

### Fixed

- Send demo page views and AI-assistant fetches to its own Matomo property ([#17](https://github.com/marcop135/nextstory/pull/17)) ([#69](https://github.com/marcop135/nextstory/issues/69)).

## [0.3.0] - 2026-10-16

### Added

- Add cookieless Matomo, AI-fetch tracking, a demo [privacy page](https://nextstory.marcopontili.com/privacy), and CSP security headers ([#15](https://github.com/marcop135/nextstory/pull/15)) ([#69](https://github.com/marcop135/nextstory/issues/69)).
- Add demo discovery files, sitemap, web manifest, icon, and JSON-LD ([#15](https://github.com/marcop135/nextstory/pull/15)).

### Changed

- Move the canonical host to [nextstory.marcopontili.com](https://nextstory.marcopontili.com) ([#15](https://github.com/marcop135/nextstory/pull/15)).

## [0.2.0] - 2026-10-15

### Added

- Test CMS block rendering, draft preview, delivery, and publish webhooks offline ([#11](https://github.com/marcop135/nextstory/pull/11)).

### Changed

- Update the Storyblok React SDK to 7.3.1 ([#4](https://github.com/marcop135/nextstory/pull/4)).

### Fixed

- Restore demo server rendering and isolate published content from the editor's draft cache ([#11](https://github.com/marcop135/nextstory/pull/11)) ([#61](https://github.com/marcop135/nextstory/issues/61)).
- Validate preview stories, keep exit redirects on-site, and refresh localized caches on story changes ([#11](https://github.com/marcop135/nextstory/pull/11)) ([#61](https://github.com/marcop135/nextstory/issues/61)).
- Reject malformed webhooks without cache changes; surface CMS outages as errors ([#11](https://github.com/marcop135/nextstory/pull/11)).

## [0.1.0] - 2026-10-13

### Added

- Add the Next.js App Router demo with Storyblok blocks, draft preview, and publish revalidation.
- Document architecture, commands, and schema; add CI for lint, changelog checks, and builds.
