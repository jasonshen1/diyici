#!/usr/bin/env python3
"""
热点猎手 - 终极整合版
真实API抓取 + 手动配置补充
"""

import json
import yaml
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict

# 导入之前创建的抓取模块
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'scripts'))

try:
    from verified_sources import VerifiedDataSources
except ImportError:
    # 如果导入失败，直接在这里定义
    from scripts.verified_sources import VerifiedDataSources

class HotTopicHunterFinal:
    """终极版热点猎手"""
    
    def __init__(self):
        self.tech_source = VerifiedDataSources()
        self.config_path = Path(__file__).parent / 'config' / 'manual_hotspots.yaml'
    
    def load_manual_hotspots(self) -> List[Dict]:
        """加载手动配置的热点"""
        if not self.config_path.exists():
            print("⚠️ 未找到手动配置文件")
            return []
        
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)
            
            today = datetime.now().strftime('%Y-%m-%d')
            daily_spots = config.get('manual_hotspots', {}).get(today, [])
            
            # 添加时间戳和排名
            for idx, spot in enumerate(daily_spots, 1):
                spot['rank'] = idx
                spot['timestamp'] = datetime.now().isoformat()
                if 'hot_value' not in spot:
                    spot['hot_value'] = 1000000  # 默认值
            
            return daily_spots
            
        except Exception as e:
            print(f"读取配置失败: {e}")
            return []
    
    def run(self) -> List[Dict]:
        """运行完整采集"""
        print("🚀 热点猎手 - 终极整合版\n")
        print("=" * 60)
        
        all_topics = []
        
        # 1. 自动抓取技术热点
        print("\n📡 Step 1: 自动抓取技术热点...")
        tech_topics = self.tech_source.run(use_demo=False)
        print(f"   ✅ 技术热点: {len(tech_topics)}条")
        all_topics.extend(tech_topics)
        
        # 2. 加载手动补充热点
        print("\n📡 Step 2: 加载手动补充热点...")
        manual_topics = self.load_manual_hotspots()
        print(f"   ✅ 手动热点: {len(manual_topics)}条")
        if manual_topics:
            for t in manual_topics:
                print(f"      • {t['title'][:30]}...")
        all_topics.extend(manual_topics)
        
        # 3. 处理合并
        print("\n🔄 Step 3: 合并处理...")
        
        # 去重
        seen = set()
        unique = []
        for t in all_topics:
            key = t['title'][:15]
            if key not in seen:
                seen.add(key)
                unique.append(t)
        
        # 排序
        def get_hot(x):
            v = x.get('hot_value', 0)
            if isinstance(v, str):
                v = v.replace(',', '').replace('+', '')
                try:
                    v = int(v)
                except:
                    v = 0
            return int(v) if v else 0
        
        unique.sort(key=get_hot, reverse=True)
        
        # 重新编号
        for idx, t in enumerate(unique, 1):
            t['rank'] = idx
        
        # 统计
        print("\n" + "=" * 60)
        print(f"📊 总计: {len(unique)} 条热点")
        
        categories = {}
        for t in unique:
            cat = t.get('category', '其他')
            categories[cat] = categories.get(cat, 0) + 1
        
        print("📈 分类分布:")
        for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
            print(f"   • {cat}: {count}条")
        print("=" * 60)
        
        return unique[:30]  # 最多30条
    
    def save_report(self, topics: List[Dict]):
        """保存报告"""
        # 保存JSON
        json_file = f"final_topics_{datetime.now().strftime('%Y%m%d')}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(topics, f, ensure_ascii=False, indent=2)
        
        # 生成Markdown
        md_content = self._generate_markdown(topics)
        md_file = f"final_report_{datetime.now().strftime('%Y%m%d')}.md"
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(md_content)
        
        print(f"\n💾 报告已保存:")
        print(f"   • JSON: {json_file}")
        print(f"   • Markdown: {md_file}")
        
        return json_file, md_file
    
    def _generate_markdown(self, topics: List[Dict]) -> str:
        """生成Markdown报告"""
        md = f"""# 📊 {datetime.now().strftime('%Y年%m月%d日')} 热点追踪报告

> 生成时间：{datetime.now().strftime('%H:%M')}  
> 总计：{len(topics)} 条热点（自动抓取 + 手动补充）

---

"""
        
        # 按分类分组
        by_category = {}
        for t in topics:
            cat = t.get('category', '其他')
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(t)
        
        # 输出每个分类
        for cat, items in sorted(by_category.items(), key=lambda x: -len(x[1])):
            md += f"## 🏷️ {cat}类 ({len(items)}条)\n\n"
            
            for t in items[:10]:  # 每类最多10条
                md += f"**{t['rank']}. {t['title']}**\n"
                md += f"- 来源：{t['platform']} | 热度：{t['hot_value']:,}\n"
                if t.get('url') and t['url'] != '#':
                    md += f"- 链接：{t['url']}\n"
                md += "\n"
        
        md += """---

*报告由 热点猎手 Protocol 自动生成*
*技术热点：自动抓取 | 社会热点：手动补充*
"""
        
        return md


def main():
    """主函数"""
    hunter = HotTopicHunterFinal()
    topics = hunter.run()
    
    # 打印预览
    print("\n🔥 TOP 15 热点预览:")
    print("-" * 60)
    for t in topics[:15]:
        platform_emoji = {
            'GitHub': '💻',
            'HackerNews': '📰',
            'V2EX': '💬'
        }.get(t['platform'], '📱')
        
        print(f"{t['rank']:2d}. {platform_emoji} [{t['category']}] {t['title'][:40]}...")
        print(f"    {t['platform']} | 热度: {t['hot_value']:,}")
    
    # 保存
    hunter.save_report(topics)
    
    print("\n✅ 全部完成!")


if __name__ == "__main__":
    main()
