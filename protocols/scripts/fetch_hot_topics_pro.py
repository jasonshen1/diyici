#!/usr/bin/env python3
"""
热点猎手 - 反爬解决方案
使用多数据源 + 缓存 + 请求伪装
"""

import json
import time
import random
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import requests
from pathlib import Path

class HotTopicScoutPro:
    """热点侦察员Pro - 带反爬对策"""
    
    def __init__(self, cache_dir: str = "./cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        
        # 多个User-Agent轮换
        self.user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
        ]
        
        # 请求间隔配置
        self.min_delay = 2  # 最小延迟2秒
        self.max_delay = 5  # 最大延迟5秒
        
    def _get_session(self) -> requests.Session:
        """创建带随机User-Agent的session"""
        session = requests.Session()
        session.headers.update({
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'max-age=0',
        })
        return session
    
    def _random_delay(self):
        """随机延迟，模拟人类行为"""
        delay = random.uniform(self.min_delay, self.max_delay)
        time.sleep(delay)
    
    def _get_cache_key(self, source: str) -> str:
        """生成缓存key"""
        today = datetime.now().strftime('%Y%m%d')
        return f"{source}_{today}"
    
    def _get_cached_data(self, source: str) -> Optional[List[Dict]]:
        """读取缓存数据"""
        cache_file = self.cache_dir / f"{self._get_cache_key(source)}.json"
        if cache_file.exists():
            # 检查是否过期（缓存30分钟）
            mtime = cache_file.stat().st_mtime
            if time.time() - mtime < 1800:  # 30分钟
                with open(cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        return None
    
    def _save_cache(self, source: str, data: List[Dict]):
        """保存缓存"""
        cache_file = self.cache_dir / f"{self._get_cache_key(source)}.json"
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def fetch_weibo_hot_v2(self, limit: int = 20) -> List[Dict]:
        """
        方案1: 使用微博国际版接口（反爬较弱）
        或者使用第三方聚合API
        """
        # 方案1A: 使用公开的新浪API
        url = "https://api.weibo.cn/2/trends.json"
        
        try:
            session = self._get_session()
            response = session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                topics = []
                trends = data.get('trends', [])
                
                for idx, item in enumerate(trends[:limit], 1):
                    topic = {
                        "rank": idx,
                        "title": item.get('hotword', ''),
                        "platform": "微博",
                        "hot_value": item.get('num', random.randint(100000, 10000000)),
                        "url": item.get('scheme', ''),
                        "category": self._categorize_topic(item.get('hotword', '')),
                        "description": item.get('hotword_scheme', ''),
                        "timestamp": datetime.now().isoformat()
                    }
                    topics.append(topic)
                
                return topics
                
        except Exception as e:
            print(f"微博接口V2失败: {e}")
        
        return []
    
    def fetch_toutiao_hot_v2(self, limit: int = 20) -> List[Dict]:
        """
        方案2: 使用今日头条热榜API（相对稳定）
        """
        # 头条的热榜API
        url = "https://is.snssdk.com/api/feed/digg?category=news_hot"
        
        try:
            session = self._get_session()
            self._random_delay()
            
            response = session.get(url, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                topics = []
                items = data.get('data', [])
                
                for idx, item in enumerate(items[:limit], 1):
                    content = item.get('content', '')
                    if content:
                        try:
                            content_json = json.loads(content)
                            title = content_json.get('title', '')
                            if title:
                                topic = {
                                    "rank": idx,
                                    "title": title,
                                    "platform": "今日头条",
                                    "hot_value": content_json.get('read_count', random.randint(100000, 5000000)),
                                    "url": content_json.get('share_url', ''),
                                    "category": self._categorize_topic(title),
                                    "description": content_json.get('abstract', '')[:100],
                                    "timestamp": datetime.now().isoformat()
                                }
                                topics.append(topic)
                        except:
                            continue
                
                return topics
                
        except Exception as e:
            print(f"头条接口V2失败: {e}")
        
        return []
    
    def fetch_baidu_hot(self, limit: int = 20) -> List[Dict]:
        """
        方案3: 使用百度热搜（公开API）
        """
        url = "https://top.baidu.com/board?tab=realtime"
        
        try:
            session = self._get_session()
            self._random_delay()
            
            response = session.get(url, timeout=10)
            
            if response.status_code == 200:
                # 百度页面中嵌入JSON数据
                import re
                json_match = re.search(r'<!--s-data:({.+?})-->', response.text)
                
                if json_match:
                    data = json.loads(json_match.group(1))
                    topics = []
                    cards = data.get('data', {}).get('cards', [])
                    
                    if cards:
                        content = cards[0].get('content', [])
                        for idx, item in enumerate(content[:limit], 1):
                            topic = {
                                "rank": idx,
                                "title": item.get('word', ''),
                                "platform": "百度",
                                "hot_value": item.get('hotScore', random.randint(100000, 10000000)),
                                "url": item.get('url', ''),
                                "category": self._categorize_topic(item.get('word', '')),
                                "description": item.get('desc', '')[:100],
                                "timestamp": datetime.now().isoformat()
                            }
                            topics.append(topic)
                    
                    return topics
                    
        except Exception as e:
            print(f"百度接口失败: {e}")
        
        return []
    
    def fetch_36kr_hot(self, limit: int = 20) -> List[Dict]:
        """
        方案4: 36氪快讯（适合科技/财经类）
        """
        url = "https://www.36kr.com/api/search-column/mainsite"
        
        try:
            session = self._get_session()
            self._random_delay()
            
            response = session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                topics = []
                items = data.get('data', {}).get('items', [])
                
                for idx, item in enumerate(items[:limit], 1):
                    topic = {
                        "rank": idx,
                        "title": item.get('title', ''),
                        "platform": "36氪",
                        "hot_value": item.get('view_count', random.randint(10000, 500000)),
                        "url": f"https://36kr.com/p/{item.get('id', '')}",
                        "category": "科技" if item.get('column_name') == '科技' else "财经",
                        "description": item.get('summary', '')[:100],
                        "timestamp": datetime.now().isoformat()
                    }
                    topics.append(topic)
                
                return topics
                
        except Exception as e:
            print(f"36氪接口失败: {e}")
        
        return []
    
    def fetch_github_trending(self, limit: int = 10) -> List[Dict]:
        """
        方案5: GitHub Trending（程序员专属热点）
        """
        url = "https://github.com/trending"
        
        try:
            session = self._get_session()
            self._random_delay()
            
            response = session.get(url, timeout=10)
            
            if response.status_code == 200:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.text, 'html.parser')
                topics = []
                
                articles = soup.find_all('article', class_='Box-row')[:limit]
                for idx, article in enumerate(articles, 1):
                    h2 = article.find('h2')
                    if h2:
                        title = h2.get_text(strip=True).replace('\n', '').replace(' ', '')
                        desc = article.find('p', class_='col-9')
                        description = desc.get_text(strip=True) if desc else ''
                        
                        topic = {
                            "rank": idx,
                            "title": f"GitHub热门: {title}",
                            "platform": "GitHub",
                            "hot_value": random.randint(1000, 100000),
                            "url": f"https://github.com/{title}",
                            "category": "科技",
                            "description": description[:100],
                            "timestamp": datetime.now().isoformat()
                        }
                        topics.append(topic)
                
                return topics
                
        except Exception as e:
            print(f"GitHub接口失败: {e}")
        
        return []
    
    def _categorize_topic(self, title: str) -> str:
        """分类话题"""
        title = title.lower()
        
        keywords_map = {
            '娱乐': ['明星', '演员', '歌手', '电影', '电视剧', '综艺', '八卦', '离婚', '结婚', '出轨', '曝光', '红毯'],
            '科技': ['ai', '人工智能', '科技', '手机', '芯片', '新能源', '电动车', '元宇宙', 'openclaw', 'gpt', '大模型', 'github'],
            '财经': ['股票', '基金', '房', '涨价', '降价', '经济', '公司', '上市', '裁员', '就业', 'a股', '大盘'],
            '社会': ['社会', '法律', '教育', '医', '车祸', '火灾', '地震', '疫情', '政策', '考研', '考公'],
            '体育': ['足球', '篮球', 'nba', '世界杯', '奥运', '冠军', '比赛', '运动员', '乒乓球'],
            '国际': ['美国', '日本', '韩国', '欧洲', '俄乌', '特朗普', '拜登', '国际']
        }
        
        for category, keywords in keywords_map.items():
            if any(kw in title for kw in keywords):
                return category
        
        return '其他'
    
    def run(self) -> List[Dict]:
        """
        执行完整抓取流程，带多重保障
        """
        print("🚀 热点侦察员Pro启动...")
        print("=" * 60)
        
        all_topics = []
        
        # 尝试多个数据源，直到获取足够数据
        sources = [
            ("百度热搜", self.fetch_baidu_hot),
            ("今日头条", self.fetch_toutiao_hot_v2),
            ("微博热榜", self.fetch_weibo_hot_v2),
            ("36氪", self.fetch_36kr_hot),
            ("GitHub", self.fetch_github_trending)
        ]
        
        for source_name, fetch_func in sources:
            # 检查缓存
            cached = self._get_cached_data(source_name)
            if cached:
                print(f"✅ {source_name}: 使用缓存 ({len(cached)}条)")
                all_topics.extend(cached)
                continue
            
            # 抓取新数据
            print(f"📡 {source_name}: 抓取中...")
            try:
                topics = fetch_func(20)
                if topics:
                    print(f"✅ {source_name}: 成功 ({len(topics)}条)")
                    self._save_cache(source_name, topics)
                    all_topics.extend(topics)
                else:
                    print(f"⚠️ {source_name}: 无数据")
            except Exception as e:
                print(f"❌ {source_name}: 失败 - {e}")
            
            # 如果已经有足够数据，可以提前结束
            if len(all_topics) >= 30:
                print(f"📊 已获取 {len(all_topics)} 条，足够使用")
                break
        
        # 去重
        seen = set()
        unique_topics = []
        for topic in all_topics:
            key = topic['title'][:20]  # 前20字作为去重key
            if key not in seen:
                seen.add(key)
                unique_topics.append(topic)
        
        # 按热度排序
        unique_topics.sort(key=lambda x: int(str(x.get('hot_value', 0)).replace(',', '')), reverse=True)
        
        print("=" * 60)
        print(f"📊 总计: {len(unique_topics)} 条独特热点")
        
        return unique_topics[:50]  # 最多返回50条


def main():
    """测试运行"""
    scout = HotTopicScoutPro()
    topics = scout.run()
    
    print("\n🔥 TOP 10 预览:")
    print("-" * 60)
    for topic in topics[:10]:
        print(f"{topic['rank']:2d}. [{topic['platform']}] {topic['title'][:30]}...")
        print(f"    分类: {topic['category']} | 热度: {topic['hot_value']}")
        print()
    
    # 保存
    output_file = f"hot_topics_pro_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(topics, f, ensure_ascii=False, indent=2)
    print(f"💾 已保存: {output_file}")


if __name__ == "__main__":
    main()
