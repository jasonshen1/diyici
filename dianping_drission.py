#!/usr/bin/env python3
"""
大众点评爬虫 - DrissionPage 版本
强大的反检测工具
"""

import json
import sys
import time

from DrissionPage import ChromiumPage, ChromiumOptions

COOKIE_STRING = '_lxsdk_cuid=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _lxsdk=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _hc.v=c8895c86-0b46-0e4a-d084-d26182e02b1f.1746277859; _lx_utm=utm_source%3Dgoogle%26utm_medium%3Dorganic; fspop=test; qruuid=11c2ade1-963e-461a-9a9c-a86d47882e3b; WEBDFPID=68962zz3vv01503v001u31428x5v738080x48y75wu457958817160vy-1770983563885-1770897158343OKIQAQE75613c134b6a252faa6802015be905514115; utm_source_rg=AM%2556yJkJ6%25358%2552Y57UUukkXCQXukXXCFuCr72JQkhu2X2XJr2ehQRFrQhYQ22ChC5Xke; ll=7fd06e815b796be3df069dec7836c3df; ua=%E6%9C%B4%E5%AE%9E%E6%97%A0%E5%8D%8E%E7%9A%84%E7%BE%8E%E9%A3%9F%E5%AE%B6; ctu=4058642c404a5aab140bc3845fa48721461f339265459eee86b07b8d406b890e; logan_session_token=0sycn0ix0w636k4y3f7c; _lxsdk_s=19c51b21a6e-20-dd3-a3%7C%7C47'

def scrape_with_drission(url):
    """使用 DrissionPage 爬取"""
    
    # 配置浏览器选项
    co = ChromiumOptions()
    co.headless(True)  # 无头模式
    co.set_argument('--no-sandbox')
    co.set_argument('--disable-gpu')
    co.set_user_agent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    # 创建页面对象
    page = ChromiumPage(addr_or_opts=co)
    
    try:
        print(f"🎯 访问: {url}", file=sys.stderr)
        
        # 设置 Cookie
        page.get('https://m.dianping.com/dphome')
        time.sleep(2)
        
        # 添加 Cookie
        for cookie in COOKIE_STRING.split(';'):
            cookie = cookie.strip()
            if '=' in cookie:
                name, value = cookie.split('=', 1)
                try:
                    page.set_cookie({'name': name, 'value': value, 'domain': '.dianping.com'})
                except:
                    pass
        
        # 访问目标页面
        page.get(url)
        time.sleep(5)
        
        # 获取页面信息
        title = page.title
        html = page.html
        
        print(f"📄 标题: {title}", file=sys.stderr)
        
        # 检查是否被拦截
        is_blocked = '登录' in html[:2000] or '扫码' in html[:2000]
        
        # 提取文本内容
        text = page.ele('tag:body').text if page.ele('tag:body') else ''
        
        page.quit()
        
        return {
            'success': True,
            'url': url,
            'title': title,
            'is_blocked': is_blocked,
            'content': text[:3000] if text else html[:3000],
        }
        
    except Exception as e:
        try:
            page.quit()
        except:
            pass
        return {'success': False, 'error': str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 dianping_drission.py <url>")
        sys.exit(1)
    
    url = sys.argv[1]
    result = scrape_with_drission(url)
    print(json.dumps(result, ensure_ascii=False, indent=2))
