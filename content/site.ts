import type { Experiment, NodeId } from "@/components/system-scene";

// Everything a visitor reads on the landing page lives here.
// Values wrapped in [brackets] are placeholders: replace them with real content before shipping.

export type LineId = "a" | "b" | "c";

export type Station = {
  label: string;
  body: string;
};

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
  role: "Solutions Architect",
  email: "ankit.nakarmi23@gmail.com",
  linkedin: "https://www.linkedin.com/in/ankit-nakarmi-3ba89b19a",
  github: "https://github.com/Nakarmi23",
};

// Until a real address is set, the visible email reads as a placeholder.
export const emailLabel = person.email.endsWith("@example.com") ? `[${person.email}]` : person.email;

// handle is what the contact list shows in place of the full URL.
export const profileLinks = [
  { label: "LinkedIn", href: person.linkedin, handle: "Ankit Nakarmi" },
  { label: "GitHub", href: person.github, handle: "Nakarmi23" },
];

export type Capability = {
  name: string;
  detail: string;
  nodes: NodeId[] | null;
  // Something the visitor can set off in the simulation to watch this layer do its job.
  experiment: { id: Experiment; action: string; effect: string } | null;
};

// Ordered along the path a request takes; each names the part of the system it covers.
export const capabilities: Capability[] = [
  {
    name: "Full-stack build",
    detail: "Front end to database, so the interface is built for the system behind it.",
    nodes: ["clients"],
    experiment: {
      id: "spike",
      action: "Send a traffic spike",
      effect: "Every device sends 50× the traffic for five seconds. Watch the services scale out to meet it.",
    },
  },
  {
    name: "Cloud infrastructure",
    detail: "Environments, scaling and cost, set up as code. The edge takes the first hit so nothing behind it has to.",
    nodes: ["edge"],
    experiment: {
      id: "region",
      action: "Take a region offline",
      effect: "One edge region goes dark for six seconds. The other two pick up its traffic.",
    },
  },
  {
    name: "API design",
    detail: "Contracts that stay stable while the product changes underneath, with auth and rate limits at the door.",
    nodes: ["gateway"],
    experiment: {
      id: "flood",
      action: "Flood the gateway",
      effect: "A bot hammers GET /search for five seconds. The rate limit turns it away at the door, so no service sees it.",
    },
  },
  {
    name: "System design",
    detail: "Service boundaries, failure modes, and where the load will land. Stateless services scale out; queues absorb what can wait.",
    nodes: ["app", "queue"],
    experiment: {
      id: "kill",
      action: "Kill a service",
      effect: "One replica dies. Requests carry on through the others while the autoscaler starts a replacement.",
    },
  },
  {
    name: "Data modelling",
    detail: "Schemas, caching and consistency chosen for how the data is actually read.",
    nodes: ["cache", "db"],
    experiment: {
      id: "flush",
      action: "Flush the cache",
      effect: "Reads miss and fall through to the database until the cache warms up again.",
    },
  },
  {
    name: "Operations",
    detail: "Monitoring, alerts and docs, so whoever runs the system can see what it is doing and why.",
    nodes: null,
    experiment: null,
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

// Whole years since the earliest role in the register started, e.g. "Nov 2015 – Jun 2017" counts from Nov 2015.
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const careerStart = Math.min(
  ...register.map((row) => {
    const [month, year] = row.years.split(" – ")[0].split(" ");
    return Number(year) * 12 + months.indexOf(month);
  }),
);
const now = new Date();
export const yearsOfExperience = Math.floor((now.getFullYear() * 12 + now.getMonth() - careerStart) / 12);

// The role marked "Present" leads the site's description; the years as an engineer back it up.
export const currentRole = register.find((row) => row.years.endsWith("Present")) ?? register[0];
export const summary = `${currentRole.role} at ${currentRole.org}, backed by ${yearsOfExperience}\u00a0years as a software engineer building web software front end to database.`;
