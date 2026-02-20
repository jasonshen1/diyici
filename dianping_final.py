#!/usr/bin/env python3
"""
大众点评爬虫 - 尝试不同的方法
1. 使用移动版 UA
2. 使用代理
3. 模拟完整请求流程
"""

import json
import sys
import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

# 使用完整的请求头
MOBILE_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://m.dianping.com/',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Cache-Control': 'max-age=0',
}

def fetch_shop_share(url):
    """获取分享链接的内容"""
    
    try:
        req = urllib.request.Request(url, headers=MOBILE_HEADERS)
        
        # 创建 opener
        opener = urllib.request.build_opener()
        response = opener.open(req, timeout=30)
        
        # 处理 gzip
        import gzip
        if response.headers.get('Content-Encoding') == 'gzip':
            content = gzip.decompress(response.read())
        else:
            content = response.read()
        
        html = content.decode('utf-8', errors='ignore')
        
        # 提取关键信息
        import re
        
        # 店铺名称
        shop_match = re.search(r'og:title" content="([^"]+)"', html)
        shop_name = shop_match.group(1) if shop_match else None
        
        # 描述
        desc_match = re.search(r'og:description" content="([^"]+)"', html)
        description = desc_match.group(1) if desc_match else None
        
        # 图片
        img_match = re.search(r'og:image" content="([^"]+)"', html)
        image = img_match.group(1) if img_match else None
        
        # 检查是否有内容
        has_content = shop_name and shop_name != '-大众点评'
        
        return {
            'success': True,
            'url': url,
            'has_content': has_content,
            'shop_name': shop_name,
            'description': description,
            'image': image,
            'html_length': len(html)
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 dianping_final.py <url>")
        sys.exit(1)
    
    result = fetch_shop_share(sys.argv[1])
    print(json.dumps(result, ensure_ascii=False, indent=2))
