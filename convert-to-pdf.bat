@echo off
echo HTML을 PDF로 변환하는 중...

set HTML_FILE=file:///C:/Users/gyb07/projects/convert-to-pdf.html
set PDF_FILE=C:\Users\gyb07\projects\glamping-site-quotation.pdf

REM Chrome 경로 확인
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    echo Chrome을 사용하여 PDF 생성 중...
    "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --print-to-pdf="%PDF_FILE%" "%HTML_FILE%"
    goto :check
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    echo Chrome을 사용하여 PDF 생성 중...
    "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --print-to-pdf="%PDF_FILE%" "%HTML_FILE%"
    goto :check
)

REM Edge 경로 확인
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    echo Edge를 사용하여 PDF 생성 중...
    "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu --print-to-pdf="%PDF_FILE%" "%HTML_FILE%"
    goto :check
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    echo Edge를 사용하여 PDF 생성 중...
    "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu --print-to-pdf="%PDF_FILE%" "%HTML_FILE%"
    goto :check
)

:check
timeout /t 2 >nul

if exist "%PDF_FILE%" (
    echo.
    echo PDF 파일이 성공적으로 생성되었습니다!
    echo 경로: %PDF_FILE%
    echo.
    echo PDF 파일을 여는 중...
    start "" "%PDF_FILE%"
) else (
    echo.
    echo PDF 자동 생성에 실패했습니다.
    echo HTML 파일을 브라우저에서 열어 수동으로 PDF로 저장해주세요.
    echo.
    echo HTML 파일을 브라우저에서 여는 중...
    start "" "C:\Users\gyb07\projects\convert-to-pdf.html"
    echo.
    echo [수동 변환 방법]
    echo 1. 브라우저에서 Ctrl+P 누르기
    echo 2. '대상'에서 'PDF로 저장' 선택
    echo 3. 파일명을 'glamping-site-quotation.pdf'로 저장
)

echo.
pause