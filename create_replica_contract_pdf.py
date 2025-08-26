from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus.flowables import HRFlowable
import os

# 한글 폰트 등록
try:
    pdfmetrics.registerFont(TTFont('Malgun', 'C:/Windows/Fonts/malgun.ttf'))
    pdfmetrics.registerFont(TTFont('MalgunBold', 'C:/Windows/Fonts/malgunbd.ttf'))
    font_name = 'Malgun'
    font_bold = 'MalgunBold'
except:
    font_name = 'Helvetica'
    font_bold = 'Helvetica-Bold'

# PDF 문서 생성
pdf = SimpleDocTemplate(
    "레플리카쇼핑몰_웹앱_계약서_2025.pdf",
    pagesize=A4,
    rightMargin=20*mm,
    leftMargin=20*mm,
    topMargin=25*mm,
    bottomMargin=25*mm
)

# 스타일 정의
styles = getSampleStyleSheet()

# 제목 스타일
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=20,
    textColor=colors.black,
    alignment=TA_CENTER,
    fontName=font_bold,
    spaceAfter=25,
    leading=24
)

# 조항 제목 스타일
clause_style = ParagraphStyle(
    'ClauseTitle',
    parent=styles['Heading2'],
    fontSize=14,
    textColor=colors.black,
    fontName=font_bold,
    spaceAfter=12,
    spaceBefore=20,
    leading=16
)

# 서브섹션 스타일
subsection_style = ParagraphStyle(
    'SubSection',
    parent=styles['Heading3'],
    fontSize=12,
    textColor=colors.black,
    fontName=font_bold,
    spaceAfter=8,
    spaceBefore=10,
    leading=14
)

# 일반 텍스트 스타일
normal_style = ParagraphStyle(
    'CustomNormal',
    parent=styles['Normal'],
    fontSize=10,
    fontName=font_name,
    leading=12,
    textColor=colors.black
)

# 굵은 텍스트 스타일
bold_style = ParagraphStyle(
    'CustomBold',
    parent=styles['Normal'],
    fontSize=10,
    fontName=font_bold,
    leading=12,
    textColor=colors.black
)

# 심플한 테이블 스타일 함수
def get_simple_table_style():
    return TableStyle([
        ('FONT', (0, 0), (-1, -1), font_name, 10),
        ('FONT', (0, 0), (-1, 0), font_bold, 11),
        ('FONT', (0, 1), (0, -1), font_bold, 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.3, colors.grey),
        ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.95, 0.95, 0.95)),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ])

# 컨텐츠 작성
story = []

# 제목
story.append(Paragraph("소프트웨어 개발 계약서", title_style))
story.append(Spacer(1, 15))

# 계약 정보
story.append(Paragraph("계약 정보", clause_style))
contract_info = [
    ['항목', '내용'],
    ['계약일자', '2025년 8월 26일'],
    ['계약명', '레플리카 쇼핑몰 웹앱 개발 계약'],
    ['개발방식', 'Flutter Web 개발'],
    ['개발기간', '2주 (작업 시작일로부터)']
]
contract_table = Table(contract_info, colWidths=[100, 350])
contract_table.setStyle(get_simple_table_style())
story.append(contract_table)
story.append(Spacer(1, 20))

# 제1조 - 계약 당사자
story.append(Paragraph("제1조 【계약 당사자】", clause_style))

story.append(Paragraph("발주자 (이하 \"갑\")", subsection_style))
party_a_data = [
    ['구분', '내용'],
    ['성명', '김병일'],
    ['주소', '서울 동대문구 외대역동로 14, 104동 1002호'],
    ['연락처', '010-9958-0601']
]
party_a_table = Table(party_a_data, colWidths=[100, 350])
party_a_table.setStyle(get_simple_table_style())
story.append(party_a_table)
story.append(Spacer(1, 12))

story.append(Paragraph("개발자 (이하 \"을\")", subsection_style))
party_b_data = [
    ['구분', '내용'],
    ['성명', '권용범'],
    ['주소', '경기도 광명시 소하로 162, 702동 1404호'],
    ['연락처', '010-3825-5659']
]
party_b_table = Table(party_b_data, colWidths=[100, 350])
party_b_table.setStyle(get_simple_table_style())
story.append(party_b_table)
story.append(Spacer(1, 20))

# 제2조 - 개발 내용
story.append(Paragraph("제2조 【개발 내용】", clause_style))

story.append(Paragraph("2.1 프로젝트 개요", subsection_style))
project_data = [
    ['구분', '내용'],
    ['프로젝트명', '레플리카 쇼핑몰 웹앱 개발'],
    ['개발방식', 'Flutter Web (반응형)'],
    ['특징', '결제 기능 제외, 카카오톡 상담 연동'],
    ['향후 확장성', '모바일 앱 배포 가능 구조']
]
project_table = Table(project_data, colWidths=[100, 350])
project_table.setStyle(get_simple_table_style())
story.append(project_table)
story.append(Spacer(1, 12))

story.append(Paragraph("2.2 개발 범위", subsection_style))
scope_data = [
    ['구분', '내용'],
    ['상품 관리', '카테고리별 분류, 목록/상세 페이지, 이미지 갤러리'],
    ['검색 시스템', '상품명 검색, 카테고리 필터, 정렬 기능'],
    ['공지사항', '공지사항 게시판, 이벤트 안내, 팝업 공지'],
    ['반응형 디자인', 'PC/모바일/태블릿 최적화'],
    ['이미지 시스템', '자동 리사이즈, 썸네일 생성, 최적화'],
    ['상담 연동', '카카오톡 채널 연결, 상품별 문의 버튼'],
    ['관리자 페이지', '상품/카테고리/공지사항 관리, 이미지 일괄 업로드']
]
scope_table = Table(scope_data, colWidths=[100, 350])
scope_table.setStyle(get_simple_table_style())
story.append(scope_table)
story.append(Spacer(1, 12))

story.append(Paragraph("2.3 제외 사항", subsection_style))
exclude_data = [
    ['항목', '내용'],
    ['결제 시스템', '온라인 결제 기능 없음 (카카오톡 상담으로 대체)'],
    ['회원 시스템', '회원 가입/로그인 없음 (비회원 전용)'],
    ['장바구니', '장바구니 기능 없음'],
    ['배포', '당장 배포 안 함 (추후 별도 협의)']
]
exclude_table = Table(exclude_data, colWidths=[100, 350])
exclude_table.setStyle(get_simple_table_style())
story.append(exclude_table)

# 페이지 나누기
story.append(PageBreak())

# 제3조 - 개발 일정
story.append(Paragraph("제3조 【개발 일정】", clause_style))

schedule_data = [
    ['구분', '일자'],
    ['계약 체결일', '2025년 8월 26일'],
    ['개발 착수일', '2025년 8월 26일'],
    ['최종 납품일', '2025년 9월 9일 (착수일로부터 14일)']
]
schedule_table = Table(schedule_data, colWidths=[120, 330])
schedule_table.setStyle(get_simple_table_style())
story.append(schedule_table)
story.append(Spacer(1, 12))

story.append(Paragraph("개발 단계별 일정", subsection_style))
milestone_data = [
    ['주차', '작업 내용', '산출물'],
    ['1주차', 'UI/UX 디자인, 상품 관리, 검색 기능, 반응형 레이아웃', '주요 기능 완성'],
    ['2주차', '관리자 페이지, 이미지 처리, 카카오톡 연동, 테스트', '최종 완성본']
]
milestone_table = Table(milestone_data, colWidths=[50, 250, 150])
milestone_table.setStyle(get_simple_table_style())
story.append(milestone_table)
story.append(Spacer(1, 20))

# 제4조 - 개발 대금
story.append(Paragraph("제4조 【개발 대금 및 지급 방법】", clause_style))

story.append(Paragraph("4.1 계약 금액", subsection_style))
price_data = [
    ['구분', '금액'],
    ['개발비', '1,200,000원'],
    ['VAT (10%)', '120,000원'],
    ['총 지급액', '1,320,000원']
]
price_table = Table(price_data, colWidths=[200, 250])
price_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('FONT', (0, 3), (0, 3), font_bold, 11),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.3, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.95, 0.95, 0.95)),
    ('BACKGROUND', (0, 3), (-1, 3), colors.Color(0.98, 0.98, 0.98)),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
]))
story.append(price_table)
story.append(Spacer(1, 12))

story.append(Paragraph("4.2 지급 방법", subsection_style))
account_data = [
    ['은행명', '신한은행'],
    ['계좌번호', '110-431-618023'],
    ['예금주', '권용범']
]
account_table = Table(account_data, colWidths=[100, 350])
account_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.3, colors.grey),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
]))
story.append(account_table)
story.append(Spacer(1, 20))

# 제5조 - 납품 및 검수
story.append(Paragraph("제5조 【납품 및 검수】", clause_style))

story.append(Paragraph("5.1 납품 내역", subsection_style))
delivery_data = [
    ['항목', '형태'],
    ['웹앱 소스코드', 'Flutter 프로젝트 전체'],
    ['관리자 페이지', '웹 기반 관리 시스템'],
    ['설치 문서', '로컬 실행 가이드'],
    ['관리자 매뉴얼', '상품 등록/관리 방법'],
    ['교육', '1시간 운영 교육']
]
delivery_table = Table(delivery_data, colWidths=[150, 300])
delivery_table.setStyle(get_simple_table_style())
story.append(delivery_table)
story.append(Spacer(1, 12))

story.append(Paragraph("5.2 검수 절차", subsection_style))
story.append(Paragraph("• 납품일로부터 7일 이내 검수 완료", normal_style))
story.append(Paragraph("• 검수 기간 내 이의 제기가 없을 경우 검수 완료로 간주", normal_style))
story.append(Paragraph("• 계약 범위 내 하자는 무상 수정", normal_style))
story.append(Paragraph("• 계약 범위 외 추가 요구사항은 별도 협의", normal_style))

# 페이지 나누기
story.append(PageBreak())

# 제6조 - 유지보수
story.append(Paragraph("제6조 【유지보수】", clause_style))

story.append(Paragraph("6.1 무상 유지보수", subsection_style))
free_support_data = [
    ['구분', '내용'],
    ['기간', '최종 납품일로부터 1개월'],
    ['범위', '버그 수정, 오류 대응, 기본 기능 문의'],
    ['대응 시간', '평일 09:00 ~ 18:00']
]
free_support_table = Table(free_support_data, colWidths=[100, 350])
free_support_table.setStyle(get_simple_table_style())
story.append(free_support_table)
story.append(Spacer(1, 12))

story.append(Paragraph("6.2 추가 개발 (별도 견적)", subsection_style))
additional_data = [
    ['항목', '예상 비용', '비고'],
    ['iOS/Android 앱 배포', '50만원', '스토어 등록 포함'],
    ['회원 시스템 추가', '30만원', '로그인/회원관리'],
    ['결제 시스템 연동', '40만원', 'PG사 연동'],
    ['서버 배포 및 설정', '30만원', '클라우드 서버 세팅']
]
additional_table = Table(additional_data, colWidths=[150, 100, 200])
additional_table.setStyle(get_simple_table_style())
story.append(additional_table)
story.append(Spacer(1, 20))

# 제7조 - 지적재산권
story.append(Paragraph("제7조 【지적재산권】", clause_style))
story.append(Paragraph("• 대금 완납 시 소스코드 및 산출물의 소유권은 \"갑\"에게 이전", normal_style))
story.append(Paragraph("• \"을\"은 포트폴리오 목적으로 개발 사실 공개 가능", normal_style))
story.append(Paragraph("• 오픈소스 라이브러리는 각 라이브러리 라이선스 준수", normal_style))
story.append(Spacer(1, 20))

# 제8조 - 비밀유지
story.append(Paragraph("제8조 【비밀유지】", clause_style))
story.append(Paragraph("• 상품 정보, 가격 정책, 고객 정보 등 비밀 유지", normal_style))
story.append(Paragraph("• 비밀유지 기간: 계약 종료 후 2년", normal_style))
story.append(Spacer(1, 20))

# 제9조 - 계약 해지
story.append(Paragraph("제9조 【계약 해지】", clause_style))
story.append(Paragraph("9.1 해지 사유", subsection_style))
story.append(Paragraph("• 계약 위반 후 7일 내 미시정", normal_style))
story.append(Paragraph("• 지급 지연 30일 초과", normal_style))
story.append(Paragraph("• 파산, 회생 절차 개시", normal_style))
story.append(Spacer(1, 8))

story.append(Paragraph("9.2 해지 시 정산", subsection_style))
termination_data = [
    ['귀책 사유', '정산 방법'],
    ['갑의 귀책', '진행률 + 20%'],
    ['을의 귀책', '기 수령액 반환'],
    ['상호 합의', '실제 진행률 정산']
]
termination_table = Table(termination_data, colWidths=[150, 300])
termination_table.setStyle(get_simple_table_style())
story.append(termination_table)
story.append(Spacer(1, 20))

# 제10조 - 책임 제한
story.append(Paragraph("제10조 【책임 제한】", clause_style))
story.append(Paragraph("• 하자 보수: 무상 AS 기간 내 무제한", normal_style))
story.append(Paragraph("• 손해 배상: 계약금액의 100% 한도", normal_style))
story.append(Paragraph("• 면책 사항: 제3자 침해, 천재지변", normal_style))
story.append(Spacer(1, 20))

# 제11조 - 특약 사항
story.append(Paragraph("제11조 【특약 사항】", clause_style))
story.append(Paragraph("☐ Flutter Web으로 개발하여 향후 앱 전환 가능", normal_style))
story.append(Paragraph("☐ 상품 이미지는 \"갑\"이 제공", normal_style))
story.append(Paragraph("☐ 카카오톡 채널은 \"갑\"이 개설 및 관리", normal_style))
story.append(Paragraph("☐ 배포 시 도메인 및 호스팅은 \"갑\" 부담", normal_style))
story.append(Paragraph("☐ 상품 특성상 이미지 품질 최우선", normal_style))
story.append(Spacer(1, 30))

# 계약 체결
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.black))
story.append(Spacer(1, 20))

story.append(Paragraph("본 계약의 내용을 충분히 검토하고 이에 합의하여 계약을 체결하며,", normal_style))
story.append(Paragraph("계약서 2부를 작성하여 \"갑\"과 \"을\"이 서명 날인 후 각 1부씩 보관한다.", normal_style))
story.append(Spacer(1, 30))

# 날짜
story.append(Paragraph("<b>계약 체결일: 2025년 8월 26일</b>", ParagraphStyle(
    'Date',
    parent=styles['Normal'],
    fontSize=12,
    fontName=font_bold,
    alignment=TA_CENTER,
    textColor=colors.black
)))
story.append(Spacer(1, 40))

# 서명란
signature_data = [
    ['구분', '발주자 (갑)', '개발자 (을)'],
    ['성명', '김병일', '권용범'],
    ['서명', '(인)', '(인)']
]
signature_table = Table(signature_data, colWidths=[80, 185, 185])
signature_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.3, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.95, 0.95, 0.95)),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ('TOPPADDING', (0, 0), (-1, -1), 12),
    ('BOTTOMPADDING', (0, 2), (-1, 2), 25),
]))
story.append(signature_table)

# PDF 생성
pdf.build(story)
print("PDF 파일이 생성되었습니다: 레플리카쇼핑몰_웹앱_계약서_2025.pdf".encode('utf-8').decode('utf-8'))