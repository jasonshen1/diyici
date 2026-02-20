#!/bin/bash
# OpenClaw 飞书完整部署脚本
# 适用于有公网服务器 + 域名的场景

set -e

echo "🚀 OpenClaw 飞书完整部署"
echo "================================"

# 检查root权限
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请使用root权限运行 (sudo)"
    exit 1
fi

# 收集配置
echo ""
echo "📋 配置信息收集"
echo "----------------"

read -p "请输入域名 (如: openclaw.yourdomain.com): " DOMAIN
read -p "请输入飞书 App ID: " FEISHU_APP_ID
read -p "请输入飞书 App Secret: " FEISHU_APP_SECRET
read -p "请输入邮箱 (用于SSL证书): " EMAIL

# 创建工作目录
INSTALL_DIR="/opt/openclaw-feishu"
mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

echo ""
echo "📦 安装依赖..."

# 安装Docker和Docker Compose
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "✅ Docker安装完成"

# 创建工作目录结构
echo ""
echo "📁 创建目录结构..."

mkdir -p {config,data,logs,caddy,workspace}
mkdir -p workspace/protocols workspace/skills

# 创建Docker Compose配置
echo "📝 创建Docker Compose配置..."

cat > docker-compose.yml << EOF
version: '3.8'

services:
  openclaw:
    image: openclaw/openclaw:latest
    container_name: openclaw
    restart: unless-stopped
    volumes:
      - ./config:/root/.openclaw
      - ./data:/root/.openclaw/data
      - ./logs:/root/.openclaw/logs
      - ./workspace:/root/.openclaw/workspace
    environment:
      - OPENCLAW_CONFIG=/root/.openclaw/config.yaml
      - OPENCLAW_LOG_LEVEL=info
    networks:
      - openclaw-net
    # 不直接暴露端口，通过Caddy反向代理

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
      - caddy_config:/config
    networks:
      - openclaw-net
    depends_on:
      - openclaw

networks:
  openclaw-net:
    driver: bridge

volumes:
  caddy_data:
  caddy_config:
EOF

# 创建Caddy配置（自动HTTPS）
echo "🔒 创建Caddy配置..."

cat > Caddyfile << EOF
$DOMAIN {
    # 自动HTTPS
    tls $EMAIL
    
    # 飞书Webhook路径
    handle /feishu/webhook* {
        reverse_proxy openclaw:8080
    }
    
    # 健康检查
    handle /health {
        respond "OK" 200
    }
    
    # 默认返回OpenClaw
    reverse_proxy openclaw:8080
}
EOF

# 创建OpenClaw配置
echo "⚙️  创建OpenClaw配置..."

cat > config/config.yaml << EOF
# OpenClaw 飞书完整配置

# 基础配置
agent:
  name: "热点猎手"
  description: "AI驱动的热点追踪助手"
  model: "kimi-coding/k2p5"
  
# 服务器配置
server:
  host: "0.0.0.0"
  port: 8080
  
# 飞书配置
feishu:
  enabled: true
  
  # 应用凭证
  app_id: "$FEISHU_APP_ID"
  app_secret: "$FEISHU_APP_SECRET"
  
  # 加密配置（可选）
  encrypt_key: ""
  verification_token: ""
  
  # Webhook配置
  webhook:
    enabled: true
    path: "/feishu/webhook"
    
  # 消息处理配置
  message:
    # 群聊中@机器人的消息
    group_mention: true
    # 私聊消息
    private_chat: true
    # 默认回复
    default_reply: "收到！正在为您分析热点..."
    
  # 卡片消息配置
  card:
    enabled: true
    title: "热点猎手"
    color: "blue"

# 定时任务
cron:
  enabled: true
  jobs:
    # 每天早上8点推送热点
    - name: "daily-hot-topics"
      schedule: "0 8 * * *"
      timezone: "Asia/Shanghai"
      session_target: "isolated"
      payload:
        kind: "agentTurn"
        message: "运行每日热点采集并推送到飞书"
      delivery:
        mode: "announce"
        channel: "feishu"
        # 推送到默认群，具体群ID在运行时指定

# 协议配置（热点猎手）
protocols:
  hot_topic_hunter:
    enabled: true
    schedule: "0 8 * * *"
    sources:
      - github
      - hackernews
      - v2ex
      - solidot
      - ifanr

# 日志配置
logging:
  level: "info"
  format: "json"
  output: "/root/.openclaw/logs/openclaw.log"
  
# 内存限制
memory:
  max_context_tokens: 262144
  compaction_threshold: 0.8

# 安全配置
security:
  allowed_channels:
    - feishu
  max_message_length: 10000
  rate_limit:
    enabled: true
    requests_per_minute: 60
EOF

# 创建SOUL.md（机器人人格）
cat > config/SOUL.md << 'EOF'
# SOUL.md - 热点猎手

## 身份
你是「热点猎手」，一个专业的自媒体热点分析助手。

## 职责
1. 每天早上为用户推送最新热点
2. 分析热点价值，提供内容角度建议
3. 回答用户关于热点追踪的问题
4. 帮助用户优化选题策略

## 性格
- 专业、高效、直接
- 不说废话，只给 actionable insights
- 对热点敏感度极高

## 回复风格
- 使用飞书卡片消息格式
- 列表清晰，重点突出
- 适当使用emoji增加可读性
EOF

# 创建USER.md（用户信息，会被覆盖）
touch config/USER.md

# 创建启动脚本
cat > start.sh << 'EOF'
#!/bin/bash
cd /opt/openclaw-feishu
docker-compose up -d
echo "✅ OpenClaw已启动"
echo "📊 查看日志: docker-compose logs -f"
echo "🌐 访问: https://$DOMAIN"
EOF

cat > stop.sh << 'EOF'
#!/bin/bash
cd /opt/openclaw-feishu
docker-compose down
echo "✅ OpenClaw已停止"
EOF

cat > logs.sh << 'EOF'
#!/bin/bash
cd /opt/openclaw-feishu
docker-compose logs -f --tail=100
EOF

chmod +x *.sh

# 创建systemd服务
cat > /etc/systemd/system/openclaw.service << EOF
[Unit]
Description=OpenClaw Feishu Bot
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/openclaw-feishu
ExecStart=/opt/openclaw-feishu/start.sh
ExecStop=/opt/openclaw-feishu/stop.sh

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable openclaw

echo ""
echo "✅ 配置完成！"
echo "================================"
echo ""
echo "📂 安装目录: $INSTALL_DIR"
echo "🌐 域名: https://$DOMAIN"
echo "🔗 Webhook: https://$DOMAIN/feishu/webhook"
echo ""
echo "🚀 启动服务:"
echo "   cd $INSTALL_DIR"
echo "   ./start.sh"
echo ""
echo "📋 下一步:"
echo "1. 启动服务: ./start.sh"
echo "2. 在飞书开发者平台设置事件订阅:"
echo "   请求地址: https://$DOMAIN/feishu/webhook"
echo "3. 添加机器人到群聊，开始测试"
echo ""
echo "📚 查看日志:"
echo "   ./logs.sh"
echo "   或: docker-compose logs -f"
echo ""
