# Extended Agentic Team - 扩展智能体团队

## 🎭 可用角色（10个）

### 核心四脑
| 角色 | 图标 | 职责 | 触发条件 |
|------|------|------|----------|
| PM | 📝 | 需求分析、PRD | 项目启动 |
| DEV | 💻 | 代码实现 | PRD完成后 |
| REVIEWER | 🔍 | 代码审查 | 代码完成后 |
| MEMO | 📋 | 项目总结 | 全部完成后 |

### 扩展角色
| 角色 | 图标 | 职责 | 最佳使用场景 |
|------|------|------|--------------|
| **TESTER** | 🧪 | 测试用例、自动化测试 | 代码审查通过后 |
| **ARCHITECT** | 🏗️ | 系统架构、技术选型 | 需求分析后，开发前 |
| **SECURITY** | 🛡️ | 安全审计、漏洞扫描 | 架构设计后、代码审查时 |
| **OPTIMIZER** | ⚡ | 性能优化、算法改进 | 功能完成后 |
| **WRITER** | 📚 | 技术文档、API文档 | 开发完成后 |
| **UX** | 🎨 | 交互设计、用户体验 | 架构设计后 |
| **DEVOPS** | 🚀 | CI/CD、部署、运维 | 开发完成后 |

---

## 🔄 预设工作流

### 1️⃣ 四脑基础版 (quad_basic)
```
PM → DEV ↔ REVIEWER (循环3次) → MEMO
            ↓ FAIL
            └──── 重写代码
            ↓ PASS
          MEMO
```
**适合**：简单脚本、工具函数

---

### 2️⃣ 四脑+测试版 (quad_with_tests)
```
PM → DEV ↔ REVIEWER (循环3次) → TESTER → MEMO
            ↓ FAIL                    ↓ FAIL
            └──── 重写                └──── 修复bug
            ↓ PASS                    ↓ PASS
          TESTER                    MEMO
```
**适合**：核心模块、业务逻辑

---

### 3️⃣ 企业级开发流程 (enterprise)
```
PM → ARCHITECT → UX → DEV → [REVIEWER + TESTER + SECURITY] → OPTIMIZER → WRITER → DEVOPS → MEMO
                                    ↓ 并行审查
                              任何失败 → 返回DEV
                                    ↓ 全部通过
                              OPTIMIZER (性能优化)
```
**适合**：完整产品、企业级项目

---

### 4️⃣ 安全优先流程 (security_first)
```
PM → ARCHITECT → SECURITY → DEV → [REVIEWER + TESTER + SECURITY] → MEMO
              ↓ FAIL                          ↓ 再次安全审查
              └──── 修改架构                  ↓ 不通过
                                              └──── 返回DEV
```
**适合**：金融系统、加密服务、安全工具

---

### 5️⃣ MVP快速迭代 (mvp_fast)
```
PM → DEV → REVIEWER
            ↓ FAIL (仅1次重试)
            └──── 快速修复
            ↓ PASS
          [结束]
```
**适合**：原型验证、黑客马拉松

---

### 6️⃣ 文档驱动开发 (docs_driven)
```
PM → WRITER → ARCHITECT → DEV → REVIEWER → TESTER → MEMO
      (API文档)              (按文档实现)   (检查符合文档)
```
**适合**：开源项目、SDK开发

---

## 💡 项目类型推荐

| 项目类型 | 推荐角色 | 工作流 |
|----------|----------|--------|
| Web应用 | PM, ARCHITECT, UX, DEV, REVIEWER, TESTER, SECURITY, DEVOPS, WRITER | enterprise |
| API服务 | PM, ARCHITECT, DEV, REVIEWER, TESTER, SECURITY, WRITER | quad_with_tests |
| 移动应用 | PM, UX, ARCHITECT, DEV, REVIEWER, TESTER, OPTIMIZER | enterprise |
| 数据管道 | PM, ARCHITECT, DEV, REVIEWER, OPTIMIZER, TESTER, DEVOPS | quad_with_tests |
| 安全工具 | PM, SECURITY, ARCHITECT, DEV, REVIEWER, TESTER | security_first |
| 原型/MVP | PM, DEV, REVIEWER | mvp_fast |

---

## 🛠️ 使用方法

### 方式一：命令行选择工作流
```bash
# 使用预设工作流
python3 quad_brain_extended.py --workflow enterprise "开发一个电商平台"

# 使用MVP快速模式
python3 quad_brain_extended.py --workflow mvp_fast "写个TODO列表"

# 自定义角色组合
python3 quad_brain_extended.py --roles PM,DEV,TESTER,MEMO "写个计算器"
```

### 方式二：Python API
```python
from extended_roles import WORKFLOWS, suggest_workflow

# 获取推荐工作流
workflow = suggest_workflow("web_app")
print(workflow["recommended_roles"])
# ['PM', 'ARCHITECT', 'UX', 'DEV', 'REVIEWER', 'TESTER', 'SECURITY', 'DEVOPS', 'WRITER']
```

### 方式三：自定义工作流配置
```yaml
# my_workflow.yaml
name: "我的自定义流程"
roles:
  - PM
  - ARCHITECT
  - DEV
  - SECURITY
  - REVIEWER
  - MEMO

sequence:
  - PM
  - ARCHITECT
  - DEV
  - [SECURITY, REVIEWER]  # 并行审查
  - MEMO

loops:
  DEV-SECURITY:
    max_retries: 2
    condition: "SECURITY.verdict == SECURE"
  DEV-REVIEWER:
    max_retries: 2
    condition: "REVIEWER.verdict == PASS"
```

---

## 🔧 角色配置示例

### Discord Webhook 配置 (.env)
```bash
# 基础四脑
WEBHOOK_PM=https://discord.com/api/webhooks/xxx
WEBHOOK_DEV=https://discord.com/api/webhooks/xxx
WEBHOOK_REVIEWER=https://discord.com/api/webhooks/xxx
WEBHOOK_MEMO=https://discord.com/api/webhooks/xxx

# 扩展角色
WEBHOOK_TESTER=https://discord.com/api/webhooks/xxx
WEBHOOK_ARCHITECT=https://discord.com/api/webhooks/xxx
WEBHOOK_SECURITY=https://discord.com/api/webhooks/xxx
WEBHOOK_OPTIMIZER=https://discord.com/api/webhooks/xxx
WEBHOOK_WRITER=https://discord.com/api/webhooks/xxx
WEBHOOK_UX=https://discord.com/api/webhooks/xxx
WEBHOOK_DEVOPS=https://discord.com/api/webhooks/xxx
```

---

## 📊 角色能力矩阵

| 能力维度 | PM | DEV | REVIEWER | MEMO | TESTER | ARCHITECT | SECURITY | OPTIMIZER | WRITER | UX | DEVOPS |
|----------|:--:|:---:|:--------:|:----:|:------:|:---------:|:--------:|:---------:|:------:|:--:|:------:|
| 需求分析 | ⭐⭐⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐⭐ | ⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ |
| 代码实现 | ⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐ | ⭐ | ⭐ | ⭐ |
| 质量审查 | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐ |
| 测试覆盖 | ⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ |
| 架构设计 | ⭐⭐ | ⭐⭐ | ⭐ | ⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| 安全审计 | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐ | ⭐ | ⭐⭐ |
| 性能优化 | ⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐ | ⭐ | ⭐⭐ |
| 文档编写 | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| 用户体验 | ⭐⭐⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ |
| 部署运维 | ⭐ | ⭐⭐ | ⭐ | ⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐⭐⭐ |

---

## 🎯 快速开始

```bash
# 1. 查看所有角色
python3 extended_roles.py

# 2. 测试企业级流程
python3 quad_brain_extended.py \
  --workflow enterprise \
  --discord \
  "开发一个用户认证系统"

# 3. 仅使用特定角色
python3 quad_brain_extended.py \
  --roles PM,DEV,SECURITY,REVIEWER \
  "写个加密工具"
```

---

## 🤝 贡献新角色

想添加新角色？在 `extended_roles.py` 中添加：

```python
"DATA_SCIENTIST": {
    "name": "📊 DATA_SCIENTIST·数据科学家",
    "emoji": "📊",
    "description": "数据分析、模型训练、特征工程",
    "system_prompt": "你是数据科学家..."
}
```

---

*Made with 🧠 by Extended Agentic Team*
