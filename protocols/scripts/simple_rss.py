#!/usr/bin/env python3
"""
热点猎手 - 简化版RSS聚合器
使用稳定可靠的直接RSS源
"""

import json
import time
import random
import re
from datetime import datetime
from typing import List, Dict
import requests

class SimpleRSSAggregator:
    """简化版RSS聚合器 - 使用已知稳定源"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def fetch_zhihu_daily(self) -> List[Dict]:
        """
        知乎日报 RSS
        https://www.zhihu.com/rss
        """
        try:
            print("  📡 知乎日报...", end=" ")
            response = self.session.get('https://www.zhihu.com/rss', timeout=10)
            response.encoding = 'utf-8'
            
            # 解析XML
            import xml.etree.ElementTree as ET
            root = ET.fromstring(response.content)
            
            topics = []
            items = root.findall('.//item')[:10]
            
            for idx, item in enumerate(items, 1):
                title = item.find('title')
                link = item.find('link')
                desc = item.find('description')
                
                if title is not None and title.text:
                    # 清理HTML
                    description = ''
                    if desc is not None and desc.text:
                        description = re.sub(r'<[^>]+>', '', desc.text)[:150]
                    
                    topics.append({
                        "rank": idx,
                        "title": title.text.strip(),
                        "platform": "知乎日报",
                        "hot_value": 1000000 - idx * 50000,
                        "category": "社会",
                        "url": link.text if link is not None else '',
                        "description": description,
                        "timestamp": datetime.now().isoformat()
                    })
            
            print(f"✅ {len(topics)}条")
            return topics
            
        except Exception as e:
            print(f"❌ {e}")
            return []
    
    def fetch_solidot(self) -> List[Dict]:
        """
        Solidot RSS - 科技新闻
        https://www.solidot.org/index.rss
        """
        try:
            print("  📡 Solidot...", end=" ")
            response = self.session.get('https://www.solidot.org/index.rss', timeout=10)
            
            import xml.etree.ElementTree as ET
            root = ET.fromstring(response.content)
            
            topics = []
            items = root.findall('.//item')[:10]
            
            for idx, item in enumerate(items, 1):
                title = item.find('title')
                link = item.find('link')
                
                if title is not None and title.text:
                    topics.append({
                        "rank": idx,
                        "title": title.text.strip(),
                        "platform": "Solidot",
                        "hot_value": 900000 - idx * 40000,
                        "category": "科技",
                        "url": link.text if link is not None else '',
                        "description": "",
                        "timestamp": datetime.now().isoformat()
                    })
            
            print(f"✅ {len(topics)}条")
            return topics
            
        except Exception as e:
            print(f"❌ {e}")
            return []
    
    def fetch_ifanr(self) -> List[Dict]:
        """
        爱范儿 RSS
        """
        try:
            print("  📡 爱范儿...", end=" ")
            response = self.session.get('https://www.ifanr.com/feed', timeout=10)
            
            import xml.etree.ElementTree as ET
            root = ET.fromstring(response.content)
            
            topics = []
            items = root.findall('.//item')[:10]
            
            for idx, item in enumerate(items, 1):
                title = item.find('title')
                link = item.find('link')
                
                if title is not None and title.text:
                    topics.append({
                        "rank": idx,
                        "title": title.text.strip(),
                        "platform": "爱范儿",
                        "hot_value": 800000 - idx * 30000,
                        "category": "科技",
                        "url": link.text if link is not None else '',
                        "description": "",
                        "timestamp": datetime.now().isoformat()
                    })
            
            print(f"✅ {len(topics)}条")
            return topics
            
        except Exception as e:
            print(f"❌ {e}")
            return []
    
    def fetch_cnbeta(self) -> List[Dict]:
        """
        cnBeta RSS
        """
        try:
            print("  📡 cnBeta...", end=" ")
            response = self.session.get('https://www.cnbeta.com/backend.php', timeout=10)
            response.encoding = 'utf-8'
            
            import xml.etree.ElementTree as ET
            root = ET.fromstring(response.content)
            
            topics = []
            items = root.findall('.//item')[:10]
            
            for idx, item in enumerate(items, 1):
                title = item.find('title')
                link = item.find('link')
                
                if title is not None and title.text:
                    topics.append({
                        "rank": idx,
                        "title": title.text.strip(),
                        "platform": "cnBeta",
                        "hot_value": 700000 - idx * 25000,
                        "category": "科技",
                        "url": link.text if link is not None else '',
                        "description": "",
                        "timestamp": datetime.now().isoformat()
                    })
            
            print(f"✅ {len(topics)}条")
            return topics
            
        except Exception as e:
            print(f"❌ {e}")
            return []
    
    def fetch_all(self) -> List[Dict]:
        """获取所有RSS"""
        print("🚀 简化版RSS聚合器启动...\n")
        
        all_topics = []
        
        sources = [
            self.fetch_zhihu_daily,
            self.fetch_solidot,
            self.fetch_ifanr,
            self.fetch_cnbeta,
        ]
        
        for source in sources:
            topics = source()
            if topics:
                all_topics.extend(topics)
            time.sleep(random.uniform(1, 2))
        
        # 去重排序
        seen = set()
        unique = []
        for t in all_topics:
            key = t['title'][:20]
            if key not in seen:
                seen.add(key)
                unique.append(t)
        
        unique.sort(key=lambda x: x['hot_value'], reverse=True)
        
        for idx, t in enumerate(unique, 1):
            t['rank'] = idx
        
        return unique
    
    def save(self, topics: List[Dict]):
        """保存结果"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        json_file = f"simple_rss_{timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(topics, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 已保存: {json_file}")
        return json_file


def main():
    """主函数"""
    agg = SimpleRSSAggregator()
    topics = agg.fetch_all()
    
    print("\n" + "="*60)
    print(f"📊 总计: {len(topics)} 条热点")
    print("="*60)
    
    print("\n🔥 TOP 20:")
    print("-"*60)
    for t in topics[:20]:
        emoji = {'科技': '💻', '社会': '📰'}.get(t['category'], '📄')
        print(f"{t['rank']:2d}. {emoji} [{t['platform']}] {t['title'][:40]}...")
        print(f"    分类: {t['category']} | 热度: {t['hot_value']:,}")
    
    agg.save(topics)


if __name__ == "__main__":
    main()
