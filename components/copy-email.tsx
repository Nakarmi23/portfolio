"use client";

import { useEffect, useState } from "react";

// The visible address copies itself, so visitors without a mail app (webmail, work laptops) can still reach out.
// The "Start a project" button beside it keeps the mailto path.
// If the clipboard is unavailable, it falls back to opening the mail app.
export function CopyEmail({ email, label, className = "" }: { email: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button type="button" onClick={copy} className={`group inline-flex items-baseline gap-3 text-left ${className}`}>
      <span className="underline decoration-rule-strong transition-colors group-hover:text-ink group-hover:decoration-signal">
        {label}
      </span>
      <span className={`text-[15px] transition-colors ${copied ? "text-ink" : "text-ink-faint group-hover:text-ink-soft"}`}>
        {copied ? "Copied" : "Copy"}
      </span>
      <span role="status" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </button>
  );
}
