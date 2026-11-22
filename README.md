<p align="center">
  <a href="https://nextstory.marcopontili.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/brand/readme-dark-rounded.svg" />
      <img src=".github/brand/readme-light-rounded.svg" alt="Next Story, Next.js + Storyblok CMS Demo: editors own the content, developers own the components" width="100%" />
    </picture>
  </a>
</p>

# Next Story

[![CI](https://img.shields.io/github/actions/workflow/status/marcop135/nextstory/ci.yml?branch=develop&label=CI)](https://github.com/marcop135/nextstory/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/marcop135/nextstory?label=Release)](https://github.com/marcop135/nextstory/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)
[![Node.js 22+](https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-087EA4?logo=react&logoColor=white)](https://react.dev/)
[![Storyblok](https://img.shields.io/badge/Storyblok-CMS-09B3AF?logo=storyblok&logoColor=white)](https://www.storyblok.com/)

**A marketing site is more than its pages.** Next Story is a [Next.js](https://nextjs.org/) and [Storyblok](https://www.storyblok.com/) demo that runs what turns a visit into a lead, in public: campaigns, consent, attribution, preview, caching, and releases.

Every page shows one part working and links to its code. **Marketers** build pages and campaigns from blocks in Storyblok; **developers** own the blocks, the lead pipeline, and the guardrails.

## Features

- Shared Storyblok blocks for pages and campaigns, with draft preview before publish
- Server-checked leads: same origin, published campaign, honeypot, rate limit, Turnstile
- One `campaign_id` from Storyblok through HubSpot and Matomo
- Publish webhooks that refresh only the changed pages
- Field-level English and German
- Cookieless Matomo analytics
- Read-only agent access to Markdown, catalogs, OpenAPI, and skills

## Explore the demo

Live demo: **[nextstory.marcopontili.com](https://nextstory.marcopontili.com)**

| Page | What it shows |
| --- | --- |
| [Home](https://nextstory.marcopontili.com/) | Editor and developer responsibilities |
| [How it works](https://nextstory.marcopontili.com/how-it-works) | Edit-to-publish workflow linked to source |
| [Blocks](https://nextstory.marcopontili.com/blocks) | Block examples with component labels |
| [Campaign workshop](https://nextstory.marcopontili.com/campaign-workshop) | Pick features, save a draft the server reads later, and submit a lead |
| [Deutsch](https://nextstory.marcopontili.com/de) | Field-level German translations |
| [For agents](https://nextstory.marcopontili.com/for-agents) | Published Markdown, block catalog, read-only tools |

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

Four Markdown skills ship once under [`.agents/skills/`](.agents/skills/); [`.claude/skills/`](.claude/skills/) is symlinks so Claude Code, Cursor, and Codex all load the same files. Each skill points at a how-to and the checks CI runs.

[Agent skills docs](docs/agent-skills.md)

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
