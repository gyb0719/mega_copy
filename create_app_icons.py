import os
from PIL import Image, ImageDraw
import math

def create_billage_icon(size):
    """Create Billage app icon with specified size"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate corner radius (about 22% of size, like iOS)
    corner_radius = int(size * 0.22)
    
    # Create rounded rectangle background with gradient effect
    # We'll simulate gradient by layering colors
    colors = [
        (0, 217, 255),  # Light blue
        (0, 153, 255),  # Darker blue
    ]
    
    # Draw background with rounded corners
    draw.rounded_rectangle([0, 0, size-1, size-1], corner_radius, fill=colors[0])
    
    # Add gradient effect by drawing overlays
    for i in range(corner_radius):
        alpha = int(50 * (i / corner_radius))
        overlay_color = colors[1] + (alpha,)
        draw.rounded_rectangle([i, i, size-1-i, size-1-i], corner_radius-i, fill=overlay_color)
    
    # Calculate positions for the location pin and arrows
    center_x, center_y = size // 2, size // 2
    
    # Draw location pin (white)
    pin_scale = size / 180  # Scale factor based on original 180px design
    
    # Pin shape coordinates (scaled)
    pin_width = int(32 * pin_scale)
    pin_height = int(44 * pin_scale)
    pin_x = center_x - pin_width // 2
    pin_y = center_y - pin_height // 2 - int(8 * pin_scale)  # Move up slightly
    
    # Draw pin shape
    pin_points = []
    # Top rounded part
    for angle in range(180, 360, 10):
        x = pin_x + pin_width//2 + (pin_width//2 - 2) * math.cos(math.radians(angle))
        y = pin_y + pin_width//2 + (pin_width//2 - 2) * math.sin(math.radians(angle))
        pin_points.append((x, y))
    
    # Bottom point
    pin_points.append((pin_x + pin_width//2, pin_y + pin_height))
    
    # Draw white pin
    if len(pin_points) > 2:
        draw.polygon(pin_points, fill=(255, 255, 255, 240))
    
    # Draw inner circle (blue)
    circle_radius = int(10 * pin_scale)
    circle_y = pin_y + pin_width//2
    draw.ellipse([
        center_x - circle_radius, circle_y - circle_radius,
        center_x + circle_radius, circle_y + circle_radius
    ], fill=colors[0])
    
    # Draw arrows (simplified version)
    arrow_scale = max(2, int(3 * pin_scale))
    arrow_offset = int(15 * pin_scale)
    
    # Left arrow
    left_arrow_x = center_x - arrow_offset
    arrow_y = center_y + int(6 * pin_scale)
    
    draw.polygon([
        (left_arrow_x - arrow_scale*2, arrow_y),
        (left_arrow_x, arrow_y - arrow_scale),
        (left_arrow_x, arrow_y + arrow_scale)
    ], fill=(255, 255, 255, 220))
    
    # Right arrow
    right_arrow_x = center_x + arrow_offset
    draw.polygon([
        (right_arrow_x + arrow_scale*2, arrow_y),
        (right_arrow_x, arrow_y - arrow_scale),
        (right_arrow_x, arrow_y + arrow_scale)
    ], fill=(255, 255, 255, 220))
    
    return img

def main():
    # Android icon sizes
    sizes = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192
    }
    
    base_path = "C:/Users/gyb07/workspace/ittem-mvp-new/android/app/src/main/res"
    
    for folder, size in sizes.items():
        # Create icon
        icon = create_billage_icon(size)
        
        # Save to appropriate folder
        folder_path = os.path.join(base_path, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
        
        icon_path = os.path.join(folder_path, "ic_launcher.png")
        icon.save(icon_path, "PNG")
        print(f"Created {icon_path} ({size}x{size})")

if __name__ == "__main__":
    main()