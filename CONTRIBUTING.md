# Contributing

## Setup

```bash
npm install
cp .env.example .env
```

Use a Storyblok Preview token and match `STORYBLOK_REGION` to the space. Without a token, mock stories still render.

## Checks before a PR

```bash
npm run lint
npm test
npm run changelog:lint
npm run build
npm run storyblok:types:check
npm start          # then, in a second terminal: npm run smoke
npm run verify:agent-readiness  # against the same running instance
npm run verify:browser         # system Chrome; desktop/mobile evidence in .next/review/
```

Change blocks in `storyblok/components.json` first, then run `npm run storyblok:types` and add the React component to `src/lib/storyblok.ts`. Keep shared content as referenced stories rather than duplicated block text.

Add a Keep a Changelog bullet under `## [Unreleased]` for user-visible changes.

Keep examples connected to source and verify English/German rendering. The [development cycle](docs/development-cycle.md) defines local review, release commits, annotated tags, production promotion, and coordinated CMS publication.

## Branches

- `develop`: integration; PRs require CI and resolved conversations. Administrators retain the release-only fast-forward exception.
- `main`: production (Vercel); PR, CI, and conversation requirements apply to administrators too.
- `feat/*`: work branches; open PRs into `develop`
