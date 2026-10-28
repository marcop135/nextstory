# Changelog

- **Format:** Based on [Keep a Changelog](https://keepachangelog.com).
- **Voice:** Use the imperative, like a commit message. Write add, fix, increase, force, not added, fixed, increased, forced.
- **Length:** Keep each bullet on one line, max 120 characters (link URLs do not count toward the cap, only the visible text does).
- **Links:** Add inline markdown links for related PRs, docs, and external references when they help the reader.

## [Unreleased]

### Added

- Add distinct demo intro illustrations and slower, reduced-motion-aware copy reveals.

### Removed

- Remove demo Pricing and redirect its English and German URLs to their locale home pages.

### Fixed

- Refine demo hero alignment, buttons, navigation, and footer; fix the README theme images.

## [0.9.1] - 2026-10-28

### Changed

- Animate demo headings with reduced-motion support and keep Home's closing CTA inside the demo.
- Expand setup and authoring guides; reorganize repository documentation.

### Removed

- Remove implementation plans from the documentation.

## [0.9.0] - 2026-10-27

### Added

- Add related-content blocks and reusable English/German learning notes to the demo.
- Add Chrome checks and screenshots for demo motion, locales, keyboard access, and responsive layouts.

### Changed

- Refine the demo's localized footer and add a documentation index.
- Scope seed imports, default to drafts, and support Storyblok-assigned UUIDs.

### Fixed

- Start demo publishing motion in view; pause offscreen or in hidden tabs without resetting.
- Fix duplicate locale prefixes in German demo links.

## [0.8.2] - 2026-10-22

### Changed

- Rename the repository to `nextstory` and update its links.

## [0.8.1] - 2026-10-22

### Fixed

- Set the repository's social preview wordmark in Source Sans 3.
- Stop `next dev` from generating a root AGENTS.md.

## [0.8.0] - 2026-10-22

### Added

- Add comparison-table and code-example blocks to the demo.
- Expose the demo's published content as Markdown, a block catalog, and read-only WebMCP tools.

### Changed

- Add an accessible demo Home animation and replace Fraunces headings with Source Sans 3.
- Clarify the headless CMS demo positioning; simplify the README and brand images.
- Update Next.js, React, Vitest, and ESLint.

### Fixed

- Exclude seed pages from the demo sitemap when Storyblok has no published pages.

### Security

- Patch transitive markdown-it to 14.3.3.

## [0.7.0] - 2026-10-19

### Added

- Add an editable demo Home hero image with photographer credits.

### Changed

- Replace the demo Home graphic with credited Unsplash wireframes.
- Clarify the README stack and remove its badges.

## [0.6.0] - 2026-10-19

### Added

- Add localized image-and-text, accordion, and pull-quote demo blocks; introduce the library on Home.

## [0.5.0] - 2026-10-18

### Added

- Add the demo [For agents](https://nextstory.marcopontili.com/for-agents) page to its footer, sitemap, and `llms.txt`; add a mobile menu.

### Changed

- Rename Northline to Next Story; retain the `next-storyblok` repository name.
- Use Fraunces display headlines and align README, social, and Open Graph images with the demo branding.
- Add demo footer attribution and remove its duplicate GitHub link.

## [0.4.2] - 2026-10-18

### Changed

- Simplify repository social, demo Open Graph, and README header images.

### Fixed

- Preserve the demo's German navigation, footer, and page language during client navigation.

## [0.4.1] - 2026-10-18

### Fixed

- Refresh the demo sitemap on story publication, unpublication, deletion, or moves.

## [0.4.0] - 2026-10-18

### Added

- Add demo [How it works](https://nextstory.marcopontili.com/how-it-works) and [Blocks](https://nextstory.marcopontili.com/blocks) pages, new blocks, labels, German routes, and language switching.
- Add CMS-managed demo navigation/footer, schema and seed syncing, and CI-checked generated block types.
- Add system-aware demo dark mode and CI smoke tests for routes, links, and sitemap entries.
- Add security, issue, and PR templates.

### Changed

- Upgrade to Next.js 16 with `src/proxy.ts` and ESLint CLI linting.
- Invalidate demo caches on publish and build its sitemap from Storyblok links.
- Share offline/CMS seeds, localize demo HTML/JSON-LD per request, and permit the Visual Editor bridge in CSP.
- Redesign README, social, and Open Graph images with the shared brand kit.

## [0.3.1] - 2026-10-16

### Fixed

- Send demo page views and AI-assistant fetches to its own Matomo property.

## [0.3.0] - 2026-10-16

### Added

- Add cookieless Matomo, AI-fetch tracking, a demo [privacy page](https://nextstory.marcopontili.com/privacy), and CSP security headers.
- Add demo discovery files, sitemap, web manifest, icon, and JSON-LD.

### Changed

- Move the canonical host to [nextstory.marcopontili.com](https://nextstory.marcopontili.com).

## [0.2.0] - 2026-10-15

### Added

- Test CMS block rendering, draft preview, delivery, and publish webhooks offline.

### Changed

- Update the Storyblok React SDK to 7.3.1.

### Fixed

- Restore demo server rendering and isolate published content from the editor's draft cache.
- Validate preview stories, keep exit redirects on-site, and refresh localized caches on story changes.
- Reject malformed webhooks without cache changes; surface CMS outages as errors.

## [0.1.0] - 2026-10-13

### Added

- Add the Next.js App Router demo with Storyblok blocks, draft preview, and publish revalidation.
- Document architecture, commands, and schema; add CI for lint, changelog checks, and builds.
