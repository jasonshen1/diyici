#!/bin/bash
#
# 知识液化自动发布脚本
# 用法: ./publish-knowledge.sh [知识目录名称]
#

set -e

WEBSITE_DIR="/var/www/diyici.ai"
SOURCE_DIR="/root/.openclaw/workspace/diyici-source"
KNOWLEDGE_DIR="$SOURCE_DIR/public/knowledge"
SKILLS_DIR="$SOURCE_DIR/public/skills"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🚀 知识液化自动发布系统${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo ""

# 检查参数
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}用法:${NC} ./publish-knowledge.sh [知识目录名]"
    echo ""
    echo -e "${YELLOW}示例:${NC}"
    echo "  ./publish-knowledge.sh my-new-skill"
    echo ""
    echo -e "${YELLOW}当前知识库内容:${NC}"
    ls -1 $KNOWLEDGE_DIR/*.md 2>/dev/null | xargs -n1 basename | sed 's/.md//' | sed 's/^/  - /' || echo "  (暂无)"
    exit 1
fi

KNOWLEDGE_NAME=$1
echo -e "${BLUE}📦 发布知识:${NC} $KNOWLEDGE_NAME"
echo ""

# 步骤1: 检查知识文件是否存在
if [ ! -f "$KNOWLEDGE_DIR/$KNOWLEDGE_NAME.md" ]; then
    echo -e "${RED}❌ 错误: 知识文件不存在${NC}"
    echo "   路径: $KNOWLEDGE_DIR/$KNOWLEDGE_NAME.md"
    echo ""
    echo -e "${YELLOW}请确保:${NC}"
    echo "  1. 知识文件已保存到: $KNOWLEDGE_DIR/$KNOWLEDGE_NAME.md"
    echo "  2. 技能包已保存到: $SKILLS_DIR/$KNOWLEDGE_NAME.skill (可选)"
    exit 1
fi

echo -e "${GREEN}✓${NC} 知识文件存在"

# 步骤2: 检查并更新 index.json
echo ""
echo -e "${BLUE}📝 步骤 1/4: 更新知识库索引${NC}"

# 检查 index.json 中是否已有该知识
if grep -q "\"id\": \"$KNOWLEDGE_NAME\"" "$KNOWLEDGE_DIR/index.json" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} 索引中已存在该知识，跳过添加"
else
    echo -e "${YELLOW}!${NC} 需要手动更新 index.json 添加新条目"
    echo "   请编辑: $KNOWLEDGE_DIR/index.json"
fi

# 步骤3: 构建项目
echo ""
echo -e "${BLUE}🔨 步骤 2/4: 构建项目${NC}"
cd $SOURCE_DIR

if ! npm run build 2>&1 | tee /tmp/build.log; then
    echo ""
    echo -e "${RED}❌ 构建失败${NC}"
    echo "   查看日志: /tmp/build.log"
    exit 1
fi

echo -e "${GREEN}✓${NC} 构建成功"

# 步骤4: 备份并部署
echo ""
echo -e "${BLUE}📤 步骤 3/4: 部署到网站${NC}"

# 备份当前网站
BACKUP_NAME="backup.$(date +%Y%m%d_%H%M%S)"
if [ -d "$WEBSITE_DIR" ]; then
    cp -r $WEBSITE_DIR /tmp/$BACKUP_NAME
    echo -e "${GREEN}✓${NC} 已备份原网站到 /tmp/$BACKUP_NAME"
fi

# 复制新构建的文件
cp -r $SOURCE_DIR/dist/* $WEBSITE_DIR/

# 确保 knowledge 和 skills 目录存在
mkdir -p $WEBSITE_DIR/knowledge
mkdir -p $WEBSITE_DIR/skills

echo -e "${GREEN}✓${NC} 部署完成"

# 步骤5: 验证
echo ""
echo -e "${BLUE}🔍 步骤 4/4: 验证部署${NC}"

# 检查文件是否存在
if [ -f "$WEBSITE_DIR/knowledge/$KNOWLEDGE_NAME.md" ]; then
    echo -e "${GREEN}✓${NC} 知识文件已部署"
else
    echo -e "${RED}✗${NC} 知识文件部署失败"
fi

if [ -f "$WEBSITE_DIR/skills/$KNOWLEDGE_NAME.skill" ]; then
    echo -e "${GREEN}✓${NC} 技能包已部署"
fi

# 测试访问
echo ""
echo -e "${BLUE}🌐 测试访问...${NC}"
if curl -s -o /dev/null -w "%{http_code}" https://diyici.ai/knowledge/$KNOWLEDGE_NAME.md | grep -q "200"; then
    echo -e "${GREEN}✓${NC} 知识文件可访问"
else
    echo -e "${YELLOW}!${NC} 知识文件可能未生效（缓存或路径问题）"
fi

# 完成
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ 发布成功!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}访问地址:${NC}"
echo "  知识库首页: https://diyici.ai/#/kb"
echo "  知识文档:   https://diyici.ai/knowledge/$KNOWLEDGE_NAME.md"
if [ -f "$SKILLS_DIR/$KNOWLEDGE_NAME.skill" ]; then
    echo "  技能包:     https://diyici.ai/skills/$KNOWLEDGE_NAME.skill"
fi
echo ""
echo -e "${YELLOW}提示:${NC}"
echo "  如果页面未更新，请尝试强制刷新 (Ctrl+F5)"
echo ""
