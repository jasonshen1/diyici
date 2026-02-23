#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
外卖店铺智能诊断模型 - PRD完整版实现
基于PRD v1.0规范

使用方法:
    python waimai_diagnosis_pro.py --input data.json
    python waimai_diagnosis_pro.py --demo
"""

import json
import argparse
from dataclasses import dataclass, asdict, field
from typing import Dict, List, Tuple, Optional
from datetime import datetime
from enum import Enum
import math


class Grade(Enum):
    """诊断等级"""
    S = ("S", "卓越", 90, 100, "🟢")
    A = ("A", "优秀", 80, 89, "🟢")
    B = ("B", "良好", 70, 79, "🟡")
    C = ("C", "需改进", 60, 69, "🟠")
    D = ("D", "危险", 0, 59, "🔴")
    
    def __init__(self, code, desc, min_score, max_score, emoji):
        self.code = code
        self.desc = desc
        self.min_score = min_score
        self.max_score = max_score
        self.emoji = emoji


@dataclass
class MetricConfig:
    """指标配置"""
    metric_id: str
    name: str
    thresholds: List[float]  # [优秀, 良好, 及格]
    direction: str  # "higher" or "lower"
    unit: str
    weight: float
    category: str


@dataclass
class MetricResult:
    """指标结果"""
    metric_id: str
    name: str
    value: float
    score: float
    grade: str
    status: str
    target: float
    suggestion: str
    weight: float = 0.0
    weighted_score: float = 0.0


# 指标配置（基于PRD）
METRIC_CONFIGS = {
    # 流量指标组 (25%)
    "EXP_DAILY": MetricConfig("EXP_DAILY", "日均曝光量", [5000, 3000, 1500], "higher", "次", 0.0875, "traffic"),
    "CTR_VISIT": MetricConfig("CTR_VISIT", "进店转化率", [12, 8, 5], "higher", "%", 0.075, "traffic"),
    "SEARCH_RANK": MetricConfig("SEARCH_RANK", "搜索排名", [3, 8, 15], "lower", "名", 0.05, "traffic"),
    "AD_CTR": MetricConfig("AD_CTR", "推广点击率", [5, 3, 1.5], "higher", "%", 0.025, "traffic"),
    "NEW_USER_RATE": MetricConfig("NEW_USER_RATE", "新客占比", [35, 25, 15], "higher", "%", 0.0125, "traffic"),
    
    # 转化指标组 (30%)
    "CVR_ORDER": MetricConfig("CVR_ORDER", "下单转化率", [20, 15, 10], "higher", "%", 0.12, "conversion"),
    "CVR_CART": MetricConfig("CVR_CART", "加购转化率", [35, 25, 15], "higher", "%", 0.075, "conversion"),
    "ORDER_PER_USER": MetricConfig("ORDER_PER_USER", "人均订单数", [2.0, 1.5, 1.2], "higher", "单/人", 0.06, "conversion"),
    "ORDER_SUCCESS": MetricConfig("ORDER_SUCCESS", "下单成功率", [98, 95, 90], "higher", "%", 0.03, "conversion"),
    "CVR_FAVORITE": MetricConfig("CVR_FAVORITE", "收藏转化率", [8, 5, 3], "higher", "%", 0.015, "conversion"),
    
    # 服务指标组 (20%)
    "RATING_OVERALL": MetricConfig("RATING_OVERALL", "店铺综合评分", [4.8, 4.6, 4.4], "higher", "分", 0.08, "service"),
    "BAD_RATE": MetricConfig("BAD_RATE", "差评率", [1, 2, 5], "lower", "%", 0.05, "service"),
    "COMPLAINT_RATE": MetricConfig("COMPLAINT_RATE", "投诉率", [0.3, 0.5, 1.5], "lower", "%", 0.03, "service"),
    "REPLY_RATE": MetricConfig("REPLY_RATE", "评分回复率", [98, 90, 70], "higher", "%", 0.02, "service"),
    "REPLY_TIME": MetricConfig("REPLY_TIME", "评分回复时长", [6, 12, 24], "lower", "小时", 0.02, "service"),
    
    # 效率指标组 (15%)
    "COOK_TIME": MetricConfig("COOK_TIME", "平均出餐时长", [10, 15, 25], "lower", "分钟", 0.0525, "efficiency"),
    "ON_TIME_RATE": MetricConfig("ON_TIME_RATE", "准时送达率", [98, 95, 88], "higher", "%", 0.045, "efficiency"),
    "CANCEL_RATE": MetricConfig("CANCEL_RATE", "退单率", [1, 3, 8], "lower", "%", 0.03, "efficiency"),
    "EXCEPTION_RATE": MetricConfig("EXCEPTION_RATE", "异常订单率", [1, 2, 5], "lower", "%", 0.015, "efficiency"),
    "CAPACITY_USE": MetricConfig("CAPACITY_USE", "产能利用率", [85, 70, 50], "higher", "%", 0.0075, "efficiency"),
    
    # 收益指标组 (10%)
    "AOV": MetricConfig("AOV", "客单价", [40, 30, 20], "higher", "元", 0.03, "revenue"),
    "GROSS_MARGIN": MetricConfig("GROSS_MARGIN", "毛利率", [45, 35, 25], "higher", "%", 0.03, "revenue"),
    "REPEAT_7D": MetricConfig("REPEAT_7D", "7日复购率", [30, 20, 12], "higher", "%", 0.02, "revenue"),
    "REPEAT_30D": MetricConfig("REPEAT_30D", "30日复购率", [50, 35, 20], "higher", "%", 0.015, "revenue"),
    "ROI": MetricConfig("ROI", "营销ROI", [400, 300, 150], "higher", "%", 0.005, "revenue"),
}

# 维度权重配置
CATEGORY_WEIGHTS = {
    "traffic": 0.25,
    "conversion": 0.30,
    "service": 0.20,
    "efficiency": 0.15,
    "revenue": 0.10
}

CATEGORY_NAMES = {
    "traffic": "流量指标",
    "conversion": "转化指标",
    "service": "服务指标",
    "efficiency": "效率指标",
    "revenue": "收益指标"
}


class DiagnosisEngine:
    """诊断引擎"""
    
    @staticmethod
    def calculate_metric_score(value: float, config: MetricConfig) -> Tuple[float, str]:
        """
        分段线性评分算法
        
        Args:
            value: 实际指标值
            config: 指标配置
            
        Returns:
            (得分, 状态)
        """
        excellent, good, fair = config.thresholds
        
        if config.direction == "higher":
            # 越高越好
            if value >= excellent:
                return 100, "excellent"
            elif value >= good:
                # 80-100分区间线性插值
                score = 80 + (value - good) / (excellent - good) * 20
                return round(score, 2), "good"
            elif value >= fair:
                # 60-80分区间线性插值
                score = 60 + (value - fair) / (good - fair) * 20
                return round(score, 2), "normal"
            else:
                # 0-60分区间
                score = max(0, value / fair * 60)
                return round(score, 2), "poor"
        else:
            # 越低越好
            if value <= excellent:
                return 100, "excellent"
            elif value <= good:
                score = 80 + (good - value) / (good - excellent) * 20
                return round(score, 2), "good"
            elif value <= fair:
                score = 60 + (fair - value) / (fair - good) * 20
                return round(score, 2), "normal"
            else:
                score = max(0, (fair * 2 - value) / fair * 60)
                return round(score, 2), "poor"
    
    @staticmethod
    def get_grade(score: float) -> str:
        """根据分数获取等级"""
        for grade in Grade:
            if grade.min_score <= score <= grade.max_score:
                return grade.code
        return "D"
    
    @staticmethod
    def get_grade_info(score: float) -> Grade:
        """获取等级详细信息"""
        for grade in Grade:
            if grade.min_score <= score <= grade.max_score:
                return grade
        return Grade.D
    
    @classmethod
    def generate_suggestion(cls, metric_id: str, status: str, value: float, config: MetricConfig) -> str:
        """生成指标级建议"""
        suggestions = {
            "EXP_DAILY": {
                "poor": "建议加大推广投放，优化搜索关键词",
                "normal": "可适当增加推广预算或优化店铺装修",
                "good": "保持当前推广策略",
                "excellent": "流量充足，考虑提升转化效率"
            },
            "CTR_VISIT": {
                "poor": "优化店铺Logo和名称，提升吸引力",
                "normal": "优化店铺头图和活动展示",
                "good": "保持当前进店转化水平",
                "excellent": "进店转化优秀，可复制经验到其他店铺"
            },
            "CVR_ORDER": {
                "poor": "优化菜单结构，设置引流款和利润款",
                "normal": "增加套餐组合，设置满减活动",
                "good": "转化效率良好",
                "excellent": "转化效率优秀"
            },
            "CVR_CART": {
                "poor": "优化加购引导，设置购物车优惠",
                "normal": "增加凑单商品，优化价格展示",
                "good": "加购转化良好",
                "excellent": "加购转化优秀"
            },
            "RATING_OVERALL": {
                "poor": "综合评分较低，需全面提升产品和服务",
                "normal": "关注低分评价，针对性改进",
                "good": "评分良好，继续保持",
                "excellent": "评分优秀，形成口碑优势"
            },
            "BAD_RATE": {
                "poor": "差评率过高，需立即整改产品质量和服务",
                "normal": "关注差评原因，针对性改进",
                "good": "差评控制良好",
                "excellent": "用户满意度高"
            },
            "COMPLAINT_RATE": {
                "poor": "投诉率过高，需建立客服快速响应机制",
                "normal": "分析投诉原因，优化服务流程",
                "good": "投诉控制良好",
                "excellent": "服务质量优秀"
            },
            "COOK_TIME": {
                "poor": "严重超时，需立即优化出餐流程",
                "normal": "可适当优化备餐和出餐动线",
                "good": "出餐效率良好",
                "excellent": "出餐效率优秀"
            },
            "ON_TIME_RATE": {
                "poor": "准时率过低，需优化出餐和配送流程",
                "normal": "可适当提升出餐效率",
                "good": "准时率良好",
                "excellent": "准时率优秀"
            },
            "CANCEL_RATE": {
                "poor": "退单率过高，需分析原因并改进",
                "normal": "关注退单原因，优化商品描述",
                "good": "退单控制良好",
                "excellent": "订单稳定性好"
            },
            "AOV": {
                "poor": "客单价偏低，可推出套餐和加价购",
                "normal": "可优化商品结构提升客单价",
                "good": "客单价良好",
                "excellent": "客单价优秀"
            },
            "GROSS_MARGIN": {
                "poor": "毛利率过低，需优化成本和定价",
                "normal": "可优化菜品结构提升毛利",
                "good": "毛利率良好",
                "excellent": "盈利能力优秀"
            },
            "REPEAT_7D": {
                "poor": "短期复购率低，需加强客户留存",
                "normal": "可推出复购优惠活动",
                "good": "短期复购良好",
                "excellent": "客户粘性强"
            },
            "REPEAT_30D": {
                "poor": "复购率偏低，需建立会员体系",
                "normal": "设计会员体系，增加复购激励",
                "good": "复购率良好",
                "excellent": "客户忠诚度优秀"
            },
            "ROI": {
                "poor": "营销ROI过低，需优化投放策略",
                "normal": "可优化投放时段和人群",
                "good": "营销效果良好",
                "excellent": "营销效率优秀"
            },
            "SEARCH_RANK": {
                "poor": "搜索排名靠后，需优化关键词",
                "normal": "可优化店铺标题和标签",
                "good": "搜索排名良好",
                "excellent": "搜索曝光优秀"
            }
        }
        
        default_suggestions = {
            "poor": "该指标需重点改进",
            "normal": "该指标有提升空间",
            "good": "该指标表现良好",
            "excellent": "该指标表现优秀"
        }
        
        return suggestions.get(metric_id, default_suggestions).get(status, "持续监控")
    
    @classmethod
    def diagnose(cls, metrics_data: Dict[str, float]) -> Dict:
        """
        执行完整诊断
        
        Args:
            metrics_data: 指标原始数据
            
        Returns:
            完整诊断结果
        """
        results = []
        category_scores = {cat: [] for cat in CATEGORY_WEIGHTS.keys()}
        category_metrics = {cat: [] for cat in CATEGORY_WEIGHTS.keys()}
        
        # 计算每个指标得分
        for metric_id, value in metrics_data.items():
            if metric_id not in METRIC_CONFIGS:
                continue
            
            config = METRIC_CONFIGS[metric_id]
            score, status = cls.calculate_metric_score(value, config)
            grade = cls.get_grade(score)
            suggestion = cls.generate_suggestion(metric_id, status, value, config)
            weighted_score = score * config.weight
            
            result = MetricResult(
                metric_id=metric_id,
                name=config.name,
                value=value,
                score=score,
                grade=grade,
                status=status,
                target=config.thresholds[0],
                suggestion=suggestion,
                weight=config.weight,
                weighted_score=round(weighted_score, 2)
            )
            results.append(result)
            
            # 按维度分组
            category_metrics[config.category].append(result)
            category_scores[config.category].append(weighted_score)
        
        # 计算维度得分
        category_results = {}
        for cat, scores in category_scores.items():
            if scores:
                cat_score = sum(scores) / CATEGORY_WEIGHTS[cat] if CATEGORY_WEIGHTS[cat] > 0 else 0
                category_results[cat] = {
                    "score": round(cat_score, 2),
                    "grade": cls.get_grade(cat_score),
                    "weight": CATEGORY_WEIGHTS[cat],
                    "name": CATEGORY_NAMES[cat],
                    "level": cls._get_level_desc(cls.get_grade(cat_score))
                }
        
        # 计算综合得分
        overall_score = sum(
            cat_data["score"] * cat_data["weight"]
            for cat_data in category_results.values()
        )
        
        # 判定整体等级（考虑短板效应）
        min_category_score = min(r["score"] for r in category_results.values()) if category_results else 0
        base_grade = cls.get_grade(overall_score)
        
        # 短板降级规则
        if min_category_score < 50 and base_grade in ["S", "A", "B"]:
            final_grade = "C"
            downgrade_reason = f"{CATEGORY_NAMES.get(min(category_results.items(), key=lambda x: x[1]['score'])[0])}维度得分低于50分"
        elif min_category_score < 30:
            final_grade = "D"
            downgrade_reason = f"{CATEGORY_NAMES.get(min(category_results.items(), key=lambda x: x[1]['score'])[0])}维度得分低于30分"
        else:
            final_grade = base_grade
            downgrade_reason = None
        
        grade_info = cls.get_grade_info(overall_score)
        
        return {
            "overall_score": round(overall_score, 2),
            "grade": final_grade,
            "grade_desc": grade_info.desc,
            "grade_emoji": grade_info.emoji,
            "downgrade_reason": downgrade_reason,
            "category_scores": category_results,
            "metrics_detail": results,
            "problems": cls._identify_problems(results),
            "recommendations": cls._generate_recommendations(results, category_results)
        }
    
    @classmethod
    def _get_level_desc(cls, grade: str) -> str:
        """获取等级描述"""
        desc_map = {
            "S": "卓越",
            "A": "优秀",
            "B": "良好",
            "C": "待改进",
            "D": "需整改"
        }
        return desc_map.get(grade, "未知")
    
    @classmethod
    def _identify_problems(cls, results: List[MetricResult]) -> List[Dict]:
        """识别问题指标"""
        problems = []
        for r in results:
            if r.status in ["poor", "normal"]:
                severity = "high" if r.status == "poor" else "medium"
                gap_pct = round(abs(r.target - r.value) / max(r.target, 0.1) * 100, 1)
                
                impact_map = {
                    "EXP_DAILY": "流量不足直接影响订单量",
                    "CTR_VISIT": "获客成本高，浪费流量",
                    "CVR_ORDER": "转化效率低，流失潜在客户",
                    "CVR_CART": "加购未转化，需优化下单流程",
                    "RATING_OVERALL": "影响用户决策和平台推荐",
                    "BAD_RATE": "差评影响店铺形象和转化",
                    "COMPLAINT_RATE": "投诉可能引发平台处罚",
                    "COOK_TIME": "超时导致用户取消和差评",
                    "ON_TIME_RATE": "影响用户体验和评分",
                    "CANCEL_RATE": "直接影响营收",
                    "AOV": "影响整体营收规模",
                    "GROSS_MARGIN": "盈利能力弱，难以持续",
                    "REPEAT_30D": "获客成本高，需提升留存",
                    "ROI": "营销效率低，浪费预算"
                }
                
                problems.append({
                    "metric_id": r.metric_id,
                    "metric_name": r.name,
                    "severity": severity,
                    "current_value": r.value,
                    "target_value": r.target,
                    "unit": METRIC_CONFIGS[r.metric_id].unit,
                    "gap": gap_pct,
                    "impact": impact_map.get(r.metric_id, "影响店铺整体表现"),
                    "suggestion": r.suggestion
                })
        
        return sorted(problems, key=lambda x: x["gap"], reverse=True)[:6]
    
    @classmethod
    def _generate_recommendations(cls, results: List[MetricResult], 
                                   category_scores: Dict) -> Dict:
        """生成优化建议"""
        short_term = []
        medium_term = []
        long_term = []
        
        # 短期建议：针对严重问题指标
        for r in results:
            if r.status == "poor":
                priority = "P1" if r.score < 40 else "P2"
                short_term.append({
                    "priority": priority,
                    "action": r.suggestion,
                    "target_metric": r.name,
                    "current_value": r.value,
                    "target_value": r.target,
                    "expected_effect": f"将{r.name}从{r.value}提升至{r.target}{METRIC_CONFIGS[r.metric_id].unit}",
                    "timeline": "3-7天内完成"
                })
        
        # 中期建议：针对待提升维度
        weak_categories = [cat for cat, data in category_scores.items() 
                          if data["score"] < 70]
        
        cat_recommendations = {
            "traffic": {
                "action": "制定月度推广计划，优化搜索排名和曝光量",
                "expected_effect": "提升自然流量占比，降低获客成本"
            },
            "conversion": {
                "action": "优化菜单结构和商品详情页，设置套餐组合",
                "expected_effect": "提升下单转化率5-10个百分点"
            },
            "service": {
                "action": "建立服务质量监控体系，完善客服响应机制",
                "expected_effect": "降低差评率，提升用户满意度"
            },
            "efficiency": {
                "action": "优化出餐流程，提升产能利用率",
                "expected_effect": "缩短出餐时长，提升准时率"
            },
            "revenue": {
                "action": "优化定价策略和商品结构，提升毛利率",
                "expected_effect": "提升客单价和盈利能力"
            }
        }
        
        for cat in weak_categories:
            if cat in cat_recommendations:
                rec = cat_recommendations[cat]
                medium_term.append({
                    "priority": "P2",
                    "category": CATEGORY_NAMES[cat],
                    "action": rec["action"],
                    "expected_effect": rec["expected_effect"],
                    "timeline": "1-4周内完成"
                })
        
        # 长期建议
        long_term = [
            {
                "priority": "P3",
                "action": "建立数据驱动的运营决策机制，定期进行店铺诊断",
                "expected_effect": "持续提升店铺竞争力",
                "timeline": "长期执行"
            },
            {
                "priority": "P3",
                "action": "品牌定位升级，形成差异化竞争优势",
                "expected_effect": "提升品牌溢价和客户忠诚度",
                "timeline": "1-3个月"
            }
        ]
        
        return {
            "short_term": short_term[:5],
            "medium_term": medium_term[:3],
            "long_term": long_term
        }


class ReportGenerator:
    """报告生成器"""
    
    def __init__(self, diagnosis_result: Dict, shop_info: Dict):
        self.result = diagnosis_result
        self.shop_info = shop_info
    
    def generate_text_report(self) -> str:
        """生成文本格式报告"""
        lines = []
        
        # 标题
        lines.append("=" * 70)
        lines.append("📊 外卖店铺智能诊断报告 (PRD标准版)")
        lines.append("=" * 70)
        lines.append("")
        
        # 店铺信息
        lines.append(f"🏪 店铺名称: {self.shop_info.get('shop_name', '未命名')}")
        lines.append(f"📂 经营品类: {self.shop_info.get('category', '未指定')}")
        lines.append(f"📍 所在区域: {self.shop_info.get('district', '未指定')}")
        lines.append(f"📅 诊断周期: {self.shop_info.get('period', '未指定')}")
        lines.append(f"🕐 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append("")
        
        # 综合评分
        lines.append("-" * 70)
        lines.append("【📈 综合评分】")
        lines.append("-" * 70)
        
        grade_emoji = self.result['grade_emoji']
        lines.append(f""")
        ┌─────────────────────────────────────────────────────────────┐
        │                                                             │
        │    {grade_emoji}  综合得分: {self.result['overall_score']} 分                        │
        │                                                             │
        │         诊断等级: {self.result['grade']}级 ({self.result['grade_desc']})                      │
        │                                                             │
        └─────────────────────────────────────────────────────────────┘
        """)
        
        # 降级提示
        if self.result.get('downgrade_reason'):
            lines.append(f"⚠️ 降级原因: {self.result['downgrade_reason']}")
        lines.append("")
        
        # 各维度得分
        lines.append("-" * 70)
        lines.append("【📊 各维度表现】")
        lines.append("-" * 70)
        lines.append(f"")
        lines.append(f"{'维度':<12} {'得分':<8} {'权重':<8} {'等级':<8} {'状态':<10}")
        lines.append("-" * 50)
        
        for cat_id, cat_data in self.result['category_scores'].items():
            status_icon = "✅" if cat_data['score'] >= 80 else "🟡" if cat_data['score'] >= 60 else "⚠️"
            lines.append(f"{cat_data['name']:<10} {cat_data['score']:<8} {int(cat_data['weight']*100)}%{'':<5} {cat_data['grade']:<8} {status_icon} {cat_data['level']}")
        
        lines.append("")
        
        # 强项
        lines.append("-" * 70)
        lines.append("【💪 核心优势】TOP 5")
        lines.append("-" * 70)
        
        sorted_metrics = sorted(
            self.result['metrics_detail'],
            key=lambda x: x.score,
            reverse=True
        )[:5]
        
        for i, m in enumerate(sorted_metrics, 1):
            status_icon = "🌟" if m.status == "excellent" else "👍"
            lines.append(f"{i}. {status_icon} {m.name}")
            lines.append(f"   当前值: {m.value}{METRIC_CONFIGS[m.metric_id].unit} | 得分: {m.score} 分 | 等级: {m.grade}")
            lines.append("")
        
        # 短板
        lines.append("-" * 70)
        lines.append("【⚠️ 需改进】问题指标")
        lines.append("-" * 70)
        
        for i, p in enumerate(self.result['problems'], 1):
            severity_icon = "🔴" if p['severity'] == "high" else "🟠"
            lines.append(f"{i}. {severity_icon} {p['metric_name']}")
            lines.append(f"   当前值: {p['current_value']}{p['unit']} | 目标值: {p['target_value']}{p['unit']}")
            lines.append(f"   差距: {p['gap']}% | 影响: {p['impact']}")
            lines.append("")
        
        # 改进行动计划
        lines.append("-" * 70)
        lines.append("【📝 改进行动计划】")
        lines.append("-" * 70)
        
        # 短期行动
        if self.result['recommendations']['short_term']:
            lines.append("")
            lines.append("■ 立即行动 (P1/P2) - 1周内")
            lines.append("-" * 40)
            for rec in self.result['recommendations']['short_term']:
                priority_icon = "🔴" if rec['priority'] == "P1" else "🟠"
                lines.append(f"")
                lines.append(f"{priority_icon} [{rec['priority']}] {rec['target_metric']}")
                lines.append(f"   行动: {rec['action']}")
                lines.append(f"   目标: {rec['expected_effect']}")
                lines.append(f"   时间: {rec['timeline']}")
        
        # 中期计划
        if self.result['recommendations']['medium_term']:
            lines.append("")
            lines.append("■ 中期计划 (P2) - 1-4周")
            lines.append("-" * 40)
            for rec in self.result['recommendations']['medium_term']:
                lines.append(f"")
                lines.append(f"🟡 [{rec['priority']}] {rec.get('category', '综合')}")
                lines.append(f"   行动: {rec['action']}")
                lines.append(f"   预期: {rec['expected_effect']}")
                lines.append(f"   时间: {rec['timeline']}")
        
        # 长期规划
        if self.result['recommendations']['long_term']:
            lines.append("")
            lines.append("■ 长期规划 (P3) - 1-3月")
            lines.append("-" * 40)
            for rec in self.result['recommendations']['long_term']:
                lines.append(f"")
                lines.append(f"🟢 [{rec['priority']}] {rec['action']}")
                lines.append(f"   预期: {rec['expected_effect']}")
                lines.append(f"   时间: {rec['timeline']}")
        
        lines.append("")
        lines.append("=" * 70)
        lines.append("💡 提示: 本报告基于PRD v1.0标准规范生成")
        lines.append("💡 数据仅供参考，建议结合实际情况制定运营策略")
        lines.append("=" * 70)
        
        return "\n".join(lines)
    
    def generate_json_report(self) -> str:
        """生成JSON格式报告"""
        report = {
            "shop_info": self.shop_info,
            "diagnosis": self.result,
            "generated_at": datetime.now().isoformat()
        }
        return json.dumps(report, ensure_ascii=False, indent=2)


def demo():
    """运行演示"""
    print("🚀 外卖店铺智能诊断模型 (PRD完整版) - 演示模式\n")
    
    # 示例数据 (川味小厨案例)
    shop_info = {
        "shop_name": "川味小厨",
        "category": "中式快餐",
        "district": "朝阳区国贸",
        "period": "2024年2月"
    }
    
    metrics = {
        # 流量指标
        "EXP_DAILY": 3850,
        "CTR_VISIT": 7.2,
        "SEARCH_RANK": 8,
        "AD_CTR": 2.5,
        "NEW_USER_RATE": 28,
        
        # 转化指标
        "CVR_ORDER": 11.5,
        "CVR_CART": 22,
        "ORDER_PER_USER": 1.3,
        "ORDER_SUCCESS": 93,
        "CVR_FAVORITE": 4.2,
        
        # 服务指标
        "RATING_OVERALL": 4.5,
        "BAD_RATE": 3.2,
        "COMPLAINT_RATE": 0.8,
        "REPLY_RATE": 85,
        "REPLY_TIME": 36,
        
        # 效率指标
        "COOK_TIME": 24,
        "ON_TIME_RATE": 91,
        "CANCEL_RATE": 5.5,
        "EXCEPTION_RATE": 2.8,
        "CAPACITY_USE": 72,
        
        # 收益指标
        "AOV": 32,
        "GROSS_MARGIN": 38,
        "REPEAT_7D": 18,
        "REPEAT_30D": 28,
        "ROI": 280
    }
    
    # 执行诊断
    engine = DiagnosisEngine()
    result = engine.diagnose(metrics)
    
    # 生成报告
    generator = ReportGenerator(result, shop_info)
    report = generator.generate_text_report()
    
    print(report)
    
    # 保存报告
    filename = f"diagnosis_report_prd_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"\n📄 报告已保存到: {filename}")
    
    return result


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='外卖店铺智能诊断模型 (PRD版)')
    parser.add_argument('--demo', action='store_true', help='运行演示模式')
    parser.add_argument('--input', type=str, help='输入JSON文件路径')
    parser.add_argument('--output', type=str, default='report_prd.txt', help='输出报告文件路径')
    
    args = parser.parse_args()
    
    if args.demo:
        demo()
    elif args.input:
        # 从文件读取数据
        with open(args.input, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        shop_info = {
            "shop_name": data.get("shop_name", "未命名店铺"),
            "category": data.get("category", "未指定品类"),
            "district": data.get("district", "未指定区域"),
            "period": data.get("period", "未指定")
        }
        
        metrics = data.get("metrics", {})
        
        engine = DiagnosisEngine()
        result = engine.diagnose(metrics)
        
        generator = ReportGenerator(result, shop_info)
        report = generator.generate_text_report()
        
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"✅ 诊断完成！报告已保存到: {args.output}")
        print(f"\n综合评分: {result['overall_score']} 分 ({result['grade_emoji']} {result['grade']}级 - {result['grade_desc']})")
        
        # 打印各维度得分
        print("\n各维度得分:")
        for cat_id, cat_data in result['category_scores'].items():
            print(f"  {cat_data['name']}: {cat_data['score']} 分 ({cat_data['grade']}级)")
        
        # 打印问题
        if result['problems']:
            print(f"\n发现问题: {len(result['problems'])} 项")
            for p in result['problems'][:3]:
                print(f"  - {p['metric_name']}: 差距 {p['gap']}%")
    else:
        parser.print_help()
        print("\n💡 提示: 使用 --demo 参数运行演示模式")
        print("💡 提示: 使用 --input 参数指定数据文件")


if __name__ == "__main__":
    main()
