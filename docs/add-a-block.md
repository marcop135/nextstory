# Add a Storyblok block

Add a block that editors can place in a page or learning note. Use a token-free development checkout with dependencies installed and a feature branch from `develop`.

1. Add its schema to [`storyblok/components.json`](../storyblok/components.json). Set `is_nestable: true`; mark reader-facing fields `translatable: true`. Add the name to each intended parent's `body.component_whitelist`.
2. Generate the types:

   ```bash
   npm run storyblok:types
   ```

3. Add the renderer under `src/components/blocks/`, or `src/components/campaign/` for a `campaign_` name. Import its generated type from `src/types/storyblok.generated.ts`; preserve `storyblokEditable` attributes. Register it in [`storyblokComponents`](../src/lib/storyblok.ts).
4. Add an EN/DE example to [`storyblok/stories/blocks.json`](../storyblok/stories/blocks.json), using `field__i18n__de` for translated fields. Register any new story in [`mock-story.ts`](../src/lib/mock-story.ts); an example in an existing story needs no registration.
5. Add its published representation to [`blockMarkdown`](../src/lib/story-markdown.ts). Add behavior and serialization coverage alongside [`StoryRenderer.test.ts`](../src/components/StoryRenderer.test.ts) and [`agent-resources.test.ts`](../src/lib/agent-resources.test.ts).
6. Run the [local gates](development-cycle.md#implement-and-review). Check EN/DE HTML and Markdown, desktop/mobile screenshots, keyboard controls, and reduced motion. The block catalog test in `agent-resources.test.ts` must resolve the renderer's path.
7. Coordinate the selected schema import, code deployment, draft preview, and publication through [CMS publication](development-cycle.md#coordinate-storyblok-content). Those commands require a connected space and are not part of token-free verification.

[Documentation index](README.md)
