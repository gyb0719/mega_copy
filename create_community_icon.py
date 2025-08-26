#!/usr/bin/env python3
"""
빌리지 지역 공유 플랫폼 앱 아이콘 생성 스크립트

컨셉: "연결된 공동체" - 손 + 집 + 하트 조합
색상: Trust Blue (#4A90E2) → Warm Orange (#F5A623) 그라데이션
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os


def create_gradient_background(size, color1, color2, direction='diagonal'):
    """그라데이션 배경 생성"""
    gradient = Image.new('RGB', size, color1)
    draw = ImageDraw.Draw(gradient)
    
    if direction == 'diagonal':
        # 왼쪽 위에서 오른쪽 아래로 대각선 그라데이션
        for i in range(size[0]):
            for j in range(size[1]):
                # 대각선 진행률 계산
                progress = (i + j) / (size[0] + size[1] - 2)
                progress = min(1.0, max(0.0, progress))
                
                # 색상 보간
                r = int(color1[0] * (1 - progress) + color2[0] * progress)
                g = int(color1[1] * (1 - progress) + color2[1] * progress)
                b = int(color1[2] * (1 - progress) + color2[2] * progress)
                
                gradient.putpixel((i, j), (r, g, b))
    
    return gradient


def hex_to_rgb(hex_color):
    """HEX 색상을 RGB 튜플로 변환"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def draw_heart(draw, center, size, color, outline_width=0):
    """하트 모양 그리기"""
    x, y = center
    w, h = size, size
    
    # 하트의 두 원형 부분
    left_circle = [(x - w//4 - w//8, y - h//8), (x - w//8, y + h//8)]
    right_circle = [(x + w//8, y - h//8), (x + w//4 + w//8, y + h//8)]
    
    # 하트 하단 삼각형 부분의 점들
    points = [
        (x - w//4, y),  # 왼쪽 원 하단
        (x, y + h//2),  # 하트 끝점
        (x + w//4, y),  # 오른쪽 원 하단
    ]
    
    if outline_width > 0:
        # 외곽선 먼저 그리기
        outline_color = tuple(max(0, c - 40) for c in color)  # 더 어두운 색상
        draw.ellipse(left_circle, fill=outline_color, outline=outline_color, width=outline_width)
        draw.ellipse(right_circle, fill=outline_color, outline=outline_color, width=outline_width)
        draw.polygon(points, fill=outline_color, outline=outline_color, width=outline_width)
    
    # 실제 하트 그리기
    draw.ellipse(left_circle, fill=color)
    draw.ellipse(right_circle, fill=color)
    draw.polygon(points, fill=color)


def draw_house(draw, center, size, color, outline_width=0):
    """집 모양 그리기"""
    x, y = center
    w, h = size, size
    
    # 집 지붕 (삼각형)
    roof_points = [
        (x - w//2, y - h//8),  # 왼쪽 아래
        (x, y - h//2),         # 꼭대기
        (x + w//2, y - h//8),  # 오른쪽 아래
    ]
    
    # 집 몸체 (사각형)
    house_body = [(x - w//2, y - h//8), (x + w//2, y + h//2)]
    
    # 문 (작은 사각형)
    door = [(x - w//8, y + h//8), (x + w//8, y + h//2)]
    
    if outline_width > 0:
        outline_color = tuple(max(0, c - 40) for c in color)
        draw.polygon(roof_points, fill=outline_color, outline=outline_color, width=outline_width)
        draw.rectangle(house_body, fill=outline_color, outline=outline_color, width=outline_width)
    
    # 실제 집 그리기
    draw.polygon(roof_points, fill=color)
    draw.rectangle(house_body, fill=color)
    
    # 문은 더 어두운 색상으로
    door_color = tuple(max(0, c - 60) for c in color)
    draw.rectangle(door, fill=door_color)


def draw_hand(draw, center, size, color, outline_width=0):
    """손 모양 그리기 (간단한 원형 + 손가락들)"""
    x, y = center
    w, h = size, size
    
    # 손바닥 (원형)
    palm = [(x - w//3, y - h//3), (x + w//3, y + h//3)]
    
    # 손가락들 (작은 원형들)
    fingers = [
        [(x - w//4, y - h//2), (x - w//8, y - h//3)],  # 검지
        [(x - w//8, y - h//2), (x + w//8, y - h//3)],  # 중지
        [(x + w//8, y - h//2), (x + w//4, y - h//3)],  # 약지
    ]
    
    if outline_width > 0:
        outline_color = tuple(max(0, c - 40) for c in color)
        draw.ellipse(palm, fill=outline_color, outline=outline_color, width=outline_width)
        for finger in fingers:
            draw.ellipse(finger, fill=outline_color, outline=outline_color, width=outline_width)
    
    # 실제 손 그리기
    draw.ellipse(palm, fill=color)
    for finger in fingers:
        draw.ellipse(finger, fill=color)


def create_community_icon(size=1024, background_color=(255, 255, 255), transparent=False):
    """커뮤니티 앱 아이콘 생성"""
    
    # 색상 정의
    trust_blue = hex_to_rgb('#4A90E2')
    warm_orange = hex_to_rgb('#F5A623')
    
    # 배경 생성
    if transparent:
        img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    else:
        # 그라데이션 배경 생성
        img = create_gradient_background((size, size), trust_blue, warm_orange, 'diagonal')
        # 흰색 배경과 블렌드하여 부드럽게
        white_bg = Image.new('RGB', (size, size), background_color)
        img = Image.blend(white_bg, img, 0.15)  # 15% 그라데이션, 85% 흰색
        img = img.convert('RGBA')
    
    draw = ImageDraw.Draw(img)
    
    # 둥근 모서리를 위한 마스크 생성
    corner_radius = int(size * 0.15)  # 15% 둥근 모서리
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    
    # 둥근 사각형 마스크
    mask_draw.rounded_rectangle(
        [(0, 0), (size, size)], 
        corner_radius, 
        fill=255
    )
    
    # 중앙 원형 배경 (아이콘들을 담을 컨테이너)
    center_x, center_y = size // 2, size // 2
    circle_size = int(size * 0.7)  # 전체 크기의 70%
    circle_radius = circle_size // 2
    
    # 부드러운 그라데이션 원형 배경
    circle_bg = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    circle_draw = ImageDraw.Draw(circle_bg)
    
    # 원형 그라데이션 생성
    for r in range(circle_radius, 0, -2):
        progress = 1 - (r / circle_radius)
        alpha = int(30 * progress)  # 투명도 조절
        
        color = tuple(int(trust_blue[i] * (1 - progress) + warm_orange[i] * progress) for i in range(3))
        color_with_alpha = color + (alpha,)
        
        circle_draw.ellipse(
            [(center_x - r, center_y - r), (center_x + r, center_y + r)],
            fill=color_with_alpha
        )
    
    # 원형 배경을 메인 이미지에 합성
    img = Image.alpha_composite(img, circle_bg)
    draw = ImageDraw.Draw(img)
    
    # 아이콘 요소들 배치 (삼각형 형태로)
    icon_size = int(size * 0.12)  # 각 아이콘 크기
    
    # 하트 (상단 중앙) - 따뜻한 마음과 신뢰
    heart_pos = (center_x, center_y - int(size * 0.15))
    heart_color = hex_to_rgb('#E74C3C')  # 따뜻한 빨간색
    draw_heart(draw, heart_pos, icon_size, heart_color, outline_width=2)
    
    # 집 (왼쪽 하단) - 지역 공동체
    house_pos = (center_x - int(size * 0.12), center_y + int(size * 0.08))
    house_color = trust_blue
    draw_house(draw, house_pos, icon_size, house_color, outline_width=2)
    
    # 손 (오른쪽 하단) - 나눔과 도움
    hand_pos = (center_x + int(size * 0.12), center_y + int(size * 0.08))
    hand_color = warm_orange
    draw_hand(draw, hand_pos, icon_size, hand_color, outline_width=2)
    
    # 연결선 그리기 (세 요소를 연결하는 부드러운 곡선들)
    connection_color = hex_to_rgb('#BDC3C7')  # 연한 회색
    
    # 하트에서 집으로
    draw.line([heart_pos, house_pos], fill=connection_color, width=3)
    # 하트에서 손으로  
    draw.line([heart_pos, hand_pos], fill=connection_color, width=3)
    # 집에서 손으로
    draw.line([house_pos, hand_pos], fill=connection_color, width=3)
    
    # 부드러운 그림자 효과
    if not transparent:
        shadow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        shadow_offset = int(size * 0.02)
        
        # 그림자 원형
        shadow_draw.ellipse(
            [(center_x - circle_radius + shadow_offset, center_y - circle_radius + shadow_offset),
             (center_x + circle_radius + shadow_offset, center_y + circle_radius + shadow_offset)],
            fill=(0, 0, 0, 20)
        )
        
        # 그림자를 배경에 합성
        img = Image.alpha_composite(img, shadow)
    
    # 둥근 모서리 적용
    output = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    output.paste(img, mask=mask)
    
    return output


def create_all_sizes():
    """모든 크기의 아이콘 생성"""
    
    # 기본 경로 설정
    base_path = r"C:\Users\gyb07\workspace\ittem-mvp\assets\images"
    
    # 디렉토리가 없으면 생성
    if not os.path.exists(base_path):
        os.makedirs(base_path)
    
    sizes = [1024, 512, 256, 128, 64, 32]
    
    print("Creating Billage Community App Icons...")
    
    for size in sizes:
        print(f"  Creating {size}x{size} icon...")
        
        # White background version
        icon_white = create_community_icon(size=size, background_color=(255, 255, 255), transparent=False)
        white_path = os.path.join(base_path, f"billage_community_icon_{size}.png")
        icon_white.save(white_path, "PNG")
        
        # Transparent background version
        icon_transparent = create_community_icon(size=size, transparent=True)
        transparent_path = os.path.join(base_path, f"billage_community_icon_transparent_{size}.png")
        icon_transparent.save(transparent_path, "PNG")
    
    # Main files (1024x1024)
    main_white = create_community_icon(size=1024, background_color=(255, 255, 255), transparent=False)
    main_white.save(os.path.join(base_path, "billage_community_icon.png"), "PNG")
    
    main_transparent = create_community_icon(size=1024, transparent=True)
    main_transparent.save(os.path.join(base_path, "billage_community_icon_transparent.png"), "PNG")
    
    print(f"\nAll icons created successfully!")
    print(f"Save path: {base_path}")
    print(f"Generated sizes: {', '.join([f'{s}x{s}' for s in sizes])}")
    print(f"Concept: 'Connected Community' - Hand(Sharing) + House(Community) + Heart(Trust)")
    print(f"Colors: Trust Blue (#4A90E2) to Warm Orange (#F5A623) gradient")


if __name__ == "__main__":
    create_all_sizes()