# 🧠 Quad Brain 四脑协同系统

> PM → DEV → REVIEWER → MEMO 流水线式协作

## 快速开始

### 1. 配置环境

```bash
cd /root/.openclaw/workspace
cp quad_brain.env.example .env
nano .env  # 填入你的配置
```

### 2. 安装依赖

```bash
pip install requests
```

### 3. 运行

**交互模式**（推荐）:
```bash
python3 quad_brain.py
```

**单次任务**:
```bash
python3 quad_brain.py "开发一个用户登录系统"
```

**指定模型**:
```bash
python3 quad_brain.py "写个爬虫" --model deepseek/deepseek-chat
```

## 使用示例

### 交互模式

```
🎯 任务> 开发一个个人博客系统

🚀 四脑协同流水线启动
   任务: 开发一个个人博客系统
   模型: kimi-coding/k2p5

📝 阶段 1/4: PM 分析需求...
  ✅ 已发送至 Discord (PM)

💻 阶段 2/4: DEV 编写代码...
  ✅ 已发送至 Discord (DEV)

🔍 阶段 3/4: REVIEWER 审查代码...
  ✅ 已发送至 Discord (REVIEWER)

📋 阶段 4/4: MEMO 生成日报...
  ✅ 已发送至 Discord (MEMO)

✅ 四脑协同完成！
   总耗时: 45.2秒
   总 Token: 3,456
   报告已保存: quad_brain_report_20250219_105030.md
```

### Discord 效果

频道中会出现：

> **📝 PM·产品经理**  
> **[需求分析]**  
> 1. 需求背景: 个人博客系统...  
> 2. 功能列表: ...

> **💻 DEV·工程师**  
> **[代码实现]**  
> ```python  
> class BlogSystem:  
>     ...  
> ```

> **🔍 REVIEWER·审计员**  
> **[代码审查]**  
> 🔴 发现 SQL 注入漏洞...  
> 🟡 建议添加索引优化...

> **📋 MEMO·记录员**  
> **[执行摘要]**  
> 📌 下一步: ...

## 架构说明

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│   PM    │────→│   DEV   │────→│ REVIEWER│────→│  MEMO   │
│  分析需求 │     │  编写代码 │     │  审查代码 │     │  生成日报 │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
     └───────────────┴───────────────┴───────────────┘
                     │
            ┌────────┴────────┐
            │  Discord 频道   │
            │ (4个 Webhook)  │
            └─────────────────┘
```

**上下文传递**:
- DEV 能看到 PM 的 PRD
- REVIEWER 能看到 PM 的 PRD + DEV 的代码
- MEMO 能看到所有人的输出

## 配置说明

### 必需配置

| 变量 | 说明 | 获取方式 |
|------|------|----------|
| `OPENCLAW_TOKEN` | Gateway 认证 Token | `openclaw gateway config.get` |

### 可选配置

| 变量 | 说明 | 默认 |
|------|------|------|
| `OPENCLAW_URL` | Gateway 地址 | `http://localhost:18789` |
| `QUAD_MODEL` | 使用模型 | `kimi-coding/k2p5` |
| `WEBHOOK_*` | Discord Webhooks | 空（仅控制台输出）|

## 高级用法

### 自定义人格

编辑 `quad_brain.py` 中的 `PERSONAS` 字典：

```python
PERSONAS = {
    "PM": """你的人设...""",
    "DEV": """你的人设...""",
    # ...
}
```

### 集成到其他系统

```python
from quad_brain import QuadBrainSystem

system = QuadBrainSystem()
result = system.run_pipeline("你的任务")
print(result.memo_output.content)
```

## 故障排除

| 问题 | 解决 |
|------|------|
| 连接失败 | 检查 `OPENCLAW_URL` 和 OpenClaw 是否运行 |
| 认证失败 | 设置正确的 `OPENCLAW_TOKEN` |
| Discord 不显示 | 检查 Webhook URL 是否正确 |
| 内容被截断 | Discord 单条消息限制 2000 字符，超长会自动截断 |

## 文件说明

| 文件 | 说明 |
|------|------|
| `quad_brain.py` | 主程序 |
| `quad_brain.env.example` | 配置模板 |
| `README_QuadBrain.md` | 本文档 |
| `quad_brain_report_*.md` | 自动生成的报告 |
