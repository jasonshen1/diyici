# 🔥 热点猎手 Hot Topic Hunter

**全球首个基于 OpenClaw 的自媒体运营 Protocol**

每天早上8点自动推送「今日可追热点 + 3个内容角度 + 初稿框架」

---

## 📦 交付物清单

### 1. Prompts (3个)
| 文件 | 角色 | 功能 |
|------|------|------|
| `prompts/scout_prompt.md` | Scout Agent | 抓取各平台热榜 |
| `prompts/analyst_prompt.md` | Analyst Agent | 评估热点价值 |
| `prompts/writer_prompt.md` | Writer Agent | 生成内容角度 |

### 2. Scripts (4个)
| 文件 | 功能 | 依赖 |
|------|------|------|
| `scripts/fetch_hot_topics.py` | 抓取微博/知乎/B站热榜 | requests, beautifulsoup4 |
| `scripts/analyze_trends.py` | 分析热点价值 | 无 |
| `scripts/generate_angles.py` | 生成内容方案 | 无 |
| `hot_topic_hunter.py` | 主控脚本 | 以上全部 |

### 3. Templates (2个)
| 文件 | 用途 | 平台 |
|------|------|------|
| `templates/feishu_template.md` | 飞书文档格式 | 飞书 |
| `templates/email_template.html` | 邮件格式 | 邮件 |

### 4. Spec (1个)
| 文件 | 内容 |
|------|------|
| `hot-topic-hunter-spec.md` | 完整Protocol规格书 |

---

## 🚀 快速开始

### 安装依赖
```bash
cd /root/.openclaw/workspace/protocols
pip install requests beautifulsoup4
```

### 运行Protocol
```bash
# 完整运行
python hot_topic_hunter.py

# 指定输出目录
python hot_topic_hunter.py --output ./my_reports

# 推送到飞书（需配置webhook）
python hot_topic_hunter.py --push

# 发送邮件
python hot_topic_hunter.py --email your@email.com
```

### 单独运行步骤
```bash
# 只抓取热点
python scripts/fetch_hot_topics.py

# 只分析（需要先抓取）
python scripts/analyze_trends.py

# 只生成内容（需要先分析）
python scripts/generate_angles.py
```

---

## 📊 输出示例

运行后会生成3个文件：

```
reports/
├── raw_topics_20260215.json      # 原始热点数据
├── analysis_20260215.json        # 分析报告
├── daily_report_20260215.md      # Markdown报告（飞书用）
└── latest_report.md              # 最新报告链接
```

### Markdown报告预览

```markdown
# 📊 2026年02月15日 热点追踪报告

> 生成时间：08:00  
> 今日精选 3 个热点，每个提供 3 个内容角度

---

## 🔥 热点 1: 某明星宣布结婚

**基本信息**
- 来源平台：微博
- 内容分类：娱乐
- 窗口期：12小时
- 推荐指数：⭐⭐⭐⭐⭐

### 📐 内容角度

#### 角度A: 情绪共鸣 💭

**标题**：💭 看到XX结婚，我突然不焦虑了

**开头钩子**：
> 35岁才遇到对的人，原来晚婚也没那么可怕...

**内容大纲**：
1. 她的婚恋观
2. 晚婚的好处
3. 给同龄人的建议

**金句建议**：
- 幸福没有标准答案
- 每个人都有自己的节奏

**适配平台**：小红书 / 抖音  
**创作难度**：⭐⭐ 简单  
**预估耗时**：1小时

[角度B和C...]
```

---

## 💰 商业化方案

### 定价策略

| 版本 | 价格 | 功能 |
|------|------|------|
| 基础版 | 免费 | 每天3个热点，纯文字，延迟1小时 |
| 专业版 | ¥99/月 | 每天10个热点，含初稿，实时推送 |
| 团队版 | ¥299/月 | 无限热点，多平台，数据面板 |

### 收入测算（假设）

- 100个付费用户 × ¥99/月 = **¥9,900/月**
- 50个团队用户 × ¥299/月 = **¥14,950/月**
- **合计：约 ¥25,000/月**

---

## 🎯 冷启动策略

### Week 1: 内测
- [ ] 找5个自媒体朋友试用
- [ ] 每天手动跑一遍流程
- [ ] 收集反馈，优化Prompt

### Week 2: 内容引流
- [ ] 在小红书发「AI帮我找选题」
- [ ] 在即刻分享每日热点洞察
- [ ] 写一篇「如何用AI做自媒体」教程

### Week 3: 产品化
- [ ] 上线付费版本
- [ ] 首月半价优惠
- [ ] 设置推荐返利

### Week 4: 迭代
- [ ] 根据用户反馈优化
- [ ] 增加更多数据源
- [ ] 开发API接口

---

## 🔧 技术架构

### 五环模型实现

```
1. 意志定义层 (Will)
   ↓ 配置文件：protocol.yaml
   
2. 结构抽象层 (Structure)
   ↓ Scout/Analyst/Writer 3个Agent
   
3. 指令架构层 (Instruction)
   ↓ 3个System Prompt
   
4. 执行自动化层 (Action)
   ↓ 4个Python脚本
   
5. 反馈进化层 (Evolution)
   ↓ 用户反馈 → Prompt优化
```

---

## 📝 下一步行动

- [ ] 测试抓取脚本（检查反爬）
- [ ] 调优3个Prompt（找5个朋友试用）
- [ ] 设计飞书机器人推送
- [ ] 写落地页文案
- [ ] 找种子用户

---

## 📞 联系方式

**Protocol作者**: Diyici.ai团队  
**版本**: v1.0  
**更新日期**: 2026-02-15

---

*这是全球首个基于 OpenClaw 的完整自媒体 Protocol，可复制、可修改、可商业化。*
