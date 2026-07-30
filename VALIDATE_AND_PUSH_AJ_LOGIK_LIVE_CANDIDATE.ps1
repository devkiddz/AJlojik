$ErrorActionPreference = 'Stop'

function Assert-LastExitCode {
  param([string]$Step)

  if ($LASTEXITCODE -ne 0) {
    throw "$Step failed with exit code $LASTEXITCODE."
  }
}

Write-Host "`nAJ Logik live-candidate validation" -ForegroundColor Cyan

if (-not (Test-Path .\package.json)) {
  throw 'Run this script from the AJ Logik project root.'
}

Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

npx prisma generate
Assert-LastExitCode 'Prisma Client generation'

npm run typecheck
Assert-LastExitCode 'TypeScript validation'

npm run lint
Assert-LastExitCode 'ESLint validation'

npm run build
Assert-LastExitCode 'Production build'

Write-Host "`nValidation passed successfully." -ForegroundColor Green
Write-Host "Brand Studio: /admin/brands"
Write-Host "Admin AI foundation: /admin/assistant"
Write-Host "Vendor AI foundation: /vendor/assistant"
Write-Host "Customer AI suggestions: /ai"
Write-Host "Theme default: device/system preference"
Write-Host "Search: stable and Hub-first"
Write-Host "Generated todos: reconciled and completed after resolution"
Write-Host "Existing product images: retained unless gallery selection is changed"
Write-Host "Discovery Hub: global product preview and Feed handoff restored"

$insideRepository = git rev-parse --is-inside-work-tree 2>$null
Assert-LastExitCode 'Git repository check'

$currentBranch = (git branch --show-current).Trim()
Assert-LastExitCode 'Git branch check'

if ($currentBranch -ne 'main') {
  throw "Current branch is '$currentBranch'. Switch to main before the production push."
}

Write-Host "`nFiles ready for commit:" -ForegroundColor Yellow
git status --short
Assert-LastExitCode 'Git status'

$confirmation = Read-Host 'Type PUSH to commit and push this validated release to origin/main'

if ($confirmation -cne 'PUSH') {
  Write-Host 'Push cancelled. The validated files remain in your working tree.' -ForegroundColor Yellow
  exit 0
}

git add -A
Assert-LastExitCode 'Git staging'

# Keep local patch instructions and helper scripts out of the production commit.
git reset -- APPLY_AJ_LOGIK_LIVE_CANDIDATE.md PACKAGE_SHA256.txt VALIDATE_AND_PUSH_AJ_LOGIK_LIVE_CANDIDATE.ps1 2>$null

git diff --cached --quiet
$hasStagedChanges = $LASTEXITCODE -ne 0

if ($hasStagedChanges) {
  git commit -m 'feat: restore global Discovery Hub and Feed product handoff'
  Assert-LastExitCode 'Git commit'
} else {
  Write-Host 'No new staged changes. Pushing the current main branch.' -ForegroundColor Yellow
}

git push origin main
Assert-LastExitCode 'Git push'

Write-Host "`nPush completed. Vercel should begin the production deployment from main." -ForegroundColor Green
