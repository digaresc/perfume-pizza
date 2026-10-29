# 🐎 How to race

1. **Fork** this repo (or get added as a collaborator and just branch).
2. `npm install && npm run dev` → http://localhost:3000 (CRM login: `chef` / `margherita-no-5`).
3. Make a **small** change to the Pizza-Perfume CRM — a new field, a page, a joke, a fix.
4. Open a PR against **`main`**.
5. The 👹 **Certified Multi-Certification & Conservative Code Reviewer** (a GitHub Action) will
   insult your code style and then **force-merge it**. Your horse moves one step on the projector.
6. Pull `main`, repeat. Most merged PRs at the end of the 1h20 wins.

### Tips

- **Small PRs win.** Every merge to `main` can cause conflicts for everyone else. If the Monster says
  "MERGE CONFLICT", merge `main` into your branch, push, and it will try again.
- Draft PRs are ignored until you mark them ready.
- PRs touching `.github/workflows/**` can't be auto-merged.
- Only merges during the race window count.

### Ideas if you're stuck

- Add a "scent intensity" column to customers
- Add a create-customer form (in-memory is fine)
- A product detail page at `/crm/products/[sku]`
- Dark mode for the CRM. The pizza deserves it.
- Search / filter customers by favorite scent
- A 404 page with an ASCII calzone
