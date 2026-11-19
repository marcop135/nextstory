import CampaignDraftPage, { campaignDraftMetadata } from "@/components/CampaignDraftPage";

export const metadata = campaignDraftMetadata("en");

export default function Page() {
  return <CampaignDraftPage locale="en" />;
}
