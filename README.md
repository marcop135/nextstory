<p align="center">
  <a href="https://nextstory.marcopontili.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/brand/readme-dark-rounded.svg" />
      <img src=".github/brand/readme-light-rounded.svg" alt="Next Story: editors own the content, developers own the components" width="100%" />
    </picture>
  </a>
</p>

# Next Story

A [Next.js](https://nextjs.org/) App Router and [Storyblok](https://www.storyblok.com/) learning project. Explore content modeling, draft preview, localization, caching, and read-only agent access, with each feature linked to its source.

[![CI](https://img.shields.io/github/actions/workflow/status/marcop135/nextstory/ci.yml?branch=develop&label=CI)](https://github.com/marcop135/nextstory/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/marcop135/nextstory?label=Release)](https://github.com/marcop135/nextstory/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)
[![Node.js 22+](https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-087EA4?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Storyblok](https://img.shields.io/badge/Storyblok-CMS-09B3AF?logo=storyblok&logoColor=white)](https://www.storyblok.com/)

## Explore the demo

Live demo: **[nextstory.marcopontili.com](https://nextstory.marcopontili.com)**

| Page | What it shows |
| --- | --- |
| [Home](https://nextstory.marcopontili.com/) | Editor and developer responsibilities |
| [How it works](https://nextstory.marcopontili.com/how-it-works) | Edit-to-publish workflow linked to source |
| [Blocks](https://nextstory.marcopontili.com/blocks) | Block examples with component labels |
| [Deutsch](https://nextstory.marcopontili.com/de) | Field-level German translations |
| [For agents](https://nextstory.marcopontili.com/for-agents) | Published Markdown, block catalog, read-only tools |

## How content flows

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/content-flow-dark.svg" />
  <img src="docs/content-flow-light.svg" alt="Content flow from Storyblok through cache and preview to English/German pages and read-only agent tools" width="720" />
</picture>

See [Architecture](docs/architecture.md) for request flows.

## Source files by feature

| Feature | Source |
| --- | --- |
| Schema and types | [`storyblok/components.json`](storyblok/components.json), [`scripts/storyblok-types.mjs`](scripts/storyblok-types.mjs) |
| CMS blocks | [`src/lib/storyblok.ts`](src/lib/storyblok.ts), [`src/components/`](src/components/) |
| Preview and revalidation | [`preview/route.ts`](src/app/api/preview/route.ts), [`revalidate/route.ts`](src/app/api/revalidate/route.ts) |
| Navigation and footer | [`src/lib/site-config.ts`](src/lib/site-config.ts), [`src/components/SiteChrome.tsx`](src/components/SiteChrome.tsx) |
| Related notes | [`src/lib/related-content.ts`](src/lib/related-content.ts), [`src/components/RelatedContent.tsx`](src/components/RelatedContent.tsx) |
| Localization | [`src/lib/i18n.ts`](src/lib/i18n.ts), [`src/proxy.ts`](src/proxy.ts) |
| Seed stories | [`src/lib/mock-story.ts`](src/lib/mock-story.ts) |
| Published Markdown | [`src/lib/story-markdown.ts`](src/lib/story-markdown.ts) |
| Campaign to lead | [`lead/route.ts`](src/app/api/lead/route.ts), [`CampaignAction.tsx`](src/components/CampaignAction.tsx), [`agent-tools.ts`](src/lib/agent-tools.ts) (`get_campaign_brief`), [flow](docs/architecture.md#campaign-to-lead) |
| Read-only agent access | [`src/lib/agent-resources.ts`](src/lib/agent-resources.ts), [`src/lib/agent-tools.ts`](src/lib/agent-tools.ts) |

[Content schema](docs/storyblok-schema.md) · [Commands](docs/commands.md) · [Development cycle](docs/development-cycle.md)

## Quick start

Requires Node.js 22+.

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000. Without a Storyblok delivery token, bundled English/German stories run locally.

Run `npm test` for CMS workflows.

Against a running build:

- `npm run smoke`: page journeys, links, and sitemap.
- `npm run verify:agent-readiness`: public resources and read-only tools.
- `npm run verify:browser`: motion, navigation, and responsive screenshots.

## Storyblok setup

Create a space, enable German (`de`), and follow [own-space setup](docs/commands.md#storyblok) for imports, preview, and webhooks. Imports save drafts; replacements require a reviewed snapshot.

All variables are optional in local mode. Set them in `.env` for CMS mode:

| Variable | Required for | Purpose / default |
| --- | --- | --- |
| `STORYBLOK_DELIVERY_API_TOKEN` | CMS content | Server-only preview token for draft and published content |
| `STORYBLOK_REGION` | Non-EU spaces | Space region; defaults to `eu` |
| `STORYBLOK_VERSION` | Optional | Local delivery version; defaults to `draft`. Production uses `published` outside preview |
| `STORYBLOK_PREVIEW_SECRET` | Draft preview | Authenticates `/api/preview` |
| `STORYBLOK_REVALIDATE_SECRET` | Publish webhooks | Authenticates `/api/revalidate` |
| `STORYBLOK_PERSONAL_ACCESS_TOKEN`, `STORYBLOK_SPACE_ID` | Schema/story import | Management API credentials for `storyblok:push` only |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

Bug reports and feature requests go through [issues](https://github.com/marcop135/nextstory/issues). Vulnerabilities go through [SECURITY.md](./SECURITY.md) instead.

## Author

[Marco Pontili](https://marcopontili.com)

## License

[MIT](./LICENSE)
