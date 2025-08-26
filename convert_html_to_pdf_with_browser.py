import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.print_page_options import PrintOptions
import base64

# HTML 파일 경로
html_file = r"C:\Users\gyb07\projects\사단법인_홈페이지_견적서.html"
pdf_file = r"C:\Users\gyb07\projects\사단법인_홈페이지_견적서.pdf"

# Chrome 옵션 설정
chrome_options = Options()
chrome_options.add_argument('--headless')  # 백그라운드 실행
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

try:
    # Chrome 드라이버 실행
    driver = webdriver.Chrome(options=chrome_options)
    
    # HTML 파일 열기
    file_url = f"file:///{html_file.replace(chr(92), '/')}"
    driver.get(file_url)
    
    # 페이지가 완전히 로드될 때까지 대기
    time.sleep(2)
    
    # PDF로 인쇄
    print_options = PrintOptions()
    print_options.page_ranges = ['1-']  # 모든 페이지
    
    pdf_data = driver.print_page(print_options)
    
    # Base64로 인코딩된 PDF 데이터를 파일로 저장
    pdf_bytes = base64.b64decode(pdf_data)
    with open(pdf_file, 'wb') as f:
        f.write(pdf_bytes)
    
    print(f"PDF 변환 완료: {pdf_file}")
    print(f"파일 크기: {os.path.getsize(pdf_file) / 1024:.2f} KB")
    
    driver.quit()
    
except Exception as e:
    print(f"PDF 변환 실패: {str(e)}")
    print("\nselenium이 설치되지 않은 경우:")
    print("pip install selenium")
    print("\nChrome 드라이버가 필요할 수 있습니다.")
    print("https://chromedriver.chromium.org/downloads")