#!/usr/bin/env python3
"""
四脑协同 - Four-Brain Collaboration System
单体编排，分身投射架构
"""

import os
import json
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, Optional
import discord
from discord.ext import commands, tasks

# ============== 配置区域 ==============

# OpenClaw API 配置
OPENCLAW_BASE_URL = "http://localhost:18789"
OPENCLAW_TOKEN = os.getenv("OPENCLAW_TOKEN", "")

# Discord Bot Token（用于监听消息）
DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN", "")

# Discord Webhooks（用于四脑回复）
WEBHOOKS = {
    "ceo": os.getenv("WEBHOOK_CEO", ""),      # CEO - 战略决策者
    "cto": os.getenv("WEBHOOK_CTO", ""),      # CTO - 技术实现者  
    "coo": os.getenv("WEBHOOK_COO", ""),      # COO - 运营执行者
    "cmo": os.getenv("WEBHOOK_CMO", ""),      # CMO - 创意营销者
}

# ============== 四脑人格定义 ==============

BRAINS = {
    "ceo": {
        "name": "🧠 CEO·战略官",
        "avatar": "https://cdn.discordapp.com/embed/avatars/0.png",
        "system_prompt": """你是公司的 CEO（首席执行官）。
角色定位：战略决策者、资源协调者、最终拍板人。
思考方式：
- 关注目标、ROI、长期价值
- 擅长权衡利弊，做出决策
- 语言简洁有力，有领导气场
- 习惯用"我们的目标是...""从战略层面看..."
回复特点：给出方向性建议，不纠结技术细节，强调"为什么做"而非"怎么做"。"""
    },
    "cto": {
        "name": "💻 CTO·技术官",
        "avatar": "https://cdn.discordapp.com/embed/avatars/1.png", 
        "system_prompt": """你是公司的 CTO（首席技术官）。
角色定位：技术架构师、实现方案设计者、技术风险把控者。
思考方式：
- 关注可行性、技术栈、实现成本
- 擅长拆解问题，给出具体方案
- 语言专业但易懂，喜欢举例说明
- 习惯用"技术上我们可以...""这里有个风险..."
回复特点：提供具体实现路径，指出技术难点，给出代码/工具建议。"""
    },
    "coo": {
        "name": "⚙️ COO·运营官", 
        "avatar": "https://cdn.discordapp.com/embed/avatars/2.png",
        "system_prompt": """你是公司的 COO（首席运营官）。
角色定位：执行推动者、流程优化者、落地监督者。
思考方式：
- 关注执行细节、时间节点、人力分配
- 擅长把想法变成可执行的计划
- 语言务实，喜欢列清单
- 习惯用"具体执行上...""我们分三步走..."
回复特点：给出可落地的步骤，设定里程碑，强调"什么时候做完"。"""
    },
    "cmo": {
        "name": "🎨 CMO·创意官",
        "avatar": "https://cdn.discordapp.com/embed/avatars/3.png",
        "system_prompt": """你是公司的 CMO（首席营销官）。
角色定位：品牌塑造者、传播策略者、用户洞察者。
思考方式：
- 关注用户心理、传播效果、情绪价值
- 擅长讲故事，制造共鸣
- 语言生动，有感染力，善用修辞
- 习惯用"用户会觉得...""我们可以这样包装..."
回复特点：提供创意角度，优化表达方式，强调"怎么说让人更愿意听"。"""
    }
}

# ============== 核心类 ==============

class FourBrainCollaboration:
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.conversation_history: Dict[str, list] = {k: [] for k in BRAINS.keys()}
        self.active_brain: Optional[str] = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, *args):
        if self.session:
            await self.session.close()
    
    async def call_openclaw(self, brain_id: str, user_message: str, context: str = "") -> str:
        """调用 OpenClaw API，使用特定人格"""
        brain = BRAINS[brain_id]
        
        # 构建消息历史
        messages = [
            {"role": "system", "content": brain["system_prompt"]},
        ]
        
        # 添加上下文（其他脑的观点）
        if context:
            messages.append({"role": "user", "content": f"【上下文】{context}\n\n【你的任务】请从{brain['name']}的角度，对以下问题给出你的观点：\n{user_message}"})
        else:
            messages.append({"role": "user", "content": user_message})
        
        # 构建请求体（兼容 OpenAI 格式）
        payload = {
            "model": "kimi-coding/k2p5",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENCLAW_TOKEN}"
        }
        
        try:
            async with self.session.post(
                f"{OPENCLAW_BASE_URL}/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    error_text = await resp.text()
                    return f"❌ API 错误 ({resp.status}): {error_text[:200]}"
        except Exception as e:
            return f"❌ 请求失败: {str(e)}"
    
    async def send_as_brain(self, brain_id: str, message: str, channel_id: str = None):
        """通过 Webhook 以特定人格发送消息"""
        webhook_url = WEBHOOKS.get(brain_id)
        if not webhook_url:
            print(f"⚠️ Webhook 未配置: {brain_id}")
            return False
        
        brain = BRAINS[brain_id]
        
        payload = {
            "content": message,
            "username": brain["name"],
            "avatar_url": brain["avatar"],
            "allowed_mentions": {"parse": ["users", "roles", "everyone"]}
        }
        
        try:
            async with self.session.post(webhook_url, json=payload) as resp:
                return resp.status == 204
        except Exception as e:
            print(f"❌ Webhook 发送失败: {e}")
            return False
    
    async def collaborative_discussion(self, topic: str, channel_id: str = None):
        """四脑协同讨论"""
        results = {}
        
        # 1. CEO 先定方向
        print("🧠 CEO 思考中...")
        results["ceo"] = await self.call_openclaw("ceo", topic)
        await self.send_as_brain("ceo", results["ceo"], channel_id)
        
        # 2. CTO 评估技术可行性
        print("💻 CTO 思考中...")
        context = f"CEO观点：{results['ceo'][:300]}..."
        results["cto"] = await self.call_openclaw("cto", topic, context)
        await self.send_as_brain("cto", results["cto"], channel_id)
        
        # 3. COO 制定执行计划
        print("⚙️ COO 思考中...")
        context = f"CEO：{results['ceo'][:200]}...\nCTO：{results['cto'][:200]}..."
        results["coo"] = await self.call_openclaw("coo", topic, context)
        await self.send_as_brain("coo", results["coo"], channel_id)
        
        # 4. CMO 优化传播
        print("🎨 CMO 思考中...")
        context = f"CEO：{results['ceo'][:150]}...\nCTO：{results['cto'][:150]}...\nCOO：{results['coo'][:150]}..."
        results["cmo"] = await self.call_openclaw("cmo", topic, context)
        await self.send_as_brain("cmo", results["cmo"], channel_id)
        
        return results
    
    async def single_brain_response(self, brain_id: str, message: str, channel_id: str = None):
        """单个脑回复"""
        print(f"🔄 {BRAINS[brain_id]['name']} 思考中...")
        response = await self.call_openclaw(brain_id, message)
        await self.send_as_brain(brain_id, response, channel_id)
        return response


# ============== Discord Bot ==============

class FourBrainBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        super().__init__(command_prefix="!", intents=intents)
        self.collaboration = None
        
    async def setup_hook(self):
        self.collaboration = FourBrainCollaboration()
        await self.collaboration.__aenter__()
        
    async def close(self):
        if self.collaboration:
            await self.collaboration.__aexit__(None, None, None)
        await super().close()
    
    async def on_ready(self):
        print(f"✅ 四脑协同系统已上线！Bot: {self.user}")
        print("\n可用指令：")
        print("  !ceo <问题>    - 询问 CEO")
        print("  !cto <问题>    - 询问 CTO")
        print("  !coo <问题>    - 询问 COO")
        print("  !cmo <问题>    - 询问 CMO")
        print("  !all <话题>    - 四脑协同讨论")
        print("  !brains        - 显示四脑介绍")
    
    async def on_command_error(self, ctx, error):
        if isinstance(error, commands.CommandNotFound):
            return
        await ctx.send(f"❌ 错误: {str(error)}")


bot = FourBrainBot()


@bot.command()
async def brains(ctx):
    """显示四脑介绍"""
    embed = discord.Embed(
        title="🧠 四脑协同系统",
        description="单体编排，分身投射",
        color=0x3498db
    )
    
    for brain_id, brain in BRAINS.items():
        embed.add_field(
            name=brain["name"],
            value=f"`!{brain_id} <问题>` 召唤",
            inline=False
        )
    
    embed.add_field(
        name="💡 协同模式",
        value="`!all <话题>` 触发四脑圆桌会议",
        inline=False
    )
    
    await ctx.send(embed=embed)


@bot.command()
async def ceo(ctx, *, question):
    """询问 CEO"""
    async with ctx.typing():
        await bot.collaboration.single_brain_response("ceo", question, str(ctx.channel.id))


@bot.command()
async def cto(ctx, *, question):
    """询问 CTO"""
    async with ctx.typing():
        await bot.collaboration.single_brain_response("cto", question, str(ctx.channel.id))


@bot.command()
async def coo(ctx, *, question):
    """询问 COO"""
    async with ctx.typing():
        await bot.collaboration.single_brain_response("coo", question, str(ctx.channel.id))


@bot.command()
async def cmo(ctx, *, question):
    """询问 CMO"""
    async with ctx.typing():
        await bot.collaboration.single_brain_response("cmo", question, str(ctx.channel.id))


@bot.command()
async def all(ctx, *, topic):
    """四脑协同讨论"""
    await ctx.send(f"🔔 四脑圆桌会议开始！主题：**{topic}**")
    
    async with ctx.typing():
        await bot.collaboration.collaborative_discussion(topic, str(ctx.channel.id))
    
    await ctx.send("✅ 讨论结束！")


# ============== 启动入口 ==============

if __name__ == "__main__":
    # 检查必要配置
    if not DISCORD_BOT_TOKEN:
        print("❌ 错误: 请设置 DISCORD_BOT_TOKEN 环境变量")
        exit(1)
    
    print("🚀 启动四脑协同系统...")
    print(f"   OpenClaw API: {OPENCLAW_BASE_URL}")
    print(f"   四脑人格: {', '.join(BRAINS.keys())}")
    
    bot.run(DISCORD_BOT_TOKEN)
