#!/usr/bin/env python3
"""
通用网页爬虫脚本 - 直接爬取网页内容
无需 API Key，免费使用
"""

import sys
import json
import urllib.request
import urllib.parse
import re
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

class MLStripper(HTMLParser):
    """HTML 标签剥离器"""
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.text = []
    
    def handle_data(self, d):
        self.text.append(d)
    
    def get_data(self):
        return ''.join(self.text)

def strip_tags(html):
    """去除 HTML 标签"""
    s = MLStripper()
    s.feed(html)
    return s.get_data()

def clean_text(text):
    """清理文本"""
    # 移除多余空白
    text = re.sub(r'\s+', ' ', text)
    # 移除特殊字符
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    return text.strip()

def fetch_url(url, timeout=30):
    """获取网页内容"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as response:
            content_type = response.headers.get('Content-Type', '')
            
            # 检测编码
            charset = 'utf-8'
            if 'charset=' in content_type:
                charset = content_type.split('charset=')[-1].split(';')[0].strip()
            
            html = response.read().decode(charset, errors='ignore')
            return {
                'success': True,
                'url': url,
                'status': response.status,
                'content_type': content_type,
                'html': html
            }
    except Exception as e:
        return {
            'success': False,
            'url': url,
            'error': str(e)
        }

def extract_title(html):
    """提取标题"""
    title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.DOTALL | re.IGNORECASE)
    if title_match:
        return clean_text(strip_tags(title_match.group(1)))
    return None

def extract_meta_description(html):
    """提取 meta description"""
    desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', html, re.IGNORECASE)
    if desc_match:
        return clean_text(desc_match.group(1))
    desc_match = re.search(r'<meta[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']description["\']', html, re.IGNORECASE)
    if desc_match:
        return clean_text(desc_match.group(1))
    return None

def extract_main_content(html):
    """提取主要内容"""
    # 尝试找到主要内容区域
    content_patterns = [
        r'<article[^>]*>(.*?)</article>',
        r'<main[^>]*>(.*?)</main>',
        r'<div[^>]*class=["\'][^"\']*content[^"\']*["\'][^>]*>(.*?)</div>',
        r'<div[^>]*class=["\'][^"\']*article[^"\']*["\'][^>]*>(.*?)</div>',
        r'<div[^>]*id=["\']content["\'][^>]*>(.*?)</div>',
        r'<div[^>]*id=["\']main["\'][^>]*>(.*?)</div>',
    ]
    
    for pattern in content_patterns:
        match = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
        if match:
            content = match.group(1)
            # 移除 script 和 style 标签
            content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
            content = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL | re.IGNORECASE)
            text = strip_tags(content)
            return clean_text(text)
    
    # 如果没有找到特定区域，提取 body 内容
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
    if body_match:
        content = body_match.group(1)
        # 移除 script 和 style 标签
        content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
        content = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL | re.IGNORECASE)
        content = re.sub(r'<nav[^>]*>.*?</nav>', '', content, flags=re.DOTALL | re.IGNORECASE)
        content = re.sub(r'<footer[^>]*>.*?</footer>', '', content, flags=re.DOTALL | re.IGNORECASE)
        content = re.sub(r'<header[^>]*>.*?</header>', '', content, flags=re.DOTALL | re.IGNORECASE)
        text = strip_tags(content)
        return clean_text(text)
    
    return None

def extract_links(html, base_url):
    """提取链接"""
    links = []
    href_pattern = r'href=["\']([^"\']+)["\']'
    for match in re.finditer(href_pattern, html, re.IGNORECASE):
        href = match.group(1)
        # 跳过锚点和 javascript
        if href.startswith('#') or href.startswith('javascript:'):
            continue
        # 转换为绝对 URL
        full_url = urljoin(base_url, href)
        links.append(full_url)
    return list(set(links))  # 去重

def scrape_url(url):
    """爬取单个 URL"""
    result = fetch_url(url)
    
    if not result['success']:
        return result
    
    html = result['html']
    
    return {
        'success': True,
        'url': url,
        'status': result['status'],
        'title': extract_title(html),
        'description': extract_meta_description(html),
        'content': extract_main_content(html)[:5000],  # 限制长度
        'links': extract_links(html, url)[:20]  # 限制链接数量
    }

def search_duckduckgo(query, max_results=10):
    """使用 DuckDuckGo 搜索"""
    try:
        encoded_query = urllib.parse.quote(query)
        url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
        
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response:
            html = response.read().decode('utf-8')
            
            results = []
            # 提取搜索结果
            pattern = r'<a rel="nofollow" class="result__a" href="([^"]*)">([^<]*)</a>'
            matches = re.findall(pattern, html)
            
            for i, (url, title) in enumerate(matches[:max_results]):
                # 清理 DuckDuckGo 的重定向 URL
                if url.startswith('//'):
                    url = 'https:' + url
                elif url.startswith('/'):
                    url = 'https://duckduckgo.com' + url
                
                # 解码 URL
                if 'uddg=' in url:
                    try:
                        url = urllib.parse.unquote(url.split('uddg=')[1].split('&')[0])
                    except:
                        pass
                
                results.append({
                    'position': i + 1,
                    'title': clean_text(strip_tags(title)),
                    'url': url
                })
            
            return {
                'success': True,
                'query': query,
                'results': results
            }
    except Exception as e:
        return {
            'success': False,
            'query': query,
            'error': str(e)
        }

def main():
    if len(sys.argv) < 2:
        print("Usage:", file=sys.stderr)
        print("  爬取网页: python3 web_crawler.py scrape <url>", file=sys.stderr)
        print("  搜索: python3 web_crawler.py search <query>", file=sys.stderr)
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'scrape' and len(sys.argv) >= 3:
        url = sys.argv[2]
        result = scrape_url(url)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    elif command == 'search' and len(sys.argv) >= 3:
        query = sys.argv[2]
        max_results = int(sys.argv[3]) if len(sys.argv) > 3 else 10
        result = search_duckduckgo(query, max_results)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    else:
        print("Unknown command or missing arguments", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
