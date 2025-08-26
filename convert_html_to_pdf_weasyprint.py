from weasyprint import HTML
import os

# HTML 파일 경로
html_file = r"C:\Users\gyb07\projects\사단법인_홈페이지_견적서.html"
pdf_file = r"C:\Users\gyb07\projects\사단법인_홈페이지_견적서.pdf"

try:
    # HTML을 PDF로 변환
    HTML(filename=html_file).write_pdf(pdf_file)
    print(f"PDF 변환 완료: {pdf_file}")
    print(f"파일 크기: {os.path.getsize(pdf_file) / 1024:.2f} KB")
except Exception as e:
    print(f"PDF 변환 실패: {str(e)}")
    print("\nweasyprint가 설치되지 않은 경우:")
    print("pip install weasyprint")