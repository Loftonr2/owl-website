@echo off
REM Double-click this to run the upload in DRY-RUN mode (no changes)
cd /d C:\Users\Ricko\owl-website-clean
echo.
echo === OWL Upload Dry-Run ===
echo.
call scripts\run-upload.bat dry-run
echo.
echo === Dry-run complete. Press any key to close. ===
pause >nul
