# ============================================================================
# OWL Command Center — resolve git lock + finish deploy (build already passed)
# Run from PowerShell:  .\finish-deploy.ps1
# Safely clears .git\index.lock ONLY if no git process is running, then
# stages (excluding .env), scans for secrets, commits, and pushes to origin/main.
# No force-push. No vercel CLI. No domain changes.
# ============================================================================
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
function Abort($m) { Write-Host "`nABORT: $m" -ForegroundColor Red; exit 1 }

Write-Host "== 1. Check for running git processes ==" -ForegroundColor Cyan
$gitProcs = Get-Process git, git-remote-https -ErrorAction SilentlyContinue
if ($gitProcs) {
  Write-Host "Active git processes found:" -ForegroundColor Yellow
  $gitProcs | Format-Table Id, ProcessName, StartTime -AutoSize
  Abort "A git process is active. Close it (and GitHub Desktop), then re-run. The lock was NOT deleted."
}
Write-Host "No active git processes." -ForegroundColor Green
$ghd = Get-Process "GitHubDesktop" -ErrorAction SilentlyContinue
if ($ghd) { Write-Host "NOTE: GitHub Desktop is open - close it if commit/push misbehaves." -ForegroundColor Yellow }

Write-Host "`n== 2. Clear stale lock (only because no git process is running) ==" -ForegroundColor Cyan
if (Test-Path ".git\index.lock") {
  Remove-Item ".git\index.lock" -Force
  Write-Host "Removed .git\index.lock" -ForegroundColor Green
} else {
  Write-Host "No lock file present (already cleared)." -ForegroundColor Green
}

Write-Host "`n== 3. Repo health ==" -ForegroundColor Cyan
$branch = (git branch --show-current)
if ($branch -ne "main") { Abort "Not on 'main' (on '$branch')." }
git status --short | Select-Object -First 20
git check-ignore .env.local | Out-Null
if ($LASTEXITCODE -ne 0) { Abort ".env.local is NOT gitignored - stopping to protect secrets." }

Write-Host "`n== 4. Stage (env files force-excluded) ==" -ForegroundColor Cyan
git add -A
foreach ($f in @(".env.local", ".env", ".env.production", ".env.development.local")) { git restore --staged $f 2>$null }

Write-Host "`n== 5. Secret scan of staged content ==" -ForegroundColor Cyan
$staged = git diff --cached
$patterns = @(
  're_[A-Za-z0-9_]{20,}',
  'SUPABASE_SERVICE_ROLE_KEY\s*=\s*ey',
  'sb_secret_[A-Za-z0-9]',
  'eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}',
  'CRON_SECRET\s*=\s*[A-Fa-f0-9]{32}'
)
foreach ($p in $patterns) {
  if ($staged | Select-String -Pattern $p) { Abort "Possible secret in staged content (/$p/). Remove it and re-run." }
}
Write-Host "No secrets detected in staged content." -ForegroundColor Green

Write-Host "`n== 6. Commit ==" -ForegroundColor Cyan
if (-not (git config user.name))  { git config user.name  "Rick Lofton" }
if (-not (git config user.email)) { git config user.email "rickoflv@gmail.com" }
git commit -m "Add OWL Command Center CRM, auth, newsletter, and cron system"
if ($LASTEXITCODE -ne 0) { Abort "Commit failed (nothing to commit, or identity issue)." }

Write-Host "`n== 7. Push to GitHub (origin main, no force) ==" -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) { Abort "Push failed - GitHub auth may be required (Credential Manager / browser). Re-run after authenticating." }

Write-Host "`n== DONE - pushed. Vercel will auto-deploy. ==" -ForegroundColor Green
git log -1 --oneline
