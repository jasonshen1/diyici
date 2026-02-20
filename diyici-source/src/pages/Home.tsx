import { SceneCard } from "@/components/SceneCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import heroBg from "@/assets/hero-bg.jpg";
import { ArrowDown, Layers, Users, Lightbulb, Sparkles, Rocket, Crown, Mail, MessageSquare, Brain, Workflow, Shield, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";
import { FeatureModal } from "@/components/FeatureModal";
import { PreviewModal } from "@/components/PreviewModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface HomeProps {
  targetSection?: string;
}

// 五级进化模型数据 - 用开餐厅比喻
const evolutionLevels = [
  {
    level: 1,
    name: "路边摊",
    subtitle: "全凭手感",
    desc: "你会做，但说不清。就像路边摊炒面的大叔，盐放多少全凭手感，每次炒出来的味道都不一样。",
    icon: Lightbulb,
    color: "bg-slate-100",
    example: "炒菜高手，但说不出具体放多少克盐；调试程序很溜，但讲不清思路"
  },
  {
    level: 2,
    name: "写菜谱",
    subtitle: "把步骤定死",
    desc: "把经验写成步骤123。把长辈口中神秘的'看感觉出锅'，翻译成'大火爆炒，200度，3分钟'。",
    icon: ScrollText,
    color: "bg-blue-50",
    example: "菜谱：盐5克，大火炒3分钟。别人能跟着做了，有明确的输入和输出。"
  },
  {
    level: 3,
    name: "开大饭店",
    subtitle: "分工流水线",
    desc: "光有一道菜的菜谱不够。给厨房分工：有人专门切菜，有人专门炒菜，有人专门摆盘，一环扣一环。",
    icon: Users,
    color: "bg-indigo-50",
    example: "后厨分工：切配→炒锅→摆盘→上菜。像军团编制一样严密的系统。"
  },
  {
    level: 4,
    name: "带徒弟视频",
    subtitle: "向下兼容",
    desc: "把冷冰冰的规训，包装成有画面感、有故事、有场景的视频或图解。让别人觉得'我这么笨居然一看就懂了'。",
    icon: Sparkles,
    color: "bg-purple-50",
    example: "培训视频+案例教学。最高级的表达是让听众觉得'我好牛逼'。"
  },
  {
    level: 5,
    name: "自动炒菜机",
    subtitle: "机器代劳",
    desc: "把标准步骤变成电脑程序、自动化工具。第1次活和第10000次活，成本几乎一样，零边际成本复制。",
    icon: Rocket,
    color: "bg-emerald-50",
    example: "中央厨房+自动炒菜机。赚钱速度挣脱体力束缚，指数级爆炸！"
  }
];

// 数字内阁角色 - 用古代官僚体系比喻
const cabinetRoles = [
  {
    role: "谋局者",
    name: "内阁首辅",
    duty: "谋局者",
    icon: "🎯",
    desc: "拿着你模糊不清的想法，进行极其冷静的拆解，输出像法律条文一样的行动指南。",
    detail: "死规矩：不准亲手干脏活。唯一任务是把控大方向绝对不能偏。像朝廷里的首辅大臣，或者建筑工地的总设计师。"
  },
  {
    role: "执行者",
    name: "六部干吏",
    duty: "执行者",
    icon: "⚡",
    desc: "没有感情的、极致高效的干饭机器。不需要思考为什么，只需要像无情的打字机一样执行。",
    detail: "拿到首辅的行动指南后，以最快的速度把图纸变成初版的文章、代码或者方案。"
  },
  {
    role: "审查员",
    name: "都察院御史",
    duty: "找茬者",
    icon: "🔍",
    desc: "极其尖酸刻薄、眼高于顶、不留情面。拿着放大镜，从各个死角进行严刑拷打。",
    detail: "一旦发现错误，无情大喊 不通过！把破烂砸回干吏脸上逼他重写。不点头说通过，活儿永远干不完。"
  },
  {
    role: "沉淀者",
    name: "翰林院史官",
    duty: "沉淀者",
    icon: "📝",
    desc: "当完美的成品终于出炉，客观简洁地记录全过程，把踩过的坑、做对的事浓缩成万能模板。",
    detail: "下次直接套用。经验真正被积累，越用越懂你。"
  }
];

// 传统vs内阁对比
const comparisonData = [
  { aspect: "工作方式", traditional: "一个智能助手，一问一答", cabinet: "四个官僚，互相制约" },
  { aspect: "思考深度", traditional: "单次推理，容易出错", cabinet: "多轮迭代，深度打磨" },
  { aspect: "结果质量", traditional: "今天完美，明天假酒", cabinet: "质检不通过就重写" },
  { aspect: "经验沉淀", traditional: "每次从零开始", cabinet: "史官记录，越用越懂" },
  { aspect: "你的角色", traditional: "暴躁监工，一遍遍改", cabinet: "端着咖啡，冷眼旁观" }
];

// 场景数据
const scenarios = [
  {
    id: "weekly-report",
    title: "写周报",
    description: "碎碎念秒变精英汇报",
    icon: "📝",
    color: "bg-blue-50 text-[#91A398]",
    category: "work",
    previewInput: "这周主要就是跟进那个A项目，没什么大进展，还在等客户反馈。然后B项目那个PPT我改完了发给总监了。下周打算继续跟进A，然后看看有没有新活。",
    previewOutput: "【本周核心进展】\n1. 项目A推进：已完成阶段性交付，目前处于客户验收反馈期，预计下周二前回收修改意见。\n2. 项目B攻坚：PPT方案经过三轮迭代，已终稿并提交总监审核，等待下一步指示。\n\n【下周重点规划】\n1. 闭环管理：重点追踪A项目反馈，确保零延迟响应。\n2. 增量探索：在保证交付质量的前提下，主动梳理部门待办，挖掘新的业务切入点。"
  },
  {
    id: "social-reply",
    title: "拒请求",
    description: "想说不又怕伤面子？阿一替你开口",
    icon: "🛡️",
    color: "bg-purple-50 text-[#91A398]",
    category: "social",
    previewInput: "老同学借钱，不想借，但是不想撕破脸，怎么回？",
    previewOutput: "【阿一·薄涂版】\n兄弟，最近手头确实有点紧，家里几笔大开销刚好赶在一起了。这阵子实在周转不开，不好意思啊，希望能理解。\n\n【阿一·中厚版】\n真不凑巧，我的钱大部分都放在理财和定期里了，最近取不出来。这次真的帮不上忙，抱歉哈。"
  },
  {
    id: "idea-structure",
    title: "理方案",
    description: "只有点子没逻辑？阿一帮你通顺",
    icon: "💡",
    color: "bg-amber-50 text-[#91A398]",
    category: "creative",
    previewInput: "要做个短视频账号，卖咖啡的。想拍点搞笑的，或者拍制作过程？名字想叫'觉醒咖啡'。目标是上班族。",
    previewOutput: "【项目一页纸：觉醒咖啡短视频启动案】\n\n1. 核心定位\n- Slogan：'觉醒咖啡 —— 专治职场不开窍。'\n- 人设：一位看透职场潜规则的'毒舌咖啡师'。\n\n2. 内容策略\n- 系列A（流量型）：'这杯咖啡送给那个甩锅的同事'——结合职场吐槽与咖啡制作，解压爽感。\n- 系列B（干货型）：'早八人续命指南'——30秒极速特调教程。\n\n3. 变现路径\n- 挂车卖挂耳包/浓缩液 -> 职场周边（摸鱼杯） -> 线下快闪店联名。"
  },
  {
    id: "meeting-summary",
    title: "整会议",
    description: "废话太多？阿一帮你萃取重点",
    icon: "🎯",
    color: "bg-emerald-50 text-[#91A398]",
    category: "work",
    previewInput: "那个，咱们下周团建去哪？小王说去爬山，但我看天气预报有雨。小李提议去轰趴馆，但我怕太吵。经费的话，每个人预算300块吧。最后定下来还是去轰趴馆吧，就在公司附近那个。时间定在周五下午。",
    previewOutput: "【会议决议】\n- 活动形式：室内轰趴（考虑到天气风险及交通便利性）。\n- 地点：公司附近轰趴馆（具体定位待发）。\n- 时间：本周五下午。\n- 预算：300元/人。\n\n【待办事项】\n- @小李：负责预定场地及零食采购（截止：周三下班前）。"
  },
  {
    id: "business-reply",
    title: "回甲方",
    description: "死磕合同？阿一帮你变共赢",
    icon: "🤝",
    color: "bg-indigo-50 text-[#91A398]",
    category: "work",
    previewInput: "客户非要让我们把LOGO放大，还要加红，简直丑哭了。能不能让他别改了？",
    previewOutput: "尊敬的客户您好，\n\n关于调整LOGO大小及颜色的建议，我们进行了多轮视觉测试。从专业设计的角度来看，目前的比例在移动端屏幕上的识别度最高，且更符合高端品牌的极简趋势。\n\n如果强制放大加红，可能会导致画面重心失衡，反而降低了品牌的高级感。建议我们可以保留一版当前方案，同时出一版微调方案供您对比决策。您看如何？"
  },
  {
    id: "brainstorming",
    title: "找灵感",
    description: "脑子枯竭？阿一帮你撞出火花",
    icon: "✨",
    color: "bg-rose-50 text-[#91A398]",
    category: "creative",
    previewInput: "怎么让年轻人喜欢上喝茶？",
    previewOutput: "【乔布斯视角】\n重新定义茶。不要卖茶叶，要卖来自东方的禅意冥想时刻。把茶具做成极致的极简主义工业品，像发布iPhone一样发布一款茶饮。\n\n【苏格拉底视角】\n反问年轻人：你喝的真的是奶茶吗？还是糖分带来的多巴胺？如果是为了清醒与思考，为什么不尝试一种更纯粹的液体？"
  }
];

export default function Home({ targetSection }: HomeProps) {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  const [previewScenario, setPreviewScenario] = useState<typeof scenarios[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeLevel, setActiveLevel] = useState(1);

  useEffect(() => {
    if (targetSection) {
      document.getElementById(targetSection)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [targetSection]);

  const handleClaim = async (id: string, data: any) => {
    const idMap: Record<string, string> = {
      'weekly-report': 'weekly',
      'social-reply': 'social',
      'idea-structure': 'logic',
      'meeting-summary': 'meeting',
      'business-reply': 'negotiation',
      'brainstorming': 'thinking'
    };
    
    const mappedId = idMap[id] || id;
    setCurrentFeature(mappedId);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-[#4A4A4A] bg-[#F0F0E8]">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F0F0E8]/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#91A398] flex items-center justify-center relative">
              <span className="text-white font-bold text-lg">1</span>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#91A398" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            <div className="font-bold text-xl tracking-tight text-[#4A4A4A]">
              diyici.ai
            </div>
          </div>
          <nav className="hidden sm:flex gap-6 items-center">
            <button onClick={() => scrollToSection("cabinet")} className="text-sm font-medium text-[#4A4A4A] hover:text-[#91A398] transition-colors">
              数字内阁
            </button>
            <button onClick={() => scrollToSection("evolution")} className="text-sm font-medium text-[#4A4A4A] hover:text-[#91A398] transition-colors">
              五级进化
            </button>
            <button onClick={() => scrollToSection("samples")} className="text-sm font-medium text-[#4A4A4A] hover:text-[#91A398] transition-colors">
              功效小样
            </button>
            <button onClick={() => setIsMailboxOpen(true)} className="text-sm font-medium text-[#4A4A4A] hover:text-[#91A398] transition-colors">
              关于我们
            </button>
          </nav>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="Hero Background" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-[#F0F0E8]/95" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#91A398]/20 backdrop-blur-sm border border-[#91A398]/30 text-white mb-8">
            <Crown className="w-4 h-4 text-[#91A398]" />
            <span className="text-sm font-medium">成为开创者</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            驯服硅基怪兽
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#91A398] to-[#A47864]">
              你免费的四人内阁
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-4 max-w-2xl mx-auto leading-relaxed">
            为什么 智能助手 今天完美，明天像喝了假酒？
          </p>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            因为你在让一个人同时扮演策划、写手、编辑。绝对的权力导致绝对的混乱。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg rounded-3xl shadow-xl shadow-[#91A398]/20 hover:scale-105 transition-transform bg-[#91A398] hover:bg-[#91A398]/90 text-white border-none" 
              onClick={() => scrollToSection("cabinet")}
            >
              了解制衡之术
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-14 px-8 text-lg rounded-3xl border-white/30 text-white hover:bg-white/10 hover:text-white"
              onClick={() => scrollToSection("samples")}
            >
              直接试用
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#91A398]">4</div>
              <div className="text-sm text-slate-400 mt-1">数字官僚</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#91A398]">5</div>
              <div className="text-sm text-slate-400 mt-1">进化层级</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#91A398]">0</div>
              <div className="text-sm text-slate-400 mt-1">边际成本</div>
            </div>
          </div>
        </div>
      </section>

      {/* 问题引入 */}
      <section className="py-20 bg-[#F0F0E8]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A47864]/10 text-[#A47864] text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              为什么需要制衡？
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#4A4A4A]">
              当你用一句话，让一个 智能助手 同时承担<br/>
              <span className="text-[#A47864]">想点子、干苦力、自己检查自己</span>
            </h2>
            <p className="text-xl text-[#6B6B6B] mb-8">
              你其实是在期待一个不会犯错的神。
            </p>
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <p className="text-lg text-[#4A4A4A] leading-relaxed">
                但算力世界和人类社会一样，<span className="font-bold text-[#A47864]">如果没有外部的制衡和摩擦力，系统走向混乱是必然的。</span>
              </p>
              <p className="text-lg text-[#6B6B6B] mt-4">
                今天心情好，结果完美无缺；明天像喝了假酒，驴唇不对马嘴。<br/>
                你不得不像个暴躁的监工，一遍遍地帮它改错。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 什么是数字内阁 */}
      <section id="cabinet" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#91A398]/10 text-[#91A398] text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              赛博官僚系统
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[#4A4A4A]">
              数字内阁：把一个人劈成四个
            </h2>
            <p className="text-lg text-[#6B6B6B] max-w-3xl mx-auto">
              我们在后台强行把一个 智能助手 劈成<span className="text-[#A47864] font-bold">四个互相制约、互相骂娘的数字官僚</span>。<br/>
              用人类几千年来在官场、工厂里用鲜血换来的权力制衡术，驯服不可预知的 智能助手。
            </p>
          </div>

          {/* 四个角色卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {cabinetRoles.map((role) => (
              <div 
                key={role.role}
                className="bg-[#F0F0E8] rounded-3xl p-6 hover:shadow-xl transition-all group border border-transparent hover:border-[#91A398]/20"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform text-center">{role.icon}</div>
                <div className="text-center mb-4">
                  <div className="text-xs text-[#91A398] font-medium mb-1">{role.duty}</div>
                  <div className="text-2xl font-bold text-[#4A4A4A]">{role.name}</div>
                  <div className="text-sm text-[#91A398] font-medium">{role.role}</div>
                </div>
                <p className="text-sm text-[#6B6B6B] text-center leading-relaxed mb-4">{role.desc}</p>
                <div className="bg-white rounded-2xl p-4">
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">{role.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 协作流程 */}
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#4A4A4A] to-[#666666] rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-2xl font-bold text-center mb-10">内阁工作流程</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#91A398] flex items-center justify-center text-2xl shrink-0">🎯</div>
                <div className="flex-1 bg-white/10 rounded-2xl p-4">
                  <div className="font-bold text-[#91A398]">你提需求 → 首辅谋局</div>
                  <div className="text-sm text-white/70">拿着模糊不清的任务，输出像法律条文一样的行动指南</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#91A398] flex items-center justify-center text-2xl shrink-0">⚡</div>
                <div className="flex-1 bg-white/10 rounded-2xl p-4">
                  <div className="font-bold text-[#91A398]">干吏执行</div>
                  <div className="text-sm text-white/70">像无情的打字机，把图纸变成初版成果</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#A47864] flex items-center justify-center text-2xl shrink-0">🔍</div>
                <div className="flex-1 bg-white/10 rounded-2xl p-4 border-2 border-[#A47864]">
                  <div className="font-bold text-[#A47864]">御史审查</div>
                  <div className="text-sm text-white/70">拿着放大镜严刑拷打。不通过 → 打回重写；通过 → 继续</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#91A398] flex items-center justify-center text-2xl shrink-0">📝</div>
                <div className="flex-1 bg-white/10 rounded-2xl p-4">
                  <div className="font-bold text-[#91A398]">史官沉淀 → 交付成果</div>
                  <div className="text-sm text-white/70">记录全过程，输出万能模板，下次直接套用</div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-white/60 mt-8">
              这种看似浪费算力的内部互掐，正是逼出高质量结果的唯一解药
            </p>
          </div>
        </div>
      </section>

      {/* 为什么要有内阁 */}
      <section className="py-20 bg-[#F0F0E8]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#4A4A4A]">
              为什么要有内阁？
            </h2>
            <p className="text-lg text-[#6B6B6B]">
              一个 智能助手 忙不过来，四个专家各司其职
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#91A398]/10 flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-[#91A398]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#4A4A4A]">深度 {'>'} 广度</h3>
              <p className="text-[#6B6B6B] leading-relaxed">
                一个 智能助手 要同时扮演策划、写手、编辑，每个角色都只能浅尝辄止。<br/><br/>
                内阁让每个角色专注一件事，深度远超通用 智能助手。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#A47864]/10 flex items-center justify-center mx-auto mb-6">
                <Workflow className="w-8 h-8 text-[#A47864]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#4A4A4A]">迭代 {'>'} 一次</h3>
              <p className="text-[#6B6B6B] leading-relaxed">
                传统 智能助手 一问一答，结果不好只能重问。<br/><br/>
                内阁内部自动多轮迭代，御史不满意就退回重写，直到出精品。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#91A398]/10 flex items-center justify-center mx-auto mb-6">
                <Layers className="w-8 h-8 text-[#91A398]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#4A4A4A]">沉淀 {'>'} 遗忘</h3>
              <p className="text-[#6B6B6B] leading-relaxed">
                传统 智能助手 每次对话从零开始。<br/><br/>
                史官记录你的偏好、习惯、历史，越用越懂你，经验真正被积累。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 与传统大模型的区别 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#4A4A4A]">
              与传统大模型有什么区别？
            </h2>
            <p className="text-lg text-[#6B6B6B]">
              不只是"更好一点"，是"完全不同的工作方式"
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F0F0E8] rounded-3xl overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-6 bg-[#4A4A4A] text-white">
                <div className="font-medium">对比维度</div>
                <div className="font-medium text-center">传统大模型</div>
                <div className="font-medium text-center text-[#91A398]">阿一数字内阁</div>
              </div>
              {comparisonData.map((row, index) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-3 gap-4 p-6 items-center ${index !== comparisonData.length - 1 ? 'border-b border-[#E8E8E0]' : ''}`}
                >
                  <div className="font-medium text-[#4A4A4A]">{row.aspect}</div>
                  <div className="text-center text-[#6B6B6B] text-sm">{row.traditional}</div>
                  <div className="text-center text-[#91A398] font-medium text-sm bg-white rounded-xl py-2 shadow-sm">{row.cabinet}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center bg-[#91A398]/10 rounded-2xl p-6">
              <p className="text-lg text-[#4A4A4A]">
                <span className="font-bold">一句话总结：</span>
                传统 智能助手 是<span className="text-[#6B6B6B]">"瑞士军刀"</span>——什么都能干，但都不专业；
                数字内阁是<span className="text-[#91A398] font-bold">"赛博官僚系统"</span>——互相制约，产出精品。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 五级进化模型 */}
      <section id="evolution" className="py-20 bg-[#F0F0E8]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#91A398]/10 text-[#91A398] text-sm font-medium mb-6">
              <Layers className="w-4 h-4" />
              炼金术五步走
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[#4A4A4A]">
              把死经验熬成活资产
            </h2>
            <p className="text-lg text-[#6B6B6B] max-w-3xl mx-auto">
              内阁协作只是开始。我们拿<span className="text-[#A47864] font-bold">开餐厅</span>来打个比方，<br/>
              教你如何把冻在脑子里的本事，一步步变成自动运行的系统。
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* 层级选择器 */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
              {evolutionLevels.map((level) => {
                const Icon = level.icon;
                return (
                  <button
                    key={level.level}
                    onClick={() => setActiveLevel(level.level)}
                    className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all min-w-[100px] ${
                      activeLevel === level.level
                        ? "bg-[#91A398] text-white shadow-lg shadow-[#91A398]/20"
                        : "bg-white text-[#4A4A4A] hover:bg-[#91A398]/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      activeLevel === level.level ? "bg-white/20" : "bg-[#91A398]/10 text-[#91A398]"
                    }`}>
                      {level.level}
                    </div>
                    <span className="font-medium text-sm">{level.name}</span>
                  </button>
                );
              })}
            </div>

            {/* 当前层级详情 */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_2px_20px_rgba(0,0,0,0.05)] border border-[#91A398]/10">
              {evolutionLevels.map((level) => {
                const Icon = level.icon;
                if (level.level !== activeLevel) return null;
                return (
                  <div key={level.level} className="animate-in fade-in duration-300">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                      <div className={`w-20 h-20 rounded-2xl ${level.color} flex items-center justify-center`}>
                        <Icon className="w-10 h-10 text-[#91A398]" />
                      </div>
                      <div className="text-center md:text-left">
                        <div className="text-sm text-[#91A398] font-medium mb-1">第 {level.level} 步 · {level.subtitle}</div>
                        <h3 className="text-3xl md:text-4xl font-bold text-[#4A4A4A]">{level.name}</h3>
                      </div>
                    </div>
                    <p className="text-lg text-[#6B6B6B] mb-6 leading-relaxed">{level.desc}</p>
                    <div className="bg-[#F0F0E8] rounded-2xl p-6">
                      <div className="text-sm text-[#91A398] font-medium mb-2">真实场景</div>
                      <p className="text-[#4A4A4A]">{level.example}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 价值说明 */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="text-[#6B6B6B] mb-2">前期投入</div>
                <div className="text-2xl font-bold text-[#4A4A4A]">线性增长</div>
                <div className="text-sm text-[#6B6B6B] mt-1">每次都要投入时间和精力</div>
              </div>
              <div className="bg-[#91A398] rounded-2xl p-6 text-center">
                <div className="text-white/80 mb-2">后期回报</div>
                <div className="text-2xl font-bold text-white">指数爆炸</div>
                <div className="text-sm text-white/80 mt-1">零边际成本复制，挣脱体力束缚</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 功效小样 */}
      <section id="samples" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#4A4A4A]">
              功效小样
            </h2>
            <p className="text-lg text-[#6B6B6B]">
              6种真实场景，体验数字内阁的协作威力
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-[#F0F0E8] rounded-full p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#91A398] data-[state=active]:text-white rounded-full px-6 py-2 transition-all">
                  全部
                </TabsTrigger>
                <TabsTrigger value="work" className="data-[state=active]:bg-[#91A398] data-[state=active]:text-white rounded-full px-6 py-2 transition-all">
                  职场保命
                </TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-[#91A398] data-[state=active]:text-white rounded-full px-6 py-2 transition-all">
                  人情世故
                </TabsTrigger>
                <TabsTrigger value="creative" className="data-[state=active]:bg-[#91A398] data-[state=active]:text-white rounded-full px-6 py-2 transition-all">
                  脑洞急救
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {scenarios.map((scenario) => (
                  <SceneCard 
                    key={scenario.id} 
                    scene={scenario} 
                    onClick={() => handleClaim(scenario.id, {})} 
                    onPreview={() => setPreviewScenario(scenario)}
                  />
                ))}
              </div>
            </TabsContent>
            {["work", "social", "creative"].map((cat) => (
              <TabsContent key={cat} value={cat} className="animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {scenarios.filter(s => s.category === cat).map((scenario) => (
                    <SceneCard 
                      key={scenario.id} 
                      scene={scenario} 
                      onClick={() => handleClaim(scenario.id, {})} 
                      onPreview={() => setPreviewScenario(scenario)}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#91A398]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            欢迎来到新世界
          </h2>
          <p className="text-xl text-white/80 mb-4 max-w-2xl mx-auto">
            亲手握住系统权柄的感觉，到底有多爽。
          </p>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            把思考留给自己，把争吵和苦力留给云端的数字内阁。
          </p>
          <Button 
            size="lg"
            className="h-14 px-10 text-lg rounded-3xl bg-white text-[#91A398] hover:bg-white/90 shadow-xl"
            onClick={() => scrollToSection("samples")}
          >
            建造你的第一条自动化流水线
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4A4A4A] text-[#F0F0E8] py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">diyici.ai</h3>
              <p className="text-[#E8E8E0]">驯服硅基怪兽的制衡工具</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">快速导航</h4>
              <div className="space-y-2 text-sm">
                <button onClick={() => scrollToSection("cabinet")} className="block hover:text-white transition-colors">数字内阁</button>
                <button onClick={() => scrollToSection("evolution")} className="block hover:text-white transition-colors">五级进化</button>
                <button onClick={() => scrollToSection("samples")} className="block hover:text-white transition-colors">功效小样</button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">联系我们</h4>
              <div className="space-y-2 text-sm">
                <p>hello@diyici.ai</p>
                <p>cooperation@diyici.ai</p>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-[#666666]">
            <p className="text-xs text-[#999999]">
              © 2026 diyici.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FeatureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        featureId={currentFeature} 
      />
      
      <Dialog open={isMailboxOpen} onOpenChange={setIsMailboxOpen}>
        <DialogContent className="max-w-md p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-bold text-[#4A4A4A] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#91A398]" />
              阿一的私人信箱
            </DialogTitle>
            <DialogDescription className="text-[#4A4A4A]">
              这里是阿一的私人空间，随时欢迎你的来信
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-[#4A4A4A] mb-4">加入阿一的内测群</h3>
              <div className="w-48 h-48 mx-auto bg-white rounded-lg p-2 border border-[#91A398]/30 shadow-lg">
                <img 
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=QR%20code%20with%20chat%20bubbles%20icon%20in%20the%20center%2C%20black%20background%2C%20white%20QR%20code%20pattern%2C%20clear%20and%20scannable&image_size=square_hd" 
                  alt="内测群二维码" 
                  className="max-w-full max-h-full rounded"
                />
              </div>
              <p className="text-sm text-[#4A4A4A] mt-4">
                扫码加入内测群，第一时间体验新功能
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#F0F0E8] rounded-lg">
                <MessageSquare className="w-5 h-5 text-[#91A398]" />
                <div>
                  <p className="text-sm font-medium text-[#4A4A4A]">官方邮箱</p>
                  <p className="text-sm text-[#4A4A4A]">hello@diyici.ai</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-[#F0F0E8] rounded-lg">
                <Mail className="w-5 h-5 text-[#91A398]" />
                <div>
                  <p className="text-sm font-medium text-[#4A4A4A]">商务合作</p>
                  <p className="text-sm text-[#4A4A4A]">cooperation@diyici.ai</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t flex justify-end">
            <Button onClick={() => setIsMailboxOpen(false)} className="bg-[#91A398] hover:bg-[#91A398]/90 text-white rounded-3xl">
              关闭信箱
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <PreviewModal 
        isOpen={!!previewScenario} 
        onClose={() => setPreviewScenario(null)} 
        scenario={previewScenario}
        onUse={() => {
          setPreviewScenario(null);
          setTimeout(() => {
            if (previewScenario) {
              handleClaim(previewScenario.id, {});
            }
          }, 200);
        }} 
      />
    </div>
  );
}
