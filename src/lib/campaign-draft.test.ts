import { createHmac } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

import StoryRenderer from "@/components/StoryRenderer";
import {
  campaignDraftContent,
  publishedFeatureUids,
  readCampaignDraft,
  signCampaignDraft,
} from "@/lib/campaign-draft";
import { markdownPathForPage } from "@/lib/agent-paths";
import { mockStoryForSlug } from "@/lib/mock-story";

const SECRET = "test-secret";
const forge = (draft: unknown, secret = SECRET) => {
  const payload = Buffer.from(JSON.stringify(draft)).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
};

it("round-trips an allow-listed selection", () => {
  expect(readCampaignDraft(signCampaignDraft(["workshop-feature-1"], SECRET), SECRET)).toEqual(["workshop-feature-1"]);
  expect(readCampaignDraft(signCampaignDraft(["workshop-feature-1", "workshop-feature-0", "workshop-feature-1"], SECRET), SECRET))
    .toEqual(["workshop-feature-0", "workshop-feature-1"]);
});

it.each([
  ["a missing cookie", undefined],
  ["a bad signature", signCampaignDraft(["workshop-feature-0"], "other-secret")],
  ["a truncated value", signCampaignDraft(["workshop-feature-0"], SECRET).slice(0, -2)],
  ["another campaign", forge({ campaignId: "other", featureUids: ["workshop-feature-0"] })],
  ["an unknown feature id", forge({ campaignId: "publishing-workshop", featureUids: ["workshop-feature-0", "hero"] })],
  ["a non-array selection", forge({ campaignId: "publishing-workshop", featureUids: "workshop-feature-0" })],
  ["garbage", "not-a-cookie"],
])("reads %s as an empty selection", (_, value) => {
  expect(readCampaignDraft(value, SECRET)).toEqual([]);
});

it("reads nothing without a secret", () => {
  expect(readCampaignDraft(signCampaignDraft(["workshop-feature-0"], SECRET), null)).toEqual([]);
});

it("finds the published feature ids in the campaign story", () => {
  expect(publishedFeatureUids(mockStoryForSlug("campaign-workshop")!.content)).toEqual(["workshop-feature-0", "workshop-feature-1"]);
  expect(publishedFeatureUids(mockStoryForSlug("home")!.content)).toEqual([]);
});

it("limits the draft grid to the selection and drops the lead form", () => {
  const content = mockStoryForSlug("campaign-workshop")!.content;
  const one = campaignDraftContent(content, ["workshop-feature-1"]);
  const grid = one.body.find((blok: { _uid: string }) => blok._uid === "workshop-benefits");
  expect(grid.features.map((f: { _uid: string }) => f._uid)).toEqual(["workshop-feature-1"]);
  expect(one.body.some((blok: { component: string }) => blok.component === "campaign_action")).toBe(false);
  const none = campaignDraftContent(content, []);
  expect(none.body.some((blok: { _uid: string }) => blok._uid === "workshop-benefits")).toBe(false);
  expect(content.body.find((blok: { _uid: string }) => blok._uid === "workshop-benefits").features).toHaveLength(2);
});

it("renders the campaign grid as a checkbox form that reflects the selection", () => {
  const story = mockStoryForSlug("campaign-workshop", "de")!;
  const html = renderToStaticMarkup(createElement(StoryRenderer, {
    story, source: "mock", campaignSelection: { selected: ["workshop-feature-0"], locale: "de" },
  }));
  expect(html).toContain('action="/api/campaign-draft"');
  expect(html).toContain('<input type="hidden" name="locale" value="de"/>');
  expect(html).toContain('name="featureUids" checked="" value="workshop-feature-0"');
  expect(html).toContain('name="featureUids" value="workshop-feature-1"');
  expect(html).toContain('href="/de/campaign-workshop/draft"');
  expect(html).toContain("Gemeinsame Seitenmuster");
});

it("keeps the plain feature grid without a selection prop or on other stories", () => {
  const plain = renderToStaticMarkup(createElement(StoryRenderer, { story: mockStoryForSlug("campaign-workshop")!, source: "mock" }));
  expect(plain).not.toContain("/api/campaign-draft");
  expect(plain).toContain("Shared page patterns");
  const home = renderToStaticMarkup(createElement(StoryRenderer, {
    story: mockStoryForSlug("home")!, source: "mock", campaignSelection: { selected: [], locale: "en" },
  }));
  expect(home).not.toContain("/api/campaign-draft");
});

it("advertises no Markdown twin for the draft pages", () => {
  expect(markdownPathForPage("/campaign-workshop/draft")).toBeNull();
  expect(markdownPathForPage("/de/campaign-workshop/draft")).toBeNull();
  expect(markdownPathForPage("/campaign-workshop")).toBe("/content/campaign-workshop.md");
});
