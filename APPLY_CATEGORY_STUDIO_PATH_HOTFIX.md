# AJ Logik Category Studio Path Hotfix

Extract this archive directly into the AJ Logik project root and overwrite matching files.

It restores the two missing Category Studio modules at the paths imported by `app/admin/categories/page.tsx` and replaces the older duplicate composer path with a compatibility re-export.

Validate:

```powershell
.\VERIFY_CATEGORY_STUDIO_HOTFIX.ps1
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run typecheck
npm run lint
npm run build
```

No Prisma migration is included.
