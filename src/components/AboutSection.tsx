import abModeImg from "@/assets/ab-mode.jpg";

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-3 opacity-10 blur-xl transform scale-105" />
            <img 
              src={abModeImg} 
              alt="A/B 融合模式" 
              className="relative rounded-2xl shadow-2xl border border-white/50 w-full object-cover hover:rotate-1 transition-transform duration-500"
            />
          </div>

          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-6">
              我们不只是个工具
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
              用 A 版降门槛<br/>
              用 B 版建壁垒
            </h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
              <p>
                如果你只是想偶尔应急，<span className="font-bold text-slate-900">A 版</span> 是你最好的朋友。没有复杂的配置，没有听不懂的术语，只有确定的结果。
              </p>
              <p>
                但如果你发现自己越来越离不开 AI，<span className="font-bold text-slate-900">B 版</span> 将成为你的第二大脑。它会记住你的习惯，像一个跟了你十年的老秘书，越用越顺手。
              </p>
              <p>
                我们相信：<span className="italic text-slate-800">"如果一个人第一次用 AI 就成功，他这一辈子都会用下去。"</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
