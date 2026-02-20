# 五层架构人机系统 - 使用指南
# Five-Layer Human-AI System

> > > **让普通人5分钟搭建AI协作系统**
>
> 版本: v1.0.0 | 发布时间: 2026-02-14

---

## 🎯 产品简介

**五层架构人机系统**是一个基于"从关系链到指令链"方法论构建的AI协作基础设施。

它将个人经验转化为可复用的"逻辑资产"，通过五层架构实现：
- **意志定义** → 明确价值目标
- **结构抽象** → 拆解经验为协议
- **指令架构** → 固化为Prompt模板
- **执行自动化** → 规模化交付
- **反馈进化** → 持续优化迭代

---

## 📦 部署包内容

```
human-ai-system/
├── docker-compose.yml          # Docker编排配置
├── install.sh                  # 一键安装脚本 ⭐
├── start.sh                    # 启动服务
├── stop.sh                     # 停止服务
├── upgrade.sh                  # 升级系统
├── uninstall.sh                # 卸载系统
├── README.md                   # 本文件
├── config/                     # 配置文件目录
│   └── openclaw.json          # OpenClaw主配置
├── protocols/                  # 协议模板库
│   ├── diagnose-protocol.md   # 故障诊断
│   ├── deploy-protocol.md     # 网站部署
│   ├── maintenance-protocol.md # 日常维护
│   └── knowledge-liquification-factory-v1.1.md # 知识液态化手册
├── workspace/                  # 工作目录
│   ├── memory/                # 记忆系统
│   ├── protocols/             # 自定义协议
│   └── skills/                # 技能扩展
├── logs/                       # 日志目录
├── ssl/                        # SSL证书目录
└── nginx/                      # Nginx配置
    ├── nginx.conf
    └── sites/
```

---

## 🚀 快速开始

### 方式1：一键安装（推荐）

```bash
# 下载部署包
wget https://diyici.ai/downloads/human-ai-system-v1.0.0.tar.gz
tar -xzf human-ai-system-v1.0.0.tar.gz
cd human-ai-system

# 一键安装
bash install.sh
```

### 方式2：Docker Compose

```bash
# 克隆仓库
git clone https://github.com/yourname/human-ai-system.git
cd human-ai-system

# 启动服务
docker-compose up -d
```

---

## 📋 系统要求

| 项目 | 最低要求 | 推荐配置 |
|-----|---------|---------|
| CPU | 1核 | 2核+ |
| 内存 | 1GB | 2GB+ |
| 磁盘 | 10GB | 20GB+ |
| 系统 | Linux/macOS | Ubuntu 20.04+ |
| Docker | 20.10+ | 最新版 |
| Docker Compose | 1.29+ | 2.x |

---

## 🎮 使用方法

### 1. 启动系统

```bash
cd /opt/human-ai-system
bash start.sh
```

### 2. 访问服务

| 服务 | 地址 | 说明 |
|-----|------|------|
| Gateway | http://localhost:18789 | OpenClaw网关 |
| Dashboard | http://localhost | Web管理面板 |

### 3. 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 升级系统
bash upgrade.sh

# 停止服务
bash stop.sh
```

---

## 🔧 配置说明

### 环境变量 (.env)

```bash
# Gateway配置
GATEWAY_TOKEN=your-secret-token
GATEWAY_PORT=18789

# 时区设置
TZ=Asia/Shanghai

# 自动调优配置
AUTO_TUNE_INTERVAL=1800
AUTO_TUNE_THRESHOLD=3600
```

### 模型配置 (config/openclaw.json)

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "kimi-coding/k2p5",
        "fallbacks": [
          "moonshot/kimi-k2-5",
          "deepseek/deepseek-chat"
        ]
      }
    }
  }
}
```

---

## 📚 协议模板使用

### 故障诊断协议

```bash
# 当系统出现问题时，按以下协议执行：
1. 信息收集 → openclaw gateway status
2. 日志分析 → tail -f logs/openclaw.log
3. 自动修复 → openclaw doctor --fix
4. 验证反馈 → curl http://localhost:18789/health
```

### 网站部署协议

```bash
# 部署新网站的标准流程：
1. 代码获取 → git clone / download
2. 环境准备 → install dependencies
3. 构建测试 → npm run build
4. 部署上线 → cp -r dist/* /var/www/
5. 监控反馈 → check website status
```

---

## 🔒 安全说明

1. **Gateway Token**：安装时自动生成，请勿泄露
2. **SSL证书**：生产环境请配置HTTPS
3. **防火墙**：仅开放必要端口 (80, 443, 18789)
4. **定期备份**：重要数据请定期备份

---

## 🐛 故障排查

### 服务无法启动

```bash
# 检查Docker状态
docker ps
docker-compose logs

# 检查端口占用
netstat -tlnp | grep 18789
```

### Gateway连接失败

```bash
# 检查服务状态
docker-compose ps

# 重启Gateway
docker-compose restart openclaw-gateway
```

### 内存不足

```bash
# 查看内存使用
free -h

# 清理Docker缓存
docker system prune -a
```

---

## 📞 技术支持

- **文档**: https://docs.diyici.ai/human-ai-system
- **社区**: https://discord.gg/human-ai
- **邮箱**: support@diyici.ai
- **GitHub**: https://github.com/yourname/human-ai-system

---

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

## 🙏 致谢

- 设计理念源自"从关系链到指令链"方法论
- 基于 OpenClaw 开源项目构建
- 感谢所有贡献者和用户

---

*© 2026 五层架构人机系统 | Powered by OpenClaw*
