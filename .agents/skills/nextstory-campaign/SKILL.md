---
name: nextstory-campaign
description: >-
  Keeps the Next Story campaign lead path and draft cookie correct: shared
  campaign_id, same-origin lead checks, Turnstile, and the server-read draft
  page. Use when changing the workshop form, lead API, draft cookie, or
  campaign measurement.
---

# Campaign lead and draft

## When to use

Changing the campaign workshop, lead intake, draft cookie, or how a campaign is measured.

## Follow

- [Campaign to lead](../../../docs/architecture.md#campaign-to-lead)
- Lead validation: [`src/lib/lead.ts`](../../../src/lib/lead.ts)
- Draft cookie: [`src/lib/campaign-draft.ts`](../../../src/lib/campaign-draft.ts)
- Env: `CAMPAIGN_DRAFT_SECRET`, HubSpot, and Turnstile in [Environment](../../../docs/commands.md#environment)

## Traps

- Inventing a `campaign_id` in the browser: the server loads the published story and matches the posted id.
- Putting the lead form on `/campaign-workshop/draft`: the draft page must not post leads.
- Allow-listing only seed feature `_uid`s (`workshop-feature-0`, `workshop-feature-1`).

## Done when

```bash
npm test
npm run build
```

With a running build, save picks on `/campaign-workshop` and confirm `/campaign-workshop/draft` shows only those features.
