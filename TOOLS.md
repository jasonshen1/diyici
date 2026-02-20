# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## 知识液化发布工具

### 快速发布命令
```bash
# 自动扫描并发布所有知识到 diyici.ai
cd /root/.openclaw/workspace/diyici-source/scripts && ./auto-publish.sh --auto

# 或手动确认
cd /root/.openclaw/workspace/diyici-source/scripts && ./auto-publish.sh
```

发布完成后访问: https://diyici.ai/#/kb

### 网站部署信息
- **网站目录**: `/var/www/diyici.ai`
- **源码目录**: `/root/.openclaw/workspace/diyici-source`
- **知识目录**: `/root/.openclaw/workspace/diyici-source/public/knowledge`
- **技能目录**: `/root/.openclaw/workspace/diyici-source/public/skills`

---

## API Keys

### 灵芽 API (Lingya AI)
- **API Key**: `sk-7RuCw2ZSilUeiO0DWhsvbAAuBhwZfJf5dT7UaEnXZioFzigo`
- **Base URL**: `https://api.lingyaai.cn`
- **用途**: 聚合多模型 API (OpenAI/Claude/Gemini/DeepSeek等)
- **状态**: ✅ 已验证可用

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## 数据库连接

### 星星暴走生产库 (prod.xingxingbaozou.com)
- **主机**: prod.xingxingbaozou.com
- **端口**: 3306
- **账号**: xxbzreadonly
- **密码**: Ilsld@8861kj9dk
- **权限**: 只读
- **环境**: 生产环境
- **数据库**: xxbzprod (MySQL 8.0.42)
- **状态**: ✅ 已连接可用

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
