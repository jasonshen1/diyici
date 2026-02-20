#!/usr/bin/env python3
"""
热点猎手 - 完整运行脚本
一键执行：抓取 → 分析 → 生成 → 推送
"""

import json
import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path

# 添加scripts目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'scripts'))

from fetch_hot_topics import HotTopicScout
from analyze_trends import HotTopicAnalyst
from generate_angles import ContentWriter

class HotTopicHunter:
    """热点猎手主控器"""
    
    def __init__(self, output_dir: str = "./reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        self.scout = HotTopicScout()
        self.analyst = HotTopicAnalyst()
        self.writer = ContentWriter()
        
        self.report_data = {}
    
    def run(self) -> dict:
        """执行完整流程"""
        print("🚀 热点猎手启动...")
        print("=" * 60)
        
        # Step 1: 抓取热点
        print("\n📡 Step 1: 抓取热点...")
        topics = self.scout.run()
        self.report_data['topics'] = topics
        
        # Step 2: 分析热点
        print("\n📊 Step 2: 分析热点价值...")
        analyzed = self.analyst.analyze_all(topics)
        recommendations = self.analyst.get_top_recommendations(analyzed, 3)
        insights = self.analyst.generate_insights(analyzed, recommendations)
        
        self.report_data['analyzed'] = analyzed
        self.report_data['recommendations'] = recommendations
        self.report_data['insights'] = insights
        
        # Step 3: 生成内容方案
        print("\n✍️  Step 3: 生成内容方案...")
        content_reports = self.writer.generate_report(recommendations)
        self.report_data['content_reports'] = content_reports
        
        # Step 4: 保存报告
        print("\n💾 Step 4: 保存报告...")
        self._save_reports()
        
        # Step 5: 打印摘要
        print("\n📋 执行完成!")
        print("=" * 60)
        self._print_summary()
        
        return self.report_data
    
    def _save_reports(self):
        """保存所有报告文件"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        date_str = datetime.now().strftime('%Y%m%d')
        
        # 1. 原始数据
        raw_file = self.output_dir / f"raw_topics_{date_str}.json"
        with open(raw_file, 'w', encoding='utf-8') as f:
            json.dump(self.report_data['topics'], f, ensure_ascii=False, indent=2)
        print(f"  ✓ 原始数据: {raw_file}")
        
        # 2. 分析报告
        analysis_file = self.output_dir / f"analysis_{date_str}.json"
        with open(analysis_file, 'w', encoding='utf-8') as f:
            json.dump({
                'date': date_str,
                'total': len(self.report_data['analyzed']),
                'recommendations': self.report_data['recommendations'],
                'insights': self.report_data['insights']
            }, f, ensure_ascii=False, indent=2)
        print(f"  ✓ 分析报告: {analysis_file}")
        
        # 3. Markdown报告（飞书用）
        md_file = self.output_dir / f"daily_report_{date_str}.md"
        md_content = self.writer.format_markdown_report(self.report_data['content_reports'])
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(md_content)
        print(f"  ✓ Markdown报告: {md_file}")
        
        # 4. 更新最新报告链接
        latest_link = self.output_dir / "latest_report.md"
        if latest_link.exists():
            latest_link.unlink()
        latest_link.symlink_to(md_file.name)
        
        self.report_data['files'] = {
            'raw': str(raw_file),
            'analysis': str(analysis_file),
            'markdown': str(md_file)
        }
    
    def _print_summary(self):
        """打印执行摘要"""
        print(f"\n📈 数据摘要:")
        print(f"  抓取热点: {len(self.report_data['topics'])} 个")
        print(f"  推荐跟进: {len(self.report_data['recommendations'])} 个")
        
        print(f"\n💡 今日洞察:")
        for insight in self.report_data['insights']:
            print(f"  • {insight}")
        
        print(f"\n🔥 TOP 3 推荐:")
        for idx, topic in enumerate(self.report_data['recommendations'], 1):
            print(f"  {idx}. {topic['title']}")
            print(f"     分类: {topic['category']} | 评分: {topic['total_score']}/50")
        
        print(f"\n📁 报告文件:")
        for name, path in self.report_data['files'].items():
            print(f"  • {name}: {path}")
        
        print(f"\n✅ 全部完成! 报告已保存到: {self.output_dir}")
    
    def push_to_feishu(self, webhook_url: str = None):
        """推送到飞书（可选）"""
        # TODO: 实现飞书机器人推送
        pass
    
    def send_email(self, email: str = None):
        """发送邮件（可选）"""
        # TODO: 实现邮件发送
        pass


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='热点猎手 - 每日热点追踪')
    parser.add_argument('--output', '-o', default='./reports', help='输出目录')
    parser.add_argument('--push', action='store_true', help='推送到飞书')
    parser.add_argument('--email', help='发送邮件到指定地址')
    
    args = parser.parse_args()
    
    # 运行
    hunter = HotTopicHunter(output_dir=args.output)
    report = hunter.run()
    
    # 可选推送
    if args.push:
        hunter.push_to_feishu()
    
    if args.email:
        hunter.send_email(args.email)
    
    return report


if __name__ == "__main__":
    main()
