#!/bin/bash
# 消息发送自检脚本
# 在发送任何消息前执行检查

MESSAGE_CONTENT="$1"
RECIPIENT="$2"

# 禁止关键词检查
FORBIDDEN_KEYWORDS=("京东" "淘宝" "拼多多" "促销" "优惠" "折扣")

for keyword in "${FORBIDDEN_KEYWORDS[@]}"; do
    if echo "$MESSAGE_CONTENT" | grep -q "$keyword"; then
        echo "🚫 拦截: 消息包含禁止关键词 '$keyword'"
        echo "时间: $(date)"
        echo "接收者: $RECIPIENT"
        echo "内容: $MESSAGE_CONTENT"
        echo "---" >> /root/.openclaw/workspace/logs/blocked-messages.log
        exit 1
    fi
done

exit 0
