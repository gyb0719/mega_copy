from fpdf import FPDF
import os

class PDF(FPDF):
    def __init__(self):
        super().__init__()
        # Windows에서 한글 폰트 경로
        self.add_font('NanumGothic', '', 'C:/Windows/Fonts/NanumGothic.ttf', uni=True)
        self.add_font('NanumGothic', 'B', 'C:/Windows/Fonts/NanumGothicBold.ttf', uni=True)
        
    def header(self):
        self.set_font('NanumGothic', 'B', 16)
        self.cell(0, 10, '사단법인 홈페이지 구축 제안서', 0, 1, 'C')
        self.ln(5)
        
    def footer(self):
        self.set_y(-15)
        self.set_font('NanumGothic', '', 8)
        self.cell(0, 10, f'페이지 {self.page_no()}/{{nb}}', 0, 0, 'C')

# PDF 생성
pdf = PDF()
pdf.alias_nb_pages()
pdf.add_page()

# 제목
pdf.set_font('NanumGothic', 'B', 20)
pdf.cell(0, 15, '프로젝트 제안서', 0, 1, 'C')
pdf.set_font('NanumGothic', '', 12)
pdf.cell(0, 10, '사단법인 홈페이지 구축', 0, 1, 'C')
pdf.ln(10)

# 요약
pdf.set_font('NanumGothic', 'B', 14)
pdf.cell(0, 10, '요약', 0, 1)
pdf.set_font('NanumGothic', '', 10)
pdf.multi_cell(0, 7, 
'국가유산 관련 사단법인을 위한 시니어 친화적 웹사이트 구축 프로젝트입니다. '
'50대 이상 중장년층이 쉽게 이용할 수 있는 접근성 중심의 정보 공유 플랫폼을 구현하며, '
'회원가입 없이도 게시판을 이용할 수 있는 열린 커뮤니티 공간을 제공합니다.')
pdf.ln(5)

pdf.set_font('NanumGothic', 'B', 11)
pdf.cell(40, 7, '권장 패키지:', 0, 0)
pdf.set_font('NanumGothic', '', 11)
pdf.cell(0, 7, '스탠다드 패키지 (필수 기능 + 시니어 특화)', 0, 1)
pdf.ln(10)

# 패키지 비교
pdf.set_font('NanumGothic', 'B', 14)
pdf.cell(0, 10, '패키지별 제안', 0, 1)
pdf.ln(5)

# 가격 정책
pdf.set_font('NanumGothic', 'B', 12)
pdf.cell(0, 8, '가격 정책', 0, 1)
pdf.set_font('NanumGothic', '', 10)
pdf.cell(5, 6, '•', 0, 0)
pdf.cell(0, 6, '정가: 아래 표시 금액', 0, 1)
pdf.cell(5, 6, '•', 0, 0)
pdf.cell(0, 6, 'VAT 별도', 0, 1)
pdf.ln(5)

# 패키지 테이블
pdf.set_font('NanumGothic', 'B', 11)
pdf.cell(60, 8, '구분', 1, 0, 'C')
pdf.cell(60, 8, '스탠다드 ⭐', 1, 0, 'C')
pdf.cell(60, 8, '프리미엄', 1, 1, 'C')

pdf.set_font('NanumGothic', '', 10)
rows = [
    ['정가', '500만원', '750만원'],
    ['개발 기간', '4~5주', '6~7주'],
    ['페이지 수', '15페이지', '25페이지+'],
    ['디자인', '세미 커스텀', '풀 커스텀'],
    ['게시판', '3개', '5개+'],
    ['관리자 기능', '표준', '고급'],
    ['반응형 웹', '포함', '포함'],
    ['SEO 최적화', '기본', '고급'],
    ['웹 접근성', '기본 준수', '표준 준수'],
    ['글자 크기 조절', '3단계', '5단계'],
    ['고대비 모드', '포함', '포함'],
    ['음성 안내', '미포함', '포함'],
    ['무상 유지보수', '2개월', '3개월']
]

for row in rows:
    pdf.cell(60, 7, row[0], 1, 0, 'C')
    pdf.cell(60, 7, row[1], 1, 0, 'C')
    pdf.cell(60, 7, row[2], 1, 1, 'C')

pdf.ln(10)

# 스탠다드 패키지 상세
pdf.add_page()
pdf.set_font('NanumGothic', 'B', 14)
pdf.cell(0, 10, '스탠다드 패키지 (정가 500만원) [추천]', 0, 1)
pdf.ln(5)

pdf.set_font('NanumGothic', 'B', 12)
pdf.cell(0, 8, '포함 사항', 0, 1)
pdf.set_font('NanumGothic', '', 10)

items = [
    '메인 페이지 + 14개 서브 페이지',
    '게시판 3개 (공지사항, 자유게시판, 자료실)',
    '비회원 게시글 작성 (스팸 방지)',
    '관리자 대시보드 (게시글 관리, 방문자 통계, 백업 관리)',
    '시니어 특화 기능 (3단계 글자 크기 조절, 고대비 모드, 큰 버튼 UI)',
    'Google Analytics 연동',
    '기본 SEO 설정'
]

for item in items:
    pdf.cell(5, 6, '•', 0, 0)
    pdf.multi_cell(0, 6, item)

pdf.ln(5)

pdf.set_font('NanumGothic', 'B', 12)
pdf.cell(0, 8, '개발 일정', 0, 1)
pdf.set_font('NanumGothic', '', 10)
schedule = [
    '1주차: 기획 및 디자인 시안',
    '2-3주차: 퍼블리싱 및 프론트엔드',
    '4주차: 백엔드 개발',
    '5주차: 테스트 및 오픈'
]

for item in schedule:
    pdf.cell(5, 6, '•', 0, 0)
    pdf.cell(0, 6, item, 0, 1)

pdf.ln(10)

# 프리미엄 패키지 상세
pdf.set_font('NanumGothic', 'B', 14)
pdf.cell(0, 10, '프리미엄 패키지 (정가 750만원)', 0, 1)
pdf.ln(5)

pdf.set_font('NanumGothic', 'B', 12)
pdf.cell(0, 8, '포함 사항', 0, 1)
pdf.set_font('NanumGothic', '', 10)

premium_items = [
    '메인 페이지 + 24개 서브 페이지',
    '게시판 5개 (공지, 자유, 자료실, 갤러리, Q&A)',
    '회원/비회원 통합 시스템',
    '고급 관리자 시스템 (실시간 모니터링, 스팸 필터링, 상세 통계)',
    '프리미엄 접근성 (5단계 글자 크기, 음성 안내, 키보드 네비게이션)',
    '문서 뷰어 (PDF, HWP)',
    '네이버/구글 통계 연동'
]

for item in premium_items:
    pdf.cell(5, 6, '•', 0, 0)
    pdf.multi_cell(0, 6, item)

# 유지보수 섹션
pdf.add_page()
pdf.set_font('NanumGothic', 'B', 14)
pdf.cell(0, 10, '유지보수 및 운영 비용 (월 단위)', 0, 1)
pdf.ln(5)

# 유지보수 테이블
pdf.set_font('NanumGothic', 'B', 11)
pdf.cell(60, 8, '구분', 1, 0, 'C')
pdf.cell(60, 8, '베이직', 1, 0, 'C')
pdf.cell(60, 8, '스탠다드', 1, 1, 'C')

pdf.set_font('NanumGothic', '', 10)
maintenance_rows = [
    ['월 비용', '10만원', '18만원'],
    ['호스팅', '공유 호스팅', 'VPS'],
    ['트래픽', '월 100GB', '월 300GB'],
    ['저장 공간', '20GB', '50GB'],
    ['백업', '주 2회', '일 1회'],
    ['보안 업데이트', '월 2회', '주 1회'],
    ['콘텐츠 수정', '월 3건', '월 8건'],
    ['기술 지원', '이메일', '이메일+전화'],
    ['응답 시간', '24시간', '12시간']
]

for row in maintenance_rows:
    pdf.cell(60, 7, row[0], 1, 0, 'C')
    pdf.cell(60, 7, row[1], 1, 0, 'C')
    pdf.cell(60, 7, row[2], 1, 1, 'C')

pdf.ln(10)

# 계약 조건
pdf.set_font('NanumGothic', 'B', 14)
pdf.cell(0, 10, '계약 조건', 0, 1)
pdf.ln(5)

pdf.set_font('NanumGothic', 'B', 12)
pdf.cell(0, 8, '결제 조건', 0, 1)
pdf.set_font('NanumGothic', '', 10)
payment_terms = [
    '계약금: 30% (계약 시)',
    '중도금: 40% (디자인 확정 시)',
    '잔금: 30% (오픈 완료 시)',
    '부가세 별도, 세금계산서 발행'
]

for term in payment_terms:
    pdf.cell(5, 6, '•', 0, 0)
    pdf.cell(0, 6, term, 0, 1)

pdf.ln(10)

# 문의사항
pdf.set_font('NanumGothic', 'B', 14)
pdf.cell(0, 10, '문의사항', 0, 1)
pdf.set_font('NanumGothic', '', 11)
pdf.cell(0, 7, '권용범 / 010-3825-5659 / gyb07190@gmail.com', 0, 1)
pdf.cell(0, 7, '이메일 및 카카오톡 상담 가능', 0, 1)
pdf.cell(0, 7, '추가 협상 환영', 0, 1)
pdf.ln(10)

pdf.set_font('NanumGothic', 'B', 11)
pdf.cell(0, 7, '본 제안서 유효기간: 2024년 9월 30일까지', 0, 1)
pdf.set_font('NanumGothic', '', 10)
pdf.cell(0, 7, '최종 견적은 상세 협의 후 조정 가능합니다.', 0, 1)

# PDF 저장
output_path = 'C:/Users/gyb07/projects/사단법인_홈페이지_견적서.pdf'
pdf.output(output_path)
print(f"PDF 파일이 생성되었습니다: {output_path}")