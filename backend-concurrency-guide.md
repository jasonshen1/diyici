# ==========================================
# 后端并发限制策略 - 2GB内存服务器
# 适用于：Diyici.ai Node.js 后端
# ==========================================

## 一、Worker/Thread 数量建议

### 场景分析：
- 物理内存：2GB
- 系统保留：~500MB（内核、Nginx、监控Agent等）
- 可用内存：~1.5GB
- AI长连接：每个连接维持4-5分钟，占用内存约20-50MB

### 推荐配置：

**Node.js (PM2 集群模式)**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'diyici-api',
    script: 'dist/index.js',
    
    // 关键：Worker数量 = CPU核心数（2核）
    // 理由：Node.js是单线程事件循环，多进程利用多核
    // 2GB内存下，2个Worker是安全的选择
    instances: 2,
    
    // 内存限制：每个Worker最大500MB
    // 2 Worker × 500MB = 1GB，留出500MB给系统和其他
    max_memory_restart: '500M',
    
    // 执行模式：集群模式
    exec_mode: 'cluster',
    
    // 自动重启策略
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s',
    
    // 环境变量
    env: {
      NODE_ENV: 'production',
      // 限制V8堆内存（防止OOM）
      NODE_OPTIONS: '--max-old-space-size=400'
    }
  }]
};
```

**Python (Gunicorn + Uvicorn)**
```bash
# 如果是Python后端，推荐配置
gunicorn main:app \
  -k uvicorn.workers.UvicornWorker \
  -w 2 \              # Worker数 = CPU核数 = 2
  --threads 2 \       # 每个Worker的线程数
  --worker-connections 50 \  # 每个Worker最大连接数
  --max-requests 500 \       # 每处理500请求后重启Worker（防内存泄漏）
  --max-requests-jitter 50 \
  --timeout 600 \            # 600秒超时（匹配AI长任务）
  --graceful-timeout 60 \
  --keep-alive 5 \
  --limit-request-line 4094 \
  --limit-request-fields 100 \
  --limit-request-field-size 8190
```

## 二、为什么是这个配置？

| 参数 | 数值 | 理由 |
|------|------|------|
| Worker数 | 2 | 匹配2核CPU，避免上下文切换开销 |
| 单Worker内存 | 400-500MB | 2Worker×500MB=1GB，预留500MB给系统 |
| 总并发连接 | ~100 | 每个连接20-50MB，100连接≈2-5GB峰值，依赖Swap兜底 |
| 超时时间 | 600s | 覆盖AI最长生成时间（4-5分钟）+ 余量 |

## 三、关键风险控制

**1. 内存硬限制（OOM Killer防护）**
```bash
# 为Node.js进程设置cgroup内存限制（systemd）
# /etc/systemd/system/diyici.service
[Service]
MemoryLimit=1.2G
CPUQuota=180%  # 限制使用180% CPU（2核的90%）
Restart=always
RestartSec=5
```

**2. 连接数软限制**
```javascript
// 在Node.js中设置最大连接数
const http = require('http');
const server = http.createServer(app);

// 限制并发连接数
server.maxConnections = 80;  // 安全阈值

// 监听连接数
server.on('connection', (socket) => {
  console.log(`当前连接数: ${server.connections}`);
  if (server.connections > 80) {
    console.warn('警告：接近最大连接数限制');
  }
});
```

**3. 优雅降级策略**
```javascript
// 当内存使用超过80%时，拒绝新连接
const os = require('os');

function checkMemory() {
  const used = os.totalmem() - os.freemem();
  const percentage = (used / os.totalmem()) * 100;
  
  if (percentage > 80) {
    // 返回503服务不可用，让Nginx重试或用户等待
    return false;
  }
  return true;
}

// 中间件检查
app.use((req, res, next) => {
  if (!checkMemory()) {
    return res.status(503).json({
      error: '服务器繁忙，请稍后再试',
      retry_after: 30
    });
  }
  next();
});
```

## 四、监控告警阈值

```yaml
# 建议设置的告警阈值
内存使用:
  warning: 70%    # 1.4GB
  critical: 85%   # 1.7GB
  
Swap使用:
  warning: 30%    # 2.4GB
  critical: 50%   # 4GB
  
连接数:
  warning: 60     # 接近80上限
  critical: 75    # 接近80上限
```
