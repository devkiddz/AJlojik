# AJ Logik — Offline-safe font build hotfix

This hotfix removes `next/font/google` from `app/layout.tsx` and supplies system-font stacks through the existing CSS variables in `app/globals.css`.

It fixes builds that fail when Google Fonts cannot be downloaded during `next build`.

Apply at the project root and overwrite the two files, then run:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run typecheck
npm run build
```

No Prisma migration is included.
