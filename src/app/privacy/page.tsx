import type { Metadata } from "next";

import JsonLd from "@/components/seo/JsonLd";
import { AUTHOR, INDEX_ROBOTS, OG_IMAGE, PRIVACY_UPDATED, SITE_NAME, SITE_URL, pageJsonLd } from "@/lib/site";

const title = "Privacy notice for nextstory.marcopontili.com";
const description =
  "Cookieless self-hosted Matomo, Vercel hosting, and a consent-based HubSpot campaign form. No cookie banner is shown.";
const host = SITE_URL.replace("https://", "");

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  robots: INDEX_ROBOTS,
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
    <main id="main" tabIndex={-1} className="wrap prose">
      <h1>Privacy</h1>
      <p>
        This notice covers the demo site at {host}.
        The source code is public; running it yourself is outside this notice.
      </p>
      <ul>
        <li>Site: {host}</li>
        <li>
          Controller: <a href="https://marcopontili.com">{AUTHOR.name}</a>
        </li>
        <li>
          Contact: <a href="https://marcopontili.com/contact">marcopontili.com/contact</a>
        </li>
      </ul>

      <h2 id="page-content" tabIndex={-1}>What is processed</h2>
      <h3>Analytics: self-hosted Matomo</h3>
      <p>
        This site uses a self-hosted, cookieless installation of Matomo, run
        by the controller. No cookies are set and nothing is stored on your
        device. IP addresses are anonymised. The analytics script loads when
        Do Not Track or Global Privacy Control is on. Neither signal stops
        this measurement. Global Privacy Control is a request not to sell or
        share data for advertising, and this site does not do that.
      </p>
      <p>
        When an AI assistant fetches a page on a user&apos;s behalf (for
        example ChatGPT-User or Claude-User), the server records that request
        in Matomo with its URL and user agent. No browser data is involved.
      </p>
      <p>
        Data processed: anonymised IP address, pages visited, referrer, browser
        and device type, time on page, and anonymous interaction events such as clicks, copies, form and app use, and errors. Typed text, form values and file contents are never recorded. Which interactions count is set in a Matomo Tag Manager container on the same self-hosted server; it stores nothing on your device. Place of processing: European Union
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
      <h3 id="campaign-form">Campaign form: HubSpot and Cloudflare Turnstile</h3>
      <p>
        The interest form on campaign pages sends data only after you tick its
        consent box and submit. Data processed: email address, campaign ID, UTM
        parameters, page address, title, and language, the referring page, and
        the consent text with its time. The site&apos;s server checks the request
        and forwards it to HubSpot, Inc. (United States), acting as processor,
        which stores it as a contact record. No marketing email is sent and no
        HubSpot script or cookie is loaded on this site.
      </p>
      <p>
        To keep automated submissions out, the form uses Cloudflare Turnstile
        from Cloudflare, Inc. (United States), acting as processor. Its script
        loads only after you start using the form; Cloudflare evaluates your IP
        address and browser signals to tell people from bots and returns a
        one-time token that the server verifies. Cloudflare states that
        Turnstile does not use cookies to collect this information.
      </p>
      <p>
        Transfers to the United States rely on the processors&apos; data
        processing agreements, which incorporate the EU Standard Contractual
        Clauses.
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
        Both rely on legitimate interests under Art. 6(1)(f) GDPR. Campaign
        form data is processed to record your registration of interest, based
        on your consent under Art. 6(1)(a) GDPR; you can withdraw it at any
        time through the contact page, without affecting earlier processing.
        The Turnstile check protects the form from abuse, based on legitimate
        interests under Art. 6(1)(f) GDPR. No marketing
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
        reports hold aggregate data only. Campaign form contacts are deleted
        when you withdraw consent or the demo campaign ends.
      </p>

      <h2>Your rights</h2>
      <p>
        You may have the right of access, rectification, erasure, restriction,
        objection, and portability. Use the contact page above. You may lodge a complaint with the data protection authority where you live or work. The same rights and the same contact route apply wherever you are in the world.
      </p>
      <p className="meta">Last updated: {PRIVACY_UPDATED}</p>
      <JsonLd data={pageJsonLd({ path: "/privacy", name: title, description, locale: "en" })} />
    </main>
  );
}
