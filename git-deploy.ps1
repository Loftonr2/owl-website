# ============================================================================
# OWL Command Center — safe GitHub-push deploy
# Run from PowerShell:  .\git-deploy.ps1
# Flow: verify repo -> confirm .env ignored -> BUILD MUST PASS -> stage ->
#       scan staged content for secrets -> commit -> push to origin/main.
# Vercel auto-deploys from the push. No vercel CLI, no domain changes, no force-push.
# (This is intentionally separate from the older deploy.ps1 — do not run that one.)
# ============================================================================
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Abort($msg) { Write-Host "`nABORT: $msg" -ForegroundColor Red; exit 1 }

Write-Host "== 1. Repo info ==" -ForegroundColor Cyan
if (-not (Test-Path package.json)) { Abort "package.json not found - wrong folder." }
git remote -v
$branch = (git branch --show-current)
Write-Host "Branch: $branch"
if ($branch -ne "main") { Abort "Not on 'main' (currently '$branch')." }

Write-Host "`n== 2. Secret safety: confirm .env files are ignored ==" -ForegroundColor Cyan
git check-ignore .env.local | Out-Null
if ($LASTEXITCODE -ne 0) { Abort ".env.local is NOT gitignored - stopping to protect secrets." }
Write-Host ".env.local is gitignored (good)." -ForegroundColor Green

Write-Host "`n== 3. Build gate (npm install + next build) ==" -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { Abort "npm install failed." }
npm run build
if ($LASTEXITCODE -ne 0) { Abort "BUILD FAILED. Fix the errors above, then re-run. Nothing was committed or pushed." }
Write-Host "Build passed." -ForegroundColor Green

Write-Host "`n== 4. Stage all project files ==" -ForegroundColor Cyan
git add -A
foreach ($f in @(".env.local", ".env", ".env.production", ".env.development.local")) {
  git restore --staged $f 2>$null
}

Write-Host "`n== 5. Scan staged content for real secrets ==" -ForegroundColor Cyan
$staged = git diff --cached
$patterns = @(
  're_[A-Za-z0-9_]{20,}',
  'SUPABASE_SERVICE_ROLE_KEY\s*=\s*ey',
  'sb_secret_[A-Za-z0-9]',
  'eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}',
  'CRON_SECRET\s*=\s*[A-Fa-f0-9]{32}'
)
$found = $false
foreach ($p in $patterns) {
  $hits = $staged | Select-String -Pattern $p
  if ($hits) {
    Write-Host "POSSIBLE SECRET matched /$p/ :" -ForegroundColor Red
    ($hits | Select-Object -First 2) | ForEach-Object {
      $line = $_.Line; if ($line.Length -gt 80) { $line = $line.Substring(0,80) }
      Write-Host ("  " + $line)
    }
    $found = $true
  }
}
if ($found) { Abort "Possible secret in staged content. Remove it (use process.env + .env.local) and re-run." }
Write-Host "No secrets detected in staged content." -ForegroundColor Green

Write-Host "`n== 6. Commit ==" -ForegroundColor Cyan
if (-not (git config user.name))  { git config user.name  "Rick Lofton" }
if (-not (git config user.email)) { git config user.email "rickoflv@gmail.com" }
git commit -m "Add OWL Command Center CRM, auth, newsletter, and cron system"
if ($LASTEXITCODE -ne 0) { Abort "Commit failed (nothing to commit, or identity issue)." }

Write-Host "`n== 7. Push to GitHub (origin main) ==" -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) { Abort "Push failed - GitHub auth may be required (Git Credential Manager will prompt / browser sign-in). Re-run after authenticating." }

Write-Host "`n== DONE ==" -ForegroundColor Green
Write-Host "Pushed to GitHub. Vercel will start a production deployment automatically." -ForegroundColor Green
Write-Host "Commit:" -ForegroundColor Green
git log -1 --oneline
