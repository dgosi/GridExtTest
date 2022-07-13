@ECHO off
SETLOCAL
CALL :find_dp0

IF EXIST "%dp0%\node.exe" (
  SET "_prog=%dp0%\node.exe"
) ELSE (
  SET "_prog=node"
  SET PATHEXT=%PATHEXT:;.JS;=;%
)

"%_prog%"  "%dp0%\node_modules\datagrok-tools\bin\grok.js" %*
ENDLOCAL
EXIT /b %errorlevel%
:find_dp0
SET dp0=%~dp0
EXIT /b

GNF-00-1990-8984-4


the trigger is everything > 2000 but never been sent
0 = "CAST Idea ID"
1 = "Board Name"
2 = "Idea Name"
3 = "Idea Status"
4 = "Idea Author"
5 = "Idea Synthesizer"
6 = "Idea NVP"
7 = "Idea Tags"
8 = "Idea CFS Series"
9 = "Idea Created"
10 = "Idea Last Active"
11 = "Board ID"
12 = "Idea ID"
13 = "Idea Priority"