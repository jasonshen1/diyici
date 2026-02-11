import { SceneCard } from "@/components/SceneCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Asset Imports
import heroBg from "@/assets/hero-bg.jpg";
import { ArrowDown, CheckCircle2, Mail, MessageSquare, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { FeatureModal } from "@/components/FeatureModal";
import { PreviewModal } from "@/components/PreviewModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface HomeProps {
  targetSection?: string;
}

// 扩展数据结构，加入 previewInput 和 previewOutput
const scenarios = [
  {
    id: "weekly-report",
    title: "写周报",
    description: "碎碎念秒变精英汇报",
    icon: "📝",
    color: "bg-blue-50 text-blue-600",
    category: "work",
    previewInput: "这周主要就是跟进那个A项目，没什么大进展，还在等客户反馈。然后B项目那个PPT我改完了发给总监了。下周打算继续跟进A，然后看看有没有新活。",
    previewOutput: "【本周核心进展】\n1. 项目A推进：已完成阶段性交付，目前处于客户验收反馈期，预计下周二前回收修改意见。\n2. 项目B攻坚：PPT方案经过三轮迭代，已终稿并提交总监审核，等待下一步指示。\n\n【下周重点规划】\n1. 闭环管理：重点追踪A项目反馈，确保零延迟响应。\n2. 增量探索：在保证交付质量的前提下，主动梳理部门待办，挖掘新的业务切入点。"
  },
  {
    id: "social-reply",
    title: "拒请求",
    description: "想说不又怕伤面子？阿一替你开口",
    icon: "🛡️",
    color: "bg-purple-50 text-purple-600",
    category: "social",
    previewInput: "老同学借钱，不想借，但是不想撕破脸，怎么回？",
    previewOutput: "【阿一·薄涂版】\n兄弟，最近手头确实有点紧，家里几笔大开销刚好赶在一起了。这阵子实在周转不开，不好意思啊，希望能理解。\n\n【阿一·中厚版】\n真不凑巧，我的钱大部分都放在理财和定期里了，最近取不出来。这次真的帮不上忙，抱歉哈。"
  },
  {
    id: "idea-structure",
    title: "理方案",
    description: "只有点子没逻辑？阿一帮你通顺",
    icon: "💡",
    color: "bg-amber-50 text-amber-600",
    category: "creative",
    previewInput: "要做个短视频账号，卖咖啡的。想拍点搞笑的，或者拍制作过程？名字想叫'觉醒咖啡'。目标是上班族。",
    previewOutput: "【项目一页纸：觉醒咖啡短视频启动案】\n\n1. 核心定位\n- Slogan：'觉醒咖啡 —— 专治职场不开窍。'\n- 人设：一位看透职场潜规则的'毒舌咖啡师'。\n\n2. 内容策略\n- 系列A（流量型）：'这杯咖啡送给那个甩锅的同事'——结合职场吐槽与咖啡制作，解压爽感。\n- 系列B（干货型）：'早八人续命指南'——30秒极速特调教程。\n\n3. 变现路径\n- 挂车卖挂耳包/浓缩液 -> 职场周边（摸鱼杯） -> 线下快闪店联名。"
  },
  {
    id: "meeting-summary",
    title: "整会议",
    description: "废话太多？阿一帮你萃取重点",
    icon: "🎯",
    color: "bg-emerald-50 text-emerald-600",
    category: "work",
    previewInput: "那个，咱们下周团建去哪？小王说去爬山，但我看天气预报有雨。小李提议去轰趴馆，但我怕太吵。经费的话，每个人预算300块吧。最后定下来还是去轰趴馆吧，就在公司附近那个。时间定在周五下午。",
    previewOutput: "【会议决议】\n- 活动形式：室内轰趴（考虑到天气风险及交通便利性）。\n- 地点：公司附近轰趴馆（具体定位待发）。\n- 时间：本周五下午。\n- 预算：300元/人。\n\n【待办事项】\n- @小李：负责预定场地及零食采购（截止：周三下班前）。"
  },
  {
    id: "business-reply",
    title: "回甲方",
    description: "死磕合同？阿一帮你变共赢",
    icon: "🤝",
    color: "bg-indigo-50 text-indigo-600",
    category: "work",
    previewInput: "客户非要让我们把LOGO放大，还要加红，简直丑哭了。能不能让他别改了？",
    previewOutput: "尊敬的客户您好，\n\n关于调整LOGO大小及颜色的建议，我们进行了多轮视觉测试。从专业设计的角度来看，目前的比例在移动端屏幕上的识别度最高，且更符合高端品牌的极简趋势。\n\n如果强制放大加红，可能会导致画面重心失衡，反而降低了品牌的“高级感”。建议我们可以保留一版当前方案，同时出一版微调方案供您对比决策。您看如何？"
  },
  {
    id: "brainstorming",
    title: "找灵感",
    description: "脑子枯竭？阿一帮你撞出火花",
    icon: "✨",
    color: "bg-rose-50 text-rose-600",
    category: "creative",
    previewInput: "怎么让年轻人喜欢上喝茶？",
    previewOutput: "【乔布斯视角】\n重新定义茶。不要卖茶叶，要卖“来自东方的禅意冥想时刻”。把茶具做成极致的极简主义工业品，像发布iPhone一样发布一款茶饮。\n\n【苏格拉底视角】\n反问年轻人：你喝的真的是奶茶吗？还是糖分带来的多巴胺？如果是为了清醒与思考，为什么不尝试一种更纯粹的液体？"
  }
];

export default function Home({ targetSection }: HomeProps) {
  const scrollToGrid = () => {
    document.getElementById("samples")?.scrollIntoView({ behavior: "smooth" });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  // 预览模态框状态
  const [previewScenario, setPreviewScenario] = useState<typeof scenarios[0] | null>(null);
  // 当前选中的分类
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (targetSection) {
      document.getElementById(targetSection)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [targetSection]);

  const handleClaim = async (id: string, data: any) => {
    // 映射新 ID 到旧 ID，以便 FeatureModal 能够正确识别功能
    const idMap: Record<string, string> = {
      'weekly-report': 'weekly',
      'social-reply': 'social',
      'idea-structure': 'logic',
      'meeting-summary': 'meeting',
      'business-reply': 'negotiation',
      'brainstorming': 'thinking'
    };
    
    const mappedId = idMap[id] || id;
    // 对于所有功能，都打开模态框
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
              阿一的第一次成功实验室
            </div>
          </div>
          <nav className="hidden sm:flex gap-6 items-center">
            <button onClick={scrollToGrid} className="text-sm font-medium text-[#4A4A4A] hover:text-[#91A398] transition-colors">
              功效小样
            </button>
            <a href="#" className="text-sm font-medium text-[#4A4A4A] hover:text-[#91A398] transition-colors">
              关于我们
            </a>
          </nav>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/50 to-[#F0F0E8]/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-[#91A398] animate-pulse" />
            <span className="text-sm font-medium">阿一的小样实验室</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#91A398]/90 to-[#A47864]/90">
              diyici.ai —— 你的第一次 AI 体验入口
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            简单、好用、好看。从这里开始，和世界一起玩转 AI。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg rounded-3xl shadow-xl shadow-[#91A398]/20 hover:scale-105 transition-transform bg-[#91A398] hover:bg-[#91A398]/90 text-white border-none" onClick={scrollToGrid}>
              成了！
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
            <div className="text-white/60 text-sm mt-4 sm:mt-0 sm:ml-4 flex items-center gap-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#91A398]" /> 没有等待</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#91A398]" /> 只有搞定</span>
            </div>
          </div>
          
          {/* 成功计数器 */}
          <div className="mt-12 text-center">
            <p className="text-sm md:text-base text-slate-300 font-medium animate-pulse">
              今日已有 <span className="text-[#91A398] font-bold">1,284</span> 位用户在 diyici.ai 瞬间搞定了他们的第一次 AI 任务
            </p>
          </div>
        </div>
      </section>

      {/* Samples Grid */}
      <section id="samples" className="py-16 relative bg-[#F0F0E8]">
        <div className="container mx-auto px-6">
          {/* 货架分类 - Tabs */}
          <div className="mb-12">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="bg-white/80 rounded-full p-1">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-[#91A398] data-[state=active]:text-white rounded-full px-6 py-2 transition-all"
                    onClick={() => setSelectedCategory("all")}
                  >
                    全部
                  </TabsTrigger>
                  <TabsTrigger 
                    value="work" 
                    className="data-[state=active]:bg-[#91A398] data-[state=active]:text-white rounded-full px-6 py-2 transition-all"
                    onClick={() => setSelectedCategory("work")}
                  >
                    职场保命
                  </TabsTrigger>
                  <TabsTrigger 
                    value="social" 
                    className="data-[state=active]:bg-[#91A398] data-[state=active]:text-white rounded-full px-6 py-2 transition-all"
                    onClick={() => setSelectedCategory("social")}
                  >
                    人情世故
                  </TabsTrigger>
                  <TabsTrigger 
                    value="creative" 
                    className="data-[state=active]:bg-[#91A398] data-[state=active]:text-white rounded-full px-6 py-2 transition-all"
                    onClick={() => setSelectedCategory("creative")}
                  >
                    脑洞急救
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* 卡片列表 */}
              <TabsContent value="all" className="animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
                  {scenarios.map((scenario) => (
                    <SceneCard 
                      key={scenario.id} 
                      scene={scenario} 
                      onClick={() => handleClaim(scenario.id, {})} 
                      onPreview={() => setPreviewScenario(scenario)} // 绑定预览点击
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="work" className="animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
                  {scenarios.filter(scenario => scenario.category === "work").map((scenario) => (
                    <SceneCard 
                      key={scenario.id} 
                      scene={scenario} 
                      onClick={() => handleClaim(scenario.id, {})} 
                      onPreview={() => setPreviewScenario(scenario)} // 绑定预览点击
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="social" className="animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
                  {scenarios.filter(scenario => scenario.category === "social").map((scenario) => (
                    <SceneCard 
                      key={scenario.id} 
                      scene={scenario} 
                      onClick={() => handleClaim(scenario.id, {})} 
                      onPreview={() => setPreviewScenario(scenario)} // 绑定预览点击
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="creative" className="animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
                  {scenarios.filter(scenario => scenario.category === "creative").map((scenario) => (
                    <SceneCard 
                      key={scenario.id} 
                      scene={scenario} 
                      onClick={() => handleClaim(scenario.id, {})} 
                      onPreview={() => setPreviewScenario(scenario)} // 绑定预览点击
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* 阿一的配方实验室 */}
      <section className="py-16 bg-[#F0F0E8] border-y border-[#91A398]/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#4A4A4A]">
              阿一的配方实验室
            </h2>
            <p className="text-lg text-[#4A4A4A]">
              共创 AI 新时代，和阿一一起调配属于你的专属配方
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 左侧：求配方 - 许愿池 */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-[#E8E8E0]">
              <div className="w-16 h-16 mb-6 rounded-2xl bg-[#91A398]/20 flex items-center justify-center">
                <span className="text-[#91A398] text-2xl font-bold">许愿</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#4A4A4A]">
                求配方
              </h3>
              <p className="text-lg text-[#4A4A4A] mb-6">
                你希望 AI 帮你第一次做什么？告诉阿一，我们来调配。
              </p>
              <Textarea 
                placeholder="把你的需求告诉阿一..."
                className="min-h-[120px] bg-[#F0F0E8] border-[#E8E8E0] focus:border-[#91A398] transition-all rounded-3xl mb-4"
              />
              <Button className="w-full bg-[#91A398] hover:bg-[#91A398]/90 text-white rounded-3xl">
                提交许愿
              </Button>
            </div>

            {/* 右侧：投配方 - 配方师招募 */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-[#E8E8E0]">
              <div className="w-16 h-16 mb-6 rounded-2xl bg-[#A47864]/20 flex items-center justify-center">
                <span className="text-[#A47864] text-2xl font-bold">招募</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#4A4A4A]">
                投配方
              </h3>
              <p className="text-lg text-[#4A4A4A] mb-6">
                你有绝妙的 AI 用法？提交配方，让 10000 人使用你的创意。
              </p>
              <div className="bg-[#F0F0E8] rounded-3xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#91A398] flex items-center justify-center">
                    <span className="text-white font-medium">阿一</span>
                  </div>
                  <div>
                    <p className="text-sm text-[#4A4A4A] font-medium">配方师福利</p>
                    <p className="text-xs text-[#6B6B6B]">曝光机会 + 专属徽章 + 社区荣誉</p>
                  </div>
                </div>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  成为阿一的配方师，你的创意将被更多人看到和使用。我们会定期评选优秀配方，给予特别奖励。
                </p>
              </div>
              <Button className="w-full bg-[#A47864] hover:bg-[#A47864]/90 text-white rounded-3xl">
                成为配方师
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4A4A4A] text-[#F0F0E8] py-8 border-t border-[#666666]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white mb-2">diyici.ai</h3>
            <p className="text-[#E8E8E0]">AI 搞定，就现在</p>
          </div>
          
          <div className="flex justify-center gap-6 text-sm mb-6">
            <a href="/" className="hover:text-white transition-colors">首页</a>
            <a href="/about" className="hover:text-white transition-colors">关于我们</a>
            <a href="/terms" className="hover:text-white transition-colors">使用条款</a>
            <a href="/privacy" className="hover:text-white transition-colors">隐私政策</a>
          </div>

          {/* 热门搜索式伪链接 */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-white mb-4 text-center">
              热门搜索
            </h4>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="#" className="text-[#E8E8E0] hover:text-white transition-colors">第一次写诗</a>
              <a href="#" className="text-[#E8E8E0] hover:text-white transition-colors">第一次做图</a>
              <a href="#" className="text-[#E8E8E0] hover:text-white transition-colors">第一次哄娃</a>
              <a href="#" className="text-[#E8E8E0] hover:text-white transition-colors">第一次写情书</a>
              <a href="#" className="text-[#E8E8E0] hover:text-white transition-colors">第一次做方案</a>
              <a href="#" className="text-[#E8E8E0] hover:text-white transition-colors">第一次做简历</a>
              <a href="#" className="text-[#E8E8E0] hover:text-white transition-colors">第一次写脚本</a>
              <a href="#" className="text-[#E8E8E0] hover:text-white transition-colors">第一次做PPT</a>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-[#999999]">
              © 2026 diyici.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Feature Modal */}
      <FeatureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        featureId={currentFeature} 
      />
      
      {/* 阿一的私人信箱 */}
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
          
          <div className="p-6 max-h-[60vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            {/* 内测群二维码 */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-[#4A4A4A] mb-4">加入阿一的内测群</h3>
              <div className="w-48 h-48 mx-auto bg-white rounded-lg p-2 border border-[#91A398]/30 shadow-lg">
                {/* 真实内测群二维码 */}
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
            
            {/* 其他联系方式 */}
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
            
            {/* 温馨提示 */}
            <div className="mt-6 p-4 bg-[#FFF9C4] rounded-lg text-sm text-[#4A4A4A]">
              <p className="font-medium mb-2">阿一的温馨提示</p>
              <p className="leading-relaxed">
                无论你是有功能建议、问题反馈，还是合作意向，阿一都会认真对待每一封来信。
                <br /><br />
                加入内测群，你还能结识更多志同道合的朋友，一起探索 AI 的无限可能。
              </p>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t flex justify-end">
            <Button onClick={() => setIsMailboxOpen(false)} className="bg-[#91A398] hover:bg-[#91A398]/90 text-white rounded-3xl">
              关闭信箱
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Preview Modal */}
      <PreviewModal 
        isOpen={!!previewScenario} 
        onClose={() => setPreviewScenario(null)} 
        scenario={previewScenario}
        onUse={() => {
          setPreviewScenario(null);
          // 稍微延迟一下，给 PreviewModal 关闭动画一点时间，体验更好
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
