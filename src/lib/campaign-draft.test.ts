import { createHmac } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

import StoryRenderer from "@/components/StoryRenderer";
import {
  campaignDraftContent,
  publishedFeatureUids,
  selectedFeatureTitles,
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

it("limits the draft grid to the selection, moves it under a named hero, and drops the lead form", () => {
  const content = mockStoryForSlug("campaign-workshop")!.content;
  const one = campaignDraftContent(content, ["workshop-feature-1"], "en");
  expect(one.body.map((blok: { _uid: string }) => blok._uid).slice(0, 2)).toEqual(["workshop-hero", "workshop-benefits"]);
  const grid = one.body.find((blok: { _uid: string }) => blok._uid === "workshop-benefits");
  expect(grid.features.map((f: { _uid: string }) => f._uid)).toEqual(["workshop-feature-1"]);
  expect(one.body.some((blok: { component: string }) => blok.component === "campaign_action")).toBe(false);
  const hero = one.body[0];
  expect(hero.headline).toBe("Your workshop: A review process editors can use");
  const de = campaignDraftContent(mockStoryForSlug("campaign-workshop", "de")!.content, ["workshop-feature-0", "workshop-feature-1"], "de");
  expect(de.body[0].headline).toBe("Ihr Workshop: Gemeinsame Seitenmuster und Ein nutzbarer Redaktionsprozess");
  const none = campaignDraftContent(content, [], "en");
  expect(none.body.some((blok: { _uid: string }) => blok._uid === "workshop-benefits")).toBe(false);
  expect(none.body[0].headline).toBe(content.body[0].headline);
  expect(content.body.find((blok: { _uid: string }) => blok._uid === "workshop-benefits").features).toHaveLength(2);
  expect(selectedFeatureTitles(content, ["workshop-feature-1", "workshop-feature-0"])).toEqual(["Shared page patterns", "A review process editors can use"]);
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
  expect(html).toContain('id="workshop-benefits"');
  expect(html).not.toContain("Gespeichert:");
});

it("confirms a save by name, opens the draft first, and offers only allow-listed features", () => {
  const story = mockStoryForSlug("campaign-workshop")!;
  const grid = story.content.body.find((blok: { _uid: string }) => blok._uid === "workshop-benefits");
  grid.features.push({ _uid: "workshop-feature-2", component: "feature", title: "Unlisted feature" });
  const render = (selection: { selected: string[]; saved?: boolean }) => renderToStaticMarkup(createElement(StoryRenderer, {
    story, source: "mock", campaignSelection: { locale: "en", ...selection },
  }));
  const saved = render({ selected: ["workshop-feature-1"], saved: true });
  expect(saved).toContain("<strong>Draft saved. </strong>Your draft page covers: A review process editors can use.");
  expect(saved).toMatch(/class="btn feature-choice__open" href="\/campaign-workshop\/draft">Open your draft page/);
  expect(saved).toContain(">Update draft</button>");
  expect(saved).not.toContain("Build my draft page");
  expect(saved).toContain('id="feature-choice-workshop-feature-1" type="checkbox" data-saved=""');
  expect(saved).not.toContain("Unlisted feature");
  const returning = render({ selected: ["workshop-feature-0"] });
  expect(returning).toContain("Your draft page covers: Shared page patterns.");
  expect(returning).not.toContain("Draft saved.");
  const fresh = render({ selected: [] });
  expect(fresh).toContain(">Build my draft page</button>");
  expect(fresh).not.toContain("feature-choice__open");
  expect(render({ selected: [], saved: true })).toContain("Nothing saved. Pick at least one feature");
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
