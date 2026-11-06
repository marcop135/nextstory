import { beforeEach, expect, it, vi } from "vitest";

import { publishedCampaigns } from "@/lib/campaigns";

beforeEach(() => { vi.stubEnv("STORYBLOK_DELIVERY_API_TOKEN", ""); });

it("lists campaign briefs from seed pages in English and German", async () => {
  const campaigns = await publishedCampaigns();
  const workshop = campaigns.filter((c) => c.page_url.endsWith("/campaign-workshop"));
  expect(workshop.map((c) => [c.campaign_id, c.locale, new URL(c.page_url).pathname])).toEqual([
    ["publishing-workshop", "en", "/campaign-workshop"],
    ["publishing-workshop", "de", "/de/campaign-workshop"],
  ]);
  expect(workshop[1].goal).toContain("Interessenbekundung");
  expect(campaigns.every((c) => c.audience && c.goal && c.measure)).toBe(true);
});
