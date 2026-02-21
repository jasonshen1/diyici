#!/bin/bash
# diyici.ai 每日统计报告脚本

API_URL="http://localhost:3000/api/analytics/stats?token=diyici2024"

# 获取统计数据
STATS=$(curl -s "$API_URL")

# 解析数据
TOTAL=$(echo $STATS | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('totalVisits', 0))")
TODAY=$(echo $STATS | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('todayVisits', 0))")
UNIQUE=$(echo $STATS | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('uniqueVisitors', 0))")
TODAY_UNIQUE=$(echo $STATS | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('todayUniqueVisitors', 0))")

# 输出报告
echo "📊 diyici.ai 网站访问日报"
echo ""
echo "$(date '+%Y年%m月%d日')"
echo ""
echo "📈 访问数据："
echo "• 总访问量：${TOTAL}"
echo "• 今日访问：${TODAY}"
echo "• 独立访客：${UNIQUE}"
echo "• 今日独立访客：${TODAY_UNIQUE}"
echo ""
echo "🔗 查看详细统计：https://diyici.ai/stats.html"
