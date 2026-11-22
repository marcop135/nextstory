---
name: nextstory-caching
description: >-
  Keeps Next Story publish-driven cache tags and revalidation correct: per-story
  tags, the collection tag, draft mode outside the cache, and webhook expiry.
  Use when adding a data read, page, or route, or when a page shows stale or
  draft content after publish.
---

# Caching and revalidation

## When to use

Adding a data read, page, or route, or when published copy stays stale after a Storyblok publish.

## Follow

- [Request path](../../../docs/architecture.md#request-path)
- Revalidate webhook: [Storyblok](../../../docs/commands.md#storyblok)
- Tags: `storyblok` and `storyblok:<sha256(slug)>` in [`src/lib/story-cache.ts`](../../../src/lib/story-cache.ts)

## Traps

- Draft mode must bypass the cache; published fetches share tags across languages.
- A read without its story tag stays stale after publish.
- Legacy ID-only webhook payloads expire the collection, not a single story.

## Done when

```bash
npm run build
npm start
npm run smoke -- http://localhost:3000
```
