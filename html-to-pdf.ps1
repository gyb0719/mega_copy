# HTML을 PDF로 변환하는 PowerShell 스크립트
# Chrome을 사용하여 헤드리스 모드로 PDF 생성

$htmlFile = "C:\Users\gyb07\projects\convert-to-pdf.html"
$pdfFile = "C:\Users\gyb07\projects\glamping-site-quotation.pdf"

# Chrome 실행 경로 찾기
$chromePaths = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chromePath = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromePath = $path
        break
    }
}

if ($chromePath) {
    Write-Host "Chrome을 사용하여 PDF 생성 중..." -ForegroundColor Green
    
    # Chrome 헤드리스 모드로 PDF 생성
    & $chromePath --headless --disable-gpu --print-to-pdf="$pdfFile" "file:///$htmlFile" 2>$null
    
    if (Test-Path $pdfFile) {
        Write-Host "PDF 파일이 성공적으로 생성되었습니다: $pdfFile" -ForegroundColor Green
        # PDF 파일 열기
        Start-Process $pdfFile
    } else {
        Write-Host "PDF 생성에 실패했습니다." -ForegroundColor Red
    }
} else {
    # Chrome이 없으면 Edge 사용
    $edgePath = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
    
    if (Test-Path $edgePath) {
        Write-Host "Edge를 사용하여 PDF 생성 중..." -ForegroundColor Green
        
        # Edge 헤드리스 모드로 PDF 생성  
        & $edgePath --headless --disable-gpu --print-to-pdf="$pdfFile" "file:///$htmlFile" 2>$null
        
        if (Test-Path $pdfFile) {
            Write-Host "PDF 파일이 성공적으로 생성되었습니다: $pdfFile" -ForegroundColor Green
            # PDF 파일 열기
            Start-Process $pdfFile
        } else {
            Write-Host "PDF 생성에 실패했습니다." -ForegroundColor Red
        }
    } else {
        Write-Host "Chrome 또는 Edge를 찾을 수 없습니다." -ForegroundColor Red
        Write-Host "HTML 파일을 브라우저에서 열어 수동으로 PDF로 인쇄해주세요." -ForegroundColor Yellow
        Start-Process $htmlFile
    }
}