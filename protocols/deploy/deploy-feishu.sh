#!/bin/bash
# 飞书部署OpenClaw一键脚本

set -e

echo "🚀 开始在飞书部署OpenClaw..."

# 1. 检查环境
echo "📋 检查环境..."
command -v docker >/dev/null 2>&1 || { echo "❌ 需要Docker，请先安装"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ 需要Docker Compose，请先安装"; exit 1; }

# 2. 创建工作目录
WORK_DIR="$HOME/openclaw-feishu"
mkdir -p $WORK_DIR
cd $WORK_DIR

echo "✅ 工作目录: $WORK_DIR"

# 3. 创建Docker Compose配置
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  openclaw:
    image: openclaw/openclaw:latest
    container_name: openclaw-feishu
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./config:/root/.openclaw
      - ./data:/root/.openclaw/data
    environment:
      - OPENCLAW_CONFIG=/root/.openclaw/config.yaml
      - FEISHU_ENABLED=true
    networks:
      - openclaw-net

  # 可选：使用Caddy做HTTPS反向代理
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

# 4. 创建Caddy配置（自动HTTPS）
read -p "请输入你的域名 (如: openclaw.yourdomain.com): " DOMAIN

cat > Caddyfile << EOF
$DOMAIN {
    reverse_proxy openclaw:8080
}
EOF

# 5. 创建OpenClaw配置
mkdir -p config

cat > config/config.yaml << EOF
# OpenClaw 飞书配置

# 基础配置
agent:
  name: "热点猎手"
  model: "kimi-coding/k2p5"
  
# 飞书配置
feishu:
  enabled: true
  
  # 应用凭证（从飞书开发者平台获取）
  app_id: "${FEISHU_APP_ID:-your_app_id}"
  app_secret: "${FEISHU_APP_SECRET:-your_app_secret}"
  
  # 加密密钥（可选）
  encrypt_key: ""
  verification_token: ""
  
  # 事件回调配置
  webhook:
    enabled: true
    port: 8080
    path: "/feishu/webhook"
    
  # 消息处理
  message:
    # 群聊@机器人的消息
    group_mention: true
    # 私聊消息
    private_chat: true
    
# 定时任务
cron:
  enabled: true
  jobs:
    # 每天早上8点推送热点
    - name: "daily-hot-topics"
      schedule: "0 8 * * *"
      timezone: "Asia/Shanghai"
      action: "run_script"
      script: "/root/.openclaw/scripts/daily_push.sh"
      
    # 每小时检查一次
    - name: "hourly-check"
      schedule: "0 * * * *"
      timezone: "Asia/Shanghai"
      action: "heartbeat"

# 日志
logging:
  level: "info"
  format: "json"
  output: "/root/.openclaw/logs/openclaw.log"
EOF

# 6. 创建推送脚本
mkdir -p config/scripts

cat > config/scripts/daily_push.sh << 'SCRIPT'
#!/bin/bash
# 每日热点推送脚本

cd /root/.openclaw/workspace/protocols

# 1. 运行热点采集
python3 hot_topic_hunter_final.py

# 2. 推送到飞书
python3 scripts/push_feishu.py reports/final_topics_$(date +%Y%m%d).json

echo "[$(date)] 推送完成" >> /root/.openclaw/logs/push.log
SCRIPT

chmod +x config/scripts/daily_push.sh

# 7. 创建环境变量模板
cat > .env << EOF
# 飞书应用凭证
FEISHU_APP_ID=your_app_id_here
FEISHU_APP_SECRET=your_app_secret_here

# 其他配置
OPENCLAW_LOG_LEVEL=info
EOF

echo ""
echo "✅ 配置文件已生成"
echo ""
echo "📋 下一步："
echo "1. 编辑 .env 文件，填入飞书App ID和Secret"
echo "2. 编辑 config/config.yaml，完善配置"
echo "3. 运行: docker-compose up -d"
echo ""
echo "🌐 部署后访问: https://$DOMAIN"
echo ""
echo "⚠️  记得在飞书开发者平台设置事件订阅URL："
echo "   https://$DOMAIN/feishu/webhook"
