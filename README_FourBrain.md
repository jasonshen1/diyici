# 🧠 四脑协同系统 (Four-Brain Collaboration)

> 单体编排，分身投射架构实现

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    Discord 服务器                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  🧠 CEO │ │ 💻 CTO │ │ ⚙️ COO │ │ 🎨 CMO │       │
│  │ Webhook │ │ Webhook │ │ Webhook │ │ Webhook │       │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │
│       └─────────────┴─────────────┴─────────────┘        │
│                         │                               │
│              ┌──────────┴──────────┐                    │
│              │   Bot (监听指令)     │                    │
│              └──────────┬──────────┘                    │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│       你的服务器         │                               │
│  ┌──────────────────────┴──────────────────────┐        │
│  │          Python 主脑 (Orchestrator)         │        │
│  │  • 接收 Discord 消息                         │        │
│  │  • 切换 System Prompt（四脑人格）            │        │
│  │  • 调用 OpenClaw API                        │        │
│  │  • 通过 Webhook 投射回复                     │        │
│  └──────────────────────┬──────────────────────┘        │
│                         │                               │
│              ┌──────────┴──────────┐                    │
│              │   OpenClaw API       │                    │
│              │   localhost:18789    │                    │
│              └─────────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## 四脑角色定义

| 角色 | 代号 | 核心能力 | 触发指令 |
|------|------|----------|----------|
| 🧠 CEO | 战略官 | 目标设定、资源协调、决策拍板 | `!ceo <问题>` |
| 💻 CTO | 技术官 | 架构设计、技术实现、风险评估 | `!cto <问题>` |
| ⚙️ COO | 运营官 | 执行计划、流程优化、落地监督 | `!coo <问题>` |
| 🎨 CMO | 创意官 | 品牌塑造、传播策略、用户洞察 | `!cmo <问题>` |

**协同模式**: `!all <话题>` 触发四脑圆桌会议

## 快速开始

### 1. 准备工作

#### 安装依赖
```bash
cd /root/.openclaw/workspace
pip install aiohttp discord.py python-dotenv
```

#### 配置 Discord Bot
1. 访问 https://discord.com/developers/applications
2. 创建 New Application → Bot
3. 获取 **Bot Token** (DISCORD_BOT_TOKEN)
4. 开启权限: `MESSAGE CONTENT INTENT`
5. 生成邀请链接，添加到你的服务器

#### 配置 Discord Webhooks（四脑分身）
1. 在 Discord 频道 → 设置 → 集成 → Webhooks
2. 创建 4 个 Webhook，分别命名:
   - `🧠 CEO·战略官`（上传商务头像）
   - `💻 CTO·技术官`（上传极客头像）
   - `⚙️ COO·运营官`（上传效率头像）
   - `🎨 CMO·创意官`（上传创意头像）
3. 复制每个 Webhook 的 URL

#### 配置 OpenClaw Token
```bash
# 获取你的 Gateway Token
openclaw gateway config.get | grep token
```

### 2. 配置环境变量

```bash
cp four_brain_system.env.example .env
nano .env  # 编辑填入你的配置
```

### 3. 启动系统

```bash
# 方式一：直接启动
python3 four_brain_system.py

# 方式二：使用启动脚本
./start_four_brain.sh
```

## 使用示例

### 单脑咨询
```
!ceo 我们是否应该进入 AI 教育市场？
!cto 实现一个多代理系统需要什么技术栈？
!coo 如何在 3 个月内完成产品上线？
!cmo 怎么包装这个产品让它更有吸引力？
```

### 四脑协同（圆桌会议）
```
!all 我们想开发一个 AI 驱动的内容创作工具
```

**输出流程**:
1. 🧠 CEO 先定战略方向
2. 💻 CTO 评估技术可行性
3. ⚙️ COO 制定执行计划
4. 🎨 CMO 优化传播策略

## 进阶配置

### 修改人格设定
编辑 `four_brain_system.py` 中的 `BRAINS` 字典:

```python
BRAINS = {
    "ceo": {
        "name": "🧠 CEO·战略官",
        "avatar": "你的自定义头像URL",
        "system_prompt": "你的自定义人设..."
    },
    # ...
}
```

### 添加更多脑
1. 在 `BRAINS` 中添加新角色
2. 添加对应的 Webhook 配置
3. 添加对应的 `!角色` 指令

### 集成到现有 OpenClaw
如果你想让这个系统和你现有的 OpenClaw 代理协作:

```python
# 在主脑脚本中添加
async def forward_to_openclaw(self, message, brain_response):
    """将讨论结果转发给 OpenClaw 主代理"""
    # 调用 OpenClaw 的 message 工具
    pass
```

## 文件说明

| 文件 | 说明 |
|------|------|
| `four_brain_system.py` | 主脑编排脚本 |
| `four_brain_system.env.example` | 环境变量模板 |
| `start_four_brain.sh` | 启动脚本 |
| `README_FourBrain.md` | 本文档 |

## 故障排除

### Bot 无法启动
- 检查 DISCORD_BOT_TOKEN 是否正确
- 确认 Bot 已加入目标服务器
- 检查 MESSAGE CONTENT INTENT 是否开启

### Webhook 发送失败
- 检查 Webhook URL 是否完整
- 确认 Bot 有权限访问目标频道
- 查看控制台错误信息

### OpenClaw API 连接失败
- 确认 OpenClaw 运行中: `openclaw gateway status`
- 检查 OPENCLAW_TOKEN 是否正确
- 确认端口 18789 可访问

## 扩展思路

- 🔊 **语音支持**: 使用 TTS 让四脑"说话"
- 🖼️ **多模态**: 让 CMO 生成配图
- 📊 **投票系统**: 四脑投票做最终决策
- 🔄 **自动协作**: 定时触发四脑晨会
- 📝 **会议纪要**: 自动生成讨论总结

---

Made with 🧠 by OpenClaw
