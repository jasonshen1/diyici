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
    
    // 环境变量
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=400',
      // API Keys
      KIMI_API_KEY: 'sk-kimi-AMPYGt7VOAINlBACe1qsJe02dIfMdkeenrqURyMRfnyFHzaBJIkoldfLbXEqUSE5',
      DEEPSEEK_API_KEY: 'sk-1872e462e6824d4bba4649e438c78668',
      TENCENT_SECRET_ID: 'AKIDKn5qW4axAFCzPk5TjmliULLBpGUWP5iC',
      TENCENT_SECRET_KEY: 'QcbNwOcdQ0NWTGEBBFOSO7e4MSOAmGYu',
      PORT: '3000'
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
