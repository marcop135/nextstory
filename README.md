<p align="center">
  <a href="https://nextstory.marcopontili.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/brand/readme-dark-rounded.svg" />
      <img src=".github/brand/readme-light-rounded.svg" alt="Next Story: a marketing site is more than its pages" width="100%" />
    </picture>
  </a>
</p>

# Next Story

[![CI](https://img.shields.io/github/actions/workflow/status/marcop135/nextstory/ci.yml?branch=develop&label=CI)](https://github.com/marcop135/nextstory/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/marcop135/nextstory?label=Release)](https://github.com/marcop135/nextstory/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)

**A marketing site is more than its pages.** Next Story is a [Next.js](https://nextjs.org/) and [Storyblok](https://www.storyblok.com/) [live demo](https://nextstory.marcopontili.com) that runs what turns a visit into a lead, in public: campaigns, consent, attribution, preview, caching, and releases.

Every page shows one part working and links to its code. **Marketers** build pages and campaigns from blocks in Storyblok; **developers** own the blocks, the lead pipeline, and the guardrails.

## Features

- Shared Storyblok blocks for pages and campaigns, with draft preview before publish
- Server-checked leads: same origin, published campaign, honeypot, rate limit, Turnstile
- One `campaign_id` from Storyblok through HubSpot and Matomo
- Publish webhooks that refresh only the changed pages
- Field-level English and German
- Cookieless Matomo analytics
- Source links on every page to trace the working example
- Read-only agent access to Markdown, catalogs, OpenAPI, and skills

## Explore the demo

Live demo: **[nextstory.marcopontili.com](https://nextstory.marcopontili.com)**

| Page | What you can do |
| --- | --- |
| [Home](https://nextstory.marcopontili.com/) | Compare editor and developer responsibilities |
| [How it works](https://nextstory.marcopontili.com/how-it-works) | Reorder a draft and publish it to a local preview |
| [Blocks](https://nextstory.marcopontili.com/blocks) | Inspect required fields and English/German values |
| [Campaign workshop](https://nextstory.marcopontili.com/campaign-workshop) | Inspect attribution, pick features, save a draft, and submit a lead |
| [Cache invalidation](https://nextstory.marcopontili.com/cache-invalidation) | Compare HEAD request timings and response headers |
| [Content relationships](https://nextstory.marcopontili.com/content-relationships) | Trace a shared learning note to its referring pages |
| [Deutsch](https://nextstory.marcopontili.com/de) | Read the same pages in German |
| [For agents](https://nextstory.marcopontili.com/for-agents) | Read published Markdown, inspect the block catalog, and trace source links |

## How content flows

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/content-flow-dark.svg" />
  <img src="docs/content-flow-light.svg" alt="Content flow from Storyblok through cache and preview to English/German pages and read-only agent tools" width="720" />
</picture>

See [Architecture](docs/architecture.md) for request flows.

[Content model](docs/storyblok-schema.md) · [Setup and commands](docs/commands.md) · [Development cycle](docs/development-cycle.md)

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript 5 |
| Styling | Plain CSS with cascade layers and `light-dark()` |
| Content | Storyblok, Visual Editor, HubSpot leads, Turnstile, English and German |
| Caching | Tagged fetch cache, expired on publish |
| Quality | ESLint, Storyblok types, GitHub Actions CI, Dependabot |
| Security | Security headers |
| Analytics | Self-hosted Matomo, cookieless |
| Hosting | Vercel, Cloudflare DNS |

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

## Agent skills

Three public workflows read a German page, inspect the block model, and trace a block to code. They are read-only and need no key: [skill index](https://nextstory.marcopontili.com/.well-known/agent-skills/index.json) · [For agents](https://nextstory.marcopontili.com/for-agents).

## Storyblok setup

Create a space, enable German (`de`), then follow [own-space setup](docs/commands.md#storyblok). Variables are optional locally; set them in `.env` for CMS mode:

| Variable | Required for | Purpose / default |
| --- | --- | --- |
| `STORYBLOK_DELIVERY_API_TOKEN` | CMS content | Server-only preview token for draft and published content |
| `STORYBLOK_REGION` | Non-EU spaces | Space region; defaults to `eu` |
| `STORYBLOK_VERSION` | Optional | Local delivery version; defaults to `draft`. Production uses `published` outside preview |
| `STORYBLOK_PREVIEW_SECRET` | Draft preview | Authenticates `/api/preview` |
| `STORYBLOK_REVALIDATE_SECRET` | Publish webhooks | Authenticates `/api/revalidate` |
| `STORYBLOK_PERSONAL_ACCESS_TOKEN`, `STORYBLOK_SPACE_ID` | Schema/story import | Management API credentials for `storyblok:push` only |

## Contributing

Found a bug or have an idea? Open an [issue](https://github.com/marcop135/nextstory/issues), or read [CONTRIBUTING.md](./CONTRIBUTING.md) before a pull request. To report a vulnerability, use [SECURITY.md](./SECURITY.md) instead of a public issue.

## Author

[Marco Pontili](https://marcopontili.com)

## License

[MIT](./LICENSE)
