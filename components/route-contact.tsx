"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The contact list drawn as the last route through the system: the visitor's browser, the edge and the
// gateway, fanning out to three endpoints. Pointing at an endpoint sends a request (the scene's amber
// squares) along its route; choosing it lands the request and copies the address or opens the profile.
// Below md the route runs down a left-hand spine, like a decision record, instead of across.

type Endpoint = { id: string; label: string; value: string; href?: string };
type Point = { x: number; y: number };

const REGIONS = ["EU", "US", "AP"];

// The request the inspector shows: which edge region served it, simulated timings, and how far it got.
type Request = { id: string; region: number; edgeMs: number; gatewayMs: number; status: "sending" | "reached" | "done" };

// A fresh request: served by any region, with small simulated timings at each hop.
const newRequest = (id: string): Request => ({
  id,
  region: Math.floor(Math.random() * 3),
  edgeMs: 3 + Math.round(Math.random() * 9),
  gatewayMs: 1 + Math.round(Math.random() * 3),
  status: "sending",
});

const HOPS = [
  { id: "you", label: "You" },
  { id: "edge", label: "Edge" },
  { id: "gateway", label: "Gateway" },
];

export function RouteContact({ email, emailLabel, links }: { email: string; emailLabel: string; links: { label: string; href: string; handle: string }[] }) {
  const endpoints: Endpoint[] = [
    { id: "email", label: "Email", value: emailLabel },
    ...links.map((l) => ({ id: l.label.toLowerCase(), label: l.label, value: l.handle, href: l.href })),
  ];

  const root = useRef<HTMLDivElement>(null);
  const flight = useRef<HTMLDivElement>(null);
  const [routes, setRoutes] = useState<Record<string, Point[]>>({});
  const [active, setActive] = useState<string | null>(null);
  const [landed, setLanded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [req, setReq] = useState<Request | null>(null);

  // Every route starts at the visitor and runs through the edge and gateway; from the gateway it
  // steps across to a trunk, along it to the endpoint's row, and into the endpoint's marker.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const at = (id: string): Point | null => {
        // Hops have a marker for the spine and a drawing for the wide layout; measure whichever shows.
        const m = [...el.querySelectorAll<HTMLElement>(`[data-node="${id}"]`)].find((n) => n.offsetParent !== null);
        if (!m) return null;
        const r = m.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      };
      const chain = HOPS.map((h) => at(h.id));
      if (chain.some((p) => !p)) return;
      const g = chain[2]!;
      const next: Record<string, Point[]> = {};
      for (const e of endpoints) {
        const p = at(e.id);
        if (!p) continue;
        const trunk = p.x > g.x + 24 ? g.x + (p.x - g.x) / 2 : g.x;
        next[e.id] = [...(chain as Point[]), { x: trunk, y: g.y }, { x: trunk, y: p.y }, p];
      }
      setRoutes(next);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
    // The endpoints only change with the content, which is fixed for the page's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = useCallback(
    (id: string, then?: () => void) => {
      const path = routes[id];
      const layer = flight.current;
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!path || !layer || still) {
        then?.();
        return;
      }
      const lengths = path.slice(1).map((p, i) => Math.hypot(p.x - path[i].x, p.y - path[i].y));
      const total = lengths.reduce((a, b) => a + b, 0) || 1;
      let run = 0;
      const frames = path.map((p, i) => {
        if (i > 0) run += lengths[i - 1];
        return { transform: `translate(${p.x - 2.5}px, ${p.y - 2.5}px)`, offset: run / total };
      });
      [0, 1, 2].forEach((i) => {
        const dot = document.createElement("span");
        dot.className = "absolute top-0 left-0 size-[5px] bg-signal";
        layer.appendChild(dot);
        const a = dot.animate(frames, { duration: 900, delay: i * 110, easing: "cubic-bezier(0.55, 0, 0.25, 1)", fill: "both" });
        a.onfinish = () => {
          dot.remove();
          if (i === 2) then?.();
        };
      });
    },
    [routes],
  );

  useEffect(() => {
    if (!landed) return;
    const t = setTimeout(() => setLanded(null), 1600);
    return () => clearTimeout(t);
  }, [landed]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2400);
    return () => clearTimeout(t);
  }, [copied]);

  const dispatch = (id: string) => {
    const r = newRequest(id);
    setReq(r);
    return r;
  };
  const advance = (id: string, status: Request["status"]) => setReq((r) => (r && r.id === id ? { ...r, status } : r));

  const point = (id: string) => {
    if (active === id) return;
    setActive(id);
    dispatch(id);
    send(id, () => advance(id, "reached"));
  };

  const choose = async (e: Endpoint) => {
    if (!e.href) {
      try {
        await navigator.clipboard.writeText(email);
        setCopied(true);
      } catch {
        window.location.assign(`mailto:${email}`);
        return;
      }
    }
    if (req?.id !== e.id) dispatch(e.id);
    send(e.id, () => {
      setLanded(e.id);
      advance(e.id, "done");
    });
  };

  const line = (pts: Point[]) => pts.map((p) => `${p.x},${p.y}`).join(" ");
  const lit = (id: string) => active === id || landed === id;
  const live = !!(active || landed);
  const target = endpoints.find((e) => e.id === req?.id);
  const response = !req
    ? "–"
    : req.status === "sending"
      ? "in flight"
      : target?.href
        ? req.status === "done"
          ? "302 · opened in a new tab"
          : `302 → ${target.href.replace(/^https:\/\/(www\.)?/, "")}`
        : req.status === "done"
          ? "200 · copied to clipboard"
          : "200 · ready to copy";

  return (
    <div ref={root} className="relative" onPointerLeave={() => setActive(null)}>
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        {Object.entries(routes).map(([id, pts]) => (
          <polyline key={id} points={line(pts)} fill="none" strokeWidth="1" className="stroke-rule-strong" />
        ))}
        {/* The chosen route is redrawn on top in amber, so its shared hops light too. */}
        {Object.entries(routes)
          .filter(([id]) => lit(id))
          .map(([id, pts]) => (
            <polyline key={id} points={line(pts)} fill="none" strokeWidth="1" className="stroke-signal" />
          ))}
      </svg>
      <div ref={flight} aria-hidden className="pointer-events-none absolute inset-0" />

      <div className="relative grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-x-20">
        <div className="md:flex md:flex-col md:justify-center">
          <ol aria-label="Route" className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
            {HOPS.map((h) => (
              <li key={h.id} className="flex items-center gap-5 md:flex-col md:gap-3">
                <span
                  data-node={h.id}
                  className={`block size-[11px] border transition-colors duration-300 md:hidden ${
                    live ? "border-signal bg-raised" : "border-steel bg-raised"
                  }`}
                />
                <span data-node={h.id} className="hidden bg-raised px-2 md:block">
                  <HopDrawing
                    id={h.id}
                    lit={live}
                    region={live && req ? req.region : -1}
                    row={live && req ? endpoints.findIndex((e) => e.id === req.id) : -1}
                  />
                </span>
                <span className="font-mono text-[12px] text-ink-soft">{h.label}</span>
              </li>
            ))}
          </ol>

          {/* The last request sent, as an inspector would show it. Below md the spine runs where it would sit. */}
          <div className="mt-14 hidden border-t border-rule pt-4 md:block">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[15px] font-semibold">Last request</span>
              <span className="text-[13px] text-ink-faint">Timings simulated</span>
            </div>
            <dl className="mt-4 grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-2.5 font-mono text-[12px]">
              <dt className="text-ink-faint">route</dt>
              <dd className="text-ink">{req ? `GET /${req.id}` : "–"}</dd>
              <dt className="text-ink-faint">edge</dt>
              <dd className="text-ink-soft">{req ? `${REGIONS[req.region]} · TLS · ${req.edgeMs} ms` : "–"}</dd>
              <dt className="text-ink-faint">gateway</dt>
              <dd className="text-ink-soft">{req ? `auth ok · rate limit ok · ${req.gatewayMs} ms` : "–"}</dd>
              <dt className="text-ink-faint">response</dt>
              <dd className={req?.status === "sending" ? "text-ink-faint" : "text-ink"}>{response}</dd>
            </dl>
            <p className="mt-4 text-[13px] text-ink-faint">
              {req ? "Point at another endpoint to route a new request." : "Point at an endpoint to send a request through."}
            </p>
          </div>
        </div>

        <ul className="border-t border-rule-strong">
          {endpoints.map((e) => {
            const inner = (
              <>
                <span
                  data-node={e.id}
                  className={`absolute top-1/2 left-0 size-[11px] -translate-y-1/2 border transition-colors duration-300 ${
                    landed === e.id ? "border-signal bg-signal" : lit(e.id) ? "border-signal bg-raised" : "border-steel bg-raised"
                  }`}
                />
                <span className="block text-[15px] text-ink-faint transition-colors group-hover:text-ink-soft">{e.label}</span>
                <span className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-xl font-semibold tracking-[-0.01em] text-ink underline decoration-rule-strong decoration-1 underline-offset-[0.22em] transition-colors group-hover:decoration-signal [overflow-wrap:anywhere] md:text-2xl">
                    {e.value}
                  </span>
                  {e.href ? (
                    <ArrowOut className="size-3 self-center text-ink-faint transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
                  ) : (
                    <span className={`text-[15px] transition-colors ${copied ? "text-ink" : "text-ink-faint group-hover:text-ink-soft"}`}>
                      {copied ? "Copied" : "Copy"}
                    </span>
                  )}
                </span>
              </>
            );
            const cls = "group relative block w-full py-6 pl-10 text-left";
            const on = { onPointerEnter: () => point(e.id), onFocus: () => point(e.id), onBlur: () => setActive(null) };
            return (
              <li key={e.id} className="border-b border-rule">
                {e.href ? (
                  <a href={e.href} target="_blank" rel="noreferrer" onClick={() => choose(e)} className={cls} {...on}>
                    {inner}
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : (
                  <button type="button" onClick={() => choose(e)} className={cls} {...on}>
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <span role="status" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </div>
  );
}

function ArrowOut({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden className={className}>
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  );
}

// The hops drawn as the scene draws them, in steel line: the visitor's devices, the edge rack with a unit
// per region, and the gateway with its routing table. While a request is out, the serving region's light
// and the gateway row for its route turn amber.
function HopDrawing({ id, lit, region, row }: { id: string; lit: boolean; region: number; row: number }) {
  const ink = lit ? "text-signal" : "text-steel";
  const on = (hit: boolean) => (hit ? "fill-signal" : "fill-current");
  return (
    <svg viewBox="0 0 44 36" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden className={`h-12 w-[58px] transition-colors duration-300 ${ink}`}>
      {id === "you" && (
        <>
          <rect x="5.5" y="6.5" width="24" height="16" />
          <path d="M2.5 25.5h30" />
          <rect x="33.5" y="11.5" width="8" height="15" />
          <path d="M36.5 23.5h2" />
        </>
      )}
      {id === "edge" && (
        <>
          <rect x="7.5" y="1.5" width="29" height="33" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="10.5" y={5.5 + i * 9.5} width="23" height="7" />
              <rect x="28.5" y={7.5 + i * 9.5} width="3" height="3" stroke="none" className={on(region === i)} />
            </g>
          ))}
        </>
      )}
      {id === "gateway" && (
        <>
          <rect x="1.5" y="8.5" width="41" height="19" />
          <path d="M10 13.5l4 1.5v3.5c0 2.5-2 4-4 5-2-1-4-2.5-4-5V15z" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x="19.5" y={12.5 + i * 4} width="19" height="2" stroke="none" className={row === i ? "fill-signal" : "fill-current opacity-60"} />
          ))}
        </>
      )}
    </svg>
  );
}
