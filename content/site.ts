import type { NodeId } from "@/components/system-scene";

// Everything a visitor reads on the landing page lives here.
// Values wrapped in [brackets] are placeholders: replace them with real content before shipping.

export type LineId = "a" | "b" | "c";

export type Station = {
  label: string;
  body: string;
};

export const firstEmail = [
  "What you're building, and who uses it.",
  "What's hard about it: scale, cost, speed of change, or a deadline.",
  "When you need it, and what's already in place.",
];

export type CaseLine = {
  id: LineId;
  code: string;
  name: string;
  client: string;
  summary: string;
  stack: string[];
  stations: Station[];
};

export const person = {
  name: "Ankit Nakarmi",
  role: "Software Engineer & Solutions Architect",
  availability: "[Availability, e.g. booking projects from January]",
  email: "ankit.nakarmi23@gmail.com",
  linkedin: "https://www.linkedin.com/in/ankit-nakarmi-3ba89b19a",
  github: "https://github.com/Nakarmi23",
};

// Until a real address is set, the visible email reads as a placeholder.
export const emailLabel = person.email.endsWith("@example.com") ? `[${person.email}]` : person.email;

export const profileLinks = [
  { label: "LinkedIn", href: person.linkedin },
  { label: "GitHub", href: person.github },
];

// Ordered along the path a request takes; each names the part of the system it covers.
export const capabilities: { name: string; detail: string; nodes: NodeId[] | null }[] = [
  {
    name: "Full-stack build",
    detail: "Front end to database, written against the agreed design, so the client is built for the system behind it.",
    nodes: ["clients"],
  },
  {
    name: "Cloud infrastructure",
    detail: "Environments, scaling and cost, set up as code. The edge takes the first hit so nothing behind it has to.",
    nodes: ["edge"],
  },
  {
    name: "API design",
    detail: "Contracts that stay stable while the product changes underneath, with auth and rate limits at the door.",
    nodes: ["gateway"],
  },
  {
    name: "System design",
    detail: "Service boundaries, failure modes, and where the load will land. Stateless services scale out; queues absorb what can wait.",
    nodes: ["app", "queue"],
  },
  {
    name: "Data modelling",
    detail: "Schemas, caching and consistency chosen for how the data is actually read.",
    nodes: ["cache", "db"],
  },
  {
    name: "Delivery & handover",
    detail: "Monitoring, docs, and a team that can run the whole thing without me.",
    nodes: null,
  },
];

// The route of an engagement, end to end. Confirm it matches how you actually work.
export const route: Station[] = [
  {
    label: "Scope",
    body: "Pin down what you need built, what already exists, and what has to be true at launch.",
  },
  {
    label: "Plan",
    body: "Sketch the system and write down the trade-offs, so the build doesn't paint you into a corner.",
  },
  {
    label: "Build",
    body: "The bulk of the work. I write the code myself, front end to database, in steps you can see running.",
  },
  {
    label: "Ship",
    body: "Put it into production with the monitoring to know it's holding up.",
  },
  {
    label: "Iterate",
    body: "Adjust to what real users do, without reworking the foundations.",
  },
  {
    label: "Hand over",
    body: "Leave docs and a team that can run it without me.",
  },
];

const placeholderStations: Station[] = [
  {
    label: "Context",
    body: "[What the client had, who used it, and what was starting to break.]",
  },
  {
    label: "Constraint",
    body: "[The hard limits: budget, deadline, legacy systems, team size, compliance.]",
  },
  {
    label: "Decision",
    body: "[The architectural call you made, and the options you rejected.]",
  },
  {
    label: "Trade-off",
    body: "[What that decision cost, and why it was worth paying.]",
  },
  {
    label: "Shipped",
    body: "[What went live, and what changed for the client afterwards.]",
  },
];

export const lines: CaseLine[] = [
  {
    id: "a",
    code: "A",
    name: "[Project A name]",
    client: "[Client or sector]",
    summary: "[One sentence: the system you designed and built, and the problem it solved.]",
    stack: ["[Tech]", "[Tech]", "[Tech]"],
    stations: placeholderStations,
  },
  {
    id: "b",
    code: "B",
    name: "[Project B name]",
    client: "[Client or sector]",
    summary: "[One sentence: the system you designed and built, and the problem it solved.]",
    stack: ["[Tech]", "[Tech]", "[Tech]"],
    stations: placeholderStations,
  },
  {
    id: "c",
    code: "C",
    name: "[Project C name]",
    client: "[Client or sector]",
    summary: "[One sentence: the system you designed and built, and the problem it solved.]",
    stack: ["[Tech]", "[Tech]", "[Tech]"],
    stations: placeholderStations,
  },
];

export type RegisterRow = {
  years: string;
  role: string;
  org: string;
  // Parent company or client, shown smaller beneath the organisation.
  note?: string;
};

export const register: RegisterRow[] = [
  { years: "Oct 2026 – Present", role: "Solutions Architect", org: "Cedar Gate Technologies", note: "an IQVIA business" },
  { years: "Mar 2025 – Oct 2026", role: "Senior Software Developer", org: "Proshore Nepal", note: "contracted to Health Catalyst" },
  { years: "Mar 2018 – Mar 2025", role: "Senior Software Developer", org: "Channakya Software Pvt. Ltd." },
  { years: "Nov 2015 – Jun 2017", role: "Junior Web Designer", org: "Freelance Unit Pvt. Ltd." },
];
