#!/usr/bin/env python3
"""
DuckDuckGo 搜索脚本 - 完全免费，无需 API Key
"""

import json
import sys
import urllib.request
import urllib.parse
import re
from html.parser import HTMLParser

class DDGSearch:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        }
    
    def search(self, query, count=10):
        """搜索并返回结果"""
        encoded_query = urllib.parse.quote(query)
        url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
        
        req = urllib.request.Request(url, headers=self.headers)
        
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                html = response.read().decode('utf-8')
                results = self._parse_results(html, count)
                return results
        except Exception as e:
            return {"error": str(e), "results": []}
    
    def _parse_results(self, html, count):
        """解析搜索结果"""
        results = []
        
        # 简单的正则提取搜索结果
        # DuckDuckGo HTML 结构
        pattern = r'<a rel="nofollow" class="result__a" href="([^"]*)">([^<]*)</a>'
        matches = re.findall(pattern, html)
        
        for i, (url, title) in enumerate(matches[:count]):
            # 清理标题
            title = re.sub(r'<[^>]+>', '', title)
            results.append({
                "title": title,
                "url": url,
                "position": i + 1
            })
        
        return {"query": "", "results": results}


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 ddg_search.py <query> [count]", file=sys.stderr)
        sys.exit(1)
    
    query = sys.argv[1]
    count = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    ddg = DDGSearch()
    results = ddg.search(query, count)
    
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
