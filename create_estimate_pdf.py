from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus.tableofcontents import TableOfContents
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
    "쇼핑몰앱_견적서_2025.pdf",
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
    fontSize=28,
    textColor=colors.HexColor('#2C3E50'),
    alignment=TA_CENTER,
    fontName=font_bold,
    spaceAfter=40,
    leading=32
)

# 섹션 제목 스타일
section_style = ParagraphStyle(
    'SectionTitle',
    parent=styles['Heading2'],
    fontSize=18,
    textColor=colors.HexColor('#34495E'),
    fontName=font_bold,
    spaceAfter=20,
    spaceBefore=30,
    borderWidth=0,
    borderPadding=0,
    leading=22
)

# 서브섹션 스타일
subsection_style = ParagraphStyle(
    'SubSection',
    parent=styles['Heading3'],
    fontSize=14,
    textColor=colors.HexColor('#555555'),
    fontName=font_bold,
    spaceAfter=12,
    spaceBefore=15,
    leading=16
)

# 일반 텍스트 스타일
normal_style = ParagraphStyle(
    'CustomNormal',
    parent=styles['Normal'],
    fontSize=11,
    fontName=font_name,
    leading=14,
    textColor=colors.HexColor('#333333')
)

# 굵은 텍스트 스타일
bold_style = ParagraphStyle(
    'CustomBold',
    parent=styles['Normal'],
    fontSize=11,
    fontName=font_bold,
    leading=14,
    textColor=colors.HexColor('#2C3E50')
)

# 가격 강조 스타일
price_style = ParagraphStyle(
    'PriceStyle',
    parent=styles['Normal'],
    fontSize=16,
    fontName=font_bold,
    textColor=colors.HexColor('#E74C3C'),
    alignment=TA_CENTER,
    leading=20
)

# 컨텐츠 작성
story = []

# 제목
story.append(Paragraph("쇼핑몰 앱 개발 견적서", title_style))
story.append(Spacer(1, 20))

# 기본 정보 섹션
story.append(Paragraph("기본 정보", section_style))
info_data = [
    ['항목', '내용'],
    ['견적일자', '2025년 8월 25일'],
    ['유효기간', '견적일로부터 30일'],
    ['개발자', 'Devyb'],
    ['연락처', '010-3825-5659']
]
info_table = Table(info_data, colWidths=[100, 300])
info_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 11),
    ('FONT', (0, 0), (-1, 0), font_bold, 12),
    ('FONT', (0, 1), (0, -1), font_bold, 11),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ECF0F1')),
    ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#F8F9FA')),
    ('ROWBACKGROUNDS', (1, 1), (-1, -1), [colors.white, colors.HexColor('#FAFAFA')]),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
]))
story.append(info_table)
story.append(Spacer(1, 30))

# 프로젝트 개요
story.append(Paragraph("프로젝트 개요", section_style))
overview_data = [
    ['구분', '내용'],
    ['프로젝트명', '쇼핑몰 모바일 앱 개발'],
    ['개발방식', 'Flutter 크로스플랫폼 개발'],
    ['개발기간', '2주 (작업 시작일로부터)']
]
overview_table = Table(overview_data, colWidths=[100, 300])
overview_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 11),
    ('FONT', (0, 0), (-1, 0), font_bold, 12),
    ('FONT', (0, 1), (0, -1), font_bold, 11),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ECF0F1')),
    ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#F8F9FA')),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
]))
story.append(overview_table)
story.append(Spacer(1, 20))

# 주요 기능
story.append(Paragraph("주요 기능", subsection_style))
features_data = [
    ['NO', '기능명', '설명'],
    ['1', '상품 관리', '상품 목록, 상세 페이지, 카테고리 분류'],
    ['2', '검색 시스템', '상품명, 카테고리별 검색 기능'],
    ['3', '게시판', '공지사항, 이벤트 작성 및 관리'],
    ['4', '상담 연동', '카카오톡 1:1 상담 버튼'],
    ['5', '관리자 패널', '웹 기반 상품/게시글 관리 시스템'],
    ['6', '이미지 관리', '다중 이미지 업로드 및 관리']
]
features_table = Table(features_data, colWidths=[40, 100, 260])
features_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (1, 1), (1, -1), font_bold, 10),
    ('ALIGN', (0, 0), (0, -1), 'CENTER'),
    ('ALIGN', (1, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498DB')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F0F8FF')]),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(features_table)
story.append(Spacer(1, 30))

# 페이지 나누기
story.append(PageBreak())

# 개발 비용
story.append(Paragraph("개발 비용", section_style))
story.append(Spacer(1, 15))

# 안드로이드 앱 개발
story.append(Paragraph("[ 기본 ] 안드로이드 앱 개발", subsection_style))
story.append(Paragraph("1,500,000원 (VAT 별도)", price_style))
story.append(Spacer(1, 15))

android_data = [
    ['포함 내역', '상세 설명'],
    ['앱 개발', 'Flutter 기반 크로스플랫폼 개발 (iOS 호환 코드 포함)'],
    ['최적화', '안드로이드 OS 최적화 및 성능 튜닝'],
    ['스토어 출시', 'Google Play Store 등록 및 출시 지원'],
    ['백엔드', 'Firebase 기반 서버 구축 및 연동'],
    ['관리자 시스템', '반응형 웹 기반 관리자 패널'],
    ['유지보수', '1개월 무상 AS 제공']
]
android_table = Table(android_data, colWidths=[120, 280])
android_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2ECC71')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#E8F8F5')),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
]))
story.append(android_table)
story.append(Spacer(1, 25))

# iOS 추가 개발
story.append(Paragraph("[ 선택 ] iOS 앱 추가 개발", subsection_style))
story.append(Paragraph("+500,000원 (VAT 별도)", price_style))
story.append(Spacer(1, 15))

ios_data = [
    ['포함 내역', '상세 설명'],
    ['iOS 빌드', 'iOS 앱 빌드 및 최적화'],
    ['스토어 출시', 'Apple App Store 등록 지원'],
    ['UI/UX 조정', 'iOS 디자인 가이드라인 적용'],
    ['심사 대응', '앱 심사 대응 (최대 2회)']
]
ios_table = Table(ios_data, colWidths=[120, 280])
ios_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#9B59B6')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#F4ECF7')),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
]))
story.append(ios_table)
story.append(Spacer(1, 25))

# 패키지 요금표
story.append(Paragraph("패키지 요금표", subsection_style))
package_data = [
    ['패키지', '구성', '정가', '할인가', '절약액'],
    ['기본', '안드로이드', '1,500,000원', '-', '-'],
    ['프리미엄', '안드로이드 + iOS', '2,500,000원', '2,000,000원', '500,000원']
]
package_table = Table(package_data, colWidths=[70, 120, 90, 90, 70])
package_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('FONT', (3, 2), (3, 2), font_bold, 11),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495E')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#FFF9E6')),
    ('TEXTCOLOR', (3, 2), (3, 2), colors.HexColor('#E74C3C')),
    ('TEXTCOLOR', (4, 2), (4, 2), colors.HexColor('#27AE60')),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
]))
story.append(package_table)
story.append(Spacer(1, 30))

# 페이지 나누기
story.append(PageBreak())

# 개발 일정
story.append(Paragraph("개발 일정", section_style))
story.append(Spacer(1, 15))

story.append(Paragraph("2주 스프린트 계획", subsection_style))
schedule_data = [
    ['주차', '기간', '주요 작업', '산출물'],
    ['1주차', 'Day 1-2', '요구사항 분석, UI/UX 설계', '설계 문서'],
    ['', 'Day 3-5', '상품 관리 시스템, 검색/카테고리 기능', '핵심 기능 완성'],
    ['', 'Day 6-7', '카카오톡 연동, 기본 테스트', '1차 빌드'],
    ['2주차', 'Day 8-10', '관리자 패널 구현, 통합 테스트', '관리 시스템'],
    ['', 'Day 11-12', '버그 수정, 최적화', '안정화 버전'],
    ['', 'Day 13-14', '스토어 출시, 최종 납품', '최종 앱']
]
schedule_table = Table(schedule_data, colWidths=[50, 70, 200, 120])
schedule_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, 1), font_bold, 10),
    ('FONT', (0, 4), (0, 4), font_bold, 10),
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
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(schedule_table)
story.append(Spacer(1, 30))

# 추가 옵션
story.append(Paragraph("추가 옵션", section_style))
story.append(Spacer(1, 15))

story.append(Paragraph("선택 가능한 추가 기능", subsection_style))
option_data = [
    ['기능', '가격', '설명', '개발기간'],
    ['푸시 알림', '200,000원', '신상품 알림, 이벤트 공지, 맞춤형 마케팅', '+2일'],
    ['찜하기', '150,000원', '관심상품 저장, 찜 목록 관리, 알림 설정', '+1일'],
    ['배너 슬라이드', '100,000원', '메인 화면 배너, 자동 슬라이드, 클릭 이벤트', '+1일'],
    ['최근 본 상품', '100,000원', '열람 이력, 빠른 재접근, 자동 저장', '+1일']
]
option_table = Table(option_data, colWidths=[90, 70, 220, 60])
option_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
    ('ALIGN', (3, 0), (3, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E67E22')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FEF5E7')]),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(option_table)
story.append(Spacer(1, 20))

# 유지보수 서비스
story.append(Paragraph("유지보수 서비스", subsection_style))
maintenance_data = [
    ['서비스', '월 비용', '포함 내역'],
    ['베이직', '150,000원', '버그 수정, 정기 업데이트, 기술 지원 (평일 09-18시)'],
    ['프리미엄', '250,000원', '베이직 포함, 기능 개선, 24시간 긴급 지원, 월 1회 신기능']
]
maintenance_table = Table(maintenance_data, colWidths=[70, 80, 290])
maintenance_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#16A085')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#E8F8F5'), colors.HexColor('#FEF9E7')]),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
]))
story.append(maintenance_table)

# 페이지 나누기
story.append(PageBreak())

# 납품 및 계약 조건
story.append(Paragraph("납품 및 계약 조건", section_style))
story.append(Spacer(1, 15))

story.append(Paragraph("납품 내역", subsection_style))
delivery_data = [
    ['구분', '내용', '형태'],
    ['소스코드', 'Flutter 앱 전체 소스', 'GitHub/압축파일'],
    ['기술문서', '설치 및 운영 가이드', 'PDF/MD 파일'],
    ['관리자 매뉴얼', '관리 패널 사용법', 'PDF/동영상'],
    ['교육', '1:1 운영 교육', '대면/화상 (1시간)']
]
delivery_table = Table(delivery_data, colWidths=[100, 200, 140])
delivery_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#95A5A6')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(delivery_table)
story.append(Spacer(1, 20))

# 유의사항
story.append(Paragraph("유의사항", section_style))
notice_data = [
    ['NO', '항목', '상세 내용'],
    ['1', '개발 범위', '견적서 명시 기능만 포함 (추가 요청 시 별도 협의)'],
    ['2', '디자인', '기본 템플릿 제공 (커스텀 디자인 별도 견적)'],
    ['3', '서버 비용', 'Firebase 사용료는 고객 부담'],
    ['4', '계정 준비', 'Play Store ($25), App Store ($99/년) 계정 필요'],
    ['5', '도메인', '웹 관리자 패널용 도메인 고객 준비']
]
notice_table = Table(notice_data, colWidths=[40, 80, 320])
notice_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (1, 1), (1, -1), font_bold, 10),
    ('ALIGN', (0, 0), (0, -1), 'CENTER'),
    ('ALIGN', (1, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E74C3C')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FADBD8')]),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(notice_table)
story.append(Spacer(1, 30))

# 진행 절차 및 결제
story.append(Paragraph("진행 절차", section_style))
process_data = [
    ['단계', '내용', '비고'],
    ['1단계', '견적 검토', '견적서 내용 확인 및 문의'],
    ['2단계', '계약 체결', '계약서 작성 및 계약금 입금'],
    ['3단계', '요구사항 확정', '상세 기능 협의 및 확정'],
    ['4단계', '개발 착수', '프로젝트 시작']
]
process_table = Table(process_data, colWidths=[60, 200, 180])
process_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (0, -1), 'CENTER'),
    ('ALIGN', (1, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2C3E50')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#EBF5FB'), colors.white]),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(process_table)
story.append(Spacer(1, 20))

story.append(Paragraph("결제 일정", subsection_style))
payment_data = [
    ['구분', '비율', '시점'],
    ['계약금', '30%', '계약 체결 시'],
    ['중도금', '40%', '1주차 완료 시'],
    ['잔금', '30%', '최종 납품 시']
]
payment_table = Table(payment_data, colWidths=[100, 100, 240])
payment_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 1), (0, -1), font_bold, 10),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('ALIGN', (2, 1), (2, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#27AE60')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
]))
story.append(payment_table)
story.append(Spacer(1, 40))

# 문의 및 상담
story.append(Paragraph("문의 및 상담", section_style))
story.append(Spacer(1, 10))
story.append(Paragraph("<b>개발자:</b> Devyb", normal_style))
story.append(Paragraph("<b>연락처:</b> 010-3825-5659", normal_style))
story.append(Paragraph("<b>가능시간:</b> 평일 09:00 - 18:00", normal_style))
story.append(Spacer(1, 30))

# 마무리
story.append(Paragraph("문의사항이 있으시면 편하게 연락 주세요!", normal_style))
story.append(Spacer(1, 20))

footer_style = ParagraphStyle(
    'Footer',
    parent=styles['Normal'],
    fontSize=9,
    fontName=font_name,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#7F8C8D')
)
story.append(Paragraph("본 견적서는 작성일로부터 30일간 유효하며,", footer_style))
story.append(Paragraph("프로젝트 범위 변경 시 견적이 조정될 수 있습니다.", footer_style))
story.append(Spacer(1, 20))
story.append(Paragraph("<b>감사합니다.</b>", ParagraphStyle(
    'Thanks',
    parent=styles['Normal'],
    fontSize=14,
    fontName=font_bold,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#2C3E50')
)))

# PDF 생성
pdf.build(story)
print("PDF 파일이 생성되었습니다: 쇼핑몰앱_견적서_2025.pdf")