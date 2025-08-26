import fitz  # PyMuPDF
from PIL import Image
import os

def pdf_to_images(pdf_path, output_folder="estimate_images"):
    """PDF를 이미지로 변환"""
    
    # 출력 폴더 생성
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # PDF 열기
    pdf_document = fitz.open(pdf_path)
    
    # 페이지 수 저장
    page_count = len(pdf_document)
    
    # 각 페이지를 이미지로 변환
    for page_num in range(page_count):
        page = pdf_document[page_num]
        
        # 높은 해상도로 렌더링 (300 DPI)
        mat = fitz.Matrix(300/72, 300/72)  # 72 DPI를 300 DPI로 변환
        pix = page.get_pixmap(matrix=mat)
        
        # 이미지 저장
        output_path = os.path.join(output_folder, f"견적서_{page_num + 1}페이지.png")
        pix.save(output_path)
        print(f"저장됨: {output_path}")
    
    pdf_document.close()
    print(f"\n총 {page_count}개 페이지가 이미지로 변환되었습니다.")
    print(f"저장 위치: {os.path.abspath(output_folder)}")

# 견적서 PDF를 이미지로 변환
if __name__ == "__main__":
    pdf_to_images("쇼핑몰앱_견적서_2025.pdf")