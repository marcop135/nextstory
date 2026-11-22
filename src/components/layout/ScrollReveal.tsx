"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Blocks that rise in as they scroll into view. The hero animates on its own, in CSS; text pages stay still. */
const TARGETS = [
  "section:not(.hero) h2",
  ".section-intro",
  ".steps__intro",
  ".feature",
  ".step",
  ".code-example",
  ".image-text__copy",
  ".accordion__item",
  ".pull-quote",
  ".cta-band h2",
  ".cta-band p",
  "[data-widget]",
].join(", ");

/**
 * Holds blocks below the fold, then plays each in as it enters the viewport. It uses the Web Animations
 * API rather than attributes, so React hydration never sees a changed DOM. Blocks already on screen are
 * never held, so nothing flashes; without script or under reduced motion, nothing is held at all.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  // The hero intro plays on the first load only. Once it has run, later client navigations show the
  // hero at once instead of fading in from blank, which reads as a flicker between pages.
  useEffect(() => {
    const done = window.setTimeout(() => {
      document.documentElement.dataset.introPlayed = "";
    }, 2000);
    return () => window.clearTimeout(done);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || typeof Element.prototype.animate !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fold = window.innerHeight;
    const animations = new Map<Element, Animation>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          animations.get(entry.target)?.play();
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    for (const element of document.querySelectorAll<HTMLElement>(`main :is(${TARGETS})`)) {
      if (element.getBoundingClientRect().top <= fold || element.closest(".prose")) continue;
      const index = element.parentElement ? [...element.parentElement.children].indexOf(element) : 0;
      const animation = element.animate(
        [
          { opacity: 0, translate: "0 1.25rem" },
          { opacity: 1, translate: "0 0" },
        ],
        { duration: 700, delay: Math.min(index, 5) * 70, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)", fill: "backwards" },
      );
      animation.pause();
      animations.set(element, animation);
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      for (const animation of animations.values()) animation.cancel();
    };
  }, [pathname]);

  return null;
}
