import markdown
import os

# 마크다운 파일 읽기
with open(r'C:\Users\gyb07\projects\케이크토퍼_중계사이트_견적서.pdf.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# 마크다운을 HTML로 변환
html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code', 'nl2br'])

# CSS 스타일 추가
css_style = """
<style>
@page {
    size: A4;
    margin: 2cm;
}

body {
    font-family: 'Malgun Gothic', 'Nanum Gothic', Arial, sans-serif;
    line-height: 1.8;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    color: #2c3e50;
    border-bottom: 3px solid #3498db;
    padding-bottom: 10px;
    margin-top: 40px;
    margin-bottom: 30px;
    font-size: 28px;
}

h2 {
    color: #34495e;
    margin-top: 35px;
    margin-bottom: 20px;
    border-bottom: 1px solid #bdc3c7;
    padding-bottom: 8px;
    font-size: 22px;
}

h3 {
    color: #555;
    margin-top: 25px;
    margin-bottom: 15px;
    font-size: 18px;
}

h4 {
    color: #666;
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 16px;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin: 25px 0;
    box-shadow: 0 2px 3px rgba(0,0,0,0.1);
}

table th {
    background-color: #3498db;
    color: white;
    padding: 12px;
    text-align: left;
    border: 1px solid #2980b9;
    font-weight: bold;
}

table td {
    padding: 10px;
    border: 1px solid #ddd;
    background-color: white;
}

table tr:nth-child(even) td {
    background-color: #f8f9fa;
}

table tr:hover td {
    background-color: #e3f2fd;
}

strong {
    color: #2c3e50;
    font-weight: 600;
}

ul, ol {
    margin-left: 25px;
    margin-bottom: 15px;
}

li {
    margin-bottom: 5px;
}

hr {
    border: none;
    border-top: 2px solid #e0e0e0;
    margin: 40px 0;
}

blockquote {
    border-left: 4px solid #3498db;
    padding-left: 20px;
    color: #666;
    font-style: italic;
    margin: 20px 0;
    background-color: #f5f5f5;
    padding: 15px;
}

p {
    margin-bottom: 15px;
    text-align: justify;
}

code {
    background-color: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
}

/* 견적서 특별 스타일 */
.price {
    font-size: 18px;
    font-weight: bold;
    color: #e74c3c;
}

/* 인쇄 최적화 */
@media print {
    body {
        font-size: 11pt;
    }
    
    h1 {
        page-break-after: avoid;
    }
    
    table {
        page-break-inside: avoid;
    }
}
</style>
"""

# 완전한 HTML 문서 생성
full_html = f"""
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>케이크토퍼 협회 통합 전시 플랫폼 구축 견적서</title>
    {css_style}
</head>
<body>
    {html_content}
</body>
</html>
"""

# HTML 파일로 저장
html_path = r'C:\Users\gyb07\projects\케이크토퍼_견적서.html'
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(full_html)

print(f"HTML 파일이 생성되었습니다: {html_path}")

# 바탕화면 경로
desktop_path = os.path.join(os.path.expanduser('~'), 'Desktop')
pdf_path = os.path.join(desktop_path, '케이크토퍼_중계사이트_견적서.pdf')

# pdfkit 설정 (wkhtmltopdf가 설치되어 있어야 함)
try:
    import pdfkit
    config = pdfkit.configuration()
    pdfkit.from_file(html_path, pdf_path, configuration=config)
    print(f"PDF 파일이 생성되었습니다: {pdf_path}")
except Exception as e:
    print(f"pdfkit을 사용한 PDF 변환 실패: {e}")
    print("대신 HTML 파일을 브라우저에서 열어 PDF로 인쇄하실 수 있습니다.")
    
    # 브라우저로 HTML 파일 열기
    import webbrowser
    webbrowser.open(html_path)
    print(f"\nHTML 파일이 브라우저에서 열렸습니다.")
    print("브라우저에서 Ctrl+P를 눌러 PDF로 인쇄/저장하실 수 있습니다.")