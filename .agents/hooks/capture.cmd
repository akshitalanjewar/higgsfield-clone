@echo off
setlocal
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
python -u "%~dp0..\..\.cursor\hooks\capture.py" %*
