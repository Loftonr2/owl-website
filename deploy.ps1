# OWL Website — one-shot production deploy
# Run from PowerShell in the owl-website folder:  ./deploy.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Need($cmd, $install) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Write-Host "Installing $cmd ..."
    iex $install
  }
}

# 1. Tooling
Need "node" "throw 'Install Node.js LTS first: https://nodejs.org'"
Need "git"  "throw 'Install Git for Windows first: https://git-scm.com'"
Need "vercel" "npm install -g vercel"
Need "gh"   "winget install --id GitHub.cli -e --silent"

# 2. Install deps + build
Write-Host "==> npm install"
npm install --no-audit --no-fund
Write-Host "==> cleaning .next"
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
Write-Host "==> next build"
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed. Fix errors above and rerun." }

# 3. Git init + identity + commit
if (-not (Test-Path ".git")) {
  git init -b main
}
$gitEmail = git config user.email
if (-not $gitEmail) { git config user.email "rickoflv@gmail.com" }
$gitName = git config user.name
if (-not $gitName) { git config user.name "Rick" }
git add -A
$pending = git status --porcelain
if ($pending) { git commit -m "chore: production deploy" | Out-Null }

# 4. GitHub repo (creates if missing, else pushes to existing)
$repoName = "owl-website"
$ghUser = (gh api user --jq .login 2>$null)
if (-not $ghUser) {
  Write-Host "==> gh auth login (browser will open)"
  gh auth login --web --git-protocol https --hostname github.com
  $ghUser = (gh api user --jq .login)
}
$remoteExists = git remote get-url origin 2>$null
if (-not $remoteExists) {
  $exists = gh repo view "$ghUser/$repoName" 2>$null
  if (-not $exists) {
    gh repo create $repoName --private --source=. --remote=origin --push
  } else {
    git remote add origin "https://github.com/$ghUser/$repoName.git"
    git push -u origin main
  }
} else {
  git push origin main
}

# 5. Vercel deploy
Write-Host "==> vercel --prod"
vercel link --yes --project owl-website 2>$null
vercel --prod --yes

# 6. Domain link
vercel domains add owlsingtogether.com 2>$null
vercel alias set owlsingtogether.com 2>$null
vercel domains add www.owlsingtogether.com 2>$null

Write-Host ""
Write-Host "==> DNS RECORDS to set in GoDaddy for owlsingtogether.com:"
Write-Host "    A     @     76.76.21.21"
Write-Host "    CNAME www   cname.vercel-dns.com"
Write-Host ""
Write-Host "After DNS propagates (~5-30 min), verify:"
Write-Host "    https://owlsingtogether.com"
Write-Host "    https://www.owlsingtogether.com"
