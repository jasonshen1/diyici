#!/bin/bash
# 四脑协同系统启动脚本

echo "🧠 四脑协同系统 - 启动器"
echo "=========================="

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 Python3，请先安装"
    exit 1
fi

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "📥 安装依赖..."
pip install -q aiohttp discord.py python-dotenv

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到 .env 文件"
    echo "   请复制 four_brain_system.env.example 为 .env 并填写配置"
    exit 1
fi

# 启动
echo "🚀 启动四脑协同系统..."
echo "   按 Ctrl+C 停止"
echo ""

python3 four_brain_system.py
