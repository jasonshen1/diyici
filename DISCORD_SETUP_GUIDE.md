# Discord 集成配置指南

## 🎯 目标
让四脑（或扩展的10个角色）在 Discord 频道中以不同身份"对话"。

---

## 步骤 1：创建 Discord Webhooks

### 1.1 进入 Webhook 设置
1. 在 Discord 中，右键点击你想让四脑对话的频道
2. 选择 **"服务器设置"** → **"集成"** → **"Webhooks"**
3. 点击 **"新 Webhook"** 按钮

### 1.2 为每个角色创建 Webhook

| 角色 | 建议名称 | 建议头像 | 用途 |
|------|----------|----------|------|
| PM | 📝 PM·产品经理 | 文档/规划图标 | 输出需求分析 |
| DEV | 💻 DEV·工程师 | 代码/终端图标 | 输出代码实现 |
| REVIEWER | 🔍 REVIEWER·审计员 | 放大镜/检查图标 | 输出审查意见 |
| MEMO | 📋 MEMO·记录员 | 笔记本/归档图标 | 输出项目总结 |
| TESTER | 🧪 TESTER·测试员 | 实验室/试管图标 | 输出测试用例 |
| ARCHITECT | 🏗️ ARCHITECT·架构师 | 建筑/蓝图图标 | 输出架构设计 |
| SECURITY | 🛡️ SECURITY·安全专家 | 盾牌/锁图标 | 输出安全审计 |
| OPTIMIZER | ⚡ OPTIMIZER·优化师 | 闪电/火箭图标 | 输出性能优化 |
| WRITER | 📚 WRITER·文档工程师 | 书本/笔图标 | 输出技术文档 |
| UX | 🎨 UX·交互设计师 | 调色板/设计图标 | 输出交互设计 |
| DEVOPS | 🚀 DEVOPS·运维工程师 | 火箭/服务器图标 | 输出部署方案 |

### 1.3 获取 Webhook URL
每个 Webhook 创建后：
1. 点击 **"复制 Webhook URL"**
2. 保存到安全的地方（格式：`https://discord.com/api/webhooks/数字/字符串`）

---

## 步骤 2：配置环境变量

### 方式 A：使用配置助手（推荐）
```bash
cd /root/.openclaw/workspace
chmod +x setup_discord.sh
./setup_discord.sh
```
按提示输入每个 Webhook URL 即可。

### 方式 B：手动编辑 .env 文件
```bash
cp quad_brain.env.example .env
nano .env
```

填入以下内容：
```bash
# Discord Webhooks（基础四脑）
WEBHOOK_PM=https://discord.com/api/webhooks/你的PM_URL
WEBHOOK_DEV=https://discord.com/api/webhooks/你的DEV_URL
WEBHOOK_REVIEWER=https://discord.com/api/webhooks/你的REVIEWER_URL
WEBHOOK_MEMO=https://discord.com/api/webhooks/你的MEMO_URL

# 扩展角色（可选）
WEBHOOK_TESTER=https://discord.com/api/webhooks/你的TESTER_URL
WEBHOOK_ARCHITECT=https://discord.com/api/webhooks/你的ARCHITECT_URL
# ... 其他角色

# OpenClaw 配置
OPENCLAW_URL=http://localhost:18789
OPENCLAW_TOKEN=你的Gateway_Token
QUAD_MODEL=kimi-coding/k2p5
```

---

## 步骤 3：获取 OpenClaw Token

### 方法 1：通过命令行
```bash
openclaw gateway config.get | grep token
```

### 方法 2：查看配置文件
```bash
cat ~/.openclaw/openclaw.json | grep -A2 '"token"'
```

复制 `token` 字段的值，填入 `.env` 的 `OPENCLAW_TOKEN`。

---

## 步骤 4：测试配置

### 4.1 测试 Discord Webhook
```bash
# 发送测试消息到 PM Webhook
curl -X POST -H "Content-Type: application/json" \
  -d '{"content":"🎉 PM Webhook 测试成功！","username":"📝 PM·产品经理"}' \
  https://discord.com/api/webhooks/你的PM_URL
```

如果频道收到消息，说明配置正确。

### 4.2 测试四脑系统
```bash
# 基础测试（控制台输出）
python3 quad_brain_extended.py --list-roles

# Discord 集成测试
python3 quad_brain_extended.py "写个Hello World" --workflow quad_basic --discord
```

---

## 步骤 5：使用四脑协作

### 基础用法
```bash
# 使用基础四脑流程
python3 quad_brain_extended.py "开发一个用户登录系统" --discord

# 使用特定工作流
python3 quad_brain_extended.py "写个爬虫" --workflow quad_with_tests --discord

# 使用企业级流程（10角色）
python3 quad_brain_extended.py "开发电商平台" --workflow enterprise --discord
```

### 预期效果
Discord 频道中会依次出现：

> **📝 PM·产品经理**  
> [需求分析] ...

> **💻 DEV·工程师**  
> [代码实现] ...

> **🔍 REVIEWER·审计员**  
> [代码审查] ...  
> **VERDICT: PASS**

> **📋 MEMO·记录员**  
> [项目总结] ...

---

## 故障排除

### 问题 1：Webhook 发送失败
**症状**：控制台显示 "⚠️ Discord 发送失败"

**解决**：
1. 检查 Webhook URL 是否完整
2. 检查 URL 是否包含空格或换行
3. 测试：`curl` 直接发送消息验证

### 问题 2：OpenClaw API 连接失败
**症状**：显示 "❌ 无法连接到 OpenClaw"

**解决**：
1. 检查 OpenClaw 是否运行：`openclaw gateway status`
2. 检查 URL 和 Token 是否正确
3. 检查防火墙/网络

### 问题 3：角色消息不显示
**症状**：只有部分角色在 Discord 显示

**解决**：
1. 检查 `.env` 中对应角色的 Webhook 是否配置
2. 检查 Webhook 是否被删除或重置

---

## 高级配置

### 自定义头像 URL
如果不想手动上传头像，可以使用在线图标：
```bash
# 在 extended_roles.py 中修改
"PM": {
    "name": "📝 PM·产品经理",
    "avatar": "https://cdn-icons-png.flaticon.com/512/2910/2910791.png",
    ...
}
```

### 限制特定频道
在 `quad_brain_extended.py` 中添加频道白名单：
```python
ALLOWED_CHANNELS = ["1473276592053817457"]  # 你的频道ID

def check_channel(channel_id):
    return channel_id in ALLOWED_CHANNELS
```

### 速率限制保护
防止过多消息触发 Discord 限制：
```python
import time

# 在发送消息之间添加延迟
time.sleep(1)  # 每秒最多1条
```

---

## 下一步

配置完成后，可以尝试：

1. **自定义工作流** - 编辑 `extended_roles.py` 添加你自己的流程
2. **添加新角色** - 比如 DATA_SCIENTIST、ML_ENGINEER
3. **集成到现有 Bot** - 将四脑作为指令集成到你现有的 Discord Bot

有问题随时问我！
