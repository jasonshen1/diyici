from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

# 打开原图
img = Image.open('/root/clawd/downloads/C77963F29CAFC2C384A9927A48AA44FD_1771255944120.png')

# 1. 增强花朵主体（先不做色彩增强，后面再处理）
saturation_enhancer = ImageEnhance.Color(img)
img_color = saturation_enhancer.enhance(1.25)

contrast_enhancer = ImageEnhance.Contrast(img_color)
img_color = contrast_enhancer.enhance(1.12)

brightness_enhancer = ImageEnhance.Brightness(img_color)
img_color = brightness_enhancer.enhance(1.05)

# 2. 创建背景虚化版本
# 先做一个强烈的背景模糊
bg_blur = img.filter(ImageFilter.GaussianBlur(radius=8))

# 3. 调整背景色调 - 添加暖色滤镜
r, g, b = bg_blur.split()
# 增强暖色调
r = r.point(lambda i: min(255, int(i * 1.15)))  # 增强红色
b = b.point(lambda i: int(i * 0.82))  # 降低蓝色，营造暖色背景
g = g.point(lambda i: int(i * 1.05))  # 轻微增强绿色
bg_warm = Image.merge('RGB', (r, g, b))

# 4. 进一步柔化背景
bg_final = bg_warm.filter(ImageFilter.GaussianBlur(radius=3))

# 5. 稍微提亮背景中心区域（径向渐变效果）
width, height = img.size
center_x, center_y = width // 2, height // 2

# 创建遮罩 - 花朵区域保留清晰，周围逐渐虚化
# 使用椭圆选择来创建自然的过渡
mask = Image.new('L', (width, height), 0)
draw = ImageDraw.Draw(mask)

# 绘制渐变椭圆（花朵大致位置）
ellipse_box = (center_x - 280, center_y - 200, center_x + 280, center_y + 200)
draw.ellipse(ellipse_box, fill=255)

# 模糊遮罩边缘，创造平滑过渡
mask = mask.filter(ImageFilter.GaussianBlur(radius=80))

# 6. 合并清晰花朵和虚化的背景
result = Image.composite(img_color, bg_final, mask)

# 7. 整体微调 - 轻微增强锐度
result = result.filter(ImageFilter.UnsharpMask(radius=1, percent=80, threshold=1))

# 8. 添加轻微的暗角效果（vignette）
vignette = Image.new('L', (width, height), 255)
vig_draw = ImageDraw.Draw(vignette)
# 中心亮，四周暗
for i in range(min(width, height)//2, 0, -5):
    alpha = int(255 * (i / (min(width, height)//2)) ** 0.5)
    vig_draw.ellipse([center_x - i, center_y - i, center_x + i, center_y + i], fill=alpha)

vignette = vignette.filter(ImageFilter.GaussianBlur(radius=100))

# 应用暗角（轻微）
result_rgb = result.convert('RGB')
result_final = Image.blend(result_rgb, Image.new('RGB', (width, height), (245, 235, 220)), 0.08)

# 保存结果
output_path = '/root/clawd/downloads/rose_bg_beautified.png'
result_final.save(output_path, 'PNG', quality=95)
print(f'背景美化完成！保存至: {output_path}')
