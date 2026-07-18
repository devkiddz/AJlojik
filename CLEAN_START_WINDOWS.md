# Clean start on Windows

Do not extract this archive over the existing AJlojik folder. Windows extraction merges folders and does not delete obsolete files, so removed legacy files will remain and TypeScript/ESLint will still scan them.

## Safe sequence

1. Stop the dev server.
2. Rename the current folder from `AJlojik` to `AJlojik-backup`.
3. Extract this archive into a new empty folder.
4. Rename the extracted folder to `AJlojik` if desired.
5. Copy only these private/local files from the backup when needed:
   - `.env`
   - `.env.local`
   - local database files that are intentionally part of your setup
6. Do not copy the old `components/`, `features/`, `providers/`, `.next/`, or `node_modules/` folders into the clean project.
7. Run:

```powershell
npm install
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npx tsc --noEmit --pretty false
npm run lint -- --max-warnings=0
npm run build
npm run dev
```

## Why the earlier local check failed

The errors referenced files that are deliberately absent from the cleaned source, including:

- `components/discovery/DiscoveryProductGrid.tsx`
- `components/store/StoreFeaturedProductsSlide.tsx`
- `features/collection/HomeCollections.tsx`
- `features/product/RelatedProductsSection.tsx`
- `providers/updateQuery.tsx`
- `components/SearchBarComponentBackup.tsx`

Those files survived because the cleaned archive was merged into the old directory rather than extracted into a new empty directory.

## Image stability

The active category, product, side-card, and single-product fallback images now use local files under `public/`. This prevents the Next.js image optimizer from timing out while fetching Unsplash images during local development.
