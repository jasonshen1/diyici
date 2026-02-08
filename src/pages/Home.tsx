import { SceneCard } from "@/components/SceneCard";
import { Button } from "@/components/ui/button";

// Asset Imports
import heroBg from "@/assets/hero-bg.jpg";
import iconWeekly from "@/assets/weekly-report.png";
import iconPpt from "@/assets/ppt-outline.png";
import iconMeeting from "@/assets/meeting-notes.png";
import iconSpeech from "@/assets/speech-draft.png";
import iconOnePager from "@/assets/one-pager.png";
import iconReply from "@/assets/business-reply.png";
import iconResume from "@/assets/resume-interview.png";
import iconSocial from "@/assets/social-post.png";
import iconContract from "@/assets/contract-review.png";
import iconExam from "@/assets/exam-review.png";
import { ArrowDown, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { DemoModal } from "@/components/DemoModal";
import { PricingSection } from "@/components/PricingSection";
import { AboutSection } from "@/components/AboutSection";

interface HomeProps {
  targetSection?: string;
}

// Data Definition
const scenarios = [
  {
    id: "weekly",
    title: "周报生成器",
    desc: "不用动脑，填 3 个空，给你一份会被老板表扬“逻辑清晰”的完美周报。",
    icon: iconWeekly,
  },
  {
    id: "ppt",
    title: "PPT 逻辑大纲",
    desc: "扔进你的数据，还你一个 CEO 级别的路演故事线，重点都帮你画好了。",
    icon: iconPpt,
  },
  {
    id: "meeting",
    title: "会议纪要整理",
    desc: "自动过滤废话，提取“已达成的共识”与“待办事项”，老板点赞总结到位。",
    icon: iconMeeting,
  },
  {
    id: "speech",
    title: "领导发言稿",
    desc: "不管多尴尬的局面，给你一篇带情绪标注的逐字稿，照着读就很有水平。",
    icon: iconSpeech,
  },
  {
    id: "onepager",
    title: "项目一页纸",
    desc: "把你的点子变成标准精益画布，包含商业价值与盈利模式，打印即可立项。",
    icon: iconOnePager,
  },
  {
    id: "reply",
    title: "高情商回复",
    desc: "拒绝借钱、催款、回应客户发飙... 选一种语气，给对方一个体面的台阶。",
    icon: iconReply,
  },
  {
    id: "resume",
    title: "简历与面试",
    desc: "用 STAR 法则改写流水账经历，并预测面试官会问什么刁钻问题。",
    icon: iconResume,
  },
  {
    id: "social",
    title: "爆款标题大纲",
    desc: "运用心理学技巧生成 5 个悬念标题，让你的内容点击率倍增。",
    icon: iconSocial,
  },
  {
    id: "contract",
    title: "合同风险提炼",
    desc: "5分钟看完50页文档，自动标出高风险条款与必须项，心里有底。",
    icon: iconContract,
  },
  {
    id: "exam",
    title: "错题深度复盘",
    desc: "像私教一样诊断你的逻辑死角，并出 3 道变式题确保你真的懂了。",
    icon: iconExam,
  },
];

export default function Home({ targetSection }: HomeProps) {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const scrollToGrid = () => {
    document.getElementById("scenarios")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (targetSection) {
      document.getElementById(targetSection)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [targetSection]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50/50">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tight text-slate-900">
            diyici<span className="text-primary">.ai</span>
          </div>
          <nav className="hidden sm:flex gap-6 items-center">
            <button onClick={scrollToGrid} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              首胜场景
            </button>
            <button onClick={() => document.getElementById("about")?.scrollIntoView({behavior: "smooth"})} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              设计理念
            </button>
            <button onClick={() => document.getElementById("pricing")?.scrollIntoView({behavior: "smooth"})} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              价格方案
            </button>
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
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/50 to-slate-50/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium">AI 最大的门槛，不是技术，而是第一次成功</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
            不教你学 AI<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">
              只替你把事做成
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            3-10 分钟，交付一份完美结果。<br className="hidden md:block"/>
            零门槛，零学习成本，一次真实的成功体验。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform" onClick={scrollToGrid}>
              选择你的任务
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
            <div className="text-white/60 text-sm mt-4 sm:mt-0 sm:ml-4 flex items-center gap-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-400" /> 无需 Prompt</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-400" /> 结果可用</span>
            </div>
          </div>
        </div>
      </section>

      {/* Scenarios Grid */}
      <section id="scenarios" className="py-24 relative bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              10 个首胜场景，现在就开始
            </h2>
            <p className="text-lg text-slate-500">
              我们精选了高频刚需的 10 个场景，只要简单的填空或选择，
              <br className="hidden md:block"/>
              就能立刻获得一份可以直接交付的工作成果。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {scenarios.map((scene) => (
              <div key={scene.id} className="h-full">
                {/* We pass the icon path directly to the custom logic in SceneCard if needed, 
                    but SceneCard expects a filename. 
                    Actually, let's fix SceneCard to accept the src directly to be safe with Vite hashing.
                */}
                <div className="group h-full flex flex-col border border-slate-200 rounded-xl shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white">
                  <div className="p-6 pb-2">
                    <div className="w-14 h-14 mb-4 rounded-xl bg-blue-50/50 flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-100/50">
                      <img 
                        src={scene.icon} 
                        alt={scene.title} 
                        className="w-full h-full object-contain drop-shadow-sm"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {scene.title}
                    </h3>
                  </div>
                  <div className="px-6 flex-grow">
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {scene.desc}
                    </p>
                  </div>
                  <div className="p-6 pt-4">
                    <Button 
                      onClick={() => setActiveScenario(scene.id)}
                      className="w-full bg-slate-100 text-slate-900 hover:bg-blue-600 hover:text-white transition-all shadow-none group-hover:shadow-md border border-slate-200 group-hover:border-transparent">
                      立即体验
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {/* Demo Modal */}
      <DemoModal 
        scenarioId={activeScenario} 
        isOpen={!!activeScenario} 
        onClose={() => setActiveScenario(null)} 
      />

      {/* About Section */}
      <AboutSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Trust/Footer Section */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">diyici.ai</h3>
            <p className="text-slate-500">让每一次尝试都算数</p>
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
    </div>
  );
}
