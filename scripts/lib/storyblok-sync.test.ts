import { describe, expect, it, vi } from "vitest";
import { syncSpace } from "./storyblok-sync.mjs";

const story = { name: "Home", slug: "home", content: { component: "page", title: "Seed" } };
const component = { name: "page", schema: {} };
const log = () => {};

function transport(remote: (typeof story & { uuid?: string }) | null = null) {
  return vi.fn(async (method: string, path: string, body?: unknown): Promise<Record<string, unknown>> => {
    if (method !== "GET") return { body };
    if (path.startsWith("/stories?")) return { stories: remote ? [{ ...remote, id: 42 }] : [] };
    if (path === "/stories/42") return { story: { ...remote, id: 42 } };
    if (path === "/components") return { components: [] };
    throw new Error(`Unexpected request: ${method} ${path}`);
  });
}

describe("Storyblok seed safeguards", () => {
  it("remaps references to UUIDs assigned by Storyblok before publishing a new page", async () => {
    const seedUuid = "00000000-0000-4000-8000-000000000001";
    const assignedUuid = "98471c0a-b9b4-4cde-ad50-bc30e8fac53e";
    const note = { name: "Note", slug: "note", uuid: seedUuid, content: { component: "learning_note", title: "Note" } };
    const page = { ...story, content: { component: "page", body: [{ component: "related_content", stories: [seedUuid] }] } };
    const records = new Map<string, Record<string, unknown>>();
    const request = vi.fn(async (method: string, route: string, body?: { story: Record<string, unknown>; publish: number }): Promise<Record<string, unknown>> => {
      if (method === "GET" && route.startsWith("/stories?")) return { stories: [...records.values()].filter((s) => s.slug === new URLSearchParams(route.split("?")[1]).get("with_slug")) };
      if (method === "GET" && route.startsWith("/stories/")) return { story: [...records.values()].find((s) => String(s.id) === route.split("/").pop()) };
      if (method === "POST" && route === "/stories") {
        const saved = { ...body!.story, id: records.size + 1, uuid: body!.story.slug === "note" ? assignedUuid : "page-uuid" };
        records.set(String(body!.story.slug), saved);
        return { story: saved };
      }
      if (method === "PUT") return { story: body!.story };
      throw new Error(`Unexpected ${method} ${route}`);
    });
    await syncSpace({ request, components: [], stories: [page, note], bootstrap: true, publish: true, log });
    const pageWrite = request.mock.calls.find(([method, route, body]) => method === "POST" && route === "/stories" && body?.story.slug === "home")!;
    expect(pageWrite[2]?.story.content).toEqual({ component: "page", body: [{ component: "related_content", stories: [assignedUuid] }] });
    const noteCreate = request.mock.calls.find(([method, route, body]) => method === "POST" && route === "/stories" && body?.story.slug === "note")!;
    expect(noteCreate[2]?.publish).toBe(0);
    const notePublish = request.mock.calls.findIndex(([method, , body]) => method === "PUT" && body?.story.slug === "note" && body.publish === 1);
    expect(notePublish).toBeGreaterThan(-1);
    expect(notePublish).toBeLessThan(request.mock.calls.indexOf(pageWrite));
  });

  it("requires an explicit subset or bootstrap before making requests", async () => {
    const request = transport();
    await expect(syncSpace({ request, components: [component], stories: [story], log })).rejects.toThrow("Select");
    expect(request).not.toHaveBeenCalled();
  });

  it("defaults a selected new story to draft and does not write unrelated components", async () => {
    const request = transport();
    await syncSpace({ request, components: [component], stories: [story], onlyStories: ["home"], log });
    expect(request).toHaveBeenCalledWith("POST", "/stories", { story, publish: 0 });
    expect(request.mock.calls.some(([, path]) => path.startsWith("/components"))).toBe(false);
  });

  it("publishes only when explicitly requested", async () => {
    const request = transport();
    await syncSpace({ request, components: [], stories: [story], onlyStories: ["home"], publish: true, log });
    expect(request).toHaveBeenCalledWith("POST", "/stories", { story, publish: 1 });
  });

  it("rejects unknown selectors before reading or writing", async () => {
    const request = transport();
    await expect(syncSpace({ request, components: [component], stories: [story], onlyStories: ["typo"], log })).rejects.toThrow("Unknown slug");
    expect(request).not.toHaveBeenCalled();
  });

  it("preflights all stories before any component or story mutation", async () => {
    const remote = { ...story, content: { ...story.content, title: "Editor work" } };
    const request = transport(remote);
    await expect(syncSpace({ request, components: [component], stories: [story], bootstrap: true, log })).rejects.toThrow("Existing story differs");
    expect(request.mock.calls.every(([method]) => method === "GET")).toBe(true);
  });

  it("exports a read-only snapshot of current remote content", async () => {
    const request = transport(story);
    const snapshot = await syncSpace({ request, components: [component], stories: [story], snapshot: true, log });
    expect(snapshot).toEqual({ version: 1, stories: { home: story } });
    expect(request.mock.calls.every(([method]) => method === "GET")).toBe(true);
  });

  it("allows an intentional update with a matching reviewed baseline", async () => {
    const remote = { ...story, content: { ...story.content, title: "Editor work" } };
    const request = transport(remote);
    await syncSpace({ request, components: [], stories: [story], onlyStories: ["home"], baseline: { version: 1, stories: { home: remote } }, log });
    expect(request).toHaveBeenCalledWith("PUT", "/stories/42", { story, publish: 0 });
  });

  it("refuses remote drift before any mutation, including schema changes", async () => {
    const remote = { ...story, content: { ...story.content, title: "New editor work" } };
    const request = transport(remote);
    await expect(syncSpace({ request, components: [component], stories: [story], bootstrap: true, baseline: { version: 1, stories: { home: story } }, log })).rejects.toThrow("changed since baseline");
    expect(request.mock.calls.every(([method]) => method === "GET")).toBe(true);
  });

  it("detects a new remote story since a snapshot recorded its absence", async () => {
    const request = transport(story);
    await expect(syncSpace({ request, components: [], stories: [story], onlyStories: ["home"], baseline: { version: 1, stories: { home: null } }, log })).rejects.toThrow("changed since baseline");
    expect(request.mock.calls.every(([method]) => method === "GET")).toBe(true);
  });

  it("does not overwrite identical existing content", async () => {
    const request = transport(story);
    await syncSpace({ request, components: [], stories: [story], bootstrap: true, log });
    expect(request.mock.calls.every(([method]) => method === "GET")).toBe(true);
  });

  it("component-only selection does not fetch or overwrite stories", async () => {
    const request = transport();
    await syncSpace({ request, components: [component], stories: [story], onlyComponents: ["page"], log });
    expect(request).toHaveBeenCalledWith("POST", "/components", { component });
    expect(request.mock.calls.some(([, path]) => path.startsWith("/stories"))).toBe(false);
  });

  it("dry run still detects conflicts without writing", async () => {
    const request = transport({ ...story, name: "Edited" });
    await expect(syncSpace({ request, components: [], stories: [story], bootstrap: true, dryRun: true, log })).rejects.toThrow("Existing story differs");
    expect(request.mock.calls.every(([method]) => method === "GET")).toBe(true);
  });

  it("fails closed if creation does not return the assigned identity", async () => {
    const request = transport();
    const seed = { ...story, uuid: "00000000-0000-4000-8000-000000000001" };
    await expect(syncSpace({ request, components: [], stories: [seed], bootstrap: true, log })).rejects.toThrow("Missing assigned story identity");
    expect(request).toHaveBeenCalledWith("POST", "/stories", { story, publish: 0 });
  });

  it("accepts the existing space identity without rewriting an unchanged story", async () => {
    const request = transport({ ...story, uuid: "assigned-by-storyblok" });
    const seed = { ...story, uuid: "00000000-0000-4000-8000-000000000001" };
    await syncSpace({ request, components: [], stories: [seed], bootstrap: true, log });
    expect(request.mock.calls.every(([method]) => method === "GET")).toBe(true);
  });

  it("resolves an unselected reference target without writing it", async () => {
    const seedUuid = "00000000-0000-4000-8000-000000000001";
    const note = { ...story, slug: "note", uuid: seedUuid };
    const page = { ...story, content: { component: "page", body: [{ component: "related_content", stories: [seedUuid] }], caption: seedUuid } };
    const request = vi.fn(async (method: string, route: string, body?: unknown): Promise<Record<string, unknown>> => {
      if (method !== "GET") return { body };
      const slug = new URLSearchParams(route.split("?")[1]).get("with_slug");
      return { stories: slug === "note" ? [{ id: 20, slug: "note", uuid: "assigned-note-uuid" }] : [] };
    });
    await syncSpace({ request, components: [], stories: [page, note], onlyStories: ["home"], log });
    expect(request).toHaveBeenCalledWith("POST", "/stories", { story: { ...page, content: { ...page.content, body: [{ component: "related_content", stories: ["assigned-note-uuid"] }] } }, publish: 0 });
    expect(request.mock.calls.filter(([method]) => method !== "GET")).toHaveLength(1);
  });

  it("paginates story matches and ignores prefix matches", async () => {
    const request = vi.fn(async (method: string, path: string): Promise<Record<string, unknown>> => {
      if (path.endsWith("page=1")) return { stories: Array.from({ length: 100 }, (_, id) => ({ id, slug: `home-${id}` })) };
      if (path.endsWith("page=2")) return { stories: [{ ...story, id: 42 }] };
      if (path === "/stories/42") return { story: { ...story, id: 42 } };
      throw new Error(`Unexpected request: ${method} ${path}`);
    });
    const snapshot = await syncSpace({ request, components: [], stories: [story], snapshot: true, log });
    expect(snapshot?.stories).toEqual({ home: story });
    expect(request).toHaveBeenCalledTimes(3);
  });

  it("preserves remote UUIDs in snapshots", async () => {
    const remote = { ...story, uuid: "remote-uuid" };
    const request = transport(remote);
    const snapshot = await syncSpace({ request, components: [], stories: [story], snapshot: true, log });
    expect(snapshot?.stories).toEqual({ home: remote });
  });

  it("does not replace content edited while schemas were being written", async () => {
    const remote = { ...story, content: { ...story.content, title: "Before sync" } };
    let schemaWritten = false;
    const base = transport(remote);
    const request = vi.fn(async (method: string, path: string, body?: unknown) => {
      if (method === "POST" && path === "/components") schemaWritten = true;
      if (method === "GET" && path === "/stories/42" && schemaWritten) {
        return { story: { ...remote, content: { ...remote.content, title: "Concurrent editor" } } };
      }
      return base(method, path, body);
    });
    await expect(syncSpace({ request, components: [component], stories: [story], bootstrap: true, baseline: { version: 1, stories: { home: remote } }, log })).rejects.toThrow("changed during sync");
    expect(request.mock.calls.some(([method, path]) => method === "PUT" && path.startsWith("/stories/"))).toBe(false);
  });

  it("checks remote identity again before an existing story write", async () => {
    const remote = { ...story, uuid: "original" };
    let reads = 0;
    const base = transport(remote);
    const request = vi.fn(async (method: string, path: string, body?: unknown) => {
      if (method === "GET" && path === "/stories/42" && ++reads > 1) return { story: { ...remote, uuid: "replaced" } };
      return base(method, path, body);
    });
    await expect(syncSpace({ request, components: [], stories: [story], bootstrap: true, publish: true, log })).rejects.toThrow("changed during sync");
    expect(request.mock.calls.every(([method]) => method === "GET")).toBe(true);
  });

  it("checks absence again before creating a story", async () => {
    let reads = 0;
    const request = vi.fn(async (method: string, path: string) => {
      if (method === "GET" && path.startsWith("/stories?")) return { stories: ++reads > 1 ? [{ ...story, id: 42 }] : [] };
      throw new Error(`Unexpected request: ${method} ${path}`);
    });
    await expect(syncSpace({ request, components: [], stories: [story], bootstrap: true, log })).rejects.toThrow("created during sync");
    expect(request.mock.calls.every(([method]) => method === "GET")).toBe(true);
  });
});
