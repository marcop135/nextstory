import { NextRequest } from "next/server";
import { expect, it, vi } from "vitest";

import { GET } from "./route";

const { disable } = vi.hoisted(() => ({ disable: vi.fn() }));
vi.mock("next/headers", () => ({ draftMode: async () => ({ disable }) }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`); } }));

it.each(["//example.com", "/\\example.com", "https://example.com", "javascript:alert(1)"])("never redirects to an external target: %s", async (next) => {
  const query = new URLSearchParams({ next });
  await expect(GET(new NextRequest(`https://northline.test/api/exit-preview?${query}`))).rejects.toEqual(new Error("redirect:/"));
  expect(disable).toHaveBeenCalledOnce();
});

it("preserves a local return path", async () => {
  await expect(GET(new NextRequest("https://northline.test/api/exit-preview?next=/de/blocks"))).rejects.toThrow("redirect:/de/blocks");
});
