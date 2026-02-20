#!/bin/bash
# OpenClaw 飞书部署 - diyici.ai
# 复制到服务器执行

set -e

echo "🚀 部署 OpenClaw 到飞书"
echo "========================"

# 配置
DOMAIN="openclaw.diyici.ai"
APP_ID="cli_a91bf1a9b7b8dceb"
APP_SECRET="Ei7GJFIpqtnbLYfXzN7d4fPWBNciQuXR"
EMAIL="admin@diyici.ai"

# 安装Docker
if ! command -v docker &> /dev/null; then
    echo "📦 安装Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    sudo systemctl enable docker
    sudo systemctl start docker
fi

if ! command -v docker-compose &> /dev/null; then
    echo "📦 安装Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 创建工作目录
INSTALL_DIR="/opt/openclaw"
sudo mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

echo "📝 创建配置文件..."

# Docker Compose
sudo tee docker-compose.yml > /dev/null <<EOF
version: '3'

services:
  openclaw:
    image: openclaw/openclaw:latest
    container_name: openclaw
    restart: unless-stopped
    volumes:
      - ./config.yaml:/root/.openclaw/config.yaml
      - ./data:/root/.openclaw/data
    environment:
      - OPENCLAW_CONFIG=/root/.openclaw/config.yaml
    networks:
      - net

  caddy:
    image: caddy:2-alpine
    container_name: openclaw-caddy
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

# Caddyfile (自动HTTPS)
sudo tee Caddyfile > /dev/null <<EOF
$DOMAIN {
    tls $EMAIL
    reverse_proxy openclaw:8080
}
EOF

# OpenClaw 配置
sudo tee config.yaml > /dev/null <<EOF
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

logging:
  level: "info"
EOF

# 启动
echo "🚀 启动服务..."
sudo docker-compose up -d

# 等待启动
sleep 5

# 检查状态
if sudo docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ 部署成功！"
    echo "=================="
    echo "🌐 地址: https://$DOMAIN"
    echo "🔗 Webhook: https://$DOMAIN/feishu/webhook"
    echo ""
    echo "📋 飞书后台配置:"
    echo "   事件订阅地址: https://$DOMAIN/feishu/webhook"
    echo "   订阅事件: im.message.receive_v1"
    echo "   权限: im:message, im:message:send_as_bot"
    echo ""
    echo "📝 常用命令:"
    echo "   查看日志: sudo docker-compose logs -f"
    echo "   重启: sudo docker-compose restart"
    echo "   停止: sudo docker-compose down"
else
    echo "❌ 启动失败，查看日志:"
    sudo docker-compose logs
fi
