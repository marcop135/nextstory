"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { WidgetCopy } from "@/lib/messages";

const pages = ["home", "how-it-works", "blocks", "campaign-workshop", "cache-invalidation", "content-relationships"];
type Run = { duration: number; headers: Record<string, string> };
export default function CacheInspector({ copy, locale }: { copy: WidgetCopy; locale: Locale }) {
  const [selected, setSelected] = useState("home");
  const [runs, setRuns] = useState<Record<string, Run[]>>({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const pending = useRef(false);
  async function request() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setStatus(copy.loading);
    const start = performance.now();
    try {
      const slug = selected === "home" ? "index" : selected;
      const response = await fetch(`/content/${locale === "de" ? "de/" : ""}${slug}.md`, {
        method: "HEAD", credentials: "omit", cache: "no-store", signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error();
      const run = { duration: Math.round(performance.now() - start), headers: Object.fromEntries(response.headers) };
      setRuns((previous) => ({ ...previous, [selected]: [...(previous[selected] ?? []), run].slice(-5) }));
      setStatus(`${selected}: ${copy.done} ${run.duration} ms`);
    } catch { setStatus(copy.failed); }
    finally { pending.current = false; setBusy(false); }
  }
  const history = runs[selected] ?? [];
  const latest = history.at(-1);
  const headers = latest?.headers ?? {};
  const facts = [
    [copy.cached, copy.unavailable], [copy.cleared, copy.unavailable],
    [copy.tag, headers["x-story-cache-tag"] ?? copy.empty],
    [copy.window, headers["x-content-source"] === "mock" ? copy.seedWindow : headers["x-story-revalidate"] ? `${headers["x-story-revalidate"]} ${copy.seconds}` : copy.empty],
    [copy.source, headers["x-content-source"] ?? copy.empty],
  ];
  return <>
    <p>{copy.cacheNote}</p>
    <div className="app-widget__choices" role="group" aria-label={copy.page}>
      {pages.map((page) => <button key={page} aria-pressed={selected === page} aria-disabled={busy}
        onClick={() => { if (!pending.current) { setSelected(page); setStatus(page); } }}>{page}</button>)}
    </div>
    <dl className="app-widget__facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <button className="btn btn--secondary" aria-disabled={busy} onClick={request}>{busy ? copy.loading : copy.request}</button>
    <p className="visually-hidden" role="status">{status}</p>
    {status === copy.failed ? <p>{status}</p> : null}
    {history.length ? <ol className="app-widget__timings">{history.map((run, index) => <li key={index}>
      <meter aria-hidden="true" min={0} max={Math.max(1, ...history.map((item) => item.duration))} value={run.duration} />
      <span>{index + 1}: {run.duration} ms</span>
    </li>)}</ol> : <p>{copy.noRuns}</p>}
    {latest ? <details className="app-widget__headers"><summary>{copy.headers}</summary><dl className="app-widget__facts">
      {Object.entries(headers).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
    </dl></details> : null}
  </>;
}
