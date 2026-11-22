import CampaignDraftPage, { campaignDraftMetadata } from "@/components/campaign/CampaignDraftPage";

export const metadata = campaignDraftMetadata("de");

export default function Page() {
  return <CampaignDraftPage locale="de" />;
}
