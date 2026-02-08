import { SampleCard } from "@/components/SampleCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Asset Imports
import heroBg from "@/assets/hero-bg.jpg";
import iconWeekly from "@/assets/weekly-report.png";
import iconPpt from "@/assets/ppt-outline.png";
import iconMeeting from "@/assets/meeting-notes.png";
import iconSpeech from "@/assets/speech-draft.png";
import iconReply from "@/assets/business-reply.png";
import { ArrowDown, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FeatureModal } from "@/components/FeatureModal";

interface HomeProps {
  targetSection?: string;
}

// Updated Data Definition for AI Samples
const samples = [
  {
    id: "weekly",
    title: "职场除皱霜",
    description: "一键平复周报里的逻辑褶皱",
    icon: iconWeekly,
    params: []
  },
  {
    id: "ppt",
    title: "PPT 大纲生成",
    description: "输入主题和目标，领取专业 PPT 大纲",
    icon: iconPpt,
    params: [
      {
        label: "演讲主题",
        placeholder: "例如：2024 产品 roadmap",
        defaultValue: "产品 Q3 季度规划"
      },
      {
        label: "目标 audience",
        placeholder: "例如：公司高管、客户",
        defaultValue: "公司内部团队"
      }
    ]
  },
  {
    id: "meeting",
    title: "会议纪要",
    description: "输入会议内容，领取结构化会议纪要",
    icon: iconMeeting,
    params: [
      {
        label: "会议主题",
        placeholder: "例如：产品评审会",
        defaultValue: "周例会"
      },
      {
        label: "讨论要点",
        placeholder: "例如：项目进度、问题讨论",
        defaultValue: "项目进度、资源分配"
      }
    ]
  },
  {
    id: "speech",
    title: "发言稿生成",
    description: "输入场合和要点，领取专业发言稿",
    icon: iconSpeech,
    params: [
      {
        label: "演讲场合",
        placeholder: "例如：公司年会、客户答谢会",
        defaultValue: "部门周会"
      },
      {
        label: "核心要点",
        placeholder: "例如：感谢团队、未来计划",
        defaultValue: "工作总结、未来目标"
      }
    ]
  },
  {
    id: "reply",
    title: "高情商回复",
    description: "输入场景，领取得体回复",
    icon: iconReply,
    params: [
      {
        label: "回复场景",
        placeholder: "例如：拒绝借钱、客户投诉",
        defaultValue: "拒绝同事借钱"
      }
    ]
  }
];

export default function Home({ targetSection }: HomeProps) {
  const scrollToGrid = () => {
    document.getElementById("samples")?.scrollIntoView({ behavior: "smooth" });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);

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
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-gradient-to-b from-slate-50 to-white">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tight text-slate-900">
            diyici<span className="text-pink-500">.ai</span>
          </div>
          <nav className="hidden sm:flex gap-6 items-center">
            <button onClick={scrollToGrid} className="text-sm font-medium text-slate-600 hover:text-pink-600 transition-colors">
              AI 小样
            </button>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-pink-600 transition-colors">
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
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/50 to-white/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <span className="text-sm font-medium">AI 小样分发平台</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-purple-100">
              diyici.ai：
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-100 to-white">
              你的第一份 AI 小样
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            只需 1-2 个核心参数，点击「领取」即可获得结果。<br className="hidden md:block"/>
            像领取化妆品小样一样简单，轻盈、见效快。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-pink-900/20 hover:scale-105 transition-transform bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-none" onClick={scrollToGrid}>
              领取 AI 小样
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
            <div className="text-white/60 text-sm mt-4 sm:mt-0 sm:ml-4 flex items-center gap-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-pink-400" /> 1-2 个参数</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-pink-400" /> 一键领取</span>
            </div>
          </div>
        </div>
      </section>

      {/* Samples Grid */}
      <section id="samples" className="py-24 relative bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              AI 小样系列
            </h2>
            <p className="text-lg text-slate-500">
              精选高频场景，只需简单填空，
              <br className="hidden md:block"/>
              像领取化妆品小样一样轻松获得 AI 生成结果。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {samples.map((sample) => (
              <div key={sample.id} className="h-full">
                <SampleCard
                  id={sample.id}
                  title={sample.title}
                  description={sample.description}
                  icon={sample.icon}
                  params={sample.params}
                  onClaim={handleClaim}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">
              为什么选择 AI 小样
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">简单易用</h3>
              <p className="text-slate-500">只需 1-2 个核心参数，无需复杂设置</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">见效快</h3>
              <p className="text-slate-500">一键领取，立即获得可用结果</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">产品化</h3>
              <p className="text-slate-500">厚套壳设计，专注用户体验</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">diyici.ai</h3>
            <p className="text-slate-500">AI 小样分发平台</p>
          </div>
          <div className="flex justify-center gap-8 text-sm mb-8">
            <a href="#" className="hover:text-white transition-colors">关于我们</a>
            <a href="#" className="hover:text-white transition-colors">用户协议</a>
            <a href="#" className="hover:text-white transition-colors">隐私政策</a>
            <a href="#" className="hover:text-white transition-colors">联系合作</a>
          </div>
          <p className="text-xs text-slate-600">
            © 2026 diyici.ai. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Feature Modal */}
      <FeatureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        featureId={currentFeature} 
      />
    </div>
  );
}
