#!/bin/bash
# Diyici.ai 自动备份脚本
# 在修改任何文件前执行

BACKUP_DIR="/root/.openclaw/workspace/backups"
PROJECT_DIR="/root/.openclaw/workspace/diyici-source"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="diyici_backup_${TIMESTAMP}"

echo "📦 开始备份..."
echo "时间戳: $TIMESTAMP"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 打包整个项目（排除 node_modules）
cd "$PROJECT_DIR" || exit 1
tar czf "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='*.log' \
    .

echo "✅ 备份完成: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"

# 保留最近 20 个备份，删除旧的
ls -t "$BACKUP_DIR"/diyici_backup_*.tar.gz | tail -n +21 | xargs -r rm -f

echo "📊 当前备份数量: $(ls -1 "$BACKUP_DIR"/diyici_backup_*.tar.gz 2>/dev/null | wc -l)"
echo "💾 最新备份: $(ls -t "$BACKUP_DIR"/diyici_backup_*.tar.gz | head -1)"
