---
name: quad-brain
description: 四脑协同代码开发系统。PM→DEV↔REVIEWER(循环迭代)→MEMO 的闭环协作流程，用于生成高质量代码。当用户需要编写代码、进行代码审查、或需要多角色协作编程时激活此技能。
---

# 🤖 Quad Brain - 四脑协同系统

四角色协作编程工作流：产品经理分析 → 工程师编码 → 审计员审查(失败则重写) → 记录员总结

## 何时使用

- 编写复杂代码或函数
- 需要多轮迭代优化代码
- 希望有独立角色审查代码质量
- 生成规范的技术文档

## 快速使用

直接告诉我要用四脑协作写代码：

> "用四脑协作写一个 Python 爬虫"

我会自动运行完整流程。

## 工作流程

```
用户任务
    ↓
📝 PM (产品经理) - 分析需求，输出 PRD
    ↓
💻 DEV (工程师) - 根据 PRD 编写代码
    ↓
🔍 REVIEWER (审计员) - 审查代码
    ├─ 如果 FAIL → 反馈给 DEV 重写（循环，最多 max_retries 次）
    └─ 如果 PASS → 继续
    ↓
📋 MEMO (记录员) - 生成执行摘要
    ↓
输出结果
```

## 手动调用（高级）

如果需要更精细控制，可以分阶段调用：

### 1. PM 阶段 - 需求分析

```python
sessions_spawn(
    label="quad-brain-pm",
    task="你是资深产品经理（PM）。将用户需求转化为详细的技术规格说明书(PRD)。\n\n用户需求: [用户输入]"
)
```

### 2. DEV 阶段 - 编码

```python
sessions_spawn(
    label="quad-brain-dev", 
    task="你是全栈工程师（DEV）。根据 PRD 编写核心代码。\n\nPRD: [PM输出]"
)
```

### 3. REVIEWER 阶段 - 审查

```python
sessions_spawn(
    label="quad-brain-reviewer",
    task="你是极其严格的代码审计员（REVIEWER）。审查以下代码。\n\n代码: [DEV输出]\n\n输出格式:\n1. 列出问题（按严重程度）\n2. 给出修复代码\n3. 最后一行必须是: **VERDICT: PASS** 或 **VERDICT: FAIL**"
)
```

**检查审查结果：**
- 如果输出包含 `**VERDICT: PASS**` → 进入 MEMO 阶段
- 如果输出包含 `**VERDICT: FAIL**` 且未达最大重试次数 → 返回 DEV 阶段，携带审查意见

### 4. MEMO 阶段 - 总结

```python
sessions_spawn(
    label="quad-brain-memo",
    task="你是会议记录员（MEMO）。总结整个协作过程。\n\n原始需求: [用户输入]\nPRD: [PM输出]\n代码: [DEV输出]\n审查: [REVIEWER输出]"
)
```

## 参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| max_retries | 最大重写次数 | 1 |
| verbose | 显示详细信息 | false |

## 输出

- 完整的代码文件（保存到 workspace）
- PRD 文档
- 审查报告
- 执行摘要

## 示例

### 示例 1：简单任务

**用户：** 用四脑协作写一个斐波那契函数

**结果：** 经过 1 轮迭代，生成完整代码，审查 PASS

### 示例 2：复杂任务（多轮迭代）

**用户：** 用四脑协作写一个 Web 爬虫，max_retries=3

**可能结果：**
- 第 1 轮：REVIEWER 发现异常处理问题 → FAIL → DEV 重写
- 第 2 轮：REVIEWER 发现性能问题 → FAIL → DEV 重写  
- 第 3 轮：REVIEWER 通过 → MEMO 总结

## 脚本参考

`scripts/quad_brain.py` - 提供工作流程指引和人格提示词

运行方式：
```bash
python3 scripts/quad_brain.py "任务描述" --max-retries 2
```

## 注意事项

1. 每阶段会启动独立的子智能体会话
2. 审查阶段会严格检查代码质量
3. 如果多次审查失败，会保留最后一次代码并生成警告摘要
4. 生成的代码保存在 `/root/.openclaw/workspace/` 目录
