#!/bin/bash
# 五层架构人机系统 - 启动脚本
# Start Script

INSTALL_DIR="${INSTALL_DIR:-/opt/human-ai-system}"

cd "$INSTALL_DIR" || exit 1

echo "🚀 启动五层架构人机系统..."
docker-compose up -d

echo ""
echo "⏳ 等待服务就绪..."
sleep 5

# 显示状态
docker-compose ps

echo ""
echo "✅ 系统已启动"
echo "   Gateway: http://localhost:18789"
echo "   查看日志: docker-compose logs -f"
