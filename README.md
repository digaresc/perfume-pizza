# 🍕 Pizza-Perfume Store — Coding Party Edition

A deliberately absurd CRM for a store that sells pizzas, perfumes, and pizza-perfumes, plus a live
**cyberpunk circus hippodrome** that turns merged PRs into galloping ASCII horses.

**Hackers: read [CONTRIBUTING.md](CONTRIBUTING.md).**

| Route | What |
| --- | --- |
| `/` (also `/race`) | Projector dashboard: horses, countdown, leaderboard, Monster Code Reviewer |
| `/login`, `/crm`, `/crm/products` | The CRM boilerplate (cookie login) |
| `/api/race` | JSON race state (`?start=<ISO>` to override the start, `?demo=1` for fake data) |
| `/api/github/webhook` | Optional GitHub webhook, makes merges show up instantly |

## How it works

```
hacker opens PR ──► GitHub Action "Monster Code Review" (pull_request_target)
                      ├─ posts 1–2 hyper-pedantic complaints (lib/monster.mjs)
                      └─ squash-merges the PR
                                   │
dashboard polls /api/race every 8s ◄─ GitHub REST API (merged PRs in the race window)
   └─ new merge ⇒ horse gallops one step, Monster re-enacts the review on screen
```

- **Source of truth is GitHub itself** — no database. Each merged PR (by a non-bot) inside the
  80-minute window = one step. Open PRs show in the "under inspection" ticker.
- Complaints are deterministic per PR (seeded by PR number + author), so the GitHub comment and
  the projector say the same thing.
- Without `GITHUB_REPO` (and outside Vercel) the dashboard runs a **demo race** so you can preview it.

## Host setup

```bash
cp .env.example .env.local   # fill in GITHUB_REPO and (ideally) GITHUB_TOKEN
npm install
npm run dev
```

### Environment variables

| Var | Purpose |
| --- | --- |
| `GITHUB_REPO` | `owner/name`. Falls back to Vercel's git env vars when the project is git-connected. |
| `GITHUB_TOKEN` | Any token with read access to public repos. Raises the API limit 60 → 5000/h. **Set this for the event.** |
| `EVENT_START` | ISO timestamp the race starts, e.g. `2026-10-29T18:00:00Z`. Race lasts 80 min. Or use `/?start=…`. |
| `TRACK_LENGTH` | Steps to the finish line (default 10). |
| `GITHUB_WEBHOOK_SECRET` | Optional; secret for `/api/github/webhook`. |
| `ADMIN_USER` / `ADMIN_PASSWORD` / `AUTH_SECRET` | CRM login. Defaults: `chef` / `margherita-no-5`. |

### Starting the race

Easiest: open the projector at `https://<your-app>.vercel.app/?start=2026-10-29T18:00:00Z`.
Or set `EVENT_START` in Vercel and redeploy.

### Deploying

```bash
npx vercel link
npx vercel env add GITHUB_TOKEN production
npx vercel --prod
```

### Optional: instant updates via webhook

Repo → Settings → Webhooks → Add: payload URL `https://<app>/api/github/webhook`, content type
`application/json`, secret = `GITHUB_WEBHOOK_SECRET`, events: *Pull requests*. Without it the
dashboard still updates within ~10s (with a token) or ~45s (without).
