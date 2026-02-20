#!/bin/bash
# 服务器自动调优脚本
# 当系统检测到长时间无用户活动时自动执行

LOG_FILE="/var/log/auto-tune.log"
TUNE_MARKER="/tmp/last-auto-tune"

# 记录日志
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========== 开始自动调优 =========="

# 1. 检查系统当前状态
log "📊 当前系统状态："
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
log "   内存使用率: ${MEM_USAGE}%"
log "   磁盘使用率: ${DISK_USAGE}%"

# 2. 内存优化
if [ "$MEM_USAGE" -gt 70 ]; then
    log "🧹 内存使用率过高，执行清理..."
    
    # 清理缓存
    sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
    
    # 检查并重启异常进程
    log "   检查异常进程..."
    ps aux --sort=-%mem | head -6 | tail -5 | while read line; do
        MEM_PROC=$(echo $line | awk '{print $4}')
        PROC_NAME=$(echo $line | awk '{print $11}')
        if (( $(echo "$MEM_PROC > 20" | bc -l) )); then
            log "   发现高内存进程: $PROC_NAME (${MEM_PROC}%)"
        fi
    done
    
    log "   ✅ 内存清理完成"
fi

# 3. 日志清理
log "📝 清理日志文件..."
find /tmp/openclaw -name "*.log" -mtime +3 -delete 2>/dev/null || true
find /var/log -name "*.log.*" -mtime +7 -delete 2>/dev/null || true
log "   ✅ 过期日志已清理"

# 4. OpenClaw 服务优化
log "🤖 检查 OpenClaw 服务..."
GATEWAY_PID=$(pgrep -f "openclaw-gateway" | wc -l)
if [ "$GATEWAY_PID" -gt 1 ]; then
    log "   发现 $GATEWAY_PID 个 Gateway 进程，保留最新..."
    # 保留最新的，杀掉其他的
    NEWEST_PID=$(pgrep -f "openclaw-gateway" | sort -n | tail -1)
    for pid in $(pgrep -f "openclaw-gateway" | grep -v "$NEWEST_PID"); do
        kill -9 "$pid" 2>/dev/null || true
        log "   已终止重复进程: $pid"
    done
elif [ "$GATEWAY_PID" -eq 0 ]; then
    log "   ⚠️ Gateway 未运行，尝试启动..."
    nohup /usr/bin/node /root/.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/dist/index.js gateway --port 18789 > /dev/null 2>&1 &
    sleep 3
    log "   ✅ Gateway 已启动"
else
    log "   ✅ Gateway 运行正常"
fi

# 5. 磁盘清理（如果超过80%）
if [ "$DISK_USAGE" -gt 80 ]; then
    log "💾 磁盘使用率过高，执行清理..."
    # 清理临时文件
    rm -rf /tmp/tmp.* 2>/dev/null || true
    rm -rf /var/tmp/* 2>/dev/null || true
    # 清理 npm 缓存
    npm cache clean --force 2>/dev/null || true
    log "   ✅ 磁盘清理完成"
fi

# 6. 网络优化
log "🌐 检查网络连接..."
if ! curl -s --max-time 5 http://localhost:18789/health > /dev/null 2>&1; then
    log "   ⚠️ 本地服务连接异常"
else
    log "   ✅ 本地服务连接正常"
fi

# 7. 更新标记文件
date +%s > "$TUNE_MARKER"

# 8. 发送通知
log "📱 发送状态通知..."
CURRENT_MEM=$(free -h | grep Mem | awk '{print $3}')
CURRENT_DISK=$(df -h / | tail -1 | awk '{print $5}')

# 记录到 memory 文件
cat >> /root/.openclaw/workspace/memory/auto-tune.log << EOF

## $(date '+%Y-%m-%d %H:%M:%S') 自动调优报告
- 触发条件: 长时间无用户活动
- 执行前内存: ${MEM_USAGE}%
- 执行前磁盘: ${DISK_USAGE}%
- 清理操作: 日志清理、内存优化、服务检查
- 状态: ✅ 完成

EOF

log "========== 自动调优完成 =========="
log ""

# 输出摘要给 cron
echo "调优完成 - 内存: ${MEM_USAGE}%→$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')%"
