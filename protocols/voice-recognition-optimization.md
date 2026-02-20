# QQ Bot 语音识别优化协议
# Voice Recognition Optimization Protocol v1.0

## 当前问题诊断

### 误识别案例分析
- **案例1**: "帮我建个网站" → 误识别为 "京东配送"
- **根本原因**: 
  1. 口音/语速影响
  2. 缺乏上下文确认
  3. 无容错机制

## 优化方案：三层确认机制

### 第一层：实时转写 + 置信度评估

```python
def voice_recognition_with_confidence(audio_data):
    """
    语音识别 + 置信度评估
    """
    # 1. 主识别结果
    primary_result = whisper.recognize(audio_data, model="base")
    
    # 2. 置信度评分 (0-1)
    confidence = calculate_confidence(primary_result)
    
    # 3. 备选识别结果
    alternatives = whisper.recognize(audio_data, model="base", alternatives=3)
    
    return {
        "text": primary_result,
        "confidence": confidence,
        "alternatives": alternatives,
        "needs_confirmation": confidence < 0.7  # 置信度低于70%需要确认
    }
```

### 第二层：上下文感知校正

```python
class ContextAwareCorrector:
    """
    基于对话上下文的语义校正
    """
    
    # 常见误识别词典
    CORRECTION_MAP = {
        "京东配送": ["帮我建个网站", "帮我建网站", "帮我见个网友"],
        "今晚吃啥": ["今晚测试", "今晚设施"],
        # ... 更多常见误识别
    }
    
    def correct(self, recognized_text, conversation_context):
        """
        根据上下文校正识别结果
        """
        # 1. 检查是否在误识别词典中
        if recognized_text in self.CORRECTION_MAP:
            # 根据上下文选择最可能的正确文本
            candidates = self.CORRECTION_MAP[recognized_text]
            best_match = self.select_by_context(candidates, conversation_context)
            return best_match, "corrected"
        
        # 2. 语义连贯性检查
        if not self.is_semantically_coherent(recognized_text, conversation_context):
            return recognized_text, "needs_confirmation"
        
        return recognized_text, "ok"
```

### 第三层：用户确认反馈

```python
def process_voice_message(audio_data, conversation_history):
    """
    处理语音消息的完整流程
    """
    # Step 1: 语音识别
    recognition_result = voice_recognition_with_confidence(audio_data)
    
    # Step 2: 上下文校正
    corrected_text, status = context_corrector.correct(
        recognition_result["text"],
        conversation_history
    )
    
    # Step 3: 根据置信度决定处理方式
    if recognition_result["confidence"] >= 0.85 and status == "ok":
        # 高置信度，直接处理
        return direct_process(corrected_text)
    
    elif recognition_result["confidence"] >= 0.6 or status == "corrected":
        # 中等置信度，发送确认请求
        return send_confirmation_request(
            original=recognition_result["text"],
            corrected=corrected_text,
            confidence=recognition_result["confidence"],
            alternatives=recognition_result["alternatives"]
        )
    
    else:
        # 低置信度，请求重说
        return send_clarification_request(
            heard=recognition_result["text"],
            alternatives=recognition_result["alternatives"]
        )
```

## 用户交互模板

### 场景1：中等置信度（需要确认）

**AI回复**:
> 🎤 语音转文字：
> "帮我建个网站"
> 
> 置信度：75%
> 
> 你是说：
> [1] 帮我建个网站 ✅
> [2] 京东配送
> [3] 帮我见个网友
> 
> 请回复数字确认，或重新说一遍

### 场景2：低置信度（完全听不清）

**AI回复**:
> 🎤 抱歉，我没听清楚
> 
> 我听到的是："京东配送"
> 但这似乎不太对...
> 
> 可能你是想说：
> - 帮我建个网站
> - 帮我建个文档
> - 帮我见个网友
> 
> 请用文字输入，或再说一遍，说慢一点~ 😊

### 场景3：高置信度（直接处理）

**AI回复**:
> 🎤 "帮我建个网站" (置信度：92%)
> 
> [直接开始执行...]

## 技术实现配置

### OpenClaw 配置更新

```yaml
# ~/.openclaw/openclaw.json
{
  "voice_recognition": {
    "enabled": true,
    "model": "whisper-base",
    "language": "zh",
    
    "confidence_thresholds": {
      "direct_process": 0.85,
      "confirmation_required": 0.60,
      "clarification_required": 0.00
    },
    
    "confirmation": {
      "enabled": true,
      "show_alternatives": 3,
      "timeout_seconds": 60
    },
    
    "context_correction": {
      "enabled": true,
      "correction_map_file": "~/.openclaw/voice-corrections.json",
      "max_context_messages": 10
    }
  }
}
```

### 纠错词典文件

```json
{
  "voice_corrections": [
    {
      "misheard": "京东配送",
      "candidates": ["帮我建个网站", "帮我建网站", "帮我见个网友"],
      "context_hints": ["网站", "建站", "部署", "服务器"]
    },
    {
      "misheard": "今晚测试",
      "candidates": ["今晚吃啥", "今晚设施"],
      "context_hints": ["吃饭", "晚餐", "吃"]
    }
  ]
}
```

## 训练数据收集

### 自动收集机制

```python
def collect_correction_feedback(original, corrected, user_confirmed):
    """
    收集用户反馈，持续优化
    """
    if user_confirmed and original != corrected:
        # 记录成功纠错案例
        save_correction_case(original, corrected)
        
        # 更新统计
        update_correction_stats(original, success=True)
    
    elif not user_confirmed:
        # 记录纠错失败案例
        update_correction_stats(original, success=False)
```

### 定期优化

- **每周**：分析纠错成功率，更新纠错词典
- **每月**：重训练上下文模型
- **每季度**：评估是否需要升级语音识别模型（base → small → medium）

## 效果评估指标

| 指标 | 当前 | 目标 |
|-----|------|------|
| 误识别率 | ~15% | <5% |
| 需要确认比例 | N/A | ~20% |
| 用户确认准确率 | N/A | >95% |
| 平均交互轮数 | 1 | 1.2 |

## 实施步骤

1. **Phase 1** (1周): 部署置信度评估 + 确认机制
2. **Phase 2** (2周): 部署上下文校正 + 纠错词典
3. **Phase 3** (持续): 收集反馈 + 迭代优化

---

*协议版本: v1.0*
*创建时间: 2026-02-15*
*适用系统: OpenClaw QQ Bot*
