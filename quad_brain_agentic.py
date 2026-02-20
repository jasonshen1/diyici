#!/usr/bin/env python3
"""
Quad Brain Collaboration System - Agentic Workflow Edition
四脑协同流水线: PM → DEV ↔ REVIEWER (循环) → MEMO

特性：
- REVIEWER 失败时自动反馈给 DEV 重写
- 最多重试 3 次
- 只有 PASS 后才让 MEMO 总结
"""

import os
import re
import sys
import json
import time
import requests
from datetime import datetime
from typing import Dict, Optional, Tuple
from dataclasses import dataclass, field

# ============== 配置区域 ==============

OPENCLAW_BASE_URL = os.getenv("OPENCLAW_URL", "http://localhost:18789")
OPENCLAW_TOKEN = os.getenv("OPENCLAW_TOKEN", "")
MODEL = os.getenv("QUAD_MODEL", "kimi-coding/k2p5")
MAX_RETRIES = 3  # 最大重写次数

WEBHOOKS = {
    "PM": os.getenv("WEBHOOK_PM", ""),
    "DEV": os.getenv("WEBHOOK_DEV", ""),
    "REVIEWER": os.getenv("WEBHOOK_REVIEWER", ""),
    "MEMO": os.getenv("WEBHOOK_MEMO", "")
}

# ============== 四脑人格定义 ==============

PERSONAS = {
    "PM": """你是资深产品经理（PM）。任务：将用户的模糊需求转化为详细的技术规格说明书(PRD)。

职责：需求分析、功能列表、用户流程、验收标准
禁止：不要写代码
风格：专业、结构化""",

    "DEV": """你是全栈工程师（DEV）。任务：根据产品经理的PRD编写核心代码结构。

职责：技术架构、核心代码、API接口、关键注释
输入：产品经理的需求文档，以及（如果有）之前审查意见的反馈
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


# ============== 数据类 ==============

@dataclass
class BrainOutput:
    role: str
    content: str
    timestamp: str
    verdict: Optional[str] = None  # PASS / FAIL
    tokens_used: Optional[int] = None
    latency_ms: Optional[int] = None
    attempt: int = 1  # 第几次尝试


@dataclass
class CollaborationResult:
    original_input: str
    pm_output: Optional[BrainOutput] = None
    dev_iterations: list = field(default_factory=list)  # 每次迭代的结果
    final_dev_output: Optional[BrainOutput] = None
    reviewer_iterations: list = field(default_factory=list)
    final_reviewer_output: Optional[BrainOutput] = None
    memo_output: Optional[BrainOutput] = None
    total_time: float = 0
    total_attempts: int = 0


# ============== 核心类 ==============

class AgenticQuadBrain:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENCLAW_TOKEN}"
        })
        self.iteration = 0
        
    def call_llm(self, persona: str, context: str) -> Tuple[str, Optional[int], Optional[int]]:
        """调用 OpenClaw API"""
        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": persona},
                {"role": "user", "content": context}
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        try:
            start_time = time.time()
            response = self.session.post(
                f"{OPENCLAW_BASE_URL}/v1/chat/completions",
                json=payload,
                timeout=120
            )
            latency = int((time.time() - start_time) * 1000)
            
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                tokens = data.get("usage", {}).get("total_tokens")
                return content, tokens, latency
            else:
                error_msg = f"❌ API 错误 (HTTP {response.status_code}): {response.text[:200]}"
                return error_msg, None, latency
                
        except Exception as e:
            return f"❌ 请求异常: {str(e)}", None, None
    
    def parse_verdict(self, content: str) -> Optional[str]:
        """解析审查结果，提取 PASS/FAIL"""
        # 查找 **VERDICT: PASS** 或 **VERDICT: FAIL**
        match = re.search(r'\*\*VERDICT:\s*(PASS|FAIL)\*\*', content, re.IGNORECASE)
        if match:
            return match.group(1).upper()
        
        # 备用：查找最后一行包含 PASS 或 FAIL
        lines = content.strip().split('\n')
        for line in reversed(lines):
            line_upper = line.upper()
            if 'PASS' in line_upper and 'FAIL' not in line_upper:
                return 'PASS'
            if 'FAIL' in line_upper:
                return 'FAIL'
        
        return None
    
    def send_to_discord(self, role: str, content: str, attempt: int = 1) -> bool:
        """发送到 Discord"""
        webhook_url = WEBHOOKS.get(role)
        if not webhook_url:
            return False
        
        # 截断
        if len(content) > 1900:
            content = content[:1900] + "\n... (已截断)"
        
        # 添加尝试次数标记
        username = ROLE_NAMES[role]
        if attempt > 1:
            username = f"{username} (第{attempt}轮)"
        
        data = {
            "content": content,
            "username": username,
            "allowed_mentions": {"parse": []}
        }
        
        try:
            response = requests.post(webhook_url, json=data, timeout=10)
            return response.status_code in [200, 204]
        except Exception as e:
            print(f"  ⚠️ Discord 发送失败: {e}")
            return False
    
    def print_to_console(self, role: str, content: str, attempt: int = 1):
        """本地输出"""
        name = ROLE_NAMES[role]
        if attempt > 1:
            name = f"{name} (第{attempt}轮)"
        
        width = 60
        print(f"\n{'='*width}")
        print(f"  {name}")
        print(f"{'='*width}")
        print(content[:2000])  # 控制台也截断
        if len(content) > 2000:
            print("... (内容已截断)")
        print(f"{'='*width}\n")
    
    def broadcast(self, role: str, content: str, attempt: int = 1):
        """广播消息"""
        if self.send_to_discord(role, content, attempt):
            print(f"  ✅ 已发送至 Discord ({role})")
        else:
            self.print_to_console(role, content, attempt)
    
    def run_pm_phase(self, user_input: str) -> BrainOutput:
        """PM 阶段"""
        print(f"\n📝 阶段 1: PM 分析需求...")
        content, tokens, latency = self.call_llm(
            PERSONAS["PM"],
            f"用户需求: {user_input}"
        )
        output = BrainOutput(
            role="PM",
            content=content,
            timestamp=datetime.now().isoformat(),
            tokens_used=tokens,
            latency_ms=latency
        )
        self.broadcast("PM", content)
        return output
    
    def run_dev_phase(self, user_input: str, pm_output: str, 
                      previous_review: str = None, attempt: int = 1) -> BrainOutput:
        """DEV 阶段"""
        print(f"\n💻 阶段 2: DEV 编写代码... (第{attempt}次)")
        
        if previous_review:
            # 有审查反馈，需要修改
            context = f"""原始需求: {user_input}

产品经理的规格书:
{pm_output}

【审查反馈 - 必须修复以下问题】:
{previous_review}

请根据审查意见修改代码，修复所有问题后重新提交。
确保代码完整可运行，避免未定义变量等问题。"""
        else:
            # 第一次编写
            context = f"""原始需求: {user_input}

产品经理的规格书:
{pm_output}

请编写完整的代码实现。"""
        
        content, tokens, latency = self.call_llm(PERSONAS["DEV"], context)
        output = BrainOutput(
            role="DEV",
            content=content,
            timestamp=datetime.now().isoformat(),
            tokens_used=tokens,
            latency_ms=latency,
            attempt=attempt
        )
        self.broadcast("DEV", content, attempt)
        return output
    
    def run_reviewer_phase(self, user_input: str, pm_output: str, 
                          dev_output: str, attempt: int = 1) -> BrainOutput:
        """REVIEWER 阶段"""
        print(f"\n🔍 阶段 3: REVIEWER 审查代码... (第{attempt}次)")
        
        context = f"""原始需求: {user_input}

产品经理规格书:
{pm_output[:500]}...

工程师代码 (第{attempt}版):
{dev_output}

请严格审查这段代码。
记住：最后一行必须输出 **VERDICT: PASS** 或 **VERDICT: FAIL**"""
        
        content, tokens, latency = self.call_llm(PERSONAS["REVIEWER"], context)
        verdict = self.parse_verdict(content)
        
        output = BrainOutput(
            role="REVIEWER",
            content=content,
            timestamp=datetime.now().isoformat(),
            verdict=verdict,
            tokens_used=tokens,
            latency_ms=latency,
            attempt=attempt
        )
        
        # 显示审查结果
        display_content = content
        if verdict:
            display_content += f"\n\n📊 审查结果: **{verdict}**"
        self.broadcast("REVIEWER", display_content, attempt)
        
        return output
    
    def run_memo_phase(self, user_input: str, pm_output: str, dev_output: str,
                      reviewer_output: str, iterations: list) -> BrainOutput:
        """MEMO 阶段"""
        print(f"\n📋 阶段 4: MEMO 生成最终日报...")
        
        iteration_summary = "\n\n".join([
            f"第{i+1}轮:\n- DEV: {it['dev'].content[:300]}...\n- REVIEWER: {it['reviewer'].verdict}"
            for i, it in enumerate(iterations)
        ])
        
        context = f"""请总结以下协作过程，生成执行摘要。

原始需求:
{user_input}

产品经理方案:
{pm_output[:500]}...

开发迭代历史:
{iteration_summary}

最终审查意见:
{reviewer_output[:500]}...

请生成包含以下内容的日报：
1. 项目概况
2. 技术方案
3. 审查历史（经过几轮才通过）
4. 最终状态
5. 下一步建议"""
        
        content, tokens, latency = self.call_llm(PERSONAS["MEMO"], context)
        output = BrainOutput(
            role="MEMO",
            content=content,
            timestamp=datetime.now().isoformat(),
            tokens_used=tokens,
            latency_ms=latency
        )
        self.broadcast("MEMO", content)
        return output
    
    def run_agentic_workflow(self, user_input: str) -> CollaborationResult:
        """
        运行 Agentic 工作流（闭环迭代版）
        
        流程：
        1. PM 分析需求
        2. DEV 编写代码
        3. REVIEWER 审查
           - 如果 FAIL：返回步骤 2，携带审查意见（最多 MAX_RETRIES 次）
           - 如果 PASS：进入步骤 4
        4. MEMO 生成日报
        """
        start_time = time.time()
        result = CollaborationResult(original_input=user_input)
        
        print(f"\n🚀 Agentic 四脑协同启动（闭环迭代模式）")
        print(f"   任务: {user_input[:60]}{'...' if len(user_input) > 60 else ''}")
        print(f"   模型: {MODEL}")
        print(f"   最大重试: {MAX_RETRIES} 次")
        print(f"   时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        # ========== 1. PM 阶段 ==========
        result.pm_output = self.run_pm_phase(user_input)
        time.sleep(1)
        
        # ========== 2-3. DEV ↔ REVIEWER 循环 ==========
        iterations = []
        attempt = 1
        previous_review = None
        
        while attempt <= MAX_RETRIES:
            print(f"\n{'='*50}")
            print(f"  迭代轮次: {attempt}/{MAX_RETRIES}")
            print(f"{'='*50}")
            
            # DEV 编写/修改代码
            dev_output = self.run_dev_phase(
                user_input, 
                result.pm_output.content,
                previous_review,
                attempt
            )
            time.sleep(1)
            
            # REVIEWER 审查
            reviewer_output = self.run_reviewer_phase(
                user_input,
                result.pm_output.content,
                dev_output.content,
                attempt
            )
            
            # 记录这一轮
            iterations.append({
                'dev': dev_output,
                'reviewer': reviewer_output
            })
            
            # 判断结果
            if reviewer_output.verdict == "PASS":
                print(f"\n✅ 审查通过！（第{attempt}轮）")
                result.final_dev_output = dev_output
                result.final_reviewer_output = reviewer_output
                result.total_attempts = attempt
                break
            elif reviewer_output.verdict == "FAIL":
                if attempt < MAX_RETRIES:
                    print(f"\n⚠️ 审查未通过，准备第{attempt+1}轮修改...")
                    previous_review = reviewer_output.content
                    attempt += 1
                    time.sleep(2)
                else:
                    print(f"\n❌ 已达最大重试次数({MAX_RETRIES})，使用最后一版代码")
                    result.final_dev_output = dev_output
                    result.final_reviewer_output = reviewer_output
                    result.total_attempts = attempt
                    break
            else:
                # 无法解析审查结果，默认通过
                print(f"\n⚠️ 无法解析审查结果，默认通过")
                result.final_dev_output = dev_output
                result.final_reviewer_output = reviewer_output
                result.total_attempts = attempt
                break
        
        result.dev_iterations = iterations
        
        # ========== 4. MEMO 阶段（只有审查通过才执行）==========
        if result.final_reviewer_output and result.final_reviewer_output.verdict == "PASS":
            result.memo_output = self.run_memo_phase(
                user_input,
                result.pm_output.content,
                result.final_dev_output.content,
                result.final_reviewer_output.content,
                iterations
            )
        else:
            # 如果最终也没通过，生成一个失败总结
            result.memo_output = BrainOutput(
                role="MEMO",
                content=f"⚠️ 项目状态：未通过审查\n\n经过 {result.total_attempts} 轮迭代，代码仍未能通过审查。\n\n建议：\n1. 重新审查需求文档\n2. 简化功能范围\n3. 人工介入审查具体问题",
                timestamp=datetime.now().isoformat()
            )
            self.broadcast("MEMO", result.memo_output.content)
        
        # ========== 统计 ==========
        total_time = time.time() - start_time
        result.total_time = total_time
        
        print(f"\n{'='*50}")
        print(f"✅ Agentic 工作流完成！")
        print(f"{'='*50}")
        print(f"   总耗时: {total_time:.1f}秒")
        print(f"   迭代轮次: {result.total_attempts}/{MAX_RETRIES}")
        print(f"   审查结果: {result.final_reviewer_output.verdict if result.final_reviewer_output else 'UNKNOWN'}")
        
        total_tokens = sum([
            result.pm_output.tokens_used or 0,
            sum(it['dev'].tokens_used or 0 for it in iterations),
            sum(it['reviewer'].tokens_used or 0 for it in iterations),
            result.memo_output.tokens_used or 0
        ])
        if total_tokens > 0:
            print(f"   总 Token: {total_tokens:,}")
        
        return result
    
    def save_report(self, result: CollaborationResult, filename: Optional[str] = None):
        """保存完整报告"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"agentic_report_{timestamp}.md"
        
        iterations_md = "\n\n".join([
            f"### 第{i+1}轮\n\n**DEV 代码:**\n```\n{it['dev'].content[:1000]}...\n```\n\n**REVIEWER 意见 ({it['reviewer'].verdict}):**\n{it['reviewer'].content[:800]}..."
            for i, it in enumerate(result.dev_iterations)
        ])
        
        report = f"""# 🤖 Agentic 四脑协同报告

**任务**: {result.original_input}
**时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**总耗时**: {result.total_time:.1f}秒
**迭代轮次**: {result.total_attempts}/{MAX_RETRIES}
**最终审查**: {result.final_reviewer_output.verdict if result.final_reviewer_output else 'UNKNOWN'}

---

## 📝 PM·产品经理

{result.pm_output.content}

---

## 💻 DEV·工程师 (迭代过程)

{iterations_md}

---

## 📋 MEMO·记录员

{result.memo_output.content if result.memo_output else 'N/A'}

---

*Generated by Agentic Quad Brain System*
"""
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"   报告已保存: {filename}")
        return filename


# ============== 交互模式 ==============

def interactive_mode():
    """交互式运行"""
    system = AgenticQuadBrain()
    
    print("""
╔══════════════════════════════════════════════════════════╗
║     🤖 Agentic Quad Brain - 闭环迭代版                    ║
║                                                          ║
║  流程: PM → DEV ↔ REVIEWER (循环，最多3次) → MEMO       ║
║                                                          ║
║  特性:                                                   ║
║  • 审查失败自动反馈重写                                  ║
║  • 最多 3 轮迭代                                         ║
║  • 通过后才生成日报                                      ║
╚══════════════════════════════════════════════════════════╝

命令:
  <任务描述>     启动工作流
  save          保存上次报告
  quit/exit     退出
""")
    
    last_result: Optional[CollaborationResult] = None
    
    while True:
        try:
            user_input = input("\n🎯 任务> ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("👋 再见!")
                break
            
            if user_input.lower() == 'save':
                if last_result:
                    system.save_report(last_result)
                else:
                    print("⚠️ 没有可保存的报告")
                continue
            
            # 运行工作流
            result = system.run_agentic_workflow(user_input)
            last_result = result
            
            # 自动保存
            system.save_report(result)
            
        except KeyboardInterrupt:
            print("\n\n👋 再见!")
            break
        except Exception as e:
            print(f"❌ 错误: {e}")
            import traceback
            traceback.print_exc()


def single_run(task: str, save: bool = True):
    """单次运行"""
    system = AgenticQuadBrain()
    result = system.run_agentic_workflow(task)
    
    if save:
        system.save_report(result)
    
    return result


# ============== 主入口 ==============

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Agentic 四脑协同系统')
    parser.add_argument('task', nargs='?', help='任务描述（交互模式）')
    parser.add_argument('--no-save', action='store_true', help='不保存报告')
    parser.add_argument('--model', default=MODEL, help=f'模型 (默认: {MODEL})')
    parser.add_argument('--max-retries', type=int, default=MAX_RETRIES, 
                       help=f'最大重试次数 (默认: {MAX_RETRIES})')
    
    args = parser.parse_args()
    
    MODEL = args.model
    MAX_RETRIES = args.max_retries
    
    if args.task:
        single_run(args.task, save=not args.no_save)
    else:
        interactive_mode()
