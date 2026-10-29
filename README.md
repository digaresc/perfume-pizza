# 🍕 Pizza-Perfume Store CRM — Coding Party Edition

A deliberately absurd CRM for a store that sells pizzas, perfumes, and pizza-perfumes.

**This repo is the race track of a live coding party. Read [CONTRIBUTING.md](CONTRIBUTING.md).**
Every PR you get merged moves your ASCII horse one step forward on the projector.

```bash
npm install
npm run dev     # http://localhost:3000 — login: chef / margherita-no-5
```

| Route | What |
| --- | --- |
| `/login` | Cookie login (`ADMIN_USER` / `ADMIN_PASSWORD`, see `.env.example`) |
| `/crm` | Customers |
| `/crm/products` | Products |

Built with Next.js 16 (App Router). Auth lives in `lib/auth.ts` + `proxy.ts`, seed data in `lib/data.ts`.
