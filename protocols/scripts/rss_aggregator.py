#!/usr/bin/env python3
"""
热点猎手 - RSS聚合器
收集各大新闻网站RSS，获取综合热点
"""

import json
import time
import random
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Dict
import requests
from urllib.parse import urljoin

class RSSAggregator:
    """RSS聚合器 - 多源新闻采集"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # RSS源配置
        self.rss_sources = {
            # 科技类
            '36氪': {
                'url': 'https://rsshub.app/36kr/news/latest',
                'category': '科技',
                'weight': 1.2
            },
            '虎嗅': {
                'url': 'https://rsshub.app/huxiu/article',
                'category': '科技',
                'weight': 1.2
            },
            '少数派': {
                'url': 'https://rsshub.app/sspai/index',
                'category': '科技',
                'weight': 1.0
            },
            '爱范儿': {
                'url': 'https://rsshub.app/ifanr/app',
                'category': '科技',
                'weight': 1.0
            },
            
            # 财经类
            '财联社': {
                'url': 'https://rsshub.app/cls/depth',
                'category': '财经',
                'weight': 1.1
            },
            '雪球': {
                'url': 'https://rsshub.app/xueqiu/hots',
                'category': '财经',
                'weight': 1.0
            },
            
            # 综合新闻
            '澎湃新闻': {
                'url': 'https://rsshub.app/thepaper/featured',
                'category': '社会',
                'weight': 1.2
            },
            '界面新闻': {
                'url': 'https://rsshub.app/jiemian/list/71',
                'category': '社会',
                'weight': 1.0
            },
            
            # 国际
            'BBC中文': {
                'url': 'https://rsshub.app/bbc/chinese',
                'category': '国际',
                'weight': 1.0
            },
            
            # 娱乐/生活
            '豆瓣电影': {
                'url': 'https://rsshub.app/douban/movie/playing',
                'category': '娱乐',
                'weight': 0.9
            },
        }
    
    def fetch_rss(self, name: str, config: dict) -> List[Dict]:
        """
        抓取单个RSS源
        """
        try:
            print(f"  📡 {name}...", end=" ")
            
            response = self.session.get(config['url'], timeout=15)
            response.encoding = 'utf-8'
            
            # 使用更健壮的RSS解析
            content = response.text
            
            # 尝试解析
            try:
                root = ET.fromstring(response.content)
            except ET.ParseError:
                # 如果解析失败，尝试清理内容
                import re
                # 移除非法XML字符
                content = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f]', '', content)
                try:
                    root = ET.fromstring(content.encode('utf-8'))
                except:
                    print("❌ 解析失败")
                    return []
            
            topics = []
            
            # 尝试不同方式找item
            items = root.findall('.//item')
            if not items:
                # 尝试带命名空间的
                ns = {'rss': 'http://purl.org/rss/1.0/'}
                items = root.findall('.//rss:item', ns)
            
            for idx, item in enumerate(items[:10], 1):
                try:
                    title_elem = item.find('title')
                    title = title_elem.text.strip() if title_elem is not None and title_elem.text else ''
                    
                    if not title:
                        continue
                    
                    link_elem = item.find('link')
                    link = link_elem.text if link_elem is not None else ''
                    
                    desc_elem = item.find('description')
                    description = ''
                    if desc_elem is not None and desc_elem.text:
                        # 清理HTML标签
                        import re
                        description = re.sub(r'<[^>]+>', '', desc_elem.text)
                        description = description[:200]
                    
                    base_hot = 1000000 - (idx * 50000)
                    hot_value = int(base_hot * config['weight'])
                    
                    topics.append({
                        "rank": idx,
                        "title": title,
                        "platform": name,
                        "hot_value": hot_value,
                        "category": config['category'],
                        "url": link,
                        "description": description,
                        "timestamp": datetime.now().isoformat()
                    })
                    
                except Exception as e:
                    continue
            
            print(f"✅ {len(topics)}条")
            return topics
            
        except Exception as e:
            print(f"❌ {str(e)[:30]}")
            return []
    
    def fetch_all(self) -> List[Dict]:
        """抓取所有RSS源"""
        print("🚀 RSS聚合器启动...\n")
        
        all_topics = []
        
        for name, config in self.rss_sources.items():
            topics = self.fetch_rss(name, config)
            if topics:
                all_topics.extend(topics)
            time.sleep(random.uniform(1, 2))  # 礼貌延迟
        
        # 去重（基于标题前20字）
        seen = set()
        unique = []
        for t in all_topics:
            key = t['title'][:20]
            if key not in seen:
                seen.add(key)
                unique.append(t)
        
        # 按热度排序
        unique.sort(key=lambda x: x['hot_value'], reverse=True)
        
        # 重新编号
        for idx, t in enumerate(unique, 1):
            t['rank'] = idx
        
        return unique
    
    def save(self, topics: List[Dict]):
        """保存结果"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # JSON
        json_file = f"rss_topics_{timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(topics, f, ensure_ascii=False, indent=2)
        
        # Markdown报告
        md_file = f"rss_report_{timestamp}.md"
        md = self._generate_markdown(topics)
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(md)
        
        return json_file, md_file
    
    def _generate_markdown(self, topics: List[Dict]) -> str:
        """生成Markdown报告"""
        md = f"""# 📰 RSS聚合热点报告

> 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M')}  
> 数据来源：{len(self.rss_sources)} 个RSS源  
> 热点总数：{len(topics)} 条

---

"""
        
        # 按分类分组
        by_cat = {}
        for t in topics:
            cat = t['category']
            if cat not in by_cat:
                by_cat[cat] = []
            by_cat[cat].append(t)
        
        # 输出每个分类
        for cat, items in sorted(by_cat.items(), key=lambda x: -len(x[1])):
            md += f"## 🏷️ {cat} ({len(items)}条)\n\n"
            
            for t in items[:15]:  # 每类最多15条
                md += f"**{t['rank']}. {t['title']}**\n"
                md += f"- 来源：{t['platform']} | 热度：{t['hot_value']:,}\n"
                if t.get('description'):
                    md += f"- 简介：{t['description'][:100]}...\n"
                md += "\n"
        
        md += """---

*报告由 RSS聚合器自动生成*
"""
        return md


def main():
    """主函数"""
    import random
    
    aggregator = RSSAggregator()
    topics = aggregator.fetch_all()
    
    print("\n" + "="*60)
    print(f"📊 总计：{len(topics)} 条热点")
    print("="*60)
    
    # 分类统计
    cats = {}
    for t in topics:
        cat = t['category']
        cats[cat] = cats.get(cat, 0) + 1
    
    print("\n📈 分类分布：")
    for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  • {cat}: {count}条")
    
    print("\n🔥 TOP 20 热点：")
    print("-"*60)
    for t in topics[:20]:
        emoji = {'科技': '💻', '财经': '💰', '社会': '📰', 
                '国际': '🌍', '娱乐': '🎬'}.get(t['category'], '📄')
        print(f"{t['rank']:2d}. {emoji} [{t['category']}] {t['title'][:40]}...")
        print(f"    来源：{t['platform']} | 热度：{t['hot_value']:,}")
    
    # 保存
    json_file, md_file = aggregator.save(topics)
    print(f"\n💾 已保存：")
    print(f"  • {json_file}")
    print(f"  • {md_file}")


if __name__ == "__main__":
    main()
