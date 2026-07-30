# AJ Logik Release Candidate — Final Fixes

Extract this archive directly into the AJ Logik project root and overwrite matching files.
The ZIP is root-ready: its top level contains `app/`, `components/`, `features/`, and `providers/`.

## Validation

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

npx prisma generate
npm run typecheck
npm run lint
npm run build
```

This package does not include a Prisma migration. The shopping-list publication migration from the preceding sequence has already been applied.

For browser testing:

```powershell
npm run dev:webpack
```

Test these areas:

- Customer Dashboard product rails: one full-width rail per row, working arrows, mouse/touch scrolling.
- Product cards from Dashboard, Store, Search, Cart, Wishlist, Promotions, lists, and recommendations: open in the Discovery Hub without leaving the current page.
- Store: Approved Community Plans appears before the main Store feed.
- Admin Category Studio: save a category, then confirm Home, Store, search filters, and category navigation refresh.
- Admin Overview: metric cards, todos, and activity rows navigate to useful destinations.
- Admin save/approve/reject actions: success or unsuccessful feedback toast.
- Customer cart, wishlist, shopping-list, and settings mutations: action feedback.

After the local build passes:

```powershell
git add .
git commit -m "Finalize dashboard rails, catalog sync and Hub-first commerce"
git push origin main
```

A connected Vercel project should then start its normal deployment from `main`.
