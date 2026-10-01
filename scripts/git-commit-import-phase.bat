@echo off
title OWL Git Commit — Import Phase
cd /d "C:\Users\Ricko\owl-website-clean"
echo.
echo === OWL Git Commit: Editorial Import Phase ===
echo.

REM ── Remove stale lock if present ─────────────────────────────────────────
if exist ".git\index.lock" (
    echo Removing stale git lock...
    del /f ".git\index.lock"
)

REM ── Safety: confirm .env.local is NOT tracked ─────────────────────────────
echo Checking .env.local is gitignored...
git check-ignore .env.local >nul 2>&1
if errorlevel 1 (
    echo ERROR: .env.local is NOT gitignored. Aborting.
    pause
    exit /b 1
)
echo   .env.local is correctly ignored. OK.
echo.

REM ── Unstage ALL previously staged changes ─────────────────────────────────
REM  (prior session staged regressions: vercel.json rollback, admin-recipients.ts deletion)
echo Unstaging all previously staged changes...
git restore --staged .
echo   Done.
echo.

REM ── Verify .env.local is NOT staged ──────────────────────────────────────
git diff --cached --name-only | findstr /i ".env" >nul 2>&1
if NOT errorlevel 1 (
    echo ERROR: .env file is staged. Aborting.
    pause
    exit /b 1
)

REM ── Stage the new/updated files from this session ─────────────────────────
echo Staging new files...
git add scripts\upload-images-and-update-bodies.mjs
git add scripts\retry-failed.bat
git add scripts\retry-one.bat
git add scripts\run-upload.bat
git add scripts\run-dry-run.bat
git add scripts\run-live-upload.bat
git add scripts\git-commit-import-phase.bat
REM Stage import manifests and reports (non-sensitive)
git add scripts\import-reports\owl_import_manifest.json 2>nul
echo   Done.
echo.

REM ── Show exactly what will be committed ───────────────────────────────────
echo === Staged files to commit ===
git diff --cached --name-only
echo.

REM ── Verify service-role key is NOT in staged files ────────────────────────
echo Checking for secrets in staged files...
git diff --cached | findstr /i "service_role" >nul 2>&1
if NOT errorlevel 1 (
    echo ERROR: service_role key detected in staged diff. Aborting.
    pause
    exit /b 1
)
git diff --cached | findstr /i "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" >nul 2>&1
if NOT errorlevel 1 (
    echo ERROR: JWT token detected in staged diff. Aborting.
    pause
    exit /b 1
)
echo   No secrets detected in staged files. OK.
echo.

REM ── Commit ────────────────────────────────────────────────────────────────
echo Committing...
git commit -m "feat: editorial import scripts — upload images + body HTML for 115 records

- scripts/upload-images-and-update-bodies.mjs: verbatim slug match fix
  (why-toddlers-say-no and other short-word slugs now match correctly)
  Confirmed 115/115 records uploaded, 0 skipped, 0 errors
- scripts/retry-failed.bat: batch retry for transient upload failures
- scripts/retry-one.bat: single-record retry script
- scripts/run-upload.bat: main upload runner with mode flags
- scripts/run-dry-run.bat: dry-run runner for pre-upload verification
- scripts/run-live-upload.bat: live upload runner

All 115 content_posts records verified in Supabase:
  55 news, 60 blog, 115 bodies, 115 featured_images, 0 published prematurely"

if errorlevel 1 (
    echo ERROR: Commit failed. See output above.
    pause
    exit /b 1
)

echo.
git log --oneline -3
echo.

REM ── Push ──────────────────────────────────────────────────────────────────
echo Pushing to origin/main...
git push origin main
if errorlevel 1 (
    echo ERROR: Push failed. See output above.
    pause
    exit /b 1
)

echo.
echo === Push complete. Record the commit SHA above. ===
echo.
echo Final log:
git log --oneline -3
echo.
pause
