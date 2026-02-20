# OpenClaw 飞书服务器部署 - 完整指南

## 快速部署（5分钟）

在你的服务器上执行：

```bash
# 下载并运行安装脚本
curl -fsSL https://raw.githubusercontent.com/your-repo/openclaw-feishu/main/install.sh | sudo bash

# 按提示输入：
# - 域名
# - 飞书App ID
# - 飞书App Secret
# - 邮箱
```

## 手动部署步骤

### 1. 准备工作

**服务器要求：**
- 公网IP
- 域名（已解析到服务器）
- 2核4G以上配置
- 开放80/443端口

**软件要求：**
- Docker 20.10+
- Docker Compose 2.0+

### 2. 安装Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. 创建部署目录

```bash
sudo mkdir -p /opt/openclaw-feishu
cd /opt/openclaw-feishu

# 创建目录结构
mkdir -p {config,data,logs,workspace/protocols}
```

### 4. 创建docker-compose.yml

```yaml
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
    networks:
      - openclaw-net

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
```

### 5. 配置Caddy（自动HTTPS）

创建 `Caddyfile`：

```
your-domain.com {
    tls your-email@example.com
    
    # 飞书Webhook路径
    handle /feishu/webhook* {
        reverse_proxy openclaw:8080
    }
    
    # 健康检查
    handle /health {
        respond "OK" 200
    }
    
    reverse_proxy openclaw:8080
}
```

### 6. 配置OpenClaw

创建 `config/config.yaml`：

```yaml
agent:
  name: "热点猎手"
  model: "kimi-coding/k2p5"

server:
  host: "0.0.0.0"
  port: 8080

feishu:
  enabled: true
  app_id: "cli_xxxxxxxxxxxx"
  app_secret: "xxxxxxxxxxxxxxxx"
  webhook:
    enabled: true
    path: "/feishu/webhook"
  message:
    group_mention: true
    private_chat: true

cron:
  enabled: true

logging:
  level: "info"
  output: "/root/.openclaw/logs/openclaw.log"
```

### 7. 启动服务

```bash
cd /opt/openclaw-feishu
docker-compose up -d
```

### 8. 配置飞书应用

1. **打开飞书开发者平台**
   - https://open.feishu.cn/app

2. **创建应用**
   - 类型：企业自建应用
   - 名称：热点猎手

3. **获取凭证**
   - 复制 App ID 和 App Secret
   - 填入 `config.yaml`

4. **启用机器人**
   - 左侧菜单 → 机器人 → 启用

5. **配置事件订阅**
   - 左侧菜单 → 事件订阅
   - 请求地址：`https://your-domain.com/feishu/webhook`
   - 点击「验证」

6. **订阅事件**
   - 添加：`接收消息` (im.message.receive_v1)
   - 添加：`机器人被添加到群聊` (im.chat.member.bot.added_v1)

7. **配置权限**
   - 需要的权限：
     - `im:chat:readonly` (读取群信息)
     - `im:message` (发送消息)
     - `im:message:send_as_bot` (以机器人身份发送)

8. **发布应用**
   - 左侧菜单 → 版本管理与发布
   - 创建版本 → 申请发布

### 9. 测试

在群里@机器人：
```
@热点猎手 今天的技术热点有哪些？
```

机器人应该回复热点列表。

## 常见问题

### Q: 事件订阅验证失败？

检查：
1. 域名是否正确解析到服务器
2. 443端口是否开放
3. Caddy是否正常运行：`docker-compose logs caddy`
4. OpenClaw是否正常运行：`docker-compose logs openclaw`

### Q: 机器人不回复？

检查：
1. 飞书应用是否已发布
2. 机器人是否在群里
3. 权限是否配置正确
4. 查看日志：`docker-compose logs -f openclaw`

### Q: 如何更新配置？

```bash
cd /opt/openclaw-feishu
# 修改 config/config.yaml
nano config/config.yaml

# 重启服务
docker-compose restart
```

### Q: 如何查看日志？

```bash
# 实时日志
docker-compose logs -f openclaw

# 最近100行
docker-compose logs --tail=100 openclaw
```

### Q: 如何备份数据？

```bash
cd /opt/openclaw-feishu

# 备份
tar czf openclaw-backup-$(date +%Y%m%d).tar.gz config/ data/ workspace/

# 恢复
tar xzf openclaw-backup-xxxx.tar.gz
```

## 高级配置

### 自定义模型

修改 `config.yaml`：

```yaml
agent:
  model: "deepseek/deepseek-chat"  # 或其他模型
```

### 添加自定义技能

```bash
mkdir -p workspace/skills/my-skill
# 创建 SKILL.md
# 重启服务
```

### 配置多个飞书群

```yaml
feishu:
  groups:
    - name: "技术群"
      id: "oc_xxxxxxxx"
    - name: "运营群"
      id: "oc_yyyyyyyy"
```

## 监控与告警

### 设置健康检查

```bash
# 添加定时任务
crontab -e

# 每5分钟检查一次
*/5 * * * * curl -f https://your-domain.com/health || docker-compose restart
```

## 性能优化

### 限制内存使用

修改 `docker-compose.yml`：

```yaml
services:
  openclaw:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

## 获取帮助

- OpenClaw文档：https://docs.openclaw.ai
- 飞书开放平台：https://open.feishu.cn
- 故障排查：查看 `logs/openclaw.log`
