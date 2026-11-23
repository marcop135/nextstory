# Add a campaign page

Create a campaign from the existing workshop blocks. Use a feature branch, installed dependencies, and token-free development; production delivery needs HubSpot and Turnstile configuration.

1. Add a page seed under `storyblok/stories/` using [`campaign-workshop.json`](../storyblok/stories/campaign-workshop.json) as the field reference. Give the story its own slug and every block a unique `_uid`. Register the seed in [`mock-story.ts`](../src/lib/mock-story.ts).
2. Include `campaign_brief` and `campaign_action`. Give both the same `campaign_id`: lowercase letters, digits, and hyphens, at most 64 characters. Translate reader-facing fields and links with `__i18n__de` values. Set the audience, goal, measurement, consent text, and privacy link explicitly.
3. Keep the form's `/api/lead` path and existing validation. [`publishedCampaignForm`](../src/lib/campaigns.ts) accepts only a published form whose page and campaign ID match. Do not create a new lead endpoint.
4. Add the page to [`scripts/smoke.mjs`](../scripts/smoke.mjs) and cover its brief and form in [`campaigns.test.ts`](../src/lib/campaigns.test.ts). Run the [local gates](development-cycle.md#implement-and-review), checking the EN/DE form, focus on invalid fields, and `/content/campaigns.json`.
5. Configure the [lead environment variables](commands.md#environment) for production. HubSpot must accept the documented campaign and attribution fields; Turnstile must verify the configured action. Without HubSpot settings the form stays in demo mode.
6. Import the selected story as a draft, deploy any required supporting code, preview the draft on that deployment, then publish through [CMS publication](development-cycle.md#coordinate-storyblok-content). This requires a connected space; do not send test leads to production.

The workshop's saved-feature draft is specific to its registered campaign ID, slug, and feature IDs in [`campaign-draft.ts`](../src/lib/campaign-draft.ts). A new campaign page does not inherit that cookie-backed flow.

[Documentation index](README.md)
