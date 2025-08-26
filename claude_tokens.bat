@echo off
REM Claude Code Token Tracking Utility
REM Quick access to token tracking commands

setlocal enabledelayedexpansion

if "%1"=="" goto :show_status
if "%1"=="help" goto :show_help
if "%1"=="status" goto :show_status
if "%1"=="detail" goto :show_detail
if "%1"=="add" goto :add_tokens
if "%1"=="estimate" goto :estimate_tokens
if "%1"=="monitor" goto :start_monitor
if "%1"=="stop" goto :stop_monitor
if "%1"=="reset" goto :reset_usage
if "%1"=="sync" goto :sync_trackers
if "%1"=="model" goto :set_model

goto :unknown_command

:show_status
python token_usage.py
goto :end

:show_detail
python token_usage.py detail
goto :end

:show_help
echo Claude Code Token Tracking Utility
echo.
echo Usage: claude_tokens [command] [options]
echo.
echo Commands:
echo   (none)          Show current token status
echo   status          Show current token status
echo   detail          Show detailed usage information
echo   add [in] [out]  Manually add input and output tokens
echo   estimate        Estimate tokens from clipboard text
echo   monitor         Start background monitoring
echo   stop            Stop background monitoring
echo   reset           Reset token usage
echo   sync            Sync with enhanced tracker
echo   model [opus/sonnet/haiku] Set or show current model
echo   help            Show this help message
echo.
echo Examples:
echo   claude_tokens
echo   claude_tokens detail
echo   claude_tokens add 1500 800
echo   claude_tokens monitor
echo   claude_tokens model opus
goto :end

:add_tokens
if "%2"=="" (
    echo Error: Input tokens required
    echo Usage: claude_tokens add [input_tokens] [output_tokens]
    goto :end
)
if "%3"=="" (
    echo Error: Output tokens required
    echo Usage: claude_tokens add [input_tokens] [output_tokens]
    goto :end
)
python token_usage.py add %2 %3
goto :end

:estimate_tokens
echo Estimating tokens from clipboard...
powershell -ExecutionPolicy Bypass -Command "Get-Clipboard" > temp_clipboard.txt
if exist temp_clipboard.txt (
    for /f "delims=" %%i in (temp_clipboard.txt) do (
        python claude_token_tracker.py estimate --text-input "%%i"
    )
    del temp_clipboard.txt
) else (
    echo Error: Could not access clipboard
)
goto :end

:start_monitor
echo Starting background token monitor...
echo Press Ctrl+C to stop monitoring
python token_monitor.py start --interval 30
goto :end

:stop_monitor
python token_monitor.py stop
goto :end

:reset_usage
echo Are you sure you want to reset token usage? (Y/N)
set /p confirm=
if /i "%confirm%"=="Y" (
    python token_usage.py reset
    echo Token usage has been reset.
) else (
    echo Reset cancelled.
)
goto :end

:sync_trackers
python token_usage.py sync
goto :end

:set_model
if "%2"=="" (
    echo Current model status:
    python claude_token_tracker.py model
) else (
    python claude_token_tracker.py model --set-model %2
)
goto :end

:unknown_command
echo Unknown command: %1
echo Use 'claude_tokens help' for available commands
goto :end

:end
endlocal