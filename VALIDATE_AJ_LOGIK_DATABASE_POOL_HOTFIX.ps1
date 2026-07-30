$ErrorActionPreference = 'Stop'

Write-Host 'Clearing Next.js build cache...'
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

Write-Host 'Generating Prisma Client...'
npx prisma generate
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host 'Running TypeScript validation...'
npm run typecheck
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host 'Running ESLint...'
npm run lint
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host 'Building the production application...'
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host 'AJ Logik database-pool hotfix validated successfully.'
