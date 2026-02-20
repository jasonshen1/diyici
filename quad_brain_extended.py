#!/usr/bin/env python3
"""
Extended Agentic Quad Brain System - 扩展四脑协同系统
支持多种角色和自定义工作流
"""

import os
import re
import sys
import json
import time
import argparse
import requests
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field

# 导入扩展角色定义
from extended_roles import (
    EXTENDED_ROLES, WORKFLOWS, ROLE_COMBINATIONS,
    get_role_prompt, suggest_workflow, list_roles, list_workflows
)

# ============== 配置 ==============

OPENCLAW_BASE_URL = os.getenv("OPENCLAW_URL", "http://localhost:18789")
OPENCLAW_TOKEN = os.getenv("OPENCLAW_TOKEN", "")
MODEL = os.getenv("QUAD_MODEL", "kimi-coding/k2p5")

# 自动加载所有角色的 Webhook
WEBHOOKS = {}
for role_id in EXTENDED_ROLES.keys():
    webhook = os.getenv(f"WEBHOOK_{role_id.upper()}", "")
    if webhook:
        WEBHOOKS[role_id] = webhook

# ============== 数据类 ==============

@dataclass
class AgentOutput:
    role: str
    content: str
    timestamp: str
    verdict: Optional[str] = None
    tokens_used: Optional[int] = None
    latency_ms: Optional[int] = None
    attempt: int = 1


@dataclass
class WorkflowResult:
    task: str
    workflow_name: str
    roles_used: List[str]
    outputs: Dict[str, List[AgentOutput]]
    total_time: float
    final_verdict: str
    iterations: int


# ============== 核心类 ==============

class ExtendedAgenticSystem:
    def __init__(self, model: str = MODEL):
        self.model = model
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENCLAW_TOKEN}"
        })
        self.results: Dict[str, List[AgentOutput]] = {}
        
    def call_llm(self, role_id: str, context: str) -> Tuple[str, Optional[int], Optional[int]]:
        """调用 OpenClaw API"""
        persona = get_role_prompt(role_id)
        if not persona:
            return f"Error: Unknown role {role_id}", None, None
        
        payload = {
            "model": self.model,
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
                return f"❌ API Error: {response.status_code}", None, latency
        except Exception as e:
            return f"❌ Error: {str(e)}", None, None
    
    def parse_verdict(self, content: str, role_id: str) -> Optional[str]:
        """解析审查结果"""
        content_upper = content.upper()
        
        # 不同角色的 verdict 标记
        patterns = {
            "REVIEWER": r'VERDICT:\s*(PASS|FAIL)',
            "TESTER": r'TEST VERDICT:\s*(PASS|NEEDS_FIX)',
            "SECURITY": r'SECURITY VERDICT:\s*(SECURE|NEEDS_FIX)',
        }
        
        import re
        pattern = patterns.get(role_id, r'VERDICT:\s*(PASS|FAIL)')
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            return match.group(1).upper()
        
        # 备用检测
        if role_id == "TESTER":
            if "PASS" in content_upper and "NEEDS_FIX" not in content_upper:
                return "PASS"
            elif "NEEDS_FIX" in content_upper or "FAIL" in content_upper:
                return "NEEDS_FIX"
        elif role_id == "SECURITY":
            if "SECURE" in content_upper and "NEEDS_FIX" not in content_upper:
                return "SECURE"
            elif "NEEDS_FIX" in content_upper:
                return "NEEDS_FIX"
        else:
            if "VERDICT: PASS" in content_upper:
                return "PASS"
            elif "VERDICT: FAIL" in content_upper:
                return "FAIL"
        
        return None
    
    def send_to_discord(self, role_id: str, content: str, attempt: int = 1) -> bool:
        """发送到 Discord"""
        webhook_url = WEBHOOKS.get(role_id)
        if not webhook_url:
            return False
        
        role_info = EXTENDED_ROLES.get(role_id, {})
        username = role_info.get("name", role_id)
        if attempt > 1:
            username = f"{username} (第{attempt}轮)"
        
        # 截断
        if len(content) > 1900:
            content = content[:1900] + "\n... (已截断)"
        
        data = {
            "content": content,
            "username": username,
            "allowed_mentions": {"parse": []}
        }
        
        try:
            response = requests.post(webhook_url, json=data, timeout=10)
            return response.status_code in [200, 204]
        except:
            return False
    
    def broadcast(self, role_id: str, content: str, attempt: int = 1, use_discord: bool = True):
        """广播消息"""
        role_info = EXTENDED_ROLES.get(role_id, {})
        role_name = role_info.get("name", role_id)
        
        if attempt > 1:
            role_name = f"{role_name} (第{attempt}轮)"
        
        # 控制台输出
        width = 60
        print(f"\n{'='*width}")
        print(f"  {role_name}")
        print(f"{'='*width}")
        print(content[:2000])
        if len(content) > 2000:
            print("... (内容已截断)")
        print(f"{'='*width}\n")
        
        # Discord 输出
        if use_discord and self.send_to_discord(role_id, content, attempt):
            print(f"  ✅ 已发送至 Discord")
    
    def run_agent(self, role_id: str, context: str, attempt: int = 1, 
                  use_discord: bool = True) -> AgentOutput:
        """运行单个代理"""
        role_info = EXTENDED_ROLES.get(role_id, {})
        emoji = role_info.get("emoji", "🤖")
        
        print(f"\n{emoji} 运行 {role_info.get('name', role_id)}... (第{attempt}次)")
        
        content, tokens, latency = self.call_llm(role_id, context)
        verdict = self.parse_verdict(content, role_id)
        
        output = AgentOutput(
            role=role_id,
            content=content,
            timestamp=datetime.now().isoformat(),
            verdict=verdict,
            tokens_used=tokens,
            latency_ms=latency,
            attempt=attempt
        )
        
        # 显示结果
        display = content
        if verdict:
            display += f"\n\n📊 结果: **{verdict}**"
        
        self.broadcast(role_id, display, attempt, use_discord)
        
        if role_id not in self.results:
            self.results[role_id] = []
        self.results[role_id].append(output)
        
        return output
    
    def run_workflow(self, task: str, workflow_id: str = "quad_basic", 
                     use_discord: bool = False) -> WorkflowResult:
        """运行完整工作流"""
        workflow = WORKFLOWS.get(workflow_id, WORKFLOWS["quad_basic"])
        start_time = time.time()
        
        print("=" * 70)
        print(f"🚀 启动工作流: {workflow['name']}")
        print(f"   任务: {task[:60]}{'...' if len(task) > 60 else ''}")
        print(f"   角色: {', '.join(workflow['roles'])}")
        print(f"   模型: {self.model}")
        print("=" * 70)
        
        # 清空结果
        self.results = {}
        total_iterations = 0
        
        # 获取序列
        sequence = workflow.get("sequence", workflow['roles'])
        loops = workflow.get("loops", {})
        
        # 执行序列
        for step in sequence:
            if isinstance(step, list):
                # 并行执行
                print(f"\n⚡ 并行执行: {', '.join(step)}")
                # 简化为顺序执行（实际可改为真正的并行）
                for role_id in step:
                    self._execute_role(role_id, task, loops, use_discord)
                    total_iterations += 1
            else:
                self._execute_role(step, task, loops, use_discord)
                total_iterations += 1
        
        total_time = time.time() - start_time
        
        # 确定最终结果
        final_verdict = "PASS"
        for role_id, outputs in self.results.items():
            for output in outputs:
                if output.verdict in ["FAIL", "NEEDS_FIX"]:
                    final_verdict = "NEEDS_FIX"
                    break
        
        result = WorkflowResult(
            task=task,
            workflow_name=workflow['name'],
            roles_used=workflow['roles'],
            outputs=self.results,
            total_time=total_time,
            final_verdict=final_verdict,
            iterations=total_iterations
        )
        
        self._print_summary(result)
        return result
    
    def _execute_role(self, role_id: str, task: str, loops: Dict, use_discord: bool):
        """执行单个角色（支持循环）"""
        # 构建上下文
        context = self._build_context(role_id, task)
        
        # 检查是否有循环配置
        loop_key = None
        for key in loops.keys():
            if role_id in key.split("-"):
                loop_key = key
                break
        
        if loop_key:
            # 执行带循环的角色
            loop_config = loops[loop_key]
            max_retries = loop_config.get("max_retries", 3)
            
            for attempt in range(1, max_retries + 1):
                output = self.run_agent(role_id, context, attempt, use_discord)
                
                # 检查是否通过
                if output.verdict in ["PASS", "SECURE"]:
                    print(f"  ✅ {role_id} 通过（第{attempt}轮）")
                    break
                elif attempt < max_retries:
                    print(f"  ⚠️ {role_id} 未通过，准备第{attempt+1}轮...")
                    # 更新上下文，包含审查意见
                    context = self._build_context(role_id, task, include_feedback=True)
                    time.sleep(2)
                else:
                    print(f"  ❌ {role_id} 达到最大重试次数")
        else:
            # 普通执行
            self.run_agent(role_id, context, 1, use_discord)
    
    def _build_context(self, role_id: str, task: str, include_feedback: bool = False) -> str:
        """构建上下文"""
        context_parts = [f"任务: {task}"]
        
        # 根据角色添加前置输出
        if role_id in ["DEV", "ARCHITECT"] and "PM" in self.results:
            pm_output = self.results["PM"][-1].content
            context_parts.append(f"\n产品经理的PRD:\n{pm_output[:1000]}...")
        
        if role_id == "UX" and "ARCHITECT" in self.results:
            arch_output = self.results["ARCHITECT"][-1].content
            context_parts.append(f"\n架构设计:\n{arch_output[:800]}...")
        
        if role_id in ["REVIEWER", "TESTER", "SECURITY"] and "DEV" in self.results:
            dev_output = self.results["DEV"][-1].content
            context_parts.append(f"\n工程师代码:\n{dev_output[:1500]}...")
        
        if role_id == "MEMO":
            # MEMO 需要所有前置输出
            for r_id, outputs in self.results.items():
                if outputs:
                    context_parts.append(f"\n{r_id}:\n{outputs[-1].content[:500]}...")
        
        if include_feedback and role_id in ["DEV"]:
            # 添加审查反馈
            for reviewer_id in ["REVIEWER", "TESTER", "SECURITY"]:
                if reviewer_id in self.results and self.results[reviewer_id]:
                    feedback = self.results[reviewer_id][-1].content
                    context_parts.append(f"\n【{reviewer_id}反馈 - 需修复】:\n{feedback[:1000]}...")
        
        return "\n".join(context_parts)
    
    def _print_summary(self, result: WorkflowResult):
        """打印总结"""
        print("\n" + "=" * 70)
        print(f"✅ 工作流完成: {result.workflow_name}")
        print("=" * 70)
        print(f"   总耗时: {result.total_time:.1f}秒")
        print(f"   总迭代: {result.iterations}")
        print(f"   最终结果: {result.final_verdict}")
        
        total_tokens = sum(
            output.tokens_used or 0
            for outputs in result.outputs.values()
            for output in outputs
        )
        if total_tokens > 0:
            print(f"   总 Token: {total_tokens:,}")
        
        print(f"\n   角色输出:")
        for role_id, outputs in result.outputs.items():
            role_info = EXTENDED_ROLES.get(role_id, {})
            emoji = role_info.get("emoji", "🤖")
            attempts = len(outputs)
            verdict = outputs[-1].verdict if outputs else "N/A"
            print(f"     {emoji} {role_id}: {attempts}轮, 结果={verdict}")
        
        print("=" * 70)


def interactive_mode(system: ExtendedAgenticSystem):
    """交互模式"""
    print("""
╔══════════════════════════════════════════════════════════╗
║     🤖 Extended Agentic Team - 扩展智能体团队            ║
╠══════════════════════════════════════════════════════════╣
║  可用工作流:                                             ║
║    • quad_basic    - 四脑基础版                          ║
║    • quad_with_tests - 四脑+测试版                       ║
║    • enterprise    - 企业级开发流程                      ║
║    • security_first - 安全优先                           ║
║    • mvp_fast      - MVP快速迭代                         ║
║    • docs_driven   - 文档驱动开发                        ║
╚══════════════════════════════════════════════════════════╝

命令:
  <任务描述>              使用默认工作流
  <任务> --wf <工作流ID>  指定工作流
  workflows               列出所有工作流
  roles                   列出所有角色
  quit/exit               退出
""")
    
    while True:
        try:
            user_input = input("\n🎯 任务> ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("👋 再见!")
                break
            
            if user_input.lower() == 'workflows':
                for wf_id, info in list_workflows().items():
                    print(f"  • {wf_id}: {info['name']}")
                continue
            
            if user_input.lower() == 'roles':
                for role_id, info in list_roles().items():
                    print(f"  {info['emoji']} {role_id}: {info['description']}")
                continue
            
            # 解析命令
            parts = user_input.split(' --wf ')
            task = parts[0]
            workflow = parts[1] if len(parts) > 1 else "quad_basic"
            
            system.run_workflow(task, workflow)
            
        except KeyboardInterrupt:
            print("\n\n👋 再见!")
            break
        except Exception as e:
            print(f"❌ 错误: {e}")


def main():
    parser = argparse.ArgumentParser(description='扩展智能体团队系统')
    parser.add_argument('task', nargs='?', help='任务描述')
    parser.add_argument('--workflow', '-w', default='quad_basic', 
                       help='工作流ID (默认: quad_basic)')
    parser.add_argument('--model', '-m', default=MODEL, help='模型')
    parser.add_argument('--discord', '-d', action='store_true', 
                       help='启用Discord输出')
    parser.add_argument('--list-workflows', action='store_true', help='列出工作流')
    parser.add_argument('--list-roles', action='store_true', help='列出角色')
    
    args = parser.parse_args()
    
    if args.list_workflows:
        print("\n可用工作流:")
        for wf_id, info in list_workflows().items():
            print(f"  • {wf_id}: {info['name']}")
            print(f"    角色: {', '.join(info['roles'])}\n")
        return
    
    if args.list_roles:
        print("\n可用角色:")
        for role_id, info in list_roles().items():
            print(f"  {info['emoji']} {role_id}: {info['description']}")
        return
    
    system = ExtendedAgenticSystem(model=args.model)
    
    if args.task:
        system.run_workflow(args.task, args.workflow, args.discord)
    else:
        interactive_mode(system)


if __name__ == "__main__":
    main()
