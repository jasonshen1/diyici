# -*- coding: utf-8 -*-
"""
数据模型定义
使用 dataclass 定义店铺指标、维度评分和诊断报告的数据结构
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum


class PlatformType(Enum):
    """外卖平台类型"""
    MEITUAN = "美团外卖"
    ELEME = "饿了么"
    BOTH = "双平台"


class ShopStage(Enum):
    """店铺发展阶段"""
    NEW = "新店期"        # 0-3月
    GROWTH = "成长期"     # 3-12月
    MATURE = "成熟期"     # 12月+


class BusinessCategory(Enum):
    """经营品类"""
    FAST_FOOD = "快餐简餐"
    DRINK = "饮品甜点"
    BBQ = "烧烤夜宵"
    LIGHT_FOOD = "轻食沙拉"
    OTHER = "其他"


class GradeLevel(Enum):
    """评分等级"""
    S = ("S", "优秀", 90, 100)
    A = ("A", "良好", 80, 89)
    B = ("B", "及格", 70, 79)
    C = ("C", "较差", 60, 69)
    D = ("D", "危险", 0, 59)
    
    def __init__(self, code: str, label: str, min_score: int, max_score: int):
        self.code = code
        self.label = label
        self.min_score = min_score
        self.max_score = max_score
    
    @classmethod
    def from_score(cls, score: float) -> "GradeLevel":
        """根据分数获取等级"""
        for grade in cls:
            if grade.min_score <= score <= grade.max_score:
                return grade
        return cls.D


@dataclass
class ShopMetrics:
    """
    店铺核心运营指标数据类
    
    包含流量、订单、评价、效率四大类指标
    """
    # ==================== 基础信息 ====================
    name: str                           # 店铺名称
    platform: str = "美团外卖"           # 平台类型
    category: str = "快餐简餐"           # 经营品类
    stage: str = "growth"               # 发展阶段 (new/growth/mature)
    business_district: str = "混合"      # 商圈类型
    
    # ==================== 流量指标 ====================
    exposure_uv: int = 0                # 曝光人数 (近7日日均)
    visit_uv: int = 0                   # 访问人数 (近7日日均)
    order_uv: int = 0                   # 下单人数 (近7日日均)
    promotion_cost: float = 0.0         # 推广花费 (近7日日均, 元)
    
    # ==================== 订单指标 ====================
    order_count: int = 0                # 订单量 (近7日日均)
    revenue: float = 0.0                # 营业额 (近7日日均, 元)
    actual_revenue: float = 0.0         # 实收金额 (近7日日均, 元)
    cancel_count: int = 0               # 取消订单数 (近7日日均)
    
    # ==================== 评价指标 ====================
    positive_reviews: int = 0           # 好评数 (近30日累计)
    negative_reviews: int = 0           # 差评数 (近30日累计)
    complaints: int = 0                 # 投诉数 (近30日累计)
    rating: float = 5.0                 # 平均评分 (1-5分)
    replied_negative: int = 0           # 已回复差评数
    
    # ==================== 效率指标 ====================
    cook_time: float = 10.0             # 平均出餐时间 (分钟)
    ontime_rate: float = 95.0           # 准时率 (%)
    refund_rate: float = 1.0            # 退单率 (%)
    
    # ==================== 进阶指标 (选填) ====================
    new_customer_rate: Optional[float] = None   # 新客占比 (%)
    repurchase_rate: Optional[float] = None     # 复购率 (%)
    delivery_fee: Optional[float] = None        # 配送费 (元)
    min_order: Optional[float] = None           # 起送价 (元)
    
    def __post_init__(self):
        """数据初始化后的验证和计算"""
        # 确保数值不为负
        self.exposure_uv = max(0, self.exposure_uv)
        self.visit_uv = max(0, self.visit_uv)
        self.order_uv = max(0, self.order_uv)
        self.order_count = max(0, self.order_count)
        
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "name": self.name,
            "platform": self.platform,
            "category": self.category,
            "stage": self.stage,
            "exposure_uv": self.exposure_uv,
            "visit_uv": self.visit_uv,
            "order_uv": self.order_uv,
            "order_count": self.order_count,
            "revenue": self.revenue,
            "rating": self.rating,
        }


@dataclass
class MetricDetail:
    """
    单个指标的详细评分信息
    """
    name: str                           # 指标名称
    value: float                      # 实际值
    score: float                      # 得分 (0-100)
    weight: float                     # 权重
    threshold_level: str              # 阈值等级 (excellent/good/fair/poor/danger)
    benchmark: Optional[float] = None # 行业基准值
    unit: str = ""                    # 单位
    description: str = ""             # 指标说明


@dataclass
class DimensionScore:
    """
    维度评分数据类
    
    包含某个诊断维度的综合得分和各项指标详情
    """
    name: str                           # 维度名称
    name_cn: str                        # 维度中文名
    score: float                        # 维度综合得分 (0-100)
    weight: float                       # 维度权重 (0-1)
    metrics: List[MetricDetail] = field(default_factory=list)  # 指标详情列表
    issues: List[str] = field(default_factory=list)            # 该维度存在的问题
    suggestions: List[str] = field(default_factory=list)       # 优化建议
    
    @property
    def weighted_score(self) -> float:
        """计算加权得分"""
        return self.score * self.weight
    
    def get_score_level(self) -> str:
        """获取得分等级描述"""
        if self.score >= 90:
            return "优秀"
        elif self.score >= 80:
            return "良好"
        elif self.score >= 70:
            return "及格"
        elif self.score >= 60:
            return "较差"
        else:
            return "危险"


@dataclass
class ActionItem:
    """
    行动计划条目
    """
    priority: str                       # 优先级 (P0/P1/P2)
    title: str                          # 行动标题
    description: str                    # 行动描述
    expected_effect: str                # 预期效果
    time_estimate: str                  # 预计耗时
    dimension: str = ""                 # 关联维度


@dataclass
class DiagnosisReport:
    """
    店铺诊断报告数据类
    
    包含完整的诊断结果、评分、问题和建议
    """
    # ==================== 基本信息 ====================
    shop_name: str                                      # 店铺名称
    diagnosis_date: str                                 # 诊断日期
    platform: str                                       # 平台类型
    category: str                                       # 经营品类
    stage: str                                          # 发展阶段
    
    # ==================== 评分结果 ====================
    overall_score: float = 0.0                          # 总体评分 (0-100)
    grade: GradeLevel = field(default=GradeLevel.D)     # 评分等级
    dimension_scores: List[DimensionScore] = field(default_factory=list)  # 各维度评分
    
    # ==================== 诊断结果 ====================
    top_issues: List[Dict[str, Any]] = field(default_factory=list)   # 优先处理问题
    action_plan: Dict[str, List[ActionItem]] = field(default_factory=dict)  # 行动计划
    
    # ==================== 原始数据引用 ====================
    raw_metrics: Optional[ShopMetrics] = None           # 原始指标数据
    
    def __post_init__(self):
        """初始化后计算等级"""
        if isinstance(self.grade, str):
            self.grade = GradeLevel[self.grade]
        else:
            self.grade = GradeLevel.from_score(self.overall_score)
    
    @property
    def score_label(self) -> str:
        """获取评分标签"""
        return self.grade.label
    
    @property
    def score_grade_code(self) -> str:
        """获取评分等级代码"""
        return self.grade.code
    
    def get_dimension_by_name(self, name: str) -> Optional[DimensionScore]:
        """根据名称获取维度评分"""
        for dim in self.dimension_scores:
            if dim.name == name or dim.name_cn == name:
                return dim
        return None
    
    def get_weak_dimensions(self, threshold: float = 70.0) -> List[DimensionScore]:
        """获取薄弱维度（得分低于阈值）"""
        return [d for d in self.dimension_scores if d.score < threshold]
    
    def get_strong_dimensions(self, threshold: float = 80.0) -> List[DimensionScore]:
        """获取优势维度（得分高于阈值）"""
        return [d for d in self.dimension_scores if d.score >= threshold]


@dataclass
class CalculationResult:
    """
    指标计算结果
    
    存储从原始指标计算出的衍生指标
    """
    # 流量指标
    visit_conversion_rate: float = 0.0      # 入店转化率
    order_conversion_rate: float = 0.0      # 下单转化率
    overall_conversion_rate: float = 0.0    # 综合转化率
    exposure_cost_per_uv: float = 0.0       # 曝光成本
    
    # 订单指标
    aov: float = 0.0                        # 客单价
    actual_aov: float = 0.0                 # 实收客单价
    cancel_rate: float = 0.0                # 取消率
    
    # 评价指标
    total_reviews: int = 0                  # 总评价数
    positive_rate: float = 0.0              # 好评率
    negative_rate: float = 0.0              # 差评率
    complaint_rate: float = 0.0             # 投诉率
    negative_reply_rate: float = 0.0        # 差评回复率
    
    # 效率指标 (直接从原始数据获取)
    cook_time: float = 0.0                  # 出餐时间
    ontime_rate: float = 0.0                # 准时率
    refund_rate: float = 0.0                # 退单率
    
    # 盈利指标
    profit_margin: float = 0.0              # 毛利率 (估算)
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "visit_conversion_rate": round(self.visit_conversion_rate * 100, 2),
            "order_conversion_rate": round(self.order_conversion_rate * 100, 2),
            "overall_conversion_rate": round(self.overall_conversion_rate * 100, 2),
            "exposure_cost_per_uv": round(self.exposure_cost_per_uv, 2),
            "aov": round(self.aov, 2),
            "actual_aov": round(self.actual_aov, 2),
            "cancel_rate": round(self.cancel_rate * 100, 2),
            "positive_rate": round(self.positive_rate * 100, 2),
            "negative_rate": round(self.negative_rate * 100, 2),
            "complaint_rate": round(self.complaint_rate * 100, 4),
            "cook_time": round(self.cook_time, 1),
            "ontime_rate": round(self.ontime_rate, 2),
            "refund_rate": round(self.refund_rate * 100, 2),
        }
