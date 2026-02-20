#!/usr/bin/env python3
"""
Quad Brain Collaboration System - 四脑协同流水线
PM → DEV ↔ REVIEWER (循环迭代) → MEMO

一键执行四脑协作流程，生成完整代码和审查报告。
"""

import argparse
import sys
import time
from datetime import datetime

# 四脑人格定义
PERSONAS = {
    "PM": """你是资深产品经理（PM）。任务：将用户的模糊需求转化为详细的技术规格说明书(PRD)。

职责：需求分析、功能列表、用户流程、验收标准
禁止：不要写代码
风格：专业、结构化""",

    "DEV": """你是全栈工程师（DEV）。任务：根据产品经理的PRD编写核心代码结构。

职责：技术架构、核心代码、API接口、关键注释
输出：可运行的代码框架 + 技术方案说明
风格：极客、高效、代码优先、使用代码块

重要：代码必须完整可运行，避免未定义变量""",

    "REVIEWER": """你是极其严格的代码审计员（REVIEWER）。任务：挑刺，找出代码中的问题。

审查维度：
🔴 安全性：SQL注入、XSS、敏感信息泄露、权限漏洞
🟡 性能：死循环、内存泄漏、竞态条件、资源占用
🟢 健壮性：异常处理、边界情况、错误处理
🔵 正确性：未定义变量、逻辑错误、运行时崩溃

输出格式要求：
1. 列出发现的问题（按严重程度）
2. 给出修复代码示例
3. **最后一行必须是以下格式之一：**
   **VERDICT: PASS**  （表示代码可以运行，无明显问题）
   **VERDICT: FAIL**  （表示代码有问题，需要重写）

风格：尖酸刻薄、高标准、不留情面""",

    "MEMO": """你是会议记录员（MEMO）。任务：总结整个协作过程，输出执行摘要。

总结内容：
- 项目概况
- 技术方案
- 审查历史（经过几轮修复）
- 最终状态
- 下一步建议

风格：客观、简洁、actionable"""
}

ROLE_NAMES = {
    "PM": "📝 PM·产品经理",
    "DEV": "💻 DEV·工程师", 
    "REVIEWER": "🔍 REVIEWER·审计员",
    "MEMO": "📋 MEMO·记录员"
}


def print_banner():
    """打印启动横幅"""
    print("""
╔══════════════════════════════════════════════════════════╗
║     🤖 Quad Brain Collaboration - 四脑协同系统            ║
║                                                          ║
║  流程: PM → DEV ↔ REVIEWER (循环迭代) → MEMO             ║
╚══════════════════════════════════════════════════════════╝
""")


def run_quad_brain(task: str, max_retries: int = 1, verbose: bool = False):
    """
    运行四脑协作流程
    
    由于此脚本需要与 OpenClaw 子智能体系统集成，
    实际执行时需要调用 sessions_spawn 工具。
    
    这个函数输出工作流程指引，实际执行由主代理完成。
    """
    print_banner()
    print(f"🎯 任务: {task}")
    print(f"📊 最大迭代: {max_retries} 轮")
    print(f"⏰ 开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    print("📋 执行流程指引:")
    print("-" * 50)
    print("""
1️⃣  **PM 阶段** - 分析需求，输出 PRD
    提示词前缀: "你是资深产品经理（PM）..."
    
2️⃣  **DEV 阶段** - 根据 PRD 编写代码
    提示词前缀: "你是全栈工程师（DEV）..."
    
3️⃣  **REVIEWER 阶段** - 审查代码
    提示词前缀: "你是极其严格的代码审计员（REVIEWER）..."
    检查输出末尾是否有 **VERDICT: PASS** 或 **VERDICT: FAIL**
    
    如果 FAIL 且未达最大重试次数:
      → 返回 DEV 阶段，携带审查意见修改代码
      → 再次审查，直到 PASS 或达到 max_retries
      
4️⃣  **MEMO 阶段** - 生成执行摘要
    提示词前缀: "你是会议记录员（MEMO）..."

💡 使用方式:
   在 OpenClaw 中，使用 sessions_spawn 工具按顺序启动子智能体会话，
   每个阶段使用对应的人格提示词。
""")
    print("-" * 50)
    
    return {
        "task": task,
        "max_retries": max_retries,
        "personas": PERSONAS,
        "role_names": ROLE_NAMES
    }


def main():
    parser = argparse.ArgumentParser(
        description='四脑协同系统 - PM → DEV ↔ REVIEWER → MEMO',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python3 quad_brain.py "写一个 Python 函数，计算斐波那契数列"
  python3 quad_brain.py "创建一个爬虫抓取新闻" --max-retries 3
  python3 quad_brain.py "设计一个用户登录 API" -v
        """
    )
    
    parser.add_argument('task', help='任务描述，例如：写一个 Python 函数计算斐波那契数列')
    parser.add_argument('--max-retries', '-r', type=int, default=1,
                       help='最大迭代次数（默认: 1）')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='显示详细信息')
    
    args = parser.parse_args()
    
    result = run_quad_brain(args.task, args.max_retries, args.verbose)
    
    # 输出人格提示词（方便复制使用）
    if args.verbose:
        print("\n📋 人格提示词（用于 sessions_spawn）:")
        print("=" * 50)
        for role, persona in PERSONAS.items():
            print(f"\n{ROLE_NAMES[role]}:")
            print(f"{persona[:200]}...")


if __name__ == "__main__":
    main()
