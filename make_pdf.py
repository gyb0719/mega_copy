from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
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
    rightMargin=20*mm,
    leftMargin=20*mm,
    topMargin=20*mm,
    bottomMargin=20*mm
)

# 스타일 정의
styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=24,
    textColor=colors.HexColor('#333333'),
    alignment=TA_CENTER,
    fontName=font_bold,
    spaceAfter=30
)

heading_style = ParagraphStyle(
    'CustomHeading',
    parent=styles['Heading2'],
    fontSize=16,
    textColor=colors.HexColor('#444444'),
    fontName=font_bold,
    spaceAfter=12,
    spaceBefore=20
)

subheading_style = ParagraphStyle(
    'CustomSubHeading',
    parent=styles['Heading3'],
    fontSize=14,
    textColor=colors.HexColor('#555555'),
    fontName=font_bold,
    spaceAfter=10
)

normal_style = ParagraphStyle(
    'CustomNormal',
    parent=styles['Normal'],
    fontSize=11,
    fontName=font_name,
    leading=14
)

bold_style = ParagraphStyle(
    'CustomBold',
    parent=styles['Normal'],
    fontSize=11,
    fontName=font_bold,
    leading=14
)

# 컨텐츠 작성
story = []

# 제목
story.append(Paragraph("쇼핑몰 앱 개발 견적서", title_style))
story.append(Spacer(1, 12))

# 기본 정보
info_data = [
    ['견적일자:', '2025년 8월 25일'],
    ['유효기간:', '견적일로부터 30일'],
    ['개발자:', 'Devyb'],
    ['연락처:', '010-3825-5659']
]
info_table = Table(info_data, colWidths=[80, 200])
info_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 11),
    ('FONT', (0, 0), (0, -1), font_bold, 11),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
]))
story.append(info_table)
story.append(Spacer(1, 20))

# 프로젝트 개요
story.append(Paragraph("프로젝트 개요", heading_style))
overview_data = [
    ['프로젝트명:', '쇼핑몰 모바일 앱 개발'],
    ['개발방식:', 'Flutter 크로스플랫폼 개발'],
    ['개발기간:', '2주 (작업 시작일로부터)']
]
overview_table = Table(overview_data, colWidths=[80, 350])
overview_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 11),
    ('FONT', (0, 0), (0, -1), font_bold, 11),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(overview_table)
story.append(Spacer(1, 15))

# 주요 기능
story.append(Paragraph("주요 기능", subheading_style))
features = [
    "상품 목록 및 상세 페이지",
    "카테고리별 상품 분류",
    "상품 검색 기능",
    "게시글 작성 및 관리 (공지사항, 이벤트)",
    "카카오톡 상담 연동",
    "관리자 웹 패널 (상품/게시글 관리)",
    "이미지 업로드 시스템"
]
for feature in features:
    story.append(Paragraph(f"• {feature}", normal_style))
story.append(Spacer(1, 20))

# 개발 비용
story.append(Paragraph("개발 비용", heading_style))

# 기본 개발
story.append(Paragraph("기본 개발 (안드로이드)", subheading_style))
story.append(Paragraph("<b>금액: 1,500,000원 (VAT 별도)</b>", bold_style))
story.append(Spacer(1, 10))
story.append(Paragraph("포함 내역:", bold_style))
basic_features = [
    "Flutter 앱 개발 (iOS 호환 코드 포함)",
    "안드로이드 앱 완성 및 최적화",
    "Google Play Store 출시 지원",
    "Firebase 백엔드 구축",
    "관리자 웹 패널 (반응형)",
    "1개월 무상 유지보수"
]
for feature in basic_features:
    story.append(Paragraph(f"• {feature}", normal_style))
story.append(Spacer(1, 15))

# iOS 추가
story.append(Paragraph("iOS 추가 출시 (선택)", subheading_style))
story.append(Paragraph("<b>추가 금액: 500,000원 (VAT 별도)</b>", bold_style))
story.append(Spacer(1, 10))
story.append(Paragraph("포함 내역:", bold_style))
ios_features = [
    "iOS 앱 빌드 및 최적화",
    "Apple App Store 출시 지원",
    "iOS 전용 UI/UX 조정",
    "앱 심사 대응 (최대 2회)"
]
for feature in ios_features:
    story.append(Paragraph(f"• {feature}", normal_style))
story.append(Spacer(1, 20))

# 총 비용 요약
story.append(Paragraph("총 비용 요약", subheading_style))
cost_data = [
    ['구분', '금액', '비고'],
    ['안드로이드 앱 (기본)', '1,500,000원', 'Flutter 개발'],
    ['iOS 앱 (선택)', '+500,000원', '추후 추가 가능'],
    ['패키지 (안드로이드+iOS)', '2,000,000원', '동시 계약 시']
]
cost_table = Table(cost_data, colWidths=[150, 100, 150])
cost_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('FONT', (0, 3), (0, 3), font_bold, 11),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.9, 0.9, 0.9)),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.Color(0.97, 0.97, 0.97)]),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(cost_table)
story.append(Spacer(1, 20))

# 개발 프로세스
story.append(Paragraph("개발 프로세스", heading_style))
story.append(Paragraph("<b>1주차: 기획 및 핵심 개발</b>", bold_style))
week1_tasks = [
    "요구사항 분석 및 설계",
    "상품 관리 시스템 구현",
    "검색 및 카테고리 기능",
    "카카오톡 연동"
]
for task in week1_tasks:
    story.append(Paragraph(f"• {task}", normal_style))
story.append(Spacer(1, 10))

story.append(Paragraph("<b>2주차: 완성 및 출시</b>", bold_style))
week2_tasks = [
    "관리자 패널 구현",
    "테스트 및 버그 수정",
    "스토어 출시 준비",
    "최종 점검 및 납품"
]
for task in week2_tasks:
    story.append(Paragraph(f"• {task}", normal_style))
story.append(Spacer(1, 20))

# 페이지 나누기
story.append(PageBreak())

# 추가 옵션
story.append(Paragraph("추가 옵션 (선택사항)", heading_style))
option_data = [
    ['기능', '금액', '설명'],
    ['푸시 알림', '200,000원', '신상품, 이벤트 알림'],
    ['상품 찜하기', '150,000원', '관심상품 저장 기능'],
    ['배너 슬라이드', '100,000원', '메인 화면 광고 배너'],
    ['최근 본 상품', '100,000원', '열람 이력 관리'],
    ['월 유지보수', '150,000원/월', '정기 업데이트 및 관리']
]
option_table = Table(option_data, colWidths=[120, 100, 180])
option_table.setStyle(TableStyle([
    ('FONT', (0, 0), (-1, -1), font_name, 10),
    ('FONT', (0, 0), (-1, 0), font_bold, 11),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.9, 0.9, 0.9)),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.Color(0.97, 0.97, 0.97)]),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
]))
story.append(option_table)
story.append(Spacer(1, 20))

# 계약 조건
story.append(Paragraph("계약 조건", heading_style))

story.append(Paragraph("납품 내역", subheading_style))
delivery_items = [
    "소스코드 전체",
    "기술 문서",
    "관리자 매뉴얼",
    "1:1 교육 (1시간)"
]
for item in delivery_items:
    story.append(Paragraph(f"• {item}", normal_style))
story.append(Spacer(1, 15))

story.append(Paragraph("유지보수", subheading_style))
maintenance_items = [
    "무상 AS: 납품 후 1개월",
    "유상 유지보수: 월 150,000원 (선택)"
]
for item in maintenance_items:
    story.append(Paragraph(f"• {item}", normal_style))
story.append(Spacer(1, 20))

# 참고사항
story.append(Paragraph("참고사항", heading_style))
notes = [
    "1. 개발 범위 외 추가 요청사항은 별도 협의",
    "2. 디자인은 기본 템플릿 기반 (커스텀 디자인 별도)",
    "3. 서버 호스팅 비용은 고객 부담",
    "4. 도메인 및 스토어 개발자 계정은 고객 준비",
    "5. iOS 앱스토어 연 $99 비용 별도"
]
for note in notes:
    story.append(Paragraph(note, normal_style))
story.append(Spacer(1, 20))

# 다음 단계
story.append(Paragraph("다음 단계", heading_style))
next_steps = [
    "1. 견적서 검토 및 문의사항 확인",
    "2. 계약서 작성 및 계약금 입금",
    "3. 상세 요구사항 미팅",
    "4. 개발 착수"
]
for step in next_steps:
    story.append(Paragraph(step, normal_style))
story.append(Spacer(1, 30))

# 마무리
story.append(Paragraph("문의사항이 있으시면 언제든 연락 주세요.", normal_style))
story.append(Spacer(1, 10))
story.append(Paragraph("감사합니다.", normal_style))
story.append(Spacer(1, 20))
story.append(Paragraph("<i>본 견적서는 작성일로부터 30일간 유효하며, 프로젝트 범위 변경 시 견적이 조정될 수 있습니다.</i>", normal_style))

# PDF 생성
pdf.build(story)
print("PDF 파일이 생성되었습니다: 쇼핑몰앱_견적서_2025.pdf")