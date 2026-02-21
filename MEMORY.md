# 🧠 阿一的记忆库

## 🔒 绝对安全原则（2026-02-21 建立）

### 修改前自动备份
在 QQ 中让我修改任何服务器文件、配置文件或网站代码之前，**必须**先执行备份：

```bash
# 自动执行
bash /root/.openclaw/workspace/backup-diyici.sh
```

备份位置：`/root/.openclaw/workspace/backups/diyici_backup_YYYYMMDD_HHMMSS.tar.gz`
保留策略：保留最近 20 个备份

### 一键急救指令
如果用户在 QQ 里说：
> "⚠️网站崩了，立刻回滚"

**不要做任何 AI 分析**，直接执行：

```bash
bash /root/.openclaw/workspace/rollback-diyici.sh
```

该脚本会：
1. 停止 Node.js 后端
2. 备份当前状态
3. 恢复最近备份
4. 重新编译
5. 部署前端
6. 启动服务
7. 重启 Nginx

目标：1 分钟内恢复网站访问

---

## 📝 重要项目信息

### Diyici.ai 网站
- **源码目录**: `/root/.openclaw/workspace/diyici-source`
- **部署目录**: `/var/www/diyici.ai`
- **后端服务**: Node.js (端口 3000)
- **反向代理**: Nginx
- **数据库**: SQLite

### API Keys（环境变量中）
- Kimi API
- DeepSeek API
- 腾讯云 OCR

### 服务器规格
- CPU: 2核 AMD EPYC
- 内存: 2GB
- 磁盘: 50GB SSD
- 系统: OpenCloudOS 9.4
