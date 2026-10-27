"use client";

import { useEffect, useRef } from "react";

type Props = { labels: string[]; caption: string };

export default function PublishingVisual({ labels, caption }: Props) {
  const figure = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = figure.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
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
    <figure ref={figure} className="publishing-visual" data-motion="static">
      <div className="publishing-visual__bar" aria-hidden="true">
        <span>storyblok / home</span><span>EN + DE</span>
      </div>
      <ol className="publishing-visual__flow" aria-label={caption}>
        {labels.map((label, index) => (
          <li key={index} className={`publishing-visual__stage publishing-visual__stage--${index}`}>
            <span className="publishing-visual__number" aria-hidden="true">0{index + 1}</span>
            <span className="publishing-visual__label">{label}</span>
            <div className="publishing-visual__sketch" aria-hidden="true">
              {index === 0 ? <><code>hero</code><code>comparison_table</code><code>cta_band</code></> : null}
              {index === 1 ? <><i /><i /><i /></> : null}
              {index === 2 ? <svg viewBox="0 0 48 48"><path d="m12 24 8 8 16-16" /></svg> : null}
              {index === 3 ? <><span className="publishing-visual__page">EN<i /><i /></span><span className="publishing-visual__page">DE<i /><i /></span></> : null}
            </div>
          </li>
        ))}
      </ol>
      <div className="publishing-visual__track" aria-hidden="true"><span /></div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
