#!/usr/bin/env python3
"""
大众点评爬虫 - Puppeteer + 终极伪装
使用 pyppeteer 和完整的环境模拟
"""

import json
import sys
import asyncio
import random

# 安装 pyppeteer
try:
    from pyppeteer import launch
except ImportError:
    import subprocess
    subprocess.run(['pip3', 'install', 'pyppeteer'], check=True)
    from pyppeteer import launch

COOKIE_STR = '_lxsdk_cuid=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _lxsdk=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _hc.v=c8895c86-0b46-0e4a-d084-d26182e02b1f.1746277859; _lx_utm=utm_source%3Dgoogle%26utm_medium%3Dorganic; fspop=test; qruuid=11c2ade1-963e-461a-9a9c-a86d47882e3b; WEBDFPID=68962zz3vv01503v001u31428x5v738080x48y75wu457958817160vy-1770983563885-1770897158343OKIQAQE75613c134b6a252faa6802015be905514115; utm_source_rg=AM%2556yJkJ6%25358%2552Y57UUukkXCQXukXXCFuCr72JQkhu2X2XJr2ehQRFrQhYQ22ChC5Xke; ll=7fd06e815b796be3df069dec7836c3df; ua=%E6%9C%B4%E5%AE%9E%E6%97%A0%E5%8D%8E%E7%9A%84%E7%BE%8E%E9%A3%9F%E5%AE%B6; ctu=4058642c404a5aab140bc3845fa48721461f339265459eee86b07b8d406b890e; logan_session_token=0sycn0ix0w636k4y3f7c; _lxsdk_s=19c51b21a6e-20-dd3-a3%7C%7C47'

async def scrape_with_puppeteer(url):
    """使用 Puppeteer 爬取"""
    
    browser = await launch(
        headless=True,
        args=[
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            f'--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ]
    )
    
    page = await browser.newPage()
    
    # 设置 viewport
    await page.setViewport({'width': 1920, 'height': 1080})
    
    # 注入反检测脚本
    await page.evaluateOnNewDocument('''() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en'] });
        window.chrome = { runtime: {} };
        
        // 覆盖 permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );
    }''')
    
    try:
        print(f"🎯 访问: {url}", file=sys.stderr)
        
        # 先访问首页
        await page.goto('https://m.dianping.com/dphome', {'waitUntil': 'networkidle2'})
        await asyncio.sleep(2)
        
        # 设置 Cookie
        cookies = []
        for item in COOKIE_STR.split(';'):
            item = item.strip()
            if '=' in item:
                name, value = item.split('=', 1)
                cookies.append({'name': name, 'value': value, 'domain': '.dianping.com'})
        
        await page.setCookie(*cookies)
        
        # 访问目标
        await page.goto(url, {'waitUntil': 'networkidle2'})
        await asyncio.sleep(5)
        
        # 模拟人类行为
        for _ in range(3):
            await page.mouse.move(random.randint(100, 800), random.randint(100, 600))
            await asyncio.sleep(1)
        
        # 滚动
        await page.evaluate('window.scrollBy(0, 500)')
        await asyncio.sleep(2)
        
        # 获取内容
        title = await page.title()
        content = await page.evaluate('() => document.body.innerText')
        
        await browser.close()
        
        blocked = '登录' in content[:1000] and '扫码' in content[:1000]
        
        return {
            'success': True,
            'url': url,
            'title': title,
            'blocked': blocked,
            'content': content[:2000]
        }
        
    except Exception as e:
        await browser.close()
        return {'success': False, 'error': str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 dianping_puppeteer.py <url>")
        sys.exit(1)
    
    result = asyncio.run(scrape_with_puppeteer(sys.argv[1]))
    print(json.dumps(result, ensure_ascii=False, indent=2))
