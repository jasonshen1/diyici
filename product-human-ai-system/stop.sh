#!/bin/bash
# 五层架构人机系统 - 停止脚本
# Stop Script

INSTALL_DIR="${INSTALL_DIR:-/opt/human-ai-system}"

cd "$INSTALL_DIR" || exit 1

echo "🛑 停止五层架构人机系统..."
docker-compose down

echo "✅ 系统已停止"
