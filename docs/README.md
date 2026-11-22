# Next Story documentation

Run the demo, connect a Storyblok space, and follow content from an editor draft to server-rendered pages. English and German share the same stories and block model.

## Guides

| Guide | Answers |
| --- | --- |
| [Setup and commands](commands.md) | Local run, environment variables, Storyblok import, preview, webhooks, and connection failures |
| [Content model](storyblok-schema.md) | Story types, blocks, translations, shared navigation, and how to add a block |
| [Architecture](architecture.md) | Request path, campaign-to-lead, cache tags, routes, and public Markdown |
| [Agent skills](agent-skills.md) | In-repo skills for Claude Code, Cursor, and Codex |
| [Development cycle](development-cycle.md) | Local gates, feature PRs, production promotion, tags, and CMS publication |

## Choose a content source

| Mode | Configuration | Result |
| --- | --- | --- |
| Bundled demo | Leave `STORYBLOK_DELIVERY_API_TOKEN` empty | Render tracked seed stories without a CMS account |
| Connected development | Set a space preview token as `STORYBLOK_DELIVERY_API_TOKEN` | Read Storyblok drafts by default; the page badge says `source: storyblok` |
| Published site | Run a production build with the delivery token | Read published stories; authenticated preview alone reads drafts |

The personal access token and space ID enable imports only. Local seed edits do not update a connected space, and deploying code does not publish CMS drafts. [Setup and commands: Storyblok](commands.md#storyblok) covers that handoff.

## Navigate the source

| Location | Responsibility |
| --- | --- |
| [`storyblok/`](../storyblok/) | Component schema and localized seed stories |
| [`src/components/`](../src/components/) | Block rendering by folder (`blocks/`, `campaign/`, `layout/`, `visuals/`, `agents/`, `seo/`) |
| [`src/styles/`](../src/styles/) | Layered global CSS (`reset`, `tokens`, `base`, `layout`, `components`) |
| [`src/lib/`](../src/lib/) | Delivery, localization, content relationships, caching, and public resources |
| [`src/app/`](../src/app/) | HTML pages, preview/webhook routes, Markdown, and discovery endpoints |
| [`scripts/`](../scripts/) | CMS imports, generated types, and verification |

[Project overview and live demo](../README.md)
