#!/usr/bin/env python3
"""
大众点评爬虫 - Stealth 版本
使用 playwright-stealth 绕过检测
"""

import json
import sys
import asyncio
from playwright.async_api import async_playwright
from playwright_stealth import stealth

# Cookie 字符串
DIANPING_COOKIE_STRING = '_lxsdk_cuid=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _lxsdk=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _hc.v=c8895c86-0b46-0e4a-d084-d26182e02b1f.1746277859; _lx_utm=utm_source%3Dgoogle%26utm_medium%3Dorganic; fspop=test; qruuid=11c2ade1-963e-461a-9a9c-a86d47882e3b; WEBDFPID=68962zz3vv01503v001u31428x5v738080x48y75wu457958817160vy-1770983563885-1770897158343OKIQAQE75613c134b6a252faa6802015be905514115; utm_source_rg=AM%2556yJkJ6%25358%2552Y57UUukkXCQXukXXCFuCr72JQkhu2X2XJr2ehQRFrQhYQ22ChC5Xke; ll=7fd06e815b796be3df069dec7836c3df; ua=%E6%9C%B4%E5%AE%9E%E6%97%A0%E5%8D%8E%E7%9A%84%E7%BE%8E%E9%A3%9F%E5%AE%B6; ctu=4058642c404a5aab140bc3845fa48721461f339265459eee86b07b8d406b890e; logan_session_token=0sycn0ix0w636k4y3f7c; _lxsdk_s=19c51b21a6e-20-dd3-a3%7C%7C47'

def parse_cookies(cookie_str):
    """解析 Cookie"""
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

async def scrape_with_stealth(url):
    """使用 stealth 模式爬取"""
    
    async with async_playwright() as p:
        # 启动浏览器 - 更像真实用户
        browser = await p.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--disable-blink-features=AutomationControlled',  # 关键：禁用自动化标记
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
            ]
        )
        
        # 创建上下文
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080},
            device_scale_factor=1,
            locale='zh-CN',
            timezone_id='Asia/Shanghai',
            geolocation={'latitude': 31.2304, 'longitude': 121.4737},
            permissions=['geolocation'],
            color_scheme='light',
            # 添加更多真实浏览器特征
            extra_http_headers={
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
            }
        )
        
        # 添加 Cookie
        cookies = parse_cookies(DIANPING_COOKIE_STRING)
        await context.add_cookies(cookies)
        
        # 创建页面
        page = await context.new_page()
        
        # 应用 stealth 模式 - 隐藏自动化特征
        await stealth(page)
        
        try:
            print(f"🎯 访问: {url}", file=sys.stderr)
            
            # 访问页面
            await page.goto(url, wait_until='networkidle', timeout=30000)
            
            # 模拟人类行为：滚动
            await page.evaluate('window.scrollTo(0, 300)')
            await asyncio.sleep(2)
            await page.evaluate('window.scrollTo(0, 600)')
            await asyncio.sleep(2)
            
            # 获取页面信息
            title = await page.title()
            print(f"📄 标题: {title}", file=sys.stderr)
            
            # 提取内容
            content = await page.evaluate('''() => {
                // 移除 script 和 style
                const scripts = document.querySelectorAll('script, style, nav, footer');
                scripts.forEach(s => s.remove());
                
                // 获取可见文本
                const bodyText = document.body.innerText;
                return bodyText.substring(0, 10000);
            }''')
            
            # 检查是否成功
            is_blocked = '登录' in content[:500] or '扫码' in content[:500] or '请登录' in content[:500]
            
            # 提取图片
            images = await page.evaluate('''() => {
                return Array.from(document.querySelectorAll('img'))
                    .filter(img => img.width > 50 && img.height > 50)
                    .map(img => ({
                        src: img.src,
                        alt: img.alt || '',
                        width: img.width,
                        height: img.height
                    }))
                    .filter(img => img.src && img.src.startsWith('http'))
                    .slice(0, 50);
            }''')
            
            await browser.close()
            
            return {
                'success': True,
                'url': url,
                'title': title,
                'is_blocked': is_blocked,
                'content_preview': content[:2000] if len(content) > 2000 else content,
                'images_count': len(images),
                'images': images[:20]
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
        print("Usage: python3 dianping_stealth.py <url>", file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    result = await scrape_with_stealth(url)
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
