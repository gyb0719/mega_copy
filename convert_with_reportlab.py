from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
import re

# Windows 한글 폰트 등록
try:
    # Malgun Gothic 폰트 등록
    pdfmetrics.registerFont(TTFont('MalgunGothic', 'C:/Windows/Fonts/malgun.ttf'))
    pdfmetrics.registerFont(TTFont('MalgunGothicBold', 'C:/Windows/Fonts/malgunbd.ttf'))
except:
    print("한글 폰트 등록 실패. 기본 폰트를 사용합니다.")

# 바탕화면 경로
desktop_path = os.path.join(os.path.expanduser('~'), 'Desktop')
pdf_path = os.path.join(desktop_path, '케이크토퍼_중계사이트_견적서.pdf')

# PDF 문서 생성
doc = SimpleDocTemplate(
    pdf_path,
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm
)

# 스타일 정의
styles = getSampleStyleSheet()

# 제목 스타일
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=20,
    textColor=colors.HexColor('#2c3e50'),
    spaceAfter=30,
    fontName='MalgunGothicBold'
)

# 섹션 제목 스타일
heading_style = ParagraphStyle(
    'CustomHeading',
    parent=styles['Heading2'],
    fontSize=16,
    textColor=colors.HexColor('#34495e'),
    spaceAfter=20,
    spaceBefore=20,
    fontName='MalgunGothicBold'
)

# 소제목 스타일
subheading_style = ParagraphStyle(
    'CustomSubHeading',
    parent=styles['Heading3'],
    fontSize=14,
    textColor=colors.HexColor('#555555'),
    spaceAfter=12,
    spaceBefore=12,
    fontName='MalgunGothicBold'
)

# 본문 스타일
body_style = ParagraphStyle(
    'CustomBody',
    parent=styles['Normal'],
    fontSize=11,
    leading=16,
    fontName='MalgunGothic'
)

# 문서 내용
content = []

# 제목
content.append(Paragraph("케이크토퍼 협회 통합 전시 플랫폼 구축 견적서", title_style))
content.append(Spacer(1, 12))

# 견적 정보
info_data = [
    ["견적번호", "2025-CT-0124"],
    ["작성일자", "2025년 8월 25일"],
    ["유효기간", "견적일로부터 30일"]
]
info_table = Table(info_data, colWidths=[4*cm, 10*cm])
info_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'MalgunGothic'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))
content.append(info_table)
content.append(Spacer(1, 30))

# 1. 프로젝트 개요
content.append(Paragraph("1. 프로젝트 개요", heading_style))

content.append(Paragraph("1.1 프로젝트명", subheading_style))
content.append(Paragraph("케이크토퍼 협회 통합 전시 및 중계 플랫폼 구축", body_style))
content.append(Spacer(1, 12))

content.append(Paragraph("1.2 프로젝트 목적", subheading_style))
content.append(Paragraph("• 협회 소속 300여 사장님들의 케이크토퍼 상품을 통합 전시", body_style))
content.append(Paragraph("• 공정한 노출 시스템을 통한 균등한 판매 기회 제공", body_style))
content.append(Paragraph("• 고객의 편리한 상품 탐색 및 구매 연결 지원", body_style))
content.append(Spacer(1, 12))

content.append(Paragraph("1.3 개발 범위", subheading_style))
content.append(Paragraph("협회원 상품 전시, 랜덤 노출 시스템, 네이버 스마트스토어 연동, 관리자 시스템 구축", body_style))
content.append(Spacer(1, 30))

# 2. 견적 내역
content.append(Paragraph("2. 견적 내역", heading_style))

content.append(Paragraph("2.1 개발비용", subheading_style))

# 개발비용 테이블
dev_data = [
    ["구분", "항목", "상세 내용", "금액(VAT별도)"],
    ["프론트엔드", "사용자 인터페이스", "메인 페이지 구현\n상품 리스트 (랜덤 노출)\n상품 상세 페이지\n반응형 웹 (PC/모바일)", "₩1,800,000"],
    ["백엔드", "서버 개발", "API 서버 구축\n데이터베이스 설계\n공정 노출 알고리즘\n검색 기능 구현", "₩2,000,000"],
    ["관리자 시스템", "운영 도구", "관리자 로그인/보안\n상품 CRUD 기능\n이미지 업로드 시스템\n엑셀 일괄 등록\n기본 통계 대시보드", "₩1,500,000"],
    ["최적화", "성능/SEO", "로딩 속도 최적화\n검색엔진 최적화\n이미지 압축 시스템", "₩700,000"],
    ["합계", "", "", "₩6,000,000"]
]

dev_table = Table(dev_data, colWidths=[2.5*cm, 3*cm, 7*cm, 3*cm])
dev_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'MalgunGothic'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
    ('FONTNAME', (0, 0), (-1, 0), 'MalgunGothicBold'),
    ('FONTNAME', (0, -1), (-1, -1), 'MalgunGothicBold'),
    ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#ecf0f1')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
]))
content.append(dev_table)
content.append(Spacer(1, 20))

content.append(Paragraph("2.2 월 유지보수 비용", subheading_style))

# 유지보수 테이블
maint_data = [
    ["서비스 내용", "월 비용(VAT별도)"],
    ["서버 및 시스템 모니터링\n버그 수정 및 보안 업데이트\n월 20건 콘텐츠 수정 지원\n주간 데이터 백업\n24시간 이내 장애 대응\n월간 운영 리포트 제공", "₩500,000"]
]

maint_table = Table(maint_data, colWidths=[11*cm, 4*cm])
maint_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'MalgunGothic'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('FONTNAME', (0, 0), (-1, 0), 'MalgunGothicBold'),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('ALIGN', (-1, 0), (-1, -1), 'CENTER'),
    ('FONTNAME', (-1, -1), (-1, -1), 'MalgunGothicBold'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
]))
content.append(maint_table)

# 페이지 나누기
content.append(PageBreak())

# 3. 개발 상세 명세
content.append(Paragraph("3. 개발 상세 명세", heading_style))

content.append(Paragraph("3.1 주요 기능", subheading_style))

content.append(Paragraph("<b>사용자 기능</b>", body_style))
features_user = [
    "• 상품 전시: 썸네일, 상품명, 가격, 간단 설명 표시",
    "• 공정 노출: 순환식 랜덤 알고리즘으로 모든 상품 균등 노출",
    "• 상품 검색: 상품명, 설명 기반 검색",
    "• 카테고리: 상품 분류별 필터링",
    "• 상세 페이지: 상품 이미지 갤러리, 상세 설명",
    "• 외부 연동: 네이버 스마트스토어 구매 버튼",
    "• 페이지네이션: 페이지당 16개 상품 표시"
]
for feature in features_user:
    content.append(Paragraph(feature, body_style))
content.append(Spacer(1, 12))

content.append(Paragraph("<b>관리자 기능</b>", body_style))
features_admin = [
    "• 상품 관리: 등록, 수정, 삭제, 순서 변경",
    "• 일괄 처리: 엑셀 파일을 통한 대량 등록/수정",
    "• 이미지 관리: 다중 이미지 업로드 (상품당 최대 5장)",
    "• 통계 확인: 조회수, 클릭률, 인기 상품 분석",
    "• 노출 모니터링: 공정성 검증 대시보드"
]
for feature in features_admin:
    content.append(Paragraph(feature, body_style))
content.append(Spacer(1, 20))

# 4. 개발 일정
content.append(Paragraph("4. 개발 일정", heading_style))

schedule_data = [
    ["단계", "기간", "주요 산출물"],
    ["1단계 기획/설계", "1주차", "와이어프레임, DB 설계서, API 명세서"],
    ["2단계 프론트엔드", "2-3주차", "사용자 화면 전체, 반응형 레이아웃"],
    ["3단계 백엔드", "3-4주차", "서버 API, 노출 알고리즘, 관리자 시스템"],
    ["4단계 통합/테스트", "5주차", "시스템 통합, 성능 최적화, 보안 점검"],
    ["5단계 오픈 준비", "5주차", "실 데이터 이전, 최종 테스트, 안정화"]
]

schedule_table = Table(schedule_data, colWidths=[4*cm, 3*cm, 8*cm])
schedule_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'MalgunGothic'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('FONTNAME', (0, 0), (-1, 0), 'MalgunGothicBold'),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
content.append(schedule_table)
content.append(Spacer(1, 12))
content.append(Paragraph("<b>총 개발 기간: 5주</b>", body_style))

# 페이지 나누기
content.append(PageBreak())

# 5. 결제 조건
content.append(Paragraph("5. 결제 조건", heading_style))

payment_data = [
    ["구분", "비율", "금액(VAT별도)", "납부 시점"],
    ["계약금", "30%", "₩1,800,000", "계약 체결시"],
    ["중도금", "40%", "₩2,400,000", "3주차 완료시"],
    ["잔금", "30%", "₩1,800,000", "최종 납품시"]
]

payment_table = Table(payment_data, colWidths=[3*cm, 2*cm, 4*cm, 4*cm])
payment_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'MalgunGothic'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('FONTNAME', (0, 0), (-1, 0), 'MalgunGothicBold'),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
content.append(payment_table)
content.append(Spacer(1, 12))

content.append(Paragraph("• 부가세 10% 별도", body_style))
content.append(Paragraph("• 세금계산서 발행", body_style))
content.append(Paragraph("• 계좌: 신한은행 110-431-618023 (예금주: 권용범)", body_style))
content.append(Spacer(1, 30))

# 10. 업체 정보
content.append(Paragraph("10. 업체 정보", heading_style))

content.append(Paragraph("<b>개발자:</b> 권용범", body_style))
content.append(Paragraph("<b>연락처:</b> 010-3825-5659", body_style))
content.append(Paragraph("<b>이메일:</b> gyb07190@gmail.com", body_style))
content.append(Paragraph("<b>경력:</b> 웹 개발 7년, 이커머스 플랫폼 다수 구축", body_style))
content.append(Spacer(1, 12))

content.append(Paragraph("<b>최근 프로젝트:</b>", body_style))
content.append(Paragraph("• 패션 브랜드 통합몰 구축 (2025.07)", body_style))
content.append(Paragraph("• 지역 특산품 마켓플레이스 개발 (2025.04)", body_style))
content.append(Paragraph("• B2B 주문 관리 시스템 구축 (2025.01)", body_style))
content.append(Spacer(1, 30))

# 11. 참고사항
content.append(Paragraph("11. 참고사항", heading_style))

notes = [
    "1. 본 견적은 제공된 요구사항을 기반으로 작성되었습니다.",
    "2. 상세 요구사항 협의 후 최종 견적이 조정될 수 있습니다.",
    "3. 호스팅 및 도메인 비용은 별도입니다.",
    "4. 프로젝트 규모 변경시 일정 조정이 필요할 수 있습니다."
]
for note in notes:
    content.append(Paragraph(note, body_style))

content.append(Spacer(1, 30))
content.append(Paragraph("<i>본 견적서는 작성일로부터 30일간 유효합니다.</i>", body_style))

# PDF 생성
doc.build(content)

print(f"PDF 파일이 성공적으로 생성되었습니다: {pdf_path}")