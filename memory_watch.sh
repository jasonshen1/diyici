#!/bin/bash
# OpenClaw 内存监控脚本
# 当内存使用超过 80% 时自动重启

MEM_USAGE=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
MEM_INT=${MEM_USAGE%.*}

if [ "$MEM_INT" -gt 80 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - 内存使用 ${MEM_USAGE}%，超过 80%，准备重启 OpenClaw" >> /var/log/openclaw-monitor.log
    
    # 发送预警消息（如果配置了 QQ）
    # curl -X POST ... （可选）
    
    # 重启 Gateway
    pkill -f "openclaw-gateway"
    sleep 5
    nohup openclaw gateway > /tmp/gateway.log 2>&1 &
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') - OpenClaw 已重启" >> /var/log/openclaw-monitor.log
fi
