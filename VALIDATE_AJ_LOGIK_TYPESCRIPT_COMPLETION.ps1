$ErrorActionPreference = 'Stop'

Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

npx prisma generate
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run typecheck
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run lint
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host 'AJ Logik validation completed successfully.' -ForegroundColor Green
