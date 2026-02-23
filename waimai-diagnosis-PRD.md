# 外卖店诊断系统产品需求文档（PRD）

**版本**: v1.0  
**日期**: 2026-02-23  
**作者**: 产品经理  
**状态**: 评审中  

---

## 1. 产品概述

### 1.1 产品背景
外卖行业竞争激烈，店铺运营涉及多个复杂维度（流量、转化、客单价、评价、效率等）。许多中小外卖店主缺乏专业的数据分析能力，无法及时发现店铺问题并做出优化决策。

### 1.2 产品目标
构建一套**智能化、可量化、可落地**的外卖店诊断系统，帮助用户：
- 快速识别店铺运营问题
- 获取针对性的优化建议
- 制定可执行的行动计划

### 1.3 目标用户
| 用户类型 | 特征 | 核心需求 |
|---------|------|---------|
| 个体外卖店主 | 1-3家店，非专业运营 | 简单易懂，直接给建议 |
| 连锁品牌运营 | 多店管理，有运营团队 | 数据对比，标准化诊断 |
| 外卖代运营 | 服务多个商家 | 批量诊断，效率工具 |

---

## 2. 功能模块设计

### 2.1 数据输入模块

#### 2.1.1 基础信息（必填）
| 字段 | 类型 | 说明 |
|-----|------|------|
| 店铺名称 | string | 用于报告展示 |
| 平台类型 | enum | 美团外卖/饿了么/双平台 |
| 经营品类 | enum | 快餐/饮品/烧烤/甜点等 |
| 店铺等级 | enum | 新店(0-3月)/成长期(3-12月)/成熟期(12月+) |
| 商圈类型 | enum | 写字楼/居民区/学校/商场/混合 |

#### 2.1.2 核心运营指标（必填）

**流量相关指标**
| 指标名称 | 字段名 | 单位 | 数据周期 |
|---------|--------|------|---------|
| 曝光人数 | exposure_uv | 人 | 近7日日均 |
| 访问人数 | visit_uv | 人 | 近7日日均 |
| 下单人数 | order_uv | 人 | 近7日日均 |
| 推广花费 | promotion_cost | 元 | 近7日日均 |

**订单相关指标**
| 指标名称 | 字段名 | 单位 | 数据周期 |
|---------|--------|------|---------|
| 订单量 | order_count | 单 | 近7日日均 |
| 营业额 | revenue | 元 | 近7日日均 |
| 实收金额 | actual_revenue | 元 | 近7日日均 |
| 取消订单数 | cancel_count | 单 | 近7日日均 |

**评价相关指标**
| 指标名称 | 字段名 | 单位 | 数据周期 |
|---------|--------|------|---------|
| 好评数 | positive_reviews | 条 | 近30日累计 |
| 差评数 | negative_reviews | 条 | 近30日累计 |
| 投诉数 | complaints | 条 | 近30日累计 |
| 平均评分 | rating | 分(1-5) | 当前值 |

**效率相关指标**
| 指标名称 | 字段名 | 单位 | 数据周期 |
|---------|--------|------|---------|
| 平均出餐时间 | cook_time | 分钟 | 近7日平均 |
| 准时率 | ontime_rate | % | 近7日平均 |
| 退单率 | refund_rate | % | 近7日平均 |

#### 2.1.3 进阶指标（选填，用于更精准诊断）
| 指标名称 | 字段名 | 说明 |
|---------|--------|------|
| 新客占比 | new_customer_rate | 新客订单/总订单 |
| 复购率 | repurchase_rate | 30日内复购比例 |
| 客单价分布 | price_distribution | 各价格区间订单占比 |
| 高峰时段订单占比 | peak_ratio | 午餐/晚餐/夜宵占比 |
| 满减活动力度 | discount_rate | 活动支出/营业额 |
| 配送费 | delivery_fee | 平均配送费 |
| 起送价 | min_order | 起送门槛 |

---

### 2.2 指标阈值与评分标准

#### 2.2.1 流量健康度指标

| 指标 | 计算方式 | 优秀(90-100) | 良好(70-89) | 一般(50-69) | 较差(30-49) | 危险(0-29) |
|-----|---------|-------------|------------|------------|------------|-----------|
| 入店转化率 | 访问UV/曝光UV | ≥12% | 8%-12% | 5%-8% | 3%-5% | <3% |
| 下单转化率 | 下单UV/访问UV | ≥25% | 18%-25% | 12%-18% | 8%-12% | <8% |
| 曝光成本 | 推广费/曝光UV | ≤0.3元 | 0.3-0.5元 | 0.5-0.8元 | 0.8-1.2元 | >1.2元 |
| 流量结构健康度 | 自然曝光/总曝光 | ≥70% | 50%-70% | 30%-50% | 15%-30% | <15% |

**品类修正系数**
- 快餐简餐：转化率基准 × 1.0
- 饮品甜点：转化率基准 × 0.85
- 烧烤夜宵：转化率基准 × 0.9
- 轻食沙拉：转化率基准 × 0.8

#### 2.2.2 转化能力指标

| 指标 | 计算方式 | 优秀 | 良好 | 一般 | 较差 | 危险 |
|-----|---------|------|------|------|------|------|
| 综合转化率 | 下单UV/曝光UV | ≥3.5% | 2.5%-3.5% | 1.5%-2.5% | 0.8%-1.5% | <0.8% |
| 新客转化率 | 新客订单/新客访问 | ≥20% | 14%-20% | 9%-14% | 5%-9% | <5% |
| 加购率 | 加购人数/访问UV | ≥15% | 10%-15% | 6%-10% | 3%-6% | <3% |
| 购物车放弃率 | 放弃加购/总加购 | ≤30% | 30%-45% | 45%-60% | 60%-75% | >75% |

#### 2.2.3 客单价指标

| 指标 | 计算方式 | 优秀 | 良好 | 一般 | 较差 | 危险 |
|-----|---------|------|------|------|------|------|
| 客单价 | 营业额/订单量 | 品类P75+ | P50-P75 | P25-P50 | P10-P25 | <P10 |
| 毛利空间 | (实收-成本)/营业额 | ≥35% | 25%-35% | 15%-25% | 8%-15% | <8% |
| 凑单率 | 满减触订单/总订单 | ≥40% | 25%-40% | 15%-25% | 8%-15% | <8% |
| 套餐占比 | 套餐订单/总订单 | ≥30% | 20%-30% | 12%-20% | 5%-12% | <5% |

**客单价基准参考（按品类）**
| 品类 | P10 | P25 | P50 | P75 | P90 |
|-----|-----|-----|-----|-----|-----|
| 快餐简餐 | 15 | 20 | 28 | 38 | 50 |
| 饮品 | 12 | 15 | 20 | 28 | 38 |
| 烧烤 | 35 | 50 | 70 | 95 | 130 |
| 甜点 | 18 | 25 | 35 | 48 | 65 |

#### 2.2.4 顾客满意度指标

| 指标 | 计算方式 | 优秀 | 良好 | 一般 | 较差 | 危险 |
|-----|---------|------|------|------|------|------|
| 评分等级 | 平台评分 | ≥4.8 | 4.6-4.8 | 4.3-4.6 | 4.0-4.3 | <4.0 |
| 好评率 | 好评/总评价 | ≥95% | 90%-95% | 85%-90% | 78%-85% | <78% |
| 差评率 | 差评/总评价 | ≤1% | 1%-2% | 2%-4% | 4%-7% | >7% |
| 投诉率 | 投诉/总订单 | ≤0.1% | 0.1%-0.3% | 0.3%-0.6% | 0.6%-1% | >1% |
| 差评回复率 | 已回复差评/总差评 | 100% | 90%-100% | 70%-90% | 50%-70% | <50% |

#### 2.2.5 运营效率指标

| 指标 | 计算方式 | 优秀 | 良好 | 一般 | 较差 | 危险 |
|-----|---------|------|------|------|------|------|
| 出餐时效 | 平均出餐时间 | ≤8分钟 | 8-12分钟 | 12-18分钟 | 18-25分钟 | >25分钟 |
| 准时率 | 准时订单/总订单 | ≥98% | 95%-98% | 90%-95% | 85%-90% | <85% |
| 取消率 | 取消订单/总订单 | ≤2% | 2%-4% | 4%-7% | 7%-12% | >12% |
| 退单率 | 退单/总订单 | ≤1% | 1%-2% | 2%-4% | 4%-7% | >7% |
| 食安问题率 | 食安投诉/总订单 | 0% | 0%-0.1% | 0.1%-0.3% | 0.3%-0.5% | >0.5% |

---

### 2.3 诊断逻辑与评分机制

#### 2.3.1 评分权重设计

| 诊断维度 | 权重 | 适用场景说明 |
|---------|------|-------------|
| 流量健康度 | 25% | 适用于所有阶段店铺 |
| 转化能力 | 25% | 适用于所有阶段店铺 |
| 客单价水平 | 15% | 适用于成长期/成熟期店铺 |
| 顾客满意度 | 20% | 适用于所有阶段店铺，新店权重-5% |
| 运营效率 | 15% | 适用于所有阶段店铺 |

**店铺阶段权重调整**
- 新店期（0-3月）：流量40% / 转化30% / 满意度20% / 效率10%
- 成长期（3-12月）：流量25% / 转化25% / 客单价15% / 满意度20% / 效率15%
- 成熟期（12月+）：流量20% / 转化20% / 客单价25% / 满意度20% / 效率15%

#### 2.3.2 单项指标评分算法

```python
def calculate_metric_score(value, thresholds):
    """
    阈值区间线性插值评分
    thresholds: [危险上限, 较差上限, 一般上限, 良好上限, 优秀上限]
    """
    if value >= thresholds[4]:  # 优秀
        return min(100, 90 + (value - thresholds[4]) / thresholds[4] * 10)
    elif value >= thresholds[3]:  # 良好
        return 70 + (value - thresholds[3]) / (thresholds[4] - thresholds[3]) * 20
    elif value >= thresholds[2]:  # 一般
        return 50 + (value - thresholds[2]) / (thresholds[3] - thresholds[2]) * 20
    elif value >= thresholds[1]:  # 较差
        return 30 + (value - thresholds[1]) / (thresholds[2] - thresholds[1]) * 20
    elif value >= thresholds[0]:  # 危险
        return max(0, (value - thresholds[0]) / (thresholds[1] - thresholds[0]) * 30)
    else:
        return max(0, 30 - (thresholds[0] - value) / thresholds[0] * 30)
```

#### 2.3.3 维度评分计算

```python
def calculate_dimension_score(metrics_scores, weights):
    """
    加权平均计算维度得分
    """
    total_weight = sum(weights.values())
    weighted_sum = sum(score * weights[metric] 
                      for metric, score in metrics_scores.items())
    return round(weighted_sum / total_weight, 1)
```

#### 2.3.4 总体评分计算

```python
def calculate_overall_score(dimension_scores, dimension_weights):
    """
    多维度加权计算总分
    """
    total = sum(score * weight 
               for score, weight in zip(dimension_scores, dimension_weights))
    return round(total, 1)
```

#### 2.3.5 评分等级划分

| 总分区间 | 等级 | 颜色标识 | 诊断结论 |
|---------|------|---------|---------|
| 90-100 | S | 🟢 深绿 | 优秀店铺，保持优势 |
| 80-89 | A | 🟢 绿色 | 良好店铺，持续优化 |
| 70-79 | B | 🟡 黄色 | 及格店铺，重点改进 |
| 60-69 | C | 🟠 橙色 | 较差店铺，急需优化 |
| 0-59 | D | 🔴 红色 | 危险店铺，立即整改 |

---

## 3. 诊断维度详细设计

### 3.1 流量健康度（Traffic Health）

**诊断目标**：评估店铺获取流量的能力和效率

**核心指标**：
1. 入店转化率（访问UV / 曝光UV）
2. 下单转化率（下单UV / 访问UV）
3. 曝光成本（推广费 / 曝光UV）
4. 流量结构（自然流量占比）

**诊断逻辑**：
```
IF 入店转化率 < 5% AND 曝光UV > 1000:
    → 问题：门店吸引力不足
    → 可能原因：店铺头像/名称/评分/满减信息不吸引
    
IF 下单转化率 < 10% AND 访问UV > 200:
    → 问题：商品或价格竞争力不足
    → 可能原因：菜品图片/价格/评价/套餐设计
    
IF 曝光成本 > 0.8元 AND 自然流量占比 < 30%:
    → 问题：流量结构不健康，过度依赖付费推广
    → 建议：优化自然排名因素
```

### 3.2 转化能力（Conversion Ability）

**诊断目标**：评估从流量到订单的转化效率

**核心指标**：
1. 综合转化率（下单UV / 曝光UV）
2. 新客转化率
3. 加购率
4. 购物车放弃率

**诊断逻辑**：
```
IF 新客转化率 < 新客基准 × 0.6:
    → 问题：新客获取困难
    → 建议：优化新人专享、首单立减
    
IF 加购率 > 10% AND 放弃率 > 60%:
    → 问题：价格或凑单门槛设置不合理
    → 建议：优化满减梯度、降低起送价
```

### 3.3 客单价分析（AOV Analysis）

**诊断目标**：评估店铺的盈利空间和价格策略

**核心指标**：
1. 实际客单价
2. 毛利空间
3. 凑单率
4. 套餐占比

**诊断逻辑**：
```
IF 客单价 < 品类P25 AND 毛利 < 20%:
    → 问题：低价低利恶性循环
    → 建议：调整产品结构，推套餐组合
    
IF 凑单率 < 15%:
    → 问题：满减活动吸引力不足
    → 建议：优化满减门槛与力度
```

### 3.4 顾客满意度（Customer Satisfaction）

**诊断目标**：评估顾客体验和店铺口碑

**核心指标**：
1. 平台评分
2. 好评率
3. 差评率
4. 投诉率
5. 差评回复率

**诊断逻辑**：
```
IF 评分 < 4.5 AND 差评率 > 3%:
    → 问题：存在明显体验短板
    → 需分析差评关键词（口味/分量/卫生/配送）
    
IF 投诉率 > 0.5%:
    → 严重问题：可能存在食安风险
    → 立即排查食材和操作流程
```

### 3.5 运营效率（Operational Efficiency）

**诊断目标**：评估店铺的运营执行能力

**核心指标**：
1. 平均出餐时间
2. 准时率
3. 取消率
4. 退单率

**诊断逻辑**：
```
IF 出餐时间 > 20分钟 AND 准时率 < 90%:
    → 问题：产能不足或流程不畅
    → 建议：优化动线、增加人手、精简菜单
    
IF 退单率 > 3%:
    → 问题：出品不稳定或缺货频繁
    → 建议：加强库存管理、设置自动沽清
```

---

## 4. 报告输出设计

### 4.1 总体结构

```
┌─────────────────────────────────────────┐
│           外卖店诊断报告                 │
│         店铺：XXX                        │
│         诊断日期：2026-02-23            │
├─────────────────────────────────────────┤
│                                         │
│   ┌──────┐                             │
│   │  82  │  总体评分：A级（良好）        │
│   │  A   │  行业排名：前35%             │
│   └──────┘                             │
│                                         │
├─────────────────────────────────────────┤
│  📊 各维度评分                          │
│  ├─ 流量健康度     ████████░░  78分    │
│  ├─ 转化能力       ████████░░  80分    │
│  ├─ 客单价水平     █████████░  85分    │
│  ├─ 顾客满意度     ███████░░░  72分    │
│  └─ 运营效率       ████████░░  79分    │
├─────────────────────────────────────────┤
│  ⚠️ 关键问题（Top 3）                   │
├─────────────────────────────────────────┤
│  💡 优化建议                            │
├─────────────────────────────────────────┤
│  📋 行动计划                            │
└─────────────────────────────────────────┘
```

### 4.2 总体评分展示

**展示要素**：
- 百分制分数（0-100）
- 等级标识（S/A/B/C/D）
- 颜色标识（深绿/绿/黄/橙/红）
- 行业排名（前X%）
- 环比变化（↑↓X分）

**评分解读文案**：
| 等级 | 标题 | 描述 |
|-----|------|------|
| S | 优秀店铺 | 各项指标表现优异，保持现有运营策略，可作为标杆店铺 |
| A | 良好店铺 | 整体表现良好，有少量优化空间，建议针对性改进 |
| B | 及格店铺 | 存在明显短板，需要重点关注并制定改进计划 |
| C | 较差店铺 | 多项指标不合格，需全面诊断并立即整改 |
| D | 危险店铺 | 店铺运营存在严重问题，需紧急干预避免闭店风险 |

### 4.3 各维度评分展示

**展示格式**：
```
┌────────────────────────────────────────────┐
│ 📊 流量健康度                          78分 │
├────────────────────────────────────────────┤
│ 入店转化率    6.5%    ████░░░░░░  一般    │
│ 下单转化率    22%     ███████░░░  良好    │
│ 曝光成本      0.45元  ████████░░  良好    │
│ 自然流量占比  55%     █████░░░░░  一般    │
├────────────────────────────────────────────┤
│ 💡 主要问题：入店转化率低于行业均值        │
│    优化方向：提升店铺头像吸引力、优化满减展示│
└────────────────────────────────────────────┘
```

### 4.4 问题诊断模块

**问题分级**：
- 🔴 严重问题：影响店铺正常经营，需立即处理
- 🟠 重要问题：影响店铺发展，需近期解决
- 🟡 一般问题：有优化空间，可逐步改进

**问题展示格式**：
```
┌─────────────────────────────────────────────┐
│ 🔴 严重问题                                  │
├─────────────────────────────────────────────┤
│ 1. 差评率过高（5.2% > 安全线2%）             │
│    影响：拉低店铺评分，降低转化率             │
│    根因：近30日收到12条差评，其中8条提及"分量少"│
│    紧急度：★★★★★                           │
└─────────────────────────────────────────────┘
```

### 4.5 优化建议模块

**建议分类**：
- 🎯 流量获取：如何提升曝光和进店
- 💰 转化提升：如何提高下单率
- 📈 客单提升：如何提升客单价
- ⭐ 口碑维护：如何提升评分
- ⚡ 效率优化：如何提升运营效率

**建议格式**：
```
┌─────────────────────────────────────────────┐
│ 💡 优化建议 - 转化提升                       │
├─────────────────────────────────────────────┤
│ 【问题】加购率高(18%)但放弃率也高(65%)        │
│ 【分析】用户有意向但价格或凑单门槛劝退        │
│ 【建议】                                     │
│  1. 降低起送价从35元降至25元                │
│  2. 增加20-25元价位段的引流单品             │
│  3. 设置"满25减5"的轻度满减活动             │
│ 【预期效果】放弃率降低至50%，转化率提升2-3%   │
└─────────────────────────────────────────────┘
```

### 4.6 行动计划模块

**优先级划分**：
- P0 - 本周必做：影响店铺生存的关键问题
- P1 - 近期完成：影响店铺发展的重要优化
- P2 - 持续优化：长期提升的改进项

**行动卡格式**：
```
┌─────────────────────────────────────────────┐
│ 📋 行动计划                                  │
├─────────────────────────────────────────────┤
│ 🔥 P0 - 本周必做                            │
│ □ 回复近30天所有未回复差评（预计耗时30分钟）  │
│ □ 下架"分量少"相关的差评菜品，调整配方       │
│ □ 设置自动回复，降低投诉升级概率             │
├─────────────────────────────────────────────┤
│ 📌 P1 - 近期完成（2周内）                    │
│ □ 设计2个25元价位的新套餐                    │
│ □ 优化店铺海报，突出招牌菜                   │
│ □ 申请平台"新店流量扶持"活动                │
├─────────────────────────────────────────────┤
│ 📝 P2 - 持续优化                            │
│ □ 每周分析一次差评关键词                     │
│ □ 每月更新一次菜单结构                       │
│ □ 建立常客微信群，提升复购                   │
└─────────────────────────────────────────────┘
```

### 4.7 输出格式支持

| 格式 | 适用场景 | 特性 |
|-----|---------|------|
| 终端报告 | 快速查看、命令行用户 | 纯文本 + ANSI颜色 |
| Markdown | 文档留存、团队协作 | 标准MD语法，可渲染 |
| HTML | 可视化展示、分享 | 响应式布局，可打印 |
| JSON | 系统集成、二次开发 | 结构化数据 |

---

## 5. 技术方案建议

### 5.1 技术架构

```
┌─────────────────────────────────────────────────────┐
│                     输入层                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 命令行   │  │ 配置文件 │  │ 交互式   │          │
│  │ 参数    │  │ JSON/YAML│  │ 问答    │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
└───────┼─────────────┼─────────────┼────────────────┘
        │             │             │
        └─────────────┴─────────────┘
                      │
┌─────────────────────┴───────────────────────────────┐
│                    核心引擎                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ 数据校验     │→ │ 指标计算     │→ │ 维度评分 │  │
│  │ Validator    │  │ Calculator   │  │ Scorer   │  │
│  └──────────────┘  └──────────────┘  └────┬─────┘  │
│                                           │        │
│  ┌──────────────┐  ┌──────────────┐  ┌────┴─────┐  │
│  │ 问题诊断     │← │ 建议生成     │← │ 报告生成 │  │
│  │ Diagnoser    │  │ Advisor      │  │ Reporter │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────┐
│                    输出层                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 终端    │  │ Markdown │  │ HTML     │          │
│  │ 输出    │  │ 报告    │  │ 报告    │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────┘
```

### 5.2 项目结构

```
waimai-diagnosis/
├── main.py                 # 主入口
├── config/
│   ├── __init__.py
│   ├── thresholds.py       # 指标阈值配置
│   ├── weights.py          # 评分权重配置
│   └── advice_library.py   # 建议库
├── core/
│   ├── __init__.py
│   ├── data_validator.py   # 数据校验
│   ├── calculator.py       # 指标计算
│   ├── scorer.py           # 评分引擎
│   ├── diagnoser.py        # 诊断引擎
│   └── advisor.py          # 建议生成
├── models/
│   ├── __init__.py
│   ├── shop.py             # 店铺数据模型
│   └── report.py           # 报告数据模型
├── output/
│   ├── __init__.py
│   ├── terminal.py         # 终端输出
│   ├── markdown.py         # Markdown输出
│   └── html.py             # HTML输出
├── templates/
│   ├── report.html         # HTML模板
│   └── style.css           # 样式文件
├── tests/
│   └── test_*.py
├── requirements.txt
└── README.md
```

### 5.3 核心数据结构

```python
# models/shop.py
from dataclasses import dataclass
from typing import Optional
from enum import Enum

class Platform(Enum):
    MEITUAN = "美团外卖"
    ELEME = "饿了么"
    BOTH = "双平台"

class ShopStage(Enum):
    NEW = "新店期"      # 0-3月
    GROWTH = "成长期"   # 3-12月
    MATURE = "成熟期"   # 12月+

@dataclass
class ShopMetrics:
    """店铺核心指标"""
    # 基础信息
    name: str
    platform: Platform
    category: str
    stage: ShopStage
    
    # 流量指标
    exposure_uv: int          # 曝光人数
    visit_uv: int             # 访问人数
    order_uv: int             # 下单人数
    promotion_cost: float     # 推广花费
    
    # 订单指标
    order_count: int          # 订单量
    revenue: float            # 营业额
    actual_revenue: float     # 实收金额
    cancel_count: int         # 取消订单
    
    # 评价指标
    positive_reviews: int     # 好评数
    negative_reviews: int     # 差评数
    complaints: int           # 投诉数
    rating: float             # 平均评分
    
    # 效率指标
    cook_time: float          # 出餐时间(分钟)
    ontime_rate: float        # 准时率(%)
    refund_rate: float        # 退单率(%)
    
    # 进阶指标(选填)
    new_customer_rate: Optional[float] = None
    repurchase_rate: Optional[float] = None

@dataclass
class DimensionScore:
    """维度评分"""
    name: str
    score: float
    weight: float
    metrics: dict             # 各指标得分详情
    issues: list              # 该维度问题列表
    suggestions: list         # 该维度建议列表

@dataclass
class DiagnosisReport:
    """诊断报告"""
    shop_name: str
    diagnosis_date: str
    overall_score: float
    grade: str
    dimension_scores: list[DimensionScore]
    top_issues: list          # 优先处理问题
    action_plan: dict         # 行动计划
```

### 5.4 输入方式实现

**方式1：命令行参数**
```bash
python main.py \
  --name "老张牛肉面" \
  --platform meituan \
  --category "快餐" \
  --stage growth \
  --exposure-uv 5000 \
  --visit-uv 350 \
  --order-uv 70 \
  ...
```

**方式2：配置文件**
```bash
python main.py --config shop_data.json
```

**方式3：交互式问答**
```bash
python main.py --interactive
# 系统依次询问各指标
```

### 5.5 核心算法伪代码

```python
# core/scorer.py

class ScoreEngine:
    def __init__(self, shop_stage: ShopStage, category: str):
        self.weights = get_weights(shop_stage)
        self.thresholds = get_thresholds(category)
    
    def calculate_metric(self, metric_name: str, value: float) -> float:
        """计算单项指标得分"""
        thresholds = self.thresholds[metric_name]
        return linear_interpolate_score(value, thresholds)
    
    def calculate_dimension(self, dimension: str, metrics: dict) -> DimensionScore:
        """计算维度得分"""
        metric_scores = {}
        for metric, value in metrics.items():
            metric_scores[metric] = self.calculate_metric(metric, value)
        
        # 加权平均
        dimension_weight = self.weights[dimension]
        weighted_scores = [
            score * METRIC_WEIGHTS[dimension][metric]
            for metric, score in metric_scores.items()
        ]
        total_weight = sum(METRIC_WEIGHTS[dimension].values())
        dimension_score = sum(weighted_scores) / total_weight
        
        return DimensionScore(
            name=dimension,
            score=dimension_score,
            weight=dimension_weight,
            metrics=metric_scores,
            issues=self.identify_issues(dimension, metric_scores),
            suggestions=self.generate_suggestions(dimension, metric_scores)
        )
    
    def calculate_overall(self, dimension_scores: list) -> float:
        """计算总体得分"""
        weighted_sum = sum(
            ds.score * ds.weight for ds in dimension_scores
        )
        total_weight = sum(ds.weight for ds in dimension_scores)
        return weighted_sum / total_weight
```

### 5.6 建议生成逻辑

```python
# core/advisor.py

class AdviceEngine:
    def __init__(self):
        self.advice_library = load_advice_library()
    
    def generate_advice(self, metric: str, score: float, value: float) -> list:
        """基于指标得分生成建议"""
        advice = []
        
        # 根据得分区间匹配建议模板
        if score < 30:
            advice.extend(self.advice_library[metric]['critical'])
        elif score < 50:
            advice.extend(self.advice_library[metric]['poor'])
        elif score < 70:
            advice.extend(self.advice_library[metric]['fair'])
        
        # 根据具体数值提供个性化建议
        advice.extend(self.get_contextual_advice(metric, value))
        
        return advice
    
    def prioritize_actions(self, all_issues: list) -> dict:
        """按优先级排序行动计划"""
        # 按影响程度和紧急度排序
        sorted_issues = sorted(
            all_issues, 
            key=lambda x: (x['impact'], x['urgency']), 
            reverse=True
        )
        
        return {
            'P0': [i for i in sorted_issues if i['urgency'] >= 4],
            'P1': [i for i in sorted_issues if 2 <= i['urgency'] < 4],
            'P2': [i for i in sorted_issues if i['urgency'] < 2]
        }
```

### 5.7 输出渲染实现

```python
# output/terminal.py

class TerminalRenderer:
    COLORS = {
        'S': '\033[92m',   # 深绿
        'A': '\033[32m',   # 绿色
        'B': '\033[93m',   # 黄色
        'C': '\033[33m',   # 橙色
        'D': '\033[91m',   # 红色
        'reset': '\033[0m'
    }
    
    def render(self, report: DiagnosisReport) -> str:
        lines = [
            self.header(report),
            self.score_card(report),
            self.dimension_breakdown(report),
            self.issues_section(report),
            self.suggestions_section(report),
            self.action_plan(report)
        ]
        return '\n'.join(lines)
    
    def score_bar(self, score: float, width: int = 20) -> str:
        """渲染评分进度条"""
        filled = int(score / 100 * width)
        bar = '█' * filled + '░' * (width - filled)
        return f"{bar} {score:.0f}分"
```

### 5.8 依赖清单

```
# requirements.txt
# 核心依赖（必选）
click>=8.0          # 命令行接口
pydantic>=2.0       # 数据验证
jinja2>=3.0         # HTML模板引擎

# 可选依赖
rich>=13.0          # 增强终端输出（推荐）
markdown>=3.0       # Markdown处理
```

### 5.9 使用示例

```bash
# 安装
pip install -r requirements.txt

# 快速诊断（命令行）
python main.py \
  --config examples/shop_sample.json \
  --output terminal

# 生成分类报告
python main.py \
  --config examples/shop_sample.json \
  --output markdown --save report.md

# 交互式输入
python main.py --interactive --output html --save report.html
```

---

## 6. 后续迭代规划

### 6.1 短期迭代（1-2周）
- [ ] 完成核心诊断引擎开发
- [ ] 实现基础CLI界面
- [ ] 支持Markdown/HTML输出

### 6.2 中期迭代（1-2月）
- [ ] 增加历史数据对比功能
- [ ] 支持批量店铺诊断
- [ ] 接入真实外卖平台API（如开放）

### 6.3 长期规划（3-6月）
- [ ] Web可视化界面
- [ ] AI智能建议（接入LLM）
- [ ] 竞品对比分析
- [ ] 行业基准数据库

---

## 7. 附录

### 7.1 品类基准数据参考

**快餐简餐类**
- 平均客单价：25-35元
- 平均转化率：2.5%-4%
- 平均评分：4.6-4.8

**饮品类**
- 平均客单价：18-28元
- 平均转化率：2.0%-3.5%
- 平均评分：4.7-4.9

**烧烤类**
- 平均客单价：60-90元
- 平均转化率：1.5%-2.5%
- 平均评分：4.5-4.7

### 7.2 名词解释

| 术语 | 解释 |
|-----|------|
| UV | Unique Visitor，独立访客数 |
| AOV | Average Order Value，客单价 |
| ROI | Return on Investment，投资回报率 |
| P0/P1/P2 | 优先级划分，P0为最高优先级 |

---

**文档结束**

*本PRD为v1.0版本，后续根据开发反馈和业务需求持续迭代优化。*
