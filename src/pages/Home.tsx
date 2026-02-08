import { SampleCard } from "@/components/SampleCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Asset Imports
import heroBg from "@/assets/hero-bg.jpg";
import iconWeekly from "@/assets/weekly-report.png";
import iconPpt from "@/assets/ppt-outline.png";
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
    title: "社交隔离乳",
    description: "隔离社交表达中的多余情绪，让沟通更得体",
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
    title: "逻辑遮瑕膏",
    description: "修饰逻辑漏洞，让表达更严谨有力",
    icon: iconPpt,
    params: [
      {
        label: "请放入你需要修饰的原始文字",
        placeholder: "请输入你需要逻辑优化的内容...",
        defaultValue: "我们应该立即执行这个计划，因为它很好。"
      }
    ]
  }
];

// 按“生活体感”重新组织的场景卡片
const sceneCards = [
  {
    category: "职场急救包",
    items: [
      {
        id: "weekly",
        title: "职场除皱霜",
        description: "一键平复周报里的逻辑褶皱",
        icon: iconWeekly
      },
      {
        id: "meeting",
        title: "会议提纯乳",
        description: "快速提炼会议要点，节省时间",
        icon: iconWeekly
      }
    ],
    narrative: "解决你最焦躁的 10 分钟。"
  },
  {
    category: "社交防护林",
    items: [
      {
        id: "social",
        title: "社交隔离乳",
        description: "隔离社交表达中的多余情绪，让沟通更得体",
        icon: iconReply
      },
      {
        id: "emotion",
        title: "高情商精华",
        description: "提升社交表达的情商，让沟通更顺畅",
        icon: iconReply
      }
    ],
    narrative: "保护你的体面与边界。"
  },
  {
    category: "认知破壁机",
    items: [
      {
        id: "logic",
        title: "逻辑遮瑕膏",
        description: "修饰逻辑漏洞，让表达更严谨有力",
        icon: iconPpt
      },
      {
        id: "terms",
        title: "条款拆解液",
        description: "拆解复杂条款，让信息更易懂",
        icon: iconPpt
      }
    ],
    narrative: "消除你对复杂信息的恐惧。"
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
            <span className="text-sm font-medium">你的第一次 AI 成功</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-purple-100">
              diyici.ai
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            你好，我是阿一。我为你准备了几个 AI 小样，帮你搞定第一次成功。
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <p className="text-slate-500">从此，AI 只有零次和无数次</p>
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
