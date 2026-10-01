@echo off
title OWL Retry Failed Uploads
cd /d "C:\Users\Ricko\owl-website-clean"
echo.
echo === Retrying 6 failed records ===
echo.

node scripts\upload-images-and-update-bodies.mjs --slug bedtime-fears-nightmares-and-night-terrors
node scripts\upload-images-and-update-bodies.mjs --slug preventing-and-treating-diaper-rash
node scripts\upload-images-and-update-bodies.mjs --slug owls-promise-to-parents
node scripts\upload-images-and-update-bodies.mjs --slug tantrums-and-meltdowns
node scripts\upload-images-and-update-bodies.mjs --slug sharing-and-turn-taking-for-children
node scripts\upload-images-and-update-bodies.mjs --slug owl-resources-for-teachers-and-homeschool-families

echo.
echo === Retry complete. Check output above for any remaining errors ===
echo.
pause
