@echo off
REM Double-click this to run the LIVE upload (images + body HTML for all 115 records)
cd /d C:\Users\Ricko\owl-website-clean
echo.
echo === OWL Live Upload - images + body HTML for 115 records ===
echo.
call scripts\run-upload.bat
echo.
echo === Upload complete. Press any key to close. ===
pause >nul
