# Apply AJ Logik UI Normalization, Admin Layout and PWA Patch

Extract this archive directly into the AJ Logik project root and overwrite matching files.

No Prisma schema or migration is included.

## Validation

Stop the development server, then run:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

npx prisma generate
npm run typecheck
npm run lint
npm run build
```

Start the optimized production build for PWA testing:

```powershell
npm start
```

Use `npm run dev:webpack` only for normal development inspection. The service worker intentionally registers only in production mode to prevent stale development caches.

## Routes to inspect

```text
/
/store
/account
/cart
/sign-in
/sign-up
/offline
/admin
/admin/products
/admin/store-studio
/vendor
```

## Expected shell ownership

- Customer routes: AJ Logik Navbar + customer sidebar + adaptive Discovery Hub.
- Admin routes: AdminShell only.
- Vendor routes: VendorShell only.
- Admin login: authentication interface only.
