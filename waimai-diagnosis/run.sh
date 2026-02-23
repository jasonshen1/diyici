#!/bin/bash
# 外卖店铺诊断工具 - 一键诊断脚本

echo "🚀 外卖店铺智能诊断系统"
echo "========================"
echo ""

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 Python3，请先安装 Python3"
    exit 1
fi

# 显示菜单
echo "请选择操作:"
echo "1) 运行演示模式"
echo "2) 使用示例数据诊断"
echo "3) 自定义数据诊断"
echo "4) 退出"
echo ""
read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🎯 正在运行演示模式..."
        python3 waimai_diagnosis.py --demo
        ;;
    2)
        echo ""
        echo "🎯 使用示例数据进行诊断..."
        python3 waimai_diagnosis.py --input example_data.json --output report_example.txt
        echo ""
        echo "✅ 诊断完成！查看报告: report_example.txt"
        ;;
    3)
        echo ""
        read -p "请输入数据文件路径 (如: my_data.json): " data_file
        if [ -f "$data_file" ]; then
            read -p "请输入输出报告名称 (默认: report.txt): " report_name
            report_name=${report_name:-report.txt}
            python3 waimai_diagnosis.py --input "$data_file" --output "$report_name"
            echo ""
            echo "✅ 诊断完成！查看报告: $report_name"
        else
            echo "❌ 错误: 文件不存在: $data_file"
            echo "💡 提示: 参考 example_data.json 创建你的数据文件"
        fi
        ;;
    4)
        echo "👋 再见！"
        exit 0
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac
