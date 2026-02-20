#!/bin/bash
# GitHub 仓库自动监听更新脚本
# 用于 jasonshen1/diyici 仓库的自动部署

# 配置
REPO_OWNER="jasonshen1"
REPO_NAME="diyici"
REPO_BRANCH="master"
GITHUB_TOKEN="${GITHUB_TOKEN:-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}"
LOCAL_REPO_DIR="/root/.openclaw/workspace/diyici-source"
DEPLOY_DIR="/var/www/diyici.ai"
LAST_COMMIT_FILE="/tmp/last-deployed-commit"
LOG_FILE="/var/log/auto-deploy.log"
NOTIFY_USER="C7D27CB103300565F96DEDBA1721196D"

# 记录日志
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 获取最新提交
get_latest_commit() {
    curl -s \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/commits/$REPO_BRANCH" | \
        grep -o '"sha": "[^"]*"' | head -1 | cut -d'"' -f4
}

# 获取提交信息
get_commit_info() {
    local commit_sha=$1
    curl -s \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/commits/$commit_sha"
}

# 主检查逻辑
check_and_deploy() {
    log "========== 开始检查仓库更新 =========="
    
    # 获取最新提交 SHA
    LATEST_COMMIT=$(get_latest_commit)
    
    if [ -z "$LATEST_COMMIT" ]; then
        log "❌ 无法获取最新提交信息"
        exit 1
    fi
    
    log "📦 最新提交: ${LATEST_COMMIT:0:7}"
    
    # 读取上次部署的提交
    if [ -f "$LAST_COMMIT_FILE" ]; then
        LAST_COMMIT=$(cat "$LAST_COMMIT_FILE")
        log "📦 上次部署: ${LAST_COMMIT:0:7}"
    else
        LAST_COMMIT=""
        log "📦 首次部署检测"
    fi
    
    # 比较提交
    if [ "$LATEST_COMMIT" = "$LAST_COMMIT" ]; then
        log "✅ 仓库无更新，跳过部署"
        log "========== 检查完成 =========="
        exit 0
    fi
    
    log "🚀 检测到新提交，开始自动部署..."
    
    # 获取提交详细信息
    COMMIT_INFO=$(get_commit_info "$LATEST_COMMIT")
    COMMIT_MSG=$(echo "$COMMIT_INFO" | grep -o '"message": "[^"]*"' | head -1 | cut -d'"' -f4)
    COMMIT_AUTHOR=$(echo "$COMMIT_INFO" | grep -o '"name": "[^"]*"' | head -1 | cut -d'"' -f4)
    COMMIT_DATE=$(echo "$COMMIT_INFO" | grep -o '"date": "[^"]*"' | head -1 | cut -d'"' -f4)
    
    log "📝 提交信息: $COMMIT_MSG"
    log "👤 提交者: $COMMIT_AUTHOR"
    log "📅 提交时间: $COMMIT_DATE"
    
    # 执行部署
    deploy_latest "$LATEST_COMMIT" "$COMMIT_MSG" "$COMMIT_AUTHOR"
}

# 部署最新代码
deploy_latest() {
    local commit_sha=$1
    local commit_msg=$2
    local commit_author=$3
    
    log "📥 下载最新代码..."
    
    # 备份当前版本
    if [ -d "$LOCAL_REPO_DIR" ]; then
        BACKUP_DIR="${LOCAL_REPO_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
        mv "$LOCAL_REPO_DIR" "$BACKUP_DIR"
        log "📦 旧版本已备份到: $BACKUP_DIR"
    fi
    
    # 下载最新代码
    cd /root/.openclaw/workspace
    curl -L \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/zipball/$REPO_BRANCH" \
        -o diyici-latest.zip
    
    if [ ! -f "diyici-latest.zip" ]; then
        log "❌ 代码下载失败"
        return 1
    fi
    
    # 解压
    unzip -q diyici-latest.zip
    mv ${REPO_OWNER}-${REPO_NAME}-* "$LOCAL_REPO_DIR"
    rm -f diyici-latest.zip
    
    log "✅ 代码下载完成"
    
    # 构建
    log "🔨 开始构建..."
    cd "$LOCAL_REPO_DIR"
    
    if ! npm install > /dev/null 2>&1; then
        log "❌ npm install 失败"
        return 1
    fi
    
    if ! npm run build > /dev/null 2>&1; then
        log "❌ npm run build 失败"
        return 1
    fi
    
    if [ ! -d "dist" ]; then
        log "❌ 构建产物不存在"
        return 1
    fi
    
    log "✅ 构建完成"
    
    # 部署
    log "🚀 部署到生产环境..."
    
    # 备份生产环境
    sudo cp -r "$DEPLOY_DIR" "${DEPLOY_DIR}.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    
    # 清空并复制新文件
    sudo rm -rf "$DEPLOY_DIR"/*
    sudo cp -r dist/* "$DEPLOY_DIR/"
    sudo chown -R nginx:nginx "$DEPLOY_DIR"
    sudo chmod -R 755 "$DEPLOY_DIR"
    
    log "✅ 部署完成"
    
    # 记录本次部署的提交
    echo "$commit_sha" > "$LAST_COMMIT_FILE"
    
    # 记录到 memory
    cat >> /root/.openclaw/workspace/memory/auto-deploy.log << EOF

## $(date '+%Y-%m-%d %H:%M:%S') 自动部署记录
- **提交**: ${commit_sha:0:7}
- **信息**: $commit_msg
- **作者**: $commit_author
- **状态**: ✅ 成功

EOF
    
    log "========== 部署完成 =========="
    
    # 返回成功信息和提交信息
    echo "DEPLOY_SUCCESS"
    echo "$commit_sha"
    echo "$commit_msg"
    echo "$commit_author"
}

# 执行检查
check_and_deploy
