"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { INITIAL_READOUT, NODES, SystemScene, type Experiment, type NodeId, type Readout } from "@/components/system-scene";
import type { Capability } from "@/content/site";

// How long each experiment runs, in seconds, matching the simulation.
const DURATION: Record<Experiment, number> = { spike: 5, region: 6, flood: 5, kill: 3, flush: 7 };

// The live figures each experiment is watched through.
const GAUGES: Record<Experiment, (r: Readout) => [string, number | string][]> = {
  spike: (r) => [["req/s", r.throughput], ["services", r.app], ["workers", r.workers]],
  region: (r) => [["EU req/s", r.regions[0]], ["US req/s", r.regions[1]], ["AP req/s", r.regions[2]]],
  flood: (r) => [["allowed/s", r.allowed], ["rejected/s", r.rejected], ["services", r.app]],
  kill: (r) => [["services", r.app], ["queue", r.queue], ["req/s", r.throughput]],
  flush: (r) => [["cache hits", `${r.hitRate}%`], ["db reads/s", r.dbReads], ["req/s", r.throughput]],
};

const clockTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// The live system stays pinned while the page walks the request path past it.
// Each step tells the camera which part of the system to frame.
export function SystemStory({ hero, steps }: { hero: ReactNode; steps: Capability[] }) {
  const loadRef = useRef(10);
  const focusRef = useRef<NodeId[] | null>(null);
  const [load, setLoad] = useState(10);
  const [readout, setReadout] = useState<Readout>(INITIAL_READOUT);
  const [hovered, setHovered] = useState<NodeId | null>(null);
  const [active, setActive] = useState(-1);
  // Without WebGL there is nothing for the load control to drive, so it is not offered.
  const [hasScene, setHasScene] = useState(true);
  // Experiments need the simulation running live; a still frame or the flat diagram can't show them.
  const [live, setLive] = useState(false);
  const commandRef = useRef<((e: Experiment) => void) | null>(null);
  const [running, setRunning] = useState<Experiment | null>(null);
  const [runs, setRuns] = useState(0);
  const runTimer = useRef(0);
  const stepEls = useRef<(HTMLElement | null)[]>([]);
  // Below lg the hero reserves a stage for the system in its own column, so the system and the copy
  // centre together with equal space above and below. The scene frames the system into that stage.
  // Portrait desktops have no stage and frame the strip above the copy and the desktop load panel instead.
  const stageRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const deskPanelRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<{ top: number; bottom: number; alignTop?: number } | null>(null);

  useEffect(() => {
    const shown = (el: HTMLDivElement | null): el is HTMLDivElement => !!el && el.offsetParent !== null;
    const measure = () => {
      const stage = stageRef.current;
      const hero = stepEls.current[0];
      const copy = copyRef.current;
      if (shown(stage) && hero && copy) {
        // When the hero fits the screen, the system's top sits as far under the header as the copy ends above
        // the screen's bottom edge. When it overflows, the system just centres in its stage.
        const below = hero.offsetHeight - (copy.offsetTop + copy.offsetHeight);
        const fits = hero.offsetHeight <= window.innerHeight + 1;
        bandRef.current = {
          top: stage.offsetTop,
          bottom: stage.offsetTop + stage.offsetHeight,
          alignTop: fits ? 64 + below : undefined,
        };
        return;
      }
      const tops = [copyRef.current, deskPanelRef.current].filter(shown).map((el) => el.offsetTop);
      // 64px clears the fixed header; 24px keeps the lowest labels off the headline.
      if (tops.length) bandRef.current = { top: 64, bottom: Math.min(...tops) - 24 };
    };
    const ro = new ResizeObserver(measure);
    [stepEls.current[0], stageRef.current, copyRef.current, deskPanelRef.current].forEach((el) => el && ro.observe(el));
    measure();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.step);
          setActive(i);
          focusRef.current = i < 0 ? null : steps[i].nodes;
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stepEls.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [steps]);

  const onReadout = useCallback((r: Readout) => setReadout(r), []);
  const onHover = useCallback((id: NodeId | null) => setHovered(id), []);
  const onMode = useCallback((m: "live" | "still" | "none") => {
    setHasScene(m !== "none");
    setLive(m === "live");
  }, []);
  useEffect(() => () => window.clearTimeout(runTimer.current), []);
  const runExperiment = (id: Experiment) => {
    commandRef.current?.(id);
    setRuns((n) => n + 1);
    setRunning(id);
    window.clearTimeout(runTimer.current);
    runTimer.current = window.setTimeout(() => setRunning(null), DURATION[id] * 1000);
  };
  const changeLoad = (v: number) => {
    loadRef.current = v;
    setLoad(v);
  };

  const panel = hasScene ? <LoadPanel load={load} onLoad={changeLoad} readout={readout} hovered={hovered} /> : null;

  return (
    <div className="relative">
      <div className="sticky top-0 h-svh overflow-hidden">
        <SystemScene loadRef={loadRef} focusRef={focusRef} bandRef={bandRef} commandRef={commandRef} onReadout={onReadout} onHover={onHover} onMode={onMode} />
      </div>

      <div className="pointer-events-none relative -mt-[100svh]">
        <div
          ref={(el) => {
            stepEls.current[0] = el;
          }}
          data-step={-1}
          className="relative flex min-h-svh flex-col pt-16 lg:justify-end lg:pt-24 lg:pb-14"
        >
          <div className="flex flex-1 flex-col justify-center py-10 lg:flex-none lg:py-0">
            <div ref={stageRef} aria-hidden className="aspect-[10/3] max-h-[40svh] lg:hidden" />
            <div ref={copyRef} className="pointer-events-auto mt-8 px-4 sm:px-8 md:max-w-[52rem] lg:mt-0 lg:px-14 xl:px-20">
              {hero}
              {/* Tablets have the height to keep the load control on the first screen, under the copy. */}
              {panel && <div className="mt-10 hidden max-w-[30rem] md:block lg:hidden">{panel}</div>}
            </div>
          </div>
          <div
            ref={deskPanelRef}
            className="pointer-events-auto absolute bottom-14 hidden w-[22rem] lg:right-14 lg:block xl:right-20"
          >
            {panel}
          </div>
        </div>
        <div className="pointer-events-auto px-4 pb-8 sm:px-8 md:hidden">{panel}</div>

        <div className="px-4 pt-[24svh] sm:px-8 lg:px-14 xl:px-20">
          <h2 data-reveal className="max-w-[16ch] text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1] font-bold tracking-[-0.035em] [font-stretch:112%]">
            Every layer of the system
          </h2>
          <p data-reveal className="mt-5 max-w-[30rem] text-lg leading-snug text-ink-soft sm:text-xl">
            Follow a request from the browser to the database. I design and build each layer it passes through. At
            each one, break something in the simulation and watch the layer hold.
          </p>
        </div>

        <ol>
          {steps.map((s, i) => (
            <li
              key={s.name}
              ref={(el) => {
                stepEls.current[i + 1] = el;
              }}
              data-step={i}
              className="flex min-h-[80svh] items-end px-4 pb-[6svh] sm:px-8 lg:items-center lg:px-14 lg:pb-0 xl:px-20"
            >
              <div
                className={`pointer-events-auto w-full max-w-[30rem] border-l bg-ground/85 py-5 pr-6 pl-6 transition-[opacity,border-color] duration-500 ${
                  active === i ? "border-signal opacity-100" : "border-rule-strong opacity-40"
                }`}
              >
                <h3 className="text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.05] font-bold tracking-[-0.03em] [font-stretch:112%]">
                  {s.name}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">{s.detail}</p>
                {/* On phones the experiment explains the layer, so the role footnote steps aside to keep the scene in view. */}
                <p className={`mt-4 text-[15px] leading-relaxed text-ink-faint ${live ? "hidden sm:block" : ""}`}>
                  {s.nodes
                    ? s.nodes
                        .map((id) => NODES.find((n) => n.id === id)!)
                        .map((n) => `${n.label}: ${n.role}.`)
                        .join(" ")
                    : "Every part above, monitored and documented."}
                </p>
                {live && (
                  <Probe
                    experiment={s.experiment}
                    readout={readout}
                    runs={runs}
                    running={running}
                    onRun={runExperiment}
                  />
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function LoadPanel({
  load,
  onLoad,
  readout,
  hovered,
}: {
  load: number;
  onLoad: (v: number) => void;
  readout: Readout;
  hovered: NodeId | null;
}) {
  const id = useId();
  const node = NODES.find((n) => n.id === hovered);
  return (
    <div className="border border-rule-strong bg-ground/85 p-5">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[15px] font-semibold">
          Simulated load
        </label>
        <span className="font-mono text-[13px] text-signal">{load}×</span>
      </div>
      <input
        id={id}
        type="range"
        min={1}
        max={50}
        value={load}
        onChange={(e) => onLoad(Number(e.target.value))}
        className="load-range mt-2"
        style={{ ["--fill" as string]: `${((load - 1) / 49) * 100}%` }}
        aria-describedby={`${id}-readout`}
      />
      <dl id={`${id}-readout`} className="mt-3 grid grid-cols-4 gap-3 font-mono text-[12px]">
        <Stat label="req/s" value={readout.throughput} />
        <Stat label="services" value={readout.app} />
        <Stat label="queue" value={readout.queue} />
        <Stat label="workers" value={readout.workers} />
      </dl>
      <p className="mt-3 min-h-[2.5em] text-[13px] leading-snug text-ink-soft" aria-live="polite">
        {node ? (
          <>
            <span className="text-ink">{node.label}:</span> {node.role}.
          </>
        ) : (
          "Drag to push traffic through. Services and workers scale out; the queue takes the bursts."
        )}
      </p>
    </div>
  );
}

// One experiment on one layer: the action, what to watch for, and the live figures that show it.
// The last layer has no fault to set off and shows what monitoring would report for the visit instead.
function Probe({
  experiment,
  readout,
  runs,
  running,
  onRun,
}: {
  experiment: Capability["experiment"];
  readout: Readout;
  runs: number;
  running: Experiment | null;
  onRun: (id: Experiment) => void;
}) {
  const busy = !!experiment && running === experiment.id;
  const gauges: [string, number | string][] = experiment
    ? GAUGES[experiment.id](readout)
    : [
        ["served", readout.served.toLocaleString("en")],
        ["experiments", runs],
        ["running for", clockTime(readout.elapsed)],
      ];
  return (
    <div className="relative mt-5 border-t border-rule pt-5">
      {busy && (
        <span
          key={runs}
          aria-hidden
          className="probe-run absolute -top-px left-0 h-px w-full bg-signal"
          style={{ animationDuration: `${DURATION[experiment.id]}s` }}
        />
      )}
      {experiment ? (
        <>
          <button
            type="button"
            onClick={() => onRun(experiment.id)}
            disabled={busy}
            className="inline-flex items-center gap-3 border border-rule-strong px-4 py-2.5 text-[15px] font-semibold transition-[border-color,transform] duration-200 not-disabled:hover:border-ink not-disabled:active:translate-y-[1px] disabled:cursor-default"
          >
            <span aria-hidden className={`size-[11px] ${busy ? "bg-signal" : "border border-steel"}`} />
            <span aria-live="polite">{busy ? "Running" : experiment.action}</span>
          </button>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{experiment.effect}</p>
        </>
      ) : (
        <p className="text-[15px] leading-relaxed text-ink-soft">What monitoring would report for your visit so far.</p>
      )}
      <dl className="mt-4 grid grid-cols-3 gap-3 font-mono text-[12px]">
        {gauges.map(([label, value]) => (
          <Stat key={label} label={label} value={value} />
        ))}
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <dt className="text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-[15px] text-ink">{value}</dd>
    </div>
  );
}
