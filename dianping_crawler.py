#!/usr/bin/env python3
"""
Playwright 爬虫 - 高级反检测版本
解决大众点评详情页爬取问题
"""

import json
import sys
import asyncio
from playwright.async_api import async_playwright

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

async def scrape_dianping(url):
    """爬取大众点评 - 高级版本"""
    
    async with async_playwright() as p:
        # 启动浏览器 - 使用更多参数规避检测
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
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ]
        )
        
        # 创建上下文 - 模拟真实浏览器
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080},
            device_scale_factor=1,
            locale='zh-CN',
            timezone_id='Asia/Shanghai',
            geolocation={'latitude': 31.2304, 'longitude': 121.4737},  # 上海坐标
            permissions=['geolocation'],
            color_scheme='light'
        )
        
        # 添加 Cookie
        cookies = parse_cookies(DIANPING_COOKIE_STRING)
        await context.add_cookies(cookies)
        
        # 创建页面
        page = await context.new_page()
        
        # 设置额外的请求头
        await page.set_extra_http_headers({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0'
        })
        
        try:
            # 如果是详情页，先访问首页建立会话
            if 'ugcdetail' in url or 'shop' in url:
                print("🔄 先访问首页建立会话...", file=sys.stderr)
                await page.goto('https://m.dianping.com/dphome', 
                               wait_until='networkidle', timeout=30000)
                await asyncio.sleep(2)
            
            # 访问目标页面
            print(f"🎯 访问目标页面: {url}", file=sys.stderr)
            await page.goto(url, wait_until='networkidle', timeout=30000)
            
            # 等待页面加载
            await asyncio.sleep(5)
            
            # 检查是否需要登录
            page_title = await page.title()
            page_content = await page.content()
            
            print(f"📄 页面标题: {page_title}", file=sys.stderr)
            
            # 检查是否被拦截
            if '登录' in page_content or '请登录' in page_content or '扫码' in page_content:
                print("⚠️ 检测到登录限制，尝试绕过...", file=sys.stderr)
                # 尝试滚动页面触发懒加载
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                await asyncio.sleep(3)
            
            # 提取数据
            title = await page.title()
            
            # 提取正文
            content = await page.evaluate('''() => {
                // 尝试多种选择器
                const selectors = [
                    'article', 
                    '[class*="content"]', 
                    '[class*="detail"]',
                    '[class*="note"]',
                    '.main-content',
                    '#content',
                    'main',
                    '.shop-info',
                    '.ugc-content'
                ];
                
                for (const selector of selectors) {
                    const el = document.querySelector(selector);
                    if (el && el.innerText.length > 50) {
                        return el.innerText.substring(0, 8000);
                    }
                }
                
                // 返回 body 文本
                return document.body.innerText.substring(0, 8000);
            }''')
            
            # 提取图片
            images = await page.evaluate('''() => {
                return Array.from(document.querySelectorAll('img'))
                    .map(img => ({
                        src: img.src,
                        alt: img.alt
                    }))
                    .filter(img => img.src && img.src.startsWith('http'))
                    .slice(0, 30);
            }''')
            
            # 提取链接
            links = await page.evaluate('''() => {
                return Array.from(document.querySelectorAll('a'))
                    .map(a => ({
                        href: a.href, 
                        text: a.innerText.trim().substring(0, 100)
                    }))
                    .filter(link => link.href && link.href.startsWith('http'))
                    .slice(0, 30);
            }''')
            
            # 截图（调试用）
            # await page.screenshot(path='/tmp/dianping_screenshot.png')
            
            await browser.close()
            
            return {
                'success': True,
                'url': url,
                'title': title,
                'content': content,
                'images_count': len(images),
                'images': images,
                'links_count': len(links),
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
        print("Usage: python3 dianping_crawler.py <url>", file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    result = await scrape_dianping(url)
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
