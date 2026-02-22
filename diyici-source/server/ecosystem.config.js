module.exports = {
  apps: [{
    name: 'diyici-api',
    script: 'dist/index.js',
    cwd: '/root/.openclaw/workspace/diyici-source/server',
    
    // 集群模式：2个Worker匹配2核CPU
    instances: 2,
    exec_mode: 'cluster',
    
    // 内存限制：每个Worker最大500MB
    max_memory_restart: '500M',
    
    // 自动重启策略
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s',
    
    // 环境变量 - 从系统环境变量读取，不在文件中硬编码
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=400',
      PORT: '3000'
      // API Keys从系统环境变量读取，不要在这里硬编码！
      // KIMI_API_KEY, DEEPSEEK_API_KEY, TENCENT_SECRET_ID, TENCENT_SECRET_KEY
    },
    
    // 日志配置
    log_file: '/tmp/diyici-server.log',
    out_file: '/tmp/diyici-server-out.log',
    error_file: '/tmp/diyici-server-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // 优雅关闭
    kill_timeout: 5000,
    listen_timeout: 8000,
    
    // 合并日志
    merge_logs: true
  }]
};
