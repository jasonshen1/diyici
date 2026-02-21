#!/bin/bash
# ⚠️ 紧急回滚脚本
# 用法：执行此脚本立即恢复到最新备份

echo "🚨 紧急回滚启动！"
echo "$(date '+%Y-%m-%d %H:%M:%S')"

BACKUP_DIR="/root/.openclaw/workspace/backups"
PROJECT_DIR="/root/.openclaw/workspace/diyici-source"
PUBLIC_DIR="/var/www/diyici.ai"

# 找到最新备份
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/diyici_backup_*.tar.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ 错误：没有找到备份文件！"
    exit 1
fi

echo "📦 使用备份: $(basename "$LATEST_BACKUP")"

# 1. 停止后端服务
echo "🛑 停止 Node.js 后端..."
pkill -f "node dist/index" 2>/dev/null
sleep 2

# 2. 备份当前状态（以防万一）
echo "💾 备份当前状态..."
cd "$PROJECT_DIR" || exit 1
tar czf "$BACKUP_DIR/pre_rollback_$(date +%Y%m%d_%H%M%S).tar.gz" . 2>/dev/null

# 3. 清空当前目录
echo "🧹 清空当前项目..."
rm -rf "$PROJECT_DIR"/*

# 4. 解压备份
echo "📂 恢复备份..."
tar xzf "$LATEST_BACKUP" -C "$PROJECT_DIR"

# 5. 重新编译
echo "🔨 重新编译..."
cd "$PROJECT_DIR"
npm run build 2>&1 || echo "⚠️ 编译警告（可能不影响运行）"

# 6. 部署前端文件
echo "🚀 部署前端..."
cp -r public/* "$PUBLIC_DIR"/ 2>/dev/null || true

# 7. 启动后端服务
echo "▶️ 启动后端服务..."
cd "$PROJECT_DIR/server"
export $(grep -v "^#" .env | xargs) 2>/dev/null
nohup node dist/index.js > /tmp/diyici-server.log 2>&1 &
sleep 3

# 8. 重启 Nginx
echo "🔄 重启 Nginx..."
/usr/sbin/nginx -s reload 2>/dev/null || systemctl restart nginx 2>/dev/null

# 9. 验证状态
echo ""
echo "✅ 回滚完成！验证状态："
echo "---"
ps aux | grep "node dist/index" | grep -v grep | head -1 || echo "⚠️ 后端未运行"
curl -s http://localhost:3000/api/cabinet/status/1 >/dev/null && echo "✅ API 正常" || echo "⚠️ API 异常"
echo "---"
echo "⏱️ 总用时: $(($(date +%s) - $(date -d "$(date '+%Y-%m-%d %H:%M:%S')" +%s)))秒"
