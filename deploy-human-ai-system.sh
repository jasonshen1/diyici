#!/bin/bash
# OpenClaw 人机系统一键部署脚本
# 五层架构快速搭建工具

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║  OpenClaw 人机系统 - 五层架构快速部署器                 ║"
echo "║  从关系链到指令链：普通人也能构建的 AI 协作系统         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========== 1. 系统检测 ==========
echo -e "${BLUE}▶ 步骤 1/5: 系统环境检测${NC}"

# 检测系统类型
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
else
    OS=$(uname -s)
fi

echo "  检测到系统: $OS"

# 检测 Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  ✅ Node.js 已安装: $NODE_VERSION"
else
    echo "  ⚠️  Node.js 未安装，准备安装..."
    if [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"OpenCloudOS"* ]]; then
        curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
        yum install -y nodejs
    elif [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
        apt-get install -y nodejs
    else
        echo "  ❌ 不支持自动安装 Node.js，请手动安装 Node 22+"
        exit 1
    fi
fi

# ========== 2. 安装 OpenClaw ==========
echo ""
echo -e "${BLUE}▶ 步骤 2/5: 安装 OpenClaw${NC}"

if command -v openclaw &> /dev/null; then
    echo "  ✅ OpenClaw 已安装"
    openclaw --version
else
    echo "  📦 正在安装 OpenClaw..."
    npm install -g openclaw
    echo "  ✅ OpenClaw 安装完成"
fi

# ========== 3. 五层架构配置模板 ==========
echo ""
echo -e "${BLUE}▶ 步骤 3/5: 生成五层架构配置${NC}"

# 创建工作目录
WORKSPACE="${HOME}/.openclaw/workspace"
mkdir -p "${WORKSPACE}/memory"
mkdir -p "${WORKSPACE}/protocols"
mkdir -p "${WORKSPACE}/skills"

# 生成基础配置文件
cat > "${HOME}/.openclaw/openclaw.json" << 'EOF'
{
  "meta": {
    "version": "1.0",
    "name": "人机系统-五层架构",
    "description": "基于指令链的 AI 协作系统"
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "kimi-coding/k2p5",
        "fallbacks": [
          "moonshot/kimi-k2-5",
          "deepseek/deepseek-chat",
          "baidu/qianfan"
        ]
      },
      "models": {
        "kimi-coding/k2p5": { "alias": "Kimi K2.5" },
        "moonshot/kimi-k2-5": { "alias": "Moonshot Kimi K2.5" },
        "baidu/qianfan": { "alias": "百度千帆" },
        "deepseek/deepseek-chat": { "alias": "DeepSeek Chat" }
      },
      "workspace": "~/.openclaw/workspace",
      "maxConcurrent": 2,
      "subagents": {
        "maxConcurrent": 4
      }
    }
  },
  "models": {
    "providers": {
      "kimi-coding": {
        "apiKey": "${KIMI_API_KEY}",
        "baseUrl": "https://api.moonshot.cn/v1"
      },
      "moonshot": {
        "apiKey": "${MOONSHOT_API_KEY}",
        "baseUrl": "https://api.moonshot.cn/v1"
      },
      "deepseek": {
        "apiKey": "${DEEPSEEK_API_KEY}",
        "baseUrl": "https://api.deepseek.com/v1"
      },
      "baidu": {
        "apiKey": "${BAIDU_API_KEY}",
        "secretKey": "${BAIDU_SECRET_KEY}"
      }
    }
  },
  "channels": {
    "qqbot": {
      "enabled": false,
      "appId": "${QQBOT_APPID}",
      "token": "${QQBOT_TOKEN}",
      "secret": "${QQBOT_SECRET}",
      "intents": ["C2C_MESSAGE", "GROUP_AT_MESSAGE"]
    },
    "discord": {
      "enabled": false,
      "botToken": "${DISCORD_TOKEN}",
      "requireMention": false,
      "dm": {
        "enabled": true,
        "policy": "pairing"
      }
    }
  },
  "gateway": {
    "port": 18789,
    "bind": "127.0.0.1",
    "trustedProxies": ["127.0.0.1"]
  },
  "tools": {
    "web": {
      "search": {
        "enabled": true
      }
    }
  },
  "skills": {
    "allow": ["*"]
  },
  "heartbeat": {
    "intervalMinutes": 30
  }
}
EOF

echo "  ✅ 基础配置已生成"

# ========== 4. 生成协议模板库 ==========
echo ""
echo -e "${BLUE}▶ 步骤 4/5: 创建指令链协议模板${NC}"

# 创建故障诊断协议
cat > "${WORKSPACE}/protocols/diagnose-protocol.md" << 'EOF'
# 故障诊断指令链协议

## 触发条件
系统异常、服务崩溃、性能下降

## 诊断流程

### 步骤 1: 信息收集（输入感知层）
```bash
# 检查系统状态
openclaw gateway status
free -h
df -h
```

### 步骤 2: 日志分析（逻辑推演层）
```bash
# 查看错误日志
tail -100 /tmp/openclaw/openclaw-$(date +%Y-%m-%d).log | grep -i error
```

### 步骤 3: 自动修复（执行自动化层）
```bash
# 自动修复常见配置问题
openclaw doctor --fix
```

### 步骤 4: 验证反馈（反馈进化层）
```bash
# 验证修复结果
openclaw gateway status
```

## 输出标准
- 问题描述
- 根因分析
- 修复步骤
- 预防措施
EOF

# 创建网站部署协议
cat > "${WORKSPACE}/protocols/deploy-protocol.md" << 'EOF'
# 网站部署指令链协议

## 触发条件
新项目上线、版本更新

## 部署流程

### 步骤 1: 代码获取（输入感知层）
- 从 GitHub/GitLab 拉取代码
- 解压到工作目录

### 步骤 2: 环境准备（结构抽象层）
- 安装依赖
- 配置环境变量
- 检查端口占用

### 步骤 3: 构建测试（逻辑推演层）
- 执行构建命令
- 运行测试
- 生成生产包

### 步骤 4: 部署上线（执行自动化层）
- 备份旧版本
- 部署新版本
- 配置 Nginx
- 申请 SSL 证书

### 步骤 5: 监控反馈（反馈进化层）
- 检查服务状态
- 监控访问日志
- 记录部署经验
EOF

# 创建日常维护协议
cat > "${WORKSPACE}/protocols/maintenance-protocol.md" << 'EOF'
# 日常维护指令链协议

## 每日检查清单

### 系统健康
- [ ] 内存使用率 < 80%
- [ ] 磁盘使用率 < 80%
- [ ] Gateway 运行正常
- [ ] 日志文件大小 < 100MB

### 安全检查
- [ ] 无异常登录
- [ ] SSL 证书有效
- [ ] 防火墙规则正常

### 优化任务
- [ ] 清理过期日志
- [ ] 备份重要数据
- [ ] 更新依赖包

## 自动化脚本
```bash
# 清理日志
find /tmp/openclaw -name "*.log" -mtime +7 -delete

# 备份配置
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak.$(date +%Y%m%d)
```
EOF

echo "  ✅ 协议模板已创建（3个）"

# ========== 5. 生成 Memory 结构 ==========
echo ""
echo -e "${BLUE}▶ 步骤 5/5: 初始化记忆系统${NC}"

TODAY=$(date +%Y-%m-%d)

cat > "${WORKSPACE}/memory/${TODAY}.md" << EOF
# ${TODAY} - 人机系统初始化

## 系统信息
- 部署时间: ${TODAY}
- 系统版本: OpenClaw $(openclaw --version 2>/dev/null || echo "未知")
- 工作目录: ${WORKSPACE}

## 五层架构配置

### 意志定义层
- 系统目标: 构建人机协作的生产系统
- 价值原则: 自动化、可复用、持续进化

### 结构抽象层
- 协议库位置: ${WORKSPACE}/protocols/
- 记忆系统: ${WORKSPACE}/memory/
- 技能扩展: ${WORKSPACE}/skills/

### 逻辑推演层
- 主模型: Kimi K2.5
- 备选模型: DeepSeek / 百度千帆

### 执行自动化层
- Gateway 端口: 18789
- 部署工具: Nginx + Docker

### 反馈进化层
- 每日记录: memory/YYYY-MM-DD.md
- 长期记忆: MEMORY.md
- 协议迭代: protocols/

## 下一步配置
- [ ] 配置 API Keys
- [ ] 启用消息渠道 (QQ/Discord)
- [ ] 测试指令链协议
- [ ] 自定义协议模板
EOF

# 创建 AGENTS.md
cat > "${WORKSPACE}/AGENTS.md" << 'EOF'
# 人机系统 - 使用指南

## 快速开始

### 1. 配置 API Keys
编辑 ~/.openclaw/.env 文件：
```bash
KIMI_API_KEY=your_key_here
DEEPSEEK_API_KEY=your_key_here
```

### 2. 启动 Gateway
```bash
openclaw gateway start
```

### 3. 验证安装
```bash
openclaw doctor
```

## 五层架构使用说明

### 意志定义层 - 设定目标
告诉 AI 你要完成什么任务，例如：
- "部署一个 React 网站到域名 example.com"
- "诊断 Gateway 为什么崩溃"

### 结构抽象层 - 选择协议
AI 会自动选择合适的协议：
- 故障诊断 → 使用 diagnose-protocol.md
- 网站部署 → 使用 deploy-protocol.md
- 日常维护 → 使用 maintenance-protocol.md

### 逻辑推演层 - 执行推演
AI 调用模型进行：
- 代码生成
- 配置编写
- 问题分析

### 执行自动化层 - 自动部署
自动执行：
- 命令执行
- 服务配置
- 监控设置

### 反馈进化层 - 经验沉淀
自动记录到：
- memory/YYYY-MM-DD.md (每日记录)
- protocols/ (协议优化)

## 自定义协议

在 protocols/ 目录创建新的 .md 文件，按照以下格式：

```markdown
# 协议名称

## 触发条件
什么情况下使用这个协议

## 步骤
1. 步骤一
2. 步骤二
3. 步骤三

## 输出标准
- 检查点 1
- 检查点 2
```

## 常用命令

```bash
# 检查系统状态
openclaw gateway status

# 自动修复问题
openclaw doctor --fix

# 查看日志
tail -f /tmp/openclaw/openclaw-$(date +%Y-%m-%d).log

# 清理日志
rm /tmp/openclaw/openclaw-*.log
```
EOF

echo "  ✅ 记忆系统已初始化"

# ========== 完成 ==========
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🎉 五层架构人机系统部署完成！                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📁 工作目录: ${WORKSPACE}"
echo ""
echo "📋 五层架构文件结构:"
echo "   ├── protocols/          # 指令链协议库"
echo "   │   ├── diagnose-protocol.md"
echo "   │   ├── deploy-protocol.md"
echo "   │   └── maintenance-protocol.md"
echo "   ├── memory/             # 经验记忆系统"
echo "   │   └── ${TODAY}.md"
echo "   └── AGENTS.md           # 使用指南"
echo ""
echo "🔧 下一步:"
echo "   1. 编辑 ~/.openclaw/.env 配置 API Keys"
echo "   2. 运行: openclaw gateway start"
echo "   3. 阅读: ${WORKSPACE}/AGENTS.md"
echo ""
echo "💡 提示: 使用 'openclaw doctor' 检查系统状态"
echo ""
