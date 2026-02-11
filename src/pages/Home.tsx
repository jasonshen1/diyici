import { SampleCard } from "@/components/SampleCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Asset Imports
import heroBg from "@/assets/hero-bg.jpg";
import iconWeekly from "@/assets/weekly-report.png";
import iconPpt from "@/assets/ppt-outline.png";
import iconReply from "@/assets/business-reply.png";
import { ArrowDown, CheckCircle2, Mail, MessageSquare, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { FeatureModal } from "@/components/FeatureModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface HomeProps {
  targetSection?: string;
}

// Updated Data Definition for AI Samples
const samples = [
  {
    id: "weekly",
    title: "第一次拿捏老板",
    description: "碎碎念秒变精英周报",
    icon: iconWeekly,
    params: [
      {
        label: "请放入你需要修饰的原始文字",
        placeholder: "请输入你的周报内容...",
        defaultValue: "本周完成了项目的初步规划，遇到了一些问题，下周继续推进。"
      }
    ]
  },
  {
    id: "social",
    title: "第一次拿捏杠精",
    description: "得体拒绝所有尴尬请求",
    icon: iconReply,
    params: [
      {
        label: "请放入你需要修饰的原始文字",
        placeholder: "请输入你的社交表达内容...",
        defaultValue: "我觉得这个想法不太好，可能会有问题。"
      }
    ]
  },
  {
    id: "logic",
    title: "第一次拿捏方案",
    description: "凌乱点子瞬间变专业文档",
    icon: iconPpt,
    params: [
      {
        label: "请放入你需要修饰的原始文字",
        placeholder: "请输入你需要逻辑修饰的内容...",
        defaultValue: "我们应该立即执行这个计划，因为它很好。"
      }
    ]
  },
  {
    id: "meeting",
    title: "第一次拿捏开会",
    description: "废话全消，只留重点",
    icon: iconWeekly,
    params: [
      {
        label: "请放入你需要修饰的原始文字",
        placeholder: "请输入你的会议内容...",
        defaultValue: "今天的会议讨论了产品上线计划，大家各抒己见，有很多不同的想法。有人认为应该先做市场调研，有人认为应该尽快上线抢占市场。最后大家决定下周再开会讨论。"
      }
    ]
  },
  {
    id: "negotiation",
    title: "第一次拿捏甲方",
    description: "硬要求变成共赢话术",
    icon: iconReply,
    params: [
      {
        label: "请放入你需要修饰的原始文字",
        placeholder: "请输入你的谈判内容...",
        defaultValue: "我们要求你方必须在下周之前完成所有工作，否则将追究违约责任。"
      }
    ]
  },
  {
    id: "thinking",
    title: "第一次拿捏创意",
    description: "击碎脑壳，吐出天才解法",
    icon: iconPpt,
    params: [
      {
        label: "请放入你需要修饰的原始文字",
        placeholder: "请输入你的问题...",
        defaultValue: "如何提高团队的工作效率？"
      }
    ]
  }
];

// 按"第一次成功"阶梯重新组织的场景卡片
const sceneCards = [
  {
    category: "基础级（第一次用 AI 说话）",
    items: [
      {
        id: "weekly",
        title: "第一次拿捏老板",
        description: "碎碎念秒变精英周报",
        icon: iconWeekly
      },
      {
        id: "social",
        title: "第一次拿捏杠精",
        description: "得体拒绝所有尴尬请求",
        icon: iconReply
      }
    ],
    narrative: "迈出 AI 搞定的第一步。"
  },
  {
    category: "进阶级（第一次用 AI 代理/Agent）",
    items: [
      {
        id: "meeting",
        title: "第一次拿捏开会",
        description: "废话全消，只留重点",
        icon: iconWeekly
      },
      {
        id: "negotiation",
        title: "第一次拿捏甲方",
        description: "硬要求变成共赢话术",
        icon: iconReply
      }
    ],
    narrative: "让 AI 成为你的得力助手。"
  },
  {
    category: "专业级（第一次用 AI 技能/Skill）",
    items: [
      {
        id: "logic",
        title: "第一次拿捏方案",
        description: "凌乱点子瞬间变专业文档",
        icon: iconPpt
      },
      {
        id: "thinking",
        title: "第一次拿捏创意",
        description: "击碎脑壳，吐出天才解法",
        icon: iconPpt
      }
    ],
    narrative: "解锁 AI 的专业能力。"
  }
];

export default function Home({ targetSection }: HomeProps) {
  const scrollToGrid = () => {
    document.getElementById("samples")?.scrollIntoView({ behavior: "smooth" });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);

  useEffect(() => {
    if (targetSection) {
      document.getElementById(targetSection)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [targetSection]);

  const handleClaim = async (id: string, data: any) => {
    // 对于所有功能，都打开模态框
    setCurrentFeature(id);
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
              diyici.ai —— 找阿一，AI 第一次就搞定
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 mb-6 max-w-2xl mx-auto leading-relaxed">
            别折腾指令了。来领个小样，不管是周报还是回微信，180秒，带你第一次体验"AI 成了"的爽感。
          </p>
          
          <p className="text-base md:text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI 只有 0 次和无数次，阿一帮你搞定第 1 次。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg rounded-3xl shadow-xl shadow-[#91A398]/20 hover:scale-105 transition-transform bg-[#91A398] hover:bg-[#91A398]/90 text-white border-none" onClick={scrollToGrid}>
              即刻调配
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
            <div className="text-white/60 text-sm mt-4 sm:mt-0 sm:ml-4 flex items-center gap-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#91A398]" /> 1-2 个参数</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#91A398]" /> 一键领取</span>
            </div>
          </div>
          
          {/* 成功计数器 */}
          <div className="mt-12 text-center">
            <p className="text-sm md:text-base text-slate-300 font-medium animate-pulse">
              今日已见证 <span className="text-[#91A398] font-bold">1,284</span> 位体验官拿到了他们的第一次 AI 成功交付
            </p>
          </div>
        </div>
      </section>

      {/* Samples Grid */}
      <section id="samples" className="py-24 relative bg-[#F0F0E8]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#4A4A4A]">
              第一次成功成长阶梯
            </h2>
            <p className="text-lg text-[#4A4A4A] mb-8">
              从第一次 AI 说话到第一次 AI 技能，
              <br className="hidden md:block"/>
              一步步解锁你的 AI 成功之路。
            </p>
            
            {/* 阿一的动态欢迎语 */}
            <div className="relative inline-block">
              <div className="bg-white p-6 rounded-3xl border border-[#E8E8E0] shadow-[0_2px_15px_rgba(0,0,0,0.03)] max-w-md">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#91A398] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">阿一</span>
                  </div>
                  <div>
                    <p className="text-[#4A4A4A] leading-relaxed">
                      你好，我是阿一。别看实验室核心无所不能，其实普通人只需要搞定眼前的麻烦。挑个‘小样’试试吧。
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-3 left-10 w-6 h-6 bg-white transform rotate-45 border-b border-r border-[#E8E8E0]"></div>
            </div>
          </div>

          {sceneCards.map((scene, index) => (
            <div key={index} className="mb-16">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {scene.category}
                </h3>
                <p className="text-lg text-slate-500">
                  {scene.narrative}
                </p>
              </div>

              {/* Mobile Carousel */}
              <div className="md:hidden overflow-x-auto mobile-carousel" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                <div className="flex gap-6 pb-4 min-w-max">
                  {scene.items.map((item) => {
                    // 找到对应的 sample 对象，获取 params
                    const sample = samples.find(s => s.id === item.id);
                    return (
                      <div key={item.id} className="w-72">
                        <SampleCard
                          id={item.id}
                          title={item.title}
                          description={item.description}
                          icon={item.icon}
                          params={sample?.params || []}
                          onClaim={handleClaim}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Desktop Grid */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {scene.items.map((item) => {
                  // 找到对应的 sample 对象，获取 params
                  const sample = samples.find(s => s.id === item.id);
                  return (
                    <div key={item.id} className="h-full">
                      <SampleCard
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                        params={sample?.params || []}
                        onClaim={handleClaim}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 浪潮墙设计和首胜广场 */}
      <section className="py-20 bg-[#F0F0E8]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#4A4A4A]">
              他们在阿一这里，拿到了第一次 AI 成功。
            </h2>
          </div>

          {/* 浪潮墙对比模块 */}
          <div className="flex flex-col md:flex-row items-stretch gap-6 mb-16">
            {/* 左侧（焦虑区） */}
            <div className="w-full md:w-1/2 bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-[#E8E8E0] flex flex-col">
              <h3 className="text-xl font-semibold mb-4 text-[#4A4A4A] text-center">0 次（焦虑）</h3>
              <div className="flex-1 relative overflow-hidden rounded-2xl bg-[#F8F8F0] flex items-center justify-center">
                {/* 滚动的技术词汇 */}
                <div className="absolute inset-0 flex flex-col justify-center items-center animate-pulse">
                  <div className="text-xl md:text-2xl font-bold text-[#91A398]/30 mb-3">面对对话框发呆 1 小时</div>
                  <div className="text-xl md:text-2xl font-bold text-[#91A398]/30 mb-3">出来的全是"作为 AI 模型..."</div>
                  <div className="text-xl md:text-2xl font-bold text-[#91A398]/30">的废话</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-[#6B6B6B] text-center">
                外界的 AI 杂音，让人焦虑
              </p>
            </div>

            {/* 中间文案 */}
            <div className="hidden md:flex flex-col items-center justify-center w-16">
              <div className="text-center">
                <p className="text-sm md:text-base font-semibold text-[#91A398] rotate-[-90deg] transform origin-center whitespace-nowrap">
                  从 0 到 1，只隔一个 diyici.ai
                </p>
              </div>
            </div>

            {/* 右侧（阿一区） */}
            <div className="w-full md:w-1/2 bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-[#E8E8E0]">
              <h3 className="text-xl font-semibold mb-4 text-[#4A4A4A] text-center">1 次（首胜）</h3>
              <div className="flex-1 relative overflow-hidden rounded-2xl bg-[#F0F0E8] flex items-center justify-center">
                {/* 滚动的技术词汇 */}
                <div className="absolute inset-0 flex flex-col justify-center items-center animate-pulse">
                  <div className="text-xl md:text-2xl font-bold text-[#91A398]/80 mb-3">在 diyici.ai 注入碎碎念</div>
                  <div className="text-xl md:text-2xl font-bold text-[#91A398]/80 mb-3">180 秒拿到</div>
                  <div className="text-xl md:text-2xl font-bold text-[#91A398]/80">阿一调配的精美周报</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-[#6B6B6B] text-center">
                从此，AI 只有零次和无数次
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#F0F0E8]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#4A4A4A]">
              为什么选择功效小样
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-3xl bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-[#F0F0E8] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#91A398]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#4A4A4A]">简单易用</h3>
              <p className="text-[#4A4A4A]">只需 1-2 个核心参数，无需复杂设置</p>
            </div>
            <div className="text-center p-6 rounded-3xl bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-[#F0F0E8] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#91A398]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#4A4A4A]">见效快</h3>
              <p className="text-[#4A4A4A]">一键领取，立即获得焕新成品</p>
            </div>
            <div className="text-center p-6 rounded-3xl bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-[#F0F0E8] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#91A398]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#4A4A4A]">匠心配方</h3>
              <p className="text-[#4A4A4A]">阿一私房配方，专注用户体验</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4A4A4A] text-[#F0F0E8] py-12 border-t border-[#666666]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-2">阿一的小样实验室</h3>
            <p className="text-[#E8E8E0]">找阿一，拿你的第一次 AI 成功</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* 阿一实验室的起源 */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold text-white mb-4">阿一实验室的起源</h4>
              <p className="text-[#E8E8E0] text-sm leading-relaxed">
                阿一实验室诞生于一个简单的想法：为什么 AI 工具总是那么复杂？我们相信，好的 AI 应该像化妆品小样一样，简单、有效、触手可及。
                <br /><br />
                于是，我们开始调配「AI 小样」—— 只需 1-2 个核心参数，就能获得专业级的 AI 结果。让普通人也能轻松享受 AI 的便利，这就是阿一实验室的初心。
              </p>
            </div>
            
            {/* 阿一与你的使用契约 */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold text-white mb-4">阿一与你的使用契约</h4>
              <p className="text-[#E8E8E0] text-sm leading-relaxed">
                我们相信，技术应该服务于人，而不是相反。在这份契约中，我们承诺：
                <br /><br />
                • 保护你的隐私，不滥用你的数据
                <br />
                • 清晰透明，不隐藏任何条款
                <br />
                • 持续改进，为你提供更好的体验
                <br />
                因为你的信任，是我们前进的最大动力。
              </p>
            </div>
            
            {/* 联系阿一 */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold text-white mb-4">联系阿一</h4>
              <p className="text-[#E8E8E0] text-sm leading-relaxed mb-4">
                有想法？有问题？有合作意向？
                <br /><br />
                随时联系我们，阿一一直在听。
              </p>
              <Button 
                onClick={() => setIsMailboxOpen(true)}
                className="w-full md:w-auto bg-[#91A398] hover:bg-[#91A398]/90 text-white rounded-3xl transition-all"
              >
                阿一的私人信箱
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center gap-8 text-sm mb-8">
            <a href="/" className="hover:text-white transition-colors">首页</a>
            <a href="/about" className="hover:text-white transition-colors">关于阿一</a>
            <a href="/terms" className="hover:text-white transition-colors">使用契约</a>
            <a href="/privacy" className="hover:text-white transition-colors">树洞规则</a>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-[#999999]">
              © 2026 阿一的小样实验室. All rights reserved.
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
    </div>
  );
}
