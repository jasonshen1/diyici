#!/bin/bash
# 五层架构人机系统 - 卸载脚本
# Uninstall Script

INSTALL_DIR="${INSTALL_DIR:-/opt/human-ai-system}"

echo "⚠️  警告: 此操作将删除五层架构人机系统及其所有数据！"
echo ""
read -p "确认卸载? (输入 'yes' 确认): " confirm

if [ "$confirm" != "yes" ]; then
    echo "已取消卸载"
    exit 0
fi

echo ""
echo "🗑️  正在卸载..."

cd "$INSTALL_DIR" || exit 1

# 停止并删除容器
docker-compose down -v

# 删除安装目录
cd ..
rm -rf "$INSTALL_DIR"

echo ""
echo "✅ 卸载完成"
echo "   所有数据和配置已删除"
