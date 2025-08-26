import pdfkit
import os

# HTML 파일 경로
html_file = r"C:\Users\gyb07\projects\사단법인_홈페이지_견적서.html"
pdf_file = r"C:\Users\gyb07\projects\사단법인_홈페이지_견적서.pdf"

# wkhtmltopdf 설정 (Windows에서 설치 경로 지정 필요한 경우)
config = None
wkhtmltopdf_paths = [
    r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe",
    r"C:\Program Files (x86)\wkhtmltopdf\bin\wkhtmltopdf.exe",
    r"C:\wkhtmltopdf\bin\wkhtmltopdf.exe",
]

for path in wkhtmltopdf_paths:
    if os.path.exists(path):
        config = pdfkit.configuration(wkhtmltopdf=path)
        print(f"wkhtmltopdf found at: {path}")
        break

# PDF 변환 옵션
options = {
    'page-size': 'A4',
    'margin-top': '15mm',
    'margin-right': '15mm',
    'margin-bottom': '15mm',
    'margin-left': '15mm',
    'encoding': "UTF-8",
    'no-outline': None,
    'enable-local-file-access': None
}

try:
    # HTML을 PDF로 변환
    if config:
        pdfkit.from_file(html_file, pdf_file, options=options, configuration=config)
    else:
        # wkhtmltopdf가 PATH에 있다고 가정
        pdfkit.from_file(html_file, pdf_file, options=options)
    
    print(f"PDF 변환 완료: {pdf_file}")
except Exception as e:
    print(f"PDF 변환 실패: {str(e)}")
    print("\nwkhtmltopdf가 설치되지 않은 경우:")
    print("1. https://wkhtmltopdf.org/downloads.html 에서 Windows 버전 다운로드")
    print("2. 설치 후 다시 실행하세요.")