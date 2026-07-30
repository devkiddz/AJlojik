# AJ Logik — Shopping List Publication & Journey Sequence

Extract this archive directly into the AJ Logik project root and overwrite matching files.

## Required validation

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npx prisma generate
npm run typecheck
npm run lint
npm run build
```

`npm run build` already runs `prisma migrate deploy`, so it deploys the included migration before Next.js builds.

## Functional test sequence

1. Sign in and open `/account`.
2. Confirm Experience Journey carousel arrows move between cards.
3. Open each journey card and confirm its `/account/journey/...` destination.
4. Open `/account/lists`, create a list, then use **Add products**.
5. Add at least one product and confirm success/error feedback appears.
6. Toggle the list from **Private** to **In review**.
7. Confirm the list does not appear in the Store while pending.
8. Open `/admin/approvals` as an authorized administrator and approve it.
9. Refresh `/store`; the list should appear under **Approved community plans**.
10. Edit an approved list. It should return to review and disappear from the Store until re-approved.
11. Withdraw a list to return it to private visibility.

## Important

- This sequence includes a Prisma migration.
- Existing React effect and legacy image lint warnings may remain. No new lint error is intended.
- The public Store API only returns active lists with `visibility = SHARED` and `publicationStatus = APPROVED`.
