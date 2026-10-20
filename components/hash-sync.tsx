"use client";

import { useEffect } from "react";

// Keeps the URL hash on the section being read, so the address bar is always a shareable link.
// Replaces the history entry rather than pushing one, so Back still leaves the page.
export function HashSync({ ids }: { ids: string[] }) {
  useEffect(() => {
    let frame = 0;
    const sync = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      const hash = current ? `#${current}` : "";
      if (hash === window.location.hash) return;
      const { pathname, search } = window.location;
      window.history.replaceState(window.history.state, "", pathname + search + hash);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ids]);

  return null;
}
