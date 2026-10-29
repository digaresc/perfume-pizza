# 🐎 How to race

1. **Fork** this repo.
2. `npm install && npm run dev` → http://localhost:3000 (CRM login: `chef` / `margherita-no-5`).
3. Make a change to the Pizza-Perfume CRM — a new field, a page, a joke, a fix.
4. Open a PR against **`main`**.
5. The 👹 **Certified Multi-Certification & Conservative Code Reviewer** will read your diff, complain
   about it in excruciating detail, and then **force-merge it**. Your horse moves one step on the projector.
6. Pull `main`, repeat. Most merged PRs when the 1h20 countdown hits zero wins.

## Race rules (enforced by the Monster)

- **Minimum 6 meaningful changed lines** per PR. Blank lines and lockfiles don't count.
- **Cooldown of 4 minutes** between your merges. Open the next PR anyway — the Monster queues it
  and merges it when your horse has caught its breath.
- **Don't touch `.github/`** — the Monster refuses those PRs.
- Only PRs opened during the race are merged. Draft PRs are ignored until marked ready.
- **Merge conflicts**: merge `main` into your branch and push; the Monster re-checks every push.
- The Monster's judgement is final, arbitrary, and not open to appeal.

## Ideas if you're stuck

- Add a "scent intensity" column to customers
- A create-customer form (in-memory is fine)
- A product detail page at `/crm/products/[sku]`
- Dark mode for the CRM. The pizza deserves it.
- Search / filter customers by favorite scent
