#!/bin/bash
# 设置脚本权限
chmod +x /root/.openclaw/workspace/product-human-ai-system/*.sh

# 创建压缩包
cd /root/.openclaw/workspace
tar -czf human-ai-system-v1.0.0.tar.gz product-human-ai-system/

echo "✅ 产品部署包已生成！"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  📦 产品信息"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  产品名称: 五层架构人机系统"
echo "  版本: v1.0.0"
echo "  文件: human-ai-system-v1.0.0.tar.gz"
echo "  大小: $(ls -lh human-ai-system-v1.0.0.tar.gz | awk '{print $5}')"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  📂 部署包结构"
echo "════════════════════════════════════════════════════════════"
echo ""
tree -L 2 product-human-ai-system/ 2>/dev/null || find product-human-ai-system/ -maxdepth 2 -type f | head -20
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  💰 定价建议"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  开源版 (Free):"
echo "    • 包含: 基础五层架构 + 3个协议模板"
echo "    • 适用: 个人学习、小型项目"
echo ""
echo "  专业版 (¥999):"
echo "    • 包含: 全部协议 + 自动化脚本 + 技术支持"
echo "    • 适用: 自由职业者、小型团队"
echo ""
echo "  企业版 (¥4999):"
echo "    • 包含: 全部功能 + 定制开发 + 培训服务"
echo "    • 适用: 企业客户、定制化需求"
echo ""
echo "════════════════════════════════════════════════════════════"
