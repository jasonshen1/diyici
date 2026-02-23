# -*- coding: utf-8 -*-
"""
诊断分析模块
负责分析问题、生成优化建议和行动计划
"""

from typing import List, Dict, Any
from dataclasses import dataclass, field

from models import (
    ShopMetrics, 
    CalculationResult, 
    DimensionScore, 
    DiagnosisReport,
    ActionItem,
    GradeLevel,
)


@dataclass
class IssueItem:
    """问题条目"""
    level: str              # 严重等级: critical/major/minor
    dimension: str          # 所属维度
    title: str              # 问题标题
    description: str        # 问题描述
    impact: str             # 影响说明
    value: Any = None       # 具体数值
    threshold: Any = None   # 阈值


@dataclass
class SuggestionItem:
    """建议条目"""
    dimension: str          # 所属维度
    title: str              # 建议标题
    content: str            # 建议内容
    expected_effect: str    # 预期效果
    difficulty: str = "中"   # 实施难度


class DiagnosisAnalyzer:
    """
    诊断分析器
    
    根据评分结果分析问题，生成优化建议和行动计划
    """
    
    def __init__(
        self, 
        metrics: ShopMetrics, 
        calculation: CalculationResult,
        dimensions: List[DimensionScore]
    ):
        """
        初始化分析器
        
        Args:
            metrics: 原始指标
            calculation: 计算结果
            dimensions: 维度评分列表
        """
        self.metrics = metrics
        self.calc = calculation
        self.dimensions = {d.name: d for d in dimensions}
        self.issues: List[IssueItem] = []
        self.suggestions: List[SuggestionItem] = []
    
    def analyze(self) -> DiagnosisReport:
        """
        执行完整诊断分析
        
        Returns:
            完整的诊断报告
        """
        # 1. 分析各维度问题
        self._analyze_traffic_issues()
        self._analyze_conversion_issues()
        self._analyze_aov_issues()
        self._analyze_satisfaction_issues()
        self._analyze_efficiency_issues()
        
        # 2. 生成优化建议
        self._generate_suggestions()
        
        # 3. 生成行动计划
        action_plan = self._generate_action_plan()
        
        # 4. 获取优先处理问题
        top_issues = self._get_top_issues()
        
        # 5. 计算总体评分
        from core.evaluator import ScoreEvaluator
        evaluator = ScoreEvaluator(self.metrics, self.calc)
        overall_score = evaluator.calculate_overall_score(list(self.dimensions.values()))
        
        # 6. 组装报告
        report = DiagnosisReport(
            shop_name=self.metrics.name,
            diagnosis_date=self._get_current_date(),
            platform=self.metrics.platform,
            category=self.metrics.category,
            stage=self.metrics.stage,
            overall_score=overall_score,
            grade=GradeLevel.from_score(overall_score),
            dimension_scores=list(self.dimensions.values()),
            top_issues=[self._issue_to_dict(i) for i in top_issues],
            action_plan=action_plan,
            raw_metrics=self.metrics
        )
        
        return report
    
    def _analyze_traffic_issues(self):
        """分析流量健康度问题"""
        dim = self.dimensions.get("traffic")
        if not dim:
            return
        
        # 获取各指标得分
        metrics_dict = {m.name: m for m in dim.metrics}
        
        # 入店转化率问题
        visit_conv = metrics_dict.get("visit_conversion")
        if visit_conv and visit_conv.score < 50:
            level = "critical" if visit_conv.score < 30 else "major"
            self.issues.append(IssueItem(
                level=level,
                dimension="流量健康度",
                title="入店转化率过低",
                description=f"入店转化率仅{visit_conv.value}%，远低于行业平均水平(8%+)",
                impact="大量曝光未转化为访问，推广费浪费严重",
                value=f"{visit_conv.value}%",
                threshold="8%"
            ))
        
        # 下单转化率问题
        order_conv = metrics_dict.get("order_conversion")
        if order_conv and order_conv.score < 50:
            level = "critical" if order_conv.score < 30 else "major"
            self.issues.append(IssueItem(
                level=level,
                dimension="流量健康度",
                title="下单转化率偏低",
                description=f"下单转化率{order_conv.value}%，低于健康水平(18%+)",
                impact="访问用户未下单，商品或价格竞争力不足",
                value=f"{order_conv.value}%",
                threshold="18%"
            ))
        
        # 曝光成本问题
        exp_cost = metrics_dict.get("exposure_cost")
        if exp_cost and exp_cost.score < 50:
            self.issues.append(IssueItem(
                level="major",
                dimension="流量健康度",
                title="曝光成本过高",
                description=f"每曝光一人需花费{exp_cost.value}元，获客成本偏高",
                impact="推广投入产出比低，利润空间被压缩",
                value=f"{exp_cost.value}元",
                threshold="0.5元"
            ))
    
    def _analyze_conversion_issues(self):
        """分析转化能力问题"""
        dim = self.dimensions.get("conversion")
        if not dim:
            return
        
        metrics_dict = {m.name: m for m in dim.metrics}
        
        # 综合转化率问题
        overall = metrics_dict.get("overall_conversion")
        if overall and overall.score < 40:
            self.issues.append(IssueItem(
                level="critical",
                dimension="转化能力",
                title="整体转化效率低下",
                description=f"综合转化率仅{overall.value}%，存在严重问题",
                impact="流量利用率极低，急需优化店铺页面和商品",
                value=f"{overall.value}%",
                threshold="2.5%"
            ))
        
        # 取消率问题
        cancel = metrics_dict.get("cancel_rate")
        if cancel and cancel.score < 40:
            self.issues.append(IssueItem(
                level="major",
                dimension="转化能力",
                title="订单取消率偏高",
                description=f"订单取消率达{cancel.value}%，影响实际营收",
                impact="用户下单后取消，可能存在价格或配送问题",
                value=f"{cancel.value}%",
                threshold="4%"
            ))
    
    def _analyze_aov_issues(self):
        """分析客单价问题"""
        dim = self.dimensions.get("aov")
        if not dim:
            return
        
        metrics_dict = {m.name: m for m in dim.metrics}
        
        # 客单价偏低
        aov = metrics_dict.get("aov")
        if aov and aov.score < 50:
            self.issues.append(IssueItem(
                level="major",
                dimension="客单价水平",
                title="客单价低于品类平均",
                description=f"当前客单价{aov.value}元，低于品类P50水平({aov.benchmark}元)",
                impact="单笔订单收益低，需要更多订单量才能盈利",
                value=f"{aov.value}元",
                threshold=f"{aov.benchmark}元"
            ))
        
        # 毛利率问题
        profit = metrics_dict.get("profit_margin")
        if profit and profit.score < 40:
            self.issues.append(IssueItem(
                level="critical",
                dimension="客单价水平",
                title="毛利率过低",
                description=f"估算毛利率仅{profit.value}%，盈利空间有限",
                impact="店铺可能处于亏损状态，需立即调整价格或成本",
                value=f"{profit.value}%",
                threshold="25%"
            ))
    
    def _analyze_satisfaction_issues(self):
        """分析顾客满意度问题"""
        dim = self.dimensions.get("satisfaction")
        if not dim:
            return
        
        metrics_dict = {m.name: m for m in dim.metrics}
        
        # 评分问题
        rating = metrics_dict.get("rating")
        if rating and rating.score < 50:
            level = "critical" if rating.score < 30 else "major"
            self.issues.append(IssueItem(
                level=level,
                dimension="顾客满意度",
                title="平台评分偏低",
                description=f"当前评分{rating.value}分，影响店铺排名和转化",
                impact="评分低会降低用户信任，减少自然流量",
                value=f"{rating.value}分",
                threshold="4.5分"
            ))
        
        # 差评率问题
        negative = metrics_dict.get("negative_rate")
        if negative and negative.score < 40:
            level = "critical" if negative.value > 5 else "major"
            self.issues.append(IssueItem(
                level=level,
                dimension="顾客满意度",
                title="差评率过高",
                description=f"差评率达{negative.value}%，存在明显体验问题",
                impact="差评会直接影响转化，需分析差评原因并改进",
                value=f"{negative.value}%",
                threshold="2%"
            ))
        
        # 投诉问题
        complaint = metrics_dict.get("complaint_rate")
        if complaint and complaint.score < 30:
            self.issues.append(IssueItem(
                level="critical",
                dimension="顾客满意度",
                title="投诉率异常",
                description=f"投诉率达{complaint.value}‱，可能存在食安或服务质量问题",
                impact="投诉可能导致平台处罚，需立即排查整改",
                value=f"{complaint.value}‱",
                threshold="0.3‱"
            ))
    
    def _analyze_efficiency_issues(self):
        """分析运营效率问题"""
        dim = self.dimensions.get("efficiency")
        if not dim:
            return
        
        metrics_dict = {m.name: m for m in dim.metrics}
        
        # 出餐时间问题
        cook = metrics_dict.get("cook_time")
        if cook and cook.score < 50:
            level = "critical" if cook.value > 20 else "major"
            self.issues.append(IssueItem(
                level=level,
                dimension="运营效率",
                title="出餐时间过长",
                description=f"平均出餐时间{cook.value}分钟，影响用户体验",
                impact="出餐慢会导致准时率低、用户投诉增加",
                value=f"{cook.value}分钟",
                threshold="12分钟"
            ))
        
        # 准时率问题
        ontime = metrics_dict.get("ontime_rate")
        if ontime and ontime.score < 50:
            self.issues.append(IssueItem(
                level="major",
                dimension="运营效率",
                title="准时率不达标",
                description=f"准时率仅{ontime.value}%，影响用户满意度",
                impact="送餐不准时会导致差评增加",
                value=f"{ontime.value}%",
                threshold="95%"
            ))
        
        # 退单率问题
        refund = metrics_dict.get("refund_rate")
        if refund and refund.score < 40:
            self.issues.append(IssueItem(
                level="major",
                dimension="运营效率",
                title="退单率偏高",
                description=f"退单率达{refund.value}%，存在运营问题",
                impact="频繁退单可能是缺货或出品质量问题",
                value=f"{refund.value}%",
                threshold="2%"
            ))
    
    def _generate_suggestions(self):
        """生成优化建议"""
        # 根据问题生成针对性建议
        for issue in self.issues:
            if issue.level == "critical":
                difficulty = "高"
            elif issue.level == "major":
                difficulty = "中"
            else:
                difficulty = "低"
            
            suggestion = SuggestionItem(
                dimension=issue.dimension,
                title=f"改进: {issue.title}",
                content=self._get_suggestion_content(issue),
                expected_effect=self._get_expected_effect(issue),
                difficulty=difficulty
            )
            self.suggestions.append(suggestion)
    
    def _get_suggestion_content(self, issue: IssueItem) -> str:
        """根据问题类型获取建议内容"""
        suggestion_map = {
            "入店转化率过低": "优化店铺头像和名称，完善店铺装修，设置有吸引力的满减活动并突出展示",
            "下单转化率偏低": "优化菜品图片质量，调整价格策略，增加套餐组合，提升评价星级",
            "曝光成本过高": "优化自然排名因素，提升复购率，减少对付费推广的依赖",
            "整体转化效率低下": "全面检查店铺页面，分析用户流失环节，优化菜单结构和价格体系",
            "订单取消率偏高": "检查配送范围和时效，优化价格展示（避免用户下单后发现额外费用）",
            "客单价低于品类平均": "设计高价值套餐，设置合理的满减梯度，引导用户凑单",
            "毛利率过低": "调整价格结构，优化食材成本，控制推广费用占比",
            "平台评分偏低": "主动邀请满意顾客留评，及时回复差评并解决问题，提升服务质量",
            "差评率过高": "分析差评关键词，针对性改进（如分量/口味/包装），加强出餐品控",
            "投诉率异常": "立即排查食品安全隐患，检查配送包装，培训员工服务规范",
            "出餐时间过长": "优化后厨动线，增加人手，精简菜单，设置合理的备餐量",
            "准时率不达标": "优化订单分配流程，提前备料，与配送员加强沟通",
            "退单率偏高": "加强库存管理，设置自动沽清，避免用户下单后告知缺货",
        }
        return suggestion_map.get(issue.title, "建议深入分析问题原因，制定针对性改进方案")
    
    def _get_expected_effect(self, issue: IssueItem) -> str:
        """获取预期效果"""
        effect_map = {
            "入店转化率过低": "入店转化率提升2-5%，推广效率提升",
            "下单转化率偏低": "下单转化率提升3-8%，订单量增加",
            "曝光成本过高": "曝光成本降低20-30%，ROI提升",
            "整体转化效率低下": "综合转化率提升50%以上",
            "订单取消率偏高": "取消率降低至3%以下",
            "客单价低于品类平均": "客单价提升10-20%",
            "毛利率过低": "毛利率提升5-10个百分点",
            "平台评分偏低": "评分提升0.2-0.5分",
            "差评率过高": "差评率降低50%以上",
            "投诉率异常": "投诉率控制在安全范围内",
            "出餐时间过长": "出餐时间缩短至12分钟以内",
            "准时率不达标": "准时率提升至95%以上",
            "退单率偏高": "退单率降低至2%以下",
        }
        return effect_map.get(issue.title, "预期有显著改善")
    
    def _generate_action_plan(self) -> Dict[str, List[ActionItem]]:
        """生成行动计划"""
        p0_items = []  # 本周必做
        p1_items = []  # 近期完成
        p2_items = []  # 持续优化
        
        for issue in self.issues:
            action = ActionItem(
                priority="P0" if issue.level == "critical" else "P1",
                title=f"解决: {issue.title}",
                description=issue.description,
                expected_effect=self._get_expected_effect(issue),
                time_estimate="1-3天" if issue.level == "critical" else "1-2周",
                dimension=issue.dimension
            )
            
            if issue.level == "critical":
                p0_items.append(action)
            elif issue.level == "major":
                p1_items.append(action)
            else:
                p2_items.append(action)
        
        # 如果没有严重问题，添加一些通用优化建议
        if not p0_items:
            p2_items.extend(self._get_general_improvements())
        
        return {
            "P0": p0_items,
            "P1": p1_items,
            "P2": p2_items
        }
    
    def _get_general_improvements(self) -> List[ActionItem]:
        """获取通用优化建议"""
        return [
            ActionItem(
                priority="P2",
                title="定期分析经营数据",
                description="每周分析一次流量、转化、评价等核心数据",
                expected_effect="及时发现问题，持续优化经营",
                time_estimate="每周30分钟",
                dimension="数据运营"
            ),
            ActionItem(
                priority="P2",
                title="关注竞品动态",
                description="定期查看同类店铺的活动和价格策略",
                expected_effect="保持竞争力，及时调整策略",
                time_estimate="每周1小时",
                dimension="竞争分析"
            ),
        ]
    
    def _get_top_issues(self, limit: int = 5) -> List[IssueItem]:
        """获取优先处理的Top问题"""
        # 按严重等级排序
        level_order = {"critical": 0, "major": 1, "minor": 2}
        sorted_issues = sorted(
            self.issues, 
            key=lambda x: (level_order.get(x.level, 3), x.dimension)
        )
        return sorted_issues[:limit]
    
    def _issue_to_dict(self, issue: IssueItem) -> Dict[str, Any]:
        """将问题转换为字典"""
        return {
            "level": issue.level,
            "level_cn": {"critical": "严重", "major": "重要", "minor": "一般"}.get(issue.level, "一般"),
            "dimension": issue.dimension,
            "title": issue.title,
            "description": issue.description,
            "impact": issue.impact,
            "value": issue.value,
            "threshold": issue.threshold,
        }
    
    def _get_current_date(self) -> str:
        """获取当前日期"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d")
