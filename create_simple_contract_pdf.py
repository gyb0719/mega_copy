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

# PDF 문서 생성 (더 심플한 여백)
pdf = SimpleDocTemplate(
    "쇼핑몰앱_개발계약서_2025_simple.pdf",
    pagesize=A4,
    rightMargin=20*mm,
    leftMargin=20*mm,
    topMargin=25*mm,
    bottomMargin=25*mm
)

# 스타일 정의 (더 심플하게)
styles = getSampleStyleSheet()

# 제목 스타일 (심플하게)
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

# 조항 제목 스타일 (더 작게)
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
    ['계약일자', '2025년 ___월 ___일'],
    ['계약명', '쇼핑몰 모바일 앱 개발 계약'],
    ['계약기간', '계약일로부터 2주']
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
    ['상호/성명', ''],
    ['주소', ''],
    ['연락처', ''],
    ['이메일', '']
]
party_a_table = Table(party_a_data, colWidths=[100, 350])
party_a_table.setStyle(get_simple_table_style())
story.append(party_a_table)
story.append(Spacer(1, 12))

story.append(Paragraph("개발자 (이하 \"을\")", subsection_style))
party_b_data = [
    ['구분', '내용'],
    ['상호/성명', '권용범'],
    ['주소', ''],
    ['연락처', '010-3825-5659'],
    ['이메일', 'gyb07190@gmail.com']
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
    ['프로젝트명', '쇼핑몰 모바일 앱 개발'],
    ['개발방식', 'Flutter 크로스플랫폼 개발'],
    ['개발기간', '2주 (작업 시작일로부터)']
]
project_table = Table(project_data, colWidths=[100, 350])
project_table.setStyle(get_simple_table_style())
story.append(project_table)
story.append(Spacer(1, 12))

story.append(Paragraph("2.2 개발 범위", subsection_style))
scope_data = [
    ['구분', '내용'],
    ['상품 관리', '상품 목록, 상세 페이지, 카테고리 분류'],
    ['검색 시스템', '상품명 검색, 카테고리별 검색, 검색 필터'],
    ['게시판', '공지사항 관리, 이벤트 게시판'],
    ['상담 연동', '카카오톡 1:1 상담 버튼'],
    ['관리자 패널', '웹 기반 상품/게시글 관리 시스템'],
    ['백엔드', 'Firebase 구축 및 연동'],
    ['스토어 출시', 'Google Play Store 등록 지원']
]
scope_table = Table(scope_data, colWidths=[100, 350])
scope_table.setStyle(get_simple_table_style())
story.append(scope_table)
story.append(Spacer(1, 12))

# iOS 선택 옵션
ios_option = [
    ['선택', 'iOS 앱 추가 개발', '+500,000원 (선택 시 체크 ☐)']
]
ios_table = Table(ios_option, colWidths=[50, 250, 150])
ios_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('BOX', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(ios_table)

# 페이지 나누기
story.append(PageBreak())

# 제3조 - 개발 일정
story.append(Paragraph("제3조 【개발 일정】", clause_style))

schedule_data = [
    ['구분', '일자'],
    ['계약 체결일', '2025년 ___월 ___일'],
    ['개발 착수일', '2025년 ___월 ___일'],
    ['최종 납품일', '2025년 ___월 ___일 (착수일로부터 14일)']
]
schedule_table = Table(schedule_data, colWidths=[120, 330])
schedule_table.setStyle(get_simple_table_style())
story.append(schedule_table)
story.append(Spacer(1, 20))

# 제4조 - 개발 대금
story.append(Paragraph("제4조 【개발 대금 및 지급 방법】", clause_style))

story.append(Paragraph("4.1 계약 금액", subsection_style))
price_data = [
    ['항목', '금액'],
    ['안드로이드 앱 개발 (기본)', '1,500,000원'],
    ['iOS 앱 추가 개발 (선택)', '500,000원'],
    ['소계', '___________원'],
    ['VAT (10%)', '___________원'],
    ['총 계약금액', '___________원']
]
price_table = Table(price_data, colWidths=[200, 250])
price_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('FONT', (0, 5), (0, 5), font_bold, 11),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.3, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.95, 0.95, 0.95)),
    ('BACKGROUND', (0, 5), (-1, 5), colors.Color(0.98, 0.98, 0.98)),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
]))
story.append(price_table)
story.append(Spacer(1, 12))

story.append(Paragraph("4.2 지급 일정", subsection_style))
payment_data = [
    ['구분', '비율', '금액', '지급 시점'],
    ['계약금', '30%', '___________원', '계약 체결 시'],
    ['중도금', '40%', '___________원', '1주차 완료 시'],
    ['잔금', '30%', '___________원', '최종 납품 시']
]
payment_table = Table(payment_data, colWidths=[80, 60, 120, 190])
payment_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('ALIGN', (1, 0), (1, -1), 'CENTER'),
    ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.3, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.95, 0.95, 0.95)),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
]))
story.append(payment_table)
story.append(Spacer(1, 12))

story.append(Paragraph("4.3 지급 계좌", subsection_style))
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

# 페이지 나누기
story.append(PageBreak())

# 제5조 - 납품 및 검수
story.append(Paragraph("제5조 【납품 및 검수】", clause_style))

story.append(Paragraph("5.1 납품 내역", subsection_style))
delivery_data = [
    ['항목', '형태'],
    ['안드로이드 앱', 'APK 파일'],
    ['소스코드', 'Flutter 프로젝트 전체 (GitHub/압축파일)'],
    ['기술문서', '설치 및 운영 가이드 (PDF)'],
    ['관리자 패널', '웹 URL 및 계정 정보'],
    ['교육', '1:1 운영 교육 (1시간)']
]
delivery_table = Table(delivery_data, colWidths=[150, 300])
delivery_table.setStyle(get_simple_table_style())
story.append(delivery_table)
story.append(Spacer(1, 12))

story.append(Paragraph("5.2 검수 기간", subsection_style))
story.append(Paragraph("• \"갑\"은 납품일로부터 7일 이내 검수를 완료한다", normal_style))
story.append(Paragraph("• 검수 기간 내 이의를 제기하지 않을 경우 검수 완료로 간주한다", normal_style))
story.append(Paragraph("• 검수 과정에서 발견된 하자는 \"을\"이 무상으로 수정한다", normal_style))
story.append(Paragraph("• 계약 범위 외 추가 요구사항은 별도 협의한다", normal_style))
story.append(Spacer(1, 20))

# 제6조 - 유지보수
story.append(Paragraph("제6조 【유지보수】", clause_style))

story.append(Paragraph("6.1 무상 유지보수", subsection_style))
story.append(Paragraph("• 기간: 최종 납품일로부터 1개월", normal_style))
story.append(Paragraph("• 범위: 프로그램 오류 수정, 버그 수정, 기본 기능 문의 응대", normal_style))
story.append(Paragraph("• 대응 시간: 평일 09:00 ~ 18:00", normal_style))
story.append(Spacer(1, 12))

story.append(Paragraph("6.2 유상 유지보수 (선택)", subsection_style))
maintenance_data = [
    ['서비스', '월 비용', '포함 내역'],
    ['베이직', '150,000원', '버그 수정, 정기 업데이트, 기술 지원'],
    ['프리미엄', '250,000원', '베이직 + 기능 개선, 24시간 지원']
]
maintenance_table = Table(maintenance_data, colWidths=[80, 90, 280])
maintenance_table.setStyle(get_simple_table_style())
story.append(maintenance_table)
story.append(Spacer(1, 20))

# 제7조 - 지적재산권
story.append(Paragraph("제7조 【지적재산권】", clause_style))
story.append(Paragraph("• 개발 완료 후 대금 완납 시 소스코드 및 산출물의 소유권은 \"갑\"에게 이전된다", normal_style))
story.append(Paragraph("• \"을\"은 포트폴리오 목적으로 개발 사실을 공개할 수 있다", normal_style))
story.append(Paragraph("• 오픈소스 라이브러리의 라이선스는 각 라이브러리의 정책을 따른다", normal_style))
story.append(Spacer(1, 20))

# 제8조 - 비밀유지
story.append(Paragraph("제8조 【비밀유지】", clause_style))
story.append(Paragraph("• 양 당사자는 본 계약과 관련하여 취득한 상대방의 정보를 제3자에게 누설하지 않는다", normal_style))
story.append(Paragraph("• 비밀유지 기간: 계약 종료 후 2년", normal_style))
story.append(Spacer(1, 20))

# 제9조 - 계약 해지
story.append(Paragraph("제9조 【계약 해지】", clause_style))
story.append(Paragraph("9.1 해지 사유", subsection_style))
story.append(Paragraph("• 일방이 계약 내용을 위반하고 시정 요구 후 7일 이내 시정하지 않는 경우", normal_style))
story.append(Paragraph("• 일방이 파산, 회생 절차를 신청한 경우", normal_style))
story.append(Spacer(1, 8))

story.append(Paragraph("9.2 해지 시 정산", subsection_style))
termination_data = [
    ['귀책 사유', '정산 방법'],
    ['갑의 귀책', '진행률 기준 + 20% 위약금'],
    ['을의 귀책', '기 수령액 전액 반환'],
    ['상호 합의', '실제 진행률 기준 정산']
]
termination_table = Table(termination_data, colWidths=[150, 300])
termination_table.setStyle(get_simple_table_style())
story.append(termination_table)

# 페이지 나누기
story.append(PageBreak())

# 제10조 - 책임 제한
story.append(Paragraph("제10조 【책임 제한】", clause_style))
story.append(Paragraph("• \"을\"은 납품 후 발견된 하자에 대해 무상 유지보수 기간 동안 보수 책임을 진다", normal_style))
story.append(Paragraph("• 각 당사자의 손해배상 책임은 계약금액을 초과하지 않는다", normal_style))
story.append(Spacer(1, 20))

# 제11조 - 기타 사항
story.append(Paragraph("제11조 【기타 사항】", clause_style))
story.append(Paragraph("• 모든 통지는 계약서에 기재된 주소/이메일로 한다", normal_style))
story.append(Paragraph("• 본 계약과 관련한 분쟁은 상호 협의로 해결하며, 협의가 되지 않을 경우 \"을\"의 소재지 관할 법원으로 한다", normal_style))
story.append(Spacer(1, 12))

story.append(Paragraph("특약 사항", subsection_style))
story.append(Paragraph("☐ iOS 앱스토어 개발자 계정은 \"갑\"이 준비한다 (연 $99)", normal_style))
story.append(Paragraph("☐ 서버 호스팅 비용은 \"갑\"이 부담한다", normal_style))
story.append(Paragraph("☐ 추가 기능 개발 시 별도 견적을 산정한다", normal_style))
story.append(Spacer(1, 30))

# 계약 체결
story.append(HRFlowable(width="100%", thickness=0.5, color=colors.black))
story.append(Spacer(1, 20))

story.append(Paragraph("본 계약을 증명하기 위하여 계약서 2부를 작성하여 \"갑\"과 \"을\"이 서명 날인 후 각 1부씩 보관한다.", normal_style))
story.append(Spacer(1, 30))

# 날짜
story.append(Paragraph("<b>2025년 ___월 ___일</b>", ParagraphStyle(
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
    ['', '발주자 (갑)', '개발자 (을)'],
    ['상호/성명', '', '권용범'],
    ['대표자', '', '권용범'],
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
    ('BOTTOMPADDING', (0, 3), (-1, 3), 25),
]))
story.append(signature_table)
story.append(Spacer(1, 40))

# 첨부 서류
story.append(Paragraph("첨부 서류", subsection_style))
story.append(Paragraph("1. 견적서 (2025년 8월 25일자)", normal_style))
story.append(Paragraph("2. 사업자등록증 사본 (양 당사자)", normal_style))
story.append(Paragraph("3. 통장 사본 (\"을\")", normal_style))
story.append(Paragraph("4. 기타: _____________________", normal_style))

# PDF 생성
pdf.build(story)
print("심플한 디자인의 PDF 파일이 생성되었습니다: 쇼핑몰앱_개발계약서_2025_simple.pdf")