# Setup and commands

Use Node.js `^22.13.0 || >=24` and npm. Run commands from the repository root. Bundled seed stories work without a Storyblok account.

## Local development

```bash
npm install
cp .env.example .env   # first setup only; preserve an existing .env
npm run dev            # http://localhost:3000
```

The copy command works in macOS zsh, Windows Git Bash, and WSL bash; Windows PowerShell uses `Copy-Item .env.example .env`. Leave the delivery token empty for bundled content. A populated token switches delivery to Storyblok without falling back to seeds when a story is missing or a request fails.

Stop the dev server before a production build; restart it after production checks. Both use `.next/`.

```bash
npm run lint
npm test                # offline CMS delivery, server rendering, preview, and webhook checks
npm run changelog:lint
npm run build
npm start              # after build
npm run smoke          # route, language, link, and sitemap checks against a running build
npm run verify:agent-readiness  # public Markdown/JSON, catalogs, parity, access, and 404s
npm run verify:browser  # system Chrome, motion/navigation, screenshots in .next/review/
```

The last three commands need a running app and default to `http://localhost:3000`. For another instance, pass its URL directly to the scripts:

```bash
node scripts/smoke.mjs http://localhost:3502
node scripts/verify-agent-readiness.mjs http://localhost:3502
node scripts/verify-browser.mjs http://localhost:3502
```

Check that a port is free before starting a server. Platform-specific listener checks and release gates are in the [development cycle](development-cycle.md#implement-and-review).

## Environment

Root `.env` configures local development; deployment variables must also be set in Vercel. Restart the server after changes. `.env.example` contains the supported keys. An arbitrary export filename such as `.vercel-secrets.env` is not loaded automatically.

| Variable | Used by | Value |
| --- | --- | --- |
| `STORYBLOK_DELIVERY_API_TOKEN` | Page and Markdown delivery | Space preview token from Settings > Access Tokens; empty enables bundled content |
| `STORYBLOK_REGION` | Delivery and imports | Space region: `eu` (default), `us`, `ap`, `ca`, or `cn` |
| `STORYBLOK_VERSION` | Development delivery | `draft` (default) or `published`; production uses published content outside preview |
| `STORYBLOK_PREVIEW_SECRET` | `/api/preview` | Random shared secret for entering draft mode |
| `STORYBLOK_REVALIDATE_SECRET` | `/api/revalidate` | Separate random shared secret for publication events |
| `STORYBLOK_PERSONAL_ACCESS_TOKEN` | Import script only | Personal access token from My account > Personal access tokens |
| `STORYBLOK_SPACE_ID` | Import script only | Target space ID from space settings |

Management authentication does not establish page delivery: the personal access token and space ID cannot replace the delivery token. All tokens stay server-side; these variables do not use a `NEXT_PUBLIC_` prefix.

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

| Import option | Behavior |
| --- | --- |
| `--bootstrap` | Select all tracked components and stories; cannot combine with subset selectors |
| `--only-story <slug>` | Select a story; repeat for multiple stories |
| `--only-component <name>` | Select a schema component; repeat for multiple components |
| `--dry-run` | Read remote state and report changes without writing |
| `--snapshot <file>` | Export remote story state to a new file; read-only |
| `--baseline <file>` | Require remote story state to match the reviewed snapshot before replacing content |
| `--publish` | Publish the selected seed content, rather than saving drafts |

Without selectors, writes require `--bootstrap`. Baselines protect story content, not component schemas; keep snapshots outside version control. Publication sends the selected local seed content, not an arbitrary editor draft. If the remote story differs, review a fresh snapshot before replacing it.

For schema migrations, use component-only selectors and deploy supporting code before publishing stories. Imports map seed references to Storyblok-assigned UUIDs and publish selected targets before consumers. Story-only updates resolve existing reference targets without writing them; include a missing target in the selection to create it.

### Draft preview

For the Visual Editor, use a reachable HTTPS app URL as the default environment, set the home story's real path to `/`, and open the preview entry below with that origin. Local HTTPS: `npm run dev -- --experimental-https` at `https://localhost:3000`; trust the local certificate before opening it in the editor. Block definitions, locale fields, and editor configuration are in [storyblok-schema.md](storyblok-schema.md).

Preview (draftMode):

```text
/api/preview?secret=<STORYBLOK_PREVIEW_SECRET>&slug=home&lang=en
```

Preview verifies draft content before setting a cookie. Nested slugs are supported; invalid paths return 400, missing stories 404, and unavailable content 503. Production stays on published content outside an authenticated preview session.

Exit preview: `/api/exit-preview?next=/blocks`. Return paths must stay on the same origin.

### Publication webhook

```text
POST /api/revalidate?secret=<STORYBLOK_REVALIDATE_SECRET>
```

The `x-revalidate-secret` header is also accepted. Subscribe to `published`, `unpublished`, `deleted`, and `moved` story events. Payloads use `full_slug` (or legacy `slug`); moves include `old_full_slug`. A positive numeric `story_id` without a slug expires all stories. A malformed payload returns 400 and does not change the cache.

Example body: `{"action":"published","story_id":123,"full_slug":"blocks"}`. A successful response lists the affected public paths; tagged content refreshes on the next request across languages.

### Diagnose a connection

| Symptom | Check |
| --- | --- |
| Page says `source: mock` | Set `STORYBLOK_DELIVERY_API_TOKEN`, not only management credentials; restart the app |
| Management API returns 401 | Check the personal access token; adding a space ID does not authenticate a rejected token |
| Management works, delivery fails | Check the separate space preview token and matching region |
| Draft loads, production page is 404 | Publish the story; production requests published content outside preview |
| Seed edit is invisible in connected mode | Import the reviewed seed into the space; connected delivery does not read local JSON |
| Preview returns 401 | Match `STORYBLOK_PREVIEW_SECRET` in the URL and the running environment |
| Published copy stays stale | Check webhook delivery and `STORYBLOK_REVALIDATE_SECRET`; published fetches also revalidate after 60 seconds |

## Brand images

```bash
npm run brand:render    # requires the brand kit's Playwright/sharp tooling
npm run brand:check
```

Sources and tooling: [.github/brand/README.md](../.github/brand/README.md). Local commits, changelog/version ownership, annotated tags, promotion, and CMS publication: [development cycle](development-cycle.md).
