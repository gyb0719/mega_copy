@echo off
echo === Windows Native Build Test ===
echo Current Directory: %CD%
echo.

REM Check for Visual Studio
if exist "C:\Program Files\Microsoft Visual Studio" (
    echo Found Visual Studio
    call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" 2>nul
) else if exist "C:\Program Files (x86)\Microsoft Visual Studio" (
    echo Found Visual Studio x86
    call "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\Auxiliary\Build\vcvars64.bat" 2>nul
) else (
    echo Visual Studio not found, trying alternative methods...
)

REM Try compilation
cl /EHsc /O2 /std:c++17 /Fe:solution_windows.exe cpp_src\main_simple.cpp cpp_src\util.cpp cpp_src\algorithm.cpp /I cpp_src 2>build_log.txt
if %errorlevel% == 0 (
    echo Windows native compilation successful!
) else (
    echo Compilation failed, check build_log.txt
    type build_log.txt
)
