import { cacheLife } from "next/cache";

// Download counts for a package from npm's public downloads API, refreshed about once a day.
// npm only answers ranges of up to 18 months, so the all-time total is summed over windows from the
// first publish. Returns null if npm can't be reached, so the page shows nothing rather than a wrong number.

export type Downloads = {
  total: number;
  year: number;
  month: number;
  // The last day npm has counted, which trails today by a few days.
  through: string;
};

const WINDOW_DAYS = 500;
const day = (d: Date) => d.toISOString().slice(0, 10);

async function point(pkg: string, period: string) {
  const res = await fetch(`https://api.npmjs.org/downloads/point/${period}/${pkg}`);
  if (!res.ok) throw new Error(`npm downloads ${res.status} for ${period}`);
  return (await res.json()) as { downloads: number; end: string };
}

export async function getDownloads(pkg: string, since: string): Promise<Downloads | null> {
  "use cache";
  cacheLife("days");

  try {
    // A range echoes back whatever end it was asked for, so ask npm for the last day it has actually counted.
    const end = (await point(pkg, "last-day")).end;
    const latest = new Date(`${end}T00:00:00Z`);
    const windows: [string, string][] = [];
    for (let from = new Date(`${since}T00:00:00Z`); day(from) <= end; ) {
      const to = new Date(from);
      to.setUTCDate(to.getUTCDate() + WINDOW_DAYS - 1);
      windows.push([day(from), day(to) < end ? day(to) : end]);
      from = new Date(to);
      from.setUTCDate(from.getUTCDate() + 1);
    }
    const y = latest.getUTCFullYear();
    const m = String(latest.getUTCMonth() + 1).padStart(2, "0");

    const [year, month, ...all] = await Promise.all([
      point(pkg, `${y}-01-01:${end}`),
      point(pkg, `${y}-${m}-01:${end}`),
      ...windows.map(([a, b]) => point(pkg, `${a}:${b}`)),
    ]);
    return {
      total: all.reduce((sum, w) => sum + w.downloads, 0),
      year: year.downloads,
      month: month.downloads,
      through: end,
    };
  } catch {
    return null;
  }
}
