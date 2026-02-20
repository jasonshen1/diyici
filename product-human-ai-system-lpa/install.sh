#!/bin/bash
# 五层架构人机系统 - 安装脚本
# Install Script for Five-Layer Human-AI System
# 版本: v1.0.0

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
PRODUCT_NAME="五层架构人机系统"
PRODUCT_VERSION="v1.0.0"
INSTALL_DIR="/opt/human-ai-system"
CONFIG_DIR="$HOME/.openclaw"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   🚀 $PRODUCT_NAME 安装程序                                ║"
echo "║   版本: $PRODUCT_VERSION                                          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 检查依赖
check_dependencies() {
    echo -e "${BLUE}▶ 检查系统依赖...${NC}"
    
    local missing_deps=()
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ 缺少依赖: ${missing_deps[*]}${NC}"
        echo ""
        echo "请安装Docker和Docker Compose:"
        echo "  - Docker: https://docs.docker.com/get-docker/"
        echo "  - Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 所有依赖已满足${NC}"
}

# 创建目录结构
setup_directories() {
    echo ""
    echo -e "${BLUE}▶ 创建目录结构...${NC}"
    
    mkdir -p \
        "$INSTALL_DIR"/{config,workspace/{memory,protocols,skills},logs,ssl,nginx/sites} \
        "$CONFIG_DIR"
    
    echo -e "${GREEN}✅ 目录创建完成${NC}"
}

# 配置文件生成
generate_config() {
    echo ""
    echo -e "${BLUE}▶ 生成配置文件...${NC}"
    
    # 生成随机token
    GATEWAY_TOKEN=$(openssl rand -hex 32 2>/dev/null || date +%s | sha256sum | head -c 64)
    
    cat > "$INSTALL_DIR/.env" << EOF
# 五层架构人机系统 - 环境变量配置
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')

# Gateway配置
GATEWAY_TOKEN=$GATEWAY_TOKEN
GATEWAY_PORT=18789

# 时区设置
TZ=Asia/Shanghai

# 自动调优配置
AUTO_TUNE_INTERVAL=1800
AUTO_TUNE_THRESHOLD=3600

# 日志级别
LOG_LEVEL=info
EOF
    
    # 生成OpenClaw配置
    cat > "$INSTALL_DIR/config/openclaw.json" << 'EOF'
{
  "meta": {
    "version": "1.0",
    "name": "五层架构人机系统",
    "description": "基于指令链的AI协作系统"
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "kimi-coding/k2p5",
        "fallbacks": [
          "moonshot/kimi-k2-5",
          "deepseek/deepseek-chat"
        ]
      },
      "workspace": "~/.openclaw/workspace",
      "maxConcurrent": 2,
      "subagents": {
        "maxConcurrent": 4
      }
    }
  },
  "gateway": {
    "port": 18789,
    "bind": "0.0.0.0"
  },
  "heartbeat": {
    "intervalMinutes": 30
  }
}
EOF
    
    echo -e "${GREEN}✅ 配置文件生成完成${NC}"
    echo "   - 环境变量: $INSTALL_DIR/.env"
    echo "   - OpenClaw配置: $INSTALL_DIR/config/openclaw.json"
}

# 安装协议模板
install_protocols() {
    echo ""
    echo -e "${BLUE}▶ 安装协议模板...${NC}"
    
    # 复制协议模板
    cp -r protocols/* "$INSTALL_DIR/workspace/protocols/" 2>/dev/null || true
    
    echo -e "${GREEN}✅ 协议模板安装完成${NC}"
}

# 启动服务
start_services() {
    echo ""
    echo -e "${BLUE}▶ 启动服务...${NC}"
    
    cd "$INSTALL_DIR"
    
    if docker-compose up -d; then
        echo -e "${GREEN}✅ 服务启动成功${NC}"
    else
        echo -e "${RED}❌ 服务启动失败${NC}"
        echo "请检查Docker日志: docker-compose logs"
        exit 1
    fi
}

# 健康检查
health_check() {
    echo ""
    echo -e "${BLUE}▶ 执行健康检查...${NC}"
    
    local retries=0
    local max_retries=30
    
    while [ $retries -lt $max_retries ]; do
        if curl -s http://localhost:18789/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Gateway服务运行正常${NC}"
            return 0
        fi
        
        retries=$((retries + 1))
        echo "  等待服务启动... ($retries/$max_retries)"
        sleep 2
    done
    
    echo -e "${YELLOW}⚠️ 服务启动较慢，请稍后手动检查${NC}"
    return 1
}

# 显示完成信息
show_completion() {
    local ip=$(curl -s ip.sb 2>/dev/null || echo "localhost")
    
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║         🎉 安装完成！                                      ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📊 系统状态:"
    echo "   - Gateway: http://${ip}:18789"
    echo "   - Web面板: http://${ip} (Nginx)"
    echo "   - 日志查看: $INSTALL_DIR/logs/"
    echo ""
    echo "🔧 常用命令:"
    echo "   cd $INSTALL_DIR && docker-compose ps    # 查看服务状态"
    echo "   cd $INSTALL_DIR && docker-compose logs  # 查看日志"
    echo "   cd $INSTALL_DIR && bash upgrade.sh      # 升级系统"
    echo ""
    echo "📚 使用文档:"
    echo "   $INSTALL_DIR/README.md"
    echo ""
    echo "💡 提示: 首次启动可能需要1-2分钟，请耐心等待"
    echo ""
}

# 主流程
main() {
    check_dependencies
    setup_directories
    generate_config
    install_protocols
    start_services
    health_check
    show_completion
}

main "$@"
