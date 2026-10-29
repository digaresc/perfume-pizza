import { horseName, reviewPullRequest } from "./monster.mjs";

export const RACE_MINUTES = 80;

export interface Hacker {
  login: string;
  avatarUrl: string;
  horseName: string;
  merged: number;
  open: number;
  lastMergedAt: string | null;
}

export interface Merge {
  number: number;
  title: string;
  author: string;
  url: string;
  mergedAt: string;
  complaints: string[];
  verdict: string;
}

export interface OpenPr {
  number: number;
  title: string;
  author: string;
  url: string;
}

export interface RaceState {
  repo: string | null;
  demo: boolean;
  error: string | null;
  now: string;
  eventStart: string | null;
  eventEnd: string | null;
  trackLength: number;
  hackers: Hacker[];
  merges: Merge[];
  openPrs: OpenPr[];
}

interface GhPull {
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  merged_at: string | null;
  draft?: boolean;
  user: { login: string; avatar_url: string; type: string };
  head: { ref: string };
  base: { ref: string };
}

export function repoName(): string | null {
  if (process.env.GITHUB_REPO) return process.env.GITHUB_REPO;
  const { VERCEL_GIT_REPO_OWNER: owner, VERCEL_GIT_REPO_SLUG: slug } = process.env;
  return owner && slug ? `${owner}/${slug}` : null;
}

export function trackLength(): number {
  return Math.max(3, Number(process.env.TRACK_LENGTH) || 10);
}

// Per-instance cache so a room full of projectors/phones doesn't burn the GitHub rate limit.
let cache: { at: number; pulls: GhPull[] } | null = null;

export function invalidateRaceCache() {
  cache = null;
}

async function fetchPulls(repo: string): Promise<GhPull[]> {
  const ttl = process.env.GITHUB_TOKEN ? 8_000 : 45_000;
  if (cache && Date.now() - cache.at < ttl) return cache.pulls;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const urls = [
    `https://api.github.com/repos/${repo}/pulls?state=open&per_page=100`,
    `https://api.github.com/repos/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=1`,
    `https://api.github.com/repos/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=2`,
  ];
  const pages = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url, { headers, cache: "no-store" });
      if (!res.ok) throw new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 120)}`);
      return (await res.json()) as GhPull[];
    }),
  );
  const pulls = pages.flat();
  cache = { at: Date.now(), pulls };
  return pulls;
}

function eventWindow(startOverride?: string | null) {
  const raw = startOverride || process.env.EVENT_START;
  const start = raw ? new Date(raw) : null;
  if (!start || Number.isNaN(start.getTime())) return { start: null, end: null };
  return { start, end: new Date(start.getTime() + RACE_MINUTES * 60_000) };
}

function buildState(
  pulls: GhPull[],
  base: Pick<RaceState, "repo" | "demo" | "error" | "eventStart" | "eventEnd">,
  start: Date | null,
  end: Date | null,
): RaceState {
  const humans = pulls.filter((p) => p.user.type !== "Bot");
  const inWindow = (iso: string) => {
    const t = new Date(iso).getTime();
    return (!start || t >= start.getTime()) && (!end || t <= end.getTime());
  };
  const merged = humans
    .filter((p) => p.merged_at && inWindow(p.merged_at))
    .sort((a, b) => b.merged_at!.localeCompare(a.merged_at!));
  const open = humans.filter((p) => p.state === "open" && !p.draft);

  const hackers = new Map<string, Hacker>();
  const hacker = (u: GhPull["user"]) => {
    let h = hackers.get(u.login);
    if (!h) {
      h = { login: u.login, avatarUrl: u.avatar_url, horseName: horseName(u.login), merged: 0, open: 0, lastMergedAt: null };
      hackers.set(u.login, h);
    }
    return h;
  };
  for (const p of merged) {
    const h = hacker(p.user);
    h.merged++;
    if (!h.lastMergedAt || p.merged_at! > h.lastMergedAt) h.lastMergedAt = p.merged_at;
  }
  for (const p of open) hacker(p.user).open++;

  return {
    ...base,
    now: new Date().toISOString(),
    trackLength: trackLength(),
    // Most merges first; ties go to whoever reached that count earliest.
    hackers: [...hackers.values()].sort(
      (a, b) => b.merged - a.merged || (a.lastMergedAt ?? "~").localeCompare(b.lastMergedAt ?? "~") || a.login.localeCompare(b.login),
    ),
    merges: merged.slice(0, 25).map((p) => ({
      number: p.number,
      title: p.title,
      author: p.user.login,
      url: p.html_url,
      mergedAt: p.merged_at!,
      ...reviewPullRequest({ number: p.number, author: p.user.login, title: p.title, branch: p.head.ref }),
    })),
    openPrs: open.map((p) => ({ number: p.number, title: p.title, author: p.user.login, url: p.html_url })),
  };
}

// Fake but steadily progressing race, so the projector has something to show locally.
function demoPulls(start: Date): GhPull[] {
  const logins = ["neon-nonna", "patchouli-pete", "crustpunk", "oud-dev", "basil-byte", "mozz-0x"];
  const elapsed = Math.max(0, Date.now() - start.getTime());
  const pulls: GhPull[] = [];
  let n = 1;
  logins.forEach((login, i) => {
    const every = (5 + i * 1.7) * 60_000;
    const user = { login, avatar_url: `https://api.dicebear.com/9.x/bottts/svg?seed=${login}`, type: "User" };
    for (let t = every; t <= elapsed; t += every) {
      pulls.push({
        number: n++,
        title: `Add ${["oregano", "bergamot", "garlic", "musk"][n % 4]} notes to the CRM`,
        html_url: "#",
        state: "closed",
        merged_at: new Date(start.getTime() + t).toISOString(),
        user,
        head: { ref: `feat/${login}-${n}` },
        base: { ref: "main" },
      });
    }
    pulls.push({ number: 900 + i, title: "WIP: more cheese", html_url: "#", state: "open", merged_at: null, user, head: { ref: "wip" }, base: { ref: "main" } });
  });
  return pulls;
}

export async function getRaceState(opts: { start?: string | null; demo?: boolean } = {}): Promise<RaceState> {
  const repo = repoName();
  let { start, end } = eventWindow(opts.start);

  if (opts.demo || !repo) {
    if (!start) {
      // Demo race restarts every 80 minutes.
      const span = RACE_MINUTES * 60_000;
      start = new Date(Math.floor(Date.now() / span) * span);
      end = new Date(start.getTime() + span);
    }
    return buildState(
      demoPulls(start),
      { repo, demo: true, error: null, eventStart: start.toISOString(), eventEnd: end!.toISOString() },
      start,
      end,
    );
  }

  const base = { repo, demo: false, eventStart: start?.toISOString() ?? null, eventEnd: end?.toISOString() ?? null };
  try {
    return buildState(await fetchPulls(repo), { ...base, error: null }, start, end);
  } catch (e) {
    return buildState(cache?.pulls ?? [], { ...base, error: (e as Error).message }, start, end);
  }
}
