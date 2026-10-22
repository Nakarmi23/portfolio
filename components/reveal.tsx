"use client";

import { useEffect } from "react";

// Parts marked data-reveal rise in once as they enter, staggered within their section.
// Content stays visible without script or under reduced motion.
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const parts = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const seen = new Map<Element, number>();
    for (const el of parts) {
      const group = el.closest("section, article, header, main") ?? document.body;
      const i = seen.get(group) ?? 0;
      seen.set(group, i + 1);
      el.style.setProperty("--reveal-delay", `${Math.min(i, 6) * 75}ms`);
    }
    root.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    // What's already on the first screen rises in on load, even inside the bottom margin the observer leaves.
    const first = parts.filter((el) => el.getBoundingClientRect().top < window.innerHeight);
    requestAnimationFrame(() => first.forEach((el) => el.classList.add("revealed")));
    parts.filter((el) => !first.includes(el)).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
