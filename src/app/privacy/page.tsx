import type { Metadata } from "next";
import PageVisual from "@/components/PageVisual";
import PageContinue from "@/components/PageContinue";

import { AUTHOR, OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const title = "Privacy notice for nextstory.marcopontili.com";
const description =
  "How nextstory.marcopontili.com processes data: cookieless self-hosted Matomo, Vercel hosting, no cookie banner.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title,
    description,
    url: "/privacy",
    images: [OG_IMAGE],
  },
};

export default function PrivacyPage() {
  return (
    <main id="main" className="wrap prose">
      <h1>Privacy</h1>
      <p className="meta">Last updated: 2026-10-15</p>
      <p>
        This notice covers the demo site at {SITE_URL.replace("https://", "")}.
        The source code is public; running it yourself is outside this notice.
      </p>

      <PageContinue />
      <PageVisual />
      <h2 id="page-content" tabIndex={-1}>Controller</h2>
      <p>
        <a href="https://marcopontili.com">{AUTHOR.name}</a>
        <br />
        Contact: <a href="https://marcopontili.com/contact">marcopontili.com/contact</a>
      </p>

      <h2>What is processed</h2>
      <h3>Analytics: self-hosted Matomo</h3>
      <p>
        This site uses a self-hosted, cookieless installation of Matomo, run
        by the controller. No cookies are set and nothing is stored on your
        device. IP addresses are anonymised. The browser&apos;s Do Not Track
        signal is honoured: when it is on, no page view is recorded.
      </p>
      <p>
        When an AI assistant fetches a page on a user&apos;s behalf (for
        example ChatGPT-User or Claude-User), the server records that request
        in Matomo with its URL and user agent. No browser data is involved.
      </p>
      <p>
        Data processed: anonymised IP address, pages visited, referrer, browser
        and device type, and link clicks. Place of processing: European Union
        (the owner&apos;s Matomo server, hosted by Netsons S.r.l., Italy).
      </p>
      <h3>Hosting: Vercel</h3>
      <p>
        The site is hosted by Vercel Inc. (United States), acting as processor.
        Vercel processes request data such as IP address, user agent, and
        timestamps to deliver and secure the site. Transfers to the United
        States rely on Vercel&apos;s Data Processing Addendum, which
        incorporates the EU Standard Contractual Clauses.
      </p>
      <h3>Content and fonts</h3>
      <p>
        Page content is loaded from Storyblok on the server; your browser does
        not contact Storyblok on public pages. Fonts are served from this
        site, with no requests to Google.
      </p>

      <h2>Purposes and legal basis</h2>
      <p>
        Hosting data is processed to operate and secure the site. Analytics
        data is processed for aggregate, privacy-friendly traffic measurement.
        Both rely on legitimate interests under Art. 6(1)(f) GDPR. No marketing
        profiles are built and no data is sold or shared for advertising.
      </p>

      <h2>Cookies</h2>
      <p>
        Public pages set no cookies. Editors who open an authenticated preview
        from Storyblok receive a strictly necessary draft-mode cookie. No
        consent banner is shown because none is required for this behaviour.
      </p>

      <h2>Retention</h2>
      <p>
        Data is kept only as long as the purposes above require. Analytics
        reports hold aggregate data only.
      </p>

      <h2>Your rights</h2>
      <p>
        You may have the right of access, rectification, erasure, restriction,
        objection, and portability. Use the contact page above. You may lodge a complaint with the data protection authority where you live or work. The same rights and the same contact route apply wherever you are in the world.
      </p>
    </main>
  );
}
