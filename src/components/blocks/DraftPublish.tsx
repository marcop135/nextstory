"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Arrow from "@/components/ui/Arrow";
import type { WidgetCopy } from "@/lib/messages";

const initial = ["hero", "features", "action"] as const;
type Block = (typeof initial)[number];
export default function DraftPublish({ copy }: { copy: WidgetCopy }) {
  const [draft, setDraft] = useState<Block[]>([...initial]);
  const [published, setPublished] = useState<Block[]>([...initial]);
  const [status, setStatus] = useState("");
  const [revision, setRevision] = useState(0);
  const order = useRef<HTMLDivElement>(null);
  const positions = useRef(new Map<string, number>());
  const dirty = draft.some((block, index) => block !== published[index]);
  useLayoutEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      order.current?.querySelectorAll<HTMLElement>("[data-block]").forEach((row) => {
        const before = positions.current.get(`${row.dataset.view}-${row.dataset.block}`);
        if (before === undefined) return;
        row.getAnimations().forEach((animation) => animation.cancel());
        const offset = before - row.getBoundingClientRect().top;
        if (offset) row.animate([{ transform: `translateY(${offset}px)` }, { transform: "translateY(0)" }], { duration: 260, easing: "ease-out" });
      });
    }
    positions.current.clear();
  }, [draft]);
  function move(index: number, step: number) {
    const target = index + step;
    if (target < 0 || target >= draft.length) return;
    order.current?.querySelectorAll<HTMLElement>("[data-block]").forEach((row) => positions.current.set(`${row.dataset.view}-${row.dataset.block}`, row.getBoundingClientRect().top));
    const next = [...draft];
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next);
    setStatus(`${copy.changed} ${next.map((block) => copy[block]).join(", ")}`);
  }
  return <>
    <p>{copy.reorderHint}</p>
    <div ref={order} className="app-widget__columns draft-playground" data-dirty={dirty}>
      <div><h3>{copy.draft}</h3><ol className="app-widget__order">{draft.map((block, index) =>
        <li key={block} data-block={block} data-view="draft"><span>{copy[block]}</span><div>
          <button aria-label={`${copy.up}: ${copy[block]}`} aria-disabled={index === 0} onClick={() => move(index, -1)}><Arrow name="up" /></button>
          <button aria-label={`${copy.down}: ${copy[block]}`} aria-disabled={index === draft.length - 1} onClick={() => move(index, 1)}><Arrow name="down" /></button>
        </div></li>)}</ol></div>
      <div><h3>{copy.published}</h3>
        <ol className="app-widget__preview" aria-hidden="true">{draft.map((block) => <li key={`${revision}-${block}`} data-block={block} data-view="preview"><b>{copy[block]}</b>
          {block === "hero" ? <><span /><span /></> : block === "features" ? <div className="draft-playground__features"><i /><i /><i /></div> : <div className="draft-playground__cta">{copy.tryAction}</div>}
        </li>)}</ol>
        <ol className="visually-hidden">{draft.map((block) => <li key={block}>{copy[block]}</li>)}</ol>
      </div>
    </div>
    <div className="actions">
      <button className="btn" aria-disabled={!dirty} onClick={() => { if (dirty) { setPublished([...draft]); setRevision((value) => value + 1); setStatus(`${copy.publishedStatus} ${draft.map((block) => copy[block]).join(", ")}`); } }}>{copy.publish}</button>
      <button className="btn btn--secondary" onClick={() => { setDraft([...initial]); setPublished([...initial]); setRevision(0); setStatus(copy.resetStatus); }}>{copy.reset}</button>
      <span className="draft-playground__state">{dirty ? copy.unpublished : copy.inSync}</span>
    </div>
    <p className="draft-playground__note">{copy.simulation}</p>
    <p className="visually-hidden" role="status">{status}</p>
  </>;
}
