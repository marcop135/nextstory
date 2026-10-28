import type { Metadata } from "next";
import PageVisual from "@/components/PageVisual";
import PageContinue from "@/components/PageContinue";

import { OG_IMAGE, REPO_URL, SITE_NAME, SITE_URL } from "@/lib/site";
import { agentResources, agentTasks } from "@/lib/agent-resources";

const title = "For agents";
const description =
  "Read Next Story as Markdown, inspect its block model, and trace examples to source through public HTTP resources and read-only WebMCP tools.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/for-agents", types: { "text/markdown": "/content/for-agents.md" } },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title,
    description,
    url: "/for-agents",
    images: [OG_IMAGE],
  },
};

export default function ForAgentsPage() {
  return (
    <main id="main" className="wrap prose">
      <h1>For agents</h1>
      <p>
        Discovery notes for {SITE_NAME} at {SITE_URL.replace("https://", "")},
        a Next.js App Router demo whose pages come from Storyblok blocks.
      </p>

      <PageContinue />
      <PageVisual />
      <h2 id="page-content" tabIndex={-1}>Reading workflows</h2>
      <ol>
        {agentTasks.map((task) => <li key={task.name}><strong>{task.name}.</strong> {task.instruction}<pre className="agent-request" tabIndex={0} aria-label={task.name}><code>curl {SITE_URL}{task.request}</code></pre></li>)}
      </ol>

      <h2>Surfaces</h2>
      <ul>
        {agentResources.map(({ path, purpose }) => (
          <li key={path}>
            <a href={path}>
              <code>{path}</code>
            </a>
            : {purpose}
          </li>
        ))}
      </ul>

      <h2>Browser tools</h2>
      <p>Supporting browsers expose <code>get_page_markdown</code> for the current published page and <code>list_blocks</code> for the block model. Native WebMCP is feature-detected. Other browsers can use the HTTP resources directly.</p>
      <h2>Access and source</h2>
      <p>Public reading resources require no login or API key and return published content. Storyblok preview and revalidation remain authenticated CMS operations. <a href="/auth.md">Access rules</a>.</p>
      <p>The <a href={REPO_URL}>source repository</a> connects these examples to their implementation. Start with <code>docs/architecture.md</code>.</p>
    </main>
  );
}
