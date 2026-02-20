#!/usr/bin/env python3
"""快速测试四脑 Discord 集成"""
import os
import json
import requests

# 加载环境变量
WEBHOOKS = {
    "PM": os.getenv("WEBHOOK_PM"),
    "DEV": os.getenv("WEBHOOK_DEV"), 
    "TESTER": os.getenv("WEBHOOK_TESTER"),
    "MEMO": os.getenv("WEBHOOK_MEMO")
}

OPENCLAW_URL = os.getenv("OPENCLAW_URL", "http://localhost:18789")
OPENCLAW_TOKEN = os.getenv("OPENCLAW_TOKEN")
MODEL = os.getenv("QUAD_MODEL", "kimi-coding/k2p5")

def call_llm(system_prompt, user_message):
    """调用 OpenClaw API"""
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.7,
        "max_tokens": 1500
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENCLAW_TOKEN}"
    }
    
    try:
        resp = requests.post(
            f"{OPENCLAW_URL}/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=60
        )
        if resp.status_code == 200:
            return resp.json()["choices"][0]["message"]["content"]
        return f"Error: {resp.status_code}"
    except Exception as e:
        return f"Error: {e}"

def send_to_discord(role, content):
    """发送到 Discord"""
    url = WEBHOOKS.get(role)
    if not url:
        print(f"⚠️ No webhook for {role}")
        return False
    
    # 截断长消息
    if len(content) > 1900:
        content = content[:1900] + "\n... (truncated)"
    
    role_names = {
        "PM": "📝 PM·产品经理",
        "DEV": "💻 DEV·工程师",
        "TESTER": "🧪 TESTER·测试员",
        "MEMO": "📋 MEMO·记录员"
    }
    
    data = {
        "content": content,
        "username": role_names.get(role, role)
    }
    
    try:
        resp = requests.post(url, json=data, timeout=10)
        return resp.status_code in [200, 204]
    except Exception as e:
        print(f"⚠️ Discord error: {e}")
        return False

def main():
    task = "写一个 Python 函数，计算斐波那契数列第 n 项"
    
    print("🚀 启动四脑协作...")
    print(f"任务: {task}")
    print()
    
    # PM 阶段
    print("📝 PM 分析需求...")
    pm_prompt = """你是产品经理。分析需求并输出 PRD。
需求: 写一个 Python 函数，计算斐波那契数列第 n 项
输出格式:
1. 功能描述
2. 输入输出定义
3. 边界条件"""
    
    pm_output = call_llm(pm_prompt, task)
    send_to_discord("PM", f"**[需求分析]**\n{pm_output}")
    print("✅ PM 完成")
    
    # DEV 阶段
    print("💻 DEV 编写代码...")
    dev_prompt = """你是工程师。根据需求编写 Python 代码。
要求: 完整可运行，包含异常处理"""
    
    dev_input = f"需求: {task}\n\n产品经理规格:\n{pm_output[:500]}"
    dev_output = call_llm(dev_prompt, dev_input)
    send_to_discord("DEV", f"**[代码实现]**\n```python\n{dev_output[:1500]}\n```")
    print("✅ DEV 完成")
    
    # TESTER 阶段
    print("🧪 TESTER 测试代码...")
    tester_prompt = """你是测试工程师。为代码编写测试用例。
输出: 测试场景和预期结果"""
    
    tester_input = f"代码:\n{dev_output[:800]}"
    tester_output = call_llm(tester_prompt, tester_input)
    send_to_discord("TESTER", f"**[测试用例]**\n{tester_output}")
    print("✅ TESTER 完成")
    
    # MEMO 阶段
    print("📋 MEMO 生成日报...")
    memo_prompt = """你是记录员。总结项目进展。
输出: 项目摘要、关键成果、下一步建议"""
    
    memo_input = f"PM:\n{pm_output[:300]}...\n\nDEV:\n{dev_output[:300]}...\n\nTESTER:\n{tester_output[:300]}..."
    memo_output = call_llm(memo_prompt, memo_input)
    send_to_discord("MEMO", f"**[项目日报]**\n{memo_output}")
    print("✅ MEMO 完成")
    
    print()
    print("🎉 四脑协作完成！")
    print("查看 Discord 频道查看完整输出")

if __name__ == "__main__":
    main()
