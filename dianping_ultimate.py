#!/usr/bin/env python3
"""
大众点评爬虫 - 终极反检测版本
绕过所有防护层级
"""

import json
import sys
import asyncio
from playwright.async_api import async_playwright

DIANPING_COOKIE_STRING = '_lxsdk_cuid=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _lxsdk=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _hc.v=c8895c86-0b46-0e4a-d084-d26182e02b1f.1746277859; _lx_utm=utm_source%3Dgoogle%26utm_medium%3Dorganic; fspop=test; qruuid=11c2ade1-963e-461a-9a9c-a86d47882e3b; WEBDFPID=68962zz3vv01503v001u31428x5v738080x48y75wu457958817160vy-1770983563885-1770897158343OKIQAQE75613c134b6a252faa6802015be905514115; utm_source_rg=AM%2556yJkJ6%25358%2552Y57UUukkXCQXukXXCFuCr72JQkhu2X2XJr2ehQRFrQhYQ22ChC5Xke; ll=7fd06e815b796be3df069dec7836c3df; ua=%E6%9C%B4%E5%AE%9E%E6%97%A0%E5%8D%8E%E7%9A%84%E7%BE%8E%E9%A3%9F%E5%AE%B6; ctu=4058642c404a5aab140bc3845fa48721461f339265459eee86b07b8d406b890e; logan_session_token=0sycn0ix0w636k4y3f7c; _lxsdk_s=19c51b21a6e-20-dd3-a3%7C%7C47'

def parse_cookies(cookie_str):
    cookies = []
    for item in cookie_str.split(';'):
        item = item.strip()
        if '=' in item:
            name, value = item.split('=', 1)
            cookies.append({
                "name": name,
                "value": value,
                "domain": ".dianping.com",
                "path": "/"
            })
    return cookies

async def scrape_dianping_ultimate(url):
    """终极反检测爬虫"""
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--disable-blink-features=AutomationControlled',
            ]
        )
        
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080},
            locale='zh-CN',
            timezone_id='Asia/Shanghai',
        )
        
        # 添加 Cookie
        cookies = parse_cookies(DIANPING_COOKIE_STRING)
        await context.add_cookies(cookies)
        
        page = await context.new_page()
        
        # 注入脚本隐藏自动化特征
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
            window.chrome = { runtime: {} };
        """)
        
        try:
            print(f"🎯 访问: {url}", file=sys.stderr)
            
            # 先访问首页
            await page.goto('https://m.dianping.com/dphome', wait_until='networkidle', timeout=30000)
            await asyncio.sleep(2)
            
            # 再访问目标
            await page.goto(url, wait_until='networkidle', timeout=30000)
            await asyncio.sleep(3)
            
            title = await page.title()
            print(f"📄 标题: {title}", file=sys.stderr)
            
            # 获取内容
            content = await page.evaluate('() => document.body.innerText.substring(0, 8000)')
            
            # 检查是否被拦截
            is_login_page = '登录' in content[:1000] or '扫码' in content[:1000]
            
            images = await page.evaluate('''() => {
                return Array.from(document.querySelectorAll('img'))
                    .map(img => img.src)
                    .filter(src => src && src.startsWith('http'))
                    .slice(0, 20);
            }''')
            
            await browser.close()
            
            return {
                'success': True,
                'url': url,
                'title': title,
                'is_login_page': is_login_page,
                'content': content[:3000],
                'images': images
            }
            
        except Exception as e:
            await browser.close()
            return {'success': False, 'error': str(e)}

async def main():
    if len(sys.argv) < 2:
        print("Usage: python3 dianping_ultimate.py <url>", file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    result = await scrape_dianping_ultimate(url)
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
