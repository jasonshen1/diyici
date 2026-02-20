#!/usr/bin/env python3
"""
Playwright 无头浏览器爬虫 - 带 Cookie 版本
用于爬取需要登录的网站（如大众点评）
"""

import json
import sys
import asyncio
from playwright.async_api import async_playwright

# 从用户获取的 Cookie（登录状态）
DIANPING_COOKIE_STRING = '_lxsdk_cuid=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _lxsdk=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _hc.v=c8895c86-0b46-0e4a-d084-d26182e02b1f.1746277859; _lx_utm=utm_source%3Dgoogle%26utm_medium%3Dorganic; fspop=test; qruuid=11c2ade1-963e-461a-9a9c-a86d47882e3b; WEBDFPID=68962zz3vv01503v001u31428x5v738080x48y75wu457958817160vy-1770983563885-1770897158343OKIQAQE75613c134b6a252faa6802015be905514115; utm_source_rg=AM%2556yJkJ6%25358%2552Y57UUukkXCQXukXXCFuCr72JQkhu2X2XJr2ehQRFrQhYQ22ChC5Xke; ll=7fd06e815b796be3df069dec7836c3df; ua=%E6%9C%B4%E5%AE%9E%E6%97%A0%E5%8D%8E%E7%9A%84%E7%BE%8E%E9%A3%9F%E5%AE%B6; ctu=4058642c404a5aab140bc3845fa48721461f339265459eee86b07b8d406b890e; logan_session_token=0sycn0ix0w636k4y3f7c; _lxsdk_s=19c51b21a6e-20-dd3-a3%7C%7C47'

def parse_cookie_string(cookie_str):
    """解析 Cookie 字符串为 Playwright 格式"""
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

DIANPING_COOKIES = parse_cookie_string(DIANPING_COOKIE_STRING)

async def scrape_with_cookies(url, cookies=None, wait_for=None, timeout=30000):
    """使用 Cookie 爬取网页"""
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )
        
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080}
        )
        
        # 添加 Cookie
        if cookies:
            await context.add_cookies(cookies)
        
        page = await context.new_page()
        
        try:
            await page.goto(url, wait_until='networkidle', timeout=timeout)
            await asyncio.sleep(3)
            
            # 提取数据
            title = await page.title()
            content = await page.evaluate('''() => {
                const selectors = ['article', '[class*="content"]', '[class*="detail"]', '.main-content', '#content', 'main'];
                for (const selector of selectors) {
                    const el = document.querySelector(selector);
                    if (el && el.innerText.length > 100) {
                        return el.innerText.substring(0, 5000);
                    }
                }
                return document.body.innerText.substring(0, 5000);
            }''')
            
            images = await page.evaluate('''() => {
                return Array.from(document.querySelectorAll('img'))
                    .map(img => img.src)
                    .filter(src => src && src.startsWith('http'))
                    .slice(0, 20);
            }''')
            
            links = await page.evaluate('''() => {
                return Array.from(document.querySelectorAll('a'))
                    .map(a => ({href: a.href, text: a.innerText.substring(0, 50)}))
                    .filter(link => link.href && link.href.startsWith('http'))
                    .slice(0, 20);
            }''')
            
            await browser.close()
            
            return {
                'success': True,
                'url': url,
                'title': title,
                'content': content,
                'images': images,
                'links': links
            }
            
        except Exception as e:
            await browser.close()
            return {
                'success': False,
                'url': url,
                'error': str(e)
            }

async def main():
    if len(sys.argv) < 2:
        print("Usage: python3 playwright_crawler_with_cookies.py <url>", file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    
    # 如果是大众点评网站，使用 Cookie
    cookies = None
    if 'dianping.com' in url:
        cookies = DIANPING_COOKIES
        print(f"🍪 使用 Cookie 访问大众点评...", file=sys.stderr)
    
    result = await scrape_with_cookies(url, cookies)
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
