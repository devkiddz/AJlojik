# Apply — AJ Logik Final UI, Admin Studio and PWA Sequence

This archive is root-ready. Its first folders are `app/`, `components/`, `features/`, and `public/`; there is no wrapper directory.

## Apply

1. Stop the running development server.
2. Extract this archive directly into the AJ Logik project root.
3. Allow matching files to be overwritten.
4. Run:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

npx prisma generate
npm run typecheck
npm run lint
npm run build
```

No Prisma migration is included. Category Studio uses the existing `Category` and `Subcategory` models.

## Production/PWA test

```powershell
npm start
```

Open the secure Vercel deployment for a complete installation test. The footer now contains **Install AJ Logik**.

After this update, perform one hard refresh. If an older service worker remains in a test browser, open DevTools → Application → Service Workers, unregister it once, then reload. The new worker uses cache version `aj-logik-pwa-v2` and does not persist customer-facing navigation HTML.
