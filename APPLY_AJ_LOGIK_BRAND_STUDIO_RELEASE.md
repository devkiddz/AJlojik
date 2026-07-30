# AJ Logik — Brand Studio & Release Stabilization Patch

Extract this archive directly into the AJ Logik project root and allow the listed files to overwrite existing files.

## Included

- Admin Brand Studio at `/admin/brands`
- Brand create, edit, activate and deactivate server actions
- Brand permissions and Admin navigation
- Brand Studio audit events and catalog revalidation
- Device/system theme as the default appearance
- Existing product images retained during Admin product edits
- Existing product images retained during Vendor product edits
- Clear legacy-image notice inside Product Studio
- Previous release-candidate TypeScript corrections retained

## Database

No Prisma schema change or migration is required. The existing `Brand` model is used.

## Validate and push

From the project root, run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\VALIDATE_AND_PUSH_AJ_LOGIK_BRAND_STUDIO.ps1
```

The script validates Prisma, TypeScript, ESLint and the production build first. It only commits and pushes after you type `PUSH` at the confirmation prompt.
