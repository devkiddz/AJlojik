# AJ Logik — Vercel Database Pool Hotfix

## Cause

The production application was using the direct Prisma Postgres migration URL
for runtime queries. Vercel creates concurrent function instances, so direct
connections were exhausted and `prisma.shoppingList.findMany()` became the
first visible failing query.

## Apply files

Extract this ZIP into the AJ Logik project root and overwrite:

- `lib/prisma.ts`
- `prisma.config.ts`

## Required Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, configure both
Production and Preview:

```env
DATABASE_URL=postgres://USER:PASSWORD@pooled.db.prisma.io:5432/postgres?sslmode=require
DIRECT_URL=postgres://USER:PASSWORD@db.prisma.io:5432/postgres?sslmode=require
```

Get both values from **Prisma Console → Database → Connect to your database**.
Do not manually share either credential in chat.

- `DATABASE_URL` is pooled and is used by the running application.
- `DIRECT_URL` is direct and is used only by migrations and Prisma tooling.

After changing the variables, redeploy the latest production deployment.

## Validate locally

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npx prisma generate
npm run typecheck
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npm run lint
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npm run build
```

## Important

The error was not caused by `shoppingList.findMany()` itself. That query was
only the first request that attempted to obtain a connection after the direct
connection limit had already been exhausted.
