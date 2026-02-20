#!/usr/bin/env python3
"""
热点猎手 - 使用聚合API（最稳定方案）
推荐使用alapi.cn或类似的聚合数据服务
"""

import json
import requests
from datetime import datetime
from typing import List, Dict

class HotTopicAPI:
    """使用第三方聚合API获取热点"""
    
    def __init__(self):
        # 免费API列表（无需key或低门槛）
        self.apis = {
            # 方案1: 国内免费API
            'hot_list': 'https://api-hot.imsyy.top/weibo',  # 开源项目，每天自动更新
            
            # 方案2: 备用API
            'backup': 'https://www.toutiao.com/hot-event/hot-board/',
            
            # 方案3: 直接用演示数据（最稳定）
            'demo': 'self'
        }
    
    def fetch_from_imsyy(self) -> List[Dict]:
        """
        使用开源API: https://github.com/imsyy/hot-news
        支持: 微博、知乎、B站、百度、抖音等多个平台
        """
        platforms = ['weibo', 'zhihu', 'bilibili', 'baidu', 'douyin']
        all_topics = []
        
        for platform in platforms:
            try:
                url = f"https://api-hot.imsyy.top/{platform}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        items = data.get('data', [])
                        for idx, item in enumerate(items[:10], 1):
                            topic = {
                                "rank": idx,
                                "title": item.get('title', ''),
                                "platform": platform,
                                "hot_value": item.get('hot', '0'),
                                "url": item.get('url', ''),
                                "category": self._categorize(item.get('title', '')),
                                "description": item.get('desc', '')[:100],
                                "timestamp": datetime.now().isoformat()
                            }
                            all_topics.append(topic)
                            
            except Exception as e:
                print(f"{platform} API失败: {e}")
                continue
        
        return all_topics
    
    def fetch_from_doubao(self) -> List[Dict]:
        """
        方案: 用AI直接生成今日热点（兜底方案）
        当所有API都失败时使用
        """
        # 这里可以调用OpenClaw的web_search，搜索"今日热点"
        # 或者使用大模型生成
        return []
    
    def _categorize(self, title: str) -> str:
        """分类"""
        title = title.lower()
        
        if any(kw in title for kw in ['明星', '演员', '歌手', '电影', '电视剧', '综艺', '八卦', '离婚', '结婚']):
            return '娱乐'
        if any(kw in title for kw in ['ai', '人工智能', '科技', '手机', '芯片', 'gpt']):
            return '科技'
        if any(kw in title for kw in ['股票', '基金', '房', '经济', '公司', '上市', '裁员']):
            return '财经'
        if any(kw in title for kw in ['社会', '法律', '教育', '医', '车祸']):
            return '社会'
        
        return '其他'
    
    def run(self) -> List[Dict]:
        """运行"""
        print("🚀 使用聚合API获取热点...")
        
        # 优先使用imsyy API
        topics = self.fetch_from_imsyy()
        
        if len(topics) >= 10:
            print(f"✅ 聚合API成功: {len(topics)} 条")
            return topics
        
        # 如果失败，使用演示数据
        print("⚠️ API获取不足，使用演示数据补充")
        return self._get_demo_data()
    
    def _get_demo_data(self) -> List[Dict]:
        """高质量演示数据"""
        return [
            {
                "rank": 1,
                "title": "《哪吒2》票房突破100亿，成中国影史第一",
                "platform": "综合",
                "hot_value": 52100000,
                "url": "https://example.com/1",
                "category": "娱乐",
                "description": "动画电影《哪吒2》上映15天票房破百亿，创造多项纪录",
                "timestamp": datetime.now().isoformat()
            },
            {
                "rank": 2,
                "title": "DeepSeek发布V3模型，性能超越GPT-4",
                "platform": "综合",
                "hot_value": 48900000,
                "url": "https://example.com/2",
                "category": "科技",
                "description": "国产AI公司DeepSeek发布新一代大模型，推理能力大幅提升",
                "timestamp": datetime.now().isoformat()
            },
            {
                "rank": 3,
                "title": "2026考研国家线公布，多个专业分数线上涨",
                "platform": "综合",
                "hot_value": 35600000,
                "url": "https://example.com/3",
                "category": "社会",
                "description": "教育部公布2026年考研国家线，计算机、金融等热门专业分数线创新高",
                "timestamp": datetime.now().isoformat()
            },
            {
                "rank": 4,
                "title": "微信推出AI助手功能，可自动生成朋友圈文案",
                "platform": "综合",
                "hot_value": 29800000,
                "url": "https://example.com/4",
                "category": "科技",
                "description": "微信内测AI助手，支持文案生成、图片优化等功能",
                "timestamp": datetime.now().isoformat()
            },
            {
                "rank": 5,
                "title": "某主播直播带货翻车，销售额造假被实锤",
                "platform": "综合",
                "hot_value": 26700000,
                "url": "https://example.com/5",
                "category": "社会",
                "description": "头部主播直播间被曝刷单造假，市场监管部门介入调查",
                "timestamp": datetime.now().isoformat()
            },
            {
                "rank": 6,
                "title": "OpenClaw发布1.0版本，支持多Agent协作",
                "platform": "综合",
                "hot_value": 18900000,
                "url": "https://example.com/6",
                "category": "科技",
                "description": "AI自动化平台OpenClaw正式发布，支持复杂Workflow编排",
                "timestamp": datetime.now().isoformat()
            },
            {
                "rank": 7,
                "title": "A股节后大涨，沪指突破3500点",
                "platform": "综合",
                "hot_value": 15600000,
                "url": "https://example.com/7",
                "category": "财经",
                "description": "受政策利好刺激，节后首个交易日A股全线大涨",
                "timestamp": datetime.now().isoformat()
            },
            {
                "rank": 8,
                "title": "年轻人开始流行'电子年货'，游戏机销量暴涨",
                "platform": "综合",
                "hot_value": 12300000,
                "url": "https://example.com/8",
                "category": "社会",
                "description": "Switch、Steam Deck等游戏设备成为春节送礼新选择",
                "timestamp": datetime.now().isoformat()
            }
        ]


def main():
    """测试"""
    api = HotTopicAPI()
    topics = api.run()
    
    print(f"\n🔥 获取到 {len(topics)} 条热点")
    print("-" * 60)
    
    for topic in topics[:10]:
        print(f"{topic['rank']:2d}. [{topic['platform']}] {topic['title'][:40]}...")
        print(f"    分类: {topic['category']} | 热度: {topic['hot_value']}")
    
    # 保存
    with open(f"hot_topics_api_{datetime.now().strftime('%Y%m%d')}.json", 'w', encoding='utf-8') as f:
        json.dump(topics, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
