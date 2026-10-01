@echo off
title OWL Retry Single Record
cd /d "C:\Users\Ricko\owl-website-clean"
echo.
echo === Retrying: preventing-and-treating-diaper-rash ===
echo.
node scripts\upload-images-and-update-bodies.mjs --slug preventing-and-treating-diaper-rash
echo.
echo === Done ===
pause
