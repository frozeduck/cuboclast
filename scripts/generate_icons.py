#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw

def render_base_icon(size=512):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    center = size / 2

    # Draw rounded background
    bg_pad = size * 0.05
    bg_radius = size * 0.22
    draw.rounded_rectangle(
        [bg_pad, bg_pad, size - bg_pad, size - bg_pad],
        radius=bg_radius,
        fill=(11, 15, 25, 255),
        outline=(0, 229, 255, 180),
        width=int(size * 0.02)
    )

    # Subtle neon grid lines inside background
    grid_color = (25, 38, 60, 255)
    for x in range(int(bg_pad + size * 0.1), int(size - bg_pad), int(size * 0.15)):
        draw.line([(x, bg_pad), (x, size - bg_pad)], fill=grid_color, width=1)
    for y in range(int(bg_pad + size * 0.1), int(size - bg_pad), int(size * 0.15)):
        draw.line([(bg_pad, y), (size - bg_pad, y)], fill=grid_color, width=1)

    # Isometric minimalist central cube
    # Center of cube
    cx, cy = size * 0.48, size * 0.54
    r = size * 0.26
    
    # Top face
    top_poly = [
        (cx, cy - r),
        (cx + r * math.cos(math.radians(30)), cy - r + r * math.sin(math.radians(30))),
        (cx, cy),
        (cx - r * math.cos(math.radians(30)), cy - r + r * math.sin(math.radians(30))),
    ]
    draw.polygon(top_poly, fill=(0, 245, 212, 230), outline=(255, 255, 255, 240))

    # Left face (shaded)
    left_poly = [
        (cx - r * math.cos(math.radians(30)), cy - r + r * math.sin(math.radians(30))),
        (cx, cy),
        (cx, cy + r),
        (cx - r * math.cos(math.radians(30)), cy + r * math.sin(math.radians(30))),
    ]
    draw.polygon(left_poly, fill=(0, 160, 210, 240), outline=(255, 255, 255, 220))

    # Right face (darker shaded)
    right_poly = [
        (cx, cy),
        (cx + r * math.cos(math.radians(30)), cy - r + r * math.sin(math.radians(30))),
        (cx + r * math.cos(math.radians(30)), cy + r * math.sin(math.radians(30))),
        (cx, cy + r),
    ]
    draw.polygon(right_poly, fill=(123, 44, 191, 230), outline=(255, 255, 255, 220))

    # Impact spark / shatter point at top-right
    ix, iy = cx + r * 0.4, cy - r * 0.4
    
    # Shards bursting out (geometric cubes / diamond fragments)
    shard_offsets = [
        (size * 0.18, -size * 0.14, (255, 0, 110)),
        (size * 0.22, -size * 0.02, (254, 228, 64)),
        (size * 0.14, -size * 0.24, (0, 245, 212)),
        (size * 0.26, -size * 0.18, (255, 107, 0)),
        (-size * 0.16, -size * 0.16, (0, 229, 255)),
    ]
    for dx, dy, col in shard_offsets:
        sx, sy = ix + dx, iy + dy
        sh_size = size * 0.035
        draw.polygon([
            (sx, sy - sh_size),
            (sx + sh_size, sy),
            (sx, sy + sh_size),
            (sx - sh_size, sy),
        ], fill=col + (255,), outline=(255, 255, 255, 200))

    # Bouncing Roguelike Neon Ball with Motion Arc
    # Trail
    arc_points = [
        (size * 0.72, size * 0.14),
        (size * 0.64, size * 0.22),
        (size * 0.58, size * 0.32),
        (ix, iy)
    ]
    for i in range(len(arc_points) - 1):
        alpha = int(100 + i * 40)
        draw.line([arc_points[i], arc_points[i+1]], fill=(255, 220, 0, alpha), width=int(size * 0.015))

    # The Ball itself at impact
    ball_r = size * 0.065
    bx, by = ix + size * 0.06, iy - size * 0.06
    # Outer glow
    draw.ellipse([bx - ball_r * 1.5, by - ball_r * 1.5, bx + ball_r * 1.5, by + ball_r * 1.5], fill=(254, 228, 64, 80))
    # Ball body
    draw.ellipse([bx - ball_r, by - ball_r, bx + ball_r, by + ball_r], fill=(254, 228, 64, 255), outline=(255, 255, 255, 255), width=2)
    # Highlight
    draw.ellipse([bx - ball_r * 0.5, by - ball_r * 0.5, bx, by], fill=(255, 255, 255, 220))

    # Impact burst ring
    draw.ellipse([ix - size * 0.07, iy - size * 0.07, ix + size * 0.07, iy + size * 0.07], outline=(255, 255, 255, 220), width=int(size * 0.012))

    return img

def render_round_icon(base_img):
    size = base_img.width
    mask = Image.new("L", (size, size), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.ellipse([size * 0.03, size * 0.03, size * 0.97, size * 0.97], fill=255)
    
    round_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    round_img.paste(base_img, (0, 0), mask=mask)
    
    # Outer circle border
    draw = ImageDraw.Draw(round_img)
    draw.ellipse([size * 0.03, size * 0.03, size * 0.97, size * 0.97], outline=(0, 229, 255, 220), width=int(size * 0.025))
    return round_img

def main():
    base = render_base_icon(512)
    round_base = render_round_icon(base)

    target_dirs = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    
    res_dir = "/opt/docker/cuboclast/android/app/src/main/res"
    for d, s in target_dirs.items():
        out_dir = os.path.join(res_dir, d)
        os.makedirs(out_dir, exist_ok=True)
        base.resize((s, s), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "ic_launcher.png"))
        round_base.resize((s, s), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "ic_launcher_round.png"))

    # Also save to drawable as general icons
    drawable_dir = os.path.join(res_dir, "drawable")
    base.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(drawable_dir, "ic_launcher.png"))
    round_base.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(drawable_dir, "ic_launcher_round.png"))
    
    print("Icone CuboClast generate con successo in tutte le risoluzioni!")

if __name__ == "__main__":
    main()
