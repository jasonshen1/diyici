import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface TermsProps {
  targetSection?: string;
}

export default function Terms({ targetSection }: TermsProps) {
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
            <a href="/about" className="text-sm font-medium text-[#4A4A4A] hover:text-[#91A398] transition-colors">
              关于阿一
            </a>
            <a href="/terms" className="text-sm font-medium text-[#91A398] hover:text-[#91A398] transition-colors">
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
          <section className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-[#4A4A4A]">
              首胜实验室的使用守则
            </h1>
            <p className="text-xl text-[#4A4A4A] max-w-3xl mx-auto leading-relaxed">
              欢迎来到你的"新手村"。
            </p>
          </section>

          {/* Contract Content */}
          <section className="max-w-3xl mx-auto mb-16">
            <div className="bg-white rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-[#91A398]">首胜保证</h2>
              <p className="text-lg leading-relaxed mb-6">
                阿一店长调配的每一份配方（小样）都旨在为你提供高质量的即时交付。但请记住，智能是辅助，最后的"质检员"永远是你自己。
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-[#91A398]">拒绝杂音</h2>
              <p className="text-lg leading-relaxed mb-6">
                本站禁止调配任何违法、违背道德或带有攻击性的素材。我们只欢迎对效率和创意有追求的"首胜体验官"。
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] p-8">
              <h2 className="text-2xl font-bold mb-6 text-[#91A398]">成长的阶梯</h2>
              <p className="text-lg leading-relaxed mb-6">
                你可以自由使用在这里生成的任何成品。我们唯一的希望是，这次成功不仅帮你省下了时间，更让你从此不再畏惧智能。
              </p>
            </div>
          </section>

          {/* Additional Notes */}
          <section className="max-w-3xl mx-auto mb-16">
            <div className="bg-[#FFF9C4] rounded-3xl shadow-sm border border-yellow-200 p-8">
              <h3 className="text-xl font-bold mb-4 text-[#4A4A4A]">
                为了守护每一份"第一次成功"
              </h3>
              <p className="text-lg leading-relaxed mb-4">
                这份守则不是冷冰冰的规则，而是我们与你的约定。在这里，没有失败的尝试，只有一步步向上的成长。
              </p>
              <p className="text-lg leading-relaxed">
                阿一店长会一直在实验室里，为你调配出最适合的"首胜"配方。
              </p>
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
