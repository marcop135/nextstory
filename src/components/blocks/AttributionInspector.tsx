"use client";

import { useRef, useState } from "react";
import type { WidgetCopy } from "@/lib/messages";

const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
export default function AttributionInspector({ copy }: { copy: WidgetCopy }) {
  const [values, setValues] = useState<Record<string, string>>();
  const [status, setStatus] = useState("");
  const refreshCount = useRef(0);
  function refresh() {
    const params = new URLSearchParams(window.location.search);
    setValues({ page_uri: window.location.href, page_name: document.title, referrer: document.referrer,
      ...Object.fromEntries(keys.map((key) => [key, params.get(key) ?? ""])) });
    setStatus(`${copy.refreshed} ${++refreshCount.current}`);
  }
  return <>
    <p>{copy.attributionNote}</p>
    <button className="btn btn--secondary" onClick={refresh}>{copy.refresh}</button>
    <p className="visually-hidden" role="status">{status}</p>
    {values ? <dl className="app-widget__facts">{Object.entries(values).map(([key, value]) =>
      <div key={key}><dt><code>{key}</code></dt><dd>{value || copy.empty}</dd></div>)}</dl> : null}
  </>;
}
