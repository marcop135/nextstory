import { publishedCampaigns } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    return Response.json({ campaigns: await publishedCampaigns() }, { headers });
  } catch {
    return Response.json({ error: "Content temporarily unavailable" }, { status: 503, headers });
  }
}
