# 飞书机器人配置指南

## 1. 获取飞书凭证

创建应用后，在「凭证与基础信息」页面获取：

```
App ID: cli_xxxxxxxxxx
App Secret: xxxxxxxxxxx
```

## 2. 配置OpenClaw

编辑 `~/.openclaw/config.yaml`:

```yaml
# 飞书配置
feishu:
  enabled: true
  app_id: "YOUR_APP_ID"
  app_secret: "YOUR_APP_SECRET"
  encrypt_key: ""  # 可选，用于消息加密
  verification_token: ""  # 可选
  
  # 推送配置
  default_channel: "hot-topic-reports"  # 默认推送群
  
  # 群组Webhook（用于单向推送）
  webhooks:
    hot-topic-reports:
      url: "https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxx"
      secret: ""  # 可选，用于签名验证
```

## 3. 创建推送脚本

```python
#!/usr/bin/env python3
"""
热点猎手 - 飞书推送脚本
"""

import json
import requests
from datetime import datetime

def push_to_feishu(webhook_url: str, report_file: str):
    """推送报告到飞书群"""
    
    # 读取报告
    with open(report_file, 'r', encoding='utf-8') as f:
        report = json.load(f)
    
    # 构建消息
    title = f"📊 {datetime.now().strftime('%m月%d日')} 热点追踪报告"
    
    # 取TOP 5热点
    top5 = report[:5]
    content = "\n".join([
        f"{i+1}. [{t['category']}] {t['title'][:30]}..."
        for i, t in enumerate(top5)
    ])
    
    # 发送富文本消息
    message = {
        "msg_type": "interactive",
        "card": {
            "config": {
                "wide_screen_mode": True
            },
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": title
                },
                "template": "blue"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": content
                    }
                },
                {
                    "tag": "action",
                    "actions": [
                        {
                            "tag": "button",
                            "text": {
                                "tag": "plain_text",
                                "content": "查看完整报告"
                            },
                            "type": "primary",
                            "url": "https://your-report-link.com"
                        }
                    ]
                }
            ]
        }
    }
    
    # 发送
    response = requests.post(
        webhook_url,
        headers={"Content-Type": "application/json"},
        json=message
    )
    
    if response.status_code == 200:
        print("✅ 推送成功")
    else:
        print(f"❌ 推送失败: {response.text}")


if __name__ == "__main__":
    import sys
    
    # 用法: python push_feishu.py <report.json>
    if len(sys.argv) > 1:
        report_file = sys.argv[1]
    else:
        # 自动找最新报告
        import glob
        files = sorted(glob.glob("reports/*.json"), reverse=True)
        report_file = files[0] if files else None
    
    if report_file:
        webhook = "https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_WEBHOOK_TOKEN"
        push_to_feishu(webhook, report_file)
    else:
        print("❌ 未找到报告文件")
```

## 4. 设置定时任务

```bash
# 每天早上8点运行并推送
openclaw cron add \
  --name "热点猎手-推送" \
  --cron "0 8 * * *" \
  --tz "Asia/Shanghai" \
  --session isolated \
  --message "bash /path/to/run_and_push.sh" \
  --deliver \
  --channel feishu \
  --to "your-group-id"
```

## 5. 测试

```bash
# 手动测试推送
python3 push_feishu.py reports/final_topics_20260215.json
```

## 常见问题

### Q: 消息发不出去？
- 检查Webhook URL是否正确
- 检查机器人是否在群里
- 检查网络连通性

### Q: 如何@所有人？
- 飞书Bot不支持@所有人
- 可以使用「全员推送」API（需申请权限）

### Q: 如何回复用户消息？
- 需要部署HTTP服务器接收回调
- 或使用方案B（自建应用）
