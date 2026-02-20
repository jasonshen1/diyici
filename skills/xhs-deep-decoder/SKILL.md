# OpenClaw Skill: XHS-Deep-Decoder
# Version: 5.0.0 (Singularity Edition)
# Mode: Smart_Switch (Auto v4/v5)
# Date: 2026-02-17
# Author: Diyici.ai

metadata:
  name: "xhs-deep-decoder"
  version: "5.0.0"
  mode: "Smart_Switch"
  type: "logic_protocol_asset"
  author: "Diyici.ai"
  description: "智能版本切换 - 图文用v4，视频用v5"

# [智能切换规则 - Smart Switch Logic]
switch_logic:
  default_version: "v4.0.0"
  
  auto_detect:
    # 触发 v5.0 (视频盲视模式) 的条件
    v5_triggers:
      - condition: "正文长度 > 300字"
        reason: "像口播稿"
      - condition: "正文包含口语化停顿词（嗯/啊/那个）"
        reason: "口播特征"
      - condition: "封面描述包含'视频'/'播放'/'Live'"
        reason: "动态内容"
      - condition: "标签包含#视频 / #vlog"
        reason: "视频类型"
      - condition: "用户提供了热评数据"
        reason: "可进行侧信道分析"
        
    # 触发 v4.0 (标准分析模式) 的条件  
    v4_triggers:
      - condition: "正文长度 < 200字"
        reason: "图文短内容"
      - condition: "封面为静态精修图"
        reason: "图文笔记"
      - condition: "无热评数据"
        reason: "标准分析足够"
      - condition: "标签以#图文 / #笔记为主"
        reason: "图文类型"
        
  # 切换提示
  switch_notification: true
  notification_text: "检测到[内容类型]，自动切换至[v版本]分析模式"

# [版本能力对比]
version_capabilities:
  v4_0_0:
    name: "Anti-AIGC Standard"
    best_for: "图文笔记、短内容、标准带货"
    features:
      - "Humanity Score 含人量检测"
      - "AI毒性扫描"
      - "动态视觉权重"
      - "私域导流分析"
      - "场景词 SEO 2.0"
    
  v5_0_0:
    name: "Singularity Video Blind"
    best_for: "视频笔记、长口播、脚本逆向"
    features:
      - "视频脚本盲视推导"
      - "热评侧信道分析"
      - "0-3秒完读率锁"
      - "高光时刻反推"
      - "分镜结构还原"
    
  auto_switch:
    description: "根据内容特征自动选择最优版本"
    logic: "If video-like -> v5, else -> v4"

# [触发配置]
triggers:
  # 自动触发
  auto_trigger:
    - pattern: "xhslink.com"
      action: "smart_analyze"
    - pattern: "xiaohongshu.com/discovery/item"
      action: "smart_analyze"
      
  # 手动触发（强制指定版本）
  manual_trigger:
    - command: "/decode"
      description: "智能选择版本分析"
      action: "smart_switch"
      
    - command: "/decode-v4"
      description: "强制使用 v4.0 标准分析"
      action: "force_v4"
      
    - command: "/decode-v5"
      description: "强制使用 v5.0 视频盲视分析"
      action: "force_v5"
      
    - command: "/decode-video"
      description: "强制视频模式（需热评）"
      action: "force_v5_video"

# [执行流程]
workflow:
  step_1_detect:
    name: "内容类型检测"
    logic:
      - analyze: "正文长度"
      - analyze: "口语化特征"
      - analyze: "封面类型"
      - analyze: "标签类型"
      - analyze: "是否有热评"
    
  step_2_switch:
    name: "版本切换决策"
    rules:
      - if: "正文 > 300字 AND 有口语词"
        then: "v5.0 视频盲视模式"
        notification: "检测到长口播内容，切换至v5视频盲视模式"
        
      - if: "提供了热评数据"
        then: "v5.0 侧信道分析模式"
        notification: "检测到热评数据，启用v5侧信道分析"
        
      - if: "正文 < 200字 AND 静态封面"
        then: "v4.0 标准图文模式"
        notification: "检测到图文内容，使用v4标准分析"
        
      - default: "v4.0 标准模式"
  
  step_3_execute:
    name: "执行分析"
    v4_pipeline:
      - "Sensing: AI毒性检测"
      - "Sensing: 视觉鲜活度"
      - "Processing: 情绪共振"
      - "Processing: SEO场景化"
      - "Processing: 私域钩子"
      - "Output: Humanity Score + 去AI诊断"
      
    v5_pipeline:
      - "Sensing: 格式判定（图文/视频）"
      - "Sensing: AIGC毒性"
      - "Processing: 完读率锁（3秒/30字）"
      - "Processing: 互动诱饵区分"
      - "Processing: 视频脚本盲视"
      - "Processing: 侧信道分析（如有热评）"
      - "Output: 推断分镜 + 高光时刻"

# [输出格式]
output_formats:
  v4_structure:
    header: "🧬 爆款基因解码报告 (v4.0 2026-Q1)"
    meta: "Humanity Score: {{score}}/100 | AIGC Risk: High/Low"
    sections:
      - "去AI化诊断"
      - "2026流量密码"
      - "像素级复刻"
      
  v5_structure:
    header: "🧬 爆款基因解码报告 (v5.0 Ultimate)"
    meta: "Humanity Score: {{score}}/100 | Format: {{type}} | Mode: {{mode}}"
    sections:
      - "去AI化诊断"
      - "流量与脚本还原"
      - "2026像素级复刻"
    special:
      - "视频分镜推断（如适用）"
      - "热评侧信道分析（如适用）"

# [版本文件位置]
protocol_files:
  v2_0_0: "/root/.openclaw/workspace/skills/xhs-deep-decoder/protocol-v2.0.yaml"
  v4_0_0: "/root/.openclaw/workspace/skills/xhs-deep-decoder/protocol-v4.0-future.yaml"
  v5_0_0: "/root/.openclaw/workspace/skills/xhs-deep-decoder/protocol-v5.0-singularity.yaml"
  current: "/root/.openclaw/workspace/skills/xhs-deep-decoder/SKILL.md"

# [数据归档]
archiving:
  enabled: true
  output_path: "/root/.openclaw/workspace/memory/xhs-analysis/"
  filename_format: "{{timestamp}}_{{title_hash}}_{{version}}.json"
  
# [使用示例]
examples:
  - input: "图文笔记（短）"
    auto_select: "v4.0"
    reason: "正文<200字，静态封面"
    
  - input: "视频笔记 + 热评"
    auto_select: "v5.0"
    reason: "正文长+热评数据，启用侧信道分析"
    
  - input: "长口播带货"
    auto_select: "v5.0"
    reason: "正文>300字+口语词，脚本盲视"
    
  - input: "/decode-v4 强制链接"
    action: "跳过检测，直接使用v4"
    
  - input: "/decode-v5 强制链接"
    action: "跳过检测，直接使用v5"

# [智能提示]
smart_tips:
  - "不确定类型？直接发链接，我自动判断"
  - "想强制视频分析？用 /decode-v5"
  - "提供了热评数据？自动启用v5侧信道"
  - "纯图文短内容？自动用v4标准分析"
