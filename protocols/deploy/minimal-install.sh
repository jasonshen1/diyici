#!/bin/bash
# OpenClaw 飞书最小部署
# 只保留核心对话功能

set -e

echo "🚀 OpenClaw 飞书最小部署"
echo "=========================="

read -p "域名: " DOMAIN
read -p "飞书 App ID: " APP_ID
read -p "飞书 App Secret: " APP_SECRET
read -p "邮箱(SSL证书): " EMAIL

INSTALL_DIR="/opt/openclaw"
mkdir -p $INSTALL_DIR && cd $INSTALL_DIR

# 1. Docker Compose（最小配置）
cat > docker-compose.yml << 'EOF'
version: '3'

services:
  openclaw:
    image: openclaw/openclaw:latest
    restart: unless-stopped
    volumes:
      - ./config:/root/.openclaw
      - ./data:/root/.openclaw/data
    environment:
      - OPENCLAW_CONFIG=/root/.openclaw/config.yaml
    networks:
      - net

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    networks:
      - net

networks:
  net:

volumes:
  caddy_data:
EOF

# 2. Caddy配置
cat > Caddyfile << EOF
$DOMAIN {
    tls $EMAIL
    reverse_proxy openclaw:8080
}
EOF

# 3. OpenClaw最小配置
cat > config.yaml << EOF
agent:
  name: "阿一"
  model: "kimi-coding/k2p5"

server:
  host: "0.0.0.0"
  port: 8080

feishu:
  enabled: true
  app_id: "$APP_ID"
  app_secret: "$APP_SECRET"
  webhook:
    enabled: true
    path: "/feishu/webhook"
  message:
    group_mention: true
    private_chat: true
EOF

mkdir -p config
cp config.yaml config/

# 4. 启动
echo "🚀 启动服务..."
docker-compose up -d

echo ""
echo "✅ 部署完成!"
echo "=================="
echo "🌐 https://$DOMAIN"
echo "🔗 Webhook: https://$DOMAIN/feishu/webhook"
echo ""
echo "📋 飞书后台配置:"
echo "1. 事件订阅地址: https://$DOMAIN/feishu/webhook"
echo "2. 订阅事件: im.message.receive_v1"
echo "3. 权限: im:message, im:message:send_as_bot"
echo ""
echo "📝 常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  重启: docker-compose restart"
echo "  停止: docker-compose down"
