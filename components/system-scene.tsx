"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type * as T from "three";

// A small, honest simulation of the kind of system Ankit designs: traffic enters at the edge,
// stateless services scale out with load, a queue absorbs bursts for workers, and a cache
// shields the database. Every number on screen is simulated and labelled as such.

export type NodeId = "clients" | "edge" | "gateway" | "app" | "cache" | "queue" | "workers" | "db";

export type NodeSpec = {
  id: NodeId;
  label: string;
  role: string;
  pos: [number, number, number];
};

export const NODES: NodeSpec[] = [
  { id: "clients", label: "Clients", role: "Web and mobile apps", pos: [-7.2, 0, 0] },
  { id: "edge", label: "Edge", role: "CDN, TLS, static assets", pos: [-4.8, 0, 0] },
  { id: "gateway", label: "API gateway", role: "Auth, routing, rate limits", pos: [-2.4, 0, 0] },
  { id: "app", label: "Services", role: "Stateless, scale out with load", pos: [0.6, 0, 0] },
  { id: "cache", label: "Cache", role: "Hot reads off the database", pos: [3.6, 0, 2.3] },
  { id: "queue", label: "Queue", role: "Absorbs bursts, never drops work", pos: [3.6, 0, -2.3] },
  { id: "workers", label: "Workers", role: "Async jobs, scale with queue depth", pos: [6.2, 0, -2.3] },
  { id: "db", label: "Database", role: "Primary with read replica", pos: [8.6, 0, 0.6] },
];

const MAX_PARTICLES = 1400;
const MAX_APP = 10;
const MAX_WORKERS = 6;

export type Readout = {
  throughput: number;
  app: number;
  queue: number;
  workers: number;
  // Requests per second each edge region (EU, US, AP) is serving.
  regions: number[];
  // Requests per second the gateway lets through, and turns away at the rate limit.
  allowed: number;
  rejected: number;
  // Share of cache reads that hit, as a percentage, and the reads that fall through to the database.
  hitRate: number;
  dbReads: number;
  // Requests served and seconds the system has run since the visitor arrived.
  served: number;
  elapsed: number;
};

export const INITIAL_READOUT: Readout = {
  throughput: 200,
  app: 3,
  queue: 0,
  workers: 1,
  regions: [0, 0, 0],
  allowed: 0,
  rejected: 0,
  hitRate: 75,
  dbReads: 0,
  served: 0,
  elapsed: 0,
};

// Faults and surges the visitor can set off, one per layer, to watch that layer do its job.
export type Experiment = "spike" | "region" | "flood" | "kill" | "flush";

export function SystemScene({
  loadRef,
  focusRef,
  bandRef,
  commandRef,
  onReadout,
  onHover,
  onMode,
}: {
  loadRef: RefObject<number>;
  // Nodes the camera should frame; null frames the whole system.
  focusRef: RefObject<NodeId[] | null>;
  // The strip of screen (px from the scene's top) left free above the page copy. On phones, tablets and
  // portrait screens the wide shot fills it; landscape desktops keep the system up and to the right instead.
  // alignTop, when given, is where the top of the system (its highest label) should land instead.
  bandRef?: RefObject<{ top: number; bottom: number; alignTop?: number } | null>;
  // Filled in while the simulation runs live, so the page can set off an experiment.
  commandRef?: RefObject<((e: Experiment) => void) | null>;
  onReadout: (r: Readout) => void;
  onHover: (id: NodeId | null) => void;
  onMode?: (mode: "live" | "still" | "none") => void;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const labels = useRef<Partial<Record<NodeId, HTMLDivElement | null>>>({});
  const callbacks = useRef({ onReadout, onHover, onMode });
  const [readout, setReadout] = useState<Readout>(INITIAL_READOUT);
  const [lit, setLit] = useState<NodeId[]>([]);
  const [hover, setHoverState] = useState<NodeId | null>(null);
  const [mode, setMode] = useState<"pending" | "live" | "still" | "none">("pending");

  useEffect(() => {
    callbacks.current = { onReadout, onHover, onMode };
  }, [onReadout, onHover, onMode]);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    const probe = document.createElement("canvas");
    const supported = !!(probe.getContext("webgl2") || probe.getContext("webgl"));
    if (!supported) {
      queueMicrotask(() => {
        setMode("none");
        callbacks.current.onMode?.("none");
      });
      return;
    }
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("three").then((THREE) => {
      if (disposed) return;
      setMode(still ? "still" : "live");
      callbacks.current.onMode?.(still ? "still" : "live");

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      host.appendChild(renderer.domElement);
      Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" });

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x0a0c10, 30, 90);
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

      const world = new THREE.Group();
      scene.add(world);

      scene.add(new THREE.AmbientLight(0xbfc8d6, 0.55));
      const key = new THREE.DirectionalLight(0xffffff, 1.1);
      key.position.set(-4, 9, 6);
      scene.add(key);
      const warm = new THREE.PointLight(0xffb547, 6, 9, 2);
      warm.position.set(0.6, 1.6, 0);
      world.add(warm);

      const grid = new THREE.GridHelper(48, 48, 0x2a313c, 0x161a21);
      grid.position.y = -1.1;
      world.add(grid);

      const steel = new THREE.Color(0x7d8899);
      const amber = new THREE.Color(0xffb547);
      const bodyMat = () => new THREE.MeshStandardMaterial({ color: 0x141922, metalness: 0.35, roughness: 0.55 });
      const edgeMat = () => new THREE.LineBasicMaterial({ color: steel.clone(), transparent: true, opacity: 0.9 });
      const ledMat = new THREE.MeshBasicMaterial({ color: 0xc9d1dc });
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x1b2433 });

      // Each part is built from simple solids, outlined in steel. The outlines turn amber when lit.
      type Body = { id: NodeId; group: T.Group; pivot: T.Group; lines: T.LineBasicMaterial[]; scale: number; vel: number; target: number };
      type Add = (
        geo: T.BufferGeometry,
        pos?: [number, number, number],
        rot?: [number, number, number],
        material?: T.Material,
        outline?: boolean,
      ) => T.Mesh;
      const allBodies: Body[] = [];
      type Ring = (r: number, y: number, tilt?: number) => void;
      type Seg = (pts: [number, number, number][]) => void;
      const makeBody = (at: T.Vector3, id: NodeId, build: (add: Add, ring: Ring, seg: Seg) => void): Body => {
        const group = new THREE.Group();
        const pivot = new THREE.Group();
        group.add(pivot);
        const lines: T.LineBasicMaterial[] = [];
        const add: Add = (geo, pos = [0, 0, 0], rot = [0, 0, 0], material, outline = true) => {
          const mesh = new THREE.Mesh(geo, material ?? bodyMat());
          mesh.position.set(...pos);
          mesh.rotation.set(...rot);
          mesh.userData.id = id;
          pivot.add(mesh);
          if (outline) {
            const m = edgeMat();
            lines.push(m);
            // Parented to its mesh so the outline follows any scale or motion of the solid.
            mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), m));
          }
          return mesh;
        };
        // A circle of linework, flat (tilt 0) or turned about the vertical axis.
        const ring = (r: number, y: number, tilt?: number) => {
          const pts = new THREE.EllipseCurve(0, 0, r, r).getPoints(48).map((p) => new THREE.Vector3(p.x, y, p.y));
          const m = edgeMat();
          lines.push(m);
          const loop = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), m);
          if (tilt !== undefined) {
            loop.geometry.rotateX(Math.PI / 2);
            loop.rotation.y = tilt;
          }
          pivot.add(loop);
        };
        // Straight linework, given as pairs of points.
        const seg: Seg = (pts) => {
          const m = edgeMat();
          lines.push(m);
          pivot.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p))), m));
        };
        build(add, ring, seg);
        group.position.copy(at);
        world.add(group);
        const body = { id, group, pivot, lines, scale: 1, vel: 0, target: 1 };
        allBodies.push(body);
        return body;
      };

      const at = (id: NodeId) => new THREE.Vector3(...NODES.find((n) => n.id === id)!.pos);
      // Cells that light when a request reaches them, then cool back to idle.
      // Each cell knows how to show its own heat (a light swells, a cable thickens).
      type Cell = { mat: { color: T.Color }; heat: number; show: (heat: number) => void; rest?: T.Color; tint?: T.Color };
      const readWhite = new THREE.Color(0xe9ecf1);
      // Lighting that lands a beat later, so a request can be seen moving through a part.
      const schedule: { at: number; cell: Cell; tint?: T.Color }[] = [];
      let clock = 0;
      const light = (cell: Cell, delay = 0, tint?: T.Color) => schedule.push({ at: clock + delay, cell, tint });
      const idle = new THREE.Color(0x1b2433);

      // Clients: a fanned crowd of devices, many users at once. Each device sends its own requests:
      // they start inside it and come out of its side along an exit clear of its neighbours (the back
      // two leave behind the laptop's screen, which hides them until they pass its edge).
      const devices: { centre: T.Vector3; exit: T.Vector3; half: [number, number, number] }[] = [];
      makeBody(at("clients"), "clients", (add) => {
        const device = (w: number, h: number, pos: [number, number, number], yaw: number, roll: number, exit: [number, number, number]) => {
          add(new THREE.BoxGeometry(w, h, 0.04), pos, [0, yaw, roll]);
          add(new THREE.PlaneGeometry(w * 0.86, h * 0.86), [pos[0], pos[1], pos[2] + 0.022], [0, yaw, roll], screenMat, false);
          devices.push({
            centre: at("clients").add(new THREE.Vector3(...pos)),
            exit: at("clients").add(new THREE.Vector3(...exit)),
            half: [Math.abs((w / 2) * Math.cos(yaw)) + 0.03, h / 2 + 0.02, Math.abs((w / 2) * Math.sin(yaw)) + 0.03],
          });
        };
        device(0.62, 0.46, [-0.42, 0.02, -0.18], 0.35, 0.04, [0.95, 0.04, -0.32]);
        add(new THREE.BoxGeometry(0.78, 0.04, 0.5), [0.05, -0.3, 0.12]);
        device(0.78, 0.5, [0.05, -0.04, -0.12], 0, 0, [0.95, 0, -0.3]);
        device(0.22, 0.44, [0.56, -0.08, 0.26], -0.4, -0.05, [0.95, -0.05, 0.3]);
        device(0.2, 0.4, [0.8, -0.1, 0.06], -0.55, 0.06, [1.05, -0.08, 0.06]);
      });

      const partCells: Cell[] = [];
      const cell = (mat: { color: T.Color }, show: (h: number) => void, tint?: T.Color): Cell => {
        const c: Cell = { mat, heat: 0, show, tint };
        partCells.push(c);
        return c;
      };
      const lit = () => new THREE.MeshBasicMaterial({ color: idle.clone() });
      // A faceplate print drawn on a canvas: dark ground, steel ink.
      const faceplate = (w: number, h: number, draw: (g: CanvasRenderingContext2D, px: (x: number) => number) => void) => {
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = Math.round((1024 * h) / w);
        const g = canvas.getContext("2d")!;
        g.fillStyle = "#11141a";
        g.fillRect(0, 0, canvas.width, canvas.height);
        g.textBaseline = "middle";
        draw(g, (x) => ((x + w / 2) / w) * 1024);
        return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) });
      };
      const mono = (size: number, weight = 500) => `${weight} ${size}px ui-monospace, SFMono-Regular, Menlo, monospace`;

      // Edge: a CDN rack, a small cabinet of regional servers. The region that serves
      // a request lights.
      const regions: Cell[] = [];
      const regionFaces: T.MeshBasicMaterial[] = [];
      makeBody(at("edge"), "edge", (add) => {
        for (const x of [-0.43, 0.43]) add(new THREE.BoxGeometry(0.05, 1.0, 0.52), [x, 0, 0]);
        for (const y of [-0.5, 0.5]) add(new THREE.BoxGeometry(0.91, 0.05, 0.52), [0, y, 0]);
        for (const [i, name] of ["EU", "US", "AP"].entries()) {
          const y = 0.28 - i * 0.28;
          add(new THREE.BoxGeometry(0.78, 0.22, 0.46), [0, y, 0]);
          const face = faceplate(0.74, 0.18, (g) => {
            g.fillStyle = "#c9d1dc";
            g.font = mono(150, 600);
            g.fillText(name, 40, 125);
            g.fillStyle = "#3a4250";
            for (let k = 0; k < 6; k++) g.fillRect(420 + k * 60, 80, 34, 90);
          });
          add(new THREE.PlaneGeometry(0.74, 0.18), [0, y, 0.232], [0, 0, 0], face, false);
          const mat = lit();
          const led = add(new THREE.BoxGeometry(0.05, 0.05, 0.02), [0.3, y, 0.24], [0, 0, 0], mat, false);
          regions.push(cell(mat, (h) => led.scale.setScalar(1 + h * 0.6)));
          regionFaces.push(face);
        }
      });
      // The region that serves a request is any one still online.
      const dark = new THREE.Color(0x0d1014);
      const edgeServe = () => {
        const up = [0, 1, 2].filter((i) => i !== sim.down);
        const i = pick(up);
        counts.regions[i] += 1;
        if (lights()) light(regions[i]);
      };

      // API gateway: a router with a routing table on a small screen. The route each
      // request takes highlights.
      const rows: Cell[] = [];
      const ROUTES = ["GET  /orders", "POST /users", "GET  /search"];
      makeBody(at("gateway"), "gateway", (add) => {
        add(new THREE.BoxGeometry(1.2, 0.36, 0.62));
        add(new THREE.BoxGeometry(0.66, 0.28, 0.01), [0.18, 0, 0.311], [0, 0, 0], screenMat, false);
        ROUTES.forEach((_, i) => {
          const mat = new THREE.MeshBasicMaterial({ color: idle.clone() });
          const row = add(new THREE.PlaneGeometry(0.62, 0.07), [0.18, 0.08 - i * 0.08, 0.317], [0, 0, 0], mat, false);
          rows.push(cell(mat, (h) => row.scale.set(1, 1 + h * 0.15, 1)));
        });
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 384;
        const g = canvas.getContext("2d")!;
        g.textBaseline = "middle";
        g.fillStyle = "#e9ecf1";
        g.font = mono(78, 600);
        ROUTES.forEach((r, i) => g.fillText(r, 40, 64 + i * 128));
        const text = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true });
        add(new THREE.PlaneGeometry(0.62, 0.24), [0.18, 0, 0.32], [0, 0, 0], text, false);
        // The status light is a shield: each request blinks it as it passes the gateway's checks.
        const shield = new THREE.Shape();
        shield.moveTo(0, 0.075);
        shield.lineTo(0.06, 0.052);
        shield.lineTo(0.06, 0.005);
        shield.quadraticCurveTo(0.06, -0.05, 0, -0.08);
        shield.quadraticCurveTo(-0.06, -0.05, -0.06, 0.005);
        shield.lineTo(-0.06, 0.052);
        shield.closePath();
        const mat = lit();
        const badge = add(new THREE.ExtrudeGeometry(shield, { depth: 0.02, bevelEnabled: false }), [-0.42, 0.02, 0.312], [0, 0, 0], mat, false);
        rows.push(cell(mat, (h) => badge.scale.setScalar(1 + h * 0.25)));
      });
      const status = rows.pop()!;
      const searchRow = rows[2];
      const gatewayHit = () => {
        light(status);
        light(pick(rows), 0.08);
      };

      // Cache: two RAM sticks seated in their slots. A cache hit reads a chip (white);
      // a miss that fetched from the database writes one (amber).
      const ramChips: Cell[] = [];
      makeBody(at("cache"), "cache", (add) => {
        for (const x of [-0.36, 0.36]) {
          add(new THREE.BoxGeometry(0.66, 0.07, 0.12), [x, -0.3, 0]);
          add(new THREE.BoxGeometry(0.62, 0.34, 0.03), [x, -0.08, 0]);
          add(new THREE.BoxGeometry(0.56, 0.035, 0.032), [x, -0.235, 0], [0, 0, 0], new THREE.MeshBasicMaterial({ color: 0x8f7a4a }), false);
          for (let i = 0; i < 4; i++) {
            const mat = new THREE.MeshBasicMaterial({ color: idle.clone() });
            const chip = add(new THREE.BoxGeometry(0.11, 0.14, 0.03), [x - 0.21 + i * 0.14, -0.04, 0.025], [0, 0, 0], mat);
            ramChips.push({ mat, heat: 0, show: (h) => chip.scale.set(1, 1, 1 + h * 1.5) });
          }
        }
      });
      const access = (write: boolean) => light(pick(ramChips), 0, write ? amber : readWhite);

      // Database: the stacked-disc cylinder.
      makeBody(at("db"), "db", (add) => {
        for (const y of [-0.36, 0, 0.36]) add(new THREE.CylinderGeometry(0.56, 0.56, 0.3, 40), [0, y, 0]);
      });

      // Queue: a clear tube with messages lined up inside it.
      makeBody(at("queue"), "queue", (add, _ring, seg) => {
        const r = 0.28;
        seg([[-1, r, 0], [1, r, 0], [-1, -r, 0], [1, -r, 0], [-1, 0, r], [1, 0, r], [-1, 0, -r], [1, 0, -r]]);
        add(
          new THREE.CylinderGeometry(0.28, 0.28, 2, 32, 1, true),
          [0, 0, 0],
          [0, 0, Math.PI / 2],
          new THREE.MeshStandardMaterial({ color: 0x141922, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
        );
      });
      const MAX_TOKENS = 12;
      const tokenMat = new THREE.MeshBasicMaterial({ color: amber });
      const tokens = Array.from({ length: MAX_TOKENS }, (_, i) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.26, 0.26), tokenMat);
        m.position.copy(at("queue")).add(new THREE.Vector3(0.88 - i * 0.15, 0, 0));
        m.visible = false;
        world.add(m);
        return m;
      });

      // Replicated tiers: each replica springs in and out on its own.
      // Extra columns step to the right, or back into depth when the tier must not widen on screen.
      const slot = (center: T.Vector3, i: number, perColumn: number, rowGap: number, colGap: number, intoDepth = false) => {
        const col = Math.floor(i / perColumn);
        const y = ((i % perColumn) - (perColumn - 1) / 2) * rowGap;
        if (intoDepth) return new THREE.Vector3(center.x, y, center.z - col * colGap);
        return new THREE.Vector3(center.x + col * colGap, y, center.z + (col % 2 ? 0.45 : -0.45));
      };
      // Services: rack servers with status lights.
      const rackUnit: Parameters<typeof makeBody>[2] = (add) => {
        add(new THREE.BoxGeometry(1, 0.26, 0.66));
        for (const x of [0.32, 0.4]) add(new THREE.BoxGeometry(0.04, 0.04, 0.02), [x, 0, 0.335], [0, 0, 0], ledMat, false);
        add(new THREE.BoxGeometry(0.5, 0.03, 0.02), [-0.18, 0, 0.335], [0, 0, 0], screenMat, false);
      };
      // Workers: gears that turn as they work.
      const gearShape = (() => {
        const teeth = 10;
        const outer = 0.36;
        const inner = 0.28;
        const shape = new THREE.Shape();
        for (let i = 0; i < teeth * 4; i++) {
          const a = (i / (teeth * 4)) * Math.PI * 2;
          const r = i % 4 < 2 ? outer : inner;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        shape.closePath();
        const hole = new THREE.Path();
        hole.absarc(0, 0, 0.1, 0, Math.PI * 2, true);
        shape.holes.push(hole);
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: false, curveSegments: 16 });
        geo.translate(0, 0, -0.08);
        return geo;
      })();
      const gear: Parameters<typeof makeBody>[2] = (add) => {
        add(gearShape);
      };
      const appReplicas = Array.from({ length: MAX_APP }, (_, i) => {
        const b = makeBody(slot(at("app"), i, 5, 0.34, 1.2), "app", rackUnit);
        b.scale = b.target = i < 3 ? 1 : 0;
        return b;
      });
      const workerReplicas = Array.from({ length: MAX_WORKERS }, (_, i) => {
        const b = makeBody(slot(at("workers"), i, 3, 0.82, 1.1, true), "workers", gear);
        b.pivot.rotation.z = i * 0.3;
        b.scale = b.target = i < 1 ? 1 : 0;
        return b;
      });

      // Wires between tiers, rebuilt when replica counts change.
      const wires = new THREE.LineSegments(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: 0x3a4250, transparent: true, opacity: 0.8 }),
      );
      world.add(wires);
      const liveApp = () => appReplicas.filter((r) => r.target > 0.5);
      const liveWorkers = () => workerReplicas.filter((r) => r.target > 0.5);
      // Where the clients' requests set out from: just right of the crowd, clear of every device.
      const uplink = at("clients").add(new THREE.Vector3(1.15, 0.05, 0));
      const rebuildWires = () => {
        const pts: number[] = [];
        const link = (a: T.Vector3, b: T.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
        link(uplink, at("edge"));
        link(at("edge"), at("gateway"));
        for (const r of liveApp()) {
          link(at("gateway"), r.group.position);
          link(r.group.position, at("cache"));
          link(r.group.position, at("queue"));
        }
        for (const w of liveWorkers()) link(at("queue"), w.group.position);
        // Workers write to the database over one bundled wire rather than one each.
        link(at("workers"), at("db"));
        link(at("cache"), at("db"));
        wires.geometry.dispose();
        wires.geometry = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      };
      rebuildWires();

      // Requests: amber points travelling along a route of waypoints.
      // A bot's request goes no further than the gateway, which turns it away at the rate limit.
      type Particle = { route: T.Vector3[]; stops: NodeId[]; seg: number; t: number; speed: number; alive: boolean; bot: boolean };
      const particles: Particle[] = Array.from({ length: MAX_PARTICLES }, () => ({ route: [], stops: [], seg: 0, t: 0, speed: 1, alive: false, bot: false }));
      const positions = new Float32Array(MAX_PARTICLES * 3).fill(-999);
      const pointsGeo = new THREE.BufferGeometry();
      pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const dot = (() => {
        const c = document.createElement("canvas");
        c.width = c.height = 64;
        const g = c.getContext("2d")!;
        const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.3, "rgba(255,255,255,0.65)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      })();
      world.add(
        new THREE.Points(
          pointsGeo,
          new THREE.PointsMaterial({ color: amber, size: 0.22, map: dot, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
        ),
      );

      // The solids a request disappears into and comes out of, as centre and half extents,
      // so it reads as passing through a part instead of being drawn across it.
      const solids: { c: T.Vector3; h: [number, number, number] }[] = [
        { c: at("edge"), h: [0.46, 0.53, 0.26] },
        { c: at("gateway"), h: [0.6, 0.18, 0.31] },
        { c: at("cache").add(new THREE.Vector3(0, -0.12, 0)), h: [0.69, 0.23, 0.08] },
        { c: at("queue"), h: [1, 0.28, 0.28] },
        { c: at("db"), h: [0.56, 0.51, 0.56] },
      ];
      const within = (x: number, y: number, z: number, c: T.Vector3, hx: number, hy: number, hz: number) =>
        Math.abs(x - c.x) < hx && Math.abs(y - c.y) < hy && Math.abs(z - c.z) < hz;
      const inside = (x: number, y: number, z: number) =>
        solids.some((s) => within(x, y, z, s.c, ...s.h)) ||
        devices.some((d) => within(x, y, z, d.centre, ...d.half)) ||
        appReplicas.some((r) => r.scale > 0.3 && within(x, y, z, r.group.position, 0.5 * r.scale, 0.13 * r.scale, 0.33 * r.scale)) ||
        workerReplicas.some((r) => r.scale > 0.3 && within(x, y, z, r.group.position, 0.36 * r.scale, 0.36 * r.scale, 0.08 * r.scale));
      const jitter = (v: T.Vector3, s = 0.18) =>
        v.clone().add(new THREE.Vector3((Math.random() - 0.5) * s, (Math.random() - 0.5) * s, (Math.random() - 0.5) * s));
      const pick = <X,>(xs: X[]) => xs[Math.floor(Math.random() * xs.length)];
      // Only a share of arrivals light up, and that share grows with load, so light reads as busyness.
      const lights = () => Math.random() < 0.15 + load() * 0.017;

      const spawn = (midFlight = false) => {
        const p = particles.find((x) => !x.alive);
        if (!p) return;
        const apps = liveApp();
        const app = (apps.length ? pick(apps) : appReplicas[0]).group.position;
        // Come out of one of the devices, then drift loosely along the path. Where requests converge
        // they are inside a part, so the scatter never piles up in view.
        const device = pick(devices);
        // Scattered across the device's face but never in front of it, so a request is born hidden inside.
        const born = device.centre.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.2, 0));
        const route = [born, jitter(device.exit, 0.12), jitter(at("edge"), 0.45), jitter(at("gateway")), jitter(app)];
        const stops: NodeId[] = ["clients", "clients", "edge", "gateway", "app"];
        if (Math.random() < 0.62) {
          route.push(jitter(at("cache"), 0.5));
          stops.push("cache");
          if (Math.random() < 0.25 + 0.75 * sim.flush) {
            route.push(jitter(at("db")));
            stops.push("db");
            counts.db += 1;
          }
        } else {
          const ws = liveWorkers();
          route.push(jitter(at("queue"), 0.9), jitter((ws.length ? pick(ws) : workerReplicas[0]).group.position), jitter(at("db")));
          stops.push("queue", "workers", "db");
        }
        p.route = route;
        p.stops = stops;
        p.seg = midFlight ? Math.floor(Math.random() * (route.length - 1)) : 0;
        p.t = midFlight ? Math.random() : 0;
        p.speed = 1.6 + Math.random() * 0.9;
        p.alive = true;
        p.bot = false;
      };
      const spawnBot = () => {
        const p = particles.find((x) => !x.alive);
        if (!p) return;
        const device = pick(devices);
        const born = device.centre.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.2, 0));
        p.route = [born, jitter(device.exit, 0.12), jitter(at("edge"), 0.45), jitter(at("gateway"))];
        p.stops = ["clients", "clients", "edge", "gateway"];
        p.seg = 0;
        p.t = 0;
        p.speed = 2 + Math.random();
        p.alive = true;
        p.bot = true;
      };

      // Experiments run on the simulation clock: a spike overrides the load, a downed region stops
      // serving, a flood sends bots at the gateway, a flushed cache misses until it warms up again,
      // and a killed service is held off the autoscaler long enough to be seen missing.
      const sim = {
        queue: 0,
        spawnDebt: 0,
        botDebt: 0,
        tick: 0,
        lastApp: 3,
        lastWorkers: 1,
        spikeUntil: 0,
        floodUntil: 0,
        down: -1,
        downUntil: 0,
        holdUntil: 0,
        flush: 0,
        served: 0,
      };
      const load = () => (clock < sim.spikeUntil ? 50 : (loadRef.current ?? 10));
      // Arrivals since the last readout, in simulated requests (see publish for the scale).
      const counts = { regions: [0, 0, 0], allowed: 0, rejected: 0, db: 0 };
      const rates = { regions: [0, 0, 0], allowed: 0, rejected: 0, db: 0 };
      const setRegion = (i: number, up: boolean) => {
        regions[i].rest = up ? undefined : dark;
        regionFaces[i].color.setScalar(up ? 1 : 0.3);
      };
      const run = (e: Experiment) => {
        if (e === "spike") sim.spikeUntil = clock + 5;
        else if (e === "flood") sim.floodUntil = clock + 5;
        else if (e === "flush") sim.flush = 1;
        else if (e === "region") {
          if (sim.down >= 0) setRegion(sim.down, true);
          sim.down = Math.floor(Math.random() * 3);
          sim.downUntil = clock + 6;
          setRegion(sim.down, false);
        } else if (e === "kill") {
          const live = liveApp();
          if (live.length < 2) return;
          live[live.length - 1].target = 0;
          sim.holdUntil = clock + 2.4;
        }
      };
      const pointer = new THREE.Vector2(0, 0);
      const raycaster = new THREE.Raycaster();
      let hoverId: NodeId | null = null;
      let litKey = "";

      // Camera framing: a wide shot of the whole system, or a close shot of the focused nodes.
      const frame = { narrow: false, banded: false, w: 1, h: 1 };
      const camPos = new THREE.Vector3();
      const camLook = new THREE.Vector3();
      const wantPos = new THREE.Vector3();
      const wantLook = new THREE.Vector3();
      // Where the shot sits on screen (a view offset in px). It glides with the camera, so moving
      // between the wide shot and a close shot never jumps.
      const off = new THREE.Vector2();
      const wantOff = new THREE.Vector2();
      // Wide screens keep the system up and to the right of the copy; phones keep it in the top half.
      const restOff = () => {
        aimCentre = null;
        return frame.narrow ? wantOff.set(0, frame.h * 0.16) : wantOff.set(-frame.w * 0.1, frame.h * 0.1);
      };
      // The banded wide shot fits the geometry, but what reads as the system's edges are its labels.
      // placeLabels measures where they land and trims the offset until they centre on aimCentre,
      // or until the highest label lands on aimTop.
      let aimCentre: number | null = null;
      let aimTop: number | null = null;
      let trim = 0;
      // The wide shot backs off until the system's full width fits the horizontal field of view.
      const viewDir = new THREE.Vector3(0.02, 0.32, 1).normalize();
      // Tall views look down more steeply so the graph's depth fills the height.
      const steepDir = new THREE.Vector3(0.02, 0.85, 0.75).normalize();
      const wide = () => {
        const halfWidth = 9.5;
        const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
        wantLook.set(1.1, -0.4, 0);
        const band = bandRef?.current;
        if (frame.banded && band) {
          // Fit the whole system, clients to database, into the free strip by width and by projected depth.
          const bottom = Math.max(band.top + 120, Math.min(band.bottom, frame.h));
          const height = bottom - band.top;
          // Anything but a short letterbox looks down steeply, so the graph's depth gives it presence.
          const steep = frame.w / height < 3.6;
          const halfDepth = steep ? 3.1 : 1.9;
          const fitWidth = (steep ? 10.6 : halfWidth) / (tan * camera.aspect * (frame.narrow ? 1.04 : 0.94));
          const fitHeight = halfDepth / (tan * (height / frame.h));
          const distance = Math.max(fitWidth, fitHeight);
          // When width is the limit, rest the system just above the copy instead of floating it mid-strip.
          const halfOnScreen = (halfDepth / (distance * tan)) * (frame.h / 2);
          aimCentre = Math.max((band.top + bottom) / 2, bottom - halfOnScreen);
          aimTop = band.alignTop ?? null;
          wantOff.set(0, frame.h / 2 - aimCentre - trim);
          wantPos.copy(wantLook).addScaledVector(steep ? steepDir : viewDir, distance);
          return;
        }
        const hfov = 2 * Math.atan(tan * camera.aspect);
        // The desktop view offset spends about a tenth of the width shifting right; give that back.
        const usable = frame.narrow ? 1.18 : 0.86;
        const distance = Math.max(12, (halfWidth / Math.tan((hfov * usable) / 2)) * 1.08);
        restOff();
        wantPos.copy(wantLook).addScaledVector(frame.narrow ? steepDir : viewDir, distance);
      };
      const aim = () => {
        const focus = focusRef.current;
        if (!focus || !focus.length) return wide();
        restOff();
        const centre = new THREE.Vector3();
        focus.forEach((id) => centre.add(at(id)));
        centre.divideScalar(focus.length).applyMatrix4(world.matrixWorld);
        const spread = focus.length > 1 ? 2.2 : 0;
        wantLook.copy(centre);
        wantPos.copy(centre).add(new THREE.Vector3(-2.4 - spread * 0.4, 3 + spread * 0.5, frame.narrow ? 11 + spread : 8.5 + spread));
      };

      const resize = () => {
        frame.w = host.clientWidth;
        frame.h = host.clientHeight;
        frame.narrow = frame.w < 768;
        // Only a landscape desktop has room beside the copy; everything else frames the strip above it.
        frame.banded = frame.w < 1024 || frame.w / frame.h < 1.2;
        renderer.setSize(frame.w, frame.h, false);
        camera.aspect = frame.w / frame.h;
        camera.fov = frame.narrow ? 46 : 30;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();
      world.updateMatrixWorld();
      aim();
      camPos.copy(wantPos);
      camLook.copy(wantLook);
      off.copy(wantOff);

      const onMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      };
      const onLeave = (e: PointerEvent) => {
        if (!e.relatedTarget) pointer.set(0, 0);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerdown", onMove);
      window.addEventListener("pointerout", onLeave);

      const meshes: T.Object3D[] = [];
      world.traverse((o) => {
        if ((o as T.Mesh).isMesh && o.userData.id) meshes.push(o);
      });

      const placeLabels = () => {
        type Box = { el: HTMLDivElement; x: number; y: number; w: number; h: number; below: boolean; hidden: boolean };
        const boxes: Box[] = [];
        for (const n of NODES) {
          const el = labels.current[n.id];
          if (!el) continue;
          const v = at(n.id);
          const column = (count: number, per: number) => 0.75 + ((Math.min(count, per) - 1) / 2) * 0.82;
          v.y +=
            n.id === "app" ? 0.45 + ((Math.min(liveApp().length, 5) - 1) / 2) * 0.34 : n.id === "workers" ? column(liveWorkers().length, 3) : n.id === "cache" ? -0.72 : n.id === "db" && !frame.narrow ? -0.6 : 0.95;
          if (n.id === "app" && liveApp().length > 5) v.x += 0.6;
          v.applyMatrix4(world.matrixWorld).project(camera);
          boxes.push({
            el,
            x: (v.x * 0.5 + 0.5) * frame.w,
            y: (-v.y * 0.5 + 0.5) * frame.h,
            w: el.offsetWidth,
            h: el.offsetHeight,
            // Database sits under its cylinder on wide screens; on phones the cylinder hugs the edge, so it goes above.
            below: n.id === "cache" || (n.id === "db" && !frame.narrow),
            hidden: v.z > 1,
          });
          // A label whose node has left the frame goes with it rather than piling up at the edge.
          const last = boxes[boxes.length - 1];
          if (last.x < 0 || last.x > frame.w || last.y < 0 || last.y > frame.h) last.hidden = true;
        }
        // Keep every label on screen, then step later labels clear of earlier ones.
        const pad = 8;
        const rect = (b: Box) => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.below ? b.y : b.y - b.h, bt: b.below ? b.y + b.h : b.y });
        for (const b of boxes) b.x = Math.min(frame.w - pad - b.w / 2, Math.max(pad + b.w / 2, b.x));
        for (let i = 0; i < boxes.length; i++) {
          if (boxes[i].hidden) continue;
          for (let tries = 0; tries < 4; tries++) {
            const a = rect(boxes[i]);
            const hit = boxes.slice(0, i).find((o) => {
              if (o.hidden) return false;
              const r = rect(o);
              return a.l < r.r + 4 && a.r > r.l - 4 && a.t < r.bt + 2 && a.bt > r.t - 2;
            });
            if (!hit) break;
            boxes[i].y += boxes[i].below ? boxes[i].h + 2 : -(boxes[i].h + 2);
          }
        }
        for (const b of boxes) {
          b.el.style.transform = `translate(${(b.x - b.w / 2).toFixed(1)}px, ${(b.below ? b.y : b.y - b.h).toFixed(1)}px)`;
          b.el.style.opacity = b.hidden ? "0" : "";
        }
        const natural = boxes.filter((b) => !b.hidden).map(rect);
        if (aimCentre === null || !natural.length) {
          trim = 0;
          return;
        }
        // The offset is a pure screen shift, so where the labels land at the target offset is known exactly.
        // A still frame corrects at once; the live orbit eases so the system never twitches with its sway.
        const top = Math.min(...natural.map((r) => r.t));
        const [target, seen] = aimTop === null ? [aimCentre, (top + Math.max(...natural.map((r) => r.bt))) / 2] : [aimTop, top];
        trim += (target - (seen + off.y - wantOff.y)) * (still ? 1 : 0.08);
        trim = Math.max(-frame.h / 4, Math.min(frame.h / 4, trim));
      };

      const paint = () => {
        const focus = focusRef.current ?? [];
        const on = new Set<NodeId>(hoverId ? [hoverId, ...focus] : focus);
        const keyNow = [...on].sort().join();
        if (keyNow === litKey) return;
        litKey = keyNow;
        for (const b of allBodies) for (const m of b.lines) m.color.copy(on.has(b.id) ? amber : steel);
        setLit([...on]);
      };

      const setHover = (id: NodeId | null) => {
        if (id === hoverId) return;
        hoverId = id;
        setHoverState(id);
        callbacks.current.onHover(id);
        host.style.cursor = id ? "help" : "";
      };

      const spring = (b: Body, dt: number) => {
        const a = 90 * (b.target - b.scale) - 14 * b.vel;
        b.vel += a * dt;
        b.scale += b.vel * dt;
        b.group.scale.setScalar(Math.max(0.0001, b.scale));
        b.group.visible = b.scale > 0.01 || b.target > 0;
      };

      const step = (dt: number, t: number) => {
        const L = load();
        const appTarget = Math.min(MAX_APP, Math.max(2, Math.round(2 + L * 0.17)));
        const workerTarget = Math.min(MAX_WORKERS, Math.max(1, 1 + Math.ceil(sim.queue / 30)));
        sim.tick += dt;
        if (sim.tick > 0.35) {
          sim.tick = 0;
          const liveA = liveApp().length;
          if (liveA !== appTarget && clock > sim.holdUntil) appReplicas.forEach((r, i) => (r.target = i < (liveA < appTarget ? liveA + 1 : liveA - 1) ? 1 : 0));
          const liveW = liveWorkers().length;
          if (liveW !== workerTarget) workerReplicas.forEach((r, i) => (r.target = i < (liveW < workerTarget ? liveW + 1 : liveW - 1) ? 1 : 0));
          if (liveApp().length !== sim.lastApp || liveWorkers().length !== sim.lastWorkers) {
            sim.lastApp = liveApp().length;
            sim.lastWorkers = liveWorkers().length;
            rebuildWires();
          }
        }
        sim.queue = Math.max(0, Math.min(400, sim.queue + (L * 1.25 - liveWorkers().length * 6) * dt));
        const queued = Math.min(MAX_TOKENS, Math.ceil(sim.queue / 8));
        tokens.forEach((m, i) => (m.visible = i < queued));
        for (const w of workerReplicas) w.pivot.rotation.z -= dt * (0.6 + L * 0.06);
        clock += dt;
        for (let i = schedule.length - 1; i >= 0; i--) {
          const e = schedule[i];
          if (e.at > clock) continue;
          e.cell.heat = 1;
          e.cell.tint = e.tint;
          schedule.splice(i, 1);
        }
        for (const c of [...partCells, ...ramChips]) {
          c.heat = Math.max(0, c.heat - dt * 3.5);
          c.mat.color.copy(c.rest ?? idle).lerp(c.tint ?? amber, c.heat);
          c.show(c.heat);
        }
        appReplicas.forEach((r) => spring(r, dt));
        workerReplicas.forEach((r) => spring(r, dt));

        sim.spawnDebt += dt * (6 + L * 5.5);
        while (sim.spawnDebt > 1) {
          spawn();
          sim.spawnDebt -= 1;
        }
        if (clock < sim.floodUntil) {
          sim.botDebt += dt * 45;
          while (sim.botDebt > 1) {
            spawnBot();
            sim.botDebt -= 1;
          }
        }
        sim.flush = Math.max(0, sim.flush - dt / 7);
        if (sim.down >= 0 && clock > sim.downUntil) {
          setRegion(sim.down, true);
          sim.down = -1;
        }
        sim.served += L * 20 * dt;
        for (let i = 0; i < MAX_PARTICLES; i++) {
          const p = particles[i];
          if (!p.alive) continue;
          p.t += (dt * p.speed) / Math.max(0.6, p.route[p.seg].distanceTo(p.route[p.seg + 1]) * 0.55);
          if (p.t >= 1) {
            p.t = 0;
            p.seg += 1;
            const reached = p.stops[p.seg];
            if (reached === "edge") edgeServe();
            else if (reached === "gateway" && p.bot) {
              counts.rejected += 1;
              if (Math.random() < 0.3) light(searchRow, 0, readWhite);
            } else if (reached === "gateway") {
              counts.allowed += 1;
              if (lights()) gatewayHit();
            }
            else if (reached === "cache" && lights()) access(p.stops[p.seg + 1] === "db");
            if (p.seg >= p.route.length - 1) {
              p.alive = false;
              positions[i * 3 + 1] = -999;
              continue;
            }
          }
          const from = p.route[p.seg];
          const to = p.route[p.seg + 1];
          const x = from.x + (to.x - from.x) * p.t;
          const y = from.y + (to.y - from.y) * p.t;
          const z = from.z + (to.z - from.z) * p.t;
          positions[i * 3] = x;
          positions[i * 3 + 1] = inside(x, y, z) ? -999 : y;
          positions[i * 3 + 2] = z;
        }
        pointsGeo.attributes.position.needsUpdate = true;

        warm.intensity = 3 + Math.min(10, L * 0.25);
        const ease = Math.min(1, dt * 2);
        world.rotation.y += (-0.2 + pointer.x * 0.1 + Math.sin(t * 0.11) * 0.17 - world.rotation.y) * ease;
        world.rotation.x += (pointer.y * -0.03 - world.rotation.x) * ease;

        world.updateMatrixWorld();
        aim();
        const glide = 1 - Math.exp(-dt * 2.4);
        camPos.lerp(wantPos, glide);
        camLook.lerp(wantLook, glide);
        off.lerp(wantOff, glide);
      };

      const render = () => {
        camera.setViewOffset(frame.w, frame.h, off.x, off.y, frame.w, frame.h);
        camera.position.copy(camPos);
        camera.lookAt(camLook);
        world.updateMatrixWorld();
        raycaster.setFromCamera(pointer, camera);
        const hit = pointer.lengthSq() > 0 ? raycaster.intersectObjects(meshes, false)[0] : undefined;
        setHover((hit?.object.userData.id as NodeId | undefined) ?? null);
        paint();
        renderer.render(scene, camera);
        placeLabels();
      };

      let raf = 0;
      let last = performance.now();
      let visible = true;
      let lastReadout = 0;
      let lastCount = 0;
      const publish = () => {
        const L = load();
        // Particles stand in for many requests each; scale arrivals so they add up to the req/s readout.
        const per = (L * 20) / (6 + L * 5.5);
        const span = clock - lastCount;
        if (span > 0.05) {
          const ease = (was: number, n: number) => was + ((n * per) / span - was) * 0.2;
          rates.regions = rates.regions.map((was, i) => ease(was, counts.regions[i]));
          rates.allowed = ease(rates.allowed, counts.allowed);
          rates.rejected = ease(rates.rejected, counts.rejected);
          rates.db = ease(rates.db, counts.db);
          counts.regions = [0, 0, 0];
          counts.allowed = counts.rejected = counts.db = 0;
          lastCount = clock;
        }
        const r: Readout = {
          throughput: Math.round(L * 20),
          app: liveApp().length,
          queue: Math.round(sim.queue),
          workers: liveWorkers().length,
          regions: rates.regions.map(Math.round),
          allowed: Math.round(rates.allowed),
          rejected: Math.round(rates.rejected),
          hitRate: Math.round((1 - (0.25 + 0.75 * sim.flush)) * 100),
          dbReads: Math.round(rates.db),
          served: Math.round(sim.served),
          elapsed: Math.floor(clock),
        };
        setReadout(r);
        callbacks.current.onReadout(r);
      };
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (!visible || document.hidden) {
          last = now;
          return;
        }
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        step(dt, now / 1000);
        render();
        if (now - lastReadout > 220) {
          lastReadout = now;
          publish();
        }
      };

      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(host);

      if (still) {
        // Settled frames only: the fleet sized for the current load, requests frozen mid-flight,
        // and the camera cutting (never gliding) to whatever the page focuses.
        for (let i = 0; i < 260; i++) spawn(true);
        const settle = () => {
          const L = loadRef.current ?? 10;
          const apps = Math.min(MAX_APP, Math.max(2, Math.round(2 + L * 0.17)));
          const workers = Math.min(MAX_WORKERS, Math.max(1, Math.ceil((L * 1.25) / 6)));
          sim.queue = Math.max(0, L * 1.25 - workers * 6) * 4;
          appReplicas.forEach((r, i) => (r.target = i < apps ? 1 : 0));
          workerReplicas.forEach((r, i) => (r.target = i < workers ? 1 : 0));
          rebuildWires();
          step(0, 0);
          for (const r of [...appReplicas, ...workerReplicas]) {
            r.scale = r.target;
            r.vel = 0;
            r.group.scale.setScalar(Math.max(0.0001, r.scale));
            r.group.visible = r.scale > 0.01;
          }
          world.updateMatrixWorld();
          aim();
          camPos.copy(wantPos);
          camLook.copy(wantLook);
          off.copy(wantOff);
          render();
          publish();
        };
        settle();
        const timer = window.setInterval(settle, 400);
        cleanup = () => window.clearInterval(timer);
      } else {
        for (let i = 0; i < 180; i++) spawn(true);
        raf = requestAnimationFrame(loop);
        if (commandRef) commandRef.current = run;
      }

      const prev = cleanup;
      cleanup = () => {
        prev();
        if (commandRef) commandRef.current = null;
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onMove);
        window.removeEventListener("pointerout", onLeave);
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [loadRef, focusRef, bandRef, commandRef]);

  return (
    <div className="absolute inset-0">
      <div ref={mount} className="absolute inset-0" aria-hidden />
      {mode === "none" && <StillDiagram />}
      {(mode === "live" || mode === "still") && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {NODES.map((n) => (
            <div
              key={n.id}
              ref={(el) => {
                labels.current[n.id] = el;
              }}
              className={`absolute top-0 left-0 font-mono text-[11px] whitespace-nowrap transition-colors duration-300 md:text-[12px] ${
                lit.includes(n.id) ? "text-signal" : "text-ink-soft"
              }`}
            >
              {n.label}
              {n.id === "app" && <span className="text-ink-faint"> ×{readout.app}</span>}
              {n.id === "workers" && <span className="text-ink-faint"> ×{readout.workers}</span>}
              {hover === n.id && <span className="block text-ink-soft">{n.role}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Shown when WebGL is unavailable: the same graph, flat.
function StillDiagram() {
  const flat = (id: NodeId) => {
    const n = NODES.find((x) => x.id === id)!;
    return { x: 60 + (n.pos[0] + 7.2) * 62, y: 190 + n.pos[2] * 56 };
  };
  const links: [NodeId, NodeId][] = [
    ["clients", "edge"],
    ["edge", "gateway"],
    ["gateway", "app"],
    ["app", "cache"],
    ["app", "queue"],
    ["queue", "workers"],
    ["workers", "db"],
    ["cache", "db"],
  ];
  return (
    <svg
      viewBox="0 0 1100 400"
      preserveAspectRatio="xMaxYMid meet"
      className="absolute top-[10%] right-0 h-[40%] w-full md:top-[12%] md:h-[52%] md:w-[62%]"
      role="img"
      aria-label="System diagram: clients, edge, API gateway, services, cache, queue, workers and database."
    >
      {links.map(([a, b]) => {
        const p = flat(a);
        const q = flat(b);
        return <line key={a + b} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="var(--rule-strong)" strokeWidth={2} />;
      })}
      {NODES.map((n) => {
        const p = flat(n.id);
        return (
          <g key={n.id}>
            <rect x={p.x - 22} y={p.y - 22} width={44} height={44} fill="var(--raised)" stroke="var(--steel)" />
            <text x={p.x} y={p.y - 34} textAnchor="middle" className="fill-ink-soft font-mono text-[13px]">
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
