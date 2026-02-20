#!/usr/bin/env python3
"""
大众点评爬虫 - 纯 HTTP 请求版本
不使用浏览器，直接请求 API
"""

import json
import sys
import urllib.request
import urllib.parse
import ssl

# 禁用 SSL 验证（测试用）
ssl._create_default_https_context = ssl._create_unverified_context

# Cookie
COOKIE = '_lxsdk_cuid=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _lxsdk=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _hc.v=c8895c86-0b46-0e4a-d084-d26182e02b1f.1746277859; _lx_utm=utm_source%3Dgoogle%26utm_medium%3Dorganic; fspop=test; qruuid=11c2ade1-963e-461a-9a9c-a86d47882e3b; WEBDFPID=68962zz3vv01503v001u31428x5v738080x48y75wu457958817160vy-1770983563885-1770897158343OKIQAQE75613c134b6a252faa6802015be905514115; utm_source_rg=AM%2556yJkJ6%25358%2552Y57UUukkXCQXukXXCFuCr72JQkhu2X2XJr2ehQRFrQhYQ22ChC5Xke; ll=7fd06e815b796be3df069dec7836c3df; ua=%E6%9C%B4%E5%AE%9E%E6%97%A0%E5%8D%8E%E7%9A%84%E7%BE%8E%E9%A3%9F%E5%AE%B6; ctu=4058642c404a5aab140bc3845fa48721461f339265459eee86b07b8d406b890e; logan_session_token=0sycn0ix0w636k4y3f7c; _lxsdk_s=19c51b21a6e-20-dd3-a3%7C%7C47'

def fetch_dianping(url):
    """直接 HTTP 请求"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cookie': COOKIE,
        'Connection': 'keep-alive',
        'Referer': 'https://m.dianping.com/',
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        
        # 使用 opener 处理 gzip
        opener = urllib.request.build_opener()
        response = opener.open(req, timeout=30)
        
        # 读取内容
        import gzip
        if response.headers.get('Content-Encoding') == 'gzip':
            html = gzip.decompress(response.read()).decode('utf-8', errors='ignore')
        else:
            html = response.read().decode('utf-8', errors='ignore')
        
        return {
            'success': True,
            'url': url,
            'status': response.status,
            'html': html[:5000]
        }
        
    except Exception as e:
        return {
            'success': False,
            'url': url,
            'error': str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 dianping_http.py <url>", file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    result = fetch_dianping(url)
    print(json.dumps(result, ensure_ascii=False, indent=2))
