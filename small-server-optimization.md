# 小服务器优化配置指南
# 适用于 2GB 内存以下的 OpenClaw 部署

{
  "agents": {
    "defaults": {
      "model": {
        "primary": "kimi-coding/k2p5",
        "fallbacks": [
          "deepseek/deepseek-chat"
        ]
      },
      "models": {
        "kimi-coding/k2p5": {
          "alias": "Kimi K2.5"
        },
        "deepseek/deepseek-chat": {
          "alias": "DeepSeek Chat (官方)"
        }
      },
      "workspace": "/root/.openclaw/workspace",
      
      # === 优化1: 激进的内存管理 ===
      "compaction": {
        "mode": "adaptive",
        "threshold": 0.7,        # 70% 就开始压缩（默认 90%）
        "preserveRecent": 5      # 只保留最近 5 条（默认 10 条）
      },
      
      # === 优化2: 限制并发 ===
      "maxConcurrent": 2,        # 从 4 降到 2，减少内存占用
      
      "subagents": {
        "maxConcurrent": 4         # 从 8 降到 4
      },
      
      # === 优化3: 限制 Token 使用 ===
      "maxTokens": 2048,         # 限制单次输出长度
      "contextWindow": 131072     # 限制上下文窗口（默认 262144）
    }
  },
  
  # === 优化4: 会话自动清理 ===
  "sessions": {
    "resetByChannel": {
      "qqbot": {
        "idleMinutes": 30,       # 30 分钟闲置就重置（默认 60）
        "maxMessages": 30        # 30 条消息就重置（默认 50）
      },
      "discord": {
        "idleMinutes": 30,
        "maxMessages": 30
      }
    },
    "maxActive": 5               # 最多同时 5 个活跃会话
  },
  
  # === 优化5: 禁用非必要功能 ===
  "memory": {
    "enabled": false             # 禁用记忆功能（节省内存）
  },
  
  "tools": {
    "web": {
      "enabled": true,
      "searchProvider": "perplexity",
      "cacheTimeout": 3600        # 1小时缓存
    },
    "browser": {
      "enabled": false            # 禁用浏览器（节省资源）
    }
  },
  
  # === 优化6: 精简频道 ===
  "channels": {
    "qqbot": {
      "enabled": true
      # 只保留 QQ，其他按需开启
    },
    "discord": {
      "enabled": false            # 需要时再开启
    }
  },
  
  # === 优化7: 日志控制 ===
  "logging": {
    "level": "warn",             # 只记录警告和错误（减少磁盘 IO）
    "maxFiles": 3,               # 最多保留 3 个日志文件
    "maxSize": "10m"             # 每个日志文件最大 10MB
  },
  
  # === 优化8: Gateway 设置 ===
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback",
    "maxConnections": 10,        # 限制最大连接数
    "heartbeatInterval": 60000   # 心跳间隔 60 秒（默认 30 秒，减少负载）
  }
}

# === 系统级优化 ===
# 1. 使用 PM2 管理进程（自动重启）
# pm2 start openclaw-gateway --name "openclaw" --max-memory-restart 1G

# 2. 设置 Swap（已设置 8GB，充足）
# 如果 swap 使用率超过 50%，需要增加物理内存

# 3. 定期清理日志
# crontab -e
# 0 0 * * * rm -f /tmp/openclaw/*.log.*

# 4. 监控脚本
# 内存超过 80% 时自动重启
# cat > /root/.openclaw/memory_watch.sh << 'EOF'
#!/bin/bash
MEM_USAGE=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
if (( $(echo "$MEM_USAGE > 80" | bc -l) )); then
  echo "$(date): Memory usage $MEM_USAGE%, restarting OpenClaw..." >> /var/log/openclaw-monitor.log
  pkill -f "openclaw-gateway"
  sleep 5
  openclaw gateway &
fi
EOF
# chmod +x /root/.openclaw/memory_watch.sh
# echo "*/5 * * * * /root/.openclaw/memory_watch.sh" | crontab -
