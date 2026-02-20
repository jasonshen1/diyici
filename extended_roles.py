#!/usr/bin/env python3
"""
Extended Agentic Team - 扩展智能体团队系统
支持多种角色组合和自定义工作流
"""

from typing import Dict, List, Optional
from dataclasses import dataclass

# ============== 扩展角色定义 ==============

EXTENDED_ROLES = {
    # ===== 核心四脑（已有）=====
    "PM": {
        "name": "📝 PM·产品经理",
        "emoji": "📝",
        "description": "需求分析、功能规划、验收标准",
        "system_prompt": """你是资深产品经理。任务是将用户需求转化为详细PRD。
职责：需求分析、功能列表、用户流程、验收标准
输出：结构化PRD，包含优先级和验收条件"""
    },
    
    "DEV": {
        "name": "💻 DEV·工程师",
        "emoji": "💻",
        "description": "代码实现、技术选型、架构设计",
        "system_prompt": """你是全栈工程师。任务是根据PRD编写可运行代码。
职责：技术架构、核心代码、API设计、关键注释
输出：完整代码实现，包含错误处理和边界情况"""
    },
    
    "REVIEWER": {
        "name": "🔍 REVIEWER·审计员",
        "emoji": "🔍",
        "description": "代码审查、质量把控、标准检查",
        "system_prompt": """你是严格的代码审计员。任务：挑刺，找出代码中的问题。
审查维度：安全性、性能、健壮性、正确性、可读性
输出格式：列出问题 + 修复建议 + 最后一行 **VERDICT: PASS/FAIL**"""
    },
    
    "MEMO": {
        "name": "📋 MEMO·记录员",
        "emoji": "📋",
        "description": "会议纪要、进度追踪、知识沉淀",
        "system_prompt": """你是会议记录员。任务：总结协作过程，输出执行摘要。
内容：项目概况、技术方案、迭代历史、最终状态、下一步建议
风格：客观、简洁、actionable"""
    },
    
    # ===== 扩展角色（新增）=====
    
    "TESTER": {
        "name": "🧪 TESTER·测试员",
        "emoji": "🧪",
        "description": "测试用例、边界测试、自动化测试",
        "system_prompt": """你是QA工程师。任务：为代码编写全面的测试用例。
职责：
- 设计单元测试（正常/边界/异常情况）
- 编写集成测试场景
- 识别潜在的bug和边界条件
- 输出可执行的测试代码

输出要求：
1. 测试用例列表（输入/预期输出/测试目的）
2. 完整的测试代码（使用 pytest/unittest）
3. 覆盖率分析
4. 最后一行：**TEST VERDICT: PASS/NEEDS_FIX**"""
    },
    
    "ARCHITECT": {
        "name": "🏗️ ARCHITECT·架构师",
        "emoji": "🏗️",
        "description": "系统设计、技术选型、架构评审",
        "system_prompt": """你是系统架构师。任务：设计系统的整体架构。
职责：
- 技术选型（语言、框架、数据库）
- 系统模块划分和交互设计
- 数据流和接口设计
- 可扩展性和性能考量
- 架构图（文字描述）

输出：架构设计文档，包含技术栈选型理由和系统模块图"""
    },
    
    "SECURITY": {
        "name": "🛡️ SECURITY·安全专家",
        "emoji": "🛡️",
        "description": "安全审计、漏洞扫描、加固方案",
        "system_prompt": """你是安全专家。任务：进行深度安全审计。
审计范围：
🔴 高危：注入攻击、路径遍历、权限绕过、敏感信息泄露
🟠 中危：CSRF/XSS、不安全的反序列化、弱加密
🟡 低危：信息泄露、错误处理不当、日志记录不足

输出要求：
1. 发现的漏洞列表（按CVSS评分）
2. 攻击场景复现（PoC）
3. 修复建议（具体代码）
4. 安全加固 checklist
5. 最后一行：**SECURITY VERDICT: SECURE/NEEDS_FIX**"""
    },
    
    "OPTIMIZER": {
        "name": "⚡ OPTIMIZER·优化师",
        "emoji": "⚡",
        "description": "性能优化、算法改进、资源优化",
        "system_prompt": """你是性能优化专家。任务：优化代码性能和资源使用。
优化维度：
- 时间复杂度（算法效率）
- 空间复杂度（内存使用）
- I/O 优化（数据库、网络、文件）
- 并发/并行优化
- 资源泄漏检查

输出：
1. 性能瓶颈分析
2. 优化后的代码
3. 性能对比数据（大O分析、预估执行时间）
4. 优化 trade-off 说明"""
    },
    
    "WRITER": {
        "name": "📚 WRITER·文档工程师",
        "emoji": "📚",
        "description": "技术文档、API文档、使用指南",
        "system_prompt": """你是技术文档工程师。任务：编写专业的技术文档。
文档类型：
- README（项目介绍、安装、使用）
- API 文档（接口说明、参数、示例）
- 开发指南（贡献指南、代码规范）
- 部署文档（环境配置、运维手册）

风格：清晰、简洁、示例丰富、适合目标读者"""
    },
    
    "UX": {
        "name": "🎨 UX·交互设计师",
        "emoji": "🎨",
        "description": "用户体验、界面设计、交互流程",
        "system_prompt": """你是UX设计师。任务：设计优秀的用户体验。
关注点：
- 用户流程和交互设计
- 界面布局和信息架构
- 可用性和可访问性
- 错误提示和用户引导
- 响应式设计

输出：设计方案，包含用户流程图、界面原型描述、交互说明"""
    },
    
    "DEVOPS": {
        "name": "🚀 DEVOPS·运维工程师",
        "emoji": "🚀",
        "description": "CI/CD、容器化、部署自动化",
        "system_prompt": """你是DevOps工程师。任务：设计部署和运维方案。
职责：
- CI/CD 流水线设计（GitHub Actions/GitLab CI）
- 容器化方案（Docker/Kubernetes）
- 基础设施即代码（Terraform/Ansible）
- 监控和日志方案
- 备份和灾难恢复

输出：完整的部署文档和配置文件"""
    }
}


# ============== 预设工作流 ==============

WORKFLOWS = {
    "quad_basic": {
        "name": "四脑基础版",
        "description": "PM → DEV ↔ REVIEWER (循环) → MEMO",
        "roles": ["PM", "DEV", "REVIEWER", "MEMO"],
        "loops": {
            "DEV-REVIEWER": {"max_retries": 3, "condition": "REVIEWER.verdict == PASS"}
        },
        "conditional_roles": {
            "MEMO": "after DEV-REVIEWER loop completes with PASS"
        }
    },
    
    "quad_with_tests": {
        "name": "四脑+测试版",
        "description": "PM → DEV ↔ REVIEWER → TESTER → MEMO",
        "roles": ["PM", "DEV", "REVIEWER", "TESTER", "MEMO"],
        "loops": {
            "DEV-REVIEWER": {"max_retries": 3, "condition": "REVIEWER.verdict == PASS"},
            "DEV-TESTER": {"max_retries": 2, "condition": "TESTER.verdict == PASS"}
        },
        "conditional_roles": {
            "TESTER": "after REVIEWER.verdict == PASS",
            "MEMO": "after all loops complete"
        }
    },
    
    "enterprise": {
        "name": "企业级开发流程",
        "description": "完整的软件开发生命周期",
        "roles": ["PM", "ARCHITECT", "UX", "DEV", "REVIEWER", "TESTER", "SECURITY", "OPTIMIZER", "WRITER", "MEMO"],
        "sequence": [
            "PM",           # 需求分析
            "ARCHITECT",    # 架构设计
            "UX",           # 交互设计
            "DEV",          # 开发实现
            ["REVIEWER", "TESTER", "SECURITY"],  # 并行审查（代码+测试+安全）
            "OPTIMIZER",    # 性能优化
            "WRITER",       # 文档编写
            "MEMO"          # 项目总结
        ],
        "loops": {
            "DEV-REVIEWER": {"max_retries": 3, "condition": "REVIEWER.verdict == PASS"},
            "DEV-TESTER": {"max_retries": 2, "condition": "TESTER.verdict == PASS"},
            "DEV-SECURITY": {"max_retries": 2, "condition": "SECURITY.verdict == SECURE"}
        },
        "parallel_groups": {
            "review_phase": ["REVIEWER", "TESTER", "SECURITY"]
        }
    },
    
    "security_first": {
        "name": "安全优先流程",
        "description": "适合安全关键型项目",
        "roles": ["PM", "ARCHITECT", "SECURITY", "DEV", "REVIEWER", "TESTER", "MEMO"],
        "sequence": [
            "PM",
            "ARCHITECT",
            "SECURITY",     # 早期安全介入
            "DEV",
            ["REVIEWER", "TESTER", "SECURITY"],  # 再次安全审查
            "MEMO"
        ],
        "loops": {
            "ARCHITECT-SECURITY": {"max_retries": 2, "condition": "SECURITY.verdict == SECURE"},
            "DEV-REVIEWER": {"max_retries": 3, "condition": "REVIEWER.verdict == PASS"},
            "DEV-SECURITY": {"max_retries": 3, "condition": "SECURITY.verdict == SECURE"}
        }
    },
    
    "mvp_fast": {
        "name": "MVP快速迭代",
        "description": "精简流程，快速验证想法",
        "roles": ["PM", "DEV", "REVIEWER"],
        "sequence": ["PM", "DEV", "REVIEWER"],
        "loops": {
            "DEV-REVIEWER": {"max_retries": 1, "condition": "REVIEWER.verdict == PASS"}
        },
        "skip_if_pass": True  # 如果一轮通过，直接结束
    },
    
    "docs_driven": {
        "name": "文档驱动开发",
        "description": "先写文档，再开发",
        "roles": ["PM", "WRITER", "ARCHITECT", "DEV", "REVIEWER", "TESTER", "MEMO"],
        "sequence": [
            "PM",
            "WRITER",       # 先写API文档
            "ARCHITECT",
            "DEV",          # 按文档开发
            "REVIEWER",     # 检查是否符合文档
            "TESTER",
            "MEMO"
        ],
        "loops": {
            "DEV-REVIEWER": {"max_retries": 3, "condition": "REVIEWER.verdict == PASS and matches docs"}
        }
    }
}


# ============== 角色组合建议 ==============

ROLE_COMBINATIONS = {
    "web_app": {
        "name": "Web应用开发",
        "recommended": ["PM", "ARCHITECT", "UX", "DEV", "REVIEWER", "TESTER", "SECURITY", "DEVOPS", "WRITER"],
        "workflow": "enterprise"
    },
    "api_service": {
        "name": "API服务开发",
        "recommended": ["PM", "ARCHITECT", "DEV", "REVIEWER", "TESTER", "SECURITY", "WRITER"],
        "workflow": "quad_with_tests"
    },
    "mobile_app": {
        "name": "移动应用开发",
        "recommended": ["PM", "UX", "ARCHITECT", "DEV", "REVIEWER", "TESTER", "OPTIMIZER"],
        "workflow": "enterprise"
    },
    "data_pipeline": {
        "name": "数据管道/ETL",
        "recommended": ["PM", "ARCHITECT", "DEV", "REVIEWER", "OPTIMIZER", "TESTER", "DEVOPS"],
        "workflow": "quad_with_tests"
    },
    "security_tool": {
        "name": "安全工具/加密服务",
        "recommended": ["PM", "SECURITY", "ARCHITECT", "DEV", "REVIEWER", "TESTER", "SECURITY"],
        "workflow": "security_first"
    },
    "hackathon": {
        "name": "黑客马拉松/原型",
        "recommended": ["PM", "DEV", "REVIEWER"],
        "workflow": "mvp_fast"
    }
}


# ============== 导出函数 ==============

def list_roles() -> Dict:
    """列出所有可用角色"""
    return {
        role_id: {
            "name": info["name"],
            "emoji": info["emoji"],
            "description": info["description"]
        }
        for role_id, info in EXTENDED_ROLES.items()
    }


def list_workflows() -> Dict:
    """列出所有预设工作流"""
    return {
        wf_id: {
            "name": info["name"],
            "description": info["description"],
            "roles": info["roles"]
        }
        for wf_id, info in WORKFLOWS.items()
    }


def get_role_prompt(role_id: str) -> Optional[str]:
    """获取角色的 system prompt"""
    role = EXTENDED_ROLES.get(role_id)
    return role["system_prompt"] if role else None


def suggest_workflow(project_type: str) -> Optional[Dict]:
    """根据项目类型推荐工作流"""
    combo = ROLE_COMBINATIONS.get(project_type)
    if combo:
        workflow = WORKFLOWS.get(combo["workflow"])
        return {
            "project_type": combo["name"],
            "recommended_roles": combo["recommended"],
            "workflow": workflow
        }
    return None


# ============== 快速使用示例 ==============

if __name__ == "__main__":
    print("=" * 60)
    print("🤖 扩展智能体团队系统")
    print("=" * 60)
    
    print("\n📋 可用角色:")
    for role_id, info in list_roles().items():
        print(f"  {info['emoji']} {role_id:12} - {info['description']}")
    
    print("\n🔄 预设工作流:")
    for wf_id, info in list_workflows().items():
        print(f"  • {info['name']}")
        print(f"    角色: {', '.join(info['roles'])}")
        print(f"    说明: {info['description']}")
        print()
    
    print("\n💡 项目类型推荐:")
    for pt_id, combo in ROLE_COMBINATIONS.items():
        print(f"  • {combo['name']}: {', '.join(combo['recommended'])}")
