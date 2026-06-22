# ============================================================================
# OWL Command Center — complete the in-progress merge + push
# Run from PowerShell:  .\complete-merge.ps1
# Conflicts have been resolved on disk. This verifies no markers remain,
# stages (excluding .env), completes the merge commit, builds, and pushes.
# No force-push. PAUSE OneDrive sync first to avoid file-lock prompts.
# ============================================================================
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
function Abort($m) { Write-Host "`nABORT: $m" -ForegroundColor Red; exit 1 }

if (Get-Process git, git-remote-https -ErrorAction SilentlyContinue) { Abort "A git process is running. Close it + GitHub Desktop, then re-run." }
if (Test-Path ".git\index.lock") { Remove-Item ".git\index.lock" -Force; Write-Host "Cleared stale index.lock" -ForegroundColor Green }

Write-Host "== 1. Files git still considers unmerged ==" -ForegroundColor Cyan
git diff --name-only --diff-filter=U

Write-Host "`n== 2. Scan for any leftover conflict markers ==" -ForegroundColor Cyan
$markers = git grep -n -E "(<<<<<<<|>>>>>>>)" -- . 2>$null
if ($markers) {
  Write-Host "Conflict markers still present in:" -ForegroundColor Red
  $markers
  Abort "Send Claude this list - those files still need resolving. Did NOT commit."
}
Write-Host "No conflict markers found." -ForegroundColor Green

Write-Host "`n== 3. Stage resolved files (env force-excluded) ==" -ForegroundColor Cyan
git add -A
foreach ($f in @(".env.local", ".env", ".env.production", ".env.development.local")) { git restore --staged $f 2>$null }
$still = git diff --name-only --diff-filter=U
if ($still) { Abort "Still unmerged after staging: $still" }

Write-Host "`n== 4. Secret scan of staged content ==" -ForegroundColor Cyan
$staged = git diff --cached
foreach ($p in @('re_[A-Za-z0-9_]{20,}','SUPABASE_SERVICE_ROLE_KEY\s*=\s*ey','sb_secret_[A-Za-z0-9]','eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}','CRON_SECRET\s*=\s*[A-Fa-f0-9]{32}')) {
  if ($staged | Select-String -Pattern $p) { Abort "Possible secret in staged content (/$p/). Remove and re-run." }
}
Write-Host "No secrets staged; .env files excluded." -ForegroundColor Green

Write-Host "`n== 5. Complete the merge commit ==" -ForegroundColor Cyan
if (-not (git config user.name))  { git config user.name  "Rick Lofton" }
if (-not (git config user.email)) { git config user.email "rickoflv@gmail.com" }
git commit -m "Merge remote main into OWL Command Center CRM deployment"
if ($LASTEXITCODE -ne 0) { Abort "Commit failed." }

Write-Host "`n== 6. Build gate (post-merge) ==" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Abort "Build failed after merge. Paste the errors to Claude (likely a cart/account integration detail)." }
Write-Host "Build passed." -ForegroundColor Green

Write-Host "`n== 7. Push (origin main, no force) ==" -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) { Abort "Push failed - auth needed, or remote moved again." }

Write-Host "`nDONE - merge pushed. Vercel will auto-deploy." -ForegroundColor Green
git log --oneline --decorate -3
