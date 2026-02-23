# -*- coding: utf-8 -*-
"""
评分逻辑模块
负责计算各维度和总体评分
"""

from typing import Dict, List, Optional
from dataclasses import dataclass

from models import ShopMetrics, CalculationResult, MetricDetail, DimensionScore
from config.thresholds import (
    get_thresholds_by_dimension,
    get_dimension_weights,
    get_aov_benchmark,
    is_reverse_metric,
    GRADE_THRESHOLDS,
)


@dataclass
class ThresholdConfig:
    """阈值配置数据类"""
    danger: float
    poor: float
    fair: float
    good: float
    excellent: float
    is_reverse: bool = False


class ScoreEvaluator:
    """
    评分评估器
    
    根据计算后的指标值，按照阈值标准进行评分
    """
    
    def __init__(self, metrics: ShopMetrics, calculation: CalculationResult):
        """
        初始化评估器
        
        Args:
            metrics: 原始店铺指标
            calculation: 计算后的衍生指标
        """
        self.metrics = metrics
        self.calc = calculation
        self.stage = metrics.stage
        self.category = metrics.category
        
        # 获取权重配置
        self.dimension_weights = get_dimension_weights(self.stage)
    
    def evaluate_all_dimensions(self) -> List[DimensionScore]:
        """
        评估所有维度
        
        Returns:
            各维度评分列表
        """
        dimensions = []
        
        # 1. 流量健康度评估
        traffic_dim = self._evaluate_traffic()
        dimensions.append(traffic_dim)
        
        # 2. 转化能力评估
        conversion_dim = self._evaluate_conversion()
        dimensions.append(conversion_dim)
        
        # 3. 客单价水平评估 (新店可能跳过)
        if self.stage != "new":
            aov_dim = self._evaluate_aov()
            dimensions.append(aov_dim)
        
        # 4. 顾客满意度评估
        satisfaction_dim = self._evaluate_satisfaction()
        dimensions.append(satisfaction_dim)
        
        # 5. 运营效率评估
        efficiency_dim = self._evaluate_efficiency()
        dimensions.append(efficiency_dim)
        
        return dimensions
    
    def calculate_overall_score(self, dimensions: List[DimensionScore]) -> float:
        """
        计算总体评分
        
        Args:
            dimensions: 各维度评分列表
        
        Returns:
            加权后的总体评分
        """
        total_weight = sum(d.weight for d in dimensions)
        if total_weight == 0:
            return 0.0
        
        weighted_sum = sum(d.score * d.weight for d in dimensions)
        return round(weighted_sum / total_weight, 1)
    
    def _evaluate_traffic(self) -> DimensionScore:
        """
        评估流量健康度维度
        
        核心指标:
        - 入店转化率
        - 下单转化率
        - 曝光成本
        - 综合转化率
        """
        thresholds = get_thresholds_by_dimension("traffic")
        
        metrics = []
        
        # 入店转化率
        visit_conv_score = self._calculate_metric_score(
            self.calc.visit_conversion_rate,
            thresholds.get("visit_conversion", {}),
            is_reverse=False
        )
        metrics.append(MetricDetail(
            name="visit_conversion",
            value=round(self.calc.visit_conversion_rate * 100, 2),
            score=visit_conv_score,
            weight=0.30,
            threshold_level=self._get_level(visit_conv_score),
            unit="%",
            description="访问UV/曝光UV，反映店铺吸引力"
        ))
        
        # 下单转化率
        order_conv_score = self._calculate_metric_score(
            self.calc.order_conversion_rate,
            thresholds.get("order_conversion", {}),
            is_reverse=False
        )
        metrics.append(MetricDetail(
            name="order_conversion",
            value=round(self.calc.order_conversion_rate * 100, 2),
            score=order_conv_score,
            weight=0.35,
            threshold_level=self._get_level(order_conv_score),
            unit="%",
            description="下单UV/访问UV，反映商品竞争力"
        ))
        
        # 曝光成本 (反向指标)
        exposure_cost_score = self._calculate_metric_score(
            self.calc.exposure_cost_per_uv,
            thresholds.get("exposure_cost", {}),
            is_reverse=True
        )
        metrics.append(MetricDetail(
            name="exposure_cost",
            value=round(self.calc.exposure_cost_per_uv, 2),
            score=exposure_cost_score,
            weight=0.20,
            threshold_level=self._get_level(exposure_cost_score),
            unit="元",
            description="推广费/曝光UV，反映流量获取成本"
        ))
        
        # 综合转化率
        overall_conv_score = self._calculate_metric_score(
            self.calc.overall_conversion_rate,
            thresholds.get("overall_conversion", {}),
            is_reverse=False
        )
        metrics.append(MetricDetail(
            name="overall_conversion",
            value=round(self.calc.overall_conversion_rate * 100, 2),
            score=overall_conv_score,
            weight=0.15,
            threshold_level=self._get_level(overall_conv_score),
            unit="%",
            description="下单UV/曝光UV，整体转化效率"
        ))
        
        # 计算维度得分
        dim_score = self._weighted_average(metrics)
        
        return DimensionScore(
            name="traffic",
            name_cn="流量健康度",
            score=dim_score,
            weight=self.dimension_weights.get("traffic", 0.25),
            metrics=metrics,
            issues=[],
            suggestions=[]
        )
    
    def _evaluate_conversion(self) -> DimensionScore:
        """
        评估转化能力维度
        
        与流量维度有重叠，但更关注转化效率
        """
        # 转化维度主要复用流量维度的核心转化指标
        thresholds = get_thresholds_by_dimension("traffic")
        
        metrics = []
        
        # 综合转化率 (核心指标)
        overall_conv_score = self._calculate_metric_score(
            self.calc.overall_conversion_rate,
            thresholds.get("overall_conversion", {}),
            is_reverse=False
        )
        metrics.append(MetricDetail(
            name="overall_conversion",
            value=round(self.calc.overall_conversion_rate * 100, 2),
            score=overall_conv_score,
            weight=0.50,
            threshold_level=self._get_level(overall_conv_score),
            unit="%",
            description="整体转化效率"
        ))
        
        # 下单转化率
        order_conv_score = self._calculate_metric_score(
            self.calc.order_conversion_rate,
            thresholds.get("order_conversion", {}),
            is_reverse=False
        )
        metrics.append(MetricDetail(
            name="order_conversion",
            value=round(self.calc.order_conversion_rate * 100, 2),
            score=order_conv_score,
            weight=0.35,
            threshold_level=self._get_level(order_conv_score),
            unit="%",
            description="页面转化能力"
        ))
        
        # 取消率 (反向指标，反映转化质量)
        cancel_score = self._calculate_metric_score(
            self.calc.cancel_rate,
            {"danger": 0.12, "poor": 0.07, "fair": 0.04, "good": 0.02, "excellent": 0.01},
            is_reverse=True
        )
        metrics.append(MetricDetail(
            name="cancel_rate",
            value=round(self.calc.cancel_rate * 100, 2),
            score=cancel_score,
            weight=0.15,
            threshold_level=self._get_level(cancel_score),
            unit="%",
            description="取消订单占比，反向指标"
        ))
        
        dim_score = self._weighted_average(metrics)
        
        return DimensionScore(
            name="conversion",
            name_cn="转化能力",
            score=dim_score,
            weight=self.dimension_weights.get("conversion", 0.25),
            metrics=metrics,
            issues=[],
            suggestions=[]
        )
    
    def _evaluate_aov(self) -> DimensionScore:
        """
        评估客单价水平维度
        """
        thresholds = get_thresholds_by_dimension("aov")
        
        metrics = []
        
        # 获取品类基准客单价
        benchmark_p50 = get_aov_benchmark(self.category, "P50")
        benchmark_p75 = get_aov_benchmark(self.category, "P75")
        
        # 客单价评分 (相对于品类基准)
        aov_ratio = self.calc.aov / benchmark_p50 if benchmark_p50 > 0 else 1.0
        # 根据相对于P50的比例评分
        if aov_ratio >= 1.5:
            aov_score = 95.0
        elif aov_ratio >= 1.2:
            aov_score = 85.0
        elif aov_ratio >= 1.0:
            aov_score = 75.0
        elif aov_ratio >= 0.8:
            aov_score = 60.0
        else:
            aov_score = max(30.0, aov_ratio * 50)
        
        metrics.append(MetricDetail(
            name="aov",
            value=round(self.calc.aov, 2),
            score=aov_score,
            weight=0.40,
            threshold_level=self._get_level(aov_score),
            benchmark=benchmark_p50,
            unit="元",
            description="营业额/订单量"
        ))
        
        # 毛利率评分
        profit_score = self._calculate_metric_score(
            self.calc.profit_margin,
            thresholds.get("profit_margin", {}),
            is_reverse=False
        )
        metrics.append(MetricDetail(
            name="profit_margin",
            value=round(self.calc.profit_margin * 100, 2),
            score=profit_score,
            weight=0.35,
            threshold_level=self._get_level(profit_score),
            unit="%",
            description="估算毛利率"
        ))
        
        # 综合客单价能力评分
        dim_score = self._weighted_average(metrics)
        
        return DimensionScore(
            name="aov",
            name_cn="客单价水平",
            score=dim_score,
            weight=self.dimension_weights.get("aov", 0.15),
            metrics=metrics,
            issues=[],
            suggestions=[]
        )
    
    def _evaluate_satisfaction(self) -> DimensionScore:
        """
        评估顾客满意度维度
        """
        thresholds = get_thresholds_by_dimension("satisfaction")
        
        metrics = []
        
        # 平台评分
        rating_score = self._calculate_metric_score(
            self.metrics.rating,
            thresholds.get("rating", {}),
            is_reverse=False
        )
        metrics.append(MetricDetail(
            name="rating",
            value=self.metrics.rating,
            score=rating_score,
            weight=0.35,
            threshold_level=self._get_level(rating_score),
            unit="分",
            description="平台评分(1-5分)"
        ))
        
        # 好评率
        positive_score = self._calculate_metric_score(
            self.calc.positive_rate,
            thresholds.get("positive_rate", {}),
            is_reverse=False
        )
        metrics.append(MetricDetail(
            name="positive_rate",
            value=round(self.calc.positive_rate * 100, 2),
            score=positive_score,
            weight=0.25,
            threshold_level=self._get_level(positive_score),
            unit="%",
            description="好评占比"
        ))
        
        # 差评率 (反向指标)
        negative_score = self._calculate_metric_score(
            self.calc.negative_rate,
            thresholds.get("negative_rate", {}),
            is_reverse=True
        )
        metrics.append(MetricDetail(
            name="negative_rate",
            value=round(self.calc.negative_rate * 100, 2),
            score=negative_score,
            weight=0.25,
            threshold_level=self._get_level(negative_score),
            unit="%",
            description="差评占比，反向指标"
        ))
        
        # 投诉率 (反向指标)
        complaint_score = self._calculate_metric_score(
            self.calc.complaint_rate,
            thresholds.get("complaint_rate", {}),
            is_reverse=True
        )
        metrics.append(MetricDetail(
            name="complaint_rate",
            value=round(self.calc.complaint_rate * 10000, 4),  # 万分比显示
            score=complaint_score,
            weight=0.15,
            threshold_level=self._get_level(complaint_score),
            unit="‱",
            description="投诉率，反向指标"
        ))
        
        dim_score = self._weighted_average(metrics)
        
        return DimensionScore(
            name="satisfaction",
            name_cn="顾客满意度",
            score=dim_score,
            weight=self.dimension_weights.get("satisfaction", 0.20),
            metrics=metrics,
            issues=[],
            suggestions=[]
        )
    
    def _evaluate_efficiency(self) -> DimensionScore:
        """
        评估运营效率维度
        """
        thresholds = get_thresholds_by_dimension("efficiency")
        
        metrics = []
        
        # 出餐时间 (反向指标)
        cook_time_score = self._calculate_metric_score(
            self.calc.cook_time,
            thresholds.get("cook_time", {}),
            is_reverse=True
        )
        metrics.append(MetricDetail(
            name="cook_time",
            value=round(self.calc.cook_time, 1),
            score=cook_time_score,
            weight=0.30,
            threshold_level=self._get_level(cook_time_score),
            unit="分钟",
            description="平均出餐时间"
        ))
        
        # 准时率
        ontime_score = self._calculate_metric_score(
            self.calc.ontime_rate,
            thresholds.get("ontime_rate", {}),
            is_reverse=False
        )
        metrics.append(MetricDetail(
            name="ontime_rate",
            value=round(self.calc.ontime_rate * 100, 2),
            score=ontime_score,
            weight=0.30,
            threshold_level=self._get_level(ontime_score),
            unit="%",
            description="准时送达率"
        ))
        
        # 退单率 (反向指标)
        refund_score = self._calculate_metric_score(
            self.calc.refund_rate,
            thresholds.get("refund_rate", {}),
            is_reverse=True
        )
        metrics.append(MetricDetail(
            name="refund_rate",
            value=round(self.calc.refund_rate * 100, 2),
            score=refund_score,
            weight=0.25,
            threshold_level=self._get_level(refund_score),
            unit="%",
            description="退单率，反向指标"
        ))
        
        # 取消率 (反向指标)
        cancel_score = self._calculate_metric_score(
            self.calc.cancel_rate,
            {"danger": 0.12, "poor": 0.07, "fair": 0.04, "good": 0.02, "excellent": 0.01},
            is_reverse=True
        )
        metrics.append(MetricDetail(
            name="cancel_rate",
            value=round(self.calc.cancel_rate * 100, 2),
            score=cancel_score,
            weight=0.15,
            threshold_level=self._get_level(cancel_score),
            unit="%",
            description="取消率，反向指标"
        ))
        
        dim_score = self._weighted_average(metrics)
        
        return DimensionScore(
            name="efficiency",
            name_cn="运营效率",
            score=dim_score,
            weight=self.dimension_weights.get("efficiency", 0.15),
            metrics=metrics,
            issues=[],
            suggestions=[]
        )
    
    def _calculate_metric_score(
        self, 
        value: float, 
        thresholds: Dict[str, float],
        is_reverse: bool = False
    ) -> float:
        """
        计算单个指标的得分
        
        使用线性插值在阈值区间计算得分
        
        Args:
            value: 实际值
            thresholds: 阈值配置字典
            is_reverse: 是否为反向指标
        
        Returns:
            0-100的得分
        """
        if not thresholds:
            return 50.0
        
        # 获取阈值
        danger = thresholds.get("danger", 0)
        poor = thresholds.get("poor", 0.3)
        fair = thresholds.get("fair", 0.5)
        good = thresholds.get("good", 0.7)
        excellent = thresholds.get("excellent", 0.9)
        
        # 反向指标处理: 值越小越好
        if is_reverse:
            if value <= excellent:
                return min(100, 90 + (excellent - value) / excellent * 10)
            elif value <= good:
                return 70 + (good - value) / (good - excellent) * 20
            elif value <= fair:
                return 50 + (fair - value) / (fair - good) * 20
            elif value <= poor:
                return 30 + (poor - value) / (poor - fair) * 20
            elif value <= danger:
                return max(0, 30 - (value - poor) / (danger - poor) * 30)
            else:
                return max(0, 30 - (value - danger) / danger * 30)
        else:
            # 正向指标: 值越大越好
            if value >= excellent:
                return min(100, 90 + (value - excellent) / excellent * 10)
            elif value >= good:
                return 70 + (value - good) / (excellent - good) * 20
            elif value >= fair:
                return 50 + (value - fair) / (good - fair) * 20
            elif value >= poor:
                return 30 + (value - poor) / (fair - poor) * 20
            elif value >= danger:
                return max(0, 30 - (danger - value) / (poor - danger) * 30)
            else:
                return max(0, 30 - (danger - value) / danger * 30)
    
    def _get_level(self, score: float) -> str:
        """根据得分获取等级描述"""
        if score >= 90:
            return "excellent"
        elif score >= 80:
            return "good"
        elif score >= 70:
            return "fair"
        elif score >= 60:
            return "poor"
        else:
            return "danger"
    
    def _weighted_average(self, metrics: List[MetricDetail]) -> float:
        """计算加权平均分"""
        total_weight = sum(m.weight for m in metrics)
        if total_weight == 0:
            return 0.0
        weighted_sum = sum(m.score * m.weight for m in metrics)
        return round(weighted_sum / total_weight, 1)
