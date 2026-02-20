from PIL import Image, ImageEnhance, ImageFilter, ImageOps

# 打开原图
img = Image.open('/root/clawd/downloads/C77963F29CAFC2C384A9927A48AA44FD_1771255944120.png')

# 1. 增强色彩饱和度（让橙色更鲜艳）
saturation_enhancer = ImageEnhance.Color(img)
img = saturation_enhancer.enhance(1.3)  # 增加30%饱和度

# 2. 增加对比度
contrast_enhancer = ImageEnhance.Contrast(img)
img = contrast_enhancer.enhance(1.15)  # 增加15%对比度

# 3. 稍微提亮
brightness_enhancer = ImageEnhance.Brightness(img)
img = brightness_enhancer.enhance(1.08)  # 提亮8%

# 4. 添加暖色调（分离通道并增强红色/绿色通道）
r, g, b = img.split()
r = r.point(lambda i: min(255, int(i * 1.08)))  # 增强红色
b = b.point(lambda i: int(i * 0.95))  # 稍微降低蓝色
img = Image.merge('RGB', (r, g, b))

# 5. 轻微锐化
img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=100, threshold=3))

# 6. 添加柔和滤镜
img = img.filter(ImageFilter.SMOOTH_MORE)

# 保存美化后的图片
output_path = '/root/clawd/downloads/rose_beautified.png'
img.save(output_path, 'PNG', quality=95)
print(f'美化完成！保存至: {output_path}')
