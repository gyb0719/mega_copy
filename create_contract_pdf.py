from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
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
    "쇼핑몰앱_개발계약서_2025.pdf",
    pagesize=A4,
    rightMargin=15*mm,
    leftMargin=15*mm,
    topMargin=20*mm,
    bottomMargin=20*mm
)

# 스타일 정의
styles = getSampleStyleSheet()

# 제목 스타일
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=24,
    textColor=colors.HexColor('#1A1A1A'),
    alignment=TA_CENTER,
    fontName=font_bold,
    spaceAfter=30,
    leading=28
)

# 조항 제목 스타일
clause_style = ParagraphStyle(
    'ClauseTitle',
    parent=styles['Heading2'],
    fontSize=16,
    textColor=colors.HexColor('#2C3E50'),
    fontName=font_bold,
    spaceAfter=15,
    spaceBefore=25,
    leading=20
)

# 서브섹션 스타일
subsection_style = ParagraphStyle(
    'SubSection',
    parent=styles['Heading3'],
    fontSize=13,
    textColor=colors.HexColor('#34495E'),
    fontName=font_bold,
    spaceAfter=10,
    spaceBefore=12,
    leading=16
)

# 일반 텍스트 스타일
normal_style = ParagraphStyle(
    'CustomNormal',
    parent=styles['Normal'],
    fontSize=10,
    fontName=font_name,
    leading=13,
    textColor=colors.HexColor('#333333')
)

# 굵은 텍스트 스타일
bold_style = ParagraphStyle(
    'CustomBold',
    parent=styles['Normal'],
    fontSize=10,
    fontName=font_bold,
    leading=13,
    textColor=colors.HexColor('#1A1A1A')
)

# 컨텐츠 작성
story = []

# 제목
story.append(Paragraph("소프트웨어 개발 계약서", title_style))
story.append(Spacer(1, 20))

# 계약 정보
story.append(Paragraph("계약 정보", clause_style))
contract_info = [
    ['항목', '내용'],
    ['계약일자', '2025년 ___월 ___일'],
    ['계약명', '쇼핑몰 모바일 앱 개발 계약'],
    ['계약기간', '계약일로부터 2주']
]
contract_table = Table(contract_info, colWidths=[100, 340])
contract_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E8E8E8')),
    ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#F5F5F5')),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(contract_table)
story.append(Spacer(1, 25))

# 제1조 - 계약 당사자
story.append(Paragraph("제1조 - 계약 당사자", clause_style))

story.append(Paragraph("발주자 (이하 \"갑\")", subsection_style))
party_a_data = [
    ['구분', '내용'],
    ['상호/성명', ''],
    ['사업자등록번호', ''],
    ['주소', ''],
    ['연락처', ''],
    ['이메일', '']
]
party_a_table = Table(party_a_data, colWidths=[120, 320])
party_a_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E8E8E8')),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
]))
story.append(party_a_table)
story.append(Spacer(1, 15))

story.append(Paragraph("개발자 (이하 \"을\")", subsection_style))
party_b_data = [
    ['구분', '내용'],
    ['상호/성명', 'Devyb'],
    ['사업자등록번호', ''],
    ['주소', ''],
    ['연락처', '010-3825-5659'],
    ['이메일', '']
]
party_b_table = Table(party_b_data, colWidths=[120, 320])
party_b_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E8E8E8')),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
]))
story.append(party_b_table)
story.append(Spacer(1, 25))

# 제2조 - 개발 내용
story.append(Paragraph("제2조 - 개발 내용", clause_style))

story.append(Paragraph("2.1 프로젝트 개요", subsection_style))
project_data = [
    ['구분', '내용'],
    ['프로젝트명', '쇼핑몰 모바일 앱 개발'],
    ['개발방식', 'Flutter 크로스플랫폼 개발'],
    ['개발기간', '2주 (작업 시작일로부터)']
]
project_table = Table(project_data, colWidths=[100, 340])
project_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E8E8E8')),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(project_table)
story.append(Spacer(1, 15))

story.append(Paragraph("2.2 개발 범위 - 기본 개발 (안드로이드)", subsection_style))
scope_data = [
    ['NO', '기능', '상세 내용'],
    ['1', '상품 관리', '상품 목록, 상세 페이지, 카테고리 분류'],
    ['2', '검색 시스템', '상품명 검색, 카테고리별 검색, 검색 필터'],
    ['3', '게시판', '공지사항 관리, 이벤트 게시판, CRUD 기능'],
    ['4', '상담 연동', '카카오톡 1:1 상담, 상품별 문의 버튼'],
    ['5', '관리자 패널', '웹 기반 관리 시스템, 상품/게시글 관리'],
    ['6', '백엔드', 'Firebase 구축, 데이터베이스 연동, 이미지 저장소'],
    ['7', '스토어 출시', 'Google Play Store 등록 및 출시 지원']
]
scope_table = Table(scope_data, colWidths=[30, 90, 320])
scope_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 9),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (1, 1), (1, -1), font_bold, 9),
    ('ALIGN', (0, 0), (0, -1), 'CENTER'),
    ('ALIGN', (1, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498DB')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F0F8FF')]),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
    ('TOPPADDING', (0, 0), (-1, -1), 7),
]))
story.append(scope_table)

# 페이지 나누기
story.append(PageBreak())

# 제3조 - 개발 일정
story.append(Paragraph("제3조 - 개발 일정", clause_style))

story.append(Paragraph("3.1 전체 일정", subsection_style))
schedule_data = [
    ['구분', '일자'],
    ['계약 체결일', '2025년 ___월 ___일'],
    ['개발 착수일', '2025년 ___월 ___일'],
    ['최종 납품일', '2025년 ___월 ___일 (착수일로부터 14일)']
]
schedule_table = Table(schedule_data, colWidths=[120, 320])
schedule_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E8E8E8')),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(schedule_table)
story.append(Spacer(1, 15))

story.append(Paragraph("3.2 개발 단계별 일정", subsection_style))
milestone_data = [
    ['주차', '기간', '주요 작업', '산출물'],
    ['1주차', 'Day 1-2', '요구사항 분석, UI/UX 설계', '설계 문서'],
    ['', 'Day 3-5', '상품 관리, 검색/카테고리', '핵심 기능'],
    ['', 'Day 6-7', '카카오톡 연동, 기본 테스트', '1차 빌드'],
    ['2주차', 'Day 8-10', '관리자 패널, 통합 테스트', '관리 시스템'],
    ['', 'Day 11-12', '버그 수정, 최적화', '안정화 버전'],
    ['', 'Day 13-14', '스토어 출시, 최종 납품', '최종 앱']
]
milestone_table = Table(milestone_data, colWidths=[50, 60, 200, 130])
milestone_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 9),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (0, 1), (0, 1), font_bold, 9),
    ('FONT', (0, 4), (0, 4), font_bold, 9),
    ('ALIGN', (0, 0), (1, -1), 'CENTER'),
    ('ALIGN', (2, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498DB')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('SPAN', (0, 1), (0, 3)),
    ('SPAN', (0, 4), (0, 6)),
    ('BACKGROUND', (0, 1), (-1, 3), colors.HexColor('#EBF5FB')),
    ('BACKGROUND', (0, 4), (-1, 6), colors.HexColor('#E8F8F5')),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
]))
story.append(milestone_table)
story.append(Spacer(1, 25))

# 제4조 - 개발 대금
story.append(Paragraph("제4조 - 개발 대금", clause_style))

story.append(Paragraph("4.1 계약 금액", subsection_style))
price_data = [
    ['구분', '항목', '단가', '금액'],
    ['필수', '안드로이드 앱 개발', '1,500,000원', '1,500,000원'],
    ['선택', 'iOS 앱 추가 개발', '500,000원', '☐ 선택 시 추가'],
    ['', '소계', '', '___________원'],
    ['', 'VAT (10%)', '', '___________원'],
    ['', '총 계약금액', '', '___________원']
]
price_table = Table(price_data, colWidths=[60, 180, 100, 100])
price_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('FONT', (1, 5), (1, 5), font_bold, 10),
    ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
    ('ALIGN', (0, 0), (1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2ECC71')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 5), (-1, 5), colors.HexColor('#FFFACD')),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(price_table)
story.append(Spacer(1, 15))

story.append(Paragraph("4.2 지급 일정", subsection_style))
payment_data = [
    ['회차', '구분', '비율', '금액', '지급 시점'],
    ['1', '계약금', '30%', '___________원', '계약 체결 시'],
    ['2', '중도금', '40%', '___________원', '1주차 완료 시'],
    ['3', '잔금', '30%', '___________원', '최종 납품 시']
]
payment_table = Table(payment_data, colWidths=[40, 60, 50, 100, 190])
payment_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (1, 1), (1, -1), font_bold, 10),
    ('ALIGN', (0, 0), (2, -1), 'CENTER'),
    ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
    ('ALIGN', (4, 0), (4, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E67E22')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FEF5E7')]),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(payment_table)

# 페이지 나누기
story.append(PageBreak())

# 제5조 - 납품 및 검수
story.append(Paragraph("제5조 - 납품 및 검수", clause_style))

story.append(Paragraph("5.1 납품 내역", subsection_style))
delivery_data = [
    ['구분', '항목', '형태', '납품 방법'],
    ['1', '안드로이드 앱', 'APK 파일', '이메일/USB'],
    ['2', '소스코드', 'Flutter 프로젝트', 'GitHub/압축파일'],
    ['3', '기술문서', '설치 및 운영 가이드', 'PDF/MD 파일'],
    ['4', '관리자 패널', '웹 URL 및 계정 정보', '문서 제공'],
    ['5', '매뉴얼', '관리자 사용 설명서', 'PDF/동영상'],
    ['6', '교육', '1:1 운영 교육 (1시간)', '대면/화상']
]
delivery_table = Table(delivery_data, colWidths=[40, 100, 150, 150])
delivery_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 9),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (1, 1), (1, -1), font_bold, 9),
    ('ALIGN', (0, 0), (0, -1), 'CENTER'),
    ('ALIGN', (1, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#95A5A6')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#ECEFF1')]),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
    ('TOPPADDING', (0, 0), (-1, -1), 7),
]))
story.append(delivery_table)
story.append(Spacer(1, 15))

story.append(Paragraph("5.2 검수 절차", subsection_style))
inspection_data = [
    ['단계', '내용', '기한', '담당'],
    ['1', '납품 완료 통보', '개발 완료 시', '을'],
    ['2', '검수 진행', '통보일로부터 7일', '갑'],
    ['3', '수정 요청', '검수 기간 내', '갑'],
    ['4', '수정 완료', '요청일로부터 3일', '을'],
    ['5', '최종 승인', '수정 완료 후 3일', '갑']
]
inspection_table = Table(inspection_data, colWidths=[40, 180, 120, 100])
inspection_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 9),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('ALIGN', (0, 0), (0, -1), 'CENTER'),
    ('ALIGN', (1, 0), (-1, -1), 'LEFT'),
    ('ALIGN', (3, 0), (3, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#95A5A6')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
    ('TOPPADDING', (0, 0), (-1, -1), 7),
]))
story.append(inspection_table)
story.append(Spacer(1, 10))
story.append(Paragraph("※ 검수 기간 내 이의 제기가 없을 경우 검수 완료로 간주", normal_style))
story.append(Spacer(1, 25))

# 제6조 - 유지보수
story.append(Paragraph("제6조 - 유지보수", clause_style))

story.append(Paragraph("6.1 무상 유지보수", subsection_style))
free_support_data = [
    ['구분', '내용'],
    ['기간', '최종 납품일로부터 1개월'],
    ['대응 시간', '평일 09:00 ~ 18:00'],
    ['대응 방법', '전화, 이메일, 원격 지원'],
    ['지원 범위', '버그 수정, 오류 대응, 기본 기능 문의']
]
free_support_table = Table(free_support_data, colWidths=[100, 340])
free_support_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#16A085')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(free_support_table)
story.append(Spacer(1, 15))

story.append(Paragraph("6.2 유상 유지보수 (선택)", subsection_style))
paid_support_data = [
    ['서비스', '월 비용', '포함 내역'],
    ['베이직', '150,000원', '버그 수정, 정기 업데이트, 기술 지원 (평일)'],
    ['프리미엄', '250,000원', '베이직 포함, 기능 개선, 24시간 긴급 지원, 월 1회 신기능']
]
paid_support_table = Table(paid_support_data, colWidths=[70, 80, 290])
paid_support_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 9),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (0, 1), (0, -1), font_bold, 9),
    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#16A085')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#E8F8F5'), colors.HexColor('#FEF9E7')]),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(paid_support_table)

# 페이지 나누기
story.append(PageBreak())

# 제7조 - 지적재산권
story.append(Paragraph("제7조 - 지적재산권", clause_style))
ip_data = [
    ['구분', '내용', '시점'],
    ['개발 중', '저작권은 \"을\"에게 귀속', '개발 기간'],
    ['대금 완납 후', '모든 권리 \"갑\"에게 이전', '잔금 입금 확인 시'],
    ['포트폴리오', '\"을\"은 개발 사실 공개 가능', '계약 기간 무관']
]
ip_table = Table(ip_data, colWidths=[100, 240, 100])
ip_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8E44AD')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(ip_table)
story.append(Spacer(1, 25))

# 제8조 - 비밀유지
story.append(Paragraph("제8조 - 비밀유지", clause_style))
confidential_data = [
    ['구분', '대상 정보', '의무 사항'],
    ['영업 비밀', '사업 계획, 마케팅 전략', '제3자 공개 금지'],
    ['기술 정보', '소스코드, API 키, 서버 정보', '보안 유지'],
    ['개인 정보', '고객 정보, 연락처', '목적 외 사용 금지']
]
confidential_table = Table(confidential_data, colWidths=[80, 180, 180])
confidential_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#C0392B')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(confidential_table)
story.append(Spacer(1, 8))
story.append(Paragraph("※ 비밀유지 기간: 계약 종료 후 2년", normal_style))
story.append(Spacer(1, 25))

# 제9조 - 계약 해지
story.append(Paragraph("제9조 - 계약 해지", clause_style))
termination_data = [
    ['귀책 사유', '정산 방법', '비율'],
    ['갑의 귀책', '진행률 + 위약금', '진행률 + 20%'],
    ['을의 귀책', '기 수령액 반환', '100% 반환'],
    ['상호 합의', '진행률 기준 정산', '실제 진행률'],
    ['불가항력', '진행률 기준 정산', '실제 진행률']
]
termination_table = Table(termination_data, colWidths=[120, 200, 120])
termination_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E74C3C')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(termination_table)
story.append(Spacer(1, 25))

# 제10조 - 책임 및 보증
story.append(Paragraph("제10조 - 책임 및 보증", clause_style))
liability_data = [
    ['구분', '책임 내용', '한도'],
    ['하자 보수', '무상 AS 기간 내 무상 수정', '1개월'],
    ['손해 배상', '직접 손해에 한정', '계약금액 100%'],
    ['간접 손해', '영업 손실, 기회 비용 등', '책임 없음']
]
liability_table = Table(liability_data, colWidths=[80, 260, 100])
liability_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('ALIGN', (2, 0), (2, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495E')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(liability_table)
story.append(Spacer(1, 30))

# 계약 체결
story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
story.append(Spacer(1, 20))

story.append(Paragraph("계약 체결", clause_style))
story.append(Spacer(1, 10))
story.append(Paragraph("본 계약의 내용을 충분히 검토하고 이에 합의하여 계약을 체결하며,", normal_style))
story.append(Paragraph("계약서 2부를 작성하여 \"갑\"과 \"을\"이 서명 날인 후 각 1부씩 보관한다.", normal_style))
story.append(Spacer(1, 30))

# 서명란
story.append(Paragraph("<b>계약 체결일: 2025년 ___월 ___일</b>", bold_style))
story.append(Spacer(1, 30))

signature_data = [
    ['구분', '발주자 (갑)', '개발자 (을)'],
    ['상호/성명', '', 'Devyb'],
    ['대표자', '', ''],
    ['서명', '(인)', '(인)']
]
signature_table = Table(signature_data, colWidths=[80, 180, 180])
signature_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2C3E50')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
    ('TOPPADDING', (0, 0), (-1, -1), 15),
    ('BOTTOMPADDING', (0, 3), (-1, 3), 30),
]))
story.append(signature_table)
story.append(Spacer(1, 40))

# 첨부 서류
story.append(Paragraph("첨부 서류", subsection_style))
attachment_data = [
    ['NO', '서류명', '제출자', '확인'],
    ['1', '견적서 (2025년 8월 25일자)', '을', '☐'],
    ['2', '사업자등록증 사본', '갑/을', '☐'],
    ['3', '통장 사본', '을', '☐'],
    ['4', '신분증 사본', '갑/을', '☐']
]
attachment_table = Table(attachment_data, colWidths=[40, 250, 70, 80])
attachment_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 9),
    ('FONT', (0, 0), (-1, 0), font_bold, 10),
    ('ALIGN', (0, 0), (0, -1), 'CENTER'),
    ('ALIGN', (1, 0), (1, -1), 'LEFT'),
    ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#95A5A6')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(attachment_table)

story.append(Spacer(1, 40))
story.append(Paragraph("- 계약서 끝 -", ParagraphStyle(
    'End',
    parent=styles['Normal'],
    fontSize=12,
    fontName=font_bold,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#2C3E50')
)))

# PDF 생성
pdf.build(story)
print("PDF 파일이 생성되었습니다: 쇼핑몰앱_개발계약서_2025.pdf")