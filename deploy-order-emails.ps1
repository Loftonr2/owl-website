# ============================================================================
# OWL — Build + deploy: automatic order confirmation emails
# Run from PowerShell:  .\deploy-order-emails.ps1
# Build is the gate: nothing is pushed unless `npm run build` passes.
# Never commits .env.local. No force-push. PAUSE OneDrive first (.\Pause-OneDrive.ps1).
# ============================================================================
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
function Abort($m) { Write-Host "`nABORT: $m" -ForegroundColor Red; exit 1 }

if (Get-Process git, git-remote-https -ErrorAction SilentlyContinue) { Abort "A git process is running. Close it + GitHub Desktop, then re-run." }
if (Test-Path ".git\index.lock") { Remove-Item ".git\index.lock" -Force; Write-Host "Cleared stale index.lock" -ForegroundColor Green }

Write-Host "== 1. Production build (gate) ==" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Abort "Build failed. Paste the errors to Claude — nothing was staged or pushed." }
Write-Host "Build passed." -ForegroundColor Green

Write-Host "`n== 2. Stage changes (env force-excluded) ==" -ForegroundColor Cyan
git add -A
foreach ($f in @(".env.local", ".env", ".env.production", ".env.development.local")) { git restore --staged $f 2>$null }

Write-Host "`n== 3. Secret scan of staged content ==" -ForegroundColor Cyan
$staged = git diff --cached
foreach ($p in @('re_[A-Za-z0-9_]{20,}','SUPABASE_SERVICE_ROLE_KEY\s*=\s*ey','sb_secret_[A-Za-z0-9]','PAYPAL_CLIENT_SECRET\s*=\s*\S','eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}')) {
  if ($staged | Select-String -Pattern $p) { Abort "Possible secret in staged content (/$p/). Remove and re-run." }
}
Write-Host "No secrets staged; .env files excluded." -ForegroundColor Green

Write-Host "`n== 4. Commit ==" -ForegroundColor Cyan
git commit -m "Add automatic order confirmation emails"
if ($LASTEXITCODE -ne 0) { Abort "Commit failed (nothing to commit?)." }

Write-Host "`n== 5. Push (origin main, no force) ==" -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) { Abort "Push failed - auth needed or remote moved." }

Write-Host "`nDONE - pushed. Vercel will auto-deploy." -ForegroundColor Green
git log --oneline --decorate -3
