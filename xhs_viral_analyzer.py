#!/usr/bin/env python3
"""
小红书短剧爆款分析 + Seedance 提示词生成器
XHS Viral Short Drama Analyzer & Seedance Prompt Generator
"""

import json
import re
import os
from datetime import datetime
from typing import List, Dict, Any

class XHSViralAnalyzer:
    """小红书爆款短剧分析器"""
    
    def __init__(self):
        self.script_data = {
            "analysis_date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "source_notes": [],
            "trending_keywords": [],
            "emotional_pain_points": [],
            "remix_script": {},
            "seedance_prompts": []
        }
    
    def analyze_from_text(self, raw_text: str) -> Dict[str, Any]:
        """从原始文本分析爆款元素"""
        
        # 提取情绪关键词
        emotion_patterns = [
            r"(虐|爽|甜|虐心|爽文|甜宠|反转|打脸|复仇)",
            r"(追妻火葬场|先婚后爱|重生|穿越|霸总|小奶狗)",
            r"(上头|停不下来|熬夜看完|哭死|气死|爽死)",
            r"(三观正|三观不正|狗血|套路|反套路)"
        ]
        
        emotions_found = []
        for pattern in emotion_patterns:
            matches = re.findall(pattern, raw_text)
            emotions_found.extend(matches)
        
        self.script_data["emotional_pain_points"] = list(set(emotions_found))
        
        # 提取冲突类型
        conflict_types = self._extract_conflicts(raw_text)
        
        return {
            "emotions": emotions_found,
            "conflicts": conflict_types,
            "trend_score": len(emotions_found) * 10
        }
    
    def _extract_conflicts(self, text: str) -> List[str]:
        """提取核心冲突"""
        conflicts = []
        
        conflict_keywords = {
            "阶级冲突": ["豪门", "贫富差距", "上位", "下嫁", "灰姑娘"],
            "情感冲突": ["背叛", "误会", "错过", "替身", "白月光"],
            "身份冲突": ["真假千金", "互换人生", "隐藏身份", "马甲"],
            "时间冲突": ["重生", "穿越", "回到", "前世", "未来"],
            "权力冲突": ["霸总", "掌控", "反抗", "独立", "逆袭"]
        }
        
        for conflict_type, keywords in conflict_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    conflicts.append(conflict_type)
                    break
        
        return list(set(conflicts))
    
    def generate_remix_script(self, analysis: Dict) -> Dict[str, Any]:
        """生成重组后的 60秒短剧脚本"""
        
        emotions = analysis.get("emotions", [])
        conflicts = analysis.get("conflicts", ["情感冲突"])
        
        # 基于情绪点生成黄金开头
        golden_openings = {
            "虐": "雨夜，女人跪在墓前，身后传来脚步声——'你以为死就能解脱？'",
            "爽": "法庭上，女人甩出DNA报告，全场哗然——'这，才是真相。'",
            "甜": "总裁把女人抵在电梯角落，哑声道：'偷了我的心，还想跑？'",
            "反转": "婚礼现场，新娘突然摘下面纱，竟是一张陌生的脸...",
            "复仇": "女人笑着点燃合同，火光映照着她冰冷的眼——'游戏，开始了。'"
        }
        
        # 选择最匹配的开头
        selected_opening = ""
        for emotion in emotions:
            if emotion in golden_openings:
                selected_opening = golden_openings[emotion]
                break
        
        if not selected_opening:
            selected_opening = golden_openings["反转"]
        
        script = {
            "duration": "60秒",
            "structure": {
                "opening_0_5s": {
                    "scene": "黄金开头",
                    "content": selected_opening,
                    "hook_type": "视觉奇观+极端冲突"
                },
                "rising_5_25s": {
                    "scene": "冲突升级",
                    "content": self._generate_rising_action(emotions, conflicts),
                    "beats": ["回忆杀", "身份揭露", "关系反转"]
                },
                "climax_25_45s": {
                    "scene": "高潮对决",
                    "content": self._generate_climax(emotions, conflicts),
                    "visual_focus": "微表情特写+关键道具"
                },
                "twist_45_60s": {
                    "scene": "反转/悬念",
                    "content": self._generate_twist(emotions),
                    "cliffhanger": "开放式结局或彩蛋"
                }
            },
            "emotional_arc": emotions[:3] if emotions else ["好奇", "紧张", "震惊"],
            "target_audience": "18-35岁女性，都市白领/学生",
            "platform_optimization": {
                "douyin": "前3秒强钩子，节奏快",
                "kuaishou": "情感共鸣，评论区互动",
                "xiaohongshu": "高颜值+情绪价值"
            }
        }
        
        self.script_data["remix_script"] = script
        return script
    
    def _generate_rising_action(self, emotions: List[str], conflicts: List[str]) -> str:
        """生成剧情推进"""
        templates = [
            "女主发现{conflict}的真相，决定{action}",
            "男主{action}，却不知道女主已经{secret}",
            "{conflict}爆发，两人关系降至冰点，直到{turning_point}"
        ]
        
        conflict = conflicts[0] if conflicts else "情感冲突"
        action = "反击" if "爽" in emotions or "复仇" in emotions else "隐忍"
        secret = "怀孕" if "虐" in emotions else "隐藏身份"
        turning_point = "一个意外的发现"
        
        return templates[0].format(conflict=conflict, action=action)
    
    def _generate_climax(self, emotions: List[str], conflicts: List[str]) -> str:
        """生成高潮"""
        if "爽" in emotions:
            return "女主当众揭穿反派，所有证据浮出水面，全场震惊"
        elif "虐" in emotions:
            return "男主终于发现真相，但女主已心灰意冷，决绝离去"
        else:
            return "关键时刻，意想不到的第三者出现，局势逆转"
    
    def _generate_twist(self, emotions: List[str]) -> str:
        """生成反转"""
        twists = [
            "镜头拉远，这一切竟是女主精心设计的局",
            "手机屏幕亮起——'计划成功，下一步？'",
            "一只手搭在女主肩上，熟悉的声音：'游戏才刚开始'",
            "字幕浮现：'三个月后...'",
            "黑屏，只听到一声枪响/婴儿的啼哭"
        ]
        
        return twists[0] if "爽" in emotions else twists[2]
    
    def generate_seedance_prompts(self, script: Dict[str, Any]) -> List[Dict[str, str]]:
        """生成 Seedance 2.0 视频生成提示词"""
        
        shots = []
        structure = script.get("structure", {})
        
        # Shot 01: 黄金开头 (0-5s)
        opening = structure.get("opening_0_5s", {}).get("content", "")
        shots.append({
            "shot_num": "01",
            "time": "0-5s",
            "shot_type": "Close-up (特写)",
            "prompt_en": f"Cinematic 8K, dramatic lighting, {self._scene_to_prompt(opening)}, shallow depth of field, film grain texture, intense emotional atmosphere, color grading with deep shadows and highlights",
            "dialogue_cn": f"(旁白) {opening[:30]}...",
            "emotion_point": "好奇心+紧张感",
            "camera_move": "Slow push-in"
        })
        
        # Shot 02-04: 剧情推进 (5-45s)
        rising = structure.get("rising_5_25s", {}).get("content", "")
        shots.append({
            "shot_num": "02",
            "time": "5-15s",
            "shot_type": "Medium Shot (中景)",
            "prompt_en": "Cinematic wide shot, modern luxury interior, elegant woman in designer dress standing by floor-to-ceiling windows, city lights bokeh background, cool color temperature, mysterious mood",
            "dialogue_cn": "三年前，你毁了我的一切...",
            "emotion_point": "复仇情绪铺垫",
            "camera_move": "Static to slow dolly"
        })
        
        shots.append({
            "shot_num": "03",
            "time": "15-30s",
            "shot_type": "Two Shot (双人镜头)",
            "prompt_en": "Dramatic confrontation scene, man and woman face to face in rain-soaked street, neon lights reflecting on wet pavement, emotional tension, rain droplets in slow motion, blue-orange color contrast",
            "dialogue_cn": "你以为我不知道吗？",
            "emotion_point": "冲突爆发",
            "camera_move": "Handheld shake"
        })
        
        shots.append({
            "shot_num": "04",
            "time": "30-45s",
            "shot_type": "Close-up (特写)",
            "prompt_en": "Extreme close-up of woman's eyes, single tear rolling down, reflection of fire/document in her pupils, macro lens detail, emotional vulnerability mixed with determination",
            "dialogue_cn": "这，才是开始...",
            "emotion_point": "情绪顶点",
            "camera_move": "Micro zoom"
        })
        
        # Shot 05: 反转/悬念 (45-60s)
        twist = structure.get("twist_45_60s", {}).get("content", "")
        shots.append({
            "shot_num": "05",
            "time": "45-60s",
            "shot_type": "Wide Shot (全景)",
            "prompt_en": "Wide aerial shot, woman standing alone on rooftop at night, city skyline stretching to horizon, dramatic clouds, wind blowing hair and dress, mysterious silhouette, cinematic composition, sense of epic scale",
            "dialogue_cn": twist[:25] if twist else "游戏，才刚刚开始...",
            "emotion_point": "悬念钩子",
            "camera_move": "Slow crane up"
        })
        
        self.script_data["seedance_prompts"] = shots
        return shots
    
    def _scene_to_prompt(self, scene_desc: str) -> str:
        """将场景描述转换为英文提示词"""
        # 简化处理，实际可以接入翻译API
        keywords = {
            "雨夜": "rainy night",
            "墓": "grave",
            "法庭": "courtroom",
            "婚礼": "wedding venue",
            "总裁": "CEO in tailored suit",
            "女人": "elegant woman",
            "跪着": "kneeling",
            "面纱": "veil",
            "合同": "burning contract"
        }
        
        prompt_parts = []
        for cn, en in keywords.items():
            if cn in scene_desc:
                prompt_parts.append(en)
        
        if not prompt_parts:
            prompt_parts = ["dramatic confrontation scene", "emotional intensity"]
        
        return ", ".join(prompt_parts)
    
    def save_to_file(self, output_path: str = None) -> str:
        """保存分析结果到文件"""
        
        if not output_path:
            desktop = os.path.expanduser("~/Desktop")
            if not os.path.exists(desktop):
                desktop = os.path.expanduser("~/.openclaw/workspace")
            output_path = os.path.join(desktop, "XHS_Viral_Script.md")
        
        content = self._generate_markdown()
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return output_path
    
    def _generate_markdown(self) -> str:
        """生成 Markdown 格式报告"""
        
        md = f"""# 📱 小红书爆款短剧分析报告

**生成时间**: {self.script_data['analysis_date']}  
**分析工具**: XHS Viral Analyzer v1.0

---

## 🔥 情绪痛点分析

### 核心情绪关键词
{self._format_list(self.script_data['emotional_pain_points'])}

### 爆款公式
```
{self._generate_formula()}
```

---

## 🎬 60秒短剧脚本

### 故事梗概
{self.script_data['remix_script'].get('structure', {}).get('opening_0_5s', {}).get('content', '')}

### 分镜结构

| 时间段 | 场景 | 核心动作 | 情绪目标 |
|--------|------|----------|----------|
| 0-5s | 黄金开头 | 钩子抛出 | 好奇+紧张 |
| 5-25s | 冲突升级 | 回忆+揭露 | 共情+愤怒 |
| 25-45s | 高潮对决 | 正面对抗 | 爽感+释放 |
| 45-60s | 反转/悬念 | 意外转折 | 震惊+期待 |

---

## 🎥 Seedance 2.0 视频生成提示词

| 镜头 | 时间 | 景别 | 英文 Prompt (Seedance) | 中文台词 | 情绪点 |
|------|------|------|------------------------|----------|--------|
"""
        
        for shot in self.script_data['seedance_prompts']:
            md += f"| {shot['shot_num']} | {shot['time']} | {shot['shot_type']} | {shot['prompt_en'][:80]}... | {shot['dialogue_cn'][:20]}... | {shot['emotion_point']} |\n"
        
        md += f"""

---

## 📝 完整 Prompt 详情

"""
        
        for shot in self.script_data['seedance_prompts']:
            md += f"""### Shot {shot['shot_num']} - {shot['time']}

**景别**: {shot['shot_type']}  
**运镜**: {shot['camera_move']}

**英文 Prompt** (复制到 Seedance):
```
{shot['prompt_en']}
```

**中文台词**:
> {shot['dialogue_cn']}

**对应情绪点**: {shot['emotion_point']}

---

"""
        
        md += f"""## 🎯 平台优化建议

### 抖音 (Douyin)
- 前3秒必须有强视觉冲击
- 添加热门BGM，节奏卡点
- 字幕要大，手机端友好

### 快手 (Kuaishou)  
- 强调情感共鸣点
- 引导评论区互动
- 系列化内容更容易涨粉

### 小红书 (Xiaohongshu)
- 高颜值演员/场景
- 标题要有情绪价值
- 封面图要精美

---

*报告由 OpenClaw XHS Viral Analyzer 自动生成*
"""
        
        return md
    
    def _format_list(self, items: List[str]) -> str:
        """格式化列表为 Markdown"""
        if not items:
            return "- 暂无数据"
        return "\n".join([f"- {item}" for item in items])
    
    def _generate_formula(self) -> str:
        """生成爆款公式"""
        emotions = self.script_data['emotional_pain_points']
        if not emotions:
            return "极端情绪 × 强冲突 × 高颜值 = 爆款"
        
        return f"{' + '.join(emotions[:3])} × 身份反差 × 情绪反转 = 爆款"


def main():
    """主函数 - 演示用法"""
    analyzer = XHSViralAnalyzer()
    
    # 示例：分析一段模拟的小红书爆款内容
    sample_text = """
    姐妹们！这部剧真的绝了！虐到我心肝疼😭
    女主前世被渣男害死，重生后一路开挂打脸
    那个追妻火葬场的剧情我真的反复看了十遍
    霸总男主前期有多渣，后期就有多卑微
    关键是女主完全不心软，看得我太爽了！
    这种大女主复仇爽文真的停不下来
    剧情反转不断，完全猜不到下一步
    颜值在线，演技也在线，姐妹们冲！
    """
    
    print("=" * 60)
    print("🎬 小红书爆款短剧分析器")
    print("=" * 60)
    
    # 分析
    analysis = analyzer.analyze_from_text(sample_text)
    print(f"\n✅ 分析完成!")
    print(f"   情绪关键词: {', '.join(analysis['emotions'])}")
    print(f"   核心冲突: {', '.join(analysis['conflicts'])}")
    print(f"   爆款指数: {analysis['trend_score']}/100")
    
    # 生成脚本
    script = analyzer.generate_remix_script(analysis)
    print(f"\n📝 脚本已生成: {script['duration']}")
    
    # 生成 Seedance 提示词
    prompts = analyzer.generate_seedance_prompts(script)
    print(f"   分镜数量: {len(prompts)} 个")
    
    # 保存文件
    output_file = analyzer.save_to_file()
    print(f"\n💾 报告已保存: {output_file}")
    
    print("\n" + "=" * 60)
    print("🎉 完成! 请在桌面查看 XHS_Viral_Script.md")
    print("=" * 60)


if __name__ == "__main__":
    main()
