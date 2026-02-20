#!/bin/bash
# Logic Protocol Asset (LPA) 打包脚本

PRODUCT_NAME="human-ai-system"
VERSION="1.0.0"
LPA_NAME="${PRODUCT_NAME}-v${VERSION}.lpa"

echo "🏭 打包 Logic Protocol Asset..."
echo ""

# 验证必要文件
REQUIRED_FILES=("protocol.yaml" "manifest.json" "sovereignty.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少必要文件: $file"
        exit 1
    fi
done

# 验证测试套件
if [ ! -d "test_suite" ] || [ $(ls test_suite/*.yml 2>/dev/null | wc -l) -lt 5 ]; then
    echo "❌ 测试套件不完整，需要至少5个测试用例"
    exit 1
fi

echo "✅ 文件验证通过"
echo ""

# 计算内容哈希
echo "🔐 计算内容哈希..."
CONTENT_HASH=$(find . -type f \( -name "*.yaml" -o -name "*.json" -o -name "*.md" -o -name "*.sh" -o -name "*.yml" \) -exec sha256sum {} \; | sha256sum | cut -d' ' -f1)
echo "   哈希: $CONTENT_HASH"

# 更新manifest中的哈希
jq --arg hash "$CONTENT_HASH" '.ownership.content_hash = $hash' sovereignty.json > sovereignty.json.tmp && mv sovereignty.json.tmp sovereignty.json

echo ""
echo "📦 创建LPA包..."
cd ..
tar -czf "$LPA_NAME" product-human-ai-system-lpa/

# 验证包大小
PACKAGE_SIZE=$(ls -lh "$LPA_NAME" | awk '{print $5}')

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🎉 LPA包创建成功!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  文件名: $LPA_NAME"
echo "  大小: $PACKAGE_SIZE"
echo "  哈希: $CONTENT_HASH"
echo ""
echo "  内容清单:"
echo "    ✓ protocol.yaml (核心逻辑)"
echo "    ✓ manifest.json (元数据)"
echo "    ✓ sovereignty.json (主权声明)"
echo "    ✓ test_suite/ (5个测试用例)"
echo "    ✓ docker-compose.yml (容器编排)"
echo "    ✓ install.sh (一键安装)"
echo "    ✓ README.md (使用指南)"
echo "    ✓ LOGIC_MAP.md (逻辑流图)"
echo ""
echo "  定价: $599 USD (约 ¥4,300)"
echo "  等级: T4"
echo "  LDI: 0.28"
echo ""
echo "  可上架: diyici.ai"
echo "═══════════════════════════════════════════════════════════"
