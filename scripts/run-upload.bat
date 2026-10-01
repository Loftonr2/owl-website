@echo off
REM ============================================================
REM  OWL Editorial Image Upload + Body Update — Windows Runner
REM
REM  Run AFTER the Supabase records have been inserted.
REM  This script:
REM    1. Verifies mammoth is installed (for DOCX parsing)
REM    2. Reads scripts\import-reports\owl_import_manifest.json
REM    3. For each of the 115 records:
REM       - Extracts the embedded image from the original DOCX
REM       - Uploads image to Supabase Storage (media-uploads)
REM       - UPDATEs content_posts.body + .featured_image
REM
REM  Usage:
REM    scripts\run-upload.bat             (full run - images + bodies)
REM    scripts\run-upload.bat dry-run     (preview only, no changes)
REM    scripts\run-upload.bat bodies      (update body HTML only)
REM    scripts\run-upload.bat images      (upload images only)
REM
REM  Prerequisites:
REM    - Node.js 18+
REM    - .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
REM    - scripts\import-reports\owl_import_manifest.json
REM    - Original DOCX files accessible at the paths in the manifest
REM ============================================================

REM ── Move to repo root ─────────────────────────────────────────
if exist "package.json" (
    set REPO_ROOT=%CD%
) else if exist "..\package.json" (
    cd ..
    set REPO_ROOT=%CD%
) else (
    echo ERROR: Cannot find package.json. Run from repo root or scripts\ folder.
    exit /b 1
)

echo.
echo ^=^=^= OWL Image Upload + Body Update ^=^=^=
echo Repo root: %REPO_ROOT%
echo.

REM ── Validate .env.local ───────────────────────────────────────
if not exist ".env.local" (
    echo ERROR: .env.local not found. Cannot connect to Supabase.
    exit /b 1
)

REM ── Validate manifest ─────────────────────────────────────────
if not exist "scripts\import-reports\owl_import_manifest.json" (
    echo ERROR: Manifest not found at scripts\import-reports\owl_import_manifest.json
    echo Run the import session in Cowork first to generate this file.
    exit /b 1
)

REM ── Install mammoth if needed ─────────────────────────────────
echo Checking for mammoth...
node -e "require('mammoth')" >nul 2>&1
if errorlevel 1 (
    echo Installing mammoth...
    npm install mammoth --no-save
    if errorlevel 1 (
        echo ERROR: Failed to install mammoth.
        exit /b 1
    )
)

echo.

REM ── Parse mode ────────────────────────────────────────────────
set MODE=%1
set FLAG=

if "%MODE%"=="dry-run" set FLAG=--dry-run
if "%MODE%"=="bodies" set FLAG=--bodies-only
if "%MODE%"=="images" set FLAG=--images-only

echo Running upload in mode: %MODE%...
if "%FLAG%"=="" if not "%MODE%"=="" (
    echo ERROR: Unknown mode "%MODE%". Use: dry-run, bodies, images, or leave blank for full run.
    exit /b 1
)
echo.

REM ── Run ───────────────────────────────────────────────────────
node scripts\upload-images-and-update-bodies.mjs %FLAG%

if errorlevel 1 (
    echo.
    echo ERROR: Script exited with error. See output above.
    exit /b 1
)

echo.
echo Done. Check scripts\import-reports\ for the upload report.
