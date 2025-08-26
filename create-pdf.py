import os
import sys
import time

# HTML 파일 경로
html_file = r"C:\Users\gyb07\projects\convert-to-pdf.html"
pdf_file = r"C:\Users\gyb07\projects\glamping-site-quotation.pdf"

# wkhtmltopdf가 설치되어 있지 않으면 weasyprint 시도
try:
    import weasyprint
    print("WeasyPrint를 사용하여 PDF 생성 중...")
    doc = weasyprint.HTML(filename=html_file)
    doc.write_pdf(pdf_file)
    print(f"PDF 파일이 생성되었습니다: {pdf_file}")
    os.startfile(pdf_file)
except ImportError:
    print("WeasyPrint가 설치되어 있지 않습니다.")
    print("pip install weasyprint 명령으로 설치하거나")
    print("브라우저에서 HTML 파일을 열어 수동으로 PDF로 인쇄해주세요.")
    
    # 대안: 브라우저로 HTML 파일 열기
    import webbrowser
    webbrowser.open(html_file)
    print(f"\nHTML 파일이 브라우저에서 열렸습니다.")
    print("Ctrl+P를 눌러 'PDF로 저장'을 선택해주세요.")