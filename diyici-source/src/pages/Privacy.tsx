import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Lock, EyeOff, CheckCircle2 } from "lucide-react";

interface PrivacyProps {
  targetSection?: string;
}

export default function Privacy({ targetSection }: PrivacyProps) {
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
            <a href="/terms" className="text-sm font-medium text-[#4A4A4A] hover:text-[#91A398] transition-colors">
              使用契约
            </a>
            <a href="/privacy" className="text-sm font-medium text-[#91A398] hover:text-[#91A398] transition-colors">
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
              阿一的树洞密封协议
            </h1>
            <p className="text-xl text-[#4A4A4A] max-w-3xl mx-auto leading-relaxed mb-8">
              你的第一次尝试，无需任何人围观。
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#91A398]/20 text-[#91A398] text-sm font-medium">
              <Shield className="w-4 h-4" />
              强化域名的安全感
            </div>
          </section>

          {/* Privacy Content */}
          <section className="max-w-3xl mx-auto mb-16">
            <div className="bg-white rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#91A398]/20 flex items-center justify-center">
                  <EyeOff className="w-5 h-5 text-[#91A398]" />
                </div>
                <h2 className="text-2xl font-bold text-[#4A4A4A]">即刻消磁</h2>
              </div>
              <p className="text-lg leading-relaxed mb-6">
                你在调配"成功"时输入的任何原始素材（如周报碎片、沟通私信），在成品生成后的瞬间即会被系统自动销毁。阿一不留存你的隐私。
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#91A398]/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#91A398]" />
                </div>
                <h2 className="text-2xl font-bold text-[#4A4A4A]">配方隔离</h2>
              </div>
              <p className="text-lg leading-relaxed mb-6">
                你的灵感因子不会被用于训练。你的成功路径，只属于你。
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#91A398]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#91A398]" />
                </div>
                <h2 className="text-2xl font-bold text-[#4A4A4A]">无痕保护</h2>
              </div>
              <p className="text-lg leading-relaxed mb-6">
                我们采用最高级别的加密标准，确保你的职场和社交隐私在这里像在实验室里一样安全、纯净。
              </p>
            </div>
          </section>

          {/* Security Commitment */}
          <section className="max-w-3xl mx-auto mb-16">
            <div className="bg-[#91A398]/10 rounded-3xl border border-[#91A398]/20 p-8">
              <h2 className="text-2xl font-bold mb-6 text-[#4A4A4A]">diyici.ai 的安全承诺</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#91A398] flex-shrink-0 mt-1" />
                  <p className="text-lg leading-relaxed">
                    我们采用行业领先的加密技术，保护你的数据传输过程
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#91A398] flex-shrink-0 mt-1" />
                  <p className="text-lg leading-relaxed">
                    我们不会向任何第三方分享你的个人信息或输入内容
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#91A398] flex-shrink-0 mt-1" />
                  <p className="text-lg leading-relaxed">
                    我们定期进行安全审计，确保系统的安全性和可靠性
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#91A398] flex-shrink-0 mt-1" />
                  <p className="text-lg leading-relaxed">
                    如果你对隐私保护有任何疑问，随时可以联系阿一
                  </p>
                </li>
              </ul>
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
                在阿一的树洞里，你的秘密永远安全
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
