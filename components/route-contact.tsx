"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The contact list drawn as the last route through the system: the visitor's browser, the edge and the
// gateway, fanning out to three endpoints. Pointing at an endpoint sends a request (the scene's amber
// squares) along its route; choosing it lands the request and copies the address or opens the profile.
// Below md the route runs down a left-hand spine, like a decision record, instead of across.

type Endpoint = { id: string; label: string; value: string; href?: string };
type Point = { x: number; y: number };

const REGIONS = ["EU", "US", "AP"];

// The request the inspector shows: whose it is, which edge region served it, simulated timings, and how far it got.
// Background requests keep the band idling like the rest of the system; the visitor's own replace them.
type Request = {
  id: string;
  source: "you" | "background";
  region: number;
  edgeMs: number;
  gatewayMs: number;
  status: "sending" | "reached" | "done";
};

// A fresh request: served by any region, with small simulated timings at each hop.
const newRequest = (id: string, source: Request["source"]): Request => ({
  id,
  source,
  region: Math.floor(Math.random() * 3),
  edgeMs: 3 + Math.round(Math.random() * 9),
  gatewayMs: 1 + Math.round(Math.random() * 3),
  status: "sending",
});

// Read in event handlers and timers only, never while rendering.
const now = () => performance.now();

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
  // The parts a background request lights on its way through: its edge region and gateway row.
  const [ambient, setAmbient] = useState<{ region: number; row: number } | null>(null);
  const busy = useRef({ active: null as string | null, landed: null as string | null, ownAt: -Infinity });

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
    (id: string, then?: () => void, quiet = false) => {
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
      // The visitor's request is a burst of three; background traffic is a single, dimmer, slower square.
      const count = quiet ? 1 : 3;
      for (let i = 0; i < count; i++) {
        const dot = document.createElement("span");
        dot.className = `absolute top-0 left-0 size-[5px] bg-signal ${quiet ? "opacity-50" : ""}`;
        layer.appendChild(dot);
        const a = dot.animate(frames, {
          duration: quiet ? 1600 : 900,
          delay: i * 110,
          easing: quiet ? "cubic-bezier(0.45, 0, 0.55, 1)" : "cubic-bezier(0.55, 0, 0.25, 1)",
          fill: "both",
        });
        a.onfinish = () => {
          dot.remove();
          if (i === count - 1) then?.();
        };
      }
    },
    [routes],
  );

  useEffect(() => {
    busy.current.active = active;
    busy.current.landed = landed;
  }, [active, landed]);

  // Background traffic: every few seconds, while the band is on screen and the visitor isn't routing their
  // own request (or has just routed one), a request reaches a random endpoint. Reduced motion gets one,
  // already landed, so the inspector is never empty.
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);
  const ready = Object.keys(routes).length > 0;
  useEffect(() => {
    const el = root.current;
    if (!el || !ready) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = () => {
      const b = busy.current;
      if (b.active || b.landed || now() - b.ownAt < 6000) return;
      const row = Math.floor(Math.random() * endpoints.length);
      const id = endpoints[row].id;
      const r = newRequest(id, "background");
      setReq(r);
      setAmbient({ region: r.region, row });
      sendRef.current(
        id,
        () => {
          setReq((x) => (x && x.source === "background" && x.id === id ? { ...x, status: "reached" } : x));
          setAmbient(null);
        },
        true,
      );
    };
    const first = window.setTimeout(tick, 600);
    if (still) return () => window.clearTimeout(first);
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const timer = window.setInterval(() => visible && !document.hidden && tick(), 3400);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
      io.disconnect();
    };
    // The endpoints only change with the content, which is fixed for the page's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

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
    const r = newRequest(id, "you");
    busy.current.ownAt = now();
    setAmbient(null);
    setReq(r);
    return r;
  };
  const advance = (id: string, status: Request["status"]) =>
    setReq((r) => (r && r.id === id && r.source === "you" ? { ...r, status } : r));

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
    if (req?.id !== e.id || req.source !== "you") dispatch(e.id);
    busy.current.ownAt = now();
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

      {/* On the page's 12-column grid from lg, so the endpoints line up under the intro's lead like every section. */}
      <div className="relative grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-x-20 lg:grid-cols-12 lg:gap-x-6">
        <div className="md:flex md:flex-col md:justify-center lg:col-span-5">
          <ol aria-label="Route" className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
            {HOPS.map((h) => (
              <li key={h.id} className="flex items-center gap-[29px] md:flex-col md:gap-3">
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
                    region={live && req ? req.region : (ambient?.region ?? -1)}
                    row={live && req ? endpoints.findIndex((e) => e.id === req.id) : (ambient?.row ?? -1)}
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
              <dt className="text-ink-faint">from</dt>
              <dd className={req?.source === "you" ? "text-signal" : "text-ink-soft"}>{req ? (req.source === "you" ? "you" : "background traffic") : "–"}</dd>
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
              {req?.source === "you" ? "Point at another endpoint to route a new request." : "Point at an endpoint to send your own request through."}
            </p>
          </div>
        </div>

        <ul className="border-t border-rule-strong lg:col-span-6 lg:col-start-7">
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
                  <span className="text-lg font-semibold tracking-[-0.01em] text-ink underline decoration-rule-strong decoration-1 underline-offset-[0.22em] transition-colors group-hover:decoration-signal [overflow-wrap:anywhere] md:text-xl">
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

// The hops drawn as the scene builds them, in a shallow oblique view with dark bodies and steel edges:
// the fanned crowd of devices, the edge rack with one server per region (EU, US, AP) and its status lights,
// and the gateway router with its shield and routing table. A request lights its region and route row.
function HopDrawing({ id, lit, region, row }: { id: string; lit: boolean; region: number; row: number }) {
  const ink = lit ? "text-signal" : "text-steel";
  const body = "fill-ground";
  const top = "fill-raised";
  return (
    <svg viewBox="0 0 72 56" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" aria-hidden className={`h-14 w-[72px] transition-colors duration-300 ${ink}`}>
      {id === "you" && (
        <>
          {/* A tablet fanned out behind, the laptop in front, two phones to its right. */}
          <path d="M4.5 13.5 21.5 9.5 23.5 27.5 6.5 31.5Z" className={body} />
          <path d="M16.5 15.5h26v18h-26Z" className={body} />
          <path d="M18.5 17.5h22v14h-22Z" className="fill-raised" strokeOpacity="0.5" />
          <path d="M12.5 35.5h34l4 5h-42Z" className={top} />
          <path d="M48.5 20.5 56.5 19.5 57.5 36.5 49.5 37.5Z" className={body} />
          <path d="M59.5 23.5 66.5 24.5 65.5 39.5 58.5 38.5Z" className={body} />
        </>
      )}
      {id === "edge" && (
        <>
          <path d="M14.5 10.5 22.5 4.5h34l-8 6Z" className={top} />
          <path d="M48.5 10.5 56.5 4.5v42l-8 6Z" className={body} />
          <path d="M14.5 10.5h34v42h-34Z" className={body} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <path d={`M17.5 ${14.5 + i * 12.5}h28v9h-28Z`} />
              <path d={`M20.5 ${19 + i * 12.5}h12`} strokeOpacity="0.6" strokeDasharray="2 1.5" />
              <rect x="38.5" y={17.5 + i * 12.5} width="3" height="3" stroke="none" className={region === i ? "fill-signal" : "fill-current opacity-60"} />
            </g>
          ))}
        </>
      )}
      {id === "gateway" && (
        <>
          <path d="M4.5 20.5 12.5 14.5h56l-8 6Z" className={top} />
          <path d="M60.5 20.5 68.5 14.5v20l-8 6Z" className={body} />
          <path d="M4.5 20.5h56v20h-56Z" className={body} />
          <path d="M14 25l5 2v4.5c0 3-2.5 5-5 6-2.5-1-5-3-5-6V27Z" />
          <path d="M24.5 24.5h32v12h-32Z" className="fill-raised" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x="27" y={26.75 + i * 3.25} width="27" height="1.5" stroke="none" className={row === i ? "fill-signal" : "fill-current opacity-60"} />
          ))}
        </>
      )}
    </svg>
  );
}
