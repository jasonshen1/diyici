#!/bin/bash
# Extended Agentic Team - 快速启动脚本

cd /root/.openclaw/workspace

echo "🤖 扩展智能体团队 - 快速启动"
echo "=============================="
echo ""

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 配置文件"
    echo "   请先运行: ./setup_discord.sh"
    echo ""
    read -p "是否现在配置? (y/n): " configure_now
    if [ "$configure_now" = "y" ]; then
        ./setup_discord.sh
    else
        echo "   请先配置后再运行"
        exit 1
    fi
fi

# 加载环境变量
export $(grep -v '^#' .env | xargs)

echo "✅ 配置已加载"
echo ""

# 显示菜单
echo "选择工作流:"
echo ""
echo "  1) 🧠 四脑基础版 (quad_basic)"
echo "     PM → DEV ↔ REVIEWER → MEMO"
echo ""
echo "  2) 🧪 四脑+测试版 (quad_with_tests)"
echo "     增加 TESTER 角色"
echo ""
echo "  3) 🏢 企业级流程 (enterprise)"
echo "     10个角色完整流程"
echo ""
echo "  4) 🛡️ 安全优先 (security_first)"
echo "     安全审计前置"
echo ""
echo "  5) 🚀 MVP快速 (mvp_fast)"
echo "     精简流程，快速验证"
echo ""
echo "  6) 📚 文档驱动 (docs_driven)"
echo "     先写文档再开发"
echo ""
echo "  0) 退出"
echo ""

read -p "选择 [0-6]: " choice

case $choice in
    1) WORKFLOW="quad_basic" ;;
    2) WORKFLOW="quad_with_tests" ;;
    3) WORKFLOW="enterprise" ;;
    4) WORKFLOW="security_first" ;;
    5) WORKFLOW="mvp_fast" ;;
    6) WORKFLOW="docs_driven" ;;
    0) echo "👋 再见!"; exit 0 ;;
    *) echo "❌ 无效选择"; exit 1 ;;
esac

echo ""
echo "已选择: $WORKFLOW"
echo ""

# 询问任务
read -p "🎯 输入任务描述: " task

if [ -z "$task" ]; then
    echo "❌ 任务不能为空"
    exit 1
fi

echo ""
echo "选择输出方式:"
echo "  1) Discord 频道 (需要配置 Webhooks)"
echo "  2) 仅控制台输出"
echo ""
read -p "选择 [1-2]: " output_choice

if [ "$output_choice" = "1" ]; then
    DISCORD_FLAG="--discord"
    echo ""
    echo "📤 将输出到 Discord 频道"
else
    DISCORD_FLAG=""
    echo ""
    echo "💻 将仅输出到控制台"
fi

echo ""
echo "🚀 启动四脑协作..."
echo "=============================="
python3 quad_brain_extended.py "$task" --workflow $WORKFLOW $DISCORD_FLAG

echo ""
echo "✅ 完成!"
echo ""
read -p "是否保存报告? (y/n): " save_report

if [ "$save_report" = "y" ]; then
    # 查找最新的报告文件
    latest_report=$(ls -t agentic_report_*.md 2>/dev/null | head -1)
    if [ -n "$latest_report" ]; then
        echo "   报告已保存: $latest_report"
    else
        echo "   未找到报告文件"
    fi
fi

echo ""
echo "👋 感谢使用!"
