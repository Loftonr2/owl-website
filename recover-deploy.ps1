# ============================================================================
# OWL Command Center — recover git state + integrate remote + push
# Run from PowerShell:  .\recover-deploy.ps1
#
# IMPORTANT — BEFORE RUNNING: pause OneDrive sync (tray icon -> Pause syncing
# -> 2 hours). OneDrive holds file locks and causes the
# "Deletion of directory ... failed" prompts during git operations.
#
# This script: aborts any stuck rebase, verifies your local commit, makes a
# backup branch, then integrates origin/main with MERGE (not rebase, so your
# admin directories are never deleted), rebuilds, and pushes. No force-push.
# Stops and reports on any conflict.
# ============================================================================
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
function Abort($m) { Write-Host "`nABORT: $m" -ForegroundColor Red; exit 1 }

Write-Host "== 0. No active git processes? ==" -ForegroundColor Cyan
if (Get-Process git, git-remote-https -ErrorAction SilentlyContinue) { Abort "A git process is running. Close it + GitHub Desktop, then re-run." }
if (Get-Process OneDrive -ErrorAction SilentlyContinue) { Write-Host "WARNING: OneDrive is running. Pause it (tray -> Pause syncing) before continuing, or you may hit 'Deletion of directory failed' again." -ForegroundColor Yellow }
if (Test-Path ".git\index.lock") { Remove-Item ".git\index.lock" -Force; Write-Host "Cleared stale .git\index.lock" -ForegroundColor Green }

Write-Host "`n== 1. Initial git status ==" -ForegroundColor Cyan
git status

Write-Host "`n== 2. Abort any in-progress rebase ==" -ForegroundColor Cyan
if ((Test-Path ".git\rebase-merge") -or (Test-Path ".git\rebase-apply")) {
  Write-Host "Rebase in progress - aborting..." -ForegroundColor Yellow
  git rebase --abort
  Write-Host "Rebase aborted." -ForegroundColor Green
} else {
  Write-Host "No rebase in progress." -ForegroundColor Green
}

Write-Host "`n== 3. Confirm local Command Center commit exists ==" -ForegroundColor Cyan
git log --oneline --decorate -5
$hasCommit = git log --oneline | Select-String -SimpleMatch "OWL Command Center"
if (-not $hasCommit) { Abort "Local commit 'Add OWL Command Center ...' NOT found. Stopping - do not push. Tell Claude the commit is missing." }
Write-Host "Local Command Center commit found." -ForegroundColor Green

Write-Host "`n== 4. Safety backup branch ==" -ForegroundColor Cyan
if (-not (git branch --list "backup/owl-command-center-local")) { git branch backup/owl-command-center-local }
git branch --list "backup/*"

Write-Host "`n== 5. Fetch remote ==" -ForegroundColor Cyan
git fetch origin main

Write-Host "`n== 6. Integrate origin/main via MERGE (safe for OneDrive) ==" -ForegroundColor Cyan
git merge origin/main --no-edit
if ($LASTEXITCODE -ne 0) {
  Write-Host "`nMERGE DID NOT COMPLETE CLEANLY. Conflicted files:" -ForegroundColor Red
  git diff --name-only --diff-filter=U
  Abort "Merge conflicts above. Do NOT force anything. Send Claude the conflicted file list."
}
Write-Host "Merge complete." -ForegroundColor Green

Write-Host "`n== 7. Re-run build gate ==" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Abort "Build failed after merge. Fix errors above, then re-run." }
Write-Host "Build passed." -ForegroundColor Green

Write-Host "`n== 8. Safety: ensure no .env staged, no secrets ==" -ForegroundColor Cyan
foreach ($f in @(".env.local", ".env", ".env.production")) { git restore --staged $f 2>$null }
$staged = git diff --cached
foreach ($p in @('re_[A-Za-z0-9_]{20,}','SUPABASE_SERVICE_ROLE_KEY\s*=\s*ey','sb_secret_[A-Za-z0-9]','eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}','CRON_SECRET\s*=\s*[A-Fa-f0-9]{32}')) {
  if ($staged | Select-String -Pattern $p) { Abort "Possible secret in staged content (/$p/). Remove and re-run." }
}

Write-Host "`n== 9. Push to GitHub (origin main, no force) ==" -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) { Abort "Push failed - re-check auth or that remote didn't move again. Did NOT force-push." }

Write-Host "`n== DONE - pushed. Vercel will auto-deploy. ==" -ForegroundColor Green
git log --oneline --decorate -3
