import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-[#F0F0E8]">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="text-3xl font-bold text-[#4A4A4A] text-center mb-12">
          阿一帮你算笔账：你的时间值多少钱？
        </h2>
        
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row">
          {/* 左边：残酷现实 */}
          <div className="flex-1 p-8 bg-gray-50 border-r border-gray-100">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">自己死磕</div>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">写周报/改格式</span>
                <span className="font-mono text-red-400">- 45 分钟</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">想高情商回复</span>
                <span className="font-mono text-red-400">- 20 分钟</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">被情绪内耗</span>
                <span className="font-mono text-red-400">- 2 小时</span>
              </div>
              <div className="pt-6 border-t border-gray-200">
                <div className="text-gray-500 text-sm">共计浪费生命</div>
                <div className="text-3xl font-bold text-gray-800 mt-1">3 小时+</div>
              </div>
            </div>
          </div>

          {/* 右边：阿一小样 */}
          <div className="flex-1 p-8 bg-[#91A398]/10 relative">
            <div className="absolute top-0 right-0 bg-[#91A398] text-white text-xs font-bold px-4 py-2 rounded-bl-2xl">
              推荐方案
            </div>
            <div className="text-sm font-bold text-[#91A398] uppercase tracking-widest mb-4">找阿一搞定</div>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[#4A4A4A] font-medium">输入碎碎念</span>
                <span className="font-mono text-[#91A398]">+ 30 秒</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#4A4A4A] font-medium">阿一调配</span>
                <span className="font-mono text-[#91A398]">+ 5 秒</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#4A4A4A] font-medium">复制粘贴</span>
                <span className="font-mono text-[#91A398]">+ 1 秒</span>
              </div>
              <div className="pt-6 border-t border-[#91A398]/20">
                <div className="text-[#5c6b60] text-sm">仅需投入</div>
                <div className="text-4xl font-bold text-[#91A398] mt-1">36 秒</div>
                <div className="text-xs text-[#91A398]/80 mt-2">省下时间去喝杯咖啡吧 ☕️</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

