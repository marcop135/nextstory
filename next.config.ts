import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const matomo = "https://mt.marcopontili.com";

/**
 * App Router streams inline RSC payload scripts, so script-src keeps
 * 'unsafe-inline'. 'unsafe-eval' and the HMR socket are dev-only.
 * frame-ancestors lets the Storyblok Visual Editor embed preview pages, and
 * script-src admits its bridge script, which preview pages load from app.storyblok.com.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${matomo} https://app.storyblok.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://a.storyblok.com https://images.unsplash.com ${matomo}`,
  "font-src 'self'",
  `connect-src 'self' ${matomo}${isDev ? " ws: wss:" : ""}`,
  "frame-ancestors 'self' https://app.storyblok.com",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Link",
    value:
      '</sitemap.xml>; rel="sitemap", </llms.txt>; rel="describedby"; type="text/plain", </openapi.json>; rel="service-desc"; type="application/json", </.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  },
];

const nextConfig: NextConfig = {
  // next dev would otherwise write AGENTS.md into the repo root.
  agentRules: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.storyblok.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-*",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/pricing", destination: "/", permanent: true },
      { source: "/de/pricing", destination: "/de", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/matomo.js",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },
};

export default nextConfig;
