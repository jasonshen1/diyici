# -*- coding: utf-8 -*-
"""
指标计算模块
负责从原始店铺指标计算衍生指标和转化率等关键数据
"""

from typing import Dict, Any, Optional
from models import ShopMetrics, CalculationResult


class MetricsCalculator:
    """
    店铺指标计算器
    
    输入原始运营指标，输出各类转化率和衍生指标
    """
    
    def __init__(self, metrics: ShopMetrics):
        """
        初始化计算器
        
        Args:
            metrics: 店铺原始指标数据
        """
        self.metrics = metrics
        self.result = CalculationResult()
    
    def calculate_all(self) -> CalculationResult:
        """
        计算所有衍生指标
        
        Returns:
            CalculationResult: 包含所有计算结果的对象
        """
        # 流量指标计算
        self._calculate_traffic_metrics()
        
        # 订单指标计算
        self._calculate_order_metrics()
        
        # 评价指标计算
        self._calculate_review_metrics()
        
        # 效率指标
        self._calculate_efficiency_metrics()
        
        # 盈利指标估算
        self._calculate_profit_metrics()
        
        return self.result
    
    def _calculate_traffic_metrics(self):
        """
        计算流量相关指标
        
        - 入店转化率 = 访问UV / 曝光UV
        - 下单转化率 = 下单UV / 访问UV
        - 综合转化率 = 下单UV / 曝光UV
        - 曝光成本 = 推广花费 / 曝光UV
        """
        # 入店转化率 (Visit Conversion Rate)
        if self.metrics.exposure_uv > 0:
            self.result.visit_conversion_rate = (
                self.metrics.visit_uv / self.metrics.exposure_uv
            )
        else:
            self.result.visit_conversion_rate = 0.0
        
        # 下单转化率 (Order Conversion Rate)
        if self.metrics.visit_uv > 0:
            self.result.order_conversion_rate = (
                self.metrics.order_uv / self.metrics.visit_uv
            )
        else:
            self.result.order_conversion_rate = 0.0
        
        # 综合转化率 (Overall Conversion Rate)
        if self.metrics.exposure_uv > 0:
            self.result.overall_conversion_rate = (
                self.metrics.order_uv / self.metrics.exposure_uv
            )
        else:
            self.result.overall_conversion_rate = 0.0
        
        # 曝光成本 (Cost per Exposure UV)
        if self.metrics.exposure_uv > 0:
            self.result.exposure_cost_per_uv = (
                self.metrics.promotion_cost / self.metrics.exposure_uv
            )
        else:
            self.result.exposure_cost_per_uv = 0.0
    
    def _calculate_order_metrics(self):
        """
        计算订单相关指标
        
        - 客单价 = 营业额 / 订单量
        - 实收客单价 = 实收金额 / 订单量
        - 取消率 = 取消订单数 / 总订单数
        """
        # 客单价 (Average Order Value)
        if self.metrics.order_count > 0:
            self.result.aov = self.metrics.revenue / self.metrics.order_count
            self.result.actual_aov = (
                self.metrics.actual_revenue / self.metrics.order_count
            )
        else:
            self.result.aov = 0.0
            self.result.actual_aov = 0.0
        
        # 取消率
        total_orders = self.metrics.order_count + self.metrics.cancel_count
        if total_orders > 0:
            self.result.cancel_rate = self.metrics.cancel_count / total_orders
        else:
            self.result.cancel_rate = 0.0
    
    def _calculate_review_metrics(self):
        """
        计算评价相关指标
        
        - 总评价数 = 好评数 + 差评数
        - 好评率 = 好评数 / 总评价数
        - 差评率 = 差评数 / 总评价数
        - 投诉率 = 投诉数 / 订单量
        - 差评回复率 = 已回复差评数 / 差评数
        """
        # 总评价数
        self.result.total_reviews = (
            self.metrics.positive_reviews + self.metrics.negative_reviews
        )
        
        # 好评率
        if self.result.total_reviews > 0:
            self.result.positive_rate = (
                self.metrics.positive_reviews / self.result.total_reviews
            )
            self.result.negative_rate = (
                self.metrics.negative_reviews / self.result.total_reviews
            )
        else:
            self.result.positive_rate = 1.0  # 无评价时默认100%好评
            self.result.negative_rate = 0.0
        
        # 投诉率 (基于30天投诉数和7天日均订单量估算月订单量)
        monthly_orders = self.metrics.order_count * 30
        if monthly_orders > 0:
            self.result.complaint_rate = self.metrics.complaints / monthly_orders
        else:
            self.result.complaint_rate = 0.0
        
        # 差评回复率
        if self.metrics.negative_reviews > 0:
            self.result.negative_reply_rate = (
                self.metrics.replied_negative / self.metrics.negative_reviews
            )
        else:
            self.result.negative_reply_rate = 1.0  # 无差评时默认100%
    
    def _calculate_efficiency_metrics(self):
        """
        获取效率指标（直接从原始数据获取）
        """
        self.result.cook_time = self.metrics.cook_time
        self.result.ontime_rate = self.metrics.ontime_rate / 100.0  # 转换为小数
        self.result.refund_rate = self.metrics.refund_rate / 100.0   # 转换为小数
    
    def _calculate_profit_metrics(self):
        """
        估算盈利指标
        
        毛利率 = (实收金额 - 预估成本) / 营业额
        注: 这里使用简化估算，实际应根据具体品类成本结构计算
        """
        # 简化的毛利率估算
        # 假设: 快餐类食材成本约35%，平台抽成约20%，推广费约5%
        # 实际毛利率 ≈ 1 - 35% - 20% - 推广占比
        if self.metrics.revenue > 0:
            promotion_ratio = self.metrics.promotion_cost / self.metrics.revenue
            # 基础成本率按品类估算
            base_cost_rate = 0.55  # 55%基础成本(食材+平台)
            self.result.profit_margin = max(0.0, 1.0 - base_cost_rate - promotion_ratio)
        else:
            self.result.profit_margin = 0.0
    
    def get_summary(self) -> Dict[str, Any]:
        """
        获取计算结果摘要
        
        Returns:
            包含关键指标的字典
        """
        return {
            "流量指标": {
                "入店转化率": f"{self.result.visit_conversion_rate*100:.2f}%",
                "下单转化率": f"{self.result.order_conversion_rate*100:.2f}%",
                "综合转化率": f"{self.result.overall_conversion_rate*100:.2f}%",
                "曝光成本": f"{self.result.exposure_cost_per_uv:.2f}元",
            },
            "订单指标": {
                "客单价": f"{self.result.aov:.2f}元",
                "实收客单价": f"{self.result.actual_aov:.2f}元",
                "取消率": f"{self.result.cancel_rate*100:.2f}%",
            },
            "评价指标": {
                "好评率": f"{self.result.positive_rate*100:.2f}%",
                "差评率": f"{self.result.negative_rate*100:.2f}%",
                "投诉率": f"{self.result.complaint_rate*100:.4f}%",
            },
            "效率指标": {
                "出餐时间": f"{self.result.cook_time:.1f}分钟",
                "准时率": f"{self.result.ontime_rate*100:.2f}%",
                "退单率": f"{self.result.refund_rate*100:.2f}%",
            },
        }


def quick_calculate(metrics: ShopMetrics) -> CalculationResult:
    """
    快速计算指标的工具函数
    
    Args:
        metrics: 店铺原始指标
    
    Returns:
        计算结果
    
    Example:
        >>> metrics = ShopMetrics(name="测试店", exposure_uv=1000, ...)
        >>> result = quick_calculate(metrics)
        >>> print(result.aov)
    """
    calculator = MetricsCalculator(metrics)
    return calculator.calculate_all()
