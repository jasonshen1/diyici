#!/usr/bin/env python3
"""
小红书短剧爆款自动化工作流
XHS Viral Short Drama - Full Automation Pipeline

功能：
1. 从网页/文本自动提取短剧相关内容
2. AI分析爆款元素和情绪痛点
3. 生成60秒短剧脚本
4. 输出Seedance 2.0专业视频提示词
5. 保存完整分析报告

使用方法：
    python3 xhs_auto_pipeline.py [小红书笔记URL或文本文件]

示例：
    python3 xhs_auto_pipeline.py
    python3 xhs_auto_pipeline.py "https://www.xiaohongshu.com/discovery/item/xxx"
    python3 xhs_auto_pipeline.py ./notes.txt
"""

import sys
import os
import json
import re
import argparse
from datetime import datetime
from typing import List, Dict, Any, Optional
import subprocess

class XHSAutoPipeline:
    """小红书爆款短剧自动化分析流水线"""
    
    # 2025-2026年爆款短剧情绪关键词库
    VIRAL_KEYWORDS = {
        "核心情绪": ["虐", "爽", "甜", "虐心", "爽文", "甜宠", "虐恋"],
        "人物设定": ["霸总", "小奶狗", "重生", "穿越", "马甲", "千金", "替身"],
        "剧情套路": ["追妻火葬场", "先婚后爱", "打脸", "复仇", "逆袭", "反转"],
        "观众反应": ["上头", "停不下来", "熬夜看完", "哭死", "气死", "爽死", "代入感"],
        "情感冲突": ["背叛", "误会", "错过", "白月光", "朱砂痣", "爱而不得"],
        "社会话题": ["三观正", "独立女性", "职场", "原生家庭", "贫富差距"]
    }
    
    # 黄金开头模板库
    GOLDEN_OPENINGS = {
        "虐恋型": [
            "雨夜，女人跪在墓前，身后传来脚步声——'你以为死就能解脱？'",
            "手术室外，男人红着眼撕掉离婚协议——'晚了，她不想见你。'",
            "女人笑着从楼顶坠落，男人发疯般伸手——原来他早就爱上她了。"
        ],
        "爽文型": [
            "法庭上，女人甩出DNA报告，全场哗然——'这，才是真相。'",
            "发布会现场，假千金正在炫耀，真千金摘下口罩——'好久不见。'",
            "渣男以为女主还是穷学生，直到看到她从豪车下来——'重新认识一下？'"
        ],
        "甜宠型": [
            "总裁把女人抵在电梯角落，哑声道：'偷了我的心，还想跑？'",
            "男人醉酒后打电话给前妻：'我后悔了，你回来好不好？'",
            "女人误闯总裁办公室，却看到他满墙都是自己的照片。"
        ],
        "悬疑型": [
            "婚礼现场，新娘突然摘下面纱，竟是一张陌生的脸...",
            "女人醒来发现自己回到了三年前，枕边是还没变心的他。",
            "男人发现妻子的日记本，最后一页写着：'他杀了我。'"
        ]
    }
    
    def __init__(self):
        self.analysis_data = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "source": "",
            "viral_score": 0,
            "emotions": [],
            "characters": [],
            "tropes": [],
            "conflicts": [],
            "target_audience": "",
            "generated_script": {},
            "seedance_shots": []
        }
    
    def fetch_from_url(self, url: str) -> str:
        """从URL获取内容"""
        print(f"🌐 正在获取内容: {url}")
        
        # 使用 web_fetch 工具
        try:
            result = subprocess.run(
                ["openclaw", "web", "fetch", url],
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                return result.stdout
        except:
            pass
        
        # 备用：使用 curl
        try:
            result = subprocess.run(
                ["curl", "-s", "-L", "-A", "Mozilla/5.0", url],
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                # 简单清理HTML
                text = re.sub(r'<[^>]+>', ' ', result.stdout)
                text = re.sub(r'\s+', ' ', text)
                return text[:5000]  # 限制长度
        except:
            pass
        
        return ""
    
    def analyze_content(self, text: str) -> Dict[str, Any]:
        """深度分析内容，提取爆款元素"""
        print("🔍 正在分析爆款元素...")
        
        text_lower = text.lower()
        
        # 1. 提取情绪关键词
        emotions = []
        for category, keywords in self.VIRAL_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    emotions.append(keyword)
        
        emotions = list(set(emotions))
        self.analysis_data["emotions"] = emotions
        
        # 2. 判断短剧类型
        drama_type = self._detect_drama_type(emotions)
        self.analysis_data["drama_type"] = drama_type
        
        # 3. 提取核心冲突
        conflicts = self._extract_conflict(text)
        self.analysis_data["conflicts"] = conflicts
        
        # 4. 计算爆款指数
        viral_score = self._calculate_viral_score(emotions, text)
        self.analysis_data["viral_score"] = viral_score
        
        # 5. 分析目标受众
        audience = self._analyze_audience(emotions, text)
        self.analysis_data["target_audience"] = audience
        
        print(f"   ✅ 发现 {len(emotions)} 个情绪关键词")
        print(f"   ✅ 爆款指数: {viral_score}/100")
        print(f"   ✅ 短剧类型: {drama_type}")
        
        return self.analysis_data
    
    def _detect_drama_type(self, emotions: List[str]) -> str:
        """检测短剧类型"""
        if any(e in emotions for e in ["虐", "虐心", "虐恋", "哭死"]):
            if any(e in emotions for e in ["爽", "复仇", "打脸", "逆袭"]):
                return "虐爽结合"
            return "虐恋"
        elif any(e in emotions for e in ["爽", "打脸", "复仇", "逆袭", "上头"]):
            return "爽文"
        elif any(e in emotions for e in ["甜", "甜宠", "霸总", "小奶狗"]):
            return "甜宠"
        elif any(e in emotions for e in ["重生", "穿越", "反转"]):
            return "重生/穿越"
        return "都市情感"
    
    def _extract_conflict(self, text: str) -> List[str]:
        """提取核心冲突"""
        conflicts = []
        
        conflict_patterns = {
            "阶级冲突": ["豪门", "贫富", "上位", "下嫁", "灰姑娘", "千金"],
            "情感冲突": ["背叛", "误会", "错过", "替身", "白月光", "爱而不得"],
            "身份冲突": ["真假", "互换", "隐藏", "马甲", "面具", "伪装"],
            "时间冲突": ["重生", "穿越", "前世", "回到", "重来"],
            "权力冲突": ["掌控", "反抗", "独立", "职场", "上位"],
            "家庭冲突": ["原生", "父母", "姐妹", "兄弟", "家族"]
        }
        
        for conflict_type, keywords in conflict_patterns.items():
            for keyword in keywords:
                if keyword in text:
                    conflicts.append(conflict_type)
                    break
        
        return list(set(conflicts))
    
    def _calculate_viral_score(self, emotions: List[str], text: str) -> int:
        """计算爆款潜力指数"""
        score = 0
        
        # 基础分：情绪关键词数量
        score += len(emotions) * 5
        
        # 加分项
        if any(e in emotions for e in ["上头", "停不下来"]):
            score += 15
        if any(e in emotions for e in ["反转", "打脸", "爽"]):
            score += 10
        if any(e in emotions for e in ["重生", "穿越", "追妻火葬场"]):
            score += 10
        
        # 文本长度适中加分（太短或太长都不好）
        text_len = len(text)
        if 200 < text_len < 2000:
            score += 10
        
        # 互动指标关键词
        interactive_words = ["推荐", "必看", "去看", "姐妹们", "冲"]
        for word in interactive_words:
            if word in text:
                score += 5
                break
        
        return min(score, 100)
    
    def _analyze_audience(self, emotions: List[str], text: str) -> str:
        """分析目标受众"""
        audience_tags = []
        
        if any(e in emotions for e in ["职场", "独立", "事业"]):
            audience_tags.append("25-35岁职场女性")
        if any(e in emotions for e in ["甜宠", "霸总", "校园"]):
            audience_tags.append("18-25岁学生/年轻白领")
        if any(e in emotions for e in ["重生", "复仇", "逆袭"]):
            audience_tags.append("全年龄段女性")
        if any(e in emotions for e in ["虐", "虐恋", "深情"]):
            audience_tags.append("情感敏感型观众")
        
        if not audience_tags:
            audience_tags.append("18-35岁女性用户")
        
        return " + ".join(audience_tags[:2])
    
    def generate_script(self) -> Dict[str, Any]:
        """生成60秒短剧脚本"""
        print("🎬 正在生成短剧脚本...")
        
        drama_type = self.analysis_data.get("drama_type", "都市情感")
        emotions = self.analysis_data.get("emotions", [])
        conflicts = self.analysis_data.get("conflicts", [])
        
        # 选择黄金开头
        opening_pool = self.GOLDEN_OPENINGS.get(
            self._map_to_opening_type(drama_type),
            self.GOLDEN_OPENINGS["爽文型"]
        )
        opening = opening_pool[hash(str(emotions)) % len(opening_pool)]
        
        script = {
            "title": self._generate_title(emotions, conflicts),
            "duration": "60秒",
            "genre": drama_type,
            "logline": opening,
            "structure": {
                "act1_opening": {
                    "time": "0-5s",
                    "scene": "黄金钩子",
                    "content": opening,
                    "emotion": "好奇+震惊",
                    "visual_hook": "极端特写或强烈对比"
                },
                "act2_rising": {
                    "time": "5-25s",
                    "scene": "冲突升级",
                    "content": self._generate_rising_content(emotions, conflicts),
                    "beats": ["背景揭示", "关系变化", "冲突爆发"],
                    "emotion": "共情+紧张"
                },
                "act3_climax": {
                    "time": "25-45s",
                    "scene": "高潮对决",
                    "content": self._generate_climax_content(emotions),
                    "visual_focus": "眼神对峙+关键动作",
                    "emotion": "释放+爽感"
                },
                "act4_twist": {
                    "time": "45-60s",
                    "scene": "反转/悬念",
                    "content": self._generate_twist_content(emotions),
                    "cliffhanger": self._generate_cliffhanger(emotions),
                    "emotion": "震惊+期待"
                }
            },
            "key_moments": self._extract_key_moments(emotions),
            "soundtrack_suggestion": self._suggest_music(drama_type),
            "platform_tags": self._generate_tags(emotions, drama_type)
        }
        
        self.analysis_data["generated_script"] = script
        print(f"   ✅ 脚本生成完成: {script['title']}")
        
        return script
    
    def _map_to_opening_type(self, drama_type: str) -> str:
        """映射到开头类型"""
        mapping = {
            "虐恋": "虐恋型",
            "虐爽结合": "虐恋型",
            "爽文": "爽文型",
            "甜宠": "甜宠型",
            "重生/穿越": "悬疑型",
            "都市情感": "爽文型"
        }
        return mapping.get(drama_type, "爽文型")
    
    def _generate_title(self, emotions: List[str], conflicts: List[str]) -> str:
        """生成短剧标题"""
        title_templates = [
            "重生后，{action}",
            "{relation}他，{result}",
            "被{action}后，我{reaction}",
            "{time}，{event}"
        ]
        
        actions = {"虐": "虐他千百遍", "爽": "打脸渣男", "甜": "宠上天", "复仇": "杀疯了"}
        relations = {"霸总": "总裁", "小奶狗": "弟弟", "豪门": "世家"}
        
        action = actions.get(next((e for e in emotions if e in actions), "打脸"), "逆袭")
        
        return f"重生后，我{action}"
    
    def _generate_rising_content(self, emotions: List[str], conflicts: List[str]) -> str:
        """生成剧情推进内容"""
        templates = [
            "女主发现自己是替身后，决定{action}。三年后，她以{new_identity}身份归来...",
            "前世被{antagonist}害死，重生回到{key_moment}。这一世，她要{goal}...",
            "所有人都以为她{misunderstanding}，直到{reveal_event}..."
        ]
        
        action = "复仇" if "复仇" in emotions else "逆袭"
        return templates[0].format(action=action, new_identity="顶级设计师")
    
    def _generate_climax_content(self, emotions: List[str]) -> str:
        """生成高潮内容"""
        if "爽" in emotions:
            return "女主在众目睽睽之下揭穿所有阴谋，曾经看不起她的人全都跪地求饶"
        elif "虐" in emotions:
            return "男主终于明白真相，追悔莫及，但女主已经决定永远离开"
        else:
            return "两人在命运的十字路口重逢，所有的误会即将解开，但新的危机悄然降临"
    
    def _generate_twist_content(self, emotions: List[str]) -> str:
        """生成反转内容"""
        twists = [
            "镜头拉远，这一切竟是女主精心设计的局，而真正的猎手从未现身",
            "男人的手机亮起：'计划成功，下一步？'原来他也有隐藏的身份",
            "女主摘下伪装，露出与某人一模一样的脸——她到底是谁？",
            "黑屏，只听到一声婴儿的啼哭，和一个女人轻轻的笑声...",
            "字幕浮现：'三个月后，游戏继续'"
        ]
        
        return twists[hash(str(emotions)) % len(twists)]
    
    def _generate_cliffhanger(self, emotions: List[str]) -> str:
        """生成悬念钩子"""
        if "重生" in emotions:
            return "她重生的秘密即将被发现"
        elif "马甲" in emotions:
            return "多重身份即将曝光"
        else:
            return "真正的幕后黑手现身"
    
    def _extract_key_moments(self, emotions: List[str]) -> List[str]:
        """提取关键情节点"""
        moments = []
        
        if "重生" in emotions:
            moments.append("重生觉醒时刻")
        if "打脸" in emotions:
            moments.append("身份揭露打脸")
        if "追妻火葬场" in emotions:
            moments.append("男主追悔莫及")
        if "反转" in emotions:
            moments.append("最终大反转")
        
        if not moments:
            moments = ["初遇", "冲突", "高潮", "反转"]
        
        return moments
    
    def _suggest_music(self, drama_type: str) -> str:
        """推荐配乐风格"""
        music_map = {
            "虐恋": "悲伤钢琴+弦乐，副歌部分加入电子元素增强冲突感",
            "爽文": "节奏感强的Trap/电子音乐，高潮部分加入管弦乐",
            "甜宠": "轻快吉他+人声哼唱，营造浪漫氛围",
            "重生/穿越": "神秘电子+古典融合，营造时空错位感",
            "都市情感": "现代流行+R&B，符合都市节奏"
        }
        return music_map.get(drama_type, "节奏感强的现代流行")
    
    def _generate_tags(self, emotions: List[str], drama_type: str) -> List[str]:
        """生成平台标签"""
        base_tags = ["#短剧", "#爆款短剧", "#一定要看到最后"]
        
        type_tags = {
            "虐恋": ["#虐恋情深", "#意难平", "#泪目"],
            "爽文": ["#打脸", "#逆袭", "#爽文女主"],
            "甜宠": ["#高甜", "#甜宠", "#霸道总裁"],
            "重生/穿越": ["#重生", "#穿越", "#脑洞"]
        }
        
        extra_tags = type_tags.get(drama_type, [])
        
        return base_tags + extra_tags[:3]
    
    def generate_seedance_prompts(self) -> List[Dict[str, str]]:
        """生成Seedance 2.0视频提示词"""
        print("🎥 正在生成Seedance提示词...")
        
        script = self.analysis_data.get("generated_script", {})
        structure = script.get("structure", {})
        drama_type = self.analysis_data.get("drama_type", "都市情感")
        
        shots = []
        
        # Shot 01: 黄金开头
        opening = structure.get("act1_opening", {})
        shots.append(self._create_shot(
            "01", "0-5s", "Extreme Close-up",
            self._create_opening_prompt(opening, drama_type),
            opening.get("content", "")[:50] + "...",
            "钩子抛出",
            "Slow push-in"
        ))
        
        # Shot 02: 氛围铺垫
        shots.append(self._create_shot(
            "02", "5-15s", "Wide Shot",
            self._create_atmosphere_prompt(drama_type),
            "三年前，你毁了我的一切...",
            "氛围营造",
            "Slow dolly out"
        ))
        
        # Shot 03: 冲突升级
        shots.append(self._create_shot(
            "03", "15-30s", "Medium Shot",
            self._create_conflict_prompt(drama_type),
            "你以为我不知道吗？",
            "冲突爆发",
            "Handheld subtle shake"
        ))
        
        # Shot 04: 高潮特写
        shots.append(self._create_shot(
            "04", "30-45s", "Extreme Close-up",
            self._create_climax_prompt(drama_type),
            "这，才是开始...",
            "情绪顶点",
            "Static with breathing room"
        ))
        
        # Shot 05: 反转悬念
        shots.append(self._create_shot(
            "05", "45-60s", "Wide Shot / Aerial",
            self._create_twist_prompt(drama_type),
            structure.get("act4_twist", {}).get("cliffhanger", "游戏才刚刚开始..."),
            "悬念钩子",
            "Crane up + slow zoom out"
        ))
        
        self.analysis_data["seedance_shots"] = shots
        print(f"   ✅ 生成 {len(shots)} 个分镜")
        
        return shots
    
    def _create_shot(self, num: str, time: str, shot_type: str, 
                     prompt: str, dialogue: str, emotion: str, camera: str) -> Dict[str, str]:
        """创建分镜数据"""
        return {
            "shot_num": num,
            "time": time,
            "shot_type": shot_type,
            "prompt_en": prompt,
            "dialogue_cn": dialogue,
            "emotion_point": emotion,
            "camera_move": camera
        }
    
    def _create_opening_prompt(self, opening: Dict, drama_type: str) -> str:
        """创建开头画面提示词"""
        base = "Cinematic 8K, ultra realistic, "
        
        if "虐" in drama_type:
            return base + "rainy night scene, woman kneeling in front of a tombstone, tears mixed with rain, backlit silhouette of a man approaching, dramatic rim lighting, shallow depth of field, film grain, melancholic atmosphere"
        elif "甜" in drama_type:
            return base + "luxury penthouse interior, golden hour lighting, woman cornered by tall man in designer suit, intimate proximity, romantic tension, warm color grading, soft focus background"
        else:
            return base + "modern courtroom, woman standing confidently holding documents, dramatic side lighting, crowd in background out of focus, decisive moment, cinematic composition"
    
    def _create_atmosphere_prompt(self, drama_type: str) -> str:
        """创建氛围画面提示词"""
        return "Cinematic wide shot, luxury modern interior, floor-to-ceiling windows overlooking city skyline at dusk, elegant woman in designer dress by window, reflective glass, cool blue-orange color contrast, mysterious mood, shallow depth"
    
    def _create_conflict_prompt(self, drama_type: str) -> str:
        """创建冲突画面提示词"""
        return "Dramatic two-shot, man and woman facing each other in rain-soaked street at night, neon signs reflecting on wet pavement, emotional confrontation, rain droplets in slow motion, blue-cyan color grading, intense eye contact"
    
    def _create_climax_prompt(self, drama_type: str) -> str:
        """创建高潮画面提示词"""
        return "Extreme close-up macro shot, woman's eyes with single tear rolling down, reflection of fire or burning document in pupils, intense emotional expression, shallowest depth of field, cinematic lighting, vulnerability and determination"
    
    def _create_twist_prompt(self, drama_type: str) -> str:
        """创建反转画面提示词"""
        return "Wide aerial drone shot, woman standing alone on skyscraper rooftop at night, city lights stretching to horizon, wind blowing hair and dress, mysterious silhouette, epic scale, sense of solitude and power, cinematic composition"
    
    def save_report(self, output_dir: str = None) -> str:
        """保存完整报告"""
        if not output_dir:
            output_dir = os.path.expanduser("~/Desktop")
            if not os.path.exists(output_dir):
                output_dir = os.path.expanduser("~/.openclaw/workspace")
        
        # 确保目录存在
        os.makedirs(output_dir, exist_ok=True)
        
        # 生成文件名
        timestamp = datetime.now().strftime("%m%d_%H%M")
        filename = f"XHS_Viral_Script_{timestamp}.md"
        filepath = os.path.join(output_dir, filename)
        
        # 生成内容
        content = self._generate_full_report()
        
        # 保存
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return filepath
    
    def _generate_full_report(self) -> str:
        """生成完整Markdown报告"""
        data = self.analysis_data
        script = data.get("generated_script", {})
        shots = data.get("seedance_shots", [])
        
        md = f"""# 🎬 小红书爆款短剧分析报告

---

## 📊 分析概览

| 项目 | 内容 |
|------|------|
| **分析时间** | {data['timestamp']} |
| **爆款指数** | ⭐ {data['viral_score']}/100 |
| **短剧类型** | {data.get('drama_type', '都市情感')} |
| **目标受众** | {data.get('target_audience', '18-35岁女性')} |

---

## 🔥 情绪痛点分析

### 核心情绪关键词
{self._format_keywords(data.get('emotions', []))}

### 核心冲突类型
{self._format_keywords(data.get('conflicts', []))}

### 爆款公式
```
{' + '.join(data.get('emotions', ['爽'])[:3])} × {data.get('conflicts', ['情感冲突'])[0] if data.get('conflicts') else '强冲突'} × 高颜值 = 🔥 爆款
```

---

## 🎭 短剧脚本

### 基础信息
- **剧名**: {script.get('title', '未命名')}
- **时长**: {script.get('duration', '60秒')}
- **类型**: {script.get('genre', '都市情感')}

### 一句话梗概
> {script.get('logline', '')}

### 分幕结构

#### 第一幕：黄金钩子 (0-5s)
- **场景**: {script.get('structure', {}).get('act1_opening', {}).get('scene', '')}
- **内容**: {script.get('structure', {}).get('act1_opening', {}).get('content', '')}
- **情绪目标**: {script.get('structure', {}).get('act1_opening', {}).get('emotion', '')}

#### 第二幕：冲突升级 (5-25s)
- **场景**: {script.get('structure', {}).get('act2_rising', {}).get('scene', '')}
- **内容**: {script.get('structure', {}).get('act2_rising', {}).get('content', '')}
- **关键节拍**: {' → '.join(script.get('structure', {}).get('act2_rising', {}).get('beats', []))}

#### 第三幕：高潮对决 (25-45s)
- **场景**: {script.get('structure', {}).get('act3_climax', {}).get('scene', '')}
- **内容**: {script.get('structure', {}).get('act3_climax', {}).get('content', '')}
- **视觉焦点**: {script.get('structure', {}).get('act3_climax', {}).get('visual_focus', '')}

#### 第四幕：反转悬念 (45-60s)
- **场景**: {script.get('structure', {}).get('act4_twist', {}).get('scene', '')}
- **内容**: {script.get('structure', {}).get('act4_twist', {}).get('content', '')}
- **悬念钩子**: {script.get('structure', {}).get('act4_twist', {}).get('cliffhanger', '')}

### 关键情节点
{self._format_list(script.get('key_moments', []))}

### 配乐建议
{script.get('soundtrack_suggestion', '')}

### 平台标签
{' '.join(script.get('platform_tags', []))}

---

## 🎥 Seedance 2.0 视频生成提示词

### 分镜总览表

| 镜头 | 时间 | 景别 | 英文 Prompt | 中文台词 | 情绪点 |
|------|------|------|-------------|----------|--------|
"""
        
        for shot in shots:
            prompt_short = shot['prompt_en'][:60] + "..." if len(shot['prompt_en']) > 60 else shot['prompt_en']
            dialogue_short = shot['dialogue_cn'][:25] + "..." if len(shot['dialogue_cn']) > 25 else shot['dialogue_cn']
            md += f"| {shot['shot_num']} | {shot['time']} | {shot['shot_type']} | {prompt_short} | {dialogue_short} | {shot['emotion_point']} |\n"
        
        md += """
---

### 详细 Prompt (复制到 Seedance)

"""
        
        for shot in shots:
            md += f"""#### Shot {shot['shot_num']} - {shot['time']}

**景别**: {shot['shot_type']}  
**运镜**: {shot['camera_move']}

**英文 Prompt**:
```
{shot['prompt_en']}
```

**中文台词**: 
> {shot['dialogue_cn']}

**对应情绪点**: {shot['emotion_point']}

---

"""
        
        md += f"""## 🚀 平台发布策略

### 抖音优化
- ✅ 前3秒必须有强视觉冲击
- ✅ 添加热门BGM，节奏卡点
- ✅ 字幕要大，颜色对比强烈
- ✅ 结尾引导互动（"你怎么看？"）

### 小红书优化
- ✅ 封面图要精美，带文字标题
- ✅ 标题要有情绪价值（"姐妹们谁懂啊！"）
- ✅ 正文开头放最精彩的截图
- ✅ 带相关话题标签

### 快手优化
- ✅ 强调情感共鸣点
- ✅ 引导评论区互动
- ✅ 系列化内容更容易涨粉

---

## 💡 创作建议

1. **演员选择**: 高颜值+有记忆点的特征
2. **服装道具**: 符合人设，有视觉冲击力
3. **拍摄技巧**: 多用特写捕捉微表情
4. **剪辑节奏**: 前5秒快切，中间放缓，结尾加速
5. **音乐配合**: 情绪转折点必须配合音乐高潮

---

*报告由 XHS Auto Pipeline 自动生成*  
*生成时间: {data['timestamp']}*
"""
        
        return md
    
    def _format_keywords(self, items: List[str]) -> str:
        """格式化关键词"""
        if not items:
            return "- 暂无数据"
        return "\n".join([f"- {item}" for item in items])
    
    def _format_list(self, items: List[str]) -> str:
        """格式化列表"""
        if not items:
            return "- 暂无数据"
        return "\n".join([f"{i+1}. {item}" for i, item in enumerate(items)])


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='小红书爆款短剧自动化分析')
    parser.add_argument('input', nargs='?', help='输入文件或URL')
    parser.add_argument('-o', '--output', help='输出目录')
    parser.add_argument('--demo', action='store_true', help='运行演示模式')
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("🎬 小红书爆款短剧自动化分析流水线")
    print("   XHS Viral Short Drama - Full Automation Pipeline")
    print("=" * 70)
    print()
    
    pipeline = XHSAutoPipeline()
    
    # 获取输入内容
    if args.demo or not args.input:
        # 演示模式
        print("🎯 演示模式 - 使用内置示例数据")
        print()
        sample_text = """
        姐妹们！这部短剧真的绝了！重生复仇太上头了😭
        女主前世被渣男和闺蜜联手害死，死前才知道自己才是豪门真千金
        重生回到18岁，她一路开挂，打脸所有曾经欺负她的人
        那个追妻火葬场的剧情我真的反复看了十遍
        霸总男主前期有多冷漠，后期就有多卑微求复合
        关键是女主完全不心软，看得我太爽了！
        这种大女主复仇爽文真的停不下来，每一集都有反转
        颜值在线，演技也在线，服化道都很精致
        强烈推荐给所有姐妹！冲鸭！
        """
        pipeline.analysis_data["source"] = "Demo Data"
    else:
        # 从文件或URL获取
        if args.input.startswith('http'):
            sample_text = pipeline.fetch_from_url(args.input)
            pipeline.analysis_data["source"] = args.input
        else:
            try:
                with open(args.input, 'r', encoding='utf-8') as f:
                    sample_text = f.read()
                pipeline.analysis_data["source"] = args.input
            except:
                print(f"❌ 无法读取文件: {args.input}")
                return
    
    # 执行分析流水线
    print("🚀 开始自动化分析...")
    print()
    
    # Step 1: 分析
    pipeline.analyze_content(sample_text)
    
    # Step 2: 生成脚本
    pipeline.generate_script()
    
    # Step 3: 生成Seedance提示词
    pipeline.generate_seedance_prompts()
    
    # Step 4: 保存报告
    output_file = pipeline.save_report(args.output)
    
    print()
    print("=" * 70)
    print("✅ 分析完成!")
    print(f"📄 报告已保存: {output_file}")
    print("=" * 70)
    print()
    
    # 显示摘要
    print("📊 分析摘要:")
    print(f"   • 爆款指数: {pipeline.analysis_data['viral_score']}/100")
    print(f"   • 短剧类型: {pipeline.analysis_data['drama_type']}")
    print(f"   • 情绪关键词: {', '.join(pipeline.analysis_data['emotions'][:5])}")
    print(f"   • 分镜数量: {len(pipeline.analysis_data['seedance_shots'])} 个")
    print()
    print("🎬 脚本标题:")
    print(f"   {pipeline.analysis_data['generated_script'].get('title', '未命名')}")
    print()
    print("🎥 可直接复制到 Seedance 2.0 的提示词已生成!")
    print()


if __name__ == "__main__":
    main()
