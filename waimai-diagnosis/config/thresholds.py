# -*- coding: utf-8 -*-
"""
指标阈值配置文件
定义各品类、各维度的评分阈值标准
"""

from enum import Enum
from typing import Dict, List, Tuple


class ShopStage(Enum):
    """店铺发展阶段"""
    NEW = "new"           # 新店期 (0-3月)
    GROWTH = "growth"     # 成长期 (3-12月)
    MATURE = "mature"     # 成熟期 (12月+)


class CategoryType(Enum):
    """经营品类"""
    FAST_FOOD = "快餐简餐"
    DRINK = "饮品甜点"
    BBQ = "烧烤夜宵"
    LIGHT_FOOD = "轻食沙拉"


# ==================== 品类修正系数 ====================
# 不同品类的转化率基准修正系数
CATEGORY_CONVERSION_FACTOR = {
    CategoryType.FAST_FOOD.value: 1.0,
    CategoryType.DRINK.value: 0.85,
    CategoryType.BBQ.value: 0.9,
    CategoryType.LIGHT_FOOD.value: 0.8,
}

# ==================== 客单价基准参考 (单位: 元) ====================
AOV_BENCHMARK = {
    CategoryType.FAST_FOOD.value: {
        "P10": 15, "P25": 20, "P50": 28, "P75": 38, "P90": 50
    },
    CategoryType.DRINK.value: {
        "P10": 12, "P25": 15, "P50": 20, "P75": 28, "P90": 38
    },
    CategoryType.BBQ.value: {
        "P10": 35, "P25": 50, "P50": 70, "P75": 95, "P90": 130
    },
    CategoryType.LIGHT_FOOD.value: {
        "P10": 20, "P25": 28, "P50": 38, "P75": 50, "P90": 65
    },
}

# ==================== 评分等级定义 ====================
GRADE_THRESHOLDS = {
    "S": (90, 100, "优秀", "深绿"),
    "A": (80, 89, "良好", "绿色"),
    "B": (70, 79, "及格", "黄色"),
    "C": (60, 69, "较差", "橙色"),
    "D": (0, 59, "危险", "红色"),
}

# ==================== 维度权重配置 ====================
# 不同发展阶段的权重不同
DIMENSION_WEIGHTS = {
    ShopStage.NEW.value: {
        "traffic": 0.40,      # 流量健康度
        "conversion": 0.30,   # 转化能力
        "aov": 0.00,          # 客单价 (新店不考核)
        "satisfaction": 0.20, # 顾客满意度
        "efficiency": 0.10,   # 运营效率
    },
    ShopStage.GROWTH.value: {
        "traffic": 0.25,
        "conversion": 0.25,
        "aov": 0.15,
        "satisfaction": 0.20,
        "efficiency": 0.15,
    },
    ShopStage.MATURE.value: {
        "traffic": 0.20,
        "conversion": 0.20,
        "aov": 0.25,
        "satisfaction": 0.20,
        "efficiency": 0.15,
    },
}

# ==================== 流量健康度指标阈值 ====================
# 阈值格式: [危险上限, 较差上限, 一般上限, 良好上限, 优秀上限]
# 注: 对于成本类指标（值越小越好），使用时需要反向处理
TRAFFIC_THRESHOLDS = {
    # 入店转化率 (访问UV/曝光UV)
    "visit_conversion": {
        "danger": 0.03,
        "poor": 0.05,
        "fair": 0.08,
        "good": 0.12,
        "excellent": 0.15,
    },
    # 下单转化率 (下单UV/访问UV)
    "order_conversion": {
        "danger": 0.08,
        "poor": 0.12,
        "fair": 0.18,
        "good": 0.25,
        "excellent": 0.30,
    },
    # 综合转化率 (下单UV/曝光UV)
    "overall_conversion": {
        "danger": 0.008,
        "poor": 0.015,
        "fair": 0.025,
        "good": 0.035,
        "excellent": 0.050,
    },
    # 曝光成本 (推广费/曝光UV, 单位:元) - 反向指标
    "exposure_cost": {
        "danger": 1.2,      # >1.2元 危险
        "poor": 0.8,        # 0.8-1.2 较差
        "fair": 0.5,        # 0.5-0.8 一般
        "good": 0.3,        # 0.3-0.5 良好
        "excellent": 0.15,  # <0.3 优秀
    },
    # 自然流量占比
    "organic_ratio": {
        "danger": 0.15,
        "poor": 0.30,
        "fair": 0.50,
        "good": 0.70,
        "excellent": 0.85,
    },
}

# ==================== 客单价指标阈值 ====================
AOV_THRESHOLDS = {
    # 毛利空间 (%)
    "profit_margin": {
        "danger": 0.08,
        "poor": 0.15,
        "fair": 0.25,
        "good": 0.35,
        "excellent": 0.45,
    },
    # 凑单率
    "combo_rate": {
        "danger": 0.08,
        "poor": 0.15,
        "fair": 0.25,
        "good": 0.40,
        "excellent": 0.55,
    },
    # 套餐占比
    "set_meal_ratio": {
        "danger": 0.05,
        "poor": 0.12,
        "fair": 0.20,
        "good": 0.30,
        "excellent": 0.45,
    },
}

# ==================== 顾客满意度指标阈值 ====================
SATISFACTION_THRESHOLDS = {
    # 平台评分 (1-5分)
    "rating": {
        "danger": 4.0,
        "poor": 4.3,
        "fair": 4.6,
        "good": 4.8,
        "excellent": 4.9,
    },
    # 好评率 (%)
    "positive_rate": {
        "danger": 0.78,
        "poor": 0.85,
        "fair": 0.90,
        "good": 0.95,
        "excellent": 0.98,
    },
    # 差评率 (%) - 反向指标
    "negative_rate": {
        "danger": 0.07,     # >7% 危险
        "poor": 0.04,       # 4-7% 较差
        "fair": 0.02,       # 2-4% 一般
        "good": 0.01,       # 1-2% 良好
        "excellent": 0.005, # <1% 优秀
    },
    # 投诉率 (%) - 反向指标
    "complaint_rate": {
        "danger": 0.01,
        "poor": 0.006,
        "fair": 0.003,
        "good": 0.001,
        "excellent": 0.0005,
    },
}

# ==================== 运营效率指标阈值 ====================
EFFICIENCY_THRESHOLDS = {
    # 平均出餐时间 (分钟) - 反向指标
    "cook_time": {
        "danger": 25,
        "poor": 18,
        "fair": 12,
        "good": 8,
        "excellent": 5,
    },
    # 准时率 (%)
    "ontime_rate": {
        "danger": 0.85,
        "poor": 0.90,
        "fair": 0.95,
        "good": 0.98,
        "excellent": 0.995,
    },
    # 取消率 (%) - 反向指标
    "cancel_rate": {
        "danger": 0.12,
        "poor": 0.07,
        "fair": 0.04,
        "good": 0.02,
        "excellent": 0.01,
    },
    # 退单率 (%) - 反向指标
    "refund_rate": {
        "danger": 0.07,
        "poor": 0.04,
        "fair": 0.02,
        "good": 0.01,
        "excellent": 0.005,
    },
}


# ==================== 阈值获取函数 ====================
def get_thresholds_by_dimension(dimension: str) -> Dict:
    """
    获取指定维度的所有阈值配置
    
    Args:
        dimension: 维度名称 (traffic/aov/satisfaction/efficiency)
    
    Returns:
        该维度的阈值配置字典
    """
    thresholds_map = {
        "traffic": TRAFFIC_THRESHOLDS,
        "aov": AOV_THRESHOLDS,
        "satisfaction": SATISFACTION_THRESHOLDS,
        "efficiency": EFFICIENCY_THRESHOLDS,
    }
    return thresholds_map.get(dimension, {})


def get_dimension_weights(stage: str) -> Dict[str, float]:
    """
    获取指定发展阶段的维度权重
    
    Args:
        stage: 阶段名称 (new/growth/mature)
    
    Returns:
        维度权重字典
    """
    return DIMENSION_WEIGHTS.get(stage, DIMENSION_WEIGHTS[ShopStage.GROWTH.value])


def get_aov_benchmark(category: str, percentile: str = "P50") -> float:
    """
    获取指定品类的客单价基准值
    
    Args:
        category: 品类名称
        percentile: 分位数 (P10/P25/P50/P75/P90)
    
    Returns:
        基准客单价
    """
    category_data = AOV_BENCHMARK.get(category, AOV_BENCHMARK[CategoryType.FAST_FOOD.value])
    return category_data.get(percentile, 28)


def get_category_conversion_factor(category: str) -> float:
    """
    获取品类转化率修正系数
    
    Args:
        category: 品类名称
    
    Returns:
        修正系数
    """
    return CATEGORY_CONVERSION_FACTOR.get(category, 1.0)


# 反向指标列表 (值越小越好)
REVERSE_METRICS = [
    "exposure_cost",
    "negative_rate",
    "complaint_rate",
    "cook_time",
    "cancel_rate",
    "refund_rate",
]


def is_reverse_metric(metric_name: str) -> bool:
    """
    判断是否为反向指标（值越小越好）
    
    Args:
        metric_name: 指标名称
    
    Returns:
        是否为反向指标
    """
    return metric_name in REVERSE_METRICS
