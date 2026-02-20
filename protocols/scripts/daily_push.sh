#!/bin/bash
# 每日热点推送脚本

cd /root/.openclaw/workspace/protocols

# 1. 运行热点采集
echo "[$(date)] 开始采集热点..." >> /tmp/hot_topic.log
python3 hot_topic_hunter_final.py >> /tmp/hot_topic.log 2>&1

# 2. 推送到飞书
echo "[$(date)] 推送到飞书..." >> /tmp/hot_topic.log
python3 scripts/push_feishu.py >> /tmp/hot_topic.log 2>&1

echo "[$(date)] 完成" >> /tmp/hot_topic.log
