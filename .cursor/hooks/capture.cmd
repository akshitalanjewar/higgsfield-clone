@echo off
setlocal
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
py -3 -u "%~dp0capture.py" %*
