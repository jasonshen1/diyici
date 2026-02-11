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
    title: "写周报",
    description: "碎碎念秒变精英汇报",
    icon: iconWeekly,
    params: [
      {
        label: "把麻烦倒进来",
        placeholder: "把麻烦倒进来...",
        defaultValue: "本周完成了项目的初步规划，遇到了一些问题，下周继续推进。"
      }
    ]
  },
  {
    id: "social",
    title: "拒请求",
    description: "想说不又怕伤面子？阿一替你开口",
    icon: iconReply,
    params: [
      {
        label: "把麻烦倒进来",
        placeholder: "把麻烦倒进来...",
        defaultValue: "我觉得这个想法不太好，可能会有问题。"
      }
    ]
  },
  {
    id: "logic",
    title: "理方案",
    description: "只有点子没逻辑？阿一帮你通顺",
    icon: iconPpt,
    params: [
      {
        label: "把麻烦倒进来",
        placeholder: "把麻烦倒进来...",
        defaultValue: "我们应该立即执行这个计划，因为它很好。"
      }
    ]
  },
  {
    id: "meeting",
    title: "整会议",
    description: "废话太多？阿一帮你萃取重点",
    icon: iconWeekly,
    params: [
      {
        label: "把麻烦倒进来",
        placeholder: "把麻烦倒进来...",
        defaultValue: "今天的会议讨论了产品上线计划，大家各抒己见，有很多不同的想法。有人认为应该先做市场调研，有人认为应该尽快上线抢占市场。最后大家决定下周再开会讨论。"
      }
    ]
  },
  {
    id: "negotiation",
    title: "回甲方",
    description: "死磕合同？阿一帮你变共赢",
    icon: iconReply,
    params: [
      {
        label: "把麻烦倒进来",
        placeholder: "把麻烦倒进来...",
        defaultValue: "我们要求你方必须在下周之前完成所有工作，否则将追究违约责任。"
      }
    ]
  },
  {
    id: "thinking",
    title: "找灵感",
    description: "脑子枯竭？阿一帮你撞出火花",
    icon: iconPpt,
    params: [
      {
        label: "把麻烦倒进来",
        placeholder: "把麻烦倒进来...",
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
              找阿一，AI 成了。
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            把麻烦倒进来，剩下交给阿一。
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
          {/* Desktop Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {samples.map((sample) => (
              <div key={sample.id} className="h-full">
                <SampleCard
                  id={sample.id}
                  title={sample.title}
                  description={sample.description}
                  icon={sample.icon}
                  params={sample.params || []}
                  onClaim={handleClaim}
                />
              </div>
            ))}
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
    </div>
  );
}
