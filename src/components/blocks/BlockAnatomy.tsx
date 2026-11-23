"use client";

import { useRef, useState } from "react";
import type { WidgetCopy } from "@/lib/messages";

type Example = { uid: string; component: string; fields: Record<string, unknown> };
type Catalog = {
  source: string;
  blocks: { name: string; fields: { name: string; required?: boolean; translatable: boolean }[] }[];
  examples: { en: Example[]; de: Example[] };
};
export default function BlockAnatomy({ copy }: { copy: WidgetCopy }) {
  const [catalog, setCatalog] = useState<Catalog>();
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const pending = useRef(false);
  async function inspect() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setStatus(copy.loading);
    try {
      const response = await fetch("/content/blocks.json?examples=blocks", { credentials: "omit", signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error();
      const result: Catalog = await response.json();
      setCatalog(result);
      setSelected(result.examples.en[0]?.uid ?? "");
      setStatus(copy.ready);
    } catch { setStatus(copy.failed); }
    finally { pending.current = false; setBusy(false); }
  }
  const example = catalog?.examples.en.find((item) => item.uid === selected);
  const german = catalog?.examples.de.find((item) => item.uid === selected);
  const fields = catalog?.blocks.find((block) => block.name === example?.component)?.fields ?? [];
  const value = (item: unknown) => item === null || item === undefined || item === "" ? copy.absent : typeof item === "string" ? item : JSON.stringify(item, null, 2);
  return <>
    <button className="btn btn--secondary" onClick={inspect} aria-disabled={busy}>{busy ? copy.loading : copy.inspect}</button>
    <p className="visually-hidden" role="status">{status}</p>
    {!catalog && status === copy.failed ? <p>{status}</p> : null}
    {catalog ? <>
      <p>{catalog.source === "mock" ? copy.seed : copy.examples}</p>
      <div className="app-widget__choices" role="group" aria-label={copy.choose}>
        {catalog.examples.en.map((item, index) => <button key={item.uid} aria-pressed={selected === item.uid}
          onClick={() => { setSelected(item.uid); setStatus(`${item.component}: ${index + 1}`); }}>{item.component}</button>)}
      </div>
      <dl className="app-widget__fields">
        {fields.map((field) => <div key={field.name}>
          <dt><code>{field.name}</code> <span>{copy.required}: {field.required ? copy.yes : copy.no} · {copy.translated}: {field.translatable ? copy.yes : copy.no}</span></dt>
          <dd><div><b>EN</b><pre tabIndex={0} role="region" aria-label={`${field.name}: EN`}>{value(example?.fields[field.name])}</pre></div><div><b>DE</b><pre tabIndex={0} role="region" aria-label={`${field.name}: DE`}>{value(german?.fields[field.name])}</pre></div></dd>
        </div>)}
      </dl>
    </> : null}
  </>;
}
