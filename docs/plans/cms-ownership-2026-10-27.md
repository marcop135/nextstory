# Demonstrate CMS ownership through motion, navigation, and related content

## Context

The publishing illustration starts before mobile readers reach it. Footer links remain hard-coded, and seed imports publish every story by default. Extend the existing architecture with one relationship-driven block and explicit content-write boundaries.

## Assumptions tested

| Assumption | Evidence | Implementation |
| --- | --- | --- |
| Animation starts without visibility checks | `PublishingVisual.tsx`, `globals.css`, mobile browser reproduction | Observe the figure; pause offscreen and in hidden tabs; keep the static reduced-motion state. |
| Global config already supplies navigation | `layout.tsx`, `config.json`, `components.json` | Reuse `nav_link` for localized footer navigation. |
| Related stories need independent publication | `fetch-story.ts`, `story-cache.ts`, webhook tests | Resolve published references separately and invalidate reference consumers on content events. |
| Imports overwrite content and publish by default | `storyblok-push.mjs`, `storyblok-sync.mjs` | Draft-first subsets, explicit bootstrap/publication, snapshots, baseline conflict checks before mutations. |
| Browser verification is reproducible | Installed Playwright 1.61.1 and system Chrome | Track the dependency and add browser checks beside existing smoke checks. |
| Branch rules are not enforced | GitHub protection endpoints and empty ruleset list | Require PRs and the existing `Test, lint and build` check on both integration and production. |

## Changes

- Keep publishing illustration markup and CSS; add a small visibility-controlled client boundary.
- Render compact Explore and Project footer groups from localized global config.
- Add `related_content` and independent `learning_note` stories with EN/DE examples, generated types, Markdown parity, and published-only resolution.
- Separate bootstrap, selected schema changes, draft content updates, and explicit publication in the import CLI.
- Extend browser verification for delayed mobile scrolling, pause/resume, reduced motion, locale navigation, keyboard access, and desktop/mobile screenshots.
- Replace affected architecture, schema, command, and contribution guidance; add Unreleased entries.
- Require PRs and passing CI through GitHub branch protection after verification.

## Files

Existing: `PublishingVisual.tsx`, `SiteChrome.tsx`, `layout.tsx`, `globals.css`, schema/types, story delivery/cache/Markdown modules, webhook tests, seed stories, import scripts, CI, and existing docs.

New: related-content and learning-note components/stories, reference/import regression tests, and `scripts/verify-browser.mjs`.

## Verification

- Generated types, lint, tests, changelog lint, production build, smoke, and agent readiness pass.
- A mobile reader can wait five seconds before scrolling and still see the sequence from its beginning.
- Offscreen and hidden-tab pauses retain progress; completed motion does not replay.
- Reduced-motion and JavaScript-disabled pages retain readable static illustrations.
- EN/DE footer navigation, related content, mobile menu, and 320/390/768/1440px layouts render without overflow.
- Desktop/mobile light/dark screenshots match the existing CSS tokens and hierarchy.
- Import conflicts prevent all writes; snapshots perform reads only; publication requires an explicit flag.
- GitHub protection reports PR/check requirements on both branches, with the documented administrator fast-forward exception on `develop`.
