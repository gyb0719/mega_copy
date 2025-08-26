import pypandoc
import os

def convert_markdown_to_pdf(md_file, pdf_file):
    """마크다운 파일을 PDF로 변환"""
    try:
        # pypandoc을 사용한 변환
        # 먼저 HTML로 변환 후 브라우저를 통해 PDF로 변환
        raise Exception("Direct PDF conversion not available, using HTML method")
        print(f"PDF 변환 성공: {pdf_file}")
        if os.path.exists(pdf_file):
            size = os.path.getsize(pdf_file) / 1024
            print(f"   파일 크기: {size:.2f} KB")
        return True
    except Exception as e:
        print(f"PDF 변환 실패: {str(e)}")
        print("\n대체 방법: HTML 경유 변환 시도...")
        return convert_via_html(md_file, pdf_file)

def convert_via_html(md_file, pdf_file):
    """HTML을 거쳐서 PDF로 변환 (대체 방법)"""
    try:
        # 먼저 HTML로 변환
        html_file = md_file.replace('.md', '_temp.html')
        
        # CSS 스타일 포함한 HTML 생성
        html_content = pypandoc.convert_file(
            md_file,
            'html5',
            extra_args=[
                '--standalone',
                '--self-contained',
                '--metadata', 'title=Document',
                '--css=style.css' if os.path.exists('style.css') else '--metadata', 'title=Document'
            ]
        )
        
        # 한글 지원을 위한 CSS 추가
        html_with_style = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }}
        h1, h2, h3 {{ color: #333; }}
        code {{ background: #f4f4f4; padding: 2px 4px; }}
        pre {{ background: #f4f4f4; padding: 10px; overflow-x: auto; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background: #f2f2f2; }}
    </style>
</head>
<body>
{html_content}
</body>
</html>
"""
        
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_with_style)
        
        print(f"   HTML 파일 생성: {html_file}")
        
        # wkhtmltopdf나 weasyprint 사용 시도
        try:
            import pdfkit
            pdfkit.from_file(html_file, pdf_file)
            print(f"PDF 변환 성공 (pdfkit 사용): {pdf_file}")
        except:
            print("   pdfkit 사용 불가, 브라우저 방법 시도...")
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            import base64
            
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            driver = webdriver.Chrome(options=chrome_options)
            
            file_url = f"file:///{html_file.replace(chr(92), '/')}"
            driver.get(file_url)
            
            pdf_data = driver.print_page()
            pdf_bytes = base64.b64decode(pdf_data)
            
            with open(pdf_file, 'wb') as f:
                f.write(pdf_bytes)
            
            driver.quit()
            print(f"PDF 변환 성공 (Selenium 사용): {pdf_file}")
        
        # 임시 HTML 파일 삭제
        if os.path.exists(html_file):
            os.remove(html_file)
        
        return True
        
    except Exception as e:
        print(f"대체 방법도 실패: {str(e)}")
        return False

# 테스트 실행
if __name__ == "__main__":
    # 테스트 파일
    test_md = r"C:\Users\gyb07\projects\test_pandoc.md"
    test_pdf = r"C:\Users\gyb07\projects\test_pandoc.pdf"
    
    print("=" * 50)
    print("마크다운 → PDF 변환 테스트")
    print("=" * 50)
    
    if os.path.exists(test_md):
        convert_markdown_to_pdf(test_md, test_pdf)
    else:
        print(f"테스트 파일이 없습니다: {test_md}")
    
    # 실제 파일 변환
    print("\n" + "=" * 50)
    print("실제 문서 변환 (사단법인 홈페이지 견적서)")
    print("=" * 50)
    
    actual_md = r"C:\Users\gyb07\projects\사단법인_홈페이지_견적서.md"
    actual_pdf = r"C:\Users\gyb07\projects\사단법인_홈페이지_견적서_from_md.pdf"
    
    if os.path.exists(actual_md):
        convert_markdown_to_pdf(actual_md, actual_pdf)
    else:
        # 마크다운 파일이 없으면 HTML에서 추출
        print("마크다운 파일이 없어 HTML을 변환합니다...")
        html_file = r"C:\Users\gyb07\projects\사단법인_홈페이지_견적서.html"
        if os.path.exists(html_file):
            # HTML을 직접 PDF로 변환
            convert_via_html(html_file, actual_pdf)