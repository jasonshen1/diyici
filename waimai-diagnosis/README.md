# 🚀 外卖店铺智能诊断模型

> **基于PRD v1.0规范的完整实现** | 四脑协作开发成果

---

## 📋 项目概述

这是一个专业的外卖店铺智能诊断系统，输入店铺关键运营指标，自动生成全面、专业、可执行的诊断报告。

### ✨ 核心特性

- **25项核心指标** - 覆盖流量/转化/服务/效率/收益5大维度
- **智能评分算法** - 分段线性评分，0-100分标准化
- **短板降级机制** - 任一维度低于50分自动降级
- **可执行建议** - 按P1/P2/P3优先级分短期/中期/长期行动计划

---

## 📊 诊断指标体系

### 5大维度 · 25项指标

| 维度 | 权重 | 指标数量 | 核心指标 |
|------|------|----------|----------|
| **流量指标** | 25% | 5项 | 日均曝光量、进店转化率、搜索排名 |
| **转化指标** | 30% | 5项 | 下单转化率、加购率、人均订单数 |
| **服务指标** | 20% | 5项 | 店铺评分、差评率、投诉率 |
| **效率指标** | 15% | 5项 | 出餐时长、准时率、退单率 |
| **收益指标** | 10% | 5项 | 客单价、毛利率、复购率 |

### 完整指标列表

```
流量指标组 (25%)
├── 日均曝光量 (EXP_DAILY)
├── 进店转化率 (CTR_VISIT)
├── 搜索排名 (SEARCH_RANK)
├── 推广点击率 (AD_CTR)
└── 新客占比 (NEW_USER_RATE)

转化指标组 (30%)
├── 下单转化率 (CVR_ORDER)
├── 加购转化率 (CVR_CART)
├── 人均订单数 (ORDER_PER_USER)
├── 下单成功率 (ORDER_SUCCESS)
└── 收藏转化率 (CVR_FAVORITE)

服务指标组 (20%)
├── 店铺综合评分 (RATING_OVERALL)
├── 差评率 (BAD_RATE)
├── 投诉率 (COMPLAINT_RATE)
├── 评分回复率 (REPLY_RATE)
└── 评分回复时长 (REPLY_TIME)

效率指标组 (15%)
├── 平均出餐时长 (COOK_TIME)
├── 准时送达率 (ON_TIME_RATE)
├── 退单率 (CANCEL_RATE)
├── 异常订单率 (EXCEPTION_RATE)
└── 产能利用率 (CAPACITY_USE)

收益指标组 (10%)
├── 客单价 (AOV)
├── 毛利率 (GROSS_MARGIN)
├── 7日复购率 (REPEAT_7D)
├── 30日复购率 (REPEAT_30D)
└── 营销ROI (ROI)
```

---

## 🎯 评分体系

### 5级诊断等级

| 等级 | 分数 | 描述 | 颜色 | 优先级 |
|------|------|------|------|--------|
| 🏆 **S级** | 90-100 | 卓越，行业标杆 | 🟢 | P4 |
| 🥇 **A级** | 80-89 | 优秀，运营良好 | 🟢 | P4 |
| 🥈 **B级** | 70-79 | 良好，有提升空间 | 🟡 | P3 |
| 🥉 **C级** | 60-69 | 需改进，重点关注 | 🟠 | P2 |
| ⚠️ **D级** | <60 | 危险，立即整改 | 🔴 | P1 |

### 短板降级规则

- **任一维度得分 < 50分** → 最高等级为C
- **任一维度得分 < 30分** → 直接判定为D

---

## 🚀 快速开始

### 方式1：运行演示（推荐首次使用）

```bash
cd waimai-diagnosis
python3 waimai_diagnosis_pro.py --demo
```

### 方式2：诊断自己的店铺

1. **准备数据文件**（复制 example_prd.json 并修改）

```json
{
  "shop_name": "你的店铺名",
  "category": "经营品类",
  "district": "所在区域",
  "period": "2024年2月",
  "metrics": {
    "EXP_DAILY": 4200,
    "CTR_VISIT": 9.5,
    ...
  }
}
```

2. **运行诊断**

```bash
python3 waimai_diagnosis_pro.py --input my_shop.json --output report.txt
```

---

## 📁 文件结构

```
waimai-diagnosis/
├── 📄 README.md                          # 项目说明
├── 📘 QUICKSTART.md                     # 快速使用指南
├── 🔧 waimai_diagnosis.py               # 基础版诊断模型 (12项指标)
├── 🚀 waimai_diagnosis_pro.py           # PRD完整版 (25项指标) ⭐推荐
├── 📊 example_data.json                 # 基础版示例数据
├── 📊 example_prd.json                  # PRD版示例数据
├── 📝 外卖店铺诊断模型_PRD_v1.0.md      # PRD详细文档
├── ⚡ run.sh                             # 交互式运行脚本
└── 📋 diagnosis_report_*.txt            # 生成的诊断报告
```

---

## 📊 诊断报告内容

生成的报告包含以下模块：

### 1. 诊断概览
- 店铺基本信息
- 综合评分与等级
- 降级原因（如适用）

### 2. 各维度表现
- 5大维度详细得分
- 与行业基准对比
- 维度等级评定

### 3. 核心优势
- TOP 5 表现优秀指标
- 优势分析和保持建议

### 4. 问题诊断
- 问题指标列表（按严重程度排序）
- 问题影响分析
- 差距量化

### 5. 改进行动计划
- **立即行动 (P1/P2)** - 1周内执行
- **中期计划 (P2)** - 1-4周执行
- **长期规划 (P3)** - 1-3月执行

---

## 💡 在Python代码中使用

```python
from waimai_diagnosis_pro import DiagnosisEngine, ReportGenerator

# 准备数据
metrics = {
    "EXP_DAILY": 4200,
    "CTR_VISIT": 9.5,
    "CVR_ORDER": 18.0,
    ... # 其他22项指标
}

# 执行诊断
engine = DiagnosisEngine()
result = engine.diagnose(metrics)

# 查看结果
print(f"综合得分: {result['overall_score']} 分")
print(f"诊断等级: {result['grade']}级 ({result['grade_desc']})")

# 生成报告
shop_info = {
    "shop_name": "我的店铺",
    "category": "中式快餐",
    "district": "朝阳区",
    "period": "2024年2月"
}
generator = ReportGenerator(result, shop_info)
report = generator.generate_text_report()
print(report)
```

---

## 📈 示例诊断结果

### 川味小厨案例

```
综合评分: 72.71 分 (🟡 B级 - 良好)

各维度得分:
  流量指标: 81.01 分 (A级) ✅ 优秀
  转化指标: 69.03 分 (D级) 🟡 需整改
  服务指标: 67.6 分  (C级) 🟡 待改进
  效率指标: 67.87 分 (C级) 🟡 待改进
  收益指标: 80.47 分 (A级) ✅ 优秀

发现问题: 6 项
  - 评分回复时长: 差距 500%
  - 退单率: 差距 450%
  - 差评率: 差距 220%
  - 平均出餐时长: 差距 140%
```

---

## 🔧 技术特性

- **Python 3.8+** 兼容
- **分段线性评分算法** - 精确计算每个指标得分
- **正向/负向指标支持** - 自动识别指标类型
- **完全可配置** - 所有指标阈值可自定义
- **零依赖** - 纯Python标准库实现

---

## 📚 相关文档

- [QUICKSTART.md](QUICKSTART.md) - 详细使用指南
- [外卖店铺诊断模型_PRD_v1.0.md](外卖店铺诊断模型_PRD_v1.0.md) - 完整产品需求文档

---

## 📝 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0.0 | 2026-02-23 | 初始版本，完整PRD实现，25项指标 |

---

## 🤝 贡献

欢迎反馈问题和改进建议！

---

**Made with ❤️ by 四脑协作系统**  
**PM → DEV ↔ REVIEWER → MEMO**
