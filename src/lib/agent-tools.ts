import { markdownPathForPage } from "@/lib/agent-paths";

type Tool = {
  name: string;
  description: string;
  inputSchema: { type: "object"; properties: Record<string, never>; additionalProperties: false };
  annotations: { readOnlyHint: true; untrustedContentHint: true };
  execute: (input: unknown, context?: { signal?: AbortSignal }) => Promise<unknown>;
};
export type ModelContext = { registerTool: (tool: Tool, options: { signal: AbortSignal }) => Promise<void> };
const MAX_BYTES = 100_000;

async function readResource(path: string, type: string, fetcher: typeof fetch, signal?: AbortSignal) {
  const response = await fetcher(path, { signal, credentials: "omit", redirect: "error", headers: { Accept: type } });
  if (!response.ok || !response.headers.get("content-type")?.startsWith(type)) throw new Error("Public resource unavailable");
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let bytes = 0;
  let result = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) throw new Error("Public resource exceeds 100000 bytes");
      result += decoder.decode(value, { stream: true });
    }
    return result + decoder.decode();
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
}

export function registerAgentTools(context: ModelContext, pathname: () => string, fetcher: typeof fetch = fetch) {
  const controller = new AbortController();
  const tools: Tool[] = [
    {
      name: "get_page_markdown",
      description: "Read the current page's published Markdown, canonical URL, and content source. Editor drafts are never returned.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async (_input, execution) => {
        const path = markdownPathForPage(pathname());
        if (!path) return { available: false, reason: "No Markdown resource for this route." };
        return { url: path, representation: "published", markdown: await readResource(path, "text/markdown", fetcher, execution?.signal) };
      },
    },
    {
      name: "list_blocks",
      description: "List reusable page blocks, their translatable fields, and schema/component source paths.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async (_input, execution) => JSON.parse(await readResource("/content/blocks.json", "application/json", fetcher, execution?.signal)),
    },
    {
      name: "get_campaign_brief",
      description: "List each campaign on published pages with its campaign_id, page URL, audience, conversion goal, and measurement plan. Editor drafts are never returned.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: async (_input, execution) => JSON.parse(await readResource("/content/campaigns.json", "application/json", fetcher, execution?.signal)),
    },
  ];
  const ready = (async () => {
    try {
      for (const tool of tools) {
        if (controller.signal.aborted) return;
        await context.registerTool(tool, { signal: controller.signal });
      }
    } catch (error) {
      controller.abort();
      throw error;
    }
  })();
  return { ready, dispose: () => controller.abort() };
}
