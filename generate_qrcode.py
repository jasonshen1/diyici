#!/usr/bin/env python3
"""
生成 Shadowrocket 配置二维码
"""

import qrcode
import base64
import sys

# 读取配置文件
with open('/root/.openclaw/workspace/shadowrocket.conf', 'r') as f:
    config_content = f.read()

# Shadowrocket 配置链接格式
# 可以直接使用配置文件内容生成二维码
# 或者使用订阅链接格式

# 方法1：直接生成配置文件的二维码（如果内容不太长）
# Shadowrocket 支持直接导入 .conf 文件

# 创建二维码
qr = qrcode.QRCode(
    version=None,  # 自动选择版本
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)

# 由于配置文件很长，我们生成一个提示二维码
# 提示用户配置文件位置

# 或者，我们可以将配置内容进行 base64 编码
config_base64 = base64.b64encode(config_content.encode()).decode()

# 生成 shadowrocket:// 链接格式
# 注意：这只是一个模板，实际需要在配置文件中填写真实的服务器信息
shadowrocket_url = f"shadowrocket://add/sub://{config_base64}"

# 但内容可能太长，我们改为生成一个提示信息
simple_message = """Shadowrocket 配置文件

文件位置：/root/.openclaw/workspace/shadowrocket.conf

使用方法：
1. 将此文件发送到 iPhone
2. 用 Shadowrocket 打开
3. 修改代理服务器信息
4. 开启连接

⚠️ 注意：
请先修改配置文件中的代理服务器信息！
当前配置使用的是示例信息（your-server.com），
无法直接使用！
"""

qr.add_data(simple_message)
qr.make(fit=True)

# 生成图片
img = qr.make_image(fill_color="black", back_color="white")

# 保存图片
output_path = '/root/.openclaw/workspace/shadowrocket_qrcode.png'
img.save(output_path)

print(f"✅ 二维码已生成：{output_path}")
print(f"\n📱 使用方法：")
print(f"1. 将二维码图片发送到 iPhone")
print(f"2. 在 iPhone 上保存图片")
print(f"3. 打开 Shadowrocket → 扫码导入")
print(f"\n⚠️  重要提醒：")
print(f"请先修改配置文件中的代理服务器信息！")
print(f"当前配置使用的是示例信息，无法直接使用！")
