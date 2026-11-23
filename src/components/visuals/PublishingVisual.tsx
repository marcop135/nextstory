"use client";

import { useEffect, useRef } from "react";
import InteractiveProof from "./InteractiveProof";

type Props = { labels: string[]; caption: string; resource?: string; sketches?: string[][] };

const resourcePaths: Record<string, string> = {
  "cache-invalidation": "M36 16A15 15 0 1 0 39 29 M36 7v10H26 M24 14v10l7 4",
  privacy: "m24 5 16 6v12c0 10-8 16-16 20-8-4-16-10-16-20V11Z m-8 18 6 6 11-13",
};

export default function PublishingVisual({ labels, caption, resource = "home", sketches }: Props) {
  const figure = useRef<HTMLElement>(null);
  const interactive = ["home", "how-it-works", "blocks", "campaign-workshop"].includes(resource);

  useEffect(() => {
    const element = figure.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      element.dataset.motion = "static";
      return;
    }
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let completed = false;
    const update = () => {
      element.dataset.motion = motion.matches || completed
        ? "static"
        : visible && !document.hidden ? "running" : "paused";
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      update();
    }, { threshold: [0, 0.25] });
    const finish = (event: AnimationEvent) => {
      if (event.animationName !== "publishing-progress") return;
      completed = true;
      update();
    };
    update();
    observer.observe(element);
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    element.addEventListener("animationend", finish);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      element.removeEventListener("animationend", finish);
    };
  }, []);

  return (
    <figure ref={figure} className="publishing-visual" data-motion="pending" data-composition={resource}>
      {!interactive ? <div className="publishing-visual__bar" aria-hidden="true">
        <span>{resource === "home" ? "storyblok" : "nextstory"} / {resource}</span>
        <span>{resource === "privacy" || resource === "for-agents" ? "EN" : "EN + DE"}</span>
      </div> : null}
      <div className="publishing-visual__diagram">
      {resource === "privacy" ? <svg className="publishing-visual__shield" viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true"><path d="M200 12 384 60v128c0 106-94 164-184 200C110 352 16 294 16 188V60Z" /></svg> : null}
      {interactive ? <InteractiveProof resource={resource} /> : <ol className="publishing-visual__flow" aria-label={caption}>
        {labels.map((label, index) => (
          <li key={index} className={`publishing-visual__stage publishing-visual__stage--${index}`}>
            <span className="publishing-visual__number" aria-hidden="true">0{index + 1}</span>
            <span className="publishing-visual__label">{label}</span>
            <div className="publishing-visual__sketch" aria-hidden="true">
              {sketches ? <>
                {resourcePaths[resource] ? <svg viewBox="0 0 48 48"><path d={resourcePaths[resource]} /></svg> : null}
                {sketches[index]?.map((line) => <code key={line}>{line}</code>)}
              </> : <>
                {index === 0 ? <><code>hero</code><code>page.body</code></> : null}
                {index === 1 ? <><i /><i /><i /></> : null}
                {index === 2 ? <svg viewBox="0 0 48 48"><path d="m12 24 8 8 16-16" /></svg> : null}
                {index === 3 ? <><span className="publishing-visual__page">EN<i /><i /></span><span className="publishing-visual__page">DE<i /><i /></span></> : null}
              </>}
            </div>
          </li>
        ))}
      </ol>}
      </div>
      <div className="publishing-visual__track" aria-hidden="true"><span /></div>
      <figcaption className={interactive ? "visually-hidden" : undefined}>{caption}</figcaption>
    </figure>
  );
}
