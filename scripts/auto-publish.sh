#!/bin/bash
#
# 智能知识液化发布系统
# 自动检测新技能并发布到网站
#

set -e

WORKSPACE="/root/.openclaw/workspace"
WEBSITE_DIR="/var/www/diyici.ai"
SOURCE_DIR="$WORKSPACE/diyici-source"
SKILLS_DIR="$WORKSPACE/skills"
KNOWLEDGE_DIR="$SOURCE_DIR/public/knowledge"
PUBLIC_SKILLS_DIR="$SOURCE_DIR/public/skills"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     🤖 智能知识液化发布系统                              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# 函数：从 SKILL.md 提取元数据
extract_skill_info() {
    local skill_file=$1
    local name=$(grep "^name:" "$skill_file" | head -1 | sed 's/name: //' | tr -d '"' | xargs)
    local desc=$(grep "^description:" "$skill_file" | head -1 | sed 's/description: //' | tr -d '"' | xargs)
    
    if [ -z "$name" ]; then
        name=$(basename "$skill_file" | sed 's/.md$//')
    fi
    
    echo "$name|$desc"
}

# 函数：更新 index.json
update_index() {
    echo -e "${BLUE}📝 更新知识库索引...${NC}"
    
    # 创建新的 index.json
    cat > "$KNOWLEDGE_DIR/index.json" << 'EOF'
{
  "version": "1.0.0",
  "updated": "EOF'
    
    echo "$(date +%Y-%m-%d)", >> "$KNOWLEDGE_DIR/index.json"
    
    cat >> "$KNOWLEDGE_DIR/index.json" <> 'EOF'
  "knowledge_base": [
EOF'

    # 遍历所有知识文件
    local first=true
    for md_file in "$KNOWLEDGE_DIR"/*.md; do
        [ -f "$md_file" ] || continue
        [[ "$md_file" == *"index.md" ]] && continue
        
        local id=$(basename "$md_file" .md)
        local skill_md="$SKILLS_DIR/$id/SKILL.md"
        
        # 提取信息
        local name="$id"
        local desc="AI技能"
        local category="AI工具"
        local tags='["AI", "自动化"]'
        local size_kb=$(du -k "$md_file" | cut -f1)
        local quick_start="用$id执行任务"
        
        if [ -f "$skill_md" ]; then
            local info=$(extract_skill_info "$skill_md")
            name=$(echo "$info" | cut -d'|' -f1)
            desc=$(echo "$info" | cut -d'|' -f2)
        fi
        
        # 根据id判断分类
        if [[ "$id" == *"xhs"* ]] || [[ "$id" == *"redbook"* ]]; then
            category="内容创作"
            tags='["小红书", "内容生产"]'
        elif [[ "$id" == *"code"* ]] || [[ "$id" == *"dev"* ]] || [[ "$id" == *"brain"* ]]; then
            category="开发工具"
            tags='["AI协作", "代码生成"]'
        fi
        
        # 添加逗号
        if [ "$first" = true ]; then
            first=false
        else
            echo "," >> "$KNOWLEDGE_DIR/index.json"
        fi
        
        # 输出JSON条目
        cat >> "$KNOWLEDGE_DIR/index.json" <> EOF
    {
      "id": "$id",
      "name": "$name",
      "tagline": "$desc",
      "description": "$desc",
      "category": "$category",
      "tags": $tags,
      "file": "/knowledge/$id.md",
      "skill_file": "/skills/$id.skill",
      "size_kb": $size_kb
    }
EOF
    done
    
    echo "" >> "$KNOWLEDGE_DIR/index.json"
    echo "  ]" >> "$KNOWLEDGE_DIR/index.json"
    echo "}" >> "$KNOWLEDGE_DIR/index.json"
    
    echo -e "${GREEN}✓${NC} 索引更新完成"
}

# 函数：同步技能包
sync_skills() {
    echo ""
    echo -e "${BLUE}📦 同步技能包...${NC}"
    
    mkdir -p "$PUBLIC_SKILLS_DIR"
    
    # 查找所有 .skill 文件并复制
    local count=0
    for skill_file in "$WORKSPACE"/*.skill; do
        [ -f "$skill_file" ] || continue
        cp "$skill_file" "$PUBLIC_SKILLS_DIR/"
        count=$((count + 1))
        echo -e "  ${GREEN}✓${NC} $(basename "$skill_file")"
    done
    
    echo -e "${GREEN}✓${NC} 同步了 $count 个技能包"
}

# 函数：构建和部署
deploy() {
    echo ""
    echo -e "${BLUE}🔨 构建项目...${NC}"
    cd "$SOURCE_DIR"
    
    if ! npm run build > /tmp/build.log 2>&1; then
        echo -e "${RED}❌ 构建失败${NC}"
        tail -20 /tmp/build.log
        return 1
    fi
    
    echo -e "${GREEN}✓${NC} 构建成功"
    
    echo ""
    echo -e "${BLUE}📤 部署到网站...${NC}"
    
    # 备份
    local backup="backup.$(date +%Y%m%d_%H%M%S)"
    cp -r "$WEBSITE_DIR" "/tmp/$backup" 2>/dev/null || true
    
    # 部署
    cp -r "$SOURCE_DIR/dist/"* "$WEBSITE_DIR/"
    
    # 确保目录存在
    mkdir -p "$WEBSITE_DIR/knowledge"
    mkdir -p "$WEBSITE_DIR/skills"
    
    # 同步知识文件
    cp "$KNOWLEDGE_DIR/"* "$WEBSITE_DIR/knowledge/" 2>/dev/null || true
    cp "$PUBLIC_SKILLS_DIR/"* "$WEBSITE_DIR/skills/" 2>/dev/null || true
    
    echo -e "${GREEN}✓${NC} 部署完成"
}

# 主流程
echo -e "${BLUE}🔍 扫描知识库...${NC}"

# 显示当前知识
local knowledge_count=$(ls -1 "$KNOWLEDGE_DIR"/*.md 2>/dev/null | wc -l)
echo -e "  发现 ${CYAN}$knowledge_count${NC} 个知识文件"

local skill_count=$(ls -1 "$WORKSPACE"/*.skill 2>/dev/null | wc -l)
echo -e "  发现 ${CYAN}$skill_count${NC} 个技能包"
echo ""

# 询问用户
if [ "$1" == "--auto" ]; then
    echo -e "${YELLOW}🤖 自动模式，无需确认${NC}"
else
    echo -e "${YELLOW}是否继续发布? (y/n)${NC}"
    read -r confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo -e "${YELLOW}已取消${NC}"
        exit 0
    fi
fi

# 执行发布
update_index
sync_skills
deploy

# 完成
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ 知识液化发布成功!                                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}访问地址:${NC}"
echo "  🌐 https://diyici.ai/#/kb"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo "  强制刷新: Ctrl+F5"
echo "  自动模式: $0 --auto"
echo ""
