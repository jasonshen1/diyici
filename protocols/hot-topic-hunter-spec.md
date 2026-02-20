# Protocol: 热点猎手 Hot Topic Hunter
# 版本: v1.0
# 适用平台: OpenClaw
# 定价建议: ¥99/月 或 ¥299/年

## 🎯 Protocol 定位
**一句话描述**: 每天早上8点自动推送「今日可追热点 + 3个内容角度 + 初稿框架」

**解决痛点**:
- 不用每天早上刷1小时找选题
- 不用担心错过突发热点
- 不用愁没内容角度

## 🔧 技术架构 (五环模型)

### 1. 意志定义层 (Will)
**核心价值判断**: 
- 速度优先 > 深度优先 (抢时效)
- 受众广泛 > 垂直精准 (要流量)
- 可执行 > 完美 (能当天发)

### 2. 结构抽象层 (Structure)
**Agent 矩阵**:
- Scout Agent: 监控各平台热榜
- Analyst Agent: 分析热点价值
- Writer Agent: 生成内容角度
- Reviewer Agent: 评估可行性

### 3. 指令架构层 (Instruction)
**核心 Prompt 链**:

```
【Step 1: 热点抓取】
工具: web_search, web_fetch
输入: 微博热搜/知乎热榜/小红书趋势
输出: TOP 20 热点列表

【Step 2: 价值评估】
Prompt: "评估以下热点的自媒体价值，从传播度、争议性、时效性打分(1-10):"
输出: 排序后的热点列表

【Step 3: 角度生成】
Prompt: "为TOP 3热点生成3个不同内容角度(情绪共鸣/实用干货/反常识观点):"
输出: 9个内容角度

【Step 4: 初稿框架】
Prompt: "为每个角度写小红书/公众号开头50字 + 大纲:"
输出: 可直接用的框架
```

### 4. 执行自动化层 (Action)
**自动化脚本**: hot-topic-hunter.sh
**触发方式**: Cron 每天 08:00
**输出交付**: 
- Markdown 报告 → 飞书文档
- 微信提醒 → 二维码推送
- 邮件简报 → SMTP 发送

### 5. 反馈进化层 (Evolution)
**用户反馈收集**:
- 哪个选题最终发了？
- 数据表现如何？
- 用户偏好调整 (更喜欢娱乐/科技/情感？)

**Protocol 自优化**:
- 根据点击率调整热点源权重
- 根据用户反馈优化角度生成策略

## 📦 交付物 (.lpa 包结构)

```
hot-topic-hunter-v1.lpa/
├── protocol.yaml          # 协议配置
├── manifest.json          # 元数据
├── prompts/
│   ├── scout_prompt.md
│   ├── analyst_prompt.md
│   ├── writer_prompt.md
│   └── reviewer_prompt.md
├── scripts/
│   ├── fetch_hot_topics.py
│   ├── analyze_trends.py
│   └── generate_angles.py
├── workflows/
│   └── daily_pipeline.yaml
├── templates/
│   ├── xiaohongshu_template.md
│   ├── wechat_template.md
│   └── douyin_script_template.md
└── tests/
    └── test_cases.json
```

## 💰 定价策略

**基础版 (免费试用)**: 
- 每天3个热点
- 纯文字报告
- 延迟1小时

**专业版 (¥99/月)**:
- 每天10个热点
- 含初稿框架
- 实时推送
- 支持自定义关键词监控

**团队版 (¥299/月)**:
- 无限热点
- 多平台分发
- 数据追踪面板
- API 接口

## 🚀 冷启动策略

1. **第1周**: 自己用，每天发报告到朋友圈/即刻
2. **第2周**: 找5个自媒体朋友内测，收集反馈
3. **第3周**: 在即刻/小红书发「AI帮我找选题」的内容引流
4. **第4周**: 开放付费，首月半价

## ⚠️ 风险提示

1. **数据依赖**: 平台反爬策略变化
2. **时效性**: 热点窗口期很短(通常24小时)
3. **同质化**: 用的人多了，角度会趋同

## 📝 下一步行动

- [ ] 写 fetch_hot_topics.py 爬虫
- [ ] 调优 Analyst Prompt
- [ ] 设计飞书文档模板
- [ ] 找5个种子用户
