#!/bin/bash
# Discord Webhook 配置助手
# 自动生成 .env 配置文件

echo "🎭 Discord 四脑集成配置助手"
echo "=============================="
echo ""
echo "请按以下步骤在 Discord 中创建 Webhooks："
echo ""
echo "1. 在 Discord 中，右键点击频道 → 服务器设置 → 集成 → Webhooks"
echo "2. 点击 '新 Webhook'"
echo "3. 为每个角色创建 Webhook，复制 URL"
echo ""

# 收集 Webhook URL
echo "请输入 Webhook URLs（直接回车跳过）："
echo ""

read -p "📝 PM·产品经理 Webhook URL: " WEBHOOK_PM
read -p "💻 DEV·工程师 Webhook URL: " WEBHOOK_DEV
read -p "🔍 REVIEWER·审计员 Webhook URL: " WEBHOOK_REVIEWER
read -p "📋 MEMO·记录员 Webhook URL: " WEBHOOK_MEMO

echo ""
echo "扩展角色（可选）："
read -p "🧪 TESTER·测试员 Webhook URL (可选): " WEBHOOK_TESTER
read -p "🏗️ ARCHITECT·架构师 Webhook URL (可选): " WEBHOOK_ARCHITECT
read -p "🛡️ SECURITY·安全专家 Webhook URL (可选): " WEBHOOK_SECURITY
read -p "⚡ OPTIMIZER·优化师 Webhook URL (可选): " WEBHOOK_OPTIMIZER
read -p "📚 WRITER·文档工程师 Webhook URL (可选): " WEBHOOK_WRITER
read -p "🎨 UX·交互设计师 Webhook URL (可选): " WEBHOOK_UX
read -p "🚀 DEVOPS·运维工程师 Webhook URL (可选): " WEBHOOK_DEVOPS

echo ""
echo "OpenClaw 配置："
read -p "OpenClaw Gateway Token: " OPENCLAW_TOKEN
read -p "OpenClaw URL [http://localhost:18789]: " OPENCLAW_URL
OPENCLAW_URL=${OPENCLAW_URL:-http://localhost:18789}
read -p "模型 [kimi-coding/k2p5]: " QUAD_MODEL
QUAD_MODEL=${QUAD_MODEL:-kimi-coding/k2p5}

# 生成 .env 文件
cat > .env << EOF
# Discord Webhooks 配置
# 生成时间: $(date)

# ===== 基础四脑（必需） =====
WEBHOOK_PM=${WEBHOOK_PM}
WEBHOOK_DEV=${WEBHOOK_DEV}
WEBHOOK_REVIEWER=${WEBHOOK_REVIEWER}
WEBHOOK_MEMO=${WEBHOOK_MEMO}

# ===== 扩展角色（可选） =====
WEBHOOK_TESTER=${WEBHOOK_TESTER}
WEBHOOK_ARCHITECT=${WEBHOOK_ARCHITECT}
WEBHOOK_SECURITY=${WEBHOOK_SECURITY}
WEBHOOK_OPTIMIZER=${WEBHOOK_OPTIMIZER}
WEBHOOK_WRITER=${WEBHOOK_WRITER}
WEBHOOK_UX=${WEBHOOK_UX}
WEBHOOK_DEVOPS=${WEBHOOK_DEVOPS}

# ===== OpenClaw 配置 =====
OPENCLAW_URL=${OPENCLAW_URL}
OPENCLAW_TOKEN=${OPENCLAW_TOKEN}
QUAD_MODEL=${QUAD_MODEL}
EOF

echo ""
echo "✅ 配置已保存到 .env 文件"
echo ""
echo "测试连接："
echo "  python3 quad_brain_extended.py --list-roles"
echo ""
echo "运行四脑协作："
echo "  python3 quad_brain_extended.py '你的任务' --discord"
