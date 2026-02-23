#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
外卖店铺智能诊断模型
四脑协作开发成果 - DEV阶段

使用方法:
    python waimai_diagnosis.py --input data.json
    python waimai_diagnosis.py --demo
"""

import json
import argparse
from dataclasses import dataclass, asdict
from typing import Dict, List, Tuple
from datetime import datetime
import math


@dataclass
class ShopMetrics:
    """店铺指标数据类"""
    exposure_count: int = 0          # 曝光人数
    visit_rate: float = 0.0          # 进店转化率 %
    order_rate: float = 0.0          # 下单转化率 %
    avg_order_value: float = 0.0     # 客单价 元
    order_count: int = 0             # 订单量
    repurchase_rate: float = 0.0     # 复购率 %
    positive_rate: float = 0.0       # 好评率 %
    negative_rate: float = 0.0       # 差评率 %
    ontime_rate: float = 0.0         # 配送准时率 %
    refund_rate: float = 0.0         # 退款率 %
    complaint_rate: float = 0.0      # 投诉率 %


class IndustryBenchmarks:
    """行业基准数据"""
    
    # 指标定义：(最低值, 平均値, 优秀値, 权重, 是否为负向指标)
    BENCHMARKS = {
        # 流量指标
        "exposure_count": (5000, 15000, 50000, 0.08, False),      # 曝光人数
        "visit_rate": (3.0, 8.0, 15.0, 0.10, False),              # 进店转化率
        
        # 转化指标
        "order_rate": (15.0, 25.0, 35.0, 0.12, False),            # 下单转化率
        "avg_order_value": (20.0, 35.0, 50.0, 0.10, False),       # 客单价
        "order_count": (100, 300, 800, 0.08, False),              # 订单量
        
        # 用户指标
        "repurchase_rate": (8.0, 20.0, 35.0, 0.12, False),        # 复购率
        "positive_rate": (85.0, 92.0, 98.0, 0.10, False),         # 好评率
        "negative_rate": (10.0, 5.0, 1.0, 0.08, True),            # 差评率 (负向)
        
        # 服务指标
        "ontime_rate": (85.0, 93.0, 98.0, 0.10, False),           # 配送准时率
        "refund_rate": (8.0, 3.0, 0.5, 0.06, True),               # 退款率 (负向)
        "complaint_rate": (3.0, 1.0, 0.1, 0.06, True),            # 投诉率 (负向)
    }
    
    @classmethod
    def get_metric_config(cls, metric_name: str) -> Tuple:
        """获取指标配置"""
        return cls.BENCHMARKS.get(metric_name, (0, 0, 0, 0, False))
    
    @classmethod
    def get_all_metrics(cls) -> List[str]:
        """获取所有指标名称"""
        return list(cls.BENCHMARKS.keys())


class DiagnosisEngine:
    """诊断引擎"""
    
    def __init__(self):
        self.benchmarks = IndustryBenchmarks()
    
    def calculate_score(self, metric_name: str, value: float) -> float:
        """
        计算单项指标得分 (0-100)
        
        对于正向指标: 越高越好
        对于负向指标: 越低越好
        """
        low, avg, high, weight, is_negative = self.benchmarks.get_metric_config(metric_name)
        
        if is_negative:
            # 负向指标：值越低越好
            # 最低值(最差) -> 0分, 优秀值(最好) -> 100分
            if value >= low:
                return 0.0
            elif value <= high:
                return 100.0
            else:
                # 线性插值
                score = 100.0 - ((value - high) / (low - high) * 100.0)
                return max(0.0, min(100.0, score))
        else:
            # 正向指标：值越高越好
            if value <= low:
                return 0.0
            elif value >= high:
                return 100.0
            else:
                # 线性插值
                score = (value - low) / (high - low) * 100.0
                return max(0.0, min(100.0, score))
    
    def diagnose(self, metrics: ShopMetrics) -> Dict:
        """
        执行诊断
        
        Returns:
            包含详细诊断结果的字典
        """
        results = {
            "timestamp": datetime.now().isoformat(),
            "metrics_detail": {},
            "total_score": 0.0,
            "grade": "",
            "grade_emoji": "",
            "strengths": [],
            "weaknesses": [],
            "suggestions": []
        }
        
        metric_values = asdict(metrics)
        weighted_sum = 0.0
        total_weight = 0.0
        
        for metric_name in self.benchmarks.get_all_metrics():
            value = metric_values.get(metric_name, 0)
            score = self.calculate_score(metric_name, value)
            _, _, _, weight, is_negative = self.benchmarks.get_metric_config(metric_name)
            
            results["metrics_detail"][metric_name] = {
                "value": value,
                "score": round(score, 2),
                "weight": weight,
                "weighted_score": round(score * weight, 2),
                "is_negative": is_negative
            }
            
            weighted_sum += score * weight
            total_weight += weight
        
        # 计算综合得分
        results["total_score"] = round(weighted_sum / total_weight, 2) if total_weight > 0 else 0
        
        # 确定等级
        results["grade"], results["grade_emoji"] = self._get_grade(results["total_score"])
        
        # 识别强项和短板（按加权得分排序）
        sorted_metrics = sorted(
            results["metrics_detail"].items(),
            key=lambda x: x[1]["weighted_score"],
            reverse=True
        )
        
        # 前3名为强项
        results["strengths"] = [
            {"name": name, **detail} 
            for name, detail in sorted_metrics[:3]
        ]
        
        # 后3名为短板
        results["weaknesses"] = [
            {"name": name, **detail} 
            for name, detail in sorted_metrics[-3:]
        ]
        
        # 生成改进建议
        results["suggestions"] = self._generate_suggestions(results["weaknesses"])
        
        return results
    
    def _get_grade(self, score: float) -> Tuple[str, str]:
        """根据分数确定等级"""
        if score >= 90:
            return "S级", "🏆"
        elif score >= 80:
            return "A级", "🥇"
        elif score >= 70:
            return "B级", "🥈"
        elif score >= 60:
            return "C级", "🥉"
        else:
            return "D级", "⚠️"
    
    def _generate_suggestions(self, weaknesses: List[Dict]) -> List[Dict]:
        """根据短板生成改进建议"""
        
        suggestion_templates = {
            "exposure_count": {
                "title": "提升店铺曝光",
                "actions": [
                    "优化店铺名称和关键词，提高搜索排名",
                    "参与平台推广活动，购买竞价排名",
                    "提升店铺评分，获得自然流量加权",
                    "完善店铺信息，增加标签分类"
                ]
            },
            "visit_rate": {
                "title": "优化进店转化",
                "actions": [
                    "更换高质量店铺头图和菜品图片",
                    "优化店铺公告和活动展示",
                    "设置吸引人的满减活动",
                    "突出爆款菜品和特色推荐"
                ]
            },
            "order_rate": {
                "title": "提升下单转化",
                "actions": [
                    "优化菜单结构，减少选择困难",
                    "设置套餐组合，提高客单价",
                    "展示真实好评和销量数据",
                    "提供首单优惠刺激下单"
                ]
            },
            "avg_order_value": {
                "title": "提高客单价",
                "actions": [
                    "设计阶梯满减活动",
                    "推出加价购/凑单商品",
                    "设置组合套餐优惠",
                    "推荐高利润菜品"
                ]
            },
            "order_count": {
                "title": "增加订单量",
                "actions": [
                    "分析热销时段，精准投放推广",
                    "扩大配送范围",
                    "推出限时折扣活动",
                    "与周边企业/社区合作团餐"
                ]
            },
            "repurchase_rate": {
                "title": "提升复购率",
                "actions": [
                    "建立会员体系，发放复购优惠券",
                    "随单附赠小礼品或感谢卡",
                    "定期推送新品和优惠活动",
                    "提升菜品品质和服务体验"
                ]
            },
            "positive_rate": {
                "title": "增加好评",
                "actions": [
                    "主动邀请满意客户留评",
                    "随单附赠好评返现卡",
                    "快速响应和解决客户问题",
                    "保证菜品质量和包装"
                ]
            },
            "negative_rate": {
                "title": "降低差评",
                "actions": [
                    "建立差评快速响应机制",
                    "主动联系差评客户解决问题",
                    "分析差评原因，针对性改进",
                    "提升出餐速度和包装质量"
                ]
            },
            "ontime_rate": {
                "title": "提升配送准时率",
                "actions": [
                    "合理设置出餐时间预期",
                    "优化后厨出餐流程",
                    "高峰期提前备餐",
                    "与配送员建立良好关系"
                ]
            },
            "refund_rate": {
                "title": "降低退款率",
                "actions": [
                    "加强出餐质量检查",
                    "确保菜品描述准确",
                    "提升包装防漏防洒能力",
                    "及时沟通解决客户问题"
                ]
            },
            "complaint_rate": {
                "title": "减少投诉",
                "actions": [
                    "建立客户反馈快速响应机制",
                    "培训客服沟通技巧",
                    "定期分析投诉原因",
                    "主动回访不满意的客户"
                ]
            }
        }
        
        suggestions = []
        for weakness in weaknesses:
            metric_name = weakness["name"]
            template = suggestion_templates.get(metric_name, {
                "title": f"改进{metric_name}",
                "actions": ["分析具体原因，制定改进计划"]
            })
            
            suggestions.append({
                "metric": metric_name,
                "current_score": weakness["score"],
                "title": template["title"],
                "priority": "高" if weakness["score"] < 40 else "中",
                "actions": template["actions"]
            })
        
        return suggestions


class ReportGenerator:
    """报告生成器"""
    
    METRIC_NAMES = {
        "exposure_count": "曝光人数",
        "visit_rate": "进店转化率",
        "order_rate": "下单转化率",
        "avg_order_value": "客单价",
        "order_count": "订单量",
        "repurchase_rate": "复购率",
        "positive_rate": "好评率",
        "negative_rate": "差评率",
        "ontime_rate": "配送准时率",
        "refund_rate": "退款率",
        "complaint_rate": "投诉率"
    }
    
    def __init__(self, diagnosis_result: Dict, shop_info: Dict):
        self.result = diagnosis_result
        self.shop_info = shop_info
    
    def generate_text_report(self) -> str:
        """生成文本格式报告"""
        lines = []
        
        # 标题
        lines.append("=" * 60)
        lines.append("📊 外卖店铺智能诊断报告")
        lines.append("=" * 60)
        lines.append("")
        
        # 店铺信息
        lines.append(f"🏪 店铺名称: {self.shop_info.get('shop_name', '未命名')}")
        lines.append(f"📱 平台: {self.shop_info.get('platform', '未知')}")
        lines.append(f"📅 诊断周期: {self.shop_info.get('period', '未指定')}")
        lines.append(f"🕐 生成时间: {self.result['timestamp'][:19]}")
        lines.append("")
        
        # 综合评分
        lines.append("-" * 60)
        lines.append("【综合评分】")
        lines.append("-" * 60)
        lines.append(f""")
        ┌─────────────────────────────────────────┐
        │                                         │
        │     {self.result['grade_emoji']}  综合得分: {self.result['total_score']} 分        │
        │                                         │
        │        诊断等级: {self.result['grade']}              │
        │                                         │
        └─────────────────────────────────────────┘
        """)
        lines.append("")
        
        # 强项
        lines.append("-" * 60)
        lines.append("【核心优势】TOP 3")
        lines.append("-" * 60)
        for i, strength in enumerate(self.result['strengths'], 1):
            name = self.METRIC_NAMES.get(strength['name'], strength['name'])
            lines.append(f"{i}. {name}")
            lines.append(f"   当前值: {strength['value']} | 得分: {strength['score']} 分")
            lines.append("")
        
        # 短板
        lines.append("-" * 60)
        lines.append("【需改进】TOP 3")
        lines.append("-" * 60)
        for i, weakness in enumerate(self.result['weaknesses'], 1):
            name = self.METRIC_NAMES.get(weakness['name'], weakness['name'])
            lines.append(f"{i}. {name} ⚠️")
            lines.append(f"   当前值: {weakness['value']} | 得分: {weakness['score']} 分")
            lines.append("")
        
        # 改进建议
        lines.append("-" * 60)
        lines.append("【改进行动计划】")
        lines.append("-" * 60)
        for suggestion in self.result['suggestions']:
            name = self.METRIC_NAMES.get(suggestion['metric'], suggestion['metric'])
            lines.append(f"")
            lines.append(f"🔸 {suggestion['title']} [优先级: {suggestion['priority']}]")
            lines.append(f"   当前得分: {suggestion['current_score']} 分")
            lines.append(f"   建议行动:")
            for action in suggestion['actions']:
                lines.append(f"      • {action}")
        
        lines.append("")
        lines.append("=" * 60)
        lines.append("💡 提示: 本报告基于行业基准数据生成，仅供参考")
        lines.append("=" * 60)
        
        return "\n".join(lines)
    
    def generate_json_report(self) -> str:
        """生成JSON格式报告"""
        report = {
            "shop_info": self.shop_info,
            "diagnosis": self.result
        }
        return json.dumps(report, ensure_ascii=False, indent=2)


def demo():
    """运行演示"""
    print("🚀 外卖店铺诊断模型 - 演示模式\n")
    
    # 示例数据
    shop_info = {
        "shop_name": "老张牛肉面（示范店）",
        "platform": "美团外卖",
        "period": "2024年2月"
    }
    
    metrics = ShopMetrics(
        exposure_count=18500,      # 曝光人数
        visit_rate=7.8,            # 进店转化率 7.8%
        order_rate=22.5,           # 下单转化率 22.5%
        avg_order_value=32.0,      # 客单价 32元
        order_count=285,           # 订单量
        repurchase_rate=12.0,      # 复购率 12%
        positive_rate=89.0,        # 好评率 89%
        negative_rate=5.5,         # 差评率 5.5%
        ontime_rate=91.0,          # 配送准时率 91%
        refund_rate=4.0,           # 退款率 4%
        complaint_rate=1.2         # 投诉率 1.2%
    )
    
    # 执行诊断
    engine = DiagnosisEngine()
    result = engine.diagnose(metrics)
    
    # 生成报告
    generator = ReportGenerator(result, shop_info)
    report = generator.generate_text_report()
    
    print(report)
    
    # 保存报告
    filename = f"diagnosis_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"\n📄 报告已保存到: {filename}")
    
    return result


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='外卖店铺智能诊断模型')
    parser.add_argument('--demo', action='store_true', help='运行演示模式')
    parser.add_argument('--input', type=str, help='输入JSON文件路径')
    parser.add_argument('--output', type=str, default='report.txt', help='输出报告文件路径')
    
    args = parser.parse_args()
    
    if args.demo:
        demo()
    elif args.input:
        # 从文件读取数据
        with open(args.input, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        shop_info = {
            "shop_name": data.get("shop_name", "未命名店铺"),
            "platform": data.get("platform", "未知平台"),
            "period": data.get("period", "未指定")
        }
        
        metrics = ShopMetrics(**data.get("metrics", {}))
        
        engine = DiagnosisEngine()
        result = engine.diagnose(metrics)
        
        generator = ReportGenerator(result, shop_info)
        report = generator.generate_text_report()
        
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"✅ 诊断完成！报告已保存到: {args.output}")
        print(f"\n综合评分: {result['total_score']} 分 ({result['grade_emoji']} {result['grade']})")
    else:
        parser.print_help()
        print("\n💡 提示: 使用 --demo 参数运行演示模式")


if __name__ == "__main__":
    main()
