#!/usr/bin/env python3
"""
热点猎手 - 飞书推送脚本
"""

import json
import sys
import glob
import requests
from datetime import datetime
from pathlib import Path

# 配置：填入你的飞书Webhook
FEISHU_WEBHOOK = "https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_WEBHOOK_HERE"

def find_latest_report() -> str:
    """查找最新的报告文件"""
    report_dir = Path(__file__).parent.parent / "reports"
    json_files = sorted(report_dir.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True)
    
    if not json_files:
        print("❌ 未找到报告文件")
        return None
    
    return str(json_files[0])

def build_message(topics: list) -> dict:
    """构建飞书卡片消息"""
    
    date_str = datetime.now().strftime("%m月%d日")
    
    # 取TOP 5热点
    top5 = topics[:5]
    
    # 构建内容
    content_lines = []
    for i, t in enumerate(top5, 1):
        emoji = {"科技": "💻", "娱乐": "🎬", "社会": "📰", "财经": "💰"}.get(t.get("category"), "📌")
        title = t["title"][:25] + "..." if len(t["title"]) > 25 else t["title"]
        content_lines.append(f"{i}. {emoji} {title}")
    
    content_text = "\n".join(content_lines)
    
    # 构建卡片消息
    message = {
        "msg_type": "interactive",
        "card": {
            "config": {"wide_screen_mode": True},
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": f"📊 {date_str} 热点追踪报告"
                },
                "template": "blue"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": f"**今日精选 {len(topics)} 条热点：**\n\n{content_text}"
                    }
                },
                {"tag": "hr"},
                {
                    "tag": "action",
                    "actions": [
                        {
                            "tag": "button",
                            "text": {"tag": "plain_text", "content": "📋 查看完整报告"},
                            "type": "primary",
                            "url": "https://www.example.com/full-report"
                        }
                    ]
                }
            ]
        }
    }
    
    return message

def push_to_feishu(report_file: str = None):
    """推送到飞书"""
    
    # 如果没指定文件，自动找最新的
    if not report_file:
        report_file = find_latest_report()
        if not report_file:
            return False
    
    print(f"📂 读取报告: {report_file}")
    
    # 读取报告
    try:
        with open(report_file, 'r', encoding='utf-8') as f:
            topics = json.load(f)
    except Exception as e:
        print(f"❌ 读取失败: {e}")
        return False
    
    print(f"📊 共 {len(topics)} 条热点")
    
    # 构建消息
    message = build_message(topics)
    
    # 发送
    print("📡 推送到飞书...")
    try:
        response = requests.post(
            FEISHU_WEBHOOK,
            headers={"Content-Type": "application/json"},
            json=message,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("code") == 0:
                print("✅ 推送成功!")
                return True
            else:
                print(f"❌ 飞书返回错误: {result}")
                return False
        else:
            print(f"❌ HTTP错误: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return False

if __name__ == "__main__":
    # 用法: python push_feishu.py [report_file]
    report_file = sys.argv[1] if len(sys.argv) > 1 else None
    
    # 检查配置
    if "YOUR_WEBHOOK_HERE" in FEISHU_WEBHOOK:
        print("⚠️  请先配置 FEISHU_WEBHOOK 变量!")
        print("   编辑 scripts/push_feishu.py，填入你的Webhook地址")
        sys.exit(1)
    
    success = push_to_feishu(report_file)
    sys.exit(0 if success else 1)
