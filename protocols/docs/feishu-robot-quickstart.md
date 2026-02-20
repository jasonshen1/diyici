# 创建飞书机器人步骤

## 1. 进入飞书开放平台
打开 https://open.feishu.cn/app

## 2. 创建应用
点击「创建应用」 → 「企业自建应用」
- 应用名称：热点猎手
- 应用描述：AI驱动的热点追踪助手
- 点击「创建」

## 3. 获取凭证
进入应用详情页 → 「凭证与基础信息」
复制以下信息：
- App ID: cli_xxxxxxxxxxxx
- App Secret: xxxxxxxxxxxxxxxxx

## 4. 启用机器人
左侧菜单 → 「机器人」 → 打开「启用机器人」
- 机器人名称：热点猎手
- 机器人头像：上传Logo

## 5. 添加到群聊
1. 进入目标群聊
2. 点击群设置 → 「群机器人」→「添加机器人」
3. 搜索「热点猎手」
4. 点击添加

## 6. 获取Webhook地址
在群里 @热点猎手，发送任意消息
或在机器人管理页面找到 Webhook URL

格式：
https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

## 7. 测试推送
使用以下curl命令测试：

curl -X POST https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_WEBHOOK \
  -H "Content-Type: application/json" \
  -d '{
    "msg_type": "text",
    "content": {
      "text": "Hello 飞书！"
    }
  }'

成功后会收到消息。

## 8. 配置到OpenClaw
将Webhook地址填入配置文件的 feishu.webhooks 部分。
