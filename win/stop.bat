@echo off
set /p pid=<editor/server/.pidfile
taskkill /F /PID %pid%