"use client";

import { useState } from "react";
import type { WidgetCopy } from "@/lib/messages";

const initial = ["hero", "features", "action"] as const;
type Block = (typeof initial)[number];
export default function DraftPublish({ copy }: { copy: WidgetCopy }) {
  const [draft, setDraft] = useState<Block[]>([...initial]);
  const [published, setPublished] = useState<Block[]>([...initial]);
  const [status, setStatus] = useState("");
  const dirty = draft.some((block, index) => block !== published[index]);
  function move(index: number, step: number) {
    const target = index + step;
    if (target < 0 || target >= draft.length) return;
    const next = [...draft];
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next);
    setStatus(`${copy.changed} ${next.map((block) => copy[block]).join(", ")}`);
  }
  return <>
    <p>{copy.simulation}</p>
    <div className="app-widget__columns">
      <div><h3>{copy.draft}</h3><ol className="app-widget__order">{draft.map((block, index) =>
        <li key={block}><span>{copy[block]}</span><div>
          <button aria-label={`${copy.up}: ${copy[block]}`} aria-disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
          <button aria-label={`${copy.down}: ${copy[block]}`} aria-disabled={index === draft.length - 1} onClick={() => move(index, 1)}>↓</button>
        </div></li>)}</ol></div>
      <div><h3>{copy.published}</h3>
        <ol className="app-widget__preview" aria-hidden="true">{published.map((block) => <li key={block} data-block={block}><b>{copy[block]}</b><span /><span /></li>)}</ol>
        <ol className="visually-hidden">{published.map((block) => <li key={block}>{copy[block]}</li>)}</ol>
      </div>
    </div>
    <div className="actions">
      <button className="btn" aria-disabled={!dirty} onClick={() => { if (dirty) { setPublished([...draft]); setStatus(`${copy.publishedStatus} ${draft.map((block) => copy[block]).join(", ")}`); } }}>{copy.publish}</button>
      <button className="btn btn--secondary" onClick={() => { setDraft([...initial]); setPublished([...initial]); setStatus(copy.resetStatus); }}>{copy.reset}</button>
    </div>
    <p className="visually-hidden" role="status">{status}</p>
  </>;
}
