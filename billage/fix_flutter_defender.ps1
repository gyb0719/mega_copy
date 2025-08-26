# Windows Defender 제외 설정 추가 스크립트
# 관리자 권한으로 실행 필요

Write-Host "Windows Defender 제외 설정 추가 중..." -ForegroundColor Yellow

try {
    # Flutter SDK 디렉토리 제외
    Add-MpPreference -ExclusionPath "C:\Users\gyb07\dev\flutter" -ErrorAction SilentlyContinue
    
    # pub 캐시 디렉토리 제외
    Add-MpPreference -ExclusionPath "C:\Users\gyb07\AppData\Local\Pub" -ErrorAction SilentlyContinue
    
    # 프로젝트 디렉토리 제외
    Add-MpPreference -ExclusionPath "C:\Users\gyb07\projects\billage" -ErrorAction SilentlyContinue
    
    # Dart 관련 프로세스 제외
    Add-MpPreference -ExclusionProcess "dart.exe" -ErrorAction SilentlyContinue
    Add-MpPreference -ExclusionProcess "flutter_tools.snapshot" -ErrorAction SilentlyContinue
    
    Write-Host "Windows Defender 제외 설정 완료!" -ForegroundColor Green
} catch {
    Write-Host "관리자 권한이 필요합니다. PowerShell을 관리자로 실행해주세요." -ForegroundColor Red
}