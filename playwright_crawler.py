#!/usr/bin/env python3
"""
Playwright 无头浏览器爬虫 - 支持 JavaScript 渲染
用于爬取小红书等动态加载的网站
"""

import json
import sys
import asyncio
from playwright.async_api import async_playwright

async def scrape_with_browser(url, wait_for=None, timeout=30000):
    """使用 Playwright 爬取网页"""
    
    async with async_playwright() as p:
        # 启动浏览器
        browser = await p.chromium.launch(
            headless=True,  # 无头模式
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )
        
        # 创建页面
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080}
        )
        
        page = await context.new_page()
        
        try:
            # 访问页面
            await page.goto(url, wait_until='networkidle', timeout=timeout)
            
            # 等待特定元素（如果指定）
            if wait_for:
                try:
                    await page.wait_for_selector(wait_for, timeout=10000)
                except:
                    pass  # 如果元素不存在，继续
            
            # 额外等待 JavaScript 渲染
            await asyncio.sleep(3)
            
            # 提取数据
            title = await page.title()
            
            # 尝试提取正文内容
            content = await page.evaluate('''() => {
                // 尝试多个可能的内容选择器
                const selectors = [
                    'article',
                    '[class*="content"]',
                    '[class*="detail"]',
                    '[class*="note"]',
                    '.main-content',
                    '#content',
                    'main'
                ];
                
                for (const selector of selectors) {
                    const el = document.querySelector(selector);
                    if (el && el.innerText.length > 100) {
                        return el.innerText.substring(0, 5000);
                    }
                }
                
                // 如果都没找到，返回 body 文本
                return document.body.innerText.substring(0, 5000);
            }''')
            
            # 提取所有图片
            images = await page.evaluate('''() => {
                return Array.from(document.querySelectorAll('img'))
                    .map(img => img.src)
                    .filter(src => src && src.startsWith('http'))
                    .slice(0, 20);
            }''')
            
            # 提取所有链接
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
        print("Usage: python3 playwright_crawler.py <url> [wait_for_selector]", file=sys.stderr)
        print("Example: python3 playwright_crawler.py https://www.xiaohongshu.com", file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    wait_for = sys.argv[2] if len(sys.argv) > 2 else None
    
    result = await scrape_with_browser(url, wait_for)
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
