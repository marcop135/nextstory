# Next Story documentation

Run the demo, connect a Storyblok space, and trace content from an editor's draft to server-rendered pages. English and German share the same stories and block model.

## Find a guide

| Task | Guide | What it answers |
| --- | --- | --- |
| Run locally or connect your space | [Setup and commands](commands.md) | Requirements, environment variables, imports, preview, webhooks, and connection failures |
| Edit content or add a block | [Content model](storyblok-schema.md) | Story types, block fields, translations, shared navigation, and related notes |
| Follow a request through the app | [Architecture](architecture.md) | Delivery modes, server rendering, cache tags, route mapping, and public Markdown |
| Verify or release a change | [Development cycle](development-cycle.md) | Local gates, feature PRs, production promotion, tags, and CMS publication |

## Choose a content source

| Mode | Configuration | Result |
| --- | --- | --- |
| Bundled demo | Leave `STORYBLOK_DELIVERY_API_TOKEN` empty | Render tracked seed stories without a CMS account |
| Connected development | Set a space preview token as `STORYBLOK_DELIVERY_API_TOKEN` | Read Storyblok drafts by default; the page badge says `source: storyblok` |
| Published site | Run a production build with the delivery token | Read published stories; authenticated preview alone reads drafts |

The personal access token and space ID enable imports, not page delivery. Local seed edits do not update a connected space, and deploying code does not publish CMS drafts. [Setup](commands.md#storyblok) covers that handoff.

## Navigate the source

| Location | Responsibility |
| --- | --- |
| [`storyblok/`](../storyblok/) | Component schema and localized seed stories |
| [`src/components/`](../src/components/) | Block rendering, shared navigation, and client interactions |
| [`src/lib/`](../src/lib/) | Delivery, localization, content relationships, caching, and public resources |
| [`src/app/`](../src/app/) | HTML pages, preview/webhook routes, Markdown, and discovery endpoints |
| [`scripts/`](../scripts/) | CMS imports, generated types, and verification |

[Project overview and live demo](../README.md)
