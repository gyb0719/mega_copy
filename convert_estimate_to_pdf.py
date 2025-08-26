import os
import subprocess
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import json
import base64
import time

def convert_to_pdf():
    md_file = 'bag_company_estimate.md'
    pdf_file = 'bag_company_estimate.pdf'
    html_file = 'bag_company_estimate_temp.html'

    try:
        # 마크다운을 HTML로 변환
        print("Converting Markdown to HTML...")
        subprocess.run([
            'pandoc', md_file, '-o', html_file,
            '--self-contained', '--standalone',
            '--metadata', 'title=Website Development Estimate'
        ], check=True)
        
        print(f'HTML 파일 생성: {html_file}')
        
        # Selenium으로 PDF 변환
        print('Chrome을 사용하여 PDF 변환 중...')
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        driver = webdriver.Chrome(options=options)
        
        # 파일 경로를 URL 형식으로 변환
        file_path = 'file:///' + os.path.abspath(html_file).replace('\\', '/')
        driver.get(file_path)
        time.sleep(2)  # 페이지 로드 대기
        
        # PDF 생성
        result = driver.execute_cdp_cmd('Page.printToPDF', {
            'format': 'A4',
            'printBackground': True,
            'marginTop': 0.4,
            'marginBottom': 0.4,
            'marginLeft': 0.4,
            'marginRight': 0.4,
            'scale': 0.9
        })
        
        # PDF 파일 저장
        with open(pdf_file, 'wb') as f:
            f.write(base64.b64decode(result['data']))
        
        driver.quit()
        
        # 임시 HTML 파일 삭제
        if os.path.exists(html_file):
            os.remove(html_file)
        
        print(f'PDF generated successfully: {pdf_file}')
        print(f'File size: {os.path.getsize(pdf_file):,} bytes')
        
    except subprocess.CalledProcessError:
        print("Pandoc execution failed. Please check if Pandoc is installed.")
    except Exception as e:
        print(f"PDF conversion failed: {str(e)}")
        if os.path.exists(html_file):
            os.remove(html_file)

if __name__ == "__main__":
    convert_to_pdf()