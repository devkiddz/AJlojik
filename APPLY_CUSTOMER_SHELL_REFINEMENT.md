# Apply the Customer Shell Experience Refinement

Extract this archive into the AJ Logik project root and overwrite matching files.

No Prisma schema change or migration is included.

The package implements:

- icon-only collapsed Discovery Hub controls;
- contextual Back and History controls in the global customer navbar;
- one persistent Experience Stack across customer route changes;
- a globally sticky customer navigation bar;
- a short-screen-safe User Action Tray with a scrollable body and fixed authentication footer;
- fluid application-scale tokens for typography, spacing, controls and surfaces;
- a stable ID-driven Store Banner carousel with per-source media failure handling;
- a Webpack development fallback and disabled Turbopack filesystem cache for development.

Run:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

npx prisma generate
npm run typecheck
npm run lint
npm run build
```

For stable local visual testing while Turbopack is being monitored:

```powershell
npm run dev:webpack
```

The Admin control-panel layout and typography are intentionally not changed in this package. They are the next UI sequence after this customer-shell validation.
