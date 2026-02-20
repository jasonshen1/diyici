# 自定义工作流示例

在 `extended_roles.py` 的 `WORKFLOWS` 字典中添加你的工作流。

---

## 示例 1：AI 模型训练流程

```python
"ml_pipeline": {
    "name": "机器学习模型训练流程",
    "description": "从数据处理到模型部署的完整ML流程",
    "roles": ["PM", "ARCHITECT", "DEV", "TESTER", "OPTIMIZER", "DEVOPS", "MEMO"],
    "sequence": [
        "PM",           # 1. 定义模型目标和数据需求
        "ARCHITECT",    # 2. 设计模型架构和训练流程
        "DEV",          # 3. 实现数据处理和模型代码
        ["TESTER", "OPTIMIZER"],  # 4. 并行：测试 + 性能优化
        "DEVOPS",       # 5. 部署和监控方案
        "MEMO"          # 6. 项目总结
    ],
    "loops": {
        "DEV-TESTER": {"max_retries": 3, "condition": "TESTER.verdict == PASS"},
        "DEV-OPTIMIZER": {"max_retries": 2, "condition": "improvement > 10%"}
    }
}
```

**使用方式**：
```bash
python3 quad_brain_extended.py "训练一个图像分类模型" --workflow ml_pipeline --discord
```

---

## 示例 2：内容创作流程

```python
"content_creation": {
    "name": "内容创作工作室",
    "description": "文章/视频/播客的内容创作流程",
    "roles": ["PM", "UX", "WRITER", "REVIEWER", "OPTIMIZER", "MEMO"],
    "sequence": [
        "PM",           # 1. 选题和受众分析
        "UX",           # 2. 内容结构和体验设计
        "WRITER",       # 3. 内容创作
        "REVIEWER",     # 4. 内容审查（事实核查、风格检查）
        "OPTIMIZER",    # 5. SEO优化和标题优化
        "MEMO"          # 6. 发布清单和总结
    ],
    "loops": {
        "WRITER-REVIEWER": {"max_retries": 2, "condition": "REVIEWER.verdict == PASS"}
    }
}
```

**使用方式**：
```bash
python3 quad_brain_extended.py "写一篇关于AI的科普文章" --workflow content_creation --discord
```

---

## 示例 3：安全应急响应

```python
"security_incident": {
    "name": "安全应急响应",
    "description": "快速响应安全事件，修复漏洞",
    "roles": ["PM", "SECURITY", "ARCHITECT", "DEV", "TESTER", "DEVOPS", "MEMO"],
    "sequence": [
        "PM",           # 1. 事件定级和影响评估
        "SECURITY",     # 2. 漏洞分析和攻击路径
        "ARCHITECT",    # 3. 修复方案设计
        "DEV",          # 4. 紧急修复
        ["SECURITY", "TESTER"],  # 5. 并行：安全验证 + 功能测试
        "DEVOPS",       # 6. 紧急部署
        "MEMO"          # 7. 事后复盘
    ],
    "loops": {
        "DEV-SECURITY": {"max_retries": 5, "condition": "SECURITY.verdict == SECURE"},
        "DEV-TESTER": {"max_retries": 3, "condition": "TESTER.verdict == PASS"}
    }
}
```

**使用方式**：
```bash
python3 quad_brain_extended.py "修复SQL注入漏洞" --workflow security_incident --discord
```

---

## 示例 4：数据迁移项目

```python
"data_migration": {
    "name": "数据迁移专项",
    "description": "数据库迁移、ETL流程、数据校验",
    "roles": ["PM", "ARCHITECT", "DEV", "TESTER", "OPTIMIZER", "DEVOPS", "MEMO"],
    "sequence": [
        "PM",           # 1. 迁移范围和数据映射
        "ARCHITECT",    # 2. 迁移架构（双写、影子验证等）
        "DEV",          # 3. 迁移脚本开发
        "TESTER",       # 4. 数据一致性测试
        "OPTIMIZER",    # 5. 性能优化（批量处理、并行化）
        "DEVOPS",       # 6. 迁移执行和监控
        "MEMO"          # 7. 迁移报告
    ],
    "loops": {
        "DEV-TESTER": {"max_retries": 3, "condition": "data_integrity == 100%"}
    }
}
```

---

## 示例 5：开源项目发布

```python
"open_source_release": {
    "name": "开源项目发布流程",
    "description": "准备和发布开源项目的完整流程",
    "roles": ["PM", "ARCHITECT", "UX", "DEV", "SECURITY", "WRITER", "DEVOPS", "MEMO"],
    "sequence": [
        "PM",           # 1. 开源协议和贡献者协议
        "ARCHITECT",    # 2. 模块化设计，便于贡献
        "UX",           # 3. README和演示设计
        "DEV",          # 4. 核心代码和示例
        "SECURITY",     # 5. 安全扫描和依赖审计
        "WRITER",       # 6. 完整文档（贡献指南、API文档）
        "DEVOPS",       # 7. CI/CD、发布自动化
        "MEMO"          # 8. 发布清单
    ],
    "loops": {
        "DEV-SECURITY": {"max_retries": 3, "condition": "SECURITY.verdict == SECURE"}
    }
}
```

---

## 工作流配置说明

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 工作流显示名称 |
| `description` | string | 工作流描述 |
| `roles` | list | 此工作流使用的所有角色 |
| `sequence` | list | 执行顺序，支持嵌套列表表示并行 |
| `loops` | dict | 循环配置，键格式 `"A-B"` |

### 循环配置

```python
"loops": {
    "DEV-REVIEWER": {
        "max_retries": 3,           # 最大重试次数
        "condition": "REVIEWER.verdict == PASS"  # 通过条件
    }
}
```

### 并行执行

```python
"sequence": [
    "PM",
    ["REVIEWER", "TESTER", "SECURITY"],  # 这三个角色并行执行
    "MEMO"
]
```

---

## 测试你的工作流

添加工作流后，测试是否正常工作：

```bash
# 查看是否识别新工作流
python3 quad_brain_extended.py --list-workflows

# 测试运行
python3 quad_brain_extended.py "测试任务" --workflow your_workflow_id --discord
```

---

## 分享你的工作流

如果你创建了一个好用的工作流，可以：

1. 保存为单独的文件：`workflows/my_workflow.py`
2. 分享给团队
3. 提交到社区

示例文件结构：
```
workspace/
├── workflows/
│   ├── ml_pipeline.py
│   ├── content_creation.py
│   └── security_incident.py
├── extended_roles.py
└── quad_brain_extended.py
```

---

有问题或想分享你的工作流？随时告诉我！
