import { describe, expect, it, vi } from "vitest";
import { syncSpace } from "./storyblok-sync.mjs";

const story = { name: "Home", slug: "home", content: { component: "page", title: "Seed" } };
const component = { name: "page", schema: {} };
const log = () => {};

function transport(remote: typeof story | null = null) {
  return vi.fn(async (method: string, path: string, body?: unknown): Promise<Record<string, unknown>> => {
    if (method !== "GET") return { body };
    if (path.startsWith("/stories?")) return { stories: remote ? [{ ...remote, id: 42 }] : [] };
    if (path === "/stories/42") return { story: { ...remote, id: 42 } };
    if (path === "/components") return { components: [] };
    throw new Error(`Unexpected request: ${method} ${path}`);
  });
}

describe("Storyblok seed safeguards", () => {
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

  it("passes a stable relationship UUID only when creating a story", async () => {
    const request = transport();
    const seed = { ...story, uuid: "00000000-0000-4000-8000-000000000001" };
    await syncSpace({ request, components: [], stories: [seed], bootstrap: true, log });
    expect(request).toHaveBeenCalledWith("POST", "/stories", { story: seed, publish: 0 });
  });

  it("rejects an existing story with a mismatched relationship UUID", async () => {
    const request = transport(story);
    const seed = { ...story, uuid: "00000000-0000-4000-8000-000000000001" };
    await expect(syncSpace({ request, components: [component], stories: [seed], bootstrap: true, log })).rejects.toThrow("UUID differs");
    expect(request.mock.calls.every(([method]) => method === "GET")).toBe(true);
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
