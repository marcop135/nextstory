import CampaignDraftPage, { campaignDraftMetadata } from "@/components/CampaignDraftPage";

export const metadata = campaignDraftMetadata("de");

export default function Page() {
  return <CampaignDraftPage locale="de" />;
}
