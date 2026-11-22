---
name: nextstory-copy
description: >-
  Edits Next Story English and German copy together: Storyblok seed stories,
  field-level __i18n__de values, and fixed For agents / Privacy pages. Use when
  asked to change text, wording, headings, or translations.
---

# Edit copy and translations

## When to use

Changing text, wording, headings, or translations on a page or in the shell.

## Follow

- Seeds: [`storyblok/stories/`](../../../storyblok/stories/)
- Field-level German: [Languages](../../../docs/storyblok-schema.md#languages)
- Fixed Privacy and For agents routes under `src/app/`
- Live space: [Coordinate Storyblok content](../../../docs/development-cycle.md#coordinate-storyblok-content)

## Traps

- Editing English only: every reader-facing seed field needs `__i18n__de`.
- Changing a story slug: German keeps the same slug under `/de/...`.
- A seed edit does not update a story that is already published in Storyblok until you push and publish.

## Done when

```bash
npm test
npm run build
```

Check English and German HTML for the edited page.
