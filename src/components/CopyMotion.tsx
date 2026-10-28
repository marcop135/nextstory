"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function CopyMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main || typeof IntersectionObserver === "undefined") return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const selector = "h1, h2, h3, p, li, pre, blockquote, table";
    const intro = main.querySelector(".hero") || main;
    const illustration = intro.querySelector(".publishing-visual");
    const targets = Array.from(intro.querySelectorAll<HTMLElement>(selector)).filter((element) =>
      !element.closest(".publishing-visual, .block-label") &&
      (!illustration || Boolean(element.compareDocumentPosition(illustration) & Node.DOCUMENT_POSITION_FOLLOWING)) &&
      !element.parentElement?.closest(selector),
    );
    const reveal = (element: HTMLElement, delay = 0) => {
      element.style.setProperty("--copy-delay", `${delay}ms`);
      element.dataset.copyMotion = "visible";
    };
    const observer = new IntersectionObserver((entries) => {
      const entering = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => targets.indexOf(a.target as HTMLElement) - targets.indexOf(b.target as HTMLElement));
      entering.forEach((entry, index) => {
        reveal(entry.target as HTMLElement, Math.min(index * 160, 640));
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    const update = () => {
      observer.disconnect();
      targets.forEach((element) => {
        if (preference.matches) {
          delete element.dataset.copyMotion;
        } else if (element.dataset.copyMotion !== "visible") {
          element.dataset.copyMotion = "pending";
          observer.observe(element);
        }
      });
    };
    const focus = (event: FocusEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-copy-motion]");
      if (target) {
        reveal(target);
        observer.unobserve(target);
      }
    };
    update();
    preference.addEventListener("change", update);
    main.addEventListener("focusin", focus);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", update);
      main.removeEventListener("focusin", focus);
      targets.forEach((element) => {
        delete element.dataset.copyMotion;
        element.style.removeProperty("--copy-delay");
      });
    };
  }, [pathname]);

  return null;
}
