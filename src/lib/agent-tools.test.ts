import { expect, it, vi } from "vitest";
import { registerAgentTools, type ModelContext } from "@/lib/agent-tools";

it("resolves the current page at execution time and cleans up registrations", async () => {
  let current = "/";
  const registerTool = vi.fn<ModelContext["registerTool"]>().mockResolvedValue(undefined);
  const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => new Response("# Published", { headers: { "Content-Type": "text/markdown" } }));
  const registration = registerAgentTools({ registerTool }, () => current, fetcher);
  await registration.ready;
  const tool = registerTool.mock.calls[0][0];
  const signal = new AbortController().signal;
  await tool.execute({}, { signal });
  current = "/de/blocks";
  await tool.execute({}, { signal });
  expect(fetcher.mock.calls.map(([url]) => url)).toEqual(["/content/index.md", "/content/de/blocks.md"]);
  expect(fetcher.mock.calls[1][1]).toMatchObject({ signal, credentials: "omit", redirect: "error" });
  current = "/api/preview";
  expect(await tool.execute({})).toMatchObject({ available: false });
  expect(fetcher).toHaveBeenCalledTimes(2);
  registration.dispose();
  expect(registerTool.mock.calls.every(([, options]) => options.signal.aborted)).toBe(true);
});

it("cleans up a partially failed registration and stops registering after unmount", async () => {
  const registerTool = vi.fn<ModelContext["registerTool"]>().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("duplicate tool"));
  const registration = registerAgentTools({ registerTool }, () => "/");
  await expect(registration.ready).rejects.toThrow("duplicate tool");
  expect(registerTool.mock.calls[0][1].signal.aborted).toBe(true);
  const slow = vi.fn<ModelContext["registerTool"]>().mockResolvedValue(undefined);
  const remount = registerAgentTools({ registerTool: slow }, () => "/");
  remount.dispose();
  await remount.ready;
  expect(slow).toHaveBeenCalledTimes(1);
});

it("reads published campaign briefs from the public JSON resource", async () => {
  const registerTool = vi.fn<ModelContext["registerTool"]>().mockResolvedValue(undefined);
  const campaigns = { campaigns: [{ campaign_id: "publishing-workshop", locale: "en", page_url: "https://nextstory.test/campaign-workshop", audience: "a", goal: "g", measure: "m" }] };
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(campaigns));
  const registration = registerAgentTools({ registerTool }, () => "/", fetcher);
  await registration.ready;
  const tool = registerTool.mock.calls.map(([t]) => t).find((t) => t.name === "get_campaign_brief")!;
  expect(tool.annotations.readOnlyHint).toBe(true);
  expect(await tool.execute({})).toEqual(campaigns);
  expect(fetcher).toHaveBeenCalledWith("/content/campaigns.json", expect.objectContaining({ credentials: "omit", redirect: "error" }));
  registration.dispose();
});

it("rejects excessive or incorrectly typed output", async () => {
  const registerTool = vi.fn<ModelContext["registerTool"]>().mockResolvedValue(undefined);
  const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response("x".repeat(100_001), { headers: { "Content-Type": "text/markdown" } })).mockResolvedValueOnce(new Response("<html>", { headers: { "Content-Type": "text/html" } }));
  const registration = registerAgentTools({ registerTool }, () => "/", fetcher);
  await registration.ready;
  await expect(registerTool.mock.calls[0][0].execute({})).rejects.toThrow("100000 bytes");
  await expect(registerTool.mock.calls[0][0].execute({})).rejects.toThrow("unavailable");
  registration.dispose();
});
