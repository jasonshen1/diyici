# Telegram Bot 配置步骤

## 1. 创建 Bot
1. Telegram 搜索 @BotFather
2. 发送 /newbot
3. 设置名称和用户名
4. 保存 Token

## 2. 配置 OpenClaw
运行以下命令：

```bash
openclaw configure
```

选择 channels → telegram → 启用

或者在 ~/.openclaw/openclaw.json 中添加：

```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "你的BotToken",
      "requireMention": false
    }
  }
}
```

## 3. 重启 Gateway

```bash
openclaw gateway restart
```

## 4. 开始对话
在 Telegram 中搜索你的 Bot，开始对话即可！

## 优势对比

| 功能 | QQ | Telegram |
|------|-----|----------|
| 消息长度 | 限制 | 无限制 |
| Markdown | ❌ | ✅ |
| 图片 | 需特殊格式 | 原生支持 |
| 文件 | 受限 | 2GB |
| 按钮 | ❌ | ✅ |
| 群组 | 基础 | 强大 |

## 注意事项

1. Telegram 在国内需要科学上网
2. 可以保留 QQ Bot 作为备用
3. 配置文件可以同时启用多个平台
