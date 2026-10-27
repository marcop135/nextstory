# Storyblok space schema (Next Story)

Open [Storyblok](https://app.storyblok.com/), sign in, select the project space, then open **Content** and a story such as `home`. The Visual Editor edits copy, blocks, and translations; `config` holds navigation and the footer. Save keeps a draft; Publish updates the live content through the configured webhook.

[`storyblok/components.json`](../storyblok/components.json) defines the content model; [`storyblok/stories/`](../storyblok/stories/) contains the seed stories used by the space, generated types, and offline mode.

```bash
npm run storyblok:push -- --bootstrap --dry-run   # inspect a new-space import
npm run storyblok:push -- --bootstrap             # import drafts into a new space
npm run storyblok:push -- --only-story home --snapshot home-baseline.json
npm run storyblok:push -- --only-story home --baseline home-baseline.json
npm run storyblok:push -- --only-story home --publish  # explicit publication after review
npm run storyblok:types               # regenerate src/types/storyblok.generated.ts
```

`storyblok:push` needs `STORYBLOK_PERSONAL_ACCESS_TOKEN` and `STORYBLOK_SPACE_ID` in `.env`. It writes to the live space.

## Blocks

| Component | Kind | Renders as |
| --- | --- | --- |
| `page` | content type | Page body; `show_block_labels` labels each section with its component name |
| `hero` | nestable | Headline/links plus image and credit, or `animated_visual` with translated stage labels/caption |
| `feature_grid` / `feature` | nestable | Card grid; a feature with `link_href` becomes a link |
| `steps` / `step` | nestable | Numbered list; `file` links the step to a path in this repository |
| `rich_text` | nestable | Storyblok rich text rendered on the server |
| `image_text` | nestable | Image asset with translated alt text, copy, optional link, and reversible desktop layout |
| `accordion` / `accordion_item` | nestable | Native expandable sections with rich text; keyboard-operable without client JavaScript |
| `pull_quote` | nestable | Quotation with optional attribution |
| `comparison_table` | nestable | Captioned table with column/row headers; native `table` field translates as a whole |
| `related_content` | nestable | Ordered story references, rendered as localized links and summaries; missing/unpublished targets are omitted publicly |
| `learning_note` | content type | Reusable title, summary, SEO fields, and rich-text/code-example body; independently previewed and published |
| `code_example` | nestable | Escaped code, language, translated explanation/caption, and repository-relative source link |
| `cta_band` | nestable | Full-width call to action |
| `config` / `nav_link` | content type | Global `config`: header navigation, footer note, and `footer_nav` project links; never served as a page |

## Stories

| Slug | Content type |
| --- | --- |
| `home` | `page` |
| `how-it-works` | `page` |
| `blocks` | `page` |
| `pricing` | `page` |
| `config` | `config` |
| `content-relationships` | `learning_note` |
| `cache-invalidation` | `learning_note` |

## Languages

The space has `de` enabled under Settings → Internationalization. Reader-facing text fields use `translatable`, so German lives in the same story as `field__i18n__de`. Links translate too, so German links point at `/de/...`. Code, language identifiers, and source paths stay unchanged. The comparison table supplies `table__i18n__de` with translated cells. The app requests `language=de` for `/de`; empty translations fall back to English.

Home uses the viewport-controlled hero and ownership comparison. How-it-works and the block library reference the same two learning notes. Their stable seed UUIDs preserve references during new-space imports. Notes reuse rich-text/code-example blocks; publishing a note refreshes reference consumers across languages. Source-parity tests keep displayed code excerpts aligned with their linked files.

## Preview and webhook

1. Visual Editor default environment: `https://nextstory.marcopontili.com/` (local: `https://localhost:3000/`). Home real path: `/`.
2. Preview entry: `https://nextstory.marcopontili.com/api/preview?secret=<STORYBLOK_PREVIEW_SECRET>&slug=home&lang=en`. The route verifies the draft before enabling preview; use `lang=de` for German. Previewing `config` opens the home page.
3. Webhook: `POST https://nextstory.marcopontili.com/api/revalidate?secret=<STORYBLOK_REVALIDATE_SECRET>`. Subscribe to story published, unpublished, deleted, and moved events. Include `old_full_slug` on moves to expire both routes. See the [Storyblok webhook payloads](https://www.storyblok.com/docs/concepts/webhooks) and [Next.js cache tags](https://nextjs.org/docs/app/api-reference/functions/revalidateTag).
