@echo off
echo Removing git lock files...
del /f "C:\Users\Ricko\owl-website\.git\index.lock" 2>nul
del /f "C:\Users\Ricko\owl-website\.git\HEAD.lock" 2>nul
echo Done. Lock files removed.
pause
