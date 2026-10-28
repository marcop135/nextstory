# Storyblok space schema (Next Story)

Open [Storyblok](https://app.storyblok.com/), sign in, select the project space, then open **Content** and a story such as `home`. The Visual Editor edits copy, blocks, and translations; `config` holds navigation and the footer. Save keeps a draft; Publish updates the live content through the configured webhook.

[`storyblok/components.json`](../storyblok/components.json) defines the model and generates [`src/types/storyblok.generated.ts`](../src/types/storyblok.generated.ts). [`storyblok/stories/`](../storyblok/stories/) contains localized seed content for imports and offline rendering. [Setup and imports](commands.md#storyblok) covers connecting a space and replacing existing content.

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

| Slug | Content type | Purpose |
| --- | --- | --- |
| `home` | `page` | Landing page, publishing illustration, ownership comparison, and closing CTA |
| `how-it-works` | `page` | Delivery workflow with source links and related notes |
| `blocks` | `page` | Block catalog with component-name labels |
| `pricing` | `page` | Example page composed from the same blocks |
| `config` | `config` | Shared header navigation, footer note, and footer project links |
| `content-relationships` | `learning_note` | Reusable explanation of referenced content |
| `cache-invalidation` | `learning_note` | Reusable explanation of publication-driven caching |

## Edit a page

1. Open a `page` story and edit its `body` blocks. Keep one hero headline per page; use section headings inside subsequent blocks.
2. Edit `seo_title` and `seo_description` independently of visible copy. The app uses them for page metadata and language alternates.
3. Switch to German and translate reader-facing fields, image alt text, and internal links. Preserve the original story slug.
4. Save the draft and review both languages through [authenticated preview](commands.md#draft-preview). Publish after review; check the public page and its Markdown representation.

The closing home CTA belongs to the `home` story's `cta_band`, not global configuration. Header links and the footer's Explore group share `config.header_nav`; footer project links use `config.footer_nav`. The `config` story is never a public page.

## Languages

Enable `de` under Settings > Internationalization. Reader-facing text fields use `translatable`, so German lives in the same story as `field__i18n__de`. Links translate too, so German links point at `/de/...`. Code, language identifiers, and source paths stay unchanged. The comparison table supplies `table__i18n__de` with translated cells. The app requests `language=de` for `/de`; empty translations fall back to English.

Home uses the viewport-controlled hero and ownership comparison. How-it-works and the block library reference the same two learning notes. Seed UUIDs identify local relationships; imports map them to the UUIDs assigned by each Storyblok space. Notes reuse rich-text/code-example blocks; publishing a note refreshes reference consumers across languages. Source-parity tests keep displayed code excerpts aligned with their linked files.

## Add a block

1. Define fields in `storyblok/components.json`; mark reader-facing fields translatable and include the component in its parent's block whitelist.
2. Run `npm run storyblok:types`. Implement the component in `src/components/` and register its schema name in `src/lib/storyblok.ts`.
3. Add an English/German example to the block-library seed. New offline stories must also be registered in `src/lib/mock-story.ts`.
4. Check server rendering and Markdown output. Update `src/lib/story-markdown.ts` if the new block needs serialization, then run the [verification gates](development-cycle.md#implement-and-review).
5. Import the selected schema changes, deploy the renderer, then preview and publish reviewed content using the new block.

Use `related_content.stories` for ordered links to shared `learning_note` stories rather than duplicating their text. Targets must be published to appear in public related-content lists; drafts remain available in authenticated preview.
