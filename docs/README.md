# Next Story documentation

Start the demo, connect Storyblok, or find the guide for a code change.

## Start here

Start with [Local development](commands.md#local-development) to run the bundled demo, then follow [Storyblok setup](commands.md#storyblok) to connect a space.

## Make a change

| Guide | Use it to |
| --- | --- |
| [Add a block](add-a-block.md) | Define, render, translate, and verify a reusable block |
| [Add a campaign](add-a-campaign.md) | Connect a page, campaign ID, consent, and lead intake |
| [Agent skills](agent-skills.md) | Use or add coding-agent skills |
| [Development cycle](development-cycle.md) | Run checks, open a PR, and release code or CMS content |

## Reference

| Guide | Answers |
| --- | --- |
| [Setup and commands](commands.md) | Commands, environment variables, import flags, preview, and webhooks |
| [Content model](storyblok-schema.md) | Story types, blocks, translations, and shared navigation |

### Content sources

| Mode | Configuration | Result |
| --- | --- | --- |
| Bundled demo | Leave `STORYBLOK_DELIVERY_API_TOKEN` empty | Render tracked seed stories without a CMS account |
| Connected development | Set a space preview token as `STORYBLOK_DELIVERY_API_TOKEN` | Read Storyblok drafts by default; the page badge says `source: storyblok` |
| Published site | Run a production build with the delivery token | Read published stories; authenticated preview alone reads drafts |

The personal access token and space ID enable imports only. Local seed edits do not update a connected space, and deploying code does not publish CMS drafts. [Setup and commands: Storyblok](commands.md#storyblok) covers that handoff.

## Understand the system

[Architecture](architecture.md) explains requests, lead submission, caching, and Markdown output. Diagram sources and light/dark images live in [`diagrams/`](diagrams/).

### Source map

| Location | Responsibility |
| --- | --- |
| [`storyblok/`](../storyblok/) | Component schema and localized seed stories |
| [`src/components/`](../src/components/) | Blocks, campaigns, shared layout, visuals, and agent UI |
| [`src/styles/`](../src/styles/) | Design tokens and layered CSS |
| [`src/lib/`](../src/lib/) | Delivery, localization, content relationships, caching, and public resources |
| [`src/app/`](../src/app/) | HTML pages, preview/webhook routes, Markdown, and discovery endpoints |
| [`scripts/`](../scripts/) | CMS imports, generated types, and verification |

[Project overview and live demo](../README.md)
