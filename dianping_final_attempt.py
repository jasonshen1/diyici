#!/usr/bin/env python3
"""
最后尝试 - 使用 Playwright 的 connect_over_cdp
连接到真实的 Chrome 实例
"""

import json
import sys
import asyncio
from playwright.async_api import async_playwright

COOKIE_STR = '_lxsdk_cuid=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _lxsdk=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _hc.v=c8895c86-0b46-0e4a-d084-d26182e02b1f.1746277859; _lx_utm=utm_source%3Dgoogle%26utm_medium%3Dorganic; fspop=test; qruuid=11c2ade1-963e-461a-9a9c-a86d47882e3b; WEBDFPID=68962zz3vv01503v001u31428x5v738080x48y75wu457958817160vy-1770983563885-1770897158343OKIQAQE75613c134b6a252faa6802015be905514115; utm_source_rg=AM%2556yJkJ6%25358%2552Y57UUukkXCQXukXXCFuCr72JQkhu2X2XJr2ehQRFrQhYQ22ChC5Xke; ll=7fd06e815b796be3df069dec7836c3df; ua=%E6%9C%B4%E5%AE%9E%E6%97%A0%E5%8D%8E%E7%9A%84%E7%BE%8E%E9%A3%9F%E5%AE%B6; ctu=4058642c404a5aab140bc3845fa48721461f339265459eee86b07b8d406b890e; logan_session_token=0sycn0ix0w636k4y3f7c; _lxsdk_s=19c51b21a6e-20-dd3-a3%7C%7C47'

def parse_cookies(s):
    cookies = []
    for x in s.split(';'):
        x = x.strip()
        if '=' in x:
            parts = x.split('=', 1)
            if len(parts) == 2:
                name, value = parts
                if name and value:
                    cookies.append({'name': name, 'value': value, 'domain': '.dianping.com', 'path': '/'})
    return cookies

async def final_attempt(url):
    async with async_playwright() as p:
        # 使用 persistent context（保存用户数据）
        browser = await p.chromium.launch_persistent_context(
            user_data_dir='/tmp/dianping_user_data',
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--disable-blink-features=AutomationControlled',
            ],
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale='zh-CN',
            timezone_id='Asia/Shanghai',
        )
        
        # 添加 Cookie
        cookies = parse_cookies(COOKIE_STR)
        await browser.add_cookies(cookies)
        
        page = await browser.new_page()
        
        # 注入反检测
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en'] });
            window.chrome = { runtime: {} };
            Object.defineProperty(screen, 'colorDepth', { get: () => 24 });
            Object.defineProperty(screen, 'pixelDepth', { get: () => 24 });
        """)
        
        try:
            print(f"🎯 最后尝试: {url}", file=sys.stderr)
            
            # 访问首页建立信任
            await page.goto('https://m.dianping.com/dphome', wait_until='networkidle')
            await asyncio.sleep(3)
            
            # 访问目标
            await page.goto(url, wait_until='networkidle')
            await asyncio.sleep(5)
            
            title = await page.title()
            content = await page.evaluate('() => document.body.innerText')
            
            # 截图
            # await page.screenshot(path='/tmp/final_attempt.png')
            
            await browser.close()
            
            blocked = '登录' in content[:1000] and ('扫码' in content[:1000] or '验证码' in content[:1000])
            
            return {
                'success': True,
                'url': url,
                'title': title,
                'blocked': blocked,
                'content': content[:1500]
            }
            
        except Exception as e:
            await browser.close()
            return {'success': False, 'error': str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 dianping_final_attempt.py <url>")
        sys.exit(1)
    
    result = asyncio.run(final_attempt(sys.argv[1]))
    print(json.dumps(result, ensure_ascii=False, indent=2))
