#!/usr/bin/env python3
"""
热点猎手 - 热点分析脚本
评估热点价值，生成内容角度
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Tuple

class HotTopicAnalyst:
    """热点分析师 - 评估热点价值"""
    
    def __init__(self):
        self.category_weights = {
            '娱乐': {'spread': 9, 'controversy': 8, 'monetization': 7},
            '科技': {'spread': 7, 'controversy': 6, 'monetization': 8},
            '财经': {'spread': 6, 'controversy': 7, 'monetization': 9},
            '社会': {'spread': 8, 'controversy': 9, 'monetization': 5},
            '体育': {'spread': 7, 'controversy': 6, 'monetization': 6},
            '国际': {'spread': 6, 'controversy': 8, 'monetization': 4},
            '其他': {'spread': 5, 'controversy': 5, 'monetization': 5}
        }
    
    def calculate_timeliness(self, topic: Dict) -> int:
        """计算时效性分数"""
        # 根据hot_value估算时效
        hot_value = int(str(topic.get('hot_value', 0)).replace(',', ''))
        
        if hot_value > 10000000:  # 1000万+
            return 10  # 正在爆发
        elif hot_value > 5000000:  # 500万+
            return 8   # 热度很高
        elif hot_value > 1000000:  # 100万+
            return 6   # 正常热度
        else:
            return 4   # 相对冷门
    
    def calculate_difficulty(self, topic: Dict) -> int:
        """计算创作难度分数"""
        title = topic.get('title', '')
        description = topic.get('description', '')
        
        difficulty = 7  # 默认中等偏简单
        
        # 需要专业知识的主题更难
        hard_keywords = ['法律', '金融', '医学', '政策', '技术', '代码', '算法']
        if any(kw in title or kw in description for kw in hard_keywords):
            difficulty = 4
        
        # 情感/生活类更简单
        easy_keywords = ['明星', '娱乐', '情感', '生活', '搞笑', '美食']
        if any(kw in title or kw in description for kw in easy_keywords):
            difficulty = 9
        
        return difficulty
    
    def analyze_topic(self, topic: Dict) -> Dict:
        """分析单个热点"""
        category = topic.get('category', '其他')
        weights = self.category_weights.get(category, self.category_weights['其他'])
        
        # 计算各维度分数
        scores = {
            'spread': weights['spread'],
            'timeliness': self.calculate_timeliness(topic),
            'controversy': weights['controversy'],
            'difficulty': self.calculate_difficulty(topic),
            'monetization': weights['monetization']
        }
        
        total_score = sum(scores.values())
        
        # 判断窗口期
        timeliness = scores['timeliness']
        if timeliness >= 9:
            window = "6-12小时"
        elif timeliness >= 7:
            window = "12-24小时"
        elif timeliness >= 5:
            window = "24-48小时"
        else:
            window = "48小时以上"
        
        # 是否推荐
        recommended = total_score >= 35 and timeliness >= 6
        
        # 推荐理由
        reasons = []
        if scores['spread'] >= 8:
            reasons.append("传播度高")
        if scores['timeliness'] >= 8:
            reasons.append("时效性好")
        if scores['difficulty'] >= 8:
            reasons.append("容易写")
        if scores['controversy'] >= 8:
            reasons.append("有讨论空间")
        
        return {
            **topic,
            'scores': scores,
            'total_score': total_score,
            'window_period': window,
            'recommended': recommended,
            'reason': '+'.join(reasons) if reasons else '综合评分达标'
        }
    
    def analyze_all(self, topics: List[Dict]) -> List[Dict]:
        """分析所有热点"""
        analyzed = []
        for topic in topics:
            analyzed.append(self.analyze_topic(topic))
        
        # 按总分排序
        analyzed.sort(key=lambda x: x['total_score'], reverse=True)
        
        # 重新编号
        for idx, topic in enumerate(analyzed, 1):
            topic['analysis_rank'] = idx
        
        return analyzed
    
    def get_top_recommendations(self, analyzed: List[Dict], limit: int = 3) -> List[Dict]:
        """获取TOP推荐"""
        recommended = [t for t in analyzed if t['recommended']]
        
        # 确保多样性（不同领域）
        categories_seen = set()
        diverse_recommendations = []
        
        for topic in recommended:
            cat = topic.get('category', '其他')
            if cat not in categories_seen or len(diverse_recommendations) < limit:
                diverse_recommendations.append(topic)
                categories_seen.add(cat)
            
            if len(diverse_recommendations) >= limit:
                break
        
        return diverse_recommendations[:limit]
    
    def generate_insights(self, analyzed: List[Dict], recommendations: List[Dict]) -> List[str]:
        """生成洞察建议"""
        insights = []
        
        # 整体趋势
        categories = {}
        for topic in analyzed[:20]:
            cat = topic.get('category', '其他')
            categories[cat] = categories.get(cat, 0) + 1
        
        top_category = max(categories.items(), key=lambda x: x[1])
        insights.append(f"今日{top_category[0]}类热点占{top_category[1]*5}%，适合相关领域账号跟进")
        
        # 时效性提醒
        urgent = [t for t in recommendations if t['scores']['timeliness'] >= 9]
        if urgent:
            insights.append(f"有{len(urgent)}个热点处于爆发期，建议6小时内跟进")
        
        # 难度分布
        easy_count = sum(1 for t in recommendations if t['scores']['difficulty'] >= 8)
        if easy_count >= 2:
            insights.append("今日低门槛选题较多，适合新手")
        
        return insights
    
    def save_report(self, analyzed: List[Dict], recommendations: List[Dict], insights: List[str], filename: str = None):
        """保存分析报告"""
        if filename is None:
            filename = f"hot_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        report = {
            'analysis_date': datetime.now().isoformat(),
            'total_topics_analyzed': len(analyzed),
            'top_recommendations': recommendations,
            'insights': insights,
            'all_topics': analyzed[:20]  # 只保存TOP20
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f"💾 分析报告已保存: {filename}")
        return filename


def main():
    """主函数"""
    # 读取抓取的热点数据
    import glob
    
    # 找最新的热点文件
    files = glob.glob("hot_topics_*.json")
    if not files:
        print("❌ 未找到热点数据文件，请先运行 fetch_hot_topics.py")
        return
    
    latest_file = max(files, key=os.path.getctime)
    print(f"📂 读取数据: {latest_file}")
    
    with open(latest_file, 'r', encoding='utf-8') as f:
        topics = json.load(f)
    
    # 分析
    analyst = HotTopicAnalyst()
    analyzed = analyst.analyze_all(topics)
    recommendations = analyst.get_top_recommendations(analyzed, 3)
    insights = analyst.generate_insights(analyzed, recommendations)
    
    # 保存报告
    analyst.save_report(analyzed, recommendations, insights)
    
    # 打印结果
    print("\n📊 分析完成!")
    print("-" * 60)
    print(f"共分析 {len(analyzed)} 个热点")
    print(f"推荐跟进 {len(recommendations)} 个")
    print("\n💡 今日洞察:")
    for insight in insights:
        print(f"  • {insight}")
    
    print("\n🔥 TOP 3 推荐热点:")
    print("-" * 60)
    for idx, topic in enumerate(recommendations, 1):
        print(f"\n{idx}. {topic['title']}")
        print(f"   平台: {topic['platform']} | 分类: {topic['category']}")
        print(f"   总分: {topic['total_score']}/50 | 窗口期: {topic['window_period']}")
        print(f"   评分: 传播{topic['scores']['spread']} 时效{topic['scores']['timeliness']} "
              f"争议{topic['scores']['controversy']} 难度{topic['scores']['difficulty']} 变现{topic['scores']['monetization']}")
        print(f"   理由: {topic['reason']}")


if __name__ == "__main__":
    main()
