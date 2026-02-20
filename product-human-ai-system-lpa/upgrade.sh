#!/bin/bash
# 五层架构人机系统 - 升级脚本
# Upgrade Script

set -e

INSTALL_DIR="${INSTALL_DIR:-/opt/human-ai-system}"
BACKUP_DIR="$INSTALL_DIR/backup/$(date +%Y%m%d_%H%M%S)"

echo "🔄 开始升级五层架构人机系统..."
echo ""

# 1. 备份当前版本
echo "📦 备份当前版本..."
mkdir -p "$BACKUP_DIR"
cp -r "$INSTALL_DIR/config" "$BACKUP_DIR/" 2>/dev/null || true
cp -r "$INSTALL_DIR/workspace/memory" "$BACKUP_DIR/" 2>/dev/null || true
cp "$INSTALL_DIR/.env" "$BACKUP_DIR/" 2>/dev/null || true
echo "   备份位置: $BACKUP_DIR"

# 2. 拉取最新镜像
echo ""
echo "📥 拉取最新镜像..."
cd "$INSTALL_DIR"
docker-compose pull

# 3. 重启服务
echo ""
echo "🚀 重启服务..."
docker-compose down
docker-compose up -d

# 4. 健康检查
echo ""
echo "⏳ 执行健康检查..."
sleep 10
if curl -s http://localhost:18789/health > /dev/null 2>&1; then
    echo "✅ 升级成功！系统运行正常"
else
    echo "⚠️ 升级完成，但服务可能需要更多时间启动"
    echo "   请稍后检查: docker-compose logs"
fi

echo ""
echo "📋 升级摘要:"
echo "   - 备份位置: $BACKUP_DIR"
echo "   - 如需回滚: 从备份目录恢复配置"
echo ""
