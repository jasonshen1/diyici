#!/usr/bin/env python3
"""
大众点评爬虫 - 使用 curl_cffi 模拟真实浏览器指纹
最后的尝试
"""

import json
import sys
import subprocess
import re

COOKIE = '_lxsdk_cuid=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _lxsdk=19696457ed1c8-0da93336f940d8-1f525636-13c680-19696457ed2c8; _hc.v=c8895c86-0b46-0e4a-d084-d26182e02b1f.1746277859; _lx_utm=utm_source%3Dgoogle%26utm_medium%3Dorganic; fspop=test; qruuid=11c2ade1-963e-461a-9a9c-a86d47882e3b; WEBDFPID=68962zz3vv01503v001u31428x5v738080x48y75wu457958817160vy-1770983563885-1770897158343OKIQAQE75613c134b6a252faa6802015be905514115; utm_source_rg=AM%2556yJkJ6%25358%2552Y57UUukkXCQXukXXCFuCr72JQkhu2X2XJr2ehQRFrQhYQ22ChC5Xke; ll=7fd06e815b796be3df069dec7836c3df; ua=%E6%9C%B4%E5%AE%9E%E6%97%A0%E5%8D%8E%E7%9A%84%E7%BE%8E%E9%A3%9F%E5%AE%B6; ctu=4058642c404a5aab140bc3845fa48721461f339265459eee86b07b8d406b890e; logan_session_token=0sycn0ix0w636k4y3f7c; _lxsdk_s=19c51b21a6e-20-dd3-a3%7C%7C47'

def scrape_with_curl(url):
    """使用 curl 命令获取"""
    
    headers = [
        '-H', 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        '-H', 'Accept-Language: zh-CN,zh-Hans;q=0.9',
        '-H', 'Accept-Encoding: gzip, deflate, br',
        '-H', f'Cookie: {COOKIE}',
        '-H', 'Referer: https://m.dianping.com/',
        '-H', 'Connection: keep-alive',
    ]
    
    try:
        # 使用 curl 命令
        cmd = ['curl', '-s', '-L', '--compressed', '-k'] + headers + [url]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        html = result.stdout
        
        # 提取信息
        title_match = re.search(r'<title>([^<]+)</title>', html, re.IGNORECASE)
        title = title_match.group(1) if title_match else 'Unknown'
        
        # 检查是否被拦截
        blocked = '登录' in html or '扫码' in html or '请登录' in html
        
        return {
            'success': True,
            'url': url,
            'title': title,
            'blocked': blocked,
            'content_preview': html[:2000] if len(html) > 2000 else html
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 dianping_curl.py <url>")
        sys.exit(1)
    
    result = scrape_with_curl(sys.argv[1])
    print(json.dumps(result, ensure_ascii=False, indent=2))
