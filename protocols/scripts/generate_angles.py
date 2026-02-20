#!/usr/bin/env python3
"""
热点猎手 - 内容角度生成脚本
为热点生成3个不同角度的内容方案
"""

import json
import os
import re
from datetime import datetime
from typing import List, Dict

class ContentWriter:
    """内容创作师 - 生成内容角度"""
    
    def __init__(self):
        self.angle_templates = {
            '情绪共鸣': {
                'type': '情绪共鸣',
                'suitable_for': ['小红书', '抖音'],
                'style': '亲切、真实、有网感',
                'title_patterns': [
                    "看到{topic}，我突然不焦虑了",
                    "{topic}这件事，说中了多少人的心声",
                    "关于{topic}，我想说说心里话",
                    "{topic}让我明白了这个道理",
                    "如果你也在意{topic}，请进"
                ]
            },
            '实用干货': {
                'type': '实用干货',
                'suitable_for': ['公众号', '小红书'],
                'style': '专业、清晰、可操作',
                'title_patterns': [
                    "关于{topic}，你必须知道的3件事",
                    "从{topic}看XX的底层逻辑",
                    "{topic}避坑指南，建议收藏",
                    "深度解析：{topic}背后的真相",
                    "看完{topic}，我整理了一份攻略"
                ]
            },
            '反常识观点': {
                'type': '反常识观点',
                'suitable_for': ['公众号', '知乎'],
                'style': '犀利、有洞察、引发思考',
                'title_patterns': [
                    "别急着站队，{topic}没那么简单",
                    "关于{topic}，所有人都想错了",
                    "{topic}：一个被误解的信号",
                    "换个角度看{topic}，你会发现...",
                    "敢不敢承认，{topic}其实..."
                ]
            }
        }
    
    def generate_emotion_angle(self, topic: Dict) -> Dict:
        """生成情绪共鸣角度"""
        title = topic['title']
        category = topic.get('category', '其他')
        
        # 根据分类调整角度
        if category == '娱乐':
            hook = f"看到{title[:15]}的消息，我突然想起自己这些年的经历..."
            outline = [
                "回忆自己的相似经历",
                "对比明星和素人的不同处境",
                "感悟：普通人也能拥有的幸福",
                "给读者的暖心建议"
            ]
            key_points = ["明星也是普通人", "幸福没有标准答案", "每个人都有自己的节奏"]
            cta = "你对此有什么看法？评论区聊聊~"
            
        elif category == '社会':
            hook = f"{title[:15]}这件事，让我想了很多..."
            outline = [
                "事件本身的描述",
                "普通人的代入感",
                "社会现象的反思",
                "我们能做什么"
            ]
            key_points = ["普通人的无力感", "但也充满希望", "每个人都很重要"]
            cta = "如果你也有同感，点个赞让我知道"
            
        else:
            hook = f"最近{title[:15]}很火，说说我的真实感受..."
            outline = [
                "现象描述",
                "个人经历的共鸣点",
                "情绪宣泄/温暖分享",
                "给读者的启发"
            ]
            key_points = ["这就是生活", "我们都不孤单", "一起加油"]
            cta = "有共鸣的朋友评论区见"
        
        return {
            'angle_id': 'A',
            'type': '情绪共鸣',
            'title': self._generate_title('情绪共鸣', title),
            'hook': hook,
            'outline': outline,
            'key_points': key_points,
            'call_to_action': cta,
            'suitable_for': '小红书/抖音',
            'difficulty': '简单',
            'estimated_time': '1小时'
        }
    
    def generate_utility_angle(self, topic: Dict) -> Dict:
        """生成实用干货角度"""
        title = topic['title']
        category = topic.get('category', '其他')
        
        if category == '科技':
            hook = f"{title[:15]}引发了很多讨论，今天从技术角度拆解一下..."
            outline = [
                "背景知识科普（小白友好）",
                "事件的核心要点",
                "对普通人的影响",
                "应对建议/行动指南"
            ]
            key_points = ["技术原理图解", "利弊分析", "未来趋势预测"]
            cta = "觉得有用就收藏，慢慢看"
            
        elif category == '财经':
            hook = f"从{title[:15]}看经济趋势，这3点很关键..."
            outline = [
                "事件背景简述",
                "背后的经济逻辑",
                "对普通人的影响",
                "理财/消费建议"
            ]
            key_points = ["数据分析", "避坑指南", "机会提示"]
            cta = "关注我看更多财经分析"
            
        else:
            hook = f"深度解析{title[:15]}，帮你理清思路..."
            outline = [
                "事件脉络梳理",
                "关键信息提取",
                "方法论总结",
                "实操建议"
            ]
            key_points = ["逻辑框架", "核心结论", "行动清单"]
            cta = "转发给需要的朋友"
        
        return {
            'angle_id': 'B',
            'type': '实用干货',
            'title': self._generate_title('实用干货', title),
            'hook': hook,
            'outline': outline,
            'key_points': key_points,
            'call_to_action': cta,
            'suitable_for': '公众号/小红书',
            'difficulty': '中等',
            'estimated_time': '2-3小时'
        }
    
    def generate_opinion_angle(self, topic: Dict) -> Dict:
        """生成反常识观点角度"""
        title = topic['title']
        category = topic.get('category', '其他')
        
        if category == '娱乐':
            hook = f"关于{title[:15]}，大家可能都想错了..."
            outline = [
                "主流观点是什么",
                "这个观点的问题",
                "被忽视的真相",
                "更深层的思考"
            ]
            key_points = ["明星也是打工人", "炒作背后的逻辑", "观众的消费心理"]
            cta = "不同意的欢迎理性讨论"
            
        elif category == '社会':
            hook = f"{title[:15]}刷屏了，但我想泼点冷水..."
            outline = [
                "事件的表象",
                "媒体的叙事陷阱",
                "被忽略的另一面",
                "冷静思考的价值"
            ]
            key_points = ["信息茧房", "情绪绑架", "独立思考"]
            cta = "觉得有启发就点个赞"
            
        else:
            hook = f"换个角度看{title[:15]}，你会发现不一样的真相..."
            outline = [
                "常规解读的问题",
                "新的视角引入",
                "论证和案例",
                "结论和启发"
            ]
            key_points = ["打破思维定势", "多角度看问题", "认知升级"]
            cta = "关注我看更多不一样的观点"
        
        return {
            'angle_id': 'C',
            'type': '反常识观点',
            'title': self._generate_title('反常识观点', title),
            'hook': hook,
            'outline': outline,
            'key_points': key_points,
            'call_to_action': cta,
            'suitable_for': '公众号/知乎',
            'difficulty': '较高',
            'estimated_time': '3-4小时'
        }
    
    def _generate_title(self, angle_type: str, topic_title: str) -> str:
        """生成标题"""
        templates = self.angle_templates[angle_type]['title_patterns']
        import random
        template = random.choice(templates)
        
        # 截取合适长度的主题词
        keyword = topic_title[:12] if len(topic_title) > 12 else topic_title
        
        title = template.format(topic=keyword)
        
        # 添加emoji
        emojis = {
            '情绪共鸣': ['💭', '😢', '❤️', '✨'],
            '实用干货': ['📚', '💡', '📊', '🎯'],
            '反常识观点': ['🤔', '👀', '💭', '⚡']
        }
        emoji = random.choice(emojis.get(angle_type, ['✨']))
        
        return f"{emoji} {title}"
    
    def generate_all_angles(self, topic: Dict) -> Dict:
        """为一个热点生成所有角度"""
        return {
            'hotspot_title': topic['title'],
            'platform': topic['platform'],
            'category': topic.get('category', '其他'),
            'window_period': topic.get('window_period', '24小时'),
            'total_score': topic.get('total_score', 0),
            'angles': [
                self.generate_emotion_angle(topic),
                self.generate_utility_angle(topic),
                self.generate_opinion_angle(topic)
            ]
        }
    
    def generate_report(self, recommendations: List[Dict]) -> List[Dict]:
        """为所有推荐热点生成内容方案"""
        reports = []
        for topic in recommendations:
            report = self.generate_all_angles(topic)
            reports.append(report)
        return reports
    
    def format_markdown_report(self, reports: List[Dict]) -> str:
        """格式化为Markdown报告"""
        date_str = datetime.now().strftime('%Y年%m月%d日')
        
        md = f"""# 📊 {date_str} 热点追踪报告

> 生成时间：{datetime.now().strftime('%H:%M')}  
> 今日精选 {len(reports)} 个热点，每个提供 3 个内容角度

---

"""
        
        for idx, report in enumerate(reports, 1):
            md += f"""## 🔥 热点 {idx}: {report['hotspot_title']}

**基本信息**
- 来源平台：{report['platform']}
- 内容分类：{report['category']}
- 窗口期：{report['window_period']}
- 推荐指数：{'⭐' * (report['total_score'] // 10)}

"""
            
            for angle in report['angles']:
                md += f"""### 角度 {angle['angle_id']}: {angle['type']}

**标题**：{angle['title']}

**开头钩子**：
> {angle['hook']}

**内容大纲**：
"""
                for i, point in enumerate(angle['outline'], 1):
                    md += f"{i}. {point}\n"
                
                md += f"""
**金句建议**：
"""
                for point in angle['key_points']:
                    md += f"- {point}\n"
                
                md += f"""
**结尾引导**：{angle['call_to_action']}

**适配平台**：{angle['suitable_for']}  
**创作难度**：{angle['difficulty']}  
**预估耗时**：{angle['estimated_time']}

---

"""
        
        md += """## 💡 使用建议

1. **角度A（情绪共鸣）**：适合快速出稿，易获得互动
2. **角度B（实用干货）**：适合长期价值，收藏率高
3. **角度C（反常识观点）**：适合建立专业形象，但风险较高

**时效性提醒**：热点窗口期有限，建议6-24小时内发布

---

*报告由 热点猎手 Protocol 自动生成*
"""
        
        return md
    
    def save_report(self, reports: List[Dict], filename: str = None):
        """保存报告"""
        if filename is None:
            filename = f"content_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        
        md_content = self.format_markdown_report(reports)
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(md_content)
        
        print(f"📝 内容报告已保存: {filename}")
        return filename


def main():
    """主函数"""
    import glob
    
    # 找最新的分析报告
    files = glob.glob("hot_analysis_*.json")
    if not files:
        print("❌ 未找到分析报告，请先运行 analyze_trends.py")
        return
    
    latest_file = max(files, key=os.path.getctime)
    print(f"📂 读取分析数据: {latest_file}")
    
    with open(latest_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    recommendations = data.get('top_recommendations', [])
    
    if not recommendations:
        print("❌ 没有找到推荐热点")
        return
    
    # 生成内容方案
    writer = ContentWriter()
    reports = writer.generate_report(recommendations)
    
    # 保存报告
    filename = writer.save_report(reports)
    
    # 打印预览
    print("\n📝 内容方案生成完成!")
    print("-" * 60)
    
    for idx, report in enumerate(reports, 1):
        print(f"\n热点 {idx}: {report['hotspot_title']}")
        print(f"  3个角度已生成:")
        for angle in report['angles']:
            print(f"    • [{angle['angle_id']}] {angle['type']}: {angle['title'][:30]}...")
    
    print(f"\n✅ 完整报告已保存，可直接复制到飞书文档")


if __name__ == "__main__":
    main()
