$expected = @(
  'features/admin/categories/CategoryComposer.tsx',
  'features/admin/categories/actions.ts',
  'features/admin/components/CategoryComposer.tsx'
)

$results = foreach ($file in $expected) {
  [PSCustomObject]@{
    File = $file
    Present = Test-Path $file
  }
}

$results | Format-Table -AutoSize

$missing = $results | Where-Object { -not $_.Present }
if ($missing) {
  Write-Error 'Category Studio hotfix is incomplete. Extract the ZIP into the AJ Logik project root.'
  exit 1
}

Write-Host 'Category Studio hotfix files are present.' -ForegroundColor Green
