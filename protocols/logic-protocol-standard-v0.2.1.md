# 逻辑协议工程规范 v0.2.1
# Logic Protocol Engineering Standard (Full Version)
# 发布者：逻辑资产交易所 (diyici.ai)

---

## 0. 核心愿景

本规范旨在定义"知识液态化"后的标准交付格式。在指令链时代，协议是可被调度、组合、计量且具备主权的确定性逻辑单元。

---

## 1. 五环模型架构 (Five-Ring Architecture v2)

每一份逻辑协议必须声明其**五环权重向量**，定义逻辑重心：

### 1.1 意志定义层 (Will)
- **权重范围**: 0-1
- **定义**: 声明放大了何种人类价值判断
- **示例**: 风险敏感(0.8)、成本优先(0.6)、速度至上(0.9)

### 1.2 结构抽象层 (Structure)
- **权重范围**: 0-1
- **定义**: 定义 Agent 矩阵及其神经协作拓扑
- **要素**: Agent数量、连接方式、信息流

### 1.3 指令架构层 (Instruction)
- **权重范围**: 0-1
- **定义**: 封装好的 Prompt 链条与决策逻辑
- **形式**: Prompt模板、决策树、条件分支

### 1.4 执行自动化层 (Action)
- **权重范围**: 0-1
- **定义**: 挂载的外部 Skills、API 及自动化脚本
- **接口**: REST API、WebSocket、本地脚本

### 1.5 反馈进化层 (Evolution)
- **权重范围**: 0-1
- **定义**: 定义 Memory 存储格式与协议自调阈值
- **触发**: 成功率<80%、耗时翻倍、用户投诉>3次

**五环权重向量示例**:
```json
{
  "will": 0.7,
  "structure": 0.8,
  "instruction": 0.9,
  "action": 0.6,
  "evolution": 0.5
}
```

---

## 2. 逻辑性能与效能指标 (Metrics)

协议必须量化其"逻辑带宽"与"密度"，作为交易所定价基准：

### 2.1 逻辑密度 (LDI - Logic Density Index)
- **公式**: `LDI = 决策节点数 / 提示词长度`
- **意义**: LDI 越高，逻辑越精炼
- **基准**: 
  - LDI < 0.1: 低密度（提示词冗长）
  - LDI 0.1-0.3: 中等密度
  - LDI > 0.3: 高密度（精炼高效）

### 2.2 逻辑带宽 (Bandwidth)
包含两个子指标：

**A. Parallel Capacity（并行决策数）**
- 单协议可同时处理的决策流数量
- 示例: 3（可同时处理3个独立任务）

**B. Decision Branching（逻辑分叉数）**
- 决策树中的分支数量
- 示例: 5（5个主要决策分支）

### 2.3 进化能力 (Evolutionary Capacity)
- **定义**: 协议基于反馈自我修正参数的潜力
- **度量**: 
  - 可调参数数量
  - 反馈学习算法复杂度
  - 历史优化迭代次数

**性能指标示例**:
```json
{
  "ldi": 0.25,
  "bandwidth": {
    "parallel_capacity": 3,
    "decision_branching": 5
  },
  "evolutionary_capacity": 0.7
}
```

---

## 3. SOP-EF 执行模型

最小执行单元必须遵循**五步闭环流程**：

### 3.1 S - Sensing（输入感知）
- 输入格式定义
- 合法性校验规则
- 异常输入处理

### 3.2 O - Operation（操作定义）
- Agent 角色定义
- 职能分配矩阵
- 协作拓扑结构

### 3.3 P - Processing（核心处理）
- 推理路径设计
- 决策逻辑实现
- 条件分支处理

### 3.4 E - Error Handling（错误处理）⭐
**强制性的降级方案**：

| 级别 | 降级策略 | 触发条件 |
|-----|---------|---------|
| **L1** | 性能降级 | 主模型失败，切换备用模型 |
| **L2** | 范围缩小 | 部分功能不可用，核心功能保持 |
| **L3** | 人工接管 | 全部自动化失败，人工介入 |

### 3.5 F - Feedback Injection（反馈注入）⭐
- 记忆写入模式
- 参数自优化策略
- 版本迭代触发

---

## 4. 逻辑主权与保护 (Sovereignty & Protection)

为了防止暴力拆解，协议引入主权追踪机制：

### 4.1 链上追踪
- **哈希指纹**: 协议内容的唯一标识
- **授权证明**: License NFT，记录所有权和授权范围
- **交易记录**: 每次调用和授权上链存证

### 4.2 逻辑水印
- **动态逻辑盐值**: 运行时注入的随机因子，不影响结果但可追踪来源
- **逻辑陷阱**: 在未经授权环境执行时自动降级效能
- **指纹植入**: 输出中嵌入不可见标记

### 4.3 主权声明
```json
{
  "author": "作者信息",
  "royalty_rate": 0.15,
  "fork_permission": true,
  "fork_conditions": "需保留原作者署名",
  "license_type": "MIT/Commercial/Custom"
}
```

---

## 5. 标准接口与组合 (LPI)

协议必须兼容 **LPI (Logic Protocol Interface)** 标准：

### 5.1 无状态设计
- 尽量保持协议独立
- 减少上下游硬耦合
- 依赖声明化，不隐式依赖

### 5.2 组合性 (Composability)
通过声明 `dependencies`，实现 T1-T4 级协议的嵌套调用：

```yaml
dependencies:
  - protocol_id: "base-auth-v1.0"
    level: "T2"
    interface: "auth_token"
  - protocol_id: "data-fetch-v2.1"
    level: "T3"
    interface: "raw_data"
```

**协议等级 (Tiers)**:
- **T1**: 基础原子协议（如：字符串处理）
- **T2**: 功能协议（如：用户认证）
- **T3**: 业务协议（如：数据分析）
- **T4**: 调度协议（如：工作流编排）
- **T5**: 治理协议（如：协议管理系统）

---

## 6. 资产封装规范

上架 diyici.ai 的标准资产包 (**.lpa - Logic Protocol Asset**) 必须包含：

### 6.1 protocol.yaml
核心逻辑配置

```yaml
protocol:
  id: "human-ai-system-v1.0"
  name: "五层架构人机系统"
  version: "1.0.0"
  
  # 五环权重
  five_rings:
    will: 0.7
    structure: 0.8
    instruction: 0.9
    action: 0.6
    evolution: 0.5
  
  # 性能指标
  metrics:
    ldi: 0.25
    bandwidth:
      parallel_capacity: 3
      decision_branching: 5
    evolutionary_capacity: 0.7
  
  # 执行模型
  execution:
    model: "SOP-EF"
    error_handling:
      l1: "model_fallback"
      l2: "scope_reduction"
      l3: "human_escalation"
  
  # 接口定义
  interfaces:
    input:
      - name: "user_intent"
        type: "string"
        required: true
    output:
      - name: "execution_result"
        type: "json"
  
  # 依赖声明
  dependencies:
    - id: "openclaw-gateway"
      version: ">=2026.2.0"
      level: "T3"
```

### 6.2 manifest.json
声明逻辑密度、带宽、五环权重等元数据

```json
{
  "protocol_id": "human-ai-system-v1.0",
  "name": "五层架构人机系统",
  "version": "1.0.0",
  "created_at": "2026-02-14",
  
  "metrics": {
    "ldi": 0.25,
    "bandwidth": {
      "parallel_capacity": 3,
      "decision_branching": 5
    },
    "evolutionary_capacity": 0.7
  },
  
  "five_rings": {
    "will": 0.7,
    "structure": 0.8,
    "instruction": 0.9,
    "action": 0.6,
    "evolution": 0.5
  },
  
  "tier": "T4",
  "interfaces": ["LPI-v1.0"],
  "test_coverage": 0.85
}
```

### 6.3 sovereignty.json
包含主权签名、保护机制及版税规则

```json
{
  "author": {
    "name": "OpenClaw",
    "contact": "contact@openclaw.ai",
    "wallet": "0x..."
  },
  
  "ownership": {
    "hash": "sha256:abc123...",
    "nft_contract": "0x...",
    "token_id": "123"
  },
  
  "protection": {
    "watermark": true,
    "salt_injection": true,
    "logic_trap": true
  },
  
  "economics": {
    "royalty_rate": 0.15,
    "price_model": "usage_based",
    "fork_fee": 0.05
  },
  
  "license": {
    "type": "Commercial",
    "permissions": ["use", "modify", "fork"],
    "restrictions": ["resale_without_permission"]
  }
}
```

### 6.4 logic_flow.svg
逻辑路径的可视化拓扑图

### 6.5 test_suite/
包含至少 **5 个边界测试用例**，确保系统鲁棒性

```
test_suite/
├── test_01_normal_input.yml
├── test_02_boundary_condition.yml
├── test_03_error_recovery.yml
├── test_04_performance_stress.yml
└── test_05_security_injection.yml
```

---

## 7. 定价模型

**协议价值 = 逻辑密度 (LDI) × 带宽系数 × 复用指数 × 进化能力**

### 7.1 计算公式

```
Base_Price = 100  # 基础价格(USD)

Value = Base_Price 
        × (LDI × 4)                    # 密度系数
        × (1 + Parallel_Capacity × 0.2) # 并行系数
        × (1 + Decision_Branching × 0.1) # 分叉系数
        × (1 + Evolutionary_Capacity)    # 进化系数
        × Tier_Multiplier                # 等级系数

Tier_Multiplier:
- T1: 0.5
- T2: 0.8
- T3: 1.0
- T4: 1.5
- T5: 2.0
```

### 7.2 定价示例

**示例协议**: 五层架构人机系统 (T4)
- LDI: 0.25
- Parallel Capacity: 3
- Decision Branching: 5
- Evolutionary Capacity: 0.7
- Tier: T4 (1.5x)

```
Value = 100 
        × (0.25 × 4) = 100
        × (1 + 3 × 0.2) = 160
        × (1 + 5 × 0.1) = 240
        × (1 + 0.7) = 408
        × 1.5 = 612 USD
```

**建议零售价**: $599 (约 ¥4,300)

### 7.3 定价策略建议

diyici.ai 鼓励：
- ✅ **高密度** (LDI > 0.2)
- ✅ **高进化能力** (Evolutionary Capacity > 0.6)
- ✅ **T4/T5 级** 调度与治理协议

 discourage：
- ❌ 低密度、低复用的原子协议（市场饱和）
- ❌ 无进化能力的静态协议
- ❌ 过度耦合、难以组合的协议

---

## 附录：版本历史

- **v0.2.1** (2026-02-14): 当前版本，完善主权保护和定价模型
- **v0.2.0** (2026-02-01): 引入LPI标准接口
- **v0.1.0** (2026-01-15): 初始版本，定义五环模型

---

*© 2026 逻辑资产交易所 (diyici.ai)*
*本规范采用 CC BY-SA 4.0 许可证*
