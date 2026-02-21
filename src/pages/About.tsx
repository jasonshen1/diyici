import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface AboutProps {
  targetSection?: string;
}

export default function About({ targetSection }: AboutProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans text-[#4A4A4A] bg-[#F0F0E8]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F0F0E8]/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#91A398] flex items-center justify-center">
              <span className="text-white font-bold text-lg">1</span>
            </div>
            <div className="font-bold text-xl tracking-tight text-[#4A4A4A]">
              阿一的小样实验室
            </div>
          </div>
          <nav className="hidden sm:flex gap-6 items-center">
            <a href="/" className="text-sm font-medium text-[#4A4A4A] hover:text-[#91A398] transition-colors">
              首页
            </a>
            <a href="/about" className="text-sm font-medium text-[#91A398] hover:text-[#91A398] transition-colors">
              关于阿一
            </a>
            <a href="/terms" className="text-sm font-medium text-[#4A4A4A] hover:text-[#91A398] transition-colors">
              使用契约
            </a>
            <a href="/privacy" className="text-sm font-medium text-[#4A4A4A] hover:text-[#91A398] transition-colors">
              树洞规则
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <section className="text-center mb-20">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-[#4A4A4A]">
              diyici.ai：所有 智能故事的起点
            </h1>
            <p className="text-xl md:text-2xl text-[#4A4A4A] max-w-3xl mx-auto leading-relaxed mb-10">
              你好，我是阿一。
            </p>
            <p className="text-xl md:text-2xl text-[#4A4A4A] max-w-3xl mx-auto leading-relaxed mb-10">
              我的故事始于一个普通的夜晚。那时我还是一名产品经理，盯着电脑屏幕上的周报模板，脑子里一片空白。我试着用智能 来帮忙，却在对话框前发呆了整整一小时——出来的全是"作为 智能模型..."的废话。
            </p>
            <p className="text-xl md:text-2xl text-[#4A4A4A] max-w-3xl mx-auto leading-relaxed mb-10">
              那一刻，我突然明白：这个世界不需要更多复杂的 智能工具，而是需要一个能真正帮普通人拿到结果的朋友。
            </p>
            <p className="text-xl md:text-2xl text-[#4A4A4A] max-w-3xl mx-auto leading-relaxed mb-10">
              于是，我在实验室里待了三个月，把最前沿的 智能技术像调配化妆品一样，封装成了一支支"小样"。不需要复杂的指令，不需要专业的知识，只要你注入一点你的需求，180 秒后，就能拿到一份像样的成功。
            </p>
            <p className="text-xl md:text-2xl text-[#4A4A4A] max-w-3xl mx-auto leading-relaxed mb-10">
              这就是 diyici.ai 的起源——不是为了追逐技术浪潮，而是为了让每一个普通人都能在 智能时代，第一次就赢。
            </p>
            <p className="text-2xl md:text-3xl font-bold text-[#91A398] max-w-3xl mx-auto leading-relaxed">
              世界日新月异，阿一只想让你第一次就赢。
            </p>
          </section>

          {/* Features Section */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#4A4A4A]">
                阿一的实验室理念
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-3xl bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-[#F0F0E8] flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#91A398]">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#4A4A4A]">简单易用</h3>
                <p className="text-[#4A4A4A]">无需复杂指令，只需 1-2 个核心参数，即可获得专业级 智能结果</p>
              </div>
              <div className="text-center p-6 rounded-3xl bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-[#F0F0E8] flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#91A398]">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#4A4A4A]">快速见效</h3>
                <p className="text-[#4A4A4A]">180 秒内完成调配，让你即时看到智能 的强大效果</p>
              </div>
              <div className="text-center p-6 rounded-3xl bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-[#F0F0E8] flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#91A398]">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#4A4A4A]">安全可靠</h3>
                <p className="text-[#4A4A4A]">保护你的隐私，不存储你的输入内容，让你使用更安心</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <a href="/">
                <Button size="lg" className="h-14 px-8 text-lg rounded-3xl shadow-xl shadow-[#91A398]/20 hover:scale-105 transition-transform bg-[#91A398] hover:bg-[#91A398]/90 text-white border-none">
                  即刻调配
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <p className="text-sm text-[#4A4A4A]">
                体验阿一的 智能小样，开启你的第一次 智能成功
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#4A4A4A] text-[#F0F0E8] py-12 border-t border-[#666666]">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">阿一的小样实验室</h3>
            <p className="text-[#E8E8E0]">找阿一，拿你的第一次 智能成功</p>
          </div>
          <div className="flex justify-center gap-8 text-sm mb-8">
            <a href="/" className="hover:text-white transition-colors">首页</a>
            <a href="/about" className="hover:text-white transition-colors">关于阿一</a>
            <a href="/terms" className="hover:text-white transition-colors">使用契约</a>
            <a href="/privacy" className="hover:text-white transition-colors">树洞规则</a>
          </div>
          <p className="text-xs text-[#999999]">
            © 2026 阿一的小样实验室. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
