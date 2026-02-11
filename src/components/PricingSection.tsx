import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Smile, CheckCircle2, Frown } from "lucide-react";

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-[#F0F0E8] border-t border-[#91A398]/20">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4A4A4A] mb-6">
            阿一帮你算笔账：你的时间值多少钱？
          </h2>
          <p className="text-lg text-[#4A4A4A] mb-8">
            同样的任务，不同的方式，差距竟然这么大！
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* ROI 价值对比表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* 人工硬磨 */}
            <div className="bg-[#F8F8F8] rounded-3xl p-8 shadow-sm border border-[#E8E8E8] relative">
              <div className="absolute top-4 right-4 bg-[#E8E8E8] text-[#6B6B6B] text-xs font-bold px-3 py-1 rounded-full">
                传统方式
              </div>
              <h3 className="text-2xl font-bold text-[#6B6B6B] mb-8">
                人工硬磨
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8E8E8] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#6B6B6B]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-[#6B6B6B] mb-2">耗时</h4>
                    <p className="text-[#6B6B6B]">60-120 分钟</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8E8E8] flex items-center justify-center flex-shrink-0">
                    <Frown className="w-5 h-5 text-[#6B6B6B]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-[#6B6B6B] mb-2">情绪</h4>
                    <p className="text-[#6B6B6B]">焦虑/甚至想辞职</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8E8E8] flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#6B6B6B]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-[#6B6B6B] mb-2">结果</h4>
                    <p className="text-[#6B6B6B]">这就去改。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 阿一小样 */}
            <div className="bg-white rounded-3xl p-8 shadow-md border border-[#91A398]/30 relative">
              <div className="absolute top-4 right-4 bg-[#91A398] text-white text-xs font-bold px-3 py-1 rounded-full">
                省下 98% 生命
              </div>
              <h3 className="text-2xl font-bold text-[#91A398] mb-8">
                阿一小样
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#91A398]/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#91A398]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-[#4A4A4A] mb-2">耗时</h4>
                    <p className="text-[#4A4A4A] font-semibold">180 秒</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#91A398]/20 flex items-center justify-center flex-shrink-0">
                    <Smile className="w-5 h-5 text-[#91A398]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-[#4A4A4A] mb-2">情绪</h4>
                    <p className="text-[#4A4A4A] font-semibold">刚好赶上奶茶</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#91A398]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#91A398]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-[#4A4A4A] mb-2">结果</h4>
                    <p className="text-[#4A4A4A] font-semibold">成了。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 行动按钮 */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg rounded-3xl shadow-xl shadow-[#91A398]/20 hover:scale-105 transition-transform bg-[#91A398] hover:bg-[#91A398]/90 text-white border-none"
            >
              我不磨了，现在就拿捏
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-[#6B6B6B] mt-4">
              选择阿一，让你的时间更有价值
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

