#!/usr/bin/env python3
"""
Quad Brain Collaboration System
四脑协同流水线: PM → DEV → REVIEWER → MEMO
适配 OpenClaw Gateway API
"""

import os
import sys
import json
import time
import requests
from datetime import datetime
from typing import Dict, Optional
from dataclasses import dataclass

# ============== 配置区域 ==============

# OpenClaw Gateway 配置
OPENCLAW_BASE_URL = os.getenv("OPENCLAW_URL", "http://localhost:18789")
OPENCLAW_TOKEN = os.getenv("OPENCLAW_TOKEN", "")

# 模型选择 (从配置中选择一个)
MODEL = os.getenv("QUAD_MODEL", "kimi-coding/k2p5")

# Discord Webhooks (可选，如果不配置则在本地输出)
WEBHOOKS = {
    "PM": os.getenv("WEBHOOK_PM", ""),
    "DEV": os.getenv("WEBHOOK_DEV", ""),
    "REVIEWER": os.getenv("WEBHOOK_REVIEWER", ""),
    "MEMO": os.getenv("WEBHOOK_MEMO", "")
}

# ============== 四脑人格定义 ==============

PERSONAS = {
    "PM": """你是资深产品经理（PM）。任务：将用户的模糊需求转化为详细的技术规格说明书(PRD)。

职责：
• 分析用户真实需求，识别核心痛点
• 输出功能清单（优先级排序）
• 设计用户流程（User Flow）
• 定义验收标准（Acceptance Criteria）
• 估算开发复杂度

禁止：
× 不要写代码
× 不要涉及具体技术实现细节

输出格式：
1. 需求背景
2. 目标用户
3. 功能列表（P0/P1/P2）
4. 用户流程图（文字描述）
5. 验收标准

风格：专业、结构化、条理清晰""",

    "DEV": """你是全栈工程师（DEV）。任务：根据产品经理的PRD编写核心代码结构。

职责：
• 设计技术架构
• 编写核心代码（Python/JS/Go等，根据场景选择）
• 定义数据模型
• 设计 API 接口
• 指出技术难点和风险

输入：产品经理的需求文档
输出：可运行的代码框架 + 技术方案说明

风格：
• 极客、高效、直接
• 代码优先，解释为辅
• 使用代码块包裹代码
• 关键地方加注释""",

    "REVIEWER": """你是严格的代码审计员（REVIEWER）。任务：挑刺，找出代码中的问题。

审查维度：
🔴 安全性：SQL注入、XSS、敏感信息硬编码、权限漏洞
🟡 性能：时间复杂度、空间复杂度、N+1查询、死循环
🟢 可读性：命名规范、代码组织、注释质量
🔵 健壮性：异常处理、边界情况、并发安全

审查标准：
• 像黑客一样思考（如何攻击这段代码）
• 像用户一样思考（什么输入会让它崩溃）
• 像维护者一样思考（6个月后还能看懂吗）

输出规则：
• 如果没有问题 → 回复"✅ PASS"
• 如果有问题 → 按严重程度列出，给出修复建议

风格：尖酸刻薄、高标准、不留情面""",

    "MEMO": """你是会议记录员（MEMO）。任务：总结整个协作过程，输出执行摘要。

需要总结的内容：
• PM 的需求分析要点
• DEV 的技术方案和核心代码
• REVIEWER 发现的问题（如果有）
• 下一步行动建议

输出格式：
📋 项目：{一句话概括}
👤 参与者：PM、DEV、REVIEWER、MEMO
🎯 核心决策：{最重要的决定}
⚙️ 技术方案：{关键技术点}
⚠️ 风险提示：{REVIEWER发现的问题}
📌 下一步：{可执行的行动项}

风格：客观、简洁、 actionable"""
}

# 角色显示名称
ROLE_NAMES = {
    "PM": "📝 PM·产品经理",
    "DEV": "💻 DEV·工程师",
    "REVIEWER": "🔍 REVIEWER·审计员",
    "MEMO": "📋 MEMO·记录员"
}


# ============== 数据类 ==============

@dataclass
class BrainOutput:
    """单个脑的输出结果"""
    role: str
    content: str
    timestamp: str
    tokens_used: Optional[int] = None
    latency_ms: Optional[int] = None


@dataclass
class CollaborationResult:
    """完整协作结果"""
    original_input: str
    pm_output: BrainOutput
    dev_output: BrainOutput
    reviewer_output: BrainOutput
    memo_output: BrainOutput
    total_time: float


# ============== 核心类 ==============

class QuadBrainSystem:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENCLAW_TOKEN}"
        })
        self.results: Dict[str, BrainOutput] = {}
        
    def call_llm(self, persona: str, context: str) -> tuple[str, Optional[int]]:
        """调用 OpenClaw API，返回 (内容, token数)"""
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
                
        except requests.exceptions.Timeout:
            return "❌ 请求超时，请检查 OpenClaw 是否运行正常", None, None
        except requests.exceptions.ConnectionError:
            return f"❌ 无法连接到 OpenClaw ({OPENCLAW_BASE_URL})，请确认服务已启动", None, None
        except Exception as e:
            return f"❌ 请求异常: {str(e)}", None, None
    
    def send_to_discord(self, role: str, content: str) -> bool:
        """通过 Webhook 发送到 Discord"""
        webhook_url = WEBHOOKS.get(role)
        if not webhook_url:
            return False
        
        # 截断过长的消息 (Discord 限制 2000 字符)
        if len(content) > 1900:
            content = content[:1900] + "\n... (内容已截断)"
        
        data = {
            "content": content,
            "username": ROLE_NAMES[role],
            "allowed_mentions": {"parse": []}
        }
        
        try:
            response = requests.post(webhook_url, json=data, timeout=10)
            return response.status_code in [200, 204]
        except Exception as e:
            print(f"  ⚠️ Discord 发送失败: {e}")
            return False
    
    def print_to_console(self, role: str, content: str):
        """本地控制台输出"""
        name = ROLE_NAMES[role]
        width = 60
        print(f"\n{'='*width}")
        print(f"  {name}")
        print(f"{'='*width}")
        print(content)
        print(f"{'='*width}\n")
    
    def broadcast(self, role: str, content: str, label: str = ""):
        """广播消息：Discord + 控制台"""
        # 添加标签
        if label:
            formatted = f"**[{label}]**\n{content}"
        else:
            formatted = content
        
        # 发送到 Discord
        if self.send_to_discord(role, formatted):
            print(f"  ✅ 已发送至 Discord ({role})")
        else:
            # Discord 失败或未配置，打印到控制台
            self.print_to_console(role, formatted)
    
    def run_pipeline(self, user_input: str) -> CollaborationResult:
        """运行四脑流水线"""
        start_time = time.time()
        print(f"\n🚀 四脑协同流水线启动")
        print(f"   任务: {user_input[:50]}{'...' if len(user_input) > 50 else ''}")
        print(f"   模型: {MODEL}")
        print(f"   时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        # ========== 1. PM 阶段 ==========
        print(f"📝 阶段 1/4: PM 分析需求...")
        pm_content, pm_tokens, pm_latency = self.call_llm(
            PERSONAS["PM"],
            f"用户需求: {user_input}"
        )
        self.results["PM"] = BrainOutput(
            role="PM",
            content=pm_content,
            timestamp=datetime.now().isoformat(),
            tokens_used=pm_tokens,
            latency_ms=pm_latency
        )
        self.broadcast("PM", pm_content, "需求分析")
        time.sleep(1)
        
        # ========== 2. DEV 阶段 ==========
        print(f"💻 阶段 2/4: DEV 编写代码...")
        dev_context = f"""原始需求: {user_input}

产品经理的规格书:
{pm_content}

请根据以上需求编写代码。"""
        
        dev_content, dev_tokens, dev_latency = self.call_llm(
            PERSONAS["DEV"],
            dev_context
        )
        self.results["DEV"] = BrainOutput(
            role="DEV",
            content=dev_content,
            timestamp=datetime.now().isoformat(),
            tokens_used=dev_tokens,
            latency_ms=dev_latency
        )
        self.broadcast("DEV", dev_content, "代码实现")
        time.sleep(1)
        
        # ========== 3. REVIEWER 阶段 ==========
        print(f"🔍 阶段 3/4: REVIEWER 审查代码...")
        review_context = f"""原始需求: {user_input}

产品经理规格书:
{pm_content[:500]}...

工程师代码:
{dev_content}

请审查这段代码。"""
        
        review_content, review_tokens, review_latency = self.call_llm(
            PERSONAS["REVIEWER"],
            review_context
        )
        self.results["REVIEWER"] = BrainOutput(
            role="REVIEWER",
            content=review_content,
            timestamp=datetime.now().isoformat(),
            tokens_used=review_tokens,
            latency_ms=review_latency
        )
        self.broadcast("REVIEWER", review_content, "代码审查")
        time.sleep(1)
        
        # ========== 4. MEMO 阶段 ==========
        print(f"📋 阶段 4/4: MEMO 生成日报...")
        memo_context = f"""请总结以下协作过程，生成执行摘要。

原始需求:
{user_input}

产品经理方案:
{pm_content[:800]}...

工程师代码:
{dev_content[:800]}...

审查意见:
{review_content}"""
        
        memo_content, memo_tokens, memo_latency = self.call_llm(
            PERSONAS["MEMO"],
            memo_context
        )
        self.results["MEMO"] = BrainOutput(
            role="MEMO",
            content=memo_content,
            timestamp=datetime.now().isoformat(),
            tokens_used=memo_tokens,
            latency_ms=memo_latency
        )
        self.broadcast("MEMO", memo_content, "执行摘要")
        
        # 计算总时间
        total_time = time.time() - start_time
        
        # 输出统计
        print(f"\n✅ 四脑协同完成！")
        print(f"   总耗时: {total_time:.1f}秒")
        
        total_tokens = sum([
            r.tokens_used or 0 for r in self.results.values()
        ])
        if total_tokens > 0:
            print(f"   总 Token: {total_tokens:,}")
        
        return CollaborationResult(
            original_input=user_input,
            pm_output=self.results["PM"],
            dev_output=self.results["DEV"],
            reviewer_output=self.results["REVIEWER"],
            memo_output=self.results["MEMO"],
            total_time=total_time
        )
    
    def save_report(self, result: CollaborationResult, filename: Optional[str] = None):
        """保存完整报告到文件"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"quad_brain_report_{timestamp}.md"
        
        report = f"""# 🧠 四脑协同报告

**任务**: {result.original_input}
**时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**总耗时**: {result.total_time:.1f}秒

---

## 📝 PM·产品经理

{result.pm_output.content}

---

## 💻 DEV·工程师

{result.dev_output.content}

---

## 🔍 REVIEWER·审计员

{result.reviewer_output.content}

---

## 📋 MEMO·记录员

{result.memo_output.content}

---

*Generated by Quad Brain Collaboration System*
"""
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"   报告已保存: {filename}")
        return filename


# ============== 交互模式 ==============

def interactive_mode():
    """交互式运行"""
    system = QuadBrainSystem()
    
    print("""
╔══════════════════════════════════════════════════════════╗
║           🧠 Quad Brain Collaboration System              ║
║                   四脑协同流水线                          ║
╠══════════════════════════════════════════════════════════╣
║  PM  →  DEV  →  REVIEWER  →  MEMO                        ║
║  需求   开发     审查        总结                         ║
╚══════════════════════════════════════════════════════════╝

命令:
  <任务描述>     启动四脑协作
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
                    print("⚠️ 没有可保存的报告，先执行一个任务")
                continue
            
            # 运行流水线
            result = system.run_pipeline(user_input)
            last_result = result
            
            # 自动保存
            system.save_report(result)
            
        except KeyboardInterrupt:
            print("\n\n👋 再见!")
            break
        except Exception as e:
            print(f"❌ 错误: {e}")


def single_run(task: str, save: bool = True):
    """单次运行模式"""
    system = QuadBrainSystem()
    result = system.run_pipeline(task)
    
    if save:
        system.save_report(result)
    
    return result


# ============== 主入口 ==============

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='四脑协同系统')
    parser.add_argument('task', nargs='?', help='任务描述（如果不提供则进入交互模式）')
    parser.add_argument('--no-save', action='store_true', help='不保存报告')
    parser.add_argument('--model', default=MODEL, help=f'模型名称 (默认: {MODEL})')
    
    args = parser.parse_args()
    
    # 更新模型
    if args.model:
        MODEL = args.model
    
    # 检查配置
    if not OPENCLAW_TOKEN:
        print("⚠️ 警告: OPENCLAW_TOKEN 未设置")
        print(f"   当前使用: {OPENCLAW_BASE_URL}")
        print("   如果启用了认证，请求可能会失败\n")
    
    discord_configured = any(WEBHOOKS.values())
    if not discord_configured:
        print("ℹ️ 提示: Discord Webhooks 未配置，将仅在控制台输出\n")
    
    if args.task:
        single_run(args.task, save=not args.no_save)
    else:
        interactive_mode()
