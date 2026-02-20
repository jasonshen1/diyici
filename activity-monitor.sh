#!/bin/bash
# 用户活动检测脚本
# 检测用户是否长时间未活动，触发自动调优

# 配置
INACTIVITY_THRESHOLD=3600  # 1小时（秒）
ACTIVITY_LOG="/tmp/user-activity.log"
TUNE_SCRIPT="/root/.openclaw/workspace/auto-tune.sh"
LOCK_FILE="/tmp/auto-tune.lock"

# 记录当前活动
record_activity() {
    date +%s > "$ACTIVITY_LOG"
}

# 获取最后活动时间
get_last_activity() {
    if [ -f "$ACTIVITY_LOG" ]; then
        cat "$ACTIVITY_LOG"
    else
        echo "0"
    fi
}

# 检查是否正在调优
is_tuning() {
    [ -f "$LOCK_FILE" ]
}

# 主检查逻辑
check_and_tune() {
    local current_time=$(date +%s)
    local last_activity=$(get_last_activity)
    local inactive_time=$((current_time - last_activity))
    
    # 如果正在调优，跳过
    if is_tuning; then
        echo "调优正在进行中，跳过检查"
        exit 0
    fi
    
    # 如果超过阈值，执行调优
    if [ "$inactive_time" -gt "$INACTIVITY_THRESHOLD" ]; then
        echo "检测到用户已闲置 $((inactive_time / 60)) 分钟，开始自动调优..."
        
        # 创建锁文件
        touch "$LOCK_FILE"
        
        # 执行调优
        bash "$TUNE_SCRIPT"
        
        # 更新活动时间（避免连续触发）
        record_activity
        
        # 移除锁文件
        rm -f "$LOCK_FILE"
        
        echo "自动调优完成"
    else
        echo "用户活跃中，最后活动 $((inactive_time / 60)) 分钟前"
    fi
}

# 根据参数执行不同操作
case "${1:-check}" in
    "record")
        record_activity
        echo "活动时间已记录"
        ;;
    "check")
        check_and_tune
        ;;
    "force")
        echo "强制执行调优..."
        touch "$LOCK_FILE"
        bash "$TUNE_SCRIPT"
        record_activity
        rm -f "$LOCK_FILE"
        ;;
    *)
        echo "用法: $0 [record|check|force]"
        echo "  record - 记录用户活动"
        echo "  check  - 检查并执行调优（默认）"
        echo "  force  - 强制执行调优"
        ;;
esac
