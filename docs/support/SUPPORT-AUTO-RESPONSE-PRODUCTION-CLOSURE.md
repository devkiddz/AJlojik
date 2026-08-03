# AJ Logik Support Auto Response

## Phase 6 — Production Closure and Live Validation

Phase 6 closes the AJ Support Auto Response milestone without changing runtime behavior or database structure.

## Phase 6 adds

- A complete static production-contract verifier.
- A public/unauthenticated live-boundary verifier.
- One local release command.
- Deployment sequencing.
- Authenticated customer and administrator smoke tests.
- Rollback boundaries.
- Milestone closure evidence.

## No runtime mutation

Phase 6 does not change matching, context resolution, human handoff, Knowledge Studio behavior or database authority. It adds no migration and performs no seed.

## Install

```powershell
node .\apply.support-auto-response-p6-production-closure.mjs
Remove-Item .\apply.support-auto-response-p6-production-closure.mjs
```

## Clean temporary artifacts

```powershell
Remove-Item .\.support-auto-response-p5-payload -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .\.ajlojik-install-backups -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .\AJLogik-Support-Runtime-Audit -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .\AJLogik-Support-Runtime-Audit.zip -Force -ErrorAction SilentlyContinue
Remove-Item .\collect.support-runtime-audit.mjs -Force -ErrorAction SilentlyContinue
Get-ChildItem -Force -Filter "apply.support-*.mjs" | Remove-Item -Force
```

## Local release verification

```powershell
npm run verify:support-auto-response-release
```

This runs every Support verifier, TypeScript, ESLint, the final production contract, and both working-tree and staged whitespace checks.

ESLint warnings outside this milestone may remain, but ESLint must report zero errors.

## Prisma verification

```powershell
npx prisma format
npx prisma validate
npx prisma migrate status
```

Never run `prisma migrate reset`.

The existing production build command deploys pending Prisma migrations before the Next.js build. Run it locally only when `DATABASE_URL` points to the intended local or staging database:

```powershell
npm run build
```

## Inspect and stage the complete milestone

```powershell
git status --short
git --no-pager diff --stat
git diff --check
```

```powershell
git add -- `
  "package.json" `
  "lib/prisma.ts" `
  "prisma/schema.prisma" `
  "prisma/migrations/20260803090000_add_support_knowledge_foundation/migration.sql" `
  "prisma/migrations/20260803124500_upgrade_support_knowledge_resolution/migration.sql" `
  "prisma/seeds/support-knowledge.seed.ts" `
  "app/api/support" `
  "app/api/admin/support/knowledge" `
  "app/admin/support/knowledge" `
  "features/support" `
  "scripts/verify-support-knowledge-foundation.mjs" `
  "scripts/verify-support-knowledge-runtime.ts" `
  "scripts/verify-support-guide.ts" `
  "scripts/verify-support-guide-context.ts" `
  "scripts/verify-support-guide-handoff.ts" `
  "scripts/verify-support-knowledge-studio.ts" `
  "scripts/verify-support-auto-response-production.mjs" `
  "scripts/verify-support-auto-response-live-boundary.mjs" `
  "docs/support/SUPPORT-AUTO-RESPONSE-PRODUCTION-CLOSURE.md" `
  "docs/support/SUPPORT-AUTO-RESPONSE-LIVE-SMOKE-MATRIX.md"
```

```powershell
git --no-pager diff --cached --stat
git --no-pager diff --cached --name-status
git diff --cached --check
```

Commit:

```powershell
git commit -m "feat(support): complete guided support intelligence"
```

Push:

```powershell
git push origin main
```

## Vercel deployment verification

Confirm the build log shows Prisma migration deployment followed by the Next.js production build. Stop closure if there is a migration failure, Prisma client error, TypeScript error or Support route build failure.

Do not reseed automatically when the production runtime already has the intended approved knowledge.

## Public production boundary test

```powershell
$env:SUPPORT_BASE_URL="https://YOUR-PRODUCTION-DOMAIN"
npm run verify:support-auto-response-live-boundary
Remove-Item Env:\SUPPORT_BASE_URL
```

The script performs only unauthenticated checks. It does not create cases, feedback records or knowledge entries.

## Production data verification

After pulling production environment variables:

```powershell
npx vercel env pull .vercel/.env.production.local --environment=production
node --env-file=.vercel/.env.production.local ./node_modules/tsx/dist/cli.mjs scripts/verify-support-knowledge-runtime.ts
```

Investigate unexpected workspace, entry or example counts before closing.

## Authenticated live smoke

Complete:

```text
docs/support/SUPPORT-AUTO-RESPONSE-LIVE-SMOKE-MATRIX.md
```

Record the deployment URL, commit, deployment ID, migration status, knowledge inventory, testers, latency, defects and closure decision.

## Rollback

For an application regression:

1. Stop further knowledge publishing.
2. Redeploy the last known-good Vercel commit.
3. Preserve Support interactions, cases, feedback and audit events.
4. Do not run `prisma migrate reset`.
5. Do not edit an already-applied migration.
6. Archive faulty Support Knowledge instead of deleting production history.
7. Correct forward with a new migration only when a database correction is required.

## Closure criteria

The milestone closes only when local verification, production deployment, public boundaries, authenticated customer smoke, human handoff and Knowledge Studio governance all pass with no critical or high-severity defect.
