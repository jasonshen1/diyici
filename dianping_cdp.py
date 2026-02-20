#!/usr/bin/env python3
"""
大众点评爬虫 - 使用 CDP (Chrome DevTools Protocol)
最深层次的浏览器控制
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
        if '=' in x and x:  # 确保不是空字符串
            parts = x.split('=', 1)
            if len(parts) == 2:
                name, value = parts
                if name and value:  # 确保名称和值都不为空
                    cookies.append({
                        "name": name.strip(), 
                        "value": value.strip(), 
                        "domain": ".dianping.com", 
                        "path": "/"
                    })
    return cookies

async def scrape_cdp(url):
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
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-site-isolation-trials',
            ]
        )
        
        # 获取浏览器上下文
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
            viewport={'width': 390, 'height': 844},  # iPhone 尺寸
            locale='zh-CN',
            timezone_id='Asia/Shanghai',
        )
        
        # 添加初始化脚本 - 最深层次的隐藏
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en'] });
            window.chrome = { runtime: {} };
            window.Notification = undefined;
            
            // 覆盖 Canvas 指纹
            const originalGetContext = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(type) {
                if (type === '2d') {
                    const ctx = originalGetContext.call(this, type);
                    const originalGetImageData = ctx.getImageData;
                    ctx.getImageData = function(x, y, w, h) {
                        const data = originalGetImageData.call(this, x, y, w, h);
                        // 添加微小噪点
                        for (let i = 0; i < data.data.length; i += 4) {
                            data.data[i] += Math.random() > 0.5 ? 1 : 0;
                        }
                        return data;
                    };
                    return ctx;
                }
                return originalGetContext.call(this, type);
            };
        """)
        
        # 添加 Cookie
        await context.add_cookies(parse_cookies(COOKIE_STR))
        
        page = await context.new_page()
        
        try:
            print(f"🎯 访问: {url}", file=sys.stderr)
            
            # 先访问首页建立信任
            await page.goto('https://m.dianping.com/dphome', wait_until='domcontentloaded')
            await asyncio.sleep(3)
            
            # 模拟点击行为
            await page.mouse.move(100, 200)
            await asyncio.sleep(0.5)
            await page.mouse.move(200, 400)
            await asyncio.sleep(0.5)
            
            # 访问目标
            await page.goto(url, wait_until='networkidle')
            await asyncio.sleep(5)
            
            # 滚动页面
            await page.evaluate('window.scrollTo(0, 500)')
            await asyncio.sleep(2)
            
            title = await page.title()
            content = await page.evaluate('() => document.body.innerText.substring(0, 5000)')
            
            # 检查是否成功
            blocked = '登录' in content[:1000] and '扫码' in content[:1000]
            
            await browser.close()
            
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
        print("Usage: python3 dianping_cdp.py <url>")
        sys.exit(1)
    
    result = asyncio.run(scrape_cdp(sys.argv[1]))
    print(json.dumps(result, ensure_ascii=False, indent=2))
