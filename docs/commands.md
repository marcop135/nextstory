# Commands

```bash
npm install
cp .env.example .env   # then fill Storyblok tokens
npm run dev            # http://localhost:3000
npm run lint
npm test                # offline CMS delivery, server rendering, preview, and webhook checks
npm run changelog:lint
npm run build
npm start              # after build
npm run smoke          # route, language, link, and sitemap checks against a running build
npm run verify:agent-readiness  # public Markdown/JSON, catalogs, parity, access, and 404s
npm run verify:browser  # system Chrome, motion/navigation, screenshots in .next/review/
```

## Storyblok

1. Create your own Storyblok space. Enable German (`de`) under Settings > Internationalization.
2. Copy the space's preview token from Settings > Access Tokens into `STORYBLOK_DELIVERY_API_TOKEN` in `.env`. Set `STORYBLOK_REGION` to match the space (`eu` by default).
3. For the import, set `STORYBLOK_PERSONAL_ACCESS_TOKEN` from My account > Personal access tokens and `STORYBLOK_SPACE_ID` from the space settings. These credentials are only read by the import script.
4. Run the bootstrap dry run, then import drafts. Review them in authenticated preview before explicit publication. Existing story replacements require a remote snapshot and abort if the content changes after that snapshot.

```bash
npm run storyblok:push -- --bootstrap --dry-run
npm run storyblok:push -- --bootstrap
npm run storyblok:push -- --only-story home --snapshot home-baseline.json
npm run storyblok:push -- --only-story home --baseline home-baseline.json --dry-run
npm run storyblok:push -- --only-story home --baseline home-baseline.json
npm run storyblok:push -- --only-story home --publish
npm run storyblok:types        # after editing storyblok/components.json
npm run storyblok:types:check  # CI: fails when the generated types are stale
```

`--only-story <slug>` and `--only-component <name>` are repeatable. Without selectors, writes require `--bootstrap`. Snapshot exports perform reads only and refuse to replace an existing file. Baselines protect story content, not developer-owned component schemas. Use component-only selectors for schema migrations; deploy supporting code before publishing selected stories. Learning-note seeds carry stable UUIDs so references work in a new space; a conflicting existing UUID aborts the import.

Set `STORYBLOK_PREVIEW_SECRET` and `STORYBLOK_REVALIDATE_SECRET` to separate random values in `.env` and your deployment environment. Restart the app after changing environment variables. No separate public delivery token is used; the preview token stays on the server and production requests published content.

For the Visual Editor, use a reachable HTTPS app URL as the default environment, set the home story's real path to `/`, and open the preview entry below with that origin. Local HTTPS: `npm run dev -- --experimental-https` at `https://localhost:3000`; trust the local certificate before opening it in the editor. Block definitions, locale fields, and editor configuration are in [storyblok-schema.md](storyblok-schema.md).

Preview (draftMode):

```text
/api/preview?secret=<STORYBLOK_PREVIEW_SECRET>&slug=home&lang=en
```

Preview verifies draft content before setting a cookie. Nested slugs are supported; invalid paths return 400, missing stories 404, and unavailable content 503. Production stays on published content outside an authenticated preview session.

Exit preview: `/api/exit-preview?next=/pricing`. Return paths must stay on the same origin.

Publish webhook:

```text
POST /api/revalidate?secret=<STORYBLOK_REVALIDATE_SECRET>
```

The `x-revalidate-secret` header is also accepted. Subscribe to `published`, `unpublished`, `deleted`, and `moved` story events. Payloads use `full_slug` (or legacy `slug`); moves include `old_full_slug`. A positive numeric `story_id` without a slug expires all stories. A malformed payload returns 400 and does not change the cache.

Example body: `{"action":"published","story_id":123,"full_slug":"pricing"}`. A successful response lists the affected public paths; tagged content refreshes on the next request across languages.

## Brand images

```bash
npm run brand:render    # requires the brand kit's Playwright/sharp tooling
npm run brand:check
```

Sources and tooling: [.github/brand/README.md](../.github/brand/README.md). Local commits, changelog/version ownership, annotated tags, promotion, and CMS publication: [development cycle](development-cycle.md).
