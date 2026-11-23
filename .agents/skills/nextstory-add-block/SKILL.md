---
name: nextstory-add-block
description: >-
  Adds a Storyblok block editors can place on a Next Story page: schema,
  types, React component, registration, seed example, and Markdown fallback.
  Use when asked to add, create, or build a block or campaign block in this
  repo.
---

# Add a block

## When to use

Adding a new page or campaign block editors can place in Storyblok.

## Follow

- [Add a block](../../../docs/storyblok-schema.md#add-a-block)
- Register the schema name in [`src/lib/storyblok.ts`](../../../src/lib/storyblok.ts)
- Put the component under `src/components/blocks/` or `src/components/campaign/`

## Traps

- Stopping after the React component: types, seed example, `mock-story` registration, and Markdown serialization get skipped.
- Reader-facing fields need `translatable: true` and a German seed value.
- Campaign blocks stay under `campaign/`; the block catalog path lookup depends on the `campaign_` name prefix.

## Done when

```bash
npm run storyblok:types
npm run lint
npm test
npm run build
```
