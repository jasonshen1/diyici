# -*- coding: utf-8 -*-
"""
终端输出模块
负责在命令行中显示彩色诊断报告
"""

import sys
from typing import List, Dict, Any, Optional

from models import DiagnosisReport, DimensionScore, GradeLevel, ActionItem


class Colors:
    """ANSI 颜色代码定义"""
    # 基础颜色
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    
    # 前景色
    BLACK = "\033[30m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    WHITE = "\033[37m"
    
    # 亮前景色
    BRIGHT_RED = "\033[91m"
    BRIGHT_GREEN = "\033[92m"
    BRIGHT_YELLOW = "\033[93m"
    BRIGHT_BLUE = "\033[94m"
    BRIGHT_MAGENTA = "\033[95m"
    BRIGHT_CYAN = "\033[96m"
    BRIGHT_WHITE = "\033[97m"
    
    # 背景色
    BG_RED = "\033[41m"
    BG_GREEN = "\033[42m"
    BG_YELLOW = "\033[43m"
    BG_BLUE = "\033[44m"


class ConsoleRenderer:
    """
    终端报告渲染器
    
    使用 ANSI 颜色代码在终端中输出格式化的诊断报告
    """
    
    def __init__(self, use_color: bool = True):
        """
        初始化渲染器
        
        Args:
            use_color: 是否使用彩色输出
        """
        self.use_color = use_color and sys.platform != "win32"
        self.c = Colors() if self.use_color else type('obj', (object,), {
            k: '' for k in dir(Colors) if not k.startswith('_')
        })()
    
    def render(self, report: DiagnosisReport) -> str:
        """
        渲染完整报告
        
        Args:
            report: 诊断报告对象
        
        Returns:
            格式化后的报告字符串
        """
        lines = []
        
        # 报告标题
        lines.append(self._render_header())
        
        # 店铺信息
        lines.append(self._render_shop_info(report))
        
        # 总体评分
        lines.append(self._render_overall_score(report))
        
        # 各维度评分
        lines.append(self._render_dimension_scores(report))
        
        # 关键问题
        if report.top_issues:
            lines.append(self._render_top_issues(report))
        
        # 行动计划
        if report.action_plan:
            lines.append(self._render_action_plan(report))
        
        # 页脚
        lines.append(self._render_footer())
        
        return "\n".join(lines)
    
    def print(self, report: DiagnosisReport):
        """直接打印报告到终端"""
        print(self.render(report))
    
    def _render_header(self) -> str:
        """渲染报告标题"""
        width = 60
        title = "外卖店智能诊断报告"
        padding = (width - len(title) * 2) // 2
        
        header = f"""
{self.c.BRIGHT_CYAN}{'═' * width}{self.c.RESET}
{self.c.BOLD}{' ' * padding}{self.c.BRIGHT_CYAN}🍜 {title} 🍜{self.c.RESET}
{self.c.BRIGHT_CYAN}{'═' * width}{self.c.RESET}"""
        return header
    
    def _render_shop_info(self, report: DiagnosisReport) -> str:
        """渲染店铺信息"""
        return f"""
{self.c.BOLD}📍 店铺信息{self.c.RESET}
  ├─ 店铺名称: {self.c.BRIGHT_WHITE}{report.shop_name}{self.c.RESET}
  ├─ 诊断日期: {report.diagnosis_date}
  ├─ 经营平台: {report.platform}
  ├─ 经营品类: {report.category}
  └─ 发展阶段: {self._get_stage_label(report.stage)}"""
    
    def _render_overall_score(self, report: DiagnosisReport) -> str:
        """渲染总体评分卡片"""
        score = report.overall_score
        grade = report.score_grade_code
        label = report.score_label
        
        # 根据等级选择颜色
        color_map = {
            "S": self.c.BRIGHT_GREEN,
            "A": self.c.GREEN,
            "B": self.c.YELLOW,
            "C": self.c.BRIGHT_YELLOW,
            "D": self.c.BRIGHT_RED,
        }
        score_color = color_map.get(grade, self.c.WHITE)
        
        # 渲染评分卡片
        card = f"""
{self.c.BOLD}📊 总体评分{self.c.RESET}
  ┌─────────────────────────────────────────────────────┐
  │                                                     │
  │            {score_color}{self.c.BOLD}    {score:.1f}    {self.c.RESET}                          │
  │            {score_color}{self.c.BOLD}    {grade}级   {self.c.RESET}                          │
  │            {self.c.DIM}  {label}  {self.c.RESET}                          │
  │                                                     │
  └─────────────────────────────────────────────────────┘"""
        return card
    
    def _render_dimension_scores(self, report: DiagnosisReport) -> str:
        """渲染各维度评分"""
        lines = [f"\n{self.c.BOLD}📈 各维度评分详情{self.c.RESET}"]
        
        for dim in report.dimension_scores:
            lines.append(self._render_single_dimension(dim))
        
        return "\n".join(lines)
    
    def _render_single_dimension(self, dim: DimensionScore) -> str:
        """渲染单个维度的评分"""
        score = dim.score
        score_bar = self._render_score_bar(score, width=25)
        level = dim.get_score_level()
        
        # 根据得分选择颜色
        color = self._get_score_color(score)
        
        lines = [
            f"\n  {self.c.BOLD}{dim.name_cn}{self.c.RESET} {color}{score:.0f}分{self.c.RESET} ({level})",
            f"  {score_bar}",
        ]
        
        # 显示各指标详情
        for metric in dim.metrics:
            metric_line = self._render_metric_line(metric)
            lines.append(metric_line)
        
        return "\n".join(lines)
    
    def _render_metric_line(self, metric) -> str:
        """渲染单个指标行"""
        # 格式化数值显示
        if metric.unit == "%":
            value_str = f"{metric.value}%"
        elif metric.unit == "元":
            value_str = f"{metric.value}元"
        elif metric.unit == "分":
            value_str = f"{metric.value}分"
        elif metric.unit == "分钟":
            value_str = f"{metric.value}分钟"
        elif metric.unit == "‱":
            value_str = f"{metric.value}‱"
        else:
            value_str = f"{metric.value}"
        
        # 指标名称对齐
        name_map = {
            "visit_conversion": "入店转化率",
            "order_conversion": "下单转化率",
            "overall_conversion": "综合转化率",
            "exposure_cost": "曝光成本",
            "cancel_rate": "取消率",
            "aov": "客单价",
            "profit_margin": "毛利率",
            "rating": "平台评分",
            "positive_rate": "好评率",
            "negative_rate": "差评率",
            "complaint_rate": "投诉率",
            "cook_time": "出餐时间",
            "ontime_rate": "准时率",
            "refund_rate": "退单率",
        }
        name = name_map.get(metric.name, metric.name)
        
        # 得分颜色
        score_color = self._get_score_color(metric.score)
        level_str = self._get_level_str(metric.score)
        
        line = f"    {name:12s} {value_str:10s} {score_color}●{metric.score:.0f}分{self.c.RESET} {self.c.DIM}{level_str}{self.c.RESET}"
        return line
    
    def _render_score_bar(self, score: float, width: int = 20) -> str:
        """渲染评分进度条"""
        filled = int(score / 100 * width)
        empty = width - filled
        
        # 根据分数选择颜色
        if score >= 90:
            color = self.c.BRIGHT_GREEN
        elif score >= 80:
            color = self.c.GREEN
        elif score >= 70:
            color = self.c.YELLOW
        elif score >= 60:
            color = self.c.BRIGHT_YELLOW
        else:
            color = self.c.BRIGHT_RED
        
        bar = f"{color}{self.c.BOLD}{'█' * filled}{self.c.RESET}{self.c.DIM}{'░' * empty}{self.c.RESET}"
        return f"  {bar}"
    
    def _render_top_issues(self, report: DiagnosisReport) -> str:
        """渲染关键问题"""
        lines = [f"\n{self.c.BOLD}⚠️  关键问题 (Top {len(report.top_issues)}){self.c.RESET}"]
        
        for i, issue in enumerate(report.top_issues, 1):
            level = issue.get("level", "minor")
            level_cn = issue.get("level_cn", "一般")
            
            # 根据等级选择图标和颜色
            if level == "critical":
                icon = "🔴"
                color = self.c.BRIGHT_RED
            elif level == "major":
                icon = "🟠"
                color = self.c.YELLOW
            else:
                icon = "🟡"
                color = self.c.DIM
            
            lines.append(f"\n  {icon} {color}{self.c.BOLD}[{level_cn}] {issue['title']}{self.c.RESET}")
            lines.append(f"     {self.c.DIM}问题:{self.c.RESET} {issue['description']}")
            lines.append(f"     {self.c.DIM}影响:{self.c.RESET} {issue['impact']}")
            if issue.get("value") and issue.get("threshold"):
                lines.append(f"     {self.c.DIM}数值:{self.c.RESET} {issue['value']} (目标: {issue['threshold']})")
        
        return "\n".join(lines)
    
    def _render_action_plan(self, report: DiagnosisReport) -> str:
        """渲染行动计划"""
        lines = [f"\n{self.c.BOLD}📋 行动计划{self.c.RESET}"]
        
        plan = report.action_plan
        
        # P0 优先级
        if plan.get("P0"):
            lines.append(f"\n  {self.c.BRIGHT_RED}{self.c.BOLD}🔥 P0 - 本周必做{self.c.RESET}")
            for item in plan["P0"]:
                lines.append(self._render_action_item(item))
        
        # P1 优先级
        if plan.get("P1"):
            lines.append(f"\n  {self.c.YELLOW}{self.c.BOLD}📌 P1 - 近期完成{self.c.RESET}")
            for item in plan["P1"]:
                lines.append(self._render_action_item(item))
        
        # P2 优先级
        if plan.get("P2"):
            lines.append(f"\n  {self.c.DIM}{self.c.BOLD}📝 P2 - 持续优化{self.c.RESET}")
            for item in plan["P2"][:3]:  # 只显示前3个
                lines.append(self._render_action_item(item, compact=True))
        
        return "\n".join(lines)
    
    def _render_action_item(self, item: ActionItem, compact: bool = False) -> str:
        """渲染单个行动项"""
        if compact:
            return f"    □ {item.title}"
        else:
            lines = [
                f"    □ {self.c.BOLD}{item.title}{self.c.RESET}",
                f"      {self.c.DIM}内容:{self.c.RESET} {item.description}",
                f"      {self.c.DIM}预期:{self.c.RESET} {item.expected_effect}",
                f"      {self.c.DIM}耗时:{self.c.RESET} {item.time_estimate}",
            ]
            return "\n".join(lines)
    
    def _render_footer(self) -> str:
        """渲染页脚"""
        return f"""
{self.c.DIM}{'─' * 60}{self.c.RESET}
{self.c.DIM}💡 提示: 本报告基于店铺运营数据分析生成，建议结合实际情况调整优化策略{self.c.RESET}
{self.c.BRIGHT_CYAN}{'═' * 60}{self.c.RESET}
"""
    
    def _get_score_color(self, score: float) -> str:
        """根据分数获取颜色"""
        if score >= 90:
            return self.c.BRIGHT_GREEN
        elif score >= 80:
            return self.c.GREEN
        elif score >= 70:
            return self.c.YELLOW
        elif score >= 60:
            return self.c.BRIGHT_YELLOW
        else:
            return self.c.BRIGHT_RED
    
    def _get_level_str(self, score: float) -> str:
        """获取等级字符串"""
        if score >= 90:
            return "优秀"
        elif score >= 80:
            return "良好"
        elif score >= 70:
            return "及格"
        elif score >= 60:
            return "较差"
        else:
            return "危险"
    
    def _get_stage_label(self, stage: str) -> str:
        """获取阶段标签"""
        stage_map = {
            "new": "新店期 (0-3月)",
            "growth": "成长期 (3-12月)",
            "mature": "成熟期 (12月+)",
        }
        return stage_map.get(stage, stage)


def print_simple_report(report: DiagnosisReport):
    """
    打印简化版报告（无颜色）
    
    用于不支持ANSI颜色的环境
    """
    renderer = ConsoleRenderer(use_color=False)
    print(renderer.render(report))
